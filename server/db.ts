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
  } catch (dbErr) {
    console.error("Database file was corrupted or unreadable. Backing up and recreating fresh DB...", dbErr);
    if (fs.existsSync("kizuna.db")) {
      fs.renameSync("kizuna.db", `kizuna_corrupt.db.${Date.now()}`);
    }
    db = new Database("kizuna.db");
  }
  console.log("Database file opened.");

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
const seedData = async (force: boolean = false) => {
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
      profile: "1980年代に世田谷区のテニス部で一緒でした。私は副部長をしていました。",
      message: "卒業式の日に、部室の裏でみんなで泣きながら話したことを今でも鮮明に覚えています。あの時、あなたが言ってくれた言葉にどれだけ救われたか分かりません。あれから数十年が経ち、私もそれなりの年齢になりましたが、ふとした瞬間にあの頃の眩しい日々を思い出します。もしこのメッセージがあなたの目に留まったら、ぜひ一度お話ししたいです。元気でいてくれることを心から願っています。",
      q1: "部活の帰りにいつも寄っていた駄菓子屋の名前は？", a1: "さくらや",
      q2: "合宿で行った場所はどこだった？", a2: "軽井沢"
    },
    {
      profile: "横浜駅近くのオフィスで同じプロジェクトチームでした。あの激務だった日々が懐かしいです。",
      message: "お久しぶりです！あの激務だったプロジェクト、今となっては良い思い出ですね。またみんなで飲みに行きましょう！",
      q1: "当時のプロジェクトチームの愛称は何だった？", a1: "チーム・ドリーム",
      q2: "オフィスの近くにあったお気に入りのランチのお店は？", a2: "キッチン南海"
    },
    {
      profile: "2000年代初頭、下北沢のライブハウスでよく会っていた者です。あの頃の熱狂をもう一度語り合いたい。あの狭い空間で共有した音楽と夢、今でも私の原動力です。私たちはいつも最前列で拳を突き上げていましたね。",
      message: "あの頃、毎週末のようにライブハウスに通い詰めていましたね。あなたが教えてくれたバンド、今でも時々聴いています。あの熱狂的な日々を共有した仲間に、もう一度会いたくなってボトルを流しました。もし覚えていたら連絡ください。",
      q1: "初めて二人で行ったライブのアーティストは？", a1: "バンプ",
      q2: "ライブの後にいつも食べていたラーメン屋の名前は？", a2: "みんみん"
    },
    {
      profile: "小学校の時の幼馴染です。毎日一緒に遊んでいました。",
      message: "元気かな？ふと思い出してボトルを流してみたよ。またあの公園で遊びたいね！",
      q1: "秘密基地を作っていた空き地の隣にあった建物の種類は？", a1: "銭湯",
      q2: "小学校の時の担任の先生のあだ名は？", a2: "カミナリ"
    },
    {
      profile: "1990年代、同じ地域のサークルで活動していました。あの頃の仲間を探しています。みんなで集まりたいです。サークル棟の屋上で見た夕日は一生の宝物です。私たちは夜通し将来の夢を語り合いました。",
      message: "卒業以来、すっかり疎遠になってしまいましたが、最近サークルのOB会があり、あなたの話題が出ました。みんなあなたのことを心配したり懐かしんだりしています。もし良ければ、近況を教えてもらえませんか？無理にとは言いませんが、またあの頃のように笑い合えたら嬉しいです。",
      q1: "サークル合宿の最終日に必ず行っていた行事は？", a1: "キャンプファイヤー",
      q2: "部室の冷蔵庫にいつも入っていた飲み物は？", a2: "麦茶"
    },
    {
      profile: "昔、隣に住んでいました。いつもお裾分けをありがとうございました。",
      message: "以前お隣に住んでいた者です。引っ越しの時に挨拶できずじまいで後悔していました。元気ですか？",
      q1: "アパートの入り口に植えられていた花の種類は？", a1: "ひまわり",
      q2: "大家さんがいつも配っていたお裾分けの食べ物は？", a2: "お餅"
    },
    {
      profile: "2010年代、ボランティア活動を通じて知り合いました。あなたの前向きな姿勢を今でも尊敬しています。あの震災の後の活動で、あなたの笑顔にどれだけ救われたか。私たちは瓦礫の中で希望を見つけようとしていました。",
      message: "あの時の活動、本当に大変でしたが、あなたの前向きな姿勢にいつも励まされていました。最近、また同じような活動を始めたのですが、ふとあなたのことを思い出しました。今、どこで何をしていますか？もし良ければ、また一緒に何かできたらいいなと思っています。",
      q1: "ボランティアの打ち上げで行った居酒屋のチェーン店名は？", a1: "魚民",
      q2: "活動中に私たちが担当していた班の名前は？", a2: "B班"
    },
    {
      profile: "高校時代の親友です。放課後はいつも図書室で勉強していましたね。",
      message: "久しぶり！元気？またあの頃みたいにカラオケ行こうよ！連絡待ってるね。",
      q1: "高校の文化祭で私たちがやった出し物の内容は？", a1: "お化け屋敷",
      q2: "放課後によく買い食いしていたコンビニのホットスナックは？", a2: "ファミチキ"
    },
    {
      profile: "1970年代、同じ職場で働いていました。新人の私を温かく指導してくれた先輩です。あの時の恩を返したいと思っています。あなたが教えてくれた仕事のプロ意識は、私の人生の指針となりました。定年退職して時間ができたので、ぜひお会いしたいです。",
      message: "あの時は本当にお世話になりました。定年を迎え、人生を振り返る中で、真っ先にあなたの顔が浮かびました。厳しい中にも優しさがあったあなたの指導のおかげで、私はここまでやってこれたと思っています。感謝の気持ちを直接伝えたいです。もしご存命であれば、ぜひ一度お会いしたいです。",
      q1: "当時の社内旅行で行った温泉地はどこ？", a1: "熱海",
      q2: "あなたがいつも胸ポケットに差していたペンの色は？", a2: "赤色"
    },
    {
      profile: "カメラサークル仲間。週末はいつも撮影旅行に行っていました。",
      message: "良い写真、撮れてますか？また撮影会やりたいですね！",
      q1: "サークルのロゴマークに描かれていた動物は？", a1: "フクロウ",
      q2: "初めて一緒に撮影に行った公園の名前は？", a2: "昭和記念公園"
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

};
