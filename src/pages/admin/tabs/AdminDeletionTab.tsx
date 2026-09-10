import React from "react";
import {
  Trash2, Download, ExternalLink, Eye, Search, Filter, AlertTriangle, CheckCircle2, Clock, User,
  FileText, ShieldAlert, Check, X, RefreshCw, Sparkles
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminDeletionTabProps {
  [key: string]: any;
}

export const AdminDeletionTab: React.FC<AdminDeletionTabProps> = (props) => {
    const {
    deletionRequests = [],
    deletionFilter = "all",
    setDeletionFilter = () => {},
    deletionStatusFilter = "all",
    setDeletionStatusFilter = () => {},
    deletionPage = 1,
    setDeletionPage = () => {},
    deletionPerPage = 10,
    setDeletionPerPage = () => {},
    deletionSearchTerm = "",
    setDeletionSearchTerm = () => {},
    selectedDeletionIds = [],
    setSelectedDeletionIds = () => {},
    handleBatchApproveDeletion = () => {},
    isBatchUpdatingDeletion = false,
    handleBatchRejectDeletion = () => {},
    handleViewUser = () => {},
    setActiveTab = () => {},
    handleApproveDeletionRequest = () => {},
    setSelectedDeletionRequest = () => {},
    handleRejectDeletionRequest = () => {}
  } = props;

  return (
            <div className="space-y-6 text-left font-sans animate-fade-in">
              {/* 1. 4大削除依頼KPIサマリーカード */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">📋 総削除申請数</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Trash2 size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-slate-800">{deletionRequests.length}</span>
                    <span className="text-xs text-slate-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-medium">全期間の削除救済申請</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">⚠️ 未対応（審査待ち）</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-amber-700">
                      {deletionRequests.filter(r => r.status === 'pending').length}
                    </span>
                    <span className="text-xs text-amber-500 font-semibold">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-amber-600 font-medium">管理者の判断待ち</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">✅ 承認・削除完了</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-emerald-700">
                      {deletionRequests.filter(r => r.status === 'approved' || r.status === 'resolved').length}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      ({deletionRequests.length > 0 ? Math.round((deletionRequests.filter(r => r.status === 'approved' || r.status === 'resolved').length / deletionRequests.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-600 font-medium">安全に消去対応済み</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-rose-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700">✕ 却下・対象外</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <X size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-rose-700">
                      {deletionRequests.filter(r => r.status === 'rejected').length}
                    </span>
                    <span className="text-xs text-rose-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-rose-600 font-medium">不当申請・審査却下</div>
                </div>
              </div>

              {/* 2. メインデータカード */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
                {/* Header */}
                <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <Trash2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>削除依頼 ＆ プライバシー救済管理</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          全 {deletionRequests.length} 件
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        本人発見や誤送信等に伴うユーザーからの削除申請の調査・消去承認と却下判定
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const authToken = props.token || localStorage.getItem('token') || sessionStorage.getItem('token');
                          const res = await fetch('/api/admin/deletion-requests/seed', {
                            method: 'POST',
                            headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
                          });
                          if (res.ok) {
                            alert('削除依頼のテストサンプル（3件）を正常に投入しました！');
                            if (props.fetchData) props.fetchData();
                            else window.location.reload();
                          } else {
                            const errData = await res.json().catch(() => ({}));
                            alert(errData.error || '削除申請サンプルの生成に失敗しました');
                          }
                        } catch (e) {
                          alert('通信エラーが発生しました');
                        }
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="実名露出・プライバシー等の削除申請サンプルを3件投入します"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>サンプル3件を生成</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('全ての削除申請データをクリア（全消去）しますか？')) return;
                        try {
                          const authToken = props.token || localStorage.getItem('token') || sessionStorage.getItem('token');
                          const res = await fetch('/api/admin/deletion-requests/clear-all', {
                            method: 'POST',
                            headers: { 'Authorization': authToken ? `Bearer ${authToken}` : '' }
                          });
                          if (res.ok) {
                            alert('削除申請データをクリアしました。');
                            if (props.fetchData) props.fetchData();
                            else window.location.reload();
                          }
                        } catch (e) {
                          alert('通信エラーが発生しました');
                        }
                      }}
                      className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="削除申請リストのみを一括消去します"
                    >
                      <Trash2 size={13} />
                      <span>申請全クリア</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const headers = ["依頼ID", "申請日時", "状態", "申請者名", "連絡先メール", "対象投稿ID", "対象URL", "投稿者名", "対象者名", "削除理由", "詳しい説明"];
                        const rows = deletionRequests.map(r => [
                          r.id,
                          `"${new Date(r.created_at).toLocaleString().replace(/"/g, '""')}"`,
                          r.status,
                          `"${(r.name || '').replace(/"/g, '""')}"`,
                          `"${(r.email || '').replace(/"/g, '""')}"`,
                          r.post_id || '',
                          `"${(r.url || '').replace(/"/g, '""')}"`,
                          `"${(r.post_author_name || '').replace(/"/g, '""')}"`,
                          `"${(r.target_name || '').replace(/"/g, '""')}"`,
                          `"${(r.reason || '').replace(/"/g, '""')}"`,
                          `"${(r.explanation || '').replace(/"/g, '""')}"`
                        ]);
                        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `deletion_requests_audit_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>削除依頼監査 CSV 出力</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                      {[
                        { id: 'all', label: 'すべて', count: deletionRequests.length },
                        { id: 'pending', label: '⚠️ 未対応', count: deletionRequests.filter(r => r.status === 'pending').length },
                        { id: 'approved', label: '✅ 承認済', count: deletionRequests.filter(r => r.status === 'approved' || r.status === 'resolved').length },
                        { id: 'rejected', label: '✕ 却下', count: deletionRequests.filter(r => r.status === 'rejected').length },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setDeletionStatusFilter(t.id as any); setDeletionPage(1); }}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            deletionStatusFilter === t.id
                              ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                          }`}
                        >
                          <span>{t.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            deletionStatusFilter === t.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {t.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">表示件数:</span>
                      <select
                        value={deletionPerPage}
                        onChange={(e) => { setDeletionPerPage(Number(e.target.value)); setDeletionPage(1); }}
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
                      value={deletionSearchTerm}
                      onChange={(e) => { setDeletionSearchTerm(e.target.value); setDeletionPage(1); }}
                      placeholder="申請者氏名、メールアドレス、削除理由、説明、対象URL、投稿者名で検索..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-medium"
                    />
                    {deletionSearchTerm && (
                      <button
                        type="button"
                        onClick={() => { setDeletionSearchTerm(''); setDeletionPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Batch Action Bar */}
                  {deletionRequests.length > 0 && (
                    <div className="flex items-center justify-between bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={deletionRequests.length > 0 && deletionRequests.every(r => selectedDeletionIds.includes(r.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeletionIds(deletionRequests.map(r => r.id));
                            } else {
                              setSelectedDeletionIds([]);
                            }
                          }}
                          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-amber-900">
                          全選択 ({selectedDeletionIds.length} / {deletionRequests.length}件 選択中)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleBatchApproveDeletion}
                          disabled={selectedDeletionIds.length === 0 || isBatchUpdatingDeletion}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 size={13} />
                          <span>選択一括承認＆削除 ({selectedDeletionIds.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleBatchRejectDeletion}
                          disabled={selectedDeletionIds.length === 0 || isBatchUpdatingDeletion}
                          className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        >
                          <X size={13} />
                          <span>選択一括却下 ({selectedDeletionIds.length})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Table Component */}
                <div className="overflow-x-auto">
                  {(() => {
                    const filtered = deletionRequests.filter(r => {
                      if (deletionStatusFilter === 'pending' && r.status !== 'pending') return false;
                      if (deletionStatusFilter === 'approved' && r.status !== 'approved' && r.status !== 'resolved') return false;
                      if (deletionStatusFilter === 'rejected' && r.status !== 'rejected') return false;

                      if (deletionSearchTerm.trim()) {
                        const q = deletionSearchTerm.toLowerCase();
                        const matchName = (r.name || '').toLowerCase().includes(q);
                        const matchEmail = (r.email || '').toLowerCase().includes(q);
                        const matchReason = (r.reason || '').toLowerCase().includes(q);
                        const matchExp = (r.explanation || '').toLowerCase().includes(q);
                        const matchUrl = (r.url || '').toLowerCase().includes(q);
                        const matchAuthor = (r.post_author_name || '').toLowerCase().includes(q);
                        const matchTarget = (r.target_name || '').toLowerCase().includes(q);
                        if (!matchName && !matchEmail && !matchReason && !matchExp && !matchUrl && !matchAuthor && !matchTarget) return false;
                      }
                      return true;
                    });

                    const totalPages = Math.ceil(filtered.length / deletionPerPage) || 1;
                    const currentPage = Math.min(deletionPage, totalPages);
                    const paginated = filtered.slice((currentPage - 1) * deletionPerPage, currentPage * deletionPerPage);

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center text-slate-400">
                          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                          <p className="text-sm font-bold text-slate-700">該当する削除依頼はありません</p>
                          <p className="text-xs text-slate-400 mt-1">すべての申請が対応済みか、クリーンな状態です</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              <th className="w-8 px-3 py-2.5"></th>
                              <th className="px-3 py-2.5 whitespace-nowrap">申請日時</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ID / 対象ボトル</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">投稿者 / お相手</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">申請者 / 連絡先</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">削除理由・詳細</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">対応状態</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">即時アクション</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {paginated.map(req => {
                              const isChecked = selectedDeletionIds.includes(req.id);
                              const isPending = req.status === 'pending';
                              const isApproved = req.status === 'approved' || req.status === 'resolved';

                              return (
                                <tr key={req.id} className="h-12 hover:bg-slate-50/70 transition-colors group">
                                  <td className="px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedDeletionIds(prev => [...prev, req.id]);
                                        } else {
                                          setSelectedDeletionIds(prev => prev.filter(id => id !== req.id));
                                        }
                                      }}
                                      className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                    />
                                  </td>

                                  {/* 1. Created At */}
                                  <td className="px-3 py-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                    {new Date(req.created_at).toLocaleString('ja-JP', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>

                                  {/* 2. Target Bottle */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-slate-400 text-[10px]">#{req.id}</span>
                                      <a
                                        href={req.url || `/post/${req.post_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                      >
                                        <span>✉️ #{req.post_id || 'URL'}</span>
                                        <ExternalLink size={10} />
                                      </a>
                                    </div>
                                  </td>

                                  {/* 3. Post Author & Target */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      {req.post_author_id ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleViewUser({ id: req.post_author_id, username: req.post_author_name });
                                            setActiveTab('users');
                                          }}
                                          className="font-bold text-slate-800 hover:text-brand-primary hover:underline text-left cursor-pointer"
                                        >
                                          @{req.post_author_name}
                                        </button>
                                      ) : (
                                        <span className="text-slate-400 italic">@{req.post_author_name || '削除済'}</span>
                                      )}
                                      {req.target_name && (
                                        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                          宛: {req.target_name}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* 4. Requester & Contact */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-800">{req.name}</span>
                                      <a
                                        href={`mailto:${req.email}`}
                                        className="text-[10px] text-slate-500 hover:text-brand-primary hover:underline font-mono"
                                      >
                                        {req.email}
                                      </a>
                                    </div>
                                  </td>

                                  {/* 5. Reason */}
                                  <td className="px-3 py-2 max-w-xs truncate text-slate-700">
                                    <div className="flex flex-col max-w-xs">
                                      <span className="font-serif font-bold text-slate-800 truncate" title={req.reason}>
                                        {req.reason}
                                      </span>
                                      {req.explanation && (
                                        <span className="text-[10px] text-slate-500 truncate" title={req.explanation}>
                                          {req.explanation}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* 6. Status Badge */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isPending 
                                        ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                        : isApproved 
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                        : 'bg-rose-100 text-rose-800 border-rose-300'
                                    }`}>
                                      {isPending ? <Clock size={10} /> : isApproved ? <CheckCircle2 size={10} /> : <X size={10} />}
                                      <span>{isPending ? '未対応 (pending)' : isApproved ? '承認済 (approved)' : '却下 (rejected)'}</span>
                                    </span>
                                  </td>

                                  {/* 7. Action */}
                                  <td className="px-3 py-2 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {isPending && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveDeletionRequest(req.id)}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                          title="削除依頼を承認し、対象ボトルメールを消去"
                                        >
                                          <CheckCircle2 size={12} />
                                          <span>承認</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => setSelectedDeletionRequest(req)}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                        title="申請の詳細を確認"
                                      >
                                        <Eye size={13} />
                                      </button>

                                      {isPending && (
                                        <button
                                          type="button"
                                          onClick={() => handleRejectDeletionRequest(req.id)}
                                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                          title="削除依頼を却下"
                                        >
                                          <X size={13} />
                                        </button>
                                      )}
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
                            <span className="font-bold text-slate-800">{(currentPage - 1) * deletionPerPage + 1}</span> 〜{' '}
                            <span className="font-bold text-slate-800">{Math.min(currentPage * deletionPerPage, filtered.length)}</span> 件を表示
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setDeletionPage(1)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &laquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setDeletionPage(prev => Math.max(prev - 1, 1))}
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
                                onClick={() => setDeletionPage(prev => Math.min(prev + 1, totalPages))}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &rsaquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setDeletionPage(totalPages)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &raquo;
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
  );
};
