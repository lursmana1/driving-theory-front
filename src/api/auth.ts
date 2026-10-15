import BaseApi from "@/api/BaseApi";
import type { User } from "@/lib/auth";

/** The session itself is the httpOnly cookie the API sets on this response. */
export type AuthResponse = {
  user?: User;
};

export type AuthConfig = {
  googleLoginUrl: string;
  googleCallbackUrl?: string;
  apiPublicUrl?: string;
};

export async function getAuthConfig(): Promise<AuthConfig> {
  const res = await BaseApi.get<AuthConfig>("/auth/config");
  return res.data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await BaseApi.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return { user: res.data.user };
}

export async function register(payload: {
  name: string;
  surname: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await BaseApi.post<AuthResponse>("/auth/register", payload);
  return { user: res.data.user };
}

/** 401 is a signed-out session, not a failed request. */
const signedOutOk = (status: number) => status === 200 || status === 401;

export async function getMe(): Promise<User | null> {
  const res = await BaseApi.get<User>("/auth/me", {
    validateStatus: signedOutOk,
  });
  if (res.status === 401) return null;
  return res.data ?? null;
}

export async function logout(): Promise<void> {
  await BaseApi.post("/auth/logout");
}
