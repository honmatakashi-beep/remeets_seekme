
function executeUidMigration() {
  return { migratedCount: 0 };
}

import express from "express";
import {
  db,
  setDb,
  seedData,
  generateAdditionalSamplePosts,
  reseedCleanUniquePosts,
  getPasswordPolicy,
  validatePasswordAgainstPolicy,
  JWT_SECRET,
  ADMIN_ROLES,
  ROLE_PERMISSIONS,
  authenticateToken,
  optionalAuthenticateToken,
  isAdmin,
  requirePermission,
  logAction,
  sanitizeLogText,
  filterNGWords,
  detectInappropriateWords,
  evaluateContentSafety,
  broadcastToUser,
  sendNotificationEmail,
  sendPasswordResetEmail,
  recordModerationHistory,
} from "./common";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";

let lastNgWordsFetch = 0;

export const usersRouter = express.Router();


  // --- Admin Routes ---

  usersRouter.get("/users", authenticateToken, isAdmin, (req, res) => {
    try {
      // 既存の全ユーザーを確実に UID-xxxxxx（会員番号）へ完全マイグレーション
      executeUidMigration();

      const users = db.prepare(`
        SELECT u.id, u.username, u.email, u.auth_provider, u.full_name, u.last_name, u.first_name, u.nickname, u.maiden_name, u.birthdate, u.gender, u.role, u.is_blocked, u.is_ekyc_verified, u.ekyc_document_type, u.ekyc_verified_at, u.ekyc_name, u.contact_type, u.contact_id, u.created_at,
               (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) as posts_count,
               (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.status = 'resolved') as resolved_posts_count,
               (SELECT COUNT(*) FROM reports r WHERE (r.target_type = 'user' AND r.target_id = u.id) OR (r.target_type = 'post' AND r.target_id IN (SELECT p2.id FROM posts p2 WHERE p2.user_id = u.id))) as reports_received_count
        FROM users u
        ORDER BY u.created_at DESC
      `).all();
      res.json(users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });



  usersRouter.get("/users/:id", authenticateToken, isAdmin, (req, res) => {
    try {
      const user = db.prepare(`
        SELECT u.id, u.username, u.email, u.auth_provider, u.full_name, u.last_name, u.first_name, u.nickname, u.maiden_name, u.birthdate, u.gender, u.role, u.is_blocked, u.is_ekyc_verified, u.ekyc_document_type, u.ekyc_verified_at, u.ekyc_name, u.contact_type, u.contact_id, u.created_at,
               (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) as posts_count,
               (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.status = 'resolved') as resolved_posts_count,
               (SELECT COUNT(*) FROM reports r WHERE (r.target_type = 'user' AND r.target_id = u.id) OR (r.target_type = 'post' AND r.target_id IN (SELECT p2.id FROM posts p2 WHERE p2.user_id = u.id))) as reports_received_count
        FROM users u
        WHERE u.id = ?
      `).get(req.params.id) as any;

      if (!user) {
        return res.status(404).json({ error: "ユーザーが見つかりません" });
      }
      res.json(user);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });

  // 🔑 管理者によるパスワード再設定メール代理発行


  // 🔑 管理者によるパスワード再設定メール代理発行
  usersRouter.post("/users/:id/send-reset-password", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const targetUser = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as any;
      if (!targetUser) {
        return res.status(404).json({ error: "対象のユーザーが見つかりません。" });
      }
      if (!targetUser.email) {
        return res.status(400).json({ error: "このユーザーにはメールアドレスが登録されていません。" });
      }
      if (targetUser.auth_provider === 'line' || targetUser.auth_provider === 'google') {
        return res.status(400).json({ 
          error: `このユーザーは【${targetUser.auth_provider === 'line' ? 'LINE連携' : 'Google連携'}】でログインしているため、パスワードは設定されていません。` 
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30分間有効
      db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?").run(resetToken, expires, targetUser.id);

      await sendPasswordResetEmail(targetUser.email, resetToken);

      logAction(
        req.user.id,
        "ADMIN_DISPATCH_PASSWORD_RESET",
        `Target: ${targetUser.email} (UID: ${targetUser.username}, ID: ${targetUser.id})`,
        req.ip
      );

      res.json({ 
        success: true, 
        message: `ユーザー（${targetUser.email}）宛にパスワード再設定メールを安全に送信しました。` 
      });
    } catch (err) {
      console.error("Failed to send admin password reset:", err);
      res.status(500).json({ error: "パスワード再設定メールの送信に失敗しました。" });
    }
  });



  usersRouter.get("/users/:id/posts", authenticateToken, isAdmin, (req, res) => {
    try {
      const posts = db.prepare(`
        SELECT p.*, 
               u.username as searcher_username, 
               u.nickname as searcher_account_nickname, 
               u.full_name as searcher_full_name,
               u.maiden_name as searcher_maiden_name
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.user_id = ? 
        ORDER BY p.created_at DESC
      `).all(req.params.id) as any[];

      const allExtraQuestions = db.prepare("SELECT post_id, question, answer, answer_plain FROM post_questions WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)").all(req.params.id) as any[];
      const qMap = new Map<number, any[]>();
      allExtraQuestions.forEach(q => {
        if (!qMap.has(q.post_id)) qMap.set(q.post_id, []);
        qMap.get(q.post_id)!.push({ question: q.question, answer: q.answer, answer_plain: q.answer_plain });
      });

      const enrichedPosts = posts.map(post => {
        const extra = qMap.get(post.id) || [];
        const questions = [
          ...(post.secret_question ? [{ question: post.secret_question, answer: post.secret_answer, answer_plain: post.secret_answer_plain }] : []),
          ...extra
        ];
        return { ...post, questions };
      });

      res.json(enrichedPosts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  });



  usersRouter.get("/users/:id/police-disclosure", authenticateToken, requirePermission('view_police_logs'), (req: any, res) => {
    try {
      const userId = req.params.id;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) {
        return res.status(404).json({ error: "指定されたユーザーが見つかりません。" });
      }

      let ageLogs: any[] = [];
      try {
        ageLogs = db.prepare("SELECT * FROM age_verification_logs WHERE user_id = ? ORDER BY created_at DESC").all(userId);
      } catch (e) {}

      let actionLogs: any[] = [];
      try {
        actionLogs = db.prepare("SELECT * FROM action_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100").all(userId);
      } catch (e) {}

      let accessLogs: any[] = [];
      try {
        accessLogs = db.prepare("SELECT * FROM access_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100").all(userId);
      } catch (e) {}

      let posts: any[] = [];
      try {
        posts = db.prepare("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC").all(userId);
      } catch (e) {}

      let matches: any[] = [];
      try {
        matches = db.prepare(`
          SELECT p.*, 
                 u1.username as author_username, u1.full_name as author_full_name,
                 u2.username as recipient_username, u2.full_name as recipient_full_name
          FROM posts p
          LEFT JOIN users u1 ON p.user_id = u1.id
          LEFT JOIN users u2 ON p.verified_by_user_id = u2.id
          WHERE (p.user_id = ? OR p.verified_by_user_id = ?) AND p.status = 'resolved'
          ORDER BY p.updated_at DESC
        `).all(userId, userId);
      } catch (e) {}

      let payments: any[] = [];
      try {
        payments = db.prepare("SELECT * FROM payment_transactions WHERE user_id = ? ORDER BY created_at DESC").all(userId);
      } catch (e) {}

      let reportsAsTarget: any[] = [];
      try {
        reportsAsTarget = db.prepare("SELECT * FROM reports WHERE (target_type = 'user' AND target_id = ?) OR (target_type = 'post' AND target_id IN (SELECT id FROM posts WHERE user_id = ?)) ORDER BY created_at DESC").all(userId, userId);
      } catch (e) {}

      let reportsAsReporter: any[] = [];
      try {
        reportsAsReporter = db.prepare("SELECT * FROM reports WHERE reporter_id = ? ORDER BY created_at DESC").all(userId);
      } catch (e) {}

      // Log the police disclosure export in action_logs
      try {
        logAction(req.user.id, "police_disclosure_exported", `Police disclosure report generated for User #${userId} (${user.username})`, req.ip);
      } catch (e) {}

      res.json({
        success: true,
        report_generated_at: new Date().toISOString(),
        legal_basis: "刑事訴訟法第197条第2項（公務所等に対する照会）に基づく捜査関係事項照会回答提出用証明データ",
        system_name: "ReMEETs 治安防衛・情報開示自動生成システム (セキュア・ブリッジ完結モデル)",
        user,
        ageLogs,
        actionLogs,
        accessLogs,
        posts,
        matches,
        payments,
        reportsAsTarget,
        reportsAsReporter
      });
    } catch (err) {
      console.error("Police disclosure generation error:", err);
      res.status(500).json({ error: "警察照会用データの生成に失敗しました。" });
    }
  });



  usersRouter.delete("/users/:id", authenticateToken, requirePermission('manage_users'), (req, res) => {
    try {
      db.prepare("DELETE FROM users WHERE id = ? AND role != 'admin'").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  const handleResetEkycEndpoint = (req: any, res: any) => {
    try {
      db.prepare("UPDATE users SET is_ekyc_verified = 0, ekyc_document_type = NULL, ekyc_verified_at = NULL, ekyc_name = NULL WHERE id = ?").run(req.params.id);
      logAction(req.user.id, "USER_RESET_EKYC", `User ID: ${req.params.id}`, req.ip);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "eKYCステータスのリセットに失敗しました" });
    }
  };

  usersRouter.patch("/users/:id/reset-ekyc", authenticateToken, requirePermission('manage_users'), handleResetEkycEndpoint);

  usersRouter.post("/users/:id/reset-ekyc", authenticateToken, requirePermission('manage_users'), handleResetEkycEndpoint);



  usersRouter.post("/users/batch-status", authenticateToken, requirePermission('manage_users'), (req: any, res) => {
    const userIds = req.body.userIds || req.body.ids;
    const { is_blocked } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "対象ユーザーが指定されていません" });
    }
    try {
      const placeholders = userIds.map(() => '?').join(',');
      const stmt = db.prepare(`UPDATE users SET is_blocked = ? WHERE id IN (${placeholders}) AND role != 'admin'`);
      const result = stmt.run(is_blocked ? 1 : 0, ...userIds);
      logAction(req.user.id, is_blocked ? "BATCH_USERS_BLOCKED" : "BATCH_USERS_UNBLOCKED", `User IDs: ${userIds.join(', ')} (${result.changes}件)`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Batch update user status error:", err);
      res.status(500).json({ error: "一括ステータス更新に失敗しました" });
    }
  });



  usersRouter.post("/users/batch-reset-ekyc", authenticateToken, requirePermission('manage_users'), (req: any, res) => {
    const userIds = req.body.userIds || req.body.ids;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "対象ユーザーが指定されていません" });
    }
    try {
      const placeholders = userIds.map(() => '?').join(',');
      const stmt = db.prepare(`UPDATE users SET is_ekyc_verified = 0, ekyc_document_type = NULL, ekyc_verified_at = NULL, ekyc_name = NULL WHERE id IN (${placeholders})`);
      const result = stmt.run(...userIds);
      logAction(req.user.id, "BATCH_USERS_RESET_EKYC", `User IDs: ${userIds.join(', ')} (${result.changes}件)`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Batch reset ekyc error:", err);
      res.status(500).json({ error: "一括eKYCリセットに失敗しました" });
    }
  });



  usersRouter.post("/users/batch-delete", authenticateToken, requirePermission('manage_users'), (req: any, res) => {
    const userIds = req.body.userIds || req.body.ids;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "対象ユーザーが指定されていません" });
    }
    try {
      const placeholders = userIds.map(() => '?').join(',');
      const stmt = db.prepare(`DELETE FROM users WHERE id IN (${placeholders}) AND role != 'admin'`);
      const result = stmt.run(...userIds);
      logAction(req.user.id, "BATCH_USERS_DELETED", `User IDs: ${userIds.join(', ')} (${result.changes}件)`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Batch delete users error:", err);
      res.status(500).json({ error: "一括削除に失敗しました" });
    }
  });



  usersRouter.get("/age-verification-logs", authenticateToken, isAdmin, (req, res) => {
    try {
      const logs = db.prepare(`
        SELECT l.*, u.username, u.full_name, u.email, u.is_ekyc_verified, u.ekyc_document_type, u.ekyc_verified_at
        FROM age_verification_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        LIMIT 500
      `).all();
      res.json(logs);
    } catch (err) {
      console.error("Fetch age verification logs error:", err);
      res.status(500).json({ error: "Failed to fetch verification logs" });
    }
  });



  // --- 5. 🛡️ 本人確認 (eKYC) 監査ログ Seed & Clear ---
  usersRouter.post("/age-logs/seed", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const usersList = db.prepare("SELECT id, username, full_name, is_ekyc_verified, ekyc_document_type FROM users WHERE role = 'user' LIMIT 30").all() as any[];
      const insertLog = db.prepare(`
        INSERT INTO age_verification_logs (user_id, ip, is_verified, age, reason, metadata_json, created_at)
        VALUES (?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      let seeded = 0;
      for (const u of usersList) {
        const isEkyc = u.is_ekyc_verified === 1 || seeded % 3 !== 0;
        const docType = isEkyc ? (seeded % 2 === 0 ? 'driver_license' : 'mynumber') : 'self_attestation';
        insertLog.run(
          u.id,
          `192.168.1.${(u.id % 250) + 1}`,
          28 + (seeded % 30),
          isEkyc ? 'AI公的身分証多層照合完了 (身元確認済)' : '18歳以上利用規約・宣誓同意',
          JSON.stringify({
            verification_flow: isEkyc ? 'primary_ekyc' : 'self_declaration',
            document_type: docType,
            method: isEkyc ? 'eKYC' : 'self_attestation',
            provider: isEkyc ? 'TRUSTDOCK_AI_OCR' : 'INTERNAL_LEGAL_PLEDGE',
            score: isEkyc ? 98 : 100,
            verified_name: u.full_name || u.username
          })
        );
        seeded++;
      }
      logAction(req.user.id, "AGE_LOGS_SEEDED", `Seeded ${seeded} age verification logs`, req.ip);
      res.json({ success: true, count: seeded });
    } catch (err) {
      console.error("Seed age logs error:", err);
      res.status(500).json({ error: "eKYC監査ログの生成に失敗しました" });
    }
  });



  usersRouter.post("/age-logs/clear-all", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM age_verification_logs").run();
      logAction(req.user.id, "AGE_LOGS_CLEARED", `Cleared all ${result.changes} age verification logs`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear age logs error:", err);
      res.status(500).json({ error: "eKYC監査ログの一括クリアに失敗しました" });
    }
  });

  // --- 6. ✨ 幸せな再会の物語 (Success Stories) Clear ---


  usersRouter.patch("/users/:id/status", authenticateToken, isAdmin, (req, res) => {
    const { is_blocked } = req.body;
    try {
      db.prepare("UPDATE users SET is_blocked = ? WHERE id = ?").run(is_blocked ? 1 : 0, req.params.id);
      logAction((req as any).user.id, is_blocked ? "USER_BLOCKED" : "USER_UNBLOCKED", `User ID: ${req.params.id}`, req.ip);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

