#!/usr/bin/env node
/**
 * ReMEETs 手紙データ救済・修復スクリプト（デスクトップ直接実行対応）
 */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const projectDir = path.resolve('/Users/honma/Desktop/rest⭐️-remeets〜再会のボトルメール〜20260827');
const dbPath = path.join(projectDir, 'kizuna.db');

console.log('====================================================');
console.log('📬 ReMEETs ボトルメール手紙データ 診断＆救済修復スクリプト');
console.log('====================================================');
console.log(`対象プロジェクト: ${projectDir}`);
console.log(`対象DB: ${dbPath}`);

if (!fs.existsSync(projectDir)) {
  console.error('❌ プロジェクトディレクトリが見つかりません。');
  process.exit(1);
}

const db = new Database(dbPath);

// 1. テーブル存在確認と作成
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    secret_answer_plain TEXT,
    message TEXT,
    status TEXT DEFAULT 'active',
    image_url TEXT,
    verified_by INTEGER,
    ai_flagged INTEGER DEFAULT 0,
    ai_diagnosed INTEGER DEFAULT 1,
    ai_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// 2. 現在の手紙件数を確認
const currentActive = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'active'").get().count;
console.log(`\n現在の公開手紙（active）件数: ${currentActive} 件`);

// 3. 非アクティブな手紙がある場合はアクティブに修復
const inactiveCount = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status != 'active'").get().count;
if (inactiveCount > 0) {
  db.prepare("UPDATE posts SET status = 'active' WHERE status != 'active'").run();
  console.log(`🛠️ 非公開になっていた手紙 ${inactiveCount} 件を正常（active）に修復しました。`);
}

// 4. 管理者ユーザーの確保
let adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!adminUser) {
  const hash = bcrypt.hashSync('admin123', 10);
  const info = db.prepare(`
    INSERT INTO users (username, password, nickname, full_name, email, role) 
    VALUES ('admin', ?, '管理者', 'ReMEETs 事務局', 'admin@remeets.link', 'admin')
  `).run(hash);
  adminUser = { id: info.lastInsertRowid };
  console.log('👤 管理者ユーザー (admin) を初期設定しました。');
}

