import React, { useState, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Key, Lock, Unlock, Mail, Clock, Download, RefreshCw,
  Search, Filter, Plus, Trash2, Eye, CheckCircle2, XCircle, AlertTriangle,
  FileText, ExternalLink, HelpCircle, UserCheck, Check, Sparkles,
  Award, Heart, Calendar, Building, MapPin, Tag, Briefcase, FileCode, CheckSquare,
  Layers, Settings, ChevronLeft, ChevronRight, BarChart2, Users, FileCheck, DollarSign,
  ShieldCheck, Menu, X, Radio, Activity, Brain, ShieldAlert, Bot, Bell, Terminal,
  History, CreditCard, Image as ImageIcon, Palette, Rocket, BookOpen, ArrowLeft,
  User as UserIcon, LogOut
} from "lucide-react";
import { BottleLoader } from "../../components/SharedComponents";
import { cn, getPostUrl } from "../../lib/utils";
import { useAdminDashboardState } from "./hooks/useAdminDashboardState";
import { AdminSettingsTab } from "./tabs/AdminSettingsTab";
import {
  AdminUsersTab,
  AdminPostsTab,
  AdminReportsTab,
  AdminDeletionTab,
  AdminAgeVerificationTab,
  AdminContactsTab,
  AdminSuccessStoriesTab,
  AdminNgWordsTab,
  AdminVersionsTab,
  AdminAssetCleanerTab,
  AdminPoliceConsultationTab,
  AdminStatsTab,
  AdminModerationTab
} from "./tabs";
import { AdminLiveAlertMonitor } from "../../components/AdminLiveAlertMonitor";
import { QuizMatchingAnalyticsView } from "../../components/QuizMatchingAnalyticsView";
import { AdminMasterKnowledgeBase } from "../../components/AdminMasterKnowledgeBase";
import { AdminDeploymentGuideBlock } from "../../components/AdminDeploymentGuideBlock";
import { AdminPaymentManagementBlock } from "../../components/AdminPaymentManagementBlock";
import { AdminMonetizationBlock } from "../../components/AdminMonetizationBlock";
import { AdminSecurityCenterView } from "../../components/AdminSecurityCenterView";
import { AdminLogsView } from "../../components/AdminLogsView";
import { AdminEmailTemplatesView } from "../../components/AdminEmailTemplatesView";
import { AdminBroadcastView } from "../../components/AdminBroadcastView";
import { AdminSystemCenterView } from "../../components/AdminSystemCenterView";
import { AdminManualView } from "../../components/AdminManualView";
import { AdminDesignSystem } from "../../components/AdminDesignSystem";
import { MaValuationDataRoomView } from "../../components/MaValuationDataRoomView";
import { AdminRbacView } from "../../components/AdminRbacView";
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
} from "./modals";
import { AdminInfoPage, SitemapPage, ContactPage, ConfirmModal, AuroraAmbientGlow, PageViewTracker } from "./AdminSharedPages";
import { samplePhrasesCategories } from "./AdminPhrases";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const state = useAdminDashboardState();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const Badge = ({ count }: { count?: number }) => {
    if (!count || count <= 0) return null;
    return (
      <span className={cn(
        "ml-auto bg-red-500 text-white text-[10px] font-serif font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
        isSidebarCollapsed && !state.isMobileMenuOpen ? "absolute -top-1 -right-1" : ""
      )}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const {
    user,
    updateUser,
    token,
    logout,
    authLoading,
    isAllowedAdminRole,
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    loading,
    statusMsg,
    setStatusMsg,
    guideDocType,
    setGuideDocType,
    fetchData,
    handleResetData,
    handleDownloadMaReport,
    stats,
    posts,
    users,
    contacts,
    reports,
    deletionRequests,
    ngWords,
    successStories,
    moderationQueue,
    moderationHistory,
    setModerationHistory,
    deletedPostsArchive,
    selectedArchiveIds,
    setSelectedArchiveIds,
    handleBatchDeleteArchive,
    isBatchDeletingArchive,
    archivePerPage,
    setArchivePerPage,
    setArchivePage,
    archivePage,
    moderationSubTab,
    setModerationSubTab,
    modReasonFilter,
    setModReasonFilter,
    modSearchTerm,
    setModSearchTerm,
    modPerPage,
    setModPerPage,
    modPage,
    setModPage,
    selectedModPostIds,
    setSelectedModPostIds,
    handleBatchApproveModPosts,
    isBatchApprovingModPosts,
    handleBatchDeleteModPosts,
    isBatchDeletingModPosts,
    censorshipTestText,
    setCensorshipTestText,
    censorshipTestResult,
    setCensorshipTestResult,
    isTestingCensorship,
    handleTestCensorship,
    auditLogs,
    actionLogs,
    accessLogs,
    securityLogs,
    ageVerificationLogs,
    blockedIps,
    dbHealth,
    realtimeTelemetry,
    quizMatchingAnalytics,
    userStatusFilter,
    setUserStatusFilter,
    userSearchTerm,
    setUserSearchTerm,
    userSortBy,
    setUserSortBy,
    selectedUserIds,
    setSelectedUserIds,
    userPage,
    setUserPage,
    userItemsPerPage,
    setUserItemsPerPage,
    handleBatchUpdateUserStatus,
    isBatchUpdatingUserStatus,
    handleBatchResetUserEkyc,
    isBatchResettingUserEkyc,
    handleBatchDeleteUsers,
    isBatchDeletingUsers,
    handleDeleteUser,
    handleExportUsersCSV,
    postFilterType,
    setPostFilterType,
    postSearchTerm,
    setPostSearchTerm,
    postSortBy,
    setPostSortBy,
    selectedPostIds,
    setSelectedPostIds,
    postPage,
    setPostPage,
    postItemsPerPage,
    setPostItemsPerPage,
    handleExportPostsCSV,
    handleGenerateSamplePosts,
    handleReseedUniquePosts,
    isGeneratingSamplePosts,
    handleBatchAiAnalyzePosts,
    isBatchAiAnalyzing,
    handleBatchUpdatePostStatus,
    isBatchUpdatingPostStatus,
    handleBatchDeletePosts,
    isBatchDeletingPosts,
    handleTogglePostStatus,
    selectedContact,
    setSelectedContact,
    replyMessage,
    setReplyMessage,
    handleReplyContact,
    isReplying,
    handleGenerateAiDraft,
    isGeneratingAiDraft,
    aiDraftTone,
    setAiDraftTone,
    contactCategoryFilter,
    setContactCategoryFilter,
    selectedContactIds,
    setSelectedContactIds,
    handleBatchUpdateContactStatus,
    isBatchProcessingContacts,
    handleBatchDeleteContacts,
    handleToggleSelectAllContacts,
    handleToggleSelectContact,
    handleUpdateSingleContactStatus,
    handleDeleteSingleContact,
    contactStatusFilter,
    setContactStatusFilter,
    contactSearchQuery,
    setContactSearchQuery,
    contactSortBy,
    setContactSortBy,
    contactCurrentPage,
    setContactCurrentPage,
    contactItemsPerPage,
    setContactItemsPerPage,
    handleSeedSampleContacts,
    isSeedingContacts,
    handleExportContactsCsv,
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
    editingStoryId,
    setEditingStoryId,
    handleCreateSuccessStory,
    handleUpdateSuccessStory,
    handleDeleteSuccessStory,
    handleSeedSuccessStories,
    ageTabFilter,
    setAgeTabFilter,
    ageSearchTerm,
    setAgeSearchTerm,
    ageFilterStartDate,
    setAgeFilterStartDate,
    ageFilterEndDate,
    setAgeFilterEndDate,
    agePage,
    setAgePage,
    agePerPage,
    setAgePerPage,
    isTelemetryExpanded,
    setIsTelemetryExpanded,
    deletionStatusFilter,
    setDeletionStatusFilter,
    deletionPage,
    setDeletionPage,
    deletionPerPage,
    setDeletionPerPage,
    deletionSearchTerm,
    setDeletionSearchTerm,
    selectedDeletionIds,
    setSelectedDeletionIds,
    handleBatchApproveDeletion,
    isBatchUpdatingDeletion,
    handleBatchRejectDeletion,
    selectedDeletionRequest,
    setSelectedDeletionRequest,
    handleApproveDeletionRequest,
    handleRejectDeletionRequest,
    reportStatusFilter,
    setReportStatusFilter,
    reportSearchTerm,
    setReportSearchTerm,
    reportPage,
    setReportPage,
    reportPerPage,
    setReportPerPage,
    selectedReportIds,
    setSelectedReportIds,
    handleBatchResolveReports,
    isBatchUpdatingReports,
    handleBatchDismissReports,
    handleDismissReport,
    handleResolveReport,
    selectedReport,
    setSelectedReport,
    newNgWord,
    setNewNgWord,
    handleAddNgWord,
    handleDeleteNgWord,
    handleBatchAddNgWords,
    simulatorInputText,
    setSimulatorInputText,
    ngWordTypeFilter,
    setNgWordTypeFilter,
    ngWordPage,
    setNgWordPage,
    ngWordPerPage,
    setNgWordPerPage,
    ngWordSearchTerm,
    setNgWordSearchTerm,
    selectedNgWordIds,
    setSelectedNgWordIds,
    handleBatchDeleteNgWords,
    isBatchUpdatingNgWords,
    isBulkAddModalOpen,
    setIsBulkAddModalOpen,
    bulkNgWordsText,
    setBulkNgWordsText,
    dbVersions,
    gitInfo,
    newVersionComment,
    setNewVersionComment,
    handleCreateVersion,
    fetchGitInfo,
    fetchDbVersions,
    isLoadingGitInfo,
    handleExportVersionsCsv,
    isCreatingVersion,
    versionTypeFilter,
    setVersionTypeFilter,
    versionCurrentPage,
    setVersionCurrentPage,
    versionItemsPerPage,
    setVersionItemsPerPage,
    versionSearchQuery,
    setVersionSearchQuery,
    selectedVersionIds,
    setSelectedVersionIds,
    handleBatchDeleteVersions,
    isBatchDeletingVersions,
    handleToggleSelectAllVersions,
    handleToggleSelectVersion,
    handleRestoreVersion,
    handleDownloadVersion,
    handleDeleteVersion,
    handleViewUser,
    handleUpdateUserStatus,
    triggerDeletePost,
    showBulkConfirm,
    setShowBulkConfirm,
    pendingNotification,
    executeBulkNotification,
    confirmModal,
    setConfirmModal,
    handleDownloadPoliceReportJson,
    handleCopyPoliceReportText,
    copiedPoliceReport,
    handleGeneratePoliceReport,
    isGeneratingPoliceReport,
    handleAdminResetUserEkyc,
    handleAdminSendPasswordReset,
    isSendingPasswordReset,
    loadingUserPosts,
    userPosts,
    handleViewPost,
    selectedUser,
    setSelectedUser,
    selectedPost,
    setSelectedPost,
    selectedAgeLogModal,
    setSelectedAgeLogModal,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deleteTargetId,
    setDeleteTargetId,
    deleteReasonText,
    setDeleteReasonText,
    handleDeletePost,
    handleAiAnalyze,
    isAiAnalyzing,
    selectedModPostModal,
    setSelectedModPostModal,
    handleApproveModPost,
    handleToggleFreezeUser,
    archiveSearchTerm,
    setArchiveSearchTerm,
    handleSeedModeration,
    policeReportData,
    setPoliceReportData,
    homeDesignMode,
    handleToggleHomeDesignMode,
    bgDarkness,
    handleUpdateBgDarkness,
    bgGlowOpacity,
    handleUpdateBgGlowOpacity,
    handleResetBgContrast,
    tabs
  } = state as any;

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
    onClick?: () => void;
  }

  const navCategories: { title: string; items: NavItem[] }[] = useMemo(() => [
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
        { id: 'moderation', label: 'AI検知キュー', icon: Bot, badge: (posts || []).filter((p: any) => p.ai_flagged === 1).length },
        { id: 'reports', label: 'ユーザー通報', icon: AlertTriangle, badge: (reports || []).filter((r: any) => r.status === 'pending').length },
        { id: 'deletion', label: '削除依頼', icon: Trash2, badge: (deletionRequests || []).filter((r: any) => r.status === 'pending').length },
        { id: 'ngWords', label: 'NGワード', icon: Shield },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'rbac', label: '管理者権限・ロール (RBAC)', icon: ShieldCheck },
        { id: 'contacts', label: 'お問い合わせ', icon: Mail, badge: (contacts || []).filter((c: any) => c.status === 'pending').length },
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
  ], [posts, reports, deletionRequests, contacts, navigate, logout, setActiveTab, setGuideDocType]);

  const filteredCategories = useMemo(() => {
    return navCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [navCategories, searchTerm]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-light/50 backdrop-blur-sm">
        <BottleLoader />
      </div>
    );
  }

  if (!isAllowedAdminRole) {
    return <Navigate to="/" />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative overflow-visible">
      <div className="flex flex-col gap-6 mb-6">
        <div className="space-y-6">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4 mb-4 md:mb-8 border-b border-brand-border pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
              <Shield size={26} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] font-sans whitespace-nowrap">Admin Control Center</span>
                {user?.role === 'super_admin' || user?.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">👑 統括最高管理者</span>
                ) : user?.role === 'moderator' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🛡️ モデレーター</span>
                ) : user?.role === 'cs_support' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">🎧 CSサポート</span>
                ) : user?.role === 'auditor' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">⚖️ 監査・法務担当</span>
                ) : null}
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight truncate">管理者ダッシュボード</h1>
              <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-0.5 hidden md:block">
                会員、投函ボトル、決済トランザクション、eKYC申請及び監査ログを一元管理・監視します。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/home-designs"
                className="px-3 py-2 md:px-4 md:py-2.5 text-xs font-bold rounded-xl border bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <Sparkles size={14} className="text-indigo-600" />
                <span className="hidden sm:inline">🎨 HOMEデザイン比較</span>
                <span className="sm:hidden">デザイン比較</span>
              </Link>
              <button
                onClick={() => setActiveTab('rbac')}
                className={`px-3 py-2 md:px-4 md:py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap ${
                  activeTab === 'rbac'
                    ? 'bg-purple-600 text-white border-purple-700'
                    : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                }`}
              >
                <ShieldCheck size={14} />
                <span className="hidden sm:inline">ロール権限 (RBAC)</span>
                <span className="sm:hidden">RBAC</span>
              </button>
              <button 
                onClick={handleResetData}
                className="px-3.5 py-2 md:px-5 md:py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold rounded-xl border border-rose-300 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs hover:shadow cursor-pointer whitespace-nowrap"
                title="全データを初期化し、全問ユニークな質問と答えのサンプルデータを再生成"
              >
                <RefreshCw size={14} className="text-rose-600 hover:text-white" />
                <span className="hidden sm:inline">サンプルデータをリセット</span>
                <span className="sm:hidden">リセット</span>
              </button>
            </div>
          </div>
        </div>
      </div>
        
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-3 bg-brand-dark text-white rounded-2xl shadow-lg flex items-center gap-3"
          >
            <Menu size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">メニューを開く</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-light/50 rounded-xl border border-brand-border">
            <Search size={14} className="text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-24"
            />
          </div>
        </div>

        {/* Sidebar Navigation */}
        <aside 
          className={cn(
            "hidden md:block shrink-0 transition-all duration-500 ease-in-out z-20 md:sticky md:top-6 self-start",
            isSidebarCollapsed ? "w-20" : "w-72"
          )}
        >
          <div className="flex flex-col gap-4">
            {/* Sidebar Header & Search - Fixed at top */}
            <div className="px-2 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                {!isSidebarCollapsed && (
                  <h2 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] ml-2">Navigation</h2>
                )}
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 hover:bg-brand-dark/5 rounded-xl text-black/40 hover:text-black transition-colors"
                >
                  {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
              </div>

              {!isSidebarCollapsed && (
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-brand-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="メニューを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-brand-border rounded-2xl text-sm outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-black placeholder:text-black/30"
                  />
                </div>
              )}
            </div>

            {/* Categories List */}
            <div className="space-y-6 select-none">
              {filteredCategories.map((category) => (
                <div key={category.title} className="space-y-2 px-2">
                  {!isSidebarCollapsed && (
                    <h2 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] ml-2">{category.title}</h2>
                  )}
                  <nav className="space-y-1">
                    {category.items.map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => {
                          if (tab.onClick) {
                            tab.onClick();
                          } else {
                            setActiveTab(tab.id as any);
                          }
                        }}
                        title={isSidebarCollapsed ? tab.label : undefined}
                        className={cn(
                          "w-full flex items-center gap-4 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-300 relative",
                          activeTab === tab.id 
                            ? "bg-brand-dark text-white shadow-xl shadow-brand-dark/20 translate-x-2" 
                            : "text-black/60 hover:text-black hover:bg-brand-primary/5",
                          isSidebarCollapsed ? "justify-center px-0 translate-x-0" : ""
                        )}
                      >
                        <tab.icon size={20} className={activeTab === tab.id ? 'text-brand-accent' : ''} />
                        {!isSidebarCollapsed && <span className="whitespace-pre-line text-left leading-snug">{tab.label}</span>}
                        {tab.badge !== undefined && <Badge count={tab.badge} />}
                      </button>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                data-lenis-prevent
                className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[110] md:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                data-lenis-prevent
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-brand-light z-[120] md:hidden shadow-2xl flex flex-col pointer-events-auto h-[100dvh]"
              >
                <div className="p-8 border-b border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-serif text-black">Admin Menu</h2>
                      <p className="text-[10px] text-black/40 uppercase tracking-widest">ReMEETs Dashboard</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-brand-dark/5 rounded-full text-black"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div 
                  data-lenis-prevent 
                  className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-24 overscroll-contain"
                  style={{ touchAction: 'pan-y', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                    <input 
                      type="text" 
                      placeholder="メニューを検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-brand-border rounded-2xl text-sm outline-none focus:border-brand-primary text-black placeholder:text-black/30"
                    />
                  </div>

                  {filteredCategories.map((category) => (
                    <div key={category.title} className="space-y-2">
                      <h2 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] ml-2">{category.title}</h2>
                      <nav className="space-y-1">
                        {category.items.map((tab) => (
                          <button 
                            key={tab.id}
                            onClick={() => {
                              if (tab.onClick) {
                                tab.onClick();
                              } else {
                                setActiveTab(tab.id as any);
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-300",
                              activeTab === tab.id 
                                ? "bg-brand-dark text-white shadow-xl shadow-brand-dark/20" 
                                : "text-black/60 hover:text-black hover:bg-brand-primary/5"
                            )}
                          >
                            <tab.icon size={20} className={activeTab === tab.id ? 'text-brand-accent' : ''} />
                            <span className="whitespace-pre-line text-left leading-snug">{tab.label}</span>
                            {tab.badge !== undefined && <Badge count={tab.badge} />}
                          </button>
                        ))}
                      </nav>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area (Expands fully down to footer) */}
        <main 
          className="flex-1 min-w-0 pr-2" 
        >
          {loading ? (
            <div className="flex justify-center py-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}
            >
              {statusMsg && (
                <div className={cn(
                  "p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 sticky top-4 z-50 shadow-lg",
                  statusMsg.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                  {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  <p className="text-sm font-bold">{statusMsg.text}</p>
                </div>
              )}

          {activeTab === 'rbac' && (
            <AdminRbacView
              token={token}
              currentRole={user?.role || 'user'}
              onRoleSwitched={(newToken, newRole) => {
                if (user) {
                  updateUser({ role: newRole });
                }
              }}
            />
          )}

          {activeTab === 'liveAlerts' && (
            <AdminLiveAlertMonitor token={token} onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === "successStories" && (
            <AdminSuccessStoriesTab
              successStories={successStories}
              token={token}
              storyCategoryFilter={storyCategoryFilter}
              setStoryCategoryFilter={setStoryCategoryFilter}
              storyPage={storyPage}
              setStoryPage={setStoryPage}
              storyPerPage={storyPerPage}
              setStoryPerPage={setStoryPerPage}
              editStoryForm={editStoryForm}
              setEditStoryForm={setEditStoryForm}
              isCreatingStory={isCreatingStory}
              setIsCreatingStory={setIsCreatingStory}
              newStoryForm={newStoryForm}
              setNewStoryForm={setNewStoryForm}
              editingStoryId={editingStoryId}
              setEditingStoryId={setEditingStoryId}
              handleCreateSuccessStory={handleCreateSuccessStory}
              handleUpdateSuccessStory={handleUpdateSuccessStory}
              handleDeleteSuccessStory={handleDeleteSuccessStory}
              handleSeedSuccessStories={handleSeedSuccessStories}
              loading={loading}
              loadSuccessStories={fetchData}
            />
          )}

          {activeTab === 'quizAnalytics' && (
            <div className="space-y-8">
              <QuizMatchingAnalyticsView 
                data={quizMatchingAnalytics} 
                onRefresh={fetchData} 
                isLoading={loading} 
              />
            </div>
          )}

          {activeTab === "stats" && (
            <AdminStatsTab
              stats={stats}
              reports={reports}
              contacts={contacts}
              ageVerificationLogs={ageVerificationLogs}
              users={users}
              posts={posts}
              successStories={successStories}
              accessLogs={accessLogs}
              handleViewPost={handleViewPost}
              setActiveTab={setActiveTab}
              token={token}
            />
          )}

          {activeTab === 'assetCleaner' && (
            <AdminAssetCleanerTab />
          )}

          {activeTab === 'policeConsultation' && (
            <AdminPoliceConsultationTab />
          )}

          {activeTab === "settings" ? (
            <AdminSettingsTab
              adminHomeDesign={homeDesignMode}
              setAdminHomeDesign={(mode: any) => handleToggleHomeDesignMode(mode)}
              bgGlowOpacity={bgGlowOpacity}
              handleUpdateBgGlowOpacity={handleUpdateBgGlowOpacity}
              handleResetBgContrast={handleResetBgContrast}
            />) : activeTab === 'masterMemo' ? (
            <AdminMasterKnowledgeBase initialViewMode="master_memo" modeTitle="運営方針・意思決定備忘録" hideViewModeSwitcher={true} guideDocType={guideDocType} setGuideDocType={setGuideDocType} />
          ) : activeTab === 'deployment' ? (
            <AdminMasterKnowledgeBase initialViewMode="legal_docs" modeTitle="本番デプロイ・広報ライブラリ" hideViewModeSwitcher={false} guideDocType={guideDocType} setGuideDocType={setGuideDocType} />
          ) : activeTab === 'payments' ? (
            <AdminPaymentManagementBlock />
          ) : activeTab === 'monetization' ? (
            <AdminMonetizationBlock />
          ) : activeTab === "users" ? (
            <AdminUsersTab
              users={users}
              userRoleFilter="all"
              setUserRoleFilter={() => {}}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={setUserStatusFilter}
              userSearchTerm={userSearchTerm}
              setUserSearchTerm={setUserSearchTerm}
              userSortBy={userSortBy}
              setUserSortBy={setUserSortBy}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              userPage={userPage}
              setUserPage={setUserPage}
              userItemsPerPage={userItemsPerPage}
              setUserItemsPerPage={setUserItemsPerPage}
              handleBatchUpdateUserStatus={handleBatchUpdateUserStatus}
              isBatchUpdatingUserStatus={isBatchUpdatingUserStatus}
              handleBatchResetUserEkyc={handleBatchResetUserEkyc}
              isBatchResettingUserEkyc={isBatchResettingUserEkyc}
              handleBatchDeleteUsers={handleBatchDeleteUsers}
              isBatchDeletingUsers={isBatchDeletingUsers}
              handleViewUser={handleViewUser}
              handleGeneratePoliceReport={handleGeneratePoliceReport}
              handleAdminResetUserEkyc={handleAdminResetUserEkyc}
              handleUpdateUserStatus={handleUpdateUserStatus}
              handleDeleteUser={handleDeleteUser}
              handleExportUsersCSV={handleExportUsersCSV}
              setSelectedUser={setSelectedUser}
              selectedUser={selectedUser}
            />
          ) : activeTab === "posts" ? (
            <AdminPostsTab
              posts={posts}
              postFilterType={postFilterType}
              setPostFilterType={setPostFilterType}
              postSearchTerm={postSearchTerm}
              setPostSearchTerm={setPostSearchTerm}
              postSortBy={postSortBy}
              setPostSortBy={setPostSortBy}
              selectedPostIds={selectedPostIds}
              setSelectedPostIds={setSelectedPostIds}
              postPage={postPage}
              setPostPage={setPostPage}
              postItemsPerPage={postItemsPerPage}
              setPostItemsPerPage={setPostItemsPerPage}
              setSelectedPost={setSelectedPost}
              selectedPost={selectedPost}
              handleExportPostsCSV={handleExportPostsCSV}
              handleGenerateSamplePosts={handleGenerateSamplePosts}
              handleReseedUniquePosts={handleReseedUniquePosts}
              isGeneratingSamplePosts={isGeneratingSamplePosts}
              handleBatchAiAnalyzePosts={handleBatchAiAnalyzePosts}
              isBatchAiAnalyzing={isBatchAiAnalyzing}
              handleBatchUpdatePostStatus={handleBatchUpdatePostStatus}
              isBatchUpdatingPostStatus={isBatchUpdatingPostStatus}
              handleBatchDeletePosts={handleBatchDeletePosts}
              isBatchDeletingPosts={isBatchDeletingPosts}
              handleViewPost={handleViewPost}
              handleAiAnalyze={handleAiAnalyze}
              isAiAnalyzing={isAiAnalyzing}
              handleTogglePostStatus={handleTogglePostStatus}
              handleGeneratePoliceReport={handleGeneratePoliceReport}
              handleAdminResetUserEkyc={handleAdminResetUserEkyc}
              triggerDeletePost={triggerDeletePost}
            />
          ) : activeTab === 'security' ? (
            <AdminSecurityCenterView
              token={token}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'logs' ? (
            <AdminLogsView
              auditLogs={auditLogs}
              actionLogs={actionLogs}
              accessLogs={accessLogs}
              onRefresh={fetchData}
              loading={loading}
            />
          ) : activeTab === "ageVerification" ? (
            <AdminAgeVerificationTab
              ageVerificationLogs={ageVerificationLogs}
              ageTabFilter={ageTabFilter}
              setAgeTabFilter={setAgeTabFilter}
              ageSearchTerm={ageSearchTerm}
              setAgeSearchTerm={setAgeSearchTerm}
              ageFilterStartDate={ageFilterStartDate}
              setAgeFilterStartDate={setAgeFilterStartDate}
              ageFilterEndDate={ageFilterEndDate}
              setAgeFilterEndDate={setAgeFilterEndDate}
              agePage={agePage}
              setAgePage={setAgePage}
              agePerPage={agePerPage}
              setAgePerPage={setAgePerPage}
              handleViewUser={handleViewUser}
              setActiveTab={setActiveTab}
              setSelectedAgeLogModal={setSelectedAgeLogModal}
              isTelemetryExpanded={isTelemetryExpanded}
              setIsTelemetryExpanded={setIsTelemetryExpanded}
              fetchData={fetchData}
            />
          ) : activeTab === "deletion" ? (
            <AdminDeletionTab
              deletionRequests={deletionRequests}
              deletionStatusFilter={deletionStatusFilter}
              setDeletionStatusFilter={setDeletionStatusFilter}
              deletionPage={deletionPage}
              setDeletionPage={setDeletionPage}
              deletionPerPage={deletionPerPage}
              setDeletionPerPage={setDeletionPerPage}
              deletionSearchTerm={deletionSearchTerm}
              setDeletionSearchTerm={setDeletionSearchTerm}
              selectedDeletionIds={selectedDeletionIds}
              setSelectedDeletionIds={setSelectedDeletionIds}
              handleBatchApproveDeletion={handleBatchApproveDeletion}
              isBatchUpdatingDeletion={isBatchUpdatingDeletion}
              handleBatchRejectDeletion={handleBatchRejectDeletion}
              handleViewUser={handleViewUser}
              setActiveTab={setActiveTab}
              handleApproveDeletionRequest={handleApproveDeletionRequest}
              setSelectedDeletionRequest={setSelectedDeletionRequest}
              handleRejectDeletionRequest={handleRejectDeletionRequest}
              token={token}
              fetchData={fetchData}
            />
          ) : activeTab === "reports" ? (
            <AdminReportsTab
              reports={reports}
              reportFilter="all"
              setReportFilter={() => {}}
              reportStatusFilter={reportStatusFilter}
              setReportStatusFilter={setReportStatusFilter}
              reportSearchTerm={reportSearchTerm}
              setReportSearchTerm={setReportSearchTerm}
              reportPage={reportPage}
              setReportPage={setReportPage}
              reportPerPage={reportPerPage}
              setReportPerPage={setReportPerPage}
              selectedReportIds={selectedReportIds}
              setSelectedReportIds={setSelectedReportIds}
              handleBatchResolveReports={handleBatchResolveReports}
              isBatchUpdatingReports={isBatchUpdatingReports}
              handleBatchDismissReports={handleBatchDismissReports}
              handleResolveReport={handleResolveReport}
              handleDismissReport={handleDismissReport}
              handleToggleFreezeUser={handleToggleFreezeUser}
              handleViewUser={handleViewUser}
              setActiveTab={setActiveTab}
              setSelectedReport={setSelectedReport}
              selectedReport={selectedReport}
              token={token}
              fetchData={fetchData}
            />
          ) : activeTab === "ngWords" ? (
            <AdminNgWordsTab
              ngWords={ngWords}
              newNgWord={newNgWord}
              setNewNgWord={setNewNgWord}
              handleAddNgWord={handleAddNgWord}
              handleDeleteNgWord={handleDeleteNgWord}
              handleBatchAddNgWords={handleBatchAddNgWords}
              simulatorInputText={simulatorInputText}
              setSimulatorInputText={setSimulatorInputText}
              ngWordTypeFilter={ngWordTypeFilter}
              setNgWordTypeFilter={setNgWordTypeFilter}
              ngWordPage={ngWordPage}
              setNgWordPage={setNgWordPage}
              ngWordPerPage={ngWordPerPage}
              setNgWordPerPage={setNgWordPerPage}
              ngWordSearchTerm={ngWordSearchTerm}
              setNgWordSearchTerm={setNgWordSearchTerm}
              selectedNgWordIds={selectedNgWordIds}
              setSelectedNgWordIds={setSelectedNgWordIds}
              handleBatchDeleteNgWords={handleBatchDeleteNgWords}
              isBatchUpdatingNgWords={isBatchUpdatingNgWords}
              isBulkAddModalOpen={isBulkAddModalOpen}
              setIsBulkAddModalOpen={setIsBulkAddModalOpen}
              bulkNgWordsText={bulkNgWordsText}
              setBulkNgWordsText={setBulkNgWordsText}
              fetchData={fetchData}
            />
          ) : activeTab === "contacts" ? (
            <AdminContactsTab
              contacts={contacts}
              contactFilter="all"
              setContactFilter={() => {}}
              contactCategoryFilter={contactCategoryFilter}
              setContactCategoryFilter={setContactCategoryFilter}
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
              handleReplyContact={handleReplyContact}
              handleUpdateContactStatus={() => {}}
              replyStatus="all"
              setReplyStatus={() => {}}
              selectedContactIds={selectedContactIds}
              setSelectedContactIds={setSelectedContactIds}
              handleBatchUpdateContactStatus={handleBatchUpdateContactStatus}
              isBatchProcessingContacts={isBatchProcessingContacts}
              handleBatchDeleteContacts={handleBatchDeleteContacts}
              handleToggleSelectAllContacts={handleToggleSelectAllContacts}
              handleToggleSelectContact={handleToggleSelectContact}
              handleUpdateSingleContactStatus={handleUpdateSingleContactStatus}
              handleDeleteSingleContact={handleDeleteSingleContact}
              contactStatusFilter={contactStatusFilter}
              setContactStatusFilter={setContactStatusFilter}
              contactSearchQuery={contactSearchQuery}
              setContactSearchQuery={setContactSearchQuery}
              contactSortBy={contactSortBy}
              setContactSortBy={setContactSortBy}
              contactCurrentPage={contactCurrentPage}
              setContactCurrentPage={setContactCurrentPage}
              contactItemsPerPage={contactItemsPerPage}
              setContactItemsPerPage={setContactItemsPerPage}
              handleSeedSampleContacts={handleSeedSampleContacts}
              isSeedingContacts={isSeedingContacts}
              handleExportContactsCsv={handleExportContactsCsv}
              fetchData={fetchData}
              token={token}
            />
          ) : activeTab === 'emailTemplates' ? (
            <AdminEmailTemplatesView />
          ) : activeTab === 'notifications' ? (
            <AdminBroadcastView />
          ) : activeTab === "moderation" ? (
            <AdminModerationTab
              testPostText={censorshipTestText}
              setTestPostText={setCensorshipTestText}
              censorshipResult={censorshipTestResult}
              setCensorshipResult={setCensorshipTestResult}
              isTestingCensorship={isTestingCensorship}
              handleTestCensorship={handleTestCensorship}
              deletedPostsArchive={deletedPostsArchive}
              selectedArchiveIds={selectedArchiveIds}
              setSelectedArchiveIds={setSelectedArchiveIds}
              handleBatchDeleteArchive={handleBatchDeleteArchive}
              isBatchDeletingArchive={isBatchDeletingArchive}
              moderationHistory={moderationHistory}
              setModerationHistory={setModerationHistory}
              archivePerPage={archivePerPage}
              setArchivePerPage={setArchivePerPage}
              setArchivePage={setArchivePage}
              archivePage={archivePage}
              moderationSubTab={moderationSubTab}
              setModerationSubTab={setModerationSubTab}
              moderationQueue={moderationQueue}
              modReasonFilter={modReasonFilter}
              setModReasonFilter={setModReasonFilter}
              modSearchTerm={modSearchTerm}
              setModSearchTerm={setModSearchTerm}
              modPerPage={modPerPage}
              setModPerPage={setModPerPage}
              modPage={modPage}
              setModPage={setModPage}
              selectedModPostIds={selectedModPostIds}
              setSelectedModPostIds={setSelectedModPostIds}
              handleBatchApproveModPosts={handleBatchApproveModPosts}
              isBatchApprovingModPosts={isBatchApprovingModPosts}
              handleBatchDeleteModPosts={handleBatchDeleteModPosts}
              isBatchDeletingModPosts={isBatchDeletingModPosts}
              handleViewUser={handleViewUser}
              setActiveTab={setActiveTab}
              handleApproveModPost={handleApproveModPost}
              setSelectedModPostModal={setSelectedModPostModal}
              handleToggleFreezeUser={handleToggleFreezeUser}
              triggerDeletePost={triggerDeletePost}
              archiveSearchTerm={archiveSearchTerm}
              setArchiveSearchTerm={setArchiveSearchTerm}
              handleSeedModeration={handleSeedModeration}
              token={token}
              fetchData={fetchData}
            />
          ) : activeTab === 'system' ? (
            <AdminSystemCenterView
              token={token}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === "versions" ? (
            <AdminVersionsTab
              dbVersions={dbVersions}
              gitInfo={gitInfo}
              setStatusMsg={setStatusMsg}
              newVersionComment={newVersionComment}
              setNewVersionComment={setNewVersionComment}
              handleCreateVersion={handleCreateVersion}
              fetchGitInfo={fetchGitInfo}
              fetchDbVersions={fetchDbVersions}
              isLoadingGitInfo={isLoadingGitInfo}
              handleExportVersionsCsv={handleExportVersionsCsv}
              isCreatingVersion={isCreatingVersion}
              versionTypeFilter={versionTypeFilter}
              setVersionTypeFilter={setVersionTypeFilter}
              versionCurrentPage={versionCurrentPage}
              setVersionCurrentPage={setVersionCurrentPage}
              versionItemsPerPage={versionItemsPerPage}
              setVersionItemsPerPage={setVersionItemsPerPage}
              versionSearchQuery={versionSearchQuery}
              setVersionSearchQuery={setVersionSearchQuery}
              selectedVersionIds={selectedVersionIds}
              setSelectedVersionIds={setSelectedVersionIds}
              handleBatchDeleteVersions={handleBatchDeleteVersions}
              isBatchDeletingVersions={isBatchDeletingVersions}
              handleToggleSelectAllVersions={handleToggleSelectAllVersions}
              handleToggleSelectVersion={handleToggleSelectVersion}
              handleRestoreVersion={handleRestoreVersion}
              handleDownloadVersion={handleDownloadVersion}
              handleDeleteVersion={handleDeleteVersion}
              token={token}
            />
          ) : activeTab === 'manual' ? (
            <AdminManualView />
          ) : activeTab === 'designSystem' ? (
            <AdminDesignSystem />
          ) : activeTab === 'valuation' ? (
            <MaValuationDataRoomView
              stats={stats}
              posts={posts}
              accessLogs={accessLogs}
              onDownloadReport={handleDownloadMaReport}
              onNavigateToDocs={() => {
                setActiveTab('deployment');
                setGuideDocType('deployment');
              }}
            />
          ) : null}
        </motion.div>
      )}
        </main>
      </div>

      {/* 削除確認カスタムモーダル */}
      <AdminPostDeleteModal
        isOpen={isDeleteModalOpen && deleteTargetId !== null}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        deleteTargetId={deleteTargetId}
        deleteReasonText={deleteReasonText}
        setDeleteReasonText={setDeleteReasonText}
        handleDeletePost={handleDeletePost}
      />

      {/* メッセージ詳細モーダル */}
      <AdminPostDetailModal
        selectedPost={selectedPost}
        onClose={() => setSelectedPost(null)}
        getPostUrl={getPostUrl}
        handleAiAnalyze={handleAiAnalyze}
        isAiAnalyzing={isAiAnalyzing}
        triggerDeletePost={triggerDeletePost}
      />

      {/* AI検知ボトル プレビューモーダル */}
      <AdminModPostPreviewModal
        selectedModPostModal={selectedModPostModal}
        onClose={() => setSelectedModPostModal(null)}
        handleApproveModPost={handleApproveModPost}
        triggerDeletePost={triggerDeletePost}
      />

      {/* eKYC監査ログ詳細モーダル */}
      <AdminAgeLogModal
        selectedAgeLogModal={selectedAgeLogModal}
        onClose={() => setSelectedAgeLogModal(null)}
        handleViewUser={handleViewUser}
        setActiveTab={setActiveTab}
      />

      {/* ユーザー詳細モーダル */}
      <AdminUserDetailModal
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
        handleGeneratePoliceReport={handleGeneratePoliceReport}
        isGeneratingPoliceReport={isGeneratingPoliceReport}
        handleAdminResetUserEkyc={handleAdminResetUserEkyc}
        handleAdminSendPasswordReset={handleAdminSendPasswordReset}
        isSendingPasswordReset={isSendingPasswordReset}
        loadingUserPosts={loadingUserPosts}
        userPosts={userPosts}
        handleViewPost={handleViewPost}
        onFilterPostsByUser={(name) => {
          setPostSearchTerm(name);
          setPostPage(1);
          setActiveTab('posts');
          setSelectedUser(null);
        }}
      />

      {/* 🚔 警察照会・捜査関係事項照会 一括回答書出力モーダル */}
      <AdminPoliceReportModal
        policeReportData={policeReportData}
        onClose={() => setPoliceReportData(null)}
        handleCopyPoliceReportText={handleCopyPoliceReportText}
        copiedPoliceReport={copiedPoliceReport}
        handleDownloadPoliceReportJson={handleDownloadPoliceReportJson}
      />

      {/* お問い合わせ返信モーダル */}
      <AdminContactReplyModal
        selectedContact={selectedContact}
        onClose={() => setSelectedContact(null)}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        handleReplyContact={handleReplyContact}
        isReplying={isReplying}
        handleGenerateAiDraft={handleGenerateAiDraft}
        isGeneratingAiDraft={isGeneratingAiDraft}
        aiDraftTone={aiDraftTone}
        setAiDraftTone={setAiDraftTone}
      />

      {/* 削除申請詳細モーダル */}
      <AdminDeletionRequestModal
        selectedDeletionRequest={selectedDeletionRequest}
        onClose={() => setSelectedDeletionRequest(null)}
        handleApproveDeletionRequest={handleApproveDeletionRequest}
        handleRejectDeletionRequest={handleRejectDeletionRequest}
      />

      {/* 通報詳細モーダル */}
      <AdminReportDetailModal
        selectedReport={selectedReport}
        onClose={() => setSelectedReport(null)}
        handleViewUser={handleViewUser}
        users={users}
        handleUpdateUserStatus={handleUpdateUserStatus}
        triggerDeletePost={triggerDeletePost}
        handleResolveReport={handleResolveReport}
      />

      {/* 一括通知配信確認モーダル */}
      <AdminBulkNotificationModal
        isOpen={showBulkConfirm}
        pendingNotification={pendingNotification}
        onClose={() => setShowBulkConfirm(false)}
        executeBulkNotification={executeBulkNotification}
      />

      {/* 汎用確認モーダル */}
      <AdminCustomConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

// --- Main App ---
