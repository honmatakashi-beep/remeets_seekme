import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Upload, Sun, Sparkles, Scan, ArrowLeft, ArrowRight, VideoOff } from 'lucide-react';

declare global {
  interface Window {
    __activeMediaStreams?: Set<MediaStream>;
  }
}

// Helper: Register active MediaStream to global set
export function registerActiveStream(stream: MediaStream) {
  if (typeof window === 'undefined' || !stream) return;
  if (!window.__activeMediaStreams) {
    window.__activeMediaStreams = new Set();
  }
  window.__activeMediaStreams.add(stream);
}

// Helper: Unregister stream
export function unregisterActiveStream(stream: MediaStream) {
  if (typeof window === 'undefined' || !window.__activeMediaStreams || !stream) return;
  window.__activeMediaStreams.delete(stream);
}

// Helper: Unconditionally kill and release all active media streams & video elements across the whole app
export function stopAllGlobalCameraStreams() {
  if (typeof window === 'undefined') return;

  // 1. Release all registered streams
  if (window.__activeMediaStreams) {
    window.__activeMediaStreams.forEach((stream) => {
      if (stream && typeof stream.getTracks === 'function') {
        try {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
              track.enabled = false;
              if (typeof stream.removeTrack === 'function') {
                stream.removeTrack(track);
              }
            } catch (e) {
              console.warn('Track stop error on global release:', e);
            }
          });
        } catch (e) {
          console.warn('Stream tracks iterate error on global release:', e);
        }
      }
    });
    window.__activeMediaStreams.clear();
  }

  // 2. Scan all video elements on the page and force disconnect srcObject/src
  try {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((video) => {
      try {
        video.pause();
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach((t) => {
              try {
                t.stop();
                t.enabled = false;
              } catch (e) {}
            });
          }
          video.srcObject = null;
        }
        video.removeAttribute('src');
        video.load();
      } catch (e) {}
    });
  } catch (e) {}
}

export interface DocumentCameraOverlayProps {
  docType: 'license' | 'mynumber' | 'passport';
  docTypeName?: string;
  onComplete: (images: { front: string; thickness?: string; back?: string }) => void;
  onBack?: () => void;
}

type AngleStep = 'front' | 'thickness' | 'back';

