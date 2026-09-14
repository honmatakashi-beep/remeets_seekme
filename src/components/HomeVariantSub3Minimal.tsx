import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConceptStoryModal } from './ConceptStoryModal';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  BookOpen,
  PenTool,
  Search,
  CreditCard,
  PenLine,
  Waves,
  MailOpen,
  X,
  Clock,
  Heart,
  MapPin,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { getPostUrl } from '../lib/utils';

interface HomeVariantSub3MinimalProps {
  onToggleDesign?: () => void;
  recentPosts?: any[];
  onOpenConceptModal?: () => void;
}

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
    excerpt: '卒業ライブの日に渡せなかったメッセージがずっと部屋にありました。またあのギターの音色が聴きたいです。',
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

export const HomeVariantSub3Minimal: React.FC<HomeVariantSub3MinimalProps> = ({
  onToggleDesign,
  recentPosts,
  onOpenConceptModal
}) => {
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

  const displayBottles = (recentPosts && recentPosts.length > 0) ? recentPosts.slice(0, 4) : GALLERY_BOTTLES;

  return (
    <div className="min-h-screen bg-[#FDF9F0]/60 pb-32 font-sans text-slate-800 selection:bg-teal-100 selection:text-teal-900">
      {/* 🌟 Sub3: Minimalist Monotone & Serenity */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* 1. HERO */}
        <div className="py-8 text-center space-y-5 border-b border-slate-200 pb-12">
          <span className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-widest block">ReMEETs</span>
          <span className="text-xs font-sans text-slate-500 tracking-[0.3em] uppercase block font-mono">〜再会のボトルメール〜</span>
          <h1 className="text-lg md:text-2xl font-serif text-slate-800 font-bold leading-relaxed pt-2">あの日言えなかった想いを、あの人へ。<br/>再会のボトルメール</h1>
          <p className="text-xs md:text-sm text-slate-600 font-serif leading-loose max-w-2xl mx-auto">
            同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流したメッセージを、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
          </p>
          <div className="flex justify-center pt-2">
            <button 
              onClick={() => {
                if (onOpenConceptModal) onOpenConceptModal();
                else setIsConceptModalOpen(true);
              }} 
              className="px-6 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-serif font-bold rounded-full hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              ボトルメールが届ける再会の奇跡
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 font-sans">
            <Link to="/create" className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm">
              <PenTool size={14} /><span>ボトルメールを流す</span>
            </Link>
            <Link to="/search" className="px-8 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-serif font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm">
              <Search size={14} /><span>自分宛てのメッセージを探す</span>
            </Link>
          </div>

          {/* 料金ポリシー */}
          <div className="max-w-2xl mx-auto pt-6 text-xs text-left font-sans space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5"><ShieldCheck size={16} /> ReMEETsの安心料金ポリシー</span>
              <Link to="/pricing" className="text-[10px] text-slate-600 hover:underline">料金表・詳細を見る →</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-center"><span className="text-[10px] text-slate-400 block">メッセージを書く・投函</span><strong className="font-serif text-slate-900">完全0円</strong></div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-center"><span className="text-[10px] text-slate-400 block">メッセージを探す・閲覧</span><strong className="font-serif text-slate-900">完全0円</strong></div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-center"><span className="text-[10px] text-slate-400 block">想い出照合・再会時</span><strong className="font-serif text-slate-900">開通時のみ 600円</strong></div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）</p>
          </div>
        </div>

        {/* 2. 3ステップ & プライバシー3大防衛 */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">HOW IT WORKS</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">ボトルメールで「あの人」と再会する3つのステップ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative p-7 bg-white border border-slate-200 rounded-xl space-y-4 flex flex-col justify-between overflow-hidden min-h-[220px] shadow-sm">
              {/* 右下の透かしアイコン (STEP 01: 綴る - 便箋とペン) */}
              <div className="absolute -bottom-3 -right-3 text-slate-900/[0.13] pointer-events-none select-none">
                <PenLine size={115} strokeWidth={1.3} />
              </div>
              <div className="relative z-10 space-y-3">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">STEP 01</span>
                  <span className="text-xs font-serif font-bold text-slate-700">【綴る】</span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">ボトルに思い出を託す</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  お相手の名前や当時の思い出、二人しか知らない『秘密の質問』を添えて、匿名でメッセージを静かに投稿します。
                </p>
              </div>
              <span className="relative z-10 text-[10px] text-slate-400 font-bold pt-3 border-t border-slate-100 block">● 匿名で流せる安全設計</span>
            </div>

            <div className="relative p-7 bg-white border border-slate-200 rounded-xl space-y-4 flex flex-col justify-between overflow-hidden min-h-[220px] shadow-sm">
              {/* 右下の透かしアイコン (STEP 02: 漂う - 海・波) */}
              <div className="absolute -bottom-3 -right-3 text-slate-900/[0.13] pointer-events-none select-none">
                <Waves size={115} strokeWidth={1.3} />
              </div>
              <div className="relative z-10 space-y-3">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">STEP 02</span>
                  <span className="text-xs font-serif font-bold text-slate-700">【漂う】</span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">ネットの海をめぐる</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  メッセージは検索エンジンを通じてWebの海へ芽吹き、記憶をたどる「あの人」の検索窓で見つけられる日を静かに待ち続けます。
                </p>
              </div>
              <span className="relative z-10 text-[10px] text-slate-400 font-bold pt-3 border-t border-slate-100 block">● 検索に届くWeb最適化</span>
            </div>

            <div className="relative p-7 bg-white border border-slate-200 rounded-xl space-y-4 flex flex-col justify-between overflow-hidden min-h-[220px] shadow-sm">
              {/* 右下の透かしアイコン (STEP 03: 届く - 開封されるメッセージ) */}
              <div className="absolute -bottom-3 -right-3 text-slate-900/[0.13] pointer-events-none select-none">
                <MailOpen size={115} strokeWidth={1.3} />
              </div>
              <div className="relative z-10 space-y-3">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">STEP 03</span>
                  <span className="text-xs font-serif font-bold text-slate-700">【届く】</span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">奇跡の再会を果たす</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  見つけたお相手が思い出クイズに正解することで、初めてメッセージが開き、メッセージのやり取りやLINE等で直接つながれます。
                </p>
              </div>
              <span className="relative z-10 text-[10px] text-slate-400 font-bold pt-3 border-t border-slate-100 block">● 想いが通じ合う瞬間</span>
            </div>
          </div>
          <div className="text-center pt-1">
            <Link to="/guide" className="inline-flex items-center gap-1.5 px-6 py-2 border border-slate-300 rounded-lg text-xs font-serif text-slate-800 hover:bg-slate-50 font-sans shadow-sm">
              <BookOpen size={14} /> <span>ご利用ガイドを見る</span> <ArrowRight size={12} />
            </Link>
          </div>

          {/* プライバシー3大防衛 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 font-sans shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs"><ShieldCheck size={16} /><span>プライバシーと安全を守る 3つの堅牢な仕組み</span></div>
              <Link to="/safety" className="text-xs text-slate-600 hover:underline">安心・安全への取り組みについて詳しく見る →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1"><strong className="text-slate-900 block font-serif">① 本名や詳細メッセージは非公開</strong><p className="text-[11px] text-slate-600">検索一覧には公的な手がかり情報のみ表示され、あなたの連絡先や秘密本文は守られます。</p></div>
              <div className="space-y-1"><strong className="text-slate-900 block font-serif">② 「秘密の質問」正解者のみ開示</strong><p className="text-[11px] text-slate-600">二人しか知らない思い出の回答を入力できた「本当の本人」だけがメッセージを開封できます。</p></div>
              <div className="space-y-1"><strong className="text-slate-900 block font-serif">③ 悪用・ストーカー完全防衛対策</strong><p className="text-[11px] text-slate-600">AI自動検閲フィルター・eKYC本人確認・24時間不適切通報制度により安全な環境を維持します。</p></div>
            </div>
          </div>
        </div>

        {/* 3. フォーム */}
        <div className="p-5 sm:p-8 bg-slate-100 rounded-2xl space-y-4 font-sans border border-slate-200 shadow-sm">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest font-mono">Create Bottle Mail</span>
            <h3 className="font-serif font-bold text-slate-900 leading-snug sm:leading-relaxed text-center">
              <span className="block text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13.5px] sm:text-xl md:text-2xl whitespace-nowrap tracking-tighter min-[360px]:tracking-tight sm:tracking-normal">
                連絡先がわからなくなってしまった、あの人へ。
              </span>
              <span className="block text-[12px] min-[360px]:text-[13.5px] min-[390px]:text-[15px] sm:text-2xl md:text-2xl text-slate-900 whitespace-nowrap mt-1 sm:mt-1.5">
                ボトルメールを流してみませんか？
              </span>
            </h3>
          </div>
          <form onSubmit={handleStartWriting} className="max-w-md mx-auto space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-bold text-slate-700 block mb-1">姓</label><input type="text" placeholder="例：佐藤" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-slate-600" /></div>
              <div><label className="text-xs font-bold text-slate-700 block mb-1">名</label><input type="text" placeholder="例：花子" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-slate-600" /></div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">お相手との関係性（カテゴリー）※任意選択</label>
              <select value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value || null)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none cursor-pointer">
                <option value="">選択してください</option>
                {TRIGGER_CATEGORIES.map(c => <option key={c.category} value={c.category}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-serif font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
              <PenTool size={14} /><span>{fullTargetName ? `『${fullTargetName}』様へのボトルメールを書き始める` : 'このお名前でボトルメールを書き始める'}</span>
            </button>
          </form>
          <p className="text-[11px] text-slate-500 text-center">※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。</p>
        </div>

        {/* 4. クイックナビ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
          <Link to="/guide" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 flex items-center gap-3 transition-all shadow-sm"><BookOpen size={18} className="text-slate-700" /><div><strong className="text-xs block text-slate-800">ご利用マニュアル</strong><span className="text-[10px] text-slate-500">検索〜開通までの流れ</span></div></Link>
          <Link to="/safety" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 flex items-center gap-3 transition-all shadow-sm"><ShieldCheck size={18} className="text-slate-700" /><div><strong className="text-xs block text-slate-800">安心・安全の取り組み</strong><span className="text-[10px] text-slate-500">AI監視・eKYC本人確認</span></div></Link>
          <Link to="/pricing" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 flex items-center gap-3 transition-all shadow-sm"><CreditCard size={18} className="text-slate-700" /><div><strong className="text-xs block text-slate-800">利用料金表（0円〜）</strong><span className="text-[10px] text-slate-500">月額費用なし・明確料金</span></div></Link>
        </div>

        {/* 5. 奇跡の物語 */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-slate-200 pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Success Stories</span>
              <h2 className="text-xl font-serif font-bold text-slate-900">ReMEETs がつないだ奇跡の物語</h2>
              <p className="text-xs text-slate-600 font-serif">ボトルメールが届き、この海で再び巡り合えた方々からの声。</p>
            </div>
            <Link to="/success-stories" className="text-xs text-slate-700 font-bold hover:underline">すべて見る →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEFAULT_SUCCESS_STORIES.map((s, idx) => (
              <div key={s.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-2 text-left shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 font-mono">STORY #{String(idx + 1).padStart(2, '0')} / {s.tag}</span>
                <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900">「{s.title}」</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{s.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 統計情報 */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-white border border-slate-200 rounded-xl text-center font-sans shadow-sm">
          <div className="p-2"><span className="text-xs text-slate-400 block">流されたボトル</span><strong className="text-base font-serif font-bold text-slate-900">348 件</strong></div>
          <div className="p-2 border-x border-slate-100"><span className="text-xs text-slate-400 block">再会成功数</span><strong className="text-base font-serif font-bold text-slate-900">42 組</strong></div>
          <div className="p-2"><span className="text-xs text-slate-400 block">本日の投函</span><strong className="text-base font-serif font-bold text-slate-900">12 通</strong></div>
        </div>

        {/* 7. ギャラリー */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-slate-200 pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Bottle Mail Gallery</span>
              <h2 className="text-xl font-serif font-bold text-slate-900">ネットの海に漂うみんなの想い</h2>
              <p className="text-xs text-slate-600 font-sans">タップしてボトルを開けてみてください。自分と同じように、大切な人を探している一通が見つかります。</p>
            </div>
            <Link to="/search" className="text-xs text-slate-700 font-bold hover:underline">すべて見る →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayBottles.map((b: any) => {
              const targetName = b.target_name || b.targetName || '大切なあの人';
              const era = b.target_era || b.era || '昔の思い出';
              const rel = b.target_relationship || b.relationship || '大切なご関係';
              const location = b.target_location || b.location || 'ゆかりの地';
              const excerpt = b.message ? (b.message.length > 50 ? b.message.substring(0, 50) + '...' : b.message) : (b.excerpt || '想い出のボトルメールです');
              const bottleUrl = b.id ? getPostUrl(b) : '/search';

              return (
                <div 
                  key={b.id} 
                  onClick={() => setSelectedBottle(b)} 
                  className="p-5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl space-y-2 cursor-pointer transition-all text-left shadow-sm hover:shadow-md"
                >
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{era} / {rel}</span>
                  <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900">{targetName} 様</h3>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">出会った場所: {location} / 「{excerpt}」</p>
                  <div className="pt-1 text-[10px] text-slate-700 font-serif flex items-center gap-1 font-bold">
                    <span>メッセージを引き出す</span> <ArrowRight size={10} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ボトル詳細プレビューモーダル */}
      <AnimatePresence>
        {selectedBottle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-400">BOTTLE MAIL PREVIEW</span>
                    <h3 className="text-lg font-serif font-bold text-slate-900">
                      {selectedBottle.target_name || selectedBottle.targetName} 様 宛て
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedBottle(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={13} />
                    <span>場所: {selectedBottle.target_location || selectedBottle.location || '非公開'}</span>
                    <span className="mx-1">•</span>
                    <Clock size={13} />
                    <span>年代: {selectedBottle.target_era || selectedBottle.era || '非公開'}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-serif leading-relaxed italic">
                    「{selectedBottle.message || selectedBottle.excerpt}」
                  </p>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
                  <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-amber-900 block">秘密の思い出クイズ</span>
                    <p className="text-[11px] text-amber-800/90 font-sans">
                      {selectedBottle.secret_question || selectedBottle.secretQuestion || '「あの時、一緒に見た映画のタイトルは？」'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      const url = selectedBottle.id ? getPostUrl(selectedBottle) : '/search';
                      setSelectedBottle(null);
                      navigate(url);
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-serif font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>このメッセージのクイズに答えて開封する</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => setSelectedBottle(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-serif font-bold rounded-xl transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* コンセプトストーリーモーダル */}
      <ConceptStoryModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
      />
    </div>
  );
};
