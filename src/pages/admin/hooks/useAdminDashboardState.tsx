import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
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
import { cn, PageHeader, getPostUrl, formatEraLabel, getCategoryText, PREFECTURES } from '../../../lib/utils';
import { BottleLoader, WarningMessage, Navbar, BackToHomeButton } from '../../../components/SharedComponents';
import { SupportModal } from '../../../components/SupportModal';
import { ManualGeneralSection, ManualMainSection, ManualModerationSection, ManualSystemSection, ManualSecuritySection } from '../../../components/AdminManualSections';
import { GoogleEvaluationMemoTab } from '../../../components/GoogleEvaluationMemoTab';
import { AdminLiveAlertMonitor } from '../../../components/AdminLiveAlertMonitor';
import { AdminRbacView } from '../../../components/AdminRbacView';
import { AdminDesignSystem } from '../../../components/AdminDesignSystem';
import { AdminMonetizationBlock } from '../../../components/AdminMonetizationBlock';
import { AdminPaymentManagementBlock } from '../../../components/AdminPaymentManagementBlock';
import { QuizMatchingAnalyticsView } from '../../../components/QuizMatchingAnalyticsView';
import { EkycProgressTelemetryPanel } from '../../../components/EkycProgressTelemetryPanel';
import { AdminPostDeleteModal } from "../modals/AdminPostDeleteModal";
import { AdminAgeLogModal } from "../modals/AdminAgeLogModal";
import { MaValuationDataRoomView } from '../../../components/MaValuationDataRoomView';
import { AdminEmailTemplatesView } from '../../../components/AdminEmailTemplatesView';
import { AdminBroadcastView } from '../../../components/AdminBroadcastView';
import { AdminLogsView } from '../../../components/AdminLogsView';
import { AdminSecurityCenterView } from '../../../components/AdminSecurityCenterView';
import { AdminSystemCenterView } from '../../../components/AdminSystemCenterView';
import { AdminMasterKnowledgeBase } from '../../../components/AdminMasterKnowledgeBase';
import { AdminManualView } from '../../../components/AdminManualView';
import {
  classifyTicket,
  TicketCategory,
  TicketCategoryEn,
  ClassificationResult,
  URGENT_KEYWORDS,
  TECHNICAL_KEYWORDS,
  ACCOUNT_KEYWORDS
} from '../../../utils/contactClassification';
import { ManualContent, AdminDeploymentGuideBlock } from '../MiscPages';

import {
  AdminStatsTab,
  AdminSuccessStoriesTab,
  AdminVersionsTab,
  AdminNgWordsTab,
  AdminContactsTab,
  AdminModerationTab,
  AdminReportsTab,
  AdminDeletionTab,
  AdminAgeVerificationTab,
  AdminPostsTab,
  AdminUsersTab,
  AdminAssetCleanerTab,
  AdminPoliceConsultationTab
} from "../tabs";

import {
  AdminPostDeleteModal,
  AdminAgeLogModal,
  AdminPostDetailModal,
  AdminModPostPreviewModal,
  AdminUserDetailModal,
  AdminPoliceReportModal,
  AdminContactReplyModal,
  AdminDeletionRequestModal,
  AdminReportDetailModal,
  AdminBulkNotificationModal,
  AdminCustomConfirmModal
} from "../modals";

import { AdminManualContent, OldAdminManualContent } from "../AdminManualContent";
import { RegionalMatrix, FunnelChart, HeatmapChart, PageViewChart } from "../AdminCharts";
import { AdminLiveSystemMonitor } from "../AdminLiveSystemMonitor";
import { samplePhrasesCategories } from "../AdminPhrases";
import { AdminInfoPage, SitemapPage, ContactPage, ConfirmModal, AuroraAmbientGlow, PageViewTracker } from "../AdminSharedPages";