// 5. 手紙サンプル投入（件数が少ない場合）
const SAMPLE_LETTERS = [
  {
    target_name: '佐藤 健一',
    target_last_name: '佐藤',
    target_first_name: '健一',
    searcher_name: 'たっくん',
    searcher_full_name: '高橋 拓也',
    searcher_profile: '世田谷区立緑中学校 サッカー部キャプテン',
    target_hometown: '東京都世田谷区',
    target_school: '世田谷区立緑中学校',
    era: '1990',
    category: 'friend',
    secret_question: '中学最後の夏の大会、PK戦で最後に蹴った人の背番号は？',
    secret_answer_plain: '10番',
    message: 'あの夏の最後の大会、僕のパスからゴールを決めてくれたこと今でも鮮明に覚えています。卒業以来ばらばらになってしまったけれど、みんな元気にしていますか？またいつかあのグラウンドの話をしたいです。'
  },
  {
    target_name: '田中 陽子',
    target_last_name: '田中',
    target_first_name: '陽子',
    searcher_name: 'さっちゃん',
    searcher_full_name: '小林 さゆり',
    searcher_profile: '横浜市立桜木小学校 吹奏楽部フルートパート',
    target_hometown: '神奈川県横浜市',
    target_school: '横浜市立桜木小学校',
    era: '1985',
    category: 'friend',
    secret_question: '放課後によく二人で買い食いした駄菓子屋の名前は？',
    secret_answer_plain: '丸屋',
    message: '放課後、いつも一緒にフルートの練習をして夕焼けを見ながら帰ったね。急な引っ越しでちゃんとお別れが言えなかったことがずっと心残りでした。もしこれを見つけたら、ぜひ近況を教えてください。'
  },
  {
    target_name: '山本 茂樹 先生',
    target_last_name: '山本',
    target_first_name: '茂樹',
    searcher_name: '第28期 陸上部一同',
    searcher_full_name: '代表：鈴木 衛',
    searcher_profile: '県立千葉東高校 陸上競技部OB',
    target_hometown: '千葉県千葉市',
    target_school: '県立千葉東高校',
    era: '1995',
    category: 'mentor',
    secret_question: '先生が部室の黒板にいつも書いていた座右の銘は？',
    secret_answer_plain: '継続は力なり',
    message: '先生にご指導いただいた3年間は、私たちにとって生涯の宝物です。先生がご退職されたと風の噂で伺いました。当時の部員で集まる機会があり、どうしても先生に感謝を伝えたく手紙を流しました。'
  },
  {
    target_name: '木村 大地',
    target_last_name: '木村',
    target_first_name: '大地',
    searcher_name: 'ヒロ',
    searcher_full_name: '渡辺 浩司',
    searcher_profile: '2005年 北海道ツーリングで出会った相棒',
    target_hometown: '北海道富良野市',
    target_school: 'ライダーハウス北の旅人',
    era: '2005',
    category: 'journey',
    secret_question: '富良野の星空の下で夜通し飲んだ缶コーヒーの銘柄は？',
    secret_answer_plain: 'BOSS',
    message: 'バイクで日本一周中、富良野の宿で偶然出会って朝まで将来の夢を語り合いましたね。連絡先を書いたメモを無くしてしまい後悔していました。白髪交じりの年齢になったけれど、元気にしていますか？'
  },
  {
    target_name: '松本 美咲',
    target_last_name: '松本',
    target_first_name: '美咲',
    searcher_name: 'けんけん',
    searcher_full_name: '井上 健一',
    searcher_profile: '杉並区立高円寺第一小学校 幼馴染',
    target_hometown: '東京都杉並区',
    target_school: '杉並区立高円寺第一小学校',
    era: '1988',
    category: 'neighbor',
    secret_question: '近所の神社の裏庭に二人で埋めたタイムカプセルの缶は何の缶？',
    secret_answer_plain: 'クッキー缶',
    message: '夕方になると毎日公園で暗くなるまで遊んだ幼馴染の美咲ちゃんへ。街の景色もずいぶん変わってしまったけれど、あの頃の思い出は今も色鮮やかです。元気で過ごしていることを願っています。'
  }
];

if (currentActive < 10) {
  console.log('\n📝 データベースに情緒豊かな日本の想い出手紙を投入中...');
  const insertPost = db.prepare(`
    INSERT INTO posts (
      user_id, searcher_name, searcher_full_name, searcher_profile,
      target_name, target_last_name, target_first_name,
      target_hometown, target_school, era, category,
      secret_question, secret_answer, secret_answer_plain,
      message, status, ai_diagnosed, ai_flagged
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, 'active', 1, 0
    )
  `);

  SAMPLE_LETTERS.forEach((l) => {
    const hashed = bcrypt.hashSync(l.secret_answer_plain, 10);
    insertPost.run(
      adminUser.id,
      l.searcher_name,
      l.searcher_full_name,
      l.searcher_profile,
      l.target_name,
      l.target_last_name,
      l.target_first_name,
      l.target_hometown,
      l.target_school,
      l.era,
      l.category,
      l.secret_question,
      hashed,
      l.secret_answer_plain,
      l.message
    );
  });
  console.log(`✅ 新たに ${SAMPLE_LETTERS.length} 通の美しいボトルメールを正常投入しました。`);
}

const finalCount = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'active'").get().count;
console.log('----------------------------------------------------');
console.log(`🎉 診断＆修復完了！ 現在公開中の手紙: 合計 ${finalCount} 通`);
console.log('HOME画面（http://localhost:3000/）をリロードしてご確認ください。');
console.log('====================================================');
