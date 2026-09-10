import puppeteer from 'puppeteer-core';
import fs from 'fs';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runAdminAutomatedAudit() {
  console.log('🚀 [Admin Automated Audit] Chromeブラウザを起動し、管理画面の全タブ巡回テストを開始します...');

  const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const reportLog = [];

  const browser = await puppeteer.launch({
    executablePath,
    headless: false, // 実際のブラウザ画面を表示しながら実行
    slowMo: 60,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--window-size=1400,900',
      '--window-position=50,50'
    ]
  });

  const [page] = await browser.pages();
  await page.setViewport({ width: 1400, height: 900 });

  // Dialog auto-accept
  page.on('dialog', async (dialog) => {
    const msg = dialog.message();
    console.log(`💬 [Browser Alert/Confirm]: "${msg}"`);
    await dialog.accept();
  });

  // Track network requests
  const apiResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/admin/')) {
      const status = response.status();
      const method = response.request().method();
      let bodyText = '';
      try {
        bodyText = await response.text();
      } catch (e) {}
      apiResponses.push({ method, url, status, body: bodyText.slice(0, 150) });
      console.log(`🌐 [API Response] ${method} ${url.split('?')[0]} -> Status: ${status}`);
    }
  });

  try {
    // 1. ログインページへアクセス (正しい管理者資格情報: admin / 123)
    console.log('\n📍 1. 管理者 (admin / 123) としてログインします...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await sleep(1000);

    // ログイン入力 (ユーザー名・パスワード)
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', 'admin', { delay: 30 });
    await page.type('input[type="password"]', '123', { delay: 30 });
    
    // ログインボタン押下
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
    } else {
      await page.keyboard.press('Enter');
    }
    await sleep(2500);

    // 管理画面トップへアクセス
    console.log('📍 2. 管理画面ダッシュボードへアクセス...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
    await sleep(2500);

    // テスト対象タブ定義 (全7大タブ)
    const tabsToTest = [
      {
        id: 'deletion',
        name: '🗑️ 削除依頼 ＆ プライバシー救済管理',
        tabLabel: '削除依頼',
        seedBtnText: 'サンプル3件を生成',
        clearBtnText: '申請全クリア',
        apiSeedSub: '/api/admin/deletion-requests/seed',
        apiClearSub: '/api/admin/deletion-requests/clear-all'
      },
      {
        id: 'reports',
        name: '🚨 ユーザー通報 ＆ 不適切報告管理',
        tabLabel: '通報',
        seedBtnText: 'サンプル3件を生成',
        clearBtnText: '通報全クリア',
        apiSeedSub: '/api/admin/reports/seed',
        apiClearSub: '/api/admin/reports/clear-all'
      },
      {
        id: 'contacts',
        name: '📬 お問い合わせ ＆ カスタマーサポート',
        tabLabel: 'お問い合わせ',
        seedBtnText: '分類サンプル投入',
        clearBtnText: '履歴全クリア',
        apiSeedSub: '/api/admin/contacts/seed',
        apiClearSub: '/api/admin/contacts/clear-all'
      },
      {
        id: 'ngWords',
        name: '🚫 NGワード ＆ 禁止表現管理',
        tabLabel: 'NGワード',
        seedBtnText: 'サンプル辞書投入',
        clearBtnText: '辞書全クリア',
        apiSeedSub: '/api/admin/ng-words/seed',
        apiClearSub: '/api/admin/ng-words/clear-all'
      },
      {
        id: 'moderation',
        name: '🛡️ AIリスク検知 ＆ モデレーション',
        tabLabel: 'AI検知キュー',
        seedBtnText: 'AI検知テストデータを生成',
        clearBtnText: '保留キュー全クリア',
        apiSeedSub: '/api/admin/seed-moderation',
        apiClearSub: '/api/admin/moderation/clear-queue'
      },
      {
        id: 'ageVerification',
        name: '🪪 年齢確認 ＆ eKYC監査ログ',
        tabLabel: '本人確認',
        seedBtnText: 'サンプル30件投入',
        clearBtnText: '監査ログ全クリア',
        apiSeedSub: '/api/admin/age-logs/seed',
        apiClearSub: '/api/admin/age-logs/clear-all'
      },
      {
        id: 'successStories',
        name: '💖 体験談 ＆ 再会ストーリー管理',
        tabLabel: '幸せな再会の物語',
        seedBtnText: 'サンプル6件生成',
        clearBtnText: '体験談全クリア',
        apiSeedSub: '/api/admin/seed-success-stories',
        apiClearSub: '/api/admin/success-stories/clear-all'
      }
    ];

    // 全タブ巡回テスト
    for (let i = 0; i < tabsToTest.length; i++) {
      const tab = tabsToTest[i];
      console.log(`\n======================================================`);
      console.log(`▶️ [TEST ${i + 1}/${tabsToTest.length}] タブ: ${tab.name}`);
      console.log(`======================================================`);

      const tabResult = {
        tabId: tab.id,
        tabName: tab.name,
        tabNavSuccess: false,
        seedBtnFound: false,
        seedApiSuccess: false,
        seedApiResponse: null,
        clearBtnFound: false,
        clearApiSuccess: false,
        clearApiResponse: null,
        error: null
      };

      try {
        // 1. タブをクリック
        console.log(`👉 「${tab.tabLabel}」タブをクリックして切り替えます...`);
        const clickedTab = await page.evaluate((label) => {
          const buttons = Array.from(document.querySelectorAll('aside button, nav button, button'));
          const target = buttons.find(b => b.textContent && b.textContent.includes(label));
          if (target) {
            target.click();
            return true;
          }
          return false;
        }, tab.tabLabel);

        if (!clickedTab) {
          console.warn(`⚠️ タブ「${tab.tabLabel}」のナビゲーションボタンが見つかりませんでした。`);
        } else {
          tabResult.tabNavSuccess = true;
        }
        await sleep(1800);

        // 2. 「サンプル生成」ボタンを探してクリック
        console.log(`👉 「${tab.seedBtnText}」ボタンをクリックします...`);
        const seedClicked = await page.evaluate((btnText) => {
          const buttons = Array.from(document.querySelectorAll('main button, button'));
          const btn = buttons.find(b => b.textContent && b.textContent.includes(btnText));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        }, tab.seedBtnText);

        tabResult.seedBtnFound = seedClicked;
        if (!seedClicked) {
          console.error(`❌ ボタン「${tab.seedBtnText}」が画面上に見つかりませんでした。`);
        } else {
          console.log(`✅ ボタン「${tab.seedBtnText}」をクリックしました。API応答を待機...`);
          await sleep(2500);
          
          // Check last matching response
          const lastSeedRes = [...apiResponses].reverse().find(r => r.url.includes(tab.apiSeedSub));
          if (lastSeedRes) {
            tabResult.seedApiResponse = lastSeedRes;
            if (lastSeedRes.status >= 200 && lastSeedRes.status < 300) {
              tabResult.seedApiSuccess = true;
              console.log(`🎉 [SUCCESS] サンプル生成成功 (HTTP ${lastSeedRes.status}): ${lastSeedRes.body}`);
            } else {
              console.error(`🚨 [FAILED] サンプル生成失敗 (HTTP ${lastSeedRes.status}): ${lastSeedRes.body}`);
            }
          } else {
            console.warn(`⚠️ API呼び出し「${tab.apiSeedSub}」が検知されませんでした。`);
          }
        }

        await sleep(1500);

        // 3. 「全クリア」ボタンを探してクリック（動作確認用）
        console.log(`👉 「${tab.clearBtnText}」ボタンをクリックします...`);
        const clearClicked = await page.evaluate((btnText) => {
          const buttons = Array.from(document.querySelectorAll('main button, button'));
          const btn = buttons.find(b => b.textContent && b.textContent.includes(btnText));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        }, tab.clearBtnText);

        tabResult.clearBtnFound = clearClicked;
        if (!clearClicked) {
          console.warn(`⚠️ ボタン「${tab.clearBtnText}」が見つかりませんでした。`);
        } else {
          console.log(`✅ ボタン「${tab.clearBtnText}」をクリックしました。`);
          await sleep(2500);
          const lastClearRes = [...apiResponses].reverse().find(r => r.url.includes(tab.apiClearSub));
          if (lastClearRes) {
            tabResult.clearApiResponse = lastClearRes;
            if (lastClearRes.status >= 200 && lastClearRes.status < 300) {
              tabResult.clearApiSuccess = true;
              console.log(`🎉 [SUCCESS] 全クリア成功 (HTTP ${lastClearRes.status}): ${lastClearRes.body}`);
            } else {
              console.error(`🚨 [FAILED] 全クリア失敗 (HTTP ${lastClearRes.status}): ${lastClearRes.body}`);
            }
          }
        }

      } catch (tabErr) {
        console.error(`💥 タブテスト中にエラーが発生しました: ${tabErr.message}`);
        tabResult.error = tabErr.message;
      }

      reportLog.push(tabResult);
      await sleep(1000);
    }

    // 最終レポートの出力
    console.log('\n======================================================');
    console.log('📊 全自動ブラウザテスト 最終検証結果サマリー');
    console.log('======================================================\n');
    console.table(reportLog.map(r => ({
      タブ名: r.tabName,
      タブ移動: r.tabNavSuccess ? 'OK' : 'FAIL',
      生成ボタン検知: r.seedBtnFound ? 'OK' : 'FAIL',
      生成API成功: r.seedApiSuccess ? 'SUCCESS (200)' : (r.seedApiResponse ? `FAIL (${r.seedApiResponse.status})` : 'NO REQ'),
      クリアAPI成功: r.clearApiSuccess ? 'SUCCESS (200)' : (r.clearApiResponse ? `FAIL (${r.clearApiResponse.status})` : 'NO REQ')
    })));

    await sleep(4000);

  } catch (globalErr) {
    console.error('💥 全体実行時エラー:', globalErr);
  } finally {
    console.log('🛑 ブラウザを終了します。');
    await browser.close();
  }
}

runAdminAutomatedAudit();
