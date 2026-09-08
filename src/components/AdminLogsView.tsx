import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  History, 
  Shield, 
  ShieldAlert, 
  Search, 
  Download, 
  FileText, 
  Filter, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Users, 
  Clock, 
  Calendar, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  Laptop
} from 'lucide-react';

interface AuditLog {
  id: number;
  user_id?: number;
  username?: string;
  action: string;
  details?: string;
  ip?: string;
  created_at: string;
}

interface ActionLog {
  id: number;
  user_id?: number;
  username?: string;
  action: string;
  details?: string;
  ip?: string;
  created_at: string;
}

interface AccessLog {
  id: number;
  user_id?: number;
  username?: string;
  path: string;
  method: string;
  ip?: string;
  status_code?: number;
  user_agent?: string;
  created_at: string;
}

interface AdminLogsViewProps {
  auditLogs: AuditLog[];
  actionLogs: ActionLog[];
  accessLogs: AccessLog[];
  onRefresh?: () => void;
  loading?: boolean;
}

export const AdminLogsView: React.FC<AdminLogsViewProps> = ({
  auditLogs = [],
  actionLogs = [],
  accessLogs = [],
  onRefresh,
  loading = false
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'audit' | 'actions' | 'access'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLogDetail, setSelectedLogDetail] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showLogGuideModal, setShowLogGuideModal] = useState(false);

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Click IP to filter
  const handleFilterByIp = (ip: string) => {
    setSearchQuery(ip);
    setCurrentPage(1);
  };

  // Click Username to filter
  const handleFilterByUser = (username: string) => {
    setSearchQuery(username);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  // Unified stream items
  const unifiedStream = useMemo(() => {
    const combined: Array<{
      id: string;
      source: 'audit' | 'action' | 'access';
      timestamp: string;
      user: string;
      tag: string;
      content: string;
      ip: string;
      raw: any;
    }> = [];

    auditLogs.forEach(l => {
      combined.push({
        id: `audit-${l.id}-${l.created_at}`,
        source: 'audit',
        timestamp: l.created_at,
        user: l.username || 'Admin',
        tag: l.action,
        content: l.details || '',
        ip: l.ip || '127.0.0.1',
        raw: l
      });
    });

    actionLogs.forEach(l => {
      combined.push({
        id: `action-${l.id}-${l.created_at}`,
        source: 'action',
        timestamp: l.created_at,
        user: l.username || 'Guest',
        tag: l.action,
        content: l.details || '',
        ip: l.ip || '127.0.0.1',
        raw: l
      });
    });

    accessLogs.forEach(l => {
      combined.push({
        id: `access-${l.id}-${l.created_at}`,
        source: 'access',
        timestamp: l.created_at,
        user: l.username || 'Guest',
        tag: l.method,
        content: l.path,
        ip: l.ip || '127.0.0.1',
        raw: l
      });
    });

    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, actionLogs, accessLogs]);

  // Unique actions list for dropdown filter
  const availableActionTypes = useMemo(() => {
    const actions = new Set<string>();
    auditLogs.forEach(l => l.action && actions.add(l.action));
    actionLogs.forEach(l => l.action && actions.add(l.action));
    return Array.from(actions).sort();
  }, [auditLogs, actionLogs]);

  // Date filter helper
  const isDateMatching = (dateStr: string) => {
    if (dateFilter === 'all') return true;
    const logDate = new Date(dateStr).getTime();
    const now = Date.now();
    if (dateFilter === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      return logDate >= todayStart;
    }
    if (dateFilter === '7days') {
      return now - logDate <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === '30days') {
      return now - logDate <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  };

  // Filtered dataset according to active subtab and filters
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (activeSubTab === 'all') {
      return unifiedStream.filter(item => {
        if (!isDateMatching(item.timestamp)) return false;
        if (actionFilter !== 'all' && item.tag !== actionFilter) return false;
        if (!q) return true;
        return (
          item.user.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.ip.toLowerCase().includes(q)
        );
      });
    }

    if (activeSubTab === 'audit') {
      return auditLogs.filter(l => {
        if (!isDateMatching(l.created_at)) return false;
        if (actionFilter !== 'all' && l.action !== actionFilter) return false;
        if (!q) return true;
        return (
          (l.username || '').toLowerCase().includes(q) ||
          (l.action || '').toLowerCase().includes(q) ||
          (l.details || '').toLowerCase().includes(q) ||
          (l.ip || '').toLowerCase().includes(q)
        );
      });
    }

    if (activeSubTab === 'actions') {
      return actionLogs.filter(l => {
        if (!isDateMatching(l.created_at)) return false;
        if (actionFilter !== 'all' && l.action !== actionFilter) return false;
        if (!q) return true;
        return (
          (l.username || '').toLowerCase().includes(q) ||
          (l.action || '').toLowerCase().includes(q) ||
          (l.details || '').toLowerCase().includes(q) ||
          (l.ip || '').toLowerCase().includes(q)
        );
      });
    }

    if (activeSubTab === 'access') {
      return accessLogs.filter(l => {
        if (!isDateMatching(l.created_at)) return false;
        if (actionFilter !== 'all' && l.method !== actionFilter) return false;
        if (!q) return true;
        return (
          (l.username || '').toLowerCase().includes(q) ||
          (l.path || '').toLowerCase().includes(q) ||
          (l.method || '').toLowerCase().includes(q) ||
          (l.ip || '').toLowerCase().includes(q)
        );
      });
    }

    return [];
  }, [activeSubTab, unifiedStream, auditLogs, actionLogs, accessLogs, searchQuery, actionFilter, dateFilter]);

  // Pagination calculations
  const totalItems = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safeCurrentPage, pageSize]);

  // CSV Export
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeSubTab === 'all') {
      headers = ['種別', '日時', 'ユーザー', 'アクション/メソッド', '詳細/パス', 'IPアドレス'];
      rows = (filteredLogs as any[]).map(item => [
        item.source === 'audit' ? '管理者監査' : item.source === 'action' ? 'ユーザー操作' : 'APIアクセス',
        new Date(item.timestamp).toLocaleString(),
        item.user,
        item.tag,
        `"${(item.content || '').replace(/"/g, '""')}"`,
        item.ip
      ]);
    } else if (activeSubTab === 'audit') {
      headers = ['ID', '日時', '管理者名', 'アクション', '詳細内容', 'IPアドレス'];
      rows = (filteredLogs as AuditLog[]).map(l => [
        String(l.id),
        new Date(l.created_at).toLocaleString(),
        l.username || 'Admin',
        l.action,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        l.ip || ''
      ]);
    } else if (activeSubTab === 'actions') {
      headers = ['ID', '日時', 'ユーザー名', 'アクション', '詳細内容', 'IPアドレス'];
      rows = (filteredLogs as ActionLog[]).map(l => [
        String(l.id),
        new Date(l.created_at).toLocaleString(),
        l.username || 'Guest',
        l.action,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        l.ip || ''
      ]);
    } else {
      headers = ['ID', '日時', 'ユーザー名', 'HTTPメソッド', 'リクエストパス', 'IPアドレス'];
      rows = (filteredLogs as AccessLog[]).map(l => [
        String(l.id),
        new Date(l.created_at).toLocaleString(),
        l.username || 'Guest',
        l.method,
        `"${(l.path || '').replace(/"/g, '""')}"`,
        l.ip || ''
      ]);
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `remeets_audit_logs_${activeSubTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // TXT Export for police / official record
  const handleExportTxt = () => {
    const timestamp = new Date().toLocaleString();
    let text = `================================================================================\n`;
    text += ` ReMEETs サーバー監査・捜査照会ログ保全ファイル\n`;
    text += ` 出力日時: ${timestamp}\n`;
    text += ` 抽出種別: ${activeSubTab.toUpperCase()}\n`;
    text += ` 抽出件数: ${filteredLogs.length} 件 (検索条件: "${searchQuery || '指定なし'}")\n`;
    text += `================================================================================\n\n`;

    filteredLogs.forEach((item: any, idx) => {
      if (activeSubTab === 'all') {
        text += `[#${idx + 1}] [${item.source.toUpperCase()}] ${new Date(item.timestamp).toLocaleString()}\n`;
        text += `  ユーザー: ${item.user} | IP: ${item.ip}\n`;
        text += `  種別: ${item.tag}\n`;
        text += `  内容: ${item.content}\n`;
      } else {
        text += `[#${item.id || idx + 1}] ${new Date(item.created_at).toLocaleString()}\n`;
        text += `  ユーザー: ${item.username || 'Guest'} | IP: ${item.ip}\n`;
        text += `  アクション/パス: ${item.action || `${item.method} ${item.path}`}\n`;
        text += `  詳細: ${item.details || item.path || '-'}\n`;
      }
      text += `--------------------------------------------------------------------------------\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `remeets_audit_record_${activeSubTab}_${new Date().toISOString().split('T')[0]}.txt`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action tag color
  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('BAN') || act.includes('BLOCK') || act.includes('REMOVE')) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (act.includes('FAIL') || act.includes('WARN') || act.includes('NG_WORD')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (act.includes('CREATE') || act.includes('SUCCESS') || act.includes('VERIFIED') || act.includes('REGISTER')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (act.includes('LOGIN') || act.includes('AUTH') || act.includes('UPDATE')) {
      return 'bg-sky-100 text-sky-900 border-sky-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-8 text-left font-sans animate-fade-in pb-12">
      {/* 1. Top Header Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-brand-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
              <Terminal size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">システム監査 ＆ 統合ログセンター</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  証拠保全・IP追跡対応
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                全ユーザーのアクション、管理者操作、APIアクセスの生データを改ざんなく時系列で完全記録。セキュリティ監査や法的捜査照会に即応します。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLogGuideModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              仕様書ガイド
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                最新ログ取得
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">📋 全ログ総件数</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-slate-900">{unifiedStream.length.toLocaleString()}</span>
            <span className="text-xs text-slate-600 font-bold">件</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">直近蓄積ストリーム</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">🛡️ 管理者監査ログ</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Shield size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-indigo-900">{auditLogs.length.toLocaleString()}</span>
            <span className="text-xs text-indigo-700 font-bold">件</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">権限・設定変更・配信</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">👤 ユーザーアクション</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <History size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-emerald-900">{actionLogs.length.toLocaleString()}</span>
            <span className="text-xs text-emerald-700 font-bold">件</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">投函・認証・照合操作</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">🌐 APIアクセスログ</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-sky-900">{accessLogs.length.toLocaleString()}</span>
            <span className="text-xs text-sky-700 font-bold">件</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">HTTPリクエスト通信</p>
        </div>
      </div>

      {/* 3. Sub-tabs & Action Toolbar */}
      <div className="bg-white/95 rounded-2xl p-5 border border-brand-border shadow-sm space-y-4">
        {/* Subtabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => { setActiveSubTab('all'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 統合タイムライン ({unifiedStream.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('audit'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛡️ 管理者監査 ({auditLogs.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('actions'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'actions'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👤 ユーザーアクション ({actionLogs.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('access'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'access'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 APIアクセス ({accessLogs.length})
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="CSV形式でダウンロード"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              CSV出力
            </button>
            <button
              onClick={handleExportTxt}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="警察・監査提出用テキストを出力"
            >
              <Download size={14} className="text-slate-600" />
              監査テキスト保存
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
          {/* Search keyword */}
          <div className="lg:col-span-5 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="ユーザー名、IP、アクション名、詳細で検索..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action type filter */}
          <div className="lg:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <option value="all">全アクション / メソッド</option>
              {activeSubTab === 'access' ? (
                <>
                  <option value="GET">GET (取得・閲覧)</option>
                  <option value="POST">POST (送信・作成)</option>
                  <option value="PUT">PUT (更新)</option>
                  <option value="DELETE">DELETE (削除)</option>
                </>
              ) : (
                availableActionTypes.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))
              )}
            </select>
          </div>

          {/* Date Range filter */}
          <div className="lg:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              <option value="all">全期間</option>
              <option value="today">本日 (Today)</option>
              <option value="7days">過去7日間</option>
              <option value="30days">過去30日間</option>
            </select>
          </div>

          {/* Page size & Reset */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="w-full py-2 px-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 cursor-pointer"
            >
              <option value={25}>25件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
              <option value={200}>200件</option>
            </select>

            {(searchQuery || actionFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
                title="フィルターを全解除"
              >
                解除
              </button>
            )}
          </div>
        </div>

        {/* Filter summary status */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1">
          <div>
            該当件数: <strong className="text-slate-900">{totalItems.toLocaleString()}</strong> 件
            {searchQuery && (
              <span className="ml-2 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                検索: "{searchQuery}"
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-600">
            💡 IPアドレスまたはユーザー名をクリックすると即座に絞り込み検索できます
          </div>
        </div>
      </div>

      {/* 4. Main Log Table & Stream */}
      <div className="bg-white/95 rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                {activeSubTab === 'all' && <th className="px-4 py-3 whitespace-nowrap">区分</th>}
                <th className="px-4 py-3 whitespace-nowrap">日時 (JST)</th>
                <th className="px-4 py-3 whitespace-nowrap">対象ユーザー</th>
                <th className="px-4 py-3 whitespace-nowrap">
                  {activeSubTab === 'access' ? 'メソッド' : 'アクション名'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap">
                  {activeSubTab === 'access' ? 'リクエストURIパス' : '詳細コンテキスト (Details)'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap">接続元 IP</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-600">
                    <Terminal size={32} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium">条件に一致するログは見つかりませんでした</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((item: any, idx) => {
                  const isUnified = activeSubTab === 'all';
                  const timestamp = isUnified ? item.timestamp : item.created_at;
                  const username = isUnified ? item.user : (item.username || 'Guest');
                  const tag = isUnified ? item.tag : (item.action || item.method);
                  const content = isUnified ? item.content : (item.details || item.path);
                  const ip = isUnified ? item.ip : (item.ip || '127.0.0.1');
                  const source = isUnified ? item.source : activeSubTab;

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Unified Source Badge */}
                      {isUnified && (
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {source === 'audit' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                              🛡️ 管理監査
                            </span>
                          )}
                          {source === 'action' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                              👤 ユーザー
                            </span>
                          )}
                          {source === 'access' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
                              🌐 API通信
                            </span>
                          )}
                        </td>
                      )}

                      {/* Timestamp */}
                      <td className="px-4 py-2.5 text-slate-600 font-mono whitespace-nowrap">
                        {new Date(timestamp).toLocaleString()}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => handleFilterByUser(username)}
                          className="font-bold text-slate-900 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                          title="このユーザーのログを抽出"
                        >
                          {username}
                        </button>
                      </td>

                      {/* Action / Method */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getActionBadge(tag)}`}>
                          {tag}
                        </span>
                      </td>

                      {/* Details / Path */}
                      <td className="px-4 py-2.5 text-slate-800 max-w-xs md:max-w-md truncate font-sans">
                        {content || '-'}
                      </td>

                      {/* IP Address */}
                      <td className="px-4 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                        <button
                          onClick={() => handleFilterByIp(ip)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer text-[11px]"
                          title="このIPのログを抽出"
                        >
                          {ip}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedLogDetail(item)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            全 <strong className="text-slate-900">{totalItems.toLocaleString()}</strong> 件中{' '}
            <strong className="text-slate-900">{totalItems > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
            <strong className="text-slate-900">{Math.min(safeCurrentPage * pageSize, totalItems)}</strong> 件を表示
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              前へ
            </button>
            <div className="px-3 py-1 font-bold text-slate-800">
              {safeCurrentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              次へ
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Detail Modal */}
      <AnimatePresence>
        {selectedLogDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                      <Terminal size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">ログ詳細インスペクタ</h3>
                      <p className="text-xs text-slate-600">記録された完全なコンテキストデータ</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLogDetail(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-600 block">発生日時 (JST):</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {new Date(selectedLogDetail.timestamp || selectedLogDetail.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-600 block">対象ユーザー:</span>
                    <span className="font-bold text-slate-900">
                      {selectedLogDetail.user || selectedLogDetail.username || 'Guest'}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-600 block">アクション / メソッド:</span>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(selectedLogDetail.tag || selectedLogDetail.action || selectedLogDetail.method)}`}>
                      {selectedLogDetail.tag || selectedLogDetail.action || selectedLogDetail.method}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-600 block">接続元 IPアドレス:</span>
                    <span className="font-mono text-indigo-700 font-bold">
                      {selectedLogDetail.ip || '127.0.0.1'}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-600 block mb-1">詳細内容 (Details / Path):</span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {selectedLogDetail.content || selectedLogDetail.details || selectedLogDetail.path || 'なし'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      const text = JSON.stringify(selectedLogDetail, null, 2);
                      handleCopy(text);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedText ? 'コピー完了' : 'JSONコピー'}
                  </button>
                  <button
                    onClick={() => setSelectedLogDetail(null)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Log Specification Guide Modal */}
      <AnimatePresence>
        {showLogGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">ログデータの定義と取得情報ガイド</h3>
                    <p className="text-xs text-slate-600">アクセスログ・アクションログ仕様書 ＆ 運営時セキュリティ監査マニュアル</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogGuideModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                  <h4 className="text-sm font-bold text-indigo-950">💡 ログシステム運用の目的と役割</h4>
                  <p className="text-indigo-900/90">
                    ReMEETsでは、悪質な嫌がらせ・ストーカー行為・なりすましを防止し、健全な想い出の再会を守るために接続元IPや重要イベントを完全に保全しています。
                    万が一の事件発生時には、刑事訴訟法に基づく警察署（生活安全課・サイバー犯罪対策課）からの照会に対して、対象アカウントの行動ログを即座に提出できる体制を整えています。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Terminal size={16} className="text-slate-700" />
                      1. アクセスログ (Access Logs)
                    </h4>
                    <p className="text-slate-600">
                      サーバーへ到達した全HTTP/HTTPSリクエストを記録。APIの負荷検証、DoS攻撃の検知、不審な連続アクセスの遮断に利用します。
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li><b>日時:</b> 秒単位のタイムスタンプ</li>
                      <li><b>パス:</b> アクセス先URL（例: <code>/api/posts/:id</code>）</li>
                      <li><b>メソッド:</b> GET / POST / PUT / DELETE</li>
                      <li><b>接続元IP:</b> 連続アクセス監視用</li>
                    </ul>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <History size={16} className="text-slate-700" />
                      2. アクションログ (Action Logs)
                    </h4>
                    <p className="text-slate-600">
                      ユーザーがシステムの状態を変更した重要イベントのみを抽出記録する「セキュリティ監査ログ」です。
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li><b>LOGIN / REGISTER:</b> アカウント認証・登録</li>
                      <li><b>POST_CREATED / DELETED:</b> ボトル投函・消去</li>
                      <li><b>VERIFY_SUCCESS / FAILURE:</b> 想い出クイズ照合</li>
                      <li><b>AGE_VERIFIED:</b> 本人確認(eKYC)・誓約</li>
                      <li><b>NG_WORD_DETECTED:</b> 規約違反ワード検知</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end sticky bottom-0">
                <button
                  onClick={() => setShowLogGuideModal(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
