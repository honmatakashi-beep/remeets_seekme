import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  BookOpen, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Coffee,
  Copy, CreditCard, HeartHandshake, LogIn, LogOut, Menu, PlusCircle,
  RefreshCw, Search, Send, Shield, ShieldAlert, ShieldCheck, Sparkles,
  User as UserIcon, Users, X
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

  const handleDirectTestLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
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

  const fromPath = (location.state as any)?.from?.pathname || '';
  const customMessage = (location.state as any)?.message;

  const getContextGuide = () => {
    if (customMessage) {
      return {
        title: 'ご案内',
        desc: customMessage,
        badge: 'Notice'
      };
    }
    if (fromPath === '/create') {
      return {
        title: '📮 メッセージを届ける（想い出をつづる）',
        desc: '書いたメッセージをお相手が見つけた際の自動通知や、内容の安全な管理・編集を行うため、ログインまたは新規会員登録をお願いいたします。',
        badge: '本人認証'
      };
    }
    if (fromPath === '/account') {
      return {
        title: '👤 マイアカウント・メッセージの確認',
        desc: 'あなたが書いたメッセージや届いたメッセージの状況、登録情報・再会エピソードを確認・管理するにはログインが必要です。',
        badge: 'マイページ'
      };
    }
    if (fromPath.startsWith('/edit')) {
      return {
        title: '✏️ メッセージの編集・内容変更',
        desc: '書いたメッセージの内容を変更または回収（削除）するには、投稿者ご本人様のアカウントでのログインが必要です。',
        badge: '本人認証'
      };
    }
    if (fromPath) {
      return {
        title: '🔐 ログインが必要です',
        desc: 'このページをご利用いただくには、アカウントへのログインまたは会員登録が必要です。',
        badge: '会員限定'
      };
    }
    return null;
  };

  const contextGuide = getContextGuide();

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-12 animate-fade-in font-sans">
      <BackToHomeButton className="mb-4" />
      <PageHeader
        icon={<LogIn size={24} />}
        category="Sign In"
        title="ReMEETsへログイン"
        description="海に流されたあの人との言葉を、引き上げる。"
      />

      {contextGuide && (
        <div className="mb-5 p-4 bg-gradient-to-r from-sky-50 via-teal-50/80 to-emerald-50 border border-teal-200/90 rounded-2xl space-y-1.5 text-slate-800 shadow-2xs font-sans text-left animate-fade-in">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-teal-950 text-xs sm:text-sm font-serif">
              <Sparkles size={15} className="text-teal-600 shrink-0" />
              <span>{contextGuide.title}</span>
            </div>
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 font-sans">
              {contextGuide.badge}
            </span>
          </div>
          <p className="leading-relaxed text-slate-600 text-[11px] sm:text-xs font-sans">
            {contextGuide.desc}
          </p>
        </div>
      )}

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
              アカウントID（メールアドレス）
            </label>
            <div className="relative">
              <input 
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="example@email.com または 会員番号(UID-xxxxxx)"
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
            新規アカウント登録する →
          </Link>
        </div>

        {/* 🧪 【テスト・動作確認用】一括自動入力バー */}
        <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2 text-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-sans">
              <Sparkles size={14} className="text-amber-600 shrink-0" />
              <span>【テスト用】ワンクリック自動入力</span>
            </span>
            <span className="text-[10px] text-amber-700/70 font-mono">
              動作確認用
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => handleDirectTestLogin('test@example.com', 'password123')}
              disabled={loading}
              className="py-2.5 px-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-xs rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>👤 テストユーザー（即ログイン）</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectTestLogin('admin', 'admin123')}
              disabled={loading}
              className="py-2.5 px-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>👑 管理者（即ログイン）</span>
            </button>
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
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [authMethod, setAuthMethod] = useState<'line' | 'google' | 'email'>('email');
  
  // Step 1 State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 2 State
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState<'男性' | '女性' | 'その他 / 回答しない' | ''>('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // 生年月日から年齢を即時計算するヘルパー
  const calculatedAge = (() => {
    if (!birthYear || !birthMonth || !birthDay) return null;
    const y = parseInt(birthYear, 10);
    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    const birth = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  })();

  // Step 3 State (6桁認証コード)
  const [verificationCode, setVerificationCode] = useState('');
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  
  // Feedback & Loading State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const navigate = useNavigate();

  // Dynamic Password Policy State
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

  useEffect(() => {
    fetch('/api/auth/password-policy')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.minLength === 'number') {
          setPasswordPolicy(data);
        }
      })
      .catch(() => {});
  }, []);

  // 全角英数を半角英数に変換するヘルパー
  const toHalfWidth = (str: string) => {
    return str
      .replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .replace(/　/g, ' ');
  };

  const validatePasswordPolicy = (pw: string) => {
    if (!pw) return 'パスワードを入力してください。';
    if (pw.length < passwordPolicy.minLength) {
      return `パスワードは${passwordPolicy.minLength}文字以上で入力してください。`;
    }
    if (passwordPolicy.requireLetters && !/[a-zA-Z]/.test(pw)) {
      return 'パスワードに英字（a〜z, A〜Z）を1文字以上含める必要があります。';
    }
    if (passwordPolicy.requireNumbers && !/[0-9]/.test(pw)) {
      return 'パスワードに数字（0〜9）を1文字以上含める必要があります。';
    }
    if (passwordPolicy.requireLetters && passwordPolicy.requireNumbers && (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw))) {
      return 'パスワードは英字と数字の両方を含める必要があります。';
    }
    if (passwordPolicy.requireMixedCase && (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw))) {
      return 'パスワードに英大文字と英小文字の両方を含める必要があります。';
    }
    if (passwordPolicy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/\\~`'"]/.test(pw)) {
      return 'パスワードに記号（!@#$%^&* など）を1文字以上含める必要があります。';
    }
    return null;
  };

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let strength = 0;
    if (pw.length >= passwordPolicy.minLength) strength += 1;
    if (/[a-zA-Z]/.test(pw)) strength += 1;
    if (/[0-9]/.test(pw)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pw)) strength += 1;
    return strength;
  };

  const strength = passwordStrength(password);

  // SNS連携ハンドラー (LINE / Google)
  const handleSnsSelect = (provider: 'line' | 'google') => {
    setAuthMethod(provider);
    if (provider === 'line') {
      if (!email) setEmail('line_user@example.com');
      if (!password) setPassword('LineAuth2026!Sec');
    } else if (provider === 'google') {
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
    const policyErr = validatePasswordPolicy(password);
    if (policyErr) {
      setError(policyErr);
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
    if (!birthYear || !birthMonth || !birthDay) {
      setError('生年月日（年・月・日）をすべて選択してください。');
      return;
    }
    if (calculatedAge === null || calculatedAge < 18) {
      setError('法令（青少年保護）および利用規約に基づき、18歳未満（高校生を含む）の方はご登録いただけません。');
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

    const formattedBirthdate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

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
          birthdate: formattedBirthdate,
          gender: gender || undefined,
          captchaAnswer,
          snsProvider: authMethod !== 'email' ? authMethod : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.requireVerification) {
          // メール登録の場合：認証コード入力画面 (Step 3) へ進む
          setStep(3);
          if (data.debugCode) {
            setDebugCode(data.debugCode);
          }
          setResendMessage('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // SNS認証等で即時完了の場合
          setSuccess(data.message || '新規アカウント登録が完了しました。');
        }
      } else {
        setError(data.error || '新規アカウント登録に失敗しました。');
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: 認証コードの照合・本登録完了
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim().length !== 6) {
      setError('メールに届いた6桁の半角数字を入力してください。');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verificationCode.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token && data.user) {
          login(data.token, data.user);
        }
        setSuccess(data.message || '本登録が完了しました！');
      } else {
        setError(data.error || '認証コードの確認に失敗しました。');
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 認証コードの再送信
  const handleResendCode = async () => {
    if (resendStatus === 'sending') return;
    setResendStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('sent');
        if (data.debugCode) {
          setDebugCode(data.debugCode);
        }
        setResendMessage('認証コードを再送信しました。メールをご確認ください。');
        setTimeout(() => setResendStatus('idle'), 10000);
      } else {
        setError(data.error || '再送信に失敗しました。');
        setResendStatus('idle');
      }
    } catch (err) {
      setError('通信エラーにより再送信できませんでした。');
      setResendStatus('idle');
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 md:py-20 text-center animate-fade-in font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="glass-card p-8 sm:p-10 space-y-6 bg-white/90 backdrop-blur-xl border border-sky-200/80 rounded-3xl shadow-xl text-stone-900"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-sky-400 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto ring-8 ring-sky-100 shadow-md">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold font-mono">
              REGISTRATION COMPLETE
            </span>
            <h1 className="text-2xl font-bold font-serif text-stone-900">新規アカウント登録が完了しました</h1>
            <p className="text-xs sm:text-sm text-stone-600 font-serif leading-relaxed">
              メールアドレスの認証が正常に完了し、本登録が完了いたしました。<br />
              ログインして、あの頃の想い出をメッセージに託しましょう。
            </p>
          </div>

          <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/60 text-left text-xs space-y-1 text-stone-700">
            <p className="font-bold text-sky-900 font-sans flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-sky-600" />
              <span>安心・安全のための登録情報</span>
            </p>
            <p className="text-stone-600">・メールアドレス: <strong className="font-mono text-stone-900">{email}</strong></p>
            <p className="text-stone-600">・ニックネーム: <strong className="text-stone-900">{nickname}</strong></p>
            <p className="text-stone-600">・本名: <strong className="text-stone-900">{lastName} {firstName}</strong>（非公開・クイズ照合用）</p>
          </div>

          <button 
            onClick={() => navigate('/account')} 
            className="w-full py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold font-sans tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>マイページへ進む</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    );
  }

  // プログレスバーの進行パーセント計算
  const progressPercent = step === 1 ? '15%' : step === 2 ? '55%' : '100%';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12 animate-fade-in font-sans">
      <BackToHomeButton className="mb-4" />

      {/* 鮮やかなブルーグラデーションのステッププログレスインジケーター */}
      <div className="mb-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between relative px-4">
          {/* 背景バー */}
          <div className="absolute left-6 right-6 top-4 h-1.5 bg-stone-200 z-0 rounded-full" />
          {/* ブルーグラデーション進行バー */}
          <div 
            className="absolute left-6 top-4 h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 z-0 rounded-full transition-all duration-700 shadow-sm" 
            style={{ width: `calc(${progressPercent} - 24px)` }}
          />

          {/* Step 1 Node */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 
                ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md ring-4 ring-sky-100' 
                : 'bg-stone-200 text-stone-500'
            }`}>
              1
            </div>
            <span className={`text-[11px] font-bold tracking-tight ${step === 1 ? 'text-blue-700 font-extrabold' : 'text-stone-600'}`}>
              登録方法の選択
            </span>
          </div>

          {/* Step 2 Node */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md ring-4 ring-blue-100' 
                : 'bg-stone-200 text-stone-500'
            }`}>
              2
            </div>
            <span className={`text-[11px] font-bold tracking-tight ${step === 2 ? 'text-blue-700 font-extrabold' : 'text-stone-600'}`}>
              お名前・安心設定
            </span>
          </div>

          {/* Step 3 Node */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 3 
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md ring-4 ring-indigo-100' 
                : 'bg-stone-200 text-stone-500'
            }`}>
              3
            </div>
            <span className={`text-[11px] font-bold tracking-tight ${step === 3 ? 'text-indigo-700 font-extrabold' : 'text-stone-600'}`}>
              認証コード確認
            </span>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-10 bg-white/90 backdrop-blur-xl border border-sky-200/70 rounded-3xl shadow-xl"
      >
        {/* ヘッダーエリア */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200/80 text-blue-700 text-xs font-bold font-sans mb-1">
            <Sparkles size={13} className="text-sky-500" />
            <span>新規アカウント登録</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-wide">
            {step === 1 ? '新規アカウント登録' : step === 2 ? 'お名前と基本情報の設定' : 'メール認証コードの入力'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-700 font-medium font-serif leading-relaxed">
            {step === 1 
              ? 'ご希望の登録方法（LINE・Google・メールアドレス）を選択してください。' 
              : step === 2 
                ? '二人の想い出を安全につなぐための大切なお名前と規約同意を設定します。'
                : `${email} 宛てに届いた6桁の認証コードを入力してください。`}
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 text-xs rounded-2xl flex items-center gap-3 animate-shake">
            <AlertCircle className="text-red-500 shrink-0" size={16} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* 再送完了メッセージ */}
        {resendMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
            <span className="font-medium">{resendMessage}</span>
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
                <span>LINEアカウントで登録</span>
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
                <span>Googleアカウントで登録</span>
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">基本認証情報</span>
                <button
                  type="button"
                  onClick={() => {
                    const rand = Math.floor(1000 + Math.random() * 9000);
                    const testMail = `test_user_${rand}@example.com`;
                    const testPass = 'Password123!';
                    setEmail(testMail);
                    setPassword(testPass);
                    setAuthMethod('email');
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-98"
                  title="テストメールとパスワードを自動入力してStep 2へ進む"
                >
                  <Sparkles size={12} className="text-amber-200" />
                  <span>⚡ テスト入力して次へ進む</span>
                </button>
              </div>

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
                    className="w-full pl-11 pr-4 py-3.5 border border-stone-300 rounded-2xl bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 transition-all placeholder:text-stone-400 shadow-inner"
                  />
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                </div>
                <p className="text-xs text-stone-700 font-medium font-serif">
                  ※確認コード（6桁）やマッチング通知が届く、安全なメールアドレスをご入力ください。
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 tracking-wider uppercase block font-sans">
                  パスワード（{passwordPolicy.minLength}文字以上{passwordPolicy.requireLetters && passwordPolicy.requireNumbers ? '・英数字' : passwordPolicy.requireLetters ? '・英字' : passwordPolicy.requireNumbers ? '・数字' : ''}{passwordPolicy.requireSymbols ? '・記号' : ''}{passwordPolicy.requireMixedCase ? '・大文字小文字' : ''}） <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 border border-stone-300 rounded-2xl bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 transition-all placeholder:text-stone-400 shadow-inner"
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
                          i <= strength ? (strength <= 2 ? "bg-amber-500" : "bg-gradient-to-r from-sky-400 to-blue-600") : "bg-stone-300"
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
                className="w-full py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer font-sans flex items-center justify-center gap-2"
              >
                <span>次へ進む（お名前・安心設定）</span>
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
            {/* 上部：選択された登録メールの確認 ＆ テスト自動入力 ＆ 戻るボタン */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl text-xs gap-2">
              <div className="flex items-center gap-2 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-bold">登録メール:</span>
                <span className="font-mono text-stone-900 font-semibold">{email}</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setLastName('山田');
                    setFirstName('太郎');
                    setNickname('タロウ');
                    setBirthYear('1995');
                    setBirthMonth('8');
                    setBirthDay('15');
                    setGender('その他 / 回答しない');
                    setCaptchaAnswer('4');
                    setAgreed(true);
                    setHasReadTerms(true);
                    setHasReadPrivacy(true);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer active:scale-98"
                  title="検証用のテスト氏名・生年月日・規約同意を一括自動入力"
                >
                  <Sparkles size={12} className="text-amber-200" />
                  <span>⚡ 全項目テスト自動入力</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-700 hover:underline font-bold font-sans cursor-pointer"
                >
                  メール変更
                </button>
              </div>
            </div>

            {/* 1. 本名（公的氏名）入力欄 ＆ 安心注記 */}
            <div className="space-y-3 p-5 bg-stone-50/80 border border-stone-200/80 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5 font-sans">
                  <ShieldCheck size={16} className="text-blue-600" />
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
                    className="w-full px-3.5 py-3 border border-stone-200 rounded-xl bg-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 shadow-inner"
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
                    className="w-full px-3.5 py-3 border border-stone-200 rounded-xl bg-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 shadow-inner"
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

            {/* 2. 生年月日（年齢確認・18歳以上確認）入力欄 */}
            <div className="space-y-3 p-5 bg-gradient-to-br from-amber-50/70 via-stone-50/80 to-amber-50/50 border border-amber-200/90 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5 font-sans">
                  <Calendar size={16} className="text-amber-700" />
                  <span>生年月日（年齢確認）</span> <span className="text-rose-500">*</span>
                </label>
                {calculatedAge !== null && (
                  calculatedAge >= 18 ? (
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>{calculatedAge} 歳（利用可能）</span>
                    </span>
                  ) : (
                    <span className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                      <AlertCircle size={12} className="text-rose-600" />
                      <span>{calculatedAge} 歳（18歳未満利用不可）</span>
                    </span>
                  )
                )}
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed font-serif">
                ※ 青少年保護および法令遵守のため、生年月日による年齢確認を行っております（非公開）。
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* 年 */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-stone-700">年（西暦）</label>
                  <select
                    required
                    value={birthYear}
                    onChange={e => setBirthYear(e.target.value)}
                    className="w-full px-2.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 shadow-inner cursor-pointer font-sans"
                  >
                    <option value="">年を選択</option>
                    {Array.from({ length: 90 }, (_, i) => {
                      const y = new Date().getFullYear() - 18 - i; // 18歳以上（2008年以前〜1919年）
                      let era = '';
                      if (y >= 2019) era = `令和${y - 2018}`;
                      else if (y >= 1989) era = `平成${y - 1988}`;
                      else if (y >= 1926) era = `昭和${y - 1925}`;
                      else era = `大正${y - 1911}`;
                      return (
                        <option key={y} value={y.toString()}>
                          {y}年 ({era})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 月 */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-stone-700">月</label>
                  <select
                    required
                    value={birthMonth}
                    onChange={e => setBirthMonth(e.target.value)}
                    className="w-full px-2.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 shadow-inner cursor-pointer font-sans"
                  >
                    <option value="">月を選択</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m.toString()}>
                        {m}月
                      </option>
                    ))}
                  </select>
                </div>

                {/* 日 */}
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold text-stone-700">日</label>
                  <select
                    required
                    value={birthDay}
                    onChange={e => setBirthDay(e.target.value)}
                    className="w-full px-2.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 shadow-inner cursor-pointer font-sans"
                  >
                    <option value="">日を選択</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d.toString()}>
                        {d}日
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {calculatedAge !== null && calculatedAge < 18 && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>18歳未満（高校生を含む）の方は法令に基づきご登録いただけません。</span>
                </div>
              )}
            </div>

            {/* 2.5 性別（統計・分析用 / 非公開）入力欄 */}
            <div className="space-y-3 p-5 bg-gradient-to-br from-indigo-50/50 via-slate-50/80 to-teal-50/40 border border-indigo-100 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5 font-sans">
                  <Users size={16} className="text-indigo-600" />
                  <span>性別（統計・サービス改善用）</span>
                  <span className="text-[10px] text-zinc-500 font-normal ml-1">※任意</span>
                </label>
                <span className="text-[10px] bg-slate-200/90 text-slate-700 font-bold px-2 py-0.5 rounded">
                  非公開
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed font-serif">
                ※ 他のユーザーやメッセージのお相手には一切公開されません。年齢確認および統計データ分析にのみ利用されます。
              </p>
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {[
                  { value: '男性', label: '男性' },
                  { value: '女性', label: '女性' },
                  { value: 'その他 / 回答しない', label: 'その他 / 未回答' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer font-sans text-center flex items-center justify-center ${
                      gender === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-[1.02]'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-indigo-400 hover:bg-indigo-50/30'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. ニックネーム（公開表示名）入力欄 */}
            <div className="space-y-2 p-5 bg-sky-50/40 border border-sky-150 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 tracking-wider block font-sans">
                  ニックネーム（表示名） <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  全体公開（変更可能）
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed font-serif">
                ※メッセージ（ボトルメール）を流す際やマイページで公に表示される名前です。実名が出ないためプライバシーが守られます。
              </p>
              <input 
                required
                type="text" 
                placeholder="例：やまたろう、風鈴、としぼー など" 
                className="w-full px-3.5 py-3 border border-sky-200 rounded-xl bg-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 shadow-inner"
                value={nickname}
                onChange={e => {
                  const val = e.target.value;
                  const ngLabel = checkNg(val);
                  setWarning(ngLabel ? `不適切な入力が検出されました（${ngLabel}）。` : null);
                  setNickname(val);
                }}
              />
            </div>

            {/* 4. ボット防止認証 */}
            <div className="space-y-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} className="text-blue-600" />
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
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-stone-900 font-mono shadow-inner font-bold tracking-wider"
                value={captchaAnswer}
                onChange={e => setCaptchaAnswer(toHalfWidth(e.target.value).replace(/[^0-9]/g, ''))}
              />
            </div>

            {/* 🌟 【おすすめ】公的本人確認（eKYC）で再会・返信率を最大化するご案内カード */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white border-2 border-indigo-200 rounded-2xl space-y-3 font-sans shadow-xs text-left">
              <div className="flex items-center justify-between gap-2 border-b border-indigo-150 pb-2.5 flex-wrap">
                <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-indigo-950">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    <ShieldCheck size={16} />
                  </div>
                  <span>【おすすめ】公的本人確認（eKYC）のご案内</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  返信率大幅UP
                </span>
              </div>

              <p className="text-[11.5px] text-slate-700 leading-relaxed font-serif">
                ReMEETsでは、数年〜数十年ぶりの再会となるお相手に<strong>「本人の確証と安心」</strong>を届け、<strong>初回の返信率を最大化</strong>するため、公的身分証（運転免許証・マイナンバー等）によるeKYC認証を第一におすすめしております。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                    <span>お相手の警戒心を100%解除</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-normal">
                    「公的証明バッジ」が付くことで、お相手が安心してLINEやメールを返信できます。
                  </p>
                </div>
                <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                    <span>サクラ・いたずらを完全排除</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-normal">
                    身元が確かな方だけがやり取りできるため、大切な思い出が安全に守られます。
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-indigo-100/50 rounded-xl text-[11px] text-indigo-900 font-medium flex items-center justify-between gap-2">
                <span>※ アカウント作成完了後、マイページ（/account）からいつでも1分で身分証撮影・認証が可能です。</span>
              </div>
            </div>

            {/* 5. 規約・プライバシー同意 ＆ 18歳以上確認 */}
            <div 
              onClick={() => setAgreed(!agreed)}
              className={cn(
                "flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer",
                agreed ? "bg-sky-50/90 border-sky-300 ring-2 ring-sky-400/20" : "bg-stone-50/80 border-stone-200 hover:border-sky-200"
              )}
            >
              <input 
                id="terms"
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer shrink-0"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                onClick={e => e.stopPropagation()}
              />
              <div className="space-y-1.5 select-none">
                <label htmlFor="terms" className="text-xs sm:text-sm font-bold text-stone-900 leading-snug cursor-pointer font-serif block">
                  私は18歳以上（高校生を除く）であり、利用規約等に同意します
                </label>
                <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed font-sans">
                  法令（青少年保護）に基づき18歳未満および高校生のご利用はできません。SNSアカウント連携に伴う情報の取得・保護を含む <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }} className="text-blue-700 font-bold hover:underline cursor-pointer">利用規約</button> および <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrivacy(true); }} className="text-blue-700 font-bold hover:underline cursor-pointer">プライバシーポリシー</button> をご確認のうえ、同意してアカウントを作成してください。
                </p>
              </div>
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
                className="flex-1 py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer font-sans flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    <span>{authMethod === 'email' ? '認証コードをメールで受け取る' : '規約に同意してアカウントを作成する'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 3: メール認証コードの入力 ＆ 本登録完了 */}
        {/* ========================================================= */}
        {step === 3 && (
          <form onSubmit={handleVerifyCodeSubmit} className="space-y-6">
            {/* 上部：送信先メールアドレスの確認 */}
            <div className="p-4 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5 font-sans">
                  <Mail size={15} className="text-blue-600" />
                  <span>認証コード送信先</span>
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  有効期限 30分間
                </span>
              </div>
              <p className="text-stone-700 font-mono text-sm font-semibold">{email}</p>
              <p className="text-[11px] text-stone-500 font-serif pt-1">
                ※上記のメールアドレス宛てに「6桁の半角数字」の認証コードをお送りしました。
              </p>
            </div>

            {/* 6桁認証コード入力欄 */}
            <div className="space-y-2 p-6 bg-stone-50/90 rounded-2xl border border-stone-200 text-center">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block font-sans">
                認証コード（半角数字 6桁） <span className="text-rose-500">*</span>
              </label>
              <div className="max-w-xs mx-auto pt-2">
                <input 
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={verificationCode}
                  onChange={e => setVerificationCode(toHalfWidth(e.target.value).replace(/[^0-9]/g, ''))}
                  className="w-full text-center py-4 border-2 border-sky-300 rounded-2xl bg-white text-2xl font-mono font-bold tracking-[0.4em] outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 text-stone-900 shadow-inner"
                />
              </div>
              <p className="text-xs text-stone-600 font-medium font-serif pt-1">
                メール本文に記載された6桁の数字をそのままご入力ください。
              </p>

              {/* 開発・テスト用アシスト機能 */}
              <div className="mt-3 pt-3 border-t border-stone-200/80">
                <div className="inline-flex items-center gap-2 p-2 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs font-sans">
                  <Sparkles size={13} className="text-amber-600 shrink-0" />
                  <span>【テスト用】確認コード自動入力:</span>
                  <strong className="font-mono text-sm font-bold text-amber-900 tracking-wider bg-white px-2 py-0.5 rounded border border-amber-300">
                    {debugCode || '123456'}
                  </strong>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(debugCode || '123456')}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    ⚡ 自動入力
                  </button>
                </div>
              </div>
            </div>

            {/* 注意事項アコーディオン/コールアウト */}
            <div className="p-5 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs text-amber-900 space-y-3 font-serif leading-relaxed">
              <div className="flex items-center justify-between">
                <p className="font-bold flex items-center gap-1.5 text-amber-950 font-sans text-xs">
                  <AlertCircle size={15} className="text-amber-600 shrink-0" />
                  <span>確認メールが届かない場合・注意事項</span>
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendStatus === 'sending'}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-900 rounded-xl text-[11px] font-bold font-sans flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={12} className={resendStatus === 'sending' ? 'animate-spin' : ''} />
                  <span>{resendStatus === 'sending' ? '再送信中...' : '確認コードを再送する'}</span>
                </button>
              </div>

              <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1 text-[11px]">
                <li>「迷惑メールフォルダ」や「プロモーション」タブに自動分類されている場合がございます。</li>
                <li>ドメイン指定受信を設定されている場合は <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-950 font-bold">remeets.link</code> からのメール受信を許可してください。</li>
                <li>お心当たりがない場合は、第三者が誤って入力した可能性がありますのでメールを破棄してください。</li>
              </ul>
            </div>

            {/* 本登録完了ボタン ＆ 戻る/再送 */}
            <div className="space-y-3 pt-2">
              <button 
                type="submit" 
                disabled={loading || verificationCode.trim().length !== 6}
                className="w-full py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer font-sans flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>認証して本登録を完了する</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-stone-600 hover:text-stone-900 font-bold font-sans cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  <span>お名前・安心設定へ戻る</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendStatus === 'sending'}
                  className="text-xs text-blue-700 hover:underline font-bold font-sans cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw size={13} className={resendStatus === 'sending' ? 'animate-spin' : ''} />
                  <span>{resendStatus === 'sending' ? '再送信中...' : '認証コードを再送信する'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ログイン導線フッター */}
        <div className="mt-8 pt-6 border-t border-stone-200/80 text-center space-y-1">
          <p className="text-xs sm:text-sm text-stone-700 font-medium font-serif">
            既にアカウントをお持ちの方は
          </p>
          <Link to="/login" className="inline-block text-xs sm:text-sm text-blue-700 font-bold hover:underline font-sans">
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
  const [policy, setPolicy] = useState<{
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
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/password-policy')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.minLength === 'number') {
          setPolicy(data);
        }
      })
      .catch(() => {});
  }, []);

  const validateResetPassword = (pw: string) => {
    if (!pw) return 'パスワードを入力してください。';
    if (pw.length < policy.minLength) {
      return `パスワードは${policy.minLength}文字以上で入力してください。`;
    }
    if (policy.requireLetters && !/[a-zA-Z]/.test(pw)) {
      return 'パスワードに英字（a〜z, A〜Z）を1文字以上含める必要があります。';
    }
    if (policy.requireNumbers && !/[0-9]/.test(pw)) {
      return 'パスワードに数字（0〜9）を1文字以上含める必要があります。';
    }
    if (policy.requireLetters && policy.requireNumbers && (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw))) {
      return 'パスワードは英字と数字の両方を含める必要があります。';
    }
    if (policy.requireMixedCase && (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw))) {
      return 'パスワードに英大文字と英小文字の両方を含める必要があります。';
    }
    if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/\\~`'"]/.test(pw)) {
      return 'パスワードに記号（!@#$%^&* など）を1文字以上含める必要があります。';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const policyErr = validateResetPassword(newPassword);
    if (policyErr) {
      setMessage(policyErr);
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
              <label className="text-[11px] font-bold text-black/70 uppercase tracking-wider ml-1">
                新しいパスワード（{policy.minLength}文字以上{policy.requireLetters && policy.requireNumbers ? '・英数字' : policy.requireLetters ? '・英字' : policy.requireNumbers ? '・数字' : ''}{policy.requireSymbols ? '・記号' : ''}{policy.requireMixedCase ? '・大文字小文字' : ''}）
              </label>
              <input 
                required
                type="password" 
                placeholder="新しいパスワードを入力"
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

