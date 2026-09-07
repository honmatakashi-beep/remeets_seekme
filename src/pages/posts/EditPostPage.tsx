import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import {
  Activity, AlertCircle, AlertTriangle, Anchor, ArrowDown, ArrowLeft, ArrowRight,
  Award, BookOpen, Calendar, Check, CheckCircle, CheckCircle2, CheckSquare,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Clock, Coins, Copy,
  CreditCard, Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff, FileText,
  FileWarning, Filter, Heart, HeartHandshake, HelpCircle, Info, Key, Lock,
  LogOut, Mail, MapPin, MessageCircle, MessageSquare, MoreVertical,
  PlusCircle, RefreshCw, RotateCcw, School, Search, Send, Share2,
  Shield, ShieldAlert, ShieldCheck, Sparkles, Star, Tag, Trash2,
  User, User as UserIcon, Users, Wind, X, Zap, Bot, Image as ImageIcon,
  Plus, Globe, Unlock, UserCheck, Gift, FileSpreadsheet, Phone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/AuthContext';
import { useNgFilter } from '../../contexts/AuthContext';
import { cn, PageHeader, formatEraLabel, getCategoryText, getPostUrl, PREFECTURES } from '../../lib/utils';
import { BottleLoader, WarningMessage, ProtectedRoute, GoogleSearchResultPreview, BackToHomeButton } from '../../components/SharedComponents';
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from '../../components/DocumentCameraOverlay';
import { QuizMatchingAnalyticsView } from '../../components/QuizMatchingAnalyticsView';
import { SupportModal } from '../../components/SupportModal';
import { CreditCardPaymentForm } from '../../components/CreditCardPaymentForm';
import { ReunionEffectTitle } from '../../components/ReunionEffectTitle';
import { QuestionSampleModal } from '../AuthPages';
import { SuccessStoryModal } from '../SearchPage';
import quizMatchHearts from '../../assets/images/quiz_match_hearts_pastel_1785940521320.jpg';
import postSuccessSoft from '../../assets/images/post_success_soft_1785869214309.jpg';


import { ScrollToTop, ScrollToTopButton } from './PostUtils';
import { FlowExplanation, RecipientSafetyGuide, RevealContactModal, SuccessModal, AgeVerificationGate, ComplianceBanner, ReportModal } from './PostModals';

export const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { check: checkNg } = useNgFilter();
  const [formData, setFormData] = useState({
    searcherName: '',
    searcherFullName: '',
    searcherProfile: '',
    targetName: '',
    targetLastName: '',
    targetFirstName: '',
    targetNameEn: '',
    targetLastNameEn: '',
    targetFirstNameEn: '',
    targetHometown: '',
    targetHometownPref: '',
    targetHometownArea: '',
    targetSchool: '',
    era: '',
    category: '',
    message: '',
    contactType: 'LINE',
    contactId: '',
    contactNote: '',
    imageUrl: ''
  });
  const [questions, setQuestions] = useState([
    { question: '', answer: '', hint: '' },
    { question: '', answer: '', hint: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [warnings, setWarnings] = useState<Record<string, string | null>>({});
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}/edit`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        
        const romajiParts = (data.target_name_en || '').trim().split(/\s+/);
        const lastNameEn = romajiParts[0] || '';
        const firstNameEn = romajiParts.slice(1).join(' ') || '';

        const rawHometown = data.target_hometown || '';
        const prefMatch = rawHometown.match(/^(東京都|北海道|京都府|大阪府|.{2,3}県)(.*)$/);
        const pref = prefMatch ? prefMatch[1] : '';
        const area = prefMatch ? prefMatch[2] : rawHometown;

        setFormData({
          searcherName: data.searcher_name || '',
          searcherFullName: data.searcher_full_name || '',
          searcherProfile: data.searcher_profile || '',
          targetName: data.target_name || '',
          targetLastName: data.target_last_name || '',
          targetFirstName: data.target_first_name || '',
          targetNameEn: data.target_name_en || '',
          targetLastNameEn: lastNameEn,
          targetFirstNameEn: firstNameEn,
          targetHometown: rawHometown,
          targetHometownPref: pref,
          targetHometownArea: area,
          targetSchool: data.target_school || '',
          era: data.era || '',
          category: data.category || '',
          message: data.message || '',
          contactType: data.contact_type || 'LINE',
          contactId: data.contact_id || '',
          contactNote: data.contact_note || '',
          imageUrl: data.image_url || ''
        });
        
        if (data.questions && data.questions.length > 0) {
          const loadedQs = data.questions.map((q: any) => ({
            question: q.question || '',
            answer: q.answer_plain || q.answer || '',
            hint: q.hint || ''
          }));
          while (loadedQs.length < 2) {
            loadedQs.push({ question: '', answer: '', hint: '' });
          }
          setQuestions(loadedQs);
        } else if (data.secret_question) {
          setQuestions([
            { question: data.secret_question, answer: data.secret_answer_plain || data.secret_answer || '', hint: '' },
            { question: '', answer: '', hint: '' }
          ]);
        }
      } catch (err) {
        console.error(err);
        navigate('/account');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchPost();
    }
  }, [id, token, navigate]);

  const handleInputChange = (field: string, value: string) => {
    const ngLabel = checkNg(value);
    setWarnings(prev => ({ ...prev, [field]: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => {
      const nextData = { ...prev, [field]: value };
      if (field === 'targetHometownPref' || field === 'targetHometownArea') {
        const pref = field === 'targetHometownPref' ? value : prev.targetHometownPref;
        const area = field === 'targetHometownArea' ? value : prev.targetHometownArea;
        nextData.targetHometown = `${pref}${area}`;
      }
      return nextData;
    });
  };

  const handleTargetLastNameChange = (val: string) => {
    const ngLabel = checkNg(val);
    setWarnings(prev => ({ ...prev, targetLastName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ 
      ...prev, 
      targetLastName: val,
      targetName: `${val} ${prev.targetFirstName}`.trim()
    }));
  };

  const handleTargetFirstNameChange = (val: string) => {
    const ngLabel = checkNg(val);
    setWarnings(prev => ({ ...prev, targetFirstName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ 
      ...prev, 
      targetFirstName: val,
      targetName: `${prev.targetLastName} ${val}`.trim()
    }));
  };

  const handleQuestionChange = (idx: number, field: string, value: string) => {
    const ngLabel = checkNg(value);
    setWarnings(prev => ({ ...prev, [`question_${idx}_${field}`]: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    const newQs = [...questions];
    newQs[idx] = { ...newQs[idx], [field]: value };
    setQuestions(newQs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      alert('最下部の「利用規約・個人情報の取り扱い・投稿ガイドライン」への同意チェックボックスにチェックを入れてください。');
      return;
    }

    if (!formData.searcherProfile?.trim()) {
      alert('「差出人（あなた）の手がかり」を入力してください。');
      return;
    }
    if (!formData.targetLastName?.trim() || !formData.targetFirstName?.trim()) {
      alert('「探しているお相手のお名前（姓・名）」を入力してください。');
      return;
    }
    if (!formData.targetHometownPref) {
      alert('「ゆかりの地（都道府県）」を選択してください。');
      return;
    }
    if (!formData.targetHometownArea?.trim()) {
      alert('「ゆかりの地域・詳細な場所（市区町村以下）」を入力してください。');
      return;
    }
    if (!questions[0]?.question?.trim() || !questions[0]?.answer?.trim()) {
      alert('「思い出の質問1とその答え」を入力してください。');
      return;
    }
    if (!questions[1]?.question?.trim() || !questions[1]?.answer?.trim()) {
      alert('「思い出の質問2とその答え」を入力してください。');
      return;
    }
    if (!formData.message?.trim()) {
      alert('「プライベートメッセージ」を入力してください。');
      return;
    }
    if (!formData.contactId?.trim()) {
      alert('「正解者へ開示するSNS・連絡先（IDやアドレス）」を入力してください。');
      return;
    }

    const hasWarnings = Object.values(warnings).some(w => w !== null);
    if (hasWarnings) {
      alert('不適切な入力（禁止文字等）が含まれています。該当項目を修正してから再試行してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, questions })
      });
      if (res.ok) {
        navigate('/account');
      } else {
        const data = await res.json();
        alert(data.error || '更新に失敗しました');
      }
    } catch (err) {
      console.error(err);
      alert('ネットワークエラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { showConfirm } = useConfirm();
  const handleDelete = async () => {
    showConfirm('削除の確認', 'このボトルメールを削除してもよろしいですか？この操作は取り消せません。', async () => {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          navigate('/account');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  if (!user) return <Navigate to="/login" />;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light/50 backdrop-blur-sm">
      <BottleLoader />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <BackToHomeButton />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 border-brand-primary/10"
        >
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/account')} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <ChevronLeft size={16} />
              <span>マイアカウントへ戻る</span>
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <Trash2 size={15} />
              {isDeleting ? '削除中...' : 'このボトルを削除'}
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-[400] text-black mb-4">ボトルメールの編集</h1>
            <p className="text-black">投稿内容を修正して、再び海へ流します。</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-12">
            {/* あなたのこと */}
            <section className="space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-brand-primary/20">
                <UserIcon className="text-black" size={20} />
                <h2 className="text-xl font-bold text-black">あなたのこと</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-lg font-bold text-black uppercase tracking-widest flex items-center gap-2">
                    あなたの表示名（ニックネーム） <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-zinc-600">固定・自動入力</span>
                  </label>
                  <input 
                    disabled
                    type="text" 
                    className="w-full px-4 py-3 outline-none transition-all text-zinc-600 bg-slate-100/90 font-sans letter-field-input cursor-not-allowed"
                    value={formData.searcherName}
                  />
                  <p className="text-xs text-brand-dark/60 font-medium">
                    ※ アカウント登録されているニックネームが自動反映されています。変更したい場合は<strong>「マイアカウント」</strong>から変更してください。
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-bold text-black uppercase tracking-widest flex items-center gap-2">
                    あなたの本名（フルネーム） <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-zinc-600">固定・自動入力</span>
                  </label>
                  <input 
                    disabled
                    type="text" 
                    className="w-full px-4 py-3 outline-none transition-all text-zinc-600 bg-slate-100/90 font-sans letter-field-input cursor-not-allowed"
                    value={formData.searcherFullName}
                  />
                  <p className="text-xs text-brand-dark/60 font-medium leading-relaxed">
                    ※ 登録の本名（変更不可）が自動反映されています。この名前は公開されず、思い出の質問にすべて正解したお相手のみに開示されます。
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-orange-50/30 to-[#FAF6F0] border border-amber-200/70 rounded-2xl mb-3 border-l-4 border-l-amber-700 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="text-amber-800 shrink-0" size={22} />
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900">2. 差出人（あなた）の手がかり</h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-amber-800 text-amber-50 shadow-2xs shrink-0 flex items-center gap-1">
                      <span>FROM</span>
                      <span className="text-[9px] opacity-75">差出人</span>
                    </span>
                  </div>

                  <div className="space-y-4 p-5 sm:p-6 bg-[#FAF7F2] rounded-[28px] border border-amber-200/70 shadow-sm">
                    {/* タイトル & 警告 */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <Sparkles size={15} className="text-amber-700" />
                        お相手にあなただと気づいてもらうための「共通の想い出ヒント」
                        <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                      </label>
                      <div className="flex items-start gap-1.5 text-[11px] text-red-800 font-bold bg-red-50/90 p-2.5 rounded-xl border border-red-200/90 leading-relaxed">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                        <span>ネット上に一般公開されます。お互いの安全のため、個人情報の入力は絶対にやめてください。（※電話番号・住所・実名などの個人情報や禁止用語が含まれる場合、AI安全監査により更新できません）</span>
                      </div>
                    </div>

                    {/* テキスト入力欄（ガイドの上に配置） */}
                    <div className="space-y-1.5">
                      <textarea 
                        required
                        placeholder="例：部活動で主将をしていた者です。いつも図書室で会っていましたね。あの時一緒に読んだ本の話を覚えていますか？" 
                        className="w-full py-3.5 px-4 outline-none transition-all letter-field-textarea font-serif text-base md:text-lg text-[#000000] placeholder:text-zinc-400 min-h-[160px] resize-none bg-white rounded-xl border border-slate-300 focus:border-brand-primary"
                        value={formData.searcherProfile}
                        onChange={e => handleInputChange('searcherProfile', e.target.value)}
                      />
                      <WarningMessage message={warnings.searcherProfile} />
                    </div>

                    {/* 専用記入ガイド（入力欄の下に配置） */}
                    <div className="p-4 bg-white/95 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3 text-xs md:text-sm text-zinc-700 font-sans">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs md:text-sm">
                          <BookOpen size={16} className="text-amber-700" />
                          📖 この欄の専用記入ガイド
                        </span>
                        <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                          個人情報なしで確定させるコツ
                        </span>
                      </div>

                      {/* 具体例・OK/NG例：アコーディオン開閉（ピル型ボタン） */}
                      <details className="group pt-0.5">
                        <summary className="w-full flex items-center justify-between cursor-pointer py-2 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={15} className="text-amber-700 shrink-0" />
                            <span>💡 どんな内容がOK？ 具体的な「OK・NG例」を見る</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-amber-200 shadow-2xs shrink-0">
                            <span className="group-open:hidden">＋ タップで開く ▼</span>
                            <span className="hidden group-open:inline">− 閉じる ▲</span>
                          </span>
                        </summary>

                        <div className="pt-3 space-y-3 text-xs md:text-sm">
                          <p className="text-xs md:text-sm text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed font-sans">
                            💡 <strong>手紙本文との違い:</strong> お相手へのご挨拶や近況報告、本格的なメッセージ、開示用連絡先は、最後の<strong>【メッセージと開示用連絡先】</strong>欄で安全に入力します。
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 space-y-1.5">
                              <span className="text-xs md:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle size={15} className="text-emerald-700" />
                                ⭕️ おすすめの書き方（伝わる例）
                              </span>
                              <ul className="text-xs md:text-sm text-emerald-950/85 space-y-1 list-disc list-inside leading-relaxed font-sans">
                                <li>当時のあだ名や係（例: <em>「当時『たっちゃん』と呼ばれていた者です」</em>）</li>
                                <li>二人の共通体験（例: <em>「放課後の図書室でよくおすすめの本を教え合いましたね」</em>）</li>
                                <li>イベント・出来事（例: <em>「文化祭で一緒に大道具の看板を描いた友人です」</em>）</li>
                              </ul>
                            </div>

                            <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3 space-y-1.5">
                              <span className="text-xs md:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                                <X size={15} className="text-rose-700" />
                                ❌ 書いてはいけない内容（AI検閲対象）
                              </span>
                              <ul className="text-xs md:text-sm text-rose-950/85 space-y-1 list-disc list-inside leading-relaxed font-sans">
                                <li>電話番号、LINE ID、メールアドレス（※連絡先は下部で安全開示）</li>
                                <li>詳細な自宅番地、実名フルネーム、勤務先の具体的部署</li>
                                <li>「元気？会いたいから連絡して」（※手紙の本文は下部で書く）</li>
                                <li>誹謗中傷、金銭要求、トラブルに関する記述</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 探しているお相手のこと */}
            <section className="space-y-8">
              <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-100/60 border border-slate-200/80 rounded-2xl border-l-4 border-l-slate-700 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Search className="text-slate-700 shrink-0" size={22} />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">1. 探しているお相手の情報</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-slate-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                  <span>TO</span>
                  <span className="text-[9px] opacity-75">宛先</span>
                </span>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                      お相手の姓（必須）
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="例：田中" 
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={formData.targetLastName}
                      onChange={e => handleTargetLastNameChange(e.target.value)}
                    />
                    <WarningMessage message={warnings.targetLastName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                      お相手の名（必須）
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="例：花子" 
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={formData.targetFirstName}
                      onChange={e => handleTargetFirstNameChange(e.target.value)}
                    />
                    <WarningMessage message={warnings.targetFirstName} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black/60 uppercase tracking-widest flex items-center gap-2">
                      お相手のローマ字表記（姓）<span className="text-[10px] text-zinc-500 font-bold ml-1.5 tracking-normal">＊任意</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="例：Tanaka" 
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={formData.targetLastNameEn}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => {
                          const nextLastNameEn = val;
                          const nextTargetNameEn = `${nextLastNameEn.trim()} ${prev.targetFirstNameEn.trim()}`.trim();
                          return {
                            ...prev,
                            targetLastNameEn: nextLastNameEn,
                            targetNameEn: nextTargetNameEn
                          };
                        });
                        if (checkNg) {
                          setWarnings(prev => ({ ...prev, targetNameEn: checkNg(val + ' ' + formData.targetFirstNameEn) ? '不適切な単語が含まれています。' : null }));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black/60 uppercase tracking-widest flex items-center gap-2">
                      お相手のローマ字表記（名）<span className="text-[10px] text-zinc-500 font-bold ml-1.5 tracking-normal">＊任意</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="例：Hanako" 
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={formData.targetFirstNameEn}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => {
                          const nextFirstNameEn = val;
                          const nextTargetNameEn = `${prev.targetLastNameEn.trim()} ${nextFirstNameEn.trim()}`.trim();
                          return {
                            ...prev,
                            targetFirstNameEn: nextFirstNameEn,
                            targetNameEn: nextTargetNameEn
                          };
                        });
                        if (checkNg) {
                          setWarnings(prev => ({ ...prev, targetNameEn: checkNg(formData.targetLastNameEn + ' ' + val) ? '不適切な単語が含まれています。' : null }));
                        }
                      }}
                    />
                  </div>
                </div>
                <WarningMessage message={warnings.targetNameEn} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                      ゆかりの地（都道府県・必須）
                    </label>
                    <select 
                      required
                      value={formData.targetHometownPref}
                      onChange={e => handleInputChange('targetHometownPref', e.target.value)}
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] font-sans letter-field-select"
                    >
                      <option value="">都道府県を選択してください</option>
                      {PREFECTURES.map(pref => (
                        <option key={pref} value={pref}>{pref}</option>
                      ))}
                    </select>
                    <WarningMessage message={warnings.targetHometownPref} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                      地域・詳細な場所（市区町村以下・必須）
                    </label>
                    <p className="text-xs text-brand-dark/70 font-sans leading-relaxed">
                      ※番地などの詳細な地域名は公開ページや検索（SEO）には載りません。一般には都道府県までが表示され、思い出の質問に回答した後に初めて完全な住所等が開示されます。
                    </p>
                    <input 
                      required
                      type="text" 
                      placeholder="例：世田谷区、横浜市中区など" 
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={formData.targetHometownArea}
                      onChange={e => handleInputChange('targetHometownArea', e.target.value)}
                    />
                    <WarningMessage message={warnings.targetHometownArea} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                      当時の所属（学校・職場など）
                    </label>
                    <p className="text-xs text-[#ea0736] font-bold leading-relaxed">
                      ※具体的な学校名や会社名は一般公開されず、「関連学校（正解後に開示）」となります。お相手が思い出の質問に正解した後にだけ完全に開示されますので、安心してお相手と共有していた名前をご記入ください。
                    </p>
                    <input 
                      type="text" 
                      placeholder="例：〇〇市立第一中学校" 
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={formData.targetSchool}
                      onChange={e => handleInputChange('targetSchool', e.target.value)}
                    />
                    <WarningMessage message={warnings.targetSchool} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[17px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                      出会った時期・年代
                    </label>
                    <select 
                      className="w-full px-4 py-3 outline-none transition-all text-[#000000] font-sans letter-field-select"
                      value={formData.era}
                      onChange={e => handleInputChange('era', e.target.value)}
                    >
                      <option value="">選択してください</option>
                      <option value="1950s">1950年代</option>
                      <option value="1960s">1960年代</option>
                      <option value="1970s">1970年代</option>
                      <option value="1980s">1980年代</option>
                      <option value="1990s">1990年代</option>
                      <option value="2000s">2000年代</option>
                      <option value="2010s">2010年代</option>
                      <option value="2020s">2020年代</option>
                      <option value="other">その他</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[17px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                    関係性のカテゴリー
                  </label>
                  <select 
                    className="w-full px-4 py-3 outline-none transition-all text-[#000000] font-sans letter-field-select"
                    value={formData.category}
                    onChange={e => handleInputChange('category', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="school">学校（同級生・先生）</option>
                    <option value="work">職場（同僚・上司）</option>
                    <option value="neighborhood">近所・幼馴染</option>
                    <option value="hobby">趣味・サークル</option>
                    <option value="love">初恋・大切な人</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 思い出の質問 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-brand-primary/20">
                <HelpCircle className="text-black" size={20} />
                <h2 className="text-xl font-bold text-black">思い出の質問</h2>
              </div>

              {/* 📖 思い出の質問・答え 専用記入ガイド */}
              <div className="p-4 bg-white/95 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3 text-xs md:text-sm text-zinc-700 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs md:text-sm">
                    <BookOpen size={16} className="text-amber-700" />
                    📖 思い出の質問・答えの専用記入ガイド
                  </span>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    正解率UP ＆ 安全設定
                  </span>
                </div>

                {/* 赤バック注意事項（前ページと同じスタイル） */}
                <div className="flex items-start gap-1.5 text-[11px] text-red-800 font-bold bg-red-50/90 p-2.5 rounded-xl border border-red-200/90 leading-relaxed">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                  <span>【答えの鉄則】答えは「短い単語（名詞・キーワード）」のみで設定してください。（※質問・答えともに、電話番号・住所・実名などの個人情報や禁止用語が含まれる場合、AI安全監査により投函できません）</span>
                </div>

                {/* 具体例・OK/NG例：アコーディオン開閉（ピル型ボタン） */}
                <details className="group pt-0.5">
                  <summary className="w-full flex items-center justify-between cursor-pointer py-2 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={15} className="text-amber-700 shrink-0" />
                      <span>💡 どんな質問・答えが良い？ 具体的な「OK・NG例」を見る</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-amber-200 shadow-2xs shrink-0">
                      <span className="group-open:hidden">＋ タップで開く ▼</span>
                      <span className="hidden group-open:inline">− 閉じる ▲</span>
                    </span>
                  </summary>

                  <div className="pt-3 space-y-3 text-xs md:text-sm">
                    <p className="text-xs md:text-sm text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed font-sans">
                      💡 <strong>答えの鉄則 ＆ 表記ゆれ自動対応:</strong> 答えは「〜です」などの文章や記号を省き、<strong>「短い単語（名詞）」</strong>のみで設定してください。ひらがな・カタカナ・漢字や送り仮名のゆれはシステムが自動で柔軟に正解判定します。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs md:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle size={15} className="text-emerald-700" />
                          ⭕️ 正解しやすいおすすめ例
                        </span>
                        <ul className="text-xs md:text-sm text-emerald-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                          <li><strong>質問:</strong> 放課後によく二人で買い食いした駄菓子屋の名前は？<br />➔ <strong>答え:</strong> <code>さくらや</code></li>
                          <li><strong>質問:</strong> 文化祭の劇であなたが担当した役の動物は？<br />➔ <strong>答え:</strong> <code>タヌキ</code></li>
                          <li><strong>質問:</strong> 部活の合宿で夜にこっそり集合した場所は？<br />➔ <strong>答え:</strong> <code>非常階段</code></li>
                        </ul>
                      </div>

                      <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs md:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                          <X size={15} className="text-rose-700" />
                          ❌ やってはいけない設定（AI検閲対象 / 不一致）
                        </span>
                        <ul className="text-xs md:text-sm text-rose-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                          <li><strong>文章や記号:</strong> <code>さくらやです！</code>、<code>〇〇でした</code>（※単語のみにする）</li>
                          <li><strong>個人情報:</strong> 電話番号、LINE ID、実名フルネーム、詳細な番地</li>
                          <li><strong>主観的な質問:</strong> 「あの時私がどう思ったか」（※相手が答えにくい）</li>
                          <li><strong>禁止表現:</strong> 誹謗中傷、金銭要求、トラブルに関する記述</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <div className="space-y-6">
                {[0, 1].map((idx) => {
                  const hasSentenceEnding = questions[idx]?.answer ? /(です|でした|だよ|だね|だった|である|！|!|？|\?|。|、)$/.test(questions[idx].answer.trim()) : false;
                  const isFirst = idx === 0;
                  return (
                    <div key={idx} className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
                      {/* カードヘッダー */}
                      <div className={`flex items-center justify-between border-b ${isFirst ? 'border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-sky-50/30 to-[#FAF6F0] border-l-indigo-700' : 'border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-[#FAF6F0] border-l-teal-700'} -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4`}>
                        <div className="flex items-center gap-2.5">
                          <HelpCircle size={22} className={isFirst ? "text-indigo-800 shrink-0" : "text-teal-800 shrink-0"} />
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                            思い出の質問 {idx + 1}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              setActiveQuestionIdx(idx);
                              setIsSampleModalOpen(true);
                            }}
                            className="text-xs text-slate-700 hover:text-indigo-600 flex items-center gap-1 font-bold tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-all active:scale-95"
                          >
                            <BookOpen size={12} className="text-indigo-600" /> サンプルから選ぶ
                          </button>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ${isFirst ? 'bg-indigo-800' : 'bg-teal-800'} text-white shadow-2xs shrink-0 flex items-center gap-1`}>
                            <span>Q{idx + 1}</span>
                            <span className="text-[9px] opacity-75">必須</span>
                          </span>
                        </div>
                      </div>

                      {/* 質問入力欄 */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                          <HelpCircle size={14} className="text-black" />
                          質問内容<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                        </label>
                        <input 
                          required
                          type="text" 
                          placeholder="例：部活の帰りに寄っていた店の名前は？" 
                          className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                          value={questions[idx].question}
                          onChange={e => handleQuestionChange(idx, 'question', e.target.value)}
                        />
                        <WarningMessage message={warnings[`question_${idx}_question`]} />
                      </div>

                      {/* 答え入力欄 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                            <Key size={14} className="text-black" />
                            答え（単語・名詞）<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                          </label>
                          <span className="text-xs text-slate-500 font-medium">※ 単語のみ（例: さくらや）</span>
                        </div>
                        <input 
                          required
                          type="text" 
                          placeholder="例：さくらや（※単語・キーワードのみ）" 
                          className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                          value={questions[idx].answer}
                          onChange={e => handleQuestionChange(idx, 'answer', e.target.value)}
                        />
                        {hasSentenceEnding && (
                          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-bold animate-fade-in">
                            <span>💡 「です」「！」などの語尾や記号を省いた単語のみ（例: <code>さくらや</code>）で設定すると、相手が正解しやすくなります。</span>
                          </p>
                        )}
                        <WarningMessage message={warnings[`question_${idx}_answer`]} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* メッセージ ＆ 開示用連絡先 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-brand-primary/20">
                <Mail className="text-black" size={20} />
                <h2 className="text-xl font-bold text-black">メッセージと開示用連絡先</h2>
              </div>

              {/* 📖 メッセージ・連絡先 専用記入ガイド */}
              <div className="p-4 bg-white/95 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3 text-xs md:text-sm text-zinc-700 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs md:text-sm">
                    <BookOpen size={16} className="text-amber-700" />
                    📖 メッセージと開示用連絡先の専用ルールガイド
                  </span>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    安心開示 ＆ 法的保護
                  </span>
                </div>

                {/* 赤バック注意事項 */}
                <div className="flex items-start gap-1.5 text-[11px] text-red-800 font-bold bg-red-50/90 p-2.5 rounded-xl border border-red-200/90 leading-relaxed">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                  <span>【連絡先の鉄則】手紙本文には電話番号・住所等を書かず、必ず専用の『開示用連絡先』欄へご入力ください。（※思い出の質問に正解し開示手続きを行ったお相手にのみ安全に暗号化開示されます）</span>
                </div>

                {/* 具体例・OK/NG例：アコーディオン開閉（ピル型ボタン） */}
                <details className="group pt-0.5">
                  <summary className="w-full flex items-center justify-between cursor-pointer py-2 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={15} className="text-amber-700 shrink-0" />
                      <span>💡 メッセージ作成のコツや「OK・NG例」を見る</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-amber-200 shadow-2xs shrink-0">
                      <span className="group-open:hidden">＋ タップで開く ▼</span>
                      <span className="hidden group-open:inline">− 閉じる ▲</span>
                    </span>
                  </summary>

                  <div className="pt-3 space-y-3 text-xs md:text-sm">
                    <p className="text-xs md:text-sm text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed font-sans">
                      💡 <strong>プライベートメッセージについて:</strong> この手紙本文は一般公開されず、質問に全問正解したお相手のみが開封できます。当時の想いや再会へのメッセージを安心してお書きください。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs md:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle size={15} className="text-emerald-700" />
                          ⭕️ 心温まるおすすめの書き方
                        </span>
                        <ul className="text-xs md:text-sm text-emerald-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                          <li>近況報告や当時の感謝の気持ち（例: <em>「あの時助けてくれたこと、ずっと心に残っていました」</em>）</li>
                          <li>再会したら話したいこと（例: <em>「もし見てくれたら、お茶でもしながら昔の話をしましょう」</em>）</li>
                          <li>お相手への温かい気遣い（例: <em>「お元気で過ごされていることを祈っています」</em>）</li>
                        </ul>
                      </div>

                      <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs md:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                          <X size={15} className="text-rose-700" />
                          ❌ 書いてはいけない内容（AI検閲対象）
                        </span>
                        <ul className="text-xs md:text-sm text-rose-950/85 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                          <li>手紙本文内への直接の電話番号・住所・口座番号の記入（※連絡先は下の専用欄へ）</li>
                          <li>威圧的な要求、金銭の催促、トラブルに関する記述</li>
                          <li>誹謗中傷、プライバシー侵害、わいせつな表現</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              {/* 3. 【お相手 様】へ届ける手紙 カード */}
              <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-indigo-200/80 shadow-xs overflow-hidden transition-all">
                <div className="flex items-center justify-between border-b border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-sky-50/30 to-[#FAF6F0] -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-indigo-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-5 bg-indigo-700 rounded-full inline-block shrink-0" />
                    <Mail size={22} className="text-indigo-800 shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                      3. 【{formData.targetName || 'お相手'} 様】へ届ける手紙
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-indigo-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                    <span>LETTER</span>
                    <span className="text-[9px] opacity-75">正解後のみ開示</span>
                  </span>
                </div>

                {/* 安心ガイダンス・AI検閲注意 */}
                <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-xl text-xs space-y-1 text-indigo-950 font-sans">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <ShieldCheck size={15} className="text-indigo-700 shrink-0" />
                    <span>🔒 {formData.targetName || 'お相手'} 様が思い出の質問に全問正解した後にのみ開示される非公開の手紙です</span>
                  </div>
                  <p className="text-indigo-900/85 leading-relaxed text-[11px] pl-5">
                    ※ 手紙本文には電話番号・LINE ID・メールアドレス等の連絡先や詳細な住所は直接書かないでください（AI安全監査により更新エラーとなります）。<br />
                    ※ お相手に開示する連絡先は、すぐ下の<strong>「4. 開示用連絡先設定」欄に1つだけ</strong>ご入力ください。
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                    <Mail size={14} className="text-black" />
                    手紙のメッセージ本文<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                  </label>
                  <textarea 
                    required
                    placeholder="例：ずっと探していました。もしこれを見ていたら、ぜひ連絡をください。またあの頃のように話したいです。"
                    className="w-full py-3.5 px-4 border-b-2 border-brand-primary/50 focus:border-brand-primary outline-none transition-all letter-field-textarea font-serif text-base md:text-lg text-black placeholder:text-zinc-400 min-h-[160px] resize-none bg-[#faf9f6] focus:bg-white rounded-xl"
                    value={formData.message}
                    onChange={e => handleInputChange('message', e.target.value)}
                  />
                  <WarningMessage message={warnings.message} />
                </div>
              </div>

              {/* 4. 【お相手 様】へ開示するSNS・連絡先設定 カード */}
              <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-teal-200/80 shadow-xs overflow-hidden transition-all">
                <div className="flex items-center justify-between border-b border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-[#FAF6F0] -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-teal-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-5 bg-teal-700 rounded-full inline-block shrink-0" />
                    <Share2 size={22} className="text-teal-800 shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                      4. 【{formData.targetName || 'お相手'} 様】へ開示するSNS・連絡先設定
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {(localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id) && (
                      <button
                        type="button"
                        onClick={() => {
                          const savedType = localStorage.getItem('remeets_default_contact_type') || (user as any)?.contact_type || 'LINE';
                          const savedId = localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id || '';
                          handleInputChange('contactType', savedType);
                          handleInputChange('contactId', savedId);
                        }}
                        className="text-xs text-slate-700 hover:text-teal-700 flex items-center gap-1 font-bold tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-all active:scale-95 shrink-0"
                      >
                        <span>💡 マイSNS IDを自動反映</span>
                      </button>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-teal-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                      <span>CONTACT</span>
                      <span className="text-[9px] opacity-75">必須</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                      連絡先の種類<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                    </label>
                    <select 
                      className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
                      value={formData.contactType}
                      onChange={e => handleInputChange('contactType', e.target.value)}
                    >
                      <option value="LINE">LINE ID / 友だち追加リンク</option>
                      <option value="X">X (旧Twitter) ID</option>
                      <option value="Instagram">Instagram ID</option>
                      <option value="Email">メールアドレス</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                      開示用ID / アドレス / リンク<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="例：@my_line_id や https://line.me/ti/p/xxx"
                      className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={formData.contactId}
                      onChange={e => handleInputChange('contactId', e.target.value)}
                    />
                    <WarningMessage message={warnings.contactId} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                    お相手への連絡時メモ・補足<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="例：LINEで『ReMEETsを見た』とお知らせください。"
                    className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                    value={formData.contactNote}
                    onChange={e => handleInputChange('contactNote', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <div className="space-y-6 pt-8 border-t border-brand-border">
              <div 
                onClick={() => setAgreed(!agreed)}
                className={`flex items-start gap-3.5 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  agreed 
                    ? 'bg-teal-50/80 border-teal-400 shadow-sm' 
                    : 'bg-brand-primary/5 border-brand-primary/20 hover:border-brand-primary/40'
                }`}
              >
                <input 
                  type="checkbox" 
                  id="edit-agreement" 
                  required 
                  checked={agreed}
                  onChange={e => {
                    e.stopPropagation();
                    setAgreed(e.target.checked);
                  }}
                  className="mt-1 w-5 h-5 rounded border-brand-border text-teal-700 focus:ring-teal-500 cursor-pointer shrink-0" 
                />
                <div className="text-sm text-black leading-relaxed font-bold select-none space-y-1.5 flex-1">
                  <label htmlFor="edit-agreement" className="cursor-pointer block">
                    利用規約・個人情報の取り扱い・投稿ガイドラインをすべて理解し、これに同意して内容を更新します。
                  </label>
                  <div 
                    onClick={e => e.stopPropagation()} 
                    className="text-xs font-normal text-slate-600 flex flex-wrap items-center gap-1.5 font-sans pt-0.5"
                  >
                    <span>規約を確認：</span>
                    <Link 
                      to="/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 underline font-medium"
                    >
                      利用規約
                    </Link>
                    <span>・</span>
                    <Link 
                      to="/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 underline font-medium"
                    >
                      プライバシーポリシー
                    </Link>
                    <span>・</span>
                    <Link 
                      to="/guidelines" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 underline font-medium"
                    >
                      投稿ガイドライン
                    </Link>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-5 text-xl font-bold flex items-center justify-center gap-3 rounded-full transition-all shadow-xl cursor-pointer ${
                  agreed 
                    ? 'bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 hover:from-teal-800 hover:to-indigo-950 text-white shadow-teal-900/20 hover:scale-[1.01] active:scale-98' 
                    : 'bg-slate-300 text-slate-600 hover:bg-slate-400/80'
                }`} 
              >
                {isSubmitting ? (
                  <RefreshCw className="animate-spin text-white" size={24} />
                ) : (
                  <>
                    <span>内容を更新してボトルを流す</span>
                    <Heart size={24} className={agreed ? "text-rose-400" : "text-slate-500"} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {isSampleModalOpen && (
        <QuestionSampleModal 
          isOpen={isSampleModalOpen}
          onClose={() => setIsSampleModalOpen(false)}
          onSelect={(val) => {
            const newQs = [...questions];
            newQs[activeQuestionIdx].question = val;
            setQuestions(newQs);
          }}
        />
      )}
    </div>
  );
};

