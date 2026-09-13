import React from "react";
import { Settings, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

export interface AdminSettingsTabProps {
  adminHomeDesign?: string;
  setAdminHomeDesign?: (val: string) => void;
  statsEnabled?: boolean;
  handleToggleHomeStats?: () => void;
  bgGlowOpacity?: number;
  handleUpdateBgGlowOpacity?: (val: number) => void;
  handleResetBgContrast?: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  adminHomeDesign = 'v2',
  setAdminHomeDesign,
  statsEnabled = true,
  handleToggleHomeStats = () => {},
  bgGlowOpacity = 0.85,
  handleUpdateBgGlowOpacity = () => {},
  handleResetBgContrast = () => {}
}) => {
  const handleToggleHomeDesignMode = (mode: string) => {
    if (setAdminHomeDesign) {
      setAdminHomeDesign(mode);
    }
    try {
      localStorage.setItem('remeets_home_design', mode);
      localStorage.setItem('remeets_home_design_mode', mode);
      window.dispatchEvent(new Event('home_design_changed'));
      window.dispatchEvent(new CustomEvent('remeets_home_mode_changed', { detail: { mode } }));
      window.dispatchEvent(new CustomEvent('remeets_design_system_changed'));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
            <div className="space-y-6">
              <div className="glass-card p-8">
                <div className="flex items-center gap-3 border-b border-brand-border pb-4 mb-6">
                  <span className="p-2 bg-[#5ea5ad]/10 rounded-lg text-[#5ea5ad]">
                    <Settings size={22} />
                  </span>
                  <div>
                    <h2 className="text-xl font-serif text-black font-bold">一般公開・表示設定</h2>
                    <p className="text-xs text-black/50 font-serif">
                      サイトのホームページや一般公開用パーツの挙動、表示有無を制御します。
                    </p>
                  </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                  {/* HOME画面デザインレイアウト切替 */}
                  <div className="p-6 bg-gradient-to-r from-teal-50/70 to-cyan-50/70 rounded-2xl border border-teal-200/90 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 select-none">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-teal-950 font-sans leading-none flex items-center gap-1.5">
                            <Sparkles size={16} className="text-teal-600" />
                            HOME画面デザインレイアウト設定（メイン / サブ1 / サブ2 / サブ3）
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            adminHomeDesign === 'v2' ? 'bg-teal-700 text-white shadow-2xs' :
                            adminHomeDesign === 'sub2' ? 'bg-sky-700 text-white shadow-2xs' :
                            adminHomeDesign === 'sub3' ? 'bg-emerald-800 text-white shadow-2xs' :
                            'bg-slate-700 text-white shadow-2xs'
                          }`}>
                            {adminHomeDesign === 'v2' ? '✨ メイン (表示中)' :
                             adminHomeDesign === 'v1' ? '📄 サブ1 (表示中)' :
                             adminHomeDesign === 'sub2' ? '🌊 サブ2 (表示中)' :
                             '🌿 サブ3 (表示中)'}
                          </span>
                        </div>
                        <p className="text-xs text-teal-900/80 font-serif leading-relaxed">
                          現在全ユーザーに表示されるホームページ（HOME）のデザインレイアウトを4つのバリエーションから切り替え・記憶保管します。
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* メインデザイン (v2) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHomeDesignMode('v2')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                          adminHomeDesign === 'v2'
                            ? 'bg-white border-teal-600 ring-2 ring-teal-500/30 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold font-sans text-teal-950 flex items-center gap-1">
                            ✨ メイン（現行オリジナル）
                          </span>
                          {adminHomeDesign === 'v2' && (
                            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">選択中</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-serif leading-normal">
                          情緒的な背景・手紙投稿カード・ボトルスライダー・虹色水面波紋エフェクトを配置した洗練の黄金比デザイン。
                        </p>
                      </button>

                      {/* サブ1デザイン (v1) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHomeDesignMode('v1')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                          adminHomeDesign === 'v1'
                            ? 'bg-white border-slate-700 ring-2 ring-slate-400/30 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold font-sans text-slate-900 flex items-center gap-1">
                            📄 サブ1（クラシック標準）
                          </span>
                          {adminHomeDesign === 'v1' && (
                            <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded">選択中</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-serif leading-normal">
                          従来のメッセージ・探すボタンを中心としたクラシック標準レイアウト。
                        </p>
                      </button>

                      {/* サブ2デザイン (sub2) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHomeDesignMode('sub2')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                          adminHomeDesign === 'sub2'
                            ? 'bg-white border-sky-600 ring-2 ring-sky-500/30 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold font-sans text-sky-950 flex items-center gap-1">
                            🌊 サブ2（水紋パノラマ×虹色文字）
                          </span>
                          {adminHomeDesign === 'sub2' && (
                            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">選択中</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-serif leading-normal">
                          海とボトルの水紋パノラマイラストの上に虹色の想い出文字を重ねて配置し、水面の一体感と情緒を極限まで高めたデザイン。
                        </p>
                      </button>

                      {/* サブ3デザイン (sub3) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHomeDesignMode('sub3')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                          adminHomeDesign === 'sub3'
                            ? 'bg-white border-emerald-700 ring-2 ring-emerald-500/30 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold font-sans text-emerald-950 flex items-center gap-1">
                            🌿 サブ3（ミニマリスト・静謐）
                          </span>
                          {adminHomeDesign === 'sub3' && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">選択中</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-serif leading-normal">
                          装飾を削ぎ落とし、全8大要素の文字と余白の美しさを際立たせ、透かしアイコンを添えた静謐デザイン。
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* ホーム画面の統計情報表示 */}
                  <div className="p-6 bg-brand-light/30 rounded-2xl border border-brand-border/60 flex items-center justify-between gap-6">
                    <div className="space-y-1.5 flex-1 select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-black font-sans leading-none">
                          ホーム画面の統計（実績数値）表示
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          statsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-150 text-zinc-650'
                        }`}>
                          {statsEnabled ? 'ON / 表示中' : 'OFF / 非表示'}
                        </span>
                      </div>
                      <span className="text-[11px] text-black/60 font-serif block leading-relaxed">
                        ホームページ（HOME）上部にある<strong>「累計登録者数」「再会成功数」「本日の投函数」</strong>の統計数値カード（グリッド）を表示させるかを切り替えます。
                        <br />
                        <span className="text-amber-750 font-bold">
                          ※ 運用初期（メンバーや投函ボトルがまだ少ない期間）など、統計情報を意図的に隠しておきたい場合は「オフ（非表示）」に設定することを推奨します。
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={handleToggleHomeStats}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        statsEnabled ? 'bg-[#5ea5ad]' : 'bg-black/10'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          statsEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 背景コントラスト・明度リアルタイム調整スライダー */}
                  <div className="p-6 bg-gradient-to-br from-slate-900 to-[#102a33] text-white rounded-2xl border border-teal-500/30 shadow-md space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg">
                            <Sparkles size={16} />
                          </span>
                          <h3 className="text-sm font-bold font-sans text-teal-100">
                            🎨 背景コントラスト・明度リアルタイム調整スライダー
                          </h3>
                        </div>
                        <p className="text-xs text-slate-300 font-serif leading-relaxed">
                          背景の薄い和紙・黄緑の明度を落ち着かせ、前面の白カードとのコントラスト（メリハリ）をリアルタイムで微調整できます。
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetBgContrast}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 font-sans border border-white/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                      >
                        🔄 初期値に戻す
                      </button>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* 背景光彩・彩度（グラデーションの鮮やかさ・透明感） */}
                      <div className="space-y-1.5 bg-black/25 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center text-xs font-sans">
                          <span className="font-bold text-slate-200">
                            🎨 背景光彩・グラデーション彩度（透明度）
                          </span>
                          <span className="px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 font-mono font-bold">
                            {Math.round(bgGlowOpacity * 100)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-serif">
                          和紙ベース（#FDF9F0）に重なる優しいパステルグラデーションの彩度を 0%（完全無地）〜 200%（鮮やか）で調整します。
                        </p>
                        <input
                          type="range"
                          min="0"
                          max="2.0"
                          step="0.05"
                          value={bgGlowOpacity}
                          onChange={(e) => handleUpdateBgGlowOpacity(parseFloat(e.target.value))}
                          className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>0% (無地和紙)</span>
                          <span>50% (ほんのり淡い)</span>
                          <span>100% (標準・上品)</span>
                          <span>200% (鮮明な光彩)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-500/20 text-[11px] text-teal-200/90 font-serif leading-relaxed">
                      💡 <strong>設定の保存</strong>: スライダーを動かすと、全ページで即時反映され、次回アクセス時にも同じ彩度で表示されます。
                    </div>
                  </div>
                </div>
              </div>
            </div>
  );
};
