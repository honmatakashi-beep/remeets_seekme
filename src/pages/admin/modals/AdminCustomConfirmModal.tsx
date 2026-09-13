import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface AdminCustomConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const AdminCustomConfirmModal: React.FC<AdminCustomConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[12000] flex items-start justify-center p-4 bg-brand-dark/40 backdrop-blur-sm pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-brand-border"
          >
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-serif text-black text-center mb-4">{title}</h3>
            <p className="text-black/60 text-center mb-8 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 text-[12px] font-bold uppercase tracking-widest text-black hover:bg-brand-light/50 rounded-2xl transition-all cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-4 text-[12px] font-bold uppercase tracking-widest bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all cursor-pointer"
              >
                削除する
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
