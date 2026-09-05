import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WaterRippleRainbowText } from './WaterRippleRainbowText';
import heroBottleMail from '../assets/images/hero_small_bottle_mail_1785944479619.jpg';
import stepWriteImg from '../assets/images/step_01_photo_write_1785857630366.jpg';
import stepDriftImg from '../assets/images/step_02_photo_drift_1785857647101.jpg';
import stepReconnectImg from '../assets/images/step_03_photo_read_v2_1785857978640.jpg';
import { ConceptStoryModal } from './ConceptStoryModal';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Key, 
  ArrowRight, 
  X, 
  User,
  Heart,
  BookOpen,
  Compass,
  CheckCircle2,
  PenTool,
  Send,
  Users,
  MessageSquare,
  CreditCard,
  Search,
  Mail,
  MapPin,
  HelpCircle,
  Clock,
  Anchor,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getPostUrl } from '../lib/utils';

interface HomePageTestVariantProps {
  onToggleDesign: () => void;
  recentPosts?: any[];
  onOpenConceptModal?: () => void;
}

// 奇跡の物語（デフォルト・フォールバック）
const DEFAULT_SUCCESS_STORIES = [
  {
    id: 'def-1',
    era: "1990",
    gender: "女性",
    tag: "友人関係",
    title: "30年ぶりに繋がった、幼馴染 of 友情",
    message: "小学校卒業以来、引越しで連絡が途絶えていた親友。「本人のみわかる質問」に、彼が“放課後に毎日通った駄菓子屋の名前”を入力し正解。当時の思い出バナシから、来月ついに再会します。（40代・女性）"
  },
  {
    id: 'def-2',
    era: "2000",
    gender: "男性",
    tag: "部活・恩師",
    title: "定年退職された、陸上部顧問への感謝",
    message: "連絡先もわからないお世話になった先生へ、ボトルメールを起稿。先生の息子さんがお名前の検索から見つけてくださり、先生ご本人に伝えてくれました。もう一度「ありがとう」が届く奇跡に感謝です。（30代・男性）"
  },
  {
    id: 'def-3',
    era: "2010",
    gender: "男性",
    tag: "旅先の一期一会",
    title: "10年前の旅の相棒、カレー屋での記憶",
    message: "バックパッカー時代に旅先で出会った親友。SNS等も相互でなく音信不通でしたが、彼が『インドでの駅前のカレー屋の名前』という質問で見事に正解して部屋が開設。10年の空白が埋まり、友情が再開しました。（30代・男性）"
  }
];

// サンプル想いボトル（共感ギャラリー用）
const GALLERY_BOTTLES = [
  {
    id: 'sample-1',
    targetName: '世田谷区 〇〇中学 サッカー部 Aくんへ',
    era: '1990年代',
    location: '東京都世田谷区',
    relationship: '中学の部活仲間',
    excerpt: 'あの夏の最後の大会、僕のパスからゴールを決めてくれたこと今でも鮮明に覚えています。みんな元気にしていますか？',
    secretQuestion: '大会の帰りにみんなで食べたアイスの種類は？',
    createdTime: '漂流 3日前',
    tagBg: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'sample-2',
    targetName: '2005年 横浜 / 保健室のH先生へ',
    era: '2000年代',
    location: '神奈川県横浜市',
    relationship: '恩師・先生',
    excerpt: '学校に行けなかった時期、否定せずに話を聞いてくれた先生の優しさに救われました。私も今では小学校の教員になりました。',
    secretQuestion: '先生の保健室のデスクに置いてあった小さな観葉植物の名前は？',
    createdTime: '漂流 昨日',
    tagBg: 'bg-sky-100 text-sky-800 border-sky-200'
  },
  {
    id: 'sample-3',
    targetName: '京都 軽音サークル 初恋のM先輩へ',
    era: '2010年代',
    location: '京都府京都市',
    relationship: '初恋・サークルの先輩',
    excerpt: '卒業ライブの日に渡せなかった手紙がずっと部屋にありました。またあのギターの音色が聴きたいです。',
    secretQuestion: '学園祭で最後に演奏した曲のバンド名は？',
    createdTime: '漂流 本日',
    tagBg: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'sample-4',
    targetName: '旅先の福岡で財布を落とした私を助けてくれた親切な方へ',
    era: '2010年代',
    location: '福岡県博多区',
    relationship: '旅先での恩人',
    excerpt: '一銭もなく途方に暮れていた高校生の私に電車代を貸して下さり本当にありがとうございました。ずっとお礼が言いたかったです。',
    secretQuestion: '駅前の喫茶店でご馳走していただいたあたたかい飲み物は？',
    createdTime: '漂流 5日前',
    tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'sample-5',
    targetName: '1980年代 札幌 バンドを結成していたKさんへ',
    era: '1980年代',
    location: '北海道札幌市',
    relationship: '昔のバンド仲間',
    excerpt: '上京するときに交わした約束を果たせぬまま年月が経ってしまいました。もう一度アコースティックギターを合わせませんか。',
    secretQuestion: '初めてスタジオで作ったオリジナル曲のタイトルは？',
    createdTime: '漂流 1週間前',
    tagBg: 'bg-amber-100 text-amber-800 border-amber-200'
  }
];

