import React from "react";
import { 
  HelpCircle, Key, Lock, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, 
  BookOpen, CheckCircle, X 
} from "lucide-react";
import { WarningMessage } from "../../../components/SharedComponents";

export const Step1Quiz = (props: any) => {
  const {
    questions,
    handleQuestionChange,
    addQuestion,
    removeQuestion,
    isGeneratingAiQuestions,
    handleGenerateAiQuestions,
    aiQuestionSuggestions,
    handleApplyAiQuestion,
    handleAiDiagnosis,
    isAiDiagnosing,
    aiDiagnosisResult,
    warnings = {},
    toHalfWidth = (s: string) => s
  } = props;

  return (
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
              <summary className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer py-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                <span className="flex items-center gap-1.5 text-left leading-relaxed">
                  <Sparkles size={15} className="text-amber-700 shrink-0" />
                  <span>💡 どんな質問・答えが良い？ 具体的な「OK・NG例」を見る</span>
                </span>
                <span className="flex items-center justify-center self-end sm:self-auto gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs shrink-0">
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
                      <li><strong>質問:</strong> 秘密基地の入り口に植えた大きな黄色い花は？<br />➔ <strong>答え:</strong> <code>ひまわり</code></li>
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
                      <li><strong>文章や記号:</strong> <code>ひまわりです！</code>、<code>〇〇でした</code>（※単語のみにする）</li>
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
                      <span className="text-xs text-slate-500 font-medium">※ 単語のみ（例: ひまわり）</span>
                    </div>
                    <input 
                      required
                      type="text" 
                      placeholder="例：ひまわり（※単語・キーワードのみ）" 
                      className="w-full px-4 py-3 border-b-2 border-brand-primary/50 rounded-xl bg-[#faf9f6] focus:bg-white text-base outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                      value={q.answer}
                      onChange={e => handleQuestionChange(idx, 'answer', toHalfWidth(e.target.value))}
                      inputMode="url"
                      autoCapitalize="off"
                      autoCorrect="off"
                    />
                    {hasSentenceEnding && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-bold animate-fade-in">
                        <span>💡 「です」「！」などの語尾や記号を省いた単語のみ（例: <code>ひまわり</code>）で設定すると、相手が正解しやすくなります。</span>
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
  );
};
