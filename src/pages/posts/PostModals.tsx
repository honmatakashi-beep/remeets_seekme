import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import {
  Activity, AlertCircle, AlertTriangle, Anchor, ArrowDown, ArrowLeft, ArrowRight,
  Award, BookOpen, Calendar, Check, CheckCircle, CheckCircle2, CheckSquare,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Clock, Coins, Copy,
  CreditCard, Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff, FileText,
  FileWarning, Filter, Heart, HeartHandshake, HelpCircle, Info, Key, Lock,
  LogOut, Mail, MapPin, MessageCircle, MessageSquare, MoreVertical,
  PlusCircle, RefreshCw, RotateCcw, School, Search, Send, Share2,
  Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Tag, Trash2,
  User, User as UserIcon, Users, Wind, X, Zap, Bot, Image as ImageIcon,
  Plus, Globe, Unlock, UserCheck, Gift, FileSpreadsheet, Phone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/AuthContext';
import { useNgFilter } from '../../contexts/AuthContext';
import { cn, PageHeader, formatEraLabel, getCategoryText, getPostUrl, PREFECTURES } from '../../lib/utils';
import { BottleLoader, WarningMessage, ProtectedRoute, GoogleSearchResultPreview, BackToHomeButton } from '../../components/SharedComponents';
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from '../../components/DocumentCameraOverlay';
import { QuizMatchingAnalyticsView } from '../../components/QuizMatchingAnalyticsView';
import { SupportModal } from '../../components/SupportModal';
import { CreditCardPaymentForm } from '../../components/CreditCardPaymentForm';
import { ReunionEffectTitle } from '../../components/ReunionEffectTitle';
import { QuestionSampleModal } from '../AuthPages';
import { SuccessStoryModal } from '../SearchPage';
import quizMatchHearts from '../../assets/images/quiz_match_hearts_pastel_1785940521320.jpg';
import postSuccessSoft from '../../assets/images/post_success_soft_1785869214309.jpg';


import { ScrollToTop, ScrollToTopButton } from './PostUtils';

export const FlowExplanation = () => (
  <div className="flex flex-col gap-6 mt-10 max-w-xl mx-auto relative pl-6 border-l-2 border-dashed border-brand-primary/30">
    {[
      { icon: <PlusCircle size={18} />, text: "想いを綴る", sub: "あの日言えなかった言葉をボトルに託す" },
      { icon: <Search size={18} />, text: "海を漂う", sub: "実名と思い出の手がかりだけが検索エンジンに届く" },
      { icon: <Globe size={18} />, text: "本人が発見", sub: "エゴサーチでお相手がこのページを見つける" },
      { icon: <Unlock size={18} />, text: "記憶で繋がる", sub: "二人だけの思い出の質問で再会を果たす" }
    ].map((step, i) => (
      <div key={i} className="relative flex items-start gap-4 bg-white/50 backdrop-blur-sm p-5 rounded-[24px] border border-brand-primary/10 shadow-sm transition-all hover:bg-white/80 hover:border-brand-primary/25 group md:px-6">
        <div className="absolute -left-[35px] top-6 w-[16px] h-[16px] rounded-full bg-white border-2 border-brand-primary shadow-sm flex items-center justify-center z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
        </div>
        <div className="absolute top-4 right-4 text-[9px] font-bold font-sans bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full tracking-wider">
          STEP 0{i + 1}
        </div>
        <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-105 transition-transform">
          {step.icon}
        </div>
        <div className="space-y-1.5 text-left pt-0.5 pr-10">
          <h4 className="font-bold text-sm sm:text-base text-brand-dark flex items-center gap-1.5">
            {step.text}
          </h4>
          <p className="text-[11px] sm:text-xs text-brand-dark/75 leading-relaxed font-serif">
            {step.sub}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export const RecipientSafetyGuide = ({
  roadmapSectionRef,
  onStartQuiz,
  onOpenGuide
}: {
  roadmapSectionRef?: React.RefObject<HTMLDivElement | null>;
  onStartQuiz?: () => void;
  onOpenGuide?: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div 
      ref={roadmapSectionRef}
      className="scroll-mt-24 bg-white border-2 border-teal-200/90 rounded-[32px] p-5 sm:p-7 md:p-9 font-sans shadow-md space-y-7 text-left overflow-hidden"
    >
      {/* 1. ヘッダー：安心宣言＆プラットフォーム概要 */}
      <div className="border-b border-slate-100 pb-4 text-left space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤝</span>
          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            初めてこの手紙を見つけた方へ ── ReMEETsの安心再会システム
          </h3>
        </div>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
          お名前は検索エンジンで見つかりますが、手紙本文とお互いの連絡先は<strong className="text-teal-900 font-bold">「二人だけの思い出クイズ」を解いたご本人のみに安全に開示</strong>されます。
        </p>
      </div>

      {/* 2. 【フロー進行型】手紙を開封するまでのシンプルな 3ステップ（上品なローズ/ピンク調コンテナ） */}
      <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-rose-100/50 border border-rose-200/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Mail size={16} />
            </div>
            <h4 className="text-xs md:text-sm font-extrabold text-rose-950 tracking-wide">
              手紙を開封し連絡先を受け取るまでの流れ（3ステップ）
            </h4>
          </div>
          <span className="text-[11px] font-bold text-rose-900 bg-white/95 px-2.5 py-0.5 rounded-full border border-rose-300/80 shrink-0 self-start sm:self-auto shadow-2xs">
            ✨ かんたん3分
          </span>
        </div>

        {/* 3ステップカード（スマホ: 1列 / タブレット・PC: 横並び3列） */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-3 md:gap-4">
          {/* STEP 1 */}
          <div className="p-4 sm:p-3.5 md:p-4.5 rounded-2xl bg-white/95 border border-rose-200/80 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all text-left flex flex-col justify-between space-y-3 group">
            <div className="space-y-2.5">
              {/* カード上部：STEPバッジ & 無料バッジ */}
              <div className="flex items-center justify-between gap-2 border-b border-rose-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100/90 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200/80 group-hover:scale-105 transition-transform">
                    <Search size={16} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs font-sans">
                    STEP 01
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 font-sans">
                  無料
                </span>
              </div>
              
              {/* タイトル＆説明 */}
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm sm:text-[13px] md:text-sm text-slate-900 leading-snug font-serif">
                  手がかり・思い出を確認
                </h5>
                <p className="text-xs sm:text-[11px] md:text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  差出人との出会いやエピソードから、心当たりがあるかお相手を思い出します。
                </p>
              </div>
            </div>

            {/* フッター補足 */}
            <div className="pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-rose-850 font-bold flex items-center gap-1 font-sans">
              <span>✓ 登録不要ですぐ確認可能</span>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="p-4 sm:p-3.5 md:p-4.5 rounded-2xl bg-white/95 border border-rose-200/80 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all text-left flex flex-col justify-between space-y-3 group">
            <div className="space-y-2.5">
              {/* カード上部：STEPバッジ & 無料バッジ */}
              <div className="flex items-center justify-between gap-2 border-b border-rose-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100/90 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200/80 group-hover:scale-105 transition-transform">
                    <Key size={16} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs font-sans">
                    STEP 02
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 font-sans">
                  無料
                </span>
              </div>
              
              {/* タイトル＆説明 */}
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm sm:text-[13px] md:text-sm text-slate-900 leading-snug font-serif">
                  思い出クイズに回答
                </h5>
                <p className="text-xs sm:text-[11px] md:text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  差出人が設定した思い出の質問に正解し、ご本人であることを証明します。
                </p>
              </div>
            </div>

            {/* フッター補足 */}
            <div className="pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-rose-850 font-bold flex items-center gap-1 font-sans">
              <span>✓ 秘密の共有記憶で照合</span>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="p-4 sm:p-3.5 md:p-4.5 rounded-2xl bg-white/95 border border-rose-200/80 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all text-left flex flex-col justify-between space-y-3 group">
            <div className="space-y-2.5">
              {/* カード上部：STEPバッジ & 価格バッジ */}
              <div className="flex items-center justify-between gap-2 border-b border-rose-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100/90 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200/80 group-hover:scale-105 transition-transform">
                    <Mail size={16} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs font-sans">
                    STEP 03
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-orange-900 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 shrink-0 font-sans">
                  600円〜
                </span>
              </div>
              
              {/* タイトル＆説明 */}
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm sm:text-[13px] md:text-sm text-slate-900 leading-snug font-serif">
                  手紙開封・連絡先受取
                </h5>
                <p className="text-xs sm:text-[11px] md:text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  手紙本文を開封し、差出人のLINEやSNS・連絡先を受け取って直接つながれます。
                </p>
              </div>
            </div>

            {/* フッター補足 */}
            <div className="pt-2 border-t border-slate-100 text-[10px] sm:text-[11px] text-rose-850 font-bold flex items-center gap-1 font-sans">
              <span>✓ 全額自動返金保証付</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 【セキュリティ保証バッジ帯】ReMEETsが約束する 3つの安心・安全保証（上品で落ち着いたブルー調） */}
      <div className="bg-gradient-to-br from-sky-100/90 via-blue-100/70 to-indigo-100/60 border border-sky-300/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-xs md:text-sm font-extrabold text-sky-950 tracking-wide">
              安心をお約束する ReMEETs セキュリティ＆公式保証
            </h4>
          </div>
          <span className="text-[11px] font-bold text-sky-900 bg-white/95 px-2.5 py-0.5 rounded-full border border-sky-300/80 shrink-0 self-start sm:self-auto shadow-2xs">
            🛡️ 厳格な安全基準に準拠
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* 保証1 */}
          <div className="bg-white/95 p-4 rounded-xl border border-sky-200/70 shadow-2xs hover:border-sky-400 transition-colors space-y-2 text-left">
            <div className="border-b border-sky-200/70 pb-1.5">
              <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                第三者覗き見防止
              </h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              正解者以外には手紙本文・連絡先は一切開示されず、暗号化で保護されます。
            </p>
          </div>

          {/* 保証2 */}
          <div className="bg-white/95 p-4 rounded-xl border border-sky-200/70 shadow-2xs hover:border-sky-400 transition-colors space-y-2 text-left">
            <div className="border-b border-sky-200/70 pb-1.5">
              <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                eKYCによる身元確認
              </h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              なりすましや悪質なストーカー・営業行為を未然に徹底遮断します。
            </p>
          </div>

          {/* 保証3 */}
          <div className="bg-white/95 p-4 rounded-xl border border-sky-200/70 shadow-2xs hover:border-sky-400 transition-colors space-y-2 text-left">
            <div className="border-b border-sky-200/70 pb-1.5">
              <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                全額自動返金保証
              </h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              万が一審査不合格や照合不一致の場合は、手数料を即時全額自動返金します。
            </p>
          </div>
        </div>
      </div>

      {/* 4. アクション導線（上部ボタンと同サイズ・同タイトルのワイドCTA） */}
      {onStartQuiz && (
        <div className="pt-2">
          <button
            onClick={onStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/30 group"
          >
            <Unlock size={18} className="text-emerald-200 group-hover:rotate-12 transition-transform" />
            <span className="tracking-wide">思い出の質問に答えて手紙を開く</span>
            <ArrowRight size={16} className="text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] text-slate-500 text-center font-sans mt-2">
            ※ 会員登録不要ですぐにお答えいただけます（不正利用防止のため暗号化保護されています）。
          </p>
        </div>
      )}
    </div>
  );
};

export const RevealContactModal = ({ 
  isOpen, 
  onClose, 
  postId, 
  searcherName, 
  searcherFullName, 
  onRevealed 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  postId: number | string, 
  searcherName: string, 
  searcherFullName?: string, 
  onRevealed: (contactData: any) => void 
}) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [unlockMessage, setUnlockMessage] = useState('');
  const [unlockContactInfo, setUnlockContactInfo] = useState('');
  const [payCardNumber, setPayCardNumber] = useState('4242 4242 4242 4242');
  const [payCardExpiry, setPayCardExpiry] = useState('12/28');
  const [payCardCvc, setPayCardCvc] = useState('123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isReadyToProceed, setIsReadyToProceed] = useState(false);
  const [pendingResultData, setPendingResultData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [revealedResult, setRevealedResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // 確実に postId を解決
  const resolvedPostId = postId || (() => {
    try {
      const match = window.location.pathname.match(/\/post\/(\d+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  })();

  const fillTestCard = () => {
    setPayCardNumber('4242 4242 4242 4242');
    setPayCardExpiry('12/28');
    setPayCardCvc('123');
    setErrorMessage('');
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPayCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setPayCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setPayCardExpiry(raw);
    }
  };

  const handleRevealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedPostId) {
      setErrorMessage('手紙のIDが特定できませんでした。ページを再読み込みしてください。');
      return;
    }

    setIsSubmitting(true);
    setIsReadyToProceed(false);
    setPendingResultData(null);
    setRevealProgress(0);
    setErrorMessage('');

    // アニメーション進行タイマー（人間が視認しやすいテンポで確実な進捗可視化）
    let curProgress = 0;
    let apiDone = false;
    let apiData: any = null;

    const progressTimer = setInterval(() => {
      // 進行スピード：滑らかにステップを進める
      if (curProgress < 30) {
        curProgress += 4;
      } else if (curProgress < 60) {
        curProgress += 3;
      } else if (curProgress < 85) {
        curProgress += 3;
      } else if (curProgress < 95) {
        curProgress += apiDone ? 3 : 1;
      } else if (apiDone && curProgress < 100) {
        curProgress += 2;
      }

      if (curProgress > 95 && !apiDone) {
        curProgress = 95; // API応答待機
      }
      if (curProgress > 100) curProgress = 100;
      setRevealProgress(curProgress);

      if (curProgress >= 100 && apiDone) {
        clearInterval(progressTimer);
        setRevealProgress(100);
        setIsSubmitting(false);
        onRevealed(apiData);
        onClose();
      }
    }, 85);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/posts/${resolvedPostId}/reveal-contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          unlockMessage, 
          unlockContactInfo,
          cardNumber: payCardNumber.replace(/\s/g, ''),
          cardExpiry: payCardExpiry,
          cardCvc: payCardCvc,
          amount: 600
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        clearInterval(progressTimer);
        setIsSubmitting(false);
        setIsReadyToProceed(false);
        setErrorMessage(data.error || '開示手続き処理に失敗しました。もう一度お試しください。');
        return;
      }

      apiDone = true;
      apiData = data;

      // すでに進捗が100%に近い、または到達した場合は即座に本体画面へ引き渡して閉じる
      if (curProgress >= 95) {
        curProgress = 100;
        setRevealProgress(100);
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsSubmitting(false);
          onRevealed(data);
          onClose();
        }, 200);
      }
    } catch (err) {
      console.error('Reveal error:', err);
      clearInterval(progressTimer);
      setIsSubmitting(false);
      setIsReadyToProceed(false);
      setErrorMessage('通信エラーが発生しました。ネットワーク環境をご確認の上、再度お試しください。');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
        data-lenis-prevent
      >
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSubmitting) {
              onClose();
            }
          }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-2xl my-auto max-h-[88vh] md:max-h-[85vh] flex flex-col overflow-y-auto overscroll-contain space-y-6 z-10 font-sans"
          data-lenis-prevent
        >
          <button 
            onClick={() => {
              if (!isSubmitting) {
                onClose();
              }
            }} 
            disabled={isSubmitting}
            className="absolute top-5 right-5 text-zinc-400 hover:text-black z-20 cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>

          {/* 🌟 決済完了後の成功画面 */}
          {revealedResult ? (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center mx-auto ring-4 ring-emerald-100">
                  <Sparkles size={32} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="pt-1 pb-1">
                    <ReunionEffectTitle effectType="pure-rainbow-flow" className="text-2xl sm:text-3xl md:text-4xl" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-800 pt-0.5">
                    【{revealedResult.searcherFullName || searcherFullName || revealedResult.searcherName || searcherName}】さんと繋がりました
                  </h3>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-md mx-auto">
                  止まっていた大切な思い出の時間が、ここから再び動き出します。以下の直通連絡先またはマイアカウントからいつでも直接お返事をお送りいただけます。
                </p>
              </div>

              {/* 手紙本文 & 開示された連絡先カード */}
              <div className="p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/80 border-2 border-emerald-300 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-2 bg-white/90 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>💌 差出人からのメッセージ全文</span>
                    <span className="text-emerald-700 font-serif font-bold">開示完了</span>
                  </div>
                  <p className="text-sm font-serif text-slate-900 leading-relaxed font-medium">
                    「{revealedResult.message || '大切なメッセージ'}」
                  </p>
                  <div className="text-right text-xs font-serif text-slate-500">
                    — {revealedResult.searcherFullName || searcherFullName || revealedResult.searcherName || searcherName} より
                  </div>
                </div>

                <div className="space-y-2 pt-1 font-sans">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <MessageCircle size={15} className="text-emerald-600" />
                      開示された連絡先 ({revealedResult.contactType?.toUpperCase() || 'SNS'}):
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">直通連絡先</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3 bg-white border border-emerald-300 rounded-xl font-mono text-sm md:text-base text-slate-900 font-bold select-all shadow-inner">
                    <span className="break-all text-emerald-950">{revealedResult.contactId}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(revealedResult.contactId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                      className="shrink-0 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                    >
                      {copied ? 'コピー完了！' : 'IDをコピー'}
                    </button>
                  </div>

                  {revealedResult.contactNote && (
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1 bg-white/60 p-2 rounded-lg border border-emerald-100">
                      <span className="font-bold text-slate-700">メモ: </span>{revealedResult.contactNote}
                    </p>
                  )}
                </div>
              </div>

              {/* マイアカウントまたはページ遷移CTA */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/account');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-emerald-400/30"
                >
                  <UserIcon size={16} />
                  <span>マイアカウントで手紙・連絡先を確認する →</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  手紙詳細ページで確認する
                </button>
              </div>
            </div>
          ) : isSubmitting ? (
            /* ⏳ 進行状況の可視化画面（eKYCと同様のハイテク進捗プログレスバー＆ステップ表示） */
            <div className="space-y-6 text-center py-4 animate-fade-in font-sans">
              {/* レーダースキャン風アニメーションサークル */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {isReadyToProceed ? (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white z-10 animate-bounce">
                      <Sparkles size={36} />
                    </div>
                    <div className="absolute -bottom-2 bg-emerald-700 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-200" />
                      <span>COMPLETED</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-60" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-pulse" />
                    <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white z-10">
                      <CreditCard size={36} className="animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 bg-emerald-600 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                      <RefreshCw size={10} className="animate-spin" />
                      <span>PROCESSING</span>
                    </div>
                  </>
                )}
              </div>

              {/* ステータスタイトル */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif font-bold tracking-wider shadow-2xs">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>{isReadyToProceed ? '手紙開示・決済トランザクション照合完了' : '手紙開示・決済トランザクション処理中'}</span>
                </div>
                <h3 className="text-base md:text-lg font-serif font-bold text-slate-900 pt-1">
                  {!isReadyToProceed && revealProgress < 25 && '1. Stripeセキュア決済サーバーへ接続中...'}
                  {!isReadyToProceed && revealProgress >= 25 && revealProgress < 50 && '2. 256-bit SSL暗号化決済トランザクション照合中...'}
                  {!isReadyToProceed && revealProgress >= 50 && revealProgress < 75 && '3. 想い出の手紙・封印メッセージ復号化中...'}
                  {!isReadyToProceed && revealProgress >= 75 && revealProgress < 100 && '4. 直通連絡先（LINE/メール）開示キー発行中...'}
                  {isReadyToProceed && '✨ 決済＆手紙開示手続きが完了しました！'}
                </h3>
              </div>

              {/* プログレスバー本体（虹色グラデーション＆パーセンテージ） */}
              <div className="space-y-2 px-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <Lock size={12} /> 256bit 暗号化安全通信
                  </span>
                  <span className="text-emerald-700 font-extrabold font-mono text-sm tracking-wider">
                    {revealProgress} %
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-4 rounded-full p-0.5 shadow-inner border border-slate-200 relative overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-200 relative shadow-sm" 
                    style={{ width: `${revealProgress}%` }}
                  >
                    {/* バー先端のLED光彩ノード */}
                    {revealProgress > 0 && revealProgress < 100 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.9)] z-10" />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* 4ステップ進行タイムライン */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs font-sans max-w-md mx-auto shadow-2xs">
                {/* Step 1 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 0 && revealProgress < 25 ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : revealProgress >= 25 ? 'text-slate-400 font-medium' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress >= 25 ? '✓' : '1'}
                    </span>
                    <span>Stripe決済サーバー接続 ＆ カード照合</span>
                  </span>
                  {revealProgress < 25 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">処理中...</span>}
                  {revealProgress >= 25 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>

                {/* Step 2 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 25 && revealProgress < 50 ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : revealProgress >= 50 ? 'text-slate-400 font-medium' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress >= 50 ? '✓' : '2'}
                    </span>
                    <span>256bit SSL暗号化決済トランザクション確認</span>
                  </span>
                  {revealProgress >= 25 && revealProgress < 50 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">確認中...</span>}
                  {revealProgress >= 50 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>

                {/* Step 3 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 50 && revealProgress < 75 ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : revealProgress >= 75 ? 'text-slate-400 font-medium' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress >= 75 ? '✓' : '3'}
                    </span>
                    <span>想い出の手紙本文・封印メッセージの復号化</span>
                  </span>
                  {revealProgress >= 50 && revealProgress < 75 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">復号中...</span>}
                  {revealProgress >= 75 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>

                {/* Step 4 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 75 && !isReadyToProceed ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress === 100 ? '✓' : '4'}
                    </span>
                    <span>直通連絡先開示キー発行 ＆ 再会確定</span>
                  </span>
                  {revealProgress >= 75 && revealProgress < 100 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">発行中...</span>}
                  {revealProgress === 100 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>
              </div>

              {/* 🎯 ユーザーがクリックして次に進むアクションボタン */}
              {isReadyToProceed ? (
                <div className="pt-2 animate-fade-in space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitting(false);
                      setIsReadyToProceed(false);
                      if (pendingResultData) {
                        setRevealedResult(pendingResultData);
                        onRevealed(pendingResultData);
                      }
                    }}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 font-sans"
                  >
                    <Heart size={16} className="fill-current text-rose-300 animate-pulse shrink-0" />
                    <span>【{searcherFullName || searcherName}】さんの手紙を開封する →</span>
                  </button>
                  <p className="text-[11px] text-slate-500 font-sans">
                    ※ ボタンをクリックすると手紙本文と開示された連絡先の詳細画面へ進みます
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-sans">
                  安全に暗号化通信で処理を行っています。このまま少々お待ちください...
                </p>
              )}
            </div>
          ) : (
            /* 💳 決済フォーム画面 */
            <div className="space-y-4">
              {/* ① 上部: 手紙開封対象 ＆ お支払い金額サマリー枠 */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-slate-50 rounded-2xl border-2 border-teal-300/80 text-left space-y-3.5 shadow-2xs font-sans">
                <div className="flex items-center justify-between gap-2 border-b border-teal-200/70 pb-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs font-serif">
                      ✉️
                    </span>
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">手紙開封手続き</span>
                      <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
                        【{searcherName || '差出人'}】さんからの手紙を開封する
                      </h3>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-teal-800 text-[11px] font-bold border border-teal-200/80 shadow-2xs font-sans">
                    <ShieldCheck size={13} className="text-teal-600 shrink-0" />
                    <span>Stripe暗号化決済</span>
                  </div>
                </div>

                {/* お支払い金額 */}
                <div className="flex items-center justify-between gap-2 bg-white/95 p-3 sm:p-3.5 rounded-xl border border-teal-200/80 text-xs shadow-2xs flex-wrap">
                  <span className="text-slate-600 font-bold">お支払い金額:</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-serif">
                    手紙開示・接続手数料: <strong className="text-teal-800 text-base sm:text-lg font-extrabold font-mono">600</strong> 円<span className="text-xs text-slate-500 font-sans ml-1">（税込・買い切り）</span>
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-sans">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRevealSubmit} className="space-y-4">
                {/* ② 下部: クレジットカード決済入力枠 */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-left font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock size={14} className="text-teal-700" />
                      <span>クレジットカード情報の入力</span>
                    </span>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer font-sans shadow-2xs active:scale-95"
                    >
                      ⚡ テスト情報自動入力
                    </button>
                  </div>

                  <CreditCardPaymentForm
                    cardNumber={payCardNumber}
                    cardExpiry={payCardExpiry}
                    cardCvc={payCardCvc}
                    onCardNumberChange={handleCardNumberChange}
                    onCardExpiryChange={setPayCardExpiry}
                    onCardCvcChange={setPayCardCvc}
                    showDemoButton={false}
                    refundGuaranteeText="お相手との連絡先開示手続きは、Stripe暗号化通信により安全に保護されます。"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-75 disabled:cursor-not-allowed font-sans border border-emerald-400/30"
                >
                  <Heart size={18} className="fill-current text-rose-300" />
                  <span>600円で【{searcherName || '差出人'}】さんの手紙と連絡先を開く</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const SuccessModal = ({ 
  isOpen, 
  onClose, 
  searcherName, 
  searcherFullName, 
  message, 
  onStartEkyc, 
  onOpenRevealModal,
  isAlreadyVerified,
  username
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  searcherName: string, 
  searcherFullName?: string, 
  message: string, 
  onStartEkyc?: () => void, 
  onOpenRevealModal?: () => void,
  isAlreadyVerified?: boolean,
  username?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(true);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
          data-lenis-prevent
        >
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/85 backdrop-blur-md cursor-pointer"
          />
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white rounded-[28px] md:rounded-[36px] shadow-2xl p-5 sm:p-6 md:p-8 space-y-5 my-auto max-h-[88vh] md:max-h-[85vh] flex flex-col overflow-y-auto overscroll-contain z-10"
            data-lenis-prevent
          >
            {/* 背景イラスト（合致する心と光の演出） */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none">
              <div className="relative w-full h-full opacity-30">
                <img 
                  src={quizMatchHearts} 
                  alt="心が通い合う光" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/20 to-white" />
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brand-dark/40 hover:text-brand-dark transition-colors z-30 cursor-pointer rounded-full hover:bg-slate-100/80 bg-white/60 backdrop-blur-xs"
              aria-label="閉じる"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 space-y-5 text-left font-sans">
              {/* シンプルで力強いヘッダー */}
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-extrabold border border-emerald-300">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  <span>思い出の鍵が解かれました！</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-extrabold tracking-tight leading-snug">
                  「{searcherName || '差出人'}」さんからの手紙
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  二人の記憶が一致し、あなた宛てに大切なお手紙が届いています。
                </p>
              </div>

              {/* 手続き完了後に安全に開示される3大内容（大きく認知できる独立リッチカード） */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 rounded-2xl border-2 border-emerald-300/80 space-y-3.5 shadow-sm text-left">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>お手続き完了後に安全に開示される 3大情報</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    思い出の質問 照合完了
                  </span>
                </div>

                {/* 3つの大きな独立カード */}
                <div className="space-y-2.5">
                  {/* 1. 差出人の実名（フルネーム）の開示 */}
                  <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-base font-bold shadow-2xs">
                        👤
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>差出人の実名（フルネーム）の開示</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          公的本人確認（eKYC）に基づく確実な本名を開示
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                      <Lock size={12} className="text-emerald-600" />
                      <span>完了後に開示</span>
                    </span>
                  </div>

                  {/* 2. 手紙の全文とエピソードを開封 */}
                  <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-base font-bold shadow-2xs">
                        💌
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>手紙の全文とエピソードを開封</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          あなた宛てに届いた大切な手紙の全文・思い出メッセージ
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                      <Lock size={12} className="text-emerald-600" />
                      <span>完了後に開示</span>
                    </span>
                  </div>

                  {/* 3. お相手の連絡先（LINE・メール等） */}
                  <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 text-base font-bold shadow-2xs">
                        📱
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>お相手の連絡先（LINE・メール等）</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          ワンタップで連絡できる直通IDと専用アクションボタン
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                      <Lock size={12} className="text-indigo-600" />
                      <span>完了後に開示</span>
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed pt-0.5">
                  ※ 手紙を読み、お相手と直接連絡を取り合うために、下記よりお手続きコースをお選びください。
                </p>
              </div>

              {/* 2つの手続きルート選択カード */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-200/80 pb-1.5">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>手紙の開封・連絡先受取のお手続き</span>
                    {isAlreadyVerified && (
                      <span className="ml-auto text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        基本誓約済み
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    思い出の質問の合致、おめでとうございます！<br />
                    ReMEETsでは、数年〜数十年ぶりの再会となるお相手に<strong>「本人の確証と安心」</strong>を届け、<strong>初回の返信率を最大化</strong>するため、<strong>公的身分証（eKYC）認証による証明バッジの取得を第一におすすめ</strong>しております。
                  </p>
                </div>

                {/* 2つのプラン並列比較カード */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {/* 左：【第一推奨・メイン】公的身分証（eKYC）認証 ＋ 手紙開封・連絡先受取 */}
                  <div className="relative p-4 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/80 border-2 border-indigo-500/80 rounded-2xl space-y-3 shadow-md flex flex-col justify-between hover:border-indigo-600 transition-all">
                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10.5px] font-extrabold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-300" />
                      <span>【第一推奨】安心・返信率大幅UP</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                        <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-indigo-600" />
                          <span>公的身分証 (eKYC) 認証コース</span>
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-700 font-sans">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span><strong>公的証明バッジ</strong>でお相手の警戒心を解除</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span>お相手からの<strong>初回返信率が格段に向上</strong></span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span>手紙全文の開封 ＆ 直通連絡先の受け取り</span>
                        </li>
                      </ul>

                      <div className="p-2 bg-indigo-100/60 rounded-lg space-y-1 text-[11px] text-indigo-950 font-medium">
                        <div className="flex justify-between items-center">
                          <span>① 公的身分証（eKYC）審査</span>
                          <span className="font-bold">600円（税込）</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>② 手紙開封 ＆ 連絡先受取</span>
                          <span className="font-bold">600円（税込）</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-indigo-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-600 font-bold">合計総額（買い切り）</span>
                        <div className="text-xl font-extrabold text-indigo-700">
                          1,200<span className="text-xs font-bold text-slate-700 ml-0.5">円（税込）</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onStartEkyc) {
                            onStartEkyc();
                          } else {
                            onClose();
                          }
                        }}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <ShieldCheck size={16} />
                        <span>公的証明バッジを取得して開封（600円 税込）</span>
                      </button>
                    </div>
                  </div>

                  {/* 右：【シンプル】手紙開封・連絡先受取のみ */}
                  <div className="p-4 bg-white border-2 border-slate-200/90 rounded-2xl space-y-3 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>手紙開封・連絡先受取のみコース</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          最低限の費用
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-600 font-sans">
                        <li className="flex items-start gap-1.5">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>手紙全文の開封 ＆ 直通連絡先の受け取り</span>
                        </li>
                        <li className="flex items-start gap-1.5 text-slate-500">
                          <span className="text-slate-400 shrink-0 mt-0.5">※</span>
                          <span>公的身分証バッジは付与されません（後からの取得も可能）</span>
                        </li>
                      </ul>

                      <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-700 font-medium">
                        <div className="flex justify-between items-center">
                          <span>① 本人確認（基本誓約）</span>
                          <span className="font-bold text-emerald-700">0円（無料）</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>② 手紙開封 ＆ 連絡先受取</span>
                          <span className="font-bold">600円（税込）</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-600 font-bold">合計総額（買い切り）</span>
                        <div className="text-xl font-extrabold text-slate-900">
                          600<span className="text-xs font-bold text-slate-700 ml-0.5">円（税込）</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenRevealModal) {
                            onOpenRevealModal();
                          } else {
                            onClose();
                          }
                        }}
                        className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-xs hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Heart size={16} className="text-rose-300" />
                        <span>公的バッジなしで手紙を開封（600円）</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 明瞭会計の安心ポリシー */}
                <div className="p-3 bg-slate-100/90 rounded-xl text-[11px] text-slate-600 space-y-1 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                    <span>ReMEETsの安心・明瞭会計のお約束</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[10.5px]">
                    <li>月額費用や上記以外の追加課金は一切発生いたしません。</li>
                    <li>万が一、本人確認審査に不合格となった場合、または手紙が開示されなかった場合は<strong>Stripeより決済代金を全額自動返金</strong>いたします。</li>
                  </ul>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium underline underline-offset-2 cursor-pointer"
                  >
                    手紙詳細ページに戻る
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const AgeVerificationGate = ({ onVerified, onStartEkyc }: { onVerified: () => void; onStartEkyc?: () => void }) => {
  const [method, setMethod] = useState<'pledge' | 'ekyc' | null>('ekyc');
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const verifyPledge = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/log-pledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : ""
        },
        body: JSON.stringify({ method: 'pledge', agreement1: true, agreement2: true, agreement3: true })
      });
      if (res.ok) {
        setStatus('success');
        setIsVerifying(false);
        setTimeout(onVerified, 1000);
      } else {
        const data = await res.json();
        alert(data.error || "手続き中にエラーが発生しました。");
        setIsVerifying(false);
      }
    } catch (err) {
      console.error(err);
      setStatus('success');
      setIsVerifying(false);
      setTimeout(onVerified, 1000);
    }
  };

  return (
    <div className="space-y-5 relative overflow-hidden bg-slate-50/90 p-5 md:p-6 rounded-[28px] border border-slate-200/90 font-sans shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 shrink-0 font-bold shadow-inner">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block font-sans">18歳以上・安全利用の確認</span>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 font-sans">確認・認証方式の選択</h3>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          法令（18歳未満保護）に基づき、18歳以上（高校生不可）であることを確認します。ご希望の確認方法を以下のカードからお選びください。
        </p>
      </div>

      {/* 左右2カラムの明確な方式選択カードボタン */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-stretch">
        {/* 方式Aカード: 公的身分証承認 (eKYC) */}
        <button
          type="button"
          onClick={() => {
            setMethod('ekyc');
            if (onStartEkyc) {
              onStartEkyc();
            }
          }}
          className={cn(
            "w-full sm:w-[68%] p-4 rounded-2xl text-left transition-all relative border-[3px] flex flex-col justify-between cursor-pointer space-y-3 shadow-sm hover:shadow-md hover:scale-[1.005] active:scale-[0.99]",
            method === 'ekyc'
              ? "bg-indigo-50/40 border-indigo-500 shadow-md ring-4 ring-indigo-500/20"
              : "bg-white border-slate-300 hover:border-indigo-400"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                method === 'ekyc' ? "bg-indigo-100 text-indigo-800" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              )}>
                方式 A（おすすめ）
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                認証: 600円（総額: 1,200円）
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <UserCheck size={18} className={method === 'ekyc' ? "text-indigo-600" : "text-indigo-500"} />
              <span>公的身分証承認（eKYC）</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              免許証・マイナンバー等で厳格確認。差出人へ「本人証明」が届き、信頼性が最大化されます。<span className="text-indigo-900 font-bold block pt-0.5">※本人確認(600円)＋手紙開封(600円)＝総額1,200円</span>
            </p>
          </div>

          <div className={cn(
            "pt-2 border-t text-[11px] font-bold flex items-center justify-between",
            method === 'ekyc' ? "border-indigo-200 text-indigo-800" : "border-slate-200 text-slate-500"
          )}>
            <span>👑 差出人からの信頼・返信率重視</span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
              {method === 'ekyc' ? '選択中 ✓' : 'タップして選択'}
            </span>
          </div>
        </button>

        {/* 方式Bカード: 登録時誓約を適用（無料・ワンタップ完了） */}
        <button
          type="button"
          onClick={() => setMethod('pledge')}
          disabled={isVerifying || status === 'success'}
          className={cn(
            "w-full sm:w-[35%] p-4 rounded-2xl text-left transition-all relative border-[3px] flex flex-col justify-between cursor-pointer space-y-3 shadow-sm hover:shadow-md hover:scale-[1.005] active:scale-[0.99]",
            method === 'pledge'
              ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-4 ring-emerald-500/20"
              : "bg-white border-slate-300 hover:border-emerald-400"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                method === 'pledge' ? "bg-emerald-100 text-emerald-800" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              )}>
                方式 B（無料）
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                認証: 0円（総額: 600円）
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 size={18} className={method === 'pledge' ? "text-emerald-600" : "text-emerald-500"} />
              <span>登録時誓約を適用（無料）</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              アカウント登録時に同意済みの利用規約・18歳以上誓約をそのまま適用。<span className="text-emerald-800 font-bold block pt-0.5">※本人確認0円＋手紙開封(600円)＝総額600円のみ</span>
            </p>
          </div>

          <div className={cn(
            "pt-2 border-t text-[11px] font-bold flex items-center justify-between",
            method === 'pledge' ? "border-emerald-200 text-emerald-800" : "border-slate-200 text-slate-500"
          )}>
            <span>⚡ 無料で手軽に</span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              {method === 'pledge' ? '選択中 ✓' : 'タップして選択'}
            </span>
          </div>
        </button>
      </div>

      {/* 方式B: 登録時誓約適用 コンテンツ */}
      {method === 'pledge' && (
        <div className="space-y-4 pt-1 animate-fade-in bg-white p-4 md:p-5 rounded-2xl border border-emerald-300 shadow-sm">
          {status === 'success' ? (
            <div className="p-3.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm shadow-md animate-bounce">
              <Check size={18} />
              <span>登録時の年齢・利用誓約を適用しました！次の手続きへ進みます...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs md:text-sm border-b border-emerald-100 pb-2">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>アカウント登録時に同意・誓約済みの内容（適用確認）</span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">1. 18歳以上（高校生を除く）の確認</span>
                    <span className="text-[11px] text-slate-600">出会い系サイト規制法に基づき、18歳以上であることを登録時に誓約済みです。</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">2. 目的制限（非出会い目的）</span>
                    <span className="text-[11px] text-slate-600">不特定多数との出会い・ナンパ目的ではなく、旧友や思い出の相手との再会・感謝目的で利用します。</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">3. マナー順守・禁止行為の同意</span>
                    <span className="text-[11px] text-slate-600">危害、脅迫、ストーキング、営業・勧誘等の不適切行為を行わないことを遵守します。</span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button 
                  type="button"
                  onClick={verifyPledge}
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer border border-emerald-400/30"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      <span>登録済み誓約を適用中...</span>
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>上記誓約をそのまま適用して次へ進む</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 方式A: 公的身分証 eKYC コンテンツ */}
      {method === 'ekyc' && (
        <div className="space-y-4 pt-1 animate-fade-in font-sans">
          <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-indigo-50/90 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
              <p className="font-extrabold text-sm text-indigo-950 flex items-center gap-1.5">
                <UserCheck size={18} className="text-indigo-600 shrink-0" />
                <span>公的身分証（eKYC）認証を選ぶ4つの決定的なメリット</span>
              </p>
            </div>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>公的認証バッジが付与</strong>され、差出人が「本物の旧友」だと即座に確信できます。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>不信感やなりすまし懸念が解消され、<strong>初回のお返事到達率が大幅に向上</strong>します。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>審査通過後は手紙本文と連絡先（LINE/メール等）が<strong>即座に完全開示</strong>されます。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>万が一審査に不合格となった場合は<strong>決済代金全額が自動返金</strong>されます。</span>
              </li>
            </ul>
            <p className="text-[11px] text-indigo-800 font-medium pt-1 border-t border-indigo-200/60">
              ※ 対応書類: 運転免許証・マイナンバーカード・パスポート等（提出画像は暗号化通信で即時照合され安全です）
            </p>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-indigo-200/80 shadow-sm">
            <button 
              type="button"
              onClick={() => {
                if (onStartEkyc) {
                  onStartEkyc();
                } else {
                  alert("eKYC手続き画面を開きます。");
                }
              }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 border border-transparent transition-all flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer"
            >
              <UserCheck size={18} />
              <span>公的身分証（eKYC）認証手続きへ進む</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ComplianceBanner = () => (
  <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-start gap-3">
    <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-red-700 leading-tight">
        【出会い系サイト規制法に基づく警告】
      </p>
      <p className="text-[10px] text-red-600/80 leading-relaxed font-serif">
        本サービスにおける児童買春、児童ポルノ、性的な出会いを目的とした勧誘・投稿は固く禁じられています。
        利用規約に反する行為を確認した場合、事前の通知なくアカウントを凍結し、アクセスログを含む情報を警察へ通報します。
      </p>
    </div>
  </div>
);



export const ReportModal = ({ 
  isOpen, 
  onClose, 
  targetType, 
  targetId,
  targetName,
  targetSummary
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  targetType: 'post' | 'user'; 
  targetId: number;
  targetName?: string;
  targetSummary?: string;
}) => {
  const [reason, setReason] = useState('');
  const [reportType, setReportType] = useState('inappropriate');
  const [contactInfo, setContactInfo] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [postDetail, setPostDetail] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && targetType === 'post' && targetId) {
      fetch(`/api/posts/${targetId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setPostDetail(data);
        })
        .catch(err => console.error('Failed to load post for report modal:', err));
    }
  }, [isOpen, targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reportType, reason, contactInfo })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || '通報を正常に受け付けました。運営監視チームが内容を確認し迅速に対処いたします。');
        setTimeout(onClose, 2500);
      } else {
        setStatus('error');
        setMessage(data.error || '通報の送信に失敗しました。');
      }
    } catch (err) {
      setStatus('error');
      setMessage('通信エラーが発生しました。しばらく経ってから再度お試しください。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 overflow-y-auto font-sans" data-lenis-prevent>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass-card w-full max-w-lg relative z-10 p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl my-auto text-left"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-150 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block font-sans">
              Safety & Content Moderation
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-tight">
              不適切なコンテンツ・違反の通報
            </h2>
          </div>
        </div>

        {/* 対象の自動読み込み・情報バナー */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 space-y-1.5 text-xs font-sans">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>通報対象: {targetType === 'post' ? '手紙（ボトルメール）' : 'ユーザーアカウント'}</span>
            </span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
              ID: #{targetId}
            </span>
          </div>
          {(postDetail || targetName || targetSummary) && (
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-2 pt-0.5 border-t border-slate-200/60 mt-1">
              宛先: <strong className="text-slate-850">{targetName || postDetail?.target_name || '宛先指定'} 様</strong> 
              {postDetail?.era && ` (${postDetail.era}年代)`}
              {postDetail?.searcher_profile && ` - 「${postDetail.searcher_profile}」`}
            </p>
          )}
        </div>

        {status === 'success' ? (
          <div className="text-center py-8 space-y-4 font-sans">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">通報を受理いたしました</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onClose} 
              className="btn-primary py-2 px-6 text-xs bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold mt-2"
            >
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">通報の理由・区分（必須）</label>
              <select 
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-850 focus:outline-none focus:border-brand-primary"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
              >
                <option value="inappropriate">不適切な表現・不快な内容</option>
                <option value="privacy">個人情報・本名の無断掲載</option>
                <option value="harassment">嫌がらせ・誹謗中傷・脅迫</option>
                <option value="solicitation">性的勧誘・出会い目的・パパ活等</option>
                <option value="child_exploitation">未成年者・児童保護に関する懸念</option>
                <option value="spam">スパム・広告・詐欺行為</option>
                <option value="other">その他安全規約違反</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">詳細なご事情（必須）</label>
              <textarea 
                required
                rows={3}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-850 focus:outline-none focus:border-brand-primary leading-relaxed resize-none"
                placeholder="該当箇所の具体的な問題点や状況をご入力ください。"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">ご連絡用メールアドレス（任意）</label>
              <input 
                type="text"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-850 focus:outline-none focus:border-brand-primary"
                placeholder="調査結果や追加ヒアリングが必要な場合のみ使用します"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
              />
            </div>

            {/* 削除申請ページへの誘導案内 */}
            {targetType === 'post' && (
              <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl flex items-start gap-2.5 text-[11px] text-rose-900 leading-relaxed font-sans">
                <Trash2 size={15} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <span>ご自身に関する手紙の<strong>「完全削除・掲載停止」</strong>をご希望の場合は、</span>
                  <button 
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/deletion-request?id=${targetId}`);
                    }}
                    className="font-bold text-rose-700 underline hover:text-rose-900 ml-1 cursor-pointer"
                  >
                    削除依頼フォームはこちら →
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button 
                type="submit" 
                disabled={status === 'loading'} 
                className="w-2/3 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <RefreshCw className="animate-spin" size={15} />
                    <span>送信中...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={15} />
                    <span>通報を安全に送信</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};



