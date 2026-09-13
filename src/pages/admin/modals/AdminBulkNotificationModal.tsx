import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

interface AdminBulkNotificationModalProps {
  isOpen: boolean;
  pendingNotification: { content: string; link?: string } | null;
  onClose: () => void;
  executeBulkNotification: () => void;
}

export const AdminBulkNotificationModal: React.FC<AdminBulkNotificationModalProps> = ({
  isOpen,
  pendingNotification,
  onClose,
  executeBulkNotification,
}) => {
  return (
    <AnimatePresence>
      {isOpen && pendingNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] shadow-2xl border border-brand-border w-full max-w-lg overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-brand-dark">配信内容の確認</h3>
                  <p className="text-sm text-brand-dark/50 font-serif">全ユーザーに以下を送信します</p>
                </div>
              </div>

              <div className="space-y-4 bg-brand-light/50 p-6 rounded-2xl border border-brand-border">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通知内容</span>
                  <p className="text-black font-serif whitespace-pre-wrap">{pendingNotification.content}</p>
                </div>
                {pendingNotification.link && (
                  <div className="space-y-1 pt-4 border-t border-brand-border">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">リンクURL</span>
                    <p className="text-black text-xs font-mono break-all">{pendingNotification.link}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-brand-dark bg-brand-light border border-brand-border hover:bg-brand-border transition-all cursor-pointer"
                >
                  キャンセル
                </button>
                <button 
                  onClick={executeBulkNotification}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-white bg-brand-dark hover:bg-brand-primary shadow-xl shadow-brand-dark/20 transition-all cursor-pointer"
                >
                  配信を実行する
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
