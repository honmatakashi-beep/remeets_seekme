import { useState } from "react";

export interface UseAdminAuditAndBroadcastProps {
  token: string | null;
  fetchData: () => Promise<void>;
  setStatusMsg: (msg: any) => void;
  setDbHealth?: React.Dispatch<React.SetStateAction<any>>;
  showConfirm: (title: string, message: string, onConfirm: () => void | Promise<void>) => void;
}

export const useAdminAuditAndBroadcast = ({
  token,
  fetchData,
  setStatusMsg,
  setDbHealth,
  showConfirm
}: UseAdminAuditAndBroadcastProps) => {
  // Audit Logs & Export States
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reunionFunnel, setReunionFunnel] = useState<any[]>([]);
  const [reunionDurationStats, setReunionDurationStats] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('access_logs');
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewTimeframe, setPreviewTimeframe] = useState('7d');

  // Broadcast & Bulk Notification States
  const [isSending, setIsSending] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingNotification, setPendingNotification] = useState<{content: string, link: string} | null>(null);

  const handleUnblockIp = async (ip: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/unblock-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip })
      });
      if (res.ok) {
        alert(`IPアドレス ${ip} のブロックを解除しました。`);
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'ブロック解除に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信に失敗しました。');
    }
  };

  const handleBlockIp = async (ip: string, reason: string = "Admin manual block") => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/block-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip, reason })
      });
      if (res.ok) {
        alert(`IPアドレス ${ip} をアクセス遮断リストに登録しました。`);
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'ブロック登録に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信に失敗しました。');
    }
  };

  const handleExportAuditBundle = async (timeframe: string = 'all') => {
    setIsExporting(timeframe);
    try {
      const res = await fetch(`/api/admin/export/audit-bundle?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('監査バンドルの取得に失敗しました。');
      }
      const data = await res.json();
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `remeets_audit_bundle_${timeframe}_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setStatusMsg({ text: `監査証跡パッケージ (${timeframe}) のダウンロードが完了しました。`, type: 'success' });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'エクスポート中にエラーが発生しました。');
    } finally {
      setIsExporting(null);
    }
  };

  const convertToCsvAndDownload = (filename: string, headers: string[], rows: any[], mappingFn: (row: any) => any[]) => {
    const csvRows = [
      headers.join(','),
      ...rows.map(row => {
        const mapped = mappingFn(row);
        return mapped.map((val: any) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',');
      })
    ];
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTableCsv = (category: string, rawData: any[], timeframe: string) => {
    if (!rawData || rawData.length === 0) {
      alert('出力可能なデータがありません。');
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `remeets_${category}_${timeframe}_${dateStr}`;
    let headers: string[] = [];
    let mappingFn = (row: any) => Object.values(row);

    switch (category) {
      case 'access_logs':
        headers = ['ID', 'ユーザーID', 'アクション種別', '詳細内容', 'IPアドレス', 'User Agent', '日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || 'ゲスト',
          row.action || '',
          row.details || '',
          row.ip_address || '',
          row.user_agent || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'security_logs':
        headers = ['ID', 'イベントタイプ', '重大度', '詳細メッセージ', 'IPアドレス', 'ユーザーID', '日時'];
        mappingFn = (row: any) => [
          row.id,
          row.event_type || '',
          row.severity || 'INFO',
          row.details || '',
          row.ip_address || '',
          row.user_id || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'system_audit_logs':
        headers = ['ID', 'イベント名', '実行者(管理者)', '変更内容詳細', 'IPアドレス', '日時'];
        mappingFn = (row: any) => [
          row.id,
          row.event || '',
          row.admin_username || row.admin_id || '',
          row.details || '',
          row.ip || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'age_logs':
        headers = ['ID', 'ユーザーID', '試行方法', '成否', 'IPアドレス', '端末OS/ブラウザ', '日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || '',
          row.method || '',
          row.status === 'verified' || row.status === 'success' ? '成功' : '失敗/警告',
          row.ip_address || '',
          row.user_agent || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'users':
        headers = ['ユーザーID', 'ユーザー名', 'ニックネーム', '本名', '旧姓', 'メールアドレス', '連絡先ID', 'eKYC認証', '凍結状態', '登録日時'];
        mappingFn = (row: any) => [
          row.id,
          row.username || '',
          row.nickname || '',
          row.full_name || '',
          row.maiden_name || '',
          row.email || '',
          row.contact_id || '',
          row.is_ekyc_verified ? '認証済' : '未認証',
          row.is_blocked ? '凍結' : '正常',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'posts':
        headers = ['ボトルID', '投稿者ID', '探している人(検索名)', 'フルネーム', '対象のお名前', '年代', '関係分類', 'AI検知理由', 'ステータス', '投函日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || '',
          row.searcher_name || '',
          row.searcher_full_name || '',
          row.target_name || '',
          row.era || '',
          row.category || '',
          row.ai_reason || '',
          row.status || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'failed_attempts':
        headers = ['ID', 'IPアドレス', 'アクションキー', '失敗回数', '最終試行日時'];
        mappingFn = (row: any) => [
          row.id,
          row.ip || '',
          row.action_key || '',
          row.attempt_count || 0,
          row.last_attempt ? new Date(row.last_attempt).toLocaleString() : ''
        ];
        break;
      default:
        return;
    }

    convertToCsvAndDownload(filename, headers, rawData, mappingFn);
  };

  const handleLoadPreviewAndShow = async (timeframe: string = '7d') => {
    setPreviewTimeframe(timeframe);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/export/audit-bundle?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('監査データの取得に失敗しました。');
      }
      const data = await res.json();
      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (err: any) {
      alert(err.message || '読み込みに失敗しました。');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExportStats = async () => {
    try {
      const res = await fetch('/api/admin/export/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `remeet-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDbHealthCheck = async () => {
    try {
      const res = await fetch('/api/admin/db-health', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const health = await res.json();
        if (setDbHealth) setDbHealth(health);
        alert('データベース健康診断が完了しました。');
      }
    } catch (err) {
      console.error(err);
      alert('診断に失敗しました。');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('すべてのデータを初期化し、すべての答えが異なる情緒豊かなサンプルデータ（50件）を再生成します。よろしいですか？')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/reset-data', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        alert('データをリセットし、新しいサンプルデータを生成しました。');
        fetchData();
      } else {
        alert('リセットに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

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
        alert('AI検知用の検証サンプルデータ（個人情報/NGワード検出、脅迫表現、商用スパムを含む3件）を混入させました。AI検知キューからご確認いただけます。');
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'サンプルの作成に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleDeleteBroadcast = async (broadcast: any) => {
    showConfirm('通知の削除', 'この一括配信通知を削除しますか？（全ユーザーの通知一覧から消去されます）', async () => {
      try {
        const response = await fetch('/api/admin/broadcasts', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: broadcast.content,
            created_at: broadcast.created_at
          })
        });
        if (response.ok) {
          fetchData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleSendBulkNotification = async (content: string, link: string) => {
    if (!token) {
      setStatusMsg({ text: '認証エラーが発生しました。再ログインしてください。', type: 'error' });
      return;
    }
    
    if (link && !link.startsWith('http')) {
      setStatusMsg({ text: 'URLは http:// または https:// から開始してください', type: 'error' });
      return;
    }

    setPendingNotification({ content, link });
    setShowBulkConfirm(true);
  };

  const executeBulkNotification = async () => {
    if (!pendingNotification || !token) return;

    setIsSending(true);
    setStatusMsg(null);
    setShowBulkConfirm(false);
    
    try {
      const response = await fetch('/api/admin/bulk-notification', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pendingNotification)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatusMsg({ text: `通知を送信しました (${data.count}名)`, type: 'success' });
        fetchData();
        setPendingNotification(null);
        setTimeout(() => setStatusMsg(null), 5000);
      } else {
        setStatusMsg({ text: data.error || '送信に失敗しました', type: 'error' });
      }
    } catch (err) {
      console.error("Bulk notification error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。サーバーの状態を確認してください。', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  return {
    auditLogs,
    setAuditLogs,
    reunionFunnel,
    setReunionFunnel,
    reunionDurationStats,
    setReunionDurationStats,
    isExporting,
    setIsExporting,
    showPreviewModal,
    setShowPreviewModal,
    previewData,
    setPreviewData,
    previewLoading,
    setPreviewLoading,
    previewTab,
    setPreviewTab,
    previewSearch,
    setPreviewSearch,
    previewTimeframe,
    setPreviewTimeframe,
    isSending,
    setIsSending,
    showBulkConfirm,
    setShowBulkConfirm,
    pendingNotification,
    setPendingNotification,
    handleUnblockIp,
    handleBlockIp,
    handleExportAuditBundle,
    handleExportTableCsv,
    handleLoadPreviewAndShow,
    handleExportStats,
    handleDbHealthCheck,
    handleResetData,
    handleSeedModeration,
    handleDeleteBroadcast,
    handleSendBulkNotification,
    executeBulkNotification
  };
};
