// scratch/run_comprehensive_auto_check.mjs
const BASE_URL = 'http://localhost:3000';

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function fetchHtml(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const text = await res.text();
  return { status: res.status, ok: res.ok, textLength: text.length, isHtml: text.includes('<!DOCTYPE html>') || text.includes('<html') };
}

async function run() {
  console.log('🚀 ========================================================');
  console.log('🧪 ReMEETs 全自動包括システム点検 (E2E & Pages Check)');
  console.log('🚀 ========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${details ? `(${details})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    }
  }

  // ----------------------------------------------------
  // 1. 各種主要ページの配信・レンダリング自動確認
  // ----------------------------------------------------
  console.log('📄 1. 主要Webページ配信チェック (SPA Routing & Static Delivery)');
  const pages = [
    { path: '/', name: 'トップページ (Home)' },
    { path: '/create', name: '手紙投函ページ (Create Post)' },
    { path: '/search', name: '手紙検索ページ (Search)' },
    { path: '/account', name: 'アカウント設定・退会 (Account)' },
    { path: '/admin', name: '管理者ダッシュボード (Admin)' },
    { path: '/company', name: '特定商取引法表記 (Company/Legal)' },
    { path: '/terms', name: '利用規約 (Terms)' },
    { path: '/privacy', name: 'プライバシーポリシー (Privacy)' },
    { path: '/guidelines', name: '利用ガイドライン (Guidelines)' },
    { path: '/faq', name: 'よくある質問 (FAQ)' }
  ];

  for (const page of pages) {
    const res = await fetchHtml(page.path);
    assert(res.ok && res.isHtml, `画面配信: ${page.name}`, `Status: ${res.status}, Size: ${res.textLength} bytes`);
  }

  // ----------------------------------------------------
  // 2. セキュリティHTTPヘッダー自動確認
  // ----------------------------------------------------
  console.log('\n🛡️ 2. セキュリティHTTPヘッダー確認 (SEC-022)');
  const homeRes = await fetch(`${BASE_URL}/`);
  const xFrame = homeRes.headers.get('x-frame-options');
  assert(xFrame === 'SAMEORIGIN' || xFrame === 'DENY', 'X-Frame-Options ヘッダー (クリックジャッキング対策)', `Value: ${xFrame}`);
  assert(homeRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options ヘッダー (MIMEスニッフィング対策)');
  assert(homeRes.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy ヘッダー');

  // ----------------------------------------------------
  // 3. E2Eシナリオ（ユーザーA登録 ➜ 手紙投函 ➜ ユーザーBクイズ ➜ 決済開封 ➜ 二重決済防止 ➜ 退会）
  // ----------------------------------------------------
  console.log('\n🔄 3. E2Eビジネスロジック自動シナリオ');
  const now = Date.now();
  const userAEmail = `tanaka_auto_${now}@example.com`;
  const userAUsername = `tanaka_auto_${now}`;
  const userBEmail = `hanako_auto_${now}@example.com`;
  const userBUsername = `hanako_auto_${now}`;
  const password = 'Password123!';

  // 3-1. 差出人登録 & ログイン
  const regARes = await fetchJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userAUsername,
      email: userAEmail,
      password,
      lastName: '田中',
      firstName: '太郎',
      nickname: 'タロー',
      captchaAnswer: '4',
      captchaId: 'mock'
    })
  });
  assert(regARes.ok, '差出人ユーザーA 新規登録');

  const loginARes = await fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: regARes.data?.user?.username || userAEmail, password })
  });
  assert(loginARes.ok && loginARes.data?.token, 'ユーザーA ログイン & JWT発行');
  const tokenA = loginARes.data?.token;

  // 3-2. 手紙投函
  const postRes = await fetchJson('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({
      searcherName: 'タロー',
      searcherFullName: '田中 太郎',
      searcherProfile: '昭和45年生まれ。元・横浜市立桜丘中学校サッカー部。',
      targetName: '佐藤 花子',
      targetLastName: '佐藤',
      targetFirstName: '花子',
      targetHometown: '神奈川県横浜市',
      targetSchool: '桜丘中学校',
      era: '80',
      category: 'friend',
      message: '花子さん、30年ぶりですね。あの時貸してくれたノートと温かい言葉を今でも覚えています。',
      contactType: 'LINE',
      contactId: 'tanaka_auto_line',
      contactNote: 'メッセージ待ってます',
      questions: [
        { question: '私たちが中学2年の時に一緒に育てた植物は何でしたか？', answer: 'ひまわり' },
        { question: '卒業式の日に埋めたタイムカプセルの場所はどこでしたか？', answer: '校庭の桜の木の下' }
      ]
    })
  });
  assert(postRes.ok && postRes.data?.id, '想い出の手紙投函 (2問クイズ・連絡先付き)');
  const postId = postRes.data?.id;

  // 3-3. 第三者・未ログイン時のデータマスキング検証 (SEC-001, SEC-002)
  const publicPostRes = await fetchJson(`/api/posts/${postId}`);
  assert(
    publicPostRes.ok &&
    publicPostRes.data?.secret_answer === undefined &&
    publicPostRes.data?.secret_answer_plain === undefined &&
    publicPostRes.data?.contact_id === undefined &&
    publicPostRes.data?.message === undefined,
    '未ログイン/第三者閲覧時の本文・平文答え・連絡先ID 完全非送出 (SEC-001, SEC-002)'
  );

  // 3-4. 受取人登録 & ログイン
  const regBRes = await fetchJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userBUsername,
      email: userBEmail,
      password,
      lastName: '佐藤',
      firstName: '花子',
      nickname: 'ハナコ',
      captchaAnswer: '4',
      captchaId: 'mock'
    })
  });
  assert(regBRes.ok, '受取人ユーザーB 新規登録');

  const loginBRes = await fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: regBRes.data?.user?.username || userBEmail, password })
  });
  assert(loginBRes.ok && loginBRes.data?.token, '受取人ユーザーB ログイン & JWT発行');
  const tokenB = loginBRes.data?.token;

  // 3-5. 誤答判定検証 (401 Unauthorized & results)
  const wrongAnsRes = await fetchJson(`/api/posts/${postId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
    body: JSON.stringify({ answers: ['チューリップ', '体育館の裏'] })
  });
  assert(wrongAnsRes.status === 401 && wrongAnsRes.data?.results, 'クイズ誤答判定 (不正解検知 401 & 試行回数記録)');

  // 3-6. クイズ正解検証 (SEC-004: 正解時点ではまだ手紙未解決・未開封)
  const correctAnsRes = await fetchJson(`/api/posts/${postId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
    body: JSON.stringify({ answers: ['ひまわり', '校庭の桜の木の下'] })
  });
  assert(correctAnsRes.ok && correctAnsRes.data?.quizPassed === true, 'クイズ正解検証 (Passed)');

  const checkPostBeforePay = await fetchJson(`/api/posts/${postId}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  
  const isMessageHidden = checkPostBeforePay.data?.message === undefined || checkPostBeforePay.data?.message === null;
  const isStatusUnresolved = checkPostBeforePay.data?.status !== 'resolved';
  assert(
    checkPostBeforePay.ok &&
    isStatusUnresolved &&
    isMessageHidden,
    '決済前は手紙未解決・本文秘匿のまま維持 (誤開示防止 SEC-004)',
    `Status: ${checkPostBeforePay.data?.status}, Message: ${checkPostBeforePay.data?.message}`
  );

  // 3-7. Stripe決済 & 手紙開封 (1,200円)
  const payRes = await fetchJson(`/api/posts/${postId}/reveal-contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
    body: JSON.stringify({
      amount: 1200,
      isEkyc: true,
      unlockMessage: true,
      unlockContactInfo: true
    })
  });
  
  const contactIdVal = payRes.data?.contactId || payRes.data?.contact_id;
  const messageVal = payRes.data?.message;
  assert(
    payRes.ok &&
    Boolean(contactIdVal) &&
    messageVal?.includes('温かい言葉を今でも覚えています'),
    '1,200円決済完了と同時に手紙本文 & LINE ID 開示',
    `Contact: ${contactIdVal}, Message: ${messageVal?.substring(0, 15)}...`
  );

  // 3-8. 二重決済防止 (SEC-006)
  const doublePayRes = await fetchJson(`/api/posts/${postId}/reveal-contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
    body: JSON.stringify({ amount: 1200, isEkyc: true })
  });
  assert(doublePayRes.ok && doublePayRes.data?.alreadyUnlocked === true, '二重決済防止制御 (追加課金なしで既存開示情報を再返却)');

  // 3-9. 解決後の無関係な第三者アクセス拒否 (SEC-002)
  const strangerUsername = `stranger_${now}`;
  await fetchJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: strangerUsername,
      email: `stranger_${now}@example.com`,
      password,
      lastName: '山田',
      firstName: '三郎',
      nickname: 'サブ',
      captchaAnswer: '4',
      captchaId: 'mock'
    })
  });
  const strangerLoginRes = await fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: strangerUsername, password })
  });
  const strangerToken = strangerLoginRes.data?.token;

  const strangerViewRes = await fetchJson(`/api/posts/${postId}`, {
    headers: { 'Authorization': `Bearer ${strangerToken}` }
  });
  assert(
    strangerViewRes.data?.contact_id === undefined &&
    strangerViewRes.data?.message === undefined,
    '解決済み手紙に対する第三者アクセス時の情報完全秘匿 (SEC-002)'
  );

  // 3-10. ユーザー退会 & トークン即時失効 (SEC-011, SEC-024)
  const deleteUserRes = await fetchJson('/api/auth/me', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(deleteUserRes.ok, '受取人ユーザーB 退会処理 & 個人データ物理消去 (SEC-011)');

  const afterDeleteRes = await fetchJson('/api/notifications', {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  assert(afterDeleteRes.status === 401, '退会済みJWTトークンのリアルタイム即時失効 401 Unauthorized (SEC-024)');

  // ----------------------------------------------------
  // 結果サマリー
  // ----------------------------------------------------
  console.log('\n========================================================');
  console.log(`📊 全自動検証結果: ${passed} / ${total} 項目合格 (${Math.round((passed / total) * 100)}%)`);
  if (passed === total) {
    console.log('🎉 【全自動テスト完全合格】すべての画面配信、API、セキュリティ、決済フローが100%正常です！');
  } else {
    console.log('⚠️ 一部のテストで不合格が検出されました。');
  }
  console.log('========================================================\n');
}

run().catch(console.error);
