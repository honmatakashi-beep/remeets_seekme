import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Heart, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  Bell, 
  Coins, 
  User, 
  MapPin, 
  Calendar, 
  Award,
  ExternalLink,
  MessageCircle,
  Mail,
  HelpCircle
} from 'lucide-react';

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

  const currentUrl = 
    activeScene === 1 ? 'https://remeets.app/bottle/btl-88920' :
    activeScene === 2 ? 'https://remeets.app/search?name=藤井裕太&area=愛知県' :
    activeScene === 3 ? 'https://remeets.app/bottle/btl-88920/quiz' :
    'https://remeets.app/bottle/btl-88920/opened';

  return (
    <div
      ref={containerRef}
      className="w-full my-6 bg-slate-900 rounded-3xl shadow-2xl border-2 border-teal-500/50 overflow-hidden font-sans transition-all duration-300 animate-fade-in"
    >
      {/* 1. Browser Simulation Window Top Bar */}
      <div className="bg-slate-850 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between gap-3 text-slate-300">
        {/* Window Dots */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-2xs" />
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-2xs" />
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-2xs" />
        </div>

        {/* Real URL Bar */}
        <div className="flex-1 max-w-lg mx-auto bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-300 shadow-inner">
          <Lock size={12} className="text-emerald-400 shrink-0" />
          <span className="truncate">{currentUrl}</span>
          <span className="ml-auto text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-sans shrink-0">
            SSL暗号化
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
          aria-label="プレビューを閉じる"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Scene Switcher Tabs with Price Tags */}
      <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
        {[
          { id: 1, label: '01 投稿画面', price: '費用: 0円' },
          { id: 2, label: '02 検索結果', price: '費用: 0円' },
          { id: 3, label: '03 質問照合', price: '費用: 0円' },
          { id: 4, label: '04 連絡先開示', price: '開通: 600円' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectScene(tab.id as SampleSceneType)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScene === tab.id
                ? 'bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 text-white shadow-md scale-102 ring-1 ring-white/20'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
              activeScene === tab.id ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.price}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Main Content Area (Real Mockup Design) */}
      <div 
        ref={scrollContentRef}
        className="p-3 sm:p-5 md:p-8 bg-slate-100 font-sans max-h-[75vh] overflow-y-auto overscroll-contain" 
        data-lenis-prevent
      >
        {/* SCENE 01: ボトル詳細画面（PostDetailPage完全一致スタイル） */}
        {activeScene === 1 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-200/90 space-y-5 relative overflow-hidden">
              {/* Top Status & Bottle ID */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                  海流漂流中（公開中）
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>管理番号: BTL-88920</span>
                  <span>•</span>
                  <span>投函: 2026年7月15日</span>
                </div>
              </div>

              {/* Recipient & Sender Header (本番完全一致) */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-teal-200/60 font-sans">
                  RECIPIENT & SENDER
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 leading-tight">
                  「藤井 裕太」様へ届いている思い出の手紙
                </h3>

                {/* 差出人サポーター＆本人確認バッジ */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <User size={13} className="text-teal-600" />
                    <span>差出人：あおい</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Award size={12} className="text-amber-600" />
                    ⭐ 公式サポーター
                  </span>
                  <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    🛡️ 公的本人確認済
                  </span>
                </div>
              </div>

              {/* Target Info Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="p-1.5">
                  <span className="text-slate-400 block text-[10px]">お相手の名前</span>
                  <strong className="text-slate-800 text-xs sm:text-sm">藤井 裕太 様</strong>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-400 block text-[10px]">カテゴリ</span>
                  <strong className="text-slate-800 text-xs sm:text-sm">🏠 幼馴染・同級生</strong>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-400 block text-[10px]">記憶の年代</span>
                  <strong className="text-slate-800 text-xs sm:text-sm">1990年代</strong>
                </div>
                <div className="p-1.5">
                  <span className="text-slate-400 block text-[10px]">ゆかりの地</span>
                  <strong className="text-slate-800 text-xs sm:text-sm">愛知県（市以下非公開）</strong>
                </div>
              </div>

              {/* Emotional Letter Message Box (便箋風) */}
              <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/70 via-rose-50/30 to-amber-50/50 rounded-2xl border-2 border-amber-200/90 space-y-3 relative shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 font-serif">
                    <Heart size={15} className="text-rose-500 fill-rose-500" />
                    <span>あおいさんからの想い出メッセージ</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-serif">便箋レター</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line p-1">
                  {`小学校の時の幼馴染の裕太くんへ。

放課後はいつも駄菓子屋の『きくや商店』でベビースターラーメンを買って、近くの公園で秘密基地を作って遊んでいたのを覚えていますか？

引っ越しで離れてしまってから、ずっとどうしているか気になっていました。
もしこの手紙を見つけたら、また昔みたいにお話ししたいです。

あおいより`}
                </p>
              </div>

              {/* Secret Quiz Lock Card (思い出クイズ2問仕様) */}
              <div className="p-4 sm:p-5 bg-amber-50/90 rounded-2xl border-2 border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <Lock size={15} className="text-amber-700" />
                    <span>思い出クイズ（本人確認・全2問設定中）</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    正解者のみ開示
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-amber-950 font-medium">
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-start gap-2">
                    <span className="font-bold text-amber-700 shrink-0">Q1:</span>
                    <span>小学生の時に放課後一緒によく通っていた駄菓子屋の名前は？</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-start gap-2">
                    <span className="font-bold text-amber-700 shrink-0">Q2:</span>
                    <span>二人で放課後に秘密基地を作っていた公園の名前は？</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 font-sans">
                  ※第三者には絶対に推測できない記憶の答えを入力して本人照合を行います（費用: 0円）。
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectScene(3)}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98"
              >
                <span>あなたが「藤井 裕太」さんですか？（思い出クイズに答える）</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCENE 02: 検索・エゴサーチ画面（Google再現 ＆ 本番SearchPageカード） */}
        {activeScene === 2 && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* 1. Google検索スニペット再現 */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200 space-y-3">
              <div className="text-[10px] font-bold text-slate-500 font-mono flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <Search size={13} /> Google 検索エンジン表示再現
                </span>
                <span>google.com</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
                <Search size={14} className="text-blue-600 shrink-0" />
                <span>藤井裕太 1990年代 愛知県 幼馴染</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                <div className="text-[11px] text-slate-500 font-mono">https://remeets.app › bottle › btl-88920</div>
                <h4
                  onClick={() => onSelectScene(1)}
                  className="text-sm sm:text-base font-bold text-blue-700 hover:underline cursor-pointer font-serif leading-snug"
                >
                  ReMEETs | 「藤井 裕太」様へ届いている思い出の手紙（あおいより）
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  愛知県 1990年代 幼馴染。「小学校の時の幼馴染の裕太くんへ。放課後いつも駄菓子屋のきくや商店で...」あおいさんがあなたを探しています。思い出のクイズに答えて手紙を開封...
                </p>
              </div>
            </div>

            {/* 2. ReMEETsサイト内検索ヒット結果 ＆ 新着アラート機能 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-teal-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-teal-900 font-serif">
                  <Sparkles size={15} className="text-teal-600" />
                  ReMEETs サイト内検索結果（1件ヒット）
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                  費用: 0円（検索無料）
                </span>
              </div>

              {/* 検索結果カード（本番BottleCard風） */}
              <div 
                onClick={() => onSelectScene(1)}
                className="p-4 bg-slate-50 hover:bg-teal-50/40 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 text-sm font-serif group-hover:text-teal-700 transition-colors">
                    藤井 裕太 様 宛てのお手紙
                  </span>
                  <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                    漂流中
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 font-serif">
                  「小学校の時の幼馴染の裕太くんへ。放課後はいつも駄菓子屋のきくや商店で...」
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>差出人: あおい</span>
                  <span className="text-teal-700 font-bold flex items-center gap-1">
                    詳細を見る <ChevronRight size={13} />
                  </span>
                </div>
              </div>

              {/* 新着入荷通知アラート（メール通知）保存UI */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-sky-50 rounded-2xl border border-teal-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                  <Bell size={15} className="text-teal-600 shrink-0" />
                  <span>新着入荷通知アラート（無料メール通知）</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  まだ届いていない場合でも、検索条件（藤井裕太・愛知県）を保存しておくと、お相手が新しく手紙を流した瞬間にメールで通知を受け取れます。
                </p>
                <button
                  type="button"
                  className="px-3.5 py-2 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell size={13} className="text-teal-600" />
                  <span>この検索条件でメール通知を保存する</span>
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onSelectScene(1)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>ボトル詳細を見る (Scene 01)</span>
                </button>
                <button
                  onClick={() => onSelectScene(3)}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>クイズに答えて照合する (Scene 03)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 03: 思い出クイズ回答モーダル（QuizModal完全一致スタイル） */}
        {activeScene === 3 && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-amber-300 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 font-serif">
                  <Lock size={16} className="text-amber-600" />
                  <span>思い出クイズ回答（本人照合ステップ）</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                  費用: 0円（完全無料）
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs flex justify-between">
                <span>対象: <strong>BTL-88920 (藤井 裕太 様宛)</strong></span>
                <span>差出人: <strong className="text-teal-700">あおい</strong></span>
              </div>

              {/* 設問 1 */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Q1: 小学生の時に放課後よく通った駄菓子屋の名前は？</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} /> 一致
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value="きくや商店"
                    className="w-full px-3 py-2 bg-emerald-50 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl border-2 border-emerald-400 font-sans"
                  />
                </div>
              </div>

              {/* 設問 2 */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Q2: 二人で放課後に秘密基地を作っていた公園の名前は？</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} /> 一致
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value="さくら児童公園"
                    className="w-full px-3 py-2 bg-emerald-50 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl border-2 border-emerald-400 font-sans"
                  />
                </div>
              </div>

              {/* 全問正解エフェクト */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-900 space-y-1.5 text-center">
                <div className="font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5 text-emerald-950">
                  <Sparkles size={18} className="text-emerald-600" />
                  <span>🎉 全2問の一致を確認！本人照合完了</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto font-sans">
                  お互いしか知らない思い出の照合に成功しました。差出人のあおいさんに通知が届き、手紙開封・連絡先受取手続きへ進むことができます。
                </p>
              </div>

              <button
                onClick={() => onSelectScene(4)}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>手紙を開封して連絡先を受け取る (Scene 04へ)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCENE 04: 手紙開封・連絡先開示画面（LetterViewer完全一致スタイル） */}
        {activeScene === 4 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-indigo-200/90 space-y-5">
              {/* 開通成功ステータスバッジ */}
              <div className="p-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={22} className="text-emerald-200 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-200 block uppercase tracking-wider font-mono">
                      REUNION UNLOCKED
                    </span>
                    <h4 className="text-sm sm:text-base font-black font-serif">
                      手紙の開封 ＆ SNS連絡先の開通完了
                    </h4>
                  </div>
                </div>
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/30 shrink-0">
                  開通完了
                </span>
              </div>

              {/* 差出人からのメッセージ全文（アンロック済み） */}
              <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/80 via-rose-50/30 to-amber-50/60 rounded-2xl border-2 border-amber-200/90 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 border-b border-amber-200/80 pb-2.5">
                  <Heart size={16} className="text-rose-500 fill-rose-500" />
                  <span>あおいさんからのメッセージ全文（ロック解除済み）</span>
                </div>
                <p className="font-serif leading-relaxed text-slate-800 text-xs sm:text-sm p-2 bg-white/90 rounded-xl border border-amber-100 shadow-2xs whitespace-pre-line">
                  {`裕太くん！
手紙を見つけてくれて、思い出の質問に答えてくれて本当にありがとう！
奇跡みたいに嬉しいです。

引っ越してからずっと、あの頃の楽しかった思い出を大切にしていました。
LINEかメールを追加して、またあの頃みたいにお話ししようね！`}
                </p>
              </div>

              {/* 開示された連絡先カード（LINE IDコピー付き） */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-900 font-serif">
                    <MessageCircle size={15} className="text-teal-600" />
                    開示された連絡先情報
                  </span>
                  <span className="text-xs text-teal-700 font-bold">差出人: あおい</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block">LINE ID（または各種SNS ID）</span>
                  <div className="font-mono text-sm sm:text-base font-bold text-slate-900 flex items-center justify-between gap-2">
                    <span>@aoi_yuta_90s</span>
                    <button
                      onClick={handleCopyLineId}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl font-sans font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs hover:scale-102 active:scale-95"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'コピー完了！' : 'IDをコピー'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block">登録メールアドレス</span>
                  <div className="font-mono text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span>aoi.memories.90s@example.com</span>
                  </div>
                </div>
              </div>

              {/* Stripe決済完了証明バッジ */}
              <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                  Stripe国際最高基準 (PCI-DSS Level 1) 暗号化決済完了（開通手数料 600円・月額ゼロ）
                </span>
                <span className="text-[10px] font-mono text-slate-500">TX: ch_don_991823</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer Controls */}
      <div className="p-4 border-t border-slate-700 bg-slate-850 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {activeScene > 1 && (
            <button
              onClick={() => onSelectScene((activeScene - 1) as SampleSceneType)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-700 shadow-2xs"
            >
              <ChevronLeft size={16} />
              <span>前へ (Scene 0{activeScene - 1})</span>
            </button>
          )}
          {activeScene < 4 && (
            <button
              onClick={() => onSelectScene((activeScene + 1) as SampleSceneType)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-700 shadow-2xs"
            >
              <span>次へ (Scene 0{activeScene + 1})</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm ml-auto flex items-center gap-1.5 border border-slate-700"
        >
          <X size={15} />
          <span>プレビューを閉じる</span>
        </button>
      </div>
    </div>
  );
};
