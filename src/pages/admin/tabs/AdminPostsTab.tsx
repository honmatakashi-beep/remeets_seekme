import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  ChevronLeft, ChevronRight, Download, Plus, Bot, Heart, Sparkles, X, ArrowUpDown, FileText, Check,
  Mail, Search, Filter, Eye, EyeOff, Trash2, Edit, ExternalLink,
  CheckCircle2, AlertTriangle, Clock, MapPin, Tag, RefreshCw, User, ShieldAlert
} from "lucide-react";
import { cn, getPostUrl, formatEraLabel, getCategoryText } from "../../../lib/utils";

export interface AdminPostsTabProps {
  [key: string]: any;
}

export const AdminPostsTab: React.FC<AdminPostsTabProps> = (props) => {
    const {
    posts = [],
    postFilter = "all",
    setPostFilter = () => {},
    postStatusFilter = "all",
    setPostStatusFilter = () => {},
    postFilterType = "all",
    setPostFilterType = () => {},
    postSearchTerm = "",
    setPostSearchTerm = () => {},
    postSortBy = "created_desc",
    setPostSortBy = () => {},
    selectedPostIds = [],
    setSelectedPostIds = () => {},
    postPage = 1,
    setPostPage = () => {},
    postItemsPerPage = 20,
    setPostItemsPerPage = () => {},
    handleDeletePost = () => {},
    handleTogglePostVisibility = () => {},
    setSelectedPost = () => {},
    selectedPost = null,
    onOpenSeoPreview = () => {},
    handleExportPostsCSV = () => {},
    handleGenerateSamplePosts = () => {},
    isGeneratingSamplePosts = false,
    handleBatchAiAnalyzePosts = () => {},
    isBatchAiAnalyzing = false,
    handleBatchUpdatePostStatus = () => {},
    isBatchUpdatingPostStatus = false,
    handleBatchDeletePosts = () => {},
    isBatchDeletingPosts = false,
    handleViewPost = () => {},
    handleAiAnalyze = () => {},
    isAiAnalyzing = false,
    handleTogglePostStatus = () => {},
    triggerDeletePost = () => {}
  } = props;

  return (
    <div className="space-y-6">
              {/* 1. Top 4 Metric Cards */}
              {(() => {
                const totalPostsCount = posts.length;
                const samplePostsCount = posts.filter(p => p.is_sample === 1 || p.user_is_sample === 1).length;
                const realPostsCount = totalPostsCount - samplePostsCount;
                const resolvedCount = posts.filter(p => p.status === 'resolved' || p.is_resolved === 1).length;
                const resolvedRate = totalPostsCount > 0 ? Math.round((resolvedCount / totalPostsCount) * 100) : 0;
                const activeCount = posts.filter(p => p.status !== 'resolved' && p.is_resolved !== 1).length;
                const aiDiagnosedCount = posts.filter(p => !!p.ai_diagnosed).length;
                const aiFlaggedCount = posts.filter(p => !!p.ai_flagged).length;
                const aiSafeCount = aiDiagnosedCount - aiFlaggedCount;

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Total Letters */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">総投函ボトル数</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Mail size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-serif font-bold text-black">
                          {totalPostsCount.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">通</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-black/60">
                          <span className="inline-flex items-center text-emerald-650 font-bold">👤 本番 {realPostsCount}</span>
                          <span>•</span>
                          <span className="inline-flex items-center text-indigo-650 font-medium">🤖 サンプル {samplePostsCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Reunion Rate */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">再会成立率</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Heart size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-700">{resolvedRate}%</span>
                          <span className="text-xs font-bold text-black/60">({resolvedCount}組成立)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, resolvedRate)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: AI Moderation */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">AI安全防衛・検閲</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">{aiSafeCount}</span>
                          <span className="text-xs font-bold text-black/60">通健全</span>
                        </div>
                        <div className="mt-1.5 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                          {aiFlaggedCount > 0 ? (
                            <span>⚠️ 要注意・隔離: {aiFlaggedCount} 通</span>
                          ) : (
                            <span className="text-emerald-650 font-normal">全ボトル合格・安全</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Active Searching */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">公開捜索中ボトル</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Sparkles size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-serif font-bold text-purple-700">{activeCount.toLocaleString()}</span>
                          <span className="text-xs font-bold text-black/60">通漂流中</span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-black/60 font-medium">
                          想い出の手紙が受取人を待機中
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
                    { id: 'all', label: 'すべて', count: posts.length },
                    { id: 'active', label: '🔍 捜索中', count: posts.filter(p => p.status !== 'resolved' && p.is_resolved !== 1).length },
                    { id: 'resolved', label: '🤝 再会成立', count: posts.filter(p => p.status === 'resolved' || p.is_resolved === 1).length },
                    { id: 'ai_passed', label: '🛡️ AI健全', count: posts.filter(p => p.ai_diagnosed && !p.ai_flagged).length },
                    { id: 'ai_flagged', label: '⚠️ AI隔離・要注意', count: posts.filter(p => !!p.ai_flagged).length },
                    { id: 'real', label: '👤 本番ボトル', count: posts.filter(p => p.is_sample !== 1 && p.user_is_sample !== 1).length },
                    { id: 'sample', label: '🤖 サンプル', count: posts.filter(p => p.is_sample === 1 || p.user_is_sample === 1).length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setPostFilterType(tab.id as any); setPostPage(1); }}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        postFilterType === tab.id
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-slate-100/80 text-black/70 hover:bg-slate-200/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        postFilterType === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60'
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
                      placeholder="対象者、差出人、本名、手紙本文、秘密の質問、ID等で瞬時検索..." 
                      className="w-full pl-9 pr-8 py-2 bg-slate-50/80 rounded-xl border border-brand-border focus:border-black focus:bg-white outline-none transition-all text-xs sm:text-sm text-black"
                      value={postSearchTerm}
                      onChange={(e) => { setPostSearchTerm(e.target.value); setPostPage(1); }}
                    />
                    {postSearchTerm && (
                      <button
                        onClick={() => { setPostSearchTerm(''); setPostPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Right controls: Sort, PageSize, CSV, Generate Sample */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Sort Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <ArrowUpDown size={13} className="text-black/50" />
                      <select
                        value={postSortBy}
                        onChange={(e) => { setPostSortBy(e.target.value as any); setPostPage(1); }}
                        className="bg-transparent text-black font-medium outline-none cursor-pointer text-xs"
                      >
                        <option value="created_desc">投函が新しい順</option>
                        <option value="created_asc">投函が古い順</option>
                        <option value="resolved_desc">再会成立優先</option>
                        <option value="ai_flagged_desc">AI要注意フラグ優先</option>
                        <option value="id_desc">ID順 (降順)</option>
                      </select>
                    </div>

                    {/* Page Size Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <span className="text-black/50 text-[11px]">表示:</span>
                      <select
                        value={postItemsPerPage}
                        onChange={(e) => { setPostItemsPerPage(Number(e.target.value)); setPostPage(1); }}
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
                      onClick={handleExportPostsCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-black/80 font-bold rounded-xl text-xs transition-colors border border-brand-border cursor-pointer shadow-2xs"
                      title="現在のフィルター結果をCSVエクスポート"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">CSV出力</span>
                    </button>

                    {/* Sample Post Generator Button */}
                    <button
                      onClick={() => handleGenerateSamplePosts(50)}
                      disabled={isGeneratingSamplePosts}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-black/80 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                      title="実在感のある日本の想い出サンプルボトルを50通一括自動生成"
                    >
                      <Plus size={13} className={isGeneratingSamplePosts ? "animate-spin" : ""} />
                      <span>サンプル生成 (+50)</span>
                    </button>
                  </div>
                </div>

                {/* Batch Action Floating / Slide-in Bar when posts selected */}
                <AnimatePresence>
                  {selectedPostIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-xs">
                        <div className="flex items-center gap-2 font-bold text-brand-dark">
                          <CheckCircle2 size={16} className="text-brand-primary" />
                          <span>{selectedPostIds.length} 件のボトルメールを選択中</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={handleBatchAiAnalyzePosts}
                            disabled={isBatchAiAnalyzing}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルメールに対してGemini AI安全診断を一括実行"
                          >
                            <Bot size={12} className={isBatchAiAnalyzing ? "animate-spin" : ""} />
                            <span>一括AI診断</span>
                          </button>
                          <button
                            onClick={() => handleBatchUpdatePostStatus('resolved')}
                            disabled={isBatchUpdatingPostStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルのステータスを一括で再会成立に変更"
                          >
                            <Heart size={12} />
                            <span>一括再会成立</span>
                          </button>
                          <button
                            onClick={() => handleBatchUpdatePostStatus('active')}
                            disabled={isBatchUpdatingPostStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルのステータスを一括で捜索中に戻す"
                          >
                            <Sparkles size={12} />
                            <span>一括捜索中に戻す</span>
                          </button>
                          <button
                            onClick={handleBatchDeletePosts}
                            disabled={isBatchDeletingPosts}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルメールを一括削除"
                          >
                            <Trash2 size={12} />
                            <span>一括削除</span>
                          </button>
                          <button
                            onClick={() => setSelectedPostIds([])}
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

              {/* 3. Bottles Table Section */}
              {(() => {
                // Filter posts
                const filteredPosts = posts.filter(p => {
                  const isSample = p.is_sample === 1 || p.user_is_sample === 1;
                  if (postFilterType === 'sample' && !isSample) return false;
                  if (postFilterType === 'real' && isSample) return false;
                  if (postFilterType === 'active' && (p.status === 'resolved' || p.is_resolved === 1)) return false;
                  if (postFilterType === 'resolved' && (p.status !== 'resolved' && p.is_resolved !== 1)) return false;
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

                // Sort posts
                const sortedPosts = [...filteredPosts].sort((a, b) => {
                  if (postSortBy === 'created_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  if (postSortBy === 'created_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  if (postSortBy === 'resolved_desc') {
                    const aRes = a.status === 'resolved' || a.is_resolved === 1 ? 1 : 0;
                    const bRes = b.status === 'resolved' || b.is_resolved === 1 ? 1 : 0;
                    return bRes - aRes;
                  }
                  if (postSortBy === 'ai_flagged_desc') return (b.ai_flagged ? 1 : 0) - (a.ai_flagged ? 1 : 0);
                  if (postSortBy === 'id_desc') return b.id - a.id;
                  return 0;
                });

                const totalFiltered = sortedPosts.length;
                const totalPages = Math.max(1, Math.ceil(totalFiltered / postItemsPerPage));
                const currentPage = Math.min(postPage, totalPages);
                const paginatedPosts = sortedPosts.slice((currentPage - 1) * postItemsPerPage, currentPage * postItemsPerPage);
                const allSelectedOnPage = paginatedPosts.length > 0 && paginatedPosts.every(p => selectedPostIds.includes(p.id));

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
                                      setSelectedPostIds(Array.from(new Set([...selectedPostIds, ...paginatedPosts.map(p => p.id)])));
                                    } else {
                                      const pageIds = new Set(paginatedPosts.map(p => p.id));
                                      setSelectedPostIds(selectedPostIds.filter(id => !pageIds.has(id)));
                                    }
                                  }}
                                  className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                />
                              </th>
                              <th className="px-2.5 py-2.5 w-14 whitespace-nowrap">ID</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">種別</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">対象者</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">差出人</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">年代・カテゴリ</th>
                              <th className="px-3 py-2.5 whitespace-nowrap max-w-[240px]">想い出の手紙</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">AI安全診断</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">状態</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">投函日</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/50 text-xs">
                            {paginatedPosts.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="px-6 py-12 text-center text-black/50">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Mail size={32} className="text-black/20" />
                                    <p className="font-bold">該当するボトルメールは見つかりませんでした</p>
                                    <p className="text-xs text-black/40">検索キーワードやフィルター条件を変更してお試しください</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedPosts.map((p) => {
                                const isSelected = selectedPostIds.includes(p.id);
                                const isSample = p.is_sample === 1 || p.user_is_sample === 1;
                                const isResolved = p.status === 'resolved' || p.is_resolved === 1;

                                return (
                                  <tr
                                    key={p.id}
                                    onClick={() => handleViewPost(p)}
                                    className={`h-12 hover:bg-white/60 transition-colors cursor-pointer group ${
                                      isSelected ? 'bg-brand-primary/5' : ''
                                    } ${p.ai_flagged ? 'bg-red-50/30' : ''}`}
                                  >
                                    {/* Checkbox */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedPostIds([...selectedPostIds, p.id]);
                                          } else {
                                            setSelectedPostIds(selectedPostIds.filter(id => id !== p.id));
                                          }
                                        }}
                                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                      />
                                    </td>

                                    {/* ID */}
                                    <td className="px-2.5 py-2 font-mono text-black/60 font-bold text-xs whitespace-nowrap">
                                      #{p.id}
                                    </td>

                                    {/* Type (Sample vs Real) in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {isSample ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                          🤖 サンプル
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                          👤 本番
                                        </span>
                                      )}
                                    </td>

                                    {/* Target Name in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-black text-xs">{p.target_name}</span>
                                        {(p.target_school || p.target_hometown) && (
                                          <span className="text-[10px] text-black/40 font-normal">
                                            ({[p.target_school, p.target_hometown].filter(Boolean).join('・')})
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Searcher Info in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-black text-xs">{p.searcher_name}</span>
                                        {p.searcher_full_name && p.searcher_full_name !== p.searcher_name && (
                                          <span className="text-[11px] text-black/50">（{p.searcher_full_name}）</span>
                                        )}
                                        {p.searcher_username && (
                                          <span className="text-[10px] text-black/40 font-mono">@{p.searcher_username}</span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Era & Category in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap text-black/70 text-xs">
                                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                                        {[formatEraLabel(p.era), getCategoryText(p.category)].filter(Boolean).join(' • ') || '想い出'}
                                      </span>
                                    </td>

                                    {/* Message Snippet in single horizontal line */}
                                    <td className="px-3 py-2 max-w-[240px] truncate text-black/60 text-xs" title={p.message || p.content}>
                                      {p.message || p.content || <span className="text-black/30 font-normal">メッセージなし</span>}
                                    </td>

                                    {/* AI Safety Diagnosis Status in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      {p.ai_diagnosed ? (
                                        <div className="inline-flex items-center gap-1">
                                          {p.ai_flagged ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200" title={p.ai_reason || "不適切コンテンツ検知"}>
                                              <AlertTriangle size={11} />
                                              <span>要警戒</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300" title="安全審査クリア">
                                              <Check size={11} />
                                              <span>健全</span>
                                            </span>
                                          )}
                                          <button
                                            onClick={() => handleAiAnalyze(p.id)}
                                            disabled={isAiAnalyzing === p.id}
                                            title="AI再診断を実行"
                                            className="p-1 text-black/40 hover:text-black hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                          >
                                            <RefreshCw size={12} className={isAiAnalyzing === p.id ? "animate-spin" : ""} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleAiAnalyze(p.id)}
                                          disabled={isAiAnalyzing === p.id}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-black hover:text-white text-black/70 border border-slate-200 transition-colors cursor-pointer"
                                          title="Google Gemini AI による即時安全診断"
                                        >
                                          <Bot size={11} className={isAiAnalyzing === p.id ? "animate-spin" : ""} />
                                          <span>未診断</span>
                                        </button>
                                      )}
                                    </td>

                                    {/* Status Badge in single horizontal line (Clickable to toggle) */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => handleTogglePostStatus(p.id, p.status)}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                          isResolved
                                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                        title={isResolved ? "クリックして「捜索中」に戻す" : "クリックして「再会成立」に変更"}
                                      >
                                        {isResolved ? (
                                          <>
                                            <Heart size={10} className="fill-amber-600 text-amber-600" />
                                            <span>再会成立</span>
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={10} />
                                            <span>捜索中</span>
                                          </>
                                        )}
                                      </button>
                                    </td>

                                    {/* Created Date in single horizontal line */}
                                    <td className="px-3 py-2 text-black/60 text-[11px] whitespace-nowrap font-mono">
                                      {p.created_at ? new Date(p.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                                    </td>

                                    {/* Actions Group - in single horizontal line */}
                                    <td className="px-3 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1">
                                        {/* View Details */}
                                        <button
                                          onClick={() => handleViewPost(p)}
                                          className="p-1.5 text-black/60 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                          title="ボトルメール詳細・思い出の質問・メッセージ履歴を表示"
                                        >
                                          <Eye size={14} />
                                        </button>

                                        {/* Toggle Resolved */}
                                        <button
                                          onClick={() => handleTogglePostStatus(p.id, p.status)}
                                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                            isResolved
                                              ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                                              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800'
                                          }`}
                                          title={isResolved ? "再会成立を解除して捜索中に戻す" : "再会成立（解決済）としてマーク"}
                                        >
                                          <Heart size={14} className={isResolved ? "fill-amber-600" : ""} />
                                        </button>

                                        {/* Delete Post */}
                                        <button
                                          onClick={() => triggerDeletePost(p.id)}
                                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                          title="ボトルメールを安全に削除・アーカイブ"
                                        >
                                          <Trash2 size={14} />
                                        </button>
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
                          <span className="font-bold text-black">{(currentPage - 1) * postItemsPerPage + 1}</span> -{' '}
                          <span className="font-bold text-black">{Math.min(currentPage * postItemsPerPage, totalFiltered)}</span> 件を表示
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setPostPage(prev => Math.max(1, prev - 1))}
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
                              onClick={() => setPostPage(prev => Math.min(totalPages, prev + 1))}
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
