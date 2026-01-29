import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { loginApi, registerApi, type AuthUser } from "../api/auth";



export type UserRole = "teacher" | "student";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "mentora_token";
const USER_KEY = "mentora_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const persist = (t: string, u: AuthUser) => {
    setToken(t);
    setUser(u);
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

async function login(email: string, password: string) {
  const data = await loginApi(email, password); // { token, user }
  persist(data.token, data.user);
}

async function register(email: string, password: string, role: UserRole) {
  const data = await registerApi(email, password, role); // { token, user }
  persist(data.token, data.user);
}
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
