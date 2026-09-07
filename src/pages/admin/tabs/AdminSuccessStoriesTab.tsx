import { Link } from "react-router-dom";
import React, { useState } from "react";
import {
  Heart, ExternalLink, RefreshCw, Sparkles, Plus, Edit2, Trash2, Eye, EyeOff, Star, Tag,
  Clock, MapPin, User, Check, X, Search, Filter, AlertCircle, CheckCircle2,
  Calendar, ArrowRight, ChevronLeft, ChevronRight, MessageSquare
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminSuccessStoriesTabProps {
  successStories: any[];
  token: string | null;
  loadSuccessStories?: () => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
  // Any states or handlers passed from parent
  [key: string]: any;
}

export const AdminSuccessStoriesTab: React.FC<AdminSuccessStoriesTabProps> = (props) => {
    const {
    successStories = [],
    token,
    loadSuccessStories,
    showToast,
    activeStoryCategory,
    setActiveStoryCategory,
    storyCategoryFilter = "all",
    setStoryCategoryFilter = () => {},
    storyPerPage = 10,
    setStoryPerPage = () => {},
    handleSeedSuccessStories = () => {},
    loading = false,
    newStoryForm = {},
    setNewStoryForm = () => {},
    editStoryForm = {},
    setEditStoryForm = () => {},
    searchStoryQuery,
    setSearchStoryQuery,
    isCreatingStory,
    setIsCreatingStory,
    newStoryData,
    setNewStoryData,
    editingStoryId,
    setEditingStoryId,
    editStoryData,
    setEditStoryData,
    handleCreateSuccessStory,
    handleUpdateSuccessStory,
    handleDeleteSuccessStory,
    handleToggleStoryFeatured,
    handleToggleStoryPublic,
    storyPage = 1,
    setStoryPage = () => {},
    storyTotalCount = 0,
    setStoryTotalCount = () => {},
    STORY_PAGE_SIZE = 10,
    featuredSlots = {},
    handleUpdateFeaturedSlot
  } = props;

            const categories = [
              { id: 'all', label: 'すべて表示' },
              { id: 'featured', label: '⭐ HOME掲載中' },
              { id: 'classmate', label: '🏫 同級生' },
              { id: 'mentor', label: '🌸 恩師・部活' },
              { id: 'journey', label: '🧭 旅・一期一会' },
              { id: 'neighbor', label: '🏡 幼馴染・ご近所' },
              { id: 'colleague', label: '💼 元同僚・仲間' },
              { id: 'rival', label: '⚽ 青春・ライバル' },
            ];

            const getCategoryBadge = (category: string, defaultTag?: string) => {
              switch (category) {
                case 'classmate':
                  return { label: '🏫 同級生', style: 'bg-amber-50 text-amber-900 border-amber-200' };
                case 'mentor':
                  return { label: '🌸 恩師・部活', style: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
                case 'journey':
                  return { label: '🧭 旅・一期一会', style: 'bg-teal-50 text-teal-900 border-teal-200' };
                case 'neighbor':
                  return { label: '🏡 幼馴染・ご近所', style: 'bg-rose-50 text-rose-900 border-rose-200' };
                case 'colleague':
                  return { label: '💼 元同僚・仲間', style: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
                case 'rival':
                  return { label: '⚽ 青春・ライバル', style: 'bg-sky-50 text-sky-900 border-sky-200' };
                default:
                  return { label: defaultTag || '✨ 再会の物語', style: 'bg-slate-100 text-slate-700 border-slate-200' };
              }
            };

            const defaultStoriesMap: Record<string, any> = {
              left: {
                category: "classmate",
                era: "1980年代後半",
                gender: "男性",
                tag: "🏫 同級生",
                title: "卒業から35年。懐かしいあだ名とお互いの記憶が繋いでくれた奇跡",
                message: "中学の卒業以来、お互いに転居が重なり連絡先が分からなくなっていました。ふとReMEETsで当時の陸上部の手紙を見つけ、懐かしい想い出のキーワードをきっかけに35年ぶりにメッセージが開通。当時のあだ名で呼び合い、まるで当時にタイムスリップしたような感動でした。今では年に一度集まる仲に戻り、一生の友人を再び取り戻せました。"
              },
              center: {
                category: "mentor",
                era: "1990年代半ば",
                gender: "女性",
                tag: "🌸 恩師・部活",
                title: "定年退職された吹奏楽部の恩師へ。30年越しの『ありがとう』が届いた日",
                message: "山本先生が定年退職されたと風の噂で聞き、当時の部活仲間で『どうしても感謝を伝えたい』と手紙を流しました。先生のご家族がこの手紙を見つけて先生に伝えてくださり、30年ぶりに温かいお返事をいただくことができました。先日、当時の部員一同で先生を囲んで同窓会を開き、最高の恩返しができました。"
              },
              right: {
                category: "journey",
                era: "1990年代初頭",
                gender: "男性",
                tag: "🧭 旅・一期一会",
                title: "あの夏の北海道。夜通し夢を語り合った旅の友から、3年越しの返信",
                message: "学生時代、バイクで北海道を巡っていた時に富良野の宿で偶然知り合い、朝まで将来の夢について熱く語り合いました。連絡先を書いた紙を紛失してしまいずっと悔やんでいましたが、ダメ元でReMEETsの海に想いを流していました。3年後、彼から『見つけたよ！』と連絡が入った時は手の震えが止まりませんでした。お互いに白髪交じりの大人になりましたが、心の距離は当時のままでした。"
              }
            };

            // フィルタリング処理
            const filteredStories = successStories.filter((story) => {
              if (storyCategoryFilter === 'all') return true;
              if (storyCategoryFilter === 'featured') return story.is_featured === 1;
              const cat = story.category || (story.era ? (story.era.includes('80') ? 'classmate' : story.era.includes('90') ? 'mentor' : 'colleague') : 'classmate');
              return cat === storyCategoryFilter;
            });

            const totalStoryPages = Math.max(1, Math.ceil(filteredStories.length / storyPerPage));
            const safeStoryPage = Math.min(Math.max(1, storyPage), totalStoryPages);
            const paginatedStories = filteredStories.slice((safeStoryPage - 1) * storyPerPage, safeStoryPage * storyPerPage);

            const featuredCount = successStories.filter(s => s.is_featured === 1).length;
            const publicCount = successStories.filter(s => s.is_all_page === 1 && s.is_public === 1).length;

            return (
              <div className="space-y-8 animate-fade-in font-sans">
                {/* ヘッダーカード ＆ サマリー */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Sparkles size={24} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-rose-700 uppercase tracking-widest block font-sans">
                        SUCCESS STORIES & HOME FEATURED MANAGER
                      </span>
                      <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-wide">
                        奇跡の再会報告（体験談）の管理
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed pt-0.5">
                        一般公開ページ（<code>/success-stories</code>）およびHOME画面（3枠）に掲載する再会体験談の作成・審査・スロット配分・編集を一元管理します。
                      </p>
                    </div>
                  </div>

                  {/* アクションボタン群 */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      to="/success-stories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ExternalLink size={14} />
                      <span>公開ページを確認</span>
                    </Link>
                    <button 
                      type="button"
                      onClick={handleSeedSuccessStories}
                      disabled={loading}
                      className="px-4 py-2.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200/80 hover:bg-rose-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                      <span>サンプル6件を一括生成</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsCreatingStory(!isCreatingStory)}
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      {isCreatingStory ? <X size={14} /> : <Plus size={14} />}
                      <span>{isCreatingStory ? 'フォームを閉じる' : '新規ストーリー作成'}</span>
                    </button>
                  </div>
                </div>

                {/* メトリクスバッジ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 block">登録総数</span>
                    <span className="text-xl font-black font-serif text-slate-900">{successStories.length} <span className="text-xs font-normal text-slate-400">件</span></span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-rose-700 block">⭐ HOME掲載中</span>
                    <span className="text-xl font-black font-serif text-rose-700">{featuredCount} <span className="text-xs font-normal text-slate-400">/ 3枠</span></span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-700 block">🌐 一覧掲載中</span>
                    <span className="text-xl font-black font-serif text-emerald-700">{publicCount} <span className="text-xs font-normal text-slate-400">件</span></span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 block">🔒 下書き・非公開</span>
                    <span className="text-xl font-black font-serif text-slate-900">{successStories.length - publicCount} <span className="text-xs font-normal text-slate-400">件</span></span>
                  </div>
                </div>

                {/* ─── HOME掲載 3枠 ライブプレビュー & スロットクイック割当 ─── */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          HOME FEATURED SLOTS
                        </span>
                        <h2 className="text-lg font-serif font-bold text-slate-900">
                          HOME画面に表示中の3枠ライブプレビュー & スロット割当
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 font-sans mt-1">
                        トップページに掲載される3つのカード（左・中央・右）の割り当て状況です。各枠のプルダウンから掲載ストーリーを即座に変更できます。
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {(['left', 'center', 'right'] as const).map((pos, idx) => {
                      const story = successStories.find(s => s.is_featured === 1 && s.display_position === pos);
                      const posLabel = pos === 'left' ? '左側枠 (Left Slot)' : pos === 'center' ? '中央枠 (Center Slot)' : '右側枠 (Right Slot)';
                      const defaultStory = defaultStoriesMap[pos];
                      const isCustom = !!story;
                      const activeCategory = story ? (story.category || (story.era ? (story.era.includes('80') ? 'classmate' : story.era.includes('90') ? 'mentor' : 'colleague') : 'classmate')) : defaultStory.category;
                      const badge = getCategoryBadge(activeCategory);

                      return (
                        <div 
                          key={pos}
                          className={`rounded-3xl p-5 sm:p-6 border flex flex-col justify-between space-y-4 transition-all ${
                            isCustom 
                              ? 'bg-white border-rose-200 shadow-md ring-1 ring-rose-100' 
                              : 'bg-slate-50/70 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <span className="text-[11px] font-bold font-mono text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isCustom ? 'bg-rose-500' : 'bg-slate-400'}`} />
                                {posLabel}
                              </span>
                              {isCustom ? (
                                <span className="text-[9.5px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                  ⭐ カスタム設定中 (ID: #{story.id})
                                </span>
                              ) : (
                                <span className="text-[9.5px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                  ⚪ デフォルト適用中
                                </span>
                              )}
                            </div>

                            {/* 実際のカードプレビュー */}
                            <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.style}`}>
                                  {badge.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                  {story?.era || defaultStory.era}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 line-clamp-2">
                                「{story?.title || defaultStory.title}」
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-4">
                                {story?.message || defaultStory.message}
                              </p>
                            </div>
                          </div>

                          {/* クイックスロット割当セレクター */}
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <label className="text-[10.5px] font-bold text-slate-500 block">
                              この枠に割り当てるストーリー:
                            </label>
                            <select
                              value={story ? story.id : ''}
                              onChange={(e) => {
                                const selectedId = e.target.value ? Number(e.target.value) : null;
                                if (!selectedId) {
                                  // 解除
                                  if (story) {
                                    handleUpdateSuccessStory(story.id, !!story.is_public, false, !!story.is_all_page, null);
                                  }
                                } else {
                                  const targetStory = successStories.find(s => s.id === selectedId);
                                  if (targetStory) {
                                    handleUpdateSuccessStory(targetStory.id, !!targetStory.is_public, true, !!targetStory.is_all_page, pos);
                                  }
                                }
                              }}
                              className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                            >
                              <option value="">（デフォルトエピソードを表示）</option>
                              {successStories.map(s => (
                                <option key={s.id} value={s.id}>
                                  #{s.id} {s.title ? `「${s.title}」` : `エピソード (${s.era || '年代未設定'})`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── 新規ストーリー作成フォーム (展開時) ─── */}
                {isCreatingStory && (
                  <form onSubmit={handleCreateSuccessStory} className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-md space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                          <Plus size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-serif font-bold text-slate-900">
                            再会ストーリーの新規作成
                          </h3>
                          <p className="text-xs text-slate-500">
                            管理者が直接再会エピソードを登録し、HOMEや体験談一覧へ即座に公開できます。
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsCreatingStory(false)}
                        className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* カテゴリ */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">カテゴリ</label>
                        <select 
                          value={newStoryForm.category}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, category: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                        >
                          <option value="classmate">🏫 同級生</option>
                          <option value="mentor">🌸 恩師・部活</option>
                          <option value="journey">🧭 旅・一期一会</option>
                          <option value="neighbor">🏡 幼馴染・ご近所</option>
                          <option value="colleague">💼 元同僚・仲間</option>
                          <option value="rival">⚽ 青春・ライバル</option>
                          <option value="other">✨ その他</option>
                        </select>
                      </div>

                      {/* タイトル */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block">タイトル (サイト掲載用)</label>
                        <input 
                          type="text"
                          required
                          value={newStoryForm.title}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, title: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                          placeholder="例: 卒業から35年。懐かしいあだ名が繋いでくれた奇跡"
                        />
                      </div>

                      {/* 出会った年代 */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">出会った年代</label>
                        <input 
                          type="text"
                          value={newStoryForm.era}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, era: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                          placeholder="例: 1980年代後半"
                        />
                      </div>

                      {/* 性別 */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">性別・関係性</label>
                        <select 
                          value={newStoryForm.gender}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, gender: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                        >
                          <option value="男性">男性</option>
                          <option value="女性">女性</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                    </div>

                    {/* メッセージ本文 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">メッセージ本文（再会のエピソード）</label>
                      <textarea
                        required
                        value={newStoryForm.message}
                        onChange={(e) => setNewStoryForm({ ...newStoryForm, message: e.target.value })}
                        rows={4}
                        className="w-full text-xs font-sans bg-white p-3.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none resize-y leading-relaxed"
                        placeholder="再会された喜びのエピソードや感謝の言葉を入力してください..."
                      />
                    </div>

                    {/* 掲載設定コントロール */}
                    <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.consent}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, consent: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        掲載同意済み
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.is_public}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, is_public: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        公開中
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.is_all_page}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, is_all_page: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        一覧掲載
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.is_featured}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, is_featured: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        ⭐ HOME掲載
                      </label>
                      {newStoryForm.is_featured && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <span>表示位置:</span>
                          <select 
                            value={newStoryForm.display_position}
                            onChange={(e) => setNewStoryForm({ ...newStoryForm, display_position: e.target.value })}
                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 font-bold outline-none"
                          >
                            <option value="">位置未設定</option>
                            <option value="left">左側枠 (Left)</option>
                            <option value="center">中央枠 (Center)</option>
                            <option value="right">右側枠 (Right)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatingStory(false)}
                        className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        ストーリーを保存・登録
                      </button>
                    </div>
                  </form>
                )}

                {/* ─── ストーリー一覧（フィルター & リスト） ─── */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-serif font-bold text-slate-900">
                        登録済みストーリー一覧 ({filteredStories.length}件)
                      </h2>
                    </div>
                  </div>

                  {/* カテゴリ切り替えフィルター & 表示件数 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setStoryCategoryFilter(cat.id); setStoryPage(1); }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            storyCategoryFilter === cat.id
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Page Size Select */}
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs shrink-0 self-end sm:self-auto shadow-2xs">
                      <span className="text-slate-500 text-[11px]">表示:</span>
                      <select
                        value={storyPerPage}
                        onChange={(e) => { setStoryPerPage(Number(e.target.value)); setStoryPage(1); }}
                        className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer text-xs"
                      >
                        <option value={10}>10件</option>
                        <option value={25}>25件</option>
                        <option value={50}>50件</option>
                        <option value={100}>100件</option>
                      </select>
                    </div>
                  </div>

                  {/* カードリスト */}
                  <div className="space-y-4">
                    {filteredStories.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-sans text-xs border border-slate-100 shadow-2xs">
                        該当するストーリーはありません
                      </div>
                    ) : (
                      paginatedStories.map((story) => {
                        const isEditing = editingStoryId === story.id;
                        const cat = story.category || (story.era ? (story.era.includes('80') ? 'classmate' : story.era.includes('90') ? 'mentor' : 'colleague') : 'classmate');
                        const badge = getCategoryBadge(cat);

                        return (
                          <div 
                            key={story.id} 
                            className={`bg-white rounded-3xl p-6 border transition-all ${
                              isEditing 
                                ? 'border-rose-400 ring-2 ring-rose-100 shadow-md' 
                                : story.is_featured === 1 
                                ? 'border-rose-200/80 shadow-xs' 
                                : 'border-slate-150 shadow-2xs'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="space-y-3 w-full md:w-auto flex-1">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                                    {badge.label}
                                  </span>
                                  {story.is_featured === 1 ? (
                                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                      <Sparkles size={11} />
                                      <span>HOME掲載中 ({story.display_position === 'left' ? '左側枠' : story.display_position === 'center' ? '中央枠' : story.display_position === 'right' ? '右側枠' : '位置未定'})</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                      HOME非掲載
                                    </span>
                                  )}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${story.is_all_page && story.is_public ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {story.is_all_page && story.is_public ? '🌐 一覧掲載中' : '一覧非表示'}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    ID: #{story.id} • {new Date(story.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-500 font-sans flex items-center gap-3">
                                  <span>投稿者: <strong className="text-slate-800">{story.username || story.nickname || '匿名'} 様</strong></span>
                                  <span>•</span>
                                  <span>年代: <strong className="text-slate-800">{story.era || '未設定'}</strong></span>
                                  <span>•</span>
                                  <span>性別: <strong className="text-slate-800">{story.gender || '未設定'}</strong></span>
                                </div>
                              </div>

                              {/* クイックコントロール */}
                              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                                <select 
                                  value={story.is_featured ? (story.display_position || 'featured') : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                      handleUpdateSuccessStory(story.id, !!story.is_public, false, !!story.is_all_page, null);
                                    } else if (val === 'featured') {
                                      handleUpdateSuccessStory(story.id, !!story.is_public, true, !!story.is_all_page, null);
                                    } else {
                                      handleUpdateSuccessStory(story.id, !!story.is_public, true, !!story.is_all_page, val);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer"
                                >
                                  <option value="">HOME非掲載</option>
                                  <option value="left">⭐ HOME左側枠</option>
                                  <option value="center">⭐ HOME中央枠</option>
                                  <option value="right">⭐ HOME右側枠</option>
                                </select>

                                <button 
                                  type="button"
                                  onClick={() => handleUpdateSuccessStory(story.id, !!story.is_public, !!story.is_featured, !story.is_all_page, story.display_position)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                    story.is_all_page ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-white text-slate-400 border-slate-200"
                                  }`}
                                >
                                  {story.is_all_page ? '一覧: ON' : '一覧: OFF'}
                                </button>

                                <button 
                                  type="button"
                                  onClick={() => handleUpdateSuccessStory(story.id, !story.is_public, !!story.is_featured, !!story.is_all_page, story.display_position)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                    story.is_public ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200"
                                  }`}
                                >
                                  {story.is_public ? '公開' : '非公開'}
                                </button>
                              </div>
                            </div>

                            {/* 編集フォーム or 通常表示 */}
                            {isEditing ? (
                              <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 mt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">カテゴリ</label>
                                    <select 
                                      value={editStoryForm.category}
                                      onChange={(e) => setEditStoryForm({ ...editStoryForm, category: e.target.value })}
                                      className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                    >
                                      <option value="classmate">🏫 同級生</option>
                                      <option value="mentor">🌸 恩師・部活</option>
                                      <option value="journey">🧭 旅・一期一会</option>
                                      <option value="neighbor">🏡 幼馴染・ご近所</option>
                                      <option value="colleague">💼 元同僚・仲間</option>
                                      <option value="rival">⚽ 青春・ライバル</option>
                                      <option value="other">✨ その他</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1 sm:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-600 block">タイトル</label>
                                    <input 
                                      type="text"
                                      value={editStoryForm.title}
                                      onChange={(e) => setEditStoryForm({ ...editStoryForm, title: e.target.value })}
                                      className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                      placeholder="タイトルを入力..."
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">年代</label>
                                    <input 
                                      type="text"
                                      value={editStoryForm.era}
                                      onChange={(e) => setEditStoryForm({ ...editStoryForm, era: e.target.value })}
                                      className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                      placeholder="例: 1980年代後半"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-600 block">メッセージ本文</label>
                                  <textarea
                                    value={editStoryForm.message}
                                    onChange={(e) => setEditStoryForm({ ...editStoryForm, message: e.target.value })}
                                    rows={4}
                                    className="w-full text-xs font-sans bg-white p-3 rounded-xl border border-slate-200 outline-none resize-y leading-relaxed"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingStoryId(null)}
                                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                                  >
                                    キャンセル
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSuccessStory(
                                        story.id, 
                                        !!story.is_public, 
                                        !!story.is_featured, 
                                        !!story.is_all_page, 
                                        story.display_position,
                                        editStoryForm.message,
                                        editStoryForm.era,
                                        editStoryForm.gender,
                                        editStoryForm.title,
                                        editStoryForm.category
                                      );
                                    }}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check size={13} />
                                    修正内容を保存して適用
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 mt-4 pt-3 border-t border-slate-100">
                                <div>
                                  <h4 className="text-sm sm:text-base font-serif font-bold text-slate-900">
                                    {story.title ? `「${story.title}」` : "（タイトル未設定 / デフォルトタイトルが適用されます）"}
                                  </h4>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                                  &ldquo;{story.message}&rdquo;
                                </p>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSuccessStory(story.id)}
                                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-red-200/60 shadow-2xs"
                                  >
                                    <Trash2 size={12} className="text-red-500" />
                                    削除
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStoryId(story.id);
                                      setEditStoryForm({
                                        title: story.title || '',
                                        message: story.message,
                                        era: story.era || '',
                                        gender: story.gender === 'male' || story.gender === '男性' ? '男性' : story.gender === 'female' || story.gender === '女性' ? '女性' : 'その他',
                                        category: cat
                                      });
                                    }}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200/80 shadow-2xs"
                                  >
                                    <Edit2 size={12} className="text-slate-500" />
                                    書き込み内容を編集
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Pagination Controls */}
                    {filteredStories.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-4 border-t border-slate-200/80 text-xs text-slate-600">
                        <div className="flex items-center gap-3">
                          <span>
                            全 <span className="font-bold text-slate-900">{filteredStories.length}</span> 件中{' '}
                            <span className="font-bold text-slate-900">{(safeStoryPage - 1) * storyPerPage + 1}</span> -{' '}
                            <span className="font-bold text-slate-900">{Math.min(safeStoryPage * storyPerPage, filteredStories.length)}</span> 件を表示
                          </span>
                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
                            <span className="text-slate-500 text-[11px]">表示:</span>
                            <select
                              value={storyPerPage}
                              onChange={(e) => { setStoryPerPage(Number(e.target.value)); setStoryPage(1); }}
                              className="bg-transparent text-slate-800 font-medium outline-none cursor-pointer text-xs"
                            >
                              <option value={10}>10件</option>
                              <option value={25}>25件</option>
                              <option value={50}>50件</option>
                              <option value={100}>100件</option>
                            </select>
                          </div>
                        </div>

                        {totalStoryPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={safeStoryPage <= 1}
                              onClick={() => setStoryPage(prev => Math.max(1, prev - 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronLeft size={14} />
                              <span>前へ</span>
                            </button>

                            <div className="flex items-center gap-1 px-2 font-mono font-bold text-slate-900">
                              <span>{safeStoryPage}</span>
                              <span>/</span>
                              <span>{totalStoryPages}</span>
                            </div>

                            <button
                              type="button"
                              disabled={safeStoryPage >= totalStoryPages}
                              onClick={() => setStoryPage(prev => Math.min(totalStoryPages, prev + 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <span>次へ</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
};
