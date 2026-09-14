import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WaterRippleRainbowText } from './WaterRippleRainbowText';
import { WaterRippleImage } from './WaterRippleImage';
import heroBottleMail from '../assets/images/hero_small_ocean_no_bottle.jpg';
import stepMistWriteImg from '../assets/images/step_01_mist_ocean_close_1789154903956.jpg';
import stepMistDriftImg from '../assets/images/step_02_beach_arrival_1789155133509.jpg';
import stepMistReconnectImg from '../assets/images/step_03_mist_reconnect_1789154562729.jpg';
import { ConceptStoryModal } from './ConceptStoryModal';
import { EkycExplanationModal } from './posts/EkycExplanationModal';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Key, 
  ArrowRight, 
  BookOpen, 
  PenTool, 
  Search, 
  CreditCard
} from 'lucide-react';
import { getPostUrl } from '../lib/utils';

interface HomeVariantSub2OverlayProps {
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
    createdTime: '漂流 3日前',
  },
  {
    id: 'sample-2',
    targetName: '2005年 横浜 / 保健室のH先生へ',
    era: '2000年代',
    location: '神奈川県横浜市',
    relationship: '恩師・先生',
    excerpt: '学校に行けなかった時期、否定せずに話を聞いてくれた先生の優しさに救われました。私も今では小学校の教員になりました。',
    createdTime: '漂流 昨日',
  },
  {
    id: 'sample-3',
    targetName: '京都 軽音サークル 初恋のM先輩へ',
    era: '2010年代',
    location: '京都府京都市',
    relationship: 'サークル先輩',
    excerpt: '学園祭のステージで演奏したあの曲、今でもラジオから流れると先輩のことを思い出します。元気で歌っていますか？',
    createdTime: '漂流 5日前',
  },
  {
    id: 'sample-4',
    targetName: '平成初期 尾道 一緒に旅したバックパッカーのTさんへ',
    era: '1990年代',
    location: '広島県尾道市',
    relationship: '旅先での出会い',
    excerpt: '千光寺の展望台で夕日を見ながら夢を語り合いましたね。あの時いただいた言葉が今の私の支えです。',
    createdTime: '漂流 1週間前',
  }
];

const TRIGGER_CATEGORIES = [
  { category: 'friend', label: '昔の友人・幼馴染', icon: '🌸' },
  { category: 'school', label: '同窓生・同級生', icon: '🏫' },
  { category: 'teacher', label: '恩師・先生', icon: '📚' },
  { category: 'love', label: '初恋の人・元恋人', icon: '💌' },
  { category: 'work', label: '元同僚・お世話になった先輩', icon: '💼' },
  { category: 'travel', label: '旅先の一期一会', icon: '✈️' },
  { category: 'other', label: 'その他の大切な人', icon: '✨' },
];

