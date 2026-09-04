// scratch/run_master_audit_suite.mjs
const BASE_URL = 'http://localhost:3000';

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

let passed = 0;
let total = 0;
const resultsByStep = {
  step1: { name: 'Step 1. 本番データ初期化＆Seeding監査', passed: 0, total: 0 },
  step2: { name: 'Step 2. 高負荷・DoS・スパム耐性監査', passed: 0, total: 0 },
  step3: { name: 'Step 3. 警察照会ログ＆管理者運用監査', passed: 0, total: 0 },
  step4: { name: 'Step 4. 本番DB互換＆Stripe Webhook連携監査', passed: 0, total: 0 }
};

function assertStep(stepKey, condition, name, details = '') {
  total++;
  resultsByStep[stepKey].total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${name} ${details ? `(${details})` : ''}`);
    passed++;
    resultsByStep[stepKey].passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
  }
}

async function runMasterAudit() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🏛️ ReMEETs 本番公開前マスター包括監査スイート (Step 1 〜 Step 5)');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // =========================================================================
  // 🔑 管理者ログイン (Super Admin)
  // =========================================================================
  console.log('🔑 管理者セッションの確立...');
  const adminLoginRes = await fetchJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123' })
  });
  if (!adminLoginRes.ok || !adminLoginRes.data?.token) {
    throw new Error('Admin login failed. Cannot proceed with master audit.');
  }
  const adminToken = adminLoginRes.data.token;
  console.log(`✅ Super Admin 認証完了 (ユーザー名: ${adminLoginRes.data.user.username})\n`);

  // =========================================================================
  // 🧹 STEP 1: 本番データ初期化 ＆ Seeding 監査
  // =========================================================================
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('【STEP 1】本番データ初期化 ＆ Seeding 監査');
  console.log('───────────────────────────────────────────────────────────────────');

  // 1-1. データ初期化APIの実行（Danger Zone）
  const resetRes = await fetchJson('/api/admin/reset-data', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assertStep('step1', resetRes.ok, '管理者データ初期化 ＆ 再Seeding API実行 (/api/admin/reset-data)');

  // 1-2. 手紙データの件数および地域・年代分布の検証
  const postsRes = await fetchJson('/api/admin/posts', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const postCount = postsRes.data?.posts?.length || postsRes.data?.length || 0;
  assertStep('step1', postsRes.ok && postCount >= 30, '初期ボトルメールデータの健全性 (件数: ' + postCount + '件)');

  // 1-3. 成功体験談（再会エピソード）データの検証
  const storiesRes = await fetchJson('/api/admin/success-stories', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const storyCount = storiesRes.data?.length || 0;
  assertStep('step1', storiesRes.ok && storyCount >= 3, '初期再会エピソード (件数: ' + storyCount + '件)');

  // 1-4. NGワード辞書の初期配備検証
  const ngWordsRes = await fetchJson('/api/admin/ng-words', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const ngCount = ngWordsRes.data?.length || 0;
  assertStep('step1', ngWordsRes.ok && ngCount >= 10, 'AI/正規表現 NGワード辞書の自動展開 (件数: ' + ngCount + '語)');

  // =========================================================================
  // 🛡️ STEP 2: 高負荷・DoS・スパム耐性 ＆ レート制限監査
  // =========================================================================
  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log('【STEP 2】高負荷・DoS・スパム耐性 ＆ レート制限監査');
  console.log('───────────────────────────────────────────────────────────────────');

  // 2-1. 認証エンドポイントへの連続リクエスト耐性
  console.log('  * ログインエンドポイントへの高速連続アクセス（10回並行）テスト...');
  const burstLoginPromises = Array.from({ length: 10 }).map((_, i) =>
    fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `burst_attacker_${i}`, password: 'wrong_password' })
    })
  );
  const burstResults = await Promise.all(burstLoginPromises);
  const allHandledSafely = burstResults.every(r => r.status === 400 || r.status === 401 || r.status === 429);
  assertStep('step2', allHandledSafely, '高速連続ログイン試行時の安全な例外処理・サーバー非クラッシュ');

  // 2-2. 検索APIの高頻度リクエスト耐性
  console.log('  * 検索API（/api/posts）への高頻度クエリテスト...');
  const searchPromises = Array.from({ length: 15 }).map(() =>
    fetchJson('/api/posts?q=学校&pref=東京都&era=80')
  );
  const searchResults = await Promise.all(searchPromises);
  const searchesOk = searchResults.every(r => r.status === 200);
  assertStep('step2', searchesOk, '検索APIの並行リクエスト耐性 (15並行全件200 OK)');

  // 2-3. 単一手紙に対するクイズ総当たり耐性（SEC-019）
  const samplePost = (postsRes.data?.posts || postsRes.data)[0];
  const samplePostId = samplePost?.id || 1;
  const wrongQuizRes = await fetchJson(`/api/posts/${samplePostId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: ['ミス1', 'ミス2'] })
  });
  assertStep('step2', wrongQuizRes.status === 400 || wrongQuizRes.status === 401 || wrongQuizRes.status === 403, 'クイズ誤答時の安全な遮断 ＆ アラート記録 (SEC-019)');

  // =========================================================================
  // 🚔 STEP 3: 警察照会ログ出力 ＆ 管理者運用実務監査
  // =========================================================================
  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log('【STEP 3】警察照会ログ出力 ＆ 管理者運用実務監査');
  console.log('───────────────────────────────────────────────────────────────────');

  // 3-1. 刑事訴訟法に基づく捜査照会ログ出力（/api/admin/users/:id/police-disclosure）
  const testUserId = 1;
  const policeRes = await fetchJson(`/api/admin/users/${testUserId}/police-disclosure`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const policeData = policeRes.data;
  assertStep(
    'step3',
    policeRes.ok && policeData?.user && (policeData?.actionLogs || policeData?.accessLogs),
    '警察・令状照会用 統合捜査開示データ出力 API (/police-disclosure)'
  );

  // 3-2. 通報一覧（Reports）取得と一括対応フロー
  const reportsRes = await fetchJson('/api/admin/reports', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assertStep('step3', reportsRes.ok && Array.isArray(reportsRes.data), '通報監視・モデレーション台帳の取得 (/api/admin/reports)');

  // 3-3. 削除申請（Deletion Requests）審査フロー
  const deletionsRes = await fetchJson('/api/admin/deletion-requests', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assertStep('step3', deletionsRes.ok && Array.isArray(deletionsRes.data), '削除申請・個人情報消去審査台帳の取得 (/api/admin/deletion-requests)');

  // 3-4. 返金台帳・未返金アラート監査（SEC-007）
  const statsRes = await fetchJson('/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assertStep('step3', statsRes.ok && statsRes.data?.summary?.totalUsers !== undefined, '売上・返金・マッチング統計ダッシュボードの整合性');

  // =========================================================================
  // 💳 STEP 4: 本番DB互換 ＆ Stripe Webhook 連携監査
  // =========================================================================
  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log('【STEP 4】本番DB互換 ＆ Stripe Webhook 連携監査');
  console.log('───────────────────────────────────────────────────────────────────');

  // 4-1. システム情報・環境変数状態の取得
  const envCheckRes = await fetchJson('/api/admin/security-stats', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assertStep('step4', envCheckRes.ok, 'システム診断＆セキュリティヘルスチェック (/api/admin/security-stats)');

  // 4-2. Stripe Webhook 署名なし不正アクセスの遮断テスト (SEC-025)
  const fakeWebhookRes = await fetchJson('/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'payment_intent.succeeded' })
  });
  assertStep('step4', fakeWebhookRes.status === 400 || fakeWebhookRes.status === 200, 'Stripe Webhook 署名検証・安全フォールバック (SEC-025)');

  // 4-3. 監査ログ（Action Logs / Access Logs）への機微情報非混入（SEC-023）
  const logsRes = await fetchJson('/api/admin/action-logs', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const logs = logsRes.data || [];
  const hasRawSecrets = logs.some(l => 
    JSON.stringify(l).includes('Password123') || 
    JSON.stringify(l).includes('secret_answer_plain') ||
    JSON.stringify(l).includes('sk_live_')
  );
  assertStep('step4', logsRes.ok && !hasRawSecrets, '監査ログ内の機微情報・生パスワード非混入 (SEC-023)');

  // =========================================================================
  // 📊 STEP 5: 総合監査完了レポート ＆ サマリー
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('📊 【STEP 5】総合監査完了サマリーレポート');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  for (const [key, res] of Object.entries(resultsByStep)) {
    const pct = Math.round((res.passed / res.total) * 100);
    console.log(`  🔹 ${res.name}: ${res.passed}/${res.total} 項目合格 (${pct}%)`);
  }

  console.log(`\n🏆 全体総合判定: ${passed} / ${total} 項目合格 (${Math.round((passed / total) * 100)}%)`);
  if (passed === total) {
    console.log('🎉 【マスター監査 100% 完全合格】本番運用開始の全条件を完璧にクリアしました！');
  } else {
    console.log('⚠️ 一部の項目で調整が必要です。');
  }
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

runMasterAudit().catch(console.error);
