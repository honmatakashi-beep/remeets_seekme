import React, { useEffect, useRef, useState } from 'react';

interface WaterRippleHeroCanvasProps {
  imageSrc: string;
  lines?: string[];
  mainTitle?: string;
  caption?: string;
  className?: string;
}

export const WaterRippleHeroCanvas: React.FC<WaterRippleHeroCanvasProps> = ({
  imageSrc,
  lines = [
    'あの日言えなかった想いを',
    'あの人へ',
    '再会のボトルメール'
  ],
  mainTitle = 'ReMEETs',
  caption = '',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // WebGL コンテキスト取得
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true, premultipliedAlpha: false }) ||
               (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // シェーダーコンパイル用ヘルパー
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (vsSource: string, fsSource: string) => {
      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return null;
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    };

    // 1. フルスクリーンQuad頂点シェーダー
    const vsQuad = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        // WebGLテクスチャ座標の反転
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // 2. 波紋シミュレーション（波動方程式）フラグメントシェーダー
    const fsWaveUpdate = `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_currentWave;
      uniform sampler2D u_previousWave;
      uniform vec2 u_resolution;
      uniform float u_damping;

      void main() {
        vec2 dx = vec2(1.0 / u_resolution.x, 0.0);
        vec2 dy = vec2(0.0, 1.0 / u_resolution.y);

        float left   = texture2D(u_currentWave, v_uv - dx).r;
        float right  = texture2D(u_currentWave, v_uv + dx).r;
        float bottom = texture2D(u_currentWave, v_uv - dy).r;
        float top    = texture2D(u_currentWave, v_uv + dy).r;

        float prev = texture2D(u_previousWave, v_uv).r;

        // 2D 波動方程式
        float next = (left + right + bottom + top) * 0.5 - prev;
        next *= u_damping;

        gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
      }
    `;

    // 3. 波紋ドロップ（水滴落下・マウス移動）フラグメントシェーダー
    const fsWaveDrop = `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_waveTexture;
      uniform vec2 u_center;
      uniform float u_radius;
      uniform float u_strength;
      uniform float u_aspect;

      void main() {
        vec4 current = texture2D(u_waveTexture, v_uv);
        vec2 d = v_uv - u_center;
        d.x *= u_aspect;
        float dist = length(d);
        if (dist < u_radius) {
          float factor = cos(dist / u_radius * 3.14159265 * 0.5);
          current.r += factor * u_strength;
        }
        gl_FragColor = current;
      }
    `;

    // 4. 最終描画フラグメントシェーダー（波紋屈折 ＋ コースティクス光彩 ＋ テクスチャ合成）
    const fsRender = `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_texture;
      uniform sampler2D u_waveTexture;
      uniform vec2 u_resolution;

      void main() {
        vec2 dx = vec2(1.0 / u_resolution.x, 0.0);
        vec2 dy = vec2(0.0, 1.0 / u_resolution.y);

        float left   = texture2D(u_waveTexture, v_uv - dx).r;
        float right  = texture2D(u_waveTexture, v_uv + dx).r;
        float bottom = texture2D(u_waveTexture, v_uv - dy).r;
        float top    = texture2D(u_waveTexture, v_uv + dy).r;

        vec2 offset = vec2(right - left, top - bottom) * 0.065;

        vec2 distortedUv = clamp(v_uv + offset, 0.0, 1.0);
        vec4 color = texture2D(u_texture, distortedUv);

        // 水面の煌めき・光の屈折ハイライト
        float light = max(0.0, (offset.x + offset.y) * 2.8);
        color.rgb += vec3(light * 0.7, light * 0.85, light * 1.0);

        gl_FragColor = color;
      }
    `;

    // プログラム作成
    const progWaveUpdate = createProgram(vsQuad, fsWaveUpdate);
    const progWaveDrop = createProgram(vsQuad, fsWaveDrop);
    const progRender = createProgram(vsQuad, fsRender);

    if (!progWaveUpdate || !progWaveDrop || !progRender) return;

    // 頂点バッファ設定
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    // シミュレーション用グリッド解像度
    const simWidth = 256;
    const simHeight = 144;

    const createTexture = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, simWidth, simHeight, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null
      );
      return tex;
    };

    const createFBO = (texture: WebGLTexture) => {
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0
      );
      return fbo;
    };

    const texA = createTexture();
    const texB = createTexture();
    const texC = createTexture();
    if (!texA || !texB || !texC) return;

    const fboA = createFBO(texA);
    const fboB = createFBO(texB);
    const fboC = createFBO(texC);

    let currentTex = texA;
    let currentFbo = fboA;
    let prevTex = texB;
    let prevFbo = fboB;
    let tempTex = texC;
    let tempFbo = fboC;

    // 背景 ＋ 文字を合成するメインオフスクリーンCanvas
    const compositeCanvas = document.createElement('canvas');
    const compositeCtx = compositeCanvas.getContext('2d', { willReadFrequently: true });
    const mainTexture = gl.createTexture();

    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.src = imageSrc;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // 虹色グラデーション定義
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

    const updateComposite = () => {
      if (!compositeCtx || !width || !height) return;

      compositeCtx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
      compositeCtx.save();
      compositeCtx.scale(dpr, dpr);

      // 1. 背景イラスト描画 (Cover fit)
      if (bgImage.complete && bgImage.naturalWidth > 0) {
        const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
        const canvasRatio = width / height;
        let renderW = width;
        let renderH = height;
        let renderX = 0;
        let renderY = 0;

        if (canvasRatio > imgRatio) {
          renderH = width / imgRatio;
          renderY = (height - renderH) / 2;
        } else {
          renderW = height * imgRatio;
          renderX = (width - renderW) / 2;
        }

        compositeCtx.drawImage(bgImage, renderX, renderY, renderW, renderH);
      } else {
        const bgGrad = compositeCtx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#E0F2FE');
        bgGrad.addColorStop(0.5, '#BAE6FD');
        bgGrad.addColorStop(1, '#7DD3FC');
        compositeCtx.fillStyle = bgGrad;
        compositeCtx.fillRect(0, 0, width, height);
      }

      // 2. 繊細な水面オーバーレイグラデーション
      const overlayGrad = compositeCtx.createLinearGradient(0, 0, 0, height);
      overlayGrad.addColorStop(0, 'rgba(240, 249, 255, 0.45)');
      overlayGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.20)');
      overlayGrad.addColorStop(1, 'rgba(10, 37, 64, 0.75)');
      compositeCtx.fillStyle = overlayGrad;
      compositeCtx.fillRect(0, 0, width, height);

      // 3. 上部ブランドタイトル (ReMEETs)
      compositeCtx.save();
      const titleSize = Math.max(18, Math.min(30, Math.floor(width * 0.035)));
      compositeCtx.font = `bold ${titleSize}px "Shippori Mincho", "Noto Serif JP", serif`;
      compositeCtx.textAlign = 'center';
      compositeCtx.fillStyle = '#FFFFFF';
      compositeCtx.shadowColor = 'rgba(2, 44, 75, 0.9)';
      compositeCtx.shadowBlur = 10;
      compositeCtx.fillText(mainTitle, width / 2, height * 0.20);
      compositeCtx.restore();

      // 4. メイン虹色グラデーション文字
      const maxLineLen = Math.max(...lines.map(l => l.length), 1);
      let fontSize = 42;
      if (width < 380) {
        fontSize = Math.max(15, Math.min(20, Math.floor((width - 24) / (maxLineLen * 1.05))));
      } else if (width < 640) {
        fontSize = Math.max(18, Math.min(26, Math.floor((width - 32) / (maxLineLen * 1.05))));
      } else if (width < 768) {
        fontSize = 30;
      } else if (width < 1024) {
        fontSize = 36;
      } else {
        fontSize = 42;
      }

      const lineHeight = fontSize * 1.38;
      const totalTextHeight = lines.length * lineHeight;
      const startY = height * 0.50 - (totalTextHeight / 2) + fontSize * 0.85;

      compositeCtx.font = `600 ${fontSize}px "Shippori Mincho", "Noto Serif JP", "Kaisei Decol", serif`;
      compositeCtx.textAlign = 'center';
      compositeCtx.textBaseline = 'alphabetic';

      // なめらかに永遠に循環する虹色グラデーション
      flowOffset += 0.6;
      const period = Math.max(width * 0.85, 300);
      const offset = flowOffset % period;
      const startX = -offset - period;
      const totalWidth = period * 3;

      const grad = compositeCtx.createLinearGradient(
        startX, 0, startX + totalWidth, height * 0.5
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

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;

        // 背面ホワイトグロー
        compositeCtx.save();
        compositeCtx.shadowColor = 'rgba(255, 255, 255, 0.98)';
        compositeCtx.shadowBlur = 12;
        compositeCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        compositeCtx.lineWidth = 2.4;
        compositeCtx.lineJoin = 'round';
        compositeCtx.strokeText(line, width / 2, y);
        compositeCtx.restore();

        // 前面虹色グラデーション
        compositeCtx.fillStyle = grad;
        compositeCtx.fillText(line, width / 2, y);
      });

      // 5. 下部キャプション
      if (caption) {
        compositeCtx.save();
        compositeCtx.font = `${Math.max(10, Math.min(13, Math.floor(width * 0.015)))}px "Shippori Mincho", "Noto Serif JP", serif`;
        compositeCtx.textAlign = 'center';
        compositeCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        compositeCtx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        compositeCtx.shadowBlur = 6;
        compositeCtx.fillText(caption, width / 2, height * 0.90);
        compositeCtx.restore();
      }

      compositeCtx.restore();

      // WebGL メインテクスチャへ転送
      gl.bindTexture(gl.TEXTURE_2D, mainTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, compositeCanvas
      );
    };

    const resize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      if (width <= 0) return;

      // 21:9 〜 16:9 のパノラマアスペクト
      const aspect = width < 640 ? (16 / 10) : (21 / 9);
      height = Math.round(width / aspect);

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      compositeCanvas.width = Math.floor(width * dpr);
      compositeCanvas.height = Math.floor(height * dpr);

      updateComposite();
    };

    bgImage.onload = () => {
      setIsLoaded(true);
      resize();
    };

    window.addEventListener('resize', resize);
    resize();

    // 波紋を落とす関数
    const dropRipple = (normX: number, normY: number, radius = 0.05, strength = 0.8) => {
      if (!progWaveDrop) return;
      gl.useProgram(progWaveDrop);

      gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo);
      gl.viewport(0, 0, simWidth, simHeight);

      const posLoc = gl.getAttribLocation(progWaveDrop, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, currentTex);
      gl.uniform1i(gl.getUniformLocation(progWaveDrop, 'u_waveTexture'), 0);

      gl.uniform2f(gl.getUniformLocation(progWaveDrop, 'u_center'), normX, normY);
      gl.uniform1f(gl.getUniformLocation(progWaveDrop, 'u_radius'), radius);
      gl.uniform1f(gl.getUniformLocation(progWaveDrop, 'u_strength'), strength);
      gl.uniform1f(gl.getUniformLocation(progWaveDrop, 'u_aspect'), width / Math.max(height, 1));

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // スワップ
      const t = currentTex; currentTex = tempTex; tempTex = t;
      const fb = currentFbo; currentFbo = tempFbo; tempFbo = fb;
    };

    let lastX = -1;
    let lastY = -1;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        const normX = x / width;
        const normY = y / height;
        const dx = lastX >= 0 ? x - lastX : 0;
        const dy = lastY >= 0 ? y - lastY : 0;
        const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 20);

        dropRipple(normX, normY, 0.035 + speed * 0.001, 0.45 + speed * 0.04);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dropRipple(x / width, y / height, 0.08, 1.4);
    };

    const handlePointerLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    let animationFrameId: number;
    let idleCounter = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      if (isVisible && width > 0 && height > 0) {
        idleCounter++;
        if (idleCounter % 150 === 0) {
          dropRipple(
            0.2 + Math.random() * 0.6,
            0.3 + Math.random() * 0.4,
            0.045,
            0.45
          );
        }

        updateComposite();

        // 1. 波動方程式伝播
        gl.useProgram(progWaveUpdate);
        gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo);
        gl.viewport(0, 0, simWidth, simHeight);

        const posLocWave = gl.getAttribLocation(progWaveUpdate, 'a_position');
        gl.enableVertexAttribArray(posLocWave);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.vertexAttribPointer(posLocWave, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTex);
        gl.uniform1i(gl.getUniformLocation(progWaveUpdate, 'u_currentWave'), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, prevTex);
        gl.uniform1i(gl.getUniformLocation(progWaveUpdate, 'u_previousWave'), 1);

        gl.uniform2f(gl.getUniformLocation(progWaveUpdate, 'u_resolution'), simWidth, simHeight);
        gl.uniform1f(gl.getUniformLocation(progWaveUpdate, 'u_damping'), 0.965);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const oldPrevTex = prevTex;
        const oldPrevFbo = prevFbo;
        prevTex = currentTex;
        prevFbo = currentFbo;
        currentTex = tempTex;
        currentFbo = tempFbo;
        tempTex = oldPrevTex;
        tempFbo = oldPrevFbo;

        // 2. 最終画面描画
        gl.useProgram(progRender);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);

        const posLocRender = gl.getAttribLocation(progRender, 'a_position');
        gl.enableVertexAttribArray(posLocRender);
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.vertexAttribPointer(posLocRender, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mainTexture);
        gl.uniform1i(gl.getUniformLocation(progRender, 'u_texture'), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, currentTex);
        gl.uniform1i(gl.getUniformLocation(progRender, 'u_waveTexture'), 1);

        gl.uniform2f(gl.getUniformLocation(progRender, 'u_resolution'), canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
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
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(texA);
      gl.deleteTexture(texB);
      gl.deleteTexture(texC);
      gl.deleteTexture(mainTexture);
      gl.deleteFramebuffer(fboA);
      gl.deleteFramebuffer(fboB);
      gl.deleteFramebuffer(fboC);
    };
  }, [imageSrc, lines, mainTitle, caption]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-sky-300/80 cursor-pointer select-none group ${className}`}
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-auto object-cover transition-opacity duration-500"
      />

      {/* インタラクティブ誘導バッジ */}
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/30 text-white/90 text-[10px] font-mono tracking-wider opacity-75 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>TOUCH / MOVE FOR WATER RIPPLE</span>
      </div>

      {/* スクリーンリーダー用・アクセシビリティ */}
      <div className="sr-only">
        <h2>{mainTitle}</h2>
        <p>{lines.join(' ')}</p>
        <p>{caption}</p>
      </div>
    </div>
  );
};
