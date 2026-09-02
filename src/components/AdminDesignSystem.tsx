import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, Type, Layers, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, Mail, User, Shield, CreditCard, Lock, Copy, Check,
  Search, Sliders, ExternalLink, RefreshCw, Eye, Code, Smartphone,
  Monitor, Compass, Heart, Bot, ShieldAlert, ArrowRight, CornerDownRight,
  Info, MessageSquare, Terminal, FileText, CheckCheck, X
} from 'lucide-react';

export const AdminDesignSystem: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'buttons' | 'badges' | 'cards' | 'forms' | 'icons' | 'guidelines'>('colors');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [interactiveBtnState, setInteractiveBtnState] = useState<string>('idle');
  const [demoInputVal, setDemoInputVal] = useState('想い出の場所：下北沢');
  const [demoSwitch, setDemoSwitch] = useState(true);
  const [demoRadio, setDemoRadio] = useState('card');

  const copyToClipboard = (text: string, tokenName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colorPalettes = [
    {
      category: 'Primary Brand Colors (基幹ブランドカラー)',
      description: 'ReMEETsの情緒豊かな再会と信頼感を表現する深みのあるネイビー・インディゴ系',
      colors: [
        { name: 'Brand Dark (Slate 900)', hex: '#0F172A', tailwind: 'bg-slate-900', text: 'text-white', role: 'ヘッダー、主要テキスト、最重要アクション' },
        { name: 'Brand Navy (Indigo 900)', hex: '#1E1B4B', tailwind: 'bg-indigo-950', text: 'text-white', role: 'ブランドアクセント背景、権威性サーフェス' },
        { name: 'Brand Indigo (Indigo 600)', hex: '#4F46E5', tailwind: 'bg-indigo-600', text: 'text-white', role: 'メインCTA、重要リンク、フォーカスリング' },
        { name: 'Brand Indigo Light (Indigo 50)', hex: '#EEF2FF', tailwind: 'bg-indigo-50', text: 'text-indigo-950', role: 'eKYC・決済ハイライト背景、チップ背景' },
      ]
    },
    {
      category: 'Emotional & Accent Colors (情緒・アクセントカラー)',
      description: 'ボトルメールの温もり、再会の喜び、希望を彩るアンバー・ゴールド系',
      colors: [
        { name: 'Warm Amber (Amber 500)', hex: '#F59E0B', tailwind: 'bg-amber-500', text: 'text-slate-950', role: 'ボトルハイライト、おすすめ、星評価' },
        { name: 'Warm Amber Dark (Amber 700)', hex: '#B45309', tailwind: 'bg-amber-700', text: 'text-white', role: '注意アラート境界線、未認証バッジ' },
        { name: 'Warm Cream (Amber 50)', hex: '#FFFBEB', tailwind: 'bg-amber-50', text: 'text-amber-950', role: '手紙風コンテナ背景、回想カード' },
        { name: 'Serif Purple (Purple 600)', hex: '#9333EA', tailwind: 'bg-purple-600', text: 'text-white', role: '1,200円一括決済グラデーションアクセント' },
      ]
    },
    {
      category: 'Semantic & Status Colors (状態・セキュリティカラー)',
      description: '公的本人確認(eKYC)、AIモデレーション、エラー、成功状態の統一コード',
      colors: [
        { name: 'Emerald Success (Emerald 600)', hex: '#059669', tailwind: 'bg-emerald-600', text: 'text-white', role: '🛡️ eKYC本人確認完了、決済成功、正常状態' },
        { name: 'Emerald Light (Emerald 50)', hex: '#ECFDF5', tailwind: 'bg-emerald-50', text: 'text-emerald-950', role: 'eKYC承認バッジ背景、成功通知' },
        { name: 'Rose Danger (Rose 600)', hex: '#E11D48', tailwind: 'bg-rose-600', text: 'text-white', role: 'NGワード検知、通報、削除、強制ブロック' },
        { name: 'Rose Light (Rose 50)', hex: '#FFF1F2', tailwind: 'bg-rose-50', text: 'text-rose-950', role: 'AI隔離メッセージ背景、警告バナー' },
      ]
    },
    {
      category: 'Neutrals & Surfaces (背景・サーフェス・ボーダー)',
      description: 'ノイズのない高い可読性と洗練されたコントラスト比を担保するニュートラル系',
      colors: [
        { name: 'Surface Pure White', hex: '#FFFFFF', tailwind: 'bg-white', text: 'text-slate-900', role: 'カード最前面、入力フォーム、モーダル背景' },
        { name: 'Surface Canvas (Slate 50)', hex: '#F8FAFC', tailwind: 'bg-slate-50', text: 'text-slate-800', role: 'アプリケーション全体の大背景' },
        { name: 'Border Subtle (Slate 200)', hex: '#E2E8F0', tailwind: 'bg-slate-200', text: 'text-slate-800', role: '標準カード境界線、ディバイダー' },
        { name: 'Text Muted (Slate 500)', hex: '#64748B', tailwind: 'bg-slate-500', text: 'text-white', role: '補助説明テキスト、メタデータ、プレースホルダー' },
      ]
    }
  ];

  const typographyScales = [
    { level: 'Display Hero (H1)', size: '32px - 40px', weight: 'Bold 700 / Serif', sample: '想い出のボトルメールを探す', fontClass: 'font-serif text-3xl md:text-4xl font-bold', tracking: 'tracking-tight', usage: 'LPメインキャッチコピー、主要画面タイトル' },
    { level: 'Section Heading (H2)', size: '24px - 28px', weight: 'Bold 700 / Serif & Sans', sample: 'あなたを探しているボトルメール', fontClass: 'font-serif text-2xl font-bold', tracking: 'tracking-normal', usage: '各主要セクション見出し、モーダルタイトル' },
    { level: 'Card Title (H3)', size: '18px - 20px', weight: 'Bold 700 / Sans', sample: '世田谷第一中学校（1990年代）', fontClass: 'font-sans text-lg font-bold', tracking: 'tracking-normal', usage: 'ボトルカードタイトル、設定グループ見出し' },
    { level: 'Body Regular', size: '15px - 16px', weight: 'Regular 400 / Sans', sample: '部活の帰りにいつも寄っていた駄菓子屋の名前を覚えていますか？あの時渡せなかった手紙をここに残します。', fontClass: 'font-sans text-base leading-relaxed', tracking: 'tracking-normal', usage: '手紙本文、説明文、お手紙詳細・メッセージ本文（可読性最優先）' },
    { level: 'Small / Metadata', size: '12px - 13px', weight: 'Medium 500 / Sans', sample: '投函日: 2026/08/15 ・ 差出人: たかし (eKYC公的認証済)', fontClass: 'font-sans text-xs text-slate-500', tracking: 'tracking-wide', usage: 'タイムスタンプ、ユーザーメタデータ、補足注記' },
    { level: 'Monospace / Code', size: '12px - 14px', weight: 'Regular 400 / Mono', sample: 'TX_ID: tx_reveal_1755331000_a9f2 / IP: 192.168.1.1', fontClass: 'font-mono text-xs bg-slate-100 p-2 rounded-lg', tracking: 'tracking-wider', usage: '決済トランザクションID、監査ログ、APIレスポンス' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-amber-300 text-xs font-bold border border-white/10">
              <Sparkles size={14} />
              <span>ReMEETs 統合デザインシステム & UIコンポーネントライブラリ</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Design System & Style Guide
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-sans leading-relaxed">
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

        {/* Section Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-8 border-t border-white/10 mt-8 custom-scrollbar">
          {[
            { id: 'colors', label: 'カラーパレット', icon: Palette },
            { id: 'typography', label: 'タイポグラフィ', icon: Type },
            { id: 'buttons', label: 'ボタン & CTA', icon: Layers },
            { id: 'badges', label: 'バッジ & ステータス', icon: ShieldCheck },
            { id: 'cards', label: 'カード & サーフェス', icon: Mail },
            { id: 'forms', label: 'フォーム要素', icon: Sliders },
            { id: 'icons', label: 'アイコン体系', icon: Compass },
            { id: 'guidelines', label: '設計原則 & ルール', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-lg shadow-black/20 font-bold scale-105' 
                    : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-indigo-600' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 1: Color Palette */}
      {activeSection === 'colors' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Palette className="text-indigo-600" />
              <span>Color Tokens & Palettes (カラーパレット)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              クリックするとHEX値またはTailwindクラスをクリップボードにコピーできます。
            </p>
          </div>

          <div className="space-y-8">
            {colorPalettes.map((palette) => (
              <div key={palette.category} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{palette.category}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{palette.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {palette.colors.map((color) => (
                    <div 
                      key={color.name}
                      onClick={() => copyToClipboard(color.hex, color.name)}
                      className="p-4 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all cursor-pointer group bg-slate-50/50 relative overflow-hidden"
                    >
                      <div className={`h-16 w-full rounded-xl ${color.tailwind} shadow-inner flex items-end p-2.5 mb-3 transition-transform group-hover:scale-[1.02]`}>
                        <span className={`text-[11px] font-mono font-bold ${color.text} opacity-90 drop-shadow-sm`}>
                          {color.hex}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {color.name}
                          </span>
                          {copiedToken === color.name ? (
                            <Check size={14} className="text-emerald-600 animate-in zoom-in" />
                          ) : (
                            <Copy size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{color.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section 2: Typography */}
      {activeSection === 'typography' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Type className="text-indigo-600" />
              <span>Typography Hierarchy (タイポグラフィ体系)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              日本の想い出を表現する和文明朝（`font-serif`）と、高い視認性を保つサンセリフ（`font-sans`）の黄金比率
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {typographyScales.map((type) => (
              <div key={type.level} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                      {type.level}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {type.size} / {type.weight}
                    </span>
                  </div>
                  <div className={`${type.fontClass} ${type.tracking} text-slate-900 pt-1`}>
                    {type.sample}
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    推奨用途: <span className="text-slate-700 font-medium">{type.usage}</span>
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(type.fontClass, type.level)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copiedToken === type.level ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{type.fontClass}</span>
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section 3: Buttons & CTA */}
      {activeSection === 'buttons' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Layers className="text-indigo-600" />
              <span>Button Components & Interactive States (ボタン設計)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              各ボタンはホバー・アクティブ・フォーカス状態を備え、ラベルの折り返しを禁止（`white-space: nowrap`）しています。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary & CTA Buttons */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900">1. 主要アクション & CTAボタン</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-2">一括決済 & eKYC手紙開示ボタン (1,200円一括)</span>
                  <button className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]">
                    <Sparkles size={16} className="text-amber-300" />
                    <span>1,200円を一括決済して公的証明・手紙開示を完了</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-2">標準プライマリボタン (Primary Solid)</span>
                  <button className="py-3 px-6 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-[0.99]">
                    <Mail size={16} />
                    <span>想い出のボトルメールを投函する</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-2">セカンダリボタン (Secondary Outline)</span>
                  <button className="py-2.5 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer">
                    <Eye size={14} />
                    <span>プレビューを表示</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Special & Destructive Buttons */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900">2. 状態・セキュリティ・危険アクション</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-2">警察捜査照会エクスポート (Police Report CTA)</span>
                  <button className="py-2.5 px-5 bg-slate-900 hover:bg-black text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer">
                    <ShieldAlert size={15} className="text-amber-400" />
                    <span>🚔 警察照会データ一括出力（刑訴法197条）</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-2">破壊的操作 (Destructive Action)</span>
                  <button className="py-2.5 px-5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
                    <AlertTriangle size={15} />
                    <span>アカウントを強制凍結する</span>
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-2">無効化状態 (Disabled State)</span>
                  <button disabled className="py-2.5 px-5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-not-allowed opacity-60">
                    <Lock size={14} />
                    <span>決済情報を入力してください (無効)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 4: Badges & Status */}
      {activeSection === 'badges' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" />
              <span>Badges, Tags & Security Chips (バッジ・ステータス表示)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              ユーザーの身元保証状態、年代、AI診断結果を直感的に識別するバッジ体系
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900">本人確認・セキュリティバッジ</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
                🛡️ 公的本人確認 (eKYC) 済
              </span>
              <span className="text-[11px] bg-zinc-100 text-zinc-600 border border-zinc-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                📝 自己申告・誓約署名のみ
              </span>
              <span className="text-[11px] bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                ⚠️ AI不適切検知・隔離中
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                🔒 秘密の質問未回答
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 pt-4 border-t border-slate-100">年代・カテゴリタグ</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg font-bold">
                1980年代
              </span>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg font-bold">
                1990年代
              </span>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg font-bold">
                2000年代
              </span>
              <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200/80 px-2.5 py-0.5 rounded-lg font-bold">
                友だち・部活
              </span>
              <span className="text-[11px] bg-pink-50 text-pink-700 border border-pink-200/80 px-2.5 py-0.5 rounded-lg font-bold">
                初恋・恩師
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 5: Cards & Surfaces */}
      {activeSection === 'cards' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Mail className="text-indigo-600" />
              <span>Card & Surface Architecture (カード・サーフェス設計)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              角丸比率、インナーパディング、視覚的階層（Z-index/Elevation）の設計ルール
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Live Sample Bottle Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    本
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">本間 貴司 (たかし)</span>
                    <span className="text-[10px] text-slate-400">東京都世田谷区 ・ 1990年代</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  🛡️ eKYC公的認証済
                </span>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-2 font-serif text-xs text-slate-800 leading-relaxed">
                <p>「あの時、校庭の桜の木の下で話した約束をずっと覚えています。もしこのボトルメールを見つけたら、秘密の質問に答えて手紙を開封してください。」</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>対象: 田中 誠 様宛</span>
                <span className="font-bold text-indigo-600 flex items-center gap-1">
                  秘密の質問 2問完備 <ArrowRight size={12} />
                </span>
              </div>
            </div>

            {/* Fee Breakdown Card */}
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-200/70">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-indigo-600" size={18} />
                  <h4 className="text-sm font-bold text-indigo-950 font-serif">公的証明 ＆ 手紙開封手数料</h4>
                </div>
                <span className="text-xs bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded-lg font-bold">一括決済</span>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between text-indigo-950 pb-1.5 border-b border-indigo-200/50">
                  <span>🪪 公的身分証（eKYC）認証審査料</span>
                  <span className="font-bold">600 円</span>
                </div>
                <div className="flex items-center justify-between text-indigo-950 pb-1.5 border-b border-indigo-200/50">
                  <span>✉️ 手紙開封・直通連絡先開示料</span>
                  <span className="font-bold">600 円</span>
                </div>
                <div className="flex items-center justify-between text-indigo-950 font-bold pt-1 text-sm">
                  <span className="flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500" />
                    お引き落とし合計（買い切り）
                  </span>
                  <span className="text-base text-indigo-900 font-serif">1,200 円 (税込)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 6: Forms */}
      {activeSection === 'forms' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Sliders className="text-indigo-600" />
              <span>Form Controls & Input Fields (フォーム入力コンポーネント)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              エラーフィードバック、フォーカスリング、アクセシビリティを徹底した入力要素
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">テキスト入力（標準フォーカス）</label>
                <input 
                  type="text"
                  value={demoInputVal}
                  onChange={(e) => setDemoInputVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">検索バー（アイコン付き）</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="お名前、地域、学校名で検索..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">トグルスイッチ (Toggle Switch)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDemoSwitch(!demoSwitch)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                      demoSwitch ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                  <span className="text-xs text-slate-600 font-medium">
                    {demoSwitch ? 'リアルタイムAIモデレーション有効' : '無効'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">ラジオ選択 (Radio Chips)</label>
                <div className="flex gap-2">
                  {['card', 'table', 'compact'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setDemoRadio(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        demoRadio === type 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type === 'card' ? 'カード形式' : type === 'table' ? 'テーブル形式' : 'コンパクト'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 7: Icons */}
      {activeSection === 'icons' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Compass className="text-indigo-600" />
              <span>Icon System & Semantic Meanings (アイコン体系)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              すべてのアイコンは `lucide-react` よりインポートし、意味的な一貫性を保持します。
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { icon: Mail, label: 'Mail', role: 'ボトルメール・メッセージ' },
              { icon: ShieldCheck, label: 'ShieldCheck', role: 'eKYC認証完了・公式監査' },
              { icon: Sparkles, label: 'Sparkles', role: '再会成立・マッチング' },
              { icon: ShieldAlert, label: 'ShieldAlert', role: '警察照会・法執行機関連携' },
              { icon: Bot, label: 'Bot', role: 'AI自動検閲・モデレーション' },
              { icon: CreditCard, label: 'CreditCard', role: 'Stripe 決済・返金処理' },
              { icon: User, label: 'User', role: 'アカウント・マイページ' },
              { icon: Lock, label: 'Lock', role: '秘密の質問・非公開保護' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-900">{item.label}</span>
                  <span className="text-[11px] text-slate-500">{item.role}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Section 8: Guidelines */}
      {activeSection === 'guidelines' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <Code className="text-indigo-600" />
              <span>Design Principles & Architecture Rules (設計原則)</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              ReMEETsのUI品質を長期にわたって担保するための5大鉄則
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">情緒と法的信頼性の共存</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                手紙やボトルメールには和文明朝（`font-serif`）と温かみのあるアンバー色を、決済やeKYC・警察照会などの法的画面には厳格なインディゴとモノスペースフォントを適用します。
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">ボタンラベルの改行禁止 (No Wrapping)</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                ピル、チップ、CTAボタン内のテキストは絶対に途中で改行させず、`white-space: nowrap` と適切なパディングで1行に収めます。
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">角丸のネスト計算公式 (Corner Radius)</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                コンテナ内部にカードを配置する場合、`内部角丸 = 外部角丸 - パディング` の計算式を厳密に順守し、視覚的な歪みを防止します。
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">完全買い切り・透明な料金表示</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                料金表示は「eKYC 600円 ＋ 手紙開示 600円 ＝ 一括 1,200円（買い切り）」の内訳を明示し、ユーザーに予期せぬ月額請求の不安を与えないUIを徹底します。
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
