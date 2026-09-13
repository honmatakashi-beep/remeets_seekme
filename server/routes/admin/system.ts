
import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
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

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const scanImageUsage = (): { [relPath: string]: string } => {
  const rootDir = process.cwd();
  const extensions = [".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".json"];
  const scanDirs = [
    path.join(rootDir, "src"),
    path.join(rootDir, "server"),
    path.join(rootDir, "public")
  ];

  const fileMap: { [relPath: string]: string } = {};

  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
        try {
          const rel = path.relative(rootDir, full);
          fileMap[rel] = fs.readFileSync(full, "utf-8");
        } catch {}
      }
    }
  };

  scanDirs.forEach(walk);
  return fileMap;
};

let lastNgWordsFetch = 0;

export const systemRouter = express.Router();


  systemRouter.get("/site-settings", (req, res) => {
    try {
      const settings = db.prepare("SELECT * FROM site_settings").all() as any[];
      const settingsObj: any = {};
      settings.forEach((s) => {
        settingsObj[s.key] = s.value;
      });
      res.json(settingsObj);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });



  systemRouter.post("/site-settings", authenticateToken, requirePermission('manage_settings'), (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing key or value" });
    }
    try {
      const stmt = db.prepare("INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
      stmt.run(key, String(value));
      res.json({ success: true, key, value });
    } catch (err) {
      res.status(500).json({ error: "Failed to update site settings" });
    }
  });



  systemRouter.get("/db-health", authenticateToken, isAdmin, (req, res) => {
    try {
      const tables = ['users', 'posts', 'notifications', 'reports', 'access_logs', 'action_logs', 'search_logs', 'contacts', 'success_stories', 'ng_words'];
      const tableCounts: any = {};
      
      tables.forEach(table => {
        try {
          const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
          tableCounts[table] = count.count;
        } catch (e) {
          tableCounts[table] = 'Error';
        }
      });

      // Integrity check
      const integrity = db.prepare("PRAGMA integrity_check").get() as any;
      const isHealthy = integrity.integrity_check === 'ok';

      // DB size
      const dbPath = path.join(process.cwd(), 'kizuna.db');
      let sizeBytes = 0;
      if (fs.existsSync(dbPath)) {
        sizeBytes = fs.statSync(dbPath).size;
      }
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';

      res.json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'データベースの整合性は保たれています。すべてのテーブルに正常にアクセス可能です。' : `整合性エラーが検出されました: ${integrity.integrity_check}`,
        tables: tables.length,
        size: sizeMB,
        counts: tableCounts,
        sqliteVersion: db.prepare("SELECT sqlite_version() as version").get().version,
        lastCheck: new Date().toISOString()
      });
    } catch (err) {
      console.error("DB Health Check Error:", err);
      res.status(500).json({ 
        status: 'error',
        message: '診断中にエラーが発生しました。データベースファイルへのアクセス権限または接続を確認してください。',
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // Helper to safely get Git repository information
  const getCurrentGitInfo = () => {
    let branch = 'main';
    let commit = 'unknown';
    let commitHash = 'unknown';
    let commitMessage = '';
    let commitDate = '';
    let commitAuthor = '';
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n')[0];
      commitDate = execSync('git log -1 --pretty=%cd --date=iso', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      commitAuthor = execSync('git log -1 --pretty=%an', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch (e) {
      // Git command fallback
    }
    return { branch, commit, commitHash, commitMessage, commitDate, commitAuthor };
  };

  // System & Git Runtime Info Endpoint


  // System & Git Runtime Info Endpoint
  systemRouter.get("/system/git-info", authenticateToken, isAdmin, (req, res) => {
    try {
      const git = getCurrentGitInfo();
      let appVersion = '1.2.4-RELEASE';
      try {
        const pkgPath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          if (pkg.version) appVersion = `v${pkg.version}`;
        }
      } catch (e) {}

      let dbSizeBytes = 0;
      try {
        const dbPath = path.join(process.cwd(), "kizuna.db");
        if (fs.existsSync(dbPath)) {
          dbSizeBytes = fs.statSync(dbPath).size;
        }
      } catch (e) {}

      let totalSnapshots = 0;
      try {
        const countRow = db.prepare("SELECT count(*) as count FROM system_versions").get() as any;
        totalSnapshots = countRow?.count || 0;
      } catch (e) {}

      res.json({
        ...git,
        appVersion,
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSec: Math.floor(process.uptime()),
        dbSizeBytes,
        totalSnapshots,
        serverTime: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to fetch git & system info:", err);
      res.status(500).json({ error: "Failed to fetch system info" });
    }
  });

  // System Environment & External API Status Endpoint


  // System Environment & External API Status Endpoint
  systemRouter.get("/system/env-status", authenticateToken, isAdmin, (req, res) => {
    try {
      const dbPath = path.join(process.cwd(), "kizuna.db");
      let dbSizeBytes = 0;
      if (fs.existsSync(dbPath)) {
        dbSizeBytes = fs.statSync(dbPath).size;
      }

      res.json({
        gemini: Boolean(process.env.GEMINI_API_KEY),
        stripe: Boolean(process.env.STRIPE_SECRET_KEY),
        resend: Boolean(process.env.RESEND_API_KEY),
        line: Boolean(process.env.LINE_CHANNEL_ID || process.env.LINE_CHANNEL_SECRET),
        google: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET),
        databaseUrl: Boolean(process.env.DATABASE_URL),
        databaseEngine: process.env.DATABASE_URL ? 'PostgreSQL (Cloud SQL / Supabase)' : 'SQLite (better-sqlite3 / kizuna.db)',
        nodeEnv: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        dbSizeBytes,
        serverTime: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to fetch env status:", err);
      res.status(500).json({ error: "Failed to fetch env status" });
    }
  });

  // Database VACUUM & Optimize Endpoint


  // Database VACUUM & Optimize Endpoint
  systemRouter.post("/system/vacuum", authenticateToken, isAdmin, (req: any, res) => {
    try {
      db.exec("VACUUM;");
      db.exec("PRAGMA optimize;");
      
      const dbPath = path.join(process.cwd(), 'kizuna.db');
      let sizeBytes = 0;
      if (fs.existsSync(dbPath)) {
        sizeBytes = fs.statSync(dbPath).size;
      }
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';

      logAction(req.user?.id || 1, "SYSTEM_DB_VACUUM", `Database VACUUM and optimize executed. New size: ${sizeMB}`, req.ip);

      res.json({
        success: true,
        message: "データベースの最適化（VACUUM / PRAGMA optimize）が正常に完了しました。",
        size: sizeMB
      });
    } catch (err) {
      console.error("Database VACUUM error:", err);
      res.status(500).json({ error: "データベースの最適化に失敗しました。" });
    }
  });

  // Version Snapshot History Management


  // Version Snapshot History Management
  systemRouter.get("/versions", authenticateToken, isAdmin, (req, res) => {
    try {
      const backupsDir = path.join(process.cwd(), "backups");
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }
      const versions = db.prepare(`
        SELECT id, filename, comment, size, git_commit, git_branch, created_at as timestamp 
        FROM system_versions 
        ORDER BY id DESC
      `).all();
      res.json(versions);
    } catch (err) {
      console.error("Failed to fetch versions:", err);
      res.status(500).json({ error: "Failed to fetch version history" });
    }
  });



  systemRouter.post("/versions", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const { comment } = req.body;
      const snapshotComment = comment && typeof comment === 'string' && comment.trim() 
        ? comment.trim() 
        : `手動スナップショット (${new Date().toLocaleString('ja-JP')})`;
      
      const backupsDir = path.join(process.cwd(), "backups");
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const filename = `backup_${timestamp}_${Math.random().toString(36).substring(2, 7)}.db`;
      const backupPath = path.join(backupsDir, filename);

      // Perform backup using better-sqlite3 backup or file copy
      if (typeof db.backup === 'function') {
        await db.backup(backupPath);
      } else {
        const sourcePath = path.join(process.cwd(), "kizuna.db");
        fs.copyFileSync(sourcePath, backupPath);
      }

      let size = 0;
      if (fs.existsSync(backupPath)) {
        size = fs.statSync(backupPath).size;
      }

      const git = getCurrentGitInfo();

      const info = db.prepare(`
        INSERT INTO system_versions (filename, comment, size, created_by, git_commit, git_branch, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
      `).run(filename, snapshotComment, size, req.user?.id || null, git.commit !== 'unknown' ? git.commit : null, git.branch || null);

      const newVersion = {
        id: info.lastInsertRowid,
        filename,
        comment: snapshotComment,
        size,
        git_commit: git.commit !== 'unknown' ? git.commit : null,
        git_branch: git.branch || null,
        timestamp: new Date().toISOString()
      };

      logAction(req.user?.id || 1, "VERSION_CREATED", `スナップショット作成: ${snapshotComment} (Git: ${git.commit})`, req.ip);

      res.json({ success: true, version: newVersion });
    } catch (err) {
      console.error("Failed to create version snapshot:", err);
      res.status(500).json({ error: "バージョンの作成に失敗しました: " + (err instanceof Error ? err.message : String(err)) });
    }
  });



  systemRouter.post("/versions/:id/restore", authenticateToken, isAdmin, async (req: any, res) => {
    try {
      const versionId = req.params.id;
      const targetVersion = db.prepare("SELECT * FROM system_versions WHERE id = ?").get(versionId) as any;
      if (!targetVersion) {
        return res.status(404).json({ error: "指定されたバージョンが見つかりません" });
      }

      const backupsDir = path.join(process.cwd(), "backups");
      const backupPath = path.join(backupsDir, targetVersion.filename);
      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ error: "バックアップファイルが存在しません" });
      }

      const mainDbPath = path.join(process.cwd(), "kizuna.db");

      // Auto backup current state before restoring
      try {
        const preRestoreFilename = `pre_restore_${Date.now()}.db`;
        const preRestorePath = path.join(backupsDir, preRestoreFilename);
        if (typeof db.backup === 'function') {
          await db.backup(preRestorePath);
        } else {
          fs.copyFileSync(mainDbPath, preRestorePath);
        }
        const preSize = fs.existsSync(preRestorePath) ? fs.statSync(preRestorePath).size : 0;
        const currentGit = getCurrentGitInfo();
        db.prepare(`
          INSERT INTO system_versions (filename, comment, size, created_by, git_commit, git_branch, created_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        `).run(preRestoreFilename, `復元前自動バックアップ (${targetVersion.comment} への復元直前)`, preSize, req.user?.id || null, currentGit.commit !== 'unknown' ? currentGit.commit : null, currentGit.branch || null);
      } catch (autoBackupErr) {
        console.warn("Pre-restore auto backup warning:", autoBackupErr);
      }

      // Close current db connection
      try {
        db.close();
      } catch (closeErr) {
        console.warn("DB close warning:", closeErr);
      }

      // Replace main DB file with backup
      fs.copyFileSync(backupPath, mainDbPath);

      // Re-open DB
      setDb(new Database(mainDbPath));
      db.pragma("journal_mode = WAL");

      logAction(req.user?.id || 1, "VERSION_RESTORED", `バージョン復元実行: ${targetVersion.comment}`, req.ip);

      res.json({ success: true, message: `バージョン「${targetVersion.comment}」へ正常に復元しました` });
    } catch (err) {
      console.error("Failed to restore version:", err);
      // Attempt recovery of db connection if closed
      try {
        if (!db || !db.open) {
          setDb(new Database("kizuna.db"));
          db.pragma("journal_mode = WAL");
        }
      } catch (reopenErr) {}
      res.status(500).json({ error: "バージョンの復元に失敗しました: " + (err instanceof Error ? err.message : String(err)) });
    }
  });



  systemRouter.delete("/versions/:id", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const versionId = req.params.id;
      const targetVersion = db.prepare("SELECT * FROM system_versions WHERE id = ?").get(versionId) as any;
      if (targetVersion) {
        const backupsDir = path.join(process.cwd(), "backups");
        const backupPath = path.join(backupsDir, targetVersion.filename);
        if (fs.existsSync(backupPath)) {
          try { fs.unlinkSync(backupPath); } catch (e) {}
        }
        db.prepare("DELETE FROM system_versions WHERE id = ?").run(versionId);
        logAction(req.user?.id || 1, "VERSION_DELETED", `バージョン削除: ${targetVersion.comment}`, req.ip);
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete version:", err);
      res.status(500).json({ error: "バージョン履歴の削除に失敗しました" });
    }
  });

  // Download Database Snapshot File (.db)


  // Download Database Snapshot File (.db)
  systemRouter.get("/versions/:id/download", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const versionId = req.params.id;
      const targetVersion = db.prepare("SELECT * FROM system_versions WHERE id = ?").get(versionId) as any;
      if (!targetVersion) {
        return res.status(404).json({ error: "指定されたバージョンが見つかりません" });
      }

      const backupsDir = path.join(process.cwd(), "backups");
      const backupPath = path.join(backupsDir, targetVersion.filename);
      if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ error: "バックアップファイルが存在しません" });
      }

      const safeComment = (targetVersion.comment || 'snapshot').replace(/[^a-zA-Z0-9_\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff-]/g, '_');
      const downloadFilename = `remeets_backup_v${targetVersion.id}_${safeComment}.db`;

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"`);
      res.setHeader('Content-Type', 'application/x-sqlite3');
      const fileStream = fs.createReadStream(backupPath);
      fileStream.pipe(res);
      logAction(req.user?.id || 1, "VERSION_DOWNLOADED", `DBバックアップダウンロード: ${targetVersion.comment}`, req.ip);
    } catch (err) {
      console.error("Failed to download version snapshot:", err);
      res.status(500).json({ error: "ファイルのダウンロードに失敗しました" });
    }
  });

  // Batch Delete Version Snapshots


  // Batch Delete Version Snapshots
  systemRouter.post("/versions/batch-delete", authenticateToken, isAdmin, (req: any, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid request (ids array required)" });
    }
    try {
      const backupsDir = path.join(process.cwd(), "backups");
      let deletedCount = 0;
      for (const id of ids) {
        const targetVersion = db.prepare("SELECT * FROM system_versions WHERE id = ?").get(id) as any;
        if (targetVersion) {
          const backupPath = path.join(backupsDir, targetVersion.filename);
          if (fs.existsSync(backupPath)) {
            try { fs.unlinkSync(backupPath); } catch (e) {}
          }
          db.prepare("DELETE FROM system_versions WHERE id = ?").run(id);
          deletedCount++;
        }
      }
      logAction(req.user?.id || 1, "VERSION_BATCH_DELETED", `${deletedCount}件のバージョン履歴を一括削除`, req.ip);
      res.json({ success: true, count: deletedCount, message: `${deletedCount}件のスナップショットを一括削除しました` });
    } catch (err) {
      console.error("Batch delete versions error:", err);
      res.status(500).json({ error: "一括削除に失敗しました" });
    }
  });



  systemRouter.post("/reset-data", authenticateToken, isAdmin, async (req, res) => {
    try {
      await seedData(true);
      logAction((req as any).user.id, "DATA_RESET", "Sample data reset by admin", req.ip);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to reset data:", err);
      res.status(500).json({ error: "Failed to reset data" });
    }
  });



  // --- 7. 💳 決済トランザクション (Payment Transactions) Clear ---
  systemRouter.post("/payment-transactions/clear-all", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM payment_transactions").run();
      logAction(req.user.id, "PAYMENTS_CLEARED", `Cleared all ${result.changes} payment transactions`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear payment transactions error:", err);
      res.status(500).json({ error: "決済履歴の一括クリアに失敗しました" });
    }
  });

  // --- 8. 📜 アクセスログ & 操作ログ Clear ---


  // --- 8. 📜 アクセスログ & 操作ログ Clear ---
  systemRouter.post("/logs/clear-access", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM access_logs").run();
      logAction(req.user.id, "ACCESS_LOGS_CLEARED", `Cleared all ${result.changes} access logs`, req.ip);
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear access logs error:", err);
      res.status(500).json({ error: "アクセスログの一括クリアに失敗しました" });
    }
  });



  systemRouter.post("/logs/clear-actions", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const result = db.prepare("DELETE FROM action_logs").run();
      res.json({ success: true, count: result.changes });
    } catch (err) {
      console.error("Clear action logs error:", err);
      res.status(500).json({ error: "操作ログの一括クリアに失敗しました" });
    }
  });

  // --- Admin AI Moderation Test & Simulation Endpoints ---


  // --- Page View Logging ---
  systemRouter.post("/page-view", optionalAuthenticateToken, (req, res) => {
    const { path: pagePath } = req.body;
    if (!pagePath) return res.status(400).json({ error: "Path is required" });
    
    try {
      const userId = (req as any).user?.id || null;
      db.prepare("INSERT INTO page_views (path, user_id, ip, user_agent) VALUES (?, ?, ?, ?)")
        .run(pagePath, userId, req.ip, req.get('user-agent'));
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to log page view:", err);
      res.status(500).json({ error: "Failed to log page view" });
    }
  });



  // 1. Get all images with usage detection
  systemRouter.get("/assets/images", authenticateToken, isAdmin, (req: any, res) => {
    try {
      const rootDir = process.cwd();
      const targetDirs = [
        { dir: "src/assets/images", label: "src/assets/images (現行)" },
        { dir: "src/assets/images/archive", label: "src/assets/images/archive (アーカイブ)" },
        { dir: "public", label: "public" }
      ];

      const fileMap = scanImageUsage();
      const imageList: any[] = [];
      let totalBytes = 0;
      let unusedBytes = 0;

      for (const target of targetDirs) {
        const fullDir = path.join(rootDir, target.dir);
        if (!fs.existsSync(fullDir)) continue;

        const entries = fs.readdirSync(fullDir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isFile()) continue;
          const ext = path.extname(entry.name).toLowerCase();
          if (![".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif"].includes(ext)) continue;

          const filePath = path.join(fullDir, entry.name);
          const stat = fs.statSync(filePath);
          const filename = entry.name;
          const baseName = path.basename(filename, ext);

          // Check usage in scanned codebase
          const usedInFiles: string[] = [];
          for (const [relPath, content] of Object.entries(fileMap)) {
            // Ignore self-references in raw files
            if (relPath.includes(filename)) continue;

            if (content.includes(filename) || (baseName.length > 6 && content.includes(baseName))) {
              usedInFiles.push(relPath);
            }
          }

          const isUsed = usedInFiles.length > 0;
          totalBytes += stat.size;
          if (!isUsed) unusedBytes += stat.size;

          imageList.push({
            id: `${target.dir}/${filename}`,
            filename,
            dir: target.dir,
            fullPath: filePath,
            ext,
            sizeBytes: stat.size,
            sizeFormatted: formatBytes(stat.size),
            mtime: stat.mtime.toISOString(),
            isUsed,
            usedInFiles,
            previewUrl: `/api/admin/assets/preview?dir=${encodeURIComponent(target.dir)}&file=${encodeURIComponent(filename)}`
          });
        }
      }

      // Sort: unused first, then by size descending
      imageList.sort((a, b) => {
        if (a.isUsed !== b.isUsed) return a.isUsed ? 1 : -1;
        return b.sizeBytes - a.sizeBytes;
      });

      res.json({
        success: true,
        images: imageList,
        totalCount: imageList.length,
        unusedCount: imageList.filter(i => !i.isUsed).length,
        usedCount: imageList.filter(i => i.isUsed).length,
        totalBytes,
        totalFormatted: formatBytes(totalBytes),
        unusedBytes,
        unusedFormatted: formatBytes(unusedBytes)
      });
    } catch (err) {
      console.error("Fetch asset images error:", err);
      res.status(500).json({ error: "Failed to fetch asset images" });
    }
  });

  // 2. Preview image binary stream


  // 2. Preview image binary stream
  systemRouter.get("/assets/preview", (req: any, res) => {
    try {
      const { dir, file } = req.query;
      if (!dir || !file) return res.status(400).send("Missing parameters");

      // Prevent directory traversal
      const safeDir = path.normalize(String(dir)).replace(/^(\.\.[\/\\])+/, '');
      const safeFile = path.basename(String(file));
      const rootDir = process.cwd();
      const filePath = path.join(rootDir, safeDir, safeFile);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send("Image not found");
      }

      const ext = path.extname(safeFile).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".gif": "image/gif"
      };

      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=86400");
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      console.error("Preview image error:", err);
      res.status(500).send("Internal server error");
    }
  });

  // 3. Delete selected images


  // 3. Delete selected images
  systemRouter.post("/assets/images/delete", authenticateToken, isAdmin, (req: any, res) => {
    const { files } = req.body;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No files specified for deletion" });
    }

    const rootDir = process.cwd();
    const results: { filename: string; success: boolean; error?: string }[] = [];
    let deletedCount = 0;
    let reclaimedBytes = 0;

    for (const item of files) {
      try {
        const safeDir = path.normalize(String(item.dir)).replace(/^(\.\.[\/\\])+/, '');
        const safeFile = path.basename(String(item.filename));
        const filePath = path.join(rootDir, safeDir, safeFile);

        // Security check: only allow deletion in designated directories
        if (!safeDir.startsWith("src/assets/images") && !safeDir.startsWith("public")) {
          results.push({ filename: safeFile, success: false, error: "Unauthorized directory" });
          continue;
        }

        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          fs.unlinkSync(filePath);
          reclaimedBytes += stat.size;
          deletedCount++;
          results.push({ filename: safeFile, success: true });
        } else {
          results.push({ filename: safeFile, success: false, error: "File not found" });
        }
      } catch (e: any) {
        results.push({ filename: item.filename, success: false, error: e.message });
      }
    }

    logAction(
      req.user?.id || 1,
      "ADMIN_DELETE_ASSETS",
      `Deleted ${deletedCount} images (${formatBytes(reclaimedBytes)})`,
      req.ip
    );

    res.json({
      success: true,
      deletedCount,
      reclaimedBytes,
      reclaimedFormatted: formatBytes(reclaimedBytes),
      results
    });
  });