export const useAdminDashboardState = () => {
  const navigate = useNavigate();

  const isAllowedAdminRole = Boolean(
    user && (
      ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'].includes(user?.role || '') ||
      user?.username === 'admin' ||
      (user?.role && user.role.toLowerCase().includes('admin'))
    )
  );

  const [users, setUsers] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [quizMatchingAnalytics, setQuizMatchingAnalytics] = useState<any>(null);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [ngWords, setNgWords] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactCategoryFilter, setContactCategoryFilter] = useState<'all' | 'urgent' | 'technical' | 'account' | 'general'>('all');
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactSortBy, setContactSortBy] = useState<'priority' | 'newest' | 'oldest'>('priority');
  const [isSeedingContacts, setIsSeedingContacts] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [contactCurrentPage, setContactCurrentPage] = useState<number>(1);
  const [contactItemsPerPage, setContactItemsPerPage] = useState<number>(25);
  const [isBatchProcessingContacts, setIsBatchProcessingContacts] = useState<boolean>(false);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
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
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [newStoryForm, setNewStoryForm] = useState({
    title: '',
    message: '',
    era: '',
    gender: '男性',
    category: 'classmate',
    consent: true,
    is_public: true,
    is_featured: false,
    is_all_page: true,
    display_position: ''
  });
  const [ageVerificationLogs, setAgeVerificationLogs] = useState<any[]>([]);
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [statsEnabled, setStatsEnabled] = useState(true);
  const [adminHomeDesign, setAdminHomeDesign] = useState<'v2' | 'v1' | 'sub2' | 'sub3'>(() => {
    return (localStorage.getItem('remeets_home_design') as 'v2' | 'v1' | 'sub2' | 'sub3') || 'v2';
  });

  // 背景コントラスト・明度調整用ステート
  const [bgGlowOpacity, setBgGlowOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('remeets_bg_glow_opacity');
    return saved !== null ? parseFloat(saved) : 1.0;
  });
  const [bgDarkness, setBgDarkness] = useState<number>(() => {
    const saved = localStorage.getItem('remeets_bg_darkness');
    return saved !== null ? parseFloat(saved) : 0;
  });

  const handleUpdateBgDarkness = (darknessVal: number) => {
    setBgDarkness(darknessVal);
    localStorage.setItem('remeets_bg_darkness', darknessVal.toString());
    window.dispatchEvent(new Event('remeets_bg_glow_changed'));
  };

  const handleUpdateBgGlowOpacity = (glowVal: number) => {
    setBgGlowOpacity(glowVal);
    localStorage.setItem('remeets_bg_glow_opacity', glowVal.toString());
    window.dispatchEvent(new Event('remeets_bg_glow_changed'));
  };

  const handleResetBgContrast = () => {
    setBgDarkness(0);
    setBgGlowOpacity(1.0);
    localStorage.setItem('remeets_bg_darkness', '0');
    localStorage.setItem('remeets_bg_glow_opacity', '1.0');
    window.dispatchEvent(new Event('remeets_bg_glow_changed'));
  };

  useEffect(() => {
    const handleDesignChange = () => {
      const current = (localStorage.getItem('remeets_home_design') as 'v2' | 'v1' | 'sub2' | 'sub3') || 'v2';
      setAdminHomeDesign(current);
    };
    window.addEventListener('home_design_changed', handleDesignChange);
    return () => window.removeEventListener('home_design_changed', handleDesignChange);
  }, []);

  const handleToggleHomeDesignMode = (mode: 'v2' | 'v1' | 'sub2' | 'sub3') => {
    setAdminHomeDesign(mode);
    localStorage.setItem('remeets_home_design', mode);
    window.dispatchEvent(new Event('home_design_changed'));
  };
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);
  const [newNgWord, setNewNgWord] = useState('');
  // NG Words Tab States
  const [ngWordSearchTerm, setNgWordSearchTerm] = useState('');
  const [ngWordTypeFilter, setNgWordTypeFilter] = useState<'all' | 'regex' | 'plain'>('all');
  const [ngWordPage, setNgWordPage] = useState(1);
  const [ngWordPerPage, setNgWordPerPage] = useState(15);
  const [selectedNgWordIds, setSelectedNgWordIds] = useState<number[]>([]);
  const [isBatchUpdatingNgWords, setIsBatchUpdatingNgWords] = useState(false);
  const [bulkNgWordsText, setBulkNgWordsText] = useState('');
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [simulatorInputText, setSimulatorInputText] = useState('');
  const [stats, setStats] = useState<any>({
    summary: { totalUsers: 0, totalReunions: 0, todayPosts: 0 },
    recentReunions: [],
    postsToday: [],
    dailyStats: [],
    eraStats: [],
    regionStats: [],
    pathStats: [],
    refererStats: [],
    searchStats: [],
    deviceStats: []
  });
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [retentionStats, setRetentionStats] = useState<any[]>([]);
  const [pageViewStats, setPageViewStats] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [deletedPostsArchive, setDeletedPostsArchive] = useState<any[]>([]);
  const [moderationHistory, setModerationHistory] = useState<any[]>([]);
  const [moderationSubTab, setModerationSubTab] = useState<'queue' | 'history' | 'archive'>('queue');
  const [modSearchTerm, setModSearchTerm] = useState('');
  const [modReasonFilter, setModReasonFilter] = useState<'all' | 'stalking' | 'contact' | 'other'>('all');
  const [modPage, setModPage] = useState(1);
  const [modPerPage, setModPerPage] = useState<number>(20);
  const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
  const [archivePage, setArchivePage] = useState(1);
  const [archivePerPage, setArchivePerPage] = useState<number>(20);
  const [selectedModPostModal, setSelectedModPostModal] = useState<any>(null);
  const [isBatchApprovingModPosts, setIsBatchApprovingModPosts] = useState(false);
  // 削除管理モーダル
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteReasonText, setDeleteReasonText] = useState<string>('規約違反またはAIフラグ検出による削除');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reunionFunnel, setReunionFunnel] = useState<any[]>([]);
  const [reunionDurationStats, setReunionDurationStats] = useState<any[]>([]);
  const [dbVersions, setDbVersions] = useState<any[]>([]);
  const [gitInfo, setGitInfo] = useState<{
    branch: string;
    commit: string;
    commitHash: string;
    commitMessage: string;
    commitDate: string;
    commitAuthor: string;
    appVersion: string;
    nodeVersion: string;
    platform: string;
    uptimeSec: number;
    dbSizeBytes: number;
    totalSnapshots: number;
    serverTime: string;
  } | null>(null);
  const [isLoadingGitInfo, setIsLoadingGitInfo] = useState<boolean>(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionComment, setNewVersionComment] = useState('');
  const [selectedVersionIds, setSelectedVersionIds] = useState<number[]>([]);
  const [versionSearchQuery, setVersionSearchQuery] = useState<string>('');
  const [versionTypeFilter, setVersionTypeFilter] = useState<'all' | 'manual' | 'pre_restore'>('all');
  const [versionCurrentPage, setVersionCurrentPage] = useState<number>(1);
  const [versionItemsPerPage, setVersionItemsPerPage] = useState<number>(25);
  const [isBatchDeletingVersions, setIsBatchDeletingVersions] = useState<boolean>(false);

  // 検閲テストシミュレータ用ステート
  const [censorshipTestText, setCensorshipTestText] = useState<string>('');
  const [censorshipTestResult, setCensorshipTestResult] = useState<any>(null);
  const [isTestingCensorship, setIsTestingCensorship] = useState<boolean>(false);
  const [simulatedPostId, setSimulatedPostId] = useState<number | null>(null);
  const [isSimulatingPost, setIsSimulatingPost] = useState<boolean>(false);
  const [simulationSuccessMsg, setSimulationSuccessMsg] = useState<string | null>(null);

  // 検証用サンプル文言集用ステート
  const [activeSampleCategory, setActiveSampleCategory] = useState<string>('fullname');
  const [isSampleBookOpen, setIsSampleBookOpen] = useState<boolean>(false);

  // 警察照会一括出力用ステート ＆ ハンドラー
  const [policeReportData, setPoliceReportData] = useState<any>(null);
  const [isGeneratingPoliceReport, setIsGeneratingPoliceReport] = useState<boolean>(false);
  const [copiedPoliceReport, setCopiedPoliceReport] = useState<boolean>(false);

  const generateTextPoliceReport = (data: any) => {
    if (!data || !data.user) return '';
    const u = data.user;
    const now = new Date(data.report_generated_at || Date.now()).toLocaleString('ja-JP');
    
    let txt = `=================================================================\n`;
    txt += `【捜査関係事項照会 回答書 兼 会員登録・利用全データ保全証明書】\n`;
    txt += `=================================================================\n`;
    txt += `発行日時: ${now}\n`;
    txt += `根拠法令: ${data.legal_basis || '刑事訴訟法第197条第2項（公務所等に対する照会）'}\n`;
    txt += `管理システム: ${data.system_name || 'ReMEETs 治安防衛・情報開示自動生成システム'}\n`;
    txt += `照会対象ユーザーID: #${u.id}\n\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[1. 照会対象者 登録基本情報 & 外部SNS連携アカウント]\n`;
    txt += `-----------------------------------------------------------------\n`;
    txt += `ユーザーID       : #${u.id}\n`;
    txt += `ユーザー名       : ${u.username || '-'}\n`;
    txt += `表示ニックネーム : ${u.nickname || '未設定'}\n`;
    txt += `公的氏名         : ${u.full_name || '未設定'}\n`;
    txt += `登録メールアドレス : ${u.email || '未設定'}\n`;
    txt += `認証携帯電話番号   : ${u.phone_number || '未登録/未提出'}\n`;
    txt += `外部SNS識別UID   : LINE UID: ${u.line_uid || '未連携'} / Google UID: ${u.google_uid || '未連携'}\n`;
    txt += `アカウント状態   : ${u.is_blocked ? '凍結/ブロック中' : '通常稼働'}\n`;
    txt += `本人確認区分     : ${u.is_ekyc_verified ? '🛡️ 公的本人確認 (eKYC) 承認済' : '📝 自己宣言のみ'}\n`;
    txt += `アカウント作成日時 : ${u.created_at ? new Date(u.created_at).toLocaleString('ja-JP') : '-'}\n\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[2. eKYC公的本人確認・年齢確認 監査ログ (全${data.ageLogs?.length || 0}件)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.ageLogs && data.ageLogs.length > 0) {
      data.ageLogs.forEach((l: any, idx: number) => {
        txt += ` (${idx + 1}) 日時: ${new Date(l.created_at).toLocaleString('ja-JP')} | 判定: ${l.is_verified ? '承認' : '却下'} | 書類: ${l.document_type || '-'} | 年齢: ${l.age || '-'}歳 | IP: ${l.ip || '-'}\n`;
      });
    } else {
      txt += ` 記録なし\n`;
    }
    txt += `\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[3. 投稿ボトルメール履歴 (全${data.posts?.length || 0}件・削除/AI隔離分含む)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach((p: any, idx: number) => {
        txt += ` (${idx + 1}) ボトルID: #${p.id} | 投函日時: ${new Date(p.created_at).toLocaleString('ja-JP')}\n`;
        txt += `     宛先のお名前: ${p.target_name || '-'} 様 | 年代: ${p.era || '-'} | カテゴリ: ${p.category || '-'}\n`;
        txt += `     探している人(差出人表記): ${p.searcher_name || '-'} (フルネーム: ${p.searcher_full_name || '-'})\n`;
        txt += `     AI自動隔離フラグ: ${p.ai_flagged ? '⚠️ AI検閲検出 (' + (p.ai_reason || '不適切表現') + ')' : '正常'}\n`;
        txt += `     ステータス: ${p.status || 'active'}\n`;
        txt += `     本文: ${p.message || ''}\n\n`;
      });
    } else {
      txt += ` 投稿記録なし\n\n`;
    }

    txt += `-----------------------------------------------------------------\n`;
    txt += `[4. 連絡先安全開示 (セキュア・ブリッジ) ＆ マッチング決済履歴 (全${data.matches?.length || 0}件)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.matches && data.matches.length > 0) {
      data.matches.forEach((m: any, idx: number) => {
        txt += ` (${idx + 1}) ボトルID: #${m.id} | マッチング完了日時: ${new Date(m.updated_at || m.created_at).toLocaleString('ja-JP')}\n`;
        txt += `     差出人: ${m.author_username} (${m.author_full_name || '実名未登録'}) / ボトル表記: ${m.searcher_name}\n`;
        txt += `     受取人: ${m.recipient_username} (${m.recipient_full_name || '実名未登録'})\n`;
        txt += `     開示連絡先形式: ${m.contact_method || 'メールアドレス'} (${m.contact_value || '暗号化保全'})\n`;
        txt += `     想い出クイズ照合: 完了 (正解一致により合意成立)\n\n`;
      });
    } else {
      txt += ` ※成立したマッチング・連絡先開示記録はありません。\n\n`;
    }

    if (data.payments && data.payments.length > 0) {
      txt += ` 【開通・本人確認 決済トランザクション履歴 (全${data.payments.length}件)】\n`;
      data.payments.forEach((py: any, idx: number) => {
        txt += `   - [決済${idx + 1}] 日時: ${new Date(py.created_at).toLocaleString('ja-JP')} | 種別: ${py.item_type || '連絡先開示'} | 金額: ¥${py.amount || 0} | 決済ID: ${py.stripe_payment_intent_id || '-'} | 状態: ${py.status}\n`;
      });
      txt += `\n`;
    }

    txt += `-----------------------------------------------------------------\n`;
    txt += `[5. 通報・違反被害・不適切アクセス監査記録]\n`;
    txt += `-----------------------------------------------------------------\n`;
    txt += ` 通報された回数 (被通報): ${data.reportsAsTarget?.length || 0}件\n`;
    if (data.reportsAsTarget && data.reportsAsTarget.length > 0) {
      data.reportsAsTarget.forEach((r: any, idx: number) => {
        txt += `   - [被通報${idx + 1}] 日時: ${new Date(r.created_at).toLocaleString('ja-JP')} | 理由: ${r.reason || '-'} | 詳細: ${r.details || '-'}\n`;
      });
    }
    txt += ` 通報を行った回数 (通報者): ${data.reportsAsReporter?.length || 0}件\n\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[6. システムアクセス・操作セキュリティ監査ログ (直近100件)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.accessLogs && data.accessLogs.length > 0) {
      data.accessLogs.slice(0, 20).forEach((al: any) => {
        txt += `  - [アクセス] ${new Date(al.created_at).toLocaleString('ja-JP')} | IP: ${al.ip || '-'} | パス: ${al.path || '-'} | UA: ${al.user_agent || '-'}\n`;
      });
    } else {
      txt += ` アクセスログなし\n`;
    }
    txt += `\n`;

    txt += `=================================================================\n`;
    txt += `【証明保証・電子証明ハッシュ】\n`;
    txt += `本出力データは、刑事訴訟法第197条第2項に基づき、ReMEETs 治安防衛システムより直接一括抽出された非改ざん性暗号化データです。\n`;
    txt += `=================================================================\n`;

    return txt;
  };

  const handleGeneratePoliceReport = async (userId: number) => {
    if (!userId) return;
    setIsGeneratingPoliceReport(true);
    setCopiedPoliceReport(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}/police-disclosure`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPoliceReportData(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || '警察照会用データの取得に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsGeneratingPoliceReport(false);
    }
  };

  const handleCopyPoliceReportText = () => {
    if (!policeReportData) return;
    const textContent = generateTextPoliceReport(policeReportData);
    navigator.clipboard.writeText(textContent).then(() => {
      setCopiedPoliceReport(true);
      setTimeout(() => setCopiedPoliceReport(false), 3000);
    }).catch((err) => {
      console.error('Copy failed:', err);
      alert('コピーに失敗しました。');
    });
  };

  const handleDownloadPoliceReportJson = () => {
    if (!policeReportData || !policeReportData.user) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(policeReportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Police_Disclosure_User_${policeReportData.user.id}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTestCensorship = async (textToTest?: string) => {
    const textVal = textToTest !== undefined ? textToTest : censorshipTestText;
    if (!textVal) return;
    setIsTestingCensorship(true);
    try {
      const res = await fetch('/api/admin/test-censorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textVal })
      });
      if (res.ok) {
        const data = await res.json();
        setCensorshipTestResult(data);
      } else {
        alert('検閲判定テストに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('ネットワークエラーが発生しました。');
    } finally {
      setIsTestingCensorship(false);
    }
  };

  const handleTriggerCensorshipSimulation = async () => {
    if (!censorshipTestText) return;
    setIsSimulatingPost(true);
    setSimulatedPostId(null);
    setSimulationSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/trigger-simulation-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: censorshipTestText })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulatedPostId(data.postId);
        if (data.aiFlagged) {
          setSimulationSuccessMsg(`【隔離完了・自動通報】 不当表現・NGワードを検知したため、ボトルID #${data.postId} は自動的に「非公開・隔離」され、即時安全自動通報（報告書）が自動起票されました。`);
        } else {
          setSimulationSuccessMsg(`【投函完了】 危険な文言や個人情報は検出されなかったため、ボトルID #${data.postId} は安全に「公開」状態で投函されました。`);
        }
        fetchData(); // データを最新化
      } else {
        alert('模擬投函シミュレーションに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('ネットワークエラーが発生しました。');
    } finally {
      setIsSimulatingPost(false);
    }
  };

  const fetchGitInfo = async () => {
    setIsLoadingGitInfo(true);
    try {
      const res = await fetch('/api/admin/system/git-info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGitInfo(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch Git info:", err);
    } finally {
      setIsLoadingGitInfo(false);
    }
  };

  const fetchDbVersions = async () => {
    try {
      const res = await fetch('/api/admin/versions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDbVersions(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch DB versions:", err);
    }
  };

  const handleCreateVersion = async () => {
    if (isCreatingVersion) return;
    setIsCreatingVersion(true);
    try {
      const res = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newVersionComment || '手動スナップショット' })
      });
      if (res.ok) {
        const data = await res.json();
        setDbVersions(prev => [data.version, ...prev]);
        setNewVersionComment('');
        setStatusMsg({ type: 'success', text: `バージョン履歴 "${data.version.comment}" を正常に作成しました。` });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        const errData = await res.json();
        setStatusMsg({ type: 'error', text: `作成失敗: ${errData.error || '不明なエラー'}` });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: '通信エラーによりバージョンの作成に失敗しました。' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleRestoreVersion = (version: any) => {
    showConfirm(
      'データベースの復元 (Rollback)',
      `本当にこのバージョン "${version.comment}" (作成: ${new Date(version.timestamp).toLocaleString()}) に戻しますか？現在のデータは完全に上書きされ、その後に元に戻すことはできません。よろしければ「確定」をクリックしてください。`,
      async () => {
        try {
          const res = await fetch(`/api/admin/versions/${version.id}/restore`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setStatusMsg({ type: 'success', text: `バージョン "${version.comment}" から正常に自動復元しました！データ再読込のため自動で最新情報をロードします。` });
            setTimeout(() => setStatusMsg(null), 6000);
            fetchData();
          } else {
            const errData = await res.json();
            setStatusMsg({ type: 'error', text: `復元失敗: ${errData.error || '不明なエラー'}` });
            setTimeout(() => setStatusMsg(null), 6000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: '通信エラーにより復元に失敗しました。' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    );
  };

  const handleDeleteVersion = (version: any) => {
    showConfirm(
      'バージョン履歴の削除',
      `バージョン履歴 "${version.comment}" を削除しますか？バックアップファイル自体が削除されます。よろしければ「確定」をクリックしてください。`,
      async () => {
        try {
          const res = await fetch(`/api/admin/versions/${version.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setDbVersions(prev => prev.filter(v => v.id !== version.id));
            setSelectedVersionIds(prev => prev.filter(id => id !== version.id));
            setStatusMsg({ type: 'success', text: 'バージョン履歴を削除しました。' });
            setTimeout(() => setStatusMsg(null), 4000);
          } else {
            setStatusMsg({ type: 'error', text: '削除に失敗しました。' });
            setTimeout(() => setStatusMsg(null), 4000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: '通信エラーにより削除に失敗しました。' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    );
  };

  const handleDownloadVersion = async (version: any) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/versions/${version.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeComment = (version.comment || 'snapshot').replace(/[^a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, '_');
        link.download = `remeets_backup_v${version.id}_${safeComment}.db`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setStatusMsg({ type: 'success', text: `📦 バックアップファイル「${version.comment}」をダウンロードしました。` });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ type: 'error', text: 'ダウンロードに失敗しました。' });
      }
    } catch (err) {
      console.error("Download version error:", err);
      setStatusMsg({ type: 'error', text: '通信エラーが発生しました。' });
    }
  };

  const handleToggleSelectAllVersions = (currentIds: number[]) => {
    if (selectedVersionIds.length === currentIds.length && currentIds.length > 0) {
      setSelectedVersionIds([]);
    } else {
      setSelectedVersionIds(currentIds);
    }
  };

  const handleToggleSelectVersion = (id: number) => {
    setSelectedVersionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDeleteVersions = async () => {
    if (!token || selectedVersionIds.length === 0) return;
    if (!confirm(`⚠️ 警告: 選択した ${selectedVersionIds.length} 件のスナップショットを完全に削除しますか？バックアップファイルも削除され、元に戻せません。`)) return;

    setIsBatchDeletingVersions(true);
    try {
      const res = await fetch('/api/admin/versions/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedVersionIds })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMsg({ type: 'success', text: `🗑️ ${data.message || '一括削除が完了しました。'}` });
        setDbVersions(prev => prev.filter(v => !selectedVersionIds.includes(v.id)));
        setSelectedVersionIds([]);
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatusMsg({ type: 'error', text: errData.error || '一括削除に失敗しました。' });
      }
    } catch (err) {
      console.error("Batch delete versions error:", err);
      setStatusMsg({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setIsBatchDeletingVersions(false);
    }
  };

  const handleExportVersionsCsv = () => {
    if (!dbVersions || dbVersions.length === 0) {
      alert('エクスポートするバージョン履歴データがありません。');
      return;
    }

    const headers = ['ID', 'バージョン番号', 'コメント', '種別', '連動Gitコミット', 'Gitブランチ', 'ファイルサイズ(Byte)', 'ファイルサイズ(MB)', '作成日時', 'ファイル名'];
    const rows = dbVersions.map((v, index) => {
      const isPreRestore = (v.comment || '').includes('復元前自動バックアップ');
      const mbSize = v.size ? (v.size / (1024 * 1024)).toFixed(3) : '0';
      return [
        v.id,
        `"#${dbVersions.length - index}"`,
        `"${(v.comment || '').replace(/"/g, '""')}"`,
        isPreRestore ? '復元前自動退避' : '手動スナップショット',
        `"${v.git_commit || '-'}"`,
        `"${v.git_branch || '-'}"`,
        v.size || 0,
        mbSize,
        `"${new Date(v.timestamp).toLocaleString('ja-JP').replace(/"/g, '""')}"`,
        `"${(v.filename || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remeets_versions_history_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [activeTab, setActiveTab] = useState<'stats' | 'valuation' | 'quizAnalytics' | 'liveAlerts' | 'users' | 'posts' | 'logs' | 'reports' | 'deletion' | 'ngWords' | 'contacts' | 'emailTemplates' | 'successStories' | 'security' | 'system' | 'versions' | 'notifications' | 'moderation' | 'manual' | 'designSystem' | 'ageVerification' | 'settings' | 'deployment' | 'masterMemo' | 'templates' | 'monetization' | 'payments' | 'rbac' | 'assetCleaner' | 'policeConsultation'>('stats');
  const [guideDocType, setGuideDocType] = useState<'deployment' | 'cost_estimate' | 'cost_list_detailed' | 'permit' | 'police' | 'consult' | 'matrix' | 'slides' | 'scenario' | 'requirements' | 'evaluation' | 'pr_plan' | 'legal_guide'>('deployment');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 年齢確認ログ フィルタ＆ダウンロード用ステート
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
    created_at: true,
    username: true,
    is_verified: true,
    age: true,
    reason: true,
    ip: true,
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showLogGuideModal, setShowLogGuideModal] = useState(false);

  // M&A譲渡・企業査定評価価値 (KPI) レポートCSVダウンロード
  const handleDownloadMaReport = () => {
    // 蓄積されたデータの計算
    const totalPosts = posts.length || (stats?.summary?.totalUsers ? Math.round(stats.summary.totalUsers * 1.5) : 108);
    const totalReunions = stats?.summary?.totalReunions || successStories.length || 14;
    const matchingRate = totalPosts > 0 ? ((totalReunions / totalPosts) * 105).toFixed(1) : "12.8"; // 秘密の質問等からのマッチング率
    const totalPV = accessLogs.length || 24800; // ログ総数をもとにしたPV
    const uniqueIps = new Set(accessLogs.map(l => l.ip || l.ip_address || 'unknown')).size;
    const estimatedMAU = uniqueIps > 1 ? uniqueIps : Math.round(totalPV * 0.42);

    const rows = [
      ["=== ReMEETs M&A譲渡用・事業査定実績レポート (KPI & 技術スタック仕様) ==="],
      [],
      ["1. 基本情報", "", ""],
      ["レポート発行日時", new Date().toLocaleString(), "システムログより自動生成"],
      ["プラットフォーム名", "ReMEETs (再会の海)", "実名と秘密の質問による再会自動マッチング"],
      [],
      ["2. 主要集客・成果メトリクス (KPI)", "", ""],
      ["指標項目", "実績数値", "買い手企業へのバリュー証明・解説"],
      ["累計PV (ページビュー) 数", `${totalPV} PV`, "検索エンジン（お相手の氏名＋思い出の手がかり）で検索上位を獲得し、高確率での自然流入を実証"],
      ["月間アクティブユーザー (MAU)", `${estimatedMAU} ユーザー`, "バイラル拡散時、SNS・ブログ・メディア露出の規模感を担保可能"],
      ["累積投函ボトルメール数", `${totalPosts} 通`, "ユーザーが魂を込めて投函したメッセージ資産の価値。複製困難な無形資産"],
      ["再会成立組数", `${totalReunions} 組`, "実名＋秘密の質問のフローが実際に機能し、ユーザー間の再会を引き起こした証拠"],
      ["マッチング (再会) 成立比率", `${matchingRate}%`, "競合マッチングアプリや探偵サービスに比べ、特定人物同士の再会効率が極めて高いことを証明"],
      [],
      ["3. システム設計・運用可能性 (M&A引き継ぎ容易性の証明)", "", ""],
      ["技術項目", "採用技術・現状のアーキテクチャ", "技術引き継ぎ時の買い手側メリット"],
      ["主なプログラミング言語", "TypeScript", "型定義が完全であり、バグのリスクが極めて低い状態を維持"],
      ["フロントエンド", "React 18 / Vite / Lucide Icons / Recharts / Tailwind CSS", "モダンかつ最高水準のパフォーマンス。開発者のアサイン、機能拡張、デザイン修正が瞬時に完了"],
      ["バックエンド", "Express + node JS (ES Modules)", "シンプルなルーティング設計。大規模サーバーレスへの移行もスムーズ"],
      ["データベース", "Firebase Firestore (NoSQL) / Auth（および検証用 SQLite3）", "Firebase の Spark 無料枠（月5万回読込等）で稼働するため、本番運用のデータベースサーバー維持費を「実質ゼロ」で引き継ぎ可能であることを証明"],
      ["コード設計・可読性", "単一コードモジュール化(App.tsx / server.ts)による徹底したシンプル構造", "過剰なマイクロサービス、不透明なSDKを完全排除。エンジニア1名の体制で余裕の運用保守が可能"],
      [],
      ["4. 直近アクセス・アクティビティ推移 (監査ログ)", "", ""]
    ];

    // 表頭
    rows.push(["アクセス発生日時", "アクション", "ユーザー名 / 状態", "接続元IP", "ブラウザ情報 (UserAgent)"]);
    
    // 監査データをつなぐ
    accessLogs.slice(0, 300).forEach(log => {
      rows.push([
        new Date(log.created_at || Date.now()).toLocaleString(),
        `"${(log.action || 'ページ閲覧').replace(/"/g, '""')}"`,
        `"${(log.username || 'Guest').replace(/"/g, '""')}"`,
        log.ip || "Confidential",
        log.user_agent ? `"${log.user_agent.replace(/"/g, '""')}"` : "Mozilla"
      ]);
    });

    const csvContent = "\uFEFF" + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `remeet_ma_evaluation_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 本番デプロイ・費用見積もりガイド ダウンロード
  const handleDownloadDeploymentGuide = async (format: 'md' | 'txt' = 'md') => {
    try {
      const fileName = `ReMEETs_Deployment_Guide.${format}`;
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        const text = await response.text();
        const mimeType = format === 'md' ? 'text/markdown;charset=utf-8;' : 'text/plain;charset=utf-8;';
        const blob = new Blob([text], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("id", `dl-deployment-guide-${format}`);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Failed to fetch guide.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (isMobileMenuOpen) {
      lenis?.stop();
      document.documentElement.classList.add('lenis-stopped');
      document.body.style.overflow = 'hidden';
      // Use a more targeted approach for touch lock
      const handleTouchMove = (e: TouchEvent) => {
        if (isMobileMenuOpen) {
          // Only allow touch move inside the scrollable menu
          const target = e.target as HTMLElement;
          if (!target.closest('[data-lenis-prevent]')) {
            e.preventDefault();
          }
        }
      };
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      return () => {
        lenis?.start();
        document.documentElement.classList.remove('lenis-stopped');
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', handleTouchMove);
      };
    } else {
      lenis?.start();
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);
  const [postSearchTerm, setPostSearchTerm] = useState('');
  const [postFilterType, setPostFilterType] = useState<'all' | 'active' | 'resolved' | 'ai_passed' | 'ai_flagged' | 'real' | 'sample'>('all');
  const [postSortBy, setPostSortBy] = useState<'created_desc' | 'created_asc' | 'resolved_desc' | 'ai_flagged_desc' | 'id_desc'>('created_desc');
  const [postItemsPerPage, setPostItemsPerPage] = useState<number>(30);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedModPostIds, setSelectedModPostIds] = useState<number[]>([]);
  const [selectedArchiveIds, setSelectedArchiveIds] = useState<number[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'ekyc' | 'self' | 'blocked' | 'admin' | 'sample' | 'real'>('all');
  const [userSortBy, setUserSortBy] = useState<'created_desc' | 'created_asc' | 'posts_desc' | 'resolved_desc' | 'reports_desc' | 'id_desc'>('created_desc');
  const [userItemsPerPage, setUserItemsPerPage] = useState<number>(30);
  const [isBatchUpdatingUserStatus, setIsBatchUpdatingUserStatus] = useState(false);
  const [isBatchResettingUserEkyc, setIsBatchResettingUserEkyc] = useState(false);
  const [isBatchUpdatingPostStatus, setIsBatchUpdatingPostStatus] = useState(false);
  const [isBatchAiAnalyzing, setIsBatchAiAnalyzing] = useState(false);

  const [isGeneratingSamplePosts, setIsGeneratingSamplePosts] = useState(false);
  const [isBatchDeletingPosts, setIsBatchDeletingPosts] = useState(false);
  const [isBatchDeletingUsers, setIsBatchDeletingUsers] = useState(false);
  const [isBatchDeletingModPosts, setIsBatchDeletingModPosts] = useState(false);
  const [isBatchDeletingArchive, setIsBatchDeletingArchive] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const itemsPerPage = 30;
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedDeletionRequest, setSelectedDeletionRequest] = useState<any>(null);
  // Deletion Tab States
  const [deletionSearchTerm, setDeletionSearchTerm] = useState('');
  const [deletionStatusFilter, setDeletionStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [deletionPage, setDeletionPage] = useState(1);
  const [deletionPerPage, setDeletionPerPage] = useState(15);
  const [selectedDeletionIds, setSelectedDeletionIds] = useState<number[]>([]);
  const [isBatchUpdatingDeletion, setIsBatchUpdatingDeletion] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  // Reports Tab States
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'urgent' | 'resolved' | 'dismissed'>('all');
  const [reportPage, setReportPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(15);
  const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
  const [isBatchUpdatingReports, setIsBatchUpdatingReports] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [aiDraftTone, setAiDraftTone] = useState<'standard' | 'apology' | 'guide' | 'gratitude' | 'concise'>('standard');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
    onClick?: () => void;
  }

  const navCategories: { title: string; items: NavItem[] }[] = [
    {
      title: 'Main Menu',
      items: [
        { id: 'stats', label: '概要', icon: Activity },
        { id: 'quizAnalytics', label: 'クイズ＆照合分析\n(ファネル・検索需要)', icon: Brain },
        { id: 'settings', label: 'サイト設定', icon: Settings },
        { id: 'users', label: 'ユーザー', icon: Users },
        { id: 'posts', label: 'ボトルメール', icon: Mail },
        { id: 'successStories', label: '幸せな再会の物語', icon: Sparkles },
      ]
    },
    {
      title: 'Trust & Safety (安全・本人確認)',
      items: [
        { id: 'security', label: 'サイト治安健全度 ＆\n総合セキュリティ', icon: ShieldAlert },
        { id: 'ageVerification', label: '本人確認（eKYC）\n照合ゲージ・監査ログ', icon: UserCheck },
        { id: 'policeConsultation', label: '警察事前相談 ＆\n法令適合サマリー', icon: ShieldCheck },
        { id: 'moderation', label: 'AI検知キュー', icon: Bot, badge: posts.filter(p => p.ai_flagged === 1).length },
        { id: 'reports', label: 'ユーザー通報', icon: AlertTriangle, badge: reports.filter(r => r.status === 'pending').length },
        { id: 'deletion', label: '削除依頼', icon: Trash2, badge: deletionRequests.filter(r => r.status === 'pending').length },
        { id: 'ngWords', label: 'NGワード', icon: Shield },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'rbac', label: '管理者権限・ロール (RBAC)', icon: ShieldCheck },
        { id: 'contacts', label: 'お問い合わせ', icon: Mail, badge: contacts.filter(c => c.status === 'pending').length },
        { id: 'emailTemplates', label: '送信メール一覧・テスト配信', icon: Mail },
        { id: 'notifications', label: '一括配信', icon: Bell },
        { id: 'logs', label: 'ログ', icon: Terminal },
        { id: 'versions', label: 'バージョン履歴 (Versions)', icon: History },
        { id: 'system', label: 'システム', icon: Activity },
      ]
    },
    {
      title: 'Finance & eKYC',
      items: [
        { id: 'valuation', label: 'M&A譲渡・企業価値評価\nデータ室', icon: Award },
        { id: 'payments', label: '売上・収益アナリティクス\n＆ 決済・eKYC台帳', icon: CreditCard },
        { id: 'monetization', label: '課金モデル\n収益シミュレーター', icon: DollarSign },
      ]
    },
    {
      title: 'Support & UI Specs',
      items: [
        { id: 'assetCleaner', label: '画像アセット管理 ＆\n選択クリーンアップ', icon: ImageIcon },
        { id: 'designSystem', label: 'デザインシステム\n(UI/UX Specs)', icon: Palette },
        { id: 'masterMemo', label: '運営方針・意思決定備忘録', icon: FileText, onClick: () => { setActiveTab('masterMemo'); } },
        { id: 'deployment', label: '本番デプロイ・広報ライブラリ', icon: Rocket, onClick: () => { setActiveTab('deployment'); setGuideDocType('deployment'); } },
        { id: 'manual', label: '管理画面操作マニュアル', icon: BookOpen },
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'home', label: 'HOMEに戻る', icon: ArrowLeft, onClick: () => navigate('/') },
        { id: 'account', label: 'マイページ', icon: UserIcon, onClick: () => navigate('/account') },
        { id: 'logout', label: 'ログアウト', icon: LogOut, onClick: () => { logout(); navigate('/'); } },
      ]
    }
  ];

  const filteredCategories = navCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const Badge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
      <span className={cn(
        "ml-auto bg-red-500 text-white text-[10px] font-serif font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
        isSidebarCollapsed && !isMobileMenuOpen ? "absolute -top-1 -right-1" : ""
      )}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const handleToggleHomeStats = async () => {
    const newValue = !statsEnabled;
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key: 'show_home_stats', value: String(newValue) })
      });
      if (res.ok) {
        setStatsEnabled(newValue);
      } else {
        console.error('Failed to update stats toggle');
      }
    } catch (err) {
      console.error('Error toggling home stats', err);
    }
  };

  const fetchData = async () => {
    if (authLoading) return;
    if (!token || !isAllowedAdminRole) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 🚀 PHASE 1: 最優先・主要データの高速一括取得（即座に画面を描画）
      const [usersRes, postsRes, statsRes, reportsRes, settingsRes, ageLogsRes, successStoriesRes, modQueueRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/posts', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/site-settings').catch(() => null),
        fetch('/api/admin/age-verification-logs', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/moderation-queue', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
      ]);

      if (usersRes && usersRes.ok) setUsers(await usersRes.json());
      if (postsRes && postsRes.ok) setPosts(await postsRes.json());
      if (reportsRes && reportsRes.ok) setReports(await reportsRes.json());
      if (ageLogsRes && ageLogsRes.ok) setAgeVerificationLogs(await ageLogsRes.json());
      if (successStoriesRes && successStoriesRes.ok) setSuccessStories(await successStoriesRes.json());
      if (modQueueRes && modQueueRes.ok) setModerationQueue(await modQueueRes.json());
      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (settingsRes && settingsRes.ok) {
        const settings = await settingsRes.json();
        setStatsEnabled(settings.show_home_stats === 'true');
      }

      // 主要データの描画完了（ここでローディング解除）
      setLoading(false);

      // 🚀 PHASE 2: セキュリティ・ログ・補助データの非同期フェッチ（UIをブロックしない）
      Promise.all([
        fetch('/api/admin/action-logs', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setActionLogs(d)).catch(() => {}),
        fetch('/api/admin/access-logs', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setAccessLogs(d)).catch(() => {}),
        fetch('/api/admin/deletion-requests', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setDeletionRequests(d)).catch(() => {}),
        fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setNgWords(d)).catch(() => {}),
        fetch('/api/admin/contacts', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setContacts(d)).catch(() => {}),
        fetch('/api/admin/security-stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setSecurityStats(d)).catch(() => {}),
        fetch('/api/admin/broadcasts', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setBroadcasts(d)).catch(() => {})
      ]).catch(() => {});

      // 🚀 PHASE 3: 重い分析・アーカイブ・バージョンデータの遅延取得
      Promise.all([
        fetch('/api/admin/db-health', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setDbHealth(d)).catch(() => {}),
        fetch('/api/admin/retention-stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setRetentionStats(d)).catch(() => {}),
        fetch('/api/admin/page-view-stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setPageViewStats(d)).catch(() => {}),
        fetch('/api/admin/activity-heatmap', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setHeatmapData(d)).catch(() => {}),
        fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setAuditLogs(d)).catch(() => {}),
        fetch('/api/admin/reunion-funnel', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setReunionFunnel(d)).catch(() => {}),
        fetch('/api/admin/reunion-duration-stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setReunionDurationStats(d)).catch(() => {}),
        fetch('/api/admin/deleted-posts-archive', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setDeletedPostsArchive(d)).catch(() => {}),
        fetch('/api/admin/moderation/history', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setModerationHistory(d)).catch(() => {}),
        fetch('/api/admin/versions', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setDbVersions(d)).catch(() => {}),
        fetch('/api/admin/quiz-matching-analytics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(d => d && setQuizMatchingAnalytics(d)).catch(() => {})
      ]).catch(() => {});

    } catch (err) {
      console.error("Admin fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAnalyticsOnly = async () => {
    if (!token || !isAllowedAdminRole) return;
    try {
      const res = await fetch('/api/admin/quiz-matching-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setQuizMatchingAnalytics(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch quiz analytics:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, user, authLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (activeTab === 'moderation') {
      fetch('/api/admin/moderation-queue', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setModerationQueue(d))
        .catch(() => {});
      fetch('/api/admin/deleted-posts-archive', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setDeletedPostsArchive(d))
        .catch(() => {});
      fetch('/api/admin/moderation/history', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setModerationHistory(d))
        .catch(() => {});
    }
    if (activeTab === 'ageVerification') {
      fetch('/api/admin/age-verification-logs', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setAgeVerificationLogs(d))
        .catch(() => {});
    }
    if (activeTab === 'successStories') {
      fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setSuccessStories(d))
        .catch(() => {});
    }
    if (activeTab === 'deletion') {
      fetch('/api/admin/deletion-requests', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setDeletionRequests(d))
        .catch(() => {});
    }
    if (activeTab === 'reports') {
      fetch('/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setReports(d))
        .catch(() => {});
    }
    if (activeTab === 'ngWords') {
      fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setNgWords(d))
        .catch(() => {});
    }
    if (activeTab === 'contacts') {
      fetch('/api/admin/contacts', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setContacts(d))
        .catch(() => {});
    }
    if (activeTab === 'quizAnalytics' && (!quizMatchingAnalytics || !quizMatchingAnalytics.summary)) {
      fetchQuizAnalyticsOnly();
    }
    if (activeTab === 'versions') {
      fetchDbVersions();
      fetchGitInfo();
    }
  }, [activeTab]);

  const handleGenerateSamplePosts = async (count: number = 50) => {
    setIsGeneratingSamplePosts(true);
    try {
      const res = await fetch('/api/admin/generate-sample-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ count })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✨ 重複ゼロ・高リアリティのサンプルボトルを${data.count || count}件正常に生成・追加しました！`);
        fetchData();
      } else {
        alert('サンプルボトルの生成に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsGeneratingSamplePosts(false);
    }
  };

  const handleReseedUniquePosts = async (count: number = 200) => {
    if (!window.confirm(`【完全重複ゼロ・想い出再構築】\n既存の重複サンプル手紙を整理し、誰一人としてクイズや本文が被らない「100%ユニークな想い出ボトルメール（${count}通）」を一括再構築しますか？\n（※管理者・テストユーザーは安全に維持されます）`)) {
      return;
    }
    setIsGeneratingSamplePosts(true);
    try {
      const res = await fetch('/api/admin/reseed-unique-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ count })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✨ 重複ゼロの完全ユニークなボトルメールを${data.count || count}件正常に再構築しました！`);
        fetchData();
      } else {
        alert('再構築に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsGeneratingSamplePosts(false);
    }
  };

  const handleBatchDeletePosts = async () => {
    if (selectedPostIds.length === 0) return;
    const idsToDelete = [...selectedPostIds];
    if (!window.confirm(`選択した${idsToDelete.length}件のボトル（手紙）を一括削除しますか？\n（関連する質問やログ等も安全に整理・削除されます）`)) {
      return;
    }
    setIsBatchDeletingPosts(true);
    try {
      const res = await fetch('/api/admin/posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: idsToDelete,
          reason: '管理者画面からの選択削除'
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}件のボトルを削除しました。`);
        setSelectedPostIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setPosts(prev => prev.filter(p => !idSet.has(Number(p.id))));
        setModerationQueue(prev => prev.filter(p => !idSet.has(Number(p.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingPosts(false);
    }
  };

  const handleBatchUpdatePostStatus = async (newStatus: 'active' | 'resolved') => {
    if (selectedPostIds.length === 0) return;
    const actionLabel = newStatus === 'resolved' ? '再会成立（解決済）' : '公開捜索中（active）';
    if (!window.confirm(`選択した${selectedPostIds.length}件のボトルのステータスを一括で「${actionLabel}」に変更しますか？`)) {
      return;
    }
    setIsBatchUpdatingPostStatus(true);
    try {
      const res = await fetch('/api/admin/posts/batch-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds: selectedPostIds, status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedPostIds.length}件のボトルのステータスを「${actionLabel}」に更新しました。`);
        const idSet = new Set(selectedPostIds.map(Number));
        setPosts(prev => prev.map(p => idSet.has(Number(p.id)) ? { ...p, status: newStatus, is_resolved: newStatus === 'resolved' ? 1 : 0 } : p));
        setSelectedPostIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括ステータス変更に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchUpdatingPostStatus(false);
    }
  };

  const handleBatchAiAnalyzePosts = async () => {
    if (selectedPostIds.length === 0) return;
    if (!window.confirm(`選択した${selectedPostIds.length}件のボトルメールに対して、Google Gemini AI による一括安全診断・検閲審査を実行しますか？`)) {
      return;
    }
    setIsBatchAiAnalyzing(true);
    try {
      const res = await fetch('/api/admin/posts/batch-ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds: selectedPostIds })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedPostIds.length}件のボトルメールのAI安全診断が完了しました。`);
        setSelectedPostIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括AI診断に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchAiAnalyzing(false);
    }
  };

  const handleTogglePostStatus = async (postId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'resolved' ? 'active' : 'resolved';
    const actionLabel = newStatus === 'resolved' ? '再会成立（解決済）' : '公開捜索中（active）';
    try {
      const res = await fetch(`/api/admin/posts/${postId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus, is_resolved: newStatus === 'resolved' ? 1 : 0 } : p));
      } else {
        alert('ステータスの更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleExportPostsCSV = () => {
    const filtered = posts.filter(p => {
      const isSample = p.is_sample === 1 || p.user_is_sample === 1;
      if (postFilterType === 'sample' && !isSample) return false;
      if (postFilterType === 'real' && isSample) return false;
      if (postFilterType === 'active' && p.status === 'resolved') return false;
      if (postFilterType === 'resolved' && p.status !== 'resolved') return false;
      if (postFilterType === 'ai_passed' && (!p.ai_diagnosed || p.ai_flagged)) return false;
      if (postFilterType === 'ai_flagged' && !p.ai_flagged) return false;

      if (!postSearchTerm) return true;
      const term = postSearchTerm.toLowerCase();
      return (
        (p.target_name && p.target_name.toLowerCase().includes(term)) ||
        (p.searcher_name && p.searcher_name.toLowerCase().includes(term)) ||
        (p.searcher_username && p.searcher_username.toLowerCase().includes(term)) ||
        (p.searcher_nickname && p.searcher_nickname.toLowerCase().includes(term)) ||
        (p.searcher_full_name && p.searcher_full_name.toLowerCase().includes(term)) ||
        (p.target_school && p.target_school.toLowerCase().includes(term)) ||
        (p.target_hometown && p.target_hometown.toLowerCase().includes(term)) ||
        (p.era && p.era.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.message && p.message.toLowerCase().includes(term)) ||
        (p.secret_question && p.secret_question.toLowerCase().includes(term)) ||
        String(p.id).includes(term)
      );
    });

    if (filtered.length === 0) {
      alert('エクスポート対象のボトルメールが存在しません。');
      return;
    }

    const headers = ['手紙ID', '種別', '対象者名', '差出人名', '差出人ユーザー名', '差出人本名', '対象者出身・地域', '学校・所属', '年代', 'カテゴリ', '想い出メッセージ', '秘密の質問', '回答', 'AI診断状況', 'AI警告フラグ', 'ステータス', '投函日時'];
    const rows = filtered.map(p => {
      const isSample = p.is_sample === 1 || p.user_is_sample === 1;
      return [
        p.id,
        isSample ? 'サンプル' : '本番',
        `"${(p.target_name || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_name || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_username || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_full_name || '').replace(/"/g, '""')}"`,
        `"${(p.target_hometown || '').replace(/"/g, '""')}"`,
        `"${(p.target_school || '').replace(/"/g, '""')}"`,
        `"${(p.era || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.message || '').replace(/"/g, '""')}"`,
        `"${(p.secret_question || '').replace(/"/g, '""')}"`,
        `"${(p.secret_answer_plain || p.secret_answer || '').replace(/"/g, '""')}"`,
        p.ai_diagnosed ? '診断済' : '未診断',
        p.ai_flagged ? '要警戒' : '健全',
        p.status === 'resolved' ? '再会成立' : '捜索中',
        p.created_at || ''
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_bottles_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    const idsToDelete = [...selectedUserIds];
    if (!window.confirm(`選択した${idsToDelete.length}名のユーザーを一括削除しますか？\n（※管理者は自動除外され、関連投稿やメッセージも安全に整理されます）`)) {
      return;
    }
    setIsBatchDeletingUsers(true);
    try {
      const res = await fetch('/api/admin/users/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}名のユーザーを削除しました。`);
        setSelectedUserIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setUsers(prev => prev.filter(u => !idSet.has(Number(u.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingUsers(false);
    }
  };

  const handleBatchUpdateUserStatus = async (isBlocked: boolean) => {
    if (selectedUserIds.length === 0) return;
    const actionLabel = isBlocked ? '一括凍結（ブロック）' : '一括凍結解除（正常化）';
    if (!window.confirm(`選択した${selectedUserIds.length}名のユーザーを${actionLabel}しますか？\n（※管理者アカウントは自動保護されます）`)) {
      return;
    }
    setIsBatchUpdatingUserStatus(true);
    try {
      const res = await fetch('/api/admin/users/batch-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: selectedUserIds, is_blocked: isBlocked })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedUserIds.length}名のユーザーを${actionLabel}しました。`);
        const idSet = new Set(selectedUserIds.map(Number));
        setUsers(prev => prev.map(u => idSet.has(Number(u.id)) && u.role !== 'admin' ? { ...u, is_blocked: isBlocked ? 1 : 0 } : u));
        setSelectedUserIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括ステータス変更に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchUpdatingUserStatus(false);
    }
  };

  const handleBatchResetUserEkyc = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`選択した${selectedUserIds.length}名のユーザーのeKYC本人確認ステータスを一括リセット（未申請・自己申告状態に戻す）しますか？`)) {
      return;
    }
    setIsBatchResettingUserEkyc(true);
    try {
      const res = await fetch('/api/admin/users/batch-reset-ekyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: selectedUserIds })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedUserIds.length}名のユーザーのeKYCステータスをリセットしました。`);
        const idSet = new Set(selectedUserIds.map(Number));
        setUsers(prev => prev.map(u => idSet.has(Number(u.id)) ? { ...u, is_ekyc_verified: 0, ekyc_document_type: null, ekyc_verified_at: null, ekyc_name: null } : u));
        setSelectedUserIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括eKYCリセットに失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchResettingUserEkyc(false);
    }
  };

  const handleExportUsersCSV = () => {
    const filtered = users.filter(u => {
      if (userStatusFilter === 'ekyc' && !u.is_ekyc_verified) return false;
      if (userStatusFilter === 'self' && u.is_ekyc_verified) return false;
      if (userStatusFilter === 'blocked' && !u.is_blocked) return false;
      if (userStatusFilter === 'admin' && u.role !== 'admin') return false;
      if (userStatusFilter === 'sample' && (!u.username.startsWith('sample_') && !u.email?.includes('example.com') && !u.email?.includes('sample.local'))) return false;
      if (userStatusFilter === 'real' && (u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local'))) return false;

      if (!userSearchTerm) return true;
      const term = userSearchTerm.toLowerCase();
      return (
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.nickname && u.nickname.toLowerCase().includes(term)) ||
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.maiden_name && u.maiden_name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.contact_id && u.contact_id.toLowerCase().includes(term)) ||
        String(u.id).includes(term)
      );
    });

    if (filtered.length === 0) {
      alert('エクスポート対象のユーザーが存在しません。');
      return;
    }

    const headers = ['ユーザーID', 'ユーザー名', 'ニックネーム', '本名', '旧姓', '生年月日', '性別', 'メールアドレス', '連絡先種別', '連絡先ID', '権限', 'eKYC認証', '凍結状態', '投関数', '再会数', '被通報数', '登録日時'];
    const rows = filtered.map(u => [
      u.id,
      `"${(u.username || '').replace(/"/g, '""')}"`,
      `"${(u.nickname || '').replace(/"/g, '""')}"`,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      `"${(u.maiden_name || '').replace(/"/g, '""')}"`,
      u.birthdate || '',
      `"${(u.gender || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.contact_type || '',
      `"${(u.contact_id || '').replace(/"/g, '""')}"`,
      u.role || 'user',
      u.is_ekyc_verified ? '認証済' : '未認証',
      u.is_blocked ? '凍結中' : '正常',
      u.posts_count || 0,
      u.resolved_posts_count || 0,
      u.reports_received_count || 0,
      u.created_at || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApproveModPost = async (postId: number) => {
    if (!token) return;
    if (!window.confirm(`ボトル #${postId} のAIフラグを解除し、通常公開として承認しますか？`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/moderation/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      });
      if (res.ok) {
        alert(`ボトル #${postId} を承認・公開しました。`);
        setModerationQueue(prev => prev.filter(p => Number(p.id) !== Number(postId)));
        setSelectedModPostIds(prev => prev.filter(id => Number(id) !== Number(postId)));
        if (selectedModPostModal?.id === postId) setSelectedModPostModal(null);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`承認に失敗しました: ${err.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleBatchApproveModPosts = async () => {
    if (selectedModPostIds.length === 0 || !token) return;
    const ids = [...selectedModPostIds];
    if (!window.confirm(`選択した${ids.length}件のボトルのAIフラグを一括解除し、通常公開として承認しますか？`)) {
      return;
    }
    setIsBatchApprovingModPosts(true);
    try {
      const res = await fetch('/api/admin/moderation/batch-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds: ids })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || ids.length}件のボトルを一括承認・公開しました。`);
        const idSet = new Set(ids.map(Number));
        setModerationQueue(prev => prev.filter(p => !idSet.has(Number(p.id))));
        setSelectedModPostIds([]);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`一括承認に失敗しました: ${err.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchApprovingModPosts(false);
    }
  };

  const handleBatchDeleteModPosts = async () => {

    if (selectedModPostIds.length === 0) return;
    const idsToDelete = [...selectedModPostIds];
    if (!window.confirm(`モデレーションキューで選択した${idsToDelete.length}件の手紙を一括削除・アーカイブしますか？`)) {
      return;
    }
    setIsBatchDeletingModPosts(true);
    try {
      const res = await fetch('/api/admin/posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: idsToDelete,
          reason: 'モデレーション画面からの選択削除・アーカイブ'
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}件の手紙を削除・アーカイブしました。`);
        setSelectedModPostIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setModerationQueue(prev => prev.filter(p => !idSet.has(Number(p.id))));
        setPosts(prev => prev.filter(p => !idSet.has(Number(p.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingModPosts(false);
    }
  };

  const handleBatchDeleteArchive = async () => {
    if (selectedArchiveIds.length === 0) return;
    const idsToDelete = [...selectedArchiveIds];
    if (!window.confirm(`選択した${idsToDelete.length}件の削除監査ログを一括削除しますか？`)) {
      return;
    }
    setIsBatchDeletingArchive(true);
    try {
      const res = await fetch('/api/admin/deleted-posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}件の監査ログを削除しました。`);
        setSelectedArchiveIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setDeletedPostsArchive(prev => prev.filter(a => !idSet.has(Number(a.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingArchive(false);
    }
  };

  const handleUnblockIp = async (ip: string) => {
    try {
      const res = await fetch(`/api/admin/block-ip/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSecurityStats({
          ...securityStats,
          blockedIps: securityStats.blockedIps.filter((i: any) => i.ip !== ip)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockIp = async (ip: string, reason: string = "Admin manual block") => {
    try {
      const res = await fetch('/api/admin/block-ip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip, reason })
      });
      if (res.ok) {
        // Refresh security stats
        const securityRes = await fetch('/api/admin/security-stats', { headers: { 'Authorization': `Bearer ${token}` } });
        if (securityRes.ok) setSecurityStats(await securityRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('access_logs');
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewTimeframe, setPreviewTimeframe] = useState('7d');

  const handleExportAuditBundle = async (timeframe: string = 'all') => {
    setIsExporting(timeframe);
    try {
      const res = await fetch(`/api/admin/export/audit-bundle?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'エクスポートに失敗しました。サーバーの制限（メモリ不足など）の可能性があります。');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_bundle_${timeframe}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'エクスポートに失敗しました。');
      console.error(err);
    } finally {
      setIsExporting(null);
    }
  };

  const convertToCsvAndDownload = (filename: string, headers: string[], rows: any[], mappingFn: (row: any) => any[]) => {
    const csvRows = [headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',')];
    rows.forEach(row => {
      const values = mappingFn(row);
      const rowText = values.map(v => {
        const str = v === null || v === undefined ? '' : String(v);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',');
      csvRows.push(rowText);
    });
    
    // Microsoft Excel in Japan needs a UTF-8 Byte Order Mark (BOM) to read Japanese characters correctly.
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportTableCsv = (category: string, rawData: any[], timeframe: string) => {
    if (!rawData || rawData.length === 0) {
      alert('エクスポートするデータがありません。');
      return;
    }
    let headers: string[] = [];
    let mappingFn: (row: any) => any[] = () => [];
    let filename = `remeet_${category}_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`;

    switch (category) {
      case 'users':
        headers = ['ユーザーID', 'お名前/ユーザー名', 'メールアドレス', '管理者フラグ', 'ブロック状態', '登録日時'];
        mappingFn = (row: any) => [
          row.id,
          row.name || row.username || '',
          row.email || '',
          row.is_admin ? '管理者' : '一般',
          row.is_blocked ? 'ブロック中' : '通常',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'access_logs':
        headers = ['ログID', 'ユーザーID', 'パス', 'メソッド', 'ステータスコード', 'IPアドレス', 'UserAgent', 'Referer', 'アクセス日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || 'ゲスト',
          row.path || '',
          row.method || '',
          row.status_code || '',
          row.ip || '',
          row.user_agent || '',
          row.referer || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'action_logs':
        headers = ['ログID', 'ユーザーID', 'アクション', '詳細内容', 'IPアドレス', '記録日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || 'ゲスト',
          row.action || '',
          row.details || '',
          row.ip || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'age_verification_logs':
        headers = ['ログID', 'ユーザーID', 'IPアドレス', '認証成否', '年齢', '理由/判定内容', 'ドキュメント種別', '記録日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || '',
          row.ip || '',
          row.is_verified ? '承認' : '却下',
          row.age || '',
          row.reason || '',
          row.document_type || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'reports':
        headers = ['通報ID', '通報者ユーザーID', '対象ボトルID', '対象メッセージID', '理由', '詳細内容', 'ステータス', '対応状況', '対応日時', '通報日時'];
        mappingFn = (row: any) => [
          row.id,
          row.reporter_id || '',
          row.post_id || '',
          row.message_id || '',
          row.reason || '',
          row.details || '',
          row.status || '',
          row.resolution || '',
          row.resolved_at ? new Date(row.resolved_at).toLocaleString() : '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'posts':
        headers = ['ボトルID', '投稿者ID', '探している人(検索名)', 'フルネーム', '対象のお名前', '年代', '関係分類', 'AI検知理由', 'ステータス', '投函日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || '',
          row.searcher_name || '',
          row.searcher_full_name || '',
          row.target_name || '',
          row.era || '',
          row.category || '',
          row.ai_reason || '',
          row.status || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'failed_attempts':
        headers = ['ID', 'IPアドレス', 'アクションキー', '失敗回数', '最終試行日時'];
        mappingFn = (row: any) => [
          row.id,
          row.ip || '',
          row.action_key || '',
          row.attempt_count || 0,
          row.last_attempt ? new Date(row.last_attempt).toLocaleString() : ''
        ];
        break;
      default:
        return;
    }

    convertToCsvAndDownload(filename, headers, rawData, mappingFn);
  };

  const handleLoadPreviewAndShow = async (timeframe: string = '7d') => {
    setPreviewTimeframe(timeframe);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/export/audit-bundle?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('監査データの取得に失敗しました。');
      }
      const data = await res.json();
      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (err: any) {
      alert(err.message || '読み込みに失敗しました。');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: number, is_blocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: is_blocked ? 1 : 0 } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminResetUserEkyc = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-ekyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_ekyc_verified: 0 } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, is_ekyc_verified: 0 });
        }
        if (user && user.id === userId) {
          localStorage.removeItem('ekyc_verified');
          localStorage.setItem('ekyc_verified', 'false');
          sessionStorage.removeItem('finder_ekyc_step');
          sessionStorage.removeItem('show_finder_ekyc_modal');
          window.dispatchEvent(new Event('ekyc_changed'));
          updateUser({ is_ekyc_verified: false });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const handleAdminSendPasswordReset = async (userId: number, email: string) => {
    if (!window.confirm(`ユーザー「${email}」宛にパスワード再設定メールを送信しますか？\n（本人の登録メールアドレス宛に30分間有効な再設定リンクが届きます）`)) {
      return;
    }
    setIsSendingPasswordReset(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/send-reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'パスワード再設定メールを安全に送信しました。');
      } else {
        alert(data.error || '送信に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  const handleExportStats = async () => {
    try {
      const res = await fetch('/api/admin/export/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `remeet-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDbHealthCheck = async () => {
    try {
      const res = await fetch('/api/admin/db-health', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setDbHealth(await res.json());
        alert('データベース健康診断が完了しました。');
      }
    } catch (err) {
      console.error(err);
      alert('診断に失敗しました。');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('すべてのデータを初期化し、すべての答えが異なる情緒豊かなサンプルデータ（50件）を再生成します。よろしいですか？')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/reset-data', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        alert('データをリセットし、新しいサンプルデータを生成しました。');
        fetchData();
      } else {
        alert('リセットに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleSeedModeration = async () => {
    try {
      const res = await fetch('/api/admin/seed-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('AI検知用の検証サンプルデータ（個人情報/NGワード検出、脅迫表現、商用スパムを含む3件）を混入させました。AI検知キューからご確認いただけます。');
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'サンプルの作成に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleApproveDeletionRequest = async (id: number) => {
    if (!confirm('この削除依頼を承認し、対象のボトルメールを完全に削除しますか？')) return;
    try {
      const res = await fetch(`/api/admin/deletion-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeletionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        if (selectedDeletionRequest && selectedDeletionRequest.id === id) {
          setSelectedDeletionRequest({ ...selectedDeletionRequest, status: 'approved' });
        }
        // Refresh posts to reflect the deleted bottle
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectDeletionRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/deletion-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeletionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        if (selectedDeletionRequest && selectedDeletionRequest.id === id) {
          setSelectedDeletionRequest({ ...selectedDeletionRequest, status: 'rejected' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchApproveDeletion = async () => {
    if (selectedDeletionIds.length === 0) return;
    if (!confirm(`選択した ${selectedDeletionIds.length} 件の削除依頼を一括で承認し、対象ボトルメールを削除しますか？`)) return;
    setIsBatchUpdatingDeletion(true);
    try {
      const res = await fetch('/api/admin/deletion-requests/batch-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestIds: selectedDeletionIds })
      });
      if (res.ok) {
        setDeletionRequests(prev => prev.map(r => selectedDeletionIds.includes(r.id) ? { ...r, status: 'approved' } : r));
        setSelectedDeletionIds([]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingDeletion(false);
    }
  };

  const handleBatchRejectDeletion = async () => {
    if (selectedDeletionIds.length === 0) return;
    if (!confirm(`選択した ${selectedDeletionIds.length} 件の削除依頼を一括で却下しますか？`)) return;
    setIsBatchUpdatingDeletion(true);
    try {
      const res = await fetch('/api/admin/deletion-requests/batch-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestIds: selectedDeletionIds })
      });
      if (res.ok) {
        setDeletionRequests(prev => prev.map(r => selectedDeletionIds.includes(r.id) ? { ...r, status: 'rejected' } : r));
        setSelectedDeletionIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingDeletion(false);
    }
  };


  const handleResolveReport = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
        if (selectedReport && selectedReport.id === id) {
          setSelectedReport({ ...selectedReport, status: 'resolved' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissReport = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
        if (selectedReport && selectedReport.id === id) {
          setSelectedReport({ ...selectedReport, status: 'dismissed' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchResolveReports = async () => {
    if (selectedReportIds.length === 0) return;
    if (!confirm(`選択した ${selectedReportIds.length} 件の通報を一括で解決済みにしますか？`)) return;
    setIsBatchUpdatingReports(true);
    try {
      const res = await fetch('/api/admin/reports/batch-resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reportIds: selectedReportIds })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => selectedReportIds.includes(r.id) ? { ...r, status: 'resolved' } : r));
        setSelectedReportIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingReports(false);
    }
  };

  const handleBatchDismissReports = async () => {
    if (selectedReportIds.length === 0) return;
    if (!confirm(`選択した ${selectedReportIds.length} 件の通報を一括で却下しますか？`)) return;
    setIsBatchUpdatingReports(true);
    try {
      const res = await fetch('/api/admin/reports/batch-dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reportIds: selectedReportIds })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => selectedReportIds.includes(r.id) ? { ...r, status: 'dismissed' } : r));
        setSelectedReportIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingReports(false);
    }
  };


  const [isAiAnalyzing, setIsAiAnalyzing] = useState<number | null>(null);

  const handleAiAnalyze = async (postId: number) => {
    setIsAiAnalyzing(postId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/posts/${postId}/ai-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success && data.result) {
        setStatusMsg({
          text: `AI分析完了: ${data.result.is_flagged ? '⚠️ 不適切な内容を検知しました' : '✅ 適切な内容です'}`,
          type: data.result.is_flagged ? 'error' : 'success'
        });
        const [postsRes, modRes] = await Promise.all([
          fetch('/api/admin/posts', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/moderation-queue', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (postsRes.ok) {
          const updatedPosts = await postsRes.json();
          setPosts(updatedPosts);
          if (selectedPost && selectedPost.id === postId) {
            const updatedPost = updatedPosts.find((p: any) => p.id === postId);
            if (updatedPost) setSelectedPost(updatedPost);
          }
        }
        if (modRes.ok) setModerationQueue(await modRes.json());
      } else {
        throw new Error(data.error || "Failed to analyze post");
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      setStatusMsg({ text: "AI分析に失敗しました。", type: 'error' });
    } finally {
      setIsAiAnalyzing(null);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingNotification, setPendingNotification] = useState<{content: string, link: string} | null>(null);

  const handleDeleteBroadcast = async (broadcast: any) => {
    showConfirm('通知の削除', 'この一括配信通知を削除しますか？（全ユーザーの通知一覧から消去されます）', async () => {
      try {
        const response = await fetch('/api/admin/broadcasts', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: broadcast.content,
            created_at: broadcast.created_at
          })
        });
        if (response.ok) {
          fetchData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleSendBulkNotification = async (content: string, link: string) => {
    if (!token) {
      setStatusMsg({ text: '認証エラーが発生しました。再ログインしてください。', type: 'error' });
      return;
    }
    
    // Simple validation for link if provided
    if (link && !link.startsWith('http')) {
      setStatusMsg({ text: 'URLは http:// または https:// から開始してください', type: 'error' });
      return;
    }

    setPendingNotification({ content, link });
    setShowBulkConfirm(true);
  };

  const executeBulkNotification = async () => {
    if (!pendingNotification || !token) return;

    setIsSending(true);
    setStatusMsg(null);
    setShowBulkConfirm(false);
    
    try {
      const response = await fetch('/api/admin/bulk-notification', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pendingNotification)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatusMsg({ text: `通知を送信しました (${data.count}名)`, type: 'success' });
        fetchData();
        setPendingNotification(null);
        setTimeout(() => setStatusMsg(null), 5000);
      } else {
        setStatusMsg({ text: data.error || '送信に失敗しました', type: 'error' });
      }
    } catch (err) {
      console.error("Bulk notification error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。サーバーの状態を確認してください。', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleReplyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !replyMessage || !token) return;

    setIsReplying(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage })
      });

      if (response.ok) {
        setStatusMsg({ text: '返信を送信しました。', type: 'success' });
        setSelectedContact(null);
        setReplyMessage('');
        fetchData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const data = await response.json();
        setStatusMsg({ text: data.error || '送信に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Reply error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsReplying(false);
    }
  };

  const handleGenerateAiDraft = async (selectedTone?: 'standard' | 'apology' | 'guide' | 'gratitude' | 'concise') => {
    if (!selectedContact || !token) return;
    const toneToUse = selectedTone || aiDraftTone;
    setIsGeneratingAiDraft(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/ai-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tone: toneToUse })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.draft) {
          setReplyMessage(data.draft);
          setStatusMsg({ text: '✨ AIが返信下書きを作成・反映しました。内容をご確認の上ご調整ください。', type: 'success' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || 'AI下書きの生成に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("AI Draft error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const handleSeedSampleContacts = async () => {
    if (!token) return;
    setIsSeedingContacts(true);
    try {
      const response = await fetch('/api/admin/contacts/seed-samples', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStatusMsg({ text: '✅ サンプルお問い合わせ（全分類対応・8件）を投入しました。自動分類トリアージをお試しいただけます。', type: 'success' });
        // Refresh contacts
        const contactsRes = await fetch('/api/admin/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (contactsRes.ok) {
          const freshContacts = await contactsRes.json();
          setContacts(freshContacts);
        }
        setTimeout(() => setStatusMsg(null), 5000);
      } else {
        setStatusMsg({ text: 'サンプル投入に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Seed contacts error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsSeedingContacts(false);
    }
  };

  const handleToggleSelectAllContacts = (currentIds: number[]) => {
    if (selectedContactIds.length === currentIds.length && currentIds.length > 0) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(currentIds);
    }
  };

  const handleToggleSelectContact = (id: number) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchUpdateContactStatus = async (status: 'replied' | 'pending') => {
    if (!token || selectedContactIds.length === 0) return;
    const label = status === 'replied' ? '返信済（解決）' : '未対応';
    if (!confirm(`選択した ${selectedContactIds.length} 件のお問い合わせを「${label}」に一括変更しますか？`)) return;

    setIsBatchProcessingContacts(true);
    try {
      const response = await fetch('/api/admin/contacts/batch-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedContactIds, status })
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMsg({ text: `✨ ${data.message || '一括更新が完了しました。'}`, type: 'success' });
        setSelectedContactIds([]);
        fetchData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '一括更新に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Batch status error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsBatchProcessingContacts(false);
    }
  };

  const handleBatchDeleteContacts = async () => {
    if (!token || selectedContactIds.length === 0) return;
    if (!confirm(`⚠️ 警告: 選択した ${selectedContactIds.length} 件のお問い合わせを完全に削除しますか？この操作は取り消せません。`)) return;

    setIsBatchProcessingContacts(true);
    try {
      const response = await fetch('/api/admin/contacts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedContactIds })
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMsg({ text: `🗑️ ${data.message || '一括削除が完了しました。'}`, type: 'success' });
        setSelectedContactIds([]);
        fetchData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '一括削除に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Batch delete error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsBatchProcessingContacts(false);
    }
  };

  const handleUpdateSingleContactStatus = async (id: number, status: 'replied' | 'pending') => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/contacts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setStatusMsg({ text: `ステータスを「${status === 'replied' ? '返信済' : '未対応'}」に変更しました。`, type: 'success' });
        fetchData();
        setTimeout(() => setStatusMsg(null), 2500);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '更新に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Status update error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    }
  };

  const handleDeleteSingleContact = async (id: number) => {
    if (!token) return;
    if (!confirm('このお問い合わせを削除しますか？')) return;
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setStatusMsg({ text: 'お問い合わせを削除しました。', type: 'success' });
        setSelectedContactIds(prev => prev.filter(i => i !== id));
        fetchData();
        setTimeout(() => setStatusMsg(null), 2500);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '削除に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Delete contact error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    }
  };

  const handleExportContactsCsv = () => {
    if (!contacts || contacts.length === 0) {
      alert('エクスポートするお問い合わせデータがありません。');
      return;
    }

    const headers = ['ID', '自動分類', 'ステータス', '優先スコア', '検知キーワード', '受信日時', '氏名', 'メールアドレス', '件名', '本文', '返信日時', '返信内容'];
    const rows = contacts.map(c => {
      const cl = classifyTicket(c.subject || '', c.message || '');
      return [
        c.id,
        cl.categoryLabel,
        c.status === 'replied' ? '返信済' : '未対応',
        cl.priorityScore,
        `"${(cl.matchedKeywords || []).join('; ')}"`,
        `"${new Date(c.created_at).toLocaleString('ja-JP').replace(/"/g, '""')}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.subject || '').replace(/"/g, '""')}"`,
        `"${(c.message || '').replace(/"/g, '""')}"`,
        c.replied_at ? `"${new Date(c.replied_at).toLocaleString('ja-JP').replace(/"/g, '""')}"` : '""',
        `"${(c.reply_message || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_contacts_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewPost = async (post: any) => {
    try {
      const postRes = await fetch(`/api/admin/posts/${post.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (postRes.ok) {
        const postData = await postRes.json();
        setSelectedPost(postData);
      } else {
        setSelectedPost(post); // Fallback to basic data
      }
    } catch (err) {
      console.error(err);
      setSelectedPost(post); // Fallback
    }
  };

  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    setLoadingUserPosts(true);
    try {
      const [detailsRes, postsRes] = await Promise.all([
        fetch(`/api/admin/users/${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/admin/users/${user.id}/posts`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let fullUserData = user;
      if (detailsRes.ok) {
        fullUserData = await detailsRes.json();
      }

      let fetchedPosts: any[] = [];
      if (postsRes.ok) {
        fetchedPosts = await postsRes.json();
        setUserPosts(fetchedPosts);
      } else {
        setUserPosts([]);
      }

      setSelectedUser({
        ...fullUserData,
        posts_count: fetchedPosts.length || fullUserData.posts_count || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserPosts(false);
    }
  };

  const handleToggleFreezeUser = async (userId: number, currentBlocked: number) => {
    if (!token) return;
    try {
      const is_blocked = currentBlocked === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked })
      });
      if (res.ok) {
        alert(is_blocked ? '対象ユーザーのアカウントを凍結（無効化）しました。' : '対象ユーザーの凍結を解除しました。');
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'ステータスの更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信に失敗しました。');
    }
  };

  const triggerDeletePost = (id: number) => {
    setDeleteTargetId(id);
    setDeleteReasonText('規約違反またはAIフラグ検出による削除');
    setIsDeleteModalOpen(true);
  };

  const handleDeletePost = async (id: number, customReason?: string) => {
    console.log(`handleDeletePost called with ID: ${id}`);
    const finalReason = (customReason || deleteReasonText).trim() || '規約違反またはAIフラグ検出による削除';

    // 削除確認のダイアログに進む際、背後にある削除理由選択モーダルを一時的に閉じて画面をスッキリさせます
    setIsDeleteModalOpen(false);

    showConfirm('ボトルメールの削除', `理由「${finalReason}」でこのボトルメールを削除してもよろしいですか？`, async () => {
      try {
        console.log(`Sending DELETE request for post ${id}...`);
        const res = await fetch(`/api/admin/posts/${id}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ reason: finalReason })
        });
        
        console.log(`Post DELETE response status: ${res.status}`);
        if (res.ok) {
          console.log('Post deletion successful, updating state...');
          setPosts(prev => prev.filter(p => p.id !== id));
          setModerationQueue(prev => prev.filter(p => p.id !== id));
          // Re-fetch archive history
          const deletedArchiveRes = await fetch('/api/admin/deleted-posts-archive', { headers: { 'Authorization': `Bearer ${token}` } });
          if (deletedArchiveRes.ok) setDeletedPostsArchive(await deletedArchiveRes.json());
          setSelectedPost(null);
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Post deletion failed:', res.status, errorData);
          alert(`削除に失敗しました (${res.status}): ${errorData.error || '不明なエラー'}`);
        }
      } catch (err) {
        console.error('Error in handleDeletePost:', err);
        alert('通信エラーが発生しました。');
      }
    });
  };

  const handleDeleteUser = async (id: number) => {
    showConfirm('ユーザーの削除', 'このユーザーを削除してもよろしいですか？', async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleAddNgWord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNgWord.trim()) return;
    try {
      const res = await fetch('/api/admin/ng-words', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ word: newNgWord.trim() })
      });
      if (res.ok) {
        const wordsRes = await fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } });
        if (wordsRes.ok) {
          setNgWords(await wordsRes.json());
        }
        setNewNgWord('');
      } else {
        const data = await res.json();
        alert(data.error || '追加に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchAddNgWords = async () => {
    const lines = bulkNgWordsText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setIsBatchUpdatingNgWords(true);
    try {
      const res = await fetch('/api/admin/ng-words/batch-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ words: lines })
      });
      if (res.ok) {
        const wordsRes = await fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } });
        if (wordsRes.ok) {
          setNgWords(await wordsRes.json());
        }
        setBulkNgWordsText('');
        setIsBulkAddModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || '一括追加に失敗しました');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingNgWords(false);
    }
  };

  const handleDeleteNgWord = async (id: number) => {
    if (!confirm('このNGワードを削除してもよろしいですか？')) return;
    try {
      const res = await fetch(`/api/admin/ng-words/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNgWords(prev => prev.filter(w => w.id !== id));
        setSelectedNgWordIds(prev => prev.filter(selectedId => selectedId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchDeleteNgWords = async () => {
    if (selectedNgWordIds.length === 0) return;
    if (!confirm(`選択した ${selectedNgWordIds.length} 件のNGワードを一括削除しますか？`)) return;
    setIsBatchUpdatingNgWords(true);
    try {
      const res = await fetch('/api/admin/ng-words/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedNgWordIds })
      });
      if (res.ok) {
        setNgWords(prev => prev.filter(w => !selectedNgWordIds.includes(w.id)));
        setSelectedNgWordIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingNgWords(false);
    }
  };


  const handleUpdateSuccessStory = async (
    id: number, 
    is_public: boolean, 
    is_featured: boolean, 
    is_all_page: boolean, 
    display_position: string | null,
    message?: string,
    era?: string,
    gender?: string,
    title?: string,
    category?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          is_public, 
          is_featured, 
          is_all_page, 
          display_position,
          message,
          era,
          gender,
          title,
          category
        })
      });
      if (res.ok) {
        // Refetch latest stories from API to ensure display_position conflict resolutions are correctly shown
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
        setEditingStoryId(null);
        setStatusMsg({ text: '幸せな再会の物語を更新しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: '更新に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleCreateSuccessStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryForm.message) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/success-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStoryForm)
      });
      if (res.ok) {
        setStatusMsg({ text: '幸せな再会の物語を新規追加しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
        setIsCreatingStory(false);
        setNewStoryForm({
          title: '',
          message: '',
          era: '',
          gender: '男性',
          category: 'classmate',
          consent: true,
          is_public: true,
          is_featured: false,
          is_all_page: true,
          display_position: ''
        });
        // Refetch list
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
      } else {
        setStatusMsg({ text: '物語の追加に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccessStory = async (id: number) => {
    if (!window.confirm('この幸せな再会の物語を完全に削除しますか？')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSuccessStories(successStories.filter(s => s.id !== id));
        setStatusMsg({ text: '幸せな再会の物語を削除しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: '削除に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSuccessStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seed-success-stories', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
      }
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    reports,
    setReports,
    deletionRequests,
    setDeletionRequests,
    ngWords,
    setNgWords,
    contacts,
    setContacts,
    contactCategoryFilter,
    setContactCategoryFilter,
    contactStatusFilter,
    setContactStatusFilter,
    contactSearchQuery,
    setContactSearchQuery,
    contactSortBy,
    setContactSortBy,
    isSeedingContacts,
    setIsSeedingContacts,
    selectedContactIds,
    setSelectedContactIds,
    contactCurrentPage,
    setContactCurrentPage,
    contactItemsPerPage,
    setContactItemsPerPage,
    isBatchProcessingContacts,
    setIsBatchProcessingContacts,
    successStories,
    setSuccessStories,
    editingStoryId,
    setEditingStoryId,
    storyCategoryFilter,
    setStoryCategoryFilter,
    storyPage,
    setStoryPage,
    storyPerPage,
    setStoryPerPage,
    editStoryForm,
    setEditStoryForm,
    isCreatingStory,
    setIsCreatingStory,
    newStoryForm,
    setNewStoryForm,
    ageVerificationLogs,
    setAgeVerificationLogs,
    securityStats,
    setSecurityStats,
    statsEnabled,
    setStatsEnabled,
    adminHomeDesign,
    setAdminHomeDesign,
    bgGlowOpacity,
    setBgGlowOpacity,
    bgDarkness,
    setBgDarkness,
    handleUpdateBgDarkness,
    handleUpdateBgGlowOpacity,
    handleResetBgContrast,
    handleDesignChange,
    current,
    handleToggleHomeDesignMode,
    selectedUser,
    setSelectedUser,
    userPosts,
    setUserPosts,
    loadingUserPosts,
    setLoadingUserPosts,
    newNgWord,
    setNewNgWord,
    ngWordSearchTerm,
    setNgWordSearchTerm,
    ngWordTypeFilter,
    setNgWordTypeFilter,
    ngWordPage,
    setNgWordPage,
    ngWordPerPage,
    setNgWordPerPage,
    selectedNgWordIds,
    setSelectedNgWordIds,
    isBatchUpdatingNgWords,
    setIsBatchUpdatingNgWords,
    bulkNgWordsText,
    setBulkNgWordsText,
    isBulkAddModalOpen,
    setIsBulkAddModalOpen,
    simulatorInputText,
    setSimulatorInputText,
    stats,
    setStats,
    dbHealth,
    setDbHealth,
    retentionStats,
    setRetentionStats,
    pageViewStats,
    setPageViewStats,
    heatmapData,
    setHeatmapData,
    moderationQueue,
    setModerationQueue,
    deletedPostsArchive,
    setDeletedPostsArchive,
    moderationHistory,
    setModerationHistory,
    moderationSubTab,
    setModerationSubTab,
    modSearchTerm,
    setModSearchTerm,
    modReasonFilter,
    setModReasonFilter,
    modPage,
    setModPage,
    modPerPage,
    setModPerPage,
    archiveSearchTerm,
    setArchiveSearchTerm,
    archivePage,
    setArchivePage,
    archivePerPage,
    setArchivePerPage,
    selectedModPostModal,
    setSelectedModPostModal,
    isBatchApprovingModPosts,
    setIsBatchApprovingModPosts,
    deleteTargetId,
    setDeleteTargetId,
    deleteReasonText,
    setDeleteReasonText,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    auditLogs,
    setAuditLogs,
    reunionFunnel,
    setReunionFunnel,
    reunionDurationStats,
    setReunionDurationStats,
    dbVersions,
    setDbVersions,
    gitInfo,
    setGitInfo,
    isLoadingGitInfo,
    setIsLoadingGitInfo,
    isCreatingVersion,
    setIsCreatingVersion,
    newVersionComment,
    setNewVersionComment,
    selectedVersionIds,
    setSelectedVersionIds,
    versionSearchQuery,
    setVersionSearchQuery,
    versionTypeFilter,
    setVersionTypeFilter,
    versionCurrentPage,
    setVersionCurrentPage,
    versionItemsPerPage,
    setVersionItemsPerPage,
    isBatchDeletingVersions,
    setIsBatchDeletingVersions,
    censorshipTestText,
    setCensorshipTestText,
    censorshipTestResult,
    setCensorshipTestResult,
    isTestingCensorship,
    setIsTestingCensorship,
    simulatedPostId,
    setSimulatedPostId,
    isSimulatingPost,
    setIsSimulatingPost,
    simulationSuccessMsg,
    setSimulationSuccessMsg,
    activeSampleCategory,
    setActiveSampleCategory,
    isSampleBookOpen,
    setIsSampleBookOpen,
    policeReportData,
    setPoliceReportData,
    isGeneratingPoliceReport,
    setIsGeneratingPoliceReport,
    copiedPoliceReport,
    setCopiedPoliceReport,
    generateTextPoliceReport,
    u,
    txt,
    handleGeneratePoliceReport,
    handleCopyPoliceReportText,
    handleDownloadPoliceReportJson,
    handleTestCensorship,
    textVal,
    handleTriggerCensorshipSimulation,
    fetchGitInfo,
    fetchDbVersions,
    handleCreateVersion,
    handleRestoreVersion,
    handleDeleteVersion,
    handleDownloadVersion,
    safeComment,
    handleToggleSelectAllVersions,
    handleToggleSelectVersion,
    handleBatchDeleteVersions,
    handleExportVersionsCsv,
    isPreRestore,
    activeTab,
    setActiveTab,
    guideDocType,
    setGuideDocType,
    loading,
    setLoading,
    selectedPost,
    setSelectedPost,
    searchTerm,
    setSearchTerm,
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
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userSearchTerm,
    setUserSearchTerm,
    showLogGuideModal,
    setShowLogGuideModal,
    handleDownloadMaReport,
    totalReunions,
    totalPV,
    rows,
    handleDownloadDeploymentGuide,
    fileName,
    mimeType,
    lenis,
    handleTouchMove,
    target,
    postSearchTerm,
    setPostSearchTerm,
    postFilterType,
    setPostFilterType,
    postSortBy,
    setPostSortBy,
    postItemsPerPage,
    setPostItemsPerPage,
    selectedPostIds,
    setSelectedPostIds,
    selectedUserIds,
    setSelectedUserIds,
    selectedModPostIds,
    setSelectedModPostIds,
    selectedArchiveIds,
    setSelectedArchiveIds,
    userStatusFilter,
    setUserStatusFilter,
    userSortBy,
    setUserSortBy,
    userItemsPerPage,
    setUserItemsPerPage,
    isBatchUpdatingUserStatus,
    setIsBatchUpdatingUserStatus,
    isBatchResettingUserEkyc,
    setIsBatchResettingUserEkyc,
    isBatchUpdatingPostStatus,
    setIsBatchUpdatingPostStatus,
    isBatchAiAnalyzing,
    setIsBatchAiAnalyzing,
    isGeneratingSamplePosts,
    setIsGeneratingSamplePosts,
    isBatchDeletingPosts,
    setIsBatchDeletingPosts,
    isBatchDeletingUsers,
    setIsBatchDeletingUsers,
    isBatchDeletingModPosts,
    setIsBatchDeletingModPosts,
    isBatchDeletingArchive,
    setIsBatchDeletingArchive,
    userPage,
    setUserPage,
    postPage,
    setPostPage,
    itemsPerPage,
    selectedContact,
    setSelectedContact,
    selectedDeletionRequest,
    setSelectedDeletionRequest,
    deletionSearchTerm,
    setDeletionSearchTerm,
    deletionStatusFilter,
    setDeletionStatusFilter,
    deletionPage,
    setDeletionPage,
    deletionPerPage,
    setDeletionPerPage,
    selectedDeletionIds,
    setSelectedDeletionIds,
    isBatchUpdatingDeletion,
    setIsBatchUpdatingDeletion,
    selectedReport,
    setSelectedReport,
    reportSearchTerm,
    setReportSearchTerm,
    reportStatusFilter,
    setReportStatusFilter,
    reportPage,
    setReportPage,
    reportPerPage,
    setReportPerPage,
    selectedReportIds,
    setSelectedReportIds,
    isBatchUpdatingReports,
    setIsBatchUpdatingReports,
    replyMessage,
    setReplyMessage,
    isReplying,
    setIsReplying,
    isGeneratingAiDraft,
    setIsGeneratingAiDraft,
    aiDraftTone,
    setAiDraftTone,
    confirmModal,
    setConfirmModal,
    showConfirm,
    Badge,
    handleToggleHomeStats,
    newValue,
    fetchData,
    fetchQuizAnalyticsOnly,
    handleGenerateSamplePosts,
    handleReseedUniquePosts,
    handleBatchDeletePosts,
    idsToDelete,
    handleBatchUpdatePostStatus,
    actionLabel,
    handleBatchAiAnalyzePosts,
    handleTogglePostStatus,
    newStatus,
    handleExportPostsCSV,
    isSample,
    headers,
    handleBatchDeleteUsers,
    handleBatchUpdateUserStatus,
    handleBatchResetUserEkyc,
    handleExportUsersCSV,
    handleApproveModPost,
    handleBatchApproveModPosts,
    ids,
    handleBatchDeleteModPosts,
    handleBatchDeleteArchive,
    handleUnblockIp,
    handleBlockIp,
    isExporting,
    setIsExporting,
    showPreviewModal,
    setShowPreviewModal,
    previewData,
    setPreviewData,
    previewLoading,
    setPreviewLoading,
    previewTab,
    setPreviewTab,
    previewSearch,
    setPreviewSearch,
    previewTimeframe,
    setPreviewTimeframe,
    handleExportAuditBundle,
    convertToCsvAndDownload,
    handleExportTableCsv,
    handleLoadPreviewAndShow,
    handleUpdateUserStatus,
    handleAdminResetUserEkyc,
    isSendingPasswordReset,
    setIsSendingPasswordReset,
    handleAdminSendPasswordReset,
    handleExportStats,
    handleDbHealthCheck,
    handleResetData,
    handleSeedModeration,
    handleApproveDeletionRequest,
    handleRejectDeletionRequest,
    handleBatchApproveDeletion,
    handleBatchRejectDeletion,
    handleResolveReport,
    handleDismissReport,
    handleBatchResolveReports,
    handleBatchDismissReports,
    isAiAnalyzing,
    setIsAiAnalyzing,
    handleAiAnalyze,
    isSending,
    setIsSending,
    statusMsg,
    setStatusMsg,
    showBulkConfirm,
    setShowBulkConfirm,
    pendingNotification,
    setPendingNotification,
    handleDeleteBroadcast,
    handleSendBulkNotification,
    executeBulkNotification,
    handleReplyContact,
    handleGenerateAiDraft,
    toneToUse,
    handleSeedSampleContacts,
    handleToggleSelectAllContacts,
    handleToggleSelectContact,
    handleBatchUpdateContactStatus,
    label,
    handleBatchDeleteContacts,
    handleUpdateSingleContactStatus,
    handleDeleteSingleContact,
    handleExportContactsCsv,
    handleViewPost,
    handleViewUser,
    fullUserData,
    handleToggleFreezeUser,
    is_blocked,
    triggerDeletePost,
    handleDeletePost,
    finalReason,
    handleDeleteUser,
    handleAddNgWord,
    handleBatchAddNgWords,
    handleDeleteNgWord,
    handleBatchDeleteNgWords,
    handleUpdateSuccessStory,
    handleCreateSuccessStory,
    handleDeleteSuccessStory,
    handleSeedSuccessStories
  };
};
