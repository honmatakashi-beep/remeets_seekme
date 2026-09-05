import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, Sparkles, ExternalLink } from 'lucide-react';
import { AdminPaymentShowroom } from './AdminPaymentShowroom';

export const PaymentPreviewFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 右下フローティング起動ボタン群 */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <a
          href="/reunion-preview"
          className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-800 text-white px-4 py-2.5 rounded-full shadow-2xl border-2 border-emerald-400/60 flex items-center gap-2 text-xs font-bold font-sans cursor-pointer transition-all ring-4 ring-emerald-500/20 active:scale-95"
          title="「再会おめでとうございます」の5つの演出エフェクトを比較・検証できます"
        >
          <Sparkles size={14} className="text-amber-300 animate-pulse" />
          <span>✨ 再会エフェクト比較</span>
        </a>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-800 text-white px-4 py-2.5 rounded-full shadow-2xl border-2 border-indigo-400/60 flex items-center gap-2 text-xs font-bold font-sans cursor-pointer transition-all ring-4 ring-indigo-500/20"
          title="全5パターンの決済画面とカードブランド自動検知を即座に確認できます"
        >
          <CreditCard size={15} className="text-emerald-300" />
          <span>💳 決済UI確認</span>
        </motion.button>
      </div>

      {/* フルスクリーンオーバーレイモーダル */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-300 my-auto max-h-[92vh] overflow-y-auto p-4 sm:p-6"
            >
              {/* Top Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 shadow-xs">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">
                      Instant Live Payment Preview
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                      クレジットカード決済UI・ライブショールーム
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full transition-colors cursor-pointer"
                    title="プレビューを閉じる"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Showroom Content */}
              <AdminPaymentShowroom />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