export const HomeVariantSub2Overlay: React.FC<HomeVariantSub2OverlayProps> = ({
  onToggleDesign,
  recentPosts = [],
  onOpenConceptModal
}) => {
  const navigate = useNavigate();
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [showEkycExplanationModal, setShowEkycExplanationModal] = useState(false);

  const fullTargetName = `${lastName} ${firstName}`.trim();

  const handleStartWriting = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (lastName) params.set('lastName', lastName);
    if (firstName) params.set('firstName', firstName);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/create?${params.toString()}`);
  };

  const handleOpenConcept = () => {
    if (onOpenConceptModal) {
      onOpenConceptModal();
    } else {
      setIsConceptModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-4 sm:py-8 font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-4xl mx-auto px-3.5 sm:px-6">
        {/* 1. HERO - まわりの枠線いっぱいに広がる水面パノラマ一体型ヒーロー */}
        <div className="relative rounded-[36px] bg-gradient-to-b from-[#F0F7FB] via-[#E6F0F7] to-[#FFFFFF] p-3 sm:p-5 md:p-6 shadow-md border border-sky-300/70 overflow-hidden text-center space-y-6 cursor-bottle-mail">
          <div className="absolute inset-2.5 sm:inset-3.5 rounded-[28px] border border-sky-900/30 pointer-events-none z-20" />
          <div className="absolute inset-4 sm:inset-5 rounded-[24px] border border-dashed border-sky-800/20 pointer-events-none z-20" />

          <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
            {/* 🌟 枠線いっぱいに広がり下部まで切れないパノラマ水面イラスト × 文字一体キャンバス */}
            <div className="relative mx-auto w-full rounded-[24px] overflow-hidden border border-sky-200/90 shadow-md aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[340px] sm:min-h-[400px] md:min-h-[440px]">
              <WaterRippleImage 
                src={heroBottleMail} 
                alt="海とボトルメール" 
                positionY={0.92}
                enableBottleCursor={true}
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
              同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流したメッセージを、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
            </p>

            {/* コンセプトボタン */}
            <div className="flex justify-center pt-1">
              <button onClick={handleOpenConcept} className="px-6 py-2.5 bg-white/90 backdrop-blur-xs text-brand-dark border border-zinc-300 rounded-full text-xs font-serif font-bold shadow-2xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
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
                <Search size={16} className="text-sky-600" /> <span>自分宛てのメッセージを探す</span>
              </Link>
            </div>

            {/* 料金ポリシー */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 p-3 sm:p-4 shadow-sm space-y-2 text-left font-sans">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> ReMEETsの安心料金ポリシー</span>
                <Link to="/pricing" className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">料金表・詳細を見る →</Link>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">メッセージを書く・投函</span><strong className="text-xs sm:text-sm font-serif font-black text-emerald-600">完全0円</strong></div>
                <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200"><span className="text-[10px] text-emerald-800 font-bold block">メッセージを探す・閲覧</span><strong className="text-xs sm:text-sm font-black font-serif text-emerald-600">完全0円</strong></div>
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
                <div className="rounded-xl aspect-[16/10] overflow-hidden border border-emerald-200"><img src={stepMistWriteImg} alt="メッセージを書く" className="w-full h-full object-cover" /></div>
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
                <p className="text-xs text-slate-600 leading-relaxed font-sans">メッセージは検索エンジンを通じてWebの海へ芽吹き、記憶をたどる「あの人」の検索窓で見つけられる日を静かに待ち続けます。</p>
              </div>
              <span className="text-[10px] text-sky-700 font-bold pt-2 border-t border-sky-100">● 検索に届くWeb最適化</span>
            </div>
            <div className="bg-white/95 rounded-2xl border-2 border-teal-500/80 p-4 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-teal-100 pb-2"><span className="text-xs font-bold text-teal-700 uppercase">STEP 03</span><span className="text-xs font-serif font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">【届く】</span></div>
                <div className="rounded-xl aspect-[16/10] overflow-hidden border border-teal-200"><img src={stepMistReconnectImg} alt="届く" className="w-full h-full object-cover" /></div>
                <h3 className="font-serif font-bold text-slate-900 text-sm">奇跡の再会を果たす</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">見つけたお相手が思い出クイズに正解することで、初めてメッセージが開き、メッセージのやり取りやLINE等で直接つながれます。</p>
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
        <div className="p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-sky-50/30 border-2 border-teal-300 shadow-md text-left font-sans">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold"><PenTool size={13} /> <span>ボトルメール作成</span></span>
              <h3 className="font-serif font-bold text-slate-900 leading-snug sm:leading-relaxed text-center">
                <span className="block text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13.5px] sm:text-xl md:text-2xl whitespace-nowrap tracking-tighter min-[360px]:tracking-tight sm:tracking-normal">
                  連絡先がわからなくなってしまった、あの人へ。
                </span>
                <span className="block text-[12px] min-[360px]:text-[13.5px] min-[390px]:text-[15px] sm:text-2xl md:text-2xl text-sky-900 whitespace-nowrap mt-1 sm:mt-1.5">
                  ボトルメールを流してみませんか？
                </span>
              </h3>
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
            {DEFAULT_SUCCESS_STORIES.map((s, idx) => (
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

          {/* 🌈 公的確認マーク（eKYC）の安心ガイドバー */}
          <div className="bg-gradient-to-r from-sky-50/90 via-teal-50/80 to-indigo-50/90 border border-sky-200/80 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-left shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldCheck size={12} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
                <span className="text-[5px] font-black tracking-tighter uppercase -mt-0.5 text-white">eKYC済</span>
              </div>
              <div className="text-xs text-slate-700 leading-snug">
                <span className="font-bold text-sky-950">虹色の「公的確認」マーク</span>は、差出人が運転免許証等による本人確認を完了している<span className="font-bold text-teal-900">実在証明付きの安心なメッセージ</span>です。
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setShowEkycExplanationModal(true)} 
              className="shrink-0 text-[11px] font-bold text-sky-850 hover:text-sky-950 bg-white hover:bg-sky-50 border border-sky-300 px-3 py-1 rounded-full shadow-2xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 self-end sm:self-center"
            >
              <span>マークの意味・安心の仕組み</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(recentPosts && recentPosts.length > 0 ? recentPosts.slice(0, 4) : GALLERY_BOTTLES).map((b: any) => (
              <div 
                key={b.id} 
                onClick={() => navigate(getPostUrl(b))} 
                className="p-5 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl space-y-3 cursor-pointer text-left shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                      {b.era ? (b.era.toString().startsWith('19') ? b.era : `19${b.era}`) : '思い出'}年代 / {b.category === 'friend' ? '友人' : b.category === 'love' ? '初恋・恋人' : b.relationship || '大切な人'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{b.createdTime || '漂流中'}</span>
                  </div>

                  {/* 🌈 カード右上の動く虹色公的認証マーク（封蝋印：eKYC認証済みの場合のみ表示） */}
                  {Boolean(b.is_ekyc_verified) && (
                    <div className="flex flex-col items-center shrink-0 -mt-1 -mr-1" title="差出人は公的本人確認（eKYC）完了済み">
                      <div className="w-7 h-7 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-sm">
                        <ShieldCheck size={12} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                        <span className="text-[5px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">eKYC済</span>
                      </div>
                      <span className="mt-0.5 text-[7px] font-extrabold text-sky-950 bg-white/95 border border-sky-300 px-1.5 py-0.2 rounded-full shadow-2xs whitespace-nowrap">
                        公的確認
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-serif font-bold text-slate-900">{b.targetName || b.target_name} 様</h3>
                <p className="text-xs text-slate-600 font-sans line-clamp-2">
                  {b.location ? `出会った場所: ${b.location} / ` : ''}「{b.excerpt || b.message || '大切なメッセージが託されています'}」
                </p>
                <div className="pt-1 flex items-center gap-1 text-[10px] text-teal-700 font-bold">
                  <span>メッセージを引出す</span> <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Concept Story Modal */}
      <ConceptStoryModal 
        isOpen={isConceptModalOpen} 
        onClose={() => setIsConceptModalOpen(false)} 
      />

      {/* 🌈 公的本人確認（eKYC）安心説明モーダル */}
      <EkycExplanationModal 
        isOpen={showEkycExplanationModal} 
        onClose={() => setShowEkycExplanationModal(false)} 
      />
    </div>
  );
};
