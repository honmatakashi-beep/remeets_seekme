import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight,
  ArrowUp, Award, BarChart2, Bell, BookOpen, Bot, Brain, Calendar, Camera, Check,
  CheckCircle, CheckCircle2, CheckSquare, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Clock, Code2, Coins, Copy, CreditCard, Database,
  DollarSign, Download, Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff,
  FileSpreadsheet, FileText, FileWarning, Filter, Flag, GitBranch, GitCommit, GitPullRequest, Globe, HardDrive, Heart,
  HelpCircle, Home, Image as ImageIcon, Inbox, Info, Key, Lock, LogIn,
  LogOut, Mail, MapPin, Menu, MessageCircle, MessageSquare, MoreVertical,
  Palette, PlusCircle, Presentation, Printer, Radio, RefreshCw, Rocket, RotateCcw,
  School, Search, Send, Server, Settings, Shield, ShieldAlert, ShieldCheck, Sparkles,
  Star, Tag, Terminal, Trash2, Unlock, Upload, User, User as UserIcon, UserCheck,
  Plus, TrendingUp, History, Users, Wifi, Wind, X, Zap, ArrowUpDown, UserX,
  FileCheck, ArrowUpRight, Cpu
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { samplePhrasesCategories } from '../AdminPhrases';
import { useAdminContacts } from './useAdminContacts';
import { useAdminVersions } from './useAdminVersions';
import { useAdminUsers } from './useAdminUsers';
import { useAdminPosts } from './useAdminPosts';
import { useAdminModeration } from './useAdminModeration';
import { useAdminAuditAndBroadcast } from './useAdminAuditAndBroadcast';

