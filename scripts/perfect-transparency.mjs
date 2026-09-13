import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function makePerfectTransparentPng() {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!fs.existsSync(chromePath)) {
    console.error('Chrome not found at', chromePath);
    return;
  }

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

        // 輪郭を美しく保ちながら白背景を除去
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));

          if (brightness > 248 && maxDiff < 8) {
            data[i + 3] = 0; // 完全透明
          } else if (brightness > 235 && maxDiff < 14) {
            // スムーズなアンチエイリアス透過
            const factor = (248 - brightness) / 13;
            data[i + 3] = Math.round(factor * 255);
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
          size64: getResizedDataUrl(64, 64),
          size48: getResizedDataUrl(48, 48),
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
  saveBase64(result.size48, path.join(baseDir, 'hero_bottle_cursor_48.png'));
  saveBase64(result.size32, path.join(baseDir, 'hero_bottle_cursor_32.png'));

  const tsContent = `// ReMEETs 水紋エリア用ボトルメール・カーソル（100%即時反映・パス切れゼロのBase64アセット）
export const BOTTLE_CURSOR_32_DATA_URL = '${result.size32}';
export const BOTTLE_CURSOR_48_DATA_URL = '${result.size48}';
export const BOTTLE_CURSOR_FULL_DATA_URL = '${result.full}';
`;
  fs.writeFileSync('./src/assets/bottleCursorBase64.ts', tsContent);
  console.log('Updated src/assets/bottleCursorBase64.ts successfully');
}

makePerfectTransparentPng();
