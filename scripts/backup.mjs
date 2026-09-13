import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('.');
const targetDir = '/Users/honma/Desktop/ReMEET CODE';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 日時フォーマット YYYYMMDD_HHmm
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
const outputZipName = `⭐️ReMEETs_latest_clean_${timestamp}.zip`;
const outputZipPath = path.join(targetDir, outputZipName);

console.log(`📦 Creating clean backup zip: ${outputZipName}...`);

// 厳格な除外リスト
const excludePatterns = [
  '*/node_modules/*',
  '*/.git/*',
  '*/dist/*',
  '*/backups/*',
  '*/tmp/*',
  '*/.DS_Store',
  '*.zip',
  '*.tar.gz',
  '*.log',
  '*.db-wal',
  '*.db-shm',
  '*/.tempmediaStorage/*',
  '*/.gemini/*'
];

const excludeArgs = excludePatterns.map(p => `-x "${p}"`).join(' ');

// 既存の同名ファイルがあれば削除
if (fs.existsSync(outputZipPath)) {
  fs.unlinkSync(outputZipPath);
}

const dirName = path.basename(projectRoot);
const parentDir = path.dirname(projectRoot);

const zipCommand = `cd "${parentDir}" && zip -r "${outputZipPath}" "${dirName}" ${excludeArgs}`;

try {
  execSync(zipCommand, { stdio: 'pipe' });
  const stats = fs.statSync(outputZipPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`✅ Backup successfully created at: ${outputZipPath}`);
  console.log(`📊 Backup file size: ${sizeMB} MB`);

  // フェイルセーフ：万が一35MBを超えた場合は警告
  if (stats.size > 35 * 1024 * 1024) {
    console.warn(`⚠️ WARNING: Backup size (${sizeMB} MB) exceeds normal threshold (35MB). Please check workspace for unexpected large files.`);
  } else {
    console.log(`✨ Size check PASSED: Clean & lightweight archive.`);
  }
} catch (err) {
  console.error('❌ Failed to create zip backup:', err);
  process.exit(1);
}
