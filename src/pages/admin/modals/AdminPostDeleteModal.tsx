import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface AdminPostDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  deleteTargetId: number | null;
  deleteReasonText: string;
  setDeleteReasonText: (val: string) => void;
  handleDeletePost: (id: number, reason: string) => void;
}

export const AdminPostDeleteModal: React.FC<AdminPostDeleteModalProps> = ({
  isOpen,
  onClose,
  deleteTargetId,
  deleteReasonText,
  setDeleteReasonText,
  handleDeletePost
}) => {
  const isDeleteModalOpen = isOpen;
  const setIsDeleteModalOpen = (val: boolean) => {
    if (!val) onClose();
  };
  const setDeleteTargetId = (_val?: any) => onClose();

  return (
      <AnimatePresence>
        {isDeleteModalOpen && deleteTargetId !== null && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-brand-dark/40" data-lenis-prevent>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => {
                 setIsDeleteModalOpen(false);
                 setDeleteTargetId(null);
               }}
               className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6 border border-brand-border z-10"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2">
                  <AlertTriangle className="text-red-600 animate-pulse" size={24} />
                  手紙を直接削除（アーカイブ監査）
                </h3>
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTargetId(null);
                  }}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-black/60 leading-relaxed">
                  ボトルメール(ID: #{deleteTargetId})を物理削除し、削除監査アーカイブに保管します。<br />
                  警察捜査の際や違反監査の際の証跡となるため、具体的な削除理由を選択または記入してください。
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-black/60 block">
                    削除の主な理由 (クリックでプリセット入力)
                  </label>
                  
                  {/* 主要なテンプレート理由 */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      '危険キーワード・攻撃・脅迫的な表現の検出',
                      '不適切な個人情報（特定の他人の住所、本名、LINE ID等）の露出',
                      '商用宣伝、怪しい副業、またはスパム行為',
                      'ユーザー自身による手動・同意削除依頼',
                      'ストーキングや出会い目的、他者つきまといの疑い',
                    ].map((reasonStr) => (
                      <button
                        key={reasonStr}
                        type="button"
                        onClick={() => setDeleteReasonText(reasonStr)}
                        className={`px-4 py-2 text-left text-xs rounded-xl border transition-all ${
                          deleteReasonText === reasonStr
                            ? 'bg-black text-white border-black font-bold'
                            : 'bg-brand-light/30 text-black/80 border-brand-border hover:bg-brand-light/70'
                        }`}
                      >
                        {reasonStr}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-black/60 block mb-1">
                      選択中の理由（調整・直接記入も可能）
                    </label>
                    <textarea
                      value={deleteReasonText}
                      onChange={(e) => setDeleteReasonText(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-brand-light text-sm rounded-xl border border-brand-border text-black placeholder-black/30 focus:outline-none focus:border-black transition-colors"
                      placeholder="具体的な理由を入力してください..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTargetId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-brand-light text-black border border-brand-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteTargetId !== null) {
                      handleDeletePost(deleteTargetId, deleteReasonText);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all font-sans text-center shadow-lg shadow-red-600/10 font-bold"
                >
                  物理削除＆アーカイブ保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  );
};
