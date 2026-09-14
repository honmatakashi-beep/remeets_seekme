import React from "react";
import { 
  Search, User, MapPin, School, Heart, Sparkles, Building, Calendar, Info, 
  CheckCircle2, AlertTriangle, AlertCircle, Users, BookOpen, CheckCircle, X 
} from "lucide-react";
import { PREFECTURES } from "../../../lib/utils";
import { WarningMessage } from "../../../components/SharedComponents";

export const Step0BasicInfo = (props: any) => {
  const {
    formData,
    setFormData,
    selectedPrefecture,
    setSelectedPrefecture,
    schoolCategory,
    setSchoolCategory,
    schoolSearchTerm,
    setSchoolSearchTerm,
    filteredSchools,
    handleSelectSchool,
    showCustomSchoolInput,
    setShowCustomSchoolInput,
    isTargetMaiden,
    setIsTargetMaiden,
    isSearcherMaiden,
    setIsSearcherMaiden,
    aiSuggestions,
    isGeneratingAi,
    handleGenerateAiSuggestions,
    handleTargetLastNameChange,
    handleTargetFirstNameChange,
    handleInputChange,
    handleSearcherNameChange,
    warnings = {},
    setWarnings,
    checkNg,
    calculatedSearcherAge,
    searcherBirthYear,
    setSearcherBirthYear,
    searcherBirthMonth,
    setSearcherBirthMonth,
    searcherBirthDay,
    setSearcherBirthDay,
    searcherGender,
    setSearcherGender,
    nameWarning,
    targetMaidenLastName,
    setTargetMaidenLastName,
    searcherMaidenLastName,
    setSearcherMaidenLastName,
    handleAIPostImprovement,
    isGeneratingImprovement,
    selectedThemePrompt,
    setSelectedThemePrompt,
    user
  } = props;

  return (
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
              {/* 差出人ニックネーム（メッセージごとの呼び名） */}
              <div className="space-y-1.5 bg-amber-50/50 p-4 rounded-xl border border-amber-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                    <Sparkles size={15} className="text-amber-700" />
                    このメッセージでのあなたのニックネーム（当時のあだ名・呼び名）
                    <span className="text-[10px] text-red-600 font-bold ml-1">＊必須</span>
                  </label>
                  <span className="text-[11px] text-amber-900/70 font-medium">※ メッセージごとに自由に変更可能</span>
                </div>
                <input 
                  required
                  type="text" 
                  placeholder="例：たっちゃん、主将、さくら など" 
                  className="w-full px-4 py-2.5 border-b-2 border-brand-primary/50 rounded-xl bg-white text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-[#000000] placeholder:text-zinc-400 font-sans letter-field-input"
                  value={formData.searcherName}
                  onChange={e => handleSearcherNameChange(e.target.value)}
                />
                <p className="text-[11px] text-zinc-500">
                  お相手があなただとピンとくる、当時のあだ名や呼び名を設定してください（初期値: アカウント登録時ニックネーム）。
                </p>
                <WarningMessage message={warnings.searcherName} />
              </div>

              {/* 年齢確認・生年月日 ＆ 性別（未登録ユーザー用 または 登録済ユーザー自動スキップ表示） */}
              {user?.birthdate ? (
                <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between text-xs shadow-2xs font-sans">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-emerald-950">
                        【年齢確認・性別】会員登録データ適用済
                      </span>
                      <span className="text-[11px] text-emerald-800 font-normal">
                        満 {calculatedSearcherAge} 歳{user.gender ? `（${user.gender}）` : ''} • 18歳以上確認完了（スルー）
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-md font-bold shrink-0">
                    ✓ 確認済
                  </span>
                </div>
              ) : (
                <div className="space-y-4 p-4 md:p-5 bg-gradient-to-br from-amber-50/70 via-stone-50/80 to-amber-50/50 border border-amber-200/90 rounded-2xl shadow-2xs">
                  {/* 生年月日ヘッダー */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5 font-sans">
                      <Calendar size={16} className="text-amber-700" />
                      <span>あなたの生年月日（年齢確認・法令遵守）</span> <span className="text-red-600 font-bold">*必須</span>
                    </label>
                    {calculatedSearcherAge !== null && (
                      calculatedSearcherAge >= 18 ? (
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>{calculatedSearcherAge} 歳（18歳以上確認OK）</span>
                        </span>
                      ) : (
                        <span className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                          <AlertCircle size={12} className="text-rose-600" />
                          <span>{calculatedSearcherAge} 歳（18歳未満利用不可）</span>
                        </span>
                      )
                    )}
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed font-serif">
                    ※ 青少年保護法および利用規約に基づき、18歳以上であることを確認します（相手には非公開）。
                  </p>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* 年 */}
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-stone-700">年（西暦）</label>
                      <select
                        required
                        value={searcherBirthYear}
                        onChange={e => setSearcherBirthYear(e.target.value)}
                        className="w-full px-2.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-stone-900 shadow-inner cursor-pointer font-sans"
                      >
                        <option value="">年を選択</option>
                        {Array.from({ length: 90 }, (_, i) => {
                          const y = new Date().getFullYear() - 18 - i;
                          let era = '';
                          if (y >= 2019) era = `令和${y - 2018}`;
                          else if (y >= 1989) era = `平成${y - 1988}`;
                          else if (y >= 1926) era = `昭和${y - 1925}`;
                          else era = `大正${y - 1911}`;
                          return (
                            <option key={y} value={y.toString()}>
                              {y}年 ({era})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* 月 */}
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-stone-700">月</label>
                      <select
                        required
                        value={searcherBirthMonth}
                        onChange={e => setSearcherBirthMonth(e.target.value)}
                        className="w-full px-2.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-stone-900 shadow-inner cursor-pointer font-sans"
                      >
                        <option value="">月を選択</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m.toString()}>
                            {m}月
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 日 */}
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-stone-700">日</label>
                      <select
                        required
                        value={searcherBirthDay}
                        onChange={e => setSearcherBirthDay(e.target.value)}
                        className="w-full px-2.5 py-2.5 border border-stone-300 rounded-xl bg-white text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-stone-900 shadow-inner cursor-pointer font-sans"
                      >
                        <option value="">日を選択</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d.toString()}>
                            {d}日
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {calculatedSearcherAge !== null && calculatedSearcherAge < 18 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-shake font-sans">
                      <AlertCircle size={15} className="text-rose-600 shrink-0" />
                      <span>18歳未満（高校生を含む）の方は法令に基づきボトルメールを投稿できません。</span>
                    </div>
                  )}

                  {/* 性別（統計用）選択欄 */}
                  <div className="pt-2 border-t border-amber-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5 font-sans">
                        <Users size={15} className="text-amber-700" />
                        <span>性別（統計・サービス改善用 / 非公開）</span>
                        <span className="text-[10px] text-zinc-500 font-normal ml-1">※任意</span>
                      </label>
                      <span className="text-[10px] bg-slate-200/90 text-slate-700 font-bold px-2 py-0.5 rounded">
                        非公開
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: '男性', label: '男性' },
                        { value: '女性', label: '女性' },
                        { value: 'その他 / 回答しない', label: 'その他 / 未回答' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSearcherGender(opt.value as any)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer font-sans text-center flex items-center justify-center ${
                            searcherGender === opt.value
                              ? 'bg-amber-700 text-white border-amber-700 shadow-xs scale-[1.01]'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-amber-400 hover:bg-amber-50/40'
                          }`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* タイトル & 警告 */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                  <BookOpen size={15} className="text-amber-700" />
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
                  <summary className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer py-2.5 px-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 hover:from-amber-100 hover:to-orange-100/60 border border-amber-300 rounded-xl shadow-2xs text-xs md:text-sm font-bold text-amber-950 list-none select-none transition-all active:scale-[0.99]">
                    <span className="flex items-center gap-1.5 text-left leading-relaxed">
                      <Sparkles size={15} className="text-amber-700 shrink-0" />
                      <span>💡 どんな内容がOK？ 具体的な「OK・NG例」を見る</span>
                    </span>
                    <span className="flex items-center justify-center self-end sm:self-auto gap-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-white/90 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs shrink-0">
                      <span className="group-open:hidden">＋ タップで開く ▼</span>
                      <span className="hidden group-open:inline">− 閉じる ▲</span>
                    </span>
                  </summary>

                  <div className="pt-3 space-y-3 text-xs md:text-sm">
                    <p className="text-xs md:text-sm text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed font-sans">
                      💡 <strong>メッセージ本文との違い:</strong> お相手へのご挨拶や近況報告、本格的なメッセージ、開示用連絡先は、最後の<strong>【Step 3（非公開のメッセージ本文）】</strong>で安全に入力します。
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
                          <li>「元気？会いたいから連絡して」（※メッセージの本文はStep 3で書く）</li>
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
  );
};
