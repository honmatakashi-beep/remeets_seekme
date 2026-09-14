import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartHandshake, BookOpen, Clock, Users, School, Heart, CheckCircle2,
  ChevronRight, ArrowRight, Lock, Eye, Sparkles, Send, Mail, Search
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { BottleLoader, BackToHomeButton } from "../components/SharedComponents";
import { SuccessStoryModal } from "./SearchPage";

export const SuccessStoriesPage = () => {
  const { user } = useAuth();
  const [dbStories, setDbStories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/success-stories/public?type=all');
        if (res.ok) {
          const data = await res.json();
          setDbStories(data);
        }
      } catch (err) {
        console.error('Failed to fetch public success stories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const categories = [
    { id: 'all', label: 'すべて表示' },
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

  const defaultStories = [
    {
      id: "def-1",
      category: "classmate",
      tag: "🏫 同級生",
      era: "1980年代後半",
      relationship: "中学時代の親友（陸上部）",
      title: "卒業から35年。懐かしいあだ名とお互いの記憶が繋いでくれた奇跡",
      participants: "佐藤 健 様（52歳）＆ 鈴木 信一郎 様（51歳）",
      description: "中学の卒業以来、お互いに転居が重なり連絡先が分からなくなっていました。ふとReMEETsで当時の陸上部の手紙を見つけ、懐かしい想い出のキーワードをきっかけに35年ぶりにメッセージが開通。当時のあだ名で呼び合い、まるで当時にタイムスリップしたような感動でした。今では年に一度集まる仲に戻り、一生の友人を再び取り戻せました。",
      bg: "bg-amber-50/40 border-amber-200/80"
    },
    {
      id: "def-2",
      category: "mentor",
      tag: "🌸 恩師・部活",
      era: "1990年代半ば",
      relationship: "高校吹奏楽部の顧問と元部長",
      title: "定年退職された吹奏楽部の恩師へ。30年越しの『ありがとう』が届いた日",
      participants: "高橋 由美子 様（45歳）＆ 山本 栄治 先生（71歳）",
      description: "山本先生が定年退職されたと風の噂で聞き、当時の部活仲間で『どうしても感謝を伝えたい』と手紙を流しました。先生のご家族がこの手紙を見つけて先生に伝えてくださり、30年ぶりに温かいお返事をいただくことができました。先日、当時の部員一同で先生を囲んで同窓会を開き、最高の恩返しができました。",
      bg: "bg-indigo-50/30 border-indigo-200/60"
    },
    {
      id: "def-3",
      category: "journey",
      tag: "🧭 旅・一期一会",
      era: "1990年代初頭",
      relationship: "北海道一人旅で同宿だった旅人仲間",
      title: "あの夏の北海道。夜通し夢を語り合った旅の友から、3年越しの返信",
      participants: "中村 慎吾 様（54歳）＆ 井上 拓也 様（53歳）",
      description: "学生時代、バイクで北海道を巡っていた時に富良野の宿で偶然知り合い、朝まで将来の夢について熱く語り合いました。連絡先を書いた紙を紛失してしまいずっと悔やんでいましたが、ダメ元でReMEETsの海に想いを流していました。3年後、彼から『見つけたよ！』と連絡が入った時は手の震えが止まりませんでした。お互いに白髪交じりの大人になりましたが、心の距離は当時のままでした。",
      bg: "bg-teal-50/35 border-teal-200/60"
    },
    {
      id: "def-4",
      category: "neighbor",
      tag: "🏡 幼馴染・ご近所",
      era: "1980年代初頭",
      relationship: "小学校時代の幼馴染",
      title: "さよならを言えないまま離れ離れになった幼馴染。40年ぶりの笑顔",
      participants: "松田 恵美 様（48歳）＆ 川上 陽子 様（48歳）",
      description: "小学校の時、親の急な転勤で手紙も渡せないまま引っ越してしまい、40年間ずっと心に引っかかっていました。ReMEETsに当時の公園の思い出を流したところ、彼女が検索して見つけてくれました。『ずっと探してたよ』と言われた瞬間、涙があふれました。今はお互いの子供のことや近況を楽しく語り合っています。",
      bg: "bg-rose-50/30 border-rose-200/60"
    },
    {
      id: "def-5",
      category: "colleague",
      tag: "💼 元同僚・仲間",
      era: "2000年代初頭",
      relationship: "ベンチャー企業の創業メンバー",
      title: "20年前、共に徹夜を乗り越えた仲間と再会。お互いの成長を喜び合う",
      participants: "渡辺 直樹 様（42歳）＆ 小林 誠 様（43歳）",
      description: "20代の頃、小さな雑居ビルで寝る間も惜しんでサービス開発に明け暮れた創業メンバー。会社が大きくなり別々の道を歩んでから疎遠になっていましたが、ReMEETsを通じて再び繋がることができました。20年ぶりにグラスを交わし、当時の熱い情熱とお互いのこれまでの歩みを称え合いました。",
      bg: "bg-emerald-50/30 border-emerald-200/60"
    },
    {
      id: "def-6",
      category: "rival",
      tag: "⚽ 青春・ライバル",
      era: "2000年代半ば",
      relationship: "高校サッカー部の他校ライバル",
      title: "高校最後の決勝で競い合った他校のエース。『あの時の握手』をもう一度",
      participants: "宮本 俊介 様（38歳）＆ 千葉 健太 様（38歳）",
      description: "高校サッカー選手権の決勝戦で激闘を繰り広げ、試合後に抱き合って健闘を称え合った他校のキャプテン。大人になってからもずっと心に残っていたあの時の感謝をボトルに託しました。メッセージが届き、今では社会人フットサルで時々一緒に汗を流す大切な友人になりました。",
      bg: "bg-sky-50/35 border-sky-200/60"
    }
  ];

  const dbStoriesMapped = dbStories.map((story) => {
    const category = story.category || (story.era ? (story.era.includes('80') ? 'classmate' : story.era.includes('90') ? 'mentor' : 'colleague') : 'classmate');
    return {
      id: `db-${story.id}`,
      category,
      tag: story.category ? getCategoryBadge(story.category).label : (story.era ? `${story.era}年代の再会` : "再会の物語"),
      era: story.era ? story.era : "想い出の年代",
      relationship: story.gender ? `再会のご報告（${story.gender === 'male' || story.gender === '男性' ? '男性' : story.gender === 'female' || story.gender === '女性' ? '女性' : 'その他'}）` : "再会のご報告",
      title: story.title || "奇跡が結びつけた、温かい再会の物語",
      participants: `${story.username || "匿名のユーザー"} 様`,
      description: story.message,
      bg: story.display_position === 'left' 
        ? "bg-amber-50/40 border-amber-200/80" 
        : story.display_position === 'center'
        ? "bg-emerald-50/30 border-emerald-200/60"
        : "bg-indigo-50/30 border-indigo-200/60"
    };
  });

  const displayStories = [...dbStoriesMapped, ...defaultStories];
  
  // カテゴリ絞り込み
  const categoryFiltered = selectedCategory === 'all' 
    ? displayStories 
    : displayStories.filter(s => s.category === selectedCategory);

  const highlightedStory = targetId ? displayStories.find(s => s.id === targetId) : null;
  const filteredStories = highlightedStory ? categoryFiltered.filter(s => s.id !== highlightedStory.id) : categoryFiltered;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-16 space-y-8 font-sans text-slate-800">
      {/* 成功ストーリー投稿モーダル */}
      <SuccessStoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <BackToHomeButton className="mb-2" />

      {/* ページヘッダー */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <HeartHandshake size={24} />
          </div>
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-rose-700 uppercase tracking-widest block font-sans">
              ReMEETs Stories
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
              奇跡の再会報告（体験談）
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed pt-1">
              大切な思い出を持つ人同士が、時を超えてふたたび巡り会えた温かい再会のエピソードをご紹介します。
            </p>
          </div>
        </div>

        {/* 投稿フォームへの入り口ボタン */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-200 shrink-0" />
            <span>再会エピソードを投稿する</span>
          </button>
        </div>
      </div>

      {/* カテゴリ絞り込みピル（タブフィルター） */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* 選択されたエピソードのハイライト表示 */}
          {highlightedStory && (
            <div className="space-y-3 animate-fade-in mb-8">
              <div className="flex items-center gap-2 text-teal-800 font-serif font-bold text-xs sm:text-sm">
                <Sparkles size={15} className="text-teal-600 animate-pulse" />
                <span>あなたが選択した再会エピソード</span>
              </div>
              
              <div className={`p-5 sm:p-7 md:p-8 border-2 border-teal-300 rounded-3xl space-y-4 ${highlightedStory.bg} shadow-md relative overflow-hidden bg-white`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const badge = getCategoryBadge(highlightedStory.category, highlightedStory.tag);
                      return (
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-sans flex items-center gap-1 ${badge.style}`}>
                          {badge.label} (選択中)
                        </span>
                      );
                    })()}
                    <span className="text-[11px] font-medium text-slate-500 font-sans">
                      年代：{highlightedStory.era} / 関係：{highlightedStory.relationship}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-teal-700 font-bold">Episode #{highlightedStory.id}</span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-slate-900 leading-snug">
                    {highlightedStory.title}
                  </h2>
                  <p className="text-xs font-bold text-slate-700 font-sans">
                    👤 ご紹介：{highlightedStory.participants}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-750 leading-relaxed font-sans border-t border-slate-100 pt-4 font-serif italic bg-slate-50/50 p-4 rounded-2xl">
                  &ldquo;{highlightedStory.description}&rdquo;
                </p>
              </div>

              <div className="text-center pt-2 pb-4">
                <Link to="/success-stories" className="text-xs text-teal-700 font-bold hover:underline inline-flex items-center gap-1">
                  ← すべての物語一覧に戻る
                </Link>
              </div>
            </div>
          )}

          {highlightedStory && filteredStories.length > 0 && (
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
              他の再会エピソード一覧 ({filteredStories.length}件)
            </h3>
          )}

          {/* カード一覧（横2列グリッド） */}
          {filteredStories.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 space-y-3">
              <p className="text-sm font-bold text-slate-600">
                このカテゴリの再会エピソードはまだありません
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
              >
                すべてのエピソードを表示する
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredStories.map(story => (
                <div 
                  key={story.id} 
                  className={`p-5 sm:p-6 md:p-7 border rounded-3xl space-y-3.5 ${story.bg} shadow-xs hover:shadow-md transition-all group bg-white flex flex-col justify-between text-left`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const badge = getCategoryBadge(story.category, story.tag);
                          return (
                            <span className={`text-[10px] sm:text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-sans flex items-center gap-1 ${badge.style}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                        <span className="text-[10.5px] sm:text-[11px] font-medium text-slate-500 font-sans">
                          {story.era} / {story.relationship}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-slate-400">Episode #{story.id}</span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug">
                        {story.title}
                      </h2>
                      <p className="text-xs font-bold text-slate-700 font-sans">
                        👤 ご紹介：{story.participants}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-100/80 pt-3">
                    {story.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ページ下部CTA（ログイン状態に応じて表示切り替え） */}
      <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-5 max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
          <Sparkles size={22} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
            {user ? "あなたの想い出も海へ流してみませんか？" : "心の中で漂流している思い出はありませんか？"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto font-sans">
            もう二度と会えないかもしれない、そう思っている昔の友人や恩師へ。<br className="hidden sm:inline" />
            ReMEETsの暗号化された安全なボトルメールに想いを託して、静かに海へ流してみましょう。
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {user ? (
            <>
              <Link 
                to="/create" 
                className="px-6 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail size={15} />
                <span>手紙を海へ流す（新規投函）</span>
              </Link>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles size={15} className="text-amber-600" />
                <span>再会エピソードを投稿する</span>
              </button>
              <Link 
                to="/search" 
                className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 transition-all"
              >
                <Search size={15} />
                <span>手紙を探す</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/create" 
                className="px-6 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail size={15} />
                <span>手紙を書く</span>
              </Link>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles size={15} className="text-amber-600" />
                <span>エピソードを投稿する</span>
              </button>
              <Link 
                to="/search" 
                className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 transition-all"
              >
                <Search size={15} />
                <span>誰かの手紙を探してみる</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};



