const Database = (await import('../node_modules/better-sqlite3/lib/index.js')).default;
const db = new Database('./kizuna.db');

console.log('--- 📊 Table Row Counts ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
for (const t of tables) {
  try {
    const row = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    console.log(`${t.name.padEnd(25)}: ${row.c} rows`);
  } catch (e) {
    console.log(`${t.name}: error`);
  }
}

console.log('\n--- ⏱️ Testing Query Speeds ---');
const t0 = performance.now();
db.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT 50").all();
const t1 = performance.now();
console.log(`posts query: ${(t1 - t0).toFixed(2)}ms`);

const t2 = performance.now();
db.prepare("SELECT * FROM action_logs ORDER BY created_at DESC LIMIT 100").all();
const t3 = performance.now();
console.log(`action_logs query: ${(t3 - t2).toFixed(2)}ms`);

// WAL Checkpoint & Optimize
console.log('\n--- 🧹 Running WAL Checkpoint & Optimize ---');
db.pragma('wal_checkpoint(TRUNCATE)');
db.pragma('optimize');
db.prepare('VACUUM').run();
console.log('Checkpoint & VACUUM complete.');
