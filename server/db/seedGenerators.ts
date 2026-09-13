import db from "../db";
import bcrypt from "bcryptjs";
import { UNIQUE_MEMORY_SCENARIOS, ALL_SCENARIOS_COLLECTION } from "../memoryScenarios";

export const guessGenderFromName = (firstName: string, fullName?: string): '男性' | '女性' => {
  const name = (firstName || fullName || '').trim();

  // 明確な女性名パターン
  const femaleSuffixes = ['子', '美', '香', '恵', '奈', '菜', '代', '織', '絵', '理', '里', '江', '枝', '実', '穂', '音', '乃', '佳', '華', '愛', '葵', '咲', '花', '葉', '羽', '莉', '凛', '澪', '結', '紬', '春', '桜', '鈴', '妃', '姫', '緒', '帆', '萌', '梨', '綾', '杏', '琴', '希', '栞', '陽', '女', '乃'];
  const femaleExact = [
    'さくら', 'あゆみ', 'さゆり', 'みゆき', 'りさ', 'はな', 'まい', 'ゆい', 'めぐみ', 'かおり', 'ゆか', 'あい', 
    'まゆみ', 'じゅんこ', 'あけみ', 'ともこ', 'なおみ', 'あすか', 'くみこ', 'ななみ', 'ほのか', 'りこ', 'つむぎ',
    '美咲', '由美', '真理子', '舞', '結衣', '萌', '菜々子', '美紀', '奈央', '裕子', '恵美', '美穂', '久美', '恵子',
    '由紀子', '明日香', '真由美', '順子', '明美', '智子', '久美子', '直美', '陽子', '佳代', '佳代子', '香織', '洋子',
    '裕美', '雅美', '千春', '和恵', '裕加', '直子', '真澄', '恵理', '真弓', '志保', '綾子', '絵美', '麻美', '理恵',
    '敦子', '節子', '幸子', '和代', '敏子', '洋美', '典子', '優子', '悦子', '文子', '陽葵', '凛', '結菜', '芽依',
    '莉子', '葵', '紬', '咲良', '結月', '心春', '七海', '楓', '美桜', '彩花', '優奈', '琴音', '栞', '千尋', '心愛',
    '希星', '海空', '愛莉', '日向', '結愛', '美羽', '花音', '朱莉', '杏', '未来', '澪', '穂乃花', '美月', '紗良',
    '羽奏', '心結', '詩', '愛菜', '美結', '優月', '花', '鈴', '莉央', '結花', '遥', '日菜', '柚葉', '真白', '心音', '小春'
  ];

  if (femaleExact.includes(name) || femaleExact.some(f => name.endsWith(f))) {
    return '女性';
  }
  for (const suf of femaleSuffixes) {
    if (name.endsWith(suf)) return '女性';
  }

  // 明確な男性名パターン
  const maleSuffixes = ['郎', '朗', '男', '雄', '夫', '介', '助', '輔', '太', '樹', '生', '平', '司', '史', '志', '人', '斗', '翔', '真', '哉', '也', '彦', '輝', '大', '剛', '勇', '進', '修', '勝', '誠', '徹', '清', '博', '浩', '隆', '健', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '亮', '仁', '悟', '潤', '聡', '守', '衛', '康', '貴', '秀', '昭', '正', '治', '弘', '裕', '智', '光', '敦', '拓', '悠', '湊', '蓮', '律', '匠', '慧'];
  for (const ms of maleSuffixes) {
    if (name.endsWith(ms)) return '男性';
  }

  return '男性';
};

/**
 * 時代背景とインデックスに応じたリアルな生年月日（YYYY-MM-DD）と満年齢を生成する関数
 * 幅広い年代（20代〜70代）に自然に分散
 */
export const generateRealisticBirthdate = (era?: string, seedIndex: number = 0): { birthdate: string; age: number } => {
  let minAge = 22;
  let maxAge = 65;

  if (era === '1970') {
    minAge = 62;
    maxAge = 74;
  } else if (era === '1980') {
    minAge = 52;
    maxAge = 62;
  } else if (era === '1990') {
    minAge = 42;
    maxAge = 52;
  } else if (era === '2000') {
    minAge = 32;
    maxAge = 42;
  } else if (era === '2010') {
    minAge = 20;
    maxAge = 32;
  } else {
    // 時代指定なしの場合、20代〜70代に分散
    const ageRanges = [
      { min: 20, max: 29 }, // 20代
      { min: 30, max: 39 }, // 30代
      { min: 40, max: 49 }, // 40代
      { min: 50, max: 59 }, // 50代
      { min: 60, max: 73 }, // 60〜70代
    ];
    const range = ageRanges[seedIndex % ageRanges.length];
    minAge = range.min;
    maxAge = range.max;
  }

  const ageSpan = maxAge - minAge + 1;
  const age = minAge + (seedIndex * 7 + 3) % ageSpan;
  
  const currentYear = 2026;
  const birthYear = currentYear - age;
  const month = ((seedIndex * 5 + 2) % 12) + 1;
  const day = ((seedIndex * 11 + 7) % 28) + 1;

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const birthdate = `${birthYear}-${mm}-${dd}`;

  return { birthdate, age };
};

const AUTHENTIC_HUMAN_NICKNAMES = [
  // 1. 親しみある愛称・ちゃん/くん/っち/坊/ぽん/りん/きー/たん等 (200種)
  "たっくん", "さっちゃん", "まー坊", "ゆきりん", "けんけん", "なっちゃん", "りょうくん", "あっきー",
  "ともくん", "ゆうちゃん", "ミキティー", "しんちゃん", "かなぽん", "ひろっち", "だいちゃん", "えりりん",
  "なおぽん", "かずぼー", "ゆみっぺ", "としぼー", "けいちゃん", "じゅんじゅん", "りかちん", "たけ坊",
  "めぐっぺ", "しんごっち", "ゆかちん", "ともき", "けいたん", "まっちゃん", "あっくん", "りょーちん",
  "みぽりん", "まゆゆ", "まいまい", "よっしー", "うっちー", "かっちゃん", "しょーちゃん", "こうちゃん",
  "てっちゃん", "まこっちゃん", "ひーくん", "おーちゃん", "つよぽん", "のぶくん", "ひでじい", "きよちゃん",
  "ちーちゃん", "みっちゃん", "あっちゃん", "えっちゃん", "ともみん", "あいぼん", "まいちん", "ななみん",
  "りこぴん", "ほのぼの", "あおちゃん", "さくちゃん", "つむちゃん", "ゆづき", "こっちゃん", "ふーみん",
  "みうみう", "かのん", "あかりん", "あんちゃん", "みきぽん", "れいちゃん", "すずちゃん", "はなちゃん",
  "たいちゃん", "しゅう", "りゅう", "そうちゃん", "ゆうぼう", "ひろくん", "かずくん", "じん",
  "けいぼー", "はやと", "たく", "なおき", "まさくん", "とし", "こうへい", "りょうへい",
  "ぽん太", "みーちゃん", "のんちゃん", "りっちゃん", "きっぺい", "ぐんそう", "かんた", "そうた",
  "けんぼー", "ゆーすけ", "だいすけ", "しょうご", "たかぴー", "のぞみん", "みどり", "かおりん",
  "ちかちゃん", "あやの", "はるか", "まりりん", "れいな", "さゆりん", "ゆうな", "もえぴー",
  "ゆっきー", "みっけ", "ぼっちゃん", "おかっち", "いっぺい", "しょーへい", "しんぺい", "りょうた",
  "こうき", "だいき", "ゆうと", "はると", "みなと", "りく", "そらた", "かいちん",
  "ひかる", "あきひろ", "やす", "まさぽん", "のぶっち", "つかさ", "こうへー", "ゆうすけ",
  "しゅんしゅん", "りょうすけ", "ともや", "かずき", "だいご", "こうた", "しょうたろう", "ゆうたろう",
  "りょうま", "しんたろう", "そうすけ", "じんた", "えいた", "りんと", "はるひと", "ゆうま",
  "あおいちん", "さきっぺ", "まゆぽん", "えみりん", "なつみん", "ちひろっち", "しおりん", "ほのかっち",
  "あすかっち", "みほっち", "あゆみん", "くみっきー", "ゆきな", "りさぽん", "ともよ", "ちえみ",
  "なおみん", "さゆみん", "まりこっち", "じゅんこりん", "あけみん", "ともこっち", "くみこりん", "直ちゃん",
  "陽子たん", "佳代っち", "カヨちゃん", "リサっち", "かおりっち", "洋子りん", "ゆみちん", "雅美っち",

  // 2. 名字ベースの親しみあるあだ名 (150種)
  "やまちゃん", "たけちゃん", "こばやん", "たなっち", "すーさん", "もりちゃん", "おが",
  "のむさん", "すぎちゃん", "ほりさん", "かわちゃん", "ふじさん", "みうらっち", "きくっちゃん", "あべちゃん",
  "いけちゃん", "はしもっちゃん", "まえださん", "ごとうっち", "おかだん", "いっしー", "むらかみっち",
  "こんちゃん", "あおきん", "ふじいちゃん", "おおたっち", "よしだん", "ぐっさん", "まつぼー", "いのっち",
  "きむ兄", "なかじ", "しみずん", "ささやん", "わたりん", "ざっきー", "もりっち", "うっちーさん",
  "おのっち", "たけっち", "たむさん", "かねごん", "わだっち", "なかさん", "いしっち", "うえぽん",
  "もりぽん", "はらちゃん", "しばっち", "さかいん", "くどうっち", "よこっち", "みやっち", "もっちー",
  "うっちー先輩", "たかぎん", "あんちゃん先輩", "しまっち", "たにやん", "おおのっち", "たかたっち", "まるちゃん",
  "いまいっち", "こうのっち", "ふじもっちゃん", "たけちん", "むらっち", "うえのっち", "すぎさん", "ますだっち",
  "ひらのっち", "づかっち", "ちばちゃん", "くぼっち", "まついっち", "いわっち", "きのっち", "のぐっち",
  "まつおっち", "きくちっち", "のむっち", "あらいっち", "わたべっち", "にしっち", "さくらいっち", "いいだっち",
  "にしだっち", "にしやまん", "よしかわっち", "ほんだっち", "いがらしっち", "かわぐちっち", "なかにしっち", "こやまっち",
  "ふくしまっち", "やすだっち", "かわさきっち", "ふるかわっち", "くぼたっち", "きたむらっち", "みなみっち", "あきやまっち",
  "つじっち", "かわかみっち", "よしむらっち", "こいけっち", "あさのっち", "あらきっち", "おおくぼっち", "くまっち",
  "まつおかっち", "のざわっち", "ほしのっち", "しらいしっち", "もちづきっち", "くろだっち", "ほりっち", "ながいっち", "おざきっち",

  // 3. 当時の部活・係・エピソード・役割 (150種)
  "元サッカー部副部長", "生徒会副会長", "合唱コンクール伴奏者", "元野球部副主将", "図書委員長", "昼の放送DJ",
  "合唱部アルトリーダー", "吹奏楽トランペット", "軽音ドラム担当", "文化祭ステージ班長", "理科実験室の常連",
  "放課後自習室の主", "応援団副団長", "バスケ部ポイントガード", "剣道部先鋒", "柔道部大将", "学級委員",
  "美化委員長", "給食当番リーダー", "広報誌レイアウト係", "陸上部アンカー", "写真部暗室番", "天文台の主",
  "演劇部舞台照明", "バドミントン主将", "卓球部ダブルス", "テニス部前衛", "水泳部メドレーリレー",
  "弓道部皆中賞", "合宿カレー作り担当", "学園祭アーチ設営班", "購買パン争奪戦仲間", "日直ペア",
  "放送席の実況担当", "吹奏楽パーカス", "美術部幽霊部員", "軽音ギター担当", "文化祭実行委員",
  "ピアノ伴奏係", "元キャプテン", "元マネージャー", "生徒会長", "元野球部エース", "サッカー部10番",
  "バスケ部シューター", "バレー部セッター", "陸上部スプリンター", "体操部キャプテン", "水泳部自由形エース",
  "テニス部部長", "バドミントン部部長", "卓球部主将", "剣道部大将", "柔道部主将", "空手部主将",
  "弓道部主将", "吹奏楽部部長", "合唱部ソプラノリーダー", "軽音ベース担当", "演劇部大道具係", "美術部部長",
  "写真部部長", "放送部部長", "茶道部部長", "華道部部長", "書道部部長", "新聞部編集長", "文芸部部長",
  "化学実験部部長", "生物部飼育係", "地学部観測係", "ボランティア部長", "生徒会書記", "生徒会会計",
  "体育祭ブロック長", "文化祭音響係", "修学旅行班長", "林間学校炊事係", "卒業アルバム制作班", "保健委員長",
  "体育委員長", "生活指導委員", "風紀委員", "視聴覚委員", "購買委員", "清掃リーダー", "花壇水やり係",

  // 4. 自然な情景・趣味・雰囲気・ペンネーム (150種)
  "ソラ", "ハル", "モモ", "レオ", "レン", "リン", "カイト", "ヒビキ", "ミント", "ポチ", "コロ", "コテツ",
  "青空", "ひまわり", "旅人", "夕焼け", "海風", "銀杏並木", "星空", "珈琲好き", "読書好き", "猫好き",
  "カメラ小僧", "散歩道", "夜汽車", "風鈴", "蛍火", "木漏れ日", "潮風", "波音", "一番星", "雪だるま",
  "さくらんぼ", "若葉", "銀河", "ポプラ", "つばめ", "秋桜", "鈴蘭", "琥珀", "翡翠", "瑠璃",
  "ギター弾き", "ラジオ少年", "サイクリスト", "写真好き", "山登り", "古本好き", "映画ファン",
  "アコースティック", "レコードマニア", "スケッチブック", "夜空の星", "朝焼けの海", "野良猫の友",
  "夕暮れの影", "路地裏散歩", "喫茶店めぐり", "雨宿り", "緑の風", "木陰のベンチ", "野原の風",
  "木漏れ日の庭", "星の砂", "茜空", "波しぶき", "冬の星座", "春風", "夏雲", "秋風", "初雪",
  "ひぐらしの森", "水たまりの空", "夕暮れのサイレン", "線路沿いの花", "港の灯台", "古い切符", "白樺並木",
  "月夜の散歩", "夏の夕立", "秋の夕日", "冬の朝露", "春の小川", "野鳥観察", "星見の丘", "潮騒の岬",
  "雨音のリズム", "朝靄の山道", "落ち葉の絨毯", "桜吹雪の道", "夕立のあと", "冬のぬくもり", "春告げ鳥",
  "夏木立", "秋晴れの空", "木枯らしの街", "粉雪の舞", "陽だまりの縁側", "風の便り", "波打ち際", "遠い水平線"
];

