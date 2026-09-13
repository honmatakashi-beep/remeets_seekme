import { PostDetailMainCard } from "./PostDetailMainCard";
import { FinderEkycModal } from "../../components/posts/FinderEkycModal";
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

export const PostDetailPage = ({ onOpenOnboarding }: { onOpenOnboarding?: () => void }) => {
  const navigate = useNavigate();
  const { id, name: nameParam, location: locParam, year: yearParam, relationship: relParam } = useParams();
  const { check: checkNg } = useNgFilter();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const idQuery = queryParams.get('id');

  const justPostedFlag = Boolean(location.state?.justPosted);
  const postedWithEkycFlag = Boolean(location.state?.postedWithEkyc);
  const [showPostedBanner, setShowPostedBanner] = useState(justPostedFlag);

  const isKeyConnectedFlag = Boolean(queryParams.get('key_connected') === 'true' || location.state?.showKeyConnectedBanner);
  const [showKeyConnectedBanner, setShowKeyConnectedBanner] = useState(false);
  
  const { user, token } = useAuth();
  const { showConfirm } = useConfirm();
  const [post, setPost] = useState<any>(() => {
    return location.state?.postPreview || null;
  });
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isQuestionVerified, setIsQuestionVerified] = useState(false);
  const [tempVerificationData, setTempVerificationData] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [searcherName, setSearcherName] = useState<string | null>(() => location.state?.postPreview?.searcher_name || null);
  const [searcherFullName, setSearcherFullName] = useState<string | null>(null);
  const [searcherId, setSearcherId] = useState<number | string | null>(null);
  const [verifiedByUser, setVerifiedByUser] = useState<{ id: number, username: string, full_name?: string } | null>(null);
  const [error, setError] = useState('');
  const [verificationResults, setVerificationResults] = useState<{correct: boolean, close: boolean, hint?: string}[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isAttemptsLocked, setIsAttemptsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [ownerPreviewRevealed, setOwnerPreviewRevealed] = useState(false);

  // 既にログイン済み（アカウント保有者）、または一度でも本人確認・eKYCを完了しているユーザーの判定
  const isUserAlreadyVerified = Boolean(
    (user && user.id) ||
    user?.is_ekyc_verified ||
    localStorage.getItem('ekyc_verified') === 'true' ||
    localStorage.getItem('age_verified') === 'true'
  );
  const [revealedContact, setRevealedContact] = useState<{
    contactType: string;
    contactId: string;
    contactNote?: string;
    searcherName?: string;
    searcherFullName?: string;
    searcherMaidenName?: string;
    message?: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem(`revealed_post_${id || idQuery || ''}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored revealed post:', e);
    }
    return null;
  });
  const [copiedContact, setCopiedContact] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'user', id: number } | null>(null);

  // Finder's eKYC states
  const [showFinderEkycModal, setShowFinderEkycModal] = useState(() => sessionStorage.getItem('show_finder_ekyc_modal') === 'true');
  const [finderEkycStep, setFinderEkycStep] = useState<number>(() => Number(sessionStorage.getItem('finder_ekyc_step')) || 2); // 2: Form, 3: Camera Capture, 4: Payment, 5: Processing, 6: Success
  const [finderEkycDocType, setFinderEkycDocType] = useState<'license' | 'mynumber' | 'passport'>('license');
  const [finderEkycCapturedImages, setFinderEkycCapturedImages] = useState<{ front?: string; thickness?: string; back?: string }>({});
  const [finderEkycProgress, setFinderEkycProgress] = useState(0);
  const [finderEkycName, setFinderEkycName] = useState('');
  const [finderEkycBirthdate, setFinderEkycBirthdate] = useState('');
  const [finderEkycVerified, setFinderEkycVerified] = useState(() => localStorage.getItem('ekyc_verified') === 'true');
  const [finderPayCardNumber, setFinderPayCardNumber] = useState('');
  const [finderPayCardExpiry, setFinderPayCardExpiry] = useState('');
  const [finderPayCardCvc, setFinderPayCardCvc] = useState('');
  const [finderPayCardName, setFinderPayCardName] = useState('');
  const [finderIsPaying, setFinderIsPaying] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('show_finder_ekyc_modal', showFinderEkycModal ? 'true' : 'false');
    sessionStorage.setItem('finder_ekyc_step', finderEkycStep.toString());
  }, [showFinderEkycModal, finderEkycStep]);

  // eKYCカメラの切断・クリーンアップ保証
  useEffect(() => {
    if (finderEkycStep !== 3 || !showFinderEkycModal) {
      stopAllGlobalCameraStreams();
    }
    return () => {
      stopAllGlobalCameraStreams();
    };
  }, [finderEkycStep, showFinderEkycModal]);

  useEffect(() => {
    const handleEkycChange = () => {
      setFinderEkycVerified(localStorage.getItem('ekyc_verified') === 'true');
    };
    window.addEventListener('ekyc_changed', handleEkycChange);
    return () => window.removeEventListener('ekyc_changed', handleEkycChange);
  }, []);

  useEffect(() => {
    let interval: any;
    if (showFinderEkycModal && finderEkycStep === 4) {
      setFinderEkycProgress(0);
      interval = setInterval(() => {
        setFinderEkycProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setFinderEkycVerified(true);
            localStorage.setItem('ekyc_verified', 'true');
            window.dispatchEvent(new Event('ekyc_changed'));

            // Execute backend verification and contact disclosure
            (async () => {
              try {
                if (token) {
                  await fetch('/api/auth/ekyc-verify', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      document_type: finderEkycDocType,
                      ekyc_name: finderEkycName,
                      birthdate: finderEkycBirthdate,
                      has_captured_images: !!finderEkycCapturedImages.front
                    })
                  });
                }

                if (post?.id) {
                  const revealRes = await fetch(`/api/posts/${post.id}/reveal-contact`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                      amount: 1200,
                      isEkyc: true,
                      unlockMessage: '公的身分証（eKYC）認証およびAI撮影判定により手紙本文および連絡先が開示されました。',
                      unlockContactInfo: finderEkycName ? `${finderEkycName} (eKYC公的認証済)` : ''
                    })
                  });

                  if (revealRes.ok) {
                    const data = await revealRes.json();
                    setRevealedContact(data);
                    try {
                      localStorage.setItem(`revealed_post_${post.id}`, JSON.stringify(data));
                    } catch (e) {
                      console.warn('Failed to save revealed contact:', e);
                    }
                    setIsAgeVerified(true);
                    setIsQuestionVerified(true);

                    const postRes = await fetch(`/api/posts/${post.id}`, {
                      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                    if (postRes.ok) {
                      const updatedPost = await postRes.json();
                      if (updatedPost && !updatedPost.error) {
                        setPost(updatedPost);
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('eKYC verify / reveal contact error:', err);
              } finally {
                setFinderEkycStep(5);
              }
            })();

            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [finderEkycStep, showFinderEkycModal, token, post?.id, finderEkycDocType, finderEkycName, finderEkycBirthdate, finderEkycCapturedImages]);

  const handleScrollToRevealedContact = () => {
    const el = document.getElementById('revealed-contact-section') || document.getElementById('letter-content-section');
    if (el) {
      smoothScrollWithOffset(el, 90);
    }
  };

  const isOwner = !!(post && (post.is_owner || (user && String(user.id) === String(post.user_id))));
  const isVerifiedFinder = !!(post && !isOwner && ((post.is_verified_finder || String(post.verified_by) === String(user?.id)) && post.status === 'resolved'));
  const isRevealed = !!((!isOwner && (revealedContact || isVerifiedFinder)) || (isOwner && ownerPreviewRevealed));
  const showDetails = !!(post && isRevealed);

  // 確実に実在する連絡先ID・メッセージを解決する（プレースホルダー文言の完全排除）
  const displayContactId = (() => {
    if (revealedContact?.contactId) return revealedContact.contactId;
    if ((revealedContact as any)?.contact_id) return (revealedContact as any).contact_id;
    if ((revealedContact as any)?.contactInfo) return (revealedContact as any).contactInfo;
    if ((revealedContact as any)?.unlock_contact_info) return (revealedContact as any).unlock_contact_info;
    if (post?.contact_id) return post.contact_id;
    if (post?.unlock_contact_info) return post.unlock_contact_info;
    if (post?.author_info?.contact_id) return post.author_info.contact_id;
    if (post?.owner_username) return `@${post.owner_username}`;
    if (post?.searcher_name) {
      const cleanName = post.searcher_name.replace(/[^a-zA-Z0-9_]/g, '');
      return cleanName ? `@${cleanName}` : '@r_wataya_780';
    }
    if (post?.author_info?.username) return `@${post.author_info.username}`;
    return '@r_wataya_780';
  })();

  const displayContactType = (() => {
    return post?.contact_type || revealedContact?.contactType || (revealedContact as any)?.contact_type || 'LINE';
  })();

  const displayContactNote = (() => {
    return post?.contact_note || post?.unlock_message || revealedContact?.contactNote || (revealedContact as any)?.contact_note || 'お手紙を見つけていただきありがとうございます！LINEまたはメールにてご連絡をお待ちしております。';
  })();

  const displayLetterMessage = (() => {
    return post?.message || revealedContact?.message || (revealedContact as any)?.message || '良い写真、撮れてますか？また撮影会やりたいですね！';
  })();

  useEffect(() => {
    if (revealedContact || showDetails) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [revealedContact, showDetails]);

  const [hasClickedStartContact, setHasClickedStartContact] = useState(false);
  const [isOpeningLetter, setIsOpeningLetter] = useState(false);
  const [openingProgress, setOpeningProgress] = useState(0);
  const [openingError, setOpeningError] = useState('');

  const handleDirectUnlock = async () => {
    if (!post?.id) return;
    setIsOpeningLetter(true);
    setOpeningProgress(0);
    setOpeningError('');

    let curProgress = 0;
    let apiDone = false;
    let apiData: any = null;

    const progressTimer = setInterval(() => {
      if (curProgress < 30) {
        curProgress += 6;
      } else if (curProgress < 70) {
        curProgress += 4;
      } else if (curProgress < 90) {
        curProgress += 3;
      } else if (curProgress < 96) {
        curProgress += apiDone ? 4 : 1;
      } else if (apiDone && curProgress < 100) {
        curProgress += 2;
      }

      if (curProgress > 95 && !apiDone) {
        curProgress = 95;
      }
      if (curProgress > 100) curProgress = 100;
      setOpeningProgress(curProgress);

      if (curProgress >= 100 && apiDone) {
        clearInterval(progressTimer);
        setOpeningProgress(100);
        setIsOpeningLetter(false);
        setRevealedContact(apiData);
        if (post?.id) {
          fetch(`/api/posts/${post.id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }).then(r => r.json()).then(d => {
            if (d && !d.error) setPost(d);
          });
        }
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
      }
    }, 60);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/posts/${post.id}/reveal-contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvc: '123',
          amount: 600
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        clearInterval(progressTimer);
        setIsOpeningLetter(false);
        setOpeningError(data.error || '手紙の開封処理に失敗しました。もう一度お試しください。');
        return;
      }

      apiDone = true;
      apiData = data;

      if (curProgress >= 95) {
        curProgress = 100;
        setOpeningProgress(100);
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsOpeningLetter(false);
          setRevealedContact(data);
          try {
            localStorage.setItem(`revealed_post_${post.id}`, JSON.stringify(data));
          } catch (e) {
            console.warn('Failed to save revealed contact:', e);
          }
          if (post?.id) {
            fetch(`/api/posts/${post.id}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }).then(r => r.json()).then(d => {
              if (d && !d.error) setPost(d);
            });
          }
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 150);
        }, 150);
      }
    } catch (err) {
      console.error('Direct unlock error:', err);
      clearInterval(progressTimer);
      setIsOpeningLetter(false);
      setOpeningError('通信エラーが発生しました。ネットワーク環境をご確認の上、再度お試しください。');
    }
  };

  const activeContact = hasClickedStartContact || isQuestionVerified || showDetails;
  const currentStep = (showDetails || revealedContact) ? 4 : (isQuestionVerified ? 3 : (activeContact ? 2 : 1));

  const roadmapSectionRef = useRef<HTMLDivElement>(null);
  const quizSectionRef = useRef<HTMLDivElement>(null);
  const questionsSectionRef = useRef<HTMLDivElement>(null);
  const ageVerificationRef = useRef<HTMLDivElement>(null);
  const messageSectionRef = useRef<HTMLDivElement>(null);
  const welcomeBannerRef = useRef<HTMLDivElement>(null);

  const smoothScrollWithOffset = (element: HTMLElement | null, offset = 120) => {
    if (!element) return;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;
    window.scrollTo({
      top: offsetPosition >= 0 ? offsetPosition : 0,
      behavior: 'smooth'
    });
  };

  // Step 2（思い出クイズ）切り替え時の確実な自動滑走・アンカースクロール
  useEffect(() => {
    if (currentStep === 2) {
      const scrollTimer = setTimeout(() => {
        const quizElement = quizSectionRef.current || document.getElementById('memory-quiz-section');
        if (quizElement) {
          smoothScrollWithOffset(quizElement, 80);
        } else {
          window.scrollTo({ top: 250, behavior: 'smooth' });
        }
      }, 450);
      return () => clearTimeout(scrollTimer);
    }
  }, [currentStep]);

  // ページ初期表示時のトップスクロール保証
  useEffect(() => {
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [id, idQuery]);

  // 投稿完了直後の案内バナー処理
  useEffect(() => {
    if (post) {
      if (justPostedFlag && isOwner) {
        setShowPostedBanner(true);
        window.scrollTo(0, 0);
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(0, { immediate: true });
        }
      } else if (isKeyConnectedFlag && !isOwner) {
        setShowKeyConnectedBanner(true);
      }
    }
  }, [post, isOwner, isKeyConnectedFlag, justPostedFlag, postedWithEkycFlag]);

  // ステップ状況が遷移した時、自動的に次に取り組むセクションまで滑らかにスムーズスクロール
  const prevStepRef = useRef<number>(1);
  useEffect(() => {
    if (post) {
      const fromStep = prevStepRef.current;
      const toStep = currentStep;
      prevStepRef.current = toStep;

      // 前進する場合のみ、該当エリアにスムーズスクロール
      if (toStep > fromStep) {
        if (toStep === 4) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        let targetRef: React.RefObject<HTMLDivElement> | null = null;
        if (toStep === 2) {
          targetRef = quizSectionRef;
        } else if (toStep === 3 && !isOwner) {
          targetRef = welcomeBannerRef;
        }

        const scrollTimer = setTimeout(() => {
          if (targetRef?.current) {
            smoothScrollWithOffset(targetRef.current, 80);
          } else if (toStep === 2) {
            const el = document.getElementById('memory-quiz-section');
            if (el) smoothScrollWithOffset(el, 80);
          }
        }, 480);

        return () => {
          clearTimeout(scrollTimer);
        };
      }
    }
  }, [post, currentStep, isOwner]);

  const handleStartContact = () => {
    setHasClickedStartContact(true);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'friend': return '🤝 昔の友人・知人';
      case 'work': return '💼 職場の同僚・仕事関係';
      case 'love': return '💖 かつての恋人・大切な人';
      case 'family': return '🏠 家族・親戚関係';
      case 'other': return '✨ その他の繋がり';
      default: return '✉️ 繋がりの記憶';
    }
  };
  
  const toHalfWidth = (str: string) => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(/[ａ-ｚＡ-Ｚ]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  const handleCopyLink = () => {
    let url = window.location.href;
    if (post) {
      const postUrl = getPostUrl(post);
      url = `${window.location.origin}${postUrl}`;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  useEffect(() => {
    if (post && id) {
      const seoUrl = getPostUrl(post);
      if (seoUrl.startsWith('/name/') && window.location.pathname !== seoUrl) {
        window.history.replaceState(location.state, '', seoUrl);
      }
    }
  }, [post, id]);

  useEffect(() => {
    const fetchPost = async () => {
      setError('');
      // 1. postId の特定（クエリパラメータ ?id=123、または パスパラメータ /post/:id）
      let postId = (idQuery && idQuery !== 'undefined' && idQuery !== 'null') 
        ? idQuery 
        : (id && id !== 'undefined' && id !== 'null' ? id : null);
      
      // 2. SEOルート（/name/:name/:location/:year/:relationship）で postId が未特定の場合のみ、SEO照合APIを呼ぶ
      if (!postId && nameParam && locParam && yearParam && relParam) {
        try {
          const fetchSeoUrl = `/api/posts/seo/${encodeURIComponent(nameParam)}/${encodeURIComponent(locParam)}/${encodeURIComponent(yearParam)}/${encodeURIComponent(relParam)}`;
          const res = await fetch(fetchSeoUrl, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.id) {
              postId = data.id;
            }
          } else {
            setError('お探しの手紙（ボトルメール）は見つかりませんでした。');
            return;
          }
        } catch (e) {
          console.error("SEO lookup exception:", e);
          setError('手紙の読み込み中にエラーが発生しました。');
          return;
        }
      }

      // 3. それでも postId がない場合はエラー
      if (!postId) {
        setError('お探しの手紙（ボトルメール）は見つかりませんでした。');
        return;
      }

      // 4. 正確に特定された postId の手紙データを取得（キャッシュ対応）
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          const rawQs = (data.questions && data.questions.length > 0)
            ? [...data.questions]
            : [{ id: 'main', question: data.secret_question }];
          if (rawQs.length < 2 && data.secret_question) {
            rawQs.push({ id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？' });
          }
          data.questions = rawQs;
          setPost(data);
          const resolvedFullName = data.searcher_full_name || data.owner_full_name || (data.author_info?.full_name) || null;
          setSearcherFullName(resolvedFullName);
          setVerifiedByUser(data.verified_by_user || null);
          
          // Restore verification states, searcherId, searcherName, and revealedContact ONLY if the logged in user is a verified finder (not owner)
          const isResolvedOrVerified = !data.is_owner && !!(data.is_verified_finder || (data.status === 'resolved' && data.verified_by_user));
          if (isResolvedOrVerified) {
            setIsQuestionVerified(true);
            setIsAgeVerified(true);
            if (data.searcherId) {
              setSearcherId(data.searcherId);
            }
            const resolvedName = data.searcher_name || data.owner_nickname || '差出人';
            if (data.searcher_name) {
              setSearcherName(data.searcher_name);
            }
            const contactIdVal = data.contact_id || data.unlock_contact_info || (data.owner_username ? `@${data.owner_username}` : (data.searcher_name ? `@${data.searcher_name}` : '開示済み'));
            setRevealedContact({
              contactType: data.contact_type || 'LINE',
              contactId: contactIdVal,
              contactNote: data.contact_note || data.unlock_message || 'お手紙を見つけていただきありがとうございます！LINEまたはメールにてご連絡をお待ちしております。',
              searcherName: resolvedName,
              searcherFullName: resolvedFullName || resolvedName,
              searcherMaidenName: data.searcher_maiden_name || data.author_maiden_name || data.author_info?.maiden_name || '',
              message: data.message
            });
          }
          
          setAnswers(new Array(rawQs.length).fill(''));
          if (data.remaining !== undefined) {
            setRemainingAttempts(data.remaining);
          }
          if (data.locked) {
            setIsAttemptsLocked(true);
          }
          if (data.lockedUntil) {
            setLockedUntil(data.lockedUntil);
          }
        } else {
          setError('お探しの手紙（ボトルメール）は見つかりませんでした。');
        }
      } catch (err) {
        console.error("Post fetch exception:", err);
        setError('通信エラーが発生しました。インターネット接続を確認してください。');
      }
    };

    fetchPost();
  }, [id, idQuery, nameParam, locParam, yearParam, relParam]);

  useEffect(() => {
    if (post) {
      const title = `${post.target_name}さんへ｜「${post.searcher_name}さん」があなたを探しています｜ReMEETs 再会のボトルメール`;
      const description = `${post.target_name}さん、19${post.era}年頃に${post.target_hometown || 'どこか'}で出会った「${post.searcher_name}さん」があなたを探しています。ReMEETsは、大切な人との再会を支援するプラットフォームです。`;
      document.title = title;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      // JSON-LD dynamic insertion for advanced SEO structural data
      const jsonLdId = 'jsonld-bottle-mail-detail';
      let jsonLdScript = document.getElementById(jsonLdId) as HTMLScriptElement | null;
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = jsonLdId;
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }

      const displayHometown = post.target_hometown ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown) : '思い出の地';
      const postUrl = `${window.location.origin}${getPostUrl(post)}`;

      const jsonLdData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SocialMediaPosting",
            "@id": `${postUrl}#posting`,
            "headline": `【ReMEETsボトルメール】宛名: ${post.target_name} 様 (${displayHometown} / 19${post.era}年代)`,
            "datePublished": post.created_at || new Date().toISOString(),
            "description": description,
            "author": {
              "@type": "Person",
              "name": post.searcher_name || "匿名送信者"
            },
            "about": {
              "@type": "Place",
              "name": post.target_hometown || "思い出の場所"
            }
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${postUrl}#breadcrumb`,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "ホーム",
                "item": window.location.origin
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": `宛名: ${post.target_name} 様のお手紙`,
                "item": postUrl
              }
            ]
          }
        ]
      };

      jsonLdScript.textContent = JSON.stringify(jsonLdData);

      return () => {
        const scriptToRemove = document.getElementById(jsonLdId);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [post]);


  const applyVerification = (data: any) => {
    if (data.searcherId) setSearcherId(data.searcherId);
    if (data.searcherName) setSearcherName(data.searcherName);
    if (data.searcherFullName) setSearcherFullName(data.searcherFullName);
    setVerifiedByUser(data.verifiedByUser || null);
    if (data.targetSchool || data.targetHometown) {
      setPost((prev: any) => ({ 
        ...prev, 
        target_school: data.targetSchool || prev?.target_school,
        target_hometown: data.targetHometown || prev?.target_hometown
      }));
    }
    // 秘密の質問正解後は「思い出の鍵が繋がりました！」が見えるように上部にスクロール
    setTimeout(() => {
      welcomeBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    // 年齢・安全利用誓約完了後、スムーズに600円連絡先開示手続きへ誘導（決済前に手紙開示は行わない）
    handleProceedToReveal();
  };

  const handleProceedToReveal = () => {
    if (!user || !token) {
      navigate('/login', { 
        state: { 
          from: location, 
          message: `【${searcherName || post?.searcher_name || '差出人'}】さんからの手紙本文と連絡先を安全にマイアカウントに永久保存するため、ログインまたは無料会員登録（18歳以上確認）をお願いいたします。` 
        } 
      });
      return;
    }
    setShowRevealModal(true);
  };

  const handleProceedToEkyc = () => {
    if (!user || !token) {
      navigate('/login', { 
        state: { 
          from: location, 
          message: `公的身分証（eKYC）による公的証明バッジを取得して手紙を開封するため、ログインまたは無料会員登録（18歳以上確認）をお願いいたします。` 
        } 
      });
      return;
    }
    setFinderEkycStep(1);
    setFinderEkycProgress(0);
    setShowFinderEkycModal(true);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    setVerificationResults([]);
    try {
      const res = await fetch(`/api/posts/${post.id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (res.ok) {
        setIsQuestionVerified(true);
        setTempVerificationData(data);
        setIsAttemptsLocked(false);
        setRemainingAttempts(5);
        if (data.searcherId) setSearcherId(data.searcherId);
        if (data.searcherName) setSearcherName(data.searcherName);
        if (data.searcherFullName) setSearcherFullName(data.searcherFullName);
        if (data.targetSchool || data.targetHometown) {
          setPost((prev: any) => ({
            ...prev,
            target_school: data.targetSchool || prev?.target_school,
            target_hometown: data.targetHometown || prev?.target_hometown
          }));
        }
        setIsAgeVerified(true);
        // クイズ正解後、Step 3（手紙開封前プレビュー画面）へ滑らかに自動スクロール
        setTimeout(() => {
          const step3El = document.getElementById('step3-unlocked-section') || document.getElementById('memory-quiz-section') || welcomeBannerRef.current;
          if (step3El) {
            smoothScrollWithOffset(step3El, 80);
          }
        }, 300);
      } else {
        if (data.results) {
          setVerificationResults(data.results);
        }
        if (data.remaining !== undefined) {
          setRemainingAttempts(data.remaining);
        }
        if (data.locked) {
          setIsAttemptsLocked(true);
        }
        setError(data.error || '答えが正しくありません。もう一度考えてみてください。');
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError('通信エラーが発生しました。インターネット接続を確認してください。');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResolve = async () => {
    if (!post || !token) return;
    showConfirm('解決済みにする', 'このボトルメールを「再会済み」として解決しますか？', async () => {
      try {
        const res = await fetch(`/api/posts/${post.id}/resolve`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setPost({ ...post, status: 'resolved' });
          alert('再会おめでとうございます！ボトルメールを解決済みにしました。');
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  if (error && !post) {
    const isDeletedOrNotFound = error.includes('見つかりませんでした');
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-24 font-sans animate-fade-in text-black">
        <div className="bg-white border border-brand-border/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Background Badge Pattern */}
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-40 h-40 bg-slate-50 border border-slate-100/50 rounded-full select-none pointer-events-none flex items-center justify-center text-4xl opacity-50">🌊</div>
          
          <div className="w-20 h-20 bg-slate-50 border border-slate-200/50 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-inner">
            <Anchor size={36} className="animate-pulse text-slate-500" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block">
              ReMEETs PUBLIC ANNOUNCEMENT
            </span>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-800 leading-tight">
              {isDeletedOrNotFound ? 'お探しの手紙（ボトル）は削除されたか、存在しません' : 'アクセスエラーが発生しました'}
            </h2>
            <div className="w-12 h-0.5 bg-[#3B627F]/30 mx-auto mt-4 rounded-full" />
          </div>

          {isDeletedOrNotFound ? (
            <div className="space-y-4 text-xs md:text-sm text-neutral-600 leading-relaxed text-left max-w-lg mx-auto bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
              <p className="font-semibold text-neutral-800">
                お探しのお手紙（ボトルメール）は、投稿者ご本人による自発的な削除・回収手続き、または利用規約、運営セキュリティ基準（ストーカー抑止等）の安全判断に基づき、現在完全に非活性（非公開・回収）となっています。
              </p>
              <div className="text-[11px] text-neutral-500 space-y-3 pt-3 border-t border-neutral-200/50">
                <p>
                  🔒 <b>個人情報・プライバシー保護について:</b><br />
                  本サービス内からはデータが正常に完全抹消（回収）されたため、これ以上のクイズ回答、メッセージ閲覧、および連絡先開示手続きは一切できません。プライバシーは厳格に守られて保護されています。
                </p>
                <p>
                  🌐 <b>Chrome履歴や検索キャッシュ（Google/Yahoo!等）からアクセスされた方へ:</b><br />
                  Google等の検索結果やChrome履歴、ブックマーク情報等に以前のデータ（一時キャッシュ）が文字として残っている場合がございます。これは各検索サービスがインターネット上の変更を再検知・自動同期するまで一定の時間を要するため（数日〜数週間）に発生する現象（彷徨いキャッシュ）です。ReMEETsのデータベース上からはすでに破棄されており、実体は存在いたしませんのでご安心ください。
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
              ご指定のページにアクセスできませんでした。<br />
              理由: <span className="font-bold text-red-600">{error}</span>
            </p>
          )}

          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/search" className="px-6 py-3 border border-brand-border hover:border-slate-300 text-neutral-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white shadow-sm hover:shadow hover:-translate-y-0.5">
              <Search size={14} />
              <span>他の手紙を探す</span>
            </Link>
            <Link to="/" className="px-6 py-3 bg-[#3B627F] hover:bg-[#2C4D66] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
              <span>ReMEETs トップへ戻る</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center font-serif">
      <div className="w-12 h-12 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-5" />
      <h3 className="text-sm md:text-base font-bold text-slate-800 tracking-widest mb-1.5 font-serif">
        あの日のボトルメール
      </h3>
      <p className="text-xs text-slate-500 font-serif">
        記憶の海から手紙を読み込んでいます...
      </p>
    </div>
  );

  const searcherIdToUse = isOwner ? (verifiedByUser?.id || 0) : post.user_id;
  const searcherNameToUse = isOwner ? (verifiedByUser?.username || 'Unknown') : post.searcher_name;
  const otherUserFullNameToUse = isOwner ? verifiedByUser?.full_name : searcherFullName;

  // 差出人の確実な本名解決（ニックネームへのフォールバックを完全排除）
  const displaySenderFullName = 
    revealedContact?.searcherFullName || 
    otherUserFullNameToUse || 
    searcherFullName || 
    post.searcher_full_name || 
    post.owner_full_name || 
    post.author_info?.full_name || 
    '綿矢 りさ';

  // 差出人の旧姓
  const displaySenderMaidenName = 
    revealedContact?.searcherMaidenName || 
    post.searcher_maiden_name || 
    post.author_maiden_name || 
    post.author_info?.maiden_name || 
    '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12">
      {/* 最上部ナビゲーション: トップへ戻る ＆ ボトル検索へ戻る（文字だけリンク） */}
      <div className="flex items-center gap-4 mb-4">
        <BackToHomeButton className="mb-0" />
        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
          <span>ボトル検索へ戻る</span>
        </button>
      </div>

      {/* 差出人様専用・公開プレビュー＆個人情報保護案内バナー */}
      {isOwner && (
        <div className="mb-6 p-4 md:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl border border-blue-500/30 shadow-lg font-sans text-left space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            {/* 2大切り替えセグメントタブ（左: グリーン、右: ブルー） */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10">
              <button 
                type="button"
                onClick={() => setOwnerPreviewRevealed(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !ownerPreviewRevealed 
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/60 font-extrabold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe size={15} className={!ownerPreviewRevealed ? "text-white" : "text-emerald-400"} />
                <span>ネット公開画面</span>
              </button>

              <button 
                type="button"
                onClick={() => setOwnerPreviewRevealed(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ownerPreviewRevealed 
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/60 font-extrabold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Eye size={15} className={ownerPreviewRevealed ? "text-white" : "text-blue-400"} />
                <span>正解後の開示画面</span>
              </button>
            </div>

            {/* マイアカウントリンク */}
            <div className="flex items-center gap-2">
              <Link 
                to="/account?tab=sent#account-tabs"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-white text-xs font-bold rounded-xl border border-blue-400/30 transition-all shadow-2xs"
              >
                <User size={14} />
                <span>マイアカウントで確認</span>
              </Link>
            </div>
          </div>

          <div className="space-y-1.5 leading-relaxed">
            <p className="flex items-start gap-1.5 text-xs text-white/95">
              <ShieldCheck size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                {!ownerPreviewRevealed ? (
                  <>
                    <strong className="text-emerald-300 font-bold">【ネット公開画面を表示中】</strong> <span className="text-slate-100">Google検索やエゴサーチでお相手が最初に見る初期画面です。手紙本文・連絡先・質問の答えはすべて伏せられ、安全に保護されています。</span>
                  </>
                ) : (
                  <>
                    <strong className="text-blue-300 font-bold">【正解後の開示画面を表示中】</strong> <span className="text-slate-100">お相手が「思い出の質問」に全問正解し、安全な開示手続きを完了した後にのみ表示される手紙本文・連絡先・実名の画面です。</span>
                  </>
                )}
              </span>
            </p>
            {!ownerPreviewRevealed && (
              <p className="text-[11px] text-slate-300/90 pl-5 leading-normal">
                ※GoogleやYahoo!等の検索エンジンにインデックスされ、検索結果に反映されるまでには通常数日程度（クローラー巡回期間）かかります。
              </p>
            )}
          </div>
        </div>
      )}

      {/* 投函完了お知らせ画面・モーダル (投稿者向け: 大きく鮮明なイラストヘッダー付き特別カード) */}
      <AnimatePresence>
        {showPostedBanner && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm font-sans" data-lenis-prevent>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-teal-100 relative text-left"
            >
              {/* 閉じるボタン */}
              <button
                onClick={() => setShowPostedBanner(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80"
                aria-label="閉じる"
              >
                <X size={16} />
              </button>

              {/* 上部: 朝もやの海へ流れるボトルのイラストアートヘッダー */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-50 border-b border-teal-100">
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none select-none">
                  <div className="relative w-full h-full opacity-75">
                    <img 
                      src={postSuccessSoft} 
                      alt="朝もやの海へ流れるボトル" 
                      className="w-full h-full object-cover object-center"
                    />
                    {/* 左右グラデーションフェード */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-transparent via-50% to-slate-50/80" />
                    {/* 上下グラデーションフェード */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-transparent to-slate-50" />
                  </div>
                </div>
                
                <div className="relative z-10 h-full p-6 flex flex-col justify-end space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-700 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs inline-flex items-center gap-1">
                      {postedWithEkycFlag ? <ShieldCheck size={12} /> : <Send size={12} />}
                      {postedWithEkycFlag ? "🛡️ 本人確認済投函" : "🌊 投函完了"}
                    </span>
                    <span className="text-[11px] font-bold text-teal-900 bg-white/90 backdrop-blur-2xs px-2.5 py-0.5 rounded-md font-mono border border-teal-200/80 shadow-2xs">
                      BTL-{post.id?.toString().padStart(5, '0')}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-teal-950 tracking-wide drop-shadow-xs leading-snug">
                    <span>{post.target_name} 様宛の</span>
                    <span className="block mt-0.5">ボトルメールが海へ流されました</span>
                  </h3>
                </div>
              </div>

              {/* カード本文エリア */}
              <div className="p-6 space-y-5">
                <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 space-y-2">
                  <p className="text-xs text-slate-700 font-serif leading-relaxed">
                    大切な想いを込めたボトルメールを朝もやの海へそっと流しました。お相手があなたを見つけて「思い出の質問」に正解するまで、本文や連絡先は安全に暗号化され保護されます。
                  </p>
                </div>

                {/* ボタンアクション */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowPostedBanner(false)}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>お相手から見える【公開画面プレビュー】を確認</span>
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 思い出の鍵が繋がりました　お手紙を開封します メッセージバナー (回答者向け) */}
      <AnimatePresence>
        {showKeyConnectedBanner && !isOwner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 p-4 md:p-5 text-white shadow-xl border border-amber-300/40 relative flex items-center justify-between gap-4 font-sans"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/50 shadow-inner">
                <Key size={22} className="text-amber-200 animate-pulse" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-300 text-amber-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ✨ 開封案内
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-serif font-bold text-white tracking-wide">
                    思い出の鍵が繋がりました　お手紙を開封します
                  </h3>
                </div>
                <p className="text-xs text-amber-100/90 font-sans leading-relaxed">
                  手紙がつづられ、大切な方へ届くボトルメールが開かれました。
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowKeyConnectedBanner(false)}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all shrink-0 cursor-pointer"
              aria-label="閉じる"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      <section 
        ref={welcomeBannerRef}
        className="mb-8 p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[36px] bg-white border border-brand-border relative overflow-hidden text-center shadow-md"
      >
        {/* 背景イラスト（即座に鮮明に描画される背景アート） */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none z-0">
          <div 
            className="relative w-full max-w-4xl h-full"
            style={{ opacity: (isQuestionVerified || showDetails || post.status === 'resolved') ? 0.82 : 0.85 }}
          >
            <img 
              src={(isQuestionVerified || showDetails || post.status === 'resolved') ? quizMatchHearts : postSuccessSoft} 
              alt="背景イラスト" 
              loading="eager"
              decoding="sync"
              className="w-full h-full object-cover object-center"
            />
            {/* 上下左右の四方を白グラデーションで自然になじませる */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/30" />
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-primary/5 px-4 py-2 rounded-full border border-brand-primary/15 text-brand-primary text-[10px] font-bold uppercase tracking-[0.3em]">
            <Sparkles size={14} className="animate-pulse" />
            <span>
              {showDetails || post.status === 'resolved' 
                ? "✨ 奇跡の再会が叶いました！" 
                : isQuestionVerified 
                  ? "✨ 思い出の鍵が解かれました！" 
                  : isOwner 
                    ? "あなたの大切な手紙が漂流中" 
                    : "記憶の交差点に到着しました"}
            </span>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-serif text-black font-[500] tracking-wider leading-relaxed flex flex-col items-center gap-2 text-center px-4 w-full">
            <span className="block whitespace-normal md:whitespace-nowrap max-w-full font-serif font-bold text-slate-900">{post.target_name} 様、</span>
            {(showDetails || post.status === 'resolved') ? (
              <ReunionEffectTitle effectType="pure-rainbow-flow" />
            ) : isQuestionVerified ? (
              <span className="block whitespace-normal md:whitespace-nowrap max-w-full text-emerald-600 font-bold">思い出の鍵が解かれました！</span>
            ) : (
              <span className="block whitespace-normal leading-snug max-w-full text-teal-800 font-bold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                「{post.searcher_name || '差出人'}さん」があなたを探しています。
              </span>
            )}
          </h1>
          <div className="max-w-xl mx-auto text-black/75 text-[10px] xs:text-xs sm:text-sm md:text-base font-serif leading-relaxed mt-4 flex flex-col items-center gap-2 text-center px-4 w-full">
            {(showDetails || post.status === 'resolved') ? (
              <>
                <span className="block whitespace-normal md:whitespace-nowrap">手紙の本文と連絡先が開示されました。</span>
                <span className="block whitespace-normal md:whitespace-nowrap text-emerald-600 font-bold">直接連絡を取り合い、止まっていた大切な時間の続きを始めましょう。</span>
              </>
            ) : isQuestionVerified ? (
              <>
                <span className="block whitespace-normal md:whitespace-nowrap">思い出の質問にすべて正解し、お互いの記憶が完全に合致しました。</span>
                <span className="block whitespace-normal md:whitespace-nowrap text-emerald-700 font-bold">下のボタンからお手紙の本文と連絡先を開封してください。</span>
              </>
            ) : (
              <>
                <span className="block whitespace-normal md:whitespace-nowrap text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-medium text-black/85">ReMEETsは、名前と「二人だけの思い出」を鍵にして、</span>
                <span className="block whitespace-normal md:whitespace-nowrap text-brand-primary font-bold text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mt-0.5 md:mt-1">大切な人との再会を支援する場所です。</span>
              </>
            )}

            {/* 投函日時バッジ（情緒と存在感を際立たせた上品なデザイン） */}
            <div className="mt-4 pt-3.5 border-t border-teal-100/80 w-full flex justify-center">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-teal-950 font-sans font-bold bg-gradient-to-r from-teal-50 via-white to-emerald-50 px-4 py-1.5 rounded-full border border-teal-200/90 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] shrink-0 shadow-2xs">
                  <Calendar size={12} />
                </span>
                <span>
                  このボトルメールは <strong className="font-mono text-teal-900 font-extrabold text-sm sm:text-base tracking-wide px-1 py-0.5 bg-teal-100/60 rounded">{new Date(post.created_at).toLocaleDateString('ja-JP').replace(/\//g, '.')}</strong> に投函されました
                </span>
              </span>
            </div>
          </div>

          {/* ご本人様向け早めの手紙開封仕組み案内カード (正解前) */}
          {!isQuestionVerified && !showDetails && post.status !== 'resolved' && (
            <div className="max-w-xl mx-auto mt-6 p-4.5 bg-gradient-to-br from-teal-50/90 via-emerald-50/70 to-slate-50 border border-teal-200/90 rounded-2xl shadow-xs text-left font-sans space-y-2.5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-teal-950 font-bold text-xs sm:text-sm font-serif">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs font-sans">💡</span>
                <span>差出人「{post.searcher_name || '差出人'}さん」に心当たりがある方へ</span>
              </div>
              <p className="text-xs text-slate-700 font-serif leading-relaxed">
                「思い出の質問」に正解すると、あなた宛に届いた<strong className="text-teal-900 font-bold bg-teal-100/80 px-1 py-0.5 rounded">差出人のフルネーム・手紙本文・連絡先</strong>が安全に開示されます。
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 各種モーダルダイアログ */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setShowSuccessModal(false);
          setTimeout(() => {
            if (isUserAlreadyVerified || isAgeVerified) {
              const el = document.getElementById('revealed-contact-section') || ageVerificationRef.current || questionsSectionRef.current;
              if (el) {
                smoothScrollWithOffset(el, 90);
              }
            } else if (ageVerificationRef.current) {
              smoothScrollWithOffset(ageVerificationRef.current, 90);
            } else {
              const el = document.getElementById('age-verification-gate');
              if (el) {
                smoothScrollWithOffset(el, 90);
              }
            }
          }, 350);
        }} 
        onStartEkyc={() => {
          setShowSuccessModal(false);
          if (!user) {
            alert('公的身分証（eKYC）本人確認を行うにはログインまたは新規登録が必要です。');
            navigate('/login');
            return;
          }
          setFinderEkycStep(2);
          setFinderEkycProgress(0);
          sessionStorage.setItem('finder_ekyc_step', '2');
          setTimeout(() => {
            setShowFinderEkycModal(true);
          }, 200);
        }}
        onOpenRevealModal={() => {
          setShowSuccessModal(false);
          setTimeout(() => {
            setShowRevealModal(true);
          }, 300);
        }}
        isAlreadyVerified={isUserAlreadyVerified}
        username={user?.username || user?.name || ''}
        searcherName={searcherNameToUse || ''} 
        searcherFullName={otherUserFullNameToUse || ''}
        message={post.message || ''} 
      />
      <RevealContactModal 
        isOpen={showRevealModal}
        onClose={() => {
          setShowRevealModal(false);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }}
        postId={post.id}
        searcherName={searcherNameToUse || ''}
        searcherFullName={otherUserFullNameToUse || ''}
        onRevealed={(data) => {
          setRevealedContact(data);
          try {
            localStorage.setItem(`revealed_post_${post.id}`, JSON.stringify(data));
          } catch (e) {
            console.warn('Failed to save revealed contact:', e);
          }
          if (post?.id) {
            fetch(`/api/posts/${post.id}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }).then(r => r.json()).then(d => {
              if (d && !d.error) setPost(d);
            });
          }
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 150);
        }}
      />
      <SuccessStoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
      />

      {/* 差出人属性・思い出の手がかり・手紙開封CTAが一体となったメインカード */}

      <PostDetailMainCard
        currentStep={currentStep}
        showDetails={showDetails}
        post={post}
        user={user}
        displaySenderFullName={displaySenderFullName}
        displaySenderMaidenName={displaySenderMaidenName}
        finderEkycVerified={finderEkycVerified}
        isOwner={isOwner}
        postedWithEkycFlag={postedWithEkycFlag}
        displayTargetFullName={displayTargetFullName}
        displayTargetMaidenName={displayTargetMaidenName}
        unlockedWithPasscode={unlockedWithPasscode}
        isQuizCompleted={isQuizCompleted}
        isUnlockedByCardPayment={isUnlockedByCardPayment}
        isProcessingFinderCardPayment={isProcessingFinderCardPayment}
        handleOpenFinderEkycModal={handleOpenFinderEkycModal}
        handleInitiateCardPayment={handleInitiateCardPayment}
        isOpeningLetter={isOpeningLetter}
        handleOpenLetter={handleOpenLetter}
        displayLetterMessage={displayLetterMessage}
        contactId={contactId}
        contactType={contactType}
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        showStoryModal={showStoryModal}
        setShowStoryModal={setShowStoryModal}
        displayCustomSchool={displayCustomSchool}
        displayHometown={displayHometown}
        displaySchoolOrOrg={displaySchoolOrOrg}
        displayTargetRelation={displayTargetRelation}
        displayContext={displayContext}
        displayEra={displayEra}
        displayGraduationYear={displayGraduationYear}
        finderPayCardNumber={finderPayCardNumber}
        setFinderPayCardNumber={setFinderPayCardNumber}
        finderPayCardExpiry={finderPayCardExpiry}
        setFinderPayCardExpiry={setFinderPayCardExpiry}
        finderPayCardCvc={finderPayCardCvc}
        setFinderPayCardCvc={setFinderPayCardCvc}
        finderPayCardName={finderPayCardName}
        setFinderPayCardName={setFinderPayCardName}
        isProcessingCardPayment={isProcessingCardPayment}
        handleStripePaymentSubmit={handleStripePaymentSubmit}
        letterRevealed={letterRevealed}
      />

        <div className="lg:col-span-5" ref={questionsSectionRef}>
          <div className="sticky top-32 space-y-8">
            {isQuestionVerified && !revealedContact && !showDetails && post.status !== 'resolved' && (
              <div id="step3-unlocked-section" className="glass-card p-6 md:p-8 space-y-6 font-sans transition-all duration-500 border-2 border-emerald-400 bg-white shadow-xl rounded-[32px] scroll-mt-28">
                <div className="space-y-6 animate-fade-in text-center">
                  
                  {/* ヘッダー・メールアイコン */}
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 via-emerald-100 to-teal-200 text-teal-800 rounded-full shadow-md flex items-center justify-center mx-auto ring-4 ring-teal-50">
                    <Mail size={32} className="text-teal-700" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-900 pt-1">
                      【{searcherName || post.searcher_name || '差出人'}】さんからの手紙を開封する
                    </h3>
                  </div>

                  {/* 課金サービス（手紙開封・連絡先開示）の明確なご案内（明朝体の堂々とした見出し） */}
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/95 via-teal-50/80 to-slate-50 border-2 border-emerald-400/90 rounded-2xl text-left space-y-3 font-sans shadow-md">
                    <div className="flex items-center gap-2.5 border-b border-emerald-200/90 pb-3 flex-wrap">
                      <span className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-2xs font-serif">
                        ✉️
                      </span>
                      <h4 className="text-lg sm:text-xl md:text-2xl font-semibold font-serif text-slate-800 tracking-wide leading-snug">
                        手紙開封・連絡先開示手続き（課金サービス）のご案内
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed">
                      思い出の質問に正解された方限定で、開示手続き（<strong className="text-teal-950 font-bold bg-teal-100/90 px-1.5 py-0.5 rounded text-xs sm:text-sm font-sans">600円 税込・買い切り</strong>）を行うことで、手紙の本文全文とお相手の直通連絡先が安全に開示されます。
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-teal-950 font-medium border-t border-emerald-200/80 bg-white/70 p-2.5 rounded-xl">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-teal-700 shrink-0" />
                        <span>1回のみの買い切り（月額課金・自動更新は一切ありません）</span>
                      </span>
                      <span className="font-mono text-sm sm:text-base font-extrabold text-teal-900 sm:ml-auto">
                        600円（税込）
                      </span>
                    </div>
                  </div>

                  {/* 安全な開示情報案内（大きく認知できる独立リッチカード） */}
                  <div className="p-5 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-amber-50/90 border-2 border-amber-300/90 rounded-2xl text-xs space-y-3.5 font-sans shadow-md text-left">
                    <div className="font-extrabold text-amber-950 flex items-center justify-between gap-2 text-sm sm:text-base border-b border-amber-200/90 pb-2.5 flex-wrap">
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-amber-700 shrink-0" />
                        <span>安全な照合を経て、お相手の手紙と連絡先をお届けします</span>
                      </span>
                      <span className="text-[11px] font-bold bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                        照合完了
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* 1. 差出人の実名（フルネーム）の開示 */}
                      <div className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xl font-bold shadow-2xs">
                          👤
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            【差出人の実名（フルネーム）の開示】
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            思い出の質問を設定したご本人の本名（実名）が安全に開示されます。
                          </p>
                        </div>
                      </div>

                      {/* 2. 手紙の全文とエピソードを開封 */}
                      <div className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xl font-bold shadow-2xs">
                          💌
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            【手紙の全文とエピソードを開封】
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            あの日伝えられなかった言葉、感謝、忘れられない思い出の全貌がそのまま読めます。
                          </p>
                        </div>
                      </div>

                      {/* 3. お相手の連絡先（LINE・メール等） */}
                      <div className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 text-xl font-bold shadow-2xs">
                          📱
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            【お相手の連絡先（LINE・メール等）】
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            差出人が直接連絡を受け取るために登録した連絡先を安全に確認できます。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {openingError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 text-left">
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                      <span>{openingError}</span>
                    </div>
                  )}

                  {/* プログレスバー（開封進行中）または開封ボタン群 */}
                  {isOpeningLetter ? (
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-400 space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span className="flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-500 animate-spin-slow" />
                          <span>想い出の封を開封しています...</span>
                        </span>
                        <span className="font-mono text-sm text-emerald-800">{openingProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-150 ease-out shadow-sm"
                          style={{ width: `${openingProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        セキュリティ暗号化を解除し、メッセージと連絡先を安全にお届けしています。
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1 text-left">
                      {/* 2つのコース選択 */}
                      <div className="space-y-3">
                        {/* コース 1: 【第一推奨】公的身分証（eKYC）認証 ＋ 手紙開封 */}
                        <div className="relative p-4 sm:p-5 bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white border-2 border-indigo-500/80 rounded-2xl space-y-3 shadow-md hover:border-indigo-600 transition-all">
                          <div className="absolute -top-3 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10.5px] font-extrabold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Sparkles size={12} className="text-amber-300" />
                            <span>【第一推奨】安心・返信率大幅UP</span>
                          </div>

                          <div className="flex items-center justify-between border-b border-indigo-100 pb-2 pt-0.5">
                            <span className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                              <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                              <span>公的身分証 (eKYC) 認証 ＋ 手紙開封コース</span>
                            </span>
                            <span className="font-mono text-base font-extrabold text-indigo-800">
                              1,200円<span className="text-xs font-sans text-slate-600 ml-0.5">（税込）</span>
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            運転免許証やマイナンバーによる「公的証明バッジ」を取得してお手紙を開封します。お相手が『本物の昔の友人だ』と確信できるため、<strong>初回の返信率が格段に向上</strong>します。
                          </p>

                          <button
                            type="button"
                            onClick={handleProceedToEkyc}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                          >
                            <ShieldCheck size={16} />
                            <span>公的証明バッジを取得して開封へ進む（1,200円 税込）</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>

                        {/* コース 2: 【シンプル】手紙開封・連絡先受取のみ */}
                        <div className="p-4 sm:p-5 bg-white border-2 border-emerald-400/80 rounded-2xl space-y-3 shadow-sm hover:border-emerald-500 transition-all">
                          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                              <Mail size={16} className="text-emerald-700 shrink-0" />
                              <span>手紙開封・連絡先開示のみコース</span>
                            </span>
                            <span className="font-mono text-base font-extrabold text-emerald-800">
                              600円<span className="text-xs font-sans text-slate-600 ml-0.5">（税込）</span>
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            公的身分証の提出をスキップし、手紙本文全文とお相手の連絡先（LINE・メール等）を即座に開示します（※公的証明バッジは後からマイページでも取得可能）。
                          </p>

                          <button
                            type="button"
                            onClick={handleProceedToReveal}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans border border-emerald-400/30"
                          >
                            <Heart size={16} className="fill-current text-rose-300 animate-pulse shrink-0" />
                            <span>手紙と連絡先の開示手続きへ進む（600円 税込）</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-sans text-center leading-relaxed">
                        ※ お手続き完了後、手紙と連絡先はマイアカウントに安全に永久保存されます。
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>

            {/* Searcher/Finder eKYC Modal */}
      <FinderEkycModal
        isOpen={showFinderEkycModal}
        onClose={() => setShowFinderEkycModal(false)}
        post={post}
        user={user}
        token={token}
        revealedContact={revealedContact}
        otherUserFullNameToUse={otherUserFullNameToUse}
        searcherFullName={searcherFullName}
        searcherName={searcherName}
        onEkycSuccess={() => {
          if (post?.id) {
            handleCheckResolvedStatus(post.id);
          }
        }}
      />

      {reportTarget && (
        <ReportModal 
          isOpen={!!reportTarget} 
          onClose={() => setReportTarget(null)} 
          targetType={reportTarget.type} 
          targetId={reportTarget.id}
          targetName={post?.target_name}
          targetSummary={post?.searcher_profile}
        />
      )}
    </div>
  );
};


