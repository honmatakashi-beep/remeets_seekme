import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Shield,
  Activity,
  Settings,
  Users,
  Mail,
  Sparkles,
  Bot,
  AlertTriangle,
  Trash2,
  Bell,
  UserCheck,
  ShieldAlert,
  Terminal,
  FileSpreadsheet,
  CheckSquare,
  Coins,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  UserPlus,
  Brain,
  BarChart3,
  HelpCircle,
  Key,
  RefreshCw,
  Layers,
  Download,
  Database,
  Server,
  Lock,
  Printer,
  Copy,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Award,
  CreditCard,
  History,
  Palette,
  Sliders,
  FileText,
  Menu,
  X,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  content: React.ReactNode;
  printContent?: string;
}

interface ManualCategory {
  id: string;
  categoryTitle: string;
  icon: any;
  sections: {
    id: string;
    title: string;
    description: string;
    badge?: string;
  }[];
}

export const AdminManualView: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('1-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // 📑 Hierarchical Menu Categories (大見出し ＆ 見出し)
  const manualCategories: ManualCategory[] = [
    {
      id: 'cat-1',
      categoryTitle: '1. 基礎・ガバナンス・法令遵守',
      icon: Shield,
      sections: [
        { id: '1-1', title: '1-1. 管理者責任と個人情報の保護', description: '通信の秘密・覗き見厳禁・個人情報ゼロ保持モデル', badge: '最重要' },
        { id: '1-2', title: '1-2. 役職ロール・権限管理 (RBAC)', description: 'オーナー/管理者/監査役/モデレーターの4階層分離' },
        { id: '1-3', title: '1-3. 連絡先開示モデルと法的建付け', description: 'クローズドチャット廃止と異性紹介事業非該当の理由' }
      ]
    },
    {
      id: 'cat-2',
      categoryTitle: '2. 日常業務・コンテンツ管理',
      icon: Activity,
      sections: [
        { id: '2-1', title: '2-1. ダッシュボードKPIの監視', description: '日次投関数・クイズ正解率・マッチング成立の俯瞰' },
        { id: '2-2', title: '2-2. 漂流ボトルメールの編集と証跡削除', description: '誤字救済編集と削除アーカイブ永久保全' },
        { id: '2-3', title: '2-3. 奇跡の物語 (Success Stories)', description: '感動的な再会実例の編集・掲載管理' }
      ]
    },
    {
      id: 'cat-3',
      categoryTitle: '3. AI安全防衛・セキュリティ',
      icon: Bot,
      sections: [
        { id: '3-1', title: '3-1. Gemini リアルタイム文脈検閲', description: 'ストーカー・怨恨・個人情報の自律判定と自動隔離' },
        { id: '3-2', title: '3-2. 安全防衛シミュレータ (50選大図鑑)', description: 'AI判定挙動のテスト検証とスコア確認' },
        { id: '3-3', title: '3-3. 通報キュー審査とNGワード管理', description: '通報処理・アカウント即時凍結・NG辞書登録' }
      ]
    },
    {
      id: 'cat-4',
      categoryTitle: '4. ユーザー対応・配信',
      icon: Mail,
      sections: [
        { id: '4-1', title: '4-1. お問い合わせSLAと自動分類', description: '未対応/保留/完了管理と緊急度別トリアージ' },
        { id: '4-2', title: '4-2. 送信メールテンプレート (8種)', description: '通知メール文面のプレビューとテスト送信' },
        { id: '4-3', title: '4-3. 全体一括プッシュ通知配信', description: '規約改定・防犯啓発の全体ブロードキャスト' }
      ]
    },
    {
      id: 'cat-5',
      categoryTitle: '5. 決済・eKYC・収益試算',
      icon: CreditCard,
      sections: [
        { id: '5-1', title: '5-1. 決済トランザクション台帳・返金', description: 'Stripe入出金一覧・ワンクリック手動返金・CSV出力' },
        { id: '5-2', title: '5-2. 売上・原価・粗利アナリティクス', description: 'Stripe/SMS/eKYC原価控除後の純利(+366円/件)' },
        { id: '5-3', title: '5-3. eKYC身元確認ログと非保持ルール', description: '免許証/マイナ審査ログと身分証生画像非保持' },
        { id: '5-4', title: '5-4. Stripe Sandbox 模擬決済テスト', description: 'テスト決済の即時発行と返金動作検証' },
        { id: '5-5', title: '5-5. 課金モデル収益シミュレーター', description: 'BEP損益分岐点・4大成長フェーズ・オプション試算' }
      ]
    },
    {
      id: 'cat-6',
      categoryTitle: '6. システム管理・インフラ診断',
      icon: Server,
      sections: [
        { id: '6-1', title: '6-1. 動的APIレート制限スライダー', description: '秒間アクセス上限のリアルタイム調整とDoS対策' },
        { id: '6-2', title: '6-2. DB健康診断 (VACUUM/PRAGMA)', description: 'インデックス再構築と断片化解消' },
        { id: '6-3', title: '6-3. 不正アクセス・DoS遮断・ログ監査', description: '悪質IPブロックとアクセスログ監視' },
        { id: '6-4', title: '6-4. バージョン履歴 (Semantic Versions)', description: 'Gitコミット連動の変更履歴追跡' }
      ]
    },
    {
      id: 'cat-7',
      categoryTitle: '7. M&A企業価値・マスター備忘録',
      icon: Award,
      sections: [
        { id: '7-1', title: '7-1. M&A企業価値評価 (DCF/EBITDA)', description: 'デュアル算定エンジン・資産目録・IM出力' },
        { id: '7-2', title: '7-2. 17大本番デプロイチェックリスト', description: 'インフラ・DB・API・規約の公開前確認' },
        { id: '7-3', title: '7-3. 警察・公安照会基準マニュアル', description: '刑訴法197条に基づく令状開示ログ一覧' },
        { id: '7-4', title: '7-4. 責任の所在 10大決定事項', description: '偽造免責・SMS不達返金・AI誤検知免責' }
      ]
    },
    {
      id: 'cat-8',
      categoryTitle: '8. デザインシステム (UI/UX Specs)',
      icon: Palette,
      sections: [
        { id: '8-1', title: '8-1. ReMEETs 4大設計原則', description: '情緒と法的信頼・改行禁止・角丸ネスト・600円明朗' },
        { id: '8-2', title: '8-2. カラー・タイポグラフィトークン', description: '16色パレット(WCAG AAA/AA)・和文黄金比' },
        { id: '8-3', title: '8-3. UIパーツ・ボタン状態テスター', description: 'ボタン状態・トースト発火・春夏秋冬テーマ' }
      ]
    }
  ];

  // Flattened sections for navigation
  const allSections = useMemo(() => {
    return manualCategories.flatMap(c => c.sections.map(s => ({ ...s, categoryTitle: c.categoryTitle })));
  }, [manualCategories]);

  const currentSectionIndex = allSections.findIndex(s => s.id === selectedSectionId);
  const prevSection = currentSectionIndex > 0 ? allSections[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < allSections.length - 1 ? allSections[currentSectionIndex + 1] : null;
  const currentSectionMeta = allSections[currentSectionIndex] || allSections[0];

  // Filtered categories when search query is typed
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return manualCategories;
    const q = searchQuery.toLowerCase();
    return manualCategories.map(cat => ({
      ...cat,
      sections: cat.sections.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        cat.categoryTitle.toLowerCase().includes(q)
      )
    })).filter(cat => cat.sections.length > 0);
  }, [searchQuery, manualCategories]);

  // Section Content Render Mapping
  const renderSectionContent = (id: string) => {
    switch (id) {
      // 1-1
      case '1-1':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block">【基本方針】</span>
              <p className="text-xs text-teal-900 leading-relaxed font-serif">
                ReMEETsは、お相手の「名前」と「二人だけの想い出クイズ」を鍵とすることで、一般の掲示板のような見知らぬ人への個人情報漏洩を防御しています。
                管理者はすべてのボトル原文、監査ログ、クイズ履歴にアクセス可能ですが、極めて厳格な守秘義務が課されます。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                <h4 className="font-bold text-xs text-black">① 私的目的の検索・覗き見の絶対禁止</h4>
                <p className="text-[11px] text-black/70 leading-relaxed">
                  面識のない第三者の通信内容やクイズ解答履歴を興信目的等で調べる行為は即時解雇・監査ログからの自動告発対象となります。すべての管理画面アクセスはタイムスタンプと管理者ID付きで物理保全されています。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                <h4 className="font-bold text-xs text-black">② 実名照合フィルターの保守</h4>
                <p className="text-[11px] text-black/70 leading-relaxed">
                  日本の常用姓名（約3,000姓）や主要SNS ID（LINE, Twitter, Instagram等）に該当する文字列が本文に含まれている場合、一般タイムラインには漂流せず自動的にAI隔離キューへ振り分けられます。
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black flex items-center gap-2">
                <Lock size={14} className="text-teal-700" />
                <span>個人情報ゼロ保持（Zero Data Retention）アーキテクチャ</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-black/70">
                <li><b>🪪 身分証原本画像:</b> TRUSTDOCK等のeKYCサーバーに直接送信され、Webサーバーには一切保存しません（承認トークンのみ保持）。</li>
                <li><b>💳 クレジットカード番号:</b> Stripe PCI-DSS Level 1 サーバーと直接通信し、Webサーバーを通過しません。</li>
                <li><b>📱 開示用連絡先:</b> 想い出クイズ完全一致・eKYC・決済が完了した当事者2名にのみリアルタイムで復号・引き渡し（ブリッジ）。</li>
              </ul>
            </div>
          </div>
        );

      // 1-2
      case '1-2':
        return (
          <div className="space-y-6">
            <p className="text-xs text-black/70 leading-relaxed">
              内部不正や誤操作によるデータ破損・情報漏洩を防ぐため、管理画面はロールベースアクセス制御（RBAC: 4階層）によってアクセス権限が厳格に分離されています。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-black">👑 オーナー (Owner)</span>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">全権限</span>
                </div>
                <p className="text-[11px] text-black/60 leading-relaxed">
                  M&Aデータ室、DB完全初期化、APIキー管理、ロール任命権限を含む最高権限。事業譲渡時のマスターアカウント。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-black">⚡ 最高管理者 (Admin)</span>
                  <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">運用統括</span>
                </div>
                <p className="text-[11px] text-black/60 leading-relaxed">
                  ユーザー管理、手紙編集・削除、手動返金実行、一括通知配信、システム監視など日常運営の全権限。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-black">⚖️ 監査役 (Auditor)</span>
                  <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">閲覧限定</span>
                </div>
                <p className="text-[11px] text-black/60 leading-relaxed">
                  警察照会ログ出力、eKYC監査、決済台帳・財務レポートの閲覧が可能（データ変更・削除などの破壊的操作は不可）。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-black">🛡️ モデレーター (Moderator)</span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">監視特化</span>
                </div>
                <p className="text-[11px] text-black/60 leading-relaxed">
                  ユーザー通報の審査、NGワード辞書登録、AI隔離ボトルの目視承認/却下のみに限定された安全な運用ロール。
                </p>
              </div>
            </div>
          </div>
        );

      // 1-3
      case '1-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">クローズドチャット廃止 ＆ 連絡先開示（引き渡し）モデルの背景</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                アプリ内で継続的な1対1メッセージ機能を提供し続ける場合、「インターネット異性紹介事業」該当懸念や「24時間メッセージ監視・検閲義務」が発生します。<br />
                ReMEETsでは想い出の照合後に安全に連絡先（SNS ID / メール）を引き渡してプラットフォームの役割を完結させることで、法的・運営的リスクを大幅に軽減しています。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center font-mono text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-brand-border">
                <span className="text-black/40 block text-[10px]">STEP 1</span>
                <b>想い出クイズ正解</b>
              </div>
              <div className="p-3 bg-white rounded-xl border border-brand-border">
                <span className="text-black/40 block text-[10px]">STEP 2</span>
                <b>600円 Stripe決済</b>
              </div>
              <div className="p-3 bg-white rounded-xl border border-brand-border">
                <span className="text-black/40 block text-[10px]">STEP 3</span>
                <b>eKYC ＋ SMS認証</b>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                <span className="text-emerald-700 block text-[10px]">STEP 4</span>
                <b>連絡先開示 ＆ 完結</b>
              </div>
            </div>
          </div>
        );

      // 2-1
      case '2-1':
        return (
          <div className="space-y-6">
            <p className="text-xs text-black/70 leading-relaxed">
              「ダッシュボード」タブでは、リアルタイムの投関数、新規登録数、メッセージ往復数、開通ペア数を俯瞰します。
            </p>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2 text-[11px]">
              <b>主要KPI指標の役割:</b>
              <ul className="list-disc pl-4 space-y-1 text-black/70">
                <li><b>MAU (Monthly Active Users):</b> 月間アクティブユーザーの推移を監視し、インフラ負荷や収益性を予測。</li>
                <li><b>クイズ正解率:</b> 想い出一致の確度を計測。正解率が極端に高い場合はクイズ難易度の改善を検討。</li>
                <li><b>AI隔離件数:</b> Geminiモデレーションによる日次の危険投稿遮断数をモニタリング。</li>
              </ul>
            </div>
          </div>
        );

      // 2-2
      case '2-2':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">ボトルメール管理 (Posts) ＆ 証跡付きアーカイブ削除</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                漂流中のボトルメールをキーワードや年代で検索し、誤字脱字による連絡不能救済のためのダイレクト編集や削除を実行します。
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px]">
                💡 <b>削除時の重要ルール:</b> 手紙を削除する際は、必ずプリセット理由（攻撃的表現、個人情報露出、本人申告等）を選択または記入します。削除ログは「削除アーカイブ」に理由とともに永久保存され、警察捜査時に証拠として提出可能です。
              </div>
            </div>
          </div>
        );

      // 2-3
      case '2-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">奇跡の物語管理 (Success Stories)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                実際に再会に成功した感動的なエピソードを編集・公開します。トップページや専用ページへの掲載/非掲載トグルや表示順序の調整が可能です。
              </p>
            </div>
          </div>
        );

      // 3-1
      case '3-1':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">Gemini 2.5 Flash リアルタイムAI検閲エンジン</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                手紙投函時にGemini AIが「ストーカー性」「誹謗中傷・怨恨」「直接的な個人情報露出」「不当な出会い目的」をリアルタイム多層解析します。<br />
                危険と判定された手紙は即座に非公開（<code>ai_flagged = 1</code>）となり、一般の海には漂流しません。
              </p>
            </div>
          </div>
        );

      // 3-2
      case '3-2':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">安全防衛検閲シミュレーター (50選大図鑑)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                「セキュリティ」タブ内のシミュレーターでは、実際のAIエンジンを用いて文章の検閲テストを実行できます。50選大図鑑から例文をワンクリックで読み込み、検知理由や危険度スコアを確認可能です。
              </p>
            </div>
          </div>
        );

      // 3-3
      case '3-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">通報管理 (Reports) ＆ NGワード辞書</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                ユーザーから寄せられた通報キューを審査し、対象ボトルの非公開化やユーザーの強制ブロック（<code>is_blocked = 1</code>）を執行します。NGワード辞書への即時登録も可能です。
              </p>
            </div>
          </div>
        );

      // 4-1
      case '4-1':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">お問い合わせSLA管理 ＆ 自動カテゴリ分類</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                一般窓口へのお問い合わせを「未対応」「保留中」「対応完了」のステータスで管理。AIによる緊急度判定（アカウント凍結、決済不備、通報等）により優先度順にソートされます。
              </p>
            </div>
          </div>
        );

      // 4-2
      case '4-2':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">送信メールテンプレート管理 (8種類)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                ボトル開封通知、マッチング成立、eKYC審査結果、返金完了など、システムから自動送信される全8種類のHTMLメールテンプレートの文面プレビューおよびテスト送信が可能です。
              </p>
            </div>
          </div>
        );

      // 4-3
      case '4-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">全体一括配信 (Notifications)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                重要規約の改定、システムメンテナンス予告、防犯啓発メッセージを全ユーザーまたは特定グループ宛てに一括プッシュ通知・インApp配信します。
              </p>
            </div>
          </div>
        );

      // 5-1
      case '5-1':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">決済トランザクション台帳 ＆ 個別手動返金</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                全決済トランザクションの一覧、ステータス検索、ワンクリック手動返金処理、詳細モーダル表示、CSV出力を実行します。
              </p>
            </div>
          </div>
        );

      // 5-2
      case '5-2':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
              <h4 className="font-bold text-xs text-teal-950">売上・原価・粗利アナリティクス（黒字化構造）</h4>
              <p className="text-[11px] text-teal-900 leading-relaxed">
                開通手数料 600円 に対し、Stripe手数料（22円）、SMS送信費（12円）、eKYC審査費（200円）を引いて<b>1件あたり +366円の純手元利益</b>を残す黒字化設計の推移グラフを確認できます。
              </p>
            </div>
          </div>
        );

      // 5-3
      case '5-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">eKYC身元確認ログ ＆ 身分証生画像非保持</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                運転免許証・マイナンバーカードの審査合否ログ、承認タイムスタンプを管理。生画像は専門ベンダー側でのみ保持し、漏洩リスクを100%排除しています。
              </p>
            </div>
          </div>
        );

      // 5-4
      case '5-4':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">Stripe Sandbox 模擬決済テスト</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                テスト環境でワンクリック模擬決済を発行し、合格時の開通フローおよび不合格時の即時自動返金動作を安全に検証できます。
              </p>
            </div>
          </div>
        );

      // 5-5
      case '5-5':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">課金モデル収益シミュレーター (BEP ＆ 成長プリセット)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                損益分岐点（BEP AreaChart）、4大成長フェーズ（初期・成長・バズ・全国）のワンクリック試算、追加マネタイズオプションのアップサイド検証が可能です。
              </p>
            </div>
          </div>
        );

      // 6-1
      case '6-1':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">動的APIレート制限スライダー</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                認証API、投稿API、検索APIの秒間アクセス上限をスライダーで直感的に調整し、DoS攻撃や総当たり回答スパムを防御します。
              </p>
            </div>
          </div>
        );

      // 6-2
      case '6-2':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">DB健康診断 (VACUUM / PRAGMA optimize)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                データベースの断片化解消（VACUUM）やインデックス最適化（PRAGMA optimize）をワンクリックで実行し、高速レスポンスを維持します。
              </p>
            </div>
          </div>
        );

      // 6-3
      case '6-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">不正アクセス・DoS遮断 ＆ ログ監査</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                悪質IPの即時ブロック・解除リスト管理や、警察照会基準を満たすアクセス監査ログを管理します。
              </p>
            </div>
          </div>
        );

      // 6-4
      case '6-4':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">バージョン履歴 (Semantic Versioning)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                Gitコミット履歴およびSemantic Versioningに基づくバージョンアップ履歴と差分を追跡します。
              </p>
            </div>
          </div>
        );

      // 7-1
      case '7-1':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">M&A企業価値評価データ室 (DCF ＆ EBITDA倍率法)</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                DCF法とEBITDAマルチプル法のデュアル算定エンジン、資産インベントリ目録、買い手向け完全版IM（事業概要説明書）テキストの出力を実行します。
              </p>
            </div>
          </div>
        );

      // 7-2
      case '7-2':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">17大本番デプロイマスターチェックリスト</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                インフラ・DB（3）、API・決済（3）、データ初期化・Seeding（2）、SNS認証（2）、法務・特商法（4）、運用セキュリティ（2）、最終疎通テスト（1）の全17項目を管理します。
              </p>
            </div>
          </div>
        );

      // 7-3
      case '7-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">警察・公安照会基準マニュアル</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                刑訴法197条2項に基づく捜査関係事項照会書を受領した際の開示可能ログ項目（SNS UID、SMS番号、eKYC氏名/年齢、IP、AI隔離原本等）と対応フローを規定しています。
              </p>
            </div>
          </div>
        );

      // 7-4
      case '7-4':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">責任の所在 10大決定事項チェックリスト</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                偽造身分証の免責、SMS不達時の自動即時返金、AI誤検知免責、退会時OAuthデータ完全物理削除ポリシーを定めています。
              </p>
            </div>
          </div>
        );

      // 8-1
      case '8-1':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">ReMEETs 4大設計原則</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <b>① 情緒と法的信頼性の共存:</b> 手紙には和文明朝、管理・法的画面にはクリーンな白背景とモノスペース。
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <b>② ボタンラベル改行禁止:</b> white-space: nowrap による美しい1行収容。
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <b>③ 角丸ネスト計算公式:</b> 内部角丸 ＝ 外部角丸 － パディング。
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <b>④ 完全買い切り・透明な料金表示:</b> 600 円（税込）の明朗会計と返金保証。
                </div>
              </div>
            </div>
          </div>
        );

      // 8-2
      case '8-2':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">カラー ＆ タイポグラフィトークン</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                16色のブランド・アクセント・セマンティックカラー（WCAG AAA/AA準拠）および、和文フォント黄金比（Noto Serif JP ＆ Noto Sans JP）を規定しています。
              </p>
            </div>
          </div>
        );

      // 8-3
      case '8-3':
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-xs text-black">UIパーツ・ボタン状態テスター</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                ボタン状態（通常・ローディング・成功・無効）の実機テスト、トースト通知発火、春夏秋冬4テーマのカードプレビュー、および Tailwind Config / CSS変数のワンクリックコピーが可能です。
              </p>
            </div>
          </div>
        );

      default:
        return <div>該当するマニュアル項目が見つかりませんでした。</div>;
    }
  };

  return (
    <div id="admin-manual-view" className="space-y-6 font-sans pb-24">
      {/* 🧭 Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-book-container, #print-book-container * {
            visibility: visible;
          }
          #print-book-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt;
            line-height: 1.6;
          }
          .print-hidden {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      {/* 🧭 Top Banner & Actions */}
      <div className="print-hidden bg-white p-5 md:p-6 rounded-3xl border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-teal-50 text-teal-900 rounded-full text-xs font-bold mb-1.5 border border-teal-200">
            <BookOpen size={14} />
            <span>ReMEETs 操作マニュアル ＆ 運用標準手順書 (SOP)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-serif text-black flex items-center gap-2">
            <span>管理者ハンドブック ＆ 運用マニュアル</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Ver 2.5 改訂版
            </span>
          </h2>
          <p className="text-xs text-black/60 mt-0.5">
            左メニューの大見出し・見出しをクリックして該当ページを閲覧できます。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 text-black border border-brand-border"
          >
            {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
            <span>目次メニュー</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>📖 一冊のマニュアルとして印刷 (PDF)</span>
          </button>
        </div>
      </div>

      {/* 🧭 2-Column Documentation Layout (左メニュー ＋ 右コンテンツ) */}
      <div className="print-hidden grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* 📑 LEFT SIDEBAR NAVIGATION (大見出し ＆ 見出し) */}
        <div className={`md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-4 md:sticky md:top-6 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar ${
          mobileMenuOpen ? 'block' : 'hidden md:block'
        }`}>
          {/* Sidebar Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="見出しを検索..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-brand-border rounded-xl text-xs focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-4 pt-1">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              const isCollapsed = !!collapsedCategories[cat.id];
              return (
                <div key={cat.id} className="space-y-1">
                  {/* 大見出し (Category Header) */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-black hover:bg-zinc-100 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-black/90">
                      <Icon size={14} className="text-teal-700 shrink-0" />
                      <span className="font-bold">{cat.categoryTitle}</span>
                    </div>
                    <ChevronDown size={14} className={`text-black/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>

                  {/* 見出し / 小見出しリスト (Sections) */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 pl-3 border-l-2 border-zinc-100 ml-3.5 my-1">
                      {cat.sections.map((sec) => {
                        const isSelected = selectedSectionId === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => {
                              setSelectedSectionId(sec.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between group ${
                              isSelected
                                ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/80 shadow-xs'
                                : 'text-black/70 hover:bg-zinc-50 hover:text-black'
                            }`}
                          >
                            <span className="line-clamp-1">{sec.title}</span>
                            {sec.badge && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ml-1 ${
                                isSelected ? 'bg-teal-200 text-teal-950' : 'bg-zinc-200 text-black/60'
                              }`}>
                                {sec.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 📖 RIGHT MAIN CONTENT AREA (選択された見出しの内容) */}
        <div className="md:col-span-8 lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-6">
          {/* Breadcrumb & Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-black/50 mb-1">
                <span>マニュアル</span>
                <ChevronRight size={12} />
                <span>{currentSectionMeta.categoryTitle}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-serif text-black">
                {currentSectionMeta.title}
              </h3>
              <p className="text-xs text-black/60 mt-0.5">
                {currentSectionMeta.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(document.getElementById('current-section-content')?.innerText || '')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-black transition-all cursor-pointer border border-brand-border/60 self-start sm:self-auto"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? 'コピー完了！' : 'このページをコピー'}</span>
            </button>
          </div>

          {/* Render Active Section Content */}
          <div id="current-section-content" className="min-h-[380px]">
            {renderSectionContent(selectedSectionId)}
          </div>

          {/* Bottom Previous / Next Navigation */}
          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between text-xs font-bold gap-3">
            {prevSection ? (
              <button
                type="button"
                onClick={() => setSelectedSectionId(prevSection.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-black border border-brand-border transition-all cursor-pointer max-w-[48%]"
              >
                <ArrowLeft size={14} />
                <span className="truncate">前: {prevSection.title}</span>
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                type="button"
                onClick={() => setSelectedSectionId(nextSection.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition-all cursor-pointer max-w-[48%]"
              >
                <span className="truncate">次: {nextSection.title}</span>
                <ArrowRight size={14} />
              </button>
            ) : <div />}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🖨️ PRINT-ONLY CONTAINER (ONE UNIFIED BOUND BOOK FOR PDF DOWNLOAD)     */}
      {/* ==================================================================== */}
      <div id="print-book-container" className="hidden print:block p-8 space-y-12">
        {/* COVER PAGE */}
        <div className="page-break flex flex-col justify-between min-h-[90vh] p-12 text-center border-4 border-slate-900 rounded-3xl">
          <div className="space-y-4 pt-12">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              CONFIDENTIAL & OFFICIAL STANDARD OPERATING PROCEDURES
            </span>
            <h1 className="text-4xl font-serif font-bold text-slate-900 pt-6">
              ReMEETs 〜再会のボトルメール〜<br />
              管理者操作マニュアル ＆ 運用総合手順書
            </h1>
            <p className="text-sm text-slate-600 font-sans max-w-xl mx-auto pt-4">
              システム基盤、AI安全防衛、決済・eKYC、法令遵守、M&A評価、およびデザインシステムに関する完全公式ハンドブック
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-lg mx-auto space-y-2 text-xs font-sans">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">サービス提供開始日:</span>
              <span className="font-bold">2026年8月15日</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">マニュアル版数:</span>
              <span className="font-bold font-mono">Ver 2.5 (改訂完全版)</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">管轄・適用法令:</span>
              <span className="font-bold">刑訴法197条 / 個人情報保護法 / 特商法</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">機密区分:</span>
              <span className="font-bold text-rose-700">社外秘 (Internal Confidential)</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono pb-8">
            © 2026 ReMEETs Project. All Rights Reserved.
          </div>
        </div>

        {/* TABLE OF CONTENTS */}
        <div className="page-break space-y-6 pt-8">
          <h2 className="text-2xl font-serif font-bold text-slate-900 border-b-2 border-slate-900 pb-2">
            📑 目次 (Table of Contents)
          </h2>
          <div className="space-y-6 text-xs font-sans">
            {manualCategories.map((cat, idx) => (
              <div key={cat.id} className="space-y-2">
                <div className="font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
                  {cat.categoryTitle}
                </div>
                <div className="space-y-1.5 pl-4">
                  {cat.sections.map((sec) => (
                    <div key={sec.id} className="flex justify-between items-baseline">
                      <span>{sec.title} - <span className="text-slate-500">{sec.description}</span></span>
                      <span className="font-mono text-slate-400">P. {idx + 2}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAPTER PAGES FOR PRINT */}
        {manualCategories.map((cat) => (
          <div key={cat.id} className="page-break space-y-6 pt-8">
            <div className="border-b-2 border-slate-800 pb-3">
              <h2 className="text-xl font-serif font-bold text-slate-900">{cat.categoryTitle}</h2>
            </div>
            <div className="space-y-6">
              {cat.sections.map((sec) => (
                <div key={sec.id} className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <h3 className="font-bold text-sm">{sec.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManualView;
