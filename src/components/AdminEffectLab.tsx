import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Check, 
  Settings2, 
  Eye, 
  Sliders, 
  Volume2, 
  Maximize2, 
  ShieldCheck, 
  Zap, 
  HeartHandshake,
  Layers,
  Award
} from 'lucide-react';
import { ReunionThreeEffect, EFFECT_PRESETS, EffectType } from './ReunionThreeEffect';

interface AdminEffectLabProps {
  token?: string;
}

export const AdminEffectLab: React.FC<AdminEffectLabProps> = ({ token }) => {
  const [selectedEffect, setSelectedEffect] = useState<EffectType>(() => {
    return (localStorage.getItem('remeets_active_effect') as EffectType) || 'bottle';
  });
  const [activeDefaultEffect, setActiveDefaultEffect] = useState<EffectType>(() => {
    return (localStorage.getItem('remeets_active_effect') as EffectType) || 'bottle';
  });

  const [speed, setSpeed] = useState<number>(1.0);
  const [particleDensity, setParticleDensity] = useState<number>(1.0);
  const [previewTargetName, setPreviewTargetName] = useState<string>('三浦 拓也');
  const [previewPostDate, setPreviewPostDate] = useState<string>('2026.8.25');
  const [keyTrigger, setKeyTrigger] = useState<number>(0);
  const [isFullScreenModal, setIsFullScreenModal] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSaveActiveEffect = (effectId: EffectType) => {
    setActiveDefaultEffect(effectId);
    localStorage.setItem('remeets_active_effect', effectId);
    setSaveSuccessMessage(`✨ 本番標準エフェクトを「${EFFECT_PRESETS.find(p => p.id === effectId)?.title}」に設定しました`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3500);
  };

  const handleRestart = () => {
    setKeyTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              Three.js 3D WebGL Engine
            </span>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
              5大再会エフェクト検証スタジオ
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            ✨ 「思い出の鍵が解かれました！」3D感動演出 検証ラボ
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            秘密の質問正解時および手紙開封時に再生される、Three.jsを用いた3D演出の比較・パラメータ調整・本番適用を行う管理コンソールです。実物の「思い出の鍵が繋がりました！」ページレイアウトと完全に同期してリアルタイム検証できます。
          </p>

          {saveSuccessMessage && (
            <div className="p-3 bg-emerald-900/80 border border-emerald-400 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in shadow-md">
              <Check size={16} className="text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preset Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {EFFECT_PRESETS.map((preset) => {
          const isSelected = selectedEffect === preset.id;
          const isDefault = activeDefaultEffect === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => {
                setSelectedEffect(preset.id);
                handleRestart();
              }}
              className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 text-left ${
                isSelected
                  ? 'bg-slate-900 text-white border-emerald-400 shadow-xl ring-2 ring-emerald-400/40 scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-xs ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {preset.number}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-slate-800 text-emerald-300 border border-slate-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {preset.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm leading-snug">
                    {preset.title}
                  </h3>
                  <span className={`text-[10px] block font-mono ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    {preset.subtitle}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed line-clamp-3 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                  {preset.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/40">
                <div className="flex flex-wrap gap-1">
                  {preset.tags.slice(0, 2).map((t, idx) => (
                    <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveActiveEffect(preset.id);
                  }}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isDefault
                      ? 'bg-emerald-600 text-white'
                      : isSelected
                      ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isDefault ? (
                    <>
                      <Check size={13} />
                      <span>本番稼働中</span>
                    </>
                  ) : (
                    <span>本番に適用する</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Studio View & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive 3D Canvas Stage */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-sm text-slate-800">
                プレビュー検証中: {EFFECT_PRESETS.find(p => p.id === selectedEffect)?.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>リプレイ</span>
              </button>

              <button
                onClick={() => setIsFullScreenModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 size={14} />
                <span>フルスクリーン検証</span>
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative w-full rounded-3xl overflow-hidden border-2 border-emerald-300/80 shadow-2xl bg-gradient-to-b from-teal-50/60 via-white to-emerald-50/40 min-h-[580px]">
            <ReunionThreeEffect
              key={`${selectedEffect}-${keyTrigger}-${speed}-${particleDensity}`}
              effectType={selectedEffect}
              speed={speed}
              particleDensity={particleDensity}
              targetName={previewTargetName}
              postDate={previewPostDate}
              showControlBar={true}
              onClose={handleRestart}
            />
          </div>
        </div>

        {/* Right: Fine-tuning Parameters Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
              <Sliders size={18} className="text-indigo-600" />
              <h3 className="font-bold text-base">演出パラメータ微調整</h3>
            </div>

            {/* Speed Tuning */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>再生速度 (Speed)</span>
                <span className="font-mono text-indigo-600">{speed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); handleRestart(); }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      speed === s 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Particle Density */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>パーティクル密度 (Particles)</span>
                <span className="font-mono text-indigo-600">{particleDensity}x</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.5, 1.0, 1.8].map((d) => (
                  <button
                    key={d}
                    onClick={() => { setParticleDensity(d); handleRestart(); }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      particleDensity === d 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d === 0.5 ? '軽快 (低負荷)' : d === 1.0 ? '標準' : '超高密度'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text Simulation */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">表示テキストシミュレーション</span>
              
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">宛名（お相手のお名前）</label>
                <input
                  type="text"
                  value={previewTargetName}
                  onChange={(e) => setPreviewTargetName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-serif"
                  placeholder="例: 三浦 拓也"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">投函日</label>
                <input
                  type="text"
                  value={previewPostDate}
                  onChange={(e) => setPreviewPostDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="例: 2026.8.25"
                />
              </div>
            </div>

            {/* Apply & Status Button */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleSaveActiveEffect(selectedEffect)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Award size={16} />
                <span>選択中の演出を本番に設定する</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                ※設定した演出は、一般ユーザーが思い出クイズに正解した際の手紙解封シーンで即座に反映されます。
              </p>
            </div>
          </div>

          {/* Technical Specs Guide Box */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-xs text-slate-600 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>3D演出の描画仕様・軽量化設計</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed text-slate-600">
              <li>Three.js WebGLRenderer によるGPUアクセラレーション描画</li>
              <li>加算合成（AdditiveBlending）による光のブルーム粒子</li>
              <li>モバイル端末でも60FPSを維持するジオメトリ軽量化</li>
              <li>スキップおよび自動終了ハンドラー完備</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Full Screen Modal View */}
      {isFullScreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-700 shadow-2xl">
            <ReunionThreeEffect
              effectType={selectedEffect}
              speed={speed}
              particleDensity={particleDensity}
              targetName={previewTargetName}
              postDate={previewPostDate}
              showControlBar={true}
              onClose={() => setIsFullScreenModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
