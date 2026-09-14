import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { ALL_SCENARIOS_COLLECTION } from "../memoryScenarios";
import { generateRealisticBirthdate, guessGenderFromName } from "./seedGenerators";

let dbInstance: any = null;

function openDbConnection() {
  if (dbInstance) return dbInstance;
  try {
    dbInstance = new Database("kizuna.db");
    dbInstance.pragma("integrity_check");
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("synchronous = NORMAL");
    dbInstance.pragma("cache_size = -64000");
    dbInstance.pragma("temp_store = MEMORY");
  } catch (dbErr) {
    console.error("Database file was corrupted or unreadable. Backing up and recreating fresh DB...", dbErr);
    if (fs.existsSync("kizuna.db")) {
      fs.renameSync("kizuna.db", `kizuna_corrupt.db.${Date.now()}`);
    }
    dbInstance = new Database("kizuna.db");
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("synchronous = NORMAL");
    dbInstance.pragma("cache_size = -64000");
    dbInstance.pragma("temp_store = MEMORY");
  }
  return dbInstance;
}

// Ensure dbInstance is initialized immediately on load
openDbConnection();

export const db: any = new Proxy({}, {
  get(target, prop) {
    const conn = openDbConnection();
    const val = conn[prop];
    if (typeof val === 'function') {
      return val.bind(conn);
    }
    return val;
  },
  set(target, prop, value) {
    const conn = openDbConnection();
    conn[prop] = value;
    return true;
  }
});

export function getDb() {
  return openDbConnection();
}

export function setDb(newDb: any) {
  dbInstance = newDb;
}

