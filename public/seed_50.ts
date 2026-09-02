import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("kizuna.db");

const firstNames = ["太郎", "健一", "美咲", "浩二", "直樹", "由美", "和也", "さくら", "大輔", "真理子", "健太", "愛", "翔太", "舞", "拓也", "結衣", "亮太", "萌", "雄大", "菜々子"];
const lastNames = ["田中", "佐藤", "鈴木", "高橋", "伊藤", "渡辺", "山本", "中村", "小林", "加藤", "吉田", "山田", "佐々木", "山口", "松本", "井上", "木村", "林", "斎藤", "清水"];
const hometowns = ["東京都世田谷区", "神奈川県横浜市", "大阪府大阪市", "愛知県名古屋市", "福岡県福岡市", "北海道札幌市", "千葉県千葉市", "埼玉県さいたま市", "兵庫県神戸市", "京都府京都市", "広島県広島市", "宮城県仙台市", "新潟県新潟市", "静岡県静岡市", "岡山県岡山市"];
const eras = ["70", "80", "90", "00", "10"];
const categories = ["friend", "work", "love", "family", "other"];

const romajiNames: { [key: string]: string } = {
  "田中": "Tanaka", "佐藤": "Sato", "鈴木": "Suzuki", "高橋": "Takahashi", "伊藤": "Ito", "渡辺": "Watanabe", "山本": "Yamamoto", "中村": "Nakamura", "小林": "Kobayashi", "加藤": "Kato", "吉田": "Yoshida", "山田": "Yamada", "佐々木": "Sasaki", "山口": "Yamaguchi", "松本": "Matsumoto", "井上": "Inoue", "木村": "Kimura", "林": "Hayashi", "斎藤": "Saito", "清水": "Shimizu",
  "太郎": "Taro", "健一": "Kenichi", "美咲": "Misaki", "浩二": "Koji", "直樹": "Naoki", "由美": "Yumi", "和也": "Kazuya", "さくら": "Sakura", "大輔": "Daisuke", "真理子": "Mariko", "健太": "Kenta", "愛": "Ai", "翔太": "Shota", "舞": "Mai", "拓也": "Takuya", "結衣": "Yui", "亮太": "Ryota", "萌": "Moe", "雄大": "Yudai", "菜々子": "Nanako"
};

async function seed() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  const insertUser = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    const insertPost = db.prepare(`
    INSERT INTO posts (
      user_id, searcher_name, searcher_profile, target_name, target_name_en, target_hometown, 
      era, category, secret_question, secret_answer, message, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertQ = db.prepare("INSERT INTO post_questions (post_id, question, answer) VALUES (?, ?, ?)");

  console.log("Seeding 50 users and ボトルメール with 2 questions each...");

  for (let i = 0; i < 50; i++) {
    const searcherLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const searcherFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const searcherName = `${searcherLast} ${searcherFirst}`;
    const username = `user_${i}_${Math.random().toString(36).substring(7)}`;

    const targetLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const targetFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const targetName = `${targetLast} ${targetFirst}`;
    const targetNameEn = `${romajiNames[targetLast]} ${romajiNames[targetFirst]}`;

    const hometown = hometowns[Math.floor(Math.random() * hometowns.length)];
    const era = eras[Math.floor(Math.random() * eras.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    let profile = "";
    let message = "";
    let question1 = "";
    let answer1 = "";
    let question2 = "";
    let answer2 = "";

    if (category === "friend") {
      profile = `${era}年代に同じ学校に通っていました。`;
      message = "久しぶりに会って話がしたいです。";
      question1 = "卒業式の日に一緒に行った場所は？";
      answer1 = "カラオケ";
      question2 = "当時、私たちが一番好きだった学食のメニューは？";
      answer2 = "カレーライス";
    } else if (category === "work") {
      profile = "以前同じ職場で働いていました。";
      message = "仕事の相談も兼ねて、また飲みに行きましょう。";
      question1 = "当時の上司の苗字は？";
      answer1 = "佐藤";
      question2 = "私たちが一緒に担当したプロジェクトの名前は？";
      answer2 = "サンライズ";
    } else if (category === "love") {
      profile = "昔、大切に思っていた人です。";
      message = "元気でやっているか気になっています。";
      question1 = "初めて二人で行った映画のタイトルは？";
      answer1 = "タイタニック";
      question2 = "私が誕生日にあなたにプレゼントしたものは？";
      answer2 = "時計";
    } else if (category === "family") {
      profile = "疎遠になってしまった親戚です。";
      message = "家族みんなで集まりたいと思っています。";
      question1 = "おじいちゃんの家の庭にあった木は？";
      answer1 = "柿の木";
      question2 = "お盆に親戚一同で集まった時に必ず食べた料理は？";
      answer2 = "お寿司";
    } else {
      profile = "近所に住んでいた知り合いです。";
      message = "偶然見かけて懐かしくなりました。";
      question1 = "よく一緒に行った公園の名前は？";
      answer1 = "中央公園";
      question2 = "当時、あなたが飼っていた犬の名前は？";
      answer2 = "ポチ";
    }

    const unsplashIds = [
      "1590615370581-2656198fdf62", // Station platform
      "1542314831-068cd1dbfeeb", // Japanese train
      "1570129476815-ba368ac77013", // Japanese train station
      "1555529323-4484029793c9", // Japanese train interior/platform
      "1529339061831-13350290918a", // Japanese train
      "1496116218417-1a781b1c416c", // Train platform
      "1531949103042-ad6d7b433792", // Japanese train station
      "1560264280-88b68371db39"  // Japanese train
    ];
    const imgId = unsplashIds[i % unsplashIds.length];

    try {
      const userResult = insertUser.run(username, hashedPassword, "user");
      const userId = userResult.lastInsertRowid;

      const postResult = insertPost.run(
        userId,
        searcherName,
        profile,
        targetName,
        targetNameEn,
        hometown,
        era,
        category,
        question1,
        answer1,
        message,
        `https://images.unsplash.com/photo-${imgId}?q=80&w=800&auto=format&fit=crop`,
        "active"
      );
      const postId = postResult.lastInsertRowid;
      insertQ.run(postId, question2, answer2);
    } catch (e) {
      console.error(`Error seeding index ${i}:`, e);
    }
  }

  console.log("Seeding completed.");
}

seed();
