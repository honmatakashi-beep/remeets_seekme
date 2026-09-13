import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Trash2 } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: boolean;
  setConsent: (val: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  consent,
  setConsent,
  onDelete,
  isDeleting
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans" data-lenis-prevent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-rose-200 relative text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-zinc-900">本当に退会しますか？</h3>
                <p className="text-[11px] text-zinc-500 font-sans">この操作は取り消すことができません。</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-rose-900 space-y-2 leading-relaxed">
              <p className="font-bold">⚠️ 退会時の注意事項：</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                <li>ログイン用アカウント情報（メールアドレス・パスワード・SNS連携）は物理消去されます。</li>
                <li>新着入荷アラートや通知はすべて自動的に停止・消去されます。</li>
                <li>過去に投函された手紙の差出人本名・連絡先IDは「退会済ユーザー」として即時サニタイズされます。</li>
              </ul>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="font-bold">上記内容を理解し、アカウントの完全削除・退会に同意します。</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!consent || isDeleting}
                onClick={onDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting ? "消去中..." : "退会を実行する"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
