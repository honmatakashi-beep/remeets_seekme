import React, { useEffect, useRef, useState } from 'react';
import bottleCursorUrl from '../assets/images/hero_watercolor_bottle_cursor.svg';

interface WaterRippleHeroCanvasProps {
  imageSrc: string;
  lines?: string[];
  mainTitle?: string;
  caption?: string;
  className?: string;
  positionY?: number;
  /** ボトルメール・ポインタのON/OFF（falseにすると1秒で元の通常ポインタに戻せます） */
  enableBottleCursor?: boolean;
}

export const WaterRippleHeroCanvas: React.FC<WaterRippleHeroCanvasProps> = ({
  imageSrc,
  lines = [
    'あの日言えなかった想いを',
    'あの人へ',
    '再会のボトルメール'
  ],
  mainTitle = 'ReMEETs',
  caption = '静寂の水平線に漂う、届くべき言の葉',
  className = '',
  positionY = 0.92,
  enableBottleCursor = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);
  const dispTextRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const dispBgRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const filterId = useRef(`water-ripple-filter-${Math.random().toString(36).substr(2, 9)}`).current;
  const textFilterId = useRef(`water-text-filter-${Math.random().toString(36).substr(2, 9)}`).current;

  const [rippleActive, setRippleActive] = useState(false);

  useEffect(() => {
    let animId: number;
    let time = 0;
    let rippleStrength = 0;
    let targetStrength = 0;
    let baseFreqX = 0.012;
    let baseFreqY = 0.024;
    let isVisible = true;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      if (isVisible) {
        // ゆっくりと優雅に流れる水面のゆらぎ（テンポを穏やかに調整）
        time += 0.006;
        
        // マウスやタッチによる波紋の滑らかな減衰
        rippleStrength += (targetStrength - rippleStrength) * 0.08;
        targetStrength *= 0.96; // ゆっくり減衰

        if (targetStrength < 0.01) {
          targetStrength = 0;
        }

        const currentFreqX = baseFreqX + Math.sin(time * 0.7) * 0.003 + rippleStrength * 0.015;
        const currentFreqY = baseFreqY + Math.cos(time * 0.5) * 0.005 + rippleStrength * 0.02;

        if (turbRef.current) {
          turbRef.current.setAttribute('baseFrequency', `${currentFreqX.toFixed(5)} ${currentFreqY.toFixed(5)}`);
          turbRef.current.setAttribute('seed', `${Math.floor((time * 2) % 100)}`);
        }

        // 背景画像用のディスプレイスメント強度
        if (dispBgRef.current) {
          const bgScale = 6 + rippleStrength * 22;
          dispBgRef.current.setAttribute('scale', bgScale.toFixed(2));
        }

        // 文字用のディスプレイスメント強度（文字が崩れず、美しく澄んで波打つ最適値）
        if (dispTextRef.current) {
          const textScale = 3.5 + rippleStrength * 14;
          dispTextRef.current.setAttribute('scale', textScale.toFixed(2));
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // インタラクティブ波紋トリガー
    let lastX = -1;
    let lastY = -1;
    let throttleTimer = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - throttleTimer < 16) return; // 60fps スロットル
      throttleTimer = now;

      const dx = lastX >= 0 ? e.clientX - lastX : 0;
      const dy = lastY >= 0 ? e.clientY - lastY : 0;
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 30);

      targetStrength = Math.min(targetStrength + 0.15 + speed * 0.03, 1.8);
      setRippleActive(true);

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handlePointerDown = () => {
      targetStrength = 2.2; // タップで力強く美しい波紋
      setRippleActive(true);
    };

    const handlePointerLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    // 定期的な自然の雫（約10秒に1回、穏やかな波紋）
    const idleInterval = setInterval(() => {
      if (targetStrength < 0.1) {
        targetStrength = 0.75;
      }
    }, 9000);

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      clearInterval(idleInterval);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-sky-300/80 select-none group aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[340px] sm:min-h-[400px] md:min-h-[440px] ${enableBottleCursor ? 'cursor-bottle-mail' : 'cursor-pointer'} ${className}`}
      style={{ 
        touchAction: 'none',
        cursor: enableBottleCursor 
          ? `url('${bottleCursorUrl}') 22 3, pointer` 
          : 'pointer'
      }}
    >
      {/* 🌊 SVG ハードウェアアクセラレーション水紋フィルター（CPU負荷0%・Retina完全高解像度） */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.012 0.024"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              ref={dispBgRef}
              in="SourceGraphic"
              in2="noise"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id={textFilterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.010 0.020"
              numOctaves="2"
              result="textNoise"
            >
              <animate
                attributeName="baseFrequency"
                dur="16s"
                values="0.009 0.018; 0.014 0.026; 0.009 0.018"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              ref={dispTextRef}
              in="SourceGraphic"
              in2="textNoise"
              scale="3.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 1. 背景イラスト（下部ボトルが切れない positionY = 0.92 構図 ＋ GPU水面ゆらぎフィルター） */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ filter: `url(#${filterId})` }}
      >
        <img
          src={imageSrc}
          alt="海とボトルメール"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          style={{
            objectPosition: `center ${positionY * 100}%`
          }}
        />
      </div>

      {/* 2. 繊細な水面オーバーレイグラデーション（白ボケなし・海とボトルが鮮明に透き通るクリアレイヤー） */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-transparent to-sky-950/50 pointer-events-none" />

      {/* 3. 水面上のコンテンツ（タイトル ＋ 虹色想い出文字 ＋ キャプション） */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 md:p-8 text-center pointer-events-none select-none z-10">
        
        {/* 上部タイトル */}
        <div className="space-y-0.5 pt-1">
          <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3B627F] tracking-wider drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)] block">
            {mainTitle}
          </span>
        </div>

        {/* 中央：水面に浮かぶ虹色の想い出文字（GPU水面ゆらぎ ＋ 永遠に流れるオーロラグラデーション） */}
        <div 
          className="space-y-1 sm:space-y-2 my-auto py-2"
          style={{ filter: `url(#${textFilterId})` }}
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="text-center font-serif font-semibold tracking-wider text-[20px] min-[360px]:text-[22px] min-[400px]:text-[25px] sm:text-[32px] md:text-[38px] lg:text-[44px] leading-[1.38]"
              style={{
                fontFamily: '"Shippori Mincho", "Noto Serif JP", "Kaisei Decol", "Yu Mincho", serif',
              }}
            >
              <span
                className="inline-block drop-shadow-[0_2px_8px_rgba(0,15,30,0.5)]"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #0284C7 0%, #2563EB 14%, #6366F1 28%, #8B5CF6 42%, #EC4899 57%, #F97316 71%, #EAB308 85%, #0D9488 95%, #0284C7 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'waterAuroraFlow 16s linear infinite',
                  display: 'inline-block',
                }}
              >
                {line}
              </span>
            </div>
          ))}
        </div>

        {/* 下部キャプション */}
        {caption && (
          <div className="pb-1">
            <span className="text-[11px] sm:text-xs text-white/95 font-serif tracking-widest drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]">
              {caption}
            </span>
          </div>
        )}
      </div>

      {/* インタラクティブ誘導バッジ */}
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/30 text-white/90 text-[10px] font-mono tracking-wider opacity-75 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>TOUCH / MOVE FOR WATER RIPPLE</span>
      </div>

      {/* GPUハードウェアアニメーション用スタイル */}
      <style>{`
        @keyframes waterAuroraFlow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </div>
  );
};
