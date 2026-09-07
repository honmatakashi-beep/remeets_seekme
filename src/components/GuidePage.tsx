import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Search, 
  Key, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Heart, 
  Sparkles,
  HelpCircle,
  ChevronRight,
  UserCheck,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  CreditCard,
  Coins
} from 'lucide-react';
import { GuideSampleInlineViewer, SampleSceneType } from './GuideSampleInlineViewer';
import { BackToHomeButton } from './SharedComponents';
import guideScene01Soft from '../assets/images/guide_scene_01_soft_1785858280085.jpg';
import guideScene02Soft from '../assets/images/guide_scene_02_soft_1785858294880.jpg';
import guideScene03Soft from '../assets/images/guide_scene_03_soft_1785858307849.jpg';
import guideScene04Soft from '../assets/images/guide_scene_04_soft_1785858320993.jpg';

interface GuidePageProps {
  defaultTab?: 'flow' | 'manual';
}

export const GuidePage: React.FC<GuidePageProps> = ({ defaultTab = 'flow' }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'manual'>(defaultTab);
  const [activeModal, setActiveModal] = useState<SampleSceneType | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-black font-sans">
      <BackToHomeButton />
      <div className="glass-card p-8 md:p-12 space-y-8 bg-white rounded-3xl border border-brand-border shadow-sm">
        {/* Header Section */}
        <div className="flex items-center gap-4 border-b border-brand-border pb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
            <BookOpen size={26} />
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
              User Guide & Instructions
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
              ReMEETs ご利用ガイド
            </h1>
            <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-1">
              手紙の投函から奇跡の発見、思い出クイズでの本人照合、連絡先の安全な受け取りまでのご利用手順をご案内します。
            </p>
          </div>
        </div>

        {/* Tab Switcher: Highly Visible Segmented Control */}
        <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5 font-sans">
              <Sparkles size={13} className="text-teal-600" />
              <span>表示切替（閲覧したい項目を選択してください）</span>
            </span>
            <span className="text-[10px] text-teal-700 font-extrabold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
              {activeTab === 'flow' ? '① 4ステップ解説 表示中' : '② 詳細マニュアル 表示中'}
            </span>
          </div>

          <div className="flex justify-center w-full p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/80 shadow-inner gap-1.5">
            <button
              onClick={() => setActiveTab('flow')}
              className={`flex-1 py-2.5 px-2 sm:px-3 md:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap relative select-none ${
                activeTab === 'flow'
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif translate-y-0'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
              }`}
            >
              <span className={`p-1 rounded-lg transition-colors shrink-0 ${
                activeTab === 'flow' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
              }`}>
                <Sparkles size={14} />
              </span>
              <span className="whitespace-nowrap tracking-wide">再会の流れ（4ステップ）</span>
              {activeTab === 'flow' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 px-2 sm:px-3 md:px-4 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap relative select-none ${
                activeTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-900/10 font-serif translate-y-0'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-sans'
              }`}
            >
              <span className={`p-1 rounded-lg transition-colors shrink-0 ${
                activeTab === 'manual' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-300/60 text-slate-500'
              }`}>
                <FileCheck size={14} />
              </span>
              <span className="whitespace-nowrap tracking-wide">ご利用マニュアル</span>
              {activeTab === 'manual' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 border-2 border-white rounded-full shadow-2xs animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'flow' ? (
        <>
          {/* 4 Scene Flow Section */}
          <div className="space-y-8">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                STORY & FLOW
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
                再会へと繋がる 4つのステップ
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                手紙の投函から、奇跡の発見、質問の解読、そしてSNS連絡先の開示まで
              </p>
            </div>

        <div className="space-y-6">
          {/* SCENE 01 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 md:p-8 rounded-3xl border-2 border-teal-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* 右側イラスト＆左側グラデーション */}
            <div className="absolute top-0 right-0 bottom-0 w-1/2 sm:w-5/12 md:w-1/2 pointer-events-none overflow-hidden select-none">
              <img 
                src={guideScene01Soft} 
                alt="ボトルを海へ流すイラスト" 
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 via-20% to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20" />
            </div>

            <div className="space-y-3 relative z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-teal-600 text-white rounded-xl text-xs font-bold font-serif shadow-2xs">
                  Scene 01
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                  費用: 0円（完全無料）
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                想いと「思い出クイズ」を込め、ボトルを海へ流す
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                探したいお相手の名前、忘れられない思い出の地、そして<strong className="text-slate-900">「二人だけしか答えを知らない思い出クイズ」</strong>をボトルに詰めて投稿（無料）。
                手紙はWebの大海原へと解き放たれ、静かにお相手を待ち続けます。
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setActiveModal(activeModal === 1 ? null : 1)}
                  className="px-3.5 py-1.5 bg-teal-50/90 hover:bg-teal-100/90 text-teal-800 border border-teal-300/80 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 group/btn"
                >
                  <Eye size={14} className="group-hover/btn:scale-110 transition-transform text-teal-600" />
                  <span>{activeModal === 1 ? '画面イメージを閉じる' : '画面イメージを見る'}</span>
                  <ChevronRight size={13} className={`text-teal-600 opacity-70 transition-transform ${activeModal === 1 ? 'rotate-90' : 'group-hover/btn:translate-x-0.5'}`} />
                </button>
              </div>

              {activeModal === 1 && (
                <div className="pt-2 animate-fade-in">
                  <GuideSampleInlineViewer
                    activeScene={1}
                    onClose={() => setActiveModal(null)}
                    onSelectScene={(scene) => setActiveModal(scene)}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* SCENE 02 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 md:p-8 rounded-3xl border-2 border-blue-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* 右側イラスト＆左側グラデーション */}
            <div className="absolute top-0 right-0 bottom-0 w-1/2 sm:w-5/12 md:w-1/2 pointer-events-none overflow-hidden select-none">
              <img 
                src={guideScene02Soft} 
                alt="手紙を発見するイラスト" 
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 via-20% to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20" />
            </div>

            <div className="space-y-3 relative z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold font-serif shadow-2xs">
                  Scene 02
                </span>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  費用: 0円（偶然の発見）
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                ふとエゴサーチしたお相手が、手紙を発見！
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                お相手がふと自分の名前や出身地などをGoogle等で検索（エゴサーチ）した際、あなたが出した手紙ページが検索結果にヒット！<br />
                「えっ、これ私宛ての手紙…!? あおいからだ！」と奇跡の再会ストーリーが動き出します。
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setActiveModal(activeModal === 2 ? null : 2)}
                  className="px-3.5 py-1.5 bg-blue-50/90 hover:bg-blue-100/90 text-blue-800 border border-blue-300/80 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 group/btn"
                >
                  <Eye size={14} className="group-hover/btn:scale-110 transition-transform text-blue-600" />
                  <span>{activeModal === 2 ? '画面イメージを閉じる' : '画面イメージを見る'}</span>
                  <ChevronRight size={13} className={`text-blue-600 opacity-70 transition-transform ${activeModal === 2 ? 'rotate-90' : 'group-hover/btn:translate-x-0.5'}`} />
                </button>
              </div>

              {activeModal === 2 && (
                <div className="pt-2 animate-fade-in">
                  <GuideSampleInlineViewer
                    activeScene={2}
                    onClose={() => setActiveModal(null)}
                    onSelectScene={(scene) => setActiveModal(scene)}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* SCENE 03 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 md:p-8 rounded-3xl border-2 border-amber-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* 右側イラスト＆左側グラデーション */}
            <div className="absolute top-0 right-0 bottom-0 w-1/2 sm:w-5/12 md:w-1/2 pointer-events-none overflow-hidden select-none">
              <img 
                src={guideScene03Soft} 
                alt="思い出クイズに答えるイラスト" 
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 via-20% to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20" />
            </div>

            <div className="space-y-3 relative z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-600 text-white rounded-xl text-xs font-bold font-serif shadow-2xs">
                  Scene 03
                </span>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  費用: 0円（クイズ回答）
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                ふたりだけの「思い出クイズ」に答えて心がつながる
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                手紙を開いたお相手は、あなたが出題した「思い出クイズ」に回答します（無料）。<br />
                第三者やサクラには絶対に答えられない正解を入力することで、時代を超えて「本人であること」が確証されます。
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setActiveModal(activeModal === 3 ? null : 3)}
                  className="px-3.5 py-1.5 bg-amber-50/90 hover:bg-amber-100/90 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 group/btn"
                >
                  <Eye size={14} className="group-hover/btn:scale-110 transition-transform text-amber-600" />
                  <span>{activeModal === 3 ? '画面イメージを閉じる' : '画面イメージを見る'}</span>
                  <ChevronRight size={13} className={`text-amber-600 opacity-70 transition-transform ${activeModal === 3 ? 'rotate-90' : 'group-hover/btn:translate-x-0.5'}`} />
                </button>
              </div>

              {activeModal === 3 && (
                <div className="pt-2 animate-fade-in">
                  <GuideSampleInlineViewer
                    activeScene={3}
                    onClose={() => setActiveModal(null)}
                    onSelectScene={(scene) => setActiveModal(scene)}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* SCENE 04 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 md:p-8 rounded-3xl border-2 border-indigo-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* 右側イラスト＆左側グラデーション */}
            <div className="absolute top-0 right-0 bottom-0 w-1/2 sm:w-5/12 md:w-1/2 pointer-events-none overflow-hidden select-none">
              <img 
                src={guideScene04Soft} 
                alt="手紙開封と再会イラスト" 
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 via-20% to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20" />
            </div>

            <div className="space-y-3 relative z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-bold font-serif shadow-2xs">
                  Scene 04
                </span>
                <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  手紙開封・連絡先受取: 600円（公的本人確認は+600円）
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                手紙を開いて、差出人の連絡先を受け取る！
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                思い出クイズに正解後、手紙の開封・連絡先受取手続き（600円）を実施。<br />
                差出人が設定した<strong className="text-indigo-900">連絡先（LINE ID, メールアドレス等）</strong>が画面上に開示されます。直接メッセージを送ることで、確実に再会を果たせます！（※公的本人確認は任意オプション+600円）
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setActiveModal(activeModal === 4 ? null : 4)}
                  className="px-3.5 py-1.5 bg-indigo-50/90 hover:bg-indigo-100/90 text-indigo-800 border border-indigo-300/80 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 group/btn"
                >
                  <Eye size={14} className="group-hover/btn:scale-110 transition-transform text-indigo-600" />
                  <span>{activeModal === 4 ? '画面イメージを閉じる' : '画面イメージを見る'}</span>
                  <ChevronRight size={13} className={`text-indigo-600 opacity-70 transition-transform ${activeModal === 4 ? 'rotate-90' : 'group-hover/btn:translate-x-0.5'}`} />
                </button>
              </div>

              {activeModal === 4 && (
                <div className="pt-2 animate-fade-in">
                  <GuideSampleInlineViewer
                    activeScene={4}
                    onClose={() => setActiveModal(null)}
                    onSelectScene={(scene) => setActiveModal(scene)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 本人確認（eKYC）の目的と安心設計の追記 */}
      <div className="bg-gradient-to-br from-amber-50/90 via-slate-50 to-white p-6 md:p-8 rounded-3xl border-2 border-amber-200/90 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-amber-200/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans border border-amber-300/60">
              Security & Trust System
            </span>
            <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900 mt-1">
              ReMEETs の安心・安全な仕組みと連絡先開示について
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-slate-800 font-sans leading-relaxed">
          <p className="bg-white/90 p-4 md:p-5 rounded-2xl border border-amber-200/80 text-xs md:text-sm font-medium text-slate-900 shadow-2xs leading-relaxed">
            「ReMEETsは、大切な旧友や恩師と『もう一度つながる』ための特別な場所です。登録・手紙の投函・検索・思い出クイズ回答はすべて<strong className="text-amber-900 font-bold">無料（0円）</strong>でご利用いただけます。不適切な利用や嫌がらせを防止するため、ソーシャル認証による基本年齢確認や自動モデレーションを導入しています。思い出クイズ正解後の連絡先受取手続き（600円）により、差出人の連絡先が開示され、直接連絡を取ることで安心かつスムーズに再会を果たせます。」
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="font-bold text-amber-900 text-xs font-serif flex items-center gap-1">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                基本機能は完全無料（0円）
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                手紙の投函、エゴサーチ検索、思い出クイズへの回答まで費用は一切発生しません。
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="font-bold text-amber-900 text-xs font-serif flex items-center gap-1">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                思い出クイズで確実な本人照合
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                ふたりだけの思い出のクイズに正解したお相手にのみ連絡先が開示される安全設計。
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="font-bold text-amber-900 text-xs font-serif flex items-center gap-1">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                開示費 600円・月額ゼロ
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                サブスクなし。手紙開封・SNS開示時（600円 / 任意eKYC付き1,200円）の買い切り型で安全に運用します。
              </p>
            </div>
          </div>
        </div>
      </div>

        </>
      ) : (
        /* Detailed Manual View */
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8 text-slate-800 font-sans">
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
              MANUAL & GUIDE
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
              ReMEETs 詳細ご利用マニュアル
            </h2>
            <p className="text-xs text-slate-500">
              手紙の投函、手紙の検索、本人確認、開示手続きのステップを詳しく解説します。
            </p>
          </div>

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
                <li><strong>開示用連絡先（LINE等）：</strong> クイズに正解し、手続きを行ったお相手だけに安全に公開される連絡先（LINE ID、メールアドレス等）を設定します。手紙の本文欄には直接書き込まず、こちらの専用欄にご入力ください。</li>
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
              「自分宛ての手紙を探す」ページでは、ご自身宛てのメッセージが届いていないかを、自身の名前やゆかりの地のキーワードで簡単に見つけることができます。
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
                  <span className="px-2 py-0.5 bg-teal-600 text-white text-[10px] rounded-md">便利機能</span>
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
        </div>
      )}

      {/* Pricing Dedicated Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 border-2 border-amber-200/90 rounded-3xl space-y-4 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold font-serif text-base md:text-lg">
              <Coins size={22} className="text-amber-600 shrink-0" />
              <span>利用料金・各種手数料について</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-xl">
              基本機能（登録・作成・検索・回答）は完全無料。SNS連絡先開示のみ1通あたり600円（買い切り・月額不要）です。サービス別の詳細料金表および特定商取引法に基づく表記は、専用ページに集約しております。
            </p>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs md:text-sm transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Coins size={16} />
            <span>利用料金表・費用詳細を見る</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      </div>
    </div>
  );
};
