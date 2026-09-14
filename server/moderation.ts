import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { logAction } from "./middleware/auth";

interface PostData {
  searcherName: string;
  searcherFullName?: string;
  searcherProfile?: string;
  targetName: string;
  targetLastName?: string;
  targetFirstName?: string;
  targetNameEn?: string;
  targetHometown?: string;
  targetSchool?: string;
  era?: string;
  category?: string;
  questions: { question: string; answer: string }[];
  message?: string;
  imageUrl?: string;
}

export const validateAndFilterPost = (data: PostData, bypassForbidden = false) => {
  const {
    searcherName,
    searcherFullName,
    searcherProfile,
    targetName,
    targetLastName,
    targetFirstName,
    targetNameEn,
    targetHometown,
    targetSchool,
    era,
    category,
    message,
    questions
  } = data;

  const fieldsToFilter = [
    searcherName,
    searcherFullName,
    searcherProfile,
    targetName,
    targetLastName,
    targetFirstName,
    targetNameEn,
    targetHometown,
    targetSchool,
    message,
    ...questions.map(q => q.question),
    ...questions.map(q => q.answer)
  ].filter(f => f !== undefined && f !== null);

  // Check for NG words
  for (const field of fieldsToFilter) {
    if (filterNGWords(field) !== field) {
      if (!bypassForbidden) {
        return { error: "NGワードが含まれているため投稿できません。住所、電話番号、誹謗中傷等は禁止されています。" };
      }
    }
  }

  // Return filtered/normalized data
  return {
    searcherName: filterNGWords(searcherName),
    searcherFullName: filterNGWords(searcherFullName || ""),
    searcherProfile: filterNGWords(searcherProfile || ""),
    targetName: filterNGWords(targetName),
    targetLastName: filterNGWords(targetLastName || ""),
    targetFirstName: filterNGWords(targetFirstName || ""),
    targetNameEn: filterNGWords(targetNameEn || ""),
    targetHometown: filterNGWords(targetHometown || ""),
    targetSchool: filterNGWords(targetSchool || ""),
    message: filterNGWords(message || ""),
    era: era || "",
    category: category || "",
    questions: questions.map(q => ({
      question: filterNGWords(q.question),
      answer: q.answer.trim().toLowerCase()
    })),
    contactType: data.contactType || null,
    contactId: data.contactId || null,
    contactNote: data.contactNote || null
  };
};

