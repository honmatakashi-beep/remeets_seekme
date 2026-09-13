import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function makeSmoothWatercolorAlpha() {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const jpgPath = '/Users/honma/.gemini/antigravity/brain/ea8aa7f8-6cf7-48d8-9d0a-62a3a7b07e73/hero_bottle_full_isolated_1789277207855.jpg';
  const jpgBase64 = fs.readFileSync(jpgPath).toString('base64');
  const dataUrl = `data:image/jpeg;base64,${jpgBase64}`;

  const result = await page.evaluate(async (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // 水彩画専用の超高品位アルファ・マッティング（ギザギザ・ジャギー完全ゼロ設計）
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 背景の白(255,255,255)からの距離（色の濃さ）
          const whiteDist = Math.max(0, 255 - Math.min(r, g, b));
          
          if (whiteDist < 4) {
            // 完全な白背景
            data[i + 3] = 0;
          } else if (whiteDist < 40) {
            // 水彩画のエッジ：S字カーブ（SmoothStep）による極めて滑らかなフェザリング
            const t = (whiteDist - 4) / 36;
            const smoothAlpha = t * t * (3 - 2 * t);
            data[i + 3] = Math.round(smoothAlpha * 255);
            
            // 白フリンジ除去（背景の白が透けて残るのを補正）
            const alphaVal = smoothAlpha;
            if (alphaVal > 0.01) {
              data[i] = Math.min(255, Math.max(0, Math.round((r - (1 - alphaVal) * 255) / alphaVal)));
              data[i + 1] = Math.min(255, Math.max(0, Math.round((g - (1 - alphaVal) * 255) / alphaVal)));
              data[i + 2] = Math.min(255, Math.max(0, Math.round((b - (1 - alphaVal) * 255) / alphaVal)));
            }
          } else {
            // ボトル内部・主線：完全な不透明度
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        function getResizedDataUrl(w, h) {
          const resCanvas = document.createElement('canvas');
          resCanvas.width = w;
          resCanvas.height = h;
          const resCtx = resCanvas.getContext('2d');
          resCtx.imageSmoothingEnabled = true;
          resCtx.imageSmoothingQuality = 'high';
          resCtx.drawImage(canvas, 0, 0, w, h);
          return resCanvas.toDataURL('image/png');
        }

        resolve({
          full: canvas.toDataURL('image/png'),
          size128: getResizedDataUrl(128, 128),
          size64: getResizedDataUrl(64, 64),
          size32: getResizedDataUrl(32, 32)
        });
      };
      img.src = src;
    });
  }, dataUrl);

  await browser.close();

  function saveBase64(dataUrl, outPath) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
    console.log('Saved', outPath);
  }

  const baseDir = './src/assets/images';
  saveBase64(result.full, path.join(baseDir, 'hero_bottle_cursor.png'));
  saveBase64(result.size128, path.join(baseDir, 'hero_bottle_cursor_128.png'));
  saveBase64(result.size64, path.join(baseDir, 'hero_bottle_cursor_64.png'));
  saveBase64(result.size32, path.join(baseDir, 'hero_bottle_cursor_32.png'));

  const tsContent = `// ReMEETs 水紋エリア用ボトルメール・カーソル（100%即時反映・超高解像度・ジャギーゼロ）
export const BOTTLE_CURSOR_32_DATA_URL = '${result.size32}';
export const BOTTLE_CURSOR_64_DATA_URL = '${result.size64}';
export const BOTTLE_CURSOR_128_DATA_URL = '${result.size128}';
export const BOTTLE_CURSOR_FULL_DATA_URL = '${result.full}';
`;
  fs.writeFileSync('./src/assets/bottleCursorBase64.ts', tsContent);
  console.log('Updated src/assets/bottleCursorBase64.ts successfully');
}

makeSmoothWatercolorAlpha();
