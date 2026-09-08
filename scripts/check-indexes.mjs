const Database = (await import('../node_modules/better-sqlite3/lib/index.js')).default;
const db = new Database('./kizuna.db');

console.log('--- 📋 Current Indexes in SQLite ---');
const indexes = db.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index'").all();
for (const idx of indexes) {
  console.log(`${idx.tbl_name.padEnd(25)} -> ${idx.name}`);
}
