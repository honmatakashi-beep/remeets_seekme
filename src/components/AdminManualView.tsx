import React, { useState, useMemo, useRef } from 'react';
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
  ArrowRight,
  Info,
  SlidersHorizontal,
  Code,
  FileCode,
  AlertCircle
} from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🖨️ Reliable Standalone Print Engine (白紙化を100%防止する完全独立印刷ウィンドウ)
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>ReMEETs 管理者操作マニュアル ＆ 運用標準手順書 (SOP) - 公式完全版</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 20mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
            color: #1a1a1a;
            background: #ffffff;
            line-height: 1.6;
            font-size: 10.5pt;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          .cover-page {
            min-height: 92vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px;
            border: 4px double #0f766e;
            border-radius: 20px;
            text-align: center;
          }
          .toc-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dotted #ccc;
            padding: 4px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 9.5pt;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 10px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
          }
          .callout-box {
            border-left: 4px solid #0f766e;
            background: #f0fdfa;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 12px 0;
            font-size: 9.5pt;
          }
          .warning-box {
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 12px 0;
            font-size: 9.5pt;
          }
          .code-snippet {
            background: #1e293b;
            color: #f8fafc;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 9pt;
            overflow-x: auto;
          }
        </style>
      </head>
      <body class="p-4">
        <!-- 📖 COVER PAGE -->
        <div class="cover-page page-break">
          <div class="pt-8">
            <span class="text-xs font-mono font-bold tracking-widest text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              OFFICIAL STANDARD OPERATING PROCEDURES & HANDBOOK
            </span>
            <h1 class="text-3xl font-bold font-serif text-slate-900 mt-6 leading-tight">
              ReMEETs 〜再会のボトルメール〜<br />
              管理者操作マニュアル ＆ 運用標準手順書 (SOP)
            </h1>
            <p class="text-xs text-slate-600 mt-4 max-w-lg mx-auto">
              全8章・25節にわたるシステム管理、AI安全防衛、決済・eKYC、法令遵守、M&A評価、およびデザインシステムに関する完全公式ハンドブック
            </p>
          </div>

          <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
            <div class="flex justify-between border-b border-slate-200 pb-1.5">
              <span class="text-slate-500 font-bold">サービス正式運用日:</span>
              <span class="font-bold">2026年8月15日</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-1.5">
              <span class="text-slate-500 font-bold">マニュアル版数:</span>
              <span class="font-bold font-mono">Ver 2.5 (本番運用完全版)</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-1.5">
              <span class="text-slate-500 font-bold">対象読者:</span>
              <span class="font-bold">システム管理者 / 監査役 / モデレーター</span>
            </div>
            <div class="flex justify-between border-b border-slate-200 pb-1.5">
              <span class="text-slate-500 font-bold">適用法令:</span>
              <span class="font-bold">刑訴法197条 / 電通法 / 個情法 / 特商法</span>
            </div>
            <div class="flex justify-between pt-1">
              <span class="text-slate-500 font-bold">機密区分:</span>
              <span class="font-bold text-rose-700">社外秘 (Internal Confidential)</span>
            </div>
          </div>

          <div class="text-xs text-slate-400 font-mono pb-4">
            © 2026 ReMEETs Project. All Rights Reserved.
          </div>
        </div>

        <!-- 📑 TABLE OF CONTENTS -->
        <div class="page-break pt-4 space-y-6">
          <h2 class="text-2xl font-bold font-serif text-slate-900 border-b-2 border-teal-800 pb-2">
            📑 目次 (Table of Contents)
          </h2>
          <div class="space-y-6 text-xs">
            ${manualCategories.map((cat, idx) => `
              <div class="space-y-1.5">
                <div class="font-bold text-sm text-teal-950 bg-slate-100 p-2 rounded">
                  ${cat.categoryTitle}
                </div>
                <div class="space-y-1 pl-4">
                  ${cat.sections.map(sec => `
                    <div class="toc-item">
                      <span class="font-bold text-slate-800">${sec.title}</span>
                      <span class="text-slate-500 text-[11px]">${sec.description}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 📖 ALL CHAPTER DETAILS -->
        <div id="print-content-full">
          ${document.getElementById('all-sections-print-template')?.innerHTML || ''}
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    };
  };

  // 📑 Hierarchical Menu Categories (大見出し ＆ 見出し)
  const manualCategories: ManualCategory[] = [
    {
      id: 'cat-1',
      categoryTitle: '1. 基礎・ガバナンス・法令遵守',
      icon: Shield,
      sections: [
        { id: '1-1', title: '1-1. 管理者責任と個人情報保護の基本原則', description: '通信の秘密・覗き見厳禁・個人情報ゼロ保持モデル', badge: '最重要' },
        { id: '1-2', title: '1-2. 役職ロール・権限管理 (RBAC 4階層)', description: 'Owner/Admin/Auditor/Moderatorの権限分離と任命手順' },
        { id: '1-3', title: '1-3. 連絡先開示モデルと法的建付け', description: '連絡先安全引き渡し完結モデルと異性紹介事業非該当の法的理由' }
      ]
    },
    {
      id: 'cat-2',
      categoryTitle: '2. 日常業務・コンテンツ管理',
      icon: Activity,
      sections: [
        { id: '2-1', title: '2-1. ダッシュボードKPI監視と日次ルーティン', description: 'MAU/投関数/クイズ正解率/決済数の監視と判断基準' },
        { id: '2-2', title: '2-2. 漂流ボトルメールの編集と証跡削除', description: '誤字救済編集と削除アーカイブへの理由別物理保全' },
        { id: '2-3', title: '2-3. 奇跡の物語 (Success Stories) 掲載管理', description: '感動的な再会実例の審査・編集・公開トグル' }
      ]
    },
    {
      id: 'cat-3',
      categoryTitle: '3. AI安全防衛・セキュリティ',
      icon: Bot,
      sections: [
        { id: '3-1', title: '3-1. Gemini 2.5 Flash リアルタイム文脈検閲', description: 'ストーカー・怨恨・個人情報の自律判定と自動隔離' },
        { id: '3-2', title: '3-2. 安全防衛シミュレーター (50選大図鑑)', description: 'AI判定挙動のテスト検証とスコア確認' },
        { id: '3-3', title: '3-3. ユーザー通報キュー審査とNGワード辞書', description: '通報トリアージ・アカウント即時凍結・NG辞書運用' }
      ]
    },
    {
      id: 'cat-4',
      categoryTitle: '4. ユーザー対応・配信',
      icon: Mail,
      sections: [
        { id: '4-1', title: '4-1. お問い合わせSLAと緊急度別トリアージ', description: '未対応/保留/完了管理とAI自動優先度判定' },
        { id: '4-2', title: '4-2. 送信メールテンプレート管理 (全8種)', description: '通知メール文面のプレビューとテスト送信手順' },
        { id: '4-3', title: '4-3. 全体一括プッシュ通知配信と誤送信防止', description: '規約改定・防犯啓発の全体ブロードキャスト' }
      ]
    },
    {
      id: 'cat-5',
      categoryTitle: '5. 決済・eKYC・収益試算',
      icon: CreditCard,
      sections: [
        { id: '5-1', title: '5-1. 決済トランザクション台帳とワンクリック返金', description: 'Stripe入出金一覧・手動返金実行・CSV出力' },
        { id: '5-2', title: '5-2. 売上・原価・粗利アナリティクス (+366円/件)', description: 'Stripe/SMS/eKYC原価控除後の純利益モデル' },
        { id: '5-3', title: '5-3. eKYC身元確認ログと非保持ルール', description: 'TRUSTDOCK連携・身分証画像非保持・監査証跡' },
        { id: '5-4', title: '5-4. Stripe Sandbox 模擬決済・返金テスト', description: '管理画面からのテスト決済発行とWebhook疎通確認' },
        { id: '5-5', title: '5-5. 課金モデル収益シミュレーター運用', description: '損益分岐点(BEP)・4大成長フェーズ・パラメータ調整' }
      ]
    },
    {
      id: 'cat-6',
      categoryTitle: '6. システム管理・インフラ診断',
      icon: Server,
      sections: [
        { id: '6-1', title: '6-1. 動的APIレート制限スライダー調整', description: 'Auth/Post/Search秒間上限のリアルタイム調整とDoS遮断' },
        { id: '6-2', title: '6-2. DB健康診断 (VACUUM/PRAGMA/最適化)', description: '断片化測定・インデックス再構築・実行タイミング' },
        { id: '6-3', title: '6-3. 不正アクセス監視・悪質IP遮断・監査ログ', description: '401/403/429ログ監視とIPブラックリスト登録' },
        { id: '6-4', title: '6-4. バージョン履歴 (Semantic Versioning)', description: 'Gitコミット連動の変更履歴追跡とデプロイ管理' }
      ]
    },
    {
      id: 'cat-7',
      categoryTitle: '7. M&A企業価値・マスター備忘録',
      icon: Award,
      sections: [
        { id: '7-1', title: '7-1. M&A企業価値評価 (DCF/EBITDAマルチプル)', description: 'デュアル算定エンジン・知的財産目録・IM出力' },
        { id: '7-2', title: '7-2. 17大本番デプロイマスターチェックリスト', description: 'インフラ・DB・API・規約の公開前確認手順' },
        { id: '7-3', title: '7-3. 警察・公安照会基準マニュアル (刑訴法197条)', description: '捜査関係事項照会書受領時の開示手順と保全ログ一覧' },
        { id: '7-4', title: '7-4. 責任の所在 10大決定事項チェックリスト', description: '偽造免責・SMS不達返金・AI誤検知免責の法的合意' }
      ]
    },
    {
      id: 'cat-8',
      categoryTitle: '8. デザインシステム (UI/UX Specs)',
      icon: Palette,
      sections: [
        { id: '8-1', title: '8-1. ReMEETs 4大設計原則 (情緒と法的信頼)', description: '情緒と法的信頼・改行禁止・角丸ネスト・600円明朗' },
        { id: '8-2', title: '8-2. カラー・タイポグラフィトークン仕様', description: '16色パレット(WCAG AAA/AA)・和文黄金比・余白体系' },
        { id: '8-3', title: '8-3. UIパーツ・ボタン状態・トーストテスター', description: 'ボタン状態検証・トースト発火・四季テーマ切り替え' }
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

  // =========================================================================
  // 📚 HIGHLY DETAILED & ACTIONABLE SECTION CONTENT RENDERER (全25節の本格SOP)
  // =========================================================================
  const renderSectionDetail = (id: string) => {
    switch (id) {
      // 1-1
      case '1-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-teal-700" />
                【基本原則】管理者責任と個人情報保護の絶対遵守方針
              </span>
              <p className="text-xs text-teal-950 leading-relaxed font-serif">
                ReMEETsは、お相手の「名前」と「二人だけの想い出クイズ」を照合鍵とすることで、一般の掲示板のような不特定多数への個人情報露出を完全に遮断しています。
                管理者は全ボトル原文、監査ログ、クイズ履歴へのアクセスが可能ですが、電気通信事業法第4条「通信の秘密」および個人情報保護法に基づき、極めて重い法的責任と守秘義務を負います。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2 border-b border-brand-border pb-2">
                <span>1. 管理者が厳守すべき4大行動規範</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-rose-900 block">① 私的目的の覗き見・検索の絶対禁止</span>
                  <p className="text-[11px] text-black/70">
                    面識のない第三者の手紙本文やクイズ解答履歴を興味本位で検索・閲覧する行為は即時懲戒解雇および刑事告発の対象となります。管理画面上の全検索・全閲覧は管理者IDとIPアドレス付きで暗号化ログに記録されます。
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-amber-900 block">② 外部口外・SNSスクリーンショット共有の禁止</span>
                  <p className="text-[11px] text-black/70">
                    管理画面に表示されるユーザーデータ（ニックネーム、想い出エピソード、決済情報等）をSNSや外部掲示板へ転載する行為は固く禁止されます。
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-teal-900 block">③ 実名照合フィルターの常時保守</span>
                  <p className="text-[11px] text-black/70">
                    日本の常用姓名（約3,000姓）や主要SNS ID（LINE, Twitter, Instagram等）が含まれる投函は、一般の海へは流さず自動的にAI隔離キュー（<code>ai_flagged = 1</code>）へ振り分ける設定を維持します。
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-sky-900 block">④ 警察・捜査機関からの照会手順の厳守</span>
                  <p className="text-[11px] text-black/70">
                    警察署や裁判所からの照会であっても、正式な「捜査関係事項照会書」または「差押令状」を受領するまでは電話や口頭での情報開示は一切行いません（第7章-3参照）。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Lock size={16} className="text-teal-700" />
                <span>2. 個人情報ゼロ保持（Zero Data Retention）技術仕様</span>
              </h4>
              <p className="text-[11px] text-black/70">
                万が一Webサーバーが侵害された場合でもユーザーの致命的な個人情報が漏洩しないよう、以下のゼロ保持アーキテクチャを採用しています。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">データ種別</th>
                      <th className="p-2 border border-brand-border">Webサーバー上の扱い</th>
                      <th className="p-2 border border-brand-border">実データの保管場所</th>
                      <th className="p-2 border border-brand-border">セキュリティ効果</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">運転免許証・マイナ原本画像</td>
                      <td className="p-2 border border-brand-border text-rose-700 font-bold">一切保持しない (0バイト)</td>
                      <td className="p-2 border border-brand-border">TRUSTDOCK / LIQUID eKYC専用サーバー</td>
                      <td className="p-2 border border-brand-border">身分証画像漏洩リスクの完全排除</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">クレジットカード番号・CVV</td>
                      <td className="p-2 border border-brand-border text-rose-700 font-bold">一切通過・保存しない</td>
                      <td className="p-2 border border-brand-border">Stripe PCI-DSS Level 1 サーバー</td>
                      <td className="p-2 border border-brand-border">カード不正利用・加盟店責任の回避</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">開示用連絡先 (LINE ID/メアド)</td>
                      <td className="p-2 border border-brand-border">AES-256 暗号化保管</td>
                      <td className="p-2 border border-brand-border">本番PostgreSQL (暗号化カラム)</td>
                      <td className="p-2 border border-brand-border">クイズ正解＋決済完了者のみ復号引き渡し</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // 1-2
      case '1-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              内部不正や誤操作によるデータ破損・情報漏洩を防ぐため、管理画面はロールベースアクセス制御（RBAC: 4階層）によってアクセス権限が厳格に分離されています。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 4階層ロール定義と権限マトリクス
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">ロール名</th>
                      <th className="p-2 border border-brand-border">主な対象者</th>
                      <th className="p-2 border border-brand-border">許可アクション</th>
                      <th className="p-2 border border-brand-border">制限・禁止事項</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold text-purple-900">👑 オーナー (Owner)</td>
                      <td className="p-2 border border-brand-border">事業責任者 / 創業者</td>
                      <td className="p-2 border border-brand-border">全画面アクセス、M&Aデータ室、DB初期化、APIキー更新、ロール任命</td>
                      <td className="p-2 border border-brand-border">制限なし (最高権限)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold text-teal-900">⚡ 最高管理者 (Admin)</td>
                      <td className="p-2 border border-brand-border">運用責任者 / CTO</td>
                      <td className="p-2 border border-brand-border">ユーザー管理、手紙編集・削除、手動返金実行、一括通知配信、レート制限調整</td>
                      <td className="p-2 border border-brand-border">M&Aデータ室閲覧不可、オーナーロール変更不可</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold text-sky-900">⚖️ 監査役 (Auditor)</td>
                      <td className="p-2 border border-brand-border">法務担当 / 社外監査人</td>
                      <td className="p-2 border border-brand-border">警察照会ログ出力、eKYC監査ログ閲覧、決済台帳・財務レポート閲覧</td>
                      <td className="p-2 border border-brand-border">データの変更・削除・返金等の破壊的操作不可</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold text-amber-900">🛡️ モデレーター (Moderator)</td>
                      <td className="p-2 border border-brand-border">CS / バイト運用スタッフ</td>
                      <td className="p-2 border border-brand-border">ユーザー通報審査、NGワード辞書登録、AI隔離ボトルの目視承認/却下</td>
                      <td className="p-2 border border-brand-border">決済返金、ユーザー削除、システム設定変更不可</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-teal-700" />
                <span>2. 管理者アカウントの追加・ロール変更手順</span>
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「RBAC権限」タブ</b> を開きます（OwnerまたはAdmin権限が必要）。</li>
                <li>「新規管理者を追加」ボタンをクリックし、対象者の <code>Google Workspace メールアドレス</code> を入力します。</li>
                <li>割り当てるロール（Moderator / Auditor / Admin）を選択し、「招待メールを送信」をクリックします。</li>
                <li>対象者が二要素認証（2FA）を設定してログイン完了すると、権限が有効化されます。</li>
                <li><b>退職・担当変更時の注意:</b> 対象アカウントの「即時無効化」ボタンを押し、セッションを強制切断してください。</li>
              </ol>
            </div>
          </div>
        );

      // 1-3
      case '1-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                【重要設計】連絡先安全引き渡し（セキュア・ブリッジ）モデル採用の法的理由
              </span>
              <p className="text-xs text-amber-900 leading-relaxed font-serif">
                アプリ内で継続的な1対1メッセージ機能を持たず、想い出の照合後に安全に連絡先（SNS ID / メール）を引き渡してプラットフォームの役割を完結させることで、「インターネット異性紹介事業」や「電気通信事業」の規制対象から根本的に完全非該当化し、法的・運営的リスクをゼロに抑えています。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 連絡先開示（引き渡し）完了までの4大ステップ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center font-mono text-[11px]">
                <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-xs space-y-1">
                  <span className="text-teal-700 block text-[10px] font-bold">STEP 1</span>
                  <b className="text-black block">想い出クイズ正解</b>
                  <p className="text-[10px] text-black/60 font-sans">二人だけの共通記憶を入力し完全一致</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-xs space-y-1">
                  <span className="text-teal-700 block text-[10px] font-bold">STEP 2</span>
                  <b className="text-black block">600円 Stripe決済</b>
                  <p className="text-[10px] text-black/60 font-sans">開通手数料のクレジット決済（仮売上）</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-xs space-y-1">
                  <span className="text-teal-700 block text-[10px] font-bold">STEP 3</span>
                  <b className="text-black block">eKYC ＋ SMS認証</b>
                  <p className="text-[10px] text-black/60 font-sans">携帯番号認証と公的本人確認</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 shadow-xs space-y-1">
                  <span className="text-emerald-700 block text-[10px] font-bold">STEP 4</span>
                  <b className="text-emerald-950 block">連絡先開示 ＆ 完結</b>
                  <p className="text-[10px] text-emerald-800 font-sans">LINE/メアドを表示し差出人へ通知</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                2. 連絡先引き渡し3パターンの比較と実務仕様
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-bold text-[10px]">案1: シンプルブリッジ (採用)</span>
                  <h5 className="font-bold text-xs text-black">一方向・相互開示モデル</h5>
                  <p className="text-[11px] text-black/70">
                    照合・決済完了直後に画面上に連絡先を表示し、差出人へ「あなたのボトルが開通しました」と自動メール送信。アプリ内のやり取りは一切発生せず役割が完結。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="px-2 py-0.5 bg-zinc-200 text-black/70 rounded font-bold text-[10px]">案2: 感謝の1往復レター</span>
                  <h5 className="font-bold text-xs text-black">1通限定送信モデル</h5>
                  <p className="text-[11px] text-black/70">
                    開封者が「見つけてくれてありがとう」等の感謝メッセージを1回のみ送信し、差出人のメールへ転送して完結。情緒的満足度が高い設計。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="px-2 py-0.5 bg-zinc-200 text-black/70 rounded font-bold text-[10px]">案3: デジタルカード発行</span>
                  <h5 className="font-bold text-xs text-black">PDF記念証発行モデル</h5>
                  <p className="text-[11px] text-black/70">
                    手紙本文と連絡先がデザインされた記念デジタルレターカード（画像/PDF）を発行しダウンロード提供。記念品としての所有感を演出。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // 2-1
      case '2-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              管理画面の「ダッシュボード」タブでは、リアルタイムのシステム稼働状況、投関数、マッチング成立、収益状況を俯瞰できます。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 監視すべき主要KPI指標と異常検知ライン
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">KPI指標</th>
                      <th className="p-2 border border-brand-border">正常基準値</th>
                      <th className="p-2 border border-brand-border">異常判定ライン</th>
                      <th className="p-2 border border-brand-border">異常時の調査・アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">日次投関数 (New Letters)</td>
                      <td className="p-2 border border-brand-border">前日比 ±30%以内</td>
                      <td className="p-2 border border-brand-border text-rose-700 font-bold">急増 (+200%以上)</td>
                      <td className="p-2 border border-brand-border">スパム投函スクリプトの疑い。同一IPからの連続投函ログを調査しIP遮断。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">クイズ正解率 (Quiz Accuracy)</td>
                      <td className="p-2 border border-brand-border">15% 〜 35%</td>
                      <td className="p-2 border border-brand-border text-rose-700 font-bold">異常高率 (&gt; 80%)</td>
                      <td className="p-2 border border-brand-border">クイズ回答の辞書総当たり攻撃の疑い。レート制限（Rate Limit）を引き上げ。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">AI隔離率 (Flagged Ratio)</td>
                      <td className="p-2 border border-brand-border">3% 〜 8%</td>
                      <td className="p-2 border border-brand-border text-amber-700 font-bold">高率 (&gt; 15%)</td>
                      <td className="p-2 border border-brand-border">Gemini AIの判定閾値が過敏になっていないか「セキュリティ」タブで誤検知監査。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">未対応問い合わせ (Unresolved CS)</td>
                      <td className="p-2 border border-brand-border">0 〜 5件</td>
                      <td className="p-2 border border-brand-border text-rose-700 font-bold">24時間超過案件あり</td>
                      <td className="p-2 border border-brand-border">SLA違反アラート。担当モデレーターへ即時対応指示。</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <CheckSquare size={16} className="text-teal-700" />
                <span>2. 管理者日次ルーティンチェックリスト (朝10時 / 夕方18時)</span>
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-brand-border flex items-start gap-2">
                  <span className="font-bold text-teal-800">朝 10:00:</span>
                  <span>①「通報管理」の未処理件数を確認し、夜間通報を審査 → ②「お問い合わせ」の緊急案件（決済不備・アカウント凍結）を最優先返信 → ③DBヘルスチェック（断片化確認）。</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-brand-border flex items-start gap-2">
                  <span className="font-bold text-teal-800">夕 18:00:</span>
                  <span>①日次売上（Stripe入金額）の突合確認 → ②AI隔離ボトルの目視確認（誤検知の救済） → ③不正アクセスログ（403/429）の発生有無確認。</span>
                </div>
              </div>
            </div>
          </div>
        );

      // 2-2
      case '2-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
              <h4 className="font-bold text-sm text-black">ボトルメール管理 ＆ 証跡付きアーカイブ削除の基本方針</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                漂流中のボトルメール（手紙）はユーザーの想いが込められた大切なデータです。誤字脱字による連絡不能を救済するための「ダイレクト編集」と、規約違反や差出人申告による「証跡付き削除」を適切に執行します。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. ボトル編集・救済操作手順
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「ボトル管理」タブ</b> を開きます。</li>
                <li>キーワード、差出人ニックネーム、宛名、またはボトルIDで検索します。</li>
                <li>対象レコードの「編集」ボタンをクリックし、編集モーダルを開きます。</li>
                <li>誤字脱字、宛名の表記揺れ、または秘密の質問を修正します。</li>
                <li>「保存して反映」をクリックすると、監査ログに <code>POST_UPDATED_BY_ADMIN</code> が記録され、即座に画面へ反映されます。</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                2. 証跡付きアーカイブ削除（物理保全）手順
              </h4>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-950 space-y-2">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <AlertTriangle size={15} />
                  手紙削除時の厳格ルール: 削除理由の選択が必須
                </span>
                <p>
                  ReMEETsでは、手紙を削除してもデータベースから完全抹消（物理DELETE）せず、<code>deleted_posts</code> テーブルへ「実行管理者ID」「削除日時」「削除理由コード」「原文データ」を永久保全します。警察捜査やトラブル時の証拠保全のためです。
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">プリセット削除理由</th>
                      <th className="p-2 border border-brand-border">適用基準</th>
                      <th className="p-2 border border-brand-border">ユーザーへの通知</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">1. 攻撃的表現・誹謗中傷</td>
                      <td className="p-2 border border-brand-border">相手を罵倒・脅迫する文言が含まれる場合</td>
                      <td className="p-2 border border-brand-border">警告メール送信 ＋ アカウント凍結検討</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">2. 個人情報・実名の露出</td>
                      <td className="p-2 border border-brand-border">詳細住所、電話番号、勤務先等が明記されている場合</td>
                      <td className="p-2 border border-brand-border">削除通知メール（理由明記）送信</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">3. 差出人本人からの削除依頼</td>
                      <td className="p-2 border border-brand-border">お問い合わせ窓口より本人申告があった場合</td>
                      <td className="p-2 border border-brand-border">削除完了通知メール送信</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">4. 警察・裁判所命令</td>
                      <td className="p-2 border border-brand-border">刑事訴訟法に基づく令状・照会があった場合</td>
                      <td className="p-2 border border-brand-border">通知なし（捜査上の要請）</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // 2-3
      case '2-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              「奇跡の物語 (Success Stories)」は、ReMEETsを通じて実際に再会を果たしたユーザーの感動的な実例を掲載し、サービスの信頼性と情緒的価値を高める重要なコンテンツです。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 奇跡の物語の編集・公開フロー
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「奇跡の物語」タブ</b> を開きます。</li>
                <li>「新規ストーリー作成」または既存ストーリーの「編集」をクリックします。</li>
                <li>タイトル（例:「20年の時を超えて、小学校の恩師と再会」）、年代、都道府県、エピソード本文を入力します。</li>
                <li><b>個人情報マスキングチェック:</b> 実名が仮名（Aさん、T先生など）になっているか、学校名や勤務先が過度に特定されないか確認します。</li>
                <li>「トップページに掲載」トグルをONにし、「公開する」をクリックします。</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
              <h4 className="font-bold text-xs text-black">掲載時のチェックリスト</h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                <li>当事者双方から掲載許諾（またはアンケートでの公開同意）が得られていること。</li>
                <li>第三者のプライバシーを侵害する具体的なエピソードが含まれていないこと。</li>
                <li>再会の温かみと安心感が伝わる文章表現になっていること。</li>
              </ul>
            </div>
          </div>
        );

      // 3-1
      case '3-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block flex items-center gap-1.5">
                <Bot size={16} className="text-teal-700" />
                Gemini 2.5 Flash リアルタイムAI検閲エンジンの動作仕様
              </span>
              <p className="text-xs text-teal-950 leading-relaxed font-serif">
                ReMEETsでは、手紙投函時に Google Gemini 2.5 Flash API を呼び出し、文章の「ストーカー性」「脅迫・怨恨」「直接連絡先露出」「不当な出会い目的」をリアルタイムで多層判定します。危険判定された手紙は即座に隔離（<code>ai_flagged = 1</code>）され、一般タイムラインには一切流れません。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 4大検閲カテゴリと判定ロジック
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1.5">
                  <span className="font-bold text-xs text-rose-900 block">① ストーカー・執着・監視性</span>
                  <p className="text-[11px] text-black/70">
                    「毎日家の前を通っている」「今の旦那と別れてほしい」「居場所を突き止めた」等、一方的な執着や監視を示す文章を検知。スコア0.8以上で即時隔離。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1.5">
                  <span className="font-bold text-xs text-rose-900 block">② 脅迫・恐喝・恨み言</span>
                  <p className="text-[11px] text-black/70">
                    「絶対に許さない」「後悔させてやる」「金を返せ」等、金銭トラブルや復讐を示唆する文章を検知。スコア0.7以上で隔離＋通報起票。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1.5">
                  <span className="font-bold text-xs text-amber-900 block">③ 直接的な連絡先・個人情報の露出</span>
                  <p className="text-[11px] text-black/70">
                    電話番号、メールアドレス、LINE ID、住所、勤務先等の直接記載を正規表現とAI文脈認識の双方で検知。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1.5">
                  <span className="font-bold text-xs text-amber-900 block">④ 不当な出会い・性交目的</span>
                  <p className="text-[11px] text-black/70">
                    「今夜会える人」「割り切り募集」「パパ活」等、過去の想い出と無関係な無差別出会い表現を即時遮断。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black flex items-center gap-2">
                <Coins size={16} className="text-teal-700" />
                <span>2. AI検閲コストと粗利黒字化モデル</span>
              </h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                Gemini 2.5 Flash API の1回あたりの推論コストは約 <b>0.003円 〜 0.005円</b> と極めて安価です。開通手数料（600円）が1件発生するだけで、約 <b>120,000回分</b> のAI検閲費用が完全に相殺されます。
              </p>
            </div>
          </div>
        );

      // 3-2
      case '3-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              「セキュリティ」タブ内の「安全防衛シミュレーター」では、本番と同一のAI検閲エンジンを使用して、任意の文章や「50選大図鑑」のプリセット文をテスト実行できます。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. シミュレーターの操作手順
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「セキュリティ」タブ</b> を開きます。</li>
                <li>「50選大図鑑プリセット」から検証したいケース（例:「元交際相手への復縁迫り」「連絡先隠語」「同窓会の健全な思い出」など）を選択するか、テスト欄に直接テキストを入力します。</li>
                <li>「AI検閲テストを実行」ボタンをクリックします。</li>
                <li>右側に判定結果（合格: PASS / 隔離: FLAGGED / 危険: CRITICAL）、危険度スコア、検知理由、および推奨される管理者アクションが表示されます。</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2 text-[11px]">
              <span className="font-bold text-xs text-black block">💡 50選大図鑑の活用シーン</span>
              <ul className="list-disc pl-4 space-y-1 text-black/70">
                <li>新任モデレーターの研修・判断基準トレーニング用として活用。</li>
                <li>AIプロンプトの改訂時に、過去のボーダーライン事例が正しく判定されるかのリグレッションテストとして実行。</li>
              </ul>
            </div>
          </div>
        );

      // 3-3
      case '3-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. ユーザー通報（Reports）のトリアージと審査手順
              </h4>
              <p className="text-[11px] text-black/70">
                ユーザーから通報が寄せられた場合、「通報管理」タブにリアルタイムで起票されます。
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「通報管理」タブ</b> を開きます。</li>
                <li>通報理由（スパム・ストーカー・個人情報・不当出会い）と通報者のコメントを確認します。</li>
                <li>対象ボトルメールの原文、差出人ID、投函日時を精査します。</li>
                <li><b>処置の決定:</b>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-black/70">
                    <li><b>違反なし:</b>「却下（問題なし）」をクリックして通報をクローズ。</li>
                    <li><b>軽微な違反:</b>「手紙を非公開化」をクリック。</li>
                    <li><b>重大な違反（ストーカー・脅迫）:</b>「アカウント即時凍結（Block）」をクリック。当該ユーザーの全ボトルが非公開化され、新規ログインが遮断されます。</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                2. NGワード辞書管理の運用手順
              </h4>
              <p className="text-[11px] text-black/70">
                AI検閲をすり抜ける新しい隠語やスパムURLを即座に遮断するため、NGワード辞書をリアルタイム更新できます。
              </p>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2 text-[11px]">
                <span className="font-bold text-xs text-black block">登録マッチング種別:</span>
                <ul className="list-disc pl-4 space-y-1 text-black/70">
                  <li><b>完全一致 (Exact):</b> 指定した文字列がそのまま含まれる場合に遮断。</li>
                  <li><b>部分一致 (Partial):</b> ひらがな・カタカナの表記揺れを含めて検知。</li>
                  <li><b>正規表現 (Regex):</b> 電話番号パターン（<code>{`\\d{2,4}-\\d{2,4}-\\d{4}`}</code>）やSNS IDパターンを高度に遮断。</li>
                </ul>
              </div>
            </div>
          </div>
        );

      // 4-1
      case '4-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. お問い合わせ対応SLA（目標対応時間）
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">優先度</th>
                      <th className="p-2 border border-brand-border">該当する問い合わせ内容</th>
                      <th className="p-2 border border-brand-border">目標対応時間 (SLA)</th>
                      <th className="p-2 border border-brand-border">対応担当者</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold text-rose-700">🔴 緊急 (High)</td>
                      <td className="p-2 border border-brand-border">決済エラー・二重課金、誤凍結解除依頼、ストーカー緊急通報</td>
                      <td className="p-2 border border-brand-border font-bold">2時間以内</td>
                      <td className="p-2 border border-brand-border">最高管理者 (Admin)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold text-amber-700">🟡 通常 (Medium)</td>
                      <td className="p-2 border border-brand-border">eKYC再審査依頼、秘密の質問に関する問い合わせ、手紙削除依頼</td>
                      <td className="p-2 border border-brand-border font-bold">12時間以内</td>
                      <td className="p-2 border border-brand-border">モデレーター (Moderator)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold text-teal-700">🟢 低 (Low)</td>
                      <td className="p-2 border border-brand-border">機能要望、使い方に関する一般的な質問、応援メッセージ</td>
                      <td className="p-2 border border-brand-border font-bold">24時間以内</td>
                      <td className="p-2 border border-brand-border">モデレーター (Moderator)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black">2. ステータス管理と管理者対応メモの記録ルール</h4>
              <ol className="list-decimal pl-5 space-y-1.5 text-[11px] text-black/75">
                <li><b>未対応 (Unresolved):</b> 新規着信時のデフォルト状態。担当者が返信を開始する際に「保留中」へ変更。</li>
                <li><b>保留中 (Pending):</b> ユーザーからの追加身分証提出やエンジニア調査を待っている状態。</li>
                <li><b>完了 (Resolved):</b> メール送信完了し対応が完了した状態。</li>
                <li><b>必須事項:</b> 対応完了時は、必ず「管理者対応メモ」に対応日時、返信内容の要約、処理内容（例:「600円手動返金完了」「手紙ID:123削除完了」）を記録してください。</li>
              </ol>
            </div>
          </div>
        );

      // 4-2
      case '4-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              ReMEETsでは、ユーザーのアクションに応じて自動配信される全8種類のHTMLメールテンプレートを管理画面からプレビュー・テスト送信できます。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 送信メールテンプレート一覧（全8種）
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">ID</th>
                      <th className="p-2 border border-brand-border">テンプレート名</th>
                      <th className="p-2 border border-brand-border">トリガー条件</th>
                      <th className="p-2 border border-brand-border">主な内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-01</td>
                      <td className="p-2 border border-brand-border font-bold">ボトル投函完了通知</td>
                      <td className="p-2 border border-brand-border">手紙投函完了時</td>
                      <td className="p-2 border border-brand-border">手紙が海へ流されたことの報告と、マイページURL</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-02</td>
                      <td className="p-2 border border-brand-border font-bold">ボトル開封・クイズ正解通知</td>
                      <td className="p-2 border border-brand-border">お相手がクイズ正解時</td>
                      <td className="p-2 border border-brand-border">「お相手があなたを見つけました」という速報</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-03</td>
                      <td className="p-2 border border-brand-border font-bold">決済完了 ＆ 領収書</td>
                      <td className="p-2 border border-brand-border">600円Stripe決済完了時</td>
                      <td className="p-2 border border-brand-border">領収金額（600円）、インボイス情報、決済ID</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-04</td>
                      <td className="p-2 border border-brand-border font-bold">eKYC本人確認 承認完了</td>
                      <td className="p-2 border border-brand-border">身分証審査合格時</td>
                      <td className="p-2 border border-brand-border">本人確認完了と、連絡先開示画面へのリンク</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-05</td>
                      <td className="p-2 border border-brand-border font-bold">eKYC再提出依頼通知</td>
                      <td className="p-2 border border-brand-border">身分証不鮮明等で不合格時</td>
                      <td className="p-2 border border-brand-border">不合格理由（光の反射、有効期限切れ等）と再提出手順</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-06</td>
                      <td className="p-2 border border-brand-border font-bold">連絡先開示完了（再会成立）</td>
                      <td className="p-2 border border-brand-border">双方向の引き渡し完了時</td>
                      <td className="p-2 border border-brand-border">お相手の連絡先（LINE ID/メアド）の安全な引き渡し</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-07</td>
                      <td className="p-2 border border-brand-border font-bold">返金手続き完了通知</td>
                      <td className="p-2 border border-brand-border">Stripe返金処理実行時</td>
                      <td className="p-2 border border-brand-border">600円全額返金の案内とカード会社反映時期</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">TPL-08</td>
                      <td className="p-2 border border-brand-border font-bold">利用規約違反・警告通知</td>
                      <td className="p-2 border border-brand-border">モデレーターによる警告時</td>
                      <td className="p-2 border border-brand-border">違反内容の告知とアカウント利用停止措置の告知</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2 text-[11px]">
              <span className="font-bold text-xs text-black block">テスト送信手順:</span>
              <p className="text-black/70">
                「メールテンプレート」タブで任意のテンプレートを選択し、自身のメールアドレスを入力して「テスト送信」をクリックすると、実際のレイアウト崩れや変数置換を即座に確認できます。
              </p>
            </div>
          </div>
        );

      // 4-3
      case '4-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              利用規約の改訂、システムメンテナンス、防犯啓発などの重要アナウンスを全ユーザーへ一括配信（ブロードキャスト）する手順です。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 一括配信の作成・配信手順
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「お知らせ配信」タブ</b> を開きます。</li>
                <li>配信種別（重要告知 / メンテナンス / 防犯注意喚起 / キャンペーン）を選択します。</li>
                <li>タイトルと配信本文を入力します。Markdown記法によるリンクや箇条書きが利用可能です。</li>
                <li><b>プレビュー確認:</b> 右側のリアルタイムプレビューでスマートフォン表示での改行崩れがないか確認します。</li>
                <li><b>誤配信防止の安全確認:</b>「送信対象人数（全〇名）」を確認し、確認モーダルで「配信を確定する」をクリックします。</li>
              </ol>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
              <span className="font-bold text-amber-900 block">⚠️ 配信時の注意点</span>
              <p>
                深夜帯（22:00 〜 翌8:00）の一括配信はユーザー通知音による迷惑を避けるため原則禁止とします。緊急障害時を除き、平日11:00〜14:00または18:00〜20:00の配信を推奨します。
              </p>
            </div>
          </div>
        );

      // 5-1
      case '5-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 決済トランザクション台帳の確認項目
              </h4>
              <p className="text-[11px] text-black/70">
                Stripe経由で発生したすべての開通手数料決済（600円）は「決済台帳」タブでリアルタイムに記録されます。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">記録項目</th>
                      <th className="p-2 border border-brand-border">フォーマット例</th>
                      <th className="p-2 border border-brand-border">役割・用途</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">Stripe PaymentIntent ID</td>
                      <td className="p-2 border border-brand-border font-mono">pi_3MtwL2LkdIwHu7ix28a3tqZp</td>
                      <td className="p-2 border border-brand-border">Stripeダッシュボードとの突合キー</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">金額 / 通貨</td>
                      <td className="p-2 border border-brand-border font-mono">¥600 (JPY)</td>
                      <td className="p-2 border border-brand-border">連絡先開通手数料</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">決済ステータス</td>
                      <td className="p-2 border border-brand-border font-mono">succeeded / refunded</td>
                      <td className="p-2 border border-brand-border">売上確定 / 返金完了の区分</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-bold">照合ボトルID</td>
                      <td className="p-2 border border-brand-border font-mono">post_8841</td>
                      <td className="p-2 border border-brand-border">開通対象の手紙レコードへのリンク</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                2. ワンクリック手動返金（Refund）の執行手順
              </h4>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2 text-[11px]">
                <span className="font-bold text-xs text-black block">返金の適用条件:</span>
                <ul className="list-disc pl-4 space-y-1 text-black/70">
                  <li>ユーザーがクイズに誤答したにもかかわらず決済が完了してしまった場合（システム救済）。</li>
                  <li>eKYC審査で有効な身分証が提出できず、開通を辞退する場合。</li>
                  <li>開通相手が既に退会しており連絡先が取得不能だった場合。</li>
                </ul>
                <div className="pt-2">
                  <span className="font-bold text-xs text-black block">操作手順:</span>
                  <p className="text-black/70 mt-1">
                    対象トランザクションの「返金を実行」ボタンをクリックし、返金理由（ユーザー都合 / システム不備 / 重複課金）を選択して確定します。Stripe API経由で即座にカード会社へ返金データが送信され、自動で領収返金メールがユーザーへ配信されます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // 5-2
      case '5-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block flex items-center gap-1.5">
                <Coins size={16} className="text-teal-700" />
                1トランザクション（600円）あたりの原価・粗利分解モデル
              </span>
              <p className="text-xs text-teal-950 leading-relaxed font-serif">
                ReMEETsのビジネスモデルは、決済手数料（Stripe）、SMS送信費、eKYC本人確認従量費をすべて1件600円の手数料の中に織り込み、<b>1件あたり+366円の純利益（粗利率61.0%）</b> を確実に残す高収益設計です。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. コスト・粗利分解シミュレーション表
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">項目</th>
                      <th className="p-2 border border-brand-border">金額 (税込)</th>
                      <th className="p-2 border border-brand-border">売上比率</th>
                      <th className="p-2 border border-brand-border">支払先 / 備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-emerald-50 font-bold">
                      <td className="p-2 border border-brand-border text-emerald-950">【売上】開通手数料</td>
                      <td className="p-2 border border-brand-border text-emerald-950">+600円</td>
                      <td className="p-2 border border-brand-border text-emerald-950">100.0%</td>
                      <td className="p-2 border border-brand-border">エンドユーザーからの決済収入</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border text-rose-800">【控除】Stripe決済手数料 (3.6%)</td>
                      <td className="p-2 border border-brand-border text-rose-800">-22円</td>
                      <td className="p-2 border border-brand-border text-rose-800">3.6%</td>
                      <td className="p-2 border border-brand-border">Stripe Japan (カード決済手数料)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border text-rose-800">【控除】SMS電話番号認証送信費 (1通)</td>
                      <td className="p-2 border border-brand-border text-rose-800">-12円</td>
                      <td className="p-2 border border-brand-border text-rose-800">2.0%</td>
                      <td className="p-2 border border-brand-border">Twilio / EZSMS (従量通信費)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border text-rose-800">【控除】eKYC本人確認従量費 (1回)</td>
                      <td className="p-2 border border-brand-border text-rose-800">-200円</td>
                      <td className="p-2 border border-brand-border text-rose-800">33.3%</td>
                      <td className="p-2 border border-brand-border">TRUSTDOCK / LIQUID eKYC (身分証照合費)</td>
                    </tr>
                    <tr className="bg-teal-50 font-bold text-teal-950">
                      <td className="p-2 border border-brand-border">【純利益】1トランザクション粗利</td>
                      <td className="p-2 border border-brand-border text-teal-900 font-mono text-sm">+366円</td>
                      <td className="p-2 border border-brand-border text-teal-900 font-mono">61.0%</td>
                      <td className="p-2 border border-brand-border">運営純利益（黒字化確定）</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2 text-[11px]">
              <span className="font-bold text-xs text-black block">💡 サーバー固定費の回収試算</span>
              <p className="text-black/70 leading-relaxed">
                Cloud Run / PostgreSQL などの月額インフラ固定費（約 15,000円）は、月間わずか <b>41件</b> の連絡先開通決済が発生するだけで全額回収され、それ以降の決済はすべて純利益となります。
              </p>
            </div>
          </div>
        );

      // 5-3
      case '5-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black">eKYC身元確認ログと非保持ルールの技術仕様</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                ReMEETsでは、TRUSTDOCK等の専門eKYC事業者のAPIと連携し、ユーザーの運転免許証・マイナンバーカードによる公的身元確認を実施します。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. `age_verification_logs` テーブルに保存される監査メタデータ
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">カラム名</th>
                      <th className="p-2 border border-brand-border">保存される値</th>
                      <th className="p-2 border border-brand-border">セキュリティ処理</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">verification_id</td>
                      <td className="p-2 border border-brand-border">ekyc_tx_998124</td>
                      <td className="p-2 border border-brand-border">一意の取引識別子</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">vendor_token</td>
                      <td className="p-2 border border-brand-border">td_token_abc123...</td>
                      <td className="p-2 border border-brand-border">eKYC事業者側の照会トークン</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">status</td>
                      <td className="p-2 border border-brand-border">APPROVED / REJECTED</td>
                      <td className="p-2 border border-brand-border">審査結果ステータス</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">verified_age_bracket</td>
                      <td className="p-2 border border-brand-border">OVER_18 (18歳以上)</td>
                      <td className="p-2 border border-brand-border">生年月日の生データではなく年齢区分のみ保持</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">id_card_image</td>
                      <td className="p-2 border border-brand-border text-rose-700 font-bold">NULL (非保持)</td>
                      <td className="p-2 border border-brand-border">身分証画像はWebサーバー上に一切保存しない</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // 5-4
      case '5-4':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              「決済管理」タブ内の「Stripe Sandbox」では、本番のクレジットカードを使用せずに、擬似的な決済発行・Webhook受信・返金の動作検証を行えます。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 模擬決済テストの手順
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「決済管理」タブ</b> を開きます。</li>
                <li>「Sandbox テスト環境」を選択します。</li>
                <li>「テスト決済 (¥600) をシミュレート」ボタンをクリックします。</li>
                <li>Stripe Webhook (<code>payment_intent.succeeded</code>) が即座にトリガーされ、決済台帳にテストレコードが追加されます。</li>
                <li>続いて「テスト返金をシミュレート」をクリックし、返金ステータスへの切り替えおよび返金メール発火を確認します。</li>
              </ol>
            </div>
          </div>
        );

      // 5-5
      case '5-5':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              「収益シミュレーター」タブでは、MAU、投函率、クイズ正解率、オプション単価などのパラメータを動的に変更し、サービスの4大成長フェーズにおける売上・原価・損益分岐点（BEP）を予測できます。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 4大成長フェーズの想定規模
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1">
                  <span className="font-bold text-xs text-teal-900 block">① 立ち上げ期 (Phase 1: 1〜3ヶ月)</span>
                  <p className="text-[11px] text-black/70">MAU 3,000人 / 月間決済 100件 / 月商 6.0万円 / 純利益 +3.6万円 (BEP達成)</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1">
                  <span className="font-bold text-xs text-teal-900 block">② 成長拡大期 (Phase 2: 4〜12ヶ月)</span>
                  <p className="text-[11px] text-black/70">MAU 25,000人 / 月間決済 1,200件 / 月商 72.0万円 / 純利益 +43.9万円</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1">
                  <span className="font-bold text-xs text-teal-900 block">③ 成熟安定期 (Phase 3: 2〜3年目)</span>
                  <p className="text-[11px] text-black/70">MAU 100,000人 / 月間決済 5,500件 / 月商 330.0万円 / 純利益 +201.3万円</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-1">
                  <span className="font-bold text-xs text-teal-900 block">④ グローバル・他言語展開 (Phase 4)</span>
                  <p className="text-[11px] text-black/70">MAU 500,000人 / 月間決済 30,000件 / 月商 1,800.0万円 / 純利益 +1,098.0万円</p>
                </div>
              </div>
            </div>
          </div>
        );

      // 6-1
      case '6-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black">動的APIレート制限（Rate Limiting）スライダーの役割</h4>
              <p className="text-[11px] text-black/70 leading-relaxed">
                悪意のあるクイズ総当たりスクリプトやDoS攻撃からサーバーを守るため、管理画面の「システム設定」タブからリアルタイムに秒間APIアクセス上限（req/sec）を調整できます。サーバーの再起動は不要です。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. エンドポイント別推奨レート制限値
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">対象エンドポイント</th>
                      <th className="p-2 border border-brand-border">通常時推奨値</th>
                      <th className="p-2 border border-brand-border">攻撃検知時推奨値</th>
                      <th className="p-2 border border-brand-border">制限超過時の挙動</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">/api/auth/* (認証系)</td>
                      <td className="p-2 border border-brand-border font-bold">5 req/秒</td>
                      <td className="p-2 border border-brand-border font-bold text-rose-700">2 req/秒</td>
                      <td className="p-2 border border-brand-border">HTTP 429 Too Many Requests (60秒ブロック)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">/api/posts/create (投函)</td>
                      <td className="p-2 border border-brand-border font-bold">2 req/秒</td>
                      <td className="p-2 border border-brand-border font-bold text-rose-700">1 req/秒</td>
                      <td className="p-2 border border-brand-border">HTTP 429 投函一時待機メッセージ表示</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">/api/quiz/answer (回答)</td>
                      <td className="p-2 border border-brand-border font-bold">3 req/秒</td>
                      <td className="p-2 border border-brand-border font-bold text-rose-700">1 req/秒</td>
                      <td className="p-2 border border-brand-border">同一IPからの回答を5分間ロック</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">/api/posts/search (検索)</td>
                      <td className="p-2 border border-brand-border font-bold">10 req/秒</td>
                      <td className="p-2 border border-brand-border font-bold text-amber-700">5 req/秒</td>
                      <td className="p-2 border border-brand-border">HTTP 429 検索スロットリング</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // 6-2
      case '6-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. データベース健康診断（VACUUM / PRAGMA / 整合性チェック）
              </h4>
              <p className="text-[11px] text-black/70">
                長期間の運用により蓄積された削除レコードの断片化を解消し、検索クエリの応答速度を最高速に保つためのメンテナンス手順です。
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「システム診断」タブ</b> を開きます。</li>
                <li>現在の「DB断片化率（Fragmentation Ratio）」と「インデックス健全性スコア」を確認します。</li>
                <li>断片化率が <b>15% 以上</b> の場合、「DB最適化 (VACUUM & REINDEX) を実行」ボタンをクリックします。</li>
                <li>バックグラウンドでインデックスの再構築と未使用領域の解放が実行され、約3〜5秒で完了します。</li>
                <li><b>実行推奨時間:</b> 本番環境ではアクセスが最も少ない <b>深夜 3:00 〜 5:00</b> の実行を推奨します。</li>
              </ol>
            </div>
          </div>
        );

      // 6-3
      case '6-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 不正アクセス監視と悪質IPの即時遮断手順
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>管理画面「システムログ」タブ</b> を開きます。</li>
                <li>ステータスコードフィルターで <code>401 (認証エラー)</code>、<code>403 (権限拒否)</code>、<code>429 (レート制限超過)</code> を絞り込みます。</li>
                <li>同一IPから短時間に数百回以上のアクセスが集中している場合、対象レコードの「このIPをブラックリスト登録」をクリックします。</li>
                <li>即座に <code>ip_blacklist</code> テーブルへ追加され、Webサーバーのミドルウェア層でアクセスが完全遮断されます。</li>
              </ol>
            </div>
          </div>
        );

      // 6-4
      case '6-4':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. セマンティック・バージョニング規則と改訂履歴管理
              </h4>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2 text-[11px]">
                <span className="font-bold text-xs text-black block">バージョン命名規則 (SemVer):</span>
                <ul className="list-disc pl-4 space-y-1 text-black/70">
                  <li><b>Major (X.0.0):</b> 連絡先開示モデルへの全面刷新など、破壊的変更やアーキテクチャ変更時。</li>
                  <li><b>Minor (1.X.0):</b> 新機能タブ（M&Aデータ室、収益シミュレーター等）の追加時。</li>
                  <li><b>Patch (1.2.X):</b> バグ修正、セキュリティパッチ、文言修正時。</li>
                </ul>
              </div>
            </div>
          </div>
        );

      // 7-1
      case '7-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block flex items-center gap-1.5">
                <Award size={16} className="text-teal-700" />
                M&A企業価値評価 (デュアル算定エンジン) の仕様と活用法
              </span>
              <p className="text-xs text-teal-950 leading-relaxed font-serif">
                ReMEETsの事業譲渡・M&A・資金調達を想定し、客観的な財務理論に基づく「EBITDAマルチプル法 (5〜8倍)」と「割引現在価値法 (DCF法 / 割引率8%)」のデュアルエンジンで企業価値（Enterprise Value）をリアルタイム自動算定します。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. デュアル算定モデルの理論式
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-black block">① EBITDA マルチプル法</span>
                  <div className="p-2 bg-slate-900 text-teal-300 rounded font-mono text-[10px]">
                    企業価値 = (年間売上 - 変動費 - 固定費) × マルチプル (5.0x 〜 8.0x)
                  </div>
                  <p className="text-[11px] text-black/70">
                    SaaS/マッチングプラットフォーム業界の平均マルチプル（6.5倍）を基準に、早期イグジット時の評価額を算出。
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-black block">② DCF法 (Discounted Cash Flow)</span>
                  <div className="p-2 bg-slate-900 text-teal-300 rounded font-mono text-[10px]">
                    EV = Σ [ FCF_t / (1 + WACC)^t ] + 永久還元価値 (TV)
                  </div>
                  <p className="text-[11px] text-black/70">
                    将来5年間のフリーキャッシュフローを割引率 WACC = 8.0%、永久成長率 g = 1.5% で現在価値に割り戻して算出。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-3">
              <h4 className="font-bold text-sm text-black">2. M&A買収監査用インフォメーション・メモランダム (IM) 出力</h4>
              <p className="text-[11px] text-black/70">
                「M&Aデータ室」タブから「公式IM (Information Memorandum) を出力」をクリックすると、知的財産目録、特許性（想い出クイズ照合）、ソースコード資産一覧、財務試算が網羅されたデューデリジェンス用資料を一括出力できます。
              </p>
            </div>
          </div>
        );

      // 7-2
      case '7-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block">
                【本番公開必須】ReMEETs 17大マスターデプロイチェックリスト
              </span>
              <p className="text-xs text-teal-950 leading-relaxed font-serif">
                本番環境（Google Cloud Run / Supabase / Stripe等）へデプロイしサービス提供を開始する前に、以下の17項目を必ず完了・点検してください。
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                <span className="font-bold text-xs text-teal-950 block">【A. インフラ・DB基盤 (3項目)】</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                  <li><b>1. 本番用 PostgreSQL のプロビジョニング:</b> Supabase / Cloud SQL インスタンスの作成。</li>
                  <li><b>2. DATABASE_URL 環境変数の設定:</b> Cloud Run のシークレットマネージャーに設定。</li>
                  <li><b>3. 初期テーブルマイグレーション:</b> Drizzle ORM でテーブル構造を一括適用。</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                <span className="font-bold text-xs text-teal-950 block">【B. 外部API・決済キー (3項目)】</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                  <li><b>4. Gemini API 商用キーの発行:</b> Vertex AI / Google AI Studio の従量課金有効化キー設定。</li>
                  <li><b>5. Resend / SendGrid メール配信設定:</b> 独自ドメインの SPF/DKIM/DMARC 設定完了。</li>
                  <li><b>6. Stripe 本番キー ＆ Webhook署名:</b> 加盟店審査通過後の本番シークレットキーとWebhookエンドポイント設定。</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                <span className="font-bold text-xs text-teal-950 block">【C. 本番データ管理 (2項目)】</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                  <li><b>7. 開発用テストデータの完全初期化:</b> デバッグユーザー・テスト手紙の一括削除。</li>
                  <li><b>8. 情緒豊かな300件サンプルデータのSeeding:</b> ローンチ初期の寂しさを排除する良質サンプル投入。</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                <span className="font-bold text-xs text-teal-950 block">【D. SNS認証連携 (2項目)】</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                  <li><b>9. LINE / Google Developers クライアント作成:</b> 本番ドメインのリダイレクトURI設定。</li>
                  <li><b>10. 認証シークレット環境変数の追記:</b> <code>LINE_CHANNEL_SECRET</code>, <code>GOOGLE_CLIENT_SECRET</code> 等。</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                <span className="font-bold text-xs text-teal-950 block">【E. 法務・規約・制定日 (4項目)】</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                  <li><b>11. 利用規約 (TOS) のSNS条項追加:</b> 捨てアカ対策、思い出データ保持ポリシー明記。</li>
                  <li><b>12. プライバシーポリシー (PP) のOAuth明記:</b> 取得するニックネーム・メアドの利用範囲開示。</li>
                  <li><b>13. 特定商取引法表記の整備:</b> バーチャルオフィス住所および050電話番号の記載。</li>
                  <li><b>14. 制定日・施行日を「2026年8月15日」に統一確定:</b> 全法的文書の末尾日付の完全同期。</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                <span className="font-bold text-xs text-teal-950 block">【F. 運用セキュリティ ＆ G. 疎通テスト (3項目)】</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                  <li><b>15. DB日次自動バックアップ (PITR) の有効化:</b> 世代管理7〜14日間の設定。</li>
                  <li><b>16. スロットリング型動的APIレート制限の有効化:</b> Auth 5req/s, Post 2req/s の固定。</li>
                  <li><b>17. eKYC ＋ 電子的宣誓 ＋ Stripe決済の最終疎通テスト:</b> 本番同様フローでの正常動作検証。</li>
                </ul>
              </div>
            </div>
          </div>
        );

      // 7-3
      case '7-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                【警察・公安・裁判所】刑事訴訟法第197条第2項に基づく捜査関係事項照会対応基準
              </span>
              <p className="text-xs text-amber-900 leading-relaxed font-serif">
                刑事事件（ストーカー、脅迫、詐欺等）の捜査において、警察署長または検察官から正式な照会書を受領した場合の標準対応手順です。通信の秘密を守りつつ、法令に基づく正当な開示を迅速に行います。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 照会書受領時の実務フロー（3ステップ）
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px] text-black/75">
                <li><b>原本確認 ＆ 警察署への在籍確認:</b> FAXまたは郵送で届いた照会書の「事件名」「対象者特定情報」「公印」を確認し、記載された警察署の代表電話へ折り返して担当捜査官の在籍を確認します。</li>
                <li><b>管理画面からの該当データ抽出:</b>「監査ログ」タブまたは「警察照会用出力」機能を使用し、対象アカウントのログをCSV/JSON出力します。</li>
                <li><b>法務責任者の承認と書面送付:</b> オーナーまたは法務責任者が開示範囲を承認の上、公用封筒にて管轄警察署へ郵送または手渡し交付します。</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                2. 開示可能なログ項目一覧
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">開示可能項目</th>
                      <th className="p-2 border border-brand-border">法的根拠</th>
                      <th className="p-2 border border-brand-border">開示不可・令状必須項目</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border">
                        ・SNS連携ID (LINE UID / Google ID)<br />
                        ・登録メールアドレス<br />
                        ・SMS認証された携帯電話番号<br />
                        ・eKYC承認公的氏名および年齢区分<br />
                        ・アクセスIPアドレスおよびタイムスタンプ<br />
                        ・AI隔離された脅迫・暴言メッセージの保全データ
                      </td>
                      <td className="p-2 border border-brand-border text-teal-900 font-bold">
                        刑事訴訟法第197条第2項<br />
                        （捜査関係事項照会書で開示可）
                      </td>
                      <td className="p-2 border border-brand-border text-rose-700">
                        ・事件と無関係な無実の第三者の通信内容<br />
                        ・事前の令状なきリアルタイム通信傍受<br />
                        （※これらは裁判所の差押令状が必須）
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // 7-4
      case '7-4':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              外部事業者（TRUSTDOCK、Twilio、Stripe等）との契約および利用規約に盛り込むべき、法的な責任の所在（Liability）の10大決定事項です。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. 責任の所在 10大決定事項一覧
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">No</th>
                      <th className="p-2 border border-brand-border">決定事項</th>
                      <th className="p-2 border border-brand-border">合意内容・免責の所在</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">1</td>
                      <td className="p-2 border border-brand-border font-bold">本人確認の正誤免責</td>
                      <td className="p-2 border border-brand-border">偽造身分証をeKYC審査がすり抜けた場合、運営は免責されeKYCベンダー責任とする。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">2</td>
                      <td className="p-2 border border-brand-border font-bold">SMS不達時の即時返金</td>
                      <td className="p-2 border border-brand-border">通信障害でSMSコードが届かず開通できなかった場合、600円を全額自動返金。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">3</td>
                      <td className="p-2 border border-brand-border font-bold">身分証生画像の非保持</td>
                      <td className="p-2 border border-brand-border">身分証原本画像はWebサーバーに一切保存せずeKYCサーバー側で保持し漏洩回避。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">4</td>
                      <td className="p-2 border border-brand-border font-bold">警察照会データ開示</td>
                      <td className="p-2 border border-brand-border">規約に捜査照会時の電話番号・IP開示を明記し、ユーザーからのプライバシー提訴を防御。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">5</td>
                      <td className="p-2 border border-brand-border font-bold">AI誤検知免責</td>
                      <td className="p-2 border border-brand-border">健全な手紙がAI誤検知で一時隔離された場合の機会損失について運営免責を明記。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">6</td>
                      <td className="p-2 border border-brand-border font-bold">eKYC不合格時コスト負担</td>
                      <td className="p-2 border border-brand-border">不鮮明画像による不合格コストをカバーするため、決済後の本人確認フローを固定。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">7</td>
                      <td className="p-2 border border-brand-border font-bold">SMS送信リトライ制限</td>
                      <td className="p-2 border border-brand-border">1番号あたり1日最大3回までに制限し、従量課金スパム攻撃による赤字破産を防止。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">8</td>
                      <td className="p-2 border border-brand-border font-bold">LINE公式追加課金対策</td>
                      <td className="p-2 border border-brand-border">通知はプッシュメッセージではなく無料メール通知およびアプリ内通知を優先。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">9</td>
                      <td className="p-2 border border-brand-border font-bold">退会時データ物理削除</td>
                      <td className="p-2 border border-brand-border">退会申請時にSNS連携UIDおよびeKYC側の照会データを即時物理抹消。</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">10</td>
                      <td className="p-2 border border-brand-border font-bold">Stripe手数料負担合意</td>
                      <td className="p-2 border border-brand-border">ユーザー都合の自己都合返金時は、決済手数料分を差し引くか免責とする旨を規約化。</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // 8-1
      case '8-1':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. ReMEETs 4大デザイン設計原則
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-teal-950 block">① 情緒（ノスタルジー）と法的信頼の両立</span>
                  <p className="text-[11px] text-black/70">
                    温かみのある和文フォント（明朝体・教科書体）とパステル調の海・砂浜カラーを用いつつ、法的警告や決済表示は極めてシャープで信頼性の高いUIで表現。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-teal-950 block">② 心理的負荷を下げないUI（勝手な改行禁止）</span>
                  <p className="text-[11px] text-black/70">
                    ボタン内や見出しにおいて不自然な単語の途中で改行されることを禁止し、<code>whitespace-nowrap</code> または <code>keep-all</code> を適用。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-teal-950 block">③ 角丸ネストの統一ルール</span>
                  <p className="text-[11px] text-black/70">
                    親コンテナ: <code>rounded-3xl (24px)</code> / 内側カード: <code>rounded-2xl (16px)</code> / ボタン・入力欄: <code>rounded-xl (12px)</code> の黄金比率を徹底。
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
                  <span className="font-bold text-xs text-teal-950 block">④ 料金の完全明朗性 (600円ポッキリ)</span>
                  <p className="text-[11px] text-black/70">
                    追加課金や月額自動更新のダークパターンを一切排除し、「お相手と繋がるときだけ600円」を画面全体で明朗表示。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // 8-2
      case '8-2':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-black border-b border-brand-border pb-2">
                1. カラーパレット・タイポグラフィトークン仕様
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-200/70 text-black">
                      <th className="p-2 border border-brand-border">トークン名</th>
                      <th className="p-2 border border-brand-border">カラーコード</th>
                      <th className="p-2 border border-brand-border">WCAG コントラスト比</th>
                      <th className="p-2 border border-brand-border">主な使用箇所</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">brand-primary</td>
                      <td className="p-2 border border-brand-border font-mono">#0f766e (Teal 700)</td>
                      <td className="p-2 border border-brand-border font-bold text-emerald-800">7.5:1 (AAA準拠)</td>
                      <td className="p-2 border border-brand-border">主要アクションボタン、重要ヘッダー</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">brand-dark</td>
                      <td className="p-2 border border-brand-border font-mono">#0f172a (Slate 900)</td>
                      <td className="p-2 border border-brand-border font-bold text-emerald-800">14.2:1 (AAA準拠)</td>
                      <td className="p-2 border border-brand-border">本文文字色、ダークヘッダー</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">brand-accent</td>
                      <td className="p-2 border border-brand-border font-mono">#f59e0b (Amber 500)</td>
                      <td className="p-2 border border-brand-border font-bold text-emerald-800">4.8:1 (AA準拠)</td>
                      <td className="p-2 border border-brand-border">星・クイズハイライト、注意バナー</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-brand-border font-mono">brand-border</td>
                      <td className="p-2 border border-brand-border font-mono">#e2e8f0 (Slate 200)</td>
                      <td className="p-2 border border-brand-border font-mono">UI Border</td>
                      <td className="p-2 border border-brand-border">全カードの外枠ボーダーライン</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // 8-3
      case '8-3':
        return (
          <div className="space-y-6 text-xs text-black/80 leading-relaxed">
            <p className="text-xs text-black/70 leading-relaxed">
              「デザインシステム」タブでは、ボタンの全状態（通常、ホバー、アクティブ、無効化、ローディング）、トースト通知の発火テスト、四季テーマの配色をリアルタイムで動作確認できます。
            </p>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-brand-border space-y-2">
              <span className="font-bold text-xs text-black block">🎨 四季カラーテーマの仕様</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-black/70">
                <li><b>春 (Spring / 桜色):</b> 背景に薄紅パステル、希望と再会の情緒を強調。</li>
                <li><b>夏 (Summer / 海色 - デフォルト):</b> エメラルドグリーン＆ティールブルー、波打ち際の爽やかさ。</li>
                <li><b>秋 (Autumn / 夕暮れ色):</b> 茜色＆アンバーゴールド、郷愁と温もりの想い出。</li>
                <li><b>冬 (Winter / 澄んだ夜空):</b> ディープスレート＆シルバーホワイト、静謐な手紙の世界。</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const scrollToSection = (secId: string) => {
    setSelectedSectionId(secId);
    setMobileMenuOpen(false);
    const element = document.getElementById(`section-${secId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToCategory = (catId: string) => {
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 🖨️ Inline Print Style for direct print/browser shortcut fallback */}
      <style>{`
        @media print {
          html, body, #root, main, .admin-container {
            height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-hidden, header, nav, aside {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      {/* 🧭 Top Banner & Actions */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-teal-50 text-teal-900 rounded-full text-xs font-bold mb-1.5 border border-teal-200">
            <BookOpen size={14} />
            <span>ReMEETs 管理画面操作マニュアル ＆ 運用標準手順書 (SOP)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-serif text-black flex items-center gap-2">
            <span>管理画面操作マニュアル（全編完全版）</span>
            <span className="text-xs font-serif font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              全8章・25節 一括閲覧
            </span>
          </h2>
          <p className="text-xs text-black/60 mt-0.5">
            左側の目次アンカーをクリックすると該当箇所へスムーズにジャンプします。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 text-black border border-brand-border cursor-pointer"
          >
            {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
            <span>目次メニュー</span>
          </button>

          {/* Print / PDF Download Button */}
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

      {/* 🧭 2-Column Documentation Layout (左目次メニュー ＋ 右シングルページ全編) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* 📑 LEFT SIDEBAR NAVIGATION (固定目次アンカー) */}
        <div className={`md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-4 md:sticky md:top-2 ${
          mobileMenuOpen ? 'block' : 'hidden md:block'
        }`}>
          {/* Sidebar Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="目次を検索..."
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
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-zinc-50 group">
                    <button
                      type="button"
                      onClick={() => scrollToCategory(cat.id)}
                      className="flex-1 flex items-center gap-2 text-xs font-bold text-black text-left cursor-pointer hover:text-teal-700 transition-colors"
                    >
                      <Icon size={14} className="text-teal-700 shrink-0" />
                      <span>{cat.categoryTitle}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="p-1 text-black/40 hover:text-black cursor-pointer"
                      title={isCollapsed ? "展開" : "折りたたむ"}
                    >
                      <ChevronDown size={14} className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* 見出し / 小見出しリスト (Sections) */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 pl-3 border-l-2 border-zinc-100 ml-3.5 my-1">
                      {cat.sections.map((sec) => {
                        const isSelected = selectedSectionId === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => scrollToSection(sec.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between group ${
                              isSelected
                                ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/80 shadow-xs'
                                : 'text-black/70 hover:bg-zinc-50 hover:text-black'
                            }`}
                          >
                            <span className="line-clamp-1">{sec.title}</span>
                            {sec.badge && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-serif font-bold shrink-0 ml-1 ${
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

        {/* 📖 RIGHT MAIN CONTENT AREA (全章・全節 一枚化スクロール ＆ アンカーターゲット) */}
        <div className="md:col-span-8 lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-brand-border shadow-sm space-y-12">
          {manualCategories.map((cat, catIdx) => (
            <div
              key={cat.id}
              id={`category-${cat.id}`}
              className="space-y-8 scroll-mt-6 border-b-2 border-zinc-100 pb-12 last:border-b-0 last:pb-0"
            >
              {/* 大見出しタイトル */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <cat.icon size={20} className="text-teal-400" />
                  <h3 className="font-bold text-base font-serif tracking-wide">{cat.categoryTitle}</h3>
                </div>
                <span className="text-[10px] font-serif text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  第 {catIdx + 1} 章
                </span>
              </div>

              {/* 各節のコンテンツ */}
              <div className="space-y-10 pl-1 sm:pl-2">
                {cat.sections.map((sec) => (
                  <div
                    key={sec.id}
                    id={`section-${sec.id}`}
                    className="space-y-4 scroll-mt-10 p-4 sm:p-5 rounded-2xl bg-zinc-50/50 border border-brand-border/70"
                  >
                    {/* 節ヘッダー */}
                    <div className="border-b border-brand-border/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-serif font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            § {sec.id}
                          </span>
                          <h4 className="font-bold text-base text-black font-serif">{sec.title}</h4>
                        </div>
                        <p className="text-xs text-black/60 mt-1">{sec.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(document.getElementById(`content-${sec.id}`)?.innerText || '')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-100 text-black transition-all cursor-pointer border border-brand-border shadow-2xs self-start sm:self-auto"
                      >
                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>コピー</span>
                      </button>
                    </div>

                    {/* 節本文 */}
                    <div id={`content-${sec.id}`} className="pt-2">
                      {renderSectionDetail(sec.id)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🖨️ HIDDEN PRINT TEMPLATE CONTAINER (印刷ウィンドウ生成用フルHTMLソース) */}
      <div id="all-sections-print-template" style={{ display: 'none' }}>
        {manualCategories.map((cat) => (
          <div key={cat.id} className="page-break pt-6 space-y-6">
            <div className="bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between">
              <h2 className="text-base font-bold font-serif">{cat.categoryTitle}</h2>
            </div>
            <div className="space-y-8">
              {cat.sections.map((sec) => (
                <div key={sec.id} className="space-y-3 p-4 rounded-xl border border-slate-300 bg-white">
                  <div className="border-b border-slate-200 pb-1.5 flex justify-between items-baseline">
                    <h3 className="font-bold text-sm text-slate-900">{sec.title}</h3>
                    <span className="text-[10px] text-slate-500">{sec.description}</span>
                  </div>
                  <div>
                    {renderSectionDetail(sec.id)}
                  </div>
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
