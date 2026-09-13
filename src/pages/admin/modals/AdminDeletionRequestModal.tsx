import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, ExternalLink, CheckCircle2 } from 'lucide-react';

interface AdminDeletionRequestModalProps {
  selectedDeletionRequest: any | null;
  onClose: () => void;
  handleApproveDeletionRequest: (id: number) => void;
  handleRejectDeletionRequest: (id: number) => void;
}

export const AdminDeletionRequestModal: React.FC<AdminDeletionRequestModalProps> = ({
  selectedDeletionRequest,
  onClose,
  handleApproveDeletionRequest,
  handleRejectDeletionRequest,
}) => {
  return (
    <AnimatePresence>
      {selectedDeletionRequest && (
        <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 bg-brand-dark/60 backdrop-blur-sm overflow-y-auto" data-lenis-prevent>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] shadow-2xl border border-brand-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-black">削除依頼の詳細</h3>
                  <p className="text-sm text-black/50 font-serif">ID: #{selectedDeletionRequest.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-brand-light flex items-center justify-center text-black/30 transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">送信者名</span>
                  <p className="text-black font-bold">{selectedDeletionRequest.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">メールアドレス</span>
                  <p className="text-black font-mono">{selectedDeletionRequest.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">対象URL</span>
                  <a href={selectedDeletionRequest.url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline flex items-center gap-1 text-sm">
                    {selectedDeletionRequest.url} <ExternalLink size={12} />
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">申請日時</span>
                  <p className="text-black text-sm">{new Date(selectedDeletionRequest.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">削除理由</span>
                <div className="p-4 bg-brand-light/30 rounded-xl border border-brand-border text-black font-serif">
                  {selectedDeletionRequest.reason}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">詳しい説明</span>
                <div className="p-6 bg-white rounded-2xl border border-brand-border text-black/80 whitespace-pre-wrap leading-relaxed font-serif">
                  {selectedDeletionRequest.explanation || '説明はありません。'}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">対象コンテンツの抜粋</span>
                <div className="p-4 bg-black/5 rounded-xl border border-brand-border text-black/60 text-sm">
                  {selectedDeletionRequest.content}
                </div>
              </div>
            </div>

            <div className="p-8 bg-brand-light/10 border-t border-brand-border flex gap-4">
              {selectedDeletionRequest.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => {
                      handleApproveDeletionRequest(selectedDeletionRequest.id);
                      onClose();
                    }}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    承認して削除
                  </button>
                  <button 
                    onClick={() => {
                      handleRejectDeletionRequest(selectedDeletionRequest.id);
                      onClose();
                    }}
                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X size={16} />
                    却下
                  </button>
                </>
              ) : (
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-brand-primary transition-all cursor-pointer"
                >
                  閉じる
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
