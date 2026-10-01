"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { getMe, logout as logoutApi } from "@/api/auth";
import type { User } from "@/lib/auth";
import {
  captureAccessTokenFromUrl,
  clearAccessToken,
  markSession,
} from "@/lib/authToken";

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

  // Always ask the API: a Google session lives in an httpOnly cookie we can't read.
  const refresh = useCallback(async () => {
    try {
      const nextUser = await getMe();
      setUser(nextUser);
      if (nextUser) markSession();
      else clearAccessToken();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        clearAccessToken();
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // logout already cleared the local token
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    captureAccessTokenFromUrl();
    refresh();
  }, [refresh]);

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
