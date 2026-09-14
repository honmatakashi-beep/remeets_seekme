import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2,
  Copy, HelpCircle, Info, Lock, MapPin, Send, Shield,
  ShieldCheck, Sparkles, User, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNgFilter } from '../../contexts/AuthContext';
import { PREFECTURES, getPostUrl } from '../../lib/utils';
import { GoogleSearchResultPreview, BackToHomeButton } from '../../components/SharedComponents';

export const CreatePostPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { check: checkNg } = useNgFilter();

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    maidenName: '',
    hometownPref: '',
    era: '1990',
    category: 'friend',
    message: '',
    contactType: 'LINE',
    contactId: '',
    contactNote: ''
  });

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: 基本情報, 2: メッセージ・連絡先, 3: プレビュー＆確認
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // 初期値の引き継ぎ
  useEffect(() => {
    if (location.state) {
      const { initialTargetName, initialTargetLastName, initialTargetFirstName, initialCategory } = location.state as any;
      if (initialTargetLastName || initialTargetFirstName || initialTargetName) {
        setFormData(prev => ({
          ...prev,
          lastName: initialTargetLastName || (initialTargetName ? initialTargetName.split(' ')[0] : prev.lastName),
          firstName: initialTargetFirstName || (initialTargetName ? initialTargetName.split(' ')[1] || '' : prev.firstName),
          category: initialCategory || prev.category
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
      if (user.contact_id && !formData.contactId) {
        setFormData(prev => ({
          ...prev,
          contactType: user.contact_type || 'LINE',
          contactId: user.contact_id
        }));
      }
    }
  }, [user]);

  const fullName = `${formData.lastName} ${formData.firstName}`.trim();

  // バリデーション
  const validateStep1 = () => {
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      setWarningMessage('探す方が検索できるよう、お名前（姓・名）を両方入力してください。');
      return false;
    }
    if (!formData.hometownPref) {
      setWarningMessage('ゆかりの地（都道府県）を選択してください。');
      return false;
    }
    setWarningMessage(null);
    return true;
  };

  const validateStep2 = () => {
    if (!formData.message.trim() || formData.message.trim().length < 15) {
      setWarningMessage('昔の知人や友人に向けたメッセージを15文字以上で入力してください。');
      return false;
    }
    if (!formData.contactId.trim()) {
      setWarningMessage('再会が成立した際に相手にお渡しする連絡先（LINE IDまたはメールアドレス）を入力してください。');
      return false;
    }
    // NGワード・AI安全検閲
    const ngError = checkNg(`${fullName} ${formData.maidenName} ${formData.message}`);
    if (ngError) {
      setWarningMessage(ngError);
      return false;
    }
    setWarningMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setWarningMessage('利用規約およびプライバシーポリシーへの同意が必要です。');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          searcherName: fullName,
          searcherFullName: fullName,
          searcherMaidenName: formData.maidenName.trim(),
          targetName: fullName, // SeekMe では自分自身が主キー
          targetLastName: formData.lastName.trim(),
          targetFirstName: formData.firstName.trim(),
          targetHometown: formData.hometownPref,
          era: formData.era,
          category: formData.category,
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
        const postUrl = getPostUrl({
          id: data.id,
          target_name: fullName,
          target_hometown: formData.hometownPref,
          era: formData.era,
          relationship: formData.category
        });
        navigate(postUrl, { state: { justPosted: true } });
      } else {
        const data = await res.json();
        setWarningMessage(data.error || '手紙の投稿に失敗しました。入力内容をご確認ください。');
      }
    } catch (err) {
      console.error(err);
      setWarningMessage('通信エラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12 text-slate-800 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <BackToHomeButton />

        {/* ページタイトル */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold tracking-wider uppercase">
            <Send size={12} className="text-teal-600" />
            <span>ReMEETs SeekMe 〜私を探すあなたへ〜</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            目印の手紙を置く
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-xl mx-auto leading-relaxed">
            私を探している誰かに向けて、あたたかい目印を置いておきます。<br className="hidden sm:inline" />
            入力項目は<strong className="text-teal-800 font-bold">5項目のみ</strong>。学校名や詳細住所は非公開で安心です。
          </p>
        </div>

        {/* ステップインジケーター */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold font-sans">
            <div className={`py-2 rounded-xl transition-all ${step === 1 ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
              <span className="block text-[10px] font-mono opacity-80">STEP 01</span>
              <span>お名前・ゆかりの地</span>
            </div>
            <div className={`py-2 rounded-xl transition-all ${step === 2 ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
              <span className="block text-[10px] font-mono opacity-80">STEP 02</span>
              <span>メッセージ・連絡先</span>
            </div>
            <div className={`py-2 rounded-xl transition-all ${step === 3 ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
              <span className="block text-[10px] font-mono opacity-80">STEP 03</span>
              <span>プレビュー・投稿</span>
            </div>
          </div>
        </div>

        {/* 警告メッセージ表示 */}
        {warningMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-medium animate-in fade-in duration-200">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{warningMessage}</span>
          </div>
        )}

        {/* メインフォームカード */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          {/* ===================================================
              STEP 1: お名前・旧姓・ゆかりの地
          =================================================== */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <User size={18} className="text-teal-600" />
                  <span>あなたのお名前とゆかりの地</span>
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  あなたを探す人がGoogleやサイト内で検索するための目印です。
                </p>
              </div>

              {/* お名前（姓・名） */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>1. お名前（フルネーム） <span className="text-rose-600 text-[10px] font-bold">※必須・公開</span></span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="姓（例：山田）"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="名（例：太郎）"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* 旧姓（任意） */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>2. 旧姓（改姓前のお名前） <span className="text-slate-400 text-[10px]">※任意・公開</span></span>
                </label>
                <input
                  type="text"
                  value={formData.maidenName}
                  onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
                  placeholder="例：佐藤（結婚等で苗字が変わった場合にご記入ください）"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  ※旧姓を登録しておくと、学生時代の同級生からの発見率が大幅に向上します。
                </p>
              </div>

              {/* ゆかりの都道府県 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>3. ゆかりの地（都道府県） <span className="text-rose-600 text-[10px] font-bold">※必須・公開</span></span>
                </label>
                <select
                  value={formData.hometownPref}
                  onChange={(e) => setFormData({ ...formData, hometownPref: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm cursor-pointer"
                >
                  <option value="">都道府県を選択してください</option>
                  {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-[11px] text-teal-900 flex items-start gap-2">
                  <ShieldCheck size={15} className="text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>【防犯・プライバシー鉄則】</strong> 市区町村や学校名・職場名は防犯のため公開されません。同姓同名の絞り込みには「都道府県」のみが使用されます。
                  </span>
                </div>
              </div>

              {/* 年代 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  <span>ゆかりの年代 <span className="text-slate-400 text-[10px]">※任意</span></span>
                </label>
                <select
                  value={formData.era}
                  onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm cursor-pointer"
                >
                  <option value="1970">1970年代（昭和45年〜）</option>
                  <option value="1980">1980年代（昭和55年〜）</option>
                  <option value="1990">1990年代（平成2年〜）</option>
                  <option value="2000">2000年代（平成12年〜）</option>
                  <option value="2010">2010年代（平成22年〜）</option>
                  <option value="2020">2020年代（令和2年〜）</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  <span>次へ（メッセージ入力）</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================
              STEP 2: メッセージ・連絡先
          =================================================== */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Send size={18} className="text-teal-600" />
                  <span>メッセージと連絡先</span>
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  昔の知人への呼びかけ文と、再会が成立した際にお渡しする連絡先を設定します。
                </p>
              </div>

              {/* メッセージ（呼びかけ文） */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>4. メッセージ（呼びかけ文） <span className="text-rose-600 text-[10px] font-bold">※必須・公開</span></span>
                  <span className="text-slate-400 text-[10px] font-mono">{formData.message.length}文字</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="例：昔一緒に過ごした友人や知人へ。もし私の名前を検索して見つけてくれたら、ぜひ当時の思い出のエピソードを添えて申請してください。元気でいることを願っています。"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  ※電話番号やメールアドレスなどの直接の連絡先は、本文には記入しないでください（AIにより自動隔離されます）。
                </p>
              </div>

              {/* 連絡先情報（非公開） */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Lock size={15} className="text-teal-700" />
                  <span>5. 再会成立時にお渡しする連絡先 <span className="text-rose-600 text-[10px] font-bold">※必須・非公開</span></span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  この連絡先は一般公開されません。あなたが相手の再会申請を「承認」し、相互合意が成立した後にのみ安全に開示されます。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">連絡手段の種類</label>
                    <select
                      value={formData.contactType}
                      onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="LINE">LINE ID</option>
                      <option value="EMAIL">メールアドレス</option>
                      <option value="PHONE">携帯電話番号</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">ID / アドレス</label>
                    <input
                      type="text"
                      value={formData.contactId}
                      onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                      placeholder={formData.contactType === 'LINE' ? '例：@my_line_id' : '例：my-email@example.com'}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>戻る</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  <span>次へ（プレビュー確認）</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================
              STEP 3: プレビュー＆投稿確認
          =================================================== */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-teal-600" />
                  <span>置き手紙の完成プレビュー</span>
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  内容をご確認の上、「目印の手紙を置く」ボタンを押してください。
                </p>
              </div>

              {/* 手紙プレビューカード */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/40 via-white to-sky-50/30 border-2 border-teal-300 shadow-sm text-left space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {formData.hometownPref} / {formData.era}年代
                    </span>
                    <h3 className="text-xl font-serif font-bold text-slate-900 pt-1">
                      {fullName} {formData.maidenName ? <span className="text-xs font-normal text-slate-500 font-sans">（旧姓: {formData.maidenName}）</span> : ''}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check size={12} />
                    <span>掲載無料</span>
                  </span>
                </div>

                <div className="p-4 bg-white/90 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                  “{formData.message}”
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Lock size={12} className="text-teal-600" />
                    <span>連絡先: 相互承認後に安全開示（{formData.contactType}）</span>
                  </span>
                  <span>設置費用: 0円（完全無料）</span>
                </div>
              </div>

              {/* Google検索結果プレビュー */}
              <GoogleSearchResultPreview
                targetName={fullName}
                era={formData.era}
                location={formData.hometownPref}
                searcherName={fullName}
                teaser={formData.message}
              />

              {/* 利用規約同意チェックボックス */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed font-sans">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer shrink-0"
                  />
                  <span>
                    <Link to="/terms" target="_blank" className="text-teal-700 font-bold hover:underline">利用規約</Link>
                    および
                    <Link to="/privacy" target="_blank" className="text-teal-700 font-bold hover:underline">プライバシーポリシー</Link>
                    （18歳以上利用・異性交際目的の利用禁止）に同意して、目印の手紙を置きます。
                  </span>
                </label>
              </div>

              {/* 投稿実行ボタン */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>修正する</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!agreed || isSubmitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <Send size={16} className="text-teal-200" />
                  <span>{isSubmitting ? '手紙を置いています...' : '目印の手紙を置く（完全無料）'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CreatePostPage;
