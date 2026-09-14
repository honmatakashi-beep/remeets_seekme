import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Sparkles, ShieldCheck, AlertTriangle, AlertCircle,
  Lock, Save, RefreshCw, Send, User, MapPin, Calendar, Trash2
} from 'lucide-react';
import { PREFECTURES, BIRTH_YEAR_OPTIONS } from '../../lib/utils';
import { useNgFilter } from '../../contexts/AuthContext';

interface EditPublicMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  token: string | null;
  onUpdated: (updatedPost: any) => void;
  onDeleteRequested?: () => void;
}

export const EditPublicMessageModal: React.FC<EditPublicMessageModalProps> = ({
  isOpen,
  onClose,
  post,
  token,
  onUpdated,
  onDeleteRequested
}) => {
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

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 🤖 AI自動作文
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSituation, setAiSituation] = useState<'school_friends' | 'teacher_senior' | 'work_colleague' | 'general_gratitude'>('school_friends');

  useEffect(() => {
    if (post) {
      let lName = post.target_last_name || '';
      let fName = post.target_first_name || '';
      if (!lName && !fName && post.target_name) {
        const parts = post.target_name.trim().split(/\s+/);
        lName = parts[0] || '';
        fName = parts.slice(1).join(' ') || '';
      }

      setFormData({
        lastName: lName,
        firstName: fName,
        lastNameKana: post.target_last_name_kana || '',
        firstNameKana: post.target_first_name_kana || '',
        maidenName: post.searcher_maiden_name || post.target_maiden_name || '',
        maidenNameKana: post.target_maiden_name_kana || '',
        birthYear: post.era || post.target_birth_year || '',
        hometownPref: post.target_hometown || '',
        message: post.message || post.searcher_profile || '',
        contactType: post.contact_type || 'LINE',
        contactId: post.contact_id || '',
        contactNote: post.contact_note || ''
      });
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  // リアルタイム特定情報検知
  const getPrivacyWarning = (text: string): string | null => {
    if (!text) return null;
    if (/(?:市立|県立|都立|府立|道立|私立|国立)?.{2,10}(?:高等学校|高校|中学校|小学校|幼稚園|保育園|大学)/.test(text)) {
      return '防犯のため、具体的な学校名・大学名は含めず、当時の思い出をご記入ください。';
    }
    if (/(?:株式会社|有限会社|合同会社|合資会社).{2,10}/.test(text)) {
      return 'プライバシー保護のため、会社名・勤務先名は含めずにご記入ください。';
    }
    if (/\d+丁目\d+番|\d+-\d+-\d+/.test(text)) {
      return '居場所特定を防ぐため、詳細な町名・番地は含めずにご記入ください。';
    }
    if (text.match(/0\d{1,4}-?\d{1,4}-?\d{4}/) || text.includes('@') || /line\s*id|ライン\s*id/i.test(text)) {
      return '本文中に直接連絡先を記載することはできません。連絡先は下記の開示連絡先欄にご入力ください。';
    }
    return null;
  };

  const privacyWarning = getPrivacyWarning(formData.message);

  const handleGenerateAiMessage = async (customSit?: any) => {
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
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      setErrorMsg('お名前（姓・名）を入力してください。');
      return;
    }
    if (!formData.hometownPref) {
      setErrorMsg('ゆかりの地（都道府県）を選択してください。');
      return;
    }
    if (!formData.birthYear) {
      setErrorMsg('生まれ年（西暦・和暦）を選択してください。');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMsg('公開メッセージは10文字以上で入力してください。');
      return;
    }
    if (!formData.contactId.trim()) {
      setErrorMsg('再会時の開示連絡先を入力してください。');
      return;
    }

    const fullName = `${formData.lastName} ${formData.firstName}`.trim();
    const ngError = checkNg(`${fullName} ${formData.maidenName} ${formData.message}`);
    if (ngError) {
      setErrorMsg(ngError);
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/posts/my-post/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: post.id,
          ...formData
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg('公開メッセージを更新しました！');
        if (onUpdated && data.post) {
          onUpdated(data.post);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || '更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('通信エラーが発生しました。接続を確認してください。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden my-6 z-10 text-slate-900 font-sans"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-200 border border-white/20 shrink-0">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif">公開メッセージの編集</h3>
                <p className="text-xs text-teal-100/80 font-sans">公開中のメッセージ内容や開示連絡先を最新の情報に更新できます。</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2 animate-shake">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. あなたについて */}
            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">1</span>
                <h4 className="text-sm font-bold text-slate-900 font-serif">あなたについて</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">お名前（姓）*</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white text-slate-950 font-medium focus:border-teal-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">お名前（名）*</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white text-slate-950 font-medium focus:border-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">ふりがな（せい）</label>
                  <input
                    type="text"
                    value={formData.lastNameKana}
                    onChange={e => setFormData(prev => ({ ...prev, lastNameKana: e.target.value }))}
                    placeholder="例：やまだ"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-950 focus:border-teal-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">ふりがな（めい）</label>
                  <input
                    type="text"
                    value={formData.firstNameKana}
                    onChange={e => setFormData(prev => ({ ...prev, firstNameKana: e.target.value }))}
                    placeholder="例：たろう"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-950 focus:border-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">旧姓・当時の苗字（任意）</label>
                  <input
                    type="text"
                    value={formData.maidenName}
                    onChange={e => setFormData(prev => ({ ...prev, maidenName: e.target.value }))}
                    placeholder="例：佐藤"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-950 focus:border-teal-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">旧姓のふりがな</label>
                  <input
                    type="text"
                    value={formData.maidenNameKana}
                    onChange={e => setFormData(prev => ({ ...prev, maidenNameKana: e.target.value }))}
                    placeholder="例：さとう"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-950 focus:border-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ゆかりの地（都道府県）*</label>
                  <select
                    required
                    value={formData.hometownPref}
                    onChange={e => setFormData(prev => ({ ...prev, hometownPref: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white text-slate-950 font-medium focus:border-teal-600 outline-none cursor-pointer"
                  >
                    <option value="">都道府県を選択</option>
                    {PREFECTURES.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">生まれ年（西暦・和暦）*</label>
                  <select
                    required
                    value={formData.birthYear}
                    onChange={e => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white text-slate-950 font-medium focus:border-teal-600 outline-none cursor-pointer"
                  >
                    <option value="">生まれ年を選択（必須）</option>
                    {BIRTH_YEAR_OPTIONS.map(opt => (
                      <option key={opt.year} value={opt.year}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. 公開メッセージ */}
            <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">2</span>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">公開メッセージ</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiAssistant(!showAiAssistant)}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Sparkles size={13} className="text-teal-600" />
                  <span>AI作文</span>
                </button>
              </div>

              {showAiAssistant && (
                <div className="p-3.5 bg-gradient-to-br from-teal-50 via-sky-50 to-emerald-50 rounded-xl border border-teal-200 space-y-2.5 animate-fade-in">
                  <span className="text-xs font-bold text-teal-900 block">AI自動作文アシスタント</span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { id: 'school_friends', label: '🎒 同級生・学生時代' },
                      { id: 'teacher_senior', label: '🎾 部活・恩師・先輩' },
                      { id: 'work_colleague', label: '💼 職場・同期・同僚' },
                      { id: 'general_gratitude', label: '🤝 お世話になった人' }
                    ].map(sit => (
                      <button
                        key={sit.id}
                        type="button"
                        onClick={() => {
                          setAiSituation(sit.id as any);
                          handleGenerateAiMessage(sit.id as any);
                        }}
                        disabled={aiGenerating}
                        className={`p-2 rounded-lg text-xs font-bold text-left border transition-all cursor-pointer ${
                          aiSituation === sit.id ? 'bg-white border-teal-600 text-teal-900 shadow-xs' : 'bg-white/70 border-slate-200 hover:bg-white'
                        }`}
                      >
                        {sit.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="あなたを探している相手に向けたメッセージをご記入ください。"
                  className="w-full p-3.5 text-sm sm:text-base text-slate-950 font-letter-mincho font-serif font-medium border-2 border-slate-300 rounded-xl bg-white focus:border-teal-600 outline-none leading-relaxed"
                />

                {privacyWarning && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-1.5 animate-fade-in">
                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>{privacyWarning}</span>
                  </div>
                )}
              </div>

              {/* コンパクトルール */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600 pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                  <span className="text-rose-700 font-bold block">🚫 学校名・会社名</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                  <span className="text-rose-700 font-bold block">🚫 駅名・詳細住所</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                  <span className="text-emerald-700 font-bold block">⭕ 二人の思い出</span>
                </div>
              </div>
            </div>

            {/* 3. 開示連絡先 */}
            <div className="space-y-3 bg-teal-50/50 p-4 sm:p-5 rounded-2xl border border-teal-200">
              <div className="flex items-center justify-between border-b border-teal-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">再会時の開示連絡先</h4>
                </div>
                <span className="text-[10px] text-teal-800 bg-teal-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} /> 承認時のみ相互開示
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">連絡手段*</label>
                  <select
                    value={formData.contactType}
                    onChange={e => setFormData(prev => ({ ...prev, contactType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-teal-300 rounded-xl bg-white text-slate-950 font-medium focus:border-teal-600 outline-none cursor-pointer"
                  >
                    <option value="LINE">LINE ID</option>
                    <option value="EMAIL">メールアドレス</option>
                    <option value="PHONE">電話番号（SMS）</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">連絡先ID / アドレス*</label>
                  <input
                    type="text"
                    required
                    value={formData.contactId}
                    onChange={e => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                    placeholder={formData.contactType === 'LINE' ? '例：taro_yamada_line' : '例：yamada@example.com'}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-teal-300 rounded-xl bg-white text-slate-950 font-mono font-medium focus:border-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">お相手への補足メッセージ（任意）</label>
                <input
                  type="text"
                  value={formData.contactNote}
                  onChange={e => setFormData(prev => ({ ...prev, contactNote: e.target.value }))}
                  placeholder="例：LINE追加時は一言メッセージを添えてください。"
                  className="w-full px-3.5 py-2 text-xs border border-teal-200 rounded-xl bg-white text-slate-950 focus:border-teal-600 outline-none"
                />
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {onDeleteRequested ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDeleteRequested();
                  }}
                  className="px-3.5 py-2 border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 size={13} />
                  <span>メッセージを削除</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>変更内容を保存する</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
