import React from "react";
import {
  FileText, Printer, Download, CheckCircle2, ShieldCheck, Lock,
  Sparkles, AlertCircle, Building, Award, Heart
} from "lucide-react";

export const PoliceA4SummaryView = (props: any) => {
  const { handlePrintSummary, handleExportPdf } = props;

  return (
        <div 
          id="police-print-document" 
          className="bg-white p-8 md:p-14 rounded-3xl border border-brand-border shadow-md max-w-5xl mx-auto font-sans text-slate-800 space-y-10"
        >
          {/* ヘッダー情報 */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase block mb-1">
                  【事前相談・法令適合説明資料】
                </span>
                <h1 className="text-2xl md:text-3xl font-serif font-black text-slate-900 leading-tight">
                  Webシステム「ReMEETs」事業概要および防犯安全体制について
                </h1>
              </div>
              <div className="text-right text-xs space-y-1 text-slate-600 shrink-0 font-medium">
                <div><strong>提出先:</strong> {policeStationName}</div>
                <div><strong>提出日:</strong> {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div><strong>事業者:</strong> {operatorName}（{contactInfo}）</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
              <div><strong>システム名称:</strong> ReMEETs（リミーツ）〜再会のボトルメール〜</div>
              <div><strong>システムURL:</strong> https://remeets.jp （実機デモ環境完備）</div>
            </div>
          </div>

          {/* 1. サービスの趣旨と事業目的 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="w-2 h-5 bg-brand-primary rounded-xs"></span>
              1. サービスの趣旨と事業目的
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              本サービスは、昭和・平成期に連絡先が途絶えてしまった<strong>「昔の同窓生、恩師、旧友、初恋の人など、特定の想い出の相手」</strong>をピンポイントで探し、安全に再会・感謝を伝えるための「想い出照合＆セキュア・ブリッジ（連絡先安全引き渡し）メッセージシステム」です。
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
              💡 <strong>基本理念:</strong> 不特定多数との無差別な交際を斡スクするものではなく、過去の実在の知人同士が「共通の記憶」を通じてのみ再会できる静謐で安全なプラットフォームを提供します。
            </div>
          </section>

          {/* 2. 差出人と受取人の利用フロー ＆ 情報開示の仕組み */}
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="w-2 h-5 bg-brand-primary rounded-xs"></span>
              2. 「差出人」と「受取人」の利用フロー ＆ 情報開示の仕組み
            </h2>
            <p className="text-xs text-slate-600">
              一般のインターネット上に公開される情報と、クイズ正解者（受取人本人）だけに限定開示される情報の境界を厳格に分離しています。
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-bold">
                    <th className="p-2.5 w-1/4">区分</th>
                    <th className="p-2.5 w-1/3">開示される情報項目</th>
                    <th className="p-2.5 w-1/4">閲覧できる対象者</th>
                    <th className="p-2.5">安全保護の目的</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">🌐 ネット一般公開情報</td>
                    <td className="p-2.5">・都道府県・年代<br />・出会ったシチュエーション<br />・差出人のニックネーム<br />・想い出の概要</td>
                    <td className="p-2.5 font-bold text-slate-800">誰でも閲覧可能</td>
                    <td className="p-2.5 text-[11px]">個人を特定できる機微情報（実名・住所・手紙本文）は非公開。晒し・特定を100%防止。</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-blue-50/30">
                    <td className="p-2.5 font-bold text-blue-900">🔐 受取人限定開示情報</td>
                    <td className="p-2.5">・手紙の全文（詳細）<br />・差出人の連絡先（LINE ID / メアド等）</td>
                    <td className="p-2.5 font-bold text-blue-900">クイズ正解＆同意決済を通過した受取人のみ</td>
                    <td className="p-2.5 text-[11px]">記憶が一致した実在の本人にのみ安全に手紙と連絡先を引き渡し。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. 出会い系サイト規制法への非該当性 */}
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="w-2 h-5 bg-brand-primary rounded-xs"></span>
              3. 「インターネット異性紹介事業（出会い系サイト規制法）」への非該当性
            </h2>
            <p className="text-xs text-slate-600">
              本システムは、出会い系サイト規制法（第2条第2号）に規定される「インターネット異性紹介事業」の要件を満たさず、<strong>【法令の対象外（完全非該当）】</strong>となるよう設計されています。
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-bold">
                    <th className="p-2.5 w-1/4">該当要件の判断基準</th>
                    <th className="p-2.5 w-1/3">一般的な出会い系アプリ</th>
                    <th className="p-2.5 w-1/3">本システム（ReMEETs）の仕様</th>
                    <th className="p-2.5 text-center">法令該否</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold">① 相手の特定性</td>
                    <td className="p-2.5 text-slate-500">不特定多数の異性を検索</td>
                    <td className="p-2.5 font-bold text-slate-900">過去の特定の知人のみ（1対1想い出照合）</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">❌ 非該当</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold">② 異性交際の斡旋</td>
                    <td className="p-2.5 text-slate-500">新規の恋愛・交際目的</td>
                    <td className="p-2.5 font-bold text-slate-900">旧友・恩師・同窓生等の健全な再会・感謝伝達</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">❌ 非該当</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold">③ アプリ内チャット</td>
                    <td className="p-2.5 text-slate-500">サイト内で継続送受信</td>
                    <td className="p-2.5 font-bold text-slate-900">チャット機能なし（照合時に連絡先開示で完結）</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">❌ 非該当</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold">④ プロフィール公開</td>
                    <td className="p-2.5 text-slate-500">顔写真・年齢等のカタログ</td>
                    <td className="p-2.5 font-bold text-slate-900">顔写真・実名・現在地等は一切非公開</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">❌ 非該当</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. システムに実装された強固な身元保証＆防犯安全システム */}
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="w-2 h-5 bg-brand-primary rounded-xs"></span>
              4. システムに実装された「強固な身元保証 ＆ 防犯安全システム」
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>📧</span> メアド6桁認証 ＆ 大手SNS公式連携
                </div>
                <p className="text-slate-600 leading-relaxed">
                  実在メールアドレスのワンタイム認証とLINE/Google公式OAuthで使い捨てアカウントや多重登録を完全抑止。
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🤖</span> AI自律リアルタイム検閲エンジン
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Gemini AIが「脅迫・暴言・ストーカー・連絡先の直接晒し」をミリ秒単位で検知し自動隔離（一般非公開）。
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🔐</span> 二段階「想い出クイズ」ゲート
                </div>
                <p className="text-slate-600 leading-relaxed">
                  当事者同士しか知り得ない2問の秘密クイズが完全一致しない限り、手紙の本文や連絡先は絶対に開封不可。
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>📜</span> 電子的利用宣誓 ＆ Stripe決済
                </div>
                <p className="text-slate-600 leading-relaxed">
                  嫌がらせ禁止宣誓とStripeカード決済による経済的抑止でいたずら回答や悪質ユーザーを物理排除。
                </p>
              </div>
            </div>
          </section>

          {/* 5. 警察・法執行機関への捜査協力・即時開示体制 */}
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="w-2 h-5 bg-brand-primary rounded-xs"></span>
              5. 警察・法執行機関への捜査協力・即時開示体制
            </h2>
            <p className="text-xs text-slate-600">
              刑事訴訟法第197条第2項に基づく捜査関係事項照会や令状を受理した際、管理画面から即時提出可能なログ体制を完備しています。
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900">🚔 照会時に即時提供可能な保全データ</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                <li><strong>SNSアカウント連携識別子:</strong> LINE内部UID、Google登録メールアドレス</li>
                <li><strong>通信・認証ログ:</strong> 接続元IPアドレス、User-Agent、アクセス日時タイムスタンプ</li>
                <li><strong>決済・本人確認ログ:</strong> Stripe決済記録、電子的利用宣誓同意レコード（※eKYC実施者の場合は公的審査結果を含む）</li>
                <li><strong>投稿証跡:</strong> 投稿メッセージ全文、AI検閲で隔離された脅迫・暴言メッセージ原本（ai_flagged = 1）</li>
                <li><strong>電子宣誓書:</strong> 同意した電子的利用宣誓の明示的同意タイムスタンプ＆IPログレコード</li>
              </ul>
            </div>
          </section>

          {/* 6. 本日のご相談・確認事項 */}
          <section className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="w-2 h-5 bg-brand-primary rounded-xs"></span>
              6. 本日のご相談・確認事項
            </h2>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 font-medium pl-1">
              <li>本システムの仕様および利用規約が、<strong>出会い系サイト規制法の対象外（届出不要）</strong>であることの事前確認</li>
              <li>将来的な捜査関係事項照会（197条照会）の受付窓口・連絡フローの確認</li>
              <li>その他、防犯・青少年保護の観点における貴署からのご指導・ご助言</li>
            </ol>
          </section>
        </div>
  );
};