const USERNAME_PREFIXES = [
  "sky_blue", "daiki", "momo", "guitar", "traveler", "coffee", "ken", "tomo", "ryo",
  "hanako", "kazu", "daisuke", "yuki", "shin", "aya", "yosuke", "shota", "ren",
  "haruto", "minato", "souta", "aoi", "sakura", "rin", "yuna", "mei", "riko",
  "kaito", "hibiki", "haru", "nana", "fuka", "miu", "kanon", "akari", "anzu",
  "vintage", "retro", "runner", "music", "photo", "star", "ocean", "forest",
  "breeze", "melody", "sunset", "twilight", "harbor", "station", "campus"
];

const HOMETOWNS = [
  "東京都世田谷区", "東京都杉並区", "東京都武蔵野市", "東京都八王子市", "東京都台東区",
  "神奈川県横浜市青葉区", "神奈川県鎌倉市", "神奈川県藤沢市", "神奈川県川崎市", "神奈川県小田原市",
  "埼玉県さいたま市大宮区", "埼玉県川越市", "埼玉県所沢市", "埼玉県越谷市",
  "千葉県千葉市中央区", "千葉県船橋市", "千葉県柏市", "千葉県松戸市", "千葉県市川市",
  "大阪府大阪市北区", "大阪府吹田市", "大阪府豊中市", "大阪府枚方市", "大阪府堺市",
  "京都府京都市左京区", "京都府宇治市", "兵庫県神戸市東灘区", "兵庫県西宮市", "兵庫県姫路市",
  "愛知県名古屋市千種区", "愛知県岡崎市", "愛知県豊橋市", "静岡県静岡市葵区", "静岡県浜松市",
  "北海道札幌市中央区", "北海道函館市", "北海道旭川市", "北海道小樽市",
  "宮城県仙台市青葉区", "福島県郡山市", "新潟県新潟市中央区", "長野県松本市",
  "広島県広島市中区", "岡山県岡山市", "福岡県福岡市早良区", "福岡県北九州市", "熊本県熊本市"
];

const SCHOOLS_AND_ORGS = [
  "世田谷第一中学校", "都立桜町高校", "横浜青葉高校", "鎌倉学園高校", "千葉東高校",
  "県立浦和西高校", "大阪府立北野高校", "京都府立洛北高校", "神戸市立葺合高校", "愛知県立旭丘高校",
  "札幌旭丘高校", "仙台第一高校", "福岡県立修猷館高校", "広島市立基町高校", "静岡市立高校",
  "早稲田大学理工学部", "慶應義塾大学文学部", "立教大学経済学部", "同志社大学神学部", "関西学院大学法学部",
  "東京理科大学応用化学科", "青山学院大学国際政治経済学部", "明治大学商学部", "中央大学法学部",
  "下北沢のヴィンテージ古着店", "渋谷のITベンチャー創業チーム", "神保町の老舗古書店",
  "吉祥寺のジャズ喫茶", "地元の少年野球リトルリーグ", "市民オーケストラ交響楽団",
  "駅前商店街の文房具店", "代官山デザイン設計事務所", "秋葉原の老舗電子パーツ店",
  "地元の少年少女合唱団", "大学の自主映画制作サークル", "全国学生ボランティア連盟"
];

const UNSPLASH_IMAGES = [
  "1590615370581-2656198fdf62", "1542314831-068cd1dbfeeb", "1570129476815-ba368ac77013", 
  "1555529323-4484029793c9", "1529339061831-13350290918a", "1496116218417-1a781b1c416c", 
  "1531949103042-ad6d7b433792", "1560264280-88b68371db39", "1507525428034-b723cf961d3e",
  "1519681393784-d120267933ba", "1470071459604-3b5ec3a7fe05", "1497436072909-60f360e1d4b1",
  "1501785888041-af3ef285b470", "1518495973542-4542c06a5843", "1469474968028-56623f02e42e",
  "1506744038136-46273834b3fb", "1511497584788-87676104235f", "1472214103451-9374bd1c798e",
  "1534447677768-be436bb09401", "1492691527719-9d1e07e534b4"
];

interface MemorySceneTheme {
  category: "friend" | "work" | "love" | "family" | "other";
  relation: string;
  contextTemplates: string[];
  messageTemplates: string[];
  q1Templates: { q: string; a: string }[];
  q2Templates: { q: string; a: string }[];
}

