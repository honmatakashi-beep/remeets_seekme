import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Send, 
  Megaphone, 
  AlertTriangle, 
  Sparkles, 
  Gift, 
  RefreshCw, 
  CheckCircle2, 
  History, 
  Trash2, 
  ExternalLink, 
  Users, 
  Eye, 
  Copy, 
  Search, 
  Mail, 
  Smartphone, 
  ArrowRight, 
  Clock, 
  BarChart2, 
  ShieldAlert, 
  FileText, 
  Zap,
  Wrench,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface BroadcastItem {
  id: number | string;
  title?: string | null;
  category: 'general' | 'maintenance' | 'feature' | 'security' | 'campaign';
  priority: 'normal' | 'important' | 'urgent';
  channels: { inApp: boolean; email: boolean };
  target_segment: 'all' | 'verified' | 'unverified' | 'active_posts' | 'active_disclosure';
  content: string;
  full_message?: string;
  link?: string | null;
  user_count: number;
  read_count: number;
  created_at: string;
}

interface PresetTemplate {
  id: string;
  name: string;
  category: 'general' | 'maintenance' | 'feature' | 'security' | 'campaign';
  priority: 'normal' | 'important' | 'urgent';
  title: string;
  content: string;
  link: string;
  channels: { inApp: boolean; email: boolean };
  description: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'maintenance',
    name: '🔧 定期システムメンテナンス',
    category: 'maintenance',
    priority: 'important',
    title: '【重要】定期システムメンテナンス実施のお知らせ',
    content: `いつもReMEETsをご利用いただきありがとうございます。
サービスの安定稼働およびセキュリティ基盤強化のため、下記日程にて定期システムメンテナンスを実施いたします。

■ メンテナンス実施予定日時:
2026年9月15日(火) 午前 2:00 〜 午前 5:00 (JST)

※ メンテナンス実施中は、Webサイトへのアクセス、想い出のボトルメール検索・投稿、および連絡先開示機能が一時的にご利用いただけなくなります。
ご利用の皆様にはご不便をおかけいたしますが、何卒ご理解とご協力のほどよろしくお願い申し上げます。`,
    link: '',
    channels: { inApp: true, email: true },
    description: '深夜の定期保守・DBアップデート時の全ユーザー向け事前告知'
  },
  {
    id: 'terms_update',
    name: '📜 利用規約・プライバシーポリシー改定',
    category: 'security',
    priority: 'important',
    title: '【重要】利用規約およびプライバシーポリシー改定のお知らせ',
    content: `いつもReMEETsをご利用いただき誠にありがとうございます。
当サービスでは、皆様により安心・安全に想い出の再会をお楽しみいただけるよう、利用規約およびプライバシーポリシーの一部を改訂いたしました。

■ 改訂日: 2026年9月10日
■ 主な改訂内容:
1. 本人確認（eKYC）手続きおよびSNSアカウント連携における個人情報保護方針の明確化
2. いたずら・迷惑行為・なりすまし防止規約の厳格化
3. 開通手数料および安全決済フローのガイドライン更新

今後ともReMEETsをよろしくお願い申し上げます。`,
    link: '/terms',
    channels: { inApp: true, email: false },
    description: '法務・規約改定に伴う周知アナウンス（規約ページリンク付き）'
  },
  {
    id: 'feature_release',
    name: '✨ 新機能リリース・再会照合向上',
    category: 'feature',
    priority: 'normal',
    title: '✨ 新機能：想い出の検索・照合機能がさらにパワーアップしました！',
    content: `いつもReMEETsをご利用いただきありがとうございます。
この度、より多くの方々が懐かしい人との再会を果たせるよう、検索・照合エンジンを大幅にアップデートいたしました！

■ 今回のアップデート内容:
・都道府県・年代・カテゴリによる絞り込み検索の精度と表示速度の向上
・想い出クイズ（秘密の質問）の入力サポート機能の追加
・通知一覧およびマイページの視認性・操作性改善

ぜひ、あなたの懐かしい想い出のボトルメールを探してみてください。`,
    link: '/search',
    channels: { inApp: true, email: false },
    description: '機能改善や新UI公開時のユーザー活性化プロモーション'
  },
  {
    id: 'security_alert',
    name: '⚠️ 不審な連絡・詐欺防止の注意喚起',
    category: 'security',
    priority: 'urgent',
    title: '【防犯・安全注意】ReMEETsを安全にご利用いただくためのお願い',
    content: `ReMEETs運営事務局より、安全なご利用に関する大切なお願いです。

ReMEETs内において、外部サイトへの不審な誘導や個人情報の不正取得、金銭の要求を行う悪質な行為は利用規約により厳重に禁止されています。

■ ご注意いただきたい点:
・不審な外部URLや他社メッセージアプリへの安易な誘導には応じないでください
・身に覚えのない金銭要求や怪しい投資話には絶対に応じないでください

少しでも不審なメッセージやユーザーを見かけた場合は、メッセージ画面の「通報する」ボタンより速やかにご報告ください。AIおよび運営チームが直ちに調査・対処いたします。`,
    link: '/guidelines',
    channels: { inApp: true, email: true },
    description: '外部誘導・金銭トラブル等を抑止するための緊急セキュリティ警告'
  },
  {
    id: 'campaign',
    name: '🌸 想い出の再会応援キャンペーン',
    category: 'campaign',
    priority: 'normal',
    title: '🌸 想い出の再会応援キャンペーン開催中',
    content: `懐かしいあの人へ、もう一度言葉を届けてみませんか？

ReMEETsでは現在、想い出のボトルメール投稿を応援する特別キャンペーンを実施中です。
小学校・中学校・高校の同級生、昔の恩師、旅先で出会ったあの人へ——心の奥にある感謝や思い出を手紙に託して海へ流してみましょう。

今なら想い出クイズを作成して投稿されたボトルメールが、より届きやすくなる特別なハイライト表示も実施中です。`,
    link: '/compose',
    channels: { inApp: true, email: false },
    description: 'ボトルメールの投稿促進・再会機会を盛り上げるイベント告知'
  }
];

