import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, RefreshCw, Info, Send } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { classifyTicket } from '../../../utils/contactClassification';

interface AdminContactReplyModalProps {
  selectedContact: any | null;
  onClose: () => void;
  replyMessage: string;
  setReplyMessage: (val: string) => void;
  handleReplyContact: (e: React.FormEvent) => void;
  isReplying: boolean;
  handleGenerateAiDraft: (tone?: string) => void;
  isGeneratingAiDraft: boolean;
  aiDraftTone: string;
  setAiDraftTone: (val: string) => void;
}

export const AdminContactReplyModal: React.FC<AdminContactReplyModalProps> = ({
  selectedContact,
  onClose,
  replyMessage,
  setReplyMessage,
  handleReplyContact,
  isReplying,
  handleGenerateAiDraft,
  isGeneratingAiDraft,
  aiDraftTone,
  setAiDraftTone,
}) => {
  return (
    <AnimatePresence>
      {selectedContact && (
        <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 md:p-8 overflow-y-auto" data-lenis-prevent>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-2xl relative z-10 p-8 overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-black/40 hover:text-black transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-black">お問い合わせへの返信</h3>
                <p className="text-sm text-black/50 font-serif">{selectedContact.email} 宛</p>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {/* Automated Classification Insight Box */}
              {(() => {
                const classification = classifyTicket(selectedContact.subject || '', selectedContact.message || '');
                const isUrgent = classification.category === 'urgent';
                const isTechnical = classification.category === 'technical';
                const isAccount = classification.category === 'account';

                return (
                  <div className={cn(
                    "p-4 rounded-2xl border space-y-2.5 transition-all shadow-xs",
                    isUrgent 
                      ? "bg-rose-50/80 border-rose-200 text-rose-950" 
                      : isTechnical
                      ? "bg-sky-50/80 border-sky-200 text-sky-950"
                      : isAccount
                      ? "bg-purple-50/80 border-purple-200 text-purple-950"
                      : "bg-slate-50/80 border-slate-200 text-slate-900"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">自動分類 (Automated Triage)</span>
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 border border-rose-300 animate-pulse">
                            🚨 Urgent (最優先)
                          </span>
                        )}
                        {isTechnical && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-200 text-sky-800 border border-sky-300">
                            ⚙️ Technical (技術・不具合)
                          </span>
                        )}
                        {isAccount && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-800 border border-purple-300">
                            👤 Account (アカウント関連)
                          </span>
                        )}
                        {!isUrgent && !isTechnical && !isAccount && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                            💬 General (一般問い合わせ)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-serif font-bold opacity-80">優先スコア: {classification.priorityScore}/3</span>
                    </div>

                    <p className="text-xs leading-relaxed opacity-90 font-sans">
                      💡 <strong>対応ガイド:</strong> {classification.triageTip}
                    </p>

                    {classification.matchedKeywords.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-black/5">
                        <span className="text-[10px] opacity-60 font-bold">検知キーワード:</span>
                        {classification.matchedKeywords.map((kw, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-black/10 font-mono font-bold">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-4">
                <div className="p-6 bg-brand-light/50 rounded-2xl border border-brand-border">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-black/40 uppercase tracking-widest">受信内容</span>
                    <span className="text-[10px] text-black/30">{new Date(selectedContact.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                  <h4 className="font-bold text-black mb-2">{selectedContact.subject}</h4>
                  <p className="text-sm text-black/70 whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                </div>

                {selectedContact.reply_message && (
                  <div className="p-6 bg-black/5 rounded-2xl border border-black/10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-black uppercase tracking-widest">過去の返信</span>
                      <span className="text-[10px] text-black/40">{new Date(selectedContact.replied_at).toLocaleString('ja-JP')}</span>
                    </div>
                    <p className="text-sm text-black/70 whitespace-pre-wrap leading-relaxed italic">{selectedContact.reply_message}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleReplyContact} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-1.5">
                      <Mail size={16} className="text-brand-primary" />
                      <span>返信メッセージ</span>
                    </label>

                    {/* AI Draft Button */}
                    <button
                      type="button"
                      id="btn-ai-draft-generate"
                      onClick={() => handleGenerateAiDraft()}
                      disabled={isGeneratingAiDraft || !selectedContact}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="ユーザーの問い合わせ内容からAIが適切な公式返信メールの下書きを自動作成します"
                    >
                      {isGeneratingAiDraft ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>AI下書き生成中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="text-amber-300" />
                          <span>AI返信下書きを作成</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Tone selector pills & Quick Templates */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-black/[0.03] rounded-xl border border-black/5">
                      <span className="text-[11px] font-bold text-black/50 pl-1">トーン指定:</span>
                      {[
                        { key: 'standard', label: '標準・丁寧' },
                        { key: 'guide', label: '仕様・使い方案内' },
                        { key: 'apology', label: 'お詫び・調査' },
                        { key: 'gratitude', label: '感謝・共感' },
                        { key: 'concise', label: '要点簡潔' },
                      ].map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          disabled={isGeneratingAiDraft}
                          onClick={() => {
                            setAiDraftTone(t.key);
                            handleGenerateAiDraft(t.key);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            aiDraftTone === t.key
                              ? 'bg-emerald-700 text-white shadow-xs font-bold'
                              : 'bg-white/80 text-black/70 hover:bg-white hover:text-black border border-black/5 font-medium'
                          }`}
                        >
                          <span className="whitespace-nowrap">{t.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Quick Template Palette */}
                    <div className="p-2.5 bg-brand-light/50 rounded-xl border border-brand-border/60 space-y-1.5">
                      <span className="text-[11px] font-bold text-brand-dark/60 block pl-0.5 whitespace-nowrap">📋 よく使う定型文テンプレート (ワンクリック挿入):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            title: '🪪 本人確認(eKYC)案内',
                            text: `いつもReMEETsをご利用いただきありがとうございます。\nReMEETs運営事務局サポートチームです。\n\n本人確認（eKYC）の手順についてご案内いたします。\nマイページ右上の「設定・本人確認」より、運転免許証またはマイナンバーカードの撮影画面にお進みいただき、表面・厚み・裏面を明るい場所で撮影してご提出ください。\n\n通常、提出から数分〜数時間以内に照合が完了いたします。\nご不明な点がございましたらお気軽にお問い合わせください。`
                          },
                          {
                            title: '💳 決済・返金調査',
                            text: `いつもReMEETsをご利用いただきありがとうございます。\nReMEETs運営事務局サポートチームです。\n\n決済・料金に関するお問い合わせをいただきありがとうございます。\nいただいた内容に基づき、決済代行システム（Stripe）およびサーバーログとの照合・調査を開始いたしました。\n\n調査結果が判明次第、迅速にご案内または返金処理のご報告を差し上げます。今しばらくお待ちくださいますようお願い申し上げます。`
                          },
                          {
                            title: '👤 退会・データ削除',
                            text: `いつもReMEETsをご利用いただきありがとうございます。\nReMEETs運営事務局サポートチームです。\n\n退会および登録データの削除についてご案内いたします。\nマイページの「アカウント設定」最下部にある「退会手続き」より、いつでも即座にアカウントの退会および個人データの完全消去が可能です。\n\nこれまでReMEETsをご利用いただき、心より感謝申し上げます。`
                          },
                          {
                            title: '💌 ボトルの使い方案内',
                            text: `いつもReMEETsをご利用いただきありがとうございます。\nReMEETs運営事務局サポートチームです。\n\n想い出ボトルメールの仕様についてご案内いたします。\nReMEETsでは、当時の年代・都道府県・想い出クイズを設定してボトルを海へ流します。お相手がクイズに正答し、相互合意と本人確認（eKYC）を完了することで、安全に連絡先の開示・再会が実現します。\n\nぜひ素敵な再会のきっかけとしてご活用ください。`
                          },
                          {
                            title: '🛡️ 迷惑行為・ブロック案内',
                            text: `いつもReMEETsをご利用いただきありがとうございます。\nReMEETs運営事務局サポートチームです。\n\n不快な思いをおかけし大変申し訳ございません。\nReMEETsでは、不適切な言動を行うユーザーを通報・ブロックする機能を備えております。通報を受けたアカウントは運営にて厳重に監査し、利用規約に基づき利用停止等の対処を行います。\n\n安心してご利用いただける環境維持に努めてまいります。`
                          }
                        ].map((tpl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReplyMessage(tpl.text)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-brand-border text-brand-dark hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-2xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <span className="whitespace-nowrap">{tpl.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea 
                      required
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="返信内容を入力してください...（上の「AI返信下書きを作成」または「定型文テンプレート」を押すと文面が自動反映されます）"
                      className="w-full bg-brand-light/50 border border-brand-border rounded-2xl px-6 py-4 text-base font-serif focus:outline-none focus:ring-2 focus:ring-black/20 transition-all min-h-[220px] leading-relaxed"
                    />
                    {replyMessage && (
                      <button
                        type="button"
                        onClick={() => setReplyMessage('')}
                        className="absolute bottom-4 right-4 text-xs text-black/40 hover:text-red-500 bg-white/80 px-2.5 py-1 rounded-md border border-black/10 transition-colors shadow-xs"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-black/50 flex items-center gap-1 pl-1">
                    <Info size={12} className="text-black/40" />
                    <span>AI生成後は文面を適宜編集・調整してから送信してください。</span>
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1 py-4"
                  >
                    キャンセル
                  </button>
                  <button 
                    type="submit"
                    disabled={isReplying}
                    className="btn-primary flex-[2] py-4 flex items-center justify-center gap-2"
                  >
                    {isReplying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>送信中...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>メールを送信する</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
