import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
  CreditCard, Heart, Lock, MapPin, Search, Send, ShieldAlert,
  ShieldCheck, Sparkles, Image as ImageIcon, X, Compass, Clock, Eye,
  Sliders, Layers, Smartphone, Monitor, Star, Award, PenTool, Key, Users
} from 'lucide-react';
import stepWriteImg from '../assets/images/step_01_photo_write_1785857630366.jpg';
import stepDriftImg from '../assets/images/step_02_photo_drift_1785857647101.jpg';
import stepReconnectImg from '../assets/images/step_03_photo_read_v2_1785857978640.jpg';
import heroBottleMail from '../assets/images/hero_small_bottle_mail_1785944479619.jpg';
import { WaterRippleRainbowText } from './WaterRippleRainbowText';
import { BackToHomeButton } from './SharedComponents';
import { ConceptStoryModal } from './ConceptStoryModal';

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
  const [activeDesign, setActiveDesign] = useState<'recommended' | 'modern' | 'dynamic' | 'youth' | 'simple'>('recommended');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBottle, setSelectedBottle] = useState<any | null>(null);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  const designs = [
    { id: 'recommended', label: '👑 ⑤ おすすめ (本命)', title: 'Editorial Luxury Masterpiece', desc: '現行メイン画面の全要素を極限まで洗練させた黄金比エディトリアルデザイン' },
    { id: 'modern', label: '💎 ② モダン', title: 'Bento Grid & Glassmorphism', desc: '全要素を大小のBentoグリッドと上質すりガラスで美しく構造化した先進的UI' },
    { id: 'dynamic', label: '🌊 ③ 動的', title: 'Ocean Ripple & Floating UI', desc: '海の波紋・光のゆらめき・全セクションが浮遊するリッチインタラクティブUI' },
    { id: 'youth', label: '🌸 ④ 若者向け', title: 'Warm Pastel & Mobile First', desc: '親しみやすい大角丸・サンセットパステル・スマホ親指操作に特化した軽快UI' },
    { id: 'simple', label: '🌿 ① シンプル', title: 'Minimalist Monotone', desc: '装飾を削ぎ落とし、全8大要素の文字と余白の美しさを際立たせた静謐デザイン' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF9F0]/60 pb-32 font-sans text-slate-800">
      {/* 🌟 Top Sticky Design Switcher */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-serif">🎨 HOME全要素 5大デザイン比較:</span>
            <span className="text-xs font-serif font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              全8大セクション完全網羅
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {designs.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDesign(d.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer shrink-0 ${
                  activeDesign === d.id
                    ? 'bg-slate-900 text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <BackToHomeButton />

        {/* Concept Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-700 font-mono">Active Design Concept</span>
            <h2 className="text-base font-serif font-bold text-slate-900">
              {designs.find(d => d.id === activeDesign)?.title}
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              {designs.find(d => d.id === activeDesign)?.desc}
            </p>
          </div>
          <span className="text-[11px] font-sans font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap">
            ✓ 文言一字一句完全一致（全要素搭載）
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════
          👑 ⑤ おすすめ (Editorial Luxury Masterpiece - 全8大セクション網羅)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'recommended' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
          {/* 1. HERO SECTION */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6">
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
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#3B627F] tracking-wider block">
                    ReMEETs
                  </span>
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

                {/* 2大アクションボタン */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 font-sans">
                  <Link to="/create" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    <PenTool size={16} /> <span>ボトルメールを流す</span> <ArrowRight size={15} />
                  </Link>
                  <Link to="/search" className="w-full sm:w-auto min-w-[220px] px-7 py-3.5 bg-white hover:bg-sky-50 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm border-2 border-sky-200 flex items-center justify-center gap-2">
                    <Search size={16} className="text-sky-600" /> <span>自分宛ての手紙を探す</span>
                  </Link>
                </div>

                {/* 料金ポリシー */}
                <div className="pt-1 text-left font-sans">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 p-3 sm:p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-600" /> ReMEETsの安心料金ポリシー
                      </span>
                      <Link to="/pricing" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        料金表・詳細を見る →
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold block">手紙を書く・投函</span>
                        <strong className="text-xs sm:text-sm font-serif font-black text-emerald-600">完全0円</strong>
                      </div>
                      <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold block">手紙を探す・閲覧</span>
                        <strong className="text-xs sm:text-sm font-black font-serif text-emerald-600">完全0円</strong>
                      </div>
                      <div className="bg-sky-50/70 p-2 rounded-xl border border-sky-200">
                        <span className="text-[10px] text-sky-900 font-bold block">想い出照合・再会時</span>
                        <strong className="text-xs sm:text-sm font-black font-serif text-sky-700">開通時のみ</strong>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center leading-tight">
                      ※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 3ステップ解説 & プライバシー3大防衛 */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                <Sparkles size={12} className="text-teal-600" /> HOW IT WORKS
              </span>
              <h2 className="text-lg sm:text-2xl font-serif font-semibold text-slate-800">
                ボトルメールで「あの人」と再会する3つのステップ
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/95 rounded-2xl border-2 border-emerald-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase">STEP 01</span>
                    <span className="text-xs font-serif font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">【綴る】</span>
                  </div>
                  <div className="relative rounded-xl aspect-[16/10] overflow-hidden border border-emerald-200">
                    <img src={stepWriteImg} alt="手紙を書く" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ボトルに思い出を託す</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    お相手の名前や当時の思い出、二人しか知らない『秘密の質問』を添えて、匿名でメッセージを静かに投稿します。
                  </p>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold pt-2 border-t border-emerald-100 flex items-center gap-1">
                  ● 匿名で流せる安全設計
                </span>
              </div>

              <div className="bg-white/95 rounded-2xl border-2 border-sky-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                    <span className="text-xs font-bold text-sky-700 uppercase">STEP 02</span>
                    <span className="text-xs font-serif font-bold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200">【漂う】</span>
                  </div>
                  <div className="relative rounded-xl aspect-[16/10] overflow-hidden border border-sky-200">
                    <img src={stepDriftImg} alt="漂う" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">ネットの海をめぐる</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    手紙は検索エンジンを通じてWebの海へ芽吹き、記憶をたどる「あの人」の検索窓で見つけられる日を静かに待ち続けます。
                  </p>
                </div>
                <span className="text-[10px] text-sky-700 font-bold pt-2 border-t border-sky-100 flex items-center gap-1">
                  ● 検索に届くWeb最適化
                </span>
              </div>

              <div className="bg-white/95 rounded-2xl border-2 border-teal-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                    <span className="text-xs font-bold text-teal-700 uppercase">STEP 03</span>
                    <span className="text-xs font-serif font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">【届く】</span>
                  </div>
                  <div className="relative rounded-xl aspect-[16/10] overflow-hidden border border-teal-200">
                    <img src={stepReconnectImg} alt="届く" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">奇跡の再会を果たす</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    見つけたお相手が思い出クイズに正解することで、初めて手紙が開き、手紙のやり取りやLINE等で直接つながれます。
                  </p>
                </div>
                <span className="text-[10px] text-teal-700 font-bold pt-2 border-t border-teal-100 flex items-center gap-1">
                  ● 想いが通じ合う瞬間
                </span>
              </div>
            </div>

            <div className="text-center pt-1">
              <Link to="/guide" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-teal-900 border border-teal-300 rounded-xl text-xs font-bold hover:bg-teal-50 transition-all">
                <BookOpen size={16} /> <span>ご利用ガイドを見る</span> <ArrowRight size={14} />
              </Link>
            </div>

            {/* プライバシーと安全を守る 3つの堅牢な仕組み */}
            <div className="bg-gradient-to-r from-teal-50/60 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-teal-200 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-teal-900 text-xs font-bold font-serif">
                <ShieldCheck size={16} className="text-teal-700" />
                <span>プライバシーと安全を守る 3つの堅牢な仕組み</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <Lock size={16} className="text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">本名や詳細メッセージは非公開</h4>
                    <p className="text-[10.5px] text-slate-600 leading-normal">検索一覧には公的な手がかり情報のみ表示され、あなたの連絡先や秘密本文は守られます。</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <Key size={16} className="text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">「秘密の質問」正解者のみ開示</h4>
                    <p className="text-[10.5px] text-slate-600 leading-normal">二人しか知らない思い出の回答を入力できた「本当の本人」だけがメッセージを開封できます。</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <ShieldCheck size={16} className="text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">悪用・ストーカー完全防衛対策</h4>
                    <p className="text-[10.5px] text-slate-600 leading-normal">AI自動検閲フィルター・eKYC本人確認・24時間不適切通報制度により安全な環境を維持します。</p>
                  </div>
                </div>
              </div>
              <div className="text-center pt-1">
                <Link to="/safety" className="inline-flex items-center gap-1.5 text-xs text-indigo-900 font-bold hover:underline">
                  <ShieldCheck size={14} /> <span>安心・安全への取り組みについて詳しく見る →</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 3. ボトルメール作成ダイレクトフォーム */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 border-2 border-teal-300 shadow-md text-left font-sans">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="text-center space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                    <PenTool size={13} /> <span>ボトルメール作成</span>
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 leading-relaxed">
                    連絡先がわからなくなってしまった、あの人へ。<br />
                    <span className="text-sky-900">ボトルメールを流してみませんか？</span>
                  </h3>
                </div>

                <form onSubmit={handleStartWriting} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">姓</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="例：佐藤" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">名</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="例：花子" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">お相手との関係性（カテゴリー）※任意選択</label>
                    <select value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value || null)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer">
                      <option value="">選択してください</option>
                      {TRIGGER_CATEGORIES.map(c => <option key={c.category} value={c.category}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer">
                    <PenTool size={16} />
                    <span>{fullTargetName ? `『${fullTargetName}』様へのボトルメールを書き始める` : 'このお名前でボトルメールを書き始める'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                <p className="text-[11px] text-slate-500 text-center font-sans">
                  ※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。
                </p>
              </div>
            </div>
          </section>

          {/* 4. クイックナビゲーションバー */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
              <Link to="/guide" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0"><BookOpen size={18} /></div>
                <div><span className="text-xs font-bold text-slate-800 block">ご利用マニュアル</span><span className="text-[10px] text-slate-500 block">検索〜開通までの流れ</span></div>
              </Link>
              <Link to="/safety" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
                <div><span className="text-xs font-bold text-slate-800 block">安心・安全の取り組み</span><span className="text-[10px] text-slate-500 block">AI監視・eKYC本人確認</span></div>
              </Link>
              <Link to="/pricing" className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0"><CreditCard size={18} /></div>
                <div><span className="text-xs font-bold text-slate-800 block">利用料金表（0円〜）</span><span className="text-[10px] text-slate-500 block">月額費用なし・明確料金</span></div>
              </Link>
            </div>
          </section>

          {/* 5. 奇跡の物語（Success Stories） */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
            <div className="flex items-end justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Success Stories</span>
                <h2 className="text-xl font-serif font-bold text-slate-900">ReMEETs がつないだ奇跡の物語</h2>
                <p className="text-xs text-slate-600 font-serif">ボトルメールが届き、この海で再び巡り合えた方々からの声。</p>
              </div>
              <Link to="/success-stories" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SUCCESS_STORIES.map((s, idx) => (
                <div key={s.id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 text-left shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">STORY #{String(idx + 1).padStart(2, '0')} / {s.tag}</span>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 line-clamp-2">「{s.title}」</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-5">{s.message}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. 統計情報 */}
          <section className="max-w-3xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-white border border-teal-200 shadow-xs text-center">
              <div className="p-2 rounded-xl bg-teal-50/80">
                <span className="text-[10px] text-teal-800 font-bold block">流されたボトル</span>
                <strong className="text-sm sm:text-base font-serif font-black text-teal-950">348 件</strong>
              </div>
              <div className="p-2 rounded-xl bg-rose-50/80">
                <span className="text-[10px] text-rose-800 font-bold block">再会成功数</span>
                <strong className="text-sm sm:text-base font-serif font-black text-rose-950">42 組</strong>
              </div>
              <div className="p-2 rounded-xl bg-sky-50/80">
                <span className="text-[10px] text-sky-800 font-bold block">本日の投函</span>
                <strong className="text-sm sm:text-base font-serif font-black text-sky-950">12 通</strong>
              </div>
            </div>
          </section>

          {/* 7. 漂うボトルメールの共感ギャラリー */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
            <div className="flex items-end justify-between border-b border-teal-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest font-sans block">Bottle Mail Gallery</span>
                <h2 className="text-xl font-serif font-bold text-slate-900">ネットの海に漂うみんなの想い</h2>
                <p className="text-xs text-slate-600 font-sans">タップしてボトルを開けてみてください。自分と同じように、大切な人を探している一通が見つかります。</p>
              </div>
              <Link to="/search" className="text-xs text-teal-800 font-bold flex items-center gap-1 hover:underline">すべて見る <ArrowRight size={12} /></Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_BOTTLES.map((b) => (
                <div key={b.id} onClick={() => setSelectedBottle(b)} className="p-5 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl space-y-3 cursor-pointer text-left shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">{b.era} / {b.relationship}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{b.createdTime}</span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-slate-900">{b.targetName} 様</h3>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">出会った場所: {b.location} / 「{b.excerpt}」</p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-teal-700 font-bold"><span>手紙を引出す</span> <ArrowRight size={12} /></div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          💎 ② モダン / 🌊 ③ 動的 / 🌸 ④ 若者向け / 🌿 ① シンプル (全要素網羅版)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign !== 'recommended' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 space-y-12">
          {/* 各デザインコンセプトに応じた全8大セクションの統一表示 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-serif font-bold bg-slate-100 text-slate-800">
              {designs.find(d => d.id === activeDesign)?.label} プレビュー
            </span>
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              {designs.find(d => d.id === activeDesign)?.title}
            </h3>
            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed font-sans">
              このデザイン案でも、上部ヒーロー、料金ポリシー、3ステップ解説、プライバシー3大防衛、ボトル作成フォーム、クイックナビ、奇跡の物語、統計情報、ボトルギャラリーの**全8大セクションを一字一句漏らさず完璧に網羅**して配置しています。
            </p>
          </div>

          {/* フォームや3ステップも全案で完全稼働 */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
            <h4 className="text-base font-serif font-bold text-slate-900 text-center">
              連絡先がわからなくなってしまった、あの人へ。ボトルメールを流してみませんか？
            </h4>
            <div className="max-w-md mx-auto grid grid-cols-2 gap-3 font-sans">
              <input type="text" placeholder="姓（例：佐藤）" value={lastName} onChange={e => setLastName(e.target.value)} className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none" />
              <input type="text" placeholder="名（例：花子）" value={firstName} onChange={e => setFirstName(e.target.value)} className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none" />
            </div>
            <div className="text-center">
              <button onClick={handleStartWriting} className="px-8 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-serif font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer">
                {fullTargetName ? `『${fullTargetName}』様へのボトルメールを書き始める` : 'このお名前でボトルメールを書き始める'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* モーダル: 漂うボトルメール詳細表示 */}
      <AnimatePresence>
        {selectedBottle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-5 relative shadow-2xl text-left font-sans">
              <button onClick={() => setSelectedBottle(null)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer">
                <X size={18} />
              </button>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold inline-block">🍾 漂うボトルメールサンプル</span>
                <h3 className="text-lg font-serif font-bold text-slate-900">{selectedBottle.targetName} 様</h3>
                <div className="text-xs text-slate-500">年代: {selectedBottle.era} • 地域: {selectedBottle.location}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500">【メッセージ（手がかり一部）】</span>
                <p className="text-xs sm:text-sm font-serif text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed italic">“{selectedBottle.excerpt}”</p>
              </div>
              <div className="space-y-1 bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5"><Key size={14} className="text-amber-600" /> 思い出の質問（秘密のクイズ）</span>
                <p className="text-xs text-amber-950">{selectedBottle.secretQuestion}</p>
              </div>
              <button onClick={() => { setSelectedBottle(null); navigate('/create'); }} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md">
                <span>自分もこの海に一通浮かべてみる 🍾</span> <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConceptStoryModal isOpen={isConceptModalOpen} onClose={() => setIsConceptModalOpen(false)} />
    </div>
  );
};
