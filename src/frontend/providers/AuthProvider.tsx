"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/models/auth";

interface AuthContextValue {
  user: SessionUser | null;
  loggingOut: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser;
  children: ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      setUser(null);
      setLoggingOut(false);
      router.replace("/");
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      router.replace("/dashboard");
    };
    window.addEventListener("fincred:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("fincred:unauthorized", handleUnauthorized);
  }, [router]);

  const value = useMemo(() => ({ user, loggingOut, logout }), [user, loggingOut, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
