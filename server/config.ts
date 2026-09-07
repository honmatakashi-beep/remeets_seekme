import rateLimit from "express-rate-limit";

export const JWT_SECRET = process.env.JWT_SECRET || "kizuna-secret-key-2026";
export const isProd = process.env.NODE_ENV === 'production';
export const PORT = process.env.PORT || 3000;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 5000,
  message: { error: "リクエストが多すぎます。しばらくしてからもう一度お試しください。" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 10 : 5000,
  message: { error: "登録リクエストが多すぎます。しばらくしてからもう一度お試しください。" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 30 : 5000,
  message: { error: "検索リクエストが多すぎます。しばらくしてからもう一度お試しください。" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const postCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 10 : 5000,
  message: { error: "投稿頻度が高すぎます。しばらくしてからもう一度お試しください。" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const quizAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 5000,
  message: { error: "クイズ回答試行回数の上限に達しました。しばらく待ってから再度お試しください。" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 20 : 5000,
  message: { error: "通報・削除申請の送信上限に達しました。時間をおいてから送信してください。" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const contactRevealLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProd ? 5 : 5000,
  message: { error: "連絡先開示手続きの試行回数が制限を超えました。1時間後にお試しください。" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

export const ADMIN_ROLES = ['admin', 'super_admin', 'moderator', 'auditor', 'cs_support', 'operator'];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'manage_settings',
    'manage_admins',
    'manage_payments',
    'moderate_content',
    'manage_contacts',
    'view_police_logs',
    'view_analytics',
    'manage_users',
    'danger_zone'
  ],
  admin: [
    'manage_settings',
    'manage_admins',
    'manage_payments',
    'moderate_content',
    'manage_contacts',
    'view_police_logs',
    'view_analytics',
    'manage_users',
    'danger_zone'
  ],
  moderator: [
    'moderate_content',
    'view_analytics'
  ],
  cs_support: [
    'manage_contacts',
    'view_analytics'
  ],
  auditor: [
    'view_police_logs',
    'view_analytics'
  ],
  operator: [
    'moderate_content',
    'view_analytics'
  ]
};

export const postLimiter = postCreationLimiter;
export const verifyLimiter = quizAttemptLimiter;
