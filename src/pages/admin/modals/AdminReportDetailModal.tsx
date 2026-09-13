import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Shield, Unlock, Lock, Trash2 } from 'lucide-react';

interface AdminReportDetailModalProps {
  selectedReport: any | null;
  onClose: () => void;
  handleViewUser: (user: { id: number; username: string }) => void;
  users: any[];
  handleUpdateUserStatus: (userId: number, isBlocked: boolean) => Promise<void>;
  triggerDeletePost: (id: number) => void;
  handleResolveReport: (id: number) => void;
}

export const AdminReportDetailModal: React.FC<AdminReportDetailModalProps> = ({
  selectedReport,
  onClose,
  handleViewUser,
  users,
  handleUpdateUserStatus,
  triggerDeletePost,
  handleResolveReport,
}) => {
  return (
    <AnimatePresence>
      {selectedReport && (
        <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 md:p-8 overflow-y-auto" data-lenis-prevent>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col my-4 md:my-8"
          >
            <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-black">通報の詳細</h3>
                  <p className="text-sm text-black/50 font-serif">ID: #{selectedReport.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通報者</span>
                  <p className="text-black font-bold">{selectedReport.reporter_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">対象ユーザー</span>
                  <button 
                    onClick={() => {
                      onClose();
                      handleViewUser({ id: selectedReport.target_user_id, username: selectedReport.target_username });
                    }}
                    className="text-black font-bold hover:underline cursor-pointer"
                  >
                    @{selectedReport.target_username}
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通報日時</span>
                  <p className="text-black text-sm">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">ステータス</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${selectedReport.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通報理由</span>
                <div className="p-6 bg-brand-light/30 rounded-2xl border border-brand-border text-black font-serif whitespace-pre-wrap">
                  {selectedReport.reason}
                </div>
              </div>

              {/* 管理者向け即時対応アシスタント */}
              <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100/80 space-y-4">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2 font-sans">
                  <Shield size={14} className="text-red-700" />
                  管理者モデレーション・緊急対処パネル
                </h4>
                <p className="text-xs text-red-900/60 leading-relaxed font-sans">
                  この内容が不親切、脅迫、または公序良俗に反する場合、ただちにボトルメールの完全削除、および投稿者アカウントの凍結（利用停止）を適用してください。
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* アカウント凍結操作 */}
                  {selectedReport.target_user_id && (
                    <button
                      onClick={async () => {
                        const targetUserObj = users.find(u => u.id === selectedReport.target_user_id);
                        const isBlocked = targetUserObj ? !!targetUserObj.is_blocked : false;
                        await handleUpdateUserStatus(selectedReport.target_user_id, !isBlocked);
                        alert(`対象ユーザー (@${selectedReport.target_username}) のブロック状態を ${!isBlocked ? '「ブロック中（凍結）」' : '「正常」'} に変更しました。`);
                      }}
                      className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md font-sans tracking-wider ${
                        users.find(u => u.id === selectedReport.target_user_id)?.is_blocked
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10'
                      }`}
                    >
                      {users.find(u => u.id === selectedReport.target_user_id)?.is_blocked ? (
                        <>
                          <Unlock size={14} />
                          凍結を解除する
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          アカウントを凍結する
                        </>
                      )}
                    </button>
                  )}

                  {/* 投稿削除操作 (target_type が post の場合のみ) */}
                  {selectedReport.target_type === 'post' && selectedReport.target_id && (
                    <button
                      onClick={async () => {
                        onClose();
                        triggerDeletePost(selectedReport.target_id);
                      }}
                      className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-600/10 font-sans tracking-wider"
                    >
                      <Trash2 size={14} />
                      ボトルメールを削除
                    </button>
                  )}
                </div>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="pt-4">
                  <button 
                    onClick={() => {
                      handleResolveReport(selectedReport.id);
                      onClose();
                    }}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black/80 shadow-xl shadow-black/20 transition-all cursor-pointer"
                  >
                    解決済みにする
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-brand-border bg-brand-light/10 flex justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:text-black/60 transition-colors cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
