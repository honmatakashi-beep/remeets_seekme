import React, { useEffect, useRef, useState } from 'react';
import { X, Heart, ShieldCheck, Lock, CheckCircle2, Sparkles, Search, ArrowRight, Copy, Check, ChevronRight, ChevronLeft } from 'lucide-react';

export type SampleSceneType = 1 | 2 | 3 | 4;

interface GuideSampleInlineViewerProps {
  activeScene: SampleSceneType | null;
  onClose: () => void;
  onSelectScene: (scene: SampleSceneType) => void;
}

export const GuideSampleInlineViewer: React.FC<GuideSampleInlineViewerProps> = ({
  activeScene,
  onClose,
  onSelectScene
}) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // Auto scroll into view when scene opens
  useEffect(() => {
    if (activeScene !== null && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeScene]);

  // Isolate trackpad wheel events from Lenis smooth scroll
  useEffect(() => {
    const el = scrollContentRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent parent Lenis from capturing scroll
      e.stopPropagation();
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [activeScene]);

  if (activeScene === null) return null;

  const handleCopyLineId = () => {
    try {
      navigator.clipboard.writeText('@aoi_yuta_90s');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full my-6 bg-white rounded-3xl shadow-xl border-2 border-teal-500/40 overflow-hidden font-sans transition-all duration-300 animate-fade-in"
    >
      {/* Header Banner with Rich Gradient */}
      <div className={`p-4 sm:p-5 text-white text-center relative border-b border-white/10 ${
        activeScene === 1 ? 'bg-gradient-to-r from-teal-600 via-sky-600 to-teal-700' :
        activeScene === 2 ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700' :
        activeScene === 3 ? 'bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-700' :
        'bg-gradient-to-r from-indigo-600 via-purple-600 to-slate-800'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full transition-all cursor-pointer shadow-xs z-10 flex items-center gap-1 text-xs px-3 font-bold"
          aria-label="プレビューを閉じる"
        >
          <X size={16} />
          <span className="hidden sm:inline">閉じる</span>
        </button>

        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white border border-white/30 px-3 py-0.5 rounded-full shadow-2xs inline-block mb-1">
          ReMEETs REAL DEMO PREVIEW (インライン実機表示)
        </span>
        <h2 className="text-base sm:text-lg md:text-xl font-black font-serif text-white tracking-wide flex items-center justify-center gap-2">
          {activeScene === 1 && '【Scene 01 投稿サンプル】実際のボトルレター詳細画面'}
          {activeScene === 2 && '【Scene 02 検索サンプル】Google検索＆サイト内発見画面'}
          {activeScene === 3 && '【Scene 03 照合サンプル】合言葉（秘密の質問）回答画面'}
          {activeScene === 4 && '【Scene 04 開通サンプル】連絡先開示・メッセージ開通画面'}
        </h2>

        {/* Scene Switcher Tabs */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-white/15 flex-wrap">
          {[
            { id: 1, label: '01 投稿画面' },
            { id: 2, label: '02 検索結果' },
            { id: 3, label: '03 合言葉照合' },
            { id: 4, label: '04 連絡先開示' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectScene(tab.id as SampleSceneType)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScene === tab.id
                  ? 'bg-white text-slate-900 shadow-md scale-105'
                  : 'bg-white/15 text-white/90 hover:bg-white/25'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div 
        ref={scrollContentRef}
        className="p-4 sm:p-6 md:p-8 space-y-5 bg-white border-t border-slate-100 font-sans max-h-[70vh] overflow-y-auto overscroll-contain" 
        data-lenis-prevent
      >
        {/* SCENE 01: 投稿サンプル */}
        {activeScene === 1 && (
          <div className="space-y-4">
            <div className="p-4 md:p-6 bg-white rounded-2xl border border-teal-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                  海流漂流中（公開中）
                </span>
                <div className="text-xs text-slate-500 font-mono space-x-2">
                  <span>管理番号: BTL-88920</span>
                  <span>•</span>
                  <span>投函日: 2026年7月15日</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">RECIPIENT</span>
                <h3 className="text-xl md:text-2xl font-black font-serif text-slate-900 leading-snug">
                  「藤井 裕太」様へ届いている思い出の手紙
                </h3>
                <div className="flex items-center gap-2 pt-1 text-xs text-teal-800 font-semibold">
                  <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                  <span>差出人：あおい（公的本人確認・宣誓署名完了済み）</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div><span className="text-slate-400 block text-[10px]">お名前</span><strong className="text-slate-800">藤井 裕太 様</strong></div>
                <div><span className="text-slate-400 block text-[10px]">カテゴリ</span><strong className="text-slate-800">🏠 幼馴染・同級生</strong></div>
                <div><span className="text-slate-400 block text-[10px]">記憶の年代</span><strong className="text-slate-800">1990年代</strong></div>
                <div><span className="text-slate-400 block text-[10px]">ゆかりの地</span><strong className="text-slate-800">愛知県（市以下非公開）</strong></div>
              </div>

              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/90 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 border-b border-amber-200/80 pb-2">
                  <Heart size={16} className="text-rose-500 fill-rose-500" />
                  <span>あおいさんからの想い出の手紙</span>
                </div>
                <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line p-2">
                  {`小学校の時の幼馴染の裕太くんへ。

放課後はいつも駄菓子屋の『きくや商店』でベビースターラーメンを買って、近くの公園で秘密基地を作って遊んでいたのを覚えていますか？

引っ越しで離れてしまってから、ずっとどうしているか気になっていました。
もしこの手紙を見つけたら、また昔みたいにお話ししたいです。

あおいより`}
                </p>
              </div>

              <div className="p-4 bg-amber-100/80 rounded-2xl border border-amber-300 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Lock size={15} className="text-amber-700" />
                  <span>合言葉（秘密の質問）設定済み</span>
                </div>
                <p className="text-xs md:text-sm text-amber-950 font-bold leading-snug">
                  Q: 「小学生の時に放課後一緒によく通っていた駄菓子屋の名前は？」
                </p>
                <p className="text-[11px] text-amber-800">
                  ※二人だけしか知り得ない記憶の答え（合言葉）を入力して照合します。
                </p>
              </div>

              <button
                onClick={() => onSelectScene(3)}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-xs md:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>あなたが「藤井 裕太」さんですか？（合言葉に答えて照合する）</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCENE 02: 検索サンプル */}
        {activeScene === 2 && (
          <div className="space-y-4">
            <div className="p-4 md:p-6 bg-white rounded-2xl border border-blue-200 shadow-sm space-y-4">
              <div className="bg-slate-50 rounded-xl border border-slate-300 p-3.5 shadow-xs space-y-2">
                <div className="text-[10px] font-bold text-slate-500 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Search size={12} className="text-blue-600" /> Google 検索エンジン表示再現</span>
                  <span>www.google.co.jp</span>
                </div>
                <div className="bg-white px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-mono font-bold text-slate-800 flex items-center gap-2.5 border border-slate-300 shadow-2xs">
                  <Search size={16} className="text-blue-600 shrink-0" />
                  <span>藤井裕太 1990年代 愛知県 幼馴染</span>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-blue-200 shadow-2xs space-y-2">
                <div className="text-[11px] text-slate-500 font-mono">https://remeets.app › bottle › btl-88920</div>
                <h4
                  onClick={() => onSelectScene(1)}
                  className="text-base sm:text-lg font-bold text-blue-700 hover:underline cursor-pointer font-serif leading-snug"
                >
                  ReMEETs | 「藤井 裕太」様へ届いている思い出の手紙（あおいより）
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  愛知県 1990年代 幼馴染。「小学校の時の幼馴染の裕太くんへ。放課後いつも駄菓子屋のきくや商店で...」あおいさんがあなたを探しています。合言葉に答えて手紙を開封してください。
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Sparkles size={15} className="text-blue-600" />
                    サイト内検索条件とヒット結果
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">1件 ヒット</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                  <div>氏名: <strong className="text-slate-900">藤井 裕太</strong></div>
                  <div>地域: <strong className="text-slate-900">愛知県</strong></div>
                  <div>年代: <strong className="text-slate-900">1990年代</strong></div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectScene(1)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>見つかったボトルレター詳細を見る</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => onSelectScene(3)}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>回答・照合画面へ直接進む</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 03: 照合サンプル */}
        {activeScene === 3 && (
          <div className="space-y-4">
            <div className="p-4 md:p-6 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-4">
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold block">対象の手紙</span>
                  <span className="font-bold text-slate-900">BTL-88920 (藤井 裕太 様宛)</span>
                </div>
                <span className="text-xs text-slate-700">差出人: <strong className="text-teal-700">あおい</strong></span>
              </div>

              <div className="bg-white p-4 rounded-xl border-2 border-amber-300 space-y-2">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">SECRET QUESTION</span>
                <h4 className="text-sm md:text-base font-bold text-slate-900 font-serif">
                  Q: 小学校の時に放課後よく通った駄菓子屋の名前は？
                </h4>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block">あなたの回答（合言葉）</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value="きくや商店"
                    className="flex-1 px-3.5 py-2.5 bg-emerald-50 text-emerald-950 font-bold text-sm rounded-xl border-2 border-emerald-400 font-sans shadow-2xs"
                  />
                  <span className="px-3.5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 size={16} /> 完全一致（正解）
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-900 space-y-1.5">
                <div className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-950">
                  <Sparkles size={18} className="text-emerald-600" />
                  <span>合言葉が一致しました！照合成功</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  お互いしか知らなかった思い出の照合に成功しました。差出人のあおいさんに通知され、公的本人確認（eKYC）後に連絡先が開示されます。
                </p>
              </div>

              <button
                onClick={() => onSelectScene(4)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs md:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>本人確認・連絡先開示画面（Scene 04）へ進む</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCENE 04: 開通サンプル */}
        {activeScene === 4 && (
          <div className="space-y-4">
            <div className="p-4 md:p-6 bg-white rounded-2xl border border-indigo-200 shadow-sm space-y-4">
              <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                  <span>照合 ＆ 公的本人確認（eKYC）完了</span>
                </div>
                <span className="bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">開示成功</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>開示された連絡先情報</span>
                  <span className="text-xs text-teal-700 font-bold">差出人：あおい</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">LINE ID（または各種SNS ID）</span>
                  <div className="font-mono text-sm md:text-base font-bold text-slate-900 flex items-center justify-between">
                    <span>@aoi_yuta_90s</span>
                    <button
                      onClick={handleCopyLineId}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-sans font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'コピー完了' : 'IDコピー'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">登録メールアドレス</span>
                  <div className="font-mono text-xs md:text-sm font-bold text-slate-800">
                    aoi.memories.90s@example.com
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Heart size={15} className="text-rose-500 fill-rose-500" />
                  あおいさんからのメッセージ：
                </span>
                <p className="font-serif italic leading-relaxed text-slate-800 text-xs md:text-sm p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                  「裕太くん！手紙を見つけてくれて、合言葉を答えてくれて本当にありがとう！奇跡みたいに嬉しいです。LINEかメールを追加して、またあの頃みたいにお話ししようね！」
                </p>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 text-center">
                ※本開示は公的身分証（eKYC）による本人確認と、特定商取引法に基づく開示手続完了後に提供されています。
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {activeScene > 1 && (
            <button
              onClick={() => onSelectScene((activeScene - 1) as SampleSceneType)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              <span>前へ</span>
            </button>
          )}
          {activeScene < 4 && (
            <button
              onClick={() => onSelectScene((activeScene + 1) as SampleSceneType)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <span>次へ</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm ml-auto flex items-center gap-1.5"
        >
          <X size={15} />
          <span>プレビューを閉じる</span>
        </button>
      </div>
    </div>
  );
};
