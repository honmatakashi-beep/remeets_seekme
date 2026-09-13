import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  ChevronLeft, ChevronRight, Heart, Sparkles, X, ArrowUpDown, Download, Lock as LockIcon, Unlock, RotateCcw, ShieldCheck,
  Users, Search, Filter, UserCheck, UserX, Shield, Key, Eye, Edit2,
  Trash2, RefreshCw, Clock, Mail, ShieldAlert, CheckCircle2, AlertCircle, FileSpreadsheet
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminUsersTabProps {
  [key: string]: any;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = (props) => {
    const {
    users = [],
    userFilter = "all",
    setUserFilter = () => {},
    userRoleFilter = "all",
    setUserRoleFilter = () => {},
    userStatusFilter = "all",
    setUserStatusFilter = () => {},
    userSearchTerm = "",
    setUserSearchTerm = () => {},
    userSortBy = "created_desc",
    setUserSortBy = () => {},
    selectedUserIds = [],
    setSelectedUserIds = () => {},
    userPage = 1,
    setUserPage = () => {},
    userItemsPerPage = 20,
    setUserItemsPerPage = () => {},
    handleToggleUserBan = () => {},
    handleBatchUpdateUserStatus = () => {},
    isBatchUpdatingUserStatus = false,
    handleBatchResetUserEkyc = () => {},
    isBatchResettingUserEkyc = false,
    handleBatchDeleteUsers = () => {},
    isBatchDeletingUsers = false,
    handleViewUser = () => {},
    handleGeneratePoliceReport = () => {},
    handleAdminResetUserEkyc = () => {},
    handleUpdateUserStatus = () => {},
    handleDeleteUser = () => {},
    handleExportUsersCSV = () => {},
    setSelectedUser = () => {},
    selectedUser = null,
    handleOpenPoliceDisclosureModal = () => {}
  } = props;

  return (
    <div className="space-y-6">
              {/* 1. Top 4 Metric Cards */}
              {(() => {
                const isSampleUser = (u: any) => u.username?.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local') || u.email?.includes('sample.remeets.jp');
                const isAdminStaff = (u: any) => ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'].includes(u.role);

                const totalUsersCount = users.length;
                const sampleUsersCount = users.filter(isSampleUser).length;
                const realUsersCount = totalUsersCount - sampleUsersCount;
                const ekycCount = users.filter(u => !!u.is_ekyc_verified).length;
                const ekycRate = totalUsersCount > 0 ? Math.round((ekycCount / totalUsersCount) * 100) : 0;
                const blockedCount = users.filter(u => !!u.is_blocked).length;
                const reportedCount = users.filter(u => (u.reports_received_count || 0) > 0).length;
                const totalLetters = users.reduce((acc, u) => acc + (u.posts_count || 0), 0);
                const totalReunions = users.reduce((acc, u) => acc + (u.resolved_posts_count || 0), 0);

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Total Users */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">総登録アカウント</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Users size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-serif font-bold text-black">
                          {totalUsersCount.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">名</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-black/60">
                          <span className="inline-flex items-center text-emerald-650 font-bold">👤 本番 <span className="font-serif font-bold ml-1">{realUsersCount}</span></span>
                          <span>•</span>
                          <span className="inline-flex items-center text-indigo-650 font-medium">🤖 サンプル <span className="font-serif font-bold ml-1">{sampleUsersCount}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: eKYC Rate */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">eKYC認証完了率</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">{ekycRate}%</span>
                          <span className="text-xs font-bold text-black/60">(<span className="font-serif font-bold">{ekycCount}</span>名完了)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ekycRate)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Letters & Reunions */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">累計投函 / 再会成立</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Heart size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">
                          {totalLetters.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">通</span>
                        </div>
                        <div className="mt-1.5 text-[11px] font-bold text-emerald-650 flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>再会成立: <span className="font-serif font-bold">{totalReunions}</span> 組</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Blocked & Alerts */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">凍結 / 要警戒</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <ShieldAlert size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl sm:text-3xl font-serif font-bold ${blockedCount > 0 ? 'text-rose-600' : 'text-black'}`}>{blockedCount}</span>
                          <span className="text-xs font-bold text-black/60">名凍結中</span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-rose-600 font-medium">
                          {reportedCount > 0 ? `⚠️ 被通報アカウント: ` : '全アカウント健全'}
                          {reportedCount > 0 && <><span className="font-serif font-bold">{reportedCount}</span>件</>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 1.5 デモグラフィクス・属性クイックサマリーバー */}
              {(() => {
                const todayYear = new Date().getFullYear();
                const todayMonth = new Date().getMonth() + 1;
                const todayDay = new Date().getDate();

                const calculateAge = (bdate: string | null) => {
                  if (!bdate) return null;
                  try {
                    const [y, m, d] = bdate.split('-').map(Number);
                    if (!y || !m || !d) return null;
                    let age = todayYear - y;
                    if (todayMonth < m || (todayMonth === m && todayDay < d)) age--;
                    return age >= 0 ? age : null;
                  } catch { return null; }
                };

                let maleCount = 0;
                let femaleCount = 0;
                let unspecCount = 0;
                let totalAge = 0;
                let validAgeCount = 0;

                users.forEach(u => {
                  if (u.gender === '男性' || u.gender === 'male') maleCount++;
                  else if (u.gender === '女性' || u.gender === 'female') femaleCount++;
                  else unspecCount++;

                  const age = calculateAge(u.birthdate);
                  if (age !== null) {
                    totalAge += age;
                    validAgeCount++;
                  }
                });

                const avgAge = validAgeCount > 0 ? (totalAge / validAgeCount).toFixed(1) : "-";
                const total = users.length || 1;

                return (
                  <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-pink-500/10 p-3.5 sm:p-4 rounded-2xl border border-teal-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-sans text-slate-700">
                      <span className="font-bold flex items-center gap-1.5 text-teal-800">
                        <Users size={14} className="text-teal-700" />
                        <span>属性サマリー:</span>
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        🎂 平均年齢: <strong className="font-serif font-bold text-slate-900">{avgAge}</strong> 歳
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-blue-700">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        👨 男性: <strong className="font-serif font-bold">{maleCount}</strong> 名 ({Math.round((maleCount / total) * 100)}%)
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-pink-700">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        👩 女性: <strong className="font-serif font-bold">{femaleCount}</strong> 名 ({Math.round((femaleCount / total) * 100)}%)
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        👤 未設定: <strong className="font-serif font-bold">{unspecCount}</strong> 名 ({Math.round((unspecCount / total) * 100)}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                        🛡️ 18歳未満: 0名 (100%遮断)
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Filter Tabs & Search & Toolbar */}
              <div className="space-y-3 bg-white/70 p-4 sm:p-5 rounded-2xl border border-brand-border shadow-2xs">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                  {[
                    { id: 'all', label: 'すべて', count: users.length },
                    { id: 'male', label: '👨 男性', count: users.filter(u => u.gender === '男性' || u.gender === 'male').length },
                    { id: 'female', label: '👩 女性', count: users.filter(u => u.gender === '女性' || u.gender === 'female').length },
                    { id: 'unspecified_gender', label: '👤 性別未設定', count: users.filter(u => !u.gender || (u.gender !== '男性' && u.gender !== 'male' && u.gender !== '女性' && u.gender !== 'female')).length },
                    { id: 'ekyc', label: '🛡️ eKYC済', count: users.filter(u => !!u.is_ekyc_verified).length },
                    { id: 'self', label: '📝 自己申告', count: users.filter(u => !u.is_ekyc_verified).length },
                    { id: 'blocked', label: '🚫 凍結中', count: users.filter(u => !!u.is_blocked).length },
                    { id: 'admin', label: '🔑 スタッフ/管理者', count: users.filter(u => ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'].includes(u.role)).length },
                    { id: 'real', label: '👤 本番アカウント', count: users.filter(u => !u.username.startsWith('sample_') && !u.email?.includes('example.com') && !u.email?.includes('sample.local') && !u.email?.includes('sample.remeets.jp')).length },
                    { id: 'sample', label: '🤖 サンプル', count: users.filter(u => u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local') || u.email?.includes('sample.remeets.jp')).length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setUserStatusFilter(tab.id as any); setUserPage(1); }}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        userStatusFilter === tab.id
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-slate-100/80 text-black/70 hover:bg-slate-200/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-serif font-bold ${
                        userStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search & Sort & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                    <input 
                      type="text" 
                      placeholder="ユーザー名、ニックネーム、本名、旧姓、メアド、ID等で瞬時検索..." 
                      className="w-full pl-9 pr-8 py-2 bg-slate-50/80 rounded-xl border border-brand-border focus:border-black focus:bg-white outline-none transition-all text-xs sm:text-sm text-black"
                      value={userSearchTerm}
                      onChange={(e) => { setUserSearchTerm(e.target.value); setUserPage(1); }}
                    />
                    {userSearchTerm && (
                      <button
                        onClick={() => { setUserSearchTerm(''); setUserPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Right controls: Sort, PageSize, CSV */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Sort Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <ArrowUpDown size={13} className="text-black/50" />
                      <select
                        value={userSortBy}
                        onChange={(e) => { setUserSortBy(e.target.value as any); setUserPage(1); }}
                        className="bg-transparent text-black font-medium outline-none cursor-pointer text-xs"
                      >
                        <option value="created_desc">登録が新しい順</option>
                        <option value="created_asc">登録が古い順</option>
                        <option value="age_desc">年齢が高い順 (シニア層順)</option>
                        <option value="age_asc">年齢が若い順 (若年層順)</option>
                        <option value="posts_desc">投関数が多い順</option>
                        <option value="resolved_desc">再会成立数が多い順</option>
                        <option value="reports_desc">被通報数が多い順</option>
                        <option value="id_desc">ID順 (降順)</option>
                      </select>
                    </div>

                    {/* Page Size Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <span className="text-black/50 text-[11px]">表示:</span>
                      <select
                        value={userItemsPerPage}
                        onChange={(e) => { setUserItemsPerPage(Number(e.target.value)); setUserPage(1); }}
                        className="bg-transparent text-black font-medium outline-none cursor-pointer text-xs"
                      >
                        <option value={15}>15件</option>
                        <option value={30}>30件</option>
                        <option value={50}>50件</option>
                        <option value={100}>100件</option>
                      </select>
                    </div>

                    {/* CSV Export Button */}
                    <button
                      onClick={handleExportUsersCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-black/80 font-bold rounded-xl text-xs transition-colors border border-brand-border cursor-pointer shadow-2xs"
                      title="現在のフィルター結果をCSVエクスポート"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">CSV出力</span>
                    </button>
                  </div>
                </div>

                {/* Batch Action Floating / Slide-in Bar when users selected */}
                <AnimatePresence>
                  {selectedUserIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-xs">
                        <div className="flex items-center gap-2 font-bold text-brand-dark">
                          <CheckCircle2 size={16} className="text-brand-primary" />
                          <span>{selectedUserIds.length} 名のアカウントを選択中</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleBatchUpdateUserStatus(true)}
                            disabled={isBatchUpdatingUserStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントを一括ブロック・アクセス制限"
                          >
                            <LockIcon size={12} />
                            <span>一括凍結</span>
                          </button>
                          <button
                            onClick={() => handleBatchUpdateUserStatus(false)}
                            disabled={isBatchUpdatingUserStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントの凍結を一括解除"
                          >
                            <Unlock size={12} />
                            <span>一括凍結解除</span>
                          </button>
                          <button
                            onClick={handleBatchResetUserEkyc}
                            disabled={isBatchResettingUserEkyc}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントのeKYC本人確認ステータスを一括リセット"
                          >
                            <RotateCcw size={12} />
                            <span>eKYCリセット</span>
                          </button>
                          <button
                            onClick={handleBatchDeleteUsers}
                            disabled={isBatchDeletingUsers}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントを一括物理削除"
                          >
                            <Trash2 size={12} />
                            <span>一括削除</span>
                          </button>
                          <button
                            onClick={() => setSelectedUserIds([])}
                            className="px-2 py-1 text-black/60 hover:text-black hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
                          >
                            選択解除
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. User Table Section */}
              {(() => {
                const isSampleUser = (u: any) => u.username?.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local') || u.email?.includes('sample.remeets.jp');
                const isAdminStaff = (u: any) => ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'].includes(u.role);

                // Filter users
                const filteredUsers = users.filter(u => {
                  // Status & Gender Filter
                  if (userStatusFilter === 'male' && u.gender !== '男性' && u.gender !== 'male') return false;
                  if (userStatusFilter === 'female' && u.gender !== '女性' && u.gender !== 'female') return false;
                  if (userStatusFilter === 'unspecified_gender' && (u.gender === '男性' || u.gender === 'male' || u.gender === '女性' || u.gender === 'female')) return false;
                  if (userStatusFilter === 'ekyc' && !u.is_ekyc_verified) return false;
                  if (userStatusFilter === 'self' && u.is_ekyc_verified) return false;
                  if (userStatusFilter === 'blocked' && !u.is_blocked) return false;
                  if (userStatusFilter === 'admin' && !isAdminStaff(u)) return false;
                  if (userStatusFilter === 'sample' && !isSampleUser(u)) return false;
                  if (userStatusFilter === 'real' && isSampleUser(u)) return false;

                  // Search term
                  if (!userSearchTerm) return true;
                  const term = userSearchTerm.toLowerCase();
                  return (
                    (u.username && u.username.toLowerCase().includes(term)) ||
                    (u.nickname && u.nickname.toLowerCase().includes(term)) ||
                    (u.full_name && u.full_name.toLowerCase().includes(term)) ||
                    (u.maiden_name && u.maiden_name.toLowerCase().includes(term)) ||
                    (u.email && u.email.toLowerCase().includes(term)) ||
                    (u.contact_id && u.contact_id.toLowerCase().includes(term)) ||
                    (u.gender && u.gender.toLowerCase().includes(term)) ||
                    (u.birthdate && u.birthdate.includes(term)) ||
                    String(u.id).includes(term)
                  );
                });

                // Sort users
                const sortedUsers = [...filteredUsers].sort((a, b) => {
                  if (userSortBy === 'created_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  if (userSortBy === 'created_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  if (userSortBy === 'posts_desc') return (b.posts_count || 0) - (a.posts_count || 0);
                  if (userSortBy === 'resolved_desc') return (b.resolved_posts_count || 0) - (a.resolved_posts_count || 0);
                  if (userSortBy === 'reports_desc') return (b.reports_received_count || 0) - (a.reports_received_count || 0);
                  if (userSortBy === 'age_desc') return (b.birthdate || '9999').localeCompare(a.birthdate || '9999'); // older first
                  if (userSortBy === 'age_asc') return (a.birthdate || '0000').localeCompare(b.birthdate || '0000'); // younger first
                  if (userSortBy === 'id_desc') return b.id - a.id;
                  return 0;
                });

                const totalFiltered = sortedUsers.length;
                const totalPages = Math.max(1, Math.ceil(totalFiltered / userItemsPerPage));
                const currentPage = Math.min(userPage, totalPages);
                const paginatedUsers = sortedUsers.slice((currentPage - 1) * userItemsPerPage, currentPage * userItemsPerPage);
                const allSelectedOnPage = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.includes(u.id));

                return (
                  <div className="space-y-4">
                    <div className="glass-card overflow-hidden rounded-2xl border border-brand-border/70 shadow-xs" style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}>
                      <div className="overflow-x-auto" style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}>
                        <table className="w-full text-left border-collapse min-w-[960px]">
                          <thead>
                            <tr className="border-b border-brand-border bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-black/70">
                              <th className="px-3 py-2.5 w-10 text-center whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={allSelectedOnPage}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...paginatedUsers.map(u => u.id)])));
                                    } else {
                                      const pageIds = new Set(paginatedUsers.map(u => u.id));
                                      setSelectedUserIds(selectedUserIds.filter(id => !pageIds.has(id)));
                                    }
                                  }}
                                  className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                />
                              </th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ユーザーID</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">メールアドレス</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ニックネーム</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">本名</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">年齢 / 生年月日</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">性別</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">本人確認 (eKYC)</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">開示連絡先</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">活動状況</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">状態</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">登録日</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/50 text-xs">
                            {paginatedUsers.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="px-6 py-12 text-center text-black/50">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Users size={32} className="text-black/20" />
                                    <p className="font-bold">該当するユーザーは見つかりませんでした</p>
                                    <p className="text-xs text-black/40">検索キーワードやフィルター条件を変更してお試しください</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedUsers.map((u) => {
                                const isSelected = selectedUserIds.includes(u.id);
                                const isSample = u.email?.includes('sample.remeets.jp') || u.email?.includes('example.com') || u.email?.includes('sample.local');
                                
                                return (
                                  <tr
                                    key={u.id}
                                    onClick={() => handleViewUser(u)}
                                    className={`h-12 hover:bg-indigo-50/40 transition-colors cursor-pointer group ${
                                      isSelected ? 'bg-indigo-50/60' : ''
                                    } ${u.is_blocked ? 'bg-red-50/30' : ''}`}
                                  >
                                    {/* Checkbox */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedUserIds([...selectedUserIds, u.id]);
                                          } else {
                                            setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                                          }
                                        }}
                                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                      />
                                    </td>

                                    {/* 1. ユーザーID */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                          u.role === 'admin' 
                                            ? 'bg-slate-900 text-white' 
                                            : isSample 
                                              ? 'bg-indigo-100 text-indigo-800' 
                                              : 'bg-amber-100 text-amber-900'
                                        }`}>
                                          {(u.nickname || u.full_name || u.username || '?')[0].toUpperCase()}
                                        </div>
                                        <span className="font-mono font-bold text-indigo-900 text-xs bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200/70">
                                          {u.username}
                                        </span>
                                        {u.role === 'admin' && (
                                          <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold">
                                            ADMIN
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* 2. メールアドレス ＆ ログイン方法 */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-mono text-xs text-slate-800 font-medium">
                                          {u.email || <span className="text-slate-400 font-sans">未登録</span>}
                                        </span>
                                        <div className="flex items-center gap-1 mt-0.5">
                                          {u.auth_provider === 'line' ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded">
                                              <svg className="w-2.5 h-2.5 fill-[#06C755]" viewBox="0 0 24 24">
                                                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.084.922.256 1.058.588.12.302.079.774.038 1.08l-.164 1.026c-.05.31-.242 1.213 1.063.662 1.306-.55 7.042-4.148 9.608-7.1 1.637-1.821 2.378-3.669 2.378-5.847z"/>
                                              </svg>
                                              <span>LINE</span>
                                            </span>
                                          ) : u.auth_provider === 'google' ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200/80 px-1.5 py-0.2 rounded">
                                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                                                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                                                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                                                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                                                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"/>
                                              </svg>
                                              <span>Google</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded">
                                              <Mail size={9} className="text-slate-500" />
                                              <span>メール</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* 3. 表示ニックネーム */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <span className="font-bold text-slate-900 text-xs">
                                        {u.nickname || <span className="text-slate-400 font-normal">未設定</span>}
                                      </span>
                                    </td>

                                    {/* 4. お名前（本名 / 旧姓） */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-800 text-xs">
                                          {u.full_name || (u.last_name || u.first_name ? `${u.last_name || ''} ${u.first_name || ''}`.trim() : <span className="text-slate-400 font-normal">未登録</span>)}
                                        </span>
                                        {u.maiden_name && (
                                          <span className="bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                                            旧姓: {u.maiden_name}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* 4.5 年齢・生年月日 */}
                                    <td className="px-3 py-2 whitespace-nowrap font-sans">
                                      {u.birthdate ? (() => {
                                        const b = new Date(u.birthdate);
                                        let age = null;
                                        if (!isNaN(b.getTime())) {
                                          const today = new Date();
                                          age = today.getFullYear() - b.getFullYear();
                                          const m = today.getMonth() - b.getMonth();
                                          if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
                                        }
                                        return (
                                          <div className="text-xs">
                                            <span className="font-bold text-slate-800 font-mono">{age !== null ? `${age}歳` : '-'}</span>
                                            <span className="text-[10px] text-slate-500 font-mono ml-1">({u.birthdate.replace(/-/g, '/')})</span>
                                          </div>
                                        );
                                      })() : (
                                        <span className="text-slate-400 text-xs font-mono">18+ (未設定)</span>
                                      )}
                                    </td>

                                    {/* 4.6 性別 */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap font-sans">
                                      {u.gender === '男性' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                          男性
                                        </span>
                                      ) : u.gender === '女性' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                          女性
                                        </span>
                                      ) : u.gender ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                          {u.gender}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 text-[11px]">-</span>
                                      )}
                                    </td>

                                    {/* 5. 本人確認 (eKYC) */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      {u.is_ekyc_verified ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          <ShieldCheck size={12} className="text-emerald-700" />
                                          <span>承認済</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                          <span>📝 自己申告</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* 6. 開示連絡先 */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {u.contact_type && u.contact_id ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-mono">
                                          <span className="font-bold">{u.contact_type.toUpperCase()}</span>: {u.contact_id}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 text-[11px]">未設定</span>
                                      )}
                                    </td>

                                    {/* 7. 活動状況 */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200" title={`累計投関数: ${u.posts_count || 0}通`}>
                                          ✉️ {u.posts_count || 0}
                                        </span>
                                        {(u.resolved_posts_count || 0) > 0 && (
                                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title={`再会成立: ${u.resolved_posts_count}組`}>
                                            🤝 {u.resolved_posts_count}
                                          </span>
                                        )}
                                        {(u.reports_received_count || 0) > 0 && (
                                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse" title={`被通報数: ${u.reports_received_count}件`}>
                                            ⚠️ {u.reports_received_count}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* 8. 状態 */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      {u.is_blocked ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                          <LockIcon size={10} />
                                          <span>凍結中</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                          <span>正常</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* 9. 登録日 */}
                                    <td className="px-3 py-2 text-slate-600 text-[11px] whitespace-nowrap font-mono">
                                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                                    </td>

                                    {/* Actions Group - in single horizontal line */}
                                    <td className="px-3 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1">
                                        {/* View Details */}
                                        <button
                                          onClick={() => handleViewUser(u)}
                                          className="p-1.5 text-black/60 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                          title="ユーザー詳細・活動履歴を開く"
                                        >
                                          <Eye size={14} />
                                        </button>

                                        {/* Police Disclosure Report */}
                                        <button
                                          onClick={() => handleGeneratePoliceReport(u.id)}
                                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                          title="警察照会・捜査関係事項照会データ出力（刑事訴訟法第197条第2項）"
                                        >
                                          <ShieldAlert size={14} />
                                        </button>

                                        {/* Reset eKYC (if verified) */}
                                        {!!u.is_ekyc_verified && (
                                          <button
                                            onClick={() => handleAdminResetUserEkyc(u.id)}
                                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                            title="eKYC本人確認を未申請状態に戻す"
                                          >
                                            <RotateCcw size={14} />
                                          </button>
                                        )}

                                        {/* Block / Unblock (except admin) */}
                                        {u.role !== 'admin' && (
                                          <>
                                            <button
                                              onClick={() => handleUpdateUserStatus(u.id, !u.is_blocked)}
                                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                u.is_blocked 
                                                  ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800' 
                                                  : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                                              }`}
                                              title={u.is_blocked ? "アカウント凍結を解除" : "アカウントを凍結（アクセス遮断）"}
                                            >
                                              {u.is_blocked ? <Unlock size={14} /> : <LockIcon size={14} />}
                                            </button>

                                            {/* Delete User */}
                                            <button
                                              onClick={() => handleDeleteUser(u.id)}
                                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                              title="ユーザーアカウントを安全に削除"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 4. Enhanced Pagination */}
                    {totalFiltered > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-black/60">
                        <div>
                          全 <span className="font-serif font-bold text-black">{totalFiltered}</span> 件中{' '}
                          <span className="font-serif font-bold text-black">{(currentPage - 1) * userItemsPerPage + 1}</span> -{' '}
                          <span className="font-serif font-bold text-black">{Math.min(currentPage * userItemsPerPage, totalFiltered)}</span> 件を表示
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronLeft size={14} />
                              <span>前へ</span>
                            </button>

                            <div className="flex items-center gap-1 px-2">
                              <span className="font-serif font-bold text-black">{currentPage}</span>
                              <span>/</span>
                              <span className="font-serif font-bold text-black">{totalPages}</span>
                            </div>

                            <button
                              disabled={currentPage >= totalPages}
                              onClick={() => setUserPage(prev => Math.min(totalPages, prev + 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <span>次へ</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
  );
};
