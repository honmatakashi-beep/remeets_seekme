import { EkycProgressTelemetryPanel } from "../../../components/EkycProgressTelemetryPanel";
import React from "react";
import {
  UserCheck, X, ShieldAlert, Eye, FileCheck, Zap, ChevronUp, ChevronDown, Download, Search, Filter, CheckCircle2, XCircle, Clock, ShieldCheck,
  CreditCard, Phone, User, Calendar, ExternalLink, RefreshCw
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminAgeVerificationTabProps {
  [key: string]: any;
}

export const AdminAgeVerificationTab: React.FC<AdminAgeVerificationTabProps> = (props) => {
      const {
    ageVerificationLogs = [],
    ageTabFilter = "all",
    setAgeTabFilter = () => {},
    ageSearchTerm = "",
    setAgeSearchTerm = () => {},
    ageFilterStartDate = "",
    setAgeFilterStartDate = () => {},
    ageFilterEndDate = "",
    setAgeFilterEndDate = () => {},
    agePage = 1,
    setAgePage = () => {},
    agePerPage = 10,
    setAgePerPage = () => {},
    handleViewUser = () => {},
    setActiveTab = () => {},
    setSelectedAgeLogModal = () => {},
    isTelemetryExpanded = false,
    setIsTelemetryExpanded = () => {}
  } = props;

  return (
            <div className="space-y-6">
              {/* 1. KPI Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 font-sans">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">総確認・誓約ログ</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <FileCheck size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-slate-800">{ageVerificationLogs.length}</span>
                    <span className="text-xs text-slate-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>全セッション累積</span>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">🛡️ 公的 eKYC 完了</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-emerald-700">
                      {ageVerificationLogs.filter(l => {
                        if (l.is_ekyc_verified || (l.metadata_json && (l.metadata_json.includes('eKYC') || l.metadata_json.includes('primary_ekyc')))) return true;
                        return false;
                      }).length}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      ({ageVerificationLogs.length > 0 
                        ? Math.round((ageVerificationLogs.filter(l => l.is_ekyc_verified || (l.metadata_json && (l.metadata_json.includes('eKYC') || l.metadata_json.includes('primary_ekyc')))).length / ageVerificationLogs.length) * 100) 
                        : 0}%)
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-700 font-medium">マイナンバー/免許証/パスポート</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-blue-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700">📝 自己申告 宣誓</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <UserCheck size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-blue-700">
                      {ageVerificationLogs.filter(l => {
                        const isEkyc = l.is_ekyc_verified || (l.metadata_json && (l.metadata_json.includes('eKYC') || l.metadata_json.includes('primary_ekyc')));
                        return l.is_verified && !isEkyc;
                      }).length}
                    </span>
                    <span className="text-xs text-blue-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-blue-700 font-medium">18歳以上利用規約同意</div>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">⚡ 本日（24h以内）新規</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Zap size={16} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold font-serif text-amber-700">
                      {ageVerificationLogs.filter(l => {
                        const d = new Date(l.created_at);
                        const now = new Date();
                        return (now.getTime() - d.getTime()) <= 24 * 60 * 60 * 1000;
                      }).length}
                    </span>
                    <span className="text-xs text-amber-500">件</span>
                  </div>
                  <div className="mt-1 text-[11px] text-amber-700 font-medium">直近のアクセス照合</div>
                </div>
              </div>

              {/* 2. eKYC Telemetry & Matching Progress Panel (Collapsible) */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
                <div 
                  onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
                  className="p-4 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-blue-50/30 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>eKYC 公的本人確認 リアルタイム照合ゲージ ＆ 真贋解析エンジン</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          AI 真贋 99.4%
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        OCR文字認識・3Dライブネス生体検知・EMV 3Dセキュア決済照合・デジタル監査証跡の4重多層判定
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      {isTelemetryExpanded ? 'テレメトリを閉じる' : 'テレメトリを展開'}
                    </span>
                    {isTelemetryExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </div>

                {isTelemetryExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/30">
                    <EkycProgressTelemetryPanel isVerified={true} />
                  </div>
                )}
              </div>

              {/* 3. Main Data Table Card */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
                {/* Header with Title & Action */}
                <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>本人確認（eKYC）＆ 安全誓約 監査ログ一覧</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          全 {ageVerificationLogs.length} 件
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        警察・公安令状照会および内部ガバナンス監査に対応した完全証跡（非可逆ハッシュトークン管理）
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = ageVerificationLogs.filter(log => {
                          const isEkyc = log.is_ekyc_verified || (log.metadata_json && (log.metadata_json.includes('eKYC') || log.metadata_json.includes('primary_ekyc')));
                          if (ageTabFilter === 'ekyc' && !isEkyc) return false;
                          if (ageTabFilter === 'self' && (isEkyc || !log.is_verified)) return false;
                          if (ageTabFilter === 'failed' && log.is_verified) return false;
                          if (ageFilterStartDate) {
                            const start = new Date(ageFilterStartDate);
                            start.setHours(0, 0, 0, 0);
                            if (new Date(log.created_at) < start) return false;
                          }
                          if (ageFilterEndDate) {
                            const end = new Date(ageFilterEndDate);
                            end.setHours(23, 59, 59, 999);
                            if (new Date(log.created_at) > end) return false;
                          }
                          if (ageSearchTerm.trim()) {
                            const q = ageSearchTerm.toLowerCase();
                            const matchUser = (log.username || '').toLowerCase().includes(q);
                            const matchName = (log.full_name || '').toLowerCase().includes(q);
                            const matchEmail = (log.email || '').toLowerCase().includes(q);
                            const matchIp = (log.ip || '').toLowerCase().includes(q);
                            const matchReason = (log.reason || '').toLowerCase().includes(q);
                            const matchMeta = (log.metadata_json || '').toLowerCase().includes(q);
                            if (!matchUser && !matchName && !matchEmail && !matchIp && !matchReason && !matchMeta) return false;
                          }
                          return true;
                        });

                        const headers = ['ID', '日時', 'ユーザーID', 'ユーザー名', '氏名', 'メールアドレス', '判定結果', '認証区分', '同意年齢', '提出書類', '誓約内容', 'IPアドレス', 'メタデータ'];
                        const csvRows = [headers.join(',')];

                        filtered.forEach(log => {
                          const isEkyc = log.is_ekyc_verified || (log.metadata_json && (log.metadata_json.includes('eKYC') || log.metadata_json.includes('primary_ekyc')));
                          let docType = '自己申告';
                          if (log.metadata_json) {
                            try {
                              const meta = JSON.parse(log.metadata_json);
                              if (meta.document_type === 'mynumber') docType = 'マイナンバーカード';
                              else if (meta.document_type === 'driver_license') docType = '運転免許証';
                              else if (meta.document_type === 'passport') docType = 'パスポート';
                              else if (meta.document_type) docType = meta.document_type;
                            } catch (e) {}
                          }

                          const row = [
                            log.id || '',
                            `"${new Date(log.created_at).toLocaleString().replace(/"/g, '""')}"`,
                            log.user_id || '',
                            `"${(log.username || 'Guest').replace(/"/g, '""')}"`,
                            `"${(log.full_name || '-').replace(/"/g, '""')}"`,
                            `"${(log.email || '-').replace(/"/g, '""')}"`,
                            `"${log.is_verified ? '承認済 (合格)' : '未完了 (失敗)'}"`,
                            `"${isEkyc ? '公的eKYC' : '自己申告宣誓'}"`,
                            `"${log.age ? `${log.age}歳` : '-'}"`,
                            `"${docType}"`,
                            `"${(log.reason || '').replace(/"/g, '""')}"`,
                            `"${log.ip || ''}"`,
                            `"${(log.metadata_json || '').replace(/"/g, '""')}"`
                          ];
                          csvRows.push(row.join(','));
                        });

                        const csvContent = "\uFEFF" + csvRows.join("\n");
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `ekyc_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>警察・監査用 CSV 出力</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 space-y-3">
                  {/* Status Tabs */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                      {[
                        { id: 'all', label: 'すべて', count: ageVerificationLogs.length },
                        { 
                          id: 'ekyc', 
                          label: '🛡️ 公的 eKYC', 
                          count: ageVerificationLogs.filter(l => l.is_ekyc_verified || (l.metadata_json && (l.metadata_json.includes('eKYC') || l.metadata_json.includes('primary_ekyc')))).length 
                        },
                        { 
                          id: 'self', 
                          label: '📝 自己申告', 
                          count: ageVerificationLogs.filter(l => {
                            const isEkyc = l.is_ekyc_verified || (l.metadata_json && (l.metadata_json.includes('eKYC') || l.metadata_json.includes('primary_ekyc')));
                            return l.is_verified && !isEkyc;
                          }).length 
                        },
                        { 
                          id: 'failed', 
                          label: '⚠️ 未完了・失敗', 
                          count: ageVerificationLogs.filter(l => !l.is_verified).length 
                        },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => { setAgeTabFilter(t.id as any); setAgePage(1); }}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            ageTabFilter === t.id
                              ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                          }`}
                        >
                          <span>{t.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            ageTabFilter === t.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {t.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">表示件数:</span>
                      <select
                        value={agePerPage}
                        onChange={(e) => { setAgePerPage(Number(e.target.value)); setAgePage(1); }}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 font-bold focus:outline-none focus:border-brand-primary"
                      >
                        <option value={25}>25件</option>
                        <option value={50}>50件</option>
                        <option value={100}>100件</option>
                        <option value={9999}>全件</option>
                      </select>
                    </div>
                  </div>

                  {/* Search input & Date range */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                    <div className="md:col-span-6 relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={ageSearchTerm}
                        onChange={(e) => { setAgeSearchTerm(e.target.value); setAgePage(1); }}
                        placeholder="ユーザー名、本名、メール、IPアドレス、書類種別、理由で検索..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-medium"
                      />
                      {ageSearchTerm && (
                        <button
                          type="button"
                          onClick={() => { setAgeSearchTerm(''); setAgePage(1); }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="md:col-span-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">開始:</span>
                      <input
                        type="date"
                        value={ageFilterStartDate}
                        onChange={(e) => { setAgeFilterStartDate(e.target.value); setAgePage(1); }}
                        className="w-full text-xs text-slate-700 bg-transparent focus:outline-none"
                      />
                      {ageFilterStartDate && (
                        <button type="button" onClick={() => setAgeFilterStartDate('')} className="text-slate-400 hover:text-slate-600">
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="md:col-span-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">終了:</span>
                      <input
                        type="date"
                        value={ageFilterEndDate}
                        onChange={(e) => { setAgeFilterEndDate(e.target.value); setAgePage(1); }}
                        className="w-full text-xs text-slate-700 bg-transparent focus:outline-none"
                      />
                      {ageFilterEndDate && (
                        <button type="button" onClick={() => setAgeFilterEndDate('')} className="text-slate-400 hover:text-slate-600">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Component */}
                <div className="overflow-x-auto">
                  {(() => {
                    const filtered = ageVerificationLogs.filter(log => {
                      const isEkyc = log.is_ekyc_verified || (log.metadata_json && (log.metadata_json.includes('eKYC') || log.metadata_json.includes('primary_ekyc')));
                      if (ageTabFilter === 'ekyc' && !isEkyc) return false;
                      if (ageTabFilter === 'self' && (isEkyc || !log.is_verified)) return false;
                      if (ageTabFilter === 'failed' && log.is_verified) return false;
                      if (ageFilterStartDate) {
                        const start = new Date(ageFilterStartDate);
                        start.setHours(0, 0, 0, 0);
                        if (new Date(log.created_at) < start) return false;
                      }
                      if (ageFilterEndDate) {
                        const end = new Date(ageFilterEndDate);
                        end.setHours(23, 59, 59, 999);
                        if (new Date(log.created_at) > end) return false;
                      }
                      if (ageSearchTerm.trim()) {
                        const q = ageSearchTerm.toLowerCase();
                        const matchUser = (log.username || '').toLowerCase().includes(q);
                        const matchName = (log.full_name || '').toLowerCase().includes(q);
                        const matchEmail = (log.email || '').toLowerCase().includes(q);
                        const matchIp = (log.ip || '').toLowerCase().includes(q);
                        const matchReason = (log.reason || '').toLowerCase().includes(q);
                        const matchMeta = (log.metadata_json || '').toLowerCase().includes(q);
                        if (!matchUser && !matchName && !matchEmail && !matchIp && !matchReason && !matchMeta) return false;
                      }
                      return true;
                    });

                    const totalPages = Math.ceil(filtered.length / agePerPage) || 1;
                    const currentPage = Math.min(agePage, totalPages);
                    const paginated = filtered.slice((currentPage - 1) * agePerPage, currentPage * agePerPage);

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center text-slate-400">
                          <ShieldAlert size={36} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-bold text-slate-600">該当する本人確認・誓約ログは見つかりませんでした</p>
                          <p className="text-xs text-slate-400 mt-1">検索キーワードまたは期間フィルターを変更してください</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              <th className="px-3.5 py-2.5 whitespace-nowrap">日時</th>
                              <th className="px-3.5 py-2.5 whitespace-nowrap">ユーザー</th>
                              <th className="px-3.5 py-2.5 whitespace-nowrap">本人確認区分 / 判定</th>
                              <th className="px-3.5 py-2.5 whitespace-nowrap">同意年齢</th>
                              <th className="px-3.5 py-2.5 whitespace-nowrap">提出書類 / 誓約資格</th>
                              <th className="px-3.5 py-2.5 whitespace-nowrap">IPアドレス</th>
                              <th className="px-3.5 py-2.5 text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {paginated.map(l => {
                              let isEkyc = false;
                              let docType = '';
                              let docLabel = '自己申告宣誓';
                              let provider = '';
                              if (l.metadata_json) {
                                try {
                                  const meta = JSON.parse(l.metadata_json);
                                  if (meta.method === 'eKYC' || meta.verification_flow === 'primary_ekyc' || meta.is_primary_id_verified) {
                                    isEkyc = true;
                                    docType = meta.document_type || '';
                                    provider = meta.provider || '';
                                  }
                                } catch (e) {
                                  if (l.metadata_json.includes('eKYC') || l.metadata_json.includes('primary_ekyc')) {
                                    isEkyc = true;
                                  }
                                }
                              }
                              if (l.is_ekyc_verified) isEkyc = true;

                              if (isEkyc) {
                                if (docType === 'mynumber' || l.ekyc_document_type === 'mynumber') docLabel = 'マイナンバーカード';
                                else if (docType === 'driver_license' || l.ekyc_document_type === 'driver_license') docLabel = '運転免許証';
                                else if (docType === 'passport' || l.ekyc_document_type === 'passport') docLabel = 'パスポート';
                                else docLabel = '公的身分証明書';
                              }

                              return (
                                <tr key={l.id} className="h-12 hover:bg-slate-50/70 transition-colors group">
                                  {/* 1. Created At */}
                                  <td className="px-3.5 py-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                    {new Date(l.created_at).toLocaleString('ja-JP', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>

                                  {/* 2. User */}
                                  <td className="px-3.5 py-2 whitespace-nowrap">
                                    {l.user_id ? (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleViewUser({ id: l.user_id, username: l.username });
                                            setActiveTab('users');
                                          }}
                                          className="font-bold text-slate-800 hover:text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                          <span>@{l.username || `User #${l.user_id}`}</span>
                                        </button>
                                        {l.full_name && (
                                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                            {l.full_name}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic font-medium">Guest (未ログイン)</span>
                                    )}
                                  </td>

                                  {/* 3. Verification Badge */}
                                  <td className="px-3.5 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      {l.is_verified ? (
                                        isEkyc ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            <ShieldCheck size={12} className="text-emerald-600" />
                                            <span>公的 eKYC 認証済</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                            <UserCheck size={12} className="text-blue-600" />
                                            <span>自己申告 宣誓済</span>
                                          </span>
                                        )
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                                          <X size={12} className="text-red-600" />
                                          <span>未完了・失敗</span>
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* 4. Age */}
                                  <td className="px-3.5 py-2 whitespace-nowrap">
                                    <span className="font-bold text-slate-700">
                                      {l.age ? (l.age >= 18 ? '18歳以上' : `${l.age}歳`) : '18+'}
                                    </span>
                                  </td>

                                  {/* 5. Document Type / Reason */}
                                  <td className="px-3.5 py-2 max-w-xs truncate text-slate-600">
                                    <div className="flex items-center gap-1.5 truncate">
                                      {isEkyc ? (
                                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                          {docLabel}
                                        </span>
                                      ) : (
                                        <span className="text-slate-500 font-medium truncate" title={l.reason || '利用規約および年齢同意'}>
                                          {l.reason || '利用規約および年齢同意'}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* 6. IP */}
                                  <td className="px-3.5 py-2 whitespace-nowrap font-mono text-[11px] text-slate-500">
                                    {l.ip || '127.0.0.1'}
                                  </td>

                                  {/* 7. Action */}
                                  <td className="px-3.5 py-2 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedAgeLogModal(l)}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                        title="詳細監査証跡モーダルを開く"
                                      >
                                        <Eye size={13} />
                                      </button>
                                      {l.user_id && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleViewUser({ id: l.user_id, username: l.username });
                                            setActiveTab('users');
                                          }}
                                          className="p-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg transition-colors cursor-pointer"
                                          title="ユーザー詳細を見る"
                                        >
                                          <User size={13} />
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
                            <span className="font-bold text-slate-800">{(currentPage - 1) * agePerPage + 1}</span> 〜{' '}
                            <span className="font-bold text-slate-800">{Math.min(currentPage * agePerPage, filtered.length)}</span> 件を表示
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setAgePage(1)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &laquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setAgePage(prev => Math.max(prev - 1, 1))}
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
                                onClick={() => setAgePage(prev => Math.min(prev + 1, totalPages))}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &rsaquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setAgePage(totalPages)}
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
