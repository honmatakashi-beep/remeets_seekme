import React, { useState, useEffect, useRef } from "react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowUp, CheckCircle,
  Clock, Cpu, Database, HardDrive, RefreshCw, Server, Shield, ShieldAlert,
  ShieldCheck, Wifi, Zap
} from "lucide-react";
import { cn } from "../../lib/utils";

export const AdminLiveSystemMonitor = ({ token }: { token: string }) => {
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [latency, setLatency] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [limitsForm, setLimitsForm] = useState({
    authMax: 100,
    registrationMax: 5,
    searchMax: 30,
    postMax: 3,
    messageMax: 50,
    verifyMax: 10,
  });
  
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);

  // Fetch initial limits
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
        // Authenticate
        ws.send(JSON.stringify({ type: 'auth', token }));
        ws.send(JSON.stringify({ type: 'admin-subscribe' }));
        
        // Start Ping interval
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
        
        // Auto reconnect after 3.5 seconds
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
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [token]);

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);
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
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to update rates:", e);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetCounters = async () => {
    if (!window.confirm("サーバー側のリクエスト総数およびレート制限違反カウンターをリセットしますか？")) return;
    try {
      const res = await fetch('/api/admin/rate-limits/reset-stats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("統計カウンターをリセットしました。");
        fetchLimits();
      }
    } catch (e) {
      console.error("Failed to reset counts:", e);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0秒';
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor((seconds % (3600*24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const dDisplay = d > 0 ? `${d}日 ` : "";
    const hDisplay = h > 0 ? `${h}時間 ` : "";
    const mDisplay = m > 0 ? `${m}分 ` : "";
    const sDisplay = `${s}秒`;
    return dDisplay + hDisplay + mDisplay + sDisplay;
  };

  return (
    <div className="space-y-6 text-black">
      {/* Dynamic Status Dashboard Header Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connection State Card */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-[#f4fafb]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/50 uppercase tracking-widest block">WebSocket 疎通ステータス</span>
            <span className={`w-3.5 h-3.5 rounded-full ${
              wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              wsStatus === 'connecting' ? 'bg-amber-500 animate-spin border-t-2 border-brand-primary' : 
              'bg-red-500'
            }`} />
          </div>
          
          <div className="my-4">
            <div className="text-2xl font-serif font-extrabold text-black">
              {wsStatus === 'connected' ? '接続確立中 (Live)' :
               wsStatus === 'connecting' ? 'サーバー通信確立中...' :
               '接続切断・再試行中'}
            </div>
            {wsStatus === 'connected' && latency !== null && (
              <p className="text-xs text-black/60 font-sans mt-0.5 flex items-center gap-1">
                <span>平均応答速度 (RTT):</span>
                <span className={`font-mono font-extrabold px-1.5 py-0.2 rounded ${
                  latency < 30 ? 'text-emerald-700 bg-emerald-50' :
                  latency < 100 ? 'text-amber-700 bg-amber-50' :
                  'text-rose-700 bg-rose-50'
                }`}>{latency} ms</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
            <span className="text-[10px] text-black/40 uppercase tracking-wider font-mono">
              PROTOCOL: {window.location.protocol === 'https:' ? 'WSS' : 'WS'}
            </span>
            <button 
              type="button"
              onClick={() => connectWebSocket()}
              className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 active:scale-95 bg-transparent border-none cursor-pointer"
            >
              <RefreshCw size={10} /> 手動再接続
            </button>
          </div>
        </div>

        {/* Requests & Violations Tracker */}
        <div className="glass-card p-6 flex flex-col justify-between bg-gradient-to-br from-white to-[#fff8f8]/30">
          <div>
            <span className="text-xs font-bold text-black/50 uppercase tracking-widest block">リアルタイムレート制限違反検知</span>
            <div className="grid grid-cols-2 gap-4 my-3 text-left">
              <div>
                <span className="text-[10px] text-black/40 block">総リクエスト件数</span>
                <span className="text-2xl font-serif font-extrabold text-black">
                  {metrics?.totalRequests?.toLocaleString() || (metrics?.totalRequests === 0 ? '0' : '---')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-800/80 block">レート制限到達(遮断)</span>
                <span className={`text-2xl font-serif font-extrabold ${metrics?.violationsCount > 0 ? 'text-rose-600 animate-pulse' : 'text-black/30'}`}>
                  {metrics?.violationsCount?.toLocaleString() || '0'} <span className="text-xs font-sans text-rose-500 font-bold">回</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
            <span className="text-[10px] text-black/40 uppercase tracking-wider font-mono">
              ACTIVE CONNECTIONS: {metrics?.activeConnections || 1}
            </span>
            <button 
              type="button"
              onClick={handleResetCounters}
              className="text-[10px] font-bold text-neutral-500 hover:text-rose-600 transition-colors uppercase tracking-wider font-sans active:scale-95 bg-transparent border-none cursor-pointer"
            >
              統計値をゼロ化
            </button>
          </div>
        </div>

        {/* System System Stats */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-black/50 uppercase tracking-widest block">サーバー稼働リソース状況</span>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-black/50">Uptime</span>
                <span className="font-mono font-bold text-black">{formatUptime(metrics?.uptime)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-black/50">Node.js Heap (Used)</span>
                  <span className="font-mono font-bold text-black">{formatBytes(metrics?.memoryUsage?.heapUsed)} / {formatBytes(metrics?.memoryUsage?.heapTotal)}</span>
                </div>
                {metrics?.memoryUsage && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-brand-primary h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-brand-border/60 text-[10px] text-black/40 font-mono uppercase">
            ENV: {process.env.NODE_ENV || 'production'} • LIVE REFRESH
          </div>
        </div>

      </div>

      {/* Limits Live Changer Form */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-4 mb-6">
          <div>
            <h4 className="text-lg font-serif font-black text-black">レート制限（Rate-Limit）ライブコントローラー</h4>
            <p className="text-xs text-black/50 font-sans mt-1">
              各APIに対する同一IPからのリクエスト上限数をリアルタイムで調整できます。変更は即座に反映されます。
            </p>
          </div>
          <button
            type="button"
            onClick={fetchLimits}
            className="px-3 py-1.5 text-xs text-black border border-brand-border rounded-xl hover:bg-brand-primary/5 transition-all outline-none font-bold active:scale-95 flex items-center gap-1.5 bg-white cursor-pointer"
          >
            <RefreshCw size={12} /> 最新値をロード
          </button>
        </div>

        <form onSubmit={handleUpdateLimits} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            {/* Limit Auth */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">1. 会員ログイン上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.authMax} 回</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="500" 
                step="5"
                value={limitsForm.authMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, authMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>厳格 (5)</span>
                <span>標準 (100)</span>
                <span>無制限同等 (500)</span>
              </div>
            </div>

            {/* Limit Register */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">2. 新規会員登録上限 (1時間ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.registrationMax} 回</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1"
                value={limitsForm.registrationMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, registrationMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>超厳格 (1)</span>
                <span>標準 (5)</span>
                <span>大容量 (50)</span>
              </div>
            </div>

            {/* Limit Search */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">3. 思い出検索・漂流手紙取得上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.searchMax} 回</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="200" 
                step="5"
                value={limitsForm.searchMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, searchMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>高負荷防止 (5)</span>
                <span>標準 (30)</span>
                <span>緩和 (200)</span>
              </div>
            </div>

            {/* Limit Post */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">4. ボトル投函作成・投函上限 (1時間ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.postMax} 回</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1"
                value={limitsForm.postMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, postMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>連投防止 (1)</span>
                <span>推奨標準 (3)</span>
                <span>緩和 (30)</span>
              </div>
            </div>

            {/* Limit Verify */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">5. 秘密の質問回答・突破試行上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.verifyMax} 回</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="50" 
                step="1"
                value={limitsForm.verifyMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, verifyMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>総当たり対策 (2)</span>
                <span>標準 (10)</span>
                <span>テスト用 (50)</span>
              </div>
            </div>

            {/* Limit Message */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">6. 手紙内メッセージ送信上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.messageMax} 回</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="300" 
                step="5"
                value={limitsForm.messageMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, messageMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>連投制限 (5)</span>
                <span>快適標準 (50)</span>
                <span>無制限同等 (300)</span>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-border/60">
            {updateSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 animate-fade-in mr-2">
                設定をリアルタイム更新に反映しました！
              </span>
            )}
            <button 
              type="submit" 
              disabled={updating}
              className="px-6 py-3 bg-brand-dark hover:bg-[#5ea5ad] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:scale-95 cursor-pointer"
            >
              {updating ? '設定更新中...' : 'コントローラー設定を本番反映'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Admin Dashboard ---