export const useAdminDashboardState = () => {
  const { user, token, logout, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAllowedAdminRole = Boolean(
    user && (
      ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'].includes(user?.role || '') ||
      user?.username === 'admin' ||
      (user?.role && user.role.toLowerCase().includes('admin'))
    )
  );

  // Core Data States
  const [stats, setStats] = useState<any>({
    summary: { totalUsers: 0, totalPosts: 0, totalReunions: 0, todayPosts: 0 },
    recentReunions: [],
    postsToday: [],
    dailyStats: [],
    eraStats: [],
    regionStats: [],
    pathStats: [],
    refererStats: [],
    searchStats: [],
    deviceStats: [],
    demographics: { ageDistribution: [], validAgeCount: 0, totalUsers: 0 }
  });
  const [users, setUsers] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [quizMatchingAnalytics, setQuizMatchingAnalytics] = useState<any>(null);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [ageVerificationLogs, setAgeVerificationLogs] = useState<any[]>([]);
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [realtimeTelemetry, setRealtimeTelemetry] = useState<any>(null);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);
  const [realtimeActiveUsers, setRealtimeActiveUsers] = useState<any[]>([]);

  // Design & Background Settings
  const [bgDarkness, setBgDarkness] = useState<number>(() => {
    const saved = localStorage.getItem('remeets_bg_darkness');
    return saved !== null ? Number(saved) : 0.40;
  });
  const [bgGlowOpacity, setBgGlowOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('remeets_bg_glow_opacity');
    return saved !== null ? Number(saved) : 0.85;
  });
  const [homeDesignMode, setHomeDesignMode] = useState<'v2' | 'v1' | 'sub2' | 'sub3'>(() => {
    return (localStorage.getItem('remeets_home_design_mode') as any) || 'v2';
  });

  const handleUpdateBgDarkness = (darknessVal: number) => {
    setBgDarkness(darknessVal);
    localStorage.setItem('remeets_bg_darkness', String(darknessVal));
    window.dispatchEvent(new CustomEvent('remeets_bg_contrast_changed', {
      detail: { darkness: darknessVal, glowOpacity: bgGlowOpacity }
    }));
  };

  const handleUpdateBgGlowOpacity = (glowVal: number) => {
    setBgGlowOpacity(glowVal);
    localStorage.setItem('remeets_bg_glow_opacity', String(glowVal));
    window.dispatchEvent(new CustomEvent('remeets_bg_contrast_changed', {
      detail: { darkness: bgDarkness, glowOpacity: glowVal }
    }));
  };

  const handleResetBgContrast = () => {
    setBgDarkness(0.40);
    setBgGlowOpacity(0.85);
    localStorage.setItem('remeets_bg_darkness', '0.40');
    localStorage.setItem('remeets_bg_glow_opacity', '0.85');
    window.dispatchEvent(new CustomEvent('remeets_bg_contrast_changed', {
      detail: { darkness: 0.40, glowOpacity: 0.85 }
    }));
  };

  const handleDesignChange = () => {
    window.dispatchEvent(new CustomEvent('remeets_design_system_changed'));
  };

  const handleToggleHomeDesignMode = (mode: 'v2' | 'v1' | 'sub2' | 'sub3') => {
    setHomeDesignMode(mode);
    localStorage.setItem('remeets_home_design_mode', mode);
    window.dispatchEvent(new CustomEvent('remeets_home_mode_changed', { detail: { mode } }));
  };

  // UI & Tab States
  const [activeTab, setActiveTab] = useState<'stats' | 'valuation' | 'quizAnalytics' | 'manual' | 'manualSections' | 'masterKnowledge' | 'broadcast' | 'emailTemplates' | 'moderation' | 'reports' | 'deletionRequests' | 'ageVerification' | 'posts' | 'users' | 'ngWords' | 'contacts' | 'versions' | 'successStories' | 'guide' | 'logs' | 'securityCenter' | 'systemCenter' | 'rbac' | 'designSystem' | 'monetization' | 'payments' | 'assetCleaner' | 'policeConsultation'>('stats');
  const [guideDocType, setGuideDocType] = useState<'deployment' | 'cost_estimate' | 'police_manual' | 'investor_deck' | 'google_eval'>('deployment');
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogGuideModal, setShowLogGuideModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Story Form State for Success Stories editing
  const [storyCategoryFilter, setStoryCategoryFilter] = useState<string>('all');
  const [storyPage, setStoryPage] = useState<number>(1);
  const [storyPerPage, setStoryPerPage] = useState<number>(10);
  const [editStoryForm, setEditStoryForm] = useState<{ title: string; message: string; era: string; gender: string; category: string }>({ 
    title: '', 
    message: '', 
    era: '', 
    gender: '男性', 
    category: 'classmate' 
  });

  // Age Verification Filters
  const [ageSearchTerm, setAgeSearchTerm] = useState('');
  const [ageTabFilter, setAgeTabFilter] = useState<'all' | 'ekyc' | 'self' | 'failed'>('all');
  const [agePage, setAgePage] = useState(1);
  const [agePerPage, setAgePerPage] = useState<number>(25);
  const [selectedAgeLogModal, setSelectedAgeLogModal] = useState<any>(null);
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);
  const [ageFilterStartDate, setAgeFilterStartDate] = useState('');
  const [ageFilterEndDate, setAgeFilterEndDate] = useState('');
  const [ageFilterStatus, setAgeFilterStatus] = useState<'all' | 'verified' | 'failed'>('all');
  const [ageFilterColumns, setAgeFilterColumns] = useState({
    id: true,
    user: true,
    method: true,
    status: true,
    ip: true,
    userAgent: true,
    date: true
  });

  // Sample phrases state
  const [activeSampleCategory, setActiveSampleCategory] = useState<string>('fullname');
  const [isSampleBookOpen, setIsSampleBookOpen] = useState<boolean>(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await onConfirm();
      }
    });
  };

  // Sub-hooks integration
  const adminContacts = useAdminContacts({ token, fetchData: async () => { await fetchData(); }, setStatusMsg });
  const adminVersions = useAdminVersions({ token, fetchData: async () => { await fetchData(); }, setStatusMsg, showConfirm });
  const adminModeration = useAdminModeration({ token, fetchData: async () => { await fetchData(); }, setStatusMsg, posts, setPosts, setLoading });
  const adminPosts = useAdminPosts({ 
    token, 
    posts, 
    setPosts, 
    setModerationQueue: adminModeration.setModerationQueue, 
    setDeletedPostsArchive: adminModeration.setDeletedPostsArchive, 
    fetchData: async () => { await fetchData(); }, 
    setStatusMsg, 
    showConfirm 
  });
  const adminUsers = useAdminUsers({ 
    token, 
    users, 
    setUsers, 
    currentUser: user, 
    updateUser, 
    fetchData: async () => { await fetchData(); }, 
    setStatusMsg, 
    showConfirm 
  });
  const adminAudit = useAdminAuditAndBroadcast({ 
    token, 
    fetchData: async () => { await fetchData(); }, 
    setStatusMsg, 
    setDbHealth, 
    showConfirm 
  });

  // Top-level handlers
  const handleDownloadMaReport = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const content = `# ReMEETs（再会のボトルメール） M&A企業価値・デューデリジェンスレポート
作成日: ${dateStr}
...`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReMEETs_MA_DueDiligence_Report_${dateStr}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: '📥 M&A評価・デューデリジェンス資料をダウンロードしました。' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDownloadDeploymentGuide = async (format: 'md' | 'txt' = 'md') => {
    try {
      const res = await fetch('/api/admin/deployment-guide/download?format=' + format, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `remeets_deployment_guide_${new Date().toISOString().slice(0, 10)}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setStatusMsg({ type: 'success', text: `🚀 本番デプロイ手順書（.${format}）をダウンロードしました。` });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ type: 'error', text: 'デプロイ手順書のダウンロードに失敗しました。' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: '通信エラーが発生しました。' });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Prevent background scroll bounce if needed
  };

  const handleToggleHomeStats = async () => {
    try {
      const res = await fetch('/api/admin/system/toggle-home-stats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg({ text: 'トップページの統計表示設定を切り替えました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizAnalyticsOnly = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/quiz-matching-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizMatchingAnalytics(data);
      }
    } catch (err) {
      console.error("Quiz analytics fetch error:", err);
    }
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [
        usersRes,
        broadcastsRes,
        postsRes,
        statsRes,
        actionLogsRes,
        accessLogsRes,
        reportsRes,
        deletionRequestsRes,
        ngWordsRes,
        contactsRes,
        successStoriesRes,
        moderationRes,
        deletedArchiveRes,
        dbVersionsRes,
        securityLogsRes,
        ageLogsRes,
        blockedIpsRes,
        quizAnalyticsRes
      ] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/broadcasts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/posts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/action-logs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/access-logs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/deletion-requests', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/contacts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/moderation-queue', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/deleted-posts-archive', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/versions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/security-logs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/age-verification-logs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/blocked-ips', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/quiz-matching-analytics', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (broadcastsRes.ok) setBroadcasts(await broadcastsRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
      if (statsRes && statsRes.ok) setStats(await statsRes.json());
      if (actionLogsRes.ok) setActionLogs(await actionLogsRes.json());
      if (accessLogsRes.ok) setAccessLogs(await accessLogsRes.json());
      if (reportsRes.ok) adminModeration.setReports(await reportsRes.json());
      if (deletionRequestsRes.ok) adminModeration.setDeletionRequests(await deletionRequestsRes.json());
      if (ngWordsRes.ok) adminModeration.setNgWords(await ngWordsRes.json());
      if (contactsRes.ok) adminContacts.setContacts(await contactsRes.json());
      if (successStoriesRes.ok) adminModeration.setSuccessStories(await successStoriesRes.json());
      if (moderationRes.ok) adminModeration.setModerationQueue(await moderationRes.json());
      if (deletedArchiveRes.ok) adminModeration.setDeletedPostsArchive(await deletedArchiveRes.json());
      if (dbVersionsRes.ok) adminVersions.setDbVersions(await dbVersionsRes.json());
      if (securityLogsRes.ok) setSecurityLogs(await securityLogsRes.json());
      if (ageLogsRes.ok) setAgeVerificationLogs(await ageLogsRes.json());
      if (blockedIpsRes.ok) setBlockedIps(await blockedIpsRes.json());
      if (quizAnalyticsRes.ok) setQuizMatchingAnalytics(await quizAnalyticsRes.json());

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Tab definitions
  const tabs = [
    { id: 'stats', label: '統計・分析', icon: BarChart2 },
    { id: 'valuation', label: '企業価値・MA', icon: DollarSign },
    { id: 'quizAnalytics', label: 'クイズ照合分析', icon: Brain },
    { id: 'policeConsultation', label: '警察・行政相談', icon: ShieldCheck },
    { id: 'moderation', label: 'AI安全検閲', icon: ShieldAlert, badge: adminModeration.moderationQueue.length },
    { id: 'reports', label: '通報対応', icon: Flag, badge: adminModeration.reports.filter(r => r.status === 'pending').length },
    { id: 'deletionRequests', label: '削除申請', icon: FileWarning, badge: adminModeration.deletionRequests.filter(r => r.status === 'pending').length },
    { id: 'contacts', label: 'お問い合わせ', icon: Mail, badge: adminContacts.contacts.filter(c => c.status === 'pending').length },
    { id: 'posts', label: 'ボトルメール一覧', icon: MessageSquare },
    { id: 'users', label: 'ユーザー管理', icon: Users },
    { id: 'ageVerification', label: '年齢・eKYC確認', icon: UserCheck },
    { id: 'ngWords', label: 'NGワード設定', icon: Shield },
    { id: 'successStories', label: '幸せな再会ストーリー', icon: Heart },
    { id: 'broadcast', label: '一括配信・通知', icon: Send },
    { id: 'emailTemplates', label: 'メール雛形管理', icon: Mail },
    { id: 'versions', label: 'データバージョン管理', icon: History },
    { id: 'guide', label: '本番デプロイガイド', icon: Rocket },
    { id: 'manualSections', label: '運営管理マニュアル', icon: BookOpen },
    { id: 'masterKnowledge', label: '仕様書・設計書', icon: Code2 },
    { id: 'logs', label: 'アクセス・監査ログ', icon: Activity },
    { id: 'securityCenter', label: 'セキュリティ統括', icon: Lock },
    { id: 'systemCenter', label: 'システム運用統括', icon: Server },
    { id: 'rbac', label: '権限・管理者設定', icon: Key },
    { id: 'designSystem', label: 'デザインシステム', icon: Palette },
    { id: 'monetization', label: '収益化シミュレータ', icon: Coins },
    { id: 'payments', label: '決済・Stripe管理', icon: CreditCard },
    { id: 'assetCleaner', label: '静的アセット整理', icon: Sparkles }
  ];

  return {
    isAllowedAdminRole,
    user,
    token,
    logout,
    updateUser,
    authLoading,
    navigate,
    users,
    setUsers,
    broadcasts,
    setBroadcasts,
    posts,
    setPosts,
    quizMatchingAnalytics,
    setQuizMatchingAnalytics,
    actionLogs,
    setActionLogs,
    accessLogs,
    setAccessLogs,
    securityLogs,
    setSecurityLogs,
    ageVerificationLogs,
    setAgeVerificationLogs,
    blockedIps,
    setBlockedIps,
    dbHealth,
    setDbHealth,
    realtimeTelemetry,
    setRealtimeTelemetry,
    isRefreshingTelemetry,
    setIsRefreshingTelemetry,
    realtimeActiveUsers,
    setRealtimeActiveUsers,
    bgDarkness,
    setBgDarkness,
    bgGlowOpacity,
    setBgGlowOpacity,
    homeDesignMode,
    setHomeDesignMode,
    handleUpdateBgDarkness,
    handleUpdateBgGlowOpacity,
    handleResetBgContrast,
    handleDesignChange,
    handleToggleHomeDesignMode,
    activeTab,
    setActiveTab,
    guideDocType,
    setGuideDocType,
    loading,
    setLoading,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showLogGuideModal,
    setShowLogGuideModal,
    statusMsg,
    setStatusMsg,
    storyCategoryFilter,
    setStoryCategoryFilter,
    storyPage,
    setStoryPage,
    storyPerPage,
    setStoryPerPage,
    editStoryForm,
    setEditStoryForm,
    ageSearchTerm,
    setAgeSearchTerm,
    ageTabFilter,
    setAgeTabFilter,
    agePage,
    setAgePage,
    agePerPage,
    setAgePerPage,
    selectedAgeLogModal,
    setSelectedAgeLogModal,
    isTelemetryExpanded,
    setIsTelemetryExpanded,
    ageFilterStartDate,
    setAgeFilterStartDate,
    ageFilterEndDate,
    setAgeFilterEndDate,
    ageFilterStatus,
    setAgeFilterStatus,
    ageFilterColumns,
    setAgeFilterColumns,
    activeSampleCategory,
    setActiveSampleCategory,
    isSampleBookOpen,
    setIsSampleBookOpen,
    confirmModal,
    setConfirmModal,
    showConfirm,
    tabs,
    handleDownloadMaReport,
    handleDownloadDeploymentGuide,
    handleTouchMove,
    handleToggleHomeStats,
    fetchQuizAnalyticsOnly,
    fetchData,
    stats,
    setStats,
    ...adminContacts,
    ...adminVersions,
    ...adminUsers,
    ...adminPosts,
    ...adminModeration,
    ...adminAudit
  };
};
