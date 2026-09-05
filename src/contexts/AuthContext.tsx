import React, { useState, useEffect, createContext, useContext } from 'react';

// --- User型定義 ---

export interface User {
  id: number;
  username: string;
  name?: string;
  fullName?: string;
  lastName?: string;
  firstName?: string;
  nickname?: string;
  email?: string;
  role?: string;
  maiden_name?: string;
  is_blocked?: boolean;
  is_ekyc_verified?: boolean;
  is_supporter?: boolean;
  email_notifications?: boolean;
  contact_type?: string;
  contact_id?: string;
}

// --- AuthContext ---

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Confirmation Dialog Context ---

export interface ConfirmContextType {
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};

// --- NG Word & Safety Filter Hook (Real-time Client Validation) ---

const normalizeClientText = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFKC')
    .replace(/[\u30a1-\u30f6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60))
    .replace(/[\uff01-\uff5e]/g, match => String.fromCharCode(match.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, '')
    .toLowerCase();
};

export const useNgFilter = () => {
  const check = (val: string): string | null => {
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

  return { check };
};
