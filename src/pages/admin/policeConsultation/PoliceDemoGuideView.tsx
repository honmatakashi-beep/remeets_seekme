import React from "react";
import {
  Sparkles, CheckCircle2, Play, RefreshCw, Eye, ShieldCheck, ShieldAlert,
  Search, Lock, Unlock, Key, Mail, Clock, Download, ArrowRight, Award,
  AlertTriangle, FileText, CheckSquare, Layers, Copy, Check,
  Scale, FileCheck, Presentation, Printer
} from "lucide-react";

export const PoliceDemoGuideView = (props: any) => {
  const {
    activeDemoScenario,
    setActiveDemoScenario,
    demoRunning,
    demoStep,
    demoLogs,
    handleRunDemoScenario,
    handleResetDemo,
    demoTargetName,
    setDemoTargetName,
    demoSearcherName,
    setDemoSearcherName,
    demoQuizAnswers,
    setDemoQuizAnswers,
    setIsLegalSchemeModalOpen = () => {},
    setIsTemplateModalOpen = () => {},
    ...rest
  } = props;

  return (
        <div className="space-y-8 animate-fadeIn">
          {/* メイン概要カード */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-3xl border border-indigo-500/30 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/30 pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold tracking-wider uppercase">
                  🚨 POLICE & CYBER DEFENSE PRESENTATION STRATEGY
                </div>
                <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
                  警察・行政向け セキュリティ実証デモ ＆ 9大安全防衛策 完全備忘録
                </h3>
                <p className="text-xs text-slate-300 font-serif leading-relaxed">
                  生活安全課・サイバー課への事前相談において、出会い系サイト規制法・ストーカー規制法への完全非該当と、事件時の即時捜査協力を実証する統合マスターガイドです。
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLegalSchemeModalOpen(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <Scale size={15} />
                  <span>⚖️ 非該当性説明書</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <FileCheck size={15} />
                  <span>📄 照会回答書</span>
                </button>
              </div>
            </div>

            {/* 3部構成ナビゲーション */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5 font-sans">
                  <span>💻</span> 【動的実演】画面自動操作
                </div>
                <div className="text-sm font-bold text-white font-serif">全8大ブラウザ実演シナリオ</div>
                <p className="text-[11px] text-slate-300 font-serif leading-normal">
                  Google検索流入からAI隔離、チャット非搭載、警察照会ワンクリック出力まで自律操作。
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-sans">
                  <span>🛡️</span> 【防衛体系】法令適法システム
                </div>
                <div className="text-sm font-bold text-white font-serif">全9大セキュリティ・プライバシー策</div>
                <p className="text-[11px] text-slate-300 font-serif leading-relaxed">
                  密室DM非搭載、二重マスキング、クイズ遮断、個人情報非保持、公的eKYC等を完全網羅。
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-sans">
                  <span>📄</span> 【静的証拠】紙の提出資料
                </div>
                <div className="text-sm font-bold text-white font-serif">全4大印刷持参パッケージ</div>
                <p className="text-[11px] text-slate-300 font-serif leading-relaxed">
                  法的説明書、照会回答書サンプル、全体設計図、利用規約抜粋を手渡し回覧。
                </p>
              </div>
            </div>
          </div>

          {/* セクション 1: 💻 ブラウザ自動実演 8大シナリオ詳細 */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                    <Presentation size={20} />
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    💻 ブラウザ画面操作 自動実演（デモツアー）全8大シナリオ
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-serif">
                  警察担当官の目の前でブラウザが自律動作し、鉄壁のセキュリティと適法性を直感的に証明する実演プログラムです。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scenario 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-blue-900 px-2 py-0.5 rounded bg-blue-100">
                    🔍 Demo 1 (キラーデモ)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Google検索流入＆マスキング</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  Google検索結果スニペット ➔ 一般公開マスキング着地実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> Google検索風モック画面で「山田太郎 1995年 緑中」と自動タイピング ➔ マスキングされた検索結果をクリック ➔ ReMEETsのメッセージ詳細画面へ着地し、一般画面では実名・本文・連絡先が完全に伏字（***）で安全に保護されている様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「Google等の一般ネット検索に対しても個人情報や機微な想い出が晒されることは100%ありません」
                </div>
              </div>

              {/* Scenario 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-amber-900 px-2 py-0.5 rounded bg-amber-100">
                    ⚖️ Demo 2
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">出会い系非該当性</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  秘密の想い出クイズ完全一致（無差別出会い遮断）実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 想い出クイズに間違った回答を入力して「不一致」で弾かれる様子 ➔ 正しい2人だけの秘密の答えを入力して通過する様子を自動実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「不特定多数の無差別な出会いやアプローチを100%遮断し、知人同士の合意再会のみを成立させます」
                </div>
              </div>

              {/* Scenario 3 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-rose-900 px-2 py-0.5 rounded bg-rose-100">
                    🤖 Demo 3
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">AI自律検閲エンジン</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  電話番号・住所・ストーカー執着文のミリ秒即時隔離実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> メッセージ投稿画面に「電話番号・住所・ストーカー的威圧文」を自動入力 ➔ 投函ボタン ➔ AI（Gemini & 正規表現）がミリ秒で検知し、一般公開させず隔離（`ai_flagged = 1`）する様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「危険な投稿や個人情報の無断晒しは、一般の目に触れる前にAIが自動で隔離・証拠保全します」
                </div>
              </div>

              {/* Scenario 4 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-indigo-900 px-2 py-0.5 rounded bg-indigo-100">
                    💬 Demo 4 (法令適法の要)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">セキュア・ブリッジ完結</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  アプリ内チャット（密室DM）完全非搭載・連絡先引き渡し実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> クイズ正解・認証後の「連絡先安全開示画面」へ自動遷移 ➔ アプリ内にメッセージ送受信機能はなく、連絡先の引き渡し完了をもってシステムが終了する画面をハイライト。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「アプリ内に密室チャットが存在しないため、出会い系サイト規制法の対象外であり、密室トラブルの余地がゼロです」
                </div>
              </div>

              {/* Scenario 5 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-teal-900 px-2 py-0.5 rounded bg-teal-100">
                    🪪 Demo 5
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">厳格な身元確認</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  公的eKYC（身分証審査）＆電子的利用宣誓同意フロー実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> メッセージ開封時の公的eKYCモーダル ➔ 運転免許証提出 ➔ 「犯罪・ストーキングに利用しない」電子的利用宣誓の同意チェックが進行する様子を解説。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「日本の法令に準拠した厳格な身元確認と電子的宣誓により、匿名や捨てアカウントでの悪用を完全に防ぎます」
                </div>
              </div>

              {/* Scenario 6 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-purple-900 px-2 py-0.5 rounded bg-purple-100">
                    🔒 Demo 6
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">データ漏洩防止</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  身分証画像・カード情報を「持たない」セキュアDB構造実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 管理画面のログ・DB構造へ移動 ➔ 免許証画像やクレジットカード番号が運営サーバーに一切存在せず、認証ステータスのみを安全保持している構造をハイライト。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「機微な生データは保持しないため、万が一の外部攻撃時も個人情報漏洩が原理的に起きません」
                </div>
              </div>

              {/* Scenario 7 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-red-900 px-2 py-0.5 rounded bg-red-100">
                    🚩 Demo 7
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">自浄作用・迅速対応</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  ワンクリック通報・削除要請 ＆ 管理者即時物理削除実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> ボトル画面の「🚨 通報・削除要請」ボタン ➔ 管理者ダッシュボードへ移動 ➔ 管理者がワンクリックで即座に非公開・完全物理削除する様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「本人からの削除要請や通報に対し、管理者が即座に非公開・完全削除できる自浄体制を完備しています」
                </div>
              </div>

              {/* Scenario 8 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-slate-900 px-2 py-0.5 rounded bg-slate-200">
                    🚔 Demo 8 (捜査協力の決定打)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">刑事訴訟法197条照会</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  警察照会データ（照会回答書PDF・全通信ログCSV）ワンクリック出力実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 警察照会タブへ移動 ➔ 容疑者IDを選択 ➔ 「📄 捜査関係事項照会 回答書（PDF）」と「📊 全アクセス・通信ログ（CSV）」が1秒で一括生成される様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「貴署より照会書を受領した際、1秒で犯人特定に必要な全証拠ログを公的書面として即座にお渡しできます」
                </div>
              </div>
            </div>
          </div>

          {/* セクション 2: 🛡️ ReMEETs 治安＆プライバシー防衛 9大システム一覧 */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                    <ShieldCheck size={20} />
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    🛡️ ReMEETs 治安＆プライバシー防衛 全9大システム体系
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-serif">
                  日本の各種法令（出会い系規制法、ストーカー規制法、個人情報保護法、刑訴法）に100%適合する防衛構造です。
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-serif">
                    <th className="p-3 font-bold w-12 text-center">#</th>
                    <th className="p-3 font-bold w-48">セキュリティ防衛項目</th>
                    <th className="p-3 font-bold w-48">警察・行政の関心・懸念</th>
                    <th className="p-3 font-bold">ReMEETsの防衛システム＆実証内容</th>
                    <th className="p-3 font-bold w-24 text-center">適合法令</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">1</td>
                    <td className="p-3 font-bold text-slate-900">
                      💬 アプリ内チャット非搭載<br />
                      <span className="text-[10px] text-blue-800 font-normal">（セキュア・ブリッジ完結）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      アプリ内で密室チャットが行われ、恐喝や犯罪の温床にならないか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      アプリ内にメッセージ機能やチャットは<strong>一切存在しない（完全非搭載）</strong>。クイズ照合と本人確認完了後、相手へ連絡先を安全に引き渡した時点でシステムの役割が完了。密室トラブルの余地がゼロ。
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 text-[10px] bg-emerald-50">
                      出会い系規制法<br />完全非該当
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">2</td>
                    <td className="p-3 font-bold text-slate-900">
                      👁️ 二重情報マスキング<br />
                      <span className="text-[10px] text-slate-500 font-normal">（オープン vs 開封後）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      ネット上に実名、住所、機微な想い出が晒されてしまわないか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      <strong>一般公開時（オープン）</strong>はイニシャル、年代、都道府県、抽象的要約のみ表示。フルネーム・詳細住所・本文は完全マスキング。クイズ正解＆eKYC完了者のみに限定開示。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      個人情報保護法<br />完全適合
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">3</td>
                    <td className="p-3 font-bold text-slate-900">
                      ⚖️ 想い出クイズ完全一致<br />
                      <span className="text-[10px] text-slate-500 font-normal">（無差別出会い遮断）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      不特定多数の異性が無差別に閲覧・返信できる出会い系ではないか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      2人しか知り得ない共通の記憶（クイズ）に完全一致しない限りメッセージの開封・接触は不可。連続失敗時のレートリミット遮断により、総当たりアタックも完全防御。
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 text-[10px] bg-emerald-50">
                      異性紹介事業<br />対象外
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">4</td>
                    <td className="p-3 font-bold text-slate-900">
                      🤖 AI自律リアルタイム検閲<br />
                      <span className="text-[10px] text-slate-500 font-normal">（Gemini & 高度正規表現）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      ストーカー目的の執着文や、電話番号・住所の無断晒しは防げるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      Google Gemini AIと正規表現のハイブリッド検閲により、電話番号、住所、口座番号、SNS ID、威圧・執着表現を投稿時にミリ秒検知。一般公開させず隔離（`ai_flagged = 1`）保全。
                    </td>
                    <td className="p-3 text-center font-bold text-rose-800 text-[10px] bg-rose-50">
                      ストーカー規制法<br />事前防衛
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">5</td>
                    <td className="p-3 font-bold text-slate-900">
                      🚩 ワンクリック通報・削除<br />
                      <span className="text-[10px] text-slate-500 font-normal">（自浄作用体制）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      「自分の名前が出ている」「消してほしい」等の申告に即応できるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      全ボトルに「🚨 通報・削除要請」ボタンを常時設置。申告を受領後、管理者ダッシュボードからワンクリックで即時非公開化・完全物理削除が可能。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      プロバイダ責任法<br />即応適合
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">6</td>
                    <td className="p-3 font-bold text-slate-900">
                      🔒 個人情報「非保持」設計<br />
                      <span className="text-[10px] text-slate-500 font-normal">（データ漏洩ゼロ化）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      サーバー攻撃や内部不正による身分証・カード情報の流出リスクは？
                    </td>
                    <td className="p-3 leading-relaxed">
                      身分証画像は運営サーバーに一切保存せずeKYCベンダーのセキュア領域のみで保持。カード情報はStripeトークン決済により非保持化。退会時はSNS認可データを完全物理削除。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      安全管理措置<br />最高水準
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">7</td>
                    <td className="p-3 font-bold text-slate-900">
                      🪪 公的eKYC ＆ 電子宣誓<br />
                      <span className="text-[10px] text-slate-500 font-normal">（身元保証と法的同意）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      匿名アカウントによるなりすましや犯罪利用を防げるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      メッセージ開封時は「犯罪・ストーカーに利用しない」電子的利用宣誓への法的同意を義務付け。さらに身元信頼性を高めたいユーザー向けに公的身分証（運転免許証等）による公的eKYC審査（任意オプション600円）を提供。
                    </td>
                    <td className="p-3 text-center font-bold text-blue-800 text-[10px] bg-blue-50">
                      犯収法・携帯法<br />準拠
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">8</td>
                    <td className="p-3 font-bold text-slate-900">
                      💳 有料決済（Stripe）<br />
                      <span className="text-[10px] text-slate-500 font-normal">（多重参入・サクラ抑止）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      捨てアカウントによる嫌がらせやサクラ投稿を抑止できるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      メッセージ開封手数料（600円）およびeKYC審査手数料（600円）の適正な経済的障壁を設置。カード名義と本人確認の照合により、悪質利用者の多重参入を排除。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      特商法<br />完全表記
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">9</td>
                    <td className="p-3 font-bold text-slate-900">
                      🚔 警察捜査即時協力体制<br />
                      <span className="text-[10px] text-slate-500 font-normal">（令状即応システム）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      事件発生時、警察は即座に容疑者を特定・立件できるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      刑事訴訟法第197条第2項に基づく捜査関係事項照会に対し、接続IP、SNS UID、SMS電話番号、本人確認情報、AI隔離証拠文を<strong>ワンクリックで公的捜査用CSV/PDF回答書として即時出力</strong>。
                    </td>
                    <td className="p-3 text-center font-bold text-indigo-800 text-[10px] bg-indigo-50">
                      刑事訴訟法<br />第197条即応
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* セクション 3: 📄 手元に配る「紙の提出資料 4大セット」 */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                    <Printer size={20} />
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    📄 警察相談当日に持参・配布する「紙の資料 4大セット」
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-serif">
                  生活安全課長や法務係・公安委員会が署内でそのまま回覧・決裁できる公的文書セットです。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-indigo-950 flex items-center gap-1.5">
                    <Scale size={16} className="text-indigo-700" />
                    1. ⚖️ 異性紹介事業 非該当性 法的説明書
                  </span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded">弁護士監修書式</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  出会い系サイト規制法第2条各号の条文対比と、「クイズ完全一致」「チャット非搭載」「既知の知人限定」により法律の対象外である旨を論理明記した公式書面。
                </p>
              </div>

              <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-teal-950 flex items-center gap-1.5">
                    <FileCheck size={16} className="text-teal-700" />
                    2. 📄 捜査関係事項照会 回答書（実物サンプル）
                  </span>
                  <span className="text-[10px] bg-teal-200 text-teal-900 font-bold px-2 py-0.5 rounded">捜査班向け見本</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  刑事訴訟法第197条第2項に基づく照会書への公式回答様式。容疑者氏名、SMS番号、SNS UID、接続IP、AI隔離証拠文が印字された実際の出力サンプル。
                </p>
              </div>

              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-blue-950 flex items-center gap-1.5">
                    <Layers size={16} className="text-blue-700" />
                    3. 🛡️ セキュリティ・プライバシー保護設計概要図（A4サマリー）
                  </span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">全体図解シート</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  システムの全体像（入口：AI検閲 ➔ 照合：クイズ ➔ 出口：チャットなし連絡先引き渡し）と、個人情報非保持アーキテクチャを一目で理解できるA4要約シート。
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-slate-900 flex items-center gap-1.5">
                    <FileText size={16} className="text-slate-700" />
                    4. 📝 利用規約・プライバシーポリシー・投稿ガイドライン抜粋
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">利用約款文書</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  ストーカー禁止条項、晒し行為禁止条項、警察捜査照会時のデータ開示承諾条項など、ユーザーが登録時に同意している適法約款の抜粋文書。
                </p>
              </div>
            </div>
          </div>
        </div>
  );
};
