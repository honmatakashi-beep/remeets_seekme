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
  Filter,
  Trash2
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
  const [severityFilter, setSeverityFilter] = useState<'all' | 'pending' | 'resolved' | 'CRITICAL' | 'HIGH' | 'AI' | 'LOCK'>('all');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  // 直近検知したアラートIDのトラッキング（重複通知・連続鳴動防止）
  const knownAlertIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);
  const [activeToast, setActiveToast] = useState<any | null>(null);

  // 🚨 統合即時防衛モーダル（Report, AI, Lock, Spam）ステート
  const [selectedAlertModal, setSelectedAlertModal] = useState<any | null>(null);
  const [modalDetails, setModalDetails] = useState<any | null>(null);
  const [isLoadingModalDetails, setIsLoadingModalDetails] = useState<boolean>(false);
  const [isExecutingModalAction, setIsExecutingModalAction] = useState<boolean>(false);

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
  const handleSimulateAlert = async (type: 'emergency_report' | 'spam_attack' | 'ai_violation' | 'lock_attack') => {
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
            } else if (simAlert.severity === 'HIGH' || simAlert.type === 'MASS_POSTING_SPAM' || simAlert.type === 'AI_SAFETY_VIOLATION' || simAlert.type === 'BRUTE_FORCE_ATTACK') {
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

        // 最新のアラート一覧を即座に再取得してテーブルを更新
        await fetchLiveAlerts(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'シミュレーションデータの生成に失敗しました。');
      }
    } catch (err) {
      console.error("Failed to run alert simulation:", err);
      alert('通信エラーが発生しました。');
    }
  };

  // テストデータ・シミュレーション一括消去
  const handleClearTestData = async () => {
    if (!token) return;
    if (!window.confirm("【確認】テスト・シミュレーションで生成されたボトルメール、緊急通報、および警報履歴を一括削除して初期化しますか？\n（※通常の本番ボトルメールや正規データは影響を受けません）")) {
      return;
    }

    try {
      const res = await fetch('/api/admin/live-alerts/clear-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'テストデータを一括消去しました。');
        knownAlertIdsRef.current.clear();
        setActiveToast(null);
        setLiveData({
          summary: { 
            totalActiveAlerts: 0, 
            pendingReportsCount: 0, 
            spamDetectionsCount: 0, 
            aiFlaggedCount: 0, 
            lockedIpsCount: 0,
            totalAllAlerts: 0,
            totalResolvedAlerts: 0
          },
          alerts: [],
          pendingReports: [],
          spamGroups: [],
          aiFlaggedPosts: [],
          lockedIps: []
        });
        fetchLiveAlerts(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'テストデータの一括消去に失敗しました。');
      }
    } catch (err) {
      console.error("Failed to clear test data:", err);
      alert('通信エラーが発生しました。');
    }
  };

  // 🚨 統合調査 ＆ 防衛モーダルを開く（種別ごとにAPIから詳細取得）
  const handleOpenAlertModal = async (alertItem: any) => {
    setSelectedAlertModal(alertItem);
    setModalDetails(null);
    setIsLoadingModalDetails(true);

    try {
      let endpoint = '';
      let reqBody: any = {};

      if (alertItem.type === 'EMERGENCY_REPORT') {
        endpoint = '/api/admin/live-alerts/report-details';
        reqBody = { reportId: alertItem.rawId };
      } else if (alertItem.type === 'AI_SAFETY_VIOLATION') {
        endpoint = '/api/admin/live-alerts/ai-details';
        reqBody = { postId: alertItem.rawId || alertItem.targetId };
      } else if (alertItem.type === 'BRUTE_FORCE_ATTACK') {
        endpoint = '/api/admin/live-alerts/lock-details';
        reqBody = { ip: alertItem.ip || alertItem.targetId, rawId: alertItem.rawId };
      } else if (alertItem.type === 'MASS_POSTING_SPAM') {
        endpoint = '/api/admin/live-alerts/spam-details';
        reqBody = {
          postIds: alertItem.postIds,
          ip: alertItem.ip,
          userId: alertItem.userId
        };
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reqBody)
        });

        if (res.ok) {
          const data = await res.json();
          setModalDetails(data);
        } else {
          alert('詳細データの取得に失敗しました。');
        }
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました。');
    } finally {
      setIsLoadingModalDetails(false);
    }
  };

  // 🚨 防衛アクション実行（全種別対応）
  const handleExecuteAlertAction = async (actionType: string, customParams: any = {}) => {
    if (!selectedAlertModal) return;

    let confirmMsg = '';
    const alertType = selectedAlertModal.type;

    // 通報
    if (alertType === 'EMERGENCY_REPORT') {
      if (actionType === 'DISMISS_REPORT') confirmMsg = 'この通報を「却下・誤報」として処理しますか？';
      else if (actionType === 'RESOLVE_REPORT') confirmMsg = '通報を「解決済み」として処理しますか？';
      else if (actionType === 'DELETE_POST') confirmMsg = '通報対象のメッセージ（ボトルメール）を即時削除・アーカイブしますか？';
      else if (actionType === 'BLOCK_USER') confirmMsg = '被通報者のアカウントを即時凍結しますか？';
      else if (actionType === 'RESOLVE_AND_DEFEND') confirmMsg = '【🚨 緊急一括防衛】\n・通報対象のメッセージを削除\n・投稿者を凍結\n・通報を解決済みに変更\nを一括実行しますか？';
    }
    // AI検閲
    else if (alertType === 'AI_SAFETY_VIOLATION') {
      if (actionType === 'APPROVE_UNFLAG') confirmMsg = 'このボトルメールのAI隔離を解除し、一般公開（合格）へ復帰させますか？';
      else if (actionType === 'ARCHIVE_DELETE') confirmMsg = 'AI検閲内容を確定し、このボトルメールを完全削除（隔離アーカイブ）しますか？';
      else if (actionType === 'BLOCK_AUTHOR_AND_DELETE') confirmMsg = '【🚨 緊急一括防衛】\n・ボトルメールを削除\n・投稿者をアカウント凍結\nを一括実行しますか？';
    }
    // 総当たりロック
    else if (alertType === 'BRUTE_FORCE_ATTACK') {
      if (actionType === 'UNLOCK_IP') confirmMsg = `IP（${selectedAlertModal.ip || selectedAlertModal.targetId}）のクイズ誤答ロックを解除し、アクセス制限を解除しますか？`;
      else if (actionType === 'EXTEND_BLOCK_30D') confirmMsg = `不正総当たり攻撃と判定し、IP（${selectedAlertModal.ip || selectedAlertModal.targetId}）を「30日間完全アクセス遮断」に延長しますか？`;
    }
    // 連投スパム
    else if (alertType === 'MASS_POSTING_SPAM') {
      if (actionType === 'DELETE_POSTS') confirmMsg = `連投されたメッセージ（${modalDetails?.posts?.length || selectedAlertModal.postCount || ''}件）を全て削除（隔離）しますか？`;
      else if (actionType === 'BLOCK_USER') confirmMsg = `該当ユーザーを即座にアカウント凍結（ロック）しますか？`;
      else if (actionType === 'BLOCK_IP') confirmMsg = `接続元IP（${selectedAlertModal.ip}）からのアクセスを30日間ブロックしますか？`;
      else if (actionType === 'RESOLVE_ALL') confirmMsg = `【🚨 緊急一括防衛】\n・連投メッセージの全削除\n・ユーザーアカウント凍結\n・接続元IPブロック\nを一括で即時実行します。よろしいですか？`;
    }

    if (confirmMsg && !window.confirm(confirmMsg)) return;

    setIsExecutingModalAction(true);
    try {
      let endpoint = '';
      let reqBody: any = { actionType, alertId: selectedAlertModal.id, ...customParams };

      if (alertType === 'EMERGENCY_REPORT') {
        endpoint = '/api/admin/live-alerts/report-action';
        reqBody.reportId = selectedAlertModal.rawId;
        reqBody.postId = modalDetails?.targetPost?.id;
        reqBody.userId = modalDetails?.targetUser?.id;
      } else if (alertType === 'AI_SAFETY_VIOLATION') {
        endpoint = '/api/admin/live-alerts/ai-action';
        reqBody.postId = selectedAlertModal.rawId || selectedAlertModal.targetId;
        reqBody.userId = modalDetails?.user?.id || modalDetails?.post?.user_id;
      } else if (alertType === 'BRUTE_FORCE_ATTACK') {
        endpoint = '/api/admin/live-alerts/lock-action';
        reqBody.ip = selectedAlertModal.ip || selectedAlertModal.targetId;
      } else if (alertType === 'MASS_POSTING_SPAM') {
        endpoint = '/api/admin/live-alerts/spam-action';
        reqBody.postIds = selectedAlertModal.postIds || modalDetails?.posts?.map((p: any) => p.id);
        reqBody.userId = selectedAlertModal.userId || modalDetails?.userInfo?.id;
        reqBody.ip = selectedAlertModal.ip;
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reqBody)
        });

        if (res.ok) {
          const result = await res.json();
          alert(result.message || '防衛アクションを実行しました。');
          setSelectedAlertModal(null);
          setModalDetails(null);
          fetchLiveAlerts(true);
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.error || '防衛アクションの実行に失敗しました。');
        }
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました。');
    } finally {
      setIsExecutingModalAction(false);
    }
  };

  // 対応アクションの日本語表記ヘルパー
  const getActionLabel = (actionType?: string) => {
    if (!actionType) return '防衛措置完了';
    if (actionType === 'RESOLVE_ALL') return '🚨 緊急一括防衛';
    if (actionType === 'DELETE_POSTS' || actionType === 'DELETE_POST') return '🗑️ メッセージ削除';
    if (actionType === 'BLOCK_USER') return '🚫 アカウント凍結';
    if (actionType === 'BLOCK_IP') return '🛡️ IP遮断';
    if (actionType === 'RESOLVE_AND_DEFEND') return '🚨 通報一括防衛';
    if (actionType === 'RESOLVE_REPORT') return '✅ 通報解決';
    if (actionType === 'DISMISS_REPORT') return '❌ 通報却下';
    if (actionType === 'APPROVE_UNFLAG') return '🟢 公開承認';
    if (actionType === 'ARCHIVE_DELETE') return '🗑️ 隔離削除';
    if (actionType === 'BLOCK_AUTHOR_AND_DELETE') return '🚨 投稿者凍結+削除';
    if (actionType === 'UNLOCK_IP') return '🔓 ロック解除';
    if (actionType === 'EXTEND_BLOCK_30D') return '🚫 30日遮断';
    return actionType;
  };

  const { summary = {}, alerts = [] } = liveData;

  // フィルタリング処理
  const filteredAlerts = alerts.filter((a: any) => {
    if (severityFilter === 'pending' && a.status === 'resolved') return false;
    if (severityFilter === 'resolved' && a.status !== 'resolved') return false;
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
        {/* カード1: 要対応アラート */}
        <div className="bg-white/90 backdrop-blur-md border border-rose-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">🚨 要対応警報</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-rose-700">{summary.totalActiveAlerts || 0}</span>
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
            <span className="text-2xl font-bold font-serif text-amber-700">{summary.pendingReportsCount || 0}</span>
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
            <span className="text-2xl font-bold font-serif text-orange-700">{summary.spamDetectionsCount || 0}</span>
            <span className="text-xs text-orange-500">グループ</span>
          </div>
          <div className="mt-1 text-[11px] text-orange-600 font-medium">短時間連投・ボット検知</div>
        </div>

        {/* カード4: 対応済み実績数 */}
        <div className="bg-white/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">✅ 防衛対応済み</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-emerald-700">
              {summary.totalResolvedAlerts || 0}
            </span>
            <span className="text-xs text-emerald-600">件</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">対処完了・防衛保全済み</div>
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
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all hover:border-rose-500/50"
              title="ダミーの緊急通報データを生成して通知テスト"
            >
              <Zap size={11} className="text-rose-400" /> 通報テスト
            </button>
            <button
              type="button"
              onClick={() => handleSimulateAlert('spam_attack')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all hover:border-amber-500/50"
              title="3件の連続投稿データを生成してスパム検知テスト"
            >
              <Flame size={11} className="text-amber-400" /> 連投スパムテスト
            </button>
            <button
              type="button"
              onClick={() => handleSimulateAlert('ai_violation')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all hover:border-blue-500/50"
              title="AI安全防衛エンジンの検閲フラグボトルのテストデータを生成"
            >
              <Bot size={11} className="text-blue-400" /> AI検閲テスト
            </button>
            <button
              type="button"
              onClick={() => handleSimulateAlert('lock_attack')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all hover:border-purple-500/50"
              title="合言葉クイズ総当たり誤答によるIP凍結ロックのテストデータを生成"
            >
              <Lock size={11} className="text-purple-400" /> 誤答ロックテスト
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
            <button
              type="button"
              onClick={() => {
                const toastItem = activeToast;
                setActiveToast(null);
                handleOpenAlertModal(toastItem);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all animate-pulse"
            >
              <ShieldAlert size={14} className="text-slate-950" />
              <span>
                {activeToast.type === 'EMERGENCY_REPORT' ? '🚨 通報を即時調査・防衛' :
                 activeToast.type === 'MASS_POSTING_SPAM' ? '🚨 スパム緊急調査・防衛' :
                 activeToast.type === 'AI_SAFETY_VIOLATION' ? '🤖 AI検閲を審査・防衛' :
                 '🔒 クイズ攻撃を調査・防衛'}
              </span>
            </button>
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
                  全 <span className="font-serif font-bold">{alerts.length}</span> 件
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
              onClick={handleClearTestData}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="シミュレーションで追加されたテスト用ボトルメールや通報・警報履歴をすべて消去します"
            >
              <Trash2 size={14} className="text-rose-600" />
              <span>テストデータ一括消去</span>
            </button>

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
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold flex-wrap">
              {[
                { id: 'all', label: 'すべて', count: alerts.length },
                { id: 'pending', label: '🚨 要対応', count: alerts.filter((a: any) => a.status !== 'resolved').length },
                { id: 'resolved', label: '✅ 対応済み', count: alerts.filter((a: any) => a.status === 'resolved').length },
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
                    <th className="px-3.5 py-2.5 whitespace-nowrap">対応状況</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">検知日時</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">重要度 / 種別</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">タイトル / 対象</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">検知メッセージ・処置</th>
                    <th className="px-3.5 py-2.5 whitespace-nowrap">接続元 IP</th>
                    <th className="px-3.5 py-2.5 text-right whitespace-nowrap">即時アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedAlerts.map((a: any) => {
                    const isCrit = a.severity === 'CRITICAL';
                    const isHigh = a.severity === 'HIGH';
                    const isResolved = a.status === 'resolved';

                    return (
                      <tr 
                        key={a.id} 
                        className={`h-12 transition-colors group ${
                          isResolved ? 'bg-slate-50/40 opacity-80 hover:opacity-100' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* 0. Status Badge */}
                        <td className="px-3.5 py-2 whitespace-nowrap">
                          {isResolved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>対応済み</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                              <AlertTriangle size={12} className="text-rose-600" />
                              <span>要対応</span>
                            </span>
                          )}
                        </td>

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

                        {/* 4. Message & Resolved Details */}
                        <td className="px-3.5 py-2 max-w-sm truncate text-slate-600">
                          <span className="truncate block" title={a.message}>
                            {a.message}
                          </span>
                          {isResolved && a.resolvedInfo && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                              <span>処置: {getActionLabel(a.resolvedInfo.actionType)}</span>
                              <span>•</span>
                              <span>{new Date(a.resolvedInfo.resolvedAt).toLocaleTimeString('ja-JP')}</span>
                            </span>
                          )}
                        </td>

                        {/* 5. IP */}
                        <td className="px-3.5 py-2 whitespace-nowrap font-mono text-[11px] text-slate-500">
                          {a.ip || '-'}
                        </td>

                        {/* 6. Action */}
                        <td className="px-3.5 py-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAlertModal(a)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                                isResolved
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300' :
                                a.type === 'EMERGENCY_REPORT' 
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' :
                                a.type === 'MASS_POSTING_SPAM' 
                                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold' :
                                a.type === 'AI_SAFETY_VIOLATION'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                              title={isResolved ? "対応内容・詳細ログを確認" : "専用モーダルを開いて即時調査・防衛アクションを実行"}
                            >
                              {isResolved ? (
                                <>
                                  <CheckCircle2 size={12} className="text-emerald-600" />
                                  <span>対応済み (確認)</span>
                                </>
                              ) : (
                                <>
                                  <ShieldAlert size={12} />
                                  <span>調査・防衛</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDismissAlert(a.id, e)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="アラート一覧から非表示（既読）にする"
                            >
                              <Check size={12} />
                              <span>非表示</span>
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
                  全 <span className="font-serif font-bold text-slate-800">{filteredAlerts.length}</span> 件中{' '}
                  <span className="font-serif font-bold text-slate-800">{(currentPage - 1) * perPage + 1}</span> 〜{' '}
                  <span className="font-serif font-bold text-slate-800">{Math.min(currentPage * perPage, filteredAlerts.length)}</span> 件を表示
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
                    
                    <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-serif font-bold">
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

      {/* 🚨 統合緊急調査 ＆ 即時防衛モーダル（専用別ウィンドウ・ダイアログ） */}
      {selectedAlertModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-rose-500 shadow-2xl max-w-4xl w-full overflow-hidden text-left font-sans animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`p-5 sm:p-6 text-white flex items-center justify-between border-b shrink-0 ${
              selectedAlertModal.type === 'EMERGENCY_REPORT' ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-slate-950 border-rose-800/80' :
              selectedAlertModal.type === 'MASS_POSTING_SPAM' ? 'bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 border-amber-800/80' :
              selectedAlertModal.type === 'AI_SAFETY_VIOLATION' ? 'bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 border-blue-800/80' :
              'bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 border-purple-800/80'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl border text-white flex items-center justify-center shadow-lg animate-pulse shrink-0 ${
                  selectedAlertModal.type === 'EMERGENCY_REPORT' ? 'bg-rose-600 border-rose-400' :
                  selectedAlertModal.type === 'MASS_POSTING_SPAM' ? 'bg-amber-600 border-amber-400 text-slate-950' :
                  selectedAlertModal.type === 'AI_SAFETY_VIOLATION' ? 'bg-blue-600 border-blue-400' :
                  'bg-purple-600 border-purple-400'
                }`}>
                  {selectedAlertModal.type === 'EMERGENCY_REPORT' ? <AlertTriangle size={24} /> :
                   selectedAlertModal.type === 'MASS_POSTING_SPAM' ? <Flame size={24} /> :
                   selectedAlertModal.type === 'AI_SAFETY_VIOLATION' ? <Bot size={24} /> :
                   <Lock size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                      {selectedAlertModal.type} • {selectedAlertModal.severity}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {selectedAlertModal.timestamp}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    {selectedAlertModal.type === 'EMERGENCY_REPORT' ? '🚨 緊急通報 即時調査 ＆ 防衛指令センター' :
                     selectedAlertModal.type === 'MASS_POSTING_SPAM' ? '⚡ 大量連続投稿スパム 緊急調査 ＆ 即時防衛センター' :
                     selectedAlertModal.type === 'AI_SAFETY_VIOLATION' ? '🤖 AI検閲隔離 証拠確認 ＆ 審査センター' :
                     '🔒 クイズ総当たり不正回答 攻撃元調査 ＆ 防衛センター'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedAlertModal.type === 'EMERGENCY_REPORT' ? '通報されたメッセージの内容、申告理由、通報者および被通報者のアカウント情報を照合し、即座に対処します。' :
                     selectedAlertModal.type === 'MASS_POSTING_SPAM' ? '短時間に連続投函されたボトルメールの内容と投稿者アカウント・接続元IPを即時調査し、一括対処を実行します。' :
                     selectedAlertModal.type === 'AI_SAFETY_VIOLATION' ? 'AI安全防衛エンジンが自動隔離したメッセージの危険度・判定理由を確認し、公開復帰または完全削除を実行します。' :
                     '短時間にクイズ誤答を繰り返した接続元IPの履歴を確認し、ブロック期間の延長または誤認解除を実行します。'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedAlertModal(null);
                  setModalDetails(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="モーダルを閉じる"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {isLoadingModalDetails ? (
                <div className="p-16 text-center text-slate-500 space-y-3">
                  <RefreshCw className="animate-spin mx-auto text-rose-600" size={32} />
                  <p className="text-sm font-bold">関連データ・証拠ログを照合中...</p>
                </div>
              ) : (
                <>
                  {/* ====== 種別 1: 緊急通報 (EMERGENCY_REPORT) ====== */}
                  {selectedAlertModal.type === 'EMERGENCY_REPORT' && modalDetails?.report && (
                    <div className="space-y-4">
                      {/* 通報概要カード */}
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white">
                            通報ID #{modalDetails.report.id} ({modalDetails.report.report_type || '不適切コンテンツ'})
                          </span>
                          <span className="text-xs text-rose-800 font-mono">
                            通報日時: {modalDetails.report.created_at}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-rose-700 block">通報者からの申告理由:</span>
                          <p className="text-sm font-bold text-slate-900 bg-white p-3 rounded-xl border border-rose-200 leading-relaxed">
                            {modalDetails.report.reason}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-rose-900">
                          <span>申告者: <b>{modalDetails.report.reporter_nickname || modalDetails.report.reporter_username || '匿名'}</b></span>
                          {modalDetails.report.reporter_email && (
                            <span>連絡先: <b className="font-mono">{modalDetails.report.reporter_email}</b></span>
                          )}
                        </div>
                      </div>

                      {/* 対象メッセージ (Post) */}
                      {modalDetails.targetPost && (
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                              <Flame size={16} className="text-rose-600" />
                              <span>通報されたメッセージ (ボトル #{modalDetails.targetPost.id})</span>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">{modalDetails.targetPost.created_at}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-slate-50 rounded-lg">宛先: <b>{modalDetails.targetPost.target_name}</b></div>
                            <div className="p-2 bg-slate-50 rounded-lg">差出人: <b>{modalDetails.targetPost.searcher_name || '匿名'}</b></div>
                          </div>
                          <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                            {modalDetails.targetPost.message}
                          </p>
                        </div>
                      )}

                      {/* 被通報者アカウント (Target User) */}
                      {modalDetails.targetUser && (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>被通報者アカウント情報</span>
                            <span className={modalDetails.targetUser.is_blocked ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                              {modalDetails.targetUser.is_blocked ? "🚫 凍結中" : "🟢 通常"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-slate-50 rounded-lg">UID: <b className="font-mono">{modalDetails.targetUser.username}</b></div>
                            <div className="p-2 bg-slate-50 rounded-lg">氏名/表示名: <b>{modalDetails.targetUser.nickname || modalDetails.targetUser.full_name || '-'}</b></div>
                            <div className="p-2 bg-slate-50 rounded-lg truncate">Email: <b className="font-mono">{modalDetails.targetUser.email || '-'}</b></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== 種別 2: AI検閲隔離 (AI_SAFETY_VIOLATION) ====== */}
                  {selectedAlertModal.type === 'AI_SAFETY_VIOLATION' && modalDetails?.post && (
                    <div className="space-y-4">
                      {/* AI判定結果カード */}
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white flex items-center gap-1.5">
                            <Bot size={13} />
                            <span>AI安全エンジン検閲フラグ付与</span>
                          </span>
                          <span className="text-xs text-blue-800 font-mono">
                            投函日時: {modalDetails.post.created_at}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-blue-800 block">AI検閲・隔離理由:</span>
                          <p className="text-sm font-bold text-slate-900 bg-white p-3 rounded-xl border border-blue-200 leading-relaxed">
                            {modalDetails.post.ai_reason || '不適切・ストーカー・連絡先露出の疑い'}
                          </p>
                        </div>
                      </div>

                      {/* メッセージ本文 */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="font-bold text-slate-800 text-sm">メッセージ本文 (ボトル #{modalDetails.post.id})</span>
                          <span className="text-xs text-slate-500">宛先: <b>{modalDetails.post.target_name}</b> | 差出人: <b>{modalDetails.post.searcher_name || '匿名'}</b></span>
                        </div>
                        <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                          {modalDetails.post.message}
                        </p>
                      </div>

                      {/* 投稿者アカウント */}
                      {modalDetails.user && (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>投稿者アカウント情報</span>
                            <span className={modalDetails.user.is_blocked ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                              {modalDetails.user.is_blocked ? "🚫 凍結中" : "🟢 通常"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-slate-50 rounded-lg">UID: <b className="font-mono">{modalDetails.user.username}</b></div>
                            <div className="p-2 bg-slate-50 rounded-lg">氏名/表示名: <b>{modalDetails.user.nickname || modalDetails.user.full_name || '-'}</b></div>
                            <div className="p-2 bg-slate-50 rounded-lg truncate">Email: <b className="font-mono">{modalDetails.user.email || '-'}</b></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== 種別 3: 総当たりロック (BRUTE_FORCE_ATTACK) ====== */}
                  {selectedAlertModal.type === 'BRUTE_FORCE_ATTACK' && (
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-600 text-white flex items-center gap-1.5">
                            <Lock size={13} />
                            <span>クイズ総当たり不正回答攻撃</span>
                          </span>
                          <span className="text-xs text-purple-800 font-mono">
                            最終試行: {modalDetails?.lockRecord?.last_attempt || selectedAlertModal.timestamp}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-purple-200">
                            <span className="text-[11px] font-bold text-purple-700 block mb-1">攻撃元 IP</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{modalDetails?.ip || selectedAlertModal.ip || selectedAlertModal.targetId}</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-purple-200">
                            <span className="text-[11px] font-bold text-purple-700 block mb-1">連続誤答回数</span>
                            <span className="font-mono font-bold text-rose-600 text-sm">{modalDetails?.lockRecord?.count || 4} 回</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-purple-200">
                            <span className="text-[11px] font-bold text-purple-700 block mb-1">現在のロック期限</span>
                            <span className="font-mono text-slate-800 text-xs truncate block">{modalDetails?.lockRecord?.locked_until || '24時間ロック中'}</span>
                          </div>
                        </div>
                      </div>

                      {modalDetails?.targetPost && (
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                          <div className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                            標的となったボトルメール (#{modalDetails.targetPost.id})
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-slate-50 rounded-lg">宛先: <b>{modalDetails.targetPost.target_name}</b></div>
                            <div className="p-2 bg-slate-50 rounded-lg">差出人: <b>{modalDetails.targetPost.searcher_name || '匿名'}</b></div>
                          </div>
                          <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                            {modalDetails.targetPost.message}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== 種別 4: 連投スパム (MASS_POSTING_SPAM) ====== */}
                  {selectedAlertModal.type === 'MASS_POSTING_SPAM' && (
                    <>
                      {/* 1. 投稿者・接続元 IP インサイトカード */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <UserX size={16} className="text-rose-600" />
                            <span>投稿者アカウント ＆ 接続元情報</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {modalDetails?.userInfo?.is_blocked === 1 ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                🚫 アカウント凍結中
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🟢 通常アカウント
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">ユーザーID / UID</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {modalDetails?.userInfo?.username || (selectedAlertModal.userId ? `UID #${selectedAlertModal.userId}` : 'ゲスト / 不明')}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">ニックネーム / 氏名</span>
                            <span className="font-bold text-slate-900 text-sm truncate block">
                              {modalDetails?.userInfo?.nickname || modalDetails?.userInfo?.full_name || '未設定'}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">登録メールアドレス</span>
                            <span className="font-mono text-slate-800 text-xs truncate block" title={modalDetails?.userInfo?.email}>
                              {modalDetails?.userInfo?.email || '-'}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">接続元 IP アドレス</span>
                            <span className="font-mono font-bold text-rose-700 text-sm">
                              {selectedAlertModal.ip || modalDetails?.ip || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. 連投されたメッセージ一覧 */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <Flame size={16} className="text-amber-500" />
                            <span>連続投函されたメッセージ一覧（全 {modalDetails?.posts?.length || 0} 件）</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            短時間に投函されたボトルメール
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs">
                          {modalDetails?.posts && modalDetails.posts.length > 0 ? (
                            modalDetails.posts.map((p: any, idx: number) => (
                              <div key={p.id || idx} className="p-4 hover:bg-slate-50/80 transition-colors space-y-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[10px]">
                                      ボトル #{p.id}
                                    </span>
                                    <span className="font-bold text-slate-900">
                                      宛先: {p.target_name || '未設定'}
                                    </span>
                                    <span className="text-slate-400">|</span>
                                    <span className="text-slate-600">
                                      差出人: {p.searcher_name || '匿名'}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    {p.created_at}
                                  </span>
                                </div>

                                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed font-sans">
                                  {p.message}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-slate-400">
                              該当するメッセージデータが見つかりませんでした（既に削除済みの可能性があります）。
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer: 緊急防衛アクションボタン群（種別ごとに切り替え） */}
            <div className="p-5 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 font-medium text-left">
                ※ 防衛アクションを実行すると監査ログに記録され、アラートは自動的に解決済みに移行します。
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                {/* 1. 通報アクション */}
                {selectedAlertModal.type === 'EMERGENCY_REPORT' && (
                  <>
                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('DISMISS_REPORT')}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      title="誤報として却下"
                    >
                      通報を却下
                    </button>
                    {modalDetails?.targetPost && (
                      <button
                        type="button"
                        disabled={isExecutingModalAction}
                        onClick={() => handleExecuteAlertAction('DELETE_POST')}
                        className="px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 size={13} />
                        <span>メッセージを削除</span>
                      </button>
                    )}
                    {modalDetails?.targetUser && (
                      <button
                        type="button"
                        disabled={isExecutingModalAction || modalDetails.targetUser.is_blocked}
                        onClick={() => handleExecuteAlertAction('BLOCK_USER')}
                        className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Ban size={13} />
                        <span>ユーザー凍結</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('RESOLVE_AND_DEFEND')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                    >
                      <Zap size={14} />
                      <span>🚨 一括防衛 (削除＋凍結)</span>
                    </button>
                  </>
                )}

                {/* 2. AI検閲アクション */}
                {selectedAlertModal.type === 'AI_SAFETY_VIOLATION' && (
                  <>
                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('APPROVE_UNFLAG')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="誤検知として公開復帰"
                    >
                      <CheckCircle2 size={14} className="text-emerald-700" />
                      <span>誤検知解除（公開承認）</span>
                    </button>
                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('ARCHIVE_DELETE')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>メッセージを削除アーカイブ</span>
                    </button>
                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('BLOCK_AUTHOR_AND_DELETE')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap size={14} />
                      <span>🚨 悪質投稿者凍結 ＋ 削除</span>
                    </button>
                  </>
                )}

                {/* 3. 総当たりロックアクション */}
                {selectedAlertModal.type === 'BRUTE_FORCE_ATTACK' && (
                  <>
                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('UNLOCK_IP')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} className="text-emerald-700" />
                      <span>ロック即時解除 (誤認救済)</span>
                    </button>
                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('EXTEND_BLOCK_30D')}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Ban size={14} />
                      <span>🚫 30日間完全アクセス遮断</span>
                    </button>
                  </>
                )}

                {/* 4. 連投スパムアクション */}
                {selectedAlertModal.type === 'MASS_POSTING_SPAM' && (
                  <>
                    <button
                      type="button"
                      disabled={isExecutingModalAction || !modalDetails?.posts?.length}
                      onClick={() => handleExecuteAlertAction('DELETE_POSTS')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Trash2 size={14} className="text-slate-600" />
                      <span>メッセージを一括削除 ({modalDetails?.posts?.length || 0}件)</span>
                    </button>

                    {modalDetails?.userInfo && (
                      <button
                        type="button"
                        disabled={isExecutingModalAction || modalDetails.userInfo.is_blocked === 1}
                        onClick={() => handleExecuteAlertAction('BLOCK_USER')}
                        className="px-3.5 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                      >
                        <Ban size={14} className="text-orange-700" />
                        <span>ユーザー凍結</span>
                      </button>
                    )}

                    {selectedAlertModal.ip && (
                      <button
                        type="button"
                        disabled={isExecutingModalAction}
                        onClick={() => handleExecuteAlertAction('BLOCK_IP')}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                      >
                        <ShieldAlert size={14} className="text-rose-700" />
                        <span>IP遮断</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isExecutingModalAction}
                      onClick={() => handleExecuteAlertAction('RESOLVE_ALL')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-extrabold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 animate-pulse"
                    >
                      <Zap size={15} />
                      <span>🚨 緊急一括防衛（メッセージ全削除 ＋ 凍結）</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
