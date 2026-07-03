import BaseApi from "@/api/BaseApi";
import type { User } from "@/lib/auth";
import { clearAccessToken, setAccessToken } from "@/lib/authToken";

export type AuthResponse = {
  access_token: string;
  user: User;
};

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await BaseApi.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  if (res.data.access_token) {
    setAccessToken(res.data.access_token);
  }
  return res.data;
}

export async function register(payload: {
  name: string;
  surname: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await BaseApi.post<AuthResponse>("/auth/register", payload);
  if (res.data.access_token) {
    setAccessToken(res.data.access_token);
  }
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    await BaseApi.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}
