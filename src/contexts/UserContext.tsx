"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { setUnauthorizedHandler } from "@/api/BaseApi";
import { getMe, logout as logoutApi } from "@/api/auth";
import type { User } from "@/lib/auth";
import { purgeLegacyAuthStorage } from "@/lib/legacyAuthStorage";

type UserContextValue = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Always ask the API: the session lives in an httpOnly cookie that JavaScript
  // can't see, so `/auth/me` is the only source of truth for who is signed in.
  const refresh = useCallback(async () => {
    try {
      setUser(await getMe());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // still drop the user locally
    } finally {
      userRef.current = null;
      setUser(null);
    }
  }, []);

  useEffect(() => {
    purgeLegacyAuthStorage();
    refresh();
  }, [refresh]);

  // Any other 401 means the cookie expired or was revoked mid-session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      const wasSignedIn = userRef.current != null;
      userRef.current = null;
      setUser(null);
      return wasSignedIn;
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, refresh, logout }}>
      {children}
    </UserContext.Provider>
  );
}

function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}

/** Current user (null while loading or signed out). */
export function useUser() {
  return useUserContext().user;
}

/** Full auth state — user, loading flag, and refresh/setUser/logout controls. */
export function useAuth() {
  return useUserContext();
}
