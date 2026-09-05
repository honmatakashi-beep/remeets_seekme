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

  return (
    <div className="max-w-xl mx-auto px-6 py-8 md:py-16 animate-fade-in">
      <BackToHomeButton className="mb-4" />
      <PageHeader
        icon={<LogIn size={24} />}
        category="Sign In"
        title="ReMEETsへログイン"
        description="海に流されたあの人との言葉を、引き上げる。"
      />

      <div className="glass-card p-8 bg-white/40 border border-brand-border rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="text-red-500 shrink-0" size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-brand-dark/80 tracking-widest uppercase block font-sans">
              ユーザー名 または メールアドレス
            </label>
            <input 
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="例：taro_yamada"
              className="w-full px-4 py-3 border border-brand-border rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-black"
            />
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-brand-dark/80 tracking-widest uppercase block font-sans">
                パスワード
              </label>
              <Link to="/forgot-password" className="text-[10px] text-brand-primary hover:underline font-bold font-sans">
                忘れた場合
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-brand-border rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-black pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-brand-dark/30 hover:text-brand-dark/60 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-brand-dark/95 transition-all cursor-pointer font-sans flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>ログインする</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-brand-border/60 text-center space-y-2">
          <p className="text-xs text-brand-dark/60 font-serif">
            アカウントをお持ちではありませんか？
          </p>
          <Link to="/register" className="inline-block text-xs text-brand-primary font-bold hover:underline font-sans">
            新しく会員登録する
          </Link>
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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (warning) {
      alert('不適切な入力が含まれています。修正してください。');
      return;
    }
    if (!agreed || !hasReadTerms || !hasReadPrivacy) {
      setError('利用規約とプライバシーポリシーへの同意が必要です');
      return;
    }
    if (password.length < 8 || !isAlphanumeric) {
      setError('パスワードは8文字以上で、英字と数字の両方を含める必要があります。');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, lastName, firstName, nickname, captchaAnswer })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        // Don't login yet, wait for email verification
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('登録に失敗しました');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 space-y-6">
          <Mail className="text-black mx-auto" size={64} />
          <h1 className="text-2xl font-bold text-black">メールを確認してください</h1>
          <p className="text-black">{success}</p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full">ログイン画面へ</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-4 md:py-8">
      <BackToHomeButton className="mb-4" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8"
      >
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-black mx-auto mb-4">
            <PlusCircle size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-[400] text-black mb-2 tracking-widest">新規登録</h1>
          <p className="text-base text-black font-serif italic font-medium">
            いつか届くかもしれない手紙を預かる場所。<br />
            新しいアカウントを作成しましょう。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-black uppercase tracking-wider ml-1">ユーザー名（ログイン用）</label>
            <input 
              required
              type="text" 
              placeholder="ユーザー名" 
              className="input-field py-4 text-lg"
              value={username}
              onChange={e => {
                const val = e.target.value;
                const ngLabel = checkNg(val);
                setWarning(ngLabel ? `不適切な入力が検出されました（${ngLabel}）。` : null);
                setUsername(val);
              }}
            />
            <WarningMessage message={warning} />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-bold text-black uppercase tracking-wider ml-1">メールアドレス</label>
            <input 
              required
              type="email" 
              placeholder="example@email.com" 
              className="input-field py-4 text-lg"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <p className="text-xs text-black ml-1 font-medium">※確認メールが送信されます。</p>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 border border-brand-border rounded-2xl">
            <h3 className="text-xs font-bold text-brand-primary tracking-wider uppercase">お名前（本名・フルネーム）</h3>
            <p className="text-[11px] text-[#ea0736] font-bold leading-relaxed">
              ※安全設計、なりすまし防止のため、本名はお名前（フルネーム）として一度登録すると変更できませんので正しく入力してください。
              本名は公開されず、あなただと確信して「秘密の質問」に完全正解したお相手のみに、最終確認として公開されます。
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark ml-1">姓（苗字）</label>
                <input 
                  required
                  type="text" 
                  placeholder="例：山田" 
                  className="input-field py-2.5 text-sm"
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
                <label className="text-xs font-bold text-brand-dark ml-1">名（名前）</label>
                <input 
                  required
                  type="text" 
                  placeholder="例：太郎" 
                  className="input-field py-2.5 text-sm"
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
          </div>

          <div className="space-y-2 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
            <label className="text-xs font-bold text-brand-dark block">ニックネーム（表示名） <span className="text-[#ea0736] text-[10px] font-bold">必須</span></label>
            <p className="text-[11px] text-amber-800 leading-relaxed mb-1">
              ※ボトルメールを流す際の表示名は、必ずこちらのニックネームが使用されます。実名が不特定多数に公開されることはありません（こちらは後から変更可能です）。
            </p>
            <input 
              required
              type="text" 
              placeholder="例：やまたろう" 
              className="input-field py-2.5 text-sm bg-white"
              value={nickname}
              onChange={e => {
                const val = e.target.value;
                const ngLabel = checkNg(val);
                setWarning(ngLabel ? `不適切な入力が検出されました（${ngLabel}）。` : null);
                setNickname(val);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg font-bold text-black uppercase tracking-wider ml-1">パスワード</label>
            <div className="relative">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder="8文字以上、英数字混合" 
                className="input-field py-4 text-lg pr-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/30 hover:text-brand-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={cn(
                    "h-1.5 flex-1 rounded-full transition-all",
                    i <= strength ? (strength <= 2 ? "bg-yellow-400" : "bg-green-500") : "bg-brand-dark/10"
                  )} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 p-5 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
            <label className="text-lg font-bold text-black uppercase tracking-widest flex items-center gap-2">
              <Shield size={16} />
              <span>ボット防止認証</span>
            </label>
            <p className="text-sm text-black mb-2 font-medium">「2 + 2」の答えを半角数字で入力してください。</p>
            <input 
              required
              type="text" 
              placeholder="答えを入力" 
              className="input-field py-4 text-lg bg-white/50"
              value={captchaAnswer}
              onChange={e => setCaptchaAnswer(e.target.value)}
            />
          </div>
          
          <div className={cn(
            "flex items-start gap-3 p-5 rounded-2xl border transition-all",
            (hasReadTerms && hasReadPrivacy) ? "bg-brand-primary/5 border-brand-primary/10" : "bg-brand-light/20 border-brand-border opacity-60"
          )}>
            <input 
              id="terms"
              type="checkbox" 
              disabled={!hasReadTerms || !hasReadPrivacy}
              className="mt-1 w-6 h-6 rounded border-brand-border text-brand-primary focus:ring-brand-primary/20 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-black leading-relaxed cursor-pointer font-medium">
              {!hasReadTerms || !hasReadPrivacy ? (
                <span>
                  <strong>【18歳以上・規約同意】</strong> まず最初に <button type="button" onClick={() => setShowTerms(true)} className="text-black font-bold hover:underline">利用規約</button> と <button type="button" onClick={() => setShowPrivacy(true)} className="text-black font-bold hover:underline">プライバシーポリシー</button> をお読みください（18歳以上確認・SNS連携に伴うプロファイル取得同意を含む）。
                </span>
              ) : (
                <span>
                  <strong>【18歳以上・規約同意】</strong> 私は18歳以上（高校生を除く）であり、SNSアカウント連携等を含む <button type="button" onClick={() => setShowTerms(true)} className="text-black font-bold hover:underline">利用規約</button> および <button type="button" onClick={() => setShowPrivacy(true)} className="text-black font-bold hover:underline">プライバシーポリシー</button> に同意して登録します。
                </span>
              )}
            </label>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-600 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3"
            >
              <AlertCircle size={18} />
              {error}
            </motion.p>
          )}
          <button 
            type="submit" 
            disabled={!agreed}
            className="btn-primary w-full py-5 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>登録する</span>
            <ArrowRight size={22} />
          </button>
        </form>
        <div className="mt-4 pt-4 border-t border-brand-border text-center">
          <p className="text-sm text-black">
            既にアカウントをお持ちの方は <Link to="/login" className="text-black font-bold hover:underline">ログイン</Link>
          </p>
        </div>
      </motion.div>

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        onConfirm={() => {
          setHasReadTerms(true);
          if (hasReadPrivacy) setAgreed(true);
        }}
      />

      <TermsModal 
        isOpen={showPrivacy} 
        mode="privacy"
        onClose={() => setShowPrivacy(false)} 
        onConfirm={() => {
          setHasReadPrivacy(true);
          if (hasReadTerms) setAgreed(true);
        }}
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
              <h3 className="font-bold text-black text-xl">秘密の質問の文例・サンプル</h3>
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

