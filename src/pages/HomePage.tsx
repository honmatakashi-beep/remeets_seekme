import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, CheckCircle2,
  CreditCard, Heart, Lock, MapPin, Send, ShieldAlert,
  ShieldCheck, Sparkles, Image as ImageIcon, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, formatEraLabel, formatBirthYearLabel, getCategoryText, PREFECTURES } from '../lib/utils';
import { HomePageTestVariant } from '../components/HomePageTestVariant';
import { HomeVariantSub2Overlay } from '../components/HomeVariantSub2Overlay';
import { HomeVariantSub3Minimal } from '../components/HomeVariantSub3Minimal';
import { WaterRippleRainbowText } from '../components/WaterRippleRainbowText';
import stepMistWriteImg from '../assets/images/step_01_mist_ocean_close_1789154903956.jpg';
import stepMistDriftImg from '../assets/images/step_02_beach_arrival_1789155133509.jpg';
import stepMistReconnectImg from '../assets/images/step_03_mist_reconnect_1789154562729.jpg';
import heroBottleMail from '../assets/images/hero_small_ocean_no_bottle.jpg';
import { CreditCardPaymentForm } from '../components/CreditCardPaymentForm';
import { ConceptStoryModal } from '../components/ConceptStoryModal';
import { EkycExplanationModal } from '../components/posts/EkycExplanationModal';

export type HomeDesignMode = 'v2' | 'v1' | 'sub2' | 'sub3';

