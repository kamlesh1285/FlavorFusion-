"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  loginRequest,
  registerRequest,
  type AuthUser,
} from "./api";

const STORAGE_KEY = "flavorfusion_auth";

interface StoredAuth {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  setUserData: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Starts true because we don't know yet whether localStorage has a
  // session — avoids flashing a "logged out" state on page load.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: StoredAuth = JSON.parse(raw);
        // Intentional: localStorage doesn't exist during SSR, so this can
        // only run after mount. Starting both server and client renders
        // from `null` and syncing here avoids a hydration mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(parsed.token);
        setUser(parsed.user);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  function persist(next: StoredAuth) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setToken(next.token);
    setUser(next.user);
  }

  async function login(email: string, password: string) {
    const res = await loginRequest({ email, password });
    persist({ token: res.accessToken, user: res.user });
  }

  async function register(payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const res = await registerRequest(payload);
    persist({ token: res.accessToken, user: res.user });
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  function setUserData(nextUser: AuthUser) {
    if (!token) return;
    persist({ token, user: nextUser });
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, setUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export { ApiError };
