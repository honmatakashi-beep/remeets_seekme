import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Coffee, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import supporterTwilightCool from '../assets/images/supporter_twilight_cool_1785860735348.jpg';

interface SupportBannerProps {
  variant?: 'card' | 'compact' | 'footer';
  className?: string;
}

export const SupportBanner: React.FC<SupportBannerProps> = ({ variant = 'card', className = '' }) => {
  if (variant === 'compact') {
    return (
      <Link
        to="/supporter"
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-bold rounded-full text-xs shadow-xs shadow-amber-950/20 hover:shadow-sm transition-all hover:scale-[1.02] cursor-pointer border border-amber-400/40 ${className}`}
      >
        <Coffee size={13} className="text-amber-100 shrink-0 drop-shadow-xs" />
        <span className="drop-shadow-xs">ReMEETsを応援（寄付の趣旨）</span>
      </Link>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`p-4 md:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-900/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 font-sans ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0 text-teal-300">
            <Coffee size={20} />
          </div>
          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-300 font-serif">【運営存続のお願い】</span>
              <span className="text-[10px] bg-teal-500/30 text-teal-200 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">1口 500円〜</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              ReMEETsは大切な思い出を持つすべての方が無料で手紙を投稿できるよう、寄付で運営費とAI安全監査費を賄っています。この海を守る応援をお願いできませんか？
            </p>
          </div>
        </div>

        <Link
          to="/supporter"
          className="w-full md:w-auto shrink-0 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-950/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap border border-amber-400/40"
        >
          <BookOpen size={15} className="text-white shrink-0 drop-shadow-xs" />
          <span className="drop-shadow-xs">寄付の趣旨・詳細を見る</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div className={`p-6 md:p-8 bg-gradient-to-br from-sky-50/90 via-teal-50/70 to-indigo-50/80 border-2 border-teal-200/90 rounded-3xl shadow-sm space-y-4 font-sans relative overflow-hidden ${className}`}>
      {/* 背景イラスト（中央配置＆左右上下フェードグラデーション） */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none">
        <div className="relative w-full h-full opacity-40">
          <img 
            src={supporterTwilightCool} 
            alt="涼やかな夕暮れの思い出の海" 
            className="w-full h-full object-cover object-center"
          />
          {/* 左右グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50/90 via-transparent to-sky-50/90" />
          {/* 上下グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-transparent to-sky-50/60" />
        </div>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
            <Coffee size={18} />
          </span>
          <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-3 py-1 rounded-full border border-teal-300/80">
            ☕ 公式サポーター（寄付）のお願い
          </span>
        </div>
        <span className="text-[11px] font-extrabold text-slate-500 font-sans">1口 500円〜選べる寄付</span>
      </div>

      <div className="space-y-2 relative z-10">
        <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 leading-snug">
          「ReMEETsは、大切な思い出を持つすべての方が無料で手紙を流せるよう、個人運営とAI安全監査費を寄付で賄っています。この海が消えてしまわないよう、1杯のコーヒー代で応援していただけませんか？」
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          広告や高額な月額料金を排除し、すべての方が安心して再会の手紙を託せる環境を維持するために、皆様の温かいご支援を必要としております。
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-teal-200/60 relative z-10">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Sparkles size={14} className="text-teal-600" />
          <span>ワンタップ都度寄付（月額課金なし・Stripe暗号化決済）</span>
        </div>

        <Link
          to="/supporter"
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-bold rounded-2xl text-xs md:text-sm transition-all shadow-md shadow-amber-950/25 hover:shadow-lg hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
        >
          <BookOpen size={16} className="text-white shrink-0 drop-shadow-xs" />
          <span className="drop-shadow-xs">寄付の趣旨・サポーター詳細を見る</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
};