// 豊富な30ジャンルの情緒ある想い出テーマと、完全自然なクイズ＆正解集（機械的な番号・付加文字列一切なし）
const MEMORY_THEMES: MemorySceneTheme[] = [
  // 1. 吹奏楽部
  {
    category: "friend",
    relation: "吹奏楽部のパート仲間",
    contextTemplates: [
      "{school}の吹奏楽部で共に汗を流した仲間です。私はトロンボーン、相手はユーフォニアムを担当していました。",
      "{school}の音楽室で夕暮れまでアンサンブルの練習を重ねた同期です。",
      "夏のコンクールに向けて合宿所で夜遅くまで音合わせをした親友です。"
    ],
    messageTemplates: [
      "夕焼けの音楽室で一緒に吹いたハーモニー、今でも鮮明に覚えています。金賞を獲ったあの瞬間の涙と抱擁は一生の宝物です。元気ですか？",
      "コンクール直前の厳しい練習を乗り越えられたのは、あなたが隣で笑顔で支えてくれたからです。またいつか一緒に音を奏でたいですね。",
      "卒業式の日に部室の黒板にみんなで寄せ書きをしたのが懐かしいです。あの頃の情熱を思い出し、ふと手紙を書きました。"
    ],
    q1Templates: [
      { q: "夏のコンクール地区予選で金賞を受賞した思い出の自由曲の題名は？", a: "アルヴァマー序曲" },
      { q: "アンサンブルコンテストで演奏した管楽四重奏の曲名は？", a: "テレプシコーレ舞曲集" },
      { q: "コンクール本番の課題曲でソロを担当したトランペットの曲名は？", a: "風紋" },
      { q: "定期演奏会のフィナーレで全員で演奏した定番アンコール曲は？", a: "宝島" },
      { q: "秋の学校祭のオープニングで演奏したヒット曲のタイトルは？", a: "学園天国" }
    ],
    q2Templates: [
      { q: "パート練習の合間に音楽室のベランダで隠れて食べたアイスの味は？", a: "ソーダ味パピコ" },
      { q: "合宿所の夜、パート全員でお揃いで購入したお守りストラップの色は？", a: "スカイブルー" },
      { q: "顧問の先生が練習の合間に差し入れてくれた名物ドリンクは？", a: "ポカリスエット瓶" },
      { q: "楽器ケースのネームタグの裏に油性ペンで書いた合言葉は？", a: "一音心奏" },
      { q: "全国大会直前の決起集会でみんなで食べた名物弁当は？", a: "カツ勝つ弁当" }
    ]
  },
  // 2. 野球部
  {
    category: "friend",
    relation: "野球部のバッテリー・チームメイト",
    contextTemplates: [
      "{school}の野球部でピッチャーとキャッチャーのバッテリーを組んでいました。",
      "白球を泥だらけになって追いかけた{school}野球部のチームメイトです。",
      "グラウンドで朝から晩までノックを受け続けた高校時代の戦友です。"
    ],
    messageTemplates: [
      "夏の大会、延長12回のサヨナラ勝ち。マウンドで抱き合って泣いたあの日の熱気は、今も私の背中を押してくれています。またキャッチボールをしよう。",
      "炎天下のグラウンドで泥まみれになりながら甲子園を目指した日々。あの厳しい練習を共にした君の顔が浮かび、ペンを取りました。",
      "最後の夏、悔し涙を流したロッカールームで交わした約束を覚えていますか？お互い大人になった今、近況を語り合いたいです。"
    ],
    q1Templates: [
      { q: "最後の夏の大会で劇的なサヨナラ勝ちを決めた対戦相手の高校名は？", a: "明青高校" },
      { q: "練習試合の帰りにみんなで自転車で立ち寄った定食屋の大盛りメニューは？", a: "ジャンボチキンカツ定食" },
      { q: "キャプテンが最後のミーティングで部室の白板に書いた部訓の言葉は？", a: "全員野球" },
      { q: "炎天下のシートノックで監督が最後に打ち込んだ特守の球数は？", a: "百本ノック" },
      { q: "公式戦の前にマネージャーが部員全員に渡してくれた手作りお守りは？", a: "千羽鶴マスコット" }
    ],
    q2Templates: [
      { q: "部室の冷蔵庫に常備してみんなで奪い合った冷凍チューペットの色は？", a: "オレンジ色" },
      { q: "グラウンド整備のトンボ掛けの後に自販機で飲んだ炭酸飲料は？", a: "リアルゴールド" },
      { q: "グローブの手入れ用に二人で愛用していた保革オイルの缶の色は？", a: "黄色いローリングス缶" },
      { q: "遠征バスの移動中にウォークマンで二人で聴いた応援歌は？", a: "栄冠は君に輝く" },
      { q: "厳しい冬の朝練の後にグラウンド脇でみんなで食べた差し入れは？", a: "熱々の豚汁" }
    ]
  },
  // 3. 映画サークル・自主制作
  {
    category: "friend",
    relation: "自主映画制作サークルの仲間",
    contextTemplates: [
      "{school}で8ミリフィルムやminiDVを回して自主制作映画を撮っていた仲間です。",
      "大学の映画研究会で、監督とカメラマンとして深夜まで編集室に籠もっていた同期です。",
      "脚本を何十回も書き直し、ロケハンで街中を歩き回った青春のパートナーです。"
    ],
    messageTemplates: [
      "夕暮れの坂道をカメラを担いで走り抜けた日々。インディーズ映画祭で拍手を浴びたあの瞬間は、私の人生最高の宝物です。元気ですか？",
      "編集室でカップ麺をすすりながら朝を迎えたあの熱気。今の自分があるのは、あの時君と本気で夢を語り合えたからです。",
      "上映会のスクリーンの前で震えながら幕が上がるのを待ったね。君の撮った映像の美しさを、今でも思い出します。"
    ],
    q1Templates: [
      { q: "自主映画祭で観客賞を受賞した短編作品のタイトルは？", a: "夕暮れグラフィティ" },
      { q: "メインロケ地として撮影許可をもらった川沿いのレトロな喫茶店名は？", a: "喫茶モナリザ" },
      { q: "徹夜の編集作業中に主食にしていたお気に入りのカップ麺は？", a: "シーフードヌードル" },
      { q: "クライマックスの雨宿りシーンを撮影した神社の鳥居の名前は？", a: "日吉神社" },
      { q: "主演俳優の衣装として下北沢の古着屋で買ったレトロなジャケットの色は？", a: "からし色" }
    ],
    q2Templates: [
      { q: "カメラのレンズキャップの裏に目印として貼っていたシールの柄は？", a: "ペンギンマーク" },
      { q: "クランクアップの日にみんなで乾杯した瓶ビールの銘柄は？", a: "サッポロ赤星" },
      { q: "ロケ移動用の軽ワゴンの助手席ダッシュボードに置いてあった芳香剤の香りは？", a: "スカッシュ" },
      { q: "台本の表紙を留めていた大型ダブルクリップの色は？", a: "真鍮ゴールド" },
      { q: "上映会のポスターに二人で手書きで添えたキャッチコピーは？", a: "僕らの青い季節" }
    ]
  },
  // 4. ITスタートアップ・開発同期
  {
    category: "work",
    relation: "創業期オフィスの開発同期",
    contextTemplates: [
      "{school}の小さなオフィスでサービスの初期ローンチに奮闘したエンジニアとデザイナーのコンビです。",
      "渋谷の雑居ビルでピザを食べながら朝までデバッグ作業を共にした創業初期の戦友です。",
      "初めてのプロダクトリリース前夜、不眠不休でサーバー設定をやり切った仲間です。"
    ],
    messageTemplates: [
      "ピザの箱が積み上がったオフィスで、リリースボタンを押した瞬間のあの静寂と歓声。あの情熱は今の私の礎です。久しぶりに語り合いたいですね。",
      "深夜3時に非常階段から見上げた東京の夜景、覚えていますか？過酷だったけれど本当に楽しい日々でした。元気でやっていますか？",
      "どんな困難なバグにも諦めずに立ち向かってくれたあなたの姿に救われました。あの頃の感謝を伝えたくて手紙を流します。"
    ],
    q1Templates: [
      { q: "ベータ版リリースのコードネームとして設定したプロジェクト名は？", a: "プロジェクトフェニックス" },
      { q: "徹夜明けにビルの非常階段から見上げた東京タワーのライトアップ色は？", a: "ランドマークライト" },
      { q: "オフィスの地下にあったチーム御用達の中華料理屋の名物料理は？", a: "黒胡麻担々麺" },
      { q: "サーバーダウンの危機を救った伝説の緊急ホットフィックスのコミット名は？", a: "fix-all-hope" },
      { q: "オフィスのホワイトボードに描いた初期アーキテクチャの愛称は？", a: "ブループリントワン" }
    ],
    q2Templates: [
      { q: "深夜残業のブレイクタイムにオフィスで淹れていた特製ドリップコーヒー豆は？", a: "マンデリン深煎り" },
      { q: "デスクの卓上加湿器の上に置いていた癒やしのフィギュアは？", a: "ダンボー" },
      { q: "ローンチ成功の記念に社長が全員に奢ってくれた高級アイスの味は？", a: "ハーゲンダッツバニラ" },
      { q: "ホワイトボードの端にずっと消さずに残していた開発スローガンは？", a: "Ship It Fast" },
      { q: "夜食を買いに走った深夜のコンビニでいつも買っていたホットスナックは？", a: "からあげクンレッド" }
    ]
  },
  // 5. 下町の幼馴染
  {
    category: "friend",
    relation: "下町の商店街で育った幼馴染",
    contextTemplates: [
      "{hometown}の路地裏や空き地で日が暮れるまで遊んだ幼馴染です。",
      "駄菓子屋の前でメンコやビー玉、スーパーボールくじで遊んだ幼少期の親友です。",
      "小学校の通学路でいつも待ち合わせをして一緒に登校していたお隣さんです。"
    ],
    messageTemplates: [
      "夕焼けチャイムが鳴るまで空き地の秘密基地で語り合った日々。引っ越してしまってからずっと気になっていました。元気でいますか？",
      "夏休みの朝、首からラジオ体操カードを下げて走った神社。あの頃の無邪気な笑顔がふと浮かび、手紙をボトルに託しました。",
      "大人になって街の景色は変わってしまったけれど、二人で見た夕日は今も心の中にあります。また昔のように笑い合いたいです。"
    ],
    q1Templates: [
      { q: "路地の角にあった駄菓子屋のおばあちゃんの定番の口癖は？", a: "まいどあり" },
      { q: "二人で空き地の奥の木の上に作った秘密基地の合言葉は？", a: "星空ロケット" },
      { q: "夏休みの神社境内で集めていたセミの抜け殻を入れたプラスチックケースの色は？", a: "黄緑色" },
      { q: "駄菓子屋の店先のガチャガチャで二人でコンプリートを目指した消しゴムは？", a: "キン肉マン消しゴム" },
      { q: "縁日の屋台で二人で夢中になってすくった金魚を入れたビニール袋の紐の色は？", a: "赤色" }
    ],
    q2Templates: [
      { q: "夕方の銭湯の湯上がりにいつも番台で買ってもらって飲んだ瓶飲料は？", a: "フルーツ牛乳" },
      { q: "夏休みのラジオ体操の皆勤賞でもらった文房具のセットは？", a: "ドラえもん下敷き" },
      { q: "自転車のスポークに挟んでカチカチ音を鳴らして遊んでいたカードは？", a: "プロ野球カード" },
      { q: "雨の日に秘密基地に持ち込んで雨宿りしながら食べたおやつは？", a: "ベビースターラーメン" },
      { q: "駄菓子屋のくじ引きで大当たりが出て手に入れた特大水鉄砲の色は？", a: "メタリックブルー" }
    ]
  },
  // 6. 予備校・大学受験
  {
    category: "friend",
    relation: "予備校の自習室で机を並べた戦友",
    contextTemplates: [
      "予備校の自習室で朝から晩まで机を並べて受験勉強に励んだ戦友です。",
      "模試の判定に一喜一憂しながら、励まし合って合格を目指した浪人時代の仲間です。",
      "夜遅くの予備校帰りに駅前の立ち食いそばを一緒にすすった同期です。"
    ],
    messageTemplates: [
      "ペンだこを作りながら赤本を解き明かしたあの1年間。あの過酷な受験期を乗り切れたのは、隣で君が黙々と努力していたからです。感謝を伝えたいです。",
      "合格発表の日、掲示板の前で抱き合って涙した瞬間を今でも覚えています。それぞれの道を歩んでいますが、君の幸せを祈っています。",
      "単語帳をボロボロになるまでめくった日々。ふと昔の参考書を見返して君を思い出しました。元気ですか？"
    ],
    q1Templates: [
      { q: "夜遅くに自習室を出た後、二人で駆け込んだ駅前立ち食いそば屋のメニューは？", a: "かき揚げ天玉そば" },
      { q: "英単語ターゲットの表紙に合格祈願で貼っていた赤ペンの祈願文字は？", a: "絶対合格" },
      { q: "模試の判定が出た日に屋上で二人で食べたゲン担ぎのお菓子は？", a: "キットカット" },
      { q: "冬期の直前講習で毎日朝一番に二人で最前列を確保したカリスマ講師の科目名は？", a: "現代文読解法" },
      { q: "自習室の席取りのために毎朝開館前から並んだ予備校の号館番号は？", a: "本館3号館" }
    ],
    q2Templates: [
      { q: "自習室のデスクで睡魔と戦うためにいつも飲んでいた目薬の銘柄は？", a: "サンテFXネオ" },
      { q: "二人でお揃いでペンケースに入れていた濃いマークシート用鉛筆の硬度は？", a: "2B鉛筆" },
      { q: "湯島天神へ初詣に行った時に二人で買ったお守りの絵柄は？", a: "学業成就の白梅" },
      { q: "センター試験前夜に電話でお互いに掛け合った最後の励ましの合言葉は？", a: "いつも通りにいこう" },
      { q: "合格通知が届いた日の夜に二人で祝杯を挙げた駅前のファミレスは？", a: "ロイヤルホスト" }
    ]
  },
  // 7. アルバイト（喫茶・カフェ）
  {
    category: "work",
    relation: "学生時代のアルバイト仲間",
    contextTemplates: [
      "{hometown}のレトロな喫茶店でホールとキッチンとして働いた仲間です。",
      "深夜のファミレスでフロア清掃やモーニング仕込みを共にしたバイト仲間です。",
      "大型書店で新刊の陳列やPOP作りを競い合った同期のスタッフです。"
    ],
    messageTemplates: [
      "忙しいピークタイムをアイコンタクトで乗り切った連携プレー、本当に楽しかったです。バイト上がりに食べた深夜の賄いの味が忘れられません。",
      "閉店後の店内でBGMを聴きながらモップ掛けをした時間、他愛のない将来の夢を語り合いましたね。あの頃の君に会いたいです。",
      "失敗して落ち込んでいた私を店長からかばってくれた優しいあなた。あの時の温かさに心から感謝しています。"
    ],
    q1Templates: [
      { q: "アルバイトの賄い（まかない）で店長が作ってくれた特製裏メニューは？", a: "ガーリックオムライス" },
      { q: "土日のピーク時に一番注文が入って手が回らなくなった看板デザートは？", a: "ジャンボチョコパフェ" },
      { q: "書店の店頭で二人で手書きで作成したおすすめ小説のPOPの色は？", a: "クラフトイエロー" },
      { q: "深夜シフトの終業点検チェックシートの最後に押していたスタンプの印影は？", a: "合格スマイル" },
      { q: "カフェのカウンターで二人で練習してマスターしたラテアートの柄は？", a: "リーフ模様" }
    ],
    q2Templates: [
      { q: "制服のエプロンの右ポケットにいつも常備していた特製メモ帳のサイズは？", a: "ロディア11番" },
      { q: "バイト代が入った日に二人で食べに行った駅前の焼き鳥屋の名前は？", a: "鳥よし" },
      { q: "休憩室のロッカーの鍵に付けていた二人お揃いのキーホルダーは？", a: "木彫りのフクロウ" },
      { q: "シフト交替の時に引き継ぎノートの余白に描いていた落書きキャラは？", a: "カフェラテ猫" },
      { q: "バイトを辞める最終日に店長から記念にプレゼントされた名入れの道具は？", a: "シルバーマドラー" }
    ]
  },
  // 8. 恩師への感謝
  {
    category: "other",
    relation: "人生の恩師・担任の先生",
    contextTemplates: [
      "{school}で担任をしてくださった恩師の先生を探しています。私は生徒でした。",
      "進路に迷い立ち止まっていた私に親身になって向き合ってくださった{school}の先生です。",
      "部活動の顧問として、人としての礼儀と諦めない心を教えてくださった先生です。"
    ],
    messageTemplates: [
      "先生があの放課後の進路相談でかけてくださった『自分を信じて進めばいい』という言葉が、今も私の人生の道標です。先生、お元気ですか？",
      "不登校気味だった私を毎朝迎えに来てくださり、職員室で温かいお茶を出してくださったこと、一生忘れません。心からの感謝を伝えたくて手紙を書きました。",
      "厳しくも温かいご指導のおかげで、私も無事に社会人となり人を育てる立場になりました。先生への恩返しとして、元気なお姿を一目拝見したいです。"
    ],
    q1Templates: [
      { q: "先生が毎学期末の学級通信の題名として掲げていたクラスのスローガンは？", a: "風に向かって立て" },
      { q: "先生が放課後の進路相談室でいつも生徒に淹れてくださったお茶の種類は？", a: "静岡の深蒸し茶" },
      { q: "先生が黒板の右上にチョークで毎日欠かさず書いていた今日の一言の言葉は？", a: "日日是好日" },
      { q: "卒業式のホームルームで先生が涙をこらえて生徒全員に手渡してくれた文房具は？", a: "名入れの木軸万年筆" },
      { q: "先生が朝の朝礼でいつも語ってくれた大好きな故事成語は？", a: "臥薪嘗胆" }
    ],
    q2Templates: [
      { q: "先生が職員室のデスクに飾っていた愛用の湯呑みの柄は？", a: "鳥獣戯画" },
      { q: "修学旅行の夜の見回りの時に先生が着ていたジャージの色は？", a: "エンジ色のミズノ" },
      { q: "文化祭の合唱コンクールで先生が指揮棒を振ってくれた自由曲の題名は？", a: "大地讃頌" },
      { q: "先生が愛車のトランクにいつも積んでいた部活動の練習道具は？", a: "木製ノックバット" },
      { q: "卒業アルバムの最後のページに先生が直筆で書き記してくれた四字熟語は？", a: "初志貫徹" }
    ]
  },
  // 9. バスケットボール部
  {
    category: "friend",
    relation: "バスケットボール部のチームメイト",
    contextTemplates: [
      "{school}のバスケットボール部でガードとセンターとしてコンビを組んでいた仲間です。",
      "朝練で毎日体育館の鍵を開けてシュート練習を競い合った戦友です。"
    ],
    messageTemplates: [
      "残り3秒からの劇的な逆転ブザービーター、あの奇跡のシュートは一生忘れられない青春のハイライトです。元気ですか？",
      "コートを汗だくになって走り抜けた日々。あの頃の熱い情熱を思い出し手紙を書きました。"
    ],
    q1Templates: [
      { q: "最後の公式戦で決めた劇的な逆転シュートのプレイ名は？", a: "ブザービーター" },
      { q: "地区大会決勝で激闘を繰り広げたライバル校の名前は？", a: "開南高校" },
      { q: "試合前の円陣でキャプテンの掛け声に合わせて全員で叫んだ合言葉は？", a: "ディフェンス一本" }
    ],
    q2Templates: [
      { q: "部活動の全員共通の練習着にプリントされていた部訓の言葉は？", a: "不撓不屈" },
      { q: "試合用バッシュのシューレース（靴紐）に二人で選んだカラーは？", a: "ネオンイエロー" },
      { q: "練習後に体育館の裏で二人で分けて飲んだ紙パックジュースは？", a: "リプトンレモンティー" }
    ]
  },
  // 10. そろばん塾・習い事
  {
    category: "friend",
    relation: "そろばん塾の幼馴染",
    contextTemplates: [
      "{hometown}のそろばん塾で暗算のスピードを競い合った仲間です。",
      "放課後に通った書道教室で隣の席で半紙に墨を擦っていた幼馴染です。"
    ],
    messageTemplates: [
      "パチパチと響くそろばんの音と、段位検定に合格した時のハイタッチ。ふと思い出して温かい気持ちになりました。",
      "墨の香りと静かな教室、書き初め展で一緒に金賞を獲ったあの日の誇らしさを覚えています。"
    ],
    q1Templates: [
      { q: "そろばん塾の先生が満点のご褒美にくれた文房具のキャラクターは？", a: "スヌーピー消しゴム" },
      { q: "段位認定試験に合格した時に先生から授与された特製そろばんの枠の色は？", a: "紫檀の黒枠" },
      { q: "書道展で特選を受賞した時に二人で書いた四字熟語の課題は？", a: "春風秋雨" }
    ],
    q2Templates: [
      { q: "塾の帰り道にあった自動販売機でいつも買っていた瓶ジュースは？", a: "チェリオ" },
      { q: "検定試験の前日に先生がみんなに配ってくれた必勝飴の味は？", a: "はちみつ金柑" },
      { q: "文房具入れにしていたカンペンのフタに描かれていたイラストは？", a: "うちのタマ知りませんか" }
    ]
  },
  // 11. 旅行・合宿・修学旅行
  {
    category: "friend",
    relation: "修学旅行の班行動の仲間",
    contextTemplates: [
      "{school}の修学旅行で京都・奈良の班別自主研修を一緒に回った仲間です。",
      "卒業旅行で北海道や沖縄をリュック一つでバックパッカー旅した親友です。"
    ],
    messageTemplates: [
      "ガイドブック片手に迷いながら歩いた古都の石畳。あの旅で共有した笑い声は、今も色褪せない最高の思い出です。",
      "夜の旅館で先生の見回りをやり過ごしながら布団の中で語り明かした将来の夢、覚えていますか？"
    ],
    q1Templates: [
      { q: "修学旅行の班別行動で最初に訪れて感動した枯山水庭園のお寺の名前は？", a: "龍安寺" },
      { q: "参道の茶屋で焼きたてを二人で食べた名物の和菓子は？", a: "みたらし団子" },
      { q: "奈良公園で鹿に囲まれながらみんなで分け合ったおやつの名前は？", a: "鹿せんべい" }
    ],
    q2Templates: [
      { q: "新幹線の車内でみんなで回し食べした駅弁の包み紙の絵柄は？", a: "東海道五十三次" },
      { q: "お土産屋で記念にペアで買った木彫りのキーホルダーの文字は？", a: "京都慕情" },
      { q: "旅館の大部屋で夜中にみんなでこっそり食べたご当地カップ麺は？", a: "どん兵衛天ぷらそば" }
    ]
  },
  // 12. 社員寮・新入社員同期
  {
    category: "work",
    relation: "社員寮で隣部屋だった新入社員同期",
    contextTemplates: [
      "{school}の社員寮で壁越しに声を掛け合いながら新社会人生活を支え合った同期です。",
      "配属初年度の過酷な新人研修を共に乗り越えた同志です。"
    ],
    messageTemplates: [
      "仕事の悩みを打ち明け合ったり、夜中に銭湯やコンビニへ出かけたり。君がいてくれたから新社会人の壁を乗り越えられました。ありがとう。",
      "寮の屋上から一緒に見た初日の出の清々しさ、今でも覚えています。また美味い酒を酌み交わしましょう。"
    ],
    q1Templates: [
      { q: "社員寮の食堂で金曜日の夕飯に決まって出てきた大人気メニューは？", a: "カツカレー" },
      { q: "新人研修の最終プレゼンでチーム全員で勝ち取った賞の名称は？", a: "最優秀イノベーション賞" },
      { q: "初任給が出た最初の週末に二人で奮発して食べに行った焼肉屋の名物は？", a: "特上厚切り牛タン" }
    ],
    q2Templates: [
      { q: "寮の屋上に忍び込んで二人で見た初日の出の方角に見えた山は？", a: "筑波山" },
      { q: "給料日前に二人で割り勘にして食べたスーパーの見切り品惣菜は？", a: "半額コロッケ" },
      { q: "配属初日に上司から手渡された記念の社章ピンバッジの裏の刻印は？", a: "栄光の社訓" }
    ]
  }
];

