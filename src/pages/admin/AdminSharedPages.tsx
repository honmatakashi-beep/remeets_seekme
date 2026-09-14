import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon, MapPin, ChevronRight, ChevronDown, RefreshCw,
  Mail, Send, CheckCircle2, AlertCircle, Home, FileText, Shield,
  BookOpen, HelpCircle, Users, ExternalLink, ArrowRight, Activity,
  Info, MessageSquare, AlertTriangle, Search, Heart, Sparkles, LogIn,
  Copy, Check, Clock, LifeBuoy, ShieldAlert
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
        { label: "メッセージを書く", path: "/create" },
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    referenceUrl: '',
    message: ''
  });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [ticketToken, setTicketToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const categories = [
    { value: "料金・決済・自動返金について", label: "💳 料金・決済・自動返金について（Stripe決済、領収書、600円/1,200円等）" },
    { value: "想い出クイズ・メッセージの開封・再会について", label: "💌 想い出クイズ・メッセージの開封・再会について（誤答ロック、連絡先の再確認等）" },
    { value: "本人確認（eKYC）・年齢確認について", label: "🪪 本人確認（eKYC）・年齢確認について（身分証審査、認証ステータス等）" },
    { value: "ログイン・SNS連携・アカウント設定について", label: "🔐 ログイン・SNS連携・アカウント設定について（LINE/Google認証、通知メール等）" },
    { value: "不具合・エラー・技術的なご報告", label: "⚙️ 不具合・エラー・技術的なご報告（画面崩れ、ボタン動作不良等）" },
    { value: "迷惑行為・ストーカー・不審なメッセージの通報・ご相談", label: "🚨 迷惑行為・ストーカー・不審なメッセージの通報・ご相談（最優先トリアージ対象）" },
    { value: "メディア取材・提携・ビジネスのお問い合わせ", label: "📰 メディア取材・提携・ビジネスのお問い合わせ" },
    { value: "その他・ご意見・ご要望", label: "📝 その他・ご意見・ご要望" }
  ];

  const handleCopyTicket = () => {
    if (!ticketToken) return;
    navigator.clipboard.writeText(ticketToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToPrivacy) {
      setError('プライバシーポリシーへの同意をお願いいたします。');
      return;
    }

    if (formData.message.trim().length > 2000) {
      setError('お問い合わせ内容は2,000文字以内でご入力ください。');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          reference_url: formData.referenceUrl,
          message: formData.message
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '送信に失敗しました。');
      }

      setTicketToken(data.ticket_token || '');
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', referenceUrl: '', message: '' });
      setAgreedToPrivacy(false);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || '送信中にエラーが発生しました。時間をおいて再度お試しください。');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12 text-black font-sans">
      <BackToHomeButton />
      
      {/* 🏛️ Standard Unified Glass Card */}
      <div className="glass-card p-6 sm:p-8 md:p-12 bg-white rounded-3xl border border-brand-border shadow-sm space-y-8">
        {/* 🌟 Unified PageHeader */}
        <PageHeader
          icon={<Mail size={26} className="text-teal-700" />}
          iconBoxClassName="bg-teal-50 text-teal-700 border border-teal-200"
          category="Contact & Support"
          title="お問い合わせ窓口"
          description="サービスに関するご質問やご要望、不具合の報告、迷惑行為の通報などがございましたら、以下のフォームよりお気軽にお問い合わせください。"
        />

        {/* 💡 FAQ Self-Resolution Banner */}
        <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2.5 text-teal-900 font-sans">
            <HelpCircle size={18} className="text-teal-700 shrink-0" />
            <span>
              <strong>お問い合わせの前に：</strong>料金や想い出クイズ、返金保証等は「よくある質問」ですぐに解決できる場合があります。
            </span>
          </div>
          <Link
            to="/faq"
            className="px-3.5 py-1.5 bg-white hover:bg-teal-100/50 text-teal-800 font-bold rounded-xl border border-teal-300 shrink-0 text-xs shadow-2xs transition-all flex items-center gap-1"
          >
            <span>FAQを見る</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50/80 border border-emerald-200 p-6 sm:p-10 rounded-3xl text-center space-y-5"
          >
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase font-sans">
                Submission Completed
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950">
                お問い合わせを受け付けました
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800/90 font-sans max-w-lg mx-auto leading-relaxed">
                ご入力いただいたメールアドレス宛に、受付控えメールをお送りいたしました。<br />
                内容を確認の上、通常 <strong className="font-bold text-emerald-950">1〜2営業日以内（土日祝除く）</strong> に担当者よりご連絡いたします。
              </p>
            </div>

            {/* 🎟️ Ticket Token Display */}
            {ticketToken && (
              <div className="p-4 bg-white rounded-2xl border border-emerald-200/90 max-w-md mx-auto space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 font-sans block">
                  お問い合わせ受付番号（チケットID）
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold text-slate-900 tracking-wider">
                    {ticketToken}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    title="受付番号をコピー"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[10px] text-emerald-600 font-bold font-sans animate-fade-in">
                    ✓ 受付番号をクリップボードにコピーしました
                  </p>
                )}
              </div>
            )}

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => setStatus('idle')}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer font-sans"
              >
                別のお問い合わせを送信する
              </button>
              <Link
                to="/faq"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all font-sans"
              >
                よくあるご質問へ
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all font-sans"
              >
                トップページへ戻る
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* お名前 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 font-sans flex items-center justify-between">
                  <span>お名前（ニックネーム可）</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">必須</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50/50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans placeholder:text-slate-400"
                  placeholder="山田 太郎"
                />
              </div>

              {/* メールアドレス */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 font-sans flex items-center justify-between">
                  <span>メールアドレス（ご返信用）</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">必須</span>
                </label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-50/50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans placeholder:text-slate-400"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* お問い合わせ種別 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 font-sans flex items-center justify-between">
                <span>お問い合わせ種別（件名）</span>
                <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">必須</span>
              </label>
              <div className="relative">
                <select 
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-zinc-50/50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans appearance-none pr-10 cursor-pointer"
                >
                  <option value="" disabled>お問い合わせの項目を選択してください</option>
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 対象のボトルメールIDまたはURL（任意） */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 font-sans flex items-center justify-between">
                <span>対象のボトルメールID または URL</span>
                <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold">任意</span>
              </label>
              <input 
                type="text" 
                value={formData.referenceUrl}
                onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
                className="w-full bg-zinc-50/50 border border-slate-300 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans placeholder:text-slate-400"
                placeholder="例: https://remeets.jp/posts/123 または ボトルメールID"
              />
              <p className="text-[11px] text-slate-500 font-sans">
                ※特定のメッセージやクイズ、通報に関するお問い合わせの場合はご入力いただくとスムーズです。
              </p>
            </div>

            {/* お問い合わせ内容 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 font-sans flex items-center gap-1.5">
                  <span>お問い合わせ内容</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">必須</span>
                </label>
                <span className={`text-[11px] font-mono ${formData.message.length > 2000 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {formData.message.length} / 2000文字
                </span>
              </div>
              <textarea 
                required
                rows={6}
                maxLength={2000}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-zinc-50/50 border border-slate-300 rounded-xl px-4 py-3.5 text-xs md:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all resize-none font-sans leading-relaxed placeholder:text-slate-400"
                placeholder="お問い合わせの具体的な内容をご入力ください。&#10;（不具合報告の場合は、ご利用の端末・OS・ブラウザや発生時の状況をお書き添えいただけますと迅速に調査可能です。）"
              />
            </div>

            {/* 🛡️ 警察・緊急時のセーフティ注記 */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed font-sans">
              <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950 mb-0.5 text-[11px]">⚠️ 緊急時・身の危険を感じる場合のご案内</strong>
                <p className="m-0 text-amber-900/90 text-[11px] leading-relaxed">
                  脅迫、ストーカー、重大な犯罪被害など身の危険を感じる場合は、本フォームへのご連絡と並行して、直ちに最寄りの警察署（生活安全課）または警察相談専用電話「#9110」へご相談ください。運営事務局では警察からの公的な捜査関係照会に迅速に協力いたします。
                </p>
              </div>
            </div>

            {/* プライバシーポリシー同意チェック */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-700 font-sans leading-relaxed">
                <input 
                  type="checkbox"
                  required
                  checked={agreedToPrivacy}
                  onChange={e => setAgreedToPrivacy(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600 h-4 w-4 shrink-0 cursor-pointer"
                />
                <span>
                  当サービスの <Link to="/privacy" target="_blank" className="text-teal-700 font-bold underline hover:text-teal-800">プライバシーポリシー</Link>（個人情報の取り扱い）を確認し、同意の上で送信します。
                </span>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs md:text-sm font-sans">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading' || !agreedToPrivacy}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-bold text-sm md:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {status === 'loading' ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>送信中...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>お問い合わせを送信する</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
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
  const [glowOpacity, setGlowOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('remeets_bg_glow_opacity');
    return saved !== null ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const savedGlow = localStorage.getItem('remeets_bg_glow_opacity');
      const glowVal = savedGlow !== null ? parseFloat(savedGlow) : 1.0;
      setGlowOpacity(glowVal);
      document.body.style.backgroundColor = '#FDF9F0';
    };

    handleUpdate();
    window.addEventListener('remeets_bg_glow_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('remeets_bg_glow_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-300" 
      style={{ 
        mixBlendMode: 'multiply',
        opacity: glowOpacity,
        background: `
          radial-gradient(ellipse at 15% 10%, rgba(153, 246, 228, 0.45), transparent 60%),
          radial-gradient(ellipse at 85% 25%, rgba(251, 207, 232, 0.45), transparent 60%),
          radial-gradient(ellipse at 20% 85%, rgba(224, 231, 255, 0.45), transparent 60%),
          radial-gradient(ellipse at 80% 90%, rgba(254, 215, 170, 0.45), transparent 60%)
        `
      }}
    />
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

