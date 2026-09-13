import { useState } from "react";
import { classifyTicket } from "../../../utils/contactClassification";

export interface UseAdminContactsProps {
  token: string | null;
  fetchData: () => Promise<void>;
  setStatusMsg: (msg: any) => void;
}

export const useAdminContacts = ({ token, fetchData, setStatusMsg }: UseAdminContactsProps) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactCategoryFilter, setContactCategoryFilter] = useState<"all" | "urgent" | "technical" | "account" | "general">("all");
  const [contactStatusFilter, setContactStatusFilter] = useState<"all" | "pending" | "replied">("all");
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactSortBy, setContactSortBy] = useState<"priority" | "newest" | "oldest">("priority");
  const [isSeedingContacts, setIsSeedingContacts] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [contactCurrentPage, setContactCurrentPage] = useState<number>(1);
  const [contactItemsPerPage, setContactItemsPerPage] = useState<number>(25);
  const [isBatchProcessingContacts, setIsBatchProcessingContacts] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [aiDraftTone, setAiDraftTone] = useState<"standard" | "apology" | "guidance">("standard");

  const handleReplyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !replyMessage || !token) return;

    setIsReplying(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage })
      });

      if (response.ok) {
        setStatusMsg({ text: '返信を送信しました。', type: 'success' });
        setSelectedContact(null);
        setReplyMessage('');
        fetchData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const data = await response.json();
        setStatusMsg({ text: data.error || '送信に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Reply error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsReplying(false);
    }
  };

  const handleGenerateAiDraft = async (selectedTone?: 'standard' | 'apology' | 'guide' | 'gratitude' | 'concise') => {
    if (!selectedContact || !token) return;
    const toneToUse = selectedTone || aiDraftTone;
    setIsGeneratingAiDraft(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/ai-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tone: toneToUse })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.draft) {
          setReplyMessage(data.draft);
          setStatusMsg({ text: '✨ AIが返信下書きを作成・反映しました。内容をご確認の上ご調整ください。', type: 'success' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || 'AI下書きの生成に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("AI Draft error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const handleSeedSampleContacts = async () => {
    if (!token) return;
    setIsSeedingContacts(true);
    try {
      const response = await fetch('/api/admin/contacts/seed-samples', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStatusMsg({ text: '✅ サンプルお問い合わせ（全分類対応・8件）を投入しました。自動分類トリアージをお試しいただけます。', type: 'success' });
        // Refresh contacts
        const contactsRes = await fetch('/api/admin/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (contactsRes.ok) {
          const freshContacts = await contactsRes.json();
          setContacts(freshContacts);
        }
        setTimeout(() => setStatusMsg(null), 5000);
      } else {
        setStatusMsg({ text: 'サンプル投入に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Seed contacts error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsSeedingContacts(false);
    }
  };

  const handleToggleSelectAllContacts = (currentIds: number[]) => {
    if (selectedContactIds.length === currentIds.length && currentIds.length > 0) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(currentIds);
    }
  };

  const handleToggleSelectContact = (id: number) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchUpdateContactStatus = async (status: 'replied' | 'pending') => {
    if (!token || selectedContactIds.length === 0) return;
    const label = status === 'replied' ? '返信済（解決）' : '未対応';
    if (!confirm(`選択した ${selectedContactIds.length} 件のお問い合わせを「${label}」に一括変更しますか？`)) return;

    setIsBatchProcessingContacts(true);
    try {
      const response = await fetch('/api/admin/contacts/batch-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedContactIds, status })
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMsg({ text: `✨ ${data.message || '一括更新が完了しました。'}`, type: 'success' });
        setSelectedContactIds([]);
        fetchData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '一括更新に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Batch status error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsBatchProcessingContacts(false);
    }
  };

  const handleBatchDeleteContacts = async () => {
    if (!token || selectedContactIds.length === 0) return;
    if (!confirm(`⚠️ 警告: 選択した ${selectedContactIds.length} 件のお問い合わせを完全に削除しますか？この操作は取り消せません。`)) return;

    setIsBatchProcessingContacts(true);
    try {
      const response = await fetch('/api/admin/contacts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedContactIds })
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMsg({ text: `🗑️ ${data.message || '一括削除が完了しました。'}`, type: 'success' });
        setSelectedContactIds([]);
        fetchData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '一括削除に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Batch delete error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsBatchProcessingContacts(false);
    }
  };

  const handleUpdateSingleContactStatus = async (id: number, status: 'replied' | 'pending') => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/contacts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setStatusMsg({ text: `ステータスを「${status === 'replied' ? '返信済' : '未対応'}」に変更しました。`, type: 'success' });
        fetchData();
        setTimeout(() => setStatusMsg(null), 2500);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '更新に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Status update error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    }
  };

  const handleDeleteSingleContact = async (id: number) => {
    if (!token) return;
    if (!confirm('このお問い合わせを削除しますか？')) return;
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setStatusMsg({ text: 'お問い合わせを削除しました。', type: 'success' });
        setSelectedContactIds(prev => prev.filter(i => i !== id));
        fetchData();
        setTimeout(() => setStatusMsg(null), 2500);
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || '削除に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Delete contact error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    }
  };

  const handleExportContactsCsv = () => {
    if (!contacts || contacts.length === 0) {
      alert('エクスポートするお問い合わせデータがありません。');
      return;
    }

    const headers = ['ID', '自動分類', 'ステータス', '優先スコア', '検知キーワード', '受信日時', '氏名', 'メールアドレス', '件名', '本文', '返信日時', '返信内容'];
    const rows = contacts.map(c => {
      const cl = classifyTicket(c.subject || '', c.message || '');
      return [
        c.id,
        cl.categoryLabel,
        c.status === 'replied' ? '返信済' : '未対応',
        cl.priorityScore,
        `"${(cl.matchedKeywords || []).join('; ')}"`,
        `"${new Date(c.created_at).toLocaleString('ja-JP').replace(/"/g, '""')}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.subject || '').replace(/"/g, '""')}"`,
        `"${(c.message || '').replace(/"/g, '""')}"`,
        c.replied_at ? `"${new Date(c.replied_at).toLocaleString('ja-JP').replace(/"/g, '""')}"` : '""',
        `"${(c.reply_message || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_contacts_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    contacts,
    setContacts,
    contactCategoryFilter,
    setContactCategoryFilter,
    contactStatusFilter,
    setContactStatusFilter,
    contactSearchQuery,
    setContactSearchQuery,
    contactSortBy,
    setContactSortBy,
    isSeedingContacts,
    setIsSeedingContacts,
    selectedContactIds,
    setSelectedContactIds,
    contactCurrentPage,
    setContactCurrentPage,
    contactItemsPerPage,
    setContactItemsPerPage,
    isBatchProcessingContacts,
    setIsBatchProcessingContacts,
    selectedContact,
    setSelectedContact,
    replyMessage,
    setReplyMessage,
    isReplying,
    setIsReplying,
    isGeneratingAiDraft,
    setIsGeneratingAiDraft,
    aiDraftTone,
    setAiDraftTone,
    handleReplyContact,
    handleSeedSampleContacts,
    handleToggleSelectAllContacts,
    handleToggleSelectContact,
    handleBatchUpdateContactStatus,
    handleBatchDeleteContacts,
    handleUpdateSingleContactStatus,
    handleDeleteSingleContact,
    handleExportContactsCsv
  };
};
