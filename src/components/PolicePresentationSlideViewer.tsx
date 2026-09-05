import React from 'react';
import pptxgen from 'pptxgenjs';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Trash2,
  FileText,
  Clock,
  UserCheck,
  Download,
  Award,
  Waves,
  Mail,
  School,
  Home,
  Users,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Radio,
  ExternalLink,
  Layers,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export interface SlideItem {
  id: number;
  title: string;
  subtitle?: string;
  category: string;
  points: string[];
  layout: 'title' | 'content';
}

interface PolicePresentationSlideViewerProps {
  slides: SlideItem[];
  scenarios: string[];
  onOpenScenarioDoc?: () => void;
}

export const PolicePresentationSlideViewer: React.FC<PolicePresentationSlideViewerProps> = ({
  slides,
  scenarios,
  onOpenScenarioDoc
}) => {
  const [activeSlideIdx, setActiveSlideIdx] = React.useState<number>(0);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [isLaserActive, setIsLaserActive] = React.useState<boolean>(false);
  const [laserPos, setLaserPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [timerSeconds, setTimerSeconds] = React.useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);
  const [showNotesDrawer, setShowNotesDrawer] = React.useState<boolean>(false);
  const [copiedScript, setCopiedScript] = React.useState<boolean>(false);
  const [notesFontSize, setNotesFontSize] = React.useState<'sm' | 'base' | 'lg'>('sm');
  const slideContainerRef = React.useRef<HTMLDivElement>(null);

  // Timer interval
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveSlideIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive || !slideContainerRef.current) return;
    const rect = slideContainerRef.current.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const copyCurrentScenario = () => {
    const text = scenarios[activeSlideIdx] || '';
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const downloadAllTextOutline = () => {
    const text = slides
      .map((s, idx) => {
        const ptsStr =
          s.points && s.points.length > 0
            ? s.points.map((pt) => `  • ${pt}`).join('\n')
            : s.subtitle
            ? `  ${s.subtitle}`
            : '';
        return `■ [スライド ${idx + 1}] カテゴリ：${s.category}\n  【タイトル】: ${s.title}\n${ptsStr}`;
      })
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ReMEETs_Police_Presentation_Outline.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPPTX = () => {
    try {
      const pptx = new pptxgen() as any;
      pptx.layout = 'LAYOUT_16x9';

      slides.forEach((slide, index) => {
        const pptxSlide = pptx.addSlide();
        const scenarioText = scenarios[index];
        if (scenarioText) {
          pptxSlide.addNotes(scenarioText);
        }

        if (slide.layout === 'title') {
          pptxSlide.background = { fill: '1A2735' };

          // Top badge
          pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', {
            x: 0.8,
            y: 0.8,
            w: 4.5,
            h: 0.4,
            fill: { color: '059669' }
          });
          pptxSlide.addText('POLICE & PUBLIC SAFETY COMPLIANCE REPORT', {
            x: 0.8,
            y: 0.8,
            w: 4.5,
            h: 0.4,
            fontSize: 9,
            fontFace: 'Arial',
            color: 'FFFFFF',
            bold: true,
            align: 'center',
            valign: 'middle'
          });

          pptxSlide.addText(slide.title, {
            x: 0.8,
            y: 1.5,
            w: 8.4,
            h: 2.2,
            fontSize: 24,
            fontFace: 'Hiragino Mincho ProN',
            color: 'FAFAF8',
            bold: true,
            align: 'left',
            valign: 'middle'
          });

          if (slide.subtitle) {
            pptxSlide.addText(slide.subtitle, {
              x: 0.8,
              y: 3.8,
              w: 8.4,
              h: 1.6,
              fontSize: 11,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: 'A5BFCF',
              align: 'left',
              valign: 'top'
            });
          }
        } else {
          pptxSlide.background = { fill: 'FAFAF8' };

          // Category tag
          pptxSlide.addText(slide.category || 'SECURITY AUDIT', {
            x: 0.8,
            y: 0.4,
            w: 8.4,
            h: 0.35,
            fontSize: 9.5,
            fontFace: 'Hiragino Kaku Gothic ProN',
            color: '059669',
            bold: true,
            align: 'left'
          });

          // Title
          pptxSlide.addText(slide.title, {
            x: 0.8,
            y: 0.8,
            w: 8.4,
            h: 0.75,
            fontSize: 17,
            fontFace: 'Hiragino Mincho ProN',
            color: '1A2735',
            bold: true,
            align: 'left'
          });

          // Left points
          if (slide.points && slide.points.length > 0) {
            const bulletText = slide.points.map((pt) => '✦  ' + pt).join('\n\n');
            pptxSlide.addText(bulletText, {
              x: 0.6,
              y: 1.6,
              w: 5.2,
              h: 3.5,
              fontSize: 10.5,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: '2C3E50',
              align: 'left',
              valign: 'top'
            });
          }

          // Right visual card
          const isDarkVisual = [3, 13, 20, 21, 22].includes(slide.id);
          const bgCol = isDarkVisual ? '1A2735' : 'FFFFFF';
          const lineCol = isDarkVisual ? '334155' : 'E2E8F0';
          const textCol = isDarkVisual ? 'FAFAF8' : '1A2735';

          pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', {
            x: 5.95,
            y: 1.5,
            w: 3.45,
            h: 3.6,
            fill: { color: bgCol },
            line: { color: lineCol, width: 1 }
          });

          // Slide 26 & 27 specific color coding in PPTX
          if (slide.id === 26) {
            pptxSlide.addText('PRICING & VERIFICATION', {
              x: 6.0,
              y: 1.6,
              w: 3.3,
              h: 0.3,
              fontSize: 8,
              fontFace: 'Courier New',
              color: '059669',
              bold: true,
              align: 'right'
            });
            // Free box (Green)
            pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', {
              x: 6.1,
              y: 2.1,
              w: 3.15,
              h: 0.9,
              fill: { color: 'ECFDF5' },
              line: { color: '10B981', width: 1 }
            });
            pptxSlide.addText('【無料（グリーン）】 年齢誓約 (18歳以上)', {
              x: 6.2,
              y: 2.2,
              w: 2.95,
              h: 0.3,
              fontSize: 8.5,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: '065F46',
              bold: true
            });
            pptxSlide.addText('・無料の宣誓のみで基本機能を利用可能', {
              x: 6.2,
              y: 2.5,
              w: 2.95,
              h: 0.4,
              fontSize: 7.5,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: '047857'
            });

            // 600 Yen box (Orange)
            pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', {
              x: 6.1,
              y: 3.15,
              w: 3.15,
              h: 0.9,
              fill: { color: 'FFF7ED' },
              line: { color: 'F97316', width: 1 }
            });
            pptxSlide.addText('【600円（オレンジ）】 公的身分証(eKYC)認証', {
              x: 6.2,
              y: 3.25,
              w: 2.95,
              h: 0.3,
              fontSize: 8.5,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: '9A3412',
              bold: true
            });
            pptxSlide.addText('・公的身分証＋生体認証による最高信頼性バッジ', {
              x: 6.2,
              y: 3.55,
              w: 2.95,
              h: 0.4,
              fontSize: 7.5,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: 'C2410C'
            });

            pptxSlide.addText('🛡️ 料金分離により消費者の誤認を完全防止', {
              x: 6.05,
              y: 4.3,
              w: 3.2,
              h: 0.5,
              fontSize: 8,
              fontFace: 'Hiragino Kaku Gothic ProN',
              color: '059669',
              align: 'center',
              bold: true
            });
          } else {
            pptxSlide.addText(`SECURITY PROTOCOL #${slide.id}`, {
              x: 6.0,
              y: 1.6,
              w: 3.3,
              h: 0.3,
              fontSize: 7.5,
              fontFace: 'Courier New',
              color: isDarkVisual ? '34D399' : '059669',
              bold: true,
              align: 'right'
            });

            pptxSlide.addText(slide.title, {
              x: 6.1,
              y: 2.2,
              w: 3.15,
              h: 0.8,
              fontSize: 9.5,
              fontFace: 'Hiragino Mincho ProN',
              color: textCol,
              bold: true,
              align: 'center'
            });

            if (slide.points && slide.points[0]) {
              pptxSlide.addText(slide.points[0], {
                x: 6.1,
                y: 3.0,
                w: 3.15,
                h: 1.8,
                fontSize: 8,
                fontFace: 'Hiragino Kaku Gothic ProN',
                color: isDarkVisual ? '94A3B8' : '475569',
                align: 'center'
              });
            }
          }

          // Footer
          pptxSlide.addText('ReMEETs 治安・防衛コンプライアンス管理事務局', {
            x: 0.8,
            y: 5.2,
            w: 6.0,
            h: 0.3,
            fontSize: 8,
            fontFace: 'Hiragino Kaku Gothic ProN',
            color: '94A3B8',
            align: 'left'
          });
          pptxSlide.addText(`Slide ${index + 1} / ${slides.length}`, {
            x: 7.0,
            y: 5.2,
            w: 2.2,
            h: 0.3,
            fontSize: 8,
            fontFace: 'Courier New',
            color: '94A3B8',
            align: 'right'
          });
        }
      });

      pptx.writeFile({
        fileName: '⑥ReMEETs警察・公安委員会事前相談用プレゼンテーションスライド.pptx'
      });
    } catch (e) {
      console.error(e);
      alert('PowerPointの生成中にエラーが発生しました。');
    }
  };

  // Render rich diagram cards for all 30 slides
  const renderSlideDiagram = (id: number) => {
    const cardBase =
      'flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200/80 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300';
    const tagBase =
      'absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-[#059669] font-bold tracking-widest leading-none bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full';

    switch (id) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1A2735] to-[#111A24] border border-slate-700/60 rounded-2xl h-full w-full min-h-[180px] shadow-lg relative text-white">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center mb-2 shadow-inner">
              <ShieldCheck className="text-emerald-400" size={32} />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
              GOVERNMENT COMPLIANCE
            </span>
            <span className="text-xs font-serif font-bold text-slate-100 mt-1">
              公安委員会・警察生活安全課 適合モデル
            </span>
          </div>
        );
      case 2: // 名前の由来
        return (
          <div className={cardBase}>
            <div className={tagBase}>RE-MEET ARCHITECTURE</div>
            <div className="flex items-center gap-3 sm:gap-5 z-10 my-auto">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 shadow-sm flex items-center justify-center text-slate-800 font-bold font-serif text-sm">
                  A
                </div>
                <span className="text-[9px] text-slate-600 mt-1 font-medium">あなた</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-emerald-700 font-mono leading-none bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  相互の記憶
                </span>
                <div className="h-[2px] w-14 sm:w-20 bg-gradient-to-r from-slate-300 via-emerald-500 to-slate-300 relative">
                  <div className="absolute -top-1 left-1/2 -ml-1 text-emerald-600 animate-pulse text-[10px]">
                    ✦
                  </div>
                </div>
                <span className="text-[8px] text-slate-500 font-mono">Re-meet</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-500 shadow-sm flex items-center justify-center text-emerald-700 font-bold font-serif text-sm">
                  B
                </div>
                <span className="text-[9px] text-emerald-700 mt-1 font-medium">懐かしい知人</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 mt-2 text-center leading-relaxed">
              不特定の「出会い」を排除し、過去の知人との「再会（Re-meet）」に特化。
            </p>
          </div>
        );
      case 3: // コンセプト
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              DRIFT CAPSULE
            </div>
            <div className="relative flex items-center justify-center w-full py-2 z-10">
              <Waves className="absolute text-emerald-500/20 animate-pulse w-20 h-20" />
              <div className="relative animate-bounce duration-1000">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-emerald-400/60 flex items-center justify-center shadow-lg">
                  <Mail size={22} className="text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[7px] font-mono font-bold">
                  16:9
                </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-300 mt-1 text-center leading-relaxed max-w-[220px]">
              投函から波間に漂流。記憶の暗号キーにより本人だけに届くボトルメール構造。
            </p>
          </div>
        );
      case 4: // 構築目的
        return (
          <div className={cardBase}>
            <div className={tagBase}>SOCIAL MISSION</div>
            <div className="grid grid-cols-3 gap-2 w-full my-auto z-10">
              <div className="flex flex-col items-center p-2 bg-rose-50/70 rounded-xl border border-rose-100 text-center">
                <Home size={16} className="text-rose-500" />
                <span className="text-[8px] font-bold text-rose-700 mt-1">孤立化防止</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-emerald-50/70 rounded-xl border border-emerald-100 text-center">
                <Users size={16} className="text-emerald-600" />
                <span className="text-[8px] font-bold text-emerald-700 mt-1">震災断絶回復</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-sky-50/70 rounded-xl border border-sky-100 text-center">
                <School size={16} className="text-sky-600" />
                <span className="text-[8px] font-bold text-sky-700 mt-1">自発的隣人網</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 mt-1 text-center leading-relaxed">
              家族・親族衰退期における、過去の恩師・同窓生とのセーフティネット再生。
            </p>
          </div>
        );
      case 5: // ターゲットユーザー
        return (
          <div className={cardBase}>
            <div className={tagBase}>TARGET GROUPS</div>
            <div className="grid grid-cols-2 gap-2 w-full my-auto z-10">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <School className="text-emerald-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">学校の同窓生</div>
                  <div className="text-[7px] text-slate-500">幼馴染・クラスメイト</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <Home className="text-sky-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">旧隣人・被災者</div>
                  <div className="text-[7px] text-slate-500">転居・区画整理で断絶</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <Users className="text-indigo-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">元同僚・仕事仲間</div>
                  <div className="text-[7px] text-slate-500">退職・部署移動後の再会</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <Award className="text-amber-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">恩師・指導者</div>
                  <div className="text-[7px] text-slate-500">感謝を伝えたい相手</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 6: // 主要機能①（投函＆漂流）
        return (
          <div className={cardBase}>
            <div className={tagBase}>FUNCTION: DRIFT</div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700 my-auto">
              <span className="text-[8.5px] bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                ① 国名＋名前投函
              </span>
              <ArrowRight size={12} className="text-slate-400" />
              <span className="text-[8.5px] bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                ② 漂流待機
              </span>
              <ArrowRight size={12} className="text-slate-400" />
              <span className="text-[8.5px] bg-emerald-50 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 font-bold">
                ③ クイズ開門
              </span>
            </div>
            <p className="text-[9px] text-slate-600 mt-2 text-center leading-relaxed">
              詳細住所不要。システム波間に漂流し、第三者から完全に遮断された空間。
            </p>
          </div>
        );
      case 7: // 主要機能②（想い出クイズゲート）
        return (
          <div className={cardBase}>
            <div className={tagBase}>QUIZ GATE SHIELD</div>
            <div className="flex flex-col gap-2 w-full my-auto z-10 max-w-[230px]">
              <div className="flex items-center gap-2.5 bg-slate-900 text-emerald-400 p-2.5 rounded-xl shadow-md border border-slate-800">
                <Lock size={18} className="animate-pulse shrink-0 text-emerald-400" />
                <div className="text-left flex flex-col">
                  <span className="text-[7.5px] font-mono text-emerald-400 tracking-wider">
                    QUIZ VERIFICATION GATE
                  </span>
                  <span className="text-[10px] font-bold text-white">
                    二人だけの共有記憶に全問正答で開門
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[7.5px] font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-900">
                <span>✦ 表記ゆれ自動救済 (Levenshtein ≤ 2)</span>
                <span className="font-bold bg-emerald-200 text-emerald-900 px-1 rounded">ACTIVE</span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 mt-1 text-center leading-tight">
              共通の想い出が高精度認証キーとなり、第三者を遮断しつつ正当な再会を支援。
            </p>
          </div>
        );
      case 8: // 主要機能③（連絡先安全引き渡しモデル）
        return (
          <div className={cardBase}>
            <div className={tagBase}>CONTACT BRIDGE</div>
            <div className="w-full flex flex-col gap-2 my-auto max-w-[220px] bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-slate-800">連絡先安全引き渡し（セキュア・ブリッジ）</span>
                </div>
                <ShieldCheck className="text-emerald-600" size={13} />
              </div>
              <div className="space-y-1">
                <div className="bg-white text-slate-800 text-[8.5px] p-2 rounded-xl border border-slate-200 font-mono">
                  <div className="text-[7px] text-slate-400">お相手の開示連絡先:</div>
                  <div className="font-bold text-emerald-700">LINE ID: @sample_friend</div>
                </div>
                <div className="bg-emerald-50 text-emerald-900 text-[7.5px] p-1.5 rounded-lg border border-emerald-200">
                  🔒 密室チャットを持たないクリーン設計で、トラブルや犯罪リスクをシステム構造上ゼロに。
                </div>
              </div>
            </div>
            <p className="text-[8.5px] text-emerald-800 font-bold text-center leading-normal mt-1 flex items-center justify-center gap-1">
              <Shield size={10} className="text-emerald-600" /> 緊急通報・ワンタップブロック機能常備
            </p>
          </div>
        );
      case 9: // 管理・運用①（セキュリティダッシュボード）
        return (
          <div className={cardBase}>
            <div className={tagBase}>SOC REALTIME</div>
            <div className="flex items-center gap-3 my-auto z-10 w-full justify-center">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 flex flex-col items-center shadow-sm">
                <ShieldAlert size={20} className="animate-bounce" />
                <span className="text-[7.5px] font-bold mt-1">検知盾</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                  THREAT MONITOR
                </span>
                <span className="text-[11px] font-bold text-rose-600 mt-1">不正突破：0件</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">
                  24時間総当たり・不正通信自動監視
                </p>
              </div>
            </div>
          </div>
        );
      case 10: // 管理・運用②（シャドウフラグ隔離）
        return (
          <div className={cardBase}>
            <div className={tagBase}>SHADOW FILTER</div>
            <div className="flex items-center justify-between w-full max-w-[220px] my-auto gap-2">
              <div className="flex flex-col items-center p-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                <span className="text-[7.5px] font-bold">悪質アクセス</span>
                <span className="text-[6.5px] font-mono mt-0.5 bg-rose-200/60 px-1 rounded">
                  shadow: 1
                </span>
              </div>
              <div className="h-[2px] bg-slate-300 w-10 relative flex items-center justify-center">
                <div className="absolute w-1.5 h-3 bg-rose-500 rounded-full" />
              </div>
              <div className="flex flex-col items-center p-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                <span className="text-[7.5px] font-bold">一般ユーザー</span>
                <span className="text-[6.5px] font-mono text-emerald-700 font-bold">影響 0%</span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center leading-normal mt-2">
              つきまとい者の投稿は、本人には成功と見せかけ裏側で完全隔離。
            </p>
          </div>
        );
      case 11: // 非機能①（最高レベルの暗号化）
        return (
          <div className={cardBase}>
            <div className={tagBase}>CRYPTOGRAPHIC ENGINE</div>
            <div className="flex flex-col items-center gap-1.5 my-auto z-10">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-800 font-serif">
                  SHA-256 不可逆ストレッチ
                </span>
              </div>
              <div className="text-[8.5px] font-mono bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-200 text-slate-600">
                salt_key_hash_5a9b8dc9...
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center leading-relaxed">
              想い出パスワードが平文で保存されることは一切ありません。
            </p>
          </div>
        );
      case 12: // 非機能②（即時オプトアウト）
        return (
          <div className={cardBase}>
            <div className={tagBase}>ZERO TRACE PRIVACY</div>
            <div className="flex items-center gap-3.5 my-auto z-10">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
                <Trash2 size={20} className="animate-pulse" />
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-mono text-rose-500 uppercase tracking-widest leading-none">
                  OPT-OUT GUARANTEE
                </span>
                <span className="text-[11px] font-bold text-slate-800 mt-1">
                  24時間以内物理削除の保証
                </span>
                <p className="text-[8.5px] text-slate-500 leading-tight">
                  物理サーバーからもデータを完全に消去
                </p>
              </div>
            </div>
          </div>
        );
      case 13: // システム構成
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              SYSTEM TOPOLOGY
            </div>
            <div className="grid grid-cols-3 gap-2 w-full max-w-[220px] my-auto text-slate-300">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7px] text-emerald-400 font-mono">SPA</span>
                <span className="font-bold text-white mt-1 text-[8.5px]">React 18</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7px] text-emerald-400 font-mono">Server</span>
                <span className="font-bold text-emerald-300 mt-1 text-[8.5px]">Express</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7px] text-emerald-400 font-mono">Security</span>
                <span className="font-bold text-sky-300 mt-1 text-[8.5px]">Gemini AI</span>
              </div>
            </div>
            <p className="text-[8px] text-slate-400 text-center leading-normal mt-1">
              サーバーサイドAPIプロキシ。APIキーはブラウザに一切露出しません。
            </p>
          </div>
        );
      case 14: // 対比分析
        return (
          <div className={cardBase}>
            <div className={tagBase}>COMPARISON MATRIX</div>
            <div className="flex flex-col gap-2 w-full my-auto text-xs max-w-[210px]">
              <div className="flex items-center justify-between p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-[8.5px]">
                <span>一般的なマッチング</span>
                <span className="font-bold">無差別（危険✕）</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-[8.5px]">
                <span>ReMEETs 再会モデル</span>
                <span className="font-bold">既知限定（安全◯）</span>
              </div>
            </div>
          </div>
        );
      case 15: // 第2部表紙
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1A2735] to-[#111A24] border border-slate-700/60 rounded-2xl h-full w-full min-h-[180px] shadow-lg relative text-white">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center mb-2">
              <Award className="text-emerald-400" size={28} />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
              LEGAL & SECURITY DEEP DIVE
            </span>
            <span className="text-xs font-serif font-bold text-slate-100 mt-1">
              第2部：法規適合性と10大防衛アーキテクチャ
            </span>
          </div>
        );
      case 16: // 異性紹介事業非該当の証明
        return (
          <div className={cardBase}>
            <div className={tagBase}>LEGAL OPINION</div>
            <div className="flex items-center gap-3 my-auto z-10 text-emerald-800 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider leading-none">
                  POLICE ADAPTATION
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  「異性紹介事業」非該当 判定
                </span>
                <p className="text-[8px] text-slate-600 leading-tight">警察公安・行政書面要件適合</p>
              </div>
            </div>
          </div>
        );
      case 17: // 共有記憶認証法理
        return (
          <div className={cardBase}>
            <div className={tagBase}>AUTHENTICATION LAW</div>
            <div className="flex flex-col items-center gap-1 my-auto text-emerald-800">
              <Unlock size={22} className="text-emerald-600" />
              <span className="text-[10.5px] font-bold mt-1 text-slate-800">
                既知の記憶 ＝ 暗号通信路の鍵
              </span>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center leading-normal">
              二人だけの記憶クイズが、「新規出会い」ではない事実を電子証明。
            </p>
          </div>
        );
      case 18: // 時間制限ロック
        return (
          <div className={cardBase}>
            <div className={tagBase}>IP BRUTE GUARD</div>
            <div className="flex flex-col items-center gap-2 my-auto text-red-600 w-full">
              <div className="flex items-center gap-3 bg-rose-50 p-2.5 rounded-xl border border-rose-200 max-w-[220px]">
                <Clock size={20} className="text-rose-500 animate-spin-slow shrink-0" />
                <div className="text-left">
                  <span className="text-[7.5px] font-bold text-rose-500 uppercase tracking-widest leading-none">
                    LOCKOUT SYSTEM
                  </span>
                  <div className="text-[11px] font-bold text-slate-900 mt-0.5 leading-tight">
                    5回連続誤答で24H完全ロック
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-rose-400 font-mono text-[7.5px] px-2.5 py-0.5 rounded border border-rose-900 animate-pulse">
                STATUS: IP_LOCKOUT_ACTIVE
              </div>
            </div>
          </div>
        );
      case 19: // 常用姓名照合
        return (
          <div className={cardBase}>
            <div className={tagBase}>NAME REGEX DEFENSE</div>
            <div className="flex items-center gap-3.5 my-auto z-10">
              <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl">
                <UserCheck size={20} />
              </div>
              <div className="text-left flex flex-col">
                <span className="text-[8px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 self-start">
                  フルネーム規制
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  「山田太郎」等の実名は警告
                </span>
                <p className="text-[8px] text-slate-500 leading-tight">本名の直截露出から保護</p>
              </div>
            </div>
          </div>
        );
      case 20: // 連絡先ステルス
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              STEALTH MASK
            </div>
            <div className="w-full flex flex-col gap-1 max-w-[220px] my-auto bg-slate-900 rounded-xl p-2.5 border border-slate-800 font-mono text-[8px] text-left">
              <div className="flex items-center justify-between text-[7px] text-slate-500 pb-1 border-b border-slate-800">
                <span>REGEX SCAN FILTER</span>
                <span className="text-rose-400 font-bold animate-pulse">BLOCKED</span>
              </div>
              <div className="space-y-1 text-slate-300 mt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 line-through">LINE ID: my_id_123</span>
                  <span className="text-rose-400 font-bold">→ MASK_ID</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 line-through">TEL: 090-1234-5678</span>
                  <span className="text-rose-400 font-bold">→ MASK_TEL</span>
                </div>
                <div className="pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                  RESULT: LINE ID: **** / TEL: ****
                </div>
              </div>
            </div>
          </div>
        );
      case 21: // Gemini AI モデレーション
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              SEMANTIC AI FILTER
            </div>
            <div className="w-full flex flex-col gap-1.5 my-auto max-w-[220px] text-left">
              <div className="bg-slate-900 text-white rounded-xl p-2.5 border border-slate-800 font-mono text-[8px] space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Sparkles size={10} /> Gemini Security Agent
                  </span>
                  <span>v2.5</span>
                </div>
                <div className="text-slate-400 leading-tight">
                  INPUT: "お前どこにいる？絶対探すからな"
                </div>
                <div className="border-t border-slate-800 pt-1 flex flex-col gap-0.5">
                  <div className="text-rose-400 font-bold flex items-center justify-between">
                    <span>危険検知:</span>
                    <span className="bg-rose-950 text-rose-300 px-1 rounded">執着・脅迫性 98%</span>
                  </div>
                  <div className="text-emerald-400 font-bold flex items-center justify-between">
                    <span>自動処置:</span>
                    <span className="bg-emerald-950 text-emerald-300 px-1 rounded">即時隔離作動</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 22: // シャドウフィルタ
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              SHADOW SANDBOX
            </div>
            <div className="w-full max-w-[200px] bg-slate-900 rounded-xl p-2.5 font-mono text-[8px] text-emerald-400 my-auto shadow-md text-left">
              <div className="text-slate-500">$ sys_shadow_scan</div>
              <div className="text-rose-400 font-bold">$ ATTACK DETECTED !</div>
              <div className="text-emerald-300 font-bold animate-pulse">
                $ SHADOW_FLAG_ISOLATION: ON
              </div>
            </div>
            <p className="text-[8.5px] text-slate-300 text-center leading-normal mt-1.5">
              冷やかし・荒らしユーザーは孤立した空間に送られます。
            </p>
          </div>
        );
      case 23: // 青少年保護
        return (
          <div className={cardBase}>
            <div className={tagBase}>YOUTH PROTECTION</div>
            <div className="flex items-center gap-3.5 my-auto z-10 text-red-600 bg-rose-50/70 p-2.5 rounded-2xl border border-rose-200">
              <div className="w-10 h-10 border-2 border-rose-500 rounded-full flex items-center justify-center font-bold text-rose-500 text-xs sm:text-sm font-sans shrink-0">
                18+
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none">
                  MINOR PROTECTION
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">高校生以下は完全不可</span>
                <p className="text-[8px] text-slate-500 leading-tight">非行・児童虐待被害を徹底予防</p>
              </div>
            </div>
          </div>
        );
      case 24: // 電子手書き署名
        return (
          <div className={cardBase}>
            <div className={tagBase}>DIGITAL SIGNATURE</div>
            <div className="flex flex-col items-center gap-1.5 w-full my-auto">
              <div className="w-full max-w-[190px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 relative shadow-sm text-left">
                <div className="text-[7px] text-slate-400 font-mono">宣誓立会署名 (Touch Signature)</div>
                <div className="h-9 w-full flex items-center justify-center relative mt-1 select-none">
                  <svg className="w-full h-full text-emerald-700" viewBox="0 0 100 40">
                    <path
                      d="M 10 25 C 20 15, 30 10, 45 20 C 55 25, 60 5, 75 15 C 85 20, 90 28, 95 18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="95" cy="18" r="2" fill="#E11D48" className="animate-ping" />
                  </svg>
                  <span className="absolute bottom-0 right-1 text-[6.5px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-200">
                    ✓ VERIFIED
                  </span>
                </div>
              </div>
              <p className="text-[8.5px] text-emerald-800 font-bold text-center leading-normal">
                法令遵守。ストーカー行為等を行わない誓約の手書き宣誓
              </p>
            </div>
          </div>
        );
      case 25: // チケット全履歴保全
        return (
          <div className={cardBase}>
            <div className={tagBase}>TICKET & AI DRAFT</div>
            <div className="w-full max-w-[230px] bg-slate-50 rounded-xl p-2.5 shadow-sm border border-slate-200 flex flex-col gap-1.5 my-auto text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="text-[8.5px] font-bold text-slate-900 flex items-center gap-1">
                  🎫 チケットスレッド永続化
                </span>
                <span className="text-[6.5px] font-mono bg-sky-100 text-sky-800 px-1 py-0.5 rounded">
                  TICKET_DB
                </span>
              </div>
              <div className="space-y-1 text-[7.5px] font-mono">
                <div className="bg-white p-1 rounded border border-slate-200 text-slate-700">
                  <span className="text-slate-400">#REQ-1092:</span> ユーザーからの通報・相談内容
                </div>
                <div className="bg-purple-50 p-1 rounded border border-purple-200 text-purple-900 flex items-center justify-between">
                  <span>✨ Gemini AI コンプライアンス返信</span>
                  <span className="text-[6.5px] bg-purple-200 text-purple-800 px-1 rounded">生成完了</span>
                </div>
              </div>
              <div className="text-[7px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between">
                <span>送受信全ログ完全永続化</span>
                <span className="text-emerald-700 font-bold">警察・司法証拠保全</span>
              </div>
            </div>
          </div>
        );
      case 26: // 【USER REQUEST: 無料はグリーン、600円はオレンジで分離】
        return (
          <div className={cardBase}>
            <div className={tagBase}>PRICING & VERIFICATION</div>
            <div className="w-full max-w-[230px] flex flex-col gap-2 my-auto">
              {/* 無料 (グリーン) */}
              <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-500/80 px-3 py-2 rounded-xl text-left shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                    FREE TIER
                  </span>
                  <span className="text-[10px] font-bold text-emerald-950">
                    年齢確認（18歳以上宣誓）
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full shadow-sm">
                  無料
                </span>
              </div>

              {/* 600円 (オレンジ) */}
              <div className="flex items-center justify-between bg-orange-50 border-2 border-orange-500/80 px-3 py-2 rounded-xl text-left shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-mono text-orange-700 font-bold uppercase tracking-wider">
                    OFFICIAL eKYC
                  </span>
                  <span className="text-[10px] font-bold text-orange-950">
                    公的身分証(eKYC)認証
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-white bg-orange-600 px-2.5 py-0.5 rounded-full shadow-sm">
                  600円
                </span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center mt-1">
              明確な料金分離により消費者の誤認を防止し、法令を遵守。
            </p>
          </div>
        );
      case 27: // eKYC・決済連携
        return (
          <div className={cardBase}>
            <div className={tagBase}>EKYC & STRIPE COUPLING</div>
            <div className="flex flex-col items-center gap-1.5 w-full z-10 max-w-[230px]">
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl w-full justify-between text-left">
                <span className="text-[8.5px] font-bold text-orange-950">
                  💳 Stripe 決済（600円仮売上）
                </span>
                <span className="text-[7px] bg-orange-200 text-orange-900 font-bold px-1.5 py-0.5 rounded">
                  仮売上確保
                </span>
              </div>
              <div className="h-2 w-[2px] bg-dashed bg-slate-300 relative">
                <span className="absolute -left-1 -top-1 text-slate-400 text-[6px]">▼</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl w-full justify-between text-left">
                <span className="text-[8.5px] font-bold text-emerald-950">
                  🆔 eKYC 審査（TRUSTDOCK等）
                </span>
                <span className="text-[7px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                  自動分岐
                </span>
              </div>
              <div className="flex justify-between w-full text-[7.5px] text-slate-600 font-mono mt-0.5 px-1">
                <span>【承認】実請求＆バッジ点灯</span>
                <span className="text-orange-700 font-bold">【否認】即全額自動返金</span>
              </div>
            </div>
          </div>
        );
      case 28: // フォレンジックログ
        return (
          <div className={cardBase}>
            <div className={tagBase}>JUDICIAL ALIGNMENT</div>
            <div className="w-full flex flex-col gap-1.5 my-auto max-w-[220px] bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm text-left">
              <div className="flex items-center gap-1 text-slate-900 border-b border-slate-200 pb-1 w-full justify-between">
                <span className="flex items-center gap-1 font-bold text-[8.5px]">
                  <FileText size={12} className="text-emerald-700" /> forensic_export.pdf
                </span>
                <span className="text-[6.5px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1 rounded border border-emerald-200">
                  SECURE
                </span>
              </div>
              <div className="space-y-0.5 text-[7px] font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>要求番号:</span> <span className="font-bold">#REQ-2026-9912</span>
                </div>
                <div className="flex justify-between">
                  <span>対象IP:</span> <span className="font-bold">184.22.95.101</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>認証合意:</span> <span>一致 (VALID SIGN)</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-1 bg-[#1A2735] text-white text-[8px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-default"
              >
                <Download size={10} /> 捜査資料1キー抽出
              </button>
            </div>
            <p className="text-[8px] text-slate-500 text-center leading-normal mt-1">
              捜査事項照会書に数分で完全対応する証拠エクスポート
            </p>
          </div>
        );
      case 29: // オプトアウト申請処理
        return (
          <div className={cardBase}>
            <div className={tagBase}>OPT-OUT AUDIT</div>
            <div className="flex items-center gap-3.5 my-auto z-10 text-emerald-800 bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200">
              <Shield size={22} className="text-emerald-600 animate-pulse" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider leading-none">
                  AUTO OPT-OUT
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  「二度と繋がらない」権利
                </span>
                <p className="text-[8px] text-slate-500 leading-tight">全データ即時遮断</p>
              </div>
            </div>
          </div>
        );
      case 30: // 総括
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 rounded-2xl h-full w-full min-h-[180px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className={tagBase}>GRAND SUMMARY</div>
            <div className="flex items-center gap-3.5 my-auto z-10 bg-white/80 p-3 rounded-2xl border border-emerald-200 shadow-sm">
              <Award size={26} className="text-emerald-600 shrink-0" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider leading-none">
                  100% POLICE COMPLIANT
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  治安・防衛コンプライアンス適合証明
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Filter slides based on category tabs
  const filteredSlides = React.useMemo(() => {
    if (categoryFilter === 'all') return slides;
    if (categoryFilter === 'overview') return slides.filter((s) => s.id <= 5);
    if (categoryFilter === 'features') return slides.filter((s) => s.id >= 6 && s.id <= 8);
    if (categoryFilter === 'admin') return slides.filter((s) => s.id >= 9 && s.id <= 14);
    if (categoryFilter === 'legal') return slides.filter((s) => s.id >= 15 && s.id <= 17);
    if (categoryFilter === 'defense') return slides.filter((s) => s.id >= 18 && s.id <= 25);
    if (categoryFilter === 'pricing_police') return slides.filter((s) => s.id >= 26 && s.id <= 30);
    return slides;
  }, [slides, categoryFilter]);

  const activeSlide = slides[activeSlideIdx] || slides[0];

  return (
    <div className="space-y-6">
      {/* Category Quick-Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/95 p-2 rounded-2xl border border-slate-800 text-xs">
        <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-1 flex items-center gap-1">
          <Layers size={13} />
          <span>章別フィルタ:</span>
        </span>
        {[
          { id: 'all', label: `すべて (${slides.length})` },
          { id: 'overview', label: '1. 概要・理念 (5)' },
          { id: 'features', label: '2. 主要機能 (3)' },
          { id: 'admin', label: '3. 管理・運用 (6)' },
          { id: 'legal', label: '4. 法規適合性 (3)' },
          { id: 'defense', label: '5. 安全防衛 (8)' },
          { id: 'pricing_police', label: '6. 料金・警察連携 (5)' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
              categoryFilter === tab.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main 16:9 Presentation Canvas Container */}
      <div
        ref={slideContainerRef}
        onMouseMove={handleMouseMove}
        className={`w-full relative overflow-hidden rounded-3xl border border-slate-300 shadow-xl transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none bg-black flex flex-col justify-center items-center p-4 sm:p-8'
            : 'bg-slate-900'
        }`}
      >
        {/* Virtual Laser Pointer */}
        {isLaserActive && (
          <div
            className="absolute pointer-events-none z-50 w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
          />
        )}

        {/* 16:9 Canvas */}
        <div
          id="active-slide-preview"
          className={`aspect-[16/9] w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-10 flex flex-col justify-between select-none relative overflow-hidden transition-all duration-300 ${
            activeSlide?.layout === 'title'
              ? 'bg-[#1A2735] text-[#FAFAF8]'
              : 'bg-white text-slate-900 border border-slate-200/60 shadow-sm'
          }`}
        >
          {/* Title Slide Layout */}
          {activeSlide?.layout === 'title' ? (
            <div className="space-y-4 text-left px-2 sm:px-8 md:px-12 my-auto z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/40 px-3 py-1 rounded-full text-emerald-400 font-mono text-[9px] sm:text-xs font-bold">
                <ShieldCheck size={14} />
                <span>POLICE & PUBLIC SAFETY COMPLIANCE REPORT</span>
              </div>
              <h2 className="text-base sm:text-2xl md:text-3xl font-bold font-serif leading-snug whitespace-pre-wrap tracking-wide text-white">
                {activeSlide?.title}
              </h2>
              {activeSlide?.subtitle && (
                <p className="text-[9px] sm:text-xs md:text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-wrap border-t border-slate-700 pt-3">
                  {activeSlide?.subtitle}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Content Slide Header */}
              <div className="space-y-1 sm:space-y-2 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                    <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 tracking-wider uppercase font-sans">
                      {activeSlide?.category}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    SLIDE {String(activeSlideIdx + 1).padStart(2, '0')} / {slides.length}
                  </span>
                </div>
                <h3 className="text-xs sm:text-base md:text-xl font-bold font-serif text-[#1A2735]">
                  {activeSlide?.title}
                </h3>
                <div className="w-full h-[1.5px] bg-slate-200" />
              </div>

              {/* Content Slide Body */}
              <div className="flex-grow flex flex-col justify-center my-auto overflow-hidden z-10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <ul className="space-y-2 sm:space-y-3 px-2 text-left md:col-span-3">
                    {activeSlide?.points?.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        className="flex items-start gap-2.5 text-[10.5px] sm:text-xs md:text-[13.5px] font-sans text-slate-800 leading-relaxed"
                      >
                        <span className="text-emerald-600 mt-0.5 text-xs select-none">✦</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="hidden md:flex md:col-span-2 items-center justify-center">
                    {renderSlideDiagram(activeSlide?.id)}
                  </div>
                </div>
              </div>

              {/* Content Slide Footer */}
              <div className="flex justify-between items-center text-[8px] sm:text-[9.5px] text-slate-400 border-t border-slate-200 pt-2 font-mono z-10">
                <span>ReMEETs 治安・防衛コンプライアンス管理事務局</span>
                <span>CONFIDENTIAL & POLICE AUDIT READY</span>
              </div>
            </>
          )}
        </div>

        {/* Fullscreen Floating Controls Dock */}
        {isFullscreen && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-4 text-white z-50 shadow-2xl">
            <button
              onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIdx === 0}
              className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-mono font-bold">
              {activeSlideIdx + 1} / {slides.length}
            </span>
            <button
              onClick={() => setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIdx === slides.length - 1}
              className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
            <div className="h-4 w-[1px] bg-slate-700" />
            <button
              onClick={() => setIsLaserActive((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isLaserActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Radio size={14} />
              <span>レーザー</span>
            </button>
            <button
              onClick={() => setShowNotesDrawer((prev) => !prev)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
            >
              台本
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer text-slate-300"
            >
              <Minimize2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Presenter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-md">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
            disabled={activeSlideIdx === 0}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={activeSlideIdx === slides.length - 1}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-xs font-mono text-emerald-400 font-bold ml-1">
            スライド {activeSlideIdx + 1} / {slides.length} 葉
          </span>
        </div>

        {/* Stopwatch Timer & Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stopwatch */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock size={14} className="text-emerald-400" />
            <span className="font-mono text-xs font-bold text-white">
              {formatTimer(timerSeconds)}
            </span>
            <button
              type="button"
              onClick={() => setIsTimerRunning((prev) => !prev)}
              className="p-1 hover:text-emerald-400 cursor-pointer ml-1"
            >
              {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-1 hover:text-rose-400 cursor-pointer"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Laser toggle */}
          <button
            type="button"
            onClick={() => setIsLaserActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isLaserActive
                ? 'bg-rose-600 text-white ring-2 ring-rose-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Radio size={14} />
            <span className="hidden sm:inline">レーザーポインタ</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline">フルスクリーン (F)</span>
          </button>

          {/* PPTX Export */}
          <button
            type="button"
            onClick={handleDownloadPPTX}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download size={14} />
            <span>PowerPoint (.pptx) 出力</span>
          </button>
        </div>
      </div>

      {/* Thumbnail Carousel Selector Strip */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 border-t border-slate-200 pt-4">
        {filteredSlides.map((slide) => {
          const originalIdx = slides.findIndex((s) => s.id === slide.id);
          const isSelected = activeSlideIdx === originalIdx;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlideIdx(originalIdx)}
              className={`text-left p-2 rounded-xl transition-all border text-xs cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/30'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-[9px] text-slate-400 font-mono font-bold">
                SLIDE {String(slide.id).padStart(2, '0')}
              </div>
              <div className="truncate font-sans font-medium text-[9.5px] mt-0.5">
                {slide.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Presenter Scenario Script (口頭発表台本) */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 space-y-4 font-sans shadow-lg animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white flex items-center gap-2 tracking-wide">
              🎤 本スライドの警察・公安向けプレゼン発表シナリオ（口頭発表台本）
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {/* Font size adjustments */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px]">
              <button
                type="button"
                onClick={() => setNotesFontSize('sm')}
                className={`px-2 py-0.5 rounded ${
                  notesFontSize === 'sm' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                }`}
              >
                小
              </button>
              <button
                type="button"
                onClick={() => setNotesFontSize('base')}
                className={`px-2 py-0.5 rounded ${
                  notesFontSize === 'base' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                }`}
              >
                中
              </button>
              <button
                type="button"
                onClick={() => setNotesFontSize('lg')}
                className={`px-2 py-0.5 rounded ${
                  notesFontSize === 'lg' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                }`}
              >
                大
              </button>
            </div>

            <button
              type="button"
              onClick={copyCurrentScenario}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              {copiedScript ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedScript ? 'コピー完了' : '台本をコピー'}</span>
            </button>

            <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              SLIDE {String(activeSlideIdx + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div
          className={`leading-relaxed text-slate-300 whitespace-pre-wrap pl-1 font-sans ${
            notesFontSize === 'sm' ? 'text-xs' : notesFontSize === 'base' ? 'text-sm' : 'text-base'
          }`}
        >
          {scenarios[activeSlideIdx] || '本スライドのシナリオスクリプト'}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-800/60 gap-2">
          <span>💡 左右キー (←/→) やスライドクリックで、この台本も自動連動して同期します。</span>
          {onOpenScenarioDoc && (
            <button
              type="button"
              onClick={onOpenScenarioDoc}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer uppercase tracking-wide border border-emerald-500/30 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-all font-sans"
            >
              全30枚の全編シナリオをPDF印刷・確認 ➜
            </button>
          )}
        </div>
      </div>

      {/* Text Outline section */}
      <div className="mt-8 border-t border-slate-200 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-emerald-700" />
              <span>構成案の全編テキスト出力（確認・コピー用）</span>
            </h4>
            <p className="text-[10px] text-slate-500 font-sans">
              全30枚のスライド構成、カテゴリ、タイトル、箇条書き項目をすべて一覧で確認・ダウンロードできます。
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                const text = slides
                  .map((s, idx) => {
                    const ptsStr =
                      s.points && s.points.length > 0
                        ? s.points.map((pt) => `  • ${pt}`).join('\n')
                        : s.subtitle
                        ? `  ${s.subtitle}`
                        : '';
                    return `■ [スライド ${idx + 1}] カテゴリ：${s.category}\n  【タイトル】: ${s.title}\n${ptsStr}`;
                  })
                  .join('\n\n');
                navigator.clipboard.writeText(text);
                alert('プレゼン全体の構成テキストをクリップボードにコピーしました！');
              }}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-emerald-200"
            >
              <Copy size={13} />
              <span>テキストをコピー</span>
            </button>
            <button
              type="button"
              onClick={downloadAllTextOutline}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>テキストファイルを保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
