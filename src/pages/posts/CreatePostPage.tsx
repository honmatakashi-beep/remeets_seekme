import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, BookOpen, Check, CheckCircle2,
  HelpCircle, Info, Lock, MapPin, Send, Shield,
  ShieldCheck, Sparkles, User, AlertTriangle, Eye, AlertCircle, Calendar,
  Edit3, Mail, Key, Crown, CreditCard, FileCheck
} from 'lucide-react';
import { useAuth, useNgFilter } from '../../contexts/AuthContext';
import { PREFECTURES, BIRTH_YEAR_OPTIONS, formatBirthYearLabel, getPostUrl, PageHeader } from '../../lib/utils';
import { GoogleSearchResultPreview, BackToHomeButton } from '../../components/SharedComponents';
import { MypageEkycModal } from '../../components/account/MypageEkycModal';

export const CreatePostPage = () => {
  const { user, token, login, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { check: checkNg } = useNgFilter();

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    maidenName: '',
    birthYear: '',
    hometownPref: '',
    message: '',
    contactType: 'LINE',
    contactId: '',
    contactNote: ''
  });

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // プレビュー表示モード
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // 選択されたプラン ('free' | 'ekyc')
  const [pendingPlan, setPendingPlan] = useState<'free' | 'ekyc'>('ekyc');

  // 無料アカウント登録・ログインモーダル
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // eKYC身分証・決済モーダル
  const [showEkycModal, setShowEkycModal] = useState(false);
  const [createdPostData, setCreatedPostData] = useState<any>(null);

  // 初期値の引き継ぎ
  useEffect(() => {
    if (location.state) {
      const { initialTargetName, initialTargetLastName, initialTargetFirstName } = location.state as any;
      if (initialTargetLastName || initialTargetFirstName || initialTargetName) {
        setFormData(prev => ({
          ...prev,
          lastName: initialTargetLastName || (initialTargetName ? initialTargetName.split(' ')[0] : prev.lastName),
          firstName: initialTargetFirstName || (initialTargetName ? initialTargetName.split(' ')[1] || '' : prev.firstName)
        }));
      }
    }
  }, [location.state]);

  // ユーザーの登録情報から初期補完
  useEffect(() => {
    if (user) {
      if (user.fullName && !formData.lastName && !formData.firstName) {
        const parts = user.fullName.trim().split(/\s+/);
        setFormData(prev => ({
          ...prev,
          lastName: parts[0] || '',
          firstName: parts[1] || ''
        }));
      }
      if (user.maiden_name && !formData.maidenName) {
        setFormData(prev => ({ ...prev, maidenName: user.maiden_name }));
      }
      if (user.birthdate && !formData.birthYear) {
        const y = new Date(user.birthdate).getFullYear();
        if (!isNaN(y)) {
          setFormData(prev => ({ ...prev, birthYear: y.toString() }));
        }
      }
      if (user.contact_id && !formData.contactId) {
        setFormData(prev => ({
          ...prev,
          contactType: user.contact_type || 'LINE',
          contactId: user.contact_id
        }));
      }
      if (user.email && !authEmail) {
        setAuthEmail(user.email);
      }
    }
  }, [user]);

  const fullName = `${formData.lastName} ${formData.firstName}`.trim();

  // リアルタイム特定情報（学校名・会社名・駅名・連絡先等）の検知ロジック
  const getPrivacyWarning = (text: string): string | null => {
    if (!text) return null;
    const lower = text.toLowerCase();

    if (lower.includes('高校') || lower.includes('大学') || lower.includes('中学') || lower.includes('小学校') || lower.includes('幼稚園') || lower.includes('保育園')) {
      return '防犯のため、具体的な学校名は含めず、当時の部活動や放課後の様子などの思い出をご記入ください。';
    }
    if (lower.includes('株式会社') || lower.includes('有限会社') || lower.includes('病院') || lower.includes('支店') || lower.includes('部署')) {
      return 'プライバシー保護のため、会社名・勤務先名は含めずにご記入ください。';
    }
    if (lower.includes('駅') || lower.includes('丁目') || lower.includes('番地') || lower.includes('マンション') || lower.includes('アパート')) {
      return '居場所特定を防ぐため、最寄り駅名や詳細な町名・番地は含めずにご記入ください。';
    }
    if (text.match(/0\d{1,4}-?\d{1,4}-?\d{4}/) || text.includes('@') || lower.includes('line') || lower.includes('twitter') || lower.includes('instagram')) {
      return '本文中に直接連絡先を記載することはできません。連絡先は下記の【再会時の開示連絡先】欄にご入力ください。';
    }
    return null;
  };

  const privacyWarning = getPrivacyWarning(formData.message);

  // フォームバリデーション
  const validateForm = (): boolean => {
    setWarningMessage(null);
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      setWarningMessage('探す方が検索できるよう、あなたのお名前（姓・名）を入力してください。');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return false;
    }
    if (!formData.hometownPref) {
      setWarningMessage('ゆかりの地（都道府県）を選択してください。');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return false;
    }
    if (!formData.message.trim() || formData.message.trim().length < 15) {
      setWarningMessage('昔の知人や友人に向けたメッセージを15文字以上で入力してください。');
      return false;
    }
    if (!formData.contactId.trim()) {
      setWarningMessage('再会が成立した際に相手にお渡しする連絡先（LINE IDまたはメールアドレス）を入力してください。');
      return false;
    }
    if (!agreed) {
      setWarningMessage('利用規約およびプライバシーポリシーへの同意が必要です。');
      return false;
    }

    const ngError = checkNg(`${fullName} ${formData.maidenName} ${formData.message}`);
    if (ngError) {
      setWarningMessage(ngError);
      return false;
    }

    if (privacyWarning) {
      setWarningMessage(`【記載ルールの確認】${privacyWarning}`);
      return false;
    }

    return true;
  };

  // 1. 「お相手が見る公開画面を確認する」ボタン押下
  const handleGoToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsPreviewMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. 実際に手紙を保存・公開する処理
  const executeSubmitPost = async (authToken?: string, withEkyc?: boolean) => {
    const activeToken = authToken || token;
    const isEkycPlan = withEkyc !== undefined ? withEkyc : pendingPlan === 'ekyc';

    if (isSubmitting) return;
    setIsSubmitting(true);
    setWarningMessage(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          searcherName: fullName,
          searcherFullName: fullName,
          searcherMaidenName: formData.maidenName.trim(),
          birthYear: formData.birthYear ? parseInt(formData.birthYear, 10) : null,
          targetName: fullName, // SeekMe では自分自身が目印
          targetLastName: formData.lastName.trim(),
          targetFirstName: formData.firstName.trim(),
          targetHometown: formData.hometownPref,
          message: formData.message.trim(),
          contactType: formData.contactType,
          contactId: formData.contactId.trim(),
          contactNote: formData.contactNote.trim(),
          questions: [
            { question: '当時の思い出のエピソード', answer: '相互承認で確認' },
            { question: 'ゆかりの都道府県', answer: formData.hometownPref }
          ],
          captchaToken: 'mock-token'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedPostData(data);

        if (isEkycPlan) {
          // 🌟 eKYC認証プランの場合: eKYCモーダルを起動
          setShowEkycModal(true);
        } else {
          // ✉️ 無料プランの場合: そのまま公開詳細ページへ遷移
          navigate(getPostUrl(data), {
            state: {
              justPosted: true,
              postPreview: data
            }
          });
        }
      } else {
        const err = await res.json();
        setWarningMessage(err.error || '手紙の登録に失敗しました。入力内容をご確認ください。');
        setIsPreviewMode(false);
      }
    } catch (e) {
      console.error(e);
      setWarningMessage('通信エラーが発生しました。インターネット接続を確認して再度お試しください。');
      setIsPreviewMode(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. プレビュー画面からプラン選択ボタン押下
  const handleSelectPlan = (plan: 'free' | 'ekyc') => {
    setPendingPlan(plan);
    if (!token) {
      // 未ログインの場合は無料アカウント登録モーダルを開く
      setShowAuthModal(true);
    } else {
      // ログイン済みの場合は手紙作成を実行
      executeSubmitPost(token, plan === 'ekyc');
    }
  };

  // 4. モーダル内でのアカウント登録 / ログイン処理
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('メールアドレスとパスワードを入力してください。');
      return;
    }
    if (authMode === 'register' && authPassword.length < 8) {
      setAuthError('パスワードは8文字以上で設定してください。');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload: any = {
        username: authEmail.trim(),
        email: authEmail.trim(),
        password: authPassword
      };
      if (authMode === 'register') {
        payload.fullName = fullName;
        payload.lastName = formData.lastName.trim();
        payload.firstName = formData.firstName.trim();
        payload.maidenName = formData.maidenName.trim();
        payload.contactType = formData.contactType;
        payload.contactId = formData.contactId.trim();
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setShowAuthModal(false);
        // 登録・ログイン完了と同時に選択プランで手紙を自動投稿
        await executeSubmitPost(data.token, pendingPlan === 'ekyc');
      } else {
        setAuthError(data.error || (authMode === 'register' ? 'アカウント登録に失敗しました。' : 'ログインに失敗しました。'));
      }
    } catch (err) {
      console.error(err);
      setAuthError('通信エラーが発生しました。接続を確認してください。');
    } finally {
      setAuthLoading(false);
    }
  };

  // 5. SNSログイン/登録
  const handleSnsAuth = async (provider: 'line' | 'google') => {
    setAuthLoading(true);
    setAuthError(null);

    const demoUser = provider === 'line' ? `${authEmail || 'line_user'}@line.remeets.local` : `${authEmail || 'google_user'}@gmail.com`;
    const demoPass = provider === 'line' ? 'LineAuth2026!Sec' : 'GoogleAuth2026!Sec';

    try {
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: demoUser, password: demoPass })
      });

      if (!res.ok) {
        // 未登録の場合は自動新規登録
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: demoUser,
            email: demoUser,
            password: demoPass,
            fullName: fullName || `${provider.toUpperCase()} ユーザー`,
            lastName: formData.lastName.trim() || 'ユーザー',
            firstName: formData.firstName.trim() || provider.toUpperCase(),
            contactType: formData.contactType,
            contactId: formData.contactId.trim()
          })
        });
      }

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setShowAuthModal(false);
        await executeSubmitPost(data.token, pendingPlan === 'ekyc');
      } else {
        setAuthError(data.error || `${provider.toUpperCase()}連携に失敗しました。`);
      }
    } catch (err) {
      setAuthError(`${provider.toUpperCase()}連携の通信に失敗しました。`);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-12 space-y-6 md:space-y-8 animate-fade-in font-sans text-black text-left">
      <BackToHomeButton className="mb-2" />

      {/* =========================================================================
          A. プレビューモード（手紙を見つけた相手が実際に見るHTML画面のリアルプレビュー）
      ========================================================================= */}
      {isPreviewMode ? (
        <div className="space-y-6 animate-fade-in">
          {/* プレビュー中ヘッダーバナー */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-teal-600 to-emerald-600 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
                <Eye size={20} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full border border-white/30 inline-block font-mono">
                  LIVE HTML PREVIEW
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                  お相手が見る公開画面の完成プレビュー
                </h2>
                <p className="text-xs text-white/90 font-sans">
                  あなたを探すお相手がアクセスした際、この画面が表示されます。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPreviewMode(false);
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-white/95 hover:bg-white text-slate-800 hover:text-teal-900 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Edit3 size={13} />
              <span>入力画面に戻って修正</span>
            </button>
          </div>

          {/* 警告メッセージ */}
          {warningMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 shadow-sm">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* =========================================================================
              1. 投函プランの選択エリア（🌟 eKYC公的認証付き 600円 vs ✉️ 通常無料 0円）
          ========================================================================= */}
          <div className="bg-white rounded-3xl border-2 border-teal-500/40 p-6 sm:p-8 space-y-6 shadow-xl text-left">
            <div className="text-center space-y-1.5 max-w-lg mx-auto">
              <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200 inline-block font-sans">
                SELECT PUBLISH PLAN
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 font-serif">
                手紙の公開方法を選択してください
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                お相手があなたを見つけた際、<strong>「間違いなく本物のあの人だ！」</strong>と確信できるよう、公的本人確認（eKYC）認証マーク付きでの投函を推奨しています。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
              {/* プランA: 🌟 公的認証（eKYC）付き投函（おすすめ） */}
              <div className="relative rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/60 via-white to-orange-50/30 p-6 sm:p-7 space-y-4 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1 font-sans">
                  <Crown size={12} />
                  <span>おすすめ・信頼度 No.1</span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base sm:text-lg font-serif font-bold text-amber-950 flex items-center gap-1.5">
                        <span>公的本人確認（eKYC）付き</span>
                      </h4>
                      <p className="text-[11px] text-amber-800/80 font-sans mt-0.5">
                        本名と生まれ年を公的書類で証明
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-serif font-black text-amber-950">¥600</span>
                      <span className="text-[10px] text-amber-700 block font-sans">税込 / 1回のみ</span>
                    </div>
                  </div>

                  {/* 特徴リスト */}
                  <ul className="space-y-2 text-xs text-slate-700 font-sans pt-2 border-t border-amber-200/80">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full seal-rainbow flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                        <ShieldCheck size={11} />
                      </div>
                      <span className="leading-snug">
                        手紙と検索カードに<strong>動く虹色公的認証マーク（封蝋印）</strong>が付与
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        運転免許証等で<strong>氏名・年齢の一致が100%証明</strong>される
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        相手の「なりすまし不安」を解消し、<strong>再会エピソード返信率が大幅UP</strong>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('ekyc')}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-serif disabled:opacity-50"
                  >
                    <ShieldCheck size={16} className="text-amber-100" />
                    <span>公的認証付きで手紙を置く（600円） ✨</span>
                  </button>
                  <span className="text-[10px] text-amber-800/70 text-center block mt-1.5 font-sans">
                    ※ 審査落ち時や不一致時は全額即時自動返金
                  </span>
                </div>
              </div>

              {/* プランB: ✉️ 通常無料投函 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white p-6 sm:p-7 space-y-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full inline-block font-mono">
                        BASIC
                      </span>
                      <h4 className="text-base sm:text-lg font-serif font-bold text-slate-800 mt-1">
                        通常の手紙として置く
                      </h4>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        まずは費用をかけずに目印を設置
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-serif font-bold text-slate-900">¥0</span>
                      <span className="text-[10px] text-slate-500 block font-sans">完全無料</span>
                    </div>
                  </div>

                  {/* 特徴リスト */}
                  <ul className="space-y-2 text-xs text-slate-600 font-sans pt-2 border-t border-slate-200">
                    <li className="flex items-start gap-2">
                      <Check size={15} className="text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        初期費用・月額維持費は一切かかりません
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={15} className="text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        いつでも後からマイページで公的認証を追加可能
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400">
                      <span className="text-[11px] leading-snug">
                        ※ 公的認証マークは付与されず通常表示となります
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('free')}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-serif disabled:opacity-50"
                  >
                    <Send size={15} className="text-slate-300" />
                    <span>無料で手紙を置く（0円）</span>
                  </button>
                  <span className="text-[10px] text-slate-400 text-center block mt-1.5 font-sans">
                    ※ 永久無料（維持費などは一切不要）
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 💌 2. お相手が見る実際の手紙詳細カード（本番HTMLと100%同一） */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 font-sans">
                <Eye size={14} className="text-teal-600" />
                <span>お相手が見る公開画面の実物プレビュー</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                REAL HTML VIEW
              </span>
            </div>

            <div className="relative rounded-3xl bg-gradient-to-br from-white via-teal-50/20 to-sky-50/30 border-2 border-teal-300/80 p-6 sm:p-10 shadow-lg text-left space-y-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

              {/* ヘッダー情報 */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    {formData.hometownPref || '全国'}
                  </span>
                  {formData.birthYear && (
                    <span className="text-xs font-bold bg-sky-100 text-sky-900 px-3 py-1 rounded-full font-mono">
                      {formatBirthYearLabel(parseInt(formData.birthYear, 10))}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    #NEW-PREVIEW
                  </span>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-white/90 border border-teal-200 px-3 py-1 rounded-full shadow-2xs">
                  💌 私を探すあなたへ
                </span>
              </div>

              {/* 氏名・旧姓 */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 font-sans">手紙を置いた人</span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-wide">
                  {fullName || 'お名前'}
                  {formData.maidenName && (
                    <span className="text-sm sm:text-base font-normal text-slate-500 font-sans ml-2">
                      （旧姓: {formData.maidenName}）
                    </span>
                  )}
                </h1>
              </div>

              {/* メッセージ本文 */}
              <div className="p-6 sm:p-8 bg-white/95 rounded-2xl border border-slate-200 shadow-inner space-y-3 font-serif">
                <span className="text-xs text-teal-700 font-bold block uppercase tracking-widest font-sans">
                  MESSAGE
                </span>
                <p className="text-sm sm:text-base md:text-lg text-slate-800 leading-relaxed sm:leading-loose whitespace-pre-wrap">
                  {formData.message || '私を探しているあなたへ。メッセージをお待ちしています。'}
                </p>
              </div>

              {/* メインCTA（相手側の視点） */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-teal-100">
                <div className="text-xs text-slate-600 font-sans space-y-0.5 text-center sm:text-left">
                  <span className="font-bold text-slate-800 block">この人に心当たりはありませんか？</span>
                  <span>当時のエピソードを添えて、無料で再会希望を申請できます。</span>
                </div>

                <div className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 opacity-90 cursor-default shadow-sm pointer-events-none">
                  <Send size={15} className="text-teal-200" />
                  <span>この人に再会を希望する（相手用ボタン）</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 安心解説: 相互承認制・eKYC本人確認の仕組み図解 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-teal-700 tracking-[0.25em] uppercase font-sans">
                SAFETY & PRIVACY
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                安心・安全の相互承認フロー
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                一方的な連絡先開示や悪用を防ぐため、完全な相互合意制を採用しています。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-sans text-xs">
              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-1.5">
                <span className="text-[10px] font-bold text-teal-700 font-mono block">STEP 1</span>
                <strong className="text-slate-900 block">エピソード送信（無料）</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  相手が当時の思い出を添えて申請。あなた宛てにメールで通知が届きます。
                </p>
              </div>

              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1.5">
                <span className="text-[10px] font-bold text-sky-700 font-mono block">STEP 2</span>
                <strong className="text-slate-900 block">あなたが確認＆承認</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  あなたが届いたエピソードを読み、「本人だ！」と納得して承認します。
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-700 font-mono block">STEP 3</span>
                <strong className="text-slate-900 block">連絡先を安全に交換</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  相互承認後、登録したLINEやメール等の連絡先が安全に開示されます。
                </p>
              </div>
            </div>
          </div>

          {/* 4. 入力修正フッターバー */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <span className="text-xs text-slate-600 font-sans">
              内容を変更したい箇所はありますか？
            </span>
            <button
              type="button"
              onClick={() => {
                setIsPreviewMode(false);
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>入力画面に戻って手紙を修正する</span>
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
            B. 入力フォームモード（1ページ完結）
        ========================================================================= */
        <div className="space-y-6 md:space-y-8">
          {/* Page Header */}
          <PageHeader
            icon={<Send size={24} className="text-teal-600" />}
            iconBoxClassName="bg-teal-50 text-teal-600 border border-teal-100"
            category="Create Letter"
            badge={
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-sans">
                完全無料・防犯設計
              </span>
            }
            title="目印の手紙を置く"
            description="私を探している誰かに向けて、あなたの目印を置いておきましょう。学校名や詳細な住所は非公開のため、プライバシーを完全に守りながら待つことができます。"
          />

          {/* 🧪 【テスト・動作確認用】一括自動入力バー */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 font-sans">
                <Sparkles size={14} className="text-amber-600 shrink-0" />
                <span>【テスト用】ワンクリック一括自動入力</span>
              </span>
              <span className="text-[10px] text-amber-700/70 font-mono">
                検証用ショートカット
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    lastName: '山田',
                    firstName: '太郎',
                    maidenName: '',
                    birthYear: '1985',
                    hometownPref: '神奈川県',
                    message: '元気にしていますか？あの時一緒に過ごした放課後の夕暮れの風景を今でもよく思い出します。もし私を探してくれたら、メッセージを届けてください。',
                    contactType: 'LINE',
                    contactId: 'yamada_taro_test2026',
                    contactNote: '平日の夜ならいつでもLINE返信できます！'
                  });
                  setAgreed(true);
                  setAuthEmail('yamada_test@example.com');
                  setAuthPassword('password123');
                }}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>👤 山田 太郎（昭和60年生・神奈川）</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    lastName: '佐藤',
                    firstName: '美咲',
                    maidenName: '高橋',
                    birthYear: '1990',
                    hometownPref: '東京都',
                    message: '中学を卒業してから随分経ちましたね。みんなで集まった時の写真を見るたび懐かしくなります。見つけたら気軽に声をかけてね。',
                    contactType: 'EMAIL',
                    contactId: 'misaki_sato_test@example.com',
                    contactNote: 'メールは毎日チェックしています。'
                  });
                  setAgreed(true);
                  setAuthEmail('misaki_test@example.com');
                  setAuthPassword('password123');
                }}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>🌸 佐藤 美咲（旧姓:高橋・東京）</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    lastName: '鈴木',
                    firstName: '健一',
                    maidenName: '',
                    birthYear: '1978',
                    hometownPref: '大阪府',
                    message: '昔お世話になった皆様へ。ふと当時の温かい思い出が蘇り、こちらに手紙を置くことにしました。元気でお過ごしでしょうか。',
                    contactType: 'LINE',
                    contactId: 'suzuki_kenichi_1978',
                    contactNote: '週末に返信いたします。'
                  });
                  setAgreed(true);
                  setAuthEmail('suzuki_test@example.com');
                  setAuthPassword('password123');
                }}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>☕ 鈴木 健一（昭和53年生・大阪）</span>
              </button>
            </div>
          </div>

          {/* 🛡️ 公開メッセージの「安心の約束ごと（3箇条）」バナー */}
          <div className="bg-gradient-to-br from-teal-50/90 via-sky-50/60 to-emerald-50/80 border border-teal-200/90 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm sm:text-base font-serif">
              <ShieldCheck size={20} className="text-teal-600 shrink-0" />
              <span>安心・安全のための「公開メッセージの約束ごと」</span>
            </div>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              手紙はGoogle検索等にも掲載される目印となります。悪質な居場所特定や嫌がらせを防ぐため、以下のルールをお守りください。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-3 bg-white/90 rounded-2xl border border-teal-100 shadow-2xs space-y-1">
                <span className="font-bold text-rose-700 block">🚫 学校名・会社名は書かない</span>
                <span className="text-[11px] text-slate-500 leading-tight block">
                  〇〇高校、〇〇大学、勤務先などの固有名詞は避けてください。
                </span>
              </div>
              <div className="p-3 bg-white/90 rounded-2xl border border-teal-100 shadow-2xs space-y-1">
                <span className="font-bold text-rose-700 block">🚫 駅名・詳細住所は書かない</span>
                <span className="text-[11px] text-slate-500 leading-tight block">
                  最寄り駅や町名・番地は書かず、都道府県のみで目印を置きます。
                </span>
              </div>
              <div className="p-3 bg-white/90 rounded-2xl border border-teal-100 shadow-2xs space-y-1">
                <span className="font-bold text-emerald-700 block">⭕ 二人だけの思い出を書く</span>
                <span className="text-[11px] text-slate-500 leading-tight block">
                  「文化祭のバンド」「部活帰りのアイス」など懐かしい情景が最適です。
                </span>
              </div>
            </div>
          </div>

          {/* 警告メッセージ */}
          {warningMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-shake shadow-sm">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <span>{warningMessage}</span>
            </div>
          )}

          <form onSubmit={handleGoToPreview} className="space-y-6">
            {/* 1. あなたについて（目印となる情報） */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">あなたについて（目印）</h3>
                  <p className="text-xs text-slate-500 font-sans">探す方があなたを見つけられるよう、お名前とゆかりの都道府県を入力します。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    お名前（姓）<span className="text-rose-500 ml-1 font-bold">*必須</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="例：山田"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    お名前（名）<span className="text-rose-500 ml-1 font-bold">*必須</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="例：太郎"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                  <span>旧姓・当時の苗字</span>
                  <span className="text-slate-400 font-normal text-[11px]">任意（結婚等で改姓された方）</span>
                </label>
                <input
                  type="text"
                  value={formData.maidenName}
                  onChange={e => setFormData(prev => ({ ...prev, maidenName: e.target.value }))}
                  placeholder="例：佐藤（当時の苗字）"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>生まれ年（西暦・和暦）</span>
                    <span className="text-teal-700 font-bold text-[11px]">同姓同名判別用</span>
                  </label>
                  <select
                    value={formData.birthYear}
                    onChange={e => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
                    className="w-full px-3.5 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="">生まれ年を選択（任意）</option>
                    {BIRTH_YEAR_OPTIONS.map(opt => (
                      <option key={opt.year} value={opt.year}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    ゆかりの地（都道府県）<span className="text-rose-500 ml-1 font-bold">*必須</span>
                  </label>
                  <select
                    required
                    value={formData.hometownPref}
                    onChange={e => setFormData(prev => ({ ...prev, hometownPref: e.target.value }))}
                    className="w-full px-3.5 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="">都道府県を選択</option>
                    {PREFECTURES.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. 探している相手に向けた公開メッセージ */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 sm:p-7 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">メッセージ（公開）</h3>
                    <p className="text-xs text-slate-500 font-sans">あなたを探している相手に向けた温かいひと言をご記入ください。</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {formData.message.length}文字（15文字以上）
                </span>
              </div>

              <div className="space-y-2">
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="例：元気にしていますか？あの時一緒に過ごした放課後の夕暮れの風景を今でもよく思い出します。もし私を探してくれたら、メッセージを届けてください。"
                  className="w-full p-4 text-sm border border-slate-200 rounded-2xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner font-serif leading-relaxed"
                />

                {/* リアルタイム検知アラート */}
                {privacyWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-fade-in">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>{privacyWarning}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. 再会時の開示連絡先（非公開・完全保護） */}
            <div className="bg-white rounded-3xl border-2 border-teal-300/80 p-5 sm:p-7 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-2xs">
                <Lock size={10} />
                <span>一般非公開・暗号化保護</span>
              </div>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-1.5">
                    <span>再会時の開示連絡先</span>
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-sans">
                      承認時のみ開示
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    相手があなたを見つけ、送られてきたエピソードを<strong>あなたが承認した時だけ</strong>相互に開示されます。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    連絡手段<span className="text-rose-500 ml-1 font-bold">*必須</span>
                  </label>
                  <select
                    value={formData.contactType}
                    onChange={e => setFormData(prev => ({ ...prev, contactType: e.target.value }))}
                    className="w-full px-3.5 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="LINE">LINE ID</option>
                    <option value="EMAIL">メールアドレス</option>
                    <option value="PHONE">電話番号（SMS）</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {formData.contactType === 'LINE' ? 'LINE ID' : formData.contactType === 'EMAIL' ? 'メールアドレス' : '電話番号'}
                    <span className="text-rose-500 ml-1 font-bold">*必須</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactId}
                    onChange={e => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                    placeholder={formData.contactType === 'LINE' ? '例：taro_line_1234' : '例：your-email@example.com'}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                  <span>お相手へのひとこと連絡メモ</span>
                  <span className="text-slate-400 font-normal text-[11px]">任意</span>
                </label>
                <input
                  type="text"
                  value={formData.contactNote}
                  onChange={e => setFormData(prev => ({ ...prev, contactNote: e.target.value }))}
                  placeholder="例：平日の夜か週末ならいつでもLINE返信できます！"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* 4. リアルタイムGoogle検索プレビュー */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 font-serif flex items-center gap-1.5">
                  <Eye size={14} className="text-teal-600" />
                  <span>Google検索結果での表示プレビュー</span>
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  ※学校名や連絡先は表示されません
                </span>
              </div>

              <GoogleSearchResultPreview
                targetName={fullName || 'あなたのお名前'}
                targetMaidenName={formData.maidenName}
                targetHometown={formData.hometownPref || 'ゆかりの都道府県'}
                searcherProfile={formData.message || '私を探しているあなたへ。メッセージをお待ちしています。'}
                era={formData.birthYear ? `${formData.birthYear}年生まれ` : undefined}
              />
            </div>

            {/* 利用規約同意 ＆ 確認プレビューへ進むボタン */}
            <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm text-center">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700 font-sans select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                />
                <span>
                  <Link to="/terms" target="_blank" className="text-teal-700 font-bold underline hover:text-teal-800">利用規約</Link>
                  および
                  <Link to="/privacy" target="_blank" className="text-teal-700 font-bold underline hover:text-teal-800">プライバシーポリシー</Link>
                  、上記の安心ルールに同意します
                </span>
              </label>

              <div>
                <button
                  type="submit"
                  disabled={!agreed}
                  className="w-full sm:w-auto min-w-[300px] px-8 py-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 active:scale-98 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer inline-flex items-center justify-center gap-2 font-serif"
                >
                  <Eye size={18} />
                  <span>お相手が見る公開画面を確認する ✨</span>
                  <ArrowRight size={16} />
                </button>
                <p className="text-[11px] text-slate-400 mt-2 font-sans">
                  ※ 次の画面で、お相手が実際に見るHTML画面のプレビューを確認して手紙を流せます。
                </p>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          C. 無料アカウント登録 / ログインモーダル（未ログイン時に表示）
      ========================================================================= */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans" data-lenis-prevent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 relative text-left"
            >
              {/* 閉じるボタン */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
                aria-label="閉じる"
              >
                ✕
              </button>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/80">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-sans">
                      {authMode === 'register' ? 'Free Registration' : 'Login'}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 mt-0.5">
                      {authMode === 'register' ? '無料アカウント登録（手紙の設置）' : 'ログインして手紙を公開'}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed font-sans space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                    <span>なぜアカウント登録が必要なのですか？</span>
                  </p>
                  <p>
                    あなたを探しているお相手から「再会エピソード」が届いた際、<strong>メールで確実に通知をお届けし、安全に承認・開示手続きを行うため</strong>に必要です。
                  </p>
                </div>

                {/* SNSログイン / 登録 */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSnsAuth('line')}
                      disabled={authLoading}
                      className="py-2.5 px-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className="font-black text-[13px]">LINE</span>
                      <span>で簡単登録</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSnsAuth('google')}
                      disabled={authLoading}
                      className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className="font-black text-rose-500 text-[13px]">G</span>
                      <span>oogleで登録</span>
                    </button>
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-sans">またはメールアドレス</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold flex items-center gap-2 animate-shake">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-left font-sans">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      通知先メールアドレス（必須）
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                      <span>パスワード（8文字以上）</span>
                      <span className="text-[10px] text-slate-400 font-normal">英数字</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={authMode === 'register' ? 8 : 1}
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{authMode === 'register' ? '登録して手紙を置く（完全無料） ✨' : 'ログインして手紙を置く ✨'}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* モード切り替え */}
                <div className="pt-2 border-t border-slate-100 text-center">
                  {authMode === 'register' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      className="text-xs text-teal-700 hover:underline font-bold cursor-pointer font-sans"
                    >
                      既にアカウントをお持ちの方はこちら（ログイン） →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError(null);
                      }}
                      className="text-xs text-teal-700 hover:underline font-bold cursor-pointer font-sans"
                    >
                      新しくアカウントを作成する（無料新規登録） →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌈 公的本人確認（eKYC）認証 ＆ 600円決済モーダル */}
      <MypageEkycModal
        isOpen={showEkycModal}
        onClose={() => {
          setShowEkycModal(false);
          if (createdPostData) {
            navigate(getPostUrl(createdPostData), {
              state: {
                justPosted: true,
                postPreview: {
                  ...createdPostData,
                  is_ekyc_verified: Boolean(user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true')
                }
              }
            });
          }
        }}
        user={user}
        token={token}
        updateUser={(updated) => {
          updateUser(updated);
          if (createdPostData) {
            // 手紙側にも eKYC 認証反映
            fetch(`/api/posts/${createdPostData.id}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }).catch(() => {});
          }
        }}
      />
    </div>
  );
};
