import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import {
  Search, MapPin, School, Heart, Sparkles, Building, Calendar, Info, CheckCircle2,
  AlertTriangle, ShieldCheck, ShieldAlert, Mail, Lock, Unlock, Key, ArrowRight, ArrowLeft,
  HeartHandshake, CreditCard, Clock, Globe, Copy, Check, User, Phone, FileText,
  Edit, Trash2, AlertCircle, MessageCircle, BookOpen, User as UserIcon
} from "lucide-react";
import { ReunionEffectTitle } from "../../components/ReunionEffectTitle";
import { CreditCardPaymentForm } from "../../components/CreditCardPaymentForm";
import { RecipientSafetyGuide } from "./PostModals";

export const PostDetailMainCard = (props: any) => {
  const navigate = useNavigate();
  const [copiedContact, setCopiedContact] = useState(false);

  const {
    currentStep,
    showDetails,
    post,
    user,
    displaySenderFullName,
    displaySenderMaidenName,
    finderEkycVerified,
    isOwner,
    postedWithEkycFlag,
    revealedContact,
    displayContactId,
    displayContactType,
    displayLetterMessage,
    otherUserFullNameToUse,
    searcherFullName,
    setReportTarget,
    handleStartContact,
    setHasClickedStartContact,
    roadmapSectionRef,
    quizSectionRef,
    handleResolve,
    answers,
    setAnswers,
    verificationResults = [],
    setVerificationResults,
    handleVerify,
    isVerifying,
    remainingAttempts,
    isAttemptsLocked,
    lockedUntil,
    error,
    toHalfWidth = (s: string) => s,
    getCategoryLabel = (c: string) => c
  } = props;

  return (
      <AnimatePresence mode="wait">
        {(currentStep === 1 || showDetails) && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.99, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full mx-auto space-y-8 font-serif"
          >
            {/* 1. 【メインカード】差出人情報 & 思い出の手がかり */}
            <div className="p-6 md:p-8 bg-white border-2 border-teal-200/90 rounded-[32px] shadow-md relative overflow-hidden font-sans space-y-6">
              
              {/* showDetails が true の場合（開示完了・再会後画面） */}
              {showDetails ? (
                <div id="reunion-success-section" className="space-y-6">
                  {/* 👤 1. 差出人（本名）＆ ゆかりの地・所属情報カード */}
                  <div className="p-5 sm:p-6 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-4 font-sans text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                          👤
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">差出人（本名）</span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif flex items-center flex-wrap gap-1">
                            <span>{displaySenderFullName} 様</span>
                            <span className="text-xs sm:text-sm text-slate-500 font-normal font-sans ml-1">
                              （旧姓: {displaySenderMaidenName ? displaySenderMaidenName : '　　　'}）
                            </span>
                          </h4>
                        </div>
                      </div>
                      {(post.author_ekyc_details || post.is_ekyc_verified || post.user_is_verified || finderEkycVerified || (isOwner && (postedWithEkycFlag || user?.is_ekyc_verified))) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300 shadow-2xs">
                          <ShieldCheck size={14} className="text-emerald-700" />
                          公的証明済
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/80 text-slate-700 text-xs font-bold rounded-full">
                          <FileText size={14} className="text-slate-500" />
                          安全利用宣誓済
                        </span>
                      )}
                    </div>

                    {/* ニックネーム・ゆかりの地・当時の所属（他ページと同一のアイコン＆レイアウト） */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <User size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">ニックネーム・呼称</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {post.searcher_name || revealedContact?.searcherName || '差出人'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">ゆかりの地</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {post.target_hometown || '未設定'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <School size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">当時の所属（学校・職場など）</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {post.target_school || '未設定'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* タグ表示 */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-slate-200/60">
                      <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs text-[11px]">
                        お手紙ID: #{post.id}
                      </span>
                      <span className="font-bold text-[#b45309] bg-[#fef3c7] border border-[#f59e0b]/40 px-2.5 py-0.5 rounded-lg text-[11px]">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs text-[11px]">
                        {post.era}年代の記憶
                      </span>
                    </div>
                  </div>

                  {/* 📖 2. 差出人を特定するための手がかり（ふたりの思い出） */}
                  <div className="p-5 sm:p-6 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3 text-left font-sans">
                    <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200/80 pb-2">
                      <BookOpen size={16} className="text-teal-700 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        差出人を特定するための手がかり（ふたりの思い出）
                      </h4>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif font-medium">
                        「{post.searcher_profile || '（プロフィール情報はありません）'}」
                      </p>
                    </div>
                  </div>

                  {/* 🔒 3. 課金後開示項目（手紙本文・開示連絡先の大枠） */}
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-slate-50 rounded-2xl border-2 border-teal-300/80 space-y-5 text-left font-sans shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-teal-200/80 pb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                          ✨
                        </span>
                        <div>
                          <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">プレミアム開示</span>
                          <h4 className="text-sm sm:text-base font-bold text-teal-950">
                            課金後開示項目
                          </h4>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-teal-800 text-[11px] font-bold rounded-full border border-teal-200 shadow-2xs">
                        開示手続き完了済
                      </span>
                    </div>

                    {/* 💌 開封されたメッセージ（お手紙の本文） - 独立枠 */}
                    <div className="p-4 sm:p-5 bg-emerald-50/60 rounded-xl border border-emerald-200/90 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-emerald-200/70 pb-2">
                        <h5 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                          <Unlock size={18} className="text-emerald-600" />
                          <span>💌 開封されたメッセージ（お手紙の本文）</span>
                        </h5>
                        <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                          差出人: {displaySenderFullName} 様
                          <span className="text-[11px] text-emerald-700 font-normal ml-1">
                            （旧姓: {displaySenderMaidenName ? displaySenderMaidenName : '　　　'}）
                          </span>
                        </span>
                      </div>
                      <div className="p-4 sm:p-5 bg-white/95 rounded-xl border border-emerald-200/70 text-slate-900 text-base leading-relaxed font-serif whitespace-pre-wrap shadow-2xs font-medium">
                        {displayLetterMessage}
                      </div>
                    </div>

                    {/* 📱 開示連絡先 - 独立枠（ID表示とボタンを横並び配置） */}
                    <div className="p-4 sm:p-5 bg-teal-50/60 rounded-xl border border-teal-200/90 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-teal-200/70 pb-2">
                        <span className="text-xs sm:text-sm font-extrabold text-teal-950 flex items-center gap-1.5">
                          <MessageCircle size={16} className="text-teal-700" />
                          開示連絡先
                        </span>
                        <span className="text-[11px] font-bold text-teal-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-teal-200/80">
                          {displayContactType}
                        </span>
                      </div>

                      {/* 連絡先ID ＋ アクションボタン（IDコピー ＆ LINE/メール/電話起動）を横並びに配置 */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* 連絡先ID表示フォーム */}
                        <div className="flex-1 p-3 bg-white/95 rounded-xl border border-teal-200/70 font-mono text-sm sm:text-base font-bold text-slate-900 select-all break-all shadow-inner flex items-center">
                          {displayContactId}
                        </div>

                        {/* 右横のアクションボタン群（IDコピー ＆ 直通起動ボタン） */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              if (displayContactId) {
                                navigator.clipboard.writeText(displayContactId);
                                setCopiedContact(true);
                                setTimeout(() => setCopiedContact(false), 2500);
                              }
                            }}
                            className="flex-1 sm:flex-initial px-3.5 py-3 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300/80 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs"
                            title="連絡先IDをクリップボードにコピー"
                          >
                            <Copy size={14} className="text-slate-500" />
                            <span>{copiedContact ? '✓ コピー完了！' : 'IDをコピー'}</span>
                          </button>

                          {(() => {
                            const contactVal = displayContactId;
                            const contactType = displayContactType.toUpperCase();
                            
                            if (contactType.includes('EMAIL') || contactVal.includes('@') && !contactVal.startsWith('@')) {
                              return (
                                <a
                                  href={`mailto:${contactVal}?subject=${encodeURIComponent('【ReMEETs】手紙を受け取りました')}&body=${encodeURIComponent(`${otherUserFullNameToUse || searcherFullName || post.searcher_full_name || '差出人'}様\n\nReMEETsにてあなたからの手紙を開封いたしました。ご連絡ありがとうございます。`)}`}
                                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <Mail size={14} />
                                  <span>メールを開く</span>
                                </a>
                              );
                            } else if (contactType.includes('PHONE') || contactType.includes('電話')) {
                              return (
                                <a
                                  href={`tel:${contactVal.replace(/[^0-9+]/g, '')}`}
                                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <Phone size={14} />
                                  <span>発信する</span>
                                </a>
                              );
                            } else {
                              return (
                                <a
                                  href="https://line.me/R/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <MessageCircle size={14} />
                                  <span>LINEで連絡</span>
                                </a>
                              );
                            }
                          })()}
                        </div>
                      </div>

                      {(post.contact_note || revealedContact?.contactNote) && (
                        <p className="text-xs text-teal-950 leading-relaxed pt-1.5 border-t border-teal-200/60">
                          <span className="font-bold">差出人からのメモ:</span> {post.contact_note || revealedContact?.contactNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 🛡️ 4. 安心・プライバシー保護の窓口 */}
                  <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-2.5 font-sans text-left">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                      <ShieldAlert size={16} className="text-slate-400 shrink-0" />
                      <span>安心・プライバシー保護の窓口:</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      この手紙の内容に不適切な点や心当たりのない内容が含まれている場合は、運営事務局へ通報・相談いただけます。
                    </p>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-1">
                      <button 
                        onClick={() => setReportTarget({ type: 'post', id: post.id })}
                        className="flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-red-600 transition-colors bg-white hover:bg-red-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-red-200 cursor-pointer font-bold shadow-2xs"
                        title="誹謗中傷や不適切なコンテンツを通報"
                      >
                        <ShieldAlert size={14} className="text-red-500 shrink-0" />
                        <span className="truncate">不適切な内容を通報</span>
                      </button>
                      <Link 
                        to={`/deletion-request?id=${post.id}&name=${encodeURIComponent(post.target_name || '')}&content=${encodeURIComponent(`宛先:${post.target_name || ''}様 / ${post.searcher_profile || ''}`)}`}
                        className="flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-rose-700 transition-colors bg-white hover:bg-rose-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-rose-200 cursor-pointer font-bold shadow-2xs"
                        title="この手紙の削除・非公開を申請（手紙ID自動入力）"
                      >
                        <Trash2 size={14} className="text-rose-500 shrink-0" />
                        <span className="truncate">手紙の削除依頼</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* showDetails が false の場合（未開示・手紙探索画面） */
                <div className="space-y-6">
                  {/* カード上部: 差出人の属性 & 信頼性（本人確認・宣誓バッジ） */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs font-serif">
                          ✉️
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">差出人 (探している人)</span>
                          <h2 className="text-base sm:text-lg font-bold text-teal-950 font-serif">
                            「{post.searcher_name || '差出人'}」さん
                          </h2>
                        </div>
                      </div>

                      {/* 本人確認 / 宣誓ステータスバッジ */}
                      {(post.author_ekyc_details || post.is_ekyc_verified || (isOwner && (postedWithEkycFlag || user?.is_ekyc_verified))) ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300/80 rounded-full text-xs font-bold shadow-2xs">
                          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          <span>🛡️ 公的本人確認 (eKYC) 完了済</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold">
                          <FileText size={14} className="text-slate-500 shrink-0" />
                          <span>🌱 年齢・安全利用宣誓済</span>
                        </div>
                      )}
                    </div>

                    {/* メモリータグ（属性まとめ） */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                        お手紙ID: #{post.id}
                      </span>
                      <span className="font-bold text-[#b45309] bg-[#fef3c7] border border-[#f59e0b]/40 px-3 py-1 rounded-xl">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                        {post.era}年代の記憶
                      </span>
                      {post.status === 'resolved' && (
                        <span className="font-bold bg-emerald-600 text-white px-3 py-1 rounded-xl flex items-center gap-1">
                          <CheckCircle2 size={13} /> 再会済み
                        </span>
                      )}
                    </div>
                  </div>

                  {/* カード中部: 差出人を特定するための手がかり（公開エピソード） */}
                  <div className="bg-gradient-to-br from-teal-50/60 via-emerald-50/40 to-slate-50 p-4 sm:p-5 rounded-2xl border border-teal-200/80 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-teal-900 border-b border-teal-200/60 pb-2">
                      <BookOpen size={16} className="text-teal-700 shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold text-teal-950">
                        差出人を特定するための手がかり（ふたりの思い出）
                      </h3>
                    </div>
                    <div className="p-3.5 sm:p-4 bg-white/90 rounded-xl border border-teal-100/80 shadow-2xs">
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif font-medium">
                        「{post.searcher_profile || '（プロフィール情報はありません）'}」
                      </p>
                    </div>

                    {/* ゆかりの地 ＆ 当時の所属 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200/70 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">ゆかりの地</span>
                          <span className="font-bold text-slate-800">
                            {post.target_hometown?.match(/.*?[都道府県]/)?.[0] || post.target_hometown || '未設定'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200/70 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <School size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">当時の所属（学校・職場など）</span>
                          <span className="font-bold text-slate-800">
                            思い出の質問に正解後公開
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* カード下部: ダイレクトな手紙開封アクション CTA */}
                  {post.status !== 'resolved' && (
                    <div className="pt-2 space-y-4 text-left border-t border-slate-200/80">
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/90 via-emerald-50/70 to-slate-50 rounded-2xl border-2 border-teal-300/80 space-y-3.5 font-sans shadow-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-teal-200/80 pb-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-teal-950 flex items-center gap-1.5">
                            <Sparkles size={16} className="text-amber-500 shrink-0" />
                            <span>思い出の質問に正解すると開放される 3大情報</span>
                          </span>
                          <span className="text-[10px] font-bold text-teal-800 bg-white/90 px-2 py-0.5 rounded-full border border-teal-200 shadow-2xs">
                            秘密の暗号化解除
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          {/* 1. 差出人の実名（フルネーム）の開示 */}
                          <div className="p-3 bg-white rounded-xl border border-teal-200/90 shadow-2xs flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              👤
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 leading-tight">【差出人の実名】</div>
                              <div className="text-[10.5px] text-teal-800 font-medium">フルネームを開示</div>
                            </div>
                          </div>

                          {/* 2. 手紙の全文とエピソードを開封 */}
                          <div className="p-3 bg-white rounded-xl border border-emerald-200/90 shadow-2xs flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              💌
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 leading-tight">【手紙の全文】</div>
                              <div className="text-[10.5px] text-emerald-800 font-medium">エピソードを開封</div>
                            </div>
                          </div>

                          {/* 3. お相手の連絡先（LINE・メール等） */}
                          <div className="p-3 bg-white rounded-xl border border-indigo-200/90 shadow-2xs flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              📱
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 leading-tight">【お相手の連絡先】</div>
                              <div className="text-[10.5px] text-indigo-800 font-medium">LINE・メール等</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 鮮やかで目立つグリーンのグラデーション「質問に答えて手紙を開く」ボタン */}
                      <button
                        onClick={handleStartContact}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/30 group"
                      >
                        <Unlock size={18} className="text-emerald-200 group-hover:rotate-12 transition-transform" />
                        <span className="tracking-wide">思い出の質問に答えて手紙を開く</span>
                        <ArrowRight size={16} className="text-emerald-200 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="text-[11px] text-slate-500 text-center font-sans">
                        ※ 会員登録不要ですぐにお答えいただけます（不正利用防止のため暗号化保護されています）。
                      </p>
                    </div>
                  )}

                  {/* 通報・削除依頼 & 管理者・投稿者用SEO証明書ボタン */}
                  <div className="pt-3 border-t border-slate-200/80 mt-3 space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 bg-slate-50/90 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-sans">
                        <ShieldAlert size={16} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-700">安心・プライバシー保護の窓口:</span>
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 font-sans">
                        <button 
                          onClick={() => setReportTarget({ type: 'post', id: post.id })}
                          className="flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-red-600 transition-colors bg-white hover:bg-red-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-red-200 cursor-pointer font-bold shadow-2xs"
                          title="誹謗中傷や不適切なコンテンツを通報"
                        >
                          <ShieldAlert size={14} className="text-red-500 shrink-0" />
                          <span className="truncate">不適切な内容を通報</span>
                        </button>
                        <Link 
                          to={`/deletion-request?id=${post.id}&name=${encodeURIComponent(post.target_name || '')}&content=${encodeURIComponent(`宛先:${post.target_name || ''}様 / ${post.searcher_profile || ''}`)}`}
                          className="flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-rose-700 transition-colors bg-white hover:bg-rose-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-200 cursor-pointer font-bold shadow-2xs"
                          title="この手紙の削除・非公開を申請（手紙ID自動入力）"
                        >
                          <Trash2 size={14} className="text-rose-500 shrink-0" />
                          <span className="truncate">手紙の削除依頼</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. 【開示後専用】安全な再会のためのファーストステップ（独立プレミアムカード） */}
            {showDetails && (
              <div className="p-6 md:p-8 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 border-2 border-teal-200/90 rounded-[32px] shadow-md space-y-6 text-left font-sans">
                <div className="flex items-center justify-between gap-3 border-b border-teal-100 pb-3.5 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center text-lg shrink-0 shadow-2xs">
                      🤝
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">安心して再会するために</span>
                      <h3 className="text-base sm:text-lg font-bold text-teal-950 font-serif">
                        安全な再会のためのファーストステップ
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100/80 text-teal-800 text-xs font-bold rounded-full border border-teal-200 shadow-2xs">
                    <ShieldCheck size={13} className="text-teal-700" />
                    安全ガイドライン準拠
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-4.5 bg-white rounded-2xl border border-teal-100/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">まずはテキストで想い出のご挨拶</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      いきなり通話や面会を求めず、「ReMEETsで手紙を受け取りました」と丁寧にメッセージを送信しましょう。ふたりだけの懐かしいエピソードを添えると自然に会話が弾みます。
                    </p>
                  </div>

                  <div className="p-4.5 bg-white rounded-2xl border border-teal-100/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">個人情報の開示は慎重に</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      お互いの信頼関係が再構築されるまでは、現住所や勤務先、金融情報などの詳細な個人情報は急いで開示しないようご注意ください。
                    </p>
                  </div>

                  <div className="p-4.5 bg-white rounded-2xl border border-teal-100/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">困ったときの安心サポート体制</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      万が一、不審な金銭要求や迷惑行為を受けた場合は、速やかに連絡を遮断（ブロック）し、ReMEETs運営窓口または警察等の公的機関へご相談ください。
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 p-4 rounded-2xl border border-teal-100/80">
                  <span className="text-xs text-slate-500 font-sans">
                    ※ 開示された手紙および連絡先情報はマイアカウントに安全に保存されています。
                  </span>
                  <Link
                    to="/account"
                    className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <UserIcon size={14} />
                    <span>マイアカウントで保存内容を確認</span>
                  </Link>
                </div>
              </div>
            )}

            {/* 3. 【受取人様のための安心再会ガイド（一体型プレミアムカード）】 */}
            {post.status !== 'resolved' && !showDetails && (
              <RecipientSafetyGuide 
                roadmapSectionRef={roadmapSectionRef}
                onStartQuiz={handleStartContact}
                onOpenGuide={() => navigate('/guide')}
              />
            )}

            {isOwner && (
              <div className="glass-card p-6 md:p-12 border border-brand-primary/20 text-center space-y-8 bg-white rounded-[32px] shadow-sm font-sans mx-auto w-full">
                <div className="space-y-2">
                  <p className="text-black font-serif text-2.5xl font-bold">これはあなたが漂流させたボトルです</p>
                  <p className="text-sm text-brand-dark/95 leading-relaxed">
                    お相手が秘密の思い出クイズに正解し、誓約手続きを完了すると、お手紙が開かれ連絡先の引き渡しが行われます。
                  </p>
                </div>
                {post.status !== 'resolved' ? (
                  <div className="flex flex-col md:flex-row gap-3 justify-center flex-wrap">
                    <button 
                      onClick={handleResolve}
                      className="btn-primary px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow cursor-pointer shadow-md"
                    >
                      <CheckCircle2 size={16} />
                      <span>再会しました（解決済みにする）</span>
                    </button>
                    <Link 
                      to={`/edit/${post.id}`}
                      className="btn-primary px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      <span>内容や質問・回答を編集する</span>
                    </Link>
                    <Link 
                      to={`/deletion-request?url=${encodeURIComponent(window.location.href)}`}
                      className="btn-secondary px-6 py-3 border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 text-xs font-bold rounded-full rounded-tr-none"
                    >
                      <Trash2 size={16} />
                      <span>ボトルを取り下げる</span>
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-100">
                    ✓ このボトルは解決済み（再会完了）です
                  </div>
                )}

                {/* 【プレビュー確認用】設定済みの思い出の質問と答えリスト */}
                <div className="pt-8 border-t border-brand-border/40 text-left space-y-4">
                  <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 font-sans">
                    <Lock size={16} className="text-zinc-500" />
                    <span>【ボトル作成元】設定済みの思い出の質問と答え</span>
                  </h4>
                  <p className="text-xs text-zinc-500 font-sans">
                    ※この項目はボトルの作成者（あなた）にのみセキュリティ上表示されています。お相手が回答する際の確認にご利用ください。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    {(post.questions && post.questions.length >= 2
                      ? post.questions
                      : post.questions && post.questions.length === 1
                        ? [...post.questions, { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？', answer: '（設定済み）' }]
                        : [
                            { id: 'main', question: post.secret_question || 'お相手との一番の思い出は？', answer: post.secret_answer_plain || post.secret_answer || '（ハッシュ化保護）' },
                            { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？', answer: '（設定済み）' }
                          ]
                    ).map((q: any, idx: number) => (
                      <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 block">思い出質問 {idx + 1}</span>
                          <span className="text-sm text-zinc-850 font-serif">{q.question}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-200/50">
                          <span className="text-[10px] font-bold text-zinc-400 block">思い出解答 {idx + 1}</span>
                          <span className="text-sm text-zinc-800 font-bold">{q.answer_plain || q.answer || '（ハッシュ化保護）'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            ref={quizSectionRef}
            id="memory-quiz-section"
            initial={{ opacity: 0, scale: 0.99, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full mx-auto space-y-6 animate-fade-in text-left font-sans scroll-mt-28"
          >
            {/* 戻るボタン */}
            <div className="flex items-center">
              <button 
                onClick={() => {
                  setHasClickedStartContact(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all group cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-slate-500" />
                <span>手がかり（Step 1）を再確認する</span>
              </button>
            </div>

            {/* Step 2 メインカード */}
            <div className="p-6 md:p-8 bg-white border-2 border-teal-200/90 rounded-[32px] shadow-md relative overflow-hidden font-sans space-y-6">
              
              {/* ヘッダータイトル */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      <Lock size={18} />
                    </span>
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">STEP 2 / 記憶の照合</span>
                      <h2 className="text-lg sm:text-xl font-bold text-teal-950 font-serif">
                        お互いの記憶を確かめる思い出クイズ
                      </h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-900 border border-teal-300/80 rounded-full text-xs font-bold shadow-2xs">
                    <ShieldCheck size={14} className="text-teal-700 shrink-0" />
                    暗号化保護
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  差出人が設定した「二人だけの思い出にまつわるクイズ」です。正しい回答を入力してお互いの記憶を一致させましょう。
                </p>
              </div>

              {/* クイズの概要と開示条件説明 */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/90 via-emerald-50/70 to-slate-50 rounded-2xl border border-teal-200/90 space-y-2.5 font-sans">
                <div className="flex items-center gap-2 text-teal-950 font-bold text-xs sm:text-sm border-b border-teal-200/60 pb-2">
                  <Sparkles size={16} className="text-teal-600 shrink-0" />
                  <span>正解時に安全に開示される情報</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  思い出クイズに正解することでお互いの記憶が一致していることが確認され、<strong>差出人のフルネーム（実名）</strong>および手紙の本文（詳細メッセージ）、<strong>直接つながる連絡先</strong>が安全に開示されます。これにより、間違いのない確実な再会へ繋がります。
                </p>
              </div>

              {/* 💡 回答の親切な単語入力ガイド */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 text-xs text-teal-950 space-y-1 font-sans shadow-2xs">
                <div className="font-bold flex items-center gap-1.5 text-teal-900">
                  <Sparkles size={15} className="text-teal-600 shrink-0" />
                  <span>💡 回答入力のアドバイス</span>
                </div>
                <p className="leading-relaxed text-[11px] text-teal-900/90">
                  答えは<strong>「短い単語（名詞・キーワード）」</strong>でお答えください。<br />
                  ※「〜です」「〜だった」などの文章ではなく、単語のみ（例: <code>さくらや</code>、<code>お餅</code>）で入力すると正解しやすくなります。ひらがな・カタカナ・漢字・送り仮名の違いは自動で柔軟に判定されます。
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6 pt-1">
                {remainingAttempts !== null && remainingAttempts < 5 && !isAttemptsLocked && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-amber-800 text-xs font-semibold font-sans animate-pulse">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>
                      あと <strong className="text-sm font-bold text-amber-700">{remainingAttempts}回</strong> 間違えると、安全保護のため24時間このボトルの回答がロックされます。
                    </span>
                  </div>
                )}

                {isAttemptsLocked && (
                  <div className="p-6 bg-red-50/70 border-2 border-red-200 rounded-3xl text-center space-y-3 font-sans">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-600 mx-auto">
                      <Lock size={22} className="animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-red-900">セキュリティロック中</h4>
                      <p className="text-xs text-red-700 leading-relaxed">
                        連続して回答が一致しなかったため、安全保護のため24時間ロックされています。時間をおいてから再度お試しください。
                      </p>
                    </div>
                    {lockedUntil && (
                      <p className="text-[11px] font-mono text-slate-700 bg-white px-3 py-1.5 rounded-full inline-block border border-red-200 font-sans shadow-2xs">
                        ロック解除予定時刻: {new Date(lockedUntil).toLocaleString('ja-JP')}
                      </p>
                    )}
                  </div>
                )}

                {(post.questions && post.questions.length >= 2
                  ? post.questions
                  : post.questions && post.questions.length === 1
                    ? [...post.questions, { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？' }]
                    : [
                        { id: 'main', question: post.secret_question || 'お相手との一番の思い出は？' },
                        { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？' }
                      ]
                ).map((q: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-br from-teal-50/40 via-emerald-50/30 to-slate-50 p-5 sm:p-6 rounded-2xl border border-teal-200/80 space-y-3.5 text-left shadow-2xs font-sans">
                    {/* 大きくて見やすい質問バッジラベル */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-teal-700 text-white font-bold text-xs md:text-sm rounded-lg tracking-wider font-sans shadow-2xs">
                          思い出質問 {idx + 1}
                        </span>
                      </div>
                      {verificationResults[idx]?.correct && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 size={13} className="text-emerald-700" /> 正解済み
                        </span>
                      )}
                    </div>

                    {/* 質問文本文 */}
                    <div className="font-serif text-base md:text-lg text-slate-900 leading-relaxed p-4 bg-white rounded-xl border border-teal-100/90 shadow-2xs font-semibold">
                      {q.question}
                    </div>

                    {/* 入力フィールド */}
                    <div className="pt-1">
                      <input 
                        required
                        type="text" 
                        disabled={isAttemptsLocked || verificationResults[idx]?.correct}
                        placeholder={
                          isAttemptsLocked 
                            ? "ロック中のため入力できません" 
                            : verificationResults[idx]?.correct 
                              ? "このクイズはすでに正解されています" 
                              : "答えを入力（例: さくらや / 単語のみでお答えください）"
                        } 
                        className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all font-sans text-base text-slate-900 bg-white placeholder:text-slate-400 ${
                          isAttemptsLocked 
                            ? 'border-red-200 text-zinc-400 bg-red-50/5 cursor-not-allowed'
                            : verificationResults[idx]?.correct 
                              ? 'border-emerald-500 text-emerald-800 bg-emerald-50/40 cursor-not-allowed font-bold' 
                              : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-2xs'
                        }`}
                        value={answers[idx] || ''}
                        onChange={e => {
                          const val = toHalfWidth(e.target.value);
                          const newAnswers = [...answers];
                          newAnswers[idx] = val;
                          setAnswers(newAnswers);
                          if (verificationResults[idx]) {
                            const newResults = [...verificationResults];
                            newResults[idx] = null as any;
                            setVerificationResults(newResults);
                          }
                        }}
                        autoCapitalize="off"
                        autoCorrect="off"
                      />
                    </div>

                    {/* 判定結果メッセージ */}
                    {verificationResults[idx] && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-1 font-sans text-xs"
                      >
                        {verificationResults[idx].correct ? (
                          <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                            このクイズは正解です！
                          </p>
                        ) : (
                          <p className={`text-xs font-bold flex items-center gap-1.5 p-2.5 rounded-xl border ${verificationResults[idx].close ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            <AlertCircle size={15} className="shrink-0" />
                            {verificationResults[idx].hint || (verificationResults[idx].close ? '惜しいです！漢字・ひらがな・送り仮名を変えて、短い単語でお試しください。' : '回答が一致しません。単語のみで再度お確かめください。')}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
                
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2 font-sans border border-red-200">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isVerifying || isAttemptsLocked}
                  className={`w-full py-4 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                    isAttemptsLocked 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 border border-emerald-400/30'
                  }`}
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isAttemptsLocked ? (
                        <Lock size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      <span>
                        {isAttemptsLocked ? "制限ロック経過をお待ちください" : "回答を送信して判定する"}
                      </span>
                      {!isAttemptsLocked && <ArrowRight size={16} />}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

  );
};
