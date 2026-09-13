import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Type, Layers, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, Mail, User, Shield, CreditCard, Lock, Copy, Check,
  Search, Sliders, ExternalLink, RefreshCw, Eye, Code, Smartphone,
  Monitor, Compass, Heart, Bot, ShieldAlert, ArrowRight, CornerDownRight,
  Info, MessageSquare, Terminal, FileText, CheckCheck, X, Download,
  Sun, Moon, Loader2, Bell, HelpCircle, Coins, Coffee
} from 'lucide-react';
import {
  VisaLogo,
  MastercardLogo,
  JcbLogo,
  AmexLogo,
  DinersLogo,
  DiscoverLogo,
  detectCardBrand,
  CardBrand
} from './CreditCardPaymentForm';

export const AdminDesignSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'surfaces' | 'guidelines'>('tokens');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Interactive Card Brand Tester
  const [demoCardNumber, setDemoCardNumber] = useState('4111 1111 1111 1111');
  const demoDetectedBrand = detectCardBrand(demoCardNumber);

  // Interactive Button State Playground
  const [btnState, setBtnState] = useState<'idle' | 'loading' | 'success' | 'disabled'>('idle');

  // Interactive Form Controls
  const [demoInputVal, setDemoInputVal] = useState('想い出の場所：下北沢');
  const [demoSwitch, setDemoSwitch] = useState(true);
  const [demoRadio, setDemoRadio] = useState('card');

  // Card Theme Playground
  const [cardTheme, setCardTheme] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('summer');

  // Active Fee Scenario Playground
  const [feeScenario, setFeeScenario] = useState<'single' | 'both' | 'ekyc_only' | 'supporter' | 'donation'>('both');

  // Toast Notification Simulation
  const [activeToast, setActiveToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const copyToClipboard = (text: string, tokenName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const triggerToast = (type: 'success' | 'error' | 'info', message: string) => {
    setActiveToast({ type, message });
    setTimeout(() => setActiveToast(null), 3500);
  };

  const colorPalettes = [
    {
      category: 'Primary Brand Colors (基幹ブランドカラー)',
      description: 'ReMEETsの情緒豊かな再会と信頼感を表現する深みのあるネイビー・インディゴ系',
      colors: [
        { name: 'Brand Dark (Slate 900)', hex: '#0F172A', tailwind: 'bg-slate-900', text: 'text-white', contrast: '15.2:1 (AAA)', role: 'ヘッダー、主要テキスト、最重要アクション' },
        { name: 'Brand Navy (Indigo 950)', hex: '#1E1B4B', tailwind: 'bg-indigo-950', text: 'text-white', contrast: '14.1:1 (AAA)', role: 'ブランドアクセント背景、権威性サーフェス' },
        { name: 'Brand Indigo (Indigo 600)', hex: '#4F46E5', tailwind: 'bg-indigo-600', text: 'text-white', contrast: '4.9:1 (AA)', role: 'メインCTA、重要リンク、フォーカスリング' },
        { name: 'Brand Indigo Light (Indigo 50)', hex: '#EEF2FF', tailwind: 'bg-indigo-50', text: 'text-indigo-950', contrast: '16.5:1 (AAA)', role: 'eKYC・決済ハイライト背景、チップ背景' },
      ]
    },
    {
      category: 'Emotional & Theme Colors (情緒・アクセントカラー)',
      description: 'ボトルメールの温もり、再会の喜び、希望を彩るアンバー・ティール系',
      colors: [
        { name: 'Warm Amber (Amber 500)', hex: '#F59E0B', tailwind: 'bg-amber-500', text: 'text-slate-950', contrast: '7.8:1 (AAA)', role: 'ボトルハイライト、おすすめ、星評価' },
        { name: 'Deep Teal (Teal 700)', hex: '#0F766E', tailwind: 'bg-teal-700', text: 'text-white', contrast: '5.6:1 (AA)', role: '再会の海・信頼アクセント、成功指標' },
        { name: 'Warm Cream (Amber 50)', hex: '#FFFBEB', tailwind: 'bg-amber-50', text: 'text-amber-950', contrast: '17.2:1 (AAA)', role: '手紙風コンテナ背景、回想カード' },
        { name: 'Sakura Pink (Rose 400)', hex: '#FB7185', tailwind: 'bg-rose-400', text: 'text-slate-950', contrast: '6.4:1 (AA)', role: '初恋・感謝の手紙アクセント' },
      ]
    },
    {
      category: 'Semantic & Status Colors (状態・セキュリティカラー)',
      description: '公的本人確認(eKYC)、AIモデレーション、エラー、成功状態の統一コード',
      colors: [
        { name: 'Emerald Success (Emerald 600)', hex: '#059669', tailwind: 'bg-emerald-600', text: 'text-white', contrast: '4.8:1 (AA)', role: '🛡️ eKYC本人確認完了、決済成功、正常状態' },
        { name: 'Emerald Light (Emerald 50)', hex: '#ECFDF5', tailwind: 'bg-emerald-50', text: 'text-emerald-950', contrast: '16.8:1 (AAA)', role: 'eKYC承認バッジ背景、成功通知' },
        { name: 'Rose Danger (Rose 600)', hex: '#E11D48', tailwind: 'bg-rose-600', text: 'text-white', contrast: '4.7:1 (AA)', role: 'NGワード検知、通報、削除、強制ブロック' },
        { name: 'Rose Light (Rose 50)', hex: '#FFF1F2', tailwind: 'bg-rose-50', text: 'text-rose-950', contrast: '16.9:1 (AAA)', role: 'AI隔離メッセージ背景、警告バナー' },
      ]
    },
    {
      category: 'Neutrals & Surfaces (背景・サーフェス・ボーダー)',
      description: 'ノイズのない高い可読性と洗練されたコントラスト比を担保するニュートラル系',
      colors: [
        { name: 'Surface Pure White', hex: '#FFFFFF', tailwind: 'bg-white', text: 'text-slate-900', contrast: '21.0:1 (AAA)', role: 'カード最前面、入力フォーム、モーダル背景' },
        { name: 'Surface Canvas (Zinc 50)', hex: '#FAFAFA', tailwind: 'bg-zinc-50', text: 'text-slate-800', contrast: '19.8:1 (AAA)', role: 'アプリケーション全体の大背景' },
        { name: 'Border Subtle (Brand Border)', hex: '#E4E4E7', tailwind: 'bg-zinc-200', text: 'text-slate-800', contrast: '11.5:1 (AAA)', role: '標準カード境界線、ディバイダー' },
        { name: 'Text Muted (Zinc 500)', hex: '#71717A', tailwind: 'bg-zinc-500', text: 'text-white', contrast: '4.6:1 (AA)', role: '補助説明テキスト、メタデータ、プレースホルダー' },
      ]
    }
  ];

  const typographyScales = [
    { level: 'Display Hero (H1)', size: '32px - 40px', weight: 'Bold 700 / Serif', sample: '想い出のボトルメールを探す', fontClass: 'font-serif text-3xl md:text-4xl font-bold', tracking: 'tracking-tight', usage: 'LPメインキャッチコピー、主要画面タイトル' },
    { level: 'Section Heading (H2)', size: '24px - 28px', weight: 'Bold 700 / Serif & Sans', sample: 'あなたを探しているボトルメール', fontClass: 'font-serif text-2xl font-bold', tracking: 'tracking-normal', usage: '各主要セクション見出し、モーダルタイトル' },
    { level: 'Card Title (H3)', size: '18px - 20px', weight: 'Bold 700 / Sans', sample: '緑川中学校（1990年代）', fontClass: 'font-sans text-lg font-bold', tracking: 'tracking-normal', usage: 'ボトルカードタイトル、設定グループ見出し' },
    { level: 'Body Regular', size: '15px - 16px', weight: 'Regular 400 / Sans', sample: '部活の帰りにいつも寄っていた駄菓子屋の名前を覚えていますか？あの時渡せなかった手紙をここに残します。', fontClass: 'font-sans text-base leading-relaxed', tracking: 'tracking-normal', usage: '手紙本文、説明文、お手紙詳細・メッセージ本文（可読性最優先）' },
    { level: 'Small / Metadata', size: '12px - 13px', weight: 'Medium 500 / Sans', sample: '投函日: 2026/08/15 ・ 差出人: たかし (eKYC公的認証済)', fontClass: 'font-sans text-xs text-black/60', tracking: 'tracking-wide', usage: 'タイムスタンプ、ユーザーメタデータ、補足注記' },
    { level: 'Monospace / Code', size: '12px - 14px', weight: 'Regular 400 / Mono', sample: 'TX_ID: tx_open_1755331000_a9f2 / eKYC: PASSED', fontClass: 'font-mono text-xs bg-zinc-100 p-2 rounded-lg', tracking: 'tracking-wider', usage: '決済トランザクションID、監査ログ、APIレスポンス' },
  ];

  const themeConfig = {
    summer: {
      name: '夏の海辺 (Teal & Ocean)',
      bg: 'bg-gradient-to-b from-teal-50/60 to-white',
      border: 'border-teal-200',
      tagBg: 'bg-teal-50 text-teal-800 border-teal-200',
      avatarBg: 'bg-teal-100 text-teal-900 border-teal-200',
      quoteBg: 'bg-teal-50/40 border-teal-100 text-teal-950',
      badge: '🌊 夏の漂流便'
    },
    spring: {
      name: '春の想い出 (Sakura & Soft Pink)',
      bg: 'bg-gradient-to-b from-rose-50/60 to-white',
      border: 'border-rose-200',
      tagBg: 'bg-rose-50 text-rose-800 border-rose-200',
      avatarBg: 'bg-rose-100 text-rose-900 border-rose-200',
      quoteBg: 'bg-rose-50/40 border-rose-100 text-rose-950',
      badge: '🌸 卒業・初恋'
    },
    autumn: {
      name: '黄昏の記憶 (Warm Amber & Gold)',
      bg: 'bg-gradient-to-b from-amber-50/60 to-white',
      border: 'border-amber-200',
      tagBg: 'bg-amber-50 text-amber-800 border-amber-200',
      avatarBg: 'bg-amber-100 text-amber-900 border-amber-200',
      quoteBg: 'bg-amber-50/50 border-amber-200/60 text-amber-950',
      badge: '🌇 あの日の約束'
    },
    winter: {
      name: '夜空の便り (Deep Indigo & Navy)',
      bg: 'bg-gradient-to-b from-indigo-50/60 to-white',
      border: 'border-indigo-200',
      tagBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      avatarBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      quoteBg: 'bg-indigo-50/40 border-indigo-100 text-indigo-950',
      badge: '🌌 静寂の再会'
    }
  };

  const tailwindExportCode = `// tailwind.config.js - ReMEETs Design Tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          navy: '#1E1B4B',
          accent: '#4F46E5',
          teal: '#0F766E',
          amber: '#F59E0B',
          border: '#E4E4E7',
          light: '#FAFAFA',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    }
  }
};`;

  const cssVariablesExportCode = `/* ReMEETs Design Tokens (CSS Custom Properties) */
:root {
  --color-brand-dark: #0F172A;
  --color-brand-navy: #1E1B4B;
  --color-brand-accent: #4F46E5;
  --color-brand-teal: #0F766E;
  --color-brand-amber: #F59E0B;
  --color-brand-border: #E4E4E7;
  --color-surface-white: #FFFFFF;
  --color-surface-canvas: #FAFAFA;
  
  --font-serif: "Noto Serif JP", serif;
  --font-sans: "Noto Sans JP", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  
  --radius-card: 1.5rem;
  --radius-button: 0.75rem;
}`;

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* 🧭 Toast Notification Overlay */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md bg-white text-black text-xs font-bold"
          >
            {activeToast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600" />}
            {activeToast.type === 'error' && <AlertTriangle size={18} className="text-rose-600" />}
            {activeToast.type === 'info' && <Info size={18} className="text-indigo-600" />}
            <span>{activeToast.message}</span>
            <button
              onClick={() => setActiveToast(null)}
              className="p-1 hover:bg-black/5 rounded-full ml-2 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-amber-300 text-xs font-bold border border-white/10">
              <Sparkles size={14} />
              <span>ReMEETs 統合デザインシステム ＆ UIスペック Ver 2.5</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Design System & UI/UX Specs
            </h1>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              日本の「想い出と再会」を紡ぐ情緒あるデザインと、公的eKYC認証・セキュリティを両立する厳格なUI/UXガイドラインです。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
              <span className="text-xs text-slate-400 block">WCAG コントラスト</span>
              <span className="text-lg font-bold text-emerald-400">AA / AAA 準拠</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
              <span className="text-xs text-slate-400 block">ベースグリッド</span>
              <span className="text-lg font-bold text-amber-300">8px Grid</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 4-Card Subtabs Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* TAB 1: Tokens */}
        <button
          type="button"
          onClick={() => setActiveTab('tokens')}
          className={`group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'tokens'
              ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
              : 'bg-zinc-50/80 hover:bg-white border-brand-border/80 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  activeTab === 'tokens' ? 'bg-teal-700 text-white shadow-sm' : 'bg-zinc-200 text-black/70 group-hover:bg-teal-100 group-hover:text-teal-900'
                }`}>
                  <Palette size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">
                  STEP 01
                </span>
              </div>
              {activeTab === 'tokens' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 animate-pulse">
                  ● 表示中
                </span>
              ) : (
                <span className="text-[11px] font-mono font-bold text-black/60 bg-zinc-200/70 px-2 py-0.5 rounded-full">
                  16色 トークン
                </span>
              )}
            </div>
            <div className="font-bold text-sm text-black flex items-center gap-1">
              基盤デザイントークン
            </div>
            <p className="text-xs text-black/60 mt-1 line-clamp-2 leading-relaxed font-sans">
              カラーパレット・タイポグラフィ階層・WCAG比率
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-black/50">WCAG準拠</span>
            <span className="font-mono font-bold text-emerald-800">AAA / AA 合格</span>
          </div>
        </button>

        {/* TAB 2: Components */}
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'components'
              ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
              : 'bg-zinc-50/80 hover:bg-white border-brand-border/80 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  activeTab === 'components' ? 'bg-teal-700 text-white shadow-sm' : 'bg-zinc-200 text-black/70 group-hover:bg-teal-100 group-hover:text-teal-900'
                }`}>
                  <Layers size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">
                  STEP 02
                </span>
              </div>
              {activeTab === 'components' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 animate-pulse">
                  ● 表示中
                </span>
              ) : (
                <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  実機テスト可
                </span>
              )}
            </div>
            <div className="font-bold text-sm text-black flex items-center gap-1">
              UIパーツ ＆ 状態テスター
            </div>
            <p className="text-xs text-black/60 mt-1 line-clamp-2 leading-relaxed font-sans">
              ボタン状態・バッジ・フォーム・トースト発火
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-black/50">インタラクティブ</span>
            <span className="font-mono font-bold text-teal-800">リアルタイム動作</span>
          </div>
        </button>

        {/* TAB 3: Surfaces */}
        <button
          type="button"
          onClick={() => setActiveTab('surfaces')}
          className={`group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'surfaces'
              ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
              : 'bg-zinc-50/80 hover:bg-white border-brand-border/80 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  activeTab === 'surfaces' ? 'bg-teal-700 text-white shadow-sm' : 'bg-zinc-200 text-black/70 group-hover:bg-teal-100 group-hover:text-teal-900'
                }`}>
                  <Mail size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">
                  STEP 03
                </span>
              </div>
              {activeTab === 'surfaces' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 animate-pulse">
                  ● 表示中
                </span>
              ) : (
                <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  <span className="font-serif font-bold">4</span>テーマ
                </span>
              )}
            </div>
            <div className="font-bold text-sm text-black flex items-center gap-1">
              サーフェス ＆ 情緒カード
            </div>
            <p className="text-xs text-black/60 mt-1 line-clamp-2 leading-relaxed font-sans">
              春夏秋冬テーマ切替・最新600円料金明細カード
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-black/50">現行料金</span>
            <span className="font-bold text-teal-800"><span className="font-serif font-bold">600</span> 円 買い切り</span>
          </div>
        </button>

        {/* TAB 4: Guidelines & Code */}
        <button
          type="button"
          onClick={() => setActiveTab('guidelines')}
          className={`group relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'guidelines'
              ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
              : 'bg-zinc-50/80 hover:bg-white border-brand-border/80 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  activeTab === 'guidelines' ? 'bg-teal-700 text-white shadow-sm' : 'bg-zinc-200 text-black/70 group-hover:bg-teal-100 group-hover:text-teal-900'
                }`}>
                  <Code size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/40">
                  STEP 04
                </span>
              </div>
              {activeTab === 'guidelines' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 animate-pulse">
                  ● 表示中
                </span>
              ) : (
                <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  JSON / CSS
                </span>
              )}
            </div>
            <div className="font-bold text-sm text-black flex items-center gap-1">
              設計原則 ＆ トークン出力
            </div>
            <p className="text-xs text-black/60 mt-1 line-clamp-2 leading-relaxed font-sans">
              4大設計鉄則・Tailwind/CSS変数一括エクスポート
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-black/50">出力形式</span>
            <span className="font-mono font-bold text-amber-700">Tailwind / CSS</span>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: 🎨 基盤デザイントークン                       */}
      {/* ======================================================== */}
      {activeTab === 'tokens' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Colors */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <Palette className="text-teal-700" size={18} />
                  <span>Color Tokens & Palettes (カラーパレット ＆ WCAGコントラスト比)</span>
                </h3>
                <p className="text-xs text-black/60 mt-0.5">
                  各カラーカードをクリックすると、HEXコードをクリップボードにコピーできます。
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {colorPalettes.map((palette) => (
                <div key={palette.category} className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-black">{palette.category}</h4>
                    <p className="text-xs text-black/60 mt-0.5">{palette.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                    {palette.colors.map((color) => (
                      <div 
                        key={color.name}
                        onClick={() => copyToClipboard(color.hex, color.name)}
                        className="p-3.5 rounded-2xl border border-brand-border/80 hover:shadow-md transition-all cursor-pointer group bg-zinc-50/60 hover:bg-white relative overflow-hidden"
                      >
                        <div className={`h-14 w-full rounded-xl ${color.tailwind} shadow-inner flex items-end justify-between p-2.5 mb-2.5 transition-transform group-hover:scale-[1.02]`}>
                          <span className={`text-[11px] font-mono font-bold ${color.text} opacity-95 drop-shadow-sm`}>
                            {color.hex}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs`}>
                            {color.contrast}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-black group-hover:text-teal-800 transition-colors">
                              {color.name}
                            </span>
                            {copiedToken === color.name ? (
                              <Check size={14} className="text-emerald-600 animate-in zoom-in" />
                            ) : (
                              <Copy size={14} className="text-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <p className="text-[11px] text-black/60 leading-snug">{color.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Type className="text-teal-700" size={18} />
                <span>Typography Hierarchy (タイポグラフィ体系 ＆ 和文フォント黄金比)</span>
              </h3>
              <p className="text-xs text-black/60 mt-0.5">
                情緒ある和文明朝（`font-serif`）と、高い可読性を担保するサンセリフ（`font-sans`）の黄金比
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {typographyScales.map((type) => (
                <div key={type.level} className="p-4 md:p-5 rounded-2xl bg-zinc-50 border border-brand-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 bg-white text-black text-xs font-bold rounded-lg border border-brand-border">
                        {type.level}
                      </span>
                      <span className="text-xs text-black/50 font-mono">
                        {type.size} / {type.weight}
                      </span>
                    </div>
                    <div className={`${type.fontClass} ${type.tracking} text-black pt-1`}>
                      {type.sample}
                    </div>
                    <p className="text-xs text-black/60 pt-0.5">
                      推奨用途: <span className="text-black font-medium">{type.usage}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(type.fontClass, type.level)}
                    className="px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-800 text-black border border-brand-border rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copiedToken === type.level ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{type.fontClass}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: ⚡ UIパーツ ＆ 状態テスター                  */}
      {/* ======================================================== */}
      {activeTab === 'components' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Button States Playground */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <Layers className="text-teal-700" size={18} />
                  <span>Button State Playground (ボタン実機ステートテスター)</span>
                </h3>
                <p className="text-xs text-black/60 mt-0.5">
                  クリックしてボタンの各状態（通常・ロード中・成功・無効）のアニメーションをテストできます。
                </p>
              </div>

              {/* State Switcher */}
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-brand-border/60 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBtnState('idle')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${btnState === 'idle' ? 'bg-white text-black shadow-xs' : 'text-black/60'}`}
                >
                  通常 (Idle)
                </button>
                <button
                  type="button"
                  onClick={() => setBtnState('loading')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${btnState === 'loading' ? 'bg-white text-black shadow-xs' : 'text-black/60'}`}
                >
                  ローディング (Loading)
                </button>
                <button
                  type="button"
                  onClick={() => setBtnState('success')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${btnState === 'success' ? 'bg-white text-emerald-800 shadow-xs' : 'text-black/60'}`}
                >
                  完了 (Success)
                </button>
                <button
                  type="button"
                  onClick={() => setBtnState('disabled')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${btnState === 'disabled' ? 'bg-white text-rose-800 shadow-xs' : 'text-black/60'}`}
                >
                  無効 (Disabled)
                </button>
              </div>
            </div>

            {/* Live Button Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button 1: Main CTA */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <span className="text-xs font-bold text-black block">① メイン開通CTAボタン（600円決済連動）</span>
                <button
                  disabled={btnState === 'disabled' || btnState === 'loading'}
                  className={`w-full py-3.5 px-6 rounded-xl text-xs md:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${
                    btnState === 'success'
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : btnState === 'disabled'
                      ? 'bg-zinc-200 text-black/40 cursor-not-allowed'
                      : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20'
                  }`}
                >
                  {btnState === 'loading' && <Loader2 size={16} className="animate-spin text-white" />}
                  {btnState === 'success' && <Check size={16} className="text-white" />}
                  {btnState === 'idle' && <Sparkles size={16} className="text-amber-300" />}
                  <span>
                    {btnState === 'loading' && 'Stripe 決済・eKYC連携処理中...'}
                    {btnState === 'success' && '600 円 決済 ＆ 開通完了！'}
                    {btnState === 'disabled' && '利用規約に同意してください'}
                    {btnState === 'idle' && '600 円で本人確認 ＆ 直通連絡先を開示'}
                  </span>
                </button>
              </div>

              {/* Button 2: Secondary & Police CTA */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <span className="text-xs font-bold text-black block">② 警察照会 ＆ 破壊的操作ボタン</span>
                <div className="flex flex-wrap gap-2.5">
                  <button className="py-2.5 px-4 bg-slate-900 hover:bg-black text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer">
                    <ShieldAlert size={14} className="text-amber-400" />
                    <span>🚔 警察照会データ一括出力（刑訴法197条）</span>
                  </button>

                  <button className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
                    <AlertTriangle size={14} />
                    <span>アカウント強制凍結</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Status Chips */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <ShieldCheck className="text-teal-700" size={18} />
                <span>Badges, Tags & Security Chips (バッジ・ステータス体系)</span>
              </h3>
              <p className="text-xs text-black/60 mt-0.5">
                ユーザーの身元保証状態、年代、AI診断結果を直感的に識別するバッジ体系
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-black block mb-2">本人確認・セキュリティバッジ</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
                    🛡️ 公的本人確認 (eKYC) 済
                  </span>
                  <span className="text-[11px] bg-zinc-100 text-black/70 border border-zinc-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    📝 自己申告・電子的利用宣誓のみ
                  </span>
                  <span className="text-[11px] bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    ⚠️ AI不適切検知・隔離中
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    🔒 秘密の質問未回答
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100">
                <span className="text-xs font-bold text-black block mb-2">年代・カテゴリタグ</span>
                <div className="flex flex-wrap items-center gap-2">
                  {['1980年代', '1990年代', '2000年代', '2010年代', '友だち・部活', '初恋・恩師', '旅先での出会い'].map((tag) => (
                    <span key={tag} className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-lg font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Controls & Toast Launcher */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Sliders className="text-teal-700" size={18} />
                <span>Form Controls & Interactive Toast Launcher (フォーム部品 ＆ トースト発火)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">テキスト入力（フォーカスリング検証）</label>
                  <input 
                    type="text"
                    value={demoInputVal}
                    onChange={(e) => setDemoInputVal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">検索バー（アイコン付き）</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                    <input 
                      type="text"
                      placeholder="お名前、地域、学校名で検索..."
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-2">トグルスイッチ (Toggle Switch)</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDemoSwitch(!demoSwitch)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                        demoSwitch ? 'bg-teal-700 justify-end' : 'bg-zinc-300 justify-start'
                      }`}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </button>
                    <span className="text-xs text-black/70 font-medium">
                      {demoSwitch ? 'リアルタイムAIモデレーション有効' : '無効'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-2">トースト通知発火テスト</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => triggerToast('success', '🎉 600 円の決済と本人確認が完了しました')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      成功トースト
                    </button>
                    <button
                      onClick={() => triggerToast('error', '⚠️ 秘密の質問の回答が一致しません')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
                    >
                      エラー警告
                    </button>
                    <button
                      onClick={() => triggerToast('info', 'ℹ️ 相手からの返信メールが届きました')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer"
                    >
                      情報通知
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🏛️ 6大国際カードブランド公式SVG ＆ リアルタイム判定システム */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <CreditCard className="text-indigo-600" size={18} />
                  <span>Official Card Brand Vectors & Real-time Detector (公式カードブランド ＆ リアルタイム判定)</span>
                </h3>
                <p className="text-xs text-black/60 mt-0.5">
                  国際6大ブランドの公式ベクターSVGロゴを搭載。番号入力に合わせて即座にブランドを自動認識・ハイライトします。
                </p>
              </div>
              <span className="text-xs px-3 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-full font-bold">
                現在判定: <strong className="font-mono uppercase text-indigo-600">{demoDetectedBrand}</strong>
              </span>
            </div>

            {/* Interactive Card Tester Input */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                🔍 テストカード番号を入力（または下のプリセットをクリック）:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={demoCardNumber}
                  onChange={(e) => setDemoCardNumber(e.target.value)}
                  placeholder="例: 4111 1111 1111 1111"
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setDemoCardNumber('4111 1111 1111 1111')}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  VISAテスト番号
                </button>
              </div>
            </div>

            {/* 6 Brands Grid Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { brand: 'visa' as CardBrand, name: 'VISA', prefix: '4...', component: <VisaLogo className="h-7 w-auto" />, testNum: '4111 1111 1111 1111' },
                { brand: 'mastercard' as CardBrand, name: 'Mastercard', prefix: '51-55 / 22-27', component: <MastercardLogo className="h-7 w-auto" />, testNum: '5555 5555 5555 4444' },
                { brand: 'jcb' as CardBrand, name: 'JCB', prefix: '35...', component: <JcbLogo className="h-7 w-auto" />, testNum: '3528 1234 5678 9012' },
                { brand: 'amex' as CardBrand, name: 'Amex', prefix: '34 / 37', component: <AmexLogo className="h-7 w-auto" />, testNum: '3782 8224 6310 005' },
                { brand: 'diners' as CardBrand, name: 'Diners', prefix: '30 / 36 / 38', component: <DinersLogo className="h-7 w-auto" />, testNum: '3600 0000 0000 00' },
                { brand: 'discover' as CardBrand, name: 'Discover', prefix: '6011 / 65', component: <DiscoverLogo className="h-7 w-auto" />, testNum: '6011 0000 0000 0000' },
              ].map((c) => {
                const isActive = demoDetectedBrand === c.brand;
                return (
                  <button
                    key={c.brand}
                    type="button"
                    onClick={() => setDemoCardNumber(c.testNum)}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                      isActive
                        ? 'bg-indigo-50/90 border-2 border-indigo-600 shadow-md ring-2 ring-indigo-500/20 scale-[1.03]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="h-8 flex items-center justify-center">
                      {c.component}
                    </div>
                    <span className="text-xs font-bold text-slate-900 mt-1">{c.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{c.prefix}</span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                        <Check size={10} /> 判定一致
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: ✉️ サーフェス ＆ 情緒カード                  */}
      {/* ======================================================== */}
      {activeTab === 'surfaces' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Card Theme Switcher & Preview */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <Mail className="text-teal-700" size={18} />
                  <span>Emotion Bottle Mail Cards (情緒ボトルメールカード・テーマ切替)</span>
                </h3>
                <p className="text-xs text-black/60 mt-0.5">
                  季節や想い出の情感を表現する4つのカラーテーマをリアルタイムに切り替えて確認できます。
                </p>
              </div>

              {/* Theme Switcher Chips */}
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-brand-border/60 text-xs font-bold">
                {(['summer', 'spring', 'autumn', 'winter'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCardTheme(t)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      cardTheme === t ? 'bg-white text-black shadow-xs font-bold' : 'text-black/60 hover:text-black'
                    }`}
                  >
                    {t === 'summer' ? '🌊 夏' : t === 'spring' ? '🌸 春' : t === 'autumn' ? '🌇 秋' : '🌌 冬'}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Bottle Card & Fee Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Emotion Bottle Mail Card with Real Full Name & Maiden Name */}
              <div className={`rounded-3xl border ${themeConfig[cardTheme].border} ${themeConfig[cardTheme].bg} p-6 shadow-sm space-y-4 relative overflow-hidden transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full border ${themeConfig[cardTheme].avatarBg} flex items-center justify-center font-bold text-xs shadow-xs`}>
                      綿
                    </div>
                    <div>
                      {/* 📜 差出人本名＋旧姓の統一表記仕様 */}
                      <span className="text-xs font-bold text-black block">
                        差出人: 綿矢 りさ <span className="text-slate-600 font-normal">（旧姓: 田中）</span>
                      </span>
                      <span className="text-[10px] text-black/50">世田谷区立第一中学校 ・ 1990年代（同級生）</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                    🛡️ eKYC公的認証済
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${themeConfig[cardTheme].quoteBg} space-y-2 font-serif text-xs leading-relaxed`}>
                  <p>「あの時、校庭の桜の木の下で話した約束をずっと覚えています。もしこのボトルメールを見つけたら、秘密の質問に答えて手紙を開封してください。」</p>
                </div>

                {/* 旧姓未登録時のフォールバック見本 */}
                <div className="p-2.5 bg-white/70 rounded-xl border border-black/5 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">💡 差出人本名・旧姓の表示ルール（統一フォーマット）:</span>
                  <div className="font-mono text-[10px] space-y-0.5 text-slate-700">
                    <div>・ 旧姓登録あり: <code>綿矢 りさ（旧姓: 田中）</code></div>
                    <div>・ 旧姓未登録時: <code>山田 太郎（旧姓: 　　　）</code>（枠を維持し信頼感を担保）</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-black/60">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${themeConfig[cardTheme].tagBg}`}>
                    {themeConfig[cardTheme].badge}
                  </span>
                  <span className="font-bold text-teal-800 flex items-center gap-1">
                    想い出クイズ 2問一致必須 <ArrowRight size={12} />
                  </span>
                </div>
              </div>

              {/* Official Transparent Fee Breakdown Card (All 5 Scenarios) */}
              <div className="bg-teal-50/80 border border-teal-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-teal-200/70">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-teal-700" size={18} />
                    <h4 className="text-sm font-bold text-teal-950 font-serif">公的証明 ＆ 決済シナリオ明細</h4>
                  </div>
                  <span className="text-xs bg-teal-200/60 text-teal-900 px-2.5 py-0.5 rounded-lg font-bold">明朗会計・返金保証</span>
                </div>

                {/* Scenario Selector Chips */}
                <div className="flex flex-wrap gap-1 bg-white/70 p-1.5 rounded-xl border border-teal-200 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setFeeScenario('single')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${feeScenario === 'single' ? 'bg-teal-700 text-white shadow-xs' : 'text-teal-900 hover:bg-teal-100'}`}
                  >
                    ① 通常手紙開示 (¥600)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeScenario('both')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${feeScenario === 'both' ? 'bg-indigo-700 text-white shadow-xs' : 'text-indigo-950 hover:bg-indigo-100'}`}
                  >
                    ② 開封＋eKYC同時 (¥1,200)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeScenario('supporter')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${feeScenario === 'supporter' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-950 hover:bg-amber-100'}`}
                  >
                    ④ サポーター支援 (¥500〜)
                  </button>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  {feeScenario === 'single' && (
                    <>
                      <div className="flex items-center justify-between text-teal-950 pb-1.5 border-b border-teal-200/50">
                        <span>✉️ 想い出の手紙開示 ＆ 連絡先（LINE等）開示</span>
                        <span className="font-mono font-bold text-teal-900">600 円</span>
                      </div>
                      <div className="flex items-center justify-between text-teal-950 pb-1.5 border-b border-teal-200/50">
                        <span>🔒 連絡先セキュア引き渡し・暗号化通信</span>
                        <span className="font-mono font-medium text-black/60">込み (0 円)</span>
                      </div>
                      <div className="flex items-center justify-between text-teal-950 font-bold pt-1.5 text-sm">
                        <span className="flex items-center gap-1 text-teal-950">
                          <Sparkles size={14} className="text-amber-500" />
                          お引き落とし合計（買い切り）
                        </span>
                        <span className="text-base text-teal-900 font-serif">600 円 (税込)</span>
                      </div>
                    </>
                  )}

                  {feeScenario === 'both' && (
                    <>
                      <div className="flex items-center justify-between text-indigo-950 pb-1.5 border-b border-indigo-200/50">
                        <span>✉️ 想い出の手紙開示・連絡先開示手数料</span>
                        <span className="font-mono font-bold text-indigo-900">600 円</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-950 pb-1.5 border-b border-indigo-200/50">
                        <span>🪪 公的身分証eKYC本人確認審査費用</span>
                        <span className="font-mono font-bold text-indigo-900">600 円</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-950 font-bold pt-1.5 text-sm">
                        <span className="flex items-center gap-1 text-indigo-950">
                          <ShieldCheck size={14} className="text-indigo-600" />
                          同時決済お引き落とし合計
                        </span>
                        <span className="text-base text-indigo-900 font-serif">1,200 円 (税込)</span>
                      </div>
                    </>
                  )}

                  {feeScenario === 'supporter' && (
                    <>
                      <div className="flex items-center justify-between text-amber-950 pb-1.5 border-b border-amber-200/50">
                        <span>☕ サポーター支援（コーヒー1杯〜）</span>
                        <span className="font-mono font-bold text-amber-900">¥500 / 1口</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-950 pb-1.5 border-b border-amber-200/50">
                        <span>❤️ プラットフォームサーバー・AI維持応援</span>
                        <span className="font-mono font-medium text-black/60">全額運営充当</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-950 font-bold pt-1.5 text-sm">
                        <span className="flex items-center gap-1 text-amber-950">
                          <Coffee size={14} className="text-amber-600" />
                          ご支援金額
                        </span>
                        <span className="text-base text-amber-900 font-serif">¥500〜（任意口数）</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 border border-teal-200/80 text-[11px] text-teal-950 flex items-start gap-1.5">
                  <CheckCircle2 size={14} className="text-teal-700 shrink-0 mt-0.5" />
                  <span>【全額即時返金保証】eKYC審査不合格や相手の未開封時は、Stripe仮売上システムにより全額自動返金されます。</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: 📐 設計原則 ＆ トークン出力                  */}
      {/* ======================================================== */}
      {activeTab === 'guidelines' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* 5 Core Principles */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Code className="text-teal-700" size={18} />
                <span>Design Principles & Architecture Rules (設計原則 5大鉄則)</span>
              </h3>
              <p className="text-xs text-black/60 mt-0.5">
                ReMEETsのUI品質・法的信頼性・情緒体験を長期にわたって担保するための設計ルール
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="text-sm font-bold text-black font-serif">情緒と法的信頼性の共存</h4>
                <p className="text-xs text-black/60 leading-relaxed">
                  手紙やボトルメールには和文明朝（`font-serif`）と温かみのあるアンバー/ティールを、決済やeKYC・警察照会などの法的画面には厳格なモノスペースフォントとクリーンな白背景を適用します。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="text-sm font-bold text-black font-serif">ボタンラベルの改行禁止 (No Wrapping)</h4>
                <p className="text-xs text-black/60 leading-relaxed">
                  ピル、チップ、CTAボタン内のテキストは絶対に途中で改行させず、`white-space: nowrap` と適切なパディングで1行に収めます。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="text-sm font-bold text-black font-serif">角丸のネスト計算公式 (Corner Radius)</h4>
                <p className="text-xs text-black/60 leading-relaxed">
                  コンテナ内部にカードを配置する場合、`内部角丸 = 外部角丸 - パディング` の計算式を厳密に順守し、視覚的な歪みを防止します。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <h4 className="text-sm font-bold text-black font-serif">完全買い切り・透明な料金表示</h4>
                <p className="text-xs text-black/60 leading-relaxed">
                  料金表示は「手紙開示 600円 / eKYC同時 1,200円（完全買い切り）」を明示し、ユーザーに予期せぬ月額課金の不安を与えないUIを徹底します。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2 lg:col-span-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                  05
                </div>
                <h4 className="text-sm font-bold text-indigo-950 font-serif">差出人「本名＋旧姓」常時統一フォーマット</h4>
                <p className="text-xs text-black/60 leading-relaxed">
                  手紙差出人の表記はニックネームへのフォールバックを排除し、必ず本名を表示します。旧姓未登録時も <code>（旧姓: 　　　）</code> とブランク枠を維持して統一フォーマットを堅持します。
                </p>
              </div>
            </div>
          </div>

          {/* Export Tokens Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tailwind Config Export */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                  <FileText size={14} className="text-teal-700" />
                  <span>Tailwind Config トークン定義</span>
                </span>
                <button
                  onClick={() => copyToClipboard(tailwindExportCode, 'tailwindConfig')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedToken === 'tailwindConfig' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedToken === 'tailwindConfig' ? 'コピー完了' : 'コードをコピー'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-[11px] font-mono overflow-x-auto custom-scrollbar">
                <code>{tailwindExportCode}</code>
              </pre>
            </div>

            {/* CSS Variables Export */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Code size={14} className="text-teal-700" />
                  <span>CSS カスタムプロパティ (:root)</span>
                </span>
                <button
                  onClick={() => copyToClipboard(cssVariablesExportCode, 'cssVariables')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedToken === 'cssVariables' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedToken === 'cssVariables' ? 'コピー完了' : 'コードをコピー'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-[11px] font-mono overflow-x-auto custom-scrollbar">
                <code>{cssVariablesExportCode}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDesignSystem;