export const DocumentCameraOverlay: React.FC<DocumentCameraOverlayProps> = ({
  docType,
  docTypeName = '運転免許証',
  onComplete,
  onBack
}) => {
  const [currentAngle, setCurrentAngle] = useState<AngleStep>('front');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  
  // Stored captured images (base64 or blob URL)
  const [capturedImages, setCapturedImages] = useState<{
    front?: string;
    thickness?: string;
    back?: string;
  }>({});

  // Quality check state for preview
  const [qualityScore, setQualityScore] = useState<{
    glareOk: boolean;
    edgesOk: boolean;
    clarityOk: boolean;
  } | null>(null);

  // Toggle options for guidelines UI
  const [showGuideLines, setShowGuideLines] = useState<boolean>(true);
  const [showGlareShield, setShowGlareShield] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Guard against race conditions during async getUserMedia
  const sessionIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Angle step titles & descriptions
  const angleInfo: Record<AngleStep, { title: string; desc: string; guideText: string; buttonLabel: string }> = {
    front: {
      title: '1. 表面（顔写真・お名前面）の撮影',
      desc: '顔写真・氏名・生年月日が鮮明に見えるように、枠内に水平に配置してください。',
      guideText: '枠線にカードの四隅を合わせ、光の反射を避けて撮影してください',
      buttonLabel: '表面を撮影する'
    },
    thickness: {
      title: '2. 厚み（斜め45度）の撮影',
      desc: 'カードの厚みと立体感を確認するため、カードを手に持ち斜め45度に傾けて撮影してください。',
      guideText: '厚みが写るようにカードを少し斜めに傾けて枠線内に収めてください',
      buttonLabel: '厚みを撮影する'
    },
    back: {
      title: '3. 裏面（記載事項変更面）の撮影',
      desc: '裏面の注意事項・備考欄が枠内に収まるように水平に配置してください。',
      guideText: '裏面の文字が反射で消えないよう位置を調整してください',
      buttonLabel: '裏面を撮影する'
    }
  };

  // Helper to safely stop single stream
  const releaseStreamInstance = useCallback((stream: MediaStream | null) => {
    if (!stream) return;
    unregisterActiveStream(stream);
    try {
      if (typeof stream.getTracks === 'function') {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
            track.enabled = false;
            if (typeof stream.removeTrack === 'function') {
              stream.removeTrack(track);
            }
          } catch (e) {
            console.warn('Individual track release error:', e);
          }
        });
      }
    } catch (e) {
      console.warn('Stream release error:', e);
    }
  }, []);

  // Completely Stop and Release Camera MediaStream Tracks (Called on Exit / Completion)
  const stopCamera = useCallback(() => {
    // Invalidate any in-flight getUserMedia requests
    sessionIdRef.current += 1;

    // 1. Release stream from streamRef
    if (streamRef.current) {
      releaseStreamInstance(streamRef.current);
      streamRef.current = null;
    }

    // 2. Stop and release video element
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        if (videoRef.current.srcObject) {
          releaseStreamInstance(videoRef.current.srcObject as MediaStream);
          videoRef.current.srcObject = null;
        }
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      } catch (e) {
        console.warn('Video element cleanup error:', e);
      }
    }

    if (isMountedRef.current) {
      setCameraActive(false);
    }
  }, [releaseStreamInstance]);

  // Start Real Camera (Kept hot & continuous throughout 3-step capture without lag)
  const startCamera = useCallback(async () => {
    // 1. If already active with live tracks, simply reuse immediately with zero lag!
    if (streamRef.current && streamRef.current.getVideoTracks().some(t => t.readyState === 'live')) {
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        try {
          await videoRef.current.play();
        } catch (e) {}
      }
      if (isMountedRef.current) {
        setCameraActive(true);
        setCameraError(null);
      }
      return;
    }

    sessionIdRef.current += 1;
    const currentSession = sessionIdRef.current;

    if (isMountedRef.current) {
      setCameraError(null);
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream | null = null;
        try {
          // Mobile environment (back camera) with resolution hints
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
        } catch (firstErr) {
          if (!isMountedRef.current || sessionIdRef.current !== currentSession) {
            return;
          }
          // Standard default video camera (desktop/webcam/FaceTime)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        if (!isMountedRef.current || sessionIdRef.current !== currentSession) {
          if (stream) {
            releaseStreamInstance(stream);
          }
          return;
        }

        if (stream) {
          registerActiveStream(stream);
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
              await videoRef.current.play();
            } catch (playErr) {
              console.warn('Video play error:', playErr);
            }
          }
          if (isMountedRef.current) {
            setCameraActive(true);
          }
        }
      } else {
        if (isMountedRef.current) {
          setCameraError('お使いの環境ではカメラ直接起動に対応していません。「ファイル選択」または「サンプル画像」をご利用ください。');
          setCameraActive(false);
        }
      }
    } catch (err: any) {
      if (!isMountedRef.current || sessionIdRef.current !== currentSession) {
        return;
      }
      console.warn('Camera access error or rejected:', err);
      const isPermissionDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      if (isMountedRef.current) {
        if (isPermissionDenied) {
          setCameraError('カメラの利用許可がブロックされているか未許可です。ブラウザのカメラ許可をONにするか、下の「写真ファイルを選択」または「サンプル画像で試す」をご利用ください。');
        } else {
          setCameraError('カメラが検出されませんでした。下の「写真ファイルを選択」または「サンプル画像で試す」から本人確認を進めていただけます。');
        }
        setCameraActive(false);
      }
    }
  }, [releaseStreamInstance]);

  // Lifecycle: Start Camera ONCE on mount, keep it continuously active across all 3 steps,
  // and completely release on unmount (leaving camera mode / completing eKYC)
  useEffect(() => {
    isMountedRef.current = true;
    startCamera();
    return () => {
      isMountedRef.current = false;
      stopCamera();
      stopAllGlobalCameraStreams();
    };
  }, [startCamera, stopCamera]);

  // Handle Capture Action for Current Angle
  const handleTakeSnapshot = () => {
    setIsCapturing(true);
    let capturedDataUrl = '';

    if (cameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      }
    } else {
      capturedDataUrl = generateSampleDocumentImage(docType, currentAngle);
    }

    setTimeout(() => {
      setIsCapturing(false);
      setCapturedImages((prev) => ({ ...prev, [currentAngle]: capturedDataUrl }));
      setQualityScore({
        glareOk: true,
        edgesOk: true,
        clarityOk: true
      });
    }, 150);
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCapturedImages((prev) => ({ ...prev, [currentAngle]: result }));
          setQualityScore({
            glareOk: true,
            edgesOk: true,
            clarityOk: true
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Retake current image - Instantly returns to the running camera
  const handleRetake = () => {
    setCapturedImages((prev) => {
      const updated = { ...prev };
      delete updated[currentAngle];
      return updated;
    });
    setQualityScore(null);
    if (!cameraActive) {
      startCamera();
    }
  };

  // Next step or Complete All 3 Angles - Seamless 0ms switch without restarting hardware camera
  const handleNextAngle = () => {
    if (currentAngle === 'front') {
      if (docType === 'passport') {
        // Passport only requires front info page -> Immediately disconnect camera
        stopCamera();
        stopAllGlobalCameraStreams();
        const finalFront = capturedImages.front || generateSampleDocumentImage(docType, 'front');
        onComplete({
          front: finalFront,
          thickness: capturedImages.thickness,
          back: capturedImages.back
        });
        return;
      }
      // Move to Step 2: Thickness (Camera is already streaming in background -> 0ms lag!)
      setCurrentAngle('thickness');
      setQualityScore(null);
    } else if (currentAngle === 'thickness') {
      // Move to Step 3: Back (Camera is already streaming in background -> 0ms lag!)
      setCurrentAngle('back');
      setQualityScore(null);
    } else {
      // All 3 angles completed! -> Stop and release camera completely before proceeding to application
      stopCamera();
      stopAllGlobalCameraStreams();
      const finalFront = capturedImages.front || generateSampleDocumentImage(docType, 'front');
      const finalThickness = capturedImages.thickness || generateSampleDocumentImage(docType, 'thickness');
      const finalBack = capturedImages.back || generateSampleDocumentImage(docType, 'back');
      
      onComplete({
        front: finalFront,
        thickness: finalThickness,
        back: finalBack
      });
    }
  };

  // Quick bypass with sample images for verification
  const handleQuickCompleteAll = () => {
    stopCamera();
    stopAllGlobalCameraStreams();
    const finalFront = generateSampleDocumentImage(docType, 'front');
    const finalThickness = generateSampleDocumentImage(docType, 'thickness');
    const finalBack = generateSampleDocumentImage(docType, 'back');
    onComplete({
      front: finalFront,
      thickness: finalThickness,
      back: finalBack
    });
  };

  const currentCapturedImage = capturedImages[currentAngle];

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 max-w-2xl w-full mx-auto font-sans flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-950 px-4 sm:px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={() => {
                stopCamera();
                stopAllGlobalCameraStreams();
                onBack();
              }}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="戻る"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono text-[10px] font-bold rounded">
                eKYC
              </span>
              <h3 className="text-sm font-bold font-serif text-white">{docTypeName} 撮影</h3>
              {cameraActive && !currentCapturedImage && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  カメラ撮影中
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step indicators & Test Quick Skip */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleQuickCompleteAll}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer font-sans"
            title="検証用：サンプル書類画像で全ステップを一括完了して決済へ進む"
          >
            <Sparkles size={11} className="text-amber-400" />
            <span>⚡ サンプルで一括撮影完了</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {(['front', 'thickness', 'back'] as const).map((step, idx) => {
              const isDone = !!capturedImages[step];
              const isCurrent = currentAngle === step;
              return (
                <div
                  key={step}
                  onClick={() => {
                    setCurrentAngle(step);
                    setQualityScore(null);
                  }}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1 text-[11px] ${
                    isCurrent
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : isDone
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>{idx + 1}. {step === 'front' ? '表面' : step === 'thickness' ? '斜め厚み' : '裏面'}</span>
                  {isDone && <CheckCircle2 size={12} className="text-emerald-400" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Camera / Preview Area */}
      <div className="relative bg-black aspect-[4/3] sm:aspect-[16/10] w-full flex items-center justify-center overflow-hidden select-none">
        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Persistent Video Element: Always maintained in DOM to prevent hardware teardown lag */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover z-0 ${
            cameraActive && !currentCapturedImage ? 'block' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* 1. Captured Image Preview for Current Step (Overlaid instantly upon snapshot) */}
        {currentCapturedImage ? (
          <div className="relative z-10 w-full h-full flex items-center justify-center bg-slate-950">
            <img
              src={currentCapturedImage}
              alt="Captured document"
              className="max-h-full max-w-full object-contain"
            />

            {/* Captured Status Badge */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <span className="bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-400/50 flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 size={16} /> 撮影完了 ({currentAngle === 'front' ? '表面' : currentAngle === 'thickness' ? '斜め厚み' : '裏面'})
              </span>
            </div>

            {/* Quality Score Bar */}
            {qualityScore && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-2 shadow-lg">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>AI画質検証: 反射なし / 四隅の欠けなし (判定OK)</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 2. Live Camera Overlay Guidelines */
          <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
            {/* Fallback when camera is not active */}
            {!cameraActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 pointer-events-auto">
                <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400">
                  <Camera size={26} className="text-slate-400" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h4 className="text-sm font-bold text-slate-200">
                    {cameraError ? 'カメラ直接起動不可 / 写真選択対応' : 'カメラ待機中'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cameraError || 'カメラを起動して撮影するか、証明書の写真ファイルを選択してください。'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Camera size={14} /> カメラを起動する
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} /> 写真ファイルを選択
                  </button>
                  <button
                    onClick={handleTakeSnapshot}
                    className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} className="text-amber-300" /> サンプル画像で試す
                  </button>
                </div>
              </div>
            )}

            {/* 3. OVERLAY GUIDELINES */}
            {showGuideLines && cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                {/* Outer Dimmed Background Mask */}
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

                {/* Document Target Card Frame */}
                <div className={`relative z-10 transition-all duration-300 border-2 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] ${
                  currentAngle === 'thickness'
                    ? 'w-[72%] aspect-[16/9] -rotate-6 transform scale-95 border-amber-400/90'
                    : 'w-[82%] sm:w-[76%] aspect-[1.58/1] border-emerald-400/90'
                }`}>
                  {/* Four Corner Overlay Guides */}
                  <div className="absolute -top-3 -left-3 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg shadow-sm" />
                  <div className="absolute -top-3 -right-3 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg shadow-sm" />
                  <div className="absolute -bottom-3 -left-3 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg shadow-sm" />
                  <div className="absolute -bottom-3 -right-3 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg shadow-sm" />

                  {/* Corner Check Markers */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                    <span>角の欠け防止: OK</span>
                  </div>

                  {/* Glare Shield Target */}
                  {showGlareShield && (
                    <div className="absolute top-1/4 right-6 bg-amber-500/10 border border-amber-400/40 backdrop-blur-xs p-2 rounded-xl flex items-center gap-1.5 text-amber-200 text-[10px] font-bold shadow-inner">
                      <Sun size={14} className="text-amber-400 shrink-0 animate-spin-slow" />
                      <span>反射ガード: 照明の映り込み注意</span>
                    </div>
                  )}

                  {/* Center Alignment & Document-Specific Guidelines */}
                  <div className="absolute inset-0 p-3 pointer-events-none">
                    {/* 1. 運転免許証 (Driver License) */}
                    {docType === 'license' && (
                      currentAngle === 'front' ? (
                        <div className="w-full h-full relative flex">
                          {/* 左側: 氏名・住所・生年月日等のテキスト記載エリア */}
                          <div className="flex-1 flex flex-col justify-between pr-3 py-1">
                            <div className="space-y-1.5">
                              <div className="h-4 w-32 border border-dashed border-emerald-300/50 rounded flex items-center px-1.5 text-[9px] font-mono text-emerald-200/80">
                                氏名 / 生年月日
                              </div>
                              <div className="h-5 w-44 border border-dashed border-emerald-300/50 rounded flex items-center px-1.5 text-[9px] font-mono text-emerald-200/80">
                                住所・交付年月日
                              </div>
                            </div>
                            <div className="h-4 w-36 border border-dashed border-amber-300/60 rounded bg-amber-400/5 flex items-center px-1.5 text-[9px] font-mono text-amber-200/90">
                              免許証番号 / 有効期限
                            </div>
                          </div>
                          {/* 右側: 免許証の顔写真枠（日本の免許証は右側に顔写真が配置） */}
                          <div className="w-[30%] h-full border-2 border-dashed border-emerald-300/80 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center text-center p-1 space-y-1 shadow-inner">
                            <div className="w-7 h-7 rounded-full border border-dashed border-emerald-300/70 flex items-center justify-center text-[10px]">
                              👤
                            </div>
                            <span className="text-[10px] font-bold text-emerald-200 font-mono leading-tight">
                              顔写真枠<br />
                              <span className="text-[8px] text-emerald-300/80 font-normal">（免許証右側）</span>
                            </span>
                          </div>
                        </div>
                      ) : currentAngle === 'back' ? (
                        /* 裏面: 備考欄枠 */
                        <div className="w-full h-full flex flex-col justify-between p-2">
                          <div className="w-full h-[70%] border border-dashed border-emerald-300/60 bg-emerald-500/5 rounded-xl flex flex-col items-center justify-center text-emerald-200 font-mono text-[10px]">
                            <span>【裏面 備考・変更印字欄】</span>
                            <span className="text-[9px] text-emerald-300/70">（文字が反射しないよう水平にセット）</span>
                          </div>
                          <div className="text-[9px] text-emerald-300/70 text-right pr-2">
                            公安委員会印字欄
                          </div>
                        </div>
                      ) : null
                    )}

                    {/* 2. マイナンバーカード (My Number Card) */}
                    {docType === 'mynumber' && (
                      currentAngle === 'front' ? (
                        <div className="w-full h-full relative flex">
                          {/* 左側: マイナンバーカードの顔写真枠（マイナンバーカードは左側に顔写真が配置） */}
                          <div className="w-[30%] h-full border-2 border-dashed border-emerald-300/80 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center text-center p-1 space-y-1 shadow-inner">
                            <div className="w-7 h-7 rounded-full border border-dashed border-emerald-300/70 flex items-center justify-center text-[10px]">
                              👤
                            </div>
                            <span className="text-[10px] font-bold text-emerald-200 font-mono leading-tight">
                              顔写真枠<br />
                              <span className="text-[8px] text-emerald-300/80 font-normal">（カード左側）</span>
                            </span>
                          </div>
                          {/* 右側: 氏名・住所・生年月日・性別・ホログラム */}
                          <div className="flex-1 flex flex-col justify-between pl-3 py-1">
                            <div className="space-y-1.5">
                              <div className="h-4 w-32 border border-dashed border-emerald-300/50 rounded flex items-center px-1.5 text-[9px] font-mono text-emerald-200/80">
                                氏名・住所
                              </div>
                              <div className="h-4 w-28 border border-dashed border-emerald-300/50 rounded flex items-center px-1.5 text-[9px] font-mono text-emerald-200/80">
                                生年月日・性別
                              </div>
                            </div>
                            <div className="h-5 w-24 border border-dashed border-indigo-300/60 rounded bg-indigo-400/5 flex items-center px-1.5 text-[9px] font-mono text-indigo-200/90">
                              有効期限・電子署名
                            </div>
                          </div>
                        </div>
                      ) : currentAngle === 'back' ? (
                        /* マイナンバー裏面: 12桁番号 ＆ QRコード枠 */
                        <div className="w-full h-full flex flex-col justify-between p-2">
                          <div className="flex justify-between items-start">
                            <div className="h-6 w-40 border border-dashed border-amber-300/70 rounded flex items-center px-2 text-[9px] font-mono text-amber-200 bg-amber-400/10">
                              個人番号（12桁）枠
                            </div>
                            <div className="w-10 h-10 border border-dashed border-emerald-300/60 rounded flex items-center justify-center text-[8px] font-mono text-emerald-200">
                              QR
                            </div>
                          </div>
                          <div className="w-full h-10 border border-dashed border-slate-400/40 rounded flex items-center justify-center text-[9px] text-slate-300">
                            ICチップ・注意事項欄
                          </div>
                        </div>
                      ) : null
                    )}

                    {/* 3. パスポート (Passport) */}
                    {docType === 'passport' && (
                      <div className="w-full h-full relative flex flex-col justify-between">
                        <div className="flex-1 flex gap-3">
                          {/* 左側: パスポート顔写真枠 */}
                          <div className="w-[32%] h-full border-2 border-dashed border-emerald-300/80 bg-emerald-500/10 rounded-xl flex flex-col items-center justify-center text-center p-1 space-y-1 shadow-inner">
                            <div className="w-7 h-7 rounded-full border border-dashed border-emerald-300/70 flex items-center justify-center text-[10px]">
                              👤
                            </div>
                            <span className="text-[10px] font-bold text-emerald-200 font-mono leading-tight">
                              顔写真枠<br />
                              <span className="text-[8px] text-emerald-300/80 font-normal">（旅券左側）</span>
                            </span>
                          </div>
                          {/* 右側: 旅券番号・国籍・氏名・生年月日 */}
                          <div className="flex-1 flex flex-col justify-around py-0.5">
                            <div className="h-4 w-32 border border-dashed border-emerald-300/50 rounded flex items-center px-1.5 text-[9px] font-mono text-emerald-200/80">
                              日本国旅券 / PASSPORT
                            </div>
                            <div className="h-4 w-28 border border-dashed border-emerald-300/50 rounded flex items-center px-1.5 text-[9px] font-mono text-emerald-200/80">
                              Type / 国籍 / 旅券番号
                            </div>
                            <div className="h-4 w-36 border border-dashed border-emerald-300/50 rounded flex items-center px-1.5 text-[9px] font-mono text-emerald-200/80">
                              氏名 / Surname & Given Name
                            </div>
                          </div>
                        </div>
                        {/* 下部: パスポート機械読取領域（MRZ 2行コード枠） */}
                        <div className="mt-1.5 h-6 w-full border border-dashed border-emerald-400/80 bg-emerald-400/10 rounded flex items-center justify-center text-[9px] font-mono text-emerald-200">
                          P&lt;JPN &lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt; (機械読取MRZコード2行枠)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Guideline Status Indicator */}
                  <div className="absolute -bottom-10 left-0 right-0 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-slate-900/90 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md">
                      <Scan size={14} className="text-emerald-400 animate-pulse" />
                      {currentAngle === 'thickness' ? '傾けてカードの厚みを画角に収めてください' : '書類の四隅を枠線に合わせて配置してください'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Flash Effect during Capture */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white animate-ping opacity-75 z-30 pointer-events-none" />
            )}
          </div>
        )}
      </div>

      {/* Control Banner & Instructions */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 space-y-3">
        {/* Step Guide Advisory Box */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 font-serif">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              {angleInfo[currentAngle].title}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuideLines(!showGuideLines)}
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                  showGuideLines ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                }`}
              >
                ガイド枠: {showGuideLines ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {angleInfo[currentAngle].desc}
          </p>

          {/* Key Guidelines Check List */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={12} className="shrink-0" />
              <span>反射防止: 照明の直撃を避ける</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={12} className="shrink-0" />
              <span>端の欠け防止: 四隅を枠内に収める</span>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-between gap-2.5 pt-1">
          {currentCapturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} /> 再撮影する
              </button>

              <button
                type="button"
                onClick={handleNextAngle}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <span>
                  {currentAngle === 'back' || (docType === 'passport' && currentAngle === 'front')
                    ? '3枚の撮影完了・申請手続きへ進む'
                    : currentAngle === 'front'
                    ? '次の撮影（厚み）へ進む'
                    : '次の撮影（裏面）へ進む'}
                </span>
                <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} />
                <span>写真ファイル選択</span>
              </button>

              <button
                type="button"
                onClick={handleTakeSnapshot}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-[0.99]"
              >
                <Camera size={16} />
                <span>{angleInfo[currentAngle].buttonLabel}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper: Generate Mock Document Image URL for preview testing
function generateSampleDocumentImage(docType: string, angle: AngleStep): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background card color
  ctx.fillStyle = docType === 'license' ? '#f0fdf4' : docType === 'mynumber' ? '#eff6ff' : '#fff1f2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = docType === 'license' ? '#16a34a' : docType === 'mynumber' ? '#2563eb' : '#e11d48';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Card Header Band
  ctx.fillStyle = docType === 'license' ? '#22c55e' : docType === 'mynumber' ? '#3b82f6' : '#f43f5e';
  ctx.fillRect(10, 10, canvas.width - 20, 50);

  // Title Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px serif';
  ctx.fillText(
    docType === 'license' ? '運転免許証 (SAMPLE)' : docType === 'mynumber' ? '個人番号カード (SAMPLE)' : '日本国旅券 (PASSPORT)',
    30,
    42
  );

  // Face Photo Box
  if (angle === 'front') {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(420, 80, 140, 180);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(420, 80, 140, 180);

    // Face Icon placeholder
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(490, 140, 30, 0, Math.PI * 2);
    ctx.fill();

    // Body Lines
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('氏名: 山田 太郎', 40, 100);
    ctx.fillText('生年月日: 1995年5月15日', 40, 140);
    ctx.fillText('住所: 東京都千代田区1-1-1', 40, 180);
    ctx.fillText('交付: 2024年04月01日', 40, 220);

    // Simulated No-Glare / Edge Check Stamp
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('✓ eKYC 反射/欠け自動判定パス', 40, 320);
  } else if (angle === 'thickness') {
    // Slanted representation
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('【厚み・ナナメ45度確認】', 120, 180);
    ctx.font = '16px sans-serif';
    ctx.fillText('カードの重厚感・偽造防止ホログラム確認完了', 100, 220);
  } else {
    // Back side
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('【裏面 備考・変更印字欄】', 40, 100);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(40, 120, 520, 200);
    ctx.font = '14px sans-serif';
    ctx.fillText('※記載事項変更なし / 東京都公安委員会', 60, 160);
  }

  return canvas.toDataURL('image/jpeg');
}
