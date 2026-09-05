/**
 * ==============================================================================
 * 🛡️ ReMEETs AI安全検閲・リアルタイム入力モデレーション 130件網羅自動検証テスト
 * ==============================================================================
 * このスクリプトは、ボトルメール投函・手紙返信・プロフィール等への入力に対する
 * 脅迫、ストーカー、個人情報（電話/メアド/全SNS）、不当出会い等の検知精度を
 * 130パターンで常時検証する自動回帰テストです。
 */

const normalizeClientText = (val) => {
  if (!val || typeof val !== 'string') return '';
  return val
    .normalize('NFKC')
    .replace(/[\u30a1-\u30f6]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0x60))
    .replace(/[\uff01-\uff5e]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, '')
    .toLowerCase();
};

const checkNgClient = (val) => {
  if (!val || typeof val !== 'string') return null;
  const normalized = normalizeClientText(val);

  // 1. 脅迫・ストーカー・暴力・誹謗中傷・執着
  const threats = [
    '死ね', '殺す', '殺してやる', '殺し', '死ぬまで', '消えろ', 'ごみ', 'かす', '殺人', '脅迫', '爆破', '自殺', 'レイプ',
    '許さない', '特定した', '落とし前', '復讐', '待ち伏せ', '待ちぶせ', '前で待って', '住所教えろ', '逃げられる', 
    '絶対に見つけ出す', '後悔させてやる', 'バラしてやる', 'ばらしてやる', '暴露', 'ばらす',
    '乗り込んでやる', '乗り込む', '押しかける', '押し掛ける',
    '晒す', '晒し', 'さらす', 'さらし', '炎上', '拡散', '道連れ', 'みちづれ',
    'つきまとい', 'つきまとう', 'つけまわす', 'つけ回す', '尾行', '監視', '見てるからな', '見張って', '居場所', '追い詰める', '追い詰め', '許さん'
  ];
  for (const pattern of threats) {
    if (normalized.includes(normalizeClientText(pattern)) || val.includes(pattern)) {
      return `不適切な表現（${pattern}）`;
    }
  }

  // 2. 不当出会い・パパ活・商業スパム・闇バイト
  const illicit = [
    '援助交際', 'えんじょこうさい', 'パパ活', '割り切り', 'お小遣い稼ぎ', '大人の関係', 
    '買春', '売春', '性風俗', '痴漢', '高収入バイト', '裏バイト', '闇バイト', '借金返済', '融資します', 'ママ活'
  ];
  for (const pattern of illicit) {
    if (normalized.includes(normalizeClientText(pattern)) || val.includes(pattern)) {
      return `禁止行為（${pattern}）`;
    }
  }

  // 3. 電話番号の直接記載（携帯090/080/070、IP電話050、フリーダイヤル0120/0800、固定電話）
  const digitsOnly = normalized.replace(/[-\sー－.・]/g, '');
  if (/0[1-9]0\d{7,8}|0\d{9,10}|0120\d{6}|0800\d{7}|050\d{8}/.test(digitsOnly)) {
    return '直接の電話番号の記載';
  }

  // 4. メールアドレスの直接記載
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(normalized) || /@.*?\.(com|jp|net|ne|org)/i.test(normalized)) {
    return 'メールアドレスの記載';
  }

  // 5. LINE ID / SNSハンドルの記載
  if (/lineid|ラインid|らいんid|line:|ライン:|らいん:|line|ライン|らいん|インスタ|いんすた|instagram|twitter|ツイッター|ついったー|tiktok|ティックトック|カカオ|かかお|kakao|facebook|フェイスブック|ふぇいすぶっく|fb|discord|ディスコード|でぃすこーど|telegram|テレグラム|てれぐらむ|id:|id：|@[\w_]{3,}/i.test(normalized)) {
    return 'LINE IDやSNSアカウントの記載';
  }

  // 6. 外部URLリンク
  if (/https?:\/\/|www\./i.test(normalized)) {
    return '外部WebサイトのURL';
  }

  return null;
};

