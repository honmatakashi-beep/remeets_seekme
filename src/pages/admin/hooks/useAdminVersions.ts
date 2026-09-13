import { useState } from "react";

export interface UseAdminVersionsProps {
  token: string | null;
  fetchData: () => Promise<void>;
  setStatusMsg: (msg: any) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void | Promise<void>) => void;
}

export const useAdminVersions = ({
  token,
  fetchData,
  setStatusMsg,
  showConfirm
}: UseAdminVersionsProps) => {
  // DB Versions States
  const [dbVersions, setDbVersions] = useState<any[]>([]);
  const [gitInfo, setGitInfo] = useState<{
    commitHash: string;
    commitMessage: string;
    branch: string;
    author: string;
    date: string;
    shortHash: string;
  } | null>(null);
  const [isLoadingGitInfo, setIsLoadingGitInfo] = useState<boolean>(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionComment, setNewVersionComment] = useState('');
  const [selectedVersionIds, setSelectedVersionIds] = useState<number[]>([]);
  const [versionSearchQuery, setVersionSearchQuery] = useState<string>('');
  const [versionTypeFilter, setVersionTypeFilter] = useState<'all' | 'manual' | 'pre_restore' | 'auto'>('all');
  const [versionCurrentPage, setVersionCurrentPage] = useState<number>(1);
  const [versionItemsPerPage, setVersionItemsPerPage] = useState<number>(25);
  const [isBatchDeletingVersions, setIsBatchDeletingVersions] = useState<boolean>(false);

  // Censorship Test & Simulation
  const [censorshipTestText, setCensorshipTestText] = useState<string>('');
  const [censorshipTestResult, setCensorshipTestResult] = useState<any>(null);
  const [isTestingCensorship, setIsTestingCensorship] = useState<boolean>(false);
  const [simulatedPostId, setSimulatedPostId] = useState<number | null>(null);
  const [isSimulatingPost, setIsSimulatingPost] = useState<boolean>(false);
  const [simulationSuccessMsg, setSimulationSuccessMsg] = useState<string | null>(null);

  // Police Report States
  const [policeReportData, setPoliceReportData] = useState<any>(null);
  const [isGeneratingPoliceReport, setIsGeneratingPoliceReport] = useState<boolean>(false);
  const [copiedPoliceReport, setCopiedPoliceReport] = useState<boolean>(false);

  const handleGeneratePoliceReport = async (userId: number) => {
    if (!token) return;
    setIsGeneratingPoliceReport(true);
    setPoliceReportData(null);
    try {
      const res = await fetch(`/api/admin/police/investigation-report/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPoliceReportData(data);
        setStatusMsg({ type: 'success', text: `🚔 警察提出用捜査レポート(User ID: ${userId})を生成しました。` });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMsg({ type: 'error', text: err.error || 'レポート生成に失敗しました。' });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setIsGeneratingPoliceReport(false);
    }
  };

  const handleCopyPoliceReportText = () => {
    if (!policeReportData) return;
    const text = typeof policeReportData === 'string' ? policeReportData : JSON.stringify(policeReportData, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedPoliceReport(true);
    setStatusMsg({ type: 'success', text: '📋 クリップボードに警察提出用レポートをコピーしました。' });
    setTimeout(() => {
      setCopiedPoliceReport(false);
      setStatusMsg(null);
    }, 3000);
  };

  const handleDownloadPoliceReportJson = () => {
    if (!policeReportData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(policeReportData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `POLICE_REPORT_USER_${policeReportData.profile?.userId || 'TARGET'}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleTestCensorship = async (textToTest?: string) => {
    const text = textToTest || censorshipTestText;
    if (!text || !text.trim()) {
      setStatusMsg({ type: 'error', text: 'テストするテキストを入力してください。' });
      return;
    }
    setIsTestingCensorship(true);
    setCensorshipTestResult(null);
    try {
      const res = await fetch('/api/admin/test-censorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        setCensorshipTestResult(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMsg({ type: 'error', text: err.error || '検閲テストに失敗しました。' });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: '検閲テスト中に通信エラーが発生しました。' });
    } finally {
      setIsTestingCensorship(false);
    }
  };

  const handleTriggerCensorshipSimulation = async () => {
    setIsSimulatingPost(true);
    setSimulationSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/simulate-censorship-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSimulatedPostId(data.postId);
        setSimulationSuccessMsg(`🚨 違反疑い手紙(ID: #${data.postId})を自動隔離シミュレーションしました！直ちにモデレーションタブまたは通報一覧に自動隔離反映されています。`);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMsg({ type: 'error', text: err.error || 'シミュレーションに失敗しました。' });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: 'シミュレーション中に通信エラーが発生しました。' });
    } finally {
      setIsSimulatingPost(false);
    }
  };

  const fetchGitInfo = async () => {
    if (!token) return;
    setIsLoadingGitInfo(true);
    try {
      const res = await fetch('/api/admin/git-info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGitInfo(data);
      }
    } catch (err) {
      console.error("Git Info fetch error:", err);
    } finally {
      setIsLoadingGitInfo(false);
    }
  };

  const fetchDbVersions = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/versions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbVersions(data);
      }
    } catch (err) {
      console.error("DB Versions fetch error:", err);
    }
  };

  const handleCreateVersion = async () => {
    if (!token) return;
    if (!newVersionComment.trim()) {
      setStatusMsg({ type: 'error', text: 'バージョンの説明・コメントを入力してください。' });
      return;
    }
    setIsCreatingVersion(true);
    try {
      const res = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newVersionComment.trim() })
      });
      if (res.ok) {
        const newVer = await res.json();
        setDbVersions(prev => [newVer, ...prev]);
        setNewVersionComment('');
        setStatusMsg({ type: 'success', text: `✨ 新しいバージョン「${newVer.comment}」を安全に保存しました！` });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        const err = await res.json();
        setStatusMsg({ type: 'error', text: err.error || 'バージョンの保存に失敗しました。' });
      }
    } catch (err) {
      console.error("Create version error:", err);
      setStatusMsg({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleRestoreVersion = (version: any) => {
    showConfirm(
      '⚠️ データベースの自動復元 (ロールバック)',
      `データベースを "${version.comment}" (作成日時: ${new Date(version.timestamp).toLocaleString('ja-JP')}) の状態に復元しますか？\n\n【安心設計】復元実行直前の現在の最新DBは「復元前自動バックアップ」として自動退避保存されます。\n\nよろしければ「確定」をクリックしてください。`,
      async () => {
        try {
          const res = await fetch(`/api/admin/versions/${version.id}/restore`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setStatusMsg({ type: 'success', text: `バージョン "${version.comment}" から正常に自動復元しました！データ再読込のため自動で最新情報をロードします。` });
            setTimeout(() => setStatusMsg(null), 6000);
            fetchData();
          } else {
            const errData = await res.json();
            setStatusMsg({ type: 'error', text: `復元失敗: ${errData.error || '不明なエラー'}` });
            setTimeout(() => setStatusMsg(null), 6000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: '通信エラーにより復元に失敗しました。' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    );
  };

  const handleDeleteVersion = (version: any) => {
    showConfirm(
      'バージョン履歴の削除',
      `バージョン履歴 "${version.comment}" を削除しますか？バックアップファイル自体が削除されます。よろしければ「確定」をクリックしてください。`,
      async () => {
        try {
          const res = await fetch(`/api/admin/versions/${version.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setDbVersions(prev => prev.filter(v => v.id !== version.id));
            setSelectedVersionIds(prev => prev.filter(id => id !== version.id));
            setStatusMsg({ type: 'success', text: 'バージョン履歴を削除しました。' });
            setTimeout(() => setStatusMsg(null), 4000);
          } else {
            setStatusMsg({ type: 'error', text: '削除に失敗しました。' });
            setTimeout(() => setStatusMsg(null), 4000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: '通信エラーにより削除に失敗しました。' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    );
  };

  const handleDownloadVersion = async (version: any) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/versions/${version.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeComment = (version.comment || 'snapshot').replace(/[^a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, '_');
        link.download = `remeets_backup_v${version.id}_${safeComment}.db`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setStatusMsg({ type: 'success', text: `📦 バックアップファイル「${version.comment}」をダウンロードしました。` });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ type: 'error', text: 'ダウンロードに失敗しました。' });
      }
    } catch (err) {
      console.error("Download version error:", err);
      setStatusMsg({ type: 'error', text: '通信エラーが発生しました。' });
    }
  };

  const handleToggleSelectAllVersions = (currentIds: number[]) => {
    if (selectedVersionIds.length === currentIds.length && currentIds.length > 0) {
      setSelectedVersionIds([]);
    } else {
      setSelectedVersionIds(currentIds);
    }
  };

  const handleToggleSelectVersion = (id: number) => {
    setSelectedVersionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDeleteVersions = async () => {
    if (!token || selectedVersionIds.length === 0) return;
    if (!confirm(`⚠️ 警告: 選択した ${selectedVersionIds.length} 件のスナップショットを完全に削除しますか？バックアップファイルも削除され、元に戻せません。`)) return;

    setIsBatchDeletingVersions(true);
    try {
      const res = await fetch('/api/admin/versions/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedVersionIds })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMsg({ type: 'success', text: `🗑️ ${data.message || '一括削除が完了しました。'}` });
        setDbVersions(prev => prev.filter(v => !selectedVersionIds.includes(v.id)));
        setSelectedVersionIds([]);
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatusMsg({ type: 'error', text: errData.error || '一括削除に失敗しました。' });
      }
    } catch (err) {
      console.error("Batch delete versions error:", err);
      setStatusMsg({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setIsBatchDeletingVersions(false);
    }
  };

  const handleExportVersionsCsv = () => {
    if (!dbVersions || dbVersions.length === 0) {
      alert('エクスポートするバージョン履歴データがありません。');
      return;
    }

    const headers = ['ID', 'バージョン番号', 'コメント', '種別', '連動Gitコミット', 'Gitブランチ', 'ファイルサイズ(Byte)', 'ファイルサイズ(MB)', '作成日時', 'ファイル名'];
    const rows = dbVersions.map((v, index) => {
      const isPreRestore = (v.comment || '').includes('復元前自動バックアップ');
      const mbSize = v.size ? (v.size / (1024 * 1024)).toFixed(3) : '0';
      return [
        v.id,
        `"#${dbVersions.length - index}"`,
        `"${(v.comment || '').replace(/"/g, '""')}"`,
        isPreRestore ? '復元前自動退避' : '手動スナップショット',
        `"${v.git_commit || '-'}"`,
        `"${v.git_branch || '-'}"`,
        v.size || 0,
        mbSize,
        `"${new Date(v.timestamp).toLocaleString('ja-JP').replace(/"/g, '""')}"`,
        `"${(v.filename || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remeets_versions_history_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    dbVersions,
    setDbVersions,
    gitInfo,
    setGitInfo,
    isLoadingGitInfo,
    setIsLoadingGitInfo,
    isCreatingVersion,
    setIsCreatingVersion,
    newVersionComment,
    setNewVersionComment,
    selectedVersionIds,
    setSelectedVersionIds,
    versionSearchQuery,
    setVersionSearchQuery,
    versionTypeFilter,
    setVersionTypeFilter,
    versionCurrentPage,
    setVersionCurrentPage,
    versionItemsPerPage,
    setVersionItemsPerPage,
    isBatchDeletingVersions,
    setIsBatchDeletingVersions,
    censorshipTestText,
    setCensorshipTestText,
    censorshipTestResult,
    setCensorshipTestResult,
    isTestingCensorship,
    setIsTestingCensorship,
    simulatedPostId,
    setSimulatedPostId,
    isSimulatingPost,
    setIsSimulatingPost,
    simulationSuccessMsg,
    setSimulationSuccessMsg,
    policeReportData,
    setPoliceReportData,
    isGeneratingPoliceReport,
    setIsGeneratingPoliceReport,
    copiedPoliceReport,
    setCopiedPoliceReport,
    handleGeneratePoliceReport,
    handleCopyPoliceReportText,
    handleDownloadPoliceReportJson,
    handleTestCensorship,
    handleTriggerCensorshipSimulation,
    fetchGitInfo,
    fetchDbVersions,
    handleCreateVersion,
    handleRestoreVersion,
    handleDeleteVersion,
    handleDownloadVersion,
    handleToggleSelectAllVersions,
    handleToggleSelectVersion,
    handleBatchDeleteVersions,
    handleExportVersionsCsv
  };
};
