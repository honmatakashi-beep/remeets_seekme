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
                <li>過去に投函されたメッセージの差出人本名・連絡先IDは「退会済ユーザー」として即時サニタイズされます。</li>
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

interface DeletePublicMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  consent: boolean;
  setConsent: (val: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const DeletePublicMessageModal: React.FC<DeletePublicMessageModalProps> = ({
  isOpen,
  onClose,
  post,
  consent,
  setConsent,
  onDelete,
  isDeleting
}) => {
  if (!isOpen || !post) return null;

  const authorName = post.target_name || post.searcher_full_name || 'あなたのメッセージ';
  const previewMessage = post.message || post.searcher_profile || '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans" data-lenis-prevent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-rose-200 relative text-left"
        >
          {/* ヘッダー */}
          <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-2xs">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">想い出メッセージを削除しますか？</h3>
              <p className="text-xs text-rose-600 font-bold font-sans">システム内の暗号化保管データから完全に削除されます</p>
            </div>
          </div>

          {/* 対象メッセージの簡易表示 */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-bold">
              <span>削除対象のメッセージ</span>
              <span className="text-slate-900">{authorName}</span>
            </div>
            {previewMessage && (
              <p className="text-slate-700 line-clamp-2 bg-white p-2 rounded-xl border border-slate-200 text-[11px] leading-relaxed">
                {previewMessage}
              </p>
            )}
          </div>

          {/* 完全削除・注意事項 */}
          <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-2.5 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-rose-900 text-sm">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>削除に関する重要なお知らせ（必ずご確認ください）</span>
            </p>
            <ul className="space-y-2 text-[11px] text-rose-900">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>システム内から安全に完全消去：</strong> 削除を実行すると、暗号化保管されたメッセージデータおよび照合用データがシステムから完全に消去されます。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>自動照合が停止します：</strong> あなたを探している大切な人が登録しても、自動照合による通知が届かなくなります。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>いつでも新規作成が可能：</strong> 削除完了後は、マイアカウントや新規作成画面から、いつでも新しい内容で想い出メッセージを作成・登録できます。</span>
              </li>
            </ul>
          </div>

          {/* 同意チェック */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-rose-300 cursor-pointer text-xs text-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4 shrink-0"
            />
            <span className="font-bold leading-normal">
              上記内容を理解し、この想い出メッセージをシステム内から完全に削除することに同意します。
            </span>
          </label>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="button"
              disabled={!consent || isDeleting}
              onClick={onDelete}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>削除中...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>想い出メッセージを完全に削除</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

