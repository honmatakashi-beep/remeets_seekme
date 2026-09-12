import React, { useEffect, useRef } from 'react';

interface WaterRippleRainbowTextProps {
  className?: string;
  lines?: string[];
  shadowStyle?: 'white-glow' | 'none' | 'subtle-dark';
}

export const WaterRippleRainbowText: React.FC<WaterRippleRainbowTextProps> = ({ 
  className = '',
  lines = [
    'あの日言えなかった想いを',
    'あの人へ',
    '再会のボトルメール'
  ],
  shadowStyle = 'none'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // 波紋シミュレーション用グリッド - 高解像度＆超軽快レスポンス設計
    const GRID_SIZE = 6;
    let cols = 0;
    let rows = 0;
    let currentBuffer: Float32Array;
    let previousBuffer: Float32Array;
    const damping = 0.92; // 軽快に抜ける心地よい減衰（即座に静止時CPU 0%へ復帰）

    // 静的テキスト描画用オフスクリーンキャンバス
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d');

    // 虹色グラデーションの色パレット（透明感のある日本の情緒カラー）
    const rainbowColors = [
      '#0284C7', // スカイブルー
      '#2563EB', // ロイヤルブルー
      '#6366F1', // インディゴ
      '#8B5CF6', // パープル
      '#EC4899', // ピンク
      '#F97316', // オレンジ
      '#EAB308', // イエローゴールド
      '#0D9488', // ティール
    ];

    let flowOffset = 0;

    const renderStaticText = () => {
      if (!textCtx || width <= 0 || height <= 0) return;

      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      textCtx.save();
      textCtx.scale(dpr, dpr);

      // レスポンシブフォントサイズ計算（モバイル〜デスクトップ完全追従）
      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let fontSize = 44;
      if (width < 380) {
        fontSize = Math.max(17, Math.min(22, Math.floor((width - 16) / (maxLineLen * 1.05))));
      } else if (width < 640) {
        fontSize = Math.max(20, Math.min(28, Math.floor((width - 24) / (maxLineLen * 1.05))));
      } else if (width < 768) {
        fontSize = 34;
      } else if (width < 1024) {
        fontSize = 40;
      } else {
        fontSize = 46;
      }

      const lineHeight = fontSize * 1.38;
      const totalTextHeight = lines.length * lineHeight;
      const startY = (height - totalTextHeight) / 2 + fontSize * 0.88;

      textCtx.font = `600 ${fontSize}px "Shippori Mincho", "Noto Serif JP", "Kaisei Decol", "Yu Mincho", serif`;
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'alphabetic';

      // なめらかに永遠に循環する虹色グラデーション（ゆったりとしたオーロラスピード）
      flowOffset += 0.25;
      const period = Math.max(width * 0.85, 300);
      const offset = flowOffset % period;
      const startX = -offset - period;
      const totalWidth = period * 3;

      const grad = textCtx.createLinearGradient(startX, 0, startX + totalWidth, height);
      const totalCycles = 3;
      const numColors = rainbowColors.length;
      for (let c = 0; c < totalCycles; c++) {
        for (let i = 0; i < numColors; i++) {
          const stopPos = (c + i / numColors) / totalCycles;
          grad.addColorStop(Math.min(1.0, Math.max(0.0, stopPos)), rainbowColors[i]);
        }
      }
      grad.addColorStop(1.0, rainbowColors[0]);

      // 各行テキストの描画
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;

        textCtx.save();
        if (shadowStyle === 'white-glow') {
          textCtx.shadowColor = 'rgba(255, 255, 255, 0.95)';
          textCtx.shadowBlur = 12;
        } else if (shadowStyle === 'subtle-dark') {
          textCtx.shadowColor = 'rgba(0, 15, 30, 0.5)';
          textCtx.shadowBlur = 8;
          textCtx.shadowOffsetY = 2;
        } else {
          textCtx.shadowColor = 'rgba(0, 15, 30, 0.4)';
          textCtx.shadowBlur = 6;
          textCtx.shadowOffsetY = 2;
        }

        textCtx.fillStyle = grad;
        textCtx.fillText(line, width / 2, y);
        textCtx.restore();
      });

      textCtx.restore();
    };

    const resize = () => {
      if (!container || !canvas || !textCtx) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      if (width <= 0) return;

      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let fontSize = 44;
      if (width < 380) {
        fontSize = Math.max(17, Math.min(22, Math.floor((width - 16) / (maxLineLen * 1.05))));
      } else if (width < 640) {
        fontSize = Math.max(20, Math.min(28, Math.floor((width - 24) / (maxLineLen * 1.05))));
      } else if (width < 768) {
        fontSize = 34;
      } else if (width < 1024) {
        fontSize = 40;
      } else {
        fontSize = 46;
      }

      const calculatedHeight = Math.ceil(lines.length * fontSize * 1.42 + 28);
      height = Math.max(calculatedHeight, 90);

      // dpr=1 でピクセル走査量を1/4に削減し、複数ウィンドウ・複数タブでも常時軽快動作を保証
      dpr = 1;
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(textCanvas, 0, 0);
    };

    // 波紋を落とす関数（キレが良く爽やかな波紋）
    const dropRipple = (x: number, y: number, radius = 5, strength = 22) => {
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

    let lastX = -1;
    let lastY = -1;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        const dx = lastX >= 0 ? x - lastX : 0;
        const dy = lastY >= 0 ? y - lastY : 0;
        const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 20);
        dropRipple(x, y, 4 + Math.floor(speed * 0.35), 16 + speed * 1.8);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRipple(x, y, 7, 36);
    };

    const handlePointerLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    if (document.fonts) {
      document.fonts.ready.then(resize);
    }
    resize();

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let idleTime = 0;

    const animate = () => {
      if (isVisible && !document.hidden && cols > 0 && rows > 0 && currentBuffer && previousBuffer) {
        idleTime++;
        // 通常時も時折、静かで穏やかな水面のゆらぎ波紋を生成（約5秒に1回）
        if (idleTime % 300 === 0) {
          dropRipple(
            width * (0.25 + Math.random() * 0.5),
            height * (0.3 + Math.random() * 0.4),
            5,
            14
          );
        }

        renderStaticText();

        // 1. 2D 波動方程式による波紋バッファ更新
        let waveEnergy = 0;
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

            const newVal = wave * damping;
            previousBuffer[idx] = newVal;
            waveEnergy += Math.abs(newVal);
          }
        }

        const temp = currentBuffer;
        currentBuffer = previousBuffer;
        previousBuffer = temp;

        // 2. ディスプレイスメント屈折レンダリング
        if (textCtx) {
          // 波が静止している時は、ピクセル走査を行わずそのまま超高速転送（CPU負荷 0%）
          if (waveEnergy < 0.05) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(textCanvas, 0, 0);
          } else {
            const srcImgData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
            const srcData = srcImgData.data;
            const destImgData = ctx.createImageData(textCanvas.width, textCanvas.height);
            const destData = destImgData.data;
            const canvasW = textCanvas.width;
            const canvasH = textCanvas.height;

            for (let y = 0; y < canvasH; y++) {
              const gFloatY = y / GRID_SIZE;
              const gy = Math.floor(gFloatY);
              const gFracY = gFloatY - gy;
              const gyOffset = gy * cols;
              const yOffset = y * canvasW;

              for (let x = 0; x < canvasW; x++) {
                const gFloatX = x / GRID_SIZE;
                const gx = Math.floor(gFloatX);
                const gFracX = gFloatX - gx;
                const gIdx = gyOffset + gx;

                let offsetX = 0;
                let offsetY = 0;

                if (gx > 0 && gx < cols - 2 && gy > 0 && gy < rows - 2) {
                  // 波の動きを穏やかに調整
                  const gradX00 = (currentBuffer[gIdx + 1] - currentBuffer[gIdx - 1]) * 0.65;
                  const gradX10 = (currentBuffer[gIdx + 2] - currentBuffer[gIdx]) * 0.65;
                  const gradX01 = (currentBuffer[gIdx + cols + 1] - currentBuffer[gIdx + cols - 1]) * 0.65;
                  const gradX11 = (currentBuffer[gIdx + cols + 2] - currentBuffer[gIdx + cols]) * 0.65;

                  const gradY00 = (currentBuffer[gIdx + cols] - currentBuffer[gIdx - cols]) * 0.65;
                  const gradY10 = (currentBuffer[gIdx + cols + 1] - currentBuffer[gIdx - cols + 1]) * 0.65;
                  const gradY01 = (currentBuffer[gIdx + cols * 2] - currentBuffer[gIdx]) * 0.65;
                  const gradY11 = (currentBuffer[gIdx + cols * 2 + 1] - currentBuffer[gIdx + 1]) * 0.65;

                  offsetX = (gradX00 * (1 - gFracX) + gradX10 * gFracX) * (1 - gFracY) +
                            (gradX01 * (1 - gFracX) + gradX11 * gFracX) * gFracY;
                  offsetY = (gradY00 * (1 - gFracX) + gradY10 * gFracX) * (1 - gFracY) +
                            (gradY01 * (1 - gFracX) + gradY11 * gFracX) * gFracY;
                }

                const destIdx = (yOffset + x) * 4;

                if (Math.abs(offsetX) < 0.05 && Math.abs(offsetY) < 0.05) {
                  destData[destIdx] = srcData[destIdx];
                  destData[destIdx + 1] = srcData[destIdx + 1];
                  destData[destIdx + 2] = srcData[destIdx + 2];
                  destData[destIdx + 3] = srcData[destIdx + 3];
                } else {
                  // ✨ クリーンで歪みのない完全同期サブピクセル・バイリニア補間（色バグ・黒フリンジゼロ）
                  const srcX = x + offsetX;
                  const srcY = y + offsetY;

                  const x0 = Math.floor(srcX);
                  const y0 = Math.floor(srcY);

                  if (x0 < 0 || x0 >= canvasW - 1 || y0 < 0 || y0 >= canvasH - 1) {
                    destData[destIdx] = 0;
                    destData[destIdx + 1] = 0;
                    destData[destIdx + 2] = 0;
                    destData[destIdx + 3] = 0;
                  } else {
                    const x1 = x0 + 1;
                    const y1 = y0 + 1;
                    const fx = srcX - x0;
                    const fy = srcY - y0;

                    const i00 = (y0 * canvasW + x0) * 4;
                    const i10 = (y0 * canvasW + x1) * 4;
                    const i01 = (y1 * canvasW + x0) * 4;
                    const i11 = (y1 * canvasW + x1) * 4;

                    const w00 = (1 - fx) * (1 - fy);
                    const w10 = fx * (1 - fy);
                    const w01 = (1 - fx) * fy;
                    const w11 = fx * fy;

                    const a = srcData[i00 + 3] * w00 + srcData[i10 + 3] * w10 + srcData[i01 + 3] * w01 + srcData[i11 + 3] * w11;

                    if (a <= 0.8) {
                      destData[destIdx] = 0;
                      destData[destIdx + 1] = 0;
                      destData[destIdx + 2] = 0;
                      destData[destIdx + 3] = 0;
                    } else {
                      const r = srcData[i00] * w00 + srcData[i10] * w10 + srcData[i01] * w01 + srcData[i11] * w11;
                      const g = srcData[i00 + 1] * w00 + srcData[i10 + 1] * w10 + srcData[i01 + 1] * w01 + srcData[i11 + 1] * w11;
                      const b = srcData[i00 + 2] * w00 + srcData[i10 + 2] * w10 + srcData[i01 + 2] * w01 + srcData[i11 + 2] * w11;

                      const highlight = Math.max(0, (offsetX + offsetY) * 1.3);

                      destData[destIdx] = Math.min(255, r + highlight);
                      destData[destIdx + 1] = Math.min(255, g + highlight);
                      destData[destIdx + 2] = Math.min(255, b + highlight * 1.05);
                      destData[destIdx + 3] = Math.min(255, a);
                    }
                  }
                }
              }
            }

            ctx.putImageData(destImgData, 0, 0);
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [lines, shadowStyle]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full select-none cursor-pointer flex justify-center items-center ${className}`}
      style={{ touchAction: 'none' }}
    >
      <canvas 
        ref={canvasRef} 
        className="block max-w-full"
      />
      {/* スクリーンリーダー用・SEO用テキスト */}
      <span className="sr-only">
        {lines.join(' ')}
      </span>
    </div>
  );
};
