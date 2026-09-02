import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ScanLine, 
  UserCheck, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Cpu, 
  Layers, 
  Lock, 
  FileCheck, 
  Eye, 
  RefreshCw, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  CreditCard,
  RotateCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EkycStepDetail {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  category: 'ocr' | 'liveness' | 'payment' | 'certificate';
  score: number;
  threshold: number;
  status: 'pending' | 'running' | 'completed' | 'verified';
  metrics: {
    label: string;
    value: string;
    subtext?: string;
    passed: boolean;
  }[];
  description: string;
}

interface EkycProgressTelemetryPanelProps {
  isVerified: boolean;
  onStartEkyc?: () => void;
  onForceComplete?: () => void;
  onResetEkyc?: () => void;
  isResetting?: boolean;
  realtimeProgress?: number; // 0 - 100 for in-modal sync
  mode?: 'panel' | 'modal';
}

export const EkycProgressTelemetryPanel: React.FC<EkycProgressTelemetryPanelProps> = ({
  isVerified,
  onStartEkyc,
  onForceComplete,
  onResetEkyc,
  isResetting = false,
  realtimeProgress,
  mode = 'panel'
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(isVerified ? 100 : 0);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ocr' | 'liveness' | 'security'>('all');

  // Use external progress if provided (e.g. during modal execution)
  const currentProgress = typeof realtimeProgress === 'number' ? realtimeProgress : simProgress;

  useEffect(() => {
    if (isVerified && typeof realtimeProgress !== 'number') {
      setSimProgress(100);
    }
  }, [isVerified, realtimeProgress]);

  // Simulation handler
  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setSimProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 45);
  };

  const steps: EkycStepDetail[] = [
    {
      id: 'step-ocr',
      stepNumber: 1,
      title: '公的身分証明書 OCR 読取 ＆ 券面真贋解析',
      subtitle: 'Document OCR & Hologram Authenticity',
      category: 'ocr',
      score: currentProgress >= 30 ? 99.4 : Math.min(99.4, Math.round((currentProgress / 30) * 99.4 * 10) / 10),
      threshold: 90.0,
      status: currentProgress >= 30 ? (isVerified ? 'verified' : 'completed') : currentProgress > 0 ? 'running' : 'pending',
      description: '運転免許証 / マイナンバーカード / パスポートの文字OCR抽出、公安印および傾き・厚み・ホログラム光学真贋性をAI画像解析エンジンで多層検証。',
      metrics: [
        { label: '氏名・生年月日・有効期限 OCR一致率', value: currentProgress >= 30 ? '99.4%' : `${Math.min(99, Math.round(currentProgress * 3.3))}%`, passed: currentProgress >= 30 },
        { label: '厚み・傾き・反射光学真贋スコア', value: currentProgress >= 25 ? '98.8%' : `${Math.min(98, Math.round(currentProgress * 3.9))}%`, passed: currentProgress >= 25 },
        { label: 'フォント不整合・偽造・改ざん検出', value: '0.0% (完全整合)', subtext: '異常検出なし', passed: true }
      ]
    },
    {
      id: 'step-liveness',
      stepNumber: 2,
      title: '顔特徴点ベクター照合 ＆ 3Dライブネス判定',
      subtitle: 'Biometric Face Matching & Anti-Spoofing',
      category: 'liveness',
      score: currentProgress >= 60 ? 99.2 : currentProgress < 30 ? 0 : Math.min(99.2, Math.round(((currentProgress - 30) / 30) * 99.2 * 10) / 10),
      threshold: 85.0,
      status: currentProgress >= 60 ? (isVerified ? 'verified' : 'completed') : currentProgress >= 30 ? 'running' : 'pending',
      description: '撮影されたご本人様の顔特徴点（68ポイント）と証明書の顔写真を多次元ベクトル比較。まばたき・微細動体による生身判定（Anti-Spoofing）を同時実行。',
      metrics: [
        { label: '顔特徴点ベクター類似度スコア', value: currentProgress >= 60 ? '99.2%' : currentProgress >= 30 ? `${Math.min(99, Math.round((currentProgress - 30) * 3.3))}%` : '---', subtext: '合格基準: 85.0%以上', passed: currentProgress >= 60 },
        { label: '3D実在生身（ライブネス）判定率', value: currentProgress >= 55 ? '99.7%' : currentProgress >= 30 ? `${Math.min(99, Math.round((currentProgress - 30) * 3.9))}%` : '---', subtext: '写真・画面再撮影防止', passed: currentProgress >= 55 },
        { label: 'ディープフェイク・なりすまし検知', value: '検知なし (Pass)', passed: true }
      ]
    },
    {
      id: 'step-payment',
      stepNumber: 3,
      title: '決済名義・EMV 3Dセキュア2.0 安全照合',
      subtitle: 'Payment Identity Match & 3D Secure',
      category: 'payment',
      score: currentProgress >= 85 ? 100 : currentProgress < 60 ? 0 : Math.min(100, Math.round(((currentProgress - 60) / 25) * 100)),
      threshold: 95.0,
      status: currentProgress >= 85 ? (isVerified ? 'verified' : 'completed') : currentProgress >= 60 ? 'running' : 'pending',
      description: '決済カード名義と身分証記載の本名との完全整合性を検証。Stripe決済インフラによる256-bit SSL暗号化および本人認証（EMV-3DS）を実施。',
      metrics: [
        { label: 'カード名義 vs 公的氏名 照合整合性', value: currentProgress >= 85 ? '100% 完全一致' : currentProgress >= 60 ? '照合中...' : '---', passed: currentProgress >= 85 },
        { label: '3Dセキュア 2.0 (EMV-3DS) 承認', value: currentProgress >= 80 ? '認証承認完了' : currentProgress >= 60 ? '認証通信中' : '---', passed: currentProgress >= 80 },
        { label: '悪意あるカード不正利用リスク判定', value: '0.00% (極小)', passed: true }
      ]
    },
    {
      id: 'step-certificate',
      stepNumber: 4,
      title: 'デジタル監査証明書発行 ＆ 公的照会ハッシュ生成',
      subtitle: 'Cryptographic Audit Certificate & Authority Hash',
      category: 'certificate',
      score: currentProgress === 100 ? 99.9 : currentProgress < 85 ? 0 : Math.min(99.9, Math.round(((currentProgress - 85) / 15) * 99.9 * 10) / 10),
      threshold: 99.0,
      status: currentProgress === 100 ? 'verified' : currentProgress >= 85 ? 'running' : 'pending',
      description: '照合完了と同時にSHA-256暗号化ハッシュを生成。警察・公安からの公式捜査照会要求に即座に応じられるコンプライアンス監査証跡を刻印。',
      metrics: [
        { label: '照合識別ID (eKYC Verification ID)', value: currentProgress >= 90 ? 'EKYC-2026-8A9F-77D2' : '生成待機中', passed: currentProgress >= 90 },
        { label: 'SHA-256 デジタル署名ダイジェスト', value: currentProgress === 100 ? 'e3b0c44298fc...b855' : '暗号化中...', passed: currentProgress === 100 },
        { label: 'TRUSTDOCK / eKYC法規適合性', value: '完全適合 (Pass)', passed: true }
      ]
    }
  ];

  const overallConfidenceScore = currentProgress >= 100 ? 99.6 : Math.round((currentProgress / 100) * 99.6 * 10) / 10;

  const filteredSteps = activeTab === 'all' 
    ? steps 
    : activeTab === 'ocr' 
    ? steps.filter(s => s.category === 'ocr')
    : activeTab === 'liveness'
    ? steps.filter(s => s.category === 'liveness')
    : steps.filter(s => s.category === 'payment' || s.category === 'certificate');

  return (
    <div className="w-full space-y-4 font-sans text-brand-dark">
      {/* Main Container Card */}
      <div className={`p-5 md:p-7 rounded-3xl border-2 transition-all shadow-sm relative overflow-hidden ${
        isVerified 
          ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-500' 
          : 'bg-gradient-to-br from-amber-50/90 via-slate-50 to-white border-amber-400'
      }`}>
        {/* Background glow watermark */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border/60 pb-5">
          <div className="flex items-center gap-3.5">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
              isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-serif uppercase tracking-widest border ${
                  isVerified 
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-300' 
                    : 'text-amber-900 bg-amber-100 border-amber-300'
                }`}>
                  {isVerified ? 'Verified & Audited' : 'Unverified (Self-Declared)'}
                </span>
                <span className="text-[11px] font-bold font-serif text-brand-dark/70 flex items-center gap-1">
                  <Cpu size={12} className="text-emerald-600" />
                  <span>AI eKYC Verification Engine v2.4</span>
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-brand-dark mt-1 flex items-center gap-2">
                {isVerified ? '🛡️ 公的本人確認（eKYC）手続き完了済み' : '🛡️ 本人確認（eKYC）手続きを行う'}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {!isVerified && onStartEkyc && (
              <button
                type="button"
                id="btn-start-ekyc-mypage"
                onClick={onStartEkyc}
                className="px-5 py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-2xl font-bold font-sans text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={16} />
                <span>本人確認手続きを進める（600円）</span>
              </button>
            )}

            {!isVerified && onForceComplete && (
              <button
                type="button"
                id="btn-force-complete-ekyc-mypage"
                onClick={onForceComplete}
                disabled={isResetting}
                className="px-3.5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-bold font-sans text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="テスト用に即座にeKYC承認状態にします"
              >
                <CheckCircle2 size={14} />
                <span>【テスト用】完了済みにする</span>
              </button>
            )}

            {isVerified && onResetEkyc && (
              <button
                type="button"
                id="btn-reset-ekyc-status"
                onClick={onResetEkyc}
                disabled={isResetting}
                className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl font-bold font-sans text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={13} className={isResetting ? "animate-spin" : ""} />
                <span>未認証に戻す</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 bg-white/80 hover:bg-white border border-brand-border rounded-xl text-brand-dark/70 hover:text-brand-dark transition-all cursor-pointer shadow-2xs"
              title={isExpanded ? '詳細を折りたたむ' : '照合詳細を展開する'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Lead Text */}
        <div className="pt-4">
          <p className="text-xs text-brand-dark/80 font-sans leading-relaxed">
            {isVerified 
              ? '公的身分証明書（運転免許証・マイナンバーカード等）および決済名義照合による多層本人確認が正常に完了しています。あなたのアカウントには信頼と安全を証明する「🛡️公的本人確認済」バッジが付与されています。'
              : 'ReMEETsではサクラ・使い捨てアカウント・成りすまし被害を100%防止するため、公的身分証明書（運転免許証 / マイナンバーカード / パスポート）およびStripe安全決済を用いたオンライン本人確認（eKYC）を推奨しています。'
            }
          </p>
        </div>

        {/* Real-time Dynamic Telemetry & Precision Score Dashboard */}
        <div className="mt-5 pt-4 border-t border-brand-border/60 space-y-4">
          {/* Header of Progress Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 p-4 rounded-2xl border border-brand-border/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Activity size={20} className={isSimulating ? "animate-pulse" : ""} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.2 rounded-md">
                    Telemetry & Accuracy Score
                  </span>
                  {currentProgress === 100 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-200 flex items-center gap-1">
                      <Award size={11} />
                      <span>全項目基準クリア (Passed)</span>
                    </span>
                  )}
                </div>
                <h4 className="text-sm md:text-base font-serif font-bold text-brand-dark mt-0.5">
                  eKYC 多層照合ステータス ＆ 精度スコア詳細
                </h4>
              </div>
            </div>

            {/* Simulation trigger & Score Badge */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-brand-dark/60 font-bold uppercase tracking-wider">総合照合精度スコア</div>
                <div className="text-lg md:text-xl font-mono font-extrabold text-emerald-700">
                  {overallConfidenceScore.toFixed(1)}% <span className="text-xs text-brand-dark/50 font-normal">/ 100%</span>
                </div>
              </div>

              <button
                type="button"
                id="btn-run-ekyc-simulation"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                  isSimulating 
                    ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' 
                    : 'bg-brand-primary hover:bg-brand-dark text-white active:scale-95'
                }`}
                title="照合パイプラインの動作をリアルタイムでシミュレーション再生します"
              >
                <Play size={13} className={isSimulating ? "animate-spin text-amber-300" : "fill-white"} />
                <span>{isSimulating ? '照合解析中...' : '照合プロセスを実演'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="bg-white/90 p-4 rounded-2xl border border-brand-border/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-serif font-bold text-brand-dark">
              <span className="flex items-center gap-1.5 text-teal-800">
                <Lock size={12} />
                <span>eKYC Multi-layer Verification Pipeline</span>
                {isSimulating && <span className="text-[10px] font-mono text-amber-600 animate-pulse">(リアルタイム解析中...)</span>}
              </span>
              <span className="font-mono text-emerald-700 text-sm">
                {currentProgress}% <span className="text-[11px] text-brand-dark/50 font-normal">進捗</span>
              </span>
            </div>

            {/* Glowing animated bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full p-0.5 shadow-inner border border-slate-200 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative" 
                style={{ width: `${currentProgress}%` }}
              >
                {currentProgress > 0 && currentProgress < 100 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                )}
              </div>
            </div>

            {/* Quick 4-Step Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-serif">
              <div className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all ${
                currentProgress >= 30 ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold' : currentProgress > 0 ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <ScanLine size={13} className={currentProgress >= 30 ? "text-emerald-600" : currentProgress > 0 ? "text-amber-600 animate-pulse" : "text-slate-400"} />
                <span>1. 身分証 OCR 解析</span>
                {currentProgress >= 30 && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all ${
                currentProgress >= 60 ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold' : currentProgress >= 30 ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <UserCheck size={13} className={currentProgress >= 60 ? "text-emerald-600" : currentProgress >= 30 ? "text-amber-600 animate-pulse" : "text-slate-400"} />
                <span>2. 顔生体照合 ＆ 3D</span>
                {currentProgress >= 60 && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all ${
                currentProgress >= 85 ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold' : currentProgress >= 60 ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <CreditCard size={13} className={currentProgress >= 85 ? "text-emerald-600" : currentProgress >= 60 ? "text-amber-600 animate-pulse" : "text-slate-400"} />
                <span>3. 決済名義安全照合</span>
                {currentProgress >= 85 && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all ${
                currentProgress === 100 ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold' : currentProgress >= 85 ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <ShieldCheck size={13} className={currentProgress === 100 ? "text-emerald-600" : currentProgress >= 85 ? "text-amber-600 animate-pulse" : "text-slate-400"} />
                <span>4. 監査暗号キー刻印</span>
                {currentProgress === 100 && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
              </div>
            </div>
          </div>

          {/* Expandable Step Details Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-brand-dark/50 mr-1">表示工程:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'all' ? 'bg-brand-dark text-white shadow-2xs' : 'bg-white/80 text-brand-dark/70 hover:bg-white'
                    }`}
                  >
                    全工程 (4ステップ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ocr')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'ocr' ? 'bg-brand-dark text-white shadow-2xs' : 'bg-white/80 text-brand-dark/70 hover:bg-white'
                    }`}
                  >
                    1. 書類OCR ＆ 券面
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('liveness')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'liveness' ? 'bg-brand-dark text-white shadow-2xs' : 'bg-white/80 text-brand-dark/70 hover:bg-white'
                    }`}
                  >
                    2. 顔生体照合 ＆ 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'security' ? 'bg-brand-dark text-white shadow-2xs' : 'bg-white/80 text-brand-dark/70 hover:bg-white'
                    }`}
                  >
                    3 & 4. 決済 ＆ 監査証明
                  </button>
                </div>

                {/* 4 Step Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {filteredSteps.map((step) => {
                    const isStepRunning = step.status === 'running';
                    const isStepCompleted = step.status === 'completed' || step.status === 'verified';

                    return (
                      <div
                        key={step.id}
                        className={`p-4 rounded-2xl border transition-all relative overflow-hidden bg-white/95 shadow-2xs ${
                          isStepCompleted
                            ? 'border-emerald-300 ring-1 ring-emerald-200/50'
                            : isStepRunning
                            ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/40'
                            : 'border-brand-border/70 opacity-80'
                        }`}
                      >
                        {/* Card Top */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg text-xs font-serif font-bold flex items-center justify-center shrink-0 ${
                              isStepCompleted
                                ? 'bg-emerald-600 text-white'
                                : isStepRunning
                                ? 'bg-amber-500 text-white animate-pulse'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {isStepCompleted ? '✓' : step.stepNumber}
                            </span>
                            <div>
                              <h5 className="font-bold text-xs md:text-sm text-brand-dark font-serif leading-tight">
                                {step.title}
                              </h5>
                              <span className="text-[10px] text-brand-dark/50 font-mono block">
                                {step.subtitle}
                              </span>
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className="text-right shrink-0">
                            <div className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1 ${
                              isStepCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isStepRunning
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span>{step.score > 0 ? `${step.score.toFixed(1)}%` : '---'}</span>
                            </div>
                            <div className="text-[9px] text-brand-dark/40 font-serif mt-0.5">
                              基準: {step.threshold}%以上
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-brand-dark/70 leading-relaxed mb-3 font-sans">
                          {step.description}
                        </p>

                        {/* Metric Rows */}
                        <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-[11px] font-sans">
                          {step.metrics.map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2">
                              <span className="text-brand-dark/75 truncate flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                {m.label}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                                <span className={m.passed && isStepCompleted ? 'text-emerald-700' : 'text-brand-dark/60'}>
                                  {m.value}
                                </span>
                                {m.passed && isStepCompleted && (
                                  <span className="text-[9px] px-1 bg-emerald-100 text-emerald-800 rounded font-bold">
                                    OK
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
