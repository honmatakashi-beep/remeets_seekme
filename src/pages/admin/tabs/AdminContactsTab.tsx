import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  ChevronLeft, FileSpreadsheet,  Trash2, Terminal, UserCheck,
  Inbox, Search, Filter, MessageSquare, Send, CheckCircle2, Clock,
  AlertCircle, AlertTriangle, User, Mail, Tag, ChevronDown, ChevronRight,
  ExternalLink, Sparkles, RefreshCw, Check
} from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  classifyTicket,
  TicketCategory,
  TicketCategoryEn,
  ClassificationResult,
  URGENT_KEYWORDS,
  TECHNICAL_KEYWORDS,
  ACCOUNT_KEYWORDS
} from "../../../utils/contactClassification";

export interface AdminContactsTabProps {
  [key: string]: any;
}

export const AdminContactsTab: React.FC<AdminContactsTabProps> = (props) => {
      const {
    contacts = [],
    contactFilter = "all",
    setContactFilter = () => {},
    contactCategoryFilter = "all",
    setContactCategoryFilter = () => {},
    selectedContact = null,
    setSelectedContact = () => {},
    replyMessage = "",
    setReplyMessage = () => {},
    handleReplyContact = () => {},
    handleUpdateContactStatus = () => {},
    replyStatus = "all",
    setReplyStatus = () => {},
    selectedContactIds = [],
    setSelectedContactIds = () => {},
    handleBatchUpdateContactStatus = () => {},
    isBatchProcessingContacts = false,
    handleBatchDeleteContacts = () => {},
    handleToggleSelectAllContacts = () => {},
    handleToggleSelectContact = () => {},
    handleUpdateSingleContactStatus = () => {},
    handleDeleteSingleContact = () => {},
    contactStatusFilter = "all",
    setContactStatusFilter = () => {},
    contactSearchQuery = "",
    setContactSearchQuery = () => {},
    contactSortBy = "date_desc",
    setContactSortBy = () => {},
    contactCurrentPage = 1,
    setContactCurrentPage = () => {},
    contactItemsPerPage = 10,
    setContactItemsPerPage = () => {},
    handleSeedSampleContacts = () => {},
    isSeedingContacts = false,
    handleExportContactsCsv = () => {},
    fetchData = () => {}
  } = props;


              const enrichedContacts = contacts.map(c => {
                const cl = classifyTicket(c.subject || '', c.message || '');
                return {
                  ...c,
                  classification: cl,
                  category: cl.category,
                  categoryEn: cl.categoryEn,
                  categoryLabel: cl.categoryLabel,
                  matchedKeywords: cl.matchedKeywords,
                  priorityScore: cl.priorityScore,
                  triageTip: cl.triageTip
                };
              });

              const urgentCount = enrichedContacts.filter(c => c.category === 'urgent').length;
              const technicalCount = enrichedContacts.filter(c => c.category === 'technical').length;
              const accountCount = enrichedContacts.filter(c => c.category === 'account').length;
              const generalCount = enrichedContacts.filter(c => c.category === 'general').length;
              const pendingCount = enrichedContacts.filter(c => c.status === 'pending').length;
              const urgentPendingCount = enrichedContacts.filter(c => c.category === 'urgent' && c.status === 'pending').length;

              const filteredContacts = enrichedContacts
                .filter(c => {
                  if (contactCategoryFilter !== 'all' && c.category !== contactCategoryFilter) return false;
                  if (contactStatusFilter !== 'all' && c.status !== contactStatusFilter) return false;
                  if (contactSearchQuery.trim()) {
                    const q = contactSearchQuery.toLowerCase();
                    const matchText = `${c.name || ''} ${c.email || ''} ${c.subject || ''} ${c.message || ''} ${(c.matchedKeywords || []).join(' ')}`.toLowerCase();
                    if (!matchText.includes(q)) return false;
                  }
                  return true;
                })
                .sort((a, b) => {
                  if (contactSortBy === 'priority') {
                    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  }
                  if (contactSortBy === 'newest') {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  }
                  if (contactSortBy === 'oldest') {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  }
                  return 0;
                });

              // Pagination calculations
              const totalPages = Math.max(1, Math.ceil(filteredContacts.length / contactItemsPerPage));
              const safeCurrentPage = Math.min(contactCurrentPage, totalPages);
              const startIndex = (safeCurrentPage - 1) * contactItemsPerPage;
              const paginatedContacts = filteredContacts.slice(startIndex, startIndex + contactItemsPerPage);
              const currentPageIds = paginatedContacts.map(c => c.id);
              const isAllPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedContactIds.includes(id));

              return (
                <div className="space-y-6">
                  {/* Triage Header */}
                  <div className="glass-card p-6 rounded-3xl border border-brand-border/60 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase tracking-widest border border-brand-primary/20">
                          Automated Ticket Triage
                        </span>
                        {urgentPendingCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle size={12} />
                            <span>🚨 至急対応 <span className="font-serif font-bold">{urgentPendingCount}</span> 件</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
                        お問い合わせ自動分類・トリアージ管理
                      </h2>
                      <p className="text-xs md:text-sm text-brand-dark/70 font-sans max-w-3xl">
                        AI・キーワード解析により全チケットを <strong className="text-rose-700 font-bold">Urgent (緊急)</strong>・<strong className="text-sky-700 font-bold">Technical (技術・不具合)</strong>・<strong className="text-purple-700 font-bold">Account (アカウント)</strong> に即座に自動判別。最優先対応を可視化します。
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={handleSeedSampleContacts}
                        disabled={isSeedingContacts}
                        id="btn-seed-sample-contacts"
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-dark text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                        title="検証用に各分類（緊急・技術・アカウント・一般）のサンプルチケットを投入します"
                      >
                        <Sparkles size={14} className="text-brand-accent shrink-0" />
                        <span className="whitespace-nowrap">{isSeedingContacts ? '投入中...' : '分類サンプル投入 (8件)'}</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('全てのお問い合わせ履歴をクリア（全消去）しますか？')) return;
                          try {
                            const authToken = props.token || localStorage.getItem('token') || sessionStorage.getItem('token');
                            const res = await fetch('/api/admin/contacts/clear-all', {
                              method: 'POST',
                              headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
                            });
                            if (res.ok) {
                              alert('お問い合わせ履歴をクリアしました。');
                              if (fetchData) fetchData();
                              else window.location.reload();
                            }
                          } catch (e) {
                            alert('通信エラーが発生しました');
                          }
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        title="お問い合わせ履歴のみを一括消去します"
                      >
                        <Trash2 size={14} />
                        <span className="whitespace-nowrap">履歴全クリア</span>
                      </button>
                      <button
                        onClick={handleExportContactsCsv}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-brand-border text-brand-dark text-xs font-bold hover:bg-brand-light/50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        title="全お問い合わせ履歴をCSVファイルでダウンロードします"
                      >
                        <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
                        <span className="whitespace-nowrap">CSV出力</span>
                      </button>
                      <button
                        onClick={() => fetchData()}
                        className="p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark hover:bg-brand-light/50 transition-colors shadow-xs cursor-pointer shrink-0"
                        title="最新のお問い合わせを取得"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 5-Card Triage KPI Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {/* Total Tickets */}
                    <button
                      onClick={() => { setContactCategoryFilter('all'); setContactStatusFilter('all'); setContactCurrentPage(1); }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'all' && contactStatusFilter === 'all'
                          ? "bg-brand-dark text-white border-brand-dark shadow-md"
                          : "bg-white border-brand-border/80 hover:border-brand-primary/50 text-brand-dark"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 whitespace-nowrap">全チケット</span>
                        <Mail size={16} className={contactCategoryFilter === 'all' && contactStatusFilter === 'all' ? "text-brand-accent" : "text-brand-dark/40"} />
                      </div>
                      <div className="text-2xl md:text-3xl font-serif font-bold">{enrichedContacts.length}</div>
                      <div className="text-[10px] mt-1 opacity-70 whitespace-nowrap">総受信数</div>
                    </button>

                    {/* Urgent Tickets */}
                    <button
                      onClick={() => { setContactCategoryFilter(contactCategoryFilter === 'urgent' ? 'all' : 'urgent'); setContactCurrentPage(1); }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'urgent'
                          ? "bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300"
                          : "bg-rose-50/60 border-rose-200/80 hover:border-rose-300 text-rose-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                          <AlertTriangle size={12} className={contactCategoryFilter === 'urgent' ? "text-white animate-pulse" : "text-rose-600 animate-pulse"} />
                          <span>🚨 Urgent</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-rose-200/80 text-rose-800 whitespace-nowrap">最優先</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-serif font-bold text-rose-950 dark:text-white">{urgentCount}</div>
                      <div className="text-[10px] mt-1 opacity-80 whitespace-nowrap">緊急・被害・返金</div>
                    </button>

                    {/* Technical Tickets */}
                    <button
                      onClick={() => { setContactCategoryFilter(contactCategoryFilter === 'technical' ? 'all' : 'technical'); setContactCurrentPage(1); }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'technical'
                          ? "bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300"
                          : "bg-sky-50/60 border-sky-200/80 hover:border-sky-300 text-sky-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                          <Terminal size={12} className={contactCategoryFilter === 'technical' ? "text-white" : "text-sky-600"} />
                          <span>⚙️ Technical</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-sky-200/80 text-sky-800 whitespace-nowrap">技術</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-serif font-bold text-sky-950 dark:text-white">{technicalCount}</div>
                      <div className="text-[10px] mt-1 opacity-80 whitespace-nowrap">エラー・不具合・障害</div>
                    </button>

                    {/* Account Tickets */}
                    <button
                      onClick={() => { setContactCategoryFilter(contactCategoryFilter === 'account' ? 'all' : 'account'); setContactCurrentPage(1); }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'account'
                          ? "bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300"
                          : "bg-purple-50/60 border-purple-200/80 hover:border-purple-300 text-purple-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                          <UserCheck size={12} className={contactCategoryFilter === 'account' ? "text-white" : "text-purple-600"} />
                          <span>👤 Account</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-purple-200/80 text-purple-800 whitespace-nowrap">アカウント</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-serif font-bold text-purple-950 dark:text-white">{accountCount}</div>
                      <div className="text-[10px] mt-1 opacity-80 whitespace-nowrap">認証・退会・eKYC</div>
                    </button>

                    {/* Pending Tickets */}
                    <button
                      onClick={() => { setContactStatusFilter(contactStatusFilter === 'pending' ? 'all' : 'pending'); setContactCurrentPage(1); }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer col-span-2 sm:col-span-1",
                        contactStatusFilter === 'pending'
                          ? "bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300"
                          : "bg-amber-50/60 border-amber-200/80 hover:border-amber-300 text-amber-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                          <Clock size={12} className={contactStatusFilter === 'pending' ? "text-white" : "text-amber-600"} />
                          <span>⏳ 未対応</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-200/80 text-amber-800 whitespace-nowrap">要返信</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-serif font-bold text-amber-950 dark:text-white">{pendingCount}</div>
                      <div className="text-[10px] mt-1 opacity-80 whitespace-nowrap">返信待ちチケット</div>
                    </button>
                  </div>

                  {/* Filter Toolbar & Search Bar */}
                  <div className="glass-card p-4 rounded-2xl border border-brand-border space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Category Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-brand-dark/50 uppercase tracking-wider mr-1 whitespace-nowrap shrink-0">分類:</span>
                        <button
                          onClick={() => { setContactCategoryFilter('all'); setContactCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            contactCategoryFilter === 'all'
                              ? "bg-brand-dark text-white shadow-xs"
                              : "bg-brand-light/60 text-brand-dark/70 hover:bg-brand-light"
                          )}
                        >
                          <span className="whitespace-nowrap">すべて</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-mono">{enrichedContacts.length}</span>
                        </button>

                        <button
                          onClick={() => { setContactCategoryFilter('urgent'); setContactCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            contactCategoryFilter === 'urgent'
                              ? "bg-rose-600 text-white shadow-xs"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          )}
                        >
                          <AlertTriangle size={12} className="animate-pulse shrink-0" />
                          <span className="whitespace-nowrap">🚨 Urgent (緊急)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-800 text-[10px] font-mono font-bold">{urgentCount}</span>
                        </button>

                        <button
                          onClick={() => { setContactCategoryFilter('technical'); setContactCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            contactCategoryFilter === 'technical'
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                          )}
                        >
                          <Terminal size={12} className="shrink-0" />
                          <span className="whitespace-nowrap">⚙️ Technical (技術)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-sky-200 text-sky-800 text-[10px] font-mono font-bold">{technicalCount}</span>
                        </button>

                        <button
                          onClick={() => { setContactCategoryFilter('account'); setContactCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            contactCategoryFilter === 'account'
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                          )}
                        >
                          <UserCheck size={12} className="shrink-0" />
                          <span className="whitespace-nowrap">👤 Account (アカウント)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-800 text-[10px] font-mono font-bold">{accountCount}</span>
                        </button>

                        <button
                          onClick={() => { setContactCategoryFilter('general'); setContactCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            contactCategoryFilter === 'general'
                              ? "bg-slate-700 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                          )}
                        >
                          <Mail size={12} className="shrink-0" />
                          <span className="whitespace-nowrap">💬 General (一般)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">{generalCount}</span>
                        </button>
                      </div>

                      {/* Status filter toggle - Horizontal single row */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-brand-dark/50 uppercase tracking-wider whitespace-nowrap shrink-0">状態:</span>
                        <div className="inline-flex flex-row items-center bg-brand-light/60 p-0.5 rounded-xl border border-brand-border shrink-0">
                          <button
                            onClick={() => { setContactStatusFilter('all'); setContactCurrentPage(1); }}
                            className={cn(
                              "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                              contactStatusFilter === 'all' ? "bg-white text-brand-dark shadow-xs" : "text-brand-dark/60 hover:text-brand-dark"
                            )}
                          >
                            すべて
                          </button>
                          <button
                            onClick={() => { setContactStatusFilter('pending'); setContactCurrentPage(1); }}
                            className={cn(
                              "px-3 py-1 rounded-lg text-xs font-bold transition-all flex flex-row items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                              contactStatusFilter === 'pending' ? "bg-amber-500 text-white shadow-xs" : "text-amber-800 hover:text-amber-900"
                            )}
                          >
                            <span className="whitespace-nowrap">未対応</span>
                            <span className="text-[10px] font-mono font-bold">({pendingCount})</span>
                          </button>
                          <button
                            onClick={() => { setContactStatusFilter('replied'); setContactCurrentPage(1); }}
                            className={cn(
                              "px-3 py-1 rounded-lg text-xs font-bold transition-all flex flex-row items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                              contactStatusFilter === 'replied' ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-800 hover:text-emerald-900"
                            )}
                          >
                            <span className="whitespace-nowrap">返信済</span>
                            <span className="text-[10px] font-mono font-bold">({enrichedContacts.length - pendingCount})</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-brand-border/50">
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-80">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                        <input
                          type="text"
                          value={contactSearchQuery}
                          onChange={(e) => { setContactSearchQuery(e.target.value); setContactCurrentPage(1); }}
                          placeholder="件名・本文・送信者・#キーワードで検索..."
                          className="w-full pl-9 pr-8 py-2 bg-white border border-brand-border rounded-xl text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-brand-dark placeholder:text-brand-dark/40"
                        />
                        {contactSearchQuery && (
                          <button
                            onClick={() => { setContactSearchQuery(''); setContactCurrentPage(1); }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark text-xs cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Items per page & Sort Selector */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <span className="text-[11px] text-brand-dark/50 font-bold whitespace-nowrap">表示件数:</span>
                          <select
                            value={contactItemsPerPage}
                            onChange={(e) => { setContactItemsPerPage(Number(e.target.value)); setContactCurrentPage(1); }}
                            className="px-2 py-1.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-dark outline-none focus:border-brand-primary cursor-pointer whitespace-nowrap"
                          >
                            <option value={10}>10件</option>
                            <option value={25}>25件</option>
                            <option value={50}>50件</option>
                            <option value={100}>100件</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <span className="text-[11px] text-brand-dark/50 font-bold whitespace-nowrap">並び順:</span>
                          <select
                            value={contactSortBy}
                            onChange={(e: any) => setContactSortBy(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-dark outline-none focus:border-brand-primary cursor-pointer whitespace-nowrap"
                          >
                            <option value="priority">🚨 優先度順 (Urgent優先)</option>
                            <option value="newest">🕒 受信日時 (新しい順)</option>
                            <option value="oldest">📅 受信日時 (古い順)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Batch Actions Bar */}
                  {selectedContactIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-brand-dark text-white rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-brand-border/20"
                    >
                      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-serif font-bold whitespace-nowrap">
                          {selectedContactIds.length} 件選択中
                        </span>
                        <span className="text-xs text-white/70 hidden sm:inline whitespace-nowrap">
                          選択したお問い合わせに対する一括操作:
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleBatchUpdateContactStatus('replied')}
                          disabled={isBatchProcessingContacts}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                        >
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span className="whitespace-nowrap">一括対応済 (解決)</span>
                        </button>
                        <button
                          onClick={() => handleBatchUpdateContactStatus('pending')}
                          disabled={isBatchProcessingContacts}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                        >
                          <Clock size={13} className="shrink-0" />
                          <span className="whitespace-nowrap">一括未対応にする</span>
                        </button>
                        <button
                          onClick={handleBatchDeleteContacts}
                          disabled={isBatchProcessingContacts}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                        >
                          <Trash2 size={13} className="shrink-0" />
                          <span className="whitespace-nowrap">一括削除</span>
                        </button>
                        <button
                          onClick={() => setSelectedContactIds([])}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
                        >
                          選択解除
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Modern h-12 Table */}
                  <div className="glass-card overflow-hidden rounded-3xl border border-brand-border shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-brand-border bg-brand-light/70 h-10">
                            <th className="w-10 px-3 text-center align-middle">
                              <input
                                type="checkbox"
                                checked={isAllPageSelected}
                                onChange={() => handleToggleSelectAllContacts(currentPageIds)}
                                className="rounded border-brand-border text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                                title="このページの全件を選択/解除"
                              />
                            </th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">分類 (Category)</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">ステータス</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">受信日時</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">送信者</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle min-w-[260px]">件名・本文抜粋</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 text-right whitespace-nowrap align-middle pr-4">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/60 font-sans">
                          {paginatedContacts.map(c => {
                            const isUrgent = c.category === 'urgent';
                            const isTechnical = c.category === 'technical';
                            const isAccount = c.category === 'account';
                            const isSelected = selectedContactIds.includes(c.id);

                            return (
                              <tr 
                                key={c.id} 
                                className={cn(
                                  "h-12 transition-colors",
                                  isSelected
                                    ? "bg-brand-primary/10"
                                    : isUrgent && c.status !== 'replied'
                                    ? "bg-rose-50/40 hover:bg-rose-50/80" 
                                    : "hover:bg-brand-light/30"
                                )}
                              >
                                {/* Checkbox */}
                                <td className="px-3 text-center align-middle">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectContact(c.id)}
                                    className="rounded border-brand-border text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                                  />
                                </td>

                                {/* Automated Category Badge & Keywords */}
                                <td className="px-3 align-middle whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    {isUrgent && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                        <AlertTriangle size={11} className="text-rose-600 animate-pulse" />
                                        <span>Urgent</span>
                                      </span>
                                    )}
                                    {isTechnical && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                                        <Terminal size={11} className="text-sky-600" />
                                        <span>Technical</span>
                                      </span>
                                    )}
                                    {isAccount && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                                        <UserCheck size={11} className="text-purple-600" />
                                        <span>Account</span>
                                      </span>
                                    )}
                                    {!isUrgent && !isTechnical && !isAccount && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        <Mail size={11} className="text-slate-500" />
                                        <span>General</span>
                                      </span>
                                    )}

                                    {/* Keyword Tag (first one only for compact table) */}
                                    {c.matchedKeywords && c.matchedKeywords.length > 0 && (
                                      <span className="text-[9px] px-1.5 py-0.5 bg-black/5 text-black/60 rounded font-mono hidden md:inline">
                                        #{c.matchedKeywords[0]}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Status Toggle */}
                                <td className="px-3 align-middle whitespace-nowrap">
                                  <button
                                    onClick={() => handleUpdateSingleContactStatus(c.id, c.status === 'replied' ? 'pending' : 'replied')}
                                    className="cursor-pointer group"
                                    title="クリックでステータスを切り替え"
                                  >
                                    {c.status === 'replied' ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors">
                                        <CheckCircle2 size={10} />
                                        <span>返信済</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 group-hover:bg-amber-200 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors">
                                        <Clock size={10} />
                                        <span>未対応</span>
                                      </span>
                                    )}
                                  </button>
                                </td>

                                {/* Date */}
                                <td className="px-3 align-middle text-[11px] text-brand-dark/75 font-mono whitespace-nowrap">
                                  {new Date(c.created_at).toLocaleString('ja-JP', { 
                                    month: 'numeric', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </td>

                                {/* Sender */}
                                <td className="px-3 align-middle whitespace-nowrap max-w-[150px]">
                                  <div className="font-bold text-xs text-brand-dark truncate">{c.name}</div>
                                  <div className="text-[10px] text-brand-dark/60 font-mono truncate">{c.email}</div>
                                </td>

                                {/* Subject & Message preview (1-line) */}
                                <td className="px-3 align-middle max-w-[320px]">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className={cn(
                                      "font-bold text-xs shrink-0 max-w-[140px] truncate",
                                      isUrgent ? "text-rose-900" : "text-brand-dark"
                                    )}>
                                      {c.subject}
                                    </span>
                                    <span className="text-brand-dark/30 text-xs">—</span>
                                    <span className="text-[11px] text-brand-dark/60 truncate">
                                      {c.message}
                                    </span>
                                  </div>
                                </td>

                                {/* Action */}
                                <td className="px-3 align-middle text-right whitespace-nowrap pr-4">
                                  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                                    <button 
                                      onClick={() => setSelectedContact(c)}
                                      className={cn(
                                        "py-1 px-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer whitespace-nowrap shrink-0",
                                        isUrgent && c.status !== 'replied'
                                          ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-200"
                                          : "bg-brand-primary hover:bg-brand-dark text-white"
                                      )}
                                    >
                                      <Mail size={12} className="shrink-0" />
                                      <span className="whitespace-nowrap">{c.status === 'replied' ? '詳細' : '返信'}</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSingleContact(c.id)}
                                      className="p-1 rounded-lg text-brand-dark/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                      title="このお問い合わせを削除"
                                    >
                                      <Trash2 size={13} className="shrink-0" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {paginatedContacts.length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-16 text-center text-brand-dark/50 font-serif">
                                <div className="max-w-xs mx-auto space-y-2">
                                  <Mail size={32} className="mx-auto text-brand-dark/30" />
                                  <p className="text-sm font-bold text-brand-dark/80">条件に合致するお問い合わせはありません</p>
                                  <p className="text-xs text-brand-dark/50">フィルターを解除するか、上部の「分類サンプル投入」ボタンをお試しください。</p>
                                  <button
                                    onClick={() => { setContactCategoryFilter('all'); setContactStatusFilter('all'); setContactSearchQuery(''); setContactCurrentPage(1); }}
                                    className="px-3 py-1.5 bg-brand-light text-brand-dark text-xs font-bold rounded-lg hover:bg-brand-light/80 transition-colors cursor-pointer"
                                  >
                                    フィルターを初期化
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar */}
                    {filteredContacts.length > 0 && (
                      <div className="p-3 bg-brand-light/40 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-dark/70">
                        <div className="text-[11px] font-sans">
                          全 <strong className="text-brand-dark font-serif font-bold">{filteredContacts.length}</strong> 件中 <span className="font-serif font-bold">{startIndex + 1}</span> - <span className="font-serif font-bold">{Math.min(startIndex + contactItemsPerPage, filteredContacts.length)}</span> 件を表示
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setContactCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={safeCurrentPage === 1}
                              className="px-2.5 py-1 rounded-lg bg-white border border-brand-border font-bold text-xs hover:bg-brand-light transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              前へ
                            </button>
                            <div className="flex items-center gap-1 font-serif font-bold text-[11px] px-2">
                              <span>{safeCurrentPage}</span>
                              <span className="opacity-40">/</span>
                              <span>{totalPages}</span>
                            </div>
                            <button
                              onClick={() => setContactCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={safeCurrentPage === totalPages}
                              className="px-2.5 py-1 rounded-lg bg-white border border-brand-border font-bold text-xs hover:bg-brand-light transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              次へ
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
  );
};
