import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import PptxGenJS from 'pptxgenjs';
import { 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText, 
  Bot, 
  Key, 
  CreditCard, 
  Mail, 
  Sparkles,
  UserCheck,
  Download,
  Presentation,
  CheckCircle2,
  Lock,
  Radio,
  FileCheck,
  Layers,
  HelpCircle,
  PhoneCall,
  ChevronRight,
  Shield,
  Search,
  AlertTriangle,
  Scale,
  Building2,
  Cpu,
  X
} from 'lucide-react';
import { PolicePresentationSlideViewer } from '../../../components/PolicePresentationSlideViewer';
import { 
  POLICE_PRESENTATION_SLIDES, 
  POLICE_PRESENTATION_SCENARIOS 
} from '../data/policePresentationData';

export const POLICE_DISCLOSURE_TEMPLATE_CONTENT = `令和〇年〇月〇日

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

2. 本人確認 (eKYC) 及び決済情報
・基本認証: LINE Login / Google OAuth 認証済み
・公的本人確認 (eKYC): APPROVED (TRUSTDOCK 照合コード: td_tx_998124 ※任意実施ユーザー)
・氏名（マスキング解除）: 〇〇 〇〇（成年確認済み）
・決済証跡: Stripe Charge ID: ch_xxx (手紙開封料 600円 決済完了)

3. 通信ログ及びアクセス証跡
・直近ログインIPアドレス: 203.0.113.45 (ホスト名: p113045-ipngnfx01.tokyo.ocn.ne.jp)
・アクセス日時: 2026-08-25 19:44:02 JST
・使用ブラウザ (User-Agent): Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)

4. 投函ボトルメール保全データ
・ボトルID: post_7741
・投函日時: 2026-08-21 10:15:30 JST
・AI安全防衛エンジン判定: ai_flagged = 1 (自動隔離・非公開化済み)
・原文抜粋: 【保全ログ別紙添付のとおり】

以上`;

export const LEGAL_SCHEME_TEMPLATE_CONTENT = `ReMEETs サービススキーム及び出会い系サイト規制法非該当性に関する説明書

1. サービスの目的と基本構造
本サービス「ReMEETs」は、過去に面識のあった同級生、恩師、元同僚等の「既知の人物」との健全な再会・感謝の伝達を支援するプラットフォームです。

2. 出会い系サイト規制法（インターネット異性紹介事業）に非該当である理由
(1) 不特定多数の異性交際を斡旋しない
一般的なマッチングアプリと異なり、年齢・容姿・年収等による異性の検索・閲覧機能は一切存在しません。
(2) 二人だけの想い出クイズによる厳格な合意照合
手紙の閲覧および連絡先開示には、差出人と受取人のみが知る「想い出クイズ（共通記憶）」の完全一致が必須であり、見知らぬ第三者が偶然マッチングすることは不可能です。
(3) 連絡先安全引き渡し（セキュア・ブリッジ）完結型モデルの採用
想い出の照合・本人確認後に合意された連絡先（LINE ID等）を安全に引き渡して完結するモデルであり、出会い系サイト規制法第2条第2号に定める「異性交際の機会を提供する役務」には該当いたしません。

3. 安全防衛体制
・Google Gemini AI によるストーカー・脅迫表現のリアルタイム自動隔離（ai_flagged = 1）
・公的本人確認（eKYC）およびSMS携帯電話番号認証の全件実施
・刑訴法197条照会に対するログ開示体制の完備`;

