export type TicketCategory = 'urgent' | 'technical' | 'account' | 'general';
export type TicketCategoryEn = 'Urgent' | 'Technical' | 'Account-related' | 'General';

export interface ClassificationResult {
  category: TicketCategory;
  categoryEn: TicketCategoryEn;
  categoryLabel: string;
  matchedKeywords: string[];
  priorityScore: number; // 3: Urgent, 2: Technical, 1: Account, 0: General
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    iconColor: string;
    pillBg: string;
  };
  triageTip: string;
  recommendedTone: 'apology' | 'guide' | 'standard' | 'gratitude' | 'concise';
}

// Comprehensive keyword dictionary for support tickets
export const URGENT_KEYWORDS = [
  '緊急', '至急', '大至急', '即時', '今すぐ', '警察', '被害', '脅迫', '通報', '恐喝', 
  '違法', '詐欺', 'ストーカー', '乗っ取り', '不正アクセス', '不正利用', '事故', '法的措置', 
  '訴訟', '弁護士', '情報漏洩', '流出', '身の危険', '返金', '誤請求', '二重請求', '二重決済', 
  '危険', 'クレーム', '損害賠償', '至急対応', '警察庁', '捜査',
  'urgent', 'emergency', 'immediate', 'police', 'fraud', 'hacked', 'lawyer', 'scam', 'refund', 'leak', 'danger'
];

export const TECHNICAL_KEYWORDS = [
  'エラー', '不具合', 'バグ', '動かない', '開かない', '表示されない', '接続できない', 
  'カメラ', 'クラッシュ', '落ちる', 'フリーズ', '読み込めない', '404', '500', '502', '503',
  '画面真っ白', 'ボタンが押せない', '送信できない', '決済エラー', 'stripeエラー', 'ロード中', 
  'タイムアウト', '動作不良', '読み込みエラー', 'アップロードできない', '画面崩れ', '障害', 
  '通信障害', 'サーバーエラー', 'バグ報告',
  'error', 'bug', 'issue', 'crash', 'camera', 'failed', 'fail', 'loading', 'freeze', 'glitch', 'timeout', '500', '404', 'broken'
];

export const ACCOUNT_KEYWORDS = [
  'アカウント', '退会', '解約', '登録', 'パスワード', 'メールアドレス', '認証', 
  '認証コード', 'sms', 'ekyc', '本人確認', '年齢確認', '通知', '再開', 'ユーザー情報', 
  'ログイン情報', 'プロフィール', '利用停止', 'ブロック', 'パスワード変更', 'パスワード再設定', 
  'ログインできない', 'メアド変更', 'アドレス変更', '再ログイン', '登録削除', 'アカウント削除',
  'account', 'delete account', 'signup', 'register', 'profile', 'password', 'login', 'verification', 'auth', 'sms', 'ekyc', 'unsubscribe'
];

export function classifyTicket(subject: string = '', message: string = ''): ClassificationResult {
  const combinedText = `${subject || ''} ${message || ''}`.toLowerCase();

  const matchedUrgent = URGENT_KEYWORDS.filter(kw => combinedText.includes(kw.toLowerCase()));
  const matchedTechnical = TECHNICAL_KEYWORDS.filter(kw => combinedText.includes(kw.toLowerCase()));
  const matchedAccount = ACCOUNT_KEYWORDS.filter(kw => combinedText.includes(kw.toLowerCase()));

  if (matchedUrgent.length > 0) {
    return {
      category: 'urgent',
      categoryEn: 'Urgent',
      categoryLabel: '緊急',
      matchedKeywords: Array.from(new Set(matchedUrgent)),
      priorityScore: 3,
      badgeStyle: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        iconColor: 'text-rose-600',
        pillBg: 'bg-rose-100/90 text-rose-800 border-rose-300'
      },
      triageTip: '🚨 最優先トリアージ対象：ユーザーの被害防止・金銭トラブル・警察捜査照会等の可能性があります。迅速な確認および返金・アカウント保全等の措置を検討してください。',
      recommendedTone: 'apology'
    };
  }

  if (matchedTechnical.length > 0) {
    return {
      category: 'technical',
      categoryEn: 'Technical',
      categoryLabel: '技術・不具合',
      matchedKeywords: Array.from(new Set(matchedTechnical)),
      priorityScore: 2,
      badgeStyle: {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        iconColor: 'text-sky-600',
        pillBg: 'bg-sky-100/90 text-sky-800 border-sky-300'
      },
      triageTip: '⚙️ 技術トリアージ対象：カメラ・決済・認証または画面描画の不具合報告です。ご利用環境（端末・OS・ブラウザ）のヒアリングや調査状況を伝えてください。',
      recommendedTone: 'apology'
    };
  }

  if (matchedAccount.length > 0) {
    return {
      category: 'account',
      categoryEn: 'Account-related',
      categoryLabel: 'アカウント関連',
      matchedKeywords: Array.from(new Set(matchedAccount)),
      priorityScore: 1,
      badgeStyle: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconColor: 'text-purple-600',
        pillBg: 'bg-purple-100/90 text-purple-800 border-purple-300'
      },
      triageTip: '👤 アカウントトリアージ対象：ログイン再設定、退会、eKYC本人確認等の手続きに関するご相談です。具体的な操作手順や規約案内をスムーズに提示してください。',
      recommendedTone: 'guide'
    };
  }

  return {
    category: 'general',
    categoryEn: 'General',
    categoryLabel: '一般・ご意見',
    matchedKeywords: [],
    priorityScore: 0,
    badgeStyle: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      iconColor: 'text-slate-500',
      pillBg: 'bg-slate-100 text-slate-700 border-slate-300'
    },
    triageTip: '💬 一般トリアージ対象：サービスへの温かいご感想、メディア取材依頼、一般的なお問い合わせです。丁寧な公式サポート対応を行ってください。',
    recommendedTone: 'standard'
  };
}