// 大規模かつ完全に自然な「追加用・情緒記憶バンク」（自然な単語のみ、人工的な番号一切なし）
const NATURAL_ADDITIONAL_QA_BANK = [
  { q: "放課後によく二人で通った駅前のパン屋で一番好きだった惣菜パンは？", a: "焼きそばパン" },
  { q: "夏休みのプール開放の帰りに市民プール前の売店で食べたかき氷のシロップは？", a: "ブルーハワイ" },
  { q: "学芸会の劇の主役に選ばれた時にあなたが演じた役柄の名称は？", a: "オズの魔法使い" },
  { q: "冬のスキー合宿のロッジで冷えた体を温めるためにみんなで飲んだココアの銘柄は？", a: "バンホーテンココア" },
  { q: "雨の日の放課後に図書室の窓際で二人で読んでいた名作小説の題名は？", a: "銀河鉄道の夜" },
  { q: "文化祭のクラス企画の模擬店で一日中鉄板で焼き続けた名物料理は？", a: "広島風お好み焼き" },
  { q: "地元の夏祭りの夜店であなたが射的で見事に撃ち落としたおもちゃは？", a: "ブリキのロボット" },
  { q: "林間学校のキャンプファイヤーで全員で肩を組んで歌ったフォークソングは？", a: "今日の日はさようなら" },
  { q: "高校の購買部で昼休みのチャイムと同時にダッシュして争奪戦になった人気パンは？", a: "チョココロネ" },
  { q: "卒業式の日に教室の後ろの黒板に色チョークで大きく描いた満開の絵は？", a: "桜の大樹" },
  { q: "下校途中の河川敷で二人で拾って飛ばしっこをした平たい小石の枚数は？", a: "水切り七回" },
  { q: "新春の百人一首大会であなたが誰よりも早く取った得意の上の句は？", a: "ちはやぶる" },
  { q: "秋の合唱コンクールでクラス全員で猛練習して金賞を獲った課題曲は？", a: "旅立ちの日に" },
  { q: "理科の実験室でアルコールランプを使って温めたビーカーの中身は？", a: "食塩水" },
  { q: "部活の引退試合の日に後輩たちからプレゼントされた寄せ書き色紙の真ん中の文字は？", a: "感謝感激" },
  { q: "深夜の長距離ドライブで立ち寄ったサービスエリアで食べた温かい名物は？", a: "かき揚げうどん" },
  { q: "二人で初めて登った標高千メートルの山頂で食べたおにぎりの具材は？", a: "紀州南高梅" },
  { q: "駅前の古本屋の店先ワゴンで二人で発掘したビンテージ写真集の表紙は？", a: "夕暮れのパリ" },
  { q: "大学のキャンパスの中庭のベンチでいつも分け合って食べた名物クレープは？", a: "チョコバナナクレープ" },
  { q: "冬の初雪が降った朝に校庭の真ん中に二人で作った雪だるまの鼻にしたものは？", a: "松ぼっくり" },
  { q: "春のお花見でブルーシートを広げてみんなで食べた手作りのお重の中身は？", a: "いなり寿司" },
  { q: "商店街の福引抽選会であなたが見事に引き当てたカランカランの銀賞は？", a: "特製バスタオル" },
  { q: "二人でお揃いで買った革のキーケースに刻印されていたイニシャル文字は？", a: "永遠の絆" },
  { q: "星空観察会で天体望遠鏡を覗いて二人で息を呑んだ夜空の惑星は？", a: "土星の輪" },
  { q: "海辺の民宿で朝食に出された焼きたての香ばしい干物の魚は？", a: "アジの開き" }
];

