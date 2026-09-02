import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, Layers, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, MailOpen, CreditCard, Sparkles } from 'lucide-react';

export const AdminMonetizationBlock = () => {
  // Simulator State Sliders
  const [mau, setMau] = useState<number>(500000); // Monthly Active Users
  const [newRegRate, setNewRegRate] = useState<number>(10); // % of MAU that register per month
  const [matchingRate, setMatchingRate] = useState<number>(50); // % of new users who match/attempt open
  const [openFee, setOpenFee] = useState<number>(600); // Fee per letter open & contact reveal (￥)
  const [smsCost, setSmsCost] = useState<number>(12); // Cost of single SMS verification (￥)
  const [ekycCost, setEkycCost] = useState<number>(150); // Fee per eKYC verification (￥)
  const [voluntaryEkycCount, setVoluntaryEkycCount] = useState<number>(150); // 投函者などの自発的eKYC人数（件/月）
  const [ekycPassRate, setEkycPassRate] = useState<number>(92); // % of eKYC submissions that pass
  const [setupTier, setSetupTier] = useState<'minimum' | 'standard' | 'enterprise'>('standard');
  const [businessModel, setBusinessModel] = useState<'bundled_pay' | 'free_ekyc'>('bundled_pay');

  const stripeFeeRate = 3.6; // Stripe commission %

  // Calculations
  const newUsers = Math.round(mau * (newRegRate / 100)); // 月間新規登録者数

  // 1. 想い出照合＆開封希望者（課金導線）
  const openAttempts = Math.round(newUsers * (matchingRate / 100)); // 開封・照合試行人数
  const openSuccessCount = Math.round(openAttempts * (ekycPassRate / 100)); // eKYC合格＆開通成立人数
  const openFailCount = openAttempts - openSuccessCount; // 審査不合格・返金人数

  // 2. 自発的eKYC認証者（投函時の信頼バッジ取得等）
  const voluntaryEkycUsers = businessModel === 'bundled_pay' ? voluntaryEkycCount : Math.round(newUsers * 0.35);

  // 人数合計
  const totalEkycPeople = (businessModel === 'bundled_pay' ? openAttempts : voluntaryEkycUsers) + (businessModel === 'bundled_pay' ? voluntaryEkycUsers : 0);
  const totalSmsPeople = businessModel === 'bundled_pay' ? openAttempts : voluntaryEkycUsers;

  // 💰 売上計算
  const grossRevenue = openSuccessCount * openFee; // 総売上（成立件数 × 開封料）

  // 📉 原価計算（内訳別）
  const stripeFeeTotal = Math.round(grossRevenue * (stripeFeeRate / 100)); // Stripe決済手数料 (3.6%)
  const smsCostTotal = Math.round(totalSmsPeople * smsCost); // SMS認証送信費
  const openEkycCostTotal = Math.round((businessModel === 'bundled_pay' ? openAttempts : 0) * ekycCost); // 開封に伴うeKYC費
  const voluntaryEkycCostTotal = Math.round(voluntaryEkycUsers * ekycCost); // 投函者自発eKYC費
  const totalEkycCost = openEkycCostTotal + voluntaryEkycCostTotal; // eKYC総原価

  // 変動原価合計
  const totalVariableCost = stripeFeeTotal + smsCostTotal + totalEkycCost;

  // アクション別 粗利益計算
  // ① 開封・照合アクションの純粗利益（売上 - Stripe - SMS - 開封eKYC費）
  const openActionGrossProfit = grossRevenue - stripeFeeTotal - (openAttempts * smsCost) - openEkycCostTotal;
  const openActionMargin = grossRevenue > 0 ? ((openActionGrossProfit / grossRevenue) * 100).toFixed(1) : '0';
  const unitProfitPerSuccess = openSuccessCount > 0 ? Math.round(openActionGrossProfit / openSuccessCount) : 0;

  // ② 投函者自発eKYCのコスト（現状運営負担）
  const voluntaryEkycNetCost = voluntaryEkycCostTotal;

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

  return (
    <div id="monetization-simulator-block" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-8 font-sans">
      {/* ヘッダーエリア */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <DollarSign size={14} />
            <span>収益構造 ＆ ユニットエコノミクス分析</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-slate-900">
            eKYC・SMS・開通課金 採算予測シミュレーション
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            「人数 × 単価 ＝ 売上・原価・利益」をアクション別に分解。eKYCやSMSの原価を引いて確実に黒字が残る構造を可視化しています。
          </p>
        </div>

        {/* 課金モデル切り替えタブ */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setBusinessModel('bundled_pay')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              businessModel === 'bundled_pay'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌟 推奨: 連絡先開示・開通連動モデル
          </button>
          <button
            type="button"
            onClick={() => setBusinessModel('free_ekyc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              businessModel === 'free_ekyc'
                ? 'bg-white text-rose-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚠️ 登録時無料eKYCモデル
          </button>
        </div>
      </div>

      {/* 📊 1. トップサマリーカード（4大主要メトリクス） */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ① 月間総売上 */}
        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">月間総売上 (Revenue)</span>
            <Sparkles size={14} className="text-emerald-700" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-950 font-serif">
            ¥{grossRevenue.toLocaleString()}
          </p>
          <div className="text-[11px] text-emerald-800 font-medium">
            開通成立: <b>{openSuccessCount.toLocaleString()}</b> 人 × ¥{openFee.toLocaleString()}
          </div>
        </div>

        {/* ② 月間総原価 */}
        <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">月間総原価 (Total Cost)</span>
            <AlertTriangle size={14} className="text-rose-700" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-rose-950 font-serif">
            ¥{totalMonthlyCost.toLocaleString()}
          </p>
          <div className="text-[11px] text-rose-800 font-medium">
            変動原価: ¥{totalVariableCost.toLocaleString()} + 固定費: ¥{fixedMonthlyCost.toLocaleString()}
          </div>
        </div>

        {/* ③ 月間営業純利益 */}
        <div className={`p-5 rounded-2xl border space-y-1.5 ${netMonthlyProfit >= 0 ? 'bg-indigo-50/90 border-indigo-200/90' : 'bg-red-100 border-red-300'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${netMonthlyProfit >= 0 ? 'text-indigo-950' : 'text-red-950'}`}>
              月間営業純利益 (Net Profit)
            </span>
            <TrendingUp size={14} className={netMonthlyProfit >= 0 ? 'text-indigo-700' : 'text-red-700'} />
          </div>
          <p className={`text-2xl md:text-3xl font-extrabold font-serif ${netMonthlyProfit >= 0 ? 'text-indigo-950' : 'text-red-950'}`}>
            {netMonthlyProfit >= 0 ? '+' : ''}¥{netMonthlyProfit.toLocaleString()}
          </p>
          <div className={`text-[11px] font-bold ${netMonthlyProfit >= 0 ? 'text-indigo-900' : 'text-red-900'}`}>
            黒字利益率: {netProfitMargin}% {netMonthlyProfit >= 0 ? '（健全黒字）' : '（原価割れ赤字）'}
          </div>
        </div>

        {/* ④ 1開通あたりの純利益 */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">1開通あたりの手元利益</span>
            <UserCheck size={14} className="text-amber-800" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-950 font-serif">
            +¥{unitProfitPerSuccess.toLocaleString()} <span className="text-xs font-normal text-amber-900">/件</span>
          </p>
          <div className="text-[11px] text-amber-900 font-medium">
            手数料 ¥{openFee} － 原価合計 ¥{Math.round((openFee * 0.036) + smsCost + ekycCost)}
          </div>
        </div>
      </div>

      {/* 📑 2. アクション別「人数・売上・原価・利益」詳細テーブル（ここが最も重要） */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <span>アクション別 人数・売上・原価・利益の内訳明細</span>
          </h4>
          <span className="text-[11px] text-slate-500">※ eKYC不合格時の返金や原価ロスも正確に反映</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* アクション①: 想い出照合＆手紙開封（課金導線） */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white space-y-4 shadow-sm">
            <div className="flex items-start justify-between border-b border-emerald-100 pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                  <MailOpen size={12} />
                  <span>課金アクション①</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900">想い出照合 ＆ 手紙開封者（連絡先開示）</h5>
                <p className="text-[11px] text-slate-500">クイズ正解後に600円決済＋eKYC＋SMS認証を実施</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">対象試行人数</span>
                <span className="text-lg font-bold text-slate-900 font-serif">{openAttempts.toLocaleString()} <span className="text-xs font-normal">人</span></span>
              </div>
            </div>

            {/* 人数内訳 */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[11px]">eKYC審査合格（開通成立）:</span>
                <span className="font-bold text-emerald-700 font-serif text-sm">{openSuccessCount.toLocaleString()} 人</span>
                <span className="text-[10px] text-slate-400 block">（合格率: {ekycPassRate}%）</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">不合格・即時返金取消:</span>
                <span className="font-bold text-rose-600 font-serif text-sm">{openFailCount.toLocaleString()} 人</span>
                <span className="text-[10px] text-slate-400 block">（※売上¥0 / eKYC原価のみ発生）</span>
              </div>
            </div>

            {/* 売上と原価の内訳 */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                <span className="text-emerald-800 flex items-center gap-1">
                  <span>💰 開封手数料売上</span>
                  <span className="text-[10px] text-slate-400">({openSuccessCount}人 × ¥{openFee})</span>
                </span>
                <span className="text-emerald-700 font-serif">+¥{grossRevenue.toLocaleString()}</span>
              </div>

              <div className="space-y-1 text-slate-600 pl-2">
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>├ 💳 Stripe決済手数料 (3.6%):</span>
                  <span className="text-rose-600 font-mono">-¥{stripeFeeTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>├ 📱 SMS電話番号認証費 ({openAttempts}人 × ¥{smsCost}):</span>
                  <span className="text-rose-600 font-mono">-¥{Math.round(openAttempts * smsCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>└ 🪪 eKYC本人確認費 ({openAttempts}人 × ¥{ekycCost}):</span>
                  <span className="text-rose-600 font-mono">-¥{openEkycCostTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-emerald-200 font-bold text-sm bg-emerald-50/80 p-2.5 rounded-xl">
                <span className="text-emerald-950">✨ このアクションの純利益:</span>
                <div className="text-right">
                  <span className="text-emerald-800 font-serif text-base">+¥{openActionGrossProfit.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-700 block font-normal">利益率: {openActionMargin}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* アクション②: 投函者などの自発的eKYC認証 */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/60 to-white space-y-4 shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md text-[10px] font-bold">
                  <ShieldCheck size={12} />
                  <span>アクション②</span>
                </div>
                <h5 className="text-sm font-bold text-slate-900">投函者の自発的eKYC認証（信頼バッジ）</h5>
                <p className="text-[11px] text-slate-500">手紙投函時に自ら本人確認を完了し、認証済マークを付与</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">対象人数</span>
                <span className="text-lg font-bold text-slate-900 font-serif">{voluntaryEkycUsers.toLocaleString()} <span className="text-xs font-normal">人</span></span>
              </div>
            </div>

            {/* 人数と負担内訳 */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">認証実施人数:</span>
                <span className="font-bold text-slate-900 font-serif">{voluntaryEkycUsers.toLocaleString()} 人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">eKYCベンダー原価単価:</span>
                <span className="font-medium text-slate-700">¥{ekycCost} / 件</span>
              </div>
            </div>

            {/* 原価サマリー */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 font-semibold text-slate-700">
                <span>💰 ユーザー課金</span>
                <span>¥0 <span className="text-[10px] text-slate-400">（無料提供）</span></span>
              </div>

              <div className="flex justify-between py-1 text-slate-600">
                <span>🪪 eKYC本人認証原価 ({voluntaryEkycUsers}人 × ¥{ekycCost}):</span>
                <span className="text-rose-600 font-mono">-¥{voluntaryEkycCostTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm bg-slate-100/70 p-2.5 rounded-xl">
                <span className="text-slate-800">📉 運営コスト負担:</span>
                <span className="text-rose-700 font-serif text-base">-¥{voluntaryEkycNetCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
              💡 <b>ワンポイント</b>: 投函時のeKYC原価は、アクション①の手紙開封手数料（¥{openFee}）の純利益（+¥{openActionGrossProfit.toLocaleString()}）から余裕で相殺・回収されています。
            </div>
          </div>
        </div>
      </div>

      {/* 🧮 3. 全体総括バランスシート（売上・原価・純利益の完全対照表） */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>月間 全体収支バランスシート（総合計）</span>
          </h4>
          <span className="text-xs text-slate-400">
            eKYC実施総人数: <b>{totalEkycPeople.toLocaleString()}</b> 人 / SMS送信総数: <b>{totalSmsPeople.toLocaleString()}</b> 通
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* 1. 売上セクション */}
          <div className="space-y-2">
            <span className="text-emerald-400 font-bold block text-[11px] uppercase tracking-wider">【1. 総売上】</span>
            <div className="bg-slate-800/80 p-3 rounded-xl space-y-1.5 border border-slate-700/60">
              <div className="flex justify-between text-slate-300">
                <span>手紙開封・連絡先開示:</span>
                <span className="font-serif font-bold text-emerald-400">+¥{grossRevenue.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                （{openSuccessCount}人 × ¥{openFee}）
              </div>
            </div>
          </div>

          {/* 2. 原価セクション */}
          <div className="space-y-2">
            <span className="text-rose-400 font-bold block text-[11px] uppercase tracking-wider">【2. 総原価内訳】</span>
            <div className="bg-slate-800/80 p-3 rounded-xl space-y-1 border border-slate-700/60 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>💳 Stripe手数料 (3.6%):</span>
                <span className="font-mono text-rose-300">-¥{stripeFeeTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>📱 SMS送信通信費:</span>
                <span className="font-mono text-rose-300">-¥{smsCostTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>🪪 eKYC本人認証費:</span>
                <span className="font-mono text-rose-300">-¥{totalEkycCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-700">
                <span>🏢 インフラ・固定費:</span>
                <span className="font-mono text-rose-300">-¥{fixedMonthlyCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-400 pt-1 border-t border-slate-700">
                <span>原価合計:</span>
                <span className="font-serif">-¥{totalMonthlyCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 3. 純利益セクション */}
          <div className="space-y-2">
            <span className="text-indigo-400 font-bold block text-[11px] uppercase tracking-wider">【3. 最終営業純利益】</span>
            <div className={`p-4 rounded-xl border space-y-2 ${netMonthlyProfit >= 0 ? 'bg-indigo-950/60 border-indigo-500/50' : 'bg-red-950/60 border-red-500/50'}`}>
              <span className="text-[11px] text-slate-300 block">全原価・固定費控除後の手元利益:</span>
              <p className={`text-2xl md:text-3xl font-extrabold font-serif ${netMonthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netMonthlyProfit >= 0 ? '+' : ''}¥{netMonthlyProfit.toLocaleString()}
              </p>
              <div className="text-[11px] text-slate-300">
                営業利益率: <b className="text-white">{netProfitMargin}%</b> （1開通あたり +¥{unitProfitPerSuccess}）
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎛️ 4. インタラクティブ・パラメータ調整スライダー */}
      <div className="bg-slate-50/90 p-6 rounded-2xl border border-slate-200/80 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign size={14} className="text-indigo-600" />
            <span>パラメータ調整（スライダーでリアルタイム試算）</span>
          </h4>
          <span className="text-[11px] text-slate-500">動かすと上の数値と利益が瞬時に再計算されます</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* スライダー1: MAU */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>月間アクティブ数 (MAU)</span>
              <span className="text-indigo-600 font-serif">{mau.toLocaleString()} 人</span>
            </div>
            <input
              type="range"
              min={1000}
              max={1000000}
              step={5000}
              value={mau}
              onChange={(e) => setMau(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">新規登録: {newUsers.toLocaleString()} 人/月</span>
          </div>

          {/* スライダー2: 開通手数料 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>連絡先開示・開通手数料</span>
              <span className="text-emerald-700 font-serif font-extrabold">¥{openFee.toLocaleString()}</span>
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
            <span className="text-[10px] text-slate-400 block">標準: ¥600 / プレミアム: ¥1,200</span>
          </div>

          {/* スライダー3: eKYC従量原価 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>eKYC 外部API単価（1件）</span>
              <span className="text-rose-600 font-serif">¥{ekycCost}</span>
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
            <span className="text-[10px] text-slate-400 block">TRUSTDOCK / LIQUID 標準: ¥150〜¥200</span>
          </div>

          {/* スライダー4: SMS送信単価 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>SMS送信 外部単価（1通）</span>
              <span className="text-rose-600 font-serif">¥{smsCost}</span>
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
            <span className="text-[10px] text-slate-400 block">Twilio / EZSMS: ¥10〜¥15</span>
          </div>

          {/* スライダー5: 開封意向率 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>想い出一致・開封意向率</span>
              <span className="text-indigo-600 font-serif">{matchingRate}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              step={5}
              value={matchingRate}
              onChange={(e) => setMatchingRate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">開封試行: {openAttempts.toLocaleString()} 人</span>
          </div>

          {/* スライダー6: 自発的eKYC人数 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>投函者の自発eKYC件数</span>
              <span className="text-slate-800 font-serif">{voluntaryEkycUsers.toLocaleString()} 人/月</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={20}
              value={voluntaryEkycUsers}
              onChange={(e) => setVoluntaryEkycCount(Number(e.target.value))}
              className="w-full accent-slate-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">認証バッジ取得による信頼性担保</span>
          </div>
        </div>

        {/* インフラプラン選択 */}
        <div className="pt-2 border-t border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>サーバー・特商法インフラ固定費プラン:</span>
            <span className="text-indigo-600 font-serif">
              月額固定費: ¥{fixedMonthlyCost.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['minimum', 'standard', 'enterprise'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setSetupTier(tier)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  setupTier === tier
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{tier === 'minimum' ? '最小構成' : tier === 'standard' ? '標準構成（特商法対応）' : '高可用性法人'}</span>
                  <span className={`text-[10px] ${setupTier === tier ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {tier === 'minimum' ? '¥500〜' : tier === 'standard' ? '¥3,700〜' : '¥18,300〜'}
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
