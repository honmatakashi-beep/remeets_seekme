import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
  CreditCard, Heart, Lock, MapPin, Search, Send, ShieldAlert,
  ShieldCheck, Sparkles, Image as ImageIcon, X, Compass, Clock, Eye,
  Sliders, Layers, Smartphone, Monitor, Star, Award, PenTool, Key, Users,
  Waves
} from 'lucide-react';
import stepWriteImg from '../assets/images/step_01_photo_write_1785857630366.jpg';
import stepDriftImg from '../assets/images/step_02_photo_drift_1785857647101.jpg';
import stepReconnectImg from '../assets/images/step_03_photo_read_v2_1785857978640.jpg';
import stepMistWriteImg from '../assets/images/step_01_mist_ocean_close_1789154903956.jpg';
import stepMistDriftImg from '../assets/images/step_02_beach_arrival_1789155133509.jpg';
import stepMistReconnectImg from '../assets/images/step_03_mist_reconnect_1789154562729.jpg';
import step01PatternBRoom from '../assets/images/archive/step_01_pattern_b_room_close_1789154885068.jpg';
import step01PersonWriting from '../assets/images/archive/step_01_person_writing_ocean_1789154729657.jpg';
import step01CloseOceanAlt from '../assets/images/archive/step_01_close_ocean_alt_1789154867913.jpg';
import step01SoftWriting from '../assets/images/archive/step_01_soft_writing_ocean_1789154712157.jpg';
import step01WatercolorWrite from '../assets/images/step_01_watercolor_write_1789155429811.jpg';
import step01WatercolorWriteReversed from '../assets/images/step_01_watercolor_write_reversed_1789155887108.jpg';
import step02DriftSea from '../assets/images/archive/step_02_mist_drift_sea_1789154545824.jpg';
import step02WatercolorDrift from '../assets/images/archive/step_02_watercolor_drift_1789154529848.jpg';
import step02WatercolorBeach from '../assets/images/step_02_watercolor_drift_1789155448943.jpg';
import step03WatercolorReconnect from '../assets/images/step_03_watercolor_reconnect_1789155466323.jpg';
import step03WatercolorReconnectExact from '../assets/images/step_03_watercolor_reconnect_exact_1789155777210.jpg';
import heroBottleMail from '../assets/images/hero_small_bottle_mail_1785944479619.jpg';
import heroBottleMailWide from '../assets/images/hero_bottle_mail_1785941809474.jpg';
import { WaterRippleRainbowText } from './WaterRippleRainbowText';
import { WaterRippleImage } from './WaterRippleImage';
import { WaterRippleHeroCanvas } from './WaterRippleHeroCanvas';
import { BackToHomeButton } from './SharedComponents';
import { ConceptStoryModal } from './ConceptStoryModal';

// 🖼️ 今回作成した全画像アーカイブギャラリー
const ARCHIVED_IMAGE_GALLERY = [
  // 🎨 【新提案・イラスト調（水彩パステル）シリーズ】
  {
    id: 'step1-watercolor-write-reversed',
    title: '🎨 STEP 1【綴る】：水彩イラスト調・左右逆配置（左手元・右ボトル）',
    category: 'STEP 01 (イラスト調・左右逆)',
    status: '✨ 新規生成・最新',
    statusBg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    src: step01WatercolorWriteReversed,
    aspect: '16:9',
    desc: '左右反転レイアウト。左側に万年筆で手紙を書く手元、右側に空の透明ガラスボトルとコルク栓を配置した水彩イラスト。'
  },
  {
    id: 'step1-watercolor-write',
    title: '🎨 STEP 1【綴る】：水彩イラスト調・海辺テラス手元執筆（標準）',
    category: 'STEP 01 (イラスト調)',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: step01WatercolorWrite,
    aspect: '16:9',
    desc: 'HERO画像と100%同一の透明水彩・パステルトーン。顔なし手元アップ、机の上に空の透明ボトルとコルク、万年筆で想いを綴る情景。'
  },
  {
    id: 'step2-watercolor-beach',
    title: '🎨 STEP 2【漂う】：水彩イラスト調・砂浜に漂着したボトルメール',
    category: 'STEP 02 (イラスト調)',
    status: '✨ 新規生成・候補',
    statusBg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    src: step02WatercolorBeach,
    aspect: '16:9',
    desc: '朝の優しい光と波打ち際の砂浜に静かに打ち上げられたボトルメール。手紙がしっかり巻かれて入り、コルクが閉まった水彩アート。'
  },
  {
    id: 'step3-watercolor-reconnect-exact',
    title: '🎨 STEP 3【届く】：水彩イラスト調・斜め後ろ手元クローズアップ（写真同アングル）',
    category: 'STEP 03 (イラスト調・同構図)',
    status: '✨ 新規生成・最新',
    statusBg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    src: step03WatercolorReconnectExact,
    aspect: '16:9',
    desc: '写真調と全く同一の斜め後ろからのアングル。顔は見えすぎず、手紙を広げて読む手元と、砂浜のボトル・コルクが主役の水彩イラスト。'
  },
  {
    id: 'step3-watercolor-reconnect',
    title: '🎨 STEP 3【届く】：水彩イラスト調・砂浜で手紙を開封する感動（横顔アップ）',
    category: 'STEP 03 (イラスト調)',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: step03WatercolorReconnect,
    aspect: '16:9',
    desc: '朝の穏やかな砂浜でボトルを開封し、広げた手紙を大切に読む女性の横顔。'
  },
  {
    id: 'hero-mist-small',
    title: 'HERO：朝靄の水平線とガラスのボトルメール',
    category: 'HERO',
    status: '👑 採用中',
    statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    src: heroBottleMail,
    aspect: '21:9',
    desc: '透き通る朝の光、朝靄に包まれた静寂の水平線と、波間に佇む透明なガラスボトルメール。TYPE Bおよび本命×Type B版のメインHERO画像。'
  },
  {
    id: 'hero-drift-wide',
    title: 'HERO：ワイドパノラマ・漂うボトルメール',
    category: 'HERO',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: heroBottleMailWide,
    aspect: '16:9',
    desc: '初期のワイドHERO用ボトルメール画像。'
  },
  {
    id: 'step1-ocean-close-adopted',
    title: 'STEP 1【綴る】：海辺テラス・手元クローズアップ（パターンA）',
    category: 'STEP 01',
    status: '👑 採用中',
    statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    src: stepMistWriteImg,
    aspect: '16:9',
    desc: '顔は映らず手元に寄り、便箋にペンで文字を綴る様子。机の上に空の透明ボトル・外れたコルク栓・麻紐が配置され、背景に穏やかな海が広がる。'
  },
  {
    id: 'step1-room-close',
    title: 'STEP 1【綴る】：明るい部屋・手元クローズアップ（パターンB）',
    category: 'STEP 01',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-violet-100 text-violet-800 border-violet-300',
    src: step01PatternBRoom,
    aspect: '16:9',
    desc: '白レースカーテンから自然光が注ぐお部屋のデスク。ペンで手紙を書く手元、机の上に空のボトルとコルク。'
  },
  {
    id: 'step1-person-writing',
    title: 'STEP 1【綴る】：海辺テラス・人物引きアングル',
    category: 'STEP 01',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: step01PersonWriting,
    aspect: '16:9',
    desc: '海風を感じながらテラス席で真剣に手紙を書く女性の横顔と、机の上のボトルとコルク。'
  },
  {
    id: 'step1-close-ocean-alt',
    title: 'STEP 1【綴る】：海背景・手元アップ別案',
    category: 'STEP 01',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: step01CloseOceanAlt,
    aspect: '16:9',
    desc: '落ち着いた手元と広がる海原のクローズアップ構図。'
  },
  {
    id: 'step1-soft-writing',
    title: 'STEP 1【綴る】：水彩タッチ調テラス執筆',
    category: 'STEP 01',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: step01SoftWriting,
    aspect: '16:9',
    desc: '柔らかなパステル水彩調の海と手元風景。'
  },
  {
    id: 'step2-beach-arrival-adopted',
    title: 'STEP 2【漂う】：砂浜にたどり着いたボトルメール',
    category: 'STEP 02',
    status: '👑 採用中',
    statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    src: stepMistDriftImg,
    aspect: '16:9',
    desc: '朝の穏やかな波打ち際の濡れた砂浜に打ち上げられたボトルメール。手紙がしっかり巻かれて入り、コルク栓が閉まった状態。'
  },
  {
    id: 'step2-drift-sea',
    title: 'STEP 2【漂う】：朝靄の海原を漂うボトルメール',
    category: 'STEP 02',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: step02DriftSea,
    aspect: '16:9',
    desc: '朝靄の澄んだ水面を静かに漂っていくフォトリアリスティックなボトルメール。'
  },
  {
    id: 'step2-watercolor-drift',
    title: 'STEP 2【漂う】：水彩画風・海をめぐるボトルメール',
    category: 'STEP 02',
    status: '🗄️ アーカイブ保存',
    statusBg: 'bg-slate-100 text-slate-700 border-slate-300',
    src: step02WatercolorDrift,
    aspect: '16:9',
    desc: '絵画のような透明水彩タッチで描かれた海とボトルメール。'
  },
  {
    id: 'step3-reconnect-adopted',
    title: 'STEP 3【届く】：砂浜でボトルを開け手紙を読む奇跡',
    category: 'STEP 03',
    status: '👑 採用中',
    statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    src: stepMistReconnectImg,
    aspect: '16:9',
    desc: '朝の穏やかな砂浜でボトルを開け、大切に手紙を広げて想いを読む感動の瞬間。'
  }
];