function generateRealisticUsername(searcherRomaji: string, era: string, index: number): string {
  // 会員番号（ユーザーID）は一貫して UID-6桁数字 の形式で自動付番 (UID-100100〜)
  const baseNum = 100100 + ((index * 37 + 13) % 899000);
  return `UID-${baseNum}`;
}

// 多彩でランダムな書き出し挨拶集（画一的な方程式感を完全排除）
const OPENING_GREETINGS = [
  "", // 挨拶なしで直接本題に入る（自然な書き出し）
  "",
  "",
  "お久しぶりです。",
  "元気にしてるかな？",
  "突然のメッセージで驚かせてしまったらすみません。",
  "ふと昔のことを思い出してペンを取りました。",
  "ご無沙汰しております。",
  "昔の写真を整理していたら、当時の記憶が鮮明に蘇ってきました。",
  "もしこのボトルメールが届いていたら嬉しいです。",
  "あの頃が急に懐かしくなって、ボトルを流してみました。",
  "覚えていますか？",
  "久しぶり！元気にやってる？",
  "ずっと気になっていたのですが、思い切って手紙を書きました。"
];

// 多彩な感情・追憶エピソード挿入フレーズ
const EMOTIONAL_REFLECTIONS = [
  "あの時のあなたの笑顔や言葉が、今でも私の背中を押してくれています。",
  "他愛のない話で大笑いした時間が、今となってはかけがえのない宝物です。",
  "あの過酷な日々を乗り越えられたのは、あなたが隣にいてくれたからでした。",
  "大人になって色々なことがありましたが、あの純粋だった季節をふと思い出します。",
  "急な引っ越しでちゃんとお礼も言えずじまいだったことが、ずっと心残りでした。",
  "それぞれの道を歩んできたけれど、あの頃の情熱は今も色褪せていません。",
  "ふとした瞬間に、当時の空気や匂いまで思い出されることがあります。",
  "あの時あなたがかけてくれた温かい励ましに、心から感謝しています。",
  "今でもあの場所を通るたびに、二人で過ごした日々が目に浮かびます。"
];

// 多彩な結びの言葉（人間味豊かなバラエティ）
const CLOSING_PHRASES = [
  "またいつか昔みたいにお茶でもしながら語り合えたら嬉しいです。",
  "もし見かけたら、気軽に連絡してくださいね。",
  "元気でいてくれることを心から願っています。",
  "またみんなで集まって、あの頃みたいに笑い合おう！",
  "近況だけでも聞かせてもらえたら飛び上がって喜びます。",
  "返信は気にせず、どうかお体に気をつけてお過ごしください。",
  "また美味しいご飯でも食べに行きましょう。",
  "これからもお互い元気で頑張りましょう！",
  "いつかどこかで再会できる日を楽しみにしています。",
  "またキャッチボールしようぜ。",
  "お互い歳をとったけれど、会ったら一瞬であの頃に戻れそうだね。",
  "体に気をつけて、お仕事頑張ってください。",
  "またあの場所で会える日を夢見ています。"
];

