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
import { FlowExplanation, RecipientSafetyGuide, RevealContactModal, SuccessModal, AgeVerificationGate, ComplianceBanner, ReportModal } from './PostModals';

export const CreatePostPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { check: checkNg } = useNgFilter();
  const [formData, setFormData] = useState({
    searcherName: '',
    searcherFullName: '',
    searcherProfile: '',
    targetName: '',
    targetLastName: '',
    targetFirstName: '',
    targetNameEn: '',
    targetLastNameEn: '',
    targetFirstNameEn: '',
    targetHometown: '',
    targetHometownPref: '',
    targetHometownArea: '',
    targetSchool: '',
    era: '',
    category: '',
    message: '',
    contactType: 'LINE',
    contactId: '',
    contactNote: ''
  });

  useEffect(() => {
    if (location.state) {
      const { initialTargetName, initialTargetLastName, initialTargetFirstName, initialCategory } = location.state as any;
      if (initialTargetName || initialTargetLastName || initialTargetFirstName || initialCategory) {
        setFormData(prev => ({
          ...prev,
          targetName: initialTargetName || prev.targetName,
          targetLastName: initialTargetLastName || prev.targetLastName,
          targetFirstName: initialTargetFirstName || prev.targetFirstName,
          category: initialCategory || prev.category
        }));
      }
    }
  }, [location.state]);
  const [questions, setQuestions] = useState([
    { question: '', answer: '', hint: '' },
    { question: '', answer: '', hint: '' }
  ]);
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [stepEnteredTime, setStepEnteredTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return { q: `${a} + ${b} = ?`, a: (a + b).toString() };
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const refreshCaptcha = () => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    const ans = (a + b).toString();
    setCaptchaQuestion({ q: `${a} + ${b} = ?`, a: ans });
    setCaptchaAnswer('');
  };
  const [nameWarning, setNameWarning] = useState(false);
  const [warnings, setWarnings] = useState<Record<string, string | null>>({});
  const [showSearchPreview, setShowSearchPreview] = useState(true);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState<{ score: number, feedback: string } | null>(null);

  // eKYC Pre-submit Confirmation Modal States
  const [showPostConfirmModal, setShowPostConfirmModal] = useState(false);
  const [ekycConfirmStep, setEkycConfirmStep] = useState<number>(1); // 1: Select Type, 2: eKYC Form, 3: Camera Capture, 4: Payment, 5: Processing
  const [payCardNumber, setPayCardNumber] = useState('');
  const [payCardExpiry, setPayCardExpiry] = useState('');
  const [payCardCvc, setPayCardCvc] = useState('');
  const [payCardName, setPayCardName] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [ekycDocType, setEkycDocType] = useState<'license' | 'mynumber' | 'passport'>('license');
  const [postCapturedImages, setPostCapturedImages] = useState<{ front?: string; thickness?: string; back?: string }>({});
  const [ekycProgress, setEkycProgress] = useState(0);
  const [ekycName, setEkycName] = useState('');
  const [ekycBirthdate, setEkycBirthdate] = useState('');
  const [isEkycCompleted, setIsEkycCompleted] = useState(() => 
    localStorage.getItem('ekyc_verified') === 'true' || user?.is_ekyc_verified === true
  );

  // マウント時に前回のモーダル状態セッションを安全に消去
  useEffect(() => {
    sessionStorage.removeItem('show_post_confirm_modal');
    sessionStorage.removeItem('ekyc_confirm_step');
  }, []);

  useEffect(() => {
    const checkEkycStatus = () => {
      const isVerified = localStorage.getItem('ekyc_verified') === 'true' || !!user?.is_ekyc_verified;
      setIsEkycCompleted(isVerified);
    };
    checkEkycStatus();
    window.addEventListener('ekyc_changed', checkEkycStatus);
    return () => window.removeEventListener('ekyc_changed', checkEkycStatus);
  }, [user]);

  // eKYCカメラの切断・クリーンアップ保証
  useEffect(() => {
    if (ekycConfirmStep !== 3 || !showPostConfirmModal) {
      stopAllGlobalCameraStreams();
    }
    return () => {
      stopAllGlobalCameraStreams();
    };
  }, [ekycConfirmStep, showPostConfirmModal]);

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    let interval: any;
    if (showPostConfirmModal && ekycConfirmStep === 5) {
      setEkycProgress(0);
      hasSubmittedRef.current = false;
      interval = setInterval(() => {
        setEkycProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 120);
    }
    return () => clearInterval(interval);
  }, [ekycConfirmStep, showPostConfirmModal]);

  useEffect(() => {
    if (showPostConfirmModal && ekycConfirmStep === 5 && ekycProgress === 100 && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const timer = setTimeout(() => {
        executePost(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [ekycProgress, ekycConfirmStep, showPostConfirmModal]);

  const executePost = async (withEkyc: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          questions,
          captchaToken: 'mock-token',
          isEkycVerified: withEkyc || isEkycCompleted
        })
      });
      if (res.ok) {
        const data = await res.json();
        const postUrl = getPostUrl({
          id: data.id,
          target_name: formData.targetName,
          target_hometown: formData.targetHometown,
          era: formData.era,
          relationship: formData.category
        });
        
        if (withEkyc) {
          localStorage.setItem('ekyc_verified', 'true');
          window.dispatchEvent(new Event('ekyc_changed'));
        }

        sessionStorage.removeItem('show_post_confirm_modal');
        sessionStorage.removeItem('ekyc_confirm_step');
        setShowPostConfirmModal(false);
        navigate(postUrl, { state: { justPosted: true, postedWithEkyc: withEkyc } });
      } else {
        const data = await res.json();
        alert(data.error || '投稿に失敗しました。入力内容を確認してください。');
        hasSubmittedRef.current = false;
        setEkycConfirmStep(4);
      }
    } catch (err) {
      console.error(err);
      alert('ネットワークエラーが発生しました。時間を置いて再度お試しください。');
      hasSubmittedRef.current = false;
      setEkycConfirmStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    if (user) {
      const uFullName = user.fullName || (user.lastName && user.firstName ? `${user.lastName} ${user.firstName}` : '');
      const uNickname = user.nickname || '';
      const savedType = localStorage.getItem('remeets_default_contact_type') || (user as any)?.contact_type || 'LINE';
      const savedId = localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id || '';

      setFormData(prev => ({ 
        ...prev, 
        searcherFullName: uFullName || '',
        searcherName: uNickname || '',
        contactType: prev.contactId ? prev.contactType : (savedType || prev.contactType),
        contactId: prev.contactId || savedId || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [step]);

  const toHalfWidth = (str: string) => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(/[ａ-ｚＡ-Ｚ]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  const checkRealName = (name: string) => {
    const commonKanji = /[\u4e00-\u9faf]/;
    const isRealName = name.length > 1 && (commonKanji.test(name) || (user?.name && name.includes(user.name)));
    setNameWarning(isRealName);
  };

  const handleSearcherNameChange = (name: string) => {
    const ngLabel = checkNg(name);
    setWarnings(prev => ({ ...prev, searcherName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ ...prev, searcherName: name }));
    checkRealName(name);
  };

  const handleInputChange = (field: string, value: string) => {
    const ngLabel = checkNg(value);
    setWarnings(prev => ({ ...prev, [field]: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => {
      const nextData = { ...prev, [field]: value };
      if (field === 'targetHometownPref' || field === 'targetHometownArea') {
        const pref = field === 'targetHometownPref' ? value : prev.targetHometownPref;
        const area = field === 'targetHometownArea' ? value : prev.targetHometownArea;
        nextData.targetHometown = `${pref}${area}`;
      }
      return nextData;
    });
  };

  const handleQuestionChange = (idx: number, field: string, value: string) => {
    const ngLabel = checkNg(value);
    const warningKey = `question_${idx}_${field}`;
    setWarnings(prev => ({ ...prev, [warningKey]: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    const newQs = [...questions];
    newQs[idx] = { ...newQs[idx], [field]: value };
    setQuestions(newQs);
  };

  const handleTargetLastNameChange = (val: string) => {
    const ngLabel = checkNg(val);
    setWarnings(prev => ({ ...prev, targetLastName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ ...prev, targetLastName: val, targetName: `${val} ${prev.targetFirstName}`.trim() }));
  };

  const handleTargetFirstNameChange = (val: string) => {
    const ngLabel = checkNg(val);
    setWarnings(prev => ({ ...prev, targetFirstName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ ...prev, targetFirstName: val, targetName: `${prev.targetLastName} ${val}`.trim() }));
  };

  const handleAiDiagnosis = async (idx: number) => {
    const q = questions[idx].question;
    const a = questions[idx].answer;
    if (!q || !a) {
      setWarnings(prev => ({ ...prev, [`question_${idx}_ai`]: '質問と答えの両方を入力してください。' }));
      return;
    }
    setWarnings(prev => ({ ...prev, [`question_${idx}_ai`]: null }));
    setIsAiDiagnosing(true);
    try {
      const res = await fetch('/api/ai/diagnose-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, answer: a })
      });
      const result = await res.json();
      setAiDiagnosisResult(result);
    } catch (err) {
      console.error(err);
      setWarnings(prev => ({ ...prev, [`question_${idx}_ai`]: '診断に失敗しました。時間をおいて再度お試しください。' }));
    } finally {
      setIsAiDiagnosing(false);
    }
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
    setStepEnteredTime(Date.now());
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
    setStepEnteredTime(Date.now());
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  };

  const jumpToStep = (targetStep: number) => {
    setStep(targetStep);
    setStepEnteredTime(Date.now());
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  };

  const steps = [
    {
      title: "お相手の情報とあなたの手がかり",
      description: "探している大切な方の情報と、当時のあなたに関する手がかりをご入力ください。",
      fields: (
        <div className="space-y-6">
          {/* お相手の情報 */}
          <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-100/60 -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-slate-700">
              <div className="flex items-center gap-2.5">
                <Search size={22} className="text-slate-700 shrink-0" />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  1. 探しているお相手の情報
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-slate-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                <span>TO</span>
                <span className="text-[9px] opacity-75">宛先</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手の姓<span className="text-[10px] text-red-600 font-bold ml-1 tracking-normal">＊必須</span>
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="例：山田" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetLastName}
                  onChange={e => handleTargetLastNameChange(e.target.value)}
                />
                <WarningMessage message={warnings.targetLastName} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手の名<span className="text-[10px] text-red-600 font-bold ml-1 tracking-normal">＊必須</span>
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="例：太郎" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetFirstName}
                  onChange={e => handleTargetFirstNameChange(e.target.value)}
                />
                <WarningMessage message={warnings.targetFirstName} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手のローマ字表記（姓）<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
                </label>
                <input 
                  type="text" 
                  placeholder="例：Yamada" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetLastNameEn}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => {
                      const nextLastNameEn = val;
                      const nextTargetNameEn = `${nextLastNameEn.trim()} ${prev.targetFirstNameEn.trim()}`.trim();
                      return {
                        ...prev,
                        targetLastNameEn: nextLastNameEn,
                        targetNameEn: nextTargetNameEn
                      };
                    });
                    if (checkNg) {
                      setWarnings(prev => ({ ...prev, targetNameEn: checkNg(val + ' ' + formData.targetFirstNameEn) ? '不適切な単語が含まれています。' : null }));
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手のローマ字表記（名）<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
                </label>
                <input 
                  type="text" 
                  placeholder="例：Taro" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetFirstNameEn}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => {
                      const nextFirstNameEn = val;
                      const nextTargetNameEn = `${prev.targetLastNameEn.trim()} ${nextFirstNameEn.trim()}`.trim();
                      return {
                        ...prev,
                        targetFirstNameEn: nextFirstNameEn,
                        targetNameEn: nextTargetNameEn
                      };
                    });
                    if (checkNg) {
                      setWarnings(prev => ({ ...prev, targetNameEn: checkNg(formData.targetLastNameEn + ' ' + val) ? '不適切な単語が含まれています。' : null }));
                    }
                  }}
                />
              </div>
            </div>
            <WarningMessage message={warnings.targetNameEn} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  ゆかりの地（都道府県）<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
                  value={formData.targetHometownPref}
                  onChange={e => handleInputChange('targetHometownPref', e.target.value)}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                <WarningMessage message={warnings.targetHometownPref} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  地域・詳細な場所（市区町村以下）<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="例：世田谷区、横浜市中区など" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetHometownArea}
                  onChange={e => handleInputChange('targetHometownArea', e.target.value)}
                />
                <WarningMessage message={warnings.targetHometownArea} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  当時の所属（学校・職場など）<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
                </label>
                <input 
                  type="text" 
                  placeholder="例：〇〇市立第一中学校" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetSchool}
                  onChange={e => handleInputChange('targetSchool', e.target.value)}
                />
                <WarningMessage message={warnings.targetSchool} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  出会った時期・年代<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
                  value={formData.era}
                  onChange={e => handleInputChange('era', e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="1950s">1950年代</option>
                  <option value="1960s">1960年代</option>
                  <option value="1970s">1970年代</option>
                  <option value="1980s">1980年代</option>
                  <option value="1990s">1990年代</option>
                  <option value="2000s">2000年代</option>
                  <option value="2010s">2010年代</option>
                  <option value="2020s">2020年代</option>
                  <option value="other">その他</option>
                </select>
                <WarningMessage message={warnings.era} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black flex items-center gap-1">
                関係性のカテゴリー<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
              </label>
              <select 
                required
                className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
                value={formData.category}
                onChange={e => handleInputChange('category', e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="school">学校（同級生・先生）</option>
                <option value="work">職場（同僚・上司）</option>
                <option value="neighborhood">近所・幼馴染</option>
                <option value="hobby">趣味・サークル</option>
                <option value="love">初恋・大切な人</option>
                <option value="other">その他</option>
              </select>
              <WarningMessage message={warnings.category} />
            </div>
          </div>

          {/* 差出人（あなた）の手がかり */}
          <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-amber-200/80 shadow-xs overflow-hidden transition-all">
            <div className="flex items-center justify-between border-b border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-orange-50/30 to-[#FAF6F0] -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-amber-700">
              <div className="flex items-center gap-2.5">
                <BookOpen size={22} className="text-amber-800 shrink-0" />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  2. 差出人（あなた）の手がかり
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-amber-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                <span>FROM</span>
                <span className="text-[9px] opacity-75">差出人</span>
              </span>
            </div>

            <div className="space-y-4">
              {/* タイトル & 警告 */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-700" />
                  お相手にあなただと気づいてもらうための「共通の想い出ヒント」
                  <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <div className="flex items-start gap-1.5 text-[11px] text-red-800 font-bold bg-red-50/90 p-2.5 rounded-xl border border-red-200/90 leading-relaxed">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                  <span>ネット上に一般公開されます。お互いの安全のため、個人情報の入力は絶対にやめてください。（※電話番号・住所・実名などの個人情報や禁止用語が含まれる場合、AI安全監査により投函できません）</span>
                </div>
              </div>

              {/* テキスト入力欄（ガイドの上に配置） */}
              <div className="space-y-1.5">
                <textarea 
                  required
                  placeholder="例：当時「主将」と呼ばれていた者です。大会前の居残り練習や、帰り道に駄菓子屋で一緒にアイスを食べながら将来の夢を語り合いましたね。" 
                  className="w-full py-3.5 px-4 outline-none transition-all letter-field-textarea font-serif text-base md:text-lg text-[#000000] placeholder:text-zinc-400 min-h-[160px] resize-none bg-white rounded-xl border border-slate-300 focus:border-brand-primary"
                  value={formData.searcherProfile}
                  onChange={e => handleInputChange('searcherProfile', e.target.value)}
                />
                <WarningMessage message={warnings.searcherProfile} />
              </div>

              {/* 専用記入ガイド（入力欄の下に配置） */}
              <div className="p-4 bg-white/95 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3 text-xs md:text-sm text-zinc-700 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs md:text-sm">
                    <BookOpen size={16} className="text-amber-700" />
                    📖 この欄の専用記入ガイド
                  </span>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    個人情報なしで確定させるコツ
                  </span>
                </div>

                {/* 具体例・OK/NG例：アコーディオン開閉（ピル型ボタン） */}
                <details className="group pt-0.5">
                  <summary className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer py-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                    <span className="flex items-center gap-1.5 text-left leading-relaxed">
                      <Sparkles size={15} className="text-amber-700 shrink-0" />
                      <span>💡 どんな内容がOK？ 具体的な「OK・NG例」を見る</span>
                    </span>
                    <span className="flex items-center justify-center self-end sm:self-auto gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs shrink-0">
                      <span className="group-open:hidden">＋ タップで開く ▼</span>
                      <span className="hidden group-open:inline">− 閉じる ▲</span>
                    </span>
                  </summary>

                  <div className="pt-3 space-y-3 text-xs md:text-sm">
                    <p className="text-xs md:text-sm text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed font-sans">
                      💡 <strong>手紙本文との違い:</strong> お相手へのご挨拶や近況報告、本格的なメッセージ、開示用連絡先は、最後の<strong>【Step 3（非公開の手紙本文）】</strong>で安全に入力します。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs md:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle size={15} className="text-emerald-700" />
                          ⭕️ おすすめの書き方（伝わる例）
                        </span>
                        <ul className="text-xs md:text-sm text-emerald-950/85 space-y-1 list-disc list-inside leading-relaxed font-sans">
                          <li>当時のあだ名や係（例: <em>「当時『たっちゃん』と呼ばれていた者です」</em>）</li>
                          <li>二人の共通体験（例: <em>「放課後の図書室でよくおすすめの本を教え合いましたね」</em>）</li>
                          <li>イベント・出来事（例: <em>「文化祭で一緒に大道具の看板を描いた友人です」</em>）</li>
                        </ul>
                      </div>

                      <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs md:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                          <X size={15} className="text-rose-700" />
                          ❌ 書いてはいけない内容（AI検閲対象）
                        </span>
                        <ul className="text-xs md:text-sm text-rose-950/85 space-y-1 list-disc list-inside leading-relaxed font-sans">
                          <li>電話番号、LINE ID、メールアドレス（※連絡先はStep 3で安全開示）</li>
                          <li>詳細な自宅番地、実名フルネーム、勤務先の具体的部署</li>
                          <li>「元気？会いたいから連絡して」（※手紙の本文はStep 3で書く）</li>
                          <li>誹謗中傷、金銭要求、トラブルに関する記述</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      ),
      isValid: () => 
        formData.targetLastName.length > 0 && 
        formData.targetFirstName.length > 0 && 
        formData.targetHometownPref.length > 0 &&
        formData.targetHometownArea.length > 0 &&
        formData.era.length > 0 &&
        formData.category.length > 0 &&
        formData.searcherName.length > 0 &&
        formData.searcherFullName.length > 0 &&
        formData.searcherProfile.length > 0 &&
        !warnings.targetLastName && 
        !warnings.targetFirstName && 
        !warnings.targetHometownPref && 
        !warnings.targetHometownArea && 
        !warnings.targetSchool &&
        !warnings.era &&
        !warnings.category &&
        !warnings.searcherProfile
    },
    {
      title: "二人だけの思い出の質問",
      description: "プライバシーを守るため、本人確認用の「思い出の質問」を2問作成してください。両方の正解が必須となります。",
      fields: (
        <div className="space-y-6">
          {/* 📖 思い出の質問・答え 専用記入ガイド */}
          <div className="p-4 bg-white/95 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3 text-xs md:text-sm text-zinc-700 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs md:text-sm">
                <BookOpen size={16} className="text-amber-700" />
                📖 思い出の質問・答えの専用記入ガイド
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                正解率UP ＆ 安全設定
              </span>
            </div>

            {/* 赤バック注意事項（前ページと同じスタイル） */}
            <div className="flex items-start gap-1.5 text-[11px] text-red-800 font-bold bg-red-50/90 p-2.5 rounded-xl border border-red-200/90 leading-relaxed">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
              <span>【答えの鉄則】答えは「短い単語（名詞・キーワード）」のみで設定してください。（※質問・答えともに、電話番号・住所・実名などの個人情報や禁止用語が含まれる場合、AI安全監査により投函できません）</span>
            </div>

            {/* 具体例・OK/NG例：アコーディオン開閉（ピル型ボタン） */}
            <details className="group pt-0.5">
              <summary className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer py-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                <span className="flex items-center gap-1.5 text-left leading-relaxed">
                  <Sparkles size={15} className="text-amber-700 shrink-0" />
                  <span>💡 どんな質問・答えが良い？ 具体的な「OK・NG例」を見る</span>
                </span>
                <span className="flex items-center justify-center self-end sm:self-auto gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs shrink-0">
                  <span className="group-open:hidden">＋ タップで開く ▼</span>
                  <span className="hidden group-open:inline">− 閉じる ▲</span>
                </span>
              </summary>

              <div className="pt-3 space-y-3 text-xs md:text-sm">
                <p className="text-xs md:text-sm text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed font-sans">
                  💡 <strong>答えの鉄則 ＆ 表記ゆれ自動対応:</strong> 答えは「〜です」などの文章や記号を省き、<strong>「短い単語（名詞）」</strong>のみで設定してください。ひらがな・カタカナ・漢字や送り仮名のゆれはシステムが自動で柔軟に正解判定します。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 space-y-1.5">
                    <span className="text-xs md:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle size={15} className="text-emerald-700" />
                      ⭕️ 正解しやすいおすすめ例
                    </span>
                    <ul className="text-xs md:text-sm text-emerald-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                      <li><strong>質問:</strong> 放課後によく二人で買い食いした駄菓子屋の名前は？<br />➔ <strong>答え:</strong> <code>さくらや</code></li>
                      <li><strong>質問:</strong> 文化祭の劇であなたが担当した役の動物は？<br />➔ <strong>答え:</strong> <code>タヌキ</code></li>
                      <li><strong>質問:</strong> 部活の合宿で夜にこっそり集合した場所は？<br />➔ <strong>答え:</strong> <code>非常階段</code></li>
                    </ul>
                  </div>

                  <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3 space-y-1.5">
                    <span className="text-xs md:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                      <X size={15} className="text-rose-700" />
                      ❌ やってはいけない設定（AI検閲対象 / 不一致）
                    </span>
                    <ul className="text-xs md:text-sm text-rose-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                      <li><strong>文章や記号:</strong> <code>さくらやです！</code>、<code>〇〇でした</code>（※単語のみにする）</li>
                      <li><strong>個人情報:</strong> 電話番号、LINE ID、実名フルネーム、詳細な番地</li>
                      <li><strong>主観的な質問:</strong> 「あの時私がどう思ったか」（※相手が答えにくい）</li>
                      <li><strong>禁止表現:</strong> 誹謗中傷、金銭要求、トラブルに関する記述</li>
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const hasSentenceEnding = /(です|でした|だよ|だね|だった|である|！|!|？|\?|。|、)$/.test(q.answer.trim());
              const isFirst = idx === 0;
              return (
                <div key={idx} className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
                  {/* カードヘッダー */}
                  <div className={`flex items-center justify-between border-b ${isFirst ? 'border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-sky-50/30 to-[#FAF6F0] border-l-indigo-700' : 'border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-[#FAF6F0] border-l-teal-700'} -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-5 rounded-full inline-block shrink-0 ${isFirst ? 'bg-indigo-700' : 'bg-teal-700'}`} />
                      <HelpCircle size={22} className={isFirst ? "text-indigo-800 shrink-0" : "text-teal-800 shrink-0"} />
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                        思い出の質問 {idx + 1}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleAiDiagnosis(idx)}
                        disabled={isAiDiagnosing}
                        className="text-xs text-slate-700 hover:text-indigo-600 flex items-center gap-1 font-bold tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-all active:scale-95"
                      >
                        <Sparkles size={13} className="text-amber-600" />
                        {isAiDiagnosing ? '診断中...' : 'セキュリティ診断'}
                      </button>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ${isFirst ? 'bg-indigo-800' : 'bg-teal-800'} text-white shadow-2xs shrink-0 flex items-center gap-1`}>
                        <span>Q{idx + 1}</span>
                        <span className="text-[9px] opacity-75">必須</span>
                      </span>
                    </div>
                  </div>

                  {/* 質問入力欄 */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-black" />
                      質問内容<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="例：部活の帰りに寄っていた店の名前は？" 
                      className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={q.question}
                      onChange={e => handleQuestionChange(idx, 'question', e.target.value)}
                    />
                    <WarningMessage message={warnings[`question_${idx}_question`]} />
                  </div>

                  {/* 答え入力欄 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                        <Key size={14} className="text-black" />
                        答え（単語・名詞）<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                      </label>
                      <span className="text-xs text-slate-500 font-medium">※ 単語のみ（例: さくらや）</span>
                    </div>
                    <input 
                      required
                      type="text" 
                      placeholder="例：さくらや（※単語・キーワードのみ）" 
                      className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={q.answer}
                      onChange={e => handleQuestionChange(idx, 'answer', toHalfWidth(e.target.value))}
                      inputMode="url"
                      autoCapitalize="off"
                      autoCorrect="off"
                    />
                    {hasSentenceEnding && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-bold animate-fade-in">
                        <span>💡 「です」「！」などの語尾や記号を省いた単語のみ（例: <code>さくらや</code>）で設定すると、相手が正解しやすくなります。</span>
                      </p>
                    )}
                    <WarningMessage message={warnings[`question_${idx}_answer`]} />
                  </div>

                  {/* AI診断結果表示 */}
                  {aiDiagnosisResult && questions[idx].question === q.question && (
                    <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black">AI診断スコア: {aiDiagnosisResult.score}/100</span>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${aiDiagnosisResult.score > 70 ? 'bg-emerald-500' : aiDiagnosisResult.score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${aiDiagnosisResult.score}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{aiDiagnosisResult.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ),
      isValid: () => 
        questions.length >= 2 &&
        questions[0].question.length > 0 && 
        questions[0].answer.length > 0 && 
        questions[1].question.length > 0 && 
        questions[1].answer.length > 0 &&
        !warnings.question_0_question &&
        !warnings.question_0_answer &&
        !warnings.question_1_question &&
        !warnings.question_1_answer
    },
    {
      title: "手紙と開示用連絡先の設定",
      description: `${formData.targetName ? `${formData.targetName} 様` : 'お相手'}へ届ける手紙の本文と、質問正解後にのみ安全に開示される連絡先を1つ設定してください。`,
      fields: (
        <div className="space-y-6">
          {/* 📖 メッセージ・連絡先 専用記入ガイド */}
          <div className="p-4 bg-white/95 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3 text-xs md:text-sm text-zinc-700 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs md:text-sm">
                <BookOpen size={16} className="text-amber-700" />
                📖 メッセージと開示用連絡先の専用ルールガイド
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                安心開示 ＆ 法的保護
              </span>
            </div>

            {/* 赤バック注意事項（前ページと同じスタイル） */}
            <div className="flex items-start gap-1.5 text-[11px] text-red-800 font-bold bg-red-50/90 p-2.5 rounded-xl border border-red-200/90 leading-relaxed">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
              <span>【連絡先の鉄則】手紙本文には電話番号・住所等を書かず、必ず専用の『開示用連絡先』欄へご入力ください。（※思い出の質問に正解し開示手続きを行ったお相手にのみ安全に暗号化開示されます）</span>
            </div>

            {/* 具体例・OK/NG例：アコーディオン開閉（ピル型ボタン） */}
            <details className="group pt-0.5">
              <summary className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer py-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                <span className="flex items-center gap-1.5 text-left leading-relaxed">
                  <Sparkles size={15} className="text-amber-700 shrink-0" />
                  <span>💡 メッセージ作成のコツや「OK・NG例」を見る</span>
                </span>
                <span className="flex items-center justify-center self-end sm:self-auto gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs shrink-0">
                  <span className="group-open:hidden">＋ タップで開く ▼</span>
                  <span className="hidden group-open:inline">− 閉じる ▲</span>
                </span>
              </summary>

              <div className="pt-3 space-y-3 text-xs md:text-sm">
                <p className="text-xs md:text-sm text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed font-sans">
                  💡 <strong>手紙本文について:</strong> この手紙本文は一般公開されず、質問に全問正解したお相手のみが開封できます。当時の想いや再会へのメッセージを安心してお書きください。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 space-y-1.5">
                    <span className="text-xs md:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle size={15} className="text-emerald-700" />
                      ⭕️ 心温まるおすすめの書き方
                    </span>
                    <ul className="text-xs md:text-sm text-emerald-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                      <li>近況報告や当時の感謝の気持ち（例: <em>「あの時助けてくれたこと、ずっと心に残っていました」</em>）</li>
                      <li>再会したら話したいこと（例: <em>「もし見てくれたら、お茶でもしながら昔の話をしましょう」</em>）</li>
                      <li>お相手への温かい気遣い（例: <em>「お元気で過ごされていることを祈っています」</em>）</li>
                    </ul>
                  </div>

                  <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3 space-y-1.5">
                    <span className="text-xs md:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                      <X size={15} className="text-rose-700" />
                      ❌ 書いてはいけない内容（AI検閲対象）
                    </span>
                    <ul className="text-xs md:text-sm text-rose-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                      <li>手紙本文内への直接の電話番号・住所・口座番号の記入（※連絡先は下の専用欄へ）</li>
                      <li>威圧的な要求、金銭の催促、トラブルに関する記述</li>
                      <li>誹謗中傷、プライバシー侵害、わいせつな表現</li>
                    </ul>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* 3. 【お相手 様】へ届ける手紙 カード */}
          <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-indigo-200/80 shadow-xs overflow-hidden transition-all">
            <div className="flex items-center justify-between border-b border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-sky-50/30 to-[#FAF6F0] -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-indigo-700">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-indigo-700 rounded-full inline-block shrink-0" />
                <Mail size={22} className="text-indigo-800 shrink-0" />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  3. 【{formData.targetName || 'お相手'} 様】へ届ける手紙
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-indigo-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                <span>LETTER</span>
                <span className="text-[9px] opacity-75">正解後のみ開示</span>
              </span>
            </div>

            {/* 安心ガイダンス・AI検閲注意 */}
            <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-xl text-xs space-y-1 text-indigo-950 font-sans">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <ShieldCheck size={15} className="text-indigo-700 shrink-0" />
                <span>🔒 {formData.targetName || 'お相手'} 様が思い出の質問に全問正解した後にのみ開示される非公開の手紙です</span>
              </div>
              <p className="text-indigo-900/85 leading-relaxed text-[11px] pl-5">
                ※ 手紙本文には電話番号・LINE ID・メールアドレス等の連絡先や詳細な住所は直接書かないでください（AI安全監査により投函エラーとなります）。<br />
                ※ お相手に開示する連絡先は、すぐ下の<strong>「4. 開示用連絡先設定」欄に1つだけ</strong>ご入力ください。
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                <Mail size={14} className="text-black" />
                手紙のメッセージ本文<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
              </label>
              <textarea 
                required
                placeholder="例：ずっと探していました。もしこれを見ていたら、ぜひ連絡をください。またあの頃のように話したいです。"
                className="w-full py-3.5 px-4 border-b-2 border-brand-primary/50 focus:border-brand-primary outline-none transition-all letter-field-textarea font-serif text-base md:text-lg text-black placeholder:text-zinc-400 min-h-[160px] resize-none bg-[#faf9f6] focus:bg-white rounded-xl"
                value={formData.message}
                onChange={e => handleInputChange('message', e.target.value)}
              />
              <WarningMessage message={warnings.message} />
            </div>
          </div>

          {/* 4. 【お相手 様】へ開示するSNS・連絡先設定 カード */}
          <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-teal-200/80 shadow-xs overflow-hidden transition-all">
            <div className="flex items-center justify-between border-b border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-[#FAF6F0] -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-teal-700">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-teal-700 rounded-full inline-block shrink-0" />
                <Share2 size={22} className="text-teal-800 shrink-0" />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  4. 【{formData.targetName || 'お相手'} 様】へ開示するSNS・連絡先設定
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {(localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id) && (
                  <button
                    type="button"
                    onClick={() => {
                      const savedType = localStorage.getItem('remeets_default_contact_type') || (user as any)?.contact_type || 'LINE';
                      const savedId = localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id || '';
                      handleInputChange('contactType', savedType);
                      handleInputChange('contactId', savedId);
                    }}
                    className="text-xs text-slate-700 hover:text-teal-700 flex items-center gap-1 font-bold tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-all active:scale-95 shrink-0"
                  >
                    <span>💡 マイSNS IDを自動反映</span>
                  </button>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-teal-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                  <span>CONTACT</span>
                  <span className="text-[9px] opacity-75">必須</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                  連絡先の種類<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
                  value={formData.contactType}
                  onChange={e => handleInputChange('contactType', e.target.value)}
                >
                  <option value="LINE">LINE ID / 友だち追加リンク</option>
                  <option value="X">X (旧Twitter) ID</option>
                  <option value="Instagram">Instagram ID</option>
                  <option value="Email">メールアドレス</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                  開示用ID / アドレス / リンク<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="例：@my_line_id や https://line.me/ti/p/xxx"
                  className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.contactId}
                  onChange={e => handleInputChange('contactId', e.target.value)}
                />
                <WarningMessage message={warnings.contactId} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                お相手への連絡時メモ・補足<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
              </label>
              <input 
                type="text"
                placeholder="例：LINEで『ReMEETsを見た』とお知らせください。"
                className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                value={formData.contactNote}
                onChange={e => handleInputChange('contactNote', e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
      isValid: () => formData.message.length > 0 && formData.contactId.length > 0 && !warnings.message && !warnings.contactId
    },
    {
      title: "投函前の最終確認シート",
      description: "入力したすべての内容をご確認の上、画面下の認証を行って海へ流してください。修正したい箇所は各項目の「変更する」ボタンから修正できます。",
      fields: (
        <div className="space-y-6">
          {/* 1. お相手の情報シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-slate-700 rounded-full inline-block" />
                <Search size={20} className="text-slate-700" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">1. 探しているお相手の情報</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(0)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm font-sans">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">お相手のお名前</span>
                <span className="font-bold text-slate-900 text-sm">{formData.targetName} 様</span>
                {formData.targetNameEn && <span className="text-xs text-slate-500 ml-1.5">({formData.targetNameEn})</span>}
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">ゆかりの地</span>
                <span className="font-bold text-slate-900 text-sm">{formData.targetHometown || '未入力'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">当時の所属（学校・職場など）</span>
                <span className="font-bold text-slate-900 text-sm">{formData.targetSchool || 'なし'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">出会った年代・関係性</span>
                <span className="font-bold text-slate-900 text-sm">{formatEraLabel(formData.era)} / {getCategoryText(formData.category)}</span>
              </div>
            </div>
          </div>

          {/* 2. 差出人の手がかりシート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-amber-700 rounded-full inline-block" />
                <BookOpen size={20} className="text-amber-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">2. 差出人（あなた）の手がかり</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(0)}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="space-y-2 text-xs md:text-sm font-sans">
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                <span className="text-amber-900/70 block text-[11px]">あなたの表示名</span>
                <span className="font-bold text-slate-900">{formData.searcherName}</span>
              </div>
              <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 space-y-1">
                <span className="text-amber-900/70 block text-[11px]">共通の想い出ヒント（一般公開）</span>
                <p className="text-slate-900 leading-relaxed font-serif whitespace-pre-wrap">{formData.searcherProfile}</p>
              </div>
            </div>
          </div>

          {/* 3. 二人だけの思い出の質問シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-teal-700 rounded-full inline-block" />
                <HelpCircle size={20} className="text-teal-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">3. 二人だけの思い出の質問</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(1)}
                className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full border border-teal-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="space-y-2.5 text-xs md:text-sm font-sans">
              {questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-teal-900">質問 {idx + 1}:</span>
                    <p className="font-medium text-slate-900">{q.question}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block">設定した答え</span>
                    <span className="font-bold text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs font-mono">
                      {q.answer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 手紙本文シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-indigo-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-indigo-700 rounded-full inline-block" />
                <Mail size={20} className="text-indigo-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">4. 【{formData.targetName || 'お相手'} 様】へ届ける手紙</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(2)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
              <span className="text-indigo-900/70 block text-[11px] mb-1 font-sans">手紙本文（正解後のみ開示）</span>
              <p className="text-slate-900 font-serif leading-relaxed whitespace-pre-wrap text-sm md:text-base">{formData.message}</p>
            </div>
          </div>

          {/* 5. 開示用連絡先シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-teal-700 rounded-full inline-block" />
                <Share2 size={20} className="text-teal-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">5. 開示する連絡先設定</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(2)}
                className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full border border-teal-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm font-sans">
              <div>
                <span className="text-slate-500 text-[11px] block">{formData.contactType} アカウント/リンク</span>
                <span className="font-bold text-slate-900">{formData.contactId}</span>
              </div>
              {formData.contactNote && (
                <div className="text-slate-600 text-xs">
                  <span>メモ: </span>{formData.contactNote}
                </div>
              )}
            </div>
          </div>

          {/* Google検索プレビュー */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <button
              type="button"
              onClick={() => setShowSearchPreview(!showSearchPreview)}
              className="w-full flex items-center justify-between text-left font-bold text-slate-800 text-xs hover:text-brand-primary cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Search size={14} className="text-brand-primary shrink-0" />
                <span>💡 Google検索結果での見え方イメージを確認</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {showSearchPreview ? '閉じる ▲' : 'プレビュー ▼'}
              </span>
            </button>

            {showSearchPreview && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <GoogleSearchResultPreview 
                  targetName={formData.targetName}
                  era={formData.era}
                  location={formData.targetHometown}
                  searcherName={formData.searcherName}
                  teaser={formData.searcherProfile}
                />
              </div>
            )}
          </div>

          {/* ボットチェック */}
          <div className="p-4 bg-teal-50/70 rounded-2xl border-2 border-teal-300/80 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-teal-950 font-bold text-xs">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-teal-700" />
                <span>ボットチェック（スパム防止）</span>
                <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
              </div>
              {captchaAnswer === captchaQuestion.a && (
                <span className="text-[10px] bg-teal-700 text-white font-bold px-2 py-0.5 rounded-md">
                  ✓ 正解
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-base font-serif text-zinc-950 font-bold bg-white px-4 py-2 rounded-xl border border-zinc-300 shadow-2xs">
                {captchaQuestion.q}
              </div>
              <input 
                type="text" 
                name="quiz_bot_prevention_answer"
                id="quiz_bot_prevention_input"
                placeholder="答えを入力" 
                className="w-32 py-2 px-3 border-2 border-zinc-400 focus:border-brand-primary rounded-xl outline-none bg-white font-serif text-base text-center text-zinc-950 font-bold placeholder:text-zinc-400"
                value={captchaAnswer}
                onChange={e => setCaptchaAnswer(toHalfWidth(e.target.value))}
                inputMode="numeric"
                autoComplete="new-password"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer bg-white px-3 py-2 rounded-xl border border-teal-200 shadow-2xs transition-all active:scale-95"
              >
                <RefreshCw size={12} />
                <span>別の問題</span>
              </button>
            </div>
          </div>

          {/* 利用規約同意 */}
          <div 
            onClick={() => setAgreed(!agreed)}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${agreed ? 'bg-emerald-50/80 border-emerald-500 shadow-xs' : 'bg-amber-50/60 border-amber-300 hover:border-amber-400'}`}
          >
            <input 
              type="checkbox" 
              id="agreement"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              onClick={e => e.stopPropagation()}
              className="mt-0.5 w-5 h-5 rounded border-zinc-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
            <div className="text-xs text-zinc-900 leading-relaxed font-sans space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck size={18} className={agreed ? "text-emerald-600" : "text-amber-700"} />
                  <span>利用規約・投稿ガイドラインへの同意</span>
                  <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </div>
                {agreed && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                    ✓ 同意済
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-700 font-medium">
                純粋な再会・旧交目的にのみ利用し、誹謗中傷や不適切な表現を行わないことに同意します。
              </p>
              <div className="text-[11px] text-zinc-600 font-normal flex flex-wrap items-center gap-1 pt-0.5">
                <span>規約を確認：</span>
                <Link 
                  to="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()} 
                  className="text-teal-800 hover:underline font-bold"
                >
                  利用規約
                </Link>
                <span>・</span>
                <Link 
                  to="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()} 
                  className="text-teal-800 hover:underline font-bold"
                >
                  プライバシーポリシー
                </Link>
              </div>
            </div>
          </div>
        </div>
      ),
      isValid: () => agreed && captchaAnswer === captchaQuestion.a
    }
  ];

  const handleNextStep = () => {
    if (steps[step].isValid()) {
      nextStep();
      window.scrollTo(0, 0);
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { immediate: true });
      }
    } else {
      if (step === 0) {
        alert('【Step 1】お相手のお名前、ゆかりの地、年代、関係性、あなたのニックネーム・フルネーム・手がかりをすべてご入力ください。');
      } else if (step === 1) {
        alert('【Step 2】思い出の質問（2問）と答えをすべてご入力ください。');
      } else if (step === 2) {
        alert('【Step 3】手紙のメッセージ本文と、開示用連絡先IDをご入力ください。');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 最終ステップ（Step 4）以外では送信処理は絶対に実行しない
    if (step < steps.length - 1) {
      return;
    }

    // Step遷移直後（800ms以内）の誤クリック・連打を安全にガード
    if (Date.now() - stepEnteredTime < 800) {
      return;
    }
    
    // Check previous steps
    if (!steps[0].isValid()) {
      setStep(0);
      alert('【Step 1: お相手と記憶】の入力項目（お相手の姓名、ゆかりの地、年代、差出人情報など）をご確認ください。');
      return;
    }

    if (!steps[1].isValid()) {
      setStep(1);
      alert('【Step 2: 思い出の質問】の質問2問と答えをご確認ください。');
      return;
    }

    if (!steps[2].isValid()) {
      setStep(2);
      alert('【Step 3: 手紙と連絡先】の手紙本文と開示用連絡先IDをご確認ください。');
      return;
    }
    
    const hasWarnings = Object.values(warnings).some(w => w !== null);
    if (hasWarnings) {
      alert('禁止文字が含まれている項目があります。内容をご確認・修正してください。');
      return;
    }

    if (!agreed) {
      alert('「利用規約・投稿ガイドラインへの同意」のチェックボックスにチェックを入れてください。');
      return;
    }

    if (!captchaAnswer || captchaAnswer !== captchaQuestion.a) {
      alert(`ボットチェック（計算問題: ${captchaQuestion.q}）の答えを正しく入力してください。`);
      return;
    }

    // 既にeKYC完了済みの場合は、eKYC申請手続きを自動スキップして直接認証済みとして投稿
    const alreadyVerified = isEkycCompleted || user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true';
    if (alreadyVerified) {
      executePost(true);
      return;
    }

    // 未認証の場合のみ、eKYC選択・申請モーダルを開く
    setShowPostConfirmModal(true);
    setEkycConfirmStep(1);
  };

  const currentStep = steps[step];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
      <BackToHomeButton className="mb-4" />
      <div className="mb-12 space-y-4">
        <PageHeader
          icon={<Send size={24} className="text-indigo-600" />}
          iconBoxClassName="bg-indigo-50 text-indigo-600 border border-indigo-100"
          category="Create Bottle Mail"
          title="ボトルメールを流す"
          description="いつか届くかもしれない手紙を預かる場所。あなたの記憶を頼りに、いつか再会できることを願って大切に綴っていきましょう。"
          action={
            <Link to="/guidelines" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-black/80 hover:text-black hover:underline font-bold shrink-0 font-sans border border-black/10 px-3 py-1.5 rounded-lg bg-black/5">
              <Shield size={14} />
              <span>ガイドライン</span>
            </Link>
          }
        />

        {/* リッチな海洋テーマ・ボトル流しプログレスバー */}
        <div className="bg-gradient-to-r from-sky-50/90 via-teal-50/80 to-indigo-50/90 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-teal-500/20 shadow-md space-y-4 mb-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-xs font-sans tracking-wide">
                  STEP {step + 1} / {steps.length}
                </span>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline font-sans">
                  {currentStep.title}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 shadow-2xs">
              <Sparkles size={13} className="text-teal-600 animate-pulse" />
              <span>ボトル旅立ちの準備中</span>
            </div>
          </div>

          {/* 波間を進むプログレスバー & ぷかぷかボトル */}
          <div className="relative pt-6 pb-2 px-3">
            {/* 進行状況バー */}
            <div className="relative h-3 w-full bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/40 p-0.5 shadow-inner">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-teal-400 via-sky-500 to-indigo-600 relative overflow-hidden shadow-xs"
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* 光沢アニメーションストライプ */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              </motion.div>
            </div>

            {/* 上下揺らめくボトルアイコン (現在位置と完全同期) */}
            <motion.div 
              className="absolute -top-3 z-20 pointer-events-none -translate-x-1/2"
              initial={{ left: '0%' }}
              animate={{ left: `${((step + 0.5) / steps.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-amber-300 px-2.5 py-1 rounded-full shadow-lg border border-amber-300/40 flex items-center gap-1.5 text-xs font-bold backdrop-blur-xs">
                  <span className="text-base leading-none">🍾</span>
                  <span className="text-[10px] text-amber-100 font-sans tracking-tight">漂流中...</span>
                </div>
                {/* 小さな水滴・波紋効果 */}
                <div className="w-1.5 h-1.5 bg-sky-400/80 rounded-full animate-ping mt-0.5"></div>
              </motion.div>
            </motion.div>

            {/* ステップノード (1, 2, 3) */}
            <div className="relative flex justify-between items-center -mt-2">
              {steps.map((s, i) => {
                const isDone = i < step;
                const isCurrent = i === step;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (i < step) setStep(i);
                    }}
                    disabled={i > step}
                    className={cn(
                      "flex flex-col items-center group transition-all cursor-pointer disabled:cursor-not-allowed",
                      i > step && "opacity-60"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 z-10 border-2",
                        isDone 
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20" 
                          : isCurrent 
                            ? "bg-indigo-600 border-white text-white ring-4 ring-indigo-500/30 shadow-lg scale-110" 
                            : "bg-white border-slate-300 text-slate-400"
                      )}
                    >
                      {isDone ? <Check size={14} className="stroke-[3]" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-[11px] font-bold mt-1.5 transition-colors font-sans max-w-[100px] text-center leading-tight hidden xs:block",
                      isCurrent ? "text-indigo-950 font-black" : isDone ? "text-emerald-800" : "text-slate-400"
                    )}>
                      {i === 0 ? "1. お相手と記憶" : i === 1 ? "2. 思い出の質問" : i === 2 ? "3. 手紙と連絡先" : "4. 最終確認・投函"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-2 bg-white/80 backdrop-blur-xs p-5 md:p-6 rounded-2xl border border-indigo-100 shadow-2xs"
        >
          <div className="flex items-center gap-3 text-indigo-900 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
            <span className="px-3 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200/80 rounded-full font-sans font-bold">Step {step + 1} of {steps.length}</span>
            <span className="w-6 h-[1px] bg-indigo-200"></span>
            <span className="font-sans text-indigo-700 font-bold">{currentStep.title}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-black tracking-wider leading-tight">{currentStep.title}</h2>
          <p className="text-xs md:text-sm text-zinc-700 font-sans leading-relaxed max-w-2xl">{currentStep.description}</p>
        </motion.div>
      </div>

      <div className="glass-card p-8 md:p-12 mb-8">
        <form 
          onSubmit={handleSubmit} 
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault(); 
            }
          }} 
          className="space-y-8"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {currentStep.fields}
          </motion.div>

          {/* 投稿に関する重要な法的責任 - 最終ステップ（流すボタンの直前）のみ表示 */}
          {step === steps.length - 1 && (
            <div className="p-6 bg-white border border-black rounded-2xl space-y-2 shadow-2xs text-black font-sans my-6">
              <div className="flex items-center gap-2 font-bold text-black">
                <ShieldAlert size={18} className="text-amber-600 shrink-0" />
                <span className="text-sm font-serif">投稿に関する重要な法的責任</span>
              </div>
              <p className="text-xs md:text-sm text-black/80 leading-relaxed font-serif text-left">
                ReMEETsは実名での検索を可能にするサービスです。第三者の情報を掲載する際は、相手のプライバシーに十分配慮し、誹謗中傷やストーキング目的での利用は絶対に行わないでください。悪質な利用が確認された場合、公的機関への情報提供を含めた厳正な対処を行います。
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-brand-border">
            {step > 0 ? (
              <button 
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-sm font-bold text-brand-dark/40 hover:text-brand-dark transition-colors uppercase tracking-widest font-sans"
              >
                <ArrowLeft size={16} />
                <span>戻る</span>
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <button 
                type="button"
                onClick={handleNextStep}
                className="btn-primary px-5 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-sans flex items-center gap-2"
              >
                <span>{step === 2 ? '確認画面へ進む' : '次へ進む'}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <button 
                  type="submit"
                  disabled={isSubmitting || !agreed || captchaAnswer !== captchaQuestion.a}
                  className={`btn-primary px-5 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-sans flex items-center gap-2 shadow-lg transition-all ${
                    !agreed || captchaAnswer !== captchaQuestion.a
                      ? 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-brand-accent border-brand-accent hover:bg-brand-dark hover:border-brand-dark cursor-pointer hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ボトルメールを海へ流す</span>
                      <Heart size={16} />
                    </>
                  )}
                </button>
                {(!agreed || captchaAnswer !== captchaQuestion.a) && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    ※ 上の「ボットチェック」と「規約同意」を入力すると投函できます
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-sm text-black leading-relaxed max-w-lg mx-auto">
          ※ 投函された内容は、お相手が検索で見つけられるよう公開されます。<br />
          ※ プライベートメッセージと連絡先は、質問に正解したお相手のみに安全に開示されます。
        </p>
      </div>

      {/* 投函処理中フルスクリーンローディング */}
      {isSubmitting && !showPostConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-teal-100 text-center space-y-4 font-sans">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-slate-900 text-base">
                手紙を海へ流しています...
              </h3>
              <p className="text-xs text-slate-500">
                思い出の暗号化と安全な保護を行っています
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 投函前 eKYC 確認モーダル（5ステップ構成：1.コース選択 2.情報入力 3.カメラ撮影 4.Stripe決済 5.AI監査中） */}
      {showPostConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden text-left flex flex-col max-h-[92vh]">
            {/* モーダルヘッダー */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-indigo-50/50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base font-serif">
                    {ekycConfirmStep === 1 && '手紙の投函・本人確認コースの選択'}
                    {ekycConfirmStep === 2 && '本人確認（eKYC）基本情報入力'}
                    {ekycConfirmStep === 3 && '本人確認書類の撮影'}
                    {ekycConfirmStep === 4 && '本人確認審査手数料のお支払い'}
                    {ekycConfirmStep === 5 && 'AI本人確認・照合処理中'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    {ekycConfirmStep === 1 && '安心・安全な再会をお届けするための選択です'}
                    {ekycConfirmStep === 2 && '公的身分証明書に記載の正確な情報をご入力ください'}
                    {ekycConfirmStep === 3 && '原本を枠内に収めて鮮明に撮影してください'}
                    {ekycConfirmStep === 4 && 'Stripeセキュア決済（審査手数料: 600円）'}
                    {ekycConfirmStep === 5 && '数秒で自動照合と暗号化安全投函が完了します'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (ekycConfirmStep === 5) return;
                  setShowPostConfirmModal(false);
                }}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* モーダル本文 */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-600 font-sans flex-1">
              {/* STEP 1: コース選択 */}
              {ekycConfirmStep === 1 && (
                <>
                  <div className="space-y-4">
                    {/* 【メイン枠】本人確認（eKYC）推奨推進カード */}
                    <div className="border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl p-4 md:p-5 space-y-3 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-sans">
                        推奨・安心バッジ付
                      </div>

                      <div className="flex gap-3">
                        <div className="text-emerald-600 bg-emerald-100/80 p-2.5 rounded-xl shrink-0 h-fit">
                          <ShieldCheck size={22} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                            🛡️ 厳格な公的本人確認（eKYC）
                          </h4>
                          <div className="flex items-center gap-1.5 py-0.5">
                            <span className="text-[10px] text-zinc-500">審査・認証手数料:</span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md font-mono">
                              600円 (税込)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-600 space-y-1.5 leading-relaxed border-t border-emerald-100/80 pt-2 font-sans">
                        <p className="text-[10px] text-emerald-950 font-normal leading-normal">
                          お名前と生年月日を公的身分証（免許証・マイナンバー・パスポートなど）で安全に照合します。
                        </p>
                        <ul className="space-y-1 pl-1 text-[9.5px] text-zinc-500">
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                            <span>手紙やお相手とのやり取りに<strong>「🛡️ 認証済マーク」</strong>が表示され、なりすましを防止します。</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                            <span>「本物のあなた」からの手紙であることが伝わるため、<strong>お相手の返信率が劇的に上がります。</strong></span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                            <span>送信された画像データは照合完了後、<strong>直ちに完全に破棄（パージ）</strong>されるため極めて安全です。</span>
                          </li>
                        </ul>
                      </div>

                      {/* 本人確認を登録して投函ボタン */}
                      <button
                        type="button"
                        onClick={() => {
                          setEkycConfirmStep(2);
                        }}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                      >
                        <ShieldCheck size={16} />
                        <span>⚡ 本人確認決済手続きへ進む</span>
                      </button>
                    </div>

                    {/* 【無料枠】本人確認をせずに無料投函カード（eKYCカードの半分以下の高さで視認性を確保） */}
                    <div className="border-2 border-brand-primary/50 bg-slate-50/90 rounded-2xl p-3.5 md:p-4 space-y-2.5 shadow-sm relative">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <Send size={16} className="text-brand-primary shrink-0" />
                          <h4 className="font-serif font-bold text-xs md:text-sm text-slate-900">
                            ✨ 通常投函（無料）
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-200/90 text-slate-700 px-2 py-0.5 rounded-md font-sans shrink-0">
                          0円 / 手数料なし
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        認証マークなしで、すぐにボトルメールを海へ流します。<br />
                        <span className="text-[10px] text-slate-500">※ 投函後にマイページから本人確認（eKYC）を行い、後から「🛡️ 認証済マーク」を付与することも可能です。</span>
                      </p>

                      <button
                        type="button"
                        onClick={() => executePost(false)}
                        className="w-full py-3 px-4 bg-brand-dark hover:bg-[#1e4f7a] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                      >
                        <Send size={15} />
                        <span>⚡ 本人確認をせずにボトルを投函する（無料）</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: eKYC フォーム入力 */}
              {ekycConfirmStep === 2 && (
                <div className="space-y-4 py-2 text-left">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">
                      1. オンライン本人確認 (eKYC) 情報入力
                    </h3>
                    <p className="text-xs text-zinc-500">
                      法令に基づく年齢確認と本人照合を行います。原本は確認後すぐに破棄されます。
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                        <span>お名前（漢字・ご本名フルネーム）</span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">必須</span>
                      </label>
                      <input 
                        type="text"
                        value={ekycName}
                        onChange={(e) => setEkycName(e.target.value)}
                        placeholder="例：本間 隆"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-xl bg-slate-50 focus:border-brand-primary outline-none text-xs text-black"
                      />
                    </div>

                    {/* Birthdate */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                        <span>生年月日</span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">必須</span>
                      </label>
                      <input 
                        type="date"
                        value={ekycBirthdate}
                        onChange={(e) => setEkycBirthdate(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-xl bg-slate-50 focus:border-brand-primary outline-none text-xs text-black"
                      />
                    </div>

                    {/* Doc Type Selection */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">提出書類の選択</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'license', name: '運転免許証' },
                          { id: 'mynumber', name: 'マイナンバー' },
                          { id: 'passport', name: 'パスポート' }
                        ].map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setEkycDocType(doc.id as any)}
                            className={`py-1.5 border-2 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer ${
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

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEkycName('本間 隆');
                          setEkycBirthdate('1985-06-15');
                        }}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100"
                      >
                        ⚡ デモ用サンプルデータを自動入力する
                      </button>
                    </div>

                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEkycConfirmStep(1)}
                      className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold font-sans text-center transition-all cursor-pointer"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!ekycName.trim()) {
                          alert('お名前を入力してください。');
                          return;
                        }
                        if (!ekycBirthdate) {
                          alert('生年月日を入力してください。');
                          return;
                        }
                        setEkycConfirmStep(3);
                      }}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold font-sans text-center transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>証明書の撮影画面へ進む（ガイド枠あり）</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Document Camera Capture with Guidelines Overlay */}
              {ekycConfirmStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-black font-serif">2. 身分証明書の撮影・アップロード</h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      反射や四隅の欠けを防ぐガイドライン枠線に合わせて撮影を行ってください。
                    </p>
                  </div>

                  <DocumentCameraOverlay
                    docType={ekycDocType}
                    docTypeName={
                      ekycDocType === 'license' ? '運転免許証' : ekycDocType === 'mynumber' ? 'マイナンバーカード' : 'パスポート'
                    }
                    onBack={() => setEkycConfirmStep(2)}
                    onComplete={(imgs) => {
                      setPostCapturedImages(imgs);
                      setEkycConfirmStep(4);
                    }}
                  />
                </div>
              )}

              {/* Step 4: Payment (Credit Card Billing) */}
              {ekycConfirmStep === 4 && (
                <div className="space-y-5 py-2 text-left">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 animate-bounce">
                      <CreditCard size={24} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-zinc-900 text-center">
                      3. 安全照合システム手数料のお支払い
                    </h3>
                    <p className="text-xs text-zinc-500 text-center">
                      なりすまし防止・安全対策を維持するための手数料決済です。
                    </p>
                  </div>

                  {/* Document capture summary badge */}
                  {postCapturedImages.front && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>身分証撮影完了（全3枚・カメラ自動切断・暗号化保護）</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEkycConfirmStep(3)}
                        className="text-[11px] text-teal-700 hover:underline font-bold cursor-pointer shrink-0 ml-2"
                      >
                        再撮影
                      </button>
                    </div>
                  )}

                  <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
                    <div className="text-[10px] text-rose-800 font-bold tracking-wider">ご請求金額</div>
                    <div className="text-3xl font-sans font-extrabold text-rose-950 flex items-baseline justify-center gap-1">
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
                    refundGuaranteeText="手紙開封または本人確認（eKYC）手続きが不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。"
                  />

                  {/* 18歳以上・利用規約・eKYC決済同意チェックボックス */}
                  <label className="flex items-start gap-3 p-3 bg-slate-50/90 rounded-xl border border-slate-200/90 hover:bg-slate-100/80 text-xs font-medium text-slate-800 cursor-pointer select-none leading-relaxed transition-all">
                    <input 
                      type="checkbox" 
                      id="ekyc-post-payment-consent"
                      defaultChecked={true}
                      className="w-4 h-4 mt-0.5 accent-teal-600 focus:ring-teal-500 border-zinc-300 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-slate-700 leading-snug">
                      <strong>【18歳以上・規約同意】</strong> 私は18歳以上であり、利用規約およびeKYC本人確認審査手数料（600円 税込）の決済に同意します。
                    </span>
                  </label>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => setEkycConfirmStep(3)}
                      className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold font-sans text-center transition-all cursor-pointer disabled:opacity-55"
                    >
                      撮影に戻る
                    </button>
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => {
                        const checkConsent = document.getElementById('ekyc-post-payment-consent') as HTMLInputElement;
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
                        if (checkConsent && !checkConsent.checked) {
                          alert('18歳以上の年齢確認および利用規約への同意にチェックを入れてください。');
                          return;
                        }
                        setIsPaying(true);
                        setTimeout(() => {
                          setIsPaying(false);
                          setEkycConfirmStep(5); // 照合・投稿プロセスへ
                        }, 1200);
                      }}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-sans text-center transition-all shadow-md cursor-pointer disabled:opacity-55 flex items-center justify-center gap-1.5"
                    >
                      {isPaying ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>決済処理中...</span>
                        </>
                      ) : (
                        <span>安全に600円を支払う</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Processing */}
              {ekycConfirmStep === 5 && (
                <div className="space-y-6 py-4 text-center font-serif">
                  {/* 中央の二重発光スピナー & アイコン */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    {/* 外周の発光オーラ */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
                    
                    {/* スピナーリング（外側・反時計回り） */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-teal-300/60 animate-[spin_8s_linear_infinite]" />
                    
                    {/* スピナーリング（内側・時計回り） */}
                    <div className="absolute w-20 h-20 rounded-full border-3 border-teal-100 border-t-emerald-600 border-r-teal-500 animate-spin" />
                    
                    {/* 中央コンテンツ */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-teal-800 font-serif">
                      <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent pl-0.5">
                        {ekycProgress}%
                      </span>
                      <span className="text-[9px] font-semibold text-teal-600/80 uppercase tracking-[0.22em] -mt-0.5">
                        Processing
                      </span>
                    </div>
                  </div>

                  {/* ステータスタイトル */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-serif font-bold tracking-[0.1em] shadow-xs">
                      <ShieldCheck size={14} className="text-emerald-600 animate-pulse" />
                      <span>公的本人確認・認証マーク付与中</span>
                    </div>
                    <h3 className="text-base font-serif font-extrabold tracking-[0.12em] md:tracking-[0.16em] text-zinc-900 pt-1">
                      {ekycProgress < 25 && '1. 決済の安全トークン化処理'}
                      {ekycProgress >= 25 && ekycProgress < 50 && '2. 公的書類データ＆暗号照合'}
                      {ekycProgress >= 50 && ekycProgress < 75 && '3. 生体ライブネス実在判定'}
                      {ekycProgress >= 75 && ekycProgress < 100 && '4. 認証キー発行＆ボトル投函準備'}
                      {ekycProgress === 100 && (isSubmitting ? '🌊 ボトルメールを海へ投函中...' : '✨ 認証＆ボトル投函完了！詳細ページへ移動します')}
                    </h3>
                  </div>

                  {/* プログレスバー本体 */}
                  <div className="space-y-1.5 px-2">
                    <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                      <span className="flex items-center gap-1 text-[11px] text-teal-700 font-serif tracking-[0.1em]">
                        <Lock size={12} /> 256bit 暗号化通信
                      </span>
                      <span className="text-emerald-700 font-bold font-serif tracking-[0.12em]">{ekycProgress} / 100%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                        style={{ width: `${ekycProgress}%` }}
                      >
                        {/* バー先端のLED光彩ノード */}
                        {ekycProgress > 0 && ekycProgress < 100 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4ステップ進行タイムラインリスト */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 0 && ekycProgress < 25 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : ekycProgress >= 25 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress >= 25 ? '✓' : '1'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">決済承認＆セキュリティトークン化</span>
                      </span>
                      {ekycProgress < 25 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">処理中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 25 && ekycProgress < 50 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : ekycProgress >= 50 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress >= 50 ? '✓' : '2'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">公的書類・文字データ暗号解析</span>
                      </span>
                      {ekycProgress >= 25 && ekycProgress < 50 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">解析中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 50 && ekycProgress < 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : ekycProgress >= 75 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress >= 75 ? '✓' : '3'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">実在生身人間（ライブネス）判定</span>
                      </span>
                      {ekycProgress >= 50 && ekycProgress < 75 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">判定中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress === 100 ? '✓' : '4'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">🛡️ 認証マーク付与＆ボトル投函完了</span>
                      </span>
                      {ekycProgress >= 75 && ekycProgress < 100 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">投函中...</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


