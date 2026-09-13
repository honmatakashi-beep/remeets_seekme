import db from "../db";

export interface PasswordPolicy {
  minLength: number;
  requireLetters: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  requireMixedCase: boolean;
}

export function getPasswordPolicy(): PasswordPolicy {
  try {
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'password_policy'").get() as any;
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      return {
        minLength: typeof parsed.minLength === 'number' ? Math.max(6, Math.min(32, parsed.minLength)) : 8,
        requireLetters: parsed.requireLetters !== undefined ? !!parsed.requireLetters : true,
        requireNumbers: parsed.requireNumbers !== undefined ? !!parsed.requireNumbers : true,
        requireSymbols: parsed.requireSymbols !== undefined ? !!parsed.requireSymbols : false,
        requireMixedCase: parsed.requireMixedCase !== undefined ? !!parsed.requireMixedCase : false,
      };
    }
  } catch (e) {
    console.warn("Failed to get password policy, using defaults:", e);
  }
  return {
    minLength: 8,
    requireLetters: true,
    requireNumbers: true,
    requireSymbols: false,
    requireMixedCase: false,
  };
}

export function validatePasswordAgainstPolicy(password: string, customPolicy?: PasswordPolicy): { valid: boolean; error?: string } {
  const p = customPolicy || getPasswordPolicy();
  if (!password || typeof password !== 'string') {
    return { valid: false, error: "パスワードを入力してください。" };
  }
  if (password.length < p.minLength) {
    return { valid: false, error: `パスワードは${p.minLength}文字以上で入力してください。` };
  }
  if (p.requireLetters && !/[a-zA-Z]/.test(password)) {
    return { valid: false, error: "パスワードに英字（a〜z, A〜Z）を1文字以上含める必要があります。" };
  }
  if (p.requireNumbers && !/[0-9]/.test(password)) {
    return { valid: false, error: "パスワードに数字（0〜9）を1文字以上含める必要があります。" };
  }
  if (p.requireLetters && p.requireNumbers && (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))) {
    return { valid: false, error: "パスワードは英字と数字の両方を含める必要があります。" };
  }
  if (p.requireMixedCase && (!/[a-z]/.test(password) || !/[A-Z]/.test(password))) {
    return { valid: false, error: "パスワードに英大文字と英小文字の両方を含める必要があります。" };
  }
  if (p.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/\\~`'"]/.test(password)) {
    return { valid: false, error: "パスワードに記号（!@#$%^&* など）を1文字以上含める必要があります。" };
  }
  return { valid: true };
}

