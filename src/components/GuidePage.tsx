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
  Coins,
  Bell
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
              {activeTab === 'flow' ? '① 4ステップ解説 表示中' : '② 詳細マニュアル（全7章） 表示中'}
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
              <span className="whitespace-nowrap tracking-wide">詳細マニュアル（全7章）</span>
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
                探したいお相手の名前、忘れられない思い出の地、そして<strong className="text-slate-900">「二人だけしか答えを知らない思い出クイズ（2問）」</strong>をボトルに詰めて投稿（無料）。
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
                  費用: 0円（完全無料）
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                ふとエゴサーチしたお相手が、手紙を発見！
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                お相手がふと自分の名前や出身地などをGoogle等で検索（エゴサーチ）した際、あなたが出した手紙ページが検索結果にヒット！<br />
                「えっ、これ私宛ての手紙…!? あおいからだ！」と奇跡の再会ストーリーが動き出します（新着メール通知アラートも無料）。
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
                  費用: 0円（完全無料）
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                ふたりだけの「思い出クイズ」に答えて心がつながる
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                手紙を開いたお相手は、あなたが出題した「思い出クイズ（2問）」に回答します（無料）。<br />
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
                  手紙開封・連絡先受取: 600円（税込・単発都度払い / 月額0円）
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-slate-900">
                手紙を開いて、差出人の連絡先を受け取る！
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
                思い出クイズに正解後、手紙の開封・連絡先受取手続き（600円）を実施。<br />
                差出人が設定した<strong className="text-indigo-900">連絡先（LINE ID, メールアドレス等）</strong>が画面上に開示されます。直接メッセージを送ることで、確実に再会を果たせます！（※公的本人確認は任意オプション+600円、同時決済時1,200円）
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

      {/* 本人確認（eKYC）の目的と安心設計 ＆ 健全性の宣言（提案4） */}
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
              ReMEETs の安心・安全な仕組みと健全性のお約束
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-slate-800 font-sans leading-relaxed">
          <div className="p-4 md:p-5 bg-white/95 rounded-2xl border border-amber-200/80 space-y-2 shadow-2xs">
            <p className="font-bold text-amber-950 font-serif text-sm">
              【出会い系サイトとは異なる「健全な想い出再会専用プラットフォーム」】
            </p>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              ReMEETsは、不特定多数の異性との出会いを目的とした「インターネット異性紹介事業（出会い系サイト）」ではありません。過去に実在した同級生、恩師、昔の友人など、特定の想い出の相手との「合意に基づく健全な再会」をお手伝いするための専用サービスです。
            </p>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              登録・手紙の投函・検索・思い出クイズ回答はすべて<strong className="text-amber-900 font-bold">永久無料（0円）</strong>。費用が発生するのは思い出クイズ正解後の手紙開封（600円）のみです。月額料金や自動引き落としは一切ありません。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
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
                ふたりだけの思い出のクイズ（2問）に正解したお相手にのみ連絡先が開示される安全設計。
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
        /* Detailed Manual View (全7章構成・提案 1〜5 完全適用) */
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-10 text-slate-800 font-sans">
          {/* Manual Header */}
          <div className="border-b border-slate-200 pb-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                MANUAL & GUIDE
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                公式完全マニュアル
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
              ReMEETs 詳細ご利用マニュアル（全7章）
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-sans leading-relaxed">
              手紙の投函・検索・クイズ作成のコツ・開示手続き・マイページ管理・通知設定・サポーター寄付・警察治安連携まで網羅して解説します。
            </p>
          </div>

          {/* クイック目次チップ（提案 5: テーマカラー付き） */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-serif">
              <BookOpen size={14} className="text-teal-600" />
              <span>📑 目次（クリックで各章へ直接ジャンプ）：</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              <a href="#sec-01" className="p-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 transition-all shadow-2xs flex items-center gap-1.5 hover:border-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shrink-0 font-sans">01</span>
                <span>手紙を書く (0円)</span>
              </a>
              <a href="#sec-02" className="p-2 bg-white hover:bg-blue-50 text-blue-900 font-bold rounded-xl border border-blue-200 transition-all shadow-2xs flex items-center gap-1.5 hover:border-blue-300">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-sans">02</span>
                <span>検索・通知 (0円)</span>
              </a>
              <a href="#sec-03" className="p-2 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-200 transition-all shadow-2xs flex items-center gap-1.5 hover:border-amber-300">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 font-sans">03</span>
                <span>クイズと開通</span>
              </a>
              <a href="#sec-04" className="p-2 bg-white hover:bg-indigo-50 text-indigo-900 font-bold rounded-xl border border-indigo-200 transition-all shadow-2xs flex items-center gap-1.5 hover:border-indigo-300">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 font-sans">04</span>
                <span>履歴・マイページ</span>
              </a>
              <a href="#sec-05" className="p-2 bg-white hover:bg-rose-50 text-rose-900 font-bold rounded-xl border border-rose-200 transition-all shadow-2xs flex items-center gap-1.5 hover:border-rose-300">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shrink-0 font-sans">05</span>
                <span>通知設定</span>
              </a>
              <a href="#sec-06" className="p-2 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-300 transition-all shadow-2xs flex items-center gap-1.5 hover:border-amber-400">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shrink-0 font-sans">06</span>
                <span>サポーター寄付</span>
              </a>
              <a href="#sec-07" className="p-2 bg-white hover:bg-teal-50 text-teal-900 font-bold rounded-xl border border-teal-200 transition-all shadow-2xs flex items-center gap-1.5 col-span-2 sm:col-span-1 md:col-span-2 hover:border-teal-300">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-sans">07</span>
                <span>安全・プライバシー・治安防衛</span>
              </a>
            </div>
          </div>

          {/* 01 手紙を書く */}
          <section id="sec-01" className="space-y-4 scroll-mt-20 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans shrink-0">01</span>
                <span>手紙を書く（ボトルメールの投函）</span>
              </h3>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={13} className="text-teal-600" />
                費用: 0円（完全無料・投函何通でも無料・月額なし）
              </span>
            </div>
            
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
              トップページの「ボトルメールを流す」ボタンから、探している相手へのメッセージを作成できます。あなたの想いがお相手に届くよう、以下の項目を丁寧に入力しましょう。
            </p>

            <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <p className="text-xs font-bold text-slate-900 font-serif">📋 入力項目の詳細とポイント：</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
                <li><strong>相手の名前：</strong> 姓と名を分けて正確に入力してください。旧姓や、当時呼んでいた名前など、相手が検索しそうな名前を入力するのがコツです。</li>
                <li><strong>出身地・ゆかりの地：</strong> 相手の出身地や、二人が出会った場所などを入力します。一般公開されるのは「都道府県」までとなりますが、市区町村まで入力することで検索精度が向上します。</li>
                <li><strong>交流のあった年代：</strong> 相手と過ごした時代（例：1990年代）を選択します。</li>
                <li><strong>あなたの表示名：</strong> 当時のあだ名や、二人の間だけで通じる呼び名を使用してください。</li>
                <li><strong>思い出クイズ（2問）：</strong> 本人確認のための最重要ステップです。第三者が推測しにくい二人の記憶に基づく具体的なエピソードを質問に設定してください。</li>
                <li><strong>開示用連絡先（LINE等）：</strong> クイズに正解し、手続きを行ったお相手だけに安全に公開される連絡先（LINE ID、メールアドレス等）を設定します。手紙の本文欄には直接書き込まず、こちらの専用欄にご入力ください。</li>
                <li><strong>メッセージ：</strong> 相手が思い出クイズに正解した後に表示される手紙本文です。</li>
                <li><strong>AIによる自動検閲：</strong> 投稿内容はAI（Gemini API）によって自動解析され、不適切な表現や個人情報の過度な露出がある場合は安全のために投稿が制限されます。</li>
              </ul>
            </div>

            {/* 思い出クイズ作成のコツ（提案 3） */}
            <div className="p-4 md:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5 text-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 font-serif">
                <Sparkles size={16} className="text-amber-600 shrink-0" />
                <span>💡 思い出クイズ作成のベストプラクティス（良問のコツ）</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                  <span className="font-bold text-emerald-800 flex items-center gap-1 text-xs">
                    ⭕ 良い例（ふたりだけの固有の記憶）
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    ・「高校2年の文化祭で一緒に作った出し物の看板の文字は？」（例: 喫茶ポエム）<br />
                    ・「放課後によく二人で通っていた駄菓子屋の名前は？」（例: きくや商店）<br />
                    ・「中学の卒業式の日、帰り道に埋めたタイムカプセルの場所は？」（例: 裏庭の桜の木の下）
                  </p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-rose-200 space-y-1.5 shadow-2xs">
                  <span className="font-bold text-rose-800 flex items-center gap-1 text-xs">
                    ❌ 避けるべき例（第三者が推測できるもの）
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    ・「私の誕生月は何月？」（SNSや知人から簡単に推測可能）<br />
                    ・「私の好きな食べ物は？」（選択肢が少なく当てずっぽうで正解されるリスクあり）<br />
                    ・「私たちの出身中学の名前は？」（卒業名簿等で特定される恐れあり）
                  </p>
                </div>
              </div>
            </div>

            {/* Q&A */}
            <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle size={14} className="text-slate-600" />
                よくある質問：手紙を流した後、相手が見つからなかったらどうなりますか？
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed pl-4">
                期限切れで自動削除されることはなく、お相手が見つけるまでWeb海流に静かに漂い続けます。マイページの「投函した手紙」からいつでも内容の修正や公開停止・削除が可能です。
              </p>
            </div>
          </section>

          {/* 02 奇跡を拾う */}
          <section id="sec-02" className="space-y-4 scroll-mt-20 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-sans shrink-0">02</span>
                <span>奇跡を拾う（自分宛ての手紙を探す ＆ 新着入荷通知アラート）</span>
              </h3>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={13} className="text-blue-600" />
                費用: 0円（検索・アラート登録 完全無料）
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
              「自分宛ての手紙を探す」ページでは、ご自身宛てのメッセージが届いていないかを、ご自身の名前やゆかりの地のキーワードで簡単に見つけることができます。
            </p>

            <div className="bg-blue-50/60 p-4 md:p-5 rounded-2xl border border-blue-200/80 space-y-3">
              <div>
                <p className="text-xs font-bold text-blue-950 font-serif">🔍 自分宛ての手紙を見つけるヒント：</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-blue-900/90 leading-relaxed mt-1">
                  <li>ご自身の姓、名、あるいは旧姓などの漢字やひらがなで検索をお試しください。</li>
                  <li>お相手と出会った地域や、思い出のゆかりの地などで絞り込むと、届いたボトルが非常に見つかりやすくなります。</li>
                  <li>年代や関係性（部活動、同級生、元同僚など）を指定することで、効率よく自分宛ての手紙を絞り込めます。</li>
                </ul>
              </div>

              <div className="border-t border-blue-200/80 pt-3">
                <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5 font-serif">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded-md font-sans">便利機能</span>
                  🔔 自分宛ての手紙が投稿されたらメールで受け取る（新着入荷通知アラート）
                </p>
                <p className="text-xs text-blue-900/90 leading-relaxed mt-1 font-sans">
                  検索画面であなたのお名前やゆかりの地を設定し、<strong>「この検索条件でメール通知を保存する」</strong>を有効にしておくと、今後あなたを探しているお相手が新しくボトルメールを投函した瞬間に、システムから自動でメール通知が届きます。<br />
                  保存した通知条件は、ログイン後の<strong>「マイページ」→「通知・アラート」タブ</strong>からいつでも確認・削除・管理が可能です。
                </p>
              </div>
            </div>

            {/* Q&A */}
            <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle size={14} className="text-slate-600" />
                よくある質問：同姓同名の手紙が複数ヒットした場合はどう見分ければいいですか？
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed pl-4">
                ボトルの詳細画面には、ゆかりの地（都道府県）や年代、差出人のあだ名、手紙の冒頭が表示されています。心当たりのある情報と照らし合わせてご自身宛てのものかご判断ください。
              </p>
            </div>
          </section>

          {/* 03 再会への一歩 */}
          <section id="sec-03" className="space-y-4 scroll-mt-20 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-sans shrink-0">03</span>
                <span>再会への一歩（思い出クイズ回答〜手紙開封・連絡先受取）</span>
              </h3>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                <Coins size={13} className="text-amber-600" />
                クイズ回答: 0円 / 手紙開封・連絡先受取: 600円（税込・都度払い）
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
              自分宛てと思われる手紙を見つけたら、詳細を確認します。メッセージ本文と連絡先を開示するには、差出人が設定した「思い出クイズ（2問）」に回答して本人照合を行います。
            </p>

            <div className="bg-amber-50/70 p-4 md:p-5 rounded-2xl border border-amber-200/80 space-y-3">
              <p className="text-xs font-bold text-amber-950 font-serif">🚀 再会へのステップ：</p>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-amber-950 leading-relaxed">
                <li><strong>クイズに回答（無料 0円）：</strong> 思い出クイズ（2問）に全問正解すると、本人照合が完了しロックが解除されます。</li>
                <li><strong>手紙の開封と受け取り手続き（600円）：</strong> 差出人からの手紙全文を確認し、開通手続き（600円・月額ゼロ・Stripe安全決済 / 任意公的本人確認付き1,200円）を行います。</li>
                <li><strong>連絡先（LINE ID等）の開示：</strong> 差出人が設定した連絡先（LINE ID、メールアドレス等）が画面上に即時開示されます。</li>
                <li><strong>直接連絡・再会成功：</strong> 開示された連絡先へ直接メッセージをお送りいただくことで、感動の再会を果たせます。</li>
              </ol>
            </div>

            {/* クイズのルールと安全防衛仕様（提案 3） */}
            <div className="p-4 md:p-5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-serif">
                <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                <span>思い出クイズのルールと安全防衛（総当たり荒らし防止機能）</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 leading-relaxed">
                <li><strong>回答の表記ゆれ対応：</strong> ひらがな・漢字の表記ゆれを柔軟に照合します。思い出の言葉をそのまま入力してください。</li>
                <li><strong>総当たり防止レートリミット：</strong> 不正なプログラムや第三者による当てずっぽうの連続回答を防ぐため、短時間に何度も間違えた場合は一時的に回答がロックされます。</li>
                <li><strong>課金発生タイミングの保証：</strong> クイズに回答するだけでは1円も費用は発生しません。全問正解し、ご自身が納得して手紙を開封する段階で初めて600円（都度払い）の手続きとなります。</li>
              </ul>
            </div>

            {/* Q&A */}
            <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle size={14} className="text-slate-600" />
                よくある質問：クイズの答えを間違えたら、相手にバレますか？
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed pl-4">
                不正解の段階では、あなたの個人情報やプロファイルが相手に開示されることはありません。安心してご回答ください。
              </p>
            </div>
          </section>

          {/* 04 開示情報の確認と管理（マイページ完全活用・提案 1 大幅拡充） */}
          <section id="sec-04" className="space-y-4 scroll-mt-20 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-sans shrink-0">04</span>
                <span>履歴・マイページの確認と管理（安心のプライベート管理）</span>
              </h3>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full flex items-center gap-1">
                <UserCheck size={13} className="text-indigo-600" />
                マイページで24時間いつでも管理可能
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
              ReMEETsでは、一度開封した手紙やご自身が流したボトルの状況を、マイページ（アカウント画面）からいつでも安全に確認・管理できます。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 開封済みのお手紙 */}
              <div className="p-4 md:p-5 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-2">
                <span className="text-xs font-bold text-indigo-950 font-serif flex items-center gap-1.5">
                  <Lock size={15} className="text-indigo-600" />
                  ① 開封済みのお手紙（永久保存）
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  開通手続きを行ったお手紙のメッセージ全文、差出人の連絡先（LINE ID、メールアドレス等）、開封日時は<strong>「マイページ」→「開封済みのお手紙」</strong>に永久保存されます。いつでも再確認・LINE IDのコピーが可能です。
                </p>
              </div>

              {/* 投函した手紙の管理 */}
              <div className="p-4 md:p-5 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-2">
                <span className="text-xs font-bold text-teal-950 font-serif flex items-center gap-1.5">
                  <Send size={15} className="text-teal-600" />
                  ② 自分が流したボトルの管理・編集
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  あなたが流したボトルの閲覧数、お相手からのクイズ回答状況（正解/回答中）をリアルタイムで確認できます。必要に応じて手紙のメッセージ修正や、公開停止・物理削除もワンタップで行えます。
                </p>
              </div>
            </div>

            {/* 第三者への非公開保証 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-900 font-serif flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-teal-600" />
                第三者への非公開保証
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                一度開通した連絡先情報は、あなたとお相手の間でのみ共有されます。他の第三者ユーザーに連絡先が漏洩したり、勝手に公開されることは一切ありません。
              </p>
            </div>

            {/* Q&A */}
            <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <HelpCircle size={14} className="text-slate-600" />
                よくある質問：開示された相手のLINE IDを後から確認し直すことはできますか？
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed pl-4">
                はい。マイページの「開封済みのお手紙」に一覧としてずっと残りますので、いつでも確認・コピーしていただけます。
              </p>
            </div>
          </section>

          {/* 05 相手からの回答・正解通知とメール設定 */}
          <section id="sec-05" className="space-y-4 scroll-mt-20 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-sans shrink-0">05</span>
                <span>相手からの回答・正解通知とメール設定（リアルタイム通知）</span>
              </h3>
              <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full flex items-center gap-1">
                <Bell size={13} className="text-rose-600" />
                メール・サイト内 2系統のリアルタイム通知
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
              あなたが流したボトルがお相手に見つけられ、質問回答やクイズ正解などのアクションが起こると、以下の2つの方法で自分宛てに通知されます。
            </p>

            <div className="p-4 md:p-5 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5 font-serif">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  ① サイト内通知（画面右上のベルアイコン 🔔）
                </p>
                <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
                  サイトにログイン時、画面右上の 🔔（ベルマーク）に赤いバッジが点灯し、回答・正解されたボトルの状況がリアルタイムで届きます。
                </p>
              </div>

              <div className="space-y-1.5 border-t border-rose-200/60 pt-2.5">
                <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5 font-serif">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  ② 登録メールアドレスへの即時メール通知
                </p>
                <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
                  お相手がクイズに答えた時や全問正解して手紙を開封した際、ご登録のメールアドレス宛に自動的にお知らせメールが送信されます。メール内のリンクからすぐに結果画面を確認できます。
                </p>
              </div>

              <div className="space-y-1.5 border-t border-rose-200/60 pt-2.5">
                <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5 font-serif">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  ③ メール通知のON/OFF切り替え
                </p>
                <p className="text-xs text-rose-900/80 leading-relaxed pl-3.5">
                  「マイアカウント」→「プロフィール設定」から、メール通知の受信（ON/OFF）をいつでもご自身のお好みに合わせて変更できます。
                </p>
              </div>
            </div>
          </section>

          {/* 06 サポーター寄付プログラム */}
          <section id="sec-06" className="space-y-4 scroll-mt-20 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-sans shrink-0">06</span>
                <span>ReMEETsを応援する（サポーター寄付プログラム）</span>
              </h3>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={13} className="text-amber-600" />
                1口 500円〜（都度決済・月額課金なし）
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
              ReMEETsは、すべての方が無料で手紙を流せるよう、広告を一切排除した個人運営とAI安全監査費を温かいご寄付で支えていただいています。
            </p>

            <div className="p-4 md:p-5 bg-gradient-to-br from-amber-50/80 via-rose-50/40 to-white border border-amber-200 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                <span className="font-bold text-amber-950 text-xs font-serif flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-600" />
                  1口 500円〜の都度寄付（月額自動引き落としなし・Stripe暗号化決済）
                </span>
                <Link
                  to="/supporter"
                  className="inline-flex items-center gap-1 text-xs text-teal-800 font-bold hover:underline shrink-0"
                >
                  <span>サポーター詳細ページへ</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
                <li><strong>完全任意・単発決済：</strong> 月額サブスクリプションではなく、応援したい時にいつでも1回からご支援いただけます。</li>
                <li><strong>⭐ 公式サポーターバッジ付与：</strong> ご寄付いただいたアカウントには、マイページや投稿に輝くゴールドバッジが自動点灯します。</li>
                <li><strong>資金使途の透明性：</strong> いただいたご支援金は、AI安全検閲API利用料、サーバー・DBインフラ維持費、セキュリティ監査体制の維持に全額充当されます。</li>
                <li><strong>※ 寄付金控除について：</strong> 民間Webサービスに対する任意の活動支援金であるため、税制上の「寄付金控除」の対象外となります。</li>
              </ul>
            </div>
          </section>

          {/* 07 プライバシー保護と治安防衛の取り組み（安心設計・警察連携・提案 4 大幅拡充） */}
          <section id="sec-07" className="space-y-4 scroll-mt-20 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-sans shrink-0">07</span>
                <span>プライバシー保護と治安防衛・警察連携の取り組み（安心設計）</span>
              </h3>
              <span className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={13} className="text-teal-600" />
                24時間体制のAI防衛 ＆ 厳格な法執行機関連携
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
              ユーザー様が安心して大切な思い出を託せるよう、ReMEETsでは以下の厳格なセキュリティ・治安防衛体制を敷いています。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-serif">
                  <ShieldCheck size={15} className="text-teal-600" />
                  ① AIリアルタイム水際検閲（Gemini API）
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  誹謗中傷、実名・詳細住所の漏洩、ストーカー兆候メッセージをAIが24時間体制で水際検知し、悪質な投稿は自動隔離・物理保全されます。
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-serif">
                  <Lock size={15} className="text-indigo-600" />
                  ② Stripe国際最高基準 (PCI-DSS Level 1)
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  クレジットカード情報は世界標準の暗号化基盤で処理され、当サービスのサーバーには一切保持されません。
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-serif">
                  <Eye size={15} className="text-amber-600" />
                  ③ 地域は「都道府県」まで公開
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  市区町村以下の詳細な住所は一般公開されず、個人のプライバシーと現在地を厳格に保護します。
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-serif">
                  <CheckCircle2 size={15} className="text-rose-600" />
                  ④ 公的本人確認（eKYC）連携（任意）
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  運転免許証等による公的確認（任意オプション）により、なりすましやサクラ、いたずら登録を徹底排除します。
                </p>
              </div>
            </div>

            {/* 警察・捜査機関連携と出会い系規制法対象外の宣言 */}
            <div className="p-4 md:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl space-y-2 shadow-sm">
              <span className="text-xs font-bold text-teal-300 font-serif flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-teal-400" />
                捜査機関（警察・公安）照会連携 ＆ 出会い系サイト規制法対象外の健全性
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                万が一のストーカー行為や不正利用が発生した際は、刑事訴訟法第197条第2項に基づく捜査関係事項照会書に対し、IPアドレス・接続タイムスタンプ・決済記録を迅速に提供し、被害防止に全面協力します。<br />
                また、本アプリは特定の想い出の相手との合意再会専用であり、不特定多数との無差別な異性交際を斡旋する「インターネット異性紹介事業（出会い系サイト）」には該当しない健全なプラットフォームです。
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Pricing Dedicated Banner & Shortcut Links (提案 5) */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/90 border-2 border-amber-200/90 rounded-3xl space-y-4 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold font-serif text-base md:text-lg">
              <Coins size={22} className="text-amber-600 shrink-0" />
              <span>利用料金・各種手数料について</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-xl">
              基本機能（登録・作成・検索・回答）は完全無料。手紙開封・SNS連絡先開示のみ1通あたり600円（買い切り・月額不要）です。サービス別の詳細料金表および特定商取引法に基づく表記は、専用ページに集約しております。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Coins size={14} />
              <span>利用料金表</span>
              <ChevronRight size={13} />
            </Link>
            <Link
              to="/supporter"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs transition-all shadow-2xs hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>サポーター寄付</span>
            </Link>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};
