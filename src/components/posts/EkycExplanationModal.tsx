import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, BadgeCheck, UserX, Lock, Heart, Sparkles, MailOpen, PenTool, CheckCircle2 } from 'lucide-react';

interface EkycExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderName?: string;
  senderKana?: string;
  birthYear?: string;
  hometownPref?: string;
  mode?: 'preview' | 'general';
}

export const EkycExplanationModal: React.FC<EkycExplanationModalProps> = ({
  isOpen,
  onClose,
  senderName = '差出人',
  senderKana,
  birthYear,
  hometownPref,
  mode = 'general'
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" data-lenis-prevent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto text-left font-sans"
        >
          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="閉じる"
          >
            <X size={20} />
          </button>

          {/* モーダルヘッダー */}
          <div className="flex items-start gap-4 border-b border-slate-100 pb-4 pr-8">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-14 h-14 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-lg">
                <ShieldCheck size={24} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                <span className="text-[7.5px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">eKYC済</span>
              </div>
              <span className="mt-1 text-[8.5px] font-extrabold text-amber-950 bg-amber-50 border border-amber-300 px-2 py-0.2 rounded-full shadow-2xs whitespace-nowrap">
                公認バッジ
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Official eKYC Verified
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 leading-snug">
                公的本人確認（公認バッジ）の証明内容
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                運転免許証やマイナンバーカード等による公的照合で、相手に100%の安心感を届けます。
              </p>
            </div>
          </div>

          {/* 💻 実際のサイトでの表示イメージ（ミニプレビュー） */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 via-slate-50 to-teal-50/40 border border-amber-200/80 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-600" />
                <span>サイト上での実際の表示イメージ</span>
              </span>
              <span className="text-[9.5px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-sans">
                虹色封蝋印が常時点灯
              </span>
            </div>

            {/* ミニカードプレビュー */}
            <div className="p-3.5 bg-white rounded-xl border-2 border-amber-300 shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9.5px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                    {hometownPref || '神奈川県'}
                  </span>
                  <span className="text-[9.5px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded font-mono">
                    {birthYear ? `${birthYear}` : '1985年生（41歳）'}
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-400">#ONLINE</span>
                </div>
                <div className="text-xs font-serif font-bold text-slate-900 truncate">
                  {senderName ? `${senderName.trim()} 様から貴方へのメッセージです。` : '山田 太郎 様から貴方へのメッセージです。'}
                </div>
                <div className="text-[10.5px] text-slate-500 truncate">
                  「元気にしていますか？あの時の想い出を…」
                </div>
              </div>

              {/* 丸い大型eKYC封蝋バッジ */}
              <div className="w-11 h-11 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-md shrink-0 ring-2 ring-amber-300">
                <ShieldCheck size={18} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
                <span className="text-[6px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-xs">eKYC済</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed">
              ※ ネット公開時や検索結果一覧で、手紙カード右上に<strong>動く虹色公認バッジ</strong>が表示され、相手の「なりすまし不安」を100%解消します。
            </p>
          </div>

          {/* 何がどう証明されているかの解説 */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-teal-600" />
              <span>公的確認で証明される4つの安心保証</span>
            </h4>

            <div className="space-y-2.5">
              {/* 1. 実在証明 */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                    <BadgeCheck size={15} className="text-sky-600 shrink-0" />
                    <span>1. 公的身分証による「実在の本名・本人」の証明</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-sky-700 bg-white border border-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full seal-rainbow" />
                    <span>公認バッジ</span>
                  </span>
                </div>
                <p className="text-[11px] text-sky-900/80 pl-5 leading-relaxed">
                  運転免許証・マイナンバーカード等のICチップまたは厚み撮影により、実在する本人であることをデジタル照合済みです。
                </p>
              </div>

              {/* 2. 年齢・生まれ年の一致 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <BadgeCheck size={15} className="text-emerald-600 shrink-0" />
                  <span>2. 生まれ年（年齢）の100%一致証明</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 pl-5 leading-relaxed">
                  手紙に記載された生まれ年・年齢が公的身分証の生年月日と完全に一致していることが確認されています。
                </p>
              </div>

              {/* 3. なりすまし排除 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <UserX size={15} className="text-indigo-600 shrink-0" />
                  <span>3. なりすまし・冷やかし・悪質業者の完全排除</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                  1人1アカウントの厳格な照合管理により、架空の人物や迷惑業者による手紙ではありません。
                </p>
              </div>

              {/* 4. 機微情報の保護 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Lock size={15} className="text-amber-700 shrink-0" />
                  <span>4. 個人情報の厳格な暗号化保護</span>
                </div>
                <p className="text-[11px] text-amber-900/80 pl-5 leading-relaxed">
                  身分証画像はサーバー上に保持せず、当事者双方が承認するまで連絡先も一切開示されません。
                </p>
              </div>
            </div>
          </div>

          {/* モーダルフッター / アクション */}
          <div className="pt-2 space-y-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 font-serif"
            >
              <ShieldCheck size={16} className="text-amber-200" />
              <span>理解しました（プレビューへ戻る）</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
