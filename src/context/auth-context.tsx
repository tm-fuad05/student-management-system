"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser, UserRole } from "@/lib/types";

const STORAGE_KEY = "sms_auth";
const ACCOUNTS_KEY = "sms_accounts";

type Account = {
  username: string;
  password: string;
  role: UserRole;
  email?: string;
};

const DEFAULT_ACCOUNTS: Account[] = [
  { username: "demo.admin", password: "password", role: "admin" },
];

function getAccounts(): Account[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return DEFAULT_ACCOUNTS.slice();
    return JSON.parse(raw) as Account[];
  } catch {
    return DEFAULT_ACCOUNTS.slice();
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function readStored(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => void;
  signup: (
    username: string,
    password: string,
    role: UserRole,
    email?: string,
  ) => void;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(ACCOUNTS_KEY)) {
      saveAccounts(DEFAULT_ACCOUNTS.slice());
    }
    setUser(readStored());
    setReady(true);
  }, []);

  const login = useCallback((username: string, password: string) => {
    const accounts = getAccounts();
    const acc = accounts.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase(),
    );
    if (!acc || acc.password !== password) {
      throw new Error("Invalid username or password.");
    }
    const next: AuthUser = { username: acc.username, role: acc.role };
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const signup = useCallback(
    (username: string, password: string, role: UserRole, email?: string) => {
      const u = username.trim();
      if (u.length < 3) {
        throw new Error("Username must be at least 3 characters.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      const accounts = getAccounts();
      if (
        accounts.some((a) => a.username.toLowerCase() === u.toLowerCase())
      ) {
        throw new Error("That username is already taken.");
      }
      const em = email?.trim();
      const nextAccounts: Account[] = [
        ...accounts,
        {
          username: u,
          password,
          role,
          ...(em ? { email: em } : {}),
        },
      ];
      saveAccounts(nextAccounts);
      const next: AuthUser = { username: u, role };
      setUser(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, login, signup, logout, ready }),
    [user, login, signup, logout, ready],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
