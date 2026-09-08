import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Coffee,
  Copy, CreditCard, HeartHandshake, LogIn, LogOut, Menu, PlusCircle,
  RefreshCw, Search, Send, Shield, ShieldAlert, ShieldCheck, Sparkles,
  User as UserIcon, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNgFilter } from '../contexts/AuthContext';
import { cn, PageHeader } from '../lib/utils';
import { TermsContent, PrivacyContent } from './StaticPages';
import { WarningMessage, BottleLoader, GoogleSearchResultPreview, BackToHomeButton } from '../components/SharedComponents';

// --- LoginPage Component ---

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'ログインに失敗しました。');
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleSnsLogin = async (provider: 'line' | 'google') => {
    setLoading(true);
    setError('');
    
    // SNSログインのシミュレーション（実稼働時はOAuthリダイレクト）
    const demoUser = provider === 'line' ? 'line_user@example.com' : 'google_user@gmail.com';
    const demoPass = provider === 'line' ? 'LineAuth2026!Sec' : 'GoogleAuth2026!Sec';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: demoUser, password: demoPass })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate(from, { replace: true });
      } else {
        // 未登録の場合は新規登録画面へ案内
        navigate('/register');
      }
    } catch (err) {
      setError(`${provider.toUpperCase()}認証の通信に失敗しました。`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-12 animate-fade-in font-sans">
      <BackToHomeButton className="mb-4" />
      <PageHeader
        icon={<LogIn size={24} />}
        category="Sign In"
        title="ReMEETsへログイン"
        description="海に流されたあの人との言葉を、引き上げる。"
      />

      <div className="glass-card p-6 sm:p-8 bg-white/90 backdrop-blur-xl border border-amber-200/70 rounded-3xl shadow-xl space-y-6">
        {/* SNSログインボタン群 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSnsLogin('line')}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-5 h-5 fill-[#06C755]" viewBox="0 0 24 24">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.084.922.256 1.058.588.12.302.079.774.038 1.08l-.164 1.026c-.05.31-.242 1.213 1.063.662 1.306-.55 7.042-4.148 9.608-7.1 1.637-1.821 2.378-3.669 2.378-5.847z"/>
            </svg>
            <span>LINEでログイン</span>
          </button>

          <button
            type="button"
            onClick={() => handleSnsLogin('google')}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"/>
            </svg>
            <span>Googleでログイン</span>
          </button>
        </div>

        {/* 区切り線 */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-300"></div>
          <span className="flex-shrink mx-4 text-stone-700 text-xs font-semibold font-serif">またはメールアドレスでログイン</span>
          <div className="flex-grow border-t border-stone-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl flex items-center gap-2 animate-shake">
              <AlertCircle className="text-red-500 shrink-0" size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-800 tracking-wider uppercase block font-sans">
              メールアドレス または ユーザーID
            </label>
            <div className="relative">
              <input 
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="example@email.com または UID-123456"
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 transition-all placeholder:text-stone-400 shadow-inner"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-stone-800 tracking-wider uppercase block font-sans">
                パスワード
              </label>
              <Link to="/forgot-password" className="text-[11px] text-brand-primary hover:underline font-bold font-sans">
                パスワードを忘れた場合
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 transition-all placeholder:text-stone-400 shadow-inner"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 bg-brand-dark hover:bg-brand-primary text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer font-sans flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>ログインする</span>
            )}
          </button>
        </form>

        {/* 新規登録導線 */}
        <div className="pt-4 border-t border-stone-200/80 text-center space-y-2">
          <p className="text-xs sm:text-sm text-stone-700 font-medium font-serif">
            アカウントをお持ちではありませんか？
          </p>
          <Link to="/register" className="inline-block text-xs sm:text-sm text-brand-primary font-bold hover:underline font-sans">
            新しく会員登録する（無料） →
          </Link>
        </div>

        {/* 開発・審査用クイック入力 */}
        <div className="pt-2">
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-center space-y-1">
            <span className="text-[10px] text-stone-400 block font-mono">
              【動作確認用クイック入力】
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="px-2 py-0.5 bg-white hover:bg-amber-50 border border-stone-200 text-stone-600 text-[10px] rounded font-medium cursor-pointer shadow-2xs"
              >
                👑 管理者
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('test@example.com', 'password123')}
                className="px-2 py-0.5 bg-white hover:bg-amber-50 border border-stone-200 text-stone-600 text-[10px] rounded font-medium cursor-pointer shadow-2xs"
              >
                👤 テストユーザー
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Common UI Components ---

