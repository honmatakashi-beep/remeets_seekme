import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Search, X, Check, RefreshCw, Download, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

interface DeploymentChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'deploy' | 'operation';
}

export const DeploymentChecklistModal: React.FC<DeploymentChecklistModalProps> = ({
  isOpen,
  onClose,
  activeTab: initialActiveTab = 'deploy',
}) => {
  const [showChecklistModal, setShowChecklistModal] = React.useState<boolean>(isOpen);
  const [activeChecklistTab, setActiveChecklistTab] = React.useState<'deploy' | 'operation'>(initialActiveTab);

  React.useEffect(() => {
    setShowChecklistModal(isOpen);
  }, [isOpen]);

  React.useEffect(() => {
    if (initialActiveTab) {
      setActiveChecklistTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  const handleClose = () => {
    setShowChecklistModal(false);
    onClose();
  };


  React.useEffect(() => {
    if (showChecklistModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showChecklistModal]);

  const [checklistItems, setChecklistItems] = React.useState<any[]>(() => {
    const defaultItems = [
      { id: 1, category: "インフラ・DB", title: "本番用マネージドRDBMS (PostgreSQL / Cloud SQL) のプロビジョニング", description: "SQLiteからSupabaseまたはGoogle Cloud SQL (PostgreSQL) の本番用高可用性インスタンスを作成し、接続準備を整えます。", completed: false, date: "", notes: "" },
      { id: 2, category: "インフラ・DB", title: "DATABASE_URL 環境変数のサーバーシークレット設定", description: "パスワードを含むDB接続文字列をCloud Run等のサーバー環境変数に安全なシークレットとして設定します。", completed: false, date: "", notes: "" },
      { id: 3, category: "インフラ・DB", title: "データベース初期テーブルスキーマのマイグレーション実行", description: "Drizzle ORM等を使用し、本番の空DBに対してテーブル構造、インデックス、外部キー制約を一括適用します。", completed: false, date: "", notes: "" },
      { id: 4, category: "インフラ・DB", title: "本番独自ドメインの常時SSL/TLS証明書（HTTPS）およびHSTS設定", description: "OAuthログインやStripe決済の安全性・完全性を担保するため、ドメイン全域での常時暗号化通信を強制します。", completed: false, date: "", notes: "" },
      { id: 5, category: "インフラ・DB", title: "DB自動デイリーバックアップ＆世代管理の有効化", description: "万が一のデータ破損や攻撃に備え、自動デイリースナップショット（保持期間7〜14日間）を有効化します。", completed: false, date: "", notes: "" },
      { id: 6, category: "APIキー設定", title: "Google AI Studio / Vertex AI (Gemini API) 商用本番キーの発行", description: "クレジットカードを登録し従量課金を有効化した本番専用の GEMINI_API_KEY を環境変数に設定します。", completed: false, date: "", notes: "" },
      { id: 7, category: "APIキー設定", title: "Resend / SendGrid (メール配信API) の本番接続＆DNS設定", description: "独自ドメインのSPF/DKIM/DMARC設定を完了し、送信到達率を100%近くまで高めた配信APIキーをセットアップします。", completed: false, date: "", notes: "" },
      { id: 8, category: "APIキー設定", title: "SMS認証プロバイダー（Twilio / EZSMS等）の本番キー＆送信元設定", description: "なりすまし防止・二重登録防止のためのSMS携帯電話番号認証（従量課金）の本番APIキーと発信元番号を設定します。", completed: false, date: "", notes: "" },
      { id: 9, category: "APIキー設定", title: "Stripe (決済代行インフラ) 本番キーの契約とWebhook署名設定", description: "Stripe本番加盟店審査を完了し、STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET を安全に設定します。", completed: false, date: "", notes: "" },
      { id: 10, category: "データ管理", title: "開発用テストデータの完全クリーンアップ (初期化) 実行", description: "管理画面のクリーンアップ機能を使用し、開発期間中に蓄積された不要なテストデータを物理消去します。", completed: false, date: "", notes: "" },
      { id: 11, category: "データ管理", title: "情緒豊かな本番サンプルデータの一括自動生成 (Seeding)", description: "ローンチ直後の過疎感を防ぐため、実在感のある日本の想い出ボトルメールや感謝レターを一括投入します。", completed: false, date: "", notes: "" },
      { id: 12, category: "SNS連携", title: "LINE / Google Developers コンソールでの本番クライアント作成", description: "本番ドメインのログインリダイレクトURIやブランド名、プライバシーポリシーURLを各開発者ポータルに登録します。", completed: false, date: "", notes: "" },
      { id: 13, category: "SNS連携", title: "LINE_CHANNEL_SECRET / GOOGLE_CLIENT_SECRET の環境変数追記", description: "安全なSNS認証（OAuth）を行うため、各クライアントIDと秘密鍵を本番サーバー環境変数に設定します。", completed: false, date: "", notes: "" },
      { id: 14, category: "法務・規約", title: "利用規約（TOS）のSNS連携・連絡先引き渡しモデル改訂", description: "連絡先安全引き渡し（セキュア・ブリッジ）モデル、使い捨てアカウント禁止条項を明文化します。", completed: false, date: "", notes: "" },
      { id: 15, category: "法務・規約", title: "プライバシーポリシー（PP）のOAuth取得データ明記・改訂", description: "SNSログインで取得するプロファイル情報およびeKYC身分証データの安全な管理体制を開示します。", completed: false, date: "", notes: "" },
      { id: 16, category: "法務・規約", title: "特定商取引法に基づく表記の整備（住所・電話番号対策）", description: "バーチャルオフィス住所・050電話番号を契約し、販売価格（600円〜1,200円）や返金規定を特定商取引法ページに記載します。", completed: false, date: "", notes: "" },
      { id: 17, category: "法務・規約", title: "全法的文書（規約・PP・ガイドライン・特商法）の【制定日・施行日】確定", description: "利用規約、PP、ガイドライン、特商法表記の制定日・施行日を正式サービス提供開始日（2026年8月15日）に一括整合します。", completed: true, date: "2026-08-15", notes: "2026年8月15日に全文書の制定日・施行日を正式反映完了済" },
      { id: 18, category: "セキュリティ", title: "スロットリング型動的APIアクセスレート制限のポリシー設定", description: "DoS攻撃やクイズの総当たり自動回答スパムを防ぐため、秒間API制限しきい値を調整・固定します。", completed: false, date: "", notes: "" },
      { id: 19, category: "最終テスト", title: "公的 eKYC・SMS認証・電子的宣誓・Stripeテスト決済の総合疎通テスト", description: "お相手との想い出照合・連絡先開示手数料決済、SMS認証、電子的利用宣誓同意、本人確認書類提出が連動して正常動作するか最終検証します。", completed: false, date: "", notes: "" },
    ];

    try {
      const saved = localStorage.getItem('remeets_deploy_checklist_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = defaultItems.map(defItem => {
            const savedItem = parsed.find((p: any) => p.id === defItem.id);
            if (savedItem) {
              return {
                ...defItem,
                completed: !!savedItem.completed,
                date: savedItem.date || "",
                notes: savedItem.notes || ""
              };
            }
            return defItem;
          });
          localStorage.setItem('remeets_deploy_checklist_progress', JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.warn('localStorage read or auto-migration failed:', e);
    }
    return defaultItems;
  });

  const [operationChecklistItems, setOperationChecklistItems] = React.useState<any[]>(() => {
    const defaultOps = [
      { id: 1, category: "1. 登録・認証・ログイン", title: "新規登録・入力バリデーション＆パスワードリセット検証", description: "パスワード強度チェック、重複メールアドレス登録時の適切なエラー表示、およびパスワード再設定フローが機能するか検証します。", completed: false, date: "", notes: "" },
      { id: 2, category: "1. 登録・認証・ログイン", title: "LINE / Google OAuthログイン連携テスト", description: "本番ドメインでLINE/Googleログインが正常に起動し、ユーザープロファイル（ニックネーム、画像、メールアドレス）が取得できるか検証します。", completed: false, date: "", notes: "" },
      { id: 3, category: "1. 登録・認証・ログイン", title: "利用規約同意・18歳以上確認＆セッション維持テスト", description: "初回登録時の利用規約・PP同意と18歳以上確認が必須化され、ブラウザリロード後もセッションが維持されるか検証します。", completed: false, date: "", notes: "" },
      { id: 4, category: "2. 手紙投函・AI検閲", title: "ボトル（手紙）新規作成・秘密の想い出クイズ登録テスト", description: "宛名、ゆかりの地、手紙本文、想い出クイズ（質問・正解・表記ゆれ別解）が破損なくDBに保存・投函されるか検証します。", completed: false, date: "", notes: "" },
      { id: 5, category: "2. 手紙投函・AI検閲", title: "フルネーム判定（常用姓名辞書）ガード検証", description: "プロフィールや手紙内に日本の常用姓名辞書に基づくフルネーム（実名）を入力した際、検閲警告・ブロックされるか検証します。", completed: false, date: "", notes: "" },
      { id: 6, category: "2. 手紙投函・AI検閲", title: "AI自動検閲（誹謗中傷・個人情報・脅迫）フィルターテスト", description: "手紙本文に脅迫・暴言や直接の連絡先（電話番号、他SNS ID）を入力し、AIモデレーションが自動で隔離・警告するか検証します。", completed: false, date: "", notes: "" },
      { id: 7, category: "3. 検索・秘匿性", title: "キーワード検索・年代地域フィルター＆本文マスキング検証", description: "お名前や都道府県で検索し、該当手紙がヒットすること、およびクイズ未正解の段階で本文・連絡先が完全に秘匿されているか検証します。", completed: false, date: "", notes: "" },
      { id: 8, category: "4. クイズ照合・本人認証", title: "想い出クイズ完全一致判定 ＆ 表記ゆれ救済テスト", description: "質問に完全正解（または登録された表記ゆれ別解）を入力した際、即座に想い出一致（照合成功）画面へ遷移するか検証します。", completed: false, date: "", notes: "" },
      { id: 9, category: "4. クイズ照合・本人認証", title: "クイズ不正解時の安全遮断 ＆ ブルートフォース制限テスト", description: "誤答時に本文が絶対に開示されないこと、および連続誤答時に一時ロックアウト（レート制限）がかかるか検証します。", completed: false, date: "", notes: "" },
      { id: 10, category: "5. SMS・eKYC・宣誓", title: "SMS認証コード実機送信・6桁照合・1日3回制限テスト", description: "実機スマホへSMS認証コードが即時届き、6桁入力で認証が通ること、およびいたずら防止レート制限（1日最大3回）が作動するか検証します。", completed: false, date: "", notes: "" },
      { id: 11, category: "5. SMS・eKYC・宣誓", title: "公的証明書（免許証/マイナンバー）アップロード＆eKYC審査テスト", description: "身分証画像が安全にアップロードされ、審査合否ステータスおよび公的認証バッジが正しく更新されるか検証します。", completed: false, date: "", notes: "" },
      { id: 12, category: "5. SMS・eKYC・宣誓", title: "電子的利用宣誓（法令遵守・ストーカー禁止）合意テスト", description: "連絡先開示前の誓約確認画面で、利用宣誓チェック項目への明示的同意が必須化され、合意タイムスタンプ・IPログが安全保存されるか検証します。", completed: false, date: "", notes: "" },
      { id: 13, category: "6. 決済・連絡先開示", title: "Stripe本番決済（開通手数料600円〜1,200円）疎通テスト", description: "開通ボタン押下時にStripe決済画面が起動し、クレジットカード決済が遅延なく正常に完了するか検証します。", completed: false, date: "", notes: "" },
      { id: 14, category: "6. 決済・連絡先開示", title: "決済完了後の即時連絡先開示（双方向引き渡し完結）検証", description: "決済完了直後にお手紙全文と相手の優先開示連絡先（LINE ID等）が表示され、安全な連絡先引き渡しをもって完結するか検証します。", completed: false, date: "", notes: "" },
      { id: 15, category: "6. 決済・連絡先開示", title: "eKYC審査不合格時のStripe自動返金（仮売上取消）テスト", description: "本人確認審査で不合格となった場合、Stripeで仮決済された手数料が自動的かつ即座にオーソリ取消・返金されるか検証します。", completed: false, date: "", notes: "" },
      { id: 16, category: "7. マイページ・手紙管理", title: "優先開示連絡先の設定・投函ボトル回収（削除）テスト", description: "自身のLINE ID等の更新保存、および投函ボトルの回収（完全消去）時に検索結果から即時非表示となるか検証します。", completed: false, date: "", notes: "" },
      { id: 17, category: "8. 管理者・問い合わせ・警察", title: "お問い合わせ・通報チケット送受信 ＆ Gemini AI返信ドラフト生成テスト", description: "ユーザーのお問い合わせがチケットDBに安全に記録され、管理画面でGemini AIによるコンプライアンス返信ドラフトが自動生成されるか検証します。", completed: false, date: "", notes: "" },
      { id: 18, category: "8. 管理者・問い合わせ・警察", title: "管理者ダッシュボードKPI・AI通報ログ＆ユーザー緊急凍結検証", description: "統計メトリクス表示、AI検閲通報ログのリアルタイム確認、問題ユーザーのワンクリックBAN機能が正常動作するか検証します。", completed: false, date: "", notes: "" },
      { id: 19, category: "8. 管理者・問い合わせ・警察", title: "警察提出用・電子的宣誓同意ログ付き監査CSVエクスポートテスト", description: "司法捜査機関からの開示要請を想定し、電子的宣誓同意ログおよび認証イベント履歴を含んだ監査CSVが出力できるか検証します。", completed: false, date: "", notes: "" },
      { id: 20, category: "9. レスポンシブ表示", title: "スマートフォン実機表示 (iOS Safari / Android Chrome) 検証", description: "iPhone/Androidの実機幅で横スクロールや文字欠けが発生せず、タップターゲット（44px以上）が押しやすいか検証します。", completed: false, date: "", notes: "" },
      { id: 21, category: "10. セキュリティ・異常系", title: "未ログイン時ガード・他者ボトル不正編集遮断テスト", description: "ログイン必須ページへの未認証アクセス制限、およびURL直打ちによる他者ボトル不正操作が確実に403拒否されるか検証します。", completed: false, date: "", notes: "" },
      { id: 22, category: "10. セキュリティ・異常系", title: "回収済みボトルアクセス遮断＆APIレート制限（DoS防御）テスト", description: "削除済みボトルの安全遮断案内表示、および短時間の大量リクエストに対する429 Too Many Requests防御を検証します。", completed: false, date: "", notes: "" }
    ];

    try {
      const saved = localStorage.getItem('remeets_ops_checklist_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = defaultOps.map(defItem => {
            const savedItem = parsed.find((p: any) => p.id === defItem.id);
            if (savedItem) {
              return {
                ...defItem,
                completed: !!savedItem.completed,
                date: savedItem.date || "",
                notes: savedItem.notes || ""
              };
            }
            return defItem;
          });
          localStorage.setItem('remeets_ops_checklist_progress', JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.warn('localStorage read or auto-migration failed for ops checklist:', e);
    }
    return defaultOps;
  });

  const handleToggleChecklistItem = (id: number) => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    const updated = list.map(item => {
      if (item.id === id) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          date: nextCompleted && !item.date ? new Date().toISOString().split('T')[0] : item.date
        };
      }
      return item;
    });
    setList(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  };

  const handleUpdateChecklistDate = (id: number, date: string) => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, date };
      }
      return item;
    });
    setList(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  };

  const handleUpdateChecklistNotes = (id: number, notes: string) => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    });
    setList(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  };

  const handleResetChecklist = () => {
    const isOps = activeChecklistTab === 'operation';
    const list = isOps ? operationChecklistItems : checklistItems;
    const setList = isOps ? setOperationChecklistItems : setChecklistItems;
    const key = isOps ? 'remeets_ops_checklist_progress' : 'remeets_deploy_checklist_progress';

    if (window.confirm('チェックリストの進捗状況をすべてリセットしてもよろしいですか？')) {
      const reset = list.map(item => ({ ...item, completed: false, date: "", notes: "" }));
      setList(reset);
      try {
        localStorage.setItem(key, JSON.stringify(reset));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    }
  };

  const [markdown, setMarkdown] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [activeSlideIdx, setActiveSlideIdx] = React.useState<number>(0);
  const [slides, setSlides] = React.useState<any[]>([
    {
      id: 1,
      title: "ReMEETs (再会のボトルメール)\n「思い出」で再び繋がる、全く新しい安全な再会プラットフォーム",
      subtitle: "既存の出会い系アプリの有害性と危険性を100%排除。想い出クイズゲートと最新AIモデレーションによる『特定面識者限定』クローズドコミュニティの全体像とコンプライアンス実証\n発表者：ReMEETs 運営セキュリティ安全対策部",
      category: "サービス提案書（表紙）",
      points: [],
      layout: 'title'
    },
    {
      id: 2,
      title: "サービス名：ReMEETs（リミーツ）の由来",
      category: "1. サービス概要",
      layout: 'content',
      points: [
        "「Re-meet（再び出会う、再会する）」の複数形であり、過去の特別な時間や場所を一度でも共有したことのある「想い出の知人」との巡り合わせを表しています。",
        "見知らぬ人同士が新たにマッチして「異性交際」等を行う一般的なマッチングサービス（Meet）とは完全に定義が異なります。",
        "過去の知人同士が時間を超えて安全に再び再会すること（Re-meet）にのみ特化したサービス名です。"
      ]
    },
    {
      id: 3,
      title: "サービスコンセプト：『想い出が結ぶ、安全で静かな関係再構築の海』",
      category: "2. コンセプト",
      layout: 'content',
      points: [
        "物理的距離や年月の経過、不慮の災害や引越し等により連絡が取れなくなってしまった大切な人々へ、「手紙（ボトルメール）」をネットの海へ投函するシステムです。",
        "SNSや掲示板のようにプロファイルや内容を大々的に誰にでも公開・拡散するのではなく、検索をあてた当事者だけがアクセスできる「静謐」なプライベート感覚を重視。",
        "届く相手は「かつての面識者（お互い思い出に心当たりのある人）」に完全に限定された、心温まるクローズドな関係再結合スペースです。"
      ]
    },
    {
      id: 4,
      title: "構築・運営の目的：失われた人間関係の再結合によるウェルビーイング向上",
      category: "3. 構築の目的",
      layout: 'content',
      points: [
        "現代日本における社会的課題である「若者・中高年層の孤独死」「地域社会の崩壊」「震災、被災等に伴う知人・隣人ネットワークの断絶」を解決するために構築されました。",
        "新規の無差別出会いに伴う犯罪誘発（ストーカー、未成年売春等）をシステムレベルで徹底排除しつつ、かつて信頼関係のあった貴重な縁だけを結び戻します。",
        "良質な人間関係アセットの修復による社会的精神不安の解消と、健康で豊かな長寿社会への貢献を目指します。"
      ]
    },
    {
      id: 5,
      title: "ターゲットユーザー：無差別の『新たな出会い』を求めない、純粋な再会希望者",
      category: "4. ターゲットユーザー",
      layout: 'content',
      points: [
        "卒業、引越し、転職、定年退職などをきっかけに連絡先が途絶えてしまった「同窓生」「元同期・元同僚」「かつての恩師」を探したい人々。",
        "震災などの自然災害で避難・移動を余儀なくされ、連絡を取る手段を失った「元隣人」「幼馴染」。",
        "事件や他者によるプライバシー侵害を著しく恐れ、かつ他SNS（実名公開による露出）は使いこなせない、または使いたくないと考えるセキュリティ・プライバシー意識の高いユーザー層。"
      ]
    },
    {
      id: 6,
      title: "主要機能（フロント部①）- ボトルメールの投函 ＆ 漂流",
      category: "5. 主要機能（フロントエンド）",
      layout: 'content',
      points: [
        "「ボトル投函」：投函者が、思い出の日付・場所・特徴やあだ名等の「共有手がかり」を詳しく文章に綴って、海のアーカイブに流すインタフェースです。",
        "「ボトルの漂流（閲覧）」：思い出キーワードや年代、漂流地域から誰でも流れているボトルメール（の概要のみ）を検索・発見することができます。",
        "「プライベート優先設計」：相手の実名は一切公開されず、あくまで『思い出のエピソードそのもの』をヒントに、お互いが「もしや自分ではないか？」と気づく動線です。"
      ]
    },
    {
      id: 7,
      title: "主要機能（フロント部②）- 最も根幹をなす『想い出クイズゲート』＆ 表記ゆれ救済",
      category: "5. 主要機能（フロントエンド）",
      layout: 'content',
      points: [
        "ボトルを発見したユーザーが、メッセージを読み進めて「開通」を望む場合、投函者自身が設定した『想い出クイズ』に回答する必要があります。",
        "クイズ例：「私たちの卒業式の次の日に、一緒に行った海で食べたアイスの味は？」「高橋先生が部活の金賞祝いで奢ってくれたのは何アイス？」など、当事者2人以外は一生知り得ない超独自のクエスチョン。",
        "クイズの完全な正答一致（文字列一致）のみが開示の唯一絶対条件であり、これにより「見知らぬ人、無関係な第三者」をハードウェア構造レベルで完全に遮断。さらに日本語正規化（normalizeJapanese）とレーベンシュタイン距離による表記ゆれ救済により、正当な当事者同士の再会を強力に支援します。"
      ]
    },
    {
      id: 8,
      title: "主要機能（フロント部③）- 連絡先安全引き渡し（セキュア・ブリッジ）モデル",
      category: "5. 主要機能（フロントエンド）",
      layout: 'content',
      points: [
        "「厳格な合意ベース開通」：投函者・受取人双方が「想い出クイズ」に100%完全合致し、公的本人確認（eKYC）と開通手続き（600円）が完了した段階でのみ、双方が希望する連絡先（LINE ID, メールアドレス等）を安全に相互開示・引き渡し（ブリッジ）します。",
        "「連絡先安全引き渡し完結型モデル」：想い出の照合と本人確認完了後に合意された連絡先（LINE ID等）を安全に引き渡してプラットフォームの役割を完結させるクリーン設計を採用。不特定多数との無差別なやり取りやトラブル・犯罪リスクをシステム構造上ゼロにします。",
        "「24時間常設の緊急ブロック・通報機能」：連絡先引き渡し後も、万が一お相手の言動にしつこさや不審を感じた場合には、常設された「通報・削除申請」「緊急ブロック」により、1タップで即座に遮断・運営通報が可能です。"
      ]
    },
    {
      id: 9,
      title: "管理・運用機能（バック部①）- セキュリティ・オペレーション・ダッシュボード",
      category: "6. 管理・運用機能（バックエンド）",
      layout: 'content',
      points: [
        "「不正利用者の検知」：システム管理者は、異常なスピードでのクイズ回答試行、不当ワードの連続試行などの兆候を、リアルタイムセキュリティパネルで24時間監視可能です。",
        "「行動トラッキング・不審検知」：同一IP（同一接続元）から異なる複数のボトルに対して回答を行おうとするなど、『総当たり回答攻撃（アビューズ）』を自動で抽出します。",
        "「フォレンジックロギング」：管理者がシステム監査をワンクリックで行え、不正検知の痕跡データベースを完全なコンプライアンス水準で保持します。"
      ]
    },
    {
      id: 10,
      title: "管理・運用機能（バック部②）- シャドウ・フラグ ＆ 隔離モデレーション",
      category: "6. 管理・運用機能（バックエンド）",
      layout: 'content',
      points: [
        "「Gemini AI バックエンド連動」：投函された手紙や送信メッセージは、すべてバックエンドよりGemini AI安全フィルターへ自働転送され、執着や罵倒などの不穏テキストを意味解析します。",
        "「擬態送信（シャドウフラグ）」：不当である（ストーキング目的の隠れた接近）と検知された場合、送信者にはエラーを出さず送信成功のように見せかけながら、データベース上で隔離（一般公開フラグを即時0に設定）。",
        "嫌がらせの回答者や攻撃者は「システムに拒否されていること（検知方法）」に気づかないまま不活性化されるため、別口座からの執拗な再アタックを劇的に無力化します。"
      ]
    },
    {
      id: 11,
      title: "非機能要件①：最高レベルのセキュリティ ＆ データ暗号化",
      category: "7. 非機能部品（品質および安全性）",
      layout: 'content',
      points: [
        "「通信保護」：インターネット上で送受信される全てのデータ、個人情報、およびメッセージ内容は業界標準のTLS1.3によって高度に暗号化保護されています。",
        "「DBハッシュ」：クイズの解答やパスワード、並びにユーザー情報は、管理者であっても生テキストを直接読み解けないセキュアソルトハッシュを施して格納します。",
        "「アクセスコントロール」：本番DBやログサーバーへのアクセスは、最小特権の原則に基づき、運営事務局の最上位安全管理者のみに強固な認証制限を設けて承認付与されます。"
      ]
    },
    {
      id: 12,
      title: "非機能要件②：迅速・完全なオプトアウト（削除・完全消去申請）",
      category: "7. 非機能部品（品質および安全性）",
      layout: 'content',
      points: [
        "「物理オプトアウト、即時消去」：プライバシーと個人の「忘れられる権利」を守るため、誰でも簡単に削除申請ができる『個人情報のオプトアウト受付窓口』をフッター等に常設しています。",
        "「24時間以内緊急対応」：特定の第三者による勝手な想い出の晒しや、誹謗中傷、本人の意に沿わない掲載に対しては、運営セキュリティ常駐監査会が通常24時間以内に文面の検証を行い、速やかに物理消去・遮断を行います。",
        "「匿名保護と説明責任」：申請自体は匿名などで行える一方、申請乱用防止のため、申請時 of IPアドレス等の監査情報を安全かつ極秘に保持します。"
      ]
    },
    {
      id: 13,
      title: "システム構成（アーキテクチャ定義）：堅牢なフルスタックセーフティ設計",
      category: "8. システム構成",
      layout: 'content',
      points: [
        "『フロントエンド』：React 18 + Vite + Tailwind CSS を採用し、直感的なUXと、一切の無駄を削ぎ落とした軽量・高速なセキュリティインターフェースを両立します。",
        "『バックエンドサーバー』：Express（Node.jsベース）によるフルスタックAPIを構築。クライアント側へ生のDB構造や機密変数（API Key等）を絶対に開示・露出させない強固なプロキシサーバー構造。",
        "『データベース ＆ 外部AI』：本番用 Firebase Firestore / Auth（およびローカル検証用SQLite）、ならびに Googleの最先端大規模言語モデル「Gemini API (Google GenAI)」を活用した自律型セマンティック防衛エンジン。"
      ]
    },
    {
      id: 14,
      title: "「新奇の出会い（マッチング）」との構造的な対比分析",
      category: "9. 安全設計適合性の総括",
      layout: 'content',
      points: [
        "「一般のマッチングアプリ」：面識のない、完全に未知の男女を無理に巡り会わせるため、意図的な身元詐称、ストーキング、売春、なりすまし犯罪が根絶できません。",
        "「ReMEETsプラットフォーム」：すでに「過去に強固な面識・共有記憶」を持っていた人同士のみが、その『超ニッチなクイズの完全正答』をお互いの秘密鍵として巡り会う仕組み。",
        "これにより、見知らぬ無関係の人間がアタック、なりすまし、もしくは密接犯罪を起こす確率を構造的かつ数学的に「0%」へと極限抑制することに成功しています。"
      ]
    },
    {
      id: 15,
      title: "【警察庁・公安委員会・監査向け追加資料】\n安全設計適合状況 ＆ 法規厳格遵守に関する要件定義",
      subtitle: "後半パート：監査対応義務、および出会い系法規適合評価における「異性紹介事業非該当」の客観的かつシステム的法理証明\nReMEETs 治安・防衛コンプライアンス管理事務局",
      category: "監査追加資料：扉（ここから後半）",
      points: [],
      layout: 'title'
    },
    {
      id: 16,
      title: "「インターネット異性紹介事業」に【完全非該当】であるシステム的証明",
      category: "リーガル・コンプライアンス（法規適合判定）",
      layout: 'content',
      points: [
        "出会い系サイト規制法第二条における定義は「面識のない異性との交際を仲介・促進するサービス」を行っている事業者と定められています。",
        "ReMEETsは前述の通り、当事者同士しか知り得ない「共有の古い記憶」を一言一句ずれることなく正答認証したペア同士しか、いかなる通信機能も開始できません（想い出クイズゲート）。",
        "したがって、面識のない、偶然出会っただけの見知らぬ異性同士を結びつける機能は物理的に一切排除されているため、異性紹介事業の公安等への届出手続きは【完全不要（非該当）】となります。"
      ]
    },
    {
      id: 17,
      title: "共有記憶認証（メモリキーゲート）の法理解析：なぜ犯罪温床にならないか",
      category: "第51条監査適合性評価：面識性",
      layout: 'content',
      points: [
        "法律が「出会い系」を厳格に規制する本質的な趣旨は、身元の不確かな不特定多数が無差別に密会すること、それによってストーキング、拉致、売春等の治安犯罪が生まれるからです。",
        "ReMEETsは「クイズ回答」という絶対障壁を挟むことで、利用者の通信をすでに「既存の面識・既知の関係者」に厳密に絞り込んでからメッセージを開通します。",
        "この強力な仕組みが、出会い系特有の「無名による不当接触、身勝手なナンパ、変質者の無差別アタック」といった被害発生メカニズムを起動段階で100%封殺します。"
      ]
    },
    {
      id: 18,
      title: "ブルートフォース攻撃を遮断する、強固な「時間制限式ロックアウト自動防衛」",
      category: "安全防衛メカニズム①：不正総当たり拒絶",
      layout: 'content',
      points: [
        "悪質なアタッカー、またはストーカー予備軍が「正答」となる思い出を推測し、でたらめに何十回も回答を送信する行為（ブルートフォース試行）への完全なシステム対策。",
        "同一のアカウント、同一IP、あるいは同一のブラウザセッションから「累計で5回」連続して間違い回答が送られた場合、セキュリティエンジンが瞬時に攻撃を判定検知します。",
        "該当の接続アカウント及びIPアドレスを【24時間アクセス完全ロックアウト（全試行拒否）】。いたずら目的の回答者をプログラム自動化で速やかに撃退します。"
      ]
    },
    {
      id: 19,
      title: "実名・フルネーム晒しを水際で食い止める「日本常用姓名辞書自動照合」",
      category: "安全防衛メカニズム②：実名露出ブロック",
      layout: 'content',
      points: [
        "本人の合意がないまま勝手に実名でボトルを投函されたり、相手の実名や所属・ニックネームにフルネームを使って個人がネット晒しを遭うトラブルに対する徹底的な事前監査。",
        "ニックネームの登録時、及びボトルの見出し設定時に、日本の常用姓名辞書に基づくフルネーム判定（漢字ペアや典型的な姓名配列のチェック）をプログラムが瞬時に精査します。",
        "「山田太郎」などの実名構造を看破した場合、警告画面により『安全のため、ニックネームや本人達にしか解らないあだ名を使用してください』と自動で入力を規制します。"
      ]
    },
    {
      id: 20,
      title: "個人連絡先の直接交換・外部誘導を許さない「正規表現ステルスRegex」",
      category: "安全防衛メカニズム③：直接連絡先交換排除",
      layout: 'content',
      points: [
        "ボトルメールの本文、および手紙開通後のメッセージエリア内から、売春交渉、金銭詐欺、悪質な課金サイトやLINE等への外部誘導を完全に未然回避するため、直接の連絡手段の露呈を徹底防御。",
        "LINE ID、各種SNS、電話番号、メールアドレス、あるいは外部リンクURL、支払等の特定可能キーを、正規表現（Regex）スキャンでリアルタイム常時監視します。",
        "検知された全ての連絡情報・リンク文字列は、バックエンド側で即座に「****」などへ不変置換。いかなる手法を使っても、相手側端末へ表示される前の段階で完璧に伏字化します。"
      ]
    },
    {
      id: 21,
      title: "最先端 Gemini AI モデレーション：心理的付きまとい・粘着隠語の排除",
      category: "安全防衛メカニズム④：回避・執着セマンティック",
      layout: 'content',
      points: [
        "記号を混ぜたNGワード逃れ（例：「ラ_イ_ン」など）や、ストーカーによる「思い出」に偽装した狡猾な精神的・心理的付きまとい、暴力文脈を言語レベルで検知。",
        "世界最高峰の Google GenAI (Gemini AI API) とリアルタイムにAPI通信連動。文章全体の背景、意味合い（復讐等のしがみつき感情、金銭的誘導の看破）を意味論的に評価します。",
        "AIが高リスクとフラグ判定したメッセージおよび投函ボトルは、一般向けタイムラインには1秒たりとも出現させず、内部フラグで完璧に自動非公開・隔離します。"
      ]
    },
    {
      id: 22,
      title: "嫌がらせ者に分析させない隔離防衛技術「ステルスシャドウ・フラグ」",
      category: "安全防衛メカニズム⑤：シャドウフィルタ",
      layout: 'content',
      points: [
        "AIやフィルターに検知された際「検知中：投稿できません」等とエラーを返す従来型の制限は、悪質利用者に『こう書くとすり抜ける』というヘマなヒントを与え、投稿文章を改変させて再挑戦される原因となります。",
        "ReMEETsでは、高リスク検知された投稿者に対して、フロントUIでは「送信完了いたしました。ボトルは無事漂流しています」と正常メッセージを擬態表示します。",
        "しかし、データベースの内部ステータスでは 'shadow_flag_hidden' となり、一般画面からは一切視認されず隔離されます。このシャドウフラグ技術が悪質試行を諦めさせます。"
      ]
    },
    {
      id: 23,
      title: "未成年者・青少年利用の絶対的な制限（高校生を除く18歳以上限定）",
      category: "安全防衛メカニズム⑥：青少年保護規約",
      layout: 'content',
      points: [
        "児童福祉法上の義務、及び青少年へのネット等における犯罪被害（児童売春・誘拐、性的トラブル等）を水際で完璧に防止するため、18歳未満および高校生の利用は規約上完全不可としています。",
        "ユーザー登録時に必ず生年月日による年齢申告を強制。さらに公的書面等による強固な年齢証明の接続ゲートを準備しています。",
        "青少年を「犯罪温床に巻き込まない」ことを絶対のセキュリティポリシーとし、子供をインターネット被害から完璧にプロテクトする強固なコンプライアンス管理を全うします。"
      ]
    },
    {
      id: 24,
      title: "連絡先開示直前の厳格な「電子的利用宣誓フェーズゲート」",
      category: "安全防衛メカニズム⑦：電子的利用宣誓ゲート",
      layout: 'content',
      points: [
        "クイズに正答し、連絡先開示・セキュアブリッジに進む直前に、「悪意ある監視、付きまとい、いたずら登録、誹謗中傷でないこと」等の厳しい免責声明および法令遵守誓約の電子的宣誓を義務化。",
        "全項目への明示的同意チェックを必須化し、安易なクリックによる突破を防止。宣誓完了時のタイムスタンプ、接続元IPアドレス、ユーザー識別子を改ざん不可能な監査ログとして確実に保全。",
        "万一の法的トラブルや捜査照会時には、この電子的宣誓ログが「利用規約および法令遵守に同意した確実な証拠」として機能し、悪意あるユーザーに対する強力な心理的・法的抑止力を発揮します。"
      ]
    },
    {
      id: 25,
      title: "問い合わせ・通報の全履歴スレッド永続保全 ＆ Gemini AI コンプライアンス返信ドラフト",
      category: "安全防衛メカニズム⑧：チケット管理・AI監査返信",
      layout: 'content',
      points: [
        "「全送受信履歴のチケット型スレッドDB永続化」：ユーザーからの通報・相談・問い合わせ履歴は、管理者からの公式返信、さらにその後のユーザーからの追加返信に至るまで、全送受信ログをデータベース（contacts & contact_messages）にチケットトークン（ticket_token）でスレッドとして完全永続保全。",
        "「Gemini AI によるコンプライアンス適合返信ドラフト」：管理者パネル上で、通報・相談内容に応じた法務・セキュリティ規約に完全準拠した公式返信下書きをGemini AIがワンクリックで自動生成。迅速かつ的確な対応を実現。",
        "「捜査・監査への完全対応」：一連のやり取りがタイムスタンプ・送信者属性とともに時系列で完全記録されているため、警察・裁判所への証拠提出や内部コンプライアンス監査に100%対応可能です。"
      ]
    },
    {
      id: 26,
      title: "明確な年齢・本人確認体系と料金分離設計（【無料】年齢誓約 ＆ 【600円】公的身分証eKYC認証）",
      category: "安全防衛メカニズム⑨：透明な本人確認・料金体系",
      layout: 'content',
      points: [
        "「二段階の身元確認体系の視覚的・機能的完全分離」：【無料の年齢誓約（グリーン）】による18歳以上確認と、【600円の公的身分証eKYC認証（オレンジ）】による公的証明書確認を明確に区分して表示・運用。",
        "「利用者の誤認防止と透明性」：無料の基本機能（探索・閲覧・年齢宣誓）と、信頼性を担保する有償の公的身元認証（eKYC審査・開通手数料）の費用構造をクリーンに開示し、消費者の誤解を完全に防止。",
        "「警察・消費者保護ガイドライン完全適合」：青少年保護のための年齢確認を無料ですべての利用者に義務付けつつ、実際の引き渡し段階では厳格な身元確認（eKYC）を連動させることで、安全と公平性を高度に両立。"
      ]
    },
    {
      id: 27,
      title: "安全なユーザー証明：2社分離型eKYC本人確認 ＆ 即時返金自動決済連携",
      category: "安全防衛メカニズム⑩：eKYC・決済連携",
      layout: 'content',
      points: [
        "「2社分離型システム構成」: 本人確認機関としてTRUSTDOCK等、決済インフラとしてStripeをそれぞれ安全にAPI連携する、業界初の分離設計を採用。",
        "「600円（税込）の仮売上（オーソリ）方式」: 初期のボトル解凍・メッセージ開始前に仮売上をセキュアに確保。本人確認が【不合格】となった際は、ユーザーへの不当な金銭負担を防ぐため、システムが「自動かつ即時に全額キャンセル（全額返金）」を行います。",
        "「認証済バッジの点灯による安心感」: 審査に【合格（承認済）したユーザー】のみ公式バッジが点灯。いたずら、なりすまし、アカウント不正流用を水際で完封。"
      ]
    },
    {
      id: 28,
      title: "捜査・司法機関への即応体制：日付期間指定フィルター ＆ フォレンジックログ出力",
      category: "管轄警察・サイバー課との強固な共同戦線",
      layout: 'content',
      points: [
        "生活安全課、サイバー犯罪対策課、または裁判所などからの「捜査事項照会書」（刑事訴訟法第197条第2項に基づく）等の付託を受理した際、開始日〜終了日の『日付期間指定フィルター』でワンクリック抽出。",
        "指定期間内の対象アカウントによるログインIP端末、失敗履歴、電子的宣誓同意ログ、決済履歴が『フォレンジック分析用』PDF or CSVとして瞬時に自動集約出力されます。",
        "警察等からの正式要請に対して数分以内の迅速情報開示を全うし、違法・執着行為・嫌がらせ、なりすまし等の刑事責任追及を全面的に強力バックアップします。"
      ]
    },
    {
      id: 29,
      title: "利用者の「忘れられる権利」を守る、24時間対応「オプトアウト申請処理」",
      category: "プライバシー保護・即時削除",
      layout: 'content',
      points: [
        "ReMEETsでは、個人の権利擁護・プライバシー優先の精神に基づき、申請者本人が「自分に関連するあらゆる文字情報の消去」を即時要求できる削除申請フォーム（窓口）を用意しています。",
        "申請を受けたら、通常24時間以内に運営安全統計監査室が該当ボトルを確認し、個人情報を含む不適切な記述をデータベース上からただちに『完全不活性（物理削除・閉鎖）』します。",
        "お相手との想い出を開門されたくない方の「再会を行わないでほしいという権利」も対等に完全に保障されています。"
      ]
    },
    {
      id: 30,
      title: "総括：想い出を繋ぎ、治安適合性と最高度の法的透明性を確立する新インフラ",
      category: "総括・治安コンプライアンス適合証明",
      layout: 'content',
      points: [
        "ReMEETsは、「ただ一つの安心な思い出開門システム」であり、不特定の男女を引き合わせる危険性を100%排除して設計されています。",
        "運営は1回600円の開通手数料、およびサポーター寄付（ドネーション）で支えられ、特商法に基づくコンテンツ開通後の自己都合返金不可特約（障害時・eKYC否認時全額自動返金）を徹底遵守。",
        "警察公安、サイバー対策セクション、及び法規制の求めるあらゆる安全規範を完全に充足し、持続可能かつ最高に安全な再会社会を実現します。"
      ]
    }
  ]);

  return (
    <AnimatePresence>
      {showChecklistModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-black/70 backdrop-blur-md" data-lenis-prevent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100 font-sans"
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>ReMEETs 本番公開・運用前 2大マスターチェックリスト</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    インフラ設定・APIキーからスマホ実機・OAuth・決済・eKYCの全動線テストまで一元記録・自動保存
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab switch */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveChecklistTab('deploy')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeChecklistTab === 'deploy'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare size={14} />
                <span>① 本番デプロイ 19大マスターリスト</span>
              </button>
              <button
                onClick={() => setActiveChecklistTab('operation')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeChecklistTab === 'operation'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search size={14} />
                <span>② 本番前動作確認 22大テストリスト</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeChecklistTab === 'deploy' ? (
                <div className="space-y-3">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.completed
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={!!item.completed}
                            onChange={(e) => {
                              const updated = checklistItems.map((c) =>
                                c.id === item.id ? { ...c, completed: e.target.checked, date: e.target.checked ? new Date().toISOString().split('T')[0] : '' } : c
                              );
                              setChecklistItems(updated);
                              try {
                                localStorage.setItem('remeets_deploy_checklist_progress', JSON.stringify(updated));
                              } catch (err) {}
                            }}
                            className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-300 font-mono">
                                #{item.id} {item.category}
                              </span>
                              <span className="text-xs font-bold text-white">{item.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {operationChecklistItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.completed
                          ? 'bg-teal-950/20 border-teal-500/40 text-teal-100'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={!!item.completed}
                            onChange={(e) => {
                              const updated = operationChecklistItems.map((c) =>
                                c.id === item.id ? { ...c, completed: e.target.checked, date: e.target.checked ? new Date().toISOString().split('T')[0] : '' } : c
                              );
                              setOperationChecklistItems(updated);
                              try {
                                localStorage.setItem('remeets_ops_checklist_progress', JSON.stringify(updated));
                              } catch (err) {}
                            }}
                            className="mt-1 w-4 h-4 rounded accent-teal-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-teal-300 font-mono">
                                #{item.id} {item.category}
                              </span>
                              <span className="text-xs font-bold text-white">{item.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
