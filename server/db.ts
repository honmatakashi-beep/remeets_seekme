import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

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
    } catch (idxErr) {
      console.error("Index creation error:", idxErr);
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
  const admin = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
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
      SET password = ?, email = ?, role = 'super_admin', is_verified = 1, full_name = ?, last_name = ?, first_name = ?, nickname = ? 
      WHERE username = ?
    `).run(newAdminPassword, "admin@adomin.jp", "東北 太郎", "東北", "太郎", "かりん", "admin");
  }

  // Ensure multi-role staff accounts exist
  const staffUsers = [
    { username: 'moderator_staff', email: 'moderator@remeets.jp', role: 'moderator', full_name: '佐藤 衛', last_name: '佐藤', first_name: '衛', nickname: 'まもる' },
    { username: 'cs_staff', email: 'cs@remeets.jp', role: 'cs_support', full_name: '鈴木 花子', last_name: '鈴木', first_name: '花子', nickname: 'ハナ' },
    { username: 'auditor_staff', email: 'auditor@remeets.jp', role: 'auditor', full_name: '田中 律子', last_name: '田中', first_name: '律子', nickname: 'リツコ' },
  ];

  for (const staff of staffUsers) {
    const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(staff.username);
    if (!existing) {
      db.prepare(`
        INSERT INTO users (username, email, password, role, is_verified, full_name, last_name, first_name, nickname)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
      `).run(staff.username, staff.email, newAdminPassword, staff.role, staff.full_name, staff.last_name, staff.first_name, staff.nickname);
    } else {
      db.prepare(`
        UPDATE users SET password = ?, email = ?, role = ?, is_verified = 1, full_name = ?, last_name = ?, first_name = ?, nickname = ?
        WHERE username = ?
      `).run(newAdminPassword, staff.email, staff.role, staff.full_name, staff.last_name, staff.first_name, staff.nickname, staff.username);
    }
  }

  // Ensure test user exists (eKYC Verified)
  const testUser = db.prepare("SELECT * FROM users WHERE username = ?").get("test");
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
      SET password = ?, email = ?, is_verified = 1, is_ekyc_verified = 1, ekyc_document_type = 'drivers_license', ekyc_name = '本間 貴司', ekyc_verified_at = COALESCE(ekyc_verified_at, CURRENT_TIMESTAMP), full_name = ?, last_name = ?, first_name = ?, nickname = ? 
      WHERE username = ?
    `).run(testHashedPassword, "test@example.com", "本間 貴司", "本間", "貴司", "たかし", "test");
    console.log("test user updated successfully.");
  }

  // Create explicit eKYC sample users
  const verifiedSampleUsers = [
    {
      username: "sakura_verified",
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
      username: "kenji_verified",
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
      username: "aoi_verified",
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
    const existingVu = db.prepare("SELECT * FROM users WHERE username = ?").get(vu.username);
    if (!existingVu) {
      db.prepare(`
        INSERT INTO users (username, password, email, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname)
        VALUES (?, ?, ?, 'user', 1, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
      `).run(vu.username, testHashedPassword, vu.email, vu.is_ekyc_verified, vu.ekyc_document_type, vu.ekyc_name, vu.full_name, vu.last_name, vu.first_name, vu.nickname);
    } else {
      db.prepare(`
        UPDATE users 
        SET is_ekyc_verified = 1, ekyc_document_type = ?, ekyc_name = ?, ekyc_verified_at = COALESCE(ekyc_verified_at, CURRENT_TIMESTAMP), full_name = ?, last_name = ?, first_name = ?, nickname = ?
        WHERE username = ?
      `).run(vu.ekyc_document_type, vu.ekyc_name, vu.full_name, vu.last_name, vu.first_name, vu.nickname, vu.username);
    }
  }

  // Ensure guest exists
  const guest = db.prepare("SELECT * FROM users WHERE username = ?").get("guest");
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
      WHERE username = 'guest'
    `).run();
  }

  // Check if posts already exist in database
  const existingPostsCount = (db.prepare("SELECT COUNT(*) as count FROM posts").get() as any)?.count || 0;
  if (existingPostsCount > 0 && !force) {
    console.log(`[Database] Found ${existingPostsCount} existing posts. Preserving user letters and database state (Startup seeding skipped).`);
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
  db.prepare("DELETE FROM search_logs").run();
  db.prepare("DELETE FROM page_views").run();
  db.prepare("DELETE FROM users WHERE role = 'user' AND username NOT IN ('guest', 'test', 'sakura_verified', 'kenji_verified', 'aoi_verified')").run();
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
      profile: "1980年代に世田谷区の中学校テニス部で一緒でした。私は副部長をしていました。",
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
      profile: "2000年代初頭、下北沢のライブハウスで毎週末のように顔を合わせていた者です。",
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
      profile: "1990年代、大学の天文学サークルで星空を追いかけていた仲間を探しています。",
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
      profile: "2010年代、被災地でのボランティア活動を通じて知り合いました。あなたの笑顔に救われました。",
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
      profile: "1970年代、新入社員として配属された営業所で温かく指導してくださった先輩を探しています。",
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
      profile: "1995年、バックパッカーとしてタイのゲストハウスで出会った旅仲間です。",
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
      profile: "2000年代半ば、渋谷の古着屋でスタッフとして切磋琢磨していた元同僚です。",
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
      profile: "2015年頃、都内のプログラミング勉強会（もくもく会）で毎週隣の席だったエンジニア仲間です。",
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
      profile: "1990年代に同じ英会話スクールに通っていた社会人クラスの仲間です。",
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
      profile: "2010年代、社会人フットサルリーグで同じチームでプレイしたゴールキーパーです。",
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
      profile: "高校時代、予備校の自習室でいつも隣の席で机を並べていた浪人時代の戦友です。",
      message: "模試の結果に一喜一憂しながら、励まし合って掴んだ合格通知。あの1年間の努力があったから今の自分があります。",
      q1: "夜遅くの自習室を出た後、二人で駆け込んだ立ち食いそば屋のメニューは？", a1: "かき揚げそば",
      q2: "単語帳の表紙に合格祈願で貼っていた赤ペンキ風の合格シールは？", a2: "必勝ダルマ"
    },
    {
      profile: "学生時代、京都の古寺巡りサークルで週末ごとに御朱印を集めていた仲間です。",
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
      profile: "2000年代、都内のWebベンチャー創業初期にデザイナーとエンジニアとして奮闘した仲間です。",
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
      profile: "1980年代後半、原宿のホコ天でバンド演奏やダンスを見ながら青春を過ごした仲間です。",
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

    const username = `${searcher.romaji}_${Math.floor(Math.random() * 900) + 100}`;
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
