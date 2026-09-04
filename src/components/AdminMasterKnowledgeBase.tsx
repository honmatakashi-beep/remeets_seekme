import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  ShieldCheck,
  ShieldAlert,
  Search,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  Key,
  Flame,
  FileText,
  CreditCard,
  UserCheck,
  Building2,
  Calendar,
  Lock,
  MessageSquare,
  Scale,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Phone,
  Send,
  Trash2,
  FileCheck
} from 'lucide-react';
import { AdminDeploymentGuideBlock } from '../pages/MiscPages';

export interface AdminMasterKnowledgeBaseProps {
  guideDocType?: any;
  setGuideDocType?: (val: any) => void;
}

export const AdminMasterKnowledgeBase: React.FC<AdminMasterKnowledgeBaseProps> = ({
  guideDocType = 'deployment',
  setGuideDocType = () => {}
}) => {
  const [viewMode, setViewMode] = useState<'master_memo' | 'legal_docs'>('master_memo');
  const [activeSubTab, setActiveSubTab] = useState<
    'deployment17' | 'auth_costs' | 'police_ekyc' | 'liability_contract' | 'closed_chat_transition' | 'scratchpad'
  >('deployment17');

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Interactive Checklist State (stored in localStorage)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('remeets_deployment_checklist_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom Scratchpad Note State (stored in localStorage)
  const defaultAuthMemo = `【ReMEETs 本番運用 ＆ 認証設計 決定事項メモ】
■ 1. 認証基本構成
- メインログイン: LINE Login / Google OAuth (API利用料: 完全無料)
- 二重登録防止 & 警察照会用担保: 携帯SMS認証 (1通 12円)
- 本人確認: TRUSTDOCK / LIQUID eKYC (1件 150〜200円)

■ 2. 課金 & 黒字化モデル (完全買い切り)
- 開通手数料: 600 円 (税込)
  ├ 売上: +600 円
  ├ Stripe手数料 (3.6%): -22 円
  ├ SMS送信費: -12 円
  ├ eKYC身元確認費: -200 円
  └ 1件あたり純手元利益: +366 円 (確実に黒字回収)

■ 3. 警察 (公安・サイバー課) 照会対応
- サービス建付け: 過去の既知の想い出照合ツールであり、インターネット異性紹介事業には非該当。
- 令状受領時の開示可能項目: SNS UID, Google Email, SMS認証番号, eKYC氏名/年齢, アクセスIP/日時, AI検閲隔離ログ。`;

  const [scratchpadMemo, setScratchpadMemo] = useState<string>(() => {
    try {
      return localStorage.getItem('remeets_master_auth_memo') || defaultAuthMemo;
    } catch {
      return defaultAuthMemo;
    }
  });
  const [memoSaved, setMemoSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('remeets_deployment_checklist_checked', JSON.stringify(checkedItems));
    } catch (e) {
      console.error(e);
    }
  }, [checkedItems]);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveMemo = () => {
    try {
      localStorage.setItem('remeets_master_auth_memo', scratchpadMemo);
      setMemoSaved(true);
      setTimeout(() => setMemoSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetMemo = () => {
    if (window.confirm('備忘録メモを最新の標準テンプレートに戻しますか？')) {
      setScratchpadMemo(defaultAuthMemo);
      try {
        localStorage.setItem('remeets_master_auth_memo', defaultAuthMemo);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Checklist completion calculation
  const totalChecklistCount = 17;
  const completedChecklistCount = Object.keys(checkedItems).filter(k => checkedItems[k]).length;
  const checklistPercent = Math.round((completedChecklistCount / totalChecklistCount) * 100);

  // Master Deployment Checklist Items
  const deploymentSections = [
    {
      group: '【A. インフラ・DB基盤】',
      items: [
        { id: 'step_01', icon: '🗄️', title: '1. 本番用 RDBMS (PostgreSQL / Cloud SQL) のプロビジョニング', desc: 'SQLite (better-sqlite3) から安全なマネージドデータベースへ移行。Supabase (PostgreSQL) または Google Cloud SQL (PostgreSQL) の高可用性インスタンスをプロビジョニング。' },
        { id: 'step_02', icon: '🔑', title: '2. DATABASE_URL 環境変数のサーバー設定', desc: 'データベースパスワードを含む接続用URLをソースコード内に直接ハードコードせず、Cloud Run 等のインフラ環境変数 DATABASE_URL にシークレットとして安全に設定。' },
        { id: 'step_03', icon: '🚀', title: '3. データベースの初期テーブルスキーママイグレーションの実行', desc: 'Drizzle ORM等を使用し、本番環境の空のデータベースに対してクリーンなテーブル構造、インデックス、外部キー制約を一括で適用（マイグレーション）。' }
      ]
    },
    {
      group: '【B. 外部API・決済キー設定】',
      items: [
        { id: 'step_04', icon: '🤖', title: '4. Google AI Studio / Vertex AI (Gemini API) 商用本番キーの発行', desc: 'AIによるストーカー、誹謗中傷、不当表現の自律検閲監査（モデレーション）のため、クレジットカードを登録し従量課金を有効化した本番専用の GEMINI_API_KEY を取得・設定。' },
        { id: 'step_05', icon: '📧', title: '5. Resend / SendGrid (メール配信API) の本番接続設定', desc: 'ボトルのマッチングやお問い合わせ到達率を100%近くまで保証するため、独自ドメイン of DNS設定（SPF/DKIM/DMARC）を完了し、配信APIキー（RESEND_API_KEY 等）をセットアップ。' },
        { id: 'step_06', icon: '💳', title: '6. Stripe (決済代行インフラ) 本番キーの契約とWebhook署名設定', desc: 'Stripe本番アカウントの加盟店審査を完了させ、本番用非公開鍵（STRIPE_SECRET_KEY / VITE_STRIPE_PUBLISHABLE_KEY）をセット。決済・自動返金成功をリアルタイム検知する安全なWebhook署名を有効化。' }
      ]
    },
    {
      group: '【C. 本番データ管理】',
      items: [
        { id: 'step_07', icon: '🧹', title: '7. 開発用テストデータの完全クリーンアップ (初期化) 実行', desc: '開発デバッグ期間中に蓄積された不要なテストユーザー、デバッグボトルメール、不完全なチャット・監査ログを管理者ダッシュボードから物理的に一括安全消去（初期化）。' },
        { id: 'step_08', icon: '🌱', title: '8. 情緒豊かな300件以上の本番サンプルデータの一括自動生成', desc: 'ローンチ直後の「誰もいない寂しさ」を完全排除するため、自動Seeding機能（/api/admin/production-seed）を用いて、実在感のある日本の想い出ボトルメールや感謝レターを一括流し込み。' }
      ]
    },
    {
      group: '【D. SNSアカウント連携】',
      items: [
        { id: 'step_09', icon: '🌐', title: '9. LINE / Google Developers コンソールでの本番クライアント作成', desc: '本番用ドメインでのログインリダイレクトURI（/api/auth/sns/callback 等）やブランド名、各種プライバシーポリシーURLを各開発者ポータルに正確に登録・設定。' },
        { id: 'step_10', icon: '🔒', title: '10. LINE_CHANNEL_SECRET 等の認証シークレットの環境変数追記', desc: '安全な外部SNSログイン認証（OAuth）を行うために、LINEおよびGoogleの本番用クライアントIDと秘密鍵（LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET）を本番サーバー環境変数に追記。' }
      ]
    },
    {
      group: '【E. 法務・規約・特商法・文書制定日】',
      items: [
        { id: 'step_11', icon: '📝', title: '11. 利用規約 (TOS) のSNSアカウント連携条項追加・改訂', desc: 'SNS使い捨てアカウントによる嫌がらせ目的の大量登録禁止条項や、連携解除・退会時における思い出データの保持・削除ポリシーを明文化。' },
        { id: 'step_12', icon: '🔒', title: '12. プライバシーポリシー (PP) のOAuth取得データ明記・改訂', desc: 'SNSログインで取得するプロファイル画像、表示ニックネーム、メールアドレスの具体的な利用範囲と、認証プロバイダーへの安全なデータ転送フローを開示。' },
        { id: 'step_13', icon: '💼', title: '13. 特定商取引法に基づく表記の整備 (住所・電話番号対策)', desc: 'Stripe決済（開通手数料 600円）が処理される際、個人の安全を守るため「格安バーチャルオフィス（月額約990円〜）」および「050電話番号」を契約し、特商法ページに記載。' },
        { id: 'step_14', icon: '📅', title: '14. 全法的文書の【制定日・施行日】の運用開始初日への確定・統一', desc: '利用規約、プライバシーポリシー、投稿ガイドライン、特定商取引法に基づく表記の末尾の制定・改定・施行日を正式サービス提供開始日（2026年8月15日）に整合。' }
      ]
    },
    {
      group: '【F. 運用セキュリティ】',
      items: [
        { id: 'step_15', icon: '🛡️', title: '15. データベース日次自動バックアップ & 世代管理の有効化', desc: '万が一のデータ破損や攻撃に備え、データベース（Supabase/Cloud SQL）側で自動デイリースナップショット（保存期間最低7〜14日間）をON。' },
        { id: 'step_16', icon: '🚫', title: '16. スロットリング型動的APIアクセスレート制限のポリシー設定', desc: 'DoS攻撃やクイズの総当たり自動回答スパムを防ぐため、秒間API制限しきい値（Auth, Post, Search等）を直感的に固定・保護。' }
      ]
    },
    {
      group: '【G. 最終テスト】',
      items: [
        { id: 'step_17', icon: '✅', title: '17. 公的 eKYC・自筆署名・Stripeテスト決済の最終疎通テスト', desc: '思い出クイズの完全一致、eKYC書類の提出、手書き誓約電子署名、Stripeによる600円の仮売上（審査落ち時即時自動返金）が連動して正常動作するか最終検証。' }
      ]
    }
  ];

  return (
    <div id="master-knowledge-base-block" className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-8 font-sans">
      {/* 🧭 Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-900 rounded-full text-xs font-bold mb-2 border border-teal-200">
            <BookOpen size={14} />
            <span>ReMEETs 統合マスター備忘録 ＆ 運営ナレッジセンター</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-black flex items-center gap-2">
            <span>マスター備忘録 ＆ 運営ライブラリ</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              全決定事項・完全集約版
            </span>
          </h3>
          <p className="text-xs text-black/60 mt-1">
            本番デプロイ手順、SNS/SMS認証仕様、警察・公安照会基準、法的責任の所在など、散らばっていた全備忘録を1箇所に完全統合しました。
          </p>
        </div>

        {/* View Mode Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-brand-border/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('master_memo')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'master_memo' ? 'bg-white text-black shadow-xs font-bold' : 'text-black/60 hover:text-black'
              }`}
            >
              📚 マスター備忘録 ＆ 決定事項集
            </button>
            <button
              type="button"
              onClick={() => setViewMode('legal_docs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'legal_docs' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-black/60 hover:text-black'
              }`}
            >
              🏛️ 行政届出・法務ポートフォリオ
            </button>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(scratchpadMemo, 'full_memo')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 transition-all cursor-pointer border border-teal-200"
          >
            {copiedSection === 'full_memo' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedSection === 'full_memo' ? 'コピー完了！' : 'サマリーコピー'}</span>
          </button>
        </div>
      </div>

      {/* 🏛️ VIEW MODE 2: Formal Legal Documents Portfolio */}
      {viewMode === 'legal_docs' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <AdminDeploymentGuideBlock docType={guideDocType} setDocType={setGuideDocType} />
        </motion.div>
      )}

      {/* 📚 VIEW MODE 1: Master Knowledge Base (Memos & Decisions) */}
      {viewMode === 'master_memo' && (
        <div className="space-y-6">
          {/* 🧭 6大サブタブ ナビゲーションカード */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* TAB 1: 17大デプロイチェックリスト */}
            <button
              type="button"
              onClick={() => setActiveSubTab('deployment17')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSubTab === 'deployment17'
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                  : 'bg-zinc-50/80 hover:bg-white border-brand-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🚀</span>
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                    {checklistPercent}%
                  </span>
                </div>
                <div className="font-bold text-xs text-black">17大デプロイ</div>
                <div className="text-[10px] text-black/60 line-clamp-1">本番公開チェックリスト</div>
              </div>
            </button>

            {/* TAB 2: SNS・SMSコスト仕様 */}
            <button
              type="button"
              onClick={() => setActiveSubTab('auth_costs')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSubTab === 'auth_costs'
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                  : 'bg-zinc-50/80 hover:bg-white border-brand-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">💰</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                    600円
                  </span>
                </div>
                <div className="font-bold text-xs text-black">認証・コスト仕様</div>
                <div className="text-[10px] text-black/60 line-clamp-1">LINE/Google/SMS設計</div>
              </div>
            </button>

            {/* TAB 3: 警察・eKYC連携 */}
            <button
              type="button"
              onClick={() => setActiveSubTab('police_ekyc')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSubTab === 'police_ekyc'
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                  : 'bg-zinc-50/80 hover:bg-white border-brand-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">🚔</span>
                  <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded">
                    刑訴法197条
                  </span>
                </div>
                <div className="font-bold text-xs text-black">警察・eKYC連携</div>
                <div className="text-[10px] text-black/60 line-clamp-1">捜査照会・令状開示基準</div>
              </div>
            </button>

            {/* TAB 4: 責任の所在・契約決定 */}
            <button
              type="button"
              onClick={() => setActiveSubTab('liability_contract')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSubTab === 'liability_contract'
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                  : 'bg-zinc-50/80 hover:bg-white border-brand-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">⚖️</span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                    10項目
                  </span>
                </div>
                <div className="font-bold text-xs text-black">責任所在・契約</div>
                <div className="text-[10px] text-black/60 line-clamp-1">免責・返金・個人情報</div>
              </div>
            </button>

            {/* TAB 5: 連絡先開示モデル移行 */}
            <button
              type="button"
              onClick={() => setActiveSubTab('closed_chat_transition')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSubTab === 'closed_chat_transition'
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                  : 'bg-zinc-50/80 hover:bg-white border-brand-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">✉️</span>
                  <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded">
                    完結型
                  </span>
                </div>
                <div className="font-bold text-xs text-black">連絡先開示モデル</div>
                <div className="text-[10px] text-black/60 line-clamp-1">チャット廃止の法的背景</div>
              </div>
            </button>

            {/* TAB 6: 編集可能メモボード */}
            <button
              type="button"
              onClick={() => setActiveSubTab('scratchpad')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeSubTab === 'scratchpad'
                  ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                  : 'bg-zinc-50/80 hover:bg-white border-brand-border/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">📝</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-800 bg-zinc-200 px-1.5 py-0.5 rounded">
                    保存可
                  </span>
                </div>
                <div className="font-bold text-xs text-black">自由記述メモ</div>
                <div className="text-[10px] text-black/60 line-clamp-1">運営者メモボード</div>
              </div>
            </button>
          </div>

          {/* ======================================================== */}
          {/* 🚀 SUBTAB 1: 17大本番デプロイマスターチェックリスト         */}
          {/* ======================================================== */}
          {activeSubTab === 'deployment17' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/60 p-4 rounded-2xl border border-teal-200">
                <div>
                  <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                    <Rocket className="text-teal-700" size={16} />
                    <span>本番デプロイ・運営開始 17大マスターチェックリスト進捗</span>
                  </h4>
                  <p className="text-xs text-teal-800 mt-0.5">
                    チェックボックスをクリックするとブラウザに保存されます（{completedChecklistCount} / {totalChecklistCount} 項目完了）
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-white rounded-full h-3 border border-teal-200 overflow-hidden">
                    <div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${checklistPercent}%` }} />
                  </div>
                  <span className="font-mono font-bold text-xs text-teal-900">{checklistPercent}%</span>
                </div>
              </div>

              <div className="space-y-6">
                {deploymentSections.map((sec, idx) => (
                  <div key={idx} className="bg-zinc-50/60 p-5 rounded-3xl border border-brand-border space-y-3">
                    <h5 className="text-xs font-bold text-black uppercase tracking-wider">{sec.group}</h5>
                    <div className="space-y-2">
                      {sec.items.map((item) => {
                        const isChecked = !!checkedItems[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleCheck(item.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isChecked
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : 'bg-white hover:bg-zinc-50 border-brand-border/80 text-black'
                            }`}
                          >
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by parent div
                                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                              />
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                <span>{item.icon}</span>
                                <span className={isChecked ? 'line-through text-emerald-800' : 'text-black'}>{item.title}</span>
                              </div>
                              <p className="text-[11px] text-black/60 leading-relaxed font-sans">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 💰 SUBTAB 2: SNS・SMSコスト仕様 ＆ 600円黒字化設計備忘録   */}
          {/* ======================================================== */}
          {activeSubTab === 'auth_costs' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Card 1: LINE & Google Login Specs */}
              <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <span className="text-xl">🌐</span>
                  <h4 className="text-sm font-bold text-black">1. LINE・Google認証（SNSログイン）のコストと仕様</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                    <span className="font-bold text-emerald-800 block">月額費用 / 初期費用: 0 円 (完全無料)</span>
                    <p className="text-black/60 leading-relaxed">
                      LINE Login（LINEヤフー株式会社）および Google OAuth 2.0（Google LLC）のインフラは、ログイン認証・プロファイル取得を何万回行っても基本料金・従量課金ともに<b>完全無料</b>です。面倒なパスワード管理と漏洩リスクを100%排除できます。
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                    <span className="font-bold text-teal-800 block">メールアドレス取得仕様</span>
                    <p className="text-black/60 leading-relaxed">
                      <b>Google</b>: ユーザー同意画面を経て確実に実在のメールアドレスを取得。<br />
                      <b>LINE</b>: LINE Developers上で「メールアドレス取得権限（Email permission）」を申請・承認の上、同意を得て安全に取得。
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: SMS Authentication Cost & Profit Strategy */}
              <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <span className="text-xl">📱</span>
                  <h4 className="text-sm font-bold text-black">2. SMS認証（電話番号認証）のコストと黒字化戦略</h4>
                </div>
                <div className="space-y-3 text-xs">
                  <p className="text-black/70 leading-relaxed">
                    <b>なぜSMS認証が必要なのか</b>: 無料のSNS認証だけでは複アカやサクラを防げないため、<b>「1ユーザー＝1物理携帯番号」</b>を担保し、警察・公安照会時の最重要接点とします。<br />
                    <b>従量課金対策</b>: SMS送信費（1通約12円）を無料ログイン段階で走らせると赤字になるため、<b>「お相手とのチャット開通（600円決済）」の内部でのみトリガー</b>します。
                  </p>

                  {/* Profit breakdown diagram */}
                  <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
                    <span className="font-bold text-teal-950 block text-xs">【600円 開通決済 1件あたりの収益・原価分解】</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                        <span className="text-black/50 block text-[10px]">【売上】開通料</span>
                        <span className="text-emerald-800 font-bold">+600 円</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                        <span className="text-black/50 block text-[10px]">【控除】Stripe(3.6%)</span>
                        <span className="text-rose-600 font-bold">-22 円</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                        <span className="text-black/50 block text-[10px]">【控除】SMS送信費</span>
                        <span className="text-rose-600 font-bold">-12 円</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                        <span className="text-black/50 block text-[10px]">【控除】eKYC身元確認</span>
                        <span className="text-rose-600 font-bold">-200 円</span>
                      </div>
                    </div>
                    <div className="pt-2 text-right font-bold text-teal-950 text-xs">
                      ✨ 1トランザクションあたりの手元純利益: <span className="font-mono text-emerald-800 text-sm font-extrabold">+366 円</span>（完全黒字回収）
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 🚔 SUBTAB 3: 警察・公安照会対応 ＆ eKYC事業者連携          */}
          {/* ======================================================== */}
          {activeSubTab === 'police_ekyc' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <span className="text-xl">🚔</span>
                  <h4 className="text-sm font-bold text-black">1. 警察（公安・生活安全課）および捜査機関向けの確認事項</h4>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-black/70">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-1.5">
                    <span className="font-bold text-black block">① 出会い系サイト規制法への非該当性の説明</span>
                    <p>
                      本サービスは不特定多数との異性交際を斡旋する場ではなく、過去の共通の思い出クイズに正解した「既知・面識のある者同士」を安全に再会させる仕組みであり、インターネット異性紹介事業の届出対象外である建付けを警察署生活安全課へ説明できるように整備しています。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-1.5">
                    <span className="font-bold text-black block">② 捜査関係事項照会書（刑訴法197条2項）受領時の開示ログ項目</span>
                    <ul className="list-disc pl-5 space-y-1 text-black/80 font-mono text-[11px]">
                      <li>SNSアカウント連携UID（LINE内部UID、Googleメールアドレス）</li>
                      <li>SMS電話番号認証ログ（携帯電話番号、認証完了タイムスタンプ）</li>
                      <li>eKYC本人確認デジタル証跡（公的氏名、年齢確認ステータス、照合コード）</li>
                      <li>アクセス元IPアドレス、User-Agent、投函ボトル履歴</li>
                      <li>AI安全防衛エンジンによって自動隔離（ai_flagged = 1）された脅迫・暴言メッセージ原本</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <span className="text-xl">🪪</span>
                  <h4 className="text-sm font-bold text-black">2. eKYC事業者（TRUSTDOCK / LIQUID）連携実務</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                    <span className="font-bold text-black block">提携候補と概算コスト</span>
                    <ul className="list-disc pl-4 space-y-1 text-black/70">
                      <li>初期費用: 約50,000円〜100,000円（無償キャンペーンプラン有）</li>
                      <li>月額基本料: 約10,000円〜30,000円</li>
                      <li>従量審査費: 1件あたり 約150円〜250円</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                    <span className="font-bold text-black block">身分証画像の非保持ルール</span>
                    <p className="text-black/70 leading-relaxed">
                      運転免許証・マイナンバーカードの生画像は運営サーバー側には一切保存せず、すべてeKYC事業者のセキュアサーバー側でのみ保管。運営側は承認ステータスと承認日時のみを保持して情報漏洩リスクを100%回避します。
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* ⚖️ SUBTAB 4: 責任の所在 ＆ 事業者契約決定 10大チェック     */}
          {/* ======================================================== */}
          {activeSubTab === 'liability_contract' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Group A: Liability */}
                <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <span className="text-xl">⚖️</span>
                    <h4 className="text-sm font-bold text-black">【A. 責任の所在 (Liability) 5項目】</h4>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { title: '1. 本人確認の正誤に関する免責', desc: '偽造身分証等のすり抜けトラブルについて運営会社は免責され、eKYCベンダー側の審査品質範囲として規約で合意。' },
                      { title: '2. SMS不達・通信障害時の返金責任', desc: 'キャリア障害等で認証コードが届かなかった場合、Stripe決済（600円）をシステムが自動即時返金・キャンセル。' },
                      { title: '3. 身分証画像の保管・漏洩責任', desc: '生画像データは運営サーバーに保存せず、eKYCベンダー側でのみ保持。情報漏洩リスクをゼロ化。' },
                      { title: '4. ストーキング・刑事事件発生時の提供', desc: '捜査関係事項照会書を受領した場合、公安にSMS番号およびeKYC情報を開示することを規約に事前明記。' },
                      { title: '5. AI安全フィルター誤判定の免責', desc: '健全なメッセージがAIによって誤って隔離された場合の機会損失や精神的苦痛について運営は免責。' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-zinc-50 border border-brand-border space-y-0.5">
                        <span className="font-bold text-black block">{item.title}</span>
                        <p className="text-black/60 text-[11px] leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group B: Contract Decisions */}
                <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <span className="text-xl">📜</span>
                    <h4 className="text-sm font-bold text-black">【B. 事業者契約 システム決定 5項目】</h4>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { title: '6. eKYC不合格時の従量費負担ルール', desc: '不合格時でも発生するAPI費用（約200円）をカバーするため、Stripe仮売上（オーソリ）のタイミングと荒らしIPブロックを決定。' },
                      { title: '7. SMS送信リトライレート制限', desc: '1つの電話番号に対して1日最大3回までに制限し、Twilio等への悪質連続アクセスによる従量費赤字を防御。' },
                      { title: '8. LINE配信メッセージ追加課金対策', desc: 'マッチング発生時の通知はLINE有料プッシュではなく「インApp内通知」「無料メール」を優先。' },
                      { title: '9. 退会時のOAuthデータ完全物理削除', desc: 'ユーザー退会時にLINE内部UIDやGoogleメール等のレコードを即座に物理消去する削除フローを確定。' },
                      { title: '10. Stripe決済・返金手数料の原価計算', desc: 'ユーザー都合の返金時は決済手数料分（3.6%）の損失を防ぐため、システム不備時のみ自動返金対象とする規約を策定。' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-zinc-50 border border-brand-border space-y-0.5">
                        <span className="font-bold text-black block">{item.title}</span>
                        <p className="text-black/60 text-[11px] leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* ✉️ SUBTAB 5: 連絡先開示モデル移行検討備忘録                 */}
          {/* ======================================================== */}
          {activeSubTab === 'closed_chat_transition' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <span className="text-xl">✉️</span>
                  <h4 className="text-sm font-bold text-black">連絡先開示（引き渡し）モデル移行の背景とメリット</h4>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-black/70">
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-1.5">
                    <span className="font-bold text-teal-950 block">法的・運営リスクの劇的軽減</span>
                    <p>
                      アプリ内で継続的な1対1クローズドチャットを提供し続ける場合、「インターネット異性紹介事業」該当懸念や「24時間メッセージ監視・検閲義務」が発生します。想い出の照合後に安全に連絡先（SNS ID / メール）を引き渡してプラットフォームの役割を完結させることで、安全防衛と法令適合を両立させています。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-1.5">
                    <span className="font-bold text-black block">再会成立フローの洗練</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2.5 rounded-xl bg-white border border-brand-border">
                        <span className="text-black/40 block text-[10px]">STEP 1</span>
                        <b>想い出クイズ正解</b>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-brand-border">
                        <span className="text-black/40 block text-[10px]">STEP 2</span>
                        <b>600円 Stripe決済</b>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-brand-border">
                        <span className="text-black/40 block text-[10px]">STEP 3</span>
                        <b>eKYC ＋ SMS認証</b>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-brand-border text-emerald-800">
                        <span className="text-black/40 block text-[10px]">STEP 4</span>
                        <b>連絡先開示 ＆ 完結</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 📝 SUBTAB 6: 編集可能・自由記述メモボード                   */}
          {/* ======================================================== */}
          {activeSubTab === 'scratchpad' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-black">運営者 自由記述メモボード</h4>
                  <p className="text-xs text-black/60">ブラウザのLocalStorageに保存され、自由に追記・修正できます。</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetMemo}
                    className="px-3 py-1.5 rounded-xl border border-brand-border text-xs font-bold bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    最新テンプレートに戻す
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMemo}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all cursor-pointer shadow-sm"
                  >
                    {memoSaved ? '✔ 保存完了！' : 'メモを安全に保存'}
                  </button>
                </div>
              </div>

              <textarea
                value={scratchpadMemo}
                onChange={(e) => setScratchpadMemo(e.target.value)}
                rows={14}
                className="w-full p-4 rounded-2xl bg-zinc-50 border border-brand-border text-xs sm:text-sm font-mono text-black leading-relaxed focus:bg-white focus:border-teal-600 focus:outline-none transition-all resize-y shadow-inner"
                placeholder="ここに自由な運営メモや覚書を記入してください..."
              />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMasterKnowledgeBase;