export const TermsModal = ({ isOpen, onClose, onConfirm, mode = 'terms' }: { isOpen: boolean; onClose: () => void; onConfirm?: () => void; mode?: 'terms' | 'privacy' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-8 overflow-y-auto bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[32px] p-6 md:p-8 max-w-2xl w-full my-4 md:my-8 shadow-2xl border border-brand-border flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-black">
                {mode === 'terms' ? '利用規約' : 'プライバシーポリシー'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors text-brand-dark/60 hover:text-brand-primary"
              >
                <PlusCircle className="rotate-45" size={24} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
              {mode === 'terms' ? <TermsContent /> : <PrivacyContent />}
            </div>

            <div className="mt-6 pt-4 border-t border-brand-border">
              <button 
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className="btn-primary w-full py-4"
              >
                内容を理解し同意します
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const RegisterPage = () => {
  const { check: checkNg } = useNgFilter();
  const [step, setStep] = useState<1 | 2>(1);
  const [authMethod, setAuthMethod] = useState<'line' | 'google' | 'email'>('email');
  
  // Step 1 State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 2 State
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Feedback & Loading State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const navigate = useNavigate();

  // 全角英数を半角英数に変換するヘルパー
  const toHalfWidth = (str: string) => {
    return str
      .replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .replace(/　/g, ' ');
  };

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let strength = 0;
    if (pw.length >= 8) strength += 1;
    if (/[a-zA-Z]/.test(pw)) strength += 1;
    if (/[0-9]/.test(pw)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pw)) strength += 1;
    return strength;
  };

  const strength = passwordStrength(password);
  const isAlphanumeric = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

  // SNS連携ハンドラー (LINE / Google)
  const handleSnsSelect = (provider: 'line' | 'google') => {
    setAuthMethod(provider);
    setError('');
    
    // SNS認証シミュレーション（実稼働時はOAuthリダイレクト）
    if (provider === 'line') {
      if (!email) setEmail('line_user@example.com');
      if (!password) setPassword('LineAuth2026!Sec');
    } else {
      if (!email) setEmail('google_user@gmail.com');
      if (!password) setPassword('GoogleAuth2026!Sec');
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('有効なメールアドレスを入力してください。');
      return;
    }
    if (password.length < 8 || !isAlphanumeric) {
      setError('パスワードは8文字以上で、英字と数字の両方を含める必要があります。');
      return;
    }
    setAuthMethod('email');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (warning) {
      alert('不適切な入力が含まれています。修正してください。');
      return;
    }
    if (!agreed) {
      setError('利用規約およびプライバシーポリシーへの同意（18歳以上確認）が必要です。');
      return;
    }
    if (captchaAnswer.trim() !== '4') {
      setError('ボット防止認証の答えが一致しません。「4」を入力してください。');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          lastName, 
          firstName, 
          nickname, 
          captchaAnswer,
          snsProvider: authMethod !== 'email' ? authMethod : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || '登録が完了しました。');
      } else {
        setError(data.error || '登録に失敗しました。');
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 md:py-20 text-center animate-fade-in font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="glass-card p-8 sm:p-10 space-y-6 bg-white/90 backdrop-blur-xl border border-amber-200/80 rounded-3xl shadow-xl text-stone-900"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              REGISTRATION COMPLETE
            </span>
            <h1 className="text-2xl font-bold font-serif text-stone-900">アカウント登録が完了しました</h1>
            <p className="text-xs sm:text-sm text-stone-600 font-serif leading-relaxed">
              ご登録いただいたメールアドレス宛てに確認のご案内をお送りいたしました。<br />
              ログインして、あの頃の想い出を手紙に託しましょう。
            </p>
          </div>

          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-left text-xs space-y-1 text-stone-700">
            <p className="font-bold text-brand-primary font-sans flex items-center gap-1.5">
              <ShieldCheck size={15} />
              <span>安心・安全のための登録情報</span>
            </p>
            <p className="text-stone-600">・メールアドレス: <strong className="font-mono text-stone-900">{email}</strong></p>
            <p className="text-stone-600">・ニックネーム: <strong className="text-stone-900">{nickname}</strong></p>
            <p className="text-stone-600">・本名: <strong className="text-stone-900">{lastName} {firstName}</strong>（非公開・クイズ照合用）</p>
          </div>

          <button 
            onClick={() => navigate('/login')} 
            className="w-full py-4 bg-brand-dark hover:bg-brand-primary text-white rounded-2xl text-xs sm:text-sm font-bold font-sans tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>ログイン画面へ進む</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12 animate-fade-in font-sans">
      <BackToHomeButton className="mb-4" />

      {/* ステップ進行プログレスインジケーター */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 z-0 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary z-0 rounded-full transition-all duration-500" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          />

          {/* Step 1 Node */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-brand-primary text-white shadow-md' : 'bg-stone-200 text-stone-500'
            }`}>
              1
            </div>
            <span className={`text-[11px] font-bold ${step === 1 ? 'text-brand-primary' : 'text-stone-600'}`}>
              登録方法の選択
            </span>
          </div>

          {/* Step 2 Node */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 2 ? 'bg-brand-primary text-white shadow-md ring-4 ring-amber-100' : 'bg-stone-200 text-stone-500'
            }`}>
              2
            </div>
            <span className={`text-[11px] font-bold ${step === 2 ? 'text-brand-primary' : 'text-stone-600'}`}>
              お名前・安心設定
            </span>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-10 bg-white/90 backdrop-blur-xl border border-amber-200/70 rounded-3xl shadow-xl"
      >
        {/* ヘッダーエリア */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-brand-primary text-xs font-bold font-sans mb-1">
            <Sparkles size={13} />
            <span>New Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-wide">
            {step === 1 ? '新規会員登録' : 'お名前と基本情報の登録'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-700 font-medium font-serif leading-relaxed">
            {step === 1 
              ? 'ご希望の登録方法を選択してください。' 
              : '二人の思い出を安全につなぐための大切なお名前を設定します。'}
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 text-xs rounded-2xl flex items-center gap-3 animate-shake">
            <AlertCircle className="text-red-500 shrink-0" size={16} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: 登録方法の選択 (LINE / Google / メアド) */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            {/* SNS簡単登録ボタン群 */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSnsSelect('line')}
                className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-5 h-5 fill-[#06C755]" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.084.922.256 1.058.588.12.302.079.774.038 1.08l-.164 1.026c-.05.31-.242 1.213 1.063.662 1.306-.55 7.042-4.148 9.608-7.1 1.637-1.821 2.378-3.669 2.378-5.847z"/>
                </svg>
                <span>LINEアカウントで登録（無料）</span>
              </button>

              <button
                type="button"
                onClick={() => handleSnsSelect('google')}
                className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"/>
                </svg>
                <span>Googleアカウントで登録（無料）</span>
              </button>
            </div>

            {/* 区切り線 */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-300"></div>
              <span className="flex-shrink mx-4 text-stone-700 text-xs font-semibold font-serif">またはメールアドレスで登録</span>
              <div className="flex-grow border-t border-stone-300"></div>
            </div>

            {/* メールアドレス ＆ パスワード入力フォーム */}
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 tracking-wider uppercase block font-sans">
                  メールアドレス <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-11 pr-4 py-3.5 border border-stone-300 rounded-2xl bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 transition-all placeholder:text-stone-400 shadow-inner"
                  />
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                </div>
                <p className="text-xs text-stone-700 font-medium font-serif">
                  ※確認案内やマッチング通知が届く、安全なメールアドレスをご入力ください。
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 tracking-wider uppercase block font-sans">
                  パスワード（8文字以上・英数字） <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 border border-stone-300 rounded-2xl bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 transition-all placeholder:text-stone-400 shadow-inner"
                  />
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* パスワード強度メーター */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={cn(
                          "h-1.5 flex-1 rounded-full transition-all",
                          i <= strength ? (strength <= 2 ? "bg-amber-500" : "bg-emerald-600") : "bg-stone-300"
                        )} />
                      ))}
                    </div>
                    <p className="text-xs text-stone-800 font-semibold font-mono">
                      強度: {strength <= 2 ? '⚠️ もう少し複雑にしてください' : '✅ 安全なパスワードです'}
                    </p>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-brand-dark hover:bg-brand-primary text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer font-sans flex items-center justify-center gap-2"
              >
                <span>次へ進む（お名前・基本情報の設定）</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: お名前・表示名・安心認証の設定 */}
        {/* ========================================================= */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {/* 上部：選択された登録メールの確認 ＆ 戻るボタン */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold">登録メール:</span>
                <span className="font-mono text-stone-900 font-semibold">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-brand-primary hover:underline font-bold font-sans cursor-pointer"
              >
                変更する
              </button>
            </div>

            {/* 1. 本名（公的氏名）入力欄 ＆ 安心注記 */}
            <div className="space-y-3 p-5 bg-stone-50/80 border border-stone-200/80 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5 font-sans">
                  <ShieldCheck size={16} className="text-brand-primary" />
                  <span>お名前（本名・公的氏名）</span> <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                  完全非公開
                </span>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 leading-relaxed font-serif">
                🔒 <strong>【安全保護・なりすまし防止の重要設計】</strong><br />
                本名は一度登録すると変更できません。住所や学校名等の個人情報は公開されず、あなただと確信して<strong>「思い出クイズ」に完全正解したお相手のみ</strong>に、最終確認（再会成立時）として安全に開示されます。
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">姓（苗字）</label>
                  <input 
                    required
                    type="text" 
                    placeholder="例：山田" 
                    className="w-full px-3.5 py-3 border border-stone-200 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 shadow-inner"
                    value={lastName}
                    onChange={e => {
                      const val = e.target.value;
                      const ngLabel = checkNg(val);
                      setWarning(ngLabel ? `不適切な入力が検出されました（${ngLabel}）。` : null);
                      setLastName(val);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">名（名前）</label>
                  <input 
                    required
                    type="text" 
                    placeholder="例：太郎" 
                    className="w-full px-3.5 py-3 border border-stone-200 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 shadow-inner"
                    value={firstName}
                    onChange={e => {
                      const val = e.target.value;
                      const ngLabel = checkNg(val);
                      setWarning(ngLabel ? `不適切な入力が検出されました（${ngLabel}）。` : null);
                      setFirstName(val);
                    }}
                  />
                </div>
              </div>
              <WarningMessage message={warning} />
            </div>

            {/* 2. ニックネーム（公開表示名）入力欄 */}
            <div className="space-y-2 p-5 bg-amber-50/50 border border-amber-150 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 tracking-wider block font-sans">
                  ニックネーム（表示名） <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  全体公開（変更可能）
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                ※手紙（ボトルメール）を流す際やマイページで公に表示される名前です。実名が出ないためプライバシーが守られます。
              </p>
              <input 
                required
                type="text" 
                placeholder="例：やまたろう、風鈴、としぼー など" 
                className="w-full px-3.5 py-3 border border-amber-200 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 shadow-inner"
                value={nickname}
                onChange={e => {
                  const val = e.target.value;
                  const ngLabel = checkNg(val);
                  setWarning(ngLabel ? `不適切な入力が検出されました（${ngLabel}）。` : null);
                  setNickname(val);
                }}
              />
            </div>

            {/* 3. ボット防止認証 */}
            <div className="space-y-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} className="text-brand-primary" />
                  <span>ボット防止認証</span>
                </label>
                {captchaAnswer === '4' && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 animate-fade-in">
                    ✓ 正解
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 font-medium">「2 + 2」の答えを半角数字で入力してください。</p>
              <input 
                required
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                placeholder="答えを入力（半角数字: 4）" 
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-amber-500/20 text-stone-900 font-mono shadow-inner font-bold tracking-wider"
                value={captchaAnswer}
                onChange={e => setCaptchaAnswer(toHalfWidth(e.target.value).replace(/[^0-9]/g, ''))}
              />
            </div>

            {/* 4. 規約・プライバシー同意 ＆ 18歳以上確認 */}
            <div className={cn(
              "flex items-start gap-3 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer",
              agreed ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/20" : "bg-stone-50/80 border-stone-200 hover:border-amber-200"
            )}>
              <input 
                id="terms"
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-stone-300 text-brand-primary focus:ring-amber-500 transition-all cursor-pointer shrink-0"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms" className="text-xs text-stone-800 leading-relaxed cursor-pointer font-medium font-serif select-none">
                <strong>【18歳以上・規約同意】</strong> 私は18歳以上（高校生を除く）であり、SNSアカウント連携を含む <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-brand-primary font-bold hover:underline cursor-pointer">利用規約</button> および <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-brand-primary font-bold hover:underline cursor-pointer">プライバシーポリシー</button> に同意して登録します。
              </label>
            </div>

            {/* 送信ボタン ＆ 戻るボタン */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                戻る
              </button>
              <button 
                type="submit" 
                disabled={loading || !agreed}
                className="flex-1 py-4 bg-brand-dark hover:bg-brand-primary text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer font-sans flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={18} />
                    <span>規約に同意してアカウントを作成する</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ログイン導線フッター */}
        <div className="mt-8 pt-6 border-t border-stone-200/80 text-center space-y-1">
          <p className="text-xs sm:text-sm text-stone-700 font-medium font-serif">
            既にアカウントをお持ちの方は
          </p>
          <Link to="/login" className="inline-block text-xs sm:text-sm text-brand-primary font-bold hover:underline font-sans">
            ログイン画面へ進む →
          </Link>
        </div>
      </motion.div>

      {/* 利用規約モーダル */}
      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        onConfirm={() => {
          setHasReadTerms(true);
          if (hasReadPrivacy) setAgreed(true);
        }}
        mode="terms"
      />

      {/* プライバシーポリシーモーダル */}
      <TermsModal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
        onConfirm={() => {
          setHasReadPrivacy(true);
          if (hasReadTerms) setAgreed(true);
        }}
        mode="privacy"
      />
    </div>
  );
};

export const QUESTION_SAMPLES = [
  { category: "学校・同級生", questions: [
    "卒業式の日に二人で交わした約束は？",
    "修学旅行の夜、こっそり話した内容は？",
    "放課後、いつも二人で寄っていたお店の名前は？",
    "文化祭の出し物で、私たちが担当した役割は？",
    "部活の合宿で、夜中にみんなで食べた夜食は？",
    "図書室でいつも二人で座っていた席の場所は？",
    "体育祭の二人三脚で、私たちが転んだ場所は？",
    "テスト勉強を口実に、二人で集まっていた場所は？",
    "あなたが部活を引退する日に、私に渡したものは？",
    "夏祭りの夜、二人で金魚すくいをした時の結果は？",
    "あなたが転校する前日に、二人で最後に会った場所は？"
  ]},
  { category: "職場・同僚", questions: [
    "残業中、二人でこっそり食べた差し入れは？",
    "初めて一緒に担当したプロジェクトの名前は？",
    "飲み会の帰り道、駅のホームで話した将来の夢は？",
    "当時のオフィスで、私たちの席が隣同士だった時の共通の悩みは？",
    "退職する時、あなたが私にくれた送別品は？"
  ]},
  { category: "近所・幼馴染", questions: [
    "子供の頃、秘密基地にしていた場所の呼び名は？",
    "近所の公園で、二人でよく遊んでいた遊具は？",
    "夏休みのラジオ体操の帰り、二人で拾った珍しいものは？",
    "お互いの家を行き来する時、いつも通っていた近道の名前は？",
    "二人でこっそり飼っていた、あの動物の名前は？",
    "雪が降った日に、二人で作った雪だるまの形は？"
  ]},
  { category: "初恋・大切な人", questions: [
    "初めて二人で出かけたデートの場所は？",
    "雨の日に、一つの傘に入って帰った時の会話は？",
    "あなたが私にくれた、最初の誕生日プレゼントは？",
    "二人でよく聴いていた、あのアーティストの曲名は？",
    "放課後の屋上で、二人で眺めていた景色の特徴は？",
    "二人で将来の夢を語り合った、あの秘密の場所は？"
  ]},
  { category: "趣味・サークル", questions: [
    "合宿の夜、キャンプファイヤーを囲んで歌った曲は？",
    "大会の予選で負けた後、二人で泣きながら食べたものは？",
    "サークル棟の部室で、いつもあなたが弾いていた楽器は？"
  ]}
];

export const QuestionSampleModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (sample: string) => void }) => {
  const [activeCategory, setActiveCategory] = useState(QUESTION_SAMPLES[0].category);
  
  if (!isOpen) return null;

  const currentCategory = QUESTION_SAMPLES.find(c => c.category === activeCategory) || QUESTION_SAMPLES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto bg-brand-dark/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-[40px] my-4 md:my-8 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-black">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold text-black text-xl">思い出クイズの出題例・サンプル</h3>
              <p className="text-xs text-black/60">二人だけが知る思い出を選んでください</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-brand-dark/5 rounded-full transition-colors">
            <X size={24} className="text-black/40" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Categories Sidebar */}
          <div className="w-full md:w-48 bg-brand-primary/5 border-r border-brand-border overflow-x-auto md:overflow-y-auto flex md:flex-col p-2 gap-1">
            {QUESTION_SAMPLES.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={cn(
                  "px-4 py-3 text-left text-xs font-bold rounded-xl transition-all whitespace-nowrap",
                  activeCategory === cat.category 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                    : "text-brand-dark/60 hover:bg-brand-primary/10 hover:text-brand-primary"
                )}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-[11px] uppercase tracking-wider">
                <Shield size={14} />
                <span>良い質問のコツ</span>
              </div>
              <p className="text-[11px] text-amber-600 leading-relaxed">
                お相手があなただと確信でき、かつ第三者には推測できない内容が理想的です。
                当時の二人だけの「あだ名」「場所」「出来事」を具体的に盛り込みましょう。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentCategory.questions.map((sample, i) => (
                <button 
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelect(sample);
                    onClose();
                  }}
                  className="text-left text-sm p-4 bg-white border border-brand-border rounded-2xl hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary transition-all leading-relaxed group flex items-start gap-4"
                >
                  <span className="text-brand-primary/40 font-mono text-xs mt-0.5 group-hover:text-brand-primary/60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif">{sample}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-brand-dark/5 border-t border-brand-border text-center">
          <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">
            クリックすると入力欄に反映されます
          </p>
        </div>
      </motion.div>
    </div>
  );
};


export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('無効なトークンです。');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (err) {
        setStatus('error');
        setMessage('確認に失敗しました。');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">
      <div className="text-left mb-4">
        <BackToHomeButton className="mb-0" />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10"
      >
        {status === 'loading' ? (
          <div className="space-y-4">
            <RefreshCw className="animate-spin text-black mx-auto" size={48} />
            <h1 className="text-2xl font-bold text-black">確認中...</h1>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6">
            <CheckCircle2 className="text-green-500 mx-auto" size={64} />
            <h1 className="text-2xl font-bold text-black">確認完了</h1>
            <p className="text-black/70">{message}</p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              ログイン画面へ
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AlertCircle className="text-red-500 mx-auto" size={64} />
            <h1 className="text-2xl font-bold text-black">エラー</h1>
            <p className="text-black/70">{message}</p>
            <button onClick={() => navigate('/')} className="btn-secondary w-full">
              トップページへ
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      setMessage('リクエストに失敗しました。');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <BackToHomeButton className="mb-4" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="text-2xl font-bold text-black mb-6">パスワードをお忘れですか？</h1>
        {status === 'success' ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="text-green-500 mx-auto" size={48} />
            <p className="text-black/70">{message}</p>
            <Link to="/login" className="text-black font-bold hover:underline">ログイン画面へ戻る</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-black/70">ご登録のメールアドレスを入力してください。パスワードリセットの手順をお送りします。</p>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-black/70 uppercase tracking-wider ml-1">メールアドレス</label>
              <input 
                required
                type="email" 
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {status === 'error' && <WarningMessage message={message} />}
            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
              {status === 'loading' ? <RefreshCw className="animate-spin" size={20} /> : 'リセットメールを送信'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMessage('パスワードは8文字以上である必要があります。');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (err) {
      setStatus('error');
      setMessage('リセットに失敗しました。');
    }
  };

  if (!token) return <Navigate to="/" />;

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <BackToHomeButton className="mb-4" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="text-2xl font-bold text-black mb-6">新しいパスワードの設定</h1>
        {status === 'success' ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="text-green-500 mx-auto" size={48} />
            <p className="text-black/70">{message}</p>
            <button onClick={() => navigate('/login')} className="btn-primary w-full">
              ログインする
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-black/70 uppercase tracking-wider ml-1">新しいパスワード</label>
              <input 
                required
                type="password" 
                className="input-field"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            {status === 'error' && <WarningMessage message={message} />}
            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
              {status === 'loading' ? <RefreshCw className="animate-spin" size={20} /> : 'パスワードを更新'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

