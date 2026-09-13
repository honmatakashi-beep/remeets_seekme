import React, { useState, useEffect, useRef } from "react";
import {
  Shield, FileText, Download, Printer, Copy, Check, Eye, HelpCircle,
  ExternalLink, ChevronRight, RefreshCw, AlertTriangle, CheckCircle2,
  Lock, Key, Users, BookOpen, Layers, ShieldCheck, Scale, Award, Sparkles,
  Presentation, CheckSquare, Search, FileCheck, ArrowRight, Play
} from "lucide-react";
import Markdown from "react-markdown";
import { PolicePresentationSlideViewer } from "../../../components/PolicePresentationSlideViewer";
import {
  POLICE_DISCLOSURE_TEMPLATE_CONTENT,
  LEGAL_SCHEME_TEMPLATE_CONTENT
} from "../policeConsultation/policeConsultationTemplates";
import { PoliceDemoGuideView } from "../policeConsultation/PoliceDemoGuideView";
import { PoliceA4SummaryView } from "../policeConsultation/PoliceA4SummaryView";
import { RiskMitigationMatrix } from "../../../components/deploymentGuide/RiskMitigationMatrix";
import { handleExportPptx } from "../../../components/deploymentGuide/pptxExport";

export { POLICE_DISCLOSURE_TEMPLATE_CONTENT, LEGAL_SCHEME_TEMPLATE_CONTENT };


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

      {/* ① 警察・行政向け セキュリティ実証自動デモ */}
      {activeDoc === "demo_guide" && (
        <PoliceDemoGuideView
          activeDemoScenario={activeDemoScenario}
          setActiveDemoScenario={setActiveDemoScenario}
          demoRunning={demoRunning}
          demoStep={demoStep}
          demoLogs={demoLogs}
          handleRunDemoScenario={handleRunDemoScenario}
          handleResetDemo={handleResetDemo}
          demoTargetName={demoTargetName}
          setDemoTargetName={setDemoTargetName}
          demoSearcherName={demoSearcherName}
          setDemoSearcherName={setDemoSearcherName}
          demoQuizAnswers={demoQuizAnswers}
          setDemoQuizAnswers={setDemoQuizAnswers}
          demoSpeed={demoSpeed}
          setDemoSpeed={setDemoSpeed}
          demoAutoNext={demoAutoNext}
          setDemoAutoNext={setDemoAutoNext}
          demoReportResolved={demoReportResolved}
          handleResolveDemoReport={handleResolveDemoReport}
        />
      )}

      {/* ② A4 1枚要約提出資料 */}
      {activeDoc === "a4_summary" && (
        <PoliceA4SummaryView
          handlePrintSummary={handlePrintSummary}
          handleExportPdf={handleExportPdf}
        />
      )}

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

