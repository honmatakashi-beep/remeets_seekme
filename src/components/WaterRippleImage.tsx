import React, { useEffect, useRef } from 'react';
import bottleCursorUrl from '../assets/images/hero_watercolor_bottle_cursor.svg';

interface WaterRippleImageProps {
  src: string;
  alt?: string;
  className?: string;
  positionY?: number; // 0.0 = top, 0.5 = center, 1.0 = bottom
  children?: React.ReactNode;
  /** ボトルメール・ポインタのON/OFF（falseにすると1秒で元の通常ポインタに戻せます） */
  enableBottleCursor?: boolean;
}

export const WaterRippleImage: React.FC<WaterRippleImageProps> = ({
  src,
  alt = '海とボトルメール',
  className = '',
  positionY = 0.92,
  children,
  enableBottleCursor = true
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

    // 波紋シミュレーション用グリッド (2D 波動方程式) - 優雅でゆったりとした自然な水面設計
    const GRID_SIZE = 6;
    let cols = 0;
    let rows = 0;
    let currentBuffer: Float32Array;
    let previousBuffer: Float32Array;
    const damping = 0.965; // 優雅にふわぁっと広がり、心地よい余韻を残しながら静かに消える減衰率

    // オフスクリーンキャンバス（元画像を描画）
    const imageCanvas = document.createElement('canvas');
    const imageCtx = imageCanvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    let isImageReady = false;

    const renderSourceImage = () => {
      if (!imageCtx || !isImageReady || width <= 0 || height <= 0) return;

      imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      imageCtx.save();
      imageCtx.scale(dpr, dpr);

      // object-cover 計算で描画（positionY=0.92 で下部ボトルが切れないように配置）
      const imgRatio = img.naturalWidth / (img.naturalHeight || 1);
      const canvasRatio = width / (height || 1);
      let renderW = width;
      let renderH = height;
      let renderX = 0;
      let renderY = 0;

      if (canvasRatio > imgRatio) {
        renderH = width / imgRatio;
        renderY = (height - renderH) * Math.min(1.0, Math.max(0.0, positionY));
      } else {
        renderW = height * imgRatio;
        renderX = (width - renderW) / 2;
      }

      imageCtx.drawImage(img, renderX, renderY, renderW, renderH);
      imageCtx.restore();
    };

    const resize = () => {
      if (!container || !canvas || !imageCtx) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width <= 0 || height <= 0) return;

      // 背景画像は dpr=1 でピクセル走査量を抑え、常時60fps〜120fps超軽快レスポンスを保証
      dpr = 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      imageCanvas.width = Math.floor(width * dpr);
      imageCanvas.height = Math.floor(height * dpr);

      cols = Math.floor((width * dpr) / GRID_SIZE);
      rows = Math.floor((height * dpr) / GRID_SIZE);
      currentBuffer = new Float32Array(cols * rows);
      previousBuffer = new Float32Array(cols * rows);

      renderSourceImage();

      // 初期描画
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageCanvas, 0, 0);
    };

    img.onload = () => {
      isImageReady = true;
      resize();
    };

    if (img.complete && img.naturalWidth > 0) {
      isImageReady = true;
      setTimeout(resize, 10);
    }

    // 波紋を落とす関数（ふんわりと優雅に広がる柔らかな波紋）
    const dropRipple = (x: number, y: number, radius = 7, strength = 18) => {
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

    // マウス・ポインターイベント（水面を優しくなぞるような自然な追従）
    let lastX = -1;
    let lastY = -1;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        const dx = lastX >= 0 ? x - lastX : 0;
        const dy = lastY >= 0 ? y - lastY : 0;
        const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 16);
        // 優しく水面をなぞるマイルドな波立ち
        dropRipple(x, y, 6 + Math.floor(speed * 0.25), 10 + speed * 1.0);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRipple(x, y, 9, 32);
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
      if (isVisible && !document.hidden && isImageReady && cols > 0 && rows > 0 && currentBuffer && previousBuffer) {
        idleTime++;
        // 通常時も時折、静かで穏やかな水面のゆらぎ波紋を生成（約7.5秒に1回）
        if (idleTime % 450 === 0) {
          dropRipple(
            width * (0.25 + Math.random() * 0.5),
            height * (0.3 + Math.random() * 0.4),
            6,
            12
          );
        }

        // 1. 2D 波動方程式による波紋バッファ更新 & 波の活動度判定
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

        // バッファをスワップ
        const temp = currentBuffer;
        currentBuffer = previousBuffer;
        previousBuffer = temp;

        // 2. ディスプレイスメント屈折レンダリング
        if (imageCtx) {
          // 波が静止している時は、ピクセル走査を行わず元画像をそのまま超高速描画（CPU負荷 0%）
          if (waveEnergy < 0.05) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imageCanvas, 0, 0);
          } else {
            const srcImgData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
            const srcData = srcImgData.data;
            const destImgData = ctx.createImageData(imageCanvas.width, imageCanvas.height);
            const destData = destImgData.data;
            const canvasW = imageCanvas.width;
            const canvasH = imageCanvas.height;

            for (let y = 0; y < canvasH; y++) {
              const gy = Math.floor(y / GRID_SIZE);
              const gyOffset = gy * cols;
              const yOffset = y * canvasW;

              for (let x = 0; x < canvasW; x++) {
                const gx = Math.floor(x / GRID_SIZE);
                const gIdx = gyOffset + gx;

                let offsetX = 0;
                let offsetY = 0;

                if (gx > 0 && gx < cols - 1 && gy > 0 && gy < rows - 1) {
                  // ゆったり穏やかな水面屈折
                  offsetX = (currentBuffer[gIdx + 1] - currentBuffer[gIdx - 1]) * 0.55;
                  offsetY = (currentBuffer[gIdx + cols] - currentBuffer[gIdx - cols]) * 0.55;
                }

                const destIdx = (yOffset + x) * 4;

                if (offsetX === 0 && offsetY === 0) {
                  destData[destIdx] = srcData[destIdx];
                  destData[destIdx + 1] = srcData[destIdx + 1];
                  destData[destIdx + 2] = srcData[destIdx + 2];
                  destData[destIdx + 3] = srcData[destIdx + 3];
                } else {
                  // サブピクセルバイリニア補間（ブロックノイズゼロ）
                  const sx = Math.min(Math.max(Math.round(x + offsetX), 0), canvasW - 1);
                  const sy = Math.min(Math.max(Math.round(y + offsetY), 0), canvasH - 1);
                  const sIdx = (sy * canvasW + sx) * 4;

                  const highlight = Math.max(0, (offsetX + offsetY) * 1.2);

                  destData[destIdx] = Math.min(255, srcData[sIdx] + highlight);
                  destData[destIdx + 1] = Math.min(255, srcData[sIdx + 1] + highlight);
                  destData[destIdx + 2] = Math.min(255, srcData[sIdx + 2] + highlight * 1.05);
                  destData[destIdx + 3] = srcData[sIdx + 3];
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
  }, [src, positionY]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden ${enableBottleCursor ? 'cursor-bottle-mail' : 'cursor-pointer'} ${className}`}
      style={{ 
        touchAction: 'none',
        cursor: enableBottleCursor 
          ? `url('${bottleCursorUrl}') 22 3, pointer` 
          : 'pointer' 
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover"
        style={{
          cursor: enableBottleCursor 
            ? `url('${bottleCursorUrl}') 22 3, pointer` 
            : 'pointer'
        }}
      />
      {children}
    </div>
  );
};

