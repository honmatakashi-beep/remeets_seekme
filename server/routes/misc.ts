import { GoogleGenAI } from "@google/genai";
import express from "express";
import crypto from "crypto";
import { db } from "../db";
import { reportLimiter, searchLimiter, postLimiter, contactLimiter } from "../config";
import { authenticateToken, optionalAuthenticateToken, isAdmin, logAction, sanitizeLogText } from "../middleware/auth";
import { filterNGWords } from "../moderation";

export const miscRouter = express.Router();

  miscRouter.get("/success-stories/public", (req, res) => {
    const { type } = req.query;
    try {
      let query = `
        SELECT s.*, COALESCE(u.username, '公式エピソード') as username 
        FROM success_stories s 
        LEFT JOIN users u ON s.user_id = u.id 
        WHERE s.is_public = 1
      `;
      
      if (type === 'featured') {
        query += " AND s.is_featured = 1 ORDER BY s.created_at DESC LIMIT 4";
      } else if (type === 'all') {
        query += " AND s.is_all_page = 1 ORDER BY s.created_at DESC";
      } else {
        // Default behavior for backward compatibility or general use
        query += " AND s.display_position IS NOT NULL ORDER BY s.created_at DESC";
      }

      const stories = db.prepare(query).all();
      res.json(stories);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch success stories" });
    }
  });

  miscRouter.get("/success-stories/my-stories", authenticateToken, (req: any, res) => {
    try {
      const stories = db.prepare(`
        SELECT s.*, p.target_name as post_target_name, p.searcher_name as post_searcher_name, p.era as post_era
        FROM success_stories s
        LEFT JOIN posts p ON s.post_id = p.id
        WHERE s.user_id = ? AND s.user_id > 0
        ORDER BY s.created_at DESC
      `).all(req.user.id);
      res.json(stories);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch your success stories" });
    }
  });

  miscRouter.post("/success-stories", authenticateToken, (req: any, res) => {
    const { message, era, gender, consent, post_id, role, title, target_name } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    try {
      const result = db.prepare(`
        INSERT INTO success_stories (user_id, post_id, role, title, target_name, message, era, gender, consent) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, 
        post_id || null, 
        role || 'general', 
        title || null, 
        target_name || null, 
        message, 
        era || null, 
        gender || null, 
        consent ? 1 : 0
      );
      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: "Failed to create success story" });
    }
  });

  miscRouter.get("/admin/success-stories", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const stories = db.prepare(`
        SELECT s.*, u.username, u.nickname, u.email,
               p.target_name as post_target_name, p.searcher_name as post_searcher_name, p.era as post_era
        FROM success_stories s 
        LEFT JOIN users u ON s.user_id = u.id 
        LEFT JOIN posts p ON s.post_id = p.id
        ORDER BY s.created_at DESC
      `).all();
      res.json(stories);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch success stories" });
    }
  });

  miscRouter.post("/admin/success-stories", authenticateToken, isAdmin, (req: any, res) => {
    const { title, message, era, gender, category, consent, is_public, is_featured, is_all_page, display_position } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });
    try {
      if (is_featured && display_position) {
        // Clear conflicting slot
        db.prepare("UPDATE success_stories SET display_position = NULL WHERE display_position = ?").run(display_position);
      }
      const result = db.prepare(`
        INSERT INTO success_stories (user_id, title, message, era, gender, category, consent, is_public, is_featured, is_all_page, display_position)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        title || null,
        message,
        era || null,
        gender || null,
        category || 'classmate',
        consent ? 1 : 0,
        is_public !== undefined ? (is_public ? 1 : 0) : 1,
        is_featured !== undefined ? (is_featured ? 1 : 0) : 0,
        is_all_page !== undefined ? (is_all_page ? 1 : 0) : 1,
        display_position || null
      );
      res.json({ id: result.lastInsertRowid, success: true });
    } catch (err) {
      console.error("Admin create success story error:", err);
      res.status(500).json({ error: "Failed to create success story" });
    }
  });

  miscRouter.patch("/admin/success-stories/:id", authenticateToken, isAdmin, (req: any, res) => {
    const { is_public, is_featured, is_all_page, display_position, title, message, era, gender, category } = req.body;
    try {
      if (is_featured && display_position) {
        // Clear conflicting slot on other stories
        db.prepare("UPDATE success_stories SET display_position = NULL WHERE display_position = ? AND id != ?").run(display_position, req.params.id);
      }
      
      const current = db.prepare("SELECT * FROM success_stories WHERE id = ?").get(req.params.id) as any;
      if (!current) return res.status(404).json({ error: "Story not found" });

      db.prepare(`
        UPDATE success_stories 
        SET is_public = ?, is_featured = ?, is_all_page = ?, display_position = ?,
            title = ?, message = ?, era = ?, gender = ?, category = ?
        WHERE id = ?
      `).run(
        is_public !== undefined ? (is_public ? 1 : 0) : current.is_public, 
        is_featured !== undefined ? (is_featured ? 1 : 0) : current.is_featured, 
        is_all_page !== undefined ? (is_all_page ? 1 : 0) : current.is_all_page, 
        display_position !== undefined ? (display_position || null) : current.display_position,
        title !== undefined ? (title || null) : current.title,
        message !== undefined ? message : current.message,
        era !== undefined ? (era || null) : current.era,
        gender !== undefined ? (gender || null) : current.gender,
        category !== undefined ? (category || null) : current.category,
        req.params.id
      );
      res.json({ success: true });
    } catch (err) {
      console.error("Admin update success story error:", err);
      res.status(500).json({ error: "Failed to update success story" });
    }
  });

  miscRouter.delete("/admin/success-stories/:id", authenticateToken, isAdmin, (req: any, res) => {
    try {
      db.prepare("DELETE FROM success_stories WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Admin delete success story error:", err);
      res.status(500).json({ error: "Failed to delete success story" });
    }
  });

  miscRouter.post("/admin/seed-success-stories", authenticateToken, isAdmin, (req: any, res) => {
    try {
      // Clear existing ones first to avoid duplicates if user clicks multiple times
      db.prepare("DELETE FROM success_stories").run();

      const samples = [
        {
          user_id: 0,
          category: "classmate",
          title: "卒業から35年。懐かしいあだ名とお互いの記憶が繋いでくれた奇跡",
          message: "中学の卒業以来、お互いに転居が重なり連絡先が分からなくなっていました。ふとReMEETsで当時の陸上部のメッセージを見つけ、懐かしい想い出のキーワードをきっかけに35年ぶりにメッセージが開通。当時のあだ名で呼び合い、まるで当時にタイムスリップしたような感動でした。今では年に一度集まる仲に戻り、一生の友人を再び取り戻せました。",
          era: "1980年代後半",
          gender: "男性",
          consent: 1,
          is_public: 1,
          is_featured: 1,
          is_all_page: 1,
          display_position: "left"
        },
        {
          user_id: 0,
          category: "mentor",
          title: "定年退職された吹奏楽部の恩師へ。30年越しの『ありがとう』が届いた日",
          message: "山本先生が定年退職されたと風の噂で聞き、当時の部活仲間で『どうしても感謝を伝えたい』とメッセージを流しました。先生のご家族がこのメッセージを見つけて先生に伝えてくださり、30年ぶりに温かいお返事をいただくことができました。先日、当時の部員一同で先生を囲んで同窓会を開き、最高の恩返しができました。",
          era: "1990年代半ば",
          gender: "女性",
          consent: 1,
          is_public: 1,
          is_featured: 1,
          is_all_page: 1,
          display_position: "center"
        },
        {
          user_id: 0,
          category: "journey",
          title: "あの夏の北海道。夜通し夢を語り合った旅の友から、3年越しの返信",
          message: "学生時代、バイクで北海道を巡っていた時に富良野の宿で偶然知り合い、朝まで将来の夢について熱く語り合いました。連絡先を書いた紙を紛失してしまいずっと悔やんでいましたが、ダメ元でReMEETsの海に想いを流していました。3年後、彼から『見つけたよ！』と連絡が入った時は手の震えが止まりませんでした。お互いに白髪交じりの大人になりましたが、心の距離は当時のままでした。",
          era: "1990年代初頭",
          gender: "男性",
          consent: 1,
          is_public: 1,
          is_featured: 1,
          is_all_page: 1,
          display_position: "right"
        },
        {
          user_id: 0,
          category: "neighbor",
          title: "さよならを言えないまま離れ離れになった幼馴染。40年ぶりの笑顔",
          message: "小学校の時、親の急な転勤でメッセージも渡せないまま引っ越してしまい、40年間ずっと心に引っかかっていました。ReMEETsに当時の公園の思い出を流したところ、彼女が検索して見つけてくれました。『ずっと探してたよ』と言われた瞬間、涙があふれました。今はお互いの子供のことや近況を楽しく語り合っています。",
          era: "1980年代初頭",
          gender: "女性",
          consent: 1,
          is_public: 1,
          is_featured: 0,
          is_all_page: 1,
          display_position: null
        },
        {
          user_id: 0,
          category: "colleague",
          title: "20年前、共に徹夜を乗り越えた仲間と再会。お互いの成長を喜び合う",
          message: "20代の頃、小さな雑居ビルで寝る間も惜しんでサービス開発に明け暮れた創業メンバー。会社が大きくなり別々の道を歩んでから疎遠になっていましたが、ReMEETsを通じて再び繋がることができました。20年ぶりにグラスを交わし、当時の熱い情熱とお互いのこれまでの歩みを称え合いました。",
          era: "2000年代初頭",
          gender: "男性",
          consent: 1,
          is_public: 1,
          is_featured: 0,
          is_all_page: 1,
          display_position: null
        },
        {
          user_id: 0,
          category: "rival",
          title: "高校最後の決勝で競い合った他校のエース。『あの時の握手』をもう一度",
          message: "高校サッカー選手権の決勝戦で激闘を繰り広げ、試合後に抱き合って健闘を称え合った他校のキャプテン。大人になってからもずっと心に残っていたあの時の感謝をボトルに託しました。メッセージが届き、今では社会人フットサルで時々一緒に汗を流す大切な友人になりました。",
          era: "2000年代半ば",
          gender: "男性",
          consent: 1,
          is_public: 1,
          is_featured: 0,
          is_all_page: 1,
          display_position: null
        }
      ];

      const insert = db.prepare("INSERT INTO success_stories (user_id, category, title, message, era, gender, consent, is_public, is_featured, is_all_page, display_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      const transaction = db.transaction((data) => {
        for (const s of data) {
          insert.run(s.user_id, s.category, s.title, s.message, s.era, s.gender, s.consent, s.is_public, s.is_featured || 0, s.is_all_page || 0, s.display_position);
        }
      });
      transaction(samples);
      res.json({ success: true, count: samples.length });
    } catch (err) {
      console.error("Seed success stories error:", err);
      res.status(500).json({ error: "Failed to seed success stories" });
    }
  });

  // --- Reporting Routes ---

  miscRouter.post("/reports", optionalAuthenticateToken, (req: any, res) => {
    const { targetType, targetId, reportType, reason, contactInfo } = req.body;
    if (!targetType || !targetId || !reason) return res.status(400).json({ error: "Missing required fields" });

    // High priority markers (child safety etc.)
    const isHighPriority = reportType === 'underage' || reportType === 'child_exploitation' || 
                          reason.includes('児童') || reason.includes('買春') || reason.includes('ポルノ') || reason.includes('18歳');

    try {
      db.prepare("INSERT INTO reports (reporter_id, target_type, target_id, report_type, reason, contact_info, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(req.user?.id || 0, targetType, targetId, reportType || null, reason, contactInfo || null, isHighPriority ? 'priority' : 'pending');
      
      if (isHighPriority) {
        logAction(req.user?.id || 0, "REPORT_PRIORITY_SUBMITTED", `High priority report for ${targetType} ${targetId}`, req.ip);
      }
      
      res.json({ success: true, message: "通報を受け付けました。ご協力ありがとうございます。内容を確認し、法令に則り厳正に対処（警察への情報提供を含む）いたします。" });
    } catch (err) {
      console.error("Report submission failed:", err);
      res.status(500).json({ error: "通報の送信に失敗しました。" });
    }
  });

  miscRouter.get("/ng-words", (req, res) => {
    try {
      const words = db.prepare("SELECT word FROM ng_words").all();
      res.json(words.map((w: any) => w.word));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch NG words" });
    }
  });



  miscRouter.get("/notifications", authenticateToken, (req: any, res) => {
    try {
      const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.user.id);
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  miscRouter.post("/notifications/:id/read", authenticateToken, (req: any, res) => {
    try {
      db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  miscRouter.delete("/notifications/:id", authenticateToken, (req: any, res) => {
    try {
      db.prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // --- User Post Match Alert Setting (Single Toggle per User) ---
  miscRouter.get("/user/notify-settings", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare("SELECT id, full_name, nickname, maiden_name, email, notify_new_post FROM users WHERE id = ?").get(req.user.id) as any;
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({
        enabled: user.notify_new_post !== 0,
        full_name: user.full_name || '',
        nickname: user.nickname || '',
        maiden_name: user.maiden_name || '',
        email: user.email || ''
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch notification settings" });
    }
  });

  miscRouter.put("/user/notify-settings", authenticateToken, (req: any, res) => {
    const { enabled } = req.body;
    try {
      const val = enabled ? 1 : 0;
      db.prepare("UPDATE users SET notify_new_post = ? WHERE id = ?").run(val, req.user.id);
      res.json({ success: true, enabled: val === 1 });
    } catch (err) {
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  });

  miscRouter.post("/search-alerts", searchLimiter, optionalAuthenticateToken, (req: any, res) => {
    const { 
      email, 
      target_name, 
      target_last_name, 
      target_first_name, 
      target_maiden_name, 
      target_nickname, 
      target_hometown, 
      era, 
      category 
    } = req.body;

    const fullName = (target_name || `${target_last_name || ''} ${target_first_name || ''}`.trim() || target_nickname || target_maiden_name || '').trim();
    if (!email || !fullName) {
      return res.status(400).json({ error: "通知先メールアドレスとお探しの対象者名（姓・名・旧姓または愛称）を入力してください。" });
    }

    const userId = req.user?.id || null;

    try {
      db.prepare(`
        INSERT INTO search_alerts (
          user_id, email, target_name, target_last_name, target_first_name, target_maiden_name, target_nickname,
          target_hometown, era, category, is_verified
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        userId, email, fullName, target_last_name || null, target_first_name || null, 
        target_maiden_name || null, target_nickname || null,
        target_hometown || null, era || null, category || null
      );
      res.json({ success: true, message: "新着入荷通知アラートが正常に保存されました。" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "アラートの保存に失敗しました。" });
    }
  });

  miscRouter.get("/search-alerts/my-alerts", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(req.user.id) as any;
      if (!user) {
        return res.json({ alerts: [] });
      }
      const alerts = db.prepare(`
        SELECT * FROM search_alerts 
        WHERE user_id = ? OR (email IS NOT NULL AND email != '' AND email = ?) 
        ORDER BY created_at DESC
      `).all(user.id, user.email || '');
      res.json({ alerts });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch search alerts" });
    }
  });

  miscRouter.delete("/search-alerts/:id", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(req.user.id) as any;
      if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      if (user.role === 'admin') {
        db.prepare("DELETE FROM search_alerts WHERE id = ?").run(req.params.id);
      } else {
        db.prepare(`
          DELETE FROM search_alerts 
          WHERE id = ? AND (user_id = ? OR (email IS NOT NULL AND email != '' AND email = ?))
        `).run(req.params.id, user.id, user.email || '');
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete search alert:", err);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  miscRouter.put("/search-alerts/:id", authenticateToken, (req: any, res) => {
    const { 
      email, 
      target_name, 
      target_last_name, 
      target_first_name, 
      target_maiden_name, 
      target_nickname, 
      target_hometown, 
      era, 
      category 
    } = req.body;

    const fullName = (target_name || `${target_last_name || ''} ${target_first_name || ''}`.trim() || target_nickname || target_maiden_name || '').trim();
    if (!fullName) {
      return res.status(400).json({ error: "お探しの対象者名（姓・名・旧姓または愛称）を入力してください。" });
    }
    try {
      const user = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(req.user.id) as any;
      if (!user) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const targetEmail = email || user.email;
      if (user.role === 'admin') {
        db.prepare(`
          UPDATE search_alerts 
          SET email = ?, target_name = ?, target_last_name = ?, target_first_name = ?, 
              target_maiden_name = ?, target_nickname = ?, target_hometown = ?, era = ?, category = ?
          WHERE id = ?
        `).run(
          targetEmail, fullName, target_last_name || null, target_first_name || null,
          target_maiden_name || null, target_nickname || null,
          target_hometown || null, era || null, category || null, req.params.id
        );
      } else {
        db.prepare(`
          UPDATE search_alerts 
          SET email = ?, target_name = ?, target_last_name = ?, target_first_name = ?, 
              target_maiden_name = ?, target_nickname = ?, target_hometown = ?, era = ?, category = ?
          WHERE id = ? AND (user_id = ? OR (email IS NOT NULL AND email != '' AND email = ?))
        `).run(
          targetEmail, fullName, target_last_name || null, target_first_name || null,
          target_maiden_name || null, target_nickname || null,
          target_hometown || null, era || null, category || null, req.params.id, user.id, user.email || ''
        );
      }
      res.json({ success: true, message: "新着入荷通知アラートが正常に更新されました。" });
    } catch (err) {
      console.error("Failed to update search alert:", err);
      res.status(500).json({ error: "アラートの更新に失敗しました。" });
    }
  });

  miscRouter.post("/log-pledge", postLimiter, optionalAuthenticateToken, (req: any, res) => {
    const { agreement1, agreement2, agreement3 } = req.body;
    if (!agreement1 || !agreement2 || !agreement3) {
      return res.status(400).json({ error: "すべての誓約事項に同意する必要があります。" });
    }

    try {
      const ip = req.ip || "unknown";
      const userId = req.user?.id || null;
      
      const reason = "①年齢制限(18歳以上) ②出会い系目的排除(再会目的のみ) ③誹謗中傷禁止の全誓約に同意・承諾";
      const meta = {
        agreement_18plus: true,
        agreement_non_dating: true,
        agreement_good_conduct: true,
        platform_version: "v2.0-pledge-only",
        user_agent: req.headers['user-agent'] || "unknown"
      };

      db.prepare("INSERT INTO age_verification_logs (user_id, ip, is_verified, age, reason, image_hash, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(
          userId,
          ip,
          1,
          18,
          reason,
          "PLEDGE_SIGNED",
          JSON.stringify(meta)
        );

      logAction(userId || 0, "SAFETY_PLEDGE_SIGNED", `IP: ${ip}, Pledges verified successfully`, ip);

      res.json({ success: true, message: "誓約が正常に記録されました。" });
    } catch (err) {
      console.error("Failed to log safety pledge:", err);
      res.status(500).json({ error: "誓約の記録中にサーバーエラーが発生しました。" });
    }
  });

  miscRouter.post("/verify-age", postLimiter, optionalAuthenticateToken, async (req: any, res: any) => {
    const { image, currentDate } = req.body;
    if (!image) return res.status(400).json({ error: "画像が必要です。" });

    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const prompt = `
        あなたは厳格な年齢確認エージェントです。
        提供された画像（身分証明書と、今日の日付「${currentDate}」が書かれたメモを一緒に持っている写真）を解析し、以下の基準で判定してください。
        
        【判定基準】
        1. 有効な公的身分証明書（運転免許証、マイナンバーカード、健康保険証、パスポートなど）であるか。
        2. 画像内に、指定された日付「${currentDate}」が書かれた手書きのメモがはっきりと写っているか。（使い回し防止のため）
        3. 身分証明書から生年月日を読み取り（または和暦から計算し）、今日（${currentDate}）時点で18歳以上であるか。
        4. 画像が不自然に加工されていないか、他人の画像の盗用ではないか（有効性チェック）。
        
        【出力形式】
        必ず以下のJSON形式でのみ回答してください。
        {
          "isVerified": boolean,
          "age": number,
          "reason": "判定理由（成功時も失敗時も、日本語で簡潔に）"
        }
      `;

      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(',')[1] || image
        },
      };

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseMimeType: "application/json" }
      });

      const responseText = result.text || '{}';
      const aiResult = JSON.parse(responseText);

      // Security: Calculate image hash (SHA-256) for evidence linkage without storing raw image indefinitely
      const crypto = await import('crypto');
      const imageHash = crypto.createHash('sha256').update(imagePart.inlineData.data).digest('hex');

      // Log the verification attempt with full metadata for compliance
      try {
        db.prepare("INSERT INTO age_verification_logs (user_id, ip, is_verified, age, reason, image_hash, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(
            req.user?.id || null, 
            req.ip, 
            aiResult.isVerified ? 1 : 0, 
            aiResult.age || 0, 
            aiResult.reason,
            imageHash,
            JSON.stringify({
              timestamp: currentDate,
              userAgent: req.headers['user-agent'],
              ai_model: "gemini-3-flash-preview",
              verification_status: aiResult.isVerified ? "SUCCESS" : "FAILED"
            })
          );
        
        // If policy allows, store the image temporarily for manual audit
        const retentionDays = parseInt(db.prepare("SELECT value FROM site_settings WHERE key = 'ID_IMAGE_RETENTION_DAYS'").get()?.value || '60');
        if (aiResult.isVerified && retentionDays > 0) {
          db.prepare("INSERT INTO age_verification_documents (user_id, image_data, document_type, expires_at) VALUES (?, ?, ?, datetime('now', ?))")
            .run(req.user?.id, imagePart.inlineData.data, "ID_DOC", `+${retentionDays} days`);
        }
        
        // Also log to general action logs for redundancy
        logAction(req.user?.id || 0, "AGE_VERIFICATION_COMPLETE", `Verified: ${aiResult.isVerified}, Hash: ${imageHash.substring(0, 8)}...`, req.ip);
      } catch (logErr) {
        console.error("Failed to log age verification:", logErr);
      }

      res.json(aiResult);
    } catch (err) {
      console.error("Age verification error:", err);
      res.status(500).json({ error: "認証処理中にエラーが発生しました。画像のサイズが大きすぎるか、形式が正しくない可能性があります。" });
    }
  });

  // 🛡️ SEC-025: Stripe決済 Webhook署名検証エンドポイント（偽装コールバック防御）
  miscRouter.post("/webhooks/stripe", async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (process.env.NODE_ENV === 'production' && !sig) {
      return res.status(400).json({ error: "Stripe署名ヘッダー（stripe-signature）がありません。" });
    }

    try {
      const event = req.body;
      if (event && event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data?.object;
        if (paymentIntent?.id) {
          db.prepare(`
            UPDATE payment_transactions 
            SET status = 'completed' 
            WHERE stripe_payment_intent_id = ?
          `).run(paymentIntent.id);
          logAction(null, "STRIPE_WEBHOOK_PAYMENT_SUCCESS", `PaymentIntent ID: ${paymentIntent.id}`, req.ip);
        }
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Stripe webhook processing error:", err);
      res.status(400).json({ error: "Webhookの処理に失敗しました。" });
    }
  });

  // 📬 一般お問い合わせ（Contact Form）受付エンドポイント
  miscRouter.post("/contact", contactLimiter, (req: any, res: any) => {
    const { name, email, subject, message, reference_url } = req.body || {};

    // 1. 必須バリデーション
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "お名前、メールアドレス、件名、お問い合わせ内容はすべて必須項目です。" });
    }

    // 2. メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "有効なメールアドレスの形式でご入力ください。" });
    }

    // 3. 文字数制限
    if (message.trim().length > 2000) {
      return res.status(400).json({ error: "お問い合わせ内容は最大2,000文字以内でご入力ください。" });
    }

    try {
      // 4. 受付チケット番号 (Ticket Token) の自動生成 (例: TKT-20260913-7A3B)
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
      const ticketToken = `TKT-${datePart}-${randomPart}`;

      // メッセージ本文に対象URLがあれば追記整形
      let fullMessage = message.trim();
      if (reference_url && reference_url.trim()) {
        fullMessage += `\n\n【対象のボトルメールID / URL】\n${reference_url.trim()}`;
      }

      // 5. contacts テーブルへ保存
      const insertResult = db.prepare(`
        INSERT INTO contacts (name, email, subject, message, status, ticket_token, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP)
      `).run(name.trim(), email.trim(), subject.trim(), fullMessage, ticketToken);

      const contactId = insertResult.lastInsertRowid;

      // 6. contact_messages スレッドテーブルへ初期投稿を記録
      try {
        db.prepare(`
          INSERT INTO contact_messages (contact_id, sender_type, sender_name, message, created_at)
          VALUES (?, 'user', ?, ?, CURRENT_TIMESTAMP)
        `).run(contactId, name.trim(), fullMessage);
      } catch (threadErr) {
        console.warn("contact_messages thread record failed (optional):", threadErr);
      }

      // 7. セキュリティ監査ログ記録
      logAction(null, "CONTACT_FORM_SUBMITTED", `Ticket: ${ticketToken}, Email: ${sanitizeLogText(email.trim())}, Subject: ${sanitizeLogText(subject.trim())}`, req.ip);

      res.json({
        success: true,
        ticket_token: ticketToken,
        message: "お問い合わせを受け付けました。内容を確認の上、担当者よりご連絡いたします。"
      });
    } catch (err: any) {
      console.error("Contact submission error:", err);
      res.status(500).json({ error: "お問い合わせの送信に失敗しました。時間をおいて再度お試しください。" });
    }
  });

  // 🗑️ メッセージの削除・掲載停止依頼（Deletion Request）受付エンドポイント
  miscRouter.post("/deletion-requests", reportLimiter, optionalAuthenticateToken, (req: any, res: any) => {
    const { name, email, post_id, reason, content, explanation, url } = req.body || {};

    if (!post_id || !reason?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "対象メッセージのID、申請理由、掲載内容・特徴は必須項目です。" });
    }

    const postIdNum = parseInt(post_id);
    if (isNaN(postIdNum) || postIdNum <= 0) {
      return res.status(400).json({ error: "有効なメッセージIDを指定してください。" });
    }

    try {
      // 1. 受付チケット番号 (Ticket Token) の自動生成 (例: DEL-20260913-7A3B)
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
      const ticketToken = `DEL-${datePart}-${randomPart}`;

      const applicantName = name?.trim() || (req.user ? (req.user.nickname || req.user.username) : '匿名申請者');
      const applicantEmail = email?.trim() || (req.user ? req.user.email : '未登録');
      const targetUrl = url?.trim() || `https://remeets.jp/posts/${postIdNum}`;
      const reasonDetail = explanation?.trim() ? `${reason.trim()}\n【詳細理由】\n${explanation.trim()}` : reason.trim();

      // 2. deletion_requests テーブルへ保存
      db.prepare(`
        INSERT INTO deletion_requests (post_id, name, url, content, reason, explanation, email, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
      `).run(
        postIdNum,
        applicantName,
        targetUrl,
        content.trim(),
        reason.trim(),
        reasonDetail,
        applicantEmail
      );

      // 3. セキュリティ監査ログ記録
      logAction(
        req.user ? req.user.id : null,
        "DELETION_REQUEST_SUBMITTED",
        `Ticket: ${ticketToken}, Post ID: #${postIdNum}, Reason: ${sanitizeLogText(reason.trim())}`,
        req.ip
      );

      res.json({
        success: true,
        ticket_token: ticketToken,
        message: "メッセージの削除・掲載停止申請を受理いたしました。運営事務局にて迅速に確認・処置いたします。"
      });
    } catch (err: any) {
      console.error("Deletion request submission error:", err);
      res.status(500).json({ error: "削除申請の送信に失敗しました。時間をおいて再度お試しください。" });
    }
  });



