import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, Coffee, Copy, CreditCard,
  HeartHandshake, LogIn, LogOut, Mail, Menu, Search, Send, Shield,
  ShieldCheck, Sparkles, User as UserIcon, X, Heart, MapPin, Plus,
  ChevronDown, ChevronUp, Bell, Settings, Shield as ShieldIcon, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, formatEraLabel, getPostUrl, getCategoryText, PREFECTURES } from '../lib/utils';
import { SupportBanner } from './SupportBanner';
import { WaterRippleRainbowText } from './WaterRippleRainbowText';

export const WarningMessage = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2 font-sans animate-none mt-2">
      <AlertTriangle className="text-amber-500 shrink-0" size={14} />
      <span>{message}</span>
    </div>
  );
};

export const BottleLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center py-16 space-y-4 font-serif">
    <div className="w-12 h-12 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-500 font-serif">ボトルを引き上げています...</p>
  </div>
);

export const Navbar = ({ onOpenOnboarding }: { onOpenOnboarding?: () => void }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [homeDesign, setHomeDesign] = useState<'v1' | 'v2'>(() => {
    return (localStorage.getItem('remeets_home_design') as 'v1' | 'v2') || 'v2';
  });

  useEffect(() => {
    const handleDesignChange = () => {
      const current = (localStorage.getItem('remeets_home_design') as 'v1' | 'v2') || 'v2';
      setHomeDesign(current);
    };
    window.addEventListener('home_design_changed', handleDesignChange);
    return () => window.removeEventListener('home_design_changed', handleDesignChange);
  }, []);

  const toggleHomeDesign = () => {
    const next = homeDesign === 'v1' ? 'v2' : 'v1';
    setHomeDesign(next);
    localStorage.setItem('remeets_home_design', next);
    window.dispatchEvent(new Event('home_design_changed'));
  };

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [toastNotification, setToastNotification] = useState<{
    id: number;
    content: string;
    type: string;
    link: string;
  } | null>(null);

  // Play a gentle notification harmonic chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.25); // A5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.7);
    } catch {}
  };

  // Real-time WebSocket connection for instant notifications
  useEffect(() => {
    if (!token || !user) return;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          ws?.send(JSON.stringify({ type: 'auth', token }));
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification' && data.notification) {
              setUnreadCount(prev => prev + 1);
              setToastNotification(data.notification);
              playChime();
            }
          } catch {}
        };
        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 5000);
        };
      } catch {}
    };
    connectWs();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [token, user]);

  useEffect(() => {
    if (!user || !token) {
      setUnreadCount(0);
      return;
    }
    let isSubscribed = true;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && Array.isArray(data)) {
            const unread = data.filter((n: any) => !n.is_read).length;
            setUnreadCount(unread);
          }
        } else if (res.status === 401 || res.status === 403) {
          if (isSubscribed) setUnreadCount(0);
        }
      } catch {
        // Silently handle temporary network offline or server reboot during background polling
      }
    };
    fetchUnread();
    
    // Check every 30 seconds for new notifications
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [user, token]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Real-time Notification Toast */}
      {toastNotification && (
        <div className="fixed top-4 right-4 sm:right-6 z-[9999] max-w-sm w-full animate-bounce-subtle pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border-2 border-amber-400 shadow-2xl rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <Sparkles size={20} className="animate-spin-slow" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  速報通知
                </span>
                <span className="text-[11px] text-slate-400 font-mono">たった今</span>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-relaxed line-clamp-2">
                {toastNotification.content}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetLink = toastNotification.link || '/account';
                    setToastNotification(null);
                    navigate(targetLink);
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>詳細を確認する</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => setToastNotification(null)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="閉じる"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <nav className="border-b border-brand-border bg-white/90 backdrop-blur-md w-full relative z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between relative">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 group py-1">
            <img 
              src="/logo.png" 
              alt="ReMEETs" 
              className="h-5.5 sm:h-6.5 md:h-7.5 w-auto object-contain transition-transform group-hover:scale-[1.02]" 
            />
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
          {/* 運営応援寄付ボタン (デスクトップ・PC画面のみ表示、モバイルでは非表示) */}
          <Link
            to="/supporter"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-bold rounded-full text-xs shadow-xs shadow-amber-950/20 hover:shadow-sm transition-all hover:scale-[1.03] active:scale-98 cursor-pointer shrink-0 border border-amber-400/40"
          >
            <Coffee size={13} className="text-amber-100 shrink-0 drop-shadow-2xs" />
            <span className="drop-shadow-2xs">ReMEETsを応援（寄付）</span>
          </Link>

          {/* ご利用ガイド Link */}
          <Link
            to="/guide"
            onClick={() => setIsMenuOpen(false)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-dark text-xs font-semibold font-sans transition-all border border-brand-primary/15 hover:border-brand-primary/30 shrink-0"
          >
            <BookOpen size={14} className="text-brand-primary" />
            <span>ご利用ガイド</span>
          </Link>

          {/* URL コピーボタン */}
          <button 
            onClick={handleCopyLink}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer shadow-xs shrink-0 ${
              copied 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary border-brand-primary/10 hover:border-brand-primary/30'
            }`}
            title="サイトのURLをコピー"
          >
            {copied ? <Check size={14} className="text-emerald-600 animate-bounce" /> : <Copy size={14} />}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-brand-border/80 bg-white hover:bg-slate-50 text-brand-dark transition-all cursor-pointer shadow-xs relative z-50"
            aria-label="メニュー"
          >
            {isMenuOpen ? <X size={20} className="text-slate-700" /> : <Menu size={20} className="text-slate-700" />}
            {unreadCount > 0 && !isMenuOpen && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </nav>

      {/* Dropdown Menu Overlay and Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
            {/* Transparent backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sliding Dropdown Panel */}
            <motion.div
              ref={dropdownRef}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-16 right-3 sm:right-6 w-80 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5rem)] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col z-[101] overflow-hidden"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <span>{user ? `${user.username} としてログイン中` : "ReMEETs メニュー"}</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                  aria-label="閉じる"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Items Container */}
              <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-9rem)]">
                {/* --- メイン機能 --- */}
                <Link
                  to="/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all font-semibold text-left"
                >
                  <Send size={16} className="text-indigo-600 shrink-0" />
                  <span>ボトルメールを流す</span>
                </Link>

                <Link
                  to="/search"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs text-slate-700 hover:text-teal-600 hover:bg-teal-50/60 rounded-xl transition-all font-semibold text-left"
                >
                  <Search size={16} className="text-teal-600 shrink-0" />
                  <span>ボトルメールを探す</span>
                </Link>

                {user && (
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-xs text-slate-700 hover:text-sky-600 hover:bg-sky-50/60 rounded-xl transition-all font-semibold text-left"
                  >
                    <div className="flex items-center gap-3">
                      <UserIcon size={16} className="text-sky-600 shrink-0" />
                      <span>マイアカウント</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-600 text-white rounded-full shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* --- サービス案内・安心情報 --- */}
                <div className="border-t border-slate-100 pt-2 my-1.5 space-y-0.5">
                  <Link
                    to="/guide"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50/60 rounded-xl transition-all font-medium text-left"
                  >
                    <BookOpen size={15} className="text-amber-600 shrink-0" />
                    <span>ご利用ガイド</span>
                  </Link>

                  <Link
                    to="/safety"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-all font-medium text-left"
                  >
                    <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                    <span>安全への取り組み（本人確認）</span>
                  </Link>

                  <Link
                    to="/pricing"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 rounded-xl transition-all font-medium text-left"
                  >
                    <CreditCard size={15} className="text-emerald-600 shrink-0" />
                    <span>利用料金表</span>
                  </Link>

                  {/* 運営応援寄付（趣旨・特典ページへの遷移） */}
                  <Link
                    to="/supporter"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all font-medium text-left cursor-pointer"
                  >
                    <Coffee size={15} className="text-amber-700 shrink-0" />
                    <span>ReMEETsを応援（寄付）</span>
                  </Link>

                  <Link
                    to="/success-stories"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-rose-700 hover:bg-rose-50/60 rounded-xl transition-all font-medium text-left"
                  >
                    <HeartHandshake size={15} className="text-rose-500 shrink-0" />
                    <span>奇跡の再会報告（体験談）</span>
                  </Link>
                </div>

                {/* --- サポート & その他 --- */}
                <div className="border-t border-slate-100 pt-2 my-1.5 space-y-0.5">
                  <Link
                    to="/faq"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 rounded-xl transition-all font-medium text-left"
                  >
                    <HelpCircle size={15} className="text-teal-600 shrink-0" />
                    <span>よくあるご質問（FAQ）</span>
                  </Link>

                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50/60 rounded-xl transition-all font-medium text-left"
                  >
                    <Mail size={15} className="text-blue-600 shrink-0" />
                    <span>お問い合わせ</span>
                  </Link>

                  {Boolean(
                    user && (
                      ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'].includes(user?.role || '') ||
                      user?.username === 'admin' ||
                      user?.role?.toLowerCase().includes('admin')
                    )
                  ) && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl transition-all text-left border border-red-200/80 bg-red-50/50 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Shield size={15} className="text-red-600 shrink-0" />
                        <span>管理者ダッシュボード</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold border border-red-200">
                        {user?.role === 'super_admin' ? '👑 統括' :
                         user?.role === 'moderator' ? '🛡️ 治安' :
                         user?.role === 'cs_support' ? '🎧 CS' :
                         user?.role === 'auditor' ? '⚖️ 監査' : '管理'}
                      </span>
                    </Link>
                  )}
                </div>

                {/* Logout/Login Buttons */}
                <div className="border-t border-slate-100 my-1 pt-2">
                  {user ? (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold cursor-pointer text-left"
                    >
                      <LogOut size={15} className="text-rose-400 shrink-0" />
                      <span>ログアウト</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-1 font-semibold">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 font-bold"
                      >
                        <LogIn size={13} />
                        <span>ログイン</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 text-xs bg-brand-primary hover:bg-brand-dark text-white rounded-xl transition-all font-bold shadow-2xs"
                      >
                        <span>新規登録</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-brand-border bg-brand-light/10 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-3 sm:space-y-4 pb-2 sm:pb-0">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="ReMEETs" 
              className="h-5.5 sm:h-6 md:h-7 w-auto object-contain" 
            />
          </div>
          <p className="text-xs text-brand-dark/60 leading-relaxed font-serif max-w-sm sm:max-w-md lg:max-w-none">
            デジタル技術と情緒が織りなす、懐かしいあの人との再会プラットフォーム。
          </p>
          <p className="text-[10px] text-brand-dark/50 font-sans">
            運営: ReMEETs TEAM
          </p>
        </div>
        <div className="space-y-2.5 sm:space-y-3">
          <h4 className="text-[11px] sm:text-xs font-bold text-brand-dark/80 tracking-widest uppercase">サービス</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-xs text-brand-dark/60">
            <li><Link to="/create" className="hover:text-brand-primary">ボトルメールを流す</Link></li>
            <li><Link to="/search" className="hover:text-brand-primary">ボトルメールを探す</Link></li>
            <li><Link to="/pricing" className="hover:text-brand-primary">利用料金表</Link></li>
            <li><Link to="/supporter" className="hover:text-brand-primary">ReMEETsを応援</Link></li>
            <li><Link to="/success-stories" className="hover:text-brand-primary">奇跡の再会体験談</Link></li>
          </ul>
        </div>
        <div className="space-y-2.5 sm:space-y-3">
          <h4 className="text-[11px] sm:text-xs font-bold text-brand-dark/80 tracking-widest uppercase">規約・法務</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-xs text-brand-dark/60">
            <li><Link to="/terms" className="hover:text-brand-primary">利用規約</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-primary">プライバシーポリシー</Link></li>
            <li><Link to="/company" className="hover:text-brand-primary">特定商取引法表記</Link></li>
            <li><Link to="/guidelines" className="hover:text-brand-primary">投稿ガイドライン</Link></li>
          </ul>
        </div>
        <div className="col-span-2 sm:col-span-1 space-y-2.5 sm:space-y-3">
          <h4 className="text-[11px] sm:text-xs font-bold text-brand-dark/80 tracking-widest uppercase">サポート</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-xs text-brand-dark/60">
            <li><Link to="/faq" className="hover:text-brand-primary">よくあるご質問</Link></li>
            <li><Link to="/manual" className="hover:text-brand-primary">ご利用マニュアル</Link></li>
            <li><Link to="/contact" className="hover:text-brand-primary">お問い合わせ</Link></li>
            <li><Link to="/deletion-request" className="hover:text-brand-primary">手紙の削除依頼</Link></li>
            <li><Link to="/payment-preview" className="hover:text-brand-primary text-indigo-700 font-bold flex items-center gap-1">💳 決済プレビュー</Link></li>
          </ul>
        </div>
      </div>
    <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-brand-border/40 flex flex-col sm:flex-row items-center justify-between text-[10px] text-brand-dark/40 font-mono gap-2">
      <div>&copy; {new Date().getFullYear()} ReMEETs. All rights reserved.</div>
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/home-designs" className="text-indigo-600 hover:text-indigo-900 font-bold hover:underline">
          🎨 HOMEデザイン比較ショールーム
        </Link>
        <span className="text-slate-300">|</span>
        <Link to="/payment-preview" className="text-indigo-600/80 hover:text-indigo-900 hover:underline">
          💳 全決済画面UIショールーム
        </Link>
      </div>
    </div>
  </footer>
  );
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <BottleLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};

export const GoogleSearchResultPreview = ({ targetName, era, location, searcherName, teaser }: { targetName: string; era: string; location?: string; searcherName: string; teaser?: string }) => {
  const displayUrl = `https://remeets.jp › name › ${targetName ? encodeURIComponent(targetName) : '...'}`;
  const title = `${targetName || '〇〇'} 様へ届いている思い出ボトル｜ReMEETs 再会のボトルメール`;
  const displayLocation = location ? (location.match(/.*?[都道府県]/)?.[0] || location) : 'ゆかりの地';
  const eraFormatted = formatEraLabel(era);
  const snippet = `${eraFormatted}に${displayLocation}で出会った「${searcherName || '〇〇'}」様があなたを探しています。思い出の手がかり：${teaser || '思い出の質問に正解すると手紙が開封されます。'}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm font-sans max-w-2xl overflow-hidden text-left my-2">
      {/* Header */}
      <div className="bg-slate-900 text-white p-3.5 px-4 text-xs font-bold flex items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0">
            <span className="text-[#4285F4]">G</span>
          </div>
          <span className="tracking-wide">Google 検索結果での表示イメージ（SEO実例）</span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium shrink-0">
          Google検索・エゴサーチ対応
        </span>
      </div>

      <div className="p-3.5 md:p-4 space-y-3 bg-white">
        {/* Google Result Box */}
        <div className="space-y-1">
          <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-serif text-[8px] font-bold shrink-0">
              R
            </div>
            <span className="text-slate-700 font-sans font-medium">ReMEETs 再会プラットフォーム</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-500 truncate">{displayUrl}</span>
          </div>
          <h3 className="text-sm md:text-[15px] text-[#1a0dab] hover:underline leading-snug cursor-pointer font-medium font-sans">
            {title}
          </h3>
          <p className="text-xs text-[#4d5156] leading-relaxed font-normal font-sans">
            {snippet}
          </p>
        </div>

        {/* Informative Note / Protection Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 text-[10.5px]">
          <div className="bg-blue-50/80 border border-blue-100/90 p-2.5 rounded-xl space-y-0.5">
            <p className="font-bold text-blue-900 flex items-center gap-1 text-[11px]">
              <span>💡</span> 検索されたお相手の視点
            </p>
            <p className="text-blue-800/90 leading-relaxed text-[10.5px]">
              お相手がご自身の名前をGoogle検索した際、「自分宛の手紙がある！」と一目で気づくことができます。
            </p>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-100/90 p-2.5 rounded-xl space-y-0.5">
            <p className="font-bold text-emerald-900 flex items-center gap-1 text-[11px]">
              <span>🔒</span> プライバシー保護機能
            </p>
            <p className="text-emerald-800/90 leading-relaxed text-[10.5px]">
              手紙の本文全文・思い出クイズ・連絡先はGoogleには載りません。正解者のみに安全に開示されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BackToHomeButton = ({ className = "mb-6" }: { className?: string }) => {
  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 hover:text-brand-dark text-xs font-bold font-sans transition-all shadow-2xs group cursor-pointer w-fit ${className}`}
    >
      <ArrowLeft size={14} className="text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
      <span>トップへ戻る</span>
    </Link>
  );
};