export const evaluateContentSafety = async (searcherName: string, targetName: string, message: string): Promise<{ is_flagged: boolean; reason: string }> => {
  // Check with Gemini AI first if API key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        あなたは「昔の大切な人との再会サービス（ReMEETs）」のリアルタイム安全検閲・モデレーションエンジンです。
        以下の「再会のボトルメール」の投稿内容を分析し、不適切な内容が含まれていないか厳格に判定してください。
        
        【判定基準】
        1. 誹謗中傷・ヘイトスピーチ・脅迫: 相手を攻撃・威圧する内容、差別的な表現、悪意のある糾弾。
        2. 個人情報の過度な露出（プライバシー侵害）: 詳細な住所、電話番号、メールアドレス、SNS ID、具体的な勤務先名などの直接的な公開記載。
        3. ストーキング・嫌がらせの兆候: 執拗な追跡、相手の現在の居場所や生活圏を特定しようとする意図、一方的な恋愛感情の過度な押し付け、過去の重大トラブルを想起させる内容。
        4. 公序良俗・法令違反: 援助交際、性的な出会い目的、犯罪示唆、詐欺的内容。
        
        【投稿内容】
        投稿者名: ${searcherName || ''}
        対象者名: ${targetName || ''}
        メッセージ: ${message || ''}
        
        結果は以下のJSON形式のみで返してください：
        {
          "is_flagged": boolean,
          "reason": "不適切または要確認と判定された理由（日本語で簡潔に、安全な場合は空文字）"
        }
      `;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
      } catch (e) {
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
      }

      const aiResult = JSON.parse(response.text || '{}');
      if (typeof aiResult.is_flagged === 'boolean') {
        return {
          is_flagged: aiResult.is_flagged,
          reason: aiResult.reason || (aiResult.is_flagged ? "AIによる不適切表現・安全リスクの検出" : "")
        };
      }
    } catch (gErr) {
      console.warn("Gemini API call failed, evaluating via heuristic safety engine:", gErr);
    }
  }

  // Heuristic / Rule-based evaluation fallback
  const text = `${searcherName || ''} ${targetName || ''} ${message || ''}`;
  
  // 1. Inappropriate / Stalking / Threat keywords
  const threatRegex = /死ね|殺す|消えろ|許さない|特定した|落とし前|復讐|待ち伏せ|住所教えろ|逃げられる|絶対に見つけ出す/i;
  if (threatRegex.test(text)) {
    return {
      is_flagged: true,
      reason: "【安全防衛検知】脅迫、ストーキング勧誘、または復讐・攻撃的危害を意図した表現が検出されました。"
    };
  }

  // 2. Illicit meetings / Commercial / Adult
  const illicitRegex = /パパ活|援助交際|割り切り|お小遣い稼ぎ|大人の関係|高収入バイト|性風俗|出会い系/i;
  if (illicitRegex.test(text)) {
    return {
      is_flagged: true,
      reason: "【安全防衛検知】不当出会い（パパ活・援助交際）または商業的スパムの疑いが検出されました。"
    };
  }

  // 3. Direct personal contact leak
  const piiPhone = /0\d{1,4}[- ]?\d{1,4}[- ]?\d{3,4}/.test(text);
  const piiEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const piiLine = /line\s*(?:id)?\s*[:：\s]\s*[\w.-]+/i.test(text);
  const piiAddress = /(?:東京都|北海道|(?:京都|大阪)府|.{2,3}県).{1,10}(?:市|区|町|村).{1,10}\d+/.test(text);

  if (piiPhone || piiEmail || piiLine || piiAddress) {
    return {
      is_flagged: true,
      reason: "【プライバシー保護検知】直接の電話番号、メールアドレス、LINE ID、または詳細な住所表記が検出されました。"
    };
  }

  // 4. DB NG Words
  try {
    const ngWords = db.prepare("SELECT word FROM ng_words").all() as any[];
    for (const item of ngWords) {
      if (item.word && text.includes(item.word)) {
        return {
          is_flagged: true,
          reason: `【NGワード検知】禁止キーワード「${item.word}」が含まれています。`
        };
      }
    }
  } catch (_) {}

  // Safe
  return {
    is_flagged: false,
    reason: ""
  };
};

export const aiAutoFlagPost = async (postId: number, data: any) => {
  try {
    const aiResult = await evaluateContentSafety(data.searcherName, data.targetName, data.message);
    if (aiResult.is_flagged) {
      db.prepare("UPDATE posts SET ai_flagged = 1, ai_reason = ?, ai_diagnosed = 1 WHERE id = ?").run(aiResult.reason || "AI判定による不適切疑い", postId);
      logAction(null, "AI_AUTO_FLAGGED", `Post ID: ${postId}, Reason: ${aiResult.reason}`, "system");

      // Auto-create report in admin reports queue if not already created
      const existingReport = db.prepare("SELECT id FROM reports WHERE target_type = 'post' AND target_id = ? AND reporter_id = 0").get(postId);
      if (!existingReport) {
        db.prepare(`
          INSERT INTO reports (reporter_id, target_type, target_id, report_type, reason, contact_info, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          0, // 0 = System Auto Report
          'post',
          postId,
          'ai_flagged',
          `【AI自動検知・安全隔離】\nボトルメールID: #${postId}（宛先: ${data.targetName || '不明'}様）がAI安全分析により不適切・ストーカー・プライバシー侵害の疑いで自動非公開（隔離）されました。\n\nAI判定理由:\n${aiResult.reason || '不適切な表現またはプライバシー過度露出'}\n\n投稿本文:\n"${data.message || ''}"`,
          null,
          'priority'
        );
        logAction(null, "AUTO_REPORT_SUBMITTED", `Post ID: ${postId} auto-reported due to AI flagged reason: ${aiResult.reason}`, "system");
      }
    } else {
      db.prepare("UPDATE posts SET ai_flagged = 0, ai_diagnosed = 1 WHERE id = ?").run(postId);
    }
  } catch (err) {
    console.error("AI Auto-flagging error:", err);
    try {
      db.prepare("UPDATE posts SET ai_diagnosed = 1 WHERE id = ?").run(postId);
    } catch (_) {}
  }
};

