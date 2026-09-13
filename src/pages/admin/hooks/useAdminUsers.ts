import { useState } from "react";

export interface UseAdminUsersProps {
  token: string | null;
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser?: any;
  updateUser?: (data: any) => void;
  fetchData: () => Promise<void>;
  setStatusMsg?: (msg: any) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void | Promise<void>) => void;
}

export const useAdminUsers = ({
  token,
  users,
  setUsers,
  currentUser,
  updateUser,
  fetchData,
  setStatusMsg,
  showConfirm
}: UseAdminUsersProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'ekyc' | 'self' | 'none' | 'blocked' | 'active'>('all');
  const [userSortBy, setUserSortBy] = useState<'created_desc' | 'created_asc' | 'posts_desc' | 'resolved_desc' | 'reports_desc'>('created_desc');
  const [userItemsPerPage, setUserItemsPerPage] = useState<number>(30);
  const [isBatchUpdatingUserStatus, setIsBatchUpdatingUserStatus] = useState(false);
  const [isBatchResettingUserEkyc, setIsBatchResettingUserEkyc] = useState(false);
  const [isBatchDeletingUsers, setIsBatchDeletingUsers] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);

  const handleBatchDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedUserIds.length} 名のユーザーを完全に削除しますか？\n（関連する投稿やメッセージもすべて削除されます）`)) {
      return;
    }

    setIsBatchDeletingUsers(true);
    try {
      const res = await fetch('/api/admin/users/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedUserIds })
      });

      if (res.ok) {
        alert(`${selectedUserIds.length} 名のユーザーを一括削除しました。`);
        setSelectedUserIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括削除に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingUsers(false);
    }
  };

  const handleBatchUpdateUserStatus = async (isBlocked: boolean) => {
    if (selectedUserIds.length === 0) return;
    const actionText = isBlocked ? '凍結（停止）' : '凍結解除（正常化）';
    if (!window.confirm(`選択した ${selectedUserIds.length} 名のユーザーアカウントを一括で「${actionText}」しますか？`)) {
      return;
    }

    setIsBatchUpdatingUserStatus(true);
    try {
      const res = await fetch('/api/admin/users/batch-update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedUserIds, is_blocked: isBlocked ? 1 : 0 })
      });

      if (res.ok) {
        alert(`${selectedUserIds.length} 名のステータスを一括更新しました。`);
        setSelectedUserIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchUpdatingUserStatus(false);
    }
  };

  const handleBatchResetUserEkyc = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`選択した ${selectedUserIds.length} 名の公的本人確認（eKYC）認証ステータスを一括で「未認証」に初期化しますか？`)) {
      return;
    }

    setIsBatchResettingUserEkyc(true);
    try {
      const res = await fetch('/api/admin/users/batch-reset-ekyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedUserIds })
      });

      if (res.ok) {
        alert(`${selectedUserIds.length} 名のeKYC認証を一括リセットしました。`);
        setSelectedUserIds([]);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || '一括リセットに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchResettingUserEkyc(false);
    }
  };

  const handleExportUsersCSV = () => {
    if (!users || users.length === 0) {
      alert('エクスポートするユーザーデータがありません。');
      return;
    }

    const filtered = users.filter(u => {
      const term = userSearchTerm.toLowerCase();
      if (!term) return true;
      return (
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.nickname && u.nickname.toLowerCase().includes(term)) ||
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.maiden_name && u.maiden_name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.contact_id && u.contact_id.toLowerCase().includes(term)) ||
        String(u.id).includes(term)
      );
    });

    if (filtered.length === 0) {
      alert('エクスポート対象のユーザーが存在しません。');
      return;
    }

    const headers = ['ユーザーID', 'ユーザー名', 'ニックネーム', '本名', '旧姓', '生年月日', '性別', 'メールアドレス', '連絡先種別', '連絡先ID', '権限', 'eKYC認証', '凍結状態', '投関数', '再会数', '被通報数', '登録日時'];
    const rows = filtered.map(u => [
      u.id,
      `"${(u.username || '').replace(/"/g, '""')}"`,
      `"${(u.nickname || '').replace(/"/g, '""')}"`,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      `"${(u.maiden_name || '').replace(/"/g, '""')}"`,
      u.birthdate || '',
      `"${(u.gender || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.contact_type || '',
      `"${(u.contact_id || '').replace(/"/g, '""')}"`,
      u.role || 'user',
      u.is_ekyc_verified ? '認証済' : '未認証',
      u.is_blocked ? '凍結中' : '正常',
      u.posts_count || 0,
      u.resolved_posts_count || 0,
      u.reports_received_count || 0,
      u.created_at || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateUserStatus = async (userId: number, is_blocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: is_blocked ? 1 : 0 } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminResetUserEkyc = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-ekyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_ekyc_verified: 0 } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, is_ekyc_verified: 0 });
        }
        if (currentUser && currentUser.id === userId) {
          localStorage.removeItem('ekyc_verified');
          localStorage.setItem('ekyc_verified', 'false');
          sessionStorage.removeItem('finder_ekyc_step');
          sessionStorage.removeItem('show_finder_ekyc_modal');
          window.dispatchEvent(new Event('ekyc_changed'));
          if (updateUser) updateUser({ is_ekyc_verified: false });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminSendPasswordReset = async (userId: number, email: string) => {
    if (!window.confirm(`ユーザー「${email}」宛にパスワード再設定メールを送信しますか？\n（本人の登録メールアドレス宛に30分間有効な再設定リンクが届きます）`)) {
      return;
    }
    setIsSendingPasswordReset(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/send-reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'パスワード再設定メールを安全に送信しました。');
      } else {
        alert(data.error || '送信に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    setLoadingUserPosts(true);
    try {
      const [detailsRes, postsRes] = await Promise.all([
        fetch(`/api/admin/users/${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/admin/users/${user.id}/posts`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let fullUserData = user;
      if (detailsRes.ok) {
        fullUserData = await detailsRes.json();
      }

      let fetchedPosts: any[] = [];
      if (postsRes.ok) {
        fetchedPosts = await postsRes.json();
        setUserPosts(fetchedPosts);
      } else {
        setUserPosts([]);
      }

      setSelectedUser({
        ...fullUserData,
        posts_count: fetchedPosts.length || fullUserData.posts_count || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserPosts(false);
    }
  };

  const handleToggleFreezeUser = async (userId: number, currentBlocked: number) => {
    if (!token) return;
    try {
      const is_blocked = currentBlocked === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked })
      });
      if (res.ok) {
        alert(is_blocked ? '対象ユーザーのアカウントを凍結（無効化）しました。' : '対象ユーザーの凍結を解除しました。');
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'ステータスの更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信に失敗しました。');
    }
  };

  const handleDeleteUser = async (id: number) => {
    showConfirm('ユーザーの削除', 'このユーザーを削除してもよろしいですか？', async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  return {
    selectedUser,
    setSelectedUser,
    userPosts,
    setUserPosts,
    loadingUserPosts,
    setLoadingUserPosts,
    userSearchTerm,
    setUserSearchTerm,
    selectedUserIds,
    setSelectedUserIds,
    userStatusFilter,
    setUserStatusFilter,
    userSortBy,
    setUserSortBy,
    userItemsPerPage,
    setUserItemsPerPage,
    isBatchUpdatingUserStatus,
    setIsBatchUpdatingUserStatus,
    isBatchResettingUserEkyc,
    setIsBatchResettingUserEkyc,
    isBatchDeletingUsers,
    setIsBatchDeletingUsers,
    userPage,
    setUserPage,
    isSendingPasswordReset,
    setIsSendingPasswordReset,
    handleBatchDeleteUsers,
    handleBatchUpdateUserStatus,
    handleBatchResetUserEkyc,
    handleExportUsersCSV,
    handleUpdateUserStatus,
    handleAdminResetUserEkyc,
    handleAdminSendPasswordReset,
    handleViewUser,
    handleToggleFreezeUser,
    handleDeleteUser
  };
};
