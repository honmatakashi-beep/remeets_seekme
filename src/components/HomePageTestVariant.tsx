import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WaterRippleRainbowText } from './WaterRippleRainbowText';
import heroBottleMail from '../assets/images/hero_small_ocean_no_bottle.jpg';
import stepMistWriteImg from '../assets/images/step_01_mist_ocean_close_1789154903956.jpg';
import stepMistDriftImg from '../assets/images/step_02_beach_arrival_1789155133509.jpg';
import stepMistReconnectImg from '../assets/images/step_03_mist_reconnect_1789154562729.jpg';
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
  CheckCircle2,
  Send,
  CreditCard,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

interface HomePageTestVariantProps {
  onToggleDesign: () => void;
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

export const HomePageTestVariant: React.FC<HomePageTestVariantProps> = ({ onToggleDesign, onOpenConceptModal }) => {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLocalConceptModalOpen, setIsLocalConceptModalOpen] = useState(false);

  const handleOpenConcept = () => {
    if (onOpenConceptModal) {
      onOpenConceptModal();
    } else {
      setIsLocalConceptModalOpen(true);
    }
  };

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

  // カテゴリ選択肢
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
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3B627F] tracking-wider block leading-none select-none [text-rendering:geometricPrecision] antialiased mb-2 sm:mb-3">
                    ReMEETs SeekMe
                    <span className="block text-[9px] sm:text-xs md:text-sm font-sans font-medium text-teal-700 tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2 uppercase">
                      〜私を探すあなたへ〜
                    </span>
                  </span>
                  
                  {/* 水面のように滲んで揺れる WebGL/Canvas インタラクティブ虹色コピー */}
                  <WaterRippleRainbowText 
                    className="my-1" 
                    lines={[
                      '私を探しているあなたへ',
                      'ここにメッセージを書いておきます',
                      'ReMEETs SeekMe'
                    ]}
                  />
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs sm:text-sm md:text-base text-slate-800 font-serif leading-relaxed sm:leading-relaxed tracking-wide max-w-2xl mx-auto font-medium"
                >
                  同窓生、昔の仲間、お世話になったあの人。もし誰かがあなたの名前をGoogleなどで探したとき、あたたかいメッセージが見つかるように。ここは、私を探す大切な人に向けて静かにメッセージを届けておく、灯台のような再会プラットフォームです。
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
                      SeekMeが届ける再会のストーリー
                    </span>
                  </button>
                </motion.div>
              </div>

              {/* ヒーローアクション: 「メッセージを書く」「マイアカウント」2大ボタン */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 font-sans"
              >
                <Link
                  to="/create"
                  className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 sm:py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 group border border-teal-400/30 whitespace-nowrap"
                >
                  <Send size={17} className="text-teal-200 group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="font-bold tracking-wide">メッセージを書く</span>
                  <ArrowRight size={16} className="shrink-0 text-teal-200" />
                </Link>

                <Link
                  to="/account"
                  className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 sm:py-4 bg-white hover:bg-teal-50/50 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm transition-all border-2 border-teal-200 hover:border-teal-500 shadow-2xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 group whitespace-nowrap"
                >
                  <Sparkles size={17} className="text-teal-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-800 tracking-wide">マイアカウント（照合状況）</span>
                </Link>
              </motion.div>

              {/* 🛡️ 【安心の0円保証】探す・投函は完全無料の直感的可視化バッジ */}
              <div className="w-full max-w-xl mx-auto pt-1">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200/90 p-3 sm:p-4 shadow-sm text-left font-sans transition-all hover:shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-900">
                      <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                      <span>SeekMeの安心料金ポリシー</span>
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
                    <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-2 sm:p-2.5">
                      <span className="text-[10px] text-emerald-800 font-bold block">メッセージを書く</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-700">0円</span>
                      <span className="text-[9px] text-slate-500 block">何通でも作成可能</span>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-2 sm:p-2.5">
                      <span className="text-[10px] text-emerald-800 font-bold block">メッセージの検索・申請</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-700">0円</span>
                      <span className="text-[9px] text-slate-500 block">エピソード送信</span>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-2 sm:p-2.5">
                      <span className="text-[10px] text-emerald-800 font-bold block">連絡先開示（相互合意）</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-700">1,200円</span>
                      <span className="text-[9px] text-slate-500 block">不承認時 全額自動返金</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. 公開実績カウンター
      ========================================== */}
      {publicStats.showHomeStats && (
        <section className="py-4 bg-transparent border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">海を漂う想い出のメッセージ</span>
                <span className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-teal-800">
                  {publicStats.totalBottles > 0 ? publicStats.totalBottles.toLocaleString() : '320'}<span className="text-xs sm:text-sm font-sans font-normal ml-1">通</span>
                </span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">結ばれた温かい再会</span>
                <span className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-emerald-800">
                  {publicStats.totalReunions > 0 ? publicStats.totalReunions.toLocaleString() : '148'}<span className="text-xs sm:text-sm font-sans font-normal ml-1">組</span>
                </span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium block">eKYC公的本人確認率</span>
                <span className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-sky-800">
                  100<span className="text-xs sm:text-sm font-sans font-normal ml-1">%</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          3. 3つの安心ステップ（図解）
      ========================================== */}
      <section className="py-8 md:py-12 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] sm:text-xs font-bold text-teal-700 tracking-[0.25em] uppercase font-sans">
              HOW IT WORKS
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-teal-400/60 hidden sm:block" />
              <h2 className="text-base sm:text-xl md:text-2xl font-serif font-semibold text-slate-800 tracking-tight whitespace-nowrap">
                SeekMeで「私を探す人」と繋がる3つのステップ
              </h2>
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-teal-400/60 hidden sm:block" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5 relative z-10">
            {/* Step 1: メッセージを書く */}
            <div className="group relative bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-emerald-500/80 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 p-3.5 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs md:text-sm font-sans font-bold tracking-[0.22em] text-emerald-700/80 uppercase">STEP</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold tracking-wider text-emerald-600">01</span>
                </div>
                <span className="text-[11px] sm:text-xs font-serif font-bold bg-emerald-50 text-emerald-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-200">
                  【書く】
                </span>
              </div>

              <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-emerald-200 p-1 shadow-inner group-hover:border-emerald-400 transition-colors duration-300">
                <img 
                  src={stepMistWriteImg} 
                  alt="メッセージを書く" 
                  className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>

              <div className="space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between pt-1">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-sm sm:text-base md:text-lg font-serif font-extrabold text-slate-900 leading-snug tracking-tight">
                    メッセージを書く
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-sans leading-relaxed">
                    お名前・旧姓・ゆかりの都道府県とメッセージを投稿。学校名や詳細住所は非公開で防犯徹底。
                  </p>
                </div>

                <div className="pt-2 sm:pt-2.5 border-t border-emerald-100 flex items-center text-[10px] sm:text-[11px] md:text-xs text-emerald-700 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SMS本人認証で安全管理
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: エピソードで申請 */}
            <div className="group relative bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-sky-500/80 hover:border-sky-600 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 p-3.5 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs md:text-sm font-sans font-bold tracking-[0.22em] text-sky-700/80 uppercase">STEP</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold tracking-wider text-sky-600">02</span>
                </div>
                <span className="text-[11px] sm:text-xs font-serif font-bold bg-sky-50 text-sky-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-sky-200">
                  【届く】
                </span>
              </div>

              <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-sky-200 p-1 shadow-inner group-hover:border-sky-400 transition-colors duration-300">
                <img 
                  src={stepMistDriftImg} 
                  alt="エピソードで申請" 
                  className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>

              <div className="space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between pt-1">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-sm sm:text-base md:text-lg font-serif font-extrabold text-slate-900 leading-snug tracking-tight">
                    エピソードで申請
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-sans leading-relaxed">
                    探していた知人がメッセージを見つけ、当時の思い出のエピソードを添えて「再会希望」を送信します。
                  </p>
                </div>

                <div className="pt-2 sm:pt-2.5 border-t border-sky-100 flex items-center text-[10px] sm:text-[11px] md:text-xs text-sky-700 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    AI安全フィルターで検閲
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: 相互承認＆開示 */}
            <div className="group relative bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-teal-500/80 hover:border-teal-600 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 p-3.5 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs md:text-sm font-sans font-bold tracking-[0.22em] text-teal-700/80 uppercase">STEP</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold tracking-wider text-teal-600">03</span>
                </div>
                <span className="text-[11px] sm:text-xs font-serif font-bold bg-teal-50 text-teal-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-teal-200">
                  【結ぶ】
                </span>
              </div>

              <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 border border-teal-200 p-1 shadow-inner group-hover:border-teal-400 transition-colors duration-300">
                <img 
                  src={stepMistReconnectImg} 
                  alt="相互承認と連絡先開示" 
                  className="w-full h-full object-cover object-center rounded-lg group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>

              <div className="space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between pt-1">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-sm sm:text-base md:text-lg font-serif font-extrabold text-slate-900 leading-snug tracking-tight">
                    相互承認 ＆ 安全開示
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-sans leading-relaxed">
                    あなたが内容を確認して仮承認。お相手のeKYC本人確認を経て双方の連絡先を安全に開示します。
                  </p>
                </div>

                <div className="pt-2 sm:pt-2.5 border-t border-teal-100 flex items-center text-[10px] sm:text-[11px] md:text-xs text-teal-700 font-sans font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    不承認時は全額自動返金
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
                  <h4 className="text-xs font-bold text-slate-900">学校名や詳細住所は非公開</h4>
                  <p className="text-[10.5px] text-slate-600 leading-normal">公開されるのは都道府県のみ。学校名や職場名などは検索・一覧から完全に排除しています。</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <Key size={16} className="text-sky-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">事前の相互合意・承認制</h4>
                  <p className="text-[10.5px] text-slate-600 leading-normal">届いたエピソードをあなたが確認して「承認」しない限り、連絡先が開示されることはありません。</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <ShieldCheck size={16} className="text-indigo-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">公的eKYC ＆ AI検閲</h4>
                  <p className="text-[10.5px] text-slate-600 leading-normal">公的身分証による本人確認とAIによる出会い系・暴言の即時遮断で、安全な環境を維持します。</p>
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

      {/* ==========================================
          4. 「私を探すあなたへ」メッセージを書くダイレクトフォーム
      ========================================== */}
      <section className="py-8 bg-gradient-to-b from-teal-50/20 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 border-2 border-teal-300/80 shadow-md relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-xl mx-auto space-y-4 relative z-10">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 font-sans">
                  <Send size={13} className="text-teal-600" />
                  <span>想い出のメッセージ</span>
                </span>
                <h3 className="text-base sm:text-xl md:text-2xl font-serif font-bold text-slate-900 tracking-wide leading-relaxed space-y-1">
                  <span className="block">私を探している誰かに向けて。</span>
                  <span className="block text-teal-800">あなたからのメッセージを届けてみませんか？</span>
                </h3>
              </div>

              <form onSubmit={handleStartWriting} className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="section-last-name" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>お名前（姓）</span>
                    </label>
                    <input
                      id="section-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="例：佐藤"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="section-first-name" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>お名前（名）</span>
                    </label>
                    <input
                      id="section-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="例：花子"
                      className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-600 focus:bg-white outline-none text-xs sm:text-sm placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.005] active:scale-95 border border-teal-400/30"
                >
                  <Send size={16} className="text-teal-200 shrink-0" />
                  <span className="font-bold tracking-wide">
                    {fullTargetName 
                      ? `『${fullTargetName}』の名前でメッセージを書く`
                      : 'メッセージを作成する'}
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-teal-200" />
                </button>
              </form>

              <div className="pt-2 border-t border-teal-200/60 text-[11px] sm:text-xs text-slate-500 font-sans text-center">
                <span>※メッセージの投稿・閲覧・エピソード申請は無料です。学校名や詳細住所は非公開で防犯徹底。</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Nav Guidance Bar */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white to-teal-50/30 border-b border-slate-200/80">
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
                <span className="text-[10px] text-slate-500 block">メッセージの投稿〜再会までの流れ</span>
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
                <span className="text-[10px] text-slate-500 block">AI検閲・相互承認・eKYC</span>
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
                <span className="text-[10px] text-slate-500 block">投稿・申請0円・不承認時全額返金</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. 「SeekMeで生まれた再会のストーリー（感謝のメッセージ）」
      ========================================== */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-amber-50/40 via-white to-teal-50/30 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-brand-border/80 pb-3">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-[0.3em] font-sans block">
                Success Stories
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-dark tracking-wider">
                SeekMe で生まれた再会のストーリー
              </h2>
              <p className="text-xs md:text-sm text-brand-dark/60 font-serif">
                メッセージをきっかけに、再び繋がることができた方々からの温かいご報告。
              </p>
            </div>
            <Link to="/success-stories" className="text-xs text-teal-700 uppercase tracking-[0.2em] font-sans font-bold flex items-center gap-2 hover:underline shrink-0 self-start sm:self-auto">
              <span>すべて見る</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4.5 md:gap-6">
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
                    className="bg-white border border-brand-border/60 p-4 sm:p-4.5 md:p-6 rounded-[28px] space-y-3 sm:space-y-4 hover:shadow-lg hover:border-teal-400/40 transition-all hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer text-left block group"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-widest uppercase block border-b border-brand-border pb-2 group-hover:text-teal-700 transition-colors">
                        STORY #{String(idx + 1).padStart(2, '0')} / {displayTag}
                      </span>
                      <div className="space-y-1.5 sm:space-y-2">
                        <h4 className="text-xs sm:text-[13px] md:text-base font-serif font-bold text-brand-dark group-hover:text-teal-700 transition-colors line-clamp-2">「{story.title || 'メッセージがつないだ温かい再会'}」</h4>
                        <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed font-sans line-clamp-6">
                          {story.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <span className="text-[10px] font-sans font-bold text-teal-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

        </div>
      </section>

      {/* Concept Story Modal (Vintage Deckle-Edged Letter) */}
      <ConceptStoryModal 
        isOpen={isLocalConceptModalOpen} 
        onClose={() => setIsLocalConceptModalOpen(false)} 
      />
    </div>
  );
};