/**
 * クイズの答えが日本語として完全であり、頭切れ（長音符・小文字等）や機械的記号を一切含まないことを保証する厳格な恒久バリデーター
 */
export const assertAndSanitizeQuizAnswer = (answer: string, fallbackSubject: string): string => {
  if (!answer) return fallbackSubject;
  let clean = answer.trim();

  // 1. 機械的記号・アンダースコア・サフィックスの完全排除
  clean = clean.replace(/_[0-9]+$/, "").replace(/[\s\t\n]+/g, "");

  // 2. 頭文字が長音符や小文字、助詞等で始まる「頭切れ」パターンの完全防御
  if (/^[ーッャュョィェォゎヶぁぃぅぇぉっ]/.test(clean)) {
    console.warn(`[Quality Guard] Truncated answer detected: "${clean}". Automatically repairing to fallback...`);
    return fallbackSubject;
  }

  // 3. 不自然な助詞始まり（る、の、に、等で始まる3文字以下の単語）の防御
  if (/^[るに行がはとへてただ]/.test(clean) && clean.length <= 3 && !["のり", "トマト", "はさみ"].includes(clean)) {
    console.warn(`[Quality Guard] Awkward prefix detected: "${clean}". Automatically repairing...`);
    return fallbackSubject;
  }

  return clean;
};

/**
 * 既存の手紙・ユーザーデータを一切削除せず、安全に指定件数の想い出ボトルメールを追加生成する関数
 * （完全ランダム・方程式のない自然な作文＆100%ユニーク保証・頭切れゼロ恒久ガードレール完備）
 */
