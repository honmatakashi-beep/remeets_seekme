import React from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Heart, User, Calendar, MapPin, Sparkles, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { getPostUrl } from "../../lib/utils";

export const AccountReceivedTab = (props: any) => {
  const {
    connectedPosts = [],
    setStoryTargetPost,
    setStoryTargetRole,
    setStoryModalOpen
  } = props;

  return (
<div className="space-y-6 animate-fade-in text-black">
                {/* Section 1: Connected Bottle Messages */}
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h2 className="text-lg font-serif font-bold text-brand-dark tracking-widest flex items-center gap-2">
                    <span>開封されたお手紙（届いた手紙一覧）</span>
                    {connectedPosts.length > 0 && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold font-sans">
                        {connectedPosts.length}
                      </span>
                    )}
                  </h2>
                </div>
                
                {connectedPosts.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-brand-border rounded-3xl p-6 bg-white/50 space-y-2">
                    <p className="text-xs font-serif text-brand-dark/50">あなた宛てに届き、開封したお手紙はまだありません。</p>
                    <p className="text-[11px] text-brand-dark/40 font-sans leading-relaxed">
                      ボトル検索から思い出のキーワードやお名前を入力し、懐かしい人からのメッセージを見つけましょう。
                    </p>
                    <div className="pt-2">
                      <Link to="/search" className="text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors underline">
                        自分宛ての手紙を探しに行く →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connectedPosts.map((post: any) => (
                      <div key={post.id} className="p-6 border border-emerald-500/20 bg-white rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm hover:shadow transition-all relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-2 max-w-2xl pl-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full font-sans border border-emerald-500/10">
                              {post.era?.toString().startsWith('19') ? post.era : `19${post.era}`}年頃 • {post.owner_nickname || post.searcher_name} さんより
                            </span>
                            <span className="text-[10px] font-bold text-brand-dark/40 font-mono">
                              ID: {post.id}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-brand-dark text-base leading-tight">
                            あなた（{post.target_name} 様）宛てのお手紙
                          </h3>
                          <p className="text-xs text-brand-dark/60 leading-relaxed font-sans">
                            思い出の手がかり： 「{post.searcher_profile}」
                          </p>
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1 font-sans">
                            <p className="text-xs text-emerald-950 font-semibold flex items-center gap-1.5 flex-wrap">
                              <span>👤 出会えたお相手（差出人）:</span>
                              <strong className="text-sm font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                                {post.owner_full_name || post.searcher_full_name || post.searcher_name} 様
                              </strong>
                              {(post.author_maiden_name || post.searcher_maiden_name || post.owner_maiden_name) && (
                                <span className="text-[11px] text-emerald-800 font-medium">
                                  （旧姓: {post.author_maiden_name || post.searcher_maiden_name || post.owner_maiden_name}）
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500 font-normal">
                                （呼称: {post.owner_nickname || post.searcher_name}）
                              </span>
                            </p>
                          </div>

                          {/* 開示された連絡先（LINE ID等）の常時表示 */}
                          {(post.contact_id || post.contact_type || post.unlock_contact_info) && (
                            <div className="mt-2 p-3.5 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl space-y-1.5 font-sans">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                                    開示された連絡先 ({post.contact_type || 'LINE'})
                                  </span>
                                  <span className="font-mono text-sm font-bold text-slate-900 select-all">
                                    {post.contact_id || post.unlock_contact_info}
                                  </span>
                                </div>
                                {(post.contact_id || post.unlock_contact_info) && (
                                  <button
                                    onClick={() => {
                                      const info = post.contact_id || post.unlock_contact_info;
                                      navigator.clipboard.writeText(info);
                                      alert(`${post.contact_type || '連絡先'} ID（${info}）をコピーしました！`);
                                    }}
                                    className="px-3 py-1 text-[11px] font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all cursor-pointer active:scale-95 shadow-2xs"
                                  >
                                    IDをコピー
                                  </button>
                                )}
                              </div>
                              {(post.contact_note || post.unlock_message) && (
                                <p className="text-[11px] text-emerald-800 leading-snug">
                                  メモ: {post.contact_note || post.unlock_message}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center w-full lg:w-auto justify-start lg:justify-end mt-2 lg:mt-0">
                          <button
                            onClick={() => {
                              setStoryTargetPost(post);
                              setStoryTargetRole('receiver');
                              setStoryModalOpen(true);
                            }}
                            className="px-4 py-2.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400 rounded-xl transition-all font-bold font-sans cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 whitespace-nowrap"
                          >
                            <Sparkles size={13} className="text-amber-600 shrink-0" />
                            <span>再会エピソード・お礼を投稿 💌</span>
                          </button>
                          <Link to={getPostUrl(post)} className="px-5 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold font-sans shadow-sm hover:shadow-md flex items-center gap-1 whitespace-nowrap">
                            <span>お手紙・連絡先を見る</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
  );
};
