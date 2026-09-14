import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, BookOpen, Check, CheckCircle2,
  HelpCircle, Info, Lock, MapPin, Send, Shield,
  ShieldCheck, Sparkles, User, AlertTriangle, Eye, AlertCircle, Calendar,
  Edit3, Mail, Key, Crown, CreditCard, FileCheck, Share2, Copy
} from 'lucide-react';
import { useAuth, useNgFilter } from '../../contexts/AuthContext';
import { PREFECTURES, BIRTH_YEAR_OPTIONS, formatBirthYearLabel, getPostUrl, PageHeader } from '../../lib/utils';
import { GoogleSearchResultPreview, BackToHomeButton } from '../../components/SharedComponents';
import { MypageEkycModal } from '../../components/account/MypageEkycModal';
import { EkycExplanationModal } from '../../components/posts/EkycExplanationModal';

export const CreatePostPage = () => {
  const { user, token, login, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { check: checkNg } = useNgFilter();

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    maidenName: '',
    maidenNameKana: '',
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

  // 進行ステップ ('form': メッセージ作成, 'preview': プレビュー確認, 'plan': 公開方法選択, 'success': 投函完了)
  const [step, setStep] = useState<'form' | 'preview' | 'plan' | 'success'>('form');

  // 選択されたプラン ('free' | 'ekyc')
  const [pendingPlan, setPendingPlan] = useState<'free' | 'ekyc'>('ekyc');

  // プレビュー表示切り替えタブ ('ekyc': 認証あり表示, 'free': 通常無料表示)
  const [previewTab, setPreviewTab] = useState<'ekyc' | 'free'>('ekyc');

  // 公認バッジ証明内容モーダル表示ステート
  const [showEkycExplanationModal, setShowEkycExplanationModal] = useState(false);

  // 公開URLコピー完了ステート
  const [copiedUrl, setCopiedUrl] = useState(false);

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
      const userLastName = (user as any).lastName || (user.fullName ? user.fullName.trim().split(/\s+/)[0] : '');
      const userFirstName = (user as any).firstName || (user.fullName ? user.fullName.trim().split(/\s+/).slice(1).join(' ') : '');

      setFormData(prev => ({
        ...prev,
        lastName: prev.lastName || userLastName || '',
        firstName: prev.firstName || userFirstName || '',
        maidenName: prev.maidenName || (user as any).maiden_name || '',
        hometownPref: prev.hometownPref || (user as any).hometown || '',
        birthYear: prev.birthYear || (user.birthdate ? new Date(user.birthdate).getFullYear().toString() : ''),
        contactType: prev.contactId ? prev.contactType : ((user as any).contact_type || 'LINE'),
        contactId: prev.contactId || (user as any).contact_id || ''
      }));

      if (user.email && !authEmail) {
        setAuthEmail(user.email);
      }

      // 既存の公開メッセージの確認（原則1人1通ポリシー）
      if (token) {
        fetch('/api/posts/my-posts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(posts => {
            if (Array.isArray(posts) && posts.length > 0) {
              setExistingUserPost(posts[0]);
            }
          })
          .catch(() => {});
      }
    }
  }, [user, token]);

  const [existingUserPost, setExistingUserPost] = useState<any | null>(null);

  const fullName = `${formData.lastName || ''} ${formData.firstName || ''}`.trim();
  const rawKanaStr = (formData.lastNameKana || formData.firstNameKana) ? `${formData.lastNameKana || ''} ${formData.firstNameKana || ''}` : '';
  const fullNameKana = rawKanaStr.replace(/undefined/g, '').trim();

  // リアルタイム特定情報（学校名・会社名・駅名・連絡先等）の検知ロジック
  const getPrivacyWarning = (text: string): string | null => {
    if (!text) return null;

    // 具体的な学校名（例: 〇〇高校、〇〇中学校、〇〇大学）
    if (/(?:市立|県立|都立|府立|道立|私立|国立)?.{2,10}(?:高等学校|高校|中学校|小学校|幼稚園|保育園|大学)/.test(text)) {
      return '防犯のため、具体的な学校名・大学名は含めず、当時の部活動や放課後の様子などの思い出をご記入ください。';
    }
    // 具体的な会社名
    if (/(?:株式会社|有限会社|合同会社|合資会社).{2,10}/.test(text)) {
      return 'プライバシー保護のため、会社名・勤務先名は含めずにご記入ください。';
    }
    // 詳細な丁目番地
    if (/\d+丁目\d+番|\d+-\d+-\d+/.test(text)) {
      return '居場所特定を防ぐため、詳細な町名・番地は含めずにご記入ください。';
    }
    // 直接の連絡先露出
    if (text.match(/0\d{1,4}-?\d{1,4}-?\d{4}/) || text.includes('@') || /line\s*id|ライン\s*id/i.test(text)) {
      return '本文中に直接連絡先を記載することはできません。連絡先は下記の【再会時の開示連絡先】欄にご入力ください。';
    }
    return null;
  };

  const privacyWarning = getPrivacyWarning(formData.message);

  // 🤖 AI メッセージ自動作文用 state & ハンドラー
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiSituation, setAiSituation] = useState<'school_friends' | 'teacher_senior' | 'work_colleague' | 'general_gratitude'>('school_friends');
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  const handleGenerateAiMessage = async (customSit?: 'school_friends' | 'teacher_senior' | 'work_colleague' | 'general_gratitude') => {
    const sit = customSit || aiSituation;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/posts/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastName: formData.lastName,
          firstName: formData.firstName,
          maidenName: formData.maidenName,
          hometownPref: formData.hometownPref,
          birthYear: formData.birthYear,
          situation: sit
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setFormData(prev => ({ ...prev, message: data.message }));
        setAiGeneratedSuccess(true);
        setTimeout(() => setAiGeneratedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('AI draft generation error:', err);
    } finally {
      setAiGenerating(false);
    }
  };

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
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setWarningMessage('昔の知人や友人に向けたメッセージを10文字以上で入力してください。');
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

  // 1. 「ネット公開画面の完成プレビューを確認する」ボタン押下
  const handleGoToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. 実際にメッセージを保存・公開する処理
  const executeSubmitPost = async (authToken?: string, withEkyc?: boolean) => {
    const activeToken = authToken || token;
    const isEkycPlan = withEkyc !== undefined ? withEkyc : pendingPlan === 'ekyc';

    if (isSubmitting) return;
    setIsSubmitting(true);
    setWarningMessage(null);

    const effLastName = formData.lastName.trim() || (user as any)?.lastName || (user?.fullName ? user.fullName.split(' ')[0] : '');
    const effFirstName = formData.firstName.trim() || (user as any)?.firstName || (user?.fullName ? user.fullName.split(' ').slice(1).join(' ') : '');
    const effFullName = `${effLastName} ${effFirstName}`.trim();
    const effLastNameKana = formData.lastNameKana.trim();
    const effFirstNameKana = formData.firstNameKana.trim();
    const effFullNameKana = `${effLastNameKana} ${effFirstNameKana}`.trim();
    const effMaidenName = formData.maidenName.trim();
    const effMaidenNameKana = formData.maidenNameKana.trim();
    const effHometown = formData.hometownPref || '東京都';
    const effMessage = formData.message.trim() || '元気にしていますか？あの時一緒に過ごした放課後の夕暮れの風景を今でもよく思い出します。もし私を探してくれたら、メッセージを届けてください。';
    const effContactId = formData.contactId.trim() || (user as any)?.contact_id || '';
    const effContactType = formData.contactType || 'LINE';
    const effBirthYear = formData.birthYear ? parseInt(formData.birthYear, 10) : (user?.birthdate ? new Date(user.birthdate).getFullYear() : 1990);

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
          searcherName: effFullName,
          searcherFullName: effFullName,
          searcherMaidenName: effMaidenName,
          searcherLastNameKana: effLastNameKana || undefined,
          searcherFirstNameKana: effFirstNameKana || undefined,
          searcherNameKana: effFullNameKana || undefined,
          searcherMaidenNameKana: effMaidenNameKana || undefined,
          birthYear: effBirthYear,
          // SeekMeの投稿構造: 探す対象は自分自身（自分からのメッセージを届けておく）
          targetName: effFullName, // SeekMe では自分自身の情報
          targetLastName: effLastName,
          targetFirstName: effFirstName,
          targetLastNameKana: effLastNameKana || undefined,
          targetFirstNameKana: effFirstNameKana || undefined,
          targetNameKana: effFullNameKana || undefined,
          targetMaidenNameKana: effMaidenNameKana || undefined,
          targetHometown: effHometown,
          message: effMessage,
          contactType: effContactType,
          contactId: effContactId,
          contactNote: formData.contactNote.trim(),
          questions: [
            { question: '当時の思い出のエピソード', answer: '相互承認で確認' },
            { question: 'ゆかりの都道府県', answer: effHometown }
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
          // ✉️ 無料プランの場合: 投函完了（Step 4）画面へ遷移
          setStep('success');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const err = await res.json();
        setWarningMessage(err.error || 'メッセージの登録に失敗しました。入力内容をご確認ください。');
        setStep('plan');
      }
    } catch (e) {
      console.error(e);
      setWarningMessage('通信エラーが発生しました。インターネット接続を確認して再度お試しください。');
      setStep('form');
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
      // ログイン済みの場合はメッセージ作成を実行
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
        payload.fullName = fullName || `${formData.lastName} ${formData.firstName}`.trim();
        payload.lastName = formData.lastName.trim();
        payload.firstName = formData.firstName.trim();
        payload.nickname = fullName || `${formData.lastName} ${formData.firstName}`.trim();
        payload.birthdate = formData.birthYear ? `${formData.birthYear}-01-01` : '1990-01-01';
        payload.maidenName = formData.maidenName.trim();
        payload.contactType = formData.contactType;
        payload.contactId = formData.contactId.trim() || 'contact_id';
        payload.captchaAnswer = '4';
        payload.quickPost = true;
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
        // 登録・ログイン完了と同時に選択プランでメッセージを自動投稿
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

  // 4.5 テスト用のワンクリック自動アカウント登録＆メッセージ設置
  const handleQuickTestAuth = async () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const testEmail = `test_user_${rand}@example.com`;
    const testPassword = 'Password123!';
    setAuthEmail(testEmail);
    setAuthPassword(testPassword);
    setAuthLoading(true);
    setAuthError(null);

    try {
      const payload: any = {
        username: testEmail,
        email: testEmail,
        password: testPassword,
        fullName: fullName || `${formData.lastName} ${formData.firstName}`.trim(),
        lastName: formData.lastName.trim(),
        firstName: formData.firstName.trim(),
        nickname: fullName || `${formData.lastName} ${formData.firstName}`.trim(),
        birthdate: formData.birthYear ? `${formData.birthYear}-01-01` : '1990-01-01',
        maidenName: formData.maidenName.trim(),
        contactType: formData.contactType,
        contactId: formData.contactId.trim() || 'contact_id',
        captchaAnswer: '4',
        quickPost: true
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setShowAuthModal(false);
        await executeSubmitPost(data.token, pendingPlan === 'ekyc');
      } else {
        setAuthError(data.error || 'テストアカウント登録に失敗しました。');
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

      {/* ステップバー（進行インジケーター） */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 max-w-xl mx-auto mb-4 text-xs font-bold font-sans">
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
          step === 'form' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            step === 'form' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
          }`}>1</span>
          <span>メッセージ作成</span>
        </div>
        <span className="text-slate-300 font-bold">→</span>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
          step === 'preview' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            step === 'preview' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
          }`}>2</span>
          <span>プレビュー確認</span>
        </div>
        <span className="text-slate-300 font-bold">→</span>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
          step === 'plan' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            step === 'plan' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
          }`}>3</span>
          <span>公開方法選択</span>
        </div>
        <span className="text-slate-300 font-bold">→</span>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
          step === 'success' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            step === 'success' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
          }`}>4</span>
          <span>公開完了</span>
        </div>
      </div>

      {/* =========================================================================
          A. プレビュー画面（メッセージを見つけた相手が実際に見るHTML画面のリアルプレビュー & 見え方比較）
      ========================================================================= */}
      {step === 'preview' ? (
        <div className="space-y-6 animate-fade-in">
          {/* プレビュー中ヘッダー */}
          <div className="space-y-1.5 px-1 py-1 font-sans">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-teal-500/10 text-teal-900 border border-teal-500/20 px-2.5 py-0.5 rounded-full inline-block font-mono">
                STEP 2: LIVE HTML PREVIEW
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
              ネット公開画面の完成プレビュー
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-sans">
              ネット上にメッセージが流された際、このような画面として公開されます。
            </p>
          </div>

          {/* 警告メッセージ */}
          {warningMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 shadow-sm">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* =========================================================================
              1. プレビュー見え方比較スイッチ（公認バッジ ON / OFF）
          ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowEkycExplanationModal(true)}
                  className="w-8 h-8 rounded-full seal-rainbow flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all ring-2 ring-amber-200"
                  title="クリックして公認バッジの証明内容を確認"
                >
                  <ShieldCheck size={16} />
                </button>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-serif">
                  公的本人確認（公認バッジ）の表示切替
                </h4>
                {previewTab === 'ekyc' ? (
                  <button
                    type="button"
                    onClick={() => setShowEkycExplanationModal(true)}
                    className="text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full font-sans cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>✨ バッジ表示中</span>
                    <span className="text-[9px] text-amber-700 underline">詳細確認</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-sans">
                    通常表示中
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                公的本人確認を行うと公認バッジが付与されます。それにより相手に安心感を与え、連絡をもらえる確率が格段に上がります。
              </p>
            </div>

            {/* ON / OFF 切り替えスイッチ */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setPreviewTab('ekyc')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewTab === 'ekyc'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs ring-2 ring-amber-300'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${previewTab === 'ekyc' ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                <span>公認バッジ ON</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('free')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewTab === 'free'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>OFF</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              2. 💌 ネット公開画面の実物プレビュー（本番HTMLと100%同一）
          ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                <Eye size={14} className="text-teal-600" />
                <span>ネット公開画面の実物プレビュー</span>
                {previewTab === 'ekyc' && (
                  <button
                    type="button"
                    onClick={() => setShowEkycExplanationModal(true)}
                    className="text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-md border border-amber-300 font-mono ml-1 cursor-pointer transition-colors inline-flex items-center gap-1"
                  >
                    <span>🌈 eKYC公認バッジ点灯中</span>
                    <span className="text-[9px] underline">（詳細確認 🔍）</span>
                  </button>
                )}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                REAL HTML VIEW
              </span>
            </div>

            <div className={`relative rounded-3xl bg-gradient-to-br from-white via-teal-50/20 to-sky-50/30 border-2 p-6 sm:p-10 shadow-lg text-left space-y-6 overflow-hidden transition-all ${
              previewTab === 'ekyc'
                ? 'border-amber-400/90 shadow-[0_10px_35px_rgba(251,191,36,0.18)]'
                : 'border-slate-300 shadow-md'
            }`}>
              {/* メッセージヘッダー */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-teal-100 pb-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-teal-800 tracking-wider font-sans bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>✉️</span>
                      <span>想い出再会プラットフォーム ReMEETs SEEKME 公開メッセージ</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-snug">
                      <span>{fullName || 'お名前'} 様から貴方へのメッセージです。</span>
                      {formData.maidenName && (
                        <span className="text-xs sm:text-sm font-normal text-slate-500 font-sans ml-1">
                          （旧姓: {formData.maidenName}{formData.maidenNameKana ? ` / ${formData.maidenNameKana}` : ''}）
                        </span>
                      )}
                    </h3>
                    {previewTab === 'ekyc' && (
                      <button
                        type="button"
                        onClick={() => setShowEkycExplanationModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 group shrink-0"
                        title="クリックして公的本人確認（eKYC）の証明内容を確認"
                      >
                        <div className="w-4 h-4 rounded-full seal-rainbow flex items-center justify-center text-white shadow-2xs shrink-0">
                          <ShieldCheck size={10} />
                        </div>
                        <span className="font-bold text-[11px]">公的本人確認済</span>
                        <span className="text-[9.5px] font-medium text-rose-700 bg-white/90 border border-rose-200 px-1.5 py-0.2 rounded-full group-hover:bg-rose-600 group-hover:text-white transition-colors">
                          詳細を見る 🔍
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 右側：公開予定日 ＆ eKYC大型封蝋バッジ */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-teal-100/60 sm:border-none">
                  <span className="text-xs text-slate-500 font-sans whitespace-nowrap">公開予定：本日</span>
                  {previewTab === 'ekyc' && (
                    <div className="relative group sm:mt-1">
                      <button
                        type="button"
                        onClick={() => setShowEkycExplanationModal(true)}
                        className="w-12 h-12 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-md hover:shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-300 shrink-0"
                        title="クリックして公的本人確認の証明内容を確認"
                      >
                        <ShieldCheck size={18} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] group-hover:rotate-6 transition-transform" />
                        <span className="text-[6px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-xs">eKYC済</span>
                      </button>
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8.5px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-1.5 py-0.2 rounded-full whitespace-nowrap pointer-events-none font-sans">
                        詳細 👆
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* メッセージメタデータ（大きめ・見やすい文字サイズ・高コントラスト） */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 font-sans shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block font-sans">メッセージを書いた人</span>
                  <div className="text-base sm:text-lg font-bold text-slate-950 font-serif">
                    <span>{fullName || '未入力'}</span>
                    {fullNameKana && (
                      <span className="text-xs font-normal text-slate-600 font-sans ml-1">
                        （{fullNameKana}）
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block font-sans">旧姓</span>
                  <div className="text-base sm:text-lg font-bold text-slate-950 font-serif">
                    <span>{formData.maidenName || 'なし'}</span>
                    {formData.maidenNameKana && (
                      <span className="text-xs font-normal text-slate-600 font-sans ml-1">
                        （{formData.maidenNameKana}）
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block font-sans">ゆかりの地</span>
                  <div className="text-base sm:text-lg font-bold text-slate-950 font-serif">
                    {formData.hometownPref || '未選択'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block font-sans">生まれ年</span>
                  <div className="text-base sm:text-lg font-bold text-slate-950 font-serif">
                    {formData.birthYear ? formatBirthYearLabel(formData.birthYear) : '非公開'}
                  </div>
                </div>
              </div>

              {/* メッセージ本文（便箋風・情緒ある明朝体・高コントラスト・くっきり濃い文字） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b-2 border-teal-100 pb-2">
                  <span className="text-xs sm:text-sm font-extrabold text-teal-900 font-sans flex items-center gap-1.5">
                    <span className="text-base">✉️</span>
                    <span>メッセージ本文（公開プレビュー）</span>
                  </span>
                  <span className="text-xs font-medium text-slate-600 font-sans">
                    当時の想い出・メッセージ
                  </span>
                </div>
                <div className="bg-white/95 p-6 sm:p-8 rounded-2xl border-2 border-slate-300/90 shadow-sm">
                  <p className="font-letter-mincho font-serif text-base sm:text-lg md:text-xl font-medium text-slate-950 leading-relaxed sm:leading-loose tracking-wide whitespace-pre-wrap">
                    {formData.message || (
                      <span className="text-slate-400 italic">（メッセージが入力されていません）</span>
                    )}
                  </p>
                </div>
              </div>

              {/* メインCTA（相手側の視点） */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-teal-100">
                <div className="text-xs text-slate-600 font-sans space-y-0.5 text-center sm:text-left">
                  <span className="font-bold text-slate-800 block">この人に心当たりはありませんか？</span>
                  <span>当時のエピソードを添えて、再会希望を申請できます。</span>
                </div>

                <div className="px-6 py-3 bg-gradient-to-r from-rose-100 via-pink-100 to-rose-200 text-rose-900 border border-rose-300 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 opacity-95 cursor-default shadow-2xs pointer-events-none font-serif">
                  <Send size={15} className="text-rose-600" />
                  <span>{fullName ? `${fullName}さんに再会を希望する` : '○○さんに再会を希望する'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. 連絡先がわからなくなってしまった貴方へ（再会のきっかけと安心ガイド）
          ========================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5 text-left font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-teal-700 tracking-widest uppercase font-mono flex items-center gap-1">
                  <span>ABOUT THIS MESSAGE</span>
                  <span>・</span>
                  <span>メッセージに込められた想いと安心の仕組み</span>
                </span>
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>🕊️ 連絡先がわからなくなってしまった貴方へ</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  「もう一度つながるきっかけ」として、当時の大切な想い出と共に届けられたメッセージです。
                </p>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-auto shadow-2xs">
                🔒 登録・返信無料 ／ 完全相互合意制
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. メッセージの目的 */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/70 to-emerald-50/30 rounded-2xl border border-teal-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    1
                  </div>
                  <strong className="text-slate-900 text-xs sm:text-sm font-bold block font-serif">
                    メッセージに込められた想い
                  </strong>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  引っ越しや環境の変化で連絡先が途絶えた大切な人に向けて、差出人が<strong>「もう一度話したい、元気か知りたい」</strong>という想いを込めて海に託したメッセージです。
                </p>
              </div>

              {/* 2. 心当たりがある時 */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-sky-50/70 to-blue-50/30 rounded-2xl border border-sky-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    2
                  </div>
                  <strong className="text-slate-900 text-xs sm:text-sm font-bold block font-serif">
                    心当たりがある時は
                  </strong>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  「自分宛てかもしれない」と思ったら、メッセージ下のボタンから<strong>当時の呼び名や想い出のエピソードを添えて返信</strong>できます（登録・申請は無料）。
                </p>
              </div>

              {/* 3. 安心の相互承認 */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/30 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    3
                  </div>
                  <strong className="text-slate-900 text-xs sm:text-sm font-bold block font-serif">
                    安心の相互合意システム
                  </strong>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  差出人がエピソードを読み<strong>『確かにあの頃の仲間だ！』と双方が納得した場合のみ</strong>連絡先が開示されます。第三者には一切公開されません。
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11.5px] text-slate-600 leading-relaxed flex items-center gap-2">
              <span className="text-base">✨</span>
              <span>一方的な連絡先開示や悪用はAIと相互承認システムで100%遮断されています。安心してお気持ちをお伝えください。</span>
            </div>
          </div>

          {/* =========================================================================
              4. プレビュー画面のフッターナビゲーション
          ========================================================================= */}
          <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setStep('form');
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
            >
              <ArrowLeft size={14} />
              <span>メッセージを修正する</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('plan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-serif"
            >
              <span>メッセージの公開方法を選択する（次へ）</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : step === 'plan' ? (
        /* =========================================================================
            B. 公開プラン選択画面（独立した第3ステップページ）
        ========================================================================= */
        <div className="space-y-6 animate-fade-in">
          {/* 警告メッセージ */}
          {warningMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 shadow-sm">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* 公開プラン選択メインカード */}
          <div className="bg-white rounded-3xl border-2 border-teal-500/40 p-6 sm:p-10 space-y-8 shadow-xl text-left">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200 inline-block font-sans">
                STEP 3: SELECT PUBLISH PLAN
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-serif">
                メッセージの公開方法を選択してください
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                お相手があなたを見つけた際、<strong>「間違いなく本物のあの人だ！」</strong>と確信できるよう、公的本人確認（eKYC）認証マーク付きでの投函を推奨しています。
              </p>

              {/* 💡 アカウント登録と通知・管理に関する重要案内 */}
              <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200 text-left text-xs text-sky-900 flex items-start gap-2.5 font-sans mt-3">
                <CheckCircle2 size={16} className="text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed">
                  <strong className="block text-sky-950 font-bold">メッセージの設置とアカウント連携について</strong>
                  <span>
                    お相手から再会エピソードが届いた際の<strong>メール通知</strong>および、マイページでの<strong>メッセージの再確認・管理</strong>のため、プラン選択後にアカウント登録（30秒）を行います。
                    {pendingPlan === 'ekyc' && ' 公的本人確認（eKYC）では身元確認証明のためアカウント登録が必須となります。'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-1">
              {/* プランA: 🌟 公的認証（eKYC）付き投函（おすすめ） */}
              <div className="relative rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-amber-50/80 via-white to-orange-50/40 p-6 sm:p-8 space-y-5 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between ring-4 ring-amber-400/20">
                <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Crown size={13} />
                  <span>おすすめ・信頼度 No.1</span>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg sm:text-xl font-serif font-bold text-amber-950 flex items-center gap-1.5">
                        <span>公的本人確認（eKYC）付き</span>
                      </h4>
                      <p className="text-xs text-amber-800/90 font-sans mt-0.5">
                        本名と生まれ年を公的書類で証明
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-serif font-black text-amber-950">¥600</span>
                      <span className="text-[10px] text-amber-700 block font-sans">税込 / 1回のみ</span>
                    </div>
                  </div>

                  {/* 特徴リスト */}
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-sans pt-3 border-t border-amber-200/80">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full seal-rainbow flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                        <ShieldCheck size={12} />
                      </div>
                      <span className="leading-snug">
                        メッセージと検索カードに<strong>動く虹色公的認証マーク（封蝋印）</strong>が付与
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={17} className="text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        運転免許証等で<strong>氏名・年齢の一致が100%証明</strong>される
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Sparkles size={17} className="text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        相手の「なりすまし不安」を解消し、<strong>再会エピソード返信率が大幅UP</strong>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 border-t border-amber-200/80">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('ekyc')}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-serif disabled:opacity-50"
                  >
                    <ShieldCheck size={18} className="text-amber-100" />
                    <span>公的認証付きでメッセージを届ける（600円） ✨</span>
                  </button>
                  <span className="text-[11px] text-amber-800/80 text-center block mt-2 font-sans">
                    ※ 審査落ち時や不一致時は全額即時自動返金
                  </span>
                </div>
              </div>

              {/* プランB: ✉️ 通常無料投函 */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white p-6 sm:p-8 space-y-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full inline-block font-mono">
                        BASIC
                      </span>
                      <h4 className="text-lg sm:text-xl font-serif font-bold text-slate-800 mt-1">
                        通常のメッセージとして届ける
                      </h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        まずは費用をかけずにメッセージを作成
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-serif font-bold text-slate-900">¥0</span>
                      <span className="text-[10px] text-slate-500 block font-sans">通常プラン</span>
                    </div>
                  </div>

                  {/* 特徴リスト */}
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-sans pt-3 border-t border-slate-200">
                    <li className="flex items-start gap-2.5">
                      <Check size={17} className="text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        初期費用・月額維持費は一切かかりません
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={17} className="text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        いつでも後からマイページで公的認証を追加可能
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 text-slate-400">
                      <span className="text-xs leading-snug">
                        ※ 公的認証マークは付与されず通常表示となります
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('free')}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-serif disabled:opacity-50"
                  >
                    <Send size={16} className="text-slate-300" />
                    <span>通常公開でメッセージを届ける</span>
                  </button>
                  <span className="text-[11px] text-slate-400 text-center block mt-2 font-sans">
                    ※ 維持費・月額費用などは一切不要
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 戻るフッターナビゲーション */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <button
              type="button"
              onClick={() => {
                setStep('preview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>プレビュー確認画面に戻る</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('form');
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold transition-all cursor-pointer underline"
            >
              メッセージの文章や内容を修正する
            </button>
          </div>
        </div>
      ) : step === 'success' ? (
        /* =========================================================================
            C. 投函・公開完了画面（インターネットの海にメッセージが公開された完了ページ）
        ========================================================================= */
        <div className="space-y-6 animate-fade-in text-left">
          {/* お祝いヘッダーバナー */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-emerald-800 to-teal-950 text-white p-6 sm:p-10 shadow-2xl text-center space-y-3 border-2 border-emerald-400/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-16 h-16 bg-white/15 rounded-3xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg text-amber-300 animate-bounce">
              <Sparkles size={32} />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-200 px-3.5 py-1 rounded-full border border-emerald-400/40 inline-block font-mono">
              PUBLISH COMPLETE
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">
              メッセージがインターネットの海に届けられました
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg mx-auto font-sans leading-relaxed">
              あなたを探しているお相手に向けた想い出のメッセージが正常に公開されました。お相手がこのメッセージを見つけ、当時の思い出を届けてくれる日を心待ちにしましょう。
            </p>
          </div>

          {/* 公開されたメッセージの要約カード */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 space-y-6 shadow-lg text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
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
                  #{createdPostData?.id || 'ONLINE'}
                </span>
              </div>

              {/* 認証マーク */}
              {(createdPostData?.is_ekyc_verified || pendingPlan === 'ekyc' || user?.is_ekyc_verified) ? (
                <span className="seal-rainbow px-3.5 py-1 text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 font-serif">
                  <ShieldCheck size={14} className="text-amber-200" />
                  <span>🌈 公的本人確認（eKYC）認証済み</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  ✉️ 通常のメッセージとして公開中
                </span>
              )}
            </div>

            {/* お名前 & メッセージ抜粋 */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-700 font-sans">メッセージを書いた人</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                  {fullName}
                  {formData.maidenName && (
                    <span className="text-sm font-normal text-slate-600 font-sans ml-2">
                      （旧姓: {formData.maidenName}）
                    </span>
                  )}
                </h2>
              </div>

              <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-slate-200 font-sans text-slate-950 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-xs">
                {formData.message}
              </div>
            </div>

            {/* 🔗 公開URLシェアボックス */}
            {createdPostData && (
              <div className="p-4 sm:p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-sans">
                    <Share2 size={14} className="text-teal-700" />
                    <span>あなたのメッセージの専用URL（シェア・保存用）</span>
                  </span>
                  <span className="text-[10px] text-teal-700 font-mono">
                    PUBLIC LINK
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${getPostUrl(createdPostData)}`}
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-teal-200 rounded-xl text-slate-700 font-mono select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${getPostUrl(createdPostData)}`);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2500);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                      copiedUrl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-700 hover:bg-teal-800 text-white'
                    }`}
                  >
                    {copiedUrl ? (
                      <>
                        <Check size={14} />
                        <span>コピー完了！</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>URLをコピー</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-teal-800/80 font-sans">
                  ※ SNSやブログ、メモ帳等にこのURLを保存しておくと、いつでも直接メッセージを開くことができます。
                </p>
              </div>
            )}
          </div>

          {/* 今後の流れと通知の確認カード */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm text-left font-sans">
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-teal-600" />
              <span>今後の通知とメッセージの管理について</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-1.5">
                <span className="text-[10px] font-bold text-teal-700 font-mono block">1. 通知メール</span>
                <strong className="text-slate-900 block">再会申請をメールでお届け</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  お相手があなたを見つけてエピソードを送信すると、ご登録のメールアドレス宛てに即座にお知らせが届きます。
                </p>
              </div>

              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1.5">
                <span className="text-[10px] font-bold text-sky-700 font-mono block">2. 相互承認制</span>
                <strong className="text-slate-900 block">安心のプライバシー保護</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  あなたが届いたエピソードを読んで「本人だ」と承認するまで、あなたの連絡先は相手に開示されません。
                </p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-800 font-mono block">3. いつでも再確認</span>
                <strong className="text-slate-900 block">マイページでメッセージを管理</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  ログイン後のマイページから、いつでもメッセージの内容再確認・メッセージ修正・取り下げが可能です。
                </p>
              </div>
            </div>
          </div>

          {/* メインCTAボタン群 */}
          <div className="p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl shadow-xl space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                次はどちらのページをご覧になりますか？
              </h3>
              <p className="text-xs text-slate-300 font-sans">
                公開された実際のメッセージページ、またはメッセージを管理できるマイページへ移動できます。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (createdPostData) {
                    navigate(getPostUrl(createdPostData), {
                      state: {
                        justPosted: true,
                        postPreview: createdPostData
                      }
                    });
                  } else {
                    navigate('/');
                  }
                }}
                className="py-4 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-serif"
              >
                <Eye size={18} />
                <span>公開された実際のメッセージを見に行く</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/account')}
                className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700 font-serif"
              >
                <User size={18} />
                <span>マイページでメッセージを管理・確認する</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-white underline font-sans"
              >
                トップページへ戻る
              </Link>
            </div>
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
                プライバシー・防犯設計
              </span>
            }
            title="メッセージを届ける"
            description="私を探している誰かに向けて、あなたからのメッセージを届けておきましょう。学校名や詳細な住所は非公開のため、プライバシーを完全に守りながら待つことができます。"
          />

          {/* 🧪 【テスト・動作確認用】一括自動入力バー */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 rounded-2xl border border-amber-300/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-sans">
                <Sparkles size={14} className="text-amber-600 shrink-0" />
                <span>【動作確認】ワンクリック自動入力 ＆ プレビューへ進む</span>
              </span>
              <span className="text-[10px] text-amber-800/80 font-mono">
                ショートカット
              </span>
            </div>

            {/* ログインユーザーがいる場合は最優先で自分自身の情報で入力するボタンを表示 */}
            {user && (
              <div className="p-3 bg-white rounded-xl border-2 border-teal-500 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName ? user.fullName.charAt(0) : '私'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-serif">
                      👤 あなたのアカウント情報（{user.fullName || '登録ユーザー'} 様）
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      ログイン中のご自身のお名前・連絡先でフォームを補完します
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const lName = (user as any).lastName || (user.fullName ? user.fullName.trim().split(/\s+/)[0] : '');
                      const fName = (user as any).firstName || (user.fullName ? user.fullName.trim().split(/\s+/).slice(1).join(' ') : '');
                      setFormData(prev => ({
                        ...prev,
                        lastName: lName,
                        firstName: fName,
                        maidenName: (user as any).maiden_name || '',
                        birthYear: user.birthdate ? new Date(user.birthdate).getFullYear().toString() : '1990',
                        hometownPref: prev.hometownPref || '東京都',
                        message: prev.message || '元気にしていますか？あの時一緒に過ごした放課後の夕暮れの風景を今でもよく思い出します。もし私を探してくれたら、メッセージを届けてください。',
                        contactType: (user as any).contact_type || 'LINE',
                        contactId: (user as any).contact_id || 'my_contact_id',
                        contactNote: 'メッセージを見つけていただきありがとうございます！'
                      }));
                      setAgreed(true);
                      setWarningMessage(null);
                      setStep('preview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <Sparkles size={12} className="text-teal-200" />
                    <span>ご自身の情報で入力してプレビューへ ➔</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* 1. 山田 太郎 */}
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <span>👤 サンプル：山田 太郎</span>
                  <span className="text-[10px] text-slate-500 font-normal">（昭和60年・神奈川）</span>
                </div>
                <div className="flex items-center gap-1.5">
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
                      setWarningMessage(null);
                      setStep('preview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    title="山田太郎のデータを入力して即座にプレビュー画面へ進む"
                  >
                    <Sparkles size={11} className="text-amber-200" />
                    <span>⚡ 入力して次へ進む</span>
                  </button>
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
                      setWarningMessage(null);
                    }}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    title="フォームに入力のみ"
                  >
                    入力のみ
                  </button>
                </div>
              </div>

              {/* 2. 佐藤 美咲 */}
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <span>🌸 佐藤 美咲</span>
                  <span className="text-[10px] text-slate-500 font-normal">（旧姓:高橋・東京）</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        lastName: '佐藤',
                        firstName: '美咲',
                        maidenName: '高橋',
                        birthYear: '1990',
                        hometownPref: '東京都',
                        message: '学生時代を卒業してから随分経ちましたね。みんなで集まった時の写真を見るたび懐かしくなります。見つけたら気軽に声をかけてね。',
                        contactType: 'EMAIL',
                        contactId: 'misaki_sato_test@example.com',
                        contactNote: 'メールは毎日チェックしています。'
                      });
                      setAgreed(true);
                      setAuthEmail('misaki_test@example.com');
                      setAuthPassword('password123');
                      setWarningMessage(null);
                      setStep('preview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    title="佐藤美咲のデータを入力して即座にプレビュー画面へ進む"
                  >
                    <Sparkles size={11} className="text-amber-200" />
                    <span>⚡ 入力して次へ進む</span>
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
                        message: '学生時代を卒業してから随分経ちましたね。みんなで集まった時の写真を見るたび懐かしくなります。見つけたら気軽に声をかけてね。',
                        contactType: 'EMAIL',
                        contactId: 'misaki_sato_test@example.com',
                        contactNote: 'メールは毎日チェックしています。'
                      });
                      setAgreed(true);
                      setAuthEmail('misaki_test@example.com');
                      setAuthPassword('password123');
                      setWarningMessage(null);
                    }}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    title="フォームに入力のみ"
                  >
                    入力のみ
                  </button>
                </div>
              </div>

              {/* 3. 鈴木 健一 */}
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <span>☕ 鈴木 健一</span>
                  <span className="text-[10px] text-slate-500 font-normal">（昭和53年・大阪）</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        lastName: '鈴木',
                        firstName: '健一',
                        maidenName: '',
                        birthYear: '1978',
                        hometownPref: '大阪府',
                        message: '昔お世話になった皆様へ。ふと当時の温かい思い出が蘇り、こちらにメッセージを届けることにしました。元気でお過ごしでしょうか。',
                        contactType: 'LINE',
                        contactId: 'suzuki_kenichi_1978',
                        contactNote: '週末に返信いたします。'
                      });
                      setAgreed(true);
                      setAuthEmail('suzuki_test@example.com');
                      setAuthPassword('password123');
                      setWarningMessage(null);
                      setStep('preview');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    title="鈴木健一のデータを入力して即座にプレビュー画面へ進む"
                  >
                    <Sparkles size={11} className="text-amber-200" />
                    <span>⚡ 入力して次へ進む</span>
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
                        message: '昔お世話になった皆様へ。ふと当時の温かい思い出が蘇り、こちらにメッセージを届けることにしました。元気でお過ごしでしょうか。',
                        contactType: 'LINE',
                        contactId: 'suzuki_kenichi_1978',
                        contactNote: '週末に返信いたします。'
                      });
                      setAgreed(true);
                      setAuthEmail('suzuki_test@example.com');
                      setAuthPassword('password123');
                      setWarningMessage(null);
                    }}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    title="フォームに入力のみ"
                  >
                    入力のみ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ℹ️ 既に公開メッセージ作成済みのユーザーへの案内バナー（1人1通ポリシー） */}
          {existingUserPost && (
            <div className="p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-2 border-teal-300 rounded-3xl space-y-3 shadow-sm animate-fade-in font-sans text-left">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm font-serif">
                  <Sparkles size={18} className="text-teal-600 shrink-0" />
                  <span>既にあなたの公開メッセージが1通登録されています</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                  公開中
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                ReMEETs SEEKME では、相手に届くメッセージの信憑性を保つため<strong>「原則1ユーザーにつき1通」</strong>の公開となっております。
                内容の変更・推敲は<strong>「マイアカウント」</strong>からいつでも自由に行えます。
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  to="/mypage"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>マイアカウントでメッセージを修正する</span>
                </Link>
                <Link
                  to={`/posts/${existingUserPost.id}`}
                  target="_blank"
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>現在の公開画面を確認</span>
                </Link>
              </div>
            </div>
          )}

          {/* 警告メッセージ */}
          {warningMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-shake shadow-sm">
              <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <span>{warningMessage}</span>
            </div>
          )}

          <form onSubmit={handleGoToPreview} className="space-y-6">
            {/* 1. あなたについて */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 sm:p-7 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">あなたについて</h3>
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

              {/* ふりがな（せい・めい） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-teal-50/40 p-3.5 sm:p-4 rounded-2xl border border-teal-100/80">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-teal-900 block flex items-center justify-between">
                    <span>ふりがな（せい）</span>
                    <span className="text-teal-700 font-bold text-[10px]">Google検索・読み間違い防止用</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastNameKana}
                    onChange={e => setFormData(prev => ({ ...prev, lastNameKana: e.target.value }))}
                    placeholder="例：やまだ（ひらがな）"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-teal-200/80 rounded-xl bg-white focus:border-teal-600 outline-none transition-all shadow-2xs font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-teal-900 block flex items-center justify-between">
                    <span>ふりがな（めい）</span>
                    <span className="text-teal-700 font-bold text-[10px]">ひらがな検索対応</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstNameKana}
                    onChange={e => setFormData(prev => ({ ...prev, firstNameKana: e.target.value }))}
                    placeholder="例：たろう（ひらがな）"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-teal-200/80 rounded-xl bg-white focus:border-teal-600 outline-none transition-all shadow-2xs font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>旧姓・当時の苗字</span>
                    <span className="text-slate-400 font-normal text-[11px]">任意（改姓された方）</span>
                  </label>
                  <input
                    type="text"
                    value={formData.maidenName}
                    onChange={e => setFormData(prev => ({ ...prev, maidenName: e.target.value }))}
                    placeholder="例：佐藤（当時の苗字）"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                    <span>旧姓のふりがな</span>
                    <span className="text-slate-400 font-normal text-[11px]">任意</span>
                  </label>
                  <input
                    type="text"
                    value={formData.maidenNameKana}
                    onChange={e => setFormData(prev => ({ ...prev, maidenNameKana: e.target.value }))}
                    placeholder="例：さとう"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
                  />
                </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200 shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">公開メッセージ</h3>
                    <p className="text-xs text-slate-500 font-sans">あなたを探している相手に向けた温かいひと言をご記入ください。</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowAiAssistant(!showAiAssistant)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      showAiAssistant
                        ? 'bg-teal-600 text-white shadow-teal-200'
                        : 'bg-gradient-to-r from-teal-50 to-sky-50 hover:from-teal-100 hover:to-sky-100 text-teal-800 border border-teal-200'
                    }`}
                  >
                    <Sparkles size={14} className={showAiAssistant ? 'animate-spin' : 'text-teal-600'} />
                    <span>AIで自動作文</span>
                  </button>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    {formData.message.length}文字
                  </span>
                </div>
              </div>

              {/* 🤖 AI自動作文アシスタントパネル */}
              {showAiAssistant && (
                <div className="bg-gradient-to-br from-teal-50/90 via-sky-50/70 to-emerald-50/80 border border-teal-200 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-fade-in shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-900 font-bold text-xs sm:text-sm font-serif">
                      <Sparkles size={16} className="text-teal-600 shrink-0" />
                      <span>AIメッセージ自動作文アシスタント</span>
                    </div>
                    {aiGeneratedSuccess && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                        <Check size={12} /> 作成しました！
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-sans">
                    シチュエーションを選ぶだけで、お名前やゆかりの地の情報をもとに安心・温かい公開メッセージを自動生成します。
                  </p>

                  {/* シチュエーション選択ボタン */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'school_friends', label: '🎒 同級生・学生時代', desc: '学校や放課後の思い出' },
                      { id: 'teacher_senior', label: '🎾 部活・恩師・先輩', desc: '部活動やご指導の感謝' },
                      { id: 'work_colleague', label: '💼 職場・同期・同僚', desc: '苦楽を共にした仕事仲間' },
                      { id: 'general_gratitude', label: '🤝 お世話になった人', desc: '温かい支援や再会の願い' }
                    ].map(sit => (
                      <button
                        key={sit.id}
                        type="button"
                        onClick={() => {
                          setAiSituation(sit.id as any);
                          handleGenerateAiMessage(sit.id as any);
                        }}
                        disabled={aiGenerating}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          aiSituation === sit.id
                            ? 'bg-white border-teal-500 shadow-sm ring-2 ring-teal-500/20'
                            : 'bg-white/70 hover:bg-white border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800 block truncate">{sit.label}</span>
                        <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{sit.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">※ 生成後も自由に編集できます</span>
                    <button
                      type="button"
                      disabled={aiGenerating}
                      onClick={() => handleGenerateAiMessage()}
                      className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {aiGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>AIが作文中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>選択した内容で再生成</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* メッセージ記入テキストエリア */}
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="例：元気にしていますか？あの時一緒に過ごした放課後の夕暮れの風景を今でもよく思い出します。もし私を探してくれたら、メッセージを届けてください。"
                    className="w-full p-4 sm:p-5 text-base sm:text-lg text-slate-950 font-letter-mincho font-serif font-medium border-2 border-slate-300 rounded-2xl bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-sm leading-relaxed placeholder:text-slate-400 placeholder:font-normal"
                  />
                  {!formData.message && !showAiAssistant && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiAssistant(true);
                        handleGenerateAiMessage('school_friends');
                      }}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                    >
                      <Sparkles size={13} className="text-teal-600" />
                      <span>AIにおまかせで書く</span>
                    </button>
                  )}
                </div>

                {/* リアルタイム検知アラート */}
                {privacyWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-fade-in">
                    <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>{privacyWarning}</span>
                  </div>
                )}

                {/* 🛡️ メッセージ記入欄の直下に配置された「安心の約束ごと（3箇条）」 */}
                <div className="bg-gradient-to-br from-teal-50/60 via-sky-50/40 to-slate-50 border border-teal-100 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs font-serif">
                    <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                    <span>安心・安全のための「公開メッセージの約束ごと」</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-white/95 rounded-xl border border-teal-100 shadow-2xs space-y-0.5">
                      <span className="font-bold text-rose-700 block text-[11px]">🚫 学校名・会社名は書かない</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        〇〇高校、〇〇大学、勤務先などの固有名詞は避けてください。
                      </span>
                    </div>
                    <div className="p-2.5 bg-white/95 rounded-xl border border-teal-100 shadow-2xs space-y-0.5">
                      <span className="font-bold text-rose-700 block text-[11px]">🚫 駅名・詳細住所は書かない</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        最寄り駅や番地は書かず、都道府県のみを公開します。
                      </span>
                    </div>
                    <div className="p-2.5 bg-white/95 rounded-xl border border-teal-100 shadow-2xs space-y-0.5">
                      <span className="font-bold text-emerald-700 block text-[11px]">⭕ 二人だけの思い出を書く</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        「文化祭のバンド」「部活帰りのアイス」など情景が最適です。
                      </span>
                    </div>
                  </div>
                </div>
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
                targetNameKana={fullNameKana || undefined}
                targetMaidenName={formData.maidenName}
                targetMaidenNameKana={formData.maidenNameKana || undefined}
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
                  <span>ネット公開画面の完成プレビューを確認する ✨</span>
                  <ArrowRight size={16} />
                </button>
                <p className="text-[11px] text-slate-400 mt-2 font-sans">
                  ※ 次の画面で、ネット公開画面の完成プレビューを確認してメッセージを作成できます。
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
                  <div className="flex-1">
                    <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-sans">
                      {authMode === 'register' ? 'Registration' : 'Login'}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 mt-0.5">
                      {authMode === 'register' ? 'アカウント登録（メッセージの作成）' : 'ログインしてメッセージを公開'}
                    </h3>
                  </div>
                </div>

                {/* 🧪 【テスト・動作確認用】ワンクリック登録バー */}
                <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 rounded-2xl border border-amber-300/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-sans">
                      <Sparkles size={14} className="text-amber-600 shrink-0" />
                      <span>【テスト用】ワンクリック自動登録＆投稿</span>
                    </span>
                    <span className="text-[10px] text-amber-700/70 font-mono">
                      検証用
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleQuickTestAuth}
                      disabled={authLoading}
                      className="py-2.5 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-serif active:scale-98"
                    >
                      <Sparkles size={13} className="text-amber-200" />
                      <span>⚡ ワンクリックで登録してメッセージを届ける</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const rand = Math.floor(1000 + Math.random() * 9000);
                        setAuthEmail(`test_user_${rand}@example.com`);
                        setAuthPassword('Password123!');
                      }}
                      className="py-2.5 px-3 bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-950 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <span>📝 フォームに自動入力のみ</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed font-sans space-y-1.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-teal-600 shrink-0" />
                    <span>アカウント登録が必要な3つの理由</span>
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-600 list-disc pl-4">
                    <li>相手から再会エピソードが届いた際に<strong>メール通知</strong>を受け取るため</li>
                    <li>マイページでメッセージの内容を<strong>いつでも再確認・編集・削除</strong>できるようにするため</li>
                    <li>公的本人確認（eKYC）を行う場合、<strong>身元確認データを安全に紐付ける</strong>ため</li>
                  </ul>
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
                      <span>で登録</span>
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
                        <span>{authMode === 'register' ? '登録してメッセージを届ける ✨' : 'ログインしてメッセージを届ける ✨'}</span>
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
                      新しくアカウントを作成する →
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
          setStep('success');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        token={token}
        updateUser={(updated) => {
          updateUser(updated);
          if (createdPostData) {
            setCreatedPostData((prev: any) => ({
              ...prev,
              is_ekyc_verified: true
            }));
            // メッセージ側にも eKYC 認証反映
            fetch(`/api/posts/${createdPostData.id}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }).catch(() => {});
          }
        }}
      />

      {/* 🔍 公的本人確認（公認バッジ）証明内容・サイト表示プレビューモーダル */}
      <EkycExplanationModal
        isOpen={showEkycExplanationModal}
        onClose={() => setShowEkycExplanationModal(false)}
        senderName={fullName || 'あなた'}
        senderKana={fullNameKana || undefined}
        birthYear={formData.birthYear ? formatBirthYearLabel(formData.birthYear) : undefined}
        hometownPref={formData.hometownPref}
        mode="preview"
      />
    </div>
  );
};
