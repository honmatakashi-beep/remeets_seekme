import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Activity,
  Database,
  Cpu,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Terminal,
  Layers,
  Key,
  Globe,
  Mail,
  CreditCard,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  FileText,
  ExternalLink,
  Lock,
  Search,
  Sparkles,
  AlertOctagon
} from 'lucide-react';

interface AdminSystemCenterViewProps {
  token: string | null;
  onNavigateTab?: (tab: any) => void;
}

interface DbHealthData {
  status: string;
  message: string;
  tables: number;
  size: string;
  counts: Record<string, number | string>;
  sqliteVersion?: string;
  lastCheck?: string;
}

interface EnvStatusData {
  gemini: boolean;
  stripe: boolean;
  resend: boolean;
  line: boolean;
  google: boolean;
  databaseUrl: boolean;
  databaseEngine: string;
  nodeEnv: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  dbSizeBytes: number;
  serverTime: string;
}

export const AdminSystemCenterView: React.FC<AdminSystemCenterViewProps> = ({
  token,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'liveRates' | 'dbHealth' | 'systemConfig' | 'auditLogs'>('liveRates');

  // WebSocket & Metrics
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [latency, setLatency] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);

  // Rate Limits Form
  const [limitsForm, setLimitsForm] = useState({
    authMax: 100,
    registrationMax: 5,
    searchMax: 30,
    postMax: 3,
    messageMax: 50,
    verifyMax: 10,
  });
  const [updatingLimits, setUpdatingLimits] = useState(false);
  const [updateLimitsSuccess, setUpdateLimitsSuccess] = useState(false);

  // Database Health
  const [dbHealth, setDbHealth] = useState<DbHealthData | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [vacuuming, setVacuuming] = useState(false);
  const [vacuumSuccessMsg, setVacuumSuccessMsg] = useState<string | null>(null);

  // Env Status
  const [envStatus, setEnvStatus] = useState<EnvStatusData | null>(null);
  const [loadingEnv, setLoadingEnv] = useState(false);

  // Home Stats Toggle
  const [statsEnabled, setStatsEnabled] = useState(true);
  const [togglingStats, setTogglingStats] = useState(false);

  // Quick Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('ALL');

  // Reset Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetting, setResetting] = useState(false);

  // Fetch initial rate limits
  const fetchLimits = async () => {
    try {
      const res = await fetch('/api/admin/rate-limits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLimitsForm({
          authMax: data.authMax || 100,
          registrationMax: data.registrationMax || 5,
          searchMax: data.searchMax || 30,
          postMax: data.postMax || 3,
          messageMax: data.messageMax || 50,
          verifyMax: data.verifyMax || 10,
        });
        if (data.violationsCount !== undefined) {
          setMetrics((prev: any) => ({
            ...prev,
            violationsCount: data.violationsCount,
            totalRequests: data.totalRequests,
            rateLimitConfig: data,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load rate limits:", e);
    }
  };

  // Fetch DB Health Check
  const fetchDbHealth = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch('/api/admin/db-health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbHealth(data);
      }
    } catch (err) {
      console.error("DB health check error:", err);
    } finally {
      setCheckingDb(false);
    }
  };

  // Fetch Env Status
  const fetchEnvStatus = async () => {
    setLoadingEnv(true);
    try {
      const res = await fetch('/api/admin/system/env-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnvStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch env status:", err);
    } finally {
      setLoadingEnv(false);
    }
  };

  // Fetch Home Stats setting
  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.show_home_stats !== undefined) {
          setStatsEnabled(data.show_home_stats === 'true' || data.show_home_stats === true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch site settings:", e);
    }
  };

  // Fetch Quick Audit Logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/action-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch action logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Connect WebSocket
  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    setWsStatus('connecting');
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        ws.send(JSON.stringify({ type: 'auth', token }));
        ws.send(JSON.stringify({ type: 'admin-subscribe' }));
        
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', clientTime: Date.now() }));
          }
        }, 2500);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'pong') {
            const rtt = Date.now() - message.clientTime;
            setLatency(rtt);
          } else if (message.type === 'sys-metrics') {
            setMetrics(message);
            if (message.rateLimitConfig) {
              setLimitsForm({
                authMax: message.rateLimitConfig.authMax || 100,
                registrationMax: message.rateLimitConfig.registrationMax || 5,
                searchMax: message.rateLimitConfig.searchMax || 30,
                postMax: message.rateLimitConfig.postMax || 3,
                messageMax: message.rateLimitConfig.messageMax || 50,
                verifyMax: message.rateLimitConfig.verifyMax || 10,
              });
            }
          }
        } catch (e) {
          console.error("WS parsing error:", e);
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        setLatency(null);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3500);
      };

      ws.onerror = () => {
        setWsStatus('disconnected');
      };
    } catch (e) {
      console.error("WS creation error:", e);
      setWsStatus('disconnected');
    }
  };

  useEffect(() => {
    fetchLimits();
    fetchDbHealth();
    fetchEnvStatus();
    fetchSiteSettings();
    fetchLogs();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [token]);

  // Update Limits Form Submit
  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingLimits(true);
    setUpdateLimitsSuccess(false);
    try {
      const res = await fetch('/api/admin/rate-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(limitsForm)
      });
      if (res.ok) {
        setUpdateLimitsSuccess(true);
        setTimeout(() => setUpdateLimitsSuccess(false), 3500);
      }
    } catch (e) {
      console.error("Failed to update rates:", e);
    } finally {
      setUpdatingLimits(false);
    }
  };

  // Reset Rate Limit Violations
  const handleResetCounters = async () => {
    if (!window.confirm("サーバー側のリクエスト総数およびレート制限違反カウンターをリセットしますか？")) return;
    try {
      const res = await fetch('/api/admin/rate-limits/reset-stats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLimits();
      }
    } catch (e) {
      console.error("Failed to reset counts:", e);
    }
  };

  // Toggle Home Stats
  const handleToggleHomeStats = async () => {
    setTogglingStats(true);
    const nextVal = !statsEnabled;
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key: 'show_home_stats', value: String(nextVal) })
      });
      if (res.ok) {
        setStatsEnabled(nextVal);
      }
    } catch (e) {
      console.error("Failed to toggle home stats:", e);
    } finally {
      setTogglingStats(false);
    }
  };

  // Execute VACUUM & Optimize
  const handleExecuteVacuum = async () => {
    setVacuuming(true);
    setVacuumSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/system/vacuum', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVacuumSuccessMsg(data.message || '最適化が完了しました。');
        fetchDbHealth();
        fetchEnvStatus();
        setTimeout(() => setVacuumSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.error("Failed to vacuum DB:", e);
    } finally {
      setVacuuming(false);
    }
  };

  // Seed Moderation Sample Data
  const handleSeedModeration = async () => {
    try {
      const res = await fetch('/api/admin/seed-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('AI検知用の検証サンプルデータ（個人情報/NGワード検出、脅迫表現、商用スパムを含む3件）を混入させました。AI検閲キューからご確認いただけます。');
        fetchDbHealth();
      }
    } catch (e) {
      console.error("Failed to seed moderation:", e);
    }
  };

  // Dangerous Data Reset
  const handleExecuteResetData = async () => {
    if (resetConfirmInput !== 'RESET') {
      alert("確認用の文字列「RESET」を正確に入力してください。");
      return;
    }
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('全てのデータを安全に初期化し、初期サンプルデータを再生成しました。');
        setShowResetModal(false);
        setResetConfirmInput('');
        fetchDbHealth();
        fetchLogs();
      } else {
        alert('データリセットの実行に失敗しました。');
      }
    } catch (e) {
      console.error("Failed to reset data:", e);
      alert('通信エラーが発生しました。');
    } finally {
      setResetting(false);
    }
  };

  // Utilities
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0秒';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? `${d}日 ` : "";
    const hDisplay = h > 0 ? `${h}時間 ` : "";
    const mDisplay = m > 0 ? `${m}分 ` : "";
    return `${dDisplay}${hDisplay}${mDisplay}${s}秒`;
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (logFilterAction !== 'ALL' && !log.action.toUpperCase().includes(logFilterAction)) return false;
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      const matchText = `${log.action || ''} ${log.details || ''} ${log.ip_address || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 text-black pb-12">
      {/* 🌟 Top Header & Brief Summary */}
      <div className="p-8 bg-white border border-brand-border rounded-[32px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center gap-1.5 uppercase tracking-wider">
                <Server size={13} /> Infrastructure & Operations
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                API v1.2.4-RELEASE
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-black">
              システム統括センター (System Monitor & Ops)
            </h2>
            <p className="text-xs lg:text-sm text-black/70 font-sans max-w-3xl leading-relaxed">
              WebSocketライブ接続状態、6大APIスロットリング上限のリアルタイム調整、データベース整合性・サイズ診断、インデックス最適化（VACUUM）、および環境変数・外部API設定ステータスを一元管理します。
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                fetchLimits();
                fetchDbHealth();
                fetchEnvStatus();
                fetchLogs();
              }}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-brand-border text-black rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} className={checkingDb || loadingEnv ? 'animate-spin' : ''} />
              状態を全再読込
            </button>
          </div>
        </div>
      </div>

      {/* 📊 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: WebSocket & Latency */}
        <div className="p-6 bg-white border border-brand-border rounded-[24px] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" /> WebSocket 疎通
            </span>
            <span className={`w-3 h-3 rounded-full ${
              wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              wsStatus === 'connecting' ? 'bg-amber-500 animate-spin' : 'bg-red-500'
            }`} />
          </div>
          <div className="my-3">
            <div className="text-2xl font-serif font-extrabold text-black">
              {wsStatus === 'connected' ? '接続確立 (Live)' :
               wsStatus === 'connecting' ? '接続確立中...' : '切断・再試行中'}
            </div>
            <div className="text-xs text-black/60 font-sans mt-1 flex items-center gap-1.5">
              <span>応答速度 (RTT):</span>
              <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs ${
                (latency || 0) < 50 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
              }`}>
                {latency !== null ? `${latency} ms` : '---'}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-black/50 font-mono">
            <span>PROTOCOL: {window.location.protocol === 'https:' ? 'WSS' : 'WS'}</span>
            <button
              onClick={() => connectWebSocket()}
              className="text-brand-primary hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              再接続
            </button>
          </div>
        </div>

        {/* Card 2: Rate Limits & Violations */}
        <div className="p-6 bg-white border border-brand-border rounded-[24px] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders size={14} className="text-brand-primary" /> レート制限到達
            </span>
            <span className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-mono font-bold text-black/70">
              Active: {metrics?.activeConnections || 1}
            </span>
          </div>
          <div className="my-3">
            <div className={`text-2xl font-serif font-extrabold ${metrics?.violationsCount > 0 ? 'text-rose-600' : 'text-black'}`}>
              {(metrics?.violationsCount || 0).toLocaleString()} <span className="text-xs font-sans font-bold text-black/50">回遮断</span>
            </div>
            <div className="text-xs text-black/60 font-sans mt-1">
              総リクエスト: <span className="font-mono font-bold text-black">{(metrics?.totalRequests || 0).toLocaleString()}</span> 件
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
            <span className="text-black/50">15分/1時間スロット</span>
            <button
              onClick={handleResetCounters}
              className="text-rose-600 hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              ゼロ化
            </button>
          </div>
        </div>

        {/* Card 3: DB Health & Size */}
        <div className="p-6 bg-white border border-brand-border rounded-[24px] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest flex items-center gap-1.5">
              <Database size={14} className="text-emerald-600" /> DB 整合性 & 容量
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              dbHealth?.status === 'healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {dbHealth?.status === 'healthy' ? '健全 (OK)' : '要点検'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-serif font-extrabold text-black">
              {dbHealth?.size || '---'}
            </div>
            <div className="text-xs text-black/60 font-sans mt-1">
              管理テーブル数: <span className="font-mono font-bold text-black">{dbHealth?.tables || 11}</span> 個
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
            <span className="text-black/50 font-mono">SQLite {dbHealth?.sqliteVersion || 'v3.x'}</span>
            <button
              onClick={handleExecuteVacuum}
              disabled={vacuuming}
              className="text-emerald-700 hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              {vacuuming ? '最適化中...' : 'VACUUM実行'}
            </button>
          </div>
        </div>

        {/* Card 4: Uptime & Memory */}
        <div className="p-6 bg-white border border-brand-border rounded-[24px] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest flex items-center gap-1.5">
              <Cpu size={14} className="text-purple-600" /> 稼働リソース
            </span>
            <span className="text-[10px] font-mono text-black/50">
              {envStatus?.platform || process.platform}
            </span>
          </div>
          <div className="my-3">
            <div className="text-lg font-serif font-extrabold text-black truncate">
              {formatUptime(metrics?.uptime || envStatus?.uptime)}
            </div>
            <div className="text-xs text-black/60 font-sans mt-1">
              Heap: <span className="font-mono font-bold text-black">{formatBytes(metrics?.memoryUsage?.heapUsed || envStatus?.memoryUsage?.heapUsed)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-100">
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (((metrics?.memoryUsage?.heapUsed || 1) / (metrics?.memoryUsage?.heapTotal || 100)) * 100))}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Navigation Subtabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl border border-brand-border/60">
        <button
          onClick={() => setActiveSubTab('liveRates')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'liveRates'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-black/60 hover:text-black hover:bg-white/50'
          }`}
        >
          <Sliders size={15} className={activeSubTab === 'liveRates' ? 'text-brand-primary' : ''} />
          <span>⚡ ライブ監視 & レート制限コントローラー</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dbHealth')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'dbHealth'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-black/60 hover:text-black hover:bg-white/50'
          }`}
        >
          <Database size={15} className={activeSubTab === 'dbHealth' ? 'text-emerald-600' : ''} />
          <span>🗄️ データベース健康診断 & 最適化</span>
        </button>

        <button
          onClick={() => setActiveSubTab('systemConfig')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'systemConfig'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-black/60 hover:text-black hover:bg-white/50'
          }`}
        >
          <Key size={15} className={activeSubTab === 'systemConfig' ? 'text-purple-600' : ''} />
          <span>⚙️ システム構成 & 環境変数インスペクター</span>
        </button>

        <button
          onClick={() => setActiveSubTab('auditLogs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'auditLogs'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-black/60 hover:text-black hover:bg-white/50'
          }`}
        >
          <Terminal size={15} className={activeSubTab === 'auditLogs' ? 'text-blue-600' : ''} />
          <span>📜 直近システムログ抜粋 (50件)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: ⚡ Live Rates Controller                       */}
      {/* ======================================================== */}
      {activeSubTab === 'liveRates' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-8 bg-white border border-brand-border rounded-[32px] shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 pb-5">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2.5">
                  <Sliders size={20} className="text-brand-primary" />
                  動的レート制限（Rate-Limit）ライブコントローラー
                </h3>
                <p className="text-xs text-black/60 font-sans">
                  各APIに対する同一IPからのリクエスト上限数をリアルタイムで調整・テストできます。変更はサーバー再起動不要で即時反映されます。
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={fetchLimits}
                  className="px-3.5 py-2 text-xs font-bold text-black border border-brand-border rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 bg-white cursor-pointer"
                >
                  <RefreshCw size={13} /> 最新値をロード
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateLimits} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {/* 1. Login */}
                <div className="p-5 bg-slate-50/70 border border-brand-border/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px]">1</span>
                      会員ログイン上限 (15分ごと)
                    </span>
                    <span className="font-mono font-extrabold text-brand-primary text-sm px-2.5 py-0.5 bg-white rounded-lg border border-brand-border">
                      {limitsForm.authMax} 回
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={limitsForm.authMax}
                    onChange={(e) => setLimitsForm(p => ({ ...p, authMax: Number(e.target.value) }))}
                    className="w-full accent-brand-primary bg-slate-200 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>厳格 (5回)</span>
                    <span>標準 (100回)</span>
                    <span>緩和 (500回)</span>
                  </div>
                </div>

                {/* 2. Register */}
                <div className="p-5 bg-slate-50/70 border border-brand-border/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px]">2</span>
                      新規会員登録上限 (1時間ごと)
                    </span>
                    <span className="font-mono font-extrabold text-brand-primary text-sm px-2.5 py-0.5 bg-white rounded-lg border border-brand-border">
                      {limitsForm.registrationMax} 回
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={limitsForm.registrationMax}
                    onChange={(e) => setLimitsForm(p => ({ ...p, registrationMax: Number(e.target.value) }))}
                    className="w-full accent-brand-primary bg-slate-200 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>超厳格 (1回)</span>
                    <span>推奨 (5回)</span>
                    <span>緩和 (50回)</span>
                  </div>
                </div>

                {/* 3. Search */}
                <div className="p-5 bg-slate-50/70 border border-brand-border/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px]">3</span>
                      思い出検索・漂流手紙取得上限 (15分ごと)
                    </span>
                    <span className="font-mono font-extrabold text-brand-primary text-sm px-2.5 py-0.5 bg-white rounded-lg border border-brand-border">
                      {limitsForm.searchMax} 回
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={limitsForm.searchMax}
                    onChange={(e) => setLimitsForm(p => ({ ...p, searchMax: Number(e.target.value) }))}
                    className="w-full accent-brand-primary bg-slate-200 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>高負荷防止 (5回)</span>
                    <span>標準 (30回)</span>
                    <span>緩和 (200回)</span>
                  </div>
                </div>

                {/* 4. Post */}
                <div className="p-5 bg-slate-50/70 border border-brand-border/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px]">4</span>
                      ボトル投函作成上限 (1時間ごと)
                    </span>
                    <span className="font-mono font-extrabold text-brand-primary text-sm px-2.5 py-0.5 bg-white rounded-lg border border-brand-border">
                      {limitsForm.postMax} 回
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={limitsForm.postMax}
                    onChange={(e) => setLimitsForm(p => ({ ...p, postMax: Number(e.target.value) }))}
                    className="w-full accent-brand-primary bg-slate-200 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>連投防止 (1回)</span>
                    <span>推奨 (3回)</span>
                    <span>緩和 (30回)</span>
                  </div>
                </div>

                {/* 5. Secret Quiz Verify */}
                <div className="p-5 bg-slate-50/70 border border-brand-border/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px]">5</span>
                      秘密の質問回答・突破試行上限 (15分ごと)
                    </span>
                    <span className="font-mono font-extrabold text-brand-primary text-sm px-2.5 py-0.5 bg-white rounded-lg border border-brand-border">
                      {limitsForm.verifyMax} 回
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    step="1"
                    value={limitsForm.verifyMax}
                    onChange={(e) => setLimitsForm(p => ({ ...p, verifyMax: Number(e.target.value) }))}
                    className="w-full accent-brand-primary bg-slate-200 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>総当たり対策 (2回)</span>
                    <span>標準 (10回)</span>
                    <span>テスト用 (50回)</span>
                  </div>
                </div>

                {/* 6. Message */}
                <div className="p-5 bg-slate-50/70 border border-brand-border/60 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-black flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px]">6</span>
                      手紙内メッセージ送信上限 (15分ごと)
                    </span>
                    <span className="font-mono font-extrabold text-brand-primary text-sm px-2.5 py-0.5 bg-white rounded-lg border border-brand-border">
                      {limitsForm.messageMax} 回
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={limitsForm.messageMax}
                    onChange={(e) => setLimitsForm(p => ({ ...p, messageMax: Number(e.target.value) }))}
                    className="w-full accent-brand-primary bg-slate-200 rounded-lg appearance-none h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-black/40 font-mono">
                    <span>連投制限 (5回)</span>
                    <span>快適標準 (50回)</span>
                    <span>無制限同等 (300回)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
                {updateLimitsSuccess && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    レート制限設定をリアルタイム本番反映しました！
                  </span>
                )}
                <button
                  type="submit"
                  disabled={updatingLimits}
                  className="px-6 py-3 bg-zinc-900 hover:bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Sliders size={14} />
                  {updatingLimits ? '設定反映中...' : 'コントローラー設定を本番反映'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: 🗄️ Database Health & Maintenance               */}
      {/* ======================================================== */}
      {activeSubTab === 'dbHealth' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {vacuumSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{vacuumSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DB Health Card */}
            <div className="lg:col-span-2 p-8 bg-white border border-brand-border rounded-[32px] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2.5">
                    <Activity size={20} className="text-emerald-600" />
                    データベース整合性 & レコード健康診断
                  </h3>
                  <p className="text-xs text-black/60 font-sans">
                    SQLite `PRAGMA integrity_check` および全テーブルの格納レコード数を診断します。
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={fetchDbHealth}
                    disabled={checkingDb}
                    className="px-4 py-2.5 bg-black hover:bg-black/80 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <RefreshCw size={13} className={checkingDb ? 'animate-spin' : ''} />
                    {checkingDb ? '診断実行中...' : '診断を実行'}
                  </button>
                </div>
              </div>

              {dbHealth ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-brand-border/70">
                    <div className="flex items-center gap-3">
                      <span className={`w-3.5 h-3.5 rounded-full ${dbHealth.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span className="text-sm font-bold text-black">
                        整合性ステータス: {dbHealth.status === 'healthy' ? '正常 (OK)' : '異常検出'}
                      </span>
                    </div>
                    <span className="text-xs text-black/50 font-mono">
                      最終診断: {dbHealth.lastCheck ? new Date(dbHealth.lastCheck).toLocaleTimeString() : '---'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50/60 rounded-2xl border border-brand-border/60 text-xs leading-relaxed text-black/80">
                    <span className="font-bold text-black block mb-1">📋 診断結果メッセージ:</span>
                    {dbHealth.message}
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider block">
                      📊 テーブル別格納レコード数
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {dbHealth.counts && Object.entries(dbHealth.counts).map(([table, count]) => (
                        <div key={table} className="p-3 bg-white border border-brand-border/70 rounded-xl">
                          <span className="text-[11px] font-mono text-black/50 block truncate">{table}</span>
                          <span className="text-lg font-serif font-extrabold text-black mt-0.5 block">
                            {typeof count === 'number' ? count.toLocaleString() : count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-black/40 font-serif">
                  「診断を実行」ボタンを押下してデータベースをスキャンしてください。
                </div>
              )}
            </div>

            {/* DB Maintenance Tools */}
            <div className="p-8 bg-white border border-brand-border rounded-[32px] shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-4">
                  <h4 className="text-lg font-serif font-bold text-black flex items-center gap-2">
                    <HardDrive size={18} className="text-brand-primary" />
                    DB保守・メンテナンスツール
                  </h4>
                  <p className="text-xs text-black/60 font-sans mt-1">
                    インデックス再構築・最適化および検証用サンプルの投入を行えます。
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Vacuum Tool */}
                  <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black flex items-center gap-1.5">
                        <Sparkles size={14} className="text-emerald-600" />
                        インデックス最適化 (VACUUM)
                      </span>
                    </div>
                    <p className="text-[11px] text-black/60 font-sans leading-relaxed">
                      削除されたレコードの未使用領域を回収し、データベースファイルを圧縮・クエリパフォーマンスを向上させます。
                    </p>
                    <button
                      onClick={handleExecuteVacuum}
                      disabled={vacuuming}
                      className="w-full mt-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <HardDrive size={13} />
                      {vacuuming ? 'VACUUM実行中...' : 'VACUUM & 最適化を実行'}
                    </button>
                  </div>

                  {/* Seed Moderation Tool */}
                  <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-amber-600" />
                        AI検知用検証データ混入
                      </span>
                    </div>
                    <p className="text-[11px] text-black/60 font-sans leading-relaxed">
                      個人情報、NGワード、脅迫表現を含む検証サンプル3件を投稿キューへ追加し、AIモデレーション動作をテストします。
                    </p>
                    <button
                      onClick={handleSeedModeration}
                      className="w-full mt-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      AI検知検証データを投入
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Data Reset */}
              <div className="pt-5 border-t border-rose-100 space-y-3">
                <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold">
                  <AlertOctagon size={15} />
                  <span>危険エリア (Danger Zone)</span>
                </div>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle size={13} />
                  全データ初期化 & サンプル再生成
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: ⚙️ System Config & Env Status                  */}
      {/* ======================================================== */}
      {activeSubTab === 'systemConfig' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Specs */}
            <div className="p-8 bg-white border border-brand-border rounded-[32px] shadow-sm space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2.5">
                  <Layers size={20} className="text-brand-primary" />
                  サーバー稼働スペック & 構成情報
                </h3>
                <p className="text-xs text-black/60 font-sans mt-1">
                  現在のNode.jsランタイム、OSプラットフォーム、およびDB接続仕様です。
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 text-xs">
                  <span className="font-bold text-black/60">稼働環境 (NODE_ENV)</span>
                  <span className="font-mono font-bold text-black px-2.5 py-0.5 bg-zinc-100 rounded-lg">
                    {envStatus?.nodeEnv || process.env.NODE_ENV || 'development'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 text-xs">
                  <span className="font-bold text-black/60">Node.js バージョン</span>
                  <span className="font-mono font-bold text-black">
                    {envStatus?.nodeVersion || process.version}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 text-xs">
                  <span className="font-bold text-black/60">OS プラットフォーム</span>
                  <span className="font-mono font-bold text-black">
                    {envStatus?.platform || process.platform} (macOS / Cloud Run)
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 text-xs">
                  <span className="font-bold text-black/60">データベースエンジン</span>
                  <span className="font-mono font-bold text-black">
                    {envStatus?.databaseEngine || 'SQLite (better-sqlite3 / kizuna.db)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 text-xs">
                  <span className="font-bold text-black/60">API バージョン</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    v1.2.4-RELEASE
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 text-xs">
                  <span className="font-bold text-black/60">サーバー時刻</span>
                  <span className="font-mono text-black/70">
                    {envStatus?.serverTime ? new Date(envStatus.serverTime).toLocaleString() : '---'}
                  </span>
                </div>
              </div>

              {/* Home Stats Toggle */}
              <div className="pt-5 border-t border-zinc-100 space-y-3">
                <h4 className="text-sm font-serif font-bold text-black flex items-center gap-2">
                  <Eye size={16} className="text-brand-primary" />
                  一般公開設定（ホーム画面）
                </h4>
                <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <span className="text-xs font-bold text-black block">ホームページ統計情報の表示</span>
                    <span className="text-[11px] text-black/60 font-sans block leading-relaxed">
                      「流されたボトル数」「再会成功数」「本日の投函数」のグリッドを表示・非表示にします。
                    </span>
                  </div>
                  <button
                    onClick={handleToggleHomeStats}
                    disabled={togglingStats}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      statsEnabled ? 'bg-brand-primary' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        statsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* External Services Status */}
            <div className="p-8 bg-white border border-brand-border rounded-[32px] shadow-sm space-y-6">
              <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2.5">
                    <Key size={20} className="text-purple-600" />
                    外部API・環境変数 連携インスペクター
                  </h3>
                  <p className="text-xs text-black/60 font-sans mt-1">
                    本番デプロイチェックリストに基づく必須サービスの環境変数ロード状況です。
                  </p>
                </div>
                <button
                  onClick={fetchEnvStatus}
                  className="text-xs text-brand-primary hover:underline font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <RefreshCw size={12} /> 再読込
                </button>
              </div>

              <div className="space-y-3">
                {/* 1. Gemini AI */}
                <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-black block">Google Gemini AI (GEMINI_API_KEY)</span>
                      <span className="text-[10px] text-black/50">自律検閲・モデレーション多層防御エンジン</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    envStatus?.gemini ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {envStatus?.gemini ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {envStatus?.gemini ? '有効 (設定済)' : '未設定 (要登録)'}
                  </span>
                </div>

                {/* 2. Stripe */}
                <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-black block">Stripe 決済 (STRIPE_SECRET_KEY)</span>
                      <span className="text-[10px] text-black/50">チャット開通手数料（600円）決済 & Webhook</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    envStatus?.stripe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {envStatus?.stripe ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {envStatus?.stripe ? '有効 (設定済)' : '未設定 (要登録)'}
                  </span>
                </div>

                {/* 3. Resend */}
                <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-black block">Resend メール配信 (RESEND_API_KEY)</span>
                      <span className="text-[10px] text-black/50">ボトル到達通知・お問い合わせ自動返信</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    envStatus?.resend ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {envStatus?.resend ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {envStatus?.resend ? '有効 (設定済)' : '未設定 (要登録)'}
                  </span>
                </div>

                {/* 4. LINE Login */}
                <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <Globe size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-black block">LINE ログイン (LINE_CHANNEL_SECRET)</span>
                      <span className="text-[10px] text-black/50">OAuth 2.0 SNSアカウント認証</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    envStatus?.line ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {envStatus?.line ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {envStatus?.line ? '有効 (設定済)' : '未設定 (要登録)'}
                  </span>
                </div>

                {/* 5. Google OAuth */}
                <div className="p-4 bg-slate-50 border border-brand-border/70 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
                      <Key size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-black block">Google OAuth (GOOGLE_CLIENT_SECRET)</span>
                      <span className="text-[10px] text-black/50">Googleアカウント連携 & メアド取得</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    envStatus?.google ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {envStatus?.google ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {envStatus?.google ? '有効 (設定済)' : '未設定 (要登録)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 4: 📜 Quick Audit Logs (50 items)                 */}
      {/* ======================================================== */}
      {activeSubTab === 'auditLogs' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-8 bg-white border border-brand-border rounded-[32px] shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 pb-5">
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2.5">
                  <Terminal size={20} className="text-blue-600" />
                  システム監査ログ (直近50件のダイジェスト)
                </h3>
                <p className="text-xs text-black/60 font-sans">
                  システム内で行われた直近の管理操作、セキュリティ警告、DB変更履歴を確認できます。
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('logs')}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    全ログ・CSV出力は「ログ」タブへ
                  </button>
                )}
                <button
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-brand-border text-black rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={loadingLogs ? 'animate-spin' : ''} />
                  更新
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  placeholder="ログ内容・IPアドレス・アクションで検索..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs text-black focus:outline-none focus:border-brand-primary"
                />
              </div>

              <select
                value={logFilterAction}
                onChange={(e) => setLogFilterAction(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs font-bold text-black focus:outline-none cursor-pointer"
              >
                <option value="ALL">すべてのアクション</option>
                <option value="AUTH">認証・ログイン系</option>
                <option value="SYSTEM">システム・DB系</option>
                <option value="DELETE">削除・初期化系</option>
                <option value="BLOCK">ブロック・遮断系</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-brand-border/80 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-black/70">
                    <th className="py-3 px-4">日時</th>
                    <th className="py-3 px-4">アクション</th>
                    <th className="py-3 px-4">詳細内容</th>
                    <th className="py-3 px-4">IPアドレス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-black/40 font-serif">
                        該当する監査ログはありません。
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.slice(0, 50).map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-black/70 font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            log.action?.includes('FAIL') || log.action?.includes('BLOCK') || log.action?.includes('DELETE')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : log.action?.includes('VACUUM') || log.action?.includes('HEALTH')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-black/80 font-sans max-w-md truncate">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-black/60">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ⚠️ Reset Data Safety Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl border border-rose-200 space-y-6 text-black"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertOctagon size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-rose-600">
                  全データ初期化 & サンプル再生成 (Danger Zone)
                </h3>
                <p className="text-xs text-black/70 font-sans leading-relaxed">
                  データベース内のすべての会員アカウント、ボトルメール、メッセージ履歴、本人確認記録を物理的に初期化し、初期サンプルデータで再生成します。この操作は取り消せません。
                </p>
              </div>

              <div className="space-y-2 p-4 bg-rose-50/60 border border-rose-200 rounded-2xl">
                <label className="text-xs font-bold text-rose-900 block">
                  実行するには、下に半角大文字で「<span className="font-mono underline">RESET</span>」と入力してください:
                </label>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="RESET"
                  className="w-full px-4 py-2.5 bg-white border border-rose-300 rounded-xl text-sm font-mono font-bold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetConfirmInput('');
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-black rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  disabled={resetConfirmInput !== 'RESET' || resetting}
                  onClick={handleExecuteResetData}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle size={14} />
                  {resetting ? '初期化中...' : '初期化を実行する'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