export const HomePageTestVariant: React.FC<HomePageTestVariantProps> = ({ onToggleDesign, recentPosts = [], onOpenConceptModal }) => {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBottle, setSelectedBottle] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLocalConceptModalOpen, setIsLocalConceptModalOpen] = useState(false);

  const handleOpenConcept = () => {
    if (onOpenConceptModal) {
      onOpenConceptModal();
    } else {
      setIsLocalConceptModalOpen(true);
    }
  };

  // 1ページあたり4件表示 (標準版と同等)
  const PAGE_SIZE = 4;
  const displayList = recentPosts && recentPosts.length > 0 ? recentPosts : GALLERY_BOTTLES;
  const totalPages = Math.max(1, Math.ceil(displayList.length / PAGE_SIZE));
  const paginatedList = displayList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 公開統計情報（管理画面でON/OFF制御可能）
  const [publicStats, setPublicStats] = useState<{
    totalBottles: number;
    totalReunions: number;
    todayPosts: number;
    showHomeStats: boolean;
  }>({
    totalBottles: 0,
    totalReunions: 0,
    todayPosts: 0,
    showHomeStats: true
  });

  // 奇跡の物語データ
  const [successStories, setSuccessStories] = useState<any[]>(DEFAULT_SUCCESS_STORIES);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await fetch('/api/public-stats');
        if (res.ok) {
          const data = await res.json();
          setPublicStats({
            totalBottles: data.totalBottles || data.totalUsers || 0,
            totalReunions: data.totalReunions || 0,
            todayPosts: data.todayPosts || 0,
            showHomeStats: data.showHomeStats !== false
          });
        }
      } catch (err) {
        console.error('Failed to fetch public stats in HomePageTestVariant', err);
      }
    };

    const fetchSuccessStories = async () => {
      try {
        const res = await fetch('/api/success-stories/public?type=featured');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSuccessStories(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch success stories', err);
      }
    };

    fetchPublicStats();
    fetchSuccessStories();
  }, []);

  // カテゴリ選択肢（通常版 App.tsx と完全一致）
  const TRIGGER_CATEGORIES = [
    { label: '学校（同級生・先生）', category: 'school', icon: '🎓' },
    { label: '職場（同僚・上司）', category: 'work', icon: '💼' },
    { label: '近所・幼馴染', category: 'neighborhood', icon: '🏡' },
    { label: '趣味・サークル', category: 'hobby', icon: '🎨' },
    { label: '初恋・大切な人', category: 'love', icon: '💕' },
    { label: 'その他', category: 'other', icon: '🤝' },
  ];

  // 統合されたフルネーム（表示・引継ぎ用）
  const fullTargetName = (lastName || firstName) 
    ? `${lastName} ${firstName}`.trim()
    : '';

  const handleStartWriting = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    navigate('/create', { 
      state: { 
        initialTargetName: fullTargetName,
        initialTargetLastName: lastName.trim(),
        initialTargetFirstName: firstName.trim(),
        initialCategory: selectedCategory || ''
      } 
    });
  };

  const getCategoryLabel = (catKey: string | null) => {
    const item = TRIGGER_CATEGORIES.find(c => c.category === catKey);
    return item ? item.label : '';
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* ==========================================
          1. HERO SECTION: ファーストビュー
      ========================================== */}
      <section className="relative pt-6 pb-8 md:pt-10 md:pb-12 bg-gradient-to-b from-sky-50/40 via-white/40 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* STEP 1-3のカード幅(max-w-4xl)に合わせた、クラシックでエレガントなボタニカル調の飾り枠で包まれたヒーローカード */}
          <div className="relative rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-white via-slate-50/60 to-sky-50/30 p-6 sm:p-10 md:p-12 shadow-sm border border-sky-900/20 overflow-hidden text-center">
            
            {/* 内側の極細二重フレームライン */}
            <div className="absolute inset-2 sm:inset-3.5 rounded-[22px] sm:rounded-[28px] border border-zinc-800/80 pointer-events-none z-10" />
            <div className="absolute inset-3 sm:inset-5 rounded-[18px] sm:rounded-[24px] border border-dashed border-zinc-800/50 pointer-events-none z-10" />

            {/* 四隅のエレガントなボタニカル（唐草・葉・花の芽）SVGオーナメント */}
            <svg className="absolute top-2 left-2 w-10 h-10 text-sky-900/25 pointer-events-none z-20" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
              <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
              {/* クラシック葉っぱモチーフ */}
              <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
              <circle cx="28" cy="28" r="2" fill="currentColor" />
            </svg>

            <svg className="absolute top-2 right-2 w-10 h-10 text-sky-900/25 pointer-events-none z-20 scale-x-[-1]" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
              <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
              <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
              <circle cx="28" cy="28" r="2" fill="currentColor" />
            </svg>

            <svg className="absolute bottom-2 left-2 w-10 h-10 text-sky-900/25 pointer-events-none z-20 scale-y-[-1]" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
              <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
              <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
              <circle cx="28" cy="28" r="2" fill="currentColor" />
            </svg>

            <svg className="absolute bottom-2 right-2 w-10 h-10 text-sky-900/25 pointer-events-none z-20 scale-[-1]" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
              <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
              <path d="M10,34 Q18,28 24,35 Q16,40 10,34 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M34,10 Q28,18 35,24 Q40,16 34,10 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M14,20 C18,14 24,14 28,18 C24,22 18,22 14,20 Z" fill="currentColor" fillOpacity="0.2" />
              <circle cx="28" cy="28" r="2" fill="currentColor" />
            </svg>

            {/* 背景の光彩演出 & 通常版ボトルメールイラスト */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="relative w-full max-w-3xl sm:max-w-4xl h-full flex items-center justify-center transition-all duration-300 scale-110 sm:scale-105" style={{ opacity: 0.82 }}>
                  <img 
                    src={heroBottleMail} 
                    alt="広い海にぽつんと漂うボトルメール" 
                    className="w-full h-full max-h-full object-contain sm:object-cover object-center transition-all duration-300 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_82%)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-70" />
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-6 md:space-y-8">
              {/* メインコピー & サブコピー */}
              <div className="space-y-6 md:space-y-7 max-w-2xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2 sm:space-y-3"
                >
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3B627F] tracking-wider block leading-none select-none drop-shadow-sm mb-2 sm:mb-3">
                    ReMEETs
                  </span>
                  
                  {/* 水面のように滲んで揺れる WebGL/Canvas インタラクティブ虹色コピー */}
                  <WaterRippleRainbowText className="my-1" />
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs sm:text-sm md:text-base text-slate-800 font-serif leading-relaxed sm:leading-relaxed tracking-wide max-w-2xl mx-auto font-medium"
                >
                  同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
                </motion.p>

                {/* サブデザインと同等の「ボトルメールが届ける再会の奇跡」コンセプトモーダル起動ボタン */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex justify-center pt-2 px-2 md:px-0 w-full max-w-xl mx-auto"
                >
                  <button 
                    type="button"
                    onClick={handleOpenConcept}
                    className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white/90 backdrop-blur-xs text-brand-dark border border-zinc-300/80 rounded-full transition-all text-xs md:text-sm font-serif tracking-[0.1em] shadow-2xs hover:shadow-[0_6px_22px_rgba(161,196,253,0.3)] hover:-translate-y-0.5 cursor-pointer duration-300 btn-hover-rainbow"
                  >
                    <Sparkles size={14} className="text-amber-500 shrink-0 group-hover:rotate-12 transition-transform" />
                    <span className="font-semibold text-brand-dark transition-colors duration-300 relative z-10">
                      ボトルメールが届ける再会の奇跡
                    </span>
                  </button>
                </motion.div>
              </div>

              {/* ヒーローアクション: 「ボトルメールを流す」「自分宛ての手紙を探す」同サイズ2大ブルーボタン */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 font-sans"
              >
                <button
                  onClick={() => {
                    const el = document.getElementById('create-bottle-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/create');
                    }
                  }}
                  className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 sm:py-4 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 hover:from-sky-700 hover:to-indigo-900 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 group border border-sky-400/30 whitespace-nowrap"
                >
                  <PenTool size={17} className="text-sky-200 group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="font-bold tracking-wide">ボトルメールを流す</span>
                  <ArrowRight size={16} className="shrink-0 text-sky-200" />
                </button>

                <Link
                  to="/search"
                  className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 sm:py-4 bg-white hover:bg-sky-50/50 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm transition-all border-2 border-sky-200 hover:border-sky-500 shadow-2xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 group whitespace-nowrap"
                >
                  <Search size={17} className="text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-800 tracking-wide">自分宛ての手紙を探す</span>
                </Link>
              </motion.div>

              {/* 🛡️ 【安心の0円保証】探す・投函は完全無料の直感的可視化バッジ */}
              <div className="w-full max-w-xl mx-auto pt-1">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/90 p-3 sm:p-4 shadow-sm text-left font-sans transition-all hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-900">
                      <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                      <span>ReMEETsの安心料金ポリシー</span>
                    </div>
                    <Link 
                      to="/pricing" 
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/90 border border-emerald-300/80 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 group cursor-pointer"
                    >
                      <span>料金表・詳細を見る</span>
                      <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Link 
                      to="/pricing"
                      className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60 hover:border-emerald-400/80 rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-xs group cursor-pointer"
                    >
                      <span className="text-[10px] text-emerald-800 font-bold group-hover:text-emerald-900">手紙を書く・投函</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-600 font-serif">完全0円</span>
                    </Link>
                    <Link 
                      to="/pricing"
                      className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60 hover:border-emerald-400/80 rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-xs group cursor-pointer"
                    >
                      <span className="text-[10px] text-emerald-800 font-bold group-hover:text-emerald-900">手紙を探す・閲覧</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-600 font-serif">完全0円</span>
                    </Link>
                    <Link 
                      to="/pricing"
                      className="bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200/60 hover:border-sky-400/80 rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.02] hover:shadow-xs group cursor-pointer"
                    >
                      <span className="text-[10px] text-sky-900 font-bold group-hover:text-sky-950">想い出照合・再会時</span>
                      <span className="text-xs sm:text-sm font-black text-sky-700 font-serif">開通時のみ</span>
                    </Link>
                  </div>

                  <div className="pt-2 text-center">
                    <Link 
                      to="/pricing"
                      className="text-[10px] text-slate-500 hover:text-emerald-700 transition-colors inline-flex items-center justify-center gap-1 leading-tight"
                    >
                      <span>※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. 「なぜ届くのか？」の仕組みと安心感のビジュアル解説
      ========================================== */}
      <section className="py-6 md:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2 overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50/90 border border-teal-200/80 text-teal-800 text-[11px] font-sans font-bold uppercase tracking-widest shadow-2xs">
              <Sparkles size={12} className="text-teal-600 shrink-0" />
              <span>HOW IT WORKS</span>
              <Sparkles size={12} className="text-teal-600 shrink-0" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-teal-400/60 hidden sm:block" />
              <h2 className="text-base sm:text-xl md:text-2xl font-serif font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                ボトルメールで「あの人」と再会する3つのステップ
              </h2>
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-teal-400/60 hidden sm:block" />
            </div>
          </div>

          {/* 「奇跡が起きる3ステップ」枠線＆フォント色をブルー・グリーン系に統一したベタ塗りなしカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            {/* Step 1: 綴る (エメラルドグリーン) */}
            <div className="group relative bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-emerald-500/80 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 p-4 sm:p-5 space-y-3">
              {/* カード上部：ベタ塗りなし、枠線色と連動した洗練されたSTEPテキスト＆タグ */}
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.22em] text-emerald-700/80 uppercase">STEP</span>
                  <span className="text-2xl sm:text-3xl font-serif font-extrabold tracking-wider text-emerald-600">01</span>
                </div>
                <span className="text-xs font-serif font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  【綴る】
                </span>
              </div>

              {/* ボトルメールのイラスト写真画像 */}
              <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-emerald-200 p-1 shadow-inner group-hover:border-emerald-400 transition-colors duration-300">
                <img 
                  src={stepWriteImg} 
                  alt="ボトルに思い出を託す" 
                  className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>

              {/* カード本文 */}
              <div className="space-y-3 flex-1 flex flex-col justify-between pt-1">
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-serif font-extrabold text-slate-900 leading-snug whitespace-nowrap tracking-tight">
                    ボトルに思い出を託す
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    お相手の名前や当時の思い出、二人しか知らない『秘密の質問』を添えて、匿名でメッセージを静かに投稿します。
                  </p>
                </div>

                <div className="pt-2.5 border-t border-emerald-100 flex items-center text-[11px] sm:text-xs text-emerald-700 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    匿名で流せる安全設計
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: 漂う (オーシャンブルー) */}
            <div className="group relative bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-sky-500/80 hover:border-sky-600 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 p-4 sm:p-5 space-y-3">
              {/* カード上部：ベタ塗りなし、枠線色と連動した洗練されたSTEPテキスト＆タグ */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.22em] text-sky-700/80 uppercase">STEP</span>
                  <span className="text-2xl sm:text-3xl font-serif font-extrabold tracking-wider text-sky-600">02</span>
                </div>
                <span className="text-xs font-serif font-bold bg-sky-50 text-sky-700 px-3 py-1 rounded-full border border-sky-200">
                  【漂う】
                </span>
              </div>

              {/* ボトルメールのイラスト写真画像 */}
              <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-sky-200 p-1 shadow-inner group-hover:border-sky-400 transition-colors duration-300">
                <img 
                  src={stepDriftImg} 
                  alt="ネットの海をめぐる" 
                  className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>

              {/* カード本文 */}
              <div className="space-y-3 flex-1 flex flex-col justify-between pt-1">
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-serif font-extrabold text-slate-900 leading-snug whitespace-nowrap tracking-tight">
                    ネットの海をめぐる
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    手紙は検索エンジンを通じてWebの海へ芽吹き、記憶をたどる「あの人」の検索窓で見つけられる日を静かに待ち続けます。
                  </p>
                </div>

                <div className="pt-2.5 border-t border-sky-100 flex items-center text-[11px] sm:text-xs text-sky-700 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    検索に届くWeb最適化
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: 届く (ディープティール) */}
            <div className="group relative bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-teal-500/80 hover:border-teal-600 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 p-4 sm:p-5 space-y-3">
              {/* カード上部：ベタ塗りなし、枠線色と連動した洗練されたSTEPテキスト＆タグ */}
              <div className="flex items-center justify-between border-b border-teal-100 pb-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm font-sans font-bold tracking-[0.22em] text-teal-700/80 uppercase">STEP</span>
                  <span className="text-2xl sm:text-3xl font-serif font-extrabold tracking-wider text-teal-600">03</span>
                </div>
                <span className="text-xs font-serif font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200">
                  【届く】
                </span>
              </div>

              {/* ボトルメールのイラスト写真画像 */}
              <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-teal-200 p-1 shadow-inner group-hover:border-teal-400 transition-colors duration-300">
                <img 
                  src={stepReconnectImg} 
                  alt="クイズで連絡先が開示" 
                  className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>

              {/* カード本文 */}
              <div className="space-y-3 flex-1 flex flex-col justify-between pt-1">
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-serif font-extrabold text-slate-900 leading-snug whitespace-nowrap tracking-tight">
                    秘密の質問で再会・SNS開示
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
                    ふと検索したお相手が手紙を発見。『秘密の質問』に正解すると手紙が開封され、設定したLINEやSNS連絡先が開示されて直接つながれます。
                  </p>
                </div>

                <div className="pt-2.5 border-t border-teal-100 flex items-center text-[11px] sm:text-xs text-teal-700 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    正解者のみに届く安全開示
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ご利用ガイドへのリンクボタン */}
          <div className="pt-1 pb-1 text-center">
            <Link
              to="/guide"
              id="btn-link-guide"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 hover:border-teal-400 shadow-2xs hover:shadow-xs text-xs sm:text-sm font-bold font-sans transition-all group cursor-pointer"
            >
              <BookOpen size={16} className="text-teal-600 group-hover:scale-110 transition-transform" />
              <span>ご利用ガイドを見る</span>
              <ArrowRight size={14} className="text-teal-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 安心・安全のバッジ */}
          <div className="bg-gradient-to-r from-teal-50/60 to-indigo-50/60 p-4 rounded-2xl border border-teal-200/80 space-y-3">
            <div className="flex items-center gap-2 text-teal-900 text-xs font-bold font-serif">
              <ShieldCheck size={16} className="text-teal-700" />
              <span>プライバシーと安全を守る 3つの堅牢な仕組み</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <Lock size={16} className="text-teal-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">本名や詳細メッセージは非公開</h4>
                  <p className="text-[10.5px] text-slate-600 leading-normal">検索一覧には公的な手がかり情報のみ表示され、あなたの連絡先や秘密本文は守られます。</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <Key size={16} className="text-sky-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">「秘密の質問」正解者のみ開示</h4>
                  <p className="text-[10.5px] text-slate-600 leading-normal">二人しか知らない思い出の回答を入力できた「本当の本人」だけがメッセージを開封できます。</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <ShieldCheck size={16} className="text-indigo-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">悪用・ストーカー完全防衛対策</h4>
                  <p className="text-[10.5px] text-slate-600 leading-normal">AI自動検閲フィルター・eKYC本人確認・24時間不適切通報制度により安全な環境を維持します。</p>
                </div>
              </div>
            </div>

            {/* 安全への取り組みページへのリンクボタン */}
            <div className="pt-2 text-center">
              <Link
                to="/safety"
                id="btn-link-safety"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-900 hover:text-indigo-950 border border-indigo-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs text-xs font-bold font-sans transition-all group cursor-pointer"
              >
                <ShieldCheck size={15} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                <span>安心・安全への取り組みについて詳しく見る</span>
                <ArrowRight size={13} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 洗練されたボトル作成ダイレクトフォームセクション */}
      <section className="py-6 bg-gradient-to-b from-sky-50/20 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div id="create-bottle-section" className="scroll-mt-20 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 border-2 border-teal-300/80 shadow-md relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-xl mx-auto space-y-4 relative z-10">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200">
                  <PenTool size={13} className="text-teal-600" />
                  <span>ボトルメール作成</span>
                </span>
                <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 tracking-wide leading-snug">
                  <span>連絡先がわからなくなってしまった、あの人へ。</span>
                  <br />
                  <span>ボトルメールを流してみませんか？</span>
                </h3>
              </div>

              <form onSubmit={handleStartWriting} className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="section-last-name" className="text-xs font-bold text-slate-700 font-sans flex items-center justify-between">
                      <span>姓</span>
                    </label>
                    <input
                      id="section-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="例：佐藤"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm placeholder:text-slate-400 font-sans transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="section-first-name" className="text-xs font-bold text-slate-700 font-sans flex items-center justify-between">
                      <span>名</span>
                    </label>
                    <input
                      id="section-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="例：花子"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm placeholder:text-slate-400 font-sans transition-all"
                    />
                  </div>
                </div>

                {/* お相手との関係性（カテゴリー）プルダウン選択 */}
                <div className="space-y-1">
                  <label htmlFor="section-category" className="text-xs font-bold text-slate-700 font-sans flex items-center justify-between">
                    <span>お相手との関係性（カテゴリー）</span>
                    <span className="text-slate-400 text-[10px]">※任意選択</span>
                  </label>
                  <select
                    id="section-category"
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm font-sans transition-all cursor-pointer"
                  >
                    <option value="">選択してください</option>
                    {TRIGGER_CATEGORIES.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 hover:from-sky-700 hover:to-indigo-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.005] active:scale-95 font-sans border border-sky-400/30"
                >
                  <span>
                    {fullTargetName 
                      ? `🍾 『${fullTargetName}』様へのボトルメールを書き始める`
                      : '🍾 このお名前でボトルメールを書き始める'}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* 自分宛ての手紙を探す（エゴサーチ）への親切な誘導バナー */}
              <div className="pt-2 border-t border-teal-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
                <div className="flex items-center gap-2 text-slate-600">
                  <Search size={15} className="text-teal-600 shrink-0" />
                  <span>あなた宛ての手紙が届いているかも？</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (fullTargetName) {
                      navigate(`/search?q=${encodeURIComponent(fullTargetName)}`);
                    } else {
                      navigate('/search');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 rounded-xl font-bold transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Search size={13} className="text-teal-600" />
                  <span>
                    {fullTargetName 
                      ? `『${fullTargetName}』で自分宛ての手紙を検索` 
                      : '自分宛ての手紙を探す（エゴサーチ）'}
                  </span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Nav Guidance Bar (ご利用マニュアル / 安心・安全の取り組み / 利用料金表) */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white to-sky-50/40 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            <Link 
              to="/guide" 
              className="p-3.5 bg-white/95 rounded-2xl border border-slate-200/90 hover:border-teal-400 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block group-hover:text-teal-700 transition-colors">ご利用マニュアル</span>
                <span className="text-[10px] text-slate-500 block">検索〜開通までの流れ</span>
              </div>
            </Link>

            <Link 
              to="/safety" 
              className="p-3.5 bg-white/95 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-700 transition-colors">安心・安全の取り組み</span>
                <span className="text-[10px] text-slate-500 block">AI監視・eKYC本人確認</span>
              </div>
            </Link>

            <Link 
              to="/pricing" 
              className="p-3.5 bg-white/95 rounded-2xl border border-slate-200/90 hover:border-sky-400 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CreditCard size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block group-hover:text-sky-700 transition-colors">利用料金表（0円〜）</span>
                <span className="text-[10px] text-slate-500 block">月額費用なし・明確料金</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          2.5. 「ReMEETsがつないだ奇跡の物語」
      ========================================== */}
      <section className="py-6 md:py-10 bg-gradient-to-b from-amber-50/40 via-white to-sky-50/30 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-brand-border/80 pb-3">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.3em] font-sans block">
                Success Stories
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-dark tracking-wider">
                ReMEETs がつないだ奇跡の物語
              </h2>
              <p className="text-xs md:text-sm text-brand-dark/60 font-serif">
                ボトルメールが届き、この海で再び巡り合えた方々からの声。
              </p>
            </div>
            <Link to="/success-stories" className="text-xs text-brand-primary uppercase tracking-[0.2em] font-sans font-bold flex items-center gap-2 hover:underline shrink-0 self-start sm:self-auto">
              <span>すべて見る</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(() => {
              const safeStories = Array.isArray(successStories) ? successStories : [];
              const leftStory = safeStories.find(s => s && s.display_position === 'left') || DEFAULT_SUCCESS_STORIES[0];
              const centerStory = safeStories.find(s => s && s.display_position === 'center') || DEFAULT_SUCCESS_STORIES[1];
              const rightStory = safeStories.find(s => s && s.display_position === 'right') || DEFAULT_SUCCESS_STORIES[2];

              return [leftStory, centerStory, rightStory].map((story, idx) => {
                if (!story) return null;
                const displayTag = story.tag || `${story.era ? story.era + '年代の' : ''}${story.gender ? '再会者（' + (story.gender === 'male' || story.gender === '男性' ? '男性' : story.gender === 'female' || story.gender === '女性' ? '女性' : 'その他') + '）' : '再会のご報告'}`;
                const storyId = story.id ? (String(story.id).startsWith('db-') || String(story.id).startsWith('def-') ? story.id : `db-${story.id}`) : `def-${idx + 1}`;
                return (
                  <Link
                    key={story.id || idx}
                    to={`/success-stories?id=${storyId}`}
                    className="bg-white border border-brand-border/60 p-6 rounded-[28px] space-y-4 hover:shadow-lg hover:border-brand-primary/30 transition-all hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer text-left block group"
                  >
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-widest uppercase block border-b border-brand-border pb-2 group-hover:text-brand-primary/80 transition-colors">
                        STORY #{String(idx + 1).padStart(2, '0')} / {displayTag}
                      </span>
                      <div className="space-y-2">
                        <h4 className="text-base font-serif font-bold text-brand-dark group-hover:text-brand-primary transition-colors">「{story.title || '思い出クイズがつないだ奇跡の再会'}」</h4>
                        <p className="text-xs text-zinc-600 leading-relaxed font-sans line-clamp-6">
                          {story.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <span className="text-[10px] font-sans font-bold text-brand-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        エピソードを読む <ArrowRight size={10} />
                      </span>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* ==========================================
          3. 「みんなの想い（漂うボトルメール）」の共感ギャラリー
      ========================================== */}
      <section className="py-6 md:py-10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          {/* 管理画面でON/OFF可能なホームページ実績統計表示（高さを低く抑えたコンパクトカード） */}
          <AnimatePresence>
            {publicStats?.showHomeStats && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto"
              >
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-2 rounded-2xl bg-white/95 border border-teal-200/80 shadow-xs backdrop-blur-md">
                  {/* 流されたボトルメール数 */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-1 rounded-xl bg-gradient-to-br from-teal-50/90 to-sky-50/50 border border-teal-200/60 text-center sm:text-left">
                    <span className="text-[10px] sm:text-xs font-bold text-teal-850 font-sans flex items-center justify-center shrink-0">
                      <span className="truncate">流されたボトル</span>
                    </span>
                    <span className="text-sm sm:text-base md:text-lg font-serif font-black text-teal-950 tracking-tight leading-none">
                      {(publicStats?.totalBottles ?? 0).toLocaleString()}
                      <span className="text-[9px] sm:text-xs font-sans font-normal text-teal-800 ml-0.5">件</span>
                    </span>
                  </div>

                  {/* 再会成功数 */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-1 rounded-xl bg-gradient-to-br from-rose-50/90 to-amber-50/50 border border-rose-200/60 text-center sm:text-left">
                    <span className="text-[10px] sm:text-xs font-bold text-rose-850 font-sans flex items-center justify-center shrink-0">
                      <span className="truncate">再会成功数</span>
                    </span>
                    <span className="text-sm sm:text-base md:text-lg font-serif font-black text-rose-950 tracking-tight leading-none">
                      {(publicStats?.totalReunions ?? 0).toLocaleString()}
                      <span className="text-[9px] sm:text-xs font-sans font-normal text-rose-800 ml-0.5">組</span>
                    </span>
                  </div>

                  {/* 本日の投函数 */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-1 rounded-xl bg-gradient-to-br from-sky-50/90 to-indigo-50/50 border border-sky-200/60 text-center sm:text-left">
                    <span className="text-[10px] sm:text-xs font-bold text-sky-850 font-sans flex items-center justify-center shrink-0">
                      <span className="truncate">本日の投函</span>
                    </span>
                    <span className="text-sm sm:text-base md:text-lg font-serif font-black text-sky-950 tracking-tight leading-none">
                      {(publicStats?.todayPosts ?? 0).toLocaleString()}
                      <span className="text-[9px] sm:text-xs font-sans font-normal text-sky-800 ml-0.5">通</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-teal-200/80 pb-3">
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest font-sans">Bottle Mail Gallery</span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 tracking-wider">
                ネットの海に漂うみんなの想い
              </h2>
              <p className="text-xs text-slate-600 max-w-lg font-sans leading-relaxed">
                タップしてボトルを開けてみてください。自分と同じように、大切な人を探している一通が見つかります。
              </p>
            </div>
            <Link to="/search" className="text-xs text-teal-800 hover:text-teal-950 font-sans font-bold flex items-center gap-1 hover:underline shrink-0 self-start sm:self-auto">
              <span>すべてを見る</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 波間にゆらゆら揺れるボトルグリッド (通常版と全く同じカードデザイン・内容で表示) */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPosts && recentPosts.length > 0 ? (
                (paginatedList as any[]).map((post: any) => {
                  const postUrl = post.id ? getPostUrl(post) : `/search?query=${encodeURIComponent(post.target_name || '')}`;
                  const eraStr = post.era ? (post.era.toString().startsWith('19') ? post.era : `19${post.era}`) : '1980';
                  const catStr = post.category === 'friend' ? '友人' : post.category === 'love' ? '初恋・恋人' : post.category === 'work' ? '仕事' : 'その他';
                  const hometownStr = post.target_hometown ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown) : '未設定';
                  const schoolStr = post.target_school ? (post.category === 'work' ? '関連職場（正解後に開示）' : '関連学校（正解後に開示）') : '未設定';

                  return (
                    <Link 
                      key={post.id}
                      to={postUrl}
                      className="p-6 block hover:-translate-y-1 hover:shadow-xl transition-all border-2 border-slate-300 hover:border-teal-600 duration-300 rounded-3xl space-y-4 bg-white group text-left shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-[700] text-teal-800 uppercase tracking-widest block bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full w-fit font-sans">
                            {eraStr}年代 / {catStr}
                          </span>
                          <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {post.target_name} 様
                          </h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '流漂中'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-2">
                        差し出し人: {post.searcher_name || '非公開'} <br/>
                        出会った場所: {hometownStr} (市区町村以下は非公開) / 学校名：{schoolStr}<br/>
                        「{post.searcher_profile || post.content || 'お相手への簡単なメッセージ。当時の出来事など...'}」
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-[10px] text-teal-700 font-bold uppercase tracking-widest font-sans">
                        <span>手紙を引出す</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                (paginatedList as any[]).map((b: any, i: number) => {
                  const cleanTargetName = b.targetName ? b.targetName.replace(/\s*様へ$/, '').replace(/\s*様$/, '') : 'お相手';
                  const searchUrl = `/search?query=${encodeURIComponent(cleanTargetName)}`;

                  return (
                    <Link 
                      key={b.id || i}
                      to={searchUrl}
                      className="p-6 block hover:-translate-y-1 hover:shadow-xl transition-all border-2 border-slate-300 hover:border-teal-600 duration-300 rounded-3xl space-y-4 bg-white group text-left shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-[700] text-teal-800 uppercase tracking-widest block bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full w-fit font-sans">
                            {b.era || '1980年代'} / {b.category || '友人'}
                          </span>
                          <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {cleanTargetName} 様
                          </h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {b.createdTime || '最近'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-2">
                        差し出し人: {b.searcherName || '非公開'} <br/>
                        出会った場所: {b.location || '未設定'} (市区町村以下は非公開) / 学校名：{b.school || '関連学校（正解後に開示）'}<br/>
                        「{b.excerpt || 'お相手への簡単なメッセージ。当時の出来事など...'}」
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-[10px] text-teal-700 font-bold uppercase tracking-widest font-sans">
                        <span>手紙を引出す</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Pagination Controls (標準版と同等のUI) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-2 font-sans">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={14} />
                  <span>前ページ</span>
                </button>
                <span className="text-xs text-slate-600 font-semibold font-sans">
                  {currentPage} / {totalPages} ページ
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>次ページ</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* モーダル: 漂うボトルメール詳細表示 */}
      <AnimatePresence>
        {selectedBottle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 relative shadow-2xl text-left"
            >
              <button
                onClick={() => setSelectedBottle(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                  <span>🍾 漂うボトルメールサンプル</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  {selectedBottle.targetName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
                  <span>年代: {selectedBottle.era}</span>
                  <span>•</span>
                  <span>地域: {selectedBottle.location}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 font-sans">【メッセージ（手がかり一部）】</span>
                <p className="text-xs sm:text-sm font-serif text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed italic">
                  “{selectedBottle.excerpt}”
                </p>
              </div>

              <div className="space-y-1.5 bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80">
                <span className="text-xs font-bold text-amber-900 font-sans flex items-center gap-1.5">
                  <Key size={14} className="text-amber-600" /> 思い出の質問（秘密のクイズ）
                </span>
                <p className="text-xs text-amber-950 font-sans leading-relaxed">
                  {selectedBottle.secretQuestion}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setSelectedBottle(null);
                    navigate('/create');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-indigo-900 hover:from-teal-800 hover:to-indigo-950 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <span>自分もこの海に一通浮かべてみる 🍾</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setSelectedBottle(null)}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-sans text-center cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Concept Story Modal (Vintage Deckle-Edged Letter) */}
      <ConceptStoryModal 
        isOpen={isLocalConceptModalOpen} 
        onClose={() => setIsLocalConceptModalOpen(false)} 
      />
    </div>
  );
};
