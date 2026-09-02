import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('kizuna.db');

const seedData = async () => {
  console.log("Cleaning up old sample data...");
  try { db.pragma("foreign_keys = OFF"); } catch (e) {}
  db.prepare("DELETE FROM post_questions").run();
  db.prepare("DELETE FROM posts").run();
  
  // Ensure user 1 exists
  let user = db.prepare("SELECT id FROM users WHERE id = 1").get();
  if (!user) {
    const pw = await bcrypt.hash("123", 10);
    db.prepare(`
      INSERT INTO users (id, username, password, email, role, is_verified, full_name, last_name, first_name, nickname)
      VALUES (1, 'test', ?, 'test@example.com', 'user', 1, 'テスト ユーザー', 'テスト', 'ユーザー', 'テスト')
    `).run(pw);
  }

  const insertQ = db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)");
  
  const content = {
    q1: "q1", a1: "a1",
    q2: "q2", a2: "a2",
    message: "msg"
  };
  
  const hashedA1 = await bcrypt.hash(content.a1, 10);
  const hashedA2 = await bcrypt.hash(content.a2, 10);
  
  const postResult = db.prepare(`
    INSERT INTO posts (
      user_id, searcher_name, searcher_full_name, searcher_profile, target_name, 
      target_last_name, target_first_name, target_hometown, target_school, 
      era, category, secret_question, secret_answer, secret_answer_plain, 
      message, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1, "nick", "full", "prof", "target", "last", "first", "home", "school", "era", "cat",
    content.q1, hashedA1, content.a1, content.message, "url", "active"
  );
  
  const postId = postResult.lastInsertRowid as number;
  console.log("Inserted post", postId);
  
  try {
    insertQ.run(postId, content.q2, hashedA2, content.a2);
    console.log("Inserted q2 for post", postId);
  } catch (e) {
    console.error("Failed to insert q2", e);
  }
  try { db.pragma("foreign_keys = ON"); } catch (e) {}
};

seedData().then(() => console.log("Done")).catch(console.error);

