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
                        <div className="text-2xl sm:text-3xl font-black text-black">
                          {totalUsersCount.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">名</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-black/60">
                          <span className="inline-flex items-center text-emerald-650 font-bold">👤 本番 {realUsersCount}</span>
                          <span>•</span>
                          <span className="inline-flex items-center text-indigo-650 font-medium">🤖 サンプル {sampleUsersCount}</span>
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
                          <span className="text-2xl sm:text-3xl font-black text-emerald-700">{ekycRate}%</span>
                          <span className="text-xs font-bold text-black/60">({ekycCount}名完了)</span>
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
                        <div className="text-2xl sm:text-3xl font-black text-brand-dark">
                          {totalLetters.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">通</span>
                        </div>
                        <div className="mt-1.5 text-[11px] font-bold text-emerald-650 flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>再会成立: {totalReunions} 組</span>
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
                          <span className={`text-2xl sm:text-3xl font-black ${blockedCount > 0 ? 'text-rose-600' : 'text-black'}`}>{blockedCount}</span>
                          <span className="text-xs font-bold text-black/60">名凍結中</span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-rose-600 font-medium">
                          {reportedCount > 0 ? `⚠️ 被通報アカウント: ${reportedCount}件` : '全アカウント健全'}
                        </div>
                      </div>
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
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
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
                  // Status Filter
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
                              <th className="px-2.5 py-2.5 w-14 whitespace-nowrap">ID</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ユーザー情報</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">氏名 / 旧姓</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">連絡先 / SNS</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">活動状況</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">認証状況</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">状態</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">登録日</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/50 text-xs">
                            {paginatedUsers.length === 0 ? (
                              <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-black/50">
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
                                const isSample = u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local');
                                
                                return (
                                  <tr
                                    key={u.id}
                                    onClick={() => handleViewUser(u)}
                                    className={`h-12 hover:bg-white/60 transition-colors cursor-pointer group ${
                                      isSelected ? 'bg-brand-primary/5' : ''
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

                                    {/* ID */}
                                    <td className="px-2.5 py-2 font-mono text-black/60 font-bold text-xs whitespace-nowrap">
                                      #{u.id}
                                    </td>

                                    {/* User Info (Avatar + Username + Nickname in single horizontal line) */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                          u.role === 'admin' 
                                            ? 'bg-black text-white' 
                                            : isSample 
                                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                              : 'bg-brand-primary/10 text-brand-dark'
                                        }`}>
                                          {(u.nickname || u.username || '?')[0].toUpperCase()}
                                        </div>
                                        <span className="font-bold text-black text-xs">{u.username}</span>
                                        {u.nickname && (
                                          <span className="text-[11px] text-black/50">（{u.nickname}）</span>
                                        )}
                                        {u.role === 'admin' && (
                                          <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold tracking-wider">
                                            ADMIN
                                          </span>
                                        )}
                                        {isSample && (
                                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.2 rounded font-medium">
                                            SAMPLE
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Full Name & Maiden Name & Birthdate in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-black/85 text-xs">
                                          {u.full_name || (u.last_name || u.first_name ? `${u.last_name || ''} ${u.first_name || ''}`.trim() : <span className="text-black/30 font-normal">未登録</span>)}
                                        </span>
                                        {u.maiden_name && (
                                          <span className="bg-amber-50 text-amber-850 px-1.5 py-0.2 rounded border border-amber-200 text-[10px] font-medium">
                                            旧姓: {u.maiden_name}
                                          </span>
                                        )}
                                        {u.birthdate && (
                                          <span className="text-[10px] text-black/40 font-mono">
                                            ({u.birthdate})
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Email & Contact in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-black/75">
                                          {u.email || <span className="text-black/30 font-sans">メール未登録</span>}
                                        </span>
                                        {u.contact_type && u.contact_id && (
                                          <span className="inline-flex items-center gap-1 text-[10px] text-black/60 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                            <span className="font-bold text-black/70">{u.contact_type.toUpperCase()}</span>: {u.contact_id}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Activities in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                          (u.posts_count || 0) > 0
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-slate-50 text-black/40 border-slate-200'
                                        }`} title={`累計投関数: ${u.posts_count || 0}通`}>
                                          ✉️ {u.posts_count || 0}
                                        </span>
                                        {(u.resolved_posts_count || 0) > 0 && (
                                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title={`再会成立: ${u.resolved_posts_count}組`}>
                                            🤝 {u.resolved_posts_count}
                                          </span>
                                        )}
                                        {(u.reports_received_count || 0) > 0 && (
                                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse" title={`被通報数: ${u.reports_received_count}件`}>
                                            ⚠️ {u.reports_received_count}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* eKYC Verification Badge in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      {u.is_ekyc_verified ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs" title={`eKYC認証完了 (${u.ekyc_document_type || '公的身分証'})`}>
                                          <ShieldCheck size={12} className="text-emerald-700" />
                                          <span>eKYC済</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-black/60 border border-slate-200" title="自己申告・誓約書署名のみ">
                                          <span>📝 自己申告</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* Status Badge in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      {u.is_blocked ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                          <LockIcon size={10} />
                                          <span>凍結中</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          <span>正常</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* Created Date in single horizontal line */}
                                    <td className="px-3 py-2 text-black/60 text-[11px] whitespace-nowrap font-mono">
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
                          全 <span className="font-bold text-black">{totalFiltered}</span> 件中{' '}
                          <span className="font-bold text-black">{(currentPage - 1) * userItemsPerPage + 1}</span> -{' '}
                          <span className="font-bold text-black">{Math.min(currentPage * userItemsPerPage, totalFiltered)}</span> 件を表示
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
                              <span className="font-bold text-black">{currentPage}</span>
                              <span>/</span>
                              <span>{totalPages}</span>
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
