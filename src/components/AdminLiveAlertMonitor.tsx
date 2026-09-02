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
  Volume1
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
}

export const AdminLiveAlertMonitor: React.FC<AdminLiveAlertMonitorProps> = ({
  token,
  onNavigateTab
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

      // サウンド再生＆アプリ内トーストで有効化をお知らせ
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

  // 8秒間隔のリアルタイムポーリング
  useEffect(() => {
    fetchLiveAlerts();

    if (!isMonitoring) return;

    const interval = setInterval(() => {
      fetchLiveAlerts(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [token, isMonitoring, soundEnabled, browserNotifEnabled, volume]);

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
        
        // シミュレーション用アラートオブジェクトが返された場合、即座にトースト表示＆通知発火
        if (data.alert) {
          const simAlert = data.alert;
          setActiveToast(simAlert);
          knownAlertIdsRef.current.add(simAlert.id);

          // 1. サウンド再生
          if (soundEnabled) {
            if (simAlert.severity === 'CRITICAL' || simAlert.type === 'EMERGENCY_REPORT') {
              playEmergencyAlarm(volume);
            } else if (simAlert.severity === 'HIGH' || simAlert.type === 'MASS_POSTING_SPAM' || simAlert.type === 'AI_SAFETY_VIOLATION') {
              playSpamWarningSound(volume);
            } else {
              playChimeSound(volume);
            }
          }

          // 2. デスクトップ通知
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

        // 最新の監視データを再取得
        fetchLiveAlerts(true);
      }
    } catch (err) {
      console.error("Failed to run alert simulation:", err);
    }
  };

  const { summary = {}, alerts = [] } = liveData;

  return (
    <div className="space-y-4 text-left">
      {/* リアルタイム監視トップバー */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 text-white shadow-lg border border-neutral-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 左側: ステータス ＆ タイトル */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                <Radio size={20} className={isMonitoring ? "animate-pulse text-emerald-400" : "text-neutral-500"} />
              </div>
              {isMonitoring && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-900 animate-ping" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-serif font-bold text-white flex items-center gap-2">
                  <span>運営リアルタイム警報 ＆ スパム監視</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                    summary.totalActiveAlerts > 0 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {summary.totalActiveAlerts > 0 ? `🚨 未対応アラート ${summary.totalActiveAlerts}件` : '🟢 正常監視中'}
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans flex items-center gap-2">
                <span>ポーリング間隔: 8秒</span>
                <span>•</span>
                <span>最終確認: {lastCheckedTime.toLocaleTimeString()}</span>
              </p>
            </div>
          </div>

          {/* 右側: サウンド・通知トグル ＆ コントロール */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* サウンド通知トグル */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playChimeSound(volume);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer border ${
                soundEnabled 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-xs' 
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
              }`}
              title="緊急通報・スパム検知時の警報サウンドON/OFF"
            >
              {soundEnabled ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} />}
              <span>サウンド: {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* 音量調整スライダー */}
            {soundEnabled && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-neutral-800/80 rounded-xl border border-neutral-700 text-xs">
                <Volume1 size={13} className="text-neutral-400" />
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  title={`音量: ${Math.round(volume * 100)}%`}
                />
                <span className="text-[10px] font-mono text-neutral-300 w-6">{Math.round(volume * 100)}%</span>
              </div>
            )}

            {/* ブラウザデスクトップ通知トグル */}
            <button
              onClick={handleToggleBrowserNotif}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer border ${
                browserNotifEnabled
                  ? 'bg-teal-950/80 text-teal-300 border-teal-700/60 shadow-xs ring-1 ring-teal-500/30' 
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
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

            {/* 監視一時停止/再開 */}
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 border cursor-pointer ${
                isMonitoring ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700' : 'bg-amber-900/60 text-amber-300 border-amber-700'
              }`}
            >
              <RefreshCw size={13} className={isMonitoring ? "animate-spin" : ""} />
              <span>{isMonitoring ? '監視中' : '一時停止'}</span>
            </button>
          </div>
        </div>

        {/* サブバー: クイックサウンドテスト ＆ シミュレーショントリガー */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> 音声テスト:
            </span>
            <button
              onClick={() => playEmergencyAlarm(volume)}
              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Play size={10} /> 🚨 緊急通報音
            </button>
            <button
              onClick={() => playSpamWarningSound(volume)}
              className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Play size={10} /> ⚠️ スパム警告音
            </button>
            <button
              onClick={() => playChimeSound(volume)}
              className="px-2.5 py-1 bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800/80 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Play size={10} /> 🔔 通常チャイム
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <FlaskConical size={12} className="text-blue-400" /> テスト発生:
            </span>
            <button
              onClick={() => handleSimulateAlert('emergency_report')}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all"
              title="ダミーの緊急通報データを生成して通知テスト"
            >
              <Zap size={11} className="text-rose-400" /> 通報シミュレーション
            </button>
            <button
              onClick={() => handleSimulateAlert('spam_attack')}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all"
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
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider font-sans">
                  {activeToast.severity}
                </span>
                <h4 className="text-sm sm:text-base font-bold font-serif text-white">{activeToast.title}</h4>
              </div>
              <p className="text-xs text-rose-200 font-sans leading-relaxed">{activeToast.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-sans">
            {activeToast.actionUrl && (
              <button
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
              onClick={() => setActiveToast(null)}
              className="p-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-xl text-xs cursor-pointer transition-all"
              title="トーストを閉じる"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* アクティブアラート詳細カードリスト */}
      {alerts.length > 0 && (
        <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4 border border-rose-200/80 bg-rose-50/30">
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600" />
              <h4 className="text-sm sm:text-base font-serif font-bold text-neutral-900">
                対応待ちのリアルタイム緊急アラート ({alerts.length}件)
              </h4>
            </div>
            <span className="text-[11px] text-neutral-500 font-sans">
              クリックで該当の管理画面へダイレクト遷移
            </span>
          </div>

          <div className="space-y-2.5 font-sans">
            {alerts.map((alertItem: any) => {
              const isCrit = alertItem.severity === 'CRITICAL';
              const isHigh = alertItem.severity === 'HIGH';

              const borderClass = isCrit ? 'border-rose-300 bg-rose-50/80 hover:bg-rose-100/80' : isHigh ? 'border-amber-300 bg-amber-50/80 hover:bg-amber-100/80' : 'border-neutral-200 bg-white hover:bg-neutral-50';
              const badgeClass = isCrit ? 'bg-rose-100 text-rose-900 border-rose-300' : isHigh ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-neutral-100 text-neutral-800 border-neutral-300';
              const iconEl = isCrit ? <ShieldAlert size={16} className="text-rose-600 shrink-0" /> : isHigh ? <AlertTriangle size={16} className="text-amber-600 shrink-0" /> : <Lock size={16} className="text-neutral-600 shrink-0" />;

              return (
                <div
                  key={alertItem.id}
                  onClick={() => alertItem.actionUrl && onNavigateTab(alertItem.actionUrl)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${borderClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{iconEl}</div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}>
                          {alertItem.severity}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-neutral-900">{alertItem.title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(alertItem.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">{alertItem.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={(e) => handleDismissAlert(alertItem.id, e)}
                      className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-medium flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      title="このアラートを既読にして非表示"
                    >
                      <Check size={13} />
                      <span>既読にする</span>
                    </button>
                    {alertItem.actionUrl && (
                      <span className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs">
                        <span>対応</span>
                        <ExternalLink size={12} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
