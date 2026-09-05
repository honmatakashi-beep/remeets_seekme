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
  const [slideFontScale, setSlideFontScale] = React.useState<'normal' | 'large' | 'xlarge'>('large');
  const [copiedScript, setCopiedScript] = React.useState<boolean>(false);
  const [notesFontSize, setNotesFontSize] = React.useState<'sm' | 'base' | 'lg'>('sm');
  const slideContainerRef = React.useRef<HTMLDivElement>(null);
  const channelRef = React.useRef<BroadcastChannel | null>(null);
  const presenterWindowRef = React.useRef<Window | null>(null);

  // BroadcastChannel for presenter window sync
  React.useEffect(() => {
    try {
      const ch = new BroadcastChannel('remeets_presenter_sync');
      channelRef.current = ch;
      ch.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'NAVIGATE' && typeof payload?.index === 'number') {
          setActiveSlideIdx(payload.index);
        } else if (type === 'TIMER_TOGGLE') {
          setIsTimerRunning((prev) => !prev);
        } else if (type === 'TIMER_RESET') {
          setIsTimerRunning(false);
          setTimerSeconds(0);
        }
      };
      return () => {
        ch.close();
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
  }, []);

  // Broadcast state changes to presenter window
  React.useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'SLIDE_CHANGE',
        payload: {
          index: activeSlideIdx,
          total: slides.length,
          slide: slides[activeSlideIdx],
          scenario: scenarios[activeSlideIdx] || '',
          nextSlide: slides[activeSlideIdx + 1] || null,
          timerSeconds,
          isTimerRunning
        }
      });
    }
  }, [activeSlideIdx, slides, scenarios, timerSeconds, isTimerRunning]);

  // Open independent Presenter Console Window
  const openPresenterWindow = () => {
    const w = 780;
    const h = 880;
    const left = (window.screen.width - w) / 2;
    const top = (window.screen.height - h) / 2;
    const newWin = window.open(
      '',
      'ReMEETsPresenterConsole',
      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
    );
    if (!newWin) {
      alert('ポップアップがブロックされました。ブラウザのポップアップ許可を有効にしてください。');
      return;
    }
    presenterWindowRef.current = newWin;

    const currentSlide = slides[activeSlideIdx] || { title: '', category: '', points: [] };
    const currentScenario = scenarios[activeSlideIdx] || 'このスライドの口頭シナリオは設定されていません。';
    const nextSlide = slides[activeSlideIdx + 1];

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>🎤 ReMEETs 発表者用台本コンソール (Presenter View)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif; }
    .serif-text { font-family: "Hiragino Mincho ProN", "Yu Mincho", serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col p-4 select-none">
  <header class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
      <h1 class="text-sm font-bold tracking-wide text-white font-mono">ReMEETs 警察説明 発表者用台本ビュー</h1>
    </div>
    <div class="flex items-center gap-3">
      <div id="timer-box" class="bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl text-emerald-400 font-mono text-sm font-bold flex items-center gap-2">
        <span>⏱️</span>
        <span id="timer-display">00:00</span>
      </div>
      <button id="btn-timer-toggle" class="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer">再生/停止</button>
      <button id="btn-timer-reset" class="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1 rounded-lg font-bold text-rose-400 cursor-pointer">リセット</button>
    </div>
  </header>

  <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 mb-4">
    <div class="flex items-center gap-2">
      <button id="btn-prev" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold cursor-pointer transition">◀ 前へ</button>
      <button id="btn-next" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold cursor-pointer text-white shadow-md transition">次へ ▶</button>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs text-slate-400 font-mono">スライド選択:</span>
      <select id="slide-select" class="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold cursor-pointer max-w-[280px]">
        ${slides.map((s, i) => `<option value="${i}" ${i === activeSlideIdx ? 'selected' : ''}>SLIDE ${i + 1}: ${s.category} - ${s.title.slice(0, 18)}...</option>`).join('')}
      </select>
    </div>
    <div class="text-xs font-mono font-bold text-emerald-400">
      <span id="slide-num">${activeSlideIdx + 1}</span> / ${slides.length} 葉
    </div>
  </div>

  <main class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
    <div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div>
            <span id="slide-cat" class="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">${currentSlide.category}</span>
            <h2 id="slide-title" class="text-base font-bold text-white mt-1.5 leading-snug">${currentSlide.title}</h2>
          </div>
          <div class="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <button id="font-sm" class="px-2 py-1 rounded text-slate-400 hover:text-white cursor-pointer">小</button>
            <button id="font-md" class="px-2 py-1 rounded text-slate-400 hover:text-white cursor-pointer">標準</button>
            <button id="font-lg" class="px-2 py-1 rounded bg-slate-700 text-white font-bold cursor-pointer">大</button>
            <button id="font-xl" class="px-2 py-1 rounded text-slate-400 hover:text-white cursor-pointer">特大</button>
          </div>
        </div>
        <div class="text-xs text-slate-400 font-bold mb-2">🎤 口頭発表シナリオ（読み上げ原稿）:</div>
        <div id="scenario-content" class="serif-text text-slate-100 text-base leading-relaxed overflow-y-auto max-h-[46vh] pr-2 whitespace-pre-wrap selection:bg-emerald-500 selection:text-white bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
          ${currentScenario}
        </div>
      </div>
      <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>キーボード [←] [→] [Space] でスライド同期移動</span>
        <button id="btn-copy" class="text-emerald-400 hover:underline cursor-pointer font-bold">📋 台本をコピー</button>
      </div>
    </div>

    <div class="space-y-4 flex flex-col justify-between">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex-grow shadow-lg">
        <h3 class="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 mb-2 flex items-center gap-1.5">
          <span>📌</span>
          <span>現在のスライド要点</span>
        </h3>
        <ul id="points-list" class="space-y-2 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[30vh]">
          ${(currentSlide.points || []).map(p => `<li class="flex items-start gap-1.5"><span class="text-emerald-400 mt-0.5">•</span><span>${p}</span></li>`).join('')}
        </ul>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-lg">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">⏭️ 次のスライド予告:</div>
        <div id="next-title" class="text-xs font-bold text-slate-200 line-clamp-2">
          ${nextSlide ? nextSlide.title : '（最後のスライドです）'}
        </div>
        <div id="next-cat" class="text-[10px] text-emerald-400/80 mt-1 font-mono">
          ${nextSlide ? nextSlide.category : ''}
        </div>
      </div>
    </div>
  </main>

  <script>
    const ch = new BroadcastChannel('remeets_presenter_sync');
    const slidesData = ${JSON.stringify(slides)};
    const scenariosData = ${JSON.stringify(scenarios)};
    let currentIndex = ${activeSlideIdx};
    let timerSec = 0;
    let isTimerRunning = false;
    let timerInterval = null;

    function updateView(data) {
      if (!data) return;
      currentIndex = data.index;
      const slide = data.slide || slidesData[currentIndex] || {};
      const scenario = data.scenario || scenariosData[currentIndex] || '';
      const nextSlide = data.nextSlide || slidesData[currentIndex + 1];

      document.getElementById('slide-num').textContent = currentIndex + 1;
      document.getElementById('slide-select').value = currentIndex;
      document.getElementById('slide-cat').textContent = slide.category || '';
      document.getElementById('slide-title').textContent = slide.title || '';
      document.getElementById('scenario-content').textContent = scenario;

      const ptsUl = document.getElementById('points-list');
      ptsUl.innerHTML = (slide.points || []).map(p => '<li class="flex items-start gap-1.5"><span class="text-emerald-400 mt-0.5">•</span><span>' + p + '</span></li>').join('');

      document.getElementById('next-title').textContent = nextSlide ? nextSlide.title : '（最後のスライドです）';
      document.getElementById('next-cat').textContent = nextSlide ? nextSlide.category : '';

      document.getElementById('btn-prev').disabled = currentIndex === 0;
      document.getElementById('btn-next').disabled = currentIndex === slidesData.length - 1;
    }

    ch.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'SLIDE_CHANGE') {
        updateView(payload);
      }
    };

    document.getElementById('btn-prev').onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        ch.postMessage({ type: 'NAVIGATE', payload: { index: currentIndex } });
        updateView({ index: currentIndex, slide: slidesData[currentIndex], scenario: scenariosData[currentIndex] });
      }
    };

    document.getElementById('btn-next').onclick = () => {
      if (currentIndex < slidesData.length - 1) {
        currentIndex++;
        ch.postMessage({ type: 'NAVIGATE', payload: { index: currentIndex } });
        updateView({ index: currentIndex, slide: slidesData[currentIndex], scenario: scenariosData[currentIndex] });
      }
    };

    document.getElementById('slide-select').onchange = (e) => {
      currentIndex = parseInt(e.target.value, 10);
      ch.postMessage({ type: 'NAVIGATE', payload: { index: currentIndex } });
      updateView({ index: currentIndex, slide: slidesData[currentIndex], scenario: scenariosData[currentIndex] });
    };

    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }

    document.getElementById('btn-timer-toggle').onclick = () => {
      isTimerRunning = !isTimerRunning;
      if (isTimerRunning) {
        timerInterval = setInterval(() => {
          timerSec++;
          document.getElementById('timer-display').textContent = formatTime(timerSec);
        }, 1000);
      } else {
        clearInterval(timerInterval);
      }
      ch.postMessage({ type: 'TIMER_TOGGLE' });
    };

    document.getElementById('btn-timer-reset').onclick = () => {
      isTimerRunning = false;
      clearInterval(timerInterval);
      timerSec = 0;
      document.getElementById('timer-display').textContent = '00:00';
      ch.postMessage({ type: 'TIMER_RESET' });
    };

    const contentEl = document.getElementById('scenario-content');
    const fontBtns = ['font-sm', 'font-md', 'font-lg', 'font-xl'];
    const fontClasses = {
      'font-sm': 'text-xs leading-relaxed',
      'font-md': 'text-sm leading-relaxed',
      'font-lg': 'text-base leading-relaxed',
      'font-xl': 'text-xl leading-loose font-medium'
    };

    fontBtns.forEach(id => {
      document.getElementById(id).onclick = () => {
        fontBtns.forEach(bId => {
          document.getElementById(bId).className = 'px-2 py-1 rounded text-slate-400 hover:text-white cursor-pointer';
        });
        document.getElementById(id).className = 'px-2 py-1 rounded bg-slate-700 text-white font-bold cursor-pointer';
        contentEl.className = 'serif-text text-slate-100 ' + fontClasses[id] + ' overflow-y-auto max-h-[46vh] pr-2 whitespace-pre-wrap selection:bg-emerald-500 selection:text-white bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60';
      };
    });

    document.getElementById('btn-copy').onclick = () => {
      navigator.clipboard.writeText(scenariosData[currentIndex] || '');
      const btn = document.getElementById('btn-copy');
      btn.textContent = 'コピー完了 ✓';
      setTimeout(() => btn.textContent = '📋 台本をコピー', 2000);
    };

    window.onkeydown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        document.getElementById('btn-next').click();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        document.getElementById('btn-prev').click();
      }
    };
  </script>
