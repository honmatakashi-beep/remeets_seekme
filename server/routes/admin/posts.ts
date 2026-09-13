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

export const postsRouter = express.Router();


  postsRouter.get("/posts", authenticateToken, isAdmin, (req, res) => {
    try {
      const posts = db.prepare(`
        SELECT p.*, 
               u.username as searcher_username, 
               u.nickname as searcher_account_nickname, 
               u.full_name as searcher_full_name,
               u.maiden_name as searcher_maiden_name
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC
      `).all() as any[];

      const allExtraQuestions = db.prepare("SELECT post_id, question, answer, answer_plain FROM post_questions").all() as any[];
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
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });



  postsRouter.get("/posts/:id", authenticateToken, isAdmin, (req, res) => {
    try {
      const post = db.prepare(`
        SELECT p.*, 
               u.username as searcher_username, 
               u.nickname as searcher_account_nickname, 
               u.full_name as searcher_full_name,
               u.maiden_name as searcher_maiden_name
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?
      `).get(req.params.id) as any;
      if (!post) return res.status(404).json({ error: "Post not found" });
      
      const extraQuestions = db.prepare("SELECT question, answer, answer_plain FROM post_questions WHERE post_id = ?").all(req.params.id) as any[];
      
      const allQuestions = [
        ...(post.secret_question ? [{ question: post.secret_question, answer: post.secret_answer, answer_plain: post.secret_answer_plain }] : []),
        ...extraQuestions
      ];
      
      res.json({ ...post, questions: allQuestions });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch post details" });
    }
  });



  postsRouter.post("/posts/:id/ai-flag", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const { ai_flagged, ai_reason } = req.body;
      db.prepare("UPDATE posts SET ai_flagged = ?, ai_reason = ?, ai_diagnosed = 1 WHERE id = ?").run(
        ai_flagged,
        ai_reason,
        req.params.id
      );
      res.json({ success: true });
    } catch (err) {
      console.error("AI Flag update error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });



  postsRouter.post("/posts/:id/ai-analyze", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id) as any;
      if (!post) return res.status(404).json({ error: "Post not found" });

      const result = await evaluateContentSafety(post.searcher_name, post.target_name, post.message);
      
      db.prepare("UPDATE posts SET ai_flagged = ?, ai_reason = ?, ai_diagnosed = 1 WHERE id = ?").run(
        result.is_flagged ? 1 : 0,
        result.reason || null,
        req.params.id
      );

      // If flagged, ensure it's in the reports queue
      if (result.is_flagged) {
        const existingReport = db.prepare("SELECT id FROM reports WHERE target_type = 'post' AND target_id = ? AND reporter_id = 0").get(req.params.id);
        if (!existingReport) {
          db.prepare(`
            INSERT INTO reports (reporter_id, target_type, target_id, report_type, reason, contact_info, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            0,
            'post',
            req.params.id,
            'ai_flagged',
            `【AI手動再診断・安全隔離】\nボトルメールID: #${req.params.id}（宛先: ${post.target_name || '不明'}様）がAI安全分析により不適切・ストーカー・プライバシー侵害の疑いで自動非公開（隔離）されました。\n\nAI判定理由:\n${result.reason || '不適切な表現またはプライバシー過度露出'}\n\n投稿本文:\n"${post.message || ''}"`,
            null,
            'priority'
          );
        }
      }

      logAction(req.user.id, "POST_AI_ANALYZED", `Post ID: ${req.params.id}, Flagged: ${result.is_flagged}`, req.ip);

      res.json({ success: true, result });
    } catch (err) {
      console.error("AI Analysis error:", err);
      res.status(500).json({ error: "AI analysis failed" });
    }
  });



  postsRouter.delete("/posts/:id", authenticateToken, isAdmin, (req, res) => {
    console.log(`Admin attempting to delete post ID: ${req.params.id}`);
    try {
      const reason = req.body?.reason || req.query?.reason || "管理者による直接削除(AI監視/手動)";
      // Fetch post details first to archive it for history and compliance auditing
      const post = db.prepare(`
        SELECT p.*, u.username as author_username 
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?
      `).get(req.params.id) as any;

      // Manually delete related data to avoid foreign key constraints if enabled
      // and to keep the database clean
      db.transaction(() => {
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
            reason,
            (req as any).user.username || "Admin"
          );
        }

        db.prepare("DELETE FROM post_questions WHERE post_id = ?").run(req.params.id);
        db.prepare("DELETE FROM notifications WHERE link LIKE ?").run(`%/post/${req.params.id}%`);
        db.prepare("DELETE FROM reports WHERE target_type = 'post' AND target_id = ?").run(req.params.id);
        db.prepare("DELETE FROM failed_attempts WHERE post_id = ?").run(req.params.id);
        db.prepare("DELETE FROM deletion_requests WHERE post_id = ?").run(req.params.id);
        
        const result = db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
        console.log(`Post delete result:`, result);
        if (result.changes === 0) {
          console.warn(`No post found with ID: ${req.params.id}`);
        }
      })();

      if (post) {
        recordModerationHistory({
          postId: post.id,
          actionType: 'ARCHIVE_DELETE',
          actionLabel: '🗑️ 有害隔離削除',
          targetName: post.target_name,
          searcherName: post.searcher_name,
          authorUserId: post.user_id,
          authorUsername: post.author_username,
          message: post.message,
          aiReason: post.ai_reason,
          adminId: (req as any).user?.id,
          adminUsername: (req as any).user?.username,
          details: reason
        });
      }

      logAction((req as any).user.id, "post_deleted", `Post ID: ${req.params.id} (Archived to audit database)`, req.ip);
      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to delete post ${req.params.id}:`, err);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });



  postsRouter.patch("/posts/:id/status", authenticateToken, isAdmin, (req: any, res) => {
    const { status } = req.body;
    if (!status || !['active', 'resolved', 'archived'].includes(status)) {
      return res.status(400).json({ error: "無効なステータスです" });
    }
    try {
      db.prepare("UPDATE posts SET status = ? WHERE id = ?").run(status, req.params.id);
      logAction(req.user.id, "POST_STATUS_UPDATED", `Post ID: ${req.params.id} -> ${status}`, req.ip);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to update post status:", err);
      res.status(500).json({ error: "ステータス更新に失敗しました" });
    }
  });



  postsRouter.post("/posts/batch-status", authenticateToken, isAdmin, (req: any, res) => {
    const postIds = req.body.postIds || req.body.ids;
    const { status } = req.body;
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ error: "対象ボトルメールが指定されていません" });
    }
    if (!status || !['active', 'resolved', 'archived'].includes(status)) {
      return res.status(400).json({ error: "無効なステータスです" });
    }
    try {
      const placeholders = postIds.map(() => '?').join(',');
      const stmt = db.prepare(`UPDATE posts SET status = ? WHERE id IN (${placeholders})`);
      const result = stmt.run(status, ...postIds);
      logAction(req.user.id, "BATCH_POSTS_STATUS_UPDATED", `Post IDs: ${postIds.join(', ')} -> ${status} (${result.changes}件)`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Batch update post status error:", err);
      res.status(500).json({ error: "一括ステータス更新に失敗しました" });
    }
  });



  postsRouter.post("/posts/batch-ai-analyze", authenticateToken, isAdmin, async (req: any, res) => {
    const postIds = req.body.postIds || req.body.ids;
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ error: "対象ボトルメールが指定されていません" });
    }
    try {
      const placeholders = postIds.map(() => '?').join(',');
      const posts = db.prepare(`SELECT * FROM posts WHERE id IN (${placeholders})`).all(...postIds) as any[];
      let analyzedCount = 0;

      for (const p of posts) {
        const result = await evaluateContentSafety(p.searcher_name, p.target_name, p.message);
        
        db.prepare(`
          UPDATE posts 
          SET ai_diagnosed = 1, ai_flagged = ?, ai_reason = ? 
          WHERE id = ?
        `).run(result.is_flagged ? 1 : 0, result.reason || null, p.id);

        if (result.is_flagged) {
          const existingReport = db.prepare("SELECT id FROM reports WHERE target_type = 'post' AND target_id = ? AND reporter_id = 0").get(p.id);
          if (!existingReport) {
            db.prepare(`
              INSERT INTO reports (reporter_id, target_type, target_id, report_type, reason, contact_info, status)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              0,
              'post',
              p.id,
              'ai_flagged',
              `【AI一括安全診断・安全隔離】\nボトルメールID: #${p.id}（宛先: ${p.target_name || '不明'}様）がAI安全分析により不適切・ストーカー・プライバシー侵害の疑いで自動非公開（隔離）されました。\n\nAI判定理由:\n${result.reason || '不適切な表現またはプライバシー過度露出'}\n\n投稿本文:\n"${p.message || ''}"`,
              null,
              'priority'
            );
          }
        }
        analyzedCount++;
      }

      logAction(req.user.id, "BATCH_POSTS_AI_ANALYZED", `Post IDs: ${postIds.join(', ')} (${analyzedCount}件診断完了)`, req.ip);
      res.json({ success: true, count: analyzedCount });
    } catch (err) {
      console.error("Batch AI analyze error:", err);
      res.status(500).json({ error: "一括AI診断の実行中にエラーが発生しました" });
    }
  });



  postsRouter.get("/deleted-posts-archive", authenticateToken, isAdmin, (req, res) => {
    try {
      const archive = db.prepare("SELECT * FROM deleted_posts_archive ORDER BY deleted_at DESC").all();
      res.json(archive);
    } catch (err) {
      console.error("Failed to fetch deleted posts archive:", err);
      res.status(500).json({ error: "Failed to fetch deletion archive" });
    }
  });

  // --- NG Word Management ---


  postsRouter.post("/generate-sample-posts", authenticateToken, isAdmin, async (req, res) => {
    try {
      const count = Number(req.body?.count) || 50;
      const result = await generateAdditionalSamplePosts(count);
      logAction((req as any).user.id, "SAMPLE_POSTS_GENERATED", `Generated ${result.count} 100% unique sample posts`, req.ip);
      res.json({ success: true, count: result.count, totalPosts: result.totalPosts });
    } catch (err) {
      console.error("Failed to generate sample posts:", err);
      res.status(500).json({ error: "Failed to generate sample posts" });
    }
  });



  postsRouter.post("/reseed-unique-posts", authenticateToken, isAdmin, async (req, res) => {
    try {
      const count = Number(req.body?.count) || 200;
      const result = await reseedCleanUniquePosts(count);
      logAction((req as any).user.id, "RESEED_UNIQUE_POSTS", `Reseeded database with ${result.count} completely unique posts (Zero duplicates)`, req.ip);
      res.json({ success: true, count: result.count, totalPosts: result.totalPosts });
    } catch (err) {
      console.error("Failed to reseed unique posts:", err);
      res.status(500).json({ error: "Failed to reseed unique posts" });
    }
  });

