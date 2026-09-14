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
    activeScene === 1 ? 'https://seekme.remeets.link/posts/msg-88920' :
    activeScene === 2 ? 'https://seekme.remeets.link/notifications/match-88920' :
    activeScene === 3 ? 'https://seekme.remeets.link/posts/msg-88920/request' :
    'https://seekme.remeets.link/posts/msg-88920/opened';

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
      <div className="bg-slate-850 px-4 py-2.5 border-b border-slate-700 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
        {[
          { id: 1, label: '01 メッセージ登録', price: '費用: 0円' },
          { id: 2, label: '02 自動照合・通知', price: '費用: 0円' },
          { id: 3, label: '03 エピソード照合', price: '費用: 0円' },
          { id: 4, label: '04 メッセージ開通', price: '開通: 600円' },
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
        {/* SCENE 01: メッセージ登録・非公開詳細画面 */}
        {activeScene === 1 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-200/90 space-y-5 relative overflow-hidden">
              {/* Top Status & Message ID */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                  暗号化保管中（完全非公開照合）
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>管理番号: MSG-88920</span>
                  <span>•</span>
                  <span>登録: 2026年7月15日</span>
                </div>
              </div>

              {/* Recipient & Sender Header */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-teal-200/60 font-sans">
                  RECIPIENT & SENDER
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 leading-tight">
                  「藤井 裕太」様へ向けた想い出メッセージ
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
                  <span className="text-slate-400 block text-[10px]">お相手のお名前</span>
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
                  <strong className="text-slate-800 text-xs sm:text-sm">愛知県（暗号化管理）</strong>
                </div>
              </div>

              {/* Private Message Preview Box */}
              <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/70 via-rose-50/30 to-amber-50/50 rounded-2xl border-2 border-amber-200/90 space-y-3 relative shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 font-serif">
                    <Heart size={15} className="text-rose-500 fill-rose-500" />
                    <span>あおいさんからの想い出メッセージ（暗号化保管中）</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-serif">非公開メッセージ</span>
                </div>
                <div className="p-4 bg-white/90 rounded-xl border border-amber-200/60 text-center space-y-2">
                  <Lock size={20} className="text-amber-600 mx-auto" />
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    メッセージ本文および連絡先は暗号化されています。<br />
                    お相手による<strong>「想い出エピソードの照合・相互承認」</strong>完了後に安全に開通します。
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectScene(2)}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98"
              >
                <span>システム自動照合の流れを見る (Scene 02へ)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCENE 02: システム自動照合 ＆ マッチング通知 */}
        {activeScene === 2 && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* 1. 自動照合検知カード */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-teal-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-teal-900 font-serif">
                  <Sparkles size={15} className="text-teal-600" />
                  ReMEETs SEEKME システム自動照合検知
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full">
                  照合完了（一致率: 100%）
                </span>
              </div>

              {/* マッチング結果カード */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-serif">
                  <CheckCircle2 size={16} className="text-teal-600" />
                  <span>あなた宛ての想い出メッセージが検出されました</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">お相手</span>
                    <strong className="text-slate-800">あおい 様</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ゆかりの地</span>
                    <strong className="text-slate-800">愛知県</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">年代</span>
                    <strong className="text-slate-800">1990年代</strong>
                  </div>
                </div>
              </div>

              {/* 新着マッチングメール通知UI */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-sky-50 rounded-2xl border border-teal-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                  <Mail size={15} className="text-teal-600 shrink-0" />
                  <span>新着マッチング通知メール（自動配信済み）</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-100 text-xs text-slate-700 leading-relaxed font-sans space-y-1">
                  <p className="font-bold text-slate-900">件名: 【ReMEETs SEEKME】あなた宛ての想い出メッセージが届いています</p>
                  <p className="text-[11px] text-slate-600">
                    藤井 裕太 様宛てに、あおい様（愛知県・1990年代）からの想い出メッセージが登録されました。当時の想い出エピソードを入力して再会希望申請を行うことができます。
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onSelectScene(1)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>メッセージ登録を見る (Scene 01)</span>
                </button>
                <button
                  onClick={() => onSelectScene(3)}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>想い出エピソードで照合する (Scene 03)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCENE 03: 想い出エピソード提出・照合画面 */}
        {activeScene === 3 && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-amber-300 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 font-serif">
                  <Lock size={16} className="text-amber-600" />
                  <span>想い出エピソードによる本人確認（再会希望申請）</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                  費用: 0円（完全無料）
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs flex justify-between">
                <span>対象: <strong>MSG-88920 (藤井 裕太 様宛)</strong></span>
                <span>差出人: <strong className="text-teal-700">あおい</strong></span>
              </div>

              {/* 想い出エピソード入力・照合例 */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block font-serif">
                  当時のふたりだけの想い出エピソード
                </span>
                <div className="p-3 bg-white text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 font-sans leading-relaxed">
                  「小学校の時に放課後いつも『きくや商店』でベビースターラーメンを買って、さくら児童公園の裏庭で秘密基地を作って遊んだ記憶」
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    差出人（あおい様）による確認 ＆ 承認完了
                  </span>
                </div>
              </div>

              {/* 承認完了エフェクト */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-900 space-y-1.5 text-center">
                <div className="font-extrabold text-sm sm:text-base flex items-center justify-center gap-1.5 text-emerald-950">
                  <Sparkles size={18} className="text-emerald-600" />
                  <span>🎉 想い出の一致を確認！相互承認完了</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto font-sans">
                  差出人のあおい様が想い出エピソードを確認し、ご本人であることを承認しました。メッセージ開通・連絡先受取手続きへ進むことができます。
                </p>
              </div>

              <button
                onClick={() => onSelectScene(4)}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>メッセージを開通して連絡先を受け取る (Scene 04へ)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCENE 04: メッセージ開通・連絡先開示画面 */}
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
                      メッセージの開通 ＆ 連絡先の開示完了
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
                  <span>あおいさんからの想い出メッセージ（開通完了）</span>
                </div>
                <p className="font-serif leading-relaxed text-slate-800 text-xs sm:text-sm p-2 bg-white/90 rounded-xl border border-amber-100 shadow-2xs whitespace-pre-line">
                  {`裕太くん！
メッセージを見つけて、当時の思い出を書いてくれて本当にありがとう！
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
