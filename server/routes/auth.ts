import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db";
import { JWT_SECRET, authLimiter, registrationLimiter } from "../config";
import { authenticateToken, logAction } from "../middleware/auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "../mail";
import { filterNGWords } from "../moderation";

export const authRouter = express.Router();

  authRouter.post("/register", registrationLimiter, async (req, res) => {
    let { username, email, password, lastName, firstName, nickname, captchaAnswer, captchaId, snsProvider } = req.body;
    
    // Simple CAPTCHA validation (mock)
    if (captchaAnswer !== "4") { // Assuming the question was 2+2
      return res.status(400).json({ error: "ボット防止認証に失敗しました。「4」と入力してください。" });
    }

    if (!email || !password || !lastName || !firstName || !nickname) {
      return res.status(400).json({ error: "すべての必須項目（メールアドレス、パスワード、お名前、ニックネーム）を入力してください。" });
    }

    // 会員番号（ユーザーID: UID-6桁数字）を自動付番（重複防止チェック付き）
    if (!username || !username.startsWith('UID-')) {
      let generatedUid = '';
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        attempts++;
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        generatedUid = `UID-${randomNum}`;
        const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(generatedUid);
        if (!existing) {
          isUnique = true;
        }
      }
      username = generatedUid;
    }

    // Password strength check
    const isAlphanumeric = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    if (password.length < 8 || !isAlphanumeric) {
      return res.status(400).json({ error: "パスワードは8文字以上で、英字と数字の両方を含める必要があります。" });
    }

    if (
      filterNGWords(username) !== username ||
      filterNGWords(lastName) !== lastName ||
      filterNGWords(firstName) !== firstName ||
      filterNGWords(nickname) !== nickname
    ) {
      return res.status(400).json({ error: "不適切な入力が含まれています。個人情報（本名以外の場所での本名入力など）や不適切な言葉は使用できません。" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const fullName = `${lastName} ${firstName}`;
      
      const stmt = db.prepare(`
        INSERT INTO users (username, email, password, full_name, last_name, first_name, nickname, role, verification_token) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'user', ?)
      `);
      const result = stmt.run(username, email, hashedPassword, fullName, lastName, firstName, nickname, verificationToken);
      
      await sendVerificationEmail(email, verificationToken);

      res.json({ 
        message: "登録が完了しました。確認メールを送信しましたので、メール内の案内をご確認ください。",
        user: { 
          id: result.lastInsertRowid, 
          username, 
          email, 
          role: 'user', 
          fullName, 
          lastName, 
          firstName, 
          nickname 
        } 
      });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        if (err.message.includes("users.email")) {
          return res.status(400).json({ error: "このメールアドレスは既に登録されています。" });
        }
        return res.status(400).json({ error: "このアカウントは既に登録されています。" });
      }
      res.status(500).json({ error: "登録に失敗しました。" });
    }
  });

  authRouter.post("/login", authLimiter, async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || null;
    console.log(`Login attempt for username: ${username}`);
    try {
      const user = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(username, username) as any;
      if (!user) {
        console.log(`User not found: ${username}`);
        logAction(null, "login_failure", `User not found: ${username}`, ip);
        return res.status(401).json({ error: "ユーザー名またはパスワードが正しくありません。" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log(`Password mismatch for user: ${username}`);
        logAction(user.id, "login_failure", `Password mismatch for ${username}`, ip);
        return res.status(401).json({ error: "ユーザー名またはパスワードが正しくありません。" });
      }
      
      if (!user.is_verified && process.env.NODE_ENV === 'production') {
        console.log(`User not verified: ${username}`);
        logAction(user.id, "login_attempt_unverified", `Unverified login for ${username}`, ip);
        return res.status(403).json({ error: "メールアドレスの確認が完了していません。送信されたメールを確認してください。" });
      }

      const role = user.role || 'user';
      const fullName = user.full_name || null;
      const lastName = user.last_name || null;
      const firstName = user.first_name || null;
      const nickname = user.nickname || null;
      const email = user.email || null;
      const maiden_name = user.maiden_name || null;
      const token = jwt.sign({ id: user.id, username: user.username, role, fullName, lastName, firstName, nickname, email, maiden_name }, JWT_SECRET);
      logAction(user.id, "login_success", `User ${username} logged in`, ip);
      res.json({ token, user: { id: user.id, username: user.username, role, fullName, lastName, firstName, nickname, email, maiden_name } });
    } catch (err) {
      res.status(500).json({ error: "ログインに失敗しました。" });
    }
  });

  authRouter.post("/verify-email", async (req, res) => {
    const { token } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE verification_token = ?").get(token) as any;
      if (!user) return res.status(400).json({ error: "無効なトークンです。" });

      db.prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?").run(user.id);
      res.json({ success: true, message: "メールアドレスの確認が完了しました。ログインしてください。" });
    } catch (err) {
      res.status(500).json({ error: "確認に失敗しました。" });
    }
  });

  authRouter.post("/forgot-password", authLimiter, async (req, res) => {
    const { email } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
        db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?").run(resetToken, expires, user.id);
        await sendPasswordResetEmail(email, resetToken);
      }
      // Always return success to prevent email enumeration
      res.json({ message: "パスワードリセットの手順をメールで送信しました（登録されている場合）。" });
    } catch (err) {
      res.status(500).json({ error: "リクエストに失敗しました。" });
    }
  });

  authRouter.post("/reset-password", authLimiter, async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: "パスワードは6文字以上で指定してください。" });
    }
    try {
      const user = db.prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?").get(token, new Date().toISOString()) as any;
      if (!user) return res.status(400).json({ error: "無効または期限切れのトークンです。" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?").run(hashedPassword, user.id);
      logAction(user.id, "PASSWORD_RESET_SUCCESS", `Password reset successful for user #${user.id} (${user.username})`, req.ip);
      res.json({ success: true, message: "パスワードを更新しました。新しいパスワードでログインしてください。" });
    } catch (err) {
      res.status(500).json({ error: "パスワードリセットに失敗しました。" });
    }
  });

  // --- Success Stories Routes ---



  authRouter.get("/me", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare("SELECT id, username, email, role, full_name, last_name, first_name, nickname, maiden_name, is_ekyc_verified, ekyc_verified_at, ekyc_document_type, ekyc_name FROM users WHERE id = ?").get(req.user.id) as any;
      res.json({ 
        ...user, 
        fullName: user.full_name || `${user.last_name || ''} ${user.first_name || ''}`.trim(),
        lastName: user.last_name || '',
        firstName: user.first_name || '',
        nickname: user.nickname || '',
        maiden_name: user.maiden_name || '',
        is_ekyc_verified: user.is_ekyc_verified === 1 || Boolean(user.is_ekyc_verified)
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  authRouter.post("/ekyc-verify", authenticateToken, async (req: any, res) => {
    const { document_type = "license", ekyc_name, birthdate } = req.body || {};
    try {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;
      if (!user) {
        return res.status(404).json({ error: "ユーザーが見つかりません。" });
      }

      const verifiedName = ekyc_name || user.full_name || `${user.last_name || ''} ${user.first_name || ''}`.trim() || user.username;
      
      db.prepare(`
        UPDATE users 
        SET is_ekyc_verified = 1, 
            ekyc_verified_at = CURRENT_TIMESTAMP, 
            ekyc_document_type = ?, 
            ekyc_name = ?,
            birthdate = COALESCE(?, birthdate)
        WHERE id = ?
      `).run(document_type, verifiedName, birthdate || null, req.user.id);

      // Log in age_verification_logs if table exists
      try {
        db.prepare(`
          INSERT INTO age_verification_logs (user_id, status, document_type, verified_name, created_at)
          VALUES (?, 'approved', ?, ?, CURRENT_TIMESTAMP)
        `).run(req.user.id, document_type, verifiedName);
      } catch (logErr) {}

      logAction(req.user.id, "EKYC_VERIFICATION_SUCCESS", `eKYC verified via ${document_type} for ${verifiedName}`, req.ip);

      res.json({ 
        success: true, 
        message: "eKYC公的本人確認が完了しました。",
        is_ekyc_verified: true,
        ekyc_verified_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("eKYC verification error:", err);
      res.status(500).json({ error: "本人確認の照合処理に失敗しました。" });
    }
  });

  const resetEkycHandler = async (req: any, res: any) => {
    try {
      db.prepare(`
        UPDATE users 
        SET is_ekyc_verified = 0, 
            ekyc_verified_at = NULL, 
            ekyc_document_type = NULL, 
            ekyc_name = NULL
        WHERE id = ?
      `).run(req.user.id);

      logAction(req.user.id, "EKYC_RESET", "eKYC status reset to unverified for testing", req.ip);

      res.json({ 
        success: true, 
        message: "eKYCステータスをリセットしました。",
        is_ekyc_verified: false
      });
    } catch (err) {
      console.error("eKYC reset error:", err);
      res.status(500).json({ error: "eKYCステータスのリセットに失敗しました。" });
    }
  };

  authRouter.post("/reset-ekyc", authenticateToken, resetEkycHandler);
  authRouter.post("/ekyc-reset", authenticateToken, resetEkycHandler);

  authRouter.patch("/me", authenticateToken, async (req: any, res) => {
    const { nickname, email, maiden_name, full_name, last_name, first_name, birthdate } = req.body;
    if (nickname && filterNGWords(nickname) !== nickname) {
      return res.status(400).json({ error: "ニックネームに不適切な言葉、または個人情報が含まれています。" });
    }
    if (maiden_name && filterNGWords(maiden_name) !== maiden_name) {
      return res.status(400).json({ error: "旧姓に不適切な言葉が含まれています。" });
    }
    try {
      const currentUser = db.prepare("SELECT email, is_ekyc_verified FROM users WHERE id = ?").get(req.user.id) as any;
      
      // 🛡️ SEC-020: eKYC承認後の「本名・生年月日」改ざん不可ロック（なりすまし防止）
      if (currentUser?.is_ekyc_verified && (full_name !== undefined || last_name !== undefined || first_name !== undefined || birthdate !== undefined)) {
        return res.status(400).json({ error: "公的本人確認（eKYC）完了後は、氏名・生年月日の変更はできません。変更が必要な場合は運営サポート窓口へお問い合わせください。" });
      }

      let emailChanged = false;
      let verificationToken = null;

      if (email && email !== currentUser.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "メールアドレスの形式が正しくありません。" });
        }
        const existing = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, req.user.id);
        if (existing) {
          return res.status(400).json({ error: "このメールアドレスはすでに登録されています。" });
        }
        emailChanged = true;
        verificationToken = crypto.randomBytes(32).toString("hex");
      }

      if (emailChanged) {
        db.prepare("UPDATE users SET nickname = COALESCE(?, nickname), email = ?, maiden_name = COALESCE(?, maiden_name), is_verified = 0, verification_token = ? WHERE id = ?").run(nickname ?? null, email, maiden_name ?? null, verificationToken, req.user.id);
        await sendVerificationEmail(email, verificationToken);
      } else {
        db.prepare("UPDATE users SET nickname = COALESCE(?, nickname), email = COALESCE(?, email), maiden_name = COALESCE(?, maiden_name) WHERE id = ?").run(nickname ?? null, email ?? null, maiden_name ?? null, req.user.id);
      }

      res.json({ success: true, emailChanged });
    } catch (err) {
      res.status(500).json({ error: "プロフィールの更新に失敗しました。" });
    }
  });

  // 🛡️ SEC-011: ユーザー退会・個人データ完全物理消去API
  authRouter.delete("/me", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) {
        return res.status(404).json({ error: "ユーザーが見つかりません。" });
      }
      if (user.role === 'admin') {
        return res.status(403).json({ error: "管理者アカウントはマイページから直接退会できません。" });
      }

      // トランザクションによる個人データ物理消去・サニタイズ
      db.transaction(() => {
        // 1. ユーザーの通知・アラート消去
        db.prepare("DELETE FROM notifications WHERE user_id = ?").run(userId);
        db.prepare("DELETE FROM search_alerts WHERE email = ?").run(user.email);
        
        // 2. 外部キー制約テーブルの安全解除・匿名化
        db.prepare("UPDATE posts SET verified_by = NULL WHERE verified_by = ?").run(userId);
        db.prepare("UPDATE payment_transactions SET user_id = NULL WHERE user_id = ?").run(userId);
        db.prepare("UPDATE action_logs SET user_id = NULL WHERE user_id = ?").run(userId);
        db.prepare("UPDATE access_logs SET user_id = NULL WHERE user_id = ?").run(userId);
        try { db.prepare("UPDATE age_verification_logs SET user_id = NULL WHERE user_id = ?").run(userId); } catch (e) {}
        try { db.prepare("UPDATE age_verification_documents SET user_id = NULL WHERE user_id = ?").run(userId); } catch (e) {}
        try { db.prepare("UPDATE success_stories SET user_id = NULL WHERE user_id = ?").run(userId); } catch (e) {}
        try { db.prepare("UPDATE contacts SET user_id = NULL WHERE user_id = ?").run(userId); } catch (e) {}
        try { db.prepare("UPDATE reports SET reporter_id = NULL WHERE reporter_id = ?").run(userId); } catch (e) {}

        // 3. 退会ユーザーの手紙の個人情報物理消去（差出人本名・連絡先IDの消去）
        db.prepare(`
          UPDATE posts 
          SET searcher_full_name = '退会済ユーザー', 
              contact_id = NULL, 
              contact_note = NULL,
              user_id = NULL 
          WHERE user_id = ?
        `).run(userId);

        // 4. ユーザーレコードの物理消去
        db.prepare("DELETE FROM users WHERE id = ?").run(userId);
      })();

      logAction(null, "USER_ACCOUNT_DELETED", `User ID: ${userId} (${user.username}) self-deleted account and purged personal data.`, req.ip);

      res.json({ success: true, message: "退会手続きが完了し、アカウントと個人情報が完全に消去されました。" });
    } catch (err) {
      console.error("Account deletion error:", err);
      res.status(500).json({ error: "退会処理中にエラーが発生しました。" });
    }
  });

  // --- Notification & Search Alert Routes ---


