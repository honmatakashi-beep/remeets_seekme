import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  MailOpen,
  CreditCard,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Building2,
  Lock,
  Flame,
  Award,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const AdminMonetizationBlock: React.FC = () => {
  // Simulator State Sliders
  const [mau, setMau] = useState<number>(100000); // Monthly Active Users
  const [newRegRate, setNewRegRate] = useState<number>(10); // % of MAU that register per month
  const [matchingRate, setMatchingRate] = useState<number>(50); // % of new users who match/attempt open
  const [openFee, setOpenFee] = useState<number>(600); // Fee per letter open & contact reveal (￥)
  const [smsCost, setSmsCost] = useState<number>(12); // Cost of single SMS verification (￥)
  const [ekycCost, setEkycCost] = useState<number>(150); // Fee per eKYC verification (￥)
  const [voluntaryEkycCount, setVoluntaryEkycCount] = useState<number>(150); // 投函者などの自発的eKYC人数（件/月）
  const [ekycPassRate, setEkycPassRate] = useState<number>(92); // % of eKYC submissions that pass
  const [setupTier, setSetupTier] = useState<'minimum' | 'standard' | 'enterprise'>('standard');
  const [businessModel, setBusinessModel] = useState<'bundled_pay' | 'free_ekyc'>('bundled_pay');

  // Additional Monetization Options (Upside Features)
  const [optPremiumBottle, setOptPremiumBottle] = useState<boolean>(false);
  const [optPremiumBottleFee, setOptPremiumBottleFee] = useState<number>(300);
  const [optPremiumBottleRate, setOptPremiumBottleRate] = useState<number>(5); // % of new users

  const [optArchiveSub, setOptArchiveSub] = useState<boolean>(false);
  const [optArchiveSubFee, setOptArchiveSubFee] = useState<number>(300);
  const [optArchiveSubRate, setOptArchiveSubRate] = useState<number>(2); // % of MAU

  const [optGiftChip, setOptGiftChip] = useState<boolean>(false);
  const [optGiftAvgAmount, setOptGiftAvgAmount] = useState<number>(1000);
  const [optGiftTakeRate, setOptGiftTakeRate] = useState<number>(15); // 15% platform fee
  const [optGiftRate, setOptGiftRate] = useState<number>(10); // % of successful matches

  // Active chart view tab
  const [chartView, setChartView] = useState<'bep' | 'pie' | 'phases'>('bep');
  const [copied, setCopied] = useState<boolean>(false);

  const stripeFeeRate = 3.6; // Stripe commission %

  // Helper formatting for clean Japanese currency
  const formatYen = (amount: number = 0): string => {
    if (Math.abs(amount) >= 100000000) {
      return `${(amount / 100000000).toFixed(2)} 億円`;
    }
    if (Math.abs(amount) >= 10000) {
      return `${(amount / 10000).toFixed(1)} 万円`;
    }
    return `${amount.toLocaleString()} 円`;
  };

  const formatRawYen = (amount: number = 0): string => {
    return `${amount.toLocaleString()} 円`;
  };

  // Calculations
  const newUsers = Math.round(mau * (newRegRate / 100)); // 月間新規登録者数

  // 1. 想い出照合＆開封希望者（基本課金導線）
  const openAttempts = Math.round(newUsers * (matchingRate / 100)); // 開封・照合試行人数
  const openSuccessCount = Math.round(openAttempts * (ekycPassRate / 100)); // eKYC合格＆開通成立人数
  const openFailCount = Math.max(0, openAttempts - openSuccessCount); // 審査不合格・返金人数

  // 2. 自発的eKYC認証者（投函時の信頼バッジ取得等）
  const voluntaryEkycUsers = businessModel === 'bundled_pay' ? voluntaryEkycCount : Math.round(newUsers * 0.35);

  // 人数合計
  const totalEkycPeople = (businessModel === 'bundled_pay' ? openAttempts : voluntaryEkycUsers) + (businessModel === 'bundled_pay' ? voluntaryEkycUsers : 0);
  const totalSmsPeople = businessModel === 'bundled_pay' ? openAttempts : voluntaryEkycUsers;

  // 💰 売上計算
  const coreRevenue = openSuccessCount * openFee; // 基本売上（成立件数 × 開封料）

  // 追加オプション売上
  const premiumBottleRevenue = optPremiumBottle ? Math.round(newUsers * (optPremiumBottleRate / 100) * optPremiumBottleFee) : 0;
  const archiveSubRevenue = optArchiveSub ? Math.round(mau * (optArchiveSubRate / 100) * optArchiveSubFee) : 0;
  const giftRevenue = optGiftChip ? Math.round(openSuccessCount * (optGiftRate / 100) * optGiftAvgAmount * (optGiftTakeRate / 100)) : 0;
  const totalUpsideRevenue = premiumBottleRevenue + archiveSubRevenue + giftRevenue;
  const grossRevenue = coreRevenue + totalUpsideRevenue;

  // 📉 原価計算（内訳別）
  const stripeFeeTotal = Math.round(grossRevenue * (stripeFeeRate / 100)); // Stripe決済手数料 (3.6%)
  const smsCostTotal = Math.round(totalSmsPeople * smsCost); // SMS認証送信費
  const openEkycCostTotal = Math.round((businessModel === 'bundled_pay' ? openAttempts : 0) * ekycCost); // 開封に伴うeKYC費
  const voluntaryEkycCostTotal = Math.round(voluntaryEkycUsers * ekycCost); // 投函者自発eKYC費
  const totalEkycCost = openEkycCostTotal + voluntaryEkycCostTotal; // eKYC総原価

  // 変動原価合計
  const totalVariableCost = stripeFeeTotal + smsCostTotal + totalEkycCost;

  // アクション別 粗利益計算
  const openActionGrossProfit = coreRevenue - Math.round(coreRevenue * 0.036) - (openAttempts * smsCost) - openEkycCostTotal;
  const openActionMargin = coreRevenue > 0 ? ((openActionGrossProfit / coreRevenue) * 100).toFixed(1) : '0';
  const unitProfitPerSuccess = openSuccessCount > 0 ? Math.round(openActionGrossProfit / openSuccessCount) : 0;

  // 🏢 固定費計算（インフラ・運用プラン別）
  let virtualOfficeCost = 0;
  let domainSystemCost = 0;
  let databaseCost = 0;
  let serverCost = 0;

  if (setupTier === 'minimum') {
    virtualOfficeCost = 0;
    domainSystemCost = 500;
    databaseCost = mau <= 15000 ? 0 : 1500;
    serverCost = Math.round(mau * 0.02);
  } else if (setupTier === 'standard') {
    virtualOfficeCost = 1200; // 格安バーチャルオフィス（特商法用）
    domainSystemCost = 1500; // 独自ドメイン + SendGrid/Resend
    databaseCost = mau <= 20000 ? 0 : 3500; // PostgreSQL / Cloud SQL
    serverCost = Math.round(mau * 0.04) + 1000; // Cloud Run 基本
  } else {
    virtualOfficeCost = 4500; // 電話転送付きバーチャルオフィス
    domainSystemCost = 4000; // 高度DNS・セキュリティ・メールAPI
    databaseCost = 9800; // Cloud SQL 高可用性HA構成
    serverCost = Math.round(mau * 0.08) + 4000;
  }

  const fixedMonthlyCost = virtualOfficeCost + domainSystemCost + databaseCost + serverCost;
  const totalMonthlyCost = fixedMonthlyCost + totalVariableCost;
  const netMonthlyProfit = grossRevenue - totalMonthlyCost;
  const netProfitMargin = grossRevenue > 0 ? ((netMonthlyProfit / grossRevenue) * 100).toFixed(1) : '0';

  // 🏆 ARR & 企業価値推計（EBITDA 3.5x 〜 5.5x）
  const annualizedNetProfit = netMonthlyProfit * 12;
  const valuationMin = Math.max(0, annualizedNetProfit * 3.5);
  const valuationMax = Math.max(0, annualizedNetProfit * 5.5);

  // 🎯 Preset Applicator
  const applyPreset = (preset: 'launch' | 'growth' | 'viral' | 'platform') => {
    if (preset === 'launch') {
      setMau(10000);
      setNewRegRate(10);
      setMatchingRate(50);
      setOpenFee(600);
      setSetupTier('standard');
      setOptPremiumBottle(false);
      setOptArchiveSub(false);
      setOptGiftChip(false);
    } else if (preset === 'growth') {
      setMau(100000);
      setNewRegRate(10);
      setMatchingRate(50);
      setOpenFee(600);
      setSetupTier('standard');
      setOptPremiumBottle(true);
      setOptArchiveSub(false);
      setOptGiftChip(false);
    } else if (preset === 'viral') {
      setMau(500000);
      setNewRegRate(12);
      setMatchingRate(55);
      setOpenFee(600);
      setSetupTier('standard');
      setOptPremiumBottle(true);
      setOptArchiveSub(true);
      setOptGiftChip(true);
    } else if (preset === 'platform') {
      setMau(1500000);
      setNewRegRate(15);
      setMatchingRate(60);
      setOpenFee(600);
      setSetupTier('enterprise');
      setOptPremiumBottle(true);
      setOptArchiveSub(true);
      setOptGiftChip(true);
    }
  };

  // 📈 BEP Chart Data Generator
  const bepChartData = [
    10000, 30000, 50000, 100000, 250000, 500000, 1000000, 1500000
  ].map((m) => {
    const curNewUsers = Math.round(m * (newRegRate / 100));
    const curOpenAttempts = Math.round(curNewUsers * (matchingRate / 100));
    const curOpenSuccess = Math.round(curOpenAttempts * (ekycPassRate / 100));
    const curCoreRev = curOpenSuccess * openFee;
    const curUpside =
      (optPremiumBottle ? Math.round(curNewUsers * (optPremiumBottleRate / 100) * optPremiumBottleFee) : 0) +
      (optArchiveSub ? Math.round(m * (optArchiveSubRate / 100) * optArchiveSubFee) : 0) +
      (optGiftChip ? Math.round(curOpenSuccess * (optGiftRate / 100) * optGiftAvgAmount * (optGiftTakeRate / 100)) : 0);
    const curRev = curCoreRev + curUpside;

    const curStripe = Math.round(curRev * 0.036);
    const curSms = Math.round(curOpenAttempts * smsCost);
    const curEkyc = Math.round(curOpenAttempts * ekycCost + voluntaryEkycUsers * ekycCost);
    const curFixed = (setupTier === 'minimum' ? 500 : setupTier === 'standard' ? 3700 : 18300) + Math.round(m * 0.04);
    const curCost = curStripe + curSms + curEkyc + curFixed;
    const curProfit = curRev - curCost;

    return {
      mau: m >= 10000 ? `${m / 10000}万人` : `${m}人`,
      売上高: Math.round(curRev / 10000),
      総原価: Math.round(curCost / 10000),
      営業純利益: Math.round(curProfit / 10000)
    };
  });

  // 🥧 Pie Chart Data (Cost vs Profit breakdown)
  const pieData = [
    { name: '営業純利益', value: Math.max(0, netMonthlyProfit), color: '#10b981' },
    { name: 'eKYC本人確認費', value: totalEkycCost, color: '#0ea5e9' },
    { name: 'SMS電話番号認証費', value: smsCostTotal, color: '#f59e0b' },
    { name: 'Stripe決済手数料', value: stripeFeeTotal, color: '#ec4899' },
    { name: 'インフラ・特商法固定費', value: fixedMonthlyCost, color: '#64748b' }
  ].filter(item => item.value > 0);

  // 📊 Phases Bar Chart Data
  const phasesBarData = [
    { phase: '① 初期 (1万人)', 売上: 6, 純利益: 2.2, 原価: 3.8 },
    { phase: '② 成長 (10万人)', 売上: 60, 純利益: 36.6, 原価: 23.4 },
    { phase: '③ バズ (50万人)', 売上: 300, 純利益: 184, 原価: 116 },
    { phase: '④ 全国 (150万人)', 売上: 900, 純利益: 562, 原価: 338 }
  ];

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const text = `【ReMEETs 課金モデル・収益試算サマリー】
■ 試算前提
- 月間アクティブユーザー (MAU): ${mau.toLocaleString()} 人
- 月間新規登録者数: ${newUsers.toLocaleString()} 人 / 月
- 開通成立件数: ${openSuccessCount.toLocaleString()} 件 / 月
- 開通手数料: ${formatRawYen(openFee)} / 件

■ 月間財務試算結果
- 月間総売上 (Revenue): ${formatRawYen(grossRevenue)} (${formatYen(grossRevenue)})
  ├ 基本開通手数料: ${formatRawYen(coreRevenue)}
  └ 追加オプション売上: ${formatRawYen(totalUpsideRevenue)}
- 月間総原価 (Total Cost): ${formatRawYen(totalMonthlyCost)} (${formatYen(totalMonthlyCost)})
  ├ Stripe決済手数料 (3.6%): ${formatRawYen(stripeFeeTotal)}
  ├ SMS通信認証費: ${formatRawYen(smsCostTotal)}
  ├ eKYC身元確認原価: ${formatRawYen(totalEkycCost)}
  └ インフラ・特商法固定費: ${formatRawYen(fixedMonthlyCost)}
- 月間営業純利益 (Net Profit): ${formatRawYen(netMonthlyProfit)} (${formatYen(netMonthlyProfit)})
- 営業利益率: ${netProfitMargin}%
- 1件開通あたりの手元利益: +${formatRawYen(unitProfitPerSuccess)}

■ 年間ランレート ＆ 推定企業価値
- 年間営業純利益 (ARR換算): ${formatYen(annualizedNetProfit)}
- 推定企業価値 (EBITDA 3.5x〜5.5x): ${formatYen(valuationMin)} 〜 ${formatYen(valuationMax)}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const csvContent = `項目,数値,単位,備考
月間アクティブユーザー (MAU),${mau},人,
新規登録率,${newRegRate},%,
月間新規登録者数,${newUsers},人,
想い出照合開封意向率,${matchingRate},%,
開封試行人数,${openAttempts},人,
eKYC審査合格率,${ekycPassRate},%,
開通成立人数,${openSuccessCount},人,
開通手数料単価,${openFee},円,
月間総売上,${grossRevenue},円,${formatYen(grossRevenue)}
基本開通売上,${coreRevenue},円,
追加オプション売上,${totalUpsideRevenue},円,
Stripe決済手数料,${stripeFeeTotal},円,手数料率 3.6%
SMS通信費,${smsCostTotal},円,単価 ${smsCost}円
eKYC身元認証費,${totalEkycCost},円,単価 ${ekycCost}円
インフラ固定費,${fixedMonthlyCost},円,プラン: ${setupTier}
月間総原価,${totalMonthlyCost},円,
月間営業純利益,${netMonthlyProfit},円,${formatYen(netMonthlyProfit)}
営業利益率,${netProfitMargin},%,
1件開通あたり純利,${unitProfitPerSuccess},円,
年間営業利益(ARR換算),${annualizedNetProfit},円,${formatYen(annualizedNetProfit)}
推定企業価値(下限),${valuationMin},円,${formatYen(valuationMin)}
推定企業価値(上限),${valuationMax},円,${formatYen(valuationMax)}
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ReMEETs_Revenue_Simulation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="monetization-simulator-block" className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-8 font-sans">
      {/* 🧭 Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2 border border-emerald-200/60">
            <DollarSign size={14} />
            <span>課金モデル ＆ ユニットエコノミクス採算エンジン</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-black flex items-center gap-2">
            <span>課金モデル収益シミュレーター</span>
            <span className="text-xs font-serif font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Ver 2.5 リアルタイム試算
            </span>
          </h3>
          <p className="text-xs text-black/60 mt-1">
            「人数 × 単価 ＝ 売上・原価・利益」をアクション別に分解。eKYCやSMSの原価を引いて確実に黒字が残る構造を可視化しています。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-black transition-all cursor-pointer border border-brand-border/60"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'コピー完了！' : 'サマリーをコピー'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 transition-all cursor-pointer border border-teal-200"
          >
            <Download size={14} />
            <span>試算CSV出力</span>
          </button>
        </div>
      </div>

      {/* 🚀 0. 事業成長シナリオ・ワンクリックプリセット */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-black flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>ワンクリック成長シナリオプリセット（事業フェーズ別試算）</span>
          </span>
          <span className="text-[11px] text-black/50">クリックすると下の全スライダーとグラフが一括更新されます</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset('launch')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mau === 10000 && !optPremiumBottle
                ? 'bg-white border-teal-600 shadow-sm ring-2 ring-teal-500/10'
                : 'bg-white/80 hover:bg-white border-brand-border'
            }`}
          >
            <div className="text-xs font-bold text-black flex items-center gap-1">
              <span>🌱 ① ローンチ初期</span>
            </div>
            <div className="text-[11px] text-black/60 mt-0.5">MAU <span className="font-serif font-bold text-black">10,000</span>人 / 開通 <span className="font-serif font-bold text-black">100</span>件</div>
            <div className="text-[11px] font-serif font-bold text-teal-800 mt-1">月商 6 万円 / 純利 +2.2 万円</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('growth')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mau === 100000 && optPremiumBottle && !optArchiveSub
                ? 'bg-white border-teal-600 shadow-sm ring-2 ring-teal-500/10'
                : 'bg-white/80 hover:bg-white border-brand-border'
            }`}
          >
            <div className="text-xs font-bold text-black flex items-center gap-1">
              <span>🚀 ② 安定成長期</span>
            </div>
            <div className="text-[11px] text-black/60 mt-0.5">MAU <span className="font-serif font-bold text-black">100,000</span>人 / 開通 <span className="font-serif font-bold text-black">1,000</span>件</div>
            <div className="text-[11px] font-serif font-bold text-teal-800 mt-1">月商 60 万円 / 純利 +36.6 万円</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('viral')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mau === 500000 && optArchiveSub
                ? 'bg-white border-teal-600 shadow-sm ring-2 ring-teal-500/10'
                : 'bg-white/80 hover:bg-white border-brand-border'
            }`}
          >
            <div className="text-xs font-bold text-black flex items-center gap-1">
              <span>🔥 ③ メディアバズ期</span>
            </div>
            <div className="text-[11px] text-black/60 mt-0.5">MAU <span className="font-serif font-bold text-black">500,000</span>人 / 開通 <span className="font-serif font-bold text-black">5,500</span>件</div>
            <div className="text-[11px] font-serif font-bold text-teal-800 mt-1">月商 300 万円 / 純利 +184 万円</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('platform')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              mau === 1500000
                ? 'bg-white border-teal-600 shadow-sm ring-2 ring-teal-500/10'
                : 'bg-white/80 hover:bg-white border-brand-border'
            }`}
          >
            <div className="text-xs font-bold text-black flex items-center gap-1">
              <span>🏆 ④ 全国規模期</span>
            </div>
            <div className="text-[11px] text-black/60 mt-0.5">MAU <span className="font-serif font-bold text-black">1,500,000</span>人 / 開通 <span className="font-serif font-bold text-black">18,000</span>件</div>
            <div className="text-[11px] font-serif font-bold text-teal-800 mt-1">月商 900 万円 / 純利 +562 万円</div>
          </button>
        </div>
      </div>

      {/* 📊 1. トップサマリーカード（4大主要メトリクス ＋ 企業価値推計） */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ① 月間総売上 */}
        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">月間総売上 (Revenue)</span>
            <Sparkles size={14} className="text-emerald-700" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-950 font-serif">
            {formatYen(grossRevenue)}
          </p>
          <div className="text-[11px] text-emerald-800 font-medium">
            開通成立: <b>{openSuccessCount.toLocaleString()}</b> 件 ({formatRawYen(openFee)})
            {totalUpsideRevenue > 0 && <span className="block text-[10px] text-emerald-700">＋追加収益: {formatYen(totalUpsideRevenue)}</span>}
          </div>
        </div>

        {/* ② 月間総原価 */}
        <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">月間総原価 (Total Cost)</span>
            <AlertTriangle size={14} className="text-rose-700" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-rose-950 font-serif">
            {formatYen(totalMonthlyCost)}
          </p>
          <div className="text-[11px] text-rose-800 font-medium">
            変動費: {formatYen(totalVariableCost)} ＋ 固定費: {formatYen(fixedMonthlyCost)}
          </div>
        </div>

        {/* ③ 月間営業純利益 */}
        <div className={`p-5 rounded-2xl border space-y-1.5 ${netMonthlyProfit >= 0 ? 'bg-teal-50/90 border-teal-200/90' : 'bg-red-100 border-red-300'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${netMonthlyProfit >= 0 ? 'text-teal-950' : 'text-red-950'}`}>
              月間営業純利益 (Net Profit)
            </span>
            <TrendingUp size={14} className={netMonthlyProfit >= 0 ? 'text-teal-700' : 'text-red-700'} />
          </div>
          <p className={`text-2xl md:text-3xl font-extrabold font-serif ${netMonthlyProfit >= 0 ? 'text-teal-950' : 'text-red-950'}`}>
            {netMonthlyProfit >= 0 ? '+' : ''}{formatYen(netMonthlyProfit)}
          </p>
          <div className={`text-[11px] font-bold ${netMonthlyProfit >= 0 ? 'text-teal-900' : 'text-red-900'}`}>
            粗利率: {netProfitMargin}% {netMonthlyProfit >= 0 ? '（高収益・黒字）' : '（原価割れ赤字）'}
          </div>
        </div>

        {/* ④ 1開通あたりの純利益 ＆ 推定企業価値 */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">1開通あたりの手元利益</span>
            <UserCheck size={14} className="text-amber-800" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-950 font-serif">
            +{formatRawYen(unitProfitPerSuccess)} <span className="text-xs font-normal text-amber-900">/件</span>
          </p>
          <div className="text-[11px] text-amber-900 font-medium">
            ARR換算企業価値: <b>{formatYen(valuationMin)}〜{formatYen(valuationMax)}</b>
          </div>
        </div>
      </div>

      {/* 📈 2. インタラクティブ・ビジュアルチャート（損益分岐点・分配円グラフ・フェーズ比較） */}
      <div className="p-5 rounded-2xl bg-white border border-brand-border space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-teal-700" />
            <h4 className="text-sm font-bold text-black">
              収益シミュレーション・ビジュアルアナリティクス
            </h4>
          </div>
          {/* Chart View Switcher */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-brand-border/60 text-xs">
            <button
              type="button"
              onClick={() => setChartView('bep')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'bep' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'
              }`}
            >
              📈 損益分岐点カーブ (BEP)
            </button>
            <button
              type="button"
              onClick={() => setChartView('pie')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'pie' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'
              }`}
            >
              🥧 コスト・利益構成比
            </button>
            <button
              type="button"
              onClick={() => setChartView('phases')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'phases' ? 'bg-white text-black shadow-sm' : 'text-black/60 hover:text-black'
              }`}
            >
              📊 4大成長フェーズ比較
            </button>
          </div>
        </div>

        {/* Chart 1: BEP Area Chart */}
        {chartView === 'bep' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-black/60">
              <span>MAU拡大に伴う「売上高」「総原価」「営業純利益」の成長カーブ（単位: 万円/月）</span>
              <span className="font-serif text-teal-800 font-bold">現在値: MAU {mau.toLocaleString()}人 ➔ 純利 {formatYen(netMonthlyProfit)}</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bepChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mau" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="万" />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} 万円`, '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Area type="monotone" dataKey="売上高" stroke="#10b981" fillOpacity={1} fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="営業純利益" stroke="#0d9488" fillOpacity={1} fill="url(#profitGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="総原価" stroke="#f43f5e" fillOpacity={0} strokeWidth={1.5} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 2: Cost & Profit Pie Chart */}
        {chartView === 'pie' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} 円 (${formatYen(Number(val))})`, '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              <span className="font-bold text-black block mb-1">売上配分 ＆ 原価構成の内訳</span>
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-brand-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-black">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-black">{formatRawYen(item.value)}</span>
                    <span className="text-[10px] text-black/50 ml-1.5">
                      ({grossRevenue > 0 ? ((item.value / grossRevenue) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart 3: Phases Bar Chart */}
        {chartView === 'phases' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-black/60">
              <span>事業成長フェーズ別の月商・営業利益ステップアップ比較（単位: 万円/月）</span>
              <span className="text-[11px] text-black/50">スケールするほど固定費比率が下がり純利益率が急上昇します</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phasesBarData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="phase" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="万" />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} 万円`, '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="売上" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="純利益" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="原価" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 📑 3. アクション別「人数・売上・原価・利益」詳細テーブル */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-black flex items-center gap-2">
            <Layers size={16} className="text-teal-700" />
            <span>アクション別 人数・売上・原価・利益の内訳明細</span>
          </h4>
          <span className="text-[11px] text-black/50">※ eKYC不合格時の返金や原価ロスも正確に反映</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* アクション①: 想い出照合＆メッセージ開封（課金導線） */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white space-y-4 shadow-sm">
            <div className="flex items-start justify-between border-b border-emerald-100 pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                  <MailOpen size={12} />
                  <span>課金アクション①</span>
                </div>
                <h5 className="text-sm font-bold text-black">想い出照合 ＆ メッセージ開封者（連絡先開示）</h5>
                <p className="text-[11px] text-black/60">クイズ正解後に600円決済＋eKYC＋SMS認証を実施</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-black/50 block">対象試行人数</span>
                <span className="text-lg font-bold text-black font-serif">{openAttempts.toLocaleString()} <span className="text-xs font-normal">人</span></span>
              </div>
            </div>

            {/* 人数内訳 */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-zinc-100">
              <div>
                <span className="text-black/60 block text-[11px]">eKYC審査合格（開通成立）:</span>
                <span className="font-bold text-emerald-800 font-serif text-sm">{openSuccessCount.toLocaleString()} 人</span>
                <span className="text-[10px] text-black/40 block">（合格率: {ekycPassRate}%）</span>
              </div>
              <div>
                <span className="text-black/60 block text-[11px]">不合格・即時返金取消:</span>
                <span className="font-bold text-rose-600 font-serif text-sm">{openFailCount.toLocaleString()} 人</span>
                <span className="text-[10px] text-black/40 block">（※売上 0円 / eKYC原価のみ発生）</span>
              </div>
            </div>

            {/* 売上と原価の内訳 */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 font-semibold">
                <span className="text-emerald-900 flex items-center gap-1">
                  <span>💰 開封手数料売上</span>
                  <span className="text-[10px] text-black/40">({openSuccessCount}人 × {formatRawYen(openFee)})</span>
                </span>
                <span className="text-emerald-800 font-serif">+{formatRawYen(coreRevenue)}</span>
              </div>

              <div className="space-y-1 text-black/70 pl-2">
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>├ 💳 Stripe決済手数料 (3.6%):</span>
                  <span className="text-rose-600 font-serif font-bold">-{formatRawYen(Math.round(coreRevenue * 0.036))}</span>
                </div>
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>├ 📱 SMS電話番号認証費 ({openAttempts}人 × {smsCost}円):</span>
                  <span className="text-rose-600 font-serif font-bold">-{formatRawYen(Math.round(openAttempts * smsCost))}</span>
                </div>
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>└ 🪪 eKYC本人確認費 ({openAttempts}人 × {ekycCost}円):</span>
                  <span className="text-rose-600 font-serif font-bold">-{formatRawYen(openEkycCostTotal)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-sm bg-emerald-50/80 p-2.5 rounded-xl">
                <span className="text-emerald-950">✨ このアクションの純利益:</span>
                <div className="text-right">
                  <span className="text-emerald-900 font-serif text-base">+{formatRawYen(openActionGrossProfit)}</span>
                  <span className="text-[10px] text-emerald-800 block font-normal">利益率: <span className="font-serif font-bold">{openActionMargin}%</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* アクション②: 投函者などの自発的eKYC認証 */}
          <div className="p-5 rounded-2xl border border-brand-border bg-gradient-to-b from-zinc-50/60 to-white space-y-4 shadow-sm">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-200 text-black rounded-md text-[10px] font-bold">
                  <ShieldCheck size={12} />
                  <span>アクション②</span>
                </div>
                <h5 className="text-sm font-bold text-black">投函者の自発的eKYC認証（信頼バッジ）</h5>
                <p className="text-[11px] text-black/60">メッセージ投函時に自ら本人確認を完了し、認証済マークを付与</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-black/50 block">対象人数</span>
                <span className="text-lg font-bold text-black font-serif">{voluntaryEkycUsers.toLocaleString()} <span className="text-xs font-normal">人</span></span>
              </div>
            </div>

            {/* 人数と負担内訳 */}
            <div className="bg-white p-3 rounded-xl border border-zinc-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-black/60">認証実施人数:</span>
                <span className="font-bold text-black font-serif">{voluntaryEkycUsers.toLocaleString()} 人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">eKYCベンダー原価単価:</span>
                <span className="font-bold text-black font-serif">{ekycCost} 円 / 件</span>
              </div>
            </div>

            {/* 原価サマリー */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 font-semibold text-black/80">
                <span>💰 ユーザー課金</span>
                <span>0 円 <span className="text-[10px] text-black/40">（無料提供）</span></span>
              </div>

              <div className="flex justify-between py-1 text-black/70">
                <span>🪪 eKYC本人認証原価 ({voluntaryEkycUsers}人 × {ekycCost}円):</span>
                <span className="text-rose-600 font-serif font-bold">-{formatRawYen(voluntaryEkycCostTotal)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-brand-border font-bold text-sm bg-zinc-100/70 p-2.5 rounded-xl">
                <span className="text-black">📉 運営コスト負担:</span>
                <span className="text-rose-700 font-serif text-base">-{formatRawYen(voluntaryEkycCostTotal)}</span>
              </div>
            </div>

            <div className="text-[11px] text-black/60 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
              💡 <b>安心設計</b>: 投函時のeKYC原価は、アクション①のメッセージ開封手数料（{formatRawYen(openFee)}）の純利益（+{formatRawYen(openActionGrossProfit)}）から余裕で相殺・回収されます。
            </div>
          </div>
        </div>
      </div>

      {/* 💎 4. 追加マネタイズオプション（アップサイド収益検証） */}
      <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle size={16} className="text-teal-700" />
            <h4 className="text-sm font-bold text-black">
              追加マネタイズ・アップサイド機能のON/OFFシミュレーション
            </h4>
          </div>
          <span className="text-[11px] font-serif font-bold text-teal-800">
            追加収益合計: +{formatYen(totalUpsideRevenue)} / 月
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option 1: Premium Bottle */}
          <div className={`p-4 rounded-xl border transition-all ${
            optPremiumBottle ? 'bg-white border-teal-600 shadow-sm' : 'bg-white/60 border-zinc-200 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-black">🍾 プレミアムボトル同時投函</span>
              <input
                type="checkbox"
                checked={optPremiumBottle}
                onChange={(e) => setOptPremiumBottle(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-black/60 mb-2">通常制限を超えた複数同時投函・優先漂流</p>
            {optPremiumBottle && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-black/60">単価: <span className="font-serif font-bold text-black">{optPremiumBottleFee}</span>円 / 利用率: <span className="font-serif font-bold text-black">{optPremiumBottleRate}</span>%</span>
                  <span className="font-serif font-bold text-teal-800">+{formatYen(premiumBottleRevenue)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Archive Subscription */}
          <div className={`p-4 rounded-xl border transition-all ${
            optArchiveSub ? 'bg-white border-teal-600 shadow-sm' : 'bg-white/60 border-zinc-200 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-black">📁 想い出キープ・アーカイブ</span>
              <input
                type="checkbox"
                checked={optArchiveSub}
                onChange={(e) => setOptArchiveSub(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-black/60 mb-2">ボトルの永久保存・返信通知最優先サブスク</p>
            {optArchiveSub && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-black/60">月額: <span className="font-serif font-bold text-black">{optArchiveSubFee}</span>円 / 加入率: <span className="font-serif font-bold text-black">{optArchiveSubRate}</span>%</span>
                  <span className="font-serif font-bold text-teal-800">+{formatYen(archiveSubRevenue)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Option 3: Gift Chip */}
          <div className={`p-4 rounded-xl border transition-all ${
            optGiftChip ? 'bg-white border-teal-600 shadow-sm' : 'bg-white/60 border-zinc-200 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-black">🎁 再会サンクスギフト手数料</span>
              <input
                type="checkbox"
                checked={optGiftChip}
                onChange={(e) => setOptGiftChip(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-black/60 mb-2">再会成立時の感謝ギフト・投げ銭 (手数料 15%)</p>
            {optGiftChip && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-black/60">平均: <span className="font-serif font-bold text-black">{optGiftAvgAmount.toLocaleString()}</span>円 / 手数料 <span className="font-serif font-bold text-black">{optGiftTakeRate}</span>%</span>
                  <span className="font-serif font-bold text-teal-800">+{formatYen(giftRevenue)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎛️ 5. インタラクティブ・パラメータ調整スライダー */}
      <div className="bg-zinc-50 p-6 rounded-2xl border border-brand-border space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign size={14} className="text-teal-700" />
            <span>パラメータ微調整スライダー</span>
          </h4>
          <span className="text-[11px] text-black/50">動かすと上の数値・グラフ・利益が瞬時に再計算されます</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* スライダー1: MAU */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>月間アクティブ数 (MAU)</span>
              <span className="text-teal-800 font-serif">{mau.toLocaleString()} 人</span>
            </div>
            <input
              type="range"
              min={1000}
              max={2000000}
              step={5000}
              value={mau}
              onChange={(e) => setMau(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <span className="text-[10px] text-black/50 block">新規登録: {newUsers.toLocaleString()} 人/月</span>
          </div>

          {/* スライダー2: 開通手数料 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>連絡先開示・開通手数料</span>
              <span className="text-emerald-800 font-serif font-extrabold">{formatRawYen(openFee)}</span>
            </div>
            <input
              type="range"
              min={300}
              max={2000}
              step={50}
              value={openFee}
              onChange={(e) => setOpenFee(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-black/50 block">標準: 600 円 / プレミアム: 1,200 円</span>
          </div>

          {/* スライダー3: eKYC従量原価 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>eKYC 外部API単価（1件）</span>
              <span className="text-rose-600 font-serif">{ekycCost} 円</span>
            </div>
            <input
              type="range"
              min={100}
              max={300}
              step={10}
              value={ekycCost}
              onChange={(e) => setEkycCost(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <span className="text-[10px] text-black/50 block">TRUSTDOCK / LIQUID 標準: 150〜200 円</span>
          </div>

          {/* スライダー4: SMS送信単価 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>SMS送信 外部単価（1通）</span>
              <span className="text-rose-600 font-serif">{smsCost} 円</span>
            </div>
            <input
              type="range"
              min={8}
              max={25}
              step={1}
              value={smsCost}
              onChange={(e) => setSmsCost(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <span className="text-[10px] text-black/50 block">Twilio / EZSMS: 10〜15 円</span>
          </div>

          {/* スライダー5: 開封意向率 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>想い出一致・開封意向率</span>
              <span className="text-teal-800 font-serif">{matchingRate}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              step={5}
              value={matchingRate}
              onChange={(e) => setMatchingRate(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <span className="text-[10px] text-black/50 block">開封試行: {openAttempts.toLocaleString()} 人</span>
          </div>

          {/* スライダー6: 自発的eKYC人数 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>投函者の自発eKYC件数</span>
              <span className="text-black font-serif">{voluntaryEkycUsers.toLocaleString()} 人/月</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={20}
              value={voluntaryEkycUsers}
              onChange={(e) => setVoluntaryEkycCount(Number(e.target.value))}
              className="w-full accent-zinc-600 cursor-pointer"
            />
            <span className="text-[10px] text-black/50 block">認証バッジ取得による信頼性担保</span>
          </div>
        </div>

        {/* インフラプラン選択 */}
        <div className="pt-2 border-t border-zinc-200">
          <div className="flex items-center justify-between text-xs font-bold text-black mb-2">
            <span>サーバー・特商法インフラ固定費プラン:</span>
            <span className="text-teal-800 font-serif">
              月額固定費: {formatRawYen(fixedMonthlyCost)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['minimum', 'standard', 'enterprise'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setSetupTier(tier)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                  setupTier === tier
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-white text-black border-brand-border hover:bg-zinc-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{tier === 'minimum' ? '最小構成' : tier === 'standard' ? '標準構成（特商法対応）' : '高可用性法人'}</span>
                  <span className={`text-[10px] ${setupTier === tier ? 'text-teal-200' : 'text-black/50'}`}>
                    {tier === 'minimum' ? '500 円〜' : tier === 'standard' ? '3,700 円〜' : '18,300 円〜'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMonetizationBlock;
