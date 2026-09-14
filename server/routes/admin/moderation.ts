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

export const moderationRouter = express.Router();


  moderationRouter.get("/reports", authenticateToken, isAdmin, (req, res) => {
    try {
      const reports = db.prepare(`
        SELECT r.*, COALESCE(u.username, 'システム自動検知') as reporter_name,
          CASE 
            WHEN r.target_type = 'post' THEN (SELECT u2.username FROM posts p JOIN users u2 ON p.user_id = u2.id WHERE p.id = r.target_id)
            WHEN r.target_type = 'user' THEN (SELECT u3.username FROM users u3 WHERE u3.id = r.target_id)
            ELSE 'Unknown'
          END as target_username,
          CASE 
            WHEN r.target_type = 'post' THEN (SELECT u2.id FROM posts p JOIN users u2 ON p.user_id = u2.id WHERE p.id = r.target_id)
            WHEN r.target_type = 'user' THEN r.target_id
            ELSE NULL
          END as target_user_id
        FROM reports r 
        LEFT JOIN users u ON r.reporter_id = u.id 
        ORDER BY r.created_at DESC
      `).all();
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });



  moderationRouter.post("/reports/:id/resolve", authenticateToken, isAdmin, (req, res) => {
    try {
      db.prepare("UPDATE reports SET status = 'resolved' WHERE id = ?").run(req.params.id);
      logAction((req as any).user.id, "REPORT_RESOLVE", `Resolved report #${req.params.id}`, req.ip);
      res.json({ success: true, message: `通報 #${req.params.id} を解決済みにしました` });
    } catch (err) {
      res.status(500).json({ error: "Failed to resolve report" });
    }
  });



  moderationRouter.post("/reports/:id/dismiss", authenticateToken, isAdmin, (req, res) => {
    try {
      db.prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?").run(req.params.id);
      logAction((req as any).user.id, "REPORT_DISMISS", `Dismissed report #${req.params.id}`, req.ip);
      res.json({ success: true, message: `通報 #${req.params.id} を却下しました` });
    } catch (err) {
      res.status(500).json({ error: "Failed to dismiss report" });
    }
  });



  moderationRouter.post("/reports/batch-resolve", authenticateToken, isAdmin, (req, res) => {
    try {
      const { reportIds } = req.body;
      if (!Array.isArray(reportIds) || reportIds.length === 0) {
        return res.status(400).json({ error: "Report IDs required" });
      }
      const stmt = db.prepare("UPDATE reports SET status = 'resolved' WHERE id = ?");
      const transaction = db.transaction((ids: number[]) => {
        for (const id of ids) stmt.run(id);
      });
      transaction(reportIds);
      logAction((req as any).user.id, "REPORT_BATCH_RESOLVE", `Batch resolved ${reportIds.length} reports`, req.ip);
      res.json({ success: true, count: reportIds.length });
    } catch (err) {
      res.status(500).json({ error: "Failed to batch resolve reports" });
    }
  });



  moderationRouter.post("/reports/batch-dismiss", authenticateToken, isAdmin, (req, res) => {
    try {
      const { reportIds } = req.body;
      if (!Array.isArray(reportIds) || reportIds.length === 0) {
        return res.status(400).json({ error: "Report IDs required" });
      }
      const stmt = db.prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?");
      const transaction = db.transaction((ids: number[]) => {
        for (const id of ids) stmt.run(id);
      });
      transaction(reportIds);
      logAction((req as any).user.id, "REPORT_BATCH_DISMISS", `Batch dismissed ${reportIds.length} reports`, req.ip);
      res.json({ success: true, count: reportIds.length });
    } catch (err) {
      res.status(500).json({ error: "Failed to batch dismiss reports" });
    }
  });



  moderationRouter.get("/deletion-requests", authenticateToken, isAdmin, (req, res) => {
    try {
      const requests = db.prepare(`
        SELECT dr.*, p.target_name, p.searcher_name, u.username as post_author_name, u.id as post_author_id
        FROM deletion_requests dr 
        LEFT JOIN posts p ON dr.post_id = p.id 
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY dr.created_at DESC
      `).all();
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch deletion requests" });
    }
  });



  moderationRouter.post("/deletion-requests/:id/approve", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const reqId = req.params.id;
      const request = db.prepare("SELECT * FROM deletion_requests WHERE id = ?").get(reqId) as any;
      if (!request) return res.status(404).json({ error: "Deletion request not found" });

      db.transaction(() => {
        db.prepare("UPDATE deletion_requests SET status = 'approved' WHERE id = ?").run(reqId);

        if (request.post_id) {
          const post = db.prepare(`
            SELECT p.*, u.username as author_username 
            FROM posts p 
            LEFT JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
          `).get(request.post_id) as any;

          if (post) {
            db.prepare(`
              INSERT INTO deleted_posts_archive (
                post_id, user_id, username, searcher_name, target_name, message, ai_flagged, ai_reason, reason, deleted_by_name
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              post.id,
              post.user_id,
              post.author_username || "Unknown",
              post.searcher_name,
              post.target_name,
              post.message,
              post.ai_flagged,
              post.ai_reason,
              `削除依頼承認 (${request.reason})`,
              req.user?.username || "Admin"
            );

            db.prepare("DELETE FROM post_questions WHERE post_id = ?").run(post.id);
            db.prepare("DELETE FROM notifications WHERE link LIKE ?").run(`%/post/${post.id}%`);
            db.prepare("DELETE FROM reports WHERE target_type = 'post' AND target_id = ?").run(post.id);
            db.prepare("DELETE FROM failed_attempts WHERE post_id = ?").run(post.id);
            db.prepare("DELETE FROM posts WHERE id = ?").run(post.id);
          }
        }
      })();

      logAction(req.user.id, "DELETION_APPROVE", `Approved deletion request #${reqId} (Post ID: ${request.post_id})`, req.ip);
      res.json({ success: true, message: `削除依頼 #${reqId} を承認し、対象ボトルメールを削除しました` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to approve deletion request" });
    }
  });



  moderationRouter.post("/deletion-requests/:id/reject", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const reqId = req.params.id;
      db.prepare("UPDATE deletion_requests SET status = 'rejected' WHERE id = ?").run(reqId);
      logAction(req.user.id, "DELETION_REJECT", `Rejected deletion request #${reqId}`, req.ip);
      res.json({ success: true, message: `削除依頼 #${reqId} を却下しました` });
    } catch (err) {
      res.status(500).json({ error: "Failed to reject deletion request" });
    }
  });



  moderationRouter.post("/deletion-requests/batch-approve", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const { requestIds } = req.body;
      if (!Array.isArray(requestIds) || requestIds.length === 0) {
        return res.status(400).json({ error: "Request IDs required" });
      }

      db.transaction(() => {
        for (const reqId of requestIds) {
          const request = db.prepare("SELECT * FROM deletion_requests WHERE id = ?").get(reqId) as any;
          if (request) {
            db.prepare("UPDATE deletion_requests SET status = 'approved' WHERE id = ?").run(reqId);
            if (request.post_id) {
              const post = db.prepare(`
                SELECT p.*, u.username as author_username 
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                WHERE p.id = ?
              `).get(request.post_id) as any;

              if (post) {
                db.prepare(`
                  INSERT INTO deleted_posts_archive (
                    post_id, user_id, username, searcher_name, target_name, message, ai_flagged, ai_reason, reason, deleted_by_name
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                  post.id,
                  post.user_id,
                  post.author_username || "Unknown",
                  post.searcher_name,
                  post.target_name,
                  post.message,
                  post.ai_flagged,
                  post.ai_reason,
                  `一括削除依頼承認 (${request.reason})`,
                  req.user?.username || "Admin"
                );

                db.prepare("DELETE FROM post_questions WHERE post_id = ?").run(post.id);
                db.prepare("DELETE FROM notifications WHERE link LIKE ?").run(`%/post/${post.id}%`);
                db.prepare("DELETE FROM reports WHERE target_type = 'post' AND target_id = ?").run(post.id);
                db.prepare("DELETE FROM failed_attempts WHERE post_id = ?").run(post.id);
                db.prepare("DELETE FROM posts WHERE id = ?").run(post.id);
              }
            }
          }
        }
      })();

      logAction(req.user.id, "DELETION_BATCH_APPROVE", `Batch approved ${requestIds.length} deletion requests`, req.ip);
      res.json({ success: true, count: requestIds.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to batch approve deletion requests" });
    }
  });



  moderationRouter.post("/deletion-requests/batch-reject", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const { requestIds } = req.body;
      if (!Array.isArray(requestIds) || requestIds.length === 0) {
        return res.status(400).json({ error: "Request IDs required" });
      }

      const stmt = db.prepare("UPDATE deletion_requests SET status = 'rejected' WHERE id = ?");
      const transaction = db.transaction((ids: number[]) => {
        for (const id of ids) stmt.run(id);
      });
      transaction(requestIds);

      logAction(req.user.id, "DELETION_BATCH_REJECT", `Batch rejected ${requestIds.length} deletion requests`, req.ip);
      res.json({ success: true, count: requestIds.length });
    } catch (err) {
      res.status(500).json({ error: "Failed to batch reject deletion requests" });
    }
  });



  moderationRouter.patch("/deletion-requests/:id", authenticateToken, isAdmin, (req: any, res) => {
    const { status } = req.body;
    try {
      db.prepare("UPDATE deletion_requests SET status = ? WHERE id = ?").run(status, req.params.id);
      logAction(req.user.id, "UPDATE_DELETION_STATUS", `ID: ${req.params.id}, Status: ${status}`, req.ip);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update deletion request status" });
    }
  });

  // --- Admin Routes ---



  // --- NG Word Management ---
  moderationRouter.get("/ng-words", authenticateToken, isAdmin, (req, res) => {
    try {
      const words = db.prepare("SELECT * FROM ng_words ORDER BY created_at DESC").all();
      res.json(words);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch NG words" });
    }
  });



  moderationRouter.post("/ng-words", authenticateToken, isAdmin, (req, res) => {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: "Word required" });
    try {
      db.prepare("INSERT INTO ng_words (word) VALUES (?)").run(word.trim());
      lastNgWordsFetch = 0; // Clear cache immediately
      logAction((req as any).user.id, "NG_WORD_ADD", `Added NG word: ${word.trim()}`, req.ip);
      res.json({ success: true });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Word already exists" });
      }
      res.status(500).json({ error: "Failed to add NG word" });
    }
  });



  moderationRouter.post("/ng-words/batch-add", authenticateToken, isAdmin, (req, res) => {
    const { words } = req.body;
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: "Words array required" });
    }
    try {
      let inserted = 0;
      let skipped = 0;
      const stmt = db.prepare("INSERT OR IGNORE INTO ng_words (word) VALUES (?)");
      const transaction = db.transaction((list: string[]) => {
        for (const w of list) {
          const trimmed = (w || '').trim();
          if (trimmed) {
            const result = stmt.run(trimmed);
            if (result.changes > 0) inserted++;
            else skipped++;
          }
        }
      });
      transaction(words);
      lastNgWordsFetch = 0;
      logAction((req as any).user.id, "NG_WORDS_BATCH_ADD", `Batch added ${inserted} NG words (${skipped} skipped)`, req.ip);
      res.json({ success: true, inserted, skipped });
    } catch (err) {
      res.status(500).json({ error: "Failed to batch add NG words" });
    }
  });



  moderationRouter.post("/ng-words/batch-delete", authenticateToken, isAdmin, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array required" });
    }
    try {
      const stmt = db.prepare("DELETE FROM ng_words WHERE id = ?");
      const transaction = db.transaction((idList: number[]) => {
        for (const id of idList) stmt.run(id);
      });
      transaction(ids);
      lastNgWordsFetch = 0;
      logAction((req as any).user.id, "NG_WORDS_BATCH_DELETE", `Batch deleted ${ids.length} NG words`, req.ip);
      res.json({ success: true, count: ids.length });
    } catch (err) {
      res.status(500).json({ error: "Failed to batch delete NG words" });
    }
  });



  moderationRouter.delete("/ng-words/:id", authenticateToken, isAdmin, (req, res) => {
    try {
      db.prepare("DELETE FROM ng_words WHERE id = ?").run(req.params.id);
      lastNgWordsFetch = 0; // Clear cache immediately
      logAction((req as any).user.id, "NG_WORD_DELETE", `Deleted NG word #${req.params.id}`, req.ip);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete NG word" });
    }
  });



  moderationRouter.post("/ng-words/seed", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const sampleNgList = [
        "[0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4}",
        "0[789]0-?[0-9]{4}-?[0-9]{4}",
        "0120-?[0-9]{3}-?[0-9]{3}",
        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        "https?://[\\w/:%#\\$&\\?\\(\\)\\~\\.=\\+\\-]+",
        "LINE ID", "ラインID", "カカオトーク", "Telegram", "インスタID", "Twitter ID", "Discord",
        "死ね", "殺す", "殺してやる", "消えろ", "特定した", "待ち伏せ", "住所教えろ", "復讐", "許さない",
        "援助交際", "パパ活", "ママ活", "裏バイト", "闇バイト", "性風俗", "買春", "借金返済"
      ];
      let inserted = 0;
      const stmt = db.prepare("INSERT OR IGNORE INTO ng_words (word) VALUES (?)");
      db.transaction(() => {
        for (const w of sampleNgList) {
          const r = stmt.run(w);
          if (r.changes > 0) inserted++;
        }
      })();
      lastNgWordsFetch = 0;
      logAction(req.user.id, "NG_WORDS_SEED", `Seeded ${inserted} sample NG words`, req.ip);
      res.json({ success: true, count: inserted });
    } catch (err) {
      res.status(500).json({ error: "Failed to seed NG words" });
    }
  });



  moderationRouter.post("/ng-words/clear-all", authenticateToken, isAdmin, (req: any, res) => {
    try {
      db.prepare("DELETE FROM ng_words").run();
      lastNgWordsFetch = 0;
      logAction(req.user.id, "NG_WORDS_CLEAR", "Cleared all NG words", req.ip);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to clear NG words" });
    }
  });



  moderationRouter.post("/seed-moderation", authenticateToken, isAdmin, async (req, res) => {
    try {
      const testU = db.prepare("SELECT id FROM users WHERE username = ?").get("test") as any;
      const userId = testU ? testU.id : (req as any).user.id;

      const dummyHash1 = await bcrypt.hash("すずき", 10);
      const dummyHash2 = await bcrypt.hash("さくら", 10);

      const stmt = db.prepare(`
        INSERT INTO posts (
          user_id, searcher_name, searcher_full_name, searcher_profile, target_name, target_last_name, target_first_name, 
          target_name_en, target_hometown, target_school,
          era, category, secret_question, secret_answer, secret_answer_plain, message, image_url,
          ai_flagged, ai_reason, ai_diagnosed, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // 1. System Auto Flagged via Forbidden LINE ID Keyword
      const res1 = stmt.run(
        userId,
        "ひろき",
        "鈴木 裕樹",
        "中学の時の同級生です。陸上部で一緒に走っていました。",
        "さとし",
        "佐藤",
        "聡",
        "satoshi_s",
        "東京都世田谷区",
        "緑川中学校",
        "2000",
        "friend",
        "お互いの中学時代のあだ名は何でしたか？",
        dummyHash1,
        "ひろとのり",
        "さとし、久しぶり！部活で毎日泥だらけになって走っていたのを覚えているか？またみんなで集まりたいから、僕の連絡先（LINE ID: hiro1234）を追加して連絡してほしい！待ってるぞ。",
        null,
        1,
        "【システム自動検知】不適切な表現（禁止キーワード: LINE ID）の含まれる投稿です。",
        1,
        "active"
      );
      const postId1 = res1.lastInsertRowid as number;
      db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)")
        .run(postId1, "陸上部の顧問の先生の苗字は？", dummyHash2, "山田先生");

      // 2. AI Threat/Harassment Flagged
      const res2 = stmt.run(
        userId,
        "匿名調査官",
        null,
        "とある過去の因縁を調査しているものです。",
        "鈴木健一",
        "鈴木",
        "健一",
        "kenichi_suzuki",
        "神奈川県横浜市",
        "青葉台高校",
        "1990",
        "other",
        "あの時、裏切った代償を覚えていますか？",
        dummyHash1,
        "全部",
        "鈴木健一、お前をずっと探していたぞ。1990年代に青葉台高校の付近でやったこと、絶対に許さない。逃げられると思うなよ。ネットの海を這いずり回ってでもお前の住所を特定して、直接落とし前をつけさせに行くからな。待ってろよ。",
        null,
        1,
        "【AI自動検知】脅迫、ストーキング勧誘、または復讐・攻撃的危害を意図した表現が検出されました。",
        1,
        "active"
      );
      const postId2 = res2.lastInsertRowid as number;
      db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)")
        .run(postId2, "あの時お前が奪ったものの名前は？", dummyHash2, "お金");

      // 3. AI Commercial/Spam/Adult/Dating Flagged
      const res3 = stmt.run(
        userId,
        "サクラ",
        null,
        "素敵な出会いをコーディネートするアドバイザーです。",
        "タカシ",
        "山下",
        "隆",
        "takashi_y",
        "大阪府大阪市",
        "夕陽丘学園高校",
        "2010",
        "love",
        "高収入で遊べる簡単なバイトとは何ですか？",
        dummyHash1,
        "お小遣い稼ぎ",
        "タカシくん、簡単に稼げるお小遣い案件の案内です！アダルト要素は少しありますが、スマホ1台で週に10万以上稼げるチャンスです。興味があれば「秘密の質問」をクリアして連絡先を受け取って詳細を聞いてくださいね。男性向け・女性向けどちらも対応可能です。",
        null,
        1,
        "【AI自動検知】商業的スパム、違法性の高い勧誘活動（高収入バイト、アダルト詐欺）の意図が検出されました。",
        1,
        "active"
      );
      const postId3 = res3.lastInsertRowid as number;
      db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)")
        .run(postId3, "連絡先の詳細はどこに記載していますか？", dummyHash2, "連絡先開示");

      logAction((req as any).user.id, "MODERATION_SAMPLE_SEEDED", "Seeded 3 moderation sample posts with flags", req.ip);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to seed moderation sample data:", err);
      res.status(500).json({ error: "Failed to seed moderation sample data" });
    }
  });

  // --- 1. 🗑️ 削除依頼 (Deletion Requests) Seed & Clear ---


  // --- 1. 🗑️ 削除依頼 (Deletion Requests) Seed & Clear ---
  moderationRouter.post("/deletion-requests/seed", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const sampleDeletions = [
        {
          name: "佐藤 恵美",
          url: "https://remeets.jp/post/sample-1",
          content: "中学時代の同級生のボトルメール",
          reason: "privacy",
          explanation: "実名と当時の部活の詳細が記載されており、個人のプライバシー侵害に該当するため削除をお願いいたします。",
          email: "sato.emi@example.com"
        },
        {
          name: "弁護士 山田 太郎 (代理人)",
          url: "https://remeets.jp/post/sample-2",
          content: "1990年代の大学サークルに関する投稿",
          reason: "defamation",
          explanation: "事実無根の誹謗中傷表現が含まれており、名誉毀損に該当するため至急の削除を請求いたします。",
          email: "yamada-law@example.com"
        },
        {
          name: "田中 健一 (投稿者本人)",
          url: "https://remeets.jp/post/sample-3",
          content: "高校時代の友人を探すボトルメール",
          reason: "self_cancel",
          explanation: "無事に本人と他の手段で連絡が取れたため、投稿を取り下げていただきたく申請します。",
          email: "tanaka.k@example.com"
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO deletion_requests (name, url, content, reason, explanation, email, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
      `);
      for (const d of sampleDeletions) {
        stmt.run(d.name, d.url, d.content, d.reason, d.explanation, d.email);
      }
      logAction(req.user.id, "DELETION_SAMPLE_SEEDED", `Seeded ${sampleDeletions.length} sample deletion requests`, req.ip);
      res.json({ success: true, count: sampleDeletions.length });
    } catch (err) {
      console.error("Seed deletion requests error:", err);
      res.status(500).json({ error: "削除申請サンプルの生成に失敗しました" });
    }
  });



  moderationRouter.post("/deletion-requests/clear-all", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM deletion_requests").run();
      logAction(req.user.id, "DELETION_ALL_CLEARED", `Cleared all ${result.changes} deletion requests`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear deletion requests error:", err);
      res.status(500).json({ error: "削除申請の一括クリアに失敗しました" });
    }
  });

  // --- 2. 📬 お問い合わせ (Contacts) Seed & Clear ---


  // --- 3. 🚨 ユーザー通報 (Reports) Seed & Clear ---
  moderationRouter.post("/reports/seed", authenticateToken, isAdmin, (req: any, res) => {
    try {
      let usersList = db.prepare("SELECT id FROM users LIMIT 5").all() as any[];
      if (usersList.length === 0) {
        const dummyUser = db.prepare("INSERT INTO users (username, email, password, role) VALUES ('demo_reporter', 'demo@example.com', 'dummy_pass', 'user')").run();
        usersList = [{ id: dummyUser.lastInsertRowid }];
      }

      let postsList = db.prepare("SELECT id FROM posts LIMIT 5").all() as any[];
      if (postsList.length === 0) {
        const dummyPost = db.prepare("INSERT INTO posts (user_id, searcher_name, target_name, message, status) VALUES (?, '差出人サンプル', '宛先サンプル', '通報検証用サンプルボトルメール', 'approved')").run(usersList[0].id);
        postsList = [{ id: dummyPost.lastInsertRowid }];
      }
      
      const reporterId = req.user?.id || usersList[0].id;
      const p1 = postsList[0]?.id || 1;
      const p2 = postsList[1]?.id || p1;
      const p3 = postsList[2]?.id || p1;

      const sampleReports = [
        {
          reporter_id: reporterId,
          target_type: 'post',
          target_id: p1,
          report_type: 'stalking',
          reason: '【ストーカー・付きまとい疑い】当時の職場や現在の居住地を探るような不審な記載が見受けられます。',
          contact_info: 'reporter1@example.com',
          status: 'pending'
        },
        {
          reporter_id: reporterId,
          target_type: 'post',
          target_id: p2,
          report_type: 'harassment',
          reason: '【誹謗中傷・暴言】特定の個人を名指しして過去のトラブルを非難する攻撃的な文章が含まれています。',
          contact_info: 'reporter2@example.com',
          status: 'pending'
        },
        {
          reporter_id: reporterId,
          target_type: 'post',
          target_id: p3,
          report_type: 'spam',
          reason: '【商用宣伝・外部誘導】メッセージの末尾にSNSアカウントや外部サイトへの不審なURLが記載されています。',
          contact_info: 'reporter3@example.com',
          status: 'pending'
        }
      ];

      const stmt = db.prepare("INSERT INTO reports (reporter_id, target_type, target_id, report_type, reason, contact_info, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
      for (const r of sampleReports) {
        stmt.run(r.reporter_id, r.target_type, r.target_id, r.report_type, r.reason, r.contact_info, r.status);
      }
      logAction(req.user?.id || reporterId, "REPORTS_SAMPLE_SEEDED", `Seeded ${sampleReports.length} sample reports`, req.ip);
      res.json({ success: true, count: sampleReports.length });
    } catch (err: any) {
      console.error("Seed reports error:", err);
      res.status(500).json({ error: `通報サンプルの生成に失敗しました: ${err.message || err}` });
    }
  });



  moderationRouter.post("/reports/clear-all", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM reports").run();
      logAction(req.user.id, "REPORTS_ALL_CLEARED", `Cleared all ${result.changes} reports`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear reports error:", err);
      res.status(500).json({ error: "通報履歴の一括クリアに失敗しました" });
    }
  });

  // --- 4. 🤖 AI検知保留キュー & 削除アーカイブ Clear ---


  // --- 4. 🤖 AI検知保留キュー & 削除アーカイブ Clear ---
  moderationRouter.post("/moderation/clear-queue", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("UPDATE posts SET ai_flagged = 0, status = 'active' WHERE ai_flagged = 1 OR status = 'flagged'").run();
      logAction(req.user.id, "MODERATION_QUEUE_CLEARED", `Cleared ${result.changes} flagged posts from queue`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear moderation queue error:", err);
      res.status(500).json({ error: "AI検知キューのクリアに失敗しました" });
    }
  });



  moderationRouter.post("/moderation/clear-archive", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM deleted_posts_archive").run();
      logAction(req.user.id, "MODERATION_ARCHIVE_CLEARED", `Cleared all ${result.changes} deleted posts archive logs`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear moderation archive error:", err);
      res.status(500).json({ error: "削除監査アーカイブのクリアに失敗しました" });
    }
  });

  // --- 5. 🛡️ 本人確認 (eKYC) 監査ログ Seed & Clear ---


  // --- Admin AI Moderation Test & Simulation Endpoints ---
  moderationRouter.post("/test-censorship", authenticateToken, isAdmin, async (req: any, res) => {
    const startTime = Date.now();
    const { text = "" } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "テキストを入力してください。" });
    }

    try {
      // 1. Fullname detection
      const fullNamePatterns = [/山田太郎/i, /鈴木/i, /佐藤/i, /田中/i, /渡辺/i, /高橋/i, /小林/i, /[一-龠]{2,4}\s*[一-龠]{2,4}/];
      const hasFullName = fullNamePatterns.some(p => p.test(text));

      // 2. Personal Info Detection
      const emailDetected = /[\w.-]+@[\w.-]+\.\w+/.test(text);
      const phoneDetected = /0[1-9]0\d{7,8}|0\d{9,10}|0120\d{6}|0800\d{7}|050\d{8}|\d{2,4}[- ]?\d{2,4}[- ]?\d{3,4}/.test(text.replace(/[-\sー－.・]/g, ''));
      const lineIdDetected = /line\s*(?:id)?\s*[:：\s]\s*[\w.-]+/i.test(text) || /line\b|ライン|らいん/i.test(text);
      const snsDetected = /twitter|instagram|インスタ|tiktok|kakao|skype|discord|telegram|facebook|フェイスブック/i.test(text);
      const addressDetected = /(?:東京都|北海道|(?:京都|大阪)府|.{2,3}県).{1,10}(?:市|区|町|村).{1,10}\d+/.test(text);

      const hasPersonalInfo = emailDetected || phoneDetected || lineIdDetected || snsDetected || addressDetected;

      // 3. Inappropriate words detection
      const detectedForbidden = detectInappropriateWords(text);
      const hasForbiddenWords = detectedForbidden.length > 0;

      // Masked text generation
      let filteredText = text;
      filteredText = filteredText.replace(/[\w.-]+@[\w.-]+\.\w+/g, "****@****.***");
      filteredText = filteredText.replace(/0\d{1,4}[- ]?\d{1,4}[- ]?\d{3,4}/g, "090-****-****");
      filteredText = filteredText.replace(/line\s*(?:id)?\s*[:：\s]\s*[\w.-]+/gi, "LINE ID: ****");
      filteredText = filteredText.replace(/(?:東京都|北海道|(?:京都|大阪)府|.{2,3}県).{1,10}(?:市|区|町|村).{1,10}\d+[-\d]*/g, "[住所情報保護のため非表示]");
      detectedForbidden.forEach(w => {
        if (w && w.length > 0) {
          filteredText = filteredText.split(w).join("*".repeat(w.length));
        }
      });

      // 4. Gemini AI Risk Assessment (or intelligent fallback rule model)
      let isFlagged = hasForbiddenWords || hasPersonalInfo;
      let riskScore = 0;
      let categories = {
        harassment: 0,
        pii_leakage: 0,
        inappropriate_meeting: 0,
        hate_speech: 0
      };
      let aiReason = "";
      let suggestedAction: "APPROVE" | "AUTO_FLAG" | "IMMEDIATE_QUARANTINE_AUTO_REPORT" = "APPROVE";
      let geminiAnalyzed = false;

      // Rule-based preliminary scores
      if (hasForbiddenWords) {
        riskScore += 60;
        categories.hate_speech += 70;
        categories.harassment += 60;
      }
      if (addressDetected || phoneDetected || lineIdDetected || emailDetected || snsDetected) {
        riskScore += 40;
        categories.pii_leakage += 85;
      }
      if (/パパ活|援助交際|割り切り|お小遣い|大人の関係|裏バイト|闇バイト|融資/i.test(text)) {
        riskScore += 80;
        categories.inappropriate_meeting += 95;
      }
      if (/殺す|死ね|消えろ|爆破|特定した|バラしてやる|乗り込んでやる|晒す|待ち伏せ/i.test(text)) {
        riskScore += 90;
        categories.harassment += 95;
        categories.hate_speech += 90;
      }

      riskScore = Math.min(100, riskScore);

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `
            あなたは「ReMEETs（再会の海）」のAI安全防衛監査官です。
            以下のテキスト（投函ボトルメールまたはメッセージ文章）をリアルタイムで精密評価し、危険度・カテゴリ別リスクを分析してください。

            【入力テキスト】: "${text}"

            【判定要件】:
            - is_flagged: 不適切・危険・個人情報露出・ストーカー・パパ活・脅迫がある場合は true
            - risk_score: 0 (完全安全) 〜 100 (極めて危険・即時通報対象)
            - categories: 各カテゴリのリスクスコア (0〜100)
              - harassment: 誹謗中傷・脅迫・嫌がらせ
              - pii_leakage: 個人情報・住所・電話・LINE等の露出
              - inappropriate_meeting: パパ活・不当出会い・金銭援助買春
              - hate_speech: ヘイトスピーチ・公序良俗違反
            - ai_reason: 検出された根拠と評価結果（日本語で親切かつ論理的に説明）
            - suggested_action: "APPROVE" (公開許可) | "AUTO_FLAG" (要確認隔離) | "IMMEDIATE_QUARANTINE_AUTO_REPORT" (即時非公開＆公安通報)

            JSONのみで返答してください。
          `;
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          const result = JSON.parse(response.text || '{}');
          if (result && typeof result.risk_score === 'number') {
            isFlagged = result.is_flagged ?? isFlagged;
            riskScore = result.risk_score;
            if (result.categories) {
              categories = {
                harassment: result.categories.harassment ?? categories.harassment,
                pii_leakage: result.categories.pii_leakage ?? categories.pii_leakage,
                inappropriate_meeting: result.categories.inappropriate_meeting ?? categories.inappropriate_meeting,
                hate_speech: result.categories.hate_speech ?? categories.hate_speech
              };
            }
            aiReason = result.ai_reason || "";
            suggestedAction = result.suggested_action || (riskScore >= 70 ? "IMMEDIATE_QUARANTINE_AUTO_REPORT" : riskScore >= 30 ? "AUTO_FLAG" : "APPROVE");
            geminiAnalyzed = true;
          }
        } catch (gErr) {
          console.warn("Gemini API live check failed, using rule engine:", gErr);
        }
      }

      if (!aiReason) {
        if (riskScore >= 70) {
          aiReason = "【高危険度検知】脅迫、重大な個人情報（電話・LINE等）の露呈、不当出会い誘発文言が明確に検出されました。公安システム自動通報の対象です。";
          suggestedAction = "IMMEDIATE_QUARANTINE_AUTO_REPORT";
          isFlagged = true;
        } else if (riskScore >= 30) {
          aiReason = "【注意・要確認】直接の連絡先やフルネーム漢字が含まれています。利用規約保護のため自動マスク処理または要確認フラグが付与されます。";
          suggestedAction = "AUTO_FLAG";
          isFlagged = true;
        } else {
          aiReason = "【安全確認完了】危険な単語、不適切な勧誘、個人情報の露呈は検出されませんでした。";
          suggestedAction = "APPROVE";
          isFlagged = false;
        }
      }

      const executionTimeMs = Date.now() - startTime;

      res.json({
        fullname: {
          detected: hasFullName,
          reason: hasFullName ? "常用姓名またはフルネーム表現を検出" : null
        },
        personalInfo: {
          detected: hasPersonalInfo,
          email: emailDetected,
          phone: phoneDetected,
          lineId: lineIdDetected,
          sns: snsDetected,
          address: addressDetected
        },
        inappropriate: {
          detected: hasForbiddenWords,
          words: detectedForbidden
        },
        filteredText,
        is_flagged: isFlagged,
        risk_score: riskScore,
        categories,
        ai_reason: aiReason,
        suggested_action: suggestedAction,
        gemini_analyzed: geminiAnalyzed,
        execution_time_ms: executionTimeMs
      });
    } catch (err) {
      console.error("Test censorship failed:", err);
      res.status(500).json({ error: "検閲テストの実行中にエラーが発生しました。" });
    }
  });

  const handleSimulationPost = async (req: any, res: any) => {
    const text = req.body.text || req.body.message || "";
    const searcherName = req.body.searcherName || "模擬テスト投稿者";
    const targetName = req.body.targetName || "模擬テスト対象者";

    if (!text) {
      return res.status(400).json({ error: "テキストを入力してください。" });
    }

    try {
      const detectedForbidden = detectInappropriateWords(text);
      const hasForbidden = detectedForbidden.length > 0;
      
      const phoneOrLineOrAddress = /0\d{1,4}[- ]?\d{1,4}[- ]?\d{3,4}|line\s*id|パパ活|援助交際|殺す|爆破/i.test(text);
      const isHighRisk = hasForbidden || phoneOrLineOrAddress;

      const dummyHash1 = bcrypt.hashSync("模擬正解1", 10);
      const dummyHash2 = bcrypt.hashSync("模擬正解2", 10);

      const aiFlaggedVal = isHighRisk ? 1 : 0;
      const aiReasonVal = isHighRisk 
        ? `【安全防衛シミュレーション検知】検出キーワード/パターン: ${detectedForbidden.concat(phoneOrLineOrAddress ? ['直接連絡先/高危険度表現'] : []).join(", ")}` 
        : null;

      const stmt = db.prepare(`
        INSERT INTO posts (
          user_id, searcher_name, searcher_full_name, searcher_profile, target_name, target_last_name, target_first_name, 
          target_hometown, era, category, secret_question, secret_answer, secret_answer_plain, message,
          ai_flagged, ai_reason, ai_diagnosed, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        req.user.id, searcherName, "模擬テスト太郎", "防衛検閲テスト用のサンプルプロフィールです。", targetName, "模擬", "花子",
        "東京都渋谷区", "2010", "friend", "テスト用質問1", dummyHash1, "模擬正解1", text,
        aiFlaggedVal, aiReasonVal, 1, "active"
      );

      const postId = result.lastInsertRowid as number;

      db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)")
        .run(postId, "テスト用質問2", dummyHash2, "模擬正解2");

      let reportCreated = false;
      if (isHighRisk) {
        db.prepare(`
          INSERT INTO reports (reporter_id, target_type, target_id, report_type, reason, contact_info, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          req.user.id,
          'post',
          postId,
          'inappropriate_words',
          `【安全防衛リアルタイム通報】\n模擬投函テスト（ボトルID: #${postId}）にて危険な不当表現・過度な個人情報露出が検知されました。\n\n検出キーワード/表現:\n- ${detectedForbidden.concat(phoneOrLineOrAddress ? ['直接連絡先/高危険度表現'] : []).join(", ")}\n\n投稿文面:\n"${text}"\n\n状態: システムにより自動的に非公開（ai_flagged = 1）にマークされ、安全隔離されました。`,
          'system_security@remeets.internal',
          'priority'
        );
        reportCreated = true;
      }

      logAction(req.user.id, "SIMULATION_POST_TRIGGERED", `Post #${postId} created (AI Flagged: ${aiFlaggedVal})`, req.ip);

      res.json({
        success: true,
        postId,
        post_id: postId,
        aiFlagged: aiFlaggedVal === 1,
        ai_flagged: aiFlaggedVal === 1,
        aiReason: aiReasonVal,
        reportCreated
      });
    } catch (err) {
      console.error("Simulation post failed:", err);
      res.status(500).json({ error: "模擬投函の実行に失敗しました。" });
    }
  };



  moderationRouter.post("/trigger-simulation-post", authenticateToken, isAdmin, handleSimulationPost);

  moderationRouter.post("/simulate-post", authenticateToken, isAdmin, handleSimulationPost);



  moderationRouter.get("/moderation-queue", authenticateToken, isAdmin, (req, res) => {
    try {
      const flaggedPosts = db.prepare(`
        SELECT p.*, u.username as author_username, u.full_name as author_full_name, u.is_blocked as author_is_blocked, u.is_ekyc_verified as author_is_ekyc_verified
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.ai_flagged = 1 OR p.status = 'flagged'
        ORDER BY p.created_at DESC
      `).all();
      res.json(flaggedPosts);
    } catch (err) {
      console.error("Failed to fetch moderation-queue:", err);
      res.status(500).json({ error: "Failed to fetch moderation queue" });
    }
  });

  // 📋 モデレーション全処置履歴一覧の取得 API


  // 📋 モデレーション全処置履歴一覧の取得 API
  moderationRouter.get("/moderation/history", authenticateToken, isAdmin, (req, res) => {
    try {
      // 1. moderation_history テーブルから取得
      const historyList = db.prepare(`
        SELECT * FROM moderation_history ORDER BY created_at DESC LIMIT 500
      `).all() as any[];

      // 2. もし moderation_history が空、または件数が少ない場合、deleted_posts_archive の過去データも統合
      const historyPostIds = new Set(historyList.map(h => `${h.post_id}_${h.action_type}`));
      const archiveList = db.prepare(`
        SELECT * FROM deleted_posts_archive ORDER BY deleted_at DESC LIMIT 200
      `).all() as any[];

      for (const a of archiveList) {
        const key = `${a.post_id}_ARCHIVE_DELETE`;
        if (!historyPostIds.has(key)) {
          historyList.push({
            id: `arch_${a.id}`,
            post_id: a.post_id,
            action_type: 'ARCHIVE_DELETE',
            action_label: '🗑️ 有害隔離削除',
            target_name: a.target_name,
            searcher_name: a.searcher_name,
            author_user_id: a.user_id,
            author_username: a.username,
            message: a.message,
            ai_reason: a.ai_reason || a.reason,
            admin_id: null,
            admin_username: a.deleted_by_name || 'Admin',
            details: a.reason || 'AI検閲確定・有害コンテンツ隔離削除',
            created_at: a.deleted_at
          });
        }
      }

      // 日時順にソート
      historyList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json(historyList);
    } catch (err) {
      console.error("Failed to fetch moderation history:", err);
      res.status(500).json({ error: "モデレーション履歴の取得に失敗しました" });
    }
  });

  // 🗑️ モデレーション全処置履歴のクリア API


  // 🗑️ モデレーション全処置履歴のクリア API
  moderationRouter.post("/moderation/clear-history", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM moderation_history").run();
      logAction(req.user.id, "MODERATION_HISTORY_CLEARED", `Cleared ${result.changes} moderation history logs`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Failed to clear moderation history:", err);
      res.status(500).json({ error: "モデレーション履歴のクリアに失敗しました" });
    }
  });

  // 個別ボトルのAIフラグ解除・承認公開


  // 個別ボトルのAIフラグ解除・承認公開
  moderationRouter.post("/moderation/approve", authenticateToken, isAdmin, (req, res) => {
    try {
      const { postId } = req.body;
      if (!postId) return res.status(400).json({ error: "Post ID is required" });

      const post = db.prepare(`
        SELECT p.*, u.username as author_username 
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?
      `).get(postId) as any;

      db.prepare("UPDATE posts SET ai_flagged = 0, status = 'active', ai_diagnosed = 1 WHERE id = ?").run(postId);
      
      // 処置履歴に記録
      recordModerationHistory({
        postId: postId,
        actionType: 'APPROVE_UNFLAG',
        actionLabel: '🟢 承認・公開復帰',
        targetName: post?.target_name,
        searcherName: post?.searcher_name,
        authorUserId: post?.user_id,
        authorUsername: post?.author_username,
        message: post?.message,
        aiReason: post?.ai_reason,
        adminId: (req as any).user.id,
        adminUsername: (req as any).user.username,
        details: '管理者の目視審査により誤検知と判定、通常公開へ復帰'
      });

      logAction((req as any).user.id, "MODERATION_APPROVED", `Post #${postId} approved and published by admin`, req.ip);
      res.json({ success: true, message: `ボトル #${postId} を承認・公開しました` });
    } catch (err) {
      console.error("Failed to approve post:", err);
      res.status(500).json({ error: "Failed to approve post" });
    }
  });

  // 複数ボトルのAIフラグ一括解除・承認公開


  // 複数ボトルのAIフラグ一括解除・承認公開
  moderationRouter.post("/moderation/batch-approve", authenticateToken, isAdmin, (req, res) => {
    try {
      const { postIds } = req.body;
      if (!Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({ error: "Post IDs array is required" });
      }

      const placeholders = postIds.map(() => '?').join(',');
      const posts = db.prepare(`
        SELECT p.*, u.username as author_username 
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.id IN (${placeholders})
      `).all(...postIds) as any[];

      const stmt = db.prepare("UPDATE posts SET ai_flagged = 0, status = 'active', ai_diagnosed = 1 WHERE id = ?");
      const transaction = db.transaction((ids: number[]) => {
        for (const id of ids) {
          stmt.run(id);
        }
      });
      transaction(postIds);

      // 各ポストの処置履歴を一括記録
      for (const p of posts) {
        recordModerationHistory({
          postId: p.id,
          actionType: 'APPROVE_UNFLAG',
          actionLabel: '🟢 一括承認・公開',
          targetName: p.target_name,
          searcherName: p.searcher_name,
          authorUserId: p.user_id,
          authorUsername: p.author_username,
          message: p.message,
          aiReason: p.ai_reason,
          adminId: (req as any).user.id,
          adminUsername: (req as any).user.username,
          details: '一括審査による通常公開復帰'
        });
      }

      logAction((req as any).user.id, "MODERATION_BATCH_APPROVED", `Batch approved ${postIds.length} posts by admin`, req.ip);
      res.json({ success: true, count: postIds.length, message: `${postIds.length}件のボトルを一括承認・公開しました` });
    } catch (err) {
      console.error("Failed to batch approve posts:", err);
      res.status(500).json({ error: "Failed to batch approve posts" });
    }
  });

