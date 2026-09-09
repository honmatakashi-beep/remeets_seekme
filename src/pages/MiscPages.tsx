import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import PptxGenJS from 'pptxgenjs';
import {
  ArrowLeft, ArrowRight, Award, BookOpen, Calendar, Check, CheckCircle,
  CheckCircle2, CheckSquare, ChevronRight, Clock, Download, Eye, FileText,
  Heart, HeartHandshake, Home, Key, Lock, Mail, Presentation, Printer,
  RefreshCw, Rocket, School, Search, Shield, ShieldAlert, ShieldCheck,
  Sparkles, Trash2, Unlock, UserCheck, Users, Waves, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BottleLoader, BackToHomeButton } from '../components/SharedComponents';
import guideScene01Soft from '../assets/images/guide_scene_01_soft_1785858280085.jpg';
import guideScene02Soft from '../assets/images/guide_scene_02_soft_1785858294880.jpg';
import guideScene03Soft from '../assets/images/guide_scene_03_soft_1785858307849.jpg';
import guideScene04Soft from '../assets/images/guide_scene_04_soft_1785858320993.jpg';
import { SuccessStoryModal } from './SearchPage';
import { PRShortsHelperCard } from '../components/PRShortsHelperCard';
import { PolicePresentationSlideViewer } from '../components/PolicePresentationSlideViewer';

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

          {/* カード一覧 */}
          {filteredStories.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 space-y-3">
              <p className="text-sm font-bold text-slate-600">
                このカテゴリの再会エピソードはまだありません
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                すべてのエピソードを表示する
              </button>
            </div>
          ) : (
            filteredStories.map(story => (
              <div 
                key={story.id} 
                className={`p-5 sm:p-7 md:p-8 border rounded-3xl space-y-4 ${story.bg} shadow-xs hover:shadow-md transition-all group bg-white`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const badge = getCategoryBadge(story.category, story.tag);
                      return (
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-sans flex items-center gap-1 ${badge.style}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                    <span className="text-[11px] font-medium text-slate-500 font-sans">
                      年代：{story.era} / 関係：{story.relationship}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Episode #{story.id}</span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug">
                    {story.title}
                  </h2>
                  <p className="text-xs font-bold text-slate-700 font-sans">
                    👤 ご紹介：{story.participants}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-slate-100 pt-3.5">
                  {story.description}
                </p>
              </div>
            ))
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
                to="/register" 
                className="px-6 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail size={15} />
                <span>無料会員登録して手紙を流す</span>
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



export const POLICE_PRESENTATION_SCENARIOS = [
  "お忙しい中お時間をいただき誠にありがとうございます。ReMEETs（リミーツ）運営セキュリティ安全対策部と申します。本日は、思い出キーワード認証付き自動防衛型再会プラットフォーム『ReMEETs』の治安コンプライアンス適合性についてご説明いたします。本サービスは、既存の見知らぬ相手を宛てがうマッチングアプリの有害・危険性をシステム構造から100%排除し、思い出のある知人同士だけが再び巡り会える安全第一のコミュニティです。警察との平時からの連動設計についてご紹介いたします。",
  "当サービスの『ReMEETs（リミーツ）』という名前は、『Re-meet（再びあう、再会する）』の複数形を意味します。新規の交際相手を探す一般的な『Meet』とは完全に定義が異なり、過去の想い出を共有している大切な相手と、時の壁を超えて2度目の巡り合わせを得る場所となります。",
  "物理的距離や年月の経過、不慮の災害等により連絡手段を失ってしまった相手へ、想い出のエピソードを『ボトルメール（手紙）』に託してネットの海へ漂流させます。実名や住所は出さず、想い出のピースを検索をかけた当事者だけが受け取る、美しく静かで安全なプライベート優先のシステムです。",
  "若者・高齢者の孤独死問題や、自然災害等に伴うネットワークの断絶という日本社会の重要課題を解決するために作られました。見知らぬ者同士の出会いを仲介する有害性を構造から弾き、かつて信頼関係を築いていた強固な人間関係の修復のみを促し、社会のウェルビーイングを向上させます。",
  "知らない人とマッチングすること（ネットナンパ等）を嫌い、事件やプライバシー侵害を強く不安に感じる、セキュリティ意識の高い一般市民を対象としています。本当に探している信頼できるお相手にだけエピソードを届けたいと願う安心なユーザーが集う空間です。",
  "ボトルメールの投函時、本名や連絡先、過度なプロファイル情報は一切露呈されません。漂流ボトルを検索キーワード等でお相手が探し当てるまでの間、完全に匿名の思い出話としてのみ表示されます。アタッカーがターゲットを直接特定し晒し行為を行う余地はありません。",
  "本サービスの絶対的なセーフガードである『想い出クイズ』です。メッセージを解凍して連絡先開示（引き渡し）を受けるには、投函者が設定した『当事者二人以外は一生知り得ない独自のクイズ』（例：一緒に海で食べたアイスの味、高橋先生のお祝いなど）に1文字の狂いもなく完全正答する必要があります。無関係な他者の強行突破を数学的・構造的に完封します。さらに、表記ゆれ救済アルゴリズム（ひらがな/カタカナ正規化・レーベンシュタイン距離）により、正当な当事者同士の再会をスムーズに支援します。",
  "クイズの一致に成功し本人確認（eKYC）と開通手続きを経た後、安全な連絡先引き渡し（ブリッジ）を実施します。必要な連絡先（LINE ID等）を安全に合意開示した段階でプラットフォームの役割を美しく完結させるセキュア・ブリッジモデルを採用。万が一の不審な接触に対しては、1タップで即座に通報・遮断できる緊急ブロックを常備しています。",
  "運営管理者側では、不当な言葉の連続試行や、ブルートフォース（総当たり解答攻撃）、複数ボトルへの連続アプローチなどの怪しい兆候を、リアルタイムかつ24時間体制でセキュア監視するオペレーション・ダッシュボードを完備し、不正接続を即座に検知・自動排除します。",
  "AIやフィルタによって悪質ストーカー・迷惑業者と検知されたログに対し、単に使用停止エラーを返すと彼らは改ざんして再アプローチしてきます。当店では、アタッカー側のみ送信成功（擬態表示）としつつ、内部DBでは一瞬で隔離・非表示とする『シャドウフラグ技術』を採用。攻撃側の犯行意欲を無音で根絶します。",
  "個人情報保護のため、すべての送受信データはTLS 1.3により高度暗号化され、クイズ解答やパスワード等の核心データは、不可逆かつ強力なソルトハッシュにて保管されます。いかなるクラッキングや漏洩の恐れもない、金融機関クラスの安全性を遵守します。",
  "ReMEETsでは『忘れられる権利』および被探索者（探される側）の断る権利を保護するため、オプトアウト申請窓口をフッター等に常設しています。申請から24時間以内に運営安全委員会が情報を精査し、該当ボトルを完全物理削除・不活性化します。",
  "クライアントに一切のデータベースや外部AI（Gemini API）の生アクセスキー情報を開示しない、 Expressによる『中間プロキシバックエンドサーバー』の構成。生機密データがブラウザ上で盗み見・改変されるリスクは物理的にゼロである堅牢なアーキテクチャです。",
  "未知の男女を引き合わせる既存アプリは出会い系犯罪の温床にならざるを得ません。対照的に、ReMEETsは過去の共有想い出を正確に一言一句認証した既知のペアだけをゲートを通すクローズド構造であるため、ストーカーや犯罪へ悪用される可能性を理論上100%封鎖しています。",
  "これより後半に入ります。本番運用における『インターネット異性紹介事業』非該当である確たる法理証明の定義、ならびに警察から正式要請を受理した際の、1秒でのフォレンジックログ（証拠）のエクスポート・共同戦線体制の実務フローについて解説します。",
  "出会い系サイト規制法第2条における定義は『面識のない異性との交際を仲介・促進するサービス』です。ReMEETsは共有想い出クイズ認証がないと通信が一切開始できないシステムであるため、見知らぬ異性同士は絶対に繋がれません。よって、本サービスは異性紹介事業への届出手続きが【完全不要・非該当】である法理証明が完璧に成り立ちます。",
  "出会い系法が規制を行う真の目的は、身元の不確かな第三者同士が無作法に接触し犯罪被害が発生することです。ReMEETsはクイズというメモリキー（記憶認証）により、すでに面識がある知人同士に限定するため、法の本来目指す絶対の安全性を完全に補強し支援します。",
  "あてずっぽうでの総当たり想い出解凍（ブルートフォースアプローチ）への対策。同一接続元から5回連続で回答を失敗した場合、プログラム的に24時間の完全ロックアウトを行います。執着するストーカーや攻撃者はプログラムが自動で息の根を止めます。",
  "他人の本名フルネームを勝手に用いてボトルを投函したり晒しを行う行為への対策。ニックネーム設定やタイトル部への入力時に、『日本常用姓名辞書』データと精査・照合をかけます。本名一致度が高い場合は、自動警告により入力を厳格に規制します。",
  "外部SNSへの無断誘導、詐欺、売春交渉を防止するため、メール、電話、LINE ID等の掲載をRegex（正規表現）でリアルタイム監視。検知された個人連絡先情報はデータベース保存前に強制的に『****』等へステルス置換。メッセージ内から外部誘導経路を完全に断ちます。",
  "記号を混ぜたフィルタ逃れ（例：ラ_イ_ン 等）や、ストーカー特有の想い出を装った精神的な嫌がらせ、脅迫的なしがみつき感情を意味解析するため、世界最高レベルの Google Gemini AIによるリアルタイム感情・文脈監査モデレーションを常時バインド。悪質な投稿は1秒で自動的に不認可とし露出を断ちます。",
  "悪質ユーザーとの泥仕合を避け、被害者の安全を守るステルス技術。危険な回答や送信に対して、送信完了を擬態表示しながら裏DBでは隔離する『シャドウフラグ技術』を活用。迷惑ユーザーには気付かせずに活動を停止させ、攻撃の連鎖や被害の拡大を防ぎます。",
  "18歳未満、及び高校生の登録は規約および生年月日入力・証明書提出ゲート連携により完全不許可としています。青少年を甘言、児童売春、ストーカーなどの犯罪被害に絶対に巻き込ませない、青少年の完全保護コンプライアンス管理を断行します。",
  "クイズ一致を突破したお相手との連絡先開示（セキュアブリッジ）直前に、利用宣誓チェックによる『法令遵守・ストーカー禁止・虚偽申告防止の電子的宣誓』を必須化しています。宣誓完了時のタイムスタンプ、接続元IPアドレス、認証識別子を改ざん不可能な監査ログとして確実に保全。漏洩リスクをゼロに抑えつつ司法物証を確保し、強固な心理的抑止力を与えます。",
  "ユーザーからの通報・相談・問い合わせ履歴は、管理者からの公式返信、さらにその後のユーザーからの追加返信に至るまで、全送受信ログをデータベースにチケットトークン（ticket_token）でスレッドとして完全永続保全。さらにGemini AIを活用したコンプライアンス適合返信ドラフト自動生成機能により、警察ガイドラインや規約に即した迅速かつ的確な対応を実現しています。",
  "年齢・身元確認と料金体系について、完全な透明性を確保しています。【無料の年齢誓約（グリーン）】による18歳以上確認と、【600円の公的身分証eKYC認証（オレンジ）】による公的証明書確認を視覚的にも機能的にも明確に分離。利用者が誤認することのないクリーンなインターフェースを提供しています。",
  "ユーザーの身元保証と安全な取引を担保するため、本人確認機関（TRUSTDOCK等）と決済インフラ（Stripe）を完全分離して連携する2社分離設計を採用。メッセージ開通時の本人確認を義務付け、審査に【不合格】となった際は600円の仮売上（オーソリ）が即座に自動全額返金されます。承認済ユーザーにのみ認証マークが点灯し、安心・公正な身元確認を実現します。",
  "生活安全課、サイバー犯罪対策課、裁判所等から正式に『刑事訴訟法第197条第2項に基づく捜査事項照会書』の交付を受理した際、管理者パネルから『日付期間指定フィルター』を用いてワンボタンで、対象期間中の全接続履歴（IPアドレス、電子的宣誓ログ、アクセスUA、送信ワード）をまとめたA4のフォレンジック報告用PDFおよびCSVが瞬時に自動出力されます。警察の皆様に事務負担をかけず即時提供が可能です。",
  "探索（探される）側から『昔の知人に自分を探してほしくない、勝手に想い出を流されて不満である』という削除要請に対して、フッターよりオプトアウト窓口を常設しています。受付から24時間以内に運営安全委員会が情報を精査し、該当ボトルデータを完全物理削除・不活性化します。",
  "ReMEETsは、孤独と社会的断絶を解消する全く新しい安心のインフラです。未知の出会いを排除し、思い出による強固なセキュリティを全編に敷き詰めて運営されます。警察・サイバー課関係機関の皆様とも密に連携して、社会のウェルビーイングに貢献いたします。以上で説明を終了します。ありがとうございました。"
];



export const DEFAULT_AUTH_MEMO = `【認証設計・治安/安全対策 ＆ 警察捜査協力に関する決定事項備忘録】

◆ 1. 認証設計をめぐる議論の軌跡と合意事項
分類：[実証版（体験版）でのモック化]
・提案・決定事項：テスターや審査官（警察や行政等）が「1台の検証端末」からスムーズに複数アカウント（投函者役とお相手役）を作って、クイズ回答や電子的利用宣誓、捜査用ログPDF出力のコア防衛機能をスピーディに評価・実証検証できるように、現在は「パスワード不要、SMS等はボタン付きモック」の簡易疎通仕様にしておく。
・サイト上の実装：アカウント作成画面や認証テスト時に、複数アカウントを迅速作成・ロール切り替えできる実証用ボタンとモックUIが構築されています。

分類：[本番公開時の1人1番号SMS認証]
・提案・決定事項：ユーザーの重複アカウント偽装や、追放されたストーカーの別IP・別アドレスによる再アタック（クイズ総ざらい・ブルートフォースアタック）を技術的に100%水際で封鎖するため、本番リリース時は携帯電話番号を使った「SMS認証（Firebase Auth ＋ Twilio API連携）」を必須仕様とし、1電話番号・1デバイス1アカウントに厳格に縛る。
・サイト上の実装：資料ポータルの「⑧ システム基本要件定義書 (System Requirements Definition Document)」に、Twilio SMS連携の実装定義とブラックリスト自動封鎖仕様が明確に記載されている。

分類：[個人情報の「非保持型」＆ 外部サーバー暗号化保存オンデマンド表示設計]
・提案・決定事項：メールアドレス、SNS ID、連絡先等の機微な個人情報は、当Webサーバー/メインデータベース上には直接保持・永続管理せず、最高度の暗号化を施した外部専用セキュリティサーバー（Firebase Auth / Supabase Vault / GCP Secret Manager等）に分離して完全暗号化保存する。ユーザーが画面上で自身の情報や相手の連絡先を表示・確認するタイミングにのみ、認証トークンとアクセス権限を検証した上で外部サーバーからセキュアにオンデマンドで読み出して一時表示する「分散暗号化 ＋ オンデマンド非保持型表示」アーキテクチャを採用する。
・効果・目的：万が一メインWebサーバーに攻撃や不正アクセスが発生した場合でも、個人情報の流出リスクをシステム構造上ゼロ（100%遮断）にし、プライバシー保護と治安・セキュリティ適合を極限まで引き上げる。
・サイト上の実装：同システム基本要件定義書および警察協議用セキュリティ報告書に、外部暗号化保存 ＋ オンデマンド読み出し表示による最高レベルのセキュリティ規格が明記されている。

◆ 2. LINE / Google / Facebook 外部SNS連携時の警察捜査開示データ仕様
本番運用時にSMS認証ではなく「LINE / Google 等 of ソーシャルOAuthログイン」を採用する場合、もし警察から正当な捜査令状や捜査事項照会書によるアカウント情報の開示請求があった際、当サービスから提供するデータ（およびLINE社等のプロバイダから取得して保持しておくデータ）の仕様は以下の通りである。

【当プラットフォーム側で保持・提出可能なデータ一覧】
① LINEのシステム固有ユーザーID（「U123456...」等の内部一意識別テキスト）
   ※LINE社が発行する識別子。これにより警察はLINE社に対して該当ユーザーの「登録氏名」「電話番号」「住所」の開示請求を直接行うことが可能となる。
② ユーザーが登録時・連携時に同意したメールアドレス（取得可能な場合）
③ 本サービス内での登録日時／最終ログイン日時／接続元グローバルIPアドレス
④ クイズ作成／回答履歴、違反ペナルティ履歴、電子的利用宣誓・同意ログデータ

【補足：インターネット異性紹介事業届出（警察・公安委員会）に関する法的確約】
本システム「ReMEETs」は、不特定多数が自由に異性を検索して出会うマッチングアプリではなく、相互の「過去の共通の個人的想い出クイズ」に正解し、合意宣誓を経た【既知・面識のある者同士の安全な再疎通】を支援するコンプライアンス特化型ツールであるため、法律上の「インターネット異性紹介事業」には該当しません。警察・公安委員会との健全な対話・実証実験に向け、本ドキュメントポートフォリオおよびソースコードは完全にクリーンに整備されています。`;

export const AdminDeploymentGuideBlock = ({ 
  docType, 
  setDocType 
}: { 
  docType: 'deployment' | 'cost_estimate' | 'cost_list_detailed' | 'permit' | 'police' | 'consult' | 'matrix' | 'slides' | 'scenario' | 'requirements' | 'evaluation' | 'pr_plan' | 'legal_guide'; 
  setDocType: (val: 'deployment' | 'cost_estimate' | 'cost_list_detailed' | 'permit' | 'police' | 'consult' | 'matrix' | 'slides' | 'scenario' | 'requirements' | 'evaluation' | 'pr_plan' | 'legal_guide') => void;
}) => {
  const [smsCount, setSmsCount] = React.useState<number>(1000);
  const [costTab, setCostTab] = React.useState<'running' | 'initial'>('running');
  const [subTab, setSubTab] = React.useState<'memo_alert' | 'deploy_basic' | 'pr_strategy'>('memo_alert');
  const [evaluationDateTab, setEvaluationDateTab] = React.useState<'2026-09-05' | '2026-08-24' | '2026-08-15'>('2026-09-05');

  React.useEffect(() => {
    if (['deployment', 'cost_estimate', 'cost_list_detailed', 'permit', 'requirements', 'legal_guide'].includes(docType)) {
      setSubTab('deploy_basic');
    } else if (['evaluation', 'pr_plan', 'slides'].includes(docType)) {
      setSubTab('pr_strategy');
    }
  }, [docType]);

  const renderInitialCostSimulator = () => {
    return (
      <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between h-full min-h-[460px] space-y-4 font-sans text-slate-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>初期導入・セットアップ費用 (イニシャルコスト)</span>
            </h4>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-300 font-mono">二段階導入可能</span>
          </div>

          {/* 各設定費用一覧 */}
          <div className="space-y-1.5 text-[10.5px]">
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🌐</span> LINE ＆ Google 認証連携
                </span>
                <span className="text-[9px] text-slate-400">各Developersアカウント作成・認証API利用</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">￥0</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>💳</span> Stripe 本番決済アカウント
                </span>
                <span className="text-[9px] text-slate-400">加盟店審査・APIキー発行（月額基本料なし）</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">￥0</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🔍</span> 公的本人確認 eKYC
                </span>
                <span className="text-[9px] text-slate-400">外部本人確認SDK連携（初期費無償プラン利用時）</span>
              </div>
              <span className="font-mono text-slate-200 text-xs">￥0 <span className="text-[9px] text-slate-500">(従量のみ)</span></span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🏢</span> 特商法表記 住所/登記
                </span>
                <span className="text-[9px] text-slate-400">格安バーチャルオフィス契約 (月換算約990円〜)</span>
              </div>
              <span className="font-mono text-slate-200 text-xs">￥990 <span className="text-[9px] text-slate-500">〜</span></span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🔒</span> 独自ドメイン取得 (初年度)
                </span>
                <span className="text-[9px] text-slate-400">.com / .tokyo 等のドメイン年更新料</span>
              </div>
              <span className="font-mono text-slate-200 text-xs">￥100 <span className="text-[9px] text-slate-500">〜 ￥1,500</span></span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🚀</span> サーバー・DBセットアップ
                </span>
                <span className="text-[9px] text-slate-400">Firebase Auth / Firestore (スキーマ・ルール構築)</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">￥0</span>
            </div>
          </div>
        </div>

        {/* 初期費用まとめ */}
        <div className="pt-2 border-t border-slate-800 flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>🚀</span> 立ち上げ初期コスト目安 :
            </span>
            <span className="text-lg font-mono font-bold text-cyan-400">
              ￥1,090 <span className="text-xs text-slate-400">〜 ￥2,500</span>
            </span>
          </div>
          <p className="text-[9px] text-amber-300 leading-relaxed bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-left">
            ※ <strong>完全無料のフェーズ1リリース</strong>では有料機能を非表示とするため、特商法表記やバーチャルオフィス代も<strong>完全￥0</strong>で開始可能です！
          </p>
        </div>
      </div>
    );
  };

  const renderCostSimulator = () => {
    return (
      <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between h-full min-h-[460px] space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>本番想定運用コスト (月間見積)</span>
            </h4>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">1通当たり10円換算</span>
          </div>

          {/* SMS送信数スライダー */}
          <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-300 font-bold">想定SMS認証件数 (月間) :</span>
              <span className="text-amber-400 font-mono font-bold text-sm bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {smsCount.toLocaleString()} <span className="text-[10px] text-slate-400">通</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={smsCount}
              onChange={(e) => setSmsCount(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>0通</span>
              <span>2,500通(初期時目安)</span>
              <span>5,000通(中規模)</span>
              <span>10,000通(大規模)</span>
            </div>
          </div>

          {/* 各項目コスト一覧 */}
          <div className="space-y-1.5 text-[10.5px]">
            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>📡</span> サーバー (Cloud Run)
              </span>
              <span className="font-mono text-slate-200">
                {smsCount < 1000 ? '￥0 (無料枠内)' : smsCount < 4000 ? '￥1,500' : '￥3,500'}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>🗄️</span> データベース (Firebase Firestore)
              </span>
              <span className="font-mono text-slate-200">￥0 <span className="text-[8px] text-slate-500">(Sparkプラン無料枠内)</span></span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>💬</span> SMS認証 (Twilio API)
              </span>
              <span className="font-mono text-amber-400 font-bold">
                ￥{(smsCount * 10).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>✉</span> メール配信 (SendGrid等)
              </span>
              <span className="font-mono text-slate-200">
                {smsCount < 3000 ? '￥0 (無償プラン内)' : '￥1,100 (1.2万通超)'}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>🌐</span> ドメイン更新料
              </span>
              <span className="font-mono text-slate-200">￥100 <span className="text-[8px] text-slate-500">(年換算)</span></span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>🤖</span> 外部AI & 地図API (Gemini等)
              </span>
              <span className="font-mono text-slate-200">￥1,200 <span className="text-[8px] text-slate-500">(従量目安)</span></span>
            </div>
          </div>
        </div>

        {/* 合計コスト */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <span>💰</span> 合計概算月額コスト :
          </span>
          <span className="text-lg font-mono font-bold text-cyan-400">
            ￥{(
              (smsCount < 1000 ? 0 : smsCount < 4000 ? 1500 : 3500) + // Server
              0 + // Database (Firebase Spark Plan Free)
              (smsCount * 10) + // SMS
              (smsCount < 3000 ? 0 : 1100) + // Email
              100 + // Domain
              1200 // AI & Map
            ).toLocaleString()} <span className="text-xs text-slate-400">/月</span>
          </span>
        </div>
      </div>
    );
  };
  const [authMemo, setAuthMemo] = React.useState<string>(() => {
    try {
      const key = 'remeets_auth_memo_v3';
      const saved = localStorage.getItem(key);
      if (saved) return saved;

      // 移行・マージ措置: 古いキーが存在し、かつLINE連携の記載が無ければ自動で最新版を適用する。
      const oldSaved = localStorage.getItem('remeets_auth_memo');
      if (oldSaved && oldSaved.includes('LINE / Google')) {
        localStorage.setItem(key, oldSaved);
        return oldSaved;
      }
    } catch (e) {
      console.warn('localStorage reading is restricted or failed:', e);
    }
    return DEFAULT_AUTH_MEMO;
  });
  const [memoSaved, setMemoSaved] = React.useState<boolean>(false);
  const [memoReset, setMemoReset] = React.useState<boolean>(false);

  const handleSaveMemo = () => {
    try {
      localStorage.setItem('remeets_auth_memo_v3', authMemo);
      localStorage.setItem('remeets_auth_memo', authMemo);
    } catch (e) {
      console.warn('localStorage saving is restricted or failed:', e);
    }
    setMemoSaved(true);
    setTimeout(() => setMemoSaved(false), 3000);
  };

  const handleResetMemo = () => {
    setAuthMemo(DEFAULT_AUTH_MEMO);
    try {
      localStorage.setItem('remeets_auth_memo_v3', DEFAULT_AUTH_MEMO);
      localStorage.setItem('remeets_auth_memo', DEFAULT_AUTH_MEMO);
    } catch (e) {
      console.warn('localStorage resetting is restricted or failed:', e);
    }
    setMemoReset(true);
    setTimeout(() => setMemoReset(false), 3000);
  };

  const [showChecklistModal, setShowChecklistModal] = React.useState<boolean>(false);
  const [activeChecklistTab, setActiveChecklistTab] = React.useState<'deploy' | 'operation'>('deploy');

  React.useEffect(() => {
    if (showChecklistModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showChecklistModal]);

  const [checklistItems, setChecklistItems] = React.useState<any[]>(() => {
    const defaultItems = [
      { id: 1, category: "インフラ・DB", title: "本番用マネージドRDBMS (PostgreSQL / Cloud SQL) のプロビジョニング", description: "SQLiteからSupabaseまたはGoogle Cloud SQL (PostgreSQL) の本番用高可用性インスタンスを作成し、接続準備を整えます。", completed: false, date: "", notes: "" },
      { id: 2, category: "インフラ・DB", title: "DATABASE_URL 環境変数のサーバーシークレット設定", description: "パスワードを含むDB接続文字列をCloud Run等のサーバー環境変数に安全なシークレットとして設定します。", completed: false, date: "", notes: "" },
      { id: 3, category: "インフラ・DB", title: "データベース初期テーブルスキーマのマイグレーション実行", description: "Drizzle ORM等を使用し、本番の空DBに対してテーブル構造、インデックス、外部キー制約を一括適用します。", completed: false, date: "", notes: "" },
      { id: 4, category: "インフラ・DB", title: "本番独自ドメインの常時SSL/TLS証明書（HTTPS）およびHSTS設定", description: "OAuthログインやStripe決済の安全性・完全性を担保するため、ドメイン全域での常時暗号化通信を強制します。", completed: false, date: "", notes: "" },
      { id: 5, category: "インフラ・DB", title: "DB自動デイリーバックアップ＆世代管理の有効化", description: "万が一のデータ破損や攻撃に備え、自動デイリースナップショット（保持期間7〜14日間）を有効化します。", completed: false, date: "", notes: "" },
      { id: 6, category: "APIキー設定", title: "Google AI Studio / Vertex AI (Gemini API) 商用本番キーの発行", description: "クレジットカードを登録し従量課金を有効化した本番専用の GEMINI_API_KEY を環境変数に設定します。", completed: false, date: "", notes: "" },
      { id: 7, category: "APIキー設定", title: "Resend / SendGrid (メール配信API) の本番接続＆DNS設定", description: "独自ドメインのSPF/DKIM/DMARC設定を完了し、送信到達率を100%近くまで高めた配信APIキーをセットアップします。", completed: false, date: "", notes: "" },
      { id: 8, category: "APIキー設定", title: "SMS認証プロバイダー（Twilio / EZSMS等）の本番キー＆送信元設定", description: "なりすまし防止・二重登録防止のためのSMS携帯電話番号認証（従量課金）の本番APIキーと発信元番号を設定します。", completed: false, date: "", notes: "" },
      { id: 9, category: "APIキー設定", title: "Stripe (決済代行インフラ) 本番キーの契約とWebhook署名設定", description: "Stripe本番加盟店審査を完了し、STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET を安全に設定します。", completed: false, date: "", notes: "" },
      { id: 10, category: "データ管理", title: "開発用テストデータの完全クリーンアップ (初期化) 実行", description: "管理画面のクリーンアップ機能を使用し、開発期間中に蓄積された不要なテストデータを物理消去します。", completed: false, date: "", notes: "" },
      { id: 11, category: "データ管理", title: "情緒豊かな本番サンプルデータの一括自動生成 (Seeding)", description: "ローンチ直後の過疎感を防ぐため、実在感のある日本の想い出ボトルメールや感謝レターを一括投入します。", completed: false, date: "", notes: "" },
      { id: 12, category: "SNS連携", title: "LINE / Google Developers コンソールでの本番クライアント作成", description: "本番ドメインのログインリダイレクトURIやブランド名、プライバシーポリシーURLを各開発者ポータルに登録します。", completed: false, date: "", notes: "" },
      { id: 13, category: "SNS連携", title: "LINE_CHANNEL_SECRET / GOOGLE_CLIENT_SECRET の環境変数追記", description: "安全なSNS認証（OAuth）を行うため、各クライアントIDと秘密鍵を本番サーバー環境変数に設定します。", completed: false, date: "", notes: "" },
      { id: 14, category: "法務・規約", title: "利用規約（TOS）のSNS連携・連絡先引き渡しモデル改訂", description: "連絡先安全引き渡し（セキュア・ブリッジ）モデル、使い捨てアカウント禁止条項を明文化します。", completed: false, date: "", notes: "" },
      { id: 15, category: "法務・規約", title: "プライバシーポリシー（PP）のOAuth取得データ明記・改訂", description: "SNSログインで取得するプロファイル情報およびeKYC身分証データの安全な管理体制を開示します。", completed: false, date: "", notes: "" },
      { id: 16, category: "法務・規約", title: "特定商取引法に基づく表記の整備（住所・電話番号対策）", description: "バーチャルオフィス住所・050電話番号を契約し、販売価格（600円〜1,200円）や返金規定を特定商取引法ページに記載します。", completed: false, date: "", notes: "" },
      { id: 17, category: "法務・規約", title: "全法的文書（規約・PP・ガイドライン・特商法）の【制定日・施行日】確定", description: "利用規約、PP、ガイドライン、特商法表記の制定日・施行日を正式サービス提供開始日（2026年8月15日）に一括整合します。", completed: true, date: "2026-08-15", notes: "2026年8月15日に全文書の制定日・施行日を正式反映完了済" },
      { id: 18, category: "セキュリティ", title: "スロットリング型動的APIアクセスレート制限のポリシー設定", description: "DoS攻撃やクイズの総当たり自動回答スパムを防ぐため、秒間API制限しきい値を調整・固定します。", completed: false, date: "", notes: "" },
      { id: 19, category: "最終テスト", title: "公的 eKYC・SMS認証・電子的宣誓・Stripeテスト決済の総合疎通テスト", description: "お相手との想い出照合・連絡先開示手数料決済、SMS認証、電子的利用宣誓同意、本人確認書類提出が連動して正常動作するか最終検証します。", completed: false, date: "", notes: "" },
    ];

    try {
      const saved = localStorage.getItem('remeets_deploy_checklist_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = defaultItems.map(defItem => {
            const savedItem = parsed.find((p: any) => p.id === defItem.id);
            if (savedItem) {
              return {
                ...defItem,
                completed: !!savedItem.completed,
                date: savedItem.date || "",
                notes: savedItem.notes || ""
              };
            }
            return defItem;
          });
          localStorage.setItem('remeets_deploy_checklist_progress', JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.warn('localStorage read or auto-migration failed:', e);
    }
    return defaultItems;
  });

  const [operationChecklistItems, setOperationChecklistItems] = React.useState<any[]>(() => {
    const defaultOps = [
      { id: 1, category: "1. 登録・認証・ログイン", title: "新規登録・入力バリデーション＆パスワードリセット検証", description: "パスワード強度チェック、重複メールアドレス登録時の適切なエラー表示、およびパスワード再設定フローが機能するか検証します。", completed: false, date: "", notes: "" },
      { id: 2, category: "1. 登録・認証・ログイン", title: "LINE / Google OAuthログイン連携テスト", description: "本番ドメインでLINE/Googleログインが正常に起動し、ユーザープロファイル（ニックネーム、画像、メールアドレス）が取得できるか検証します。", completed: false, date: "", notes: "" },
      { id: 3, category: "1. 登録・認証・ログイン", title: "利用規約同意・18歳以上確認＆セッション維持テスト", description: "初回登録時の利用規約・PP同意と18歳以上確認が必須化され、ブラウザリロード後もセッションが維持されるか検証します。", completed: false, date: "", notes: "" },
      { id: 4, category: "2. 手紙投函・AI検閲", title: "ボトル（手紙）新規作成・秘密の想い出クイズ登録テスト", description: "宛名、ゆかりの地、手紙本文、想い出クイズ（質問・正解・表記ゆれ別解）が破損なくDBに保存・投函されるか検証します。", completed: false, date: "", notes: "" },
      { id: 5, category: "2. 手紙投函・AI検閲", title: "フルネーム判定（常用姓名辞書）ガード検証", description: "プロフィールや手紙内に日本の常用姓名辞書に基づくフルネーム（実名）を入力した際、検閲警告・ブロックされるか検証します。", completed: false, date: "", notes: "" },
      { id: 6, category: "2. 手紙投函・AI検閲", title: "AI自動検閲（誹謗中傷・個人情報・脅迫）フィルターテスト", description: "手紙本文に脅迫・暴言や直接の連絡先（電話番号、他SNS ID）を入力し、AIモデレーションが自動で隔離・警告するか検証します。", completed: false, date: "", notes: "" },
      { id: 7, category: "3. 検索・秘匿性", title: "キーワード検索・年代地域フィルター＆本文マスキング検証", description: "名前や学校名で検索し、該当手紙がヒットすること、およびクイズ未正解の段階で本文・連絡先が完全に秘匿されているか検証します。", completed: false, date: "", notes: "" },
      { id: 8, category: "4. クイズ照合・本人認証", title: "想い出クイズ完全一致判定 ＆ 表記ゆれ救済テスト", description: "質問に完全正解（または登録された表記ゆれ別解）を入力した際、即座に想い出一致（照合成功）画面へ遷移するか検証します。", completed: false, date: "", notes: "" },
      { id: 9, category: "4. クイズ照合・本人認証", title: "クイズ不正解時の安全遮断 ＆ ブルートフォース制限テスト", description: "誤答時に本文が絶対に開示されないこと、および連続誤答時に一時ロックアウト（レート制限）がかかるか検証します。", completed: false, date: "", notes: "" },
      { id: 10, category: "5. SMS・eKYC・宣誓", title: "SMS認証コード実機送信・6桁照合・1日3回制限テスト", description: "実機スマホへSMS認証コードが即時届き、6桁入力で認証が通ること、およびいたずら防止レート制限（1日最大3回）が作動するか検証します。", completed: false, date: "", notes: "" },
      { id: 11, category: "5. SMS・eKYC・宣誓", title: "公的証明書（免許証/マイナンバー）アップロード＆eKYC審査テスト", description: "身分証画像が安全にアップロードされ、審査合否ステータスおよび公的認証バッジが正しく更新されるか検証します。", completed: false, date: "", notes: "" },
      { id: 12, category: "5. SMS・eKYC・宣誓", title: "電子的利用宣誓（法令遵守・ストーカー禁止）合意テスト", description: "連絡先開示前の誓約確認画面で、利用宣誓チェック項目への明示的同意が必須化され、合意タイムスタンプ・IPログが安全保存されるか検証します。", completed: false, date: "", notes: "" },
      { id: 13, category: "6. 決済・連絡先開示", title: "Stripe本番決済（開通手数料600円〜1,200円）疎通テスト", description: "開通ボタン押下時にStripe決済画面が起動し、クレジットカード決済が遅延なく正常に完了するか検証します。", completed: false, date: "", notes: "" },
      { id: 14, category: "6. 決済・連絡先開示", title: "決済完了後の即時連絡先開示（双方向引き渡し完結）検証", description: "決済完了直後にお手紙全文と相手の優先開示連絡先（LINE ID等）が表示され、安全な連絡先引き渡しをもって完結するか検証します。", completed: false, date: "", notes: "" },
      { id: 15, category: "6. 決済・連絡先開示", title: "eKYC審査不合格時のStripe自動返金（仮売上取消）テスト", description: "本人確認審査で不合格となった場合、Stripeで仮決済された手数料が自動的かつ即座にオーソリ取消・返金されるか検証します。", completed: false, date: "", notes: "" },
      { id: 16, category: "7. マイページ・手紙管理", title: "優先開示連絡先の設定・投函ボトル回収（削除）テスト", description: "自身のLINE ID等の更新保存、および投函ボトルの回収（完全消去）時に検索結果から即時非表示となるか検証します。", completed: false, date: "", notes: "" },
      { id: 17, category: "8. 管理者・問い合わせ・警察", title: "お問い合わせ・通報チケット送受信 ＆ Gemini AI返信ドラフト生成テスト", description: "ユーザーのお問い合わせがチケットDBに安全に記録され、管理画面でGemini AIによるコンプライアンス返信ドラフトが自動生成されるか検証します。", completed: false, date: "", notes: "" },
      { id: 18, category: "8. 管理者・問い合わせ・警察", title: "管理者ダッシュボードKPI・AI通報ログ＆ユーザー緊急凍結検証", description: "統計メトリクス表示、AI検閲通報ログのリアルタイム確認、問題ユーザーのワンクリックBAN機能が正常動作するか検証します。", completed: false, date: "", notes: "" },
      { id: 19, category: "8. 管理者・問い合わせ・警察", title: "警察提出用・電子的宣誓同意ログ付き監査CSVエクスポートテスト", description: "司法捜査機関からの開示要請を想定し、電子的宣誓同意ログおよび認証イベント履歴を含んだ監査CSVが出力できるか検証します。", completed: false, date: "", notes: "" },
      { id: 20, category: "9. レスポンシブ表示", title: "スマートフォン実機表示 (iOS Safari / Android Chrome) 検証", description: "iPhone/Androidの実機幅で横スクロールや文字欠けが発生せず、タップターゲット（44px以上）が押しやすいか検証します。", completed: false, date: "", notes: "" },
      { id: 21, category: "10. セキュリティ・異常系", title: "未ログイン時ガード・他者ボトル不正編集遮断テスト", description: "ログイン必須ページへの未認証アクセス制限、およびURL直打ちによる他者ボトル不正操作が確実に403拒否されるか検証します。", completed: false, date: "", notes: "" },
      { id: 22, category: "10. セキュリティ・異常系", title: "回収済みボトルアクセス遮断＆APIレート制限（DoS防御）テスト", description: "削除済みボトルの安全遮断案内表示、および短時間の大量リクエストに対する429 Too Many Requests防御を検証します。", completed: false, date: "", notes: "" }
    ];

    try {
      const saved = localStorage.getItem('remeets_ops_checklist_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = defaultOps.map(defItem => {
            const savedItem = parsed.find((p: any) => p.id === defItem.id);
            if (savedItem) {
              return {
                ...defItem,
                completed: !!savedItem.completed,
                date: savedItem.date || "",
                notes: savedItem.notes || ""
              };
            }
            return defItem;
          });
          localStorage.setItem('remeets_ops_checklist_progress', JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.warn('localStorage read or auto-migration failed for ops checklist:', e);
    }
    return defaultOps;
  });

  const handleToggleChecklistItem = (id: number) => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    const updated = list.map(item => {
      if (item.id === id) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          date: nextCompleted && !item.date ? new Date().toISOString().split('T')[0] : item.date
        };
      }
      return item;
    });
    setList(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  };

  const handleUpdateChecklistDate = (id: number, date: string) => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, date };
      }
      return item;
    });
    setList(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  };

  const handleUpdateChecklistNotes = (id: number, notes: string) => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    });
    setList(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  };

  const handleResetChecklist = () => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    if (window.confirm('チェックリストの進捗状況をすべてリセットしてもよろしいですか？')) {
      const reset = list.map(item => ({ ...item, completed: false, date: "", notes: "" }));
      setList(reset);
      try {
        localStorage.setItem(key, JSON.stringify(reset));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    }
  };

  const [markdown, setMarkdown] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [activeSlideIdx, setActiveSlideIdx] = React.useState<number>(0);
  const [slides, setSlides] = React.useState<any[]>([
    {
      id: 1,
      title: "ReMEETs (再会のボトルメール)\n「思い出」で再び繋がる、全く新しい安全な再会プラットフォーム",
      subtitle: "既存の出会い系アプリの有害性と危険性を100%排除。想い出クイズゲートと最新AIモデレーションによる『特定面識者限定』クローズドコミュニティの全体像とコンプライアンス実証\n発表者：ReMEETs 運営セキュリティ安全対策部",
      category: "サービス提案書（表紙）",
      points: [],
      layout: 'title'
    },
    {
      id: 2,
      title: "サービス名：ReMEETs（リミーツ）の由来",
      category: "1. サービス概要",
      layout: 'content',
      points: [
        "「Re-meet（再び出会う、再会する）」の複数形であり、過去の特別な時間や場所を一度でも共有したことのある「想い出の知人」との巡り合わせを表しています。",
        "見知らぬ人同士が新たにマッチして「異性交際」等を行う一般的なマッチングサービス（Meet）とは完全に定義が異なります。",
        "過去の知人同士が時間を超えて安全に再び再会すること（Re-meet）にのみ特化したサービス名です。"
      ]
    },
    {
      id: 3,
      title: "サービスコンセプト：『想い出が結ぶ、安全で静かな関係再構築の海』",
      category: "2. コンセプト",
      layout: 'content',
      points: [
        "物理的距離や年月の経過、不慮の災害や引越し等により連絡が取れなくなってしまった大切な人々へ、「手紙（ボトルメール）」をネットの海へ投函するシステムです。",
        "SNSや掲示板のようにプロファイルや内容を大々的に誰にでも公開・拡散するのではなく、検索をあてた当事者だけがアクセスできる「静謐」なプライベート感覚を重視。",
        "届く相手は「かつての面識者（お互い思い出に心当たりのある人）」に完全に限定された、心温まるクローズドな関係再結合スペースです。"
      ]
    },
    {
      id: 4,
      title: "構築・運営の目的：失われた人間関係の再結合によるウェルビーイング向上",
      category: "3. 構築の目的",
      layout: 'content',
      points: [
        "現代日本における社会的課題である「若者・中高年層の孤独死」「地域社会の崩壊」「震災、被災等に伴う知人・隣人ネットワークの断絶」を解決するために構築されました。",
        "新規の無差別出会いに伴う犯罪誘発（ストーカー、未成年売春等）をシステムレベルで徹底排除しつつ、かつて信頼関係のあった貴重な縁だけを結び戻します。",
        "良質な人間関係アセットの修復による社会的精神不安の解消と、健康で豊かな長寿社会への貢献を目指します。"
      ]
    },
    {
      id: 5,
      title: "ターゲットユーザー：無差別の『新たな出会い』を求めない、純粋な再会希望者",
      category: "4. ターゲットユーザー",
      layout: 'content',
      points: [
        "卒業、引越し、転職、定年退職などをきっかけに連絡先が途絶えてしまった「同窓生」「元同期・元同僚」「かつての恩師」を探したい人々。",
        "震災などの自然災害で避難・移動を余儀なくされ、連絡を取る手段を失った「元隣人」「幼馴染」。",
        "事件や他者によるプライバシー侵害を著しく恐れ、かつ他SNS（実名公開による露出）は使いこなせない、または使いたくないと考えるセキュリティ・プライバシー意識の高いユーザー層。"
      ]
    },
    {
      id: 6,
      title: "主要機能（フロント部①）- ボトルメールの投函 ＆ 漂流",
      category: "5. 主要機能（フロントエンド）",
      layout: 'content',
      points: [
        "「ボトル投函」：投函者が、思い出の日付・場所・特徴やあだ名等の「共有手がかり」を詳しく文章に綴って、海のアーカイブに流すインタフェースです。",
        "「ボトルの漂流（閲覧）」：思い出キーワードや年代、漂流地域から誰でも流れているボトルメール（の概要のみ）を検索・発見することができます。",
        "「プライベート優先設計」：相手の実名は一切公開されず、あくまで『思い出のエピソードそのもの』をヒントに、お互いが「もしや自分ではないか？」と気づく動線です。"
      ]
    },
    {
      id: 7,
      title: "主要機能（フロント部②）- 最も根幹をなす『想い出クイズゲート』＆ 表記ゆれ救済",
      category: "5. 主要機能（フロントエンド）",
      layout: 'content',
      points: [
        "ボトルを発見したユーザーが、メッセージを読み進めて「開通」を望む場合、投函者自身が設定した『想い出クイズ』に回答する必要があります。",
        "クイズ例：「私たちの卒業式の次の日に、一緒に行った海で食べたアイスの味は？」「高橋先生が部活の金賞祝いで奢ってくれたのは何アイス？」など、当事者2人以外は一生知り得ない超独自のクエスチョン。",
        "クイズの完全な正答一致（文字列一致）のみが開示の唯一絶対条件であり、これにより「見知らぬ人、無関係な第三者」をハードウェア構造レベルで完全に遮断。さらに日本語正規化（normalizeJapanese）とレーベンシュタイン距離による表記ゆれ救済により、正当な当事者同士の再会を強力に支援します。"
      ]
    },
    {
      id: 8,
      title: "主要機能（フロント部③）- 連絡先安全引き渡し（セキュア・ブリッジ）モデル",
      category: "5. 主要機能（フロントエンド）",
      layout: 'content',
      points: [
        "「厳格な合意ベース開通」：投函者・受取人双方が「想い出クイズ」に100%完全合致し、公的本人確認（eKYC）と開通手続き（600円）が完了した段階でのみ、双方が希望する連絡先（LINE ID, メールアドレス等）を安全に相互開示・引き渡し（ブリッジ）します。",
        "「連絡先安全引き渡し完結型モデル」：想い出の照合と本人確認完了後に合意された連絡先（LINE ID等）を安全に引き渡してプラットフォームの役割を完結させるクリーン設計を採用。不特定多数との無差別なやり取りやトラブル・犯罪リスクをシステム構造上ゼロにします。",
        "「24時間常設の緊急ブロック・通報機能」：連絡先引き渡し後も、万が一お相手の言動にしつこさや不審を感じた場合には、常設された「通報・削除申請」「緊急ブロック」により、1タップで即座に遮断・運営通報が可能です。"
      ]
    },
    {
      id: 9,
      title: "管理・運用機能（バック部①）- セキュリティ・オペレーション・ダッシュボード",
      category: "6. 管理・運用機能（バックエンド）",
      layout: 'content',
      points: [
        "「不正利用者の検知」：システム管理者は、異常なスピードでのクイズ回答試行、不当ワードの連続試行などの兆候を、リアルタイムセキュリティパネルで24時間監視可能です。",
        "「行動トラッキング・不審検知」：同一IP（同一接続元）から異なる複数のボトルに対して回答を行おうとするなど、『総当たり回答攻撃（アビューズ）』を自動で抽出します。",
        "「フォレンジックロギング」：管理者がシステム監査をワンクリックで行え、不正検知の痕跡データベースを完全なコンプライアンス水準で保持します。"
      ]
    },
    {
      id: 10,
      title: "管理・運用機能（バック部②）- シャドウ・フラグ ＆ 隔離モデレーション",
      category: "6. 管理・運用機能（バックエンド）",
      layout: 'content',
      points: [
        "「Gemini AI バックエンド連動」：投函された手紙や送信メッセージは、すべてバックエンドよりGemini AI安全フィルターへ自働転送され、執着や罵倒などの不穏テキストを意味解析します。",
        "「擬態送信（シャドウフラグ）」：不当である（ストーキング目的の隠れた接近）と検知された場合、送信者にはエラーを出さず送信成功のように見せかけながら、データベース上で隔離（一般公開フラグを即時0に設定）。",
        "嫌がらせの回答者や攻撃者は「システムに拒否されていること（検知方法）」に気づかないまま不活性化されるため、別口座からの執拗な再アタックを劇的に無力化します。"
      ]
    },
    {
      id: 11,
      title: "非機能要件①：最高レベルのセキュリティ ＆ データ暗号化",
      category: "7. 非機能部品（品質および安全性）",
      layout: 'content',
      points: [
        "「通信保護」：インターネット上で送受信される全てのデータ、個人情報、およびメッセージ内容は業界標準のTLS1.3によって高度に暗号化保護されています。",
        "「DBハッシュ」：クイズの解答やパスワード、並びにユーザー情報は、管理者であっても生テキストを直接読み解けないセキュアソルトハッシュを施して格納します。",
        "「アクセスコントロール」：本番DBやログサーバーへのアクセスは、最小特権の原則に基づき、運営事務局の最上位安全管理者のみに強固な認証制限を設けて承認付与されます。"
      ]
    },
    {
      id: 12,
      title: "非機能要件②：迅速・完全なオプトアウト（削除・完全消去申請）",
      category: "7. 非機能部品（品質および安全性）",
      layout: 'content',
      points: [
        "「物理オプトアウト、即時消去」：プライバシーと個人の「忘れられる権利」を守るため、誰でも簡単に削除申請ができる『個人情報のオプトアウト受付窓口』をフッター等に常設しています。",
        "「24時間以内緊急対応」：特定の第三者による勝手な想い出の晒しや、誹謗中傷、本人の意に沿わない掲載に対しては、運営セキュリティ常駐監査会が通常24時間以内に文面の検証を行い、速やかに物理消去・遮断を行います。",
        "「匿名保護と説明責任」：申請自体は匿名などで行える一方、申請乱用防止のため、申請時 of IPアドレス等の監査情報を安全かつ極秘に保持します。"
      ]
    },
    {
      id: 13,
      title: "システム構成（アーキテクチャ定義）：堅牢なフルスタックセーフティ設計",
      category: "8. システム構成",
      layout: 'content',
      points: [
        "『フロントエンド』：React 18 + Vite + Tailwind CSS を採用し、直感的なUXと、一切の無駄を削ぎ落とした軽量・高速なセキュリティインターフェースを両立します。",
        "『バックエンドサーバー』：Express（Node.jsベース）によるフルスタックAPIを構築。クライアント側へ生のDB構造や機密変数（API Key等）を絶対に開示・露出させない強固なプロキシサーバー構造。",
        "『データベース ＆ 外部AI』：本番用 Firebase Firestore / Auth（およびローカル検証用SQLite）、ならびに Googleの最先端大規模言語モデル「Gemini API (Google GenAI)」を活用した自律型セマンティック防衛エンジン。"
      ]
    },
    {
      id: 14,
      title: "「新奇の出会い（マッチング）」との構造的な対比分析",
      category: "9. 安全設計適合性の総括",
      layout: 'content',
      points: [
        "「一般のマッチングアプリ」：面識のない、完全に未知の男女を無理に巡り会わせるため、意図的な身元詐称、ストーキング、売春、なりすまし犯罪が根絶できません。",
        "「ReMEETsプラットフォーム」：すでに「過去に強固な面識・共有記憶」を持っていた人同士のみが、その『超ニッチなクイズの完全正答』をお互いの秘密鍵として巡り会う仕組み。",
        "これにより、見知らぬ無関係の人間がアタック、なりすまし、もしくは密接犯罪を起こす確率を構造的かつ数学的に「0%」へと極限抑制することに成功しています。"
      ]
    },
    {
      id: 15,
      title: "【警察庁・公安委員会・監査向け追加資料】\n安全設計適合状況 ＆ 法規厳格遵守に関する要件定義",
      subtitle: "後半パート：監査対応義務、および出会い系法規適合評価における「異性紹介事業非該当」の客観的かつシステム的法理証明\nReMEETs 治安・防衛コンプライアンス管理事務局",
      category: "監査追加資料：扉（ここから後半）",
      points: [],
      layout: 'title'
    },
    {
      id: 16,
      title: "「インターネット異性紹介事業」に【完全非該当】であるシステム的証明",
      category: "リーガル・コンプライアンス（法規適合判定）",
      layout: 'content',
      points: [
        "出会い系サイト規制法第二条における定義は「面識のない異性との交際を仲介・促進するサービス」を行っている事業者と定められています。",
        "ReMEETsは前述の通り、当事者同士しか知り得ない「共有の古い記憶」を一言一句ずれることなく正答認証したペア同士しか、いかなる通信機能も開始できません（想い出クイズゲート）。",
        "したがって、面識のない、偶然出会っただけの見知らぬ異性同士を結びつける機能は物理的に一切排除されているため、異性紹介事業の公安等への届出手続きは【完全不要（非該当）】となります。"
      ]
    },
    {
      id: 17,
      title: "共有記憶認証（メモリキーゲート）の法理解析：なぜ犯罪温床にならないか",
      category: "第51条監査適合性評価：面識性",
      layout: 'content',
      points: [
        "法律が「出会い系」を厳格に規制する本質的な趣旨は、身元の不確かな不特定多数が無差別に密会すること、それによってストーキング、拉致、売春等の治安犯罪が生まれるからです。",
        "ReMEETsは「クイズ回答」という絶対障壁を挟むことで、利用者の通信をすでに「既存の面識・既知の関係者」に厳密に絞り込んでからメッセージを開通します。",
        "この強力な仕組みが、出会い系特有の「無名による不当接触、身勝手なナンパ、変質者の無差別アタック」といった被害発生メカニズムを起動段階で100%封殺します。"
      ]
    },
    {
      id: 18,
      title: "ブルートフォース攻撃を遮断する、強固な「時間制限式ロックアウト自動防衛」",
      category: "安全防衛メカニズム①：不正総当たり拒絶",
      layout: 'content',
      points: [
        "悪質なアタッカー、またはストーカー予備軍が「正答」となる思い出を推測し、でたらめに何十回も回答を送信する行為（ブルートフォース試行）への完全なシステム対策。",
        "同一のアカウント、同一IP、あるいは同一のブラウザセッションから「累計で5回」連続して間違い回答が送られた場合、セキュリティエンジンが瞬時に攻撃を判定検知します。",
        "該当の接続アカウント及びIPアドレスを【24時間アクセス完全ロックアウト（全試行拒否）】。いたずら目的の回答者をプログラム自動化で速やかに撃退します。"
      ]
    },
    {
      id: 19,
      title: "実名・フルネーム晒しを水際で食い止める「日本常用姓名辞書自動照合」",
      category: "安全防衛メカニズム②：実名露出ブロック",
      layout: 'content',
      points: [
        "本人の合意がないまま勝手に実名でボトルを投函されたり、相手の実名や所属・ニックネームにフルネームを使って個人がネット晒しを遭うトラブルに対する徹底的な事前監査。",
        "ニックネームの登録時、及びボトルの見出し設定時に、日本の常用姓名辞書に基づくフルネーム判定（漢字ペアや典型的な姓名配列のチェック）をプログラムが瞬時に精査します。",
        "「山田太郎」などの実名構造を看破した場合、警告画面により『安全のため、ニックネームや本人達にしか解らないあだ名を使用してください』と自動で入力を規制します。"
      ]
    },
    {
      id: 20,
      title: "個人連絡先の直接交換・外部誘導を許さない「正規表現ステルスRegex」",
      category: "安全防衛メカニズム③：直接連絡先交換排除",
      layout: 'content',
      points: [
        "ボトルメールの本文、および手紙開通後のメッセージエリア内から、売春交渉、金銭詐欺、悪質な課金サイトやLINE等への外部誘導を完全に未然回避するため、直接の連絡手段の露呈を徹底防御。",
        "LINE ID、各種SNS、電話番号、メールアドレス、あるいは外部リンクURL、支払等の特定可能キーを、正規表現（Regex）スキャンでリアルタイム常時監視します。",
        "検知された全ての連絡情報・リンク文字列は、バックエンド側で即座に「****」などへ不変置換。いかなる手法を使っても、相手側端末へ表示される前の段階で完璧に伏字化します。"
      ]
    },
    {
      id: 21,
      title: "最先端 Gemini AI モデレーション：心理的付きまとい・粘着隠語の排除",
      category: "安全防衛メカニズム④：回避・執着セマンティック",
      layout: 'content',
      points: [
        "記号を混ぜたNGワード逃れ（例：「ラ_イ_ン」など）や、ストーカーによる「思い出」に偽装した狡猾な精神的・心理的付きまとい、暴力文脈を言語レベルで検知。",
        "世界最高峰の Google GenAI (Gemini AI API) とリアルタイムにAPI通信連動。文章全体の背景、意味合い（復讐等のしがみつき感情、金銭的誘導の看破）を意味論的に評価します。",
        "AIが高リスクとフラグ判定したメッセージおよび投函ボトルは、一般向けタイムラインには1秒たりとも出現させず、内部フラグで完璧に自動非公開・隔離します。"
      ]
    },
    {
      id: 22,
      title: "嫌がらせ者に分析させない隔離防衛技術「ステルスシャドウ・フラグ」",
      category: "安全防衛メカニズム⑤：シャドウフィルタ",
      layout: 'content',
      points: [
        "AIやフィルターに検知された際「検知中：投稿できません」等とエラーを返す従来型の制限は、悪質利用者に『こう書くとすり抜ける』というヘマなヒントを与え、投稿文章を改変させて再挑戦される原因となります。",
        "ReMEETsでは、高リスク検知された投稿者に対して、フロントUIでは「送信完了いたしました。ボトルは無事漂流しています」と正常メッセージを擬態表示します。",
        "しかし、データベースの内部ステータスでは 'shadow_flag_hidden' となり、一般画面からは一切視認されず隔離されます。このシャドウフラグ技術が悪質試行を諦めさせます。"
      ]
    },
    {
      id: 23,
      title: "未成年者・青少年利用の絶対的な制限（高校生を除く18歳以上限定）",
      category: "安全防衛メカニズム⑥：青少年保護規約",
      layout: 'content',
      points: [
        "児童福祉法上の義務、及び青少年へのネット等における犯罪被害（児童売春・誘拐、性的トラブル等）を水際で完璧に防止するため、18歳未満および高校生の利用は規約上完全不可としています。",
        "ユーザー登録時に必ず生年月日による年齢申告を強制。さらに公的書面等による強固な年齢証明の接続ゲートを準備しています。",
        "青少年を「犯罪温床に巻き込まない」ことを絶対のセキュリティポリシーとし、子供をインターネット被害から完璧にプロテクトする強固なコンプライアンス管理を全うします。"
      ]
    },
    {
      id: 24,
      title: "連絡先開示直前の厳格な「電子的利用宣誓フェーズゲート」",
      category: "安全防衛メカニズム⑦：電子的利用宣誓ゲート",
      layout: 'content',
      points: [
        "クイズに正答し、連絡先開示・セキュアブリッジに進む直前に、「悪意ある監視、付きまとい、いたずら登録、誹謗中傷でないこと」等の厳しい免責声明および法令遵守誓約の電子的宣誓を義務化。",
        "全項目への明示的同意チェックを必須化し、安易なクリックによる突破を防止。宣誓完了時のタイムスタンプ、接続元IPアドレス、ユーザー識別子を改ざん不可能な監査ログとして確実に保全。",
        "万一の法的トラブルや捜査照会時には、この電子的宣誓ログが「利用規約および法令遵守に同意した確実な証拠」として機能し、悪意あるユーザーに対する強力な心理的・法的抑止力を発揮します。"
      ]
    },
    {
      id: 25,
      title: "問い合わせ・通報の全履歴スレッド永続保全 ＆ Gemini AI コンプライアンス返信ドラフト",
      category: "安全防衛メカニズム⑧：チケット管理・AI監査返信",
      layout: 'content',
      points: [
        "「全送受信履歴のチケット型スレッドDB永続化」：ユーザーからの通報・相談・問い合わせ履歴は、管理者からの公式返信、さらにその後のユーザーからの追加返信に至るまで、全送受信ログをデータベース（contacts & contact_messages）にチケットトークン（ticket_token）でスレッドとして完全永続保全。",
        "「Gemini AI によるコンプライアンス適合返信ドラフト」：管理者パネル上で、通報・相談内容に応じた法務・セキュリティ規約に完全準拠した公式返信下書きをGemini AIがワンクリックで自動生成。迅速かつ的確な対応を実現。",
        "「捜査・監査への完全対応」：一連のやり取りがタイムスタンプ・送信者属性とともに時系列で完全記録されているため、警察・裁判所への証拠提出や内部コンプライアンス監査に100%対応可能です。"
      ]
    },
    {
      id: 26,
      title: "明確な年齢・本人確認体系と料金分離設計（【無料】年齢誓約 ＆ 【600円】公的身分証eKYC認証）",
      category: "安全防衛メカニズム⑨：透明な本人確認・料金体系",
      layout: 'content',
      points: [
        "「二段階の身元確認体系の視覚的・機能的完全分離」：【無料の年齢誓約（グリーン）】による18歳以上確認と、【600円の公的身分証eKYC認証（オレンジ）】による公的証明書確認を明確に区分して表示・運用。",
        "「利用者の誤認防止と透明性」：無料の基本機能（探索・閲覧・年齢宣誓）と、信頼性を担保する有償の公的身元認証（eKYC審査・開通手数料）の費用構造をクリーンに開示し、消費者の誤解を完全に防止。",
        "「警察・消費者保護ガイドライン完全適合」：青少年保護のための年齢確認を無料ですべての利用者に義務付けつつ、実際の引き渡し段階では厳格な身元確認（eKYC）を連動させることで、安全と公平性を高度に両立。"
      ]
    },
    {
      id: 27,
      title: "安全なユーザー証明：2社分離型eKYC本人確認 ＆ 即時返金自動決済連携",
      category: "安全防衛メカニズム⑩：eKYC・決済連携",
      layout: 'content',
      points: [
        "「2社分離型システム構成」: 本人確認機関としてTRUSTDOCK等、決済インフラとしてStripeをそれぞれ安全にAPI連携する、業界初の分離設計を採用。",
        "「600円（税込）の仮売上（オーソリ）方式」: 初期のボトル解凍・メッセージ開始前に仮売上をセキュアに確保。本人確認が【不合格】となった際は、ユーザーへの不当な金銭負担を防ぐため、システムが「自動かつ即時に全額キャンセル（全額返金）」を行います。",
        "「認証済バッジの点灯による安心感」: 審査に【合格（承認済）したユーザー】のみ公式バッジが点灯。いたずら、なりすまし、アカウント不正流用を水際で完封。"
      ]
    },
    {
      id: 28,
      title: "捜査・司法機関への即応体制：日付期間指定フィルター ＆ フォレンジックログ出力",
      category: "管轄警察・サイバー課との強固な共同戦線",
      layout: 'content',
      points: [
        "生活安全課、サイバー犯罪対策課、または裁判所などからの「捜査事項照会書」（刑事訴訟法第197条第2項に基づく）等の付託を受理した際、開始日〜終了日の『日付期間指定フィルター』でワンクリック抽出。",
        "指定期間内の対象アカウントによるログインIP端末、失敗履歴、電子的宣誓同意ログ、決済履歴が『フォレンジック分析用』PDF or CSVとして瞬時に自動集約出力されます。",
        "警察等からの正式要請に対して数分以内の迅速情報開示を全うし、違法・執着行為・嫌がらせ、なりすまし等の刑事責任追及を全面的に強力バックアップします。"
      ]
    },
    {
      id: 29,
      title: "利用者の「忘れられる権利」を守る、24時間対応「オプトアウト申請処理」",
      category: "プライバシー保護・即時削除",
      layout: 'content',
      points: [
        "ReMEETsでは、個人の権利擁護・プライバシー優先の精神に基づき、申請者本人が「自分に関連するあらゆる文字情報の消去」を即時要求できる削除申請フォーム（窓口）を用意しています。",
        "申請を受けたら、通常24時間以内に運営安全統計監査室が該当ボトルを確認し、個人情報を含む不適切な記述をデータベース上からただちに『完全不活性（物理削除・閉鎖）』します。",
        "お相手との想い出を開門されたくない方の「再会を行わないでほしいという権利」も対等に完全に保障されています。"
      ]
    },
    {
      id: 30,
      title: "総括：想い出を繋ぎ、治安適合性と最高度の法的透明性を確立する新インフラ",
      category: "総括・治安コンプライアンス適合証明",
      layout: 'content',
      points: [
        "ReMEETsは、「ただ一つの安心な思い出開門システム」であり、不特定の男女を引き合わせる危険性を100%排除して設計されています。",
        "運営は1回600円の開通手数料、およびサポーター寄付（ドネーション）で支えられ、特商法に基づくコンテンツ開通後の自己都合返金不可特約（障害時・eKYC否認時全額自動返金）を徹底遵守。",
        "警察公安、サイバー対策セクション、及び法規制の求めるあらゆる安全規範を完全に充足し、持続可能かつ最高に安全な再会社会を実現します。"
      ]
    }
  ]);

  React.useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        let fileName = 'ReMEETs_Deployment_Guide.md';
        if (docType === 'permit') fileName = 'ReMEETs_Permit_QA_Guide.md';
        else if (docType === 'cost_estimate') fileName = 'ReMEETs_Monetization_Guide.md';
        else if (docType === 'cost_list_detailed') fileName = 'ReMEETs_Cost_List_Guide.md';
        else if (docType === 'police') fileName = 'ReMEETs_Police_Compliance_Guide.md';
        else if (docType === 'consult') fileName = 'ReMEETs_Police_Consultation_Flow.md';
        else if (docType === 'matrix') fileName = 'ReMEETs_Risk_Mitigation_Matrix.md';
        else if (docType === 'scenario') fileName = 'ReMEETs_Police_Presentation_Scenario.md';
        else if (docType === 'requirements') fileName = 'ReMEETs_Requirements_Definition.md';
        else if (docType === 'evaluation') {
          if (evaluationDateTab === '2026-08-24') fileName = 'ReMEETs_Overall_Evaluation_20260824.md';
          else if (evaluationDateTab === '2026-08-15') fileName = 'ReMEETs_Overall_Evaluation_20260815.md';
          else fileName = 'ReMEETs_Overall_Evaluation.md';
        }
        else if (docType === 'pr_plan') fileName = 'ReMEETs_PR_Plan.md';
        else if (docType === 'legal_guide') fileName = 'ReMEETs_Legal_Compliance_Guide.md';
        
        const response = await fetch(`/${fileName}`);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(arrayBuffer);
          setMarkdown(text);
        } else {
          setMarkdown('ドキュメントの読み込みに失敗しました。');
        }
      } catch (err) {
        setMarkdown('サーバーエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    
    if (docType !== 'slides') {
      fetchDoc();
    } else {
      setLoading(false);
    }
  }, [docType, evaluationDateTab]);

  // Document and slide export/download functions
  const parseMarkdownToHtml = (md: string) => {
    if (!md) return '';
    const lines = md.split('\n');
    let inList = false;
    let inTable = false;
    let html = '';

    lines.forEach((line) => {
      let trimmed = line.trim();

      // Table parsing
      if (trimmed.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          html += '<table class="doc-table"><thead>';
        }
        const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
        
        if (cells.every(c => c.startsWith('-'))) {
          html = html.replace('<thead>', '').replace('</thead>', '');
          html += '<tbody>';
          return;
        }
        
        html += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        return;
      } else {
        if (inTable) {
          inTable = false;
          html += '</tbody></table>';
        }
      }

      // Unordered List parsing
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        if (!inList) {
          inList = true;
          html += '<ul class="doc-list">';
        }
        const content = trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `<li>${content}</li>`;
        return;
      } else {
        if (inList) {
          inList = false;
          html += '</ul>';
        }
      }

      // Headings & Blockquotes
      if (trimmed.startsWith('# ')) {
        html += `<h1 class="doc-h1">${trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        html += `<h2 class="doc-h2">${trimmed.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        html += `<h3 class="doc-h3">${trimmed.substring(4).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>`;
      } else if (trimmed.startsWith('> ')) {
        html += `<blockquote class="doc-quote">${trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</blockquote>`;
      } else if (trimmed === '') {
        // Empty lines skipped or treated as breaks
      } else {
        const content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                               .replace(/`(.*?)`/g, '<code>$1</code>');
        html += `<p class="doc-p">${content}</p>`;
      }
    });

    if (inList) html += '</ul>';
    if (inTable) html += '</tbody></table>';

    return html;
  };

  const handlePrintDocument = () => {
    let titleStr = "ReMEETs 治安行政・防衛システム文書";
    let subtitleStr = "治安行政・防衛システムセキュリティ設計書（公式監査書類）";
    if (docType === 'matrix') {
      titleStr = "⑤ セキュリティ適合性監査マトリクス";
      subtitleStr = "治安・防衛コンプライアンス管理事務局（公式監査用マトリクス）";
    }
    let fontLink = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@500;700&display=swap" rel="stylesheet">`;

    let html = '';

    if (docType === 'matrix') {
      // Print Security Compliance Matrix (Document ⑤) Landscape A4 layout
      const matrixRows = `
        <tr>
          <td class="phase-col">① プロフィール設定</td>
          <td class="threat-col">本名フルネーム登録による個人特定危険</td>
          <td class="program-col">アカウント登録・ニックネーム設定時に、日本人の典型的な姓名辞書データベースと照合。一致度が高過ぎるフルネーム（例：漢字2字＋漢字2字等）は警告し、イニシャルやあだ名へ変更を促します。</td>
          <td class="ai-col">自己紹介文などの自由入力エリアを自動判定。「本名」「住所」「SNSハンドル」が含まれている比率をAI判定し、不具合警告。</td>
          <td class="log-col">登録時のグローバルIP・UA・登録タイミングスタンプを永続セキュリティ保存。</td>
        </tr>
        <tr>
          <td class="phase-col">② 手紙ボトル投函（基本）</td>
          <td class="threat-col">手紙内の「実名・連絡先交換」によるプラットフォーム外への誘導・ハラスメント</td>
          <td class="program-col">文字入力ボックスフックに、メール/電話Regex、LINE/インスタ等SNSアカウントの検知Regexをバインド。外部手段の直接掲載自体を仕組みから厳格に弾きます。</td>
          <td class="ai-col"><strong>【レッドアラート格納】</strong><br/>「L!NE」「L_I_N_E」などの伏字や、SNSを示唆する回避文章をGemini AIが文脈解釈。「未承認」に落とし一般漂流から1秒で完全シャット。</td>
          <td class="log-col">AIが判定したアラート文面、危険度判定ログ、ボトル投函元の会員アカウント情報を完全ログ化。</td>
        </tr>
        <tr>
          <td class="phase-col">③ 手紙ボトル投函（他人特定）</td>
          <td class="threat-col">標的のお相手以外の第三者プライバシー権利侵害・特定情報の掲載</td>
          <td class="program-col">宛先を規定の「お名前」「都道府県」「出会った当時の関係性」などの曖昧なデータに制約。具体的なアパート名、個別地番、職場名称などは入力不可。</td>
          <td class="ai-col">「想い出メッセージ」にお相手のプライバシーや実質的なストーキングに繋がる極めて狭い情報を記述していないかをAIモデレーション検知。</td>
          <td class="log-col">投函緯度経度・IP履歴などセキュリティログを自動追跡保管。</td>
        </tr>
        <tr>
          <td class="phase-col">④ 想い出クイズの設定</td>
          <td class="threat-col">クイズ文面を悪用した誹謗中傷、嫌がらせ、ネットいじめ</td>
          <td class="program-col">質問の入力ボックス内にNGワード（誹謗・性的侮辱表現など）を監視する文字バリデーションをコール。</td>
          <td class="ai-col">質問全体のセンチメント（感情強度）判定。執拗な執着、脅迫、恋愛感情の強制的な強要を発見した場合に自動的に対象ボトルの一般流出を一時停止（漂流停止）。</td>
          <td class="log-col">クイズ問題データ、設定者アカウントデータ、不承認検知履歴を管理者向け監査として完全保存。</td>
        </tr>
        <tr>
          <td class="phase-col">⑤ お相手検索行為</td>
          <td class="threat-col">第三者が宛先に対して手当たり次第に総当たり検索しストーキングを試行</td>
          <td class="program-col">一定時間に繰り返される異なる氏名、または多拠点の都道府県切り替え無差別検索動作に対してレートペナルティ（お名前検索の回数制限）を設定。</td>
          <td class="ai-col">特定のアカウントによる総当たり型のクエリ動作、不正ボットに近い高サイクルログを自動検知して管理パネル通報。</td>
          <td class="log-col">検索の監査ログ（search_logs）の完全暗号化保存（パーマリンク）。</td>
        </tr>
        <tr>
          <td class="phase-col">⑥ クイズ解答試行</td>
          <td class="threat-col">あてずっぽうなどクイズの総当たり解答による手紙の不正な解凍（個人情報リーク）</td>
          <td class="program-col">同じボトル、または同じIP/セッションから一定回数（基本は5回）連続で回答を誤った場合に、<strong>プログラム的に手紙の回答権を24時間完全にロックアウト</strong>。</td>
          <td class="ai-col">不自然な多回数失敗ボトルの検知。バーストした過剰なアタックセッションを検疫。</td>
          <td class="log-col">失敗時の試行ワード履歴、元セッション・IP情報を保存。管理者によるアカウント拒否権と連動。</td>
        </tr>
        <tr>
          <td class="phase-col">⑦ 連絡先開示（セキュアブリッジ）</td>
          <td class="threat-col">なりすまし突破成功後のストーカー・嫌がらせ接触、事件化</td>
          <td class="program-col">連絡先開示前に、<strong>18歳以上（高校生を除く）</strong>、<strong>ストーカーや無断面識を目的としない安全第一の利用宣誓</strong>への電子的合意を必須化。</td>
          <td class="ai-col">-</td>
          <td class="log-col">同意した電子的宣誓ログ（合意タイムスタンプ、IPアドレス、ユーザー識別子）を「証拠開示用」として管理者サーバーデータベースに高セキュリティ保全。</td>
        </tr>
      `;

      html = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="utf-8">
          <title>ReMEETs セキュリティ適合性監査マトリクス</title>
          ${fontLink}
          <style>
            @media print {
              body {
                background: #ffffff;
                color: #1a1a1a;
              }
            }
            @page {
              size: A4 landscape;
              margin: 12mm 10mm 12mm 10mm;
            }
            body {
              font-family: 'Noto Sans JP', sans-serif;
              color: #1a1a1a;
              line-height: 1.4;
              font-size: 8pt;
              background: #ffffff;
              margin: 0;
              padding: 0;
            }
            .header {
              border-bottom: 2px solid #3B627F;
              padding-bottom: 8px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .header h1 {
              font-size: 13pt;
              margin: 0;
              color: #1a2735;
              font-weight: 700;
              font-family: 'Noto Serif JP', serif;
            }
            .header .subtitle {
              font-size: 8pt;
              color: #3B627F;
              font-weight: bold;
              margin-top: 2px;
            }
            .header .date {
              font-size: 8pt;
              color: #64748b;
              text-align: right;
            }
            .title-desc {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 7.5pt;
              color: #475569;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
            }
            th, td {
              border: 1.5px solid #3b627f;
              padding: 8px 10px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f8fafc;
              color: #3B627F;
              font-weight: bold;
              font-size: 8.5pt;
              font-family: 'Noto Serif JP', serif;
            }
            td {
              font-size: 8pt;
              line-height: 1.45;
            }
            .phase-col { font-weight: bold; color: #1f2937; width: 15%; }
            .threat-col { color: #b91c1c; width: 17%; }
            .program-col { width: 28%; }
            .ai-col { width: 22%; }
            .log-col { font-family: monospace; font-size: 7.5pt; color: #475569; width: 18%; }
            .footer {
              margin-top: 20px;
              font-size: 7.5pt;
              text-align: center;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>ReMEETs セキュリティ適合性監査マトリクス</h1>
              <div class="subtitle">治安・防衛コンプライアンス管理事務局（公式監査用マトリクス）</div>
            </div>
            <div class="date">
              出力日時: ${new Date().toLocaleString('ja-JP')}
            </div>
          </div>
          <div class="title-desc">
            本資料は犯罪抑止・セキュリティ対策に特化したSNS「ReMEETs」におけるすべての利用動線（会員登録から手紙投函、クイズゲート、メッセージ開通、事件防止まで）に対し、想定されるストーカー行為や不正アビューズ脅威をマッピング。一次プログラム防衛策と二次防衛策（Gemini AIによる評価）、および管轄警察署サイバー対策課協議用の永続フォレンジックロギング（痕跡保管）設計の監査適合性を示した全編マトリクス公式書面（A4横適合版）です。
          </div>
          <table>
            <thead>
              <tr>
                <th>防御フェーズ</th>
                <th>想定脅威（アビューズ）</th>
                <th>プログラム防衛策（バリデーション等）</th>
                <th>AIモデレーション（Gemini審査等）</th>
                <th>監査用ログ・痕跡データ (Forensic)</th>
              </tr>
            </thead>
            <tbody>
              ${matrixRows}
            </tbody>
          </table>
          <div class="footer">
            ReMEETs 治安行政・防衛システム監査監査官用ポータル &copy; 2026. All Rights Reserved.
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
        </html>
      `;
    } else {
      // Print Markdown Guidelines (Documents ①, ②, ③, ④) Portrait A4 layout
      if (docType === 'deployment') {
        titleStr = "① ReMEETs 本番デプロイガイド ＆ 運営コンプライアンス設計書";
        subtitleStr = "治安行政・防衛システムセキュリティ設計書（システム構築仕様編）";
      } else if (docType === 'cost_estimate') {
        titleStr = "①-B 本番運用コスト＆初期費用";
        subtitleStr = "持続可能な安全再会インフラのための財務コスト試算シミュレーション（運営費用見積）";
      } else if (docType === 'permit') {
        titleStr = "② ReMEETs 開業知識・官公庁届出Q＆A";
        subtitleStr = "インターネット異性紹介事業【非該当】の論理客観的証明（法務コンプライアンス編）";
      } else if (docType === 'police') {
        titleStr = "③ ReMEETs 警察署・生活安全課協議用セキュリティ報告書";
        subtitleStr = "所管警察署生活安全課・サイバー犯罪対策課事前協議用公式説明ガイド";
      } else if (docType === 'consult') {
        titleStr = "④ ReMEETs 警察署事前相談フロー";
        subtitleStr = "ストーカー規制法関連緊急時データ開示および捜査事項照会即応手続き";
      } else if (docType === 'scenario') {
        titleStr = "⑦ 警察向けプレゼンテーション公式口頭発表シナリオ";
        subtitleStr = "治安・防衛コンプライアンス適合に関する公式説明用発言原稿（スクリプト）";
      } else if (docType === 'requirements') {
        titleStr = "⑧ ReMEETs システム基本要件定義書 (System Requirements Definition Document)";
        subtitleStr = "開発・安全対策・公安コンプライアンス適合性を定義した公式システム要求仕様";
      } else if (docType === 'evaluation') {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー";
        subtitleStr = "コンセプト・デザイン・機能・安全性・今後の展望に関する総合評価報告書";
      } else if (docType === 'pr_plan') {
        titleStr = "⑩ ReMEETs 広報・マーケティング・PR立ち上げ戦略プラン";
        subtitleStr = "コンセプト・デザイン・安全性に基づいた公式広報・PRマーケティング立ち上げ戦略書";
      } else if (docType === 'legal_guide') {
        titleStr = "⑪ 主要関係法令適合性＆警察署相談ガイダンス";
        subtitleStr = "本サービスにおける法務コンプライアンス適合性と関係法令基準・警察相談実務フローの一覧解説";
      }

      html = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="utf-8">
          <title>${titleStr}</title>
          ${fontLink}
          <style>
            @media print {
              body {
                background: #ffffff;
                color: #1a1a1a;
              }
            }
            @page {
              size: A4 portrait;
              margin: 18mm 15mm 18mm 15mm;
            }
            body {
              font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
              color: #1a1a1a;
              line-height: 1.8;
              font-size: 9.5pt;
              background: #ffffff;
              margin: 0;
              padding: 0;
            }
            .header {
              border-bottom: 2px solid #3B627F;
              padding-bottom: 12px;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .header h1 {
              font-size: 13pt;
              margin: 0;
              color: #1a2735;
              font-weight: 700;
              font-family: 'Noto Serif JP', serif;
              line-height: 1.3;
            }
            .header .subtitle {
              font-size: 8.5pt;
              color: #3B627F;
              font-weight: bold;
              margin-top: 4px;
            }
            .header .date {
              font-size: 8.5pt;
              color: #64748b;
              text-align: right;
            }
            .title-desc {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 8.5pt;
              color: #475569;
              margin-bottom: 25px;
              line-height: 1.5;
            }
            .container {
              max-width: 100%;
            }
            .doc-h1 {
              font-size: 13pt;
              border-bottom: 2px solid #3B627F;
              padding-bottom: 8px;
              color: #1a2735;
              margin-top: 28px;
              margin-bottom: 12px;
              font-family: 'Noto Serif JP', serif;
            }
            .doc-h2 {
              font-size: 11pt;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin-top: 22px;
              margin-bottom: 10px;
              color: #3B627F;
              font-family: 'Noto Serif JP', serif;
            }
            .doc-h3 {
              font-size: 10pt;
              color: #1e293b;
              margin-top: 18px;
              margin-bottom: 6px;
              font-weight: bold;
              font-family: 'Noto Sans JP', sans-serif;
            }
            .doc-p {
              margin-bottom: 12px;
              color: #334155;
              line-height: 1.8;
            }
            .doc-list {
              padding-left: 20px;
              margin-bottom: 15px;
            }
            .doc-list li {
              margin-bottom: 6px;
              list-style-type: square;
              color: #334155;
            }
            .doc-quote {
              border-left: 4px solid #3B627F;
              padding: 10px 14px;
              color: #475569;
              margin: 15px 0;
              font-style: italic;
              background: #f8fafc;
              border-radius: 0 6px 6px 0;
            }
            .doc-table {
              width: 100%;
              border-collapse: collapse;
              margin: 18px 0;
            }
            .doc-table th, .doc-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              font-size: 8.5pt;
              text-align: left;
            }
            .doc-table th {
              background: #f8fafc;
              color: #1a2735;
              font-weight: bold;
              font-family: 'Noto Serif JP', serif;
            }
            .doc-table td {
              color: #334155;
            }
            .footer {
              margin-top: 40px;
              font-size: 8pt;
              text-align: center;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${titleStr}</h1>
              <div class="subtitle">${subtitleStr}</div>
            </div>
            <div class="date">
              出力日時: ${new Date().toLocaleString('ja-JP')}
            </div>
          </div>
          <div class="title-desc">
            本資料は犯罪抑止・セキュリティ対策に特化した再会支援SNS「ReMEETs」における治安コプライアンス監査実証ドキュメントです。A4規格印刷・PDF出力に完全適合するよう最適にフォーマットされています。
          </div>
          <div class="container">
            ${parseMarkdownToHtml(markdown)}
          </div>
          <div class="footer">
            ReMEETs 治安・防衛コンプライアンス管理事務局 &copy; 2026. All Rights Reserved.
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
        </html>
      `;
    }

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${titleStr}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDFOutline = () => {
    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@500;700&display=swap" rel="stylesheet">`;
    const styles = `
      <style>
        @media print {
          body {
            background: #ffffff;
            color: #1a1a1a;
          }
        }
        @page {
          size: A4 portrait;
          margin: 18mm 15mm 18mm 15mm;
        }
        body {
          font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
          font-size: 10pt;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }
        .header {
          border-bottom: 2px solid #E11D48;
          padding-bottom: 12px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .header h1 {
          font-size: 14pt;
          margin: 0;
          color: #1a1a1a;
          font-weight: 700;
          font-family: 'Noto Serif JP', serif;
        }
        .header .subtitle {
          font-size: 8.5pt;
          color: #E11D48;
          font-weight: bold;
          margin-top: 4px;
        }
        .header .date {
          font-size: 8.5pt;
          color: #64748b;
          text-align: right;
        }
        .title-desc {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 9pt;
          color: #475569;
          margin-bottom: 25px;
        }
        .grid-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .slide-block {
          page-break-inside: avoid;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .slide-meta {
          font-size: 8pt;
          font-weight: bold;
          color: #E11D48;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }
        .slide-num {
          font-family: monospace;
        }
        .slide-category {
          background: #ffe4e6;
          color: #9f1239;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 7.5pt;
        }
        .slide-title {
          font-size: 11pt;
          font-weight: bold;
          color: #0f172a;
          margin: 0 0 10px 0;
          font-family: 'Noto Serif JP', serif;
          line-height: 1.4;
        }
        .slide-subtitle {
          font-size: 8.5pt;
          color: #475569;
          margin: 0 0 10px 0;
          padding: 6px 12px;
          background: #f1f5f9;
          border-left: 3px solid #64748b;
          border-radius: 0 6px 6px 0;
        }
        .slide-points {
          margin: 0;
          padding-left: 18px;
          font-size: 9pt;
          color: #334155;
        }
        .slide-points li {
          margin-bottom: 6px;
          list-style-type: square;
        }
        .footer {
          margin-top: 40px;
          font-size: 8pt;
          text-align: center;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }
      </style>
    `;

    const content = slides.map((s, idx) => {
      const sub = s.subtitle ? `<div class="slide-subtitle">${s.subtitle}</div>` : '';
      const pts = s.points && s.points.length > 0
        ? `<ul class="slide-points">${s.points.map(pt => `<li>${pt}</li>`).join('')}</ul>`
        : '';
      return `
        <div class="slide-block">
          <div class="slide-meta">
            <span class="slide-num">SLIDE ${idx + 1} / ${slides.length}</span>
            <span class="slide-category">${s.category}</span>
          </div>
          <h2 class="slide-title">${s.title}</h2>
          ${sub}
          ${pts}
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <title>ReMEETs プレゼンテーション全編構成案</title>
        ${fontLink}
        ${styles}
      </head>
      <body>
        <div class="header">
          <div>
            <h1>ReMEETs プレゼンテーション全編構成案</h1>
            <div class="subtitle">治安行政・防衛システムセキュリティ設計書（全${slides.length}スライド）</div>
          </div>
          <div class="date">
            出力日時: ${new Date().toLocaleString('ja-JP')}
          </div>
        </div>
        <div class="title-desc">
          本資料は犯罪抑止・セキュリティ対策に特化したSNS「ReMEETs」における、警察や各公安関係への説明・プレゼンテーション資料の全構成案（テキスト・箇条書き・カテゴリ）を網羅した公式の監査構成文書です。A4印刷またはPDF出力にフィットするよう最適化されています。
        </div>
        <div class="grid-container">
          ${content}
        </div>
        <div class="footer">
          ReMEETs 治安・防衛コンプライアンス管理事務局
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ReMEETs_Compliance_Slides.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintSlidePreview = () => {
    document.body.classList.add('printing-active-slide-preview');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-active-slide-preview');
    }, 1000);
  };

  const handleDownloadHTMLDocument = () => {
    let titleStr = "ReMEETs 治安行政・防衛システム文書";
    if (docType === 'deployment') titleStr = "① ReMEETs 本番デプロイガイド ＆ 運営コンプライアンス設計書";
    else if (docType === 'cost_estimate') titleStr = "①-B 本番運用コスト＆初期費用シミュレータ";
    else if (docType === 'cost_list_detailed') titleStr = "①-C 本番運用コスト＆初期費用 総合見積もりリスト";
    else if (docType === 'permit') titleStr = "② ReMEETs 開業知識・官公庁届出Q＆A";
    else if (docType === 'police') titleStr = "③ ReMEETs 警察署・生活安全課協議用セキュリティ報告書";
    else if (docType === 'consult') titleStr = "④ ReMEETs 警察署事前相談フロー";
    else if (docType === 'matrix') titleStr = "⑤ セキュリティ適合性監査マトリクス";
    else if (docType === 'scenario') titleStr = "⑦ 警察向けプレゼンテーション公式口頭発表シナリオ";
    else if (docType === 'requirements') titleStr = "⑧ ReMEETs システム基本要件定義書 (System Requirements Definition Document)";
    else if (docType === 'evaluation') titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー";
    else if (docType === 'pr_plan') titleStr = "⑩ ReMEETs 広報・マーケティング・PR立ち上げ戦略プラン";
    else if (docType === 'legal_guide') titleStr = "⑪ 主要関係法令適合性＆警察署相談ガイダンス";

    const pToB = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\s*<ul>/gim, '')
        .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\s*<ul>/gim, '')
        .replace(/^([a-zA-Z0-9_\s.\-]+.*)$/gim, '<p>$1</p>')
        .replace(/<\/p>\s*<p>/gim, '<br>');
    };

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleStr}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      background-color: #fdfaf2;
    }
    .container {
      background: #fff;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      border: 1px solid #e1d8c7;
    }
    h1 {
      font-size: 24px;
      border-bottom: 2px solid #3B627F;
      padding-bottom: 15px;
      color: #1a2735;
      margin-top: 20px;
    }
    h2 {
      font-size: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-top: 35px;
      color: #3B627F;
    }
    h3 {
      font-size: 16px;
      color: #444;
      margin-top: 25px;
    }
    p, li {
      font-size: 14px;
      color: #444;
    }
    ul, ol {
      padding-left: 20px;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 13px;
      margin: 20px 0;
    }
    code {
      background: rgba(0,0,0,0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
    }
    pre code {
      background: none;
      padding: 0;
    }
    hr {
      border: 0;
      border-top: 1px solid #eee;
      margin: 40px 0;
    }
    blockquote {
      border-left: 4px solid #3B627F;
      padding-left: 20px;
      color: #666;
      margin: 25px 0;
      font-style: italic;
      background: #f4f7f9;
      padding-top: 10px;
      padding-bottom: 10px;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      font-size: 12px;
      color: #999;
      text-align: center;
      margin-top: 60px;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media print {
      body { background: #fff; margin: 0; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size:11px;color:#7A8E9E;font-weight:bold;margin-bottom:15px;text-transform:uppercase;letter-spacing:1px;">ReMEETs COMPLIANCE OFFICIAL RECORD</div>
    <h1>${titleStr}</h1>
    <div style="margin-top:30px;">
      ${pToB(markdown)}
    </div>
    <div class="footer">
      ReMEETs 治安行政・防衛システム監査監査官用ポータル &copy; 2026. All Rights Reserved.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    let dlName = `${titleStr}.html`;
    link.href = url;
    link.setAttribute('download', dlName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMarkdown = async () => {
    let fileName = 'ReMEETs_Deployment_Guide.md';
    let titleStr = "ReMEETs 治安行政・防衛システム文書";
    if (docType === 'permit') fileName = 'ReMEETs_Permit_QA_Guide.md';
    else if (docType === 'cost_estimate') fileName = 'ReMEETs_Monetization_Guide.md';
    else if (docType === 'cost_list_detailed') fileName = 'ReMEETs_Cost_List_Guide.md';
    else if (docType === 'police') fileName = 'ReMEETs_Police_Compliance_Guide.md';
    else if (docType === 'consult') fileName = 'ReMEETs_Police_Consultation_Flow.md';
    else if (docType === 'matrix') fileName = 'ReMEETs_Risk_Mitigation_Matrix.md';
    else if (docType === 'scenario') fileName = 'ReMEETs_Police_Presentation_Scenario.md';
    else if (docType === 'requirements') fileName = 'ReMEETs_Requirements_Definition.md';
    else if (docType === 'evaluation') {
      if (evaluationDateTab === '2026-08-24') {
        fileName = 'ReMEETs_Overall_Evaluation_20260824.md';
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月24日 改定版)";
      } else if (evaluationDateTab === '2026-08-15') {
        fileName = 'ReMEETs_Overall_Evaluation_20260815.md';
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月15日 初版)";
      } else {
        fileName = 'ReMEETs_Overall_Evaluation.md';
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年9月5日 最新改定版)";
      }
    }
    else if (docType === 'pr_plan') fileName = 'ReMEETs_PR_Plan.md';
    else if (docType === 'legal_guide') fileName = 'ReMEETs_Legal_Compliance_Guide.md';
    
    if (docType === 'deployment') titleStr = "① ReMEETs 本番デプロイガイド ＆ 運営コンプライアンス設計書";
    else if (docType === 'cost_estimate') titleStr = "①-B 本番運用コスト＆初期費用シミュレータ";
    else if (docType === 'cost_list_detailed') titleStr = "①-C 本番運用コスト＆初期費用 総合見積もりリスト";
    else if (docType === 'permit') titleStr = "② ReMEETs 開業知識・官公庁届出Q＆A";
    else if (docType === 'police') titleStr = "③ ReMEETs 警察署・生活安全課協議用セキュリティ報告書";
    else if (docType === 'consult') titleStr = "④ ReMEETs 警察署事前相談フロー";
    else if (docType === 'matrix') titleStr = "⑤ セキュリティ適合性監査マトリクス";
    else if (docType === 'scenario') titleStr = "⑦ 警察向けプレゼンテーション公式口頭発表シナリオ";
    else if (docType === 'requirements') titleStr = "⑧ ReMEETs システム基本要件定義書 (System Requirements Definition Document)";
    else if (docType === 'evaluation') {
      if (evaluationDateTab === '2026-08-24') {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月24日 改定版)";
      } else if (evaluationDateTab === '2026-08-15') {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月15日 初版)";
      } else {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年9月5日 最新改定版)";
      }
    }
    else if (docType === 'pr_plan') titleStr = "⑩ ReMEETs 広報・マーケティング・PR立ち上げ戦略プラン";
    else if (docType === 'legal_guide') titleStr = "⑪ 主要関係法令適合性＆警察署相談ガイダンス";

    let downloadName = `${titleStr}.md`;

    try {
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      alert('エラーが発生しました。');
    }
  };

  const handleDownloadAuditCSV = () => {
    const csvContent = 
      "\ufeff" + // UTF-8 BOM
      "ログ日時 (Timestamp),ログ分類 (Category),対象ホスト/IP (Client IP),ユーザー識別子 (User Hash),操作/検知イベント (Event Action),モデレーション評価 (AI Safety Check),監査適合ステータス (Status)\n" +
      '"2026-06-05 13:02:11","USER_SIGNUP_CONSENT","192.168.12.44","usr_d8f37a90b1e34","年齢18歳以上宣誓完了・電子承諾済","PASS (SafetyScore: 1.00)","SUCCESS (適合)"\n' +
      '"2026-06-05 13:02:45","QUIZ_POST_PROPOSAL","192.168.12.44","usr_d8f37a90b1e34","思い出ボトル投函 (キーワード: 高校陸上部、担任の名前)","PASS (SafetyScore: 0.98)","SUCCESS (適合)"\n' +
      '"2026-06-05 13:03:15","IDENTITY_VERIFICATION_START","192.168.12.44","usr_d8f37a90b1e34","オンライン本人確認 (eKYC) の申請受理、事業者認証セッション接続","PENDING","LAUNCHED (認証開始)"\n' +
      '"2026-06-05 13:04:02","IDENTITY_VERIFICATION_COMPLETED","192.168.12.44","usr_d8f37a90b1e34","eKYC公的身元照合成功、生年月日照合完了。生身分証データは即時完全パージ破棄済","VERIFIED (TokenHash: ab93f7e...)","SUCCESS (公的適合)"\n' +
      '"2026-06-05 13:05:22","NG_WORD_MODERATION","203.0.113.88","usr_93f8fe9c6d32","手紙本文の自動スキャン (アビューズ示唆を検知して遮断)","BLOCKED (NGワード: LINEなどの直接交渉・ハラスメントの疑い)","PREVENTED (防衛成功)"\n' +
      '"2026-06-05 13:12:04","POLICE_FORENSIC_EXPORT","127.0.0.1 (ADMIN)","admin_root","監査官用ログダンプの任意抽出・エクスポート実行","PASS_AUTHORITY","SUCCESS (適合)"\n' +
      '"2026-06-05 13:20:00","LOG_INTEGRITY_SEAL","SYSTEM_DAEMON","N/A","データベース整合性暗号署名の永続ロギング完了","INTEGRITY_SECURE","ACTIVE (正常)"\n' +
      '"2026-06-05 13:31:05","USER_CONSENT_REVOCATION","198.51.100.12","usr_12a76f5e8b41","利用者からのアカウント自己削除・全全データ不活性化(パージ法適合)","USER_ACTION","PURGED (適合)"\n' +
      '"2026-06-05 13:40:44","BLACKLISTED_USER_PREVENT","198.51.100.99","usr_temp_92fa","eKYC身元照合時、実名ハッシュが永久BlackListに一致。別垢による登録バイパスを未然遮断","REJECTED (ハッシュ特定: fx83a29...)","PREVENTED (防衛成功)"\n' +
      '"2026-06-05 13:42:19","THREAT_IP_COOLDOWN","198.51.100.55","usr_guest_unauth","短時間での思い出クイズ総当たり入力アタックを検知","BLOCKED (不正クイズハック検知)","IP_COOLING (遮断)"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ReMEETs_Audit_Forensic_Sample_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addPptxCardDiagram = (pptx: any, pptxSlide: any, slide: any) => {
    const isDarkVisual = [3, 13, 15, 20, 21, 22].includes(slide.id);
    const bgCol = isDarkVisual ? '1A2735' : (slide.id === 30 ? 'ECFDF5' : 'FFFFFF');
    const lineCol = isDarkVisual ? '334155' : (slide.id === 30 ? '34D399' : 'E2E8F0');
    const textCol = isDarkVisual ? 'FAFAF8' : '1A2735';

    // Main Card Container (Right Column: x: 5.95, y: 1.45, w: 3.45, h: 3.65)
    pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', {
      x: 5.95,
      y: 1.45,
      w: 3.45,
      h: 3.65,
      fill: { color: bgCol },
      line: { color: lineCol, width: 1.2 }
    });

    // Tag labels per slide
    const tagLabels: Record<number, string> = {
      2: 'RE-MEET ARCHITECTURE',
      3: 'DRIFT CAPSULE',
      4: 'SOCIAL MISSION',
      5: 'TARGET GROUPS',
      6: 'FUNCTION: DRIFT',
      7: 'QUIZ GATE SHIELD',
      8: 'CONTACT BRIDGE',
      9: 'SOC REALTIME',
      10: 'SHADOW FILTER',
      11: 'CRYPTOGRAPHIC ENGINE',
      12: 'ZERO TRACE PRIVACY',
      13: 'SYSTEM TOPOLOGY',
      14: 'COMPARISON MATRIX',
      15: 'LEGAL & SECURITY DEEP DIVE',
      16: 'LEGAL OPINION',
      17: 'AUTHENTICATION LAW',
      18: 'IP BRUTE GUARD',
      19: 'NAME REGEX DEFENSE',
      20: 'STEALTH MASK',
      21: 'SEMANTIC AI FILTER',
      22: 'SHADOW SANDBOX',
      23: 'YOUTH PROTECTION',
      24: 'DIGITAL SIGNATURE',
      25: 'TICKET & AI DRAFT',
      26: 'PRICING & VERIFICATION',
      27: 'EKYC & STRIPE COUPLING',
      28: 'JUDICIAL ALIGNMENT',
      29: 'OPT-OUT AUDIT',
      30: 'GRAND SUMMARY'
    };

    const currentTag = tagLabels[slide.id] || `SECURITY PROTOCOL #${slide.id}`;

    // Top-right Tag Badge
    pptxSlide.addText(currentTag, {
      x: 6.0,
      y: 1.55,
      w: 3.3,
      h: 0.25,
      fontSize: 7.5,
      fontFace: 'Courier New',
      color: isDarkVisual ? '34D399' : '059669',
      bold: true,
      align: 'right'
    });

    // Detailed visual rendering per slide
    switch (slide.id) {
      case 2: // 名前の由来 (A - B 連携図)
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 6.2, y: 2.15, w: 0.65, h: 0.65, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1.5 } });
        pptxSlide.addText('A', { x: 6.2, y: 2.15, w: 0.65, h: 0.65, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: '1E293B', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addText('あなた', { x: 6.1, y: 2.85, w: 0.85, h: 0.25, fontSize: 7.5, align: 'center', color: '64748B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 6.95, y: 2.47, w: 1.45, h: 0, line: { color: '10B981', width: 2 } });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.1, y: 2.05, w: 1.15, h: 0.35, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('相互の記憶 ✦', { x: 7.1, y: 2.05, w: 1.15, h: 0.35, fontSize: 7, bold: true, color: '065F46', align: 'center', valign: 'middle', fontFace: 'Hiragino Kaku Gothic ProN' });
        pptxSlide.addText('Re-meet', { x: 7.1, y: 2.55, w: 1.15, h: 0.25, fontSize: 7, color: '64748B', align: 'center', fontFace: 'Courier New' });

        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 8.5, y: 2.15, w: 0.65, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('B', { x: 8.5, y: 2.15, w: 0.65, h: 0.65, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: '047857', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addText('懐かしい知人', { x: 8.35, y: 2.85, w: 0.95, h: 0.25, fontSize: 7.5, align: 'center', color: '047857', bold: true, fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('不特定の「出会い」を排除し、過去の知人との「再会（Re-meet）」に特化。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 3: // コンセプト (波間に漂流するカプセル)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.25, y: 2.05, w: 0.85, h: 0.85, fill: { color: '0F172A' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('✉️', { x: 7.25, y: 2.05, w: 0.85, h: 0.85, fontSize: 24, align: 'center', valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 7.9, y: 2.7, w: 0.35, h: 0.35, fill: { color: '10B981' } });
        pptxSlide.addText('16:9', { x: 7.9, y: 2.7, w: 0.35, h: 0.35, fontSize: 6.5, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle', fontFace: 'Courier New' });
        pptxSlide.addText('~ ~ ~ 海洋漂流ボトルカプセル ~ ~ ~', { x: 6.1, y: 3.05, w: 3.15, h: 0.3, fontSize: 7.5, color: '34D399', align: 'center', fontFace: 'Courier New' });
        pptxSlide.addText('投函から波間に漂流。記憶の暗号キーにより本人だけに届くボトルメール構造。', { x: 6.05, y: 3.45, w: 3.25, h: 1.3, fontSize: 8.5, align: 'center', color: 'CBD5E1', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 4: // 構築目的 (3大ソーシャルミッション)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🏠', { x: 6.1, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('孤立化防止', { x: 6.1, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '9F1239', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.2, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('👥', { x: 7.2, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('震災断絶回復', { x: 7.2, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '065F46', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.3, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1 } });
        pptxSlide.addText('🏫', { x: 8.3, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('自発的隣人網', { x: 8.3, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '0369A1', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('家族・親族衰退期における、過去の恩師・同窓生とのセーフティネット再生。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 5: // ターゲットユーザー (2x2 グリッド)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🏫 学校の同窓生\n幼馴染・クラスメイト', { x: 6.15, y: 1.98, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.75, y: 1.95, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🏠 旧隣人・被災者\n転居・区画整理で断絶', { x: 7.8, y: 1.98, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.7, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('👥 元同僚・仕事仲間\n退職・異動後の再会', { x: 6.15, y: 2.73, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.75, y: 2.7, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🎖️ 恩師・指導者\n感謝を伝えたい相手', { x: 7.8, y: 2.73, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('信頼できるお相手にだけエピソードを届けたい安心なユーザーが集う空間。', { x: 6.05, y: 3.5, w: 3.25, h: 1.2, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 6: // 主要機能① (投函＆漂流フロー)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('① 国名+名前投函', { x: 6.1, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 7.02, y: 2.4, w: 0.2, h: 0, line: { color: '94A3B8', width: 1.5 } });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.24, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('② 漂流待機', { x: 7.24, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 8.16, y: 2.4, w: 0.2, h: 0, line: { color: '94A3B8', width: 1.5 } });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.38, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('③ クイズ開門', { x: 8.38, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });

        pptxSlide.addText('詳細住所不要。システム波間に漂流し、第三者から完全に遮断された空間。', { x: 6.05, y: 3.1, w: 3.25, h: 1.5, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 7: // 主要機能② (想い出クイズゲート)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.9, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('🔒 QUIZ VERIFICATION GATE', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '34D399', bold: true });
        pptxSlide.addText('二人だけの共有記憶に全問正答で開門', { x: 6.25, y: 2.35, w: 2.85, h: 0.4, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.95, w: 3.05, h: 0.45, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('✦ 表記ゆれ自動救済 (Levenshtein ≤ 2)  [ACTIVE]', { x: 6.25, y: 2.95, w: 2.85, h: 0.45, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, valign: 'middle' });

        pptxSlide.addText('共通の想い出が高精度認証キーとなり、第三者を遮断しつつ正当な再会を支援。', { x: 6.05, y: 3.6, w: 3.25, h: 1.2, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 8: // 主要機能③ (連絡先安全引き渡しモデル)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🤝 連絡先安全引き渡し（セキュア・ブリッジ）', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.3, y: 2.3, w: 2.75, h: 0.45, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('開示連絡先: LINE ID: @sample_friend', { x: 6.35, y: 2.3, w: 2.65, h: 0.45, fontSize: 7.5, fontFace: 'Courier New', color: '047857', bold: true, valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.3, y: 2.85, w: 2.75, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🔒 連絡先安全引き渡し完結型設計で、\nトラブルや犯罪リスクをシステム構造上ゼロに。', { x: 6.35, y: 2.85, w: 2.65, h: 0.65, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', valign: 'middle' });

        pptxSlide.addText('🛡️ 緊急通報・ワンタップブロック機能常備', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 9: // 管理・運用① (セキュリティダッシュボード)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🚨', { x: 6.25, y: 2.05, w: 0.8, h: 0.5, fontSize: 18, align: 'center' });
        pptxSlide.addText('検知盾', { x: 6.25, y: 2.55, w: 0.8, h: 0.25, fontSize: 7, bold: true, color: 'E11D48', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('THREAT MONITOR', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '64748B', bold: true });
        pptxSlide.addText('不正突破：0件', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 11, fontFace: 'Hiragino Kaku Gothic ProN', color: 'E11D48', bold: true });
        pptxSlide.addText('24時間総当たり・不正通信自動監視', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('オペレーション・ダッシュボードにより不正接続を瞬時に検知・排除。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 10: // 管理・運用② (シャドウフラグ隔離)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.2, y: 2.05, w: 0.95, h: 0.75, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('悪質アクセス\nshadow: 1', { x: 6.2, y: 2.05, w: 0.95, h: 0.75, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: 'BE123C', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 7.2, y: 2.42, w: 0.95, h: 0, line: { color: '94A3B8', width: 1.5 } });
        pptxSlide.addText('⚡ 隔離', { x: 7.2, y: 2.15, w: 0.95, h: 0.25, fontSize: 7, color: 'BE123C', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.2, y: 2.05, w: 0.95, h: 0.75, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('一般ユーザー\n影響 0%', { x: 8.2, y: 2.05, w: 0.95, h: 0.75, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('つきまとい者の投稿は、本人には成功と見せかけ裏側で完全隔離。', { x: 6.05, y: 3.2, w: 3.25, h: 1.5, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 11: // 非機能① (最高レベルの暗号化)
        pptxSlide.addText('🔑 SHA-256 不可逆ストレッチ', { x: 6.1, y: 2.05, w: 3.15, h: 0.35, fontSize: 10, bold: true, color: '065F46', align: 'center', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.2, y: 2.5, w: 2.95, h: 0.45, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('salt_key_hash_5a9b8dc91e77...', { x: 6.25, y: 2.5, w: 2.85, h: 0.45, fontSize: 7.5, fontFace: 'Courier New', color: '334155', align: 'center', valign: 'middle' });
        pptxSlide.addText('想い出パスワードが平文で保存されることは一切ありません。不可逆変換により金融機関クラスの安全性を遵守。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 12: // 非機能② (即時オプトアウト)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🗑️', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 20, align: 'center', valign: 'middle' });

        pptxSlide.addText('OPT-OUT GUARANTEE', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('24時間以内物理削除の保証', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('物理サーバーからもデータを完全に消去', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('「忘れられる権利」および被探索者の断る権利を完全に保障。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 13: // システム構成 (3ブロック)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('SPA\nReact 18', { x: 6.1, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '34D399', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.2, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('Server\nExpress', { x: 7.2, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '6EE7B7', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.3, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('Security\nGemini AI', { x: 8.3, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '7DD3FC', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('サーバーサイドAPIプロキシ。APIキーはブラウザに一切露出しません。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 14: // 新奇出会いとの対比分析 (比較カード)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.65, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('一般的なマッチング ： 無差別（危険 ❌）', { x: 6.2, y: 1.95, w: 2.95, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: 'BE123C', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.75, w: 3.05, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('ReMEETs 再会モデル ： 既知限定（安全 ⭕）', { x: 6.2, y: 2.75, w: 2.95, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('見知らぬ人との出会いを完全に排除し、二者間の『強固な過去の面識・共有記憶』のみを紐解く確実な治安特化モデル。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 15: // 第2部表紙
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.25, y: 1.95, w: 0.85, h: 0.85, fill: { color: '064E3B' }, line: { color: '34D399', width: 1.5 } });
        pptxSlide.addText('🎖️', { x: 7.25, y: 1.95, w: 0.85, h: 0.85, fontSize: 22, align: 'center', valign: 'middle' });
        pptxSlide.addText('LEGAL & SECURITY DEEP DIVE', { x: 6.1, y: 2.95, w: 3.15, h: 0.25, fontSize: 8, fontFace: 'Courier New', color: '34D399', bold: true, align: 'center' });
        pptxSlide.addText('第2部：法規適合性と\n10大防衛アーキテクチャ', { x: 6.1, y: 3.3, w: 3.15, h: 0.8, fontSize: 11, fontFace: 'Hiragino Mincho ProN', color: 'FFFFFF', bold: true, align: 'center' });
        break;

      case 16: // 異性紹介事業非該当の証明
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.1, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1.2 } });
        pptxSlide.addText('✅ POLICE ADAPTATION', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '059669', bold: true });
        pptxSlide.addText('「異性紹介事業」非該当 判定', { x: 6.25, y: 2.35, w: 2.85, h: 0.35, fontSize: 11, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });
        pptxSlide.addText('警察公安・行政書面要件適合', { x: 6.25, y: 2.7, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857' });

        pptxSlide.addText('面識のない異性との交際仲介に該当せず、公安への届出手続きは完全不要。', { x: 6.05, y: 3.35, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 17: // 共有記憶認証法理
        pptxSlide.addText('🔓', { x: 6.1, y: 1.95, w: 3.15, h: 0.45, fontSize: 20, align: 'center' });
        pptxSlide.addText('既知の記憶 ＝ 暗号通信路の鍵', { x: 6.1, y: 2.45, w: 3.15, h: 0.35, fontSize: 10.5, fontFace: 'Hiragino Mincho ProN', color: '065F46', bold: true, align: 'center' });
        pptxSlide.addText('二人だけの記憶クイズが、「新規出会い」ではない事実を電子証明。無名による不当接触や変質者のアタックを起動段階で100%封殺。', { x: 6.05, y: 3.1, w: 3.25, h: 1.6, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 18: // 時間制限ロック
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.85, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('⏱️ LOCKOUT SYSTEM', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('5回連続誤答で24H完全ロック', { x: 6.25, y: 2.35, w: 2.85, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.35, y: 2.95, w: 2.65, h: 0.35, fill: { color: '0F172A' }, line: { color: 'BE123C', width: 1 } });
        pptxSlide.addText('STATUS: IP_LOCKOUT_ACTIVE', { x: 6.35, y: 2.95, w: 2.65, h: 0.35, fontSize: 7.5, fontFace: 'Courier New', color: 'FB7185', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('悪意ある回答推測（ブルートフォース）に対し、累計5回不正解答でアカウント＋IPを24時間完全ロック。', { x: 6.05, y: 3.55, w: 3.25, h: 1.2, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 19: // 常用姓名照合
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('👤', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 18, align: 'center', valign: 'middle' });

        pptxSlide.addText('フルネーム規制', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'E11D48', bold: true });
        pptxSlide.addText('「山田太郎」等の実名は警告', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('本名の直截露出から保護', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('日本の常用姓名辞書に基づき、実名・フルネーム露出トラブルを自動規制。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 20: // 連絡先ステルス
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.5, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('REGEX SCAN FILTER : BLOCKED', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7, fontFace: 'Courier New', color: 'FB7185', bold: true });
        pptxSlide.addText('LINE ID: my_id_123  → MASK_ID\nTEL: 090-1234-5678 → MASK_TEL\n\nRESULT: LINE ID: **** / TEL: ****', { x: 6.25, y: 2.35, w: 2.85, h: 1.0, fontSize: 7.5, fontFace: 'Courier New', color: '34D399' });

        pptxSlide.addText('連絡先情報の直接交換をリアルタイムに伏字(****)へ自動プログラム変換し完全無害化。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 21: // Gemini AI モデレーション
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.5, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('✨ Gemini Security Agent v2.5', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '34D399', bold: true });
        pptxSlide.addText('INPUT: "お前どこにいる？絶対探すからな"\n危険検知: 執着・脅迫性 98% [隔離]\n自動処置: 即時隔離作動', { x: 6.25, y: 2.35, w: 2.85, h: 1.0, fontSize: 7.5, fontFace: 'Courier New', color: '7DD3FC' });

        pptxSlide.addText('高度な文章理解で、心理的な付きまとい・暴力隠語をリアルタイムにセマンティック自動検知・隔離。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 22: // シャドウフィルタ
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.3, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('$ sys_shadow_scan\n$ ATTACK DETECTED !\n$ SHADOW_FLAG_ISOLATION: ON', { x: 6.25, y: 2.1, w: 2.85, h: 1.0, fontSize: 8, fontFace: 'Courier New', color: '34D399', bold: true });

        pptxSlide.addText('冷やかし・荒らしユーザーは孤立した空間に送られます。送信成功に見せかけ攻撃意欲を無音で根絶。', { x: 6.05, y: 3.5, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'CBD5E1', align: 'center' });
        break;

      case 23: // 青少年保護 (18+)
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 6.25, y: 2.1, w: 0.75, h: 0.75, fill: { color: 'FFF1F2' }, line: { color: 'F43F5E', width: 2 } });
        pptxSlide.addText('18+', { x: 6.25, y: 2.1, w: 0.75, h: 0.75, fontSize: 13, bold: true, color: 'E11D48', align: 'center', valign: 'middle', fontFace: 'Arial' });

        pptxSlide.addText('MINOR PROTECTION', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('高校生以下は完全不可', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 10, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('非行・児童虐待被害を徹底予防', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('青少年をネット犯罪被害から完璧にプロテクトする強固なコンプライアンス管理。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 24: // 電子的利用宣誓ゲート
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.4, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('🛡️ 電子的利用宣誓ゲート [PLEDGE_GATE]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });

        pptxSlide.addText('☑ 18歳以上（高校生除く）の利用であること\n☑ ストーカー・嫌がらせ・監視目的でないこと\n☑ 法令・利用ガイドライン遵守への完全合意', { x: 6.25, y: 2.25, w: 2.85, h: 0.65, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', leading: 14 });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.95, w: 2.85, h: 0.25, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('✓ AUDIT LOGGED (IP & Timestamp 永続保全)', { x: 6.25, y: 2.95, w: 2.85, h: 0.25, fontSize: 6.5, bold: true, color: '065F46', align: 'center', valign: 'middle', fontFace: 'Courier New' });

        pptxSlide.addText('連絡先開示直前の厳格な電子的利用宣誓。タイムスタンプ・接続元IPを監査保全。', { x: 6.05, y: 3.35, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });
        break;

      case 25: // チケット全履歴保全
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🎫 チケットスレッド永続化  [TICKET_DB]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '0369A1', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.25, w: 2.85, h: 0.45, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('#REQ-1092: ユーザーからの通報・相談内容', { x: 6.3, y: 2.25, w: 2.75, h: 0.45, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '334155', valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.8, w: 2.85, h: 0.45, fill: { color: 'FAF5FF' }, line: { color: 'E9D5FF', width: 1 } });
        pptxSlide.addText('✨ Gemini AI コンプライアンス返信 [生成完了]', { x: 6.3, y: 2.8, w: 2.75, h: 0.45, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '7E22CE', valign: 'middle', bold: true });

        pptxSlide.addText('送受信全ログ完全永続化 ➔ 警察・司法証拠保全', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 26: // 明確な本人確認体系・料金分離 (無料グリーン & 600円オレンジ)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 3.15, h: 0.85, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('FREE TIER', { x: 6.2, y: 2.02, w: 1.8, h: 0.2, fontSize: 6.5, fontFace: 'Courier New', color: '047857', bold: true });
        pptxSlide.addText('年齢確認（18歳以上宣誓）', { x: 6.2, y: 2.22, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 2.15, w: 0.8, h: 0.35, fill: { color: '059669' } });
        pptxSlide.addText('無料', { x: 8.35, y: 2.15, w: 0.8, h: 0.35, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.95, w: 3.15, h: 0.85, fill: { color: 'FFF7ED' }, line: { color: 'F97316', width: 1.5 } });
        pptxSlide.addText('OFFICIAL eKYC', { x: 6.2, y: 3.02, w: 1.8, h: 0.2, fontSize: 6.5, fontFace: 'Courier New', color: 'C2410C', bold: true });
        pptxSlide.addText('公的身分証(eKYC)認証', { x: 6.2, y: 3.22, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 3.15, w: 0.8, h: 0.35, fill: { color: 'EA580C' } });
        pptxSlide.addText('600円', { x: 8.35, y: 3.15, w: 0.8, h: 0.35, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('🛡️ 明確な料金分離により消費者の誤認を防止し、法令を遵守。', { x: 6.05, y: 3.95, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 27: // eKYC・決済連携
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.65, fill: { color: 'FFF7ED' }, line: { color: 'FDBA74', width: 1 } });
        pptxSlide.addText('💳 Stripe 決済（600円仮売上）', { x: 6.25, y: 1.95, w: 2.1, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true, valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 2.1, w: 0.75, h: 0.35, fill: { color: 'FED7AA' } });
        pptxSlide.addText('仮売上確保', { x: 8.35, y: 2.1, w: 0.75, h: 0.35, fontSize: 6.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('▼', { x: 6.15, y: 2.65, w: 3.05, h: 0.25, fontSize: 8, color: '94A3B8', align: 'center' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.95, w: 3.05, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🆔 eKYC 審査（TRUSTDOCK等）', { x: 6.25, y: 2.95, w: 2.1, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 3.1, w: 0.75, h: 0.35, fill: { color: 'A7F3D0' } });
        pptxSlide.addText('自動分岐', { x: 8.35, y: 3.1, w: 0.75, h: 0.35, fontSize: 6.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('【承認】実請求＆バッジ点灯  /  【否認】即全額自動返金', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'C2410C', align: 'center', bold: true });
        break;

      case 28: // フォレンジックログ
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('📄 forensic_export.pdf  [SECURE]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', bold: true });

        pptxSlide.addText('要求番号: #REQ-2026-9912\n対象IP: 184.22.95.101\n認証合意: 一致 (VALID SIGN)', { x: 6.25, y: 2.25, w: 2.85, h: 0.7, fontSize: 7, fontFace: 'Courier New', color: '334155' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.35, y: 3.05, w: 2.65, h: 0.45, fill: { color: '1E293B' } });
        pptxSlide.addText('📥 捜査資料1キー抽出', { x: 6.35, y: 3.05, w: 2.65, h: 0.45, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('捜査事項照会書に数分で完全対応する証拠エクスポート体制。', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B', align: 'center' });
        break;

      case 29: // オプトアウト申請処理
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🛡️', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 20, align: 'center', valign: 'middle' });

        pptxSlide.addText('AUTO OPT-OUT', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '059669', bold: true });
        pptxSlide.addText('「二度と繋がらない」権利', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('全データ即時遮断', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('お相手との想い出を開門されたくない方の「再会を行わない権利」を完全に保障。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 30: // 総括
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.2, fill: { color: 'FFFFFF' }, line: { color: '34D399', width: 1.5 } });
        pptxSlide.addText('🏆', { x: 6.25, y: 2.15, w: 0.6, h: 0.7, fontSize: 22, align: 'center', valign: 'middle' });

        pptxSlide.addText('100% POLICE COMPLIANT', { x: 6.9, y: 2.1, w: 2.2, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '047857', bold: true });
        pptxSlide.addText('治安・防衛コンプライアンス適合証明', { x: 6.9, y: 2.35, w: 2.2, h: 0.5, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });

        pptxSlide.addText('警察公安、サイバー対策セクション、及び法規制の求めるあらゆる安全規範を完全に充足。', { x: 6.05, y: 3.4, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });
        break;

      default:
        break;
    }
  };

  const handleDownloadPPTX = () => {
    try {
      const pptx = new PptxGenJS() as any;
      pptx.layout = 'LAYOUT_16x9';

      slides.forEach((slide, index) => {
        const pptxSlide = pptx.addSlide();

        // 発表者用の口頭発表シナリオ・スライドノート(Notes)をスライドオブジェクトに埋め込む
        const scenarioText = POLICE_PRESENTATION_SCENARIOS[index];
        if (scenarioText) {
          pptxSlide.addNotes(scenarioText);
        }
        
        if (slide.layout === 'title') {
          pptxSlide.background = { fill: '1C2B3C' };
          
          pptxSlide.addText(slide.title, {
            x: 0.8,
            y: 1.5,
            w: 8.4,
            h: 2.2,
            fontSize: 26,
            fontFace: 'Hiragino Mincho ProN',
            color: 'FAFAF8',
            bold: true,
            align: 'left',
            valign: 'middle'
          });

          if (slide.subtitle) {
            pptxSlide.addText(slide.subtitle, {
              x: 0.8,
              y: 3.8,
              w: 8.4,
              h: 1.6,
              fontSize: 11,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: 'A5BFCF',
              align: 'left',
              valign: 'top'
            });
          }
        } else {
          pptxSlide.background = { fill: 'FAFAF8' };

          pptxSlide.addText(slide.category || "SECURITY AUDIT", {
            x: 0.8,
            y: 0.4,
            w: 8.4,
            h: 0.4,
            fontSize: 10,
            fontFace: 'Hiragino Kaku Gothic ProN',
            color: '7A8E9E',
            bold: true,
            align: 'left'
          });

          pptxSlide.addText(slide.title, {
            x: 0.8,
            y: 0.8,
            w: 8.4,
            h: 0.8,
            fontSize: 18,
            fontFace: 'Hiragino Mincho ProN',
            color: "1A2735",
            bold: true,
            align: "left"
          });

          // Bullet points on the left column (x: 0.6, y: 1.6, w: 5.2, h: 3.4)
          if (slide.points && slide.points.length > 0) {
            const bulletText = slide.points.map((pt: string) => "✦ " + pt).join("\n\n");
            pptxSlide.addText(bulletText, {
              x: 0.6,
              y: 1.6,
              w: 5.2,
              h: 3.4,
              fontSize: 10.5,
              fontFace: "Hiragino Kaku Gothic ProN",
              color: "2C3E50",
              align: "left",
              valign: "top"
            });
          }

          // Right visual card diagram (fully recreated from web preview)
          addPptxCardDiagram(pptx, pptxSlide, slide);
        }

        pptxSlide.addText("ReMEETs 治安・防衛コンプライアンス管理事務局", {
          x: 0.8,
          y: 5.2,
          w: 8.4,
          h: 0.3,
          fontSize: 8,
          fontFace: 'Hiragino Kaku Gothic ProN',
          color: '999999',
          align: 'left'
        });
      });

      pptx.writeFile({ fileName: '⑥ReMEETs警察・公安委員会事前相談用プレゼンテーションスライド.pptx' });
    } catch (e) {
      console.error(e);
      alert('PowerPointの生成中にエラーが発生しました。');
    }
  };

  const renderSlideVisualEnhanced = (id: number) => {
    const containerClass = "flex flex-col items-center justify-center p-3 sm:p-4 bg-[#FAFAF8] border border-slate-200 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300";
    const headerClass = "absolute top-1.5 right-2 font-mono text-[8px] sm:text-[9px] text-[#3B627F]/75 font-bold tracking-widest leading-none bg-[#3B627F]/5 px-1.5 py-0.5 rounded";
    
    switch (id) {
      case 2: // 名前の由来
        return (
          <div className={containerClass}>
            <div className={headerClass}>ReMEETs PARADIGM</div>
            <div className="flex items-center gap-3 sm:gap-6 z-10 my-auto">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow flex items-center justify-center text-slate-800 font-bold">A</div>
                <span className="text-[9px] text-slate-500 mt-1 font-sans">あなた</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#3B627F] font-mono leading-none">相互の信頼</span>
                <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-slate-200 via-[#3B627F] to-slate-200 relative">
                  <div className="absolute -top-1 left-1/2 -ml-1 text-[#3B627F] animate-pulse">✦</div>
                </div>
                <span className="text-[8px] text-[#3B627F]/70 font-mono">Re-meet</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#EAF2F8] border-2 border-[#3B627F] shadow flex items-center justify-center text-[#3B627F] font-bold">B</div>
                <span className="text-[9px] text-[#3B627F] mt-1 font-sans">懐かしい知人</span>
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-black/60 mt-3 text-center leading-relaxed">
              ネット上の無差別な「出会い」ではなく、昔の知人と巡り合うための「再会（Re-meet）」特化モデル。
            </p>
          </div>
        );
      case 3: // コンセプト
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1C2B3C] border border-slate-700/50 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-1.5 right-2 font-mono text-[8px] sm:text-[9px] text-cyan-400/55 font-bold tracking-widest leading-none">DRIFT CONCEPT</div>
            <div className="relative flex items-center justify-center w-full py-2 z-10">
              <Waves className="absolute text-cyan-500/20 animate-pulse w-16 h-16 sm:w-20 sm:h-20" />
              <div className="relative animate-bounce duration-1000">
                <div className="w-12 h-12 rounded-full bg-[#1A2735] border border-cyan-400/60 flex items-center justify-center text-[#3B627F] shadow-lg">
                  <Mail size={20} className="text-cyan-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[7px] font-mono font-bold">16:9</div>
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-300 mt-2 text-center leading-relaxed max-w-[220px]">
              投函から漂流、想い出という鍵により、未知の第三者を排除して本人へ届くボトルメールコンセプト。
            </p>
          </div>
        );
      case 4: // 構築目的
        return (
          <div className={containerClass}>
            <div className={headerClass}>SOCIAL MISSION</div>
            <div className="flex items-center gap-3 sm:gap-4 my-auto z-10">
              <div className="p-2 sm:p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">
                <Home size={18} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 self-start">孤立化対策</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800">孤独死・震災断絶の解消</span>
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-black/60 mt-2 text-center leading-relaxed">
              家族や親族の衰退期において、かつての恩師、同窓生などの「自発的隣人ネット」を再生する。
            </p>
          </div>
        );
      case 5: // ターゲットユーザー
        return (
          <div className={containerClass}>
            <div className={headerClass}>TARGET GROUPS</div>
            <div className="grid grid-cols-3 gap-2.5 w-full my-auto z-10">
              <div className="flex flex-col items-center p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/50">
                <School className="text-[#3B627F]" size={15} />
                <span className="text-[8.5px] font-bold mt-1 text-slate-700">同窓生</span>
              </div>
              <div className="flex flex-col items-center p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/50">
                <Home className="text-emerald-600" size={15} />
                <span className="text-[8.5px] font-bold mt-1 text-slate-700">旧隣人</span>
              </div>
              <div className="flex flex-col items-center p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/50">
                <Users className="text-indigo-600" size={15} />
                <span className="text-[8.5px] font-bold mt-1 text-slate-700">元同僚・恩師</span>
              </div>
            </div>
            <p className="text-[9px] text-black/50 text-center leading-normal">
              思い出トークが通じる、お互い生存を確認したい「あの人」にピンポイントで届く。
            </p>
          </div>
        );
      case 6: // 主要機能①（投函＆漂流）
        return (
          <div className={containerClass}>
            <div className={headerClass}>FUNCTION: DRIFT</div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700 my-auto">
              <span className="text-[9px] bg-[#3B627F]/10 text-[#3B627F] px-1.5 py-0.5 rounded-lg border border-[#3B627F]/20">国名＋名前投函</span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">漂流待機</span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-lg border border-emerald-200">クイズ開通</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-black/60 mt-3 text-center leading-relaxed">
              住所不要。お互いの「登録国」と「名前」でシステム上の波間に漂流。第三者から遮断された空間。
            </p>
          </div>
        );
      case 7: // 主要機能②（想い出クイズゲート＆表記ゆれ救済）
        return (
          <div className={containerClass}>
            <div className={headerClass}>QUIZ GATE SHIELD</div>
            <div className="flex flex-col gap-2 w-full my-auto z-10 max-w-[220px]">
              <div className="flex items-center gap-3 bg-slate-900 text-yellow-400 p-2 rounded-xl shadow-md border border-slate-700">
                <Lock size={16} className="animate-pulse shrink-0" />
                <div className="text-left flex flex-col">
                  <span className="text-[8px] font-mono text-cyan-300">QUIZ VERIFICATION GATE</span>
                  <span className="text-[10px] font-bold text-white">秘密の共通質問に全問正答で開門</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[7.5px] font-mono bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-800">
                <span>✦ 表記ゆれ自動救済 (Levenshtein ≤ 2)</span>
                <span className="font-bold">ON</span>
              </div>
            </div>
            <p className="text-[8.5px] text-black/60 mt-1 text-center leading-tight">
              共通の想い出が高精度認証キーとなり、第三者を遮断しつつ正当な再会を支援。
            </p>
          </div>
        );
      case 8: // 主要機能③（連絡先安全引き渡しモデル）
        return (
          <div className={containerClass}>
            <div className={headerClass}>CONTACT BRIDGE</div>
            <div className="w-full flex flex-col gap-2 my-auto max-w-[210px] bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-slate-700">連絡先安全引き渡し（セキュア・ブリッジ）</span>
                </div>
                <ShieldCheck className="text-emerald-600" size={12} />
              </div>
              <div className="space-y-1.5">
                <div className="bg-[#EAF2F8] text-[#1A2735] text-[8.5px] p-2 rounded-xl border border-[#3B627F]/20 font-mono">
                  <div className="text-[7.5px] text-slate-500">お相手の開示連絡先:</div>
                  <div className="font-bold text-[#3B627F]">LINE ID: @sample_friend</div>
                </div>
                <div className="bg-emerald-50 text-emerald-900 text-[7.5px] p-1.5 rounded-lg border border-emerald-200">
                  🔒 連絡先安全引き渡し完結型設計で、トラブルや犯罪リスクをシステム構造上ゼロに。
                </div>
              </div>
            </div>
            <p className="text-[8.5px] text-emerald-800 font-bold text-center leading-normal mt-1 flex items-center justify-center gap-1">
              <Shield size={10} className="text-emerald-600" /> 緊急通報・ワンタップブロック機能常備
            </p>
          </div>
        );
      case 9: // 管理・運用①（セキュリティダッシュボード）
        return (
          <div className={containerClass}>
            <div className={headerClass}>ADMIN MONITORING</div>
            <div className="flex items-center gap-3 sm:gap-4 my-auto z-10 w-full justify-center">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex flex-col items-center">
                <ShieldAlert size={18} className="animate-bounce" />
                <span className="text-[7.5px] font-bold mt-1">検知盾</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none">REALTIME THREATS</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 mt-1">アビューズ攻撃：0件</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">24時間総当たり・不正通信自動監視中</p>
              </div>
            </div>
          </div>
        );
      case 10: // 管理・運用②（シャドウフラグ隔離）
        return (
          <div className={containerClass}>
            <div className={headerClass}>SHADOW FILTER</div>
            <div className="flex items-center justify-between w-full max-w-[200px] my-auto gap-2">
              <div className="flex flex-col items-center p-1 bg-rose-50 text-rose-700 rounded border border-rose-100">
                <span className="text-[7px] font-bold">悪質ユーザー</span>
                <span className="text-[7px] font-mono mt-0.5">shadow_flag:1</span>
              </div>
              <div className="h-[2px] bg-slate-300 w-8 relative flex items-center justify-center">
                <div className="absolute w-1 h-3 bg-rose-500 rounded-full" />
              </div>
              <div className="flex flex-col items-center p-1 bg-slate-100 text-slate-600 rounded border border-slate-200">
                <span className="text-[7px] font-bold">一般ユーザー</span>
                <span className="text-[7px] font-mono text-emerald-600">影響ゼロ %</span>
              </div>
            </div>
            <p className="text-[9px] text-black/55 text-center leading-normal mt-2">
              つきまとい者や冷やかしの投稿は、本人には「成功」と自画自賛させたまま、裏側で自動隔離。
            </p>
          </div>
        );
      case 11: // 非機能①（最高レベルのセキュリティ）
        return (
          <div className={containerClass}>
            <div className={headerClass}>CRYPTOGRAPHIC ENGINE</div>
            <div className="flex flex-col items-center gap-1.5 my-auto z-10">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-[#3B627F]" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 font-serif">SHA-256 不可逆ストレッチ</span>
              </div>
              <div className="text-[8.5px] font-mono bg-slate-100 rounded px-2 py-0.5 border border-slate-200 text-slate-500">
                salt_key_hash_5a9b...
              </div>
            </div>
            <p className="text-[9px] text-black/55 text-center leading-relaxed">
              思い出パスワードが平文でサーバーに保存されることは一切ありません。完全にハッシュ保護されています。
            </p>
          </div>
        );
      case 12: // 非機能②（即時オプトアウト）
        return (
          <div className={containerClass}>
            <div className={headerClass}>ZERO TRACE PRIVACY</div>
            <div className="flex items-center gap-3.5 my-auto z-10">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <Trash2 size={18} className="animate-pulse" />
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[9px] font-mono text-rose-500 uppercase tracking-widest leading-none">OPT-OUT STANDARD</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-1">24時間以内物理削除の保証</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">物理サーバーからもデータを完全にクリーン</p>
              </div>
            </div>
          </div>
        );
      case 13: // システム構成（アーキテクチャ定義）
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1C2B3C] border border-slate-700/50 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-1.5 right-2 font-mono text-[8px] sm:text-[9px] text-cyan-400/55 font-bold tracking-widest leading-none">SYSTEM ARCHITECTURE</div>
            <div className="grid grid-cols-3 gap-1.5 w-full max-w-[200px] my-auto text-slate-300">
              <div className="p-1 px-1.5 rounded bg-slate-800 text-[8px] border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7.5px] bg-[#3B627F]/20 text-cyan-300 font-mono scale-[0.85] px-1 rounded">SPA</span>
                <span className="font-bold text-white mt-1 text-[8.5px]">React 18</span>
              </div>
              <div className="p-1 px-1.5 rounded bg-slate-800 text-[8px] border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7.5px] bg-emerald-500/10 text-emerald-300 font-mono scale-[0.85] px-1 rounded">Server</span>
                <span className="font-bold text-emerald-300 mt-1 text-[8.5px]">Express</span>
              </div>
              <div className="p-1 px-1.5 rounded bg-slate-800 text-[8px] border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7.5px] bg-indigo-500/10 text-indigo-300 font-mono scale-[0.85] px-1 rounded">Core</span>
                <span className="font-bold text-indigo-300 mt-1 text-[8.5px]">Gemini AI</span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-400 text-center leading-normal mt-1.5">
              厳重なサーバーサイドAPI中継。APIキーなどの極秘情報はブラウザに一切暴露しません。
            </p>
          </div>
        );
      case 14: // 対比分析
        return (
          <div className={containerClass}>
            <div className={headerClass}>COMPARISON SHIELD</div>
            <div className="flex flex-col gap-1.5 w-full my-auto text-xs max-w-[190px]">
              <div className="flex items-center justify-between p-1 bg-rose-50 text-rose-700 rounded border border-rose-100 text-[8.5px]">
                <span>一般的なマッチング</span>
                <span className="font-bold">無差別（危険✕）</span>
              </div>
              <div className="flex items-center justify-between p-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 text-[8.5px]">
                <span>ReMEETs 再会モデル</span>
                <span className="font-bold">既知限定（安全◯）</span>
              </div>
            </div>
          </div>
        );
      case 16: // 異性紹介事業非該当の証明
        return (
          <div className={containerClass}>
            <div className={headerClass}>LEGAL VERIFIED</div>
            <div className="flex items-center gap-3.5 my-auto z-10 text-emerald-700 bg-emerald-50/50 p-2 sm:p-3 rounded-xl border border-emerald-200">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider leading-none">POLICE ADAPTATION</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-1">「異性紹介事業」非該当 判定</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">警察公安・行政書面要件適合</p>
              </div>
            </div>
          </div>
        );
      case 17: // 共有記憶認証法理解析
        return (
          <div className={containerClass}>
            <div className={headerClass}>AUTHENTICATION LAW</div>
            <div className="flex flex-col items-center gap-1 my-auto text-[#3B627F]">
              <Unlock size={18} className="text-emerald-600" />
              <span className="text-[10px] font-bold mt-1 text-slate-800">既知の記憶 ＝ 暗号通信路の鍵</span>
            </div>
            <p className="text-[9px] text-black/55 text-center leading-normal">
              他人に類推不可能な二人だけの記憶クイズは、「新たな出会い」ではない決定的事実を電子的に証明します。
            </p>
          </div>
        );
      case 18: // 安全防衛①（時間制限ロック）
        return (
          <div className={containerClass}>
            <div className={headerClass}>IP BRUTE GUARD</div>
            <div className="flex flex-col items-center gap-2 my-auto text-red-600 w-full animate-fadeIn">
              <div className="flex items-center gap-3 bg-rose-50 p-2 rounded-xl border border-rose-100 max-w-[200px]">
                <Clock size={20} className="text-rose-500 animate-spin-slow shrink-0" />
                <div className="text-left">
                  <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none">LOCKOUT SYSTEM</span>
                  <div className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-800 mt-0.5 leading-tight">
                    5回失敗で24H完全ロック
                  </div>
                </div>
              </div>
              <div className="bg-rose-950 text-rose-300 font-mono text-[8px] px-2 py-0.5 rounded border border-rose-900 animate-pulse">
                STATUS: ACCESS_DENIED (IP LOCKOUT)
              </div>
            </div>
          </div>
        );
      case 19: // 安全防衛②（常用姓名自動照合）
        return (
          <div className={containerClass}>
            <div className={headerClass}>NAME REGEX DEFENSE</div>
            <div className="flex items-center gap-3 sm:gap-4 my-auto z-10">
              <div className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl relative">
                <UserCheck size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8.5px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-1.5 self-start">フルネーム規制</span>
                <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-800 mt-1">「山田太郎」等の実名は警告</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">本名の直截的露出からユーザーを保護</p>
              </div>
            </div>
          </div>
        );
      case 20: // 安全防衛③（連絡先ステルス）
        return (
          <div className={containerClass}>
            <div className={headerClass}>STEALTH MASK</div>
            <div className="w-full flex flex-col gap-1.5 max-w-[210px] my-auto bg-slate-900 rounded-xl p-2.5 shadow-md border border-slate-800 font-mono text-[8.5px] text-left">
              <div className="flex items-center justify-between text-[7px] text-slate-500 pb-1 border-b border-slate-800">
                <span>REGEX SCAN FILTER</span>
                <span className="text-xs inline-block leading-none text-rose-500 font-bold font-mono animate-pulse">CRITICAL BLOCKED</span>
              </div>
              <div className="space-y-1 text-slate-300 mt-1 scale-[0.95] origin-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 line-through text-[8px]">LINE ID: my_id_123</span>
                  <span className="text-rose-400 font-bold">{"-> MASK_ID"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 line-through text-[8px]">TEL: 090-1234-5678</span>
                  <span className="text-rose-400 font-bold">{"-> MASK_TEL"}</span>
                </div>
                <div className="pt-1 border-t border-slate-800 text-teal-300 font-bold text-[8px]">
                  RESULT: LINE ID: **** / TEL: ****
                </div>
              </div>
            </div>
          </div>
        );
      case 21: // 安全防衛④（Gemini AI モデレーション）
        return (
          <div className={containerClass}>
            <div className={headerClass}>SEMANTIC AI FILTER</div>
            <div className="w-full flex flex-col gap-2 my-auto max-w-[210px] animate-fadeIn text-left">
              <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-md border border-slate-800 font-mono text-[8px] space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-cyan-400">
                  <span className="flex items-center gap-1"><Sparkles size={10} /> Gemini Security Agent</span>
                  <span>v2.5</span>
                </div>
                <div className="text-slate-400 leading-tight">
                  INPUT: "お前どこにいる？絶対探してやるからな"
                </div>
                <div className="border-t border-slate-800 pt-1 flex flex-col gap-0.5">
                  <div className="text-rose-400 font-bold flex items-center gap-1">
                    <span>● 危険検知:</span>
                    <span className="bg-rose-950 text-rose-300 px-1 rounded scale-[0.9]">粘着・脅迫性 98%</span>
                  </div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>● 自動処置:</span>
                    <span className="bg-slate-800 text-cyan-300 px-1 rounded scale-[0.9]">ステルス隔離作動</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-black/55 text-center leading-normal mt-1.5">
              Gemini AIが文章の裏の執着精神などをリアルタイムセマンティック評価。
            </p>
          </div>
        );
      case 22: // 安全防衛⑤（シャドウフィルタ）
        return (
          <div className={containerClass}>
            <div className={headerClass}>SHADOW SIMULATION</div>
            <div className="w-full max-w-[190px] bg-slate-900 rounded-lg p-2.5 font-mono text-[8px] text-teal-400/85 my-auto shadow-md text-left">
              <div className="text-slate-500 scale-[0.95] origin-left">$ sys_shadow_scan</div>
              <div className="text-rose-400 font-bold scale-[0.95] origin-left">$ ATTACK DETECTED !</div>
              <div className="text-yellow-300 font-bold animate-pulse scale-[0.95] origin-left">$ SHADOW_FLAG_ISOLATION: ON</div>
            </div>
            <p className="text-[9px] text-black/60 text-center leading-normal mt-1.5">
              冷やかしや荒らしユーザーは、即座に「孤立した空間」に送られます。
            </p>
          </div>
        );
      case 23: // 安全防衛⑥（青少年保護規約）
        return (
          <div className={containerClass}>
            <div className={headerClass}>YOUTH PROTECTION</div>
            <div className="flex items-center gap-3 sm:gap-4 my-auto z-10 text-red-600 bg-rose-50/50 p-2 rounded-xl border border-rose-100">
              <div className="w-9 h-9 border-2 border-rose-500 rounded-full flex items-center justify-center font-bold text-rose-500 text-xs sm:text-sm font-sans shrink-0">
                18+
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none">MINOR PROTECTION</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-1">高校生以下は完全お断り</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">非行・児童虐待被害を徹底予防</p>
              </div>
            </div>
          </div>
        );
      case 24: // 安全防衛⑦（電子的利用宣誓ゲート）
        return (
          <div className={containerClass}>
            <div className={headerClass}>PLEDGE AUDIT GATE</div>
            <div className="flex flex-col items-center gap-2 w-full my-auto">
              <div className="w-full max-w-[200px] bg-white border border-slate-200 rounded-xl p-2.5 relative shadow-sm overflow-hidden text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                  <span className="text-[7.5px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" /> 法令・規約遵守電子的宣誓
                  </span>
                  <span className="text-[6.5px] font-mono text-slate-400">PLEDGE_GATE</span>
                </div>
                <div className="space-y-1 text-[7px] text-slate-700">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>18歳以上（高校生除く）の利用であること</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>ストーカー・嫌がらせ・監視目的でないこと</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>法令遵守・連絡先適正利用の確約</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[6px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <span>LOGGED: IP & TIMESTAMP</span>
                  <span className="font-bold">VERIFIED ✓</span>
                </div>
              </div>
              <p className="text-[9px] text-[#3B627F] font-bold text-center leading-normal">
                連絡先開示直前の厳格な電子的利用宣誓。タイムスタンプ・接続元IPを監査保全。
              </p>
            </div>
          </div>
        );
      case 25: // 安全防衛⑧（問い合わせ・通報全履歴チケット＆Gemini AI返信ドラフト）
        return (
          <div className={containerClass}>
            <div className={headerClass}>TICKET & AI DRAFT</div>
            <div className="w-full max-w-[220px] bg-white rounded-xl p-2.5 shadow-sm border border-slate-200 flex flex-col gap-1.5 my-auto text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-[8.5px] font-bold text-slate-800 flex items-center gap-1">
                  🎫 チケットスレッド永続化
                </span>
                <span className="text-[6.5px] font-mono bg-sky-100 text-sky-800 px-1 py-0.5 rounded">TICKET_DB</span>
              </div>
              <div className="space-y-1 text-[7.5px] font-mono">
                <div className="bg-slate-50 p-1 rounded border border-slate-100 text-slate-600">
                  <span className="text-slate-400">#REQ-1092:</span> ユーザーからの通報・相談内容
                </div>
                <div className="bg-purple-50 p-1 rounded border border-purple-100 text-purple-900 flex items-center justify-between">
                  <span>✨ Gemini AI コンプライアンス返信ドラフト</span>
                  <span className="text-[6.5px] bg-purple-200 text-purple-800 px-1 rounded">生成完了</span>
                </div>
              </div>
              <div className="text-[7.5px] text-slate-500 border-t border-slate-100 pt-1 flex justify-between">
                <span>送受信全ログ完全永続化</span>
                <span className="text-emerald-600 font-bold">警察・司法証拠保全</span>
              </div>
            </div>
          </div>
        );
      case 26: // 安全防衛⑨（透明な本人確認・料金体系）
        return (
          <div className={containerClass}>
            <div className={headerClass}>PRICING & VERIFICATION</div>
            <div className="w-full max-w-[220px] flex flex-col gap-2 my-auto">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-left">
                <div className="flex flex-col">
                  <span className="text-[7px] font-mono text-emerald-600 font-bold uppercase">FREE TIER</span>
                  <span className="text-[9.5px] font-bold text-emerald-950">年齢確認（18歳以上宣誓）</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">無料</span>
              </div>
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl text-left">
                <div className="flex flex-col">
                  <span className="text-[7px] font-mono text-orange-600 font-bold uppercase">OFFICIAL eKYC</span>
                  <span className="text-[9.5px] font-bold text-orange-950">公的身分証(eKYC)認証</span>
                </div>
                <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">600円</span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-500 text-center mt-1">
              明確な料金分離により消費者の誤認を防止し、法令を遵守。
            </p>
          </div>
        );
      case 27: // 安全防衛⑩（eKYC・決済連携）
        return (
          <div className={containerClass}>
            <div className={headerClass}>EKYC & STRIPE COUPLING</div>
            <div className="flex flex-col items-center gap-1.5 w-full z-10 max-w-[220px]">
              <div className="flex items-center gap-2 bg-[#EAF2F8] border border-[#3B627F]/20 px-2.5 py-1 rounded-xl w-full justify-between text-left">
                <span className="text-[8.5px] font-bold text-slate-800">💳 Stripe 決済（600円仮売上）</span>
                <span className="text-[6.5px] bg-sky-100 text-sky-800 font-bold px-1 py-0.5 rounded">仮売上確保</span>
              </div>
              <div className="h-2.5 w-[2px] bg-dashed bg-slate-300 relative">
                <span className="absolute -left-1 -top-1 text-slate-400 text-[6px]">▼</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F0FDF4] border border-emerald-500/20 px-2.5 py-1 rounded-xl w-full justify-between text-left">
                <span className="text-[8.5px] font-bold text-emerald-900">🆔 eKYC 審査（TRUSTDOCK等）</span>
                <span className="text-[6.5px] bg-emerald-100 text-emerald-800 font-bold px-1 py-0.5 rounded">自動分岐判定</span>
              </div>
              <div className="flex justify-between w-full text-[7.5px] text-slate-500 font-mono mt-0.5 px-1">
                <span>【承認】実請求＆バッジ点灯</span>
                <span>【否認】即全額自動返金</span>
              </div>
            </div>
          </div>
        );
      case 28: // 捜査司法機関（フォレンジックログ）
        return (
          <div className={containerClass}>
            <div className={headerClass}>JUDICIAL ALIGNMENT</div>
            <div className="w-full flex flex-col gap-1.5 my-auto max-w-[210px] bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm text-left">
              <div className="flex items-center gap-1.5 text-[#1C2B3C] border-b border-slate-200 pb-1 w-full justify-between pr-1">
                <span className="flex items-center gap-1 leading-none font-sans font-bold text-[8.5px]">
                  <FileText size={10} className="text-[#3B627F] mr-1 inline-block" />
                  forensic_export.pdf
                </span>
                <span className="text-[6px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1 rounded border border-emerald-200 leading-none py-0.5">SECURE</span>
              </div>
              <div className="space-y-0.5 border-b border-dashed border-slate-200 pb-1">
                <div className="flex justify-between text-[7px] font-mono text-slate-500 scale-[0.95] origin-left">
                  <span>要求番号:</span> <span className="font-bold">#REQ-2026-9912</span>
                </div>
                <div className="flex justify-between text-[7px] font-mono text-slate-500 scale-[0.95] origin-left">
                  <span>対象IP:</span> <span className="font-bold">184.22.95.101</span>
                </div>
                <div className="flex justify-between text-[7px] font-mono text-[#E11D48] bg-rose-50 px-1 rounded scale-[0.95] origin-left">
                  <span>認証合意:</span> <span className="font-bold">一致 (VALID SIGN)</span>
                </div>
              </div>
              <button className="w-full py-1 bg-[#1C2B3C] text-white text-[8px] font-bold rounded-lg hover:bg-[#3B627F] transition-colors flex items-center justify-center gap-1 cursor-default">
                <Download size={8} /> 調査資料1キー出力
              </button>
            </div>
            <p className="text-[8.5px] text-black/55 text-center leading-normal mt-1">
              捜査事項照会書に数分で完全対応する証拠エクスポート
            </p>
          </div>
        );
      case 29: // オプトアウト申請処理
        return (
          <div className={containerClass}>
            <div className={headerClass}>OPT-OUT AUDIT</div>
            <div className="flex items-center gap-3 sm:gap-4 my-auto z-10 text-[#3B627F] bg-indigo-50/60 p-2 rounded-xl border border-indigo-100">
              <Shield size={18} className="text-indigo-600 animate-pulse" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-wider leading-none">AUTO OPT-OUT</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-1">「二度と繋がらない」権利</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">要望された時点で、全データ即時遮断</p>
              </div>
            </div>
          </div>
        );
      case 30: // 総括
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-1.5 right-2 font-mono text-[8px] sm:text-[9px] text-amber-600/50 font-bold tracking-widest leading-none">SUMMARY EMBLEM</div>
            <div className="flex items-center gap-3 my-auto z-10 bg-white/60 p-2 sm:p-2.5 rounded-xl border border-amber-100">
              <Award size={20} className="text-amber-500 animate-spin-slow" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider leading-none">HIGH SECURITY CERTIFIED</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-1">治安・防衛コンプライアンス 100% 適合</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 🚀 全5大公式ドキュメント 直感選択パネル（階層排除・一本化） */}
      <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-5 print-hidden shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
            <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
              <Rocket className="text-[#3B627F]" size={18} />
              <span>本番デプロイ ＆ 広報PR 公式ライブラリ（全5編）</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-sans">
            閲覧・出力したいドキュメントを選択してください
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {[
            { id: 'deployment', badge: '①', label: '本番デプロイガイド＆移行手順', cat: 'デプロイ' },
            { id: 'cost_estimate', badge: '①-B', label: '本番運用コスト＆初期費用', cat: 'コスト設計' },
            { id: 'cost_list_detailed', badge: '①-C', label: '総合見積もり＆責任設計書', cat: '見積・責任' },
            { id: 'evaluation', badge: '⑨', label: 'サイト全体評価＆技術レビュー', cat: '広報・評価' },
            { id: 'pr_plan', badge: '⑩', label: '広報・PRマーケティング戦略書', cat: 'PR戦略' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDocType(item.id as any)}
              className={`text-left p-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col justify-between gap-2 border ${
                docType === item.id
                  ? 'bg-[#3B627F] text-white border-[#3B627F] shadow-sm ring-2 ring-[#3B627F]/20 font-extrabold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  docType === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.badge}
                </span>
                <span className={`text-[9px] font-sans ${docType === item.id ? 'text-teal-200' : 'text-slate-400'}`}>
                  {item.cat}
                </span>
              </div>
              <span className="leading-snug text-[11px] line-clamp-2">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* エクスポート・ダウンロード管理統合盤 (USER REQUEST COMPLIANCE) */}
      {/* 本番準備＆動作確認 2大チェックリスト起動盤 */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print-hidden animate-fadeIn shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckSquare size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-sans flex items-center gap-2">
              <span>本番公開・動作検証 2大マスターチェックリスト</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                自動保存対応
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              本番サーバー構築・環境変数設定から、スマホ実機・OAuth・決済・eKYCの全動線テストまで一元記録できます。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => {
              setActiveChecklistTab('deploy');
              setShowChecklistModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            title="インフラ、DB、外部APIキー、法務整備の19大項目を確認・記録します。"
          >
            <CheckSquare size={14} />
            <span>📋 ① 本番デプロイ 19大マスターリスト</span>
          </button>

          <button
            onClick={() => {
              setActiveChecklistTab('operation');
              setShowChecklistModal(true);
            }}
            className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            title="会員登録からAI検閲、クイズ突破、SMS認証、eKYC、Stripe決済、連絡先開示までの実稼働テストを確認・記録します。"
          >
            <Search size={14} />
            <span>🔍 ② 本番前動作確認 22大テストリスト</span>
          </button>
        </div>
      </div>

      {/* ドキュメント出力・PDF印刷操作盤 */}
      <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print-hidden animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
            <Download size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 font-sans">
              公式ドキュメント PDF出力・印刷操作盤
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              現在表示中のデプロイガイド、運用コスト設計書、PR戦略書を高品位PDFとして出力・保存します。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {docType !== 'matrix' && docType !== 'slides' && (
            <button
              onClick={handlePrintDocument}
              className="px-4 py-2 bg-[#3B627F] text-white hover:bg-[#1C2B3C] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} />
              <span>📄 表示中ドキュメントをPDF保存 / 印刷</span>
            </button>
          )}

          {docType === 'matrix' && (
            <>
              <button
                onClick={handlePrintDocument}
                className="px-3.5 py-1.5 bg-[#3B627F] text-white hover:bg-[#1C2B3C] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Printer size={13} />
                <span>マトリクスをPDFでダウンロード / 印刷</span>
              </button>
            </>
          )}

          {docType === 'slides' && (
            <button
              onClick={handleDownloadPPTX}
              className="px-3.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <Presentation size={13} />
              <span>PowerPoint (.pptx) エクスポート</span>
            </button>
          )}
        </div>
      </div>

      {docType === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-950 leading-relaxed font-sans flex items-start gap-2.5">
            <span className="text-base select-none">🛡️</span>
            <div>
              <strong>セキュリティ適合性監査マトリクス：</strong>
              ReMEETsのすべての利用動線（会員登録から手紙投函、クイズゲート、メッセージ開通、事件防止まで）に対し、想定されるストーカー行為や不正アビューズ脅威をリストアップ。一次防衛策（システムによるバリデーションバリケード）と二次防衛策（Gemini AIによるセマンティック文脈監視）の二重自動フィルタおよび、司法照会用のログ保存の仕組みを完全に公開しています。
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-[#3B627F]/40 rounded-3xl shadow-md bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#487799]/10 text-[#3B627F] border-b-2 border-[#3B627F]/40 font-bold">
                  <th className="p-4 border-r border-[#3B627F]/30 rounded-tl-2xl">防御フェーズ</th>
                  <th className="p-4 border-r border-[#3B627F]/30">想定脅威（アビューズ）</th>
                  <th className="p-4 border-r border-[#3B627F]/30">プログラム防衛策（バリデーション等）</th>
                  <th className="p-4 border-r border-[#3B627F]/30">AIモデレーション（Gemini審査等）</th>
                  <th className="p-4 rounded-tr-2xl border-b border-[#3B627F]/40 font-mono text-[11px]">監査用ログ・痕跡データ (Forensic)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#3B627F]/30 font-sans">
                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">① プロフィール設定</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">本名フルネーム登録による個人特定危険</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    アカウント登録・ニックネーム設定時に、日本人の典型的な姓名辞書データベースと照合。一致度が高過ぎるフルネーム（例：漢字2字＋漢字2字等）は警告し、イニシャルやあだ名へ変更を促します。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    自己紹介文などの自由入力エリアを自動判定。「本名」「住所」「SNSハンドル」が含まれている比率をAI判定し、不具合警告。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    登録時のグローバルIP・UA・登録タイミングスタンプを永続セキュリティ保存。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">② 手紙ボトル投函（基本）</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">手紙内の「実名・連絡先交換」によるプラットフォーム外への誘導・ハラスメント</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    文字入力ボックスフックに、メール/電話Regex、LINE/インスタ等SNSアカウントの検知Regexをバインド。外部手段の直接掲載自体を仕組みから厳格に弾きます。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    <strong>【レッドアラート格納】</strong><br/>
                    「L!NE」「L_I_N_E」などの伏字や、SNSを示唆する回避文章をGemini AIが文脈解釈。「未承認」に落とし一般漂流から1秒で完全シャット。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    AIが判定したアラート文面、危険度判定ログ、ボトル投函元の会員アカウント情報を完全ログ化。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">② 手紙ボトル投函（他人特定）</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">標的のお相手以外の第三者プライバシー権利侵害・特定情報の掲載</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    宛先を規定の「お名前」「都道府県」「出会った当時の関係性」などの曖昧なデータに制約。具体的なアパート名、個別地番、職場名称などは入力不可。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    「想い出メッセージ」にお相手のプライバシーや実質的なストーキングに繋がる極めて狭い情報を記述していないかをAIモデレーション検知。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    投函緯度経度・IP履歴などセキュリティログを自動追跡保管。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">③ 想い出クイズの設定</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">クイズ文面を悪用した誹謗中傷、嫌がらせ、ネットいじめ</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    質問の入力ボックス内にNGワード（誹謗・性的侮辱表現など）を監視する文字バリデーションをコール。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    質問全体のセンチメント（感情強度）判定。執拗な執着、脅迫、恋愛感情の強制的な強要を発見した場合に自動的に対象ボトルの一般流出を一時停止（漂流停止）。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    クイズ問題データ、設定者アカウントデータ、不承認検知履歴を管理者向け監査として完全保存。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">④ お相手検索行為</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">第三者が宛先に対して手当たり次第に総当たり検索しストーキングを試行</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    一定時間に繰り返される異なる氏名、または多拠点の都道府県切り替え無差別検索動作に対してレートペナルティ（お名前検索の回数制限）を設定。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    特定のアカウントによる総当たり型のクエリ動作、不正ボットに近い高サイクルログを自動検知して管理パネル通報。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    検索の監査ログ（`search_logs`）の完全暗号化保存（パーマリンク）。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">⑤ クイズ解答試行</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">あてずっぽうなどクイズの総当たり解答による手紙の不正な解凍（個人情報リーク）</td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    同じボトル、または同じIP/セッションから一定回数（基本は5回）連続で回答を誤った場合に、<strong>プログラム的に手紙の回答権を24時間完全にロックアウト</strong>。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    不自然な多回数失敗ボトルの検知。バーストした過剰なアタックセッションを検疫。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    失敗時の試行ワード履歴、元セッション・IP情報を保存。管理者によるアカウント拒否権と連動。
                  </td>
                </tr>

                <tr className="hover:bg-brand-light/10 transition-colors">
                  <td className="p-4 font-bold text-black border-r border-[#3B627F]/20 bg-[#3B627F]/5">⑥ 連絡先開示（セキュアブリッジ）</td>
                  <td className="p-4 text-black/75 border-r border-[#3B627F]/20">なりすまし突破成功後のストーカー・嫌がらせ接触、事件化</td>
                  <td className="p-4 text-black/70 leading-relaxed font-sans text-xs border-r border-[#3B627F]/20">
                    連絡先開示手続きに進む前に、<strong>18歳以上（高校生を除く）</strong>、<strong>ストーカーや無断面識を目的としない安全第一の利用宣誓</strong>への電子的合意を完全無効化不可能なフェーズゲートとして設置。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed border-r border-[#3B627F]/20">
                    不適切な利用の兆候や多回数照合試行をAI分析。執着・悪意が認められた場合に即時遮断。
                  </td>
                  <td className="p-4 text-black/70 leading-relaxed font-mono text-[10px]">
                    同意した電子的宣誓ログ（合意タイムスタンプ、IPアドレス、ユーザー識別子）を「証拠開示用」として管理者サーバーデータベースに高セキュリティ保全。
                  </td>
                </tr>
              </tbody>
                </table>
              </div>
            </div>
          )}



        {/* 下段：マスターのマークダウン HTML プレビューレンダラー / スライドプレゼンター */}
        <div className="border-t border-brand-border/50 pt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-bold text-black uppercase tracking-wider font-sans">
                {docType === 'slides' ? 'スライド資料のリアルタイムプレビュー (16:9 適合検証済)' : '全編マスター文書 HTMLレンダラー（公式監査書面）'}
              </span>
            </div>
            {docType === 'slides' && (
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold font-sans">
                PowerPoint (.pptx) 出力に完全対応
              </span>
            )}
          </div>

          <div className="p-4 md:p-6 bg-white border border-brand-border/60 rounded-3xl max-w-full overflow-x-hidden shadow-sm print:hidden">
            {docType === 'slides' ? (
              <PolicePresentationSlideViewer 
                slides={slides} 
                scenarios={POLICE_PRESENTATION_SCENARIOS}
                onOpenScenarioDoc={() => {
                  setDocType('scenario');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
              />
            ) : (
              loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                  <p className="text-xs text-brand-dark/50">ドキュメントを読み込み中...</p>
                </div>
              ) : (
                docType === 'cost_estimate' ? (
                  <div className="grid grid-cols-1 gap-8 items-stretch w-full">
                    {/* 上側: 動的コスト試算シミュレータ＆初期費用（横幅最大） */}
                    <div className="w-full bg-slate-900 text-slate-100 p-6 rounded-3xl border-2 border-[#3B627F] shadow-md flex flex-col justify-start">
                      <div className="mb-4">
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">REALTIME ESTIMATOR</span>
                        <h4 className="text-sm font-bold text-white mt-1.5 font-sans">本番運用コスト＆初期費用シミュレータ</h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                          本番運用の月間コストと初期セットアップにかかる費用を、タブで切り替えて確認・試算できます。
                        </p>
                      </div>

                      {/* タブ切り替えボタン */}
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4 font-sans max-w-md">
                        <button
                          onClick={() => setCostTab('running')}
                          className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                            costTab === 'running'
                              ? 'bg-[#3B627F] text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          月間ランニングコスト
                        </button>
                        <button
                          onClick={() => setCostTab('initial')}
                          className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                            costTab === 'initial'
                              ? 'bg-[#3B627F] text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          初期費用・ドメイン等
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-6 items-stretch w-full">
                        <div className="w-full">
                          {costTab === 'running' ? renderCostSimulator() : renderInitialCostSimulator()}
                        </div>
                        <div className="w-full bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-3 leading-relaxed font-sans text-left flex flex-col justify-center">
                          <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                            <span>💡</span> マネタイズ黒字化の仕組み
                          </div>
                          <p>
                            手紙開封手数料（600円）およびeKYC本人確認審査手数料（600円）の合計1,200円（税込）をStripe経由で決済する際、外部認証ベンダー実費（SMS送信費12円、eKYC審査実費200円等）が完全にカバーされ、高水準の黒字運用が確実に維持されます。
                          </p>
                          <p className="text-[10.5px]">
                            また、初期導入時はLINE & Google認証連携やStripe本番審査、さらにデータベース構築（Drizzle ORM）まで含めて<strong>基本初期費用は￥0</strong>（特商法表記のバーチャルオフィス代や独自ドメイン代等の実費のみ）でスタートできます。
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 下側: マネタイズ・見積もり設計ガイド */}
                    <div className="w-full bg-white p-6 rounded-3xl border border-brand-border/40 shadow-sm prose prose-sm max-w-none text-black font-serif break-words">
                      <Markdown
                        components={{
                          h1: (props) => <h1 className="text-xl md:text-2xl font-bold font-serif mt-4 mb-5 border-b-2 border-black/10 pb-3 text-black tracking-tight" {...props} />,
                          h2: (props) => <h2 className="text-lg md:text-xl font-bold font-serif mt-6 mb-3 border-b border-black/5 pb-1.5 text-black/95" {...props} />,
                          h3: (props) => <h3 className="text-base md:text-lg font-bold font-serif mt-4 mb-2 text-black/85" {...props} />,
                          p: (props) => <p className="text-xs leading-relaxed mb-4 text-black/85 font-sans" {...props} />,
                          ul: (props) => <ul className="list-disc list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
                          ol: (props) => <ol className="list-decimal list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
                          li: (props) => <li className="mb-0.5 leading-relaxed" {...props} />,
                          table: (props) => (
                            <div className="overflow-x-auto my-4 border border-brand-border/40 rounded-xl shadow-sm">
                              <table className="w-full text-left border-collapse text-[11px] md:text-xs" {...props} />
                            </div>
                          ),
                          thead: (props) => <thead className="bg-[#487799]/5 text-black border-b border-brand-border font-bold font-serif" {...props} />,
                          tbody: (props) => <tbody className="divide-y divide-brand-border/10 font-sans" {...props} />,
                          tr: (props) => <tr className="hover:bg-brand-light/10 transition-colors" {...props} />,
                          th: (props) => <th className="px-3 py-2 font-semibold text-black" {...props} />,
                          td: (props) => <td className="px-3 py-2 text-black/75 whitespace-normal break-words" {...props} />,
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = inline ?? !match;
                            if (!isInline && match && match[1] === 'html') {
                              return (
                                <div 
                                  className="my-6 p-1 bg-white text-slate-900 rounded-3xl border border-slate-200/80 shadow-sm max-w-full overflow-x-auto"
                                  dangerouslySetInnerHTML={{ __html: String(children) }} 
                                />
                              );
                            }
                            return isInline 
                              ? <code className="bg-black/5 text-brand-primary px-1 rounded font-mono text-[10px]" {...props}>{children}</code>
                              : <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-x-auto font-mono text-[10px] my-4 leading-relaxed whitespace-pre-wrap"><code className={className} {...props}>{children}</code></pre>;
                          },
                          strong: (props) => <strong className="font-bold text-black" {...props} />,
                          hr: (props) => <hr className="my-6 border-t border-brand-border/40" {...props} />,
                        }}
                      >
                        {markdown}
                      </Markdown>
                    </div>
                  </div>
                ) : docType === 'pr_plan' ? (
                  <div className="space-y-6 w-full">
                    <PRShortsHelperCard />
                    <div className="prose prose-sm max-w-none text-black font-serif overflow-x-hidden break-words bg-white p-6 md:p-8 rounded-3xl border border-brand-border/40 shadow-sm">
                      <Markdown
                        components={{
                          h1: (props) => <h1 className="text-xl md:text-2xl font-bold font-serif mt-8 mb-5 border-b-2 border-black/10 pb-3 text-black tracking-tight" {...props} />,
                          h2: (props) => <h2 className="text-lg md:text-xl font-bold font-serif mt-6 mb-3 border-b border-black/5 pb-1.5 text-black/95" {...props} />,
                          h3: (props) => <h3 className="text-base md:text-lg font-bold font-serif mt-4 mb-2 text-black/85" {...props} />,
                          p: (props) => <p className="text-xs leading-relaxed mb-4 text-black/85 font-sans" {...props} />,
                          ul: (props) => <ul className="list-disc list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
                          ol: (props) => <ol className="list-decimal list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
                          li: (props) => <li className="mb-0.5 leading-relaxed" {...props} />,
                          table: (props) => (
                            <div className="overflow-x-auto my-4 border border-brand-border/40 rounded-xl shadow-sm">
                              <table className="w-full text-left border-collapse text-[11px] md:text-xs" {...props} />
                            </div>
                          ),
                          thead: (props) => <thead className="bg-[#487799]/5 text-black border-b border-brand-border font-bold font-serif" {...props} />,
                          tbody: (props) => <tbody className="divide-y divide-brand-border/10 font-sans" {...props} />,
                          tr: (props) => <tr className="hover:bg-brand-light/10 transition-colors" {...props} />,
                          th: (props) => <th className="px-3 py-2 font-semibold text-black" {...props} />,
                          td: (props) => <td className="px-3 py-2 text-black/75 whitespace-normal break-words" {...props} />,
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = inline ?? !match;
                            if (!isInline && match && match[1] === 'html') {
                              return (
                                <div 
                                  className="my-6 p-1 bg-white text-slate-900 rounded-3xl border border-slate-200/80 shadow-sm max-w-full overflow-x-auto"
                                  dangerouslySetInnerHTML={{ __html: String(children) }} 
                                />
                              );
                            }
                            return isInline 
                              ? <code className="bg-black/5 text-brand-primary px-1 rounded font-mono text-[10px]" {...props}>{children}</code>
                              : <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-x-auto font-mono text-[10px] my-4 leading-relaxed whitespace-pre-wrap"><code className={className} {...props}>{children}</code></pre>;
                          },
                          strong: (props) => <strong className="font-bold text-black" {...props} />,
                          hr: (props) => <hr className="my-6 border-t border-brand-border/40" {...props} />,
                          blockquote: (props) => (
                            <blockquote className="border-l-4 border-brand-primary/40 pl-4 py-1.5 italic my-4 text-black/70 bg-brand-light/10 rounded-r-xl font-serif" {...props} />
                          ),
                          a: (props) => <a className="text-[#5ea5ad] underline font-sans font-medium hover:opacity-80" target="_blank" {...props} />,
                        }}
                      >
                        {markdown}
                      </Markdown>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {docType === 'evaluation' && (
                      <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-2 text-slate-200">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                          <span className="text-xs font-bold font-sans">📅 専門家技術レビュー 監査実施日切り替え:</span>
                        </div>
                        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                          <button
                            onClick={() => setEvaluationDateTab('2026-09-05')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              evaluationDateTab === '2026-09-05'
                                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            <span>🌟 最新版 (2026年9月5日 改定)</span>
                          </button>
                          <button
                            onClick={() => setEvaluationDateTab('2026-08-24')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              evaluationDateTab === '2026-08-24'
                                ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            <span>📜 第2版 (2026年8月24日 改定)</span>
                          </button>
                          <button
                            onClick={() => setEvaluationDateTab('2026-08-15')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              evaluationDateTab === '2026-08-15'
                                ? 'bg-[#3B627F] text-white shadow-sm ring-1 ring-[#3B627F]/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            <span>🏛️ 初版 (2026年8月15日 制定)</span>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none text-black font-serif overflow-x-hidden break-words">
                    <Markdown
                    components={{
                      h1: (props) => <h1 className="text-xl md:text-2xl font-bold font-serif mt-8 mb-5 border-b-2 border-black/10 pb-3 text-black tracking-tight" {...props} />,
                      h2: (props) => <h2 className="text-lg md:text-xl font-bold font-serif mt-6 mb-3 border-b border-black/5 pb-1.5 text-black/95" {...props} />,
                      h3: (props) => <h3 className="text-base md:text-lg font-bold font-serif mt-4 mb-2 text-black/85" {...props} />,
                      p: (props) => <p className="text-xs leading-relaxed mb-4 text-black/85 font-sans" {...props} />,
                      ul: (props) => <ul className="list-disc list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
                      ol: (props) => <ol className="list-decimal list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
                      li: (props) => <li className="mb-0.5 leading-relaxed" {...props} />,
                      table: (props) => (
                        <div className="overflow-x-auto my-4 border border-brand-border/40 rounded-xl shadow-sm">
                          <table className="w-full text-left border-collapse text-[11px] md:text-xs" {...props} />
                        </div>
                      ),
                      thead: (props) => <thead className="bg-[#487799]/5 text-black border-b border-brand-border font-bold font-serif" {...props} />,
                      tbody: (props) => <tbody className="divide-y divide-brand-border/10 font-sans" {...props} />,
                      tr: (props) => <tr className="hover:bg-brand-light/10 transition-colors" {...props} />,
                      th: (props) => <th className="px-3 py-2 font-semibold text-black" {...props} />,
                      td: (props) => <td className="px-3 py-2 text-black/75 whitespace-normal break-words" {...props} />,
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = inline ?? !match;
                        if (!isInline && match && match[1] === 'html') {
                          return (
                            <div 
                              className="my-6 p-1 bg-white text-slate-900 rounded-3xl border border-slate-200/80 shadow-sm max-w-full overflow-x-auto"
                              dangerouslySetInnerHTML={{ __html: String(children) }} 
                            />
                          );
                        }
                        return isInline 
                          ? <code className="bg-black/5 text-brand-primary px-1 rounded font-mono text-[10px]" {...props}>{children}</code>
                          : <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-x-auto font-mono text-[10px] my-4 leading-relaxed whitespace-pre-wrap"><code className={className} {...props}>{children}</code></pre>;
                      },
                      strong: ({ children, ...props }: any) => {
                        const str = String(children);
                        if (str.includes('【NEW】') || str.includes('【8/24 改定】') || str.includes('【8/24 追記】') || str.includes('【改定】') || str.includes('【追記】')) {
                          return (
                            <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-md text-xs font-bold font-sans shadow-2xs mr-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              {children}
                            </span>
                          );
                        }
                        return <strong className="font-bold text-black" {...props}>{children}</strong>;
                      },
                      em: (props) => (
                        <em className="bg-emerald-50/90 text-emerald-900 font-semibold not-italic px-1.5 py-0.5 rounded border border-emerald-200/90 shadow-2xs" {...props} />
                      ),
                      hr: (props) => <hr className="my-6 border-t border-brand-border/40" {...props} />,
                      blockquote: (props) => (
                        <blockquote className="border-l-4 border-brand-primary/40 pl-4 py-1.5 italic my-4 text-black/70 bg-brand-light/10 rounded-r-xl font-serif" {...props} />
                      ),
                      a: (props) => <a className="text-[#5ea5ad] underline font-sans font-medium hover:opacity-80" target="_blank" {...props} />,
                    }}
                  >
                    {markdown}
                  </Markdown>
                </div>
              </div>
              )
            )
          )}
        </div>
      </div>

      {/* 印刷専用スライド一括レイアウト (普段は非表示、印刷時のみ出現して美しく改ページ) */}
      {docType === 'slides' && (
        <div className="hidden print:block space-y-12 w-full font-sans">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id} 
              style={{ pageBreakAfter: 'always' }}
              className={`w-full aspect-[16/9] p-12 flex flex-col justify-between border border-slate-200 rounded-xl my-4 ${
                slide.layout === 'title' ? 'bg-[#1C2B3C] text-[#FAFAF8]' : 'bg-[#FAFAF8] text-[#1A2735]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                  <span>{slide.category}</span>
                  <span>Slide {idx + 1} / {slides.length}</span>
                </div>
                <h3 className={`text-xl font-bold font-serif mt-2 ${slide.layout === 'title' ? 'text-white' : 'text-[#1A2735]'}`}>
                  {slide.title}
                </h3>
                {slide.subtitle && (
                  <p className="text-xs text-slate-400 mt-2 italic whitespace-pre-wrap">{slide.subtitle}</p>
                )}
              </div>

              <div className="flex-grow mt-4">
                {slide.points && slide.points.length > 0 && (
                  <ul className="space-y-2 list-disc list-inside">
                    {slide.points.map((pt: string, pIdx: number) => (
                      <li key={pIdx} className="text-sm font-sans leading-relaxed text-slate-600">{pt}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 font-mono flex justify-between">
                <span>ReMEETs 治安・防衛コンプライアンス管理事務局</span>
                <span>CONFIDENTIAL SECURITY AUDIT</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📋 Interactive Deployment Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn print-hidden overscroll-contain" data-lenis-prevent>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden min-h-0">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <CheckSquare size={22} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold font-serif">
                    {activeChecklistTab === 'operation' 
                      ? "【ReMEETs 本番前動作確認・実稼働テスト 22大チェックリスト】" 
                      : "【ReMEETs 本番デプロイ・運営開始 19大マスターチェックリスト】"}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                    {activeChecklistTab === 'operation'
                      ? "※LINE/Google OAuth連携・クイズ突破・SMS認証・電子的宣誓・Stripe決済・双方向連絡先開示・AIチケット等、全22項目の進行状況はブラウザ（localStorage）に自動保存されます。"
                      : "※SSL/TLS常時暗号化・DB移行・SMS/Gemini/Stripe本番キー・全文書制定日確定・セキュリティレート制限を含む全19ステップ of 進行状況は、ブラウザ（localStorage）に自動保存されます。"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowChecklistModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Switching Menu */}
            <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
              <button
                onClick={() => setActiveChecklistTab('deploy')}
                className={`flex-1 py-3 px-4 text-center font-serif font-bold text-xs transition-all border-b-2 cursor-pointer ${
                  activeChecklistTab === 'deploy'
                    ? 'border-slate-800 text-slate-900 bg-white font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                📋 ① 本番デプロイ準備 19大マスターリスト
              </button>
              <button
                onClick={() => setActiveChecklistTab('operation')}
                className={`flex-1 py-3 px-4 text-center font-serif font-bold text-xs transition-all border-b-2 cursor-pointer ${
                  activeChecklistTab === 'operation'
                    ? 'border-slate-800 text-slate-900 bg-white font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                🔍 ② 本番前動作確認 22大実稼働テストリスト
              </button>
            </div>

            {/* Progress Bar */}
            {(() => {
              const activeChecklistItems = activeChecklistTab === 'operation' ? operationChecklistItems : checklistItems;
              const completedCount = activeChecklistItems.filter(i => i.completed).length;
              const totalCount = activeChecklistItems.length;
              const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
                      <span>全体の進捗状況 ({completedCount} / {totalCount} タスク完了)</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleResetChecklist}
                    className="px-2.5 py-1 text-[10px] text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw size={10} />
                    <span>進捗をクリア</span>
                  </button>
                </div>
              );
            })()}

            {/* Checklist items list */}
            <div className="flex-grow p-5 overflow-y-auto overscroll-contain space-y-6 bg-slate-50/50 min-h-0" data-lenis-prevent>
              {/* Introduction Card */}
              {activeChecklistTab === 'operation' ? (
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-xs text-teal-950 leading-relaxed font-sans shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">📢</span>
                    <strong className="text-slate-900 font-bold text-xs">【ReMEETs 本番前動作確認・実稼働検証 16大チェックリスト】全体概要</strong>
                  </div>
                  <p className="text-[11px] text-teal-900/90 leading-relaxed">
                    本チェックリストは、ReMEETsの本番リリース直前に実施すべき「実稼働・動作テスト」に特化した、<strong>6大検証領域（16項目）</strong>からなる実用的な動作確認リストです。<br />
                    LINE・GoogleなどのOAuth認証ログイン、初回規約同意フロー、不適切投稿のAI検閲、想い出クイズ突破および総当たりアビューズ制限、電子的利用宣誓（法令遵守・ストーカー禁止）の合意保全、Stripeモック決済と審査否認時の自動返金、eKYC公的証明書アップロード審査、および警察公安提出用の監査フォレンジックログCSVエクスポートが本番環境で正常に稼働するか、漏れなく確認・記録することができます。
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-950 leading-relaxed font-sans shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">📢</span>
                    <strong className="text-slate-900 font-bold text-xs">【ReMEETs 本番デプロイ・運営開始 17大マスターチェックリスト】全体概要</strong>
                  </div>
                  <p className="text-[11px] text-indigo-900/90 leading-relaxed">
                    本チェックリストは、情緒豊かな思い出再会プラットフォーム<strong>「ReMEETs」</strong>を安全に本番デプロイ・運営開始するために厳選された、<strong>7大カテゴリー（17項目）</strong>に及ぶ実用的な運営用マスターリストです。<br />
                    一時的な開発環境（モック）から、本番環境（商用稼働）への安全な移行を支援するため、<strong>インフラ・DB基盤（3ステップ）</strong>、<strong>外部API・決済キー設定（3ステップ）</strong>、<strong>本番データ管理（2ステップ）</strong>、<strong>SNSアカウント連携（2ステップ）</strong>、<strong>法務・規約・特商法・文書制定日（4ステップ）</strong>、<strong>運用セキュリティ（2ステップ）</strong>、<strong>最終テスト（1ステップ）</strong>について、各要件の適合・進行状況をブラウザ（localStorage）に自動記録できます。
                  </p>
                </div>
              )}

              {(activeChecklistTab === 'operation' ? [
                {
                  code: "A",
                  title: "【A. 登録・認証・ログイン検証（3項目）】",
                  bg: "bg-gradient-to-r from-blue-50/70 to-cyan-50/30 border-blue-100",
                  text: "text-slate-950",
                  badge: "bg-blue-600 text-white",
                  desc: "メール新規登録バリデーション、LINE / Google OAuthログイン連携、利用規約同意＆セッション維持を検証します。",
                  itemIds: [1, 2, 3]
                },
                {
                  code: "B",
                  title: "【B. 手紙投函・AI検閲テスト（3項目）】",
                  bg: "bg-gradient-to-r from-indigo-50/70 to-purple-50/30 border-indigo-100",
                  text: "text-slate-950",
                  badge: "bg-indigo-600 text-white",
                  desc: "手紙作成・想い出クイズ設定、フルネーム実名辞書ガード、AI自動検閲（誹謗中傷・脅迫・個人情報）をテストします。",
                  itemIds: [4, 5, 6]
                },
                {
                  code: "C",
                  title: "【C. 検索・秘匿性＆クイズ照合テスト（3項目）】",
                  bg: "bg-gradient-to-r from-amber-50/70 to-orange-50/30 border-amber-100",
                  text: "text-slate-950",
                  badge: "bg-amber-600 text-white",
                  desc: "キーワード検索・本文マスキング秘匿性、想い出クイズ完全一致判定（表記ゆれ救済）、不正解時遮断＆総当たり制限をテストします。",
                  itemIds: [7, 8, 9]
                },
                {
                  code: "D",
                  title: "【D. eKYC＆電子的宣誓検証（2項目）】",
                  bg: "bg-gradient-to-r from-emerald-50/70 to-teal-50/30 border-emerald-100",
                  text: "text-slate-950",
                  badge: "bg-emerald-600 text-white",
                  desc: "公的証明書アップロード審査・認証バッジ反映、および電子的利用宣誓（法令遵守・ストーカー禁止）の合意ログ安全保存をテストします。",
                  itemIds: [10, 11]
                },
                {
                  code: "E",
                  title: "【E. 決済・連絡先開示引き渡し検証（3項目）】",
                  bg: "bg-gradient-to-r from-rose-50/70 to-pink-50/30 border-rose-100",
                  text: "text-slate-950",
                  badge: "bg-rose-600 text-white",
                  desc: "Stripe本番決済（600円〜1,200円）、決済後の連絡先安全開示（セキュア・ブリッジ引き渡し）、審査否認時の自動返金をテストします。",
                  itemIds: [12, 13, 14]
                },
                {
                  code: "F",
                  title: "【F. マイページ＆管理者・警察連携（3項目）】",
                  bg: "bg-gradient-to-r from-violet-50/70 to-fuchsia-50/30 border-violet-100",
                  text: "text-slate-950",
                  badge: "bg-violet-600 text-white",
                  desc: "優先開示連絡先変更・ボトル回収削除、管理者KPI・AI通報ログ・ユーザー凍結、警察提出用監査ログCSV出力を検証します。",
                  itemIds: [15, 16, 17]
                },
                {
                  code: "G",
                  title: "【G. レスポンシブ＆セキュリティ異常系（3項目）】",
                  bg: "bg-gradient-to-r from-slate-100/80 to-slate-50/30 border-slate-200",
                  text: "text-slate-950",
                  badge: "bg-slate-700 text-white",
                  desc: "スマホ実機表示（iOS/Android）、未ログイン時認可ガード・他者ボトル操作遮断、回収済みボトルアクセス遮断＆DoS制限をテストします。",
                  itemIds: [18, 19, 20]
                }
              ] : [
                {
                  code: "A",
                  title: "【A. インフラ・DB基盤（4ステップ）】",
                  bg: "bg-gradient-to-r from-blue-50/70 to-cyan-50/30 border-blue-100",
                  text: "text-slate-950",
                  badge: "bg-blue-600 text-white",
                  desc: "本番用マネージドRDBMSプロビジョニング、DATABASE_URL設定、初期スキーママイグレーション、自動デイリーバックアップを整えます。",
                  itemIds: [1, 2, 3, 4]
                },
                {
                  code: "B",
                  title: "【B. 外部API・決済キー設定（3ステップ）】",
                  bg: "bg-gradient-to-r from-indigo-50/70 to-purple-50/30 border-indigo-100",
                  text: "text-slate-950",
                  badge: "bg-indigo-600 text-white",
                  desc: "Gemini APIキー、メール配信API（Resend等）、Stripeの決済本番キーおよびWebhook署名設定を行います。",
                  itemIds: [5, 6, 7]
                },
                {
                  code: "C",
                  title: "【C. 本番データ管理（2ステップ）】",
                  bg: "bg-gradient-to-r from-amber-50/70 to-orange-50/30 border-amber-100",
                  text: "text-slate-950",
                  badge: "bg-amber-600 text-white",
                  desc: "テスト用データのクリアと、サービス初期の閑散とした雰囲気を払拭するための本番用情緒サンプルデータの生成を行います。",
                  itemIds: [8, 9]
                },
                {
                  code: "D",
                  title: "【D. SNSアカウント連携（2ステップ）】",
                  bg: "bg-gradient-to-r from-emerald-50/70 to-teal-50/30 border-emerald-100",
                  text: "text-slate-950",
                  badge: "bg-emerald-600 text-white",
                  desc: "LINE Login、Google OAuthなどの開発者コンソールで本番用クライアント情報およびリダイレクトURLを設定します。",
                  itemIds: [10, 11]
                },
                {
                  code: "E",
                  title: "【E. 法務・規約・特商法・文書制定日（4ステップ）】",
                  bg: "bg-gradient-to-r from-rose-50/70 to-pink-50/30 border-rose-100",
                  text: "text-slate-950",
                  badge: "bg-rose-600 text-white",
                  desc: "利用規約(TOS)の改訂、プライバシーポリシー(PP)の更新、特定商取引法に基づく表記の整備、および全法的文書の【制定日・施行日】の確定を行います。",
                  itemIds: [12, 13, 14, 15]
                },
                {
                  code: "F",
                  title: "【F. 運用セキュリティ（1ステップ）】",
                  bg: "bg-gradient-to-r from-violet-50/70 to-fuchsia-50/30 border-violet-100",
                  text: "text-slate-950",
                  badge: "bg-violet-600 text-white",
                  desc: "DoS攻撃やクイズの総当たり自動回答スパムを防ぐため、秒間API制限しきい値を調整・固定します。",
                  itemIds: [16]
                },
                {
                  code: "G",
                  title: "【G. 最終総合テスト（1ステップ）】",
                  bg: "bg-gradient-to-r from-slate-100/80 to-slate-50/30 border-slate-200",
                  text: "text-slate-950",
                  badge: "bg-slate-700 text-white",
                  desc: "eKYC本人確認、電子的利用宣誓同意、Stripeによる本番同様の仮売上（審査落ち時即自動返金含む）の疎通テストをすべて検証します。",
                  itemIds: [17]
                }
              ]).map((group) => {
                const activeItems = activeChecklistTab === 'operation' ? operationChecklistItems : checklistItems;
                const groupItems = activeItems.filter(item => group.itemIds.includes(item.id));
                const completedCount = groupItems.filter(item => item.completed).length;
                const isGroupCompleted = groupItems.length > 0 && completedCount === groupItems.length;

                return (
                  <div key={group.code} className="space-y-3 pt-2">
                    {/* Section Header Card */}
                    <div className={`p-4 rounded-2xl border ${group.bg} shadow-sm transition-all duration-300`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md font-mono ${group.badge}`}>
                            SECTION {group.code}
                          </span>
                          <h4 className={`text-xs font-bold font-serif ${group.text}`}>
                            {group.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 text-[10px]">
                          <span className={`font-bold px-2 py-0.5 rounded-full ${
                            isGroupCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            進捗: {completedCount} / {groupItems.length} ({groupItems.length > 0 ? Math.round((completedCount / groupItems.length) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed font-sans">
                        {group.desc}
                      </p>
                    </div>

                    {/* Group Items */}
                    <div className="pl-2 md:pl-4 space-y-3 border-l-2 border-slate-200/60 ml-2">
                      {groupItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between ${
                            item.completed 
                              ? 'bg-emerald-50/40 border-emerald-200 shadow-sm' 
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-grow max-w-full xl:max-w-[55%]">
                            <button
                              onClick={() => handleToggleChecklistItem(item.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer mt-0.5 shrink-0 ${
                                item.completed 
                                  ? 'bg-emerald-500 border-emerald-600 text-white' 
                                  : 'bg-white border-slate-300 text-slate-400 hover:border-[#3B627F]'
                              }`}
                            >
                              {item.completed && <Check size={14} className="stroke-[3]" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono font-bold">
                                  {activeChecklistTab === 'operation' ? `TEST-${String(item.id).padStart(2, '0')}` : `STEP ${String(item.id).padStart(2, '0')}`}
                                </span>
                              </div>
                              <h4 className={`text-xs font-bold mt-1 leading-snug ${
                                item.completed ? 'text-slate-500 line-through opacity-70' : 'text-slate-900'
                              }`}>
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Date & Notes Interactive Panel */}
                          <div className="flex flex-col sm:flex-row gap-2.5 items-slate sm:items-center w-full xl:w-auto shrink-0 font-sans">
                            {/* Target / Completion Date */}
                            <div className="flex flex-col gap-0.5 min-w-[130px]">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={10} />
                                <span>完了日 / 目標日</span>
                              </label>
                              <input 
                                type="date" 
                                value={item.date || ""} 
                                onChange={(e) => handleUpdateChecklistDate(item.id, e.target.value)}
                                className="text-[11px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-[#3B627F] outline-none"
                              />
                            </div>

                            {/* Notes / Assignee */}
                            <div className="flex flex-col gap-0.5 min-w-[170px]">
                              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">メモ / 担当</label>
                              <input 
                                type="text" 
                                placeholder="メモ・進捗・担当者を入力..." 
                                value={item.notes || ""} 
                                onChange={(e) => handleUpdateChecklistNotes(item.id, e.target.value)}
                                className="text-[11px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-[#3B627F] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-sans">
                💡 すべての項目にチェックを入れて、安全・適法な本番リリースを完了させましょう！
              </p>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="px-4 py-1.5 bg-[#3B627F] hover:bg-[#1C2B3C] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminDeploymentGuidePage = () => {
  const { user, loading } = useAuth();
  const [docType, setDocType] = React.useState<'deployment' | 'cost_estimate' | 'cost_list_detailed' | 'permit' | 'police' | 'consult' | 'matrix' | 'slides' | 'scenario' | 'requirements' | 'evaluation' | 'pr_plan' | 'legal_guide'>('deployment');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-light/50 backdrop-blur-sm">
        <BottleLoader />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      <div className="mb-4 print-hidden">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 font-serif text-black">
          <ArrowLeft size={16} />
          <span>管理画面へ戻る</span>
        </Link>
      </div>
      <AdminDeploymentGuideBlock docType={docType} setDocType={setDocType} />
    </div>
  );
};



export const ManualContent = () => (
  <div className="space-y-8 text-slate-800 font-sans">
    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">01</span>
        手紙を書く（ボトルメールの投函）
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        トップページの「ボトルメールを流す」ボタンから、探している相手へのメッセージを作成できます。あなたの想いが相手に届くよう、以下の項目を丁寧に入力しましょう。
      </p>
      <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200/80 space-y-2">
        <p className="text-xs font-bold text-slate-900">入力項目の詳細：</p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
          <li><strong>相手の名前：</strong> 姓と名を分けて正確に入力してください。旧姓や、当時呼んでいた名前など、相手が検索しそうな名前を入力するのがコツです。</li>
          <li><strong>出身地・ゆかりの地：</strong> 相手の出身地や、二人が出会った場所などを入力します。公開されるのは「都道府県」までとなりますが、市区町村まで入力することで検索精度が向上します。</li>
          <li><strong>交流のあった年代：</strong> 相手と過ごした時代（例：1990年代）を選択します。</li>
          <li><strong>あなたの表示名：</strong> 当時のあだ名や、二人の間だけで通じる呼び名を使用してください。</li>
          <li><strong>思い出クイズ：</strong> 本人確認のための重要なステップです。<strong>思い出クイズ（2問）</strong>を設定してください。第三者が推測しにくい二人の記憶に基づく具体的なエピソードを質問にすることを強く推奨します。</li>
          <li><strong>開示用連絡先（LINE等）：</strong> クイズに正解し、手続きを行ったお相手だけに安全に公開される連絡先（LINE ID、メールアドレスなど）を設定します。手紙の本文欄には直接書き込まず、こちらの専用欄にご入力ください。</li>
          <li><strong>メッセージ：</strong> 相手が思い出クイズに正解した後に表示される手紙本文です。</li>
          <li><strong>AIによる検閲：</strong> 投稿内容はAIによって自動的に解析され、不適切な表現や個人情報の過度な露出がある場合は投稿が制限されることがあります。</li>
        </ul>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">02</span>
        奇跡を拾う（自分宛ての手紙を探す ＆ 新着入荷通知アラート）
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        「自分宛ての手紙を探す」ページでは、ご自身宛てのメッセージが届いていないかを、自身の名前やゆかりの地のキーワードで簡単に見つけることができます。検索エンジンを頼りにしたエゴサーチ等を通じてこのページに偶然たどり着いた方や、心当たりのある方は、ぜひご自身宛てに流されたボトルメールを探してみてください。
      </p>
      <div className="bg-teal-50/60 p-4 md:p-5 rounded-2xl border border-teal-200/80 space-y-3">
        <div>
          <p className="text-xs font-bold text-teal-900">自分宛ての手紙を見つけるヒント：</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-teal-800 leading-relaxed mt-1">
            <li>ご自身の姓、名、あるいは旧姓などの漢字やひらがなで検索をお試しください。</li>
            <li>お相手と出会った地域や、思い出のゆかりの地などで絞り込むと、届いたボトルが非常に見つかりやすくなります。</li>
            <li>年代や関係性（部活動、同級生、元同僚など）を指定することで、効率よく自分宛ての手紙を絞り込めます。</li>
          </ul>
        </div>

        <div className="border-t border-teal-200/80 pt-3">
          <p className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-teal-600 text-white text-[10px] rounded-md font-bold">便利機能</span>
            🔔 自分宛ての手紙が投稿されたらメールで受け取る（新着入荷通知アラート）
          </p>
          <p className="text-xs text-teal-900/90 leading-relaxed mt-1 font-sans">
            検索画面であなたのお名前やゆかりの地を設定し、「この条件でメール通知を受け取る」を保存しておくと、今後あなたを探しているお相手が新しくボトルメールを投函した際に、システムから自動でメール通知が届きます。<br />
            保存した通知条件は、ログイン後の<strong>「マイページ」→「通知・アラート」タブ</strong>からいつでも確認・削除・管理が可能です。
          </p>
        </div>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">03</span>
        再会への一歩（本人確認と連絡先の受け取り）
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        自分宛てと思われる手紙を見つけたら、詳細を確認します。メッセージ本文と連絡先を開示するには、差出人が設定した「思い出クイズ」に答える必要があります。
      </p>
      <div className="bg-amber-50/60 p-4 md:p-5 rounded-2xl border border-amber-200/80 space-y-2">
        <p className="text-xs font-bold text-amber-900">再会のプロセス：</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-amber-800 leading-relaxed">
          <li><strong>クイズに回答：</strong> 思い出クイズに正解すると、ロックが解除されます。</li>
          <li><strong>手紙の開封と受け取り手続き：</strong> 差出人からの手紙本文を確認し、手続き（600円 / 公的本人確認付き1,200円）を行います。</li>
          <li><strong>連絡先（LINE等）の開示：</strong> 差出人が設定した連絡先（LINE ID、メールアドレス等）が表示されます。</li>
          <li><strong>直接連絡・再会成功：</strong> 開示された連絡先へ直接メッセージをお送りいただくことで再会が果たせます。</li>
        </ol>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">04</span>
        開示情報の確認と管理
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        開示手続きが完了したお手紙やSNS連絡先は、マイアカウントの「開封済みのお手紙」からいつでも再確認できます。
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-2">
        <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-sans shrink-0">05</span>
        相手からの回答・正解通知とメール設定
      </h3>
      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
        あなたが流したボトルがお相手に見つけられ、質問回答やクイズ正解などのアクションが起こると、以下の2つの方法で自分宛てに通知されます。
      </p>
      <div className="p-4 md:p-5 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            ① サイト内通知（画面右上のベルアイコン 🔔）
          </p>
          <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
            サイトにログイン時、画面右上の 🔔（ベルマーク）に赤いバッジが点灯し、回答・正解されたボトルの状況がリアルタイムで届きます。
          </p>
        </div>

        <div className="space-y-2 border-t border-rose-200/60 pt-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            ② 登録メールアドレスへの即時メール通知
          </p>
          <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
            お相手がクイズに答えた時や全問正解して手紙を開封した際、ご登録のメールアドレス宛に自動的にお知らせメールが送信されます。メール内のリンクからすぐに結果画面を確認できます。
          </p>
        </div>

        <div className="space-y-2 border-t border-rose-200/60 pt-2.5">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            ③ メール通知のON/OFF切り替え
          </p>
          <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
            「マイアカウント」→「プロフィール設定」から、メール通知の受信（ON/OFF）をいつでも変更できます。
          </p>
        </div>
      </div>
    </section>

    {/* Dedicated Pricing & Safety Links */}
    <div className="p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 border-2 border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs text-slate-700">
        <strong className="text-amber-950 font-bold block text-sm mb-0.5">💰 ご利用料金の詳細について</strong>
        基本機能は完全無料（0円）。手紙開封・SNS開示のみ600円（買い切り）です。
      </div>
      <Link
        to="/pricing"
        className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-xs"
      >
        利用料金表を見る →
      </Link>
    </div>
  </div>
);

// Compatibility alias for GuidePage
export const LocalInlineGuidePage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    <ManualContent />
  </div>
);

export const ManualPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 text-black font-sans">
    <BackToHomeButton />
    <div className="glass-card p-8 md:p-12 space-y-8 bg-white rounded-3xl border border-brand-border shadow-sm">
      <div className="flex items-center gap-4 mb-8 border-b border-brand-border pb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
          <BookOpen size={26} />
        </div>
        <div>
          <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
            User Guide & Instructions
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
            詳細ご利用マニュアル
          </h1>
          <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-1">
            ReMEETsの基本仕様、手紙（ボトルメール）の投函、手紙の検索、および質問回答・連絡先開示手続きの詳細説明です。
          </p>
        </div>
      </div>
      <ManualContent />
    </div>
  </div>
);

