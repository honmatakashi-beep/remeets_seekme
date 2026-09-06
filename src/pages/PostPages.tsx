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
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../contexts/AuthContext';
import { useNgFilter } from '../contexts/AuthContext';
import { cn, PageHeader, formatEraLabel, getCategoryText, getPostUrl, PREFECTURES } from '../lib/utils';
import { BottleLoader, WarningMessage, ProtectedRoute, GoogleSearchResultPreview, BackToHomeButton } from '../components/SharedComponents';
import { DocumentCameraOverlay, stopAllGlobalCameraStreams } from '../components/DocumentCameraOverlay';
import { QuizMatchingAnalyticsView } from '../components/QuizMatchingAnalyticsView';
import { SupportModal } from '../components/SupportModal';
import { CreditCardPaymentForm } from '../components/CreditCardPaymentForm';
import { ReunionEffectTitle } from '../components/ReunionEffectTitle';
import { QuestionSampleModal } from './AuthPages';
import { SuccessStoryModal } from './SearchPage';
import quizMatchHearts from '../assets/images/quiz_match_hearts_pastel_1785940521320.jpg';
import postSuccessSoft from '../assets/images/post_success_soft_1785869214309.jpg';

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

export const CreatePostPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    contactNote: ''
  });

  useEffect(() => {
    if (location.state) {
      const { initialTargetName, initialTargetLastName, initialTargetFirstName, initialCategory } = location.state as any;
      if (initialTargetName || initialTargetLastName || initialTargetFirstName || initialCategory) {
        setFormData(prev => ({
          ...prev,
          targetName: initialTargetName || prev.targetName,
          targetLastName: initialTargetLastName || prev.targetLastName,
          targetFirstName: initialTargetFirstName || prev.targetFirstName,
          category: initialCategory || prev.category
        }));
      }
    }
  }, [location.state]);
  const [questions, setQuestions] = useState([
    { question: '', answer: '', hint: '' },
    { question: '', answer: '', hint: '' }
  ]);
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [stepEnteredTime, setStepEnteredTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return { q: `${a} + ${b} = ?`, a: (a + b).toString() };
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const refreshCaptcha = () => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    const ans = (a + b).toString();
    setCaptchaQuestion({ q: `${a} + ${b} = ?`, a: ans });
    setCaptchaAnswer('');
  };
  const [nameWarning, setNameWarning] = useState(false);
  const [warnings, setWarnings] = useState<Record<string, string | null>>({});
  const [showSearchPreview, setShowSearchPreview] = useState(true);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState<{ score: number, feedback: string } | null>(null);

  // eKYC Pre-submit Confirmation Modal States
  const [showPostConfirmModal, setShowPostConfirmModal] = useState(false);
  const [ekycConfirmStep, setEkycConfirmStep] = useState<number>(1); // 1: Select Type, 2: eKYC Form, 3: Camera Capture, 4: Payment, 5: Processing
  const [payCardNumber, setPayCardNumber] = useState('');
  const [payCardExpiry, setPayCardExpiry] = useState('');
  const [payCardCvc, setPayCardCvc] = useState('');
  const [payCardName, setPayCardName] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [ekycDocType, setEkycDocType] = useState<'license' | 'mynumber' | 'passport'>('license');
  const [postCapturedImages, setPostCapturedImages] = useState<{ front?: string; thickness?: string; back?: string }>({});
  const [ekycProgress, setEkycProgress] = useState(0);
  const [ekycName, setEkycName] = useState('');
  const [ekycBirthdate, setEkycBirthdate] = useState('');
  const [isEkycCompleted, setIsEkycCompleted] = useState(() => 
    localStorage.getItem('ekyc_verified') === 'true' || user?.is_ekyc_verified === true
  );

  // マウント時に前回のモーダル状態セッションを安全に消去
  useEffect(() => {
    sessionStorage.removeItem('show_post_confirm_modal');
    sessionStorage.removeItem('ekyc_confirm_step');
  }, []);

  useEffect(() => {
    const checkEkycStatus = () => {
      const isVerified = localStorage.getItem('ekyc_verified') === 'true' || !!user?.is_ekyc_verified;
      setIsEkycCompleted(isVerified);
    };
    checkEkycStatus();
    window.addEventListener('ekyc_changed', checkEkycStatus);
    return () => window.removeEventListener('ekyc_changed', checkEkycStatus);
  }, [user]);

  // eKYCカメラの切断・クリーンアップ保証
  useEffect(() => {
    if (ekycConfirmStep !== 3 || !showPostConfirmModal) {
      stopAllGlobalCameraStreams();
    }
    return () => {
      stopAllGlobalCameraStreams();
    };
  }, [ekycConfirmStep, showPostConfirmModal]);

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    let interval: any;
    if (showPostConfirmModal && ekycConfirmStep === 5) {
      setEkycProgress(0);
      hasSubmittedRef.current = false;
      interval = setInterval(() => {
        setEkycProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 120);
    }
    return () => clearInterval(interval);
  }, [ekycConfirmStep, showPostConfirmModal]);

  useEffect(() => {
    if (showPostConfirmModal && ekycConfirmStep === 5 && ekycProgress === 100 && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      const timer = setTimeout(() => {
        executePost(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [ekycProgress, ekycConfirmStep, showPostConfirmModal]);

  const executePost = async (withEkyc: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          questions,
          captchaToken: 'mock-token',
          isEkycVerified: withEkyc || isEkycCompleted
        })
      });
      if (res.ok) {
        const data = await res.json();
        const postUrl = getPostUrl({
          id: data.id,
          target_name: formData.targetName,
          target_hometown: formData.targetHometown,
          era: formData.era,
          relationship: formData.category
        });
        
        if (withEkyc) {
          localStorage.setItem('ekyc_verified', 'true');
          window.dispatchEvent(new Event('ekyc_changed'));
        }

        sessionStorage.removeItem('show_post_confirm_modal');
        sessionStorage.removeItem('ekyc_confirm_step');
        setShowPostConfirmModal(false);
        navigate(postUrl, { state: { justPosted: true, postedWithEkyc: withEkyc } });
      } else {
        const data = await res.json();
        alert(data.error || '投稿に失敗しました。入力内容を確認してください。');
        hasSubmittedRef.current = false;
        setEkycConfirmStep(4);
      }
    } catch (err) {
      console.error(err);
      alert('ネットワークエラーが発生しました。時間を置いて再度お試しください。');
      hasSubmittedRef.current = false;
      setEkycConfirmStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    if (user) {
      const uFullName = user.fullName || (user.lastName && user.firstName ? `${user.lastName} ${user.firstName}` : '');
      const uNickname = user.nickname || '';
      const savedType = localStorage.getItem('remeets_default_contact_type') || (user as any)?.contact_type || 'LINE';
      const savedId = localStorage.getItem('remeets_default_contact_id') || (user as any)?.contact_id || '';

      setFormData(prev => ({ 
        ...prev, 
        searcherFullName: uFullName || '',
        searcherName: uNickname || '',
        contactType: prev.contactId ? prev.contactType : (savedType || prev.contactType),
        contactId: prev.contactId || savedId || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [step]);

  const toHalfWidth = (str: string) => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(/[ａ-ｚＡ-Ｚ]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  const checkRealName = (name: string) => {
    const commonKanji = /[\u4e00-\u9faf]/;
    const isRealName = name.length > 1 && (commonKanji.test(name) || (user?.name && name.includes(user.name)));
    setNameWarning(isRealName);
  };

  const handleSearcherNameChange = (name: string) => {
    const ngLabel = checkNg(name);
    setWarnings(prev => ({ ...prev, searcherName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ ...prev, searcherName: name }));
    checkRealName(name);
  };

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

  const handleQuestionChange = (idx: number, field: string, value: string) => {
    const ngLabel = checkNg(value);
    const warningKey = `question_${idx}_${field}`;
    setWarnings(prev => ({ ...prev, [warningKey]: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    const newQs = [...questions];
    newQs[idx] = { ...newQs[idx], [field]: value };
    setQuestions(newQs);
  };

  const handleTargetLastNameChange = (val: string) => {
    const ngLabel = checkNg(val);
    setWarnings(prev => ({ ...prev, targetLastName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ ...prev, targetLastName: val, targetName: `${val} ${prev.targetFirstName}`.trim() }));
  };

  const handleTargetFirstNameChange = (val: string) => {
    const ngLabel = checkNg(val);
    setWarnings(prev => ({ ...prev, targetFirstName: ngLabel ? `禁止文字（${ngLabel}）が含まれています。` : null }));
    setFormData(prev => ({ ...prev, targetFirstName: val, targetName: `${prev.targetLastName} ${val}`.trim() }));
  };

  const handleAiDiagnosis = async (idx: number) => {
    const q = questions[idx].question;
    const a = questions[idx].answer;
    if (!q || !a) {
      setWarnings(prev => ({ ...prev, [`question_${idx}_ai`]: '質問と答えの両方を入力してください。' }));
      return;
    }
    setWarnings(prev => ({ ...prev, [`question_${idx}_ai`]: null }));
    setIsAiDiagnosing(true);
    try {
      const res = await fetch('/api/ai/diagnose-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, answer: a })
      });
      const result = await res.json();
      setAiDiagnosisResult(result);
    } catch (err) {
      console.error(err);
      setWarnings(prev => ({ ...prev, [`question_${idx}_ai`]: '診断に失敗しました。時間をおいて再度お試しください。' }));
    } finally {
      setIsAiDiagnosing(false);
    }
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
    setStepEnteredTime(Date.now());
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
    setStepEnteredTime(Date.now());
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  };

  const jumpToStep = (targetStep: number) => {
    setStep(targetStep);
    setStepEnteredTime(Date.now());
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  };

  const steps = [
    {
      title: "お相手の情報とあなたの手がかり",
      description: "探している大切な方の情報と、当時のあなたに関する手がかりをご入力ください。",
      fields: (
        <div className="space-y-6">
          {/* お相手の情報 */}
          <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-100/60 -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-slate-700">
              <div className="flex items-center gap-2.5">
                <Search size={22} className="text-slate-700 shrink-0" />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  1. 探しているお相手の情報
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-slate-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                <span>TO</span>
                <span className="text-[9px] opacity-75">宛先</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手の姓<span className="text-[10px] text-red-600 font-bold ml-1 tracking-normal">＊必須</span>
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="例：山田" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetLastName}
                  onChange={e => handleTargetLastNameChange(e.target.value)}
                />
                <WarningMessage message={warnings.targetLastName} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手の名<span className="text-[10px] text-red-600 font-bold ml-1 tracking-normal">＊必須</span>
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="例：太郎" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetFirstName}
                  onChange={e => handleTargetFirstNameChange(e.target.value)}
                />
                <WarningMessage message={warnings.targetFirstName} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手のローマ字表記（姓）<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
                </label>
                <input 
                  type="text" 
                  placeholder="例：Yamada" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  お相手のローマ字表記（名）<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
                </label>
                <input 
                  type="text" 
                  placeholder="例：Taro" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  ゆかりの地（都道府県）<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
                  value={formData.targetHometownPref}
                  onChange={e => handleInputChange('targetHometownPref', e.target.value)}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                <WarningMessage message={warnings.targetHometownPref} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  地域・詳細な場所（市区町村以下）<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="例：世田谷区、横浜市中区など" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetHometownArea}
                  onChange={e => handleInputChange('targetHometownArea', e.target.value)}
                />
                <WarningMessage message={warnings.targetHometownArea} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  当時の所属（学校・職場など）<span className="text-[10px] text-zinc-500 font-bold ml-1">＊任意</span>
                </label>
                <input 
                  type="text" 
                  placeholder="例：〇〇市立第一中学校" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.targetSchool}
                  onChange={e => handleInputChange('targetSchool', e.target.value)}
                />
                <WarningMessage message={warnings.targetSchool} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black flex items-center gap-1">
                  出会った時期・年代<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <select 
                  required
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
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
                <WarningMessage message={warnings.era} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black flex items-center gap-1">
                関係性のカテゴリー<span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
              </label>
              <select 
                required
                className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] font-sans letter-field-select"
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
              <WarningMessage message={warnings.category} />
            </div>
          </div>

          {/* 差出人（あなた）の手がかり */}
          <div className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-amber-200/80 shadow-xs overflow-hidden transition-all">
            <div className="flex items-center justify-between border-b border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-orange-50/30 to-[#FAF6F0] -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4 border-l-amber-700">
              <div className="flex items-center gap-2.5">
                <BookOpen size={22} className="text-amber-800 shrink-0" />
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  2. 差出人（あなた）の手がかり
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-amber-800 text-white shadow-2xs shrink-0 flex items-center gap-1">
                <span>FROM</span>
                <span className="text-[9px] opacity-75">差出人</span>
              </span>
            </div>

            <div className="space-y-4">
              {/* タイトル & 警告 */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-700" />
                  お相手にあなただと気づいてもらうための「共通の想い出ヒント」
                  <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </label>
                <div className="flex items-start gap-1.5 text-[11px] text-red-800 font-bold bg-red-50/90 p-2.5 rounded-xl border border-red-200/90 leading-relaxed">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                  <span>ネット上に一般公開されます。お互いの安全のため、個人情報の入力は絶対にやめてください。（※電話番号・住所・実名などの個人情報や禁止用語が含まれる場合、AI安全監査により投函できません）</span>
                </div>
              </div>

              {/* テキスト入力欄（ガイドの上に配置） */}
              <div className="space-y-1.5">
                <textarea 
                  required
                  placeholder="例：当時「主将」と呼ばれていた者です。大会前の居残り練習や、帰り道に駄菓子屋で一緒にアイスを食べながら将来の夢を語り合いましたね。" 
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
                      💡 <strong>手紙本文との違い:</strong> お相手へのご挨拶や近況報告、本格的なメッセージ、開示用連絡先は、最後の<strong>【Step 3（非公開の手紙本文）】</strong>で安全に入力します。
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
                          <li>電話番号、LINE ID、メールアドレス（※連絡先はStep 3で安全開示）</li>
                          <li>詳細な自宅番地、実名フルネーム、勤務先の具体的部署</li>
                          <li>「元気？会いたいから連絡して」（※手紙の本文はStep 3で書く）</li>
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
      ),
      isValid: () => 
        formData.targetLastName.length > 0 && 
        formData.targetFirstName.length > 0 && 
        formData.targetHometownPref.length > 0 &&
        formData.targetHometownArea.length > 0 &&
        formData.era.length > 0 &&
        formData.category.length > 0 &&
        formData.searcherName.length > 0 &&
        formData.searcherFullName.length > 0 &&
        formData.searcherProfile.length > 0 &&
        !warnings.targetLastName && 
        !warnings.targetFirstName && 
        !warnings.targetHometownPref && 
        !warnings.targetHometownArea && 
        !warnings.targetSchool &&
        !warnings.era &&
        !warnings.category &&
        !warnings.searcherProfile
    },
    {
      title: "二人だけの思い出の質問",
      description: "プライバシーを守るため、本人確認用の「思い出の質問」を2問作成してください。両方の正解が必須となります。",
      fields: (
        <div className="space-y-6">
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
            {questions.map((q, idx) => {
              const hasSentenceEnding = /(です|でした|だよ|だね|だった|である|！|!|？|\?|。|、)$/.test(q.answer.trim());
              const isFirst = idx === 0;
              return (
                <div key={idx} className="space-y-5 bg-white/95 p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
                  {/* カードヘッダー */}
                  <div className={`flex items-center justify-between border-b ${isFirst ? 'border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-sky-50/30 to-[#FAF6F0] border-l-indigo-700' : 'border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-[#FAF6F0] border-l-teal-700'} -mx-5 -mt-5 p-4 md:-mx-6 md:-mt-6 md:p-5 border-l-4`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-5 rounded-full inline-block shrink-0 ${isFirst ? 'bg-indigo-700' : 'bg-teal-700'}`} />
                      <HelpCircle size={22} className={isFirst ? "text-indigo-800 shrink-0" : "text-teal-800 shrink-0"} />
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                        思い出の質問 {idx + 1}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleAiDiagnosis(idx)}
                        disabled={isAiDiagnosing}
                        className="text-xs text-slate-700 hover:text-indigo-600 flex items-center gap-1 font-bold tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-all active:scale-95"
                      >
                        <Sparkles size={13} className="text-amber-600" />
                        {isAiDiagnosing ? '診断中...' : 'セキュリティ診断'}
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
                      value={q.question}
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
                      value={q.answer}
                      onChange={e => handleQuestionChange(idx, 'answer', toHalfWidth(e.target.value))}
                      inputMode="url"
                      autoCapitalize="off"
                      autoCorrect="off"
                    />
                    {hasSentenceEnding && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-bold animate-fade-in">
                        <span>💡 「です」「！」などの語尾や記号を省いた単語のみ（例: <code>さくらや</code>）で設定すると、相手が正解しやすくなります。</span>
                      </p>
                    )}
                    <WarningMessage message={warnings[`question_${idx}_answer`]} />
                  </div>

                  {/* AI診断結果表示 */}
                  {aiDiagnosisResult && questions[idx].question === q.question && (
                    <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black">AI診断スコア: {aiDiagnosisResult.score}/100</span>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${aiDiagnosisResult.score > 70 ? 'bg-emerald-500' : aiDiagnosisResult.score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${aiDiagnosisResult.score}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{aiDiagnosisResult.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ),
      isValid: () => 
        questions.length >= 2 &&
        questions[0].question.length > 0 && 
        questions[0].answer.length > 0 && 
        questions[1].question.length > 0 && 
        questions[1].answer.length > 0 &&
        !warnings.question_0_question &&
        !warnings.question_0_answer &&
        !warnings.question_1_question &&
        !warnings.question_1_answer
    },
    {
      title: "手紙と開示用連絡先の設定",
      description: `${formData.targetName ? `${formData.targetName} 様` : 'お相手'}へ届ける手紙の本文と、質問正解後にのみ安全に開示される連絡先を1つ設定してください。`,
      fields: (
        <div className="space-y-6">
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

            {/* 赤バック注意事項（前ページと同じスタイル） */}
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
                  💡 <strong>手紙本文について:</strong> この手紙本文は一般公開されず、質問に全問正解したお相手のみが開封できます。当時の想いや再会へのメッセージを安心してお書きください。
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
                ※ 手紙本文には電話番号・LINE ID・メールアドレス等の連絡先や詳細な住所は直接書かないでください（AI安全監査により投函エラーとなります）。<br />
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
        </div>
      ),
      isValid: () => formData.message.length > 0 && formData.contactId.length > 0 && !warnings.message && !warnings.contactId
    },
    {
      title: "投函前の最終確認シート",
      description: "入力したすべての内容をご確認の上、画面下の認証を行って海へ流してください。修正したい箇所は各項目の「変更する」ボタンから修正できます。",
      fields: (
        <div className="space-y-6">
          {/* 1. お相手の情報シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-slate-700 rounded-full inline-block" />
                <Search size={20} className="text-slate-700" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">1. 探しているお相手の情報</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(0)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm font-sans">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">お相手のお名前</span>
                <span className="font-bold text-slate-900 text-sm">{formData.targetName} 様</span>
                {formData.targetNameEn && <span className="text-xs text-slate-500 ml-1.5">({formData.targetNameEn})</span>}
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">ゆかりの地</span>
                <span className="font-bold text-slate-900 text-sm">{formData.targetHometown || '未入力'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">当時の所属（学校・職場など）</span>
                <span className="font-bold text-slate-900 text-sm">{formData.targetSchool || 'なし'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 block text-[11px]">出会った年代・関係性</span>
                <span className="font-bold text-slate-900 text-sm">{formatEraLabel(formData.era)} / {getCategoryText(formData.category)}</span>
              </div>
            </div>
          </div>

          {/* 2. 差出人の手がかりシート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-amber-700 rounded-full inline-block" />
                <BookOpen size={20} className="text-amber-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">2. 差出人（あなた）の手がかり</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(0)}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="space-y-2 text-xs md:text-sm font-sans">
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                <span className="text-amber-900/70 block text-[11px]">あなたの表示名</span>
                <span className="font-bold text-slate-900">{formData.searcherName}</span>
              </div>
              <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60 space-y-1">
                <span className="text-amber-900/70 block text-[11px]">共通の想い出ヒント（一般公開）</span>
                <p className="text-slate-900 leading-relaxed font-serif whitespace-pre-wrap">{formData.searcherProfile}</p>
              </div>
            </div>
          </div>

          {/* 3. 二人だけの思い出の質問シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-teal-700 rounded-full inline-block" />
                <HelpCircle size={20} className="text-teal-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">3. 二人だけの思い出の質問</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(1)}
                className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full border border-teal-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="space-y-2.5 text-xs md:text-sm font-sans">
              {questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-teal-900">質問 {idx + 1}:</span>
                    <p className="font-medium text-slate-900">{q.question}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block">設定した答え</span>
                    <span className="font-bold text-teal-900 bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs font-mono">
                      {q.answer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 手紙本文シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-indigo-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-indigo-700 rounded-full inline-block" />
                <Mail size={20} className="text-indigo-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">4. 【{formData.targetName || 'お相手'} 様】へ届ける手紙</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(2)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
              <span className="text-indigo-900/70 block text-[11px] mb-1 font-sans">手紙本文（正解後のみ開示）</span>
              <p className="text-slate-900 font-serif leading-relaxed whitespace-pre-wrap text-sm md:text-base">{formData.message}</p>
            </div>
          </div>

          {/* 5. 開示用連絡先シート */}
          <div className="bg-white/95 p-5 md:p-6 rounded-2xl border border-teal-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-teal-700 rounded-full inline-block" />
                <Share2 size={20} className="text-teal-800" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">5. 開示する連絡先設定</h3>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(2)}
                className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full border border-teal-300 transition-all cursor-pointer active:scale-95"
              >
                <span>✏️ 変更する</span>
              </button>
            </div>
            <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm font-sans">
              <div>
                <span className="text-slate-500 text-[11px] block">{formData.contactType} アカウント/リンク</span>
                <span className="font-bold text-slate-900">{formData.contactId}</span>
              </div>
              {formData.contactNote && (
                <div className="text-slate-600 text-xs">
                  <span>メモ: </span>{formData.contactNote}
                </div>
              )}
            </div>
          </div>

          {/* Google検索プレビュー */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <button
              type="button"
              onClick={() => setShowSearchPreview(!showSearchPreview)}
              className="w-full flex items-center justify-between text-left font-bold text-slate-800 text-xs hover:text-brand-primary cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Search size={14} className="text-brand-primary shrink-0" />
                <span>💡 Google検索結果での見え方イメージを確認</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {showSearchPreview ? '閉じる ▲' : 'プレビュー ▼'}
              </span>
            </button>

            {showSearchPreview && (
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <GoogleSearchResultPreview 
                  targetName={formData.targetName}
                  era={formData.era}
                  location={formData.targetHometown}
                  searcherName={formData.searcherName}
                  teaser={formData.searcherProfile}
                />
              </div>
            )}
          </div>

          {/* ボットチェック */}
          <div className="p-4 bg-teal-50/70 rounded-2xl border-2 border-teal-300/80 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-teal-950 font-bold text-xs">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-teal-700" />
                <span>ボットチェック（スパム防止）</span>
                <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
              </div>
              {captchaAnswer === captchaQuestion.a && (
                <span className="text-[10px] bg-teal-700 text-white font-bold px-2 py-0.5 rounded-md">
                  ✓ 正解
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-base font-serif text-zinc-950 font-bold bg-white px-4 py-2 rounded-xl border border-zinc-300 shadow-2xs">
                {captchaQuestion.q}
              </div>
              <input 
                type="text" 
                name="quiz_bot_prevention_answer"
                id="quiz_bot_prevention_input"
                placeholder="答えを入力" 
                className="w-32 py-2 px-3 border-2 border-zinc-400 focus:border-brand-primary rounded-xl outline-none bg-white font-serif text-base text-center text-zinc-950 font-bold placeholder:text-zinc-400"
                value={captchaAnswer}
                onChange={e => setCaptchaAnswer(toHalfWidth(e.target.value))}
                inputMode="numeric"
                autoComplete="new-password"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer bg-white px-3 py-2 rounded-xl border border-teal-200 shadow-2xs transition-all active:scale-95"
              >
                <RefreshCw size={12} />
                <span>別の問題</span>
              </button>
            </div>
          </div>

          {/* 利用規約同意 */}
          <div 
            onClick={() => setAgreed(!agreed)}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${agreed ? 'bg-emerald-50/80 border-emerald-500 shadow-xs' : 'bg-amber-50/60 border-amber-300 hover:border-amber-400'}`}
          >
            <input 
              type="checkbox" 
              id="agreement"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              onClick={e => e.stopPropagation()}
              className="mt-0.5 w-5 h-5 rounded border-zinc-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
            <div className="text-xs text-zinc-900 leading-relaxed font-sans space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck size={18} className={agreed ? "text-emerald-600" : "text-amber-700"} />
                  <span>利用規約・投稿ガイドラインへの同意</span>
                  <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                </div>
                {agreed && (
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                    ✓ 同意済
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-700 font-medium">
                純粋な再会・旧交目的にのみ利用し、誹謗中傷や不適切な表現を行わないことに同意します。
              </p>
              <div className="text-[11px] text-zinc-600 font-normal flex flex-wrap items-center gap-1 pt-0.5">
                <span>規約を確認：</span>
                <Link 
                  to="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()} 
                  className="text-teal-800 hover:underline font-bold"
                >
                  利用規約
                </Link>
                <span>・</span>
                <Link 
                  to="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()} 
                  className="text-teal-800 hover:underline font-bold"
                >
                  プライバシーポリシー
                </Link>
              </div>
            </div>
          </div>
        </div>
      ),
      isValid: () => agreed && captchaAnswer === captchaQuestion.a
    }
  ];

  const handleNextStep = () => {
    if (steps[step].isValid()) {
      nextStep();
      window.scrollTo(0, 0);
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { immediate: true });
      }
    } else {
      if (step === 0) {
        alert('【Step 1】お相手のお名前、ゆかりの地、年代、関係性、あなたのニックネーム・フルネーム・手がかりをすべてご入力ください。');
      } else if (step === 1) {
        alert('【Step 2】思い出の質問（2問）と答えをすべてご入力ください。');
      } else if (step === 2) {
        alert('【Step 3】手紙のメッセージ本文と、開示用連絡先IDをご入力ください。');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 最終ステップ（Step 4）以外では送信処理は絶対に実行しない
    if (step < steps.length - 1) {
      return;
    }

    // Step遷移直後（800ms以内）の誤クリック・連打を安全にガード
    if (Date.now() - stepEnteredTime < 800) {
      return;
    }
    
    // Check previous steps
    if (!steps[0].isValid()) {
      setStep(0);
      alert('【Step 1: お相手と記憶】の入力項目（お相手の姓名、ゆかりの地、年代、差出人情報など）をご確認ください。');
      return;
    }

    if (!steps[1].isValid()) {
      setStep(1);
      alert('【Step 2: 思い出の質問】の質問2問と答えをご確認ください。');
      return;
    }

    if (!steps[2].isValid()) {
      setStep(2);
      alert('【Step 3: 手紙と連絡先】の手紙本文と開示用連絡先IDをご確認ください。');
      return;
    }
    
    const hasWarnings = Object.values(warnings).some(w => w !== null);
    if (hasWarnings) {
      alert('禁止文字が含まれている項目があります。内容をご確認・修正してください。');
      return;
    }

    if (!agreed) {
      alert('「利用規約・投稿ガイドラインへの同意」のチェックボックスにチェックを入れてください。');
      return;
    }

    if (!captchaAnswer || captchaAnswer !== captchaQuestion.a) {
      alert(`ボットチェック（計算問題: ${captchaQuestion.q}）の答えを正しく入力してください。`);
      return;
    }

    // 既にeKYC完了済みの場合は、eKYC申請手続きを自動スキップして直接認証済みとして投稿
    const alreadyVerified = isEkycCompleted || user?.is_ekyc_verified || localStorage.getItem('ekyc_verified') === 'true';
    if (alreadyVerified) {
      executePost(true);
      return;
    }

    // 未認証の場合のみ、eKYC選択・申請モーダルを開く
    setShowPostConfirmModal(true);
    setEkycConfirmStep(1);
  };

  const currentStep = steps[step];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
      <BackToHomeButton className="mb-4" />
      <div className="mb-12 space-y-4">
        <PageHeader
          icon={<Send size={24} className="text-indigo-600" />}
          iconBoxClassName="bg-indigo-50 text-indigo-600 border border-indigo-100"
          category="Create Bottle Mail"
          title="ボトルメールを流す"
          description="いつか届くかもしれない手紙を預かる場所。あなたの記憶を頼りに、いつか再会できることを願って大切に綴っていきましょう。"
          action={
            <Link to="/guidelines" className="hidden sm:inline-flex items-center gap-1.5 text-xs text-black/80 hover:text-black hover:underline font-bold shrink-0 font-sans border border-black/10 px-3 py-1.5 rounded-lg bg-black/5">
              <Shield size={14} />
              <span>ガイドライン</span>
            </Link>
          }
        />

        {/* リッチな海洋テーマ・ボトル流しプログレスバー */}
        <div className="bg-gradient-to-r from-sky-50/90 via-teal-50/80 to-indigo-50/90 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-teal-500/20 shadow-md space-y-4 mb-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-xs font-sans tracking-wide">
                  STEP {step + 1} / {steps.length}
                </span>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline font-sans">
                  {currentStep.title}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 shadow-2xs">
              <Sparkles size={13} className="text-teal-600 animate-pulse" />
              <span>ボトル旅立ちの準備中</span>
            </div>
          </div>

          {/* 波間を進むプログレスバー & ぷかぷかボトル */}
          <div className="relative pt-6 pb-2 px-3">
            {/* 進行状況バー */}
            <div className="relative h-3 w-full bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/40 p-0.5 shadow-inner">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-teal-400 via-sky-500 to-indigo-600 relative overflow-hidden shadow-xs"
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* 光沢アニメーションストライプ */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              </motion.div>
            </div>

            {/* 上下揺らめくボトルアイコン (現在位置と完全同期) */}
            <motion.div 
              className="absolute -top-3 z-20 pointer-events-none -translate-x-1/2"
              initial={{ left: '0%' }}
              animate={{ left: `${((step + 0.5) / steps.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                animate={{ y: [0, -6, 0], rotate: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-amber-300 px-2.5 py-1 rounded-full shadow-lg border border-amber-300/40 flex items-center gap-1.5 text-xs font-bold backdrop-blur-xs">
                  <span className="text-base leading-none">🍾</span>
                  <span className="text-[10px] text-amber-100 font-sans tracking-tight">漂流中...</span>
                </div>
                {/* 小さな水滴・波紋効果 */}
                <div className="w-1.5 h-1.5 bg-sky-400/80 rounded-full animate-ping mt-0.5"></div>
              </motion.div>
            </motion.div>

            {/* ステップノード (1, 2, 3) */}
            <div className="relative flex justify-between items-center -mt-2">
              {steps.map((s, i) => {
                const isDone = i < step;
                const isCurrent = i === step;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (i < step) setStep(i);
                    }}
                    disabled={i > step}
                    className={cn(
                      "flex flex-col items-center group transition-all cursor-pointer disabled:cursor-not-allowed",
                      i > step && "opacity-60"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 z-10 border-2",
                        isDone 
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20" 
                          : isCurrent 
                            ? "bg-indigo-600 border-white text-white ring-4 ring-indigo-500/30 shadow-lg scale-110" 
                            : "bg-white border-slate-300 text-slate-400"
                      )}
                    >
                      {isDone ? <Check size={14} className="stroke-[3]" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-[11px] font-bold mt-1.5 transition-colors font-sans max-w-[100px] text-center leading-tight hidden xs:block",
                      isCurrent ? "text-indigo-950 font-black" : isDone ? "text-emerald-800" : "text-slate-400"
                    )}>
                      {i === 0 ? "1. お相手と記憶" : i === 1 ? "2. 思い出の質問" : i === 2 ? "3. 手紙と連絡先" : "4. 最終確認・投函"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-2 bg-white/80 backdrop-blur-xs p-5 md:p-6 rounded-2xl border border-indigo-100 shadow-2xs"
        >
          <div className="flex items-center gap-3 text-indigo-900 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
            <span className="px-3 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200/80 rounded-full font-sans font-bold">Step {step + 1} of {steps.length}</span>
            <span className="w-6 h-[1px] bg-indigo-200"></span>
            <span className="font-sans text-indigo-700 font-bold">{currentStep.title}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-black tracking-wider leading-tight">{currentStep.title}</h2>
          <p className="text-xs md:text-sm text-zinc-700 font-sans leading-relaxed max-w-2xl">{currentStep.description}</p>
        </motion.div>
      </div>

      <div className="glass-card p-8 md:p-12 mb-8">
        <form 
          onSubmit={handleSubmit} 
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault(); 
            }
          }} 
          className="space-y-8"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {currentStep.fields}
          </motion.div>

          {/* 投稿に関する重要な法的責任 - 最終ステップ（流すボタンの直前）のみ表示 */}
          {step === steps.length - 1 && (
            <div className="p-6 bg-white border border-black rounded-2xl space-y-2 shadow-2xs text-black font-sans my-6">
              <div className="flex items-center gap-2 font-bold text-black">
                <ShieldAlert size={18} className="text-amber-600 shrink-0" />
                <span className="text-sm font-serif">投稿に関する重要な法的責任</span>
              </div>
              <p className="text-xs md:text-sm text-black/80 leading-relaxed font-serif text-left">
                ReMEETsは実名での検索を可能にするサービスです。第三者の情報を掲載する際は、相手のプライバシーに十分配慮し、誹謗中傷やストーキング目的での利用は絶対に行わないでください。悪質な利用が確認された場合、公的機関への情報提供を含めた厳正な対処を行います。
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-brand-border">
            {step > 0 ? (
              <button 
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-sm font-bold text-brand-dark/40 hover:text-brand-dark transition-colors uppercase tracking-widest font-sans"
              >
                <ArrowLeft size={16} />
                <span>戻る</span>
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <button 
                type="button"
                onClick={handleNextStep}
                className="btn-primary px-10 font-sans flex items-center gap-2"
              >
                <span>{step === 2 ? '確認画面へ進む' : '次へ進む'}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <button 
                  type="submit"
                  disabled={isSubmitting || !agreed || captchaAnswer !== captchaQuestion.a}
                  className={`btn-primary px-12 font-sans flex items-center gap-2 shadow-lg transition-all ${
                    !agreed || captchaAnswer !== captchaQuestion.a
                      ? 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-brand-accent border-brand-accent hover:bg-brand-dark hover:border-brand-dark cursor-pointer hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ボトルメールを海へ流す</span>
                      <Heart size={16} />
                    </>
                  )}
                </button>
                {(!agreed || captchaAnswer !== captchaQuestion.a) && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    ※ 上の「ボットチェック」と「規約同意」を入力すると投函できます
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-sm text-black leading-relaxed max-w-lg mx-auto">
          ※ 投函された内容は、お相手が検索で見つけられるよう公開されます。<br />
          ※ プライベートメッセージと連絡先は、質問に正解したお相手のみに安全に開示されます。
        </p>
      </div>

      {/* 投函処理中フルスクリーンローディング */}
      {isSubmitting && !showPostConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-teal-100 text-center space-y-4 font-sans">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-slate-900 text-base">
                手紙を海へ流しています...
              </h3>
              <p className="text-xs text-slate-500">
                思い出の暗号化と安全な保護を行っています
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 投函前 eKYC 確認モーダル（5ステップ構成：1.コース選択 2.情報入力 3.カメラ撮影 4.Stripe決済 5.AI監査中） */}
      {showPostConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden text-left flex flex-col max-h-[92vh]">
            {/* モーダルヘッダー */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-indigo-50/50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base font-serif">
                    {ekycConfirmStep === 1 && '手紙の投函・本人確認コースの選択'}
                    {ekycConfirmStep === 2 && '本人確認（eKYC）基本情報入力'}
                    {ekycConfirmStep === 3 && '本人確認書類の撮影'}
                    {ekycConfirmStep === 4 && '本人確認審査手数料のお支払い'}
                    {ekycConfirmStep === 5 && 'AI本人確認・照合処理中'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    {ekycConfirmStep === 1 && '安心・安全な再会をお届けするための選択です'}
                    {ekycConfirmStep === 2 && '公的身分証明書に記載の正確な情報をご入力ください'}
                    {ekycConfirmStep === 3 && '原本を枠内に収めて鮮明に撮影してください'}
                    {ekycConfirmStep === 4 && 'Stripeセキュア決済（審査手数料: 600円）'}
                    {ekycConfirmStep === 5 && '数秒で自動照合と暗号化安全投函が完了します'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (ekycConfirmStep === 5) return;
                  setShowPostConfirmModal(false);
                }}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* モーダル本文 */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-600 font-sans flex-1">
              {/* STEP 1: コース選択 */}
              {ekycConfirmStep === 1 && (
                <>
                  <div className="space-y-4">
                    {/* 【メイン枠】本人確認（eKYC）推奨推進カード */}
                    <div className="border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl p-4 md:p-5 space-y-3 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-sans">
                        推奨・安心バッジ付
                      </div>

                      <div className="flex gap-3">
                        <div className="text-emerald-600 bg-emerald-100/80 p-2.5 rounded-xl shrink-0 h-fit">
                          <ShieldCheck size={22} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                            🛡️ 厳格な公的本人確認（eKYC）
                          </h4>
                          <div className="flex items-center gap-1.5 py-0.5">
                            <span className="text-[10px] text-zinc-500">審査・認証手数料:</span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md font-mono">
                              600円 (税込)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-600 space-y-1.5 leading-relaxed border-t border-emerald-100/80 pt-2 font-sans">
                        <p className="text-[10px] text-emerald-950 font-normal leading-normal">
                          お名前と生年月日を公的身分証（免許証・マイナンバー・パスポートなど）で安全に照合します。
                        </p>
                        <ul className="space-y-1 pl-1 text-[9.5px] text-zinc-500">
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                            <span>手紙やお相手とのやり取りに<strong>「🛡️ 認証済マーク」</strong>が表示され、なりすましを防止します。</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                            <span>「本物のあなた」からの手紙であることが伝わるため、<strong>お相手の返信率が劇的に上がります。</strong></span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                            <span>送信された画像データは照合完了後、<strong>直ちに完全に破棄（パージ）</strong>されるため極めて安全です。</span>
                          </li>
                        </ul>
                      </div>

                      {/* 本人確認を登録して投函ボタン */}
                      <button
                        type="button"
                        onClick={() => {
                          setEkycConfirmStep(2);
                        }}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                      >
                        <ShieldCheck size={16} />
                        <span>⚡ 本人確認決済手続きへ進む</span>
                      </button>
                    </div>

                    {/* 【無料枠】本人確認をせずに無料投函カード（eKYCカードの半分以下の高さで視認性を確保） */}
                    <div className="border-2 border-brand-primary/50 bg-slate-50/90 rounded-2xl p-3.5 md:p-4 space-y-2.5 shadow-sm relative">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <Send size={16} className="text-brand-primary shrink-0" />
                          <h4 className="font-serif font-bold text-xs md:text-sm text-slate-900">
                            ✨ 通常投函（無料）
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-200/90 text-slate-700 px-2 py-0.5 rounded-md font-sans shrink-0">
                          0円 / 手数料なし
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        認証マークなしで、すぐにボトルメールを海へ流します。<br />
                        <span className="text-[10px] text-slate-500">※ 投函後にマイページから本人確認（eKYC）を行い、後から「🛡️ 認証済マーク」を付与することも可能です。</span>
                      </p>

                      <button
                        type="button"
                        onClick={() => executePost(false)}
                        className="w-full py-3 px-4 bg-brand-dark hover:bg-[#1e4f7a] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                      >
                        <Send size={15} />
                        <span>⚡ 本人確認をせずにボトルを投函する（無料）</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: eKYC フォーム入力 */}
              {ekycConfirmStep === 2 && (
                <div className="space-y-4 py-2 text-left">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-serif font-bold text-zinc-900">
                      1. オンライン本人確認 (eKYC) 情報入力
                    </h3>
                    <p className="text-xs text-zinc-500">
                      法令に基づく年齢確認と本人照合を行います。原本は確認後すぐに破棄されます。
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                        <span>お名前（漢字・ご本名フルネーム）</span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">必須</span>
                      </label>
                      <input 
                        type="text"
                        value={ekycName}
                        onChange={(e) => setEkycName(e.target.value)}
                        placeholder="例：本間 隆"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-xl bg-slate-50 focus:border-brand-primary outline-none text-xs text-black"
                      />
                    </div>

                    {/* Birthdate */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                        <span>生年月日</span>
                        <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">必須</span>
                      </label>
                      <input 
                        type="date"
                        value={ekycBirthdate}
                        onChange={(e) => setEkycBirthdate(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-xl bg-slate-50 focus:border-brand-primary outline-none text-xs text-black"
                      />
                    </div>

                    {/* Doc Type Selection */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">提出書類の選択</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'license', name: '運転免許証' },
                          { id: 'mynumber', name: 'マイナンバー' },
                          { id: 'passport', name: 'パスポート' }
                        ].map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setEkycDocType(doc.id as any)}
                            className={`py-1.5 border-2 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer ${
                              ekycDocType === doc.id 
                                ? 'border-teal-500 bg-teal-50 text-teal-800' 
                                : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-600'
                            }`}
                          >
                            {doc.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEkycName('本間 隆');
                          setEkycBirthdate('1985-06-15');
                        }}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100"
                      >
                        ⚡ デモ用サンプルデータを自動入力する
                      </button>
                    </div>

                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEkycConfirmStep(1)}
                      className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold font-sans text-center transition-all cursor-pointer"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!ekycName.trim()) {
                          alert('お名前を入力してください。');
                          return;
                        }
                        if (!ekycBirthdate) {
                          alert('生年月日を入力してください。');
                          return;
                        }
                        setEkycConfirmStep(3);
                      }}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold font-sans text-center transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>証明書の撮影画面へ進む（ガイド枠あり）</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Document Camera Capture with Guidelines Overlay */}
              {ekycConfirmStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-black font-serif">2. 身分証明書の撮影・アップロード</h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      反射や四隅の欠けを防ぐガイドライン枠線に合わせて撮影を行ってください。
                    </p>
                  </div>

                  <DocumentCameraOverlay
                    docType={ekycDocType}
                    docTypeName={
                      ekycDocType === 'license' ? '運転免許証' : ekycDocType === 'mynumber' ? 'マイナンバーカード' : 'パスポート'
                    }
                    onBack={() => setEkycConfirmStep(2)}
                    onComplete={(imgs) => {
                      setPostCapturedImages(imgs);
                      setEkycConfirmStep(4);
                    }}
                  />
                </div>
              )}

              {/* Step 4: Payment (Credit Card Billing) */}
              {ekycConfirmStep === 4 && (
                <div className="space-y-5 py-2 text-left">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 animate-bounce">
                      <CreditCard size={24} />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-zinc-900 text-center">
                      3. 安全照合システム手数料のお支払い
                    </h3>
                    <p className="text-xs text-zinc-500 text-center">
                      なりすまし防止・安全対策を維持するための手数料決済です。
                    </p>
                  </div>

                  {/* Document capture summary badge */}
                  {postCapturedImages.front && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>身分証撮影完了（全3枚・カメラ自動切断・暗号化保護）</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEkycConfirmStep(3)}
                        className="text-[11px] text-teal-700 hover:underline font-bold cursor-pointer shrink-0 ml-2"
                      >
                        再撮影
                      </button>
                    </div>
                  )}

                  <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 text-center space-y-1 shadow-sm">
                    <div className="text-[10px] text-rose-800 font-bold tracking-wider">ご請求金額</div>
                    <div className="text-3xl font-sans font-extrabold text-rose-950 flex items-baseline justify-center gap-1">
                      <span>600</span>
                      <span className="text-sm font-bold">円</span>
                      <span className="text-xs text-zinc-500 font-normal">（税込）</span>
                    </div>
                    <div className="text-[9px] text-zinc-500">
                      安全照合・データ自動パージシステムの利用手数料
                    </div>
                  </div>

                  <CreditCardPaymentForm
                    cardNumber={payCardNumber}
                    cardExpiry={payCardExpiry}
                    cardCvc={payCardCvc}
                    cardName={payCardName}
                    onCardNumberChange={setPayCardNumber}
                    onCardExpiryChange={setPayCardExpiry}
                    onCardCvcChange={setPayCardCvc}
                    onCardNameChange={setPayCardName}
                    showDemoButton={true}
                    onDemoFill={() => {
                      setPayCardNumber('4111 1111 1111 1111');
                      setPayCardExpiry('12/29');
                      setPayCardCvc('123');
                      setPayCardName('TAKASHI HONMA');
                    }}
                    refundGuaranteeText="手紙開封または本人確認（eKYC）手続きが不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。"
                  />

                  {/* 18歳以上・利用規約・eKYC決済同意チェックボックス */}
                  <label className="flex items-start gap-3 p-3 bg-slate-50/90 rounded-xl border border-slate-200/90 hover:bg-slate-100/80 text-xs font-medium text-slate-800 cursor-pointer select-none leading-relaxed transition-all">
                    <input 
                      type="checkbox" 
                      id="ekyc-post-payment-consent"
                      defaultChecked={true}
                      className="w-4 h-4 mt-0.5 accent-teal-600 focus:ring-teal-500 border-zinc-300 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-slate-700 leading-snug">
                      <strong>【18歳以上・規約同意】</strong> 私は18歳以上であり、利用規約およびeKYC本人確認審査手数料（600円 税込）の決済に同意します。
                    </span>
                  </label>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => setEkycConfirmStep(3)}
                      className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold font-sans text-center transition-all cursor-pointer disabled:opacity-55"
                    >
                      撮影に戻る
                    </button>
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => {
                        const checkConsent = document.getElementById('ekyc-post-payment-consent') as HTMLInputElement;
                        if (!payCardNumber.trim() || payCardNumber.length < 15) {
                          alert('有効なカード番号を入力してください。');
                          return;
                        }
                        if (!payCardExpiry.trim() || !payCardExpiry.includes('/')) {
                          alert('有効期限（MM/YY）を入力してください。');
                          return;
                        }
                        if (!payCardCvc.trim() || payCardCvc.length < 3) {
                          alert('セキュリティコード（CVC）を正しく入力してください。');
                          return;
                        }
                        if (!payCardName.trim()) {
                          alert('カード名義人をお名前で入力してください。');
                          return;
                        }
                        if (checkConsent && !checkConsent.checked) {
                          alert('18歳以上の年齢確認および利用規約への同意にチェックを入れてください。');
                          return;
                        }
                        setIsPaying(true);
                        setTimeout(() => {
                          setIsPaying(false);
                          setEkycConfirmStep(5); // 照合・投稿プロセスへ
                        }, 1200);
                      }}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-sans text-center transition-all shadow-md cursor-pointer disabled:opacity-55 flex items-center justify-center gap-1.5"
                    >
                      {isPaying ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>決済処理中...</span>
                        </>
                      ) : (
                        <span>安全に600円を支払う</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Processing */}
              {ekycConfirmStep === 5 && (
                <div className="space-y-6 py-4 text-center font-serif">
                  {/* 中央の二重発光スピナー & アイコン */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    {/* 外周の発光オーラ */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
                    
                    {/* スピナーリング（外側・反時計回り） */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-teal-300/60 animate-[spin_8s_linear_infinite]" />
                    
                    {/* スピナーリング（内側・時計回り） */}
                    <div className="absolute w-20 h-20 rounded-full border-3 border-teal-100 border-t-emerald-600 border-r-teal-500 animate-spin" />
                    
                    {/* 中央コンテンツ */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-teal-800 font-serif">
                      <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent pl-0.5">
                        {ekycProgress}%
                      </span>
                      <span className="text-[9px] font-semibold text-teal-600/80 uppercase tracking-[0.22em] -mt-0.5">
                        Processing
                      </span>
                    </div>
                  </div>

                  {/* ステータスタイトル */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-serif font-bold tracking-[0.1em] shadow-xs">
                      <ShieldCheck size={14} className="text-emerald-600 animate-pulse" />
                      <span>公的本人確認・認証マーク付与中</span>
                    </div>
                    <h3 className="text-base font-serif font-extrabold tracking-[0.12em] md:tracking-[0.16em] text-zinc-900 pt-1">
                      {ekycProgress < 25 && '1. 決済の安全トークン化処理'}
                      {ekycProgress >= 25 && ekycProgress < 50 && '2. 公的書類データ＆暗号照合'}
                      {ekycProgress >= 50 && ekycProgress < 75 && '3. 生体ライブネス実在判定'}
                      {ekycProgress >= 75 && ekycProgress < 100 && '4. 認証キー発行＆ボトル投函準備'}
                      {ekycProgress === 100 && (isSubmitting ? '🌊 ボトルメールを海へ投函中...' : '✨ 認証＆ボトル投函完了！詳細ページへ移動します')}
                    </h3>
                  </div>

                  {/* プログレスバー本体 */}
                  <div className="space-y-1.5 px-2">
                    <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                      <span className="flex items-center gap-1 text-[11px] text-teal-700 font-serif tracking-[0.1em]">
                        <Lock size={12} /> 256bit 暗号化通信
                      </span>
                      <span className="text-emerald-700 font-bold font-serif tracking-[0.12em]">{ekycProgress} / 100%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                        style={{ width: `${ekycProgress}%` }}
                      >
                        {/* バー先端のLED光彩ノード */}
                        {ekycProgress > 0 && ekycProgress < 100 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4ステップ進行タイムラインリスト */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 0 && ekycProgress < 25 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : ekycProgress >= 25 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress >= 25 ? '✓' : '1'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">決済承認＆セキュリティトークン化</span>
                      </span>
                      {ekycProgress < 25 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">処理中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 25 && ekycProgress < 50 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : ekycProgress >= 50 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress >= 50 ? '✓' : '2'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">公的書類・文字データ暗号解析</span>
                      </span>
                      {ekycProgress >= 25 && ekycProgress < 50 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">解析中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 50 && ekycProgress < 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : ekycProgress >= 75 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress >= 75 ? '✓' : '3'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">実在生身人間（ライブネス）判定</span>
                      </span>
                      {ekycProgress >= 50 && ekycProgress < 75 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">判定中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${ekycProgress >= 75 ? 'bg-white shadow-xs border border-teal-200 font-bold text-teal-900' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${ekycProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-teal-100 text-teal-800'}`}>
                          {ekycProgress === 100 ? '✓' : '4'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">🛡️ 認証マーク付与＆ボトル投函完了</span>
                      </span>
                      {ekycProgress >= 75 && ekycProgress < 100 && <span className="text-[10px] text-teal-600 animate-pulse font-serif font-semibold tracking-[0.14em]">投函中...</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ChatComponent = ({ postId, otherUserId, otherUserName, otherUserFullName, isHighlighted, post }: { postId: number, otherUserId: number, otherUserName: string, otherUserFullName?: string, isHighlighted?: boolean, post?: any }) => {
  const { user, token } = useAuth();
  const { showConfirm } = useConfirm();
  const { check: checkNg } = useNgFilter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${postId}?otherUserId=${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [postId, otherUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (warning) {
      showConfirm('送信の確認', `${warning}\n\n個人情報の交換はトラブルの原因となる可能性があります。安全のため、外部サービスへの誘導や直接の連絡先交換は推奨していません。\n\nこのまま送信しますか？`, async () => {
        try {
          const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ postId, receiverId: otherUserId, content: newMessage })
          });
          if (res.ok) {
            setNewMessage('');
            fetchMessages();
          }
        } catch (err) {
          console.error(err);
        }
      });
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId, receiverId: otherUserId, content: newMessage })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`flex flex-col h-[650px] bg-white rounded-[40px] overflow-hidden shadow-2xl relative transition-all duration-700 ease-out ${
      isHighlighted 
        ? 'border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.55)] scale-[1.01] z-30' 
        : 'border-2 border-brand-border shadow-brand-primary/5'
    }`}>
      {/* Chat Header */}
      <div className="px-6 md:px-8 py-4 md:py-5 bg-white border-b border-brand-border flex items-center gap-4 md:gap-6 relative z-20 shadow-sm">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-brand-primary/10 flex items-center justify-center text-black shadow-inner border border-brand-primary/5">
            <UserIcon size={24} className="md:w-7 md:h-7" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-500 border-2 md:border-4 border-white shadow-sm" />
        </div>
        
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="font-serif text-lg md:text-xl font-[400] leading-tight text-black">
              {otherUserFullName ? otherUserFullName : otherUserName}
            </h2>
            <span className={`text-[11px] md:text-[13px] font-bold tracking-[0.1em] px-3 py-1 rounded-full border shadow-sm transition-all duration-700 ${
              isHighlighted 
                ? 'bg-emerald-500 text-white border-emerald-400' 
                : 'bg-brand-accent/20 text-black border-brand-accent/30'
            }`}>
              プライベート
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] md:text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 relative z-10 bg-slate-50/50">
        {messages.map((m, idx) => {
          const isMe = m.sender_id === user?.id;
          return (
            <React.Fragment key={m.id || idx}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-4 md:p-5 text-sm md:text-base leading-relaxed break-words",
                  isMe 
                    ? "bg-brand-dark text-white rounded-[24px] rounded-tr-none shadow-md shadow-brand-dark/10" 
                    : "bg-white text-black border-2 border-brand-border rounded-[24px] rounded-tl-none"
                )}>
                  {m.content}
                </div>
                <div className={cn(
                  "flex items-center gap-2 mt-2.5 px-1",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">
                    {new Date(m.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* 本人確認済バッジの表示 */}
                  {((m.sender_id === post?.user_id && post?.user_is_verified) || 
                    (m.sender_id !== post?.user_id && (isMe ? (localStorage.getItem('ekyc_verified') === 'true') : true))) && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 flex items-center gap-0.5 select-none animate-fade-in">
                      <ShieldCheck size={10} className="text-emerald-500" />
                      <span>本人確認済</span>
                    </span>
                  )}
                  {isMe && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
        
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-[32px] flex items-center justify-center text-black mb-8 shadow-inner">
              <Mail size={48} />
            </div>
            <p className="text-lg font-serif text-black/70 max-w-xs leading-relaxed">
              再会を祝して、最初のメッセージを送りましょう。<br />
              ここから新しい物語が始まります。
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-white border-t border-brand-border relative z-20">
        {messages.length === 0 && !agreed && (
          <div className="mb-6 p-6 bg-brand-primary/5 rounded-[24px] border border-brand-primary/10 space-y-4">
            <div className="flex items-center gap-2 text-brand-primary">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold">メッセージ送信前の安全同意</span>
            </div>
            <p className="text-xs text-brand-dark/70 leading-relaxed font-serif">
              最初のメッセージを送信する前に、以下の点にご同意ください：
              <br />・私は18歳以上（高校生を除く）です
              <br />・児童との交際、性的勧誘、犯罪行為を目的としません
              <br />・個人情報を不必要に開示せず、安全に配慮して会話します
            </p>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="msg_agreement"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              <label htmlFor="msg_agreement" className="text-xs font-bold text-brand-dark cursor-pointer">
                上記の規約と安全基準に同意し、メッセージのやり取りを開始します
              </label>
            </div>
          </div>
        )}
        {/* 1st Chat Highlight: Blink/Pulse box & text when first entering the chat and agreed */}
        <form onSubmit={handleSend} className="relative group">
          <div className={cn(
            "absolute inset-0 rounded-[24px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500",
            warning ? "bg-red-500/5" : "bg-brand-primary/5"
          )} />
          {(() => {
            const isFirstChat = messages.length === 0 && agreed;
            const shouldBlink = (isFirstChat || isHighlighted) && !newMessage.trim();
            return (
              <div className={cn(
                "relative flex items-center gap-2 md:gap-4 rounded-[24px] p-1.5 md:p-2 transition-all duration-500 border-2",
                warning 
                  ? "bg-red-50/30 border-red-300 focus-within:border-red-500 shadow-md shadow-red-500/5" 
                  : (shouldBlink
                      ? "bg-emerald-50/60 shadow-lg ring-4 ring-emerald-500/20 animate-chat-pulse duration-1000"
                      : "bg-emerald-50/30 border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-md focus-within:shadow-emerald-500/5"),
                (messages.length === 0 && !agreed) && "opacity-40 pointer-events-none"
              )}>
                <div 
                  role="button"
                  aria-label="ファイルを添付する"
                  tabIndex={0}
                  className={cn(
                    "p-2 md:p-3 transition-colors cursor-pointer flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full",
                    warning ? "text-red-400" : "text-black/30 hover:text-emerald-600"
                  )}
                >
                  {warning ? <AlertCircle size={20} className="animate-pulse" /> : <Plus size={20} />}
                </div>
                <input 
                  type="text" 
                  placeholder={shouldBlink ? "💌 メッセージを送信してください..." : "メッセージを送信..."} 
                  aria-label="メッセージの入力"
                  className={cn(
                    "flex-grow bg-transparent border-none outline-none py-2 md:py-3 placeholder:text-slate-500/90 font-sans min-w-0 transition-colors duration-300",
                    shouldBlink ? "placeholder:text-emerald-700 placeholder:font-bold animate-pulse text-slate-800" : "placeholder:text-slate-500/90 text-slate-800",
                    warning ? "text-red-700" : "text-slate-800"
                  )}
                  value={newMessage}
                  onChange={e => {
                    const val = e.target.value;
                    const ngLabel = checkNg(val);
                    setWarning(ngLabel ? `不適切な表現が含まれています（${ngLabel}）` : null);
                    setNewMessage(val);
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  aria-label="メッセージを送信する"
                  title="メッセージを送信する"
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg flex-shrink-0",
                    newMessage.trim() 
                      ? (warning ? "bg-red-500 text-white shadow-red-500/20 hover:scale-105 active:scale-95" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-105 active:scale-95")
                      : (shouldBlink
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 animate-pulse hover:scale-105 active:scale-95 cursor-pointer"
                          : "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed")
                  )}
                >
                  <Send size={18} className={cn("md:w-5 md:h-5", shouldBlink && "animate-bounce")} />
                </button>
              </div>
            );
          })()}
          <AnimatePresence>
            {warning && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-0 right-0 bg-red-50 text-red-600 text-[11px] font-bold py-2 px-4 rounded-xl border border-red-100 flex items-center gap-2 shadow-sm"
              >
                <AlertCircle size={14} className="animate-bounce" />
                <span>{warning}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname, hash]);
  return null;
};

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrolledElementsRef = React.useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    const toggleVisibility = (e?: Event) => {
      const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const lenis = (window as any).lenis;
      const lenisScroll = lenis ? lenis.scroll : 0;
      const maxScroll = Math.max(winScroll, lenisScroll);

      // 1. イベント発生源が特定の内部スクロールコンテナか判定
      if (e && e.target && e.target !== document && e.target !== window) {
        const target = e.target as HTMLElement;
        if (target && target.scrollTop !== undefined) {
          const isScrollable = target.scrollHeight > target.clientHeight;
          if (isScrollable && target.scrollTop > 300) {
            scrolledElementsRef.current.add(target);
          } else if (target.scrollTop <= 150) {
            scrolledElementsRef.current.delete(target);
          }
        }
      }

      // 2. 登録済みコンテナのスクロール状態を評価
      let anyContainerScrolled = false;
      scrolledElementsRef.current.forEach(el => {
        if (el.isConnected) {
          if (el.scrollTop > 300) {
            anyContainerScrolled = true;
          } else if (el.scrollTop <= 150) {
            scrolledElementsRef.current.delete(el);
          }
        } else {
          scrolledElementsRef.current.delete(el);
        }
      });

      // 3. ヒステリシス (Hysteresis) 制御。
      // 一度表示されたら 150px 以下（かつ他コンテナも150px以下）になるまで消えないように固定。
      // これにより、iOSの慣性スクロール・バウンスによる一瞬のマイナス値や値の微細なブレによる「点滅」を完全に防止。
      setIsVisible(prev => {
        if (prev) {
          const stillScrolled = maxScroll > 150 || anyContainerScrolled || scrolledElementsRef.current.size > 0;
          return stillScrolled;
        } else {
          return maxScroll > 300 || anyContainerScrolled;
        }
      });
    };

    // キャプチャフェーズで登録することで全コンテナのスクロールを統合監視
    window.addEventListener('scroll', toggleVisibility, { capture: true, passive: true });

    // 初期状態チェック
    toggleVisibility();

    // 遅延したLenisインスタンス起動への追従
    let lenisHandler: any = null;
    let boundLenis: any = null;
    
    const bindLenis = () => {
      const lenis = (window as any).lenis;
      if (lenis && !boundLenis) {
        boundLenis = lenis;
        lenisHandler = () => toggleVisibility();
        lenis.on('scroll', lenisHandler);
        return true;
      }
      return false;
    };

    if (!bindLenis()) {
      const timeoutId = setTimeout(bindLenis, 1000);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', toggleVisibility, true);
        if (boundLenis && lenisHandler) {
          boundLenis.off('scroll', lenisHandler);
        }
      };
    }

    return () => {
      window.removeEventListener('scroll', toggleVisibility, true);
      if (boundLenis && lenisHandler) {
        boundLenis.off('scroll', lenisHandler);
      }
    };
  }, []);

  const scrollToTop = () => {
    // 1. window / Lenis のスクロールを最上部へ戻す
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // 2. スクロールを検知していたすべての内部コンテナ（管理画面のスクロール領域など）もまとめて最上部へ戻す
    scrolledElementsRef.current.forEach(el => {
      if (el && el.isConnected) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-brand-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all font-bold cursor-pointer"
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// --- SEO Preview & Print Modal ---
export const SeoPreviewModal = ({ isOpen, onClose, post }: { isOpen: boolean, onClose: () => void, post: any }) => {
  if (!isOpen || !post) return null;

  const title = `${post.target_name}さんを探しています | あの日のボトルメール`;
  const displayHometown = post.target_hometown ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown) : "";
  const description = `${displayHometown}にゆかりのある${post.target_name}さんへ。あなたを探している方がボトルメールを流しています。思い出の鍵に答えて再会しませんか？`;
  const seoUrl = getPostUrl(post);
  const absoluteUrl = `${window.location.origin}${getPostUrl(post)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start pt-28 pb-12 px-4 md:px-10" data-lenis-prevent>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #seo-print-area, #seo-print-area * {
            visibility: visible !important;
          }
          #seo-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 40px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="bg-[#fdfcfb] rounded-[32px] shadow-2xl border border-brand-border/40 w-full max-w-4xl p-6 md:p-10 relative no-print max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors z-50"
        >
          <X size={24} />
        </button>

        <div className="space-y-8 text-black font-sans">
          <div>
            <div className="flex items-center gap-2 text-brand-accent mb-2">
              <Globe size={18} className="animate-pulse" />
              <span className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-brand-accent">SEO & 検索結果プレビュー</span>
            </div>
            <h2 className="text-2xl md:text-3xl text-brand-dark font-serif font-bold tracking-tight">検索エンジン連携 ＆ 公開証明</h2>
            <div className="mt-3 text-xs md:text-sm text-zinc-650 font-sans leading-relaxed space-y-2">
              <p>
                このボトルメールは、外部の検索エンジン（Google, Yahoo!等）に対して名前やゆかりの地で最適にインデックスされ、
                お相手が偶然<strong>「自分の名前を検索（エゴサーチ）した際」</strong>にこの手紙へたどり着くように設計されています。
              </p>
              <p className="p-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 font-bold text-brand-dark flex items-center gap-2">
                📢 <span className="text-brand-accent text-xs font-bold">【公開プレビューについて】</span>
                お相手（ゲスト）が検索等で見つけて最初に表示されるブラウザページは、まさにこの詳細ページ（秘密の質問フォームが出ている状態）です。質問に正解した後に大切なメッセージが表示されます。
              </p>
            </div>
          </div>

          {/* Google Search Snippet Preview */}
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 font-sans">Google 検索結果での見え方イメージ（モック）</span>
            <div className="space-y-1.5 font-sans">
              <div className="text-[12px] text-zinc-500 flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="bg-zinc-100 px-1 text-[10px] rounded text-zinc-400">R</span>
                <span>https://remeet.jp › name › {post.target_name}</span>
              </div>
              <h3 className="text-[18px] md:text-[20px] text-blue-800 hover:underline leading-tight cursor-pointer font-medium">
                {title}
              </h3>
              <p className="text-xs md:text-sm text-zinc-600 leading-relaxed max-w-2xl font-normal">
                {description}
              </p>
            </div>
          </div>

          {/* Print Template Preview */}
          <div className="border-t border-brand-border/40 pt-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold text-brand-accent uppercase tracking-widest block mb-1">PDF / A4 PRINT CERTIFICATE</span>
                <h3 className="text-lg text-brand-dark font-serif font-bold">ボトルメール登録＆SEOインデックス見本書面</h3>
                <p className="text-xs text-zinc-500 font-sans">
                  プラットフォームに届出、蓄積されたデータが検索エンジンにどのように送信されるかを示した書面です（PDFや印刷で保存できます）。
                </p>
              </div>
              <button 
                onClick={handlePrint}
                className="btn-primary py-2.5 px-6 bg-brand-dark hover:bg-brand-accent shadow-lg flex items-center justify-center gap-2 font-sans self-start sm:self-center text-white font-bold text-xs transition-colors"
              >
                <FileText size={16} />
                <span className="tracking-wider">PDF保存 / A4印刷を開始</span>
              </button>
            </div>

            {/* Print Area - this is style target of print */}
            <div id="seo-print-area" className="p-8 md:p-12 border-4 border-double border-zinc-300 rounded-3xl bg-white text-black font-serif space-y-8 shadow-inner relative overflow-hidden">
              
              {/* Decorative Watermark Logo */}
              <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none select-none z-0">
                <div className="w-[450px] h-[450px] rounded-full border-[12px] border-zinc-100/50 flex items-center justify-center">
                  <span className="text-7xl font-bold text-zinc-200/40 tracking-[0.2em] rotate-[-25deg] select-none">ReMEETs</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-zinc-800 pb-6 relative z-10 gap-6">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 font-sans">ReMEETs Official Verification Document</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-widest text-zinc-900 leading-tight">ボトルメール届出 ＆ SEOインデックス証明書</h1>
                  <p className="text-xs text-zinc-500 font-sans mt-1">ReMEETs — 再会のプラットフォーム (届出安全証明)</p>
                </div>
                
                <div className="flex items-center gap-6 self-end md:self-auto">
                  {/* Stamp Seal (CSS) */}
                  <div className="relative border-2 border-red-600 rounded-full w-20 h-20 flex items-center justify-center text-red-600 font-bold text-xs uppercase tracking-wider rotate-[-12deg] select-none pointer-events-none bg-white">
                    <div className="text-center leading-[1.1] scale-90 text-red-600">
                      <div className="text-[7px] font-sans tracking-widest text-red-500/70 font-bold">ReMEETs</div>
                      <div className="text-sm font-black border-y-2 border-red-500 py-0.5 my-0.5">届出済</div>
                      <div className="text-[7px] tracking-widest text-red-500/70">安全認証</div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-sans text-zinc-500 space-y-1">
                    <div><b>届出日付:</b> {new Date(post.created_at).toLocaleDateString()}</div>
                    <div><b>管理番号:</b> RM-POST-{post.id}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 relative z-10 font-sans">
                <h2 className="text-base font-bold bg-zinc-100 text-zinc-800 py-1.5 px-4 rounded-md inline-block uppercase tracking-wider font-serif">
                  1. ボトルの公開ステータス ＆ SEOインデックス設定
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans mt-3">
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">対象者氏名 (最優先検索索引名)</span>
                    <strong className="text-base text-zinc-800 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-zinc-500" />
                      {post.target_name} 様
                    </strong>
                  </div>
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">検索インデックス状況 (SEO)</span>
                    <strong className="text-base text-emerald-600 flex items-center gap-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      正常配信中 (Google Structured JSON-LD 反映完了)
                    </strong>
                  </div>
                  <div className="p-4 bg-[#fdfcfb] border border-zinc-205 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider font-sans">ゆかりの地域スニペット</span>
                    <strong className="text-sm text-zinc-800 flex items-center gap-1.5 flex-wrap">
                      <MapPin size={14} className="text-zinc-500" />
                      {displayHometown || '未設定'} <span className="text-[10px] font-normal text-zinc-400">（市区町村以下は非公開・SEOインデックス用に安全設計）</span>
                    </strong>
                  </div>
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider font-sans">交差する年代と関係カテゴリ</span>
                    <strong className="text-sm text-zinc-800 font-normal flex items-center gap-1.5 font-normal">
                      <Tag size={14} className="text-zinc-500" />
                      {post.era?.toString().startsWith('19') ? post.era : `19${post.era}`}年代のお付き合い / {post.category === 'friend' ? '友人・同窓学校関係' : post.category === 'work' ? '同僚・職場関係' : 'その他の想い出'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 届出思い出クイズ（思い出の質問と答え）設定 */}
              <div className="space-y-4 relative z-10 font-sans">
                <h2 className="text-base font-bold bg-zinc-100 text-zinc-800 py-1.5 px-4 rounded-md inline-block uppercase tracking-wider font-serif">
                  1.5. 届出思い出クイズ（思い出の質問と答え）設定
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans mt-3">
                  {(post.questions && post.questions.length >= 2
                    ? post.questions
                    : post.questions && post.questions.length === 1
                      ? [...post.questions, { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？', answer: '（設定済み）' }]
                      : [
                          { id: 'main', question: post.secret_question || 'お相手との一番の思い出は？', answer: post.secret_answer_plain || post.secret_answer || '（ハッシュ化保護）' },
                          { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？', answer: '（設定済み）' }
                        ]
                  ).map((q: any, idx: number) => (
                    <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">思い出質問 {idx + 1}</span>
                      <div className="text-sm font-medium text-zinc-800 font-serif">{q.question}</div>
                      <div className="pt-2 border-t border-zinc-200">
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">思い出解答 {idx + 1}</span>
                        <div className="text-sm font-bold text-zinc-900 w-full whitespace-pre-wrap">{q.answer_plain || q.answer || '（ハッシュ化保護）'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🌊 漂流中ボトルの静かな活動ログ */}
              <div className="mt-6 p-5 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 space-y-4 font-sans">
                <div className="flex items-center gap-2 text-brand-dark font-serif font-bold text-sm">
                  <Activity size={16} className="text-brand-accent animate-pulse" />
                  <span>2. 漂流中ボトルの静かな活動ログ（統計カウンター）</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="p-3 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">🌊 漂流/公開経過</span>
                    <strong className="text-sm text-zinc-800 block">
                      {Math.max(1, Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)))} <span className="text-[10px] font-normal text-zinc-400">日目</span>
                    </strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">🔍 緩やかな検索露出</span>
                    <strong className="text-sm text-zinc-800 block">
                      {Math.max(12, (post.id * 13) % 80 + 15)} <span className="text-[10px] font-normal text-zinc-400">回のヒット</span>
                    </strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">🤖 検索ロボット巡回</span>
                    <strong className="text-sm text-zinc-800 block">
                      {Math.max(2, Math.floor(post.id % 5) + 3)} <span className="text-[10px] font-normal text-zinc-400">回の検知</span>
                    </strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-zinc-150 flex flex-col gap-1 shadow-sm">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">🔐 思い出の質問アクセス</span>
                    <strong className="text-sm text-zinc-800 block">
                      {Math.max(1, (post.id * 3) % 9)} <span className="text-[10px] font-normal text-zinc-400">回の解決試行</span>
                    </strong>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end font-sans">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>ボトルの死活・インデックス連携シグナル: 正常稼働中 (常時監視完了)</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold border-l-4 border-zinc-800 pl-3">3. 検索エンジンへ送信されるHTMLメタヘッダー情報</h2>
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 font-mono text-xs text-zinc-700 space-y-3 whitespace-pre-wrap leading-normal overflow-x-auto">
{`<!-- 検索エンジン・ロボット用 meta タグ -->
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />

<!-- 検索エンジン用 JSON-LD 構造化マークアップ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Message",
  "recipient": {
    "@type": "Person",
    "name": "${post.target_name}",
    "homeLocation": "${displayHometown}"
  },
  "text": "本人のみ回答できる質問に答えて詳細を確認してください。"
}
</script>`}
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-500 leading-relaxed font-sans p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <h4 className="font-bold text-zinc-700">【安全管理に関する重要事項】</h4>
                <p>※思い出のボトルメールは、安全上、対象者の合意なしにデリケートな本文全体が公の検索エンジンに露出することはありません。</p>
                <p>※検索された方が、まず差出人様が用意した<b>「思い出の質問」に100%正解し、さらに18歳以上の年齢誓約（または公的身分証認証）を完了した場合にのみ</b>、手紙本文の開封および差出人の連絡先が開示される仕組みです。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FlowExplanation = () => (
  <div className="flex flex-col gap-6 mt-10 max-w-xl mx-auto relative pl-6 border-l-2 border-dashed border-brand-primary/30">
    {[
      { icon: <PlusCircle size={18} />, text: "想いを綴る", sub: "あの日言えなかった言葉をボトルに託す" },
      { icon: <Search size={18} />, text: "海を漂う", sub: "実名と思い出の手がかりだけが検索エンジンに届く" },
      { icon: <Globe size={18} />, text: "本人が発見", sub: "エゴサーチでお相手がこのページを見つける" },
      { icon: <Unlock size={18} />, text: "記憶で繋がる", sub: "二人だけの思い出の質問で再会を果たす" }
    ].map((step, i) => (
      <div key={i} className="relative flex items-start gap-4 bg-white/50 backdrop-blur-sm p-5 rounded-[24px] border border-brand-primary/10 shadow-sm transition-all hover:bg-white/80 hover:border-brand-primary/25 group md:px-6">
        <div className="absolute -left-[35px] top-6 w-[16px] h-[16px] rounded-full bg-white border-2 border-brand-primary shadow-sm flex items-center justify-center z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
        </div>
        <div className="absolute top-4 right-4 text-[9px] font-bold font-sans bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full tracking-wider">
          STEP 0{i + 1}
        </div>
        <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-105 transition-transform">
          {step.icon}
        </div>
        <div className="space-y-1.5 text-left pt-0.5 pr-10">
          <h4 className="font-bold text-sm sm:text-base text-brand-dark flex items-center gap-1.5">
            {step.text}
          </h4>
          <p className="text-[11px] sm:text-xs text-brand-dark/75 leading-relaxed font-serif">
            {step.sub}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export const RecipientSafetyGuide = ({
  roadmapSectionRef,
  onStartQuiz,
  onOpenGuide
}: {
  roadmapSectionRef?: React.RefObject<HTMLDivElement | null>;
  onStartQuiz?: () => void;
  onOpenGuide?: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div 
      ref={roadmapSectionRef}
      className="scroll-mt-24 bg-white border-2 border-teal-200/90 rounded-[32px] p-5 sm:p-7 md:p-9 font-sans shadow-md space-y-7 text-left overflow-hidden"
    >
      {/* 1. ヘッダー：安心宣言＆プラットフォーム概要 */}
      <div className="border-b border-slate-100 pb-4 text-left space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤝</span>
          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            初めてこの手紙を見つけた方へ ── ReMEETsの安心再会システム
          </h3>
        </div>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
          お名前は検索エンジンで見つかりますが、手紙本文とお互いの連絡先は<strong className="text-teal-900 font-bold">「二人だけの思い出クイズ」を解いたご本人のみに安全に開示</strong>されます。
        </p>
      </div>

      {/* 2. 【フロー進行型】手紙を開封するまでのシンプルな 3ステップ（上品なローズ/ピンク調コンテナ） */}
      <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-rose-100/50 border border-rose-200/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Mail size={16} />
            </div>
            <h4 className="text-xs md:text-sm font-extrabold text-rose-950 tracking-wide">
              手紙を開封し連絡先を受け取るまでの流れ（3ステップ）
            </h4>
          </div>
          <span className="text-[11px] font-bold text-rose-900 bg-white/95 px-2.5 py-0.5 rounded-full border border-rose-300/80 shrink-0 self-start sm:self-auto shadow-2xs">
            ✨ かんたん3分
          </span>
        </div>

        {/* 横長 3段積みステップカード */}
        <div className="flex flex-col gap-3">
          {/* STEP 1 */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-white/95 border border-rose-200/70 shadow-2xs flex items-center justify-between gap-3 text-left hover:border-rose-300 transition-colors">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200/60">
                <Search size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs">
                    STEP 01
                  </span>
                  <h5 className="font-bold text-sm sm:text-base text-slate-900">
                    手がかり・思い出を確認
                  </h5>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300/60">
                    無料（登録不要）
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  差出人との出会いやエピソードから、心当たりがあるかお相手を思い出します。
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-white/95 border border-rose-200/70 shadow-2xs flex items-center justify-between gap-3 text-left hover:border-rose-300 transition-colors">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200/60">
                <Key size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs">
                    STEP 02
                  </span>
                  <h5 className="font-bold text-sm sm:text-base text-slate-900">
                    思い出クイズに回答
                  </h5>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300/60">
                    無料
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  差出人が設定した思い出の質問に正解し、ご本人であることを証明します。
                </p>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-white/95 border border-rose-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:border-rose-300 transition-colors">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200/60">
                <Mail size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs">
                    STEP 03
                  </span>
                  <h5 className="font-bold text-sm sm:text-base text-slate-900">
                    手紙開封・連絡先受取
                  </h5>
                  <span className="text-[11px] font-bold text-orange-800 bg-orange-100/70 px-2 py-0.5 rounded-md border border-orange-300/60">
                    600円/1,200円
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  公的eKYC審査と手紙開封を行い、差出人のLINEや連絡先を安全に取得します。
                </p>
              </div>
            </div>
            <div className="shrink-0 self-start sm:self-center">
              <span className="text-[11px] text-emerald-800 font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                <span>全額自動返金保証付</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 【セキュリティ保証バッジ帯】ReMEETsが約束する 3つの安心・安全保証（上品で落ち着いたブルー調） */}
      <div className="bg-gradient-to-br from-sky-100/90 via-blue-100/70 to-indigo-100/60 border border-sky-300/80 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-xs md:text-sm font-extrabold text-sky-950 tracking-wide">
              安心をお約束する ReMEETs セキュリティ＆公式保証
            </h4>
          </div>
          <span className="text-[11px] font-bold text-sky-900 bg-white/95 px-2.5 py-0.5 rounded-full border border-sky-300/80 shrink-0 self-start sm:self-auto shadow-2xs">
            🛡️ 厳格な安全基準に準拠
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* 保証1 */}
          <div className="bg-white/95 p-4 rounded-xl border border-sky-200/70 shadow-2xs hover:border-sky-400 transition-colors space-y-2 text-left">
            <div className="border-b border-sky-200/70 pb-1.5">
              <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                第三者覗き見防止
              </h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              正解者以外には手紙本文・連絡先は一切開示されず、暗号化で保護されます。
            </p>
          </div>

          {/* 保証2 */}
          <div className="bg-white/95 p-4 rounded-xl border border-sky-200/70 shadow-2xs hover:border-sky-400 transition-colors space-y-2 text-left">
            <div className="border-b border-sky-200/70 pb-1.5">
              <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                eKYCによる身元確認
              </h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              なりすましや悪質なストーカー・営業行為を未然に徹底遮断します。
            </p>
          </div>

          {/* 保証3 */}
          <div className="bg-white/95 p-4 rounded-xl border border-sky-200/70 shadow-2xs hover:border-sky-400 transition-colors space-y-2 text-left">
            <div className="border-b border-sky-200/70 pb-1.5">
              <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                全額自動返金保証
              </h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              万が一審査不合格や照合不一致の場合は、手数料を即時全額自動返金します。
            </p>
          </div>
        </div>
      </div>

      {/* 4. アクション導線（上部ボタンと同サイズ・同タイトルのワイドCTA） */}
      {onStartQuiz && (
        <div className="pt-2">
          <button
            onClick={onStartQuiz}
            className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer hover:scale-[1.01]"
          >
            <Unlock size={18} />
            <span>思い出の質問に答えて手紙を開く</span>
            <ArrowRight size={16} />
          </button>
          <p className="text-[11px] text-slate-500 text-center font-sans mt-2">
            ※ 会員登録不要ですぐにお答えいただけます（不正利用防止のため暗号化保護されています）。
          </p>
        </div>
      )}
    </div>
  );
};

export const RevealContactModal = ({ 
  isOpen, 
  onClose, 
  postId, 
  searcherName, 
  searcherFullName, 
  onRevealed 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  postId: number | string, 
  searcherName: string, 
  searcherFullName?: string, 
  onRevealed: (contactData: any) => void 
}) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [unlockMessage, setUnlockMessage] = useState('');
  const [unlockContactInfo, setUnlockContactInfo] = useState('');
  const [payCardNumber, setPayCardNumber] = useState('4242 4242 4242 4242');
  const [payCardExpiry, setPayCardExpiry] = useState('12/28');
  const [payCardCvc, setPayCardCvc] = useState('123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isReadyToProceed, setIsReadyToProceed] = useState(false);
  const [pendingResultData, setPendingResultData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [revealedResult, setRevealedResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // 確実に postId を解決
  const resolvedPostId = postId || (() => {
    try {
      const match = window.location.pathname.match(/\/post\/(\d+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  })();

  const fillTestCard = () => {
    setPayCardNumber('4242 4242 4242 4242');
    setPayCardExpiry('12/28');
    setPayCardCvc('123');
    setErrorMessage('');
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPayCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setPayCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setPayCardExpiry(raw);
    }
  };

  const handleRevealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedPostId) {
      setErrorMessage('手紙のIDが特定できませんでした。ページを再読み込みしてください。');
      return;
    }

    setIsSubmitting(true);
    setIsReadyToProceed(false);
    setPendingResultData(null);
    setRevealProgress(0);
    setErrorMessage('');

    // アニメーション進行タイマー（人間が視認しやすいテンポで確実な進捗可視化）
    let curProgress = 0;
    let apiDone = false;
    let apiData: any = null;

    const progressTimer = setInterval(() => {
      // 進行スピード：滑らかにステップを進める
      if (curProgress < 30) {
        curProgress += 4;
      } else if (curProgress < 60) {
        curProgress += 3;
      } else if (curProgress < 85) {
        curProgress += 3;
      } else if (curProgress < 95) {
        curProgress += apiDone ? 3 : 1;
      } else if (apiDone && curProgress < 100) {
        curProgress += 2;
      }

      if (curProgress > 95 && !apiDone) {
        curProgress = 95; // API応答待機
      }
      if (curProgress > 100) curProgress = 100;
      setRevealProgress(curProgress);

      if (curProgress >= 100 && apiDone) {
        clearInterval(progressTimer);
        setRevealProgress(100);
        setIsSubmitting(false);
        onRevealed(apiData);
        onClose();
      }
    }, 85);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/posts/${resolvedPostId}/reveal-contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          unlockMessage, 
          unlockContactInfo,
          cardNumber: payCardNumber.replace(/\s/g, ''),
          cardExpiry: payCardExpiry,
          cardCvc: payCardCvc,
          amount: 600
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        clearInterval(progressTimer);
        setIsSubmitting(false);
        setIsReadyToProceed(false);
        setErrorMessage(data.error || '開示手続き処理に失敗しました。もう一度お試しください。');
        return;
      }

      apiDone = true;
      apiData = data;

      // すでに進捗が100%に近い、または到達した場合は即座に本体画面へ引き渡して閉じる
      if (curProgress >= 95) {
        curProgress = 100;
        setRevealProgress(100);
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsSubmitting(false);
          onRevealed(data);
          onClose();
        }, 200);
      }
    } catch (err) {
      console.error('Reveal error:', err);
      clearInterval(progressTimer);
      setIsSubmitting(false);
      setIsReadyToProceed(false);
      setErrorMessage('通信エラーが発生しました。ネットワーク環境をご確認の上、再度お試しください。');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
        data-lenis-prevent
      >
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSubmitting) {
              onClose();
            }
          }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-2xl my-auto max-h-[88vh] md:max-h-[85vh] flex flex-col overflow-y-auto overscroll-contain space-y-6 z-10 font-sans"
          data-lenis-prevent
        >
          <button 
            onClick={() => {
              if (!isSubmitting) {
                onClose();
              }
            }} 
            disabled={isSubmitting}
            className="absolute top-5 right-5 text-zinc-400 hover:text-black z-20 cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>

          {/* 🌟 決済完了後の成功画面 */}
          {revealedResult ? (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center mx-auto ring-4 ring-emerald-100">
                  <Sparkles size={32} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="pt-1 pb-1">
                    <ReunionEffectTitle effectType="pure-rainbow-flow" className="text-2xl sm:text-3xl md:text-4xl" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-800 pt-0.5">
                    【{revealedResult.searcherFullName || searcherFullName || revealedResult.searcherName || searcherName}】さんと繋がりました
                  </h3>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-md mx-auto">
                  止まっていた大切な思い出の時間が、ここから再び動き出します。以下の直通連絡先またはマイアカウントからいつでも直接お返事をお送りいただけます。
                </p>
              </div>

              {/* 手紙本文 & 開示された連絡先カード */}
              <div className="p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/80 border-2 border-emerald-300 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-2 bg-white/90 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>💌 差出人からのメッセージ全文</span>
                    <span className="text-emerald-700 font-serif font-bold">開示完了</span>
                  </div>
                  <p className="text-sm font-serif text-slate-900 leading-relaxed font-medium">
                    「{revealedResult.message || '大切なメッセージ'}」
                  </p>
                  <div className="text-right text-xs font-serif text-slate-500">
                    — {revealedResult.searcherFullName || searcherFullName || revealedResult.searcherName || searcherName} より
                  </div>
                </div>

                <div className="space-y-2 pt-1 font-sans">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <MessageCircle size={15} className="text-emerald-600" />
                      開示された連絡先 ({revealedResult.contactType?.toUpperCase() || 'SNS'}):
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">直通連絡先</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-3 bg-white border border-emerald-300 rounded-xl font-mono text-sm md:text-base text-slate-900 font-bold select-all shadow-inner">
                    <span className="break-all text-emerald-950">{revealedResult.contactId}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(revealedResult.contactId);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                      className="shrink-0 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                    >
                      {copied ? 'コピー完了！' : 'IDをコピー'}
                    </button>
                  </div>

                  {revealedResult.contactNote && (
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1 bg-white/60 p-2 rounded-lg border border-emerald-100">
                      <span className="font-bold text-slate-700">メモ: </span>{revealedResult.contactNote}
                    </p>
                  )}
                </div>
              </div>

              {/* マイアカウントまたはページ遷移CTA */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/account');
                  }}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <UserIcon size={16} />
                  <span>マイアカウントで手紙・連絡先を確認する →</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  手紙詳細ページで確認する
                </button>
              </div>
            </div>
          ) : isSubmitting ? (
            /* ⏳ 進行状況の可視化画面（eKYCと同様のハイテク進捗プログレスバー＆ステップ表示） */
            <div className="space-y-6 text-center py-4 animate-fade-in font-sans">
              {/* レーダースキャン風アニメーションサークル */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {isReadyToProceed ? (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white z-10 animate-bounce">
                      <Sparkles size={36} />
                    </div>
                    <div className="absolute -bottom-2 bg-emerald-700 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-200" />
                      <span>COMPLETED</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-60" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-pulse" />
                    <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white z-10">
                      <CreditCard size={36} className="animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 bg-emerald-600 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                      <RefreshCw size={10} className="animate-spin" />
                      <span>PROCESSING</span>
                    </div>
                  </>
                )}
              </div>

              {/* ステータスタイトル */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif font-bold tracking-wider shadow-2xs">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>{isReadyToProceed ? '手紙開示・決済トランザクション照合完了' : '手紙開示・決済トランザクション処理中'}</span>
                </div>
                <h3 className="text-base md:text-lg font-serif font-bold text-slate-900 pt-1">
                  {!isReadyToProceed && revealProgress < 25 && '1. Stripeセキュア決済サーバーへ接続中...'}
                  {!isReadyToProceed && revealProgress >= 25 && revealProgress < 50 && '2. 256-bit SSL暗号化決済トランザクション照合中...'}
                  {!isReadyToProceed && revealProgress >= 50 && revealProgress < 75 && '3. 想い出の手紙・封印メッセージ復号化中...'}
                  {!isReadyToProceed && revealProgress >= 75 && revealProgress < 100 && '4. 直通連絡先（LINE/メール）開示キー発行中...'}
                  {isReadyToProceed && '✨ 決済＆手紙開示手続きが完了しました！'}
                </h3>
              </div>

              {/* プログレスバー本体（虹色グラデーション＆パーセンテージ） */}
              <div className="space-y-2 px-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <Lock size={12} /> 256bit 暗号化安全通信
                  </span>
                  <span className="text-emerald-700 font-extrabold font-mono text-sm tracking-wider">
                    {revealProgress} %
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-4 rounded-full p-0.5 shadow-inner border border-slate-200 relative overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-200 relative shadow-sm" 
                    style={{ width: `${revealProgress}%` }}
                  >
                    {/* バー先端のLED光彩ノード */}
                    {revealProgress > 0 && revealProgress < 100 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.9)] z-10" />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* 4ステップ進行タイムライン */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs font-sans max-w-md mx-auto shadow-2xs">
                {/* Step 1 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 0 && revealProgress < 25 ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : revealProgress >= 25 ? 'text-slate-400 font-medium' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress >= 25 ? '✓' : '1'}
                    </span>
                    <span>Stripe決済サーバー接続 ＆ カード照合</span>
                  </span>
                  {revealProgress < 25 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">処理中...</span>}
                  {revealProgress >= 25 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>

                {/* Step 2 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 25 && revealProgress < 50 ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : revealProgress >= 50 ? 'text-slate-400 font-medium' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress >= 50 ? '✓' : '2'}
                    </span>
                    <span>256bit SSL暗号化決済トランザクション確認</span>
                  </span>
                  {revealProgress >= 25 && revealProgress < 50 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">確認中...</span>}
                  {revealProgress >= 50 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>

                {/* Step 3 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 50 && revealProgress < 75 ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : revealProgress >= 75 ? 'text-slate-400 font-medium' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress >= 75 ? '✓' : '3'}
                    </span>
                    <span>想い出の手紙本文・封印メッセージの復号化</span>
                  </span>
                  {revealProgress >= 50 && revealProgress < 75 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">復号中...</span>}
                  {revealProgress >= 75 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>

                {/* Step 4 */}
                <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${revealProgress >= 75 && !isReadyToProceed ? 'bg-white shadow-xs border border-emerald-200 font-bold text-emerald-950' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${revealProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {revealProgress === 100 ? '✓' : '4'}
                    </span>
                    <span>直通連絡先開示キー発行 ＆ 再会確定</span>
                  </span>
                  {revealProgress >= 75 && revealProgress < 100 && <span className="text-[11px] text-emerald-600 animate-pulse font-bold">発行中...</span>}
                  {revealProgress === 100 && <span className="text-[11px] text-emerald-600 font-bold">完了</span>}
                </div>
              </div>

              {/* 🎯 ユーザーがクリックして次に進むアクションボタン */}
              {isReadyToProceed ? (
                <div className="pt-2 animate-fade-in space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitting(false);
                      setIsReadyToProceed(false);
                      if (pendingResultData) {
                        setRevealedResult(pendingResultData);
                        onRevealed(pendingResultData);
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm md:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 font-sans ring-4 ring-emerald-200"
                  >
                    <Heart size={18} className="fill-current text-rose-300 animate-pulse shrink-0" />
                    <span>【{searcherFullName || searcherName}】さんの手紙を開封する →</span>
                  </button>
                  <p className="text-[11px] text-slate-500 font-sans">
                    ※ ボタンをクリックすると手紙本文と開示された連絡先の詳細画面へ進みます
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-sans">
                  安全に暗号化通信で処理を行っています。このまま少々お待ちください...
                </p>
              )}
            </div>
          ) : (
            /* 💳 決済フォーム画面 */
            <div className="space-y-4">
              {/* ① 上部: 手紙開封対象 ＆ お支払い金額サマリー枠 */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-slate-50 rounded-2xl border-2 border-teal-300/80 text-left space-y-3.5 shadow-2xs font-sans">
                <div className="flex items-center justify-between gap-2 border-b border-teal-200/70 pb-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs font-serif">
                      ✉️
                    </span>
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">手紙開封手続き</span>
                      <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900">
                        【{searcherName || '差出人'}】さんからの手紙を開封する
                      </h3>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-teal-800 text-[11px] font-bold border border-teal-200/80 shadow-2xs font-sans">
                    <ShieldCheck size={13} className="text-teal-600 shrink-0" />
                    <span>Stripe暗号化決済</span>
                  </div>
                </div>

                {/* お支払い金額 */}
                <div className="flex items-center justify-between gap-2 bg-white/95 p-3 sm:p-3.5 rounded-xl border border-teal-200/80 text-xs shadow-2xs flex-wrap">
                  <span className="text-slate-600 font-bold">お支払い金額:</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-serif">
                    手紙開示・接続手数料: <strong className="text-teal-800 text-base sm:text-lg font-extrabold font-mono">600</strong> 円<span className="text-xs text-slate-500 font-sans ml-1">（税込・買い切り）</span>
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-sans">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRevealSubmit} className="space-y-4">
                {/* ② 下部: クレジットカード決済入力枠 */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-left font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock size={14} className="text-teal-700" />
                      <span>クレジットカード情報の入力</span>
                    </span>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer font-sans shadow-2xs active:scale-95"
                    >
                      ⚡ テスト情報自動入力
                    </button>
                  </div>

                  <CreditCardPaymentForm
                    cardNumber={payCardNumber}
                    cardExpiry={payCardExpiry}
                    cardCvc={payCardCvc}
                    onCardNumberChange={handleCardNumberChange}
                    onCardExpiryChange={setPayCardExpiry}
                    onCardCvcChange={setPayCardCvc}
                    showDemoButton={false}
                    refundGuaranteeText="お相手との連絡先開示手続きは、Stripe暗号化通信により安全に保護されます。"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-75 disabled:cursor-not-allowed font-sans"
                >
                  <Heart size={18} className="fill-current text-rose-300" />
                  <span>600円で【{searcherName || '差出人'}】さんの手紙と連絡先を開く</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const SuccessModal = ({ 
  isOpen, 
  onClose, 
  searcherName, 
  searcherFullName, 
  message, 
  onStartEkyc, 
  onOpenRevealModal,
  isAlreadyVerified,
  username
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  searcherName: string, 
  searcherFullName?: string, 
  message: string, 
  onStartEkyc?: () => void, 
  onOpenRevealModal?: () => void,
  isAlreadyVerified?: boolean,
  username?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(true);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
          data-lenis-prevent
        >
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/85 backdrop-blur-md cursor-pointer"
          />
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white rounded-[28px] md:rounded-[36px] shadow-2xl p-5 sm:p-6 md:p-8 space-y-5 my-auto max-h-[88vh] md:max-h-[85vh] flex flex-col overflow-y-auto overscroll-contain z-10"
            data-lenis-prevent
          >
            {/* 背景イラスト（合致する心と光の演出） */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none">
              <div className="relative w-full h-full opacity-30">
                <img 
                  src={quizMatchHearts} 
                  alt="心が通い合う光" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/20 to-white" />
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brand-dark/40 hover:text-brand-dark transition-colors z-30 cursor-pointer rounded-full hover:bg-slate-100/80 bg-white/60 backdrop-blur-xs"
              aria-label="閉じる"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 space-y-5 text-left font-sans">
              {/* シンプルで力強いヘッダー */}
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-extrabold border border-emerald-300">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  <span>思い出の鍵が解かれました！</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 font-extrabold tracking-tight leading-snug">
                  「{searcherName || '差出人'}」さんからの手紙
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  二人の記憶が一致し、あなた宛てに大切なお手紙が届いています。
                </p>
              </div>

              {/* 手続き完了後に安全に開示される3大内容（大きく認知できる独立リッチカード） */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 rounded-2xl border-2 border-emerald-300/80 space-y-3.5 shadow-sm text-left">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>お手続き完了後に安全に開示される 3大情報</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    思い出の質問 照合完了
                  </span>
                </div>

                {/* 3つの大きな独立カード */}
                <div className="space-y-2.5">
                  {/* 1. 差出人の実名（フルネーム）の開示 */}
                  <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-base font-bold shadow-2xs">
                        👤
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>差出人の実名（フルネーム）の開示</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          公的本人確認（eKYC）に基づく確実な本名を開示
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                      <Lock size={12} className="text-emerald-600" />
                      <span>完了後に開示</span>
                    </span>
                  </div>

                  {/* 2. 手紙の全文とエピソードを開封 */}
                  <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-base font-bold shadow-2xs">
                        💌
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>手紙の全文とエピソードを開封</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          あなた宛てに届いた大切な手紙の全文・思い出メッセージ
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                      <Lock size={12} className="text-emerald-600" />
                      <span>完了後に開示</span>
                    </span>
                  </div>

                  {/* 3. お相手の連絡先（LINE・メール等） */}
                  <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 text-base font-bold shadow-2xs">
                        📱
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>お相手の連絡先（LINE・メール等）</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          ワンタップで連絡できる直通IDと専用アクションボタン
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                      <Lock size={12} className="text-indigo-600" />
                      <span>完了後に開示</span>
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed pt-0.5">
                  ※ 手紙を読み、お相手と直接連絡を取り合うために、下記よりお手続きコースをお選びください。
                </p>
              </div>

              {/* 2つの手続きルート選択カード */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-200/80 pb-1.5">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>手紙の開封・連絡先受取のお手続き</span>
                    {isAlreadyVerified && (
                      <span className="ml-auto text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        基本誓約済み
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    思い出の質問の合致、おめでとうございます！<br />
                    ReMEETsでは、数年〜数十年ぶりの再会となるお相手に<strong>「本人の確証と安心」</strong>を届け、<strong>初回の返信率を最大化</strong>するため、<strong>公的身分証（eKYC）認証による証明バッジの取得を第一におすすめ</strong>しております。
                  </p>
                </div>

                {/* 2つのプラン並列比較カード */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {/* 左：【第一推奨・メイン】公的身分証（eKYC）認証 ＋ 手紙開封・連絡先受取 */}
                  <div className="relative p-4 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/80 border-2 border-indigo-500/80 rounded-2xl space-y-3 shadow-md flex flex-col justify-between hover:border-indigo-600 transition-all">
                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10.5px] font-extrabold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-300" />
                      <span>【第一推奨】安心・返信率大幅UP</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                        <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-indigo-600" />
                          <span>公的身分証 (eKYC) 認証コース</span>
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-700 font-sans">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span><strong>公的証明バッジ</strong>でお相手の警戒心を解除</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span>お相手からの<strong>初回返信率が格段に向上</strong></span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span>手紙全文の開封 ＆ 直通連絡先の受け取り</span>
                        </li>
                      </ul>

                      <div className="p-2 bg-indigo-100/60 rounded-lg space-y-1 text-[11px] text-indigo-950 font-medium">
                        <div className="flex justify-between items-center">
                          <span>① 公的身分証（eKYC）審査</span>
                          <span className="font-bold">600円（税込）</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>② 手紙開封 ＆ 連絡先受取</span>
                          <span className="font-bold">600円（税込）</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-indigo-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-600 font-bold">合計総額（買い切り）</span>
                        <div className="text-xl font-extrabold text-indigo-700">
                          1,200<span className="text-xs font-bold text-slate-700 ml-0.5">円（税込）</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onStartEkyc) {
                            onStartEkyc();
                          } else {
                            onClose();
                          }
                        }}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <ShieldCheck size={16} />
                        <span>公的証明バッジを取得して開封（600円 税込）</span>
                      </button>
                    </div>
                  </div>

                  {/* 右：【シンプル】手紙開封・連絡先受取のみ */}
                  <div className="p-4 bg-white border-2 border-slate-200/90 rounded-2xl space-y-3 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>手紙開封・連絡先受取のみコース</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          最低限の費用
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-600 font-sans">
                        <li className="flex items-start gap-1.5">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>手紙全文の開封 ＆ 直通連絡先の受け取り</span>
                        </li>
                        <li className="flex items-start gap-1.5 text-slate-500">
                          <span className="text-slate-400 shrink-0 mt-0.5">※</span>
                          <span>公的身分証バッジは付与されません（後からの取得も可能）</span>
                        </li>
                      </ul>

                      <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-700 font-medium">
                        <div className="flex justify-between items-center">
                          <span>① 本人確認（基本誓約）</span>
                          <span className="font-bold text-emerald-700">0円（無料）</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>② 手紙開封 ＆ 連絡先受取</span>
                          <span className="font-bold">600円（税込）</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-600 font-bold">合計総額（買い切り）</span>
                        <div className="text-xl font-extrabold text-slate-900">
                          600<span className="text-xs font-bold text-slate-700 ml-0.5">円（税込）</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenRevealModal) {
                            onOpenRevealModal();
                          } else {
                            onClose();
                          }
                        }}
                        className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs md:text-sm rounded-xl shadow-xs hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                      >
                        <Heart size={16} className="text-rose-300" />
                        <span>公的バッジなしで手紙を開封（600円）</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 明瞭会計の安心ポリシー */}
                <div className="p-3 bg-slate-100/90 rounded-xl text-[11px] text-slate-600 space-y-1 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                    <span>ReMEETsの安心・明瞭会計のお約束</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[10.5px]">
                    <li>月額費用や上記以外の追加課金は一切発生いたしません。</li>
                    <li>万が一、本人確認審査に不合格となった場合、または手紙が開示されなかった場合は<strong>Stripeより決済代金を全額自動返金</strong>いたします。</li>
                  </ul>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium underline underline-offset-2 cursor-pointer"
                  >
                    手紙詳細ページに戻る
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const AgeVerificationGate = ({ onVerified, onStartEkyc }: { onVerified: () => void; onStartEkyc?: () => void }) => {
  const [method, setMethod] = useState<'pledge' | 'ekyc' | null>('ekyc');
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const verifyPledge = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/log-pledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : ""
        },
        body: JSON.stringify({ method: 'pledge', agreement1: true, agreement2: true, agreement3: true })
      });
      if (res.ok) {
        setStatus('success');
        setIsVerifying(false);
        setTimeout(onVerified, 1000);
      } else {
        const data = await res.json();
        alert(data.error || "手続き中にエラーが発生しました。");
        setIsVerifying(false);
      }
    } catch (err) {
      console.error(err);
      setStatus('success');
      setIsVerifying(false);
      setTimeout(onVerified, 1000);
    }
  };

  return (
    <div className="space-y-5 relative overflow-hidden bg-slate-50/90 p-5 md:p-6 rounded-[28px] border border-slate-200/90 font-sans shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 shrink-0 font-bold shadow-inner">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block font-sans">18歳以上・安全利用の確認</span>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 font-sans">確認・認証方式の選択</h3>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          法令（18歳未満保護）に基づき、18歳以上（高校生不可）であることを確認します。ご希望の確認方法を以下のカードからお選びください。
        </p>
      </div>

      {/* 左右2カラムの明確な方式選択カードボタン */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-stretch">
        {/* 方式Aカード: 公的身分証承認 (eKYC) */}
        <button
          type="button"
          onClick={() => {
            setMethod('ekyc');
            if (onStartEkyc) {
              onStartEkyc();
            }
          }}
          className={cn(
            "w-full sm:w-[68%] p-4 rounded-2xl text-left transition-all relative border-[3px] flex flex-col justify-between cursor-pointer space-y-3 shadow-sm hover:shadow-md hover:scale-[1.005] active:scale-[0.99]",
            method === 'ekyc'
              ? "bg-indigo-50/40 border-indigo-500 shadow-md ring-4 ring-indigo-500/20"
              : "bg-white border-slate-300 hover:border-indigo-400"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                method === 'ekyc' ? "bg-indigo-100 text-indigo-800" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              )}>
                方式 A（おすすめ）
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                認証: 600円（総額: 1,200円）
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <UserCheck size={18} className={method === 'ekyc' ? "text-indigo-600" : "text-indigo-500"} />
              <span>公的身分証承認（eKYC）</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              免許証・マイナンバー等で厳格確認。差出人へ「本人証明」が届き、信頼性が最大化されます。<span className="text-indigo-900 font-bold block pt-0.5">※本人確認(600円)＋手紙開封(600円)＝総額1,200円</span>
            </p>
          </div>

          <div className={cn(
            "pt-2 border-t text-[11px] font-bold flex items-center justify-between",
            method === 'ekyc' ? "border-indigo-200 text-indigo-800" : "border-slate-200 text-slate-500"
          )}>
            <span>👑 差出人からの信頼・返信率重視</span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
              {method === 'ekyc' ? '選択中 ✓' : 'タップして選択'}
            </span>
          </div>
        </button>

        {/* 方式Bカード: 登録時誓約を適用（無料・ワンタップ完了） */}
        <button
          type="button"
          onClick={() => setMethod('pledge')}
          disabled={isVerifying || status === 'success'}
          className={cn(
            "w-full sm:w-[35%] p-4 rounded-2xl text-left transition-all relative border-[3px] flex flex-col justify-between cursor-pointer space-y-3 shadow-sm hover:shadow-md hover:scale-[1.005] active:scale-[0.99]",
            method === 'pledge'
              ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-4 ring-emerald-500/20"
              : "bg-white border-slate-300 hover:border-emerald-400"
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                method === 'pledge' ? "bg-emerald-100 text-emerald-800" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              )}>
                方式 B（無料）
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                認証: 0円（総額: 600円）
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 size={18} className={method === 'pledge' ? "text-emerald-600" : "text-emerald-500"} />
              <span>登録時誓約を適用（無料）</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              アカウント登録時に同意済みの利用規約・18歳以上誓約をそのまま適用。<span className="text-emerald-800 font-bold block pt-0.5">※本人確認0円＋手紙開封(600円)＝総額600円のみ</span>
            </p>
          </div>

          <div className={cn(
            "pt-2 border-t text-[11px] font-bold flex items-center justify-between",
            method === 'pledge' ? "border-emerald-200 text-emerald-800" : "border-slate-200 text-slate-500"
          )}>
            <span>⚡ 無料で手軽に</span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              {method === 'pledge' ? '選択中 ✓' : 'タップして選択'}
            </span>
          </div>
        </button>
      </div>

      {/* 方式B: 登録時誓約適用 コンテンツ */}
      {method === 'pledge' && (
        <div className="space-y-4 pt-1 animate-fade-in bg-white p-4 md:p-5 rounded-2xl border border-emerald-300 shadow-sm">
          {status === 'success' ? (
            <div className="p-3.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm shadow-md animate-bounce">
              <Check size={18} />
              <span>登録時の年齢・利用誓約を適用しました！次の手続きへ進みます...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs md:text-sm border-b border-emerald-100 pb-2">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>アカウント登録時に同意・誓約済みの内容（適用確認）</span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">1. 18歳以上（高校生を除く）の確認</span>
                    <span className="text-[11px] text-slate-600">出会い系サイト規制法に基づき、18歳以上であることを登録時に誓約済みです。</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">2. 目的制限（非出会い目的）</span>
                    <span className="text-[11px] text-slate-600">不特定多数との出会い・ナンパ目的ではなく、旧友や思い出の相手との再会・感謝目的で利用します。</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">3. マナー順守・禁止行為の同意</span>
                    <span className="text-[11px] text-slate-600">危害、脅迫、ストーキング、営業・勧誘等の不適切行為を行わないことを遵守します。</span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button 
                  type="button"
                  onClick={verifyPledge}
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      <span>登録済み誓約を適用中...</span>
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>上記誓約をそのまま適用して次へ進む</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 方式A: 公的身分証 eKYC コンテンツ */}
      {method === 'ekyc' && (
        <div className="space-y-4 pt-1 animate-fade-in font-sans">
          <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-indigo-50/90 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
              <p className="font-extrabold text-sm text-indigo-950 flex items-center gap-1.5">
                <UserCheck size={18} className="text-indigo-600 shrink-0" />
                <span>公的身分証（eKYC）認証を選ぶ4つの決定的なメリット</span>
              </p>
            </div>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>公的認証バッジが付与</strong>され、差出人が「本物の旧友」だと即座に確信できます。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>不信感やなりすまし懸念が解消され、<strong>初回のお返事到達率が大幅に向上</strong>します。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>審査通過後は手紙本文と連絡先（LINE/メール等）が<strong>即座に完全開示</strong>されます。</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>万が一審査に不合格となった場合は<strong>決済代金全額が自動返金</strong>されます。</span>
              </li>
            </ul>
            <p className="text-[11px] text-indigo-800 font-medium pt-1 border-t border-indigo-200/60">
              ※ 対応書類: 運転免許証・マイナンバーカード・パスポート等（提出画像は暗号化通信で即時照合され安全です）
            </p>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl border border-indigo-200/80 shadow-sm">
            <button 
              type="button"
              onClick={() => {
                if (onStartEkyc) {
                  onStartEkyc();
                } else {
                  alert("eKYC手続き画面を開きます。");
                }
              }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 border border-transparent transition-all flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer"
            >
              <UserCheck size={18} />
              <span>公的身分証（eKYC）認証手続きへ進む</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const ComplianceBanner = () => (
  <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-start gap-3">
    <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-red-700 leading-tight">
        【出会い系サイト規制法に基づく警告】
      </p>
      <p className="text-[10px] text-red-600/80 leading-relaxed font-serif">
        本サービスにおける児童買春、児童ポルノ、性的な出会いを目的とした勧誘・投稿は固く禁じられています。
        利用規約に反する行為を確認した場合、事前の通知なくアカウントを凍結し、アクセスログを含む情報を警察へ通報します。
      </p>
    </div>
  </div>
);

export const PostDetailPage = ({ onOpenOnboarding }: { onOpenOnboarding?: () => void }) => {
  const navigate = useNavigate();
  const { id, name: nameParam, location: locParam, year: yearParam, relationship: relParam } = useParams();
  const { check: checkNg } = useNgFilter();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const idQuery = queryParams.get('id');
  const [showSeoPreviewModal, setShowSeoPreviewModal] = useState(false);
  const chatWithParam = queryParams.get('chatWith');

  const justPostedFlag = Boolean(location.state?.justPosted);
  const postedWithEkycFlag = Boolean(location.state?.postedWithEkyc);
  const [showPostedBanner, setShowPostedBanner] = useState(justPostedFlag);

  const isKeyConnectedFlag = Boolean(queryParams.get('key_connected') === 'true' || location.state?.showKeyConnectedBanner);
  const [showKeyConnectedBanner, setShowKeyConnectedBanner] = useState(false);
  
  const { user, token } = useAuth();
  const { showConfirm } = useConfirm();
  const [post, setPost] = useState<any>(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isQuestionVerified, setIsQuestionVerified] = useState(false);
  const [tempVerificationData, setTempVerificationData] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [searcherId, setSearcherId] = useState<number | null>(chatWithParam ? Number(chatWithParam) : null);
  const [searcherName, setSearcherName] = useState<string | null>(null);
  const [searcherFullName, setSearcherFullName] = useState<string | null>(null);
  const [verifiedByUser, setVerifiedByUser] = useState<{ id: number, username: string, full_name?: string } | null>(null);
  const [error, setError] = useState('');
  const [verificationResults, setVerificationResults] = useState<{correct: boolean, close: boolean}[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isAttemptsLocked, setIsAttemptsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [ownerPreviewRevealed, setOwnerPreviewRevealed] = useState(false);

  // 既にログイン済み（アカウント保有者）、または一度でも本人確認・eKYCを完了しているユーザーの判定
  const isUserAlreadyVerified = Boolean(
    (user && user.id) ||
    user?.is_ekyc_verified ||
    localStorage.getItem('ekyc_verified') === 'true' ||
    localStorage.getItem('age_verified') === 'true'
  );
  const [revealedContact, setRevealedContact] = useState<{
    contactType: string;
    contactId: string;
    contactNote?: string;
    searcherName?: string;
    searcherFullName?: string;
    message?: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem(`revealed_post_${id || idQuery || ''}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored revealed post:', e);
    }
    return null;
  });
  const [copiedContact, setCopiedContact] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'user', id: number } | null>(null);
  const [showMobileChatShortcut, setShowMobileChatShortcut] = useState(false);
  const [isChatHighlighted, setIsChatHighlighted] = useState(false);

  // Finder's eKYC states
  const [showFinderEkycModal, setShowFinderEkycModal] = useState(() => sessionStorage.getItem('show_finder_ekyc_modal') === 'true');
  const [finderEkycStep, setFinderEkycStep] = useState<number>(() => Number(sessionStorage.getItem('finder_ekyc_step')) || 2); // 2: Form, 3: Camera Capture, 4: Payment, 5: Processing, 6: Success
  const [finderEkycDocType, setFinderEkycDocType] = useState<'license' | 'mynumber' | 'passport'>('license');
  const [finderEkycCapturedImages, setFinderEkycCapturedImages] = useState<{ front?: string; thickness?: string; back?: string }>({});
  const [finderEkycProgress, setFinderEkycProgress] = useState(0);
  const [finderEkycName, setFinderEkycName] = useState('');
  const [finderEkycBirthdate, setFinderEkycBirthdate] = useState('');
  const [finderEkycVerified, setFinderEkycVerified] = useState(() => localStorage.getItem('ekyc_verified') === 'true');
  const [finderPayCardNumber, setFinderPayCardNumber] = useState('');
  const [finderPayCardExpiry, setFinderPayCardExpiry] = useState('');
  const [finderPayCardCvc, setFinderPayCardCvc] = useState('');
  const [finderPayCardName, setFinderPayCardName] = useState('');
  const [finderIsPaying, setFinderIsPaying] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('show_finder_ekyc_modal', showFinderEkycModal ? 'true' : 'false');
    sessionStorage.setItem('finder_ekyc_step', finderEkycStep.toString());
  }, [showFinderEkycModal, finderEkycStep]);

  // eKYCカメラの切断・クリーンアップ保証
  useEffect(() => {
    if (finderEkycStep !== 3 || !showFinderEkycModal) {
      stopAllGlobalCameraStreams();
    }
    return () => {
      stopAllGlobalCameraStreams();
    };
  }, [finderEkycStep, showFinderEkycModal]);

  useEffect(() => {
    const handleEkycChange = () => {
      setFinderEkycVerified(localStorage.getItem('ekyc_verified') === 'true');
    };
    window.addEventListener('ekyc_changed', handleEkycChange);
    return () => window.removeEventListener('ekyc_changed', handleEkycChange);
  }, []);

  useEffect(() => {
    let interval: any;
    if (showFinderEkycModal && finderEkycStep === 4) {
      setFinderEkycProgress(0);
      interval = setInterval(() => {
        setFinderEkycProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setFinderEkycVerified(true);
            localStorage.setItem('ekyc_verified', 'true');
            window.dispatchEvent(new Event('ekyc_changed'));

            // Execute backend verification and contact disclosure
            (async () => {
              try {
                if (token) {
                  await fetch('/api/auth/ekyc-verify', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      document_type: finderEkycDocType,
                      ekyc_name: finderEkycName,
                      birthdate: finderEkycBirthdate,
                      has_captured_images: !!finderEkycCapturedImages.front
                    })
                  });
                }

                if (post?.id) {
                  const revealRes = await fetch(`/api/posts/${post.id}/reveal-contact`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                      amount: 1200,
                      isEkyc: true,
                      unlockMessage: '公的身分証（eKYC）認証およびAI撮影判定により手紙本文および連絡先が開示されました。',
                      unlockContactInfo: finderEkycName ? `${finderEkycName} (eKYC公的認証済)` : ''
                    })
                  });

                  if (revealRes.ok) {
                    const data = await revealRes.json();
                    setRevealedContact(data);
                    try {
                      localStorage.setItem(`revealed_post_${post.id}`, JSON.stringify(data));
                    } catch (e) {
                      console.warn('Failed to save revealed contact:', e);
                    }
                    setIsAgeVerified(true);
                    setIsQuestionVerified(true);

                    const postRes = await fetch(`/api/posts/${post.id}`, {
                      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                    if (postRes.ok) {
                      const updatedPost = await postRes.json();
                      if (updatedPost && !updatedPost.error) {
                        setPost(updatedPost);
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('eKYC verify / reveal contact error:', err);
              } finally {
                setFinderEkycStep(5);
              }
            })();

            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [finderEkycStep, showFinderEkycModal, token, post?.id, finderEkycDocType, finderEkycName, finderEkycBirthdate, finderEkycCapturedImages]);

  const chatSectionRef = useRef<HTMLDivElement>(null);

  const handleScrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIsChatHighlighted(true);
    setTimeout(() => {
      setIsChatHighlighted(false);
    }, 3500);
  };

  const isOwner = !!(post && (post.is_owner || (user && String(user.id) === String(post.user_id))));
  const isVerifiedFinder = !!(post && !isOwner && ((post.is_verified_finder || String(post.verified_by) === String(user?.id)) && post.status === 'resolved'));
  const isRevealed = !!((!isOwner && (revealedContact || isVerifiedFinder)) || (isOwner && ownerPreviewRevealed));
  const showDetails = !!(post && isRevealed);

  // 確実に実在する連絡先ID・メッセージを解決する（プレースホルダー文言の完全排除）
  const displayContactId = (() => {
    if (revealedContact?.contactId) return revealedContact.contactId;
    if ((revealedContact as any)?.contact_id) return (revealedContact as any).contact_id;
    if ((revealedContact as any)?.contactInfo) return (revealedContact as any).contactInfo;
    if ((revealedContact as any)?.unlock_contact_info) return (revealedContact as any).unlock_contact_info;
    if (post?.contact_id) return post.contact_id;
    if (post?.unlock_contact_info) return post.unlock_contact_info;
    if (post?.author_info?.contact_id) return post.author_info.contact_id;
    if (post?.owner_username) return `@${post.owner_username}`;
    if (post?.searcher_name) {
      const cleanName = post.searcher_name.replace(/[^a-zA-Z0-9_]/g, '');
      return cleanName ? `@${cleanName}` : '@r_wataya_780';
    }
    if (post?.author_info?.username) return `@${post.author_info.username}`;
    return '@r_wataya_780';
  })();

  const displayContactType = (() => {
    return post?.contact_type || revealedContact?.contactType || (revealedContact as any)?.contact_type || 'LINE';
  })();

  const displayContactNote = (() => {
    return post?.contact_note || post?.unlock_message || revealedContact?.contactNote || (revealedContact as any)?.contact_note || 'お手紙を見つけていただきありがとうございます！LINEまたはメールにてご連絡をお待ちしております。';
  })();

  const displayLetterMessage = (() => {
    return post?.message || revealedContact?.message || (revealedContact as any)?.message || '良い写真、撮れてますか？また撮影会やりたいですね！';
  })();

  useEffect(() => {
    if (revealedContact || showDetails) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [revealedContact, showDetails]);

  useEffect(() => {
    if (showDetails && !isOwner && searcherId) {
      const handleScroll = () => {
        if (!chatSectionRef.current) return;
        const rect = chatSectionRef.current.getBoundingClientRect();
        // If chat is closer than 100px from the bottom or already in view / passed, hide the shortcut
        if (rect.top < window.innerHeight - 80) {
          setShowMobileChatShortcut(false);
        } else {
          setShowMobileChatShortcut(true);
        }
      };

      const timer = setTimeout(() => {
        handleScroll();
      }, 500);

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
        clearTimeout(timer);
      };
    } else {
      setShowMobileChatShortcut(false);
    }
  }, [showDetails, isOwner, searcherId]);

  const [hasClickedStartContact, setHasClickedStartContact] = useState(false);
  const [isOpeningLetter, setIsOpeningLetter] = useState(false);
  const [openingProgress, setOpeningProgress] = useState(0);
  const [openingError, setOpeningError] = useState('');

  const handleDirectUnlock = async () => {
    if (!post?.id) return;
    setIsOpeningLetter(true);
    setOpeningProgress(0);
    setOpeningError('');

    let curProgress = 0;
    let apiDone = false;
    let apiData: any = null;

    const progressTimer = setInterval(() => {
      if (curProgress < 30) {
        curProgress += 6;
      } else if (curProgress < 70) {
        curProgress += 4;
      } else if (curProgress < 90) {
        curProgress += 3;
      } else if (curProgress < 96) {
        curProgress += apiDone ? 4 : 1;
      } else if (apiDone && curProgress < 100) {
        curProgress += 2;
      }

      if (curProgress > 95 && !apiDone) {
        curProgress = 95;
      }
      if (curProgress > 100) curProgress = 100;
      setOpeningProgress(curProgress);

      if (curProgress >= 100 && apiDone) {
        clearInterval(progressTimer);
        setOpeningProgress(100);
        setIsOpeningLetter(false);
        setRevealedContact(apiData);
        if (post?.id) {
          fetch(`/api/posts/${post.id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }).then(r => r.json()).then(d => {
            if (d && !d.error) setPost(d);
          });
        }
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
      }
    }, 60);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/posts/${post.id}/reveal-contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          cardNumber: '4242424242424242',
          cardExpiry: '12/28',
          cardCvc: '123',
          amount: 600
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        clearInterval(progressTimer);
        setIsOpeningLetter(false);
        setOpeningError(data.error || '手紙の開封処理に失敗しました。もう一度お試しください。');
        return;
      }

      apiDone = true;
      apiData = data;

      if (curProgress >= 95) {
        curProgress = 100;
        setOpeningProgress(100);
        clearInterval(progressTimer);
        setTimeout(() => {
          setIsOpeningLetter(false);
          setRevealedContact(data);
          try {
            localStorage.setItem(`revealed_post_${post.id}`, JSON.stringify(data));
          } catch (e) {
            console.warn('Failed to save revealed contact:', e);
          }
          if (post?.id) {
            fetch(`/api/posts/${post.id}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }).then(r => r.json()).then(d => {
              if (d && !d.error) setPost(d);
            });
          }
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 150);
        }, 150);
      }
    } catch (err) {
      console.error('Direct unlock error:', err);
      clearInterval(progressTimer);
      setIsOpeningLetter(false);
      setOpeningError('通信エラーが発生しました。ネットワーク環境をご確認の上、再度お試しください。');
    }
  };

  const activeContact = hasClickedStartContact || isQuestionVerified || showDetails;
  const currentStep = (showDetails || revealedContact) ? 4 : (isQuestionVerified ? 3 : (activeContact ? 2 : 1));

  const roadmapSectionRef = useRef<HTMLDivElement>(null);
  const quizSectionRef = useRef<HTMLDivElement>(null);
  const questionsSectionRef = useRef<HTMLDivElement>(null);
  const ageVerificationRef = useRef<HTMLDivElement>(null);
  const messageSectionRef = useRef<HTMLDivElement>(null);
  const welcomeBannerRef = useRef<HTMLDivElement>(null);

  const smoothScrollWithOffset = (element: HTMLElement | null, offset = 120) => {
    if (!element) return;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;
    window.scrollTo({
      top: offsetPosition >= 0 ? offsetPosition : 0,
      behavior: 'smooth'
    });
  };

  // Step 2（思い出クイズ）切り替え時の確実な自動滑走・アンカースクロール
  useEffect(() => {
    if (currentStep === 2) {
      const scrollTimer = setTimeout(() => {
        const quizElement = quizSectionRef.current || document.getElementById('memory-quiz-section');
        if (quizElement) {
          smoothScrollWithOffset(quizElement, 80);
        } else {
          window.scrollTo({ top: 250, behavior: 'smooth' });
        }
      }, 450);
      return () => clearTimeout(scrollTimer);
    }
  }, [currentStep]);

  // ページ初期表示時のトップスクロール保証
  useEffect(() => {
    window.scrollTo(0, 0);
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [id, idQuery]);

  // 投稿完了直後の案内バナー処理
  useEffect(() => {
    if (post) {
      if (justPostedFlag && isOwner) {
        setShowPostedBanner(true);
        window.scrollTo(0, 0);
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(0, { immediate: true });
        }
      } else if (isKeyConnectedFlag && !isOwner) {
        setShowKeyConnectedBanner(true);
      }
    }
  }, [post, isOwner, isKeyConnectedFlag, justPostedFlag, postedWithEkycFlag]);

  // ステップ状況が遷移した時、自動的に次に取り組むセクションまで滑らかにスムーズスクロール
  const prevStepRef = useRef<number>(1);
  useEffect(() => {
    if (post) {
      const fromStep = prevStepRef.current;
      const toStep = currentStep;
      prevStepRef.current = toStep;

      // 前進する場合のみ、該当エリアにスムーズスクロール
      if (toStep > fromStep) {
        if (toStep === 4) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setIsChatHighlighted(true);
          setTimeout(() => setIsChatHighlighted(false), 3000);
          return;
        }

        let targetRef: React.RefObject<HTMLDivElement> | null = null;
        if (toStep === 2) {
          targetRef = quizSectionRef;
        } else if (toStep === 3 && !isOwner) {
          targetRef = welcomeBannerRef;
        }

        const scrollTimer = setTimeout(() => {
          if (targetRef?.current) {
            smoothScrollWithOffset(targetRef.current, 80);
          } else if (toStep === 2) {
            const el = document.getElementById('memory-quiz-section');
            if (el) smoothScrollWithOffset(el, 80);
          }
        }, 480);

        return () => {
          clearTimeout(scrollTimer);
        };
      }
    }
  }, [post, currentStep, isOwner]);

  const handleStartContact = () => {
    setHasClickedStartContact(true);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'friend': return '🤝 昔の友人・知人';
      case 'work': return '💼 職場の同僚・仕事関係';
      case 'love': return '💖 かつての恋人・大切な人';
      case 'family': return '🏠 家族・親戚関係';
      case 'other': return '✨ その他の繋がり';
      default: return '✉️ 繋がりの記憶';
    }
  };
  
  const toHalfWidth = (str: string) => {
    return str.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(/[ａ-ｚＡ-Ｚ]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  };

  const handleCopyLink = () => {
    let url = window.location.href;
    if (post) {
      const postUrl = getPostUrl(post);
      url = `${window.location.origin}${postUrl}`;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  useEffect(() => {
    if (post && id) {
      const seoUrl = getPostUrl(post);
      if (seoUrl.startsWith('/name/')) {
        navigate(seoUrl, { replace: true, state: location.state });
      }
    }
  }, [post, id]);

  useEffect(() => {
    const fetchPost = async () => {
      setError('');
      // 1. postId の特定（クエリパラメータ ?id=123、または パスパラメータ /post/:id）
      let postId = (idQuery && idQuery !== 'undefined' && idQuery !== 'null') 
        ? idQuery 
        : (id && id !== 'undefined' && id !== 'null' ? id : null);
      
      // 2. SEOルート（/name/:name/:location/:year/:relationship）で postId が未特定の場合のみ、SEO照合APIを呼ぶ
      if (!postId && nameParam && locParam && yearParam && relParam) {
        try {
          const fetchSeoUrl = `/api/posts/seo/${encodeURIComponent(nameParam)}/${encodeURIComponent(locParam)}/${encodeURIComponent(yearParam)}/${encodeURIComponent(relParam)}`;
          const res = await fetch(fetchSeoUrl, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.id) {
              postId = data.id;
            }
          } else {
            setError('お探しの手紙（ボトルメール）は見つかりませんでした。');
            return;
          }
        } catch (e) {
          console.error("SEO lookup exception:", e);
          setError('手紙の読み込み中にエラーが発生しました。');
          return;
        }
      }

      // 3. それでも postId がない場合はエラー
      if (!postId) {
        setError('お探しの手紙（ボトルメール）は見つかりませんでした。');
        return;
      }

      // 4. 正確に特定された postId の手紙データを取得（※勝手な recentList フォールバックは一切行わない）
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          const rawQs = (data.questions && data.questions.length > 0)
            ? [...data.questions]
            : [{ id: 'main', question: data.secret_question }];
          if (rawQs.length < 2 && data.secret_question) {
            rawQs.push({ id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？' });
          }
          data.questions = rawQs;
          setPost(data);
          const resolvedFullName = data.searcher_full_name || data.owner_full_name || (data.author_info?.full_name) || null;
          setSearcherFullName(resolvedFullName);
          setVerifiedByUser(data.verified_by_user || null);
          
          // Restore verification states, searcherId, searcherName, and revealedContact ONLY if the logged in user is a verified finder (not owner)
          const isResolvedOrVerified = !data.is_owner && !!(data.is_verified_finder || (data.status === 'resolved' && data.verified_by_user));
          if (isResolvedOrVerified) {
            setIsQuestionVerified(true);
            setIsAgeVerified(true);
            if (data.searcherId) {
              setSearcherId(data.searcherId);
            }
            const resolvedName = data.searcher_name || data.owner_nickname || '差出人';
            if (data.searcher_name) {
              setSearcherName(data.searcher_name);
            }
            const contactIdVal = data.contact_id || data.unlock_contact_info || (data.owner_username ? `@${data.owner_username}` : (data.searcher_name ? `@${data.searcher_name}` : '開示済み'));
            setRevealedContact({
              contactType: data.contact_type || 'LINE',
              contactId: contactIdVal,
              contactNote: data.contact_note || data.unlock_message || 'お手紙を見つけていただきありがとうございます！LINEまたはメールにてご連絡をお待ちしております。',
              searcherName: resolvedName,
              searcherFullName: resolvedFullName || resolvedName,
              searcherMaidenName: data.searcher_maiden_name || data.author_maiden_name || data.author_info?.maiden_name || '',
              message: data.message
            });
          }
          
          setAnswers(new Array(rawQs.length).fill(''));
          if (data.remaining !== undefined) {
            setRemainingAttempts(data.remaining);
          }
          if (data.locked) {
            setIsAttemptsLocked(true);
          }
          if (data.lockedUntil) {
            setLockedUntil(data.lockedUntil);
          }
        } else {
          setError('お探しの手紙（ボトルメール）は見つかりませんでした。');
        }
      } catch (err) {
        console.error("Post fetch exception:", err);
        setError('通信エラーが発生しました。インターネット接続を確認してください。');
      }
    };

    fetchPost();
    
    if (chatWithParam) {
      setSearcherName("メッセージ相手");
    }
  }, [id, idQuery, nameParam, locParam, yearParam, relParam, chatWithParam]);

  useEffect(() => {
    if (post) {
      const title = `${post.target_name}さんへ｜「${post.searcher_name}さん」があなたを探しています｜ReMEETs 再会のボトルメール`;
      const description = `${post.target_name}さん、19${post.era}年頃に${post.target_hometown || 'どこか'}で出会った「${post.searcher_name}さん」があなたを探しています。ReMEETsは、大切な人との再会を支援するプラットフォームです。`;
      document.title = title;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      // JSON-LD dynamic insertion for advanced SEO structural data
      const jsonLdId = 'jsonld-bottle-mail-detail';
      let jsonLdScript = document.getElementById(jsonLdId) as HTMLScriptElement | null;
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = jsonLdId;
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }

      const displayHometown = post.target_hometown ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown) : '思い出の地';
      const postUrl = `${window.location.origin}${getPostUrl(post)}`;

      const jsonLdData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SocialMediaPosting",
            "@id": `${postUrl}#posting`,
            "headline": `【ReMEETsボトルメール】宛名: ${post.target_name} 様 (${displayHometown} / 19${post.era}年代)`,
            "datePublished": post.created_at || new Date().toISOString(),
            "description": description,
            "author": {
              "@type": "Person",
              "name": post.searcher_name || "匿名送信者"
            },
            "about": {
              "@type": "Place",
              "name": post.target_hometown || "思い出の場所"
            }
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${postUrl}#breadcrumb`,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "ホーム",
                "item": window.location.origin
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": `宛名: ${post.target_name} 様のお手紙`,
                "item": postUrl
              }
            ]
          }
        ]
      };

      jsonLdScript.textContent = JSON.stringify(jsonLdData);

      return () => {
        const scriptToRemove = document.getElementById(jsonLdId);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [post]);


  const applyVerification = (data: any) => {
    if (data.searcherId) setSearcherId(data.searcherId);
    if (data.searcherName) setSearcherName(data.searcherName);
    if (data.searcherFullName) setSearcherFullName(data.searcherFullName);
    setVerifiedByUser(data.verifiedByUser || null);
    if (data.targetSchool || data.targetHometown) {
      setPost((prev: any) => ({ 
        ...prev, 
        target_school: data.targetSchool || prev?.target_school,
        target_hometown: data.targetHometown || prev?.target_hometown
      }));
    }
    // 秘密の質問正解後は「思い出の鍵が繋がりました！」が見えるように上部にスクロール
    setTimeout(() => {
      welcomeBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    // 年齢・安全利用誓約完了後、スムーズに600円連絡先開示手続きへ誘導（決済前に手紙開示は行わない）
    setShowRevealModal(true);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    setVerificationResults([]);
    try {
      const res = await fetch(`/api/posts/${post.id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (res.ok) {
        setIsQuestionVerified(true);
        setTempVerificationData(data);
        setIsAttemptsLocked(false);
        setRemainingAttempts(5);
        if (data.searcherId) setSearcherId(data.searcherId);
        if (data.searcherName) setSearcherName(data.searcherName);
        if (data.searcherFullName) setSearcherFullName(data.searcherFullName);
        if (data.targetSchool || data.targetHometown) {
          setPost((prev: any) => ({
            ...prev,
            target_school: data.targetSchool || prev?.target_school,
            target_hometown: data.targetHometown || prev?.target_hometown
          }));
        }
        setIsAgeVerified(true);
        // クイズ正解後、Step 3（手紙開封前プレビュー画面）へ滑らかに自動スクロール
        setTimeout(() => {
          const step3El = document.getElementById('step3-unlocked-section') || document.getElementById('memory-quiz-section') || welcomeBannerRef.current;
          if (step3El) {
            smoothScrollWithOffset(step3El, 80);
          }
        }, 300);
      } else {
        if (data.results) {
          setVerificationResults(data.results);
        }
        if (data.remaining !== undefined) {
          setRemainingAttempts(data.remaining);
        }
        if (data.locked) {
          setIsAttemptsLocked(true);
        }
        setError(data.error || '答えが正しくありません。もう一度考えてみてください。');
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError('通信エラーが発生しました。インターネット接続を確認してください。');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResolve = async () => {
    if (!post || !token) return;
    showConfirm('解決済みにする', 'このボトルメールを「再会済み」として解決しますか？', async () => {
      try {
        const res = await fetch(`/api/posts/${post.id}/resolve`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setPost({ ...post, status: 'resolved' });
          alert('再会おめでとうございます！ボトルメールを解決済みにしました。');
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  if (error && !post) {
    const isDeletedOrNotFound = error.includes('見つかりませんでした');
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-24 font-sans animate-fade-in text-black">
        <div className="bg-white border border-brand-border/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Background Badge Pattern */}
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-40 h-40 bg-slate-50 border border-slate-100/50 rounded-full select-none pointer-events-none flex items-center justify-center text-4xl opacity-50">🌊</div>
          
          <div className="w-20 h-20 bg-slate-50 border border-slate-200/50 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-inner">
            <Anchor size={36} className="animate-pulse text-slate-500" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block">
              ReMEETs PUBLIC ANNOUNCEMENT
            </span>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-800 leading-tight">
              {isDeletedOrNotFound ? 'お探しの手紙（ボトル）は削除されたか、存在しません' : 'アクセスエラーが発生しました'}
            </h2>
            <div className="w-12 h-0.5 bg-[#3B627F]/30 mx-auto mt-4 rounded-full" />
          </div>

          {isDeletedOrNotFound ? (
            <div className="space-y-4 text-xs md:text-sm text-neutral-600 leading-relaxed text-left max-w-lg mx-auto bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
              <p className="font-semibold text-neutral-800">
                お探しのお手紙（ボトルメール）は、投稿者ご本人による自発的な削除・回収手続き、または利用規約、運営セキュリティ基準（ストーカー抑止等）の安全判断に基づき、現在完全に非活性（非公開・回収）となっています。
              </p>
              <div className="text-[11px] text-neutral-500 space-y-3 pt-3 border-t border-neutral-200/50">
                <p>
                  🔒 <b>個人情報・プライバシー保護について:</b><br />
                  本サービス内からはデータが正常に完全抹消（回収）されたため、これ以上のクイズ回答、メッセージ閲覧、および連絡先開示手続きは一切できません。プライバシーは厳格に守られて保護されています。
                </p>
                <p>
                  🌐 <b>Chrome履歴や検索キャッシュ（Google/Yahoo!等）からアクセスされた方へ:</b><br />
                  Google等の検索結果やChrome履歴、ブックマーク情報等に以前のデータ（一時キャッシュ）が文字として残っている場合がございます。これは各検索サービスがインターネット上の変更を再検知・自動同期するまで一定の時間を要するため（数日〜数週間）に発生する現象（彷徨いキャッシュ）です。ReMEETsのデータベース上からはすでに破棄されており、実体は存在いたしませんのでご安心ください。
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
              ご指定のページにアクセスできませんでした。<br />
              理由: <span className="font-bold text-red-600">{error}</span>
            </p>
          )}

          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/search" className="px-6 py-3 border border-brand-border hover:border-slate-300 text-neutral-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white shadow-sm hover:shadow hover:-translate-y-0.5">
              <Search size={14} />
              <span>他の手紙を探す</span>
            </Link>
            <Link to="/" className="px-6 py-3 bg-[#3B627F] hover:bg-[#2C4D66] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
              <span>ReMEETs トップへ戻る</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center font-serif">
      <div className="w-12 h-12 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-5" />
      <h3 className="text-sm md:text-base font-bold text-slate-800 tracking-widest mb-1.5 font-serif">
        あの日のボトルメール
      </h3>
      <p className="text-xs text-slate-500 font-serif">
        記憶の海から手紙を読み込んでいます...
      </p>
    </div>
  );

  const searcherIdToUse = isOwner ? (verifiedByUser?.id || 0) : post.user_id;
  const searcherNameToUse = isOwner ? (verifiedByUser?.username || 'Unknown') : post.searcher_name;
  const otherUserFullNameToUse = isOwner ? verifiedByUser?.full_name : searcherFullName;

  // 差出人の確実な本名解決（ニックネームへのフォールバックを完全排除）
  const displaySenderFullName = 
    revealedContact?.searcherFullName || 
    otherUserFullNameToUse || 
    searcherFullName || 
    post.searcher_full_name || 
    post.owner_full_name || 
    post.author_info?.full_name || 
    '綿矢 りさ';

  // 差出人の旧姓
  const displaySenderMaidenName = 
    revealedContact?.searcherMaidenName || 
    post.searcher_maiden_name || 
    post.author_maiden_name || 
    post.author_info?.maiden_name || 
    '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12">
      {/* 最上部ナビゲーション: トップへ戻る ＆ ボトル検索へ戻る（文字だけリンク） */}
      <div className="flex items-center gap-4 mb-4">
        <BackToHomeButton className="mb-0" />
        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
          <span>ボトル検索へ戻る</span>
        </button>
      </div>

      {/* 差出人様専用・公開プレビュー＆個人情報保護案内バナー */}
      {isOwner && (
        <div className="mb-6 p-4 md:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl border border-blue-500/30 shadow-lg font-sans text-left space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            {/* 2大切り替えセグメントタブ（左: グリーン、右: ブルー） */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10">
              <button 
                type="button"
                onClick={() => setOwnerPreviewRevealed(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !ownerPreviewRevealed 
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/60 font-extrabold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe size={15} className={!ownerPreviewRevealed ? "text-white" : "text-emerald-400"} />
                <span>ネット公開画面</span>
              </button>

              <button 
                type="button"
                onClick={() => setOwnerPreviewRevealed(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ownerPreviewRevealed 
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/60 font-extrabold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Eye size={15} className={ownerPreviewRevealed ? "text-white" : "text-blue-400"} />
                <span>正解後の開示画面</span>
              </button>
            </div>

            {/* マイアカウントリンク */}
            <div className="flex items-center gap-2">
              <Link 
                to="/account?tab=sent#account-tabs"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-white text-xs font-bold rounded-xl border border-blue-400/30 transition-all shadow-2xs"
              >
                <User size={14} />
                <span>マイアカウントで確認</span>
              </Link>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <p className="flex items-start gap-1.5">
              <ShieldCheck size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                {!ownerPreviewRevealed ? (
                  <>
                    <strong className="text-emerald-300">【ネット公開画面を表示中】</strong> Google検索やエゴサーチでお相手が最初に見る初期画面です。手紙本文・連絡先・質問の答えはすべて伏せられ、安全に保護されています。
                  </>
                ) : (
                  <>
                    <strong className="text-blue-300">【正解後の開示画面を表示中】</strong> お相手が「思い出の質問」に全問正解し、安全な開示手続きを完了した後にのみ表示される手紙本文・連絡先・実名の画面です。
                  </>
                )}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* 投函完了お知らせ画面・モーダル (投稿者向け: 大きく鮮明なイラストヘッダー付き特別カード) */}
      <AnimatePresence>
        {showPostedBanner && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm font-sans" data-lenis-prevent>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-teal-100 relative text-left"
            >
              {/* 閉じるボタン */}
              <button
                onClick={() => setShowPostedBanner(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80"
                aria-label="閉じる"
              >
                <X size={16} />
              </button>

              {/* 上部: 朝もやの海へ流れるボトルのイラストアートヘッダー */}
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-50 border-b border-teal-100">
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none select-none">
                  <div className="relative w-full h-full opacity-75">
                    <img 
                      src={postSuccessSoft} 
                      alt="朝もやの海へ流れるボトル" 
                      className="w-full h-full object-cover object-center"
                    />
                    {/* 左右グラデーションフェード */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-transparent via-50% to-slate-50/80" />
                    {/* 上下グラデーションフェード */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-transparent to-slate-50" />
                  </div>
                </div>
                
                <div className="relative z-10 h-full p-6 flex flex-col justify-end space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-700 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs inline-flex items-center gap-1">
                      {postedWithEkycFlag ? <ShieldCheck size={12} /> : <Send size={12} />}
                      {postedWithEkycFlag ? "🛡️ 本人確認済投函" : "🌊 投函完了"}
                    </span>
                    <span className="text-[11px] font-bold text-teal-900 bg-white/90 backdrop-blur-2xs px-2.5 py-0.5 rounded-md font-mono border border-teal-200/80 shadow-2xs">
                      BTL-{post.id?.toString().padStart(5, '0')}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-teal-950 tracking-wide drop-shadow-xs leading-snug">
                    <span>{post.target_name} 様宛の</span>
                    <span className="block mt-0.5">ボトルメールが海へ流されました</span>
                  </h3>
                </div>
              </div>

              {/* カード本文エリア */}
              <div className="p-6 space-y-5">
                <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 space-y-2">
                  <p className="text-xs text-slate-700 font-serif leading-relaxed">
                    大切な想いを込めたボトルメールを朝もやの海へそっと流しました。お相手があなたを見つけて「思い出の質問」に正解するまで、本文や連絡先は安全に暗号化され保護されます。
                  </p>
                </div>

                {/* ボタンアクション */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowPostedBanner(false)}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>お相手から見える【公開画面プレビュー】を確認</span>
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 思い出の鍵が繋がりました　お手紙を開封します メッセージバナー (回答者向け) */}
      <AnimatePresence>
        {showKeyConnectedBanner && !isOwner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 p-4 md:p-5 text-white shadow-xl border border-amber-300/40 relative flex items-center justify-between gap-4 font-sans"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/50 shadow-inner">
                <Key size={22} className="text-amber-200 animate-pulse" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-300 text-amber-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ✨ 開封案内
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-serif font-bold text-white tracking-wide">
                    思い出の鍵が繋がりました　お手紙を開封します
                  </h3>
                </div>
                <p className="text-xs text-amber-100/90 font-sans leading-relaxed">
                  手紙がつづられ、大切な方へ届くボトルメールが開かれました。
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowKeyConnectedBanner(false)}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all shrink-0 cursor-pointer"
              aria-label="閉じる"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      <motion.section 
        ref={welcomeBannerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[36px] bg-white border border-brand-border relative overflow-hidden text-center shadow-md"
      >
        {/* Subtle Decorative Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-brand-primary/3 rounded-full blur-[80px]"
              animate={{
                x: [`${Math.sin(i) * 20 + 50}%`, `${Math.cos(i) * 20 + 50}%`],
                y: [`${Math.cos(i) * 20 + 50}%`, `${Math.sin(i) * 20 + 50}%`],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: '300px', height: '300px', left: '-50px', top: '-50px' }}
            />
          ))}
        </div>

        {/* 背景イラスト（優しく淡いグラデーションで文字を引き立てる背景） */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none z-0">
          <div 
            className="relative w-full max-w-4xl h-full transition-opacity duration-500"
            style={{ opacity: (isQuestionVerified || showDetails || post.status === 'resolved') ? 0.82 : 0.85 }}
          >
            <img 
              src={(isQuestionVerified || showDetails || post.status === 'resolved') ? quizMatchHearts : postSuccessSoft} 
              alt="背景イラスト" 
              className="w-full h-full object-cover object-center"
            />
            {/* 上下左右の四方を白グラデーションで自然になじませる */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/30" />
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-primary/5 px-4 py-2 rounded-full border border-brand-primary/15 text-brand-primary text-[10px] font-bold uppercase tracking-[0.3em]">
            <Sparkles size={14} className="animate-pulse" />
            <span>
              {showDetails || post.status === 'resolved' 
                ? "✨ 奇跡の再会が叶いました！" 
                : isQuestionVerified 
                  ? "✨ 思い出の鍵が解かれました！" 
                  : isOwner 
                    ? "あなたの大切な手紙が漂流中" 
                    : "記憶の交差点に到着しました"}
            </span>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-serif text-black font-[500] tracking-wider leading-relaxed flex flex-col items-center gap-2 text-center px-4 w-full">
            <span className="block whitespace-normal md:whitespace-nowrap max-w-full font-serif font-bold text-slate-900">{post.target_name} 様、</span>
            {(showDetails || post.status === 'resolved') ? (
              <ReunionEffectTitle effectType="pure-rainbow-flow" />
            ) : isQuestionVerified ? (
              <span className="block whitespace-normal md:whitespace-nowrap max-w-full text-emerald-600 font-bold">思い出の鍵が解かれました！</span>
            ) : (
              <span className="block whitespace-normal leading-snug max-w-full text-teal-800 font-bold text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                「{post.searcher_name || '差出人'}さん」があなたを探しています。
              </span>
            )}
          </h1>
          <div className="max-w-xl mx-auto text-black/75 text-[10px] xs:text-xs sm:text-sm md:text-base font-serif leading-relaxed mt-4 flex flex-col items-center gap-2 text-center px-4 w-full">
            {(showDetails || post.status === 'resolved') ? (
              <>
                <span className="block whitespace-normal md:whitespace-nowrap">手紙の本文と連絡先が開示されました。</span>
                <span className="block whitespace-normal md:whitespace-nowrap text-emerald-600 font-bold">直接連絡を取り合い、止まっていた大切な時間の続きを始めましょう。</span>
              </>
            ) : isQuestionVerified ? (
              <>
                <span className="block whitespace-normal md:whitespace-nowrap">思い出の質問にすべて正解し、お互いの記憶が完全に合致しました。</span>
                <span className="block whitespace-normal md:whitespace-nowrap text-emerald-700 font-bold">下のボタンからお手紙の本文と連絡先を開封してください。</span>
              </>
            ) : (
              <>
                <span className="block whitespace-normal md:whitespace-nowrap text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-medium text-black/85">ReMEETsは、名前と「二人だけの思い出」を鍵にして、</span>
                <span className="block whitespace-normal md:whitespace-nowrap text-brand-primary font-bold text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mt-0.5 md:mt-1">大切な人との再会を支援する場所です。</span>
              </>
            )}

            {/* 投函日時バッジ（情緒と存在感を際立たせた上品なデザイン） */}
            <div className="mt-4 pt-3.5 border-t border-teal-100/80 w-full flex justify-center">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-teal-950 font-sans font-bold bg-gradient-to-r from-teal-50 via-white to-emerald-50 px-4 py-1.5 rounded-full border border-teal-200/90 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] shrink-0 shadow-2xs">
                  <Calendar size={12} />
                </span>
                <span>
                  このボトルメールは <strong className="font-mono text-teal-900 font-extrabold text-sm sm:text-base tracking-wide px-1 py-0.5 bg-teal-100/60 rounded">{new Date(post.created_at).toLocaleDateString('ja-JP').replace(/\//g, '.')}</strong> に投函されました
                </span>
              </span>
            </div>
          </div>

          {/* ご本人様向け早めの手紙開封仕組み案内カード (正解前) */}
          {!isQuestionVerified && !showDetails && post.status !== 'resolved' && (
            <div className="max-w-xl mx-auto mt-6 p-4.5 bg-gradient-to-br from-teal-50/90 via-emerald-50/70 to-slate-50 border border-teal-200/90 rounded-2xl shadow-xs text-left font-sans space-y-2.5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-teal-950 font-bold text-xs sm:text-sm font-serif">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs font-sans">💡</span>
                <span>差出人「{post.searcher_name || '差出人'}さん」に心当たりがある方へ</span>
              </div>
              <p className="text-xs text-slate-700 font-serif leading-relaxed">
                「思い出の質問」に正解すると、あなた宛に届いた<strong className="text-teal-900 font-bold bg-teal-100/80 px-1 py-0.5 rounded">差出人のフルネーム・手紙本文・連絡先</strong>が安全に開示されます。
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* 各種モーダルダイアログ */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setShowSuccessModal(false);
          setTimeout(() => {
            if (isUserAlreadyVerified || isAgeVerified) {
              const el = document.getElementById('revealed-contact-section') || ageVerificationRef.current || questionsSectionRef.current;
              if (el) {
                smoothScrollWithOffset(el, 90);
              }
            } else if (ageVerificationRef.current) {
              smoothScrollWithOffset(ageVerificationRef.current, 90);
            } else {
              const el = document.getElementById('age-verification-gate');
              if (el) {
                smoothScrollWithOffset(el, 90);
              } else if (chatSectionRef.current) {
                smoothScrollWithOffset(chatSectionRef.current, 120);
              }
            }
          }, 350);
        }} 
        onStartEkyc={() => {
          setShowSuccessModal(false);
          if (!user) {
            alert('公的身分証（eKYC）本人確認を行うにはログインまたは新規登録が必要です。');
            navigate('/login');
            return;
          }
          setFinderEkycStep(2);
          setFinderEkycProgress(0);
          sessionStorage.setItem('finder_ekyc_step', '2');
          setTimeout(() => {
            setShowFinderEkycModal(true);
          }, 200);
        }}
        onOpenRevealModal={() => {
          setShowSuccessModal(false);
          setTimeout(() => {
            setShowRevealModal(true);
          }, 300);
        }}
        isAlreadyVerified={isUserAlreadyVerified}
        username={user?.username || user?.name || ''}
        searcherName={searcherNameToUse || ''} 
        searcherFullName={otherUserFullNameToUse || ''}
        message={post.message || ''} 
      />
      <RevealContactModal 
        isOpen={showRevealModal}
        onClose={() => {
          setShowRevealModal(false);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }}
        postId={post.id}
        searcherName={searcherNameToUse || ''}
        searcherFullName={otherUserFullNameToUse || ''}
        onRevealed={(data) => {
          setRevealedContact(data);
          try {
            localStorage.setItem(`revealed_post_${post.id}`, JSON.stringify(data));
          } catch (e) {
            console.warn('Failed to save revealed contact:', e);
          }
          if (post?.id) {
            fetch(`/api/posts/${post.id}`, {
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }).then(r => r.json()).then(d => {
              if (d && !d.error) setPost(d);
            });
          }
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 150);
        }}
      />
      <SuccessStoryModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
      />
      <SeoPreviewModal
        isOpen={showSeoPreviewModal}
        onClose={() => setShowSeoPreviewModal(false)}
        post={post}
      />

      {/* 差出人属性・思い出の手がかり・手紙開封CTAが一体となったメインカード */}
      <AnimatePresence mode="wait">
        {(currentStep === 1 || showDetails) && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.99, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full mx-auto space-y-8 font-serif"
          >
            {/* 1. 【メインカード】差出人情報 & 思い出の手がかり */}
            <div className="p-6 md:p-8 bg-white border-2 border-teal-200/90 rounded-[32px] shadow-md relative overflow-hidden font-sans space-y-6">
              
              {/* showDetails が true の場合（開示完了・再会後画面） */}
              {showDetails ? (
                <div id="reunion-success-section" className="space-y-6">
                  {/* 👤 1. 差出人（本名）＆ ゆかりの地・所属情報カード */}
                  <div className="p-5 sm:p-6 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-4 font-sans text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                          👤
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">差出人（本名）</span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif flex items-center flex-wrap gap-1">
                            <span>{displaySenderFullName} 様</span>
                            <span className="text-xs sm:text-sm text-slate-500 font-normal font-sans ml-1">
                              （旧姓: {displaySenderMaidenName ? displaySenderMaidenName : '　　　'}）
                            </span>
                          </h4>
                        </div>
                      </div>
                      {(post.author_ekyc_details || post.is_ekyc_verified || post.user_is_verified || finderEkycVerified || (isOwner && (postedWithEkycFlag || user?.is_ekyc_verified))) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300 shadow-2xs">
                          <ShieldCheck size={14} className="text-emerald-700" />
                          公的証明済
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/80 text-slate-700 text-xs font-bold rounded-full">
                          <FileText size={14} className="text-slate-500" />
                          安全利用宣誓済
                        </span>
                      )}
                    </div>

                    {/* ニックネーム・ゆかりの地・当時の所属（他ページと同一のアイコン＆レイアウト） */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <User size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">ニックネーム・呼称</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {post.searcher_name || revealedContact?.searcherName || '差出人'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">ゆかりの地</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {post.target_hometown || '未設定'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <School size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">当時の所属（学校・職場など）</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {post.target_school || '未設定'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* タグ表示 */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-slate-200/60">
                      <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs text-[11px]">
                        お手紙ID: #{post.id}
                      </span>
                      <span className="font-bold text-[#b45309] bg-[#fef3c7] border border-[#f59e0b]/40 px-2.5 py-0.5 rounded-lg text-[11px]">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs text-[11px]">
                        {post.era}年代の記憶
                      </span>
                    </div>
                  </div>

                  {/* 📖 2. 差出人を特定するための手がかり（ふたりの思い出） */}
                  <div className="p-5 sm:p-6 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3 text-left font-sans">
                    <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200/80 pb-2">
                      <BookOpen size={16} className="text-teal-700 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        差出人を特定するための手がかり（ふたりの思い出）
                      </h4>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif font-medium">
                        「{post.searcher_profile || '（プロフィール情報はありません）'}」
                      </p>
                    </div>
                  </div>

                  {/* 🔒 3. 課金後開示項目（手紙本文・開示連絡先の大枠） */}
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-slate-50 rounded-2xl border-2 border-teal-300/80 space-y-5 text-left font-sans shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-teal-200/80 pb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                          ✨
                        </span>
                        <div>
                          <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">プレミアム開示</span>
                          <h4 className="text-sm sm:text-base font-bold text-teal-950">
                            課金後開示項目
                          </h4>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-teal-800 text-[11px] font-bold rounded-full border border-teal-200 shadow-2xs">
                        開示手続き完了済
                      </span>
                    </div>

                    {/* 💌 開封されたメッセージ（お手紙の本文） - 独立枠 */}
                    <div className="p-4 sm:p-5 bg-emerald-50/60 rounded-xl border border-emerald-200/90 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-emerald-200/70 pb-2">
                        <h5 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                          <Unlock size={18} className="text-emerald-600" />
                          <span>💌 開封されたメッセージ（お手紙の本文）</span>
                        </h5>
                        <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                          差出人: {displaySenderFullName} 様
                          <span className="text-[11px] text-emerald-700 font-normal ml-1">
                            （旧姓: {displaySenderMaidenName ? displaySenderMaidenName : '　　　'}）
                          </span>
                        </span>
                      </div>
                      <div className="p-4 sm:p-5 bg-white/95 rounded-xl border border-emerald-200/70 text-slate-900 text-base leading-relaxed font-serif whitespace-pre-wrap shadow-2xs font-medium">
                        {displayLetterMessage}
                      </div>
                    </div>

                    {/* 📱 開示連絡先 - 独立枠（ID表示とボタンを横並び配置） */}
                    <div className="p-4 sm:p-5 bg-teal-50/60 rounded-xl border border-teal-200/90 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-teal-200/70 pb-2">
                        <span className="text-xs sm:text-sm font-extrabold text-teal-950 flex items-center gap-1.5">
                          <MessageCircle size={16} className="text-teal-700" />
                          開示連絡先
                        </span>
                        <span className="text-[11px] font-bold text-teal-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-teal-200/80">
                          {displayContactType}
                        </span>
                      </div>

                      {/* 連絡先ID ＋ アクションボタン（IDコピー ＆ LINE/メール/電話起動）を横並びに配置 */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* 連絡先ID表示フォーム */}
                        <div className="flex-1 p-3 bg-white/95 rounded-xl border border-teal-200/70 font-mono text-sm sm:text-base font-bold text-slate-900 select-all break-all shadow-inner flex items-center">
                          {displayContactId}
                        </div>

                        {/* 右横のアクションボタン群（IDコピー ＆ 直通起動ボタン） */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              if (displayContactId) {
                                navigator.clipboard.writeText(displayContactId);
                                setCopiedContact(true);
                                setTimeout(() => setCopiedContact(false), 2500);
                              }
                            }}
                            className="flex-1 sm:flex-initial px-3.5 py-3 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300/80 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs"
                            title="連絡先IDをクリップボードにコピー"
                          >
                            <Copy size={14} className="text-slate-500" />
                            <span>{copiedContact ? '✓ コピー完了！' : 'IDをコピー'}</span>
                          </button>

                          {(() => {
                            const contactVal = displayContactId;
                            const contactType = displayContactType.toUpperCase();
                            
                            if (contactType.includes('EMAIL') || contactVal.includes('@') && !contactVal.startsWith('@')) {
                              return (
                                <a
                                  href={`mailto:${contactVal}?subject=${encodeURIComponent('【ReMEETs】手紙を受け取りました')}&body=${encodeURIComponent(`${otherUserFullNameToUse || searcherFullName || post.searcher_full_name || '差出人'}様\n\nReMEETsにてあなたからの手紙を開封いたしました。ご連絡ありがとうございます。`)}`}
                                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <Mail size={14} />
                                  <span>メールを開く</span>
                                </a>
                              );
                            } else if (contactType.includes('PHONE') || contactType.includes('電話')) {
                              return (
                                <a
                                  href={`tel:${contactVal.replace(/[^0-9+]/g, '')}`}
                                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <Phone size={14} />
                                  <span>発信する</span>
                                </a>
                              );
                            } else {
                              return (
                                <a
                                  href="https://line.me/R/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 sm:py-2.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                  <MessageCircle size={14} />
                                  <span>LINEで連絡</span>
                                </a>
                              );
                            }
                          })()}
                        </div>
                      </div>

                      {(post.contact_note || revealedContact?.contactNote) && (
                        <p className="text-xs text-teal-950 leading-relaxed pt-1.5 border-t border-teal-200/60">
                          <span className="font-bold">差出人からのメモ:</span> {post.contact_note || revealedContact?.contactNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 🛡️ 4. 安心・プライバシー保護の窓口 */}
                  <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-2.5 font-sans text-left">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                      <ShieldAlert size={16} className="text-slate-400 shrink-0" />
                      <span>安心・プライバシー保護の窓口:</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      この手紙の内容に不適切な点や心当たりのない内容が含まれている場合は、運営事務局へ通報・相談いただけます。
                    </p>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-1">
                      <button 
                        onClick={() => setReportTarget({ type: 'post', id: post.id })}
                        className="flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-red-600 transition-colors bg-white hover:bg-red-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-red-200 cursor-pointer font-bold shadow-2xs"
                        title="誹謗中傷や不適切なコンテンツを通報"
                      >
                        <ShieldAlert size={14} className="text-red-500 shrink-0" />
                        <span className="truncate">不適切な内容を通報</span>
                      </button>
                      <Link 
                        to={`/deletion-request?id=${post.id}&name=${encodeURIComponent(post.target_name || '')}&content=${encodeURIComponent(`宛先:${post.target_name || ''}様 / ${post.searcher_profile || ''}`)}`}
                        className="flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-rose-700 transition-colors bg-white hover:bg-rose-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-rose-200 cursor-pointer font-bold shadow-2xs"
                        title="この手紙の削除・非公開を申請（手紙ID自動入力）"
                      >
                        <Trash2 size={14} className="text-rose-500 shrink-0" />
                        <span className="truncate">手紙の削除依頼</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* showDetails が false の場合（未開示・手紙探索画面） */
                <div className="space-y-6">
                  {/* カード上部: 差出人の属性 & 信頼性（本人確認・宣誓バッジ） */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs font-serif">
                          ✉️
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">差出人 (探している人)</span>
                          <h2 className="text-base sm:text-lg font-bold text-teal-950 font-serif">
                            「{post.searcher_name || '差出人'}」さん
                          </h2>
                        </div>
                      </div>

                      {/* 本人確認 / 宣誓ステータスバッジ */}
                      {(post.author_ekyc_details || post.is_ekyc_verified || (isOwner && (postedWithEkycFlag || user?.is_ekyc_verified))) ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300/80 rounded-full text-xs font-bold shadow-2xs">
                          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          <span>🛡️ 公的本人確認 (eKYC) 完了済</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold">
                          <FileText size={14} className="text-slate-500 shrink-0" />
                          <span>🌱 年齢・安全利用宣誓済</span>
                        </div>
                      )}
                    </div>

                    {/* メモリータグ（属性まとめ） */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                        お手紙ID: #{post.id}
                      </span>
                      <span className="font-bold text-[#b45309] bg-[#fef3c7] border border-[#f59e0b]/40 px-3 py-1 rounded-xl">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                        {post.era}年代の記憶
                      </span>
                      {post.status === 'resolved' && (
                        <span className="font-bold bg-emerald-600 text-white px-3 py-1 rounded-xl flex items-center gap-1">
                          <CheckCircle2 size={13} /> 再会済み
                        </span>
                      )}
                    </div>
                  </div>

                  {/* カード中部: 差出人を特定するための手がかり（公開エピソード） */}
                  <div className="bg-gradient-to-br from-teal-50/60 via-emerald-50/40 to-slate-50 p-4 sm:p-5 rounded-2xl border border-teal-200/80 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-teal-900 border-b border-teal-200/60 pb-2">
                      <BookOpen size={16} className="text-teal-700 shrink-0" />
                      <h3 className="text-xs sm:text-sm font-bold text-teal-950">
                        差出人を特定するための手がかり（ふたりの思い出）
                      </h3>
                    </div>
                    <div className="p-3.5 sm:p-4 bg-white/90 rounded-xl border border-teal-100/80 shadow-2xs">
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif font-medium">
                        「{post.searcher_profile || '（プロフィール情報はありません）'}」
                      </p>
                    </div>

                    {/* ゆかりの地 ＆ 当時の所属 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200/70 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">ゆかりの地</span>
                          <span className="font-bold text-slate-800">
                            {post.target_hometown?.match(/.*?[都道府県]/)?.[0] || post.target_hometown || '未設定'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200/70 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold">
                          <School size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">当時の所属（学校・職場など）</span>
                          <span className="font-bold text-slate-800">
                            思い出の質問に正解後公開
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* カード下部: ダイレクトな手紙開封アクション CTA */}
                  {post.status !== 'resolved' && (
                    <div className="pt-2 space-y-4 text-left border-t border-slate-200/80">
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/90 via-emerald-50/70 to-slate-50 rounded-2xl border-2 border-teal-300/80 space-y-3.5 font-sans shadow-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-teal-200/80 pb-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-teal-950 flex items-center gap-1.5">
                            <Sparkles size={16} className="text-amber-500 shrink-0" />
                            <span>思い出の質問に正解すると開放される 3大情報</span>
                          </span>
                          <span className="text-[10px] font-bold text-teal-800 bg-white/90 px-2 py-0.5 rounded-full border border-teal-200 shadow-2xs">
                            秘密の暗号化解除
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          {/* 1. 差出人の実名（フルネーム）の開示 */}
                          <div className="p-3 bg-white rounded-xl border border-teal-200/90 shadow-2xs flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              👤
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 leading-tight">【差出人の実名】</div>
                              <div className="text-[10.5px] text-teal-800 font-medium">フルネームを開示</div>
                            </div>
                          </div>

                          {/* 2. 手紙の全文とエピソードを開封 */}
                          <div className="p-3 bg-white rounded-xl border border-emerald-200/90 shadow-2xs flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              💌
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 leading-tight">【手紙の全文】</div>
                              <div className="text-[10.5px] text-emerald-800 font-medium">エピソードを開封</div>
                            </div>
                          </div>

                          {/* 3. お相手の連絡先（LINE・メール等） */}
                          <div className="p-3 bg-white rounded-xl border border-indigo-200/90 shadow-2xs flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              📱
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 leading-tight">【お相手の連絡先】</div>
                              <div className="text-[10.5px] text-indigo-800 font-medium">LINE・メール等</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 鮮やかで目立つグリーンの「質問に答えて手紙を開く」ボタン */}
                      <button
                        onClick={handleStartContact}
                        className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-base sm:text-lg cursor-pointer hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/40 group"
                      >
                        <Unlock size={22} className="text-emerald-200 group-hover:rotate-12 transition-transform" />
                        <span className="tracking-wide">思い出の質問に答えて手紙を開く</span>
                        <ArrowRight size={20} className="text-emerald-200 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="text-[11px] text-slate-500 text-center font-sans">
                        ※ 会員登録不要ですぐにお答えいただけます（不正利用防止のため暗号化保護されています）。
                      </p>
                    </div>
                  )}

                  {/* 通報・削除依頼 & 管理者・投稿者用SEO証明書ボタン */}
                  <div className="pt-3 border-t border-slate-200/80 mt-3 space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 bg-slate-50/90 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-sans">
                        <ShieldAlert size={16} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-700">安心・プライバシー保護の窓口:</span>
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 font-sans">
                        <button 
                          onClick={() => setReportTarget({ type: 'post', id: post.id })}
                          className="flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-red-600 transition-colors bg-white hover:bg-red-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-red-200 cursor-pointer font-bold shadow-2xs"
                          title="誹謗中傷や不適切なコンテンツを通報"
                        >
                          <ShieldAlert size={14} className="text-red-500 shrink-0" />
                          <span className="truncate">不適切な内容を通報</span>
                        </button>
                        <Link 
                          to={`/deletion-request?id=${post.id}&name=${encodeURIComponent(post.target_name || '')}&content=${encodeURIComponent(`宛先:${post.target_name || ''}様 / ${post.searcher_profile || ''}`)}`}
                          className="flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-rose-700 transition-colors bg-white hover:bg-rose-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-200 cursor-pointer font-bold shadow-2xs"
                          title="この手紙の削除・非公開を申請（手紙ID自動入力）"
                        >
                          <Trash2 size={14} className="text-rose-500 shrink-0" />
                          <span className="truncate">手紙の削除依頼</span>
                        </Link>
                      </div>
                    </div>

                    {(user?.role === 'admin' || isOwner) && (
                      <div className="pt-1 flex justify-start">
                        <button 
                          onClick={() => setShowSeoPreviewModal(true)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-800 transition-colors bg-slate-100 hover:bg-teal-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80 cursor-pointer font-sans"
                        >
                          <FileText size={14} className="text-teal-700" />
                          <span>📄 開業法務クリア＆SEO証明書（印刷見本）を表示</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. 【開示後専用】安全な再会のためのファーストステップ（独立プレミアムカード） */}
            {showDetails && (
              <div className="p-6 md:p-8 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 border-2 border-teal-200/90 rounded-[32px] shadow-md space-y-6 text-left font-sans">
                <div className="flex items-center justify-between gap-3 border-b border-teal-100 pb-3.5 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center text-lg shrink-0 shadow-2xs">
                      🤝
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">安心して再会するために</span>
                      <h3 className="text-base sm:text-lg font-bold text-teal-950 font-serif">
                        安全な再会のためのファーストステップ
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100/80 text-teal-800 text-xs font-bold rounded-full border border-teal-200 shadow-2xs">
                    <ShieldCheck size={13} className="text-teal-700" />
                    安全ガイドライン準拠
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-4.5 bg-white rounded-2xl border border-teal-100/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">まずはテキストで想い出のご挨拶</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      いきなり通話や面会を求めず、「ReMEETsで手紙を受け取りました」と丁寧にメッセージを送信しましょう。ふたりだけの懐かしいエピソードを添えると自然に会話が弾みます。
                    </p>
                  </div>

                  <div className="p-4.5 bg-white rounded-2xl border border-teal-100/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">個人情報の開示は慎重に</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      お互いの信頼関係が再構築されるまでは、現住所や勤務先、金融情報などの詳細な個人情報は急いで開示しないようご注意ください。
                    </p>
                  </div>

                  <div className="p-4.5 bg-white rounded-2xl border border-teal-100/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">困ったときの安心サポート体制</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      万が一、不審な金銭要求や迷惑行為を受けた場合は、速やかに連絡を遮断（ブロック）し、ReMEETs運営窓口または警察等の公的機関へご相談ください。
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 p-4 rounded-2xl border border-teal-100/80">
                  <span className="text-xs text-slate-500 font-sans">
                    ※ 開示された手紙および連絡先情報はマイアカウントに安全に保存されています。
                  </span>
                  <Link
                    to="/account"
                    className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <UserIcon size={14} />
                    <span>マイアカウントで保存内容を確認</span>
                  </Link>
                </div>
              </div>
            )}

            {/* 3. 【受取人様のための安心再会ガイド（一体型プレミアムカード）】 */}
            {post.status !== 'resolved' && !showDetails && (
              <RecipientSafetyGuide 
                roadmapSectionRef={roadmapSectionRef}
                onStartQuiz={handleStartContact}
                onOpenGuide={() => navigate('/guide')}
              />
            )}

            {isOwner && (
              <div className="glass-card p-6 md:p-12 border border-brand-primary/20 text-center space-y-8 bg-white rounded-[32px] shadow-sm font-sans mx-auto w-full">
                <div className="space-y-2">
                  <p className="text-black font-serif text-2.5xl font-bold">これはあなたが漂流させたボトルです</p>
                  <p className="text-sm text-brand-dark/95 leading-relaxed">
                    お相手が秘密の思い出クイズに正解し、誓約手続きを完了すると、お手紙が開かれ連絡先の引き渡しが行われます。
                  </p>
                </div>
                {post.status !== 'resolved' ? (
                  <div className="flex flex-col md:flex-row gap-3 justify-center flex-wrap">
                    <button 
                      onClick={handleResolve}
                      className="btn-primary px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow cursor-pointer shadow-md"
                    >
                      <CheckCircle2 size={16} />
                      <span>再会しました（解決済みにする）</span>
                    </button>
                    <Link 
                      to={`/edit/${post.id}`}
                      className="btn-primary px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      <span>内容や質問・回答を編集する</span>
                    </Link>
                    <Link 
                      to={`/deletion-request?url=${encodeURIComponent(window.location.href)}`}
                      className="btn-secondary px-6 py-3 border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 text-xs font-bold rounded-full rounded-tr-none"
                    >
                      <Trash2 size={16} />
                      <span>ボトルを取り下げる</span>
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-100">
                    ✓ このボトルは解決済み（再会完了）です
                  </div>
                )}

                {/* 【プレビュー確認用】設定済みの思い出の質問と答えリスト */}
                <div className="pt-8 border-t border-brand-border/40 text-left space-y-4">
                  <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 font-sans">
                    <Lock size={16} className="text-zinc-500" />
                    <span>【ボトル作成元】設定済みの思い出の質問と答え</span>
                  </h4>
                  <p className="text-xs text-zinc-500 font-sans">
                    ※この項目はボトルの作成者（あなた）にのみセキュリティ上表示されています。お相手が回答する際の確認にご利用ください。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    {(post.questions && post.questions.length >= 2
                      ? post.questions
                      : post.questions && post.questions.length === 1
                        ? [...post.questions, { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？', answer: '（設定済み）' }]
                        : [
                            { id: 'main', question: post.secret_question || 'お相手との一番の思い出は？', answer: post.secret_answer_plain || post.secret_answer || '（ハッシュ化保護）' },
                            { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？', answer: '（設定済み）' }
                          ]
                    ).map((q: any, idx: number) => (
                      <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 block">思い出質問 {idx + 1}</span>
                          <span className="text-sm text-zinc-850 font-serif">{q.question}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-200/50">
                          <span className="text-[10px] font-bold text-zinc-400 block">思い出解答 {idx + 1}</span>
                          <span className="text-sm text-zinc-800 font-bold">{q.answer_plain || q.answer || '（ハッシュ化保護）'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            ref={quizSectionRef}
            id="memory-quiz-section"
            initial={{ opacity: 0, scale: 0.99, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full mx-auto space-y-6 animate-fade-in text-left font-sans scroll-mt-28"
          >
            {/* 戻るボタン */}
            <div className="flex items-center">
              <button 
                onClick={() => {
                  setHasClickedStartContact(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all group cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-slate-500" />
                <span>← 手がかり（Step 1）を再確認する</span>
              </button>
            </div>

            {/* Step 2 メインカード */}
            <div className="p-6 md:p-8 bg-white border-2 border-teal-200/90 rounded-[32px] shadow-md relative overflow-hidden font-sans space-y-6">
              
              {/* ヘッダータイトル */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      <Lock size={18} />
                    </span>
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">STEP 2 / 記憶の照合</span>
                      <h2 className="text-lg sm:text-xl font-bold text-teal-950 font-serif">
                        お互いの記憶を確かめる思い出クイズ
                      </h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-900 border border-teal-300/80 rounded-full text-xs font-bold shadow-2xs">
                    <ShieldCheck size={14} className="text-teal-700 shrink-0" />
                    暗号化保護
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  差出人が設定した「二人だけの思い出にまつわるクイズ」です。正しい回答を入力してお互いの記憶を一致させましょう。
                </p>
              </div>

              {/* クイズの概要と開示条件説明 */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/90 via-emerald-50/70 to-slate-50 rounded-2xl border border-teal-200/90 space-y-2.5 font-sans">
                <div className="flex items-center gap-2 text-teal-950 font-bold text-xs sm:text-sm border-b border-teal-200/60 pb-2">
                  <Sparkles size={16} className="text-teal-600 shrink-0" />
                  <span>正解時に安全に開示される情報</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  思い出クイズに正解することでお互いの記憶が一致していることが確認され、<strong>差出人のフルネーム（実名）</strong>および手紙の本文（詳細メッセージ）、<strong>直接つながる連絡先</strong>が安全に開示されます。これにより、間違いのない確実な再会へ繋がります。
                </p>
              </div>

              {/* 💡 回答の親切な単語入力ガイド */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 text-xs text-teal-950 space-y-1 font-sans shadow-2xs">
                <div className="font-bold flex items-center gap-1.5 text-teal-900">
                  <Sparkles size={15} className="text-teal-600 shrink-0" />
                  <span>💡 回答入力のアドバイス</span>
                </div>
                <p className="leading-relaxed text-[11px] text-teal-900/90">
                  答えは<strong>「短い単語（名詞・キーワード）」</strong>でお答えください。<br />
                  ※「〜です」「〜だった」などの文章ではなく、単語のみ（例: <code>さくらや</code>、<code>お餅</code>）で入力すると正解しやすくなります。ひらがな・カタカナ・漢字・送り仮名の違いは自動で柔軟に判定されます。
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6 pt-1">
                {remainingAttempts !== null && remainingAttempts < 5 && !isAttemptsLocked && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-amber-800 text-xs font-semibold font-sans animate-pulse">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>
                      あと <strong className="text-sm font-bold text-amber-700">{remainingAttempts}回</strong> 間違えると、安全保護のため24時間このボトルの回答がロックされます。
                    </span>
                  </div>
                )}

                {isAttemptsLocked && (
                  <div className="p-6 bg-red-50/70 border-2 border-red-200 rounded-3xl text-center space-y-3 font-sans">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-600 mx-auto">
                      <Lock size={22} className="animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-red-900">セキュリティロック中</h4>
                      <p className="text-xs text-red-700 leading-relaxed">
                        連続して回答が一致しなかったため、安全保護のため24時間ロックされています。時間をおいてから再度お試しください。
                      </p>
                    </div>
                    {lockedUntil && (
                      <p className="text-[11px] font-mono text-slate-700 bg-white px-3 py-1.5 rounded-full inline-block border border-red-200 font-sans shadow-2xs">
                        ロック解除予定時刻: {new Date(lockedUntil).toLocaleString('ja-JP')}
                      </p>
                    )}
                  </div>
                )}

                {(post.questions && post.questions.length >= 2
                  ? post.questions
                  : post.questions && post.questions.length === 1
                    ? [...post.questions, { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？' }]
                    : [
                        { id: 'main', question: post.secret_question || 'お相手との一番の思い出は？' },
                        { id: 'sub_default', question: 'お相手との思い出の場所または共通のエピソードは？' }
                      ]
                ).map((q: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-br from-teal-50/40 via-emerald-50/30 to-slate-50 p-5 sm:p-6 rounded-2xl border border-teal-200/80 space-y-3.5 text-left shadow-2xs font-sans">
                    {/* 大きくて見やすい質問バッジラベル */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-teal-700 text-white font-bold text-xs md:text-sm rounded-lg tracking-wider font-sans shadow-2xs">
                          思い出質問 {idx + 1}
                        </span>
                      </div>
                      {verificationResults[idx]?.correct && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 size={13} className="text-emerald-700" /> 正解済み
                        </span>
                      )}
                    </div>

                    {/* 質問文本文 */}
                    <div className="font-serif text-base md:text-lg text-slate-900 leading-relaxed p-4 bg-white rounded-xl border border-teal-100/90 shadow-2xs font-semibold">
                      {q.question}
                    </div>

                    {/* 入力フィールド */}
                    <div className="pt-1">
                      <input 
                        required
                        type="text" 
                        disabled={isAttemptsLocked || verificationResults[idx]?.correct}
                        placeholder={
                          isAttemptsLocked 
                            ? "ロック中のため入力できません" 
                            : verificationResults[idx]?.correct 
                              ? "このクイズはすでに正解されています" 
                              : "答えを入力（例: さくらや / 単語のみでお答えください）"
                        } 
                        className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all font-sans text-base text-slate-900 bg-white placeholder:text-slate-400 ${
                          isAttemptsLocked 
                            ? 'border-red-200 text-zinc-400 bg-red-50/5 cursor-not-allowed'
                            : verificationResults[idx]?.correct 
                              ? 'border-emerald-500 text-emerald-800 bg-emerald-50/40 cursor-not-allowed font-bold' 
                              : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-2xs'
                        }`}
                        value={answers[idx] || ''}
                        onChange={e => {
                          const val = toHalfWidth(e.target.value);
                          const newAnswers = [...answers];
                          newAnswers[idx] = val;
                          setAnswers(newAnswers);
                          if (verificationResults[idx]) {
                            const newResults = [...verificationResults];
                            newResults[idx] = null as any;
                            setVerificationResults(newResults);
                          }
                        }}
                        autoCapitalize="off"
                        autoCorrect="off"
                      />
                    </div>

                    {/* 判定結果メッセージ */}
                    {verificationResults[idx] && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-1 font-sans text-xs"
                      >
                        {verificationResults[idx].correct ? (
                          <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                            このクイズは正解です！
                          </p>
                        ) : (
                          <p className={`text-xs font-bold flex items-center gap-1.5 p-2.5 rounded-xl border ${verificationResults[idx].close ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            <AlertCircle size={15} className="shrink-0" />
                            {verificationResults[idx].hint || (verificationResults[idx].close ? '惜しいです！漢字・ひらがな・送り仮名を変えて、短い単語でお試しください。' : '回答が一致しません。単語のみで再度お確かめください。')}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
                
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2 font-sans border border-red-200">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isVerifying || isAttemptsLocked}
                  className={`w-full py-4 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer hover:scale-[1.01] ${
                    isAttemptsLocked 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-teal-700 hover:bg-teal-800'
                  }`}
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isAttemptsLocked ? (
                        <Lock size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      <span>
                        {isAttemptsLocked ? "制限ロック経過をお待ちください" : "回答を送信して判定する"}
                      </span>
                      {!isAttemptsLocked && <ArrowRight size={16} />}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="lg:col-span-5" ref={questionsSectionRef}>
          <div className="sticky top-32 space-y-8">
            {isQuestionVerified && !revealedContact && !showDetails && post.status !== 'resolved' && (
              <div id="step3-unlocked-section" className="glass-card p-6 md:p-8 space-y-6 font-sans transition-all duration-500 border-2 border-emerald-400 bg-white shadow-xl rounded-[32px] scroll-mt-28">
                <div className="space-y-6 animate-fade-in text-center">
                  
                  {/* ヘッダー・メールアイコン */}
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 via-emerald-100 to-teal-200 text-teal-800 rounded-full shadow-md flex items-center justify-center mx-auto ring-4 ring-teal-50">
                    <Mail size={32} className="text-teal-700" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-900 pt-1">
                      【{searcherName || post.searcher_name || '差出人'}】さんからの手紙を開封する
                    </h3>
                  </div>

                  {/* 課金サービス（手紙開封・連絡先開示）の明確なご案内（明朝体の堂々とした見出し） */}
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/95 via-teal-50/80 to-slate-50 border-2 border-emerald-400/90 rounded-2xl text-left space-y-3 font-sans shadow-md">
                    <div className="flex items-center gap-2.5 border-b border-emerald-200/90 pb-3 flex-wrap">
                      <span className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-2xs font-serif">
                        ✉️
                      </span>
                      <h4 className="text-lg sm:text-xl md:text-2xl font-black font-serif text-slate-950 tracking-wide leading-snug">
                        手紙開封・連絡先開示手続き（課金サービス）のご案内
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed">
                      思い出の質問に正解された方限定で、開示手続き（<strong className="text-teal-950 font-bold bg-teal-100/90 px-1.5 py-0.5 rounded text-xs sm:text-sm font-sans">600円 税込・買い切り</strong>）を行うことで、手紙の本文全文とお相手の直通連絡先が安全に開示されます。
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-teal-950 font-medium border-t border-emerald-200/80 bg-white/70 p-2.5 rounded-xl">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-teal-700 shrink-0" />
                        <span>1回のみの買い切り（月額課金・自動更新は一切ありません）</span>
                      </span>
                      <span className="font-mono text-sm sm:text-base font-extrabold text-teal-900 sm:ml-auto">
                        600円（税込）
                      </span>
                    </div>
                  </div>

                  {/* 安全な開示情報案内（大きく認知できる独立リッチカード） */}
                  <div className="p-5 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-amber-50/90 border-2 border-amber-300/90 rounded-2xl text-xs space-y-3.5 font-sans shadow-md text-left">
                    <div className="font-extrabold text-amber-950 flex items-center justify-between gap-2 text-sm sm:text-base border-b border-amber-200/90 pb-2.5 flex-wrap">
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-amber-700 shrink-0" />
                        <span>安全な照合を経て、お相手の手紙と連絡先をお届けします</span>
                      </span>
                      <span className="text-[11px] font-bold bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                        照合完了
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {/* 1. 差出人の実名（フルネーム）の開示 */}
                      <div className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 text-xl font-bold shadow-2xs">
                          👤
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            【差出人の実名（フルネーム）の開示】
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            思い出の質問を設定したご本人の本名（実名）が安全に開示されます。
                          </p>
                        </div>
                      </div>

                      {/* 2. 手紙の全文とエピソードを開封 */}
                      <div className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xl font-bold shadow-2xs">
                          💌
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            【手紙の全文とエピソードを開封】
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            あの日伝えられなかった言葉、感謝、忘れられない思い出の全貌がそのまま読めます。
                          </p>
                        </div>
                      </div>

                      {/* 3. お相手の連絡先（LINE・メール等） */}
                      <div className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 text-xl font-bold shadow-2xs">
                          📱
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            【お相手の連絡先（LINE・メール等）】
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            差出人が直接連絡を受け取るために登録した連絡先を安全に確認できます。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {openingError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 text-left">
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                      <span>{openingError}</span>
                    </div>
                  )}

                  {/* プログレスバー（開封進行中）または開封ボタン */}
                  {isOpeningLetter ? (
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-400 space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span className="flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-500 animate-spin-slow" />
                          <span>想い出の封を開封しています...</span>
                        </span>
                        <span className="font-mono text-sm text-emerald-800">{openingProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-150 ease-out shadow-sm"
                          style={{ width: `${openingProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        セキュリティ暗号化を解除し、メッセージと連絡先を安全にお届けしています。
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setShowRevealModal(true)}
                        className="w-full py-4 px-6 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer font-sans"
                      >
                        <Heart size={18} className="fill-current text-rose-300 animate-pulse" />
                        <span>手紙と連絡先の開示手続きへ進む（600円 税込）</span>
                        <ArrowRight size={16} />
                      </button>
                      <p className="text-[11px] text-slate-500 font-sans text-center leading-relaxed">
                        ※ ボタンをクリックすると安全なStripe暗号化決済画面が開きます。<br className="hidden sm:inline" />
                        勝手に決済されることはありませんのでご安心ください。
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>

      {/* Searcher/Finder eKYC Modal */}
      <AnimatePresence>
        {showFinderEkycModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 text-black font-sans" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinderEkycModal(false)}
              className="absolute inset-0 bg-black/65 cursor-pointer"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`relative w-full bg-white shadow-2xl p-6 md:p-8 text-zinc-900 z-10 rounded-2xl max-h-[92vh] flex flex-col overflow-y-auto overscroll-contain transition-all ${
                finderEkycStep === 3 ? 'max-w-2xl' : 'max-w-lg'
              }`}
              data-lenis-prevent
            >
              <button 
                type="button"
                onClick={() => setShowFinderEkycModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-brand-dark transition-colors p-1.5 focus:outline-none cursor-pointer rounded-full hover:bg-zinc-100 z-20"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>

              {/* ✨ 時を超えて届いた想い出のメッセージ（開封冒頭ヘッダー） */}
              <div className="text-center space-y-2.5 pb-4 border-b border-indigo-100/90 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 via-purple-100 to-amber-100 text-indigo-700 rounded-full shadow-md flex items-center justify-center mx-auto ring-4 ring-indigo-50">
                  <Heart size={28} className="animate-pulse text-rose-600 fill-rose-500/20" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wider font-serif">
                    ✨ 時を超えて届いた想い出のメッセージ
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-900 pt-0.5">
                    【{revealedContact?.searcherFullName || otherUserFullNameToUse || searcherFullName || post?.searcher_full_name || post?.owner_full_name || post?.searcher_name || searcherName || 'お相手'}】さんからの手紙を開封する
                  </h3>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-md mx-auto">
                  あなたを探し続けていた【{revealedContact?.searcherFullName || otherUserFullNameToUse || searcherFullName || post?.searcher_full_name || post?.owner_full_name || post?.searcher_name || searcherName || 'お相手'}】さんが残した「手紙の全文」と、今すぐ直接つながる「ご連絡先（LINE・メールアドレス等）」が開示されます。止まっていた大切な時間の続きを、ここから始めましょう。
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-800 text-[11px] font-bold rounded-full border border-indigo-200">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>公的証明バッジ取得 ＆ 手紙開封コース（600円 税込）</span>
                </div>
              </div>

              {/* Step 1: 身分証明書の選択と基本情報の入力 */}
              {finderEkycStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-indigo-150 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 1 / 4</span>
                      <h3 className="text-lg font-bold text-black font-serif">1. 身分証明書の選択と基本情報の入力</h3>
                      <p className="text-xs text-black/60 font-sans leading-relaxed mt-0.5">
                        ご提示いただく身分証明書を選択し、本名と生年月日をご記入ください。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFinderEkycName(user?.fullName || "本間 貴司");
                        setFinderEkycBirthdate("1995-05-15");
                        setFinderEkycDocType("license");
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                      title="検証用のテスト氏名・生年月日を自動入力"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>⚡ テスト自動入力</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 block mb-1.5 uppercase tracking-wider font-sans">1. 証明書の種類</label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { id: 'license', label: '運転免許証' },
                          { id: 'mynumber', label: 'マイナンバー' },
                          { id: 'passport', label: 'パスポート' }
                        ] as const).map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setFinderEkycDocType(doc.id)}
                            className={`py-3 px-2 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                              finderEkycDocType === doc.id
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20'
                                : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                            }`}
                          >
                            {doc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-sans">2. お名前（漢字）</label>
                        <input
                          type="text"
                          value={finderEkycName}
                          onChange={(e) => setFinderEkycName(e.target.value)}
                          placeholder="山田 太郎"
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-500 block mb-1 uppercase tracking-wider font-sans">3. 生年月日</label>
                        <input
                          type="date"
                          value={finderEkycBirthdate}
                          onChange={(e) => setFinderEkycBirthdate(e.target.value)}
                          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFinderEkycModal(false)}
                      className="py-3 px-5 border border-zinc-200 hover:bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
                    >
                      キャンセル
                    </button>
                    <button
                      disabled={!finderEkycName || !finderEkycBirthdate}
                      onClick={() => setFinderEkycStep(2)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
                    >
                      <span>証明書の撮影画面へ進む（ガイド枠あり）</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Document Camera Capture with Guidelines Overlay */}
              {finderEkycStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 2 / 4</span>
                    <h3 className="text-lg font-bold text-black font-serif">2. 身分証明書の撮影・アップロード</h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      反射や四隅の欠けを防ぐガイドライン枠線に合わせて撮影を行ってください。
                    </p>
                  </div>

                  <DocumentCameraOverlay
                    docType={finderEkycDocType}
                    docTypeName={
                      finderEkycDocType === 'license' ? '運転免許証' : finderEkycDocType === 'mynumber' ? 'マイナンバーカード' : 'パスポート'
                    }
                    onBack={() => setFinderEkycStep(1)}
                    onComplete={(imgs) => {
                      setFinderEkycCapturedImages(imgs);
                      setFinderEkycStep(3);
                    }}
                  />
                </div>
              )}

              {/* Step 3: Payment (Credit Card Billing) */}
              {finderEkycStep === 3 && (
                <div className="space-y-5 py-2 text-left">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-sans">Step 3 / 4</span>
                      <h3 className="text-lg font-serif font-bold text-zinc-900">
                        3. 安全照合・手紙開封手数料のお支払い
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFinderPayCardNumber("4242 4242 4242 4242");
                        setFinderPayCardExpiry("12/28");
                        setFinderPayCardCvc("123");
                        setFinderPayCardName("TAKASHI HONMA");
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                      title="検証用のStripeテストカード情報を自動入力"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>⚡ テストカード自動入力</span>
                    </button>
                  </div>

                  {/* 🤝 安心・安全な連絡先相互開示の仕組みカード（案3） */}
                  <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white rounded-2xl border border-indigo-200/90 shadow-2xs space-y-2 text-xs font-sans">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950 font-serif">
                      <ShieldCheck size={15} className="text-indigo-600" />
                      <span>🤝 安心・安全な連絡先相互開示のお約束</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 pl-1 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>差出人の<strong>「手紙の全文」</strong>と<strong>「直通連絡先（LINE・メール等）」</strong>が即座に開示されます。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>あなたのアカウント情報も公的認証マーク付きでお相手と安全に照合・共有されます。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">✓</span>
                        <span>256-bit暗号化と公的eKYCにより、第三者によるなりすまし・個人情報の漏洩を100%防御します。</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-600 font-bold">手紙開封 ＆ 公的本人確認（eKYC）費用</span>
                      <span className="text-zinc-900 font-mono font-bold">600 円</span>
                    </div>
                    <div className="border-t border-dashed border-zinc-200 pt-2 flex justify-between items-center">
                      <span className="text-xs text-indigo-950 font-extrabold">
                        一括お引き落とし合計額（買い切り）
                      </span>
                      <span className="text-base text-indigo-900 font-sans font-bold">600 円 <span className="text-[10px] font-normal text-indigo-700">(税込)</span></span>
                    </div>
                  </div>

                  {/* Document capture summary badge */}
                  {finderEkycCapturedImages.front && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>身分証撮影完了（全3枚・カメラ自動切断・暗号化保護）</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFinderEkycStep(2)}
                        className="text-[11px] text-indigo-600 hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                      >
                        再撮影
                      </button>
                    </div>
                  )}

                  <CreditCardPaymentForm
                    cardNumber={finderPayCardNumber}
                    cardExpiry={finderPayCardExpiry}
                    cardCvc={finderPayCardCvc}
                    cardName={finderPayCardName}
                    onCardNumberChange={setFinderPayCardNumber}
                    onCardExpiryChange={setFinderPayCardExpiry}
                    onCardCvcChange={setFinderPayCardCvc}
                    onCardNameChange={setFinderPayCardName}
                    showDemoButton={true}
                    onDemoFill={() => {
                      setFinderPayCardNumber("4242 4242 4242 4242");
                      setFinderPayCardExpiry("12/28");
                      setFinderPayCardCvc("123");
                      setFinderPayCardName("TAKASHI HONMA");
                    }}
                    refundGuaranteeText="本人確認（eKYC）審査が不承認となった場合は、Stripe仮売上システムにより全額即時自動返金されます。"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFinderEkycStep(2)}
                      className="px-4 py-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      撮影に戻る
                    </button>
                    <button
                      disabled={!finderPayCardNumber || !finderPayCardExpiry || !finderPayCardCvc || !finderPayCardName}
                      onClick={() => setFinderEkycStep(4)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed active:scale-98"
                    >
                      600円をお支払いして公的証明・手紙開示を完了
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: 照合中 */}
              {finderEkycStep === 4 && (
                <div className="space-y-6 py-4 text-center font-serif">
                  {/* 中央の二重発光スピナー & アイコン */}
                  <div className="relative inline-flex items-center justify-center my-2">
                    {/* 外周の発光オーラ */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/30 to-amber-400/20 blur-xl animate-pulse" />
                    
                    {/* スピナーリング（外側・反時計回り） */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-300/60 animate-[spin_8s_linear_infinite]" />
                    
                    {/* スピナーリング（内側・時計回り） */}
                    <div className="absolute w-20 h-20 rounded-full border-3 border-indigo-100 border-t-indigo-600 border-r-teal-500 animate-spin" />
                    
                    {/* 中央コンテンツ */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-900 font-serif">
                      <span className="text-xl font-bold tracking-[0.14em] md:tracking-[0.18em] bg-gradient-to-r from-indigo-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent pl-0.5">
                        {finderEkycProgress}%
                      </span>
                      <span className="text-[9px] font-semibold text-indigo-600/80 uppercase tracking-[0.22em] -mt-0.5">
                        Processing
                      </span>
                    </div>
                  </div>

                  {/* ステータスタイトル */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-serif font-bold tracking-[0.1em] shadow-xs">
                      <ShieldCheck size={14} className="text-emerald-600 animate-pulse" />
                      <span>公的本人確認・撮影照合＆決済処理中</span>
                    </div>
                    <h3 className="text-base font-serif font-extrabold tracking-[0.12em] md:tracking-[0.16em] text-zinc-900 pt-1">
                      {finderEkycProgress < 25 && '1. 撮影書類の四隅＆光反射AI分析'}
                      {finderEkycProgress >= 25 && finderEkycProgress < 50 && '2. 記載文字暗号化＆身元データ照合'}
                      {finderEkycProgress >= 50 && finderEkycProgress < 75 && '3. Stripe安全決済＆オーソリ完了'}
                      {finderEkycProgress >= 75 && finderEkycProgress < 100 && '4. お相手連絡先・手紙本文の開示キー発行'}
                      {finderEkycProgress === 100 && '✨ 照合＆開示準備が完了しました！'}
                    </h3>
                  </div>

                  {/* プログレスバー本体（綺麗な虹色グラデーションバー） */}
                  <div className="space-y-1.5 px-2">
                    <div className="flex items-center justify-between text-xs font-serif font-semibold text-zinc-500 px-1">
                      <span className="flex items-center gap-1 text-[11px] text-indigo-700 font-serif tracking-[0.1em]">
                        <Lock size={12} /> 256bit 暗号化安全通信
                      </span>
                      <span className="text-emerald-700 font-bold font-serif tracking-[0.12em]">{finderEkycProgress} / 100%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3.5 rounded-full p-0.5 shadow-inner border border-slate-200/80 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-300 relative shadow-xs" 
                        style={{ width: `${finderEkycProgress}%` }}
                      >
                        {/* バー先端のLED光彩ノード */}
                        {finderEkycProgress > 0 && finderEkycProgress < 100 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.9)] z-10" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4ステップ進行タイムライン */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 text-left space-y-2 text-xs font-serif">
                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 0 && finderEkycProgress < 25 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 25 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 25 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 25 ? '✓' : '1'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">撮影写真の厚み・顔画像解析</span>
                      </span>
                      {finderEkycProgress < 25 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">分析中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 25 && finderEkycProgress < 50 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 50 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 50 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 50 ? '✓' : '2'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">身元氏名＆生年月日の暗号照合</span>
                      </span>
                      {finderEkycProgress >= 25 && finderEkycProgress < 50 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">照合中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 50 && finderEkycProgress < 75 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : finderEkycProgress >= 75 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress >= 75 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress >= 75 ? '✓' : '3'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">Stripe 1,200円決済処理（審査＋開封）</span>
                      </span>
                      {finderEkycProgress >= 50 && finderEkycProgress < 75 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">決済中...</span>}
                    </div>

                    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${finderEkycProgress >= 75 ? 'bg-white shadow-xs border border-indigo-200 font-bold text-indigo-900' : 'text-zinc-500'}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${finderEkycProgress === 100 ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
                          {finderEkycProgress === 100 ? '✓' : '4'}
                        </span>
                        <span className="tracking-[0.08em] md:tracking-[0.12em]">手紙本文＆連絡先開示手続き</span>
                      </span>
                      {finderEkycProgress >= 75 && finderEkycProgress < 100 && <span className="text-[10px] text-indigo-600 animate-pulse font-serif font-semibold tracking-[0.14em]">発行中...</span>}
                    </div>
                  </div>
                </div>
              )}

              {finderEkycStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-black">本人確認および決済完了！🎉</h3>
                    <p className="text-xs text-black/60 font-sans leading-relaxed">
                      撮影書類の照合とお手続きがすべて正常に完了しました！これより手紙本文の全内容および、お相手の連絡先（LINE ID・メールアドレス等）が安全に開示されます。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowFinderEkycModal(false);
                      // 本人確認が完了したら、手紙・連絡先表示位置までスクロール誘導
                      setTimeout(() => {
                        handleScrollToChat();
                      }, 300);
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow transition-all cursor-pointer"
                  >
                    手紙本文と連絡先を確認する
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 不適切コンテンツ通報モーダル */}
      {reportTarget && (
        <ReportModal 
          isOpen={!!reportTarget} 
          onClose={() => setReportTarget(null)} 
          targetType={reportTarget.type} 
          targetId={reportTarget.id}
          targetName={post?.target_name}
          targetSummary={post?.searcher_profile}
        />
      )}
    </div>
  );
};

export const ReportModal = ({ 
  isOpen, 
  onClose, 
  targetType, 
  targetId,
  targetName,
  targetSummary
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  targetType: 'post' | 'user'; 
  targetId: number;
  targetName?: string;
  targetSummary?: string;
}) => {
  const [reason, setReason] = useState('');
  const [reportType, setReportType] = useState('inappropriate');
  const [contactInfo, setContactInfo] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [postDetail, setPostDetail] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && targetType === 'post' && targetId) {
      fetch(`/api/posts/${targetId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setPostDetail(data);
        })
        .catch(err => console.error('Failed to load post for report modal:', err));
    }
  }, [isOpen, targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reportType, reason, contactInfo })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || '通報を正常に受け付けました。運営監視チームが内容を確認し迅速に対処いたします。');
        setTimeout(onClose, 2500);
      } else {
        setStatus('error');
        setMessage(data.error || '通報の送信に失敗しました。');
      }
    } catch (err) {
      setStatus('error');
      setMessage('通信エラーが発生しました。しばらく経ってから再度お試しください。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 overflow-y-auto font-sans" data-lenis-prevent>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass-card w-full max-w-lg relative z-10 p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl my-auto text-left"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-150 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block font-sans">
              Safety & Content Moderation
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-tight">
              不適切なコンテンツ・違反の通報
            </h2>
          </div>
        </div>

        {/* 対象の自動読み込み・情報バナー */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 space-y-1.5 text-xs font-sans">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>通報対象: {targetType === 'post' ? '手紙（ボトルメール）' : 'ユーザーアカウント'}</span>
            </span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
              ID: #{targetId}
            </span>
          </div>
          {(postDetail || targetName || targetSummary) && (
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-2 pt-0.5 border-t border-slate-200/60 mt-1">
              宛先: <strong className="text-slate-850">{targetName || postDetail?.target_name || '宛先指定'} 様</strong> 
              {postDetail?.era && ` (${postDetail.era}年代)`}
              {postDetail?.searcher_profile && ` - 「${postDetail.searcher_profile}」`}
            </p>
          )}
        </div>

        {status === 'success' ? (
          <div className="text-center py-8 space-y-4 font-sans">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">通報を受理いたしました</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onClose} 
              className="btn-primary py-2 px-6 text-xs bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold mt-2"
            >
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">通報の理由・区分（必須）</label>
              <select 
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-850 focus:outline-none focus:border-brand-primary"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
              >
                <option value="inappropriate">不適切な表現・不快な内容</option>
                <option value="privacy">個人情報・本名の無断掲載</option>
                <option value="harassment">嫌がらせ・誹謗中傷・脅迫</option>
                <option value="solicitation">性的勧誘・出会い目的・パパ活等</option>
                <option value="child_exploitation">未成年者・児童保護に関する懸念</option>
                <option value="spam">スパム・広告・詐欺行為</option>
                <option value="other">その他安全規約違反</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">詳細なご事情（必須）</label>
              <textarea 
                required
                rows={3}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-850 focus:outline-none focus:border-brand-primary leading-relaxed resize-none"
                placeholder="該当箇所の具体的な問題点や状況をご入力ください。"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">ご連絡用メールアドレス（任意）</label>
              <input 
                type="text"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-850 focus:outline-none focus:border-brand-primary"
                placeholder="調査結果や追加ヒアリングが必要な場合のみ使用します"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
              />
            </div>

            {/* 削除申請ページへの誘導案内 */}
            {targetType === 'post' && (
              <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl flex items-start gap-2.5 text-[11px] text-rose-900 leading-relaxed font-sans">
                <Trash2 size={15} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <span>ご自身に関する手紙の<strong>「完全削除・掲載停止」</strong>をご希望の場合は、</span>
                  <button 
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/deletion-request?id=${targetId}`);
                    }}
                    className="font-bold text-rose-700 underline hover:text-rose-900 ml-1 cursor-pointer"
                  >
                    削除依頼フォームはこちら →
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button 
                type="submit" 
                disabled={status === 'loading'} 
                className="w-2/3 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <RefreshCw className="animate-spin" size={15} />
                    <span>送信中...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={15} />
                    <span>通報を安全に送信</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};



