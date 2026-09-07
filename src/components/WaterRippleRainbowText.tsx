import React, { useEffect, useRef } from 'react';

interface WaterRippleRainbowTextProps {
  className?: string;
  lines?: string[];
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
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

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // 波紋パーティクルリスト（軽量リング描画）
    let ripples: Ripple[] = [];
    let flowOffset = 0;

    const resize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      
      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let targetFontSize = 48;

      if (width < 400) {
        const safeWidth = width - 16;
        targetFontSize = Math.max(14, Math.min(22, Math.floor(safeWidth / (maxLineLen * 1.06))));
      } else if (width < 640) {
        const safeWidth = width - 24;
        targetFontSize = Math.max(18, Math.min(28, Math.floor(safeWidth / (maxLineLen * 1.05))));
      } else if (width < 768) {
        targetFontSize = 34;
      } else if (width < 1024) {
        targetFontSize = 44;
      } else {
        targetFontSize = 48;
      }

      const lineHeight = targetFontSize * 1.38;
      height = Math.max(80, Math.ceil(lines.length * lineHeight + (width < 640 ? 20 : 36)));

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const addRipple = (x: number, y: number, maxRadius = 60, speed = 2.2) => {
      if (ripples.length > 12) {
        ripples.shift();
      }
      ripples.push({
        x: x * dpr,
        y: y * dpr,
        radius: 0,
        maxRadius: maxRadius * dpr,
        alpha: 0.85,
        speed: speed * dpr,
        color: ['#38BDF8', '#2DD4BF', '#818CF8', '#F472B6', '#FB923C'][Math.floor(Math.random() * 5)]
      });
    };

    let lastPointerX = -1;
    let lastPointerY = -1;
    let lastDropTime = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        const now = performance.now();
        if (now - lastDropTime > 50) {
          const dx = lastPointerX >= 0 ? x - lastPointerX : 0;
          const dy = lastPointerY >= 0 ? y - lastPointerY : 0;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 6 || lastPointerX === -1) {
            addRipple(x, y, 40 + Math.min(dist * 0.8, 55), 2.5);
            lastPointerX = x;
            lastPointerY = y;
            lastDropTime = now;
          }
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addRipple(x, y, 80, 3.2);
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);

    // WebFont 読み込み完了後にフォントを正確に再適用
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        resize();
      });
    }

    resize();

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    let idleCount = 0;

    const rainbowColors = [
      '#0284C7', // スカイブルー (濃いめ)
      '#2563EB', // ロイヤルブルー
      '#6366F1', // インディゴ
      '#8B5CF6', // パープル
      '#EC4899', // ピンク
      '#F97316', // オレンジ
      '#EAB308', // イエローゴールド
      '#0D9488', // ティール
    ];

    const animate = () => {
      if (isVisible && width > 0 && height > 0) {
        idleCount++;
        // 自然な自律水滴（アイドル時）
        if (idleCount % 90 === 0 && ripples.length < 2) {
          addRipple(
            width * (0.2 + Math.random() * 0.6),
            height * (0.3 + Math.random() * 0.4),
            55,
            1.8
          );
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);

        // 1. レスポンシブフォントサイズ算出
        const maxLineLen = Math.max(...lines.map(l => l.length), 1);
        let fontSize = 48;
        if (width < 400) {
          const safeWidth = width - 16;
          fontSize = Math.max(14, Math.min(22, Math.floor(safeWidth / (maxLineLen * 1.06))));
        } else if (width < 640) {
          const safeWidth = width - 24;
          fontSize = Math.max(18, Math.min(28, Math.floor(safeWidth / (maxLineLen * 1.05))));
        } else if (width < 768) {
          fontSize = 34;
        } else if (width < 1024) {
          fontSize = 44;
        } else {
          fontSize = 48;
        }

        const lineHeight = fontSize * 1.38;
        const startY = (height - (lines.length * lineHeight)) / 2 + fontSize * 0.92;

        ctx.font = `800 ${fontSize}px "Shippori Mincho", "Noto Serif JP", "Kaisei Decol", "Yu Mincho", "Hiragino Mincho ProN", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';

        // 2. シームレスに流れる虹色グラデーション
        flowOffset += 0.7;
        const period = Math.max(width * 0.85, 300);
        const offset = flowOffset % period;
        const startX = -offset - period;
        const totalWidth = period * 3;

        const grad = ctx.createLinearGradient(
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

        // 3. テキスト描画（ホワイトバックシャドウ＋鮮やかな虹色グラデーション）
        lines.forEach((line, index) => {
          const y = startY + index * lineHeight;

          // 背面ホワイトグロー（視認性向上）
          ctx.save();
          ctx.shadowColor = 'rgba(255, 255, 255, 0.98)';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
          ctx.lineWidth = 4;
          ctx.lineJoin = 'round';
          ctx.strokeText(line, width / 2, y);
          ctx.restore();

          // 前面虹色グラデーション
          ctx.fillStyle = grad;
          ctx.fillText(line, width / 2, y);
        });

        // 4. 水面波紋リングの描画（超軽量ピクセル描画）
        if (ripples.length > 0) {
          ctx.restore(); // dpr スケールを解除してピクセル精度で描画
          ctx.save();

          for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.radius += r.speed;
            r.alpha = Math.max(0, 0.85 * (1 - r.radius / r.maxRadius));

            if (r.radius >= r.maxRadius || r.alpha <= 0) {
              ripples.splice(i, 1);
              continue;
            }

            // 外輪（波のフロント）
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.8})`;
            ctx.lineWidth = 2.5 * dpr;
            ctx.stroke();

            // 内輪（微細な屈折リング）
            if (r.radius > 8 * dpr) {
              ctx.beginPath();
              ctx.arc(r.x, r.y, r.radius - 6 * dpr, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha * 0.5})`;
              ctx.lineWidth = 1.5 * dpr;
              ctx.stroke();
            }
          }
          ctx.restore();
        } else {
          ctx.restore();
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
        className="block max-w-full drop-shadow-[0_4px_18px_rgba(255,255,255,0.95)]"
      />
      {/* スクリーンリーダー用・SEO用テキスト */}
      <span className="sr-only">
        {lines.join(' ')}
      </span>
    </div>
  );
};
