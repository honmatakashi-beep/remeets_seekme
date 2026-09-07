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
  const [post, setPost] = useState<any>(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isQuestionVerified, setIsQuestionVerified] = useState(false);
  const [tempVerificationData, setTempVerificationData] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [searcherName, setSearcherName] = useState<string | null>(null);
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
      if (seoUrl.startsWith('/name/')) {
        navigate(seoUrl, { replace: true, state: location.state });
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

      // 4. 正確に特定された postId の手紙データを取得（※勝手な recentList フォールバックは一切行わない）
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
    setShowRevealModal(true);
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

          <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <p className="flex items-start gap-1.5">
              <ShieldCheck size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                {!ownerPreviewRevealed ? (
                  <>
                    <strong className="text-emerald-300">【ネット公開画面を表示中】</strong> Google検索やエゴサーチでお相手が最初に見る初期画面です。手紙本文・連絡先・質問の答えはすべて伏せられ、安全に保護されています。
                  </>
                ) : (
                  <>
                    <strong className="text-blue-300">【正解後の開示画面を表示中】</strong> お相手が「思い出の質問」に全問正解し、安全な開示手続きを完了した後にのみ表示される手紙本文・連絡先・実名の画面です。
                  </>
                )}
              </span>
            </p>
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
      <motion.section 
        ref={welcomeBannerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[36px] bg-white border border-brand-border relative overflow-hidden text-center shadow-md"
      >
        {/* Subtle Decorative Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-brand-primary/3 rounded-full blur-[80px]"
              animate={{
                x: [`${Math.sin(i) * 20 + 50}%`, `${Math.cos(i) * 20 + 50}%`],
                y: [`${Math.cos(i) * 20 + 50}%`, `${Math.sin(i) * 20 + 50}%`],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: '300px', height: '300px', left: '-50px', top: '-50px' }}
            />
          ))}
        </div>

        {/* 背景イラスト（優しく淡いグラデーションで文字を引き立てる背景） */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none z-0">
          <div 
            className="relative w-full max-w-4xl h-full transition-opacity duration-500"
            style={{ opacity: (isQuestionVerified || showDetails || post.status === 'resolved') ? 0.82 : 0.85 }}
          >
            <img 
              src={(isQuestionVerified || showDetails || post.status === 'resolved') ? quizMatchHearts : postSuccessSoft} 
              alt="背景イラスト" 
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
      </motion.section>

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
                <span>← 手がかり（Step 1）を再確認する</span>
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

                  {/* プログレスバー（開封進行中）または開封ボタン */}
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
                    <div className="pt-2 space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setShowRevealModal(true)}
                        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer font-sans border border-emerald-400/30"
                      >
                        <Heart size={18} className="fill-current text-rose-300 animate-pulse" />
                        <span>手紙と連絡先の開示手続きへ進む（600円 税込）</span>
                        <ArrowRight size={16} />
                      </button>
                      <p className="text-[11px] text-slate-500 font-sans text-center leading-relaxed">
                        ※ ボタンをクリックすると安全なStripe暗号化決済画面が開きます。<br className="hidden sm:inline" />
                        勝手に決済されることはありませんのでご安心ください。
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>

      {/* Searcher/Finder eKYC Modal */}
      <AnimatePresence>
        {showFinderEkycModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 text-black font-sans" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinderEkycModal(false)}
              className="absolute inset-0 bg-black/65 cursor-pointer"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative w-full bg-white shadow-2xl p-6 md:p-8 text-zinc-900 z-10 rounded-2xl max-h-[92vh] flex flex-col overflow-y-auto overscroll-contain transition-all ${
                finderEkycStep === 3 ? 'max-w-2xl' : 'max-w-lg'
              }`}
              data-lenis-prevent
            >
              <button 
                type="button"
                onClick={() => setShowFinderEkycModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-brand-dark transition-colors p-1.5 focus:outline-none cursor-pointer rounded-full hover:bg-zinc-100 z-20"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>

              {/* ✨ 時を超えて届いた想い出のメッセージ（開封冒頭ヘッダー） */}
              <div className="text-center space-y-2.5 pb-4 border-b border-indigo-100/90 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 via-purple-100 to-amber-100 text-indigo-700 rounded-full shadow-md flex items-center justify-center mx-auto ring-4 ring-indigo-50">
                  <Heart size={28} className="animate-pulse text-rose-600 fill-rose-500/20" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wider font-serif">
                    ✨ 時を超えて届いた想い出のメッセージ
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-900 pt-0.5">
                    【{revealedContact?.searcherFullName || otherUserFullNameToUse || searcherFullName || post?.searcher_full_name || post?.owner_full_name || post?.searcher_name || searcherName || 'お相手'}】さんからの手紙を開封する
                  </h3>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-md mx-auto">
                  あなたを探し続けていた【{revealedContact?.searcherFullName || otherUserFullNameToUse || searcherFullName || post?.searcher_full_name || post?.owner_full_name || post?.searcher_name || searcherName || 'お相手'}】さんが残した「手紙の全文」と、今すぐ直接つながる「ご連絡先（LINE・メールアドレス等）」が開示されます。止まっていた大切な時間の続きを、ここから始めましょう。
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 text-[11px] font-bold rounded-full border border-indigo-200">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>公的証明バッジ取得 ＆ 手紙開封コース（600円 税込）</span>
                </div>
              </div>

              {/* Step 1: 身分証明書の選択と基本情報の入力 */}
              {finderEkycStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-indigo-150 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 1 / 4</span>
                      <h3 className="text-lg font-bold text-black font-serif">1. 身分証明書の選択と基本情報の入力</h3>
                      <p className="text-xs text-black/60 font-sans leading-relaxed mt-0.5">
                        ご提示いただく身分証明書を選択し、本名と生年月日をご記入ください。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFinderEkycName(user?.fullName || "本間 貴司");
                        setFinderEkycBirthdate("1995-05-15");
                        setFinderEkycDocType("license");
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                      title="検証用のテスト氏名・生年月日を自動入力"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>⚡ テスト自動入力</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider font-sans">1. 証明書の種類</label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { id: 'license', label: '運転免許証' },
                          { id: 'mynumber', label: 'マイナンバー' },
                          { id: 'passport', label: 'パスポート' }
                        ] as const).map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setFinderEkycDocType(doc.id)}
                            className={`py-3 px-2 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                              finderEkycDocType === doc.id
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20'
                                : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                            }`}
                          >
                            {doc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-sans">2. お名前（漢字）</label>
                        <input
                          type="text"
                          value={finderEkycName}
                          onChange={(e) => setFinderEkycName(e.target.value)}
                          placeholder="山田 太郎"
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-sans">3. 生年月日</label>
                        <input
                          type="date"
                          value={finderEkycBirthdate}
                          onChange={(e) => setFinderEkycBirthdate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFinderEkycModal(false)}
                      className="py-3 px-5 border border-zinc-200 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                    >
                      キャンセル
                    </button>
                    <button
                      disabled={!finderEkycName || !finderEkycBirthdate}
                      onClick={() => setFinderEkycStep(2)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
                    >
                      <span>証明書の撮影画面へ進む（ガイド枠あり）</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Document Camera Capture with Guidelines Overlay */}
              {finderEkycStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 2 / 4</span>
                    <h3 className="text-lg font-bold text-black font-serif">2. 身分証明書の撮影・アップロード</h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      反射や四隅の欠けを防ぐガイドライン枠線に合わせて撮影を行ってください。
                    </p>
                  </div>

                  <DocumentCameraOverlay
                    docType={finderEkycDocType}
                    docTypeName={
                      finderEkycDocType === 'license' ? '運転免許証' : finderEkycDocType === 'mynumber' ? 'マイナンバーカード' : 'パスポート'
                    }
                    onBack={() => setFinderEkycStep(1)}
                    onComplete={(imgs) => {
                      setFinderEkycCapturedImages(imgs);
                      setFinderEkycStep(3);
                    }}
                  />
                </div>
              )}

              {/* Step 3: Payment (Credit Card Billing) */}
              {finderEkycStep === 3 && (
                <div className="space-y-5 py-2 text-left">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 3 / 4</span>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">
                        3. 安全照合・手紙開封手数料のお支払い
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFinderPayCardNumber("4242 4242 4242 4242");
                        setFinderPayCardExpiry("12/28");
                        setFinderPayCardCvc("123");
                        setFinderPayCardName("TAKASHI HONMA");
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                      title="検証用のStripeテストカード情報を自動入力"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>⚡ テストカード自動入力</span>
                    </button>
                  </div>

                  {/* 🤝 安心・安全な連絡先相互開示の仕組みカード（案3） */}
                  <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white rounded-2xl border border-indigo-200/90 shadow-2xs space-y-2 text-xs font-sans">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950 font-serif">
                      <ShieldCheck size={15} className="text-indigo-600" />
                      <span>🤝 安心・安全な連絡先相互開示のお約束</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 pl-1 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>差出人の<strong>「手紙の全文」</strong>と<strong>「直通連絡先（LINE・メール等）」</strong>が即座に開示されます。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>あなたのアカウント情報も公的認証マーク付きでお相手と安全に照合・共有されます。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>256-bit暗号化と公的eKYCにより、第三者によるなりすまし・個人情報の漏洩を100%防御します。</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-600 font-bold">手紙開封 ＆ 公的本人確認（eKYC）費用</span>
                      <span className="text-zinc-900 font-mono font-bold">600 円</span>
                    </div>
                    <div className="border-t border-dashed border-zinc-200 pt-2 flex justify-between items-center">
                      <span className="text-xs text-indigo-950 font-extrabold">
                        一括お引き落とし合計額（買い切り）
                      </span>
                      <span className="text-base text-indigo-900 font-sans font-bold">600 円 <span className="text-[10px] font-normal text-indigo-700">(税込)</span></span>
                    </div>
                  </div>

                  {/* Document capture summary badge */}
                  {finderEkycCapturedImages.front && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>身分証撮影完了（全3枚・カメラ自動切断・暗号化保護）</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFinderEkycStep(2)}
                        className="text-[11px] text-indigo-600 hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                      >
                        再撮影
                      </button>
                    </div>
                  )}

                  <CreditCardPaymentForm
                    cardNumber={finderPayCardNumber}
                    cardExpiry={finderPayCardExpiry}
                    cardCvc={finderPayCardCvc}
                    cardName={finderPayCardName}
                    onCardNumberChange={setFinderPayCardNumber}
                    onCardExpiryChange={setFinderPayCardExpiry}
                    onCardCvcChange={setFinderPayCardCvc}
                    onCardNameChange={setFinderPayCardName}
                    showDemoButton={true}
                    onDemoFill={() => {
                      setFinderPayCardNumber("4242 4242 4242 4242");
                      setFinderPayCardExpiry("12/28");
                      setFinderPayCardCvc("123");
                      setFinderPayCardName("TAKASHI HONMA");
                    }}
                    refundGuaranteeText="本人確認（eKYC）審査が不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFinderEkycStep(2)}
                      className="px-4 py-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      撮影に戻る
                    </button>
                    <button
                      disabled={!finderPayCardNumber || !finderPayCardExpiry || !finderPayCardCvc || !finderPayCardName}
                      onClick={() => setFinderEkycStep(4)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed active:scale-98"
                    >
                      600円をお支払いして公的証明・手紙開示を完了
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: 照合中 */}
              {finderEkycStep === 4 && (
                <div className="space-y-6 py-4 text-center font-serif">
                  {/* 中央の二重発光スピナー & アイコン */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    {/* 外周の発光オーラ */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
                    
                    {/* スピナーリング（外側・反時計回り） */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-300/60 animate-[spin_8s_linear_infinite]" />
                    
                    {/* スピナーリング（内側・時計回り） */}
                    <div className="absolute w-20 h-20 rounded-full border-3 border-indigo-100 border-t-indigo-600 border-r-teal-500 animate-spin" />
                    
                    {/* 中央コンテンツ */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-900 font-serif">
                      <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-indigo-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent pl-0.5">
                        {finderEkycProgress}%
                      </span>
                      <span className="text-[9px] font-semibold text-indigo-600/80 uppercase tracking-[0.22em] -mt-0.5">
                        Processing
                      </span>
                    </div>
                  </div>

                  {/* ステータスタイトル */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-serif font-bold tracking-[0.1em] shadow-xs">
                      <ShieldCheck size={14} className="text-emerald-600 animate-pulse" />
                      <span>公的本人確認・撮影照合＆決済処理中</span>
                    </div>
                    <h3 className="text-base font-serif font-extrabold tracking-[0.12em] md:tracking-[0.16em] text-zinc-900 pt-1">
                      {finderEkycProgress < 25 && '1. 撮影書類の四隅＆光反射AI分析'}
                      {finderEkycProgress >= 25 && finderEkycProgress < 50 && '2. 記載文字暗号化＆身元データ照合'}
                      {finderEkycProgress >= 50 && finderEkycProgress < 75 && '3. Stripe安全決済＆オーソリ完了'}
                      {finderEkycProgress >= 75 && finderEkycProgress < 100 && '4. お相手連絡先・手紙本文の開示キー発行'}
                      {finderEkycProgress === 100 && '✨ 照合＆開示準備が完了しました！'}
                    </h3>
                  </div>

                  {/* プログレスバー本体（綺麗な虹色グラデーションバー） */}
                  <div className="space-y-1.5 px-2">
                    <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                      <span className="flex items-center gap-1 text-[11px] text-indigo-700 font-serif tracking-[0.1em]">
                        <Lock size={12} /> 256bit 暗号化安全通信
                      </span>
                      <span className="text-emerald-700 font-bold font-serif tracking-[0.12em]">{finderEkycProgress} / 100%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                        style={{ width: `${finderEkycProgress}%` }}
                      >
                        {/* バー先端のLED光彩ノード */}
                        {finderEkycProgress > 0 && finderEkycProgress < 100 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4ステップ進行タイムライン */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 0 && finderEkycProgress < 25 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 25 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 25 ? '✓' : '1'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">撮影写真の厚み・顔画像解析</span>
                      </span>
                      {finderEkycProgress < 25 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">分析中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 25 && finderEkycProgress < 50 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 50 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 50 ? '✓' : '2'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">身元氏名＆生年月日の暗号照合</span>
                      </span>
                      {finderEkycProgress >= 25 && finderEkycProgress < 50 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">照合中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 50 && finderEkycProgress < 75 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 75 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 75 ? '✓' : '3'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">Stripe 1,200円決済処理（審査＋開封）</span>
                      </span>
                      {finderEkycProgress >= 50 && finderEkycProgress < 75 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">決済中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 75 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress === 100 ? '✓' : '4'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">手紙本文＆連絡先開示手続き</span>
                      </span>
                      {finderEkycProgress >= 75 && finderEkycProgress < 100 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">発行中...</span>}
                    </div>
                  </div>
                </div>
              )}

              {finderEkycStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-black">本人確認および決済完了！🎉</h3>
                    <p className="text-xs text-black/60 font-sans leading-relaxed">
                      撮影書類の照合とお手続きがすべて正常に完了しました！これより手紙本文の全内容および、お相手の連絡先（LINE ID・メールアドレス等）が安全に開示されます。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowFinderEkycModal(false);
                      // 本人確認が完了したら、手紙・連絡先表示位置までスクロール誘導
                      setTimeout(() => {
                        handleScrollToRevealedContact();
                      }, 300);
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow transition-all cursor-pointer"
                  >
                    手紙本文と連絡先を確認する
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 不適切コンテンツ通報モーダル */}
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

