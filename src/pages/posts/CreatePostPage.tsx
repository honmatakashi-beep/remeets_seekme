import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, Check, CheckCircle2,
  HelpCircle, Info, Lock, MapPin, Send, Shield,
  ShieldCheck, Sparkles, User, AlertTriangle, Eye, AlertCircle
} from 'lucide-react';
import { useAuth, useNgFilter } from '../../contexts/AuthContext';
import { PREFECTURES, getPostUrl, PageHeader } from '../../lib/utils';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMessage(null);

    // バリデーション
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      setWarningMessage('探す方が検索できるよう、あなたのお名前（姓・名）を入力してください。');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }
    if (!formData.hometownPref) {
      setWarningMessage('ゆかりの地（都道府県）を選択してください。');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 15) {
      setWarningMessage('昔の知人や友人に向けたメッセージを15文字以上で入力してください。');
      return;
    }
    if (!formData.contactId.trim()) {
      setWarningMessage('再会が成立した際に相手にお渡しする連絡先（LINE IDまたはメールアドレス）を入力してください。');
      return;
    }
    if (!agreed) {
      setWarningMessage('利用規約およびプライバシーポリシーへの同意が必要です。');
      return;
    }

    // NGワード・AI安全検閲
    const ngError = checkNg(`${fullName} ${formData.maidenName} ${formData.message}`);
    if (ngError) {
      setWarningMessage(ngError);
      return;
    }

    if (privacyWarning) {
      setWarningMessage(`【記載ルールの確認】${privacyWarning}`);
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
          targetName: fullName, // SeekMe では自分自身が目印
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
        // 投稿完了後、詳細ページへ遷移
        navigate(getPostUrl(data), {
          state: {
            justPosted: true,
            postPreview: data
          }
        });
      } else {
        const err = await res.json();
        setWarningMessage(err.error || '手紙の登録に失敗しました。入力内容をご確認ください。');
      }
    } catch (e) {
      console.error(e);
      setWarningMessage('通信エラーが発生しました。インターネット接続を確認して再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-12 space-y-6 md:space-y-8 animate-fade-in font-sans text-black text-left">
      <BackToHomeButton className="mb-2" />

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
          <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{warningMessage}</div>
        </div>
      )}

      {/* 📝 1ページ完結・統合入力フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. お名前・基本情報カード */}
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">あなたのお名前（目印として公開）</h3>
              <p className="text-xs text-slate-500 font-sans">探している人が検索できるよう、正確なお名前を入力してください。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                姓（苗字）<span className="text-rose-500 ml-1 font-bold">*必須</span>
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
                名（お名前）<span className="text-rose-500 ml-1 font-bold">*必須</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                <span>旧姓（結婚等で姓が変わった方）</span>
                <span className="text-slate-400 font-normal text-[11px]">任意</span>
              </label>
              <input
                type="text"
                value={formData.maidenName}
                onChange={e => setFormData(prev => ({ ...prev, maidenName: e.target.value }))}
                placeholder="例：佐藤（当時の苗字）"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                ゆかりの地（都道府県）<span className="text-rose-500 ml-1 font-bold">*必須</span>
              </label>
              <select
                required
                value={formData.hometownPref}
                onChange={e => setFormData(prev => ({ ...prev, hometownPref: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner cursor-pointer"
              >
                <option value="">都道府県を選択してください</option>
                {PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                当時の年代（目安）
              </label>
              <select
                value={formData.era}
                onChange={e => setFormData(prev => ({ ...prev, era: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner cursor-pointer"
              >
                <option value="1960">1960年代</option>
                <option value="1970">1970年代</option>
                <option value="1980">1980年代</option>
                <option value="1990">1990年代</option>
                <option value="2000">2000年代</option>
                <option value="2010">2010年代</option>
                <option value="2020">2020年代</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                関係性（目安）
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:border-teal-600 outline-none transition-all shadow-inner cursor-pointer"
              >
                <option value="friend">同級生・友人・知人</option>
                <option value="love">初恋・昔の恋人</option>
                <option value="work">元同僚・仕事関係</option>
                <option value="other">その他・お世話になった方</option>
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
            category={formData.category}
            era={formData.era}
          />
        </div>

        {/* 利用規約同意 ＆ 送信ボタン */}
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
              disabled={isSubmitting || !agreed}
              className="w-full sm:w-auto min-w-[280px] px-8 py-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 active:scale-98 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer inline-flex items-center justify-center gap-2 font-serif"
            >
              <Send size={16} />
              <span>{isSubmitting ? '登録中...' : '目印の手紙を置く（完全無料） ✨'}</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              ※ 手紙の設置は永久無料です。維持費や登録料などは一切発生しません。
            </p>
          </div>
        </div>

      </form>
    </div>
  );
};
