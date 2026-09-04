import React, { useState, useEffect, useMemo } from 'react';
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
  FileCheck,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  PhoneCall
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
  // 3大メインビューモード: 備忘録・決定事項 / 実務書面ライブラリ / 行政届出ポートフォリオ
  const [viewMode, setViewMode] = useState<'master_memo' | 'templates' | 'legal_docs'>('master_memo');
  
  // サブタブ
  const [activeSubTab, setActiveSubTab] = useState<
    'deployment17' | 'auth_costs' | 'police_ekyc' | 'liability_contract' | 'closed_chat_transition' | 'scratchpad'
  >('deployment17');

  const [activeTemplateId, setActiveTemplateId] = useState<string>('tpl-police');

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

  // Emergency Incident Contacts State (stored in localStorage)
  const defaultEmergencyContacts = `【ReMEETs 運営緊急エスカレーション連絡網】
■ 1. 決済インフラ (Stripe Japan)
- 加盟店サポート窓口: https://support.stripe.com/
- 緊急不正利用・チャージバック通報窓口: priority-risk@stripe.com
- アカウントID: acct_1ReMEETsMasterLive

■ 2. eKYC本人確認 (TRUSTDOCK / LIQUID)
- テクニカルサポート: support@trustdock.io (平日 9:00〜18:00 / 緊急障害 24h)
- 専任営業担当: 株式会社TRUSTDOCK 営業推進部
- 障害通知ステータスページ: https://status.trustdock.io/

■ 3. 管轄警察署 (生活安全課・サイバー犯罪対策課)
- 管轄警察署: 警視庁 本所警察署 生活安全課 防犯係
- 電話番号: 03-3634-0110 (代表) / 内線 2612
- 捜査関係事項照会書 FAX送信用: 03-3634-0119 (※事前電話確認必須)

■ 4. インフラ・サーバー監視 (Google Cloud / Supabase)
- Google Cloud Support: https://console.cloud.google.com/support
- Supabase Status: https://status.supabase.com/
- 障害監視Slack通知チャンネル: #alert-production-critical`;

  const [emergencyContacts, setEmergencyContacts] = useState<string>(() => {
    try {
      return localStorage.getItem('remeets_emergency_contacts') || defaultEmergencyContacts;
    } catch {
      return defaultEmergencyContacts;
    }
  });
  const [contactsSaved, setContactsSaved] = useState(false);

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

  const handleSaveContacts = () => {
    try {
      localStorage.setItem('remeets_emergency_contacts', emergencyContacts);
      setContactsSaved(true);
      setTimeout(() => setContactsSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetContacts = () => {
    if (window.confirm('緊急連絡網を標準テンプレートに戻しますか？')) {
      setEmergencyContacts(defaultEmergencyContacts);
      try {
        localStorage.setItem('remeets_emergency_contacts', defaultEmergencyContacts);
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

  // 📄 実務用公式書面テンプレート集 (Official Templates Library)
  const officialTemplates = [
    {
      id: 'tpl-police',
      title: '🚔 捜査関係事項照会に対する回答書 (警察・公安提出用)',
      category: '刑事法務',
      badge: '刑訴法197条',
      description: '警察署長・検察官からの照会書に対する正式回答書の鑑文および開示ログ添付フォーマット',
      content: `令和〇年〇月〇日

〇〇警察署長 殿
（または 〇〇地方検察庁 検察官 殿）

東京都〇〇区〇〇 1-2-3
ReMEETs 運営事務局
個人情報取扱責任者: 〇〇 〇〇 (印)

捜査関係事項照会に対する回答書

拝啓
貴署より令和〇年〇月〇日付（照会番号: 第〇〇号）にて受領いたしました、刑事訴訟法第197条第2項に基づく捜査関係事項照会について、下記のとおり対象アカウントの登録情報および通信ログを開示・回答申し上げます。

敬具

記

1. 対象アカウント特定情報
・ユーザー識別ID: usr_8841920482
・登録表示ニックネーム: たかし
・連携SNSアカウント: LINE UID (U1234567890abcdef...) / Google Email (user@example.com)

2. 本人確認 (eKYC) 及び認証情報
・SMS認証携帯電話番号: 090-XXXX-XXXX (認証完了日時: 2026-08-20 14:22:10 JST)
・公的本人確認ステータス: APPROVED (TRUSTDOCK 照合コード: td_tx_998124)
・氏名（マスキング解除）: 〇〇 〇〇
・年齢区分: 18歳以上（成年確認済み）

3. 通信ログ及びアクセス証跡
・直近ログインIPアドレス: 203.0.113.45 (ホスト名: p113045-ipngnfx01.tokyo.ocn.ne.jp)
・アクセス日時: 2026-08-25 19:44:02 JST
・使用ブラウザ (User-Agent): Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)

4. 投函ボトルメール保全データ
・ボトルID: post_7741
・投函日時: 2026-08-21 10:15:30 JST
・AI安全防衛エンジン判定: ai_flagged = 1 (自動隔離・非公開化済み)
・原文抜粋: 【保全ログ別紙添付のとおり】

以上`
    },
    {
      id: 'tpl-tos-notice',
      title: '📢 利用規約・プライバシーポリシー改訂 重要告知文',
      category: '規約改訂',
      badge: '全ユーザー配信',
      description: 'SNS認証連携の本格導入および連絡先開示モデルへの移行に伴う全体配信アナウンス',
      content: `【重要】利用規約およびプライバシーポリシー改訂のお知らせ

いつも「ReMEETs 〜再会のボトルメール〜」をご利用いただき、誠にありがとうございます。

このたび、ユーザーの皆様により安心・安全かつ快適に想い出の再会をお届けするため、2026年8月15日付で利用規約およびプライバシーポリシーを改訂いたしました。

■ 主な改訂内容
1. SNSアカウント連携（LINE / Google）による安全な認証基盤の明文化
- パスワード不要で安全にログインできる仕組みを導入いたしました。
- アカウント乗っ取りやなりすましを防止するための規約条項を追加しました。

2. 連絡先開示（引き渡し）モデルへの明確化
- 想い出クイズ完全一致および本人確認（eKYC）完了後、安全にお相手へ連絡先をお渡しして役割を完結させる運用方針を明文化いたしました。

3. 個人情報の厳格なゼロ保持方針
- クレジットカード情報や運転免許証原本画像をWebサーバー上に一切保管しない安全設計をポリシーに明記いたしました。

改訂後の全文は、アプリ内フッターの「利用規約」「プライバシーポリシー」よりご確認いただけます。
今後とも ReMEETs をよろしくお願い申し上げます。

ReMEETs 運営事務局`
    },
    {
      id: 'tpl-refund-notice',
      title: '💳 決済エラー・SMS不達時の自動返金 ＆ お詫び通知',
      category: 'CS対応',
      badge: '自動返金',
      description: '通信障害やシステム不備による開通失敗時にユーザーへ送る自動返金とお詫び文面',
      content: `【ReMEETs】開通手数料（600円）のご返金手続き完了のお知らせ

ReMEETs をご利用いただき誠にありがとうございます。

お客様が手続きを行われました連絡先開通手数料（¥600）につきまして、通信エラー（またはSMS認証不達）が発生したため、決済のお取り消し（全額返金）処理を完了いたしました。

■ ご返金内容
・決済ID: {{stripe_payment_id}}
・ご返金額: ¥600 (税込)
・返金日時: {{refund_date}}
・返金方法: ご利用のクレジットカード会社経由でのご返金（または請求相殺）

※ご利用のカード会社の締め日により、明細への反映まで数日から数週間程度かかる場合がございます。

お客様にはご不便とご心配をおかけいたしましたことを、深くお詫び申し上げます。
ご不明な点がございましたら、本メールへのご返信またはお問い合わせ窓口よりお気軽にご連絡ください。

ReMEETs カスタマーサポート`
    },
    {
      id: 'tpl-legal-scheme',
      title: '⚖️ インターネット異性紹介事業 非該当性 法的説明書',
      category: '行政法務',
      badge: '警察・弁護士用',
      description: '警察署生活安全課や弁護士・行政書士へ提示する「出会い系規制法適用除外」の論理構成書',
      content: `ReMEETs サービススキーム及び出会い系サイト規制法非該当性に関する説明書

1. サービスの目的と基本構造
本サービス「ReMEETs」は、過去に面識のあった同級生、恩師、元同僚等の「既知の人物」との健全な再会・感謝の伝達を支援するプラットフォームです。

2. 出会い系サイト規制法（インターネット異性紹介事業）に非該当である理由
(1) 不特定多数の異性交際を斡旋しない
一般的なマッチングアプリと異なり、年齢・容姿・年収等による異性の検索・閲覧機能は一切存在しません。
(2) 二人だけの想い出クイズによる厳格な合意照合
手紙の閲覧および連絡先開示には、差出人と受取人のみが知る「想い出クイズ（共通記憶）」の完全一致が必須であり、見知らぬ第三者が偶然マッチングすることは不可能です。
(3) プラットフォーム内チャットの非提供（引き渡し完結型）
アプリ内で継続的なメッセージ交換（チャット）を提供せず、照合・本人確認後に連絡先を引き渡して終了するため、出会い系サイト規制法第2条第2号に定める「異性交際の機会を提供する役務」には該当いたしません。

3. 安全防衛体制
・Google Gemini AI によるストーカー・脅迫表現のリアルタイム自動隔離（ai_flagged = 1）
・公的本人確認（eKYC）およびSMS携帯電話番号認証の全件実施
・刑訴法197条照会に対するログ開示体制の完備`
    }
  ];

  // 全項目横断検索のフィルタリング
  const isMatchQuery = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // 17大チェックリストのエクスポート用テキスト生成
  const generateChecklistExportText = () => {
    let out = `【ReMEETs 本番デプロイ完了証明書 ＆ 17大チェックリスト】
`;
    out += `発行日時: ${new Date().toLocaleString('ja-JP')}
`;
    out += `進捗率: ${checklistPercent}% (${completedChecklistCount} / ${totalChecklistCount} 項目完了)

`;

    deploymentSections.forEach(sec => {
      out += `${sec.group}
`;
      sec.items.forEach(item => {
        const checked = checkedItems[item.id] ? ' [✔ 完了] ' : ' [　未完了] ';
        out += `${checked}${item.title}
    詳細: ${item.desc}
`;
      });
      out += `
`;
    });

    out += `
署名: ReMEETs 本番運用統括責任者 ____________________ (印)
`;
    return out;
  };

  return (
    <div id="master-knowledge-base-block" className="bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-8 font-sans">
      {/* 🧭 Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-900 rounded-full text-xs font-bold mb-2 border border-teal-200">
            <BookOpen size={14} />
            <span>ReMEETs 統合マスター備忘録 ＆ 運営ライブラリセンター</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-black flex items-center gap-2">
            <span>マスター備忘録 ＆ 運営ライブラリ</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              公式完全集約版
            </span>
          </h3>
          <p className="text-xs text-black/60 mt-1">
            本番デプロイ手順、警察照会基準、責任の所在、公式書面テンプレート、緊急エスカレーション連絡網を1箇所に完全統合しました。
          </p>
        </div>

        {/* 3-Mode View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-brand-border/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('master_memo')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'master_memo' ? 'bg-white text-black shadow-xs font-bold' : 'text-black/60 hover:text-black'
              }`}
            >
              📚 決定事項集
            </button>
            <button
              type="button"
              onClick={() => setViewMode('templates')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'templates' ? 'bg-white text-teal-950 shadow-xs font-bold' : 'text-black/60 hover:text-black'
              }`}
            >
              📄 実務書面ライブラリ
            </button>
            <button
              type="button"
              onClick={() => setViewMode('legal_docs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'legal_docs' ? 'bg-white text-teal-950 shadow-xs font-bold' : 'text-black/60 hover:text-black'
              }`}
            >
              🏛️ 行政届出ポートフォリオ
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

      {/* 🔍 Universal Search Bar (全項目リアルタイム横断検索) */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="備忘録・決定事項・書面テンプレートを横断検索... (例: 197条, 返金, eKYC, 免責, LINE, 366円)"
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-brand-border rounded-2xl text-xs text-black focus:bg-white focus:border-teal-600 focus:outline-none transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40 hover:text-black"
          >
            クリア
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 📄 VIEW MODE 2: 実務用公式書面テンプレート集 ＆ 緊急連絡網 (新設ライブラリ) */}
      {/* ========================================================================= */}
      {viewMode === 'templates' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Template Selector Left Sidebar */}
            <div className="lg:col-span-4 bg-zinc-50/80 rounded-2xl p-4 border border-brand-border space-y-2">
              <h4 className="font-bold text-xs text-black px-2 mb-2 flex items-center gap-1.5">
                <FileCheck size={15} className="text-teal-700" />
                <span>公式書面テンプレート一覧</span>
              </h4>
              {officialTemplates.map((tpl) => {
                const isSelected = activeTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setActiveTemplateId(tpl.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-white border-teal-600 shadow-sm ring-1 ring-teal-500/20'
                        : 'bg-transparent border-transparent hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded">
                        {tpl.badge}
                      </span>
                      <span className="text-[10px] text-black/50">{tpl.category}</span>
                    </div>
                    <span className="font-bold text-xs text-black line-clamp-1">{tpl.title}</span>
                    <p className="text-[11px] text-black/60 line-clamp-1">{tpl.description}</p>
                  </button>
                );
              })}

              {/* Emergency Contacts Button in Sidebar */}
              <div className="pt-3 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setActiveTemplateId('emergency-contacts')}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                    activeTemplateId === 'emergency-contacts'
                      ? 'bg-rose-50 border-rose-500 shadow-sm text-rose-950'
                      : 'bg-zinc-100/80 border-transparent hover:bg-zinc-200/60 text-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                      緊急時対応
                    </span>
                    <span className="text-[10px] text-rose-800">SOP</span>
                  </div>
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <PhoneCall size={13} className="text-rose-600" />
                    <span>🚨 緊急エスカレーション連絡網</span>
                  </span>
                  <p className="text-[11px] text-black/60 line-clamp-1">Stripe / eKYC / 警察署の緊急窓口</p>
                </button>
              </div>
            </div>

            {/* Template Content Right Area */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-brand-border shadow-sm space-y-4">
              {activeTemplateId === 'emergency-contacts' ? (
                /* Emergency Contacts Editor */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-black flex items-center gap-2">
                        <PhoneCall size={16} className="text-rose-600" />
                        <span>🚨 緊急エスカレーション連絡網 (Incident Contacts)</span>
                      </h4>
                      <p className="text-xs text-black/60">重大障害・不正利用・警察照会時の連絡窓口（編集・保存可能）</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetContacts}
                        className="px-3 py-1.5 rounded-xl border border-brand-border text-xs font-bold bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer"
                      >
                        標準に戻す
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveContacts}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all cursor-pointer shadow-sm"
                      >
                        {contactsSaved ? '✔ 保存完了！' : '連絡網を保存'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={emergencyContacts}
                    onChange={(e) => setEmergencyContacts(e.target.value)}
                    rows={13}
                    className="w-full p-4 rounded-xl bg-zinc-50 border border-brand-border text-xs font-mono text-black leading-relaxed focus:bg-white focus:border-teal-600 focus:outline-none transition-all resize-y shadow-inner"
                  />
                </div>
              ) : (
                /* Formal Document Template Viewer */
                (() => {
                  const tpl = officialTemplates.find(t => t.id === activeTemplateId) || officialTemplates[0];
                  return (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded">
                              {tpl.badge}
                            </span>
                            <h4 className="font-bold text-sm text-black">{tpl.title}</h4>
                          </div>
                          <p className="text-xs text-black/60 mt-0.5">{tpl.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(tpl.content, tpl.id)}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition-all cursor-pointer self-start sm:self-auto"
                        >
                          {copiedSection === tpl.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedSection === tpl.id ? 'コピー完了！' : 'テンプレートをコピー'}</span>
                        </button>
                      </div>

                      <div className="relative">
                        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-teal-700 max-h-[480px] overflow-y-auto">
                          {tpl.content}
                        </pre>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 🏛️ VIEW MODE 3: 行政届出・法務ポートフォリオ                                */}
      {/* ========================================================================= */}
      {viewMode === 'legal_docs' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <AdminDeploymentGuideBlock docType={guideDocType} setDocType={setGuideDocType} />
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 📚 VIEW MODE 1: Master Knowledge Base (Memos & Decisions)                 */}
      {/* ========================================================================= */}
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
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generateChecklistExportText(), 'checklist_export')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-teal-100 text-teal-900 border border-teal-200 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedSection === 'checklist_export' ? <Check size={13} className="text-emerald-600" /> : <Download size={13} />}
                    <span>証明書出力</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {deploymentSections.map((sec, idx) => {
                  const filteredItems = sec.items.filter(item => 
                    isMatchQuery(item.title) || isMatchQuery(item.desc) || isMatchQuery(sec.group)
                  );
                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={idx} className="bg-zinc-50/60 p-5 rounded-3xl border border-brand-border space-y-3">
                      <h5 className="text-xs font-bold text-black uppercase tracking-wider">{sec.group}</h5>
                      <div className="space-y-2">
                        {filteredItems.map((item) => {
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
                  );
                })}
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
