import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
  CreditCard, Heart, Lock, MapPin, Search, Send, ShieldAlert,
  ShieldCheck, Sparkles, Image as ImageIcon, X, Compass, Clock, Eye,
  Sliders, Layers, Smartphone, Monitor, Star, Award, Compass as CompassIcon
} from 'lucide-react';
import stepWriteImg from '../assets/images/step_01_photo_write_1785857630366.jpg';
import stepDriftImg from '../assets/images/step_02_photo_drift_1785857647101.jpg';
import stepReconnectImg from '../assets/images/step_03_photo_read_v2_1785857978640.jpg';
import heroBottleMail from '../assets/images/hero_bottle_mail_1785941809474.jpg';
import { BackToHomeButton } from './SharedComponents';

export const HomeDesignShowroom = () => {
  const [activeDesign, setActiveDesign] = useState<'simple' | 'modern' | 'dynamic' | 'youth' | 'recommended'>('recommended');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const designs = [
    { id: 'simple', label: '① シンプル', icon: '🌿', title: 'Minimalist Clean', desc: '余白の美学・無駄のない洗練と高い可読性' },
    { id: 'modern', label: '② モダン', icon: '💎', title: 'Bento Grid & Glass', desc: '最新Bentoカード × 上質すりガラス' },
    { id: 'dynamic', label: '③ 動的', icon: '🌊', title: 'Ocean Motion', desc: '海の波紋・光のゆらめき・情緒的インタラクション' },
    { id: 'youth', label: '④ 若者向け', icon: '🌸', title: 'Warm Pastel SNS', desc: '親しみやすい丸み × スマホ親指操作特化' },
    { id: 'recommended', label: '⑤ おすすめ (最高傑作)', icon: '👑', title: 'Editorial Luxury', desc: '文芸誌のような格調高さと計算された黄金比UX' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
    else navigate('/search');
  };

  return (
    <div className="min-h-screen bg-[#FDF9F0]/60 pb-28 font-sans">
      {/* 🌟 Top Sticky Design Switcher Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3 px-4 transition-all">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-serif">🎨 デザイン比較ビューア:</span>
            <span className="text-xs font-serif font-bold text-brand-dark bg-brand-light px-2 py-0.5 rounded-full">
              {designs.find(d => d.id === activeDesign)?.label}
            </span>
          </div>

          {/* Tab Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {designs.map((d) => {
              const isActive = activeDesign === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDesign(d.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-brand-dark text-white shadow-md scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black'
                  }`}
                >
                  <span>{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <BackToHomeButton />
        
        {/* Design Description Box */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Current Concept</span>
            <h2 className="text-base font-serif font-bold text-brand-dark flex items-center gap-2">
              <span>{designs.find(d => d.id === activeDesign)?.icon}</span>
              <span>{designs.find(d => d.id === activeDesign)?.title}</span>
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              {designs.find(d => d.id === activeDesign)?.desc}
            </p>
          </div>
          <span className="text-[11px] font-serif font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full hidden sm:inline-block">
            全テキスト・文言完全固定
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════
          1. 🌿 シンプル (Minimalist Clean)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'simple' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 space-y-16">
          {/* Hero */}
          <div className="py-12 text-center space-y-6 border-b border-slate-200 pb-16">
            <div className="space-y-2">
              <span className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-widest block">
                ReMEETs
              </span>
              <span className="text-xs md:text-sm font-sans text-slate-500 tracking-[0.3em] uppercase block">
                〜再会のボトルメール〜
              </span>
            </div>

            <div className="py-2">
              <h1 className="text-lg md:text-2xl font-serif text-slate-800 font-bold leading-relaxed">
                あの日言えなかった想いを、あの人へ。<br/>再会のボトルメール
              </h1>
            </div>

            <p className="text-xs md:text-sm text-slate-600 font-serif leading-loose max-w-2xl mx-auto">
              同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link to="/create" className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-serif font-bold rounded-lg transition-all text-center">
                ボトルメールを流す（無料）
              </Link>
              <button onClick={() => {}} className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-serif font-bold rounded-lg transition-all text-center">
                ボトルメールが届ける再会の奇跡
              </button>
            </div>

            {/* Zero Yen Policy */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-sans">手紙を書く・投函</span>
                <strong className="text-slate-900 font-serif font-bold">完全0円</strong>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-sans">手紙を探す・閲覧</span>
                <strong className="text-slate-900 font-serif font-bold">完全0円</strong>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-sans">想い出照合・再会時</span>
                <strong className="text-slate-900 font-serif font-bold">開通時のみ</strong>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-sans text-center">
              ※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。
            </p>
          </div>

          {/* 3 Step Flow */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-serif font-bold text-slate-900">
                ボトルメールで「あの人」と再会する3つのステップ
              </h3>
              <p className="text-xs text-slate-500 font-sans">想いを残すシンプルな流れ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-serif font-bold text-slate-400">STEP 01</span>
                <h4 className="text-sm font-serif font-bold text-slate-900">【手紙を書く】ボトルに思い出を託す</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  お相手のお名前と、お二人しか知らない「思い出の質問（クイズ）」を設定して投稿します。
                </p>
              </div>
              <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-serif font-bold text-slate-400">STEP 02</span>
                <h4 className="text-sm font-serif font-bold text-slate-900">【漂う】ネットの海をめぐる</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  誰かが探すその日まで、プライバシーを守りながら安全な海（Web）に静かに漂います。
                </p>
              </div>
              <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-serif font-bold text-slate-400">STEP 03</span>
                <h4 className="text-sm font-serif font-bold text-slate-900">【届く】思い出クイズで再会</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  お相手が検索で見つけ、思い出クイズに正解すると手紙が開き、直接つながれます。
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-8 bg-slate-100 rounded-2xl text-center space-y-4">
            <h4 className="text-sm font-serif font-bold text-slate-900">
              自分宛ての手紙（ボトルメール）が届いていないか探す（検索・閲覧 無料）
            </h4>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="お名前（フルネーム）を入力して検索（例: 山田太郎）"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 outline-none"
              />
              <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white text-xs font-serif font-bold rounded-lg">
                検索
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          2. 💎 モダン (Modern Bento Grid & Glassmorphism)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'modern' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-4 space-y-8">
          {/* Bento Grid Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Bento 1: Main Brand & CTA (8 cols) */}
            <div className="lg:col-span-8 p-8 md:p-10 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/20">
                    ✨ ReMEETs Official
                  </span>
                  <span className="text-xs text-slate-400 font-sans">〜再会のボトルメール〜</span>
                </div>
                
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                  あの日言えなかった想いを、<br/>あの人へ。再会のボトルメール
                </h1>

                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                  同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
                </p>
              </div>

              <div className="pt-8 flex flex-wrap items-center gap-3">
                <Link to="/create" className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white rounded-2xl text-xs font-bold font-sans shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  <Send size={15} />
                  <span>ボトルメールを流す（無料）</span>
                </Link>
                <button onClick={() => {}} className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold font-sans transition-all">
                  ボトルメールが届ける再会の奇跡
                </button>
              </div>
            </div>

            {/* Bento 2: Policy & Telemetry (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-teal-400 font-bold font-sans">Zero Cost Policy</span>
                <h3 className="text-base font-serif font-bold text-white">ReMEETsの安心料金ポリシー</h3>
                
                <div className="space-y-2 pt-2 text-xs font-sans">
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/10">
                    <span className="text-slate-300">手紙を書く・投函</span>
                    <strong className="text-teal-300 font-serif font-bold">完全0円</strong>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/10">
                    <span className="text-slate-300">手紙を探す・閲覧</span>
                    <strong className="text-teal-300 font-serif font-bold">完全0円</strong>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/10">
                    <span className="text-slate-300">想い出照合・再会時</span>
                    <strong className="text-amber-300 font-serif font-bold">開通時のみ</strong>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                ※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。
              </p>
            </div>

            {/* Bento 3: Search Bar (12 cols) */}
            <div className="lg:col-span-12 p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-left w-full md:w-auto">
                <span className="text-[10px] font-bold text-teal-700 uppercase font-sans">Search Bottle Mail</span>
                <h4 className="text-sm font-serif font-bold text-slate-900">
                  自分宛ての手紙（ボトルメール）が届いていないか探す（検索・閲覧 無料）
                </h4>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="お名前（フルネーム）を入力して検索（例: 山田太郎）"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
                <button type="submit" className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0">
                  検索
                </button>
              </form>
            </div>

            {/* Bento 4: 3 Steps Bento Grid (4 cols x 3) */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-teal-600 font-mono">01. WRITE</span>
              <h4 className="text-sm font-serif font-bold text-slate-900">STEP 01【手紙を書く】ボトルに思い出を託す</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                お相手のお名前と、お二人しか知らない「思い出の質問（クイズ）」を設定して投稿します。
              </p>
            </div>

            <div className="lg:col-span-4 p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-sky-600 font-mono">02. DRIFT</span>
              <h4 className="text-sm font-serif font-bold text-slate-900">STEP 02【漂う】ネットの海をめぐる</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                誰かが探すその日まで、プライバシーを守りながら安全な海（Web）に静かに漂います。
              </p>
            </div>

            <div className="lg:col-span-4 p-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-emerald-600 font-mono">03. RECONNECT</span>
              <h4 className="text-sm font-serif font-bold text-slate-900">STEP 03【届く】思い出クイズで再会</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                お相手が検索で見つけ、思い出クイズに正解すると手紙が開き、直接つながれます。
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          3. 🌊 動的 (Dynamic Ocean Motion & Ripple)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'dynamic' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 space-y-12">
          {/* Animated Wave Card */}
          <div className="relative rounded-[36px] bg-gradient-to-b from-[#1A365D] via-[#2A4365] to-[#1E3A8A] text-white p-8 md:p-14 shadow-2xl overflow-hidden text-center space-y-6">
            
            {/* Background Animated Ripples */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-teal-400 blur-3xl"
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-indigo-400 blur-3xl"
              />
            </div>

            <div className="relative z-10 space-y-4">
              <span className="text-xs uppercase tracking-[0.4em] text-teal-300 font-sans font-bold block">
                ReMEETs 〜再会のボトルメール〜
              </span>

              <h1 className="text-2xl md:text-4xl font-serif font-bold text-white leading-relaxed drop-shadow-md">
                あの日言えなかった想いを、あの人へ。<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-sky-200 to-amber-200">
                  再会のボトルメール
                </span>
              </h1>

              <p className="text-xs md:text-sm text-slate-200 font-serif leading-loose max-w-2xl mx-auto opacity-90">
                同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
              </p>

              {/* Action Buttons */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/create" 
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-slate-950 font-sans font-bold text-sm rounded-full shadow-lg hover:shadow-teal-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  <span>ボトルメールを流す（無料）</span>
                </Link>
                <button 
                  onClick={() => {}}
                  className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-sans font-bold text-sm rounded-full transition-all"
                >
                  ボトルメールが届ける再会の奇跡
                </button>
              </div>

              {/* Zero-yen Policy Floating Card */}
              <div className="pt-8 max-w-xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-xs font-sans space-y-2 text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-teal-300 font-bold flex items-center gap-1.5">
                      <ShieldCheck size={16} /> ReMEETsの安心料金ポリシー
                    </span>
                    <span className="text-[10px] text-slate-300">月額費用 0円</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-slate-300 block">手紙を書く・投函</span>
                      <strong className="text-teal-300 font-serif font-bold text-xs">完全0円</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-slate-300 block">手紙を探す・閲覧</span>
                      <strong className="text-teal-300 font-serif font-bold text-xs">完全0円</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-slate-300 block">想い出照合・再会時</span>
                      <strong className="text-amber-300 font-serif font-bold text-xs">開通時のみ</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-300 text-center pt-1">
                    ※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          4. 🌸 若者向け (Warm Pastel SNS & Mobile-First)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'youth' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto px-4 space-y-6">
          {/* Card 1: Main Story Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-md border border-rose-100 space-y-5 text-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
              <Sparkles size={13} /> ReMEETs 〜再会のボトルメール〜
            </div>

            <h1 className="text-xl font-serif font-bold text-slate-900 leading-snug">
              あの日言えなかった想いを、<br/>あの人へ。再会のボトルメール
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed font-sans text-left bg-rose-50/40 p-4 rounded-2xl border border-rose-100/60">
              同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
            </p>

            <Link 
              to="/create" 
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 block"
            >
              <Send size={16} />
              <span>ボトルメールを流す（無料）</span>
            </Link>

            <button onClick={() => {}} className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
              ボトルメールが届ける再会の奇跡
            </button>
          </div>

          {/* Card 2: Quick Search */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Search size={15} className="text-rose-500" />
              <span>自分宛ての手紙（ボトルメール）が届いていないか探す</span>
            </span>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="お名前（フルネーム）を入力して検索（例: 山田太郎）"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">
                検索
              </button>
            </form>
          </div>

          {/* Card 3: 3 Steps */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3 font-sans">
            <span className="text-xs font-bold text-slate-800 block">
              ボトルメールで「あの人」と再会する3つのステップ
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-50/50 rounded-2xl">
                <strong className="text-amber-800 block font-bold">STEP 01【手紙を書く】ボトルに思い出を託す</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">お相手のお名前と、お二人しか知らない「思い出の質問（クイズ）」を設定して投稿します。</p>
              </div>
              <div className="p-3 bg-sky-50/50 rounded-2xl">
                <strong className="text-sky-800 block font-bold">STEP 02【漂う】ネットの海をめぐる</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">誰かが探すその日まで、プライバシーを守りながら安全な海（Web）に静かに漂います。</p>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-2xl">
                <strong className="text-emerald-800 block font-bold">STEP 03【届く】思い出クイズで再会</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">お相手が検索で見つけ、思い出クイズに正解すると手紙が開き、直接つながれます。</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          5. 👑 おすすめ (Editorial Luxury Storytelling - 最高傑作)
         ════════════════════════════════════════════════════════════════════════════ */}
      {activeDesign === 'recommended' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 space-y-12">
          
          {/* Master Hero Card: 高級アンティーク二重装飾 & 黄金比エディトリアル */}
          <div className="relative rounded-[36px] bg-gradient-to-br from-white via-[#FCFBF9] to-[#F4F6F5] p-8 md:p-14 border-2 border-slate-900/90 shadow-xl overflow-hidden text-center space-y-6">
            
            {/* Antique Double Frame Line */}
            <div className="absolute inset-3 rounded-[28px] border border-slate-800/80 pointer-events-none z-10" />
            <div className="absolute inset-5 rounded-[24px] border border-dashed border-slate-800/40 pointer-events-none z-10" />

            {/* Botanical Corner Ornaments */}
            <svg className="absolute top-3 left-3 w-12 h-12 text-slate-900/90 pointer-events-none z-20" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
              <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
              <circle cx="28" cy="28" r="2" fill="currentColor" />
            </svg>
            <svg className="absolute top-3 right-3 w-12 h-12 text-slate-900/90 pointer-events-none z-20 scale-x-[-1]" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6,54 C6,24 24,6 54,6" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6,40 C14,40 22,32 22,22 C22,12 12,12 6,20" strokeWidth="1.2" />
              <path d="M22,6 C22,14 30,22 40,22 C50,22 50,12 42,6" strokeWidth="1.2" />
              <circle cx="28" cy="28" r="2" fill="currentColor" />
            </svg>

            {/* Background Ocean Illustration */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none z-0 opacity-40">
              <img src={heroBottleMail} alt="海" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10 space-y-4">
              <span className="text-3xl md:text-5xl font-serif font-bold text-[#2C4F6B] tracking-wider block leading-none drop-shadow-sm">
                ReMEETs
                <span className="block text-xs md:text-sm font-sans font-medium text-teal-800 tracking-[0.3em] mt-2 uppercase">
                  〜再会のボトルメール〜
                </span>
              </span>

              <div className="py-2">
                <h1 className="text-xl md:text-3xl font-serif font-bold text-slate-900 leading-relaxed drop-shadow-sm">
                  あの日言えなかった想いを、あの人へ。<br/>
                  <span className="text-teal-800 underline decoration-teal-300 decoration-2 underline-offset-8">
                    再会のボトルメール
                  </span>
                </h1>
              </div>

              <p className="text-xs md:text-sm text-slate-800 font-serif font-medium max-w-2xl mx-auto leading-loose pt-2">
                同窓生、昔の友人、お世話になったあの人。連絡先はわからないけれど、もう一度だけ話してみたい大切な人へ、想いを言葉にして海に流す。そして、あなたを探している誰かが流した手紙を、自分の名前やゆかりの地から見つけ出す。ここは、お互いを想い合う偶然と奇跡が交差する、静かな再会の海です。
              </p>

              {/* Story Button */}
              <div className="pt-2 max-w-md mx-auto">
                <button 
                  onClick={() => {}}
                  className="w-full py-3 bg-white/90 backdrop-blur-sm border border-slate-300 rounded-full text-xs md:text-sm font-serif font-bold text-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  ボトルメールが届ける再会の奇跡
                </button>
              </div>

              {/* Zero-Yen Policy Card */}
              <div className="pt-4 max-w-xl mx-auto text-left">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-300/80 p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 font-sans">
                      <ShieldCheck size={16} className="text-emerald-600" /> ReMEETsの安心料金ポリシー
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      料金表・詳細を見る
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-sans">
                    <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/60">
                      <span className="text-[10px] text-emerald-800 font-bold block">手紙を書く・投函</span>
                      <strong className="text-sm font-serif font-bold text-emerald-700">完全0円</strong>
                    </div>
                    <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/60">
                      <span className="text-[10px] text-emerald-800 font-bold block">手紙を探す・閲覧</span>
                      <strong className="text-sm font-serif font-bold text-emerald-700">完全0円</strong>
                    </div>
                    <div className="bg-sky-50/80 p-2.5 rounded-xl border border-sky-200/60">
                      <span className="text-[10px] text-sky-900 font-bold block">想い出照合・再会時</span>
                      <strong className="text-sm font-serif font-bold text-sky-800">開通時のみ</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-sans text-center leading-tight">
                    ※お相手とクイズで想い出が一致し、連絡先を開示する瞬間まで一切料金はかかりません。（詳細はこちら）
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Card */}
          <div className="bg-white border border-slate-200/90 p-8 md:p-10 rounded-[32px] shadow-sm space-y-8 text-center font-sans">
            <div className="space-y-2 border-b border-slate-100 pb-6">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Sparkles size={13} className="text-teal-600" />
                <span>メイン機能｜登録・投函・保管 0円</span>
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900">
                逢いたい人へ、再会のボトルメールを流す
              </h3>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-600" /> 匿名投稿OK / いつでも修正・削除可能
              </p>
            </div>

            <div className="space-y-4 max-w-xl mx-auto">
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                同窓生、昔の友人、お世話になったあの人へ。連絡先は分からなくても、もう一度伝えたい大切な想いを言葉にして海に浮かべましょう。
              </p>

              <Link 
                to="/create" 
                className="w-full py-4 bg-slate-900 hover:bg-teal-900 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 block cursor-pointer"
              >
                <Send size={18} />
                <span>ボトルメールを流す（無料）</span>
              </Link>
            </div>

            {/* 3 Step Journey */}
            <div className="pt-8 border-t border-slate-100 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase font-sans">
                  ボトルメールで「あの人」と再会する3つのステップ
                </span>
                <span className="text-[11px] text-slate-500">想いを残すシンプルな流れ</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-xs font-serif font-bold text-teal-700">STEP 01【手紙を書く】</span>
                  <h5 className="font-serif font-bold text-slate-900 text-xs">ボトルに思い出を託す</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    お相手のお名前と、お二人しか知らない「思い出の質問（クイズ）」を設定して投稿します。
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-xs font-serif font-bold text-sky-700">STEP 02【漂う】</span>
                  <h5 className="font-serif font-bold text-slate-900 text-xs">ネットの海をめぐる</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    誰かが探すその日まで、プライバシーを守りながら安全な海（Web）に静かに漂います。
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-xs font-serif font-bold text-emerald-700">STEP 03【届く】</span>
                  <h5 className="font-serif font-bold text-slate-900 text-xs">思い出クイズで再会</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    お相手が検索で見つけ、思い出クイズに正解すると手紙が開き、直接つながれます。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/90 border border-slate-200/90 p-6 rounded-2xl shadow-sm space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <h4 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Search size={16} className="text-teal-600" />
                <span>自分宛ての手紙（ボトルメール）が届いていないか探す</span>
              </h4>
              <span className="text-[10px] text-slate-500">検索・閲覧 無料</span>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="お名前（フルネーム）を入力して検索（例: 山田太郎）"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:border-teal-600"
              />
              <button type="submit" className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shrink-0">
                検索
              </button>
            </form>
          </div>

        </motion.div>
      )}

    </div>
  );
};
