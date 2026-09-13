import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, BadgeCheck, UserX, Lock, Heart, Sparkles, MailOpen, ArrowRight, PenTool } from 'lucide-react';

interface EkycExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderName?: string;
  mode?: 'detail' | 'general';
}

export const EkycExplanationModal: React.FC<EkycExplanationModalProps> = ({
  isOpen,
  onClose,
  senderName = '差出人',
  mode = 'general'
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto text-left font-sans"
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
              <div className="w-13 h-13 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-lg">
                <ShieldCheck size={22} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                <span className="text-[7px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">eKYC済</span>
              </div>
              <span className="mt-1 text-[8px] font-extrabold text-sky-950 bg-white/95 border border-sky-300 px-1.5 py-0.1 rounded-full shadow-2xs whitespace-nowrap">
                公的確認
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Official eKYC Verified
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 leading-snug">
                公的本人確認（eKYC）マークについて
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'detail' 
                  ? 'この手紙の差出人は、公的身分証明書による本人確認が完了しています。' 
                  : '運転免許証やマイナンバーカードによる実在証明で、お相手に最高の安心感を届けます。'}
              </p>
            </div>
          </div>

          {/* 4大安心ポイント */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              <span>ReMEETs 4つの安心・安全のお約束</span>
            </h4>

            <div className="space-y-2.5">
              {/* 1. 実在証明 */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                    <BadgeCheck size={15} className="text-sky-600 shrink-0" />
                    <span>1. 公的身分証による「実在する本人」の証明</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-sky-700 bg-white border border-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full seal-rainbow" />
                    <span>虹色封蝋バッジ付与</span>
                  </span>
                </div>
                <p className="text-[11px] text-sky-900/80 pl-5 leading-relaxed">
                  運転免許証やマイナンバーカード等による電子的本人確認を行い、実在する人物であることを確認済みです。
                </p>
              </div>

              {/* 2. なりすまし排除 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <UserX size={15} className="text-indigo-600 shrink-0" />
                  <span>2. なりすまし・冷やかし・悪質業者の完全排除</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                  1人1アカウントの厳格な照合管理により、架空の人物や迷惑業者による手紙ではありません。
                </p>
              </div>

              {/* 3. 機微情報の保護 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Lock size={15} className="text-teal-600 shrink-0" />
                  <span>3. 個人情報の安全な暗号化保護</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                  差出人の本名や連絡先は暗号化保管されており、想い出クイズの一致と双方の合意があるまで公開されません。
                </p>
              </div>

              {/* 4. 真剣な再会願い */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Heart size={15} className="text-rose-500 shrink-0" />
                  <span>4. 真剣な想い出再会への願い</span>
                </div>
                <p className="text-[11px] text-amber-900/80 pl-5 leading-relaxed">
                  差出人は大切な過去の縁を取り戻すため、誠意を持って本人確認手続きを完了し、手紙を海に託しています。
                </p>
              </div>
            </div>
          </div>

          {/* モーダルフッター / アクション */}
          <div className="pt-2 space-y-2.5">
            {mode === 'detail' ? (
              <>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <MailOpen size={16} />
                  <span>安心してお手紙を読む・クイズに答える</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/create');
                  }}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PenTool size={13} className="text-teal-700" />
                  <span>あなたも本人確認マーク付きの手紙を書く →</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/create');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <PenTool size={16} />
                  <span>あなたも公的確認（虹バッジ）を取得してお手紙を書く ✨</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  閉じる（手紙を探す）
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