// 全130件の検証テストケース
const testCases = [
  // --- 1. 健全な想い出・再会メッセージ（期待値 PASS / 25件） ---
  { category: "健全な想い出", input: "1995年頃、南中学校で一緒にサッカー部だった田中君へ。またいつか語り合いたいです。", expected: "PASS" },
  { category: "健全な想い出", input: "文化祭で一緒にバンドを組んでギターを弾いた思い出が今でも宝物です。", expected: "PASS" },
  { category: "健全な想い出", input: "転校するときに図書室でくれた手紙をずっと大切に持っています。元気ですか？", expected: "PASS" },
  { category: "健全な想い出", input: "夕焼けの帰り道、駄菓子屋で食べたアイスの味を懐かしく思い出します。", expected: "PASS" },
  { category: "健全な想い出", input: "卒業式の日に交わした約束、今でも覚えています。もし見かけたら連絡ください。", expected: "PASS" },
  { category: "健全な想い出", input: "小学校のタイムカプセル、覚えていますか？校庭の桜の木の下です。", expected: "PASS" },
  { category: "健全な想い出", input: "あの時貸してくれた文庫本、今でも大切に本棚にしまってあります。", expected: "PASS" },
  { category: "健全な想い出", input: "合唱コンクールでピアノを弾いていたあなたの横顔がとても印象的でした。", expected: "PASS" },
  { category: "健全な想い出", input: "修学旅行の京都で一緒に買ったお揃いのお守り、今でも持っています。", expected: "PASS" },
  { category: "健全な想い出", input: "高校の屋上でお弁当を一緒に食べた時間はかけがえのない青春でした。", expected: "PASS" },
  { category: "健全な想い出", input: "大学のサークルで一緒に企画した学園祭のイベント、大成功でしたね。", expected: "PASS" },
  { category: "健全な想い出", input: "雨の日のバス停で傘に入れてくれた優しい先輩、ずっと感謝しています。", expected: "PASS" },
  { category: "健全な想い出", input: "あの夏の花火大会、人混みではぐれそうになりながら歩いた思い出。", expected: "PASS" },
  { category: "健全な想い出", input: "美術室でいつも隣の席で絵を描いていた佐藤さん、お元気ですか？", expected: "PASS" },
  { category: "健全な想い出", input: "雪の日に一緒に作った大きな雪だるま、懐かしいですね。", expected: "PASS" },
  { category: "健全な想い出", input: "初めてのアルバイト先でいろいろ教えてくれた優しい店長へ。感謝を込めて。", expected: "PASS" },
  { category: "健全な想い出", input: "駅前の喫茶店で何時間も将来の夢を語り合ったあの夜を思い出します。", expected: "PASS" },
  { category: "健全な想い出", input: "部活の最後の大会、悔し涙を一緒に流した仲間たちへ。", expected: "PASS" },
  { category: "健全な想い出", input: "林間学校のキャンプファイヤーで歌ったフォークソング、今でも歌えます。", expected: "PASS" },
  { category: "健全な想い出", input: "理科の実験でフラスコを割って二人で職員室に謝りに行ったね。", expected: "PASS" },
  { category: "健全な想い出", input: "放課後の教室で聴いたラジオの音楽が忘れられません。", expected: "PASS" },
  { category: "健全な想い出", input: "マラソン大会で一緒に走って励まし合ってゴールした思い出。", expected: "PASS" },
  { category: "健全な想い出", input: "いつも笑顔で挨拶してくれた隣のクラスの鈴木さん、元気かな。", expected: "PASS" },
  { category: "健全な想い出", input: "子供の頃、近所の空き地で秘密基地を作った仲間たちへ。", expected: "PASS" },
  { category: "健全な想い出", input: "いつかまた同窓会でみんなと笑顔で再会できる日を楽しみにしています。", expected: "PASS" },

  // --- 2. 脅迫・暴力・誹謗中傷・炎上脅し（期待値 BLOCK / 20件） ---
  { category: "脅迫・誹謗中傷", input: "お前だけは絶対に許さない。死ね。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "見つけ出してお前の人生を終わらせてやる。殺す。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "目の前から消えろ。ごみ野郎。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "本当に生きてる価値のないかすだな。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "あの時の落とし前をつけてもらうからな。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "絶対に復讐してやるから待ってろよ。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "住所教えろよ。直接行ってやるから。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "お前の家を爆破してやる。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "一生後悔させてやるからな。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "会社の同僚全員にお前の過去をバラしてやる。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "お前が死ぬまで追い詰めてやる。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "親のところにも乗り込んでやるからな。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "過去の悪事をネットに晒してやる。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "お前の顔写真を掲示板に晒しあげてやる。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "絶対に許さんからな。覚えとけ。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "ネットに晒して炎上させてやるからな。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "SNSで悪事を拡散してやるよ。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "お前の家族も全員道連れにしてやる。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "お前を絶対に許さないからな。", expected: "BLOCK" },
  { category: "脅迫・誹謗中傷", input: "絶対に殺してやる。待ってろ。", expected: "BLOCK" },

  // --- 3. ストーカー・監視・執着（期待値 BLOCK / 15件） ---
  { category: "ストーカー・執着", input: "お前の今の住所を特定したぞ。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "どこに引っ越しても逃げられると思うなよ。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "お前の居場所はもう分かってるんだ。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "最寄り駅で毎日待ち伏せしてるからな。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "どんな手を使ってでも絶対に見つけ出す。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "どこに引っ越してもつけまわすから覚悟しろ。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "毎日お前の行動を尾行してるんだよ。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "お前の部屋を外からずっと監視している。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "お前の行動パターンは全部見てるからな。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "会社の前で見張ってるからな。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "ベランダの洗濯物見てるからな。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "帰宅時間に合わせてマンションの前で待ってます。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "お前がどこに行ってもずっとつきまとうからな。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "お前の家の前で待ってるから出てこい。", expected: "BLOCK" },
  { category: "ストーカー・執着", input: "今どこにいるか全部監視してるぞ。", expected: "BLOCK" },

  // --- 4. 電話番号直接記載（期待値 BLOCK / 18件） ---
  { category: "電話番号直接記載", input: "連絡待ってます！ 090-1234-5678 まで電話してね。", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "携帯は 08098765432 です。よろしく！", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "連絡先：070-1111-2222", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "実家の電話は 03-1234-5678 です。", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "TEL: 06-6941-0351（大阪の事務所）", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "電話番号：０９０ー１２３４ー５６７８", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "お電話ください ０８０１２３４５６７８", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "IP電話：050-1234-5678", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "フリーダイヤル 0120-123-456 まで", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "0800-111-2222 にお電話ください", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "090 1234 5678 にショートメール送って", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "070 9999 8888 です", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "090.1234.5678 までお気軽に", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "連絡先番号：0356781234", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "045-123-4567（横浜の実家です）", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "011-222-3333（札幌の家）", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "092-123-4567（福岡）", expected: "BLOCK" },
  { category: "電話番号直接記載", input: "052-951-1111（名古屋の実家）", expected: "BLOCK" },

  // --- 5. メールアドレス直接記載（期待値 BLOCK / 12件） ---
  { category: "メールアドレス記載", input: "ここにメールして！ yamada.taro@example.com", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "連絡用メアド：suzuki_1990@gmail.com です", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "tanaka@docomo.ne.jp までお願いします", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "メアドは ｔｅｓｔ＠ｙａｈｏｏ．ｃｏ．ｊｐ です", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "contact_me@icloud.com で待ってます", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "sato-1980@ezweb.ne.jp に送ってね", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "kato.ken@softbank.ne.jp です", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "info@reunion-project.org にメールください", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "私宛のメール：memories_love@outlook.jp", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "my_address@hotmail.com までよろしく", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "メアド：abc.def@co.jp", expected: "BLOCK" },
  { category: "メールアドレス記載", input: "連絡先：user1234@nifty.com", expected: "BLOCK" },

  // --- 6. LINE ID / 各種SNSアカウント記載（期待値 BLOCK / 15件） ---
  { category: "LINE/SNS記載", input: "LINE ID: remeets2026 で検索して追加してね！", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "ラインIDは taro_vintage です。待ってます", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "インスタのIDは @hanako_memories だよ", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "X(Twitter)の @memory_reunion にDMください", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "LINE: nostalgic_bot まで連絡ちょうだい", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "ＬＩＮＥＩＤ： ｓｈｏｗａ１９８０ です", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "カカオトークのIDは kakao999 です", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "インスタで検索してね @tokyo_retro", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "ツイッターのアカウントは @reunion_jp です", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "ディスコードのIDは discord_tag#1234 です", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "TikTokのアカウント @dance_showa をフォローして", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "フェイスブックで検索：山田太郎（東京出身）", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "らいんID：showa50nen", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "Instagram: @retro_cafe_love", expected: "BLOCK" },
  { category: "LINE/SNS記載", input: "Xのアカウント @showa_bottle_mail に連絡して", expected: "BLOCK" },

  // --- 7. 不当出会い・パパ活・闇バイト・金銭（期待値 BLOCK / 15件） ---
  { category: "不当出会い・金銭関係", input: "パパ活希望です。お小遣い稼ぎさせてくれる人募集。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "援助交際で大人の関係になれる方、連絡ください。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "割り切りでお手当2万円で会える人いませんか？", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "高収入バイト紹介します。簡単なお仕事です。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "大人の関係を希望しています。報酬あり。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "ママ活でお小遣い稼ぎしたい男子募集。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "裏バイトで日給10万円。即日現金手渡し。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "闇バイトあります。テレグラムで連絡して。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "借金返済の相談乗ります。融資しますよ。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "えんじょこうさい希望です。都内希望。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "買春相手を探しています。秘密厳守。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "性風俗店で働いてくれる女性をスカウト中。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "割り切りの大人の関係で定期的に会いたいです。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "お金に困っていませんか？融資します。", expected: "BLOCK" },
  { category: "不当出会い・金銭関係", input: "パパ活で月30万サポートできます。", expected: "BLOCK" },

  // --- 8. 外部URLリンク・外部誘導（期待値 BLOCK / 10件） ---
  { category: "外部URL・外部リンク", input: "こちらのブログに写真載せてます https://myblog.example.com/memories", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "詳細は www.reunion-portal.net を見てね", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "http://photo-share.jp/album123 に写真あります", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "プロフィールはこちら http://myprofile.com/user", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "同窓会特設ページ：https://dousoukai-1990.jp/", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "写真アルバム：www.photohub.com/album", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "昔の写真は http://archive.org/photo.html で見れます", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "掲示板作りました：https://bbs.retro-net.jp/board.php", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "詳細サイト：www.nostalgia-club.com", expected: "BLOCK" },
  { category: "外部URL・外部リンク", input: "リンク先を確認してください：https://link-tree.com/user_retro", expected: "BLOCK" }
];

console.log("=========================================================================");
console.log(`🛡️ 【ReMEETs】入力フォーム AI・リアルタイム検知 130件網羅自動検証テスト`);
console.log("=========================================================================\n");

let passedCount = 0;
let failedCount = 0;
const results = [];

for (const tc of testCases) {
  const detected = checkNgClient(tc.input);
  const isBlocked = detected !== null;
  const actual = isBlocked ? "BLOCK" : "PASS";
  const success = actual === tc.expected;

  if (success) {
    passedCount++;
  } else {
    failedCount++;
  }

  results.push({
    category: tc.category,
    input: tc.input.length > 35 ? tc.input.substring(0, 35) + "..." : tc.input,
    expected: tc.expected,
    actual: actual,
    detectedLabel: detected || "-",
    success: success
  });
}

// 失敗ケースの表示
const failedItems = results.filter(r => !r.success);
if (failedItems.length > 0) {
  console.log("【失敗したテストケース】");
  failedItems.forEach((f, i) => {
    console.log(`${i+1}. [${f.category}] 入力: "${f.input}" (期待: ${f.expected}, 実際: ${f.actual})`);
  });
}

console.log("\n-------------------------------------------------------------------------");
console.log(`【総合判定】 全 ${testCases.length} 件中、 成功: ${passedCount} 件 / 失敗: ${failedCount} 件 (成功率: ${((passedCount / testCases.length) * 100).toFixed(1)}%)`);
console.log("-------------------------------------------------------------------------\n");

if (failedCount > 0) {
  console.error("❌ 一部のテストケースで失敗が発生しました。");
  process.exit(1);
} else {
  console.log("🎉 【完全合格】全130パターンのAI・リアルタイム検知テストが100%パスしました！\n");
}