export const AdminPoliceConsultationTab: React.FC = () => {
  // 10大ドキュメント切り替えステート（実務・事前相談作業フロー順）
  const [activeDoc, setActiveDoc] = useState<
    'demo_guide' | 'qa_consult' | 'permit' | 'legal_guide' | 'a4_summary' | 'security_report' | 'slides' | 'scenario' | 'matrix' | 'requirements'
  >('demo_guide');

  const [copied, setCopied] = useState(false);
  const [copiedTpl, setCopiedTpl] = useState(false);
  const [copiedLegalTpl, setCopiedLegalTpl] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isLegalSchemeModalOpen, setIsLegalSchemeModalOpen] = useState(false);
  const [policeStationName, setPoliceStationName] = useState('管轄警察署 生活安全課 御中');
  const [operatorName, setOperatorName] = useState('ReMEETs 運営事務局');
  const [contactInfo, setContactInfo] = useState('info@remeets.jp');

  // 長文Markdown読み込みステート
  const [securityReportMd, setSecurityReportMd] = useState<string>('');
  const [consultFlowMd, setConsultFlowMd] = useState<string>('');
  const [matrixMd, setMatrixMd] = useState<string>('');
  const [scenarioMd, setScenarioMd] = useState<string>('');
  const [legalGuideMd, setLegalGuideMd] = useState<string>('');
  const [permitMd, setPermitMd] = useState<string>('');
  const [requirementsMd, setRequirementsMd] = useState<string>('');
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);

  useEffect(() => {
    const fetchFullDocs = async () => {
      setLoadingDoc(true);
      try {
        const [secRes, conRes, matRes, sceRes, legRes, perRes, reqRes] = await Promise.all([
          fetch('/ReMEETs_Police_Compliance_Guide.md').catch(() => null),
          fetch('/ReMEETs_Police_Consultation_Flow.md').catch(() => null),
          fetch('/ReMEETs_Risk_Mitigation_Matrix.md').catch(() => null),
          fetch('/ReMEETs_Police_Presentation_Scenario.md').catch(() => null),
          fetch('/ReMEETs_Legal_Compliance_Guide.md').catch(() => null),
          fetch('/ReMEETs_Permit_QA_Guide.md').catch(() => null),
          fetch('/ReMEETs_Requirements_Definition.md').catch(() => null),
        ]);

        const decoder = new TextDecoder('utf-8');

        if (secRes && secRes.ok) {
          const buf = await secRes.arrayBuffer();
          setSecurityReportMd(decoder.decode(buf));
        }
        if (conRes && conRes.ok) {
          const buf = await conRes.arrayBuffer();
          setConsultFlowMd(decoder.decode(buf));
        }
        if (matRes && matRes.ok) {
          const buf = await matRes.arrayBuffer();
          setMatrixMd(decoder.decode(buf));
        }
        if (sceRes && sceRes.ok) {
          const buf = await sceRes.arrayBuffer();
          setScenarioMd(decoder.decode(buf));
        }
        if (legRes && legRes.ok) {
          const buf = await legRes.arrayBuffer();
          setLegalGuideMd(decoder.decode(buf));
        }
        if (perRes && perRes.ok) {
          const buf = await perRes.arrayBuffer();
          setPermitMd(decoder.decode(buf));
        }
        if (reqRes && reqRes.ok) {
          const buf = await reqRes.arrayBuffer();
          setRequirementsMd(decoder.decode(buf));
        }
      } catch (err) {
        console.error('Failed to load markdown docs:', err);
      } finally {
        setLoadingDoc(false);
      }
    };

    fetchFullDocs();
  }, []);

  // Markdownテキストを解析し、テーブル部分を本物のReact表コンポーネントとして、それ以外をMarkdownとして混在描画するレンダラー
  const renderDocumentContent = (mdText: string) => {
    if (!mdText) return null;

    const lines = mdText.split('\n');
    const sections: Array<{ type: 'markdown' | 'table', content: string | string[] }> = [];
    let currentMdLines: string[] = [];
    let currentTableLines: string[] = [];
    let inTable = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (!inTable) {
          if (currentMdLines.length > 0) {
            sections.push({ type: 'markdown', content: currentMdLines.join('\n') });
            currentMdLines = [];
          }
          inTable = true;
        }
        currentTableLines.push(trimmed);
      } else {
        if (inTable) {
          sections.push({ type: 'table', content: [...currentTableLines] });
          currentTableLines = [];
          inTable = false;
        }
        currentMdLines.push(line);
      }
    });

    if (inTable && currentTableLines.length > 0) {
      sections.push({ type: 'table', content: currentTableLines });
    } else if (currentMdLines.length > 0) {
      sections.push({ type: 'markdown', content: currentMdLines.join('\n') });
    }

    return (
      <div className="space-y-6">
        {sections.map((sec, secIdx) => {
          if (sec.type === 'markdown') {
            return (
              <div key={secIdx} className="prose prose-sm max-w-none text-black font-serif overflow-x-hidden break-words">
                <Markdown components={markdownComponents}>
                  {sec.content as string}
                </Markdown>
              </div>
            );
          }

          // 表の解析と描画
          const tLines = sec.content as string[];
          let headers: string[] = [];
          const rows: string[][] = [];

          tLines.forEach((tLine) => {
            const rawCells = tLine.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
            if (rawCells.every(c => /^:?-+:?$/.test(c) || c.startsWith('---'))) {
              return; // 区切り行スキップ
            }
            if (headers.length === 0) {
              headers = rawCells;
            } else {
              rows.push(rawCells);
            }
          });

          return (
            <div key={secIdx} className="my-6 overflow-x-auto border border-slate-300 rounded-2xl shadow-sm bg-white">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-300 font-serif">
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3.5 font-bold border-r border-slate-200 last:border-r-0 whitespace-nowrap bg-slate-100/90 text-slate-950">
                        {h.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-blue-50/40 transition-colors">
                      {row.map((cell, cIdx) => {
                        // フォーマット整形（太字、改行、コードブロック対応）
                        const linesInCell = cell.split(/<br\s*\/?>/i);
                        return (
                          <td key={cIdx} className="p-3 leading-relaxed border-r border-slate-200/80 last:border-r-0 align-top text-slate-800">
                            {linesInCell.map((lineText, lIdx) => {
                              // **太字** を <strong> に変換して描画
                              const parts = lineText.split(/(\*\*.*?\*\*|`.*?`)/g);
                              return (
                                <React.Fragment key={lIdx}>
                                  {lIdx > 0 && <br />}
                                  {parts.map((part, pIdx) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={pIdx} className="font-bold text-slate-950">{part.slice(2, -2)}</strong>;
                                    }
                                    if (part.startsWith('`') && part.endsWith('`')) {
                                      return <code key={pIdx} className="bg-slate-100 text-[#3B627F] px-1.5 py-0.5 rounded font-mono text-[11px] font-bold border border-slate-200">{part.slice(1, -1)}</code>;
                                    }
                                    return part;
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // Markdownパーサー (公式運営ライブラリ MiscPages.tsx と100%同一のコンポーネント構成)
  const markdownComponents = {
    h1: (props: any) => <h1 className="text-xl md:text-2xl font-bold font-serif mt-8 mb-5 border-b-2 border-black/10 pb-3 text-black tracking-tight" {...props} />,
    h2: (props: any) => <h2 className="text-lg md:text-xl font-bold font-serif mt-6 mb-3 border-b border-black/5 pb-1.5 text-black/95" {...props} />,
    h3: (props: any) => <h3 className="text-base md:text-lg font-bold font-serif mt-4 mb-2 text-black/85" {...props} />,
    p: (props: any) => <p className="text-xs leading-relaxed mb-4 text-black/85 font-sans" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside space-y-1 my-4 pl-4 text-xs text-black/80 font-sans" {...props} />,
    li: (props: any) => <li className="mb-0.5 leading-relaxed" {...props} />,
    table: (props: any) => (
      <div className="overflow-x-auto my-4 border border-brand-border/40 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse text-[11px] md:text-xs" {...props} />
      </div>
    ),
    thead: (props: any) => <thead className="bg-[#487799]/5 text-black border-b border-brand-border font-bold font-serif" {...props} />,
    tbody: (props: any) => <tbody className="divide-y divide-brand-border/10 font-sans" {...props} />,
    tr: (props: any) => <tr className="hover:bg-brand-light/10 transition-colors" {...props} />,
    th: (props: any) => <th className="px-3 py-2 font-semibold text-black" {...props} />,
    td: (props: any) => <td className="px-3 py-2 text-black/75 whitespace-normal break-words" {...props} />,
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = inline ?? !match;
      if (!isInline && match && match[1] === 'html') {
        return (
          <div 
            className="my-6 p-1 bg-white text-slate-900 rounded-3xl border border-slate-200/80 shadow-sm max-w-full overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: String(children) }} 
          />
        );
      }
      return isInline 
        ? <code className="bg-black/5 text-brand-primary px-1 rounded font-mono text-[10px]" {...props}>{children}</code>
        : <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-x-auto font-mono text-[10px] my-4 leading-relaxed whitespace-pre-wrap"><code className={className} {...props}>{children}</code></pre>;
    },
    strong: ({ children, ...props }: any) => {
      const str = String(children);
      if (str.includes('【NEW】') || str.includes('【8/24 改定】') || str.includes('【8/24 追記】') || str.includes('【改定】') || str.includes('【追記】')) {
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-md text-xs font-bold font-sans shadow-2xs mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {children}
          </span>
        );
      }
      return <strong className="font-bold text-black" {...props}>{children}</strong>;
    },
    em: (props: any) => (
      <em className="bg-emerald-50/90 text-emerald-900 font-semibold not-italic px-1.5 py-0.5 rounded border border-emerald-200/90 shadow-2xs" {...props} />
    ),
    hr: (props: any) => <hr className="my-6 border-t border-brand-border/40" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-brand-primary/40 pl-4 py-1.5 italic my-4 text-black/70 bg-brand-light/10 rounded-r-xl font-serif" {...props} />
    ),
    a: (props: any) => <a className="text-[#5ea5ad] underline font-sans font-medium hover:opacity-80" target="_blank" {...props} />,
  };

  // 高品位なPDF印刷ハンドラー（公式運営ライブラリ MiscPages.tsx 準拠の完璧な印刷ウィンドウ生成）
  const handlePrintDocument = (docToPrint: string, titleStr: string, subtitleStr: string) => {
    let fontLink = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@500;700&display=swap" rel="stylesheet">`;
    
    // Markdownパーサー用HTML変換
    const lines = docToPrint.split('\n');
    let inList = false;
    let inTable = false;
    let htmlContent = '';

    lines.forEach((line) => {
      let trimmed = line.trim();

      if (trimmed.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          htmlContent += '<table class="doc-table"><thead>';
        }
        const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
        if (cells.every(c => c.startsWith('-') || c.startsWith(':-') || c.startsWith('---'))) {
          htmlContent = htmlContent.replace('<thead>', '').replace('</thead>', '');
          htmlContent += '<tbody>';
          return;
        }
        htmlContent += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        return;
      } else {
        if (inTable) {
          inTable = false;
          htmlContent += '</tbody></table>';
        }
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        if (!inList) {
          inList = true;
          htmlContent += '<ul class="doc-list">';
        }
        const content = trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlContent += `<li>${content}</li>`;
        return;
      } else {
        if (inList) {
          inList = false;
          htmlContent += '</ul>';
        }
      }

      if (trimmed.startsWith('# ')) {
        htmlContent += `<h1 class="doc-h1">${trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        htmlContent += `<h2 class="doc-h2">${trimmed.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        htmlContent += `<h3 class="doc-h3">${trimmed.substring(4).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>`;
      } else if (trimmed.startsWith('> ')) {
        htmlContent += `<blockquote class="doc-quote">${trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</blockquote>`;
      } else if (trimmed === '') {
        // empty line
      } else {
        const content = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                               .replace(/`(.*?)`/g, '<code>$1</code>');
        htmlContent += `<p class="doc-p">${content}</p>`;
      }
    });

    if (inList) htmlContent += '</ul>';
    if (inTable) htmlContent += '</tbody></table>';

    const printHtml = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <title>${titleStr}</title>
        ${fontLink}
        <style>
          @media print {
            body { background: #ffffff; color: #1a1a1a; }
          }
          @page { size: A4 portrait; margin: 18mm 15mm 18mm 15mm; }
          body {
            font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
            color: #1a1a1a;
            line-height: 1.8;
            font-size: 9.5pt;
            background: #ffffff;
            margin: 0;
            padding: 0;
          }
          .header {
            border-bottom: 2px solid #3B627F;
            padding-bottom: 12px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .header h1 {
            font-size: 13pt;
            margin: 0;
            color: #1a2735;
            font-weight: 700;
            font-family: 'Noto Serif JP', serif;
            line-height: 1.3;
          }
          .header .subtitle {
            font-size: 8.5pt;
            color: #3B627F;
            font-weight: bold;
            margin-top: 4px;
          }
          .header .date {
            font-size: 8.5pt;
            color: #64748b;
            text-align: right;
          }
          .title-desc {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 8.5pt;
            color: #475569;
            margin-bottom: 25px;
            line-height: 1.5;
          }
          .container { max-width: 100%; }
          .doc-h1 {
            font-size: 13pt;
            border-bottom: 2px solid #3B627F;
            padding-bottom: 8px;
            color: #1a2735;
            margin-top: 28px;
            margin-bottom: 12px;
            font-family: 'Noto Serif JP', serif;
          }
          .doc-h2 {
            font-size: 11pt;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-top: 22px;
            margin-bottom: 10px;
            color: #3B627F;
            font-family: 'Noto Serif JP', serif;
          }
          .doc-h3 {
            font-size: 10pt;
            color: #1e293b;
            margin-top: 18px;
            margin-bottom: 6px;
            font-weight: bold;
            font-family: 'Noto Sans JP', sans-serif;
          }
          .doc-p { margin-bottom: 12px; color: #334155; line-height: 1.8; }
          .doc-list { padding-left: 20px; margin-bottom: 15px; }
          .doc-list li { margin-bottom: 6px; list-style-type: square; color: #334155; }
          .doc-quote {
            border-left: 4px solid #3B627F;
            padding: 10px 14px;
            color: #475569;
            margin: 15px 0;
            font-style: italic;
            background: #f8fafc;
            border-radius: 0 6px 6px 0;
          }
          .doc-table { width: 100%; border-collapse: collapse; margin: 18px 0; }
          .doc-table th, .doc-table td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 8.5pt; text-align: left; }
          .doc-table th { background: #f8fafc; color: #1a2735; font-weight: bold; font-family: 'Noto Serif JP', serif; }
          .doc-table td { color: #334155; }
          .footer {
            margin-top: 40px;
            font-size: 8pt;
            text-align: center;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${titleStr}</h1>
            <div class="subtitle">${subtitleStr}</div>
          </div>
          <div class="date">
            出力日時: ${new Date().toLocaleString('ja-JP')}
          </div>
        </div>
        <div class="title-desc">
          本資料は犯罪抑止・セキュリティ対策に特化した再会支援SNS「ReMEETs」における治安コンプライアンス監査実証ドキュメントです。A4規格印刷・PDF出力に完全適合するよう最適にフォーマットされています。
        </div>
        <div class="container">
          ${htmlContent}
        </div>
        <div class="footer">
          ReMEETs 治安・防衛コンプライアンス管理事務局 &copy; 2026. All Rights Reserved.
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintSummary = () => {
    window.print();
  };


  // PowerPoint (.pptx) エクスポート機能
  const handleDownloadPPTX = () => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    POLICE_PRESENTATION_SLIDES.forEach((slide, index) => {
      const pptxSlide = pptx.addSlide();
      const scenarioText = POLICE_PRESENTATION_SCENARIOS[index];
      if (scenarioText) {
        pptxSlide.addNotes(scenarioText);
      }

      if (slide.layout === 'title') {
        pptxSlide.background = { color: '0F172A' };
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 2.0,
          w: '85%',
          fontSize: 26,
          bold: true,
          color: 'F59E0B',
          align: 'left',
          fontFace: 'Meiryo'
        });
        if (slide.subtitle) {
          pptxSlide.addText(slide.subtitle, {
            x: 0.8,
            y: 4.2,
            w: '85%',
            fontSize: 14,
            color: 'E2E8F0',
            align: 'left',
            fontFace: 'Meiryo'
          });
        }
      } else {
        pptxSlide.background = { color: 'FFFFFF' };
        // Header
        pptxSlide.addText(slide.category, {
          x: 0.8,
          y: 0.4,
          w: '85%',
          fontSize: 11,
          color: '64748B',
          bold: true,
          fontFace: 'Meiryo'
        });
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 0.8,
          w: '85%',
          fontSize: 20,
          bold: true,
          color: '0F172A',
          fontFace: 'Meiryo'
        });

        // Content bullet points
        const bulletItems = slide.points.map((pt) => ({
          text: pt,
          options: {
            fontSize: 13,
            color: '334155',
            breakLine: true,
            paraSpaceAfter: 12
          }
        }));

        pptxSlide.addText(bulletItems, {
          x: 0.8,
          y: 1.8,
          w: '85%',
          h: 4.8,
          fontFace: 'Meiryo'
        });
      }
    });

    pptx.writeFile({ fileName: `ReMEETs_Police_Presentation_Slides_${new Date().toISOString().slice(0, 10)}.pptx` });
  };

  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadAuditCSV = () => {
    const csvContent = 
      "\ufeff" + // UTF-8 BOM
      "ログ日時 (Timestamp),ログ分類 (Category),対象ホスト/IP (Client IP),ユーザー識別子 (User Hash),操作/検知イベント (Event Action),モデレーション評価 (AI Safety Check),監査適合ステータス (Status)\n" +
      '"2026-06-05 13:02:11","USER_SIGNUP_CONSENT","192.168.12.44","usr_d8f37a90b1e34","年齢18歳以上宣誓完了・電子承諾済","PASS (SafetyScore: 1.00)","SUCCESS (適合)"\n' +
      '"2026-06-05 13:02:45","QUIZ_POST_PROPOSAL","192.168.12.44","usr_d8f37a90b1e34","思い出ボトル投函 (キーワード: 高校陸上部、担任の名前)","PASS (SafetyScore: 0.98)","SUCCESS (適合)"\n' +
      '"2026-06-05 13:03:15","IDENTITY_VERIFICATION_START","192.168.12.44","usr_d8f37a90b1e34","オンライン本人確認 (eKYC) の申請受理、事業者認証セッション接続","PENDING","LAUNCHED (認証開始)"\n' +
      '"2026-06-05 13:04:02","IDENTITY_VERIFICATION_COMPLETED","192.168.12.44","usr_d8f37a90b1e34","eKYC公的身元照合成功、生年月日照合完了。生身分証データは即時完全パージ破棄済","VERIFIED (TokenHash: ab93f7e...)","SUCCESS (公的適合)"\n' +
      '"2026-06-05 13:05:22","NG_WORD_MODERATION","203.0.113.88","usr_93f8fe9c6d32","手紙本文の自動スキャン (アビューズ示唆を検知して遮断)","BLOCKED (NGワード: LINEなどの直接交渉・ハラスメントの疑い)","PREVENTED (防衛成功)"\n' +
      '"2026-06-05 13:12:04","POLICE_FORENSIC_EXPORT","127.0.0.1 (ADMIN)","admin_root","監査官用ログダンプの任意抽出・エクスポート実行","PASS_AUTHORITY","SUCCESS (適合)"\n' +
      '"2026-06-05 13:20:00","LOG_INTEGRITY_SEAL","SYSTEM_DAEMON","N/A","データベース整合性暗号署名の永続ロギング完了","INTEGRITY_SECURE","ACTIVE (正常)"\n' +
      '"2026-06-05 13:31:05","USER_CONSENT_REVOCATION","198.51.100.12","usr_12a76f5e8b41","利用者からのアカウント自己削除・全全データ不活性化(パージ法適合)","USER_ACTION","PURGED (適合)"\n' +
      '"2026-06-05 13:40:44","BLACKLISTED_USER_PREVENT","198.51.100.99","usr_temp_92fa","eKYC身元照合時、実名ハッシュが永久BlackListに一致。別垢による登録バイパスを未然遮断","REJECTED (ハッシュ特定: fx83a29...)","PREVENTED (防衛成功)"\n' +
      '"2026-06-05 13:42:19","THREAT_IP_COOLDOWN","198.51.100.55","usr_guest_unauth","短時間での思い出クイズ総当たり入力アタックを検知","BLOCKED (不正クイズハック検知)","IP_COOLING (遮断)"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ReMEETs_Audit_Forensic_Sample_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 🧭 画面用ヘッダー＆ドキュメント切り替えセレクタ（印刷時は非表示） */}
      <div className="print:hidden space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-primary tracking-wider uppercase">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                🚔 警察生活安全課・サイバー課 事前相談総合センター
              </span>
              <span className="text-black/40">Official Legal & Security Center</span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
              警察事前相談 ＆ 法令適合総合ポータル
            </h2>
            <p className="text-xs md:text-sm text-brand-dark/70 font-serif leading-relaxed w-full">
              管轄警察署への事前相談・面談に必要な「A4提出サマリー」「16:9プレゼンスライド」「全文セキュリティ報告書」「想定問答・相談フロー」「適合監査マトリクス」「口頭発表原稿」「関係法令適合ガイド」を一元管理・出力できます。
            </p>
          </div>

          <div className="pt-4 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsLegalSchemeModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                title="警察署生活安全課や弁護士へ提示する「異性紹介事業非該当性（出会い系規制法適用除外）」の公式法的説明書を表示・コピーします。"
              >
                <Scale size={14} />
                <span>⚖️ 非該当性 法的説明書</span>
              </button>

              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                title="刑訴法197条に基づく警察・公安提出用の正式回答書テンプレートを表示・コピーします。"
              >
                <FileCheck size={14} />
                <span>📄 照会回答書テンプレート</span>
              </button>

              <button
                onClick={handleDownloadAuditCSV}
                className="px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                title="警察や行政の監査時に提出される、ユーザーの誓約状況や暗号化通信イベントを示す実際のログデータ構造（モック）をCSVとしてエクスポートします。"
              >
                <Download size={14} />
                <span>📊 模擬監査ログ (CSV)</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {activeDoc === 'slides' ? (
                <button
                  onClick={handleDownloadPPTX}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Presentation size={16} />
                  <span>PowerPoint (.pptx)</span>
                </button>
              ) : (
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Printer size={16} />
                  <span>📄 PDFで保存 / 印刷</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 🚔 POLICE TEMPLATE MODAL */}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded">
                    刑訴法197条2項
                  </span>
                  <h3 className="font-bold text-base text-black font-serif">
                    🚔 捜査関係事項照会に対する回答書 (警察・公安提出用)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-100 text-black/60 hover:text-black cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-black/60 leading-relaxed">
                警察署長・検察官からの照会書を受領した際に作成・提出する正式回答書の標準テンプレートです。
              </p>

              <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                <pre className="p-4 text-slate-100 font-mono text-xs leading-relaxed overflow-y-auto max-h-[50vh] whitespace-pre-wrap selection:bg-teal-700">
                  {POLICE_DISCLOSURE_TEMPLATE_CONTENT}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-black/50">
                  ※ 実務用公式書面テンプレート集（原本）と共通の最新書式です
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(POLICE_DISCLOSURE_TEMPLATE_CONTENT);
                      setCopiedTpl(true);
                      setTimeout(() => setCopiedTpl(false), 2500);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-all cursor-pointer shadow-sm"
                  >
                    {copiedTpl ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                    <span>{copiedTpl ? '✔ コピー完了！' : 'テンプレートをコピー'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-black cursor-pointer"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ⚖️ LEGAL SCHEME MODAL (非該当性法的説明書) */}
        {isLegalSchemeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                    警察・弁護士用
                  </span>
                  <h3 className="font-bold text-base text-black font-serif">
                    ⚖️ インターネット異性紹介事業 非該当性 法的説明書
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLegalSchemeModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-100 text-black/60 hover:text-black cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-black/60 leading-relaxed">
                警察署生活安全課や弁護士・行政書士へ提示する「出会い系サイト規制法適用除外」の論理構成書です。
              </p>

              <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                <pre className="p-4 text-slate-100 font-mono text-xs leading-relaxed overflow-y-auto max-h-[50vh] whitespace-pre-wrap selection:bg-indigo-700">
                  {LEGAL_SCHEME_TEMPLATE_CONTENT}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-black/50">
                  ※ 実務用公式書面テンプレート集（原本）と共通の最新書式です
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(LEGAL_SCHEME_TEMPLATE_CONTENT);
                      setCopiedLegalTpl(true);
                      setTimeout(() => setCopiedLegalTpl(false), 2500);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white transition-all cursor-pointer shadow-sm"
                  >
                    {copiedLegalTpl ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                    <span>{copiedLegalTpl ? '✔ コピー完了！' : '説明書をコピー'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLegalSchemeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-black cursor-pointer"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📑 10大ドキュメント切り替えタブ（実務・事前相談作業フロー順） */}
        <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveDoc('demo_guide')}
            className={`flex-1 min-w-[170px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'demo_guide'
                ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md ring-2 ring-blue-500/30'
                : 'bg-white/80 text-blue-950 hover:text-blue-700 hover:bg-white border border-blue-200/80'
            }`}
          >
            <span className="text-base">🚨</span>
            <span className="whitespace-nowrap font-bold">★ 警察実証デモ＆全対策備忘録</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('qa_consult')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'qa_consult'
                ? 'bg-white text-amber-900 shadow-md ring-2 ring-amber-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">❓</span>
            <span className="whitespace-nowrap">① 警察署事前相談フロー</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('permit')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'permit'
                ? 'bg-white text-cyan-900 shadow-md ring-2 ring-cyan-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">🏢</span>
            <span className="whitespace-nowrap">② 開業知識・官公庁届出Q&A</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('legal_guide')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'legal_guide'
                ? 'bg-white text-teal-900 shadow-md ring-2 ring-teal-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">⚖️</span>
            <span className="whitespace-nowrap">③ 主要関係法令適合ガイド</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('a4_summary')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'a4_summary'
                ? 'bg-white text-blue-900 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">📄</span>
            <span className="whitespace-nowrap">④ A4警察提出サマリー</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('security_report')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'security_report'
                ? 'bg-white text-slate-900 shadow-md ring-2 ring-slate-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">🏛️</span>
            <span className="whitespace-nowrap">⑤ セキュリティ報告書</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('slides')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'slides'
                ? 'bg-white text-rose-900 shadow-md ring-2 ring-rose-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">📑</span>
            <span className="whitespace-nowrap">⑥ プレゼンスライド(16:9)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('scenario')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'scenario'
                ? 'bg-white text-indigo-900 shadow-md ring-2 ring-indigo-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">🗣️</span>
            <span className="whitespace-nowrap">⑦ 口頭発表シナリオ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('matrix')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'matrix'
                ? 'bg-white text-emerald-900 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">🛡️</span>
            <span className="whitespace-nowrap">⑧ 適合監査マトリクス</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('requirements')}
            className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
              activeDoc === 'requirements'
                ? 'bg-white text-violet-900 shadow-md ring-2 ring-violet-500/20'
                : 'bg-white/60 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span className="text-base">📐</span>
            <span className="whitespace-nowrap">⑨ システム基本要件定義書</span>
          </button>
        </div>
      </div>

      {/* 印刷用スタイル注入 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #police-print-document, #police-print-document * {
            visibility: visible;
          }
          #police-print-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm 20mm;
            background: white !important;
            color: black !important;
            font-size: 11pt;
            line-height: 1.5;
          }
          .page-break {
            page-break-before: always;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* 🚨 DOC 0: 警察実証・自動デモツアー＆セキュリティ9大対策備忘録 */}
      {/* ======================================================== */}
      {activeDoc === 'demo_guide' && (
        <div className="space-y-8 animate-fadeIn">
          {/* メイン概要カード */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-3xl border border-indigo-500/30 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/30 pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold tracking-wider uppercase">
                  🚨 POLICE & CYBER DEFENSE PRESENTATION STRATEGY
                </div>
                <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
                  警察・行政向け セキュリティ実証デモ ＆ 9大安全防衛策 完全備忘録
                </h3>
                <p className="text-xs text-slate-300 font-serif leading-relaxed">
                  生活安全課・サイバー課への事前相談において、出会い系サイト規制法・ストーカー規制法への完全非該当と、事件時の即時捜査協力を実証する統合マスターガイドです。
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLegalSchemeModalOpen(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <Scale size={15} />
                  <span>⚖️ 非該当性説明書</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <FileCheck size={15} />
                  <span>📄 照会回答書</span>
                </button>
              </div>
            </div>

            {/* 3部構成ナビゲーション */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5 font-sans">
                  <span>💻</span> 【動的実演】画面自動操作
                </div>
                <div className="text-sm font-bold text-white font-serif">全8大ブラウザ実演シナリオ</div>
                <p className="text-[11px] text-slate-300 font-serif leading-normal">
                  Google検索流入からAI隔離、チャット非搭載、警察照会ワンクリック出力まで自律操作。
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-sans">
                  <span>🛡️</span> 【防衛体系】法令適法システム
                </div>
                <div className="text-sm font-bold text-white font-serif">全9大セキュリティ・プライバシー策</div>
                <p className="text-[11px] text-slate-300 font-serif leading-relaxed">
                  密室DM非搭載、二重マスキング、クイズ遮断、個人情報非保持、公的eKYC等を完全網羅。
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-sans">
                  <span>📄</span> 【静的証拠】紙の提出資料
                </div>
                <div className="text-sm font-bold text-white font-serif">全4大印刷持参パッケージ</div>
                <p className="text-[11px] text-slate-300 font-serif leading-relaxed">
                  法的説明書、照会回答書サンプル、全体設計図、利用規約抜粋を手渡し回覧。
                </p>
              </div>
            </div>
          </div>

          {/* セクション 1: 💻 ブラウザ自動実演 8大シナリオ詳細 */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                    <Presentation size={20} />
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    💻 ブラウザ画面操作 自動実演（デモツアー）全8大シナリオ
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-serif">
                  警察担当官の目の前でブラウザが自律動作し、鉄壁のセキュリティと適法性を直感的に証明する実演プログラムです。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scenario 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-blue-900 px-2 py-0.5 rounded bg-blue-100">
                    🔍 Demo 1 (キラーデモ)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Google検索流入＆マスキング</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  Google検索結果スニペット ➔ 一般公開マスキング着地実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> Google検索風モック画面で「山田太郎 1995年 緑中」と自動タイピング ➔ マスキングされた検索結果をクリック ➔ ReMEETsの手紙詳細画面へ着地し、一般画面では実名・本文・連絡先が完全に伏字（***）で安全に保護されている様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「Google等の一般ネット検索に対しても個人情報や機微な想い出が晒されることは100%ありません」
                </div>
              </div>

              {/* Scenario 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-amber-900 px-2 py-0.5 rounded bg-amber-100">
                    ⚖️ Demo 2
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">出会い系非該当性</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  秘密の想い出クイズ完全一致（無差別出会い遮断）実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 想い出クイズに間違った回答を入力して「不一致」で弾かれる様子 ➔ 正しい2人だけの秘密の答えを入力して通過する様子を自動実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「不特定多数の無差別な出会いやアプローチを100%遮断し、知人同士の合意再会のみを成立させます」
                </div>
              </div>

              {/* Scenario 3 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-rose-900 px-2 py-0.5 rounded bg-rose-100">
                    🤖 Demo 3
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">AI自律検閲エンジン</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  電話番号・住所・ストーカー執着文のミリ秒即時隔離実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 手紙投稿画面に「電話番号・住所・ストーカー的威圧文」を自動入力 ➔ 投函ボタン ➔ AI（Gemini & 正規表現）がミリ秒で検知し、一般公開させず隔離（`ai_flagged = 1`）する様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「危険な投稿や個人情報の無断晒しは、一般の目に触れる前にAIが自動で隔離・証拠保全します」
                </div>
              </div>

              {/* Scenario 4 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-indigo-900 px-2 py-0.5 rounded bg-indigo-100">
                    💬 Demo 4 (法令適法の要)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">セキュア・ブリッジ完結</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  アプリ内チャット（密室DM）完全非搭載・連絡先引き渡し実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> クイズ正解・認証後の「連絡先安全開示画面」へ自動遷移 ➔ アプリ内にメッセージ送受信機能はなく、連絡先の引き渡し完了をもってシステムが終了する画面をハイライト。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「アプリ内に密室チャットが存在しないため、出会い系サイト規制法の対象外であり、密室トラブルの余地がゼロです」
                </div>
              </div>

              {/* Scenario 5 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-teal-900 px-2 py-0.5 rounded bg-teal-100">
                    🪪 Demo 5
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">厳格な身元確認</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  公的eKYC（身分証審査）＆電子的利用宣誓同意フロー実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 手紙開封時の公的eKYCモーダル ➔ 運転免許証提出 ➔ 「犯罪・ストーキングに利用しない」電子的利用宣誓の同意チェックが進行する様子を解説。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「日本の法令に準拠した厳格な身元確認と電子的宣誓により、匿名や捨てアカウントでの悪用を完全に防ぎます」
                </div>
              </div>

              {/* Scenario 6 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-purple-900 px-2 py-0.5 rounded bg-purple-100">
                    🔒 Demo 6
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">データ漏洩防止</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  身分証画像・カード情報を「持たない」セキュアDB構造実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 管理画面のログ・DB構造へ移動 ➔ 免許証画像やクレジットカード番号が運営サーバーに一切存在せず、認証ステータスのみを安全保持している構造をハイライト。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「機微な生データは保持しないため、万が一の外部攻撃時も個人情報漏洩が原理的に起きません」
                </div>
              </div>

              {/* Scenario 7 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-red-900 px-2 py-0.5 rounded bg-red-100">
                    🚩 Demo 7
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">自浄作用・迅速対応</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  ワンクリック通報・削除要請 ＆ 管理者即時物理削除実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> ボトル画面の「🚨 通報・削除要請」ボタン ➔ 管理者ダッシュボードへ移動 ➔ 管理者がワンクリックで即座に非公開・完全物理削除する様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「本人からの削除要請や通報に対し、管理者が即座に非公開・完全削除できる自浄体制を完備しています」
                </div>
              </div>

              {/* Scenario 8 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-slate-900 px-2 py-0.5 rounded bg-slate-200">
                    🚔 Demo 8 (捜査協力の決定打)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">刑事訴訟法197条照会</span>
                </div>
                <div className="font-bold text-xs text-slate-900 font-serif">
                  警察照会データ（照会回答書PDF・全通信ログCSV）ワンクリック出力実演
                </div>
                <p className="text-[11px] text-slate-600 font-serif leading-relaxed">
                  <strong>【自動動作】</strong> 警察照会タブへ移動 ➔ 容疑者IDを選択 ➔ 「📄 捜査関係事項照会 回答書（PDF）」と「📊 全アクセス・通信ログ（CSV）」が1秒で一括生成される様子を実演。
                </p>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg font-mono">
                  💡 警察へのメッセージ: 「貴署より照会書を受領した際、1秒で犯人特定に必要な全証拠ログを公的書面として即座にお渡しできます」
                </div>
              </div>
            </div>
          </div>

          {/* セクション 2: 🛡️ ReMEETs 治安＆プライバシー防衛 9大システム一覧 */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                    <ShieldCheck size={20} />
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    🛡️ ReMEETs 治安＆プライバシー防衛 全9大システム体系
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-serif">
                  日本の各種法令（出会い系規制法、ストーカー規制法、個人情報保護法、刑訴法）に100%適合する防衛構造です。
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-200 font-serif">
                    <th className="p-3 font-bold w-12 text-center">#</th>
                    <th className="p-3 font-bold w-48">セキュリティ防衛項目</th>
                    <th className="p-3 font-bold w-48">警察・行政の関心・懸念</th>
                    <th className="p-3 font-bold">ReMEETsの防衛システム＆実証内容</th>
                    <th className="p-3 font-bold w-24 text-center">適合法令</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">1</td>
                    <td className="p-3 font-bold text-slate-900">
                      💬 アプリ内チャット非搭載<br />
                      <span className="text-[10px] text-blue-800 font-normal">（セキュア・ブリッジ完結）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      アプリ内で密室チャットが行われ、恐喝や犯罪の温床にならないか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      アプリ内にメッセージ機能やチャットは<strong>一切存在しない（完全非搭載）</strong>。クイズ照合と本人確認完了後、相手へ連絡先を安全に引き渡した時点でシステムの役割が完了。密室トラブルの余地がゼロ。
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 text-[10px] bg-emerald-50">
                      出会い系規制法<br />完全非該当
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">2</td>
                    <td className="p-3 font-bold text-slate-900">
                      👁️ 二重情報マスキング<br />
                      <span className="text-[10px] text-slate-500 font-normal">（オープン vs 開封後）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      ネット上に実名、住所、機微な想い出が晒されてしまわないか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      <strong>一般公開時（オープン）</strong>はイニシャル、年代、都道府県、抽象的要約のみ表示。フルネーム・詳細住所・本文は完全マスキング。クイズ正解＆eKYC完了者のみに限定開示。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      個人情報保護法<br />完全適合
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">3</td>
                    <td className="p-3 font-bold text-slate-900">
                      ⚖️ 想い出クイズ完全一致<br />
                      <span className="text-[10px] text-slate-500 font-normal">（無差別出会い遮断）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      不特定多数の異性が無差別に閲覧・返信できる出会い系ではないか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      2人しか知り得ない共通の記憶（クイズ）に完全一致しない限り手紙の開封・接触は不可。連続失敗時のレートリミット遮断により、総当たりアタックも完全防御。
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800 text-[10px] bg-emerald-50">
                      異性紹介事業<br />対象外
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">4</td>
                    <td className="p-3 font-bold text-slate-900">
                      🤖 AI自律リアルタイム検閲<br />
                      <span className="text-[10px] text-slate-500 font-normal">（Gemini & 高度正規表現）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      ストーカー目的の執着文や、電話番号・住所の無断晒しは防げるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      Google Gemini AIと正規表現のハイブリッド検閲により、電話番号、住所、口座番号、SNS ID、威圧・執着表現を投稿時にミリ秒検知。一般公開させず隔離（`ai_flagged = 1`）保全。
                    </td>
                    <td className="p-3 text-center font-bold text-rose-800 text-[10px] bg-rose-50">
                      ストーカー規制法<br />事前防衛
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">5</td>
                    <td className="p-3 font-bold text-slate-900">
                      🚩 ワンクリック通報・削除<br />
                      <span className="text-[10px] text-slate-500 font-normal">（自浄作用体制）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      「自分の名前が出ている」「消してほしい」等の申告に即応できるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      全ボトルに「🚨 通報・削除要請」ボタンを常時設置。申告を受領後、管理者ダッシュボードからワンクリックで即時非公開化・完全物理削除が可能。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      プロバイダ責任法<br />即応適合
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">6</td>
                    <td className="p-3 font-bold text-slate-900">
                      🔒 個人情報「非保持」設計<br />
                      <span className="text-[10px] text-slate-500 font-normal">（データ漏洩ゼロ化）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      サーバー攻撃や内部不正による身分証・カード情報の流出リスクは？
                    </td>
                    <td className="p-3 leading-relaxed">
                      身分証画像は運営サーバーに一切保存せずeKYCベンダーのセキュア領域のみで保持。カード情報はStripeトークン決済により非保持化。退会時はSNS認可データを完全物理削除。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      安全管理措置<br />最高水準
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">7</td>
                    <td className="p-3 font-bold text-slate-900">
                      🪪 公的eKYC ＆ 電子宣誓<br />
                      <span className="text-[10px] text-slate-500 font-normal">（身元保証と法的同意）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      匿名アカウントによるなりすましや犯罪利用を防げるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      手紙開封時は「犯罪・ストーカーに利用しない」電子的利用宣誓への法的同意を義務付け。さらに身元信頼性を高めたいユーザー向けに公的身分証（運転免許証等）による公的eKYC審査（任意オプション600円）を提供。
                    </td>
                    <td className="p-3 text-center font-bold text-blue-800 text-[10px] bg-blue-50">
                      犯収法・携帯法<br />準拠
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">8</td>
                    <td className="p-3 font-bold text-slate-900">
                      💳 有料決済（Stripe）<br />
                      <span className="text-[10px] text-slate-500 font-normal">（多重参入・サクラ抑止）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      捨てアカウントによる嫌がらせやサクラ投稿を抑止できるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      手紙開封手数料（600円）およびeKYC審査手数料（600円）の適正な経済的障壁を設置。カード名義と本人確認の照合により、悪質利用者の多重参入を排除。
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800 text-[10px] bg-slate-50">
                      特商法<br />完全表記
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30">
                    <td className="p-3 text-center font-bold text-blue-900">9</td>
                    <td className="p-3 font-bold text-slate-900">
                      🚔 警察捜査即時協力体制<br />
                      <span className="text-[10px] text-slate-500 font-normal">（令状即応システム）</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      事件発生時、警察は即座に容疑者を特定・立件できるか？
                    </td>
                    <td className="p-3 leading-relaxed">
                      刑事訴訟法第197条第2項に基づく捜査関係事項照会に対し、接続IP、SNS UID、SMS電話番号、本人確認情報、AI隔離証拠文を<strong>ワンクリックで公的捜査用CSV/PDF回答書として即時出力</strong>。
                    </td>
                    <td className="p-3 text-center font-bold text-indigo-800 text-[10px] bg-indigo-50">
                      刑事訴訟法<br />第197条即応
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* セクション 3: 📄 手元に配る「紙の提出資料 4大セット」 */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                    <Printer size={20} />
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    📄 警察相談当日に持参・配布する「紙の資料 4大セット」
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-serif">
                  生活安全課長や法務係・公安委員会が署内でそのまま回覧・決裁できる公的文書セットです。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-indigo-950 flex items-center gap-1.5">
                    <Scale size={16} className="text-indigo-700" />
                    1. ⚖️ 異性紹介事業 非該当性 法的説明書
                  </span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded">弁護士監修書式</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  出会い系サイト規制法第2条各号の条文対比と、「クイズ完全一致」「チャット非搭載」「既知の知人限定」により法律の対象外である旨を論理明記した公式書面。
                </p>
              </div>

              <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-teal-950 flex items-center gap-1.5">
                    <FileCheck size={16} className="text-teal-700" />
                    2. 📄 捜査関係事項照会 回答書（実物サンプル）
                  </span>
                  <span className="text-[10px] bg-teal-200 text-teal-900 font-bold px-2 py-0.5 rounded">捜査班向け見本</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  刑事訴訟法第197条第2項に基づく照会書への公式回答様式。容疑者氏名、SMS番号、SNS UID、接続IP、AI隔離証拠文が印字された実際の出力サンプル。
                </p>
              </div>

              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-blue-950 flex items-center gap-1.5">
                    <Layers size={16} className="text-blue-700" />
                    3. 🛡️ セキュリティ・プライバシー保護設計概要図（A4サマリー）
                  </span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">全体図解シート</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  システムの全体像（入口：AI検閲 ➔ 照合：クイズ ➔ 出口：チャットなし連絡先引き渡し）と、個人情報非保持アーキテクチャを一目で理解できるA4要約シート。
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-slate-900 flex items-center gap-1.5">
                    <FileText size={16} className="text-slate-700" />
                    4. 📝 利用規約・プライバシーポリシー・投稿ガイドライン抜粋
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">利用約款文書</span>
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  ストーカー禁止条項、晒し行為禁止条項、警察捜査照会時のデータ開示承諾条項など、ユーザーが登録時に同意している適法約款の抜粋文書。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📄 DOC 1: A4エグゼクティブ・サマリー（提出用メイン）        */}
      {/* ======================================================== */}
      {activeDoc === 'a4_summary' && (
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
      )}

      {/* ======================================================== */}
      {/* 📑 DOC 2: 警察事前相談用 プレゼンスライド (16:9 ビューア) */}
      {/* ======================================================== */}
      {activeDoc === 'slides' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Presentation size={16} className="text-rose-600" />
              <span>警察事前相談用 16:9 プレゼンスライド資料（全30枚）</span>
            </div>
            <button
              onClick={handleDownloadPPTX}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download size={14} />
              <span>PowerPoint (.pptx) 出力</span>
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <PolicePresentationSlideViewer 
              slides={POLICE_PRESENTATION_SLIDES}
              scenarios={POLICE_PRESENTATION_SCENARIOS}
              onOpenScenarioDoc={() => {
                setActiveDoc('scenario');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ❓ DOC 1: 警察署事前相談フロー ＆ 想定問答集 (全文Markdown) */}
      {/* ======================================================== */}
      {activeDoc === 'qa_consult' && (
        <div className="space-y-4">
          <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
                <HelpCircle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-sans">
                  ① ReMEETs 警察署事前相談フロー ＆ 想定問答（公式ガイド）
                </h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  生活安全課・サイバー課への事前相談アポ取り・面談手順および緊急時データ開示手続き
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePrintDocument(
                consultFlowMd,
                "① ReMEETs 警察署事前相談フロー",
                "ストーカー規制法関連緊急時データ開示および捜査事項照会即応手続き"
              )}
              className="px-4 py-2 bg-[#3B627F] hover:bg-[#1C2B3C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Printer size={14} />
              <span>📄 PDFでダウンロード / 印刷</span>
            </button>
          </div>

          <div className="p-6 md:p-8 bg-white border border-brand-border/60 rounded-3xl max-w-full overflow-x-hidden shadow-sm">
            {loadingDoc ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                <p className="text-xs text-brand-dark/50">ドキュメントを読み込み中...</p>
              </div>
            ) : (
              renderDocumentContent(consultFlowMd)
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🏢 DOC 2: 開業知識・官公庁届出Q＆A (全文Markdown)          */}
      {/* ======================================================== */}
      {activeDoc === 'permit' && (
        <div className="space-y-4">
          <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-sans">
                  ② ReMEETs 開業知識・官公庁届出Q＆A（公式解説書）
                </h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  警察（公安委員会）への異性紹介届出不要論理・特商法表記・年齢確認適合基準
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePrintDocument(
                permitMd,
                "② ReMEETs 開業知識・官公庁届出Q＆A",
                "警察（公安委員会）への異性紹介届出不要論理・特商法表記・年齢確認適合基準"
              )}
              className="px-4 py-2 bg-[#3B627F] hover:bg-[#1C2B3C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Printer size={14} />
              <span>📄 届出Q&AをPDFでダウンロード / 印刷</span>
            </button>
          </div>

          <div className="p-6 md:p-8 bg-white border border-brand-border/60 rounded-3xl max-w-full overflow-x-hidden shadow-sm">
            {loadingDoc ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                <p className="text-xs text-brand-dark/50">ドキュメントを読み込み中...</p>
              </div>
            ) : (
              renderDocumentContent(permitMd)
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ⚖️ DOC 3: 主要関係法令適合性＆警察署相談ガイダンス (全文Markdown) */}
      {/* ======================================================== */}
      {activeDoc === 'legal_guide' && (
        <div className="space-y-4">
          <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
                <Scale size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-sans">
                  ③ 主要関係法令適合性＆警察署相談ガイダンス（法令セルフアセスメント）
                </h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  ストーカー規制法・出会い系サイト規制法・個人情報保護法・情報流通プラットフォーム対処法 適合性解説
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePrintDocument(
                legalGuideMd,
                "③ 主要関係法令適合性＆警察署相談ガイダンス",
                "ストーカー規制法・出会い系サイト規制法・個人情報保護法・情報流通プラットフォーム対処法 適合性解説"
              )}
              className="px-4 py-2 bg-[#3B627F] hover:bg-[#1C2B3C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Printer size={14} />
              <span>📄 ガイダンスをPDFでダウンロード / 印刷</span>
            </button>
          </div>

          <div className="p-6 md:p-8 bg-white border border-brand-border/60 rounded-3xl max-w-full overflow-x-hidden shadow-sm">
            {loadingDoc ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                <p className="text-xs text-brand-dark/50">ドキュメントを読み込み中...</p>
              </div>
            ) : (
              renderDocumentContent(legalGuideMd)
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🏛️ DOC 5: 警察協議用 セキュリティ報告書 (全文Markdown)     */}
      {/* ======================================================== */}
      {activeDoc === 'security_report' && (
        <div className="space-y-4">
          <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-sans">
                  ⑤ 治安・防犯コンプライアンス適合性報告書（警察署協議用報告書 全文）
                </h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  管轄警察署 生活安全課・サイバー犯罪対策課 協議用セキュリティ報告書
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePrintDocument(
                securityReportMd,
                "⑤ ReMEETs 治安・防犯コンプライアンス適合性報告書",
                "管轄警察署 生活安全課・サイバー犯罪対策課 協議用セキュリティ報告書"
              )}
              className="px-4 py-2 bg-[#3B627F] hover:bg-[#1C2B3C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Printer size={14} />
              <span>📄 PDFでダウンロード / 印刷</span>
            </button>
          </div>

          <div className="p-6 md:p-8 bg-white border border-brand-border/60 rounded-3xl max-w-full overflow-x-hidden shadow-sm">
            {loadingDoc ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                <p className="text-xs text-brand-dark/50">ドキュメントを読み込み中...</p>
              </div>
            ) : (
              renderDocumentContent(securityReportMd)
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🗣️ DOC 7: 警察向け口頭発表シナリオ (全文Markdown & スクリプト) */}
      {/* ======================================================== */}
      {activeDoc === 'scenario' && (
        <div 
          id="police-print-document"
          className="bg-white p-8 md:p-14 rounded-3xl border border-brand-border shadow-md max-w-5xl mx-auto space-y-6 text-slate-800 font-sans leading-relaxed"
        >
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between flex-wrap gap-4 no-print">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DOCUMENT ⑦ (全30シーン・完全スピーチ原稿)</span>
              <h3 className="text-xl font-serif font-black text-slate-900">警察・生活安全課向け 口頭発表スピーチ原稿（全30シーン）</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyText(POLICE_PRESENTATION_SCENARIOS.join('\n\n'))}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'コピー完了！' : '全シナリオをコピー'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer size={14} />
                <span>📄 PDF保存 / 印刷</span>
              </button>
            </div>
          </div>

          {/* シナリオ全文表示 */}
          <div className="space-y-4">
            {POLICE_PRESENTATION_SCENARIOS.map((scenario, index) => {
              const slide = POLICE_PRESENTATION_SLIDES[index];
              return (
                <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono">
                      SLIDE {index + 1} / {POLICE_PRESENTATION_SLIDES.length}
                    </span>
                    <span className="text-slate-600 font-medium">{slide ? slide.category : ''}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{slide ? slide.title : `シーン ${index + 1}`}</h4>
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200 font-serif">
                    {scenario}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🛡️ DOC 8: セキュリティ適合監査マトリクス (全文Markdown)    */}
      {/* ======================================================== */}
      {activeDoc === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-sans">
                  ⑧ セキュリティ適合性監査マトリクス（公式監査用マトリクス）
                </h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  治安・防衛コンプライアンス管理事務局（公式監査用マトリクス）
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePrintDocument(
                matrixMd,
                "⑧ セキュリティ適合性監査マトリクス",
                "治安・防衛コンプライアンス管理事務局（公式監査用マトリクス）"
              )}
              className="px-4 py-2 bg-[#3B627F] hover:bg-[#1C2B3C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Printer size={14} />
              <span>📄 マトリクスをPDFでダウンロード / 印刷</span>
            </button>
          </div>

          <div className="p-6 md:p-8 bg-white border border-brand-border/60 rounded-3xl max-w-full overflow-x-hidden shadow-sm">
            {loadingDoc ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                <p className="text-xs text-brand-dark/50">ドキュメントを読み込み中...</p>
              </div>
            ) : (
              renderDocumentContent(matrixMd)
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📐 DOC 9: システム基本要件定義書 (全文Markdown)            */}
      {/* ======================================================== */}
      {activeDoc === 'requirements' && (
        <div className="space-y-4">
          <div className="bg-[#487799]/5 border border-[#3B627F]/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3B627F]/10 flex items-center justify-center text-[#3B627F] shrink-0">
                <Cpu size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-sans">
                  ⑨ ReMEETs システム基本要件定義書 (System Requirements Definition Document)
                </h4>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                  開発・安全対策・公安コンプライアンス適合性を定義した公式システム要求仕様
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePrintDocument(
                requirementsMd,
                "⑨ ReMEETs システム基本要件定義書",
                "開発・安全対策・公安コンプライアンス適合性を定義した公式システム要求仕様"
              )}
              className="px-4 py-2 bg-[#3B627F] hover:bg-[#1C2B3C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Printer size={14} />
              <span>📄 要件定義書をPDFでダウンロード / 印刷</span>
            </button>
          </div>

          <div className="p-6 md:p-8 bg-white border border-brand-border/60 rounded-3xl max-w-full overflow-x-hidden shadow-sm">
            {loadingDoc ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                <p className="text-xs text-brand-dark/50">ドキュメントを読み込み中...</p>
              </div>
            ) : (
              renderDocumentContent(requirementsMd)
            )}
          </div>
        </div>
      )}
    </div>
  );
};