export const HomePage = ({ onOpenOnboarding }: { onOpenOnboarding?: () => void }) => {
  const [homeDesign, setHomeDesign] = useState<HomeDesignMode>(() => {
    return (localStorage.getItem('remeets_home_design') as HomeDesignMode) || 
           (localStorage.getItem('remeets_home_design_mode') as HomeDesignMode) || 
           'v2';
  });

  useEffect(() => {
    const handleDesignChange = () => {
      const current = (localStorage.getItem('remeets_home_design') as HomeDesignMode) || 
                      (localStorage.getItem('remeets_home_design_mode') as HomeDesignMode) || 
                      'v2';
      setHomeDesign(current);
    };
    window.addEventListener('home_design_changed', handleDesignChange);
    window.addEventListener('remeets_home_mode_changed', handleDesignChange);
    window.addEventListener('remeets_design_system_changed', handleDesignChange);
    window.addEventListener('storage', handleDesignChange);
    return () => {
      window.removeEventListener('home_design_changed', handleDesignChange);
      window.removeEventListener('remeets_home_mode_changed', handleDesignChange);
      window.removeEventListener('remeets_design_system_changed', handleDesignChange);
      window.removeEventListener('storage', handleDesignChange);
    };
  }, []);

  const toggleHomeDesign = () => {
    const sequence: HomeDesignMode[] = ['v2', 'v1', 'sub2', 'sub3'];
    const currentIndex = sequence.indexOf(homeDesign);
    const next = sequence[(currentIndex + 1) % sequence.length];
    setHomeDesign(next);
    localStorage.setItem('remeets_home_design', next);
    localStorage.setItem('remeets_home_design_mode', next);
    window.dispatchEvent(new Event('home_design_changed'));
    window.dispatchEvent(new CustomEvent('remeets_home_mode_changed', { detail: { mode: next } }));
  };

  const [showEkycModal, setShowEkycModal] = useState(false);
  const [ekycStep, setEkycStep] = useState(1); // 1: Info/Benefits, 2: Upload/Details, 3: Payment, 4: Processing, 5: Success
  const [payCardNumber, setPayCardNumber] = useState('');
  const [payCardExpiry, setPayCardExpiry] = useState('');
  const [payCardCvc, setPayCardCvc] = useState('');
  const [payCardName, setPayCardName] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [ekycDocType, setEkycDocType] = useState<'license' | 'mynumber' | 'passport'>('license');
  const [ekycProgress, setEkycProgress] = useState(0);
  const [ekycName, setEkycName] = useState('');
  const [ekycBirthdate, setEkycBirthdate] = useState('');
  const [ekycVerified, setEkycVerified] = useState(() => localStorage.getItem('ekyc_verified') === 'true');
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [showEkycExplanationModal, setShowEkycExplanationModal] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalReunions: 0, todayPosts: 0 });
  const [featuredStories, setFeaturedStories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        const res = await fetch('/api/success-stories/public?type=featured');
        if (res.ok) {
          const data = await res.json();
          setFeaturedStories(data);
        }
      } catch (err) {
        console.error('Failed to fetch featured success stories', err);
      }
    };
    fetchFeaturedStories();
  }, []);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await fetch('/api/public-stats');
        if (res.ok) {
          const data = await res.json();
          setShowStats(data.showHomeStats);
          setStats({
            totalUsers: data.totalUsers,
            totalReunions: data.totalReunions,
            todayPosts: data.todayPosts
          });
        }
      } catch (err) {
        console.error('Failed to fetch public stats', err);
      }
    };
    fetchPublicStats();
  }, []);

  useEffect(() => {
    if (isConceptModalOpen || showEkycModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isConceptModalOpen, showEkycModal]);

  useEffect(() => {
    let interval: any;
    if (ekycStep === 4) {
      setEkycProgress(0);
      interval = setInterval(() => {
        setEkycProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setEkycVerified(true);
            localStorage.setItem('ekyc_verified', 'true');
            window.dispatchEvent(new Event('ekyc_changed'));
            setEkycStep(5);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [ekycStep]);

  if (homeDesign === 'v2') {
    return (
      <>
        <HomePageTestVariant 
          onToggleDesign={toggleHomeDesign} 
          onOpenConceptModal={() => setIsConceptModalOpen(true)}
        />

        {/* Concept Story Modal (Vintage Deckle-Edged Letter) */}
        <ConceptStoryModal 
          isOpen={isConceptModalOpen} 
          onClose={() => setIsConceptModalOpen(false)} 
        />
      </>
    );
  }

  if (homeDesign === 'sub2') {
    return (
      <>
        <HomeVariantSub2Overlay
          onToggleDesign={toggleHomeDesign}
          onOpenConceptModal={() => setIsConceptModalOpen(true)}
        />

        {/* Concept Story Modal */}
        <ConceptStoryModal 
          isOpen={isConceptModalOpen} 
          onClose={() => setIsConceptModalOpen(false)} 
        />
      </>
    );
  }

  if (homeDesign === 'sub3') {
    return (
      <>
        <HomeVariantSub3Minimal
          onToggleDesign={toggleHomeDesign}
          onOpenConceptModal={() => setIsConceptModalOpen(true)}
        />

        {/* Concept Story Modal */}
        <ConceptStoryModal 
          isOpen={isConceptModalOpen} 
          onClose={() => setIsConceptModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 md:py-8 space-y-8 md:space-y-12">
      {/* Hero Section (探したい人への再会のボトルメールをつづるカード max-w-4xl に合わせた幅) */}
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-white via-slate-50/60 to-sky-50/30 p-4 sm:p-10 md:p-12 shadow-sm border-2 border-zinc-900/90 overflow-hidden text-center space-y-4 cursor-bottle-mail">
          
          {/* 内側の極細二重フレームライン */}
          <div className="absolute inset-2 sm:inset-3.5 rounded-[22px] sm:rounded-[28px] border border-zinc-800/80 pointer-events-none z-10" />
          <div className="absolute inset-3 sm:inset-5 rounded-[18px] sm:rounded-[24px] border border-dashed border-zinc-800/50 pointer-events-none z-10" />

          {/* 四隅のエレガントなボタニカル（唐草・葉・花の芽）SVGオーナメント */}
          <svg className="absolute top-2 left-2 w-12 h-12 text-zinc-900/90 pointer-events-none z-20" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
            <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
            <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
            <circle cx="28" cy="28" r="2" fill="currentColor" />
          </svg>

          <svg className="absolute top-2 right-2 w-12 h-12 text-zinc-900/90 pointer-events-none z-20 scale-x-[-1]" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
            <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
            <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
            <circle cx="28" cy="28" r="2" fill="currentColor" />
          </svg>

          <svg className="absolute bottom-2 left-2 w-12 h-12 text-zinc-900/90 pointer-events-none z-20 scale-y-[-1]" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
            <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
            <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
            <circle cx="28" cy="28" r="2" fill="currentColor" />
          </svg>

          <svg className="absolute bottom-2 right-2 w-12 h-12 text-zinc-900/90 pointer-events-none z-20 scale-[-1]" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
            <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
            <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
            <circle cx="28" cy="28" r="2" fill="currentColor" />
          </svg>

          {/* Hero Background Illustration (朝もやの広い大海原にポツンと漂う小さなボトルメール) */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none z-0">
            <div className="relative w-full max-w-2xl sm:max-w-3xl h-full flex items-center justify-center p-2 sm:p-0 transition-all duration-300 scale-90 sm:scale-75" style={{ opacity: 0.75 }}>
              <img 
                src={heroBottleMail} 
                alt="広い海にぽつんと漂うボトルメール" 
                className="w-full h-full max-h-full object-contain sm:object-cover object-center rounded-2xl transition-all duration-300"
              />
              {/* 上下左右の四方をグラデーションで自然になじませる */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/80 sm:from-white/70 sm:to-white/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/80 sm:from-white/60 sm:to-white/70" />
            </div>
          </div>

          <div className="relative z-10 space-y-3 sm:space-y-4">
            <span className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-[#3B627F] tracking-wider block leading-none select-none [text-rendering:geometricPrecision] antialiased">
              ReMEETs <span className="text-teal-700">SeekMe</span>
              <span className="block text-[8.5px] xs:text-[9.5px] sm:text-xs md:text-sm font-sans font-medium text-brand-primary/90 tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2 uppercase">
                〜私を探すあなたへ〜
              </span>
            </span>
            
            <div className="py-2 sm:py-4 flex flex-col items-center select-none text-center w-full max-w-2xl mx-auto px-1">
              <WaterRippleRainbowText 
                className="my-1" 
                lines={[
                  'あの日言えなかった想いを',
                  'あの人へ',
                  '完全非公開・安心の再会メッセージ'
                ]}
              />
              <div className="mt-3 sm:mt-4 w-20 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
            </div>

            <p className="text-sm md:text-base text-slate-800 font-serif font-medium max-w-2xl mx-auto leading-relaxed md:leading-loose pt-2.5 px-2 [text-rendering:geometricPrecision] antialiased">
              同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ伝えたい大切な想いを言葉にして預けておく。メッセージはインターネット上に一切公開されず、双方が一致した時だけ安全につながる、完全非公開のプライベート再会プラットフォームです。
            </p>

            <div className="flex justify-center pt-3 px-2 md:px-0 animate-fade-in w-full max-w-xl mx-auto">
              <button 
                type="button"
                id="concept_modal_trigger_btn"
                onClick={() => setIsConceptModalOpen(true)}
                className="group w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-white/90 backdrop-blur-xs text-brand-dark border border-zinc-300/80 rounded-full transition-all text-xs md:text-sm font-serif tracking-[0.1em] shadow-sm hover:shadow-[0_6px_22px_rgba(161,196,253,0.3)] hover:-translate-y-0.5 cursor-pointer duration-300 btn-hover-rainbow"
              >
                <span className="font-semibold text-brand-dark transition-colors duration-300 relative z-10">
                  想いが届く安心の再会システム
                </span>
              </button>
            </div>

            {/* 🛡️ 【安心の0円保証】預ける・保管・照合は完全無料の直感的可視化バッジ */}
            <div className="pt-2 max-w-xl mx-auto px-2">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-200/90 p-3 sm:p-4 shadow-sm text-left font-sans transition-all hover:shadow-md">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-900">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>ReMEETs SeekMe の安心料金ポリシー</span>
                  </div>
                  <Link 
                    to="/pricing" 
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/90 border border-emerald-300/80 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 group cursor-pointer"
                  >
                    <span>料金表・詳細を見る</span>
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Link 
                    to="/pricing"
                    className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60 hover:border-emerald-400/80 rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-xs group cursor-pointer"
                  >
                    <span className="text-[10px] text-emerald-800 font-bold group-hover:text-emerald-900 leading-tight">メッセージ作成<span className="hidden sm:inline">・</span><br className="sm:hidden" />登録</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 font-serif">完全0円</span>
                  </Link>
                  <Link 
                    to="/pricing"
                    className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60 hover:border-emerald-400/80 rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-xs group cursor-pointer"
                  >
                    <span className="text-[10px] text-emerald-800 font-bold group-hover:text-emerald-900 leading-tight">暗号化保管<span className="hidden sm:inline">・</span><br className="sm:hidden" />自動照合</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 font-serif">完全0円</span>
                  </Link>
                  <Link 
                    to="/pricing"
                    className="bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/60 hover:border-sky-400/80 rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-xs group cursor-pointer"
                  >
                    <span className="text-[10px] text-sky-900 font-bold group-hover:text-sky-950 leading-tight">相互承認<span className="hidden sm:inline">・</span><br className="sm:hidden" />再会成立時</span>
                    <span className="text-xs sm:text-sm font-black text-sky-700 font-serif">開通時のみ 600円</span>
                  </Link>
                </div>

                <div className="pt-2 text-center">
                  <Link 
                    to="/pricing"
                    className="text-[10px] text-slate-500 hover:text-emerald-700 transition-colors inline-flex items-center justify-center gap-1 leading-tight"
                  >
                    <span>※お相手とエピソードが合意・承認され、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Hero Action: Write & Deposit Message (メッセージを預けるメイン構造) */}
      <div className="max-w-4xl mx-auto space-y-6 relative z-10 font-sans">
        
        {/* Main Card: Write & Deposit Message */}
        <div id="write-letter-card" className="bg-gradient-to-br from-white via-[#faf9f6] to-[#f5f7f6] border border-slate-200/90 p-6 md:p-10 rounded-[32px] shadow-sm hover:shadow-md transition-all space-y-8">
          
          <div className="flex flex-col items-center text-center space-y-2 border-b border-brand-primary/15 pb-6">
            <span className="text-[10px] md:text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full font-sans inline-flex items-center gap-1.5">
              <Sparkles size={12} className="text-teal-600" />
              <span>メイン機能｜登録・暗号化保管 0円</span>
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-bold pt-1 text-center">
              <span className="animated-rainbow-text inline-block pb-0.5 [text-rendering:geometricPrecision] antialiased">
                逢いたい人へ、想い出のメッセージを預ける
              </span>
            </h3>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-sans pt-0.5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>完全非公開 / ネット上に晒されない安心設計 / いつでも推敲・削除可能</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs md:text-sm text-brand-dark/85 leading-relaxed text-center">
              同窓生、昔の友人、お世話になったあの人へ。連絡先は分からなくても、もう一度伝えたい大切な想いを言葉にして安全にシステムへ預けましょう。
            </p>

            <div className="pt-2">
              <Link 
                to="/create" 
                id="btn-send-bottle"
                className="w-full h-11 sm:h-13 bg-brand-dark hover:bg-[#1e4f7a] text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold font-sans tracking-normal text-center flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer group"
              >
                <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                <span>メッセージを届ける（無料）</span>
              </Link>
            </div>
          </div>

          {/* 3 Step Flow Guide for Sending */}
          <div className="pt-6 border-t border-brand-border/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-left">
              <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider block font-sans">
                完全非公開で「あの人」と再会する3つのステップ
              </span>
              <span className="text-[11px] text-slate-500 font-sans flex items-center gap-1 shrink-0">
                <Sparkles size={12} className="text-amber-500" />
                <span>安心・安全のシンプルな流れ</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 md:gap-4 text-xs font-sans">
              
              {/* Step 1 */}
              <div className="p-3.5 sm:p-3.5 md:p-4 bg-white/95 rounded-2xl border-2 border-emerald-500/80 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all duration-300 space-y-2.5 sm:space-y-3 flex flex-col justify-between group">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.22em] text-emerald-700/80 uppercase">STEP</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold tracking-wider text-emerald-600">01</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-serif font-bold bg-emerald-50 text-emerald-700 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200">【預ける】</span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-emerald-200 p-1 shadow-inner group-hover:border-emerald-400 transition-colors duration-300">
                    <img 
                      src={stepMistWriteImg} 
                      alt="メッセージを預ける" 
                      className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-900 text-xs sm:text-[13px] md:text-sm font-serif flex items-center gap-1.5 leading-snug">
                      <span>想い出を安全に登録</span>
                    </h5>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-sans">
                      お相手のお名前やゆかりの地、お二人だけのメッセージを安全に登録します（一般公開されません）。
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 sm:p-3.5 md:p-4 bg-white/95 rounded-2xl border-2 border-sky-500/80 hover:border-sky-600 shadow-xs hover:shadow-md transition-all duration-300 space-y-2.5 sm:space-y-3 flex flex-col justify-between group">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.22em] text-sky-700/80 uppercase">STEP</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold tracking-wider text-sky-600">02</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-serif font-bold bg-sky-50 text-sky-700 px-2 sm:px-2.5 py-0.5 rounded-full border border-sky-200">【照合】</span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-sky-200 p-1 shadow-inner group-hover:border-sky-400 transition-colors duration-300">
                    <img 
                      src={stepMistDriftImg} 
                      alt="安全に自動照合" 
                      className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-900 text-xs sm:text-[13px] md:text-sm font-serif flex items-center gap-1.5 leading-snug">
                      <span>システムが自動照合</span>
                    </h5>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-sans">
                      双方が登録した情報をもとに、システムがバックグラウンドで厳重に安全照合します。
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 sm:p-3.5 md:p-4 bg-white/95 rounded-2xl border-2 border-teal-500/80 hover:border-teal-600 shadow-xs hover:shadow-md transition-all duration-300 space-y-2.5 sm:space-y-3 flex flex-col justify-between group">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.22em] text-teal-700/80 uppercase">STEP</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold tracking-wider text-teal-600">03</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-serif font-bold bg-teal-50 text-teal-700 px-2 sm:px-2.5 py-0.5 rounded-full border border-teal-200">【再会】</span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-teal-200 p-1 shadow-inner group-hover:border-teal-400 transition-colors duration-300">
                    <img 
                      src={stepMistReconnectImg} 
                      alt="エピソード承認で再会" 
                      className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-900 text-xs sm:text-[13px] md:text-sm font-serif flex items-center gap-1.5 leading-snug">
                      <span>エピソード承認で開通</span>
                    </h5>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-sans">
                      届いたエピソードを確認して承認すると、本人確認を経てお互いの連絡先が開示されます。
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Miracle Stories Section */}
      <div className="space-y-8 py-8 border-t border-brand-border/40">
        <div className="flex items-end justify-between border-b border-brand-border pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.3em] font-sans block">
              Success Stories
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-wider">
              ReMEETs がつないだ奇跡の物語
            </h2>
            <p className="text-xs text-brand-dark/50 font-serif">
              ボトルメールが届き、この海で再び巡り合えた方々からの声。
            </p>
          </div>
          <Link to="/success-stories" className="text-xs text-brand-primary uppercase tracking-[0.2em] font-sans font-bold flex items-center gap-2 hover:underline shrink-0">
            <span>すべて見る</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4.5 md:gap-6">
          {(() => {
            const getCategoryBadge = (category: string, defaultTag?: string) => {
              switch (category) {
                case 'classmate':
                  return { label: '🏫 同級生', style: 'bg-amber-50 text-amber-900 border-amber-200' };
                case 'mentor':
                  return { label: '🌸 恩師・部活', style: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
                case 'journey':
                  return { label: '🧭 旅・一期一会', style: 'bg-teal-50 text-teal-900 border-teal-200' };
                case 'neighbor':
                  return { label: '🏡 幼馴染・ご近所', style: 'bg-rose-50 text-rose-900 border-rose-200' };
                case 'colleague':
                  return { label: '💼 元同僚・仲間', style: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
                case 'rival':
                  return { label: '⚽ 青春・ライバル', style: 'bg-sky-50 text-sky-900 border-sky-200' };
                default:
                  return { label: defaultTag || '✨ 再会の物語', style: 'bg-slate-100 text-slate-700 border-slate-200' };
              }
            };

            const defaultStories = [
              {
                id: 'def-1',
                category: "classmate",
                era: "1980年代後半",
                gender: "男性",
                tag: "🏫 同級生",
                title: "卒業から35年。懐かしいあだ名とお互いの記憶が繋いでくれた奇跡",
                message: "中学の卒業以来、お互いに転居が重なり連絡先が分からなくなっていました。ふとReMEETsで当時の陸上部のメッセージを見つけ、懐かしい想い出のキーワードをきっかけに35年ぶりにメッセージが開通。当時のあだ名で呼び合い、まるで当時にタイムスリップしたような感動でした。今では年に一度集まる仲に戻り、一生の友人を再び取り戻せました。"
              },
              {
                id: 'def-2',
                category: "mentor",
                era: "1990年代半ば",
                gender: "女性",
                tag: "🌸 恩師・部活",
                title: "定年退職された吹奏楽部の恩師へ。30年越しの『ありがとう』が届いた日",
                message: "山本先生が定年退職されたと風の噂で聞き、当時の部活仲間で『どうしても感謝を伝えたい』とメッセージを流しました。先生のご家族がこのメッセージを見つけて先生に伝えてくださり、30年ぶりに温かいお返事をいただくことができました。先日、当時の部員一同で先生を囲んで同窓会を開き、最高の恩返しができました。"
              },
              {
                id: 'def-3',
                category: "journey",
                era: "1990年代初頭",
                gender: "男性",
                tag: "🧭 旅・一期一会",
                title: "あの夏の北海道。夜通し夢を語り合った旅の友から、3年越しの返信",
                message: "学生時代、バイクで北海道を巡っていた時に富良野の宿で偶然知り合い、朝まで将来の夢について熱く語り合いました。連絡先を書いた紙を紛失してしまいずっと悔やんでいましたが、ダメ元でReMEETsの海に想いを流していました。3年後、彼から『見つけたよ！』と連絡が入った時は手の震えが止まりませんでした。お互いに白髪交じりの大人になりましたが、心の距離は当時のままでした。"
              }
            ];

            const safeStories = Array.isArray(featuredStories) ? featuredStories : [];
            const leftStory = safeStories.find(s => s && s.display_position === 'left') || defaultStories[0];
            const centerStory = safeStories.find(s => s && s.display_position === 'center') || defaultStories[1];
            const rightStory = safeStories.find(s => s && s.display_position === 'right') || defaultStories[2];

            return [leftStory, centerStory, rightStory].map((story, idx) => {
              if (!story) return null;
              const category = story.category || (idx === 0 ? 'classmate' : idx === 1 ? 'mentor' : 'journey');
              const badge = getCategoryBadge(category, story.tag);
              const storyId = story.id ? (String(story.id).startsWith('db-') || String(story.id).startsWith('def-') ? story.id : `db-${story.id}`) : `def-${idx + 1}`;

              return (
                <Link
                  key={story.id || idx}
                  to={`/success-stories?id=${storyId}`}
                  className="bg-white border border-slate-200/90 p-4 sm:p-4.5 md:p-6 rounded-3xl space-y-3 sm:space-y-4 hover:shadow-lg hover:border-teal-400/80 transition-all hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer text-left block group shadow-xs"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
                      <span className={`text-[10px] sm:text-[10.5px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                        {story.era ? story.era : '想い出の再会'}
                      </span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <h4 className="text-xs sm:text-[13px] md:text-base font-serif font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                        {story.title || '奇跡が結びつけた、温かい再会の物語'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-sans line-clamp-5">
                        {story.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-100 text-[10px] sm:text-[11px] text-slate-500 font-sans">
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase">
                      FEATURED #{idx + 1}
                    </span>
                    <span className="text-teal-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      体験談を読む <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            });
          })()}
        </div>
      </div>

      {/* Quick Access Guidance Micro Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto pt-2 font-sans">
        <Link 
          to="/manual" 
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-sm hover:shadow transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block group-hover:text-teal-700 transition-colors">ご利用マニュアル</span>
            <span className="text-[10px] text-slate-500 block">検索〜開通までの流れ</span>
          </div>
        </Link>

        <Link 
          to="/safety" 
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-700 transition-colors">安心・安全の取り組み</span>
            <span className="text-[10px] text-slate-500 block">AI監視・eKYC本人確認</span>
          </div>
        </Link>

        <Link 
          to="/pricing" 
          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block group-hover:text-sky-700 transition-colors">利用料金表（0円〜）</span>
            <span className="text-[10px] text-slate-500 block">月額費用なし・明確料金</span>
          </div>
        </Link>
      </div>

      {/* Real-time Statistics Grid (Placed right above Recent Bottles) */}
      {showStats && (
        <div className="grid grid-cols-3 gap-1 md:gap-2 py-2 px-3 md:px-4 bg-white/90 border border-teal-100/90 rounded-2xl max-w-xl mx-auto shadow-2xs divide-x divide-teal-100 select-none animate-fadeIn my-6">
          <div className="text-center px-1">
            <span className="text-[9px] md:text-[10.5px] font-sans font-medium text-slate-500 uppercase tracking-wider block leading-tight">
              流されたボトルメール
            </span>
            <span className="text-xs xs:text-sm sm:text-base md:text-lg font-serif font-bold text-slate-800 tracking-wider block leading-tight mt-0.5">
              {(stats?.totalUsers ?? 0).toLocaleString()} <span className="text-[8.5px] md:text-[10px] font-sans font-normal text-slate-500">通</span>
            </span>
          </div>
          <div className="text-center px-1">
            <span className="text-[9px] md:text-[10.5px] font-sans font-medium text-slate-500 uppercase tracking-wider block leading-tight">
              本日流された想い
            </span>
            <span className="text-xs xs:text-sm sm:text-base md:text-lg font-serif font-bold text-slate-800 tracking-wider block leading-tight mt-0.5">
              {(stats?.todayPosts ?? 0).toLocaleString()} <span className="text-[8.5px] md:text-[10px] font-sans font-normal text-slate-500">通</span>
            </span>
          </div>
          <div className="text-center px-1">
            <span className="text-[9px] md:text-[10.5px] font-sans font-medium text-teal-800 font-bold uppercase tracking-wider block leading-tight">
              再会・開通成功数
            </span>
            <span className="text-xs xs:text-sm sm:text-base md:text-lg font-serif font-bold text-teal-700 tracking-wider block leading-tight mt-0.5">
              {(stats?.totalReunions ?? 0).toLocaleString()} <span className="text-[8.5px] md:text-[10px] font-sans font-normal text-teal-600">組</span>
            </span>
          </div>
        </div>
      )}



      {/* Concept Story Modal (Vintage Deckle-Edged Letter) */}
      <ConceptStoryModal 
        isOpen={isConceptModalOpen} 
        onClose={() => setIsConceptModalOpen(false)} 
      />

      {/* eKYC Verification Modal */}
      <AnimatePresence>
        {showEkycModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 text-black font-sans" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEkycModal(false)}
              className="absolute inset-0 bg-black/65 cursor-pointer"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-white shadow-2xl p-6 md:p-8 text-zinc-900 z-10 rounded-2xl max-h-[90vh] flex flex-col overflow-y-auto"
              data-lenis-prevent
            >
              <button 
                type="button"
                onClick={() => setShowEkycModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-brand-dark transition-colors p-1.5 focus:outline-none cursor-pointer rounded-full hover:bg-zinc-100 z-20"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>

              {/* ステップ進行プログレスインジケーター */}
              <div className="mb-4 space-y-1.5 font-sans border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-sky-600" />
                    <span>eKYC 本人確認手続き</span>
                  </span>
                  <span className="font-mono text-sky-800 font-extrabold bg-sky-50 px-2 py-0.5 rounded-full text-[10px] border border-sky-200/60">
                    {ekycStep === 1 && 'STEP 1 / 4 (概要)'}
                    {ekycStep === 2 && 'STEP 2 / 4 (証明書情報)'}
                    {ekycStep === 3 && 'STEP 3 / 4 (安全決済)'}
                    {ekycStep === 4 && 'STEP 4 / 4 (照合処理)'}
                    {ekycStep === 5 && '完了'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 h-full transition-all duration-300 rounded-full shadow-xs"
                    style={{
                      width: ekycStep === 1 ? '25%' : ekycStep === 2 ? '50%' : ekycStep === 3 ? '75%' : ekycStep === 4 ? `${ekycProgress}%` : '100%'
                    }}
                  />
                </div>
              </div>

              {/* Step 1: Introduction & Benefits */}
              {ekycStep === 1 && (
                <div className="space-y-5 py-2">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full seal-rainbow text-white shadow-lg mx-auto flex-col">
                      <ShieldCheck size={26} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                      <span className="text-[8px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">eKYC済</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-zinc-900">
                      オンライン本人確認 (eKYC) で安心再会
                    </h3>
                    <p className="text-xs text-zinc-500">
                      なりすましやサクラのない、完全にクリーンで安全な再会インフラのために
                    </p>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-zinc-700">
                    <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl space-y-1">
                      <span className="font-bold text-sky-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                        ① お相手への本気の信頼・誠意を届ける
                      </span>
                      <p className="text-zinc-600 pl-3">
                        「本人確認済（eKYC）」のチェックマークがメッセージとプロフィールに付与されます。お相手が見つけた際に「なりすましやいたずらではなく本物のお相手だ」と一目で確信できるため、回答率や開封率が劇的に上がります。
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                      <span className="font-bold text-indigo-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        ② 100%徹底されたプライバシー保護
                      </span>
                      <p className="text-zinc-600 pl-3">
                        提出された身分証画像、ご住所、詳細な生年月日が他ユーザーに開示されることは一切ありません。確認完了後はサーバー上の身分証画像は即座に自動パージ（完全削除）されます。開示されるのは「実在の本人である」という認証バッジのみです。
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                      <span className="font-bold text-amber-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        ③ サクラや悪質勧誘 of 徹底排除
                      </span>
                      <p className="text-zinc-600 pl-3">
                        公的な身元確認により、ロマンス詐欺、ストーカー、なりすまし等の悪質なユーザーを完全にシャットアウト。思い出を傷つけない「神聖で安心安全な空間」を維持します。
                      </p>
                    </div>

                    <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                      <span className="font-bold text-rose-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        ④ 本人照合システム手数料 600円（税込）
                      </span>
                      <p className="text-zinc-600 pl-3">
                        サクラや悪質ななりすまし登録を徹底的に防止するため、本照合システム利用には<strong>1回 600円（税込）</strong>の安全照合手数料が必要です。（確認が不合格となった場合は全額返金されます）
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setEkycStep(2)}
                      className="w-full py-3.5 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold font-sans tracking-widest text-center flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                    >
                      <span>本人確認の手続きに進む</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Form & Simulated ID Upload */}
              {ekycStep === 2 && (
                <div className="space-y-5 py-2">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">
                      本人確認書類の提出
                    </h3>
                    <p className="text-xs text-zinc-500">
                      公的身分証明書をご提示ください。法令に基づき年齢確認と本人照合を行います。
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                        <span>お名前（漢字・ご本名フルネーム）</span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded font-normal">必須</span>
                      </label>
                      <input 
                        type="text"
                        value={ekycName}
                        onChange={(e) => setEkycName(e.target.value)}
                        placeholder="例：本間 隆"
                        className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl bg-slate-50 focus:border-brand-primary outline-none text-xs text-black"
                      />
                    </div>

                    {/* Birthdate */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                        <span>生年月日</span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded font-normal">必須</span>
                      </label>
                      <input 
                        type="date"
                        value={ekycBirthdate}
                        onChange={(e) => setEkycBirthdate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl bg-slate-50 focus:border-brand-primary outline-none text-xs text-black"
                      />
                    </div>

                    {/* Doc Type Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">提出書類の選択</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'license', name: '運転免許証' },
                          { id: 'mynumber', name: 'マイナンバー' },
                          { id: 'passport', name: 'パスポート' }
                        ].map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setEkycDocType(doc.id as any)}
                            className={`py-2 px-1 border-2 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer ${
                              ekycDocType === doc.id 
                                ? 'border-teal-500 bg-teal-50 text-teal-800' 
                                : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-600'
                            }`}
                          >
                            {doc.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">身分証の撮影・画像添付</label>
                      <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center space-y-2 bg-slate-50/50">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 text-zinc-500">
                          <ImageIcon size={20} />
                        </div>
                        <div className="text-[10px] text-zinc-500 space-y-1">
                          <p className="font-semibold text-zinc-700">画像をドラッグ＆ドロップ、またはクリックして追加</p>
                          <p>表面がはっきりと写っているJPEG, PNGファイル</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEkycName('本間 隆');
                            setEkycBirthdate('1985-06-15');
                          }}
                          className="px-3 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                        >
                          デモ用サンプルデータを自動入力する
                        </button>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <label className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-slate-100/80 text-xs md:text-sm font-medium text-slate-800 cursor-pointer select-none leading-relaxed transition-all">
                      <input 
                        type="checkbox" 
                        id="ekyc-check-consent"
                        className="w-4 h-4 mt-0.5 accent-teal-600 focus:ring-teal-500 border-zinc-300 rounded cursor-pointer shrink-0"
                      />
                      <span>
                        <strong>【eKYC申請同意】</strong> eKYC本人確認審査手数料（1回600円）の決済および利用規約に同意し、公的身分証明書によるオンライン本人確認を申請します。
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEkycStep(1)}
                      className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold font-sans text-center transition-all cursor-pointer"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const checkConsent = document.getElementById('ekyc-check-consent') as HTMLInputElement;
                        if (!ekycName.trim()) {
                          alert('お名前を入力してください。');
                          return;
                        }
                        if (!ekycBirthdate) {
                          alert('生年月日を入力してください。');
                          return;
                        }
                        if (checkConsent && !checkConsent.checked) {
                          alert('年齢確認および規約への同意チェックが必要です。');
                          return;
                        }
                        setEkycStep(3);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold font-sans text-center transition-all shadow-md cursor-pointer active:scale-98"
                    >
                      お支払い手続きに進む
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment (New Credit Card Billing) */}
              {ekycStep === 3 && (
                <div className="space-y-5 py-2">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-50 text-sky-600 animate-bounce">
                      <CreditCard size={24} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-zinc-900">
                      安全照合システム手数料のお支払い
                    </h3>
                    <p className="text-xs text-zinc-500">
                      なりすまし防止・安全対策を維持するための手数料決済です。
                    </p>
                  </div>

                  <div className="bg-sky-50/40 border border-sky-200 rounded-2xl p-4 text-center space-y-1 shadow-sm">
                    <div className="text-[10px] text-sky-800 font-bold tracking-wider">ご請求金額</div>
                    <div className="text-3xl font-sans font-extrabold text-sky-950 flex items-baseline justify-center gap-1">
                      <span>600</span>
                      <span className="text-sm font-bold">円</span>
                      <span className="text-xs text-zinc-500 font-normal">（税込）</span>
                    </div>
                    <div className="text-[9px] text-zinc-500">
                      安全照合・データ自動パージシステムの利用手数料
                    </div>
                  </div>

                  <CreditCardPaymentForm
                    cardNumber={payCardNumber}
                    cardExpiry={payCardExpiry}
                    cardCvc={payCardCvc}
                    cardName={payCardName}
                    onCardNumberChange={setPayCardNumber}
                    onCardExpiryChange={setPayCardExpiry}
                    onCardCvcChange={setPayCardCvc}
                    onCardNameChange={setPayCardName}
                    showDemoButton={true}
                    onDemoFill={() => {
                      setPayCardNumber('4111 1111 1111 1111');
                      setPayCardExpiry('12/29');
                      setPayCardCvc('123');
                      setPayCardName('TAKASHI HONMA');
                    }}
                    refundGuaranteeText="メッセージ開封または本人確認（eKYC）手続きが不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。"
                  />

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => setEkycStep(2)}
                      className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold font-sans text-center transition-all cursor-pointer disabled:opacity-55"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => {
                        if (!payCardNumber.trim() || payCardNumber.length < 15) {
                          alert('有効なカード番号を入力してください。');
                          return;
                        }
                        if (!payCardExpiry.trim() || !payCardExpiry.includes('/')) {
                          alert('有効期限（MM/YY）を入力してください。');
                          return;
                        }
                        if (!payCardCvc.trim() || payCardCvc.length < 3) {
                          alert('セキュリティコード（CVC）を正しく入力してください。');
                          return;
                        }
                        if (!payCardName.trim()) {
                          alert('カード名義人をお名前で入力してください。');
                          return;
                        }
                        setIsPaying(true);
                        setTimeout(() => {
                          setIsPaying(false);
                          setEkycStep(4); // 照合プロセスへ
                        }, 1200);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold font-sans text-center transition-all shadow-md cursor-pointer disabled:opacity-55 flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      {isPaying ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>決済を処理中...</span>
                        </>
                      ) : (
                        <>
                          <span>安全に600円を支払う</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Processing simulation */}
              {ekycStep === 4 && (
                <div className="space-y-6 py-4 text-center font-serif">
                  {/* 中央の二重発光スピナー & アイコン */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    {/* 外周の発光オーラ */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400/20 via-blue-500/30 to-amber-400/20 blur-xl animate-pulse" />
                    
                    {/* スピナーリング（外側・反時計回り） */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-sky-300/60 animate-[spin_8s_linear_infinite]" />
                    
                    {/* スピナーリング（内側・時計回り） */}
                    <div className="absolute w-20 h-20 rounded-full border-3 border-sky-100 border-t-sky-500 border-r-blue-500 animate-spin" />
                    
                    {/* 中央コンテンツ */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-sky-900 font-serif">
                      <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent pl-0.5">
                        {ekycProgress}%
                      </span>
                      <span className="text-[9px] font-semibold text-sky-600/80 uppercase tracking-[0.22em] -mt-0.5">
                        Processing
                      </span>
                    </div>
                  </div>

                  {/* ステータスタイトル */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-serif font-bold tracking-[0.1em] shadow-xs">
                      <ShieldCheck size={14} className="text-sky-600 animate-pulse" />
                      <span>公的本人確認・安全照合中</span>
                    </div>
                    <h3 className="text-base font-serif font-extrabold tracking-[0.12em] md:tracking-[0.16em] text-zinc-900 pt-1">
                      {ekycProgress < 25 && '1. 決済の安全トークン化処理'}
                      {ekycProgress >= 25 && ekycProgress < 50 && '2. 公的書類データ＆暗号照合'}
                      {ekycProgress >= 50 && ekycProgress < 75 && '3. 生体ライブネス実在判定'}
                      {ekycProgress >= 75 && ekycProgress < 100 && '4. 身元信頼暗号キー生成＆画像消去'}
                      {ekycProgress === 100 && '✨ 照合・決済完了！'}
                    </h3>
                  </div>

                  {/* プログレスバー本体 */}
                  <div className="space-y-1.5 px-2">
                    <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                      <span className="flex items-center gap-1 text-[11px] text-sky-700 font-serif tracking-[0.1em]">
                        <Lock size={12} /> 256bit 暗号化通信
                      </span>
                      <span className="text-sky-700 font-bold font-serif tracking-[0.12em]">{ekycProgress} / 100%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                        style={{ width: `${ekycProgress}%` }}
                      >
                        {/* バー先端のLED光彩ノード */}
                        {ekycProgress > 0 && ekycProgress < 100 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.9)] z-10" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4ステップ進行タイムラインリスト */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 0 && ekycProgress < 25 ? 'bg-white shadow-xs border border-sky-300 font-bold text-sky-950' : ekycProgress >= 25 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 25 ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-800'}`}>
                          {ekycProgress >= 25 ? '✓' : '1'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">決済承認＆セキュリティトークン化</span>
                      </span>
                      {ekycProgress < 25 && <span className="text-[10px] text-sky-600 animate-pulse font-serif font-semibold tracking-[0.14em]">処理中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 25 && ekycProgress < 50 ? 'bg-white shadow-xs border border-sky-300 font-bold text-sky-950' : ekycProgress >= 50 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 50 ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-800'}`}>
                          {ekycProgress >= 50 ? '✓' : '2'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">公的書類・文字データ暗号解析</span>
                      </span>
                      {ekycProgress >= 25 && ekycProgress < 50 && <span className="text-[10px] text-sky-600 animate-pulse font-serif font-semibold tracking-[0.14em]">解析中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 50 && ekycProgress < 75 ? 'bg-white shadow-xs border border-sky-300 font-bold text-sky-950' : ekycProgress >= 75 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 75 ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-800'}`}>
                          {ekycProgress >= 75 ? '✓' : '3'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">実在生身人間（ライブネス）判定</span>
                      </span>
                      {ekycProgress >= 50 && ekycProgress < 75 && <span className="text-[10px] text-sky-600 animate-pulse font-serif font-semibold tracking-[0.14em]">判定中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 75 ? 'bg-white shadow-xs border border-sky-300 font-bold text-sky-950' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress === 100 ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-800'}`}>
                          {ekycProgress === 100 ? '✓' : '4'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">身元信頼トークン発行＆原本即時消去</span>
                      </span>
                      {ekycProgress >= 75 && ekycProgress < 100 && <span className="text-[10px] text-sky-600 animate-pulse font-serif font-semibold tracking-[0.14em]">発行中...</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Success / Done */}
              {ekycStep === 5 && (
                <div className="space-y-5 py-2 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full seal-rainbow text-white shadow-lg mx-auto flex-col animate-bounce">
                    <ShieldCheck size={30} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                    <span className="text-[9px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">eKYC済</span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-serif font-bold text-emerald-800">
                      本人確認 (eKYC) 完了
                    </h3>
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                        🛡️ 身元信頼保証ステータス：認証済 (Verified)
                      </span>
                      <span className="inline-block px-2.5 py-0.5 bg-zinc-50 text-zinc-600 font-medium text-[9px] rounded-md border border-zinc-100 font-mono">
                        手数料 600円（税込） お支払い完了
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto space-y-3 font-sans text-left">
                    <p className="text-center">
                      オンライン本人確認手続き、およびお支払いが正常に完了しました！
                    </p>
                    <p className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-zinc-500 text-[11px] leading-relaxed">
                      お名前 <strong>{ekycName || '本間 隆'}</strong> と公的身分証が100%一致していることが運営局により保証されました。画像データは直ちに非蓄積・安全破棄（パージ）され、システム側には高度な暗号ハッシュトークンのみが残されています。
                    </p>
                    <p className="text-zinc-600">
                      あなたが流す再会のボトルメール、およびメッセージのやり取りには、信頼のマークである<strong>「本人確認済バッジ (🛡️ 認証済)」</strong>が常時表示され、お相手がなりすましを警戒することなく、最高クラスの安心感を持ってお返事を書けるようになります。
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEkycModal(false)}
                      className="w-full py-3 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl text-xs font-bold font-sans text-center transition-all cursor-pointer shadow"
                    >
                      閉じる
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('ekyc_verified');
                        setEkycVerified(false);
                        window.dispatchEvent(new Event('ekyc_changed'));
                        setEkycStep(1);
                      }}
                      className="text-[9px] text-zinc-400 hover:text-red-500 hover:underline transition-all block mx-auto cursor-pointer"
                    >
                      検証リセット（eKYC確認状態を解除して再度テストする）
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌈 公的本人確認（eKYC）安心説明モーダル */}
      <EkycExplanationModal 
        isOpen={showEkycExplanationModal} 
        onClose={() => setShowEkycExplanationModal(false)} 
      />
    </div>
  );
};


