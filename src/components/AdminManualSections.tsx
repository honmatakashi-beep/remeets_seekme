import React, { useState, useEffect } from 'react';
import {
  Shield, Activity, Settings, Users, Mail, Sparkles, Bot, AlertTriangle, Trash2, Bell, UserCheck, ShieldAlert, Terminal, FileSpreadsheet, CheckSquare, Coins, ShieldCheck, CheckCircle2, KeyRound, UserPlus, Brain, BarChart3, HelpCircle, Key, RefreshCw, Layers, Download, Database, Server, Lock
} from 'lucide-react';

export const ManualGeneralSection = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-serif font-bold text-black border-b border-brand-border pb-2 flex items-center gap-2">
          <span className="text-brand-primary">1.</span>
          個人情報とプライバシーの厳格な保護
        </h3>
        <p className="text-xs text-black/75 leading-relaxed font-serif">
          当プラットフォームは、お相手の「名前」と「二人だけの思い出」を鍵とすることで、一般のメッセージボトルのような見知らぬ人への個人情報漏洩を防いでいます。
          管理者はすべてのボトル原文、監査用ログ、クイズの正誤履歴にアクセス可能ですが、以下のルールを遵守しなければなりません。
        </p>
        <ul className="text-[11px] text-black/60 space-y-2 font-sans list-disc list-inside">
          <li><strong>私的目的の検索・覗き見禁止：</strong>面識のない第三者の通信内容やクイズ解答履歴を興信目的等で調べる行為は即時解雇・監査ログからの自動告発対象となります。</li>
          <li><strong>実名照合フィルターの保守：</strong>日本の常用姓名・主要SNS IDに該当する投函が検知された場合、原則として一般タイムラインには表示されません。</li>
          <li><strong>法的な開示：</strong>警察等の法執行機関から正当な捜査差押令状（または197条照会）があった場合、合意同意ログおよびIP履歴を本マニュアル「4」のガイドラインに従って提出します。</li>
        </ul>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-serif font-bold text-black border-b border-brand-border pb-2 flex items-center gap-2">
          <span className="text-brand-primary">2.</span>
          管理者の二重防御ポリシー (AI & 人力)
        </h3>
        <p className="text-xs text-black/75 leading-relaxed font-serif">
          ReMEETsのモデレーションは「高度なAI（Google Gemini 2.5 Flash）による投稿時リアルタイム文脈分析」と「管理者による目視審査・通報対応」の二重構造で成り立っています。
          AI判定によりストーカー性や個人情報過度露出が疑われたボトルメールは即座に隔離（非公開化：<code>ai_flagged = 1</code>）され、同時に管理者の通報キュー（Reports）へ自動連携されます。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <strong>⚡ 超低コスト・高精度設計：</strong>
            <p className="text-black/70">1回あたりのAI診断コストは約0.003円〜0.005円と極めて安価です。連絡先開示・開通手数料（600円）が1件発生するだけで数万回分のAI診断費用が完全にカバー・黒字相殺されます。</p>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 space-y-1">
            <strong>🔄 誤検知（False Positive）解除：</strong>
            <p className="text-black/70">健全な思い出の手紙が誤って隔離された場合、管理画面の「ボトル管理」または「通報管理」よりワンクリックで安全フラグを解除（公開化）できます。</p>
          </div>
        </div>
        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-[11px] text-amber-800 leading-relaxed font-sans">
          <strong>⚠️ ストーカー対策・二次被害の防止：</strong>
          執着性の高い文章、恨み言、脅迫などのニュアンスが含まれている場合、絶対に「承認（公開）」を行わず、通報（Reports）よりアカウントの即時凍結処理を行ってください。
        </div>
      </div>
    </div>

    <div className="p-8 bg-amber-50/80 rounded-[32px] border border-amber-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-amber-200/80 pb-4">
        <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-700">
          <Mail size={22} />
        </div>
        <div>
          <h3 className="text-base font-serif font-bold text-amber-950">
            📝 備忘録: 連絡先安全引き渡し（セキュア・ブリッジ）完結モデルの設計メモ
          </h3>
          <p className="text-xs text-amber-800/80 font-sans mt-0.5">
            アプリ内に1対1メッセージ機能を持たず、連絡先開示のみで完結させる法的・運営的メリットの整理メモ
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs font-serif text-amber-950/90 leading-relaxed">
        <div className="bg-white/80 p-5 rounded-2xl border border-amber-200/60 space-y-2">
          <h4 className="font-bold text-amber-900 font-sans text-xs flex items-center gap-1.5">
            <span>1. 設計の背景とメリット</span>
          </h4>
          <p className="text-amber-900/80 text-[11px] leading-relaxed">
            アプリ内で継続的な1対1メッセージ（チャット）機能を提供する場合、インターネット異性紹介事業への該当性懸念や電気通信事業の届出、24時間体制のメッセージモデレーション（監視・検閲）義務が発生します。<br />
            「想い出の照合 ＋ 連絡先の安全な引き渡し（ブリッジ）」に特化することで、運営上の法的・監視的負担をゼロに抑え、DB負荷やストレージコストも極限まで抑制可能です。
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-amber-900 font-sans text-xs">2. 連絡先開示・着地アイデア（3パターン比較）</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold font-sans">
                【案1】シンプルブリッジ
              </span>
              <h5 className="font-bold text-amber-950 text-xs font-sans">一方向・相互開示モデル</h5>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                照合・手数料決済後、画面に差出人の連絡先（LINE ID, メアド等）を表示し、差出人へ「開封完了」メールを通知して完了。役割が明確に完結。
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold font-sans">
                【案2】感謝の一言メッセージ
              </span>
              <h5 className="font-bold text-amber-950 text-xs font-sans">1往復限定送信モデル</h5>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                照合・決済直後、開封者が感謝のメッセージと自身の連絡先を1回だけ送信。差出人のメールへ届き、アプリ内やり取りは終了。情緒的満足度が高い。
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/80 space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold font-sans">
                【案3】デジタルレターカード
              </span>
              <h5 className="font-bold text-amber-950 text-xs font-sans">画像/PDFカード発行モデル</h5>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                照合・決済完了後、手紙本文と連絡先がデザインされた記念用デジタルレターカードを発行・ダウンロード。記念品としての所有感を提示。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-100/60 p-4 rounded-2xl border border-amber-300/60 text-[11px] text-amber-900 space-y-1">
          <strong className="font-bold font-sans block text-amber-950">💡 実装時の重要セキュリティ要件</strong>
          <p>
            ・捨てアカウントによる連絡先収集を防ぐため、連絡先表示前にStripe決済（クレジットカード認証）または電話番号認証（SMS）を必須とする。<br />
            ・差出人が投函後も自身のマイページから連絡先の変更・非公開設定をいつでも行える設計とする。
          </p>
        </div>
      </div>
    </div>

    {/* ゼロデータ保持 ＆ 二重バックアップ構造の公式備忘録 */}
    <div className="p-8 bg-slate-900 text-white rounded-[32px] border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl">
          <Database size={22} />
        </div>
        <div>
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <span>🛡️ 個人情報ゼロ保持・外部セキュア保管モデル ＆ 二重バックアップ構造 備忘録</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Webサーバー上に個人情報を極力残さず外部専門基盤とリアルタイム連携するゼロデータ保持設計とバックアップ方針
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
        <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Server size={16} />
            <span>1. データベースとWebコードの二重バックアップ構造</span>
          </div>
          <ul className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
            <li>
              <strong className="text-white">🗄️ データベースバックアップ:</strong> Cloud SQL / PostgreSQL 側で自動日次バックアップ（世代管理）および秒単位の巻き戻し（PITR）を実施。本番稼働中の安易な復元は、一般ユーザーの投函データやStripe決済ログとの不整合を防ぐため重大障害時のみに限定。
            </li>
            <li>
              <strong className="text-white">💻 Webコードバックアップ:</strong> GitHub / Cloud Build 側でGitによる全変更履歴を永久保持。バグ発生時はワンクリックで直前バージョンへロールバック可能。
            </li>
          </ul>
        </div>

        <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Lock size={16} />
            <span>2. 個人情報ゼロ保持（Zero Data Retention）モデル</span>
          </div>
          <ul className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
            <li>
              <strong className="text-white">🪪 身分証原本画像・顔写真:</strong> TRUSTDOCK等のeKYC専門サーバーへ直接送信され、Webサーバーには一切保存されません（承認結果トークンのみ保持）。
            </li>
            <li>
              <strong className="text-white">💳 クレジットカード番号:</strong> Stripe PCI-DSS Level 1 サーバーと直接通信し、Webサーバーは一切通過・保存しません。
            </li>
            <li>
              <strong className="text-white">📱 開示用連絡先:</strong> 想い出クイズ完全一致・eKYC・決済が完了した当事者2名にのみリアルタイムで復号・引き渡し（ブリッジ）。
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div className="p-8 bg-brand-dark text-white rounded-[32px] border-2 border-white/10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
          <Shield size={24} className="text-brand-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-serif text-white">管理者宣誓・コンプライアンス適合</h3>
          <p className="text-xs text-white/70 leading-relaxed max-w-3xl font-serif">
            本サービスは「インターネット異性紹介事業」に該当しない（特定人物との再開・合意に限定する）よう設計を徹底していますが、悪用防止のために「安全誓約・年齢同意ログ」が自動で保存されます。
            管理権限の使用 is すべて自己シグネチャ of 監査ログとして記録されており、不正な第三者への情報提供などは、電気通信事業法上の「通信の秘密」侵害として重い法的刑事責任が問われます。
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const ContractChecklistSection = () => {
  // 決定事項チェックリスト用のローカルステート (10大決定事項)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('remeets_contract_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('remeets_contract_checklist', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistItems = [
    {
      id: 'liability_1',
      category: 'A. 責任の所在 (Liability)',
      icon: '🪪',
      title: '本人確認の正誤に関する免責合意 (eKYC事業者取り決め)',
      desc: 'ユーザーが提出した偽造免許証等をeKYCのAI・目視審査がすり抜けて承認されてしまった場合、それに起因するトラブルについて運営会社は一切の責任を負わず、eKYCベンダー側の審査品質責任（または免責範囲）とする合意。'
    },
    {
      id: 'liability_2',
      category: 'A. 責任の所在 (Liability)',
      icon: '📱',
      title: 'SMS不達・通信障害時の返金・救済責任の明確化',
      desc: 'キャリア障害によりSMSが不達になり連絡先開示・手紙開通に失敗した場合、Stripe決済手数料を含め即座に自動返金を行うシステム連携仕様を取り決め。'
    },
    {
      id: 'liability_3',
      category: 'A. 責任の所在 (Liability)',
      icon: '💾',
      title: '機微個人情報（メールアドレス・SNS ID・身分証等）の外部暗号化保管＆オンデマンド表示',
      desc: 'メールアドレスやSNS ID、身分証画像等の機微個人情報は、当メインWebサーバー/DBに直接平文保存せず、外部セキュリティサーバー（Firebase Auth, Supabase Vault等）に完全暗号化保存。表示時にオンデマンドで取得する非保持型構造により漏洩リスクを100%回避。'
    },
    {
      id: 'liability_4',
      category: 'A. 責任の所在 (Liability)',
      icon: '🚔',
      title: 'ストーキング・刑事事件発生時におけるデータ提供ポリシー',
      desc: '警察公安からの捜査関係事項照会書を受領した際、SMS携帯番号やeKYC情報を即座に開示する旨を利用規約・プライバシーポリシーに明示。'
    },
    {
      id: 'liability_5',
      category: 'A. 責任の所在 (Liability)',
      icon: '🛡️',
      title: 'AI安全フィルター誤検知による機会損失免責',
      desc: 'AI自動検閲エンジンによる思い出メッセージの誤検知・誤隔離が発生した場合の機会損失や精神的苦痛について、運営側は損害賠償から免責される条項を完備。'
    },
    {
      id: 'contract_1',
      category: 'B. 事業者契約仕様 (Specifications)',
      icon: '💳',
      title: 'eKYC審査「不合格時」の従量課金コスト負担ルール',
      desc: '不鮮明な身分証等により審査が不合格となった場合でも発生する1回200円のベンダー従量費をカバーするため、決済時のデポジット認証やアクセス制限。'
    },
    {
      id: 'contract_2',
      category: 'B. 事業者契約仕様 (Specifications)',
      icon: '🔄',
      title: 'SMS送信リトライ制限といたずら送信防止 (Rate Limit)',
      desc: 'SMS送信API（Twilio等）の乱用による課金被害を防ぐため、1電話番号あたり1日最大3回のリトライ制限をシステムに組み込む。'
    },
    {
      id: 'contract_3',
      category: 'B. 事業者契約仕様 (Specifications)',
      icon: '📬',
      title: 'LINE公式アカウントメッセージ追加課金対策',
      desc: 'マッチング時のLINEプッシュ通知費用（超過分1通1.1円〜）を抑えるため、アプリ内通知や無料のLINE Notify、メールを優先する仕様を決定。'
    },
    {
      id: 'contract_4',
      category: 'B. 事業者契約仕様 (Specifications)',
      icon: '📂',
      title: 'ユーザー退会時における「認可連携データ」完全物理削除ポリシー',
      desc: '退会時にLINE内部UID、Googleメール、およびeKYC事業者側の身分証ログを物理的に全消去するAPI連携仕様を取り決め。'
    },
    {
      id: 'contract_5',
      category: 'B. 事業者契約仕様 (Specifications)',
      icon: '🏦',
      title: 'Stripe振込・返金手数料の原価計算合意',
      desc: 'ユーザー都合の返金が発生した場合、Stripe手数料（3.6%）は返金されず運営損失となるため、規約に「返金ポリシー」および「手数料控除ルール」を整備。'
    }
  ];

  const checkedCount = checklistItems.filter(item => checkedItems[item.id]).length;
  const progressPercent = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div className="glass-card p-6 space-y-4 md:col-span-2 border border-rose-300 bg-rose-50/5 text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600">
            <CheckSquare size={20} className="text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
              <span>⑫ 【法務・契約合意】責任の所在および事業者契約決定事項チェックリスト</span>
            </h3>
            <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
              公安適法性、eKYCベンダー、SMS通信事業者との契約・運営開始時に合意すべき必須決定項目です。
            </p>
          </div>
        </div>

        {/* 進捗インジケータ */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-neutral-150 shadow-sm shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold text-neutral-400 block font-sans">合意進捗率</span>
            <span className="text-xs font-bold text-neutral-800 font-mono">{checkedCount} / {checklistItems.length} 項目</span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f3f4f6" strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f43f5e" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercent / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono text-rose-600">{progressPercent}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* A. 責任の所在 */}
          <div className="space-y-3">
            <span className="font-serif font-bold text-xs text-rose-700 flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
              <span>🛡️</span>
              <span>A. 責任の所在 (Liability Breakdown)</span>
            </span>
            <div className="space-y-2">
              {checklistItems.filter(item => item.id.startsWith('liability_')).map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none text-left ${
                    checkedItems[item.id]
                      ? 'bg-rose-50/30 border-rose-200 shadow-sm'
                      : 'bg-white border-neutral-150 hover:bg-neutral-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                    checkedItems[item.id]
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-neutral-300 bg-white'
                  }`}>
                    {checkedItems[item.id] && <span className="text-[10px]">✓</span>}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{item.icon}</span>
                      <span className={`text-xs font-bold ${checkedItems[item.id] ? 'text-rose-900 line-through' : 'text-neutral-800'}`}>
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. 事業者契約仕様 */}
          <div className="space-y-3">
            <span className="font-serif font-bold text-xs text-rose-700 flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
              <span>⚙️</span>
              <span>B. 事業者契約仕様 (Specifications)</span>
            </span>
            <div className="space-y-2">
              {checklistItems.filter(item => item.id.startsWith('contract_')).map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none text-left ${
                    checkedItems[item.id]
                      ? 'bg-rose-50/30 border-rose-200 shadow-sm'
                      : 'bg-white border-neutral-150 hover:bg-neutral-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                    checkedItems[item.id]
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-neutral-300 bg-white'
                  }`}>
                    {checkedItems[item.id] && <span className="text-[10px]">✓</span>}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{item.icon}</span>
                      <span className={`text-xs font-bold ${checkedItems[item.id] ? 'text-rose-900 line-through' : 'text-neutral-800'}`}>
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ManualMainSection = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* stats */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Activity size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ① 概要タブ (Stats)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              サービス全体の成長度、ユーザー定着率、再会成功率などのKPIを一目で監視し、経営判断や引き継ぎ監査に活用します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>リアルタイム数値：</strong>登録数、ボトル数、本日の投函数を動的表示。</li>
              <li><strong>地域分布：</strong>日本地図ヒートマップで「出身地」データの濃淡をマッピング。</li>
              <li><strong>ユーザー定着・ファネル：</strong>「登録→投函→開通クイズ→解決」のコンバージョン分析。</li>
              <li><strong>M&A事業査定CSVレポート出力：</strong>外部投資家や譲受企業にサービス無形資産価値（ボトルメール数、再会成功数）をエビデンスとともに証明するCSVデータを自動生成。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* quizAnalytics */}
      <div className="glass-card p-6 space-y-4 border-2 border-brand-primary/20 bg-brand-primary/[0.02]">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-black">
              ② 思い出ボトル・クイズ分析タブ (Quiz Analytics)
            </h3>
            <span className="text-[10px] text-brand-primary font-medium font-sans">重要コア機能・照合品質監査</span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              「秘密の質問（思い出クイズ）」の照合精度、正答率、難易度別分布、および総当たり攻撃（ブルートフォース）の防御状況を多角的に分析し、ユーザーの再会体験を最大化します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・4大サブビュー操作手順</span>
            <ul className="text-[11px] text-black/60 space-y-1.5 font-sans list-disc list-inside">
              <li><strong>1. 全体サマリー &amp; 試行分布 (Overview)：</strong>累計試行回数、一発正解率（完全一致）、あいまい救済（かな/カナ/誤記補正）件数、24時間ロック発動数を一括確認。</li>
              <li><strong>2. カテゴリ &amp; 時代別分析 (Categories &amp; Eras)：</strong>「同級生」「昔の恋人」「幼馴染」等のカテゴリ別、および「昭和・平成・2000年代」等の時代別マッチング成立率を可視化。</li>
              <li><strong>3. 質問設定数・難易度分析 (Question Complexity)：</strong>質問数（1問 vs 2問 vs 3問以上）ごとの照合成立率と離脱率の比較。適切な設問バランスを把握。</li>
              <li><strong>4. 14日間トレンド推移 (14-Day Trend)：</strong>直近2週間の正解試行・不正解試行・新規ボトル投函数のデイリー動向をエリアチャートで時系列分析。</li>
              <li><strong>CSVデータエクスポート：</strong>「CSV形式で出力」ボタンより、全指標・分布データをまとめた公式監査用レポートを即座にダウンロード可能。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Settings size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ③ サイト設定タブ (Settings)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              立ち上げ初期やリニューアル期など、登録者・投函数がまだ十分でない場合に、ホームページ上の実績値を切り替えて信頼性を保護します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>統計カード表示トグル：</strong>HOME上の「累計登録者、本日投函」などを即座に非表示/表示の連動が可能です。</li>
              <li><strong>トグルキャッシュレス更新：</strong>設定はワンクリックでデータベースを更新、ログインしている全ユーザーに瞬時反映されます。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* users */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Users size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ④ ユーザー管理タブ (Users)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              登録ユーザーの公的本人確認（eKYC）状況の監視、生体照合スコア・書類別監査、悪質な荒らしや個人情報晒しアカウントの永久凍結・解除を一元管理します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>ユーザー検索・一覧：</strong>ニックネーム、メールアドレス、会員ステータス（一般/管理/凍結）、および <code>🛡️ eKYC済</code> バッジの確認。</li>
              <li><strong>個人カード（ユーザー詳細）監査：</strong>ユーザー名クリックで開く個人カード内にて、「公的本人確認 (eKYC)」の承認ステータス、提出書類種別（運転免許証／マイナンバーカード／パスポート）、照合確認氏名、生体顔照合スコア（99.4%等）、OCR文字一致率、暗号化監査トークン（例: <code>EKYC-2026-xxxx-PASSED</code>）を精密監査可能。</li>
              <li><strong>未申請リセット操作：</strong>開発・テストや再審査が必要な場合に、個人カード内の「未申請に戻す」ボタン（1行表示）からワンクリックで即座に未認証状態へロールバック可能。</li>
              <li><strong>アカウント凍結 / 凍結解除：</strong>違反が発覚したアカウントを1クリックで無効化。ログインや投稿、クイズ回答等の全操作を閉鎖します。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* posts */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Mail size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ⑤ ボトル（漂流レター）管理タブ (Posts)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              漂流中または解決済みのすべてのボトルメッセージを監視・検索し、不適切な記述や晒し行為を水際で管理・削除します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>全ボトル検索：</strong>送信者名、お相手の名前、本文のキーワード部分一致による高速絞り込み。</li>
              <li><strong>ボトルの詳細監査：</strong>「二人だけの思い出クイズ」の問いと答え（正解ハッシュではなく原文）の組み合わせに不適切な個人情報が含まれていないかチェック。</li>
              <li><strong>安全なアーカイブ（削除）：</strong>削除時、削除理由（手動、重複、公序良俗等）を入力の上で安全にシステム隔離（シャドウ非公開化）。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* successStories */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Sparkles size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ⑥ 幸せな再会の物語タブ (Success Stories)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              実際に再会を果たしたユーザーの感動エピソードを掲載・管理し、サイトの信頼性と情緒的価値を高めます。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>ストーリー新規作成・編集：</strong>タイトル、年代、お相手との関係性、本文、掲載ステータス（公開/下書き）の設定。</li>
              <li><strong>プライバシー保護：</strong>実名や特定可能な地名が含まれていないか確認の上でワンクリック公開。</li>
              <li><strong>ユーザー共感の可視化：</strong>いいね数や閲覧数の推移を一覧で管理。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ManualModerationSection = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* AI検知キュー (moderation) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Bot size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ① AI検知キュータブ (Moderation Queue)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              Gemini AI安全フィルターが投函された手紙を意味解析し、執着、恨み言、売春募集、自殺予告等に類似していると判別したボトルを隔離・査定する場所です。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>AI判定フラグ：</strong><code>ai_flagged === 1</code> の不適切候補ボトルのみを瞬時に抽出して一覧化。</li>
              <li><strong>AI詳細判定ログの閲覧：</strong>なぜ有害・不適切と判断したのか、Geminiが出した推論コンテキストとスコアを表示。</li>
              <li><strong>一発措置：</strong>「この手紙を一般公開へ承認」または「ただちに物理削除（アーカイブ監査化）」を実行。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 通報 (reports) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ② 通報タブ (Reports)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              「被害者本人」やタイムラインの他ユーザー、またはシステム自動警告エンジンが検出した違反起票を優先的にスピード処理するための救急対策室です。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>未処理通報のカウントバッジ：</strong>緊急で処理が必要な数がサイドバーに赤バッジで表示されます。</li>
              <li><strong>通報元と対象の把握：</strong>通報された理由、対象となる手紙、通報者IDの精査。</li>
              <li><strong>1クリック強制遮断：</strong>確認後即座に「アカウント凍結（相手は完全ログイン不可化）」または「通報を誤認識としてクローズ」する操作が連動可能です。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 削除依頼 (deletion) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Trash2 size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ③ 削除要請・法的フォームタブ (Deletion Requests)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              「他人に勝手に名前入りの手紙を流されて検索エンジンのサジェストに載ってしまっている」「過去の思い出だが消してほしい」という当事者の法的削除要請に対応します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>削除希望フォーム取り込み：</strong>要請された人の連絡先、消したいボトルのID、および法的理由を一覧表示。</li>
              <li><strong>該当ボトルの即時ワンクリック抹消：</strong>「削除処理を実行する」ボタンにより瞬時に日本中のブラウザ上およびDBから物理消滅させ、要請ステータスを解決（Completed）に変更。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* NGワード (ngWords) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Shield size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ④ NGワード管理タブ (NG Words)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              いたちごっこになりやすい公序良俗違反ワード、売春隠語、ストーカー、各種SNSのアカウントID（晒し防止）を水際でブロックするためのブラックリスト単語キャッシュです。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>NGワードのリアルタイム登録：</strong>システム起動時や再デプロイを介さず、登録した単語が瞬時に投函チェックバリデーションエンジンへ反映。</li>
              <li><strong>NGワード一覧・除外：</strong>誤って日常語などが登録されてしまった場合、即座にブロックリストから解除可能。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* リアルタイム緊急警報・スパム監視 (Live Alerts) */}
      <div className="glass-card p-6 space-y-4 border border-rose-200 bg-rose-50/20">
        <div className="flex items-center gap-3 border-b border-rose-200 pb-3">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
            <ShieldAlert size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-neutral-900">
            ⑤ 運営リアルタイム警報＆スパム監視 (Live Alerts & Sound Notifications)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 block font-sans">この項目の目的</span>
            <p className="text-xs text-neutral-800 font-serif leading-relaxed">
              ユーザーからの緊急通報（ストーキング・脅迫・個人情報晒し）や、悪意あるボット・荒らしによる同一IPからの大量連続投稿スパムを秒単位で即座に検知し、Web Audio APIによる警報サウンドとHTML5デスクトップ通知で運営者に警告します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-neutral-700 space-y-1 font-sans list-disc list-inside">
              <li><strong>サウンド＆デスクトップ通知：</strong>管理画面を別タブで開いていても、緊急通報受信時に二重パルス警報音、連投スパム時にトリプルビープ音を再生し、画面右下に通知をポップアップ。</li>
              <li><strong>音量調整＆テスト発火：</strong>スピーカー音量（10%〜100%）調整、ミュート切替、および本番前の「通報シミュレーション」「スパムシミュレーション」ボタンを完備。</li>
              <li><strong>クイック対応ジャンプ：</strong>アラートカードをクリックするだけで、該当の通報詳細やボトル管理画面へダイレクトに遷移し即座に対処可能。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ManualSystemSection = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* お問い合わせ (contacts) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Mail size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ① お問い合わせタブ (Contacts)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              ユーザーや提携パートナー、または警察等から「お問い合わせフォーム」経由で寄せられたメッセージを整理、法務回答をする窓口。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>問い合わせ一覧：</strong>送信者メールアドレス、件名、種別（システムエラー/捜査照会等）の監視。</li>
              <li><strong>ステータス追跡：</strong>「未回答 (Pending) ➔ 回答済 (Replied)」の変更。</li>
              <li><strong>✨ AI返信下書き作成：</strong>お問い合わせメッセージ枠の「AI返信下書きを作成」ボタンより、Gemini AIがユーザーの問い合わせ内容と指定トーン（標準丁寧・仕様案内・お詫び調査・感謝共感・要点簡潔）に応じた最適な公式返信メール案を自動生成。管理者は微調整して即座に送信可能。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* お知らせ一括配信 (announcements) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Bell size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ② お知らせ一括配信タブ (Announcements)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              利用規約の大幅変更（特にSNS連携ポリシーなど）、警察庁ガイドライン適用の周知、重大メンテナンス情報を全ユーザーのHOME画面に安全にポップアップ通知します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>即時ブロードキャスト：</strong>タイトル、リッチ本文（Markdown対応）を入力して送信すると、全稼働アカウントのタイムラインに固定バナーとして即時掲載。</li>
              <li><strong>通知アーカイブ：</strong>過去に配信したすべてのお知らせを管理・削除可能。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 同意ログ (consentLogs) */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <UserCheck size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ③ 会員安全誓約・年齢同意ログタブ (Consent Logs)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              日本の「インターネット異性紹介事業」規制および各種公序良俗・プライバシー保護の観点から、全ユーザーが会員登録時に「実名登録」「18歳以上（または保護者合意）」「ストーカー目的でないことの安全誓約」を承諾したという、デジタル証跡ログを保存・保全する、法務的に極めて重要な領域です。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>監査証跡：</strong>ユーザーID、登録時ニックネーム、クライアントの物理IPアドレス、ブラウザ情報、および承諾した日時を完全にタイムスタンプ。</li>
              <li><strong>LINE/Google 認可データの同意：</strong>SNSアカウントを連携した際の「プロファイルデータ・メールアドレス等の安全な転送同意」に関する履歴も連動してアーカイブ。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 削除されたボトルのアーカイブ監査 */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Trash2 size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black">
            ④ 削除済ボトル＆法的理由監査ログ (Archived Posts & Deletion Logs)
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              悪質な書き込みの証跡保全、法的フォームからの一発抹消ボトルの内部履歴、および削除を実行した管理者のお名前・削除理由を安全にアーカイブ記録します。
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>物理レコードのセキュア隔離：</strong>論理・物理削除された元の手紙の内容（メッセージ本文、思い出クイズの問いと答え）、および送信者ID内容の内部確認。</li>
              <li><strong>証跡つきアーカイブ削除：</strong>警察捜査やトラブルに備え、手紙を削除する際は、具体的な削除理由を選択・記述した監査ログをバックエンドに保存しながら処理。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* successStories */}
      <div className="glass-card p-6 space-y-4 md:col-span-2 border border-amber-200/70 bg-amber-50/20">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-700">
            <Sparkles size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
            <span>⑤ 幸せな再会の物語（奇跡の再会報告）管理タブ (Success Stories Moderation)</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-sans font-bold">ユーザー投稿連動</span>
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              ユーザーが体験談ページ（<code>/success-stories</code>）から直接投稿した「奇跡の再会報告（感謝メッセージ）」を管理者が目視・審査し、安全に公開（トップページや体験談一覧）を制御するセクションです。信頼性とサービス価値の向上に直結します。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
              <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                <li><strong>投稿一覧の審査・編集：</strong>ユーザーから寄せられたメッセージ、年代、性別、同意状況の確認および匿名化編集。</li>
                <li><strong>ワンクリック公開トグル：</strong>「公開中 / 非公開」のリアルタイム切り替え（<code>is_public</code>）。</li>
                <li><strong>おすすめ・全ページ表示フラグ：</strong>トップページ注目枠に抜擢する「おすすめ（<code>is_featured</code>）」や全ページ表示（<code>is_all_page</code>）の制御。</li>
                <li><strong>管理者新規作成＆削除：</strong>公式取材による感動ストーリーの直接登録や、不適切・ユーザー取り下げ依頼に基づく即時削除。</li>
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-bold text-black/50 block font-sans">管理者の審査・モデレーションガイドライン</span>
              <p className="text-[11px] text-black/60 leading-relaxed font-serif">
                投稿を公開する前に、お相手の実名、電話番号、詳細住所などの個人情報が含まれていないかを必ず確認してください。必要に応じて管理者がプライバシー配慮の編集（イニシャル化や地域名の丸め）を行ってから公開承認を行ってください。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* リアルタイム速報通知＆メール配信システム仕様 */}
      <div className="glass-card p-6 space-y-4 md:col-span-2 border border-sky-200/70 bg-sky-50/20">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-sky-500/10 rounded-xl text-sky-700">
            <Bell size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
            <span>⑥ リアルタイム速報通知 ＆ メール配信監視仕様 (Real-time Push & Email Dispatch)</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-sans font-bold">WebSocket + Resend</span>
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              投函された手紙に対して思い出クイズの正解者が現れた瞬間や、手紙・連絡先が開示された瞬間に、差出人・受取人の双方へ「リアルタイム画面速報通知（WebSocket）」および「確実なメール通知（Resend/SendGrid）」を自動送出するインフラ仕様です。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-black/50 block font-sans">自動トリガーイベント一覧</span>
              <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                <li><strong>クイズ正解イベント：</strong>お相手が思い出クイズに正解した際、差出人のブラウザに「あなた宛ての質問に正解者が現れました！」とリアルタイム通知。</li>
                <li><strong>連絡先・手紙開通イベント：</strong>決済・eKYC完了時に「手紙・連絡先が開示されました」の相互通知を自動配信。</li>
                <li><strong>新規メッセージ着信：</strong>開通画面内でのメッセージ送信時の即時反映。</li>
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-bold text-black/50 block font-sans">運用時の監視・エラー対応</span>
              <p className="text-[11px] text-black/60 leading-relaxed font-serif">
                万一ユーザー側がブラウザを閉じていた場合でも、登録されたメールアドレス宛にバックエンドからメール配信API（Resend）が実行され、見逃しを防止します。配信ログは技術監査ログ（<code>audit_logs</code>）にて確認可能です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ManualSecuritySection = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ① SNSアカウント連携による基盤認証 & セキュリティモニタ (本格リリース版) */}
      <div className="glass-card p-6 space-y-4 border border-blue-200/80 bg-blue-50/5">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <ShieldAlert size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center justify-between w-full">
            <span>① SNSアカウント連携による基盤認証 & セキュリティモニタ</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-sans font-normal">本格リリース版</span>
          </h3>
        </div>
        <div className="space-y-3 font-sans">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              パスワード漏洩リスクを100%排除し、LINE Login（LINEヤフー）および Google OAuth 2.0 による高度なセキュリティ基盤でアカウント認証を一元管理・保護します。
            </p>
          </div>
          
          {/* DB紐付け・技術構造解説 */}
          <div className="p-3 bg-white/90 rounded-2xl border border-blue-100 text-[11px] space-y-1.5 leading-relaxed">
            <strong className="text-blue-900 font-bold block">⚙️ 本番用 DB (users テーブル) 関連付け技術構造:</strong>
            <ul className="list-disc pl-4 text-[10.5px] text-neutral-700 space-y-1">
              <li>
                <strong>一意識別キー:</strong> DBの <code>users</code> テーブル内にて <code>sns_provider</code> ('line' | 'google')、<code>sns_uid</code> (LINE内部UID / Google sub ID) でインデックス保持され、1ユーザー＝1アカウントを厳密維持。
              </li>
              <li>
                <strong>プロファイル自動同期:</strong> 認可画面で同意を得た <code>email</code> (実在検証済みメール)、<code>full_name</code> (表示名)、<code>avatar_url</code> を一元連携し、安全にセッション生成。
              </li>
              <li>
                <strong>シークレットの安全隔離:</strong> <code>LINE_CHANNEL_SECRET</code> および <code>GOOGLE_CLIENT_SECRET</code> は Cloud Run 等の環境変数 (<code>process.env</code>) のみに保存され、フロントエンドへ漏洩しません。
              </li>
              <li>
                <strong>CSRF/State防御:</strong> OAuth認可リクエストごとに乱数 <code>state</code> トークンを発行・検証し、中間者攻撃やセッションハイジャックを完全防衛。
              </li>
            </ul>
          </div>

          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>攻撃の常時監視：</strong>ブルートフォース等の攻撃失敗ログイン、不正な思い出クイズ解答試行を高頻度で行う接続を常時モニタリング。</li>
              <li><strong>IPブロックリスト：</strong>悪質な接続元IPアドレスをワンクリックでサーバーIPブラックリストへ登録・完全に遮断。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ② 技術＆操作監査ログ & SNS認証監査対応手順 (System Audit Logs) */}
      <div className="glass-card p-6 space-y-4 border border-purple-200/80 bg-purple-50/5">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
            <Terminal size={20} />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center justify-between w-full">
            <span>② 技術＆操作監査ログ & SNS認証監査手順</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-sans font-normal">ログ確認マニュアル</span>
          </h3>
        </div>
        <div className="space-y-3 font-sans">
          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
            <p className="text-xs text-black/80 font-serif leading-relaxed">
              管理者自身の操作および <code>/api/auth/sns/*</code> で発生する全SNS認証イベントを改ざん不可能な時系列ログとして自動保全し、不正アクセスを検知します。
            </p>
          </div>

          {/* SNS監査イベントコード一覧 */}
          <div className="p-3 bg-white/90 rounded-2xl border border-purple-100 text-[11px] space-y-1.5 leading-relaxed">
            <strong className="text-purple-900 font-bold block">🔍 記録される主要SNS監査イベントコード (action_logs / access_logs):</strong>
            <div className="grid grid-cols-1 gap-1 text-[10px] text-neutral-700">
              <div><code className="bg-purple-100 text-purple-900 px-1 py-0.5 rounded font-bold">AUTH_SNS_SIGNUP</code> : SNS経由新規会員登録（認可プロファイル取得・同意完了）</div>
              <div><code className="bg-purple-100 text-purple-900 px-1 py-0.5 rounded font-bold">AUTH_SNS_LOGIN</code> : SNS既存アカウント認証ログイン成功</div>
              <div><code className="bg-purple-100 text-purple-900 px-1 py-0.5 rounded font-bold">AUTH_SNS_LINK_FAIL</code> : CSRF State不一致・不正トークン・連携失敗エラー</div>
              <div><code className="bg-purple-100 text-purple-900 px-1 py-0.5 rounded font-bold">AUTH_SNS_UNLINK</code> : ユーザーによるSNS連携解除・プロファイルパージ実行</div>
            </div>
          </div>

          {/* 管理者向け確認手順 */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[10.5px] text-amber-950 space-y-1">
            <strong className="font-bold text-amber-900 block">📋 管理者によるSNS監査ログ確認手順:</strong>
            <ol className="list-decimal pl-4 space-y-0.5 text-amber-900/90">
              <li>ダッシュボード上部「セキュリティ」→「技術＆操作監査ログ (action_logs)」を開く。</li>
              <li>検索窓/フィルターに <code>AUTH_SNS_</code> または <code>/api/auth/sns</code> を指定。</li>
              <li>タイムスタンプ、接続元IPアドレス、UserAgent、ステータスコードを照合。</li>
              <li><code>AUTH_SNS_LINK_FAIL</code> が短時間に多発している場合は、スパムbot攻撃とみなし対象IPを遮断。</li>
            </ol>
          </div>

          <div>
            <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
            <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
              <li><strong>管理者権限の証跡保全：</strong>ボトルの編集・削除、アカウント凍結、APIレート制限ポリシー動的調整などの操作を全履歴保全。</li>
              <li><strong>監査用データエクスポート：</strong>財務諸表・DD（デューデリジェンス）検証用の公式CSVレポートを一括出力可能。</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ③ 法執行機関照会（捜査関係事項照会）対応・緊急エクスポートデータ項目定義 */}
      <div className="glass-card p-6 space-y-4 md:col-span-2 border border-red-300 bg-red-50/5">
        <div className="flex items-center gap-3 border-b border-red-200 pb-3">
          <div className="p-2 bg-red-500/10 rounded-xl text-red-600">
            <FileSpreadsheet size={20} className="text-red-600" />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
            <span>③ 警察・法執行機関照会対応 緊急エクスポートデータ項目定義書</span>
            <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-sans font-normal">捜査照会即応</span>
          </h3>
        </div>
        <div className="space-y-4 font-sans text-xs text-left text-neutral-800">
          <p className="text-[11px] leading-relaxed text-neutral-600">
            刑事訴訟法第197条第2項に基づく「捜査関係事項照会」やストーカー規制法関連の緊急事態、差押令状等を受理した際、警察や検察等の法執行機関へ迅速に証跡資料を提供するためのデータ項目定義です。管理画面の<strong>「緊急ログ・エクスポート (法執行機関対応用)」</strong>より、対象期間（直近7日間／全期間）を切り替えて各テーブルのCSVエクスポートおよびリアルタイムプレビューをまとめて行えます。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左カラム：法執行機関から求められる主な要請内容 */}
            <div className="space-y-3 p-4 bg-white rounded-2xl border border-red-100 shadow-sm">
              <span className="font-serif font-bold text-xs text-red-700 block flex items-center gap-1.5">
                🚨 警察等の捜査機関から求められる主なデータ要請と対応
              </span>
              <div className="space-y-2.5 text-[11px] text-neutral-700 leading-relaxed">
                <div>
                  <strong className="text-neutral-900 block font-serif">1. 容疑者・被害者の特定と連絡先</strong>
                  <p className="text-[10.5px] text-neutral-500 pl-3 border-l-2 border-neutral-200 mt-0.5">
                    「登録ユーザー情報 (users)」から該当者のID、登録表示名、登録メールアドレス等を提供します。またSNS連携（LINE/Google）経由の一意の識別情報を提供し、SNS各社への逆照会を可能にします。
                  </p>
                </div>
                <div>
                  <strong className="text-neutral-900 block font-serif">2. 容疑者の物理的接点（位置・端末・時間特定）</strong>
                  <p className="text-[10.5px] text-neutral-500 pl-3 border-l-2 border-neutral-200 mt-0.5">
                    「アクセスログ (access_logs)」からログインおよびリクエスト時の物理IPアドレス、アクセス日時、UserAgent（ブラウザ・端末の種類）を抽出し、プロバイダ照会（発信者情報特定）を支援します。
                  </p>
                </div>
                <div>
                  <strong className="text-neutral-900 block font-serif">3. 犯行の動機・悪意ある接近の証拠（ストーカー・脅迫行為等）</strong>
                  <p className="text-[10.5px] text-neutral-500 pl-3 border-l-2 border-neutral-200 mt-0.5">
                    「ボトル投函履歴 (posts)」やメッセージの通報コンテキストから、どのような名前やゆかりの地を騙ってお相手を探索（エゴサーチ）しようとしていたのか、思い出クイズを突破・偽装しようとしていたのかという意図・活動を明文化します。
                  </p>
                </div>
                <div>
                  <strong className="text-neutral-900 block font-serif">4. 本人身元保証の真正性確認</strong>
                  <p className="text-[10.5px] text-neutral-500 pl-3 border-l-2 border-neutral-200 mt-0.5">
                    「年齢・本人確認証跡 (age_verification_logs)」より、eKYCの手続き状況、審査ステータス、年齢判定の真正性証拠（証明書類提出の成否等）を提供します。
                  </p>
                </div>
              </div>
            </div>

            {/* 右カラム：エクスポート/プレビューされる7テーブルのカラム定義 */}
            <div className="space-y-3 p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm">
              <span className="font-serif font-bold text-xs text-neutral-800 block flex items-center gap-1.5">
                📋 まとめてエクスポート・プレビューされるデータ項目一覧 (全7テーブル)
              </span>
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1.5 scrollbar-thin">
                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-150">
                  <strong className="text-neutral-900 text-[10.5px] block font-mono">① アクセスログ (access_logs)</strong>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    <strong>主要出力項目：</strong>ログID、ユーザー名 (Guest含む)、リクエストパス (API端点)、HTTPメソッド、ステータスコード、IPアドレス、リクエスト日時、UserAgent (ブラウザ・OS情報)<br />
                    <span className="text-[9.5px] text-red-600 font-medium">➔ 捜査上の役割：不正接続元の物理的な接続位置、時刻、端末特定</span>
                  </p>
                </div>

                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-150">
                  <strong className="text-neutral-900 text-[10.5px] block font-mono">② アクションログ (action_logs)</strong>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    <strong>主要出力項目：</strong>ログID、実行ユーザー名、アクションコード (例: AUTH_SNS_SIGNUP 等)、変更詳細コンテキスト、操作時IPアドレス、発生日時<br />
                    <span className="text-[9.5px] text-red-600 font-medium">➔ 捜査上の役割：容疑者のアカウント内でのシステム設定変更や重要アクションの時系列トラッキング</span>
                  </p>
                </div>

                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-150">
                  <strong className="text-neutral-900 text-[10.5px] block font-mono">③ 登録ユーザー情報 (users)</strong>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    <strong>主要出力項目：</strong>ユーザーID、表示ニックネーム、登録メールアドレス、管理者フラグ、アカウントブロック状態、登録日時<br />
                    <span className="text-[9.5px] text-red-600 font-medium">➔ 捜査上の役割：容疑者および被害者の基本アカウント属性、実在メールアドレスの確保</span>
                  </p>
                </div>

                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-150">
                  <strong className="text-neutral-900 text-[10.5px] block font-mono">④ 年齢・本人確認証跡 (age_verification_logs)</strong>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    <strong>主要出力項目：</strong>証跡ID、ユーザーID、提出時IPアドレス、eKYC成否判定、年齢、判定却下・承認の具体理由、提出・判定日時<br />
                    <span className="text-[9.5px] text-red-600 font-medium">➔ 捜査上の役割：公的書類・eKYC提出時の不一致判定や虚偽申請の形跡を保全</span>
                  </p>
                </div>

                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-150">
                  <strong className="text-neutral-900 text-[10.5px] block font-mono">⑤ 通報履歴 (reports)</strong>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    <strong>主要出力項目：</strong>通報ID、通報者ID (被害者等)、対象ボトル/メッセージID、通報理由、詳細な申告コンテキスト、対応ステータス、発生日時<br />
                    <span className="text-[9.5px] text-red-600 font-medium">➔ 捜査上の役割：被害発生のリアルタイム証拠、被害者が不審に感じた詳細な言動ログ</span>
                  </p>
                </div>

                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-150">
                  <strong className="text-neutral-900 text-[10.5px] block font-mono">⑥ ボトル投函履歴 (posts)</strong>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    <strong>主要出力項目：</strong>ボトルID、投稿者ID、探している人の名前、対象者の実名、ゆかりの地、学校名、年代・対象カテゴリ、ステータス、投函日時<br />
                    <span className="text-[9.5px] text-red-600 font-medium">➔ 捜査上の役割：ストーカー行為において容疑者が特定人物を探そうとして掲載した文脈や、個人情報暴露行為の直接証拠</span>
                  </p>
                </div>

                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-150">
                  <strong className="text-neutral-900 text-[10.5px] block font-mono">⑦ 不正ログイン・クイズ不正試行記録 (failed_attempts)</strong>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    <strong>主要出力項目：</strong>証拠ID、接続元IPアドレス、制限対象のアクションキー、失敗回数カウント、最終不正試行日時<br />
                    <span className="text-[9.5px] text-red-600 font-medium">➔ 捜査上の役割：他人のアカウントへのハッキング攻撃や、クイズの総当たり自動回答（ブルートフォース）攻撃による不正侵入試行の立証</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ④ 【安全検証】入力フォーム検閲・安全防衛システム検証シミュレータの使い方 */}
      <div className="glass-card p-6 md:p-8 space-y-6 md:col-span-2 border border-emerald-300 bg-gradient-to-br from-emerald-50/20 via-white to-teal-50/10 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600 border border-emerald-200/60">
              <ShieldCheck size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <span>④ 【安全検証】入力フォーム検閲・安全防衛システム検証シミュレータの完全使い方マニュアル</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                公安行政・警察サイバー課・各審査機関・運営者が、有害表現の検閲・自動非公開（隔離）・自動通報動作を安全にテスト実演するためのガイド
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-bold self-start sm:self-center shrink-0">
            50選テスト図鑑 & 模擬通報機能完備
          </span>
        </div>

        <div className="space-y-6 font-sans text-xs text-left text-neutral-800 leading-relaxed">
          {/* 配置場所案内 */}
          <div className="p-4 bg-emerald-900/5 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-xs">シミュレータの設置場所（画面へのアクセス手順）</p>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                管理者ダッシュボード上部メニューの<strong>「セキュリティ」タブ</strong>を選択し、画面中ほどにある<strong className="text-emerald-900">「安全防衛・検閲リアルタイムシミュレータ」</strong>エリアをご覧ください。実際のユーザー投稿と同じAI・正規表現検閲エンジンがリアルタイム動作します。
              </p>
            </div>
          </div>

          {/* ステップ解説 */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span>🚀</span> <span>基本操作の4ステップ（検証の進め方）</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">STEP 1</span>
                <span className="font-serif font-bold text-xs text-slate-900 block pt-1">テスト文章を選択・入力</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  画面上の<strong>「📌 審査・検証用テストシナリオ（全5種）」</strong>のボタンをクリックするか、または直下の自由入力フォームに検証したいテキストを自由に入力します。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">STEP 2</span>
                <span className="font-serif font-bold text-xs text-slate-900 block pt-1">「リアルタイム検証」実行</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  文章を入力すると自動で判定されるか、<strong>「安全性をリアルタイム検証」ボタン</strong>を押すことで、常用姓名照合・連絡先検知・Gemini AIモデレーションがミリ秒単位で一斉実行されます。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">STEP 3</span>
                <span className="font-serif font-bold text-xs text-slate-900 block pt-1">検閲・安全化結果を確認</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  判定パネルで<strong>「常用姓名の検出」「LINE/電話番号/住所のマスキング表示例（***）」「AI検閲判定（safe / ai_flagged）」</strong>を一覧確認できます。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">STEP 4</span>
                <span className="font-serif font-bold text-xs text-slate-900 block pt-1">模擬投函＆通報フローテスト</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  赤色の<strong>「模擬投函・即時自動通報フローを実行」</strong>を押すと、危険文章が自動で非公開（隔離）保存され、管理者画面に緊急度の高い通報チケットが即座に自動起票されます。
                </p>
              </div>
            </div>
          </div>

          {/* 画面上の主要エリア・ボタン解説 */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span>💡</span> <span>画面要素・ボタンの機能解説</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  📌 審査・検証用テストシナリオ (ワンタップ自動入力)
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ①実名フルネーム（山田太郎等）、②直接連絡先（LINE ID/電話）、③機微個人情報（詳細住所）、④誹謗中傷・危険暴言、⑤不適切出会い（パパ活/買春）の5大脅威を代表するプリセットボタンです。タップするだけで検閲結果を即座にシミュレートできます。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  📖 公安・審査官用 サンプルフレーズ大図鑑 (全50選)
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  実名・連絡先・住所・暴言・不当出会いの5ジャンルごとに、合格ケース、伏字マスキングケース、自動隔離＆司法連携ケースの全50事例を収録。「コピー」や「テスト実行」ボタンで素早く任意の文言を試せます。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  🚨 模擬投函・即時自動通報フローを実行ボタン
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  画面上の文言で実際に「ボトルを投函した状態」を模擬実行します。有害文章であれば即時に `ai_flagged = 1`（一般非公開・隔離）となり、管理画面の「通報・監査」タブに自動通報報告書（優先度: 高/緊急）が作成される一連の防衛動作を実証できます。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  📊 判定結果パネルの確認ポイント
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ・<strong>常用姓名判定</strong>: 「実名と思われる文言が含まれています」などの警告表示<br/>
                  ・<strong>安全化プレビュー</strong>: 連絡先や住所が「***」や「[連絡先自動非表示]」に置換された一般タイムライン表示用の文章<br/>
                  ・<strong>AIモデレーション</strong>: AIが検知したカテゴリ（例: 脅迫、性交勧誘、暴言）と詳細理由
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: ⑨ 【適合確認完了】SNSアカウント連携・法的＆運用適合チェックリスト */}
      <div className="glass-card p-6 space-y-4 md:col-span-2 border border-blue-300 bg-blue-50/10 text-black">
        <div className="flex items-center gap-3 border-b border-blue-200 pb-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
            <CheckCircle2 size={20} className="text-blue-600" />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
            <span>⑨ 【適合確認完了】SNSアカウント連携・法的＆運用適合チェックリスト（対応完了済み）</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-sans font-normal">適合済</span>
          </h3>
        </div>
        <div className="space-y-4 font-sans text-xs text-left text-neutral-800">
          <p className="text-[11px] leading-relaxed text-blue-900">
            本プラットフォームは、LINE/Google等の主要SNS連携および会員登録プロファイル情報の取得における各種法的義務・利用規約・プライバシーポリシー・特商法・マニュアル・同意インターフェイスを完全対応（修正完了）しました。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
              <span className="font-bold text-xs text-black flex items-center gap-1">
                <span className="text-emerald-600 text-xs font-bold">✔ [完了]</span>
                1. 利用規約（ToS）の改訂
              </span>
              <p className="text-[10px] text-neutral-500 leading-normal">
                アカウント1対1対応、使い捨てアカウントでの重複登録禁止、退会・解除時のデータパージ・証跡ログ保全ポリシーを明記。
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
              <span className="font-bold text-xs text-black flex items-center gap-1">
                <span className="text-emerald-600 text-xs font-bold">✔ [完了]</span>
                2. プライバシーポリシー改訂
              </span>
              <p className="text-[10px] text-neutral-500 leading-normal">
                SNS内部UID、ニックネーム、メールアドレス、プロフィール画像の利用目的を定義。LINE、Googleとの安全な認可データ転送・処理フローを明記。
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
              <span className="font-bold text-xs text-black flex items-center gap-1">
                <span className="text-emerald-600 text-xs font-bold">✔ [完了]</span>
                3. 特商法に基づく表示の検証
              </span>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Stripe決済時のカード名義不一致や、eKYC審査不合格等による返金発生時、SNS連携プロファイルへの安全な紐付け処理フローを検証・解説追記。
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
              <span className="font-bold text-xs text-black flex items-center gap-1">
                <span className="text-emerald-600 text-xs font-bold">✔ [完了]</span>
                4. 管理者用マニュアルの適合
              </span>
              <p className="text-[10px] text-neutral-500 leading-normal">
                本項目「⑧」の技術解説をダミー解説から「本格リリース版」へ差し替え、DBの <code>users</code> 紐付けと監査イベントコード（<code>AUTH_SNS_SIGNUP</code>等）の監視手順を追加。
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
              <span className="font-bold text-xs text-black flex items-center gap-1">
                <span className="text-emerald-600 text-xs font-bold">✔ [完了]</span>
                5. 同意画面・テキスト修正
              </span>
              <p className="text-[10px] text-neutral-500 leading-normal">
                新規会員登録時およびeKYC申請画面の各同意チェックボックス・文言に「SNSアカウント連携に伴うデータプロファイル取得同意」を明記。
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
              <span className="font-bold text-xs text-black flex items-center gap-1">
                <span className="text-emerald-600 text-xs font-bold">✔ [完了]</span>
                6. 環境変数定義の整備
              </span>
              <p className="text-[10px] text-neutral-500 leading-normal">
                LINE認証およびGoogle認証用キーである <code>LINE_CHANNEL_ID/SECRET</code> <code>GOOGLE_CLIENT_ID/SECRET</code> を <code>.env.example</code> に安全に整備済み。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: ⑩ 【事業収益化・持続可能マネタイズ戦略】「再会・連絡先開示ごと」の都度課金モデル設計 */}
      <div className="glass-card p-6 space-y-4 md:col-span-2 border border-amber-300 bg-amber-50/5 text-black">
        <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
            <Coins size={20} className="text-amber-600" />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
            <span>⑩ 【事業収益化戦略】「再会・連絡先開示ごと」の都度課金（ペイウォール）モデル設計と運用方針（持続可能マネタイズ備忘録）</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-sans font-normal">ビジネスロードマップ</span>
          </h3>
        </div>
        <div className="space-y-4 font-sans text-xs text-left text-neutral-800">
          <p className="text-[11px] leading-relaxed text-black/85">
            本サービス「ReMEETs」における、初期コスト（eKYC認証費、SMS送信費、サーバー維持費、AI API通信費）を黒字回収しつつ、ユーザーの心理的・物理的ハードルを極限まで下げてバイラル拡散させるための<strong>「成果地点ピンポイント都度課金（再会・連絡先開示課金）」</strong>モデルの設計備忘録です。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-amber-100 space-y-2 shadow-sm">
              <span className="font-serif font-bold text-xs text-brand-primary block">💡 1. 都度課金モデル採用 of 経営的背景</span>
              <p className="text-[11px] text-black/75 leading-relaxed">
                定額サブスクリプションや初期登録時課金は、ユーザーの「あのお相手を探したい」という初期の探索意欲を阻害し、ボトル投函数の激減（ネットワーク効果の消失）を招きます。また、単純な「年齢承認のみでの一回限り課金」では、サイトを愛用して何度も再会を果たすアクティブユーザーからの継続的なマネタイズ（LTV最大化）に繋がりません。
              </p>
              <div className="p-2 bg-amber-500/5 rounded-xl text-[10px] text-amber-900 border border-amber-500/10 leading-normal">
                <strong>結論：</strong>「登録・投函・エゴサーチ」は<strong>完全無料（0円）</strong>として流入を最大化し、お相手が見つかって<strong>「思い出クイズに正解し、連絡先・手紙を開通する瞬間」にのみ600円（都度）を課金するモデル</strong>が、ユーザーの熱量が最も高まるタイミングであり、最も支払い意志（Willingness-to-Pay）が高い最適な設計です。
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-amber-100 space-y-2 shadow-sm">
              <span className="font-serif font-bold text-xs text-brand-primary block">🛡️ 2. セキュリティとビジネスの相乗効果</span>
              <p className="text-[11px] text-black/75 leading-relaxed">
                本モデルは、単なる収益化手段にとどまらず、サービスを脅かす「悪意ある行動」を未然に遮断する最強のセキュリティフィルターとして機能します。
              </p>
              <ul className="list-disc pl-4 text-[10px] text-black/60 space-y-1.5 leading-relaxed">
                <li><strong>ストーカー対策：</strong>嫌がらせやストーカー気質のユーザーが、多数の漂流ボトルに対して「手当たり次第にクイズ回答試行」をして開通を乱発させる行為を、物理的・金銭的バリア（開通ごとに600円）によって100%封殺します。</li>
                <li><strong>お冷やかしの排除：</strong>「本当に面識があり、再会を真剣に願うユーザー」だけが身元保証（eKYC）と微額決済（Stripe）をクリアするため、お相手への治安と信頼性を100%保証します。</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-amber-100 space-y-2 shadow-sm">
              <span className="font-serif font-bold text-xs text-brand-primary block">💰 3. ランニングコストと本当の月間純利益</span>
              <p className="text-[11px] text-black/75 leading-relaxed">
                都度の取引原価に加え、サーバー維持費、データベース代、特商法表記の住所・連絡先登記コストなど、月額固定コストを全て引いた「本当の月間純利益」の試算です。
              </p>
              <div className="p-2 bg-emerald-500/5 rounded-xl text-[10px] text-emerald-900 border border-emerald-500/10 space-y-1 leading-normal">
                <strong>【① 開通1回ごとの変動原価】</strong><br />
                - eKYC認証 + SMS送信 + 決済 + AI：計 133〜192円<br />
                - <strong>➔ 1件あたり限界粗利：約400〜467円</strong><br />
                <strong className="block mt-1 text-neutral-800">【② 月額固定ランニングコスト】</strong>
                - サーバー + DB + ドメイン + 特商法オフィス登記：<br />
                - <strong>➔ 月額合計固定費：約 9,000円〜9,500円 / 月</strong><br />
                <strong className="block mt-1 text-neutral-800">【③ 本当の月間純利益（営業利益）】</strong>
                - <strong>月 10件成約：</strong>▲5,300円 / 月 （初期）<br />
                - <strong>月 30件成約：</strong><strong>+3,100円 / 月 （損益分岐点）</strong><br />
                - <strong>月 100件成約：</strong>+32,500円 / 月 （安定成長）<br />
                - <strong>月 500件成約：</strong>+200,500円 / 月 （本格普及）<br />
                <span className="text-[9px] text-emerald-800 font-sans block mt-1 leading-snug">
                  ※ <strong>1日わずか1件の再会（月30件）</strong>で、システム維持費・オフィス代含む全固定費が自動相殺され、即黒字化する超安定構造です。
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-bold text-neutral-800 text-xs block mb-1.5">📈 今後の開発およびマーケティング運用ロードマップへの反映</span>
            <p className="text-[11px] text-black/70 leading-relaxed">
              ユーザーがお相手を見つけ、クイズゲートを突破したのち、開通誓約モーダル（決済＋eKYC確認）へと進むフローの設計において、この<strong>「再会・連絡先開示ごと都度課金」方針</strong>をデフォルト運用として採用します。ユーザーが「サイト価値を100%実感した瞬間」に決済ペイウォールを提示することで、顧客満足度を損なわずにリピート・新規開通のたびに持続可能なプラットフォーム運営資金を自動蓄積することが可能となります。
            </p>
          </div>
        </div>
      </div>

      {/* NEW: ⑪ 【行政・安全保障適合】警察（生活安全課）および eKYC 事業者連携・契約実務ガイド */}
      <div className="glass-card p-6 space-y-4 md:col-span-2 border border-rose-300 bg-rose-50/5 text-black">
        <div className="flex items-center gap-3 border-b border-rose-200 pb-3">
          <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600">
            <ShieldCheck size={20} className="text-rose-600" />
          </div>
          <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
            <span>⑪ 【行政・安全保障適合】警察（生活安全課）および eKYC 事業者連携・契約実務ガイド</span>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-sans font-normal">公安・法務対応</span>
          </h3>
        </div>
        <div className="space-y-4 font-sans text-xs text-left text-neutral-800 leading-relaxed">
          <p className="text-[11px] text-rose-950/80">
            ReMEETsの健全性と安全性を100%担保するための、管轄警察署の生活安全課・サイバー課およびeKYC本人確認事業者との公式契約、実務手順のガイドラインです。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 警察署対応マニュアル */}
            <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <span>🚔</span>
                <span>1. 警察署（生活安全課・サイバー課）対応ガイド</span>
              </div>
              <div className="space-y-2 text-[11px] text-neutral-700 leading-relaxed">
                <div>
                  <span className="font-bold text-black block">● 届出の要否と行政確認タスク：</span>
                  本アプリは無差別に出会う仕組みではなく、「特定の思い出の相手」との合意再開に特化した、クイズ認証を伴う「非SNS型再会システム」です。商業リリース前に、管轄の警察署（生活安全課）にシステム構成図を持参し、「出会い系サイト規制法」の適用対象外であることの公式確認を取ります。
                </div>
                <div>
                  <span className="font-bold text-black block">● 捜査照会（刑事訴訟法197条）への開示手順：</span>
                  万が一、事件・ストーキング疑惑等が起きた場合、公安より正式な「捜査関係事項照会書」を受領した際は、即座に以下のログ情報を抽出・提供する運用を行います。
                  <ul className="list-disc pl-4 text-[10px] text-neutral-500 mt-1 space-y-0.5">
                    <li>ユーザーが連携したLINE内部ID、Googleアカウントメールアドレス</li>
                    <li>SMS認証で使用された実在する携帯電話番号</li>
                    <li>eKYC事業者より証明・提供された公的本人情報（氏名、年齢）</li>
                    <li>投函・クイズ回答時のIPアドレス、アクセスログ、およびAI隔離された脅迫・暴言投稿（証跡の保持）</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* eKYC事業者契約マニュアル */}
            <div className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <span>🪪</span>
                <span>2. eKYC事業者との法人契約・開発実務</span>
              </div>
              <div className="space-y-2 text-[11px] text-neutral-700 leading-relaxed">
                <div>
                  <span className="font-bold text-black block">● 推奨事業者と提携コスト：</span>
                  日本国内で公的身元確認APIを提供する「TRUSTDOCK」または「LIQUID eKYC」等のベンダーと法人契約を結びます。
                  初期費用約5〜10万円、月額料金約1〜3万円、1回あたりの本人認証コスト約150〜250円（身分証画像＋表情確認審査含む）を想定します。
                </div>
                <div>
                  <span className="font-bold text-black block">● 決済一体型「完全黒字化」料金モデル：</span>
                  eKYC審査とSMS認証は、連絡先開示・開通手数料（600円）がStripeで決済されたタイミングで同期トリガーされます。
                  <div className="mt-1 p-2 bg-emerald-500/5 rounded-xl text-[10px] text-emerald-900 border border-emerald-500/10 font-mono">
                    売上：+600円<br />
                    経費：決済手数料 22円 + SMS送信費 12円 + eKYC費 200円 = 234円<br />
                    <strong>➔ 純利：+366円/回</strong> の利益差額で経費を完全自給自足
                  </div>
                </div>
                <div>
                  <span className="font-bold text-black block">● ユーザーの年齢ステータス連携と暗号化：</span>
                  eKYCのAPIからWebHook受信後、DBの年齢確認フラグを安全に暗号化保存（機微情報の保護）し、安全にメッセージ・連絡先開示機能を開放します。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: ⑫ 【法務・契約合意】責任の所在および事業者契約決定事項チェックリスト */}
      <ContractChecklistSection />

      {/* NEW: ⑬ 【権限管理・運用組織】ロール権限（RBAC）＆スタッフ検索・任命操作マニュアル */}
      <div className="glass-card p-6 md:p-8 space-y-6 md:col-span-2 border border-indigo-300 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/15 rounded-3xl shadow-xs text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-600 border border-indigo-200/60">
              <KeyRound size={22} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <span>⑬ 【権限管理・運用組織】ロール権限（RBAC）＆スタッフ検索・任命操作マニュアル</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-sans font-normal border border-indigo-200">
                  組織セキュリティ
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                統括管理者による権限の最小化付与、一般ユーザーからのスタッフ検索・即時ロール任命、および役職別アクセス制御の運用ガイド
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-full font-bold self-start sm:self-center shrink-0 flex items-center gap-1">
            <UserPlus size={14} className="text-indigo-600" />
            <span>ユーザー検索任命＆階層権限</span>
          </span>
        </div>

        <div className="space-y-6 font-sans text-xs text-left text-neutral-800 leading-relaxed">
          {/* 権限分離の概要 */}
          <div className="p-4 bg-indigo-900/5 rounded-2xl border border-indigo-200/80 flex items-start gap-3">
            <span className="text-xl">🔐</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-xs">権限最小化原則（Least Privilege）と階層ロール設計</p>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                全スタッフに「最高管理者（super_admin）」権限を与えると、意図しない設定変更や機微情報の不当閲覧リスクが生じます。業務内容に応じて「モデレーター」「CSサポート」「監査・法務」に権限を分離し、安全なマルチオペレーター体制を構築します。
              </p>
            </div>
          </div>

          {/* 4つの主要ロール定義 */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span>👥</span> <span>4大ロール（役職）と付与される権限範囲</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-indigo-150 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-900 flex items-center gap-1">
                    <span>👑</span> 統括最高管理者
                  </span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">super_admin</span>
                </div>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  <strong>全権限：</strong>全タブ閲覧・操作、スタッフのロール変更・新規任命、システム設定、APIレート制限変更、DB初期化・Seeding等。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-emerald-150 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                    <span>🛡️</span> 治安モデレーター
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">moderator</span>
                </div>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  <strong>モデレーション専門：</strong>AI検知キュー審査、緊急通報対応、ボトル削除、ユーザー凍結、NGワード管理、リアルタイム警報。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-sky-150 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-sky-900 flex items-center gap-1">
                    <span>🎧</span> カスタマーサポート
                  </span>
                  <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono">cs_support</span>
                </div>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  <strong>問い合わせ・削除対応：</strong>お問い合わせフォームへの返答、当事者からの削除要請（法的フォーム）の処理、ユーザー検索。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-purple-150 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-900 flex items-center gap-1">
                    <span>⚖️</span> 監査・法務オフィサー
                  </span>
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">auditor</span>
                </div>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  <strong>法務・捜査対応：</strong>監査ログ閲覧、警察・捜査機関照会用データエクスポート、同意ログ確認、事業査定CSV出力（編集・削除権限はなし）。
                </p>
              </div>
            </div>
          </div>

          {/* 新規スタッフ任命の操作手順 */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span>🔍</span> <span>スタッフの検索・任命・役職変更手順（オペレーションフロー）</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">STEP 1</span>
                <span className="font-serif font-bold text-xs text-slate-900 block pt-1">対象アカウントを検索</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  「ロール権限」タブ内の検索フォームに、スタッフに任命したい方の<strong>ユーザー名、ニックネーム、メールアドレス、またはID</strong>を入力して「ユーザー検索」をクリックします。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">STEP 2</span>
                <span className="font-serif font-bold text-xs text-slate-900 block pt-1">役職を選択して「任命する」</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  ドロップダウンから付与したい役職（モデレーター、CSサポート、監査、統括管理者）を選択し、検索結果の<strong>「任命する」ボタン</strong>を押すと即時にスタッフロールが付与されます。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">STEP 3</span>
                <span className="font-serif font-bold text-xs text-slate-900 block pt-1">権限の即時反映と管理メニュー</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  任命されたユーザー側では、次回ログイン時（または画面更新時）に<strong>右上のハンバーガーメニューに「管理者ダッシュボード」</strong>が役職バッジ付きで表示され、業務を開始できます。
                </p>
              </div>
            </div>
          </div>

          {/* ハンバーガーメニューと認証セキュリティ仕様 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
              <span>🛡️</span> ハンバーガーメニュー表示およびセキュリティ防御仕様
            </span>
            <div className="text-[11px] text-slate-700 space-y-1.5 leading-relaxed">
              <p>
                <strong>・未ログイン・一般ユーザー時の完全非表示:</strong> 一般ユーザーや未ログイン訪問者には、右上のハンバーガーメニュー内に「管理者ダッシュボード」項目は一切表示されません（存在自体が隠蔽されます）。
              </p>
              <p>
                <strong>・URL直打ち（/admin）アクセスに対する二重防御:</strong> 万が一一般ユーザーがブラウザで直接 <code>/admin</code> にアクセスした場合でも、バックエンドAPI（<code>/api/admin/*</code>）側でセッショントークンおよびDBの権限ロール（<code>role</code>）が検証され、未認証リクエストは401/403エラーとして物理的に遮断されます。
              </p>
              <p>
                <strong>・スタッフ解除・降格時の即時反映:</strong> スタッフ一覧から「一般ユーザーに降格」を選択すると、即座に管理者権限が剥奪され、該当ユーザーのハンバーガーメニューから管理者ダッシュボードが非表示になります。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: ⑭ 【身元保証・eKYC監査】公的本人確認（eKYC）詳細監査＆個人カード操作マニュアル */}
      <div className="glass-card p-6 md:p-8 space-y-6 md:col-span-2 border border-emerald-300 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/15 rounded-3xl shadow-xs text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600 border border-emerald-200/60">
              <ShieldCheck size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <span>⑭ 【身元保証・eKYC監査】公的本人確認（eKYC）生体OCR監査＆個人カード操作マニュアル</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-sans font-normal border border-emerald-200">
                  2026年改訂
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                ユーザー管理画面における公的証明書類種別、顔認証・OCR照合スコア監査、および個人カードの1行ステータス操作ガイド
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full font-bold self-start sm:self-center shrink-0 flex items-center gap-1">
            <UserCheck size={14} className="text-emerald-600" />
            <span>eKYC生体OCR＆即時リセット</span>
          </span>
        </div>

        <div className="space-y-6 font-sans text-xs text-left text-neutral-800 leading-relaxed">
          {/* eKYC監査の概要 */}
          <div className="p-4 bg-emerald-900/5 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
            <span className="text-xl">🪪</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-xs">ゼロデータリテンション（非保持）と監査トークンによる真正性担保</p>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                ReMEETsでは個人情報保護法および漏洩リスク完全排除の観点から、運転免許証やマイナンバーカードの生画像データを自社サーバーに一切保存しません。外部eKYC認証機関から発行された「暗号化監査トークン（例: <code>EKYC-2026-xxxx-PASSED</code>）」および「生体顔照合スコア」「OCR一致率」の安全なメタデータのみを保持し、管理画面からいつでも真正性を即座に検証可能です。
              </p>
            </div>
          </div>

          {/* 監査項目と個人カードの表示仕様 */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span>📋</span> <span>個人カード（ユーザー詳細モーダル）における監査表示項目</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-emerald-150 shadow-2xs space-y-2">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                  <span>🛡️</span> 1. 提出身分証明書の種別
                </span>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  「運転免許証（表面・厚み・裏面）」「マイナンバーカード（ICチップ照合）」「日本国旅券（パスポート）」のいずれで認証されたかを明示。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-emerald-150 shadow-2xs space-y-2">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                  <span>🤖</span> 2. 生体照合 ＆ OCRスコア
                </span>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  AI生体顔照合スコア（例: 99.4% / 閾値85%クリア）およびOCR文字一致率（99.2%）を表示し、なりすまし・偽造書類の通過がないことを確認。
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-emerald-150 shadow-2xs space-y-2">
                <span className="font-bold text-xs text-emerald-900 flex items-center gap-1">
                  <span>🔄</span> 3. 1行レイアウト＆未申請リセット
                </span>
                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  「🛡️ 承認済 (Verified)」バッジと「未申請に戻す」ボタンが改行されず1行で美しく配置。テスト検証や再審査時にワンクリックでロールバック可能。
                </p>
              </div>
            </div>
          </div>

          {/* 捜査・行政対応時の照合手順 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
              <span>🚔</span> 捜査照会・本人確認トラブル時の対応手順
            </span>
            <div className="text-[11px] text-slate-700 space-y-1.5 leading-relaxed">
              <p>
                <strong>1. ユーザー管理から該当者を検索:</strong> ニックネーム、メールアドレス、またはIDで検索し、一覧で「🛡️ eKYC済」バッジを確認。
              </p>
              <p>
                <strong>2. 個人カードを開いて監査トークンを照合:</strong> カード内の「監査トークンID」および「認証完了日時」を抽出し、法執行機関への提出資料またはeKYC事業者へのログ追跡キーとして活用。
              </p>
              <p>
                <strong>3. 虚偽・不正発覚時の即時措置:</strong> 不正な書類や他人名義の疑いが生じた場合、個人カードから「未申請に戻す」を実行した上で、アカウントの「凍結」措置を実施。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
