import React, { useState } from "react";
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award, BarChart2,
  Bell, BookOpen, Brain, CheckCircle2, ChevronDown, ChevronRight, Clock,
  Code2, Coins, Copy, CreditCard, Database, DollarSign, Download, Edit2,
  Edit3, ExternalLink, Eye, EyeOff, FileSpreadsheet, FileText, FileWarning,
  Flag, GitBranch, GitCommit, GitPullRequest, Globe, HardDrive, Heart,
  HelpCircle, Home, Image as ImageIcon, Inbox, Info, Key, Lock, LogIn,
  LogOut, Mail, MapPin, Menu, MessageCircle, MessageSquare, MoreVertical,
  Palette, PlusCircle, Presentation, Printer, Radio, RefreshCw, RotateCcw,
  School, Search, Send, Server, Settings, Shield, ShieldAlert, ShieldCheck,
  Sparkles, Star, Tag, Terminal, Trash2, Unlock, Upload, User, UserCheck,
  TrendingUp, Users, Wifi, Wind, X, Zap, Cpu, Bot, AlertTriangle, CheckSquare
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  ManualGeneralSection,
  ManualMainSection,
  ManualModerationSection,
  ManualSystemSection,
  ManualSecuritySection
} from "../../components/AdminManualSections";
import { GoogleEvaluationMemoTab } from "../../components/GoogleEvaluationMemoTab";

