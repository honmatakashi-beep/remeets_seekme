import React from "react";
import { CheckSquare, ShieldCheck, User, Search, MapPin, School, Mail, Key, Lock, AlertTriangle, ShieldAlert, Heart, FileText, Check } from "lucide-react";
import { GoogleSearchResultPreview } from "../../../components/SharedComponents";

export const Step3Confirm = (props: any) => {
  const {
    formData,
    questions,
    agreed,
    setAgreed,
    captchaQuestion,
    captchaAnswer,
    setCaptchaAnswer,
    selectedPrefecture,
    isTargetMaiden,
    isSearcherMaiden,
    user
  } = props;

  return (
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
  );
};