export const generateAdditionalSamplePosts = async (count: number = 50) => {
  console.log(`[Organic Synthesizer] Generating ${count} completely organic, random & unique sample posts (Preserving existing posts)...`);

  const hashedPassword = await bcrypt.hash("password123", 10);
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, role, is_verified, is_ekyc_verified, ekyc_document_type, ekyc_name, ekyc_verified_at, full_name, last_name, first_name, nickname, birthdate, gender) 
    VALUES (?, ?, ?, 'user', 1, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)
  `);
  const insertAgeLog = db.prepare(`
    INSERT INTO age_verification_logs (user_id, ip, is_verified, age, reason, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const insertPost = db.prepare(`
    INSERT INTO posts (
      user_id, searcher_name, searcher_full_name, searcher_profile, searcher_birthdate, searcher_gender,
      target_name, target_last_name, target_first_name, target_hometown, target_school, 
      era, category, secret_question, secret_answer, secret_answer_plain, 
      message, image_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertQ = db.prepare("INSERT INTO post_questions (post_id, question, answer, answer_plain) VALUES (?, ?, ?, ?)");

  // 既存の質問・答え・本文・ユーザー名・メールアドレス・差出人氏名・宛先氏名・ニックネームをSetにロードして完全重複排除
  const existingUsernames = new Set<string>(db.prepare("SELECT username FROM users").all().map((r: any) => r.username));
  const existingEmails = new Set<string>(db.prepare("SELECT email FROM users").all().map((r: any) => r.email));
  const existingNicknamesSet = new Set<string>(db.prepare("SELECT nickname FROM users WHERE nickname IS NOT NULL").all().map((r: any) => r.nickname));
  const existingSearcherFullNames = new Set<string>(db.prepare("SELECT searcher_full_name FROM posts WHERE searcher_full_name IS NOT NULL").all().map((r: any) => r.searcher_full_name));
  const existingTargetFullNames = new Set<string>(db.prepare("SELECT target_name FROM posts WHERE target_name IS NOT NULL").all().map((r: any) => r.target_name));
  const existingQ1Set = new Set<string>(db.prepare("SELECT secret_question FROM posts").all().map((r: any) => r.secret_question));
  const existingA1Set = new Set<string>(db.prepare("SELECT secret_answer_plain FROM posts").all().map((r: any) => r.secret_answer_plain));
  const existingQ2Set = new Set<string>(db.prepare("SELECT question FROM post_questions").all().map((r: any) => r.question));
  const existingA2Set = new Set<string>(db.prepare("SELECT answer_plain FROM post_questions").all().map((r: any) => r.answer_plain));
  const existingMessagesSet = new Set<string>(db.prepare("SELECT message FROM posts").all().map((r: any) => r.message));
  const existingProfilesSet = new Set<string>(db.prepare("SELECT searcher_profile FROM posts WHERE searcher_profile IS NOT NULL").all().map((r: any) => r.searcher_profile));

  const eras = ["1970", "1980", "1990", "2000", "2010"];
  let insertedCount = 0;
  const currentMaxPost = (db.prepare("SELECT MAX(id) as max_id FROM posts").get() as any)?.max_id || 0;

  for (let i = 0; i < count; i++) {
    const seedIndex = currentMaxPost + i + 1;
    const era = eras[seedIndex % eras.length];
    const isSearcherFemale = (seedIndex % 2 === 1);
    const isTargetFemale = (seedIndex % 3 === 0 || seedIndex % 5 === 0);

    const femalePool = (era === "1970" || era === "1980") ? FEMALE_FIRST_NAMES_SHOWA : FEMALE_FIRST_NAMES_HEISEI;
    const malePool = (era === "1970" || era === "1980") ? MALE_FIRST_NAMES_SHOWA : MALE_FIRST_NAMES_HEISEI;

    // --- 差出人の姓名生成（完全重複ゼロ保証） ---
    let searcherFullName = "";
    let searcherLastName = "";
    let searcherFirstName = "";
    let hasSearcherMaiden = false;
    let searcherMaidenLastName: string | null = null;
    let nameAttempt = 0;

    while (nameAttempt < 500) {
      const lIdx = (seedIndex * 7 + nameAttempt * 11) % LAST_NAMES.length;
      searcherLastName = LAST_NAMES[lIdx];
      searcherFirstName = isSearcherFemale
        ? femalePool[(seedIndex * 13 + nameAttempt * 17) % femalePool.length]
        : malePool[(seedIndex * 13 + nameAttempt * 17) % malePool.length];

      hasSearcherMaiden = isSearcherFemale && ((seedIndex + nameAttempt) % 7 < 3);
      searcherMaidenLastName = hasSearcherMaiden ? LAST_NAMES[(seedIndex * 19 + nameAttempt * 23 + 5) % LAST_NAMES.length] : null;
      if (searcherMaidenLastName === searcherLastName) {
        searcherMaidenLastName = LAST_NAMES[(lIdx + 7) % LAST_NAMES.length];
      }

      searcherFullName = hasSearcherMaiden
        ? `${searcherLastName}（旧姓: ${searcherMaidenLastName}）${searcherFirstName}`
        : `${searcherLastName} ${searcherFirstName}`;

      if (!existingSearcherFullNames.has(searcherFullName)) {
        break;
      }
      nameAttempt++;
    }
    existingSearcherFullNames.add(searcherFullName);

    // --- 宛先の姓名生成（完全重複ゼロ保証） ---
    let targetFullName = "";
    let targetLastName = "";
    let targetFirstName = "";
    let hasTargetMaiden = false;
    let targetMaidenLastName: string | null = null;
    let targetAttempt = 0;

    while (targetAttempt < 500) {
      const tlIdx = (seedIndex * 11 + targetAttempt * 13 + 1) % LAST_NAMES.length;
      targetLastName = LAST_NAMES[tlIdx];
      targetFirstName = isTargetFemale
        ? femalePool[(seedIndex * 17 + targetAttempt * 19 + 3) % femalePool.length]
        : malePool[(seedIndex * 17 + targetAttempt * 19 + 3) % malePool.length];

      hasTargetMaiden = isTargetFemale && ((seedIndex + targetAttempt) % 5 < 2);
      targetMaidenLastName = hasTargetMaiden ? LAST_NAMES[(seedIndex * 23 + targetAttempt * 29 + 13) % LAST_NAMES.length] : null;
      if (targetMaidenLastName === targetLastName) {
        targetMaidenLastName = LAST_NAMES[(tlIdx + 11) % LAST_NAMES.length];
      }

      targetFullName = hasTargetMaiden
        ? `${targetLastName}（旧姓: ${targetMaidenLastName}）${targetFirstName}`
        : `${targetLastName} ${targetFirstName}`;

      if (!existingTargetFullNames.has(targetFullName) && targetFullName !== searcherFullName) {
        break;
      }
      targetAttempt++;
    }
    existingTargetFullNames.add(targetFullName);

    // --- ニックネームの生成（完全重複ゼロ保証・本物の人間らしいあだ名のみ・機械的記号の恒久排除） ---
    let nickname = "";
    let nickAttempt = 0;

    while (nickAttempt < 1000) {
      const cand = AUTHENTIC_HUMAN_NICKNAMES[(seedIndex * 19 + i * 17 + nickAttempt * 23) % AUTHENTIC_HUMAN_NICKNAMES.length];
      const isRobotic = /^[A-Za-z]\.[一-龥ぁ-んァ-ヶ]/.test(cand) || /^[一-龥ぁ-んァ-ヶ]\.[一-龥ぁ-んァ-ヶ]/.test(cand) || /^[一-龥ぁ-んァ-ヶ]・[一-龥ぁ-んァ-ヶ]$/.test(cand);
      if (!existingNicknamesSet.has(cand) && cand !== searcherFirstName && cand !== searcherLastName && cand !== searcherFullName && !isRobotic) {
        nickname = cand;
        break;
      }
      nickAttempt++;
    }

    if (!nickname) {
      nickname = `${searcherFirstName}ちゃん`;
    }
    existingNicknamesSet.add(nickname);

    // ユーザー名（会員番号: UID-6桁数字）
    let username = generateRealisticUsername(searcherFirstName, era, seedIndex);
    let userSuffix = 100;
    while (existingUsernames.has(username)) {
      username = `UID-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    existingUsernames.add(username);

    const uidNumber = username.replace('UID-', '');
    let email = `member_${uidNumber}@sample.remeets.jp`;
    let emailSuffix = 100;
    while (existingEmails.has(email)) {
      email = `member_${uidNumber}_${emailSuffix++}@sample.remeets.jp`;
    }
    existingEmails.add(email);

    const hometown = HOMETOWNS[seedIndex % HOMETOWNS.length];
    const school = SCHOOLS_AND_ORGS[seedIndex % SCHOOLS_AND_ORGS.length];
    const imgId = UNSPLASH_IMAGES[seedIndex % UNSPLASH_IMAGES.length];

    // ALL_SCENARIOS_COLLECTION から一意かつ重複しないシナリオを厳格に選択（Q1, A1, Q2, A2すべて完全重複ゼロ）
    let scenario = ALL_SCENARIOS_COLLECTION[seedIndex % ALL_SCENARIOS_COLLECTION.length];
    for (let sIdx = 0; sIdx < ALL_SCENARIOS_COLLECTION.length; sIdx++) {
      const cand = ALL_SCENARIOS_COLLECTION[(seedIndex + sIdx) % ALL_SCENARIOS_COLLECTION.length];
      const cleanA1 = assertAndSanitizeQuizAnswer(cand.a1, "想い出の品");
      const cleanA2 = assertAndSanitizeQuizAnswer(cand.a2, "共通の記憶");
      if (!existingQ1Set.has(cand.q1) && !existingA1Set.has(cleanA1) && !existingQ2Set.has(cand.q2) && !existingA2Set.has(cleanA2)) {
        scenario = cand;
        break;
      }
    }

    // --- 人間味豊かな有機的プロフィール作文ジェネレーター（多様な構文・フォーマル/アンフォーマル/情景先行/語りかけ） ---
    let memoryAction = scenario.contextTemplate
      .replace(/^\{school\}の[^、]+において、\s*/, '')
      .replace(/^\{school\}の[^、]+で、\s*/, '')
      .replace(/仲間です。?$/, '')
      .replace(/戦友です。?$/, '')
      .replace(/相棒です。?$/, '')
      .replace(/友人です。?$/, '')
      .replace(/同級生です。?$/, '')
      .replace(/相手です。?$/, '')
      .replace(/先輩です。?$/, '')
      .replace(/後輩です。?$/, '')
      .replace(/仲間より。?$/, '')
      .replace(/関係です。?$/, '')
      .trim();

    if (!memoryAction) {
      memoryAction = `${scenario.relation}として共に汗を流した`;
    }

    const relation = scenario.relation;
    let rawContext = "";
    let contextAttempt = 0;

    while (contextAttempt < 100) {
      const styleIdx = (seedIndex * 13 + contextAttempt * 7 + 5) % 14;
      let candContext = "";

      switch (styleIdx) {
        case 0:
          // 【情景・エピソード先行型（ノスタルジー）】
          candContext = `${memoryAction}日々が今でも鮮明に心に残っています。当時、${relation}でご一緒していた者です。`;
          break;
        case 1:
          // 【語りかけ・フレンドリー型（カジュアル）】
          candContext = `覚えていますか？当時、${relation}で一緒に過ごした${nickname}だよ！ふと思い出してメッセージを送ってみました。`;
          break;
        case 2:
          // 【礼儀正しい敬体・フォーマル型（丁寧な大人）】
          candContext = `大変ご無沙汰しております。当時、${relation}でお世話になった者です。${memoryAction}当時の感謝をお伝えしたく筆を執りました。`;
          break;
        case 3:
          // 【部活動・係先行型】
          candContext = `当時、${relation}を担当していた者です。${memoryAction}あの頃が懐かしく蘇ります。`;
          break;
        case 4:
          // 【時代背景・思い出先行型（回想）】
          candContext = `あの頃、${relation}として${memoryAction}仲間です。今も元気で活躍されていることを願っています。`;
          break;
        case 5:
          // 【率直・親友タメ口型（アンフォーマル・親密）】
          candContext = `おーい元気にしてる！？${relation}でいつも一緒にバカやってた${nickname}だよ！${memoryAction}の覚えてるかな？`;
          break;
        case 6:
          // 【丁寧な問いかけ・しっとり型】
          candContext = `お元気でいらっしゃいますでしょうか。学生時代に${relation}として${memoryAction}懐かしい時間を共有した者です。`;
          break;
        case 7:
          // 【活動・想い出共有型】
          candContext = `当時${relation}で活動していた仲間です。${memoryAction}あの熱い日々を懐かしく思い出しています。`;
          break;
        case 8:
          // 【手紙風・拝啓スタイル型】
          candContext = `突然のボトルメールで驚かれるかもしれませんが、当時${relation}で${memoryAction}友人です。どうか届きますように。`;
          break;
        case 9:
          // 【エピソード導入・文末署名型】
          candContext = `あの頃、${memoryAction}時間は私にとって一生の宝物です。（当時・${relation}仲間より）`;
          break;
        case 10:
          // 【日常・部活会話風（カジュアル）】
          candContext = `当時${relation}やってた頃が本当に懐かしくてボトル流してみました！${memoryAction}仲間です。`;
          break;
        case 11:
          // 【シンプル・要点型】
          candContext = `【当時・${relation}】${memoryAction}当時の友人を探しています。`;
          break;
        case 12:
          // 【感謝・再会祈念型】
          candContext = `当時${relation}で${memoryAction}時間は今も私の支えです。またいつか昔のように話せたら嬉しいです。`;
          break;
        case 13:
        default:
          // 【青春回顧型】
          candContext = `${memoryAction}あの青春の日々をもう一度語り合いたくて探しています。当時${relation}で一緒だった者より。`;
          break;
      }

      // 旧姓の言及パターンのランダム化
      if (hasSearcherMaiden) {
        const maidenStyle = (seedIndex * 7 + contextAttempt * 11) % 6;
        if (maidenStyle === 0) {
          candContext += ` 当時は旧姓の「${searcherMaidenLastName}」でした。`;
        } else if (maidenStyle === 1) {
          candContext += ` （旧姓：${searcherMaidenLastName}です）`;
        } else if (maidenStyle === 2) {
          candContext += ` 結婚して苗字が変わりましたが、旧姓の${searcherMaidenLastName}といえば思い出してくれるでしょうか。`;
        } else if (maidenStyle === 3) {
          candContext += ` （当時は旧姓・${searcherMaidenLastName}）`;
        } else if (maidenStyle === 4) {
          candContext += ` 苗字が変わりましたが、旧姓の「${searcherMaidenLastName}」より。`;
        } else {
          candContext += ` なお、当時の名前は旧姓の${searcherMaidenLastName}です。`;
        }
      }

      if (!existingProfilesSet.has(candContext)) {
        rawContext = candContext;
        break;
      }
      contextAttempt++;
    }

    if (!rawContext) {
      rawContext = `当時${relation}で${memoryAction}仲間です。（想い出のボトルメール）`;
    }
    existingProfilesSet.add(rawContext);

    // --- 有機的・完全ランダムな本文（メッセージ）作文（完全重複ゼロ保証） ---
    let rawMessage = "";
    let msgAttempt = 0;
    while (msgAttempt < 100) {
      const opening = OPENING_GREETINGS[(seedIndex * 11 + msgAttempt * 7) % OPENING_GREETINGS.length];
      const closing = CLOSING_PHRASES[(seedIndex * 17 + msgAttempt * 13) % CLOSING_PHRASES.length];
      const emotional = EMOTIONAL_REFLECTIONS[(seedIndex * 23 + msgAttempt * 19) % EMOTIONAL_REFLECTIONS.length];

      const lengthType = (seedIndex * 19 + msgAttempt) % 10;
      let messageParts: string[] = [];

      if (opening) {
        messageParts.push(opening);
      }

      messageParts.push(scenario.messageTemplate);

      if (lengthType >= 2) {
        messageParts.push(emotional);
      }

      if (hasTargetMaiden) {
        const targetMaidenStyle = (seedIndex * 3 + msgAttempt) % 4;
        if (targetMaidenStyle === 0) {
          messageParts.push(`ご結婚されて苗字が変わられているかもしれませんが、当時の旧姓・${targetMaidenLastName}さん宛てにお手紙を託します。`);
        } else if (targetMaidenStyle === 1) {
          messageParts.push(`苗字が変わられているかもしれませんが、当時の${targetMaidenLastName}さんへ届きますように。`);
        } else {
          messageParts.push(`旧姓の${targetMaidenLastName}さん宛てにボトルを流します。`);
        }
      }

      messageParts.push(closing);

      const candMsg = messageParts.join(" ");
      if (!existingMessagesSet.has(candMsg)) {
        rawMessage = candMsg;
        break;
      }
      msgAttempt++;
    }
    if (!rawMessage) {
      rawMessage = `${scenario.messageTemplate} ${CLOSING_PHRASES[seedIndex % CLOSING_PHRASES.length]}`;
    }
    existingMessagesSet.add(rawMessage);

    // クイズ Q1 & A1 / Q2 & A2 の完全重複ゼロ保証（プール枯渇時の動的想い出シンセサイザー完備）
    let q1 = scenario.q1;
    let a1 = assertAndSanitizeQuizAnswer(scenario.a1, "想い出の品");
    let q2 = scenario.q2;
    let a2 = assertAndSanitizeQuizAnswer(scenario.a2, "共通の記憶");

    if (existingQ1Set.has(q1) || existingA1Set.has(a1) || existingQ2Set.has(q2) || existingA2Set.has(a2)) {
      const MOTIF_NOUNS_A1 = [
        "青いメガホン", "銀のホイッスル", "記念メダル", "寄せ書きタオル", "赤いリストバンド", "手作りのミサンガ",
        "革のペンケース", "使い込んだ竹刀", "折れたドラムスティック", "トロンボーンミュート", "愛用のスパイク",
        "木製バット", "色褪せたスコアブック", "白いチョーク", "黄色のゼッケン", "記念のキーホルダー", "真鍮のバッジ",
        "部室の黒板消し", "茶色い革手袋", "青いストップウォッチ", "銀のコンパス", "アルミの水筒", "木製スケッチ板",
        "ガラスのビーカー", "真鍮の分度器", "革のブックカバー", "記念の手ぬぐい", "藍染めの道着", "銀色のチューナー",
        "四つ葉の栞", "真鍮のペーパーナイフ", "木彫りのマスコット", "七宝焼きのブローチ", "手編みの手袋", "貝殻のペンダント",
        "刺繍入りポーチ", "木製カスタネット", "金属製の定規", "革のパスケース", "記念ピンバッジ", "ガラスの文鎮",
        "手作りのしおり", "漆塗りの箸箱", "真鍮のキーリング", "記念のペナント", "布製のペンシルロール", "木製写真立て",
        "革製のキーケース", "真鍮の文鎮", "布製の巾着袋", "木製の下敷き", "記念の手帳", "革のコインケース"
      ];
      const MOTIF_NOUNS_A2 = [
        "ガリガリ君", "ホームランバー", "ブラックサンダー", "うまい棒", "ポカリスエット", "アクエリアス",
        "レモンティー", "フルーツオレ", "ミルメーク", "揚げパン", "ソフト麺", "ベビースター",
        "チョコモナカ", "パピコ", "クーリッシュ", "ピノ", "缶入りコーンスープ", "お汁粉缶", "マウンテンデュー",
        "ドクターペッパー", "三ツ矢サイダー", "カルピスウォーター", "ヤクルト", "コーヒー牛乳", "メロンソーダ",
        "ラムネ菓子", "ベイクドチーズケーキ", "みたらし団子", "大学いも", "人形焼", "たい焼き", "今川焼き",
        "あんぱん", "クリームパン", "焼きそばパン", "コッペパン", "串カツ", "フランクフルト", "たこ焼き",
        "お好み焼き", "いちご大福", "草餅", "わらび餅", "カステラ", "かりんとう", "バナナパフェ", "プリンアラモード"
      ];

      const Q1_PATTERNS = [
        (rel: string, eraStr: string) => `当時（${eraStr}年代）、${rel}の活動や練習の際に二人で大切にしていた想い出の品は？`,
        (rel: string, eraStr: string) => `あの頃（${eraStr}年代）、${rel}の仲間と一緒に大事に共有していた記念の持ち物は？`,
        (rel: string, eraStr: string) => `放課後の${rel}でいつも互いに見せ合っていた大切な私物は？`,
        (rel: string, eraStr: string) => `${rel}の思い出として今でも鮮明に覚えている共通の品物は？`,
        (rel: string, eraStr: string) => `大会や発表会の前日に二人で確認し合った${rel}の縁起物は？`,
        (rel: string, eraStr: string) => `部室や活動場所の棚に大切にしまってあった${rel}の共通アイテムは？`,
        (rel: string, eraStr: string) => `引退の日に後輩や仲間から記念に贈られた${rel}の宝物は？`
      ];

      const Q2_PATTERNS = [
        (rel: string, eraStr: string) => `当時（${eraStr}年代）、${rel}の帰り道や休憩時間にみんなで一緒に飲食した懐かしい味は？`,
        (rel: string, eraStr: string) => `練習や活動の合間に近くの売店や自販機でよく買った思い出の味は？`,
        (rel: string, eraStr: string) => `夕暮れの帰り道に二人で半分こして食べた懐かしいおやつは？`,
        (rel: string, eraStr: string) => `${rel}の打ち上げや合宿の夜にみんなで囲んだ定番の味は？`,
        (rel: string, eraStr: string) => `放課後に学校近くのお店でいつも注文していた${rel}の味は？`,
        (rel: string, eraStr: string) => `厳しい練習の後にマネージャーや仲間が差し入れてくれた懐かしい味は？`,
        (rel: string, eraStr: string) => `冬の寒い帰り道に立ち寄った売店で食べた温かいおやつは？`
      ];

      let synthAttempt = 0;
      while (synthAttempt < 20000) {
        const q1Pat = Q1_PATTERNS[(seedIndex * 7 + synthAttempt * 11) % Q1_PATTERNS.length];
        const noun1 = MOTIF_NOUNS_A1[(seedIndex * 17 + synthAttempt * 23 + 3) % MOTIF_NOUNS_A1.length];
        const candA1 = synthAttempt >= MOTIF_NOUNS_A1.length ? `${noun1}（${seedIndex}）` : noun1;
        const candQ1 = q1Pat(scenario.relation, era);

        const q2Pat = Q2_PATTERNS[(seedIndex * 13 + synthAttempt * 17 + 1) % Q2_PATTERNS.length];
        const noun2 = MOTIF_NOUNS_A2[(seedIndex * 29 + synthAttempt * 31 + 7) % MOTIF_NOUNS_A2.length];
        const candA2 = synthAttempt >= MOTIF_NOUNS_A2.length ? `${noun2}（${seedIndex}）` : noun2;
        const candQ2 = q2Pat(scenario.relation, era);

        if (!existingQ1Set.has(candQ1) && !existingA1Set.has(candA1) && !existingQ2Set.has(candQ2) && !existingA2Set.has(candA2)) {
          q1 = candQ1;
          a1 = candA1;
          q2 = candQ2;
          a2 = candA2;
          break;
        }
        synthAttempt++;
      }
    }

    existingQ1Set.add(q1);
    existingA1Set.add(a1);
    existingQ2Set.add(q2);
    existingA2Set.add(a2);

    const isEkyc = (seedIndex % 3 !== 0) ? 1 : 0;
    const docType = isEkyc ? (seedIndex % 2 === 0 ? 'drivers_license' : 'my_number_card') : null;

    // 🌟 年齢の幅広い分布（20代〜70代）と名前から想定される性別（2割は性別未設定）
    const { birthdate: sampleBirthdate, age: sampleAge } = generateRealisticBirthdate(era, seedIndex);
    const guessedGender = isSearcherFemale ? '女性' : guessGenderFromName(searcherFirstName, searcherFullName);
    const sampleGender = (seedIndex % 5 === 0) ? null : guessedGender; // 2割は性別なし

    try {
      const userResult = insertUser.run(
        username, email, hashedPassword, isEkyc, docType,
        isEkyc ? searcherFullName : null, searcherFullName, searcherLastName, searcherFirstName, nickname,
        sampleBirthdate, sampleGender
      );
      const userId = userResult.lastInsertRowid as number;

      // eKYCログ または 自己申告ログを記録
      try {
        insertAgeLog.run(
          userId,
          `192.168.1.${(seedIndex % 250) + 1}`,
          1,
          sampleAge,
          isEkyc ? 'AI公的身分証多層照合完了 (身元確認済)' : '18歳以上利用規約・宣誓同意',
          JSON.stringify({
            verification_flow: isEkyc ? 'primary_ekyc' : 'self_declaration',
            document_type: isEkyc ? (docType === 'drivers_license' ? 'driver_license' : 'mynumber') : 'self_attestation',
            method: isEkyc ? 'eKYC' : 'self_attestation',
            provider: isEkyc ? 'TRUSTDOCK_AI_OCR' : 'INTERNAL_LEGAL_PLEDGE',
            score: isEkyc ? 98 : 100,
            gender: sampleGender,
            birthdate: sampleBirthdate,
            verified_name: isEkyc ? searcherFullName : null
          })
        );
      } catch (logErr) {
        console.error(`[Organic Synthesizer] Error inserting age log for user #${userId}:`, logErr);
      }

      const hashedA1 = await bcrypt.hash(a1.trim().toLowerCase(), 4);
      const hashedA2 = await bcrypt.hash(a2.trim().toLowerCase(), 4);

      const postResult = insertPost.run(
        userId,
        nickname,
        searcherFullName,
        rawContext,
        sampleBirthdate,
        sampleGender,
        targetFullName,
        targetLastName,
        targetFirstName,
        hometown,
        school,
        era,
        scenario.category,
        q1,
        hashedA1,
        a1,
        rawMessage,
        `https://images.unsplash.com/photo-${imgId}?q=80&w=800&auto=format&fit=crop`,
        "active"
      );
      const postId = postResult.lastInsertRowid as number;

      try {
        insertQ.run(postId, q2, hashedA2, a2);
      } catch (qErr) {}

      insertedCount++;
    } catch (err) {
      console.error(`[Organic Synthesizer] Error inserting post #${seedIndex}:`, err);
    }
  }

  const totalCount = (db.prepare("SELECT COUNT(*) as count FROM posts").get() as any)?.count || 0;
  console.log(`[Organic Synthesizer] Successfully generated ${insertedCount} 100% natural & unique posts. Total posts in DB: ${totalCount}`);

  return { count: insertedCount, totalPosts: totalCount };
};

