import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  User, 
  MapPin, 
  School, 
  Unlock, 
  MessageCircle, 
  Copy, 
  Layers
} from 'lucide-react';
import { ReunionEffectTitle, ReunionEffectType } from '../components/ReunionEffectTitle';

export const ReunionEffectsPreviewPage: React.FC = () => {
  const [selectedEffect, setSelectedEffect] = useState<ReunionEffectType>('pure-rainbow-flow');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [copiedContact, setCopiedContact] = useState(false);

  const speedOptions: {
    id: 'slow' | 'normal' | 'fast';
    label: string;
    duration: string;
    description: string;
  }[] = [
    {
      id: 'normal',
      label: '標準スピード（6秒周期）',
      duration: '6s',
      description: 'トップページのメインコピーと同一の、最も自然で澄んだ美しい虹の循環速度です。'
    },
    {
      id: 'fast',
      label: '軽快スピード（3.5秒周期）',
      duration: '3.5s',
      description: 'お祝い感を少し高めた、軽やかでアクティブな虹色グラデーションです。'
    },
    {
      id: 'slow',
      label: 'ゆったりスピード（10秒周期）',
      duration: '10s',
      description: '情緒的で穏やかに、色がじわじわと移り変わる落ち着いた上品な速度です。'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/90 py-6 px-3 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ============================================================ */}
        {/* 1. ナビゲーションバー */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              to="/post/1"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} />
              <span>手紙詳細へ戻る</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" />
              トップページ完全同一 虹色グラデーション（WebGL無・純粋テキスト）
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
            >
              管理者画面
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. 流速コントロールパネル */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl border-2 border-teal-300 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block">Speed Controller</span>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-teal-600" />
                虹色グラデーションの流速（スピード）を選択
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              余計な星・パーティクル・WebGLノイズ完全排除仕様
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {speedOptions.map((opt) => {
              const isSelected = speed === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSpeed(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 shadow-xs ring-2 ring-teal-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                    <span className="text-[10px] font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                      {opt.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug pt-1">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. 実物大 プレビューキャンバス */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl border-2 border-slate-300/80 p-6 md:p-10 shadow-lg space-y-8 relative">
          
          {/* ヘッダー演出エリア */}
          <div className="text-center space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-[0.25em]">
              <Sparkles size={13} className="text-teal-600 animate-pulse" />
              <span>✨ 奇跡の再会が叶いました！</span>
            </div>

            {/* 宛名 ＆ トップページ完全同一の虹色「再会おめでとうございます！」 */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif text-slate-900 font-bold tracking-wider leading-relaxed flex flex-col items-center gap-2 text-center px-4 w-full">
              <span className="block whitespace-normal md:whitespace-nowrap font-serif font-bold text-slate-900">
                芥川 健 様、
              </span>
              
              {/* ✨ トップページと完全同一の虹色グラデーション文字 ✨ */}
              <div className="py-2">
                <ReunionEffectTitle
                  speed={speed}
                  className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold"
                />
              </div>
            </h1>

            {/* サブテキスト */}
            <div className="max-w-xl mx-auto text-slate-600 text-xs sm:text-sm md:text-base font-serif leading-relaxed flex flex-col items-center gap-1 text-center px-4">
              <span className="block">手紙の本文と連絡先が開示されました。</span>
              <span className="block text-emerald-600 font-bold">直接連絡を取り合い、止まっていた大切な時間の続きを始めましょう。</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* メインカード（差出人情報 ＆ 課金後開示項目） */}
          {/* ============================================================ */}
          <div className="p-6 md:p-8 bg-white border-2 border-teal-200/90 rounded-[32px] shadow-sm font-sans space-y-6">
            
            {/* 👤 1. 差出人情報カード */}
            <div className="p-5 sm:p-6 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-4 font-sans text-left">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    👤
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">差出人（本名・呼称）</span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                      綿矢 りさ 様
                    </h4>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300 shadow-2xs">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  公的証明済
                </span>
              </div>

              {/* ニックネーム・ゆかりの地・当時の所属 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                    <User size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">ニックネーム・呼称</span>
                    <span className="font-bold text-slate-800 text-sm">みお</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">ゆかりの地</span>
                    <span className="font-bold text-slate-800 text-sm">京都府京都市</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                    <School size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">当時の所属</span>
                    <span className="font-bold text-slate-800 text-sm">福岡県立修猷館高校</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 📖 2. 差出人を特定するための手がかり */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/50 to-slate-50 rounded-2xl border border-teal-200/70 space-y-2 text-left">
              <span className="text-xs font-bold text-teal-900 block">
                差出人を特定するための手がかり（ふたりの思い出）
              </span>
              <div className="p-3.5 bg-white/95 rounded-xl border border-teal-100 text-slate-800 text-sm font-serif leading-relaxed font-medium">
                「カメラサークル仲間。週末はいつも撮影旅行に行っていました。」
              </div>
            </div>

            {/* ✨ 3. 課金後開示項目（手紙本文 ＆ 連絡先） */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-teal-50/60 rounded-2xl border-2 border-teal-300 space-y-5 shadow-sm text-left">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-teal-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    ✨
                  </span>
                  <div>
                    <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">プレミアム開示</span>
                    <h4 className="text-sm sm:text-base font-bold text-teal-950">
                      課金後開示項目
                    </h4>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-teal-800 text-[11px] font-bold rounded-full border border-teal-200 shadow-2xs">
                  開示手続き完了済
                </span>
              </div>

              {/* 💌 お手紙本文 */}
              <div className="p-4 sm:p-5 bg-emerald-50/60 rounded-xl border border-emerald-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-emerald-200/70 pb-2">
                  <h5 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                    <Unlock size={18} className="text-emerald-600" />
                    <span>💌 開封されたメッセージ（お手紙の本文）</span>
                  </h5>
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                    差出人: 綿矢 りさ 様
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-white/95 rounded-xl border border-emerald-200/70 text-slate-900 text-base leading-relaxed font-serif whitespace-pre-wrap shadow-2xs font-medium">
                  良い写真、撮れてますか？また撮影会やりたいですね！
                </div>
              </div>

              {/* 📱 開示連絡先 */}
              <div className="p-4 sm:p-5 bg-teal-50/60 rounded-xl border border-teal-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-teal-200/70 pb-2">
                  <span className="text-xs sm:text-sm font-extrabold text-teal-950 flex items-center gap-1.5">
                    <MessageCircle size={16} className="text-teal-700" />
                    開示連絡先
                  </span>
                  <span className="text-[11px] font-bold text-teal-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-teal-200/80">
                    LINE
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 p-3 bg-white/95 rounded-xl border border-teal-200/70 font-mono text-sm sm:text-base font-bold text-slate-900 select-all break-all shadow-inner flex items-center">
                    @r_wataya_780
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('@r_wataya_780');
                        setCopiedContact(true);
                        setTimeout(() => setCopiedContact(false), 2500);
                      }}
                      className="flex-1 sm:flex-initial px-3.5 py-3 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300/80 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Copy size={14} className="text-slate-500" />
                      <span>{copiedContact ? '✓ コピー完了！' : 'IDをコピー'}</span>
                    </button>

                    <a
                      href="https://line.me/R/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>LINEで連絡</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🤝 4. 安全な再会のためのファーストステップ */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/40 rounded-[28px] border-2 border-teal-200/80 space-y-4 shadow-sm text-left">
            <div className="flex items-center gap-2.5 border-b border-teal-200/60 pb-3">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                🤝
              </div>
              <div>
                <h4 className="text-base font-bold text-teal-950 font-serif">
                  安全な再会のためのファーストステップ
                </h4>
                <p className="text-xs text-slate-600">
                  久しぶりの連絡を安心してスムーズに進めるための3つのポイント
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-4 bg-white/95 rounded-2xl border border-teal-100 space-y-1.5 shadow-2xs">
                <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-extrabold flex items-center justify-center">1</span>
                  <span>最初のご挨拶</span>
                </span>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  「ReMEETsでボトルメールを受け取りました」と伝えると、お相手もすぐに気付いて安心できます。
                </p>
              </div>

              <div className="p-4 bg-white/95 rounded-2xl border border-teal-100 space-y-1.5 shadow-2xs">
                <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-extrabold flex items-center justify-center">2</span>
                  <span>当時の思い出を添えて</span>
                </span>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  共通のエピソードや当時の呼び名を軽く添えることで、懐かしさと信頼感が一気に深まります。
                </p>
              </div>

              <div className="p-4 bg-white/95 rounded-2xl border border-teal-100 space-y-1.5 shadow-2xs">
                <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-extrabold flex items-center justify-center">3</span>
                  <span>安心のコミュニケーション</span>
                </span>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  金銭のやり取りや不自然な勧誘には応じず、健全な旧友・知人としての再会をお楽しみください。
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
