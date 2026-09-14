import { db } from "./schema";
import bcrypt from "bcryptjs";
import { UNIQUE_MEMORY_SCENARIOS, ALL_SCENARIOS_COLLECTION } from "../memoryScenarios";
import { generateAdditionalSamplePosts, generateRealisticUsername, guessGenderFromName, generateRealisticBirthdate } from "./seedGenerators";

export const seedData = async (force: boolean = false) => {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 🛡️ [MIGRATION] DB内の実在校名・商標等の初回サニタイズ（必要な場合のみ実行）
  try {
    const unhashedPosts = db.prepare("SELECT id, secret_answer_plain FROM posts WHERE secret_answer IS NULL OR secret_answer = '' LIMIT 10").all() as any[];
    for (const p of unhashedPosts) {
      if (p.secret_answer_plain) {
        const hash = await bcrypt.hash(p.secret_answer_plain.trim().toLowerCase(), 10);
        db.prepare("UPDATE posts SET secret_answer = ? WHERE id = ?").run(hash, p.id);
      }
    }
  } catch (err) {
    console.error("Migration clean entities error:", err);
  }
  
  // Ensure admin exists
  const admin = db.prepare("SELECT * FROM users WHERE username = 'admin' OR email = 'admin@adomin.jp'").get() as any;
  const newAdminPassword = await bcrypt.hash("123", 10);
  if (!admin) {
    console.log("Creating admin user...");
    db.prepare(`
      INSERT INTO users (username, email, password, role, is_verified, full_name, last_name, first_name, nickname, birthdate, gender) 
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    `).run("admin", "admin@adomin.jp", newAdminPassword, "super_admin", "東北 太郎", "東北", "太郎", "かりん", "1980-04-15", "男性");
  } else {
    console.log("Updating admin password and ensuring super_admin role...");
    db.prepare(`
      UPDATE users 
      SET username = 'admin', password = ?, email = 'admin@adomin.jp', role = 'super_admin', is_verified = 1, full_name = ?, last_name = ?, first_name = ?, nickname = ?, birthdate = COALESCE(birthdate, '1980-04-15'), gender = COALESCE(gender, '男性') 
      WHERE id = ?
    `).run(newAdminPassword, "東北 太郎", "東北", "太郎", "かりん", admin.id);
  }

  // Ensure multi-role staff accounts exist
  const staffUsers = [
    { username: 'moderator_staff', email: 'moderator@remeets.jp', role: 'moderator', full_name: '佐藤 衛', last_name: '佐藤', first_name: '衛', nickname: 'まもる', birthdate: '1985-08-20', gender: '男性' },
    { username: 'cs_staff', email: 'cs@remeets.jp', role: 'cs_support', full_name: '鈴木 花子', last_name: '鈴木', first_name: '花子', nickname: 'ハナ', birthdate: '1992-11-05', gender: '女性' },
    { username: 'auditor_staff', email: 'auditor@remeets.jp', role: 'auditor', full_name: '田中 律子', last_name: '田中', first_name: '律子', nickname: 'リツコ', birthdate: '1978-03-12', gender: '女性' },
  ];

  for (const staff of staffUsers) {
    const existing = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(staff.username, staff.email) as any;
    if (!existing) {
      db.prepare(`
        INSERT INTO users (username, email, password, role, is_verified, full_name, last_name, first_name, nickname, birthdate, gender)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
      `).run(staff.username, staff.email, newAdminPassword, staff.role, staff.full_name, staff.last_name, staff.first_name, staff.nickname, staff.birthdate, staff.gender);
    } else {
      db.prepare(`
        UPDATE users SET password = ?, email = ?, role = ?, is_verified = 1, full_name = ?, last_name = ?, first_name = ?, nickname = ?, birthdate = COALESCE(birthdate, ?), gender = COALESCE(gender, ?)
        WHERE id = ?
      `).run(newAdminPassword, staff.email, staff.role, staff.full_name, staff.last_name, staff.first_name, staff.nickname, staff.birthdate, staff.gender, existing.id);
    }
  }

  // Ensure test user exists (eKYC Verified)
  const testUser = db.prepare("SELECT * FROM users WHERE username = 'test' OR email = 'test@example.com'").get() as any;
  const testPassword = "123";
  const testHashedPassword = await bcrypt.hash(testPassword, 10);
  
  if (!testUser) {
    console.log("Creating test user (eKYC verified)...");
    db.prepare(`
      INSERT INTO users (username, password, email, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname, birthdate, gender) 
      VALUES (?, ?, ?, ?, 1, 1, 'drivers_license', '本間 貴司', CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)
    `).run("test", testHashedPassword, "test@example.com", "user", "本間 貴司", "本間", "貴司", "たかし", "1986-06-18", "男性");
    console.log("test user created successfully.");
  } else {
    console.log("Updating test user password and profile...");
    db.prepare(`
      UPDATE users 
      SET password = ?, email = 'test@example.com', is_verified = 1, is_ekyc_verified = 1, ekyc_document_type = 'drivers_license', ekyc_name = '本間 貴司', ekyc_verified_at = COALESCE(ekyc_verified_at, CURRENT_TIMESTAMP), full_name = ?, last_name = ?, first_name = ?, nickname = ?, birthdate = COALESCE(birthdate, '1986-06-18'), gender = COALESCE(gender, '男性') 
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
      birthdate: "1996-03-24",
      gender: "女性",
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
      birthdate: "1975-09-10",
      gender: "男性",
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
      birthdate: "2001-07-19",
      gender: null, // 2割枠：性別未設定
      is_ekyc_verified: 1,
      ekyc_document_type: "passport",
      ekyc_name: "山田 葵"
    }
  ];

  for (const vu of verifiedSampleUsers) {
    const existingVu = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(vu.username, vu.email) as any;
    if (!existingVu) {
      db.prepare(`
        INSERT INTO users (username, password, email, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname, birthdate, gender)
        VALUES (?, ?, ?, 'user', 1, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)
      `).run(vu.username, testHashedPassword, vu.email, vu.is_ekyc_verified, vu.ekyc_document_type, vu.ekyc_name, vu.full_name, vu.last_name, vu.first_name, vu.nickname, vu.birthdate, vu.gender);
    } else {
      db.prepare(`
        UPDATE users 
        SET is_ekyc_verified = 1, ekyc_document_type = ?, ekyc_name = ?, ekyc_verified_at = COALESCE(ekyc_verified_at, CURRENT_TIMESTAMP), full_name = ?, last_name = ?, first_name = ?, nickname = ?, birthdate = COALESCE(birthdate, ?), gender = COALESCE(gender, ?)
        WHERE id = ?
      `).run(vu.ekyc_document_type, vu.ekyc_name, vu.full_name, vu.last_name, vu.first_name, vu.nickname, vu.birthdate, vu.gender, existingVu.id);
    }
  }

  // Ensure guest exists
  const guest = db.prepare("SELECT * FROM users WHERE username = 'guest' OR email = 'guest@remeets.jp'").get() as any;
  if (!guest) {
    console.log("Creating guest user...");
    db.prepare(`
      INSERT INTO users (username, password, email, role, is_verified, full_name, last_name, first_name, nickname, birthdate, gender) 
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, NULL, NULL)
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

  // 🌟 Ensure main verified users (test, sakura, kenji, aoi, admin) always have posts with safe, fictitious schools & descriptive profiles
  try {
    const mainUsers = [
      { 
        email: 'test@example.com', name: '本間 貴司', nick: 'たかし', target: '小林 裕太', 
        school: '緑川中学校', 
        profile: '中学時代の陸上部で共に汗を流した想い出の仲間を探しています。',
        msg: '中学最後の総体で共に走った陸上部の思い出。夕焼けのグラウンドが懐かしいです。', 
        q1: '中学最後の夏の総体で二人で出場したリレー種目は？', a1: '4×100mリレー', 
        q2: '練習帰りに駄菓子屋で食べたアイスは？', a2: 'ソーダ味のアイス', 
        era: '1990', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80' 
      },
      { 
        email: 'test@example.com', name: '本間 貴司', nick: 'たかし', target: '鈴木 恵美', 
        school: '桜ヶ丘高校', 
        profile: '高校の文化祭実行委員で共に汗を流した大切な仲間を探しています。',
        msg: '文化祭実行委員で共に汗を流した日々。またみんなで集まりたいですね。', 
        q1: '文化祭の前夜祭で着たお揃いTシャツの色は？', a1: 'オレンジ色', 
        q2: '後夜祭フィナーレの花火の名前は？', a2: 'ナイアガラの滝', 
        era: '2000', img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80' 
      },
      { 
        email: 'sakura.sato@example.com', name: '佐藤 さくら', nick: 'さくら🌸', target: '中村 陽子', 
        school: '青葉台高校', 
        profile: '高校の吹奏楽部で共にフルートを吹いた親友を探しています。',
        msg: '吹奏楽部で共にフルートを吹いた親友へ。金賞を獲ったあの瞬間の涙は宝物です。', 
        q1: '夏のコンクール予選で金賞を受賞した思い出の自由曲は？', a1: 'アルヴァマー序曲', 
        q2: 'パート練習の合間に屋上で食べたお弁当のおかずは？', a2: '卵焼き', 
        era: '2000', img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop&q=80' 
      },
      { 
        email: 'kenji.takahashi@example.com', name: '高橋 健二', nick: 'けんじ (公認)', target: '斎藤 翔平', 
        school: '星見ヶ丘学園高校', 
        profile: '高校の野球部でバッテリーを組んだ相棒を探しています。',
        msg: '野球部でバッテリーを組んだ相棒へ。泥まみれになって甲子園を目指した日々。またキャッチボールしよう。', 
        q1: '夏の大会でサヨナラ勝ちを決めた対戦相手の高校名は？', a1: '白雲高校', 
        q2: '練習帰りに立ち寄った定食屋の大盛りメニューは？', a2: 'ジャンボチキンカツ定食', 
        era: '1990', img: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&auto=format&fit=crop&q=80' 
      },
      { 
        email: 'aoi.yamada@example.com', name: '山田 葵', nick: 'あおい', target: '佐々木 美穂', 
        school: 'あおぞら高校', 
        profile: '高校の美術部で油絵を描いた同期を探しています。',
        msg: '美術部で油絵を描いた同期へ。放課後の美術室で夕暮れまでデッサンを重ねた時間が懐かしいです。', 
        q1: '二人で県展に出品した油絵の共通テーマは？', a1: '朝焼けの海', 
        q2: '美術室でいつも一緒に飲んでいた紙パックの紅茶は？', a2: '紙パックのミルクティー', 
        era: '2010', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80' 
      },
      { 
        email: 'admin@adomin.jp', name: '東北 太郎', nick: 'かりん', target: '松本 隆', 
        school: '札幌星雲高校', 
        profile: '学生時代の天文部で満天の星空を眺めた仲間を探しています。',
        msg: '天文部で満天の星空を眺めた仲間へ。凍てつく夜空に輝く星と語り合った夢を覚えています。', 
        q1: '天体望遠鏡を覗いて息を呑んだ夜空の惑星は？', a1: '土星の輪', 
        q2: '夜間観測で寒さをしのぐために飲んだ飲み物は？', a2: 'ホットココア', 
        era: '1980', img: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80' 
      }
    ];

    for (const mu of mainUsers) {
      const uRecord = db.prepare("SELECT id, birthdate, gender, is_ekyc_verified FROM users WHERE email = ?").get(mu.email) as any;
      if (uRecord) {
        const postExists = db.prepare("SELECT id FROM posts WHERE user_id = ? AND target_name = ?").get(uRecord.id, mu.target);
        if (!postExists) {
          const insertStmt = db.prepare(`
            INSERT INTO posts (
              user_id, searcher_name, searcher_full_name, searcher_profile, searcher_birthdate, searcher_gender,
              target_name, target_last_name, target_first_name, target_hometown, target_school, 
              era, category, secret_question, secret_answer, secret_answer_plain, 
              message, image_url, is_ekyc_verified, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
          `);
          const res = insertStmt.run(
            uRecord.id, mu.nick, mu.name, mu.profile,
            uRecord.birthdate || null, uRecord.gender || null,
            mu.target, mu.target.split(' ')[0] || mu.target, mu.target.split(' ')[1] || '', '東京都', mu.school,
            mu.era, 'friend', mu.q1, hashedPassword, mu.a1, mu.msg, mu.img,
            uRecord.is_ekyc_verified || 0
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
    "緑川中学校", "桜ヶ丘高校", "青葉台高校", "夕陽丘学園高校", "星見ヶ丘高校", 
    "あおぞら第一高校", "光陽学院高校", "七夕学園高校", "白鳥台高校", "春風中学校",
    "IT系スタートアップ企業", "街のデザイン事務所", "老舗アパレルメーカー", "地元の人気カフェ", "駅前のスポーツジム"
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
      q1: "部活の帰りにいつも寄っていた駄菓子屋の名前は？", a1: "町の駄菓子屋さん",
      q2: "最後の夏合宿で行った長野の避暑地はどこだった？", a2: "軽井沢"
    },
    {
      profile: "横浜駅近くのITオフィスで同じプロジェクトチームでした。深夜残業を乗り越えた仲間です。",
      message: "お久しぶりです！あの激務だった開発プロジェクト、今となっては誇らしい思い出ですね。またみんなで集まりましょう！",
      q1: "当時の開発プロジェクトチームの愛称は何だった？", a1: "チームドリーム",
      q2: "オフィスの地下にあったお気に入りの洋食屋は？", a2: "町の洋食屋さん"
    },
    {
      profile: "下北沢のライブハウスで毎週末のように顔を合わせていた者です。",
      message: "あの頃、狭いライブハウスで共有した音楽と熱気は今でも私の宝物です。あなたが教えてくれたバンドの曲、今も聴いています。",
      q1: "初めて二人でチケットを買って行ったライブのバンド名は？", a1: "人気ロックバンド",
      q2: "深夜ライブの後にいつも寄っていた中華料理屋は？", a2: "駅前の中華料理店"
    },
    {
      profile: "小学校6年間の幼馴染です。秘密基地を作って毎日遊んでいました。",
      message: "元気にしてるかな？ふと懐かしくなってボトルを流してみたよ。またあの公園で昔みたいに語り合いたいね。",
      q1: "秘密基地を作っていた空き地の隣にあった古い建物は？", a1: "町の銭湯",
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
      q1: "ボランティア活動の打ち上げで利用した居酒屋チェーンは？", a1: "駅前の居酒屋",
      q2: "現地で私たちが担当していた支援物資配給の班名は？", a2: "B班"
    },
    {
      profile: "高校時代の親友です。放課後はいつも図書室の窓際で受験勉強していました。",
      message: "久しぶり！元気にしてる？文化祭の準備で徹夜したのが懐かしいね。連絡待ってます。",
      q1: "高校2年の文化祭で私たちが企画した出し物は？", a1: "お化け屋敷",
      q2: "学校帰りにいつも買い食いしていたホットスナックは？", a2: "揚げたてコロッケ"
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
      q2: "練習の合間にパートみんなで食べたアイスクリームは？", a2: "ソーダ味のアイス"
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
      q1: "バンコクで私たちが泊まっていた安宿の名前は？", a1: "ゲストハウス",
      q2: "夜市で二人で挑戦して食べた屋台フルーツの王様は？", a2: "ドリアン"
    },
    {
      profile: "少年野球チーム「リトルジャイアンツ」でバッテリーを組んでいたキャッチャーです。",
      message: "最終回のマウンドで君が見せてくれた気迫のピッチングは今でも目に焼き付いています。またキャッチボールしようぜ。",
      q1: "優勝決定戦でサインを出して投げさせた最後の決め球は？", a1: "インコース高め直球",
      q2: "試合後に監督が全員に奢ってくれたジュースは？", a2: "特製みかんジュース"
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
      q2: "課題制作中に二人でヘビロテしていたBGMのアルバムは？", a2: "名盤アルバム"
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
      q1: "ショップの看板になっていた年代物のヴィンテージジーンズ型番は？", a1: "ヴィンテージデニム",
      q2: "店長が海外出張のお土産にくれた現地のキーホルダーの形は？", a2: "ルート66看板"
    },
    {
      profile: "高校の陸上部で4×100mリレーのアンカーと第3走者としてバトンを繋いだ仲間です。",
      message: "県大会決勝のバトンパス、完璧だったね。グラウンドの土の匂いと歓声、今でも胸が熱くなります。",
      q1: "リレーチームで揃えて履いていたスパイクシューズのメーカーは？", a1: "お揃いのランニングシューズ",
      q2: "朝練の後に水道の蛇口で冷やして食べた果物は？", a2: "スイカ"
    },
    {
      profile: "大学の演劇サークルで大道具と照明を担当していた裏方コンビです。",
      message: "本番前のゲネプロで照明のタイミングを何度も合わせたね。幕が下りた瞬間の拍手の音、忘れられません。",
      q1: "秋の定期公演で上演したシェイクスピアの名作戯曲は？", a1: "夏の夜の夢",
      q2: "舞台袖の道具箱に貼ってあった安全祈願のお守りステッカーは？", a2: "交通安全ステッカー"
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
      q2: "書店の休憩室でいつも淹れていた紅茶のブランド名は？", a2: "アールグレイ紅茶"
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
      q1: "コンクール地区予選で歌った課題曲のタイトルは？", a1: "メッセージ",
      q2: "発声練習の時にピアノ伴奏で使っていた音階の愛称は？", a2: "マオマオ発声"
    },
    {
      profile: "昔、吉祥寺のジャズ喫茶でカウンターに並んで常連客だった音楽仲間です。",
      message: "マスターが淹れるネルドリップ珈琲とマイルス・デイヴィスのレコード。あの静かで濃密な時間をまた語り合いたいです。",
      q1: "店内の巨大な真空管スピーカーの伝説的なオーディオブランドは？", a1: "大型名機スピーカー",
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
      q2: "美術室の棚に置いてあったデッサン用の石膏像の人物名は？", a2: "石膏像"
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
      q1: "運動会行進曲の定番だった鼓笛隊の演奏曲名は？", a1: "行進曲",
      q2: "パレードで着用したベレー帽とスカーフのお揃いの色は？", a2: "ロイヤルブルー"
    },
    {
      profile: "大学の研究室で生化学の卒業論文実験を夜通し共にした同期です。",
      message: "遠心分離機の音を聞きながらデータの解析をした日々。あの過酷な卒論発表を乗り切れたのは君のおかげです。",
      q1: "実験室の冷凍庫に保管されていた必須サンプルの試薬名は？", a1: "BSA溶液",
      q2: "教授が海外学会のお土産に研究室に買ってきてくれた激甘チョコは？", a2: "輸入チョコレート"
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
      q1: "初めて二人で訪れて感動した枯山水庭園で有名なお寺の名前は？", a1: "名刹の枯山水庭園",
      q2: "参道の茶屋で食べた焼きたての名物和菓子は？", a2: "みたらし団子"
    },
    {
      profile: "新入社員時代の社員寮で隣の部屋だった同期です。壁が薄くてよく声が聞こえましたね。",
      message: "仕事の愚痴を言い合ったり、夜中にコンビニへアイスを買いに行ったり。君がいてくれたから新社会人を乗り越えられました。",
      q1: "社員寮の食堂で金曜日の夕飯に決まって出てきた大人気メニューは？", a1: "カツカレー",
      q2: "寮の屋上に忍び込んで二人で見た初日の出の方角に見えた名峰は？", a2: "東の山並み"
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
      q2: "編集室にカンヅメになった時に主食にしていたカップ麺は？", a2: "特製カップ麺"
    },
    {
      profile: "小学校の時に同じそろばん塾に通っていた仲間です。暗算のスピードを競い合いましたね。",
      message: "パチパチと響くそろばんの音と、段位検定に合格した時のハイタッチ。ふと思い出して温かい気持ちになりました。",
      q1: "そろばん塾の先生がご褒美にくれた文房具のキャラクターは？", a1: "人気キャラ消しゴム",
      q2: "塾の帰り道にあった自動販売機でいつも買っていた瓶ジュースは？", a2: "瓶入りサイダー"
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
      q2: "徹夜明けにビルの非常階段から見上げた電波塔のライトアップ色は？", a2: "オレンジ色"
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
      q1: "スタンドの所長が休憩中に奢ってくれた名物缶コーヒーの種類は？", a1: "缶コーヒー",
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
      q1: "ホコ天で私たちがいつも待ち合わせ場所にしていたオープンカフェの名前は？", a1: "オープンカフェ",
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

    // 🌟 年齢の幅広い分布（20代〜70代）と名前から想定される性別（2割は性別未設定）
    const { birthdate: sampleBirthdate, age: sampleAge } = generateRealisticBirthdate(era, i);
    const guessedGender = guessGenderFromName(searcher.first, fullName);
    const sampleGender = (i % 5 === 0) ? null : guessedGender; // 2割は性別なし

    const userResult = db.prepare(`
      INSERT INTO users (username, email, password, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname, birthdate, gender) 
      VALUES (?, ?, ?, 'user', 1, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)
    `).run(username, sampleEmail, hashedPassword, isEkyc, docType, isEkyc ? fullName : null, fullName, searcher.last, searcher.first, nickname, sampleBirthdate, sampleGender);
    const userId = userResult.lastInsertRowid as number;
    userIds.push(userId);

    // 年齢確認ログ（eKYC または 自己申告）の登録
    try {
      db.prepare(`
        INSERT INTO age_verification_logs (user_id, ip, is_verified, age, reason, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        userId,
        `192.168.1.${(i % 250) + 1}`,
        1,
        sampleAge,
        isEkyc ? 'AI公的身分証多層照合完了 (身元確認済)' : '18歳以上利用規約・宣誓同意',
        JSON.stringify({
          verification_flow: isEkyc ? 'primary_ekyc' : 'self_declaration',
          document_type: isEkyc ? (docType === 'drivers_license' ? 'driver_license' : 'mynumber') : 'self_attestation',
          method: isEkyc ? 'eKYC' : 'self_attestation',
          gender: sampleGender,
          birthdate: sampleBirthdate
        })
      );
    } catch (logErr) {}

    const hashedA1 = await bcrypt.hash(content.a1.trim().toLowerCase(), 10);
    const hashedA2 = await bcrypt.hash(content.a2.trim().toLowerCase(), 10);

    const postResult = db.prepare(`
      INSERT INTO posts (
        user_id, searcher_name, searcher_full_name, searcher_profile, searcher_birthdate, searcher_gender,
        target_name, target_last_name, target_first_name, target_hometown, target_school, 
        era, category, secret_question, secret_answer, secret_answer_plain, 
        message, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      nickname,
      fullName,
      profile,
      sampleBirthdate,
      sampleGender,
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
        description: "旧友とのメッセージ開封・連絡先安全開示（eKYC確認＋600円オーソリ確定）",
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

    // --- 7. サンプル通知ログの投入 ---
    const allUsers = db.prepare("SELECT id FROM users").all() as any[];
    const insertNotifStmt = db.prepare(`
      INSERT INTO notifications (user_id, type, content, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const notifTemplates = [
      {
        type: "reunion_request",
        content: "【再会希望の受信】昔の同窓生「佐藤 さくら」様より、あなたの公開メッセージ（1998年頃・青葉中学校）に想い出エピソードが届きました！「届いた再会希望」タブより内容をご確認のうえ、承認を行ってください。",
        link: "/account?tab=received",
        is_read: 0,
        created_at: new Date(now.getTime() - 1000 * 60 * 35).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        type: "reunion_approved",
        content: "【再会希望が承認されました】あなたが送信した「高橋 健二 様宛て」の再会希望エピソードがお相手に承認されました！本人確認と決済を行って連絡先をお受け取りください。",
        link: "/account?tab=sent",
        is_read: 0,
        created_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        type: "admin_broadcast",
        content: "【ReMEETs SEEKME 運営事務局より】\nいつも ReMEETs SEEKME をご利用いただき誠にありがとうございます。\n\nより安心して想い出の再会を果たしていただけるよう、AI安全防衛エンジンの精度向上と、本人確認（eKYC）認証スピードの高速化アップデートを実施いたしました。\n\n引き続き、温かい想い出のメッセージを守るため健全な運営に努めてまいります。ご不明な点がございましたら「お問い合わせ」窓口よりお気軽にお寄せください。",
        link: null,
        is_read: 1,
        created_at: new Date(now.getTime() - 86400000 * 1).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        type: "system",
        content: "【公式サポーター認定】ReMEETs SEEKME プラットフォームのサーバー運営・AI安全防衛への温かいご寄付（1口 500円）をいただき、心より御礼申し上げます。\n\nマイアカウント等に「⭐ 公式サポーター」ゴールドバッジが付与されました。温かいご支援に心より感謝申し上げます。",
        link: "/account#supporter-donation-card",
        is_read: 1,
        created_at: new Date(now.getTime() - 86400000 * 2).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        type: "system",
        content: "【公的本人確認 完了】ご提出いただいた公的証明書類（eKYC）の審査が正常に完了し、承認されました。\n\nアカウントに「🛡️ 公的本人確認済み」バッジが点灯し、安心・スムーズにお相手との連絡先を開示していただけるようになりました。",
        link: "/account?tab=profile",
        is_read: 1,
        created_at: new Date(now.getTime() - 86400000 * 3).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        type: "broadcast",
        content: "【メッセージ閲覧レポート】あなたが公開したメッセージが、これまでに全国から「34回」静かに検索・閲覧されました。大切なメッセージは暗号化され、安全に保護・公開されています。",
        link: "/account",
        is_read: 1,
        created_at: new Date(now.getTime() - 86400000 * 5).toISOString().replace('T', ' ').substring(0, 19)
      }
    ];

    allUsers.forEach(u => {
      notifTemplates.forEach(t => {
        insertNotifStmt.run(u.id, t.type, t.content, t.link, t.is_read, t.created_at);
      });
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

/**
 * 日本人の名前（下の名前・フルネーム）から想定される性別（男性 / 女性）を高精度に推定する関数
 */
