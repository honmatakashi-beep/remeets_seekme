import React from "react";
import { Mail, Shield, Sparkles, Lock, Eye, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

export const Step2Message = (props: any) => {
  const {
    formData,
    setFormData,
    isGeneratingAiMessage,
    handleGenerateAiMessage,
    aiDrafts,
    handleSelectAiDraft,
    activeDraftTone,
    setActiveDraftTone
  } = props;

  return (
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
              <summary className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer py-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                <span className="flex items-center gap-1.5 text-left leading-relaxed">
                  <Sparkles size={15} className="text-amber-700 shrink-0" />
                  <span>💡 メッセージ作成のコツや「OK・NG例」を見る</span>
                </span>
                <span className="flex items-center justify-center self-end sm:self-auto gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs shrink-0">
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
  );
};