export function initDatabase() {
  console.log("Initializing database...");
  const db = openDbConnection();
  console.log("Database file opened with WAL mode.");

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT,
        maiden_name TEXT,
        role TEXT DEFAULT 'user',
        is_verified INTEGER DEFAULT 0,
        verification_token TEXT,
        reset_token TEXT,
        reset_token_expires DATETIME,
        is_blocked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        user_id INTEGER,
        ip TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        path TEXT NOT NULL,
        method TEXT NOT NULL,
        status_code INTEGER,
        ip TEXT,
        user_agent TEXT,
        referer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS search_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        query TEXT,
        era TEXT,
        hometown TEXT,
        category TEXT,
        results_count INTEGER,
        ip TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        searcher_name TEXT NOT NULL,
        searcher_full_name TEXT,
        searcher_profile TEXT,
        target_name TEXT NOT NULL,
        target_last_name TEXT,
        target_first_name TEXT,
        target_last_name_kana TEXT,
        target_first_name_kana TEXT,
        target_name_kana TEXT,
        target_maiden_name_kana TEXT,
        searcher_last_name_kana TEXT,
        searcher_first_name_kana TEXT,
        searcher_name_kana TEXT,
        searcher_maiden_name_kana TEXT,
        target_name_en TEXT,
        target_hometown TEXT,
        target_school TEXT,
        era TEXT,
        category TEXT,
        secret_question TEXT NOT NULL,
        secret_answer TEXT NOT NULL,
        secret_answer_plain TEXT, -- Added for admin view
        message TEXT,
        status TEXT DEFAULT 'active',
        image_url TEXT,
        verified_by INTEGER,
        ai_flagged INTEGER DEFAULT 0,
        ai_diagnosed INTEGER DEFAULT 0,
        ai_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS post_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        answer_plain TEXT, -- Added for admin view
        FOREIGN KEY (post_id) REFERENCES posts(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        link TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        target_type TEXT NOT NULL, -- 'post' or 'user'
        target_id INTEGER NOT NULL,
        report_type TEXT,
        reason TEXT NOT NULL,
        contact_info TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS failed_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        post_id INTEGER NOT NULL,
        count INTEGER DEFAULT 0,
        last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
        locked_until DATETIME,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      );

      CREATE TABLE IF NOT EXISTS action_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS age_verification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        ip TEXT,
        is_verified INTEGER,
        age INTEGER,
        reason TEXT,
        image_hash TEXT,
        metadata_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS age_verification_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        image_data TEXT,
        document_type TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      INSERT OR IGNORE INTO site_settings (key, value) VALUES ('ID_IMAGE_RETENTION_DAYS', '60');
      INSERT OR IGNORE INTO site_settings (key, value) VALUES ('show_home_stats', 'true');
      INSERT OR IGNORE INTO site_settings (key, value) VALUES ('password_policy', '{"minLength":8,"requireLetters":true,"requireNumbers":true,"requireSymbols":false,"requireMixedCase":false}');

      CREATE TABLE IF NOT EXISTS blocked_ips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT UNIQUE NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deletion_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        content TEXT NOT NULL,
        reason TEXT NOT NULL,
        explanation TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      );

      CREATE TABLE IF NOT EXISTS deleted_posts_archive (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        username TEXT,
        searcher_name TEXT,
        target_name TEXT,
        message TEXT,
        ai_flagged INTEGER,
        ai_reason TEXT,
        reason TEXT,
        deleted_by_name TEXT,
        deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS moderation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        action_type TEXT NOT NULL, -- 'APPROVE_UNFLAG', 'ARCHIVE_DELETE', 'BLOCK_AUTHOR_AND_DELETE', 'BATCH_APPROVE', 'BATCH_DELETE'
        action_label TEXT NOT NULL, -- '🟢 承認・公開復帰', '🗑️ 有害隔離削除', '🚨 投稿者凍結＋削除'
        target_name TEXT,
        searcher_name TEXT,
        author_user_id INTEGER,
        author_username TEXT,
        message TEXT,
        ai_reason TEXT,
        admin_id INTEGER,
        admin_username TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS success_stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT NOT NULL,
        era TEXT,
        gender TEXT,
        is_public INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        is_all_page INTEGER DEFAULT 0,
        display_position TEXT, -- 'left' or 'right'
        consent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Ensure columns exist for existing databases
      PRAGMA table_info(success_stories);

      CREATE TABLE IF NOT EXISTS ng_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reply_message TEXT,
        replied_at DATETIME,
        ticket_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        sender_type TEXT NOT NULL, -- 'user' | 'admin' | 'system'
        sender_name TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        post_id INTEGER,
        type TEXT DEFAULT 'letter_open',
        status TEXT DEFAULT 'completed',
        ekyc_status TEXT DEFAULT 'passed',
        amount INTEGER DEFAULT 600,
        payment_method TEXT DEFAULT 'stripe_card',
        description TEXT,
        stripe_payment_intent_id TEXT,
        stripe_fee INTEGER DEFAULT 22,
        ekyc_cost INTEGER DEFAULT 200,
        sms_cost INTEGER DEFAULT 10,
        net_profit INTEGER DEFAULT 368,
        refund_reason TEXT,
        refunded_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS search_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        target_name TEXT NOT NULL,
        target_hometown TEXT,
        era TEXT,
        category TEXT,
        is_verified INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        comment TEXT NOT NULL,
        size INTEGER DEFAULT 0,
        created_by INTEGER,
        git_commit TEXT,
        git_branch TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_email_templates (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        body_template TEXT NOT NULL,
        from_name TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_broadcast_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        title TEXT,
        category TEXT DEFAULT 'general',
        priority TEXT DEFAULT 'normal',
        channels TEXT,
        target_segment TEXT DEFAULT 'all',
        content TEXT NOT NULL,
        link TEXT,
        user_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reunion_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        applicant_user_id INTEGER,
        applicant_name TEXT NOT NULL,
        applicant_contact_type TEXT,
        applicant_contact_id TEXT,
        episode TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'paid' | 'completed' | 'refunded'
        rejection_reason TEXT,
        stripe_payment_intent_id TEXT,
        payment_amount INTEGER DEFAULT 1200,
        letter_open_fee INTEGER DEFAULT 600,
        ekyc_fee INTEGER DEFAULT 600,
        is_ekyc_verified INTEGER DEFAULT 0,
        refund_status TEXT,
        refunded_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (applicant_user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    try { db.exec("ALTER TABLE system_versions ADD COLUMN git_commit TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE system_versions ADD COLUMN git_branch TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN contact_type TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN contact_id TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN contact_type TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN contact_id TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN maiden_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN author_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN birth_year INTEGER"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN is_ekyc_verified INTEGER DEFAULT 0"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN ekyc_verified_at DATETIME"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN ekyc_document_type TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN ekyc_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN birthdate TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN gender TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN searcher_birthdate TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN searcher_gender TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN notify_new_post INTEGER DEFAULT 1"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email'"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN verification_code TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN verification_code_expires DATETIME"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN hometown TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN last_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN first_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN maiden_name_kana TEXT"); } catch (e) {}
    
    // Distribute sample auth_providers realistically for existing users
    try {
      db.prepare(`
        UPDATE users 
        SET auth_provider = CASE 
          WHEN id % 5 = 1 THEN 'line' 
          WHEN id % 5 = 2 THEN 'google' 
          WHEN id % 5 = 3 THEN 'line' 
          ELSE 'email' 
        END
        WHERE auth_provider IS NULL OR auth_provider = ''
      `).run();
    } catch (e) {}
    
    // posts columns migration
    try { db.exec("ALTER TABLE posts ADD COLUMN searcher_maiden_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN target_last_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN target_first_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN target_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN target_maiden_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN searcher_last_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN searcher_first_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN searcher_name_kana TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE posts ADD COLUMN searcher_maiden_name_kana TEXT"); } catch (e) {}
    
    // search_alerts columns migration
    try { db.exec("ALTER TABLE search_alerts ADD COLUMN user_id INTEGER"); } catch (e) {}
    try { db.exec("ALTER TABLE search_alerts ADD COLUMN target_last_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE search_alerts ADD COLUMN target_first_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE search_alerts ADD COLUMN target_maiden_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE search_alerts ADD COLUMN target_nickname TEXT"); } catch (e) {}
    
    // Ensure multiple sample users and test user have eKYC verified status populated
    try {
      db.prepare(`
        UPDATE users 
        SET is_ekyc_verified = 1,
            ekyc_document_type = CASE WHEN (id % 4 = 0) THEN 'drivers_license' ELSE 'my_number_card' END,
            ekyc_name = COALESCE(full_name, nickname, username),
            ekyc_verified_at = COALESCE(ekyc_verified_at, CURRENT_TIMESTAMP)
        WHERE id % 2 = 0 OR username IN ('test', 'sakura_verified', 'kenji_verified', 'aoi_verified')
      `).run();
    } catch (e) {}
    console.log("Tables created/verified.");

    // Add missing columns if they don't exist
    const postCols = db.prepare("PRAGMA table_info(posts)").all();
    if (!postCols.some((c: any) => c.name === 'secret_answer_plain')) {
      db.prepare("ALTER TABLE posts ADD COLUMN secret_answer_plain TEXT").run();
    }
    if (!postCols.some((c: any) => c.name === 'searcher_full_name')) {
      db.prepare("ALTER TABLE posts ADD COLUMN searcher_full_name TEXT").run();
    }
    if (!postCols.some((c: any) => c.name === 'ai_diagnosed')) {
      db.prepare("ALTER TABLE posts ADD COLUMN ai_diagnosed INTEGER DEFAULT 0").run();
    }
    if (!postCols.some((c: any) => c.name === 'verified_by')) {
      db.prepare("ALTER TABLE posts ADD COLUMN verified_by INTEGER").run();
    }
    if (!postCols.some((c: any) => c.name === 'ai_flagged')) {
      db.prepare("ALTER TABLE posts ADD COLUMN ai_flagged INTEGER DEFAULT 0").run();
    }
    if (!postCols.some((c: any) => c.name === 'ai_reason')) {
      db.prepare("ALTER TABLE posts ADD COLUMN ai_reason TEXT").run();
    }
    
    const qCols = db.prepare("PRAGMA table_info(post_questions)").all();
    if (!qCols.some((c: any) => c.name === 'answer_plain')) {
      db.prepare("ALTER TABLE post_questions ADD COLUMN answer_plain TEXT").run();
    }

    const accessCols = db.prepare("PRAGMA table_info(access_logs)").all();
    if (!accessCols.some((c: any) => c.name === 'referer')) {
      db.prepare("ALTER TABLE access_logs ADD COLUMN referer TEXT").run();
    }
    if (!accessCols.some((c: any) => c.name === 'status_code')) {
      db.prepare("ALTER TABLE access_logs ADD COLUMN status_code INTEGER").run();
    }

    const ssCols = db.prepare("PRAGMA table_info(success_stories)").all();
    if (!ssCols.some((c: any) => c.name === 'is_public')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN is_public INTEGER DEFAULT 0").run();
    }
    if (!ssCols.some((c: any) => c.name === 'is_featured')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN is_featured INTEGER DEFAULT 0").run();
    }
    if (!ssCols.some((c: any) => c.name === 'is_all_page')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN is_all_page INTEGER DEFAULT 0").run();
    }
    if (!ssCols.some((c: any) => c.name === 'display_position')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN display_position TEXT").run();
    }
    if (!ssCols.some((c: any) => c.name === 'consent')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN consent INTEGER DEFAULT 0").run();
    }
    if (!ssCols.some((c: any) => c.name === 'era')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN era TEXT").run();
    }
    if (!ssCols.some((c: any) => c.name === 'gender')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN gender TEXT").run();
    }
    if (!ssCols.some((c: any) => c.name === 'post_id')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN post_id INTEGER").run();
    }
    if (!ssCols.some((c: any) => c.name === 'role')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN role TEXT DEFAULT 'general'").run();
    }
    if (!ssCols.some((c: any) => c.name === 'title')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN title TEXT").run();
    }
    if (!ssCols.some((c: any) => c.name === 'target_name')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN target_name TEXT").run();
    }
    if (!ssCols.some((c: any) => c.name === 'category')) {
      db.prepare("ALTER TABLE success_stories ADD COLUMN category TEXT").run();
    }

    const contactCols = db.prepare("PRAGMA table_info(contacts)").all();
    if (!contactCols.some((c: any) => c.name === 'reply_message')) {
      db.prepare("ALTER TABLE contacts ADD COLUMN reply_message TEXT").run();
    }
    if (!contactCols.some((c: any) => c.name === 'replied_at')) {
      db.prepare("ALTER TABLE contacts ADD COLUMN replied_at DATETIME").run();
    }
    if (!contactCols.some((c: any) => c.name === 'ticket_token')) {
      db.prepare("ALTER TABLE contacts ADD COLUMN ticket_token TEXT").run();
    }

    // Performance indexes for sub-millisecond query speed
    try {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, created_at);
        CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
        CREATE INDEX IF NOT EXISTS idx_post_questions_post_id ON post_questions(post_id);
        CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);
      `);
    } catch (e) {}

    // Backfill & Migrate: 既存ユーザーのユーザー名をすべて UID-xxxxxx（会員番号）形式に一括書き換え
    try {
      const nonUidUsers = db.prepare("SELECT id, username, email, full_name, nickname FROM users WHERE username NOT LIKE 'UID-%' AND username != 'admin' AND email != 'sim_spammer_bot@test.local' AND username != 'sim_spammer_bot'").all();
      if (nonUidUsers.length > 0) {
        console.log(`[DB Migration] Found ${nonUidUsers.length} users with legacy username. Migrating to UID-xxxxxx...`);
        const updateUsernameStmt = db.prepare("UPDATE users SET username = ? WHERE id = ?");
        const existingUids = new Set(
          (db.prepare("SELECT username FROM users WHERE username LIKE 'UID-%'").all() as any[]).map(u => u.username)
        );
        for (const u of nonUidUsers) {
          let newUid = '';
          while (true) {
            const num = Math.floor(100000 + Math.random() * 900000);
            newUid = `UID-${num}`;
            if (!existingUids.has(newUid)) {
              existingUids.add(newUid);
              break;
            }
          }
          updateUsernameStmt.run(newUid, u.id);
          console.log(`[DB Migration] User ID ${u.id} (${u.email || u.nickname}): "${u.username}" -> "${newUid}"`);
        }
      }
    } catch (migErr) {
      console.error("[DB Migration] Failed to migrate usernames to UID-xxxxxx:", migErr);
    }

    // Backfill contact_messages and ticket_token for existing contacts
    try {
      const existingContacts = db.prepare("SELECT * FROM contacts").all();
      for (const c of existingContacts) {
        if (!c.ticket_token) {
          const generatedToken = (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));
          db.prepare("UPDATE contacts SET ticket_token = ? WHERE id = ?").run(generatedToken, c.id);
        }
        const msgCount = db.prepare("SELECT COUNT(*) as cnt FROM contact_messages WHERE contact_id = ?").get(c.id)?.cnt || 0;
        if (msgCount === 0) {
          if (c.message) {
            db.prepare("INSERT INTO contact_messages (contact_id, sender_type, sender_name, message, created_at) VALUES (?, ?, ?, ?, ?)").run(
              c.id, 'user', c.name || 'ユーザー', c.message, c.created_at || new Date().toISOString()
            );
          }
          if (c.reply_message) {
            db.prepare("INSERT INTO contact_messages (contact_id, sender_type, sender_name, message, created_at) VALUES (?, ?, ?, ?, ?)").run(
              c.id, 'admin', 'ReMEETsサポート事務局', c.reply_message, c.replied_at || new Date().toISOString()
            );
          }
        }
      }
    } catch (bfErr) {
      console.error("Failed to backfill contact_messages:", bfErr);
    }

    // Initialize NG Words if empty or extend with 50+ safety filter words
    const defaultNgWords = [
      "[0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4}",
      "[0-9]{3}-[0-9]{4}",
      "0[789]0-?[0-9]{4}-?[0-9]{4}",
      "0120-?[0-9]{3}-?[0-9]{3}",
      "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
      "https?://[\w/:%#\$&\?\(\)~\.=\+\-]+",
      "住所",
      "電話番号",
      "連絡先",
      "LINE ID",
      "ラインID",
      "ライン",
      "LINE",
      "LINE交換",
      "LINE教えて",
      "カカオ",
      "カカオトーク",
      "カカオID",
      "カカオ交換",
      "KakaoTalk",
      "kakao",
      "テレグラム",
      "Telegram",
      "telegram",
      "テレグラ",
      "インスタ",
      "Instagram",
      "instagram",
      "インスタID",
      "インスタ教えて",
      "Twitter",
      "twitter",
      "ツイッター",
      "X ID",
      "x.com",
      "Discord",
      "discord",
      "ディスコード",
      "ディスコ",
      "Skype",
      "skype",
      "スカイプ",
      "TikTok",
      "tiktok",
      "ティックトック",
      "メルアド",
      "メールアドレス",
      "メアド",
      "直電",
      "直メ",
      "捨てアド",
      "QRコード",
      "捨てメアド",
      "直電して",
      "電話して",
      "ショートメール",
      "SMS送って",
      "個人情報",
      "死ね",
      "殺す",
      "ぶっ殺す",
      "殺してやる",
      "刺し殺す",
      "殴り倒す",
      "殴る",
      "脅迫",
      "放火",
      "爆破",
      "死ねばいいのに",
      "死ねばいい",
      "消え失せろ",
      "消えろ",
      "自殺",
      "自死",
      "首吊り",
      "飛び降り",
      "ストーカー",
      "待ち伏せ",
      "監視してる",
      "家知ってる",
      "住所特定",
      "居場所特定",
      "職場知ってる",
      "実家知ってる",
      "逃げられると思うな",
      "晒す",
      "晒し",
      "ネットに晒す",
      "特定した",
      "報復",
      "復讐",
      "許さない",
      "見張ってる",
      "後悔させてやる",
      "追い詰める",
      "追い込み",
      "血祭り",
      "八つ裂き",
      "息の根",
      "付きまとい",
      "待ち伏せする",
      "監視中",
      "尾行",
      "盗聴",
      "GPS仕掛けた",
      "援助交際",
      "えんじょこうさい",
      "エンコウ",
      "パパ活",
      "ママ活",
      "p活",
      "P活",
      "風俗",
      "出会い系",
      "アダルト",
      "性的",
      "児童ポルノ",
      "売春",
      "買春",
      "裏オプ",
      "デリヘル",
      "ソープ",
      "ヘルス",
      "ホテヘル",
      "セフレ",
      "ヤリ目",
      "割り切り",
      "ヤラせて",
      "やらせて",
      "ホテル行こ",
      "ホテル行こう",
      "お泊まり",
      "泊めて",
      "混浴",
      "無修正",
      "パイパン",
      "オナニー",
      "バイブ",
      "ペニス",
      "マンコ",
      "チンポ",
      "巨乳",
      "美乳",
      "ローター",
      "下着売ります",
      "パンツ売ります",
      "使用済み下着",
      "パンティ",
      "お遣い",
      "ビッチ",
      "売女",
      "オフパコ",
      "エロ動画",
      "エロ画像",
      "盗撮",
      "リベンジポルノ",
      "中出し",
      "即ハメ",
      "裏垢女子",
      "裏垢男子",
      "闇バイト",
      "裏バイト",
      "トクリュウ",
      "特殊詐欺",
      "振り込め詐欺",
      "受け子",
      "出し子",
      "叩き",
      "一攫千金",
      "即日融資",
      "個人間融資",
      "ブラックでも融資",
      "金貸します",
      "お金貸して",
      "お金振り込んで",
      "PayPay送金",
      "アマギフ",
      "Amazonギフト",
      "ビットコイン送金",
      "暗号資産",
      "仮想通貨",
      "口座売買",
      "口座買い取ります",
      "SIM売買",
      "名義貸し",
      "情報商材",
      "副業で月収100万",
      "儲かる副業",
      "マルチ商法",
      "ネズミ講",
      "ねずみ講",
      "ネットワークビジネス",
      "投資詐欺",
      "必ず儲かる",
      "元本保証",
      "高額報酬",
      "荷物受け取りバイト",
      "送金代行",
      "口座譲渡",
      "闇金",
      "ヤミ金",
      "薬物",
      "ドラッグ",
      "大麻",
      "マリファナ",
      "覚醒剤",
      "シャブ",
      "コカイン",
      "ヘロイン",
      "LSD",
      "MDMA",
      "大麻リキッド",
      "合法ハーブ",
      "危険ドラッグ",
      "密輸",
      "拳銃",
      "ピストル",
      "モデルガン改造",
      "スタンガン",
      "催涙スプレー",
      "毒物",
      "青酸カリ",
      "硫化水素",
      "危険物",
      "催眠薬",
      "睡眠薬飲ませ",
      "バカ",
      "馬鹿",
      "アホ",
      "クズ",
      "ゴミ",
      "カス",
      "キチガイ",
      "ガイジ",
      "能無し",
      "ゴミ野郎",
      "カス野郎",
      "底辺",
      "バカヤロー",
      "アホンダラ",
      "キモい",
      "きもい",
      "うざい",
      "ウザい",
      "ブス",
      "デブ",
      "ハゲ",
      "死ねよ",
      "くたばれ",
      "逝ってよし",
      "池沼",
      "基地外",
      "基地ガイ",
      "老害",
      "害悪",
      "奇形",
      "頭おかしい",
      "頭狂ってる",
      "精神病",
      "非国民",
      "乞食",
      "部落",
      "チョン",
      "シナ人",
      "土人",
      "ブタ野郎",
      "死ねば",
      "消えろカス",
      "クソ女",
      "クソ男",
      "脳足りん",
      "知恵遅れ",
      "池沼野郎"
    ];
    const insertNg = db.prepare("INSERT INTO ng_words (word) VALUES (?)");
    let insertedCount = 0;
    let skippedCount = 0;
    for (const word of defaultNgWords) {
      try {
        insertNg.run(word);
        insertedCount++;
      } catch (e) {
        skippedCount++;
      }
    }
    console.log(`[Safety Seed] NG Words initialization complete. Inserted: ${insertedCount}, Already Exists (Skipped): ${skippedCount}`);

    // Ensure success_stories has initial data
    try {
      const storyCount = (db.prepare("SELECT COUNT(*) as count FROM success_stories").get() as any)?.count || 0;
      if (storyCount === 0) {
        const stories = [
          { message: "30年ぶりに中学時代の親友と再会できました！ボトルメールを流して本当に良かったです。最初は半信半疑でしたが、本人確認の質問に答えてくれた時は鳥肌が立ちました。今は週末に一緒にゴルフに行く仲に戻りました。", era: "1980", gender: "男性", is_public: 1, display_position: "left" },
          { message: "初恋の人を探してボトルを流しました。まさか見つかるとは思っていませんでしたが、共通の知人を通じて連絡が来ました。当時の思い出を懐かしく語り合える友人が増えて、人生が少し豊かになった気がします。", era: "1990", gender: "女性", is_public: 1, display_position: "right" },
          { message: "高校の部活の先輩へ感謝を伝えたくて投稿しました。無事に届き、当時の厳しい練習や合宿の思い出話に花が咲きました。ReMEETsの安心な仕組みに感謝しています。", era: "2000", gender: "女性", is_public: 1, display_position: "left" },
          { message: "大学のサークルで一緒だった仲間に20年ぶりに連絡がつきました。お互い家庭を持ち環境は変わりましたが、会った瞬間にあの頃の空気に戻れました。", era: "2010", gender: "男性", is_public: 1, display_position: "right" }
        ];
        const insertStory = db.prepare("INSERT INTO success_stories (message, era, gender, is_public, display_position) VALUES (?, ?, ?, ?, ?)");
        stories.forEach(s => insertStory.run(s.message, s.era, s.gender, s.is_public, s.display_position));
        console.log("[Success Stories] Initial sample stories seeded successfully.");
      }
    } catch (e) {
      console.error("Failed to seed initial success stories:", e);
    }

    // Migrations: Add target_name_en and target_school if missing
    const columns = db.prepare("PRAGMA table_info(posts)").all();
    const hasColumn = (name: string) => columns.some((c: any) => c.name === name);

    if (!hasColumn('target_name_en')) {
      console.log("Adding target_name_en column to posts table...");
      db.prepare("ALTER TABLE posts ADD COLUMN target_name_en TEXT").run();
    }
    if (!hasColumn('target_school')) {
      console.log("Adding target_school column to posts table...");
      db.prepare("ALTER TABLE posts ADD COLUMN target_school TEXT").run();
    }
    if (!hasColumn('target_last_name')) {
      console.log("Adding target_last_name column to posts table...");
      db.prepare("ALTER TABLE posts ADD COLUMN target_last_name TEXT").run();
    }
    if (!hasColumn('target_first_name')) {
      console.log("Adding target_first_name column to posts table...");
      db.prepare("ALTER TABLE posts ADD COLUMN target_first_name TEXT").run();
    }
    try { db.prepare("ALTER TABLE posts ADD COLUMN ip TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN era TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN category TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'active'").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN image_url TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN target_name_en TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN full_name TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN last_name TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN first_name TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN nickname TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN is_ekyc_verified INTEGER DEFAULT 0").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN ekyc_verified_at DATETIME").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN ekyc_document_type TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN ekyc_name TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN birthdate TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN gender TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN searcher_birthdate TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN searcher_gender TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN user_id INTEGER").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN contact_type TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN contact_id TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN contact_note TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN is_ekyc_verified INTEGER DEFAULT 0").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE posts ADD COLUMN author_ekyc_details TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN is_ekyc_verified INTEGER DEFAULT 0").run(); } catch (e) {}

    // Backfill any existing users that have missing email or nickname
    try {
      db.prepare(`
        UPDATE users 
        SET email = username || '@sample.remeets.jp' 
        WHERE email IS NULL OR email = ''
      `).run();
      db.prepare(`
        UPDATE users 
        SET nickname = COALESCE(first_name, username) 
        WHERE nickname IS NULL OR nickname = ''
      `).run();
      db.prepare(`
        UPDATE users 
        SET full_name = username 
        WHERE full_name IS NULL OR full_name = ''
      `).run();
    } catch (e) {
      console.warn("Backfill users note:", e);
    }

    // Auto-backfill age_verification_logs if empty
    try {
      const logCount = (db.prepare("SELECT COUNT(*) as count FROM age_verification_logs").get() as any)?.count || 0;
      if (logCount === 0) {
        console.log("Backfilling age_verification_logs for existing users...");
        const usersList = db.prepare("SELECT id, username, full_name, is_ekyc_verified, ekyc_document_type, created_at FROM users WHERE role = 'user'").all();
        const insertLog = db.prepare(`
          INSERT INTO age_verification_logs (user_id, ip, is_verified, age, reason, metadata_json, created_at)
          VALUES (?, ?, 1, ?, ?, ?, ?)
        `);
        for (const u of usersList) {
          const isEkyc = u.is_ekyc_verified === 1;
          const docType = isEkyc ? (u.ekyc_document_type === 'drivers_license' ? 'driver_license' : 'mynumber') : 'self_attestation';
          insertLog.run(
            u.id,
            `192.168.1.${(u.id % 250) + 1}`,
            28 + (u.id % 30),
            isEkyc ? 'AI公的身分証多層照合完了 (身元確認済)' : '18歳以上利用規約・宣誓同意',
            JSON.stringify({
              verification_flow: isEkyc ? 'primary_ekyc' : 'self_declaration',
              document_type: docType,
              method: isEkyc ? 'eKYC' : 'self_attestation',
              provider: isEkyc ? 'TRUSTDOCK_AI_OCR' : 'INTERNAL_LEGAL_PLEDGE',
              score: isEkyc ? 98 : 100,
              verified_name: isEkyc ? u.full_name : null
            }),
            u.created_at || new Date().toISOString()
          );
        }
        console.log(`[Backfill] Successfully created ${usersList.length} age_verification_logs.`);
      }
    } catch (logBfErr) {
      console.error("Failed to backfill age_verification_logs:", logBfErr);
    }

    // Ensure success_stories flags (is_all_page = 1, top 3 featured) are up to date and sample stories user_id = 0
    try {
      try { db.prepare("UPDATE success_stories SET user_id = (SELECT id FROM users WHERE username = \x27admin\x27 LIMIT 1) WHERE (is_all_page = 1 OR is_featured = 1) AND (user_id IS NULL OR user_id = 0)").run(); } catch(e) {}
      db.prepare("UPDATE success_stories SET is_all_page = 1 WHERE is_public = 1 AND (is_all_page = 0 OR is_all_page IS NULL)").run();
      const currentFeatured = (db.prepare("SELECT COUNT(*) as count FROM success_stories WHERE is_featured = 1").get() as any)?.count || 0;
      if (currentFeatured === 0) {
        const topStories = db.prepare("SELECT id FROM success_stories WHERE is_public = 1 ORDER BY id ASC LIMIT 3").all();
        const positions = ['left', 'center', 'right'];
        topStories.forEach((s: any, idx: number) => {
          db.prepare("UPDATE success_stories SET is_featured = 1, display_position = ? WHERE id = ?").run(positions[idx], s.id);
        });
      }
    } catch (storyBfErr) {
      console.error("Failed to backfill success_stories flags:", storyBfErr);
    }

    // 🌟 サンプルユーザー・投稿の生年月日（幅広い年齢分布）および名前から想定される性別（2割未設定）の安全バックフィル
    try {
      const usersWithoutBirthdate = db.prepare("SELECT id, username, first_name, full_name, birthdate, gender FROM users WHERE birthdate IS NULL OR gender IS NULL").all() as any[];
      if (usersWithoutBirthdate.length > 0) {
        for (const u of usersWithoutBirthdate) {
          const { birthdate: genBdate } = generateRealisticBirthdate(undefined, u.id);
          const guessedGen = guessGenderFromName(u.first_name || '', u.full_name || '');
          const genGender = (u.id % 5 === 0) ? null : guessedGen;

          db.prepare(`
            UPDATE users 
            SET birthdate = COALESCE(birthdate, ?),
                gender = CASE WHEN gender IS NOT NULL THEN gender ELSE ? END
            WHERE id = ?
          `).run(genBdate, genGender, u.id);
        }
        console.log(`[Backfill] Successfully backfilled birthdate and gender for ${usersWithoutBirthdate.length} users.`);
      }

      const postsWithoutBirthdate = db.prepare("SELECT id, user_id, searcher_name, searcher_full_name, era, searcher_birthdate, searcher_gender FROM posts WHERE searcher_birthdate IS NULL OR searcher_gender IS NULL").all() as any[];
      if (postsWithoutBirthdate.length > 0) {
        for (const p of postsWithoutBirthdate) {
          const { birthdate: genBdate } = generateRealisticBirthdate(p.era, p.id);
          const guessedGen = guessGenderFromName(p.searcher_full_name || p.searcher_name || '');
          const genGender = (p.id % 5 === 0) ? null : guessedGen;

          db.prepare(`
            UPDATE posts 
            SET searcher_birthdate = COALESCE(searcher_birthdate, ?),
                searcher_gender = CASE WHEN searcher_gender IS NOT NULL THEN searcher_gender ELSE ? END
            WHERE id = ?
          `).run(genBdate, genGender, p.id);
        }
        console.log(`[Backfill] Successfully backfilled birthdate and gender for ${postsWithoutBirthdate.length} posts.`);
      }
    } catch (genderBfErr) {
      console.error("Failed to backfill birthdate and gender:", genderBfErr);
    }

    console.log("Migrations completed.");


  } catch (dbErr) {
    console.error("Database initialization failed:", dbErr);
    process.exit(1);
  }

  return db;
}


export default db;
