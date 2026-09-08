import React from "react";
import {
  Flag, UserX, Download, Search, Filter, ShieldAlert, CheckCircle2, Clock, AlertTriangle,
  User, ExternalLink, Eye, Check, X, Shield, RefreshCw
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminReportsTabProps {
  [key: string]: any;
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = (props) => {
    const {
    reports = [],
    reportFilter = "all",
    setReportFilter = () => {},
    reportStatusFilter = "all",
    setReportStatusFilter = () => {},
    reportSearchTerm = "",
    setReportSearchTerm = () => {},
    reportPage = 1,
    setReportPage = () => {},
    reportPerPage = 10,
    setReportPerPage = () => {},
    selectedReportIds = [],
    setSelectedReportIds = () => {},
    handleBatchResolveReports = () => {},
    isBatchUpdatingReports = false,
    handleBatchDismissReports = () => {},
    handleResolveReport = () => {},
    handleDismissReport = () => {},
    handleToggleFreezeUser = () => {},
    handleViewUser = () => {},
    setActiveTab = () => {},
    setSelectedReport = () => {},
    selectedReport = null
  } = props;

  return (
            <div className="space-y-6 text-left font-sans animate-fade-in">
              {/* 1. 4大通報KPIサマリーカード */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">📋 総通報受付数</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-slate-800">{reports.length}</span>
                    <span className="text-xs text-slate-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-medium">全期間のユーザー通報</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">⚠️ 未対応（対応待ち）</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-amber-700">
                      {reports.filter(r => r.status === 'pending').length}
                    </span>
                    <span className="text-xs text-amber-500 font-semibold">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-amber-600 font-medium">管理者の対応待ち</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-rose-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700">🚨 緊急・ストーカー疑い</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <ShieldAlert size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-rose-700">
                      {reports.filter(r => {
                        const reason = (r.reason || '').toLowerCase();
                        return reason.includes('ストーカー') || reason.includes('脅迫') || reason.includes('晒し') || reason.includes('嫌がらせ') || r.report_type === 'stalking';
                      }).length}
                    </span>
                    <span className="text-xs text-rose-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-rose-600 font-medium">警察・法務連携優先事案</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">✅ 解決・対応完了</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-emerald-700">
                      {reports.filter(r => r.status === 'resolved').length}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      ({reports.length > 0 ? Math.round((reports.filter(r => r.status === 'resolved').length / reports.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-600 font-medium">対処完了済み</div>
                </div>
              </div>

              {/* 2. メインデータカード */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
                {/* Header */}
                <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>ユーザー通報 ＆ 不適切報告管理</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          全 {reports.length} 件
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ユーザーから送信された不適切ボトル・迷惑行為・ストーキング通報の調査と対処
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const headers = ["通報ID", "日時", "状態", "対象種別", "対象ID", "対象ユーザー", "通報者", "通報理由"];
                        const rows = reports.map(r => [
                          r.id,
                          `"${new Date(r.created_at).toLocaleString().replace(/"/g, '""')}"`,
                          r.status,
                          r.target_type,
                          r.target_id || '',
                          `"${(r.target_username || 'Unknown').replace(/"/g, '""')}"`,
                          `"${(r.reporter_name || '匿名').replace(/"/g, '""')}"`,
                          `"${(r.reason || '').replace(/"/g, '""')}"`
                        ]);
                        const csvContent = "\\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\\n");
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `reports_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>通報監査 CSV 出力</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                      {[
                        { id: 'all', label: 'すべて', count: reports.length },
                        { id: 'pending', label: '⚠️ 未対応', count: reports.filter(r => r.status === 'pending').length },
                        { 
                          id: 'urgent', 
                          label: '🚨 緊急・ストーカー', 
                          count: reports.filter(r => (r.reason || '').includes('ストーカー') || (r.reason || '').includes('脅迫') || r.report_type === 'stalking').length 
                        },
                        { id: 'resolved', label: '✅ 解決済', count: reports.filter(r => r.status === 'resolved').length },
                        { id: 'dismissed', label: '✕ 却下', count: reports.filter(r => r.status === 'dismissed').length },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setReportStatusFilter(t.id as any); setReportPage(1); }}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            reportStatusFilter === t.id
                              ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                          }`}
                        >
                          <span>{t.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            reportStatusFilter === t.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {t.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">表示件数:</span>
                      <select
                        value={reportPerPage}
                        onChange={(e) => { setReportPerPage(Number(e.target.value)); setReportPage(1); }}
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
                      value={reportSearchTerm}
                      onChange={(e) => { setReportSearchTerm(e.target.value); setReportPage(1); }}
                      placeholder="通報理由、対象ユーザー名、通報者名、対象種別で検索..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-medium"
                    />
                    {reportSearchTerm && (
                      <button
                        type="button"
                        onClick={() => { setReportSearchTerm(''); setReportPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Batch Action Bar */}
                  {reports.length > 0 && (
                    <div className="flex items-center justify-between bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={reports.length > 0 && reports.every(r => selectedReportIds.includes(r.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReportIds(reports.map(r => r.id));
                            } else {
                              setSelectedReportIds([]);
                            }
                          }}
                          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-amber-900">
                          全選択 ({selectedReportIds.length} / {reports.length}件 選択中)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleBatchResolveReports}
                          disabled={selectedReportIds.length === 0 || isBatchUpdatingReports}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 size={13} />
                          <span>選択一括解決済みにする ({selectedReportIds.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleBatchDismissReports}
                          disabled={selectedReportIds.length === 0 || isBatchUpdatingReports}
                          className="flex items-center gap-1 px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        >
                          <X size={13} />
                          <span>選択一括却下 ({selectedReportIds.length})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Table Component */}
                <div className="overflow-x-auto">
                  {(() => {
                    const filtered = reports.filter(r => {
                      const reason = (r.reason || '').toLowerCase();
                      const isUrgent = reason.includes('ストーカー') || reason.includes('脅迫') || reason.includes('晒し') || reason.includes('嫌がらせ') || r.report_type === 'stalking';

                      if (reportStatusFilter === 'pending' && r.status !== 'pending') return false;
                      if (reportStatusFilter === 'urgent' && !isUrgent) return false;
                      if (reportStatusFilter === 'resolved' && r.status !== 'resolved') return false;
                      if (reportStatusFilter === 'dismissed' && r.status !== 'dismissed') return false;

                      if (reportSearchTerm.trim()) {
                        const q = reportSearchTerm.toLowerCase();
                        const matchReason = (r.reason || '').toLowerCase().includes(q);
                        const matchTarget = (r.target_username || '').toLowerCase().includes(q);
                        const matchReporter = (r.reporter_name || '').toLowerCase().includes(q);
                        const matchType = (r.target_type || '').toLowerCase().includes(q);
                        if (!matchReason && !matchTarget && !matchReporter && !matchType) return false;
                      }
                      return true;
                    });

                    const totalPages = Math.ceil(filtered.length / reportPerPage) || 1;
                    const currentPage = Math.min(reportPage, totalPages);
                    const paginated = filtered.slice((currentPage - 1) * reportPerPage, currentPage * reportPerPage);

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center text-slate-400">
                          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                          <p className="text-sm font-bold text-slate-700">該当する通報はありません</p>
                          <p className="text-xs text-slate-400 mt-1">すべての通報が対応完了済みか、クリーンな状態です</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              <th className="w-8 px-3 py-2.5"></th>
                              <th className="px-3 py-2.5 whitespace-nowrap">通報日時</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ID / 対象種別</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">対象アカウント</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">通報理由・詳細</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">通報者</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">対応状態</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">即時アクション</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {paginated.map(report => {
                              const isChecked = selectedReportIds.includes(report.id);
                              const isPending = report.status === 'pending';
                              const isResolved = report.status === 'resolved';
                              const reason = (report.reason || '').toLowerCase();
                              const isUrgent = reason.includes('ストーカー') || reason.includes('脅迫') || reason.includes('晒し');

                              return (
                                <tr key={report.id} className="h-12 hover:bg-slate-50/70 transition-colors group">
                                  <td className="px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedReportIds(prev => [...prev, report.id]);
                                        } else {
                                          setSelectedReportIds(prev => prev.filter(id => id !== report.id));
                                        }
                                      }}
                                      className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                    />
                                  </td>

                                  {/* 1. Created At */}
                                  <td className="px-3 py-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                    {new Date(report.created_at).toLocaleString('ja-JP', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>

                                  {/* 2. Target Type */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-slate-400 text-[10px]">#{report.id}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        report.target_type === 'post' 
                                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                                      }`}>
                                        {report.target_type === 'post' ? '✉️ ボトル' : '👤 ユーザー'}
                                      </span>
                                      {report.target_id && (
                                        <span className="font-mono text-slate-400 text-[10px]">ID:{report.target_id}</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* 3. Target User */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    {report.target_user_id ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleViewUser({ id: report.target_user_id, username: report.target_username });
                                          setActiveTab('users');
                                        }}
                                        className="font-bold text-slate-800 hover:text-brand-primary hover:underline cursor-pointer"
                                      >
                                        @{report.target_username || `User #${report.target_user_id}`}
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 italic font-medium">{report.target_username || '不明'}</span>
                                    )}
                                  </td>

                                  {/* 4. Reason */}
                                  <td className="px-3 py-2 max-w-xs truncate text-slate-700">
                                    <div className="flex items-center gap-1.5 truncate">
                                      {isUrgent && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                                          🚨 緊急
                                        </span>
                                      )}
                                      <span className="truncate font-serif" title={report.reason}>
                                        "{report.reason}"
                                      </span>
                                    </div>
                                  </td>

                                  {/* 5. Reporter */}
                                  <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                                    <span className="font-medium text-slate-700">
                                      {report.reporter_name || 'システム自動検知'}
                                    </span>
                                  </td>

                                  {/* 6. Status Badge */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isPending 
                                        ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                        : isResolved 
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                        : 'bg-slate-100 text-slate-700 border-slate-300'
                                    }`}>
                                      {isPending ? <Clock size={10} /> : isResolved ? <CheckCircle2 size={10} /> : <X size={10} />}
                                      <span>{isPending ? '未対応 (pending)' : isResolved ? '解決済 (resolved)' : '却下 (dismissed)'}</span>
                                    </span>
                                  </td>

                                  {/* 7. Action */}
                                  <td className="px-3 py-2 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {isPending && (
                                        <button
                                          type="button"
                                          onClick={() => handleResolveReport(report.id)}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                          title="この通報を解決済みにする"
                                        >
                                          <CheckCircle2 size={12} />
                                          <span>解決</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => setSelectedReport(report)}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                        title="通報の詳細を確認"
                                      >
                                        <Eye size={13} />
                                      </button>

                                      {report.target_user_id && (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleFreezeUser(report.target_user_id, 0)}
                                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                                          title="対象ユーザーを即時凍結(BAN)"
                                        >
                                          <UserX size={13} />
                                        </button>
                                      )}

                                      {isPending && (
                                        <button
                                          type="button"
                                          onClick={() => handleDismissReport(report.id)}
                                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                                          title="問題なしとして却下"
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
                            <span className="font-bold text-slate-800">{(currentPage - 1) * reportPerPage + 1}</span> 〜{' '}
                            <span className="font-bold text-slate-800">{Math.min(currentPage * reportPerPage, filtered.length)}</span> 件を表示
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setReportPage(1)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &laquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setReportPage(prev => Math.max(prev - 1, 1))}
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
                                onClick={() => setReportPage(prev => Math.min(prev + 1, totalPages))}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &rsaquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setReportPage(totalPages)}
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
