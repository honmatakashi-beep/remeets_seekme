import { useState } from "react";

export interface UseAdminPostsProps {
  token: string | null;
  posts: any[];
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
  setModerationQueue?: React.Dispatch<React.SetStateAction<any[]>>;
  setDeletedPostsArchive?: React.Dispatch<React.SetStateAction<any[]>>;
  fetchData: () => Promise<void>;
  setStatusMsg?: (msg: any) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void | Promise<void>) => void;
}

export const useAdminPosts = ({
  token,
  posts,
  setPosts,
  setModerationQueue,
  setDeletedPostsArchive,
  fetchData,
  setStatusMsg,
  showConfirm
}: UseAdminPostsProps) => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postSearchTerm, setPostSearchTerm] = useState('');
  const [postFilterType, setPostFilterType] = useState<'all' | 'active' | 'resolved' | 'sample' | 'real' | 'ai_passed' | 'ai_flagged'>('all');
  const [postSortBy, setPostSortBy] = useState<'created_desc' | 'created_asc' | 'reports_desc' | 'views_desc'>('created_desc');
  const [postItemsPerPage, setPostItemsPerPage] = useState<number>(30);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [isBatchUpdatingPostStatus, setIsBatchUpdatingPostStatus] = useState(false);
  const [isBatchAiAnalyzing, setIsBatchAiAnalyzing] = useState(false);
  const [isGeneratingSamplePosts, setIsGeneratingSamplePosts] = useState(false);
  const [isBatchDeletingPosts, setIsBatchDeletingPosts] = useState(false);
  const [postPage, setPostPage] = useState(1);

  // Single Post Delete Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteReasonText, setDeleteReasonText] = useState<string>('規約違反またはAIフラグ検出による削除');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleGenerateSamplePosts = async (count: number = 50) => {
    if (!window.confirm(`実在感のある高品質な想い出のボトルメール（全世代・全地域対応）を ${count} 件、即座に一括生成しますか？`)) {
      return;
    }

    setIsGeneratingSamplePosts(true);
    try {
      const res = await fetch('/api/admin/generate-samples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ count })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || `サンプルボトルメールを ${count} 件正常に生成しました。`);
        fetchData();
      } else {
        alert(data.error || 'サンプル生成に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsGeneratingSamplePosts(false);
    }
  };

  const handleReseedUniquePosts = async (count: number = 200) => {
    if (!window.confirm(`全世代・全国47都道府県・多彩な関係性の「絶対に被らない完全重複なしサンプルボトルメール」を ${count} 件一括生成・補給しますか？\n（既存のサンプルはそのまま維持され、新しいバリエーションが追加されます）`)) {
      return;
    }

    setIsGeneratingSamplePosts(true);
    try {
      const res = await fetch('/api/admin/reseed-unique-samples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ count })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || `${count} 件の完全重複なしサンプルボトルメールを生成・追加しました。`);
        fetchData();
      } else {
        alert(data.error || '完全重複なしサンプルの生成に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsGeneratingSamplePosts(false);
    }
  };

  const handleBatchDeletePosts = async () => {
    if (selectedPostIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedPostIds.length} 件のボトルメールを完全に削除しますか？\n（関連するメッセージや通知も削除されます）`)) {
      return;
    }

    setIsBatchDeletingPosts(true);
    try {
      const res = await fetch('/api/admin/posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedPostIds })
      });

      if (res.ok) {
        alert(`${selectedPostIds.length} 件のボトルメールを一括削除しました。`);
        setSelectedPostIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括削除に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingPosts(false);
    }
  };

  const handleBatchUpdatePostStatus = async (newStatus: 'active' | 'resolved') => {
    if (selectedPostIds.length === 0) return;
    const statusLabel = newStatus === 'resolved' ? '再会成立（解決済）' : '公開捜索中（active）';
    if (!window.confirm(`選択した ${selectedPostIds.length} 件のボトルメールのステータスを一括で「${statusLabel}」に変更しますか？`)) {
      return;
    }

    setIsBatchUpdatingPostStatus(true);
    try {
      const res = await fetch('/api/admin/posts/batch-update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedPostIds, status: newStatus })
      });

      if (res.ok) {
        alert(`${selectedPostIds.length} 件のステータスを一括更新しました。`);
        setSelectedPostIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchUpdatingPostStatus(false);
    }
  };

  const handleBatchAiAnalyzePosts = async () => {
    if (selectedPostIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedPostIds.length} 件のボトルメールに対して、最新のGemini AI安全診断を一括実行しますか？`)) {
      return;
    }

    setIsBatchAiAnalyzing(true);
    try {
      const res = await fetch('/api/admin/posts/batch-ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedPostIds })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`一括AI診断が完了しました。\n診断済: ${data.analyzed_count}件\n要警戒フラグ検知: ${data.flagged_count}件`);
        setSelectedPostIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括AI診断に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchAiAnalyzing(false);
    }
  };

  const handleTogglePostStatus = async (postId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'resolved' ? 'active' : 'resolved';
    try {
      const res = await fetch(`/api/admin/posts/${postId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus, is_resolved: newStatus === 'resolved' ? 1 : 0 } : p));
      } else {
        alert('ステータスの更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleExportPostsCSV = () => {
    const filtered = posts.filter(p => {
      const isSample = p.is_sample === 1 || p.user_is_sample === 1;
      if (postFilterType === 'sample' && !isSample) return false;
      if (postFilterType === 'real' && isSample) return false;
      if (postFilterType === 'active' && p.status === 'resolved') return false;
      if (postFilterType === 'resolved' && p.status !== 'resolved') return false;
      if (postFilterType === 'ai_passed' && (!p.ai_diagnosed || p.ai_flagged)) return false;
      if (postFilterType === 'ai_flagged' && !p.ai_flagged) return false;

      if (!postSearchTerm) return true;
      const term = postSearchTerm.toLowerCase();
      return (
        (p.target_name && p.target_name.toLowerCase().includes(term)) ||
        (p.searcher_name && p.searcher_name.toLowerCase().includes(term)) ||
        (p.searcher_username && p.searcher_username.toLowerCase().includes(term)) ||
        (p.searcher_nickname && p.searcher_nickname.toLowerCase().includes(term)) ||
        (p.searcher_full_name && p.searcher_full_name.toLowerCase().includes(term)) ||
        (p.target_school && p.target_school.toLowerCase().includes(term)) ||
        (p.target_hometown && p.target_hometown.toLowerCase().includes(term)) ||
        (p.era && p.era.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.message && p.message.toLowerCase().includes(term)) ||
        (p.secret_question && p.secret_question.toLowerCase().includes(term)) ||
        String(p.id).includes(term)
      );
    });

    if (filtered.length === 0) {
      alert('エクスポート対象のボトルメールが存在しません。');
      return;
    }

    const headers = ['メッセージID', '種別', '対象者名', '差出人名', '差出人ユーザー名', '差出人本名', '対象者出身・地域', '学校・所属', '年代', 'カテゴリ', '想い出メッセージ', '秘密の質問', '回答', 'AI診断状況', 'AI警告フラグ', 'ステータス', '投函日時'];
    const rows = filtered.map(p => {
      const isSample = p.is_sample === 1 || p.user_is_sample === 1;
      return [
        p.id,
        isSample ? 'サンプル' : '本番',
        `"${(p.target_name || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_name || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_username || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_full_name || '').replace(/"/g, '""')}"`,
        `"${(p.target_hometown || '').replace(/"/g, '""')}"`,
        `"${(p.target_school || '').replace(/"/g, '""')}"`,
        `"${(p.era || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.message || '').replace(/"/g, '""')}"`,
        `"${(p.secret_question || '').replace(/"/g, '""')}"`,
        `"${(p.secret_answer_plain || p.secret_answer || '').replace(/"/g, '""')}"`,
        p.ai_diagnosed ? '診断済' : '未診断',
        p.ai_flagged ? '要警戒' : '健全',
        p.status === 'resolved' ? '再会成立' : '捜索中',
        p.created_at || ''
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_bottles_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPost = async (post: any) => {
    try {
      const postRes = await fetch(`/api/admin/posts/${post.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (postRes.ok) {
        const postData = await postRes.json();
        setSelectedPost(postData);
      } else {
        setSelectedPost(post);
      }
    } catch (err) {
      console.error(err);
      setSelectedPost(post);
    }
  };

  const triggerDeletePost = (id: number) => {
    setDeleteTargetId(id);
    setDeleteReasonText('規約違反またはAIフラグ検出による削除');
    setIsDeleteModalOpen(true);
  };

  const handleDeletePost = async (id: number, customReason?: string) => {
    const finalReason = (customReason || deleteReasonText).trim() || '規約違反またはAIフラグ検出による削除';
    setIsDeleteModalOpen(false);

    showConfirm('ボトルメールの削除', `理由「${finalReason}」でこのボトルメールを削除してもよろしいですか？`, async () => {
      try {
        const res = await fetch(`/api/admin/posts/${id}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ reason: finalReason })
        });
        
        if (res.ok) {
          setPosts(prev => prev.filter(p => p.id !== id));
          if (setModerationQueue) setModerationQueue(prev => prev.filter(p => p.id !== id));
          const deletedArchiveRes = await fetch('/api/admin/deleted-posts-archive', { headers: { 'Authorization': `Bearer ${token}` } });
          if (deletedArchiveRes.ok && setDeletedPostsArchive) setDeletedPostsArchive(await deletedArchiveRes.json());
          setSelectedPost(null);
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        } else {
          const errorData = await res.json().catch(() => ({}));
          alert(`削除に失敗しました (${res.status}): ${errorData.error || '不明なエラー'}`);
        }
      } catch (err) {
        console.error('Error in handleDeletePost:', err);
        alert('通信エラーが発生しました。');
      }
    });
  };

  return {
    selectedPost,
    setSelectedPost,
    postSearchTerm,
    setPostSearchTerm,
    postFilterType,
    setPostFilterType,
    postSortBy,
    setPostSortBy,
    postItemsPerPage,
    setPostItemsPerPage,
    selectedPostIds,
    setSelectedPostIds,
    isBatchUpdatingPostStatus,
    setIsBatchUpdatingPostStatus,
    isBatchAiAnalyzing,
    setIsBatchAiAnalyzing,
    isGeneratingSamplePosts,
    setIsGeneratingSamplePosts,
    isBatchDeletingPosts,
    setIsBatchDeletingPosts,
    postPage,
    setPostPage,
    deleteTargetId,
    setDeleteTargetId,
    deleteReasonText,
    setDeleteReasonText,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleGenerateSamplePosts,
    handleReseedUniquePosts,
    handleBatchDeletePosts,
    handleBatchUpdatePostStatus,
    handleBatchAiAnalyzePosts,
    handleTogglePostStatus,
    handleExportPostsCSV,
    handleViewPost,
    triggerDeletePost,
    handleDeletePost
  };
};
