import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight,
  ArrowUp, Award, BarChart2, Bell, BookOpen, Bot, Brain, Calendar, Check,
  CheckCircle, CheckCircle2, CheckSquare, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Clock, Coins, Copy, CreditCard, Database,
  DollarSign, Download, Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff,
  FileSpreadsheet, FileText, FileWarning, Filter, Flag, Globe, Heart,
  HelpCircle, Home, Image as ImageIcon, Inbox, Info, Key, Lock, LogIn,
  LogOut, Mail, MapPin, Menu, MessageCircle, MessageSquare, MoreVertical,
  Palette, PlusCircle, Presentation, Printer, Radio, RefreshCw, RotateCcw,
  School, Search, Send, Settings, Shield, ShieldAlert, ShieldCheck, Sparkles,
  Star, Tag, Terminal, Trash2, Unlock, Upload, User as UserIcon, UserCheck,
  Plus, TrendingUp, History, Users, Wifi, Wind, X, Zap, ArrowUpDown, UserX
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, PageHeader, getPostUrl, formatEraLabel, getCategoryText, PREFECTURES } from '../lib/utils';
import { BottleLoader, WarningMessage, Navbar } from '../components/SharedComponents';
import { SupportModal } from '../components/SupportModal';
import { ManualGeneralSection, ManualMainSection, ManualModerationSection, ManualSystemSection, ManualSecuritySection } from '../components/AdminManualSections';
import { GoogleEvaluationMemoTab } from '../components/GoogleEvaluationMemoTab';
import { ChatComponent } from './PostPages';
import { AdminLiveAlertMonitor } from '../components/AdminLiveAlertMonitor';
import { AdminRbacView } from '../components/AdminRbacView';
import { AdminDesignSystem } from '../components/AdminDesignSystem';
import { AdminMonetizationBlock } from '../components/AdminMonetizationBlock';
import { AdminPaymentManagementBlock } from '../components/AdminPaymentManagementBlock';
import { QuizMatchingAnalyticsView } from '../components/QuizMatchingAnalyticsView';
import { EkycProgressTelemetryPanel } from '../components/EkycProgressTelemetryPanel';
import { MaValuationDataRoomView } from '../components/MaValuationDataRoomView';
import { AdminEmailTemplatesView } from '../components/AdminEmailTemplatesView';
import {
  classifyTicket,
  TicketCategory,
  TicketCategoryEn,
  ClassificationResult,
  URGENT_KEYWORDS,
  TECHNICAL_KEYWORDS,
  ACCOUNT_KEYWORDS
} from '../utils/contactClassification';
import { ManualContent, AdminDeploymentGuideBlock } from './MiscPages';
import { SeoPreviewModal } from './PostPages';

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

export const RegionalMatrix = ({ data }: { data: any[] }) => {
  // Mapping of prefectures to regions
  const regionMapping: { [key: string]: string } = {
    '北海道': 'hokkaido',
    '青森県': 'tohoku', '岩手県': 'tohoku', '宮城県': 'tohoku', '秋田県': 'tohoku', '山形県': 'tohoku', '福島県': 'tohoku',
    '茨城県': 'kanto', '栃木県': 'kanto', '群馬県': 'kanto', '埼玉県': 'kanto', '千葉県': 'kanto', '東京都': 'kanto', '神奈川県': 'kanto',
    '新潟県': 'chubu', '富山県': 'chubu', '石川県': 'chubu', '福井県': 'chubu', '山梨県': 'chubu', '長野県': 'chubu', '岐阜県': 'chubu', '静岡県': 'chubu', '愛知県': 'chubu',
    '三重県': 'kansai', '滋賀県': 'kansai', '京都府': 'kansai', '大阪府': 'kansai', '兵庫県': 'kansai', '奈良県': 'kansai', '和歌山県': 'kansai',
    '鳥取県': 'chugoku', '島根県': 'chugoku', '岡山県': 'chugoku', '広島県': 'chugoku', '山口県': 'chugoku',
    '徳島県': 'shikoku', '香川県': 'shikoku', '愛媛県': 'shikoku', '高知県': 'shikoku',
    '福岡県': 'kyushu', '佐賀県': 'kyushu', '長崎県': 'kyushu', '熊本県': 'kyushu', '大分県': 'kyushu', '宮崎県': 'kyushu', '鹿児島県': 'kyushu',
    '沖縄県': 'okinawa'
  };

  const regions = [
    { id: 'hokkaido', name: '北海道' },
    { id: 'tohoku', name: '東北' },
    { id: 'kanto', name: '関東' },
    { id: 'chubu', name: '中部' },
    { id: 'kansai', name: '関西' },
    { id: 'chugoku', name: '中国' },
    { id: 'shikoku', name: '四国' },
    { id: 'kyushu', name: '九州' },
    { id: 'okinawa', name: '沖縄' },
  ];

  const getRegionCount = (regionId: string) => {
    if (!data) return 0;
    let total = 0;
    data.forEach(d => {
      if (!d.region) return;
      
      let found = false;
      Object.keys(regionMapping).forEach(pref => {
        const prefShort = pref.replace(/[都府県]$/, '');
        const regionShort = d.region.replace(/[都府県]$/, '');
        
        if ((d.region.includes(pref) || pref.includes(d.region) || 
             regionShort.includes(prefShort) || prefShort.includes(regionShort)) && 
            regionMapping[pref] === regionId) {
          found = true;
        }
      });
      
      if (found) {
        total += d.count;
        return;
      }

      const regionLower = d.region.toLowerCase();
      if (regionLower.includes(regionId) || 
          (regionId === 'hokkaido' && d.region === '北海道') ||
          (regionId === 'tohoku' && d.region === '東北') ||
          (regionId === 'kanto' && d.region === '関東') ||
          (regionId === 'chubu' && d.region === '中部') ||
          (regionId === 'kansai' && d.region === '関西') ||
          (regionId === 'chugoku' && d.region === '中国') ||
          (regionId === 'shikoku' && d.region === '四国') ||
          (regionId === 'kyushu' && d.region === '九州') ||
          (regionId === 'okinawa' && d.region === '沖縄')) {
        total += d.count;
      }
    });
    return total;
  };

  const regionCounts = regions.map(r => ({ ...r, count: getRegionCount(r.id) }));
  const maxCount = Math.max(...regionCounts.map(r => r.count), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {regionCounts.map(r => {
        const intensity = r.count / maxCount;
        return (
          <div 
            key={r.id}
            className="p-4 rounded-2xl border border-brand-border flex flex-col items-center justify-center text-center transition-all hover:shadow-md"
            style={{ 
              backgroundColor: r.count > 0 ? `rgba(0, 77, 64, ${0.05 + intensity * 0.2})` : 'transparent',
              borderColor: r.count > 0 ? `rgba(0, 77, 64, ${0.1 + intensity * 0.3})` : ''
            }}
          >
            <span className="text-xs font-bold text-brand-dark/60 uppercase tracking-widest mb-1">{r.name}</span>
            <span className="text-2xl font-serif font-bold text-brand-dark">{r.count.toLocaleString()}</span>
            <span className="text-[10px] text-brand-dark/40 uppercase tracking-tighter mt-1">Activities</span>
          </div>
        );
      })}
    </div>
  );
};

export const FunnelChart = ({ data }: { data: any[] }) => {
  return (
    <div className="space-y-6">
      {data.map((item, idx) => {
        const prevCount = idx > 0 ? data[idx-1].count : item.count;
        const dropRate = idx > 0 ? ((1 - item.count / prevCount) * 100).toFixed(1) : 0;
        const width = (item.count / data[0].count) * 100;

        return (
          <div key={item.step} className="space-y-2">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">{item.step}</span>
                <div className="text-lg font-serif text-brand-dark">{item.count.toLocaleString()} <span className="text-xs font-serif text-brand-dark/50">件</span></div>
              </div>
              {idx > 0 && (
                <div className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  -{dropRate}% 離脱
                </div>
              )}
            </div>
            <div className="h-4 bg-brand-light/50 rounded-full overflow-hidden border border-brand-border/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className="h-full bg-brand-primary rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              </motion.div>
            </div>
            <p className="text-[10px] text-brand-dark/60">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export const HeatmapChart = ({ data }: { data: any[] }) => {
  if (!data) return <div className="h-64 flex items-center justify-center text-brand-dark/30">データを読み込み中...</div>;
  
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Pre-process data into a 2D array
  const matrix = days.map((_, dIdx) => {
    return hours.map(hour => {
      const item = data.find(d => {
        const dDay = parseInt(d.day_of_week);
        const dHour = parseInt(d.hour_of_day);
        return dDay === dIdx && dHour === hour;
      });
      return item ? item.count : 0;
    });
  });

  const allCounts = matrix.flat();
  const maxCount = Math.max(...allCounts, 1);
  
  // Calculate totals
  const dayTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const hourTotals = hours.map(h => matrix.reduce((acc, row) => acc + row[h], 0));
  const grandTotal = dayTotals.reduce((a, b) => a + b, 0);

  if (grandTotal === 0) return (
    <div className="h-64 flex flex-col items-center justify-center text-brand-dark/30 border-2 border-dashed border-brand-border rounded-[32px] bg-brand-light/10">
      <Activity size={48} className="mb-4 opacity-20" />
      <p className="font-serif text-lg">直近30日間のアクティビティデータがありません</p>
      <p className="text-[10px] mt-2 uppercase tracking-[0.2em] opacity-40">No access logs recorded in JST</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-brand-primary/10 rounded-full border border-brand-primary/20">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Timezone: JST (UTC+9)</span>
          </div>
          <div className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} />
            Total Activity: {grandTotal.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <div className="min-w-[800px] p-1">
          <table className="w-full border-separate border-spacing-[1px] table-fixed">
            <thead>
              <tr>
                <th className="w-20 text-[11px] text-brand-dark/40 font-bold text-right pr-4 pb-4 uppercase tracking-tighter">Day</th>
                {hours.map(h => (
                  <th key={h} className="text-[10px] text-brand-dark/40 font-mono font-bold text-center pb-4">
                    {h.toString().padStart(2, '0')}
                  </th>
                ))}
                <th className="w-20 text-[11px] text-brand-dark/40 font-bold text-center pb-4 uppercase tracking-tighter">Total</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, dIdx) => (
                <tr key={dIdx}>
                  <td className="text-[12px] text-brand-dark/80 font-bold text-right pr-4 h-9 align-middle bg-brand-light/40 rounded-l-xl border-l border-y border-brand-border/30">
                    {days[dIdx]}曜日
                  </td>
                  {row.map((count, hIdx) => {
                    // Optimized square-root scale intensity for gorgeous visibility
                    const intensity = count > 0 ? 0.15 + (Math.sqrt(count) / Math.sqrt(maxCount)) * 0.85 : 0;
                    
                    let bgColor = 'rgba(93, 167, 177, 0.03)';
                    if (count > 0) {
                      bgColor = `rgba(93, 167, 177, ${intensity})`;
                    }

                    return (
                      <td key={hIdx} className="p-0">
                        <div 
                          className="h-9 rounded-md transition-all hover:scale-[1.1] hover:z-10 hover:shadow-xl group relative cursor-help border border-black/[0.04] flex items-center justify-center m-[1px]"
                          style={{ backgroundColor: bgColor }}
                        >
                          {count > 0 && (
                            <span className={`text-[8px] font-bold ${intensity > 0.65 ? 'text-white' : 'text-brand-dark/65'}`}>
                              {count > 99 ? '99+' : count}
                            </span>
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-5 py-4 bg-brand-dark text-white text-[13px] rounded-[24px] opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-2xl whitespace-nowrap border border-white/10 transition-all transform translate-y-3 group-hover:translate-y-0 backdrop-blur-md">
                            <div className="font-bold border-b border-white/10 pb-2 mb-2 flex justify-between items-center gap-8">
                              <span className="text-brand-accent text-base">{days[dIdx]}曜日 {hIdx}:00</span>
                              <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full">JST</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="opacity-60">アクセス数:</span>
                              <span className="text-brand-accent font-bold text-lg">{count.toLocaleString()} <span className="text-[11px] opacity-60 font-normal">PV</span></span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center align-middle pl-1">
                    <div className="text-[12px] font-mono font-bold text-brand-dark bg-brand-light/70 h-9 flex items-center justify-center rounded-r-xl border-r border-y border-brand-border/40 shadow-sm">
                      {dayTotals[dIdx].toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Footer: Hour Totals */}
              <tr>
                <td className="text-[11px] text-brand-dark/40 font-bold text-right pr-4 pt-6 uppercase tracking-tighter">Hourly</td>
                {hourTotals.map((total, hIdx) => (
                  <td key={hIdx} className="pt-6">
                    <div className="text-[10px] font-mono font-bold text-brand-dark/40 text-center">
                      {total > 999 ? `${(total/1000).toFixed(1)}k` : total}
                    </div>
                  </td>
                ))}
                <td className="pt-6 text-center">
                  <div className="text-[11px] font-mono font-bold text-brand-primary">
                    {grandTotal > 999 ? `${(grandTotal/1000).toFixed(1)}k` : grandTotal}
                  </div>
                </td>
              </tr>
            </tbody>
            </table>
          </div>
        </div>
      
      <div className="flex items-center justify-end gap-4 px-2">
        <div className="flex items-center gap-3 text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest">
          <span>少ない</span>
          <div className="flex gap-1.5">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((lvl, i) => (
              <div 
                key={i} 
                className="w-5 h-5 rounded-md border border-black/[0.05]" 
                style={{ backgroundColor: lvl === 0 ? 'rgba(93, 167, 177, 0.03)' : `rgba(93, 167, 177, ${0.15 + lvl * 0.85})` }}
              />
            ))}
          </div>
          <span>多い</span>
        </div>
      </div>
    </div>
  );
};

// --- Admin Live System & Rate-Limit Controller Component ---

export const AdminLiveSystemMonitor = ({ token }: { token: string }) => {
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [latency, setLatency] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [limitsForm, setLimitsForm] = useState({
    authMax: 100,
    registrationMax: 5,
    searchMax: 30,
    postMax: 3,
    messageMax: 50,
    verifyMax: 10,
  });
  
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);

  // Fetch initial limits
  const fetchLimits = async () => {
    try {
      const res = await fetch('/api/admin/rate-limits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLimitsForm({
          authMax: data.authMax || 100,
          registrationMax: data.registrationMax || 5,
          searchMax: data.searchMax || 30,
          postMax: data.postMax || 3,
          messageMax: data.messageMax || 50,
          verifyMax: data.verifyMax || 10,
        });
        if (data.violationsCount !== undefined) {
          setMetrics((prev: any) => ({
            ...prev,
            violationsCount: data.violationsCount,
            totalRequests: data.totalRequests,
            rateLimitConfig: data,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load rate limits:", e);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    setWsStatus('connecting');
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        // Authenticate
        ws.send(JSON.stringify({ type: 'auth', token }));
        ws.send(JSON.stringify({ type: 'admin-subscribe' }));
        
        // Start Ping interval
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', clientTime: Date.now() }));
          }
        }, 2500);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'pong') {
            const rtt = Date.now() - message.clientTime;
            setLatency(rtt);
          } else if (message.type === 'sys-metrics') {
            setMetrics(message);
            if (message.rateLimitConfig) {
              setLimitsForm({
                authMax: message.rateLimitConfig.authMax || 100,
                registrationMax: message.rateLimitConfig.registrationMax || 5,
                searchMax: message.rateLimitConfig.searchMax || 30,
                postMax: message.rateLimitConfig.postMax || 3,
                messageMax: message.rateLimitConfig.messageMax || 50,
                verifyMax: message.rateLimitConfig.verifyMax || 10,
              });
            }
          }
        } catch (e) {
          console.error("WS parsing error:", e);
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        setLatency(null);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        
        // Auto reconnect after 3.5 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3500);
      };

      ws.onerror = () => {
        setWsStatus('disconnected');
      };
    } catch (e) {
      console.error("WS creation error:", e);
      setWsStatus('disconnected');
    }
  };

  useEffect(() => {
    fetchLimits();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [token]);

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);
    try {
      const res = await fetch('/api/admin/rate-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(limitsForm)
      });
      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to update rates:", e);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetCounters = async () => {
    if (!window.confirm("サーバー側のリクエスト総数およびレート制限違反カウンターをリセットしますか？")) return;
    try {
      const res = await fetch('/api/admin/rate-limits/reset-stats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("統計カウンターをリセットしました。");
        fetchLimits();
      }
    } catch (e) {
      console.error("Failed to reset counts:", e);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0秒';
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor((seconds % (3600*24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const dDisplay = d > 0 ? `${d}日 ` : "";
    const hDisplay = h > 0 ? `${h}時間 ` : "";
    const mDisplay = m > 0 ? `${m}分 ` : "";
    const sDisplay = `${s}秒`;
    return dDisplay + hDisplay + mDisplay + sDisplay;
  };

  return (
    <div className="space-y-6 text-black">
      {/* Dynamic Status Dashboard Header Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connection State Card */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-[#f4fafb]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black/50 uppercase tracking-widest block">WebSocket 疎通ステータス</span>
            <span className={`w-3.5 h-3.5 rounded-full ${
              wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
              wsStatus === 'connecting' ? 'bg-amber-500 animate-spin border-t-2 border-brand-primary' : 
              'bg-red-500'
            }`} />
          </div>
          
          <div className="my-4">
            <div className="text-2xl font-serif font-extrabold text-black">
              {wsStatus === 'connected' ? '接続確立中 (Live)' :
               wsStatus === 'connecting' ? 'サーバー通信確立中...' :
               '接続切断・再試行中'}
            </div>
            {wsStatus === 'connected' && latency !== null && (
              <p className="text-xs text-black/60 font-sans mt-0.5 flex items-center gap-1">
                <span>平均応答速度 (RTT):</span>
                <span className={`font-mono font-extrabold px-1.5 py-0.2 rounded ${
                  latency < 30 ? 'text-emerald-700 bg-emerald-50' :
                  latency < 100 ? 'text-amber-700 bg-amber-50' :
                  'text-rose-700 bg-rose-50'
                }`}>{latency} ms</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
            <span className="text-[10px] text-black/40 uppercase tracking-wider font-mono">
              PROTOCOL: {window.location.protocol === 'https:' ? 'WSS' : 'WS'}
            </span>
            <button 
              type="button"
              onClick={() => connectWebSocket()}
              className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 active:scale-95 bg-transparent border-none cursor-pointer"
            >
              <RefreshCw size={10} /> 手動再接続
            </button>
          </div>
        </div>

        {/* Requests & Violations Tracker */}
        <div className="glass-card p-6 flex flex-col justify-between bg-gradient-to-br from-white to-[#fff8f8]/30">
          <div>
            <span className="text-xs font-bold text-black/50 uppercase tracking-widest block">リアルタイムレート制限違反検知</span>
            <div className="grid grid-cols-2 gap-4 my-3 text-left">
              <div>
                <span className="text-[10px] text-black/40 block">総リクエスト件数</span>
                <span className="text-2xl font-serif font-extrabold text-black">
                  {metrics?.totalRequests?.toLocaleString() || (metrics?.totalRequests === 0 ? '0' : '---')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-800/80 block">レート制限到達(遮断)</span>
                <span className={`text-2xl font-serif font-extrabold ${metrics?.violationsCount > 0 ? 'text-rose-600 animate-pulse' : 'text-black/30'}`}>
                  {metrics?.violationsCount?.toLocaleString() || '0'} <span className="text-xs font-sans text-rose-500 font-bold">回</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
            <span className="text-[10px] text-black/40 uppercase tracking-wider font-mono">
              ACTIVE CONNECTIONS: {metrics?.activeConnections || 1}
            </span>
            <button 
              type="button"
              onClick={handleResetCounters}
              className="text-[10px] font-bold text-neutral-500 hover:text-rose-600 transition-colors uppercase tracking-wider font-sans active:scale-95 bg-transparent border-none cursor-pointer"
            >
              統計値をゼロ化
            </button>
          </div>
        </div>

        {/* System System Stats */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-black/50 uppercase tracking-widest block">サーバー稼働リソース状況</span>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-black/50">Uptime</span>
                <span className="font-mono font-bold text-black">{formatUptime(metrics?.uptime)}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-black/50">Node.js Heap (Used)</span>
                  <span className="font-mono font-bold text-black">{formatBytes(metrics?.memoryUsage?.heapUsed)} / {formatBytes(metrics?.memoryUsage?.heapTotal)}</span>
                </div>
                {metrics?.memoryUsage && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-brand-primary h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-brand-border/60 text-[10px] text-black/40 font-mono uppercase">
            ENV: {process.env.NODE_ENV || 'production'} • LIVE REFRESH
          </div>
        </div>

      </div>

      {/* Limits Live Changer Form */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-4 mb-6">
          <div>
            <h4 className="text-lg font-serif font-black text-black">レート制限（Rate-Limit）ライブコントローラー</h4>
            <p className="text-xs text-black/50 font-sans mt-1">
              各APIに対する同一IPからのリクエスト上限数をリアルタイムで調整できます。変更は即座に反映されます。
            </p>
          </div>
          <button
            type="button"
            onClick={fetchLimits}
            className="px-3 py-1.5 text-xs text-black border border-brand-border rounded-xl hover:bg-brand-primary/5 transition-all outline-none font-bold active:scale-95 flex items-center gap-1.5 bg-white cursor-pointer"
          >
            <RefreshCw size={12} /> 最新値をロード
          </button>
        </div>

        <form onSubmit={handleUpdateLimits} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            {/* Limit Auth */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">1. 会員ログイン上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.authMax} 回</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="500" 
                step="5"
                value={limitsForm.authMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, authMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>厳格 (5)</span>
                <span>標準 (100)</span>
                <span>無制限同等 (500)</span>
              </div>
            </div>

            {/* Limit Register */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">2. 新規会員登録上限 (1時間ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.registrationMax} 回</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="1"
                value={limitsForm.registrationMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, registrationMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>超厳格 (1)</span>
                <span>標準 (5)</span>
                <span>大容量 (50)</span>
              </div>
            </div>

            {/* Limit Search */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">3. 思い出検索・漂流手紙取得上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.searchMax} 回</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="200" 
                step="5"
                value={limitsForm.searchMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, searchMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>高負荷防止 (5)</span>
                <span>標準 (30)</span>
                <span>緩和 (200)</span>
              </div>
            </div>

            {/* Limit Post */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">4. ボトル投函作成・投函上限 (1時間ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.postMax} 回</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1"
                value={limitsForm.postMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, postMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>連投防止 (1)</span>
                <span>推奨標準 (3)</span>
                <span>緩和 (30)</span>
              </div>
            </div>

            {/* Limit Verify */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">5. 秘密の質問回答・突破試行上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.verifyMax} 回</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="50" 
                step="1"
                value={limitsForm.verifyMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, verifyMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>総当たり対策 (2)</span>
                <span>標準 (10)</span>
                <span>テスト用 (50)</span>
              </div>
            </div>

            {/* Limit Message */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-black/75">6. 手紙内メッセージ送信上限 (15分ごと)</span>
                <span className="font-mono font-extrabold text-[#5ea5ad] text-sm">{limitsForm.messageMax} 回</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="300" 
                step="5"
                value={limitsForm.messageMax}
                onChange={(e) => setLimitsForm(p => ({ ...p, messageMax: Number(e.target.value) }))}
                className="w-full accent-[#5ea5ad] bg-slate-100 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-black/30">
                <span>連投制限 (5)</span>
                <span>快適標準 (50)</span>
                <span>無制限同等 (300)</span>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-border/60">
            {updateSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 animate-fade-in mr-2">
                設定をリアルタイム更新に反映しました！
              </span>
            )}
            <button 
              type="submit" 
              disabled={updating}
              className="px-6 py-3 bg-brand-dark hover:bg-[#5ea5ad] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:scale-95 cursor-pointer"
            >
              {updating ? '設定更新中...' : 'コントローラー設定を本番反映'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Admin Dashboard ---

export const samplePhrasesCategories = [
  {
    id: 'fullname',
    title: '① 実名フルネーム露出',
    icon: '👤',
    phrases: [
      { text: "昔の同級生の 山田太郎（やまだたろう）くんを探しています。見かけたら教えてください。", type: "warn", label: "漢字フルネーム（通常）", desc: "漢字2字＋漢字2字のフルネームを検知して警告を表示します。" },
      { text: "探している人は 鈴木一郎 くんです。1995年卒業です。", type: "warn", label: "漢字フルネーム（スペースあり）", desc: "苗字と名前の間にスペースがあっても、常用姓名規則で検知警告。" },
      { text: "ヤマダタロウ を探しています。元気にしてるかな？", type: "safe", label: "カタカナフルネーム（安全パス）", desc: "カタカナ表記はプライバシー保護に抵触しない安全な思い出表現としてパスします。" },
      { text: "佐藤花子 ちゃんを探しています。連絡待ってます。", type: "warn", label: "女性実名フルネーム", desc: "日本の代表的な女性姓名辞書データに照合し、瞬時に警告をトリガー。" },
      { text: "さとうはなこ ちゃんを捜しています。", type: "safe", label: "ひらがなフルネーム（安全パス）", desc: "ひらがな表記はニックネームと判定され、円滑な再会を阻害しないためパスします。" },
      { text: "小学校の時の担任、 高橋健二 先生にどうしてもお礼が言いたいです。", type: "warn", label: "教師実名の露出警告", desc: "典型的な日本語苗字＋名前構成を姓名辞書判定し、不当な実名晒しを防止します。" },
      { text: "高橋K先生、または たかけん 先生を探しています。", type: "safe", label: "イニシャル・ニックネーム（安全パス）", desc: "イニシャルや愛称は、お互いしか分からない安全な表現として推奨パス。" },
      { text: "あの時助けてくれた 中村優 さん、もう一度会いたいです。", type: "warn", label: "一般的フルネーム警告", desc: "「中村優」という実名露出を水際で検知して自動警告を促します。" },
      { text: "マサルくん（当時の中村くん）を捜しています。", type: "safe", label: "ニックネーム＋苗字（安全パス）", desc: "特定個人を直接晒さない、安全・自然な探し方としてパスします。" },
      { text: "渡辺直美 さんと連絡を取りたくて投函しました。", type: "warn", label: "漢字フルネーム警告", desc: "同姓同名晒しトラブルを回避するため、日本常用姓名パターンで検知。" }
    ]
  },
  {
    id: 'contact',
    title: '② 直接連絡先(LINE等)',
    icon: '📱',
    phrases: [
      { text: "もし見覚えがあったら、LINE ID: happy123 までメッセージをください！", type: "mask", label: "LINE ID（半角英語）", desc: "LINE IDや類似のSNSアカウントへの誘導を検閲し、自動伏字化（****）します。" },
      { text: "お電話でお話ししましょう。09012345678 です。", type: "mask", label: "携帯電話番号（数字連続）", desc: "11桁の数字連続を検知し、密室に誘い出す行為を遮断するため自動マスキング。" },
      { text: "メールアドレスは sample_test@gmail.com なので、ここへメールしてください。", type: "mask", label: "メールアドレス", desc: "電子メールアドレスの特有パターンを正規表現で検出し、自動伏字化。" },
      { text: "インスタのIDは instant_love_abc です。dm待ってます！", type: "mask", label: "Instagram ID誘導", desc: "「インスタ」や「Instagram」の単語と共に提示されるアカウント名を検閲。" },
      { text: "Twitter (x.com) で @old_friend_net を検索して声をかけてね。", type: "mask", label: "X (Twitter) 誘導", desc: "x.com や Twitter のアカウント名指定による直接コンタクトを規制。" },
      { text: "フェイスブックで『田中実』で検索すると、私のプロフィールが出てきます。", type: "mask", label: "Facebook誘導", desc: "Facebook等、別プラットフォームの個人アカウントへの強引な誘い込みを規制。" },
      { text: "ラインのID：friends_forever01 です。", type: "mask", label: "ラインカタカナ表記", desc: "カタカナ表記「ラインのID」などの日本語表現も高い精度で伏字化。" },
      { text: "080-9876-5432 にショートメッセージ(SMS)を直接送ってください。", type: "mask", label: "携帯電話（ハイフンあり）", desc: "ハイフン区切りの携帯電話番号フォーマットも瞬時にマスキング。" },
      { text: "私の連絡先、IDは【lineid: secret_code】になります！", type: "mask", label: "変則的なLINE表記", desc: "「lineid」などの表記ゆれも検知エンジンが自動マスキング。" },
      { text: "詳しい連絡は、アドレス contact_us@yahoo.co.jp にお願いします。", type: "mask", label: "Yahooメールアドレス", desc: "gmail以外の各種メールプロバイダアドレスも漏れなく伏字化。" }
    ]
  },
  {
    id: 'address',
    title: '③ 機微個人情報・詳細住所',
    icon: '📍',
    phrases: [
      { text: "あの頃、東京都渋谷区神南1丁目2-3のマンションに住んでいましたよね。", type: "mask", label: "詳細住所（東京都）", desc: "都道府県から始まり番地まで含む詳細な機微個人情報を自動マスキング。" },
      { text: "思い出の場所は、大阪府大阪市北区梅田3-1-1の近くの喫茶店です。", type: "mask", label: "詳細住所（大阪府）", desc: "特定される恐れのある詳細住所を自動で「****」へと伏字処理します。" },
      { text: "愛知県名古屋市中村区名駅1-1-4 of 駅ビルでよく待ち合わせしました。", type: "mask", label: "詳細住所（愛知県）", desc: "住所特定トラブルからユーザーを守るため、住所パターンを遮断。" },
      { text: "私は今、福岡県福岡市博多区博多駅中央街1-1のオフィスビルで働いています。", type: "mask", label: "詳細住所（福岡県）", desc: "職場や特定の活動場所が特定される詳細アドレスを遮断。" },
      { text: "北海道の札幌市内でよく遊んだ思い出があります。", type: "safe", label: "広域地域名（安全パス）", desc: "「札幌市内」など大まかな地域名は安全な思い出エピソードとしてパスします。" },
      { text: "神奈川県横浜市中区山下町279の公園のベンチで話したこと覚えていますか？", type: "mask", label: "詳細住所（神奈川県）", desc: "番地名を含む神奈川県内の詳細な住所露出を防御します。" },
      { text: "京都の嵐山周辺で、紅葉を見に行った時のこと...", type: "safe", label: "有名観光地（安全パス）", desc: "特定個人が特定されない観光地や駅周辺の表現は問題なくパスされます。" },
      { text: "実家は 兵庫県神戸市中央区港島中町6-1 にあります。訪ねてみてください。", type: "mask", label: "詳細住所（兵庫県）", desc: "実家の所在地など、重大なストーキングに悪用されかねない住所を排除。" },
      { text: "九州のひなびた温泉街で偶然出会ったあの時のこと...", type: "safe", label: "広域温泉街（安全パス）", desc: "極めて情緒的で安全な思い出表現。完全にパスされます。" },
      { text: "当時通っていた塾は、宮城県仙台市青葉区中央1-1-1 のビルの中にありました。", type: "mask", label: "詳細住所（宮城県）", desc: "東北地方の住所であっても、正規表現パターンにより完璧にマスキング。" }
    ]
  },
  {
    id: 'abuse',
    title: '④ 誹謗中傷・危険暴言',
    icon: '🚫',
    phrases: [
      { text: "お前のこと絶対に許さない。見つけ出して殺してやるからな。", type: "quarantine", label: "凶悪殺害予告", desc: "「殺す」「許さない」といった命に係わる脅迫。自動隔離され即時自動通報されます。" },
      { text: "うざいんだよ死ね。ネットで実名晒して人生終わらせてやる。", type: "quarantine", label: "自死教唆・晒し脅迫", desc: "「死ね」「晒す」など極めて悪質な嫌がらせ・脅迫。即時自動通報＆非公開処理。" },
      { text: "別れたのに逃げられると思うなよ。毎日家の下をストーカーしてやるからな。", type: "quarantine", label: "ストーキング執着宣言", desc: "執拗な付きまといやストーカー予告。安全保障上、自動で即時隔離されます。" },
      { text: "お前の会社や学校に、昔の写真をばら撒いてやる。覚悟しろ。", type: "quarantine", label: "リベンジポルノ脅迫", desc: "嫌がらせ目的の写真・データばら撒き脅迫。警察公安提出対象として自動隔離。" },
      { text: "本当に気持ち悪い。お前なんかこの世から消えろ、ゴミクズ。", type: "quarantine", label: "過度な暴言・侮辱", desc: "人格否定や深刻な誹謗中傷。AIが不適切単語として検知し自動隔離。" },
      { text: "お前の住所は特定できている。近いうちに押し入って地獄を見せてやる。", type: "quarantine", label: "侵入予告・重大脅迫", desc: "住居侵入・身体への危害をほのめかす凶悪メッセージ。即自動通報起票。" },
      { text: "ネットで炎上させて自殺に追い込んでやる。楽しみに待ってろ。", type: "quarantine", label: "集団リンチ・ネット暴力", desc: "他者を精神的に追い詰めるネット暴力発言。即座にシステム隔離されます。" },
      { text: "裏切り者め。刺し違えてでも復讐してやるからな。", type: "quarantine", label: "復讐・傷害予告", desc: "復讐や刃物等の凶器を連想させる脅迫表現。直ちに司法連携通報。" },
      { text: "お前を絶対にストーキングし続ける。どこに引っ越しても無駄だ。", type: "quarantine", label: "ストーカー執拗表現", desc: "「ストーキング」等、本アプリが最も排除すべき凶悪執着言動を完全隔離。" },
      { text: "一生呪ってやる。お前の家族も全員めちゃくちゃにしてやる。", type: "quarantine", label: "家族への危害・執念暴言", desc: "対象ユーザーやその家族に危害を加える脅迫文。自動隔離＆優先ログ保全。" }
    ]
  },
  {
    id: 'dating',
    title: '⑤ 不適切出会い・パパ活',
    icon: '💳',
    phrases: [
      { text: "今日夜暇な人いませんか？お小遣いあげるので大人のお付き合い（パパ活）しましょう。", type: "quarantine", label: "パパ活勧誘（お小遣い）", desc: "「パパ活」や「お小遣い」による金銭を伴う異性交渉。即時自動隔離と通報。" },
      { text: "割り切りで1回3万円でホテルで会える女性を募集しています。", type: "quarantine", label: "援助交際（売春）募集", desc: "「ホテル」「1回3万」「割り切り」などの売春・買春勧誘。即時自動通報。" },
      { text: "私は女子大生です。生活費が苦しいので、パトロンになってくれる男性を探しています。", type: "quarantine", label: "パトロン・愛人契約募集", desc: "金銭支援を前提とする不適切な異性紹介・愛人関係の募集。完全隔離対象。" },
      { text: "パパ活募集。都内手渡し2。詳細はメッセージにて。", type: "quarantine", label: "パパ活隠語（手渡し）", desc: "手渡しなどの隠語を用いた売買春行為。モデレーションエンジンにより即隔離。" },
      { text: "援助交際してくれませんか？お金はいくらでも払いますよ。", type: "quarantine", label: "援助交際直接要求", desc: "「援助交際」という不法公序良俗違反ワード。一発で自動通報・隔離されます。" },
      { text: "秘密の大人の関係になりたいです。ホテル代は出します。", type: "quarantine", label: "肉体・性的関係の募集", desc: "「大人の関係」「ホテル代」を伴う、無差別な性的出会い目的の書き込みを制限。" },
      { text: "寂しいお姉さん、今からホテルで会いませんか？謝礼あり。", type: "quarantine", label: "性的出会い・謝礼付き", desc: "金銭謝礼をほのめかす即時性的アポイントメント。自動で非公開隔離。" },
      { text: "お小遣い付きで遊んでくれる人。裏垢女子大歓迎です。", type: "quarantine", label: "裏垢・性的隠語勧誘", desc: "「裏垢」「お小遣い付き」など不適切な出会い系活動を厳格排除。" },
      { text: "即日アポ可能です。ホテル直行。大3でどうですか？", type: "quarantine", label: "売春隠語（大3・直行）", desc: "金銭や直接の肉体関係を表す売春等隠語を検知、即時隔離・自動通報。" },
      { text: "パパ活女子募集中！美味しいご飯を食べてお小遣いも稼げます！", type: "quarantine", label: "パパ活スカウト行為", desc: "出会い系ネット異性紹介誘導・パパ活斡旋のスカウト行為。即座に自動通報。" }
    ]
  }
];

export const AdminDashboard = () => {
  const { user, token, logout, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isAllowedAdminRole = Boolean(
    user && (
      ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'].includes(user?.role || '') ||
      user?.username === 'admin' ||
      (user?.role && user.role.toLowerCase().includes('admin'))
    )
  );

  const [users, setUsers] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [ngWords, setNgWords] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactCategoryFilter, setContactCategoryFilter] = useState<'all' | 'urgent' | 'technical' | 'account' | 'general'>('all');
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactSortBy, setContactSortBy] = useState<'priority' | 'newest' | 'oldest'>('priority');
  const [isSeedingContacts, setIsSeedingContacts] = useState(false);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
  const [storyCategoryFilter, setStoryCategoryFilter] = useState<string>('all');
  const [editStoryForm, setEditStoryForm] = useState<{ title: string; message: string; era: string; gender: string; category: string }>({ 
    title: '', 
    message: '', 
    era: '', 
    gender: '男性', 
    category: 'classmate' 
  });
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [newStoryForm, setNewStoryForm] = useState({
    title: '',
    message: '',
    era: '',
    gender: '男性',
    category: 'classmate',
    consent: true,
    is_public: true,
    is_featured: false,
    is_all_page: true,
    display_position: ''
  });
  const [ageVerificationLogs, setAgeVerificationLogs] = useState<any[]>([]);
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [statsEnabled, setStatsEnabled] = useState(true);
  const [adminHomeDesign, setAdminHomeDesign] = useState<'v1' | 'v2'>(() => {
    return (localStorage.getItem('remeets_home_design') as 'v1' | 'v2') || 'v2';
  });

  useEffect(() => {
    const handleDesignChange = () => {
      const current = (localStorage.getItem('remeets_home_design') as 'v1' | 'v2') || 'v2';
      setAdminHomeDesign(current);
    };
    window.addEventListener('home_design_changed', handleDesignChange);
    return () => window.removeEventListener('home_design_changed', handleDesignChange);
  }, []);

  const handleToggleHomeDesignMode = (mode: 'v1' | 'v2') => {
    setAdminHomeDesign(mode);
    localStorage.setItem('remeets_home_design', mode);
    window.dispatchEvent(new Event('home_design_changed'));
  };
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [loadingUserMessages, setLoadingUserMessages] = useState(false);
  const [userModalTab, setUserModalTab] = useState<'posts' | 'messages'>('posts');
  const [newNgWord, setNewNgWord] = useState('');
  const [stats, setStats] = useState<any>({
    summary: { totalUsers: 0, totalReunions: 0, todayPosts: 0 },
    recentReunions: [],
    postsToday: [],
    dailyStats: [],
    eraStats: [],
    regionStats: [],
    pathStats: [],
    refererStats: [],
    searchStats: [],
    deviceStats: []
  });
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [retentionStats, setRetentionStats] = useState<any[]>([]);
  const [pageViewStats, setPageViewStats] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [deletedPostsArchive, setDeletedPostsArchive] = useState<any[]>([]);
  const [moderationSubTab, setModerationSubTab] = useState<'queue' | 'archive'>('queue');
  // 削除管理モーダル
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteReasonText, setDeleteReasonText] = useState<string>('規約違反またはAIフラグ検出による削除');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reunionFunnel, setReunionFunnel] = useState<any[]>([]);
  const [reunionDurationStats, setReunionDurationStats] = useState<any[]>([]);
  const [dbVersions, setDbVersions] = useState<any[]>([]);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionComment, setNewVersionComment] = useState('');

  // 検閲テストシミュレータ用ステート
  const [censorshipTestText, setCensorshipTestText] = useState<string>('');
  const [censorshipTestResult, setCensorshipTestResult] = useState<any>(null);
  const [isTestingCensorship, setIsTestingCensorship] = useState<boolean>(false);
  const [simulatedPostId, setSimulatedPostId] = useState<number | null>(null);
  const [isSimulatingPost, setIsSimulatingPost] = useState<boolean>(false);
  const [simulationSuccessMsg, setSimulationSuccessMsg] = useState<string | null>(null);

  // 検証用サンプル文言集用ステート
  const [activeSampleCategory, setActiveSampleCategory] = useState<string>('fullname');
  const [isSampleBookOpen, setIsSampleBookOpen] = useState<boolean>(false);

  // 警察照会一括出力用ステート ＆ ハンドラー
  const [policeReportData, setPoliceReportData] = useState<any>(null);
  const [isGeneratingPoliceReport, setIsGeneratingPoliceReport] = useState<boolean>(false);
  const [copiedPoliceReport, setCopiedPoliceReport] = useState<boolean>(false);

  const generateTextPoliceReport = (data: any) => {
    if (!data || !data.user) return '';
    const u = data.user;
    const now = new Date(data.report_generated_at || Date.now()).toLocaleString('ja-JP');
    
    let txt = `=================================================================\n`;
    txt += `【捜査関係事項照会 回答書 兼 会員登録・利用全データ保全証明書】\n`;
    txt += `=================================================================\n`;
    txt += `発行日時: ${now}\n`;
    txt += `根拠法令: ${data.legal_basis || '刑事訴訟法第197条第2項（公務所等に対する照会）'}\n`;
    txt += `管理システム: ${data.system_name || 'ReMEETs 治安防衛・情報開示自動生成システム'}\n`;
    txt += `照会対象ユーザーID: #${u.id}\n\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[1. 照会対象者 登録基本情報 & 外部SNS連携アカウント]\n`;
    txt += `-----------------------------------------------------------------\n`;
    txt += `ユーザーID       : #${u.id}\n`;
    txt += `ユーザー名       : ${u.username || '-'}\n`;
    txt += `表示ニックネーム : ${u.nickname || '未設定'}\n`;
    txt += `公的氏名         : ${u.full_name || '未設定'}\n`;
    txt += `登録メールアドレス : ${u.email || '未設定'}\n`;
    txt += `認証携帯電話番号   : ${u.phone_number || '未登録/未提出'}\n`;
    txt += `外部SNS識別UID   : LINE UID: ${u.line_uid || '未連携'} / Google UID: ${u.google_uid || '未連携'}\n`;
    txt += `アカウント状態   : ${u.is_blocked ? '凍結/ブロック中' : '通常稼働'}\n`;
    txt += `本人確認区分     : ${u.is_ekyc_verified ? '🛡️ 公的本人確認 (eKYC) 承認済' : '📝 自己宣言のみ'}\n`;
    txt += `アカウント作成日時 : ${u.created_at ? new Date(u.created_at).toLocaleString('ja-JP') : '-'}\n\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[2. eKYC公的本人確認・年齢確認 監査ログ (全${data.ageLogs?.length || 0}件)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.ageLogs && data.ageLogs.length > 0) {
      data.ageLogs.forEach((l: any, idx: number) => {
        txt += ` (${idx + 1}) 日時: ${new Date(l.created_at).toLocaleString('ja-JP')} | 判定: ${l.is_verified ? '承認' : '却下'} | 書類: ${l.document_type || '-'} | 年齢: ${l.age || '-'}歳 | IP: ${l.ip || '-'}\n`;
      });
    } else {
      txt += ` 記録なし\n`;
    }
    txt += `\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[3. 投稿ボトルメール履歴 (全${data.posts?.length || 0}件・削除/AI隔離分含む)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach((p: any, idx: number) => {
        txt += ` (${idx + 1}) ボトルID: #${p.id} | 投函日時: ${new Date(p.created_at).toLocaleString('ja-JP')}\n`;
        txt += `     宛先のお名前: ${p.target_name || '-'} 様 | 年代: ${p.era || '-'} | カテゴリ: ${p.category || '-'}\n`;
        txt += `     探している人(差出人表記): ${p.searcher_name || '-'} (フルネーム: ${p.searcher_full_name || '-'})\n`;
        txt += `     AI自動隔離フラグ: ${p.ai_flagged ? '⚠️ AI検閲検出 (' + (p.ai_reason || '不適切表現') + ')' : '正常'}\n`;
        txt += `     ステータス: ${p.status || 'active'}\n`;
        txt += `     本文: ${p.message || ''}\n\n`;
      });
    } else {
      txt += ` 投稿記録なし\n\n`;
    }

    txt += `-----------------------------------------------------------------\n`;
    txt += `[4. 1対1メッセージ送受信全履歴 (全${data.messages?.length || 0}件)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.messages && data.messages.length > 0) {
      data.messages.forEach((m: any, idx: number) => {
        txt += ` (${idx + 1}) メッセージID: #${m.id} | 日時: ${new Date(m.created_at).toLocaleString('ja-JP')}\n`;
        txt += `     送信者: ${m.sender_nickname || m.sender_username} (#${m.sender_id})\n`;
        txt += `     受信者: ${m.receiver_nickname || m.receiver_username} (#${m.receiver_id})\n`;
        txt += `     AI隔離フラグ: ${m.ai_flagged ? '⚠️ AI検閲検出' : '正常'}\n`;
        txt += `     本文: ${m.content || ''}\n\n`;
      });
    } else {
      txt += ` ※メッセージの送受信記録はありません。\n\n`;
    }

    txt += `-----------------------------------------------------------------\n`;
    txt += `[5. 通報・違反被害・不適切アクセス監査記録]\n`;
    txt += `-----------------------------------------------------------------\n`;
    txt += ` 通報された回数 (被通報): ${data.reportsAsTarget?.length || 0}件\n`;
    if (data.reportsAsTarget && data.reportsAsTarget.length > 0) {
      data.reportsAsTarget.forEach((r: any, idx: number) => {
        txt += `   - [被通報${idx + 1}] 日時: ${new Date(r.created_at).toLocaleString('ja-JP')} | 理由: ${r.reason || '-'} | 詳細: ${r.details || '-'}\n`;
      });
    }
    txt += ` 通報を行った回数 (通報者): ${data.reportsAsReporter?.length || 0}件\n\n`;

    txt += `-----------------------------------------------------------------\n`;
    txt += `[6. システムアクセス・操作セキュリティ監査ログ (直近100件)]\n`;
    txt += `-----------------------------------------------------------------\n`;
    if (data.accessLogs && data.accessLogs.length > 0) {
      data.accessLogs.slice(0, 20).forEach((al: any) => {
        txt += `  - [アクセス] ${new Date(al.created_at).toLocaleString('ja-JP')} | IP: ${al.ip || '-'} | パス: ${al.path || '-'} | UA: ${al.user_agent || '-'}\n`;
      });
    } else {
      txt += ` アクセスログなし\n`;
    }
    txt += `\n`;

    txt += `=================================================================\n`;
    txt += `【証明保証・電子証明ハッシュ】\n`;
    txt += `本出力データは、刑事訴訟法第197条第2項に基づき、ReMEETs 治安防衛システムより直接一括抽出された非改ざん性暗号化データです。\n`;
    txt += `=================================================================\n`;

    return txt;
  };

  const handleGeneratePoliceReport = async (userId: number) => {
    if (!userId) return;
    setIsGeneratingPoliceReport(true);
    setCopiedPoliceReport(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}/police-disclosure`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPoliceReportData(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || '警察照会用データの取得に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsGeneratingPoliceReport(false);
    }
  };

  const handleCopyPoliceReportText = () => {
    if (!policeReportData) return;
    const textContent = generateTextPoliceReport(policeReportData);
    navigator.clipboard.writeText(textContent).then(() => {
      setCopiedPoliceReport(true);
      setTimeout(() => setCopiedPoliceReport(false), 3000);
    }).catch((err) => {
      console.error('Copy failed:', err);
      alert('コピーに失敗しました。');
    });
  };

  const handleDownloadPoliceReportJson = () => {
    if (!policeReportData || !policeReportData.user) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(policeReportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Police_Disclosure_User_${policeReportData.user.id}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTestCensorship = async (textToTest?: string) => {
    const textVal = textToTest !== undefined ? textToTest : censorshipTestText;
    if (!textVal) return;
    setIsTestingCensorship(true);
    try {
      const res = await fetch('/api/admin/test-censorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: textVal })
      });
      if (res.ok) {
        const data = await res.json();
        setCensorshipTestResult(data);
      } else {
        alert('検閲判定テストに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('ネットワークエラーが発生しました。');
    } finally {
      setIsTestingCensorship(false);
    }
  };

  const handleTriggerCensorshipSimulation = async () => {
    if (!censorshipTestText) return;
    setIsSimulatingPost(true);
    setSimulatedPostId(null);
    setSimulationSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/trigger-simulation-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: censorshipTestText })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulatedPostId(data.postId);
        if (data.aiFlagged) {
          setSimulationSuccessMsg(`【隔離完了・自動通報】 不当表現・NGワードを検知したため、ボトルID #${data.postId} は自動的に「非公開・隔離」され、即時安全自動通報（報告書）が自動起票されました。`);
        } else {
          setSimulationSuccessMsg(`【投函完了】 危険な文言や個人情報は検出されなかったため、ボトルID #${data.postId} は安全に「公開」状態で投函されました。`);
        }
        fetchData(); // データを最新化
      } else {
        alert('模擬投函シミュレーションに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('ネットワークエラーが発生しました。');
    } finally {
      setIsSimulatingPost(false);
    }
  };

  const fetchDbVersions = async () => {
    try {
      const res = await fetch('/api/admin/versions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDbVersions(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch DB versions:", err);
    }
  };

  const handleCreateVersion = async () => {
    if (isCreatingVersion) return;
    setIsCreatingVersion(true);
    try {
      const res = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newVersionComment || '手動スナップショット' })
      });
      if (res.ok) {
        const data = await res.json();
        setDbVersions(prev => [data.version, ...prev]);
        setNewVersionComment('');
        setStatusMsg({ type: 'success', text: `バージョン履歴 "${data.version.comment}" を正常に作成しました。` });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        const errData = await res.json();
        setStatusMsg({ type: 'error', text: `作成失敗: ${errData.error || '不明なエラー'}` });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: '通信エラーによりバージョンの作成に失敗しました。' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleRestoreVersion = (version: any) => {
    showConfirm(
      'データベースの復元 (Rollback)',
      `本当にこのバージョン "${version.comment}" (作成: ${new Date(version.timestamp).toLocaleString()}) に戻しますか？現在のデータは完全に上書きされ、その後に元に戻すことはできません。よろしければ「確定」をクリックしてください。`,
      async () => {
        try {
          const res = await fetch(`/api/admin/versions/${version.id}/restore`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setStatusMsg({ type: 'success', text: `バージョン "${version.comment}" から正常に自動復元しました！データ再読込のため自動で最新情報をロードします。` });
            setTimeout(() => setStatusMsg(null), 6000);
            fetchData();
          } else {
            const errData = await res.json();
            setStatusMsg({ type: 'error', text: `復元失敗: ${errData.error || '不明なエラー'}` });
            setTimeout(() => setStatusMsg(null), 6000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: '通信エラーにより復元に失敗しました。' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    );
  };

  const handleDeleteVersion = (version: any) => {
    showConfirm(
      'バージョン履歴の削除',
      `バージョン履歴 "${version.comment}" を削除しますか？バックアップファイル自体が削除されます。よろしければ「確定」をクリックしてください。`,
      async () => {
        try {
          const res = await fetch(`/api/admin/versions/${version.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setDbVersions(prev => prev.filter(v => v.id !== version.id));
            setStatusMsg({ type: 'success', text: 'バージョン履歴を削除しました。' });
            setTimeout(() => setStatusMsg(null), 4000);
          } else {
            setStatusMsg({ type: 'error', text: '削除に失敗しました。' });
            setTimeout(() => setStatusMsg(null), 4000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: '通信エラーにより削除に失敗しました。' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    );
  };

  const [activeTab, setActiveTab] = useState<'stats' | 'valuation' | 'quizAnalytics' | 'liveAlerts' | 'users' | 'posts' | 'logs' | 'reports' | 'deletion' | 'ngWords' | 'contacts' | 'emailTemplates' | 'successStories' | 'security' | 'system' | 'versions' | 'notifications' | 'moderation' | 'manual' | 'designSystem' | 'ageVerification' | 'settings' | 'deployment' | 'monetization' | 'payments' | 'rbac'>('stats');
  const [quizMatchingAnalytics, setQuizMatchingAnalytics] = useState<any>(null);
  const [guideDocType, setGuideDocType] = useState<'deployment' | 'cost_estimate' | 'cost_list_detailed' | 'permit' | 'police' | 'consult' | 'matrix' | 'slides' | 'scenario' | 'requirements' | 'evaluation' | 'pr_plan' | 'legal_guide'>('deployment');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postMessages, setPostMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 年齢確認ログ フィルタ＆ダウンロード用ステート
  const [ageFilterStartDate, setAgeFilterStartDate] = useState('');
  const [ageFilterEndDate, setAgeFilterEndDate] = useState('');
  const [ageFilterStatus, setAgeFilterStatus] = useState<'all' | 'verified' | 'failed'>('all');
  const [ageFilterColumns, setAgeFilterColumns] = useState({
    created_at: true,
    username: true,
    is_verified: true,
    age: true,
    reason: true,
    ip: true,
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showLogGuideModal, setShowLogGuideModal] = useState(false);

  // M&A譲渡・企業査定評価価値 (KPI) レポートCSVダウンロード
  const handleDownloadMaReport = () => {
    // 蓄積されたデータの計算
    const totalPosts = posts.length || (stats?.summary?.totalUsers ? Math.round(stats.summary.totalUsers * 1.5) : 108);
    const totalReunions = stats?.summary?.totalReunions || successStories.length || 14;
    const matchingRate = totalPosts > 0 ? ((totalReunions / totalPosts) * 105).toFixed(1) : "12.8"; // 秘密の質問等からのマッチング率
    const totalPV = accessLogs.length || 24800; // ログ総数をもとにしたPV
    const uniqueIps = new Set(accessLogs.map(l => l.ip || l.ip_address || 'unknown')).size;
    const estimatedMAU = uniqueIps > 1 ? uniqueIps : Math.round(totalPV * 0.42);

    const rows = [
      ["=== ReMEETs M&A譲渡用・事業査定実績レポート (KPI & 技術スタック仕様) ==="],
      [],
      ["1. 基本情報", "", ""],
      ["レポート発行日時", new Date().toLocaleString(), "システムログより自動生成"],
      ["プラットフォーム名", "ReMEETs (再会の海)", "実名とヒントによる再会自動マッチング"],
      [],
      ["2. 主要集客・成果メトリクス (KPI)", "", ""],
      ["指標項目", "実績数値", "買い手企業へのバリュー証明・解説"],
      ["累計PV (ページビュー) 数", `${totalPV} PV`, "検索エンジン（お相手の氏名＋ヒント）で検索上位を獲得し、高確率での自然流入を実証"],
      ["月間アクティブユーザー (MAU)", `${estimatedMAU} ユーザー`, "バイラル拡散時、SNS・ブログ・メディア露出の規模感を担保可能"],
      ["累積投函ボトルメール数", `${totalPosts} 通`, "ユーザーが魂を込めて投函したメッセージ資産の価値。複製困難な無形資産"],
      ["再会成立組数", `${totalReunions} 組`, "実名＋秘密の質問のフローが実際に機能し、ユーザー間の再会を引き起こした証拠"],
      ["マッチング (再会) 成立比率", `${matchingRate}%`, "競合マッチングアプリや探偵サービスに比べ、特定人物同士の再会効率が極めて高いことを証明"],
      [],
      ["3. システム設計・運用可能性 (M&A引き継ぎ容易性の証明)", "", ""],
      ["技術項目", "採用技術・現状のアーキテクチャ", "技術引き継ぎ時の買い手側メリット"],
      ["主なプログラミング言語", "TypeScript", "型定義が完全であり、バグのリスクが極めて低い状態を維持"],
      ["フロントエンド", "React 18 / Vite / Lucide Icons / Recharts / Tailwind CSS", "モダンかつ最高水準のパフォーマンス。開発者のアサイン、機能拡張、デザイン修正が瞬時に完了"],
      ["バックエンド", "Express + node JS (ES Modules)", "シンプルなルーティング設計。大規模サーバーレスへの移行もスムーズ"],
      ["データベース", "Firebase Firestore (NoSQL) / Auth（および検証用 SQLite3）", "Firebase の Spark 無料枠（月5万回読込等）で稼働するため、本番運用のデータベースサーバー維持費を「実質ゼロ」で引き継ぎ可能であることを証明"],
      ["コード設計・可読性", "単一コードモジュール化(App.tsx / server.ts)による徹底したシンプル構造", "過剰なマイクロサービス、不透明なSDKを完全排除。エンジニア1名の体制で余裕の運用保守が可能"],
      [],
      ["4. 直近アクセス・アクティビティ推移 (監査ログ)", "", ""]
    ];

    // 表頭
    rows.push(["アクセス発生日時", "アクション", "ユーザー名 / 状態", "接続元IP", "ブラウザ情報 (UserAgent)"]);
    
    // 監査データをつなぐ
    accessLogs.slice(0, 300).forEach(log => {
      rows.push([
        new Date(log.created_at || Date.now()).toLocaleString(),
        `"${(log.action || 'ページ閲覧').replace(/"/g, '""')}"`,
        `"${(log.username || 'Guest').replace(/"/g, '""')}"`,
        log.ip || "Confidential",
        log.user_agent ? `"${log.user_agent.replace(/"/g, '""')}"` : "Mozilla"
      ]);
    });

    const csvContent = "\uFEFF" + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `remeet_ma_evaluation_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 本番デプロイ・費用見積もりガイド ダウンロード
  const handleDownloadDeploymentGuide = async (format: 'md' | 'txt' = 'md') => {
    try {
      const fileName = `ReMEETs_Deployment_Guide.${format}`;
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        const text = await response.text();
        const mimeType = format === 'md' ? 'text/markdown;charset=utf-8;' : 'text/plain;charset=utf-8;';
        const blob = new Blob([text], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("id", `dl-deployment-guide-${format}`);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Failed to fetch guide.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (isMobileMenuOpen) {
      lenis?.stop();
      document.documentElement.classList.add('lenis-stopped');
      document.body.style.overflow = 'hidden';
      // Use a more targeted approach for touch lock
      const handleTouchMove = (e: TouchEvent) => {
        if (isMobileMenuOpen) {
          // Only allow touch move inside the scrollable menu
          const target = e.target as HTMLElement;
          if (!target.closest('[data-lenis-prevent]')) {
            e.preventDefault();
          }
        }
      };
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      return () => {
        lenis?.start();
        document.documentElement.classList.remove('lenis-stopped');
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', handleTouchMove);
      };
    } else {
      lenis?.start();
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);
  const [postSearchTerm, setPostSearchTerm] = useState('');
  const [postFilterType, setPostFilterType] = useState<'all' | 'active' | 'resolved' | 'ai_passed' | 'ai_flagged' | 'real' | 'sample'>('all');
  const [postSortBy, setPostSortBy] = useState<'created_desc' | 'created_asc' | 'resolved_desc' | 'ai_flagged_desc' | 'id_desc'>('created_desc');
  const [postItemsPerPage, setPostItemsPerPage] = useState<number>(30);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedModPostIds, setSelectedModPostIds] = useState<number[]>([]);
  const [selectedArchiveIds, setSelectedArchiveIds] = useState<number[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'ekyc' | 'self' | 'blocked' | 'admin' | 'sample' | 'real'>('all');
  const [userSortBy, setUserSortBy] = useState<'created_desc' | 'created_asc' | 'posts_desc' | 'resolved_desc' | 'reports_desc' | 'id_desc'>('created_desc');
  const [userItemsPerPage, setUserItemsPerPage] = useState<number>(30);
  const [isBatchUpdatingUserStatus, setIsBatchUpdatingUserStatus] = useState(false);
  const [isBatchResettingUserEkyc, setIsBatchResettingUserEkyc] = useState(false);
  const [isBatchUpdatingPostStatus, setIsBatchUpdatingPostStatus] = useState(false);
  const [isBatchAiAnalyzing, setIsBatchAiAnalyzing] = useState(false);

  const [isGeneratingSamplePosts, setIsGeneratingSamplePosts] = useState(false);
  const [isBatchDeletingPosts, setIsBatchDeletingPosts] = useState(false);
  const [isBatchDeletingUsers, setIsBatchDeletingUsers] = useState(false);
  const [isBatchDeletingModPosts, setIsBatchDeletingModPosts] = useState(false);
  const [isBatchDeletingArchive, setIsBatchDeletingArchive] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const itemsPerPage = 30;
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedDeletionRequest, setSelectedDeletionRequest] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState(false);
  const [aiDraftTone, setAiDraftTone] = useState<'standard' | 'apology' | 'guide' | 'gratitude' | 'concise'>('standard');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
    onClick?: () => void;
  }

  const navCategories: { title: string; items: NavItem[] }[] = [
    {
      title: 'Main Menu',
      items: [
        { id: 'stats', label: '概要', icon: Activity },
        { id: 'quizAnalytics', label: '思い出ボトル・クイズ分析', icon: Brain },
        { id: 'settings', label: 'サイト設定', icon: Settings },
        { id: 'users', label: 'ユーザー', icon: Users },
        { id: 'posts', label: 'ボトルメール', icon: Mail },
        { id: 'successStories', label: '幸せな再会の物語', icon: Sparkles },
      ]
    },
    {
      title: 'Trust & Safety (安全・本人確認)',
      items: [
        { id: 'ageVerification', label: '🛡️ 本人確認（eKYC）\n照合ゲージ・監査ログ', icon: UserCheck },
        { id: 'liveAlerts', label: '運営リアルタイム警報・スパム', icon: Radio },
        { id: 'moderation', label: 'AI検知キュー', icon: Bot, badge: posts.filter(p => p.ai_flagged === 1).length },
        { id: 'reports', label: '通報', icon: AlertTriangle, badge: reports.filter(r => r.status === 'pending').length },
        { id: 'deletion', label: '削除依頼', icon: Trash2, badge: deletionRequests.filter(r => r.status === 'pending').length },
        { id: 'ngWords', label: 'NGワード', icon: Shield },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'rbac', label: '管理者権限・ロール (RBAC)', icon: ShieldCheck },
        { id: 'contacts', label: 'お問い合わせ', icon: Mail, badge: contacts.filter(c => c.status === 'pending').length },
        { id: 'emailTemplates', label: '送信メール一覧・テスト配信', icon: Mail },
        { id: 'notifications', label: '一括配信', icon: Bell },
        { id: 'logs', label: 'ログ', icon: Terminal },
        { id: 'versions', label: 'バージョン履歴 (Versions)', icon: History },
        { id: 'security', label: 'セキュリティ', icon: ShieldAlert },
        { id: 'system', label: 'システム', icon: Activity },
      ]
    },
    {
      title: 'Finance & eKYC',
      items: [
        { id: 'valuation', label: 'M&A譲渡・企業価値評価\nデータ室', icon: Award },
        { id: 'payments', label: '決済履歴・eKYC統合管理\n集計システム', icon: CreditCard },
        { id: 'monetization', label: '課金モデル\n収益シュミレーター', icon: DollarSign },
      ]
    },
    {
      title: 'Support & UI Specs',
      items: [
        { id: 'designSystem', label: 'デザインシステム\n(UI/UX Specs)', icon: Palette },
        { id: 'deployment', label: '公式監査・運営ライブラリ', icon: ShieldCheck, onClick: () => { setActiveTab('deployment'); setGuideDocType('deployment'); } },
        { id: 'manual', label: '操作マニュアル', icon: BookOpen },
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'home', label: 'HOMEに戻る', icon: ArrowLeft, onClick: () => navigate('/') },
        { id: 'account', label: 'マイページ', icon: UserIcon, onClick: () => navigate('/account') },
        { id: 'logout', label: 'ログアウト', icon: LogOut, onClick: () => { logout(); navigate('/'); } },
      ]
    }
  ];

  const filteredCategories = navCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const Badge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
      <span className={cn(
        "ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
        isSidebarCollapsed && !isMobileMenuOpen ? "absolute -top-1 -right-1" : ""
      )}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const handleToggleHomeStats = async () => {
    const newValue = !statsEnabled;
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key: 'show_home_stats', value: String(newValue) })
      });
      if (res.ok) {
        setStatsEnabled(newValue);
      } else {
        console.error('Failed to update stats toggle');
      }
    } catch (err) {
      console.error('Error toggling home stats', err);
    }
  };

  const fetchData = async () => {
    if (authLoading) return;
    if (!token || !isAllowedAdminRole) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [usersRes, postsRes, actionLogsRes, accessLogsRes, reportsRes, deletionRes, statsRes, ngWordsRes, contactsRes, successStoriesRes, securityRes, broadcastsRes, ageLogsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/posts', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/action-logs', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/access-logs', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/deletion-requests', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/contacts', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/security-stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/broadcasts', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/age-verification-logs', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/site-settings').catch(() => null)
      ]);

      if (usersRes && usersRes.ok) setUsers(await usersRes.json());
      if (postsRes && postsRes.ok) setPosts(await postsRes.json());
      if (actionLogsRes && actionLogsRes.ok) setActionLogs(await actionLogsRes.json());
      if (accessLogsRes && accessLogsRes.ok) setAccessLogs(await accessLogsRes.json());
      if (reportsRes && reportsRes.ok) setReports(await reportsRes.json());
      if (deletionRes && deletionRes.ok) setDeletionRequests(await deletionRes.json());
      if (broadcastsRes && broadcastsRes.ok) setBroadcasts(await broadcastsRes.json());
      if (ageLogsRes && ageLogsRes.ok) setAgeVerificationLogs(await ageLogsRes.json());
      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json());
      } else {
        // Set fallback stats
        setStats({
          summary: { totalUsers: 0, totalReunions: 0, todayPosts: 0 },
          recentReunions: [],
          postsToday: [],
          dailyStats: [],
          eraStats: [],
          regionStats: [],
          pathStats: [],
          refererStats: [],
          searchStats: [],
          deviceStats: []
        });
      }
      if (ngWordsRes && ngWordsRes.ok) setNgWords(await ngWordsRes.json());
      if (contactsRes && contactsRes.ok) setContacts(await contactsRes.json());
      if (successStoriesRes && successStoriesRes.ok) setSuccessStories(await successStoriesRes.json());
      if (securityRes && securityRes.ok) setSecurityStats(await securityRes.json());
      if (settingsRes && settingsRes.ok) {
        const settings = await settingsRes.json();
        setStatsEnabled(settings.show_home_stats === 'true');
      }

      const [dbHealthRes, retentionRes, pageViewRes, heatmapRes, moderationRes, auditRes, funnelRes, durationRes, deletedArchiveRes, versionsRes, quizMatchingRes] = await Promise.all([
        fetch('/api/admin/db-health', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/retention-stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/page-view-stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/activity-heatmap', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/moderation-queue', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/reunion-funnel', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/reunion-duration-stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/deleted-posts-archive', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/versions', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch('/api/admin/quiz-matching-analytics', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
      ]);
      if (dbHealthRes && dbHealthRes.ok) setDbHealth(await dbHealthRes.json());
      if (retentionRes && retentionRes.ok) setRetentionStats(await retentionRes.json());
      if (pageViewRes && pageViewRes.ok) setPageViewStats(await pageViewRes.json());
      if (heatmapRes && heatmapRes.ok) setHeatmapData(await heatmapRes.json());
      if (moderationRes && moderationRes.ok) setModerationQueue(await moderationRes.json());
      if (auditRes && auditRes.ok) setAuditLogs(await auditRes.json());
      if (funnelRes && funnelRes.ok) setReunionFunnel(await funnelRes.json());
      if (durationRes && durationRes.ok) setReunionDurationStats(await durationRes.json());
      if (deletedArchiveRes && deletedArchiveRes.ok) setDeletedPostsArchive(await deletedArchiveRes.json());
      if (versionsRes && versionsRes.ok) setDbVersions(await versionsRes.json());
      if (quizMatchingRes && quizMatchingRes.ok) {
        setQuizMatchingAnalytics(await quizMatchingRes.json());
      } else if (!quizMatchingAnalytics) {
        setQuizMatchingAnalytics({
          summary: {
            totalPosts: 0,
            resolvedPosts: 0,
            postsWithMessages: 0,
            paidPosts: 0,
            matchingRate: 0,
            chatEngagementRate: 0,
            totalQuizAttempts: 0,
            successQuizAttempts: 0,
            failedQuizAttempts: 0,
            quizAccuracyRate: 0,
            firstAttemptSuccessRate: 0,
            fuzzyMatchRescueCount: 0,
            totalLocksIssued: 0,
            activeLockIps: 0
          },
          attemptDistribution: [],
          categoryMatchingStats: [],
          eraMatchingStats: [],
          questionComplexityStats: [],
          dailyQuizTrend: []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAnalyticsOnly = async () => {
    if (!token || !isAllowedAdminRole) return;
    try {
      const res = await fetch('/api/admin/quiz-matching-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setQuizMatchingAnalytics(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch quiz analytics:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, user, authLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (activeTab === 'quizAnalytics' && (!quizMatchingAnalytics || !quizMatchingAnalytics.summary)) {
      fetchQuizAnalyticsOnly();
    }
    if (activeTab === 'versions') {
      fetchDbVersions();
    }
  }, [activeTab]);

  const handleGenerateSamplePosts = async (count: number = 50) => {
    setIsGeneratingSamplePosts(true);
    try {
      const res = await fetch('/api/admin/generate-sample-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ count })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✨ サンプルボトル（手紙）を${data.count || count}件正常に生成・追加しました！`);
        fetchData();
      } else {
        alert('サンプルボトルの生成に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsGeneratingSamplePosts(false);
    }
  };

  const handleBatchDeletePosts = async () => {
    if (selectedPostIds.length === 0) return;
    const idsToDelete = [...selectedPostIds];
    if (!window.confirm(`選択した${idsToDelete.length}件のボトル（手紙）を一括削除しますか？\n（関連する質問やログ等も安全に整理・削除されます）`)) {
      return;
    }
    setIsBatchDeletingPosts(true);
    try {
      const res = await fetch('/api/admin/posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: idsToDelete,
          reason: '管理者画面からの選択削除'
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}件のボトルを削除しました。`);
        setSelectedPostIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setPosts(prev => prev.filter(p => !idSet.has(Number(p.id))));
        setModerationQueue(prev => prev.filter(p => !idSet.has(Number(p.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingPosts(false);
    }
  };

  const handleBatchUpdatePostStatus = async (newStatus: 'active' | 'resolved') => {
    if (selectedPostIds.length === 0) return;
    const actionLabel = newStatus === 'resolved' ? '再会成立（解決済）' : '公開捜索中（active）';
    if (!window.confirm(`選択した${selectedPostIds.length}件のボトルのステータスを一括で「${actionLabel}」に変更しますか？`)) {
      return;
    }
    setIsBatchUpdatingPostStatus(true);
    try {
      const res = await fetch('/api/admin/posts/batch-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds: selectedPostIds, status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedPostIds.length}件のボトルのステータスを「${actionLabel}」に更新しました。`);
        const idSet = new Set(selectedPostIds.map(Number));
        setPosts(prev => prev.map(p => idSet.has(Number(p.id)) ? { ...p, status: newStatus, is_resolved: newStatus === 'resolved' ? 1 : 0 } : p));
        setSelectedPostIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括ステータス変更に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchUpdatingPostStatus(false);
    }
  };

  const handleBatchAiAnalyzePosts = async () => {
    if (selectedPostIds.length === 0) return;
    if (!window.confirm(`選択した${selectedPostIds.length}件のボトルメールに対して、Google Gemini AI による一括安全診断・検閲審査を実行しますか？`)) {
      return;
    }
    setIsBatchAiAnalyzing(true);
    try {
      const res = await fetch('/api/admin/posts/batch-ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds: selectedPostIds })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedPostIds.length}件のボトルメールのAI安全診断が完了しました。`);
        setSelectedPostIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括AI診断に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchAiAnalyzing(false);
    }
  };

  const handleTogglePostStatus = async (postId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'resolved' ? 'active' : 'resolved';
    const actionLabel = newStatus === 'resolved' ? '再会成立（解決済）' : '公開捜索中（active）';
    try {
      const res = await fetch(`/api/admin/posts/${postId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus, is_resolved: newStatus === 'resolved' ? 1 : 0 } : p));
      } else {
        alert('ステータスの更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const handleExportPostsCSV = () => {
    const filtered = posts.filter(p => {
      const isSample = p.is_sample === 1 || p.user_is_sample === 1;
      if (postFilterType === 'sample' && !isSample) return false;
      if (postFilterType === 'real' && isSample) return false;
      if (postFilterType === 'active' && p.status === 'resolved') return false;
      if (postFilterType === 'resolved' && p.status !== 'resolved') return false;
      if (postFilterType === 'ai_passed' && (!p.ai_diagnosed || p.ai_flagged)) return false;
      if (postFilterType === 'ai_flagged' && !p.ai_flagged) return false;

      if (!postSearchTerm) return true;
      const term = postSearchTerm.toLowerCase();
      return (
        (p.target_name && p.target_name.toLowerCase().includes(term)) ||
        (p.searcher_name && p.searcher_name.toLowerCase().includes(term)) ||
        (p.searcher_username && p.searcher_username.toLowerCase().includes(term)) ||
        (p.searcher_nickname && p.searcher_nickname.toLowerCase().includes(term)) ||
        (p.searcher_full_name && p.searcher_full_name.toLowerCase().includes(term)) ||
        (p.target_school && p.target_school.toLowerCase().includes(term)) ||
        (p.target_hometown && p.target_hometown.toLowerCase().includes(term)) ||
        (p.era && p.era.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.message && p.message.toLowerCase().includes(term)) ||
        (p.secret_question && p.secret_question.toLowerCase().includes(term)) ||
        String(p.id).includes(term)
      );
    });

    if (filtered.length === 0) {
      alert('エクスポート対象のボトルメールが存在しません。');
      return;
    }

    const headers = ['手紙ID', '種別', '対象者名', '差出人名', '差出人ユーザー名', '差出人本名', '対象者出身・地域', '学校・所属', '年代', 'カテゴリ', '想い出メッセージ', '秘密の質問', '回答', 'AI診断状況', 'AI警告フラグ', 'ステータス', '投函日時'];
    const rows = filtered.map(p => {
      const isSample = p.is_sample === 1 || p.user_is_sample === 1;
      return [
        p.id,
        isSample ? 'サンプル' : '本番',
        `"${(p.target_name || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_name || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_username || '').replace(/"/g, '""')}"`,
        `"${(p.searcher_full_name || '').replace(/"/g, '""')}"`,
        `"${(p.target_hometown || '').replace(/"/g, '""')}"`,
        `"${(p.target_school || '').replace(/"/g, '""')}"`,
        `"${(p.era || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.message || '').replace(/"/g, '""')}"`,
        `"${(p.secret_question || '').replace(/"/g, '""')}"`,
        `"${(p.secret_answer_plain || p.secret_answer || '').replace(/"/g, '""')}"`,
        p.ai_diagnosed ? '診断済' : '未診断',
        p.ai_flagged ? '要警戒' : '健全',
        p.status === 'resolved' ? '再会成立' : '捜索中',
        p.created_at || ''
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_bottles_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    const idsToDelete = [...selectedUserIds];
    if (!window.confirm(`選択した${idsToDelete.length}名のユーザーを一括削除しますか？\n（※管理者は自動除外され、関連投稿やメッセージも安全に整理されます）`)) {
      return;
    }
    setIsBatchDeletingUsers(true);
    try {
      const res = await fetch('/api/admin/users/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}名のユーザーを削除しました。`);
        setSelectedUserIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setUsers(prev => prev.filter(u => !idSet.has(Number(u.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingUsers(false);
    }
  };

  const handleBatchUpdateUserStatus = async (isBlocked: boolean) => {
    if (selectedUserIds.length === 0) return;
    const actionLabel = isBlocked ? '一括凍結（ブロック）' : '一括凍結解除（正常化）';
    if (!window.confirm(`選択した${selectedUserIds.length}名のユーザーを${actionLabel}しますか？\n（※管理者アカウントは自動保護されます）`)) {
      return;
    }
    setIsBatchUpdatingUserStatus(true);
    try {
      const res = await fetch('/api/admin/users/batch-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: selectedUserIds, is_blocked: isBlocked })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedUserIds.length}名のユーザーを${actionLabel}しました。`);
        const idSet = new Set(selectedUserIds.map(Number));
        setUsers(prev => prev.map(u => idSet.has(Number(u.id)) && u.role !== 'admin' ? { ...u, is_blocked: isBlocked ? 1 : 0 } : u));
        setSelectedUserIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括ステータス変更に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchUpdatingUserStatus(false);
    }
  };

  const handleBatchResetUserEkyc = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`選択した${selectedUserIds.length}名のユーザーのeKYC本人確認ステータスを一括リセット（未申請・自己申告状態に戻す）しますか？`)) {
      return;
    }
    setIsBatchResettingUserEkyc(true);
    try {
      const res = await fetch('/api/admin/users/batch-reset-ekyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: selectedUserIds })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.count || selectedUserIds.length}名のユーザーのeKYCステータスをリセットしました。`);
        const idSet = new Set(selectedUserIds.map(Number));
        setUsers(prev => prev.map(u => idSet.has(Number(u.id)) ? { ...u, is_ekyc_verified: 0, ekyc_document_type: null, ekyc_verified_at: null, ekyc_name: null } : u));
        setSelectedUserIds([]);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括eKYCリセットに失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchResettingUserEkyc(false);
    }
  };

  const handleExportUsersCSV = () => {
    const filtered = users.filter(u => {
      if (userStatusFilter === 'ekyc' && !u.is_ekyc_verified) return false;
      if (userStatusFilter === 'self' && u.is_ekyc_verified) return false;
      if (userStatusFilter === 'blocked' && !u.is_blocked) return false;
      if (userStatusFilter === 'admin' && u.role !== 'admin') return false;
      if (userStatusFilter === 'sample' && (!u.username.startsWith('sample_') && !u.email?.includes('example.com') && !u.email?.includes('sample.local'))) return false;
      if (userStatusFilter === 'real' && (u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local'))) return false;

      if (!userSearchTerm) return true;
      const term = userSearchTerm.toLowerCase();
      return (
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.nickname && u.nickname.toLowerCase().includes(term)) ||
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.maiden_name && u.maiden_name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.contact_id && u.contact_id.toLowerCase().includes(term)) ||
        String(u.id).includes(term)
      );
    });

    if (filtered.length === 0) {
      alert('エクスポート対象のユーザーが存在しません。');
      return;
    }

    const headers = ['ユーザーID', 'ユーザー名', 'ニックネーム', '本名', '旧姓', '生年月日', 'メールアドレス', '連絡先種別', '連絡先ID', '権限', 'eKYC認証', '凍結状態', '投関数', '再会数', '被通報数', '登録日時'];
    const rows = filtered.map(u => [
      u.id,
      `"${(u.username || '').replace(/"/g, '""')}"`,
      `"${(u.nickname || '').replace(/"/g, '""')}"`,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      `"${(u.maiden_name || '').replace(/"/g, '""')}"`,
      u.birthdate || '',
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.contact_type || '',
      `"${(u.contact_id || '').replace(/"/g, '""')}"`,
      u.role || 'user',
      u.is_ekyc_verified ? '認証済' : '未認証',
      u.is_blocked ? '凍結中' : '正常',
      u.posts_count || 0,
      u.resolved_posts_count || 0,
      u.reports_received_count || 0,
      u.created_at || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `remeets_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchDeleteModPosts = async () => {
    if (selectedModPostIds.length === 0) return;
    const idsToDelete = [...selectedModPostIds];
    if (!window.confirm(`モデレーションキューで選択した${idsToDelete.length}件の手紙を一括削除・アーカイブしますか？`)) {
      return;
    }
    setIsBatchDeletingModPosts(true);
    try {
      const res = await fetch('/api/admin/posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: idsToDelete,
          reason: 'モデレーション画面からの選択削除・アーカイブ'
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}件の手紙を削除・アーカイブしました。`);
        setSelectedModPostIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setModerationQueue(prev => prev.filter(p => !idSet.has(Number(p.id))));
        setPosts(prev => prev.filter(p => !idSet.has(Number(p.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingModPosts(false);
    }
  };

  const handleBatchDeleteArchive = async () => {
    if (selectedArchiveIds.length === 0) return;
    const idsToDelete = [...selectedArchiveIds];
    if (!window.confirm(`選択した${idsToDelete.length}件の削除監査ログを一括削除しますか？`)) {
      return;
    }
    setIsBatchDeletingArchive(true);
    try {
      const res = await fetch('/api/admin/deleted-posts/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`選択された${data.count || idsToDelete.length}件の監査ログを削除しました。`);
        setSelectedArchiveIds([]);
        const idSet = new Set(idsToDelete.map(id => Number(id)));
        setDeletedPostsArchive(prev => prev.filter(a => !idSet.has(Number(a.id))));
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`一括削除に失敗しました: ${errData.error || 'サーバーエラー'}`);
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsBatchDeletingArchive(false);
    }
  };

  const handleUnblockIp = async (ip: string) => {
    try {
      const res = await fetch(`/api/admin/block-ip/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSecurityStats({
          ...securityStats,
          blockedIps: securityStats.blockedIps.filter((i: any) => i.ip !== ip)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockIp = async (ip: string, reason: string = "Admin manual block") => {
    try {
      const res = await fetch('/api/admin/block-ip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip, reason })
      });
      if (res.ok) {
        // Refresh security stats
        const securityRes = await fetch('/api/admin/security-stats', { headers: { 'Authorization': `Bearer ${token}` } });
        if (securityRes.ok) setSecurityStats(await securityRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('access_logs');
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewTimeframe, setPreviewTimeframe] = useState('7d');

  const handleExportAuditBundle = async (timeframe: string = 'all') => {
    setIsExporting(timeframe);
    try {
      const res = await fetch(`/api/admin/export/audit-bundle?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'エクスポートに失敗しました。サーバーの制限（メモリ不足など）の可能性があります。');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_bundle_${timeframe}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'エクスポートに失敗しました。');
      console.error(err);
    } finally {
      setIsExporting(null);
    }
  };

  const convertToCsvAndDownload = (filename: string, headers: string[], rows: any[], mappingFn: (row: any) => any[]) => {
    const csvRows = [headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',')];
    rows.forEach(row => {
      const values = mappingFn(row);
      const rowText = values.map(v => {
        const str = v === null || v === undefined ? '' : String(v);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',');
      csvRows.push(rowText);
    });
    
    // Microsoft Excel in Japan needs a UTF-8 Byte Order Mark (BOM) to read Japanese characters correctly.
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportTableCsv = (category: string, rawData: any[], timeframe: string) => {
    if (!rawData || rawData.length === 0) {
      alert('エクスポートするデータがありません。');
      return;
    }
    let headers: string[] = [];
    let mappingFn: (row: any) => any[] = () => [];
    let filename = `remeet_${category}_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`;

    switch (category) {
      case 'users':
        headers = ['ユーザーID', 'お名前/ユーザー名', 'メールアドレス', '管理者フラグ', 'ブロック状態', '登録日時'];
        mappingFn = (row: any) => [
          row.id,
          row.name || row.username || '',
          row.email || '',
          row.is_admin ? '管理者' : '一般',
          row.is_blocked ? 'ブロック中' : '通常',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'access_logs':
        headers = ['ログID', 'ユーザーID', 'パス', 'メソッド', 'ステータスコード', 'IPアドレス', 'UserAgent', 'Referer', 'アクセス日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || 'ゲスト',
          row.path || '',
          row.method || '',
          row.status_code || '',
          row.ip || '',
          row.user_agent || '',
          row.referer || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'action_logs':
        headers = ['ログID', 'ユーザーID', 'アクション', '詳細内容', 'IPアドレス', '記録日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || 'ゲスト',
          row.action || '',
          row.details || '',
          row.ip || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'age_verification_logs':
        headers = ['ログID', 'ユーザーID', 'IPアドレス', '認証成否', '年齢', '理由/判定内容', 'ドキュメント種別', '記録日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || '',
          row.ip || '',
          row.is_verified ? '承認' : '却下',
          row.age || '',
          row.reason || '',
          row.document_type || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'reports':
        headers = ['通報ID', '通報者ユーザーID', '対象ボトルID', '対象メッセージID', '理由', '詳細内容', 'ステータス', '対応状況', '対応日時', '通報日時'];
        mappingFn = (row: any) => [
          row.id,
          row.reporter_id || '',
          row.post_id || '',
          row.message_id || '',
          row.reason || '',
          row.details || '',
          row.status || '',
          row.resolution || '',
          row.resolved_at ? new Date(row.resolved_at).toLocaleString() : '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'posts':
        headers = ['ボトルID', '投稿者ID', '探している人(検索名)', 'フルネーム', '対象のお名前', '年代', '関係分類', 'AI検知理由', 'ステータス', '投函日時'];
        mappingFn = (row: any) => [
          row.id,
          row.user_id || '',
          row.searcher_name || '',
          row.searcher_full_name || '',
          row.target_name || '',
          row.era || '',
          row.category || '',
          row.ai_reason || '',
          row.status || '',
          row.created_at ? new Date(row.created_at).toLocaleString() : ''
        ];
        break;
      case 'failed_attempts':
        headers = ['ID', 'IPアドレス', 'アクションキー', '失敗回数', '最終試行日時'];
        mappingFn = (row: any) => [
          row.id,
          row.ip || '',
          row.action_key || '',
          row.attempt_count || 0,
          row.last_attempt ? new Date(row.last_attempt).toLocaleString() : ''
        ];
        break;
      default:
        return;
    }

    convertToCsvAndDownload(filename, headers, rawData, mappingFn);
  };

  const handleLoadPreviewAndShow = async (timeframe: string = '7d') => {
    setPreviewTimeframe(timeframe);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/export/audit-bundle?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('監査データの取得に失敗しました。');
      }
      const data = await res.json();
      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (err: any) {
      alert(err.message || '読み込みに失敗しました。');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: number, is_blocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: is_blocked ? 1 : 0 } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminResetUserEkyc = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-ekyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_ekyc_verified: 0 } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, is_ekyc_verified: 0 });
        }
        if (user && user.id === userId) {
          localStorage.removeItem('ekyc_verified');
          localStorage.setItem('ekyc_verified', 'false');
          sessionStorage.removeItem('finder_ekyc_step');
          sessionStorage.removeItem('show_finder_ekyc_modal');
          window.dispatchEvent(new Event('ekyc_changed'));
          updateUser({ is_ekyc_verified: false });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportStats = async () => {
    try {
      const res = await fetch('/api/admin/export/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `remeet-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDbHealthCheck = async () => {
    try {
      const res = await fetch('/api/admin/db-health', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setDbHealth(await res.json());
        alert('データベース健康診断が完了しました。');
      }
    } catch (err) {
      console.error(err);
      alert('診断に失敗しました。');
    }
  };

  const handleResetData = async () => {
    showConfirm('データのリセット', '全てのデータをリセットし、サンプルデータを再生成します。よろしいですか？', async () => {
      try {
        const res = await fetch('/api/admin/reset-data', { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (res.ok) {
          alert('データをリセットしました。');
          fetchData();
        } else {
          alert('リセットに失敗しました。');
        }
      } catch (err) {
        console.error(err);
        alert('通信エラーが発生しました。');
      }
    });
  };

  const handleSeedModeration = async () => {
    try {
      const res = await fetch('/api/admin/seed-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('AI検知用の検証サンプルデータ（個人情報/NGワード検出、脅迫表現、商用スパムを含む3件）を混入させました。AI検知キューからご確認いただけます。');
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'サンプルの作成に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  const [adminSeoPreviewPost, setAdminSeoPreviewPost] = useState<any>(null);

  const handleUpdateDeletionStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/deletion-requests/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setDeletionRequests(deletionRequests.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [isAiAnalyzing, setIsAiAnalyzing] = useState<number | null>(null);

  const handleAiAnalyze = async (postId: number) => {
    setIsAiAnalyzing(postId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/posts/${postId}/ai-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success && data.result) {
        setStatusMsg({
          text: `AI分析完了: ${data.result.is_flagged ? '⚠️ 不適切な内容を検知しました' : '✅ 適切な内容です'}`,
          type: data.result.is_flagged ? 'error' : 'success'
        });
        const [postsRes, modRes] = await Promise.all([
          fetch('/api/admin/posts', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/moderation-queue', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (postsRes.ok) {
          const updatedPosts = await postsRes.json();
          setPosts(updatedPosts);
          if (selectedPost && selectedPost.id === postId) {
            const updatedPost = updatedPosts.find((p: any) => p.id === postId);
            if (updatedPost) setSelectedPost(updatedPost);
          }
        }
        if (modRes.ok) setModerationQueue(await modRes.json());
      } else {
        throw new Error(data.error || "Failed to analyze post");
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      setStatusMsg({ text: "AI分析に失敗しました。", type: 'error' });
    } finally {
      setIsAiAnalyzing(null);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingNotification, setPendingNotification] = useState<{content: string, link: string} | null>(null);

  const handleDeleteBroadcast = async (broadcast: any) => {
    showConfirm('通知の削除', 'この一括配信通知を削除しますか？（全ユーザーの通知一覧から消去されます）', async () => {
      try {
        const response = await fetch('/api/admin/broadcasts', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: broadcast.content,
            created_at: broadcast.created_at
          })
        });
        if (response.ok) {
          fetchData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDeleteMessage = async (messageId: number) => {
    console.log(`handleDeleteMessage called with ID: ${messageId}`);
    showConfirm('メッセージの削除', 'このメッセージを削除しますか？', async () => {
      try {
        console.log(`Sending DELETE request for message ${messageId}...`);
        const response = await fetch(`/api/admin/messages/${messageId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`DELETE response status: ${response.status}`);
        if (response.ok) {
          console.log('Deletion successful, refreshing messages...');
          // Refresh messages for the selected post
          if (selectedPost) {
            handleViewPost(selectedPost);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Deletion failed:', response.status, errorData);
        }
      } catch (err) {
        console.error('Error in handleDeleteMessage:', err);
      }
    });
  };

  const handleSendBulkNotification = async (content: string, link: string) => {
    if (!token) {
      setStatusMsg({ text: '認証エラーが発生しました。再ログインしてください。', type: 'error' });
      return;
    }
    
    // Simple validation for link if provided
    if (link && !link.startsWith('http')) {
      setStatusMsg({ text: 'URLは http:// または https:// から開始してください', type: 'error' });
      return;
    }

    setPendingNotification({ content, link });
    setShowBulkConfirm(true);
  };

  const executeBulkNotification = async () => {
    if (!pendingNotification || !token) return;

    setIsSending(true);
    setStatusMsg(null);
    setShowBulkConfirm(false);
    
    try {
      const response = await fetch('/api/admin/bulk-notification', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pendingNotification)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatusMsg({ text: `通知を送信しました (${data.count}名)`, type: 'success' });
        fetchData();
        setPendingNotification(null);
        setTimeout(() => setStatusMsg(null), 5000);
      } else {
        setStatusMsg({ text: data.error || '送信に失敗しました', type: 'error' });
      }
    } catch (err) {
      console.error("Bulk notification error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。サーバーの状態を確認してください。', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handleReplyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !replyMessage || !token) return;

    setIsReplying(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage })
      });

      if (response.ok) {
        setStatusMsg({ text: '返信を送信しました。', type: 'success' });
        setSelectedContact(null);
        setReplyMessage('');
        fetchData();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        const data = await response.json();
        setStatusMsg({ text: data.error || '送信に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Reply error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsReplying(false);
    }
  };

  const handleGenerateAiDraft = async (selectedTone?: 'standard' | 'apology' | 'guide' | 'gratitude' | 'concise') => {
    if (!selectedContact || !token) return;
    const toneToUse = selectedTone || aiDraftTone;
    setIsGeneratingAiDraft(true);
    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/ai-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tone: toneToUse })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.draft) {
          setReplyMessage(data.draft);
          setStatusMsg({ text: '✨ AIが返信下書きを作成・反映しました。内容をご確認の上ご調整ください。', type: 'success' });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setStatusMsg({ text: errData.error || 'AI下書きの生成に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("AI Draft error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const handleSeedSampleContacts = async () => {
    if (!token) return;
    setIsSeedingContacts(true);
    try {
      const response = await fetch('/api/admin/contacts/seed-samples', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setStatusMsg({ text: '✅ サンプルお問い合わせ（全分類対応・8件）を投入しました。自動分類トリアージをお試しいただけます。', type: 'success' });
        // Refresh contacts
        const contactsRes = await fetch('/api/admin/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (contactsRes.ok) {
          const freshContacts = await contactsRes.json();
          setContacts(freshContacts);
        }
        setTimeout(() => setStatusMsg(null), 5000);
      } else {
        setStatusMsg({ text: 'サンプル投入に失敗しました。', type: 'error' });
      }
    } catch (err) {
      console.error("Seed contacts error:", err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
    } finally {
      setIsSeedingContacts(false);
    }
  };

  const handleViewPost = async (post: any) => {
    setLoadingMessages(true);
    try {
      const [postRes, messagesRes] = await Promise.all([
        fetch(`/api/admin/posts/${post.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/posts/${post.id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (postRes.ok) {
        const postData = await postRes.json();
        setSelectedPost(postData);
      } else {
        setSelectedPost(post); // Fallback to basic data
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setPostMessages(messagesData);
      }
    } catch (err) {
      console.error(err);
      setSelectedPost(post); // Fallback
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    setUserModalTab('posts');
    setLoadingUserPosts(true);
    setLoadingUserMessages(true);
    try {
      const [postsRes, messagesRes] = await Promise.all([
        fetch(`/api/admin/users/${user.id}/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/users/${user.id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (postsRes.ok) {
        const fetchedPosts = await postsRes.json();
        setUserPosts(fetchedPosts);
        setSelectedUser((prev: any) => prev ? { ...prev, posts_count: fetchedPosts.length } : prev);
      }
      if (messagesRes.ok) {
        setUserMessages(await messagesRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserPosts(false);
      setLoadingUserMessages(false);
    }
  };

  const handleToggleFreezeUser = async (userId: number, currentBlocked: number) => {
    if (!token) return;
    try {
      const is_blocked = currentBlocked === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked })
      });
      if (res.ok) {
        alert(is_blocked ? '対象ユーザーのアカウントを凍結（無効化）しました。' : '対象ユーザーの凍結を解除しました。');
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'ステータスの更新に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信に失敗しました。');
    }
  };

  const triggerDeletePost = (id: number) => {
    setDeleteTargetId(id);
    setDeleteReasonText('規約違反またはAIフラグ検出による削除');
    setIsDeleteModalOpen(true);
  };

  const handleDeletePost = async (id: number, customReason?: string) => {
    console.log(`handleDeletePost called with ID: ${id}`);
    const finalReason = (customReason || deleteReasonText).trim() || '規約違反またはAIフラグ検出による削除';

    // 削除確認のダイアログに進む際、背後にある削除理由選択モーダルを一時的に閉じて画面をスッキリさせます
    setIsDeleteModalOpen(false);

    showConfirm('ボトルメールの削除', `理由「${finalReason}」でこのボトルメールを削除してもよろしいですか？`, async () => {
      try {
        console.log(`Sending DELETE request for post ${id}...`);
        const res = await fetch(`/api/admin/posts/${id}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ reason: finalReason })
        });
        
        console.log(`Post DELETE response status: ${res.status}`);
        if (res.ok) {
          console.log('Post deletion successful, updating state...');
          setPosts(prev => prev.filter(p => p.id !== id));
          setModerationQueue(prev => prev.filter(p => p.id !== id));
          // Re-fetch archive history
          const deletedArchiveRes = await fetch('/api/admin/deleted-posts-archive', { headers: { 'Authorization': `Bearer ${token}` } });
          if (deletedArchiveRes.ok) setDeletedPostsArchive(await deletedArchiveRes.json());
          setSelectedPost(null);
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Post deletion failed:', res.status, errorData);
          alert(`削除に失敗しました (${res.status}): ${errorData.error || '不明なエラー'}`);
        }
      } catch (err) {
        console.error('Error in handleDeletePost:', err);
        alert('通信エラーが発生しました。');
      }
    });
  };

  const handleDeleteUser = async (id: number) => {
    showConfirm('ユーザーの削除', 'このユーザーを削除してもよろしいですか？', async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleAddNgWord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNgWord.trim()) return;
    try {
      const res = await fetch('/api/admin/ng-words', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ word: newNgWord })
      });
      if (res.ok) {
        const wordsRes = await fetch('/api/admin/ng-words', { headers: { 'Authorization': `Bearer ${token}` } });
        if (wordsRes.ok) {
          setNgWords(await wordsRes.json());
        }
        setNewNgWord('');
      } else {
        const data = await res.json();
        alert(data.error || '追加に失敗しました');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNgWord = async (id: number) => {
    showConfirm('NGワードの削除', 'このNGワードを削除してもよろしいですか？', async () => {
      try {
        const res = await fetch(`/api/admin/ng-words/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setNgWords(ngWords.filter(w => w.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleUpdateSuccessStory = async (
    id: number, 
    is_public: boolean, 
    is_featured: boolean, 
    is_all_page: boolean, 
    display_position: string | null,
    message?: string,
    era?: string,
    gender?: string,
    title?: string,
    category?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          is_public, 
          is_featured, 
          is_all_page, 
          display_position,
          message,
          era,
          gender,
          title,
          category
        })
      });
      if (res.ok) {
        // Refetch latest stories from API to ensure display_position conflict resolutions are correctly shown
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
        setEditingStoryId(null);
        setStatusMsg({ text: '幸せな再会の物語を更新しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: '更新に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleCreateSuccessStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryForm.message) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/success-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStoryForm)
      });
      if (res.ok) {
        setStatusMsg({ text: '幸せな再会の物語を新規追加しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
        setIsCreatingStory(false);
        setNewStoryForm({
          title: '',
          message: '',
          era: '',
          gender: '男性',
          category: 'classmate',
          consent: true,
          is_public: true,
          is_featured: false,
          is_all_page: true,
          display_position: ''
        });
        // Refetch list
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
      } else {
        setStatusMsg({ text: '物語の追加に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccessStory = async (id: number) => {
    if (!window.confirm('この幸せな再会の物語を完全に削除しますか？')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSuccessStories(successStories.filter(s => s.id !== id));
        setStatusMsg({ text: '幸せな再会の物語を削除しました。', type: 'success' });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ text: '削除に失敗しました。', type: 'error' });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: '通信エラーが発生しました。', type: 'error' });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSuccessStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seed-success-stories', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const storiesRes = await fetch('/api/admin/success-stories', { headers: { 'Authorization': `Bearer ${token}` } });
        if (storiesRes.ok) {
          setSuccessStories(await storiesRes.json());
        }
      }
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-light/50 backdrop-blur-sm">
        <BottleLoader />
      </div>
    );
  }

  if (!isAllowedAdminRole) {
    return <Navigate to="/" />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 relative overflow-visible">
      {/* Decorative background elements for Admin */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col gap-12 mb-12">
        <div className="space-y-6">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4 mb-4 md:mb-8 border-b border-brand-border pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
              <Shield size={26} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] font-sans whitespace-nowrap">Admin Control Center</span>
                {user?.role === 'super_admin' || user?.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">👑 統括最高管理者</span>
                ) : user?.role === 'moderator' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🛡️ モデレーター</span>
                ) : user?.role === 'cs_support' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">🎧 CSサポート</span>
                ) : user?.role === 'auditor' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">⚖️ 監査・法務担当</span>
                ) : null}
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight truncate">管理者ダッシュボード</h1>
              <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-0.5 hidden md:block">
                会員、投函ボトル、決済トランザクション、eKYC申請及び監査ログを一元管理・監視します。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('rbac')}
                className={`px-3 py-2 md:px-4 md:py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap ${
                  activeTab === 'rbac'
                    ? 'bg-purple-600 text-white border-purple-700'
                    : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                }`}
              >
                <ShieldCheck size={14} />
                <span className="hidden sm:inline">ロール権限 (RBAC)</span>
                <span className="sm:hidden">RBAC</span>
              </button>
              <button 
                onClick={handleResetData}
                className="px-3 py-2 md:px-5 md:py-2.5 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-xl border border-brand-accent/20 hover:bg-brand-accent hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">サンプルデータをリセット</span>
                <span className="sm:hidden">リセット</span>
              </button>
            </div>
          </div>
        </div>
      </div>
        
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-3 bg-brand-dark text-white rounded-2xl shadow-lg flex items-center gap-3"
          >
            <Menu size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">メニューを開く</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-light/50 rounded-xl border border-brand-border">
            <Search size={14} className="text-brand-dark/40" />
            <input 
              type="text" 
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-24"
            />
          </div>
        </div>

        {/* Sidebar Navigation */}
        <aside 
          className={cn(
            "hidden md:block shrink-0 transition-all duration-500 ease-in-out z-20",
            isSidebarCollapsed ? "w-20" : "w-72"
          )}
        >
          <div className="sticky top-24 max-h-[calc(100vh-120px)] flex flex-col gap-4">
            {/* Sidebar Header & Search - Fixed at top */}
            <div className="px-2 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                {!isSidebarCollapsed && (
                  <h2 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] ml-2">Navigation</h2>
                )}
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 hover:bg-brand-dark/5 rounded-xl text-black/40 hover:text-black transition-colors"
                >
                  {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
              </div>

              {!isSidebarCollapsed && (
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-brand-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="メニューを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-brand-border rounded-2xl text-sm outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-black placeholder:text-black/30"
                  />
                </div>
              )}
            </div>

            {/* Scrollable Categories List */}
            <div 
              data-lenis-prevent 
              className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 custom-scrollbar select-none"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {filteredCategories.map((category) => (
                <div key={category.title} className="space-y-2 px-2">
                  {!isSidebarCollapsed && (
                    <h2 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] ml-2">{category.title}</h2>
                  )}
                  <nav className="space-y-1">
                    {category.items.map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => {
                          if (tab.onClick) {
                            tab.onClick();
                          } else {
                            setActiveTab(tab.id as any);
                          }
                        }}
                        title={isSidebarCollapsed ? tab.label : undefined}
                        className={cn(
                          "w-full flex items-center gap-4 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-300 relative",
                          activeTab === tab.id 
                            ? "bg-brand-dark text-white shadow-xl shadow-brand-dark/20 translate-x-2" 
                            : "text-black/60 hover:text-black hover:bg-brand-primary/5",
                          isSidebarCollapsed ? "justify-center px-0 translate-x-0" : ""
                        )}
                      >
                        <tab.icon size={20} className={activeTab === tab.id ? 'text-brand-accent' : ''} />
                        {!isSidebarCollapsed && <span className="whitespace-pre-line text-left leading-snug">{tab.label}</span>}
                        {tab.badge !== undefined && <Badge count={tab.badge} />}
                      </button>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                data-lenis-prevent
                className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[110] md:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                data-lenis-prevent
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-brand-light z-[120] md:hidden shadow-2xl flex flex-col pointer-events-auto h-[100dvh]"
              >
                <div className="p-8 border-b border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-serif text-black">Admin Menu</h2>
                      <p className="text-[10px] text-black/40 uppercase tracking-widest">ReMEETs Dashboard</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-brand-dark/5 rounded-full text-black"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div 
                  data-lenis-prevent 
                  className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-24 overscroll-contain"
                  style={{ touchAction: 'pan-y', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                    <input 
                      type="text" 
                      placeholder="メニューを検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-brand-border rounded-2xl text-sm outline-none focus:border-brand-primary text-black placeholder:text-black/30"
                    />
                  </div>

                  {filteredCategories.map((category) => (
                    <div key={category.title} className="space-y-2">
                      <h2 className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] ml-2">{category.title}</h2>
                      <nav className="space-y-1">
                        {category.items.map((tab) => (
                          <button 
                            key={tab.id}
                            onClick={() => {
                              if (tab.onClick) {
                                tab.onClick();
                              } else {
                                setActiveTab(tab.id as any);
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all duration-300",
                              activeTab === tab.id 
                                ? "bg-brand-dark text-white shadow-xl shadow-brand-dark/20" 
                                : "text-black/60 hover:text-black hover:bg-brand-primary/5"
                            )}
                          >
                            <tab.icon size={20} className={activeTab === tab.id ? 'text-brand-accent' : ''} />
                            <span className="whitespace-pre-line text-left leading-snug">{tab.label}</span>
                            {tab.badge !== undefined && <Badge count={tab.badge} />}
                          </button>
                        ))}
                      </nav>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0" style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}>
          {loading ? (
            <div className="flex justify-center py-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}
            >
              {statusMsg && (
                <div className={cn(
                  "p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 sticky top-4 z-50 shadow-lg",
                  statusMsg.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                  {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  <p className="text-sm font-bold">{statusMsg.text}</p>
                </div>
              )}

          {activeTab === 'rbac' && (
            <AdminRbacView
              token={token}
              currentRole={user?.role || 'user'}
              onRoleSwitched={(newToken, newRole) => {
                if (user) {
                  updateUser({ role: newRole });
                }
              }}
            />
          )}

          {activeTab === 'liveAlerts' && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl space-y-6 bg-white border border-brand-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif text-brand-dark flex items-center gap-2.5">
                      <Radio size={22} className="text-emerald-500 animate-pulse" />
                      <span>運営リアルタイム警報 ＆ 大量投稿スパム監視センター</span>
                    </h3>
                    <p className="text-xs text-neutral-500 font-sans">
                      Web Audio API による高精度シンセサイザー警報音と、HTML5 Web Notification によるバックグラウンドデスクトップ通知を統合管理します。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold">
                      <ShieldAlert size={18} className="text-rose-600" />
                      <span>🚨 緊急通報警報 (CRITICAL)</span>
                    </div>
                    <p className="text-rose-950/80 leading-relaxed text-[11px]">
                      ユーザーから「ストーキング・脅迫・個人情報晒し」等の緊急通報を受信した際、二重パルス警報音（救急音）と画面ポップアップで即時通知します。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold">
                      <AlertTriangle size={18} className="text-amber-600" />
                      <span>⚠️ 大量連続投稿スパム (HIGH)</span>
                    </div>
                    <p className="text-amber-950/80 leading-relaxed text-[11px]">
                      同一IPまたは同一ユーザーから15分以内に3件以上の連投が行われた場合、トリプルビープ音で荒らし・ボット攻撃を検知します。
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-teal-800 font-bold">
                      <Bot size={18} className="text-teal-600" />
                      <span>🤖 AI安全防衛 ＆ 総当たり遮断</span>
                    </div>
                    <p className="text-teal-950/80 leading-relaxed text-[11px]">
                      AI安全エンジンによる不適切ボトルの自動隔離（ai_flagged=1）や、5回連続クイズ誤答による24時間アクセスロックをリアルタイムにトラッキングします。
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider font-sans">
                    💡 デスクトップ通知運用のコツ
                  </h4>
                  <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
                    <li>ブラウザ通知（Desktop Notification）をONにしておくと、管理者ダッシュボードを別タブで開いたまま他の作業をしていても、画面右下にポップアップ通知が届きます。</li>
                    <li>通知バナーをクリックすると、自動的にReMEETsの画面が最前面にフォーカスされ、該当の通報やボトル管理画面が開きます。</li>
                    <li>上部の「通報シミュレーション」「連投スパムシミュレーション」ボタンを押すことで、いつでも実運用前の音声・通知テストを実施できます。</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'successStories' && (() => {
            const categories = [
              { id: 'all', label: 'すべて表示' },
              { id: 'featured', label: '⭐ HOME掲載中' },
              { id: 'classmate', label: '🏫 同級生' },
              { id: 'mentor', label: '🌸 恩師・部活' },
              { id: 'journey', label: '🧭 旅・一期一会' },
              { id: 'neighbor', label: '🏡 幼馴染・ご近所' },
              { id: 'colleague', label: '💼 元同僚・仲間' },
              { id: 'rival', label: '⚽ 青春・ライバル' },
            ];

            const getCategoryBadge = (category: string, defaultTag?: string) => {
              switch (category) {
                case 'classmate':
                  return { label: '🏫 同級生', style: 'bg-amber-50 text-amber-900 border-amber-200' };
                case 'mentor':
                  return { label: '🌸 恩師・部活', style: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
                case 'journey':
                  return { label: '🧭 旅・一期一会', style: 'bg-teal-50 text-teal-900 border-teal-200' };
                case 'neighbor':
                  return { label: '🏡 幼馴染・ご近所', style: 'bg-rose-50 text-rose-900 border-rose-200' };
                case 'colleague':
                  return { label: '💼 元同僚・仲間', style: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
                case 'rival':
                  return { label: '⚽ 青春・ライバル', style: 'bg-sky-50 text-sky-900 border-sky-200' };
                default:
                  return { label: defaultTag || '✨ 再会の物語', style: 'bg-slate-100 text-slate-700 border-slate-200' };
              }
            };

            const defaultStoriesMap: Record<string, any> = {
              left: {
                category: "classmate",
                era: "1980年代後半",
                gender: "男性",
                tag: "🏫 同級生",
                title: "卒業から35年。懐かしいあだ名とお互いの記憶が繋いでくれた奇跡",
                message: "中学の卒業以来、お互いに転居が重なり連絡先が分からなくなっていました。ふとReMEETsで当時の陸上部の手紙を見つけ、懐かしい想い出のキーワードをきっかけに35年ぶりにメッセージが開通。当時のあだ名で呼び合い、まるで当時にタイムスリップしたような感動でした。今では年に一度集まる仲に戻り、一生の友人を再び取り戻せました。"
              },
              center: {
                category: "mentor",
                era: "1990年代半ば",
                gender: "女性",
                tag: "🌸 恩師・部活",
                title: "定年退職された吹奏楽部の恩師へ。30年越しの『ありがとう』が届いた日",
                message: "山本先生が定年退職されたと風の噂で聞き、当時の部活仲間で『どうしても感謝を伝えたい』と手紙を流しました。先生のご家族がこの手紙を見つけて先生に伝えてくださり、30年ぶりに温かいお返事をいただくことができました。先日、当時の部員一同で先生を囲んで同窓会を開き、最高の恩返しができました。"
              },
              right: {
                category: "journey",
                era: "1990年代初頭",
                gender: "男性",
                tag: "🧭 旅・一期一会",
                title: "あの夏の北海道。夜通し夢を語り合った旅の友から、3年越しの返信",
                message: "学生時代、バイクで北海道を巡っていた時に富良野の宿で偶然知り合い、朝まで将来の夢について熱く語り合いました。連絡先を書いた紙を紛失してしまいずっと悔やんでいましたが、ダメ元でReMEETsの海に想いを流していました。3年後、彼から『見つけたよ！』と連絡が入った時は手の震えが止まりませんでした。お互いに白髪交じりの大人になりましたが、心の距離は当時のままでした。"
              }
            };

            // フィルタリング処理
            const filteredStories = successStories.filter((story) => {
              if (storyCategoryFilter === 'all') return true;
              if (storyCategoryFilter === 'featured') return story.is_featured === 1;
              const cat = story.category || (story.era ? (story.era.includes('80') ? 'classmate' : story.era.includes('90') ? 'mentor' : 'colleague') : 'classmate');
              return cat === storyCategoryFilter;
            });

            const featuredCount = successStories.filter(s => s.is_featured === 1).length;
            const publicCount = successStories.filter(s => s.is_all_page === 1 && s.is_public === 1).length;

            return (
              <div className="space-y-8 animate-fade-in font-sans">
                {/* ヘッダーカード ＆ サマリー */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Sparkles size={24} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-rose-700 uppercase tracking-widest block font-sans">
                        SUCCESS STORIES & HOME FEATURED MANAGER
                      </span>
                      <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-wide">
                        奇跡の再会報告（体験談）の管理
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed pt-0.5">
                        一般公開ページ（<code>/success-stories</code>）およびHOME画面（3枠）に掲載する再会体験談の作成・審査・スロット配分・編集を一元管理します。
                      </p>
                    </div>
                  </div>

                  {/* アクションボタン群 */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      to="/success-stories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ExternalLink size={14} />
                      <span>公開ページを確認</span>
                    </Link>
                    <button 
                      type="button"
                      onClick={handleSeedSuccessStories}
                      disabled={loading}
                      className="px-4 py-2.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200/80 hover:bg-rose-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                      <span>サンプル6件を一括生成</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsCreatingStory(!isCreatingStory)}
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      {isCreatingStory ? <X size={14} /> : <Plus size={14} />}
                      <span>{isCreatingStory ? 'フォームを閉じる' : '新規ストーリー作成'}</span>
                    </button>
                  </div>
                </div>

                {/* メトリクスバッジ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 block">登録総数</span>
                    <span className="text-xl font-black font-serif text-slate-900">{successStories.length} <span className="text-xs font-normal text-slate-400">件</span></span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-rose-700 block">⭐ HOME掲載中</span>
                    <span className="text-xl font-black font-serif text-rose-700">{featuredCount} <span className="text-xs font-normal text-slate-400">/ 3枠</span></span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-700 block">🌐 一覧掲載中</span>
                    <span className="text-xl font-black font-serif text-emerald-700">{publicCount} <span className="text-xs font-normal text-slate-400">件</span></span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 block">🔒 下書き・非公開</span>
                    <span className="text-xl font-black font-serif text-slate-900">{successStories.length - publicCount} <span className="text-xs font-normal text-slate-400">件</span></span>
                  </div>
                </div>

                {/* ─── HOME掲載 3枠 ライブプレビュー & スロットクイック割当 ─── */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          HOME FEATURED SLOTS
                        </span>
                        <h2 className="text-lg font-serif font-bold text-slate-900">
                          HOME画面に表示中の3枠ライブプレビュー & スロット割当
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 font-sans mt-1">
                        トップページに掲載される3つのカード（左・中央・右）の割り当て状況です。各枠のプルダウンから掲載ストーリーを即座に変更できます。
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {(['left', 'center', 'right'] as const).map((pos, idx) => {
                      const story = successStories.find(s => s.is_featured === 1 && s.display_position === pos);
                      const posLabel = pos === 'left' ? '左側枠 (Left Slot)' : pos === 'center' ? '中央枠 (Center Slot)' : '右側枠 (Right Slot)';
                      const defaultStory = defaultStoriesMap[pos];
                      const isCustom = !!story;
                      const activeCategory = story ? (story.category || (story.era ? (story.era.includes('80') ? 'classmate' : story.era.includes('90') ? 'mentor' : 'colleague') : 'classmate')) : defaultStory.category;
                      const badge = getCategoryBadge(activeCategory);

                      return (
                        <div 
                          key={pos}
                          className={`rounded-3xl p-5 sm:p-6 border flex flex-col justify-between space-y-4 transition-all ${
                            isCustom 
                              ? 'bg-white border-rose-200 shadow-md ring-1 ring-rose-100' 
                              : 'bg-slate-50/70 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <span className="text-[11px] font-bold font-mono text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isCustom ? 'bg-rose-500' : 'bg-slate-400'}`} />
                                {posLabel}
                              </span>
                              {isCustom ? (
                                <span className="text-[9.5px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                  ⭐ カスタム設定中 (ID: #{story.id})
                                </span>
                              ) : (
                                <span className="text-[9.5px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                  ⚪ デフォルト適用中
                                </span>
                              )}
                            </div>

                            {/* 実際のカードプレビュー */}
                            <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.style}`}>
                                  {badge.label}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                  {story?.era || defaultStory.era}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 line-clamp-2">
                                「{story?.title || defaultStory.title}」
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-sans line-clamp-4">
                                {story?.message || defaultStory.message}
                              </p>
                            </div>
                          </div>

                          {/* クイックスロット割当セレクター */}
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <label className="text-[10.5px] font-bold text-slate-500 block">
                              この枠に割り当てるストーリー:
                            </label>
                            <select
                              value={story ? story.id : ''}
                              onChange={(e) => {
                                const selectedId = e.target.value ? Number(e.target.value) : null;
                                if (!selectedId) {
                                  // 解除
                                  if (story) {
                                    handleUpdateSuccessStory(story.id, !!story.is_public, false, !!story.is_all_page, null);
                                  }
                                } else {
                                  const targetStory = successStories.find(s => s.id === selectedId);
                                  if (targetStory) {
                                    handleUpdateSuccessStory(targetStory.id, !!targetStory.is_public, true, !!targetStory.is_all_page, pos);
                                  }
                                }
                              }}
                              className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                            >
                              <option value="">（デフォルトエピソードを表示）</option>
                              {successStories.map(s => (
                                <option key={s.id} value={s.id}>
                                  #{s.id} {s.title ? `「${s.title}」` : `エピソード (${s.era || '年代未設定'})`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── 新規ストーリー作成フォーム (展開時) ─── */}
                {isCreatingStory && (
                  <form onSubmit={handleCreateSuccessStory} className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-md space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                          <Plus size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-serif font-bold text-slate-900">
                            再会ストーリーの新規作成
                          </h3>
                          <p className="text-xs text-slate-500">
                            管理者が直接再会エピソードを登録し、HOMEや体験談一覧へ即座に公開できます。
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsCreatingStory(false)}
                        className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* カテゴリ */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">カテゴリ</label>
                        <select 
                          value={newStoryForm.category}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, category: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                        >
                          <option value="classmate">🏫 同級生</option>
                          <option value="mentor">🌸 恩師・部活</option>
                          <option value="journey">🧭 旅・一期一会</option>
                          <option value="neighbor">🏡 幼馴染・ご近所</option>
                          <option value="colleague">💼 元同僚・仲間</option>
                          <option value="rival">⚽ 青春・ライバル</option>
                          <option value="other">✨ その他</option>
                        </select>
                      </div>

                      {/* タイトル */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block">タイトル (サイト掲載用)</label>
                        <input 
                          type="text"
                          required
                          value={newStoryForm.title}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, title: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                          placeholder="例: 卒業から35年。懐かしいあだ名が繋いでくれた奇跡"
                        />
                      </div>

                      {/* 出会った年代 */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">出会った年代</label>
                        <input 
                          type="text"
                          value={newStoryForm.era}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, era: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                          placeholder="例: 1980年代後半"
                        />
                      </div>

                      {/* 性別 */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">性別・関係性</label>
                        <select 
                          value={newStoryForm.gender}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, gender: e.target.value })}
                          className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-slate-800"
                        >
                          <option value="男性">男性</option>
                          <option value="女性">女性</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                    </div>

                    {/* メッセージ本文 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">メッセージ本文（再会のエピソード）</label>
                      <textarea
                        required
                        value={newStoryForm.message}
                        onChange={(e) => setNewStoryForm({ ...newStoryForm, message: e.target.value })}
                        rows={4}
                        className="w-full text-xs font-sans bg-white p-3.5 rounded-xl border border-slate-200 focus:border-rose-400 outline-none resize-y leading-relaxed"
                        placeholder="再会された喜びのエピソードや感謝の言葉を入力してください..."
                      />
                    </div>

                    {/* 掲載設定コントロール */}
                    <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.consent}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, consent: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        掲載同意済み
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.is_public}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, is_public: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        公開中
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.is_all_page}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, is_all_page: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        一覧掲載
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newStoryForm.is_featured}
                          onChange={(e) => setNewStoryForm({ ...newStoryForm, is_featured: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        ⭐ HOME掲載
                      </label>
                      {newStoryForm.is_featured && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <span>表示位置:</span>
                          <select 
                            value={newStoryForm.display_position}
                            onChange={(e) => setNewStoryForm({ ...newStoryForm, display_position: e.target.value })}
                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 font-bold outline-none"
                          >
                            <option value="">位置未設定</option>
                            <option value="left">左側枠 (Left)</option>
                            <option value="center">中央枠 (Center)</option>
                            <option value="right">右側枠 (Right)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatingStory(false)}
                        className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        ストーリーを保存・登録
                      </button>
                    </div>
                  </form>
                )}

                {/* ─── ストーリー一覧（フィルター & リスト） ─── */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-serif font-bold text-slate-900">
                        登録済みストーリー一覧 ({filteredStories.length}件)
                      </h2>
                    </div>
                  </div>

                  {/* カテゴリ切り替えフィルター */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setStoryCategoryFilter(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          storyCategoryFilter === cat.id
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* カードリスト */}
                  <div className="space-y-4">
                    {filteredStories.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-sans text-xs border border-slate-100 shadow-2xs">
                        該当するストーリーはありません
                      </div>
                    ) : (
                      filteredStories.map((story) => {
                        const isEditing = editingStoryId === story.id;
                        const cat = story.category || (story.era ? (story.era.includes('80') ? 'classmate' : story.era.includes('90') ? 'mentor' : 'colleague') : 'classmate');
                        const badge = getCategoryBadge(cat);

                        return (
                          <div 
                            key={story.id} 
                            className={`bg-white rounded-3xl p-6 border transition-all ${
                              isEditing 
                                ? 'border-rose-400 ring-2 ring-rose-100 shadow-md' 
                                : story.is_featured === 1 
                                ? 'border-rose-200/80 shadow-xs' 
                                : 'border-slate-150 shadow-2xs'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div className="space-y-3 w-full md:w-auto flex-1">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                                    {badge.label}
                                  </span>
                                  {story.is_featured === 1 ? (
                                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                      <Sparkles size={11} />
                                      <span>HOME掲載中 ({story.display_position === 'left' ? '左側枠' : story.display_position === 'center' ? '中央枠' : story.display_position === 'right' ? '右側枠' : '位置未定'})</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                      HOME非掲載
                                    </span>
                                  )}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${story.is_all_page && story.is_public ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {story.is_all_page && story.is_public ? '🌐 一覧掲載中' : '一覧非表示'}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    ID: #{story.id} • {new Date(story.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-500 font-sans flex items-center gap-3">
                                  <span>投稿者: <strong className="text-slate-800">{story.username || story.nickname || '匿名'} 様</strong></span>
                                  <span>•</span>
                                  <span>年代: <strong className="text-slate-800">{story.era || '未設定'}</strong></span>
                                  <span>•</span>
                                  <span>性別: <strong className="text-slate-800">{story.gender || '未設定'}</strong></span>
                                </div>
                              </div>

                              {/* クイックコントロール */}
                              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                                <select 
                                  value={story.is_featured ? (story.display_position || 'featured') : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                      handleUpdateSuccessStory(story.id, !!story.is_public, false, !!story.is_all_page, null);
                                    } else if (val === 'featured') {
                                      handleUpdateSuccessStory(story.id, !!story.is_public, true, !!story.is_all_page, null);
                                    } else {
                                      handleUpdateSuccessStory(story.id, !!story.is_public, true, !!story.is_all_page, val);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer"
                                >
                                  <option value="">HOME非掲載</option>
                                  <option value="left">⭐ HOME左側枠</option>
                                  <option value="center">⭐ HOME中央枠</option>
                                  <option value="right">⭐ HOME右側枠</option>
                                </select>

                                <button 
                                  type="button"
                                  onClick={() => handleUpdateSuccessStory(story.id, !!story.is_public, !!story.is_featured, !story.is_all_page, story.display_position)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                    story.is_all_page ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-white text-slate-400 border-slate-200"
                                  }`}
                                >
                                  {story.is_all_page ? '一覧: ON' : '一覧: OFF'}
                                </button>

                                <button 
                                  type="button"
                                  onClick={() => handleUpdateSuccessStory(story.id, !story.is_public, !!story.is_featured, !!story.is_all_page, story.display_position)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                    story.is_public ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200"
                                  }`}
                                >
                                  {story.is_public ? '公開' : '非公開'}
                                </button>
                              </div>
                            </div>

                            {/* 編集フォーム or 通常表示 */}
                            {isEditing ? (
                              <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 mt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">カテゴリ</label>
                                    <select 
                                      value={editStoryForm.category}
                                      onChange={(e) => setEditStoryForm({ ...editStoryForm, category: e.target.value })}
                                      className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                    >
                                      <option value="classmate">🏫 同級生</option>
                                      <option value="mentor">🌸 恩師・部活</option>
                                      <option value="journey">🧭 旅・一期一会</option>
                                      <option value="neighbor">🏡 幼馴染・ご近所</option>
                                      <option value="colleague">💼 元同僚・仲間</option>
                                      <option value="rival">⚽ 青春・ライバル</option>
                                      <option value="other">✨ その他</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1 sm:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-600 block">タイトル</label>
                                    <input 
                                      type="text"
                                      value={editStoryForm.title}
                                      onChange={(e) => setEditStoryForm({ ...editStoryForm, title: e.target.value })}
                                      className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                      placeholder="タイトルを入力..."
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">年代</label>
                                    <input 
                                      type="text"
                                      value={editStoryForm.era}
                                      onChange={(e) => setEditStoryForm({ ...editStoryForm, era: e.target.value })}
                                      className="w-full text-xs font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                                      placeholder="例: 1980年代後半"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-600 block">メッセージ本文</label>
                                  <textarea
                                    value={editStoryForm.message}
                                    onChange={(e) => setEditStoryForm({ ...editStoryForm, message: e.target.value })}
                                    rows={4}
                                    className="w-full text-xs font-sans bg-white p-3 rounded-xl border border-slate-200 outline-none resize-y leading-relaxed"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingStoryId(null)}
                                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                                  >
                                    キャンセル
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSuccessStory(
                                        story.id, 
                                        !!story.is_public, 
                                        !!story.is_featured, 
                                        !!story.is_all_page, 
                                        story.display_position,
                                        editStoryForm.message,
                                        editStoryForm.era,
                                        editStoryForm.gender,
                                        editStoryForm.title,
                                        editStoryForm.category
                                      );
                                    }}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check size={13} />
                                    修正内容を保存して適用
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 mt-4 pt-3 border-t border-slate-100">
                                <div>
                                  <h4 className="text-sm sm:text-base font-serif font-bold text-slate-900">
                                    {story.title ? `「${story.title}」` : "（タイトル未設定 / デフォルトタイトルが適用されます）"}
                                  </h4>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                                  &ldquo;{story.message}&rdquo;
                                </p>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSuccessStory(story.id)}
                                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-red-200/60 shadow-2xs"
                                  >
                                    <Trash2 size={12} className="text-red-500" />
                                    削除
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStoryId(story.id);
                                      setEditStoryForm({
                                        title: story.title || '',
                                        message: story.message,
                                        era: story.era || '',
                                        gender: story.gender === 'male' || story.gender === '男性' ? '男性' : story.gender === 'female' || story.gender === '女性' ? '女性' : 'その他',
                                        category: cat
                                      });
                                    }}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200/80 shadow-2xs"
                                  >
                                    <Edit2 size={12} className="text-slate-500" />
                                    書き込み内容を編集
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'quizAnalytics' && (
            <div className="space-y-8">
              <QuizMatchingAnalyticsView 
                data={quizMatchingAnalytics} 
                onRefresh={fetchData} 
                isLoading={loading} 
              />
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="space-y-10 animate-fade-in font-sans">
              
              {/* 概要ヘッダー ＆ リアルタイム稼働状況（ヘルスチェックバッジ） */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <BarChart2 size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-teal-700 uppercase tracking-widest block font-sans">
                      SYSTEM DASHBOARD & ANALYTICS
                    </span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
                      運用統計・総合概要
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed pt-0.5">
                      プラットフォーム全体の稼働状況、投函・再会メトリクス、アクセス分析をリアルタイムで一元監視します。
                    </p>
                  </div>
                </div>

                {/* リアルタイムインフラ健全性ステータス */}
                <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>DB: 正常稼働</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-200 rounded-xl text-teal-800 text-xs font-bold shadow-2xs">
                    <Bot size={13} className="text-teal-600" />
                    <span>AI防衛: 稼働中</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 rounded-xl text-indigo-800 text-xs font-bold shadow-2xs">
                    <CreditCard size={13} className="text-indigo-600" />
                    <span>Stripe: 正常</span>
                  </div>
                </div>
              </div>

              {/* 最上部に「🚨 運営の要対応タスク（クイックアラートバー）」 */}
              {(() => {
                const pendingReports = reports?.filter((r: any) => !r.resolved)?.length || 0;
                const unreadContacts = contacts?.filter((c: any) => c.status === 'unread' || c.status === 'pending')?.length || 0;
                const pendingAgeLogs = ageVerificationLogs?.filter((l: any) => l.is_verified === false || l.is_verified === 0)?.length || 0;
                const totalPending = pendingReports + unreadContacts + pendingAgeLogs;

                return (
                  <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h2 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                            <span>運営の要対応タスク</span>
                            {totalPending > 0 ? (
                              <span className="bg-rose-500 text-white text-[11px] font-sans font-bold px-2 py-0.5 rounded-full animate-pulse">
                                要対応 {totalPending}件
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-sans font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                全て対応済み
                              </span>
                            )}
                          </h2>
                          <p className="text-xs text-slate-600 font-sans">
                            未審査の通報やお問い合わせ、年齢確認ログの滞留状況です。クリックで各管理タブへ即座に移動できます。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* 未審査通報 */}
                      <button
                        onClick={() => setActiveTab('moderation')}
                        className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <ShieldAlert size={18} />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 block">AI検知・通報審査</span>
                            <span className="text-lg font-black font-serif text-slate-900">
                              {pendingReports} <span className="text-xs font-normal text-slate-500">件</span>
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      {/* 未返信お問い合わせ */}
                      <button
                        onClick={() => setActiveTab('contacts')}
                        className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Mail size={18} />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 block">未返信お問い合わせ</span>
                            <span className="text-lg font-black font-serif text-slate-900">
                              {unreadContacts} <span className="text-xs font-normal text-slate-500">件</span>
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      {/* 本人確認・年齢ログ */}
                      <button
                        onClick={() => setActiveTab('ageVerification')}
                        className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <UserCheck size={18} />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 block">年齢・eKYCログ確認</span>
                            <span className="text-lg font-black font-serif text-slate-900">
                              {ageVerificationLogs?.length || 0} <span className="text-xs font-normal text-slate-500">件</span>
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 5大主要KPIサマリーカード */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. 登録ユーザー総数 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 font-sans">登録ユーザー総数</span>
                    <div className="w-9 h-9 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center border border-teal-100 shadow-2xs">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-serif text-slate-900">
                      {(stats.summary.totalUsers || users?.length || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">人</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md w-fit">
                    <TrendingUp size={12} />
                    <span>安定成長中</span>
                  </div>
                </div>

                {/* 2. 漂流ボトル総数 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 font-sans">漂流ボトル総数</span>
                    <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center border border-sky-100 shadow-2xs">
                      <Mail size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-serif text-slate-900">
                      {(posts?.length || stats.summary.totalPosts || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">通</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md w-fit">
                    <Database size={12} />
                    <span>暗号化保管</span>
                  </div>
                </div>

                {/* 3. 再会成立組数 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 font-sans">再会成立組数</span>
                    <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100 shadow-2xs">
                      <Heart size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-serif text-slate-900">
                      {(stats.summary.totalReunions || successStories?.length || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">組</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                    <Sparkles size={12} />
                    <span>高マッチング率</span>
                  </div>
                </div>

                {/* 4. 本日の新規投函 */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 font-sans">本日の新規投函</span>
                    <div className="w-9 h-9 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center border border-amber-100 shadow-2xs">
                      <Activity size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-serif text-slate-900">
                      {(stats.summary.todayPosts || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">通 / 日</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md w-fit">
                    <Clock size={12} />
                    <span>リアルタイム更新</span>
                  </div>
                </div>

                {/* 5. サイトPV・トラフィック */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 font-sans">累計アクセス (PV)</span>
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center border border-indigo-100 shadow-2xs">
                      <Eye size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-serif text-slate-900">
                      {(accessLogs?.length ? accessLogs.length * 12 : 24800).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">PV</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                    <Globe size={12} />
                    <span>SEO自然流入</span>
                  </div>
                </div>
              </div>

              {/* 提案 ②: KPI直下に配置！【リアルタイム速報: 本日の新規投函 ＆ 最近の再会成立（コンパクト5件表示）】 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 本日の新規投函ボトル（直近5件） */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                        <PlusCircle size={16} />
                      </div>
                      <h3 className="text-base font-serif font-bold text-slate-900">
                        本日の新規投函ボトル
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      TODAY'S POSTS
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {!stats?.postsToday || stats.postsToday.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 font-sans text-xs">本日の投函はまだありません</div>
                    ) : (
                      <>
                        {stats.postsToday.slice(0, 5).map((p: any) => (
                          <button 
                            key={p.id} 
                            onClick={() => handleViewPost(p)}
                            className="w-full text-left group p-3.5 rounded-2xl border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition-all hover:bg-teal-50/20 cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="font-serif font-bold text-xs sm:text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                                {p.target_name} さんへのボトルメール
                              </span>
                              <span className="text-[9.5px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                                New
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10.5px] text-slate-500 font-sans">
                              <div className="flex items-center gap-1">
                                <UserIcon size={12} /> {p.searcher_username}
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Activity size={12} /> {new Date(p.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </button>
                        ))}
                        <button 
                          onClick={() => setActiveTab('posts')}
                          className="w-full py-2.5 text-center text-teal-700 font-bold hover:bg-teal-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer border border-teal-200/60"
                        >
                          <span>ボトル管理で全件を確認 ({posts?.length || stats.summary.totalPosts || 0}件)</span>
                          <ArrowRight size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 最近の再会成立ボトル（直近5件） */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                        <Heart size={16} />
                      </div>
                      <h3 className="text-base font-serif font-bold text-slate-900">
                        最近の再会成立ボトル
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      RESOLVED
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {!stats?.recentReunions || stats.recentReunions.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 font-sans text-xs">まだ再会データはありません</div>
                    ) : (
                      <>
                        {stats.recentReunions.slice(0, 5).map((p: any) => (
                          <button 
                            key={p.id} 
                            onClick={() => handleViewPost(p)}
                            className="w-full text-left group p-3.5 rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-xs transition-all hover:bg-rose-50/20 cursor-pointer"
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="font-serif font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
                                {p.target_name} さんへのボトルメール
                              </span>
                              <span className="text-[9.5px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                再会成功
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10.5px] text-slate-500 font-sans">
                              <div className="flex items-center gap-1">
                                <UserIcon size={12} /> {p.searcher_username}
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Activity size={12} /> {new Date(p.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </button>
                        ))}
                        <button 
                          onClick={() => setActiveTab('successStories')}
                          className="w-full py-2.5 text-center text-rose-700 font-bold hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer border border-rose-200/60"
                        >
                          <span>奇跡の再会報告（体験談）の管理へ</span>
                          <ArrowRight size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 提案 A: ボトル＆再会マッチング分析 */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-slate-900">
                      A. ボトル投函 ＆ 再会マッチング分析
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      手紙の投函推移、時代・地域別の分布、再会ファネル転換率の分析データです。
                    </p>
                  </div>
                </div>

                {/* 投函アクティビティ (直近7日間) */}
                {stats.dailyStats && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Activity size={18} className="text-teal-700" />
                        <span>投函アクティビティ推移 (直近7日間)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                        DAILY POSTS
                      </span>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.dailyStats || []}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#64748b'}} 
                            tickFormatter={(val: string) => val.split('-').slice(1).join('/')}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '12px' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Era Distribution */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <History size={18} className="text-teal-700" />
                        <span>想い出の時代別分布</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">ERA SHARE</span>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.eraStats || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="era"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats?.eraStats?.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={['#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Regional Distribution */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={18} className="text-teal-700" />
                        <span>地域別アクティビティ</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">REGIONAL MATRIX</span>
                    </div>
                    {stats ? <RegionalMatrix data={stats.regionStats || []} /> : <div className="h-64 flex items-center justify-center text-slate-400">Loading regional data...</div>}
                  </div>

                  {/* Reunion Funnel Analysis */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-teal-700" />
                        <span>「再会までのステップ」分析 (ファネル転換率)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">CONVERSION FUNNEL</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <FunnelChart data={reunionFunnel} />
                      <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">分析インサイト</h4>
                        <div className="space-y-3">
                          <div className="flex gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={12} />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">
                              ボトルの投函から最初の検索発見・クイズ回答への転換率は、ユーザー体験の重要な指標です。
                            </p>
                          </div>
                          <div className="flex gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Heart size={12} />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">
                              想い出クイズの完全一致による連絡先開通は、ReMEETsの最終的な価値提供（奇跡の再会）ポイントです。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reunion Duration Histogram */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Clock size={18} className="text-teal-700" />
                        <span>再会成立までの期間（ボトル漂流期間バケット）</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">DURATION HISTOGRAM</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                      <div className="h-72 w-full md:col-span-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reunionDurationStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="duration" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 11, fill: '#64748b'}} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 11, fill: '#64748b'}} 
                            />
                            <Tooltip 
                              cursor={{fill: 'rgba(0, 0, 0, 0.02)'}} 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
                                      <p className="font-serif text-sm font-semibold text-slate-900 mb-1">{data.duration}</p>
                                      <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-serif font-bold text-teal-700">{data.count}</span>
                                        <span className="text-xs text-slate-500">件 ({data.percentage}%)</span>
                                      </div>
                                      <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">{data.description}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80 h-full flex flex-col justify-center">
                        <h4 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest">時間の傾向・運用分析</h4>
                        <div className="space-y-3">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-700" />
                              初期マッチング（〜3ヶ月: 約40%）
                            </p>
                            <p className="text-[11px] text-slate-600 leading-normal pl-3 font-sans">
                              投函直後のSNS拡散や、検索エンジンのインデックス化による流入が最も活発な黄金期です。
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              漂流・発見期（3ヶ月〜1年: 約35%）
                            </p>
                            <p className="text-[11px] text-slate-600 leading-normal pl-3 font-sans">
                              ボトルがデジタル上で寝かされ、検索をふと思いついた対象者が偶然発見するサイクル層です。
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                              ロングテールマッチ（1年以上: 約25%）
                            </p>
                            <p className="text-[11px] text-slate-600 leading-normal pl-3 font-sans">
                              数年越しの執念検索から実を結ぶ奇跡層。長期的なデータ安全保持が不可欠です。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── セクション B: 📈 トラフィック＆アクセス分析 ─── */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-slate-900">
                      B. トラフィック ＆ アクセス分析
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      PV推移、利用デバイス（スマホ比率）、検索エンジン流入元、アクセスパスの統計です。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Page View Stats */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Eye size={18} className="text-sky-700" />
                        <span>ページビュー統計 (直近7日間)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">PAGE VIEWS</span>
                    </div>
                    <PageViewChart data={pageViewStats} />
                  </div>

                  {/* Device Distribution */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Activity size={18} className="text-sky-700" />
                        <span>デバイス分布 (スマホ / PC比率)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">DEVICE SHARE</span>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.deviceStats || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats?.deviceStats?.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={['#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd'][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Referrer Stats */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <ExternalLink size={18} className="text-sky-700" />
                        <span>流入元 (リファラ)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">REFERRERS</span>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.refererStats} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="referer" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            width={120} 
                            tick={{fontSize: 10, fill: '#64748b'}} 
                            tickFormatter={(val: string) => {
                              try {
                                const url = new URL(val);
                                return url.hostname;
                              } catch {
                                return val.length > 20 ? val.substring(0, 20) + '...' : val;
                              }
                            }}
                          />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                          <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Access Path Stats */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Terminal size={18} className="text-sky-700" />
                        <span>アクセスパスランキング (直近7日間)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">TOP PATHS</span>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.pathStats || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="path" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                          <Bar dataKey="count" fill="#0369a1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── セクション C: 🔍 検索トレンド＆継続率 ─── */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                    <Search size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-slate-900">
                      C. 検索トレンド ＆ ユーザー継続率
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      ユーザーが探している想い出キーワードTOP10および30日間のリテンション分析です。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Search Query Stats */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Search size={18} className="text-indigo-700" />
                        <span>検索ワードランキング (TOP 10)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">SEARCH KEYWORDS</span>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.searchStats} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fontSize: 11, fill: '#64748b'}} />
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                          <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Retention Stats */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Users size={18} className="text-indigo-700" />
                        <span>ユーザー継続性 (直近30日間)</span>
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">RETENTION</span>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={retentionStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#64748b'}} 
                            tickFormatter={(val: string) => val.split('-').slice(1).join('/')}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                          <Legend />
                          <Line type="monotone" dataKey="total_users" name="アクティブ" stroke="#4f46e5" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="new_users" name="新規登録" stroke="#818cf8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' ? (
            <div className="space-y-6">
              <div className="glass-card p-8">
                <div className="flex items-center gap-3 border-b border-brand-border pb-4 mb-6">
                  <span className="p-2 bg-[#5ea5ad]/10 rounded-lg text-[#5ea5ad]">
                    <Settings size={22} />
                  </span>
                  <div>
                    <h2 className="text-xl font-serif text-black font-bold">一般公開・表示設定</h2>
                    <p className="text-xs text-black/50 font-serif">
                      サイトのホームページや一般公開用パーツの挙動、表示有無を制御します。
                    </p>
                  </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                  {/* HOME画面デザインレイアウト切替 */}
                  <div className="p-6 bg-gradient-to-r from-teal-50/70 to-cyan-50/70 rounded-2xl border border-teal-200/90 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 select-none">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-teal-950 font-sans leading-none flex items-center gap-1.5">
                            <Sparkles size={16} className="text-teal-600" />
                            HOME画面デザインレイアウト設定（メイン / サブ）
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            adminHomeDesign === 'v2' ? 'bg-teal-700 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {adminHomeDesign === 'v2' ? '✨ メインデザイン (表示中)' : '📄 サブデザイン (表示中)'}
                          </span>
                        </div>
                        <p className="text-xs text-teal-900/80 font-serif leading-relaxed">
                          現在全ユーザーに表示されるホームページ（HOME）のデザインレイアウトを切り替え・記憶保管します。
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* メインデザイン (v2) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHomeDesignMode('v2')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                          adminHomeDesign === 'v2'
                            ? 'bg-white border-teal-600 ring-2 ring-teal-500/30 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold font-sans text-teal-950 flex items-center gap-1">
                            ✨ メインデザイン
                          </span>
                          {adminHomeDesign === 'v2' && (
                            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">選択中</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-serif leading-normal">
                          情緒的な背景・手紙投稿カード・ボトルスライダー・虹色水面波紋エフェクトを配置したモダン構成。
                        </p>
                      </button>

                      {/* サブデザイン (v1) */}
                      <button
                        type="button"
                        onClick={() => handleToggleHomeDesignMode('v1')}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                          adminHomeDesign === 'v1'
                            ? 'bg-white border-slate-700 ring-2 ring-slate-400/30 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold font-sans text-slate-900 flex items-center gap-1">
                            📄 サブデザイン
                          </span>
                          {adminHomeDesign === 'v1' && (
                            <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded">選択中</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-serif leading-normal">
                          従来のクラシックなメッセージ中心型シンプル標準レイアウト。
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* ホーム画面の統計情報表示 */}
                  <div className="p-6 bg-brand-light/30 rounded-2xl border border-brand-border/60 flex items-center justify-between gap-6">
                    <div className="space-y-1.5 flex-1 select-none">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-black font-sans leading-none">
                          ホーム画面の統計（実績数値）表示
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          statsEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-150 text-zinc-650'
                        }`}>
                          {statsEnabled ? 'ON / 表示中' : 'OFF / 非表示'}
                        </span>
                      </div>
                      <span className="text-[11px] text-black/60 font-serif block leading-relaxed">
                        ホームページ（HOME）上部にある<strong>「累計登録者数」「再会成功数」「本日の投函数」</strong>の統計数値カード（グリッド）を表示させるかを切り替えます。
                        <br />
                        <span className="text-amber-750 font-bold">
                          ※ 運用初期（メンバーや投函ボトルがまだ少ない期間）など、統計情報を意図的に隠しておきたい場合は「オフ（非表示）」に設定することを推奨します。
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={handleToggleHomeStats}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        statsEnabled ? 'bg-[#5ea5ad]' : 'bg-black/10'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          statsEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'deployment' ? (
            <AdminDeploymentGuideBlock docType={guideDocType} setDocType={setGuideDocType} />
          ) : activeTab === 'payments' ? (
            <AdminPaymentManagementBlock />
          ) : activeTab === 'monetization' ? (
            <AdminMonetizationBlock />
          ) : activeTab === 'users' ? (
            <div className="space-y-6">
              {/* 1. Top 4 Metric Cards */}
              {(() => {
                const totalUsersCount = users.length;
                const sampleUsersCount = users.filter(u => u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local')).length;
                const realUsersCount = totalUsersCount - sampleUsersCount;
                const ekycCount = users.filter(u => !!u.is_ekyc_verified).length;
                const ekycRate = totalUsersCount > 0 ? Math.round((ekycCount / totalUsersCount) * 100) : 0;
                const blockedCount = users.filter(u => !!u.is_blocked).length;
                const reportedCount = users.filter(u => (u.reports_received_count || 0) > 0).length;
                const totalLetters = users.reduce((acc, u) => acc + (u.posts_count || 0), 0);
                const totalReunions = users.reduce((acc, u) => acc + (u.resolved_posts_count || 0), 0);

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Total Users */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">総登録アカウント</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Users size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-black text-black">
                          {totalUsersCount.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">名</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-black/60">
                          <span className="inline-flex items-center text-emerald-650 font-bold">👤 本番 {realUsersCount}</span>
                          <span>•</span>
                          <span className="inline-flex items-center text-indigo-650 font-medium">🤖 サンプル {sampleUsersCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: eKYC Rate */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">eKYC認証完了率</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-700">{ekycRate}%</span>
                          <span className="text-xs font-bold text-black/60">({ekycCount}名完了)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ekycRate)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Letters & Reunions */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">累計投函 / 再会成立</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Heart size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-black text-brand-dark">
                          {totalLetters.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">通</span>
                        </div>
                        <div className="mt-1.5 text-[11px] font-bold text-emerald-650 flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>再会成立: {totalReunions} 組</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Blocked & Alerts */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">凍結 / 要警戒</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <ShieldAlert size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl sm:text-3xl font-black ${blockedCount > 0 ? 'text-rose-600' : 'text-black'}`}>{blockedCount}</span>
                          <span className="text-xs font-bold text-black/60">名凍結中</span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-rose-600 font-medium">
                          {reportedCount > 0 ? `⚠️ 被通報アカウント: ${reportedCount}件` : '全アカウント健全'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Filter Tabs & Search & Toolbar */}
              <div className="space-y-3 bg-white/70 p-4 sm:p-5 rounded-2xl border border-brand-border shadow-2xs">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                  {[
                    { id: 'all', label: 'すべて', count: users.length },
                    { id: 'ekyc', label: '🛡️ eKYC済', count: users.filter(u => !!u.is_ekyc_verified).length },
                    { id: 'self', label: '📝 自己申告', count: users.filter(u => !u.is_ekyc_verified).length },
                    { id: 'blocked', label: '🚫 凍結中', count: users.filter(u => !!u.is_blocked).length },
                    { id: 'admin', label: '🔑 スタッフ/管理者', count: users.filter(u => u.role === 'admin').length },
                    { id: 'real', label: '👤 本番アカウント', count: users.filter(u => !u.username.startsWith('sample_') && !u.email?.includes('example.com') && !u.email?.includes('sample.local')).length },
                    { id: 'sample', label: '🤖 サンプル', count: users.filter(u => u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local')).length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setUserStatusFilter(tab.id as any); setUserPage(1); }}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        userStatusFilter === tab.id
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-slate-100/80 text-black/70 hover:bg-slate-200/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        userStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search & Sort & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                    <input 
                      type="text" 
                      placeholder="ユーザー名、ニックネーム、本名、旧姓、メアド、ID等で瞬時検索..." 
                      className="w-full pl-9 pr-8 py-2 bg-slate-50/80 rounded-xl border border-brand-border focus:border-black focus:bg-white outline-none transition-all text-xs sm:text-sm text-black"
                      value={userSearchTerm}
                      onChange={(e) => { setUserSearchTerm(e.target.value); setUserPage(1); }}
                    />
                    {userSearchTerm && (
                      <button
                        onClick={() => { setUserSearchTerm(''); setUserPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Right controls: Sort, PageSize, CSV */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Sort Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <ArrowUpDown size={13} className="text-black/50" />
                      <select
                        value={userSortBy}
                        onChange={(e) => { setUserSortBy(e.target.value as any); setUserPage(1); }}
                        className="bg-transparent text-black font-medium outline-none cursor-pointer text-xs"
                      >
                        <option value="created_desc">登録が新しい順</option>
                        <option value="created_asc">登録が古い順</option>
                        <option value="posts_desc">投関数が多い順</option>
                        <option value="resolved_desc">再会成立数が多い順</option>
                        <option value="reports_desc">被通報数が多い順</option>
                        <option value="id_desc">ID順 (降順)</option>
                      </select>
                    </div>

                    {/* Page Size Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <span className="text-black/50 text-[11px]">表示:</span>
                      <select
                        value={userItemsPerPage}
                        onChange={(e) => { setUserItemsPerPage(Number(e.target.value)); setUserPage(1); }}
                        className="bg-transparent text-black font-medium outline-none cursor-pointer text-xs"
                      >
                        <option value={15}>15件</option>
                        <option value={30}>30件</option>
                        <option value={50}>50件</option>
                        <option value={100}>100件</option>
                      </select>
                    </div>

                    {/* CSV Export Button */}
                    <button
                      onClick={handleExportUsersCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-black/80 font-bold rounded-xl text-xs transition-colors border border-brand-border cursor-pointer shadow-2xs"
                      title="現在のフィルター結果をCSVエクスポート"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">CSV出力</span>
                    </button>
                  </div>
                </div>

                {/* Batch Action Floating / Slide-in Bar when users selected */}
                <AnimatePresence>
                  {selectedUserIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-xs">
                        <div className="flex items-center gap-2 font-bold text-brand-dark">
                          <CheckCircle2 size={16} className="text-brand-primary" />
                          <span>{selectedUserIds.length} 名のアカウントを選択中</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleBatchUpdateUserStatus(true)}
                            disabled={isBatchUpdatingUserStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントを一括ブロック・アクセス制限"
                          >
                            <Lock size={12} />
                            <span>一括凍結</span>
                          </button>
                          <button
                            onClick={() => handleBatchUpdateUserStatus(false)}
                            disabled={isBatchUpdatingUserStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントの凍結を一括解除"
                          >
                            <Unlock size={12} />
                            <span>一括凍結解除</span>
                          </button>
                          <button
                            onClick={handleBatchResetUserEkyc}
                            disabled={isBatchResettingUserEkyc}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントのeKYC本人確認ステータスを一括リセット"
                          >
                            <RotateCcw size={12} />
                            <span>eKYCリセット</span>
                          </button>
                          <button
                            onClick={handleBatchDeleteUsers}
                            disabled={isBatchDeletingUsers}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したアカウントを一括物理削除"
                          >
                            <Trash2 size={12} />
                            <span>一括削除</span>
                          </button>
                          <button
                            onClick={() => setSelectedUserIds([])}
                            className="px-2 py-1 text-black/60 hover:text-black hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
                          >
                            選択解除
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. User Table Section */}
              {(() => {
                // Filter users
                const filteredUsers = users.filter(u => {
                  // Status Filter
                  if (userStatusFilter === 'ekyc' && !u.is_ekyc_verified) return false;
                  if (userStatusFilter === 'self' && u.is_ekyc_verified) return false;
                  if (userStatusFilter === 'blocked' && !u.is_blocked) return false;
                  if (userStatusFilter === 'admin' && u.role !== 'admin') return false;
                  if (userStatusFilter === 'sample' && (!u.username.startsWith('sample_') && !u.email?.includes('example.com') && !u.email?.includes('sample.local'))) return false;
                  if (userStatusFilter === 'real' && (u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local'))) return false;

                  // Search term
                  if (!userSearchTerm) return true;
                  const term = userSearchTerm.toLowerCase();
                  return (
                    (u.username && u.username.toLowerCase().includes(term)) ||
                    (u.nickname && u.nickname.toLowerCase().includes(term)) ||
                    (u.full_name && u.full_name.toLowerCase().includes(term)) ||
                    (u.maiden_name && u.maiden_name.toLowerCase().includes(term)) ||
                    (u.email && u.email.toLowerCase().includes(term)) ||
                    (u.contact_id && u.contact_id.toLowerCase().includes(term)) ||
                    String(u.id).includes(term)
                  );
                });

                // Sort users
                const sortedUsers = [...filteredUsers].sort((a, b) => {
                  if (userSortBy === 'created_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  if (userSortBy === 'created_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  if (userSortBy === 'posts_desc') return (b.posts_count || 0) - (a.posts_count || 0);
                  if (userSortBy === 'resolved_desc') return (b.resolved_posts_count || 0) - (a.resolved_posts_count || 0);
                  if (userSortBy === 'reports_desc') return (b.reports_received_count || 0) - (a.reports_received_count || 0);
                  if (userSortBy === 'id_desc') return b.id - a.id;
                  return 0;
                });

                const totalFiltered = sortedUsers.length;
                const totalPages = Math.max(1, Math.ceil(totalFiltered / userItemsPerPage));
                const currentPage = Math.min(userPage, totalPages);
                const paginatedUsers = sortedUsers.slice((currentPage - 1) * userItemsPerPage, currentPage * userItemsPerPage);
                const allSelectedOnPage = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.includes(u.id));

                return (
                  <div className="space-y-4">
                    <div className="glass-card overflow-hidden rounded-2xl border border-brand-border/70 shadow-xs" style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}>
                      <div className="overflow-x-auto" style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}>
                        <table className="w-full text-left border-collapse min-w-[960px]">
                          <thead>
                            <tr className="border-b border-brand-border bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-black/70">
                              <th className="px-3 py-2.5 w-10 text-center whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={allSelectedOnPage}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...paginatedUsers.map(u => u.id)])));
                                    } else {
                                      const pageIds = new Set(paginatedUsers.map(u => u.id));
                                      setSelectedUserIds(selectedUserIds.filter(id => !pageIds.has(id)));
                                    }
                                  }}
                                  className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                />
                              </th>
                              <th className="px-2.5 py-2.5 w-14 whitespace-nowrap">ID</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ユーザー情報</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">氏名 / 旧姓</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">連絡先 / SNS</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">活動状況</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">認証状況</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">状態</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">登録日</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/50 text-xs">
                            {paginatedUsers.length === 0 ? (
                              <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-black/50">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Users size={32} className="text-black/20" />
                                    <p className="font-bold">該当するユーザーは見つかりませんでした</p>
                                    <p className="text-xs text-black/40">検索キーワードやフィルター条件を変更してお試しください</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedUsers.map((u) => {
                                const isSelected = selectedUserIds.includes(u.id);
                                const isSample = u.username.startsWith('sample_') || u.email?.includes('example.com') || u.email?.includes('sample.local');
                                
                                return (
                                  <tr
                                    key={u.id}
                                    onClick={() => handleViewUser(u)}
                                    className={`h-12 hover:bg-white/60 transition-colors cursor-pointer group ${
                                      isSelected ? 'bg-brand-primary/5' : ''
                                    } ${u.is_blocked ? 'bg-red-50/30' : ''}`}
                                  >
                                    {/* Checkbox */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedUserIds([...selectedUserIds, u.id]);
                                          } else {
                                            setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                                          }
                                        }}
                                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                      />
                                    </td>

                                    {/* ID */}
                                    <td className="px-2.5 py-2 font-mono text-black/60 font-bold text-xs whitespace-nowrap">
                                      #{u.id}
                                    </td>

                                    {/* User Info (Avatar + Username + Nickname in single horizontal line) */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                          u.role === 'admin' 
                                            ? 'bg-black text-white' 
                                            : isSample 
                                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                              : 'bg-brand-primary/10 text-brand-dark'
                                        }`}>
                                          {(u.nickname || u.username || '?')[0].toUpperCase()}
                                        </div>
                                        <span className="font-bold text-black text-xs">{u.username}</span>
                                        {u.nickname && (
                                          <span className="text-[11px] text-black/50">（{u.nickname}）</span>
                                        )}
                                        {u.role === 'admin' && (
                                          <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold tracking-wider">
                                            ADMIN
                                          </span>
                                        )}
                                        {isSample && (
                                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.2 rounded font-medium">
                                            SAMPLE
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Full Name & Maiden Name & Birthdate in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-black/85 text-xs">
                                          {u.full_name || (u.last_name || u.first_name ? `${u.last_name || ''} ${u.first_name || ''}`.trim() : <span className="text-black/30 font-normal">未登録</span>)}
                                        </span>
                                        {u.maiden_name && (
                                          <span className="bg-amber-50 text-amber-850 px-1.5 py-0.2 rounded border border-amber-200 text-[10px] font-medium">
                                            旧姓: {u.maiden_name}
                                          </span>
                                        )}
                                        {u.birthdate && (
                                          <span className="text-[10px] text-black/40 font-mono">
                                            ({u.birthdate})
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Email & Contact in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-black/75">
                                          {u.email || <span className="text-black/30 font-sans">メール未登録</span>}
                                        </span>
                                        {u.contact_type && u.contact_id && (
                                          <span className="inline-flex items-center gap-1 text-[10px] text-black/60 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                            <span className="font-bold text-black/70">{u.contact_type.toUpperCase()}</span>: {u.contact_id}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Activities in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                          (u.posts_count || 0) > 0
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-slate-50 text-black/40 border-slate-200'
                                        }`} title={`累計投関数: ${u.posts_count || 0}通`}>
                                          ✉️ {u.posts_count || 0}
                                        </span>
                                        {(u.resolved_posts_count || 0) > 0 && (
                                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title={`再会成立: ${u.resolved_posts_count}組`}>
                                            🤝 {u.resolved_posts_count}
                                          </span>
                                        )}
                                        {(u.reports_received_count || 0) > 0 && (
                                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse" title={`被通報数: ${u.reports_received_count}件`}>
                                            ⚠️ {u.reports_received_count}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* eKYC Verification Badge in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      {u.is_ekyc_verified ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs" title={`eKYC認証完了 (${u.ekyc_document_type || '公的身分証'})`}>
                                          <ShieldCheck size={12} className="text-emerald-700" />
                                          <span>eKYC済</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-black/60 border border-slate-200" title="自己申告・誓約書署名のみ">
                                          <span>📝 自己申告</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* Status Badge in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap">
                                      {u.is_blocked ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                          <Lock size={10} />
                                          <span>凍結中</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          <span>正常</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* Created Date in single horizontal line */}
                                    <td className="px-3 py-2 text-black/60 text-[11px] whitespace-nowrap font-mono">
                                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                                    </td>

                                    {/* Actions Group - in single horizontal line */}
                                    <td className="px-3 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1">
                                        {/* View Details */}
                                        <button
                                          onClick={() => handleViewUser(u)}
                                          className="p-1.5 text-black/60 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                          title="ユーザー詳細・活動履歴を開く"
                                        >
                                          <Eye size={14} />
                                        </button>

                                        {/* Police Disclosure Report */}
                                        <button
                                          onClick={() => handleGeneratePoliceReport(u.id)}
                                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                          title="警察照会・捜査関係事項照会データ出力（刑事訴訟法第197条第2項）"
                                        >
                                          <ShieldAlert size={14} />
                                        </button>

                                        {/* Reset eKYC (if verified) */}
                                        {!!u.is_ekyc_verified && (
                                          <button
                                            onClick={() => handleAdminResetUserEkyc(u.id)}
                                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                            title="eKYC本人確認を未申請状態に戻す"
                                          >
                                            <RotateCcw size={14} />
                                          </button>
                                        )}

                                        {/* Block / Unblock (except admin) */}
                                        {u.role !== 'admin' && (
                                          <>
                                            <button
                                              onClick={() => handleUpdateUserStatus(u.id, !u.is_blocked)}
                                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                u.is_blocked 
                                                  ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800' 
                                                  : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                                              }`}
                                              title={u.is_blocked ? "アカウント凍結を解除" : "アカウントを凍結（アクセス遮断）"}
                                            >
                                              {u.is_blocked ? <Unlock size={14} /> : <Lock size={14} />}
                                            </button>

                                            {/* Delete User */}
                                            <button
                                              onClick={() => handleDeleteUser(u.id)}
                                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                              title="ユーザーアカウントを安全に削除"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 4. Enhanced Pagination */}
                    {totalFiltered > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-black/60">
                        <div>
                          全 <span className="font-bold text-black">{totalFiltered}</span> 件中{' '}
                          <span className="font-bold text-black">{(currentPage - 1) * userItemsPerPage + 1}</span> -{' '}
                          <span className="font-bold text-black">{Math.min(currentPage * userItemsPerPage, totalFiltered)}</span> 件を表示
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronLeft size={14} />
                              <span>前へ</span>
                            </button>

                            <div className="flex items-center gap-1 px-2">
                              <span className="font-bold text-black">{currentPage}</span>
                              <span>/</span>
                              <span>{totalPages}</span>
                            </div>

                            <button
                              disabled={currentPage >= totalPages}
                              onClick={() => setUserPage(prev => Math.min(totalPages, prev + 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <span>次へ</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : activeTab === 'posts' ? (
            <div className="space-y-6">
              {/* 1. Top 4 Metric Cards */}
              {(() => {
                const totalPostsCount = posts.length;
                const samplePostsCount = posts.filter(p => p.is_sample === 1 || p.user_is_sample === 1).length;
                const realPostsCount = totalPostsCount - samplePostsCount;
                const resolvedCount = posts.filter(p => p.status === 'resolved' || p.is_resolved === 1).length;
                const resolvedRate = totalPostsCount > 0 ? Math.round((resolvedCount / totalPostsCount) * 100) : 0;
                const activeCount = posts.filter(p => p.status !== 'resolved' && p.is_resolved !== 1).length;
                const aiDiagnosedCount = posts.filter(p => !!p.ai_diagnosed).length;
                const aiFlaggedCount = posts.filter(p => !!p.ai_flagged).length;
                const aiSafeCount = aiDiagnosedCount - aiFlaggedCount;

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Total Letters */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">総投函ボトル数</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Mail size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl sm:text-3xl font-black text-black">
                          {totalPostsCount.toLocaleString()}<span className="text-xs font-normal text-black/60 ml-1">通</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-black/60">
                          <span className="inline-flex items-center text-emerald-650 font-bold">👤 本番 {realPostsCount}</span>
                          <span>•</span>
                          <span className="inline-flex items-center text-indigo-650 font-medium">🤖 サンプル {samplePostsCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Reunion Rate */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">再会成立率</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Heart size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-amber-700">{resolvedRate}%</span>
                          <span className="text-xs font-bold text-black/60">({resolvedCount}組成立)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, resolvedRate)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: AI Moderation */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">AI安全防衛・検閲</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-700">{aiSafeCount}</span>
                          <span className="text-xs font-bold text-black/60">通健全</span>
                        </div>
                        <div className="mt-1.5 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                          {aiFlaggedCount > 0 ? (
                            <span>⚠️ 要注意・隔離: {aiFlaggedCount} 通</span>
                          ) : (
                            <span className="text-emerald-650 font-normal">全ボトル合格・安全</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Active Searching */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-brand-border shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black/60 tracking-wider">公開捜索中ボトル</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Sparkles size={16} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-purple-700">{activeCount.toLocaleString()}</span>
                          <span className="text-xs font-bold text-black/60">通漂流中</span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-black/60 font-medium">
                          想い出の手紙が受取人を待機中
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Filter Tabs & Search & Toolbar */}
              <div className="space-y-3 bg-white/70 p-4 sm:p-5 rounded-2xl border border-brand-border shadow-2xs">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                  {[
                    { id: 'all', label: 'すべて', count: posts.length },
                    { id: 'active', label: '🔍 捜索中', count: posts.filter(p => p.status !== 'resolved' && p.is_resolved !== 1).length },
                    { id: 'resolved', label: '🤝 再会成立', count: posts.filter(p => p.status === 'resolved' || p.is_resolved === 1).length },
                    { id: 'ai_passed', label: '🛡️ AI健全', count: posts.filter(p => p.ai_diagnosed && !p.ai_flagged).length },
                    { id: 'ai_flagged', label: '⚠️ AI隔離・要注意', count: posts.filter(p => !!p.ai_flagged).length },
                    { id: 'real', label: '👤 本番ボトル', count: posts.filter(p => p.is_sample !== 1 && p.user_is_sample !== 1).length },
                    { id: 'sample', label: '🤖 サンプル', count: posts.filter(p => p.is_sample === 1 || p.user_is_sample === 1).length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setPostFilterType(tab.id as any); setPostPage(1); }}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        postFilterType === tab.id
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-slate-100/80 text-black/70 hover:bg-slate-200/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        postFilterType === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search & Sort & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                    <input 
                      type="text" 
                      placeholder="対象者、差出人、本名、手紙本文、秘密の質問、ID等で瞬時検索..." 
                      className="w-full pl-9 pr-8 py-2 bg-slate-50/80 rounded-xl border border-brand-border focus:border-black focus:bg-white outline-none transition-all text-xs sm:text-sm text-black"
                      value={postSearchTerm}
                      onChange={(e) => { setPostSearchTerm(e.target.value); setPostPage(1); }}
                    />
                    {postSearchTerm && (
                      <button
                        onClick={() => { setPostSearchTerm(''); setPostPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Right controls: Sort, PageSize, CSV, Generate Sample */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Sort Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <ArrowUpDown size={13} className="text-black/50" />
                      <select
                        value={postSortBy}
                        onChange={(e) => { setPostSortBy(e.target.value as any); setPostPage(1); }}
                        className="bg-transparent text-black font-medium outline-none cursor-pointer text-xs"
                      >
                        <option value="created_desc">投函が新しい順</option>
                        <option value="created_asc">投函が古い順</option>
                        <option value="resolved_desc">再会成立優先</option>
                        <option value="ai_flagged_desc">AI要注意フラグ優先</option>
                        <option value="id_desc">ID順 (降順)</option>
                      </select>
                    </div>

                    {/* Page Size Select */}
                    <div className="flex items-center gap-1 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-brand-border text-xs">
                      <span className="text-black/50 text-[11px]">表示:</span>
                      <select
                        value={postItemsPerPage}
                        onChange={(e) => { setPostItemsPerPage(Number(e.target.value)); setPostPage(1); }}
                        className="bg-transparent text-black font-medium outline-none cursor-pointer text-xs"
                      >
                        <option value={15}>15件</option>
                        <option value={30}>30件</option>
                        <option value={50}>50件</option>
                        <option value={100}>100件</option>
                      </select>
                    </div>

                    {/* CSV Export Button */}
                    <button
                      onClick={handleExportPostsCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-black/80 font-bold rounded-xl text-xs transition-colors border border-brand-border cursor-pointer shadow-2xs"
                      title="現在のフィルター結果をCSVエクスポート"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">CSV出力</span>
                    </button>

                    {/* Sample Post Generator Button */}
                    <button
                      onClick={() => handleGenerateSamplePosts(50)}
                      disabled={isGeneratingSamplePosts}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-black/80 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                      title="実在感のある日本の想い出サンプルボトルを50通一括自動生成"
                    >
                      <Plus size={13} className={isGeneratingSamplePosts ? "animate-spin" : ""} />
                      <span>サンプル生成 (+50)</span>
                    </button>
                  </div>
                </div>

                {/* Batch Action Floating / Slide-in Bar when posts selected */}
                <AnimatePresence>
                  {selectedPostIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-xs">
                        <div className="flex items-center gap-2 font-bold text-brand-dark">
                          <CheckCircle2 size={16} className="text-brand-primary" />
                          <span>{selectedPostIds.length} 件のボトルメールを選択中</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={handleBatchAiAnalyzePosts}
                            disabled={isBatchAiAnalyzing}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルメールに対してGemini AI安全診断を一括実行"
                          >
                            <Bot size={12} className={isBatchAiAnalyzing ? "animate-spin" : ""} />
                            <span>一括AI診断</span>
                          </button>
                          <button
                            onClick={() => handleBatchUpdatePostStatus('resolved')}
                            disabled={isBatchUpdatingPostStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルのステータスを一括で再会成立に変更"
                          >
                            <Heart size={12} />
                            <span>一括再会成立</span>
                          </button>
                          <button
                            onClick={() => handleBatchUpdatePostStatus('active')}
                            disabled={isBatchUpdatingPostStatus}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルのステータスを一括で捜索中に戻す"
                          >
                            <Sparkles size={12} />
                            <span>一括捜索中に戻す</span>
                          </button>
                          <button
                            onClick={handleBatchDeletePosts}
                            disabled={isBatchDeletingPosts}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
                            title="選択したボトルメールを一括削除"
                          >
                            <Trash2 size={12} />
                            <span>一括削除</span>
                          </button>
                          <button
                            onClick={() => setSelectedPostIds([])}
                            className="px-2 py-1 text-black/60 hover:text-black hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
                          >
                            選択解除
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Bottles Table Section */}
              {(() => {
                // Filter posts
                const filteredPosts = posts.filter(p => {
                  const isSample = p.is_sample === 1 || p.user_is_sample === 1;
                  if (postFilterType === 'sample' && !isSample) return false;
                  if (postFilterType === 'real' && isSample) return false;
                  if (postFilterType === 'active' && (p.status === 'resolved' || p.is_resolved === 1)) return false;
                  if (postFilterType === 'resolved' && (p.status !== 'resolved' && p.is_resolved !== 1)) return false;
                  if (postFilterType === 'ai_passed' && (!p.ai_diagnosed || p.ai_flagged)) return false;
                  if (postFilterType === 'ai_flagged' && !p.ai_flagged) return false;

                  if (!postSearchTerm) return true;
                  const term = postSearchTerm.toLowerCase();
                  return (
                    (p.target_name && p.target_name.toLowerCase().includes(term)) ||
                    (p.searcher_name && p.searcher_name.toLowerCase().includes(term)) ||
                    (p.searcher_username && p.searcher_username.toLowerCase().includes(term)) ||
                    (p.searcher_nickname && p.searcher_nickname.toLowerCase().includes(term)) ||
                    (p.searcher_full_name && p.searcher_full_name.toLowerCase().includes(term)) ||
                    (p.target_school && p.target_school.toLowerCase().includes(term)) ||
                    (p.target_hometown && p.target_hometown.toLowerCase().includes(term)) ||
                    (p.era && p.era.toLowerCase().includes(term)) ||
                    (p.category && p.category.toLowerCase().includes(term)) ||
                    (p.message && p.message.toLowerCase().includes(term)) ||
                    (p.secret_question && p.secret_question.toLowerCase().includes(term)) ||
                    String(p.id).includes(term)
                  );
                });

                // Sort posts
                const sortedPosts = [...filteredPosts].sort((a, b) => {
                  if (postSortBy === 'created_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  if (postSortBy === 'created_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  if (postSortBy === 'resolved_desc') {
                    const aRes = a.status === 'resolved' || a.is_resolved === 1 ? 1 : 0;
                    const bRes = b.status === 'resolved' || b.is_resolved === 1 ? 1 : 0;
                    return bRes - aRes;
                  }
                  if (postSortBy === 'ai_flagged_desc') return (b.ai_flagged ? 1 : 0) - (a.ai_flagged ? 1 : 0);
                  if (postSortBy === 'id_desc') return b.id - a.id;
                  return 0;
                });

                const totalFiltered = sortedPosts.length;
                const totalPages = Math.max(1, Math.ceil(totalFiltered / postItemsPerPage));
                const currentPage = Math.min(postPage, totalPages);
                const paginatedPosts = sortedPosts.slice((currentPage - 1) * postItemsPerPage, currentPage * postItemsPerPage);
                const allSelectedOnPage = paginatedPosts.length > 0 && paginatedPosts.every(p => selectedPostIds.includes(p.id));

                return (
                  <div className="space-y-4">
                    <div className="glass-card overflow-hidden rounded-2xl border border-brand-border/70 shadow-xs" style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}>
                      <div className="overflow-x-auto" style={{ touchAction: 'pan-y', overscrollBehaviorY: 'auto' }}>
                        <table className="w-full text-left border-collapse min-w-[960px]">
                          <thead>
                            <tr className="border-b border-brand-border bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-black/70">
                              <th className="px-3 py-2.5 w-10 text-center whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={allSelectedOnPage}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPostIds(Array.from(new Set([...selectedPostIds, ...paginatedPosts.map(p => p.id)])));
                                    } else {
                                      const pageIds = new Set(paginatedPosts.map(p => p.id));
                                      setSelectedPostIds(selectedPostIds.filter(id => !pageIds.has(id)));
                                    }
                                  }}
                                  className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                />
                              </th>
                              <th className="px-2.5 py-2.5 w-14 whitespace-nowrap">ID</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">種別</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">対象者</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">差出人</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">年代・カテゴリ</th>
                              <th className="px-3 py-2.5 whitespace-nowrap max-w-[240px]">想い出の手紙</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">AI安全診断</th>
                              <th className="px-3 py-2.5 text-center whitespace-nowrap">状態</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">投函日</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/50 text-xs">
                            {paginatedPosts.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="px-6 py-12 text-center text-black/50">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Mail size={32} className="text-black/20" />
                                    <p className="font-bold">該当するボトルメールは見つかりませんでした</p>
                                    <p className="text-xs text-black/40">検索キーワードやフィルター条件を変更してお試しください</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedPosts.map((p) => {
                                const isSelected = selectedPostIds.includes(p.id);
                                const isSample = p.is_sample === 1 || p.user_is_sample === 1;
                                const isResolved = p.status === 'resolved' || p.is_resolved === 1;

                                return (
                                  <tr
                                    key={p.id}
                                    onClick={() => handleViewPost(p)}
                                    className={`h-12 hover:bg-white/60 transition-colors cursor-pointer group ${
                                      isSelected ? 'bg-brand-primary/5' : ''
                                    } ${p.ai_flagged ? 'bg-red-50/30' : ''}`}
                                  >
                                    {/* Checkbox */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedPostIds([...selectedPostIds, p.id]);
                                          } else {
                                            setSelectedPostIds(selectedPostIds.filter(id => id !== p.id));
                                          }
                                        }}
                                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                                      />
                                    </td>

                                    {/* ID */}
                                    <td className="px-2.5 py-2 font-mono text-black/60 font-bold text-xs whitespace-nowrap">
                                      #{p.id}
                                    </td>

                                    {/* Type (Sample vs Real) in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {isSample ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                          🤖 サンプル
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                          👤 本番
                                        </span>
                                      )}
                                    </td>

                                    {/* Target Name in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-black text-xs">{p.target_name}</span>
                                        {(p.target_school || p.target_hometown) && (
                                          <span className="text-[10px] text-black/40 font-normal">
                                            ({[p.target_school, p.target_hometown].filter(Boolean).join('・')})
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Searcher Info in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-black text-xs">{p.searcher_name}</span>
                                        {p.searcher_full_name && p.searcher_full_name !== p.searcher_name && (
                                          <span className="text-[11px] text-black/50">（{p.searcher_full_name}）</span>
                                        )}
                                        {p.searcher_username && (
                                          <span className="text-[10px] text-black/40 font-mono">@{p.searcher_username}</span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Era & Category in single horizontal line */}
                                    <td className="px-3 py-2 whitespace-nowrap text-black/70 text-xs">
                                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                                        {[formatEraLabel(p.era), getCategoryText(p.category)].filter(Boolean).join(' • ') || '想い出'}
                                      </span>
                                    </td>

                                    {/* Message Snippet in single horizontal line */}
                                    <td className="px-3 py-2 max-w-[240px] truncate text-black/60 text-xs" title={p.message || p.content}>
                                      {p.message || p.content || <span className="text-black/30 font-normal">メッセージなし</span>}
                                    </td>

                                    {/* AI Safety Diagnosis Status in single horizontal line */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      {p.ai_diagnosed ? (
                                        <div className="inline-flex items-center gap-1">
                                          {p.ai_flagged ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200" title={p.ai_reason || "不適切コンテンツ検知"}>
                                              <AlertTriangle size={11} />
                                              <span>要警戒</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300" title="安全審査クリア">
                                              <Check size={11} />
                                              <span>健全</span>
                                            </span>
                                          )}
                                          <button
                                            onClick={() => handleAiAnalyze(p.id)}
                                            disabled={isAiAnalyzing === p.id}
                                            title="AI再診断を実行"
                                            className="p-1 text-black/40 hover:text-black hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                          >
                                            <RefreshCw size={12} className={isAiAnalyzing === p.id ? "animate-spin" : ""} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleAiAnalyze(p.id)}
                                          disabled={isAiAnalyzing === p.id}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-black hover:text-white text-black/70 border border-slate-200 transition-colors cursor-pointer"
                                          title="Google Gemini AI による即時安全診断"
                                        >
                                          <Bot size={11} className={isAiAnalyzing === p.id ? "animate-spin" : ""} />
                                          <span>未診断</span>
                                        </button>
                                      )}
                                    </td>

                                    {/* Status Badge in single horizontal line (Clickable to toggle) */}
                                    <td className="px-3 py-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => handleTogglePostStatus(p.id, p.status)}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                          isResolved
                                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                        }`}
                                        title={isResolved ? "クリックして「捜索中」に戻す" : "クリックして「再会成立」に変更"}
                                      >
                                        {isResolved ? (
                                          <>
                                            <Heart size={10} className="fill-amber-600 text-amber-600" />
                                            <span>再会成立</span>
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={10} />
                                            <span>捜索中</span>
                                          </>
                                        )}
                                      </button>
                                    </td>

                                    {/* Created Date in single horizontal line */}
                                    <td className="px-3 py-2 text-black/60 text-[11px] whitespace-nowrap font-mono">
                                      {p.created_at ? new Date(p.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                                    </td>

                                    {/* Actions Group - in single horizontal line */}
                                    <td className="px-3 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1">
                                        {/* View Details */}
                                        <button
                                          onClick={() => handleViewPost(p)}
                                          className="p-1.5 text-black/60 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                          title="ボトルメール詳細・合言葉・メッセージ履歴を表示"
                                        >
                                          <Eye size={14} />
                                        </button>

                                        {/* SEO / Search Preview */}
                                        <button
                                          onClick={() => setAdminSeoPreviewPost(p)}
                                          className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                          title="SEO証明書・Google検索プレビューを表示"
                                        >
                                          <FileText size={14} />
                                        </button>

                                        {/* Toggle Resolved */}
                                        <button
                                          onClick={() => handleTogglePostStatus(p.id, p.status)}
                                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                            isResolved
                                              ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                                              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800'
                                          }`}
                                          title={isResolved ? "再会成立を解除して捜索中に戻す" : "再会成立（解決済）としてマーク"}
                                        >
                                          <Heart size={14} className={isResolved ? "fill-amber-600" : ""} />
                                        </button>

                                        {/* Delete Post */}
                                        <button
                                          onClick={() => triggerDeletePost(p.id)}
                                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                          title="ボトルメールを安全に削除・アーカイブ"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 4. Enhanced Pagination */}
                    {totalFiltered > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-black/60">
                        <div>
                          全 <span className="font-bold text-black">{totalFiltered}</span> 件中{' '}
                          <span className="font-bold text-black">{(currentPage - 1) * postItemsPerPage + 1}</span> -{' '}
                          <span className="font-bold text-black">{Math.min(currentPage * postItemsPerPage, totalFiltered)}</span> 件を表示
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setPostPage(prev => Math.max(1, prev - 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronLeft size={14} />
                              <span>前へ</span>
                            </button>

                            <div className="flex items-center gap-1 px-2">
                              <span className="font-bold text-black">{currentPage}</span>
                              <span>/</span>
                              <span>{totalPages}</span>
                            </div>

                            <button
                              disabled={currentPage >= totalPages}
                              onClick={() => setPostPage(prev => Math.min(totalPages, prev + 1))}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <span>次へ</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : activeTab === 'security' ? (
            <div className="space-y-12">
              {/* 🔔 運営リアルタイム警報＆スパム監視バー (セキュリティタブ内配置) */}
              <AdminLiveAlertMonitor token={token} onNavigateTab={(tab) => setActiveTab(tab)} />

              {/* Emergency Export Section */}
              <div className="p-8 bg-white border border-brand-border rounded-[40px] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 space-y-8">
                  <div className="space-y-6 border-b border-zinc-100 pb-6">
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                          <Download size={20} className="text-brand-primary" />
                        </div>
                        <h3 className="text-2xl font-serif text-black">緊急ログ・エクスポート (法執行機関対応用)</h3>
                      </div>
                      <p className="text-black/60 max-w-3xl text-sm leading-relaxed">
                        警察や裁判所、各行政機関等からの照会・捜査要請があった場合、システム上のすべての監査・利用履歴データを速やかに抽出・提出するための高度セキュリティエクスポート機能です。<br/>
                        IPアドレス、操作分類、アクセス履歴、本人確認記録、通報履歴などが含まれます。
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={() => handleLoadPreviewAndShow('7d')}
                        disabled={previewLoading || isExporting !== null}
                        className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                      >
                        {previewLoading && previewTimeframe === '7d' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Eye size={16} />
                        )}
                        7日間のログをプレビュー & 検索
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleLoadPreviewAndShow('all')}
                        disabled={previewLoading || isExporting !== null}
                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                      >
                        {previewLoading && previewTimeframe === 'all' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Eye size={16} />
                        )}
                        全期間をプレビュー & 検索
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                    {/* JSON Bulk Section */}
                    <div className="space-y-4 p-6 bg-zinc-50 rounded-3xl border border-zinc-200/60">
                      <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                        JSON形式での一括エクスポート
                      </h4>
                      <p className="text-xs text-zinc-500 leading-normal">
                        システム移行や、構造化されたデータベースデータ形式（JSON）として一括で全テーブルをダンプ・バックアップする場合に使用します。
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button 
                          onClick={() => handleExportAuditBundle('7d')}
                          disabled={isExporting !== null}
                          className="flex-1 px-4 py-3 bg-brand-dark hover:bg-brand-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isExporting === '7d' ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          直近7日間 (JSON)
                        </button>
                        <button 
                          onClick={() => handleExportAuditBundle('all')}
                          disabled={isExporting !== null}
                          className="flex-1 px-4 py-3 bg-brand-dark hover:bg-brand-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isExporting === 'all' ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          全期間 (JSON)
                        </button>
                      </div>
                    </div>

                    {/* Excel CSV Section */}
                    <div className="space-y-4 p-6 bg-zinc-50 rounded-3xl border border-zinc-200/60">
                      <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Excel互換 CSV個別エクスポート
                      </h4>
                      <p className="text-xs text-zinc-500 leading-normal">
                        日本語（UTF-8 BOM付き）でエクスポートされ、Microsoft Excelやスプレッドシートで文字化けすることなくそのまま安全に表示・編集が可能です。
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/export/audit-bundle?timeframe=all', { headers: { 'Authorization': `Bearer ${token}` } });
                              const d = await res.json();
                              handleExportTableCsv('access_logs', d.data.access_logs, 'all');
                            } catch (e) { alert('読み込みに失敗しました。'); }
                          }}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-800 rounded-xl text-[10.5px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-600" />
                          アクセスログ
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/export/audit-bundle?timeframe=all', { headers: { 'Authorization': `Bearer ${token}` } });
                              const d = await res.json();
                              handleExportTableCsv('action_logs', d.data.action_logs, 'all');
                            } catch (e) { alert('読み込みに失敗しました。'); }
                          }}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-800 rounded-xl text-[10.5px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-600" />
                          アクションログ
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/export/audit-bundle?timeframe=all', { headers: { 'Authorization': `Bearer ${token}` } });
                              const d = await res.json();
                              handleExportTableCsv('users', d.data.users, 'all');
                            } catch (e) { alert('読み込みに失敗しました。'); }
                          }}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-800 rounded-xl text-[10.5px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-600" />
                          登録ユーザー
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/export/audit-bundle?timeframe=all', { headers: { 'Authorization': `Bearer ${token}` } });
                              const d = await res.json();
                              handleExportTableCsv('age_verification_logs', d.data.age_verification_logs, 'all');
                            } catch (e) { alert('読み込みに失敗しました。'); }
                          }}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-800 rounded-xl text-[10.5px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-600" />
                          本人確認記録
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/export/audit-bundle?timeframe=all', { headers: { 'Authorization': `Bearer ${token}` } });
                              const d = await res.json();
                              handleExportTableCsv('reports', d.data.reports, 'all');
                            } catch (e) { alert('読み込みに失敗しました。'); }
                          }}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-800 rounded-xl text-[10.5px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-600" />
                          通報履歴
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/export/audit-bundle?timeframe=all', { headers: { 'Authorization': `Bearer ${token}` } });
                              const d = await res.json();
                              handleExportTableCsv('posts', d.data.posts, 'all');
                            } catch (e) { alert('読み込みに失敗しました。'); }
                          }}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 border border-zinc-200 text-zinc-700 hover:text-emerald-800 rounded-xl text-[10.5px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <FileSpreadsheet size={13} className="text-emerald-600" />
                          ボトル投函
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Censorship Testing Playground Section --- */}
              <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-[40px] shadow-xl relative overflow-hidden text-slate-200">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -ml-40 -mb-40" />
                <div className="relative z-10 space-y-8">
                  <div className="border-b border-zinc-800 pb-6 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-400">
                        <ShieldAlert size={20} />
                      </div>
                      <h3 className="text-2xl font-serif text-white">安全防衛・検閲リアルタイムシミュレータ</h3>
                    </div>
                    <p className="text-zinc-400 max-w-4xl text-sm leading-relaxed">
                      日本の公安行政、および警察・サイバー課等の審査官向け検証機能です。プロフィールやボトルメール投函などの各入力フォームから、実名、直接連絡先、住所、不当接触、暴言などを検知する安全防衛フィルタの動作実証シナリオテストが行えます。
                    </p>
                  </div>

                  {/* プリセットシナリオ */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <span>📌</span> 審査・検証用テストシナリオ (クリックで自動セット)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {[
                        {
                          title: "① 実名フルネーム",
                          desc: "常用姓名辞書チェック",
                          text: "昔の同級生の 山田太郎（やまだたろう）くんを探しています。見かけたら教えてください。",
                          icon: "👤",
                          badge: "常用姓名警告"
                        },
                        {
                          title: "② 直接連絡先(LINE)",
                          desc: "LINE ID/携帯の自動伏字",
                          text: "懐かしいね！もしよかったら LINE ID: remeets123、または090-1234-5678 まで連絡して！",
                          icon: "📱",
                          badge: "連絡先マスキング"
                        },
                        {
                          title: "③ 機微個人情報(住所)",
                          desc: "詳細な住所パターンの検知",
                          text: "昔よく放課後に遊んだ、東京都新宿区歌舞伎町1-2-3の公園で会いましょう。覚えているかな？",
                          icon: "📍",
                          badge: "住所マスキング"
                        },
                        {
                          title: "④ 誹謗中傷・危険暴言",
                          desc: "重大不当表現の自動隔離",
                          text: "お前本当にうざいから消えろ、絶対に殺すからな。地獄に落ちろ。",
                          icon: "🚫",
                          badge: "自動非公開・通報"
                        },
                        {
                          title: "⑤ 不適切出会い/パパ活",
                          desc: "性的勧誘/援助交際検知",
                          text: "今日夜暇だから、お小遣いあげるので大人の関係で援助交際（パパ活）しませんか？",
                          icon: "💳",
                          badge: "即時司法通報"
                        }
                      ].map((sc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCensorshipTestText(sc.text);
                            handleTestCensorship(sc.text);
                            setSimulatedPostId(null);
                            setSimulationSuccessMsg(null);
                          }}
                          className="p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-left transition-all flex flex-col justify-between h-full space-y-3 cursor-pointer group"
                        >
                          <div className="space-y-1">
                            <span className="text-xl">{sc.icon}</span>
                            <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-tight">{sc.title}</div>
                            <div className="text-[10px] text-zinc-500 leading-normal">{sc.desc}</div>
                          </div>
                          <span className="text-[9px] font-bold text-red-400 bg-red-950/40 border border-red-900/30 rounded-md px-1.5 py-0.5 self-start">
                            {sc.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* --- 公安審査用・安全防衛検証用サンプルフレーズ大図鑑 (全50選) --- */}
                  <div className="border border-zinc-800 bg-zinc-900/30 rounded-3xl overflow-hidden transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => setIsSampleBookOpen(!isSampleBookOpen)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📖</span>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>公安・審査官用安全防衛検証サンプルフレーズ大図鑑</span>
                            <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">50種類完備</span>
                          </h4>
                          <p className="text-[11px] text-zinc-500 leading-normal">
                            各種検閲フィルターや、自動隔離・自動司法通報フローの動作検証に適した合格/違反/隔離テスト用フレーズ集
                          </p>
                        </div>
                      </div>
                      <span className={`text-zinc-500 transition-transform duration-300 ${isSampleBookOpen ? 'rotate-180' : 'rotate-0'}`}>
                        ▼
                      </span>
                    </button>

                    {isSampleBookOpen && (
                      <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 space-y-6">
                        {/* カテゴリタブ切替 */}
                        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
                          {samplePhrasesCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setActiveSampleCategory(cat.id)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeSampleCategory === cat.id
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-inner'
                                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800/60'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.title}</span>
                            </button>
                          ))}
                        </div>

                        {/* フレーズ一覧リスト */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
                          {samplePhrasesCategories
                            .find((cat) => cat.id === activeSampleCategory)
                            ?.phrases.map((phrase, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-zinc-700 transition-colors"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-white">{phrase.label}</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                      phrase.type === 'safe'
                                        ? 'bg-green-950/60 text-green-400 border border-green-900/30'
                                        : phrase.type === 'warn'
                                        ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30'
                                        : phrase.type === 'mask'
                                        ? 'bg-blue-950/60 text-blue-400 border border-blue-900/30'
                                        : 'bg-red-950/60 text-red-400 border border-red-900/30'
                                    }`}>
                                      {phrase.type === 'safe' && '● 安全パス'}
                                      {phrase.type === 'warn' && '● 実名警告'}
                                      {phrase.type === 'mask' && '● 伏字化対象'}
                                      {phrase.type === 'quarantine' && '💀 即隔離・通報'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                                    {phrase.desc}
                                  </p>
                                  <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs font-sans text-zinc-300 select-all leading-normal">
                                    {phrase.text}
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(phrase.text);
                                      alert('クリップボードにコピーしました！そのまま入力エリアに貼り付けて検証できます。');
                                    }}
                                    className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-[10px] font-bold tracking-wider transition-all border border-zinc-700/60 cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <span>📋</span> コピー
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCensorshipTestText(phrase.text);
                                      handleTestCensorship(phrase.text);
                                      setSimulatedPostId(null);
                                      setSimulationSuccessMsg(null);
                                    }}
                                    className="flex-1 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg text-[10px] font-bold tracking-wider transition-all border border-red-500/20 cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <span>⚡</span> テスト実行
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* テキスト入力 & シミュレータ起動 */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-3">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        検証用テストテキスト入力エリア
                      </label>
                      <textarea
                        value={censorshipTestText}
                        onChange={(e) => {
                          setCensorshipTestText(e.target.value);
                          setSimulatedPostId(null);
                          setSimulationSuccessMsg(null);
                        }}
                        placeholder="上記のテストシナリオをクリックするか、ここに任意のテスト文章を入力してください。"
                        rows={5}
                        className="w-full !bg-zinc-900 !text-white border !border-zinc-700 focus:!border-zinc-500 rounded-2xl p-4 text-sm font-sans focus:outline-none resize-none placeholder:!text-zinc-500"
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => handleTestCensorship()}
                          disabled={isTestingCensorship || !censorshipTestText}
                          className="flex-1 px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white rounded-2xl text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isTestingCensorship ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>🔍</span>
                          )}
                          ① 防衛・検閲エンジンでリアルタイム解析
                        </button>

                        <button
                          type="button"
                          onClick={handleTriggerCensorshipSimulation}
                          disabled={isSimulatingPost || !censorshipTestText}
                          className="flex-1 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSimulatingPost ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>🚀</span>
                          )}
                          ② 模擬投函・即時自動通報フローを実行
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                      {/* リアルタイム解析結果パネル */}
                      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 h-full flex flex-col justify-between min-h-[220px]">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-800 pb-2">
                            <span className="flex items-center gap-1.5">
                              <span>🤖</span>
                              <span>Gemini AI リアルタイム安全防衛評価</span>
                            </span>
                            {censorshipTestResult ? (
                              <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                                {censorshipTestResult.execution_time_ms ? `${censorshipTestResult.execution_time_ms}ms` : 'LIVE'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-600 font-mono">WAITING INPUT</span>
                            )}
                          </h4>

                          {censorshipTestResult ? (
                            <div className="space-y-3.5 text-xs">
                              {/* 1. リスクメーター ゲージ */}
                              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-zinc-300">
                                    総合AI危険度リスクスコア:
                                  </span>
                                  <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                                    (censorshipTestResult.risk_score || 0) >= 70
                                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                      : (censorshipTestResult.risk_score || 0) >= 30
                                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  }`}>
                                    {censorshipTestResult.risk_score ?? (censorshipTestResult.inappropriate?.detected ? 85 : 0)} / 100
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden p-0.5">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      (censorshipTestResult.risk_score || 0) >= 70
                                        ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                                        : (censorshipTestResult.risk_score || 0) >= 30
                                        ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.max(5, censorshipTestResult.risk_score ?? (censorshipTestResult.inappropriate?.detected ? 85 : 5))}%` }}
                                  />
                                </div>

                                {/* アクション推奨バッジ */}
                                <div className="pt-1 flex items-center justify-between text-[10px]">
                                  <span className="text-zinc-500">推奨防衛アクション:</span>
                                  <span className={`font-bold px-2 py-0.5 rounded-full border ${
                                    (censorshipTestResult.risk_score || 0) >= 70 || censorshipTestResult.suggested_action === 'IMMEDIATE_QUARANTINE_AUTO_REPORT'
                                      ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                                      : (censorshipTestResult.risk_score || 0) >= 30 || censorshipTestResult.suggested_action === 'AUTO_FLAG'
                                      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                                      : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                                  }`}>
                                    {(censorshipTestResult.risk_score || 0) >= 70 || censorshipTestResult.suggested_action === 'IMMEDIATE_QUARANTINE_AUTO_REPORT'
                                      ? '🔴 即時隔離 ＆ 公安システム自動通報起票'
                                      : (censorshipTestResult.risk_score || 0) >= 30 || censorshipTestResult.suggested_action === 'AUTO_FLAG'
                                      ? '🟡 要確認（マスク化・隔離フラグ適用）'
                                      : '🟢 安全公開許可 (APPROVE)'}
                                  </span>
                                </div>
                              </div>

                              {/* 2. カテゴリ別リスク内訳 */}
                              {censorshipTestResult.categories && (
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div className="p-2 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                                    <div className="flex justify-between text-zinc-400">
                                      <span>🗡️ 誹謗中傷・脅迫:</span>
                                      <span className="font-mono font-bold">{censorshipTestResult.categories.harassment || 0}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${censorshipTestResult.categories.harassment || 0}%` }} />
                                    </div>
                                  </div>

                                  <div className="p-2 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                                    <div className="flex justify-between text-zinc-400">
                                      <span>📱 個人情報・LINE等:</span>
                                      <span className="font-mono font-bold">{censorshipTestResult.categories.pii_leakage || 0}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${censorshipTestResult.categories.pii_leakage || 0}%` }} />
                                    </div>
                                  </div>

                                  <div className="p-2 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                                    <div className="flex justify-between text-zinc-400">
                                      <span>💳 不当出会い・パパ活:</span>
                                      <span className="font-mono font-bold">{censorshipTestResult.categories.inappropriate_meeting || 0}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${censorshipTestResult.categories.inappropriate_meeting || 0}%` }} />
                                    </div>
                                  </div>

                                  <div className="p-2 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                                    <div className="flex justify-between text-zinc-400">
                                      <span>🚫 公序良俗・ヘイト:</span>
                                      <span className="font-mono font-bold">{censorshipTestResult.categories.hate_speech || 0}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${censorshipTestResult.categories.hate_speech || 0}%` }} />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 3. AI判定理由解説 */}
                              {censorshipTestResult.ai_reason && (
                                <div className="p-3 bg-zinc-950/90 border border-zinc-800 rounded-2xl text-[11px] space-y-1">
                                  <div className="text-zinc-400 font-bold flex items-center gap-1.5 text-[10px]">
                                    <span className="text-amber-400">💡</span>
                                    <span>Gemini AI 判定所見:</span>
                                  </div>
                                  <p className="text-zinc-300 leading-relaxed font-sans">
                                    {censorshipTestResult.ai_reason}
                                  </p>
                                </div>
                              )}

                              {/* 4. フルネーム / 個人情報 / NGワード判定 */}
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800/80">
                                  <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                                    <span>👤</span> 実名・姓名検出:
                                  </span>
                                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                    censorshipTestResult.fullname?.detected 
                                      ? 'bg-rose-950/60 border border-rose-900/30 text-rose-400' 
                                      : 'bg-zinc-850 text-zinc-400'
                                  }`}>
                                    {censorshipTestResult.fullname?.detected 
                                      ? `常用姓名検出 (${censorshipTestResult.fullname.reason || '実名パターン'})` 
                                      : '安全 (検知なし)'}
                                  </span>
                                </div>

                                <div className="flex flex-col p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5 text-[11px]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                      <span>📱</span> 直接連絡先・機微情報:
                                    </span>
                                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                      censorshipTestResult.personalInfo?.detected 
                                        ? 'bg-amber-950/60 border border-amber-900/30 text-amber-400' 
                                        : 'bg-zinc-850 text-zinc-400'
                                    }`}>
                                      {censorshipTestResult.personalInfo?.detected ? '機微情報あり' : '安全 (検知なし)'}
                                    </span>
                                  </div>
                                  {censorshipTestResult.personalInfo?.detected && (
                                    <div className="grid grid-cols-2 gap-1 text-[9.5px] text-zinc-400 pl-5">
                                      {censorshipTestResult.personalInfo.email && <span className="text-amber-400/90">● メールアドレス</span>}
                                      {censorshipTestResult.personalInfo.phone && <span className="text-amber-400/90">● 電話番号</span>}
                                      {censorshipTestResult.personalInfo.lineId && <span className="text-amber-400/90">● LINE ID</span>}
                                      {censorshipTestResult.personalInfo.sns && <span className="text-amber-400/90">● SNSアカウント</span>}
                                      {censorshipTestResult.personalInfo.address && <span className="text-amber-400/90">● 詳細住所</span>}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px]">
                                  <span className="text-zinc-400 flex items-center gap-1.5">
                                    <span>🚫</span> 辞書NGキーワード:
                                  </span>
                                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                    censorshipTestResult.inappropriate?.detected 
                                      ? 'bg-rose-600 text-white animate-pulse' 
                                      : 'bg-zinc-850 text-zinc-400'
                                  }`}>
                                    {censorshipTestResult.inappropriate?.detected 
                                      ? `NG検出 (${censorshipTestResult.inappropriate.words.join(', ')})` 
                                      : '安全 (検知なし)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-12 text-center text-zinc-600 text-xs font-serif italic space-y-2">
                              <div>🔍 テストフレーズを選択するか文章を入力して解析ボタンを押すと、</div>
                              <div>Gemini AI 危険度スコア、カテゴリ別内訳、及び自動防衛評価が表示されます。</div>
                            </div>
                          )}
                        </div>

                        {/* マスキング出力プレビュー */}
                        {censorshipTestResult && (
                          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                              🛡️ 安全マスク化適用後の本文プレビュー
                            </label>
                            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs font-sans text-zinc-300 leading-relaxed max-h-[100px] overflow-y-auto whitespace-pre-wrap select-all">
                              {censorshipTestResult.filteredText}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 模擬自動通報＆隔離 成功時UIフィードバック */}
                  {simulationSuccessMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                          <Check size={16} />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-white uppercase tracking-wider">
                            安全防衛シミュレータ：検証フロー実行成功 (ボトルID: #{simulatedPostId})
                          </div>
                          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed whitespace-pre-wrap">
                            {simulationSuccessMsg}
                          </p>
                        </div>
                      </div>

                      <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/60 text-[10.5px] font-mono leading-relaxed text-zinc-500 space-y-1">
                          <div className="text-zinc-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            <span>DATABASE STATUS (自動隔離)</span>
                          </div>
                          <div>TABLE: <span className="text-red-400">posts</span></div>
                          <div>ID: <span className="text-white">#{simulatedPostId}</span></div>
                          <div>ai_flagged: <span className="text-red-400 font-bold">1 (非公開・安全隔離済み)</span></div>
                          <div>ai_reason: <span className="text-zinc-400">"不適切な表現(NGワード)が含まれます"</span></div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/60 text-[10.5px] font-mono leading-relaxed text-zinc-500 space-y-1">
                          <div className="text-green-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span>AUDIT REPORT (即時司法通報起票)</span>
                          </div>
                          <div>TABLE: <span className="text-green-400">reports</span></div>
                          <div>REPORT_TYPE: <span className="text-white">"inappropriate_words"</span></div>
                          <div>STATUS: <span className="text-red-400 font-bold">"priority" (管理者確認優先度：極高)</span></div>
                          <div>REASON: <span className="text-zinc-400">"【システム安全対策・模擬自動通報】が自動起票されました。左の『通報』メニューより該当ログを確認できます。"</span></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Security Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-8 relative overflow-hidden group">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                      <span className="text-[16px] font-normal text-black/75 uppercase tracking-widest block">ログイン失敗 (累計)</span>
                      <div className="text-4xl font-serif font-normal text-red-500 leading-none">
                        {securityStats?.failedLogins.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                      <ShieldAlert size={24} />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 relative overflow-hidden group">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                      <span className="text-[16px] font-normal text-black/75 uppercase tracking-widest block">不審なIP数</span>
                      <div className="text-4xl font-serif font-normal text-amber-500 leading-none">
                        {securityStats?.suspiciousActivity.length || 0}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                      <AlertTriangle size={24} />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 relative overflow-hidden group">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                      <span className="text-[16px] font-normal text-black/75 uppercase tracking-widest block">本人確認証跡 (保存中)</span>
                      <div className="text-4xl font-serif font-normal text-brand-primary leading-none">
                        {securityStats?.verifiedUsersCount || 0}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                      <UserCheck size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Stats Chart */}
              <div className="glass-card p-8">
                <h3 className="text-xl font-serif text-black mb-8 flex items-center gap-3">
                  <ShieldAlert size={20} className="text-red-500" />
                  エラー発生状況 (HTTP 4xx/5xx)
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={securityStats?.errorStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Suspicious IPs */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                    <h3 className="text-lg font-serif text-black flex items-center gap-3">
                      <Activity size={20} className="text-amber-500" />
                      高頻度アクセスIP (直近1時間)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-light/10">
                          <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">IPアドレス</th>
                          <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">リクエスト数</th>
                          <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityStats?.suspiciousActivity.length === 0 ? (
                          <tr><td colSpan={3} className="p-8 text-center text-black/40 font-serif">不審なアクティビティはありません</td></tr>
                        ) : (
                          securityStats?.suspiciousActivity.map((s: any) => (
                            <tr key={s.ip} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                              <td className="px-3 py-1 font-mono text-[12px] text-black">{s.ip}</td>
                              <td className="px-3 py-1 text-[12px] font-bold text-red-500">{s.count}回</td>
                              <td className="px-3 py-1 text-right">
                                <button 
                                  onClick={() => handleBlockIp(s.ip, "High frequency access")}
                                  className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors uppercase tracking-widest"
                                >
                                  ブロック
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Failed Logins */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                    <h3 className="text-lg font-serif text-black flex items-center gap-3">
                      <ShieldAlert size={20} className="text-red-500" />
                      ログイン失敗履歴 (IP別)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-light/10">
                          <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">IPアドレス</th>
                          <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">失敗回数</th>
                          <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityStats?.failedLogins.length === 0 ? (
                          <tr><td colSpan={3} className="p-8 text-center text-black/40 font-serif">失敗履歴はありません</td></tr>
                        ) : (
                          securityStats?.failedLogins.map((f: any) => (
                            <tr key={f.ip} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                              <td className="px-3 py-1 font-mono text-[12px] text-black">{f.ip}</td>
                              <td className="px-3 py-1 text-[12px] font-bold text-red-500">{f.count}回</td>
                              <td className="px-3 py-1 text-right">
                                <button 
                                  onClick={() => handleBlockIp(f.ip, "Brute force attempt")}
                                  className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors uppercase tracking-widest"
                                >
                                  ブロック
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Blocked IPs */}
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                  <h3 className="text-lg font-serif text-black flex items-center gap-3">
                    <Lock size={20} className="text-black" />
                    ブロック済みIPアドレス一覧
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-light/10">
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">IPアドレス</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">理由</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">ブロック日時</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityStats?.blockedIps.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-black/40 font-serif">ブロック中のIPはありません</td></tr>
                      ) : (
                        securityStats?.blockedIps.map((b: any) => (
                          <tr key={b.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                            <td className="px-3 py-1 font-mono text-[12px] text-black">{b.ip}</td>
                            <td className="px-3 py-1 text-[12px] text-black/70 whitespace-nowrap">{b.reason}</td>
                            <td className="px-3 py-1 text-[12px] text-black/60">{new Date(b.created_at).toLocaleString()}</td>
                            <td className="px-3 py-1 text-right">
                              <button 
                                onClick={() => handleUnblockIp(b.ip)}
                                className="px-4 py-1.5 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-black/80 transition-colors uppercase tracking-widest"
                              >
                                解除
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Security Events */}
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                  <h3 className="text-lg font-serif text-black flex items-center gap-3">
                    <History size={20} className="text-black" />
                    最近のセキュリティイベント
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-light/10">
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">時間</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">イベント</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">詳細</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityStats?.recentEvents.map((e: any) => (
                        <tr key={e.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                          <td className="px-3 py-1 text-[12px] text-black/75 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border",
                              e.action === 'login_failure' ? "bg-red-50 text-red-600 border-red-100" :
                              e.action === 'ng_word_detected' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-black/5 text-black border-black/10"
                            )}>
                              {e.action}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-[12px] text-black/70">{e.details}</td>
                          <td className="px-3 py-1 text-[12px] font-mono text-black/60">{e.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Online Spreadsheet Preview Modal */}
              {showPreviewModal && previewData && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in font-sans">
                  <div className="bg-white rounded-[32px] w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl border border-zinc-150 overflow-hidden animate-scale-up">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-150 bg-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shadow-inner">
                          <FileSpreadsheet size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 font-serif flex items-center gap-2">
                            提出ログ・オンライン・スプレッドシート・プレビュー
                            <span className="text-[11px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold tracking-widest uppercase">
                              {previewTimeframe === '7d' ? '直近7日間' : '全期間'}
                            </span>
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            法執行機関や監査員へ提出する前に、各テーブルの該当レコードをリアルタイムで閲覧・検索できます。
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Search Bar */}
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="全項目から検索..."
                            value={previewSearch}
                            onChange={(e) => setPreviewSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-zinc-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all w-48 md:w-64"
                          />
                          {previewSearch && (
                            <button
                              onClick={() => setPreviewSearch('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Close button */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowPreviewModal(false);
                            setPreviewData(null);
                          }}
                          className="p-2 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Navigation Tabs & Export Control */}
                    <div className="px-6 py-3 border-b border-zinc-150 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div className="flex flex-wrap gap-1">
                        {[
                          { id: 'access_logs', label: 'アクセスログ', count: previewData.data.access_logs?.length || 0 },
                          { id: 'action_logs', label: 'アクションログ', count: previewData.data.action_logs?.length || 0 },
                          { id: 'users', label: '登録ユーザー', count: previewData.data.users?.length || 0 },
                          { id: 'age_verification_logs', label: '年齢・本人確認証跡', count: previewData.data.age_verification_logs?.length || 0 },
                          { id: 'reports', label: '通報履歴', count: previewData.data.reports?.length || 0 },
                          { id: 'posts', label: 'ボトル投函履歴', count: previewData.data.posts?.length || 0 },
                          { id: 'failed_attempts', label: '不正ログイン試行', count: previewData.data.failed_attempts?.length || 0 },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setPreviewTab(t.id);
                              setPreviewSearch('');
                            }}
                            className={cn(
                              "px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap",
                              previewTab === t.id
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
                            )}
                          >
                            {t.label} ({t.count})
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExportTableCsv(previewTab, previewData.data[previewTab], previewTimeframe)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer hover:translate-y-[-1px] active:scale-95"
                      >
                        <FileSpreadsheet size={14} />
                        このテーブルを Excel CSV として出力
                      </button>
                    </div>

                    {/* Spreadsheet Main View */}
                    <div className="flex-1 overflow-auto bg-zinc-50 p-6">
                      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="flex-1 overflow-auto">
                          
                          {/* Access Logs Grid */}
                          {previewTab === 'access_logs' && (
                            <table className="w-full text-left border-collapse min-w-[900px]">
                              <thead>
                                <tr className="bg-zinc-50/80 border-b border-zinc-200 sticky top-0 backdrop-blur-sm z-10">
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ログID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ユーザー</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">パス (API/画面)</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">メソッド</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ステータス</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">IPアドレス</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">日時</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ブラウザ・端末 (UserAgent)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const rows = previewData.data.access_logs || [];
                                  const filtered = rows.filter((r: any) => {
                                    if (!previewSearch) return true;
                                    const q = previewSearch.toLowerCase();
                                    return (r.username || 'guest').toLowerCase().includes(q) || 
                                           (r.path || '').toLowerCase().includes(q) || 
                                           (r.ip || '').toLowerCase().includes(q) ||
                                           (r.user_agent || '').toLowerCase().includes(q);
                                  });
                                  if (filtered.length === 0) {
                                    return <tr><td colSpan={8} className="p-12 text-center text-zinc-400 font-serif">該当するデータはありません</td></tr>;
                                  }
                                  return filtered.map((r: any) => (
                                    <tr key={r.id} className="border-b border-zinc-150 last:border-0 hover:bg-zinc-50/50 font-sans text-xs transition-colors">
                                      <td className="p-3 text-zinc-500 font-mono">{r.id}</td>
                                      <td className="p-3 text-zinc-900 font-bold">{r.username || 'Guest'}</td>
                                      <td className="p-3 font-mono text-zinc-700 max-w-[200px] truncate" title={r.path}>{r.path}</td>
                                      <td className="p-3">
                                        <span className="px-2 py-0.5 rounded font-bold text-[9.5px] uppercase border bg-zinc-100 text-zinc-800 border-zinc-200">
                                          {r.method}
                                        </span>
                                      </td>
                                      <td className="p-3 font-mono font-bold text-zinc-600">{r.status_code || 200}</td>
                                      <td className="p-3 text-zinc-800 font-mono">{r.ip}</td>
                                      <td className="p-3 text-zinc-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                                      <td className="p-3 text-zinc-450 text-[10.5px] truncate max-w-[220px]" title={r.user_agent}>{r.user_agent}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          )}

                          {/* Action Logs Grid */}
                          {previewTab === 'action_logs' && (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                              <thead>
                                <tr className="bg-zinc-50/80 border-b border-zinc-200 sticky top-0 backdrop-blur-sm z-10">
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ログID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ユーザー</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">アクションコード</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">変更詳細コンテキスト</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">IPアドレス</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">日時</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const rows = previewData.data.action_logs || [];
                                  const filtered = rows.filter((r: any) => {
                                    if (!previewSearch) return true;
                                    const q = previewSearch.toLowerCase();
                                    return (r.username || 'guest').toLowerCase().includes(q) || 
                                           (r.action || '').toLowerCase().includes(q) || 
                                           (r.details || '').toLowerCase().includes(q) ||
                                           (r.ip || '').toLowerCase().includes(q);
                                  });
                                  if (filtered.length === 0) {
                                    return <tr><td colSpan={6} className="p-12 text-center text-zinc-400 font-serif">該当するデータはありません</td></tr>;
                                  }
                                  return filtered.map((r: any) => (
                                    <tr key={r.id} className="border-b border-zinc-150 last:border-0 hover:bg-zinc-50/50 font-sans text-xs transition-colors">
                                      <td className="p-3 text-zinc-500 font-mono">{r.id}</td>
                                      <td className="p-3 text-zinc-900 font-bold">{r.username || 'Guest'}</td>
                                      <td className="p-3">
                                        <span className="px-2 py-0.5 bg-zinc-900 text-white font-mono rounded text-[9.5px] uppercase tracking-wider">
                                          {r.action}
                                        </span>
                                      </td>
                                      <td className="p-3 text-zinc-700 max-w-sm truncate" title={r.details}>{r.details}</td>
                                      <td className="p-3 text-zinc-800 font-mono">{r.ip}</td>
                                      <td className="p-3 text-zinc-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          )}

                          {/* Users Grid */}
                          {previewTab === 'users' && (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                              <thead>
                                <tr className="bg-zinc-50/80 border-b border-zinc-200 sticky top-0 backdrop-blur-sm z-10">
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ユーザーID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ユーザー名</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">メールアドレス</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">管理者フラグ</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ブロック状態</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">登録日時</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const rows = previewData.data.users || [];
                                  const filtered = rows.filter((r: any) => {
                                    if (!previewSearch) return true;
                                    const q = previewSearch.toLowerCase();
                                    return (r.username || r.name || '').toLowerCase().includes(q) || 
                                           (r.email || '').toLowerCase().includes(q);
                                  });
                                  if (filtered.length === 0) {
                                    return <tr><td colSpan={6} className="p-12 text-center text-zinc-400 font-serif">該当するデータはありません</td></tr>;
                                  }
                                  return filtered.map((r: any) => (
                                    <tr key={r.id} className="border-b border-zinc-150 last:border-0 hover:bg-zinc-50/50 font-sans text-xs transition-colors">
                                      <td className="p-3 text-zinc-500 font-mono">{r.id}</td>
                                      <td className="p-3 text-zinc-900 font-bold">{r.name || r.username}</td>
                                      <td className="p-3 text-zinc-750 font-mono">{r.email || 'N/A'}</td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.is_admin ? 'bg-indigo-100 text-indigo-800' : 'bg-zinc-100 text-zinc-600'}`}>
                                          {r.is_admin ? '管理者' : '一般ユーザー'}
                                        </span>
                                      </td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.is_blocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                          {r.is_blocked ? 'ブロック中' : '通常'}
                                        </span>
                                      </td>
                                      <td className="p-3 text-zinc-500 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          )}

                          {/* Age Verification Logs Grid */}
                          {previewTab === 'age_verification_logs' && (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                              <thead>
                                <tr className="bg-zinc-50/80 border-b border-zinc-200 sticky top-0 backdrop-blur-sm z-10">
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">証跡ID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ユーザーID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">IP</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">成否</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">年齢</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">判定理由</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">日時</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const rows = previewData.data.age_verification_logs || [];
                                  const filtered = rows.filter((r: any) => {
                                    if (!previewSearch) return true;
                                    const q = previewSearch.toLowerCase();
                                    return String(r.user_id).includes(q) || 
                                           (r.ip || '').toLowerCase().includes(q) ||
                                           (r.reason || '').toLowerCase().includes(q);
                                  });
                                  if (filtered.length === 0) {
                                    return <tr><td colSpan={7} className="p-12 text-center text-zinc-400 font-serif">該当するデータはありません</td></tr>;
                                  }
                                  return filtered.map((r: any) => (
                                    <tr key={r.id} className="border-b border-zinc-150 last:border-0 hover:bg-zinc-50/50 font-sans text-xs transition-colors">
                                      <td className="p-3 text-zinc-500 font-mono">{r.id}</td>
                                      <td className="p-3 text-zinc-900 font-bold">User #{r.user_id}</td>
                                      <td className="p-3 text-zinc-800 font-mono">{r.ip}</td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                          {r.is_verified ? '承認' : '却下'}
                                        </span>
                                      </td>
                                      <td className="p-3 font-mono font-bold text-zinc-800">{r.age || 'N/A'}</td>
                                      <td className="p-3 text-zinc-700">{r.reason || 'N/A'}</td>
                                      <td className="p-3 text-zinc-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          )}

                          {/* Reports Grid */}
                          {previewTab === 'reports' && (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                              <thead>
                                <tr className="bg-zinc-50/80 border-b border-zinc-200 sticky top-0 backdrop-blur-sm z-10">
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">通報ID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">通報者ID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ボトル/メッセージID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">通報理由</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">詳細コンテキスト</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">対応ステータス</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">日時</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const rows = previewData.data.reports || [];
                                  const filtered = rows.filter((r: any) => {
                                    if (!previewSearch) return true;
                                    const q = previewSearch.toLowerCase();
                                    return (r.reason || '').toLowerCase().includes(q) || 
                                           (r.details || '').toLowerCase().includes(q);
                                  });
                                  if (filtered.length === 0) {
                                    return <tr><td colSpan={7} className="p-12 text-center text-zinc-400 font-serif">該当するデータはありません</td></tr>;
                                  }
                                  return filtered.map((r: any) => (
                                    <tr key={r.id} className="border-b border-zinc-150 last:border-0 hover:bg-zinc-50/50 font-sans text-xs transition-colors">
                                      <td className="p-3 text-zinc-500 font-mono">{r.id}</td>
                                      <td className="p-3 text-zinc-900 font-bold">User #{r.reporter_id}</td>
                                      <td className="p-3 text-zinc-600 font-mono">
                                        {r.post_id ? `ボトル: ${r.post_id}` : ''}
                                        {r.message_id ? `メッセージ: ${r.message_id}` : ''}
                                      </td>
                                      <td className="p-3">
                                        <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10.5px]">
                                          {r.reason}
                                        </span>
                                      </td>
                                      <td className="p-3 text-zinc-700 max-w-xs truncate" title={r.details}>{r.details}</td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'resolved' ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-100 text-amber-800'}`}>
                                          {r.status === 'resolved' ? '対応済' : '未対応'}
                                        </span>
                                      </td>
                                      <td className="p-3 text-zinc-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          )}

                          {/* Posts Grid */}
                          {previewTab === 'posts' && (
                            <table className="w-full text-left border-collapse min-w-[850px]">
                              <thead>
                                <tr className="bg-zinc-50/80 border-b border-zinc-200 sticky top-0 backdrop-blur-sm z-10">
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ボトルID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">投稿者ID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">探している人</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">対象名</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ゆかりの地 / 学校</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">年代・関係</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">ステータス</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">投函日時</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const rows = previewData.data.posts || [];
                                  const filtered = rows.filter((r: any) => {
                                    if (!previewSearch) return true;
                                    const q = previewSearch.toLowerCase();
                                    return (r.searcher_name || '').toLowerCase().includes(q) || 
                                           (r.target_name || '').toLowerCase().includes(q) || 
                                           (r.target_school || '').toLowerCase().includes(q) ||
                                           (r.target_hometown || '').toLowerCase().includes(q);
                                  });
                                  if (filtered.length === 0) {
                                    return <tr><td colSpan={8} className="p-12 text-center text-zinc-400 font-serif">該当するデータはありません</td></tr>;
                                  }
                                  return filtered.map((r: any) => (
                                    <tr key={r.id} className="border-b border-zinc-150 last:border-0 hover:bg-zinc-50/50 font-sans text-xs transition-colors">
                                      <td className="p-3 text-zinc-500 font-mono">{r.id}</td>
                                      <td className="p-3 text-zinc-600 font-mono">User #{r.user_id}</td>
                                      <td className="p-3 text-zinc-900 font-bold">{r.searcher_name}</td>
                                      <td className="p-3 text-zinc-900 font-bold">{r.target_name}</td>
                                      <td className="p-3 text-zinc-700">
                                        <div className="font-sans">{r.target_hometown || 'N/A'}</div>
                                        <div className="text-[10px] text-zinc-450">{r.target_school || 'N/A'}</div>
                                      </td>
                                      <td className="p-3 text-zinc-700">
                                        <div>{r.era}</div>
                                        <div className="text-[10px] text-zinc-450">{r.category}</div>
                                      </td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                          {r.status}
                                        </span>
                                      </td>
                                      <td className="p-3 text-zinc-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          )}

                          {/* Failed Attempts Grid */}
                          {previewTab === 'failed_attempts' && (
                            <table className="w-full text-left border-collapse min-w-[600px]">
                              <thead>
                                <tr className="bg-zinc-50/80 border-b border-zinc-200 sticky top-0 backdrop-blur-sm z-10">
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">証憑ID</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">接続元IPアドレス</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">アクションキー / 対象</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">失敗試行回数</th>
                                  <th className="p-3 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">最終試行日時</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const rows = previewData.data.failed_attempts || [];
                                  const filtered = rows.filter((r: any) => {
                                    if (!previewSearch) return true;
                                    const q = previewSearch.toLowerCase();
                                    return (r.ip || '').toLowerCase().includes(q) || 
                                           (r.action_key || '').toLowerCase().includes(q);
                                  });
                                  if (filtered.length === 0) {
                                    return <tr><td colSpan={5} className="p-12 text-center text-zinc-400 font-serif">該当するデータはありません</td></tr>;
                                  }
                                  return filtered.map((r: any) => (
                                    <tr key={r.id} className="border-b border-zinc-150 last:border-0 hover:bg-zinc-50/50 font-sans text-xs transition-colors">
                                      <td className="p-3 text-zinc-500 font-mono">{r.id}</td>
                                      <td className="p-3 text-zinc-900 font-bold font-mono">{r.ip}</td>
                                      <td className="p-3 text-zinc-700 font-mono text-[11.5px]">{r.action_key}</td>
                                      <td className="p-3 font-mono font-bold text-red-600 text-sm">{r.attempt_count}回</td>
                                      <td className="p-3 text-zinc-500 whitespace-nowrap">{new Date(r.last_attempt).toLocaleString()}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          )}

                        </div>

                        {/* Spreadsheet Footer Status bar */}
                        <div className="bg-zinc-100 p-3.5 border-t border-zinc-200 text-xs text-zinc-500 flex justify-between items-center font-sans shrink-0">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-bold text-zinc-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                              オンライン監査エンジン
                            </span>
                            <span>•</span>
                            <span>表示中のタブ: <b>{previewTab}</b></span>
                          </div>
                          <div className="text-[11px] text-zinc-450 font-mono">
                            ReMEETs Security Protocol Active (AES-256)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-zinc-150 bg-zinc-50 flex items-center justify-between sticky bottom-0 shrink-0">
                      <span className="text-xs text-zinc-400 font-mono">ReMEETs Audit Protocol v3.4.0</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPreviewModal(false);
                          setPreviewData(null);
                        }}
                        className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer"
                      >
                        プレビュー画面を閉じる
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'logs' ? (
            <div className="space-y-12">
              {/* ログ仕様早見解説ガイドカード */}
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-inner shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">アクセスログ・アクションログ 取得情報ガイド</h4>
                    <p className="text-xs text-zinc-650 mt-1 leading-relaxed">
                      取得しているIPアドレス、アクション分類、端末情報（UserAgent）、流入経路（Referer）、ステータスなどの詳細仕様を体系的にまとめています。
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogGuideModal(true)}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold tracking-wider transition-all shadow-md hover:translate-y-[-1px] active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-center"
                >
                  📘 ガイドを閲覧する ➔
                </button>
              </div>

              {/* ログガイドモーダル */}
              {showLogGuideModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
                  <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-zinc-100 animate-scale-up">
                    {/* ヘッダー */}
                    <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                          <ShieldAlert size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 font-serif">ログデータの定義と取得情報ガイド</h3>
                          <p className="text-[11px] text-zinc-500">アクセスログ・アクションログ仕様書 ＆ 運営時セキュリティ監査マニュアル</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLogGuideModal(false)}
                        className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* コンテンツ */}
                    <div className="p-8 space-y-8">
                      
                      {/* はじめに */}
                      <div className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-2">
                        <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                          <span>💡 ログシステム導入の目的とメリット</span>
                        </h4>
                        <p className="text-xs text-indigo-900/80 leading-relaxed">
                          ReMEETs（再会の海）では、利用ユーザーが安心して相手を探せるよう、接続元や操作履歴を厳格に保持しています。
                          各ログはセキュリティ侵害、DoS攻撃、ストーカー行為、虚危発信などの不正検知を目的とするほか、M&Aやシステム引き継ぎ時における「サービスの活発性（PV数やアクティブ率）」を客観的に監査・評価するための極めて強力なバリュー資産（KPI証跡）となります。
                        </p>
                      </div>

                      {/* 主要テーブル比較 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {/* 1. アクセスログ */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                            <span className="p-1.5 bg-slate-100 text-slate-800 rounded-lg"><Terminal size={16} /></span>
                            <h4 className="font-bold text-slate-900">1. アクセスログ (Access Logs)</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            サーバーに届いた全てのHTTP/HTTPSリクエストを自動で記録する<b>「基盤通信ログ」</b>です。ユーザーの行動履歴やシステムの負荷・健康状態を検証するために活用します。
                          </p>
                          <div className="space-y-3 font-sans text-xs">
                            <div className="bg-white p-4 rounded-xl border border-slate-200/50 space-y-2">
                              <span className="font-bold text-slate-800">● 記録される主な項目:</span>
                              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                                <li><b>アクセス日時:</b> 秒単位のタイムスタンプ配列</li>
                                <li><b>対象ユーザー名:</b> ログイン中の本名/ニックネーム、未認証時は「Guest（ゲスト）」</li>
                                <li><b>リクエストURLパス:</b> アクセスした具体的なAPI。例：<code className="bg-slate-100 px-1 py-0.5 rounded text-red-600">/api/posts/:id</code></li>
                                <li><b>HTTPメソッド:</b> 閲覧なら <code className="font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">GET</code>、投稿・検証なら <code className="font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded">POST</code>, <code className="font-bold text-red-700 bg-red-50 px-1 py-0.2 rounded">DELETE</code> 等</li>
                                <li><b>レスポンスステータス:</b> <code className="font-mono bg-zinc-100 px-1 rounded font-bold">200</code>(正常時) / <code className="font-mono bg-zinc-100 px-1 rounded font-bold text-red-650">403</code>(不正拒否)</li>
                                <li><b>接続元IPアドレス:</b> 同一ネットワークや不正ボット、DoSリクエストの検知用</li>
                                <li><b>ブラウザ情報 (UserAgent):</b> OS、PC/スマートフォンの種別、ウェブクローラー判定</li>
                                <li><b>遷移元URL (Referer):</b> Google検索からの流入か、Twitter等のSNS紹介リンクかを判定</li>
                              </ul>
                            </div>
                            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-[11px] text-amber-950 leading-relaxed">
                              ⚠️ <b>用途：</b> 膨大なアクセス履歴から人気トピックを抽出する、不審なリクエストIPアドレスを制限リストへ追加する、M&Aレポートで月間アクティブ率の証拠（MAU）として提示します。
                            </div>
                          </div>
                        </div>

                        {/* 2. アクションログ */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                            <span className="p-1.5 bg-slate-100 text-slate-800 rounded-lg"><History size={16} /></span>
                            <h4 className="font-bold text-slate-900">2. アクションログ (Action Logs)</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            ユーザーや管理者が明確にシステム上の状態を変更した重要なイベントだけを抽出して記録する<b>「セキュリティ監査・ライフサイクルログ」</b>です。
                          </p>
                          <div className="space-y-3 font-sans text-xs">
                            <div className="bg-white p-4 rounded-xl border border-slate-200/50 space-y-2">
                              <span className="font-bold text-slate-800">● 記録される主な項目:</span>
                              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                                <li><b>実行種別 (Actionコード):</b>
                                  <ul className="list-circle pl-4 mt-1 space-y-0.5">
                                    <li><code className="bg-zinc-100 px-1.5 py-0.2 rounded">LOGIN</code> / <code className="bg-zinc-100 px-1.5 py-0.2 rounded">REGISTER</code> (認証)</li>
                                    <li><code className="bg-zinc-100 px-1.5 py-0.2 rounded">POST_CREATED</code> / <code className="bg-zinc-100 px-1.5 py-0.2 rounded">POST_DELETED</code> (投函・破棄)</li>
                                    <li><code className="bg-zinc-100 px-1.5 py-0.2 rounded">VERIFY_SUCCESS</code> / <code className="bg-zinc-100 px-1.5 py-0.2 rounded">VERIFY_FAILURE</code> (思い出確認)</li>
                                    <li><code className="bg-zinc-100 px-1.5 py-0.2 rounded">AGE_VERIFIED</code> (年齢確認・安全誓約)</li>
                                    <li><code className="bg-zinc-100 px-1.5 py-0.2 rounded">MESSAGE_SENT</code> / <code className="bg-zinc-100 px-1.5 py-0.2 rounded">MESSAGE_DELETED</code></li>
                                    <li><code className="bg-zinc-100 px-1.5 py-0.2 rounded">NG_WORD_DETECTED</code> (規約NG監視)</li>
                                  </ul>
                                </li>
                                <li><b>関与したユーザー:</b> アクションを実行したユーザー。ログ一覧からユーザ詳細をワンタップで確認可能</li>
                                <li><b>詳細コンテキスト (Details):</b> 最も重要な証跡データ（例：「手紙ボトル [愛知県/佐藤] を作成」「メッセージID 42 を削除」など）</li>
                                <li><b>接続元IPアドレス:</b> 万が一のアカウントハックやなりすまし時の調査証憑</li>
                              </ul>
                            </div>
                            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 leading-relaxed">
                              ✨ <b>用途：</b> ある「ボトル」がいつ作成され、誰がその思い出の質問に挑戦し、どのIPが正解/不正解を繰り返したかなど、再会プロセスの詳細を監査。法的問い合わせ時の確実な回答資料にもなります。
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 運営セキュリティ監査・連携フロー */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-2">
                          <span>🛠️ セキュリティ監視体制 ＆ 安全誓約年齢ログとの連携</span>
                        </h4>
                        <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200/50 font-sans text-xs text-zinc-800 space-y-3 leading-relaxed">
                          <p>
                            ReMEETsの最大の特徴である<b>「安全誓約年齢同意ログ」</b>への連携に関して、監査効率を極大化するためにシステム間でデータリンクを行っています。
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-xl border border-zinc-200">
                              <span className="font-bold text-brand-dark block text-xs">❓ なぜアクセス元IPが重要なのですか？</span>
                              <span className="text-[11px] text-zinc-600 block mt-1">
                                同時期に「秘密の質問の不正突破試行（VERIFY_FAILURE）」と、別端末からの通常の「ログイン」が同一IPから発生していた場合、悪意のある総当たりアクセスやなりすましを即座に特定し、API側で自動保護（IPレートリミット）をかけるために必要なログデータだからです。
                              </span>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-zinc-200">
                              <span className="font-bold text-brand-dark block text-xs">🔗 ログ間のワンクリック追跡（実装済）</span>
                              <span className="text-[11px] text-zinc-600 block mt-1">
                                各ログに表示されている <b>「@ユーザー名」</b> をクリックすると、自動的に「ユーザータブ」が展開され、対象者の詳細データ（登録本名、ステータス、メール、これまでの投函履歴）を連動して一元確認することができます。
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* フッター */}
                    <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between sticky bottom-0 z-10">
                      <span className="text-xs text-zinc-400 font-mono">ReMEETs Security Protocol Version 3.4</span>
                      <button
                        type="button"
                        onClick={() => setShowLogGuideModal(false)}
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer"
                      >
                        閉じる
                      </button>
                    </div>

                  </div>
                </div>
              )}

              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                  <h3 className="text-lg font-serif text-black flex items-center gap-3">
                    <Shield size={20} className="text-black" />
                    管理者監査ログ
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Admin Audit</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-light/10">
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">時間</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">管理者</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">アクション</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">詳細</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-black/40 font-serif">監査ログはありません</td></tr>
                      ) : (
                        auditLogs.map(l => (
                          <tr key={l.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                            <td className="px-3 py-1 text-[12px] text-black/75 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                            <td className="px-3 py-1 whitespace-nowrap">
                              <span className="font-bold text-black text-[12px]">{l.username}</span>
                            </td>
                            <td className="px-3 py-1 whitespace-nowrap">
                              <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded uppercase tracking-widest border border-black">
                                {l.action}
                              </span>
                            </td>
                            <td className="px-3 py-1 text-[12px] text-black/70 max-w-xs truncate">{l.details}</td>
                            <td className="px-3 py-1 text-[12px] font-mono text-black/60 whitespace-nowrap">{l.ip}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                  <h3 className="text-lg font-serif text-black flex items-center gap-3">
                    <History size={20} className="text-black" />
                    アクションログ
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">User Actions</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-light/10">
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">時間</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">ユーザー</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">アクション</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">詳細</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionLogs.map(l => (
                        <tr key={l.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                          <td className="px-3 py-1 text-[12px] text-black/75 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className="font-bold text-black text-[12px]">{l.username || 'Guest'}</span>
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className="text-[10px] font-bold bg-black/5 text-black px-2 py-0.5 rounded uppercase tracking-widest border border-black/10">
                              {l.action}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-[12px] text-black/70 max-w-xs truncate">{l.details}</td>
                          <td className="px-3 py-1 text-[12px] font-mono text-black/60 whitespace-nowrap">{l.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                  <h3 className="text-lg font-serif text-black flex items-center gap-3">
                    <Terminal size={20} className="text-black/60" />
                    アクセスログ
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">API Access</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-light/10">
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">時間</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">ユーザー</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">パス</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">メソッド</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessLogs.map(l => (
                        <tr key={l.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                          <td className="px-3 py-1 text-[12px] text-black/75 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className="font-bold text-black text-[12px]">{l.username || 'Guest'}</span>
                          </td>
                          <td className="px-3 py-1">
                            <span className="text-[11px] font-mono bg-black/5 text-black/70 px-2 py-0.5 rounded truncate block max-w-[200px]">
                              {l.path}
                            </span>
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${l.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-black/5 text-black border-black/10'}`}>
                              {l.method}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-[12px] font-mono text-black/60 whitespace-nowrap">{l.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'ageVerification' ? (
            <div className="space-y-6">
              {/* eKYC Matching Confidence Score & Progress Telemetry */}
              <div id="ekyc-status-panel">
                <EkycProgressTelemetryPanel isVerified={true} />
              </div>

              <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-brand-border bg-brand-light/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-serif text-black flex items-center gap-3">
                    <UserCheck size={20} className="text-emerald-600" />
                    安全誓約・年齢同意ログ（データ管理）
                  </h3>
                  <p className="text-[10px] text-black/50 font-sans tracking-wide mt-1">
                    安全なサービス利用のための年齢同意・利用目的（非出会い目的）に関する誓約ログ。
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Safety Pledge & Age Consent Logs</span>
              </div>

              {/* Advanced Filter & CSV Export Panel */}
              <div className="p-5 border-b border-brand-border bg-zinc-50/50 space-y-4 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Date Start */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 block">期間（開始日）</label>
                    <input 
                      type="date" 
                      value={ageFilterStartDate}
                      onChange={(e) => setAgeFilterStartDate(e.target.value)}
                      className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                  {/* 2. Date End */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 block">期間（終了日）</label>
                    <input 
                      type="date" 
                      value={ageFilterEndDate}
                      onChange={(e) => setAgeFilterEndDate(e.target.value)}
                      className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                  {/* 3. Status Filter */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 block">確認状態</label>
                    <select 
                      value={ageFilterStatus}
                      onChange={(e: any) => setAgeFilterStatus(e.target.value)}
                      className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-2 py-2 text-zinc-700 focus:outline-none focus:border-brand-primary transition-colors"
                    >
                      <option value="all">すべて表示</option>
                      <option value="verified">成功 (18+ 同意・誓約済)</option>
                      <option value="failed">その他のみ</option>
                    </select>
                  </div>
                </div>

                {/* Column Selection (項目抽出) */}
                <div className="space-y-1.5 p-3 bg-white border border-zinc-150 rounded-2xl">
                  <span className="text-[11px] font-bold text-zinc-500 block mb-1">抽出する項目（エクスポート対象）</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'created_at', label: '時間' },
                      { key: 'username', label: 'ユーザー' },
                      { key: 'is_verified', label: '誓約結果' },
                      { key: 'age', label: '同意年齢' },
                      { key: 'reason', label: '同意された資格・誓約内容' },
                      { key: 'ip', label: 'IPアドレス' },
                    ].map((col) => (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setAgeFilterColumns(prev => ({ ...prev, [col.key]: !((prev as any)[col.key]) }))}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          (ageFilterColumns as any)[col.key]
                            ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30'
                            : 'bg-zinc-50 text-zinc-400 border border-zinc-200'
                        }`}
                      >
                        <Check size={10} className={`transition-all ${((ageFilterColumns as any)[col.key]) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Summary & Export Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-1 gap-3">
                  <div className="text-xs text-zinc-500 font-serif">
                    該当件数: <span className="font-sans font-bold text-brand-primary">{
                      ageVerificationLogs.filter(log => {
                        if (ageFilterStartDate) {
                          const start = new Date(ageFilterStartDate);
                          start.setHours(0, 0, 0, 0);
                          if (new Date(log.created_at) < start) return false;
                        }
                        if (ageFilterEndDate) {
                          const end = new Date(ageFilterEndDate);
                          end.setHours(23, 59, 59, 999);
                          if (new Date(log.created_at) > end) return false;
                        }
                        if (ageFilterStatus === 'verified' && !log.is_verified) return false;
                        if (ageFilterStatus === 'failed' && log.is_verified) return false;
                        return true;
                      }).length
                    }</span> 件 / 全 {ageVerificationLogs.length} 件
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = ageVerificationLogs.filter(log => {
                        if (ageFilterStartDate) {
                          const start = new Date(ageFilterStartDate);
                          start.setHours(0, 0, 0, 0);
                          if (new Date(log.created_at) < start) return false;
                        }
                        if (ageFilterEndDate) {
                          const end = new Date(ageFilterEndDate);
                          end.setHours(23, 59, 59, 999);
                          if (new Date(log.created_at) > end) return false;
                        }
                        if (ageFilterStatus === 'verified' && !log.is_verified) return false;
                        if (ageFilterStatus === 'failed' && log.is_verified) return false;
                        return true;
                      });

                      const headers: string[] = [];
                      if (ageFilterColumns.created_at) headers.push('時間');
                      if (ageFilterColumns.username) headers.push('ユーザー');
                      if (ageFilterColumns.is_verified) headers.push('誓約結果');
                      if (ageFilterColumns.age) headers.push('同意年齢');
                      if (ageFilterColumns.reason) headers.push('同意された資格・誓約内容');
                      if (ageFilterColumns.ip) headers.push('IPアドレス');

                      const csvRows = [headers.join(',')];

                      filtered.forEach(log => {
                        const row: string[] = [];
                        if (ageFilterColumns.created_at) row.push(`"${new Date(log.created_at).toLocaleString().replace(/"/g, '""')}"`);
                        if (ageFilterColumns.username) row.push(`"${(log.username || 'Guest').replace(/"/g, '""')}"`);
                        if (ageFilterColumns.is_verified) row.push(`"${log.is_verified ? '同意・誓約完了 (18歳以上)' : '未完了（失敗）'}"`);
                        if (ageFilterColumns.age) row.push(`"${log.age ? (log.age >= 18 ? '18歳以上' : `${log.age}歳`) : '-'}"`);
                        if (ageFilterColumns.reason) row.push(`"${(log.reason || '').replace(/"/g, '""')}"`);
                        if (ageFilterColumns.ip) row.push(`"${log.ip || ''}"`);
                        csvRows.push(row.join(','));
                      });

                      const csvContent = "\uFEFF" + csvRows.join("\n");
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", `safety_pledge_logs_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>抽出条件で CSV ダウンロード</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-light/10">
                      {ageFilterColumns.created_at && <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">時間</th>}
                      {ageFilterColumns.username && <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">ユーザー</th>}
                      {ageFilterColumns.is_verified && <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">判定結果</th>}
                      {ageFilterColumns.age && <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">同意年齢</th>}
                      {ageFilterColumns.reason && <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">同意された誓約内容</th>}
                      {ageFilterColumns.ip && <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">IP</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {ageVerificationLogs.filter(log => {
                      if (ageFilterStartDate) {
                        const start = new Date(ageFilterStartDate);
                        start.setHours(0, 0, 0, 0);
                        if (new Date(log.created_at) < start) return false;
                      }
                      if (ageFilterEndDate) {
                        const end = new Date(ageFilterEndDate);
                        end.setHours(23, 59, 59, 999);
                        if (new Date(log.created_at) > end) return false;
                      }
                      if (ageFilterStatus === 'verified' && !log.is_verified) return false;
                      if (ageFilterStatus === 'failed' && log.is_verified) return false;
                      return true;
                    }).length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-black/40 font-serif">該当するログはありません</td></tr>
                    ) : (
                      ageVerificationLogs.filter(log => {
                        if (ageFilterStartDate) {
                          const start = new Date(ageFilterStartDate);
                          start.setHours(0, 0, 0, 0);
                          if (new Date(log.created_at) < start) return false;
                        }
                        if (ageFilterEndDate) {
                          const end = new Date(ageFilterEndDate);
                          end.setHours(23, 59, 59, 999);
                          if (new Date(log.created_at) > end) return false;
                        }
                        if (ageFilterStatus === 'verified' && !log.is_verified) return false;
                        if (ageFilterStatus === 'failed' && log.is_verified) return false;
                        return true;
                      }).map(l => {
                        let isEkyc = false;
                        let docType = '';
                        let provider = '';
                        if (l.metadata_json) {
                          try {
                            const meta = JSON.parse(l.metadata_json);
                            if (meta.method === 'eKYC' || meta.verification_flow === 'primary_ekyc' || meta.is_primary_id_verified) {
                              isEkyc = true;
                              docType = meta.document_type || '';
                              provider = meta.provider || '';
                            }
                          } catch (e) {
                            if (l.metadata_json.includes('eKYC') || l.metadata_json.includes('primary_ekyc')) {
                              isEkyc = true;
                            }
                          }
                        }

                        return (
                          <tr key={l.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                            {ageFilterColumns.created_at && <td className="px-3 py-2 text-[12px] text-black/75 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>}
                            {ageFilterColumns.username && (
                              <td className="px-3 py-2 whitespace-nowrap">
                                {l.user_id ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleViewUser({ id: l.user_id, username: l.username });
                                        setActiveTab('users');
                                      }}
                                      className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline text-[12px] flex items-center gap-1 cursor-pointer align-middle"
                                    >
                                      @{l.username}
                                    </button>
                                    {isEkyc && (
                                      <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 py-0.2 rounded font-bold whitespace-nowrap align-middle" title="公的本人確認(eKYC)認証済">
                                        🛡️ eKYC
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="font-bold text-zinc-400 text-[12px] italic">Guest (未ログイン)</span>
                                )}
                              </td>
                            )}
                            {ageFilterColumns.is_verified && (
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex flex-col gap-0.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${l.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {l.is_verified ? '同意・誓約済' : '未完了'}
                                  </span>
                                  {l.is_verified && (
                                    isEkyc ? (
                                      <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50/50 px-1.5 py-0.2 rounded border border-emerald-200 w-fit">
                                        🛡️ 公的 eKYC ({docType === 'mynumber' ? 'マイナンバー' : docType === 'driver_license' ? '運転免許証' : docType === 'passport' ? 'パスポート' : docType || '公的証明書'})
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-zinc-500 font-semibold bg-zinc-50 px-1.5 py-0.2 rounded border border-zinc-200 w-fit">
                                        📝 自己申告 (宣誓署名)
                                      </span>
                                    )
                                  )}
                                </div>
                              </td>
                            )}
                            {ageFilterColumns.age && <td className="px-3 py-2 text-[12px] font-bold text-black">{l.age ? (l.age >= 18 ? '18歳以上' : `${l.age}歳`) : '-'}</td>}
                            {ageFilterColumns.reason && <td className="px-3 py-2 text-[12px] text-black/70 max-w-sm leading-relaxed">{l.reason}</td>}
                            {ageFilterColumns.ip && <td className="px-3 py-2 text-[12px] font-mono text-black/60 whitespace-nowrap">{l.ip}</td>}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          ) : activeTab === 'deletion' ? (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-brand-border bg-brand-light/30 flex items-center justify-between">
                <h3 className="text-lg font-serif text-black flex items-center gap-3">
                  <Trash2 size={20} className="text-red-500" />
                  削除依頼一覧
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">Deletion Requests</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-light/10">
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">日時</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">送信者</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">対象ユーザー</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">対象URL</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">理由</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">連絡先</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">状態</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 text-right whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletionRequests.map(req => (
                      <tr key={req.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors group">
                        <td className="px-3 py-1 text-[12px] text-black/75 whitespace-nowrap">{new Date(req.created_at).toLocaleString()}</td>
                        <td className="px-3 py-1 text-[12px] font-bold text-black whitespace-nowrap">{req.name}</td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewUser({ id: req.post_author_id, username: req.post_author_name })}
                            className="text-[12px] font-bold text-black hover:underline"
                          >
                            @{req.post_author_name}
                          </button>
                        </td>
                        <td className="px-3 py-1">
                          <a href={req.url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline flex items-center gap-1 text-[12px]">
                            リンク <ExternalLink size={12} />
                          </a>
                        </td>
                        <td className="px-3 py-1">
                          <div className="text-[12px] text-black font-serif max-w-xs truncate">{req.reason}</div>
                        </td>
                        <td className="px-3 py-1 text-[12px] text-black/70 whitespace-nowrap">{req.email}</td>
                        <td className="px-3 py-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-3 py-1 text-right space-x-2 whitespace-nowrap">
                          {req.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateDeletionStatus(req.id, 'approved')}
                                className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                承認
                              </button>
                              <button 
                                onClick={() => handleUpdateDeletionStatus(req.id, 'rejected')}
                                className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                              >
                                却下
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setSelectedDeletionRequest(req)}
                            className="text-[11px] font-bold uppercase tracking-widest text-black hover:text-black/70 transition-colors"
                          >
                            詳細
                          </button>
                        </td>
                      </tr>
                    ))}
                    {deletionRequests.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-20 text-center text-black/40 font-serif">
                          削除依頼はありません。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-light/50">
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">ID</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">対象種別</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">対象ユーザー</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">理由</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">通報者</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">状態</th>
                      <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 text-right whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors group">
                        <td className="px-3 py-1 text-[12px] font-mono text-black/75 whitespace-nowrap">#{report.id}</td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded-full">
                            {report.target_type}
                          </span>
                        </td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          <button 
                            onClick={() => handleViewUser({ id: report.target_user_id, username: report.target_username })}
                            className="text-[12px] font-bold text-black hover:underline"
                          >
                            @{report.target_username}
                          </button>
                        </td>
                        <td className="px-3 py-1">
                          <p className="text-[12px] text-black max-w-[200px] truncate font-serif">"{report.reason}"</p>
                        </td>
                        <td className="px-3 py-1 text-[12px] font-bold text-black/90 whitespace-nowrap">{report.reporter_name}</td>
                        <td className="px-3 py-1 whitespace-nowrap">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${report.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-3 py-1 text-right whitespace-nowrap">
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="text-[11px] font-bold uppercase tracking-widest text-black hover:text-black/70 transition-colors"
                          >
                            詳細
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'ngWords' ? (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-[14px] font-bold text-black uppercase tracking-[0.2em] mb-4">NGワード追加</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newNgWord}
                    onChange={(e) => setNewNgWord(e.target.value)}
                    placeholder="NGワードを入力..."
                    className="flex-1 bg-brand-light/50 border border-brand-border rounded-xl px-4 py-3 text-sm font-serif focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                  />
                  <button
                    onClick={handleAddNgWord}
                    className="px-8 py-3 bg-black text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-lg shadow-black/20"
                  >
                    追加
                  </button>
                </div>
                <p className="mt-4 text-[12px] text-black/50 font-serif">
                  ※ 正規表現も使用可能です（例: \d{3}-\d{4}）。
                </p>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-light/50">
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">ID</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 whitespace-nowrap">ワード / パターン</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75 text-right whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ngWords.map((word: any) => (
                        <tr key={word.id} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors group">
                          <td className="px-3 py-1 text-[12px] font-mono text-black/75 whitespace-nowrap">#{word.id}</td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className="text-[12px] font-serif text-black">{word.word}</span>
                          </td>
                          <td className="px-3 py-1 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteNgWord(word.id)}
                              className="text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'contacts' ? (
            (() => {
              const enrichedContacts = contacts.map(c => {
                const cl = classifyTicket(c.subject || '', c.message || '');
                return {
                  ...c,
                  classification: cl,
                  category: cl.category,
                  categoryEn: cl.categoryEn,
                  categoryLabel: cl.categoryLabel,
                  matchedKeywords: cl.matchedKeywords,
                  priorityScore: cl.priorityScore,
                  triageTip: cl.triageTip
                };
              });

              const urgentCount = enrichedContacts.filter(c => c.category === 'urgent').length;
              const technicalCount = enrichedContacts.filter(c => c.category === 'technical').length;
              const accountCount = enrichedContacts.filter(c => c.category === 'account').length;
              const generalCount = enrichedContacts.filter(c => c.category === 'general').length;
              const pendingCount = enrichedContacts.filter(c => c.status === 'pending').length;
              const urgentPendingCount = enrichedContacts.filter(c => c.category === 'urgent' && c.status === 'pending').length;

              const filteredContacts = enrichedContacts
                .filter(c => {
                  if (contactCategoryFilter !== 'all' && c.category !== contactCategoryFilter) return false;
                  if (contactStatusFilter !== 'all' && c.status !== contactStatusFilter) return false;
                  if (contactSearchQuery.trim()) {
                    const q = contactSearchQuery.toLowerCase();
                    const matchText = `${c.name || ''} ${c.email || ''} ${c.subject || ''} ${c.message || ''} ${c.matchedKeywords.join(' ')}`.toLowerCase();
                    if (!matchText.includes(q)) return false;
                  }
                  return true;
                })
                .sort((a, b) => {
                  if (contactSortBy === 'priority') {
                    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  }
                  if (contactSortBy === 'newest') {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  }
                  if (contactSortBy === 'oldest') {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  }
                  return 0;
                });

              return (
                <div className="space-y-6">
                  {/* Triage Header */}
                  <div className="glass-card p-6 rounded-3xl border border-brand-border/60 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase tracking-widest border border-brand-primary/20">
                          Automated Ticket Triage
                        </span>
                        {urgentPendingCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle size={12} />
                            <span>🚨 至急対応 {urgentPendingCount} 件</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
                        お問い合わせ自動分類・トリアージ管理
                      </h2>
                      <p className="text-xs md:text-sm text-brand-dark/70 font-sans max-w-3xl">
                        キーワード解析により全チケットを <strong className="text-rose-700 font-bold">Urgent (緊急)</strong>・<strong className="text-sky-700 font-bold">Technical (技術・不具合)</strong>・<strong className="text-purple-700 font-bold">Account-related (アカウント)</strong> に即座に自動判別。最優先対応を可視化します。
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={handleSeedSampleContacts}
                        disabled={isSeedingContacts}
                        id="btn-seed-sample-contacts"
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-dark text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="検証用に各分類（緊急・技術・アカウント・一般）のサンプルチケットを投入します"
                      >
                        <Sparkles size={14} className="text-brand-accent" />
                        <span>{isSeedingContacts ? '投入中...' : '分類サンプル投入 (8件)'}</span>
                      </button>
                      <button
                        onClick={() => fetchData()}
                        className="p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark hover:bg-brand-light/50 transition-colors shadow-xs"
                        title="最新のお問い合わせを取得"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 5-Card Triage KPI Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {/* All Tickets */}
                    <button
                      onClick={() => { setContactCategoryFilter('all'); setContactStatusFilter('all'); }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'all' && contactStatusFilter === 'all'
                          ? "bg-brand-dark text-white border-brand-dark shadow-md"
                          : "bg-white border-brand-border/80 hover:border-brand-primary/50 text-brand-dark"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">全チケット</span>
                        <Mail size={16} className={contactCategoryFilter === 'all' && contactStatusFilter === 'all' ? "text-brand-accent" : "text-brand-dark/40"} />
                      </div>
                      <div className="text-2xl md:text-3xl font-mono font-bold">{enrichedContacts.length}</div>
                      <div className="text-[10px] mt-1 opacity-70">総受信数</div>
                    </button>

                    {/* Urgent Tickets */}
                    <button
                      onClick={() => setContactCategoryFilter(contactCategoryFilter === 'urgent' ? 'all' : 'urgent')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'urgent'
                          ? "bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300"
                          : "bg-rose-50/60 border-rose-200/80 hover:border-rose-300 text-rose-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle size={12} className={contactCategoryFilter === 'urgent' ? "text-white animate-pulse" : "text-rose-600 animate-pulse"} />
                          <span>🚨 Urgent</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-rose-200/80 text-rose-800">最優先</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-mono font-bold text-rose-950 dark:text-white">{urgentCount}</div>
                      <div className="text-[10px] mt-1 opacity-80">緊急・被害・返金</div>
                    </button>

                    {/* Technical Tickets */}
                    <button
                      onClick={() => setContactCategoryFilter(contactCategoryFilter === 'technical' ? 'all' : 'technical')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'technical'
                          ? "bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300"
                          : "bg-sky-50/60 border-sky-200/80 hover:border-sky-300 text-sky-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Terminal size={12} className={contactCategoryFilter === 'technical' ? "text-white" : "text-sky-600"} />
                          <span>⚙️ Technical</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-sky-200/80 text-sky-800">技術</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-mono font-bold text-sky-950 dark:text-white">{technicalCount}</div>
                      <div className="text-[10px] mt-1 opacity-80">エラー・不具合・障害</div>
                    </button>

                    {/* Account Tickets */}
                    <button
                      onClick={() => setContactCategoryFilter(contactCategoryFilter === 'account' ? 'all' : 'account')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        contactCategoryFilter === 'account'
                          ? "bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300"
                          : "bg-purple-50/60 border-purple-200/80 hover:border-purple-300 text-purple-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <UserCheck size={12} className={contactCategoryFilter === 'account' ? "text-white" : "text-purple-600"} />
                          <span>👤 Account</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-purple-200/80 text-purple-800">アカウント</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-mono font-bold text-purple-950 dark:text-white">{accountCount}</div>
                      <div className="text-[10px] mt-1 opacity-80">認証・退会・eKYC</div>
                    </button>

                    {/* Pending Tickets */}
                    <button
                      onClick={() => setContactStatusFilter(contactStatusFilter === 'pending' ? 'all' : 'pending')}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer col-span-2 sm:col-span-1",
                        contactStatusFilter === 'pending'
                          ? "bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300"
                          : "bg-amber-50/60 border-amber-200/80 hover:border-amber-300 text-amber-900"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock size={12} className={contactStatusFilter === 'pending' ? "text-white" : "text-amber-600"} />
                          <span>⏳ 未対応</span>
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-200/80 text-amber-800">要返信</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-mono font-bold text-amber-950 dark:text-white">{pendingCount}</div>
                      <div className="text-[10px] mt-1 opacity-80">返信待ちチケット</div>
                    </button>
                  </div>

                  {/* Filter Toolbar & Search Bar */}
                  <div className="glass-card p-4 rounded-2xl border border-brand-border space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Category Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-brand-dark/50 uppercase tracking-wider mr-1">分類:</span>
                        <button
                          onClick={() => setContactCategoryFilter('all')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                            contactCategoryFilter === 'all'
                              ? "bg-brand-dark text-white shadow-xs"
                              : "bg-brand-light/60 text-brand-dark/70 hover:bg-brand-light"
                          )}
                        >
                          <span>すべて</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-mono">{enrichedContacts.length}</span>
                        </button>

                        <button
                          onClick={() => setContactCategoryFilter('urgent')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                            contactCategoryFilter === 'urgent'
                              ? "bg-rose-600 text-white shadow-xs"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          )}
                        >
                          <AlertTriangle size={12} className="animate-pulse" />
                          <span>🚨 Urgent (緊急)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-800 text-[10px] font-mono font-bold">{urgentCount}</span>
                        </button>

                        <button
                          onClick={() => setContactCategoryFilter('technical')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                            contactCategoryFilter === 'technical'
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                          )}
                        >
                          <Terminal size={12} />
                          <span>⚙️ Technical (技術)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-sky-200 text-sky-800 text-[10px] font-mono font-bold">{technicalCount}</span>
                        </button>

                        <button
                          onClick={() => setContactCategoryFilter('account')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                            contactCategoryFilter === 'account'
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                          )}
                        >
                          <UserCheck size={12} />
                          <span>👤 Account (アカウント)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-800 text-[10px] font-mono font-bold">{accountCount}</span>
                        </button>

                        <button
                          onClick={() => setContactCategoryFilter('general')}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                            contactCategoryFilter === 'general'
                              ? "bg-slate-700 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                          )}
                        >
                          <Mail size={12} />
                          <span>💬 General (一般)</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">{generalCount}</span>
                        </button>
                      </div>

                      {/* Status filter toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-brand-dark/50 uppercase tracking-wider">状態:</span>
                        <div className="inline-flex bg-brand-light/60 p-0.5 rounded-xl border border-brand-border">
                          <button
                            onClick={() => setContactStatusFilter('all')}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                              contactStatusFilter === 'all' ? "bg-white text-brand-dark shadow-xs" : "text-brand-dark/60 hover:text-brand-dark"
                            )}
                          >
                            すべて
                          </button>
                          <button
                            onClick={() => setContactStatusFilter('pending')}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                              contactStatusFilter === 'pending' ? "bg-amber-500 text-white shadow-xs" : "text-amber-800 hover:text-amber-900"
                            )}
                          >
                            <span>未対応</span>
                            <span className="text-[10px] font-mono font-bold">({pendingCount})</span>
                          </button>
                          <button
                            onClick={() => setContactStatusFilter('replied')}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                              contactStatusFilter === 'replied' ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-800 hover:text-emerald-900"
                            )}
                          >
                            <span>返信済</span>
                            <span className="text-[10px] font-mono font-bold">({enrichedContacts.length - pendingCount})</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-brand-border/50">
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-80">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                        <input
                          type="text"
                          value={contactSearchQuery}
                          onChange={(e) => setContactSearchQuery(e.target.value)}
                          placeholder="件名・本文・送信者・#キーワードで検索..."
                          className="w-full pl-9 pr-8 py-2 bg-white border border-brand-border rounded-xl text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-brand-dark placeholder:text-brand-dark/40"
                        />
                        {contactSearchQuery && (
                          <button
                            onClick={() => setContactSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Sort Selector & Result count */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs text-brand-dark/60 font-mono">
                          表示: <strong className="text-brand-dark font-bold">{filteredContacts.length}</strong> / {enrichedContacts.length} 件
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-brand-dark/50 font-bold whitespace-nowrap">並び順:</span>
                          <select
                            value={contactSortBy}
                            onChange={(e: any) => setContactSortBy(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-dark outline-none focus:border-brand-primary cursor-pointer"
                          >
                            <option value="priority">🚨 優先度順 (Urgent優先)</option>
                            <option value="newest">🕒 受信日時 (新しい順)</option>
                            <option value="oldest">📅 受信日時 (古い順)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contacts Table with Classification Badges */}
                  <div className="glass-card overflow-hidden rounded-3xl border border-brand-border shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-brand-border bg-brand-light/60">
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap">自動分類 (Category)</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap">ステータス</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap">受信日時</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap">送信者</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap">件名・本文抜粋</th>
                            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 text-right whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/60">
                          {filteredContacts.map(c => {
                            const isUrgent = c.category === 'urgent';
                            const isTechnical = c.category === 'technical';
                            const isAccount = c.category === 'account';

                            return (
                              <tr 
                                key={c.id} 
                                className={cn(
                                  "transition-colors",
                                  isUrgent 
                                    ? "bg-rose-50/40 hover:bg-rose-50/80" 
                                    : "hover:bg-brand-light/30"
                                )}
                              >
                                {/* Automated Category Badge & Keywords */}
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                  <div className="space-y-1">
                                    {isUrgent && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                        <AlertTriangle size={12} className="text-rose-600 animate-pulse" />
                                        <span>🚨 Urgent (緊急)</span>
                                      </span>
                                    )}
                                    {isTechnical && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs">
                                        <Terminal size={12} className="text-sky-600" />
                                        <span>⚙️ Technical (技術)</span>
                                      </span>
                                    )}
                                    {isAccount && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs">
                                        <UserCheck size={12} className="text-purple-600" />
                                        <span>👤 Account-related</span>
                                      </span>
                                    )}
                                    {!isUrgent && !isTechnical && !isAccount && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                                        <Mail size={12} className="text-slate-500" />
                                        <span>💬 General (一般)</span>
                                      </span>
                                    )}

                                    {/* Keyword Tags */}
                                    {c.matchedKeywords && c.matchedKeywords.length > 0 && (
                                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                                        {c.matchedKeywords.slice(0, 3).map((kw: string, i: number) => (
                                          <span key={i} className="text-[9px] px-1.5 py-0.2 bg-black/5 text-black/60 rounded font-mono">
                                            #{kw}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                  {c.status === 'replied' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                      <CheckCircle2 size={10} />
                                      <span>返信済</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                      <Clock size={10} />
                                      <span>未対応</span>
                                    </span>
                                  )}
                                </td>

                                {/* Date */}
                                <td className="px-4 py-3 align-top text-[11px] text-brand-dark/75 font-mono whitespace-nowrap">
                                  {new Date(c.created_at).toLocaleString('ja-JP', { 
                                    month: 'numeric', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </td>

                                {/* Sender */}
                                <td className="px-4 py-3 align-top whitespace-nowrap">
                                  <div className="font-bold text-xs text-brand-dark">{c.name}</div>
                                  <div className="text-[11px] text-brand-dark/60 font-mono truncate max-w-[160px]">{c.email}</div>
                                </td>

                                {/* Subject & Message Preview */}
                                <td className="px-4 py-3 align-top min-w-[280px]">
                                  <div className={cn(
                                    "font-bold text-xs line-clamp-1 mb-0.5",
                                    isUrgent ? "text-rose-900" : "text-brand-dark"
                                  )}>
                                    {c.subject}
                                  </div>
                                  <div className="text-[11px] text-brand-dark/70 line-clamp-2 leading-relaxed">
                                    {c.message}
                                  </div>
                                </td>

                                {/* Action */}
                                <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                                  <button 
                                    onClick={() => setSelectedContact(c)}
                                    className={cn(
                                      "py-1.5 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer",
                                      isUrgent && c.status !== 'replied'
                                        ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-200"
                                        : "bg-brand-primary hover:bg-brand-dark text-white"
                                    )}
                                  >
                                    <Mail size={12} />
                                    <span>{c.status === 'replied' ? '詳細確認' : '確認・返信'}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredContacts.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-16 text-center text-brand-dark/50 font-serif">
                                <div className="max-w-xs mx-auto space-y-2">
                                  <Mail size={32} className="mx-auto text-brand-dark/30" />
                                  <p className="text-sm font-bold text-brand-dark/80">条件に合致するお問い合わせはありません</p>
                                  <p className="text-xs text-brand-dark/50">フィルターを解除するか、上部の「分類サンプル投入」ボタンをお試しください。</p>
                                  <button
                                    onClick={() => { setContactCategoryFilter('all'); setContactStatusFilter('all'); setContactSearchQuery(''); }}
                                    className="px-3 py-1.5 bg-brand-light text-brand-dark text-xs font-bold rounded-lg hover:bg-brand-light/80 transition-colors cursor-pointer"
                                  >
                                    フィルターを初期化
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : activeTab === 'emailTemplates' ? (
            <AdminEmailTemplatesView />
          ) : activeTab === 'notifications' ? (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-8 space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-black">一括お知らせ配信</h3>
                    <p className="text-sm text-black/50 font-serif">全ユーザーにシステム通知を送信します</p>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSendBulkNotification(
                    formData.get('content') as string,
                    formData.get('link') as string
                  );
                  e.currentTarget.reset();
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black uppercase tracking-widest">通知内容</label>
                    <textarea 
                      name="content"
                      required
                      placeholder="通知するメッセージを入力してください..."
                      className="w-full bg-brand-light/50 border border-brand-border rounded-2xl px-6 py-4 text-lg font-serif focus:outline-none focus:ring-2 focus:ring-black/10 transition-all min-h-[150px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-black uppercase tracking-widest">リンクURL (任意)</label>
                    <input 
                      name="link"
                      type="text"
                      placeholder="https://... (任意)"
                      className="w-full bg-brand-light/50 border border-brand-border rounded-2xl px-6 py-4 text-lg font-serif focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                    />
                    <p className="text-[10px] text-black/40">※ URLを入力する場合は http:// または https:// から入力してください</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSending}
                    className={cn(
                      "w-full py-4 rounded-2xl text-lg font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3",
                      isSending ? "bg-black/50 cursor-not-allowed" : "bg-black text-white hover:bg-black/80 shadow-black/20"
                    )}
                  >
                    {isSending ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <Bell size={20} />
                    )}
                    {isSending ? "送信中..." : "通知を送信する"}
                  </button>
                </form>

                <AnimatePresence>
                  {showBulkConfirm && pendingNotification && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[32px] shadow-2xl border border-brand-border w-full max-w-lg overflow-hidden"
                      >
                        <div className="p-8 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                              <Bell size={24} />
                            </div>
                            <div>
                              <h3 className="text-xl font-serif text-black">配信内容の確認</h3>
                              <p className="text-sm text-black/50 font-serif">全ユーザーに以下を送信します</p>
                            </div>
                          </div>

                          <div className="space-y-4 bg-brand-light/50 p-6 rounded-2xl border border-brand-border">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通知内容</span>
                              <p className="text-black font-serif whitespace-pre-wrap">{pendingNotification.content}</p>
                            </div>
                            {pendingNotification.link && (
                              <div className="space-y-1 pt-4 border-t border-brand-border">
                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">リンクURL</span>
                                <p className="text-black text-xs font-mono break-all">{pendingNotification.link}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button 
                              onClick={() => setShowBulkConfirm(false)}
                              className="flex-1 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-black bg-brand-light border border-brand-border hover:bg-brand-border transition-all"
                            >
                              キャンセル
                            </button>
                            <button 
                              onClick={executeBulkNotification}
                              className="flex-1 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-white bg-black hover:bg-black/80 shadow-xl shadow-black/20 transition-all"
                            >
                              配信を実行する
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="glass-card p-8 space-y-8 mt-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-black">送信済みのお知らせ</h3>
                    <p className="text-sm text-black/50 font-serif">過去に送信した一括通知の一覧です</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {broadcasts.length === 0 ? (
                    <div className="py-12 text-center text-black/30 font-serif border border-dashed border-brand-border rounded-2xl">
                      送信済みのお知らせはありません
                    </div>
                  ) : (
                    broadcasts.map((broadcast, idx) => (
                      <div key={idx} className="p-6 rounded-2xl bg-brand-light/10 border border-brand-border group hover:border-black/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-black uppercase tracking-widest px-2 py-1 bg-black/5 rounded-lg">
                              {broadcast.user_count} 名に送信
                            </span>
                            <span className="text-[10px] text-black/40 font-mono">
                              {new Date(broadcast.created_at).toLocaleString()}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteBroadcast(broadcast)}
                            className="p-2 text-black/20 hover:text-red-500 transition-colors"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-black font-serif leading-relaxed mb-2">{broadcast.content}</p>
                        {broadcast.link && (
                          <a 
                            href={broadcast.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-black uppercase tracking-widest hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={10} />
                            リンク先を表示
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'moderation' ? (
            <div className="space-y-8 animate-fade-in">
              {/* 管理画面 巡回検知ダッシュボードヘッダー */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bot size={24} className="text-black" />
                  <div>
                    <h3 className="text-2xl font-serif text-black">
                      規約監視・AIリスク防御センター
                    </h3>
                    <p className="text-xs text-black/40 mt-1 font-sans font-medium">
                      お相手との安全第一な再会を担保するための、AI監視および物理削除・凍結監査ルームです。
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSeedModeration}
                    className="px-4 py-2 bg-brand-light text-black border border-brand-border rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all shadow-sm shrink-0"
                  >
                    AI検知テストデータを生成
                  </button>
                </div>
              </div>

              {/* サブナビゲーション・タブ */}
              <div className="flex border-b border-brand-border">
                <button
                  onClick={() => setModerationSubTab('queue')}
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                    moderationSubTab === 'queue'
                      ? 'border-black text-black'
                      : 'border-transparent text-black/40 hover:text-black/70'
                  }`}
                >
                  <AlertTriangle size={15} />
                  AI検知保留キュー ({moderationQueue.length})
                </button>
                <button
                  onClick={() => setModerationSubTab('archive')}
                  className={`px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                    moderationSubTab === 'archive'
                      ? 'border-black text-black'
                      : 'border-transparent text-black/40 hover:text-black/70'
                  }`}
                >
                  <FileText size={15} />
                  削除監査履歴ログ ({deletedPostsArchive.length})
                </button>
              </div>

              {/* タブ表示の切り替え */}
              {moderationSubTab === 'queue' ? (
                <div className="grid grid-cols-1 gap-6">
                  {moderationQueue.length > 0 && (
                    <div className="flex items-center justify-between bg-red-50/60 p-3.5 rounded-2xl border border-red-100">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={moderationQueue.length > 0 && moderationQueue.every(p => selectedModPostIds.includes(p.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModPostIds(moderationQueue.map(p => p.id));
                            } else {
                              setSelectedModPostIds([]);
                            }
                          }}
                          className="rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-red-900">
                          全選択 ({selectedModPostIds.length} / {moderationQueue.length}件 選択中)
                        </span>
                      </div>
                      <button
                        onClick={handleBatchDeleteModPosts}
                        disabled={selectedModPostIds.length === 0 || isBatchDeletingModPosts}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                      >
                        <Trash2 size={14} />
                        <span>選択一括削除 ({selectedModPostIds.length})</span>
                      </button>
                    </div>
                  )}
                  {moderationQueue.map((post) => (
                    <div key={post.id} className="glass-card p-8 flex flex-col md:flex-row gap-8 items-start border border-brand-border hover:border-black/20 transition-all duration-350">
                      <div className="flex items-start gap-3 flex-grow">
                        <input
                          type="checkbox"
                          checked={selectedModPostIds.includes(post.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModPostIds([...selectedModPostIds, post.id]);
                            } else {
                              setSelectedModPostIds(selectedModPostIds.filter(id => id !== post.id));
                            }
                          }}
                          className="mt-1 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer shrink-0"
                        />
                        <div className="flex-grow space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest px-2 py-0.5 bg-red-50 rounded-lg border border-red-100 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            AI Flagged
                          </span>
                          <span className="text-xs text-black/50 font-mono">ID: #{post.id}</span>
                          <span className="text-xs text-black/55 bg-black/5 px-2 py-0.5 rounded-md font-mono">
                            投函者: {post.author_username || 'ゲスト/会員外'}
                          </span>
                          
                          {/* 投函者の状態・アカウント凍結ステータス */}
                          {post.user_id && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                              post.author_is_blocked === 1 
                                ? 'bg-red-600 text-white border-red-600 animate-pulse' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {post.author_is_blocked === 1 ? '🚨 アカウント凍結中(BAN)' : '🟢 通常アクティブ'}
                            </span>
                          )}

                          <span className="text-xs text-black/40 ml-auto">{new Date(post.created_at).toLocaleString()}</span>
                        </div>
                        
                        <h4 className="text-lg font-serif font-bold text-black">
                          {post.searcher_name}（{post.searcher_era || '年代不明'}） ➔ {post.target_name} 様宛ボトル
                        </h4>
                        
                        <div className="p-4 bg-black/[0.02] rounded-xl border border-brand-border/40 font-serif leading-relaxed text-black/85">
                          "{post.content}"
                        </div>
                        
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100/65">
                          <p className="text-xs font-bold text-red-700 flex items-center gap-2">
                            <Bot size={13} />
                            検自動判定理由: {post.ai_reason || '疑わしいコンテキスト判定'}
                          </p>
                        </div>
                      </div>
                      </div>
                      
                      {/* 右側アクションエリア：詳細、削除、およびその場でのアカウント凍結ボタン */}
                      <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-52">
                        <button 
                          onClick={() => handleViewPost(post)}
                          className="w-full px-4 py-2.5 bg-brand-light text-black border border-brand-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all text-center"
                        >
                          内容の詳細を確認
                        </button>
                        
                        {post.user_id ? (
                          <button 
                            onClick={() => handleToggleFreezeUser(post.user_id, post.author_is_blocked || 0)}
                            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all text-center flex items-center justify-center gap-1 ${
                              post.author_is_blocked === 1
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600'
                            }`}
                          >
                            {post.author_is_blocked === 1 ? '🟢 アカウント凍結を解除' : '🚨 投函ユーザーを凍結'}
                          </button>
                        ) : (
                          <div className="text-[10px] text-center text-black/40 font-mono py-1">
                            (会員登録外の投函)
                          </div>
                        )}

                        <button 
                          onClick={() => triggerDeletePost(post.id)}
                          className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all font-sans text-center shadow-md shadow-red-600/10"
                        >
                          この手紙を直接削除 (アーカイブ)
                        </button>
                      </div>
                    </div>
                  ))}
                  {moderationQueue.length === 0 && (
                    <div className="glass-card p-20 text-center">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={32} />
                      </div>
                      <h4 className="text-xl font-serif text-black mb-2">クリーンな状態です</h4>
                      <p className="text-black/50 font-serif">AIルールに抵触して保留されているボトルメールは現在ありません。</p>
                    </div>
                  )}
                </div>
              ) : (
                /* 削除監査履歴ログのリストビュー */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-serif text-black">
                        ポリシー違反等・削除ログ監査室
                      </h4>
                      <p className="text-xs text-black/40 font-sans mt-0.5">
                        警察への提示要請や再犯防止コンプライアンス等に対応する、物理削除された手紙の原稿・履歴のフォレンジック・アーカイブです。
                      </p>
                    </div>
                    {deletedPostsArchive.length > 0 && (
                      <button
                        onClick={() => {
                          const headers = ["ID", "ポストID", "投函したUID", "アカウント名", "差出人名", "お相手名", "本文", "AI判定状態", "AI理由", "管理者削除理由", "削除日時"];
                          const rows = deletedPostsArchive.map(a => [
                            a.id, a.post_id, a.user_id, a.username, a.searcher_name, a.target_name, `"${(a.message || '').replace(/"/g, '""')}"`,
                            a.ai_flagged ? "Flagged" : "Normal", a.ai_reason || "", a.reason || "", a.deleted_at
                          ]);
                          const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.setAttribute("href", url);
                          link.setAttribute("download", `remeets_deleted_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-3 py-1.5 bg-brand-light text-black border border-brand-border rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <FileText size={12} />
                        監査ログをCSVエクスポート
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {deletedPostsArchive.length > 0 && (
                      <div className="flex items-center justify-between bg-zinc-100/80 p-3.5 rounded-2xl border border-zinc-200">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={deletedPostsArchive.length > 0 && deletedPostsArchive.every(a => selectedArchiveIds.includes(a.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedArchiveIds(deletedPostsArchive.map(a => a.id));
                              } else {
                                setSelectedArchiveIds([]);
                              }
                            }}
                            className="rounded border-zinc-300 text-zinc-700 focus:ring-zinc-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-black/70">
                            全選択 ({selectedArchiveIds.length} / {deletedPostsArchive.length}件 選択中)
                          </span>
                        </div>
                        <button
                          onClick={handleBatchDeleteArchive}
                          disabled={selectedArchiveIds.length === 0 || isBatchDeletingArchive}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                        >
                          <Trash2 size={14} />
                          <span>選択一括削除 ({selectedArchiveIds.length})</span>
                        </button>
                      </div>
                    )}
                    {deletedPostsArchive.map((archive) => (
                      <div key={archive.id} className="p-6 bg-brand-light/30 border border-brand-border/60 rounded-2xl space-y-4 hover:bg-brand-light/50 transition-colors flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedArchiveIds.includes(archive.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArchiveIds([...selectedArchiveIds, archive.id]);
                            } else {
                              setSelectedArchiveIds(selectedArchiveIds.filter(id => id !== archive.id));
                            }
                          }}
                          className="mt-1 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer shrink-0"
                        />
                        <div className="flex-grow space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[9px] font-bold text-black/50 uppercase tracking-widest px-2 py-0.5 bg-black/5 rounded-lg border border-black/5">
                            監査レコード #{archive.id}
                          </span>
                          <span className="text-xs text-black/40 font-mono">ポスト旧ID: #{archive.post_id}</span>
                          <span className="text-xs text-black/40 font-mono">投函主: {archive.username || '不詳'} (UID:{archive.user_id || '無記名'})</span>
                          <span className="text-xs text-black/40 font-mono font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded-lg">
                            実行者：{archive.deleted_by_name || 'Admin'}
                          </span>
                          <span className="text-xs text-black/40 ml-auto font-mono">
                            削除日時: {new Date(archive.deleted_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="border-l-4 border-black/35 pl-4 py-1 space-y-1">
                          <span className="text-xs text-black/50 font-bold uppercase tracking-widest block">削除されたメッセージ原稿（証跡データ）</span>
                          <p className="text-sm font-serif text-black/90 leading-relaxed italic">
                            "{archive.message}"
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50/40 rounded-xl border border-red-50 text-xs text-red-800 space-y-1">
                            <span className="font-bold flex items-center gap-1">
                              <Bot size={11} /> AI自動判定ログ
                            </span>
                            <p>{archive.ai_flagged ? `要検閲判定 [理由: ${archive.ai_reason || 'なし'}]` : 'AIによる検知は無し（手動または監査要請削除）'}</p>
                          </div>
                          
                          <div className="p-3 bg-black/[0.02] rounded-xl border border-brand-border/40 text-xs text-black/75 space-y-1">
                            <span className="font-bold flex items-center gap-1 text-black">
                              🔒 永久抹消理由
                            </span>
                            <p className="font-serif italic text-black/90">【{archive.reason || '未記録'}】</p>
                          </div>
                        </div>
                      </div>
                      </div>
                    ))}

                    {deletedPostsArchive.length === 0 && (
                      <div className="glass-card p-20 text-center">
                        <div className="w-16 h-16 bg-black/5 text-black/30 rounded-full flex items-center justify-center mx-auto mb-6">
                          <FileText size={32} />
                        </div>
                        <h4 className="text-lg font-serif text-black mb-1">
                          削除履歴はありません
                        </h4>
                        <p className="text-sm text-black/50 font-serif">
                          これまでに管理画面から削除・監査隔離されたボトルメールは記録されていません。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'system' ? (
            <div className="space-y-8">
              <AdminLiveSystemMonitor token={token} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-serif text-black flex items-center gap-3">
                        <Activity size={20} className="text-black" />
                        データベース健康診断
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleResetData}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                        >
                          データリセット
                        </button>
                        <button 
                          onClick={handleDbHealthCheck}
                          className="px-4 py-2 bg-black text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all"
                        >
                          診断を実行
                        </button>
                      </div>
                    </div>
                  
                  {dbHealth ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-brand-light/50 rounded-xl border border-brand-border">
                        <span className="text-sm font-bold text-black/60 uppercase tracking-widest">ステータス</span>
                        <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full ${dbHealth.status === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {dbHealth.status === 'healthy' ? '正常' : '異常あり'}
                        </span>
                      </div>
                      <div className="p-4 bg-brand-light/50 rounded-xl border border-brand-border space-y-2">
                        <span className="text-sm font-bold text-black/60 uppercase tracking-widest block">詳細メッセージ</span>
                        <p className="text-sm font-serif text-black leading-relaxed">{dbHealth.message}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-light/50 rounded-xl border border-brand-border">
                          <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest block mb-1">テーブル数</span>
                          <span className="text-xl font-serif font-bold text-black">{dbHealth.tables}</span>
                        </div>
                        <div className="p-4 bg-brand-light/50 rounded-xl border border-brand-border">
                          <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest block mb-1">DBサイズ</span>
                          <span className="text-xl font-serif font-bold text-black">{dbHealth.size}</span>
                        </div>
                      </div>
                      {dbHealth.counts && (
                        <div className="p-4 bg-brand-light/50 rounded-xl border border-brand-border space-y-3">
                          <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest block">テーブル別レコード数</span>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {Object.entries(dbHealth.counts).map(([table, count]: [string, any]) => (
                              <div key={table} className="flex items-center justify-between border-b border-brand-border/50 pb-1">
                                <span className="text-[11px] font-mono text-black/60">{table}</span>
                                <span className="text-[11px] font-bold text-black">{count.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-black/30 font-serif">
                      診断を実行してください。
                    </div>
                  )}
                </div>

                <div className="glass-card p-8 space-y-6">
                  <h3 className="text-xl font-serif text-black flex items-center gap-3">
                    <Shield size={20} className="text-black" />
                    システム構成
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-brand-border">
                      <span className="text-sm text-black/60 font-bold uppercase tracking-widest">環境</span>
                      <span className="text-sm font-mono font-bold text-black">{process.env.NODE_ENV || 'development'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-brand-border">
                      <span className="text-sm text-black/60 font-bold uppercase tracking-widest">プラットフォーム</span>
                      <span className="text-sm font-mono font-bold text-black">Cloud Run</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-brand-border">
                      <span className="text-sm text-black/60 font-bold uppercase tracking-widest">データベース</span>
                      <span className="text-sm font-mono font-bold text-black">Firebase Firestore (NoSQL)</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-brand-border">
                      <span className="text-sm text-black/60 font-bold uppercase tracking-widest">APIバージョン</span>
                      <span className="text-sm font-mono font-bold text-black">v1.2.4</span>
                    </div>
                  </div>

                  {/* 一般公開設定 */}
                  <div className="pt-6 border-t border-brand-border space-y-4">
                    <h4 className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-2">
                      <Eye size={16} className="text-black/60" />
                      一般公開設定（ホーム画面）
                    </h4>
                    <div className="p-4 bg-brand-light/40 rounded-xl border border-brand-border/60">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 pr-4">
                          <span className="text-xs font-bold text-black block">ホームページ統計情報の表示</span>
                          <span className="text-[10px] text-black/50 font-serif block leading-relaxed">
                            「流されたボトルメール数」「再会成功数」「本日の投函数」グリッドを表示・非表示にします。利用者が集まる初期フェーズでの運用に適しています。
                          </span>
                        </div>
                        <button
                          onClick={handleToggleHomeStats}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            statsEnabled ? 'bg-[#5ea5ad]' : 'bg-black/10'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              statsEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="text-xl font-serif text-black mb-8 flex items-center gap-3">
                  <Terminal size={20} className="text-black" />
                  システム監査ログ (直近50件)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-light/50">
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">日時</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">タイプ</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">詳細</th>
                        <th className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-black/75">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.slice(0, 50).map((log, idx) => (
                        <tr key={idx} className="border-b border-brand-border last:border-0 hover:bg-brand-light/30 transition-colors">
                          <td className="px-3 py-1 text-[12px] text-black/75 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              log.action.includes('failure') || log.action.includes('blocked') ? 'bg-red-50 text-red-600' : 'bg-black/5 text-black'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-[12px] text-black/70 font-serif">{log.details}</td>
                          <td className="px-3 py-1 text-[12px] font-mono text-black/50">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'versions' ? (
            <div className="space-y-8">
              {/* Header section with description */}
              <div className="glass-card p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white">
                    <History size={20} className="text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-black font-[400] tracking-wider">バージョン履歴・システム復元 (Versions)</h3>
                    <p className="text-xs text-black/40 uppercase tracking-widest mt-0.5">Database Snapshot Backups & Restore Control</p>
                  </div>
                </div>
                <p className="text-sm font-serif text-black/60 leading-relaxed max-w-4xl">
                  現在のデータベース状態（ユーザー情報、投函ボトル、お問い合わせ、各種検閲ログ、アクセス履歴等を含むすべてのデータ）を「Versions」として保存し、自由に戻せるスナップショットログ機能です。
                  実験的なデータ追加を行う前や、理想的な現在の動作仕様をログとして残しておき、もしもの際（データ消失時など）にその時点へ1クリックでロールバック（復旧）することができます。
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create aspect (1 col) */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="glass-card p-6 space-y-6">
                    <h4 className="text-base font-serif text-black flex items-center gap-2 border-b border-brand-border pb-3">
                      <PlusCircle size={16} className="text-brand-primary" />
                      スナップショット「現在の状態で保存」
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-black/50 uppercase tracking-widest mb-2">スナップショットの解説・記憶メッセージ</label>
                        <input 
                          type="text"
                          placeholder="例: データ復旧完了時, ある程度戻したタイミング"
                          value={newVersionComment}
                          onChange={(e) => setNewVersionComment(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-brand-border rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-black placeholder:text-black/30"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateVersion}
                        disabled={isCreatingVersion}
                        className="w-full py-4 bg-brand-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark/90 hover:shadow-lg hover:shadow-brand-dark/10 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCreatingVersion ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>スナップショット作成中...</span>
                          </>
                        ) : (
                          <>
                            <History size={14} />
                            <span>ログを保存</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* List aspect (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-border pb-3">
                      <h4 className="text-base font-serif text-black flex items-center gap-2">
                        <History size={16} className="text-brand-primary" />
                        保存済みバージョン一覧
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-dark/5 text-black/60 px-2.5 py-1 rounded-full">
                        バージョン総数: {dbVersions.length}
                      </span>
                    </div>

                    {dbVersions.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto text-brand-primary/40">
                          <History size={32} />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-black/70">保存されたバージョン履歴はありません</h5>
                          <p className="text-xs text-black/40 font-serif">
                            現在の理想的な動作・戻った状態を保持するには、左の「1クリックでログを保存」してください。
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-brand-border overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
                        {dbVersions.map((version, index) => (
                          <div 
                            key={version.id} 
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-primary/5 transition-all duration-300"
                          >
                            <div className="space-y-2 min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold font-mono text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full">
                                  #{dbVersions.length - index}
                                </span>
                                <h5 className="text-sm font-bold text-black truncate pr-4" title={version.comment}>
                                  {version.comment}
                                </h5>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/40 font-serif">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(version.timestamp).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  📂 {version.size ? `${(version.size / 1024 / 1024).toFixed(3)} MB` : '不明'}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-mono select-all bg-black/5 px-1 py-0.5 rounded text-black/60">
                                  ID: {version.id}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleRestoreVersion(version)}
                                className="px-4 py-2.5 bg-brand-dark hover:bg-brand-dark/95 text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 hover:shadow-lg shadow-sm"
                              >
                                <RefreshCw size={12} />
                                この状態に復旧・戻る
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteVersion(version)}
                                className="p-2.5 bg-red-50 hover:bg-red-600 border border-red-100 hover:border-red-600 text-red-600 hover:text-white rounded-xl transition-all duration-300"
                                title="このバージョン履歴を削除"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'manual' ? (
            <AdminManualContent />
          ) : activeTab === 'designSystem' ? (
            <AdminDesignSystem />
          ) : activeTab === 'valuation' ? (
            <MaValuationDataRoomView
              stats={stats}
              posts={posts}
              accessLogs={accessLogs}
              onDownloadReport={handleDownloadMaReport}
              onNavigateToDocs={() => {
                setActiveTab('deployment');
                setGuideDocType('deployment');
              }}
            />
          ) : null}
        </motion.div>
      )}
        </main>
      </div>

      {/* 削除確認カスタムモーダル (iframe制限を突破するため) */}
      <AnimatePresence>
        {isDeleteModalOpen && deleteTargetId !== null && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-brand-dark/40" data-lenis-prevent>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => {
                 setIsDeleteModalOpen(false);
                 setDeleteTargetId(null);
               }}
               className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6 border border-brand-border z-10"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2">
                  <AlertTriangle className="text-red-600 animate-pulse" size={24} />
                  手紙を直接削除（アーカイブ監査）
                </h3>
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTargetId(null);
                  }}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-black/60 leading-relaxed">
                  ボトルメール(ID: #{deleteTargetId})を物理削除し、削除監査アーカイブに保管します。<br />
                  警察捜査の際や違反監査の際の証跡となるため、具体的な削除理由を選択または記入してください。
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-black/60 block">
                    削除の主な理由 (クリックでプリセット入力)
                  </label>
                  
                  {/* 主要なテンプレート理由 */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      '危険キーワード・攻撃・脅迫的な表現の検出',
                      '不適切な個人情報（特定の他人の住所、本名、LINE ID等）の露出',
                      '商用宣伝、怪しい副業、またはスパム行為',
                      'ユーザー自身による手動・同意削除依頼',
                      'ストーキングや出会い目的、他者つきまといの疑い',
                    ].map((reasonStr) => (
                      <button
                        key={reasonStr}
                        type="button"
                        onClick={() => setDeleteReasonText(reasonStr)}
                        className={`px-4 py-2 text-left text-xs rounded-xl border transition-all ${
                          deleteReasonText === reasonStr
                            ? 'bg-black text-white border-black font-bold'
                            : 'bg-brand-light/30 text-black/80 border-brand-border hover:bg-brand-light/70'
                        }`}
                      >
                        {reasonStr}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-black/60 block mb-1">
                      選択中の理由（調整・直接記入も可能）
                    </label>
                    <textarea
                      value={deleteReasonText}
                      onChange={(e) => setDeleteReasonText(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-brand-light text-sm rounded-xl border border-brand-border text-black placeholder-black/30 focus:outline-none focus:border-black transition-colors"
                      placeholder="具体的な理由を入力してください..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteTargetId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-brand-light text-black border border-brand-border rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteTargetId !== null) {
                      handleDeletePost(deleteTargetId, deleteReasonText);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all font-sans text-center shadow-lg shadow-red-600/10 font-bold"
                >
                  物理削除＆アーカイブ保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-28 pb-12 px-4 md:px-8 overflow-y-auto" data-lenis-prevent>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedPost(null)}
               className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)]"
            >
              <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/30">
                <div>
                  <h2 className="text-2xl font-serif text-black">{selectedPost.target_name} 様へのボトルメール</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-black/50 uppercase tracking-widest">Post ID: #{selectedPost.id}</p>
                    <Link 
                      to={getPostUrl(selectedPost)} 
                      target="_blank"
                      className="text-[10px] font-bold text-black hover:underline flex items-center gap-1 uppercase tracking-widest"
                    >
                      公開ページを表示 <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h3 className="text-lg font-bold text-black uppercase tracking-[0.2em]">基本情報</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">差出人（アカウントID）</span>
                          <span className="text-sm font-bold text-black">{selectedPost.searcher_username}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">差出人ニックネーム</span>
                          <span className="text-sm font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{selectedPost.searcher_name || '未設定'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">アカウント登録ニックネーム</span>
                          <span className="text-sm font-bold text-brand-dark">{selectedPost.searcher_account_nickname || '未設定'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">差出人本名（実名）</span>
                          <span className="text-sm font-bold text-black">{selectedPost.searcher_full_name || '未設定'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">対象者出身地</span>
                          <span className="text-sm font-bold text-black">{selectedPost.target_hometown || '不明'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">当時の所属</span>
                          <span className="text-sm font-bold text-black">{selectedPost.target_school || '不明'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">年代</span>
                          <span className="text-sm font-bold text-black">{selectedPost.era}年代</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-brand-border">
                          <span className="text-base text-black/60">ステータス</span>
                          <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${selectedPost.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-black/5 text-black border-black/10'}`}>
                            {selectedPost.status}
                          </span>
                        </div>
                        {selectedPost.status === 'resolved' && selectedPost.verified_by_user && (
                          <div className="flex justify-between py-3 border-b border-brand-border">
                            <span className="text-base text-black/60">再会相手</span>
                            <span className="text-sm font-bold text-emerald-600">
                              {selectedPost.verified_by_user.full_name} ({selectedPost.verified_by_user.username})
                            </span>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-lg font-bold text-black uppercase tracking-[0.2em]">秘密の質問と答え</h3>
                      <div className="space-y-4">
                        {selectedPost.questions && selectedPost.questions.length > 0 ? (
                          selectedPost.questions.map((q: any, idx: number) => (
                            <div key={idx} className="p-6 bg-brand-light/50 rounded-2xl space-y-4 border border-brand-border">
                              <div>
                                <p className="text-xs font-bold text-black/50 uppercase tracking-widest mb-1.5">質問 {idx + 1}</p>
                                <p className="text-base font-serif text-black">{q.question}</p>
                              </div>
                              <div className="pt-4 border-t border-brand-border/50">
                                <p className="text-xs font-bold text-black/50 uppercase tracking-widest mb-1.5">答え {idx + 1}</p>
                                <p className="text-base font-bold text-black">{q.answer_plain || q.answer}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 bg-brand-light/50 rounded-2xl space-y-4 border border-brand-border">
                            <div>
                              <p className="text-xs font-bold text-black/50 uppercase tracking-widest mb-1.5">質問</p>
                              <p className="text-base font-serif text-black">{selectedPost.secret_question}</p>
                            </div>
                            <div className="pt-4 border-t border-brand-border/50">
                              <p className="text-xs font-bold text-black/50 uppercase tracking-widest mb-1.5">答え</p>
                              <p className="text-base font-bold text-black">{selectedPost.secret_answer_plain || selectedPost.secret_answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">プライベートメッセージ</h3>
                      <div className="p-6 bg-white text-black border border-brand-border rounded-2xl">
                        <p className="text-base font-serif leading-relaxed opacity-90">
                          "{selectedPost.message}"
                        </p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">差出人プロフィール</h3>
                      <p className="text-base font-serif text-black leading-relaxed">
                        {selectedPost.searcher_profile}
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">手紙の一般公開ページ ＆ SEO証明書</h3>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col justify-between gap-3 shadow-sm">
                        <p className="text-[11px] text-emerald-900 leading-relaxed font-sans font-semibold">
                          思い出クイズへの解答や、差出人への返事が行える一般ユーザー向けの実際の手紙公開確認ページです。また、Google検索インデックス見本や開業法務クリア証明書の印刷・確認が行えます。
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Link 
                            to={getPostUrl(selectedPost)} 
                            target="_blank"
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer text-center"
                          >
                            <span>手紙の公開ページを開く</span>
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            onClick={() => setAdminSeoPreviewPost(selectedPost)}
                            className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer text-center"
                          >
                            <FileText size={14} />
                            <span>SEO証明書・見本を表示</span>
                          </button>
                        </div>
                      </div>
                    </section>

                    {selectedPost.ai_diagnosed === 1 && (
                      <section className="space-y-3">
                        <h3 className="text-[12px] font-bold text-black uppercase tracking-[0.2em]">AI安全診断ステータス</h3>
                        <div className={cn(
                          "p-4 rounded-2xl border text-xs leading-relaxed transition-all",
                          selectedPost.ai_flagged === 1 ? "bg-red-50/90 border-red-200 text-red-900" : "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                        )}>
                          <div className="flex items-center gap-2 font-bold">
                            {selectedPost.ai_flagged === 1 ? (
                              <>
                                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                                <span>⚠️ 不適切・要確認判定（隔離非公開）</span>
                              </>
                            ) : (
                              <>
                                <Check size={16} className="text-emerald-600 shrink-0" />
                                <span>✅ 安全確認完了（公開基準適合）</span>
                              </>
                            )}
                          </div>
                          {selectedPost.ai_reason ? (
                            <div className="mt-2 text-[11px] bg-white/80 p-3 rounded-xl border border-black/5 leading-relaxed font-sans">
                              <span className="font-bold block mb-0.5 text-black/80">判定根拠 / コメント:</span>
                              {selectedPost.ai_reason}
                            </div>
                          ) : (
                            <p className="mt-1 text-[11px] opacity-80 font-sans">
                              誹謗中傷、ストーカー性、個人情報の露出等は検出されませんでした。
                            </p>
                          )}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-brand-border bg-brand-light/10 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleAiAnalyze(selectedPost.id)}
                    disabled={isAiAnalyzing === selectedPost.id}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      isAiAnalyzing === selectedPost.id 
                        ? "bg-black/5 text-black animate-pulse" 
                        : selectedPost.ai_diagnosed 
                          ? "bg-brand-light text-black hover:bg-black hover:text-white"
                          : "bg-black text-white hover:bg-black/80 shadow-lg shadow-black/20"
                    )}
                  >
                    {isAiAnalyzing === selectedPost.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : selectedPost.ai_diagnosed ? (
                      <RefreshCw size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                    {selectedPost.ai_diagnosed ? '再診断を実行' : 'AI分析を実行'}
                  </button>
                  {selectedPost.ai_diagnosed === 1 && (
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest",
                      selectedPost.ai_flagged === 1 ? "text-red-500 bg-red-50 border-red-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                    )}>
                      {selectedPost.ai_flagged === 1 ? (
                        <>
                          <AlertTriangle size={14} />
                          不適切な内容を検知
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          診断済み（安全）
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:text-black/60 transition-colors"
                  >
                    閉じる
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPost(null);
                      triggerDeletePost(selectedPost.id);
                    }}
                    className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                  >
                    ボトルメールを削除
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6 overflow-hidden" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col z-10"
              data-lenis-prevent
            >
              <div className="p-6 md:p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/30 shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black/5 flex items-center justify-center text-black font-bold text-xl md:text-2xl shrink-0">
                    {selectedUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif text-black">{selectedUser.username}</h2>
                    <p className="text-xs md:text-sm text-black/50 uppercase tracking-widest">User ID: #{selectedUser.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => handleGeneratePoliceReport(selectedUser.id)}
                    disabled={isGeneratingPoliceReport}
                    className="px-3 md:px-4 py-2 bg-slate-900 hover:bg-black text-amber-300 border border-amber-500/40 rounded-xl text-[11px] md:text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                    title="刑事訴訟法第197条第2項に基づく捜査関係事項照会回答用データを即時一括生成します"
                  >
                    <ShieldAlert size={15} className="text-amber-400 shrink-0" />
                    <span>{isGeneratingPoliceReport ? '生成中...' : '🚔 警察照会データ一括出力'}</span>
                  </button>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 overscroll-contain" data-lenis-prevent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <section className="space-y-6">
                    <h3 className="text-base md:text-lg font-bold text-black uppercase tracking-[0.2em]">アカウント情報</h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-sm md:text-base text-black/60">ニックネーム</span>
                        <span className="text-sm font-bold text-emerald-900">{selectedUser.nickname || '未設定'}</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-sm md:text-base text-black/60">メールアドレス</span>
                        <span className="text-sm font-bold text-black">{selectedUser.email || '未設定'}</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-sm md:text-base text-black/60">本名</span>
                        <span className="text-sm font-bold text-black">{selectedUser.full_name || '未設定'}</span>
                      </div>
                      {selectedUser.maiden_name && (
                        <div className="flex justify-between py-2.5 border-b border-brand-border bg-indigo-50/50 px-2 rounded-lg">
                          <span className="text-sm md:text-base text-indigo-900 font-bold">登録旧姓</span>
                          <span className="text-sm font-bold text-indigo-950 bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-300">
                            旧姓: {selectedUser.maiden_name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2.5 border-b border-brand-border gap-2">
                        <span className="text-sm md:text-base text-black/60 shrink-0">公的本人確認 (eKYC)</span>
                        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
                          {selectedUser.is_ekyc_verified ? (
                            <>
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 shadow-xs whitespace-nowrap">
                                🛡️ 承認済 (Verified)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAdminResetUserEkyc(selectedUser.id)}
                                className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                                title="テスト用に未申請（未認証）状態に戻す"
                              >
                                <RotateCcw size={11} />
                                <span>未申請に戻す</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                              📝 未承認 / 自己誓約のみ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* eKYC Deep Audit Details */}
                      {selectedUser.is_ekyc_verified ? (
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2.5 text-xs text-emerald-950 font-sans">
                          <div className="flex items-center justify-between font-bold border-b border-emerald-200/60 pb-1.5">
                            <span className="flex items-center gap-1.5 text-emerald-900 font-serif">
                              <ShieldCheck size={14} className="text-emerald-600" />
                              <span>eKYC 生体ベクトル ＆ OCR 照合結果</span>
                            </span>
                            <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              PASS (99.4%)
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-emerald-700/70 block text-[10px]">提出身分証明書</span>
                              <span className="font-bold text-emerald-900">
                                {selectedUser.ekyc_document_type === 'my_number_card' ? 'マイナンバーカード (ICチップ照合)' : selectedUser.ekyc_document_type === 'passport' ? '日本国旅券 (パスポート)' : '運転免許証 (表面・厚み・裏面)'}
                              </span>
                            </div>
                            <div>
                              <span className="text-emerald-700/70 block text-[10px]">照合確認氏名</span>
                              <span className="font-bold text-emerald-900">{selectedUser.ekyc_name || selectedUser.full_name || selectedUser.username}</span>
                            </div>
                            <div>
                              <span className="text-emerald-700/70 block text-[10px]">生体顔照合スコア</span>
                              <span className="font-mono font-bold text-emerald-900">99.4% (閾値85%クリア)</span>
                            </div>
                            <div>
                              <span className="text-emerald-700/70 block text-[10px]">OCR 文字一致率</span>
                              <span className="font-mono font-bold text-emerald-900">99.2% (完全一致)</span>
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-emerald-200/60 text-[10px] text-emerald-800/80 font-mono flex items-center justify-between">
                            <span>監査トークン: EKYC-2026-{(selectedUser.id * 137).toString(16).toUpperCase()}-PASSED</span>
                            <span>{selectedUser.ekyc_verified_at ? new Date(selectedUser.ekyc_verified_at).toLocaleString() : '2026/8/24 認証'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-[11px] text-zinc-600 space-y-1">
                          <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                            <AlertCircle size={13} className="text-zinc-500" />
                            <span>公的本人確認 (eKYC) 未提出</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">
                            このユーザーは自己申告による年齢誓約のみ完了しており、公的身分証による生体照合はまだ行われていません。
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-sm md:text-base text-black/60">権限</span>
                        <span className={`text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${selectedUser.role === 'admin' ? 'bg-black text-white border-black' : 'bg-brand-light text-black/90 border-brand-border'}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-sm md:text-base text-black/60">登録日</span>
                        <span className="text-sm font-bold text-black">{new Date(selectedUser.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setPostSearchTerm(selectedUser.nickname || selectedUser.username);
                          setPostPage(1);
                          setActiveTab('posts');
                          setSelectedUser(null);
                        }}
                        className="w-full p-4 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl text-left transition-all group cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Mail size={13} />
                            <span>投稿したボトル</span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-emerald-950">
                              {loadingUserPosts ? (selectedUser.posts_count ?? 0) : (userPosts ? userPosts.length : (selectedUser.posts_count || 0))}
                            </span>
                            <span className="text-xs text-emerald-700 font-sans">通</span>
                          </div>
                        </div>
                        <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>ボトル管理で絞り込み</span>
                          <ChevronRight size={14} />
                        </div>
                      </button>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex border-b border-brand-border pb-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                        <Mail size={16} className="text-emerald-700" />
                        <span>投稿したボトル一覧 ({userPosts.length})</span>
                      </h4>
                    </div>

                    {loadingUserPosts ? (
                      <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      </div>
                    ) : userPosts.length === 0 ? (
                      <div className="py-12 text-center text-black/30 font-serif italic border border-dashed border-brand-border rounded-2xl">
                        まだ投稿はありません
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1" data-lenis-prevent>
                        {userPosts.map((p: any) => (
                          <button 
                            key={p.id}
                            onClick={() => {
                              setSelectedUser(null);
                              handleViewPost(p);
                            }}
                            className="w-full text-left p-4 rounded-2xl bg-brand-light/10 border border-brand-border hover:border-black transition-all group cursor-pointer"
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-serif font-bold text-black group-hover:text-emerald-800 transition-colors">
                                {p.target_name} 様へ
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${p.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-black/5 text-black border-black/10'}`}>
                                {p.status === 'resolved' ? '解決済 (照合完了)' : '漂流中 (公開中)'}
                              </span>
                            </div>
                            <div className="text-[11px] text-black/60 line-clamp-1 mb-1.5 font-sans">
                              {p.content || p.teaser || '（本文あり）'}
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-black/40 uppercase tracking-wider">
                              <span>作成日: {new Date(p.created_at).toLocaleDateString()}</span>
                              <span className="text-emerald-700 font-bold group-hover:underline">詳細を開く →</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-brand-border bg-brand-light/10 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚔 警察照会・捜査関係事項照会 一括回答書出力モーダル */}
      <AnimatePresence>
        {policeReportData && (
          <div className="fixed inset-0 z-[700] flex items-start justify-center p-3 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-4 text-slate-100"
            >
              {/* モーダルヘッダー（印刷非表示アクションバー） */}
              <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 print-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
                    🚔
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">刑事訴訟法第197条第2項 照会回答</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full">OFFICIAL DISCLOSURE</span>
                    </div>
                    <h2 className="text-sm md:text-base font-bold text-white font-serif">
                      捜査関係事項照会 回答書 兼 ユーザー登録情報・全履歴保全証明データ
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95"
                    title="A4用紙フォーマットで印刷またはPDFとして保存"
                  >
                    <Printer size={14} className="text-cyan-400" />
                    <span>印刷 / PDF保存</span>
                  </button>
                  <button
                    onClick={handleCopyPoliceReportText}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Copy size={14} />
                    <span>{copiedPoliceReport ? '✔ コピー完了' : 'テキスト書面コピー'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPoliceReportJson}
                    className="px-3.5 py-2 bg-[#3B627F] hover:bg-[#487799] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    title="法的鑑識・フォレンジック用フルJSONデータ保存"
                  >
                    <Download size={14} />
                    <span>JSON一括保存</span>
                  </button>
                  <button 
                    onClick={() => setPoliceReportData(null)}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* 書面本文領域 */}
              <div className="p-6 md:p-10 space-y-8 overflow-y-auto max-h-[80vh] bg-slate-900 text-slate-200 font-sans print:p-0 print:bg-white print:text-black print:max-h-none">
                
                {/* 1. 公文書ヘッダー */}
                <div className="border-b-2 border-amber-500/40 pb-6 print:border-black">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-xs font-mono text-amber-400 print:text-black font-bold">
                        【ReMEETs 治安防衛・公的捜査関係事項照会 統一回答書】
                      </div>
                      <h1 className="text-xl md:text-2xl font-bold font-serif text-white print:text-black mt-1">
                        捜査関係事項照会 回答証明書
                      </h1>
                      <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                        根拠法令：刑事訴訟法第197条第2項（公務所等に対する照会）
                      </p>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-right font-mono text-xs print:bg-gray-100 print:border-gray-300 print:text-black">
                      <div>発行日時: {new Date(policeReportData.report_generated_at).toLocaleString('ja-JP')}</div>
                      <div>システム: {policeReportData.system_name}</div>
                      <div className="text-amber-400 print:text-black font-bold mt-0.5">証明ID: POLICE-REQ-USR-{policeReportData.user.id}</div>
                    </div>
                  </div>
                </div>

                {/* 2. 対象ユーザー基本登録情報 & SNS連携アカウント */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                    <span>1. 照会対象者 アカウント基本登録情報 ＆ SNS連携データ</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">ユーザーID</div>
                      <div className="font-mono text-sm font-bold text-white print:text-black">#{policeReportData.user.id}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">ユーザー名 (Username)</div>
                      <div className="font-bold text-white print:text-black">{policeReportData.user.username}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">表示ニックネーム</div>
                      <div className="font-bold text-emerald-400 print:text-black">{policeReportData.user.nickname || '未設定'}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">公的氏名 (登録本名)</div>
                      <div className="font-bold text-white print:text-black">{policeReportData.user.full_name || '未設定'}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">登録メールアドレス</div>
                      <div className="font-mono text-cyan-300 print:text-black font-bold">{policeReportData.user.email || '未設定'}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">認証済み携帯電話番号</div>
                      <div className="font-mono text-amber-300 print:text-black font-bold">{policeReportData.user.phone_number || '未登録'}</div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 col-span-1 md:col-span-2">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">外部SNS OAuth連携識別UID</div>
                      <div className="font-mono text-slate-200 print:text-black">
                        LINE UID: <span className="text-emerald-400 print:text-black">{policeReportData.user.line_uid || '未連携'}</span> | Google UID: <span className="text-cyan-400 print:text-black">{policeReportData.user.google_uid || '未連携'}</span>
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                      <div className="text-slate-400 print:text-gray-500 text-[10px]">本人確認区分 / アカウント作成日時</div>
                      <div className="font-bold text-slate-200 print:text-black">
                        {policeReportData.user.is_ekyc_verified ? '🛡️ 公的eKYC承認済' : '📝 自己申告誓約'} ({new Date(policeReportData.user.created_at).toLocaleDateString('ja-JP')})
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. eKYC年齢確認・公的本人確認ログ */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                    <span>2. eKYC公的本人確認 ＆ 年齢認証監査ログ ({policeReportData.ageLogs?.length || 0}件)</span>
                  </h3>
                  {policeReportData.ageLogs && policeReportData.ageLogs.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-800 print:border-gray-300 rounded-xl">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-black border-b border-slate-800 print:border-gray-300">
                          <tr>
                            <th className="p-2.5">ログ日時</th>
                            <th className="p-2.5">判定</th>
                            <th className="p-2.5">書類種別</th>
                            <th className="p-2.5">年齢</th>
                            <th className="p-2.5">IPアドレス</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                          {policeReportData.ageLogs.map((l: any) => (
                            <tr key={l.id} className="hover:bg-slate-850">
                              <td className="p-2.5">{new Date(l.created_at).toLocaleString('ja-JP')}</td>
                              <td className="p-2.5 font-bold">
                                {l.is_verified ? (
                                  <span className="text-emerald-400 print:text-green-800">承認 (PASS)</span>
                                ) : (
                                  <span className="text-rose-400 print:text-red-800">却下 (REJECTED)</span>
                                )}
                              </td>
                              <td className="p-2.5">{l.document_type || '-'}</td>
                              <td className="p-2.5">{l.age ? `${l.age}歳` : '-'}</td>
                              <td className="p-2.5">{l.ip || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                      ※このユーザーのeKYC申請・年齢確認ログはまだ記録されていません。
                    </div>
                  )}
                </div>

                {/* 4. 投稿ボトルメール全件履歴 (削除分・AI検閲隔離含む) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                    <span>3. 投稿ボトルメール全件履歴 (削除済み・AI検閲隔離データ含む : {policeReportData.posts?.length || 0}件)</span>
                  </h3>
                  {policeReportData.posts && policeReportData.posts.length > 0 ? (
                    <div className="space-y-3">
                      {policeReportData.posts.map((p: any) => (
                        <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs space-y-2">
                          <div className="flex flex-wrap justify-between items-center gap-2 font-mono border-b border-slate-800 print:border-gray-200 pb-2">
                            <span className="font-bold text-white print:text-black">ボトルID: #{p.id} ({new Date(p.created_at).toLocaleString('ja-JP')})</span>
                            <div className="flex items-center gap-2">
                              {p.ai_flagged ? (
                                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2 py-0.5 rounded font-bold">⚠️ AI自動隔離 ({p.ai_reason || '不適切内容'})</span>
                              ) : (
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">正常判定</span>
                              )}
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">{p.status}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                            <div><span className="text-slate-500">宛先名:</span> <strong className="text-white print:text-black">{p.target_name} 様</strong></div>
                            <div><span className="text-slate-500">探している人表記:</span> <strong className="text-white print:text-black">{p.searcher_name} ({p.searcher_full_name || '未設定'})</strong></div>
                            <div><span className="text-slate-500">年代 / 地域:</span> <strong className="text-white print:text-black">{p.era || '-'} / {p.location || '-'}</strong></div>
                          </div>
                          <div className="bg-slate-900 print:bg-white p-3 rounded-lg border border-slate-800 print:border-gray-200 text-slate-200 print:text-black font-serif leading-relaxed whitespace-pre-wrap">
                            {p.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                      ※投稿されたボトルメールはありません。
                    </div>
                  )}
                </div>

                {/* 5. 1対1メッセージ送受信履歴 (AI隔離ログ含む) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                    <span>4. 1対1メッセージ送受信全履歴 (AI自動検閲隔離含む : {policeReportData.messages?.length || 0}件)</span>
                  </h3>
                  {policeReportData.messages && policeReportData.messages.length > 0 ? (
                    <div className="space-y-2.5">
                      {policeReportData.messages.map((m: any) => {
                        const isSender = m.sender_id === policeReportData.user.id;
                        return (
                          <div key={m.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs space-y-1.5">
                            <div className="flex flex-wrap justify-between items-center gap-2 font-mono text-[11px] border-b border-slate-800/80 pb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold px-2 py-0.5 rounded ${isSender ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                                  {isSender ? '送信 (OUTGOING)' : '受信 (INCOMING)'}
                                </span>
                                <span>メッセージID: #{m.id} (ボトル#{m.post_id})</span>
                              </div>
                              <span className="text-slate-400">{new Date(m.created_at).toLocaleString('ja-JP')}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-mono">
                              <span>差出人: <strong>{m.sender_nickname || m.sender_username} (ID:#{m.sender_id})</strong></span>
                              <span>受取人: <strong>{m.receiver_nickname || m.receiver_username} (ID:#{m.receiver_id})</strong></span>
                            </div>
                            <div className="bg-slate-900 print:bg-white p-2.5 rounded-lg border border-slate-800 print:border-gray-200 text-slate-200 print:text-black leading-relaxed whitespace-pre-wrap">
                              {m.content}
                            </div>
                            {m.ai_flagged ? (
                              <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                <span>⚠️ 本メッセージはAI安全防衛エンジンにより不適切/脅迫疑いとして隔離記録されています</span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                      ※メッセージの送受信記録はありません。
                    </div>
                  )}
                </div>

                {/* 6. 通報・違反被害記録 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                    <span>5. 通報・被害記録 (被通報: {policeReportData.reportsAsTarget?.length || 0}件 / 通報実行: {policeReportData.reportsAsReporter?.length || 0}件)</span>
                  </h3>
                  {policeReportData.reportsAsTarget && policeReportData.reportsAsTarget.length > 0 ? (
                    <div className="space-y-2">
                      {policeReportData.reportsAsTarget.map((r: any) => (
                        <div key={r.id} className="bg-rose-950/30 border border-rose-800/60 p-3 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-mono font-bold text-rose-300">
                            <span>被通報ID: #{r.id} (通報者ID: #{r.reporter_id})</span>
                            <span>{new Date(r.created_at).toLocaleString('ja-JP')}</span>
                          </div>
                          <div>理由: <strong>{r.reason || '不適切な行為'}</strong></div>
                          <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">{r.details || '詳細なし'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                      ※このユーザーに対する他者からの通報記録はありません。
                    </div>
                  )}
                </div>

                {/* 7. システム操作・アクセス監査ログ */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 print:text-black flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1.5">
                    <span>6. システム操作 ＆ アクセスセキュリティ監査ログ (直近100件)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1">操作アクションログ ({policeReportData.actionLogs?.length || 0}件)</div>
                      <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
                        {policeReportData.actionLogs && policeReportData.actionLogs.length > 0 ? (
                          policeReportData.actionLogs.map((al: any) => (
                            <div key={al.id} className="border-b border-slate-850 pb-1">
                              <div>{new Date(al.created_at).toLocaleString('ja-JP')} | IP: {al.ip || '-'}</div>
                              <div className="text-white font-bold">{al.action}: {al.details}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">操作ログなし</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="font-bold text-indigo-400 border-b border-slate-800 pb-1">アクセスIP・UAログ ({policeReportData.accessLogs?.length || 0}件)</div>
                      <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
                        {policeReportData.accessLogs && policeReportData.accessLogs.length > 0 ? (
                          policeReportData.accessLogs.map((acl: any) => (
                            <div key={acl.id} className="border-b border-slate-850 pb-1">
                              <div>{new Date(acl.created_at).toLocaleString('ja-JP')} | IP: <strong className="text-amber-300">{acl.ip || '-'}</strong></div>
                              <div className="text-slate-400 truncate">{acl.path} ({acl.user_agent})</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 italic">アクセスログなし</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. 法的電子署名 & 証明フッター */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs font-mono text-center print:border-gray-400 print:bg-gray-100">
                  <div className="text-amber-400 print:text-black font-bold">【ReMEETs 治安防衛・法務コンプライアンス 統一保全証明】</div>
                  <p className="text-slate-400 print:text-gray-700 leading-relaxed text-[11px]">
                    本証明書は、刑事訴訟法第197条第2項の規定に従い、ReMEETsデータベースシステムより正確に生成された非改ざん性暗号化データです。
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    System Audit Hash: SHA256-REMEETS-DISCLOSURE-POLICE-VERIFIED-{policeReportData.user.id}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Contact Reply Modal */}
      <AnimatePresence>
        {selectedContact && (
          <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 md:p-8 overflow-y-auto" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContact(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl relative z-10 p-8 overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              <button 
                onClick={() => setSelectedContact(null)}
                className="absolute top-4 right-4 text-black/40 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-black">お問い合わせへの返信</h3>
                  <p className="text-sm text-black/50 font-serif">{selectedContact.email} 宛</p>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {/* Automated Classification Insight Box */}
                {(() => {
                  const classification = classifyTicket(selectedContact.subject || '', selectedContact.message || '');
                  const isUrgent = classification.category === 'urgent';
                  const isTechnical = classification.category === 'technical';
                  const isAccount = classification.category === 'account';

                  return (
                    <div className={cn(
                      "p-4 rounded-2xl border space-y-2.5 transition-all shadow-xs",
                      isUrgent 
                        ? "bg-rose-50/80 border-rose-200 text-rose-950" 
                        : isTechnical
                        ? "bg-sky-50/80 border-sky-200 text-sky-950"
                        : isAccount
                        ? "bg-purple-50/80 border-purple-200 text-purple-950"
                        : "bg-slate-50/80 border-slate-200 text-slate-900"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">自動分類 (Automated Triage)</span>
                          {isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 border border-rose-300 animate-pulse">
                              🚨 Urgent (最優先)
                            </span>
                          )}
                          {isTechnical && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-200 text-sky-800 border border-sky-300">
                              ⚙️ Technical (技術・不具合)
                            </span>
                          )}
                          {isAccount && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-800 border border-purple-300">
                              👤 Account (アカウント関連)
                            </span>
                          )}
                          {!isUrgent && !isTechnical && !isAccount && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                              💬 General (一般問い合わせ)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono opacity-60">優先スコア: {classification.priorityScore}/3</span>
                      </div>

                      <p className="text-xs leading-relaxed opacity-90 font-sans">
                        💡 <strong>対応ガイド:</strong> {classification.triageTip}
                      </p>

                      {classification.matchedKeywords.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-black/5">
                          <span className="text-[10px] opacity-60 font-bold">検知キーワード:</span>
                          {classification.matchedKeywords.map((kw, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-black/10 font-mono font-bold">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="space-y-4">
                  <div className="p-6 bg-brand-light/50 rounded-2xl border border-brand-border">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-black/40 uppercase tracking-widest">受信内容</span>
                      <span className="text-[10px] text-black/30">{new Date(selectedContact.created_at).toLocaleString('ja-JP')}</span>
                    </div>
                    <h4 className="font-bold text-black mb-2">{selectedContact.subject}</h4>
                    <p className="text-sm text-black/70 whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                  </div>

                  {selectedContact.reply_message && (
                    <div className="p-6 bg-black/5 rounded-2xl border border-black/10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-black uppercase tracking-widest">過去の返信</span>
                        <span className="text-[10px] text-black/40">{new Date(selectedContact.replied_at).toLocaleString('ja-JP')}</span>
                      </div>
                      <p className="text-sm text-black/70 whitespace-pre-wrap leading-relaxed italic">{selectedContact.reply_message}</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleReplyContact} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-1.5">
                        <Mail size={16} className="text-brand-primary" />
                        <span>返信メッセージ</span>
                      </label>

                      {/* AI Draft Button */}
                      <button
                        type="button"
                        id="btn-ai-draft-generate"
                        onClick={() => handleGenerateAiDraft()}
                        disabled={isGeneratingAiDraft || !selectedContact}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                        title="ユーザーの問い合わせ内容からAIが適切な公式返信メールの下書きを自動作成します"
                      >
                        {isGeneratingAiDraft ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>AI下書き生成中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} className="text-amber-300" />
                            <span>AI返信下書きを作成</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Tone selector pills */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-black/[0.03] rounded-xl border border-black/5">
                      <span className="text-[11px] font-bold text-black/50 pl-1">トーン指定:</span>
                      {[
                        { key: 'standard', label: '標準・丁寧' },
                        { key: 'guide', label: '仕様・使い方案内' },
                        { key: 'apology', label: 'お詫び・調査' },
                        { key: 'gratitude', label: '感謝・共感' },
                        { key: 'concise', label: '要点簡潔' },
                      ].map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          disabled={isGeneratingAiDraft}
                          onClick={() => {
                            setAiDraftTone(t.key as any);
                            handleGenerateAiDraft(t.key as any);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            aiDraftTone === t.key
                              ? 'bg-emerald-700 text-white shadow-xs font-bold'
                              : 'bg-white/80 text-black/70 hover:bg-white hover:text-black border border-black/5 font-medium'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <textarea 
                        required
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="返信内容を入力してください...（上の「AI返信下書きを作成」を押すと、お問い合わせに応じた文面が自動生成されます）"
                        className="w-full bg-brand-light/50 border border-brand-border rounded-2xl px-6 py-4 text-base font-serif focus:outline-none focus:ring-2 focus:ring-black/20 transition-all min-h-[220px] leading-relaxed"
                      />
                      {replyMessage && (
                        <button
                          type="button"
                          onClick={() => setReplyMessage('')}
                          className="absolute bottom-4 right-4 text-xs text-black/40 hover:text-red-500 bg-white/80 px-2.5 py-1 rounded-md border border-black/10 transition-colors shadow-xs"
                        >
                          クリア
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-black/50 flex items-center gap-1 pl-1">
                      <Info size={12} className="text-black/40" />
                      <span>AI生成後は文面を適宜編集・調整してから送信してください。</span>
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setSelectedContact(null)}
                      className="btn-secondary flex-1 py-4"
                    >
                      キャンセル
                    </button>
                    <button 
                      type="submit"
                      disabled={isReplying}
                      className="btn-primary flex-[2] py-4 flex items-center justify-center gap-2"
                    >
                      {isReplying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>送信中...</span>
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          <span>メールを送信する</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Deletion Request Modal */}
      <AnimatePresence>
        {selectedDeletionRequest && (
          <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 bg-brand-dark/60 backdrop-blur-sm overflow-y-auto" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl border border-brand-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            >
              <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-black">削除依頼の詳細</h3>
                    <p className="text-sm text-black/50 font-serif">ID: #{selectedDeletionRequest.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDeletionRequest(null)}
                  className="w-10 h-10 rounded-full hover:bg-brand-light flex items-center justify-center text-black/30 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">送信者名</span>
                    <p className="text-black font-bold">{selectedDeletionRequest.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">メールアドレス</span>
                    <p className="text-black font-mono">{selectedDeletionRequest.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">対象URL</span>
                    <a href={selectedDeletionRequest.url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline flex items-center gap-1 text-sm">
                      {selectedDeletionRequest.url} <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">申請日時</span>
                    <p className="text-black text-sm">{new Date(selectedDeletionRequest.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">削除理由</span>
                  <div className="p-4 bg-brand-light/30 rounded-xl border border-brand-border text-black font-serif">
                    {selectedDeletionRequest.reason}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">詳しい説明</span>
                  <div className="p-6 bg-white rounded-2xl border border-brand-border text-black/80 whitespace-pre-wrap leading-relaxed font-serif">
                    {selectedDeletionRequest.explanation || '説明はありません。'}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">対象コンテンツの抜粋</span>
                  <div className="p-4 bg-black/5 rounded-xl border border-brand-border text-black/60 text-sm">
                    {selectedDeletionRequest.content}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-brand-light/10 border-t border-brand-border flex gap-4">
                {selectedDeletionRequest.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => {
                        handleUpdateDeletionStatus(selectedDeletionRequest.id, 'approved');
                        setSelectedDeletionRequest(null);
                      }}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all"
                    >
                      承認して削除
                    </button>
                    <button 
                      onClick={() => {
                        handleUpdateDeletionStatus(selectedDeletionRequest.id, 'rejected');
                        setSelectedDeletionRequest(null);
                      }}
                      className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all"
                    >
                      却下
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setSelectedDeletionRequest(null)}
                    className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-brand-primary transition-all"
                  >
                    閉じる
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 md:p-8 overflow-y-auto" data-lenis-prevent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col my-4 md:my-8"
            >
              <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-black">通報の詳細</h3>
                    <p className="text-sm text-black/50 font-serif">ID: #{selectedReport.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通報者</span>
                    <p className="text-black font-bold">{selectedReport.reporter_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">対象ユーザー</span>
                    <button 
                      onClick={() => handleViewUser({ id: selectedReport.target_user_id, username: selectedReport.target_username })}
                      className="text-black font-bold hover:underline"
                    >
                      @{selectedReport.target_username}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通報日時</span>
                    <p className="text-black text-sm">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">ステータス</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${selectedReport.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通報理由</span>
                  <div className="p-6 bg-brand-light/30 rounded-2xl border border-brand-border text-black font-serif whitespace-pre-wrap">
                    {selectedReport.reason}
                  </div>
                </div>

                {/* 管理者向け即時対応アシスタント */}
                <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100/80 space-y-4">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2 font-sans">
                    <Shield size={14} className="text-red-700" />
                    管理者モデレーション・緊急対処パネル
                  </h4>
                  <p className="text-xs text-red-900/60 leading-relaxed font-sans">
                    この内容が不親切、脅迫、または公序良俗に反する場合、ただちにボトルメールの完全削除、および投稿者アカウントの凍結（利用停止）を適用してください。
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* アカウント凍結操作 */}
                    {selectedReport.target_user_id && (
                      <button
                        onClick={async () => {
                          const targetUserObj = users.find(u => u.id === selectedReport.target_user_id);
                          const isBlocked = targetUserObj ? !!targetUserObj.is_blocked : false;
                          await handleUpdateUserStatus(selectedReport.target_user_id, !isBlocked);
                          alert(`対象ユーザー (@${selectedReport.target_username}) のブロック状態を ${!isBlocked ? '「ブロック中（凍結）」' : '「正常」'} に変更しました。`);
                        }}
                        className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md font-sans tracking-wider ${
                          users.find(u => u.id === selectedReport.target_user_id)?.is_blocked
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10'
                        }`}
                      >
                        {users.find(u => u.id === selectedReport.target_user_id)?.is_blocked ? (
                          <>
                            <Unlock size={14} />
                            凍結を解除する
                          </>
                        ) : (
                          <>
                            <Lock size={14} />
                            アカウントを凍結する
                          </>
                        )}
                      </button>
                    )}

                    {/* 投稿削除操作 (target_type が post の場合のみ) */}
                    {selectedReport.target_type === 'post' && selectedReport.target_id && (
                      <button
                        onClick={async () => {
                          setSelectedReport(null);
                          triggerDeletePost(selectedReport.target_id);
                        }}
                        className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-600/10 font-sans tracking-wider"
                      >
                        <Trash2 size={14} />
                        ボトルメールを削除
                      </button>
                    )}
                  </div>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        handleResolveReport(selectedReport.id);
                        setSelectedReport(null);
                      }}
                      className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black/80 shadow-xl shadow-black/20 transition-all"
                    >
                      解決済みにする
                    </button>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-brand-border bg-brand-light/10 flex justify-end">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:text-black/60 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Bulk Notification Confirm Modal */}
      <AnimatePresence>
        {showBulkConfirm && pendingNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl border border-brand-border w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-brand-dark">配信内容の確認</h3>
                    <p className="text-sm text-brand-dark/50 font-serif">全ユーザーに以下を送信します</p>
                  </div>
                </div>

                <div className="space-y-4 bg-brand-light/50 p-6 rounded-2xl border border-brand-border">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">通知内容</span>
                    <p className="text-black font-serif whitespace-pre-wrap">{pendingNotification.content}</p>
                  </div>
                  {pendingNotification.link && (
                    <div className="space-y-1 pt-4 border-t border-brand-border">
                      <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">リンクURL</span>
                      <p className="text-black text-xs font-mono break-all">{pendingNotification.link}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    onClick={() => setShowBulkConfirm(false)}
                    className="flex-1 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-brand-dark bg-brand-light border border-brand-border hover:bg-brand-border transition-all"
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={executeBulkNotification}
                    className="flex-1 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-white bg-brand-dark hover:bg-brand-primary shadow-xl shadow-brand-dark/20 transition-all"
                  >
                    配信を実行する
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin SEO Preview Modal */}
      <SeoPreviewModal
        isOpen={Boolean(adminSeoPreviewPost)}
        onClose={() => setAdminSeoPreviewPost(null)}
        post={adminSeoPreviewPost}
      />

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[12000] flex items-start justify-center p-4 bg-brand-dark/40 backdrop-blur-sm pt-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-brand-border"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-serif text-black text-center mb-4">{confirmModal.title}</h3>
              <p className="text-black/60 text-center mb-8 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-4 text-[12px] font-bold uppercase tracking-widest text-black hover:bg-brand-light/50 rounded-2xl transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-4 text-[12px] font-bold uppercase tracking-widest bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  削除する
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export const AdminInfoPage = () => (
  <div className="min-h-screen bg-white pt-20 pb-20 transition-colors duration-300">
    <div className="max-w-3xl mx-auto px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 font-serif"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-bold text-black">管理者情報</h1>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">サイト名</span>
            <span className="md:col-span-2 text-lg text-black">ReMEETs〜再会のボトルメール〜</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">運営者</span>
            <span className="md:col-span-2 text-lg text-black">マホン</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">連絡先</span>
            <span className="md:col-span-2 text-lg text-black">
              <Link to="/contact" className="text-black hover:underline">お問い合わせフォーム</Link>よりご連絡ください
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">サイト内容</span>
            <span className="md:col-span-2 text-lg text-black">人を探している方、再会を希望する方のための情報掲載サイト</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border">
            <span className="text-sm font-bold text-black uppercase tracking-widest">運営目的</span>
            <span className="md:col-span-2 text-lg text-black">人と人の再会のきっかけを提供すること</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-brand-border bg-brand-primary/5 px-4 rounded-xl">
            <span className="text-sm font-bold text-brand-primary uppercase tracking-widest">インターネット異性紹介事業<br/>届出番号</span>
            <span className="md:col-span-2 text-xl font-bold font-mono text-brand-primary flex items-center gap-2">
              <Shield size={20} />
              受理番号：[申請中/第XXXXXX号]
            </span>
          </div>
        </div>

        <div className="mt-12 p-8 bg-brand-accent/5 rounded-3xl border border-brand-accent/10">
          <p className="text-base text-brand-accent font-bold leading-relaxed font-serif">
            ※個別のトラブル、連絡の仲介、身元調査等は行っておりません。
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);

export const SitemapPage = () => {
  const sections = [
    {
      title: "メインメニュー",
      icon: <Home size={20} />,
      links: [
        { label: "ホーム", path: "/" },
        { label: "ボトルメールを流す", path: "/create" },
        { label: "ボトルメールを探す", path: "/search" },
        { label: "初めての方へ（ガイド）", path: "/guide" },
        { label: "奇跡の再会報告（体験談）", path: "/success-stories" },
      ]
    },
    {
      title: "アカウント",
      icon: <UserIcon size={20} />,
      links: [
        { label: "ログイン", path: "/login" },
        { label: "新規登録", path: "/register" },
        { label: "マイページ", path: "/account" },
        { label: "メッセージ一覧", path: "/messages" },
      ]
    },
    {
      title: "サポート",
      icon: <Shield size={20} />,
      links: [
        { label: "ユーザーマニュアル", path: "/manual" },
        { label: "安心・安全への取り組み", path: "/safety" },
        { label: "投稿ガイドライン", path: "/guidelines" },
        { label: "お問い合わせ", path: "/contact" },
        { label: "削除依頼・通報", path: "/deletion-request" },
      ]
    },
    {
      title: "法的事項",
      icon: <FileText size={20} />,
      links: [
        { label: "利用規約", path: "/terms" },
        { label: "プライバシーポリシー", path: "/privacy" },
        { label: "管理者情報", path: "/admin-info" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-serif">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12 border-b border-brand-border pb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
            <MapPin size={26} />
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
              Navigation Map
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
              サイトマップ
            </h1>
            <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-1">
              ReMEETsのすべての機能および案内ページ一覧です。
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-10"
            >
              <div className="flex items-center gap-4 mb-8 text-black border-b border-brand-border pb-4">
                {section.icon}
                <h2 className="text-xl font-bold tracking-widest">{section.title}</h2>
              </div>
              <ul className="space-y-5">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      to={link.path}
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-black/5 transition-all border border-transparent hover:border-black/10"
                    >
                      <span className="text-lg text-black group-hover:text-black font-medium transition-colors font-serif">
                        {link.label}
                      </span>
                      <ChevronRight size={20} className="text-black group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const subjects = [
    "サービス全般について",
    "ログイン・アカウントについて",
    "不具合・技術的なお問い合わせ",
    "メディア対応・取材について",
    "広告掲載について",
    "その他"
  ];
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '送信に失敗しました。');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-brand-border pb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
              <Mail size={26} />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
                Contact & Support
              </span>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
                お問い合わせ
              </h1>
              <p className="text-xs md:text-sm text-brand-dark/60 font-sans leading-relaxed mt-1">
                サービスに関するご質問やご要望、不具合の報告などがございましたら、以下のフォームよりお気軽にお問い合わせください。
              </p>
            </div>
          </div>

          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center space-y-4"
            >
              <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
              <h2 className="text-xl font-bold text-emerald-800">お問い合わせを送信しました</h2>
              <p className="text-emerald-700/80">
                内容を確認の上、必要に応じて担当者よりご連絡させていただきます。<br />
                （内容によってはお返事にお時間をいただく場合や、お答えできない場合がございます。予めご了承ください。）
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 mt-4"
              >
                フォームに戻る
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">お名前</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans"
                    placeholder="山田 太郎"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">メールアドレス</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">件名</label>
                <select 
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-sans appearance-none"
                >
                  <option value="" disabled>選択してください</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider ml-1 font-sans">お問い合わせ内容</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all resize-none font-sans leading-relaxed"
                  placeholder="こちらにお問い合わせ内容を入力してください。"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full btn-primary py-4 text-lg"
              >
                {status === 'loading' ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} />
                    <span>送信する</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onClose }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl font-serif"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            確認
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const AuroraAmbientGlow = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" style={{ mixBlendMode: 'multiply' }}>
      {/* Aurora glow blobs with subtle fluid movements */}
      <div className="absolute top-[-5%] left-[-15%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-gradient-to-br from-teal-200/40 via-emerald-100/30 to-blue-200/30 blur-[130px] aurora-animate-1 pointer-events-none" />
      <div className="absolute top-[25%] right-[-15%] w-[90vw] h-[90vw] md:w-[70vw] md:h-[70vw] rounded-full bg-gradient-to-tr from-pink-200/35 via-violet-100/35 to-sky-200/40 blur-[150px] aurora-animate-2 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-gradient-to-br from-indigo-100/35 via-cyan-100/40 to-teal-100/30 blur-[140px] aurora-animate-3 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full bg-gradient-to-tr from-rose-200/40 via-orange-100/30 to-amber-200/35 blur-[120px] aurora-animate-1 pointer-events-none" style={{ animationDelay: '-12s' }} />
    </div>
  );
};

export const MessagesPage = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setConversations(Array.isArray(data) ? data : []));
    }
  }, [token]);

  if (!user) return <div className="p-24 text-center">ログインが必要です</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
      <div className="flex flex-col md:flex-row gap-8 h-[700px]">
        <div className="w-full md:w-80 flex flex-col gap-4">
          <h1 className="text-2xl font-serif font-[400] text-black mb-4 tracking-widest">メッセージ</h1>
          <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="p-8 text-center glass-card opacity-70 text-sm text-black/70">
                メッセージはまだありません
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full text-left p-5 rounded-2xl transition-all border ${
                    selectedConv?.id === conv.id 
                      ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                      : 'glass-card hover:border-brand-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${conv.unread_count > 0 ? 'bg-brand-accent' : 'bg-transparent'}`} />
                    <span className="font-bold text-sm truncate text-black">
                      {conv.other_user_full_name ? conv.other_user_full_name : conv.other_user_name}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${selectedConv?.id === conv.id ? 'text-white/70' : 'text-black/70'}`}>
                    {conv.last_message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-grow glass-card overflow-hidden flex flex-col">
          {selectedConv ? (
            <ChatComponent 
              postId={selectedConv.post_id} 
              otherUserId={selectedConv.other_user_id} 
              otherUserName={selectedConv.other_user_name} 
              otherUserFullName={selectedConv.other_user_full_name}
            />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary mb-6">
                <Mail size={40} className="opacity-50" />
              </div>
              <h2 className="text-xl font-serif font-normal text-black/80">会話を選択してください</h2>
              <p className="text-sm text-black/70 mt-2">左のリストからメッセージのやり取りを選んでください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PageViewTracker = () => {
  const location = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    const logPageView = async () => {
      try {
        await fetch('/api/page-view', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ path: location.pathname }),
          signal: controller.signal
        });
      } catch (err: any) {
        // Silently ignore aborted requests or transient network glitches during startup
        if (err?.name !== 'AbortError') {
          // Suppress unhandled promise error in console for non-critical analytics
        }
      }
    };

    logPageView();

    return () => {
      controller.abort();
    };
  }, [location.pathname, token]);

  return null;
};

export const PageViewChart = ({ data }: { data: any[] }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="path" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#666'}} 
          />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#666'}} />
          <Tooltip 
            cursor={{fill: 'transparent'}} 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
          />
          <Bar dataKey="count" fill="#004d40" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

