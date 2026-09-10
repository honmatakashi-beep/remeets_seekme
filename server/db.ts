import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { ALL_SCENARIOS_COLLECTION } from "./memoryScenarios";

export let db: any;

export function getDb() {
  return db;
}

export function setDb(newDb: any) {
  db = newDb;
}

export function initDatabase() {
  console.log("Initializing database...");
  try {
    db = new Database("kizuna.db");
    db.pragma("integrity_check");
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = -64000");
    db.pragma("temp_store = MEMORY");
  } catch (dbErr) {
    console.error("Database file was corrupted or unreadable. Backing up and recreating fresh DB...", dbErr);
    if (fs.existsSync("kizuna.db")) {
      fs.renameSync("kizuna.db", `kizuna_corrupt.db.${Date.now()}`);
    }
    db = new Database("kizuna.db");
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = -64000");
    db.pragma("temp_store = MEMORY");
  }
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
    `);
    try { db.exec("ALTER TABLE system_versions ADD COLUMN git_commit TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE system_versions ADD COLUMN git_branch TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN contact_type TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN contact_id TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN is_ekyc_verified INTEGER DEFAULT 0"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN ekyc_verified_at DATETIME"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN ekyc_document_type TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN ekyc_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN maiden_name TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN birthdate TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN notify_new_post INTEGER DEFAULT 1"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email'"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN verification_code TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN verification_code_expires DATETIME"); } catch (e) {}
    
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
    try { db.prepare("ALTER TABLE users ADD COLUMN maiden_name TEXT").run(); } catch (e) {}
    try { db.prepare("ALTER TABLE users ADD COLUMN birthdate TEXT").run(); } catch (e) {}
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
      db.prepare("UPDATE success_stories SET user_id = 0 WHERE is_all_page = 1 OR is_featured = 1").run();
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

    console.log("Migrations completed.");


  } catch (dbErr) {
    console.error("Database initialization failed:", dbErr);
    process.exit(1);
  }

  return db;
}

export const seedData = async (force: boolean = false) => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Ensure admin exists
  const admin = db.prepare("SELECT * FROM users WHERE username = 'admin' OR email = 'admin@adomin.jp'").get() as any;
  const newAdminPassword = await bcrypt.hash("123", 10);
  if (!admin) {
    console.log("Creating admin user...");
    db.prepare(`
      INSERT INTO users (username, email, password, role, is_verified, full_name, last_name, first_name, nickname) 
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
    `).run("admin", "admin@adomin.jp", newAdminPassword, "super_admin", "東北 太郎", "東北", "太郎", "かりん");
  } else {
    console.log("Updating admin password and ensuring super_admin role...");
    db.prepare(`
      UPDATE users 
      SET username = 'admin', password = ?, email = 'admin@adomin.jp', role = 'super_admin', is_verified = 1, full_name = ?, last_name = ?, first_name = ?, nickname = ? 
      WHERE id = ?
    `).run(newAdminPassword, "東北 太郎", "東北", "太郎", "かりん", admin.id);
  }

  // Ensure multi-role staff accounts exist
  const staffUsers = [
    { username: 'moderator_staff', email: 'moderator@remeets.jp', role: 'moderator', full_name: '佐藤 衛', last_name: '佐藤', first_name: '衛', nickname: 'まもる' },
    { username: 'cs_staff', email: 'cs@remeets.jp', role: 'cs_support', full_name: '鈴木 花子', last_name: '鈴木', first_name: '花子', nickname: 'ハナ' },
    { username: 'auditor_staff', email: 'auditor@remeets.jp', role: 'auditor', full_name: '田中 律子', last_name: '田中', first_name: '律子', nickname: 'リツコ' },
  ];

  for (const staff of staffUsers) {
    const existing = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(staff.username, staff.email) as any;
    if (!existing) {
      db.prepare(`
        INSERT INTO users (username, email, password, role, is_verified, full_name, last_name, first_name, nickname)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
      `).run(staff.username, staff.email, newAdminPassword, staff.role, staff.full_name, staff.last_name, staff.first_name, staff.nickname);
    } else {
      db.prepare(`
        UPDATE users SET password = ?, email = ?, role = ?, is_verified = 1, full_name = ?, last_name = ?, first_name = ?, nickname = ?
        WHERE id = ?
      `).run(newAdminPassword, staff.email, staff.role, staff.full_name, staff.last_name, staff.first_name, staff.nickname, existing.id);
    }
  }

  // Ensure test user exists (eKYC Verified)
  const testUser = db.prepare("SELECT * FROM users WHERE username = 'test' OR email = 'test@example.com'").get() as any;
  const testPassword = "123";
  const testHashedPassword = await bcrypt.hash(testPassword, 10);
  
  if (!testUser) {
    console.log("Creating test user (eKYC verified)...");
    db.prepare(`
      INSERT INTO users (username, password, email, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname) 
      VALUES (?, ?, ?, ?, 1, 1, 'drivers_license', '本間 貴司', CURRENT_TIMESTAMP, ?, ?, ?, ?)
    `).run("test", testHashedPassword, "test@example.com", "user", "本間 貴司", "本間", "貴司", "たかし");
    console.log("test user created successfully.");
  } else {
    console.log("Updating test user password and profile...");
    db.prepare(`
      UPDATE users 
      SET password = ?, email = 'test@example.com', is_verified = 1, is_ekyc_verified = 1, ekyc_document_type = 'drivers_license', ekyc_name = '本間 貴司', ekyc_verified_at = COALESCE(ekyc_verified_at, CURRENT_TIMESTAMP), full_name = ?, last_name = ?, first_name = ?, nickname = ? 
      WHERE id = ?
    `).run(testHashedPassword, "本間 貴司", "本間", "貴司", "たかし", testUser.id);
    console.log("test user updated successfully.");
  }

  // Create explicit eKYC sample users
  const verifiedSampleUsers = [
    {
      username: "UID-100001",
      email: "sakura.sato@example.com",
      full_name: "佐藤 さくら",
      last_name: "佐藤",
      first_name: "さくら",
      nickname: "さくら🌸",
      is_ekyc_verified: 1,
      ekyc_document_type: "drivers_license",
      ekyc_name: "佐藤 さくら"
    },
    {
      username: "UID-100002",
      email: "kenji.takahashi@example.com",
      full_name: "高橋 健二",
      last_name: "高橋",
      first_name: "健二",
      nickname: "けんじ (公認)",
      is_ekyc_verified: 1,
      ekyc_document_type: "my_number_card",
      ekyc_name: "高橋 健二"
    },
    {
      username: "UID-100003",
      email: "aoi.yamada@example.com",
      full_name: "山田 葵",
      last_name: "山田",
      first_name: "葵",
      nickname: "あおい",
      is_ekyc_verified: 1,
      ekyc_document_type: "passport",
      ekyc_name: "山田 葵"
    }
  ];

  for (const vu of verifiedSampleUsers) {
    const existingVu = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(vu.username, vu.email) as any;
    if (!existingVu) {
      db.prepare(`
        INSERT INTO users (username, password, email, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname)
        VALUES (?, ?, ?, 'user', 1, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
      `).run(vu.username, testHashedPassword, vu.email, vu.is_ekyc_verified, vu.ekyc_document_type, vu.ekyc_name, vu.full_name, vu.last_name, vu.first_name, vu.nickname);
    } else {
      db.prepare(`
        UPDATE users 
        SET is_ekyc_verified = 1, ekyc_document_type = ?, ekyc_name = ?, ekyc_verified_at = COALESCE(ekyc_verified_at, CURRENT_TIMESTAMP), full_name = ?, last_name = ?, first_name = ?, nickname = ?
        WHERE id = ?
      `).run(vu.ekyc_document_type, vu.ekyc_name, vu.full_name, vu.last_name, vu.first_name, vu.nickname, existingVu.id);
    }
  }

  // Ensure guest exists
  const guest = db.prepare("SELECT * FROM users WHERE username = 'guest' OR email = 'guest@remeets.jp'").get() as any;
  if (!guest) {
    console.log("Creating guest user...");
    db.prepare(`
      INSERT INTO users (username, password, email, role, is_verified, full_name, last_name, first_name, nickname) 
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
    `).run("guest", hashedPassword, "guest@remeets.jp", "user", "ゲスト ユーザー", "ゲスト", "ユーザー", "ゲスト");
  } else {
    db.prepare(`
      UPDATE users 
      SET email = COALESCE(email, 'guest@remeets.jp'),
          full_name = COALESCE(full_name, 'ゲスト ユーザー'),
          last_name = COALESCE(last_name, 'ゲスト'),
          first_name = COALESCE(first_name, 'ユーザー'),
          nickname = COALESCE(nickname, 'ゲスト')
      WHERE id = ?
    `).run(guest.id);
  }

  // 🌟 Ensure main verified users (test, sakura, kenji, aoi, admin) always have posts
  try {
    const mainUsers = [
      { email: 'test@example.com', name: '本間 貴司', nick: 'たかし', target: '小林 裕太', school: '世田谷第一中学校', msg: '中学最後の総体で共に走った陸上部の思い出。夕焼けのグラウンドが懐かしいです。', q1: '中学最後の夏の総体で二人で出場したリレー種目は？', a1: '4×100mリレー', q2: '練習帰りに駄菓子屋で食べたアイスは？', a2: 'ガリガリ君ソーダ味', era: '1990', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80' },
      { email: 'test@example.com', name: '本間 貴司', nick: 'たかし', target: '鈴木 恵美', school: '都立桜町高校', msg: '文化祭実行委員で共に汗を流した日々。またみんなで集まりたいですね。', q1: '文化祭の前夜祭で着たお揃いTシャツの色は？', a1: 'オレンジ色', q2: '後夜祭フィナーレの花火の名前は？', a2: 'ナイアガラの滝', era: '2000', img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80' },
      { email: 'sakura.sato@example.com', name: '佐藤 さくら', nick: 'さくら🌸', target: '中村 陽子', school: '横浜青葉高校', msg: '吹奏楽部で共にフルートを吹いた親友へ。金賞を獲ったあの瞬間の涙は宝物です。', q1: '夏のコンクール予選で金賞を受賞した思い出の自由曲は？', a1: 'アルヴァマー序曲', q2: 'パート練習の合間に屋上で食べたお弁当のおかずは？', a2: '卵焼き', era: '2000', img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop&q=80' },
      { email: 'kenji.takahashi@example.com', name: '高橋 健二', nick: 'けんじ (公認)', target: '斎藤 翔平', school: '鎌倉学園高校', msg: '野球部でバッテリーを組んだ相棒へ。泥まみれになって甲子園を目指した日々。またキャッチボールしよう。', q1: '夏の大会でサヨナラ勝ちを決めた対戦相手の高校名は？', a1: '明青高校', q2: '練習帰りに立ち寄った定食屋の大盛りメニューは？', a2: 'ジャンボチキンカツ定食', era: '1990', img: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&auto=format&fit=crop&q=80' },
      { email: 'aoi.yamada@example.com', name: '山田 葵', nick: 'あおい', target: '佐々木 美穂', school: '千葉東高校', msg: '美術部で油絵を描いた同期へ。放課後の美術室で夕暮れまでデッサンを重ねた時間が懐かしいです。', q1: '二人で県展に出品した油絵の共通テーマは？', a1: '朝焼けの海', q2: '美術室でいつも一緒に飲んでいた紙パックの紅茶は？', a2: 'リプトンミルクティー', era: '2010', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80' },
      { email: 'admin@adomin.jp', name: '東北 太郎', nick: 'かりん', target: '松本 隆', school: '札幌旭丘高校', msg: '天文部で満天の星空を眺めた仲間へ。凍てつく夜空に輝く星と語り合った夢を覚えています。', q1: '天体望遠鏡を覗いて息を呑んだ夜空の惑星は？', a1: '土星の輪', q2: '夜間観測で寒さをしのぐために飲んだ飲み物は？', a2: 'ホットココア', era: '1980', img: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80' }
    ];

    for (const mu of mainUsers) {
      const uRecord = db.prepare("SELECT id FROM users WHERE email = ?").get(mu.email) as any;
      if (uRecord) {
        const postExists = db.prepare("SELECT id FROM posts WHERE user_id = ? AND target_name = ?").get(uRecord.id, mu.target);
        if (!postExists) {
          const insertStmt = db.prepare(`
            INSERT INTO posts (
              user_id, searcher_name, searcher_full_name, searcher_profile, target_name, 
              target_last_name, target_first_name, target_hometown, target_school, 
              era, category, secret_question, secret_answer, secret_answer_plain, 
              message, image_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
          `);
          const res = insertStmt.run(
            uRecord.id, mu.nick, mu.name, `${mu.school}時代の想い出の相手を探しています。`,
            mu.target, mu.target.split(' ')[0] || mu.target, mu.target.split(' ')[1] || '', '東京都', mu.school,
            mu.era, 'friend', mu.q1, hashedPassword, mu.a1, mu.msg, mu.img
          );
          db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)").run(
            res.lastInsertRowid, mu.q2, hashedPassword, mu.a2
          );
        }
      }
    }
  } catch (e) {
    console.error("Failed to ensure main user posts:", e);
  }

  // Check if posts already exist in database or if startup seeding is not forced
  const existingPostsCount = (db.prepare("SELECT COUNT(*) as count FROM posts").get() as any)?.count || 0;
  if (!force) {
    console.log(`[Database] Found ${existingPostsCount} existing posts. Automatic seeding skipped.`);
    return;
  }

  // Clear existing data (only if empty or force=true)
  console.log(`[Database] ${force ? 'Force re-seeding requested.' : 'Empty database detected.'} Cleaning up and seeding sample data...`);
  try { db.pragma("foreign_keys = OFF"); } catch (e) {}
  db.prepare("DELETE FROM contact_messages").run();
  db.prepare("DELETE FROM post_questions").run();
  db.prepare("DELETE FROM failed_attempts").run();
  db.prepare("DELETE FROM deletion_requests").run();
  db.prepare("DELETE FROM payment_transactions").run();
  db.prepare("DELETE FROM age_verification_logs").run();
  db.prepare("DELETE FROM age_verification_documents").run();
  db.prepare("DELETE FROM posts").run();
  db.prepare("DELETE FROM notifications").run();
  db.prepare("DELETE FROM reports").run();
  db.prepare("DELETE FROM success_stories").run();
  db.prepare("DELETE FROM ng_words").run();
  db.prepare("DELETE FROM contacts").run();
  db.prepare("DELETE FROM action_logs").run();
  db.prepare("DELETE FROM access_logs").run();
  db.prepare("DELETE FROM users WHERE role = 'user' AND username NOT IN ('test', 'guest', 'UID-100001', 'UID-100002', 'UID-100003')").run();
  try { db.pragma("foreign_keys = ON"); } catch (e) {}

  console.log("Seeding 50 new sample posts and users...");
  
  const nicknames = [
    "たっくん", "さっちゃん", "まー坊", "ゆきりん", "けんけん", 
    "なっちゃん", "りょう", "あき", "とも", "ゆう",
    "ミキティー", "しんちゃん", "かな", "ひろ", "だいちゃん",
    "えり", "なお", "かず", "まみ", "よし",
    "あきら", "ゆみこ", "とし", "けいこ", "じゅん",
    "りか", "たけし", "めぐみ", "しんご", "ゆか",
    "ともき", "さおり", "けいた", "みゆ", "こうじ",
    "あや", "しゅん", "なな", "ゆうき", "りな",
    "たくみ", "ほのか", "りょうた", "あおい", "かいと",
    "ひまり", "れん", "ゆい", "そら", "みお"
  ];

  const kirakiraNames = [
    { last: "羽衣", first: "心愛", romaji: "cocoa_u" }, { last: "星野", first: "希星", romaji: "kirara_h" },
    { last: "月城", first: "海空", romaji: "misora_t" }, { last: "愛川", first: "愛莉", romaji: "airi_a" },
    { last: "空閑", first: "碧", romaji: "aoi_k" }, { last: "日向", first: "陽葵", romaji: "himari_h" },
    { last: "結城", first: "結菜", romaji: "yuina_y" }, { last: "白鳥", first: "莉子", romaji: "riko_s" },
    { last: "若葉", first: "芽依", romaji: "mei_w" }, { last: "鳳", first: "蓮", romaji: "ren_o" }
  ];

  const targetNames = [
    { last: "佐藤", first: "健一" }, { last: "田中", first: "太郎" }, { last: "鈴木", first: "美咲" }, 
    { last: "高橋", first: "浩二" }, { last: "伊藤", first: "直樹" }, { last: "渡辺", first: "由美" }, 
    { last: "山本", first: "和也" }, { last: "中村", first: "さくら" }, { last: "小林", first: "大輔" }, 
    { last: "加藤", first: "真理子" }, { last: "吉田", first: "健太" }, { last: "山田", first: "愛" }, 
    { last: "佐々木", first: "翔太" }, { last: "山口", first: "舞" }, { last: "松本", first: "拓也" }, 
    { last: "井上", first: "結衣" }, { last: "木村", first: "亮太" }, { last: "林", first: "萌" }, 
    { last: "斎藤", first: "雄大" }, { last: "清水", first: "菜々子" },
    { last: "阿部", first: "慎一" }, { last: "森", first: "美紀" }, { last: "池田", first: "健太" }, 
    { last: "橋本", first: "恵" }, { last: "山下", first: "浩司" }, { last: "石川", first: "奈央" }, 
    { last: "中島", first: "結衣" }, { last: "前田", first: "拓海" }, { last: "藤田", first: "萌" }, 
    { last: "後藤", first: "翔太" },
    { last: "山崎", first: "直人" }, { last: "中島", first: "裕子" }, { last: "池田", first: "智也" },
    { last: "岡田", first: "恵美" }, { last: "石井", first: "隆" }, { last: "西村", first: "美穂" },
    { last: "藤田", first: "健" }, { last: "後藤", first: "真一" }, { last: "村上", first: "あゆみ" },
    { last: "近藤", first: "剛" }, { last: "坂本", first: "健二" }, { last: "遠藤", first: "久美" },
    { last: "青木", first: "茂" }, { last: "藤井", first: "裕太" }, { last: "菊地", first: "恵子" },
    { last: "野村", first: "浩一" }, { last: "三浦", first: "拓也" }, { last: "安部", first: "隆" },
    { last: "太田", first: "芳雄" }, { last: "芥川", first: "健" }
  ];

  const searcherNames = [
    { last: "田中", first: "誠", romaji: "m_tanaka" }, { last: "佐藤", first: "由紀子", romaji: "y_sato" }, { last: "鈴木", first: "一郎", romaji: "i_suzuki" },
    { last: "高橋", first: "健太", romaji: "k_takahashi" }, { last: "伊藤", first: "美香", romaji: "m_ito" }, { last: "渡辺", first: "修", romaji: "o_watanabe" },
    { last: "山本", first: "恵子", romaji: "k_yamamoto" }, { last: "中村", first: "剛", romaji: "t_nakamura" }, { last: "小林", first: "明日香", romaji: "a_kobayashi" },
    { last: "加藤", first: "博", romaji: "h_kato" }, { last: "吉田", first: "真由美", romaji: "m_yoshida" }, { last: "山田", first: "隆", romaji: "t_yamada" },
    { last: "佐々木", first: "順子", romaji: "j_sasaki" }, { last: "山口", first: "哲也", romaji: "t_yamaguchi" }, { last: "松本", first: "明美", romaji: "a_matsumoto" },
    { last: "井上", first: "和夫", romaji: "k_inoue" }, { last: "木村", first: "智子", romaji: "t_kimura" }, { last: "林", first: "英樹", romaji: "h_hayashi" },
    { last: "斎藤", first: "久美子", romaji: "k_saito" }, { last: "清水", first: "正", romaji: "t_shimizu" },
    { last: "阿部", first: "浩", romaji: "h_abe" }, { last: "森", first: "直美", romaji: "n_mori" }, { last: "池田", first: "勇", romaji: "i_ikeda" },
    { last: "橋本", first: "聖", romaji: "s_hashimoto" }, { last: "山下", first: "達也", romaji: "t_yamashita" }, { last: "石川", first: "さゆり", romaji: "s_ishikawa" },
    { last: "中島", first: "みゆき", romaji: "m_nakajima" }, { last: "前田", first: "敦子", romaji: "a_maeda" }, { last: "藤田", first: "嗣", romaji: "t_fujita" },
    { last: "後藤", first: "久美", romaji: "k_goto" },
    { last: "村上", first: "浩", romaji: "h_murakami" }, { last: "東野", first: "昭二", romaji: "k_higashino" }, { last: "宮部", first: "佳代", romaji: "m_miyabe" },
    { last: "伊坂", first: "哲也", romaji: "k_isaka" }, { last: "湊", first: "陽子", romaji: "k_minato" }, { last: "池井戸", first: "潤", romaji: "j_ikeido" },
    { last: "有川", first: "悟", romaji: "h_arikawa" }, { last: "西", first: "佳代子", romaji: "k_nishi" }, { last: "朝井", first: "健太", romaji: "r_asai" },
    { last: "辻村", first: "智子", romaji: "m_tsujimura" }, { last: "恩田", first: "浩司", romaji: "r_onda" }, { last: "森見", first: "健一", romaji: "t_morimi" },
    { last: "万城目", first: "裕介", romaji: "m_makime" }, { last: "米澤", first: "健太", romaji: "h_yonezawa" }, { last: "三浦", first: "恵美", romaji: "s_miura" },
    { last: "角田", first: "浩二", romaji: "m_kakuta" }, { last: "川上", first: "陽子", romaji: "m_kawakami" }, { last: "村田", first: "健太", romaji: "s_murata" },
    { last: "本谷", first: "佳代", romaji: "y_motoya" }, { last: "綿矢", first: "りさ", romaji: "r_wataya" }
  ];

  const hometowns = ["東京都世田谷区", "神奈川県横浜市", "大阪府大阪市", "愛知県名古屋市", "福岡県福岡市", "北海道札幌市", "千葉県千葉市", "埼玉県さいたま市", "兵庫県神戸市", "京都府京都市"];
  const schools = [
    "世田谷第一中学校", "横浜市立青葉高校", "大阪府立北野高校", "名古屋市立向陽高校", "福岡県立修猷館高校", 
    "札幌市立旭丘高校", "千葉県立千葉高校", "埼玉県立浦和高校", "兵庫県立神戸高校", "京都市立堀川高校",
    "IT系スタートアップ企業", "大手広告代理店", "老舗アパレルメーカー", "地元の人気カフェ", "駅前のスポーツジム"
  ];
  const eras = ["1970", "1980", "1990", "2000", "2010"];
  const categories = ["friend", "work", "love", "family", "other"];

  const insertUser = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
  const insertPost = db.prepare(`
    INSERT INTO posts (
      user_id, searcher_name, searcher_profile, target_name, target_last_name, target_first_name, target_hometown, target_school,
      era, category, secret_question, secret_answer, secret_answer_plain, message, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertQ = db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)");

  const unsplashIds = [
    "1590615370581-2656198fdf62", "1542314831-068cd1dbfeeb", "1570129476815-ba368ac77013", 
    "1555529323-4484029793c9", "1529339061831-13350290918a", "1496116218417-1a781b1c416c", 
    "1531949103042-ad6d7b433792", "1560264280-88b68371db39"
  ];

  const sampleContents = [
    {
      profile: "世田谷区の中学校テニス部で一緒でした。私は副部長をしていました。",
      message: "卒業式の日に、部室の裏でみんなで泣きながら話したことを今でも鮮明に覚えています。あの時あなたがくれた励ましの言葉に救われました。元気でいてくれることを願っています。",
      q1: "部活の帰りにいつも寄っていた駄菓子屋の名前は？", a1: "さくらや",
      q2: "最後の夏合宿で行った長野の避暑地はどこだった？", a2: "軽井沢"
    },
    {
      profile: "横浜駅近くのITオフィスで同じプロジェクトチームでした。深夜残業を乗り越えた仲間です。",
      message: "お久しぶりです！あの激務だった開発プロジェクト、今となっては誇らしい思い出ですね。またみんなで集まりましょう！",
      q1: "当時の開発プロジェクトチームの愛称は何だった？", a1: "チームドリーム",
      q2: "オフィスの地下にあったお気に入りの洋食屋は？", a2: "キッチン南海"
    },
    {
      profile: "下北沢のライブハウスで毎週末のように顔を合わせていた者です。",
      message: "あの頃、狭いライブハウスで共有した音楽と熱気は今でも私の宝物です。あなたが教えてくれたバンドの曲、今も聴いています。",
      q1: "初めて二人でチケットを買って行ったライブのバンド名は？", a1: "バンプ",
      q2: "深夜ライブの後にいつも寄っていた中華料理屋は？", a2: "みんみん"
    },
    {
      profile: "小学校6年間の幼馴染です。秘密基地を作って毎日遊んでいました。",
      message: "元気にしてるかな？ふと懐かしくなってボトルを流してみたよ。またあの公園で昔みたいに語り合いたいね。",
      q1: "秘密基地を作っていた空き地の隣にあった古い建物は？", a1: "末広湯",
      q2: "小学校5年生の時の厳しい担任の先生のあだ名は？", a2: "カミナリ"
    },
    {
      profile: "大学の天文学サークルで星空を追いかけていた仲間を探しています。",
      message: "サークル棟の屋上で夜通し語り明かした星の話、今でも覚えています。OB会であなたの話題が出て、みんな会いたがっています。",
      q1: "夏合宿で天体観測に行った標高の高い高原は？", a1: "美ヶ原",
      q2: "部室の冷蔵庫にいつも常備されていた紙パック飲料は？", a2: "麦茶"
    },
    {
      profile: "昔、木造アパートのお隣に住んでいた者です。いつもお裾分けをいただきありがとうございました。",
      message: "急な引っ越しでろくにお礼も言えずじまいだったことがずっと心残りでした。本当にお世話になりました。",
      q1: "アパートの庭の入り口に咲いていた大きな黄色い花は？", a1: "ひまわり",
      q2: "年末にお隣からいただいたお裾分けの食べ物は？", a2: "丸餅"
    },
    {
      profile: "被災地でのボランティア活動を通じて知り合いました。あなたの笑顔に救われました。",
      message: "あの過酷な現場で、あなたの前向きな姿勢がみんなの支えでした。またいつか笑顔で再会したいです。",
      q1: "ボランティア活動の打ち上げで利用した居酒屋チェーンは？", a1: "魚民",
      q2: "現地で私たちが担当していた支援物資配給の班名は？", a2: "B班"
    },
    {
      profile: "高校時代の親友です。放課後はいつも図書室の窓際で受験勉強していました。",
      message: "久しぶり！元気にしてる？文化祭の準備で徹夜したのが懐かしいね。連絡待ってます。",
      q1: "高校2年の文化祭で私たちが企画した出し物は？", a1: "お化け屋敷",
      q2: "学校帰りにいつも買い食いしていたホットスナックは？", a2: "ファミチキ"
    },
    {
      profile: "新入社員として配属された営業所で温かく指導してくださった先輩を探しています。",
      message: "定年を迎え、人生を振り返る中で真っ先に先輩の顔が浮かびました。厳しくも温かいご指導に心より感謝しています。",
      q1: "新入社員歓迎の社員旅行で行った静岡の温泉街は？", a1: "熱海",
      q2: "先輩がいつも手帳に差して愛用していた万年筆のインク色は？", a2: "ブルーブラック"
    },
    {
      profile: "街の写真サークル仲間。週末はフィルムカメラを持って路地裏の撮影に行っていました。",
      message: "最近またフィルムカメラを始めました。あなたが撮る光と影の写真が本当に好きでした。また撮影会やりたいですね。",
      q1: "私たちが所属していた写真サークルのシンボルマークは？", a1: "フクロウ",
      q2: "初めて一緒に撮影旅行に行った東京の国営公園は？", a2: "昭和記念公園"
    },
    {
      profile: "中学の吹奏楽部で金管パートを吹いていました。コンクールで金賞を目指した仲間です。",
      message: "あの夏の県大会前の猛練習、きつかったけれど最高の青春だったね。またみんなで楽器を持ち寄って合奏したいです。",
      q1: "私たちが自由曲として演奏した吹奏楽の名曲タイトルは？", a1: "アルメニアンダンス",
      q2: "練習の合間にパートみんなで食べたアイスクリームは？", a2: "ガリガリ君"
    },
    {
      profile: "大学時代に京都の町家カフェで一緒にオープニングスタッフとしてアルバイトしていました。",
      message: "まかないを食べながら将来の夢を語り合った日々が懐かしいです。あなたが淹れてくれた珈琲の味が忘れられません。",
      q1: "バイト先だったカフェの看板メニューのスイーツは？", a1: "抹茶パフェ",
      q2: "店長が飼っていた看板猫の白黒ハチワレの名前は？", a2: "クロスケ"
    },
    {
      profile: "高校の軽音学部でツインギターを弾いていました。文化祭のステージは最高の思い出です。",
      message: "アンプの音作りで夜遅くまで音楽室に残ったね。あの頃作ったオリジナル曲のコード進行、まだ覚えてるよ。",
      q1: "文化祭のアンコールで演奏した伝説の曲名は？", a1: "スモーキー",
      q2: "あなたが初めて買ったエレキギターのボディカラーは？", a2: "サンバースト"
    },
    {
      profile: "学生時代、バックパッカーとしてタイのゲストハウスで出会った旅仲間です。",
      message: "カオサン通りの屋台でパッタイを食べながら旅のルートを話し合いましたね。あの時の約束、覚えていますか？",
      q1: "バンコクで私たちが泊まっていた安宿の名前は？", a1: "サワディーハウス",
      q2: "夜市で二人で挑戦して食べた屋台フルーツの王様は？", a2: "ドリアン"
    },
    {
      profile: "少年野球チーム「リトルジャイアンツ」でバッテリーを組んでいたキャッチャーです。",
      message: "最終回のマウンドで君が見せてくれた気迫のピッチングは今でも目に焼き付いています。またキャッチボールしようぜ。",
      q1: "優勝決定戦でサインを出して投げさせた最後の決め球は？", a1: "インコース高め直球",
      q2: "試合後に監督が全員に奢ってくれたジュースは？", a2: "プラッシー"
    },
    {
      profile: "北海道の大学で農場実習を共にした同期です。朝早い搾乳作業を励まし合いました。",
      message: "一面の雪景色と星空、寮のストーブを囲んで飲んだ熱燗が懐かしいです。元気に農業やっていますか？",
      q1: "実習農場で私たちが一番可愛がっていたホルスタインの名は？", a1: "ハナコ",
      q2: "収穫祭でみんなで作った手作りの大鍋料理は？", a2: "石狩鍋"
    },
    {
      profile: "デザイン専門学校で同じゼミだった同級生です。卒業制作で隣のデスクでした。",
      message: "提出前夜、徹夜でプリンターの前で待機しながら飲んだ缶コーヒーの味が忘れられません。今もデザイン続けてる？",
      q1: "卒業制作であなたが受賞した名誉ある賞の名称は？", a1: "学長賞",
      q2: "課題制作中に二人でヘビロテしていたBGMのアルバムは？", a2: "無罪モラトリアム"
    },
    {
      profile: "幼少期、長野の祖父母の家で夏休みだけ一緒に遊んでいた従兄弟のような友達です。",
      message: "川で魚を捕まえたり、カブトムシを探しに朝早く森へ行った思い出は宝物です。お互い大人になったけれど元気ですか？",
      q1: "秘密の釣り場で釣った魚の種類の名前は？", a1: "ヤマメ",
      q2: "おばあちゃんが作ってくれたおやつの郷土料理は？", a2: "おやき"
    },
    {
      profile: "渋谷の古着屋でスタッフとして切磋琢磨していた元同僚です。",
      message: "海外買い付けの話やヴィンテージデニムの知識をたくさん教えてもらいました。あなたのセンスを尊敬していました。",
      q1: "ショップの看板になっていた年代物のヴィンテージジーンズ型番は？", a1: "501XX",
      q2: "店長が海外出張のお土産にくれた現地のキーホルダーの形は？", a2: "ルート66看板"
    },
    {
      profile: "高校の陸上部で4×100mリレーのアンカーと第3走者としてバトンを繋いだ仲間です。",
      message: "県大会決勝のバトンパス、完璧だったね。グラウンドの土の匂いと歓声、今でも胸が熱くなります。",
      q1: "リレーチームで揃えて履いていたスパイクシューズのメーカーは？", a1: "ミズノ",
      q2: "朝練の後に水道の蛇口で冷やして食べた果物は？", a2: "スイカ"
    },
    {
      profile: "大学の演劇サークルで大道具と照明を担当していた裏方コンビです。",
      message: "本番前のゲネプロで照明のタイミングを何度も合わせたね。幕が下りた瞬間の拍手の音、忘れられません。",
      q1: "秋の定期公演で上演したシェイクスピアの名作戯曲は？", a1: "夏の夜の夢",
      q2: "舞台袖の道具箱に貼ってあった安全祈願のお守りステッカーは？", a2: "成田山"
    },
    {
      profile: "地元の児童館で将棋を指し合っていた将棋仲間です。名勝負を何度も繰り広げました。",
      message: "夕方のチャイムが鳴るまで盤面を挟んで集中した日々が懐かしいです。今でも振り飛車を指していますか？",
      q1: "あなたが好んで指していた得意の戦法名は？", a1: "四間飛車",
      q2: "児童館の指導員の先生がくれた手作りの木製トロフィーの文字は？", a2: "王手飛車"
    },
    {
      profile: "昔、神田の老舗書店で一緒に働いていた書店員仲間です。本の話で盛り上がりました。",
      message: "文庫本タワーを作ってPOPを書いた情熱的な日々を思い出します。あなたが推薦してくれた小説、今も本棚にあります。",
      q1: "二人で熱狂して作った特設コーナーの作家名は？", a1: "太宰治",
      q2: "書店の休憩室でいつも淹れていた紅茶のブランド名は？", a2: "トワイニング"
    },
    {
      profile: "中学時代の剣道部で汗を流した同期です。寒稽古の冷たい道場の床を思い出します。",
      message: "竹刀を交わして互いを高め合った三年間は、私の人生の芯になっています。機会があればまた防具を着けて稽古したいです。",
      q1: "寒稽古の最終日に保護者会のみなさんが作ってくれた温かい汁物は？", a1: "豚汁",
      q2: "道場の正面に掲げられていた四字熟語の掛け軸は？", a2: "百錬自得"
    },
    {
      profile: "都内のプログラミング勉強会（もくもく会）で毎週隣の席だったエンジニア仲間です。",
      message: "バグの原因が分からず一緒に深夜までコードを追ったのが良い思い出です。あの時の技術スタックから時代も進みましたね。",
      q1: "私たちが共同開発していたアプリのオープンソースリポジトリ名は？", a1: "KizunaApp",
      q2: "勉強会会場のコワーキングスペースで無料で飲めた名物コーヒーは？", a2: "コスタリカブレンド"
    },
    {
      profile: "高校の合唱部で混声合唱のソプラノとテノールで声を合わせた仲間です。",
      message: "NHK全国学校音楽コンクールを目指して放課後ずっとハーモニーを響かせましたね。あの感動をもう一度共有したいです。",
      q1: "コンクール地区予選で歌った課題曲のタイトルは？", a1: "手紙",
      q2: "発声練習の時にピアノ伴奏で使っていた音階の愛称は？", a2: "マオマオ発声"
    },
    {
      profile: "昔、吉祥寺のジャズ喫茶でカウンターに並んで常連客だった音楽仲間です。",
      message: "マスターが淹れるネルドリップ珈琲とマイルス・デイヴィスのレコード。あの静かで濃密な時間をまた語り合いたいです。",
      q1: "店内の巨大な真空管スピーカーの伝説的なオーディオブランドは？", a1: "JBL",
      q2: "マスターが裏メニューで出してくれたシナモントーストの味付けは？", a2: "メープルハニー"
    },
    {
      profile: "大学のワンダーフォーゲル部で北アルプスを縦走した登山仲間です。",
      message: "テント泊の夜、槍ヶ岳の稜線から見上げた満天の星空は一生の宝物です。体力をつけてまた山小屋で乾杯したいですね。",
      q1: "山頂アタックの日の朝に食べたコッヘルで作った特製山飯は？", a1: "ツナマヨリゾット",
      q2: "部員全員でお揃いで買った山岳用カラビナの色は？", a2: "メタリックオレンジ"
    },
    {
      profile: "小学校の給食当番でいつも大おかずとパンを一緒に配っていた同級生です。",
      message: "揚げパンの争奪戦ジャンケンや、牛乳キャップ集めに夢中になったあの頃が本当に懐かしいです。元気にしていますか？",
      q1: "金曜日の給食で一番人気だったデザートメニューは？", a1: "冷凍みかん",
      q2: "教室の後ろに飼育していた学級の緑色のカメの名前は？", a2: "ミドリちゃん"
    },
    {
      profile: "バイクツーリング仲間。能登半島や信州のビーナスラインを一緒に駆け抜けました。",
      message: "夕暮れの海岸線でバイクを止めて眺めた日本海の夕日は忘れられません。愛車の調子はどうですか？また走りに行こう。",
      q1: "ツーリングの途中で立ち寄った海沿いの道の駅の名物は？", a1: "イカ飯",
      q2: "インカム通信で道に迷った時にあなたが叫んだ合言葉は？", a2: "ゴーウエスト"
    },
    {
      profile: "同じ英会話スクールに通っていた社会人クラスの仲間です。",
      message: "レッスン後のカフェで英語の宿題を教え合ったり、将来の海外移住の夢を語り合いましたね。あの時の努力が今に生きています。",
      q1: "担任だったネイティブ講師のアメリカ人先生の名前は？", a1: "スティーブ先生",
      q2: "予習のために二人で丸暗記した映画の洋画タイトルは？", a2: "スタンドバイミー"
    },
    {
      profile: "学生時代のアルバイト先（スキー場のペンション）で住み込みリゾートバイト仲間でした。",
      message: "朝から雪かきをして、リフト運行後はナイターを滑り倒したあの冬の思い出。まかないの鍋が本当に美味しかったね。",
      q1: "ペンションのオーナーが毎晩薪ストーブで焼いてくれたピザの具は？", a1: "自家製ベーコン",
      q2: "夜の雪山でみんなでソリ滑りをした急斜面のゲレンデコース名は？", a2: "ダイナミックコース"
    },
    {
      profile: "高校の美術部で油絵を描いていた仲間です。アトリエのテレピン油の匂いを思い出します。",
      message: "キャンバスに向かって無言で筆を走らせた放課後。あなたの描く風景画の色彩感覚にいつも刺激を受けていました。",
      q1: "高文祭に出品するために二人で共同制作した大作のテーマは？", a1: "蒼の記憶",
      q2: "美術室の棚に置いてあったデッサン用の石膏像の人物名は？", a2: "アグリッパ"
    },
    {
      profile: "中学の同窓会幹事を一緒にやった仲間です。名簿集めに苦労したのが懐かしいですね。",
      message: "卒業アルバムを見返しながら連絡先を調べた日々。あれから年数が経ちましたが、次回はもっと盛大にやりたいですね。",
      q1: "同窓会の一次会で貸し切った駅前のホテル宴会場の名前は？", a1: "グランドパレス",
      q2: "スライドショーで上映した当時の修学旅行先はどこだった？", a2: "奈良京都"
    },
    {
      profile: "社会人フットサルリーグで同じチームでプレイしたゴールキーパーです。",
      message: "最後の公式戦、PK戦での君のナイスセーブで優勝できた瞬間は最高でした。また一緒にボールを蹴りましょう！",
      q1: "チームの胸スポンサーに名乗り出てくれた地元ラーメン屋の名前は？", a1: "麺処極み",
      q2: "優勝祝勝会でキャプテンが一気飲みした優勝カップの中身は？", a2: "特大ジンジャーエール"
    },
    {
      profile: "小学校の鼓笛隊で大太鼓と小太鼓でリズムを刻んだ音楽仲間です。",
      message: "運動会のパレード行進、足並みを揃えて校庭を一周した誇らしさを覚えています。大人になっても音楽楽しんでますか？",
      q1: "運動会行進曲の定番だった鼓笛隊の演奏曲名は？", a1: "クワイ河マーチ",
      q2: "パレードで着用したベレー帽とスカーフのお揃いの色は？", a2: "ロイヤルブルー"
    },
    {
      profile: "大学の研究室で生化学の卒業論文実験を夜通し共にした同期です。",
      message: "遠心分離機の音を聞きながらデータの解析をした日々。あの過酷な卒論発表を乗り切れたのは君のおかげです。",
      q1: "実験室の冷凍庫に保管されていた必須サンプルの試薬名は？", a1: "BSA溶液",
      q2: "教授が海外学会のお土産に研究室に買ってきてくれた激甘チョコは？", a2: "ティムタム"
    },
    {
      profile: "昔、地域のお祭り青年部で神輿を一緒に担いだ地元の仲間です。",
      message: "威勢のいい掛け声と肩の痛み、祭りのあとの宮出しの達成感。またあの熱い夏祭りの法被を着て肩を並べたいですね。",
      q1: "神輿を担ぐ時にみんなで揃えて締めた晒（さらし）の帯の色は？", a1: "濃紺色",
      q2: "神社境内のみんなの詰め所で振る舞われた名物の炊き出しは？", a2: "牛すじ煮込み"
    },
    {
      profile: "予備校の自習室でいつも隣の席で机を並べていた浪人時代の戦友です。",
      message: "模試の結果に一喜一憂しながら、励まし合って掴んだ合格通知。あの1年間の努力があったから今の自分があります。",
      q1: "夜遅くの自習室を出た後、二人で駆け込んだ立ち食いそば屋のメニューは？", a1: "かき揚げそば",
      q2: "単語帳の表紙に合格祈願で貼っていた赤ペンキ風の合格シールは？", a2: "必勝ダルマ"
    },
    {
      profile: "京都の古寺巡りサークルで週末ごとに御朱印を集めていた仲間です。",
      message: "苔寺の静けさや嵐山の竹林、紅葉のライトアップに息を呑んだ日々。また静かに古都の風情を味わいに行きたいですね。",
      q1: "初めて二人で訪れて感動した枯山水庭園で有名なお寺の名前は？", a1: "龍安寺",
      q2: "参道の茶屋で食べた焼きたての名物和菓子は？", a2: "みたらし団子"
    },
    {
      profile: "新入社員時代の社員寮で隣の部屋だった同期です。壁が薄くてよく声が聞こえましたね。",
      message: "仕事の愚痴を言い合ったり、夜中にコンビニへアイスを買いに行ったり。君がいてくれたから新社会人を乗り越えられました。",
      q1: "社員寮の食堂で金曜日の夕飯に決まって出てきた大人気メニューは？", a1: "カツカレー",
      q2: "寮の屋上に忍び込んで二人で見た初日の出の方角の山は？", a2: "筑波山"
    },
    {
      profile: "中学のバスケットボール部でガードとセンターとしてコンビプレイを磨いた仲間です。",
      message: "残り3秒からの逆転ブザービーター、あの奇跡のシュートは一生忘れられない青春のハイライトです。元気ですか？",
      q1: "最後の公式戦で決めた劇的な逆転シュートのプレイ名は？", a1: "ブザービーター",
      q2: "部活動の全員共通の練習着にプリントされていた部訓の言葉は？", a2: "不撓不屈"
    },
    {
      profile: "大学の映画サークルで自主制作映画を撮っていた監督とカメラマンのコンビです。",
      message: "8ミリフィルムを回して夕暮れの街を走り抜けた日々。あの映画祭での受賞、今でも誇りに思っています。",
      q1: "自主映画祭でグランプリを獲った短編映画のタイトルは？", a1: "雨上がりの坂道",
      q2: "編集室にカンヅメになった時に主食にしていたカップ麺は？", a2: "シーフードヌードル"
    },
    {
      profile: "小学校の時に同じそろばん塾に通っていた仲間です。暗算のスピードを競い合いましたね。",
      message: "パチパチと響くそろばんの音と、段位検定に合格した時のハイタッチ。ふと思い出して温かい気持ちになりました。",
      q1: "そろばん塾の先生がご褒美にくれた文房具のキャラクターは？", a1: "スヌーピー消しゴム",
      q2: "塾の帰り道にあった自動販売機でいつも買っていた瓶ジュースは？", a2: "チェリオ"
    },
    {
      profile: "高校の囲碁将棋部で放課後の対局を楽しんでいた同級生です。",
      message: "静かな部室でパチリと打つ石の響き。あの頃のように何の雑音もなく、ただ盤上に集中する時間をまた過ごしたいです。",
      q1: "囲碁の対局であなたが好んで使っていた愛用の本榧碁盤の号数は？", a1: "五寸盤",
      q2: "部室の戸棚にしまってあった初代部長秘伝の定石手引書の題名は？", a2: "星の布石大全"
    },
    {
      profile: "Webベンチャーの創業初期にデザイナーとエンジニアとして奮闘した仲間です。",
      message: "雑居ビルの小さなオフィスでピザを食べながら朝までローンチ作業をしたね。あの情熱は今の私の礎です。",
      q1: "初期リリースしたサービスのベータ版コードネームは？", a1: "プロジェクトフェニックス",
      q2: "徹夜明けにビルの非常階段から見上げた東京タワーのライトアップ色は？", a2: "ランドマークライト"
    },
    {
      profile: "地元の少年少女合唱団でヨーロッパ海外公演に一緒に行った仲間です。",
      message: "ウィーンの大聖堂で響かせた歌声の残響は一生の宝物です。大人になってそれぞれの道を歩んでいますが元気ですか？",
      q1: "ウィーン公演のアンコールで合唱した日本の唱歌は？", a1: "ふるさと",
      q2: "海外遠征中にみんなでお揃いで背負ったリュックのワッペン柄は？", a2: "折り鶴"
    },
    {
      profile: "高校時代に同じガソリンスタンドで洗車バイトをしていた仲間です。",
      message: "真冬の冷たい水で手をかじかませながら車をピカピカに磨いたね。バイト代で買った古着を見せ合ったのが懐かしいです。",
      q1: "スタンドの所長が休憩中に奢ってくれた名物缶コーヒーの銘柄は？", a1: "ボスレインボーマウンテン",
      q2: "洗車機の点検でいつも使っていた特製シャンプーの液体の色は？", a2: "エメラルドグリーン"
    },
    {
      profile: "大学の国際交流ラウンジで留学生チューターを一緒に担当していた仲間です。",
      message: "世界中から来た学生たちと日本文化を紹介したり異文化を学んだり。あの広い世界への憧れを共にした君に会いたいです。",
      q1: "歓迎パーティーで留学生たちとみんなで作って焼いた日本料理は？", a1: "たこ焼き",
      q2: "ラウンジの壁一面に貼っていた世界地図に刺したピンの総数は？", a2: "百本"
    },
    {
      profile: "原宿のホコ天でバンド演奏やダンスを見ながら青春を過ごした仲間です。",
      message: "ラジカセを担いで日曜日の歩行者天国に集まった熱い時代。あの頃のエネルギーをもう一度思い出して語り合いたいです。",
      q1: "ホコ天で私たちがいつも待ち合わせ場所にしていたカフェの名前は？", a1: "カフェドロペ",
      q2: "あなたが当時革ジャンに着けていた大好きなロックバッジの柄は？", a2: "ユニオンジャック"
    }
  ];

  const userIds: number[] = [];
  const postIds: number[] = [];

  for (let i = 0; i < 50; i++) {
    let searcher;
    const era = eras[Math.floor(Math.random() * eras.length)];
    
    // Use kirakira names for 2010s (approx 20s users)
    if (era === "2010") {
      searcher = kirakiraNames[i % kirakiraNames.length];
    } else {
      searcher = searcherNames[i % searcherNames.length];
    }

    const username = generateRealisticUsername(searcher.first, era, i);
    const fullName = `${searcher.last} ${searcher.first}`;
    const nickname = nicknames[i % nicknames.length];
    const target = targetNames[i % targetNames.length];
    const hometown = hometowns[i % hometowns.length];
    const school = schools[i % schools.length];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const imgId = unsplashIds[i % unsplashIds.length];
    const content = sampleContents[i % sampleContents.length];

    // Use full profile
    let profile = content.profile;
    const rand = Math.random();
    if (rand > 0.7) {
      profile = profile + " あの頃の思い出は今でも色褪せることなく、私の心の中に大切にしまってあります。ふとした瞬間に、あなたの笑顔や、一緒に過ごした何気ない時間が蘇ってきます。"; // Long
    }

    const isEkyc = (i % 2 === 0) ? 1 : 0;
    const docType = (i % 4 === 0) ? 'drivers_license' : (i % 4 === 2) ? 'my_number_card' : null;
    const sampleEmail = `${username.toLowerCase()}@sample.remeets.jp`;
    const userResult = db.prepare(`
      INSERT INTO users (username, email, password, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname) 
      VALUES (?, ?, ?, 'user', 1, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
    `).run(username, sampleEmail, hashedPassword, isEkyc, docType, isEkyc ? fullName : null, fullName, searcher.last, searcher.first, nickname);
    const userId = userResult.lastInsertRowid as number;
    userIds.push(userId);

    const hashedA1 = await bcrypt.hash(content.a1.trim().toLowerCase(), 10);
    const hashedA2 = await bcrypt.hash(content.a2.trim().toLowerCase(), 10);

    const postResult = db.prepare(`
      INSERT INTO posts (
        user_id, searcher_name, searcher_full_name, searcher_profile, target_name, 
        target_last_name, target_first_name, target_hometown, target_school, 
        era, category, secret_question, secret_answer, secret_answer_plain, 
        message, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      nickname,
      fullName,
      profile,
      `${target.last} ${target.first}`,
      target.last,
      target.first,
      hometown,
      school,
      era,
      category,
      content.q1,
      hashedA1,
      content.a1,
      content.message,
      `https://images.unsplash.com/photo-${imgId}?q=80&w=800&auto=format&fit=crop`,
      "active"
    );
    const postId = postResult.lastInsertRowid as number;
    postIds.push(postId);
    
    try {
      insertQ.run(postId, content.q2, hashedA2, content.a2);
      console.log(`Inserted q2 for post ${postId}`);
    } catch (e) {
      console.error(`Failed to insert q2 for post ${postId}:`, e);
    }
  }

  // Seed NG Words
  console.log("Seeding NG words...");
  const ngWords = [
    "[0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4}", // 電話番号パターン
    "[0-9]{3}-[0-9]{4}", // 郵便番号パターン
    "住所", "電話番号", "連絡先", "LINE ID", "ラインID", "メルアド", "メールアドレス",
    "死ね", "殺す", "バカ", "馬鹿", "アホ", "クズ", "ゴミ", "カス", "キチガイ", "死ねばいいのに",
    "放火", "爆破", "ぶっ殺す", "殺してやる", "刺し殺す", "殴り倒す", "殴る", "脅迫", "闇バイト", "裏バイト",
    "援助交際", "えんじょこうさい", "パパ活", "ママ活", "風俗", "出会い系", "アダルト", "性的", "個人情報",
    "児童ポルノ", "売春", "買春", "裏オプ", "薬物", "ドラッグ", "大麻", "覚醒剤", "一攫千金", "即日融資",
    "バカヤロー", "アホンダラ", "死ねばいい", "消え失せろ", "キモい", "うざい", "ブス", "デブ", "ハゲ",
    "ガイジ", "能無し", "ゴミ野郎", "カス野郎", "底辺", "詐欺", "特殊詐欺", "トクリュウ", "情報商材",
    "LINE交換", "カカオ交換", "お遣い", "ビッチ", "売女", "自死", "自殺"
  ];
  ngWords.forEach(word => {
    try {
      db.prepare("INSERT INTO ng_words (word) VALUES (?)").run(word);
    } catch (e) {}
  });

  // Seed Reports
  console.log("Seeding reports...");
  const reportReasons = ["不適切な内容が含まれています", "個人情報の漏洩", "嫌がらせ・誹謗中傷", "スパム投稿", "その他"];
  for (let i = 0; i < 5; i++) {
    db.prepare("INSERT INTO reports (reporter_id, target_type, target_id, reason, status) VALUES (?, ?, ?, ?, ?)")
      .run(userIds[i], "post", postIds[i], reportReasons[i % reportReasons.length], i % 2 === 0 ? "pending" : "resolved");
  }

  // Seed Deletion Requests
  console.log("Seeding deletion requests...");
  for (let i = 0; i < 5; i++) {
    db.prepare("INSERT INTO deletion_requests (post_id, name, url, content, reason, explanation, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        postIds[i + 5], 
        "申請者名", 
        `/post/${postIds[i + 5]}`, 
        "対象コンテンツの抜粋テキストがここに入ります。",
        "本人が見つかったため削除を希望します", 
        "詳しい説明文がここに入ります。サンプルデータとして閲覧可能です。",
        "sample@example.com",
        i % 2 === 0 ? "pending" : "resolved"
      );
  }

  // Seed Contacts
  console.log("Seeding contacts...");
  const contactSamples = [
    { 
      name: "佐々木 健一", 
      email: "sasaki.ken@example.com", 
      subject: "【至急】アカウント乗っ取りの疑いと不正利用・返金について", 
      message: "大至急対応をお願いいたします。自分以外の第三者がログインし、二重決済が発生しているようです。警察への相談も検討しているため、直ちにアクセス履歴の調査と返金手続きを行ってください。" 
    },
    { 
      name: "渡辺 真由美", 
      email: "watanabe.m@example.com", 
      subject: "【緊急】嫌がらせ・ストーカー被害の通報とログ保全要請", 
      message: "緊急でご連絡しております。特定の相手から脅迫めいたメッセージが届いており、身の危険を感じています。対象アカウントの即時停止と、警察への捜査照会に備えた証拠ログの保全をお願いします。" 
    },
    { 
      name: "田中 一郎", 
      email: "tanaka@example.com", 
      subject: "【不具合報告】モバイル版カメラ撮影時に500エラーで画面がクラッシュする", 
      message: "eKYC本人確認の撮影画面で、カメラを起動しようとすると画面がフリーズしてクラッシュし、エラーコード500が表示されて先に進めません。至急バグの修正をお願いします。" 
    },
    { 
      name: "伊藤 美咲", 
      email: "ito.misaki@example.com", 
      subject: "【システム障害】SMS認証コードが受信できずボタンが押せません", 
      message: "携帯番号を入力して認証コードを送信しましたが、10分以上待ってもSMSが届きません。画面がロード中のままタイムアウトしてしまいます。" 
    },
    { 
      name: "山田 太郎", 
      email: "yamada@example.com", 
      subject: "【アカウント】ログインパスワードの再設定とメールアドレス変更", 
      message: "以前登録したメールアドレスを変更したいため、パスワード再設定とユーザープロフィールの更新手順を教えてください。" 
    },
    { 
      name: "高橋 三郎", 
      email: "takahashi@example.com", 
      subject: "【退会手続き】アカウント削除と個人データの消去依頼", 
      message: "無事に目的の知人と再会できたため、サービスのアカウント退会と登録情報の完全削除をお願いしたいです。手続き方法をご案内ください。" 
    },
    { 
      name: "佐藤 花子", 
      email: "sato@example.com", 
      subject: "広告掲載およびメディア取材の依頼について", 
      message: "WEBメディア編集部です。ReMEETsの温かい想い出ボトルメールの取り組みについて取材およびタイアップ掲載を希望しております。広報窓口のご担当者様をご教示いただけますと幸いです。" 
    },
    { 
      name: "鈴木 次郎", 
      email: "suzuki@example.com", 
      subject: "感謝のメッセージ：30年ぶりの再会が叶いました！", 
      message: "このサイトのおかげで30年ぶりに小学校の親友と再会できました！最初は半信半疑でしたが本当に奇跡が起きました。心より感謝申し上げます。" 
    }
  ];
  contactSamples.forEach(c => {
    db.prepare("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)").run(c.name, c.email, c.subject, c.message);
  });

  // Seed Success Stories
  console.log("Seeding success stories...");
  const successStoriesSamples = [
    { message: "30年ぶりに中学時代の親友と再会できました！ボトルメールを流して本当に良かったです。最初は半信半疑でしたが、本人確認の質問に答えてくれた時は鳥肌が立ちました。今は週末に一緒にゴルフに行く仲に戻りました。", era: "1980", gender: "男性", is_public: 1, display_position: "left" },
    { message: "初恋の人を探してボトルを流しました。まさか見つかるとは思っていませんでしたが、共通の知人を通じて連絡が来ました。お互い家庭を持っていますが、当時の思い出を懐かしく語り合える友人が増えて、人生が少し豊かになった気がします。", era: "1990", gender: "女性", is_public: 1, display_position: "right" },
    { message: "恩師に感謝を伝えたくて利用しました。先生はもうご高齢でしたが、私のことを覚えていてくださり、涙ながらに電話で話しました。あの時、先生がかけてくれた言葉が今の私の支えになっています。本当にありがとうございました。", era: "1970", gender: "男性", is_public: 1, display_position: "left" },
    { message: "昔の仕事仲間と再会。みんなで集まって当時の苦労話を肴に飲むお酒は最高でした。このサイトがなければ、一生会うことはなかったかもしれません。素晴らしいサービスをありがとうございます。", era: "2000", gender: "男性", is_public: 1, display_position: "right" },
    { message: "幼馴染と再会できました。お互い近所に住んでいることが分かり、今では家族ぐるみで付き合っています。子供たちも仲良くなり、不思議な縁を感じています。", era: "2010", gender: "女性", is_public: 1, display_position: "left" },
    { message: "趣味のサークルで一緒だった仲間と15年ぶりに連絡が取れました。今は住んでいる場所は離れていますが、オンラインで近況を報告し合っています。またいつか集まれる日を楽しみにしています。", era: "2000", gender: "その他", is_public: 1, display_position: "right" },
    { message: "学生時代のバイト仲間。名前の漢字が思い出せなくて不安でしたが、当時のエピソードを詳しく書いたら見つけてくれました。今はそれぞれ違う道を歩んでいますが、あの頃の情熱は変わっていませんでした。", era: "2010", gender: "男性", is_public: 1, display_position: "left" },
    { message: "震災の時に助けていただいた方にお礼が言いたくて投稿しました。奇跡的にご本人に届き、感謝の気持ちを伝えることができました。この場所があって本当に良かったです。", era: "2010", gender: "女性", is_public: 1, display_position: "right" }
  ];
  successStoriesSamples.forEach((s, idx) => {
    db.prepare("INSERT INTO success_stories (user_id, message, era, gender, is_public, display_position, consent) VALUES (?, ?, ?, ?, ?, ?, 1)")
      .run(userIds[idx % userIds.length], s.message, s.era, s.gender, s.is_public, s.display_position);
  });

  // Seed Action Logs
  console.log("Seeding action logs...");
  const actions = ["USER_LOGIN", "POST_CREATE", "MESSAGE_SEND", "REPORT_SUBMIT", "ADMIN_LOGIN"];
  for (let i = 0; i < 10; i++) {
    db.prepare("INSERT INTO action_logs (user_id, action, details, ip) VALUES (?, ?, ?, ?)")
      .run(userIds[i % userIds.length], actions[i % actions.length], "Sample action details", "127.0.0.1");
  }

  // Seed Access Logs & Page Views with realistic distribution for the perfect Heatmap
  console.log("Seeding realistic access logs & page views across 30 days...");
  const paths = ["/", "/search", "/post/1", "/login", "/register", "/admin"];
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Mobile Safari/537.36"
  ];

  const insertAccessStmt = db.prepare("INSERT INTO access_logs (user_id, path, method, status_code, ip, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertPageViewStmt = db.prepare("INSERT INTO page_views (path, user_id, ip, user_agent, created_at) VALUES (?, ?, ?, ?, ?)");

  // Weighted random JST hour to simulate realistic day traffic profile
  const getWeightedHour = () => {
    const r = Math.random();
    if (r < 0.04) return Math.floor(Math.random() * 6); // 00:00 - 05:59: 4% (Very low night traffic)
    if (r < 0.12) return 6 + Math.floor(Math.random() * 3); // 06:00 - 08:59: 8% (Morning commute start)
    if (r < 0.26) return 9 + Math.floor(Math.random() * 3); // 09:00 - 11:59: 14% (Working/School hours)
    if (r < 0.44) return 12 + Math.floor(Math.random() * 2); // 12:00 - 13:59: 18% (Lunch peak)
    if (r < 0.60) return 14 + Math.floor(Math.random() * 4); // 14:00 - 17:59: 16% (Afternoon work/steady)
    if (r < 0.92) return 18 + Math.floor(Math.random() * 5); // 18:00 - 22:59: 32% (Evening prime time peak!)
    return 23; // 23:00 - 23:59: 8%
  };

  db.transaction(() => {
    db.prepare("DELETE FROM page_views").run();
    db.prepare("DELETE FROM access_logs").run();

    const now = new Date();
    // Pre-seed some logs for each day of the last 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      // Create random number of entries per day: weekdays are steady, weekends are slightly active
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const logsCount = (isWeekend ? 55 : 40) + Math.floor(Math.random() * 25);

      for (let i = 0; i < logsCount; i++) {
        const jstHour = getWeightedHour();
        // Convert JST hour to UTC hour for correct storage
        const utcHour = (jstHour - 9 + 24) % 24;

        const logDate = new Date(now.getTime());
        logDate.setDate(now.getDate() - dayOffset);
        logDate.setUTCHours(utcHour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

        const timestampStr = logDate.toISOString().replace('T', ' ').substring(0, 19);
        const userId = Math.random() < 0.4 ? userIds[Math.floor(Math.random() * userIds.length)] : null;
        const p = paths[Math.floor(Math.random() * paths.length)];
        const agent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const ip = `192.168.1.${10 + Math.floor(Math.random() * 200)}`;

        // Insert structured, realistic logs
        insertAccessStmt.run(userId, p, "GET", 200, ip, agent, timestampStr);

        // Populate corresponding page views for 70% of accessibility
        if (Math.random() < 0.70) {
          insertPageViewStmt.run(p, userId, ip, agent, timestampStr);
        }
      }
    }

    // Seed payment transactions with realistic data (including eKYC rejected unrefunded for audit alert testing)
    db.prepare("DELETE FROM payment_transactions").run();
    const insertTxStmt = db.prepare(`
      INSERT INTO payment_transactions (
        transaction_id, user_id, post_id, type, status, ekyc_status, amount, payment_method, description, stripe_payment_intent_id, stripe_fee, ekyc_cost, sms_cost, net_profit, refund_reason, refunded_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleTxs = [
      {
        tx_id: "tx_pay_1001",
        user_id: userIds[0] || null,
        post_id: null,
        type: "letter_open",
        status: "completed",
        ekyc_status: "passed",
        amount: 600,
        description: "旧友との手紙開封・連絡先安全開示（eKYC確認＋600円オーソリ確定）",
        stripe_intent: "pi_stripe_1001_live",
        stripe_fee: 22,
        ekyc_cost: 200,
        sms_cost: 10,
        net_profit: 368,
        refund_reason: null,
        refunded_at: null,
        created_at: new Date(now.getTime() - 86400000 * 2).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        tx_id: "tx_pay_1002",
        user_id: userIds[1] || null,
        post_id: null,
        type: "letter_open",
        status: "pending",
        ekyc_status: "rejected",
        amount: 600,
        description: "【監査アラート対象】eKYC本人確認書類不鮮明・記載氏名不一致のため否認。600円仮売上の自動返金未処理",
        stripe_intent: "pi_stripe_1002_auth",
        stripe_fee: 22,
        ekyc_cost: 200,
        sms_cost: 10,
        net_profit: 368,
        refund_reason: null,
        refunded_at: null,
        created_at: new Date(now.getTime() - 3600000 * 2).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        tx_id: "tx_pay_1003",
        user_id: userIds[2] || null,
        post_id: null,
        type: "letter_open",
        status: "pending",
        ekyc_status: "rejected",
        amount: 600,
        description: "【監査アラート対象】マイナンバーカード生年月日不一致のため否認。返金未処理",
        stripe_intent: "pi_stripe_1003_auth",
        stripe_fee: 22,
        ekyc_cost: 200,
        sms_cost: 10,
        net_profit: 368,
        refund_reason: null,
        refunded_at: null,
        created_at: new Date(now.getTime() - 3600000 * 5).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        tx_id: "tx_pay_1004",
        user_id: userIds[3] || null,
        post_id: null,
        type: "letter_open",
        status: "refunded",
        ekyc_status: "rejected",
        amount: 600,
        description: "eKYC審査否認に伴う自動オーソリ取消・全額返金完了",
        stripe_intent: "pi_stripe_1004_ref",
        stripe_fee: 0,
        ekyc_cost: 200,
        sms_cost: 10,
        net_profit: -210,
        refund_reason: "eKYC審査不合格に伴う自動キャンセル",
        refunded_at: new Date(now.getTime() - 3600000 * 12).toISOString().replace('T', ' ').substring(0, 19),
        created_at: new Date(now.getTime() - 86400000 * 3).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        tx_id: "tx_pay_1005",
        user_id: userIds[4] || null,
        post_id: null,
        type: "donation",
        status: "completed",
        ekyc_status: "none",
        amount: 3000,
        description: "ReMEETsプラットフォーム開発・サーバー維持費サポーター寄付",
        stripe_intent: "pi_stripe_1005_don",
        stripe_fee: 108,
        ekyc_cost: 0,
        sms_cost: 0,
        net_profit: 2892,
        refund_reason: null,
        refunded_at: null,
        created_at: new Date(now.getTime() - 86400000 * 4).toISOString().replace('T', ' ').substring(0, 19)
      }
    ];

    sampleTxs.forEach(t => {
      insertTxStmt.run(
        t.tx_id, t.user_id, t.post_id, t.type, t.status, t.ekyc_status, t.amount,
        'stripe_card', t.description, t.stripe_intent, t.stripe_fee, t.ekyc_cost,
        t.sms_cost, t.net_profit, t.refund_reason, t.refunded_at, t.created_at
      );
    });
  })();
};

// ==========================================
// 1. 人名・旧姓・ニックネーム・ユーザー名辞書
// ==========================================

const LAST_NAMES = [
  "佐藤", "鈴木", "高橋", "田中", "渡辺", "伊藤", "山本", "中村", "小林", "加藤",
  "吉田", "山田", "佐々木", "山口", "松本", "井上", "木村", "林", "斎藤", "清水",
  "阿部", "森", "池田", "橋本", "山下", "石川", "中島", "前田", "藤田", "小川",
  "後藤", "岡田", "長谷川", "村上", "近藤", "石井", "坂本", "遠藤", "青木", "藤井",
  "西村", "福田", "三浦", "藤原", "岡本", "松田", "中川", "中野", "原田", "小野",
  "竹内", "田村", "金子", "和田", "中山", "石田", "上田", "森田", "原", "柴田",
  "酒井", "工藤", "横山", "宮崎", "宮本", "内田", "高木", "安藤", "島田", "谷口",
  "大野", "高田", "丸山", "今井", "河野", "藤本", "武田", "村田", "上野", "杉山",
  "増田", "平野", "大塚", "千葉", "久保", "松井", "岩崎", "木下", "野口", "松尾",
  "菊地", "野村", "新井", "渡部", "大西", "桜井", "飯田", "西田", "西山", "吉川",
  "本田", "五十嵐", "川口", "中西", "小山", "福島", "安田", "川崎", "古川", "久保田",
  "北村", "南", "秋山", "辻", "川上", "吉村", "小池", "浅野", "荒木", "大久保",
  "熊谷", "松岡", "野沢", "星野", "白石", "望月", "黒田", "堀", "永井", "尾崎"
];

const MALE_FIRST_NAMES_SHOWA = [
  "健一", "太郎", "浩二", "直樹", "和也", "大輔", "健太", "拓也", "亮太", "雄大",
  "慎一", "浩司", "拓海", "翔太", "直人", "智也", "隆", "健", "真一", "剛",
  "健二", "茂", "裕太", "浩一", "芳雄", "誠", "一郎", "博", "和夫", "正",
  "勇", "聖", "達也", "嗣", "昭二", "哲也", "潤", "悟", "裕介", "修",
  "秀樹", "勝", "清", "進", "稔", "修平", "康平", "貴之", "正樹", "洋平",
  "博之", "俊輔", "圭介", "大介", "宏", "敏行", "英樹", "信吾", "浩幸", "泰造"
];

const FEMALE_FIRST_NAMES_SHOWA = [
  "美咲", "由美", "さくら", "真理子", "愛", "舞", "結衣", "萌", "菜々子", "美紀",
  "恵", "奈央", "裕子", "恵美", "美穂", "あゆみ", "久美", "恵子", "由紀子", "美香",
  "明日香", "真由美", "順子", "明美", "智子", "久美子", "直美", "さゆり", "みゆき",
  "陽子", "佳代", "佳代子", "りさ", "香織", "洋子", "裕美", "雅美", "千春", "和恵",
  "裕加", "直子", "真澄", "恵理", "真弓", "志保", "綾子", "絵美", "麻美", "理恵",
  "敦子", "節子", "幸子", "和代", "敏子", "洋美", "典子", "優子", "悦子", "文子"
];

const MALE_FIRST_NAMES_HEISEI = [
  "翔太", "蓮", "大輝", "陸", "悠真", "湊", "颯太", "樹", "悠人", "陽翔",
  "蒼", "大和", "朝陽", "拓真", "怜", "隼人", "颯", "琉生", "一真", "優斗",
  "晴斗", "航平", "海斗", "陽太", "快斗", "響", "亮介", "涼太", "真央", "圭佑",
  "伊吹", "悠斗", "陽向", "大翔", "結斗", "優真", "颯真", "陸斗", "律", "奏太",
  "匠", "陸人", "悠", "壮真", "慧", "航大", "瑛太", "陽生", "誠也", "晴"
];

const FEMALE_FIRST_NAMES_HEISEI = [
  "陽葵", "凛", "結菜", "芽依", "莉子", "葵", "紬", "咲良", "結月", "心春",
  "七海", "楓", "美桜", "彩花", "優奈", "琴音", "栞", "千尋", "心愛", "希星",
  "海空", "愛莉", "日向", "結愛", "美羽", "花音", "朱莉", "杏", "未来", "澪",
  "穂乃花", "結衣", "美月", "紗良", "羽奏", "心結", "詩", "愛菜", "美結", "優月",
  "花", "鈴", "莉央", "結花", "遥", "日菜", "柚葉", "真白", "心音", "小春"
];

const AUTHENTIC_HUMAN_NICKNAMES = [
  // 1. 親しみある愛称・ちゃん/くん/っち/坊/ぽん/りん/きー/たん等 (200種)
  "たっくん", "さっちゃん", "まー坊", "ゆきりん", "けんけん", "なっちゃん", "りょうくん", "あっきー",
  "ともくん", "ゆうちゃん", "ミキティー", "しんちゃん", "かなぽん", "ひろっち", "だいちゃん", "えりりん",
  "なおぽん", "かずぼー", "ゆみっぺ", "としぼー", "けいちゃん", "じゅんじゅん", "りかちん", "たけ坊",
  "めぐっぺ", "しんごっち", "ゆかちん", "ともき", "けいたん", "まっちゃん", "あっくん", "りょーちん",
  "みぽりん", "まゆゆ", "まいまい", "よっしー", "うっちー", "かっちゃん", "しょーちゃん", "こうちゃん",
  "てっちゃん", "まこっちゃん", "ひーくん", "おーちゃん", "つよぽん", "のぶくん", "ひでじい", "きよちゃん",
  "ちーちゃん", "みっちゃん", "あっちゃん", "えっちゃん", "ともみん", "あいぼん", "まいちん", "ななみん",
  "りこぴん", "ほのぼの", "あおちゃん", "さくちゃん", "つむちゃん", "ゆづき", "こっちゃん", "ふーみん",
  "みうみう", "かのん", "あかりん", "あんちゃん", "みきぽん", "れいちゃん", "すずちゃん", "はなちゃん",
  "たいちゃん", "しゅう", "りゅう", "そうちゃん", "ゆうぼう", "ひろくん", "かずくん", "じん",
  "けいぼー", "はやと", "たく", "なおき", "まさくん", "とし", "こうへい", "りょうへい",
  "ぽん太", "みーちゃん", "のんちゃん", "りっちゃん", "きっぺい", "ぐんそう", "かんた", "そうた",
  "けんぼー", "ゆーすけ", "だいすけ", "しょうご", "たかぴー", "のぞみん", "みどり", "かおりん",
  "ちかちゃん", "あやの", "はるか", "まりりん", "れいな", "さゆりん", "ゆうな", "もえぴー",
  "ゆっきー", "みっけ", "ぼっちゃん", "おかっち", "いっぺい", "しょーへい", "しんぺい", "りょうた",
  "こうき", "だいき", "ゆうと", "はると", "みなと", "りく", "そらた", "かいちん",
  "ひかる", "あきひろ", "やす", "まさぽん", "のぶっち", "つかさ", "こうへー", "ゆうすけ",
  "しゅんしゅん", "りょうすけ", "ともや", "かずき", "だいご", "こうた", "しょうたろう", "ゆうたろう",
  "りょうま", "しんたろう", "そうすけ", "じんた", "えいた", "りんと", "はるひと", "ゆうま",
  "あおいちん", "さきっぺ", "まゆぽん", "えみりん", "なつみん", "ちひろっち", "しおりん", "ほのかっち",
  "あすかっち", "みほっち", "あゆみん", "くみっきー", "ゆきな", "りさぽん", "ともよ", "ちえみ",
  "なおみん", "さゆみん", "まりこっち", "じゅんこりん", "あけみん", "ともこっち", "くみこりん", "直ちゃん",
  "陽子たん", "佳代っち", "カヨちゃん", "リサっち", "かおりっち", "洋子りん", "ゆみちん", "雅美っち",

  // 2. 名字ベースの親しみあるあだ名 (150種)
  "やまちゃん", "たけちゃん", "こばやん", "たなっち", "すーさん", "もりちゃん", "おが",
  "のむさん", "すぎちゃん", "ほりさん", "かわちゃん", "ふじさん", "みうらっち", "きくっちゃん", "あべちゃん",
  "いけちゃん", "はしもっちゃん", "まえださん", "ごとうっち", "おかだん", "いっしー", "むらかみっち",
  "こんちゃん", "あおきん", "ふじいちゃん", "おおたっち", "よしだん", "ぐっさん", "まつぼー", "いのっち",
  "きむ兄", "なかじ", "しみずん", "ささやん", "わたりん", "ざっきー", "もりっち", "うっちーさん",
  "おのっち", "たけっち", "たむさん", "かねごん", "わだっち", "なかさん", "いしっち", "うえぽん",
  "もりぽん", "はらちゃん", "しばっち", "さかいん", "くどうっち", "よこっち", "みやっち", "もっちー",
  "うっちー先輩", "たかぎん", "あんちゃん先輩", "しまっち", "たにやん", "おおのっち", "たかたっち", "まるちゃん",
  "いまいっち", "こうのっち", "ふじもっちゃん", "たけちん", "むらっち", "うえのっち", "すぎさん", "ますだっち",
  "ひらのっち", "づかっち", "ちばちゃん", "くぼっち", "まついっち", "いわっち", "きのっち", "のぐっち",
  "まつおっち", "きくちっち", "のむっち", "あらいっち", "わたべっち", "にしっち", "さくらいっち", "いいだっち",
  "にしだっち", "にしやまん", "よしかわっち", "ほんだっち", "いがらしっち", "かわぐちっち", "なかにしっち", "こやまっち",
  "ふくしまっち", "やすだっち", "かわさきっち", "ふるかわっち", "くぼたっち", "きたむらっち", "みなみっち", "あきやまっち",
  "つじっち", "かわかみっち", "よしむらっち", "こいけっち", "あさのっち", "あらきっち", "おおくぼっち", "くまっち",
  "まつおかっち", "のざわっち", "ほしのっち", "しらいしっち", "もちづきっち", "くろだっち", "ほりっち", "ながいっち", "おざきっち",

  // 3. 当時の部活・係・エピソード・役割 (150種)
  "元サッカー部副部長", "生徒会副会長", "合唱コンクール伴奏者", "元野球部副主将", "図書委員長", "昼の放送DJ",
  "合唱部アルトリーダー", "吹奏楽トランペット", "軽音ドラム担当", "文化祭ステージ班長", "理科実験室の常連",
  "放課後自習室の主", "応援団副団長", "バスケ部ポイントガード", "剣道部先鋒", "柔道部大将", "学級委員",
  "美化委員長", "給食当番リーダー", "広報誌レイアウト係", "陸上部アンカー", "写真部暗室番", "天文台の主",
  "演劇部舞台照明", "バドミントン主将", "卓球部ダブルス", "テニス部前衛", "水泳部メドレーリレー",
  "弓道部皆中賞", "合宿カレー作り担当", "学園祭アーチ設営班", "購買パン争奪戦仲間", "日直ペア",
  "放送席の実況担当", "吹奏楽パーカス", "美術部幽霊部員", "軽音ギター担当", "文化祭実行委員",
  "ピアノ伴奏係", "元キャプテン", "元マネージャー", "生徒会長", "元野球部エース", "サッカー部10番",
  "バスケ部シューター", "バレー部セッター", "陸上部スプリンター", "体操部キャプテン", "水泳部自由形エース",
  "テニス部部長", "バドミントン部部長", "卓球部主将", "剣道部大将", "柔道部主将", "空手部主将",
  "弓道部主将", "吹奏楽部部長", "合唱部ソプラノリーダー", "軽音ベース担当", "演劇部大道具係", "美術部部長",
  "写真部部長", "放送部部長", "茶道部部長", "華道部部長", "書道部部長", "新聞部編集長", "文芸部部長",
  "化学実験部部長", "生物部飼育係", "地学部観測係", "ボランティア部長", "生徒会書記", "生徒会会計",
  "体育祭ブロック長", "文化祭音響係", "修学旅行班長", "林間学校炊事係", "卒業アルバム制作班", "保健委員長",
  "体育委員長", "生活指導委員", "風紀委員", "視聴覚委員", "購買委員", "清掃リーダー", "花壇水やり係",

  // 4. 自然な情景・趣味・雰囲気・ペンネーム (150種)
  "ソラ", "ハル", "モモ", "レオ", "レン", "リン", "カイト", "ヒビキ", "ミント", "ポチ", "コロ", "コテツ",
  "青空", "ひまわり", "旅人", "夕焼け", "海風", "銀杏並木", "星空", "珈琲好き", "読書好き", "猫好き",
  "カメラ小僧", "散歩道", "夜汽車", "風鈴", "蛍火", "木漏れ日", "潮風", "波音", "一番星", "雪だるま",
  "さくらんぼ", "若葉", "銀河", "ポプラ", "つばめ", "秋桜", "鈴蘭", "琥珀", "翡翠", "瑠璃",
  "ギター弾き", "ラジオ少年", "サイクリスト", "写真好き", "山登り", "古本好き", "映画ファン",
  "アコースティック", "レコードマニア", "スケッチブック", "夜空の星", "朝焼けの海", "野良猫の友",
  "夕暮れの影", "路地裏散歩", "喫茶店めぐり", "雨宿り", "緑の風", "木陰のベンチ", "野原の風",
  "木漏れ日の庭", "星の砂", "茜空", "波しぶき", "冬の星座", "春風", "夏雲", "秋風", "初雪",
  "ひぐらしの森", "水たまりの空", "夕暮れのサイレン", "線路沿いの花", "港の灯台", "古い切符", "白樺並木",
  "月夜の散歩", "夏の夕立", "秋の夕日", "冬の朝露", "春の小川", "野鳥観察", "星見の丘", "潮騒の岬",
  "雨音のリズム", "朝靄の山道", "落ち葉の絨毯", "桜吹雪の道", "夕立のあと", "冬のぬくもり", "春告げ鳥",
  "夏木立", "秋晴れの空", "木枯らしの街", "粉雪の舞", "陽だまりの縁側", "風の便り", "波打ち際", "遠い水平線"
];

const USERNAME_PREFIXES = [
  "sky_blue", "daiki", "momo", "guitar", "traveler", "coffee", "ken", "tomo", "ryo",
  "hanako", "kazu", "daisuke", "yuki", "shin", "aya", "yosuke", "shota", "ren",
  "haruto", "minato", "souta", "aoi", "sakura", "rin", "yuna", "mei", "riko",
  "kaito", "hibiki", "haru", "nana", "fuka", "miu", "kanon", "akari", "anzu",
  "vintage", "retro", "runner", "music", "photo", "star", "ocean", "forest",
  "breeze", "melody", "sunset", "twilight", "harbor", "station", "campus"
];

const HOMETOWNS = [
  "東京都世田谷区", "東京都杉並区", "東京都武蔵野市", "東京都八王子市", "東京都台東区",
  "神奈川県横浜市青葉区", "神奈川県鎌倉市", "神奈川県藤沢市", "神奈川県川崎市", "神奈川県小田原市",
  "埼玉県さいたま市大宮区", "埼玉県川越市", "埼玉県所沢市", "埼玉県越谷市",
  "千葉県千葉市中央区", "千葉県船橋市", "千葉県柏市", "千葉県松戸市", "千葉県市川市",
  "大阪府大阪市北区", "大阪府吹田市", "大阪府豊中市", "大阪府枚方市", "大阪府堺市",
  "京都府京都市左京区", "京都府宇治市", "兵庫県神戸市東灘区", "兵庫県西宮市", "兵庫県姫路市",
  "愛知県名古屋市千種区", "愛知県岡崎市", "愛知県豊橋市", "静岡県静岡市葵区", "静岡県浜松市",
  "北海道札幌市中央区", "北海道函館市", "北海道旭川市", "北海道小樽市",
  "宮城県仙台市青葉区", "福島県郡山市", "新潟県新潟市中央区", "長野県松本市",
  "広島県広島市中区", "岡山県岡山市", "福岡県福岡市早良区", "福岡県北九州市", "熊本県熊本市"
];

const SCHOOLS_AND_ORGS = [
  "世田谷第一中学校", "都立桜町高校", "横浜青葉高校", "鎌倉学園高校", "千葉東高校",
  "県立浦和西高校", "大阪府立北野高校", "京都府立洛北高校", "神戸市立葺合高校", "愛知県立旭丘高校",
  "札幌旭丘高校", "仙台第一高校", "福岡県立修猷館高校", "広島市立基町高校", "静岡市立高校",
  "早稲田大学理工学部", "慶應義塾大学文学部", "立教大学経済学部", "同志社大学神学部", "関西学院大学法学部",
  "東京理科大学応用化学科", "青山学院大学国際政治経済学部", "明治大学商学部", "中央大学法学部",
  "下北沢のヴィンテージ古着店", "渋谷のITベンチャー創業チーム", "神保町の老舗古書店",
  "吉祥寺のジャズ喫茶", "地元の少年野球リトルリーグ", "市民オーケストラ交響楽団",
  "駅前商店街の文房具店", "代官山デザイン設計事務所", "秋葉原の老舗電子パーツ店",
  "地元の少年少女合唱団", "大学の自主映画制作サークル", "全国学生ボランティア連盟"
];

const UNSPLASH_IMAGES = [
  "1590615370581-2656198fdf62", "1542314831-068cd1dbfeeb", "1570129476815-ba368ac77013", 
  "1555529323-4484029793c9", "1529339061831-13350290918a", "1496116218417-1a781b1c416c", 
  "1531949103042-ad6d7b433792", "1560264280-88b68371db39", "1507525428034-b723cf961d3e",
  "1519681393784-d120267933ba", "1470071459604-3b5ec3a7fe05", "1497436072909-60f360e1d4b1",
  "1501785888041-af3ef285b470", "1518495973542-4542c06a5843", "1469474968028-56623f02e42e",
  "1506744038136-46273834b3fb", "1511497584788-87676104235f", "1472214103451-9374bd1c798e",
  "1534447677768-be436bb09401", "1492691527719-9d1e07e534b4"
];

interface MemorySceneTheme {
  category: "friend" | "work" | "love" | "family" | "other";
  relation: string;
  contextTemplates: string[];
  messageTemplates: string[];
  q1Templates: { q: string; a: string }[];
  q2Templates: { q: string; a: string }[];
}

// 豊富な30ジャンルの情緒ある想い出テーマと、完全自然なクイズ＆正解集（機械的な番号・付加文字列一切なし）
const MEMORY_THEMES: MemorySceneTheme[] = [
  // 1. 吹奏楽部
  {
    category: "friend",
    relation: "吹奏楽部のパート仲間",
    contextTemplates: [
      "{school}の吹奏楽部で共に汗を流した仲間です。私はトロンボーン、相手はユーフォニアムを担当していました。",
      "{school}の音楽室で夕暮れまでアンサンブルの練習を重ねた同期です。",
      "夏のコンクールに向けて合宿所で夜遅くまで音合わせをした親友です。"
    ],
    messageTemplates: [
      "夕焼けの音楽室で一緒に吹いたハーモニー、今でも鮮明に覚えています。金賞を獲ったあの瞬間の涙と抱擁は一生の宝物です。元気ですか？",
      "コンクール直前の厳しい練習を乗り越えられたのは、あなたが隣で笑顔で支えてくれたからです。またいつか一緒に音を奏でたいですね。",
      "卒業式の日に部室の黒板にみんなで寄せ書きをしたのが懐かしいです。あの頃の情熱を思い出し、ふと手紙を書きました。"
    ],
    q1Templates: [
      { q: "夏のコンクール地区予選で金賞を受賞した思い出の自由曲の題名は？", a: "アルヴァマー序曲" },
      { q: "アンサンブルコンテストで演奏した管楽四重奏の曲名は？", a: "テレプシコーレ舞曲集" },
      { q: "コンクール本番の課題曲でソロを担当したトランペットの曲名は？", a: "風紋" },
      { q: "定期演奏会のフィナーレで全員で演奏した定番アンコール曲は？", a: "宝島" },
      { q: "秋の学校祭のオープニングで演奏したヒット曲のタイトルは？", a: "学園天国" }
    ],
    q2Templates: [
      { q: "パート練習の合間に音楽室のベランダで隠れて食べたアイスの味は？", a: "ソーダ味パピコ" },
      { q: "合宿所の夜、パート全員でお揃いで購入したお守りストラップの色は？", a: "スカイブルー" },
      { q: "顧問の先生が練習の合間に差し入れてくれた名物ドリンクは？", a: "ポカリスエット瓶" },
      { q: "楽器ケースのネームタグの裏に油性ペンで書いた合言葉は？", a: "一音心奏" },
      { q: "全国大会直前の決起集会でみんなで食べた名物弁当は？", a: "カツ勝つ弁当" }
    ]
  },
  // 2. 野球部
  {
    category: "friend",
    relation: "野球部のバッテリー・チームメイト",
    contextTemplates: [
      "{school}の野球部でピッチャーとキャッチャーのバッテリーを組んでいました。",
      "白球を泥だらけになって追いかけた{school}野球部のチームメイトです。",
      "グラウンドで朝から晩までノックを受け続けた高校時代の戦友です。"
    ],
    messageTemplates: [
      "夏の大会、延長12回のサヨナラ勝ち。マウンドで抱き合って泣いたあの日の熱気は、今も私の背中を押してくれています。またキャッチボールをしよう。",
      "炎天下のグラウンドで泥まみれになりながら甲子園を目指した日々。あの厳しい練習を共にした君の顔が浮かび、ペンを取りました。",
      "最後の夏、悔し涙を流したロッカールームで交わした約束を覚えていますか？お互い大人になった今、近況を語り合いたいです。"
    ],
    q1Templates: [
      { q: "最後の夏の大会で劇的なサヨナラ勝ちを決めた対戦相手の高校名は？", a: "明青高校" },
      { q: "練習試合の帰りにみんなで自転車で立ち寄った定食屋の大盛りメニューは？", a: "ジャンボチキンカツ定食" },
      { q: "キャプテンが最後のミーティングで部室の白板に書いた部訓の言葉は？", a: "全員野球" },
      { q: "炎天下のシートノックで監督が最後に打ち込んだ特守の球数は？", a: "百本ノック" },
      { q: "公式戦の前にマネージャーが部員全員に渡してくれた手作りお守りは？", a: "千羽鶴マスコット" }
    ],
    q2Templates: [
      { q: "部室の冷蔵庫に常備してみんなで奪い合った冷凍チューペットの色は？", a: "オレンジ色" },
      { q: "グラウンド整備のトンボ掛けの後に自販機で飲んだ炭酸飲料は？", a: "リアルゴールド" },
      { q: "グローブの手入れ用に二人で愛用していた保革オイルの缶の色は？", a: "黄色いローリングス缶" },
      { q: "遠征バスの移動中にウォークマンで二人で聴いた応援歌は？", a: "栄冠は君に輝く" },
      { q: "厳しい冬の朝練の後にグラウンド脇でみんなで食べた差し入れは？", a: "熱々の豚汁" }
    ]
  },
  // 3. 映画サークル・自主制作
  {
    category: "friend",
    relation: "自主映画制作サークルの仲間",
    contextTemplates: [
      "{school}で8ミリフィルムやminiDVを回して自主制作映画を撮っていた仲間です。",
      "大学の映画研究会で、監督とカメラマンとして深夜まで編集室に籠もっていた同期です。",
      "脚本を何十回も書き直し、ロケハンで街中を歩き回った青春のパートナーです。"
    ],
    messageTemplates: [
      "夕暮れの坂道をカメラを担いで走り抜けた日々。インディーズ映画祭で拍手を浴びたあの瞬間は、私の人生最高の宝物です。元気ですか？",
      "編集室でカップ麺をすすりながら朝を迎えたあの熱気。今の自分があるのは、あの時君と本気で夢を語り合えたからです。",
      "上映会のスクリーンの前で震えながら幕が上がるのを待ったね。君の撮った映像の美しさを、今でも思い出します。"
    ],
    q1Templates: [
      { q: "自主映画祭で観客賞を受賞した短編作品のタイトルは？", a: "夕暮れグラフィティ" },
      { q: "メインロケ地として撮影許可をもらった川沿いのレトロな喫茶店名は？", a: "喫茶モナリザ" },
      { q: "徹夜の編集作業中に主食にしていたお気に入りのカップ麺は？", a: "シーフードヌードル" },
      { q: "クライマックスの雨宿りシーンを撮影した神社の鳥居の名前は？", a: "日吉神社" },
      { q: "主演俳優の衣装として下北沢の古着屋で買ったレトロなジャケットの色は？", a: "からし色" }
    ],
    q2Templates: [
      { q: "カメラのレンズキャップの裏に目印として貼っていたシールの柄は？", a: "ペンギンマーク" },
      { q: "クランクアップの日にみんなで乾杯した瓶ビールの銘柄は？", a: "サッポロ赤星" },
      { q: "ロケ移動用の軽ワゴンの助手席ダッシュボードに置いてあった芳香剤の香りは？", a: "スカッシュ" },
      { q: "台本の表紙を留めていた大型ダブルクリップの色は？", a: "真鍮ゴールド" },
      { q: "上映会のポスターに二人で手書きで添えたキャッチコピーは？", a: "僕らの青い季節" }
    ]
  },
  // 4. ITスタートアップ・開発同期
  {
    category: "work",
    relation: "創業期オフィスの開発同期",
    contextTemplates: [
      "{school}の小さなオフィスでサービスの初期ローンチに奮闘したエンジニアとデザイナーのコンビです。",
      "渋谷の雑居ビルでピザを食べながら朝までデバッグ作業を共にした創業初期の戦友です。",
      "初めてのプロダクトリリース前夜、不眠不休でサーバー設定をやり切った仲間です。"
    ],
    messageTemplates: [
      "ピザの箱が積み上がったオフィスで、リリースボタンを押した瞬間のあの静寂と歓声。あの情熱は今の私の礎です。久しぶりに語り合いたいですね。",
      "深夜3時に非常階段から見上げた東京の夜景、覚えていますか？過酷だったけれど本当に楽しい日々でした。元気でやっていますか？",
      "どんな困難なバグにも諦めずに立ち向かってくれたあなたの姿に救われました。あの頃の感謝を伝えたくて手紙を流します。"
    ],
    q1Templates: [
      { q: "ベータ版リリースのコードネームとして設定したプロジェクト名は？", a: "プロジェクトフェニックス" },
      { q: "徹夜明けにビルの非常階段から見上げた東京タワーのライトアップ色は？", a: "ランドマークライト" },
      { q: "オフィスの地下にあったチーム御用達の中華料理屋の名物料理は？", a: "黒胡麻担々麺" },
      { q: "サーバーダウンの危機を救った伝説の緊急ホットフィックスのコミット名は？", a: "fix-all-hope" },
      { q: "オフィスのホワイトボードに描いた初期アーキテクチャの愛称は？", a: "ブループリントワン" }
    ],
    q2Templates: [
      { q: "深夜残業のブレイクタイムにオフィスで淹れていた特製ドリップコーヒー豆は？", a: "マンデリン深煎り" },
      { q: "デスクの卓上加湿器の上に置いていた癒やしのフィギュアは？", a: "ダンボー" },
      { q: "ローンチ成功の記念に社長が全員に奢ってくれた高級アイスの味は？", a: "ハーゲンダッツバニラ" },
      { q: "ホワイトボードの端にずっと消さずに残していた開発スローガンは？", a: "Ship It Fast" },
      { q: "夜食を買いに走った深夜のコンビニでいつも買っていたホットスナックは？", a: "からあげクンレッド" }
    ]
  },
  // 5. 下町の幼馴染
  {
    category: "friend",
    relation: "下町の商店街で育った幼馴染",
    contextTemplates: [
      "{hometown}の路地裏や空き地で日が暮れるまで遊んだ幼馴染です。",
      "駄菓子屋の前でメンコやビー玉、スーパーボールくじで遊んだ幼少期の親友です。",
      "小学校の通学路でいつも待ち合わせをして一緒に登校していたお隣さんです。"
    ],
    messageTemplates: [
      "夕焼けチャイムが鳴るまで空き地の秘密基地で語り合った日々。引っ越してしまってからずっと気になっていました。元気でいますか？",
      "夏休みの朝、首からラジオ体操カードを下げて走った神社。あの頃の無邪気な笑顔がふと浮かび、手紙をボトルに託しました。",
      "大人になって街の景色は変わってしまったけれど、二人で見た夕日は今も心の中にあります。また昔のように笑い合いたいです。"
    ],
    q1Templates: [
      { q: "路地の角にあった駄菓子屋のおばあちゃんの定番の口癖は？", a: "まいどあり" },
      { q: "二人で空き地の奥の木の上に作った秘密基地の合言葉は？", a: "星空ロケット" },
      { q: "夏休みの神社境内で集めていたセミの抜け殻を入れたプラスチックケースの色は？", a: "黄緑色" },
      { q: "駄菓子屋の店先のガチャガチャで二人でコンプリートを目指した消しゴムは？", a: "キン肉マン消しゴム" },
      { q: "縁日の屋台で二人で夢中になってすくった金魚を入れたビニール袋の紐の色は？", a: "赤色" }
    ],
    q2Templates: [
      { q: "夕方の銭湯の湯上がりにいつも番台で買ってもらって飲んだ瓶飲料は？", a: "フルーツ牛乳" },
      { q: "夏休みのラジオ体操の皆勤賞でもらった文房具のセットは？", a: "ドラえもん下敷き" },
      { q: "自転車のスポークに挟んでカチカチ音を鳴らして遊んでいたカードは？", a: "プロ野球カード" },
      { q: "雨の日に秘密基地に持ち込んで雨宿りしながら食べたおやつは？", a: "ベビースターラーメン" },
      { q: "駄菓子屋のくじ引きで大当たりが出て手に入れた特大水鉄砲の色は？", a: "メタリックブルー" }
    ]
  },
  // 6. 予備校・大学受験
  {
    category: "friend",
    relation: "予備校の自習室で机を並べた戦友",
    contextTemplates: [
      "予備校の自習室で朝から晩まで机を並べて受験勉強に励んだ戦友です。",
      "模試の判定に一喜一憂しながら、励まし合って合格を目指した浪人時代の仲間です。",
      "夜遅くの予備校帰りに駅前の立ち食いそばを一緒にすすった同期です。"
    ],
    messageTemplates: [
      "ペンだこを作りながら赤本を解き明かしたあの1年間。あの過酷な受験期を乗り切れたのは、隣で君が黙々と努力していたからです。感謝を伝えたいです。",
      "合格発表の日、掲示板の前で抱き合って涙した瞬間を今でも覚えています。それぞれの道を歩んでいますが、君の幸せを祈っています。",
      "単語帳をボロボロになるまでめくった日々。ふと昔の参考書を見返して君を思い出しました。元気ですか？"
    ],
    q1Templates: [
      { q: "夜遅くに自習室を出た後、二人で駆け込んだ駅前立ち食いそば屋のメニューは？", a: "かき揚げ天玉そば" },
      { q: "英単語ターゲットの表紙に合格祈願で貼っていた赤ペンの祈願文字は？", a: "絶対合格" },
      { q: "模試の判定が出た日に屋上で二人で食べたゲン担ぎのお菓子は？", a: "キットカット" },
      { q: "冬期の直前講習で毎日朝一番に二人で最前列を確保したカリスマ講師の科目名は？", a: "現代文読解法" },
      { q: "自習室の席取りのために毎朝開館前から並んだ予備校の号館番号は？", a: "本館3号館" }
    ],
    q2Templates: [
      { q: "自習室のデスクで睡魔と戦うためにいつも飲んでいた目薬の銘柄は？", a: "サンテFXネオ" },
      { q: "二人でお揃いでペンケースに入れていた濃いマークシート用鉛筆の硬度は？", a: "2B鉛筆" },
      { q: "湯島天神へ初詣に行った時に二人で買ったお守りの絵柄は？", a: "学業成就の白梅" },
      { q: "センター試験前夜に電話でお互いに掛け合った最後の励ましの合言葉は？", a: "いつも通りにいこう" },
      { q: "合格通知が届いた日の夜に二人で祝杯を挙げた駅前のファミレスは？", a: "ロイヤルホスト" }
    ]
  },
  // 7. アルバイト（喫茶・カフェ）
  {
    category: "work",
    relation: "学生時代のアルバイト仲間",
    contextTemplates: [
      "{hometown}のレトロな喫茶店でホールとキッチンとして働いた仲間です。",
      "深夜のファミレスでフロア清掃やモーニング仕込みを共にしたバイト仲間です。",
      "大型書店で新刊の陳列やPOP作りを競い合った同期のスタッフです。"
    ],
    messageTemplates: [
      "忙しいピークタイムをアイコンタクトで乗り切った連携プレー、本当に楽しかったです。バイト上がりに食べた深夜の賄いの味が忘れられません。",
      "閉店後の店内でBGMを聴きながらモップ掛けをした時間、他愛のない将来の夢を語り合いましたね。あの頃の君に会いたいです。",
      "失敗して落ち込んでいた私を店長からかばってくれた優しいあなた。あの時の温かさに心から感謝しています。"
    ],
    q1Templates: [
      { q: "アルバイトの賄い（まかない）で店長が作ってくれた特製裏メニューは？", a: "ガーリックオムライス" },
      { q: "土日のピーク時に一番注文が入って手が回らなくなった看板デザートは？", a: "ジャンボチョコパフェ" },
      { q: "書店の店頭で二人で手書きで作成したおすすめ小説のPOPの色は？", a: "クラフトイエロー" },
      { q: "深夜シフトの終業点検チェックシートの最後に押していたスタンプの印影は？", a: "合格スマイル" },
      { q: "カフェのカウンターで二人で練習してマスターしたラテアートの柄は？", a: "リーフ模様" }
    ],
    q2Templates: [
      { q: "制服のエプロンの右ポケットにいつも常備していた特製メモ帳のサイズは？", a: "ロディア11番" },
      { q: "バイト代が入った日に二人で食べに行った駅前の焼き鳥屋の名前は？", a: "鳥よし" },
      { q: "休憩室のロッカーの鍵に付けていた二人お揃いのキーホルダーは？", a: "木彫りのフクロウ" },
      { q: "シフト交替の時に引き継ぎノートの余白に描いていた落書きキャラは？", a: "カフェラテ猫" },
      { q: "バイトを辞める最終日に店長から記念にプレゼントされた名入れの道具は？", a: "シルバーマドラー" }
    ]
  },
  // 8. 恩師への感謝
  {
    category: "other",
    relation: "人生の恩師・担任の先生",
    contextTemplates: [
      "{school}で担任をしてくださった恩師の先生を探しています。私は生徒でした。",
      "進路に迷い立ち止まっていた私に親身になって向き合ってくださった{school}の先生です。",
      "部活動の顧問として、人としての礼儀と諦めない心を教えてくださった先生です。"
    ],
    messageTemplates: [
      "先生があの放課後の進路相談でかけてくださった『自分を信じて進めばいい』という言葉が、今も私の人生の道標です。先生、お元気ですか？",
      "不登校気味だった私を毎朝迎えに来てくださり、職員室で温かいお茶を出してくださったこと、一生忘れません。心からの感謝を伝えたくて手紙を書きました。",
      "厳しくも温かいご指導のおかげで、私も無事に社会人となり人を育てる立場になりました。先生への恩返しとして、元気なお姿を一目拝見したいです。"
    ],
    q1Templates: [
      { q: "先生が毎学期末の学級通信の題名として掲げていたクラスのスローガンは？", a: "風に向かって立て" },
      { q: "先生が放課後の進路相談室でいつも生徒に淹れてくださったお茶の種類は？", a: "静岡の深蒸し茶" },
      { q: "先生が黒板の右上にチョークで毎日欠かさず書いていた今日の一言の言葉は？", a: "日日是好日" },
      { q: "卒業式のホームルームで先生が涙をこらえて生徒全員に手渡してくれた文房具は？", a: "名入れの木軸万年筆" },
      { q: "先生が朝の朝礼でいつも語ってくれた大好きな故事成語は？", a: "臥薪嘗胆" }
    ],
    q2Templates: [
      { q: "先生が職員室のデスクに飾っていた愛用の湯呑みの柄は？", a: "鳥獣戯画" },
      { q: "修学旅行の夜の見回りの時に先生が着ていたジャージの色は？", a: "エンジ色のミズノ" },
      { q: "文化祭の合唱コンクールで先生が指揮棒を振ってくれた自由曲の題名は？", a: "大地讃頌" },
      { q: "先生が愛車のトランクにいつも積んでいた部活動の練習道具は？", a: "木製ノックバット" },
      { q: "卒業アルバムの最後のページに先生が直筆で書き記してくれた四字熟語は？", a: "初志貫徹" }
    ]
  },
  // 9. バスケットボール部
  {
    category: "friend",
    relation: "バスケットボール部のチームメイト",
    contextTemplates: [
      "{school}のバスケットボール部でガードとセンターとしてコンビを組んでいた仲間です。",
      "朝練で毎日体育館の鍵を開けてシュート練習を競い合った戦友です。"
    ],
    messageTemplates: [
      "残り3秒からの劇的な逆転ブザービーター、あの奇跡のシュートは一生忘れられない青春のハイライトです。元気ですか？",
      "コートを汗だくになって走り抜けた日々。あの頃の熱い情熱を思い出し手紙を書きました。"
    ],
    q1Templates: [
      { q: "最後の公式戦で決めた劇的な逆転シュートのプレイ名は？", a: "ブザービーター" },
      { q: "地区大会決勝で激闘を繰り広げたライバル校の名前は？", a: "開南高校" },
      { q: "試合前の円陣でキャプテンの掛け声に合わせて全員で叫んだ合言葉は？", a: "ディフェンス一本" }
    ],
    q2Templates: [
      { q: "部活動の全員共通の練習着にプリントされていた部訓の言葉は？", a: "不撓不屈" },
      { q: "試合用バッシュのシューレース（靴紐）に二人で選んだカラーは？", a: "ネオンイエロー" },
      { q: "練習後に体育館の裏で二人で分けて飲んだ紙パックジュースは？", a: "リプトンレモンティー" }
    ]
  },
  // 10. そろばん塾・習い事
  {
    category: "friend",
    relation: "そろばん塾の幼馴染",
    contextTemplates: [
      "{hometown}のそろばん塾で暗算のスピードを競い合った仲間です。",
      "放課後に通った書道教室で隣の席で半紙に墨を擦っていた幼馴染です。"
    ],
    messageTemplates: [
      "パチパチと響くそろばんの音と、段位検定に合格した時のハイタッチ。ふと思い出して温かい気持ちになりました。",
      "墨の香りと静かな教室、書き初め展で一緒に金賞を獲ったあの日の誇らしさを覚えています。"
    ],
    q1Templates: [
      { q: "そろばん塾の先生が満点のご褒美にくれた文房具のキャラクターは？", a: "スヌーピー消しゴム" },
      { q: "段位認定試験に合格した時に先生から授与された特製そろばんの枠の色は？", a: "紫檀の黒枠" },
      { q: "書道展で特選を受賞した時に二人で書いた四字熟語の課題は？", a: "春風秋雨" }
    ],
    q2Templates: [
      { q: "塾の帰り道にあった自動販売機でいつも買っていた瓶ジュースは？", a: "チェリオ" },
      { q: "検定試験の前日に先生がみんなに配ってくれた必勝飴の味は？", a: "はちみつ金柑" },
      { q: "文房具入れにしていたカンペンのフタに描かれていたイラストは？", a: "うちのタマ知りませんか" }
    ]
  },
  // 11. 旅行・合宿・修学旅行
  {
    category: "friend",
    relation: "修学旅行の班行動の仲間",
    contextTemplates: [
      "{school}の修学旅行で京都・奈良の班別自主研修を一緒に回った仲間です。",
      "卒業旅行で北海道や沖縄をリュック一つでバックパッカー旅した親友です。"
    ],
    messageTemplates: [
      "ガイドブック片手に迷いながら歩いた古都の石畳。あの旅で共有した笑い声は、今も色褪せない最高の思い出です。",
      "夜の旅館で先生の見回りをやり過ごしながら布団の中で語り明かした将来の夢、覚えていますか？"
    ],
    q1Templates: [
      { q: "修学旅行の班別行動で最初に訪れて感動した枯山水庭園のお寺の名前は？", a: "龍安寺" },
      { q: "参道の茶屋で焼きたてを二人で食べた名物の和菓子は？", a: "みたらし団子" },
      { q: "奈良公園で鹿に囲まれながらみんなで分け合ったおやつの名前は？", a: "鹿せんべい" }
    ],
    q2Templates: [
      { q: "新幹線の車内でみんなで回し食べした駅弁の包み紙の絵柄は？", a: "東海道五十三次" },
      { q: "お土産屋で記念にペアで買った木彫りのキーホルダーの文字は？", a: "京都慕情" },
      { q: "旅館の大部屋で夜中にみんなでこっそり食べたご当地カップ麺は？", a: "どん兵衛天ぷらそば" }
    ]
  },
  // 12. 社員寮・新入社員同期
  {
    category: "work",
    relation: "社員寮で隣部屋だった新入社員同期",
    contextTemplates: [
      "{school}の社員寮で壁越しに声を掛け合いながら新社会人生活を支え合った同期です。",
      "配属初年度の過酷な新人研修を共に乗り越えた同志です。"
    ],
    messageTemplates: [
      "仕事の悩みを打ち明け合ったり、夜中に銭湯やコンビニへ出かけたり。君がいてくれたから新社会人の壁を乗り越えられました。ありがとう。",
      "寮の屋上から一緒に見た初日の出の清々しさ、今でも覚えています。また美味い酒を酌み交わしましょう。"
    ],
    q1Templates: [
      { q: "社員寮の食堂で金曜日の夕飯に決まって出てきた大人気メニューは？", a: "カツカレー" },
      { q: "新人研修の最終プレゼンでチーム全員で勝ち取った賞の名称は？", a: "最優秀イノベーション賞" },
      { q: "初任給が出た最初の週末に二人で奮発して食べに行った焼肉屋の名物は？", a: "特上厚切り牛タン" }
    ],
    q2Templates: [
      { q: "寮の屋上に忍び込んで二人で見た初日の出の方角に見えた山は？", a: "筑波山" },
      { q: "給料日前に二人で割り勘にして食べたスーパーの見切り品惣菜は？", a: "半額コロッケ" },
      { q: "配属初日に上司から手渡された記念の社章ピンバッジの裏の刻印は？", a: "栄光の社訓" }
    ]
  }
];

// 大規模かつ完全に自然な「追加用・情緒記憶バンク」（自然な単語のみ、人工的な番号一切なし）
const NATURAL_ADDITIONAL_QA_BANK = [
  { q: "放課後によく二人で通った駅前のパン屋で一番好きだった惣菜パンは？", a: "焼きそばパン" },
  { q: "夏休みのプール開放の帰りに市民プール前の売店で食べたかき氷のシロップは？", a: "ブルーハワイ" },
  { q: "学芸会の劇の主役に選ばれた時にあなたが演じた役柄の名称は？", a: "オズの魔法使い" },
  { q: "冬のスキー合宿のロッジで冷えた体を温めるためにみんなで飲んだココアの銘柄は？", a: "バンホーテンココア" },
  { q: "雨の日の放課後に図書室の窓際で二人で読んでいた名作小説の題名は？", a: "銀河鉄道の夜" },
  { q: "文化祭のクラス企画の模擬店で一日中鉄板で焼き続けた名物料理は？", a: "広島風お好み焼き" },
  { q: "地元の夏祭りの夜店であなたが射的で見事に撃ち落としたおもちゃは？", a: "ブリキのロボット" },
  { q: "林間学校のキャンプファイヤーで全員で肩を組んで歌ったフォークソングは？", a: "今日の日はさようなら" },
  { q: "高校の購買部で昼休みのチャイムと同時にダッシュして争奪戦になった人気パンは？", a: "チョココロネ" },
  { q: "卒業式の日に教室の後ろの黒板に色チョークで大きく描いた満開の絵は？", a: "桜の大樹" },
  { q: "下校途中の河川敷で二人で拾って飛ばしっこをした平たい小石の枚数は？", a: "水切り七回" },
  { q: "新春の百人一首大会であなたが誰よりも早く取った得意の上の句は？", a: "ちはやぶる" },
  { q: "秋の合唱コンクールでクラス全員で猛練習して金賞を獲った課題曲は？", a: "旅立ちの日に" },
  { q: "理科の実験室でアルコールランプを使って温めたビーカーの中身は？", a: "食塩水" },
  { q: "部活の引退試合の日に後輩たちからプレゼントされた寄せ書き色紙の真ん中の文字は？", a: "感謝感激" },
  { q: "深夜の長距離ドライブで立ち寄ったサービスエリアで食べた温かい名物は？", a: "かき揚げうどん" },
  { q: "二人で初めて登った標高千メートルの山頂で食べたおにぎりの具材は？", a: "紀州南高梅" },
  { q: "駅前の古本屋の店先ワゴンで二人で発掘したビンテージ写真集の表紙は？", a: "夕暮れのパリ" },
  { q: "大学のキャンパスの中庭のベンチでいつも分け合って食べた名物クレープは？", a: "チョコバナナクレープ" },
  { q: "冬の初雪が降った朝に校庭の真ん中に二人で作った雪だるまの鼻にしたものは？", a: "松ぼっくり" },
  { q: "春のお花見でブルーシートを広げてみんなで食べた手作りのお重の中身は？", a: "いなり寿司" },
  { q: "商店街の福引抽選会であなたが見事に引き当てたカランカランの銀賞は？", a: "特製バスタオル" },
  { q: "二人でお揃いで買った革のキーケースに刻印されていたイニシャル文字は？", a: "永遠の絆" },
  { q: "星空観察会で天体望遠鏡を覗いて二人で息を呑んだ夜空の惑星は？", a: "土星の輪" },
  { q: "海辺の民宿で朝食に出された焼きたての香ばしい干物の魚は？", a: "アジの開き" }
];

function generateRealisticUsername(searcherRomaji: string, era: string, index: number): string {
  // 会員番号（ユーザーID）は一貫して UID-6桁数字 の形式で自動付番 (UID-100100〜)
  const baseNum = 100100 + ((index * 37 + 13) % 899000);
  return `UID-${baseNum}`;
}

// 多彩でランダムな書き出し挨拶集（画一的な方程式感を完全排除）
const OPENING_GREETINGS = [
  "", // 挨拶なしで直接本題に入る（自然な書き出し）
  "",
  "",
  "お久しぶりです。",
  "元気にしてるかな？",
  "突然のメッセージで驚かせてしまったらすみません。",
  "ふと昔のことを思い出してペンを取りました。",
  "ご無沙汰しております。",
  "昔の写真を整理していたら、当時の記憶が鮮明に蘇ってきました。",
  "もしこのボトルメールが届いていたら嬉しいです。",
  "あの頃が急に懐かしくなって、ボトルを流してみました。",
  "覚えていますか？",
  "久しぶり！元気にやってる？",
  "ずっと気になっていたのですが、思い切って手紙を書きました。"
];

// 多彩な感情・追憶エピソード挿入フレーズ
const EMOTIONAL_REFLECTIONS = [
  "あの時のあなたの笑顔や言葉が、今でも私の背中を押してくれています。",
  "他愛のない話で大笑いした時間が、今となってはかけがえのない宝物です。",
  "あの過酷な日々を乗り越えられたのは、あなたが隣にいてくれたからでした。",
  "大人になって色々なことがありましたが、あの純粋だった季節をふと思い出します。",
  "急な引っ越しでちゃんとお礼も言えずじまいだったことが、ずっと心残りでした。",
  "それぞれの道を歩んできたけれど、あの頃の情熱は今も色褪せていません。",
  "ふとした瞬間に、当時の空気や匂いまで思い出されることがあります。",
  "あの時あなたがかけてくれた温かい励ましに、心から感謝しています。",
  "今でもあの場所を通るたびに、二人で過ごした日々が目に浮かびます。"
];

// 多彩な結びの言葉（人間味豊かなバラエティ）
const CLOSING_PHRASES = [
  "またいつか昔みたいにお茶でもしながら語り合えたら嬉しいです。",
  "もし見かけたら、気軽に連絡してくださいね。",
  "元気でいてくれることを心から願っています。",
  "またみんなで集まって、あの頃みたいに笑い合おう！",
  "近況だけでも聞かせてもらえたら飛び上がって喜びます。",
  "返信は気にせず、どうかお体に気をつけてお過ごしください。",
  "また美味しいご飯でも食べに行きましょう。",
  "これからもお互い元気で頑張りましょう！",
  "いつかどこかで再会できる日を楽しみにしています。",
  "またキャッチボールしようぜ。",
  "お互い歳をとったけれど、会ったら一瞬であの頃に戻れそうだね。",
  "体に気をつけて、お仕事頑張ってください。",
  "またあの場所で会える日を夢見ています。"
];

/**
 * クイズの答えが日本語として完全であり、頭切れ（長音符・小文字等）や機械的記号を一切含まないことを保証する厳格な恒久バリデーター
 */
export const assertAndSanitizeQuizAnswer = (answer: string, fallbackSubject: string): string => {
  if (!answer) return fallbackSubject;
  let clean = answer.trim();

  // 1. 機械的記号・アンダースコア・サフィックスの完全排除
  clean = clean.replace(/_[0-9]+$/, "").replace(/[\s\t\n]+/g, "");

  // 2. 頭文字が長音符や小文字、助詞等で始まる「頭切れ」パターンの完全防御
  if (/^[ーッャュョィェォゎヶぁぃぅぇぉっ]/.test(clean)) {
    console.warn(`[Quality Guard] Truncated answer detected: "${clean}". Automatically repairing to fallback...`);
    return fallbackSubject;
  }

  // 3. 不自然な助詞始まり（る、の、に、等で始まる3文字以下の単語）の防御
  if (/^[るに行がはとへてただ]/.test(clean) && clean.length <= 3 && !["のり", "トマト", "はさみ"].includes(clean)) {
    console.warn(`[Quality Guard] Awkward prefix detected: "${clean}". Automatically repairing...`);
    return fallbackSubject;
  }

  return clean;
};

/**
 * 既存の手紙・ユーザーデータを一切削除せず、安全に指定件数の想い出ボトルメールを追加生成する関数
 * （完全ランダム・方程式のない自然な作文＆100%ユニーク保証・頭切れゼロ恒久ガードレール完備）
 */
export const generateAdditionalSamplePosts = async (count: number = 50) => {
  console.log(`[Organic Synthesizer] Generating ${count} completely organic, random & unique sample posts (Preserving existing posts)...`);

  const hashedPassword = await bcrypt.hash("password123", 10);
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname) 
    VALUES (?, ?, ?, 'user', 1, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
  `);
  const insertAgeLog = db.prepare(`
    INSERT INTO age_verification_logs (user_id, ip, is_verified, age, reason, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const insertPost = db.prepare(`
    INSERT INTO posts (
      user_id, searcher_name, searcher_full_name, searcher_profile, target_name, 
      target_last_name, target_first_name, target_hometown, target_school, 
      era, category, secret_question, secret_answer, secret_answer_plain, 
      message, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertQ = db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)");

  // 既存の質問・答え・本文・ユーザー名・メールアドレス・差出人氏名・宛先氏名・ニックネームをSetにロードして完全重複排除
  const existingUsernames = new Set<string>(db.prepare("SELECT username FROM users").all().map((r: any) => r.username));
  const existingEmails = new Set<string>(db.prepare("SELECT email FROM users").all().map((r: any) => r.email));
  const existingNicknamesSet = new Set<string>(db.prepare("SELECT nickname FROM users WHERE nickname IS NOT NULL").all().map((r: any) => r.nickname));
  const existingSearcherFullNames = new Set<string>(db.prepare("SELECT searcher_full_name FROM posts WHERE searcher_full_name IS NOT NULL").all().map((r: any) => r.searcher_full_name));
  const existingTargetFullNames = new Set<string>(db.prepare("SELECT target_name FROM posts WHERE target_name IS NOT NULL").all().map((r: any) => r.target_name));
  const existingQ1Set = new Set<string>(db.prepare("SELECT secret_question FROM posts").all().map((r: any) => r.secret_question));
  const existingA1Set = new Set<string>(db.prepare("SELECT secret_answer_plain FROM posts").all().map((r: any) => r.secret_answer_plain));
  const existingQ2Set = new Set<string>(db.prepare("SELECT question FROM post_questions").all().map((r: any) => r.question));
  const existingA2Set = new Set<string>(db.prepare("SELECT answer_plain FROM post_questions").all().map((r: any) => r.answer_plain));
  const existingMessagesSet = new Set<string>(db.prepare("SELECT message FROM posts").all().map((r: any) => r.message));
  const existingProfilesSet = new Set<string>(db.prepare("SELECT searcher_profile FROM posts WHERE searcher_profile IS NOT NULL").all().map((r: any) => r.searcher_profile));

  const eras = ["1970", "1980", "1990", "2000", "2010"];
  let insertedCount = 0;
  const currentMaxPost = (db.prepare("SELECT MAX(id) as max_id FROM posts").get() as any)?.max_id || 0;

  for (let i = 0; i < count; i++) {
    const seedIndex = currentMaxPost + i + 1;
    const era = eras[seedIndex % eras.length];
    const isSearcherFemale = (seedIndex % 2 === 1);
    const isTargetFemale = (seedIndex % 3 === 0 || seedIndex % 5 === 0);

    const femalePool = (era === "1970" || era === "1980") ? FEMALE_FIRST_NAMES_SHOWA : FEMALE_FIRST_NAMES_HEISEI;
    const malePool = (era === "1970" || era === "1980") ? MALE_FIRST_NAMES_SHOWA : MALE_FIRST_NAMES_HEISEI;

    // --- 差出人の姓名生成（完全重複ゼロ保証） ---
    let searcherFullName = "";
    let searcherLastName = "";
    let searcherFirstName = "";
    let hasSearcherMaiden = false;
    let searcherMaidenLastName: string | null = null;
    let nameAttempt = 0;

    while (nameAttempt < 500) {
      const lIdx = (seedIndex * 7 + nameAttempt * 11) % LAST_NAMES.length;
      searcherLastName = LAST_NAMES[lIdx];
      searcherFirstName = isSearcherFemale
        ? femalePool[(seedIndex * 13 + nameAttempt * 17) % femalePool.length]
        : malePool[(seedIndex * 13 + nameAttempt * 17) % malePool.length];

      hasSearcherMaiden = isSearcherFemale && ((seedIndex + nameAttempt) % 7 < 3);
      searcherMaidenLastName = hasSearcherMaiden ? LAST_NAMES[(seedIndex * 19 + nameAttempt * 23 + 5) % LAST_NAMES.length] : null;
      if (searcherMaidenLastName === searcherLastName) {
        searcherMaidenLastName = LAST_NAMES[(lIdx + 7) % LAST_NAMES.length];
      }

      searcherFullName = hasSearcherMaiden
        ? `${searcherLastName}（旧姓: ${searcherMaidenLastName}）${searcherFirstName}`
        : `${searcherLastName} ${searcherFirstName}`;

      if (!existingSearcherFullNames.has(searcherFullName)) {
        break;
      }
      nameAttempt++;
    }
    existingSearcherFullNames.add(searcherFullName);

    // --- 宛先の姓名生成（完全重複ゼロ保証） ---
    let targetFullName = "";
    let targetLastName = "";
    let targetFirstName = "";
    let hasTargetMaiden = false;
    let targetMaidenLastName: string | null = null;
    let targetAttempt = 0;

    while (targetAttempt < 500) {
      const tlIdx = (seedIndex * 11 + targetAttempt * 13 + 1) % LAST_NAMES.length;
      targetLastName = LAST_NAMES[tlIdx];
      targetFirstName = isTargetFemale
        ? femalePool[(seedIndex * 17 + targetAttempt * 19 + 3) % femalePool.length]
        : malePool[(seedIndex * 17 + targetAttempt * 19 + 3) % malePool.length];

      hasTargetMaiden = isTargetFemale && ((seedIndex + targetAttempt) % 5 < 2);
      targetMaidenLastName = hasTargetMaiden ? LAST_NAMES[(seedIndex * 23 + targetAttempt * 29 + 13) % LAST_NAMES.length] : null;
      if (targetMaidenLastName === targetLastName) {
        targetMaidenLastName = LAST_NAMES[(tlIdx + 11) % LAST_NAMES.length];
      }

      targetFullName = hasTargetMaiden
        ? `${targetLastName}（旧姓: ${targetMaidenLastName}）${targetFirstName}`
        : `${targetLastName} ${targetFirstName}`;

      if (!existingTargetFullNames.has(targetFullName) && targetFullName !== searcherFullName) {
        break;
      }
      targetAttempt++;
    }
    existingTargetFullNames.add(targetFullName);

    // --- ニックネームの生成（完全重複ゼロ保証・本物の人間らしいあだ名のみ・機械的記号の恒久排除） ---
    let nickname = "";
    let nickAttempt = 0;

    while (nickAttempt < 1000) {
      const cand = AUTHENTIC_HUMAN_NICKNAMES[(seedIndex * 19 + i * 17 + nickAttempt * 23) % AUTHENTIC_HUMAN_NICKNAMES.length];
      const isRobotic = /^[A-Za-z]\.[一-龥ぁ-んァ-ヶ]/.test(cand) || /^[一-龥ぁ-んァ-ヶ]\.[一-龥ぁ-んァ-ヶ]/.test(cand) || /^[一-龥ぁ-んァ-ヶ]・[一-龥ぁ-んァ-ヶ]$/.test(cand);
      if (!existingNicknamesSet.has(cand) && cand !== searcherFirstName && cand !== searcherLastName && cand !== searcherFullName && !isRobotic) {
        nickname = cand;
        break;
      }
      nickAttempt++;
    }

    if (!nickname) {
      nickname = `${searcherFirstName}ちゃん`;
    }
    existingNicknamesSet.add(nickname);

    // ユーザー名（会員番号: UID-6桁数字）
    let username = generateRealisticUsername(searcherFirstName, era, seedIndex);
    let userSuffix = 100;
    while (existingUsernames.has(username)) {
      username = `UID-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    existingUsernames.add(username);

    const uidNumber = username.replace('UID-', '');
    let email = `member_${uidNumber}@sample.remeets.jp`;
    let emailSuffix = 100;
    while (existingEmails.has(email)) {
      email = `member_${uidNumber}_${emailSuffix++}@sample.remeets.jp`;
    }
    existingEmails.add(email);

    const hometown = HOMETOWNS[seedIndex % HOMETOWNS.length];
    const school = SCHOOLS_AND_ORGS[seedIndex % SCHOOLS_AND_ORGS.length];
    const imgId = UNSPLASH_IMAGES[seedIndex % UNSPLASH_IMAGES.length];

    // ALL_SCENARIOS_COLLECTION から一意かつ重複しないシナリオを厳格に選択（Q1, A1, Q2, A2すべて完全重複ゼロ）
    let scenario = ALL_SCENARIOS_COLLECTION[seedIndex % ALL_SCENARIOS_COLLECTION.length];
    for (let sIdx = 0; sIdx < ALL_SCENARIOS_COLLECTION.length; sIdx++) {
      const cand = ALL_SCENARIOS_COLLECTION[(seedIndex + sIdx) % ALL_SCENARIOS_COLLECTION.length];
      const cleanA1 = assertAndSanitizeQuizAnswer(cand.a1, "想い出の品");
      const cleanA2 = assertAndSanitizeQuizAnswer(cand.a2, "共通の記憶");
      if (!existingQ1Set.has(cand.q1) && !existingA1Set.has(cleanA1) && !existingQ2Set.has(cand.q2) && !existingA2Set.has(cleanA2)) {
        scenario = cand;
        break;
      }
    }

    // --- 人間味豊かな有機的プロフィール作文ジェネレーター（多様な構文・フォーマル/アンフォーマル/情景先行/語りかけ） ---
    let memoryAction = scenario.contextTemplate
      .replace(/^\{school\}の[^、]+において、\s*/, '')
      .replace(/^\{school\}の[^、]+で、\s*/, '')
      .replace(/仲間です。?$/, '')
      .replace(/戦友です。?$/, '')
      .replace(/相棒です。?$/, '')
      .replace(/友人です。?$/, '')
      .replace(/同級生です。?$/, '')
      .replace(/相手です。?$/, '')
      .replace(/先輩です。?$/, '')
      .replace(/後輩です。?$/, '')
      .replace(/仲間より。?$/, '')
      .replace(/関係です。?$/, '')
      .trim();

    if (!memoryAction) {
      memoryAction = `${scenario.relation}として共に汗を流した`;
    }

    const relation = scenario.relation;
    let rawContext = "";
    let contextAttempt = 0;

    while (contextAttempt < 100) {
      const styleIdx = (seedIndex * 13 + contextAttempt * 7 + 5) % 14;
      let candContext = "";

      switch (styleIdx) {
        case 0:
          // 【情景・エピソード先行型（ノスタルジー）】
          candContext = `${memoryAction}日々が今でも鮮明に心に残っています。当時、${relation}でご一緒していた者です。`;
          break;
        case 1:
          // 【語りかけ・フレンドリー型（カジュアル）】
          candContext = `覚えていますか？当時、${relation}で一緒に過ごした${nickname}だよ！ふと思い出してメッセージを送ってみました。`;
          break;
        case 2:
          // 【礼儀正しい敬体・フォーマル型（丁寧な大人）】
          candContext = `大変ご無沙汰しております。当時、${relation}でお世話になった者です。${memoryAction}当時の感謝をお伝えしたく筆を執りました。`;
          break;
        case 3:
          // 【部活動・係先行型】
          candContext = `当時、${relation}を担当していた者です。${memoryAction}あの頃が懐かしく蘇ります。`;
          break;
        case 4:
          // 【時代背景・思い出先行型（回想）】
          candContext = `あの頃、${relation}として${memoryAction}仲間です。今も元気で活躍されていることを願っています。`;
          break;
        case 5:
          // 【率直・親友タメ口型（アンフォーマル・親密）】
          candContext = `おーい元気にしてる！？${relation}でいつも一緒にバカやってた${nickname}だよ！${memoryAction}の覚えてるかな？`;
          break;
        case 6:
          // 【丁寧な問いかけ・しっとり型】
          candContext = `お元気でいらっしゃいますでしょうか。学生時代に${relation}として${memoryAction}懐かしい時間を共有した者です。`;
          break;
        case 7:
          // 【活動・想い出共有型】
          candContext = `当時${relation}で活動していた仲間です。${memoryAction}あの熱い日々を懐かしく思い出しています。`;
          break;
        case 8:
          // 【手紙風・拝啓スタイル型】
          candContext = `突然のボトルメールで驚かれるかもしれませんが、当時${relation}で${memoryAction}友人です。どうか届きますように。`;
          break;
        case 9:
          // 【エピソード導入・文末署名型】
          candContext = `あの頃、${memoryAction}時間は私にとって一生の宝物です。（当時・${relation}仲間より）`;
          break;
        case 10:
          // 【日常・部活会話風（カジュアル）】
          candContext = `当時${relation}やってた頃が本当に懐かしくてボトル流してみました！${memoryAction}仲間です。`;
          break;
        case 11:
          // 【シンプル・要点型】
          candContext = `【当時・${relation}】${memoryAction}当時の友人を探しています。`;
          break;
        case 12:
          // 【感謝・再会祈念型】
          candContext = `当時${relation}で${memoryAction}時間は今も私の支えです。またいつか昔のように話せたら嬉しいです。`;
          break;
        case 13:
        default:
          // 【青春回顧型】
          candContext = `${memoryAction}あの青春の日々をもう一度語り合いたくて探しています。当時${relation}で一緒だった者より。`;
          break;
      }

      // 旧姓の言及パターンのランダム化
      if (hasSearcherMaiden) {
        const maidenStyle = (seedIndex * 7 + contextAttempt * 11) % 6;
        if (maidenStyle === 0) {
          candContext += ` 当時は旧姓の「${searcherMaidenLastName}」でした。`;
        } else if (maidenStyle === 1) {
          candContext += ` （旧姓：${searcherMaidenLastName}です）`;
        } else if (maidenStyle === 2) {
          candContext += ` 結婚して苗字が変わりましたが、旧姓の${searcherMaidenLastName}といえば思い出してくれるでしょうか。`;
        } else if (maidenStyle === 3) {
          candContext += ` （当時は旧姓・${searcherMaidenLastName}）`;
        } else if (maidenStyle === 4) {
          candContext += ` 苗字が変わりましたが、旧姓の「${searcherMaidenLastName}」より。`;
        } else {
          candContext += ` なお、当時の名前は旧姓の${searcherMaidenLastName}です。`;
        }
      }

      if (!existingProfilesSet.has(candContext)) {
        rawContext = candContext;
        break;
      }
      contextAttempt++;
    }

    if (!rawContext) {
      rawContext = `当時${relation}で${memoryAction}仲間です。（想い出のボトルメール）`;
    }
    existingProfilesSet.add(rawContext);

    // --- 有機的・完全ランダムな本文（メッセージ）作文（完全重複ゼロ保証） ---
    let rawMessage = "";
    let msgAttempt = 0;
    while (msgAttempt < 100) {
      const opening = OPENING_GREETINGS[(seedIndex * 11 + msgAttempt * 7) % OPENING_GREETINGS.length];
      const closing = CLOSING_PHRASES[(seedIndex * 17 + msgAttempt * 13) % CLOSING_PHRASES.length];
      const emotional = EMOTIONAL_REFLECTIONS[(seedIndex * 23 + msgAttempt * 19) % EMOTIONAL_REFLECTIONS.length];

      const lengthType = (seedIndex * 19 + msgAttempt) % 10;
      let messageParts: string[] = [];

      if (opening) {
        messageParts.push(opening);
      }

      messageParts.push(scenario.messageTemplate);

      if (lengthType >= 2) {
        messageParts.push(emotional);
      }

      if (hasTargetMaiden) {
        const targetMaidenStyle = (seedIndex * 3 + msgAttempt) % 4;
        if (targetMaidenStyle === 0) {
          messageParts.push(`ご結婚されて苗字が変わられているかもしれませんが、当時の旧姓・${targetMaidenLastName}さん宛てにお手紙を託します。`);
        } else if (targetMaidenStyle === 1) {
          messageParts.push(`苗字が変わられているかもしれませんが、当時の${targetMaidenLastName}さんへ届きますように。`);
        } else {
          messageParts.push(`旧姓の${targetMaidenLastName}さん宛てにボトルを流します。`);
        }
      }

      messageParts.push(closing);

      const candMsg = messageParts.join(" ");
      if (!existingMessagesSet.has(candMsg)) {
        rawMessage = candMsg;
        break;
      }
      msgAttempt++;
    }
    if (!rawMessage) {
      rawMessage = `${scenario.messageTemplate} ${CLOSING_PHRASES[seedIndex % CLOSING_PHRASES.length]}`;
    }
    existingMessagesSet.add(rawMessage);

    // クイズ Q1 & A1 / Q2 & A2 の完全重複ゼロ保証（プール枯渇時の動的想い出シンセサイザー完備）
    let q1 = scenario.q1;
    let a1 = assertAndSanitizeQuizAnswer(scenario.a1, "想い出の品");
    let q2 = scenario.q2;
    let a2 = assertAndSanitizeQuizAnswer(scenario.a2, "共通の記憶");

    if (existingQ1Set.has(q1) || existingA1Set.has(a1) || existingQ2Set.has(q2) || existingA2Set.has(a2)) {
      const MOTIF_NOUNS_A1 = [
        "青いメガホン", "銀のホイッスル", "記念メダル", "寄せ書きタオル", "赤いリストバンド", "手作りのミサンガ",
        "革のペンケース", "使い込んだ竹刀", "折れたドラムスティック", "トロンボーンミュート", "愛用のスパイク",
        "木製バット", "色褪せたスコアブック", "白いチョーク", "黄色のゼッケン", "記念のキーホルダー", "真鍮のバッジ",
        "部室の黒板消し", "茶色い革手袋", "青いストップウォッチ", "銀のコンパス", "アルミの水筒", "木製スケッチ板",
        "ガラスのビーカー", "真鍮の分度器", "革のブックカバー", "記念の手ぬぐい", "藍染めの道着", "銀色のチューナー",
        "四つ葉の栞", "真鍮のペーパーナイフ", "木彫りのマスコット", "七宝焼きのブローチ", "手編みの手袋", "貝殻のペンダント",
        "刺繍入りポーチ", "木製カスタネット", "金属製の定規", "革のパスケース", "記念ピンバッジ", "ガラスの文鎮",
        "手作りのしおり", "漆塗りの箸箱", "真鍮のキーリング", "記念のペナント", "布製のペンシルロール", "木製写真立て",
        "革製のキーケース", "真鍮の文鎮", "布製の巾着袋", "木製の下敷き", "記念の手帳", "革のコインケース"
      ];
      const MOTIF_NOUNS_A2 = [
        "ガリガリ君", "ホームランバー", "ブラックサンダー", "うまい棒", "ポカリスエット", "アクエリアス",
        "レモンティー", "フルーツオレ", "ミルメーク", "揚げパン", "ソフト麺", "ベビースター",
        "チョコモナカ", "パピコ", "クーリッシュ", "ピノ", "缶入りコーンスープ", "お汁粉缶", "マウンテンデュー",
        "ドクターペッパー", "三ツ矢サイダー", "カルピスウォーター", "ヤクルト", "コーヒー牛乳", "メロンソーダ",
        "ラムネ菓子", "ベイクドチーズケーキ", "みたらし団子", "大学いも", "人形焼", "たい焼き", "今川焼き",
        "あんぱん", "クリームパン", "焼きそばパン", "コッペパン", "串カツ", "フランクフルト", "たこ焼き",
        "お好み焼き", "いちご大福", "草餅", "わらび餅", "カステラ", "かりんとう", "バナナパフェ", "プリンアラモード"
      ];

      const Q1_PATTERNS = [
        (rel: string, eraStr: string) => `当時（${eraStr}年代）、${rel}の活動や練習の際に二人で大切にしていた想い出の品は？`,
        (rel: string, eraStr: string) => `あの頃（${eraStr}年代）、${rel}の仲間と一緒に大事に共有していた記念の持ち物は？`,
        (rel: string, eraStr: string) => `放課後の${rel}でいつも互いに見せ合っていた大切な私物は？`,
        (rel: string, eraStr: string) => `${rel}の思い出として今でも鮮明に覚えている共通の品物は？`,
        (rel: string, eraStr: string) => `大会や発表会の前日に二人で確認し合った${rel}の縁起物は？`,
        (rel: string, eraStr: string) => `部室や活動場所の棚に大切にしまってあった${rel}の共通アイテムは？`,
        (rel: string, eraStr: string) => `引退の日に後輩や仲間から記念に贈られた${rel}の宝物は？`
      ];

      const Q2_PATTERNS = [
        (rel: string, eraStr: string) => `当時（${eraStr}年代）、${rel}の帰り道や休憩時間にみんなで一緒に飲食した懐かしい味は？`,
        (rel: string, eraStr: string) => `練習や活動の合間に近くの売店や自販機でよく買った思い出の味は？`,
        (rel: string, eraStr: string) => `夕暮れの帰り道に二人で半分こして食べた懐かしいおやつは？`,
        (rel: string, eraStr: string) => `${rel}の打ち上げや合宿の夜にみんなで囲んだ定番の味は？`,
        (rel: string, eraStr: string) => `放課後に学校近くのお店でいつも注文していた${rel}の味は？`,
        (rel: string, eraStr: string) => `厳しい練習の後にマネージャーや仲間が差し入れてくれた懐かしい味は？`,
        (rel: string, eraStr: string) => `冬の寒い帰り道に立ち寄った売店で食べた温かいおやつは？`
      ];

      let synthAttempt = 0;
      while (synthAttempt < 20000) {
        const q1Pat = Q1_PATTERNS[(seedIndex * 7 + synthAttempt * 11) % Q1_PATTERNS.length];
        const noun1 = MOTIF_NOUNS_A1[(seedIndex * 17 + synthAttempt * 23 + 3) % MOTIF_NOUNS_A1.length];
        const candA1 = synthAttempt >= MOTIF_NOUNS_A1.length ? `${noun1}（${seedIndex}）` : noun1;
        const candQ1 = q1Pat(scenario.relation, era);

        const q2Pat = Q2_PATTERNS[(seedIndex * 13 + synthAttempt * 17 + 1) % Q2_PATTERNS.length];
        const noun2 = MOTIF_NOUNS_A2[(seedIndex * 29 + synthAttempt * 31 + 7) % MOTIF_NOUNS_A2.length];
        const candA2 = synthAttempt >= MOTIF_NOUNS_A2.length ? `${noun2}（${seedIndex}）` : noun2;
        const candQ2 = q2Pat(scenario.relation, era);

        if (!existingQ1Set.has(candQ1) && !existingA1Set.has(candA1) && !existingQ2Set.has(candQ2) && !existingA2Set.has(candA2)) {
          q1 = candQ1;
          a1 = candA1;
          q2 = candQ2;
          a2 = candA2;
          break;
        }
        synthAttempt++;
      }
    }

    existingQ1Set.add(q1);
    existingA1Set.add(a1);
    existingQ2Set.add(q2);
    existingA2Set.add(a2);

    const isEkyc = (seedIndex % 3 !== 0) ? 1 : 0;
    const docType = isEkyc ? (seedIndex % 2 === 0 ? 'drivers_license' : 'my_number_card') : null;

    try {
      const userResult = insertUser.run(
        username, email, hashedPassword, isEkyc, docType,
        isEkyc ? searcherFullName : null, searcherFullName, searcherLastName, searcherFirstName, nickname
      );
      const userId = userResult.lastInsertRowid as number;

      // eKYCログ または 自己申告ログを記録
      try {
        const estimatedAge = era === "1970" ? 58 : era === "1980" ? 48 : era === "1990" ? 38 : era === "2000" ? 28 : 22;
        insertAgeLog.run(
          userId,
          `192.168.1.${(seedIndex % 250) + 1}`,
          1,
          estimatedAge,
          isEkyc ? 'AI公的身分証多層照合完了 (身元確認済)' : '18歳以上利用規約・宣誓同意',
          JSON.stringify({
            verification_flow: isEkyc ? 'primary_ekyc' : 'self_declaration',
            document_type: isEkyc ? (docType === 'drivers_license' ? 'driver_license' : 'mynumber') : 'self_attestation',
            method: isEkyc ? 'eKYC' : 'self_attestation',
            provider: isEkyc ? 'TRUSTDOCK_AI_OCR' : 'INTERNAL_LEGAL_PLEDGE',
            score: isEkyc ? 98 : 100,
            verified_name: isEkyc ? searcherFullName : null
          })
        );
      } catch (logErr) {
        console.error(`[Organic Synthesizer] Error inserting age log for user #${userId}:`, logErr);
      }

      const hashedA1 = await bcrypt.hash(a1.trim().toLowerCase(), 4);
      const hashedA2 = await bcrypt.hash(a2.trim().toLowerCase(), 4);

      const postResult = insertPost.run(
        userId,
        nickname,
        searcherFullName,
        rawContext,
        targetFullName,
        targetLastName,
        targetFirstName,
        hometown,
        school,
        era,
        scenario.category,
        q1,
        hashedA1,
        a1,
        rawMessage,
        `https://images.unsplash.com/photo-${imgId}?q=80&w=800&auto=format&fit=crop`,
        "active"
      );
      const postId = postResult.lastInsertRowid as number;

      try {
        insertQ.run(postId, q2, hashedA2, a2);
      } catch (qErr) {}

      insertedCount++;
    } catch (err) {
      console.error(`[Organic Synthesizer] Error inserting post #${seedIndex}:`, err);
    }
  }

  const totalCount = (db.prepare("SELECT COUNT(*) as count FROM posts").get() as any)?.count || 0;
  console.log(`[Organic Synthesizer] Successfully generated ${insertedCount} 100% natural & unique posts. Total posts in DB: ${totalCount}`);

  return { count: insertedCount, totalPosts: totalCount };
};

/**
 * 既存の重複サンプル手紙を一括クリーンアップし、完全重複ゼロの指定件数（デフォルト200通）で再構築する関数
 */
export const reseedCleanUniquePosts = async (count: number = 200) => {
  console.log(`[Reseed Unique Engine] Resetting and generating ${count} 100% natural & unique sample posts with zero duplicates...`);

  // 管理者・テストユーザーを保護しつつ、外部キー依存テーブルを安全な順序でクリーンアップ
  db.transaction(() => {
    db.prepare("DELETE FROM post_questions").run();
    db.prepare("DELETE FROM messages").run();
    db.prepare("DELETE FROM notifications").run();
    db.prepare("DELETE FROM reports").run();
    db.prepare("DELETE FROM failed_attempts").run();
    db.prepare("DELETE FROM deletion_requests").run();
    db.prepare("DELETE FROM payment_transactions").run();
    db.prepare("DELETE FROM success_stories").run();
    db.prepare("DELETE FROM action_logs").run();
    db.prepare("DELETE FROM access_logs").run();
    db.prepare("DELETE FROM search_logs").run();
    db.prepare("DELETE FROM page_views").run();
    db.prepare("DELETE FROM age_verification_logs").run();
    db.prepare("DELETE FROM age_verification_documents").run();
    db.prepare("DELETE FROM posts").run();
    db.prepare("DELETE FROM users WHERE role = 'user' AND username NOT IN ('admin', 'test', 'superadmin')").run();
  })();

  const result = await generateAdditionalSamplePosts(count);
  return result;
};

export interface PasswordPolicy {
  minLength: number;
  requireLetters: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  requireMixedCase: boolean;
}

export function getPasswordPolicy(): PasswordPolicy {
  try {
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'password_policy'").get() as any;
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      return {
        minLength: typeof parsed.minLength === 'number' ? Math.max(6, Math.min(32, parsed.minLength)) : 8,
        requireLetters: parsed.requireLetters !== undefined ? !!parsed.requireLetters : true,
        requireNumbers: parsed.requireNumbers !== undefined ? !!parsed.requireNumbers : true,
        requireSymbols: parsed.requireSymbols !== undefined ? !!parsed.requireSymbols : false,
        requireMixedCase: parsed.requireMixedCase !== undefined ? !!parsed.requireMixedCase : false,
      };
    }
  } catch (e) {
    console.warn("Failed to get password policy, using defaults:", e);
  }
  return {
    minLength: 8,
    requireLetters: true,
    requireNumbers: true,
    requireSymbols: false,
    requireMixedCase: false,
  };
}

export function validatePasswordAgainstPolicy(password: string, customPolicy?: PasswordPolicy): { valid: boolean; error?: string } {
  const p = customPolicy || getPasswordPolicy();
  if (!password || typeof password !== 'string') {
    return { valid: false, error: "パスワードを入力してください。" };
  }
  if (password.length < p.minLength) {
    return { valid: false, error: `パスワードは${p.minLength}文字以上で入力してください。` };
  }
  if (p.requireLetters && !/[a-zA-Z]/.test(password)) {
    return { valid: false, error: "パスワードに英字（a〜z, A〜Z）を1文字以上含める必要があります。" };
  }
  if (p.requireNumbers && !/[0-9]/.test(password)) {
    return { valid: false, error: "パスワードに数字（0〜9）を1文字以上含める必要があります。" };
  }
  if (p.requireLetters && p.requireNumbers && (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))) {
    return { valid: false, error: "パスワードは英字と数字の両方を含める必要があります。" };
  }
  if (p.requireMixedCase && (!/[a-z]/.test(password) || !/[A-Z]/.test(password))) {
    return { valid: false, error: "パスワードに英大文字と英小文字の両方を含める必要があります。" };
  }
  if (p.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/\\~`'"]/.test(password)) {
    return { valid: false, error: "パスワードに記号（!@#$%^&* など）を1文字以上含める必要があります。" };
  }
  return { valid: true };
}
