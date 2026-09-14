import React from "react";

export interface CostSimulatorsProps {
  smsCount: number;
  setSmsCount: (val: number) => void;
  costTab: "running" | "initial";
  setCostTab: (val: "running" | "initial") => void;
}

export const CostSimulators: React.FC<CostSimulatorsProps> = ({
  smsCount,
  setSmsCount,
  costTab,
  setCostTab
}) => {
  const renderInitialCostSimulator = () => {
    return (
      <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between h-full min-h-[460px] space-y-4 font-sans text-slate-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>初期導入・セットアップ費用 (イニシャルコスト)</span>
            </h4>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-300 font-mono">二段階導入可能</span>
          </div>

          {/* 各設定費用一覧 */}
          <div className="space-y-1.5 text-[10.5px]">
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🌐</span> LINE ＆ Google 認証連携
                </span>
                <span className="text-[9px] text-slate-400">各Developersアカウント作成・認証API利用</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">￥0</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>💳</span> Stripe 本番決済アカウント
                </span>
                <span className="text-[9px] text-slate-400">加盟店審査・APIキー発行（月額基本料なし）</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">￥0</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🔍</span> 公的本人確認 eKYC
                </span>
                <span className="text-[9px] text-slate-400">外部本人確認SDK連携（初期費無償プラン利用時）</span>
              </div>
              <span className="font-mono text-slate-200 text-xs">￥0 <span className="text-[9px] text-slate-500">(従量のみ)</span></span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🏢</span> 特商法表記 住所/登記
                </span>
                <span className="text-[9px] text-slate-400">格安バーチャルオフィス契約 (月換算約990円〜)</span>
              </div>
              <span className="font-mono text-slate-200 text-xs">￥990 <span className="text-[9px] text-slate-500">〜</span></span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🔒</span> 独自ドメイン取得 (初年度)
                </span>
                <span className="text-[9px] text-slate-400">.com / .tokyo 等のドメイン年更新料</span>
              </div>
              <span className="font-mono text-slate-200 text-xs">￥100 <span className="text-[9px] text-slate-500">〜 ￥1,500</span></span>
            </div>

            <div className="flex justify-between items-center p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span>🚀</span> サーバー・DBセットアップ
                </span>
                <span className="text-[9px] text-slate-400">Firebase Auth / Firestore (スキーマ・ルール構築)</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">￥0</span>
            </div>
          </div>
        </div>

        {/* 初期費用まとめ */}
        <div className="pt-2 border-t border-slate-800 flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>🚀</span> 立ち上げ初期コスト目安 :
            </span>
            <span className="text-lg font-mono font-bold text-cyan-400">
              ￥1,090 <span className="text-xs text-slate-400">〜 ￥2,500</span>
            </span>
          </div>
          <p className="text-[9px] text-amber-300 leading-relaxed bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-left">
            ※ <strong>完全無料のフェーズ1リリース</strong>では有料機能を非表示とするため、特商法表記やバーチャルオフィス代も<strong>完全￥0</strong>で開始可能です！
          </p>
        </div>
      </div>
    );
  };

  const renderCostSimulator = () => {
    return (
      <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between h-full min-h-[460px] space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>本番想定運用コスト (月間見積)</span>
            </h4>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">1通当たり10円換算</span>
          </div>

          {/* SMS送信数スライダー */}
          <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-300 font-bold">想定SMS認証件数 (月間) :</span>
              <span className="text-amber-400 font-mono font-bold text-sm bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {smsCount.toLocaleString()} <span className="text-[10px] text-slate-400">通</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={smsCount}
              onChange={(e) => setSmsCount(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>0通</span>
              <span>2,500通(初期時目安)</span>
              <span>5,000通(中規模)</span>
              <span>10,000通(大規模)</span>
            </div>
          </div>

          {/* 各項目コスト一覧 */}
          <div className="space-y-1.5 text-[10.5px]">
            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>📡</span> サーバー (Cloud Run)
              </span>
              <span className="font-mono text-slate-200">
                {smsCount < 1000 ? '￥0 (無料枠内)' : smsCount < 4000 ? '￥1,500' : '￥3,500'}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>🗄️</span> データベース (Firebase Firestore)
              </span>
              <span className="font-mono text-slate-200">￥0 <span className="text-[8px] text-slate-500">(Sparkプラン無料枠内)</span></span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>💬</span> SMS認証 (Twilio API)
              </span>
              <span className="font-mono text-amber-400 font-bold">
                ￥{(smsCount * 10).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>✉</span> メール配信 (SendGrid等)
              </span>
              <span className="font-mono text-slate-200">
                {smsCount < 3000 ? '￥0 (無償プラン内)' : '￥1,100 (1.2万通超)'}
              </span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>🌐</span> ドメイン更新料
              </span>
              <span className="font-mono text-slate-200">￥100 <span className="text-[8px] text-slate-500">(年換算)</span></span>
            </div>

            <div className="flex justify-between items-center p-1.5 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span>🤖</span> 外部AI & 地図API (Gemini等)
              </span>
              <span className="font-mono text-slate-200">￥1,200 <span className="text-[8px] text-slate-500">(従量目安)</span></span>
            </div>
          </div>
        </div>

        {/* 合計コスト */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <span>💰</span> 合計概算月額コスト :
          </span>
          <span className="text-lg font-mono font-bold text-cyan-400">
            ￥{(
              (smsCount < 1000 ? 0 : smsCount < 4000 ? 1500 : 3500) + // Server
              0 + // Database (Firebase Spark Plan Free)
              (smsCount * 10) + // SMS
              (smsCount < 3000 ? 0 : 1100) + // Email
              100 + // Domain
              1200 // AI & Map
            ).toLocaleString()} <span className="text-xs text-slate-400">/月</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 p-6 rounded-3xl border-2 border-[#3B627F] shadow-md flex flex-col justify-start font-sans">
      <div className="mb-4">
        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">REALTIME ESTIMATOR</span>
        <h4 className="text-sm font-bold text-white mt-1.5 font-sans">本番運用コスト＆初期費用シミュレータ</h4>
        <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
          本番運用の月間コストと初期セットアップにかかる費用を、タブで切り替えて確認・試算できます。
        </p>
      </div>

      {/* タブ切り替えボタン */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4 font-sans max-w-md">
        <button
          onClick={() => setCostTab("running")}
          className={"flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer " + (
            costTab === "running"
              ? "bg-[#3B627F] text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          月間ランニングコスト
        </button>
        <button
          onClick={() => setCostTab("initial")}
          className={"flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer " + (
            costTab === "initial"
              ? "bg-[#3B627F] text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          初期費用・ドメイン等
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 items-stretch w-full">
        <div className="w-full">
          {costTab === "running" ? renderCostSimulator() : renderInitialCostSimulator()}
        </div>
        <div className="w-full bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-3 leading-relaxed font-sans text-left flex flex-col justify-center">
          <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
            <span>💡</span> マネタイズ黒字化の仕組み
          </div>
          <p>
            メッセージ開封手数料（600円）およびeKYC本人確認審査手数料（600円）の合計1,200円（税込）をStripe経由で決済する際、外部認証ベンダー実費（SMS送信費12円、eKYC審査実費200円等）が完全にカバーされ、高水準の黒字運用が確実に維持されます。
          </p>
          <p className="text-[10.5px]">
            また、初期導入時はLINE & Google認証連携やStripe本番審査、さらにデータベース構築（Drizzle ORM）まで含めて<strong>基本初期費用は￥0</strong>（特商法表記のバーチャルオフィス代や独自ドメイン代等の実費のみ）でスタートできます。
          </p>
        </div>
      </div>
    </div>
  );
};