// サンプル想いボトル
const SAMPLE_BOTTLES = [
  {
    id: 'sample-1',
    targetName: '世田谷区 〇〇中学 サッカー部 Aくん',
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
    targetName: '2005年 横浜 / 保健室のH先生',
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
    targetName: '京都 軽音サークル 初恋のM先輩',
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
    targetName: '旅先の福岡で財布を落とした私を助けてくれた親切な方',
    era: '2010年代',
    location: '福岡県博多区',
    relationship: '旅先での恩人',
    excerpt: '一銭もなく途方に暮れていた高校生の私に電車代を貸して下さり本当にありがとうございました。ずっとお礼が言いたかったです。',
    secretQuestion: '駅前の喫茶店でご馳走していただいたあたたかい飲み物は？',
    createdTime: '漂流 5日前',
    tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
];

// 奇跡の物語
const SUCCESS_STORIES = [
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

const TRIGGER_CATEGORIES = [
  { label: '学校（同級生・先生）', category: 'school', icon: '🎓' },
  { label: '職場（同僚・上司）', category: 'work', icon: '💼' },
  { label: '近所・幼馴染', category: 'neighborhood', icon: '🏡' },
  { label: '趣味・サークル', category: 'hobby', icon: '🎨' },
  { label: '初恋・大切な人', category: 'love', icon: '💕' },
  { label: 'その他', category: 'other', icon: '🤝' },
];

export const HomeDesignShowroom = () => {
  const [activeDesign, setActiveDesign] = useState<
    | 'recommended'
    | 'recommended-type-b-hero'
    | 'recommended-type-b-hero-2'
    | 'archive'
  >('recommended');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBottle, setSelectedBottle] = useState<any | null>(null);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const navigate = useNavigate();

  const fullTargetName = (lastName || firstName) ? `${lastName} ${firstName}`.trim() : '';

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
    <div className="min-h-screen bg-[#FDF9F0]/60 pb-32 font-sans text-slate-800 selection:bg-teal-100 selection:text-teal-900">
      {/* 🌟 Top Sticky Design Switcher */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-serif">🎨 HOMEデザイン比較:</span>
            <span className="text-[11px] font-serif font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              全8大セクション完全網羅
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-0.5 scrollbar-none">
            {/* 👑 本命 3パターン */}
            <button
              onClick={() => setActiveDesign('recommended')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeDesign === 'recommended'
                  ? 'bg-amber-900 text-amber-50 shadow-md scale-105 border border-amber-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>👑 本命 (現行オリジナル)</span>
            </button>

            <button
              onClick={() => setActiveDesign('recommended-type-b-hero')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeDesign === 'recommended-type-b-hero'
                  ? 'bg-gradient-to-r from-sky-700 to-indigo-900 text-white shadow-md scale-105 border border-sky-400 ring-2 ring-sky-300'
                  : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              <Waves size={13} className="text-sky-500" />
              <span>🌊 ⑤-B 本命 (上下分割版)</span>
            </button>

            <button
              onClick={() => setActiveDesign('recommended-type-b-hero-2')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeDesign === 'recommended-type-b-hero-2'
                  ? 'bg-gradient-to-r from-teal-700 via-sky-700 to-indigo-900 text-white shadow-md scale-105 border border-teal-300 ring-2 ring-teal-300'
                  : 'bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              <Sparkles size={13} className="text-teal-500" />
              <span>🌊 ⑤-B-2 本命 (重ね合わせ一体版)</span>
            </button>

            {/* 🖼️ 画像アーカイブ */}
            <button
              onClick={() => setActiveDesign('archive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeDesign === 'archive'
                  ? 'bg-gradient-to-r from-violet-800 to-indigo-900 text-white shadow-md scale-105 border border-violet-400 ring-2 ring-violet-300'
                  : 'bg-violet-50 text-violet-900 border border-violet-200 hover:bg-violet-100'
              }`}
            >
              <ImageIcon size={13} className="text-violet-600" />
              <span>🖼️ 画像アーカイブ ({ARCHIVED_IMAGE_GALLERY.length}点)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <BackToHomeButton />

        {/* Concept Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-700 font-mono">
              👑 Masterpiece Design
            </span>
            <h2 className="text-base font-serif font-bold text-slate-900">
              {activeDesign === 'recommended' && '👑 ⑤ おすすめ (本命・現行オリジナル)'}
              {activeDesign === 'recommended-type-b-hero' && '🌊 ⑤-B ユーザー様本命 (Type B 上下分割版)'}
              {activeDesign === 'recommended-type-b-hero-2' && '🌊 ⑤-B-2 本命 (イラスト×文字 重ね合わせ一体版)'}
              {activeDesign === 'archive' && '🖼️ 生成画像・素材アーカイブギャラリー'}
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              全8大要素（Hero、検索、3ステップ、新着、実績、安心セキュリティ、理念ストーリー、料金導線）完備
            </p>
          </div>
          <span className="text-[11px] font-sans font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
            ✓ 全8大セクション完全網羅
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════
          👑 ⑤ おすすめ (Editorial Luxury Masterpiece - 現行の最高峰)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'recommended' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-4xl mx-auto px-4 sm:px-6">
          {/* 1. HERO */}
          <div className="relative rounded-[36px] bg-gradient-to-br from-white via-slate-50/60 to-sky-50/30 p-6 sm:p-10 md:p-12 shadow-sm border border-sky-900/20 overflow-hidden text-center space-y-6">
            <div className="absolute inset-3.5 rounded-[28px] border border-zinc-800/80 pointer-events-none z-10" />
            <div className="absolute inset-5 rounded-[24px] border border-dashed border-zinc-800/50 pointer-events-none z-10" />
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden opacity-80">
              <img src={heroBottleMail} alt="海" className="w-full h-full object-cover max-w-3xl scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white opacity-70" />
            </div>

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#3B627F] tracking-wider block">ReMEETs</span>
                <WaterRippleRainbowText lines={['あの日言えなかった想いを', 'あの人へ', '再会のボトルメール']} />
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-800 font-serif leading-relaxed font-medium">
                同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
              </p>
              <div className="flex justify-center pt-1">
                <button onClick={() => setIsConceptModalOpen(true)} className="px-6 py-2.5 bg-white/90 backdrop-blur-xs text-brand-dark border border-zinc-300 rounded-full text-xs font-serif font-bold shadow-2xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>ボトルメールが届ける再会の奇跡</span>
                </button>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 font-sans">
                <Link to="/create" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <PenTool size={16} /> <span>ボトルメールを流す</span> <ArrowRight size={15} />
                </Link>
                <Link to="/search" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-white hover:bg-sky-50 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm border-2 border-sky-200 flex items-center justify-center gap-2">
                  <Search size={16} className="text-sky-600" /> <span>自分宛ての手紙を探す</span>
                </Link>
              </div>

              {/* 料金ポリシー */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 p-3 sm:p-4 shadow-sm space-y-2 text-left font-sans">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> ReMEETsの安心料金ポリシー</span>
                  <Link to="/pricing" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">料金表・詳細を見る →</Link>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">手紙を書く・投函</span><strong className="text-xs sm:text-sm font-serif font-black text-emerald-600">完全0円</strong></div>
                  <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">手紙を探す・閲覧</span><strong className="text-xs sm:text-sm font-black font-serif text-emerald-600">完全0円</strong></div>
                  <div className="bg-sky-50/70 p-2 rounded-xl border border-sky-200"><span className="text-[10px] text-sky-900 font-bold block">想い出照合・再会時</span><strong className="text-xs sm:text-sm font-black font-serif text-sky-700">開通時のみ 600円</strong></div>
                </div>
                <p className="text-[10px] text-slate-500 text-center leading-tight">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）</p>
              </div>
            </div>
          </div>

          {/* 2. 3ステップ & プライバシー3大防衛 */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><Sparkles size={12} className="text-teal-600" /> HOW IT WORKS</span>
              <h2 className="text-lg sm:text-2xl font-serif font-semibold text-slate-800">ボトルメールで「あの人」と再会する3つのステップ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/95 rounded-2xl border-2 border-emerald-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2"><span className="text-xs font-bold text-emerald-700 uppercase">STEP 01</span><span className="text-xs font-serif font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">【綴る】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-emerald-200"><img src={stepMistWriteImg} alt="手紙を書く" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ボトルに思い出を託す</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">お相手の名前や当時の思い出、二人しか知らない『秘密の質問』を添えて、匿名でメッセージを静かに投稿します。</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold pt-2 border-t border-emerald-100">● 匿名で流せる安全設計</span>
              </div>
              <div className="bg-white/95 rounded-2xl border-2 border-sky-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2"><span className="text-xs font-bold text-sky-700 uppercase">STEP 02</span><span className="text-xs font-serif font-bold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200">【漂う】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-sky-200"><img src={stepMistDriftImg} alt="漂う" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ネットの海をめぐる</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">手紙は検索エンジンを通じてWebの海へ芽吹き、記憶をたどる「あの人」の検索窓で見つけられる日を静かに待ち続けます。</p>
                </div>
                <span className="text-[10px] text-sky-700 font-bold pt-2 border-t border-sky-100">● 検索に届くWeb最適化</span>
              </div>
              <div className="bg-white/95 rounded-2xl border-2 border-teal-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2"><span className="text-xs font-bold text-teal-700 uppercase">STEP 03</span><span className="text-xs font-serif font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">【届く】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-teal-200"><img src={stepMistReconnectImg} alt="届く" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">奇跡の再会を果たす</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">見つけたお相手が思い出クイズに正解することで、初めて手紙が開き、手紙のやり取りやLINE等で直接つながれます。</p>
                </div>
                <span className="text-[10px] text-teal-700 font-bold pt-2 border-t border-teal-100">● 想いが通じ合う瞬間</span>
              </div>
            </div>
            <div className="text-center pt-1"><Link to="/guide" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-teal-900 border border-teal-300 rounded-xl text-xs font-bold hover:bg-teal-50"><BookOpen size={16} /> <span>ご利用ガイドを見る</span> <ArrowRight size={14} /></Link></div>

            {/* プライバシーと安全を守る 3つの堅牢な仕組み */}
            <div className="bg-gradient-to-r from-teal-50/60 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-teal-200 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-teal-900 text-xs font-bold font-serif"><ShieldCheck size={16} className="text-teal-700" /><span>プライバシーと安全を守る 3つの堅牢な仕組み</span></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><Lock size={16} className="text-teal-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">本名や詳細メッセージは非公開</h4><p className="text-[10.5px] text-slate-600 leading-normal">検索一覧には公的な手がかり情報のみ表示され、あなたの連絡先や秘密本文は守られます。</p></div></div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><Key size={16} className="text-sky-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">「秘密の質問」正解者のみ開示</h4><p className="text-[10.5px] text-slate-600 leading-normal">二人しか知らない思い出の回答を入力できた「本当の本人」だけがメッセージを開封できます。</p></div></div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><ShieldCheck size={16} className="text-indigo-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">悪用・ストーカー完全防衛対策</h4><p className="text-[10.5px] text-slate-600 leading-normal">AI自動検閲フィルター・eKYC本人確認・24時間不適切通報制度により安全な環境を維持します。</p></div></div>
              </div>
              <div className="text-center pt-1"><Link to="/safety" className="inline-flex items-center gap-1.5 text-xs text-indigo-900 font-bold hover:underline"><ShieldCheck size={14} /> <span>安心・安全への取り組みについて詳しく見る →</span></Link></div>
            </div>
          </div>

          {/* 3. ボトルメール作成ダイレクトフォーム */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 border-2 border-teal-300 shadow-md text-left font-sans">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold"><PenTool size={13} /> <span>ボトルメール作成</span></span>
                <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 leading-relaxed">連絡先がわからなくなってしまった、あの人へ。<br /><span className="text-sky-900">ボトルメールを流してみませんか？</span></h3>
              </div>
              <form onSubmit={handleStartWriting} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-slate-700 block mb-1">姓</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="例：佐藤" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" /></div>
                  <div><label className="text-xs font-bold text-slate-700 block mb-1">名</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="例：花子" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" /></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">お相手との関係性（カテゴリー）※任意選択</label>
                  <select value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer">
                    <option value="">選択してください</option>
                    {TRIGGER_CATEGORIES.map(c => <option key={c.category} value={c.category}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <PenTool size={16} /><span>{fullTargetName ? `『${fullTargetName}』様へのボトルメールを書き始める` : 'このお名前でボトルメールを書き始める'}</span><ArrowRight size={16} />
                </button>
              </form>
              <p className="text-[11px] text-slate-500 text-center font-sans">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。</p>
            </div>
          </div>

          {/* 4. クイックナビ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            <Link to="/guide" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0"><BookOpen size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">ご利用マニュアル</span><span className="text-[10px] text-slate-500 block">検索〜開通までの流れ</span></div></Link>
            <Link to="/safety" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">安心・安全の取り組み</span><span className="text-[10px] text-slate-500 block">AI監視・eKYC本人確認</span></div></Link>
            <Link to="/pricing" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0"><CreditCard size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">利用料金表（0円〜）</span><span className="text-[10px] text-slate-500 block">月額費用なし・明確料金</span></div></Link>
          </div>

          {/* 5. 奇跡の物語 */}
          <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-slate-200 pb-3">
              <div><span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Success Stories</span><h2 className="text-xl font-serif font-bold text-slate-900">ReMEETs がつないだ奇跡の物語</h2><p className="text-xs text-slate-600 font-serif">ボトルメールが届き、この海で再び巡り合えた方々からの声。</p></div>
              <Link to="/success-stories" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SUCCESS_STORIES.map((s, idx) => (
                <div key={s.id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 text-left shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">STORY #{String(idx + 1).padStart(2, '0')} / {s.tag}</span>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 line-clamp-2">「{s.title}」</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-5">{s.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. 統計情報 */}
          <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-white border border-teal-200 shadow-xs text-center">
            <div className="p-2 rounded-xl bg-teal-50/80"><span className="text-[10px] text-teal-800 font-bold block">流されたボトル</span><strong className="text-sm sm:text-base font-serif font-black text-teal-950">348 件</strong></div>
            <div className="p-2 rounded-xl bg-rose-50/80"><span className="text-[10px] text-rose-800 font-bold block">再会成功数</span><strong className="text-sm sm:text-base font-serif font-black text-rose-950">42 組</strong></div>
            <div className="p-2 rounded-xl bg-sky-50/80"><span className="text-[10px] text-sky-800 font-bold block">本日の投函</span><strong className="text-sm sm:text-base font-serif font-black text-sky-950">12 通</strong></div>
          </div>

          {/* 7. 漂うボトルメールギャラリー */}
          <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-teal-200 pb-3">
              <div><span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Bottle Mail Gallery</span><h2 className="text-xl font-serif font-bold text-slate-900">ネットの海に漂うみんなの想い</h2><p className="text-xs text-slate-600 font-sans">タップしてボトルを開けてみてください。自分と同じように、大切な人を探している一通が見つかります。</p></div>
              <Link to="/search" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_BOTTLES.map((b) => (
                <div key={b.id} onClick={() => setSelectedBottle(b)} className="p-5 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl space-y-3 cursor-pointer text-left shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">{b.era} / {b.relationship}</span><span className="text-[10px] text-slate-400 font-mono">{b.createdTime}</span></div>
                  <h3 className="text-base font-serif font-bold text-slate-900">{b.targetName} 様</h3>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">出会った場所: {b.location} / 「{b.excerpt}」</p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-teal-700 font-bold"><span>手紙を引出す</span> <ArrowRight size={12} /></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          🌊 ⑤-B ユーザー様本命 (Type B背景イラスト差し替え版)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'recommended-type-b-hero' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-4xl mx-auto px-4 sm:px-6">
          {/* 1. HERO - TYPE Bの21:9パノラマフレーム＆透明度を完全再現 */}
          <div className="relative rounded-[36px] bg-gradient-to-b from-[#F0F7FB] via-[#E6F0F7] to-[#FFFFFF] p-6 sm:p-10 md:p-12 shadow-md border border-sky-300/70 overflow-hidden text-center space-y-6">
            <div className="absolute inset-3.5 rounded-[28px] border border-sky-900/30 pointer-events-none z-10" />
            <div className="absolute inset-5 rounded-[24px] border border-dashed border-sky-800/20 pointer-events-none z-10" />
            
            {/* TYPE Bの水面光彩エフェクト */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-44 bg-gradient-to-b from-sky-300/20 to-transparent pointer-events-none blur-2xl z-0" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              {/* タイトル & 虹色水紋グラデーション */}
              <div className="space-y-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#3B627F] tracking-wider block">ReMEETs</span>
                <WaterRippleRainbowText lines={['あの日言えなかった想いを', 'あの人へ', '再会のボトルメール']} />
              </div>

              {/* 横長パノラマ写真フレーム（海とボトルに水紋エフェクトがリアルタイム波打ち） */}
              <div className="relative mx-auto max-w-2xl rounded-2xl overflow-hidden border border-sky-200 shadow-md aspect-[21/9]">
                <WaterRippleImage src={heroBottleMail} alt="海とボトルメール" className="w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                    <span className="text-xs text-white/90 font-serif tracking-widest">静寂の水平線に漂う、届くべき言の葉</span>
                  </div>
                </WaterRippleImage>
              </div>

              {/* リード文 */}
              <p className="text-xs sm:text-sm md:text-base text-slate-800 font-serif leading-relaxed font-medium">
                同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
              </p>

              {/* コンセプトボタン */}
              <div className="flex justify-center pt-1">
                <button onClick={() => setIsConceptModalOpen(true)} className="px-6 py-2.5 bg-white/90 backdrop-blur-xs text-brand-dark border border-zinc-300 rounded-full text-xs font-serif font-bold shadow-2xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>ボトルメールが届ける再会の奇跡</span>
                </button>
              </div>

              {/* 投函 & 検索 CTAボタン */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 font-sans">
                <Link to="/create" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <PenTool size={16} /> <span>ボトルメールを流す</span> <ArrowRight size={15} />
                </Link>
                <Link to="/search" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-white hover:bg-sky-50 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm border-2 border-sky-200 flex items-center justify-center gap-2">
                  <Search size={16} className="text-sky-600" /> <span>自分宛ての手紙を探す</span>
                </Link>
              </div>

              {/* 料金ポリシー */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 p-3 sm:p-4 shadow-sm space-y-2 text-left font-sans">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> ReMEETsの安心料金ポリシー</span>
                  <Link to="/pricing" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">料金表・詳細を見る →</Link>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">手紙を書く・投函</span><strong className="text-xs sm:text-sm font-serif font-black text-emerald-600">完全0円</strong></div>
                  <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">手紙を探す・閲覧</span><strong className="text-xs sm:text-sm font-black font-serif text-emerald-600">完全0円</strong></div>
                  <div className="bg-sky-50/70 p-2 rounded-xl border border-sky-200"><span className="text-[10px] text-sky-900 font-bold block">想い出照合・再会時</span><strong className="text-xs sm:text-sm font-black font-serif text-sky-700">開通時のみ 600円</strong></div>
                </div>
                <p className="text-[10px] text-slate-500 text-center leading-tight">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）</p>
              </div>
            </div>
          </div>

          {/* 2. 3ステップ & プライバシー3大防衛 */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><Sparkles size={12} className="text-teal-600" /> HOW IT WORKS</span>
              <h2 className="text-lg sm:text-2xl font-serif font-semibold text-slate-800">ボトルメールで「あの人」と再会する3つのステップ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/95 rounded-2xl border-2 border-emerald-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2"><span className="text-xs font-bold text-emerald-700 uppercase">STEP 01</span><span className="text-xs font-serif font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">【綴る】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-emerald-200"><img src={stepMistWriteImg} alt="手紙を書く" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ボトルに思い出を託す</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">お相手の名前や当時の思い出、二人しか知らない『秘密の質問』を添えて、匿名でメッセージを静かに投稿します。</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold pt-2 border-t border-emerald-100">● 匿名で流せる安全設計</span>
              </div>
              <div className="bg-white/95 rounded-2xl border-2 border-sky-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2"><span className="text-xs font-bold text-sky-700 uppercase">STEP 02</span><span className="text-xs font-serif font-bold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200">【漂う】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-sky-200"><img src={stepMistDriftImg} alt="漂う" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ネットの海をめぐる</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">手紙は検索エンジンを通じてWebの海へ芽吹き、記憶をたどる「あの人」の検索窓で見つけられる日を静かに待ち続けます。</p>
                </div>
                <span className="text-[10px] text-sky-700 font-bold pt-2 border-t border-sky-100">● 検索に届くWeb最適化</span>
              </div>
              <div className="bg-white/95 rounded-2xl border-2 border-teal-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2"><span className="text-xs font-bold text-teal-700 uppercase">STEP 03</span><span className="text-xs font-serif font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">【届く】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-teal-200"><img src={stepMistReconnectImg} alt="届く" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">奇跡の再会を果たす</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">見つけたお相手が思い出クイズに正解することで、初めて手紙が開き、手紙のやり取りやLINE等で直接つながれます。</p>
                </div>
                <span className="text-[10px] text-teal-700 font-bold pt-2 border-t border-teal-100">● 想いが通じ合う瞬間</span>
              </div>
            </div>
            <div className="text-center pt-1"><Link to="/guide" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-teal-900 border border-teal-300 rounded-xl text-xs font-bold hover:bg-teal-50"><BookOpen size={16} /> <span>ご利用ガイドを見る</span> <ArrowRight size={14} /></Link></div>

            {/* プライバシーと安全を守る 3つの堅牢な仕組み */}
            <div className="bg-gradient-to-r from-teal-50/60 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-teal-200 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-teal-900 text-xs font-bold font-serif"><ShieldCheck size={16} className="text-teal-700" /><span>プライバシーと安全を守る 3つの堅牢な仕組み</span></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><Lock size={16} className="text-teal-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">本名や詳細メッセージは非公開</h4><p className="text-[10.5px] text-slate-600 leading-normal">検索一覧には公的な手がかり情報のみ表示され、あなたの連絡先や秘密本文は守られます。</p></div></div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><Key size={16} className="text-sky-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">「秘密の質問」正解者のみ開示</h4><p className="text-[10.5px] text-slate-600 leading-normal">二人しか知らない思い出の回答を入力できた「本当の本人」だけがメッセージを開封できます。</p></div></div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><ShieldCheck size={16} className="text-indigo-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">悪用・ストーカー完全防衛対策</h4><p className="text-[10.5px] text-slate-600 leading-normal">AI自動検閲フィルター・eKYC本人確認・24時間不適切通報制度により安全な環境を維持します。</p></div></div>
              </div>
              <div className="text-center pt-1"><Link to="/safety" className="inline-flex items-center gap-1.5 text-xs text-indigo-900 font-bold hover:underline"><ShieldCheck size={14} /> <span>安心・安全への取り組みについて詳しく見る →</span></Link></div>
            </div>
          </div>

          {/* 3. ボトルメール作成ダイレクトフォーム */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 border-2 border-teal-300 shadow-md text-left font-sans">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold"><PenTool size={13} /> <span>ボトルメール作成</span></span>
                <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 leading-relaxed">連絡先がわからなくなってしまった、あの人へ。<br /><span className="text-sky-900">ボトルメールを流してみませんか？</span></h3>
              </div>
              <form onSubmit={handleStartWriting} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-slate-700 block mb-1">姓</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="例：佐藤" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" /></div>
                  <div><label className="text-xs font-bold text-slate-700 block mb-1">名</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="例：花子" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" /></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">お相手との関係性（カテゴリー）※任意選択</label>
                  <select value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer">
                    <option value="">選択してください</option>
                    {TRIGGER_CATEGORIES.map(c => <option key={c.category} value={c.category}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <PenTool size={16} /><span>{fullTargetName ? `『${fullTargetName}』様へのボトルメールを書き始める` : 'このお名前でボトルメールを書き始める'}</span><ArrowRight size={16} />
                </button>
              </form>
              <p className="text-[11px] text-slate-500 text-center font-sans">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。</p>
            </div>
          </div>

          {/* 4. クイックナビ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            <Link to="/guide" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0"><BookOpen size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">ご利用マニュアル</span><span className="text-[10px] text-slate-500 block">検索〜開通までの流れ</span></div></Link>
            <Link to="/safety" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">安心・安全の取り組み</span><span className="text-[10px] text-slate-500 block">AI監視・eKYC本人確認</span></div></Link>
            <Link to="/pricing" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0"><CreditCard size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">利用料金表（0円〜）</span><span className="text-[10px] text-slate-500 block">月額費用なし・明確料金</span></div></Link>
          </div>

          {/* 5. 奇跡の物語 */}
          <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-slate-200 pb-3">
              <div><span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Success Stories</span><h2 className="text-xl font-serif font-bold text-slate-900">ReMEETs がつないだ奇跡の物語</h2><p className="text-xs text-slate-600 font-serif">ボトルメールが届き、この海で再び巡り合えた方々からの声。</p></div>
              <Link to="/success-stories" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SUCCESS_STORIES.map((s, idx) => (
                <div key={s.id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 text-left shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">STORY #{String(idx + 1).padStart(2, '0')} / {s.tag}</span>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 line-clamp-2">「{s.title}」</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-5">{s.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. 統計情報 */}
          <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-white border border-teal-200 shadow-xs text-center">
            <div className="p-2 rounded-xl bg-teal-50/80"><span className="text-[10px] text-teal-800 font-bold block">流されたボトル</span><strong className="text-sm sm:text-base font-serif font-black text-teal-950">348 件</strong></div>
            <div className="p-2 rounded-xl bg-rose-50/80"><span className="text-[10px] text-rose-800 font-bold block">再会成功数</span><strong className="text-sm sm:text-base font-serif font-black text-rose-950">42 組</strong></div>
            <div className="p-2 rounded-xl bg-sky-50/80"><span className="text-[10px] text-sky-800 font-bold block">本日の投函</span><strong className="text-sm sm:text-base font-serif font-black text-sky-950">12 通</strong></div>
          </div>

          {/* 7. 漂うボトルメールギャラリー */}
          <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-teal-200 pb-3">
              <div><span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Bottle Mail Gallery</span><h2 className="text-xl font-serif font-bold text-slate-900">ネットの海に漂うみんなの想い</h2><p className="text-xs text-slate-600 font-sans">タップしてボトルを開けてみてください。自分と同じように、大切な人を探している一通が見つかります。</p></div>
              <Link to="/search" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_BOTTLES.map((b) => (
                <div key={b.id} onClick={() => setSelectedBottle(b)} className="p-5 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl space-y-3 cursor-pointer text-left shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">{b.era} / {b.relationship}</span><span className="text-[10px] text-slate-400 font-mono">{b.createdTime}</span></div>
                  <h3 className="text-base font-serif font-bold text-slate-900">{b.targetName} 様</h3>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">出会った場所: {b.location} / 「{b.excerpt}」</p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-teal-700 font-bold"><span>手紙を引出す</span> <ArrowRight size={12} /></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          🌊 ⑤-B-2 ユーザー様本命 (イラスト×文字 重ね合わせ一体版)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'recommended-type-b-hero-2' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-4xl mx-auto px-4 sm:px-6">
          {/* 1. HERO - まわりの枠線いっぱいに広がる水面パノラマ一体型ヒーロー */}
          <div className="relative rounded-[36px] bg-gradient-to-b from-[#F0F7FB] via-[#E6F0F7] to-[#FFFFFF] p-3 sm:p-5 md:p-6 shadow-md border border-sky-300/70 overflow-hidden text-center space-y-6">
            <div className="absolute inset-2.5 sm:inset-3.5 rounded-[28px] border border-sky-900/30 pointer-events-none z-20" />
            <div className="absolute inset-4 sm:inset-5 rounded-[24px] border border-dashed border-sky-800/20 pointer-events-none z-20" />

            <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
              {/* 🌟 枠線いっぱいに広がり下部まで切れないパノラマ水面イラスト × 文字一体キャンバス */}
              <div className="relative mx-auto w-full rounded-[24px] overflow-hidden border border-sky-200/90 shadow-md aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[340px] sm:min-h-[400px] md:min-h-[440px]">
                <WaterRippleImage 
                  src={heroBottleMail} 
                  alt="海とボトルメール" 
                  positionY={0.92}
                  className="w-full h-full absolute inset-0"
                >
                  {/* 水面上の重ね合わせレイヤー（白ボケなし・海とボトルが鮮明に透き通るクリアレイヤー） */}
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-transparent to-sky-950/50 flex flex-col justify-between p-4 sm:p-6 md:p-8 text-center pointer-events-none select-none">
                    {/* 上部タイトル */}
                    <div className="space-y-0.5 pt-1">
                      <span className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3B627F] tracking-wider drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)] block">
                        ReMEETs
                      </span>
                    </div>

                    {/* 中央：水面に浮かぶ虹色の想い出文字（白ボケなし・クリアダイレクト描画） */}
                    <div className="space-y-1 my-auto pointer-events-auto py-2">
                      <WaterRippleRainbowText
                        lines={['あの日言えなかった想いを', 'あの人へ', '再会のボトルメール']}
                        shadowStyle="none"
                      />
                    </div>

                    {/* 下部キャプション */}
                    <div className="pb-1">
                      <span className="text-[11px] sm:text-xs text-white/95 font-serif tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                        静寂の水平線に漂う、届くべき言の葉
                      </span>
                    </div>
                  </div>
                </WaterRippleImage>
              </div>

              {/* リード文 */}
              <p className="text-xs sm:text-sm md:text-base text-slate-800 font-serif leading-relaxed font-medium max-w-2xl mx-auto px-2">
                同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
              </p>

              {/* コンセプトボタン */}
              <div className="flex justify-center pt-1">
                <button onClick={() => setIsConceptModalOpen(true)} className="px-6 py-2.5 bg-white/90 backdrop-blur-xs text-brand-dark border border-zinc-300 rounded-full text-xs font-serif font-bold shadow-2xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>ボトルメールが届ける再会の奇跡</span>
                </button>
              </div>

              {/* 投函 & 検索 CTAボタン */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 font-sans">
                <Link to="/create" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <PenTool size={16} /> <span>ボトルメールを流す</span> <ArrowRight size={15} />
                </Link>
                <Link to="/search" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-white hover:bg-sky-50 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm border-2 border-sky-200 flex items-center justify-center gap-2">
                  <Search size={16} className="text-sky-600" /> <span>自分宛ての手紙を探す</span>
                </Link>
              </div>

              {/* 料金ポリシー */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 p-3 sm:p-4 shadow-sm space-y-2 text-left font-sans">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> ReMEETsの安心料金ポリシー</span>
                  <Link to="/pricing" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">料金表・詳細を見る →</Link>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">手紙を書く・投函</span><strong className="text-xs sm:text-sm font-serif font-black text-emerald-600">完全0円</strong></div>
                  <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">手紙を探す・閲覧</span><strong className="text-xs sm:text-sm font-black font-serif text-emerald-600">完全0円</strong></div>
                  <div className="bg-sky-50/70 p-2 rounded-xl border border-sky-200"><span className="text-[10px] text-sky-900 font-bold block">想い出照合・再会時</span><strong className="text-xs sm:text-sm font-black font-serif text-sky-700">開通時のみ 600円</strong></div>
                </div>
                <p className="text-[10px] text-slate-500 text-center leading-tight">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）</p>
              </div>
            </div>
          </div>

          {/* 2. 3ステップ & プライバシー3大防衛 */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><Sparkles size={12} className="text-teal-600" /> HOW IT WORKS</span>
              <h2 className="text-lg sm:text-2xl font-serif font-semibold text-slate-800">ボトルメールで「あの人」と再会する3つのステップ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/95 rounded-2xl border-2 border-emerald-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2"><span className="text-xs font-bold text-emerald-700 uppercase">STEP 01</span><span className="text-xs font-serif font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">【綴る】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-emerald-200"><img src={stepMistWriteImg} alt="手紙を書く" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ボトルに思い出を託す</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">お相手の名前や当時の思い出、二人しか知らない『秘密の質問』を添えて、匿名でメッセージを静かに投稿します。</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold pt-2 border-t border-emerald-100">● 匿名で流せる安全設計</span>
              </div>
              <div className="bg-white/95 rounded-2xl border-2 border-sky-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2"><span className="text-xs font-bold text-sky-700 uppercase">STEP 02</span><span className="text-xs font-serif font-bold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200">【漂う】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-sky-200"><img src={stepMistDriftImg} alt="漂う" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ネットの海をめぐる</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">手紙は検索エンジンを通じてWebの海へ芽吹き、記憶をたどる「あの人」の検索窓で見つけられる日を静かに待ち続けます。</p>
                </div>
                <span className="text-[10px] text-sky-700 font-bold pt-2 border-t border-sky-100">● 検索に届くWeb最適化</span>
              </div>
              <div className="bg-white/95 rounded-2xl border-2 border-teal-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2"><span className="text-xs font-bold text-teal-700 uppercase">STEP 03</span><span className="text-xs font-serif font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">【届く】</span></div>
                  <div className="rounded-xl aspect-[16/10] overflow-hidden border border-teal-200"><img src={stepMistReconnectImg} alt="届く" className="w-full h-full object-cover" /></div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">奇跡の再会を果たす</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">見つけたお相手が思い出クイズに正解することで、初めて手紙が開き、手紙のやり取りやLINE等で直接つながれます。</p>
                </div>
                <span className="text-[10px] text-teal-700 font-bold pt-2 border-t border-teal-100">● 想いが通じ合う瞬間</span>
              </div>
            </div>
            <div className="text-center pt-1"><Link to="/guide" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-teal-900 border border-teal-300 rounded-xl text-xs font-bold hover:bg-teal-50"><BookOpen size={16} /> <span>ご利用ガイドを見る</span> <ArrowRight size={14} /></Link></div>

            {/* プライバシーと安全を守る 3つの堅牢な仕組み */}
            <div className="bg-gradient-to-r from-teal-50/60 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-teal-200 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-teal-900 text-xs font-bold font-serif"><ShieldCheck size={16} className="text-teal-700" /><span>プライバシーと安全を守る 3つの堅牢な仕組み</span></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><Lock size={16} className="text-teal-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">本名や詳細メッセージは非公開</h4><p className="text-[10.5px] text-slate-600 leading-normal">検索一覧には公的な手がかり情報のみ表示され、あなたの連絡先や秘密本文は守られます。</p></div></div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><Key size={16} className="text-sky-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">「秘密の質問」正解者のみ開示</h4><p className="text-[10.5px] text-slate-600 leading-normal">二人しか知らない思い出の回答を入力できた「本当の本人」だけがメッセージを開封できます。</p></div></div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2"><ShieldCheck size={16} className="text-indigo-700 shrink-0 mt-0.5" /><div><h4 className="text-xs font-bold text-slate-900">悪用・ストーカー完全防衛対策</h4><p className="text-[10.5px] text-slate-600 leading-normal">AI自動検閲フィルター・eKYC本人確認・24時間不適切通報制度により安全な環境を維持します。</p></div></div>
              </div>
              <div className="text-center pt-1"><Link to="/safety" className="inline-flex items-center gap-1.5 text-xs text-indigo-900 font-bold hover:underline"><ShieldCheck size={14} /> <span>安心・安全への取り組みについて詳しく見る →</span></Link></div>
            </div>
          </div>

          {/* 3. ボトルメール作成ダイレクトフォーム */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 border-2 border-teal-300 shadow-md text-left font-sans">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold"><PenTool size={13} /> <span>ボトルメール作成</span></span>
                <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 leading-relaxed">連絡先がわからなくなってしまった、あの人へ。<br /><span className="text-sky-900">ボトルメールを流してみませんか？</span></h3>
              </div>
              <form onSubmit={handleStartWriting} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-slate-700 block mb-1">姓</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="例：佐藤" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" /></div>
                  <div><label className="text-xs font-bold text-slate-700 block mb-1">名</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="例：花子" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" /></div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">お相手との関係性（カテゴリー）※任意選択</label>
                  <select value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer">
                    <option value="">選択してください</option>
                    {TRIGGER_CATEGORIES.map(c => <option key={c.category} value={c.category}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer">
                  <PenTool size={16} /><span>{fullTargetName ? `『${fullTargetName}』様へのボトルメールを書き始める` : 'このお名前でボトルメールを書き始める'}</span><ArrowRight size={16} />
                </button>
              </form>
              <p className="text-[11px] text-slate-500 text-center font-sans">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。</p>
            </div>
          </div>

          {/* 4. クイックナビ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            <Link to="/guide" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0"><BookOpen size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">ご利用マニュアル</span><span className="text-[10px] text-slate-500 block">検索〜開通までの流れ</span></div></Link>
            <Link to="/safety" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">安心・安全の取り組み</span><span className="text-[10px] text-slate-500 block">AI監視・eKYC本人確認</span></div></Link>
            <Link to="/pricing" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 shadow-2xs flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0"><CreditCard size={18} /></div><div><span className="text-xs font-bold text-slate-800 block">利用料金表（0円〜）</span><span className="text-[10px] text-slate-500 block">月額費用なし・明確料金</span></div></Link>
          </div>

          {/* 5. 奇跡の物語 */}
          <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-slate-200 pb-3">
              <div><span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Success Stories</span><h2 className="text-xl font-serif font-bold text-slate-900">ReMEETs がつないだ奇跡の物語</h2><p className="text-xs text-slate-600 font-serif">ボトルメールが届き、この海で再び巡り合えた方々からの声。</p></div>
              <Link to="/success-stories" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SUCCESS_STORIES.map((s, idx) => (
                <div key={s.id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 text-left shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">STORY #{String(idx + 1).padStart(2, '0')} / {s.tag}</span>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 line-clamp-2">「{s.title}」</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-5">{s.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. 統計情報 */}
          <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-white border border-teal-200 shadow-xs text-center">
            <div className="p-2 rounded-xl bg-teal-50/80"><span className="text-[10px] text-teal-800 font-bold block">流されたボトル</span><strong className="text-sm sm:text-base font-serif font-black text-teal-950">348 件</strong></div>
            <div className="p-2 rounded-xl bg-rose-50/80"><span className="text-[10px] text-rose-800 font-bold block">再会成功数</span><strong className="text-sm sm:text-base font-serif font-black text-rose-950">42 組</strong></div>
            <div className="p-2 rounded-xl bg-sky-50/80"><span className="text-[10px] text-sky-800 font-bold block">本日の投函</span><strong className="text-sm sm:text-base font-serif font-black text-sky-950">12 通</strong></div>
          </div>

          {/* 7. 漂うボトルメールギャラリー */}
          <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-teal-200 pb-3">
              <div><span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Bottle Mail Gallery</span><h2 className="text-xl font-serif font-bold text-slate-900">ネットの海に漂うみんなの想い</h2><p className="text-xs text-slate-600 font-sans">タップしてボトルを開けてみてください。自分と同じように、大切な人を探している一通が見つかります。</p></div>
              <Link to="/search" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_BOTTLES.map((b) => (
                <div key={b.id} onClick={() => setSelectedBottle(b)} className="p-5 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl space-y-3 cursor-pointer text-left shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">{b.era} / {b.relationship}</span><span className="text-[10px] text-slate-400 font-mono">{b.createdTime}</span></div>
                  <h3 className="text-base font-serif font-bold text-slate-900">{b.targetName} 様</h3>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">出会った場所: {b.location} / 「{b.excerpt}」</p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-teal-700 font-bold"><span>手紙を引出す</span> <ArrowRight size={12} /></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}


      {/* ════════════════════════════════════════════════════════════════════════════
          🖼️ 生成画像・素材アーカイブギャラリー
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'archive' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* ヘッダーカード */}
          <div className="relative rounded-3xl bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl overflow-hidden border border-violet-500/30 text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs font-mono font-bold">
                <ImageIcon size={13} />
                <span>RE-MEETS ASSET IMAGE ARCHIVE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
                ReMEETs 生成画像・アセットアーカイブ
              </h1>
              <p className="text-xs sm:text-sm text-violet-200/90 font-serif leading-relaxed max-w-3xl">
                これまでReMEETsのために生成・設計されたすべての高品質画像（HERO用、ステップ1〜3の各候補・別アングル・水彩画バリエーション等）を体系的にアーカイブ保存しています。
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-violet-300 font-mono">
                <span>● 総画像数: <strong>{ARCHIVED_IMAGE_GALLERY.length} 点</strong></span>
                <span>● 保存場所: <code>src/assets/images/archive/</code></span>
                <span className="text-emerald-300">● 腕3本等の不具合画像は除外済み</span>
              </div>
            </div>
          </div>

          {/* 画像グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARCHIVED_IMAGE_GALLERY.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-3xl border-2 border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* 画像プレビュー */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={img.src}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
                        {img.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm ${img.statusBg}`}>
                        {img.status}
                      </span>
                    </div>
                  </div>

                  {/* 詳細テキスト */}
                  <div className="p-5 space-y-2 text-left">
                    <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug">
                      {img.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {img.desc}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>比率: <strong>{img.aspect}</strong></span>
                  <span className="text-teal-700 font-bold">高精細フォト</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* モーダル */}
      <AnimatePresence>
        {selectedBottle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 relative shadow-2xl text-left font-sans">
              <button onClick={() => setSelectedBottle(null)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"><X size={18} /></button>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold inline-block">🍾 漂うボトルメールサンプル</span>
                <h3 className="text-lg font-serif font-bold text-slate-900">{selectedBottle.targetName} 様</h3>
                <div className="text-xs text-slate-500">年代: {selectedBottle.era} • 地域: {selectedBottle.location}</div>
              </div>
              <div className="space-y-1"><span className="text-xs font-bold text-slate-500">【メッセージ（手がかり一部）】</span><p className="text-xs sm:text-sm font-serif text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed italic">“{selectedBottle.excerpt}”</p></div>
              <div className="space-y-1 bg-amber-50 p-4 rounded-2xl border border-amber-200"><span className="text-xs font-bold text-amber-900 flex items-center gap-1.5"><Key size={14} className="text-amber-600" /> 思い出の質問（秘密のクイズ）</span><p className="text-xs text-amber-950">{selectedBottle.secretQuestion}</p></div>
              <button onClick={() => { setSelectedBottle(null); navigate('/create'); }} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"><span>自分もこの海に一通浮かべてみる 🍾</span> <ArrowRight size={16} /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConceptStoryModal isOpen={isConceptModalOpen} onClose={() => setIsConceptModalOpen(false)} />
    </div>
  );
};
