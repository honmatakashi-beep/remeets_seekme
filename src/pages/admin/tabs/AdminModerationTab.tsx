import React from "react";
import {
  Bot, Trash2, FileText, X, Download, UserX, Shield, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, Play, RefreshCw,
  Eye, HelpCircle, Activity, Zap, Info, ShieldCheck, Search
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminModerationTabProps {
  [key: string]: any;
}

export const AdminModerationTab: React.FC<AdminModerationTabProps> = (props) => {
      const {
    testPostText = "",
    setTestPostText = () => {},
    censorshipResult = null,
    setCensorshipResult = () => {},
    isTestingCensorship = false,
    handleTestCensorship = () => {},
    simulationResult = null,
    isSimulating = false,
    handleSimulatePost = () => {},
    selectedSimulationCase = null,
    setSelectedSimulationCase = () => {},
    simulationPresets = [],
    deletedPostsArchive = [],
    selectedArchiveIds = [],
    setSelectedArchiveIds = () => {},
    handleBatchDeleteArchive = () => {},
    isBatchDeletingArchive = false,
    archivePerPage = 10,
    setArchivePerPage = () => {},
    setArchivePage = () => {},
    archivePage = 1,
    moderationSubTab = "queue",
    setModerationSubTab = () => {},
    moderationQueue = [],
    modReasonFilter = "all",
    setModReasonFilter = () => {},
    modSearchTerm = "",
    setModSearchTerm = () => {},
    modPerPage = 10,
    setModPerPage = () => {},
    modPage = 1,
    setModPage = () => {},
    selectedModPostIds = [],
    setSelectedModPostIds = () => {},
    handleBatchApproveModPosts = () => {},
    isBatchApprovingModPosts = false,
    handleBatchDeleteModPosts = () => {},
    isBatchDeletingModPosts = false,
    handleViewUser = () => {},
    setActiveTab = () => {},
    handleApproveModPost = () => {},
    setSelectedModPostModal = () => {},
    handleToggleFreezeUser = () => {},
    triggerDeletePost = () => {},
    handleSeedModeration = () => {},
    archiveSearchTerm = "",
    setArchiveSearchTerm = () => {}
  } = props;

  return (
            <div className="space-y-6 text-left font-sans animate-fade-in">
              {/* 1. 4大AI検閲KPIサマリーカード */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white/90 backdrop-blur-md border border-rose-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700">🤖 AI検知保留中キュー</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <Bot size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-rose-700">{moderationQueue.length}</span>
                    <span className="text-xs text-rose-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-rose-600 font-medium">目視確認待ちの隔離ボトル</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">🚨 ストーキング・脅迫疑い</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <ShieldAlert size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-amber-700">
                      {moderationQueue.filter(p => {
                        const r = (p.ai_reason || '').toLowerCase();
                        return r.includes('ストーカー') || r.includes('脅迫') || r.includes('住所') || r.includes('個人情報');
                      }).length}
                    </span>
                    <span className="text-xs text-amber-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-amber-600 font-medium">重大コンプライアンスリスク</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-blue-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700">📱 連絡先・NGワード</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Shield size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-blue-700">
                      {moderationQueue.filter(p => {
                        const r = (p.ai_reason || '').toLowerCase();
                        return r.includes('line') || r.includes('電話') || r.includes('メール') || r.includes('ng') || r.includes('ワード');
                      }).length}
                    </span>
                    <span className="text-xs text-blue-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-blue-600 font-medium">禁止ワード・外部誘導検知</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">📁 削除監査アーカイブ</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-slate-800">{deletedPostsArchive.length}</span>
                    <span className="text-xs text-slate-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600 font-medium">物理削除・証跡保全ログ</div>
                </div>
              </div>

              {/* 2. メインデータカード */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
                {/* Header */}
                <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>規約監視・AIリスク防衛センター</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          {moderationSubTab === 'queue' ? `保留キュー ${moderationQueue.length}件` : `削除ログ ${deletedPostsArchive.length}件`}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        AI安全エンジンによる不適切・ストーキング表現の自動隔離検知 ＆ 監査ルーム
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSeedModeration}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>AI検知テストデータを生成</span>
                    </button>
                  </div>
                </div>

                {/* Sub Tab Navigation */}
                <div className="px-5 pt-3 border-b border-slate-200/80 bg-slate-50/30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setModerationSubTab('queue'); setModPage(1); }}
                    className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      moderationSubTab === 'queue'
                        ? 'border-brand-primary text-brand-primary font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <AlertTriangle size={14} className={moderationQueue.length > 0 ? "text-rose-500 animate-pulse" : ""} />
                    <span>AI検知保留キュー</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      moderationSubTab === 'queue' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {moderationQueue.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setModerationSubTab('archive'); setArchivePage(1); }}
                    className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      moderationSubTab === 'archive'
                        ? 'border-brand-primary text-brand-primary font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText size={14} />
                    <span>削除監査履歴ログ</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      moderationSubTab === 'archive' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {deletedPostsArchive.length}
                    </span>
                  </button>
                </div>

                {/* SUB TAB 1: QUEUE */}
                {moderationSubTab === 'queue' && (() => {
                  const filtered = moderationQueue.filter((p: any) => {
                    const r = (p.ai_reason || '').toLowerCase();
                    if (modReasonFilter === 'stalking' && !(r.includes('ストーカー') || r.includes('脅迫') || r.includes('住所') || r.includes('個人情報'))) return false;
                    if (modReasonFilter === 'contact' && !(r.includes('line') || r.includes('電話') || r.includes('メール') || r.includes('ng') || r.includes('ワード'))) return false;
                    if (modReasonFilter === 'other' && (r.includes('ストーカー') || r.includes('脅迫') || r.includes('line') || r.includes('電話'))) return false;

                    if (modSearchTerm.trim()) {
                      const q = modSearchTerm.toLowerCase();
                      const matchTarget = (p.target_name || '').toLowerCase().includes(q);
                      const matchSearcher = (p.searcher_name || '').toLowerCase().includes(q);
                      const matchAuthor = (p.author_username || '').toLowerCase().includes(q);
                      const matchMsg = (p.message || p.content || '').toLowerCase().includes(q);
                      const matchReason = (p.ai_reason || '').toLowerCase().includes(q);
                      if (!matchTarget && !matchSearcher && !matchAuthor && !matchMsg && !matchReason) return false;
                    }
                    return true;
                  });

                  const totalPages = Math.ceil(filtered.length / modPerPage) || 1;
                  const currentPage = Math.min(modPage, totalPages);
                  const paginated = filtered.slice((currentPage - 1) * modPerPage, currentPage * modPerPage);

                  return (
                    <div>
                      {/* Search & Reason Filter Bar */}
                      <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                            {[
                              { id: 'all', label: 'すべて', count: moderationQueue.length },
                              { 
                                id: 'stalking', 
                                label: '🚨 ストーカー・脅迫疑い', 
                                count: moderationQueue.filter(p => (p.ai_reason || '').includes('ストーカー') || (p.ai_reason || '').includes('脅迫') || (p.ai_reason || '').includes('住所')).length 
                              },
                              { 
                                id: 'contact', 
                                label: '📱 連絡先・NGワード', 
                                count: moderationQueue.filter(p => (p.ai_reason || '').includes('LINE') || (p.ai_reason || '').includes('電話') || (p.ai_reason || '').includes('NG')).length 
                              },
                              { 
                                id: 'other', 
                                label: '⚠️ その他疑い', 
                                count: moderationQueue.filter(p => !((p.ai_reason || '').includes('ストーカー') || (p.ai_reason || '').includes('LINE'))).length 
                              },
                            ].map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => { setModReasonFilter(t.id as any); setModPage(1); }}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                  modReasonFilter === t.id
                                    ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                }`}
                              >
                                <span>{t.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                  modReasonFilter === t.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {t.count}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold">表示件数:</span>
                            <select
                              value={modPerPage}
                              onChange={(e) => { setModPerPage(Number(e.target.value)); setModPage(1); }}
                              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 font-bold focus:outline-none focus:border-brand-primary"
                            >
                              <option value={15}>15件</option>
                              <option value={30}>30件</option>
                              <option value={50}>50件</option>
                              <option value={9999}>全件</option>
                            </select>
                          </div>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={modSearchTerm}
                            onChange={(e) => { setModSearchTerm(e.target.value); setModPage(1); }}
                            placeholder="宛先名、差出人、本文、AI判定理由、ユーザー名で検索..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-medium"
                          />
                          {modSearchTerm && (
                            <button
                              type="button"
                              onClick={() => { setModSearchTerm(''); setModPage(1); }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* Batch Action Bar */}
                        {moderationQueue.length > 0 && (
                          <div className="flex items-center justify-between bg-rose-50/70 p-2.5 rounded-xl border border-rose-200/80">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={moderationQueue.length > 0 && moderationQueue.every(p => selectedModPostIds.includes(p.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedModPostIds(moderationQueue.map(p => p.id));
                                  } else {
                                    setSelectedModPostIds([]);
                                  }
                                }}
                                className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-rose-900">
                                全選択 ({selectedModPostIds.length} / {moderationQueue.length}件 選択中)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleBatchApproveModPosts}
                                disabled={selectedModPostIds.length === 0 || isBatchApprovingModPosts}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                              >
                                <CheckCircle2 size={13} />
                                <span>選択一括承認・公開 ({selectedModPostIds.length})</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleBatchDeleteModPosts}
                                disabled={selectedModPostIds.length === 0 || isBatchDeletingModPosts}
                                className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                              >
                                <Trash2 size={13} />
                                <span>選択一括削除 ({selectedModPostIds.length})</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Queue Table */}
                      <div className="overflow-x-auto">
                        {filtered.length === 0 ? (
                          <div className="p-12 text-center text-slate-400">
                            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                            <p className="text-sm font-bold text-slate-700">保留中のAI検知ボトルはありません</p>
                            <p className="text-xs text-slate-400 mt-1">すべての手紙がクリーンまたは対応完了済みです</p>
                          </div>
                        ) : (
                          <>
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                  <th className="w-8 px-3 py-2.5"></th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">投函日時</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">宛先 / 差出人</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">投函アカウント</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">AI自動判定理由</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">手紙本文（要約）</th>
                                  <th className="px-3 py-2.5 text-right whitespace-nowrap">即時アクション</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                {paginated.map((post: any) => {
                                  const isChecked = selectedModPostIds.includes(post.id);
                                  const r = (post.ai_reason || '').toLowerCase();
                                  const isStalking = r.includes('ストーカー') || r.includes('脅迫') || r.includes('住所') || r.includes('個人情報');

                                  return (
                                    <tr key={post.id} className="h-12 hover:bg-slate-50/70 transition-colors group">
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedModPostIds(prev => [...prev, post.id]);
                                            } else {
                                              setSelectedModPostIds(prev => prev.filter(id => id !== post.id));
                                            }
                                          }}
                                          className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                        />
                                      </td>

                                      {/* 1. Created At */}
                                      <td className="px-3 py-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                        {new Date(post.created_at).toLocaleString('ja-JP', {
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </td>

                                      {/* 2. Target & Searcher */}
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono text-slate-400 text-[10px]">#{post.id}</span>
                                          <span className="font-bold text-slate-900">{post.target_name || '無題'} 様宛</span>
                                          <span className="text-slate-400 text-[10px]">({post.searcher_name || '差出人不明'})</span>
                                        </div>
                                      </td>

                                      {/* 3. Author Profile */}
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                          {post.user_id ? (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleViewUser({ id: post.user_id, username: post.author_username });
                                                setActiveTab('users');
                                              }}
                                              className="font-bold text-slate-700 hover:text-brand-primary hover:underline cursor-pointer"
                                            >
                                              @{post.author_username || `User #${post.user_id}`}
                                            </button>
                                          ) : (
                                            <span className="text-slate-400 italic">Guest (未登録)</span>
                                          )}

                                          {post.user_id && (
                                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                              post.author_is_blocked === 1
                                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                              {post.author_is_blocked === 1 ? '🚨 凍結中' : '通常'}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* 4. AI Reason Badge */}
                                      <td className="px-3 py-2 whitespace-nowrap max-w-xs truncate">
                                        <div className="flex items-center gap-1.5 truncate">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                                            isStalking 
                                              ? 'bg-rose-100 text-rose-800 border-rose-300' 
                                              : 'bg-amber-100 text-amber-800 border-amber-300'
                                          }`}>
                                            <Bot size={11} />
                                            <span>{isStalking ? '🚨 ストーカー疑い' : '⚠️ 表現注意'}</span>
                                          </span>
                                          <span className="text-slate-600 text-[11px] truncate font-medium" title={post.ai_reason}>
                                            {post.ai_reason || 'AI安全判定による隔離'}
                                          </span>
                                        </div>
                                      </td>

                                      {/* 5. Message Snippet */}
                                      <td className="px-3 py-2 max-w-sm truncate text-slate-600">
                                        <span className="truncate block font-serif" title={post.message || post.content}>
                                          "{post.message || post.content}"
                                        </span>
                                      </td>

                                      {/* 6. Action */}
                                      <td className="px-3 py-2 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleApproveModPost(post.id)}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                            title="AIフラグを解除して通常公開する"
                                          >
                                            <CheckCircle2 size={12} />
                                            <span>承認・公開</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => setSelectedModPostModal(post)}
                                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                            title="手紙とAI判定の詳細を確認"
                                          >
                                            <Eye size={13} />
                                          </button>

                                          {post.user_id && (
                                            <button
                                              type="button"
                                              onClick={() => handleToggleFreezeUser(post.user_id, post.author_is_blocked || 0)}
                                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                                post.author_is_blocked === 1
                                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                              }`}
                                              title={post.author_is_blocked === 1 ? "凍結解除" : "投函ユーザーを即時凍結(BAN)"}
                                            >
                                              <UserX size={13} />
                                            </button>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => triggerDeletePost(post.id)}
                                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                            title="手紙を削除してアーカイブ保管"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>

                            {/* Pagination Bar */}
                            <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                              <div className="text-slate-500 font-medium">
                                全 <span className="font-bold text-slate-800">{filtered.length}</span> 件中{' '}
                                <span className="font-bold text-slate-800">{(currentPage - 1) * modPerPage + 1}</span> 〜{' '}
                                <span className="font-bold text-slate-800">{Math.min(currentPage * modPerPage, filtered.length)}</span> 件を表示
                              </div>

                              {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setModPage(1)}
                                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &laquo;
                                  </button>
                                  <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setModPage(prev => Math.max(prev - 1, 1))}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &lsaquo;
                                  </button>
                                  
                                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold">
                                    {currentPage} / {totalPages}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setModPage(prev => Math.min(prev + 1, totalPages))}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &rsaquo;
                                  </button>
                                  <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setModPage(totalPages)}
                                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &raquo;
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* SUB TAB 2: ARCHIVE */}
                {moderationSubTab === 'archive' && (() => {
                  const filtered = deletedPostsArchive.filter((a: any) => {
                    if (archiveSearchTerm.trim()) {
                      const q = archiveSearchTerm.toLowerCase();
                      const matchTarget = (a.target_name || '').toLowerCase().includes(q);
                      const matchSearcher = (a.searcher_name || '').toLowerCase().includes(q);
                      const matchAuthor = (a.username || '').toLowerCase().includes(q);
                      const matchMsg = (a.message || '').toLowerCase().includes(q);
                      const matchReason = (a.reason || a.ai_reason || '').toLowerCase().includes(q);
                      const matchDeletedBy = (a.deleted_by_name || '').toLowerCase().includes(q);
                      if (!matchTarget && !matchSearcher && !matchAuthor && !matchMsg && !matchReason && !matchDeletedBy) return false;
                    }
                    return true;
                  });

                  const totalPages = Math.ceil(filtered.length / archivePerPage) || 1;
                  const currentPage = Math.min(archivePage, totalPages);
                  const paginated = filtered.slice((currentPage - 1) * archivePerPage, currentPage * archivePerPage);

                  return (
                    <div>
                      {/* Search & Export Bar */}
                      <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="text-xs font-bold text-slate-600">
                            物理削除・保全ログアーカイブ ({deletedPostsArchive.length}件)
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold">表示件数:</span>
                            <select
                              value={archivePerPage}
                              onChange={(e) => { setArchivePerPage(Number(e.target.value)); setArchivePage(1); }}
                              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 font-bold focus:outline-none focus:border-brand-primary"
                            >
                              <option value={15}>15件</option>
                              <option value={30}>30件</option>
                              <option value={50}>50件</option>
                              <option value={9999}>全件</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                const headers = ["ID", "ポストID", "投函したUID", "アカウント名", "差出人名", "お相手名", "本文", "AI判定状態", "AI理由", "管理者削除理由", "削除日時"];
                                const rows = deletedPostsArchive.map(a => [
                                  a.id, a.post_id, a.user_id, a.username, a.searcher_name, a.target_name, `"${(a.message || '').replace(/"/g, '""')}"`,
                                  a.ai_flagged ? "Flagged" : "Normal", a.ai_reason || "", a.reason || "", a.deleted_at
                                ]);
                                const csvContent = "\\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\\n");
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", `remeets_deleted_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <Download size={13} />
                              <span>削除監査ログ CSV</span>
                            </button>
                          </div>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={archiveSearchTerm}
                            onChange={(e) => { setArchiveSearchTerm(e.target.value); setArchivePage(1); }}
                            placeholder="宛先名、差出人、本文、削除理由、実行者で検索..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-medium"
                          />
                          {archiveSearchTerm && (
                            <button
                              type="button"
                              onClick={() => { setArchiveSearchTerm(''); setArchivePage(1); }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* Batch Action Bar */}
                        {deletedPostsArchive.length > 0 && (
                          <div className="flex items-center justify-between bg-slate-100/90 p-2.5 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={deletedPostsArchive.length > 0 && deletedPostsArchive.every(a => selectedArchiveIds.includes(a.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedArchiveIds(deletedPostsArchive.map(a => a.id));
                                  } else {
                                    setSelectedArchiveIds([]);
                                  }
                                }}
                                className="rounded border-slate-300 text-slate-700 focus:ring-slate-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-700">
                                全選択 ({selectedArchiveIds.length} / {deletedPostsArchive.length}件 選択中)
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={handleBatchDeleteArchive}
                              disabled={selectedArchiveIds.length === 0 || isBatchDeletingArchive}
                              className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                            >
                              <Trash2 size={13} />
                              <span>選択一括完全消去 ({selectedArchiveIds.length})</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Archive Table */}
                      <div className="overflow-x-auto">
                        {filtered.length === 0 ? (
                          <div className="p-12 text-center text-slate-400">
                            <FileText size={36} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-sm font-bold text-slate-700">削除監査ログはありません</p>
                          </div>
                        ) : (
                          <>
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                  <th className="w-8 px-3 py-2.5"></th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">削除日時</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">ポスト旧ID / 宛先</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">投函主 (UID)</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">削除実行者</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">削除理由 / AI判定</th>
                                  <th className="px-3 py-2.5 whitespace-nowrap">手紙本文（保全データ）</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                {paginated.map((archive: any) => {
                                  const isChecked = selectedArchiveIds.includes(archive.id);

                                  return (
                                    <tr key={archive.id} className="h-12 hover:bg-slate-50/70 transition-colors group">
                                      <td className="px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedArchiveIds(prev => [...prev, archive.id]);
                                            } else {
                                              setSelectedArchiveIds(prev => prev.filter(id => id !== archive.id));
                                            }
                                          }}
                                          className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                        />
                                      </td>

                                      {/* 1. Deleted At */}
                                      <td className="px-3 py-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                        {new Date(archive.deleted_at).toLocaleString('ja-JP', {
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </td>

                                      {/* 2. Target */}
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono text-slate-400 text-[10px]">#{archive.post_id}</span>
                                          <span className="font-bold text-slate-900">{archive.target_name || '無題'} 様宛</span>
                                          <span className="text-slate-400 text-[10px]">({archive.searcher_name || '-'})</span>
                                        </div>
                                      </td>

                                      {/* 3. Author */}
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span className="font-bold text-slate-700 font-mono">
                                          @{archive.username || '不詳'} (UID:{archive.user_id || '-'})
                                        </span>
                                      </td>

                                      {/* 4. Deleted By */}
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                          {archive.deleted_by_name || 'Admin'}
                                        </span>
                                      </td>

                                      {/* 5. Reason */}
                                      <td className="px-3 py-2 max-w-xs truncate text-slate-600">
                                        <span className="truncate block" title={archive.reason || archive.ai_reason}>
                                          {archive.reason || archive.ai_reason || '管理者判断による削除'}
                                        </span>
                                      </td>

                                      {/* 6. Message Snippet */}
                                      <td className="px-3 py-2 max-w-sm truncate text-slate-500">
                                        <span className="truncate block font-serif italic" title={archive.message}>
                                          "{archive.message}"
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>

                            {/* Pagination Bar */}
                            <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                              <div className="text-slate-500 font-medium">
                                全 <span className="font-bold text-slate-800">{filtered.length}</span> 件中{' '}
                                <span className="font-bold text-slate-800">{(currentPage - 1) * archivePerPage + 1}</span> 〜{' '}
                                <span className="font-bold text-slate-800">{Math.min(currentPage * archivePerPage, filtered.length)}</span> 件を表示
                              </div>

                              {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setArchivePage(1)}
                                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &laquo;
                                  </button>
                                  <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setArchivePage(prev => Math.max(prev - 1, 1))}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &lsaquo;
                                  </button>
                                  
                                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold">
                                    {currentPage} / {totalPages}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setArchivePage(prev => Math.min(prev + 1, totalPages))}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &rsaquo;
                                  </button>
                                  <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setArchivePage(totalPages)}
                                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                                  >
                                    &raquo;
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          
  );
};
