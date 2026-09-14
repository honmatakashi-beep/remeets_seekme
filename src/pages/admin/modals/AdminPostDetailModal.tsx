import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Bot, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AdminPostDetailModalProps {
  selectedPost: any | null;
  onClose: () => void;
  getPostUrl: (post: any) => string;
  handleAiAnalyze: (id: number) => void;
  isAiAnalyzing: number | null;
  triggerDeletePost: (id: number) => void;
}

export const AdminPostDetailModal: React.FC<AdminPostDetailModalProps> = ({
  selectedPost,
  onClose,
  getPostUrl,
  handleAiAnalyze,
  isAiAnalyzing,
  triggerDeletePost,
}) => {
  return (
    <AnimatePresence>
      {selectedPost && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden" data-lenis-prevent>
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
          />
          <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 15 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 15 }}
             className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
            <div className="p-6 md:p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/30 shrink-0">
              <div>
                <h2 className="text-2xl font-serif text-black">{selectedPost.target_name} 様へのボトルメール</h2>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-black/50 uppercase tracking-widest">Post ID: #{selectedPost.id}</p>
                  <Link 
                    to={getPostUrl(selectedPost)} 
                    className="text-[10px] font-bold text-teal-700 hover:underline flex items-center gap-1 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
                  >
                    メッセージの公開ページを開く <ExternalLink size={10} />
                  </Link>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-black uppercase tracking-[0.2em]">基本情報</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">差出人（アカウントID）</span>
                        <span className="text-sm font-bold text-black font-mono">{selectedPost.searcher_username || '不明'}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">差出人ニックネーム（メッセージ表記）</span>
                        <span className="text-sm font-bold text-black">{selectedPost.searcher_name || <span className="text-black/35 font-normal">未設定</span>}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">アカウント登録ニックネーム</span>
                        <span className="text-sm font-bold text-black">{selectedPost.searcher_account_nickname || <span className="text-black/35 font-normal">未設定</span>}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">差出人本名（実名）</span>
                        <span className="text-sm font-bold text-black">{selectedPost.searcher_full_name || <span className="text-black/35 font-normal">未設定</span>}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">対象者出身地</span>
                        <span className="text-sm font-bold text-black">{selectedPost.target_hometown || '不明'}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">当時の所属</span>
                        <span className="text-sm font-bold text-black">{selectedPost.target_school || '不明'}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">年代</span>
                        <span className="text-sm font-bold text-black">{selectedPost.era}年代</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-brand-border">
                        <span className="text-base text-black/60">ステータス</span>
                        <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${selectedPost.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-black/5 text-black border-black/10'}`}>
                          {selectedPost.status}
                        </span>
                      </div>
                      {selectedPost.status === 'resolved' && selectedPost.verified_by_user && (
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">再会相手</span>
                          <span className="text-sm font-bold text-emerald-600">
                            {selectedPost.verified_by_user.full_name} ({selectedPost.verified_by_user.username})
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-black uppercase tracking-[0.2em]">思い出クイズ（質問と答え）</h3>
                    <div className="space-y-4">
                      {Array.isArray(selectedPost.questions) && selectedPost.questions.length > 0 ? (
                        selectedPost.questions.map((q: any, idx: number) => (
                          <div key={idx} className="p-5 bg-slate-50 rounded-2xl space-y-3 border border-slate-200">
                            <div>
                              <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">質問 {idx + 1}</p>
                              <p className="text-base font-serif text-slate-900">{typeof q === 'object' ? q.question : q}</p>
                            </div>
                            <div className="pt-3 border-t border-slate-200">
                              <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">答え {idx + 1}</p>
                              <p className="text-base font-bold text-emerald-900">{typeof q === 'object' ? (q.answer_plain || q.answer) : '-'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 bg-slate-50 rounded-2xl space-y-3 border border-slate-200">
                          <div>
                            <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">質問 1</p>
                            <p className="text-base font-serif text-slate-900">{selectedPost.secret_question}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-200">
                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">答え 1</p>
                            <p className="text-base font-bold text-emerald-900">{selectedPost.secret_answer_plain || selectedPost.secret_answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">メッセージの本文</h3>
                    <div className="p-6 bg-white text-black border border-brand-border rounded-2xl">
                      <p className="text-base font-serif leading-relaxed opacity-90 whitespace-pre-wrap">
                        "{selectedPost.message}"
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">差出人プロフィール</h3>
                    <p className="text-base font-serif text-black leading-relaxed">
                      {selectedPost.searcher_profile}
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">メッセージの一般公開ページ</h3>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col justify-between gap-3 shadow-sm">
                      <p className="text-[11px] text-emerald-900 leading-relaxed font-sans font-semibold">
                        思い出クイズへの解答や、差出人への返事が行える一般ユーザー向けの実際のメッセージ公開確認ページです。
                      </p>
                      <div>
                        <Link 
                          to={getPostUrl(selectedPost)} 
                          target="_blank"
                          className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <span>メッセージの公開ページを開く</span>
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  </section>

                  {selectedPost.ai_diagnosed === 1 && (
                    <section className="space-y-3">
                      <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">AI安全診断ステータス</h3>
                      <div className={cn(
                        "p-4 rounded-2xl border text-xs leading-relaxed transition-all",
                        selectedPost.ai_flagged === 1 ? "bg-red-50/90 border-red-200 text-red-900" : "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                      )}>
                        <div className="flex items-center gap-2 font-bold">
                          {selectedPost.ai_flagged === 1 ? (
                            <>
                              <AlertTriangle size={16} className="text-red-500 shrink-0" />
                              <span>⚠️ 不適切・要確認判定（隔離非公開）</span>
                            </>
                          ) : (
                            <>
                              <Check size={16} className="text-emerald-600 shrink-0" />
                              <span>✅ 安全確認完了（公開基準適合）</span>
                            </>
                          )}
                        </div>
                        {selectedPost.ai_reason ? (
                          <div className="mt-2 text-[11px] bg-white/80 p-3 rounded-xl border border-black/5 leading-relaxed font-sans">
                            <span className="font-bold block mb-0.5 text-black/80">判定根拠 / コメント:</span>
                            {selectedPost.ai_reason}
                          </div>
                        ) : (
                          <p className="mt-1 text-[11px] opacity-80 font-sans">
                            誹謗中傷、ストーカー性、個人情報の露出等は検出されませんでした。
                          </p>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-brand-border bg-brand-light/10 flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleAiAnalyze(selectedPost.id)}
                  disabled={isAiAnalyzing === selectedPost.id}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer",
                    isAiAnalyzing === selectedPost.id 
                      ? "bg-black/5 text-black animate-pulse" 
                      : selectedPost.ai_diagnosed 
                        ? "bg-brand-light text-black hover:bg-black hover:text-white"
                        : "bg-black text-white hover:bg-black/80 shadow-lg shadow-black/20"
                  )}
                >
                  {isAiAnalyzing === selectedPost.id ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : selectedPost.ai_diagnosed ? (
                    <RefreshCw size={14} />
                  ) : (
                    <Bot size={14} />
                  )}
                  {selectedPost.ai_diagnosed ? '再診断を実行' : 'AI分析を実行'}
                </button>
                {selectedPost.ai_diagnosed === 1 && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest",
                    selectedPost.ai_flagged === 1 ? "text-red-500 bg-red-50 border-red-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                  )}>
                    {selectedPost.ai_flagged === 1 ? (
                      <>
                        <AlertTriangle size={14} />
                        不適切な内容を検知
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        診断済み（安全）
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose}
                  className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:text-black/60 transition-colors cursor-pointer"
                >
                  閉じる
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    triggerDeletePost(selectedPost.id);
                  }}
                  className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all cursor-pointer"
                >
                  ボトルメールを削除
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