export const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

export const normalizeJapanese = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFKC")
    .replace(/[\u30a1-\u30f6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    })
    .replace(/[\uff01-\uff5e]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    })
    .replace(/\s+/g, "")
    .toLowerCase();
};

// 🌟 想い出クイズ専用 スマート正規化＆表記ゆれ・語尾・接頭辞吸収エンジン
const cleanQuizString = (str: string): string => {
  if (!str) return "";
  let s = str.normalize("NFKC");
  // カタカナをひらがなに統一
  s = s.replace(/[\u30a1-\u30f6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
  // 全角英数を半角にし、小文字化
  s = s.replace(/[\uff01-\uff5e]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
  }).toLowerCase();
  
  // 記号類（！、？、。、句読点、括弧、長音、チルダなど）を除去
  s = s.replace(/[!！?？.。、,・~〜ー\-_/／:：;；（）\(\)「」『』"'\s]/g, "");

  // 文末の語尾・助動詞（です、でした、だよ、だね、だな、だ、よ、ね、だった、である、とおもいます、と思います等）を除去
  const suffixRegex = /(とおもいます|とおもう|とおもわれます|とおもった|とおもいました|とおもって|と思います|と思う|と思われます|と思った|と思いました|と思って|でした|ですよ|ですね|だよ|だね|だな|だった|である|です|だ|よ|ね)$/;
  s = s.replace(suffixRegex, "");

  return s;
};

// 派生バリエーション（接頭辞「お」「ご」除去、送り仮名統一など）を生成
const generateQuizVariations = (rawStr: string): string[] => {
  if (!rawStr) return [];
  const base = cleanQuizString(rawStr);
  if (!base) return [];

  const set = new Set<string>();
  set.add(base);

  // 1. 接頭辞「お」「ご」「御」を除去した語根
  if (base.startsWith("お") && base.length > 1) {
    set.add(base.slice(1));
  }
  if (base.startsWith("ご") && base.length > 1) {
    set.add(base.slice(1));
  }
  if (base.startsWith("御") && base.length > 1) {
    set.add(base.slice(1));
  }

  // 2. 代表的な送り仮名・表記ゆらぎ吸収テーブル
  const okuriganaMap: Record<string, string[]> = {
    "引っ越し": ["引越し", "引越", "ひっこし", "ひきこし"],
    "引越し": ["引っ越し", "引越", "ひっこし", "ひきこし"],
    "受け付け": ["受付", "うけつけ"],
    "受付": ["受け付け", "うけつけ"],
    "問い合わせ": ["問合せ", "といあわせ"],
    "問合せ": ["問い合わせ", "といあわせ"],
    "申し込み": ["申込", "もうしこみ"],
    "申込": ["申し込み", "もうしこみ"],
    "取り消し": ["取消", "とりけし"],
    "取消": ["取り消し", "とりけし"],
    "売り上げ": ["売上", "うりあげ"],
    "売上": ["売り上げ", "うりあげ"],
    "お餅": ["餅", "もち", "おもち"],
    "餅": ["お餅", "おもち", "もち"],
    "おにぎり": ["にぎり", "お握り", "握り"],
    "お寿司": ["寿司", "鮨", "すし", "おすし"],
    "寿司": ["お寿司", "鮨", "すし", "おすし"],
    "ご褒美": ["褒美", "ほうび", "ごほうび"],
    "お祝い": ["祝い", "祝", "おいわい", "いわい"],
    "桜屋": ["さくらや", "サクラヤ", "さくら屋", "桜や"],
    "さくら屋": ["さくらや", "桜屋", "サクラヤ", "桜や"],
    "桜や": ["さくらや", "桜屋", "サクラヤ", "さくら屋"],
    "さくらや": ["桜屋", "サクラヤ", "さくら屋", "桜や"],
    "駄菓子屋": ["だがしや", "だがし屋", "お菓子屋", "おかしや"],
    "だがし屋": ["駄菓子屋", "だがしや", "お菓子屋", "おかしや"],
    "だがしや": ["駄菓子屋", "だがし屋", "お菓子屋", "おかしや"]
  };

  for (const [key, variants] of Object.entries(okuriganaMap)) {
    const normKey = cleanQuizString(key);
    if (base === normKey || rawStr.includes(key)) {
      variants.forEach(v => {
        set.add(cleanQuizString(v));
      });
    }
  }

  return Array.from(set).filter(Boolean);
};

// クイズ回答の一致判定エンジン（表記ゆれ・語尾・接頭辞・惜しい判定を完全網羅）
export const evaluateQuizAnswerMatch = async (
  userAnswer: string,
  plainAnswer: string,
  hashedAnswer: string
): Promise<{ isMatch: boolean; isClose: boolean; hint?: string }> => {
  if (!userAnswer || !userAnswer.trim()) {
    return { isMatch: false, isClose: false };
  }

  const cleanUser = cleanQuizString(userAnswer);
  if (!cleanUser) {
    return { isMatch: false, isClose: false };
  }

  // 1. bcrypt での完全一致チェック
  let exactBcrypt = false;
  try {
    if (hashedAnswer) {
      exactBcrypt = await bcrypt.compare(userAnswer.trim().toLowerCase(), hashedAnswer);
    }
  } catch (_) {}

  if (exactBcrypt) {
    return { isMatch: true, isClose: false };
  }

  // 2. スマート正規化（語尾・記号除去・カタカナひらがな統一・接頭辞吸収）での一致チェック
  if (plainAnswer) {
    const userVars = generateQuizVariations(userAnswer);
    const plainVars = generateQuizVariations(plainAnswer);

    for (const u of userVars) {
      for (const p of plainVars) {
        if (u === p) {
          return { isMatch: true, isClose: false };
        }
      }
    }

    // 3. 編集距離（Levenshtein Distance）による惜しい判定・ヒント生成
    let minDistance = 999;
    for (const u of userVars) {
      for (const p of plainVars) {
        const d = getLevenshteinDistance(u, p);
        if (d < minDistance) minDistance = d;
      }
    }

    const normPlain = cleanQuizString(plainAnswer);
    const isClose = minDistance <= 1 || (normPlain.length >= 4 && minDistance <= 2);

    let hint: string | undefined = undefined;
    if (isClose) {
      const hasKanji = /[\u4e00-\u9faf]/.test(plainAnswer);
      if (hasKanji) {
        hint = "💡 惜しいです！漢字・ひらがな・送り仮名を変えて、短い単語のみでお試しください。";
      } else {
        hint = "💡 惜しいです！ひらがな・カタカナや単語のみで再度お確かめください。";
      }
    }

    return { isMatch: false, isClose, hint };
  }

  return { isMatch: false, isClose: false };
};

export const detectInappropriateWords = (text: string): string[] => {
  if (!text) return [];
  const textNormalized = normalizeJapanese(text);

  const defaultForbiddenWords = [
    // 1. 脅迫・ストーカー・暴力・誹謗中傷・執着
    "死ね", "殺す", "殺してやる", "殺し", "死ぬまで", "消えろ", "ごみ", "かす", "殺人", "脅迫", "爆破", "自殺", "レイプ",
    "許さない", "特定した", "落とし前", "復讐", "待ち伏せ", "待ちぶせ", "前で待って", "住所教えろ", "逃げられる",
    "絶対に見つけ出す", "後悔させてやる", "バラしてやる", "ばらしてやる", "暴露", "ばらす",
    "乗り込んでやる", "乗り込む", "押しかける", "押し掛ける",
    "晒す", "晒し", "さらす", "さらし", "炎上", "拡散", "道連れ", "みちづれ",
    "つきまとい", "つきまとう", "つけまわす", "つけ回す", "尾行", "監視", "見てるからな", "見張って", "居場所", "追い詰める", "追い詰め", "許さん", "コロス", "シネ",
    // 2. 不当出会い・パパ活・商業スパム・闇バイト
    "援助交際", "えんじょこうさい", "パパ活", "ママ活", "割り切り", "お小遣い稼ぎ", "大人の関係", 
    "買春", "売春", "性風俗", "痴漢", "高収入バイト", "裏バイト", "闇バイト", "借金返済", "融資します"
  ];

  const detected: string[] = [];

  for (const word of defaultForbiddenWords) {
    const normWord = normalizeJapanese(word);
    if (textNormalized.includes(normWord) || text.includes(word)) {
      if (!detected.includes(word)) {
        detected.push(word);
      }
    }
  }

  // 🛡️ 個人情報（電話番号・メアド・LINE/SNS・URL）の直接記載検知（正規化後の文字列で判定）
  // 携帯・固定・IP・フリーダイヤル（090, 080, 070, 050, 0120, 0800 等）
  const digitsOnly = textNormalized.replace(/[-\sー－.・]/g, '');
  if (/0[1-9]0\d{7,8}|0\d{9,10}|0120\d{6}|0800\d{7}|050\d{8}/.test(digitsOnly) || /\d{2,4}-\d{2,4}-\d{4}/.test(text)) {
    detected.push("直接の電話番号の記載");
  }
  // メールアドレス
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(textNormalized) || /@.*?\.(com|jp|net|ne|org)/i.test(textNormalized)) {
    detected.push("メールアドレスの記載");
  }
  // LINE ID, 各種SNSハンドル
  if (/lineid|ラインid|らいんid|line:|ライン:|らいん:|line\b|ライン\b|らいん\b|インスタ|いんすた|instagram|twitter|ツイッター|ついったー|tiktok|ティックトック|カカオ|かかお|kakao|facebook|フェイスブック|ふぇいすぶっく|fb|discord|ディスコード|でぃすこーど|telegram|テレグラム|てれぐらむ|id:|id：|@[\w_]{3,}/i.test(textNormalized)) {
    detected.push("LINE/SNS_IDの記載");
  }
  // URLリンク
  if (/https?:\/\/|www\./i.test(textNormalized)) {
    detected.push("外部リンクURLの記載");
  }

  try {
    cachedNgWords.forEach(w => {
      if (!w) return;
      const normalizedW = normalizeJapanese(w);
      if (textNormalized.includes(normalizedW) || text.includes(w)) {
        if (!detected.includes(w)) {
          detected.push(w);
        }
      }
    });
  } catch (err) {
    console.error("Failed to check cachedNgWords", err);
  }

  return detected;
};

let cachedNgWords: string[] = [];
let lastNgWordsFetch = 0;
const NG_WORDS_CACHE_TTL = 60000; // 1 minute

export const filterNGWords = (text: string): string => {
  if (!text) return "";
  let filteredText = text;

  // Default patterns for personal info
  const patterns: RegExp[] = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, // Email
    /\d{2,4}[-ー―]\d{2,4}[-ー―]\d{4}/g, // Phone with hyphens
    /0[5789]0[-ー―\s]?\d{4}[-ー―\s]?\d{4}/g, // Mobile phone (half/full)
    /[０-９]{2,4}[-ー―\s]?[０-９]{2,4}[-ー―\s]?[０-９]{4}/g, // Full-width phone
    /\b\d{10,11}\b/g, // Phone number no hyphens
    /LINE\s*ID|ライン\s*ID|ID\s*：|ID\s*:/gi, // LINE ID
    /[都道府県市区町村].*[0-9０-９]{1,4}[-ー―丁目番地号]/g, // Detailed Address
    /https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/gi, // URLs
    /インスタ|instagram|ツイッター|twitter|x\.com|facebook|フェイスブック/gi, // SNS keywords
  ];

  const dangerPatterns = [
    /死ね|殺す|消えろ/g,
  ];

  patterns.forEach(p => {
    filteredText = filteredText.replace(p, "[非表示]");
  });

  dangerPatterns.forEach(p => {
    filteredText = filteredText.replace(p, "🔴🔵🔴🔵");
  });

  try {
    const now = Date.now();
    if (now - lastNgWordsFetch > NG_WORDS_CACHE_TTL) {
      const words = db.prepare("SELECT word FROM ng_words").all() as any[];
      cachedNgWords = words.map((w: any) => w.word).filter(Boolean);
      lastNgWordsFetch = now;
    }
    
    cachedNgWords.forEach(word => {
      if (!word) return;
      if (word.includes('[') || word.includes('\\') || word.includes('|')) {
        try {
          const regex = new RegExp(word, 'gi');
          filteredText = filteredText.replace(regex, "***");
        } catch (e) {
          filteredText = filteredText.split(word).join("***");
        }
      } else {
        filteredText = filteredText.split(word).join("***");
      }
    });
  } catch (err) {
    console.error("Filter error:", err);
  }
  return filteredText;
};