export const AdminBroadcastView: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [targetSegment, setTargetSegment] = useState<'all' | 'verified' | 'unverified' | 'active_posts' | 'active_disclosure'>('all');
  const [segmentCount, setSegmentCount] = useState<number | null>(null);
  const [category, setCategory] = useState<'general' | 'maintenance' | 'feature' | 'security' | 'campaign'>('general');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [channels, setChannels] = useState<{ inApp: boolean; email: boolean }>({ inApp: true, email: false });

  // Modal / UI State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [broadcastPage, setBroadcastPage] = useState<number>(1);
  const [broadcastPerPage, setBroadcastPerPage] = useState<number>(10);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const token = localStorage.getItem('token');

  // Load broadcasts
  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/broadcasts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch segment user count
  const fetchSegmentCount = async (segment: string) => {
    try {
      const res = await fetch(`/api/admin/broadcasts/segment-preview?segment=${segment}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSegmentCount(data.count ?? 0);
      }
    } catch (err) {
      console.error('Failed to fetch segment preview:', err);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    fetchSegmentCount(targetSegment);
  }, []);

  useEffect(() => {
    fetchSegmentCount(targetSegment);
  }, [targetSegment]);

  // Handle Preset selection
  const handleSelectPreset = (preset: PresetTemplate) => {
    setCategory(preset.category);
    setPriority(preset.priority);
    setTitle(preset.title);
    setContent(preset.content);
    setLink(preset.link);
    setChannels(preset.channels);
    setStatusMsg({ text: `定型文「${preset.name}」をフォームに反映しました`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Form submit handler
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setStatusMsg({ text: 'お知らせの本文を入力してください', type: 'error' });
      return;
    }
    if (!channels.inApp && !channels.email) {
      setStatusMsg({ text: '配信チャネル（アプリ内通知またはメール）を最低1つ選択してください', type: 'error' });
      return;
    }
    if (link && !link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('/')) {
      setStatusMsg({ text: 'リンクURLは http://, https:// または / から始まる形式で入力してください', type: 'error' });
      return;
    }
    setShowConfirmModal(true);
  };

  // Execute broadcast
  const handleExecuteBroadcast = async () => {
    if (!token) return;
    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/bulk-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content: content.trim(),
          link: link.trim() || undefined,
          category,
          priority,
          channels,
          targetSegment
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowConfirmModal(false);
        setStatusMsg({ text: `🎉 一括配信を完了しました（対象: ${data.count} 名）`, type: 'success' });
        // Reset form
        setTitle('');
        setContent('');
        setLink('');
        setCategory('general');
        setPriority('normal');
        setChannels({ inApp: true, email: false });
        // Refresh history
        fetchBroadcasts();
      } else {
        setStatusMsg({ text: data.error || '配信処理中にエラーが発生しました', type: 'error' });
      }
    } catch (err) {
      console.error('Error executing broadcast:', err);
      setStatusMsg({ text: '通信エラーが発生しました', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  // Delete broadcast
  const handleDeleteBroadcast = async (broadcast: BroadcastItem) => {
    if (!window.confirm('この一括配信を履歴から削除しますか？\n（※ユーザーの未読通知一覧からも消去されます）')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: typeof broadcast.id === 'number' ? broadcast.id : undefined,
          content: broadcast.content,
          created_at: broadcast.created_at
        })
      });

      if (res.ok) {
        setStatusMsg({ text: '配信履歴と関連通知を削除しました', type: 'success' });
        fetchBroadcasts();
      } else {
        setStatusMsg({ text: '削除に失敗しました', type: 'error' });
      }
    } catch (err) {
      console.error('Failed to delete broadcast:', err);
      setStatusMsg({ text: '通信エラーが発生しました', type: 'error' });
    } finally {
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalCount = broadcasts.length;
    const totalReach = broadcasts.reduce((acc, b) => acc + (b.user_count || 0), 0);
    const totalReads = broadcasts.reduce((acc, b) => acc + (b.read_count || 0), 0);
    const avgReadRate = totalReach > 0 ? Math.round((totalReads / totalReach) * 100) : 0;
    return { totalCount, totalReach, totalReads, avgReadRate };
  }, [broadcasts]);

  // Filtered broadcasts
  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter(b => {
      const matchSearch = 
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.link || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = filterCategory === 'all' || b.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [broadcasts, searchQuery, filterCategory]);

  const totalBroadcastPages = Math.max(1, Math.ceil(filteredBroadcasts.length / broadcastPerPage));
  const safeBroadcastPage = Math.min(Math.max(1, broadcastPage), totalBroadcastPages);
  const paginatedBroadcasts = useMemo(() => {
    const start = (safeBroadcastPage - 1) * broadcastPerPage;
    return filteredBroadcasts.slice(start, start + broadcastPerPage);
  }, [filteredBroadcasts, safeBroadcastPage, broadcastPerPage]);

  // Helper labels & icons
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'maintenance':
        return { label: 'メンテナンス', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: Wrench };
      case 'security':
        return { label: 'セキュリティ', bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: ShieldAlert };
      case 'feature':
        return { label: '新機能・改善', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: Sparkles };
      case 'campaign':
        return { label: 'キャンペーン', bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: Gift };
      default:
        return { label: '一般お知らせ', bg: 'bg-sky-100 text-sky-900 border-sky-300', icon: Megaphone };
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'urgent':
        return { label: '緊急', bg: 'bg-red-600 text-white animate-pulse' };
      case 'important':
        return { label: '重要', bg: 'bg-amber-500 text-white' };
      default:
        return { label: '通常', bg: 'bg-slate-200 text-slate-800' };
    }
  };

  const getSegmentLabel = (seg: string) => {
    switch (seg) {
      case 'verified':
        return '🪪 本人確認 (eKYC) 完了ユーザー';
      case 'unverified':
        return '⏳ 本人確認未完了ユーザー';
      case 'active_posts':
        return '📮 ボトル投稿・利用中ユーザー';
      case 'active_disclosure':
        return '💌 照合・連絡先開示済みユーザー';
      default:
        return '🌐 全登録ユーザー';
    }
  };

  return (
    <div className="space-y-8 text-left font-sans animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-brand-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Megaphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">一括配信センター (Global Broadcasts)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
                  リアルタイム同報・セグメント配信
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                全ユーザーまたは特定セグメントへ向けたお知らせ、緊急メンテナンス通知、アプリ内ポップアップおよびメール一斉配信を安全に管理・執行します。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchBroadcasts();
                fetchSegmentCount(targetSegment);
              }}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              title="履歴と配信数を更新"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              最新化
            </button>
          </div>
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
            <span className="text-xs font-bold">📢 累計配信回数</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Megaphone size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-slate-900">{stats.totalCount}</span>
            <span className="text-xs text-slate-600 font-bold">件</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">システム全同報履歴</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">👥 総配信リーチ数</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-slate-900">{stats.totalReach.toLocaleString()}</span>
            <span className="text-xs text-slate-600 font-bold">名・通</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">届いた延べユーザー数</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">📬 平均既読率</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BarChart2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-emerald-900">{stats.avgReadRate}</span>
            <span className="text-xs text-emerald-700 font-bold">%</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">アプリ内開封数: {stats.totalReads.toLocaleString()} 件</p>
        </div>

        <div className="bg-white/95 rounded-2xl p-4 border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold">🎯 現在選択の配信対象</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-serif text-amber-900">{segmentCount !== null ? segmentCount.toLocaleString() : '...'}</span>
            <span className="text-xs text-amber-700 font-bold">名</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 truncate">{getSegmentLabel(targetSegment)}</p>
        </div>
      </div>

      {/* 3. Preset Templates Carousel / Chips */}
      <div className="bg-white/95 rounded-2xl p-5 border border-brand-border shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">定型文テンプレート（ワンクリック自動入力）</h3>
          </div>
          <span className="text-xs text-slate-600">クリックすると入力フォームに即座に反映されます</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    {preset.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriorityBadge(preset.priority).bg}`}>
                    {getPriorityBadge(preset.priority).label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                <span>{preset.channels.email ? '✉️ メール同時送信' : '📱 アプリ内のみ'}</span>
                <span className="text-indigo-600 font-bold group-hover:underline flex items-center gap-0.5">
                  適用する <ArrowRight size={10} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Two-Column Section: Form & Live Realistic Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Send size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">新規お知らせ作成</h3>
                <p className="text-xs text-slate-600">内容と配信設定を入力して送信確認へ進みます</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setContent('');
                setLink('');
                setCategory('general');
                setPriority('normal');
                setChannels({ inApp: true, email: false });
              }}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
            >
              フォームをクリア
            </button>
          </div>

          <form onSubmit={handleOpenConfirm} className="space-y-5">
            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Megaphone size={13} className="text-indigo-600" />
                  お知らせ種別 (カテゴリ)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="general">📢 一般お知らせ (General)</option>
                  <option value="maintenance">🔧 メンテナンス・障害 (Maintenance)</option>
                  <option value="feature">✨ 新機能・機能改善 (Feature Update)</option>
                  <option value="security">🔒 セキュリティ・防犯注意 (Security)</option>
                  <option value="campaign">🌸 キャンペーン・特別特集 (Campaign)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-indigo-600" />
                  重要度レベル
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['normal', 'important', 'urgent'] as const).map((p) => {
                    const badge = getPriorityBadge(p);
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {badge.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Target Segment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users size={13} className="text-indigo-600" />
                  配信対象セグメント
                </label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  対象人数: {segmentCount !== null ? `${segmentCount.toLocaleString()} 名` : '算出中...'}
                </span>
              </div>
              <select
                value={targetSegment}
                onChange={(e) => setTargetSegment(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">🌐 全登録ユーザー (All Users)</option>
                <option value="verified">🪪 本人確認 (eKYC) 完了ユーザー (Verified Only)</option>
                <option value="unverified">⏳ 本人確認未完了ユーザー (Unverified Only)</option>
                <option value="active_posts">📮 ボトルメール投稿者・利用中ユーザー (Active Posters)</option>
                <option value="active_disclosure">💌 照合・連絡先開示済みユーザー (Disclosure Completed)</option>
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText size={13} className="text-indigo-600" />
                お知らせ件名 / タイトル
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 【重要】システムメンテナンス実施のお知らせ"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText size={13} className="text-indigo-600" />
                  通知メッセージ本文 <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-600">
                  {content.length} 文字
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                placeholder="通知するメッセージ本文を入力してください..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
              />
            </div>

            {/* Link URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ExternalLink size={13} className="text-indigo-600" />
                リンクURL (任意)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="例: /terms または https://remeets.link/notice/1"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <p className="text-[10px] text-slate-600">
                ※ アプリ内相対パス（例: <code>/terms</code>, <code>/search</code>）または <code>https://</code> から始まる完全URLを指定できます。
              </p>
            </div>

            {/* Delivery Channels */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">
                📡 配信チャネルの選択
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={channels.inApp}
                    onChange={(e) => setChannels(prev => ({ ...prev, inApp: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Smartphone size={13} className="text-indigo-600" />
                      アプリ内通知 & リアルタイム
                    </span>
                    <p className="text-[10px] text-slate-600">ベルマーク通知・WebSocketポップアップ</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={channels.email}
                    onChange={(e) => setChannels(prev => ({ ...prev, email: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Mail size={13} className="text-indigo-600" />
                      メール一括同時送信
                    </span>
                    <p className="text-[10px] text-slate-600">登録メールアドレス宛に一斉配信</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending || !content.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye size={16} />
              配信内容の確認へ進む
            </button>
          </form>
        </div>

        {/* Right Column: Live Realistic Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/95 rounded-2xl p-5 border border-brand-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">受信側（実機・アプリ内）プレビュー</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                リアルタイム同期
              </span>
            </div>

            {/* Smartphone Mock Frame */}
            <div className="bg-slate-900 rounded-[28px] p-4 shadow-xl border-4 border-slate-800">
              {/* Phone Top Notch */}
              <div className="w-24 h-3.5 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950/60 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>

              {/* Phone Screen Content */}
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-3 min-h-[380px] flex flex-col justify-between">
                <div className="space-y-2.5">
                  {/* App Bar Header */}
                  <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Bell size={13} className="text-indigo-600" />
                      <span>ReMEETs お知らせ一覧</span>
                    </div>
                    <span className="text-[10px] text-slate-600">たった今</span>
                  </div>

                  {/* Notification Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-sm space-y-2">
                    {/* Badge & Category */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(category).bg}`}>
                          {getCategoryBadge(category).label}
                        </span>
                        {priority !== 'normal' && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriorityBadge(priority).bg}`}>
                            {getPriorityBadge(priority).label}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">公式アナウンス</span>
                    </div>

                    {/* Title */}
                    {title && (
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {title}
                      </h4>
                    )}

                    {/* Content */}
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {content || '（ここにメッセージ本文がプレビュー表示されます）'}
                    </p>

                    {/* Link button */}
                    {link && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                          <ExternalLink size={10} />
                          リンク先: {link}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          開く →
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Simulation */}
                <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-600">
                  ReMEETs 運営事務局より配信
                </div>
              </div>
            </div>

            {/* Target & Delivery Meta Info */}
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">配信予定対象:</span>
                <span className="font-bold text-indigo-700">{getSegmentLabel(targetSegment)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">配信チャネル:</span>
                <span className="font-medium text-slate-800">
                  {channels.inApp && '📱 アプリ内'} {channels.email && '✉️ メール一斉送信'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Execution Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-6">
                {/* Modal Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Send size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">一括配信の最終確認</h3>
                    <p className="text-xs text-slate-600">以下の設定内容で全対象者へ即時配信を実行します</p>
                  </div>
                </div>

                {/* Confirm Details Box */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">配信対象セグメント</span>
                      <span className="font-bold text-indigo-800">{getSegmentLabel(targetSegment)}</span>
                      <span className="text-[11px] text-indigo-600 block mt-0.5">（推定: <span className="font-serif font-bold text-indigo-800">{segmentCount?.toLocaleString() ?? 0}</span> 名）</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">配信チャネル</span>
                      <div className="flex flex-wrap gap-1 font-bold text-slate-800">
                        {channels.inApp && <span className="bg-white px-2 py-0.5 rounded border border-slate-200">📱 アプリ内通知</span>}
                        {channels.email && <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700">✉️ メール一括送信</span>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">お知らせカテゴリ</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(category).bg}`}>
                        {getCategoryBadge(category).label}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block mb-1">重要度</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadge(priority).bg}`}>
                        {getPriorityBadge(priority).label}
                      </span>
                    </div>
                  </div>

                  {title && (
                    <div className="space-y-1">
                      <span className="font-bold text-slate-600">件名:</span>
                      <p className="font-bold text-slate-900">{title}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="font-bold text-slate-600">本文内容:</span>
                    <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                      {content}
                    </p>
                  </div>

                  {link && (
                    <div className="space-y-1">
                      <span className="font-bold text-slate-600">添付リンク:</span>
                      <p className="font-mono text-indigo-600">{link}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSending}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                  >
                    キャンセルして修正
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteBroadcast}
                    disabled={isSending}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSending ? '配信を実行中...' : '配信を実行する'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Sent History & Analytics Section */}
      <div className="bg-white/95 rounded-2xl p-6 border border-brand-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">送信済みお知らせ一覧 & 開封状況</h3>
              <p className="text-xs text-slate-600">過去に同報配信されたお知らせの履歴と既読率です</p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setBroadcastPage(1); }}
                placeholder="履歴を検索..."
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-40 sm:w-48"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setBroadcastPage(1); }}
              className="py-1.5 px-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">全カテゴリ</option>
              <option value="general">一般</option>
              <option value="maintenance">メンテナンス</option>
              <option value="feature">新機能</option>
              <option value="security">セキュリティ</option>
              <option value="campaign">キャンペーン</option>
            </select>

            {/* Page Size Select */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500 text-[11px]">表示:</span>
              <select
                value={broadcastPerPage}
                onChange={(e) => { setBroadcastPerPage(Number(e.target.value)); setBroadcastPage(1); }}
                className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer text-xs"
              >
                <option value={10}>10件</option>
                <option value={25}>25件</option>
                <option value={50}>50件</option>
                <option value={100}>100件</option>
              </select>
            </div>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="py-12 text-center text-slate-600 space-y-2">
            <RefreshCw size={24} className="animate-spin mx-auto text-indigo-500" />
            <p className="text-xs">送信履歴を読み込み中...</p>
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="py-12 text-center text-slate-600 border border-dashed border-slate-200 rounded-2xl">
            <Megaphone size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium">該当する送信履歴はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedBroadcasts.map((item, idx) => {
              const readRate = item.user_count > 0 ? Math.round((item.read_count / item.user_count) * 100) : 0;
              const catBadge = getCategoryBadge(item.category);
              const priBadge = getPriorityBadge(item.priority);

              return (
                <div
                  key={item.id || idx}
                  className="p-5 rounded-2xl bg-slate-50/60 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3.5"
                >
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadge.bg}`}>
                        {catBadge.label}
                      </span>
                      {item.priority !== 'normal' && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priBadge.bg}`}>
                          {priBadge.label}
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {getSegmentLabel(item.target_segment)}
                      </span>
                      <span className="text-[11px] text-slate-600 font-serif font-bold flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Copy content button */}
                      <button
                        onClick={() => handleCopyText(item.content, item.id || idx)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="本文をコピー"
                      >
                        {copiedId === (item.id || idx) ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteBroadcast(item)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        title="履歴と通知を消去"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <div>
                    {item.title && (
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                        {item.title}
                      </h4>
                    )}
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                      {item.content}
                    </p>
                  </div>

                  {/* Bottom Stats & Link */}
                  <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Read count & Rate progress */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600">既読状況:</span>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${readRate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-serif font-bold text-slate-800">
                          {item.read_count} / {item.user_count} 名 ({readRate}%)
                        </span>
                      </div>

                      {/* Channels badge */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        {item.channels?.inApp !== false && <span>📱 アプリ内</span>}
                        {item.channels?.email && <span>✉️ メール配信</span>}
                      </div>
                    </div>

                    {/* Link */}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink size={12} />
                        リンク先を表示
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {filteredBroadcasts.length > 0 && (
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    全 <span className="font-serif font-bold text-slate-900">{filteredBroadcasts.length}</span> 件中{' '}
                    <span className="font-serif font-bold text-slate-900">{(safeBroadcastPage - 1) * broadcastPerPage + 1}</span> -{' '}
                    <span className="font-serif font-bold text-slate-900">{Math.min(safeBroadcastPage * broadcastPerPage, filteredBroadcasts.length)}</span> 件を表示
                  </span>
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs">
                    <span className="text-slate-500 text-[11px]">表示:</span>
                    <select
                      value={broadcastPerPage}
                      onChange={(e) => { setBroadcastPerPage(Number(e.target.value)); setBroadcastPage(1); }}
                      className="bg-transparent text-slate-800 font-medium outline-none cursor-pointer text-xs"
                    >
                      <option value={10}>10件</option>
                      <option value={25}>25件</option>
                      <option value={50}>50件</option>
                      <option value={100}>100件</option>
                    </select>
                  </div>
                </div>

                {totalBroadcastPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safeBroadcastPage <= 1}
                      onClick={() => setBroadcastPage(prev => Math.max(1, prev - 1))}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>前へ</span>
                    </button>

                    <div className="flex items-center gap-1 px-2 font-serif font-bold text-slate-900">
                      <span>{safeBroadcastPage}</span>
                      <span>/</span>
                      <span>{totalBroadcastPages}</span>
                    </div>

                    <button
                      type="button"
                      disabled={safeBroadcastPage >= totalBroadcastPages}
                      onClick={() => setBroadcastPage(prev => Math.min(totalBroadcastPages, prev + 1))}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>次へ</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
