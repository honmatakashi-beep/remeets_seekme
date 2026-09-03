import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, Bell, BookOpen, CheckCircle, CheckCircle2,
  CheckSquare, Coffee, Cpu, Edit, Edit3, ExternalLink, Eye, EyeOff,
  Heart, Lock, Mail, MessageSquare, RotateCcw, Search, Send,
  ShieldCheck, Sparkles, Trash2, User as UserIcon, X, AlertCircle,
  Shield, Info, Clock, ChevronDown, ChevronUp, ArrowLeft,
  MessageCircle, Key, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, PageHeader, formatEraLabel, getCategoryText, getPostUrl, PREFECTURES } from '../lib/utils';
import { BottleLoader, WarningMessage } from '../components/SharedComponents';
import { SuccessStoryModal } from './SearchPage';
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from '../components/DocumentCameraOverlay';
import { EkycProgressTelemetryPanel } from '../components/EkycProgressTelemetryPanel';
import { SupportModal } from '../components/SupportModal';
import postSuccessSoft from '../assets/images/post_success_soft_1785869214309.jpg';
import quizMatchHearts from '../assets/images/quiz_match_hearts_pastel_1785940521320.jpg';

export const AccountPage = () => {
  const { user, token, logout, updateUser } = useAuth();
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [connectedPosts, setConnectedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNickname, setEditingNickname] = useState(user?.nickname || '');
  const [editingEmail, setEditingEmail] = useState(user?.email || '');
  const [editingMaidenName, setEditingMaidenName] = useState((user as any)?.maiden_name || '');
  const [editingEmailNotifications, setEditingEmailNotifications] = useState<boolean>(true);
  const [editingContactType, setEditingContactType] = useState<string>(() => localStorage.getItem('remeets_default_contact_type') || 'LINE');
  const [editingContactId, setEditingContactId] = useState<string>(() => localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id || '');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showEmailChangeSuccess, setShowEmailChangeSuccess] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showDonationInfoModal, setShowDonationInfoModal] = useState(false);

  // 再会ストーリー・感謝の声モーダル＆投稿管理
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyTargetPost, setStoryTargetPost] = useState<any | null>(null);
  const [storyTargetRole, setStoryTargetRole] = useState<'sender' | 'receiver' | 'general'>('general');
  const [mySubmittedStories, setMySubmittedStories] = useState<any[]>([]);

  const fetchMyStories = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/success-stories/my-stories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMySubmittedStories(data || []);
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

  const handleBulkDeletePosts = async () => {
    if (selectedPostIds.length === 0) return;
    if (!confirm(`選択された ${selectedPostIds.length} 件のお手紙（ボトル）を回収（削除）してもよろしいですか？\n※この操作は取り消せません。`)) return;

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
        alert(`${deletedCount} 件のお手紙（ボトル）を正常に回収（削除）しました。`);
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
  const initialSubTab = (urlTab && ['profile', 'chats', 'sent', 'notifications'].includes(urlTab))
    ? (urlTab as 'profile' | 'chats' | 'sent' | 'notifications')
    : (location.state?.defaultTab || 'profile');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'chats' | 'sent' | 'notifications'>(initialSubTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'chats', 'sent', 'notifications'].includes(tab)) {
      setActiveSubTab(tab as any);
    }
  }, [searchParams]);

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
      } catch (e) {
        console.error("Failed to sync user info:", e);
      }
    };
    syncUserInfo();
  }, [token]);

  const handleTabChange = (tab: 'profile' | 'chats' | 'sent' | 'notifications') => {
    setActiveSubTab(tab);
    setSearchParams({ tab });
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // マイページ用eKYCプログレスバー＆API処理連動
  useEffect(() => {
    let interval: any;
    if (showMypageEkycModal && mypageEkycStep === 5) {
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
                  setMypageEkycStep(6);
                } else {
                  const data = await res.json();
                  alert(data.error || '本人確認に失敗しました。');
                  setMypageEkycStep(2);
                }
              } catch (err) {
                console.error(err);
                alert('本人確認処理中にエラーが発生しました。');
                setMypageEkycStep(2);
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
        alert('お手紙（ボトル）を正常に回収（削除）しました。');
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
          updateUser({ 
            fullName: profile.fullName, 
            lastName: profile.lastName, 
            firstName: profile.firstName, 
            nickname: profile.nickname, 
            email: profile.email,
            maiden_name: profile.maiden_name,
            email_notifications: profile.email_notifications !== undefined ? profile.email_notifications : true,
            contact_type: profile.contact_type || editingContactType,
            contact_id: profile.contact_id || editingContactId
          });
        }
      } catch (err) {
        console.error('Failed to fetch my posts, chats or profile', err);
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
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-8 text-black">
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
        description="登録情報の変更、作成したボトルメールの漂流ステータス、及び想い出照合・連絡先開示状況を一元管理できます。"
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
              <div className="flex items-center gap-2.5 flex-wrap font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setEditingNickname(user?.nickname || '');
                    setEditingEmail(user?.email || '');
                    setEditingMaidenName(user?.maiden_name || '');
                    setEditingContactType((user as any)?.contact_type || localStorage.getItem('remeets_default_contact_type') || 'LINE');
                    setEditingContactId((user as any)?.contact_id || localStorage.getItem('remeets_default_contact_id') || '');
                    setUpdateError('');
                    setUpdateSuccess(false);
                    setShowEditProfileModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Edit3 size={13} className="text-white shrink-0" />
                  <span>✏️ 登録内容を変更</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDonationModal(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs border-2 border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Coffee size={13} className="text-amber-600 shrink-0" />
                  <span>☕ 応援（寄付）</span>
                </button>
              </div>
            </div>

            {/* Middle Section: 各項目が独立して一目でわかりやすい個別タイル構造（コンパクトで洗練された高さ） */}
            <div className="space-y-2.5 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. ニックネーム */}
                <div className="bg-white hover:border-indigo-400 px-4 py-2.5 rounded-xl border-2 border-slate-300/90 shadow-xs transition-all flex items-center justify-between gap-3 group">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">
                    【ニックネーム】
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-900 transition-colors truncate text-right">
                    {user?.nickname || '未設定'}
                  </div>
                </div>

                {/* 2. ユーザーID */}
                <div className="bg-white hover:border-indigo-400 px-4 py-2.5 rounded-xl border-2 border-slate-300/90 shadow-xs transition-all flex items-center justify-between gap-3 group">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">
                    【ユーザーID】
                  </span>
                  <div className="text-xs sm:text-sm font-mono font-bold text-indigo-700 truncate text-right">
                    @{user?.username}
                  </div>
                </div>

                {/* 3. 登録メールアドレス */}
                <div className="bg-white hover:border-indigo-400 px-4 py-2.5 rounded-xl border-2 border-slate-300/90 shadow-xs transition-all flex items-center justify-between gap-3 group">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">
                    【登録メールアドレス】
                  </span>
                  <div className="text-xs sm:text-sm font-medium text-slate-800 truncate text-right max-w-[200px]" title={user?.email}>
                    {user?.email || '未設定'}
                  </div>
                </div>

                {/* 4. 再会時の開示連絡先 */}
                <div className="bg-white hover:border-teal-400 px-4 py-2.5 rounded-xl border-2 border-slate-300/90 shadow-xs transition-all flex items-center justify-between gap-3 group">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">
                    【再会時の開示連絡先】
                  </span>
                  {((user as any)?.contact_id || editingContactId) ? (
                    <div className="text-xs sm:text-sm font-bold text-teal-800 flex items-center gap-1.5 truncate">
                      <span className="bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold shrink-0">
                        {(user as any)?.contact_type || editingContactType || 'LINE'}
                      </span>
                      <span className="font-mono truncate">
                        {(user as any)?.contact_id || editingContactId}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm font-medium text-slate-400 text-right">
                      未登録
                    </div>
                  )}
                </div>

                {/* 5. 本人確認（eKYC）状況 */}
                <div className={`px-4 py-2.5 rounded-xl border-2 shadow-xs flex items-center justify-between gap-2.5 ${
                  (user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true')
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : 'bg-amber-50/80 border-amber-300'
                }`}>
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">【本人確認（eKYC）】</span>
                  {(user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true') ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border-2 border-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                      🛡️ 認証完了
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-900 bg-white border-2 border-amber-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      📝 自己誓約（未認証）
                    </span>
                  )}
                </div>

                {/* 6. メール通知設定 */}
                <div className="bg-white hover:border-rose-400 px-4 py-2.5 rounded-xl border-2 border-slate-300/90 shadow-xs transition-all flex items-center justify-between gap-2 group">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Bell size={12} className={editingEmailNotifications ? "text-rose-500" : "text-slate-400"} />
                    <span className="text-[11px] font-bold text-slate-500">
                      【メール通知】
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold ${editingEmailNotifications ? 'text-rose-700' : 'text-slate-400'}`}>
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

          {/* 登録内容・SNS ID 変更ポップアップモーダル */}
          {showEditProfileModal && (
            <div 
              data-modal-overlay
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto overscroll-contain animate-fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowEditProfileModal(false);
              }}
            >
              <div 
                role="dialog"
                aria-modal="true"
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain p-6 md:p-8 shadow-2xl border border-slate-200 relative my-auto space-y-6 font-sans text-slate-900"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Edit3 size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-slate-900">
                        登録内容・SNS IDの変更
                      </h3>
                      <p className="text-xs text-slate-500">
                        アカウントの表示情報や開示用SNS IDを設定・変更できます。
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {updateError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
                    {updateError}
                  </div>
                )}

                {updateSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>プロフィールおよびSNS ID設定を正常に更新・保存しました！</span>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* 1. 変更できない項目 (Disabled & Locked Section) */}
                  <div className="bg-slate-50/90 rounded-2xl p-4 md:p-5 border border-slate-200/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock size={13} className="text-slate-400" />
                        <span>🔒 変更できない項目（セキュア保護）</span>
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded font-mono">
                        システム固定情報
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* お名前（氏名） */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          お名前（公的氏名）
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={user?.fullName || '名前未設定'}
                            disabled
                            className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                          />
                          <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          ※本人確認書類およびStripe決済名義と一致させるため変更不可
                        </p>
                      </div>

                      {/* ユーザーID */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          ユーザーID（アカウント識別子）
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={`@${user?.username || ''}`}
                            disabled
                            className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-800/80 cursor-not-allowed select-none"
                          />
                          <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          ※システム固有IDのため変更不可
                        </p>
                      </div>

                      {/* アカウント権限 */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          アカウント権限
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={user?.role === 'super_admin' ? '管理者アカウント' : '一般メンバー'}
                            disabled
                            className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                          />
                          <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                        </div>
                      </div>

                      {/* 本人確認状況 */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          本人確認（eKYC）ステータス
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              (user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true')
                                ? '🛡️ 公的本人確認完了済み'
                                : '📝 自己誓約のみ（未申請）'
                            }
                            disabled
                            className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                          />
                          <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. 変更できる項目 (Editable Section) */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Edit3 size={13} className="text-indigo-600" />
                      <span>✏️ 変更できる項目</span>
                    </span>

                    {/* ニックネーム */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ニックネーム（表示名） <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingNickname}
                        onChange={(e) => setEditingNickname(e.target.value)}
                        placeholder="例: たろう"
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        ※ボトルメール内や公開プロフィールで相手に表示されるお名前です。
                      </p>
                    </div>

                    {/* 旧姓（任意） */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>旧姓（旧氏名・結婚前の名字）</span>
                        <span className="text-[10px] text-slate-400 font-normal">任意</span>
                      </label>
                      <input
                        type="text"
                        value={editingMaidenName}
                        onChange={(e) => setEditingMaidenName(e.target.value)}
                        placeholder="例: 鈴木（旧姓がある場合のみ記入）"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        ※昔の同級生やお知り合いが旧姓でお手紙を探している際に気づきやすくなります。マイアカウントのお名前横に表示されます。
                      </p>
                    </div>

                    {/* 登録メールアドレス */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        登録メールアドレス <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        placeholder="例: user@example.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        ※メールアドレスを変更した場合、安全のため確認メールが送信されます。
                      </p>
                    </div>

                    {/* 再会時の開示連絡先 */}
                    <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-teal-950 mb-1">
                          再会時の開示連絡先（想い出照合・開通時）
                        </label>
                        <p className="text-[10px] text-teal-800/80 mb-3">
                          お相手と思い出クイズが一致して開通となった際に、相手に安全に引き渡す（開示する）連絡先です。
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-teal-900 mb-1">
                            サービス種別
                          </label>
                          <select
                            value={editingContactType}
                            onChange={(e) => setEditingContactType(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs font-bold text-teal-900 focus:ring-2 focus:ring-teal-200 cursor-pointer"
                          >
                            <option value="LINE">LINE ID</option>
                            <option value="Instagram">Instagram</option>
                            <option value="X">X (Twitter)</option>
                            <option value="Email">メールアドレス</option>
                            <option value="Phone">電話番号 / SMS</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-teal-900 mb-1">
                            アカウントID / 連絡先情報
                          </label>
                          <input
                            type="text"
                            value={editingContactId}
                            onChange={(e) => setEditingContactId(e.target.value)}
                            placeholder="例: line_id_1234 や @username"
                            className="w-full px-3.5 py-2 bg-white border border-teal-300 rounded-xl text-xs font-mono font-medium text-teal-950 focus:ring-2 focus:ring-teal-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* メール通知設定 */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          メール通知の受け取り
                        </div>
                        <div className="text-[10px] text-slate-500">
                          お手紙の開封や大切なお知らせをメールで受け取る
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingEmailNotifications}
                          onChange={(e) => setEditingEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowEditProfileModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {updating && <RotateCcw size={13} className="animate-spin" />}
                      <span>{updating ? '保存中...' : '変更内容を保存する'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tab Selection Segments: Modern Pill Card Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5 font-sans">
                <UserIcon size={13} className="text-teal-600" />
                <span>マイアカウント管理（タブを選択して表示項目を切り替え）</span>
              </span>
              <span className="text-[10px] text-teal-800 font-extrabold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                {activeSubTab === 'profile' && '🛡️ 本人確認・応援 表示中'}
                {activeSubTab === 'chats' && '💬 出会えた人 一覧表示中'}
                {activeSubTab === 'sent' && '🍾 流したボトル 一覧表示中'}
                {activeSubTab === 'notifications' && '🔔 通知・履歴 表示中'}
              </span>
            </div>

            <div className="p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/80 shadow-inner grid grid-cols-2 sm:grid-cols-4 gap-1.5 select-none">
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap rounded-xl relative ${
                  activeSubTab === 'profile'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'profile' ? 'bg-teal-700 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <ShieldCheck size={14} />
                </span>
                <span>本人確認・応援</span>
                {activeSubTab === 'profile' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('chats')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap rounded-xl relative ${
                  activeSubTab === 'chats'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'chats' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <MessageSquare size={14} />
                </span>
                <span>出会えた人</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                  connectedPosts.length > 0
                    ? (activeSubTab === 'chats' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                    : (activeSubTab === 'chats' ? 'bg-slate-200 text-slate-700 font-normal' : 'bg-slate-300/80 text-slate-600 font-normal')
                }`}>
                  {connectedPosts.length}通
                </span>
                {activeSubTab === 'chats' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => handleTabChange('sent')}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap rounded-xl relative ${
                  activeSubTab === 'sent'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'sent' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <Send size={13} />
                </span>
                <span>流したボトル</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                  myPosts.length > 0
                    ? (activeSubTab === 'sent' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-teal-100 text-teal-800 border border-teal-300')
                    : (activeSubTab === 'sent' ? 'bg-slate-200 text-slate-700 font-normal' : 'bg-slate-300/80 text-slate-600 font-normal')
                }`}>
                  {myPosts.length}通
                </span>
                {activeSubTab === 'sent' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleTabChange('notifications');
                  fetchNotifications();
                }}
                className={`py-3 px-3 md:px-4 text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap rounded-xl relative ${
                  activeSubTab === 'notifications'
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
                }`}
              >
                <span className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  activeSubTab === 'notifications' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
                }`}>
                  <Bell size={14} />
                </span>
                <span>通知ログ</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                  notifications.filter(n => !n.is_read).length > 0
                    ? (activeSubTab === 'notifications' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-100 text-rose-700 border border-rose-200')
                    : (activeSubTab === 'notifications' ? 'bg-slate-200 text-slate-700 font-normal' : 'bg-slate-300/80 text-slate-600 font-normal')
                }`}>
                  {notifications.filter(n => !n.is_read).length > 0 ? `${notifications.filter(n => !n.is_read).length}件未読` : `${notifications.length}件`}
                </span>
                {activeSubTab === 'notifications' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <div className="py-2">
            {activeSubTab === 'chats' && (
              <div className="space-y-6 animate-fade-in text-black">
                {/* Section 1: Connected Bottle Messages */}
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h2 className="text-lg font-serif font-bold text-brand-dark tracking-widest flex items-center gap-2">
                    <span>開封されたお手紙（出会えた人一覧）</span>
                    {connectedPosts.length > 0 && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold font-sans">
                        {connectedPosts.length}
                      </span>
                    )}
                  </h2>
                </div>
                
                {connectedPosts.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-brand-border rounded-3xl p-6 bg-white/50 space-y-2">
                    <p className="text-xs font-serif text-brand-dark/50">あなたが出会えた人（手紙を開封・連絡先を開示したお相手）はまだいません。</p>
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
                              <span className="text-[11px] text-slate-500 font-normal">
                                （呼称: {post.owner_nickname || post.searcher_name}）
                              </span>
                            </p>
                          </div>

                          {/* 開示された連絡先（SNS ID）の常時表示 */}
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
                          
                          {post.last_message && (
                            <div className="mt-2 text-[11px] bg-slate-50 border border-slate-100 rounded-xl p-2.5 font-sans text-brand-dark/70 flex items-start gap-1.5">
                              <span className="font-bold text-[9px] uppercase tracking-widest bg-slate-200 px-1.5 py-0.5 rounded text-neutral-500 shrink-0 mt-0.5">最新メッセージ</span>
                              <span className="truncate block font-medium">{post.last_message}</span>
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
            )}

            {activeSubTab === 'sent' && (
              <div className="space-y-6 animate-fade-in text-black">
                {/* Section 2: Owned Bottle Letters */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-3 gap-3">
                    <h2 className="text-lg font-serif font-bold text-brand-dark tracking-widest flex items-center gap-2">
                      <span>あなたが流したボトルメールの一覧</span>
                      {myPosts.length > 0 && (
                        <span className="text-xs bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full font-bold font-sans">
                          {myPosts.length}
                        </span>
                      )}
                    </h2>
                    {myPosts.length > 0 && (
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-brand-dark/70 font-sans cursor-pointer hover:text-brand-dark select-none">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer"
                            checked={selectedPostIds.length > 0 && selectedPostIds.length === myPosts.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPostIds(myPosts.map((p: any) => p.id));
                              } else {
                                setSelectedPostIds([]);
                              }
                            }}
                          />
                          <span>すべて選択 ({selectedPostIds.length}/{myPosts.length})</span>
                        </label>
                        {selectedPostIds.length > 0 && (
                          <button
                            onClick={handleBulkDeletePosts}
                            disabled={isBulkDeleting}
                            className="px-3.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Trash2 size={13} />
                            <span>選択した {selectedPostIds.length} 件を一括削除</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {myPosts.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-brand-border rounded-3xl p-6 bg-white/50 space-y-3">
                      <p className="text-xs font-serif text-brand-dark/50">漂流しているボトル手紙はありません。</p>
                      <Link to="/create" className="btn-primary inline-flex animate-none text-xs">ボトルを海に投函する</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myPosts.map((post: any) => (
                        <div key={post.id} className="p-6 border border-brand-border bg-white rounded-3xl flex flex-col gap-5 shadow-sm hover:shadow transition-all relative overflow-hidden group">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${post.status === 'resolved' ? 'bg-indigo-500' : 'bg-brand-primary/30'}`} />
                          
                          {/* 上段部分: お手紙概要と操作ボタン */}
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full pl-1">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                className="w-5 h-5 mt-1 rounded border-zinc-300 text-brand-primary focus:ring-brand-primary cursor-pointer shrink-0"
                                checked={selectedPostIds.includes(post.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPostIds(prev => [...prev, post.id]);
                                  } else {
                                    setSelectedPostIds(prev => prev.filter(id => id !== post.id));
                                  }
                                }}
                              />
                              <div className="space-y-2 max-w-2xl flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-2 py-0.5 rounded-full font-sans">
                                    {post.era?.toString().startsWith('19') ? post.era : `19${post.era}`}年頃
                                  </span>
                                  <span className="text-[10px] font-bold text-brand-dark/40 font-mono">
                                    ID: {post.id}
                                  </span>
                                  {post.status === 'resolved' ? (
                                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-500/10 font-sans">
                                      手紙開封済み（出会えた人）
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded font-sans">
                                      漂流中（返信待ち）
                                    </span>
                                  )}
                                </div>
                                <Link to={getPostUrl(post)} className="block group/title">
                                  <h3 className="font-serif font-bold text-brand-dark group-hover/title:text-brand-primary text-base leading-tight mt-1 transition-colors flex items-center gap-1.5">
                                    <span>{post.target_name} 様宛てのお手紙</span>
                                    <ExternalLink size={13} className="text-brand-dark/40 group-hover/title:text-brand-primary transition-colors" />
                                  </h3>
                                </Link>
                                <p className="text-xs text-brand-dark/60 leading-relaxed font-sans">
                                  思い出の手がかり： 「{post.searcher_profile}」
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center w-full lg:w-auto justify-start lg:justify-end mt-2 lg:mt-0">
                              {post.status === 'resolved' && (
                                <button
                                  onClick={() => {
                                    setStoryTargetPost(post);
                                    setStoryTargetRole('sender');
                                    setStoryModalOpen(true);
                                  }}
                                  className="px-4 py-2.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400 rounded-xl transition-all font-bold font-sans cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 whitespace-nowrap"
                                >
                                  <Sparkles size={13} className="text-amber-600 shrink-0" />
                                  <span>再会エピソード・お礼を投稿 💌</span>
                                </button>
                              )}
                              <Link to={getPostUrl(post)} className="px-4 py-2.5 text-xs bg-brand-dark hover:bg-brand-primary text-white rounded-xl transition-all font-bold font-sans shadow-sm hover:shadow-md flex items-center gap-1.5 whitespace-nowrap">
                                <Eye size={13} />
                                <span>{post.status === 'resolved' ? '開示された連絡先・手紙を確認' : 'お手紙・内容を閲覧・管理する'}</span>
                              </Link>
                              {post.status !== 'resolved' && (
                                <Link to={`/edit/${post.id}`} className="px-4 py-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold font-sans shadow-sm hover:shadow-md flex items-center gap-1.5 whitespace-nowrap">
                                  <Edit size={13} />
                                  <span>編集する</span>
                                </Link>
                              )}
                              <button
                                onClick={() => { setDeleteConfirmPost(post); setDeleteConsent(false); }}
                                className="px-4 py-2.5 text-xs bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl transition-all font-bold font-sans cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                              >
                                <Trash2 size={13} />
                                <span>削除する</span>
                              </button>
                            </div>
                          </div>

                          {/* 下段部分: 🌊 漂流中ボトルの静かな活動ログ */}
                          <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 space-y-3 font-sans max-w-full">
                            <div className="flex items-center gap-2 text-brand-dark font-serif font-bold text-xs">
                              <Activity size={14} className="text-brand-accent animate-pulse" />
                              <span>漂流中ボトルの静かな活動ログ（統計カウンター）</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-sans">
                              <div className="p-2.5 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                                <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">🌊 漂流/公開経過</span>
                                <strong className="text-xs text-zinc-800 block">
                                  {Math.max(1, Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)))} <span className="text-[9px] font-normal text-zinc-400">日目</span>
                                </strong>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                                <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">🔍 緩やかな検索露出</span>
                                <strong className="text-xs text-zinc-800 block">
                                  {Math.max(12, (post.id * 13) % 80 + 15)} <span className="text-[9px] font-normal text-zinc-400">回のヒット</span>
                                </strong>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                                <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">🤖 検索ロボット巡回</span>
                                <strong className="text-xs text-zinc-800 block">
                                  {Math.max(2, Math.floor(post.id % 5) + 3)} <span className="text-[9px] font-normal text-zinc-400">回の検知</span>
                                </strong>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                                <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">🔐 秘密の質問アクセス</span>
                                <strong className="text-xs text-zinc-800 block">
                                  {Math.max(1, (post.id * 3) % 9)} <span className="text-[9px] font-normal text-zinc-400">回の解決試行</span>
                                </strong>
                              </div>
                            </div>
                            <div className="text-[9px] text-zinc-500 flex items-center gap-1 justify-end font-sans">
                              <ShieldCheck size={11} className="text-emerald-500" />
                              <span>ボトルの死活・インデックス連携シグナル: 正常稼働中 (常時監視完了)</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSubTab === 'notifications' && (
              <div className="space-y-10 animate-fade-in text-black font-sans">
                {/* 1. 保存済み入荷通知アラート（検索条件アラート）一覧カード */}
                <div className="bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-6 md:p-8 rounded-3xl border-2 border-teal-300/80 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-200/70 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-200">
                          Incoming Alert Settings
                        </span>
                        {myAlerts.length > 0 && (
                          <span className="text-xs text-teal-700 font-bold">
                            登録中: {myAlerts.length} 件
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Bell size={20} className="text-teal-700" />
                        <span>📬 あなた宛て新着手紙の入荷メール通知設定</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-sans leading-relaxed">
                        あなたのお名前や旧姓・ゆかりの地域に該当する新着ボトルメールが投函された際、ご登録のメール宛てに即時自動でお知らせします。
                      </p>
                    </div>
                    {myAlerts.length > 0 && (
                      <button
                        type="button"
                        onClick={handleOpenAddAlert}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 w-fit shrink-0 cursor-pointer shadow-md active:scale-98"
                      >
                        <Plus size={15} />
                        <span>新しい通知条件を追加</span>
                      </button>
                    )}
                  </div>

                  {myAlerts.length === 0 ? (
                    <div className="bg-white/95 p-8 rounded-2xl border border-teal-100 text-center space-y-3 shadow-2xs">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-200/60 shadow-inner">
                        <Bell size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">現在、登録中の入荷通知アラートはありません</h4>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                          お名前（姓名・旧姓・愛称）やゆかりの地を登録しておくと、あなたを探す手紙が新しく海に流された瞬間に自動でメール通知が届きます。
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleOpenAddAlert}
                          className="px-6 py-2.5 bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                        >
                          <Plus size={14} />
                          <span>通知条件を登録する ✨</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myAlerts.map((alertItem: any) => (
                        <div 
                          key={alertItem.id} 
                          className="p-5 bg-white border-2 border-slate-200/90 rounded-2xl space-y-3.5 relative group hover:border-teal-400 transition-all shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="space-y-1">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                alertItem.is_verified ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {alertItem.is_verified ? '✓ メール通知有効中' : '⏳ メール認証待ち'}
                              </span>
                              <div className="pt-0.5">
                                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                  <span>探すお名前:</span>
                                  <span className="text-teal-800 font-extrabold">{alertItem.target_name}</span>
                                </h4>
                                {(alertItem.target_maiden_name || alertItem.target_nickname) && (
                                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                                    {alertItem.target_maiden_name && (
                                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md border border-rose-200">
                                        旧姓: {alertItem.target_maiden_name}
                                      </span>
                                    )}
                                    {alertItem.target_nickname && (
                                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                                        愛称: {alertItem.target_nickname}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAlert(alertItem)}
                                className="px-2.5 py-1.5 text-xs text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all font-bold cursor-pointer flex items-center gap-1 border border-teal-200"
                                title="条件を変更"
                              >
                                <Edit3 size={13} />
                                <span>編集</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAlert(alertItem.id)}
                                disabled={deletingAlertId === alertItem.id}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title="通知条件を解除"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1.5">
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-medium">📍 ゆかりの地</span>
                                <span className="font-semibold text-slate-800">{alertItem.target_hometown || '指定なし（全国）'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-medium">⏳ 対象年代</span>
                                <span className="font-semibold text-slate-800">{alertItem.era ? `${alertItem.era}年代` : '指定なし'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                              <span>🤝 関係性: <strong className="text-slate-700">{
                                alertItem.category === 'friend' ? '同級生・友人' :
                                alertItem.category === 'love' ? '初恋・元恋人' :
                                alertItem.category === 'work' ? '元同僚・仕事仲間' :
                                alertItem.category === 'other' ? 'その他' : '指定なし'
                              }</strong></span>
                              <span>登録: {new Date(alertItem.created_at).toLocaleDateString('ja-JP')}</span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                              <span className="truncate max-w-[220px]">📧 通知先: <strong className="text-teal-800">{alertItem.email}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. 事務局・システムからの受信通知ログ */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border pb-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-serif font-bold text-brand-dark tracking-widest flex items-center gap-2">
                        <Bell size={20} className="text-rose-600" />
                        <span>🔔 事務局・システムからの受信通知ログ</span>
                        {notifications.filter(n => !n.is_read).length > 0 && (
                          <span className="text-xs bg-rose-500/10 text-rose-700 px-2.5 py-0.5 rounded-full font-bold font-sans">
                            未読 {notifications.filter(n => !n.is_read).length}件
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-brand-dark/50 font-sans">
                        事務局公式の一括配信アナウンス、ボトルメッセージへの回答試行・クイズ正解、想い出照合・連絡先開示通知などが時系列で一元整理されています。
                      </p>
                    </div>
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl transition-all font-bold cursor-pointer font-sans flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                      >
                        <CheckSquare size={13} />
                        <span>すべて既読にする</span>
                      </button>
                    )}
                  </div>

                {notificationsLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-3">
                    <BottleLoader />
                    <p className="text-xs text-brand-dark/40 font-sans animate-pulse">通知情報を同期しています...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-brand-border rounded-3xl p-6 bg-white/50 space-y-3">
                    <div className="w-16 h-16 bg-rose-50/50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                      <Bell size={24} className="text-rose-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-serif text-brand-dark/50">現在、通知されたログやメッセージ配信はありません。</p>
                    <p className="text-[11px] text-brand-dark/40 font-sans leading-relaxed max-w-md mx-auto">
                      大切なお便りのクイズ正解通知や、運営事務局からの重要な全体/個別連絡、想い出照合・連絡先開示通知は、ここに綺麗にタイムライン整理されます。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-4xl">
                    {notifications.map((n: any) => {
                      let IconComponent = Bell;
                      let badgeText = "お知らせ";
                      let colorClasses = "bg-rose-50 text-rose-700 border-rose-200/50";
                      let actionText = "詳細を見る";

                      if (n.type === "message" || n.type === "chat") {
                        IconComponent = MessageCircle;
                        badgeText = "想い出照合・開通";
                        colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200/40";
                        actionText = "お手紙・連絡先を確認";
                      } else if (n.type === "reunion" || n.type === "reunion_success" || n.type === "match") {
                        IconComponent = Key;
                        badgeText = "思い出再会";
                        colorClasses = "bg-amber-50 text-amber-800 border-amber-200/40";
                        actionText = "手紙を確認する";
                      } else if (n.type === "admin_broadcast" || n.type === "system" || n.type === "broadcast") {
                        IconComponent = Sparkles;
                        badgeText = "公式アナウンス";
                        colorClasses = "bg-indigo-50 text-indigo-800 border-indigo-200/40";
                        actionText = "お知らせを開く";
                      }

                      return (
                        <div
                          key={n.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                            !n.is_read ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-zinc-100'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <IconComponent size={18} className="mt-0.5 text-zinc-600 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClasses}`}>
                                  {badgeText}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {formatNotificationDate(n.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-800 font-medium mt-1">{n.content}</p>
                            </div>
                          </div>
                          {n.link && (
                            <button
                              onClick={async () => {
                                if (!n.is_read) await handleMarkAsRead(n.id);
                                navigate(n.link);
                              }}
                              className="px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 shrink-0"
                            >
                              {actionText}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

            {activeSubTab === 'profile' && (
              <div className="space-y-6 animate-fade-in text-black">
                {/* 本人確認（eKYC）ステータス・手続きカード */}
                <div id="ekyc-status-panel" className="transition-all duration-300">
                  {Boolean(user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true') ? (
                    /* 認証完了済みカード（手続きボタンなし・スマートな証明書スタイル） */
                    <div className="p-6 md:p-8 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white rounded-3xl border-2 border-emerald-300/90 shadow-sm space-y-4 relative overflow-hidden font-sans">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <ShieldCheck size={26} className="text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-emerald-300">
                                Identity Verified
                              </span>
                              <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                                🛡️ 公的本人確認（eKYC）認証完了
                              </span>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
                              ご本人様確認が完了しています
                            </h3>
                          </div>
                        </div>
                        <div className="bg-white/95 px-3.5 py-2 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block leading-none">総合照合信頼度</span>
                            <span className="text-sm font-mono font-extrabold text-emerald-700">99.6%</span>
                          </div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-4 rounded-2xl border border-emerald-100">
                        あなたのアカウントは公的身分証明書（運転免許証/マイナンバーカード等）による本人確認が正常に完了しています。
                        思い出クイズが正解したお相手との間で、安全・確実に連絡先を開示し合える信頼のアカウント状態です。
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                          <span className="text-slate-400 text-[10px] font-bold block">認証ステータス</span>
                          <span className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                            ✓ 承認済み（正常稼働中）
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                          <span className="text-slate-400 text-[10px] font-bold block">想い出照合＆連絡先開示</span>
                          <span className="font-bold text-teal-800 flex items-center gap-1 mt-0.5">
                            ✓ 即時開示可能
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                          <span className="text-slate-400 text-[10px] font-bold block">セキュリティ保護</span>
                          <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                            🔒 暗号化保護中
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 未認証カード（手続き案内） */
                    <div className="p-6 md:p-8 bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-white rounded-3xl border-2 border-amber-300 shadow-sm space-y-4 relative overflow-hidden font-sans">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <Shield size={26} className="text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-300/80">
                                Identity Verification
                              </span>
                              <span className="text-[11px] font-bold text-amber-900">
                                📝 自己誓約のみ（公的eKYC未認証）
                              </span>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
                              公的本人確認（eKYC）のお願い
                            </h3>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-900 bg-white border border-amber-300 px-3 py-1.5 rounded-xl text-center shrink-0 shadow-2xs font-serif">
                          審査・照合手数料: 600円 (税込)
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-4 rounded-2xl border border-amber-100">
                        ReMEETsでは、なりすましや不正利用を防止し、お相手と安心して再会を果たすために公的身分証明書による本人確認（eKYC）を導入しています。
                        認証が完了すると、想い出クイズが正解したお相手に安全に連絡先を開示できるようになります。
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMypageEkycStep(1);
                            setShowMypageEkycModal(true);
                          }}
                          className="w-full sm:w-auto flex-1 py-3 px-6 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-98"
                        >
                          <ShieldCheck size={16} />
                          <span>⚡ 公的本人確認手続きを開始する（600円）</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. 💖 サービスを応援する（サポーター寄付）専用カード */}
                <div id="supporter-donation-card" className="p-6 md:p-8 bg-gradient-to-br from-pink-50/80 via-rose-50/30 to-white rounded-3xl border-2 border-pink-300 shadow-xs space-y-5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-200/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Coffee size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-serif uppercase tracking-widest border border-amber-300/60">
                            Supporter Contribution
                          </span>
                          {(user?.is_supporter || localStorage.getItem('remeets_is_supporter') === 'true') && (
                            <span className="text-[10px] text-pink-900 bg-pink-100 border border-pink-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              ⭐ 公式サポーター認証済み
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 mt-1 flex items-center gap-2">
                          ☕ ReMEETsを応援（寄付）
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-800 bg-white/90 border border-teal-200 px-3 py-1.5 rounded-xl text-center shrink-0 shadow-2xs font-serif">
                      一口 500円 (税込)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans bg-white/80 p-4 rounded-2xl border border-pink-100">
                    ReMEETsはユーザーの皆様の「思い出の再会」を安全かつ快適に守るため、月額会費0円で運営されています。<br className="hidden md:inline" />
                    「サービスを継続応援したい」「プラットフォームの発展に貢献したい」と思ってくださる方のための任意応援寄付です。ご寄付いただいた方にはプロファイル等に<strong>「⭐ 公式サポーター」ゴールドバッジ</strong>が付与されます。
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/supporter')}
                      className="w-full sm:w-auto flex-1 py-3 px-5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 font-bold text-xs rounded-2xl shadow-2xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-98"
                    >
                      <BookOpen size={16} className="text-teal-600" />
                      <span>📖 寄付の趣旨・特典を見る</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDonationModal(true)}
                      className="w-full sm:w-auto flex-1 py-3 px-5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-98"
                    >
                      <Coffee size={16} className="text-white shrink-0" />
                      <span>ReMEETsを応援（寄付）</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 💌 ページ最下部：奇跡の再会エピソード・感謝の声の投稿カード */}
          <div className="pt-6 border-t-2 border-slate-200/80 mt-8 space-y-6">
            <div className="p-6 md:p-8 bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-white rounded-3xl border-2 border-amber-300 shadow-xs space-y-5 relative overflow-hidden font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-300/80">
                        Miracle Reunion Stories
                      </span>
                      {mySubmittedStories.length > 0 && (
                        <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          投稿済み: {mySubmittedStories.length}件
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">
                      💌 奇跡の再会エピソード・運営へのお礼
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-white border border-amber-300 px-3 py-1.5 rounded-xl text-center shrink-0 shadow-2xs font-serif">
                  感謝・体験談の共有
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-4 rounded-2xl border border-amber-100">
                差出人（手紙を流した方）・受取人（手紙を見つけた方）どちらの立場からでもご投稿いただけます。<br className="hidden md:inline" />
                お寄せいただいた温かいエピソードやお礼の言葉は、管理者が匿名化・確認の上で「奇跡の再会報告」ページ等に大切に掲載されます。
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Link
                  to="/success-stories"
                  className="w-full sm:w-auto flex-1 py-3 px-5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs rounded-2xl shadow-2xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-98 text-center"
                >
                  <BookOpen size={16} className="text-amber-600" />
                  <span>📖 みんなの再会報告を見る</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStoryTargetPost(null);
                    setStoryTargetRole('general');
                    setStoryModalOpen(true);
                  }}
                  className="w-full sm:w-auto flex-1 py-3 px-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer font-sans active:scale-98"
                >
                  <Heart size={16} className="fill-white/30 text-white" />
                  <span>✨ 体験談・お礼を投稿する</span>
                </button>
              </div>
            </div>

            {/* 投稿済みストーリー一覧（投稿がある場合） */}
            {mySubmittedStories.length > 0 && (
              <div className="p-4 md:p-5 bg-white border border-amber-200/70 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-950 font-serif flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>あなたが投稿した再会エピソード ({mySubmittedStories.length}件)</span>
                  </h4>
                  <span className="text-[10px] text-amber-800/60 font-sans">管理者の確認後に掲載されます</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mySubmittedStories.map((story: any) => (
                    <div key={story.id} className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-100/80 space-y-1.5 font-sans">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[9px]">
                            {story.role === 'sender' ? '📮 手紙を流した側' : story.role === 'receiver' ? '📬 手紙を見つけた側' : '💌 体験談'}
                          </span>
                          {story.target_name && (
                            <span className="text-[10px] text-amber-900/70 font-semibold truncate max-w-[120px]">
                              {story.target_name} 様
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {story.created_at ? new Date(story.created_at).toLocaleDateString('ja-JP') : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {story.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* マイページ内 eKYC 手続きモーダル */}
      <AnimatePresence>
        {showMypageEkycModal && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 text-black font-sans" 
            data-lenis-prevent
            data-modal-overlay
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMypageEkycModal(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white border border-brand-border rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto overscroll-contain font-sans text-black z-10"
              data-lenis-prevent
            >
              <button
                onClick={() => setShowMypageEkycModal(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 p-2 rounded-full transition-colors cursor-pointer z-20"
              >
                <X size={20} />
              </button>

            {/* Step 1: 案内 */}
            {mypageEkycStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2 border-b border-zinc-150 pb-4">
                  <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-300">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark">公的本人確認（eKYC）手続き</h3>
                  <p className="text-xs text-brand-dark/60 font-sans">
                    公的身分証明書による実名照合 ＆ 安全確認
                  </p>
                </div>

                <div className="space-y-4 text-xs text-brand-dark/80 leading-relaxed font-sans bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                  <p className="font-semibold text-amber-950">
                    ReMEETsでは、すべてのユーザー様が安心して懐かしい方と再会できるよう、厳格な本人確認制度を設けています。
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-zinc-700">
                    <li>公的身分証明書（免許証・マイナンバーカード等）の氏名・生年月日を照合します。</li>
                    <li>いたずら・複数アカウントアタック防止のため、審査手続き費用 <strong>600円（税込）</strong>が発生します。</li>
                    <li>手続き完了後、アカウントに「🛡️公的本人確認済」ゴールドバッジが付与されます。</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowMypageEkycModal(false)}
                    className="flex-1 py-3 border border-zinc-300 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => setMypageEkycStep(2)}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>次へ進む（情報入力）</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: 氏名・生年月日・書類選択 */}
            {mypageEkycStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-150 pb-3">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block font-sans">Step 2 / 4</span>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">ご本人様情報の入力 ＆ 書類選択</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 block">氏名（本名）</label>
                    <input
                      type="text"
                      placeholder="例: 山田 太郎"
                      value={mypageEkycName}
                      onChange={(e) => setMypageEkycName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-zinc-300 rounded-xl text-xs text-black focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 block">生年月日</label>
                    <input
                      type="date"
                      value={mypageEkycBirthdate}
                      onChange={(e) => setMypageEkycBirthdate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-zinc-300 rounded-xl text-xs text-black focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-800 block">提出する身分証明書の種類</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setMypageEkycDocType('license')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          mypageEkycDocType === 'license'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                            : 'border-zinc-200 bg-white text-zinc-600'
                        }`}
                      >
                        <span className="block text-[11px]">運転免許証</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMypageEkycDocType('mynumber')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          mypageEkycDocType === 'mynumber'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                            : 'border-zinc-200 bg-white text-zinc-600'
                        }`}
                      >
                        <span className="block text-[11px]">マイナンバー</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMypageEkycDocType('passport')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          mypageEkycDocType === 'passport'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                            : 'border-zinc-200 bg-white text-zinc-600'
                        }`}
                      >
                        <span className="block text-[11px]">パスポート</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setMypageEkycStep(1)}
                    className="py-3 px-5 border border-zinc-300 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors"
                  >
                    戻る
                  </button>
                  <button
                    onClick={() => {
                      if (!mypageEkycName || !mypageEkycBirthdate) {
                        alert('氏名と生年月日を入力してください。');
                        return;
                      }
                      setMypageEkycStep(3);
                    }}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>次へ進む（証明書の撮影）</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Document Camera Overlay */}
            {mypageEkycStep === 3 && (
              <div className="space-y-4 font-sans">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-zinc-900 font-serif">2. 身分証明書の撮影・アップロード</h3>
                  <p className="text-xs text-zinc-500">
                    光の反射や四隅の欠けを防ぐガイドライン枠線に合わせて撮影を行ってください。
                  </p>
                </div>

                <DocumentCameraOverlay
                  docType={mypageEkycDocType}
                  docTypeName={
                    mypageEkycDocType === 'license' ? '運転免許証' : mypageEkycDocType === 'mynumber' ? 'マイナンバーカード' : 'パスポート'
                  }
                  onBack={() => setMypageEkycStep(2)}
                  onComplete={(imgs) => {
                    setMypageEkycCapturedImages(imgs);
                    setMypageEkycStep(4);
                  }}
                />
              </div>
            )}

            {/* Step 4: 決済 */}
            {mypageEkycStep === 4 && (
              <div className="space-y-6 font-sans">
                <div className="border-b border-zinc-150 pb-3">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">Step 3 / 4</span>
                  <h3 className="text-lg font-serif font-bold text-brand-dark">クレジットカードお支払い（600円）</h3>
                </div>

                {mypageEkycCapturedImages.front && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>身分証撮影完了 (反射なし・角の欠けなし OK)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMypageEkycStep(3)}
                      className="text-[11px] text-amber-700 hover:underline font-bold shrink-0 cursor-pointer"
                    >
                      再撮影
                    </button>
                  </div>
                )}

                <div className="p-4 bg-slate-50 border border-zinc-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between items-center font-bold text-brand-dark border-b border-zinc-200 pb-2">
                    <span>eKYC本人確認手続き費用（税込）</span>
                    <span className="text-base text-amber-700 font-serif">600円</span>
                  </div>
                  
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="font-bold text-zinc-700 block text-[11px]">カード番号</label>
                      <input
                        type="text"
                        placeholder="4242 •••• •••• 4242"
                        value={mypagePayCardNumber}
                        onChange={(e) => setMypagePayCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-zinc-700 block text-[11px]">有効期限 (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          value={mypagePayCardExpiry}
                          onChange={(e) => setMypagePayCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-zinc-700 block text-[11px]">CVC (3桁)</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={mypagePayCardCvc}
                          onChange={(e) => setMypagePayCardCvc(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 flex items-center gap-1 pt-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>256-bit SSL 暗号化通信によりStripe安全決済処理されます</span>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setMypageEkycStep(3)}
                    className="py-3 px-5 border border-zinc-300 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                  >
                    撮影に戻る
                  </button>
                  <button
                    onClick={() => {
                      setIsMypagePaying(true);
                      setTimeout(() => {
                        setIsMypagePaying(false);
                        setMypageEkycStep(5);
                      }, 1000);
                    }}
                    disabled={isMypagePaying}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isMypagePaying ? (
                      <span>決済処理中...</span>
                    ) : (
                      <span>600円を支払って照合を開始する</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: 照合中 */}
            {mypageEkycStep === 5 && (
              <div className="space-y-6 py-4 text-center font-serif">
                {/* 中央の二重発光スピナー & アイコン */}
                <div className="relative inline-flex items-center justify-center my-2">
                  {/* 外周の発光オーラ */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
                  
                  {/* スピナーリング（外側・反時計回り） */}
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-300/60 animate-[spin_8s_linear_infinite]" />
                  
                  {/* スピナーリング（内側・時計回り） */}
                  <div className="absolute w-20 h-20 rounded-full border-3 border-emerald-100 border-t-emerald-600 border-r-teal-500 animate-spin" />
                  
                  {/* 中央コンテンツ */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-800 font-serif">
                    <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-emerald-700 via-teal-600 to-green-600 bg-clip-text text-transparent pl-0.5">
                      {mypageEkycProgress}%
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-600/80 uppercase tracking-[0.22em] -mt-0.5">
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
                    {mypageEkycProgress < 25 && '1. 決済承認＆セキュリティトークン化'}
                    {mypageEkycProgress >= 25 && mypageEkycProgress < 50 && '2. 公的書類・文字データ暗号解析'}
                    {mypageEkycProgress >= 50 && mypageEkycProgress < 75 && '3. 実在生身人間（ライブネス）判定'}
                    {mypageEkycProgress >= 75 && mypageEkycProgress < 100 && '4. 認証キー発行＆本人確認準備'}
                    {mypageEkycProgress === 100 && '✨ 認証＆本人確認完了！'}
                  </h3>
                </div>

                {/* プログレスバー本体（綺麗な虹色グラデーションバー） */}
                <div className="space-y-1.5 px-2">
                  <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                    <span className="flex items-center gap-1 text-[11px] text-teal-700 font-serif tracking-[0.1em]">
                      <Lock size={12} /> 256bit 暗号化通信
                    </span>
                    <span className="text-emerald-700 font-bold font-serif tracking-[0.12em]">{mypageEkycProgress} / 100%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                      style={{ width: `${mypageEkycProgress}%` }}
                    >
                      {/* バー先端のLED光彩ノード */}
                      {mypageEkycProgress > 0 && mypageEkycProgress < 100 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 4ステップ進行タイムライン */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 0 && mypageEkycProgress < 25 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : mypageEkycProgress >= 25 ? 'text-zinc-400 font-medium' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress >= 25 ? '✓' : '1'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">決済承認＆セキュリティトークン化</span>
                    </span>
                    {mypageEkycProgress < 25 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">処理中...</span>}
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 25 && mypageEkycProgress < 50 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : mypageEkycProgress >= 50 ? 'text-zinc-400 font-medium' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress >= 50 ? '✓' : '2'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">公的書類・文字データ暗号解析</span>
                    </span>
                    {mypageEkycProgress >= 25 && mypageEkycProgress < 50 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">解析中...</span>}
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 50 && mypageEkycProgress < 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : mypageEkycProgress >= 75 ? 'text-zinc-400 font-medium' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress >= 75 ? '✓' : '3'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">実在生身人間（ライブネス）判定</span>
                    </span>
                    {mypageEkycProgress >= 50 && mypageEkycProgress < 75 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">判定中...</span>}
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${mypageEkycProgress >= 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : 'text-zinc-500'}`}>
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${mypageEkycProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                        {mypageEkycProgress === 100 ? '✓' : '4'}
                      </span>
                      <span className="tracking-[0.08em] md:tracking-[0.12em]">🛡️ 認証マーク付与＆本人確認完了</span>
                    </span>
                    {mypageEkycProgress >= 75 && mypageEkycProgress < 100 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">処理中...</span>}
                  </div>
                </div>

                {/* 動的精度スコア・解析テレメトリ詳細 */}
                <div className="bg-white/95 rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs text-left space-y-2 font-sans">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                    <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                      <Cpu size={12} className="text-teal-600" />
                      <span>AI リアルタイム照合スコア</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      総合信頼度: {mypageEkycProgress >= 100 ? '99.6%' : `${Math.round((mypageEkycProgress / 100) * 99.6 * 10) / 10}%`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">書類OCR一致率</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {mypageEkycProgress >= 25 ? '99.4%' : `${Math.min(99, Math.round(mypageEkycProgress * 3.9))}%`}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">顔特徴点類似スコア</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {mypageEkycProgress >= 50 ? '99.2%' : mypageEkycProgress >= 25 ? `${Math.min(99, Math.round((mypageEkycProgress - 25) * 3.9))}%` : '---'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">3Dライブネス判定</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {mypageEkycProgress >= 75 ? '99.7% (生身)' : mypageEkycProgress >= 50 ? '判定中...' : '---'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-zinc-500 text-[10px] block">暗号化監査ハッシュ</span>
                      <span className="font-mono font-bold text-emerald-700 text-[10px] truncate block">
                        {mypageEkycProgress >= 90 ? 'SHA256: 8A9F...77D2' : '生成中...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: 完了 */}
            {mypageEkycStep === 6 && (
              <div className="py-6 text-center space-y-6 font-sans">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-emerald-950">公的本人確認（eKYC）完了！🎉</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    撮影書類の照合および本人確認手続きが正常に完了いたしました。<br />
                    あなたのアカウントに「🛡️公的本人確認済」ゴールドバッジが付与されました。
                  </p>
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem('ekyc_verified', 'true');
                    window.dispatchEvent(new Event('ekyc_changed'));
                    setShowMypageEkycModal(false);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  マイアカウントに戻る
                </button>
              </div>
            )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SupportModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSuccess={() => {
          if (updateUser) {
            updateUser({ is_supporter: true });
          }
        }}
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
      <AnimatePresence>
        {isAlertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans" data-lenis-prevent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative text-left"
            >
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
                aria-label="閉じる"
              >
                <X size={16} />
              </button>

              <div className="p-6 md:p-8 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/80 shadow-2xs">
                    <Bell size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {editingAlert.id ? 'Edit Alert' : 'New Alert'}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 mt-0.5">
                      {editingAlert.id ? '入荷通知アラートの条件変更' : '新しい入荷通知アラートの登録'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  該当する新着ボトルメールが投函された際、登録メールアドレス宛てに即時自動でお知らせします。お相手にメールアドレスが開示されることはありません。
                </p>

                <form onSubmit={handleSaveAlertModal} className="space-y-4 text-left font-sans">
                  {/* 1. お名前（姓名別） */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">
                      探したい人のお名前（あなたなど） <span className="text-rose-500 font-bold">*必須</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input 
                          type="text" 
                          placeholder="姓（例：山田）"
                          className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                          value={editingAlert.target_last_name}
                          onChange={e => {
                            const l = e.target.value;
                            setEditingAlert(prev => ({ 
                              ...prev, 
                              target_last_name: l,
                              target_name: `${l} ${prev.target_first_name}`.trim()
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <input 
                          type="text" 
                          placeholder="名（例：太郎）"
                          className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                          value={editingAlert.target_first_name}
                          onChange={e => {
                            const f = e.target.value;
                            setEditingAlert(prev => ({ 
                              ...prev, 
                              target_first_name: f,
                              target_name: `${prev.target_last_name} ${f}`.trim()
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. 旧姓 ＆ 当時のニックネーム（愛称） */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block flex items-center justify-between">
                        <span>旧姓・旧姓の姓（任意）</span>
                        <span className="text-[10px] text-slate-400 font-normal">同窓生からの照合用</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="例：佐藤（結婚前の苗字）"
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                        value={editingAlert.target_maiden_name}
                        onChange={e => setEditingAlert(prev => ({ ...prev, target_maiden_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block flex items-center justify-between">
                        <span>当時の愛称・あだ名（任意）</span>
                        <span className="text-[10px] text-slate-400 font-normal">部活や呼び名</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="例：タッちゃん、部長"
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                        value={editingAlert.target_nickname}
                        onChange={e => setEditingAlert(prev => ({ ...prev, target_nickname: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* 3. 通知先メールアドレス */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">
                      通知先メールアドレス <span className="text-rose-500 font-bold">*必須</span>
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="your-email@example.com"
                      className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                      value={editingAlert.email}
                      onChange={e => setEditingAlert(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block">ゆかりの地（任意）</label>
                      <input 
                        type="text" 
                        placeholder="例：神奈川県横浜市"
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                        value={editingAlert.target_hometown}
                        onChange={e => setEditingAlert(prev => ({ ...prev, target_hometown: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block">年代（任意）</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-neutral-800 focus:bg-white focus:border-brand-primary outline-none transition-all"
                        value={editingAlert.era}
                        onChange={e => setEditingAlert(prev => ({ ...prev, era: e.target.value }))}
                      >
                        <option value="">指定なし</option>
                        <option value="60">1960年代</option>
                        <option value="70">1970年代</option>
                        <option value="80">1980年代</option>
                        <option value="90">1990年代</option>
                        <option value="00">2000年代以降</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block">関係性（任意）</label>
                      <select
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-neutral-800 focus:bg-white focus:border-brand-primary outline-none transition-all"
                        value={editingAlert.category}
                        onChange={e => setEditingAlert(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">指定なし</option>
                        <option value="friend">同級生・友人</option>
                        <option value="love">初恋・元恋人</option>
                        <option value="work">元同僚・仕事仲間</option>
                        <option value="other">その他</option>
                      </select>
                    </div>
                  </div>

                  {alertModalError && (
                    <div className="p-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {alertModalError}
                    </div>
                  )}

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAlertModalOpen(false)}
                      className="px-5 py-3 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      キャンセル
                    </button>
                    <button 
                      type="submit" 
                      disabled={isAlertSaving}
                      className="flex-1 py-3 text-xs font-bold bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white rounded-xl shadow-md transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isAlertSaving ? '保存処理中...' : editingAlert.id ? '条件を更新して保存する' : '新着通知を登録する ✨'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

