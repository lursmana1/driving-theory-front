import BaseApi from "@/api/BaseApi";
import type { User } from "@/lib/auth";
import { clearAccessToken, setAccessToken } from "@/lib/authToken";

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
};

export type AuthResponse = {
  user: User;
  /** Legacy top-level token (same-origin cookie era) */
  access_token?: string;
  /** Bearer token lives here on cross-origin API */
  tokens?: AuthTokens;
};

function persistAuthTokens(data: AuthResponse): void {
  const token = data.tokens?.access_token ?? data.access_token;
  if (token) setAccessToken(token);
}

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
  persistAuthTokens(res.data);
  return res.data;
}

export async function register(payload: {
  name: string;
  surname: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await BaseApi.post<AuthResponse>("/auth/register", payload);
  persistAuthTokens(res.data);
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    await BaseApi.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}
