import { getServerBaseApi } from "@/api/ServerBaseApi";

export type User = {
  id: number;
  name?: string;
  surname?: string;
  email: string;
  type?: string;
  /** Consecutive days with a visit; counted by GET /auth/me. */
  streak?: { current: number; longest: number };
};

export async function getUser(): Promise<User | null> {
  try {
    const api = await getServerBaseApi();
    const res = await api.get<User>("/auth/me", {
      validateStatus: (status) => status === 200 || status === 401,
    });
    if (res.status === 401) return null;
    return res.data;
  } catch {
    return null;
  }
}
