import { AccountReceivedTab } from "./account/AccountReceivedTab";
import { AccountSentTab } from "./account/AccountSentTab";
import { AccountNotificationsTab } from "./account/AccountNotificationsTab";
import { AccountProfileTab } from "./account/AccountProfileTab";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, Bell, BookOpen, CheckCircle, CheckCircle2,
  CheckSquare, Coffee, Cpu, Edit, Edit3, ExternalLink, Eye, EyeOff,
  Heart, Lock, Mail, MessageSquare, RotateCcw, Search, Send,
  ShieldCheck, Sparkles, Trash2, User as UserIcon, X, AlertCircle,
  Shield, Info, Clock, ChevronDown, ChevronUp, ArrowLeft,
  MessageCircle, Key, Plus, Zap, MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, PageHeader, formatEraLabel, getCategoryText, getPostUrl, PREFECTURES } from '../lib/utils';
import { BottleLoader, WarningMessage, BackToHomeButton } from '../components/SharedComponents';
import { SuccessStoryModal } from './SearchPage';
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from '../components/DocumentCameraOverlay';
import { EkycProgressTelemetryPanel } from '../components/EkycProgressTelemetryPanel';
import { CreditCardPaymentForm } from '../components/CreditCardPaymentForm';
import postSuccessSoft from '../assets/images/post_success_soft_1785869214309.jpg';
import { EditProfileModal } from "../components/account/EditProfileModal";
import { EditPublicMessageModal } from "../components/account/EditPublicMessageModal";
import { DeleteAccountModal, DeletePublicMessageModal } from "../components/account/AccountDeleteModals";
import { MypageEkycModal } from "../components/account/MypageEkycModal";
import { AccountAlertModal } from "../components/account/AccountAlertModal";
import quizMatchHearts from '../assets/images/quiz_match_hearts_pastel_1785940521320.jpg';
import { Copy } from 'lucide-react';

