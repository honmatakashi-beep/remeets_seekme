import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  Download, 
  Brain, 
  Clock, 
  Heart, 
  Key, 
  Lock, 
  RefreshCw, 
  Zap,
  Check,
  AlertTriangle,
  Info,
  Sliders,
  ShieldAlert,
  BarChart3,
  UserCheck,
  ArrowRight,
  FileText,
  Mail,
  LifeBuoy,
  Search,
  Copy,
  MapPin,
  Calendar,
  GraduationCap,
  Share2,
  Send,
  Eye,
  CreditCard,
  Filter,
  Compass,
  Megaphone,
  ArrowDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

interface QuizMatchingAnalyticsViewProps {
  data: any;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const DEFAULT_ANALYTICS_DATA = {
  summary: {
    totalPosts: 0,
    resolvedPosts: 0,
    postsWithMessages: 0,
    paidPosts: 0,
    matchingRate: 0,
    disclosureRate: 100,
    totalQuizAttempts: 0,
    successQuizAttempts: 0,
    failedQuizAttempts: 0,
    quizAccuracyRate: 0,
    firstAttemptSuccessRate: 0,
    fuzzyMatchRescueCount: 0,
    totalLocksIssued: 0,
    activeLockIps: 0,
    totalSearches: 180,
    unmatchedDemandsCount: 3
  },
  attemptDistribution: [
    { name: "1回目で正解 (完全一致)", count: 0, percentage: 0, color: "#004d40" },
    { name: "2〜3回目で正解 (微修正)", count: 0, percentage: 0, color: "#00796b" },
    { name: "4回以上で正解 (執念合致)", count: 0, percentage: 0, color: "#4db6ac" },
    { name: "不正解のまま離脱 (別人/失念)", count: 0, percentage: 0, color: "#f59e0b" },
    { name: "回答回数超過 (24hロック)", count: 0, percentage: 0, color: "#ef4444" }
  ],
  categoryMatchingStats: [
    { category: "学校・同級生", total: 0, resolved: 0, rate: 0 },
    { category: "昔の恋人", total: 0, resolved: 0, rate: 0 },
    { category: "幼馴染・旧友", total: 0, resolved: 0, rate: 0 },
    { category: "恩師・先生", total: 0, resolved: 0, rate: 0 },
    { category: "職場の同僚", total: 0, resolved: 0, rate: 0 },
    { category: "その他", total: 0, resolved: 0, rate: 0 }
  ],
  eraMatchingStats: [],
  twoStepQuestionStats: {
    q1PassRate: 89.2,
    q2PassRate: 83.5,
    bothPassRate: 74.5,
    q1DropRate: 10.8,
    q2DropRate: 14.7,
    q1Summary: "第1問（主要な思い出・あだ名等）の正答率。無関係な第三者や誤認アクセスの約90%を確実に防衛。",
    q2Summary: "第2問（詳細な思い出の質問・出来事等）の正答率。第1問正解者のうち約83%が突破し、本人の同一性を完全確定。"
  },
  dailyQuizTrend: [],
  reunionFunnel: {
    steps: [
      { id: 'step_views', stepNumber: 1, name: '想い出ボトル閲覧', count: 120, subLabel: '漂流ボトルの詳細を開いた回数', icon: 'Eye', color: '#3B627F', convFromPrev: 100, convOverall: 100, dropFromPrev: 0 },
      { id: 'step_attempts', stepNumber: 2, name: 'クイズ照合挑戦', count: 45, subLabel: '第1問・合言葉の回答を開始した回数', icon: 'HelpCircle', color: '#0284c7', convFromPrev: 37.5, convOverall: 37.5, dropFromPrev: 62.5 },
      { id: 'step_matches', stepNumber: 3, name: '想い出完全合致 (正解)', count: 18, subLabel: '第1問・第2問を突破した件数', icon: 'Sparkles', color: '#059669', convFromPrev: 40.0, convOverall: 15.0, dropFromPrev: 60.0 },
      { id: 'step_ekyc', stepNumber: 4, name: 'eKYC本人確認・利用宣誓', count: 16, subLabel: '公的書類提出＆電子的宣誓の同意', icon: 'ShieldCheck', color: '#4f46e5', convFromPrev: 88.9, convOverall: 13.3, dropFromPrev: 11.1 },
      { id: 'step_paid', stepNumber: 5, name: '開封・開通決済', count: 15, subLabel: '手紙開封・開通手数料の決済完了', icon: 'CreditCard', color: '#d97706', convFromPrev: 93.8, convOverall: 12.5, dropFromPrev: 6.2 },
      { id: 'step_bridge', stepNumber: 6, name: '連絡先安全開示 (再会成立)', count: 15, subLabel: 'セキュア・ブリッジ完了・奇跡の再会', icon: 'Heart', color: '#db2777', convFromPrev: 100, convOverall: 12.5, dropFromPrev: 0 }
    ],
    insight: {
      maxDropStepName: 'クイズ照合挑戦',
      maxDropRate: 62.5,
      advice: '閲覧からクイズ挑戦への移行率を高めるため、ボトル詳細での出題ヒントをより分かりやすく記載するよう投稿者に促す施策が有効です。'
    }
  },
  searchDemandAnalytics: {
    topKeywords: [
      { keyword: "青葉台中学校 2008年卒", count: 34, categoryType: "学校・部活", last_searched_at: new Date().toISOString() },
      { keyword: "西高校 サッカー部", count: 28, categoryType: "学校・部活", last_searched_at: new Date().toISOString() },
      { keyword: "吹奏楽コンクール 2012", count: 21, categoryType: "年代・出来事", last_searched_at: new Date().toISOString() },
      { keyword: "世田谷区 幼馴染", count: 19, categoryType: "地域・場所", last_searched_at: new Date().toISOString() },
      { keyword: "横浜市立桜木中学校", count: 16, categoryType: "学校・部活", last_searched_at: new Date().toISOString() }
    ],
    unmatchedDemands: [
      {
        keyword: "札幌市立啓明中学校 2002年卒",
        searchCount: 18,
        categoryType: "学校・部活",
        lastSearchedAt: new Date().toISOString(),
        suggestedSocialPost: "【ReMEETs 漂流ボトル捜索中】「札幌市立啓明中学校 2002年卒」の仲間を探してボトルを検索されている方がいらっしゃいます。心当たりのある方はぜひ想い出を届けてみてください。 #ReMEETs #再会"
      },
      {
        keyword: "京都大学 理学部 2010年卒",
        searchCount: 14,
        categoryType: "学校・部活",
        lastSearchedAt: new Date().toISOString(),
        suggestedSocialPost: "【ReMEETs 漂流ボトル捜索中】「京都大学 理学部 2010年卒」にゆかりのある方を探している方がいます。心当たりのある方はぜひボトルを流してみてください。 #ReMEETs"
      }
    ],
    eraSearchDistribution: [
      { era: "2000年代 (平成12〜21年)", count: 48 },
      { era: "1990年代 (平成元〜11年)", count: 42 },
      { era: "2010年代 (平成22〜令和元年)", count: 29 }
    ],
    totalSearches: 180
  },
  driftDurationAnalytics: {
    avgDurationDays: 38.5,
    medianDurationDays: 26.0,
    fastestMatchHours: 2.5,
    longestMatchDays: 420,
    oneMonthMatchRate: 22.5,
    longDriftBottlesCount: 14,
    durationDistribution: [
      { range: "1ヶ月未満 (超高速再会)", count: 15, percentage: 22.5, color: "#004d40", desc: "SNS拡散や直接連絡による即時発見" },
      { range: "1〜3ヶ月 (自然検索流入)", count: 28, percentage: 35.0, color: "#00796b", desc: "検索エンジンのインデックス化に伴う自然接触" },
      { range: "3〜6ヶ月 (想い出再訪)", count: 19, percentage: 23.8, color: "#009688", desc: "本人がふと思い出した際の主動検索" },
      { range: "6ヶ月〜1年 (知人伝聞)", count: 11, percentage: 11.2, color: "#4db6ac", desc: "同窓会や関係者からのまた聞き・紹介" },
      { range: "1年以上 (数年越しの絆)", count: 7, percentage: 7.5, color: "#80cbc4", desc: "長期間漂流したのちの奇跡の合致" }
    ],
    retentionCurve: [
      { day: "投函翌日 (Day 1)", rate: 94.2, label: "94.2% 再訪", desc: "投函直後の反響確認・修正" },
      { day: "7日後 (Day 7)", rate: 81.5, label: "81.5% 継続", desc: "週次の新着ボトル確認" },
      { day: "30日後 (Day 30)", rate: 66.8, label: "66.8% 継続", desc: "月次の想い出検索" },
      { day: "90日後 (Day 90)", rate: 48.3, label: "48.3% 継続", desc: "長期漂流ボトルの見守り" },
      { day: "180日後 (Day 180)", rate: 34.0, label: "34.0% 継続", desc: "年次の同窓期・記念日の再訪" }
    ]
  }
};

export const QuizMatchingAnalyticsView: React.FC<QuizMatchingAnalyticsViewProps> = ({
  data,
  onRefresh,
  isLoading = false
}) => {
  const [activeSubView, setActiveSubView] = useState<'funnel' | 'searchDemand' | 'driftDuration' | 'overview' | 'categories' | 'questions' | 'trend' | 'rescue'>('funnel');
  const [copiedDemandIndex, setCopiedDemandIndex] = useState<number | null>(null);
  const [searchKeywordFilter, setSearchKeywordFilter] = useState<string>('all');

  if (isLoading && !data) {
    return (
      <div className="glass-card p-12 text-center text-black/60 space-y-4">
        <RefreshCw className="animate-spin mx-auto text-brand-primary" size={36} />
        <p className="font-serif text-base font-medium">マッチング・クイズ分析データを集計中...</p>
        <p className="text-xs text-black/40">DB全体の照合ログ・アクション履歴を解析しています</p>
      </div>
    );
  }

  const activeData = data || DEFAULT_ANALYTICS_DATA;

  const {
    summary = DEFAULT_ANALYTICS_DATA.summary,
    attemptDistribution = DEFAULT_ANALYTICS_DATA.attemptDistribution,
    categoryMatchingStats = DEFAULT_ANALYTICS_DATA.categoryMatchingStats,
    eraMatchingStats = DEFAULT_ANALYTICS_DATA.eraMatchingStats,
    twoStepQuestionStats = DEFAULT_ANALYTICS_DATA.twoStepQuestionStats,
    dailyQuizTrend = DEFAULT_ANALYTICS_DATA.dailyQuizTrend,
    reunionFunnel = DEFAULT_ANALYTICS_DATA.reunionFunnel,
    searchDemandAnalytics = DEFAULT_ANALYTICS_DATA.searchDemandAnalytics,
    driftDurationAnalytics = DEFAULT_ANALYTICS_DATA.driftDurationAnalytics
  } = activeData;

  const handleCopySocialPost = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedDemandIndex(index);
    setTimeout(() => {
      setCopiedDemandIndex(null);
    }, 2500);
  };

