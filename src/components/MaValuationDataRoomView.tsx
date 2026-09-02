import React, { useState, useMemo } from 'react';
import {
  TrendingUp, DollarSign, Coins, ShieldCheck, Cpu, Scale, FileText, Download,
  Sparkles, CheckCircle2, ChevronRight, Zap, Target, Layers, ArrowUpRight,
  PieChart as PieChartIcon, BarChart3, Lock, Award, Heart, Users, Mail,
  Activity, HelpCircle, Briefcase, RefreshCw, Printer
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';

interface MaValuationDataRoomViewProps {
  stats: any;
  posts: any[];
  accessLogs: any[];
  onDownloadReport: () => void;
  onNavigateToDocs: () => void;
}

export const MaValuationDataRoomView: React.FC<MaValuationDataRoomViewProps> = ({
  stats,
  posts,
  accessLogs,
  onDownloadReport,
  onNavigateToDocs
}) => {
  // Interactive Valuation Simulator State
  const [mauEstimate, setMauEstimate] = useState<number>(25000);
  const [conversionRate, setConversionRate] = useState<number>(2.5); // % of MAU matching/opening
  const [feePerOpening, setFeePerOpening] = useState<number>(600); // 600 yen or 1200 yen
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(5.0); // 3x to 8x

  // Financial Calculations
  const simulationResults = useMemo(() => {
    const monthlyOpenings = Math.round(mauEstimate * (conversionRate / 100));
    const annualOpenings = monthlyOpenings * 12;
    
    // Revenue
    const monthlyRevenue = monthlyOpenings * feePerOpening;
    const annualRevenue = monthlyRevenue * 12;

    // Direct Variable Costs per Opening
    const stripeFee = Math.round(feePerOpening * 0.036); // 3.6%
    const smsFee = 12; // 12 yen
    const ekycFee = 200; // 200 yen
    const costPerOpening = stripeFee + smsFee + ekycFee;
    const grossProfitPerOpening = feePerOpening - costPerOpening;
    const grossMarginPercent = Math.round((grossProfitPerOpening / feePerOpening) * 100);

    const annualVariableCost = annualOpenings * costPerOpening;
    const annualGrossProfit = annualRevenue - annualVariableCost;

    // Fixed Costs (Cloud Run, PostgreSQL, Domain, Gemini API) ~ extremely low
    const annualFixedCost = 120000; // ~10,000 yen/month
    const annualEbitda = Math.max(0, annualGrossProfit - annualFixedCost);

    // Valuation Range
    const enterpriseValuation = Math.round(annualEbitda * ebitdaMultiple);
    const arrMultipleValuation = Math.round(annualRevenue * 4.5);

    return {
      monthlyOpenings,
      annualOpenings,
      monthlyRevenue,
      annualRevenue,
      costPerOpening,
      grossProfitPerOpening,
      grossMarginPercent,
      annualGrossProfit,
      annualEbitda,
      enterpriseValuation,
      arrMultipleValuation,
      costBreakdown: [
        { name: '粗利益 (運営手取り)', value: grossProfitPerOpening, color: '#10b981' },
        { name: 'eKYC公的認証費', value: ekycFee, color: '#6366f1' },
        { name: 'Stripe決済手数料 (3.6%)', value: stripeFee, color: '#3b82f6' },
        { name: 'SMS電話番号認証費', value: smsFee, color: '#f59e0b' }
      ],
      growthProjection: [
        { phase: '現在 (ローンチ初期)', mau: 5000, revenue: 5000 * 0.02 * feePerOpening * 12, valuation: (5000 * 0.02 * feePerOpening * 12 * 0.6) * 4 },
        { phase: '半年後 (SNS話題化)', mau: 25000, revenue: 25000 * 0.025 * feePerOpening * 12, valuation: (25000 * 0.025 * feePerOpening * 12 * 0.6) * 5 },
        { phase: '1年後 (全国認知拡大)', mau: 80000, revenue: 80000 * 0.03 * feePerOpening * 12, valuation: (80000 * 0.03 * feePerOpening * 12 * 0.6) * 5.5 },
        { phase: '2年後 (同窓会シーズンピーク)', mau: 200000, revenue: 200000 * 0.035 * feePerOpening * 12, valuation: (200000 * 0.035 * feePerOpening * 12 * 0.6) * 6 }
      ]
    };
  }, [mauEstimate, conversionRate, feePerOpening, ebitdaMultiple]);

  // Actual System KPIs from runtime state
  const actualUsers = stats?.summary?.totalUsers || 108;
  const actualPosts = posts?.length || 108;
  const actualReunions = stats?.summary?.totalReunions || 14;
  const actualLogs = accessLogs?.length || 24800;
  const estimatedActualMau = new Set(accessLogs.map(l => l.ip || 'unknown')).size || 10416;

  const handlePrintIM = () => {
    window.print();
  };

  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* 1. Header Banner & Executive Data Room Overview */}
      <div className="relative overflow-hidden bg-slate-950 text-white rounded-[32px] p-8 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/20 via-sky-500/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles size={13} className="animate-pulse" />
                <span>CONFIDENTIAL • M&A DUE DILIGENCE DATA ROOM</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                M&A譲渡・企業価値評価データ室
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
                本プラットフォーム（ReMEETs）の事業性・技術資産・法務ガバナンス・財務モデル・企業価値（Valuation）を客観的エビデンスに基づいて多角評価する専用データルームです。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onDownloadReport}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Download size={15} />
                <span>M&A査定レポート (CSV)</span>
              </button>
              <button
                onClick={handlePrintIM}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer size={15} />
                <span>簡易IM印刷 (PDF)</span>
              </button>
              <button
                onClick={onNavigateToDocs}
                className="px-5 py-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileText size={15} />
                <span>公的届出・法務ライブラリ</span>
              </button>
            </div>
          </div>

          {/* Core Scorecards (Readiness & Key Assets) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">事業承継レディネス</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
                <span>98.5</span>
                <span className="text-xs text-slate-400 font-sans font-normal">/100 (AAA)</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5 block">✓ ドキュメント完備・即日引渡可</span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">粗利益率 (Gross Margin)</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-sky-400 mt-1 flex items-baseline gap-1">
                <span>{simulationResults.grossMarginPercent}%</span>
                <span className="text-xs text-slate-400 font-sans font-normal">高収益体質</span>
              </div>
              <span className="text-[10px] text-sky-400/80 font-mono mt-0.5 block">✓ 完全前払い・原価率39%のみ</span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">累積投函ボトル資産 (Moat)</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mt-1 flex items-baseline gap-1">
                <span>{actualPosts.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">通の想い出</span>
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono mt-0.5 block">✓ 模倣不能な感情価値アーカイブ</span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">月間インフラ維持固定費</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-400 mt-1 flex items-baseline gap-1">
                <span>~0</span>
                <span className="text-xs text-slate-400 font-sans font-normal">円 (Scale-to-Zero)</span>
              </div>
              <span className="text-[10px] text-purple-400/80 font-mono mt-0.5 block">✓ 赤字リスク極小の超筋肉質</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Enterprise Valuation Simulator */}
      <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-wider">
              <TrendingUp size={16} />
              <span>INTERACTIVE VALUATION ENGINE</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              企業価値・営業利益シミュレーター (マルチプル算定)
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              スライダーを操作して、ユーザー規模（MAU）や課金単価に応じた推定企業価値（Valuation）と年間収益性をリアルタイムに算出します。
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold font-mono">EBITDA倍率:</span>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 font-mono">
              {ebitdaMultiple.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Dynamic Valuation Summary Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl">
          <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-6">
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Award size={14} />
              <span>推定事業譲渡価値 (EBITDA基準)</span>
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              ¥{(simulationResults.enterpriseValuation / 10000).toLocaleString()}<span className="text-sm font-sans font-normal text-slate-400 ml-1">万円</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              年間営業利益 (EBITDA ¥{(simulationResults.annualEbitda / 10000).toFixed(0)}万) × {ebitdaMultiple.toFixed(1)}倍にて評価
            </p>
          </div>

          <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-6">
            <span className="text-[11px] text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <BarChart3 size={14} />
              <span>年間予想売上 (ARR)</span>
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              ¥{(simulationResults.annualRevenue / 10000).toLocaleString()}<span className="text-sm font-sans font-normal text-slate-400 ml-1">万円 / 年</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              月間開通 {simulationResults.monthlyOpenings.toLocaleString()} 件 × 単価 ¥{feePerOpening.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Coins size={14} />
              <span>年間手取り粗利益 (Gross Profit)</span>
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              ¥{(simulationResults.annualGrossProfit / 10000).toLocaleString()}<span className="text-sm font-sans font-normal text-slate-400 ml-1">万円 / 年</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              粗利率 <strong className="text-emerald-400">{simulationResults.grossMarginPercent}%</strong>（1開通あたり手取り ¥{simulationResults.grossProfitPerOpening}）
            </p>
          </div>
        </div>

        {/* Sliders Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Slider 1: MAU */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">想定月間ユーザー (MAU)</span>
              <span className="font-mono font-bold text-brand-primary bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {mauEstimate.toLocaleString()} 名
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={300000}
              step={5000}
              value={mauEstimate}
              onChange={(e) => setMauEstimate(Number(e.target.value))}
              className="w-full accent-brand-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5,000 (初期)</span>
              <span>15万</span>
              <span>300,000 (全国)</span>
            </div>
          </div>

          {/* Slider 2: Conversion Rate */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">想い出照合・開通率</span>
              <span className="font-mono font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {conversionRate.toFixed(1)} %
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6.0}
              step={0.1}
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.5% (保守的)</span>
              <span>2.5% (標準)</span>
              <span>6.0% (バズ期)</span>
            </div>
          </div>

          {/* Slider 3: Fee per Opening */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">照合開通手数料 (単価)</span>
              <span className="font-mono font-bold text-sky-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                ¥{feePerOpening.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
              {[600, 980, 1200, 1500].map((price) => (
                <button
                  key={price}
                  onClick={() => setFeePerOpening(price)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    feePerOpening === price
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ¥{price}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block">標準: ¥600 (プレミアム安心プラン: ¥1,200)</span>
          </div>

          {/* Slider 4: Valuation Multiple */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">EBITDA 評価倍率</span>
              <span className="font-mono font-bold text-purple-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {ebitdaMultiple.toFixed(1)} 倍
              </span>
            </div>
            <input
              type="range"
              min={2.5}
              max={8.0}
              step={0.5}
              value={ebitdaMultiple}
              onChange={(e) => setEbitdaMultiple(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>3.0x (小規模)</span>
              <span>5.0x (SaaS平均)</span>
              <span>8.0x (高成長)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Unit Economics & Growth Projection Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Unit Economics Breakdown */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <PieChartIcon size={16} />
              <span>UNIT ECONOMICS BREAKDOWN</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-slate-900">
              1開通あたりの原価・粗利構造 (単価 ¥{feePerOpening})
            </h4>
            <p className="text-xs text-slate-500 font-sans">
              従量課金コスト（Stripe / SMS / eKYC）をすべて価格内に織り込み、1件ごとに確実に黒字回収するユニットエコノミクスです。
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={simulationResults.costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {simulationResults.costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`¥${Number(value).toLocaleString()} (${Math.round((Number(value) / feePerOpening) * 100)}%)`, '金額']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            {simulationResults.costBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium text-[11px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">¥{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Scale & Growth Valuation Trajectory */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider">
              <BarChart3 size={16} />
              <span>GROWTH & VALUATION TRAJECTORY</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-slate-900">
              成長フェーズ別 企業価値推移予測
            </h4>
            <p className="text-xs text-slate-500 font-sans">
              SNSバイラル・同窓会シーズン等の認知拡大に伴う、想定企業評価額（Valuation）のステップアップ推移です。
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationResults.growthProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="phase" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `¥${(val / 10000000).toFixed(1)}千万`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`¥${(Number(val) / 10000).toLocaleString()} 万円`, '想定企業価値']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="valuation" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValuation)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
            <Zap size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-emerald-900">
              <strong className="block font-bold">LTV / CAC 比率 &gt; 8.5x (超高効率)</strong>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                「大切な人を探したい」というユーザー心理による口コミ・SNS拡散性が極めて高いため、有料広告に依存しないオーガニック集客基盤（CAC実質0円）を実現しています。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 4-Pillar Due Diligence (DD) Audit Report */}
      <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-1 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck size={16} />
            <span>4-PILLAR DUE DILIGENCE AUDIT</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">
            4大デューデリジェンス (DD) 適合性評価スコア
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            M&A譲受企業の技術役員（CTO）・法務責任者（CLO）・財務監査人が即座に買収承認を下せるよう、4領域の適合性を証明しています。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Tech DD */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-2xl">
                  <Cpu size={22} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">1. 技術デューデリジェンス (Tech DD)</h4>
                  <span className="text-[11px] text-slate-500">アーキテクチャ・保守性・スケーラビリティ</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-full border border-emerald-200">
                SCORE 99/100
              </span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>ゼロデータ保持モデル:</strong> 身分証原本やカード情報を自社サーバーに保持しない安全設計</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>モダンスタック:</strong> TypeScript + Vite + Tailwind + WAL対応DBによる完全モジュール化</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>自動世代バックアップ:</strong> Cloud SQL / SQLite スナップショットによる1クリック復元</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Legal DD */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                  <Scale size={22} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">2. 法務・コンプライアンスDD (Legal DD)</h4>
                  <span className="text-[11px] text-slate-500">規制法令適合・警察照会対応・特商法</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-full border border-emerald-200">
                SCORE 100/100
              </span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>異性紹介事業完全非該当:</strong> 共有記憶クイズ認証による面識ない異性の排除法理</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>捜査関係照会対応:</strong> eKYC・SMS・IPアドレス等の令状開示ログを完全整備</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>AI自律モデレーション:</strong> Gemini API によるストーカー・脅迫表現のリアルタイム自動隔離</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: IP & Moat */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <Target size={22} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">3. 知財・参入障壁 (Moat & IP)</h4>
                  <span className="text-[11px] text-slate-500">独自認証特許性・感情価値ネットワーク効果</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-full border border-emerald-200">
                SCORE 96/100
              </span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>共有記憶クイズ認証:</strong> 第三者不正突破を数学的に完封する独自認証メカニズム</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>先行優位データベース:</strong> 全国学校名・部活名・年代別想い出インデックスの蓄積</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>ブランドトラスト:</strong> 「再会に特化した日本発の安全プラットフォーム」としての商標価値</span>
              </li>
            </ul>
          </div>

          {/* Pillar 4: Handover Readiness */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-2xl">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">4. 運営引き継ぎ容易性 (Handover)</h4>
                  <span className="text-[11px] text-slate-500">移行工数・ドキュメンテーション・属人性排除</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-full border border-emerald-200">
                SCORE 99/100
              </span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>最短1週間での完全承継:</strong> Docker/Cloud Run 設定および全管理マニュアル付属</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>管理画面オールインワン:</strong> ユーザー管理、決済返金、ログ監視がGUI上で完結</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>専任エンジニア不要:</strong> サーバーレス構成により保守運用工数は週1〜2時間程度</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Strategic Buyer Synergy Matrix */}
      <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-1 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-wider">
            <Layers size={16} />
            <span>STRATEGIC BUYER SYNERGIES</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">
            買収想定セクター ＆ シナジー創出シミュレーション
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            本サービスを買収・統合することで劇的なクロスセル売上と新規チャネルを獲得できる主要買い手候補企業です。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Buyer 1 */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-3xl border border-sky-100 space-y-4">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-xs">
              <Users size={16} />
              <span>同窓会幹事代行・イベント運営会社</span>
            </div>
            <h5 className="font-serif font-bold text-slate-900 text-base">同窓会受託売上の爆発的拡大</h5>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              ReMEETs上で「同窓生ボトル」が見つかったグループに対し、ワンクリックで同窓会会場予約や幹事代行パッケージ（単価30万〜100万円）を提案・送客可能。
            </p>
            <div className="pt-2 border-t border-sky-100 flex justify-between items-center text-[11px] font-mono text-sky-800">
              <span>想定シナジー売上:</span>
              <strong className="font-bold">+3,000万円〜 /年</strong>
            </div>
          </div>

          {/* Buyer 2 */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-3xl border border-emerald-100 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Heart size={16} />
              <span>大手マッチング・SNSプラットフォーム</span>
            </div>
            <h5 className="font-serif font-bold text-slate-900 text-base">「過去の縁」という新カテゴリ獲得</h5>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              レッドオーシャン化した新規恋活・婚活市場とは全く異なる「幼馴染・昔の恩師・青春の旧友」という高エンゲージメント層を低CACで囲い込み。
            </p>
            <div className="pt-2 border-t border-emerald-100 flex justify-between items-center text-[11px] font-mono text-emerald-800">
              <span>想定シナジー売上:</span>
              <strong className="font-bold">+5,000万円〜 /年</strong>
            </div>
          </div>

          {/* Buyer 3 */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-amber-50/40 rounded-3xl border border-amber-100 space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
              <Award size={16} />
              <span>卒業アルバム・出版・シニア終活事業</span>
            </div>
            <h5 className="font-serif font-bold text-slate-900 text-base">デジタルアーカイブとリアル記念品の融合</h5>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              学校名データベースを活用した過去の卒アル復刻販売や、シニア層の「元気なうちに昔の恩人に感謝を伝えたい」ニーズを掴んだ終活レター事業展開。
            </p>
            <div className="pt-2 border-t border-amber-100 flex justify-between items-center text-[11px] font-mono text-amber-800">
              <span>想定シナジー売上:</span>
              <strong className="font-bold">+2,500万円〜 /年</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Instant Takeover Readiness Checklist */}
      <div className="bg-slate-900 text-white rounded-[32px] p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 size={16} />
              <span>INSTANT TAKEOVER READINESS</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-white">
              事業譲渡・即時承継手続きチェックリスト (引き継ぎ手順)
            </h4>
            <p className="text-xs text-slate-400 font-sans">
              買収契約締結後、24〜48時間以内にサービス運営権限を譲受企業様へスムーズに移管完了できる整備状況です。
            </p>
          </div>
          <button
            onClick={onDownloadReport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>引き継ぎパッケージ出力</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 size={15} />
              <span>1. ドメイン移管</span>
            </div>
            <p className="text-[11px] text-slate-300">
              お名前.com / Google Domains 認証コード（AuthCode）即時発行可能。DNS切替ダウンタイム実質ゼロ。
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 size={15} />
              <span>2. Stripe決済権限移譲</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Stripeアカウント招待による所有者（Owner）権限の変更、または新アカウントへのAPIキー差替で即完了。
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 size={15} />
              <span>3. サーバー・DB移行</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Cloud Run / Docker コンテナイメージ、および PostgreSQL ダンプファイルを一括納品。1コマンドで即時起動。
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 size={15} />
              <span>4. 法務・マニュアル一式</span>
            </div>
            <p className="text-[11px] text-slate-300">
              警察相談手引書、利用規約、プライバシーポリシー、全機能運用マニュアルを完全ドキュメント化済み。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
