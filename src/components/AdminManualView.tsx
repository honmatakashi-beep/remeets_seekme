import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Shield,
  Activity,
  Settings,
  Users,
  Mail,
  Sparkles,
  Bot,
  AlertTriangle,
  Trash2,
  Bell,
  UserCheck,
  ShieldAlert,
  Terminal,
  FileSpreadsheet,
  CheckSquare,
  Coins,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  UserPlus,
  Brain,
  BarChart3,
  HelpCircle,
  Key,
  RefreshCw,
  Layers,
  Download,
  Database,
  Server,
  Lock,
  Printer,
  Copy,
  Check,
  Search,
  ChevronRight,
  ExternalLink,
  Award,
  CreditCard,
  History,
  Palette,
  Sliders,
  FileText
} from 'lucide-react';

export const AdminManualView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedChapter, setCopiedChapter] = useState<number | null>(null);

  const chapters = [
    {
      id: 1,
      number: '第1章',
      title: '管理者責任・法令遵守 ＆ 権限管理 (RBAC)',
      subtitle: '個人情報の厳格保護・通信の秘密・4大ロール権限・600円モデルの法的建付け',
      icon: Shield,
      badge: 'コンプライアンス最優先',
      color: 'teal'
    },
    {
      id: 2,
      number: '第2章',
      title: 'ダッシュボード・ボトル投稿 ＆ 奇跡の物語',
      subtitle: 'リアルタイムKPI監視・手紙CRUD編集・証跡付き削除・感動エピソード管理',
      icon: Activity,
      badge: '日常運用',
      color: 'emerald'
    },
    {
      id: 3,
      number: '第3章',
      title: 'AI安全防衛・検閲 ＆ 通報モデレーション',
      subtitle: 'Gemini文脈解析・50選検閲シミュレーター・NGワード・強制ブロック',
      icon: Bot,
      badge: 'セキュリティ',
      color: 'sky'
    },
    {
      id: 4,
      number: '第4章',
      title: 'お問い合わせSLA・メール一覧 ＆ 一括配信',
      subtitle: '問い合わせ自動分類・8種メールテンプレート・全体プッシュ通知',
      icon: Mail,
      badge: 'ユーザー対応',
      color: 'indigo'
    },
    {
      id: 5,
      number: '第5章',
      title: '決済台帳・eKYC本人確認 ＆ 収益シミュレータ',
      subtitle: 'Stripe入出金台帳・手動返金・純利分析・Sandbox模擬決済・BEP試算',
      icon: CreditCard,
      badge: '財務 ＆ eKYC',
      color: 'amber'
    },
    {
      id: 6,
      number: '第6章',
      title: 'システム診断・セキュリティ ＆ バージョン履歴',
      subtitle: '動的レート制限・VACUUM最適化・環境変数点検・DoS遮断・Git差分',
      icon: Server,
      badge: 'インフラ管理',
      color: 'purple'
    },
    {
      id: 7,
      number: '第7章',
      title: 'M&A企業価値評価 ＆ マスター備忘録室',
      subtitle: 'DCF/EBITDA倍率法・資産目録・IM出力・17大デプロイチェックリスト',
      icon: Award,
      badge: '経営・事業譲渡',
      color: 'rose'
    },
    {
      id: 8,
      number: '第8章',
      title: 'デザインシステム (UI/UX Specs ＆ 設計原則)',
      subtitle: '4大設計鉄則・16色パレット・ボタン実機テスター・春夏秋冬テーマ',
      icon: Palette,
      badge: 'デザイン仕様',
      color: 'cyan'
    }
  ];

  // Print Handlers
  const handlePrintFullBook = () => {
    window.print();
  };

  const copyChapterText = (chapterId: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChapter(chapterId);
    setTimeout(() => setCopiedChapter(null), 2500);
  };

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-manual-view" className="space-y-8 font-sans pb-24">
      {/* 🧭 Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-book-container, #print-book-container * {
            visibility: visible;
          }
          #print-book-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt;
            line-height: 1.6;
          }
          .print-hidden {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            break-inside: avoid;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      {/* 🧭 Header Banner (On-Screen) */}
      <div className="print-hidden bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 md:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-amber-300 text-xs font-bold border border-white/10">
              <BookOpen size={14} />
              <span>ReMEETs 公式管理者 ＆ 運営総合ハンドブック Ver 2.5 (改訂完全版)</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">
              管理者操作マニュアル ＆ 運用標準手順書 (SOP)
            </h1>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              法令遵守、AI安全防衛、決済・eKYC、システム診断、M&A評価、デザイン原則まで、全管理画面の操作方法と運用ルールを完全網羅。
            </p>
          </div>

          {/* Print & Download Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrintFullBook}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-teal-950/40 transition-all cursor-pointer border border-teal-400/40 active:scale-[0.98]"
            >
              <Printer size={16} />
              <span>📖 一冊の完全マニュアルとして印刷 (PDF出力)</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Chapter Pills */}
        <div className="pt-6 mt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="マニュアル内をキーワード検索..."
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
            />
          </div>

          <div className="text-xs text-slate-300 font-mono">
            全 8 章 / 本番正式運用準拠 (2026年8月15日施行)
          </div>
        </div>
      </div>

      {/* 🧭 On-Screen Chapter Selector (8 Rich Interactive Cards) */}
      <div className="print-hidden grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredChapters.map((ch) => {
          const Icon = ch.icon;
          const isActive = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChapter(ch.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                  : 'bg-zinc-50/80 hover:bg-white border-brand-border/80 hover:border-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isActive ? 'bg-teal-700 text-white' : 'bg-zinc-200 text-black/70'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-black/40">
                      {ch.number}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-zinc-200/70 text-black/60'
                  }`}>
                    {ch.badge}
                  </span>
                </div>
                <div className="font-bold text-xs text-black line-clamp-1">
                  {ch.title}
                </div>
                <p className="text-[11px] text-black/60 mt-1 line-clamp-2 leading-relaxed">
                  {ch.subtitle}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                <span className="text-black/50">クリックで開く</span>
                <ChevronRight size={12} className={isActive ? 'text-teal-700' : 'text-black/30'} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 📖 CHAPTER DETAILS (ON-SCREEN INTERACTIVE VIEW)                      */}
      {/* ==================================================================== */}
      <div className="print-hidden bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-8">
        {/* Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wider block">
              {chapters.find(c => c.id === activeChapter)?.number}
            </span>
            <h2 className="text-lg md:text-xl font-bold font-serif text-black flex items-center gap-2">
              <span>{chapters.find(c => c.id === activeChapter)?.title}</span>
            </h2>
            <p className="text-xs text-black/60 mt-0.5">
              {chapters.find(c => c.id === activeChapter)?.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyChapterText(activeChapter, document.getElementById(`chapter-content-${activeChapter}`)?.innerText || '')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-black transition-all cursor-pointer border border-brand-border/60"
            >
              {copiedChapter === activeChapter ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedChapter === activeChapter ? '章テキストをコピー完了' : 'この章をコピー'}</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 1: Compliance, Zero-Data Retention & RBAC             */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 1 && (
          <div id="chapter-content-1" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs">1</span>
                  <span>個人情報とプライバシーの厳格な保護</span>
                </h4>
                <p className="text-black/70">
                  当プラットフォームは、お相手の「名前」と「二人だけの思い出」を鍵とすることで、一般のメッセージボトルのような見知らぬ人への個人情報漏洩を防いでいます。
                  管理者はすべてのボトル原文、監査用ログ、クイズの正誤履歴にアクセス可能ですが、以下のルールを遵守しなければなりません。
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-black/70">
                  <li><b>私的目的の検索・覗き見禁止:</b> 面識のない第三者の通信内容やクイズ解答履歴を興信目的等で調べる行為は即時解雇・監査ログからの自動告発対象となります。</li>
                  <li><b>実名照合フィルターの保守:</b> 日本の常用姓名・主要SNS IDに該当する投函が検知された場合、一般タイムラインには表示されず隔離されます。</li>
                  <li><b>法的な開示:</b> 警察等の法執行機関から正当な捜査関係事項照会（刑訴法197条2項）があった場合、合意同意ログおよびIP履歴を開示します。</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs">2</span>
                  <span>個人情報ゼロ保持（Zero Data Retention）モデル</span>
                </h4>
                <p className="text-black/70">
                  当Webサーバー上に機微個人情報を極力残さず、外部専門基盤とリアルタイム連携することで漏洩リスクを100%回避します。
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-black/70">
                  <li><b>🪪 身分証原本画像・顔写真:</b> TRUSTDOCK等のeKYC専門サーバーへ直接送信され、Webサーバーには一切保存されません（承認結果トークンのみ保持）。</li>
                  <li><b>💳 クレジットカード番号:</b> Stripe PCI-DSS Level 1 サーバーと直接通信し、Webサーバーは一切通過・保存しません。</li>
                  <li><b>📱 開示用連絡先:</b> 想い出クイズ完全一致・eKYC・決済が完了した当事者2名にのみリアルタイムで復号・引き渡し（ブリッジ）。</li>
                </ul>
              </div>
            </div>

            {/* RBAC Roles Summary */}
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
              <h4 className="font-bold text-sm text-teal-950 flex items-center gap-2">
                <KeyRound size={16} className="text-teal-700" />
                <span>役職ロール・権限分離（RBAC: 4階層アクセス制御）</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-sans">
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">👑 オーナー (Owner)</span>
                  <p className="text-[11px] text-black/60">全権限、M&Aデータ室、DB初期化、APIキー管理、ロール任命</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">⚡ 最高管理者 (Admin)</span>
                  <p className="text-[11px] text-black/60">ユーザー管理、手紙編集削除、返金実行、一括配信、システム監視</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">⚖️ 監査役 (Auditor)</span>
                  <p className="text-[11px] text-black/60">警察照会ログ出力、eKYC監査、決済台帳閲覧（破壊的操作不可）</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">🛡️ モデレーター (Moderator)</span>
                  <p className="text-[11px] text-black/60">通報対応、NGワード登録、隔離ボトルの承認/却下のみ</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 2: Dashboard, Posts & Success Stories                 */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 2 && (
          <div id="chapter-content-2" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <Activity size={16} className="text-emerald-600" />
                  <span>1. リアルタイムKPI ＆ 統計モニタリング</span>
                </h4>
                <p className="text-black/70">
                  「ダッシュボード」タブでは、本日の投関数、新規登録数、メッセージ往復数、開通された（クイズ正解）ペア数をリアルタイムで集計表示します。
                </p>
                <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1 text-[11px]">
                  <b>📈 主な監視指標:</b>
                  <ul className="list-disc pl-4 space-y-0.5 text-black/60">
                    <li>MAU（月間アクティブ数）および日次新規ユーザー推移</li>
                    <li>想い出クイズ回答率 ＆ マッチング成立件数</li>
                    <li>AI検閲隔離件数 ＆ ユーザー通報件数</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <Mail size={16} className="text-teal-700" />
                  <span>2. ボトルメール管理 (Posts) ＆ 削除アーカイブ</span>
                </h4>
                <p className="text-black/70">
                  漂流中の全ボトルメールの検索、内容のダイレクト修正（誤字脱字による連絡不能の救済）、および証跡付き削除を実行します。
                </p>
                <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1 text-[11px]">
                  <b>🗑️ 証跡付き削除のルール:</b>
                  <p className="text-black/60">
                    手紙を削除する際は、必ず「削除理由（攻撃的表現、個人情報露出、本人申告等）」を選択または記入します。削除された手紙は「削除アーカイブ」に理由とともに永久保全され、警察捜査時に証跡として提出可能です。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>3. 奇跡の物語管理 (Success Stories)</span>
              </h4>
              <p className="text-black/70">
                実際に再会に成功した感動的なエピソードを編集・公開し、トップページや専用ページへ掲載して利用者の投函意欲を高めます。掲載/非掲載のトグルや表示順序の調整が可能です。
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 3: AI Safety & Moderation                            */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 3 && (
          <div id="chapter-content-3" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-4">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Bot size={16} className="text-sky-600" />
                <span>1. Gemini 2.5 Flash リアルタイムAI検閲エンジン</span>
              </h4>
              <p className="text-black/70">
                ユーザーが手紙を投函した瞬間に、Gemini AIが「ストーカー性」「誹謗中傷・怨恨」「直接的な個人情報露出」「不当な出会い目的」をリアルタイム多層解析します。
                不適切と判定されたメッセージは即座に隔離（<code>ai_flagged = 1</code>）され、一般の海には漂流しません。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-600" />
                  <span>2. 安全防衛検閲シミュレーター (50選大図鑑)</span>
                </h4>
                <p className="text-black/70">
                  「セキュリティ」タブ内のシミュレーターでは、実際のAIエンジンを用いて文章の検閲テストを実行できます。50選大図鑑から例文をワンクリックで読み込み、検知理由や危険度スコアを確認可能です。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <span>3. 通報管理 (Reports) ＆ NGワード辞書</span>
                </h4>
                <p className="text-black/70">
                  ユーザーから寄せられた通報キューを審査し、対象ボトルの非公開化やユーザーの強制ブロック（<code>is_blocked = 1</code>）を執行します。NGワード辞書への即時登録も可能です。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 4: Contacts, Emails & Global Broadcasts               */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 4 && (
          <div id="chapter-content-4" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <Mail size={16} className="text-indigo-600" />
                  <span>1. お問い合わせSLA管理 ＆ 自動カテゴリ分類</span>
                </h4>
                <p className="text-black/70">
                  一般窓口へのお問い合わせを「未対応」「保留中」「対応完了」のステータスで管理。AIによる緊急度判定（アカウント凍結、決済不備、通報等）により優先度順にソートされます。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <FileText size={16} className="text-teal-700" />
                  <span>2. 送信メールテンプレート管理 (8種類)</span>
                </h4>
                <p className="text-black/70">
                  ボトル開封通知、マッチング成立、eKYC審査結果、返金完了など、システムから自動送信される全8種類のHTMLメールテンプレートの文面プレビューおよびテスト送信が可能です。
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Bell size={16} className="text-amber-500" />
                <span>3. 全体一括配信 (Notifications)</span>
              </h4>
              <p className="text-black/70">
                重要規約の改定、システムメンテナンス予告、防犯啓発メッセージを全ユーザーまたは特定グループ宛てに一括プッシュ通知・インApp配信します。
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 5: Payments, eKYC & Monetization Simulator           */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 5 && (
          <div id="chapter-content-5" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
              <h4 className="font-bold text-sm text-teal-950 flex items-center gap-2">
                <CreditCard size={16} className="text-teal-700" />
                <span>1. 決済トランザクション台帳 ＆ 粗利アナリティクス</span>
              </h4>
              <p className="text-teal-900">
                「決済履歴・eKYC統合管理」タブでは、4つのサブタブを通じて入出金を完全管理します：
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-sans">
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">① 決済台帳</span>
                  <p className="text-[11px] text-black/60">全トランザクション一覧、個別手動返金、CSV出力</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">② 粗利分析</span>
                  <p className="text-[11px] text-black/60">日次売上推移グラフ、Stripe・SMS・eKYC原価控除後の純利益</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">③ eKYC監査</span>
                  <p className="text-[11px] text-black/60">本人確認審査合格/不合格ログ、法令管理</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                  <span className="font-bold text-black text-xs block">④ Stripe模擬決済</span>
                  <p className="text-[11px] text-black/60">Sandboxテスト決済の即時発行、返金動作検証</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Coins size={16} className="text-emerald-700" />
                <span>2. 課金モデル収益シミュレーター (BEP ＆ 成長プリセット)</span>
              </h4>
              <p className="text-black/70">
                「課金モデル収益シミュレーター」では、MAU拡大に伴う損益分岐点（BEP AreaChart）や、4大成長フェーズ（初期・成長・バズ・全国）のワンクリック試算、追加マネタイズ（プレミアムボトル・アーカイブサブスク等）のアップサイド検証が可能です。
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 6: System Diagnostics & Security Center               */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 6 && (
          <div id="chapter-content-6" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <Activity size={16} className="text-teal-700" />
                  <span>1. システムセンター (System Center)</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-black/70">
                  <li><b>動的レート制限スライダー:</b> 認証API、投稿API、検索APIの秒間アクセス上限をリアルタイム調整。</li>
                  <li><b>DB健康診断 ＆ 最適化:</b> VACUUM実行、PRAGMA optimize、インデックス再構築。</li>
                  <li><b>環境変数点検ランプ:</b> GEMINI_API_KEY、STRIPE_SECRET_KEY等の設定状況を信号ランプで即時可視化。</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <ShieldCheck size={16} className="text-sky-600" />
                  <span>2. セキュリティセンター ＆ ログ監査</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-black/70">
                  <li><b>DoS・不正アクセス遮断:</b> 悪質IPの即時ブロック・解除リスト管理。</li>
                  <li><b>警察照会基準データ保全:</b> 刑訴法197条に基づく照会用ログの出力。</li>
                  <li><b>バージョン履歴 (Versions):</b> Gitコミット履歴およびSemantic Versioningの差分追跡。</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 7: M&A Valuation & Master Knowledge Base              */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 7 && (
          <div id="chapter-content-7" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <Award size={16} className="text-rose-600" />
                  <span>1. M&A企業価値評価データ室 (Data Room)</span>
                </h4>
                <p className="text-black/70">
                  DCF法（割引現在価値）とEBITDAマルチプル法のデュアル算定エンジンを搭載。本日時点の企業価値評価額（ベースライン 約1,074万円）、資産インベントリ目録、および投資家・買い手企業向け完全版IM（事業概要説明書）テキストを即時出力できます。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
                <h4 className="font-bold text-sm text-black flex items-center gap-2">
                  <BookOpen size={16} className="text-teal-700" />
                  <span>2. マスター備忘録 ＆ 公式運営ライブラリ</span>
                </h4>
                <p className="text-black/70">
                  「17大本番デプロイチェックリスト」「LINE/Google・SMS認証コスト仕様」「警察・eKYC連携基準」「責任の所在10大決定事項」を1箇所に完全統合。運営者メモボード（LocalStorage永続化）も完備しています。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CHAPTER 8: Design System & UI Specs                           */}
        {/* ------------------------------------------------------------- */}
        {activeChapter === 8 && (
          <div id="chapter-content-8" className="space-y-6 text-xs leading-relaxed text-black/80">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Palette size={16} className="text-indigo-600" />
                <span>1. ReMEETs デザインシステム 4大設計原則</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1">
                  <b>① 情緒と法的信頼性の共存</b>
                  <p className="text-black/60 text-[11px]">手紙には和文明朝（font-serif）、管理・法的画面にはクリーンな白背景とモノスペース。</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1">
                  <b>② ボタンラベルの改行禁止</b>
                  <p className="text-black/60 text-[11px]">ボタン内テキストの途中改行を厳禁（white-space: nowrap）。</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1">
                  <b>③ 角丸ネスト計算公式</b>
                  <p className="text-black/60 text-[11px]">内部角丸 ＝ 外部角丸 － パディング により視覚的歪みを防止。</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1">
                  <b>④ 完全買い切り・透明な料金表示</b>
                  <p className="text-black/60 text-[11px]">600 円（税込）の明朗会計と返金保証ポリシーの徹底。</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Sliders size={16} className="text-teal-700" />
                <span>2. インタラクティブUIテスター ＆ トークンエクスポート</span>
              </h4>
              <p className="text-black/70">
                デザインシステムタブでは、ボタン状態（通常・ローディング・成功・無効）の実機テスト、トースト通知発火、春夏秋冬4テーマのカードプレビュー、および Tailwind Config / CSS変数のワンクリックコピーが可能です。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 🖨️ PRINT-ONLY CONTAINER (ONE UNIFIED BOUND BOOK FOR PDF DOWNLOAD)     */}
      {/* ==================================================================== */}
      <div id="print-book-container" className="hidden print:block p-8 space-y-12">
        {/* COVER PAGE */}
        <div className="page-break flex flex-col justify-between min-h-[90vh] p-12 text-center border-4 border-slate-900 rounded-3xl">
          <div className="space-y-4 pt-12">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              CONFIDENTIAL & OFFICIAL STANDARD OPERATING PROCEDURES
            </span>
            <h1 className="text-4xl font-serif font-bold text-slate-900 pt-6">
              ReMEETs 〜再会のボトルメール〜<br />
              管理者操作マニュアル ＆ 運用総合手順書
            </h1>
            <p className="text-sm text-slate-600 font-sans max-w-xl mx-auto pt-4">
              システム基盤、AI安全防衛、決済・eKYC、法令遵守、M&A評価、およびデザインシステムに関する完全公式ハンドブック
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-lg mx-auto space-y-2 text-xs font-sans">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">サービス提供開始日:</span>
              <span className="font-bold">2026年8月15日</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">マニュアル版数:</span>
              <span className="font-bold font-mono">Ver 2.5 (改訂完全版)</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">管轄・適用法令:</span>
              <span className="font-bold">刑訴法197条 / 個人情報保護法 / 特商法</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">機密区分:</span>
              <span className="font-bold text-rose-700">社外秘 (Internal Confidential)</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono pb-8">
            © 2026 ReMEETs Project. All Rights Reserved.
          </div>
        </div>

        {/* TABLE OF CONTENTS */}
        <div className="page-break space-y-6 pt-8">
          <h2 className="text-2xl font-serif font-bold text-slate-900 border-b-2 border-slate-900 pb-2">
            📑 目次 (Table of Contents)
          </h2>
          <div className="space-y-4 text-xs font-sans">
            {chapters.map((ch) => (
              <div key={ch.id} className="flex justify-between items-baseline border-b border-dotted border-slate-300 pb-2">
                <div>
                  <b className="font-mono text-slate-900 mr-2">{ch.number}</b>
                  <span className="font-bold text-slate-800">{ch.title}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{ch.subtitle}</span>
                </div>
                <span className="font-mono text-slate-400">P. {ch.id + 2}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHAPTER PAGES (ONE PER CHAPTER) */}
        {chapters.map((ch) => (
          <div key={ch.id} className="page-break space-y-6 pt-8">
            <div className="border-b-2 border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-teal-800 uppercase">{ch.number}</span>
              <h2 className="text-xl font-serif font-bold text-slate-900">{ch.title}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{ch.subtitle}</p>
            </div>

            {/* Chapter 1 Print Content */}
            {ch.id === 1 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. 個人情報・通信の秘密の保護方針</h3>
                  <p>当プラットフォームは、お相手の「名前」と「二人だけの思い出」を鍵とすることで、一般のメッセージボトルのような見知らぬ人への個人情報漏洩を防いでいます。管理者が興味本位でボトル内容や連絡先を覗き見・悪用することは法律上厳重に禁止されます。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. 個人情報ゼロ保持（Zero Data Retention）モデル</h3>
                  <p>身分証生画像はTRUSTDOCK等のeKYCサーバーに直接送信され、Webサーバーには一切保存しません。クレジットカード番号もStripeサーバーと直接通信し、Webサーバーを通過しません。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">3. 役職ロール・権限分離（RBAC: 4階層）</h3>
                  <p>オーナー（全権限）、最高管理者（日常運用・返金）、監査役（ログ・警察照会閲覧）、モデレーター（通報・NGワード対応）の権限分離により内部不正を完全防御します。</p>
                </div>
              </div>
            )}

            {/* Chapter 2 Print Content */}
            {ch.id === 2 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. ダッシュボードKPI監視</h3>
                  <p>本日の投関数、新規登録数、メッセージ往復数、開通された（クイズ正解）ペア数をリアルタイム集計表示し、サービスの稼働状態を俯瞰します。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. 漂流ボトル管理 ＆ 証跡付き削除</h3>
                  <p>誤字脱字による連絡不能救済のためのダイレクト編集機能と、削除理由を記録して保全する削除監査アーカイブ機能を備えています。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">3. 奇跡の物語管理</h3>
                  <p>再会成立の実例エピソードを編集・公開し、トップページや専用ページへ掲載して利用意欲を高めます。</p>
                </div>
              </div>
            )}

            {/* Chapter 3 Print Content */}
            {ch.id === 3 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. Gemini 2.5 Flash リアルタイム検閲</h3>
                  <p>投稿時にAIがストーカー性、誹謗中傷、個人情報露出をリアルタイム解析し、危険文章を自動隔離（ai_flagged = 1）します。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. 安全防衛検閲シミュレーター (50選大図鑑)</h3>
                  <p>管理画面上でAIエンジンの判定挙動をテスト検証できるシミュレーターを完備しています。</p>
                </div>
              </div>
            )}

            {/* Chapter 4 Print Content */}
            {ch.id === 4 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. お問い合わせSLA管理</h3>
                  <p>未対応・保留・完了フラグの管理とAI自動分類による緊急度判定で迅速なユーザーサポートを実現します。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. 8種メールテンプレート ＆ 一括配信</h3>
                  <p>自動送信メール文面のプレビュー・テスト送信と、全ユーザー宛ての重要告知一括配信を管理します。</p>
                </div>
              </div>
            )}

            {/* Chapter 5 Print Content */}
            {ch.id === 5 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. 決済台帳・手動返金 ＆ 粗利分析</h3>
                  <p>Stripe決済の一覧、ワンクリック個別返金、Stripe手数料（3.6%）・SMS送信費（12円）・eKYC費（200円）控除後の純手元利益（+366円/件）の集計グラフを完備。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. 課金モデル収益シミュレーター</h3>
                  <p>損益分岐点（BEP）カーブ、4大成長ステージプリセット、追加マネタイズオプションの試算が可能です。</p>
                </div>
              </div>
            )}

            {/* Chapter 6 Print Content */}
            {ch.id === 6 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. システムセンター ＆ 動的レート制限</h3>
                  <p>APIごとのアクセスレート制限スライダー、DB VACUUM/PRAGMA optimize、環境変数ヘルスランプを管理。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. セキュリティセンター ＆ バージョン履歴</h3>
                  <p>悪質IP遮断、警察照会基準ログ、Gitコミット連動のバージョン履歴追跡。</p>
                </div>
              </div>
            )}

            {/* Chapter 7 Print Content */}
            {ch.id === 7 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. M&A企業価値評価データ室</h3>
                  <p>DCF法 ＆ EBITDAマルチプル法のデュアル算定エンジン、資産インベントリ目録、IM事業概要書のテキスト出力を完備。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. マスター備忘録室</h3>
                  <p>17大本番デプロイチェックリスト、SNS/SMS認証仕様、警察照会基準、責任の所在10大決定事項の完全集約。</p>
                </div>
              </div>
            )}

            {/* Chapter 8 Print Content */}
            {ch.id === 8 && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">1. デザインシステム 4大原則</h3>
                  <p>情緒と法的信頼性の共存、ボタンラベル改行禁止、角丸ネスト計算公式、600円完全買い切りの透明な料金表示。</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">2. UIパーツ ＆ トークンエクスポート</h3>
                  <p>16色カラーパレット（WCAG AAA/AA準拠）、ボタン状態テスター、Tailwind/CSS変数出力。</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManualView;
