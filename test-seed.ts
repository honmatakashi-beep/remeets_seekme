import fs from 'fs';
import path from 'path';

const scenarioDir = path.resolve('server/scenarios');
const files = fs.readdirSync(scenarioDir).filter(f => f.endsWith('.ts') && f !== 'types.ts');

console.log('=== SCANNING SERVER/SCENARIOS FOR SPECIFIC ENTITIES / BRANDS / TRADEMARKS ===');

const brandPatterns = [
  /(マクドナルド|マック|スタバ|スターバックス|ドトール|タリーズ|コメダ|ガスト|サイゼリヤ|デニーズ|モスバーガー|吉野家|すき家|松屋|ケンタッキー|KFC)/,
  /(セブン|ローソン|ファミマ|ファミリーマート|ミニストップ|デイリーヤマザキ|セイコーマート)/,
  /(ユニクロ|GU|無印良品|ニトリ|ロフト|東急ハンズ|ドンキ|ダイソー|セリア|キャンドゥ)/,
  /(ソニー|パナソニック|任天堂|トヨタ|ホンダ|日産|キヤノン|ニコン|富士フイルム)/,
  /(ポカリスエット|アクエリアス|コカコーラ|ペプシ|カルピス|オロナミンC|ポッキー|キットカット|じゃがりこ|うまい棒|ブラックサンダー|チロルチョコ|ガリガリ君)/,
  /(リプトン|午後の紅茶|お〜いお茶|綾鷹|伊右衛門|ボス|ジョージア|ワンダ|エメラルドマウンテン|ファイア|Roots)/,
  /(ミズノ|アシックス|ナイキ|アディダス|プーマ|アンダーアーマー|ヨネックス|バタフライ)/,
  /(LINE|Twitter|ツイッター|Instagram|インスタ|Facebook|フェイスブック|TikTok|YouTube|ユーチューブ)/
];

let totalScenarioFlags = 0;

for (const file of files) {
  const filePath = path.join(scenarioDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    for (const pat of brandPatterns) {
      if (pat.test(line)) {
        const match = line.match(pat);
        console.log(`[${file}:${idx + 1}] Found Brand/Entity: "${match ? match[0] : ''}"`);
        console.log(`  Line: ${line.trim().slice(0, 100)}`);
        totalScenarioFlags++;
      }
    }
  });
}

console.log(`Total Scenario Flags: ${totalScenarioFlags}`);





