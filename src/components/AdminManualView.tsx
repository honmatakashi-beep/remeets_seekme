import React, { useState, useMemo } from "react";
import {
  BookOpen, Search, Copy, Check, Printer, FileText, ChevronRight,
  ChevronDown, ExternalLink, ShieldCheck, AlertTriangle, Users,
  Settings, Database, Activity, Sliders, ArrowRight, Layers, Eye,
  Shield, Bot, Mail, CreditCard, Server, Award, Palette, X, Menu
} from "lucide-react";
import {
  MANUAL_CATEGORIES,
  ManualCategory,
  ManualSection
} from "./adminManual/manualCategories";
import { ManualSectionDetailRenderer } from "./adminManual/ManualSectionDetailRenderer";


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
  const manualCategories = MANUAL_CATEGORIES; const _ignored = [
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
                      <ManualSectionDetailRenderer id={sec.id} />
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
                    <ManualSectionDetailRenderer id={sec.id} />
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

