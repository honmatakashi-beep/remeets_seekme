import React, { useState, useEffect, useRef } from "react";
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
  FileCheck,
  Presentation
} from "lucide-react";
import { 
  POLICE_PRESENTATION_SLIDES, 
  POLICE_PRESENTATION_SCENARIOS,
  SlideItem
} from "../pages/admin/data/policePresentationData";
import { SlideDiagramRenderer } from "./policePresentation/SlideDiagramRenderer";
import { openPresenterWindow } from "./policePresentation/presenterConsole";
import { handleExportPptx } from "./deploymentGuide/pptxExport";

export type { SlideItem };

interface PolicePresentationSlideViewerProps {
  slides?: SlideItem[];
  scenarios?: string[];
  onOpenScenarioDoc?: () => void;
}


export const PolicePresentationSlideViewer: React.FC<PolicePresentationSlideViewerProps> = ({
  slides = POLICE_PRESENTATION_SLIDES,
  scenarios = POLICE_PRESENTATION_SCENARIOS,
  onOpenScenarioDoc
}) => {
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [autoAdvanceSec, setAutoAdvanceSec] = useState<number>(10);
  const [showPresenterNotes, setShowPresenterNotes] = useState<boolean>(true);
  const [copiedScenario, setCopiedScenario] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const presenterWindowRef = useRef<Window | null>(null);

  const currentSlide = slides[activeSlideIdx] || slides[0];
  const currentScenario = scenarios[activeSlideIdx] || "";

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveSlideIdx((prev) => (prev + 1) % slides.length);
      }, autoAdvanceSec * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, autoAdvanceSec, slides.length]);

  useEffect(() => {
    let timerInterval: any;
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning]);

  const handleOpenPresenterConsole = () => {
    openPresenterWindow(slides, scenarios, activeSlideIdx, timerSeconds, isTimerRunning, presenterWindowRef);
  };

  const handleDownloadPPTX = () => {
    handleExportPptx(slides);
  };

  const downloadAllTextOutline = () => {
    const text = slides
      .map((s, idx) => {
        const ptsStr =
          s.points && s.points.length > 0
            ? s.points.map((pt) => `  • ${pt}`).join("\n")
            : s.subtitle
            ? `  ${s.subtitle}`
            : "";
        return `■ [スライド ${idx + 1}] カテゴリ：${s.category}\n  【タイトル】: ${s.title}\n${ptsStr}`;
      })
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ReMEETs_Police_Presentation_Outline.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
