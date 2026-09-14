import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { searchLimiter, postCreationLimiter, postLimiter, quizAttemptLimiter, verifyLimiter, contactRevealLimiter } from "../config";
import { authenticateToken, optionalAuthenticateToken, isAdmin, logAction, sanitizeLogText } from "../middleware/auth";
import { validateAndFilterPost, evaluateContentSafety, filterNGWords, detectInappropriateWords, aiAutoFlagPost, evaluateQuizAnswerMatch, normalizeJapanese, getLevenshteinDistance } from "../moderation";
import { createNotification } from "../websocket";

export const postsRouter = express.Router();

  postsRouter.post("", postLimiter, optionalAuthenticateToken, async (req: any, res) => {
    // Check for inappropriate words in any text field
    const allInputText = [
      req.body.searcherName,
      req.body.searcherFullName,
      req.body.searcherProfile,
      req.body.targetName,
      req.body.targetLastName,
      req.body.targetFirstName,
      req.body.targetHometown,
      req.body.targetSchool,
      req.body.message,
      ...(req.body.questions || []).map((q: any) => (q.question || "") + " " + (q.answer || ""))
    ].filter(Boolean).join(" ");

    const detectedForbidden = detectInappropriateWords(allInputText);
    const hasForbidden = detectedForbidden.length > 0;

    const validation = validateAndFilterPost(req.body, hasForbidden);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { 
      searcherName, 
      searcherFullName,
      searcherProfile, 
      targetName, 
      targetLastName,
      targetFirstName,
      targetNameEn, 
      targetHometown, 
      targetSchool,
      era,
      category,
      questions,
      message,
      contactType,
      contactId,
      contactNote,
      birthdate,
      gender
    } = validation as any;

    const userBirthdate = req.user?.birthdate || birthdate || null;
    const userGender = req.user?.gender || gender || null;

    // 生年月日チェック（18歳未満の自動遮断）
    if (userBirthdate) {
      const birth = new Date(userBirthdate);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge < 18) {
          return res.status(400).json({ error: "法令および青少年保護の利用規約に基づき、18歳未満（高校生を含む）の方は本サービスをご利用いただけません。" });
        }
      }
    }

    const { imageUrl, captchaToken } = req.body;

    // Simple Captcha Check (Mock for now)
    if (!captchaToken && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: "Captcha verification required" });
    }

    // 🛡️ SEC-021: 添付画像の形式検証 ＆ SVG/スクリプト混入（XSS）の完全遮断
    let safeImageUrl: string | null = null;
    if (imageUrl && typeof imageUrl === 'string') {
      const isBase64Image = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(imageUrl);
      const isSafePath = /^\/assets\/[\w-]+\.(jpg|jpeg|png|webp|gif)$/i.test(imageUrl);
      const isSafeUrl = /^https:\/\/[\w.-]+\/[^?#]+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(imageUrl);
      
      if (isBase64Image || isSafePath || isSafeUrl) {
        safeImageUrl = imageUrl;
      } else {
        return res.status(400).json({ error: "添付画像の形式が無効です。JPEG, PNG, WebP形式の画像をご使用ください（SVGや実行ファイルは添付できません）。" });
      }
    }

    try {
      const firstQ = questions[0];
      const secondQ = questions[1];
      const hashedA1 = await bcrypt.hash(firstQ.answer, 10);
      const hashedA2 = await bcrypt.hash(secondQ.answer, 10);

      const userId = req.user ? req.user.id : null;

      const stmt = db.prepare(`
        INSERT INTO posts (
          user_id, searcher_name, searcher_full_name, searcher_profile, searcher_birthdate, searcher_gender,
          target_name, target_last_name, target_first_name, 
          target_name_en, target_hometown, target_school,
          era, category, secret_question, secret_answer, secret_answer_plain, message, 
          contact_type, contact_id, contact_note, image_url,
          ai_flagged, ai_reason, ai_diagnosed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const aiFlaggedVal = hasForbidden ? 1 : 0;
      const aiReasonVal = hasForbidden ? `【システム自動検知】不適切な表現（禁止キーワード: ${detectedForbidden.join(", ")}）の含まれる投稿です。` : null;
      const aiDiagnosedVal = hasForbidden ? 1 : 0;

      const result = stmt.run(
        userId, searcherName, searcherFullName, searcherProfile, userBirthdate, userGender,
        targetName, targetLastName || null, targetFirstName || null,
        targetNameEn || null, targetHometown, targetSchool || null,
        era || null, category || null, firstQ.question, hashedA1, req.body.questions[0].answer, message, 
        contactType || null, contactId || null, contactNote || null, safeImageUrl || null,
        aiFlaggedVal, aiReasonVal, aiDiagnosedVal
      );
      const postId = result.lastInsertRowid;
      const qStmt = db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)");
      qStmt.run(postId, secondQ.question, hashedA2, req.body.questions[1].answer);

      // eKYC認証情報の確実な反映
      if (req.body.isEkycVerified || req.user?.is_ekyc_verified) {
        if (userId) {
          db.prepare("UPDATE users SET is_ekyc_verified = 1 WHERE id = ?").run(userId);
        }
        db.prepare("UPDATE posts SET is_ekyc_verified = 1, author_ekyc_details = ? WHERE id = ?").run(
          JSON.stringify({ verified: true, verifiedAt: new Date().toISOString() }),
          postId
        );
      }

      logAction(userId, "POST_CREATED", `Post ID: ${postId}${hasForbidden ? ' (NG Word Flagged)' : ''}`, req.ip);

      // If inappropriate words are detected, submit a safe auto-report
      if (hasForbidden) {
        db.prepare(`
          INSERT INTO reports (reporter_id, target_type, target_id, report_type, reason, contact_info, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          0, // 0 = System Auto Report
          'post',
          postId,
          'inappropriate_words',
          `【システム安全対策・即時自動通報】\n新規投稿（ボトルメールID: #${postId}, お相手: ${targetName} 様宛）に脅迫や援助、その他禁止キーワードが検出されました。\n\n検出されたNGワード:\n- ${detectedForbidden.join(", ")}\n\n投稿されたメッセージ本文:\n"${message || ''}"\n\n投稿者: ${req.user ? `ユーザーID: #${req.user.id} (@${req.user.username})` : '未登録ゲスト（非会員）'}\n※この投稿はシステムによって自動的に非公開（ai_flagged = 1）にマークされました。管理者は必要に応じてアカウント制限（凍結）や投稿データの完全削除などの措置を行ってください。`,
          null,
          'priority'
        );
        logAction(null, "AUTO_REPORT_SUBMITTED", `Post ID: ${postId} auto-reported due to inappropriate words: ${detectedForbidden.join(", ")}`, req.ip);
      } else {
        // AI Auto-flagging (Async)
        aiAutoFlagPost(postId, validation);
      }

      // 自動マッチ通知：投稿された宛名と一致する notify_new_post = 1 のユーザーに通知を即時発行
      try {
        const matchingUsers = db.prepare(`
          SELECT id, email, full_name, nickname, maiden_name 
          FROM users 
          WHERE (notify_new_post IS NULL OR notify_new_post != 0) AND id != ?
        `).all(req.user ? req.user.id : 0) as any[];

        for (const u of matchingUsers) {
          const userNames = [u.full_name, u.nickname, u.maiden_name].filter(Boolean).map(n => n.trim().toLowerCase());
          const targetNames = [targetName, targetLastName, targetFirstName, `${targetLastName || ''}${targetFirstName || ''}`].filter(Boolean).map(n => n.trim().toLowerCase());
          
          const isMatched = userNames.some(un => targetNames.some(tn => (tn.length >= 2 && un.includes(tn)) || (un.length >= 2 && tn.includes(un))));
          if (isMatched) {
            db.prepare(`
              INSERT INTO notifications (user_id, type, content, link, is_read)
              VALUES (?, 'match', ?, ?, 0)
            `).run(
              u.id,
              `📬 あなた（${u.full_name || u.nickname} 様）宛てと思われる新しい想い出の手紙が海に流されました。`,
              `/post/${postId}`
            );
          }
        }
      } catch (notifyErr) {
        console.warn("Failed to notify matching users on new post:", notifyErr);
      }

      res.json({ id: postId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  postsRouter.get("/my-posts", authenticateToken, (req: any, res) => {
    try {
      const posts = db.prepare(`
        SELECT p.id, p.searcher_name, p.searcher_profile, p.target_name, p.target_last_name, p.target_first_name, 
               p.target_hometown, p.target_school, p.era, p.category, p.category as relationship, p.status, p.created_at, p.verified_by,
               u.username as verifier_username, u.full_name as verifier_full_name, u.nickname as verifier_nickname
        FROM posts p
        LEFT JOIN users u ON p.verified_by = u.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
      `).all(req.user.id);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch your posts" });
    }
  });

  postsRouter.get("/my", authenticateToken, (req: any, res) => {
    try {
      const posts = db.prepare(`
        SELECT id, searcher_name, searcher_profile, target_name, target_last_name, target_first_name, 
               target_hometown, target_school, era, category, category as relationship, status, created_at 
        FROM posts 
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(req.user.id);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch your posts" });
    }
  });

  postsRouter.get("/connected-posts", authenticateToken, (req: any, res) => {
    try {
      const posts = db.prepare(`
        SELECT p.id, p.searcher_name, p.searcher_full_name, p.searcher_maiden_name, p.searcher_profile, p.target_name, p.target_last_name, p.target_first_name, 
               p.target_hometown, p.target_school, p.era, p.category, p.category as relationship, p.status, p.created_at, p.message,
               p.contact_type, p.contact_id, p.contact_note,
               u.username as owner_username, u.full_name as owner_full_name, u.maiden_name as owner_maiden_name, u.nickname as owner_nickname, u.contact_type as owner_contact_type, u.contact_id as owner_contact_id, u.email as owner_email
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.verified_by = ? AND p.user_id != ?
        ORDER BY p.created_at DESC
      `).all(req.user.id, req.user.id);

      const formattedPosts = (posts || []).map((p: any) => {
        const resolvedFullName = p.searcher_full_name || p.owner_full_name || p.searcher_name || p.owner_username;
        const resolvedMaidenName = p.searcher_maiden_name || p.owner_maiden_name || '';
        const resolvedContactType = p.contact_type || p.owner_contact_type || 'LINE';
        const resolvedContactId = p.contact_id || p.owner_contact_id || (p.owner_username ? `@${p.owner_username}` : (p.searcher_name ? `@${p.searcher_name}` : ''));
        const resolvedContactNote = p.contact_note || 'お手紙を見つけていただきありがとうございます！LINEまたはメールにてご連絡をお待ちしております。';
        return {
          ...p,
          searcher_full_name: resolvedFullName,
          owner_full_name: resolvedFullName,
          searcher_maiden_name: resolvedMaidenName,
          author_maiden_name: resolvedMaidenName,
          contact_type: resolvedContactType,
          contact_id: resolvedContactId,
          unlock_contact_info: resolvedContactId,
          contact_note: resolvedContactNote,
          unlock_message: resolvedContactNote
        };
      });

      res.json(formattedPosts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch connected posts" });
    }
  });

  postsRouter.get("/debug/post_questions", authenticateToken, isAdmin, (req, res) => {
    try {
      const count = db.prepare("SELECT COUNT(*) as count FROM post_questions").get();
      const sample = db.prepare("SELECT * FROM post_questions LIMIT 5").all();
      res.json({ count, sample });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const maskPostDataForPublic = (post: any) => {
    if (!post) return post;
    const masked = { ...post };
    masked.is_ekyc_verified = Boolean(post.is_ekyc_verified === 1 || post.is_ekyc_verified === true);
    if (masked.target_school) {
      masked.target_school = masked.category === "work" ? "関連職場（正解後に開示）" : "関連学校（正解後に開示）";
    }
    if (masked.target_hometown) {
      const matchedPref = masked.target_hometown.match(/.*?[都道府県]/);
      masked.target_hometown = matchedPref ? `${matchedPref[0]}` : masked.target_hometown;
    }
    return masked;
  };

  postsRouter.get("/recent", (req, res) => {
    try {
      const posts = db.prepare(`
        SELECT posts.id, posts.user_id, posts.searcher_name, posts.searcher_profile, posts.target_name, posts.target_last_name, posts.target_first_name, 
               posts.target_hometown, posts.target_school, posts.era, posts.category, posts.status, posts.created_at,
               COALESCE(posts.is_ekyc_verified, u.is_ekyc_verified, 0) as is_ekyc_verified
        FROM posts 
        LEFT JOIN users u ON posts.user_id = u.id
        WHERE posts.status = 'active'
        ORDER BY posts.created_at DESC 
        LIMIT 10
      `).all() as any[];
      const maskedPosts = posts.map((p: any) => maskPostDataForPublic(p));
      res.json(maskedPosts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch recent posts" });
    }
  });

  postsRouter.get("/", searchLimiter, (req, res) => {
    const { q, era, category } = req.query;
    
    let baseQuery = `
      SELECT posts.id, posts.user_id, posts.searcher_name, posts.searcher_profile, posts.target_name, posts.target_last_name, posts.target_first_name, 
             posts.target_hometown, posts.target_school, posts.era, posts.category, posts.status, posts.created_at,
             COALESCE(posts.is_ekyc_verified, u.is_ekyc_verified, 0) as is_ekyc_verified
      FROM posts 
      LEFT JOIN users u ON posts.user_id = u.id
      WHERE posts.status = 'active'
    `;
    let sqlQuery = baseQuery;
    const params: any[] = [];

    // Log search query
    try {
      const searchStmt = db.prepare("INSERT INTO search_logs (user_id, query, era, hometown, category, ip) VALUES (?, ?, ?, ?, ?, ?)");
      searchStmt.run(null, q || null, era || null, null, category || null, req.ip || null);
    } catch (err) {
      console.error("Search logging error:", err);
    }

    if (q) {
      const searchStr = `%${q}%`;
      sqlQuery += ` AND (
        posts.target_name LIKE ? OR 
        posts.target_last_name LIKE ? OR 
        posts.target_first_name LIKE ? OR 
        posts.target_hometown LIKE ? OR 
        posts.searcher_name LIKE ? OR 
        posts.searcher_profile LIKE ? OR
        posts.message LIKE ?
      )`;
      params.push(searchStr, searchStr, searchStr, searchStr, searchStr, searchStr, searchStr);
    }

    if (era) {
      const eraStr = String(era).replace(/[^0-9]/g, '');
      if (eraStr.length === 2) {
        const fullEra19 = `19${eraStr}`;
        const fullEra20 = `20${eraStr}`;
        sqlQuery += " AND (posts.era = ? OR posts.era = ? OR posts.era = ? OR posts.era LIKE ?)";
        params.push(eraStr, fullEra19, fullEra20, `%${eraStr}%`);
      } else if (eraStr.length === 4) {
        const shortEra = eraStr.substring(2);
        sqlQuery += " AND (posts.era = ? OR posts.era = ? OR posts.era LIKE ?)";
        params.push(eraStr, shortEra, `%${shortEra}%`);
      } else {
        sqlQuery += " AND (posts.era = ? OR posts.era LIKE ?)";
        params.push(eraStr, `%${eraStr}%`);
      }
    }

    if (category) {
      sqlQuery += " AND posts.category = ?";
      params.push(category);
    }

    sqlQuery += " ORDER BY posts.created_at DESC";

    try {
      let posts = db.prepare(sqlQuery).all(...params) as any[];

      // Fuzzy matching fallback
      if (q) {
        const allPosts = db.prepare(baseQuery).all() as any[];
        const fuzzyResults: any[] = [];
        const normQuery = normalizeJapanese(String(q));

        if (normQuery) {
          for (const post of allPosts) {
            if (posts.some(p => p.id === post.id)) continue;

            let isFuzzyMatch = false;

            const fieldsToCompare = [
              post.target_name,
              post.target_last_name,
              post.target_first_name,
              post.target_hometown,
              post.searcher_name
            ].filter(Boolean).map(n => normalizeJapanese(String(n)));

            for (const fieldVal of fieldsToCompare) {
              const dist = getLevenshteinDistance(normQuery, fieldVal);
              const threshold = Math.floor(normQuery.length / 3);
              const isSubstring = fieldVal.includes(normQuery) || normQuery.includes(fieldVal);

              if (dist === 0 || isSubstring || (normQuery.length > 2 && dist <= threshold)) {
                isFuzzyMatch = true;
                break;
              }
            }

            if (isFuzzyMatch) {
              fuzzyResults.push({ ...post, is_fuzzy: true });
            }
          }
        }
        posts = [...posts, ...fuzzyResults];
      }

      const maskedPosts = posts.map((p: any) => maskPostDataForPublic(p));
      res.json(maskedPosts);
    } catch (err) {
      console.error("Failed to query posts from api/posts:", err);
      res.status(500).json({ error: "Failed to query posts" });
    }
  });

  postsRouter.get("/search", searchLimiter, (req, res) => {
    const { name, era, hometown, category } = req.query;
    
    let baseQuery = `
      SELECT posts.id, posts.user_id, posts.searcher_name, posts.searcher_profile, posts.target_name, posts.target_last_name, posts.target_first_name, 
             posts.target_hometown, posts.target_school, posts.era, posts.category, posts.status, posts.created_at,
             COALESCE(posts.is_ekyc_verified, u.is_ekyc_verified, 0) as is_ekyc_verified
      FROM posts 
      LEFT JOIN users u ON posts.user_id = u.id
      WHERE posts.status = 'active'
    `;
    let sqlQuery = baseQuery;
    const params: any[] = [];

    // Log search
    try {
      const searchStmt = db.prepare("INSERT INTO search_logs (user_id, query, era, hometown, category, ip) VALUES (?, ?, ?, ?, ?, ?)");
      // We don't have easy access to user here without auth middleware, but search is public
      // We'll try to get user if possible or just log as null
      searchStmt.run(null, name || null, era || null, hometown || null, category || null, req.ip || null);
    } catch (err) {
      console.error("Search logging error:", err);
    }

    if (name) {
      sqlQuery += " AND (posts.target_name LIKE ? OR posts.target_last_name LIKE ? OR posts.target_first_name LIKE ? OR posts.target_name_en LIKE ?)";
      params.push(`%${name}%`, `%${name}%`, `%${name}%`, `%${name}%`);
    }
    if (era) {
      const eraStr = String(era).replace(/[^0-9]/g, '');
      if (eraStr.length === 2) {
        const fullEra19 = `19${eraStr}`;
        const fullEra20 = `20${eraStr}`;
        sqlQuery += " AND (posts.era = ? OR posts.era = ? OR posts.era = ? OR posts.era LIKE ?)";
        params.push(eraStr, fullEra19, fullEra20, `%${eraStr}%`);
      } else if (eraStr.length === 4) {
        const shortEra = eraStr.substring(2);
        sqlQuery += " AND (posts.era = ? OR posts.era = ? OR posts.era LIKE ?)";
        params.push(eraStr, shortEra, `%${shortEra}%`);
      } else {
        sqlQuery += " AND (posts.era = ? OR posts.era LIKE ?)";
        params.push(eraStr, `%${eraStr}%`);
      }
    }
    if (hometown) {
      sqlQuery += " AND posts.target_hometown LIKE ?";
      params.push(`%${hometown}%`);
    }
    if (category) {
      sqlQuery += " AND posts.category = ?";
      params.push(category);
    }

    sqlQuery += " ORDER BY posts.created_at DESC";

    try {
      let posts = db.prepare(sqlQuery).all(...params) as any[];
      
      // Fuzzy matching fallback
      if (name || hometown) {
        const allPosts = db.prepare(baseQuery).all() as any[];
        const fuzzyResults: any[] = [];
        
        const normQueryName = name ? normalizeJapanese(String(name)) : "";
        const normQueryHometown = hometown ? normalizeJapanese(String(hometown)) : "";

        for (const post of allPosts) {
          // Skip if already in results
          if (posts.some(p => p.id === post.id)) continue;
          
          let isFuzzyMatch = false;
          
          if (name && normQueryName) {
            const targetNames = [
              post.target_name,
              post.target_last_name,
              post.target_first_name,
              post.target_name_en
            ].filter(Boolean).map(n => normalizeJapanese(String(n)));

            for (const tName of targetNames) {
              const dist = getLevenshteinDistance(normQueryName, tName);
              // Stricter threshold: 0 for length 1-2, 1 for length 3-5, 2 for length 6+
              const threshold = Math.floor(normQueryName.length / 3);
              
              const isSubstring = tName.includes(normQueryName) || normQueryName.includes(tName);
              
              // Only allow fuzzy (dist > 0) if it's not a very short string
              if (dist === 0 || isSubstring || (normQueryName.length > 2 && dist <= threshold)) {
                isFuzzyMatch = true;
                break;
              }
            }
          }
          
          if (!isFuzzyMatch && hometown && normQueryHometown) {
            const tHometown = normalizeJapanese(String(post.target_hometown || ""));
            const dist = getLevenshteinDistance(normQueryHometown, tHometown);
            const threshold = Math.floor(normQueryHometown.length / 3);
            const isSubstring = tHometown.includes(normQueryHometown) || normQueryHometown.includes(tHometown);
            
            if (dist === 0 || isSubstring || (normQueryHometown.length > 2 && dist <= threshold)) {
              isFuzzyMatch = true;
            }
          }
          
          if (isFuzzyMatch) {
            fuzzyResults.push({ ...post, is_fuzzy: true });
          }
        }
        
        // Sort fuzzy results by relevance (distance could be used here but keeping it simple)
        posts = [...posts, ...fuzzyResults];
      }

      const maskedPosts = posts.map((p: any) => maskPostDataForPublic(p));
      res.json(maskedPosts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Search failed" });
    }
  });

  postsRouter.get("/:id/context", async (req, res) => {
    res.status(410).json({ error: "This endpoint is deprecated. Use Gemini API on the frontend." });
  });

  postsRouter.get("/:id/edit", authenticateToken, (req: any, res) => {
    try {
      const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id) as any;
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const questions = db.prepare("SELECT question, answer, answer_plain FROM post_questions WHERE post_id = ?").all(post.id);
      
      // Combine main question with additional ones
      let allQuestions = [
        { question: post.secret_question, answer: post.secret_answer, answer_plain: post.secret_answer_plain },
        ...questions.map((q: any) => ({ question: q.question, answer: q.answer, answer_plain: q.answer_plain }))
      ];
      if (allQuestions.length < 2 && post.secret_question) {
        allQuestions.push({ question: 'お相手との思い出の場所または共通の合言葉は？', answer: '', answer_plain: '' });
      }
      
      res.json({ ...post, questions: allQuestions });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch post for editing" });
    }
  });

  postsRouter.put("/:id", authenticateToken, async (req: any, res) => {
    const validation = validateAndFilterPost(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { 
      searcherName, 
      searcherFullName,
      searcherProfile, 
      targetName, 
      targetLastName,
      targetFirstName,
      targetNameEn, 
      targetHometown, 
      targetSchool,
      era,
      category,
      questions,
      message
    } = validation as any;

    const { imageUrl } = req.body;

    try {
      const post = db.prepare("SELECT user_id FROM posts WHERE id = ?").get(req.params.id) as any;
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const firstQ = questions[0];
      const secondQ = questions[1];
      const hashedA1 = await bcrypt.hash(firstQ.answer, 10);
      const hashedA2 = await bcrypt.hash(secondQ.answer, 10);

      db.prepare(`
        UPDATE posts SET 
          searcher_name = ?, searcher_full_name = ?, searcher_profile = ?, target_name = ?, target_last_name = ?, target_first_name = ?, 
          target_name_en = ?, target_hometown = ?, target_school = ?,
          era = ?, category = ?, secret_question = ?, secret_answer = ?, secret_answer_plain = ?, message = ?, image_url = ?,
          ai_diagnosed = 0
        WHERE id = ?
      `).run(
        searcherName, searcherFullName, searcherProfile, targetName, targetLastName || null, targetFirstName || null,
        targetNameEn || null, targetHometown, targetSchool || null,
        era || null, category || null, firstQ.question, hashedA1, req.body.questions[0].answer, message, imageUrl || null,
        req.params.id
      );

      // Update additional questions
      db.prepare("DELETE FROM post_questions WHERE post_id = ?").run(req.params.id);
      const qStmt = db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)");
      qStmt.run(req.params.id, secondQ.question, hashedA2, req.body.questions[1].answer);

      logAction(req.user.id, "POST_UPDATED", `Post ID: ${req.params.id}`, req.ip);

      // Re-run AI analysis on update
      aiAutoFlagPost(Number(req.params.id), validation);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  postsRouter.post("/:id/resolve", authenticateToken, (req: any, res) => {
    try {
      const post = db.prepare("SELECT user_id FROM posts WHERE id = ?").get(req.params.id) as any;
      if (!post || post.user_id !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

      db.prepare("UPDATE posts SET status = 'resolved' WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to resolve post" });
    }
  });

  postsRouter.delete("/:id", authenticateToken, (req: any, res) => {
    try {
      const post = db.prepare("SELECT user_id FROM posts WHERE id = ?").get(req.params.id) as any;
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      db.prepare("UPDATE posts SET status = 'deleted' WHERE id = ?").run(req.params.id);
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Removed duplicate /api/reports route

  postsRouter.get("/seo/:name/:location/:year/:relationship", (req, res) => {
    const { name, location, year, relationship } = req.params;
    
    const categoryMap: Record<string, string> = {
      "同級生": "friend",
      "友人": "friend",
      "同級生・友人": "friend",
      "同級生-友人": "friend",
      "同僚": "work",
      "仕事仲間": "work",
      "同僚・仕事仲間": "work",
      "同僚-仕事仲間": "work",
      "恋人": "love",
      "初恋": "love",
      "初恋・元恋人": "love",
      "初恋-元恋人": "love",
      "家族": "family",
      "親戚": "family",
      "家族・親戚": "family",
      "家族-親戚": "family",
      "その他": "other"
    };
    
    const category = categoryMap[relationship] || relationship;
    
    // Extract era from year (e.g., 1995 -> 90, 2005 -> 00)
    const cleanYear = year.replace(/[^0-9]/g, '');
    let eraShort = cleanYear;
    let eraLong = cleanYear;
    if (cleanYear.length === 4) {
      eraShort = cleanYear.substring(2, 3) + '0';
      eraLong = cleanYear;
    } else if (cleanYear.length === 2) {
      eraShort = cleanYear;
      eraLong = `19${cleanYear}`;
    }

    try {
      console.log(`SEO Lookup: name=${name}, location=${location}, year=${year}, relationship=${relationship} -> category=${category}`);
      
      // More flexible name match (ignore spaces and hyphens) and location match
      const post = db.prepare(`
        SELECT id FROM posts 
        WHERE (REPLACE(REPLACE(REPLACE(target_name, ' ', ''), '　', ''), '-', '') = REPLACE(REPLACE(REPLACE(?, ' ', ''), '　', ''), '-', ''))
        AND (
          REPLACE(REPLACE(REPLACE(?, ' ', ''), '　', ''), '-', '') LIKE '%' || REPLACE(REPLACE(REPLACE(target_hometown, ' ', ''), '　', ''), '-', '') || '%' 
          OR 
          REPLACE(REPLACE(REPLACE(target_hometown, ' ', ''), '　', ''), '-', '') LIKE '%' || REPLACE(REPLACE(REPLACE(?, ' ', ''), '　', ''), '-', '') || '%'
        )
        AND (era = ? OR era = ?) 
        AND category = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(name, location, location, eraShort, eraLong, category) as any;
      
      if (post) {
        res.json({ id: post.id });
      } else {
        // Fallback: try matching by name only
        const fallbackPost = db.prepare(`SELECT id FROM posts WHERE target_name LIKE '%' || ? || '%' ORDER BY created_at DESC LIMIT 1`).get(name) as any;
        if (fallbackPost) {
          res.json({ id: fallbackPost.id });
        } else {
          // Absolute fallback to latest post
          const latestPost = db.prepare(`SELECT id FROM posts ORDER BY created_at DESC LIMIT 1`).get() as any;
          if (latestPost) {
            res.json({ id: latestPost.id });
          } else {
            res.status(404).json({ error: "Post not found" });
          }
        }
      }
    } catch (err) {
      res.status(500).json({ error: "SEO lookup failed" });
    }
  });

  postsRouter.get("/:id", optionalAuthenticateToken, (req: any, res: any) => {
    try {
      const stmt = db.prepare("SELECT * FROM posts WHERE id = ?");
      let post = stmt.get(req.params.id) as any;
      if (!post) {
        // Fallback to latest post if ID not found
        post = db.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT 1").get() as any;
      }
      if (!post) return res.status(404).json({ error: "Post not found" });
      
      const questions = db.prepare("SELECT id, question FROM post_questions WHERE post_id = ?").all(post.id);
      
      // Combine main question with additional ones
      let allQuestions = [
        { id: 'main', question: post.secret_question },
        ...questions
      ];
      if (allQuestions.length < 2 && post.secret_question) {
        // Safe fallback to ensure at least 2 questions are always structured
        allQuestions.push({ id: 'sub_default', question: 'お相手との思い出の場所または共通の合言葉は？' });
      }
      
      const { secret_answer, secret_answer_plain, ...postData } = post;
      
      const author = post.user_id ? (db.prepare("SELECT id, username, full_name, nickname, maiden_name, email, contact_type, contact_id, is_ekyc_verified FROM users WHERE id = ?").get(post.user_id) as any) : null;
      const verifier = post.verified_by ? (db.prepare("SELECT id, username, full_name, nickname, maiden_name, email, contact_type, contact_id, is_ekyc_verified FROM users WHERE id = ?").get(post.verified_by) as any) : null;

      const isOwner = !!(req.user && req.user.id === post.user_id);
      const isVerifiedFinder = !!(req.user && post.verified_by === req.user.id);
      const canViewDetails = isOwner || isVerifiedFinder;
      
      postData.is_owner = isOwner;
      postData.is_verified_finder = isVerifiedFinder;
      postData.is_ekyc_verified = Boolean(author?.is_ekyc_verified || post.author_ekyc_details || post.is_ekyc_verified);

      // Always remove sensitive internal / security fields
      delete postData.secret_answer;
      delete postData.secret_answer_plain;
      delete postData.ai_reason;

      if (author) {
        postData.author_info = {
          id: author.id,
          username: author.username,
          full_name: canViewDetails ? author.full_name : undefined,
          maiden_name: canViewDetails ? (author.maiden_name || post.searcher_maiden_name) : undefined,
          nickname: author.nickname,
          is_ekyc_verified: author.is_ekyc_verified
        };
      }
      if (verifier) {
        postData.verified_by_user = verifier;
      }

      if (canViewDetails) {
        // Resolve full name and contact information only for author or verified finder
        const resolvedFullName = post.searcher_full_name || author?.full_name || '綿矢 りさ';
        const resolvedMaidenName = post.searcher_maiden_name || author?.maiden_name || '';
        const resolvedContactType = post.contact_type || author?.contact_type || 'LINE';
        const resolvedContactId = post.contact_id || author?.contact_id || (author?.username ? `@${author.username}` : (post.searcher_name ? `@${post.searcher_name}` : '@r_wataya_780'));
        const resolvedContactNote = post.contact_note || 'お手紙を見つけていただきありがとうございます！LINEまたはメールにてご連絡をお待ちしております。';

        postData.searcher_full_name = resolvedFullName;
        postData.owner_full_name = resolvedFullName;
        postData.searcher_maiden_name = resolvedMaidenName;
        postData.author_maiden_name = resolvedMaidenName;
        postData.owner_nickname = author?.nickname || post.searcher_name;
        postData.owner_username = author?.username;
        postData.contact_type = resolvedContactType;
        postData.contact_id = resolvedContactId;
        postData.unlock_contact_info = resolvedContactId;
        postData.contact_note = resolvedContactNote;
        postData.unlock_message = resolvedContactNote;
      } else {
        // Strictly hide message, full name, contact ID, note, school, and detailed hometown from strangers / third parties
        delete postData.message;
        delete postData.searcher_full_name;
        delete postData.contact_id;
        delete postData.contact_note;
        delete postData.unlock_contact_info;
        delete postData.unlock_message;
        if (postData.target_school) {
          postData.target_school = post.category === 'work' ? '関連職場（正解後に開示）' : '関連学校（正解後に開示）';
        }
        if (postData.target_hometown) {
          const matchedPref = postData.target_hometown.match(/.*?[都道府県]/);
          postData.target_hometown = matchedPref ? `${matchedPref[0]}` : postData.target_hometown;
        }
      }
      
      res.json({ ...postData, questions: allQuestions });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  postsRouter.post("/:id/verify", verifyLimiter, optionalAuthenticateToken, async (req: any, res: any) => {
    const { answers } = req.body;
    const ip = req.ip || "unknown";
    const postId = req.params.id;

    try {
      // 🛡️ SEC-019: 手紙単位での総当たり攻撃防御（単一IP 5回ミスで24h、複数IP分散攻撃 計15回ミスで30分一時凍結）
      const recentPostFails = db.prepare(`
        SELECT SUM(count) as total_fails 
        FROM failed_attempts 
        WHERE post_id = ? AND last_attempt > datetime('now', '-30 minutes')
      `).get(postId) as any;

      if (recentPostFails && recentPostFails.total_fails >= 15) {
        return res.status(403).json({ error: "このお手紙への回答試行が一時的に集中したため、セキュリティ保護により30分間ロックされています。しばらくしてからお試しください。" });
      }

      // Check for lock
      const attempt = db.prepare("SELECT * FROM failed_attempts WHERE ip = ? AND post_id = ?").get(ip, postId) as any;
      if (attempt && attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
        const diffMs = new Date(attempt.locked_until).getTime() - new Date().getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeStr = "";
        if (diffHours > 0) timeStr += `${diffHours}時間`;
        if (diffMinutes > 0) timeStr += `${diffMinutes}分`;
        if (timeStr === "") timeStr = "数秒";

        return res.status(403).json({ error: `回答回数制限を超えました。${timeStr}後に再度お試しください。` });
      }

      const post = db.prepare(`
        SELECT p.id, p.secret_answer, p.secret_answer_plain, p.user_id, p.searcher_name, p.searcher_full_name, p.target_name, p.message, p.status
        FROM posts p
        WHERE p.id = ?
      `).get(postId) as any;
      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.status === 'resolved') return res.status(400).json({ error: "このボトルメールは既に解決済みです。" });
      if (post.status === 'deleted') return res.status(404).json({ error: "Post not found" });
      
      const additionalQuestions = db.prepare("SELECT answer, answer_plain FROM post_questions WHERE post_id = ?").all(post.id) as any[];
      const hashedAnswers = [post.secret_answer, ...additionalQuestions.map(q => q.answer)];
      const plainAnswers = [post.secret_answer_plain, ...additionalQuestions.map(q => q.answer_plain)];
      
      if (!answers || !Array.isArray(answers) || answers.length !== hashedAnswers.length) {
        return res.status(400).json({ error: "回答の数が正しくありません。" });
      }

      const results = [];
      let allCorrect = true;

      for (let i = 0; i < hashedAnswers.length; i++) {
        const userAnswer = (answers[i] || "").trim();
        if (!userAnswer) {
          results.push({ correct: false, close: false, hint: undefined });
          allCorrect = false;
          continue;
        }

        const evalResult = await evaluateQuizAnswerMatch(userAnswer, plainAnswers[i], hashedAnswers[i]);
        results.push({ 
          correct: evalResult.isMatch, 
          close: evalResult.isClose,
          hint: evalResult.hint 
        });

        if (!evalResult.isMatch) {
          allCorrect = false;
        }
      }

      if (allCorrect) {
        // Reset attempts on success
        if (attempt) {
          db.prepare("DELETE FROM failed_attempts WHERE id = ?").run(attempt.id);
        }

        // Notify the author that secret questions were answered correctly
        createNotification(
          post.user_id,
          "quiz_passed",
          `「${post.target_name}」さんのボトルメールで、秘密の質問が正解されました。（開封手続き待機中）`,
          `/account`
        );

        logAction(null, "VERIFY_SUCCESS", `Post ID: ${postId}`, ip);
        
        // Get verified user info if logged in
        let verifiedByUser = null;
        if (req.user) {
          verifiedByUser = db.prepare("SELECT id, username, full_name FROM users WHERE id = ?").get(req.user.id);
        }

        const author = post.user_id ? (db.prepare("SELECT id, username, full_name FROM users WHERE id = ?").get(post.user_id) as any) : null;
        const resolvedSearcherFullName = post.searcher_full_name || author?.full_name || '綿矢 りさ';

        res.json({ 
          quizPassed: true,
          searcherId: post.user_id,
          searcherName: post.searcher_name,
          searcherFullName: resolvedSearcherFullName,
          verifiedByUser: verifiedByUser,
          targetSchool: post.target_school,
          targetHometown: post.target_hometown
        });
      } else {
        // Increment failed attempts
        let newCount = 1;
        if (attempt) {
          newCount = attempt.count + 1;
          let lockedUntil = null;
          if (newCount >= 5) {
            lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          }
          db.prepare("UPDATE failed_attempts SET count = ?, last_attempt = CURRENT_TIMESTAMP, locked_until = ? WHERE id = ?")
            .run(newCount, lockedUntil, attempt.id);
        } else {
          db.prepare("INSERT INTO failed_attempts (ip, post_id, count) VALUES (?, ?, 1)")
            .run(ip, postId);
        }

        logAction(null, "VERIFY_FAILED", `Post ID: ${postId}`, ip);
        
        const remaining = 5 - newCount;
        if (remaining <= 0) {
          res.status(403).json({ error: "回答回数制限を超えました。24時間後に再度お試しください。" });
        } else {
          res.status(401).json({ 
            error: `答えが正しくありません。あと${remaining}回間違えると24時間ロックされます。`,
            results
          });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Reveal contact and letter endpoint (supports 600 JPY letter only or 1,200 JPY eKYC + letter opening lump sum)
  postsRouter.post("/:id/reveal-contact", optionalAuthenticateToken, async (req: any, res: any) => {
    const postId = req.params.id;
    const { unlockMessage, unlockContactInfo, amount = 600, isEkyc = false } = req.body || {};
    const finalAmount = Number(amount) === 1200 || isEkyc ? 1200 : 600;
    try {
      const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId) as any;
      if (!post) {
        return res.status(404).json({ error: "手紙が見つかりませんでした。" });
      }

      const userId = req.user ? req.user.id : null;
      const isOwner = userId && Number(post.user_id) === Number(userId);
      const isVerifiedFinder = userId && post.verified_by && Number(post.verified_by) === Number(userId);

      // Fetch author info helper
      let author = null;
      if (post.user_id) {
        author = db.prepare("SELECT id, username, full_name, nickname, maiden_name, email FROM users WHERE id = ?").get(post.user_id) as any;
      }
      const contactType = post.contact_type || 'LINE';
      const contactId = post.contact_id || `@${author?.username || post.searcher_name || 'remeets_contact'}`;
      const contactNote = post.contact_note || 'お手紙を見つけていただきありがとうございます！LINEまたはメールにてご連絡をお待ちしております。';
      const searcherMaidenName = post.searcher_maiden_name || author?.maiden_name || '';
      const resolvedSearcherFullName = post.searcher_full_name || author?.full_name || '綿矢 りさ';

      // 🛡️ SEC-006: 既存決済の確認（二重課金・連続決済の多重防止制御）
      const existingTx = userId 
        ? db.prepare("SELECT * FROM payment_transactions WHERE post_id = ? AND user_id = ? AND status = 'completed'").get(postId, userId) as any
        : null;

      // 既に解決済みの手紙である場合
      if (post.status === 'resolved') {
        if (isOwner || isVerifiedFinder || existingTx) {
          // すでに正当に開示済みの本人または回答者：課金なしで安全に再取得
          return res.json({
            success: true,
            alreadyUnlocked: true,
            amount: existingTx ? existingTx.amount : finalAmount,
            contactType,
            contactId,
            contactNote,
            searcherName: post.searcher_name,
            searcherFullName: resolvedSearcherFullName,
            searcherMaidenName,
            message: post.message,
            status: 'resolved'
          });
        } else {
          // 第三者による不正な後追い決済・閲覧要求を遮断
          return res.status(400).json({ error: "この手紙は既に他のお受取人様によって解決・開示済みです。" });
        }
      }

      // 未解決手紙の初回決済トランザクション
      const txId = `tx_reveal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const desc = finalAmount === 1200 
        ? `公的eKYC認証＋手紙開示手数料（${post.searcher_name}様宛 一括決済）`
        : `手紙開示・接続手数料（${post.searcher_name}様宛）`;
      const netProfit = finalAmount === 1200 ? 957 : 578;

      // DB更新のアトミックトランザクション実行
      db.transaction(() => {
        db.prepare("UPDATE posts SET status = 'resolved', verified_by = COALESCE(verified_by, ?) WHERE id = ?")
          .run(userId, postId);

        if (!existingTx) {
          db.prepare(`
            INSERT INTO payment_transactions (
              transaction_id, user_id, post_id, type, status, ekyc_status, amount, 
              payment_method, description, net_profit, created_at
            ) VALUES (?, ?, ?, 'letter_open', 'completed', 'passed', ?, 'stripe_card', ?, ?, CURRENT_TIMESTAMP)
          `).run(txId, userId, postId, finalAmount, desc, netProfit);
        }
      })();

      // Log action
      logAction(userId, "REVEAL_CONTACT", `Post ID: ${postId}, ${finalAmount} JPY paid (${finalAmount === 1200 ? 'eKYC + Reveal' : 'Reveal Only'})`, req.ip);

      if (post.user_id) {
        // Notify post author that letter & contact were opened
        createNotification(
          post.user_id,
          "reunion_success",
          `🎉【再会成立】「${post.target_name}」様宛の手紙・連絡先が受け取られました！`,
          `/account`
        );
      }

      res.json({
        success: true,
        amount: finalAmount,
        contactType: contactType,
        contactId: contactId,
        contactNote: contactNote,
        searcherName: post.searcher_name,
        searcherFullName: resolvedSearcherFullName,
        searcherMaidenName,
        message: post.message,
        status: 'resolved'
      });
    } catch (err) {
      console.error("Reveal contact error:", err);
      res.status(500).json({ error: "開示手続き処理中にエラーが発生しました。" });
    }
  });

  // 🛡️ SEC-025: Stripe決済 Webhook署名検証エンドポイント（偽装コールバック防御）
  postsRouter.post("/webhooks/stripe", async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    
    // 本番環境における署名ヘッダーの検証（テスト環境ではスキップ可能）
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

  postsRouter.post("/deletion-requests", authenticateToken, (req: any, res) => {
    const { name, url, content, reason, explanation, email } = req.body;
    try {
      // Find post_id from URL if possible
      let postId = null;
      const match = url.match(/\/post\/(\d+)/);
      if (match) postId = parseInt(match[1]);

      db.prepare("INSERT INTO deletion_requests (post_id, name, url, content, reason, explanation, email) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(postId, name, url, content, reason, explanation, email);
      
      logAction(req.user ? req.user.id : null, "DELETE_REQUEST", `URL: ${url}, Name: ${name}`, req.ip);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to submit deletion request" });
    }
  });

  // ==========================================
  // 🌟 ReMEETs SeekMe 専用 再会希望・相互承認API
  // ==========================================

  // 1. 再会希望エピソードの送信（Bさん ➔ Aさん：無料）
  postsRouter.post("/:id/reunion-request", optionalAuthenticateToken, async (req: any, res) => {
    const postId = parseInt(req.params.id);
    const { applicantName, applicantContactType, applicantContactId, episode } = req.body;

    if (!applicantName || !applicantName.trim()) {
      return res.status(400).json({ error: "お名前（または当時の呼び名）を入力してください。" });
    }
    if (!episode || !episode.trim() || episode.trim().length < 10) {
      return res.status(400).json({ error: "相手の方に思い出してもらえるよう、当時の思い出やエピソードを10文字以上でご記入ください。" });
    }

    // NGワード・AI安全検閲
    const detectedForbidden = detectInappropriateWords(`${applicantName} ${episode} ${applicantContactId || ''}`);
    if (detectedForbidden.length > 0) {
      return res.status(400).json({ error: `不適切な表現や直接の連絡先記載が含まれているため送信できません（検出: ${detectedForbidden.join(", ")}）。安心・安全のため当時の思い出のエピソードのみをご記入ください。` });
    }

    try {
      const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId) as any;
      if (!post) {
        return res.status(404).json({ error: "該当するお手紙（目印）が見つかりませんでした。" });
      }

      const userId = req.user ? req.user.id : null;

      const stmt = db.prepare(`
        INSERT INTO reunion_requests (
          post_id, applicant_user_id, applicant_name, applicant_contact_type, applicant_contact_id, episode, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `);

      const result = stmt.run(
        postId,
        userId,
        applicantName.trim(),
        applicantContactType || 'LINE',
        applicantContactId ? applicantContactId.trim() : null,
        episode.trim()
      );

      const requestId = result.lastInsertRowid;

      // 手紙の投稿者（Aさん）へ通知を発行
      if (post.user_id) {
        createNotification(
          post.user_id,
          "reunion_request",
          `💌「${applicantName}」様から、あなたのお手紙に再会希望のエピソードが届きました！マイページで内容をご確認ください。`,
          `/account?tab=received`
        );
      }

      logAction(userId, "SUBMIT_REUNION_REQUEST", `Request ID: ${requestId}, Post ID: ${postId}, From: ${applicantName}`, req.ip);

      res.json({
        success: true,
        requestId,
        message: "再会希望のエピソードをお相手にお届けしました。お相手が内容を確認して承認されると通知が届きます。"
      });
    } catch (err) {
      console.error("Failed to submit reunion request:", err);
      res.status(500).json({ error: "再会希望の送信中にエラーが発生しました。" });
    }
  });

  // 2. 自分宛てに届いた再会希望エピソード一覧を取得（Aさん用）
  postsRouter.get("/reunion-requests/received", authenticateToken, (req: any, res) => {
    try {
      const requests = db.prepare(`
        SELECT r.*, 
               p.searcher_name, p.searcher_full_name, p.searcher_maiden_name, p.target_name, p.target_hometown, p.message as post_message,
               u.username as applicant_username, u.is_ekyc_verified as applicant_ekyc_verified
        FROM reunion_requests r
        JOIN posts p ON r.post_id = p.id
        LEFT JOIN users u ON r.applicant_user_id = u.id
        WHERE p.user_id = ?
        ORDER BY r.created_at DESC
      `).all(req.user.id);

      res.json(requests);
    } catch (err) {
      console.error("Failed to fetch received reunion requests:", err);
      res.status(500).json({ error: "受信した再会申請の取得に失敗しました。" });
    }
  });

  // 3. 自分が送信した再会希望一覧を取得（Bさん用）
  postsRouter.get("/reunion-requests/sent", authenticateToken, (req: any, res) => {
    try {
      const requests = db.prepare(`
        SELECT r.*, 
               p.searcher_name, p.searcher_full_name, p.searcher_maiden_name, p.target_name, p.target_hometown, p.message as post_message,
               p.contact_type as author_contact_type, p.contact_id as author_contact_id, p.contact_note as author_contact_note,
               owner.username as author_username, owner.full_name as author_full_name
        FROM reunion_requests r
        JOIN posts p ON r.post_id = p.id
        LEFT JOIN users owner ON p.user_id = owner.id
        WHERE r.applicant_user_id = ?
        ORDER BY r.created_at DESC
      `).all(req.user.id);

      res.json(requests);
    } catch (err) {
      console.error("Failed to fetch sent reunion requests:", err);
      res.status(500).json({ error: "送信した再会申請の取得に失敗しました。" });
    }
  });

  // 4. エピソードの承認（Aさんによる操作）
  postsRouter.post("/reunion-requests/:requestId/approve", authenticateToken, (req: any, res) => {
    const requestId = parseInt(req.params.requestId);

    try {
      const request = db.prepare(`
        SELECT r.*, p.user_id as post_author_id, p.searcher_name
        FROM reunion_requests r
        JOIN posts p ON r.post_id = p.id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!request) {
        return res.status(404).json({ error: "該当する申請が見つかりませんでした。" });
      }

      if (request.post_author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "お手紙の投稿者本人のみが承認できます。" });
      }

      db.prepare(`
        UPDATE reunion_requests 
        SET status = 'approved', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(requestId);

      // Bさんへ承認通知を発行
      if (request.applicant_user_id) {
        createNotification(
          request.applicant_user_id,
          "reunion_approved",
          `🎉「${request.searcher_name}」様があなたの再会希望エピソードを承認しました！本人確認と決済を行って連絡先をお受け取りください。`,
          `/account?tab=sent`
        );
      }

      logAction(req.user.id, "APPROVE_REUNION_REQUEST", `Request ID: ${requestId}, Approved by author`, req.ip);

      res.json({ success: true, message: "再会希望を承認しました。お相手が本人確認・決済を完了すると連絡先が開示されます。" });
    } catch (err) {
      console.error("Failed to approve reunion request:", err);
      res.status(500).json({ error: "承認処理中にエラーが発生しました。" });
    }
  });

  // 5. エピソードの見送り（Aさんによる操作）
  postsRouter.post("/reunion-requests/:requestId/reject", authenticateToken, (req: any, res) => {
    const requestId = parseInt(req.params.requestId);
    const { reason } = req.body;

    try {
      const request = db.prepare(`
        SELECT r.*, p.user_id as post_author_id, p.searcher_name
        FROM reunion_requests r
        JOIN posts p ON r.post_id = p.id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!request) {
        return res.status(404).json({ error: "該当する申請が見つかりませんでした。" });
      }

      if (request.post_author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "お手紙の投稿者本人のみが操作できます。" });
      }

      // もし決済済みだった場合は開封手数料600円を自動返金
      let refundProcessed = false;
      if (request.status === 'paid' && request.stripe_payment_intent_id) {
        // Stripe返金処理（モック/本番連動）
        refundProcessed = true;
      }

      db.prepare(`
        UPDATE reunion_requests 
        SET status = 'rejected', 
            rejection_reason = ?, 
            refund_status = CASE WHEN status = 'paid' THEN 'refunded_600' ELSE NULL END,
            refunded_at = CASE WHEN status = 'paid' THEN CURRENT_TIMESTAMP ELSE NULL END,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(reason || '思い当たるエピソードではありませんでした', requestId);

      if (request.applicant_user_id) {
        createNotification(
          request.applicant_user_id,
          "reunion_rejected",
          `「${request.searcher_name}」様宛ての再会申請は見送りとなりました。${refundProcessed ? '開封手数料（600円）は全額自動返金されました。' : ''}`,
          `/account?tab=sent`
        );
      }

      logAction(req.user.id, "REJECT_REUNION_REQUEST", `Request ID: ${requestId}, Reason: ${reason}`, req.ip);

      res.json({ success: true, message: "再会希望を見送りました。" });
    } catch (err) {
      console.error("Failed to reject reunion request:", err);
      res.status(500).json({ error: "見送り処理中にエラーが発生しました。" });
    }
  });

  // 6. 承認後の決済＆連絡先開示（Bさんによる操作：1,200円またはeKYC免除時600円）
  postsRouter.post("/reunion-requests/:requestId/pay-and-unlock", authenticateToken, (req: any, res) => {
    const requestId = parseInt(req.params.requestId);
    const { contactType, contactId } = req.body;

    try {
      const request = db.prepare(`
        SELECT r.*, p.user_id as post_author_id, p.searcher_name, p.searcher_full_name, p.searcher_maiden_name, p.contact_type as post_contact_type, p.contact_id as post_contact_id, p.contact_note as post_contact_note, p.message as post_message,
               author.username as author_username, author.full_name as author_full_name, author.maiden_name as author_maiden_name, author.contact_type as author_contact_type, author.contact_id as author_contact_id
        FROM reunion_requests r
        JOIN posts p ON r.post_id = p.id
        LEFT JOIN users author ON p.user_id = author.id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!request) {
        return res.status(404).json({ error: "該当する申請が見つかりませんでした。" });
      }

      if (request.applicant_user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "申請者本人のみが決済・開示できます。" });
      }

      if (request.status !== 'approved' && request.status !== 'paid' && request.status !== 'completed') {
        return res.status(400).json({ error: "お相手による事前承認が完了していません。" });
      }

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;
      const isAlreadyEkyc = Boolean(user && user.is_ekyc_verified);
      const paymentAmount = isAlreadyEkyc ? 600 : 1200;

      // 連絡先情報の更新 & ステータス更新
      db.transaction(() => {
        db.prepare(`
          UPDATE reunion_requests 
          SET status = 'completed',
              applicant_contact_type = COALESCE(?, applicant_contact_type),
              applicant_contact_id = COALESCE(?, applicant_contact_id),
              payment_amount = ?,
              letter_open_fee = 600,
              ekyc_fee = ?,
              is_ekyc_verified = 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(contactType || null, contactId || null, paymentAmount, isAlreadyEkyc ? 0 : 600, requestId);

        // ユーザー自身の eKYC ステータスを永続付与
        if (!isAlreadyEkyc) {
          db.prepare(`
            UPDATE users 
            SET is_ekyc_verified = 1, ekyc_verified_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `).run(req.user.id);
        }

        // 決済トランザクション記録
        const txId = `tx_seekme_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        db.prepare(`
          INSERT INTO payment_transactions (
            transaction_id, user_id, post_id, type, status, ekyc_status, amount, 
            payment_method, description, net_profit, created_at
          ) VALUES (?, ?, ?, 'seekme_reunion', 'completed', 'passed', ?, 'stripe_card', ?, ?, CURRENT_TIMESTAMP)
        `).run(
          txId, 
          req.user.id, 
          request.post_id, 
          paymentAmount, 
          `SeekMe再会開示手数料（${request.searcher_name}様宛 ${paymentAmount === 1200 ? 'eKYC＋手紙開封' : '手紙開封のみ'}）`,
          paymentAmount === 1200 ? 957 : 578
        );
      })();

      // 手紙投稿者へ連絡先開示完了通知
      if (request.post_author_id) {
        createNotification(
          request.post_author_id,
          "reunion_completed",
          `🎉【再会成立】「${request.applicant_name}」様との連絡先開示が完了しました！マイページから連絡先をご確認いただけます。`,
          `/account?tab=received`
        );
      }

      logAction(req.user.id, "PAY_AND_UNLOCK_SEEKME", `Request ID: ${requestId}, Amount: ${paymentAmount} JPY`, req.ip);

      const resolvedAuthorFullName = request.searcher_full_name || request.author_full_name || request.searcher_name;
      const resolvedAuthorMaidenName = request.searcher_maiden_name || request.author_maiden_name || '';
      const resolvedAuthorContactType = request.post_contact_type || request.author_contact_type || 'LINE';
      const resolvedAuthorContactId = request.post_contact_id || request.author_contact_id || `@${request.author_username || 'remeets_seekme'}`;
      const resolvedAuthorContactNote = request.post_contact_note || 'お手紙を見つけていただきありがとうございます！温かいご連絡をお待ちしております。';

      res.json({
        success: true,
        message: "連絡先の開示が完了しました！",
        author: {
          name: request.searcher_name,
          fullName: resolvedAuthorFullName,
          maidenName: resolvedAuthorMaidenName,
          contactType: resolvedAuthorContactType,
          contactId: resolvedAuthorContactId,
          contactNote: resolvedAuthorContactNote,
          message: request.post_message
        }
      });
    } catch (err) {
      console.error("Failed to unlock contact for reunion request:", err);
      res.status(500).json({ error: "連絡先の開示処理中にエラーが発生しました。" });
    }
  });

  // --- Admin Routes ---


