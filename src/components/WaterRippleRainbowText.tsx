import React, { useEffect, useRef } from 'react';

interface WaterRippleRainbowTextProps {
  className?: string;
  lines?: string[];
}

export const WaterRippleRainbowText: React.FC<WaterRippleRainbowTextProps> = ({ 
  className = '',
  lines = [
    'あの日言えなかった思いを',
    'あの人へ。',
    '再会のボトルメール'
  ]
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
    let dpr = window.devicePixelRatio || 1;

    // 波紋シミュレーション用グリッド
    const GRID_SIZE = 4; // グリッド解像度
    let cols = 0;
    let rows = 0;
    let currentBuffer: Float32Array;
    let previousBuffer: Float32Array;
    const damping = 0.965; // 波の減衰係数

    // オフスクリーンキャンバス（綺麗な文字テクスチャを描画）
    const textCanvas = document.createElement('canvas');
    const textCtx = textCanvas.getContext('2d');

    const resize = () => {
      if (!container || !canvas || !textCtx) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      
      // 行ごとの最大文字数を取得して適切なフォントサイズと高さを算出
      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let targetFontSize = 48; // PC画面デフォルト（堂々とした大迫力サイズ）

      if (width < 640) {
        // モバイル: 左右パディングを確保し、最長行が絶対に切れないよう動的フィッティング
        const safeWidth = width - 20;
        targetFontSize = Math.max(15, Math.min(24, Math.floor(safeWidth / (maxLineLen * 1.08))));
      } else if (width < 768) {
        targetFontSize = 36;
      } else if (width < 1024) {
        targetFontSize = 46;
      } else {
        targetFontSize = 52; // 大画面PC
      }

      const lineHeight = targetFontSize * 1.38;
      height = Math.max(90, Math.ceil(lines.length * lineHeight + (width < 640 ? 28 : 44)));

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      textCanvas.width = width * dpr;
      textCanvas.height = height * dpr;

      cols = Math.floor((width * dpr) / GRID_SIZE);
      rows = Math.floor((height * dpr) / GRID_SIZE);
      currentBuffer = new Float32Array(cols * rows);
      previousBuffer = new Float32Array(cols * rows);

      renderStaticText();
    };

    // 虹色グラデーション文字をオフスクリーンに描画（流れるアニメーション）
    let flowOffset = 0;
    const renderStaticText = () => {
      if (!textCtx) return;
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      textCtx.save();
      textCtx.scale(dpr, dpr);

      // レスポンシブフォントサイズ（PCは大迫力、モバイルは全文字が収まる最適サイズ）
      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let fontSize = 48;

      if (width < 640) {
        const safeWidth = width - 20;
        fontSize = Math.max(15, Math.min(24, Math.floor(safeWidth / (maxLineLen * 1.08))));
      } else if (width < 768) {
        fontSize = 36;
      } else if (width < 1024) {
        fontSize = 46;
      } else {
        fontSize = 52;
      }

      const lineHeight = fontSize * 1.38;
      const startY = (height - (lines.length * lineHeight)) / 2 + fontSize * 0.92;

      textCtx.font = `900 ${fontSize}px "Hiragino Mincho ProN", "Yu Mincho", "Source Han Serif JP", "Noto Serif JP", serif`;
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'alphabetic';

      // なめらかに永遠に循環するシームレス虹色グラデーション（ジャンプ・カクつきゼロ設計）
      flowOffset += 0.5; // 上品で穏やかな流速
      const period = Math.max(width * 0.9, 320); // 1サイクルの波長
      const offset = flowOffset % period; // 0 〜 period の範囲で周期的に移動
      
      // 画面全体を十分に覆う3周期分のグラデーション領域を定義
      const startX = -offset - period;
      const totalWidth = period * 3;

      const grad = textCtx.createLinearGradient(
        startX,
        0,
        startX + totalWidth,
        height * 0.35
      );

      // 3周期分、完全に同一のカラーストップを連続配置することで、offsetがリセットされた瞬間も色と位置が100%完全一致
      const rainbowColors = [
        '#38BDF8', // スカイブルー
        '#818CF8', // インディゴ
        '#C084FC', // パープル
        '#F472B6', // ピンク
        '#FB923C', // オレンジ
        '#FACC15', // イエローゴールド
        '#2DD4BF', // ティール
      ];

      // 3周期分を等間隔でカラーストップに登録
      const totalCycles = 3;
      const numColors = rainbowColors.length;
      for (let c = 0; c < totalCycles; c++) {
        for (let i = 0; i < numColors; i++) {
          const stopPos = (c + i / numColors) / totalCycles;
          grad.addColorStop(Math.min(1.0, Math.max(0.0, stopPos)), rainbowColors[i]);
        }
      }
      // 末尾を最初のブルーでぴったり閉じる
      grad.addColorStop(1.0, rainbowColors[0]);

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;

        // モバイル・Retina画面でのエッジ黒ずみ（Alphaフリンジ）を防止するため、
        // 背面に明るいホワイトグローを薄く敷いてクリーンなアンチエイリアシングを保証
        textCtx.save();
        textCtx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        textCtx.shadowBlur = 8;
        textCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        textCtx.lineWidth = 3;
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
    const dropRipple = (x: number, y: number, radius = 5, strength = 18) => {
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
        // 移動量に応じて波紋の大きさを調整
        const dx = lastX >= 0 ? x - lastX : 0;
        const dy = lastY >= 0 ? y - lastY : 0;
        const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 12);
        dropRipple(x, y, 4 + Math.floor(speed * 0.4), 16 + speed * 2);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRipple(x, y, 9, 38);
    };

    const handlePointerLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    resize();

    // メインアニメーションループ
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    let idleTime = 0;

    const animate = () => {
      if (isVisible && cols > 0 && rows > 0) {
        idleTime++;
        // 通常時も時折、ごく静かな水面のゆらぎ波紋を落とす
        if (idleTime % 180 === 0) {
          dropRipple(width * (0.3 + Math.random() * 0.4), height * (0.3 + Math.random() * 0.4), 4, 8);
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
                offsetX = (currentBuffer[gIdx + 1] - currentBuffer[gIdx - 1]) * 0.8;
                offsetY = (currentBuffer[gIdx + cols] - currentBuffer[gIdx - cols]) * 0.8;
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
  }, []);

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
        あの日言えなかった思いを あの人へ。 再会のボトルメール
      </span>
    </div>
  );
};
