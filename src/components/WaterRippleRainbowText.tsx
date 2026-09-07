import React, { useEffect, useRef } from 'react';

interface WaterRippleRainbowTextProps {
  className?: string;
  lines?: string[];
}

export const WaterRippleRainbowText: React.FC<WaterRippleRainbowTextProps> = ({ 
  className = '',
  lines = [
    'いつか、また巡り合えると信じて。',
    '記憶の海へ浮かべる、再会の言葉。'
  ]
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // 波紋シミュレーション用グリッド (2D 波動方程式)
    const GRID_SIZE = 4; // グリッド解像度
    let cols = 0;
    let rows = 0;
    let currentBuffer: Float32Array;
    let previousBuffer: Float32Array;
    const damping = 0.965; // 波の減衰係数

    // オフスクリーンキャンバス（文字テクスチャを描画）
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d', { willReadFrequently: true });

    const resize = () => {
      if (!container || !canvas || !textCtx) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      if (width <= 0) return;
      
      // 行ごとの最大文字数を取得して適切なフォントサイズと高さを算出
      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let targetFontSize = 46; // PC画面デフォルト

      if (width < 380) {
        // 極小スマホ
        const safeWidth = width - 16;
        targetFontSize = Math.max(14, Math.min(20, Math.floor(safeWidth / (maxLineLen * 1.05))));
      } else if (width < 640) {
        // スマホ一般
        const safeWidth = width - 24;
        targetFontSize = Math.max(17, Math.min(26, Math.floor(safeWidth / (maxLineLen * 1.05))));
      } else if (width < 768) {
        targetFontSize = 34;
      } else if (width < 1024) {
        targetFontSize = 42;
      } else {
        targetFontSize = 48; // 大画面PC
      }

      const lineHeight = targetFontSize * 1.38;
      height = Math.max(86, Math.ceil(lines.length * lineHeight + (width < 640 ? 20 : 34)));

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      textCanvas.width = Math.floor(width * dpr);
      textCanvas.height = Math.floor(height * dpr);

      cols = Math.floor((width * dpr) / GRID_SIZE);
      rows = Math.floor((height * dpr) / GRID_SIZE);
      currentBuffer = new Float32Array(cols * rows);
      previousBuffer = new Float32Array(cols * rows);

      renderStaticText();
    };

    // 虹色の鮮やかなカラーパレット
    const rainbowColors = [
      '#0284C7', // スカイブルー (澄んだ海)
      '#2563EB', // ロイヤルブルー
      '#6366F1', // インディゴ
      '#8B5CF6', // パープル
      '#EC4899', // ピンク
      '#F97316', // オレンジ
      '#EAB308', // イエローゴールド
      '#0D9488', // ティール
    ];

    // 虹色グラデーション文字をオフスクリーンに描画（流れるアニメーション）
    let flowOffset = 0;
    const renderStaticText = () => {
      if (!textCtx) return;
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      textCtx.save();
      textCtx.scale(dpr, dpr);

      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let fontSize = 46;

      if (width < 380) {
        const safeWidth = width - 16;
        fontSize = Math.max(14, Math.min(20, Math.floor(safeWidth / (maxLineLen * 1.05))));
      } else if (width < 640) {
        const safeWidth = width - 24;
        fontSize = Math.max(17, Math.min(26, Math.floor(safeWidth / (maxLineLen * 1.05))));
      } else if (width < 768) {
        fontSize = 34;
      } else if (width < 1024) {
        fontSize = 42;
      } else {
        fontSize = 48;
      }

      const lineHeight = fontSize * 1.38;
      const startY = (height - (lines.length * lineHeight)) / 2 + fontSize * 0.92;

      textCtx.font = `800 ${fontSize}px "Shippori Mincho", "Noto Serif JP", "Kaisei Decol", "Yu Mincho", "Hiragino Mincho ProN", serif`;
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'alphabetic';

      // なめらかに永遠に循環するシームレス虹色グラデーション
      flowOffset += 0.6;
      const period = Math.max(width * 0.85, 300);
      const offset = flowOffset % period;
      const startX = -offset - period;
      const totalWidth = period * 3;

      const grad = textCtx.createLinearGradient(
        startX,
        0,
        startX + totalWidth,
        height * 0.35
      );

      const totalCycles = 3;
      const numColors = rainbowColors.length;
      for (let c = 0; c < totalCycles; c++) {
        for (let i = 0; i < numColors; i++) {
          const stopPos = (c + i / numColors) / totalCycles;
          grad.addColorStop(Math.min(1.0, Math.max(0.0, stopPos)), rainbowColors[i]);
        }
      }
      grad.addColorStop(1.0, rainbowColors[0]);

      // テキスト描画（背面ホワイトグロー ＋ 前面虹色グラデーション）
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;

        // 背面ホワイトグロー（視認性向上）
        textCtx.save();
        textCtx.shadowColor = 'rgba(255, 255, 255, 0.98)';
        textCtx.shadowBlur = 12;
        textCtx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        textCtx.lineWidth = 4.2;
        textCtx.lineJoin = 'round';
        textCtx.strokeText(line, width / 2, y);
        textCtx.restore();

        // 虹色グラデーションの前面描画
        textCtx.fillStyle = grad;
        textCtx.fillText(line, width / 2, y);
      });

      textCtx.restore();
    };

    // 波紋を落とす関数
    const dropRipple = (x: number, y: number, radius = 5, strength = 20) => {
      if (!currentBuffer || cols <= 0 || rows <= 0) return;
      const cx = Math.floor((x * dpr) / GRID_SIZE);
      const cy = Math.floor((y * dpr) / GRID_SIZE);

      for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
          const gx = cx + i;
          const gy = cy + j;
          if (gx > 1 && gx < cols - 1 && gy > 1 && gy < rows - 1) {
            const dist = Math.sqrt(i * i + j * j);
            if (dist < radius) {
              const idx = gy * cols + gx;
              currentBuffer[idx] += (1 - dist / radius) * strength;
            }
          }
        }
      }
    };

    // マウス・ポインターイベント
    let lastX = -1;
    let lastY = -1;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        const dx = lastX >= 0 ? x - lastX : 0;
        const dy = lastY >= 0 ? y - lastY : 0;
        const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 12);
        dropRipple(x, y, 4 + Math.floor(speed * 0.4), 18 + speed * 2);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRipple(x, y, 9, 42);
    };

    const handlePointerLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    // WebFont 読み込み完了後にフォントを正確に再適用
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        resize();
      });
    }

    resize();

    // メインアニメーションループ
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    let idleTime = 0;

    const animate = () => {
      if (isVisible && cols > 0 && rows > 0 && currentBuffer && previousBuffer) {
        idleTime++;
        // 通常時も時折、静かな水面のゆらぎ波紋を自律生成
        if (idleTime % 140 === 0) {
          dropRipple(width * (0.25 + Math.random() * 0.5), height * (0.3 + Math.random() * 0.4), 4, 12);
        }

        renderStaticText();

        // 1. 2D 波動方程式による波紋バッファ更新
        for (let y = 1; y < rows - 1; y++) {
          const yOffset = y * cols;
          for (let x = 1; x < cols - 1; x++) {
            const idx = yOffset + x;
            const wave = (
              currentBuffer[idx - 1] +
              currentBuffer[idx + 1] +
              currentBuffer[idx - cols] +
              currentBuffer[idx + cols]
            ) * 0.5 - previousBuffer[idx];

            previousBuffer[idx] = wave * damping;
          }
        }

        // バッファをスワップ
        const temp = currentBuffer;
        currentBuffer = previousBuffer;
        previousBuffer = temp;

        // 2. ディスプレイスメント屈折レンダリング
        if (textCtx) {
          const srcImgData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
          const srcData = srcImgData.data;
          const destImgData = ctx.createImageData(textCanvas.width, textCanvas.height);
          const destData = destImgData.data;
          const canvasW = textCanvas.width;
          const canvasH = textCanvas.height;

          for (let y = 0; y < canvasH; y++) {
            const gy = Math.floor(y / GRID_SIZE);
            const gyOffset = gy * cols;
            const yOffset = y * canvasW;

            for (let x = 0; x < canvasW; x++) {
              const gx = Math.floor(x / GRID_SIZE);
              const gIdx = gyOffset + gx;

              // 波の傾き（勾配）を計算して屈折オフセットを導出
              let offsetX = 0;
              let offsetY = 0;

              if (gx > 0 && gx < cols - 1 && gy > 0 && gy < rows - 1) {
                offsetX = (currentBuffer[gIdx + 1] - currentBuffer[gIdx - 1]) * 0.85;
                offsetY = (currentBuffer[gIdx + cols] - currentBuffer[gIdx - cols]) * 0.85;
              }

              const destIdx = (yOffset + x) * 4;

              if (offsetX === 0 && offsetY === 0) {
                // 変形なし
                destData[destIdx] = srcData[destIdx];
                destData[destIdx + 1] = srcData[destIdx + 1];
                destData[destIdx + 2] = srcData[destIdx + 2];
                destData[destIdx + 3] = srcData[destIdx + 3];
              } else {
                // 水面波紋の屈折座標
                const sx = Math.min(Math.max(Math.round(x + offsetX), 0), canvasW - 1);
                const sy = Math.min(Math.max(Math.round(y + offsetY), 0), canvasH - 1);
                const sIdx = (sy * canvasW + sx) * 4;

                const baseA = srcData[sIdx + 3];

                if (baseA === 0) {
                  // サンプリング元が透明なら完全に透明（黒ずみの発生を100%防止）
                  destData[destIdx] = 0;
                  destData[destIdx + 1] = 0;
                  destData[destIdx + 2] = 0;
                  destData[destIdx + 3] = 0;
                } else {
                  // 微小な色収差サンプリング（文字内部でのみ自然に分散）
                  const rx = Math.min(Math.max(Math.round(x + offsetX * 1.08), 0), canvasW - 1);
                  const ry = Math.min(Math.max(Math.round(y + offsetY * 1.08), 0), canvasH - 1);
                  const rIdx = (ry * canvasW + rx) * 4;
                  const rA = srcData[rIdx + 3];

                  const bx = Math.min(Math.max(Math.round(x + offsetX * 0.92), 0), canvasW - 1);
                  const by = Math.min(Math.max(Math.round(y + offsetY * 0.92), 0), canvasH - 1);
                  const bIdx = (by * canvasW + bx) * 4;
                  const bA = srcData[bIdx + 3];

                  // 光のコースティクス効果（水面ハイライト）
                  const highlight = Math.max(0, (offsetX + offsetY) * 1.8);

                  const rVal = rA > 0 ? srcData[rIdx] : srcData[sIdx];
                  const gVal = srcData[sIdx + 1];
                  const bVal = bA > 0 ? srcData[bIdx + 2] : srcData[sIdx + 2];

                  destData[destIdx] = Math.min(255, rVal + highlight);
                  destData[destIdx + 1] = Math.min(255, gVal + highlight);
                  destData[destIdx + 2] = Math.min(255, bVal + highlight * 1.1);
                  destData[destIdx + 3] = baseA;
                }
              }
            }
          }

          ctx.putImageData(destImgData, 0, 0);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [lines]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full select-none cursor-pointer flex justify-center items-center ${className}`}
      style={{ touchAction: 'none' }}
    >
      <canvas 
        ref={canvasRef} 
        className="block max-w-full drop-shadow-[0_4px_16px_rgba(255,255,255,0.95)]"
      />
      {/* スクリーンリーダー用・SEO用テキスト */}
      <span className="sr-only">
        {lines.join(' ')}
      </span>
    </div>
  );
};