export const AccountPage = () => {
  const { user, token, logout, updateUser } = useAuth();
  const getAgeFromBirthdate = (birthdate?: string): number | null => {
    if (!birthdate) return null;
    const b = new Date(birthdate);
    if (isNaN(b.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  };

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [connectedPosts, setConnectedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNickname, setEditingNickname] = useState(user?.nickname || '');
  const [editingEmail, setEditingEmail] = useState(user?.email || '');
  const [editingMaidenName, setEditingMaidenName] = useState((user as any)?.maiden_name || '');
  const [editingGender, setEditingGender] = useState<string>((user as any)?.gender || '');
  const [editingEmailNotifications, setEditingEmailNotifications] = useState<boolean>(true);
  const [editingContactType, setEditingContactType] = useState<string>(() => localStorage.getItem('remeets_default_contact_type') || 'LINE');
  const [editingContactId, setEditingContactId] = useState<string>(() => localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id || '');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showEmailChangeSuccess, setShowEmailChangeSuccess] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditMessageModal, setShowEditMessageModal] = useState(false);
  const [showDeletePublicMessageModal, setShowDeletePublicMessageModal] = useState(false);
  const [isDeletingPublicMessage, setIsDeletingPublicMessage] = useState(false);
  const [deletePublicMessageConsent, setDeletePublicMessageConsent] = useState(false);
  const [copiedPostLink, setCopiedPostLink] = useState(false);
  const navigate = useNavigate();

  const handleDeletePublicMessage = async () => {
    if (!deletePublicMessageConsent || !token || !myPosts || myPosts.length === 0) return;
    const targetPost = myPosts[0];
    setIsDeletingPublicMessage(true);
    try {
      const res = await fetch(`/api/posts/${targetPost.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMyPosts([]);
        setShowDeletePublicMessageModal(false);
        setDeletePublicMessageConsent(false);
        alert('公開メッセージを削除しました。Google検索および公開画面から完全に削除されました。いつでも新しいメッセージを作成できます。');
      } else {
        const err = await res.json();
        alert(err.error || 'メッセージの削除に失敗しました。');
      }
    } catch (err) {
      console.error('Failed to delete public message:', err);
      alert('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsDeletingPublicMessage(false);
    }
  };

  // 再会ストーリー・感謝の声モーダル＆投稿管理
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyTargetPost, setStoryTargetPost] = useState<any | null>(null);
  const [storyTargetRole, setStoryTargetRole] = useState<'sender' | 'receiver' | 'general'>('general');
  const [mySubmittedStories, setMySubmittedStories] = useState<any[]>([]);
  const [storyCurrentPage, setStoryCurrentPage] = useState(1);
  const STORIES_PER_PAGE = 5;

  const fetchMyStories = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/success-stories/my-stories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const realStories = (data || []).filter((s: any) => s && s.user_id && Number(s.user_id) > 0 && !s.is_all_page);
        setMySubmittedStories(realStories);
      }
    } catch (e) {
      console.error('Failed to fetch my success stories', e);
    }
  };

  // マイページ直接eKYC用の状態管理
  const [showMypageEkycModal, setShowMypageEkycModal] = useState(false);
  const [mypageEkycStep, setMypageEkycStep] = useState(1); // 1: 案内, 2: フォーム入力, 3: 撮影, 4: 決済, 5: 照合中, 6: 完了
  const [mypageEkycName, setMypageEkycName] = useState('');
  const [mypageEkycBirthdate, setMypageEkycBirthdate] = useState('1990-01-01');
  const [mypageEkycDocType, setMypageEkycDocType] = useState<'license' | 'mynumber' | 'passport'>('license');
  const [mypagePayCardNumber, setMypagePayCardNumber] = useState('4242 •••• •••• 4242');
  const [mypagePayCardExpiry, setMypagePayCardExpiry] = useState('12/28');
  const [mypagePayCardCvc, setMypagePayCardCvc] = useState('123');
  const [mypagePayCardName, setMypagePayCardName] = useState('');
  const [isMypagePaying, setIsMypagePaying] = useState(false);
  const [mypageEkycProgress, setMypageEkycProgress] = useState(0);
  const [mypageEkycCapturedImages, setMypageEkycCapturedImages] = useState<{ front?: string; thickness?: string; back?: string }>({});

  // eKYCカメラの切断・クリーンアップ保証
  useEffect(() => {
    if (mypageEkycStep !== 3 || !showMypageEkycModal) {
      stopAllGlobalCameraStreams();
    }
    return () => {
      stopAllGlobalCameraStreams();
    };
  }, [mypageEkycStep, showMypageEkycModal]);

  const handleOpenMypageEkycModal = () => {
    setMypageEkycName(user?.fullName || user?.name || '');
    if (!mypageEkycBirthdate) {
      setMypageEkycBirthdate('1990-01-01');
    }
    setMypageEkycStep(1);
    setShowMypageEkycModal(true);
  };

  // ユーザー自身による直接削除・選択一括削除用の状態管理
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // 🛡️ 退会・アカウント完全削除用の状態管理
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountConsent, setDeleteAccountConsent] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deleteAccountConsent || !token) return;
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('退会手続きが完了しました。ご利用ありがとうございました。');
        logout();
        navigate('/');
      } else {
        const err = await res.json();
        alert(err.error || '退会処理に失敗しました。');
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました。接続を確認してください。');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleBulkDeletePosts = async () => {
    if (selectedPostIds.length === 0) return;
    if (!confirm(`選択された ${selectedPostIds.length} 件のメッセージ（ボトル）を回収（削除）してもよろしいですか？\n※この操作は取り消せません。`)) return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch('/api/posts/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ ids: selectedPostIds })
      });
      if (res.ok) {
        setMyPosts(prev => prev.filter(p => !selectedPostIds.includes(p.id)));
        const deletedCount = selectedPostIds.length;
        setSelectedPostIds([]);
        alert(`${deletedCount} 件のメッセージ（ボトル）を正常に回収（削除）しました。`);
      } else {
        const errData = await res.json();
        alert(errData.error || '一括削除に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。接続を確認してください。');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // テスト用eKYCステータシリセット・完了用の状態管理
  const [isResettingEkyc, setIsResettingEkyc] = useState(false);
  const [ekycMessage, setEkycMessage] = useState<string | null>(null);

  // あなた宛て新着メッセージのワンタップ通知ON/OFF設定
  const [notifyAlertEnabled, setNotifyAlertEnabled] = useState<boolean>(true);
  const [isUpdatingNotifyAlert, setIsUpdatingNotifyAlert] = useState(false);

  const fetchNotifySettings = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/user/notify-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifyAlertEnabled(data.enabled);
      }
    } catch (e) {}
  };

  const handleToggleNotifyAlert = async () => {
    if (!token) return;
    setIsUpdatingNotifyAlert(true);
    const nextState = !notifyAlertEnabled;
    setNotifyAlertEnabled(nextState);
    try {
      const res = await fetch('/api/user/notify-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: nextState })
      });
      if (!res.ok) {
        setNotifyAlertEnabled(!nextState);
      }
    } catch (e) {
      setNotifyAlertEnabled(!nextState);
    } finally {
      setIsUpdatingNotifyAlert(false);
    }
  };

  // 保存された入荷通知アラート用の状態管理
  const [myAlerts, setMyAlerts] = useState<any[]>([]);
  const [deletingAlertId, setDeletingAlertId] = useState<number | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAlertSaving, setIsAlertSaving] = useState(false);
  const [alertModalError, setAlertModalError] = useState<string | null>(null);
  const [editingAlert, setEditingAlert] = useState<{
    id: number | null;
    target_name: string;
    target_last_name: string;
    target_first_name: string;
    target_maiden_name: string;
    target_nickname: string;
    target_hometown: string;
    era: string;
    category: string;
    email: string;
  }>({
    id: null,
    target_name: '',
    target_last_name: '',
    target_first_name: '',
    target_maiden_name: '',
    target_nickname: '',
    target_hometown: '',
    era: '',
    category: '',
    email: ''
  });

  const fetchMyAlerts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/search-alerts/my-alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch my alerts', err);
    }
  };

  const handleOpenAddAlert = () => {
    setEditingAlert({
      id: null,
      target_name: '',
      target_last_name: '',
      target_first_name: '',
      target_maiden_name: '',
      target_nickname: '',
      target_hometown: '',
      era: '',
      category: '',
      email: user?.email || ''
    });
    setAlertModalError(null);
    setIsAlertModalOpen(true);
  };

  const handleOpenEditAlert = (item: any) => {
    // 姓名の分解
    let lName = item.target_last_name || '';
    let fName = item.target_first_name || '';
    if (!lName && !fName && item.target_name) {
      const parts = item.target_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        lName = parts[0];
        fName = parts.slice(1).join(' ');
      } else {
        lName = parts[0];
      }
    }

    setEditingAlert({
      id: item.id,
      target_name: item.target_name || '',
      target_last_name: lName,
      target_first_name: fName,
      target_maiden_name: item.target_maiden_name || '',
      target_nickname: item.target_nickname || '',
      target_hometown: item.target_hometown || '',
      era: item.era || '',
      category: item.category || '',
      email: item.email || user?.email || ''
    });
    setAlertModalError(null);
    setIsAlertModalOpen(true);
  };

  const handleSaveAlertModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = (
      editingAlert.target_name || 
      `${editingAlert.target_last_name || ''} ${editingAlert.target_first_name || ''}`.trim() ||
      editingAlert.target_nickname || 
      editingAlert.target_maiden_name || 
      ''
    ).trim();

    if (!fullName) {
      setAlertModalError('探したい人のお名前（姓・名、旧姓または当時の愛称）を入力してください。');
      return;
    }
    if (!editingAlert.email.trim()) {
      setAlertModalError('通知先メールアドレスを入力してください。');
      return;
    }

    const payload = {
      ...editingAlert,
      target_name: fullName
    };

    setIsAlertSaving(true);
    setAlertModalError(null);
    try {
      if (editingAlert.id) {
        // 更新 (PUT)
        const res = await fetch(`/api/search-alerts/${editingAlert.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          await fetchMyAlerts();
          setIsAlertModalOpen(false);
        } else {
          const data = await res.json();
          setAlertModalError(data.error || '更新に失敗しました。');
        }
      } else {
        // 新規追加 (POST)
        const res = await fetch('/api/search-alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          await fetchMyAlerts();
          setIsAlertModalOpen(false);
        } else {
          const data = await res.json();
          setAlertModalError(data.error || '保存に失敗しました。');
        }
      }
    } catch (err) {
      console.error(err);
      setAlertModalError('通信エラーが発生しました。再度お試しください。');
    } finally {
      setIsAlertSaving(false);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    if (!token) return;
    if (!confirm('この入荷通知アラート設定を削除してもよろしいですか？')) return;
    setDeletingAlertId(alertId);
    try {
      const res = await fetch(`/api/search-alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMyAlerts(prev => prev.filter(a => a.id !== alertId));
      } else {
        alert('アラートの削除に失敗しました。');
      }
    } catch (err) {
      console.error('Failed to delete alert', err);
      alert('通信エラーが発生しました。');
    } finally {
      setDeletingAlertId(null);
    }
  };

  const handleResetEkycStatus = async () => {
    setIsResettingEkyc(true);
    setEkycMessage(null);
    try {
      if (token) {
        await fetch('/api/auth/reset-ekyc', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      localStorage.setItem('ekyc_verified', 'false');
      localStorage.removeItem('ekyc_verified');
      sessionStorage.removeItem('finder_ekyc_step');
      sessionStorage.removeItem('show_finder_ekyc_modal');
      window.dispatchEvent(new Event('ekyc_changed'));
      if (user) {
        updateUser({ ...user, is_ekyc_verified: false });
      }
      setEkycMessage('🛡️ eKYC本人確認ステータスを「未申請（未認証）」状態に戻しました。');
      setTimeout(() => setEkycMessage(null), 5000);
    } catch (err) {
      console.error('Failed to reset ekyc status:', err);
      // Fallback local update even on network glitch
      localStorage.setItem('ekyc_verified', 'false');
      localStorage.removeItem('ekyc_verified');
      window.dispatchEvent(new Event('ekyc_changed'));
      if (user) {
        updateUser({ ...user, is_ekyc_verified: false });
      }
      setEkycMessage('������️ eKYCステータスをローカル上で「未申請」に戻しました。');
      setTimeout(() => setEkycMessage(null), 5000);
    } finally {
      setIsResettingEkyc(false);
    }
  };

  const handleForceCompleteEkyc = async () => {
    setIsResettingEkyc(true);
    setEkycMessage(null);
    try {
      if (token) {
        await fetch('/api/auth/ekyc-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            document_type: 'mynumber',
            ekyc_name: user?.fullName || 'テストユーザー',
            birthdate: '1990-01-01'
          })
        });
      }
      localStorage.setItem('ekyc_verified', 'true');
      window.dispatchEvent(new Event('ekyc_changed'));
      if (user) {
        updateUser({ ...user, is_ekyc_verified: true });
      }
      setEkycMessage('🛡️ eKYC本人確認ステータスを「公的本人確認完了済み」に変更しました！');
      setTimeout(() => setEkycMessage(null), 5000);
    } catch (err) {
      console.error('Failed to verify ekyc status:', err);
      // Fallback local update
      localStorage.setItem('ekyc_verified', 'true');
      window.dispatchEvent(new Event('ekyc_changed'));
      if (user) {
        updateUser({ ...user, is_ekyc_verified: true });
      }
      setEkycMessage('🛡️ eKYCステータスをローカル上で「完了済み」に変更しました！');
      setTimeout(() => setEkycMessage(null), 5000);
    } finally {
      setIsResettingEkyc(false);
    }
  };

  // モーダルやオーバーレイ表示時のボディスクロール制御＆トラックパッド動作適正化
  useEffect(() => {
    const handleCheckModals = () => {
      // modal-overlay または高z-indexのモーダルダイアログが開いているかチェック
      const modalElements = document.querySelectorAll('[data-modal-overlay], [role="dialog"], .modal-active-overlay');
      const lenis = (window as any).lenis;
      
      if (modalElements.length > 0) {
        document.body.classList.add('modal-open');
        lenis?.stop();
      } else {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        lenis?.start();
      }
    };

    handleCheckModals();
    const observer = new MutationObserver(handleCheckModals);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      const lenis = (window as any).lenis;
      lenis?.start();
    };
  }, []);


  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const initialSubTab = (urlTab && ['profile', 'received', 'sent', 'notifications'].includes(urlTab))
    ? (urlTab as 'profile' | 'received' | 'sent' | 'notifications')
    : (location.state?.defaultTab || 'profile');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'received' | 'sent' | 'notifications'>(initialSubTab);
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'received', 'sent', 'notifications'].includes(tab)) {
      setActiveSubTab(tab as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      const tab = searchParams.get('tab');
      if (tab === 'sent' || location.hash.includes('sent')) {
        setActiveSubTab('sent');
        setTimeout(() => {
          const el = document.getElementById('account-tabs');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    }
  }, [loading, searchParams, location.hash]);

  useEffect(() => {
    const syncUserInfo = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const latestUser = await res.json();
          if (latestUser.is_ekyc_verified) {
            localStorage.setItem('ekyc_verified', 'true');
          } else {
            if (localStorage.getItem('ekyc_verified') === 'true' && !latestUser.is_ekyc_verified) {
              // DB側でリセットされた場合はlocalStorageも同期
              localStorage.setItem('ekyc_verified', 'false');
            }
          }
          updateUser(latestUser);
        }
        await fetchNotifySettings();
      } catch (e) {
        console.error("Failed to sync user info:", e);
      }
    };
    syncUserInfo();
  }, [token]);

  const handleTabChange = (tab: 'profile' | 'received' | 'sent' | 'notifications') => {
    setActiveSubTab(tab);
    setSearchParams({ tab });
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // マイページ用eKYCプログレスバー＆API処理連動
  useEffect(() => {
    let interval: any;
    if (showMypageEkycModal && mypageEkycStep === 4) {
      setMypageEkycProgress(0);
      interval = setInterval(() => {
        setMypageEkycProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // APIを叩いてeKYCを完了
            (async () => {
              try {
                const res = await fetch('/api/auth/ekyc-verify', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    document_type: mypageEkycDocType,
                    ekyc_name: mypageEkycName,
                    birthdate: mypageEkycBirthdate
                  })
                });
                if (res.ok) {
                  localStorage.setItem('ekyc_verified', 'true');
                  window.dispatchEvent(new Event('ekyc_changed'));
                  updateUser({ is_ekyc_verified: true });
                  setMypageEkycStep(5);
                } else {
                  const data = await res.json();
                  alert(data.error || '本人確認に失敗しました。');
                  setMypageEkycStep(1);
                }
              } catch (err) {
                console.error(err);
                alert('本人確認処理中にエラーが発生しました。');
                setMypageEkycStep(1);
              }
            })();
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [mypageEkycStep, showMypageEkycModal, token]);

  const fetchNotifications = async () => {
    if (!token) return;
    setNotificationsLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      }
    } catch {
      // Silently handle fetch issues
    } finally {
      setNotificationsLoading(false);
    }
  };

  const formatNotificationDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return '今ちょうど';
      if (diffMin < 60) return `${diffMin}分前`;
      if (diffHour < 24) return `${diffHour}時間前`;
      if (diffDay === 1) return '昨日';
      if (diffDay < 7) return `${diffDay}日前`;
      
      return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return dateStr;
    }
  };

  const handleMarkAsRead = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token || notifications.length === 0) return;
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => 
        fetch(`/api/notifications/${n.id}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleDeletePost = async () => {
    if (!deleteConfirmPost || !deleteConsent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteConfirmPost.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        setMyPosts(prev => prev.filter(p => p.id !== deleteConfirmPost.id));
        setDeleteConfirmPost(null);
        setDeleteConsent(false);
        alert('メッセージ（ボトル）を正常に回収（削除）しました。');
      } else {
        const errData = await res.json();
        alert(errData.error || '削除に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。接続を確認してください。');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMy, resConnected, resProfile, resNotifications] = await Promise.all([
          fetch('/api/posts/my-posts', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/posts/connected-posts', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (resMy.ok) {
          const myData = await resMy.json();
          setMyPosts(myData);
        }
        if (resConnected.ok) {
          const connectedData = await resConnected.json();
          setConnectedPosts(connectedData);
        }
        if (resNotifications.ok) {
          const notifData = await resNotifications.json();
          setNotifications(notifData);
        }
        await fetchMyAlerts();
        await fetchMyStories();
        if (resProfile.ok) {
          const profile = await resProfile.json();
          setEditingNickname(profile.nickname || '');
          setEditingEmail(profile.email || '');
          setEditingMaidenName(profile.maiden_name || '');
          if (profile.email_notifications !== undefined) {
            setEditingEmailNotifications(!!profile.email_notifications);
          }
          if (profile.contact_type) setEditingContactType(profile.contact_type);
          if (profile.contact_id) setEditingContactId(profile.contact_id);
          if (profile.gender) setEditingGender(profile.gender);
          updateUser({ 
            fullName: profile.fullName, 
            lastName: profile.lastName, 
            firstName: profile.firstName, 
            nickname: profile.nickname, 
            email: profile.email,
            maiden_name: profile.maiden_name,
            birthdate: profile.birthdate,
            gender: profile.gender,
            email_notifications: profile.email_notifications !== undefined ? profile.email_notifications : true,
            contact_type: profile.contact_type || editingContactType,
            contact_id: profile.contact_id || editingContactId
          });
        }
      } catch (err) {
        console.error('Failed to fetch my posts, received letters or profile', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      localStorage.setItem('remeets_default_contact_type', editingContactType);
      localStorage.setItem('remeets_default_contact_id', editingContactId);

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: editingNickname,
          email: editingEmail,
          maiden_name: editingMaidenName,
          gender: editingGender,
          email_notifications: editingEmailNotifications,
          contact_type: editingContactType,
          contact_id: editingContactId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'プロフィールの更新に失敗しました。');
      }

      if (data.emailChanged) {
        setShowEmailChangeSuccess(true);
        return;
      }

      updateUser({ 
        nickname: editingNickname, 
        email: editingEmail,
        maiden_name: editingMaidenName, 
        gender: editingGender,
        contact_type: editingContactType, 
        contact_id: editingContactId 
      });
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setShowEditProfileModal(false);
      }, 1400);
    } catch (err: any) {
      setUpdateError(err.message || '通信エラーが発生しました。');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleQuickEmailNotifications = async () => {
    const nextVal = !editingEmailNotifications;
    setEditingEmailNotifications(nextVal);
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: user?.nickname || editingNickname,
          email: user?.email || editingEmail,
          email_notifications: nextVal,
          contact_type: (user as any)?.contact_type || editingContactType,
          contact_id: (user as any)?.contact_id || editingContactId
        })
      });
    } catch (e) {
      console.error('Failed to quick toggle email notifications:', e);
    }
  };

  if (showEmailChangeSuccess) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-8 animate-fade-in">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <Mail size={36} className="text-amber-600" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-brand-dark">メールアドレスを変更しました</h2>
          <p className="text-sm text-brand-dark/70 leading-relaxed font-sans">
            セキュリティ向上のため、再度新しいメールアドレス宛てに案内メールを送信いたしました。
          </p>
          <p className="text-xs text-amber-800 font-bold bg-amber-50/60 p-3 rounded-xl border border-amber-100 font-sans leading-relaxed">
            ※メール内の確認用リンクをクリックするまで、アカウント機能やプロフィール編集などの全機能をご利用いただけなくなります。
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full py-3 bg-brand-dark hover:bg-brand-primary text-white rounded-xl text-xs font-bold font-sans tracking-widest transition-all shadow-md"
        >
          ログアウトしてメールを確認する
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12 space-y-6 md:space-y-8 text-black font-sans">
      <BackToHomeButton className="mb-2" />
      {/* Account Header Section */}
      <PageHeader
        icon={<UserIcon size={24} className="text-sky-600" />}
        iconBoxClassName="bg-sky-50 text-sky-600 border border-sky-100"
        category="My Account Dashboard"
        badge={
          <span className="text-[10px] font-bold text-black bg-black/5 border border-black/10 px-2 py-0.5 rounded-md font-sans flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            本人アカウント
          </span>
        }
        title="マイアカウント"
        description="登録情報の変更、流したメッセージ（ボトルメール）への再会申請の確認、及び想い出の照合・連絡先開示状況を一元管理できます。"
        action={
          <button 
            type="button"
            onClick={() => { logout(); navigate('/login'); }} 
            className="text-xs px-4 py-2 border border-brand-border hover:border-red-200 hover:text-rose-600 rounded-xl transition-all font-bold cursor-pointer font-sans bg-white shadow-sm hover:shadow hover:bg-rose-50/20 active:scale-95 shrink-0"
          >
            ログアウト
          </button>
        }
      />

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <BottleLoader />
          <p className="text-xs text-brand-dark/40 font-sans animate-pulse">データを読み込んでいます...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* テスト開発用 eKYCステータス切替クイックツールバー */}
          <div className="bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-1 rounded-lg">
                ⚙️ テスト検証用
              </span>
              <span className="text-xs text-amber-950 font-medium">
                現在のeKYC状態: 
                {(user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true') ? (
                  <strong className="text-emerald-700 font-bold ml-1">🛡️ 公的本人確認完了済み</strong>
                ) : (
                  <strong className="text-zinc-700 font-bold ml-1">📝 未申請（未認証）</strong>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetEkycStatus}
                disabled={isResettingEkyc}
                className="text-xs bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={12} className={isResettingEkyc ? "animate-spin" : ""} />
                <span>🔄 未申請（未認証）に戻す</span>
              </button>
              <button
                type="button"
                onClick={handleForceCompleteEkyc}
                disabled={isResettingEkyc}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck size={12} className={isResettingEkyc ? "animate-spin" : ""} />
                <span>⚡ 完了済みにする</span>
              </button>
            </div>
          </div>

          {ekycMessage && (
            <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl shadow-xs animate-fade-in flex items-center justify-between">
              <span>{ekycMessage}</span>
              <button onClick={() => setEkycMessage(null)} className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer px-1">✕</button>
            </div>
          )}

          {/* User Profile Card Summary Dashboard */}
          <div className="bg-[#f2f5f8] border-2 border-slate-300 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6">
            {/* Top Bar: Large Prominent Name, Badge & Prominent Edit Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b-2 border-slate-300/70 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-teal-600 text-white flex items-center justify-center font-serif font-bold text-2xl shadow-md shrink-0 select-none ring-4 ring-white">
                  {user?.fullName ? user.fullName.charAt(0) : 'R'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 font-sans uppercase tracking-wider">
                      【お名前】
                    </span>
                    <span className="text-[10px] font-sans font-bold bg-white text-slate-700 px-2 py-0.5 rounded-md border-2 border-slate-300/90 shadow-2xs">
                      {user?.role === 'super_admin' ? '管理者アカウント' : '一般メンバー'}
                    </span>
                    {(user?.is_supporter || localStorage.getItem('remeets_is_supporter') === 'true') && (
                      <span className="text-[11px] text-amber-900 bg-amber-100 border-2 border-amber-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        ⭐ 公式サポーター
                      </span>
                    )}
                  </div>
                  {/* 大きく見やすいフォントでお名前を表示 */}
                  <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-wide flex items-baseline gap-2 flex-wrap">
                    <span>{user?.fullName || '名前未設定'} 様</span>
                    {user?.maiden_name && (
                      <span className="text-sm sm:text-base font-medium text-slate-500 font-sans">
                        （旧姓: {user.maiden_name}）
                      </span>
                    )}
                  </h2>
                </div>
              </div>

              {/* 上部クイックアクションボタン */}
              <div className="flex items-center gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfileModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Edit3 size={13} className="text-white shrink-0" />
                  <span>✏️ 登録内容を変更</span>
                </button>
              </div>
            </div>

            {/* Middle Section: 各項目がゆったり美しく整列する 2列グリッド構造（2列×4行 = 計8項目） */}
            <div className="space-y-3 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                {/* 1. ゆかりの地 */}
                <div className="bg-white hover:border-teal-400 px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300/90 shadow-2xs transition-all flex items-center justify-between gap-3 group min-h-[58px]">
                  <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                    <MapPin size={12} className="text-teal-600" />
                    <span>【ゆかりの地】</span>
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors truncate text-right">
                    {(user as any)?.hometown ? (
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-lg font-bold">
                        {(user as any).hometown}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">未設定（変更ボタンから登録）</span>
                    )}
                  </div>
                </div>

                {/* 2. ユーザーID */}
                <div className="bg-white hover:border-indigo-400 px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300/90 shadow-2xs transition-all flex items-center justify-between gap-3 group min-h-[58px]">
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    【ユーザーID】
                  </span>
                  <div className="text-xs sm:text-sm font-mono font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-lg border border-indigo-200/70 truncate text-right">
                    @{user?.username || '未付番'}
                  </div>
                </div>

                {/* 3. メールアドレス */}
                <div className="bg-white hover:border-indigo-400 px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300/90 shadow-2xs transition-all flex items-center justify-between gap-3 group min-h-[58px]">
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    【メールアドレス】
                  </span>
                  <div className="text-xs sm:text-sm font-medium font-mono text-slate-800 truncate text-right max-w-[220px] sm:max-w-[280px]" title={user?.email}>
                    {user?.email || '未設定'}
                  </div>
                </div>

                {/* 4. 再会時の開示連絡先 */}
                <div className="bg-white hover:border-teal-400 px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300/90 shadow-2xs transition-all flex items-center justify-between gap-3 group min-h-[58px]">
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    【開示連絡先】
                  </span>
                  {((user as any)?.contact_id || editingContactId) ? (
                    <div className="text-xs sm:text-sm font-bold text-teal-800 flex items-center gap-2 truncate justify-end">
                      <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md text-[10.5px] font-mono font-extrabold shrink-0 border border-teal-200">
                        {(user as any)?.contact_type || editingContactType || 'LINE'}
                      </span>
                      <span className="font-mono font-bold text-teal-950 truncate max-w-[180px] sm:max-w-[240px]">
                        {(user as any)?.contact_id || editingContactId}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-400 text-right">
                      未登録
                    </div>
                  )}
                </div>

                {/* 5. 年齢 / 生年月日（変更不可） */}
                <div className="bg-white hover:border-indigo-400 px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300/90 shadow-2xs transition-all flex items-center justify-between gap-3 group min-h-[58px]">
                  <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1.5">
                    <span>【年齢 / 生年月日】</span>
                    <span title="システム固定情報（変更不可）">
                      <Lock size={11} className="text-slate-400" />
                    </span>
                  </span>
                  <div className="text-right truncate">
                    {user?.birthdate ? (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs sm:text-sm text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200/80 font-bold font-mono">
                          満{getAgeFromBirthdate(user.birthdate)}歳
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          ({user.birthdate.replace(/-/g, '/')})
                        </span>
                      </div>
                    ) : (
                      <span className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        🛡️ 18歳以上確認済
                      </span>
                    )}
                  </div>
                </div>

                {/* 6. 性別 */}
                <div className="bg-white hover:border-indigo-400 px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300/90 shadow-2xs transition-all flex items-center justify-between gap-3 group min-h-[58px]">
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    【性別】
                  </span>
                  <div className="text-right">
                    {(user as any)?.gender === '男性' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                        👨 男性
                      </span>
                    ) : (user as any)?.gender === '女性' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200/80 shadow-2xs">
                        👩 女性
                      </span>
                    ) : (user as any)?.gender ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                        {(user as any).gender}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200/60">
                        👤 未設定 (任意)
                      </span>
                    )}
                  </div>
                </div>

                {/* 7. 本人確認状況 */}
                <div className={`px-4 sm:px-5 py-3 rounded-2xl border-2 shadow-2xs flex items-center justify-between gap-3 min-h-[58px] ${
                  (user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true')
                    ? 'bg-emerald-50/90 border-emerald-300'
                    : 'bg-amber-50/80 border-amber-300'
                }`}>
                  <span className="text-xs font-bold text-slate-500 shrink-0">【本人確認】</span>
                  {(user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true') ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                      🛡️ 公的eKYC完了
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-900 bg-white border border-amber-300 px-3 py-0.5 rounded-lg shadow-2xs">
                      📝 自己誓約
                    </span>
                  )}
                </div>

                {/* 8. メール通知設定 */}
                <div className="bg-white hover:border-rose-400 px-4 sm:px-5 py-3 rounded-2xl border-2 border-slate-300/90 shadow-2xs transition-all flex items-center justify-between gap-3 group min-h-[58px]">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Bell size={13} className={editingEmailNotifications ? "text-rose-500" : "text-slate-400"} />
                    <span className="text-xs font-bold text-slate-500">
                      【メール通知】
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold ${editingEmailNotifications ? 'text-rose-700' : 'text-slate-400'}`}>
                      {editingEmailNotifications ? '受信中 (ON)' : '停止中 (OFF)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleQuickEmailNotifications()}
                      title={editingEmailNotifications ? "通知をOFFにする" : "通知をONにする"}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        editingEmailNotifications ? 'bg-rose-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className="sr-only">メール通知切り替え</span>
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          editingEmailNotifications ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✉️ あなたの公開メッセージ（1人1通・最重要カード） */}
          {(() => {
            const currentPost = myPosts && myPosts.length > 0 ? myPosts[0] : null;
            return (
              <div className="bg-white border-2 border-teal-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 text-left relative overflow-hidden font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-teal-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-200 shrink-0 shadow-2xs">
                      ✉️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">あなたの公開メッセージ</h3>
                        {currentPost && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Google検索・公開中
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-sans">
                        {currentPost 
                          ? 'あなたを探している相手がGoogle検索等で見つけられるメッセージです（原則1ユーザー1通）。' 
                          : 'あなたを探している大切な人のために、メッセージを届けておきましょう。'}
                      </p>
                    </div>
                  </div>

                  {currentPost ? (
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => setShowEditMessageModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Edit3 size={13} />
                        <span>✏️ メッセージを修正</span>
                      </button>
                      <Link
                        to={`/posts/${currentPost.id}`}
                        target="_blank"
                        className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>公開画面</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletePublicMessageConsent(false);
                          setShowDeletePublicMessageModal(true);
                        }}
                        className="px-3 py-2 border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Google検索・公開画面から完全に削除します"
                      >
                        <Trash2 size={13} />
                        <span>🗑️ 削除</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/create"
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 self-start sm:self-auto"
                    >
                      <Sparkles size={14} />
                      <span>✍️ メッセージを届ける（作成）</span>
                    </Link>
                  )}
                </div>

                {currentPost ? (
                  <div className="space-y-4">
                    {/* メタデータグリッド（大きめ・高コントラスト） */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-600 block">ゆかりの地</span>
                        <span className="font-bold text-slate-950 text-sm sm:text-base block">
                          {currentPost.target_hometown || (user as any)?.hometown || '未選択'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-600 block">旧姓・当時の苗字</span>
                        <span className="font-bold text-slate-950 text-sm sm:text-base block">
                          {currentPost.searcher_maiden_name || currentPost.target_maiden_name || (user as any)?.maiden_name || 'なし'}
                          {(currentPost.target_maiden_name_kana || (user as any)?.maiden_name_kana) && (
                            <span className="text-xs font-normal text-slate-600 ml-1">
                              （{currentPost.target_maiden_name_kana || (user as any)?.maiden_name_kana}）
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-600 block">生まれ年</span>
                        <span className="font-bold text-slate-950 text-sm sm:text-base block">
                          {currentPost.era ? formatEraLabel(currentPost.era) : '非公開'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-600 block">公開ステータス</span>
                        <span className="font-bold text-emerald-800 text-xs sm:text-sm block flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Google検索対象</span>
                        </span>
                      </div>
                    </div>

                    {/* メッセージ本文（高コントラスト） */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                        <span>公開メッセージ本文</span>
                        <span className="text-[11px] text-teal-700 font-bold">誰でも閲覧可能（Google検索対象）</span>
                      </span>
                      <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-slate-200 text-slate-950 font-sans font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-2xs">
                        {currentPost.message || currentPost.searcher_profile || '（メッセージが入力されていません）'}
                      </div>
                    </div>

                    {/* 開示連絡先 ＆ 公開リンク */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* 開示連絡先 */}
                      <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                            <Lock size={12} className="text-teal-700" />
                            <span>再会時の開示連絡先</span>
                          </span>
                          <span className="text-[10px] text-teal-800 bg-white border border-teal-200 px-2 py-0.2 rounded-full font-bold">
                            承認時のみ開示
                          </span>
                        </div>
                        <div className="text-xs font-mono font-bold text-teal-950">
                          <span className="bg-teal-200/60 px-1.5 py-0.5 rounded mr-1.5 text-[11px]">{currentPost.contact_type || 'LINE'}</span>
                          <span>{currentPost.contact_id || '未登録'}</span>
                        </div>
                      </div>

                      {/* 公開URL */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <ExternalLink size={12} className="text-slate-500" />
                            <span>専用公開URL</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const url = `${window.location.origin}${getPostUrl(currentPost)}`;
                              navigator.clipboard.writeText(url);
                              setCopiedPostLink(true);
                              setTimeout(() => setCopiedPostLink(false), 2000);
                            }}
                            className="text-[10px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedPostLink ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5"><Check size={11} /> コピー完了</span>
                            ) : (
                              <span className="flex items-center gap-0.5"><Copy size={11} /> URLをコピー</span>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}${getPostUrl(currentPost)}`}
                          className="w-full text-xs font-mono text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 outline-none select-all"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 px-4 bg-gradient-to-br from-teal-50/60 to-slate-50 rounded-2xl border border-dashed border-teal-200 text-center space-y-3">
                    <p className="text-sm font-bold text-slate-800 font-serif">まだ公開メッセージが登録されていません</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      お名前やゆかりの地、当時の思い出メッセージを登録すると、Google検索等であなたを探している相手がメッセージを見つけられるようになります。
                    </p>
                    <Link
                      to="/create"
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <Sparkles size={14} />
                      <span>メッセージを作成して公開する</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 公開メッセージ編集ポップアップモーダル */}
          {myPosts && myPosts.length > 0 && (
            <EditPublicMessageModal
              isOpen={showEditMessageModal}
              onClose={() => setShowEditMessageModal(false)}
              post={myPosts[0]}
              token={token}
              onUpdated={(updatedPost) => {
                setMyPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
              }}
              onDeleteRequested={() => {
                setDeletePublicMessageConsent(false);
                setShowDeletePublicMessageModal(true);
              }}
            />
          )}

          {/* 公開メッセージ削除確認ポップアップモーダル */}
          {myPosts && myPosts.length > 0 && (
            <DeletePublicMessageModal
              isOpen={showDeletePublicMessageModal}
              onClose={() => setShowDeletePublicMessageModal(false)}
              post={myPosts[0]}
              consent={deletePublicMessageConsent}
              setConsent={setDeletePublicMessageConsent}
              onDelete={handleDeletePublicMessage}
              isDeleting={isDeletingPublicMessage}
            />
          )}

          {/* 登録内容・SNS ID 変更ポップアップモーダル */}
          <EditProfileModal
            isOpen={showEditProfileModal}
            onClose={() => setShowEditProfileModal(false)}
            user={user}
            token={token}
            updateUser={updateUser}
            getAgeFromBirthdate={getAgeFromBirthdate}
          />

          {/* Tab Selection Segments: Modern Pill Card Control */}
          <div id="account-tabs" className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5 font-sans">
                <UserIcon size={13} className="text-teal-600" />
                <span>マイアカウント管理（タブを選択して表示項目を切り替え）</span>
              </span>
              <span className="text-[10px] text-teal-800 font-extrabold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {activeSubTab === 'profile' && '🛡️ 本人確認・応援 表示中'}
                {activeSubTab === 'received' && '💌 届いた再会希望 一覧表示中'}
                {activeSubTab === 'sent' && '📮 送信した再会申請 一覧表示中'}
                {activeSubTab === 'notifications' && '🔔 通知・履歴 表示中'}
              </span>
            </div>

            <div className="p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/80 shadow-inner grid grid-cols-2 sm:grid-cols-4 gap-1.5 select-none">
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl relative ${
                  activeSubTab === 'profile'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1 sm:p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'profile' ? 'bg-teal-700 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <ShieldCheck size={13} />
                </span>
                <span className="truncate">本人確認・応援</span>
                {activeSubTab === 'profile' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-teal-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('received')}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl relative ${
                  activeSubTab === 'received'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1 sm:p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'received' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <Mail size={13} />
                </span>
                <span className="truncate">届いた再会希望</span>
                <span className={`text-[9.5px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold transition-all shrink-0 ${
                  connectedPosts.length > 0
                    ? (activeSubTab === 'received' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                    : (activeSubTab === 'received' ? 'bg-slate-200 text-slate-700 font-normal' : 'bg-slate-300/80 text-slate-600 font-normal')
                }`}>
                  {connectedPosts.length}通
                </span>
                {activeSubTab === 'received' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleTabChange('sent')}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl relative ${
                  activeSubTab === 'sent'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1 sm:p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'sent' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <Send size={12} />
                </span>
                <span className="truncate">流したメッセージ</span>
                <span className={`text-[9.5px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold transition-all shrink-0 ${
                  myPosts.length > 0
                    ? (activeSubTab === 'sent' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-teal-100 text-teal-800 border border-teal-300')
                    : (activeSubTab === 'sent' ? 'bg-slate-200 text-slate-700 font-normal' : 'bg-slate-300/80 text-slate-600 font-normal')
                }`}>
                  {myPosts.length}通
                </span>
                {activeSubTab === 'sent' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-teal-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleTabChange('notifications');
                  fetchNotifications();
                }}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl relative ${
                  activeSubTab === 'notifications'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1 sm:p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'notifications' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <Bell size={13} />
                </span>
                <span className="truncate">通知ログ</span>
                <span className={`text-[9.5px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold transition-all shrink-0 ${
                  notifications.filter(n => !n.is_read).length > 0
                    ? (activeSubTab === 'notifications' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-100 text-rose-700 border border-rose-200')
                    : (activeSubTab === 'notifications' ? 'bg-slate-200 text-slate-700 font-normal' : 'bg-slate-300/80 text-slate-600 font-normal')
                }`}>
                  {notifications.filter(n => !n.is_read).length > 0 ? `${notifications.filter(n => !n.is_read).length}件` : `${notifications.length}件`}
                </span>
                {activeSubTab === 'notifications' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-rose-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <div className="py-2">
            {activeSubTab === "received" && (
              <AccountReceivedTab
                connectedPosts={connectedPosts}
                setStoryTargetPost={setStoryTargetPost}
                setStoryTargetRole={setStoryTargetRole}
                setStoryModalOpen={setStoryModalOpen}
                mySubmittedStories={mySubmittedStories}
                storyCurrentPage={storyCurrentPage}
                setStoryCurrentPage={setStoryCurrentPage}
                STORIES_PER_PAGE={STORIES_PER_PAGE}
              />
            )}

            {activeSubTab === "sent" && (
              <AccountSentTab
                myPosts={myPosts}
                loading={loading}
                setDeleteConfirmModal={setDeleteConfirmPost}
                setShowEditModal={setShowEditProfileModal}
                setStoryTargetPost={setStoryTargetPost}
                setStoryTargetRole={setStoryTargetRole}
                setStoryModalOpen={setStoryModalOpen}
                handleBulkDeletePosts={handleBulkDeletePosts}
                mySubmittedStories={mySubmittedStories}
                storyCurrentPage={storyCurrentPage}
                setStoryCurrentPage={setStoryCurrentPage}
                STORIES_PER_PAGE={STORIES_PER_PAGE}
              />
            )}

            {activeSubTab === "notifications" && (
              <AccountNotificationsTab
                accountNotifications={notifications}
                notificationLoading={notificationsLoading}
                handleMarkAllNotificationsAsRead={handleMarkAllAsRead}
                handleSingleNotificationClick={handleMarkAsRead}
                handleDeleteSingleNotification={handleDeleteNotification}
                isAlertModalOpen={isAlertModalOpen}
                setIsAlertModalOpen={setIsAlertModalOpen}
                setEditingAlert={setEditingAlert}
                searchAlerts={myAlerts}
                notifyAlertEnabled={notifyAlertEnabled}
                isUpdatingNotifyAlert={isUpdatingNotifyAlert}
                fetchNotifications={fetchNotifications}
              />
            )}

            {activeSubTab === "profile" && (
              <AccountProfileTab
                user={user}
                token={token}
                updateUser={updateUser}
                setShowMypageEkycModal={setShowMypageEkycModal}
                setMypageEkycStep={setMypageEkycStep}
                setDeleteAccountConsent={setDeleteAccountConsent}
                setShowDeleteAccountModal={setShowDeleteAccountModal}
              />
            )}

          </div>
        </div>
      )}

            {/* 退会確認モーダル */}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        consent={deleteAccountConsent}
        setConsent={setDeleteAccountConsent}
        onDelete={handleDeleteAccount}
        isDeleting={isDeletingAccount}
      />
      {/* マイページ内 eKYC 手続きモーダル */}
      <MypageEkycModal
        isOpen={showMypageEkycModal}
        onClose={() => setShowMypageEkycModal(false)}
        user={user}
        token={token}
        updateUser={updateUser}
      />

      <SuccessStoryModal
        isOpen={storyModalOpen}
        onClose={() => {
          setStoryModalOpen(false);
          setStoryTargetPost(null);
        }}
        initialPost={storyTargetPost}
        initialRole={storyTargetRole}
        onSuccess={() => {
          fetchMyStories();
        }}
      />
      {/* 🔔 マイアカウント専用: 入荷通知アラート直接登録・編集モーダル */}
      <AccountAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        editingAlert={editingAlert}
        setEditingAlert={setEditingAlert}
        handleSaveAlertModal={handleSaveAlertModal}
        alertModalError={alertModalError}
        isAlertSaving={isAlertSaving}
      />

    </div>
  );
};

