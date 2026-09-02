import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Shield, Lock, Users, UserCheck, AlertTriangle, 
  CheckCircle2, XCircle, Key, RefreshCw, Radio, Sparkles, 
  ChevronRight, ArrowRight, Eye, UserPlus, FileText, Bot, DollarSign,
  ShieldAlert, Search
} from 'lucide-react';

interface RoleInfo {
  key: string;
  name: string;
  description: string;
  badgeClass: string;
  permissions: string[];
}

interface PermissionItem {
  key: string;
  label: string;
  category: string;
}

interface AdminStaff {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  nickname: string | null;
  role: string;
  is_verified: number;
  created_at: string;
  last_action_at: string | null;
  last_action_type: string | null;
}

interface AdminRbacViewProps {
  token: string | null;
  currentRole: string;
  onRoleSwitched?: (newToken: string, newRole: string) => void;
}

const DEFAULT_ROLES: RoleInfo[] = [
  {
    key: 'super_admin',
    name: '👑 統括最高管理者 (Super Admin)',
    description: 'システム設定、決済・返金、スタッフ権限付与、DBリセット、法執行照会を含む全機能の実行・閲覧権限を持ちます。',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    permissions: ['manage_settings', 'manage_admins', 'manage_payments', 'moderate_content', 'manage_contacts', 'view_police_logs', 'view_analytics', 'manage_users', 'danger_zone']
  },
  {
    key: 'moderator',
    name: '🛡️ コンテンツ・治安モデレーター (Moderator)',
    description: '思い出ボトルの検閲、AI有害フラグ審査、不適切通報・削除依頼の対応、NGワード登録、IPアクセス遮断を担当します。',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    permissions: ['moderate_content', 'view_analytics', 'manage_users']
  },
  {
    key: 'cs_support',
    name: '🎧 カスタマーサポート担当 (CS Support)',
    description: 'ユーザーからのお問い合わせ対応・メール返信、年齢確認（eKYC）ステータス確認、トラブル相談の受付を担当します。',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    permissions: ['manage_contacts', 'view_analytics', 'age_verification', 'manage_users']
  },
  {
    key: 'auditor',
    name: '⚖️ 法務・監査担当 (Auditor & Compliance)',
    description: '警察・公安からの捜査事項照会対応（証跡エクスポート）、アクセス・操作監査ログ、売上台帳の閲覧を担当します（書き込み・変更不可）。',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    permissions: ['view_police_logs', 'view_analytics', 'view_audit_logs', 'view_payments']
  }
];

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  { key: 'manage_settings', label: 'システム設定変更', category: 'システム' },
  { key: 'manage_admins', label: '管理者ロール変更・権限付与', category: 'セキュリティ' },
  { key: 'manage_payments', label: '決済・返金処理・売上管理', category: '財務' },
  { key: 'moderate_content', label: 'ボトル削除・検閲・通報対応・IP遮断', category: 'モデレーション' },
  { key: 'manage_contacts', label: 'お問い合わせ返信・サポート', category: 'CS' },
  { key: 'view_police_logs', label: '警察照会・捜査開示データ生成', category: '法務' },
  { key: 'view_analytics', label: 'KPI・統計・ボトル分析閲覧', category: '分析' },
  { key: 'manage_users', label: 'ユーザーアカウント停止・削除', category: 'ユーザー' },
  { key: 'danger_zone', label: 'データベース初期化・危険操作', category: '危険' }
];

const DEFAULT_STAFF: AdminStaff[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@remeets.internal',
    full_name: '最高管理者（システム統括）',
    nickname: '統括責任者',
    role: 'super_admin',
    is_verified: 1,
    created_at: '2025-01-01 00:00:00',
    last_action_at: new Date().toISOString(),
    last_action_type: 'SYSTEM_AUDIT_CHECK'
  }
];