export const AdminManualContent = () => {
  const [currentSubTab, setCurrentSubTab] = useState<'general' | 'main' | 'moderation' | 'system' | 'security' | 'google_memo'>('general');
  const [printMode, setPrintMode] = useState<'current' | 'all' | null>(null);

  const navItems = [
    { id: 'general', label: '🔑 管理者の責任と基本ルール' },
    { id: 'main', label: '📊 概要・サイト設定・投稿管理' },
    { id: 'moderation', label: '🛡️ AI検知・モデレーション' },
    { id: 'system', label: '⚙️ ユーザー対応・一括配信' },
    { id: 'security', label: '🚨 セキュリティ・監査ログ・診断' },
    { id: 'google_memo', label: '🌐 特別備忘録: Google推薦・キャリア評価' },
  ] as const;

  const handlePrintManualPDF = (mode: 'current' | 'all') => {
    const sections = {
      general: {
        title: '🔑 第1章: 管理者の責任と基本ルール (Compliance & Responsibility)',
        html: `
          <h2>🔑 第1章: 管理者の責任と基本ルール (Compliance & Responsibility)</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">① 個人情報漏洩への絶対的警戒</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">ReMEETsの最大の特徴はお相手との共通の思い出をクイズ化することで安全な再会を実現している点にあります。管理者が興味本位でボトル内容や連絡先を覗き見・悪用することは法律上厳重に禁止されます。</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">② 電気通信事業法・通信の秘密の遵守</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">利用者同士のダイレクトメッセージややり取り内容は、憲法および電気通信事業法で保護される「通信の秘密」に該当します。法的な令状照会手続きがない限り、外部への公開は一切不可です。</p>
            </div>
          </div>
        `
      },
      main: {
        title: '📊 第2章: 概要・サイト設定・投稿管理 (Dashboard Operations)',
        html: `
          <h2>📊 第2章: 概要・サイト設定・投稿管理 (Dashboard Operations)</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">① KPI指標のリアルタイム監視</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">本日の投関数、新規登録数、メッセージ往復数、開通された（クイズに正解した）ペア数をグラフ付きで一元管理します。</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">② 組織一括出力 (Confidential Report)</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">M&A売却査定や外部財務監査に際し、サイト上に蓄積されたボトル総体（ペアの再会価値資産）を、エビデンス付きのCSVレポートとしてワンクリックダウンロード出力できます。</p>
            </div>
          </div>
        `
      },
      moderation: {
        title: '🛡️ 第3章: AI検知・通報モデレーション (Safety & Intelligence)',
        html: `
          <h2>🛡️ 第3章: AI検知・通報モデレーション (Safety & Intelligence)</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">① AI感情・文脈自動モデレーション</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">Gemini Pro等の自律AIモデルが、ボトル投函時に「誹謗中傷、ストーカー、悪質な執着、出会い目的」をリアルタイム多層解析し、自動的に警告フラグを付与してリストに留保（要審査）します。</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">④ ボトル管理タブ (Posts)</h3>
              <p style="font-size: 12px; color: #64748b; margin-top: 5px;">目的: すべての漂流文字データを監視し、違反手紙への速やかな介入（編集・削除）を行います。</p>
              <ul style="font-size: 12px; padding-left: 20px; color: #475569; line-height: 1.7;">
                <li>漂流ボトル一覧と検索</li>
                <li>ダイレクト編集（誤記入による連絡不能の救済）</li>
                <li>クイズ＆解答の確認</li>
                <li>証跡つきアーカイブ削除</li>
              </ul>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff; margin-bottom: 25px;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">⑤ 奇跡の物語タブ (Success Stories)</h3>
              <p style="font-size: 12px; color: #64748b; margin-top: 5px;">目的: 「実際に再会に成功した」実例を編集、サイト全体へアピール。登録・投函意欲を高めます。</p>
              <ul style="font-size: 12px; padding-left: 20px; color: #475569; line-height: 1.7;">
                <li>感動的なエピソードや、解決の契機となった「思い出の鍵」の編集・管理。</li>
                <li>新規起票、掲載/非掲載、表示位置（左・中央・右）の設定。</li>
              </ul>
            </div>
          </div>
        `
      },
      system: {
        title: '⚙️ 第4章: ユーザー対応・一括配信 (System Communications)',
        html: `
          <h2>⚙️ 第4章: ユーザー対応・一括配信 (System Communications)</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">① お問い合わせ (Contacts)</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">一般窓口から寄せられた技術的・法務的なお問い合わせへ回答を管理。未対応・保留・完了フラグを更新できます。</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">② 組織一括配信 (Global Broadcasts)</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">システムアップデート、重要規約改定、防犯ガイドラインなどを一括プッシュ通知・アラート配信、および送信履歴の管理を行います。</p>
            </div>
          </div>
          <div style="border: 1px solid #d97706; padding: 22px; border-radius: 16px; background: #fffbeb; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #b45309; font-size: 15px; border-bottom: 1px solid #fed7aa; padding-bottom: 6px; font-family: sans-serif;">🚨 ③ 安全誓約・年齢同意ログ (Age & Identity Agreement Audit)</h3>
            <p style="font-size: 13px; color: #78350f; margin-bottom: 8px; line-height: 1.6;">児童保護・安全適合の誓約エビデンスを改ざん不可能な形で蓄積します。</p>
            <p style="font-size: 12px; color: #92400e; margin-bottom: 0; line-height: 1.6;"><strong>警察捜査・監査対応：</strong>事件性のあるストーカーや未成年侵入が発覚した際、管轄警察署の要請に基づき、この誓約名・選択日時・IP・実年齢証跡をワンクリックでCSVダウンロード出力してそのまま正式提出可能です。</p>
          </div>
          <div style="border: 1px solid #10b981; padding: 20px; border-radius: 12px; background: #f0fdf4; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #065f46; font-size: 15px; border-bottom: 1px solid #a7f3d0; padding-bottom: 6px; font-family: sans-serif;">🛠️ ④ リアルタイムシステム状況・APIレート制限制御 (Live System & API Throttling Controller)</h3>
            <p style="font-size: 13px; color: #047857; margin-bottom: 8px; line-height: 1.6;">WebSocketを介して随時収集したシステムリソース健全性や通信レイテンシを表示。ログイン、会員登録、思い出検索、ボトル投函、暗証クイズ回答、メッセージ送信といった各主要APIパスへの過剰アクセス（IP単位レート制限）をGUI上のスライダーで即座にポリシー動的調整できます。設定操作はシステム監査対象イベントとして記録されます。</p>
          </div>
        `
      },
      security: {
        title: '🚨 第5章: セキュリティ・監査ログ・診断 (Forensics & Security)',
        html: `
          <h2>🚨 第5章: セキュリティ・監査ログ・診断 (Forensics & Security)</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">① セキュリティモニタ (Security Monitor)</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">ブルートフォース等の攻撃失敗ログインを常時監視。一定以上の不正失敗があった悪質な接続元IPアドレスを検知し、ワンクリックで完全にサーバーIPブラックリストへ追放可能です。</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">② 技術＆操作監査ログ (System Audit Logs)</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">操作者自身（管理者）が行ったアカウント凍結、漂流ボトルの修正・削除などの権限利用履歴を改ざん不能保護で記録。また、ライブAPIレート制限の閾値変更やリセット操作（ADMIN_RATE_LIMIT_UPDATE, ADMIN_RATE_LIMIT_RESET_STATS）も詳細コンテキスト付き監査ログとして即座にリストおよびCSVへ格納されます。</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">③ システム診断 (System Diagnostics)</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">本番用の Firebase Firestore およびローカル検証用の SQLite3 データベースに接続し、各コレクション/テーブルの物理レコード、健康状態、およびAPI疎通状態を監視します。</p>
            </div>
            <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #fff;">
              <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">④ M&A実績・事業査定レポートの意義</h3>
              <p style="font-size: 13px; color: #334155; line-height: 1.6;">将来の事業譲渡・財務監査に向け、プラットフォーム上のボトル総積、再会開通（クイズ合格数）という最も大切な資産価値を裏打ち。エビデンス付きのCSV出力が可能です。</p>
            </div>
          </div>
          <div style="border: 1px solid #ef4444; padding: 20px; border-radius: 12px; background: #fef2f2; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #991b1b; font-size: 14px; border-bottom: 1px solid #fca5a5; padding-bottom: 6px; font-family: sans-serif;">⚖️ ⑤ 警察・公安への捜査事項照会(197条)対応フロー</h3>
            <ul style="font-size: 12px; color: #7f1d1d; padding-left: 20px; line-height: 1.7;">
              <li><strong>書面査定:</strong> 刑事社印のある正式な照会書または令状の受理を確認する（口頭・メールは不可）。</li>
              <li><strong>証跡特定:</strong> 安全誓約ログ（Age Logs）等から、年齢18歳以上宣誓完了・電子承諾済誓約日の合意IP、ブラウザUAを紐付け特定する。</li>
              <li><strong>CSV送付:</strong> データをCSV出力（形式: ReMEETs_Audit_Forensic_Data）し、CD-Rやセキュア警察用窓口経由で提出完了。eKYCで破棄（パージ）された実身分証の代わりの強力な電子同意証跡となります。</li>
            </ul>
          </div>
        `
      }
    };

    let innerContent = '';
    let fileName = 'ReMEETs_管理者操作マニュアル.html';

    if (mode === 'current') {
      const activeSec = sections[currentSubTab];
      innerContent = activeSec.html;
      fileName = `ReMEETs_操作マニュアル_${activeSec.title.split(':')[0].replace(/🔑|📊|🛡️|⚙️|🚨/g, '').trim()}.html`;
    } else {
      innerContent = sections.general.html + `<div class="page-break"></div>` + 
                     sections.main.html + `<div class="page-break"></div>` + 
                     sections.moderation.html + `<div class="page-break"></div>` + 
                     sections.system.html + `<div class="page-break"></div>` + 
                     sections.security.html;
      fileName = 'ReMEETs_総合操作マニュアル_全5章.html';
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${mode === 'current' ? 'ReMEETs 管理者操作マニュアル' : 'ReMEETs 総合操作マニュアル (全5章)'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Serif+JP:wght@400;700&display=swap');
    body {
      font-family: "Noto Serif JP", YuMincho, "Hiragino Mincho ProN", serif;
      color: #1a202c;
      line-height: 1.8;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 30px;
      background: #f1f5f9;
    }
    .container {
      background: #ffffff;
      padding: 50px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      border-bottom: 4px solid #1c2e40;
      padding-bottom: 12px;
      margin-bottom: 4px;
      color: #1c2e40;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      border-bottom: 2px solid #1c2e40;
      padding-bottom: 6px;
      margin-top: 35px;
      margin-bottom: 15px;
      color: #1c2e40;
    }
    h3 {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .no-print-toolbar {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: sans-serif;
    }
    .btn {
      background: #1e40af;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      transition: background 0.15s;
    }
    .btn:hover {
      background: #1d4ed8;
    }
    @media print {
      body {
        background: white;
        margin: 0;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border: none;
        padding: 0;
      }
      .no-print-toolbar {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div style="max-width: 70%;">
      <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #1e40af; font-family: sans-serif;">📄 操作マニュアルのダウンロードが完了しました！</h3>
      <p style="margin: 0; font-size: 11px; color: #475569;">お使いのブラウザでこのファイルを開き、右側のボタンをクリックするか <strong>Ctrl + P (Cmd + P)</strong> を押すことで、周囲の余計な枠を排除した、完璧に美しい <strong>A4 Aランク仕様の縦型PDF</strong> として保存・出力できます。</p>
    </div>
    <button class="btn" onclick="window.print()">A4 PDFとして印刷・保存する</button>
  </div>

  <div class="container">
    <div style="border-bottom: 4px solid #1c2e40; padding-bottom: 16px; margin-bottom: 30px;">
      <h1>ReMEETs 管理者総合操作マニュアル</h1>
      <p style="font-size: 12px; color: #64748b; margin: 6px 0 0 0; font-family: sans-serif;">発行元: ReMEETs 安全対策事務局・ガバナンス監査局</p>
      <p style="font-size: 11px; color: #64748b; margin: 3px 0 0 0; font-family: sans-serif;">更新日: 2026/06/06 | 官公庁提出用・M&Aガバナンス査定保証・運営用正式資料 (Highly Confidential)</p>
    </div>

    ${innerContent}

  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ReMEETs_Admin_Manual.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card p-8 border-l-8 border-brand-primary">
        <h2 className="text-3xl font-serif text-black mb-4 flex items-center gap-2">
          <BookOpen className="text-brand-primary" size={28} />
          管理者総合操作マニュアル
        </h2>
        <p className="text-black/60 leading-relaxed max-w-3xl text-sm font-serif">
          このマニュアルは、ReMEETs管理者ダッシュボードの全項目、機能、および運用の目的を詳細に定義したものです。
          管理画面の各タブは以下のドキュメントに従って完全に稼働しています。疑わしい挙動や対応に迷った際は、各セクションのガイドラインに沿って操作を行ってください。
        </p>
      </div>

      {/* 🖨️ PDF保存・印刷ツールボックス */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 p-6 bg-indigo-50/50 rounded-[28px] border border-brand-border/40 select-none no-print">
        <div className="space-y-1.5 max-w-2xl">
          <h4 className="text-sm font-bold text-black flex items-center gap-2 font-sans">
            <Printer size={16} className="text-indigo-600 animate-pulse shrink-0" />
            管理者マニュアル・運営手順書 PDF保存
          </h4>
          <p className="text-[11px] text-black/75 font-serif leading-relaxed">
            提出用官公庁・事業譲渡（M&A）ガバナンス監査用として、本マニュアルを美しいA4縦型専用デザインでPDFとして出力・保存できます。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto shrink-0 animate-in fade-in">
          <button
            onClick={() => handlePrintManualPDF('current')}
            className="px-4 py-3.5 bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            <Printer size={14} className="text-indigo-600" />
            <span>表示中の章をPDF保存（印刷）</span>
          </button>
          <button
            onClick={() => handlePrintManualPDF('all')}
            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex-1 sm:flex-initial"
          >
            <Printer size={14} />
            <span>【推奨】全5章を一括PDF保存（印刷）</span>
          </button>
        </div>
      </div>

      {/* サブタブ選択 */}
      <div className="flex flex-wrap border-b border-brand-border gap-2 pb-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSubTab(item.id)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all font-sans flex-1 min-w-[190px] md:flex-initial text-center border ${
              currentSubTab === item.id
                ? 'border-brand-primary/20 text-brand-primary bg-brand-primary/10 shadow-sm'
                : 'border-transparent text-black/60 bg-black/5 hover:text-black hover:bg-black/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-6 no-print">
        {currentSubTab === 'general' && <ManualGeneralSection />}
        {currentSubTab === 'main' && <ManualMainSection />}
        {currentSubTab === 'moderation' && <ManualModerationSection />}
        {currentSubTab === 'system' && <ManualSystemSection />}
        {currentSubTab === 'security' && <ManualSecuritySection />}
        {currentSubTab === 'google_memo' && <GoogleEvaluationMemoTab />}
      </div>

      {/* 印刷専用領域 (通常時は非表示、印刷時のみブラウザが自動レンダリング) */}
      {printMode && (
        <div id="admin-manual-print-container" className="print-area-active space-y-10">
          <div className="border-b-4 border-black pb-4 mb-8">
            <h1 className="text-3xl font-bold font-serif mb-2 text-black">ReMEETs 管理者総合操作マニュアル</h1>
            <p className="text-xs text-black/80">作成・発行: ReMEETs 安全対策事務局・ガバナンス監査局</p>
            <p className="text-xs text-black/60">更新日: 2026/06/05 | 公式コンプライアンス管理ガイド (Confidential)</p>
          </div>

          {printMode === 'all' ? (
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold font-serif border-b-2 border-black pb-2 mb-4 text-black">🔑 第1章: 管理者の責任と基本ルール</h2>
                <ManualGeneralSection />
              </div>
              
              <div className="page-break" />
              
              <div>
                <h2 className="text-2xl font-bold font-serif border-b-2 border-black pb-2 mb-4 text-black">📊 第2章: 概要・サイト設定・投稿管理</h2>
                <ManualMainSection />
              </div>
              
              <div className="page-break" />
              
              <div>
                <h2 className="text-2xl font-bold font-serif border-b-2 border-black pb-2 mb-4 text-black">🛡️ 第3章: AI検知・モデレーション</h2>
                <ManualModerationSection />
              </div>
              
              <div className="page-break" />
              
              <div>
                <h2 className="text-2xl font-bold font-serif border-b-2 border-black pb-2 mb-4 text-black">⚙️ 第4章: ユーザー対応・一括配信・合意ログ</h2>
                <ManualSystemSection />
              </div>
              
              <div className="page-break" />
              
              <div>
                <h2 className="text-2xl font-bold font-serif border-b-2 border-black pb-2 mb-4 text-black">🚨 第5章: セキュリティ・監査ログ・警察対応連携</h2>
                <ManualSecuritySection />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold font-serif border-b-2 border-black pb-2 mb-4 text-black">
                {currentSubTab === 'general' && "🔑 第1章: 管理者の責任と基本ルール"}
                {currentSubTab === 'main' && "📊 第2章: 概要・サイト設定・投稿管理"}
                {currentSubTab === 'moderation' && "🛡️ 第3章: AI検知・モデレーション"}
                {currentSubTab === 'system' && "⚙️ 第4章: ユーザー対応・一括配信・合意ログ"}
                {currentSubTab === 'security' && "🚨 第5章: セキュリティ・監査ログ・警察対応連携"}
                {currentSubTab === 'google_memo' && "🌐 特別備忘録: Google推薦・キャリア評価"}
              </h2>
              {currentSubTab === 'general' && <ManualGeneralSection />}
              {currentSubTab === 'main' && <ManualMainSection />}
              {currentSubTab === 'moderation' && <ManualModerationSection />}
              {currentSubTab === 'system' && <ManualSystemSection />}
              {currentSubTab === 'security' && <ManualSecuritySection />}
              {currentSubTab === 'google_memo' && <GoogleEvaluationMemoTab />}
            </div>
          )}
          
          <div className="border-t border-black/10 pt-4 mt-12 text-center text-[10px] opacity-50 font-sans text-black">
            &copy; 2026 ReMEETs All Rights Reserved. This document is highly confidential and for authorized admin personnel only.
          </div>
        </div>
      )}
    </div>
  );
};


export const OldAdminManualContent = () => {
  const [currentSubTab, setCurrentSubTab] = useState<'general' | 'main' | 'moderation' | 'system' | 'security'>('general');

  const navItems = [
    { id: 'general', label: '🔑 管理者の責任と基本ルール' },
    { id: 'main', label: '📊 概要・サイト設定・投稿管理' },
    { id: 'moderation', label: '🛡️ AI検知・モデレーション' },
    { id: 'system', label: '⚙️ ユーザー対応・一括配信' },
    { id: 'security', label: '🚨 セキュリティ・監査ログ・診断' },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card p-8 border-l-8 border-brand-primary">
        <h2 className="text-3xl font-serif text-black mb-4 flex items-center gap-2">
          <BookOpen className="text-brand-primary" size={28} />
          管理者総合操作マニュアル
        </h2>
        <p className="text-black/60 leading-relaxed max-w-3xl text-sm font-serif">
          このマニュアルは、ReMEETs管理者ダッシュボードの全項目、機能、および運用の目的を詳細に定義したものです。
          管理画面の各タブは以下のドキュメントに従って完全に稼働しています。疑わしい挙動や対応に迷った際は、各セクションのガイドラインに沿って操作を行ってください。
        </p>
      </div>

      {/* サブタブ選択 */}
      <div className="flex flex-wrap border-b border-brand-border gap-2 pb-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSubTab(item.id)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all font-sans flex-1 min-w-[190px] md:flex-initial text-center border ${
              currentSubTab === item.id
                ? 'border-brand-primary/20 text-brand-primary bg-brand-primary/10 shadow-sm'
                : 'border-transparent text-black/60 bg-black/5 hover:text-black hover:bg-black/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {currentSubTab === 'general' && (
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
                  ReMEETsのモデレーションは「AIによる自動セマンティック文脈分析」と「人間、または当事者からの通報」から成り立ちます。
                  AI検知キューに入ったボトルは即座に隔離され、他者に公開されることはありませんが、管理者が手動で審査し必要に応じて誤検知を解除できます。
                </p>
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-[11px] text-amber-800 leading-relaxed font-sans">
                  <strong>⚠️ ストーカー対策・二次被害の防止：</strong>
                  執着性の高い文章、恨み言、脅迫などのニュアンスが含まれている場合、絶対に「承認（公開）」を行わず、通報（Reports）よりアカウントの即時凍結処理を行ってください。
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
                    管理権限の使用はすべて自己シグネチャの監査ログとして記録されており、不正な第三者への情報提供などは、電気通信事業法上の「通信の秘密」侵害として重い法的刑事責任が問われます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSubTab === 'main' && (
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

              {/* settings */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <Settings size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ② サイト設定タブ (Settings)
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
                    ③ ユーザー管理タブ (Users)
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      悪質な荒らし、個人情報晒し、公序良俗に反するアカウントを永久凍結・監視します。
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
                    <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                      <li><strong>ユーザー検索・一覧：</strong>ニックネーム、メールアドレス、会員ステータス（一般/管理/凍結）の確認。</li>
                      <li><strong>詳細の参照：</strong>該当ユーザーの「実名（full_name）」「登録地」「作成された全ボトルの一覧」の監査。</li>
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
                    ④ ボトル管理タブ (Posts)
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      一般タイムラインで漂流しているすべての文字データを監視・管理し、違反手紙への速やかな介入（編集・削除）を行います。
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
                    <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                      <li><strong>漂流ボトル一覧と検索：</strong>対象者名、場所、ゆかりの地等のファセット等で検索。</li>
                      <li><strong>ダイレクト編集：</strong>誤記入による連絡不能などの際、お相手指定の名前や日付の間違いを修正支援可能。</li>
                      <li><strong>クイズ＆解答の確認：</strong>設定された「思い出の鍵」及び回答内容の内部確認。</li>
                      <li><strong>証跡つきアーカイブ削除：</strong>警察捜査やトラブルに備え、手紙を削除する際は、具体的な削除理由を選択・記述した監査ログをバックエンドに保存しながら処理。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* successStories */}
              <div className="glass-card p-6 space-y-4 md:col-span-2">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ⑤ 奇跡の物語タブ (Success Stories)
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      「実際に再会に成功した」という極めて価値の高いユーザー実例を編集、サイト全体へアピール。これによって登録・投函意欲を劇的に高めます。
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
                      <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                        <li><strong>再会ストーリー一覧の管理：</strong>お名前（イニシャル・ニックネーム推奨）、再会までのエピソード、感動的な出来事、解決の契機となった「思い出の鍵」の記録。</li>
                        <li><strong>新規起票および削除：</strong>同意を得た成約メッセージから直接引用し、ストーリーとして追加配置。</li>
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-black/50 block font-sans">管理者の運用ガイドライン</span>
                      <p className="text-[11px] text-black/60 leading-relaxed font-serif">
                        成約したカップルや友人の実名・具体的な居住地が直接露出しないよう、掲載する前に「イニシャル化」されているか、エピソードのプライバシ調整が行われているかを細心の注意を払って確認してください。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSubTab === 'moderation' && (
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
                      <li><strong>AI判定フラグ：</strong>`ai_flagged === 1` の不適切候補ボトルのみを瞬時に抽出して一覧化。</li>
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
                    ③ 削除依頼タブ (Deletion Requests)
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
            </div>
          </div>
        )}

        {currentSubTab === 'system' && (
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
                      <li><strong>ステータス管理：</strong>未対応（Pending）、保留、対応完了の振り分けが可能。</li>
                      <li><strong>ダイレクト回答フォーム：</strong>問い合わせカードを開き、管理者自身の回答文面案（返信下書き・処理）をボタン1つで確定可能。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 一括配信 (notifications) */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <Bell size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ② 一括配信タブ (Global Broadcasts)
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      システムアップデート情報、利用規約の重要改定、冬期などの防犯の呼びかけ等をプラットフォーム全ユーザーに対してタイムリーにブロードキャストします。
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
                    <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                      <li><strong>新規一括アラート作成：</strong>件名と詳細文書、通知のトーン、リンクを指定して一括送信。</li>
                      <li><strong>送信履歴：</strong>一度送信された履歴の監査および「誤送信による配信の全排除（取り消し抹消）」を実行可能。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 安全誓約・年齢同意ログ (ageVerification) */}
              <div className="glass-card p-6 space-y-4 md:col-span-2">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <UserCheck size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ③ 安全誓約・年齢同意ログタブ (Age & Identity Verification Logs)
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                      <p className="text-xs text-black/80 font-serif leading-relaxed">
                        メッセージの開通（クイズゲート回答）手続きの際、未成年者保護及び安全確約エビデンスを自動かつ改ざん不能な形で記録・警察への対応証跡に利用します。
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-black/50 block font-sans">警察捜査・監査対応のための重要機能！</span>
                      <p className="text-xs text-amber-700 font-serif leading-relaxed bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                        「お相手が実は児童だった、脅迫目的のストーカーだった」という万一の重大事件時、管轄警察署の要請に基づいて、この画面に収集された合誓署名、対象日時、接続IPアドレス、申請された実年齢を即時CSV出力して証拠提出・適法開示ができます。
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">主要提供機能</span>
                    <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                      <li><strong>期間指定＆ステータスフィルタ：</strong>任意の年月日期間、成功（Verified）/失敗（Failed）によるソート・一括抽出。</li>
                      <li><strong>カスタムCSVダウンロード機能：</strong>管理業務の引き継ぎ資料、あるいは当局での監査用に、チェックを入れたカラム構造のみに限定した完全な形式でのCSV出力をサポート。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSubTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* セキュリティ (security) */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <ShieldAlert size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ① セキュリティタブ (Security Monitor)
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      パスワードハッキング、ブルートフォース攻撃、DoSスパム等の不正アタックからシステムを護り、不正ログイン失敗履歴を監視・自動または手動でIPネットワーク遮断を行います。
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
                    <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                      <li><strong>攻撃失敗ログイン集計：</strong>短時間に一定以上の回数認証に失敗したIPアドレス（攻撃フラグ）をリスト。</li>
                      <li><strong>手動即時IPブロック：</strong>悪意のあるIP、または疑わしい外国プロキシなどを管理画面から直接ワンクリックで完全にIP遮断リストに送り込みます。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ログ (logs) */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <Terminal size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ② 技術＆アクセスログタブ (System Audit Logs)
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      管理者自身の行い（どのメンバーを凍結したか、どのボトルを手動削除・修正したか）と、全ユーザーの接続パス、エラー、IPなどの技術稼働履歴。
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
                    <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                      <li><strong>操作履歴のログ化：</strong>管理者が自身の利権を用いて不正を行っていないかを監視可能な、改ざん防止の監査記録。</li>
                      <li><strong>接続元IP + UAトラッキング：</strong>不正なスクレイピングや、他人の思い出クイズにしつこく不正侵入しようとしている挙動の監視エビデンス。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* システム (system) */}
              <div className="glass-card p-6 space-y-4 md:col-span-1">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ③ システムタブ (System Diagnostics)
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">この項目の目的</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      体験用ローカルDB（SQLite3ファイルベース: `database.sqlite` / `kizuna.db`）および本番用クラウドデータベース（Firebase Firestore ＆ Auth）の健康状態や記憶コレクション/テーブル数、レコード総数の稼働確認。
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-black/50 block font-sans">主要機能・提供機能</span>
                      <ul className="text-[11px] text-black/60 space-y-1 font-sans list-disc list-inside">
                        <li><strong>データストア状態確認：</strong>各コレクション/テーブル（`users`, `posts`, `failed_attempts` 等）の物理レコードカウント。</li>
                        <li><strong>データベース健康診断：</strong>Firebase 接続性・APIエラー・認証疎通テスト、およびローカルSQLite（PRAGMA integrity_check）の整合性チェック。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: ④ M&A事業査定実績レポートの見かた */}
              <div className="glass-card p-6 space-y-4 md:col-span-1">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                    <FileSpreadsheet size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ④ M&A実績・事業査定レポートの読み方
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-black/50 block font-sans">このデータの意義</span>
                    <p className="text-xs text-black/80 font-serif leading-relaxed">
                      将来的な事業譲渡（M&A）や提携時に、外部の財務監査人・投資家に向けて、本プラットフォームが持つ「無形資産（関係性データベース、累積ユーザーのエンゲージメント）」を偽りのない数値（エビデンス付き）で証明する資料です。
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-500/10 font-sans space-y-2">
                    <span className="text-[10px] font-bold text-blue-800 block">📊 主要指標の分析アプローチ</span>
                    <ul className="text-[11px] text-black/75 space-y-1 list-disc list-inside">
                      <li><strong>累積ボトル数 (Posts Volume)：</strong>プラットフォーム上に眠る「再会の種」の純資産。将来的なトラフィックへの最大のフックとなります。</li>
                      <li><strong>クイズ合格開通数 (Handshake Count)：</strong>思い出クイズが突破され、ユーザーが実際に絆を再開した「エンゲージメント（実質成功数）」。高い合格率は、データの品質とマッチング精度の高さを示します。</li>
                      <li><strong>ユーザー定着・継続率：</strong>広告に依存しない「オーガニックな口コミバイラル効果」を算出し、将来的なマーケティングLTV（顧客生涯価値）を推測します。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* NEW: ⑤ 模擬監査ログ（CSVエクスポート）の意味と見かた */}
              <div className="glass-card p-6 space-y-4 md:col-span-2">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-teal-500/10 rounded-xl text-teal-600">
                    <CheckSquare size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ⑤ 【検証用】模擬監査ログデータ（eKYC適合）の項目定義と分析手法
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-bold text-black/70 block uppercase tracking-wider mb-2">CSV出力カラム構造＆デコードガイド</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs leading-relaxed font-sans">
                      <div className="bg-white p-2.5 rounded-xl border border-black/5">
                        <strong className="text-brand-primary block text-[11px]">ログ分類 (Category)</strong>
                        <span className="text-black/60 text-[11px]">「USER_SIGNUP」「NG_WORD_MODERATION」「IDENTITY_VERIFICATION」等のイベント属性。</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/5">
                        <strong className="text-brand-primary block text-[11px]">対象ホスト/IP (Client IP)</strong>
                        <span className="text-black/60 text-[11px]">操作元のグローバルIP。警察の接続事業者（ISP）特定で最初に活用される証跡。</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-brand-border/40">
                        <strong className="text-brand-primary block text-[11px]">ユーザー識別子 (User Hash)</strong>
                        <span className="text-black/60 text-[11px]">不審ユーザー特定用の非可逆UUID。別アドレスでのクローン登録遮断に使用。</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/5">
                        <strong className="text-brand-primary block text-[11px]">操作/検知イベント (Action)</strong>
                        <span className="text-black/60 text-[11px]">「eKYC照合」「ブラックリスト遮断」など。生身分証のパージ（即時完全消去）ログもここに残る。</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/5">
                        <strong className="text-brand-primary block text-[11px]">モデレーション評価 (AI Check)</strong>
                        <span className="text-black/60 text-[11px]">Geminiの安全評価合格判定。不適合（BLOCKED）の場合は遮断トリップ理由を設定する。</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/5">
                        <strong className="text-brand-primary block text-[11px]">監査適合ステータス (Status)</strong>
                        <span className="text-brand-primary block text-[11px]">「SUCCESS（適合）」「PREVENTED（防御）」「PURGED（完全抹消・安全）」の監査ステータス。</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-500/20 text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <Shield className="shrink-0" size={14} />
                        eKYC公的身元確認（非蓄積・破棄）の監査確認
                      </div>
                      <p className="leading-relaxed">
                        eKYC（オンライン本人確認）完了時、<strong>画像や実名生存などの生データが直ちにパージ（破棄）</strong>され、安全な非可逆暗号ハッシュトークン形式でのみ保持された事実を「IDENTITY_VERIFICATION_COMPLETED」および「VERIFIED (TokenHash)」ログから数学的に証明します。これにより情報漏洩訴訟などのガバナンスリスクを完璧に回避します。
                      </p>
                    </div>

                    <div className="space-y-2 p-4 bg-red-50 text-red-900 rounded-2xl border border-red-500/20 text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-red-800">
                        <AlertTriangle className="shrink-0" size={14} />
                        ストーカー・荒らし（他垢バイパス）の自動遮断検証
                      </div>
                      <p className="leading-relaxed">
                        過去に永久追放された攻撃者が、別のアドレスやデバイス等を用いた場合。eKYC照合時の「ハッシュ特定（BLACKLISTED_USER_PREVENT）」ログを比較し、システムが自動的に同一人物を同定、複数アカウント作成を水際で【防衛成功】した証跡を確認できます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: ⑥ 警察・法執行機関からの捜査照会（197条）対応・資料提出フロー */}
              <div className="glass-card p-6 space-y-4 md:col-span-2">
                <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                  <div className="p-2 bg-red-500/10 rounded-xl text-red-600">
                    <ShieldAlert size={20} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-black">
                    ⑥ 【最重要】警察・公安・司法機関からの情報提供・特定要請（197条照会）の対応フロー
                  </h3>
                </div>
                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-2">
                    <p className="text-black/80 font-serif leading-relaxed text-sm">
                      ストーカー等による他者待ち伏せや、誹謗中傷、NGアビューズに起因し、管轄警察署の刑事課などから「刑事訴訟法第197条第2項」に基づく捜査事項照会書、または裁判所の捜査差押許可状（令状）を受理した場合の、管理者の公的対応手順をマニュアル化しています。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-black border-b border-black/5 pb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                        <span>正当性の確認（書面受理）</span>
                      </div>
                      <p className="text-black/60 leading-relaxed text-[11px]">
                        メールや口頭のみでの開示には**絶対に応じてはなりません**。「捜査事項照会書（社印・署長印のある用紙）」の郵送添付、または捜査員による令状の原本直接呈示があった場合に限定して開示手続きを開始します（電気通信事業法上の通信の秘密保護義務）。
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-black border-b border-black/5 pb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                        <span>データの抽出と検証</span>
                      </div>
                      <p className="text-black/60 leading-relaxed text-[11px]">
                        照会対象ユーザーの「会員ID」および「IPアドレス、接続履歴」を、管理画面の「ユーザー管理(Users)」および「安全誓約・年齢同意ログ(Age Logs)」から検索。
                        該当ユーザーが投函・クイズ回答時に**「年齢18歳以上宣誓完了・電子承諾済」しているログ、およびeKYC完了時の非可逆トークン**を確認。
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-brand-border space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-black border-b border-black/5 pb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                        <span>資料のCSVエクスポート・送付</span>
                      </div>
                      <p className="text-black/60 leading-relaxed text-[11px]">
                        「安全誓約ログ」および「セキュリティ・監査ログタブ」から関係履歴のチェックを入れ、データをCSV形式（形式: ReMEETs_Audit_Forensic_Data）でエクスポート。
                        誓約日時の合意ログ（IPとシグニチャ）をCD-R等の暗号化メディア、または指定されたセキュアな警察対応アップローダー等で当局へ正式提出します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