</body>
</html>`;

    newWin.document.open();
    newWin.document.write(htmlContent);
    newWin.document.close();
  };

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

  // Fullscreen API toggle
  const toggleFullscreen = async () => {
    try {
      const elem = slideContainerRef.current;
      const isCurrentlyFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isCurrentlyFs && elem) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else if (isCurrentlyFs) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } catch (e) {
      console.warn('Native Fullscreen API failed, falling back to CSS fullscreen:', e);
      setIsFullscreen((prev) => !prev);
    }
  };

  // Listen to fullscreen changes from browser (e.g. Esc key or F11)
  React.useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

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
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
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

  const addPptxCardDiagram = (pptx: any, pptxSlide: any, slide: any) => {
    const isDarkVisual = [3, 13, 15, 20, 21, 22].includes(slide.id);
    const bgCol = isDarkVisual ? '1A2735' : (slide.id === 30 ? 'ECFDF5' : 'FFFFFF');
    const lineCol = isDarkVisual ? '334155' : (slide.id === 30 ? '34D399' : 'E2E8F0');
    const textCol = isDarkVisual ? 'FAFAF8' : '1A2735';

    // Main Card Container (Right Column: x: 5.95, y: 1.45, w: 3.45, h: 3.65)
    pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', {
      x: 5.95,
      y: 1.45,
      w: 3.45,
      h: 3.65,
      fill: { color: bgCol },
      line: { color: lineCol, width: 1.2 }
    });

    // Tag labels per slide
    const tagLabels: Record<number, string> = {
      2: 'RE-MEET ARCHITECTURE',
      3: 'DRIFT CAPSULE',
      4: 'SOCIAL MISSION',
      5: 'TARGET GROUPS',
      6: 'FUNCTION: DRIFT',
      7: 'QUIZ GATE SHIELD',
      8: 'CONTACT BRIDGE',
      9: 'SOC REALTIME',
      10: 'SHADOW FILTER',
      11: 'CRYPTOGRAPHIC ENGINE',
      12: 'ZERO TRACE PRIVACY',
      13: 'SYSTEM TOPOLOGY',
      14: 'COMPARISON MATRIX',
      15: 'LEGAL & SECURITY DEEP DIVE',
      16: 'LEGAL OPINION',
      17: 'AUTHENTICATION LAW',
      18: 'IP BRUTE GUARD',
      19: 'NAME REGEX DEFENSE',
      20: 'STEALTH MASK',
      21: 'SEMANTIC AI FILTER',
      22: 'SHADOW SANDBOX',
      23: 'YOUTH PROTECTION',
      24: 'DIGITAL SIGNATURE',
      25: 'TICKET & AI DRAFT',
      26: 'PRICING & VERIFICATION',
      27: 'EKYC & STRIPE COUPLING',
      28: 'JUDICIAL ALIGNMENT',
      29: 'OPT-OUT AUDIT',
      30: 'GRAND SUMMARY'
    };

    const currentTag = tagLabels[slide.id] || `SECURITY PROTOCOL #${slide.id}`;

    // Top-right Tag Badge
    pptxSlide.addText(currentTag, {
      x: 6.0,
      y: 1.55,
      w: 3.3,
      h: 0.25,
      fontSize: 7.5,
      fontFace: 'Courier New',
      color: isDarkVisual ? '34D399' : '059669',
      bold: true,
      align: 'right'
    });

    // Detailed visual rendering per slide
    switch (slide.id) {
      case 2: // 名前の由来 (A - B 連携図)
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 6.2, y: 2.15, w: 0.65, h: 0.65, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1.5 } });
        pptxSlide.addText('A', { x: 6.2, y: 2.15, w: 0.65, h: 0.65, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: '1E293B', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addText('あなた', { x: 6.1, y: 2.85, w: 0.85, h: 0.25, fontSize: 7.5, align: 'center', color: '64748B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 6.95, y: 2.47, w: 1.45, h: 0, line: { color: '10B981', width: 2 } });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.1, y: 2.05, w: 1.15, h: 0.35, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('相互の記憶 ✦', { x: 7.1, y: 2.05, w: 1.15, h: 0.35, fontSize: 7, bold: true, color: '065F46', align: 'center', valign: 'middle', fontFace: 'Hiragino Kaku Gothic ProN' });
        pptxSlide.addText('Re-meet', { x: 7.1, y: 2.55, w: 1.15, h: 0.25, fontSize: 7, color: '64748B', align: 'center', fontFace: 'Courier New' });

        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 8.5, y: 2.15, w: 0.65, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('B', { x: 8.5, y: 2.15, w: 0.65, h: 0.65, fontSize: 13, bold: true, align: 'center', valign: 'middle', color: '047857', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addText('懐かしい知人', { x: 8.35, y: 2.85, w: 0.95, h: 0.25, fontSize: 7.5, align: 'center', color: '047857', bold: true, fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('不特定の「出会い」を排除し、過去の知人との「再会（Re-meet）」に特化。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 3: // コンセプト (波間に漂流するカプセル)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.25, y: 2.05, w: 0.85, h: 0.85, fill: { color: '0F172A' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('✉️', { x: 7.25, y: 2.05, w: 0.85, h: 0.85, fontSize: 24, align: 'center', valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 7.9, y: 2.7, w: 0.35, h: 0.35, fill: { color: '10B981' } });
        pptxSlide.addText('16:9', { x: 7.9, y: 2.7, w: 0.35, h: 0.35, fontSize: 6.5, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle', fontFace: 'Courier New' });
        pptxSlide.addText('~ ~ ~ 海洋漂流ボトルカプセル ~ ~ ~', { x: 6.1, y: 3.05, w: 3.15, h: 0.3, fontSize: 7.5, color: '34D399', align: 'center', fontFace: 'Courier New' });
        pptxSlide.addText('投函から波間に漂流。記憶の暗号キーにより本人だけに届くボトルメール構造。', { x: 6.05, y: 3.45, w: 3.25, h: 1.3, fontSize: 8.5, align: 'center', color: 'CBD5E1', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 4: // 構築目的 (3大ソーシャルミッション)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🏠', { x: 6.1, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('孤立化防止', { x: 6.1, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '9F1239', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.2, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('👥', { x: 7.2, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('震災断絶回復', { x: 7.2, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '065F46', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.3, y: 1.95, w: 0.95, h: 1.15, fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1 } });
        pptxSlide.addText('🏫', { x: 8.3, y: 2.05, w: 0.95, h: 0.35, fontSize: 14, align: 'center' });
        pptxSlide.addText('自発的隣人網', { x: 8.3, y: 2.45, w: 0.95, h: 0.5, fontSize: 7.5, bold: true, color: '0369A1', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('家族・親族衰退期における、過去の恩師・同窓生とのセーフティネット再生。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 5: // ターゲットユーザー (2x2 グリッド)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🏫 学校の同窓生\n幼馴染・クラスメイト', { x: 6.15, y: 1.98, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.75, y: 1.95, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🏠 旧隣人・被災者\n転居・区画整理で断絶', { x: 7.8, y: 1.98, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.7, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('👥 元同僚・仕事仲間\n退職・異動後の再会', { x: 6.15, y: 2.73, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.75, y: 2.7, w: 1.5, h: 0.65, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🎖️ 恩師・指導者\n感謝を伝えたい相手', { x: 7.8, y: 2.73, w: 1.4, h: 0.6, fontSize: 7, bold: true, color: '1E293B', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('信頼できるお相手にだけエピソードを届けたい安心なユーザーが集う空間。', { x: 6.05, y: 3.5, w: 3.25, h: 1.2, fontSize: 8.5, align: 'center', color: '475569', fontFace: 'Hiragino Kaku Gothic ProN' });
        break;

      case 6: // 主要機能① (投函＆漂流フロー)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('① 国名+名前投函', { x: 6.1, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 7.02, y: 2.4, w: 0.2, h: 0, line: { color: '94A3B8', width: 1.5 } });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.24, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('② 漂流待機', { x: 7.24, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 8.16, y: 2.4, w: 0.2, h: 0, line: { color: '94A3B8', width: 1.5 } });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.38, y: 2.1, w: 0.9, h: 0.6, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('③ クイズ開門', { x: 8.38, y: 2.15, w: 0.9, h: 0.5, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });

        pptxSlide.addText('詳細住所不要。システム波間に漂流し、第三者から完全に遮断された空間。', { x: 6.05, y: 3.1, w: 3.25, h: 1.5, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 7: // 主要機能② (想い出クイズゲート)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.9, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('🔒 QUIZ VERIFICATION GATE', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '34D399', bold: true });
        pptxSlide.addText('二人だけの共有記憶に全問正答で開門', { x: 6.25, y: 2.35, w: 2.85, h: 0.4, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.95, w: 3.05, h: 0.45, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('✦ 表記ゆれ自動救済 (Levenshtein ≤ 2)  [ACTIVE]', { x: 6.25, y: 2.95, w: 2.85, h: 0.45, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, valign: 'middle' });

        pptxSlide.addText('共通の想い出が高精度認証キーとなり、第三者を遮断しつつ正当な再会を支援。', { x: 6.05, y: 3.6, w: 3.25, h: 1.2, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 8: // 主要機能③ (連絡先安全引き渡しモデル)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🤝 連絡先安全引き渡し（セキュア・ブリッジ）', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.3, y: 2.3, w: 2.75, h: 0.45, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('開示連絡先: LINE ID: @sample_friend', { x: 6.35, y: 2.3, w: 2.65, h: 0.45, fontSize: 7.5, fontFace: 'Courier New', color: '047857', bold: true, valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.3, y: 2.85, w: 2.75, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🔒 密室チャットを持たないクリーン設計で、\nトラブルや犯罪リスクをシステム構造上ゼロに。', { x: 6.35, y: 2.85, w: 2.65, h: 0.65, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', valign: 'middle' });

        pptxSlide.addText('🛡️ 緊急通報・ワンタップブロック機能常備', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 9: // 管理・運用① (セキュリティダッシュボード)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🚨', { x: 6.25, y: 2.05, w: 0.8, h: 0.5, fontSize: 18, align: 'center' });
        pptxSlide.addText('検知盾', { x: 6.25, y: 2.55, w: 0.8, h: 0.25, fontSize: 7, bold: true, color: 'E11D48', align: 'center', fontFace: 'Hiragino Kaku Gothic ProN' });

        pptxSlide.addText('THREAT MONITOR', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '64748B', bold: true });
        pptxSlide.addText('不正突破：0件', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 11, fontFace: 'Hiragino Kaku Gothic ProN', color: 'E11D48', bold: true });
        pptxSlide.addText('24時間総当たり・不正通信自動監視', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('オペレーション・ダッシュボードにより不正接続を瞬時に検知・排除。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 10: // 管理・運用② (シャドウフラグ隔離)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.2, y: 2.05, w: 0.95, h: 0.75, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('悪質アクセス\nshadow: 1', { x: 6.2, y: 2.05, w: 0.95, h: 0.75, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: 'BE123C', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.LINE || 'line', { x: 7.2, y: 2.42, w: 0.95, h: 0, line: { color: '94A3B8', width: 1.5 } });
        pptxSlide.addText('⚡ 隔離', { x: 7.2, y: 2.15, w: 0.95, h: 0.25, fontSize: 7, color: 'BE123C', align: 'center', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.2, y: 2.05, w: 0.95, h: 0.75, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('一般ユーザー\n影響 0%', { x: 8.2, y: 2.05, w: 0.95, h: 0.75, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('つきまとい者の投稿は、本人には成功と見せかけ裏側で完全隔離。', { x: 6.05, y: 3.2, w: 3.25, h: 1.5, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 11: // 非機能① (最高レベルの暗号化)
        pptxSlide.addText('🔑 SHA-256 不可逆ストレッチ', { x: 6.1, y: 2.05, w: 3.15, h: 0.35, fontSize: 10, bold: true, color: '065F46', align: 'center', fontFace: 'Hiragino Mincho ProN' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.2, y: 2.5, w: 2.95, h: 0.45, fill: { color: 'F1F5F9' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('salt_key_hash_5a9b8dc91e77...', { x: 6.25, y: 2.5, w: 2.85, h: 0.45, fontSize: 7.5, fontFace: 'Courier New', color: '334155', align: 'center', valign: 'middle' });
        pptxSlide.addText('想い出パスワードが平文で保存されることは一切ありません。不可逆変換により金融機関クラスの安全性を遵守。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 12: // 非機能② (即時オプトアウト)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('🗑️', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 20, align: 'center', valign: 'middle' });

        pptxSlide.addText('OPT-OUT GUARANTEE', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('24時間以内物理削除の保証', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('物理サーバーからもデータを完全に消去', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('「忘れられる権利」および被探索者の断る権利を完全に保障。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 13: // システム構成 (3ブロック)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('SPA\nReact 18', { x: 6.1, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '34D399', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.2, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('Server\nExpress', { x: 7.2, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '6EE7B7', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.3, y: 1.95, w: 0.95, h: 0.9, fill: { color: '0F172A' }, line: { color: '334155', width: 1 } });
        pptxSlide.addText('Security\nGemini AI', { x: 8.3, y: 1.95, w: 0.95, h: 0.9, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '7DD3FC', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('サーバーサイドAPIプロキシ。APIキーはブラウザに一切露出しません。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 14: // 新奇出会いとの対比分析 (比較カード)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.65, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('一般的なマッチング ： 無差別（危険 ❌）', { x: 6.2, y: 1.95, w: 2.95, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: 'BE123C', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.75, w: 3.05, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('ReMEETs 再会モデル ： 既知限定（安全 ⭕）', { x: 6.2, y: 2.75, w: 2.95, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('見知らぬ人との出会いを完全に排除し、二者間の『強固な過去の面識・共有記憶』のみを紐解く確実な治安特化モデル。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 15: // 第2部表紙
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 7.25, y: 1.95, w: 0.85, h: 0.85, fill: { color: '064E3B' }, line: { color: '34D399', width: 1.5 } });
        pptxSlide.addText('🎖️', { x: 7.25, y: 1.95, w: 0.85, h: 0.85, fontSize: 22, align: 'center', valign: 'middle' });
        pptxSlide.addText('LEGAL & SECURITY DEEP DIVE', { x: 6.1, y: 2.95, w: 3.15, h: 0.25, fontSize: 8, fontFace: 'Courier New', color: '34D399', bold: true, align: 'center' });
        pptxSlide.addText('第2部：法規適合性と\n10大防衛アーキテクチャ', { x: 6.1, y: 3.3, w: 3.15, h: 0.8, fontSize: 11, fontFace: 'Hiragino Mincho ProN', color: 'FFFFFF', bold: true, align: 'center' });
        break;

      case 16: // 異性紹介事業非該当の証明
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.1, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1.2 } });
        pptxSlide.addText('✅ POLICE ADAPTATION', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '059669', bold: true });
        pptxSlide.addText('「異性紹介事業」非該当 判定', { x: 6.25, y: 2.35, w: 2.85, h: 0.35, fontSize: 11, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });
        pptxSlide.addText('警察公安・行政書面要件適合', { x: 6.25, y: 2.7, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857' });

        pptxSlide.addText('面識のない異性との交際仲介に該当せず、公安への届出手続きは完全不要。', { x: 6.05, y: 3.35, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 17: // 共有記憶認証法理
        pptxSlide.addText('🔓', { x: 6.1, y: 1.95, w: 3.15, h: 0.45, fontSize: 20, align: 'center' });
        pptxSlide.addText('既知の記憶 ＝ 暗号通信路の鍵', { x: 6.1, y: 2.45, w: 3.15, h: 0.35, fontSize: 10.5, fontFace: 'Hiragino Mincho ProN', color: '065F46', bold: true, align: 'center' });
        pptxSlide.addText('二人だけの記憶クイズが、「新規出会い」ではない事実を電子証明。無名による不当接触や変質者のアタックを起動段階で100%封殺。', { x: 6.05, y: 3.1, w: 3.25, h: 1.6, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 18: // 時間制限ロック
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.85, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('⏱️ LOCKOUT SYSTEM', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('5回連続誤答で24H完全ロック', { x: 6.25, y: 2.35, w: 2.85, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.35, y: 2.95, w: 2.65, h: 0.35, fill: { color: '0F172A' }, line: { color: 'BE123C', width: 1 } });
        pptxSlide.addText('STATUS: IP_LOCKOUT_ACTIVE', { x: 6.35, y: 2.95, w: 2.65, h: 0.35, fontSize: 7.5, fontFace: 'Courier New', color: 'FB7185', align: 'center', valign: 'middle', bold: true });

        pptxSlide.addText('悪意ある回答推測（ブルートフォース）に対し、累計5回不正解答でアカウント＋IPを24時間完全ロック。', { x: 6.05, y: 3.55, w: 3.25, h: 1.2, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 19: // 常用姓名照合
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 } });
        pptxSlide.addText('👤', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 18, align: 'center', valign: 'middle' });

        pptxSlide.addText('フルネーム規制', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'E11D48', bold: true });
        pptxSlide.addText('「山田太郎」等の実名は警告', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('本名の直截露出から保護', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('日本の常用姓名辞書に基づき、実名・フルネーム露出トラブルを自動規制。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 20: // 連絡先ステルス
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.5, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('REGEX SCAN FILTER : BLOCKED', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7, fontFace: 'Courier New', color: 'FB7185', bold: true });
        pptxSlide.addText('LINE ID: my_id_123  → MASK_ID\nTEL: 090-1234-5678 → MASK_TEL\n\nRESULT: LINE ID: **** / TEL: ****', { x: 6.25, y: 2.35, w: 2.85, h: 1.0, fontSize: 7.5, fontFace: 'Courier New', color: '34D399' });

        pptxSlide.addText('連絡先情報の直接交換をリアルタイムに伏字(****)へ自動プログラム変換し完全無害化。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 21: // Gemini AI モデレーション
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.5, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('✨ Gemini Security Agent v2.5', { x: 6.25, y: 2.05, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '34D399', bold: true });
        pptxSlide.addText('INPUT: "お前どこにいる？絶対探すからな"\n危険検知: 執着・脅迫性 98% [隔離]\n自動処置: 即時隔離作動', { x: 6.25, y: 2.35, w: 2.85, h: 1.0, fontSize: 7.5, fontFace: 'Courier New', color: '7DD3FC' });

        pptxSlide.addText('高度な文章理解で、心理的な付きまとい・暴力隠語をリアルタイムにセマンティック自動検知・隔離。', { x: 6.05, y: 3.65, w: 3.25, h: 1.1, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '94A3B8', align: 'center' });
        break;

      case 22: // シャドウフィルタ
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.3, fill: { color: '0F172A' }, line: { color: '1E293B', width: 1 } });
        pptxSlide.addText('$ sys_shadow_scan\n$ ATTACK DETECTED !\n$ SHADOW_FLAG_ISOLATION: ON', { x: 6.25, y: 2.1, w: 2.85, h: 1.0, fontSize: 8, fontFace: 'Courier New', color: '34D399', bold: true });

        pptxSlide.addText('冷やかし・荒らしユーザーは孤立した空間に送られます。送信成功に見せかけ攻撃意欲を無音で根絶。', { x: 6.05, y: 3.5, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'CBD5E1', align: 'center' });
        break;

      case 23: // 青少年保護 (18+)
        pptxSlide.addShape(pptx.shapes.OVAL || 'ellipse', { x: 6.25, y: 2.1, w: 0.75, h: 0.75, fill: { color: 'FFF1F2' }, line: { color: 'F43F5E', width: 2 } });
        pptxSlide.addText('18+', { x: 6.25, y: 2.1, w: 0.75, h: 0.75, fontSize: 13, bold: true, color: 'E11D48', align: 'center', valign: 'middle', fontFace: 'Arial' });

        pptxSlide.addText('MINOR PROTECTION', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: 'E11D48', bold: true });
        pptxSlide.addText('高校生以下は完全不可', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 10, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('非行・児童虐待被害を徹底予防', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('青少年をネット犯罪被害から完璧にプロテクトする強固なコンプライアンス管理。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 24: // 電子的利用宣誓ゲート
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.4, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('🛡️ 電子的利用宣誓ゲート [PLEDGE_GATE]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });

        pptxSlide.addText('☑ 18歳以上（高校生除く）の利用であること\n☑ ストーカー・嫌がらせ・監視目的でないこと\n☑ 法令・利用ガイドライン遵守への完全合意', { x: 6.25, y: 2.25, w: 2.85, h: 0.65, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', leading: 14 });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.95, w: 2.85, h: 0.25, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1 } });
        pptxSlide.addText('✓ AUDIT LOGGED (IP & Timestamp 永続保全)', { x: 6.25, y: 2.95, w: 2.85, h: 0.25, fontSize: 6.5, bold: true, color: '065F46', align: 'center', valign: 'middle', fontFace: 'Courier New' });

        pptxSlide.addText('連絡先開示直前の厳格な電子的利用宣誓。タイムスタンプ・接続元IPを監査保全。', { x: 6.05, y: 3.35, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });
        break;

      case 25: // チケット全履歴保全
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 } });
        pptxSlide.addText('🎫 チケットスレッド永続化  [TICKET_DB]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '0369A1', bold: true });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.25, w: 2.85, h: 0.45, fill: { color: 'FFFFFF' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('#REQ-1092: ユーザーからの通報・相談内容', { x: 6.3, y: 2.25, w: 2.75, h: 0.45, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '334155', valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.8, w: 2.85, h: 0.45, fill: { color: 'FAF5FF' }, line: { color: 'E9D5FF', width: 1 } });
        pptxSlide.addText('✨ Gemini AI コンプライアンス返信 [生成完了]', { x: 6.3, y: 2.8, w: 2.75, h: 0.45, fontSize: 7, fontFace: 'Hiragino Kaku Gothic ProN', color: '7E22CE', valign: 'middle', bold: true });

        pptxSlide.addText('送受信全ログ完全永続化 ➔ 警察・司法証拠保全', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 26: // 明確な本人確認体系・料金分離 (無料グリーン & 600円オレンジ)
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 1.95, w: 3.15, h: 0.85, fill: { color: 'ECFDF5' }, line: { color: '10B981', width: 1.5 } });
        pptxSlide.addText('FREE TIER', { x: 6.2, y: 2.02, w: 1.8, h: 0.2, fontSize: 6.5, fontFace: 'Courier New', color: '047857', bold: true });
        pptxSlide.addText('年齢確認（18歳以上宣誓）', { x: 6.2, y: 2.22, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 2.15, w: 0.8, h: 0.35, fill: { color: '059669' } });
        pptxSlide.addText('無料', { x: 8.35, y: 2.15, w: 0.8, h: 0.35, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.1, y: 2.95, w: 3.15, h: 0.85, fill: { color: 'FFF7ED' }, line: { color: 'F97316', width: 1.5 } });
        pptxSlide.addText('OFFICIAL eKYC', { x: 6.2, y: 3.02, w: 1.8, h: 0.2, fontSize: 6.5, fontFace: 'Courier New', color: 'C2410C', bold: true });
        pptxSlide.addText('公的身分証(eKYC)認証', { x: 6.2, y: 3.22, w: 2.0, h: 0.35, fontSize: 9, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 3.15, w: 0.8, h: 0.35, fill: { color: 'EA580C' } });
        pptxSlide.addText('600円', { x: 8.35, y: 3.15, w: 0.8, h: 0.35, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('🛡️ 明確な料金分離により消費者の誤認を防止し、法令を遵守。', { x: 6.05, y: 3.95, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', align: 'center', bold: true });
        break;

      case 27: // eKYC・決済連携
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 0.65, fill: { color: 'FFF7ED' }, line: { color: 'FDBA74', width: 1 } });
        pptxSlide.addText('💳 Stripe 決済（600円仮売上）', { x: 6.25, y: 1.95, w: 2.1, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true, valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 2.1, w: 0.75, h: 0.35, fill: { color: 'FED7AA' } });
        pptxSlide.addText('仮売上確保', { x: 8.35, y: 2.1, w: 0.75, h: 0.35, fontSize: 6.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '9A3412', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('▼', { x: 6.15, y: 2.65, w: 3.05, h: 0.25, fontSize: 8, color: '94A3B8', align: 'center' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 2.95, w: 3.05, h: 0.65, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🆔 eKYC 審査（TRUSTDOCK等）', { x: 6.25, y: 2.95, w: 2.1, h: 0.65, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, valign: 'middle' });
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 8.35, y: 3.1, w: 0.75, h: 0.35, fill: { color: 'A7F3D0' } });
        pptxSlide.addText('自動分岐', { x: 8.35, y: 3.1, w: 0.75, h: 0.35, fontSize: 6.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('【承認】実請求＆バッジ点灯  /  【否認】即全額自動返金', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: 'C2410C', align: 'center', bold: true });
        break;

      case 28: // フォレンジックログ
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.85, w: 3.05, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 } });
        pptxSlide.addText('📄 forensic_export.pdf  [SECURE]', { x: 6.25, y: 1.95, w: 2.85, h: 0.25, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '047857', bold: true });

        pptxSlide.addText('要求番号: #REQ-2026-9912\n対象IP: 184.22.95.101\n認証合意: 一致 (VALID SIGN)', { x: 6.25, y: 2.25, w: 2.85, h: 0.7, fontSize: 7, fontFace: 'Courier New', color: '334155' });

        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.35, y: 3.05, w: 2.65, h: 0.45, fill: { color: '1E293B' } });
        pptxSlide.addText('📥 捜査資料1キー抽出', { x: 6.35, y: 3.05, w: 2.65, h: 0.45, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });

        pptxSlide.addText('捜査事項照会書に数分で完全対応する証拠エクスポート体制。', { x: 6.05, y: 3.8, w: 3.25, h: 0.4, fontSize: 8, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B', align: 'center' });
        break;

      case 29: // オプトアウト申請処理
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 } });
        pptxSlide.addText('🛡️', { x: 6.25, y: 2.05, w: 0.8, h: 0.8, fontSize: 20, align: 'center', valign: 'middle' });

        pptxSlide.addText('AUTO OPT-OUT', { x: 7.2, y: 2.05, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '059669', bold: true });
        pptxSlide.addText('「二度と繋がらない」権利', { x: 7.2, y: 2.3, w: 2.0, h: 0.35, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });
        pptxSlide.addText('全データ即時遮断', { x: 7.2, y: 2.65, w: 2.0, h: 0.25, fontSize: 7.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '64748B' });

        pptxSlide.addText('お相手との想い出を開門されたくない方の「再会を行わない権利」を完全に保障。', { x: 6.05, y: 3.3, w: 3.25, h: 1.4, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: textCol, align: 'center' });
        break;

      case 30: // 総括
        pptxSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE || 'roundRect', { x: 6.15, y: 1.95, w: 3.05, h: 1.2, fill: { color: 'FFFFFF' }, line: { color: '34D399', width: 1.5 } });
        pptxSlide.addText('🏆', { x: 6.25, y: 2.15, w: 0.6, h: 0.7, fontSize: 22, align: 'center', valign: 'middle' });

        pptxSlide.addText('100% POLICE COMPLIANT', { x: 6.9, y: 2.1, w: 2.2, h: 0.25, fontSize: 7.5, fontFace: 'Courier New', color: '047857', bold: true });
        pptxSlide.addText('治安・防衛コンプライアンス適合証明', { x: 6.9, y: 2.35, w: 2.2, h: 0.5, fontSize: 9.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '1E293B', bold: true });

        pptxSlide.addText('警察公安、サイバー対策セクション、及び法規制の求めるあらゆる安全規範を完全に充足。', { x: 6.05, y: 3.4, w: 3.25, h: 1.3, fontSize: 8.5, fontFace: 'Hiragino Kaku Gothic ProN', color: '065F46', align: 'center', bold: true });
        break;

      default:
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
        break;
    }
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

          // Right visual card diagram (fully recreated from web preview)
          addPptxCardDiagram(pptx, pptxSlide, slide);
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
      case 24: // 電子的利用宣誓ゲート
        return (
          <div className={cardBase}>
            <div className={tagBase}>PLEDGE AUDIT GATE</div>
            <div className="flex flex-col items-center gap-2 w-full my-auto">
              <div className="w-full max-w-[210px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 relative shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                  <span className="text-[7.5px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" /> 法令・規約遵守電子的宣誓
                  </span>
                  <span className="text-[6.5px] font-mono text-slate-400">PLEDGE_GATE</span>
                </div>
                <div className="space-y-1 text-[7.5px] text-slate-700">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>18歳以上（高校生除く）の利用であること</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>ストーカー・嫌がらせ・監視目的でないこと</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>法令遵守・連絡先適正利用の確約</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[6.5px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <span>LOGGED: IP & TIMESTAMP</span>
                  <span className="font-bold">VERIFIED ✓</span>
                </div>
              </div>
              <p className="text-[8.5px] text-emerald-800 font-bold text-center leading-normal">
                連絡先開示直前の厳格な電子的利用宣誓。タイムスタンプ・接続元IPを監査保全。
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
        className={`w-full relative overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? '!fixed !inset-0 !z-[999999] !w-screen !h-screen !rounded-none bg-black flex flex-col justify-center items-center p-2 sm:p-6 select-none'
            : 'rounded-3xl border border-slate-300 shadow-xl bg-slate-900'
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
          className={`aspect-[16/9] w-full mx-auto p-4 sm:p-6 md:p-10 flex flex-col justify-between select-none relative overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'max-w-[96vw] max-h-[86vh] shadow-2xl rounded-2xl' : 'max-w-6xl'
          } ${
            activeSlide?.layout === 'title'
              ? 'bg-[#1A2735] text-[#FAFAF8]'
              : 'bg-white text-slate-900 border border-slate-200/60 shadow-sm'
          }`}
        >
          {/* Title Slide Layout */}
          {activeSlide?.layout === 'title' ? (
            <div className="space-y-4 md:space-y-6 text-left px-2 sm:px-8 md:px-12 my-auto z-10">
              <div className={`inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/40 px-3 py-1 rounded-full text-emerald-400 font-mono font-bold ${
                isFullscreen ? 'text-xs sm:text-sm' : 'text-[9px] sm:text-xs'
              }`}>
                <ShieldCheck size={isFullscreen ? 18 : 14} />
                <span>POLICE & PUBLIC SAFETY COMPLIANCE REPORT</span>
              </div>
              <h2 className={`font-bold font-serif leading-snug whitespace-pre-wrap tracking-wide text-white ${
                isFullscreen
                  ? 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl'
                  : slideFontScale === 'xlarge'
                  ? 'text-xl sm:text-2xl md:text-4xl'
                  : slideFontScale === 'large'
                  ? 'text-lg sm:text-2xl md:text-3xl'
                  : 'text-base sm:text-xl md:text-2xl'
              }`}>
                {activeSlide?.title}
              </h2>
              {activeSlide?.subtitle && (
                <p className={`text-slate-300 font-sans leading-relaxed whitespace-pre-wrap border-t border-slate-700 pt-3 md:pt-5 ${
                  isFullscreen
                    ? 'text-sm sm:text-lg md:text-xl'
                    : slideFontScale === 'xlarge'
                    ? 'text-xs sm:text-sm md:text-base'
                    : 'text-[9px] sm:text-xs md:text-sm'
                }`}>
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
                    <div className={`bg-emerald-600 rounded-full ${isFullscreen ? 'w-2 h-5' : 'w-1.5 h-4'}`} />
                    <span className={`font-bold text-emerald-700 tracking-wider uppercase font-sans ${
                      isFullscreen ? 'text-xs sm:text-sm md:text-base' : 'text-[9px] sm:text-[11px]'
                    }`}>
                      {activeSlide?.category}
                    </span>
                  </div>
                  <span className={`font-mono text-slate-400 bg-slate-100 rounded-full border border-slate-200 ${
                    isFullscreen ? 'text-xs px-3 py-1 font-bold' : 'text-[9px] sm:text-[10px] px-2 py-0.5'
                  }`}>
                    SLIDE {String(activeSlideIdx + 1).padStart(2, '0')} / {slides.length}
                  </span>
                </div>
                <h3 className={`font-bold font-serif text-[#1A2735] ${
                  isFullscreen
                    ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug'
                    : slideFontScale === 'xlarge'
                    ? 'text-sm sm:text-lg md:text-2xl'
                    : slideFontScale === 'large'
                    ? 'text-xs sm:text-base md:text-xl'
                    : 'text-xs sm:text-sm md:text-base'
                }`}>
                  {activeSlide?.title}
                </h3>
                <div className="w-full h-[1.5px] bg-slate-200" />
              </div>

              {/* Content Slide Body */}
              <div className="flex-grow flex flex-col justify-center my-auto overflow-hidden z-10 py-1 sm:py-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <ul className={`space-y-2 px-2 text-left md:col-span-3 ${
                    isFullscreen ? 'sm:space-y-4' : 'sm:space-y-3'
                  }`}>
                    {activeSlide?.points?.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        className={`flex items-start gap-2.5 font-sans text-slate-800 ${
                          isFullscreen
                            ? 'text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed'
                            : slideFontScale === 'xlarge'
                            ? 'text-xs sm:text-sm md:text-base leading-relaxed'
                            : slideFontScale === 'large'
                            ? 'text-[11px] sm:text-xs md:text-[14px] leading-relaxed'
                            : 'text-[10px] sm:text-[11px] md:text-xs leading-relaxed'
                        }`}
                      >
                        <span className={`text-emerald-600 mt-0.5 select-none ${isFullscreen ? 'text-base' : 'text-xs'}`}>✦</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`hidden md:flex md:col-span-2 items-center justify-center ${
                    isFullscreen ? 'scale-110 lg:scale-125 transition-transform' : ''
                  }`}>
                    {renderSlideDiagram(activeSlide?.id)}
                  </div>
                </div>
              </div>

              {/* Content Slide Footer */}
              <div className={`flex justify-between items-center text-slate-400 border-t border-slate-200 pt-2 font-mono z-10 ${
                isFullscreen ? 'text-[10px] sm:text-xs' : 'text-[8px] sm:text-[9.5px]'
              }`}>
                <span>ReMEETs 治安・防衛コンプライアンス管理事務局</span>
                <span>CONFIDENTIAL & POLICE AUDIT READY</span>
              </div>
            </>
          )}
        </div>

        {/* Fullscreen Floating Controls Dock */}
        {isFullscreen && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-3 sm:gap-4 text-white z-50 shadow-2xl">
            <button
              type="button"
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
              type="button"
              onClick={() => setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIdx === slides.length - 1}
              className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
            <div className="h-4 w-[1px] bg-slate-700" />
            <button
              type="button"
              onClick={() => setIsLaserActive((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                isLaserActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Radio size={14} />
              <span>レーザー</span>
            </button>
            <button
              type="button"
              onClick={openPresenterWindow}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-sm"
              title="発表者用台本を別ウィンドウで開く"
            >
              <ExternalLink size={13} />
              <span>別窓台本</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNotesDrawer((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                showNotesDrawer ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              画面内台本
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer text-slate-300"
              title="フルスクリーン解除 (Esc / F)"
            >
              <Minimize2 size={18} />
            </button>
          </div>
        )}

        {/* Fullscreen Notes Drawer */}
        {isFullscreen && showNotesDrawer && (
          <div className="absolute top-4 right-4 bottom-20 w-80 md:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 text-white z-50 shadow-2xl flex flex-col justify-between animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
                🎤 口頭発表台本 (SLIDE {activeSlideIdx + 1})
              </span>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-grow overflow-y-auto py-3 text-xs leading-relaxed font-serif text-slate-200 whitespace-pre-wrap">
              {scenarios[activeSlideIdx] || 'このスライドの口頭シナリオは設定されていません。'}
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex justify-between items-center">
              <button
                type="button"
                onClick={openPresenterWindow}
                className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <ExternalLink size={11} />
                <span>別窓で開く</span>
              </button>
              <button
                type="button"
                onClick={copyCurrentScenario}
                className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                {copiedScript ? 'コピー完了 ✓' : '台本をコピー'}
              </button>
            </div>
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Slide Text Size Selector */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <span className="text-[10px] text-slate-400 font-bold px-1.5 hidden sm:inline">文字:</span>
            <button
              type="button"
              onClick={() => setSlideFontScale('normal')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                slideFontScale === 'normal' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              標準
            </button>
            <button
              type="button"
              onClick={() => setSlideFontScale('large')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                slideFontScale === 'large' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              大
            </button>
            <button
              type="button"
              onClick={() => setSlideFontScale('xlarge')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                slideFontScale === 'xlarge' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              特大
            </button>
          </div>

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

          {/* Open Presenter Window Button */}
          <button
            type="button"
            onClick={openPresenterWindow}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="口頭発表台本を別ウィンドウ（発表者ビュー）で開く"
          >
            <ExternalLink size={14} />
            <span>別窓で台本を開く</span>
          </button>

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
            onClick={toggleFullscreen}
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
