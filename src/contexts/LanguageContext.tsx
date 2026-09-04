import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ja' | 'en';

interface Translations {
  [key: string]: {
    ja: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation & Brand
  appTitle: {
    ja: 'ReMEETs 〜再会のボトルメール〜',
    en: 'ReMEETs - Bottle Mail for Reunion'
  },
  tagline: {
    ja: 'あの頃の想い出を、もう一度つなぐ。',
    en: 'Reconnecting cherished memories of the past.'
  },
  home: { ja: 'トップ', en: 'Home' },
  search: { ja: '手紙を探す', en: 'Search Letters' },
  create: { ja: '手紙を流す', en: 'Cast a Bottle' },
  mypage: { ja: 'マイページ', en: 'My Account' },
  login: { ja: 'ログイン', en: 'Log In' },
  register: { ja: '新規会員登録', en: 'Sign Up' },
  logout: { ja: 'ログアウト', en: 'Log Out' },
  admin: { ja: '管理ダッシュボード', en: 'Admin' },
  
  // Footer & Legal
  terms: { ja: '利用規約', en: 'Terms of Service' },
  privacy: { ja: 'プライバシーポリシー', en: 'Privacy Policy' },
  guidelines: { ja: '利用ガイドライン', en: 'Guidelines' },
  company: { ja: '特定商取引法に基づく表記', en: 'Commercial Disclosure' },
  faq: { ja: 'よくある質問', en: 'FAQ' },
  copyright: {
    ja: '© 2026 ReMEETs 事務局. All rights reserved. 制定日: 2026年8月15日',
    en: '© 2026 ReMEETs Team. All rights reserved. Enacted: Aug 15, 2026'
  },

  // Actions & Buttons
  submit: { ja: '送信する', en: 'Submit' },
  cancel: { ja: 'キャンセル', en: 'Cancel' },
  answerQuiz: { ja: '秘密の質問に回答する', en: 'Answer Secret Quiz' },
  revealLetter: { ja: '手紙を開封する', en: 'Open Letter' },
  ageVerify: { ja: '本人確認（eKYC）', en: 'Identity Verification (eKYC)' },
  loading: { ja: '読み込み中...', en: 'Loading...' },
  back: { ja: '戻る', en: 'Back' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('remeets_lang') as Language;
      if (saved === 'ja' || saved === 'en') return saved;
      if (navigator.language.startsWith('en')) return 'en';
    }
    return 'ja';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('remeets_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: keyof typeof translations): string => {
    if (!translations[key]) return key as string;
    return translations[key][language] || translations[key].ja;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isEn: language === 'en' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// UI Component for switching language (Flag / Text button)
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-stone-200 dark:border-slate-700 rounded-full p-0.5 shadow-sm text-xs font-medium ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('ja')}
        className={`px-2.5 py-1 rounded-full transition-all ${
          language === 'ja'
            ? 'bg-amber-600 text-white shadow-xs font-bold'
            : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
        }`}
        title="日本語に切り替え"
      >
        JP
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full transition-all ${
          language === 'en'
            ? 'bg-amber-600 text-white shadow-xs font-bold'
            : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
        }`}
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
};
