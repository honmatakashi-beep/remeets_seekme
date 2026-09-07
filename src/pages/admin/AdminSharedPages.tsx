import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon, MapPin, ChevronRight, RefreshCw,
  Mail, Send, CheckCircle2, AlertCircle, Home, FileText, Shield,
  BookOpen, HelpCircle, Users, ExternalLink, ArrowRight, Activity,
  Info, MessageSquare, AlertTriangle, Search, Heart, Sparkles, LogIn
} from "lucide-react";
import { cn, PageHeader } from "../../lib/utils";
import { Navbar, BackToHomeButton } from "../../components/SharedComponents";

export const AdminInfoPage = () => (
  <div className="min-h-screen bg-white pt-16 pb-20 transition-colors duration-300">
    <div className="max-w-4xl mx-auto px-6">
      <BackToHomeButton />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 font-serif"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-bold text-black">管理者情報</h1>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">サイト名</span>
            <span className="md:col-span-2 text-lg text-black">ReMEETs〜再会のボトルメール〜</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">運営者</span>
            <span className="md:col-span-2 text-lg text-black">マホン</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">連絡先</span>
            <span className="md:col-span-2 text-lg text-black">
              <Link to="/contact" className="text-black hover:underline">お問い合わせフォーム</Link>よりご連絡ください
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">サイト内容</span>
            <span className="md:col-span-2 text-lg text-black">人を探している方、再会を希望する方のための情報掲載サイト</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">運営目的</span>
            <span className="md:col-span-2 text-lg text-black">人と人の再会のきっかけを提供すること</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border bg-brand-primary/5 px-4 rounded-xl">
            <span className="text-sm font-bold text-brand-primary uppercase tracking-widest">インターネット異性紹介事業<br/>届出番号</span>
            <span className="md:col-span-2 text-xl font-bold font-mono text-brand-primary flex items-center gap-2">
              <Shield size={20} />
              受理番号：[申請中/第XXXXXX号]
            </span>
          </div>
        </div>

        <div className="mt-12 p-8 bg-brand-accent/5 rounded-3xl border border-brand-accent/10">
          <p className="text-base text-brand-accent font-bold leading-relaxed font-serif">
            ※個別のトラブル、連絡の仲介、身元調査等は行っておりません。
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);

export const SitemapPage = () => {
  const sections = [
    {
      title: "メインメニュー",
      icon: <Home size={20} />,
      links: [
        { label: "ホーム", path: "/" },
        { label: "ボトルメールを流す", path: "/create" },
        { label: "ボトルメールを探す", path: "/search" },
        { label: "初めての方へ（ガイド）", path: "/guide" },
        { label: "奇跡の再会報告（体験談）", path: "/success-stories" },
      ]
    },
    {
      title: "アカウント",
      icon: <UserIcon size={20} />,
      links: [
        { label: "ログイン", path: "/login" },
        { label: "新規登録", path: "/register" },
        { label: "マイページ", path: "/account" },
      ]
    },
    {
      title: "サポート",
      icon: <Shield size={20} />,
      links: [
        { label: "ユーザーマニュアル", path: "/manual" },
        { label: "安心・安全への取り組み", path: "/safety" },
        { label: "投稿ガイドライン", path: "/guidelines" },
        { label: "お問い合わせ", path: "/contact" },
        { label: "削除依頼・通報", path: "/deletion-request" },
      ]
    },
    {
      title: "法的事項",
      icon: <FileText size={20} />,
      links: [
        { label: "利用規約", path: "/terms" },
        { label: "プライバシーポリシー", path: "/privacy" },
        { label: "管理者情報", path: "/admin-info" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-16 pb-20 font-serif">
      <div className="max-w-4xl mx-auto px-6">
        <BackToHomeButton />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12 border-b border-brand-border pb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
            <MapPin size={26} />
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
              Navigation Map
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
              サイトマップ
            </h1>
            <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-1">
              ReMEETsのすべての機能および案内ページ一覧です。
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-10"
            >
              <div className="flex items-center gap-4 mb-8 text-black border-b border-brand-border pb-4">
                {section.icon}
                <h2 className="text-xl font-bold tracking-widest">{section.title}</h2>
              </div>
              <ul className="space-y-5">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      to={link.path}
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-black/5 transition-all border border-transparent hover:border-black/10"
                    >
                      <span className="text-lg text-black group-hover:text-black font-medium transition-colors font-serif">
                        {link.label}
                      </span>
                      <ChevronRight size={20} className="text-black group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const subjects = [
    "サービス全般について",
    "ログイン・アカウントについて",
    "不具合・技術的なお問い合わせ",
    "メディア対応・取材について",
    "広告掲載について",
    "その他"
  ];
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '送信に失敗しました。');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black">
      <BackToHomeButton />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-16 text-black"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-brand-border pb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
            <Mail size={26} />
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
              Contact & Support
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
              お問い合わせ
            </h1>
            <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-1">
              サービスに関するご質問やご要望、不具合の報告などがございましたら、以下のフォームよりお気軽にお問い合わせください。
            </p>
          </div>
        </div>

          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center space-y-4"
            >
              <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
              <h2 className="text-xl font-bold text-emerald-800">お問い合わせを送信しました</h2>
              <p className="text-emerald-700/80">
                内容を確認の上、必要に応じて担当者よりご連絡させていただきます。<br />
                （内容によってはお返事にお時間をいただく場合や、お答えできない場合がございます。予めご了承ください。）
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 mt-4"
              >
                フォームに戻る
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">お名前</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans"
                    placeholder="山田 太郎"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">メールアドレス</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">件名</label>
                <select 
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans appearance-none"
                >
                  <option value="" disabled>選択してください</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">お問い合わせ内容</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all resize-none font-sans leading-relaxed"
                  placeholder="こちらにお問い合わせ内容を入力してください。"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full btn-primary py-4 text-lg"
              >
                {status === 'loading' ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} />
                    <span>送信する</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
  );
};

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onClose }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl font-serif"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            確認
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const AuroraAmbientGlow = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" style={{ mixBlendMode: 'multiply' }}>
      {/* Aurora glow blobs with subtle fluid movements */}
      <div className="absolute top-[-5%] left-[-15%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-gradient-to-br from-teal-200/40 via-emerald-100/30 to-blue-200/30 blur-[130px] aurora-animate-1 pointer-events-none" />
      <div className="absolute top-[25%] right-[-15%] w-[90vw] h-[90vw] md:w-[70vw] md:h-[70vw] rounded-full bg-gradient-to-tr from-pink-200/35 via-violet-100/35 to-sky-200/40 blur-[150px] aurora-animate-2 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-gradient-to-br from-indigo-100/35 via-cyan-100/40 to-teal-100/30 blur-[140px] aurora-animate-3 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full bg-gradient-to-tr from-rose-200/40 via-orange-100/30 to-amber-200/35 blur-[120px] aurora-animate-1 pointer-events-none" style={{ animationDelay: '-12s' }} />
    </div>
  );
};

export const PageViewTracker = () => {
  const location = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    const logPageView = async () => {
      try {
        await fetch('/api/page-view', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ path: location.pathname }),
          signal: controller.signal
        });
      } catch (err: any) {
        // Silently ignore aborted requests or transient network glitches during startup
        if (err?.name !== 'AbortError') {
          // Suppress unhandled promise error in console for non-critical analytics
        }
      }
    };

    logPageView();

    return () => {
      controller.abort();
    };
  }, [location.pathname, token]);

  return null;
};