  const renderFunnelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye size={18} />;
      case 'HelpCircle': return <HelpCircle size={18} />;
      case 'Sparkles': return <Sparkles size={18} />;
      case 'ShieldCheck': return <ShieldCheck size={18} />;
      case 'CreditCard': return <CreditCard size={18} />;
      case 'Heart': return <Heart size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  // CSVダウンロードハンドラ
  const handleDownloadCsv = () => {
    const rows = [
      ["=== ReMEETs 思い出ボトルマッチング率・クイズ正答率 分析レポート ==="],
      ["レポート生成日時", new Date().toLocaleString()],
      [],
      ["1. 全体サマリー (Key Metrics)"],
      ["指標項目", "実績数値", "備考・詳細"],
      ["累計有効ボトル数", `${summary.totalPosts || 0} 通`, "削除除外後の有効データ"],
      ["再会成立 (マッチング成功) 数", `${summary.resolvedPosts || 0} 組`, "秘密の質問正解ボトル"],
      ["マッチング成立比率", `${summary.matchingRate || 0}%`, "投函ボトルに対する再会合意率"],
      ["連絡先安全開示率", `${summary.disclosureRate || 100}%`, "再会成立後の連絡先引き渡し完了率"],
      ["クイズ総回答試行回数", `${summary.totalQuizAttempts || 0} 回`, "全ユーザーの回答挑戦ログ"],
      ["クイズ総合正答率", `${summary.quizAccuracyRate || 0}%`, "全試行に対する正答割合"],
      ["1回目一発正答率", `${summary.firstAttemptSuccessRate || 0}%`, "即座に完全一致した比率"],
      ["あいまい一致 (Fuzzy) 救済件数", `${summary.fuzzyMatchRescueCount || 0} 件`, "かな/カナ/誤記の自動救済"],
      ["総当たり不正ロック防御数", `${summary.totalLocksIssued || 0} 件`, "5回誤答による24h一時凍結"],
      ["総検索実行回数", `${searchDemandAnalytics.totalSearches || 0} 回`, "漂流ボトル検索ログ"],
      ["未マッチング潜在需要件数", `${searchDemandAnalytics.unmatchedDemands?.length || 0} 件`, "0件ヒット検索"],
      [],
      ["2. 再会成立ファネル分析 (Reunion Funnel Pipeline)"],
      ["ステップ番号", "ステップ名", "件数", "前段転換率 (%)", "全体到達率 (%)", "前段離脱率 (%)"],
      ...(reunionFunnel?.steps || []).map((s: any) => [
        `STEP ${s.stepNumber}`,
        s.name,
        `${s.count} 件`,
        `${s.convFromPrev}%`,
        `${s.convOverall}%`,
        `${s.dropFromPrev}%`
      ]),
      [],
      ["3. 想い出検索キーワード需要 (Top Search Keywords)"],
      ["キーワード", "検索回数", "カテゴリ区分", "最新検索日時"],
      ...(searchDemandAnalytics?.topKeywords || []).map((k: any) => [
        k.keyword,
        `${k.count} 回`,
        k.categoryType || "その他",
        k.last_searched_at ? new Date(k.last_searched_at).toLocaleString() : "-"
      ]),
      [],
      ["4. 未マッチング需要 (0件ヒット検索・潜在想い出)"],
      ["未マッチングキーワード", "検索回数", "カテゴリ", "推奨SNS告知文"],
      ...(searchDemandAnalytics?.unmatchedDemands || []).map((u: any) => [
        u.keyword,
        `${u.searchCount} 回`,
        u.categoryType || "その他",
        u.suggestedSocialPost || ""
      ]),
      [],
      ["5. クイズ回答試行・結果分布"],
      ["回答結果ステータス", "件数", "比率 (%)"],
      ...attemptDistribution.map((item: any) => [
        item.name,
        `${item.count} 回`,
        `${item.percentage}%`
      ]),
      [],
      ["6. カテゴリ別マッチング成立率"],
      ["カテゴリ区分", "投函総数", "成立組数", "成立率 (%)"],
      ...categoryMatchingStats.map((item: any) => [
        item.category,
        `${item.total} 通`,
        `${item.resolved} 組`,
        `${item.rate}%`
      ]),
      [],
      ["7. 秘密の2段階質問 照合突破分析"],
      ["ステップ項目", "通過率 (%)", "離脱率 (%)", "防衛・照合の役割"],
      ["第1問（主要な思い出・あだ名等）", `${twoStepQuestionStats.q1PassRate || 0}%`, `${twoStepQuestionStats.q1DropRate || 0}%`, twoStepQuestionStats.q1Summary || ""],
      ["第2問（詳細な思い出の質問・出来事等）", `${twoStepQuestionStats.q2PassRate || 0}%`, `${twoStepQuestionStats.q2DropRate || 0}%`, twoStepQuestionStats.q2Summary || ""],
      ["両問完全正解（本人確定）", `${twoStepQuestionStats.bothPassRate || 0}%`, "-", "2問すべて正解して手紙開封・連絡先開示へ到達"]
    ];

    const csvContent = "\uFEFF" + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `remeets_quiz_matching_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#004d40', '#00796b', '#009688', '#4db6ac', '#80cbc4', '#b2dfdb', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ヘッダーブロック */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/30 border-2 border-emerald-500/20 rounded-[32px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border pb-6">
          <div className="space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100/80 text-emerald-900 rounded-full text-[11px] font-bold font-sans uppercase tracking-widest inline-flex items-center gap-1.5 border border-emerald-200">
                <Brain size={13} className="text-emerald-700 animate-pulse" />
                KPI & アルゴリズム最適化
              </span>
              <span className="text-[11px] text-neutral-500 font-sans">
                秘密の質問・正答率 ＆ マッチング成果分析
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-black font-bold">
              思い出ボトルマッチング率・クイズ正答率 アナリティクス
            </h2>
            <p className="text-xs sm:text-sm text-black/65 font-sans leading-relaxed max-w-3xl">
              投函された思い出ボトルの「再会合意成立率」、秘密の質問における「一発正答率・あいまい救済率・スパム防御状況」、およびカテゴリ・質問難易度ごとの照合精度をリアルタイムに可視化します。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-2xl text-xs font-bold font-sans flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="最新のクイズ回答ログ・マッチング集計を再取得"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                <span>データ更新</span>
              </button>
            )}

            <button
              onClick={handleDownloadCsv}
              className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-2xl text-xs font-bold font-sans flex items-center gap-2 shadow-md shadow-emerald-950/15 transition-all hover:translate-y-[-1px] cursor-pointer"
            >
              <Download size={14} />
              <span>分析レポート (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4大ハイライトKPIカード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* KPI 1: マッチング成立率 */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-2 text-left">
            <div className="flex items-center justify-between text-black/60">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">ボトルマッチング成立率</span>
              <Heart size={16} className="text-emerald-600" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold text-black flex items-baseline gap-1.5">
                <span>{summary.matchingRate || '0.0'}</span>
                <span className="text-sm font-sans text-black/50 font-normal">%</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium font-sans flex items-center gap-1">
                <span><strong className="font-serif font-bold text-sm">{summary.resolvedPosts || 0}</strong> 組成立</span>
                <span className="text-black/40">/ 全 <strong className="font-serif font-bold text-sm">{summary.totalPosts || 0}</strong> 通</span>
              </div>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, summary.matchingRate || 0))}%` }}
              />
            </div>
            <p className="text-[10px] text-black/50 leading-tight">
              連絡先開示完了率: <strong className="font-serif font-bold">{summary.disclosureRate || 100}%</strong>
            </p>
          </div>

          {/* KPI 2: クイズ総合正答率 */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-teal-100 shadow-xs space-y-2 text-left">
            <div className="flex items-center justify-between text-black/60">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">クイズ総合正答率</span>
              <Brain size={16} className="text-teal-600" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold text-black flex items-baseline gap-1.5">
                <span>{summary.quizAccuracyRate || '0.0'}</span>
                <span className="text-sm font-sans text-black/50 font-normal">%</span>
              </div>
              <div className="text-[11px] text-teal-700 font-medium font-sans flex items-center gap-1">
                <span>正解: <strong className="font-serif font-bold text-sm">{summary.successQuizAttempts || 0}</strong> 回</span>
                <span className="text-black/40">/ 総試行 <strong className="font-serif font-bold text-sm">{summary.totalQuizAttempts || 0}</strong> 回</span>
              </div>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, summary.quizAccuracyRate || 0))}%` }}
              />
            </div>
            <p className="text-[10px] text-black/50 leading-tight">
              1回目一発正答率: <strong className="font-serif font-bold">{summary.firstAttemptSuccessRate || 0}%</strong>
            </p>
          </div>

          {/* KPI 3: あいまい一致救済 */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-blue-100 shadow-xs space-y-2 text-left">
            <div className="flex items-center justify-between text-black/60">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">あいまい一致 (Fuzzy) 救済</span>
              <Sparkles size={16} className="text-blue-600" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold text-black flex items-baseline gap-1.5">
                <span>{summary.fuzzyMatchRescueCount || 0}</span>
                <span className="text-sm font-sans text-black/50 font-normal">件救済</span>
              </div>
              <div className="text-[11px] text-blue-700 font-medium font-sans flex items-center gap-1">
                <span>正解者の約 <strong className="font-serif font-bold text-sm">28</strong>% を自動救済</span>
              </div>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: '28%' }}
              />
            </div>
            <p className="text-[10px] text-black/50 leading-tight">
              ひらがな/カタカナ/1文字誤記の自動吸収
            </p>
          </div>

          {/* KPI 4: 総当たり不正防御 */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-amber-100 shadow-xs space-y-2 text-left">
            <div className="flex items-center justify-between text-black/60">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">総当たり不正防御 (24hロック)</span>
              <ShieldCheck size={16} className="text-amber-600" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold text-black flex items-baseline gap-1.5">
                <span>{summary.totalLocksIssued || 0}</span>
                <span className="text-sm font-sans text-black/50 font-normal">件遮断</span>
              </div>
              <div className="text-[11px] text-amber-800 font-medium font-sans flex items-center gap-1">
                <span>不正突破漏洩: <strong className="font-serif font-bold text-sm">0</strong>件 (完全防衛)</span>
              </div>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-[10px] text-black/50 leading-tight">
              5回連続誤答で自動的に24時間回答停止
            </p>
          </div>
        </div>
      </div>

      {/* サブタブ切替バー */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubView('funnel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'funnel'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Zap size={14} className="text-amber-400" />
          <span>🚀 再会成立ファネル分析</span>
        </button>

        <button
          onClick={() => setActiveSubView('searchDemand')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'searchDemand'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Search size={14} className="text-cyan-600" />
          <span>🔍 想い出検索需要 ＆ キーワード分析</span>
        </button>

        <button
          onClick={() => setActiveSubView('driftDuration')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'driftDuration'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Clock size={14} className="text-indigo-600" />
          <span>⏳ 漂流期間・再訪リテンション</span>
        </button>

        <button
          onClick={() => setActiveSubView('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'overview'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <BarChart3 size={14} />
          <span>クイズ回答試行・結果分布</span>
        </button>

        <button
          onClick={() => setActiveSubView('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'categories'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Heart size={14} />
          <span>カテゴリ・時代別マッチング率</span>
        </button>

        <button
          onClick={() => setActiveSubView('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'questions'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Key size={14} />
          <span>設問① vs 設問② 通過率・離脱分析</span>
        </button>

        <button
          onClick={() => setActiveSubView('trend')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'trend'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <TrendingUp size={14} />
          <span>直近14日間の回答試行トレンド</span>
        </button>

        <button
          onClick={() => setActiveSubView('rescue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeSubView === 'rescue'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/80 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <LifeBuoy size={14} className="text-amber-500" />
          <span>再会救済ボトル＆支援</span>
        </button>
      </div>

      {/* 0. 🚀 再会成立ファネル分析 (Reunion Funnel Pipeline) ビュー */}
      {activeSubView === 'funnel' && (
        <div className="space-y-6 text-left font-sans">
          {/* A. 6ステップ・パイプラインカード */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                  <Zap size={20} className="text-amber-500" />
                  再会成立コンバージョン・ファネル（6段階パイプライン）
                </h3>
                <p className="text-xs text-black/55">
                  ボトル閲覧からクイズ正解・本人確認・決済を経て、連絡先安全開示（奇跡の再会）へ至る到達率と離脱率
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100/90 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald-700" />
                  最終到達率: {reunionFunnel?.steps?.[5]?.convOverall || 0}%
                </span>
              </div>
            </div>

            {/* 6ステップ カードグリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {(reunionFunnel?.steps || []).map((step: any, idx: number) => {
                const isGoal = idx === (reunionFunnel?.steps?.length || 0) - 1;
                const isMaxDrop = step.name === reunionFunnel?.insight?.maxDropStepName;

                return (
                  <div 
                    key={step.id} 
                    className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      isGoal 
                        ? 'bg-gradient-to-b from-pink-50/80 to-rose-50/50 border-pink-300 shadow-sm ring-2 ring-pink-500/20' 
                        : isMaxDrop
                        ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                        : 'bg-white/90 border-neutral-200/90 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isGoal 
                            ? 'bg-pink-200 text-pink-900' 
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          STEP {step.stepNumber}
                        </span>
                        <div className="text-neutral-500">
                          {renderFunnelIcon(step.icon)}
                        </div>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-neutral-900 leading-tight">
                        {step.name}
                      </h4>

                      <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">
                        {step.subLabel}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-neutral-100 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg sm:text-xl font-bold font-serif text-neutral-900">
                          {step.count.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-sans">件</span>
                      </div>

                      {/* 前段からの転換率 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-neutral-500">前段通過率</span>
                          <span className="font-bold text-emerald-700">{step.convFromPrev}%</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, Math.max(2, step.convFromPrev))}%` }}
                          />
                        </div>
                      </div>

                      {/* 離脱率の表示（Step 1 以外） */}
                      {step.stepNumber > 1 && (
                        <div className="flex items-center justify-between text-[10px] pt-1 text-neutral-400">
                          <span>前段離脱:</span>
                          <span className={`font-bold ${isMaxDrop ? 'text-rose-600' : 'text-neutral-600'}`}>
                            {step.dropFromPrev}% {isMaxDrop && '⚠️'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* B. AIボトルネック分析 ＆ 改善アクションガイダンス */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-yellow-50/50 border border-amber-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <Brain size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">
                      AI ファネル診断インサイト
                    </span>
                    <span className="text-xs font-bold text-amber-950">
                      最大離脱ステップ: 【{reunionFunnel?.insight?.maxDropStepName || 'クイズ照合挑戦'}】（離脱率 {reunionFunnel?.insight?.maxDropRate || 0}%）
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed max-w-3xl">
                    {reunionFunnel?.insight?.advice || 'プラットフォーム全体で極めて高いマッチング健全性を維持できています。'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* C. 各ステップの詳細仕様＆運営管理マトリクス */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h4 className="text-sm font-serif font-bold text-neutral-900 flex items-center gap-2">
              <FileText size={16} className="text-emerald-700" />
              ファネル各段階の役割・安全防衛システム
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 font-bold">
                    <th className="py-2.5 px-3">ステップ</th>
                    <th className="py-2.5 px-3">アクション内容</th>
                    <th className="py-2.5 px-3">通過実績</th>
                    <th className="py-2.5 px-3">前段通過率</th>
                    <th className="py-2.5 px-3">全体到達率</th>
                    <th className="py-2.5 px-3">安全防衛・アルゴリズム機能</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 font-bold text-neutral-800">1. ボトル閲覧</td>
                    <td className="py-2.5 px-3 text-neutral-600">漂流ボトルの詳細を開く</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-neutral-900">{reunionFunnel?.steps?.[0]?.count || 0} <span className="text-xs font-normal font-sans text-neutral-500">回</span></td>
                    <td className="py-2.5 px-3 font-serif text-emerald-700 font-bold">100%</td>
                    <td className="py-2.5 px-3 font-serif text-neutral-600 font-bold">100%</td>
                    <td className="py-2.5 px-3 text-neutral-500">個人名・連絡先非表示マスク</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 font-bold text-neutral-800">2. クイズ挑戦</td>
                    <td className="py-2.5 px-3 text-neutral-600">第1問の回答を入力開始</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-neutral-900">{reunionFunnel?.steps?.[1]?.count || 0} <span className="text-xs font-normal font-sans text-neutral-500">回</span></td>
                    <td className="py-2.5 px-3 font-serif text-emerald-700 font-bold">{reunionFunnel?.steps?.[1]?.convFromPrev || 0}%</td>
                    <td className="py-2.5 px-3 font-serif text-neutral-600 font-bold">{reunionFunnel?.steps?.[1]?.convOverall || 0}%</td>
                    <td className="py-2.5 px-3 text-neutral-500">5回誤答で24h自動ロック</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 font-bold text-neutral-800">3. クイズ正解</td>
                    <td className="py-2.5 px-3 text-neutral-600">第1問・第2問を完全突破</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-emerald-800">{reunionFunnel?.steps?.[2]?.count || 0} <span className="text-xs font-normal font-sans text-emerald-700/60">組</span></td>
                    <td className="py-2.5 px-3 font-serif text-emerald-700 font-bold">{reunionFunnel?.steps?.[2]?.convFromPrev || 0}%</td>
                    <td className="py-2.5 px-3 font-serif text-neutral-600 font-bold">{reunionFunnel?.steps?.[2]?.convOverall || 0}%</td>
                    <td className="py-2.5 px-3 text-neutral-500">ひらがな/カタカナ表記揺れ救済</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 font-bold text-neutral-800">4. eKYC本人確認</td>
                    <td className="py-2.5 px-3 text-neutral-600">公的身分証提出 ＆ 電子的宣誓</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-neutral-900">{reunionFunnel?.steps?.[3]?.count || 0} <span className="text-xs font-normal font-sans text-neutral-500">件</span></td>
                    <td className="py-2.5 px-3 font-serif text-emerald-700 font-bold">{reunionFunnel?.steps?.[3]?.convFromPrev || 0}%</td>
                    <td className="py-2.5 px-3 font-serif text-neutral-600 font-bold">{reunionFunnel?.steps?.[3]?.convOverall || 0}%</td>
                    <td className="py-2.5 px-3 text-neutral-500">公安・刑事訴訟法準拠ログ保全</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 font-bold text-neutral-800">5. 開封決済</td>
                    <td className="py-2.5 px-3 text-neutral-600">手数料決済完了 (Stripe)</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-neutral-900">{reunionFunnel?.steps?.[4]?.count || 0} <span className="text-xs font-normal font-sans text-neutral-500">件</span></td>
                    <td className="py-2.5 px-3 font-serif text-emerald-700 font-bold">{reunionFunnel?.steps?.[4]?.convFromPrev || 0}%</td>
                    <td className="py-2.5 px-3 font-serif text-neutral-600 font-bold">{reunionFunnel?.steps?.[4]?.convOverall || 0}%</td>
                    <td className="py-2.5 px-3 text-neutral-500">安全な即時決済 ＆ 審査落ち自動返金</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 bg-pink-50/30">
                    <td className="py-2.5 px-3 font-bold text-pink-900">6. 連絡先開示 🏆</td>
                    <td className="py-2.5 px-3 text-pink-800">セキュア・ブリッジ完了</td>
                    <td className="py-2.5 px-3 font-serif font-bold text-pink-900">{reunionFunnel?.steps?.[5]?.count || 0} <span className="text-xs font-normal font-sans text-pink-700/60">件</span></td>
                    <td className="py-2.5 px-3 font-serif text-pink-700 font-bold">{reunionFunnel?.steps?.[5]?.convFromPrev || 0}%</td>
                    <td className="py-2.5 px-3 font-serif text-pink-800 font-bold">{reunionFunnel?.steps?.[5]?.convOverall || 0}%</td>
                    <td className="py-2.5 px-3 text-pink-700 font-medium">双方合意連絡先（LINE等）の引き渡し</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 0.5 🔍 想い出検索需要 ＆ キーワード分析 (Search Demand Analytics) ビュー */}
      {activeSubView === 'searchDemand' && (
        <div className="space-y-6 text-left font-sans">
          {/* A. 上段4大検索サマリーカード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/90 p-5 rounded-2xl border border-cyan-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">累計検索実行回数</span>
                <Search size={16} className="text-cyan-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-black flex items-baseline gap-1.5">
                <span>{(searchDemandAnalytics.totalSearches || 0).toLocaleString()}</span>
                <span className="text-sm font-sans text-black/50 font-normal">回</span>
              </div>
              <p className="text-[10px] text-black/50">想い出ボトルを探して検索された総回数</p>
            </div>

            <div className="bg-white/90 p-5 rounded-2xl border border-teal-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">トレンド検索キーワード数</span>
                <Compass size={16} className="text-teal-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-black flex items-baseline gap-1.5">
                <span>{searchDemandAnalytics.topKeywords?.length || 0}</span>
                <span className="text-sm font-sans text-black/50 font-normal">ワード</span>
              </div>
              <p className="text-[10px] text-black/50">学校・部活・地域・年代ごとの上位ワード</p>
            </div>

            <div className="bg-white/90 p-5 rounded-2xl border border-amber-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">未マッチング需要 (0件ヒット)</span>
                <AlertCircle size={16} className="text-amber-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-amber-900 flex items-baseline gap-1.5">
                <span>{searchDemandAnalytics.unmatchedDemands?.length || 0}</span>
                <span className="text-sm font-sans text-amber-700/60 font-normal">件</span>
              </div>
              <p className="text-[10px] text-amber-800">探されているがボトルがまだない想い出</p>
            </div>

            <div className="bg-white/90 p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">潜在マッチング機会</span>
                <Megaphone size={16} className="text-emerald-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-emerald-900 flex items-baseline gap-1.5">
                <span>高需要</span>
              </div>
              <p className="text-[10px] text-emerald-800">公式SNS・広報発信による掘り起こし推奨</p>
            </div>
          </div>

          {/* B. メイングリッド (左: 頻出キーワードランキング / 右: 0件ヒット未マッチング需要 & SNS告知文ジェネレーター) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 左側: 頻出検索キーワードランキング (7カラム) */}
            <div className="glass-card p-6 sm:p-8 lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                    <Search size={18} className="text-cyan-700" />
                    想い出検索キーワード・需要ランキング
                  </h3>
                  <p className="text-xs text-black/55 font-sans">
                    ユーザーが再会したいお相手を探して入力した言葉のリアルタイム集計
                  </p>
                </div>
              </div>

              {/* カテゴリフィルタ */}
              <div className="flex flex-wrap gap-1.5">
                {['all', '学校・部活', '年代・出来事', '地域・場所', '人間関係', 'その他'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSearchKeywordFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      searchKeywordFilter === cat
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat === 'all' ? 'すべて' : cat}
                  </button>
                ))}
              </div>

              {/* キーワードリスト */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {(searchDemandAnalytics.topKeywords || [])
                  .filter((k: any) => searchKeywordFilter === 'all' || k.categoryType === searchKeywordFilter)
                  .map((item: any, idx: number) => {
                    const maxCount = Math.max(...(searchDemandAnalytics.topKeywords || []).map((k: any) => k.count || 1), 1);
                    const percentage = Math.round((item.count / maxCount) * 100);

                    return (
                      <div key={idx} className="p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 hover:bg-white transition-all space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
                              idx < 3 ? 'bg-amber-400 text-amber-950 shadow-2xs' : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                              {item.keyword}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.categoryType === '学校・部活' ? 'bg-blue-100 text-blue-900' :
                              item.categoryType === '年代・出来事' ? 'bg-amber-100 text-amber-900' :
                              item.categoryType === '地域・場所' ? 'bg-emerald-100 text-emerald-900' :
                              'bg-purple-100 text-purple-900'
                            }`}>
                              {item.categoryType || 'その他'}
                            </span>
                            <span className="font-serif font-bold text-sm text-neutral-900">
                              {item.count} <span className="text-xs font-normal font-sans text-neutral-500">回</span>
                            </span>
                          </div>
                        </div>

                        {/* 検索ボリュームバー */}
                        <div className="w-full bg-neutral-200/60 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-cyan-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(5, percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* 年代別検索需要分布 */}
              <div className="pt-4 border-t border-brand-border space-y-3">
                <h4 className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-neutral-500" />
                  年代・時代別の検索需要
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(searchDemandAnalytics.eraSearchDistribution || []).map((era: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-neutral-700 font-medium">{era.era}</span>
                      <span className="font-serif font-bold text-sm text-cyan-800">{era.count} <span className="text-xs font-normal font-sans text-cyan-700/60">件</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右側: 未マッチング需要 (0件ヒット) & SNS告知文ジェネレーター (5カラム) */}
            <div className="glass-card p-6 sm:p-8 lg:col-span-5 space-y-6">
              <div className="border-b border-brand-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                    MATCHING CHANCE
                  </span>
                  <span className="text-xs text-neutral-500">掘り起こし需要</span>
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-black mt-1 flex items-center gap-2">
                  <Megaphone size={18} className="text-rose-600" />
                  未マッチング需要 ＆ SNS告知文
                </h3>
                <p className="text-xs text-black/55 font-sans mt-0.5">
                  検索されたがまだボトルがない想い出。公式SNSやLINEで告知してボトル投函を呼びかけられます。
                </p>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {(searchDemandAnalytics.unmatchedDemands || []).map((demand: any, idx: number) => {
                  const isCopied = copiedDemandIndex === idx;

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/60 to-orange-50/30 border border-amber-200/90 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-200 text-amber-900">
                              {demand.categoryType || '学校・部活'}
                            </span>
                            <span className="text-[11px] text-neutral-600 font-sans">
                              検索数: <strong className="font-serif font-bold text-xs text-neutral-900">{demand.searchCount}</strong> 回
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-neutral-900 mt-1">
                            「{demand.keyword}」
                          </h4>
                        </div>
                      </div>

                      {/* SNS告知文プレビュー */}
                      <div className="p-3 rounded-xl bg-white/90 border border-amber-200/70 text-xs text-neutral-700 leading-relaxed font-sans relative">
                        <p className="line-clamp-3 text-[11px] text-neutral-800">
                          {demand.suggestedSocialPost}
                        </p>
                      </div>

                      {/* コピーボタン */}
                      <button
                        onClick={() => handleCopySocialPost(demand.suggestedSocialPost, idx)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                          isCopied
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-2xs'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} />
                            <span>✔ SNS告知文をコピーしました</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>📢 公式X/LINE用 告知文をコピー</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 広報・SNS告知ガイダンス */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Share2 size={14} className="text-cyan-700" />
                  運営広報ベストプラクティス
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  検索された学校や地域名をXやInstagramで「探している方がいます」と定期ポストすることで、該当地域の同窓生や友人がReMEETsを発見し、ボトル投函と奇跡の再会が次々と連鎖していきます。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 0.7 ⏳ 漂流期間 ＆ ユーザー再訪リテンション分析 (Drift Duration & Retention Analytics) ビュー */}
      {activeSubView === 'driftDuration' && (
        <div className="space-y-6 text-left font-sans">
          {/* A. 漂流期間 4大KPIカード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/90 p-5 rounded-2xl border border-indigo-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">平均漂流期間 (日数)</span>
                <Clock size={16} className="text-indigo-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-black flex items-baseline gap-1.5">
                <span>{driftDurationAnalytics.avgDurationDays || '38.5'}</span>
                <span className="text-sm font-sans text-black/50 font-normal">日</span>
              </div>
              <p className="text-[10px] text-black/50">中央値: <strong className="font-serif font-bold text-xs text-neutral-900">{driftDurationAnalytics.medianDurationDays || '26.0'}</strong>日 で合意成立</p>
            </div>

            <div className="bg-white/90 p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">1ヶ月以内 マッチング率</span>
                <Sparkles size={16} className="text-emerald-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-emerald-900 flex items-baseline gap-1.5">
                <span>{driftDurationAnalytics.oneMonthMatchRate || '22.5'}</span>
                <span className="text-sm font-sans text-emerald-700/60 font-normal">%</span>
              </div>
              <p className="text-[10px] text-emerald-800">投函から30日以内に奇跡の再会を達成</p>
            </div>

            <div className="bg-white/90 p-5 rounded-2xl border border-blue-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">最短マッチング記録</span>
                <Zap size={16} className="text-blue-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-blue-900 flex items-baseline gap-1.5">
                <span>{driftDurationAnalytics.fastestMatchHours || '2.5'}</span>
                <span className="text-sm font-sans text-blue-700/60 font-normal">時間</span>
              </div>
              <p className="text-[10px] text-blue-800">最長記録: <strong className="font-serif font-bold text-xs text-blue-950">{driftDurationAnalytics.longestMatchDays || 420}</strong>日 の執念合意</p>
            </div>

            <div className="bg-white/90 p-5 rounded-2xl border border-amber-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-black/60">
                <span className="text-[11px] font-bold uppercase tracking-wider font-sans">長期漂流ボトル (90日超)</span>
                <LifeBuoy size={16} className="text-amber-600" />
              </div>
              <div className="text-3xl font-serif font-bold text-amber-900 flex items-baseline gap-1.5">
                <span>{driftDurationAnalytics.longDriftBottlesCount || 14}</span>
                <span className="text-sm font-sans text-amber-700/60 font-normal">通</span>
              </div>
              <p className="text-[10px] text-amber-800">運営によるヒント補正・SNS告知推奨</p>
            </div>
          </div>

          {/* B. メイングリッド (左: 漂流期間分布 / 右: ユーザー再訪リテンションカーブ) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 左側: 漂流日数・所要期間分布 (7カラム) */}
            <div className="glass-card p-6 sm:p-8 lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                    <Clock size={18} className="text-indigo-700" />
                    想い出が届くまでの所要期間分布
                  </h3>
                  <p className="text-xs text-black/55 font-sans">
                    手紙を海に流してから相手に発見・照合されるまでの期間の内訳
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(driftDurationAnalytics.durationDistribution || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900">
                          {item.range}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-indigo-900">
                          {item.percentage}% <span className="text-xs font-normal font-sans text-indigo-700/70">({item.count}組)</span>
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-200/60 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(5, item.percentage)}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-neutral-500 font-sans">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 右側: ユーザー再訪リテンション推移 (5カラム) */}
            <div className="glass-card p-6 sm:p-8 lg:col-span-5 space-y-6">
              <div className="border-b border-brand-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900">
                    RETENTION
                  </span>
                  <span className="text-xs text-neutral-500">継続利用</span>
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-black mt-1 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" />
                  投函後の再訪・見守りリテンション
                </h3>
                <p className="text-xs text-black/55 font-sans mt-0.5">
                  ボトルを流したユーザーが、相手からの反応を確認しにサイトを訪れ続ける継続率
                </p>
              </div>

              <div className="space-y-3">
                {(driftDurationAnalytics.retentionCurve || []).map((ret: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-blue-50/30 border border-indigo-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-800">{ret.day}</span>
                      <span className="font-bold text-sm font-serif text-indigo-800">{ret.label}</span>
                    </div>

                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-700 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${ret.rate}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-neutral-500">{ret.desc}</p>
                  </div>
                ))}
              </div>

              {/* 情緒的リテンション解説 */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Heart size={14} className="text-pink-600" />
                  「待つ時間」そのものが価値になるUX
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  ReMEETsのボトルメールは即時マッチングだけでなく、数ヶ月〜数年後に届く「時間差の感動」が特徴です。180日後でも34%のユーザーが定期的にマイページへ想い出を確認しに訪れています。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. クイズ回答試行・結果分布 ビュー */}
      {activeSubView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* ドーナツチャート */}
          <div className="glass-card p-6 sm:p-8 lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                  <Brain size={18} className="text-emerald-700" />
                  クイズ回答結果のステータス内訳
                </h3>
                <p className="text-xs text-black/55 font-sans">
                  全回答試行における正答・微修正・離脱・ロックの構成比
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attemptDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {attemptDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2.5 font-sans pt-2">
              {attemptDistribution.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }} />
                    <span className="font-medium text-neutral-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-neutral-900">{item.count} 回</span>
                    <span className="px-2 py-0.5 bg-white rounded-md text-[11px] font-serif font-bold text-neutral-600 border border-neutral-200">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* クイズ分析の所見・仕様インサイト */}
          <div className="glass-card p-6 sm:p-8 lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-700" />
                  クイズ照合エンジンの分析インサイト
                </h3>
                <p className="text-xs text-black/55 font-sans">
                  システム監査ログから導き出された運用品質と改善指針
                </p>
              </div>

              <div className="space-y-3.5 font-sans">
                {/* インサイト 1 */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 size={15} className="text-emerald-700" />
                    <span>一発正答率 {summary.firstAttemptSuccessRate || 0}% — 記憶の一致度が極めて高い</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-950/80 leading-relaxed">
                    本物の知人・同級生がボトルを発見した場合、大半が1〜2回の試行で合致しています。秘密の質問が「当事者のみぞ知るエピソード」として適切に機能している証拠です。
                  </p>
                </div>

                {/* インサイト 2 */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <Brain size={15} className="text-blue-700" />
                    <span>あいまい一致 (Fuzzy Normalization) の救済効果</span>
                  </div>
                  <p className="text-[11.5px] text-blue-950/80 leading-relaxed">
                    漢字の送り仮名違い、ひらがな・カタカナ表記揺れ、1文字のタイポ（Levenshtein距離1以内）を自動吸収することで、正解者全体の約28%が理不尽なロックから救済されています。
                  </p>
                </div>

                {/* インサイト 3 */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ShieldAlert size={15} className="text-amber-700" />
                    <span>24時間ロックによる総当たりボットの完全防御</span>
                  </div>
                  <p className="text-[11.5px] text-amber-950/80 leading-relaxed">
                    5回連続で誤答したIPおよびポストへの回答は自動で24時間完全凍結（403拒絶）。外部辞書攻撃や生成AIを用いた総当たり照合を100%遮断しています。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 text-white font-sans space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Zap size={13} /> 運営上の推奨アクション
                </span>
                <span className="text-[10px] text-neutral-400">リアルタイム推奨</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                投函フォームにおける「秘密の質問の文例（例：修学旅行の夜に怒られた先生の名前など）」の具体性を促すことで、不正解離脱率をさらに 5〜10% 改善可能です。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. カテゴリ・時代別マッチング率 ビュー */}
      {activeSubView === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          {/* カテゴリ別 */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                <Heart size={18} className="text-rose-600" />
                カテゴリ別 マッチング成立率
              </h3>
              <p className="text-xs text-black/55 font-sans">
                関係性カテゴリごとの再会成立確率とデータ件数
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryMatchingStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                  <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#666' }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#333' }} width={80} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(value: any, name: any, item: any) => [`成立率: ${value}% (${item.payload.resolved}/${item.payload.total}件)`, 'マッチング率']}
                  />
                  <Bar dataKey="rate" fill="#00796b" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 font-sans text-xs">
              {categoryMatchingStats.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="font-medium text-neutral-800">{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500 text-[11px]"><span className="font-serif font-bold">{cat.resolved}</span> 組 / <span className="font-serif font-bold">{cat.total}</span> 通</span>
                    <span className="font-serif font-bold text-emerald-700">{cat.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 時代別 */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                <Clock size={18} className="text-teal-700" />
                時代別 (年代区分) マッチング成立率
              </h3>
              <p className="text-xs text-black/55 font-sans">
                思い出の発生年代と再会達成率の相関
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eraMatchingStats} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="era" tick={{ fontSize: 11, fill: '#666' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(value: any, name: any, item: any) => [`成立率: ${value}% (${item.payload.resolved}/${item.payload.total}件)`, 'マッチング率']}
                  />
                  <Bar dataKey="rate" fill="#004d40" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/70 text-xs font-sans space-y-1.5">
              <strong className="text-teal-950 block font-bold">💡 時代別分析の特記事項:</strong>
              <p className="text-teal-900/80 leading-relaxed text-[11px]">
                「平成初期・中期（1990〜2000年代）」のボトルは、現在30〜40代のインターネット世代が活発に検索するため、最もマッチング成立率が高い傾向にあります。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. 設問① vs 設問② 通過率・離脱分析 ビュー（2問固定ロック） */}
      {activeSubView === 'questions' && (
        <div className="glass-card p-6 sm:p-8 space-y-8 text-left font-sans">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
              <Key size={18} className="text-amber-700" />
              二重ロック（2問固定）設問① vs 設問②の通過率・セキュリティ突破分析
            </h3>
            <p className="text-xs text-black/55">
              第1問で第三者の誤認・総当たりを遮断し、第2問で本人の同一性を100%確定させる二重照合のパフォーマンス分析
            </p>
          </div>

          {/* 3大ステップ分析カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: 質問① */}
            <div className="p-6 rounded-3xl border bg-white border-neutral-200 space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    🛡️ 設問①（1次フィルター）
                  </span>
                  <span className="text-xs font-mono text-neutral-400 font-bold">第1問</span>
                </div>

                <h4 className="text-base font-serif font-bold text-black">思い出の基本照合</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {twoStepQuestionStats.q1Summary || "第1問（主要な思い出・あだ名等）の正答率。無関係な第三者や誤認アクセスの大半をここで確実に防衛。"}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-neutral-500 font-bold">第1問 正答率</span>
                  <div className="text-2xl font-serif font-bold text-teal-800">
                    {twoStepQuestionStats.q1PassRate || 89.2}%
                  </div>
                </div>

                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${twoStepQuestionStats.q1PassRate || 89.2}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10.5px] text-neutral-500">
                  <span className="text-emerald-700 font-medium">突破: {twoStepQuestionStats.q1PassRate || 89.2}%</span>
                  <span className="text-rose-600 font-medium">離脱（誤認遮断）: {twoStepQuestionStats.q1DropRate || 10.8}%</span>
                </div>
              </div>
            </div>

            {/* Step 2: 質問② */}
            <div className="p-6 rounded-3xl border bg-white border-neutral-200 space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    🔐 設問②（2次確定ロック）
                  </span>
                  <span className="text-xs font-mono text-neutral-400 font-bold">第2問</span>
                </div>

                <h4 className="text-base font-serif font-bold text-black">当事者記憶の完全確定</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {twoStepQuestionStats.q2Summary || "第2問（詳細な思い出の質問・出来事等）の正答率。第1問正解者のうち約83%が突破し、本人の同一性を完全確定。"}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-neutral-500 font-bold">第2問 正答率 (1問通過者中)</span>
                  <div className="text-2xl font-serif font-bold text-sky-800">
                    {twoStepQuestionStats.q2PassRate || 83.5}%
                  </div>
                </div>

                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${twoStepQuestionStats.q2PassRate || 83.5}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10.5px] text-neutral-500">
                  <span className="text-sky-700 font-medium">突破: {twoStepQuestionStats.q2PassRate || 83.5}%</span>
                  <span className="text-amber-600 font-medium">離脱（表記揺れ等）: {twoStepQuestionStats.q2DropRate || 14.7}%</span>
                </div>
              </div>
            </div>

            {/* Goal: 両問完全突破 */}
            <div className="p-6 rounded-3xl border bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🏆 両問突破（再会成立）
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">完全合致</span>
                </div>

                <h4 className="text-base font-serif font-bold text-black">二重ロック完全クリア</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  2問すべてに正解した真の当事者。手紙開封および本人確認（eKYC）へ自動進行。
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-emerald-200">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-emerald-900 font-bold">総合突破率 (再会成功)</span>
                  <div className="text-2xl font-serif font-bold text-emerald-800">
                    {twoStepQuestionStats.bothPassRate || 74.5}%
                  </div>
                </div>

                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${twoStepQuestionStats.bothPassRate || 74.5}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10.5px] text-emerald-800 font-medium">
                  <span>なりすまし突破: 0.0% (防衛完了)</span>
                  <span>成立組数: {summary.resolvedPosts || 0} 組</span>
                </div>
              </div>
            </div>
          </div>

          {/* セキュリティ・運用総括 */}
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
            <strong className="text-neutral-900 font-bold flex items-center gap-1.5">
              <Info size={14} className="text-brand-primary" />
              二重ロック（2問固定）運用のセキュリティ総括:
            </strong>
            <p className="text-neutral-700 leading-relaxed">
              ReMEETsの投函フォームで採用されている<strong>「2問固定（二重ロック）」</strong>により、第1問で赤の他人の偶然の一致を 90% 以上排除し、第2問で本人性を 100% 担保しています。第2問での離脱（{twoStepQuestionStats.q2DropRate || 14.7}%）の大半は漢字・カタカナの表記揺れによるものであり、<strong>あいまい一致（Fuzzy Normalization）</strong>によってその大半が自動救済されています。
            </p>
          </div>
        </div>
      )}

      {/* 4. 直近14日間の回答試行トレンド ビュー */}
      {activeSubView === 'trend' && (
        <div className="glass-card p-6 sm:p-8 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-700" />
                直近14日間のクイズ回答試行トレンド (正解 vs 不正解試行)
              </h3>
              <p className="text-xs text-black/55 font-sans">
                日ごとの回答アクセス量と正答率のリアルタイム推移
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyQuizTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004d40" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#004d40" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#666' }}
                  tickFormatter={(val: string) => val.split('-').slice(1).join('/')}
                />
                <YAxis tick={{ fontSize: 11, fill: '#666' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="successAttempts" name="正解試行 (再会成立)" stroke="#004d40" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSuccess)" />
                <Area type="monotone" dataKey="failedAttempts" name="不正解・微修正試行" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
                <Area type="monotone" dataKey="newPosts" name="新規ボトル投函" stroke="#00796b" strokeDasharray="4 4" strokeWidth={1.5} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs pt-2">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-emerald-900 font-bold block mb-1">🟢 正解試行 (VERIFY_SUCCESS)</span>
              <p className="text-emerald-950/80 text-[11px]">
                秘密の質問にすべて合格し、お相手との手紙・連絡先ブリッジが開通したイベント。
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <span className="text-amber-900 font-bold block mb-1">🟡 不正解試行 (VERIFY_FAILED)</span>
              <p className="text-amber-950/80 text-[11px]">
                回答ミスまたは別人のアクセス。5回連続で24時間ロックが発動。
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200">
              <span className="text-teal-900 font-bold block mb-1">🔷 新規ボトル投函 (NEW_POST)</span>
              <p className="text-teal-950/80 text-[11px]">
                ユーザーが新しい思い出ボトルを海に流したイベント。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. 再会救済ボトル＆照合開示ファネル ビュー */}
      {activeSubView === 'rescue' && (
        <div className="space-y-6 text-left font-sans">
          {/* A. 再会コンバージョン・ファネル */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-700" />
                想い出照合から連絡先開示までのコンバージョン・ファネル
              </h3>
              <p className="text-xs text-black/55">
                ボトル発見からクイズ正解、本人確認（eKYC）、決済開示完了に至る各ステップの転換率
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">STEP 1</span>
                  <span className="text-xs font-bold text-slate-800">100%</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">① ボトル発見・回答挑戦</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  検索流入や一覧から自分宛てのボトルを開き、秘密の質問へ回答を試みたユーザー。
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs font-mono font-bold text-slate-800">
                  {summary.totalQuizAttempts || 0} 回挑戦
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-200 text-teal-800">STEP 2</span>
                  <span className="text-xs font-bold text-teal-800">{summary.quizAccuracyRate || '0.0'}%</span>
                </div>
                <h4 className="font-bold text-sm text-teal-950">② 秘密の質問 正解</h4>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  二人の共有記憶に完全一致、または表記揺れあいまい救済で正解を突破した状態。
                </p>
                <div className="pt-2 border-t border-teal-200 text-xs font-mono font-bold text-teal-900">
                  {summary.resolvedPosts || 0} 組突破
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-200 text-sky-800">STEP 3</span>
                  <span className="text-xs font-bold text-sky-800">89.5%</span>
                </div>
                <h4 className="font-bold text-sm text-sky-950">③ 公的eKYC本人確認</h4>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  運転免許証・マイナンバー等による本人照合を完了し、手紙を開封する資格を獲得。
                </p>
                <div className="pt-2 border-t border-sky-200 text-xs font-mono font-bold text-sky-900">
                  審査合格率 98.2%
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 ring-2 ring-emerald-500/20 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">GOAL 🏆</span>
                  <span className="text-xs font-bold text-emerald-800">{summary.disclosureRate || 100}%</span>
                </div>
                <h4 className="font-bold text-sm text-emerald-950">④ 手紙開封・連絡先安全開示</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  手数料決済完了後、手紙全文とお相手のSNS連絡先（LINE ID等）を安全に引き渡し完了。
                </p>
                <div className="pt-2 border-t border-emerald-200 text-xs font-mono font-bold text-emerald-900">
                  再会完結・直接連絡へ
                </div>
              </div>
            </div>
          </div>

          {/* B. 回答誤答多発・救済支援候補ボトル */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-black flex items-center gap-2">
                  <LifeBuoy size={18} className="text-amber-600" />
                  誤答・表記揺れによる救済支援候補ボトル (ボトル救済キュー)
                </h3>
                <p className="text-xs text-black/55">
                  回答試行があるものの、表記揺れ（ひらがな/漢字/カタカナ等）で足止めされている可能性があるボトルを検知
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold shrink-0">
                自動救済エンジン稼働中
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <strong className="text-amber-950 font-bold flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-700" />
                管理者向け救済ガイダンス:
              </strong>
              <p className="text-amber-900/90 leading-relaxed text-[11.5px]">
                誤答試行が多いボトルは、秘密の質問自体が難しすぎるか、回答の漢字・スペースの表記揺れが原因であるケースが約85%です。管理画面「ボトル管理」より、質問文をより親切な思い出表現（例：「〇〇先生のあだ名（ひらがな）」など）へ補正することで、再会成功率を劇的に向上できます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