export const AdminRbacView: React.FC<AdminRbacViewProps> = ({ token, currentRole, onRoleSwitched }) => {
  const [roles, setRoles] = useState<RoleInfo[]>(DEFAULT_ROLES);
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_PERMISSIONS);
  const [staffList, setStaffList] = useState<AdminStaff[]>(DEFAULT_STAFF);
  const [loading, setLoading] = useState<boolean>(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const [updatingStaffId, setUpdatingStaffId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 🔍 ユーザー検索・スタッフ任命用ステート
  const [candidateQuery, setCandidateQuery] = useState<string>('');
  const [candidateResults, setCandidateResults] = useState<any[]>([]);
  const [isSearchingCandidates, setIsSearchingCandidates] = useState<boolean>(false);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('moderator');

  const getEffectiveToken = () => token || localStorage.getItem('token') || '';

  const handleSearchCandidates = async (queryText?: string) => {
    const q = typeof queryText === 'string' ? queryText : candidateQuery;
    setIsSearchingCandidates(true);
    try {
      const authHeader = getEffectiveToken() ? { Authorization: `Bearer ${getEffectiveToken()}` } : {};
      const res = await fetch(`/api/admin/rbac/search-candidates?q=${encodeURIComponent(q)}`, {
        credentials: 'include',
        headers: authHeader
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setCandidateResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Failed to search candidate users:', err);
    } finally {
      setIsSearchingCandidates(false);
    }
  };

  const fetchRbacData = async () => {
    const authHeader = getEffectiveToken() ? { Authorization: `Bearer ${getEffectiveToken()}` } : {};
    try {
      const [rolesRes, staffRes] = await Promise.all([
        fetch('/api/admin/rbac/roles', { credentials: 'include', headers: authHeader }),
        fetch('/api/admin/rbac/admins', { credentials: 'include', headers: authHeader })
      ]);

      if (rolesRes.ok && rolesRes.headers.get('content-type')?.includes('application/json')) {
        const rolesData = await rolesRes.json();
        if (rolesData.roles && rolesData.roles.length > 0) setRoles(rolesData.roles);
        if (rolesData.permissions && rolesData.permissions.length > 0) setPermissions(rolesData.permissions);
      }

      if (staffRes.ok && staffRes.headers.get('content-type')?.includes('application/json')) {
        const staffData = await staffRes.json();
        if (Array.isArray(staffData) && staffData.length > 0) setStaffList(staffData);
      }
    } catch (err) {
      console.warn('Using default RBAC schema fallback:', err);
    }
  };

  useEffect(() => {
    fetchRbacData();
  }, [token]);

  const handleSimulateRole = async (targetRole: string) => {
    setSwitchingRole(targetRole);
    setMessage(null);
    try {
      const authHeader = getEffectiveToken() ? { Authorization: `Bearer ${getEffectiveToken()}` } : {};
      const res = await fetch('/api/admin/rbac/simulate-role-switch', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ targetRole })
      });

      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Invalid server response');
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: data.message });
        if (onRoleSwitched && data.token) {
          onRoleSwitched(data.token, targetRole);
        }
        await fetchRbacData();
      } else {
        setMessage({ type: 'error', text: data.error || 'ロール切り替えに失敗しました。' });
      }
    } catch (err) {
      console.error('Simulate role switch failed:', err);
      setMessage({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setSwitchingRole(null);
    }
  };

  const handleChangeStaffRole = async (staffId: number, newRole: string) => {
    setUpdatingStaffId(staffId);
    setMessage(null);
    try {
      const authHeader = getEffectiveToken() ? { Authorization: `Bearer ${getEffectiveToken()}` } : {};
      const res = await fetch(`/api/admin/rbac/users/${staffId}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ newRole })
      });

      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Invalid server response');
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchRbacData();
      } else {
        setMessage({ type: 'error', text: data.error || 'ロールの変更に失敗しました。' });
      }
    } catch (err) {
      console.error('Update staff role failed:', err);
      setMessage({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setUpdatingStaffId(null);
    }
  };

  const getRoleBadge = (roleKey: string) => {
    switch (roleKey) {
      case 'super_admin':
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">👑 統括最高管理者 (Super Admin)</span>;
      case 'moderator':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">🛡️ モデレーター (Moderator)</span>;
      case 'cs_support':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">🎧 CSサポート (CS Support)</span>;
      case 'auditor':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">⚖️ 監査・法務 (Auditor)</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-300">一般ユーザー ({roleKey})</span>;
    }
  };

  const canManageAdmins = currentRole === 'super_admin' || currentRole === 'admin';

  return (
    <div className="space-y-8 font-sans">
      {/* 👑 現在のロール状態ヘッダー */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
                  Role-Based Access Control (RBAC)
                </div>
                <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
                  管理者権限・マルチロール細分化セキュリティ
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-sans max-w-2xl leading-relaxed">
              「最小権限の原則（Least Privilege）」に基づき、運営スタッフの役職に応じて実行可能なAPIおよび管理画面の操作スコープを厳格に分離・制御しています。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 min-w-[260px]">
            <div className="text-[11px] font-bold text-indigo-200">
              現在のログイン役職 (Active Role)
            </div>
            <div>
              {getRoleBadge(currentRole)}
            </div>
            <div className="text-[11px] text-slate-300">
              権限: {canManageAdmins ? '全権限（最高統括）' : currentRole === 'moderator' ? 'モデレーション・治安特化' : currentRole === 'cs_support' ? 'CS・問い合わせ・年齢確認' : '法務照会・監査閲覧専用'}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <AlertTriangle size={18} className="text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🧪 ロール視点シミュレーター (体験・テスト機能) */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles size={20} className="text-amber-500" />
            <h3 className="text-base font-serif font-bold text-neutral-900">
              🧪 ロール視点シミュレーター (即時切り替えテスト)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-500 font-sans">
            ボタンを押すと即座に対象ロールの権限へ動的切り替えされ、各機能のアクセス制限挙動を確認できます。
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* 👑 Super Admin */}
          <button
            onClick={() => handleSimulateRole('super_admin')}
            disabled={switchingRole !== null || currentRole === 'super_admin'}
            className={`p-4 rounded-2xl border text-left transition-all ${
              currentRole === 'super_admin' || currentRole === 'admin'
                ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-200'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-purple-300 hover:bg-purple-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-900">👑 統括最高管理者</span>
              {currentRole === 'super_admin' || currentRole === 'admin' ? (
                <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">現在適用中</span>
              ) : (
                <span className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5">切替 <ArrowRight size={12} /></span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              システム設定、決済返金、スタッフ権限付与、DB初期化を含む全権限。
            </p>
          </button>

          {/* 🛡️ Moderator */}
          <button
            onClick={() => handleSimulateRole('moderator')}
            disabled={switchingRole !== null || currentRole === 'moderator'}
            className={`p-4 rounded-2xl border text-left transition-all ${
              currentRole === 'moderator'
                ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900">🛡️ モデレーター</span>
              {currentRole === 'moderator' ? (
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">現在適用中</span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">切替 <ArrowRight size={12} /></span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              ボトル審査、通報・削除依頼、NGワード、IP遮断（設定・返金は制限）。
            </p>
          </button>

          {/* 🎧 CS Support */}
          <button
            onClick={() => handleSimulateRole('cs_support')}
            disabled={switchingRole !== null || currentRole === 'cs_support'}
            className={`p-4 rounded-2xl border text-left transition-all ${
              currentRole === 'cs_support'
                ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-200'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-sky-300 hover:bg-sky-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-900">🎧 CSサポート</span>
              {currentRole === 'cs_support' ? (
                <span className="text-[10px] bg-sky-600 text-white font-bold px-2 py-0.5 rounded-full">現在適用中</span>
              ) : (
                <span className="text-[10px] text-sky-600 font-bold flex items-center gap-0.5">切替 <ArrowRight size={12} /></span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              お問い合わせ対応返信、年齢確認ステータス確認（ボトル削除・返金は制限）。
            </p>
          </button>

          {/* ⚖️ Auditor */}
          <button
            onClick={() => handleSimulateRole('auditor')}
            disabled={switchingRole !== null || currentRole === 'auditor'}
            className={`p-4 rounded-2xl border text-left transition-all ${
              currentRole === 'auditor'
                ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-200'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900">⚖️ 監査・法務担当</span>
              {currentRole === 'auditor' ? (
                <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full">現在適用中</span>
              ) : (
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">切替 <ArrowRight size={12} /></span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              警察照会データ生成、アクセスログ・台帳監査閲覧（編集・削除・返金不可）。
            </p>
          </button>
        </div>
      </div>

      {/* 👥 管理スタッフ・アカウント一覧 ＆ 権限割当 */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
          <div className="flex items-center gap-2.5">
            <Users size={20} className="text-indigo-600" />
            <div>
              <h3 className="text-base font-serif font-bold text-neutral-900">
                👥 管理スタッフ・ロール一覧
              </h3>
              <p className="text-xs text-neutral-500">
                登録されている運営スタッフと割り当てられたロール（統括最高管理者のみロール変更可能）。
              </p>
            </div>
          </div>
          <button
            onClick={fetchRbacData}
            disabled={loading}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs text-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>最新データに更新</span>
          </button>
        </div>

        {/* 🔍 一般ユーザーを検索してスタッフに任命・権限付与するエリア */}
        {canManageAdmins && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <UserPlus size={16} className="text-indigo-600" />
                <span>新規スタッフ任命（一般ユーザーから検索してロール付与）</span>
              </div>
              <span className="text-[10px] text-indigo-500">登録済みアカウントを即座にスタッフ化</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="ユーザー名、ニックネーム、メールアドレス、またはIDで検索..."
                  value={candidateQuery}
                  onChange={(e) => setCandidateQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCandidates()}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-800 placeholder:text-neutral-400"
                />
              </div>

              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="text-xs bg-white border border-indigo-200 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="moderator">🛡️ モデレーターに任命</option>
                <option value="cs_support">🎧 CSサポートに任命</option>
                <option value="auditor">⚖️ 監査・法務に任命</option>
                <option value="super_admin">👑 統括最高管理者に任命</option>
              </select>

              <button
                type="button"
                onClick={() => handleSearchCandidates()}
                disabled={isSearchingCandidates}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
              >
                {isSearchingCandidates ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                <span>ユーザー検索</span>
              </button>
            </div>

            {/* 検索結果一覧 */}
            {candidateResults.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-100 space-y-2 animate-in fade-in">
                <div className="text-[11px] font-bold text-neutral-500 flex items-center justify-between">
                  <span>検索結果 ({candidateResults.length}件):</span>
                  <button 
                    onClick={() => setCandidateResults([])}
                    className="text-[10px] text-neutral-400 hover:text-neutral-600 underline"
                  >
                    閉じる
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {candidateResults.map((u) => {
                    const isAlreadyStaff = staffList.some(s => s.id === u.id);
                    return (
                      <div 
                        key={u.id} 
                        className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/50 hover:bg-indigo-50/30 flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-neutral-900 truncate">
                            {u.nickname || u.full_name || u.username}
                            <span className="ml-1 text-[10px] text-neutral-400 font-mono">(@{u.username} / ID:#{u.id})</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 truncate font-mono">{u.email || 'メール未登録'}</div>
                          <div className="text-[10px] text-indigo-600">現在ロール: {u.role}</div>
                        </div>
                        <button
                          onClick={async () => {
                            await handleChangeStaffRole(u.id, selectedNewRole);
                            setCandidateResults([]);
                            setCandidateQuery('');
                          }}
                          disabled={updatingStaffId === u.id}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors shadow-xs"
                        >
                          {isAlreadyStaff ? '役職を変更' : '任命する'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600">
                <th className="py-3 px-4 font-bold">ユーザー名 / 氏名</th>
                <th className="py-3 px-4 font-bold">連絡先メール</th>
                <th className="py-3 px-4 font-bold">現在の割り当て役職</th>
                <th className="py-3 px-4 font-bold">最終管理アクション</th>
                <th className="py-3 px-4 font-bold text-right">ロール変更</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {staff.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{staff.full_name || staff.username}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">@{staff.username} (ID: #{staff.id})</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono text-[11px]">
                    {staff.email || '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    {getRoleBadge(staff.role)}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                    {staff.last_action_at ? (
                      <div>
                        <div className="font-mono text-neutral-700">{new Date(staff.last_action_at).toLocaleString('ja-JP')}</div>
                        <div className="text-[10px] text-neutral-400">{staff.last_action_type || '操作実行'}</div>
                      </div>
                    ) : (
                      <span className="text-neutral-400">操作ログなし</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {canManageAdmins ? (
                      <select
                        value={staff.role}
                        onChange={(e) => handleChangeStaffRole(staff.id, e.target.value)}
                        disabled={updatingStaffId === staff.id}
                        className="text-xs bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1 font-sans text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="super_admin">👑 統括最高管理者 (super_admin)</option>
                        <option value="moderator">🛡️ モデレーター (moderator)</option>
                        <option value="cs_support">🎧 CSサポート (cs_support)</option>
                        <option value="auditor">⚖️ 監査・法務 (auditor)</option>
                        <option value="user">👤 一般ユーザーに降格 (user)</option>
                      </select>
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">変更権限なし</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📊 権限マトリクス (RBAC Capabilities Matrix) */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
          <Key size={20} className="text-purple-600" />
          <div>
            <h3 className="text-base font-serif font-bold text-neutral-900">
              📊 権限マトリクス (RBAC Capabilities Matrix)
            </h3>
            <p className="text-xs text-neutral-500">
              各役職に許可されている実行権限の一覧対照表です。バックエンドのAPIミドルウェア（<code>requirePermission</code>）によって厳密に強制されます。
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-700">
                <th className="py-3 px-4 font-bold min-w-[200px]">機能・権限スコープ</th>
                <th className="py-3 px-4 font-bold text-center bg-purple-50/50 text-purple-900 min-w-[130px]">
                  👑 統括最高管理者<br/><span className="text-[10px] font-mono font-normal">super_admin</span>
                </th>
                <th className="py-3 px-4 font-bold text-center bg-emerald-50/50 text-emerald-900 min-w-[130px]">
                  🛡️ モデレーター<br/><span className="text-[10px] font-mono font-normal">moderator</span>
                </th>
                <th className="py-3 px-4 font-bold text-center bg-sky-50/50 text-sky-900 min-w-[130px]">
                  🎧 CSサポート<br/><span className="text-[10px] font-mono font-normal">cs_support</span>
                </th>
                <th className="py-3 px-4 font-bold text-center bg-amber-50/50 text-amber-900 min-w-[130px]">
                  ⚖️ 監査・法務<br/><span className="text-[10px] font-mono font-normal">auditor</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {permissions.map((perm) => {
                const superAdminHas = roles.find(r => r.key === 'super_admin')?.permissions.includes(perm.key);
                const moderatorHas = roles.find(r => r.key === 'moderator')?.permissions.includes(perm.key);
                const csHas = roles.find(r => r.key === 'cs_support')?.permissions.includes(perm.key);
                const auditorHas = roles.find(r => r.key === 'auditor')?.permissions.includes(perm.key);

                return (
                  <tr key={perm.key} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{perm.label}</div>
                      <div className="text-[10px] text-neutral-400 font-mono"><code>{perm.key}</code> · カテゴリ: {perm.category}</div>
                    </td>
                    <td className="py-3 px-4 text-center bg-purple-50/20">
                      {superAdminHas ? (
                        <span className="inline-flex items-center gap-1 text-purple-700 font-bold text-xs"><CheckCircle2 size={16} /> 許可</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-300 text-xs"><XCircle size={16} /> 不可</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-emerald-50/20">
                      {moderatorHas ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs"><CheckCircle2 size={16} /> 許可</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-xs"><XCircle size={16} /> 制限</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-sky-50/20">
                      {csHas ? (
                        <span className="inline-flex items-center gap-1 text-sky-700 font-bold text-xs"><CheckCircle2 size={16} /> 許可</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-xs"><XCircle size={16} /> 制限</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-amber-50/20">
                      {auditorHas ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs"><CheckCircle2 size={16} /> 閲覧許可</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-xs"><XCircle size={16} /> 制限</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🛡️ セキュリティ設計ポリシー ＆ 法的コンプライアンス解説 */}
      <div className="glass-card p-6 rounded-3xl bg-neutral-900 text-white space-y-4 shadow-md">
        <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
          <ShieldAlert size={20} className="text-amber-400" />
          <h4 className="text-sm font-serif font-bold text-neutral-100">
            🔒 管理者権限細分化の運用ポリシー（セキュリティ・法的整合性）
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300 font-sans leading-relaxed">
          <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 space-y-1.5">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Lock size={15} />
              <span>1. 捜査開示データ（警察照会）のアクセス制限</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              一般のモデレーターやCSスタッフには刑事訴訟法に基づく警察開示データ（公的身分証ログ、IP履歴、メッセージ送受信全履歴）の閲覧権限を与えず、<code>super_admin</code> または <code>auditor</code> のみに制限することで、個人情報の内部不正持ち出しを完全防止します。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <DollarSign size={15} />
              <span>2. 決済・返金処理の権限分離</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Stripe決済の返金実行（オーソリ失効）や売上台帳の操作は <code>manage_payments</code> 権限を持つ統括管理者のみに限定。サポート担当者による不正な私的返金事故や横領を防止します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
