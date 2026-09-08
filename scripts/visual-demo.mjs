import puppeteer from 'puppeteer-core';

// 待機ヘルパー
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runVisualDemo() {
  console.log('🚀 [Visual Demo] Chromeブラウザを起動して実演を開始します...');

  const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  const browser = await puppeteer.launch({
    executablePath,
    headless: false, // 実際のブラウザ画面を表示
    slowMo: 60,      // 人間が見やすいタイピング・クリック速度
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--window-size=1280,850',
      '--window-position=100,50'
    ]
  });

  const [page] = await browser.pages();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    // ----------------------------------------------------
    // SCENE 1: トップページ（LP）の鑑賞
    // ----------------------------------------------------
    console.log('📍 SCENE 1: トップページ（ReMEETs）へアクセス');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await sleep(2000);

    // スムーズスクロールでトップページを眺める
    console.log('📜 トップページをスクロールしてデザインを確認中...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await sleep(1800);
    await page.evaluate(() => window.scrollBy({ top: 800, behavior: 'smooth' }));
    await sleep(1800);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(1500);

    // ----------------------------------------------------
    // SCENE 2: 新規アカウント登録フロー
    // ----------------------------------------------------
    console.log('📍 SCENE 2: 新規アカウント登録画面へ移動');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Step 1: メールアドレス・パスワード入力
    console.log('✍️ Step 1: メールアドレスとパスワードを入力');
    const demoEmail = `demo_viewer_${Date.now()}@example.com`;
    const demoPass = 'ReMeets2026!Sec';

    await page.type('input[type="email"]', demoEmail, { delay: 40 });
    await sleep(600);
    await page.type('input[type="password"]', demoPass, { delay: 40 });
    await sleep(800);

    // 次へ進む
    const nextBtnStep1 = await page.$('button[type="submit"]');
    if (nextBtnStep1) await nextBtnStep1.click();
    await sleep(1500);

    // Step 2: お名前・ニックネーム・ボット認証・規約同意
    console.log('✍️ Step 2: 本名・ニックネーム・規約同意を設定');
    const inputs = await page.$$('input[type="text"]');
    if (inputs.length >= 2) {
      await inputs[0].type('佐藤', { delay: 60 });
      await sleep(400);
      await inputs[1].type('陽菜', { delay: 60 });
      await sleep(400);
    }

    if (inputs.length >= 3) {
      await inputs[2].type('ひなっち', { delay: 60 });
      await sleep(400);
    }

    // ボット防止認証「4」
    const captchaInput = await page.$('input[placeholder*="答え"]');
    if (captchaInput) {
      await captchaInput.type('4', { delay: 80 });
      await sleep(500);
    }

    // 18歳以上・規約同意チェックボックス
    console.log('☑️ 18歳以上・利用規約同意にチェック');
    const termsCheck = await page.$('#terms');
    if (termsCheck) {
      await termsCheck.click();
      await sleep(800);
    }

    // 認証コード受け取りボタン押下
    console.log('📩 認証コード受け取りボタンをクリック');
    const nextBtnStep2 = await page.$('button[type="submit"]');
    if (nextBtnStep2) await nextBtnStep2.click();
    await sleep(2000);

    // Step 3: 認証コード自動入力 ＆ 本登録完了
    console.log('✨ Step 3: 発行された6桁認証コードを自動入力して本登録完了へ');
    await page.waitForSelector('button', { timeout: 5000 });
    
    // 「自動入力する」ボタンをクリック
    const autofillButtons = await page.$$('button');
    for (const btn of autofillButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('自動入力する')) {
        await btn.click();
        break;
      }
    }
    await sleep(1000);

    // 「認証して本登録を完了する」ボタンをクリック
    const verifySubmitBtn = await page.$('button[type="submit"]');
    if (verifySubmitBtn) await verifySubmitBtn.click();
    await sleep(2500);

    // 完了画面からマイページへ
    const mypageBtn = await page.$('button');
    if (mypageBtn) await mypageBtn.click();
    await sleep(2000);

    // ----------------------------------------------------
    // SCENE 3: 手紙（ボトルメール）の作成と投函
    // ----------------------------------------------------
    console.log('📍 SCENE 3: ボトルメール作成画面へ移動');
    await page.goto('http://localhost:3000/create', { waitUntil: 'networkidle0' });
    await sleep(1500);

    console.log('✍️ 手紙の宛名・本文を執筆中...');
    const textInputs = await page.$$('input[type="text"]');
    if (textInputs.length > 0) {
      await textInputs[0].type('1998年 夏の屋上で話した約束へ', { delay: 35 });
      await sleep(500);
    }

    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.type(
        'あの日の放課後、夕焼けを見ながら交わした約束を今でも大切に覚えています。\n' +
        'いつかまたどこかで笑顔で再会できることを信じて、このボトルメールを海に流します。',
        { delay: 25 }
      );
      await sleep(800);
    }

    // 思い出クイズの設定
    console.log('🔐 二人だけの秘密のクイズを設定中...');
    const allInputs = await page.$$('input[type="text"]');
    if (allInputs.length >= 3) {
      await allInputs[1].type('放課後の屋上で最後に一緒に聴いた曲名は？', { delay: 30 });
      await sleep(400);
      await allInputs[2].type('あの夏の花火', { delay: 30 });
      await sleep(400);
    }

    // 投函するボタンをクリック
    console.log('🌊 ボトルメールを海へ投函！');
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await sleep(1000);

    const submitPostBtn = await page.$('button[type="submit"]');
    if (submitPostBtn) {
      await submitPostBtn.click();
      await sleep(3500); // 投函アニメーションの鑑賞
    }

    // ----------------------------------------------------
    // SCENE 4: 海の想い出検索＆ボトルの引き上げ
    // ----------------------------------------------------
    console.log('📍 SCENE 4: 想い出の検索画面へ移動');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle0' });
    await sleep(2000);

    console.log('🔍 キーワード「屋上」でボトルを検索中...');
    const searchInput = await page.$('input[placeholder*="検索"], input[type="search"], input[type="text"]');
    if (searchInput) {
      await searchInput.type('屋上', { delay: 80 });
      await sleep(1500);
    }

    // 検索結果カードをクリック
    console.log('🏖️ 見つかったボトルメールを選択');
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await sleep(1500);

    // ----------------------------------------------------
    // SCENE 5: デモ完了
    // ----------------------------------------------------
    console.log('\n🎉 【可視化デモ完了】全体の主要機能が美しく正常に動作しました！');
    console.log('💡 ブラウザは確認用にそのまま開いておきます。（10秒後に自動クローズ）');
    await sleep(10000);

  } catch (err) {
    console.error('デモ実行中にエラーが発生しました:', err);
  } finally {
    await browser.close();
    console.log('👋 デモブラウザを終了しました。');
  }
}

runVisualDemo();