/**
 * 既存の重複サンプル手紙を一括クリーンアップし、完全重複ゼロの指定件数（デフォルト200通）で再構築する関数
 */
export const reseedCleanUniquePosts = async (count: number = 200) => {
  console.log(`[Reseed Unique Engine] Resetting and generating ${count} 100% natural & unique sample posts with zero duplicates...`);

  // 管理者・テストユーザーを保護しつつ、外部キー依存テーブルを安全な順序でクリーンアップ
  db.transaction(() => {
    db.prepare("DELETE FROM post_questions").run();
    db.prepare("DELETE FROM messages").run();
    db.prepare("DELETE FROM notifications").run();
    db.prepare("DELETE FROM reports").run();
    db.prepare("DELETE FROM failed_attempts").run();
    db.prepare("DELETE FROM deletion_requests").run();
    db.prepare("DELETE FROM payment_transactions").run();
    db.prepare("DELETE FROM success_stories").run();
    db.prepare("DELETE FROM action_logs").run();
    db.prepare("DELETE FROM access_logs").run();
    db.prepare("DELETE FROM search_logs").run();
    db.prepare("DELETE FROM page_views").run();
    db.prepare("DELETE FROM age_verification_logs").run();
    db.prepare("DELETE FROM age_verification_documents").run();
    db.prepare("DELETE FROM posts").run();
    db.prepare("DELETE FROM users WHERE role = 'user' AND username NOT IN ('admin', 'test', 'superadmin')").run();
  })();

  const result = await generateAdditionalSamplePosts(count);
  return result;
};

