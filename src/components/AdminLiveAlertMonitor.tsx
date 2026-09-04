import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  X, 
  Play, 
  FlaskConical, 
  Eye, 
  Zap, 
  Lock, 
  Bot, 
  Users, 
  ExternalLink,
  RefreshCw,
  Sparkles,
  Sliders,
  Check,
  Settings,
  Flame,
  Volume1,
  Download,
  Search,
  ChevronRight,
  Shield,
  UserX,
  Ban,
  Clock,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { 
  playEmergencyAlarm, 
  playSpamWarningSound, 
  playChimeSound, 
  requestNotificationPermission, 
  triggerDesktopNotification 
} from '../utils/soundAlerts';

interface AdminLiveAlertMonitorProps {
  token: string | null;
  onNavigateTab: (tab: any) => void;
  onBlockIp?: (ip: string) => void;
  onSuspendUser?: (userId: number) => void;
}

export const AdminLiveAlertMonitor: React.FC<AdminLiveAlertMonitorProps> = ({
  token,
  onNavigateTab,
  onBlockIp,
  onSuspendUser
}) => {
  // 設定ステート (LocalStorage に保持)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('remeets_admin_sound_enabled') !== 'false';
  });
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState<boolean>(() => {
    return localStorage.getItem('remeets_admin_browser_notif_enabled') === 'true';
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('remeets_admin_sound_volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [pollingInterval, setPollingInterval] = useState<number>(8000);

  // データステート
  const [liveData, setLiveData] = useState<any>({
    summary: { totalActiveAlerts: 0, pendingReportsCount: 0, spamDetectionsCount: 0, aiFlaggedCount: 0, lockedIpsCount: 0 },
    alerts: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    return ('Notification' in window) ? Notification.permission : 'denied';
  });

  // フィルター・検索ステート
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'CRITICAL' | 'HIGH' | 'AI' | 'LOCK'>('all');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  // 直近検知したアラートIDのトラッキング（重複通知・連続鳴動防止）
  const knownAlertIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);
  const [activeToast, setActiveToast] = useState<any | null>(null);

  // 設定の永続化
  useEffect(() => {
    localStorage.setItem('remeets_admin_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('remeets_admin_browser_notif_enabled', String(browserNotifEnabled));
  }, [browserNotifEnabled]);

  useEffect(() => {
    localStorage.setItem('remeets_admin_sound_volume', String(volume));
  }, [volume]);

  // ブラウザ通知パーミッション要求ハンドラ
  const handleToggleBrowserNotif = async () => {
    if (!browserNotifEnabled) {
      setBrowserNotifEnabled(true);
      
      let granted = false;
      if ('Notification' in window) {
        try {
          const perm = await requestNotificationPermission();
          setBrowserPermission(perm);
          if (perm === 'granted') {
            granted = true;
            triggerDesktopNotification({
              title: '🔔 ReMEETs 運営通知を有効化しました',
              body: '緊急通報や大量連続投稿スパムが発生した際、バックグラウンドでも即座に通知します。',
              requireInteraction: false
            });
          }
        } catch (e) {
          console.warn("Notification permission request error:", e);
        }
      }

      if (soundEnabled) {
        playChimeSound(volume);
      }
      
      setActiveToast({
        id: `notif_enable_${Date.now()}`,
        type: 'SYSTEM_NOTICE',
        severity: 'INFO',
        title: granted ? '🔔 OSデスクトップ通知 ＆ 画面通知を有効化しました' : '🔔 リアルタイム画面通知 ＆ 音声警報を有効化しました',
        message: granted 
          ? 'ブラウザ・OS通知と画面ポップアップの両方が有効です。バックグラウンド時でも緊急事態を通知します。'
          : '画面ポップアップ通知とリアルタイム音声警報が有効です。（※OS通知は別タブ起動時に連携可能です）',
        timestamp: new Date().toISOString(),
        actionUrl: null
      });
    } else {
      setBrowserNotifEnabled(false);
      setActiveToast(null);
    }
  };

  // アラートデータ取得 ＆ 新規緊急事象の通知トリガー
  const fetchLiveAlerts = async (silent: boolean = false) => {
    if (!token) return;
    if (!silent) setLoading(true);

    try {
      const res = await fetch('/api/admin/live-alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
        setLastCheckedTime(new Date());

        const incomingAlerts: any[] = data.alerts || [];

        // 初回ロード時は既知IDを登録するのみ（ページ読み込み時のいきなり鳴動を防止）
        if (isFirstLoadRef.current) {
          incomingAlerts.forEach((a: any) => knownAlertIdsRef.current.add(a.id));
          isFirstLoadRef.current = false;
          return;
        }

        // 新規アラートの抽出
        const newCriticalAlerts: any[] = [];
        incomingAlerts.forEach((a: any) => {
          if (!knownAlertIdsRef.current.has(a.id)) {
            knownAlertIdsRef.current.add(a.id);
            newCriticalAlerts.push(a);
          }
        });

        // 新規アラートが発生した場合のサウンド＆デスクトップ通知発火
        if (newCriticalAlerts.length > 0) {
          const topAlert = newCriticalAlerts[0];
          setActiveToast(topAlert);

          // 1. サウンド再生
          if (soundEnabled) {
            if (topAlert.severity === 'CRITICAL' || topAlert.type === 'EMERGENCY_REPORT') {
              playEmergencyAlarm(volume);
            } else if (topAlert.severity === 'HIGH' || topAlert.type === 'MASS_POSTING_SPAM' || topAlert.type === 'AI_SAFETY_VIOLATION') {
              playSpamWarningSound(volume);
            } else {
              playChimeSound(volume);
            }
          }

          // 2. デスクトップ通知
          if (browserNotifEnabled && ('Notification' in window) && Notification.permission === 'granted') {
            triggerDesktopNotification({
              title: topAlert.title,
              body: topAlert.message,
              tag: topAlert.id,
              requireInteraction: true,
              onClick: () => {
                if (topAlert.actionUrl) {
                  onNavigateTab(topAlert.actionUrl);
                }
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to poll live alerts:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // リアルタイムポーリング
  useEffect(() => {
    fetchLiveAlerts();

    if (!isMonitoring || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      fetchLiveAlerts(true);
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [token, isMonitoring, pollingInterval, soundEnabled, browserNotifEnabled, volume]);

  // アラート既読・消去
  const handleDismissAlert = async (alertId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!token) return;

    try {
      await fetch('/api/admin/live-alerts/dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ alertId })
      });
      setLiveData((prev: any) => ({
        ...prev,
        alerts: prev.alerts.filter((a: any) => a.id !== alertId),
        summary: {
          ...prev.summary,
          totalActiveAlerts: Math.max(0, prev.summary.totalActiveAlerts - 1)
        }
      }));
      if (activeToast?.id === alertId) {
        setActiveToast(null);
      }
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  // テストシミュレーション実行
  const handleSimulateAlert = async (type: 'emergency_report' | 'spam_attack' | 'ai_violation') => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/live-alerts/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ simulationType: type })
      });
      if (res.ok) {
        const data = await res.json();
        
        if (data.alert) {
          const simAlert = data.alert;
          setActiveToast(simAlert);
          knownAlertIdsRef.current.add(simAlert.id);

          if (soundEnabled) {
            if (simAlert.severity === 'CRITICAL' || simAlert.type === 'EMERGENCY_REPORT') {
              playEmergencyAlarm(volume);
            } else if (simAlert.severity === 'HIGH' || simAlert.type === 'MASS_POSTING_SPAM' || simAlert.type === 'AI_SAFETY_VIOLATION') {
              playSpamWarningSound(volume);
            } else {
              playChimeSound(volume);
            }
          }

          if (browserNotifEnabled && ('Notification' in window) && Notification.permission === 'granted') {
            triggerDesktopNotification({
              title: simAlert.title,
              body: simAlert.message,
              tag: simAlert.id,
              requireInteraction: true,
              onClick: () => {
                if (simAlert.actionUrl) {
                  onNavigateTab(simAlert.actionUrl);
                }
              }
            });
          }
        }

        fetchLiveAlerts(true);
      }
    } catch (err) {
      console.error("Failed to run alert simulation:", err);
    }
  };

  const { summary = {}, alerts = [] } = liveData;

  // フィルタリング処理
  const filteredAlerts = alerts.filter((a: any) => {
    if (severityFilter === 'CRITICAL' && a.severity !== 'CRITICAL') return false;
    if (severityFilter === 'HIGH' && a.severity !== 'HIGH') return false;
    if (severityFilter === 'AI' && a.type !== 'AI_SAFETY_VIOLATION') return false;
    if (severityFilter === 'LOCK' && a.type !== 'BRUTE_FORCE_ATTACK') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchMsg = (a.message || '').toLowerCase().includes(q);
      const matchIp = (a.ip || '').toLowerCase().includes(q);
      const matchReporter = (a.reporter || '').toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchIp && !matchReporter) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredAlerts.length / perPage) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * perPage, currentPage * perPage);

  // CSVダウンロード
  const handleExportCsv = () => {
    const headers = ['ID', '日時', '重要度', '警報種別', 'タイトル', '詳細メッセージ', '対象IP', '通報者/ユーザー', '遷移先'];
    const csvRows = [headers.join(',')];

    filteredAlerts.forEach((a: any) => {
      const row = [
        `"${a.id || ''}"`,
        `"${new Date(a.timestamp).toLocaleString().replace(/"/g, '""')}"`,
        `"${a.severity || ''}"`,
        `"${a.type || ''}"`,
        `"${(a.title || '').replace(/"/g, '""')}"`,
        `"${(a.message || '').replace(/"/g, '""')}"`,
        `"${a.ip || ''}"`,
        `"${(a.reporter || '').replace(/"/g, '""')}"`,
        `"${a.actionUrl || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `live_alerts_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* 1. 4大警報KPIサマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {/* カード1: アクティブ警報 */}
        <div className="bg-white/90 backdrop-blur-md border border-rose-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">🚨 アクティブ警報</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-700">{summary.totalActiveAlerts || 0}</span>
            <span className="text-xs text-rose-500">件</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">現在対応が必要な緊急事態</div>
        </div>

        {/* カード2: 未対応通報 */}
        <div className="bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">⚠️ 未対応緊急通報</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-700">{summary.pendingReportsCount || 0}</span>
            <span className="text-xs text-amber-500">件</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">ユーザーからの通報待機中</div>
        </div>

        {/* カード3: 15分以内連投スパム */}
        <div className="bg-white/90 backdrop-blur-md border border-orange-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700">⚡ 15分以内スパム検知</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-orange-700">{summary.spamDetectionsCount || 0}</span>
            <span className="text-xs text-orange-500">グループ</span>
          </div>
          <div className="mt-1 text-[11px] text-orange-600 font-medium">短時間連投・ボット検知</div>
        </div>

        {/* カード4: AI安全自動隔離 ＆ ロック */}
        <div className="bg-white/90 backdrop-blur-md border border-blue-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">🤖 AI隔離 ＆ IP凍結</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Bot size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-700">
              {(summary.aiFlaggedCount || 0) + (summary.lockedIpsCount || 0)}
            </span>
            <span className="text-xs text-blue-500">件</span>
          </div>
          <div className="mt-1 text-[11px] text-blue-600 font-medium">不適切検閲 ＆ クイズ誤答遮断</div>
        </div>
      </div>

      {/* 2. リアルタイム監視コントロール ＆ 音声・通知設定パネル */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 左側: ステータス ＆ タイトル */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-inner">
                <Radio size={22} className={isMonitoring ? "animate-pulse text-emerald-400" : "text-slate-500"} />
              </div>
              {isMonitoring && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>運営リアルタイム警報 ＆ 大量投稿スパム監視センター</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    summary.totalActiveAlerts > 0 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {summary.totalActiveAlerts > 0 ? `🚨 未対応 ${summary.totalActiveAlerts}件` : '🟢 正常稼働中'}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>自動更新: {pollingInterval / 1000}秒毎</span>
                <span>•</span>
                <span>最終確認: {lastCheckedTime.toLocaleTimeString()}</span>
              </p>
            </div>
          </div>

          {/* 右側: コントロールボタン群 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* サウンド通知トグル */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playChimeSound(volume);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                soundEnabled 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-sm ring-1 ring-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="緊急通報・スパム検知時の警報サウンドON/OFF"
            >
              {soundEnabled ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} />}
              <span>サウンド: {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* 音量調整スライダー */}
            {soundEnabled && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs">
                <Volume1 size={13} className="text-slate-400" />
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-14 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  title={`音量: ${Math.round(volume * 100)}%`}
                />
                <span className="text-[10px] font-mono text-slate-300 w-6">{Math.round(volume * 100)}%</span>
              </div>
            )}

            {/* ブラウザデスクトップ通知トグル */}
            <button
              type="button"
              onClick={handleToggleBrowserNotif}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                browserNotifEnabled
                  ? 'bg-teal-950/80 text-teal-300 border-teal-700/60 shadow-sm ring-1 ring-teal-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="デスクトップ通知・画面フローティング通知のON/OFF"
            >
              <Bell size={15} className={browserNotifEnabled ? "text-teal-400 animate-pulse" : ""} />
              <span>デスクトップ通知: {browserNotifEnabled ? 'ON' : 'OFF'}</span>
              {browserNotifEnabled && (
                <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-teal-500/20 text-teal-300 font-mono">
                  {browserPermission === 'granted' ? 'OS連携' : '画面ポップ'}
                </span>
              )}
            </button>

            {/* ポーリング間隔セレクター */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs">
              <Clock size={12} className="text-slate-400" />
              <select
                value={isMonitoring ? pollingInterval : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val === 0) {
                    setIsMonitoring(false);
                  } else {
                    setIsMonitoring(true);
                    setPollingInterval(val);
                  }
                }}
                className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value={5000} className="bg-slate-900 text-white">5秒</option>
                <option value={8000} className="bg-slate-900 text-white">8秒 (標準)</option>
                <option value={15000} className="bg-slate-900 text-white">15秒</option>
                <option value={30000} className="bg-slate-900 text-white">30秒</option>
                <option value={0} className="bg-slate-900 text-white">停止</option>
              </select>
            </div>

            {/* 手動リフレッシュ */}
            <button
              type="button"
              onClick={() => fetchLiveAlerts()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="今すぐ最新データを取得"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-emerald-400" : ""} />
            </button>
          </div>
        </div>

        {/* サブバー: サウンドテスト ＆ シミュレーション実行ボタン */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px] flex items-center gap-1 font-bold">
              <Sparkles size={12} className="text-amber-400" /> 音声テスト:
            </span>
            <button
              type="button"
              onClick={() => playEmergencyAlarm(volume)}
              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Play size={10} /> 🚨 緊急通報音
            </button>
            <button
              type="button"
              onClick={() => playSpamWarningSound(volume)}
              className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Play size={10} /> ⚠️ スパム警告音
            </button>
            <button
              type="button"
              onClick={() => playChimeSound(volume)}
              className="px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800/80 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Play size={10} /> 🔔 通常チャイム
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px] flex items-center gap-1 font-bold">
              <FlaskConical size={12} className="text-blue-400" /> テスト発生:
            </span>
            <button
              type="button"
              onClick={() => handleSimulateAlert('emergency_report')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all"
              title="ダミーの緊急通報データを生成して通知テスト"
            >
              <Zap size={11} className="text-rose-400" /> 通報シミュレーション
            </button>
            <button
              type="button"
              onClick={() => handleSimulateAlert('spam_attack')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all"
              title="3件の連続投稿データを生成してスパム検知テスト"
            >
              <Flame size={11} className="text-amber-400" /> 連投スパムシミュレーション
            </button>
          </div>
        </div>
      </div>

      {/* フローティング緊急アラートトースト（画面上部/右上の強調通知） */}
      {activeToast && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-950/95 text-white border-2 border-rose-500 shadow-2xl animate-in slide-in-from-top-4 duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-900/50 animate-bounce">
              <ShieldAlert size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {activeToast.severity}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">{activeToast.title}</h4>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">{activeToast.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {activeToast.actionUrl && (
              <button
                type="button"
                onClick={() => {
                  onNavigateTab(activeToast.actionUrl);
                  setActiveToast(null);
                }}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <span>今すぐ対応する</span>
                <ExternalLink size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="p-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-xl text-xs cursor-pointer transition-all"
              title="トーストを閉じる"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 3. 警報・スパム検知 履歴テーブル（横一行モダンテーブル） */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
        {/* Header with Title & Action */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>リアルタイム警報 ＆ スパム検知 履歴一覧</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  全 {alerts.length} 件
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                検知された緊急通報・荒らし連投・AI検閲・クイズ総当たり攻撃を一覧監視
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>警報監査 CSV 出力</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
              {[
                { id: 'all', label: 'すべて', count: alerts.length },
                { id: 'CRITICAL', label: '🚨 緊急通報', count: alerts.filter((a: any) => a.severity === 'CRITICAL').length },
                { id: 'HIGH', label: '⚠️ 連投スパム', count: alerts.filter((a: any) => a.severity === 'HIGH' && a.type !== 'AI_SAFETY_VIOLATION').length },
                { id: 'AI', label: '🤖 AI検閲隔離', count: alerts.filter((a: any) => a.type === 'AI_SAFETY_VIOLATION').length },
                { id: 'LOCK', label: '🔒 総当たりロック', count: alerts.filter((a: any) => a.type === 'BRUTE_FORCE_ATTACK').length },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSeverityFilter(t.id as any); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    severityFilter === t.id
                      ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    severityFilter === t.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">表示件数:</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
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
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="タイトル、検知メッセージ、IPアドレス、通報者で検索..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table Component */}
        <div className="overflow-x-auto">
          {paginatedAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">未対応のアラート・スパムはありません</p>
              <p className="text-xs text-slate-400 mt-1">システムは正常に安全稼働しています</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-3.5 py-2.5 whitespace-nowrap">検知日時</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">重要度 / 種別</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">タイトル / 対象</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">検知メッセージ・理由</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">接続元 IP</th>
                    <th className="px-3.5 py-2.5 text-right whitespace-nowrap">即時アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedAlerts.map((a: any) => {
                    const isCrit = a.severity === 'CRITICAL';
                    const isHigh = a.severity === 'HIGH';

                    return (
                      <tr key={a.id} className="h-12 hover:bg-slate-50/70 transition-colors group">
                        {/* 1. Timestamp */}
                        <td className="px-3.5 py-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(a.timestamp).toLocaleString('ja-JP', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>

                        {/* 2. Severity & Type */}
                        <td className="px-3.5 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isCrit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <ShieldAlert size={11} className="text-rose-600" />
                                <span>CRITICAL</span>
                              </span>
                            ) : isHigh ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertTriangle size={11} className="text-amber-600" />
                                <span>HIGH</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                <Bot size={11} className="text-blue-600" />
                                <span>WARNING</span>
                              </span>
                            )}

                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {a.type === 'EMERGENCY_REPORT' ? '🚨 緊急通報' :
                               a.type === 'MASS_POSTING_SPAM' ? '⚡ 連投スパム' :
                               a.type === 'AI_SAFETY_VIOLATION' ? '🤖 AI検閲隔離' :
                               a.type === 'BRUTE_FORCE_ATTACK' ? '🔒 クイズロック' :
                               '⚠️ セキュリティ警報'}
                            </span>
                          </div>
                        </td>

                        {/* 3. Title */}
                        <td className="px-3.5 py-2 whitespace-nowrap max-w-xs truncate">
                          <div className="font-bold text-slate-800 truncate" title={a.title}>
                            {a.title}
                          </div>
                        </td>

                        {/* 4. Message */}
                        <td className="px-3.5 py-2 max-w-sm truncate text-slate-600">
                          <span className="truncate block" title={a.message}>
                            {a.message}
                          </span>
                        </td>

                        {/* 5. IP */}
                        <td className="px-3.5 py-2 whitespace-nowrap font-mono text-[11px] text-slate-500">
                          {a.ip || '-'}
                        </td>

                        {/* 6. Action */}
                        <td className="px-3.5 py-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {a.actionUrl && (
                              <button
                                type="button"
                                onClick={() => onNavigateTab(a.actionUrl)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                title="該当管理画面を開く"
                              >
                                <span>対応</span>
                                <ExternalLink size={11} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDismissAlert(a.id, e)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="アラートを既読にする"
                            >
                              <Check size={12} />
                              <span>既読</span>
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
                  全 <span className="font-bold text-slate-800">{filteredAlerts.length}</span> 件中{' '}
                  <span className="font-bold text-slate-800">{(currentPage - 1) * perPage + 1}</span> 〜{' '}
                  <span className="font-bold text-slate-800">{Math.min(currentPage * perPage, filteredAlerts.length)}</span> 件を表示
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage(1)}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                    >
                      &laquo;
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
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
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                    >
                      &rsaquo;
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(totalPages)}
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
    </div>
  );
};
