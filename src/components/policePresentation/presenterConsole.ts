import React from "react";
import { SlideItem } from "../../pages/admin/data/policePresentationData";

export const generatePresenterConsoleHtml = (
  slides: SlideItem[],
  scenarios: string[],
  activeSlideIdx: number,
  timerSeconds: number,
  isTimerRunning: boolean
) => {
  const currentSlide = slides[activeSlideIdx] || { title: "", category: "", points: [] };
  const currentScenario = scenarios[activeSlideIdx] || "このスライドの口頭シナリオは設定されていません。";
  const nextSlide = slides[activeSlideIdx + 1];

  return `<!DOCTYPE html>
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
};

export const openPresenterWindow = (
  slides: SlideItem[],
  scenarios: string[],
  activeSlideIdx: number,
  timerSeconds: number,
  isTimerRunning: boolean,
  presenterWindowRef: React.MutableRefObject<Window | null>
) => {
  const w = 780;
  const h = 880;
  const left = (window.screen.width - w) / 2;
  const top = (window.screen.height - h) / 2;
  const newWin = window.open(
    "",
    "ReMEETsPresenterConsole",
    `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
  );
  if (!newWin) {
    alert("ポップアップがブロックされました。ブラウザのポップアップ許可を有効にしてください。");
    return;
  }
  presenterWindowRef.current = newWin;

  const htmlContent = generatePresenterConsoleHtml(slides, scenarios, activeSlideIdx, timerSeconds, isTimerRunning);
  newWin.document.open();
  newWin.document.write(htmlContent);
  newWin.document.close();
};
