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

// --- NG Word Filter Hook ---

export const useNgFilter = () => {
  const check = (val: string): string | null => {
    // Basic fallback check for harmful phrases or placeholders
    const badPatterns = ['死ね', '殺す', '痴漢', '援助交際', '買春'];
    for (const pattern of badPatterns) {
      if (val.includes(pattern)) return pattern;
    }
    return null;
  };
  return { check };
};
