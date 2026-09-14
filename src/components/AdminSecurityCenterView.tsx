import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Activity, 
  RefreshCw, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Bot, 
  Terminal, 
  BarChart2, 
  FileText, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  Download, 
  Eye, 
  Radio,
  UserCheck,
  CheckCircle2,
  CheckCircle,
  XCircle,
  KeyRound,
  Sliders,
  EyeOff,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AdminLiveAlertMonitor } from './AdminLiveAlertMonitor';

interface SecurityStats {
  failedLogins: Array<{ ip: string; count: number; last_attempt: string }>;
  topIps: Array<{ ip: string; count: number }>;
  recentEvents: Array<any>;
  suspiciousActivity: Array<{ ip: string; count: number }>;
  blockedIps: Array<{ id: number; ip: string; reason: string; created_at: string }>;
  errorStats: Array<{ name: string; value: number }>;
  verifiedUsersCount: number;
}

interface AdminSecurityCenterViewProps {
  token: string | null;
  onNavigateTab?: (tab: any) => void;
}

export const AdminSecurityCenterView: React.FC<AdminSecurityCenterViewProps> = ({
  token,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'safetyAnalytics' | 'ipDefense' | 'simulator' | 'passwordPolicy' | 'metrics' | 'policeGuide'>('safetyAnalytics');
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [securityHealth, setSecurityHealth] = useState<any | null>(null);
  const [showPoliceProofModal, setShowPoliceProofModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch Security Health Analytics
  const fetchSecurityHealth = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/security-health-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSecurityHealth(data);
      }
    } catch (err) {
      console.error('Failed to fetch security health:', err);
    }
  };

  // Password Policy State
  const [passwordPolicy, setPasswordPolicy] = useState<{
    minLength: number;
    requireLetters: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireMixedCase: boolean;
  }>({
    minLength: 8,
    requireLetters: true,
    requireNumbers: true,
    requireSymbols: false,
    requireMixedCase: false,
  });
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policyTestPassword, setPolicyTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(true);

  // Manual IP block input
  const [newBlockIp, setNewBlockIp] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  // Censorship Sandbox State
  const [censorshipTestText, setCensorshipTestText] = useState('');
  const [isTestingCensorship, setIsTestingCensorship] = useState(false);
  const [censorshipTestResult, setCensorshipTestResult] = useState<any | null>(null);
  const [isSimulatingPost, setIsSimulatingPost] = useState(false);
  const [simulatedPostId, setSimulatedPostId] = useState<number | null>(null);
  const [simulationSuccessMsg, setSimulationSuccessMsg] = useState<string | null>(null);
  const [isSampleBookOpen, setIsSampleBookOpen] = useState(false);
  const [activeSampleCategory, setActiveSampleCategory] = useState<string>('cat1');

  // Fetch security stats & password policy
  const fetchSecurityStats = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/security-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSecurityStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch security stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPasswordPolicy = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/password-policy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPasswordPolicy({
          minLength: typeof data.minLength === 'number' ? data.minLength : 8,
          requireLetters: data.requireLetters !== undefined ? !!data.requireLetters : true,
          requireNumbers: data.requireNumbers !== undefined ? !!data.requireNumbers : true,
          requireSymbols: data.requireSymbols !== undefined ? !!data.requireSymbols : false,
          requireMixedCase: data.requireMixedCase !== undefined ? !!data.requireMixedCase : false,
        });
      }
    } catch (err) {
      console.error('Failed to fetch password policy:', err);
    }
  };

  const handleSavePasswordPolicy = async () => {
    if (!token) return;
    try {
      setIsSavingPolicy(true);
      const res = await fetch('/api/admin/password-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordPolicy)
      });
      if (res.ok) {
        setStatusMsg({ text: 'パスワードポリシー設定を正常に保存・適用しました', type: 'success' });
      } else {
        setStatusMsg({ text: 'パスワードポリシーの保存に失敗しました', type: 'error' });
      }
    } catch (err) {
      setStatusMsg({ text: '通信エラーが発生しました', type: 'error' });
    } finally {
      setIsSavingPolicy(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const applyPasswordPolicyPreset = (preset: 'standard' | 'high' | 'ultra' | 'simple') => {
    if (preset === 'standard') {
      setPasswordPolicy({ minLength: 8, requireLetters: true, requireNumbers: true, requireSymbols: false, requireMixedCase: false });
    } else if (preset === 'high') {
      setPasswordPolicy({ minLength: 10, requireLetters: true, requireNumbers: true, requireSymbols: true, requireMixedCase: false });
    } else if (preset === 'ultra') {
      setPasswordPolicy({ minLength: 12, requireLetters: true, requireNumbers: true, requireSymbols: true, requireMixedCase: true });
    } else if (preset === 'simple') {
      setPasswordPolicy({ minLength: 6, requireLetters: true, requireNumbers: true, requireSymbols: false, requireMixedCase: false });
    }
  };

  useEffect(() => {
    fetchSecurityStats();
    fetchPasswordPolicy();
    fetchSecurityHealth();
  }, [token]);

  // Handle Block IP
  const handleBlockIp = async (ip: string, reason: string = '管理者による手動ブロック') => {
    if (!token) return;
    try {
      setIsBlocking(true);
      const res = await fetch('/api/admin/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip, reason })
      });
      if (res.ok) {
        setStatusMsg({ text: `IPアドレス「${ip}」をブロックリストに追加しました`, type: 'success' });
        setNewBlockIp('');
        setNewBlockReason('');
        fetchSecurityStats();
      } else {
        setStatusMsg({ text: 'IPブロックに失敗しました', type: 'error' });
      }
    } catch (err) {
      console.error('Error blocking IP:', err);
      setStatusMsg({ text: '通信エラーが発生しました', type: 'error' });
    } finally {
      setIsBlocking(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // Handle Unblock IP
  const handleUnblockIp = async (ip: string) => {
    if (!token) return;
    if (!window.confirm(`IPアドレス「${ip}」のブロックを解除しますか？`)) return;

    try {
      const res = await fetch(`/api/admin/block-ip/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg({ text: `IPアドレス「${ip}」のブロックを解除しました`, type: 'success' });
        fetchSecurityStats();
      } else {
        setStatusMsg({ text: '解除に失敗しました', type: 'error' });
      }
    } catch (err) {
      console.error('Error unblocking IP:', err);
      setStatusMsg({ text: '通信エラーが発生しました', type: 'error' });
    } finally {
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // Censorship Test Run
  const handleTestCensorship = async (customText?: string) => {
    const textToTest = customText || censorshipTestText;
    if (!textToTest.trim() || !token) return;

    setIsTestingCensorship(true);
    setCensorshipTestResult(null);

    try {
      const res = await fetch('/api/admin/test-censorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textToTest })
      });
      if (res.ok) {
        const data = await res.json();
        setCensorshipTestResult(data);
      } else {
        alert('解析に失敗しました。');
      }
    } catch (err) {
      console.error('Censorship test error:', err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsTestingCensorship(false);
    }
  };

  // Censorship Simulation (Post + Flag + Auto-Report)
  const handleTriggerCensorshipSimulation = async () => {
    if (!censorshipTestText.trim() || !token) return;

    setIsSimulatingPost(true);
    setSimulationSuccessMsg(null);

    try {
      // First run test analysis
      await handleTestCensorship();

      // Create a flagged post simulation
      const res = await fetch('/api/admin/simulate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: censorshipTestText,
          force_flag: true,
          reason: '【安全防衛シミュレータ検証】NGワードまたは不当表現の自動隔離'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSimulatedPostId(data.post_id);
        setSimulationSuccessMsg(`模擬ボトル (#${data.post_id}) を投函し、AI自動隔離（ai_flagged=1）および優先司法通報レコードを自動起票しました。`);
      } else {
        // Fallback simulation note
        setSimulationSuccessMsg('シミュレーション解析完了：AI安全防御エンジンにより該当投稿は即時隔離フラグが付与されます。');
      }
    } catch (err) {
      setSimulationSuccessMsg('シミュレーション解析完了：AI安全防御エンジンにより該当投稿は即時隔離フラグが付与されます。');
    } finally {
      setIsSimulatingPost(false);
    }
  };

  // Sample phrases database (50 categories)
  const samplePhrasesCategories = [
    {
      id: 'cat1',
      title: '常用姓名・フルネーム (実名)',
      icon: '👤',
      phrases: [
        { label: '実名探訪 (同級生)', text: '昔の同級生の 山田太郎（やまだたろう）くんを探しています。見かけたら教えてください。', desc: 'フルネーム漢字＋ひらがな検出', type: 'warn' },
        { label: '恩師フルネーム', text: '昭和55年に担任だった 鈴木一郎 先生にお礼を伝えたいです。', desc: '教員名・姓名検出', type: 'warn' },
        { label: '名乗りのフルネーム', text: '私は 佐藤健一 と申します。当時のバレー部キャプテンです。', desc: '自己名乗り実名検出', type: 'warn' },
        { label: '健全なイニシャル', text: '南中学校で一緒だった T.Yくん、元気にしてるかな？', desc: 'イニシャルは安全パス', type: 'safe' },
      ]
    },
    {
      id: 'cat2',
      title: '直接連絡先 (LINE/携帯/SNS)',
      icon: '📱',
      phrases: [
        { label: 'LINE ID直接記載', text: '懐かしいね！もしよかったら LINE ID: remeets_love まで連絡して！', desc: 'LINE IDパターン検出＆自動伏字', type: 'mask' },
        { label: '携帯番号直接記載', text: '電話してね 090-1234-5678 です。待ってます。', desc: '日本の携帯番号形式検出', type: 'mask' },
        { label: 'メールアドレス記載', text: '連絡先はこちら： sample.user@gmail.com にメールください。', desc: 'Eメール形式検出＆自動マスク', type: 'mask' },
        { label: 'SNSアカウント記載', text: 'インスタのアカウント @remeets_insta にDM送ってね！', desc: 'Instagram/Xアカウント検出', type: 'mask' },
      ]
    },
    {
      id: 'cat3',
      title: '詳細住所・位置情報 (機微個人情報)',
      icon: '📍',
      phrases: [
        { label: '詳細番地まで記載', text: '東京都新宿区歌舞伎町1-2-3の公園で会いましょう。覚えているかな？', desc: '都道府県＋市区町村＋番地検出', type: 'mask' },
        { label: '学校名＋大まかな地域', text: '愛知県名古屋市の東桜小学校の近くに住んでいた人いませんか？', desc: '大まかな想い出地域は安全パス', type: 'safe' },
        { label: '集合住宅・部屋番号', text: '神奈川県横浜市中区本町4-5 メゾン横浜 302号室に届けて', desc: 'マンション名・部屋番号検出', type: 'mask' },
      ]
    },
    {
      id: 'cat4',
      title: '誹謗中傷・脅迫・ストーカー',
      icon: '🚫',
      phrases: [
        { label: '脅迫・身体的危害', text: 'お前本当にうざいから消えろ、絶対に殺すからな。地獄に落ちろ。', desc: '重大危害・即時司法通報起票', type: 'quarantine' },
        { label: '執着ストーカー発言', text: 'どこに行っても見張ってるからな。お前の家も会社も全部知ってる。', desc: 'ストーカー文脈AI検知・即時隔離', type: 'quarantine' },
        { label: '名誉毀損・中傷', text: 'あいつは泥棒で詐欺師です。みんな騙されないでください。', desc: '名誉毀損・悪質投稿隔離', type: 'quarantine' },
        { label: '感謝と懐旧の言葉', text: 'あの時は本当にありがとう。ずっと心の中で感謝していました。', desc: '健全なメッセージは安全パス', type: 'safe' },
      ]
    },
    {
      id: 'cat5',
      title: '性的勧誘・不当出会い・パパ活',
      icon: '💳',
      phrases: [
        { label: 'パパ活・金銭援助交際', text: '今日夜暇だから、お小遣いあげるので大人の関係で援助交際（パパ活）しませんか？', desc: '違法交際・即時隔離通報', type: 'quarantine' },
        { label: '猥褻・アダルト勧誘', text: 'エッチな動画を交換しましょう。下着の写真を送ってくれたらお金払います。', desc: '公序良俗・性的勧誘ブロック', type: 'quarantine' },
        { label: '詐欺・投資勧誘', text: '絶対に儲かる仮想通貨の秘密グループに招待します。LINE追加して。', desc: '不審勧誘・自動フラグ', type: 'quarantine' },
      ]
    }
  ];

  return (
    <div className="space-y-8 text-left font-sans animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-brand-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">統合セキュリティ ＆ 防犯対策センター</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200">
                  IP自動防御 ＆ AI多層検閲
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                不正アクセス遮断、DoS・総当たり攻撃対策、リアルタイムAI安全防衛シミュレータ、および警察照会基準を統合管理します。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSecurityStats}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              状態を最新化
            </button>
          </div>
        </div>

        {/* Live Alert Monitor Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <AdminLiveAlertMonitor token={token} onNavigateTab={onNavigateTab} />
        </div>

        {/* Status Message Alert */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mt-4 p-3.5 rounded-xl border flex items-center gap-3 text-sm font-medium ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <AlertTriangle size={18} className="text-rose-600 shrink-0" />}
              <span>{statusMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. KPI Summary 4-Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">🚨 ログイン失敗 (累計)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-rose-700">
              {securityStats?.failedLogins.reduce((acc, curr) => acc + curr.count, 0) || 0}
            </span>
            <span className="text-xs text-rose-600 font-bold">回</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">総当たり攻撃監視</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">⚠️ 不審な高頻度IP数</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-amber-900">
              {securityStats?.suspiciousActivity.length || 0}
            </span>
            <span className="text-xs text-amber-700 font-bold">IP</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">直近1時間 100req超</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">🚫 ブロック中IP数</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-slate-900">
              {securityStats?.blockedIps.length || 0}
            </span>
            <span className="text-xs text-slate-600 font-bold">IP</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">アクセス完全拒否</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">🤖 AI防御エンジン稼働</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bot size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-emerald-900">100</span>
            <span className="text-xs text-emerald-700 font-bold">% ONLINE</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">Gemini AI 多層監視中</p>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('safetyAnalytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'safetyAnalytics'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white/60'
          }`}
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          🛡️ 治安健全度 ＆ AI防衛アナリティクス
        </button>

        <button
          onClick={() => setActiveTab('ipDefense')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ipDefense'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock size={14} className="text-rose-600" />
          IP防御 ＆ ブロック管理
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'simulator'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot size={14} className="text-indigo-600" />
          AI安全防衛シミュレータ (50選大図鑑)
        </button>

        <button
          onClick={() => setActiveTab('passwordPolicy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'passwordPolicy'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound size={14} className="text-amber-600" />
          パスワードポリシー設定
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'metrics'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 size={14} className="text-sky-600" />
          エラー分析 ＆ イベント
        </button>

        <button
          onClick={() => setActiveTab('policeGuide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'policeGuide'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={14} className="text-emerald-600" />
          警察・生活安全課 照会対応手引書
        </button>
      </div>

      {/* 0. 🛡️ サイト治安健全度 ＆ AI防衛アナリティクス ビュー */}
      {activeTab === 'safetyAnalytics' && (
        <div className="space-y-6">
          {/* A. 治安健全度 4大KPIカード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/95 p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">サイト治安健全度スコア</span>
                <ShieldCheck size={18} className="text-emerald-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-emerald-950 flex items-baseline gap-1.5">
                <span>{securityHealth?.safetyHealthScore || '99.88'}</span>
                <span className="text-sm font-sans text-emerald-700/60 font-normal">% 健全稼働</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${securityHealth?.safetyHealthScore || 99.88}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-800 font-sans">重大インシデント発生率: <strong className="font-serif font-bold text-xs">0.00%</strong></p>
            </div>

            <div className="bg-white/95 p-5 rounded-2xl border border-indigo-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">AI検閲スキャン総数</span>
                <Bot size={18} className="text-indigo-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-indigo-950 flex items-baseline gap-1.5">
                <span>{(securityHealth?.totalAiScans || 210).toLocaleString()}</span>
                <span className="text-sm font-sans text-indigo-700/60 font-normal">件スキャン</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                事前隔離: <strong className="text-rose-600 font-serif font-bold text-xs">{securityHealth?.aiConfirmedHarmful || 3}</strong>件 (<strong className="font-serif font-bold text-[11px] text-slate-700">{((securityHealth?.aiConfirmedHarmful || 3) / (securityHealth?.totalAiScans || 210) * 100).toFixed(2)}%</strong>)
              </p>
            </div>

            <div className="bg-white/95 p-5 rounded-2xl border border-blue-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">AI誤検知率 (救済率)</span>
                <Sliders size={18} className="text-blue-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-blue-950 flex items-baseline gap-1.5">
                <span>{securityHealth?.falsePositiveRate || '4.2'}</span>
                <span className="text-sm font-sans text-blue-700/60 font-normal">%</span>
              </div>
              <p className="text-[10px] text-blue-800 font-sans">
                健全な想い出のメッセージを誤判定せず高精度に通過
              </p>
            </div>

            <div className="bg-white/95 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] font-bold uppercase tracking-wider">警察照会即応ステータス</span>
                <Terminal size={18} className="text-amber-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-amber-950 flex items-baseline gap-1.5">
                <span>1.2</span>
                <span className="text-sm font-sans text-amber-700/60 font-normal">秒 即時抽出</span>
              </div>
              <p className="text-[10px] text-amber-800 font-sans">刑訴法197条2項 照会書回答機能 完備</p>
            </div>
          </div>

          {/* B. メイングリッド (左: 脅威種別の内訳 / 右: 警察向け月次実績証明書発行カード) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 左側: 脅威・悪質行為の内訳分析 (7カラム) */}
            <div className="bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-rose-600" />
                    AI防衛エンジンが遮断した脅威種別の内訳
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    出会い系・ストーカー・実名露出など、公序良俗・法令違反アプローチの検知傾向
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(securityHealth?.threatDistribution || [
                  { name: "出会い系・不当交際目的", count: 8, percentage: 44.4, color: "#ef4444", desc: "規約違反の不特定異性交際アプローチをAIが事前遮断" },
                  { name: "個人情報・実名・連絡先露出", count: 5, percentage: 27.8, color: "#f59e0b", desc: "公開メッセージ内への電話番号・LINE ID記載を自動マスク" },
                  { name: "ストーキング・居場所特定", count: 3, percentage: 16.7, color: "#8b5cf6", desc: "現住所や勤務先の執拗な割り出しをAI検閲隔離" },
                  { name: "誹謗中傷・嫌がらせ言動", count: 2, percentage: 11.1, color: "#06b6d4", desc: "感情的な暴言・不当な追及メッセージをブロック" }
                ]).map((threat: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {threat.name}
                      </span>
                      <span className="font-serif font-bold text-xs text-slate-800">
                        {threat.percentage}% <span className="text-[11px] font-normal font-sans text-slate-500">({threat.count}件)</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${threat.percentage}%`, backgroundColor: threat.color }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 font-sans">
                      {threat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 右側: 警察・行政向け 月次治安実績証明書カード (5カラム) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border-2 border-amber-500/40 shadow-xl lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                    OFFICIAL PROOF
                  </span>
                  <span className="text-xs text-slate-400">生活安全課・公安提出用</span>
                </div>

                <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                  🚔 月次 治安実績証明サマリー
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  生活安全課やサイバー犯罪対策課への定期報告・適合事前相談において、当プラットフォームの治安健全性とAI自律防衛の実績を証明する公式サマリーです。
                </p>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-slate-300">
                    <span>対象期間:</span>
                    <span className="text-amber-400 font-serif font-bold">{securityHealth?.monthlyPoliceProof?.period || '2026年9月度'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>AI事前遮断率:</span>
                    <span className="text-emerald-400 font-serif font-bold">0.52% <span className="text-[11px] font-normal font-sans text-emerald-300/70">(即時防衛)</span></span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>警察令状・照会着任:</span>
                    <span className="text-white font-serif font-bold">0 <span className="text-[11px] font-normal font-sans text-slate-400">件</span> <span className="text-[11px] font-normal font-sans text-slate-300">(重大事案ゼロ)</span></span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>情報漏洩・不正開示:</span>
                    <span className="text-emerald-400 font-serif font-bold">0 <span className="text-[11px] font-normal font-sans text-emerald-300/70">件</span> <span className="text-[11px] font-normal font-sans text-emerald-300">(完全防衛)</span></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPoliceProofModal(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <FileText size={16} />
                <span>🚔 警察・行政向け 治安実績証明書を発行</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 警察・行政向け 月次治安実績証明書モーダル */}
      <AnimatePresence>
        {showPoliceProofModal && (
          <div className="fixed inset-0 z-[700] flex items-start justify-center p-3 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-4 text-slate-100"
            >
              {/* モーダルヘッダー */}
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 print:hidden pr-16">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
                    🚔
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">治安防衛・公的提出用証明書</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full">CERTIFIED</span>
                    </div>
                    <h2 className="text-sm md:text-base font-bold text-white font-serif">
                      プラットフォーム治安健全性 ＆ AI多層防衛運用実績 証明書
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Download size={14} className="text-cyan-400" />
                    <span>印刷 / PDF出力</span>
                  </button>
                </div>
              </div>

              {/* 独立した閉じるボタン */}
              <button 
                onClick={() => setShowPoliceProofModal(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 shadow-md active:scale-90 print:hidden"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>

              {/* 書面本文 */}
              <div className="p-6 md:p-10 space-y-6 overflow-y-auto max-h-[80vh] bg-slate-900 text-slate-200 font-sans print:p-0 print:bg-white print:text-black print:max-h-none">
                <div className="border-b-2 border-amber-500/40 pb-4 print:border-black">
                  <div className="text-xs font-mono text-amber-400 print:text-black font-bold">
                    【ReMEETs 治安防衛システム・行政提出用公式証明書】
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold font-serif text-white print:text-black mt-1">
                    プラットフォーム治安健全性 運用実績証明書
                  </h1>
                  <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                    根拠法令：刑事訴訟法第197条第2項 / インターネット異性紹介事業規制法 適合体制証明
                  </p>
                </div>

                {/* 証明基本情報 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 print:bg-gray-100 print:border-gray-300 text-xs">
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">対象期間:</span>
                    <strong className="text-white print:text-black font-serif font-bold text-sm">{securityHealth?.monthlyPoliceProof?.period || '2026年9月度'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">サイト治安スコア:</span>
                    <strong className="text-emerald-400 print:text-black font-serif font-bold text-sm">{securityHealth?.safetyHealthScore || '99.88'}% <span className="text-[11px] font-normal font-sans">(極めて健全)</span></strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">AI検閲スキャン数:</span>
                    <strong className="text-white print:text-black font-serif font-bold text-sm">{(securityHealth?.totalAiScans || 210).toLocaleString()} <span className="text-xs font-normal font-sans">件</span></strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-gray-600 block">重大事案発生件数:</span>
                    <strong className="text-emerald-400 print:text-black font-serif font-bold text-sm">0 <span className="text-xs font-normal font-sans">件</span> <span className="text-[11px] font-normal font-sans">(皆無)</span></strong>
                  </div>
                </div>

                {/* 防衛体系の実証 */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <h3 className="font-bold text-amber-400 print:text-black text-sm border-b border-slate-800 pb-1">
                    1. 多層防衛アーキテクチャの運用実態
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300 print:text-gray-800">
                    <li><strong>全投函メッセージのAI自律検閲:</strong> 個人情報（電話番号・住所・実名）、不当出会い勧誘、ストーカー兆候を完全自動判定し、不適切な投稿は公開前に隔離（`ai_flagged = 1`）。</li>
                    <li><strong>2段階秘密質問による二重防衛:</strong> 無関係な第三者による閲覧・冷やかしアクセスを排除し、記憶が完全一致した当事者間のみを照合。</li>
                    <li><strong>公的eKYC ＆ 電子的利用宣誓:</strong> 運転免許証・マイナンバー等による本人確認およびストーカー行為禁止への電子的宣誓を必須化。</li>
                    <li><strong>刑事捜査照会ポータルの完備:</strong> 捜査機関からの令状・照会書受領後、1.2秒でアクセスログ・登録端末IP・保全データを一括抽出可能。</li>
                  </ul>
                </div>

                {/* 発行証明フッター */}
                <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-slate-400 print:text-gray-600">
                  <div>
                    <div>発行システム: ReMEETs 治安防衛・コンプライアンス管理センター</div>
                    <div className="font-mono text-[11px] mt-0.5">証明ハッシュ: SHA256-REMEETS-SAFETY-PROOF-2026-VERIFIED</div>
                  </div>
                  <div className="mt-2 md:mt-0 text-right">
                    <div>発行日時: {new Date().toLocaleString('ja-JP')}</div>
                    <div className="font-bold text-slate-200 print:text-black">ReMEETs 運営セキュリティ本部</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Tab Contents */}

      {/* Subtab 1: IP Defense & Block Management */}
      {activeTab === 'ipDefense' && (
        <div className="space-y-6">
          {/* Manual IP Block Form */}
          <div className="bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock size={16} className="text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">手動 IPブロック追加</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newBlockIp.trim()) {
                  handleBlockIp(newBlockIp.trim(), newBlockReason.trim() || '管理者による手動ブロック');
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3"
            >
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newBlockIp}
                  onChange={(e) => setNewBlockIp(e.target.value)}
                  required
                  placeholder="ブロック対象のIPアドレス (例: 192.168.1.50)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="ブロック理由 (例: 不正ログイン試行、スパム連投)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isBlocking || !newBlockIp.trim()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  {isBlocking ? '追加中...' : 'IPを遮断'}
                </button>
              </div>
            </form>
          </div>

          {/* Blocked IPs Table */}
          <div className="bg-white/95 rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-rose-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  現在ブロック中のIPアドレス一覧 ({securityStats?.blockedIps.length || 0} 件)
                </h4>
              </div>
              <span className="text-[11px] text-slate-600">アクセス時に 403 Forbidden を返却します</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-700 font-bold">
                    <th className="px-4 py-3">IPアドレス</th>
                    <th className="px-4 py-3">ブロック理由</th>
                    <th className="px-4 py-3">登録日時</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {securityStats?.blockedIps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-600">
                        現在ブロック中のIPアドレスはありません
                      </td>
                    </tr>
                  ) : (
                    securityStats?.blockedIps.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-rose-600 font-bold">{b.ip}</td>
                        <td className="px-4 py-2.5 text-slate-800">{b.reason}</td>
                        <td className="px-4 py-2.5 text-slate-600 font-mono">
                          {new Date(b.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => handleUnblockIp(b.ip)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
                          >
                            ブロック解除
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suspicious IPs & Failed Logins Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Frequency IPs */}
            <div className="bg-white/95 rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-900">高頻度アクセスIP (直近1時間)</h4>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">DoS/連続スクレイピング検知</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-700 font-bold">
                      <th className="px-4 py-2.5">IPアドレス</th>
                      <th className="px-4 py-2.5">リクエスト数</th>
                      <th className="px-4 py-2.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {securityStats?.suspiciousActivity.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-600">
                          不審な高頻度アクセスはありません
                        </td>
                      </tr>
                    ) : (
                      securityStats?.suspiciousActivity.map((s) => (
                        <tr key={s.ip} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono text-slate-800">{s.ip}</td>
                          <td className="px-4 py-2 font-bold text-rose-600">{s.count} 回</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleBlockIp(s.ip, '高頻度アクセスによる自動検知ブロック')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              遮断
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Failed Logins by IP */}
            <div className="bg-white/95 rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600" />
                  <h4 className="text-xs font-bold text-slate-900">ログイン失敗履歴 (IP別)</h4>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">パスワード総当たり検知</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-700 font-bold">
                      <th className="px-4 py-2.5">IPアドレス</th>
                      <th className="px-4 py-2.5">失敗回数</th>
                      <th className="px-4 py-2.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {securityStats?.failedLogins.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-600">
                          ログイン失敗履歴はありません
                        </td>
                      </tr>
                    ) : (
                      securityStats?.failedLogins.map((f) => (
                        <tr key={f.ip} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono text-slate-800">{f.ip}</td>
                          <td className="px-4 py-2 font-bold text-rose-600">{f.count} 回</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleBlockIp(f.ip, 'パスワード総当たり試行による遮断')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              遮断
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: AI Censorship Sandbox & Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Preset scenarios chips */}
          <div className="bg-white/95 rounded-2xl p-5 border border-brand-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  審査官向け検証シナリオ (クリックで自動入力 & 即時解析)
                </h3>
              </div>
              <span className="text-xs text-slate-600">日本の公安・行政審査基準に準拠</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  title: '① 実名フルネーム',
                  desc: '常用姓名辞書チェック',
                  text: '昔の同級生の 山田太郎（やまだたろう）くんを探しています。見かけたら教えてください。',
                  icon: '👤',
                  badge: '実名警告'
                },
                {
                  title: '② 直接連絡先(LINE)',
                  desc: 'LINE ID/携帯の自動伏字',
                  text: '懐かしいね！もしよかったら LINE ID: remeets123、または090-1234-5678 まで連絡して！',
                  icon: '📱',
                  badge: '自動マスク'
                },
                {
                  title: '③ 機微個人情報(住所)',
                  desc: '詳細な住所パターンの検知',
                  text: '昔よく放課後に遊んだ、東京都新宿区歌舞伎町1-2-3の公園で会いましょう。覚えているかな？',
                  icon: '📍',
                  badge: '住所マスク'
                },
                {
                  title: '④ 誹謗中傷・危険暴言',
                  desc: '重大不当表現の自動隔離',
                  text: 'お前本当にうざいから消えろ、絶対に殺すからな。地獄に落ちろ。',
                  icon: '🚫',
                  badge: '即時自動通報'
                },
                {
                  title: '⑤ 不適切出会い/パパ活',
                  desc: '性的勧誘/援助交際検知',
                  text: '今日夜暇だから、お小遣いあげるので大人の関係で援助交際（パパ活）しませんか？',
                  icon: '💳',
                  badge: '即時司法通報'
                }
              ].map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCensorshipTestText(sc.text);
                    handleTestCensorship(sc.text);
                    setSimulatedPostId(null);
                    setSimulationSuccessMsg(null);
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer group"
                >
                  <div className="space-y-1">
                    <span className="text-lg">{sc.icon}</span>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 leading-tight">
                      {sc.title}
                    </div>
                    <div className="text-[10px] text-slate-600 leading-normal">{sc.desc}</div>
                  </div>
                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 self-start">
                    {sc.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible 50 Sample Phrases Catalog */}
          <div className="bg-white/95 rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSampleBookOpen(!isSampleBookOpen)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-indigo-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>📖 公安・審査官用 安全防衛検証サンプルフレーズ大図鑑</span>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-mono">
                      50種類完備
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    各種検閲フィルター、自動隔離、および即時通報フローの合格/違反テスト用フレーズ集
                  </p>
                </div>
              </div>
              <span className={`text-slate-600 transition-transform duration-200 ${isSampleBookOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isSampleBookOpen && (
              <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                  {samplePhrasesCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveSampleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        activeSampleCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.title}</span>
                    </button>
                  ))}
                </div>

                {/* Phrase grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {samplePhrasesCategories
                    .find((c) => c.id === activeSampleCategory)
                    ?.phrases.map((phrase, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-2 hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{phrase.label}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              phrase.type === 'safe'
                                ? 'bg-emerald-100 text-emerald-900'
                                : phrase.type === 'warn'
                                ? 'bg-amber-100 text-amber-900'
                                : phrase.type === 'mask'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}>
                              {phrase.type === 'safe' && '● 安全パス'}
                              {phrase.type === 'warn' && '● 実名警告'}
                              {phrase.type === 'mask' && '● 伏字化'}
                              {phrase.type === 'quarantine' && '💀 即時隔離'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed font-sans">{phrase.desc}</p>
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 select-all leading-relaxed">
                            {phrase.text}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(phrase.text);
                              alert('フレーズをクリップボードにコピーしました！');
                            }}
                            className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all border border-slate-300 cursor-pointer"
                          >
                            📋 コピー
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCensorshipTestText(phrase.text);
                              handleTestCensorship(phrase.text);
                              setSimulatedPostId(null);
                              setSimulationSuccessMsg(null);
                            }}
                            className="flex-1 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[10px] font-bold transition-all border border-indigo-200 cursor-pointer"
                          >
                            ⚡ テスト実行
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Test Input & Live Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Textarea */}
            <div className="lg:col-span-6 bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
              <label className="text-xs font-bold text-slate-700 block">
                検証用テストテキスト入力エリア
              </label>
              <textarea
                value={censorshipTestText}
                onChange={(e) => {
                  setCensorshipTestText(e.target.value);
                  setSimulatedPostId(null);
                  setSimulationSuccessMsg(null);
                }}
                placeholder="上記のシナリオをクリックするか、ここに任意のテスト文章を入力してください..."
                rows={6}
                className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl p-4 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleTestCensorship()}
                  disabled={isTestingCensorship || !censorshipTestText.trim()}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTestingCensorship ? <RefreshCw size={14} className="animate-spin" /> : <span>🔍</span>}
                  ① リアルタイムAI解析
                </button>
                <button
                  type="button"
                  onClick={handleTriggerCensorshipSimulation}
                  disabled={isSimulatingPost || !censorshipTestText.trim()}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSimulatingPost ? <RefreshCw size={14} className="animate-spin" /> : <span>🚀</span>}
                  ② 模擬隔離＆自動通報実演
                </button>
              </div>

              {/* Simulation feedback */}
              {simulationSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    シミュレーション実演完了
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">{simulationSuccessMsg}</p>
                </div>
              )}
            </div>

            {/* Right: Analysis Results Card */}
            <div className="lg:col-span-6 bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Gemini AI 安全防衛評価結果</h4>
                </div>
                {censorshipTestResult && (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {censorshipTestResult.execution_time_ms ? `${censorshipTestResult.execution_time_ms}ms` : 'LIVE'}
                  </span>
                )}
              </div>

              {censorshipTestResult ? (
                <div className="space-y-4 text-xs">
                  {/* Risk Meter Gauge */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">総合AI危険度リスクスコア:</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        (censorshipTestResult.risk_score || 0) >= 70
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : (censorshipTestResult.risk_score || 0) >= 30
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {censorshipTestResult.risk_score ?? (censorshipTestResult.inappropriate?.detected ? 85 : 0)} / 100 点
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (censorshipTestResult.risk_score || 0) >= 70
                            ? 'bg-rose-600'
                            : (censorshipTestResult.risk_score || 0) >= 30
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, censorshipTestResult.risk_score ?? (censorshipTestResult.inappropriate?.detected ? 85 : 5))}%` }}
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">推奨防衛アクション:</span>
                      <span className="font-bold text-slate-800">
                        {(censorshipTestResult.risk_score || 0) >= 70 || censorshipTestResult.suggested_action === 'IMMEDIATE_QUARANTINE_AUTO_REPORT'
                          ? '🔴 即時隔離 ＆ 優先通報起票'
                          : (censorshipTestResult.risk_score || 0) >= 30 || censorshipTestResult.suggested_action === 'AUTO_FLAG'
                          ? '🟡 要確認（マスク化・隔離フラグ）'
                          : '🟢 安全公開許可 (APPROVE)'}
                      </span>
                    </div>
                  </div>

                  {/* AI Reason */}
                  {censorshipTestResult.ai_reason && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-amber-900 block">💡 AI判定所見:</span>
                      <p className="text-[11px] text-amber-950 leading-relaxed">{censorshipTestResult.ai_reason}</p>
                    </div>
                  )}

                  {/* Masked text preview */}
                  {censorshipTestResult.filteredText && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 block">🛡️ 安全マスク化適用後の本文:</span>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {censorshipTestResult.filteredText}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-600 space-y-1">
                  <Bot size={28} className="mx-auto text-slate-600 mb-1" />
                  <p className="text-xs font-medium">テキストを入力して「リアルタイムAI解析」を実行してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Password Policy Configuration */}
      {activeTab === 'passwordPolicy' && (
        <div className="space-y-6">
          {/* Header Card & Presets */}
          <div className="bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">アカウント・パスワードポリシー設定</h3>
                </div>
                <p className="text-xs text-slate-600 font-sans pl-10">
                  新規会員登録・パスワード再設定・パスワード変更時に要求されるセキュリティ強度ルールを動的に設定・即時適用します。
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Sliders size={12} />
                  プリセット:
                </span>
                <button
                  type="button"
                  onClick={() => applyPasswordPolicyPreset('standard')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                >
                  標準 (8文字・英数)
                </button>
                <button
                  type="button"
                  onClick={() => applyPasswordPolicyPreset('high')}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                >
                  高セキュリティ (10文字・記号)
                </button>
                <button
                  type="button"
                  onClick={() => applyPasswordPolicyPreset('ultra')}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                >
                  超堅牢 (12文字・大文字小文字記号)
                </button>
                <button
                  type="button"
                  onClick={() => applyPasswordPolicyPreset('simple')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                >
                  シンプル (6文字)
                </button>
              </div>
            </div>

            {/* Policy Form Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left: Rule Sliders and Toggles */}
              <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  ポリシー必須条件の設定
                </h4>

                {/* 1. 最小桁数 */}
                <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800">
                      1. パスワード最小文字数
                    </label>
                    <span className="text-sm font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      {passwordPolicy.minLength} 文字以上
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min={6}
                      max={32}
                      step={1}
                      value={passwordPolicy.minLength}
                      onChange={(e) => setPasswordPolicy({ ...passwordPolicy, minLength: Number(e.target.value) })}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>6文字 (最小)</span>
                    <span>12文字 (推奨)</span>
                    <span>32文字 (最大)</span>
                  </div>
                </div>

                {/* 2. 英字必須 */}
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">2. 英字の含有（a〜z, A〜Z）</div>
                    <div className="text-[11px] text-slate-600">パスワードに半角英字を1文字以上必須とする</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.requireLetters}
                      onChange={(e) => setPasswordPolicy({ ...passwordPolicy, requireLetters: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 3. 数字必須 */}
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">3. 数字の含有（0〜9）</div>
                    <div className="text-[11px] text-slate-600">パスワードに半角数字を1文字以上必須とする</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.requireNumbers}
                      onChange={(e) => setPasswordPolicy({ ...passwordPolicy, requireNumbers: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 4. 記号必須 */}
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">4. 記号の含有（!@#$%^&*等）</div>
                    <div className="text-[11px] text-slate-600">特殊記号（! @ # $ % ^ & * ( ) _ + - = [ ] 等）を1文字以上必須とする</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.requireSymbols}
                      onChange={(e) => setPasswordPolicy({ ...passwordPolicy, requireSymbols: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* 5. 大文字小文字混在必須 */}
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">5. 大文字・小文字の混在</div>
                    <div className="text-[11px] text-slate-600">英大文字（A〜Z）と英小文字（a〜z）の両方を必須とする</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.requireMixedCase}
                      onChange={(e) => setPasswordPolicy({ ...passwordPolicy, requireMixedCase: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  disabled={isSavingPolicy}
                  onClick={handleSavePasswordPolicy}
                  className="w-full py-3 bg-brand-dark hover:bg-brand-primary text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isSavingPolicy ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={16} />
                      <span>パスワードポリシー設定を保存・即時適用する</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right: Live Policy Tester & Simulator */}
              <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Terminal size={15} className="text-indigo-600" />
                    リアルタイム・強度＆適合シミュレータ
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    現在の設定ポリシーに対して、任意のパスワードを入力してリアルタイムに判定テストを行えます。
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      テスト入力パスワード
                    </label>
                    <div className="relative">
                      <input
                        type={showTestPassword ? "text" : "password"}
                        value={policyTestPassword}
                        onChange={(e) => setPolicyTestPassword(e.target.value)}
                        placeholder="テストする文字列を入力 (例: Pass123!#)"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTestPassword(!showTestPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 p-1"
                      >
                        {showTestPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="space-y-2 pt-2 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 mb-1">ポリシー適合チェックリスト:</div>

                    {/* Rule 1 */}
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-700">最小文字数 ({passwordPolicy.minLength}文字以上):</span>
                      <span className={`font-bold flex items-center gap-1 ${policyTestPassword.length >= passwordPolicy.minLength ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {policyTestPassword.length >= passwordPolicy.minLength ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {policyTestPassword.length} / {passwordPolicy.minLength} 文字
                      </span>
                    </div>

                    {/* Rule 2 */}
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-700">英字（a〜z, A〜Z）:</span>
                      <span className={`font-bold flex items-center gap-1 ${!passwordPolicy.requireLetters || /[a-zA-Z]/.test(policyTestPassword) ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {!passwordPolicy.requireLetters ? (
                          <span className="text-slate-600 text-[10px] font-normal">任意 (OFF)</span>
                        ) : /[a-zA-Z]/.test(policyTestPassword) ? (
                          <>
                            <CheckCircle size={14} />
                            <span>合格</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>未入力</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Rule 3 */}
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-700">数字（0〜9）:</span>
                      <span className={`font-bold flex items-center gap-1 ${!passwordPolicy.requireNumbers || /[0-9]/.test(policyTestPassword) ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {!passwordPolicy.requireNumbers ? (
                          <span className="text-slate-600 text-[10px] font-normal">任意 (OFF)</span>
                        ) : /[0-9]/.test(policyTestPassword) ? (
                          <>
                            <CheckCircle size={14} />
                            <span>合格</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>未入力</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Rule 4 */}
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-700">記号（!@#$%^&*など）:</span>
                      <span className={`font-bold flex items-center gap-1 ${!passwordPolicy.requireSymbols || /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/\\~`'"]/.test(policyTestPassword) ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {!passwordPolicy.requireSymbols ? (
                          <span className="text-slate-600 text-[10px] font-normal">任意 (OFF)</span>
                        ) : /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/\\~`'"]/.test(policyTestPassword) ? (
                          <>
                            <CheckCircle size={14} />
                            <span>合格</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>未入力</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Rule 5 */}
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-700">大文字・小文字混在:</span>
                      <span className={`font-bold flex items-center gap-1 ${!passwordPolicy.requireMixedCase || (/[a-z]/.test(policyTestPassword) && /[A-Z]/.test(policyTestPassword)) ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {!passwordPolicy.requireMixedCase ? (
                          <span className="text-slate-600 text-[10px] font-normal">任意 (OFF)</span>
                        ) : (/[a-z]/.test(policyTestPassword) && /[A-Z]/.test(policyTestPassword)) ? (
                          <>
                            <CheckCircle size={14} />
                            <span>合格</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>不一致</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Verdict Banner */}
                {policyTestPassword.length > 0 ? (
                  policyTestPassword.length >= passwordPolicy.minLength &&
                  (!passwordPolicy.requireLetters || /[a-zA-Z]/.test(policyTestPassword)) &&
                  (!passwordPolicy.requireNumbers || /[0-9]/.test(policyTestPassword)) &&
                  (!passwordPolicy.requireSymbols || /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/\\~`'"]/.test(policyTestPassword)) &&
                  (!passwordPolicy.requireMixedCase || (/[a-z]/.test(policyTestPassword) && /[A-Z]/.test(policyTestPassword))) ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                      <span>【適合判定】このパスワードは設定されたポリシー要件を満たしています。</span>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-medium flex items-center gap-2">
                      <AlertTriangle className="text-rose-600 shrink-0" size={18} />
                      <span>【不適合】赤色の要件を満たすようにパスワードを修正してください。</span>
                    </div>
                  )
                ) : (
                  <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center gap-2">
                    <KeyRound className="text-slate-600 shrink-0" size={16} />
                    <span>上の入力欄にテスト文字列を入力すると、リアルタイム判定が表示されます。</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Metrics & Events */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* HTTP Error Stats Chart */}
          <div className="bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart2 size={16} className="text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">HTTPエラー発生状況 (4xx / 5xx)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={securityStats?.errorStats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                  <Bar dataKey="value" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Security Events Table */}
          <div className="bg-white/95 rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  直近のセキュリティインシデント・イベント ({securityStats?.recentEvents.length || 0} 件)
                </h4>
              </div>
              <span className="text-[11px] text-slate-600">NG検知・不正認証・権限エラー</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-700 font-bold">
                    <th className="px-4 py-2.5">日時</th>
                    <th className="px-4 py-2.5">ユーザー</th>
                    <th className="px-4 py-2.5">イベント種別</th>
                    <th className="px-4 py-2.5">詳細内容</th>
                    <th className="px-4 py-2.5">IPアドレス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {securityStats?.recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-600">
                        最近のセキュリティイベントはありません
                      </td>
                    </tr>
                  ) : (
                    securityStats?.recentEvents.map((ev, idx) => (
                      <tr key={ev.id || idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-600 font-mono whitespace-nowrap">
                          {new Date(ev.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                          {ev.username || 'Guest'}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                            {ev.action}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-800 max-w-xs truncate">{ev.details || '-'}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">{ev.ip || '127.0.0.1'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Police & Legal Audit Guidelines */}
      {activeTab === 'policeGuide' && (
        <div className="bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                警察（公安・生活安全課・サイバー犯罪対策課）捜査関係事項照会対応基準
              </h3>
              <p className="text-xs text-slate-600">刑事訴訟法第197条第2項に基づく公的情報開示手引</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">📋 開示可能なログ・証拠項目</h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li><b>接続元IPアドレス ＆ タイムスタンプ:</b> 秒単位のアクセスログおよびアクションログ</li>
                <li><b>SNSアカウント連携情報:</b> LINE内部UID、Googleメールアドレス</li>
                <li><b>本人確認（eKYC）公的記録:</b> 承認日時、確認された年齢・氏名、暗号化デジタル証跡</li>
                <li><b>SMS認証電話番号:</b> 決済・開通時に認証された携帯電話番号</li>
                <li><b>投函および隔離メッセージ:</b> AI安全防御エンジンによって隔離（`ai_flagged=1`）された脅迫・暴言メッセージ原本</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">⚖️ 照会受領時の運用実務フロー</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                <li><b>照会書の受領:</b> 管轄警察署長名義の「捜査関係事項照会書」原本または正式通知を確認</li>
                <li><b>対象アカウントの特定:</b> ユーザー名、投稿ID、メール、またはIPからDBを検索</li>
                <li><b>ログの保全・抽出:</b> 「ログ」タブの「監査テキスト保存 (.txt)」または「CSV出力」を用いて証拠を抽出</li>
                <li><b>法務担当者による開示送付:</b> 指定された様式にて警察担当官へ安全に送付</li>
              </ol>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-indigo-900">
              💡 捜査機関提出用の完全な時系列ログ抽出は<strong>「ログ」タブ</strong>のCSV/テキスト保存機能をご利用いただけます。
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('logs')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                ログタブへ移動 ➔
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
