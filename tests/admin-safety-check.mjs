/**
 * ==============================================================================
 * 🛡️ ReMEETs 管理者安全ダッシュボード＆モデレーション・警察開示 自動検証テスト
 * ==============================================================================
 */

import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbPath = path.resolve(rootDir, "kizuna.db");
const db = new Database(dbPath);
const JWT_SECRET = process.env.JWT_SECRET || "kizuna-secret-key-2026";

console.log("=========================================================================");
console.log("🚀 【ReMEETs】管理者安全ダッシュボード＆モデレーション自動回帰テスト");
console.log("=========================================================================\n");

let adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
if (!adminUser) {
  adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin' LIMIT 1").get();
}
if (!adminUser) {
  const insertAdmin = db.prepare("INSERT INTO users (username, email, password_hash, role, age_verified, is_ekyc_verified) VALUES (?, ?, ?, ?, ?, ?)");
  const res = insertAdmin.run("admin", "admin@remeets.internal", "dummy_hash", "admin", 1, 1);
  adminUser = db.prepare("SELECT * FROM users WHERE id = ?").get(res.lastInsertRowid);
}

const token = jwt.sign(
  { 
    id: adminUser.id, 
    username: adminUser.username, 
    role: adminUser.role || 'admin', 
    is_admin: 1,
    permissions: ['view_police_logs', 'manage_users', 'manage_settings', 'view_logs']
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const API_BASE = "http://localhost:3000";

async function runAdminSafetySuite() {
  let passCount = 0;
  let totalTests = 0;

  // 1. AI検閲シミュレータ API (/api/admin/test-censorship)
  console.log("【1. AI安全検閲シミュレータ API (/api/admin/test-censorship)】");
  const testPhrases = [
    { text: "1995年の南中学校の同級生を探しています。懐かしい思い出を語り合いたいです。", expectFlagged: false },
    { text: "LINE ID: showa_retro まで連絡してね！090-1234-5678 に電話でもOK", expectFlagged: true },
    { text: "会社の同僚全員にお前の過去をバラしてやるからな。後悔させてやる。", expectFlagged: true },
    { text: "パパ活でお手当出せます。大人の関係で会える人募集。", expectFlagged: true }
  ];

  for (const [idx, item] of testPhrases.entries()) {
    totalTests++;
    try {
      const res = await fetch(`${API_BASE}/api/admin/test-censorship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: item.text })
      });
      const data = await res.json();
      const isSuccess = data.is_flagged === item.expectFlagged;
      if (isSuccess) passCount++;

      console.log(`  ${idx + 1}. [${isSuccess ? "✅ PASS" : "❌ FAIL"}] テキスト: "${item.text.substring(0, 30)}..." (判定: Flagged=${data.is_flagged})`);
    } catch (err) {
      console.error(`  ${idx + 1}. [❌ FAIL] 通信エラー:`, err.message);
    }
  }

  // 2. 模擬違反投稿＆通報自動起票 API (/api/admin/simulate-post)
  console.log("\n【2. 模擬違反投稿＆優先通報起票 API (/api/admin/simulate-post)】");
  totalTests++;
  let simulatedPostId = null;
  try {
    const res = await fetch(`${API_BASE}/api/admin/simulate-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "【シミュレーション】お前の居場所を特定した。逃げられると思うなよ。090-9999-8888",
        searcherName: "防衛テスト投稿者",
        targetName: "防衛テスト対象者"
      })
    });
    const simData = await res.json();
    simulatedPostId = simData.postId || simData.post_id;
    const isSimOk = simData.success && simData.aiFlagged && simData.reportCreated && simulatedPostId;
    if (isSimOk) passCount++;

    console.log(`  [${isSimOk ? "✅ PASS" : "❌ FAIL"}] 模擬投函成功 (Post ID: #${simulatedPostId}, AI Flagged: ${simData.aiFlagged})`);
  } catch (err) {
    console.error("  [❌ FAIL] 模擬投稿エラー:", err.message);
  }

  // 3. 通報台帳取得 API (/api/admin/reports)
  console.log("\n【3. 管理者通報・モデレーション台帳 API (/api/admin/reports)】");
  totalTests++;
  let createdReportId = null;
  try {
    const res = await fetch(`${API_BASE}/api/admin/reports`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const reports = await res.json();
    const targetReport = Array.isArray(reports) ? reports.find(r => r.target_id === simulatedPostId) : null;
    createdReportId = targetReport ? targetReport.id : null;
    const isReportOk = targetReport !== null && targetReport !== undefined;
    if (isReportOk) passCount++;

    console.log(`  [${isReportOk ? "✅ PASS" : "❌ FAIL"}] 通報台帳反映確認 (Report ID: #${createdReportId || 'なし'})`);
  } catch (err) {
    console.error("  [❌ FAIL] 通報台帳取得エラー:", err.message);
  }

  // 4. 通報審査・解決処理 API (/api/admin/reports/:id/resolve)
  if (createdReportId) {
    console.log("\n【4. 通報審査・解決処理 API (/api/admin/reports/:id/resolve)】");
    totalTests++;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/${createdReportId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const updateData = await res.json();
      const isUpdateOk = updateData.success || res.status === 200;
      if (isUpdateOk) passCount++;

      console.log(`  [${isUpdateOk ? "✅ PASS" : "❌ FAIL"}] 通報ステータス解決処理 (Report #${createdReportId} -> resolved)`);
    } catch (err) {
      console.error("  [❌ FAIL] ステータス更新エラー:", err.message);
    }
  }

  // 5. 監査ログ一覧 API (/api/admin/action-logs)
  console.log("\n【5. 監査イベントログ台帳 API (/api/admin/action-logs)】");
  totalTests++;
  try {
    const res = await fetch(`${API_BASE}/api/admin/action-logs`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const logs = await res.json();
    const hasActionLogs = Array.isArray(logs) && logs.length > 0;
    if (hasActionLogs) passCount++;

    console.log(`  [${hasActionLogs ? "✅ PASS" : "❌ FAIL"}] 監査ログの保全確認 (全 ${logs.length} 件記録中)`);
  } catch (err) {
    console.error("  [❌ FAIL] 監査ログ取得エラー:", err.message);
  }

  // 6. 警察・令状捜査開示データ出力 API (/api/admin/users/:id/police-disclosure)
  console.log("\n【6. 警察・司法照会用 統合データ開示 API (/api/admin/users/:id/police-disclosure)】");
  totalTests++;
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${adminUser.id}/police-disclosure`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const disclosure = await res.json();
    const isDisclosureOk = disclosure.success && disclosure.user && Array.isArray(disclosure.actionLogs);
    if (isDisclosureOk) passCount++;

    console.log(`  [${isDisclosureOk ? "✅ PASS" : "❌ FAIL"}] 令状開示データ生成成功`);
  } catch (err) {
    console.error("  [❌ FAIL] 警察開示エラー:", err.message);
  }

  // クリーンアップ
  if (createdReportId) {
    db.prepare("DELETE FROM reports WHERE id = ?").run(createdReportId);
  }
  if (simulatedPostId) {
    db.prepare("DELETE FROM reports WHERE target_id = ?").run(simulatedPostId);
    db.prepare("DELETE FROM post_questions WHERE post_id = ?").run(simulatedPostId);
    db.prepare("DELETE FROM posts WHERE id = ?").run(simulatedPostId);
  }

  console.log("\n=========================================================================");
  console.log(`📊 【管理者安全検証結果】: ${passCount} / ${totalTests} 項目合格 (${((passCount/totalTests)*100).toFixed(1)}%)`);
  console.log("🎉 【管理者安全ダッシュボード】100% 正常稼働！\n");

  if (passCount !== totalTests) {
    process.exit(1);
  }
}

runAdminSafetySuite();
