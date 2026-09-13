import { useState } from "react";

export interface UseAdminModerationProps {
  token: string | null;
  fetchData: () => Promise<void>;
  setStatusMsg: (msg: any) => void;
  posts: any[];
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAdminModeration = ({
  token,
  fetchData,
  setStatusMsg,
  posts,
  setPosts,
  setLoading
}: UseAdminModerationProps) => {
  // Moderation Queue & Archive States
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [deletedPostsArchive, setDeletedPostsArchive] = useState<any[]>([]);
  const [modSearchTerm, setModSearchTerm] = useState('');
  const [modPage, setModPage] = useState(1);
  const [modPerPage, setModPerPage] = useState<number>(20);
  const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
  const [archivePage, setArchivePage] = useState(1);
  const [archivePerPage, setArchivePerPage] = useState<number>(20);
  const [selectedModPostModal, setSelectedModPostModal] = useState<any>(null);
  const [isBatchApprovingModPosts, setIsBatchApprovingModPosts] = useState(false);
  const [selectedModPostIds, setSelectedModPostIds] = useState<number[]>([]);
  const [selectedArchiveIds, setSelectedArchiveIds] = useState<number[]>([]);
  const [isBatchDeletingModPosts, setIsBatchDeletingModPosts] = useState(false);
  const [isBatchDeletingArchive, setIsBatchDeletingArchive] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<number | null>(null);

  // Deletion Requests States
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [selectedDeletionRequest, setSelectedDeletionRequest] = useState<any>(null);
  const [deletionSearchTerm, setDeletionSearchTerm] = useState('');
  const [deletionStatusFilter, setDeletionStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [deletionPage, setDeletionPage] = useState(1);
  const [deletionPerPage, setDeletionPerPage] = useState(15);
  const [selectedDeletionIds, setSelectedDeletionIds] = useState<number[]>([]);
  const [isBatchUpdatingDeletion, setIsBatchUpdatingDeletion] = useState(false);

  // Reports States
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [reportPage, setReportPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(15);
  const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
  const [isBatchUpdatingReports, setIsBatchUpdatingReports] = useState(false);

  // NG Words States
  const [ngWords, setNgWords] = useState<any[]>([]);
  const [newNgWord, setNewNgWord] = useState('');
  const [ngWordCategory, setNgWordCategory] = useState('violence');
  const [ngWordSeverity, setNgWordSeverity] = useState<'block' | 'warn' | 'review'>('block');
  const [bulkNgWordsText, setBulkNgWordsText] = useState('');
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [selectedNgWordIds, setSelectedNgWordIds] = useState<number[]>([]);
  const [isBatchUpdatingNgWords, setIsBatchUpdatingNgWords] = useState(false);

  // Success Stories States
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [newStoryForm, setNewStoryForm] = useState({
    title: '',
    message: '',
    era: '',
    gender: '男性',
    category: 'classmate',
    consent: true,
    is_public: true,
    is_featured: false,
    is_all_page: true,
    display_position: ''
  });

  const handleApproveModPost = async (postId: number) => {
    try {
      const res = await fetch(`/api/admin/moderation/approve/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setModerationQueue(prev => prev.filter(p => p.id !== postId));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, ai_flagged: 0, ai_flag_reason: null } : p));
        setSelectedModPostModal(null);
        setStatusMsg({ text: 'ボトルメールの隔離を解除し、承認（健全公開）しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || '承認に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleBatchApproveModPosts = async () => {
    if (selectedModPostIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedModPostIds.length} 件のボトルメールを一括承認（隔離解除・公開）しますか？`)) {
      return;
    }

    setIsBatchApprovingModPosts(true);
    try {
      const res = await fetch('/api/admin/moderation/batch-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedModPostIds })
      });

      if (res.ok) {
        setStatusMsg({ text: `${selectedModPostIds.length} 件のボトルメールを一括承認しました。`, type: 'success' });
        setSelectedModPostIds([]);
        setTimeout(() => setStatusMsg(null), 3000);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括承認に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchApprovingModPosts(false);
    }
  };

  const handleBatchDeleteModPosts = async () => {
    if (selectedModPostIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedModPostIds.length} 件のボトルメールを物理削除（完全消去）しますか？\n（復元できません）`)) {
      return;
    }

    setIsBatchDeletingModPosts(true);
    try {
      const res = await fetch('/api/admin/posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedModPostIds, reason: 'モデレーションによる完全削除' })
      });

      if (res.ok) {
        setStatusMsg({ text: `${selectedModPostIds.length} 件のボトルメールを一括削除しました。`, type: 'success' });
        setSelectedModPostIds([]);
        setTimeout(() => setStatusMsg(null), 3000);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括削除に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingModPosts(false);
    }
  };

  const handleBatchDeleteArchive = async () => {
    if (selectedArchiveIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedArchiveIds.length} 件の削除履歴アーカイブを完全にデータベースから消去しますか？\n（この操作は元に戻せません）`)) {
      return;
    }

    setIsBatchDeletingArchive(true);
    try {
      const res = await fetch('/api/admin/deleted-posts-archive/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedArchiveIds })
      });

      if (res.ok) {
        setStatusMsg({ text: `${selectedArchiveIds.length} 件の削除履歴を完全に消去しました。`, type: 'success' });
        setSelectedArchiveIds([]);
        setTimeout(() => setStatusMsg(null), 3000);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括消去に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingArchive(false);
    }
  };

  const handleApproveDeletionRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/deletion-requests/${id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      if (res.ok) {
        setDeletionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '承認に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectDeletionRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/deletion-requests/${id}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      if (res.ok) {
        setDeletionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      } else {
        const data = await res.json();
        alert(data.error || '却下に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchApproveDeletion = async () => {
    if (selectedDeletionIds.length === 0) return;
    if (!confirm(`選択した ${selectedDeletionIds.length} 件の削除申請を一括承認し、対象のボトルメールを安全に削除しますか？`)) return;
    setIsBatchUpdatingDeletion(true);
    try {
      const res = await fetch('/api/admin/deletion-requests/batch-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedDeletionIds })
      });
      if (res.ok) {
        setSelectedDeletionIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括承認に失敗しました');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingDeletion(false);
    }
  };

  const handleBatchRejectDeletion = async () => {
    if (selectedDeletionIds.length === 0) return;
    if (!confirm(`選択した ${selectedDeletionIds.length} 件の削除申請を一括却下しますか？`)) return;
    setIsBatchUpdatingDeletion(true);
    try {
      const res = await fetch('/api/admin/deletion-requests/batch-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedDeletionIds })
      });
      if (res.ok) {
        setSelectedDeletionIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括却下に失敗しました');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingDeletion(false);
    }
  };

  const handleResolveReport = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
      } else {
        const data = await res.json();
        alert(data.error || '対応完了への更新に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissReport = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}/dismiss`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
      } else {
        const data = await res.json();
        alert(data.error || '却下への更新に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchResolveReports = async () => {
    if (selectedReportIds.length === 0) return;
    if (!confirm(`選択した ${selectedReportIds.length} 件の通報を一括で「対応完了」にしますか？`)) return;
    setIsBatchUpdatingReports(true);
    try {
      const res = await fetch('/api/admin/reports/batch-resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedReportIds })
      });
      if (res.ok) {
        setSelectedReportIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括更新に失敗しました');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingReports(false);
    }
  };

  const handleBatchDismissReports = async () => {
    if (selectedReportIds.length === 0) return;
    if (!confirm(`選択した ${selectedReportIds.length} 件の通報を一括で「却下（問題なし）」にしますか？`)) return;
    setIsBatchUpdatingReports(true);
    try {
      const res = await fetch('/api/admin/reports/batch-dismiss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedReportIds })
      });
      if (res.ok) {
        setSelectedReportIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括更新に失敗しました');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingReports(false);
    }
  };

  const handleAiAnalyze = async (postId: number) => {
    setIsAiAnalyzing(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}/ai-analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModerationQueue(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              ai_diagnosed: 1,
              ai_flagged: data.ai_flagged ? 1 : 0,
              ai_flag_reason: data.ai_flag_reason,
              ai_confidence: data.ai_confidence,
              ai_safety_details: data.ai_safety_details
            };
          }
          return p;
        }));
        if (selectedModPostModal && selectedModPostModal.id === postId) {
          setSelectedModPostModal((prev: any) => ({
            ...prev,
            ai_diagnosed: 1,
            ai_flagged: data.ai_flagged ? 1 : 0,
            ai_flag_reason: data.ai_flag_reason,
            ai_confidence: data.ai_confidence,
            ai_safety_details: data.ai_safety_details
          }));
        }
        alert(data.ai_flagged ? `⚠️ AI警戒判定: ${data.ai_flag_reason}` : '✅ AI診断完了: 安全な想い出の手紙です。');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'AI診断に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsAiAnalyzing(null);
    }
  };

  const handleAddNgWord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNgWord.trim()) return;
    try {
      const res = await fetch('/api/admin/ng-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          word: newNgWord.trim(),
          category: ngWordCategory,
          severity: ngWordSeverity
        })
      });
      if (res.ok) {
        const added = await res.json();
        setNgWords(prev => [added, ...prev]);
        setNewNgWord('');
      } else {
        const data = await res.json();
        alert(data.error || '追加に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchAddNgWords = async () => {
    const lines = bulkNgWordsText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setIsBatchUpdatingNgWords(true);
    try {
      const res = await fetch('/api/admin/ng-words/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ words: lines })
      });
      if (res.ok) {
        const wordsRes = await fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } });
        if (wordsRes.ok) {
          setNgWords(await wordsRes.json());
        }
        setBulkNgWordsText('');
        setIsBulkAddModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || '一括追加に失敗しました');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingNgWords(false);
    }
  };

  const handleDeleteNgWord = async (id: number) => {
    if (!confirm('このNGワードを削除してもよろしいですか？')) return;
    try {
      const res = await fetch(`/api/admin/ng-words/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNgWords(prev => prev.filter(w => w.id !== id));
        setSelectedNgWordIds(prev => prev.filter(selectedId => selectedId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchDeleteNgWords = async () => {
    if (selectedNgWordIds.length === 0) return;
    if (!confirm(`選択した ${selectedNgWordIds.length} 件のNGワードを一括削除しますか？`)) return;
    setIsBatchUpdatingNgWords(true);
    try {
      const res = await fetch('/api/admin/ng-words/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedNgWordIds })
      });
      if (res.ok) {
        setNgWords(prev => prev.filter(w => !selectedNgWordIds.includes(w.id)));
        setSelectedNgWordIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchUpdatingNgWords(false);
    }
  };

  const handleUpdateSuccessStory = async (
    id: number, 
    is_public: boolean, 
    is_featured: boolean, 
    is_all_page: boolean, 
    display_position: string | null,
    message?: string,
    era?: string,
    gender?: string,
    title?: string,
    category?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          is_public, 
          is_featured, 
          is_all_page, 
          display_position,
          message,
          era,
          gender,
          title,
          category
        })
      });
      if (res.ok) {
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
        setEditingStoryId(null);
        setStatusMsg({ text: '幸せな再会の物語を更新しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: '更新に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleCreateSuccessStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryForm.message) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/success-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStoryForm)
      });
      if (res.ok) {
        setStatusMsg({ text: '幸せな再会の物語を新規追加しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
        setIsCreatingStory(false);
        setNewStoryForm({
          title: '',
          message: '',
          era: '',
          gender: '男性',
          category: 'classmate',
          consent: true,
          is_public: true,
          is_featured: false,
          is_all_page: true,
          display_position: ''
        });
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
      } else {
        setStatusMsg({ text: '物語の追加に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccessStory = async (id: number) => {
    if (!window.confirm('この幸せな再会の物語を完全に削除しますか？')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSuccessStories(successStories.filter(s => s.id !== id));
        setStatusMsg({ text: '幸せな再会の物語を削除しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: '削除に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSuccessStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seed-success-stories', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
      }
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    moderationQueue,
    setModerationQueue,
    deletedPostsArchive,
    setDeletedPostsArchive,
    modSearchTerm,
    setModSearchTerm,
    modPage,
    setModPage,
    modPerPage,
    setModPerPage,
    archiveSearchTerm,
    setArchiveSearchTerm,
    archivePage,
    setArchivePage,
    archivePerPage,
    setArchivePerPage,
    selectedModPostModal,
    setSelectedModPostModal,
    isBatchApprovingModPosts,
    setIsBatchApprovingModPosts,
    selectedModPostIds,
    setSelectedModPostIds,
    selectedArchiveIds,
    setSelectedArchiveIds,
    isBatchDeletingModPosts,
    setIsBatchDeletingModPosts,
    isBatchDeletingArchive,
    setIsBatchDeletingArchive,
    isAiAnalyzing,
    setIsAiAnalyzing,
    deletionRequests,
    setDeletionRequests,
    selectedDeletionRequest,
    setSelectedDeletionRequest,
    deletionSearchTerm,
    setDeletionSearchTerm,
    deletionStatusFilter,
    setDeletionStatusFilter,
    deletionPage,
    setDeletionPage,
    deletionPerPage,
    setDeletionPerPage,
    selectedDeletionIds,
    setSelectedDeletionIds,
    isBatchUpdatingDeletion,
    setIsBatchUpdatingDeletion,
    reports,
    setReports,
    selectedReport,
    setSelectedReport,
    reportSearchTerm,
    setReportSearchTerm,
    reportStatusFilter,
    setReportStatusFilter,
    reportPage,
    setReportPage,
    reportPerPage,
    setReportPerPage,
    selectedReportIds,
    setSelectedReportIds,
    isBatchUpdatingReports,
    setIsBatchUpdatingReports,
    ngWords,
    setNgWords,
    newNgWord,
    setNewNgWord,
    ngWordCategory,
    setNgWordCategory,
    ngWordSeverity,
    setNgWordSeverity,
    bulkNgWordsText,
    setBulkNgWordsText,
    isBulkAddModalOpen,
    setIsBulkAddModalOpen,
    selectedNgWordIds,
    setSelectedNgWordIds,
    isBatchUpdatingNgWords,
    setIsBatchUpdatingNgWords,
    successStories,
    setSuccessStories,
    editingStoryId,
    setEditingStoryId,
    isCreatingStory,
    setIsCreatingStory,
    newStoryForm,
    setNewStoryForm,
    handleApproveModPost,
    handleBatchApproveModPosts,
    handleBatchDeleteModPosts,
    handleBatchDeleteArchive,
    handleApproveDeletionRequest,
    handleRejectDeletionRequest,
    handleBatchApproveDeletion,
    handleBatchRejectDeletion,
    handleResolveReport,
    handleDismissReport,
    handleBatchResolveReports,
    handleBatchDismissReports,
    handleAiAnalyze,
    handleAddNgWord,
    handleBatchAddNgWords,
    handleDeleteNgWord,
    handleBatchDeleteNgWords,
    handleUpdateSuccessStory,
    handleCreateSuccessStory,
    handleDeleteSuccessStory,
    handleSeedSuccessStories
  };
};
