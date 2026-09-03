"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getAuthConfig } from "@/api/auth";
import {
  googleCallbackErrorKey,
  type AuthErrorKey,
} from "@/utills/helpers/authErrorKey";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import AuthFormError from "./AuthFormError";
import { Icon } from "@/components/Icon/Icon";

function fallbackGoogleLoginUrl(): string {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").trim().replace(/\/$/, "");
  return base ? `${base}/auth/google` : "#";
}

function stripAuthErrorFromUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("error") && !url.searchParams.has("authError")) {
    return;
  }
  url.searchParams.delete("error");
  url.searchParams.delete("authError");
  const search = url.searchParams.toString();
  window.history.replaceState(
    {},
    "",
    `${url.pathname}${search ? `?${search}` : ""}${url.hash}`,
  );
}

export default function AuthForm() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [googleAuthUrl, setGoogleAuthUrl] = useState(fallbackGoogleLoginUrl);
  const [oauthErrorKey, setOauthErrorKey] = useState<AuthErrorKey | null>(null);
  const t = useTranslations("Auth");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/profile");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const key = googleCallbackErrorKey(window.location.search);
    if (key) {
      setOauthErrorKey(key);
      stripAuthErrorFromUrl();
    }
  }, []);

  useEffect(() => {
    getAuthConfig()
      .then((config) => {
        if (config.googleLoginUrl) setGoogleAuthUrl(config.googleLoginUrl);
      })
      .catch(() => {
        setGoogleAuthUrl(fallbackGoogleLoginUrl());
      });
  }, []);

  if (authLoading || user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center py-12">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  const googleReady = googleAuthUrl !== "#";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="font-georgian text-2xl font-bold text-slate-900">
          {mode === "login" ? t("login") : t("register")}
        </h1>

        {oauthErrorKey ? (
          <div className="mt-6">
            <AuthFormError message={t(oauthErrorKey)} />
          </div>
        ) : null}

        <a
          href={googleReady ? googleAuthUrl : undefined}
          aria-disabled={!googleReady}
          onClick={(event) => {
            if (!googleReady) event.preventDefault();
          }}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <Icon name="google" className="h-5 w-5" />
          {t("continueWithGoogle")}
        </a>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-slate-500">{t("or")}</span>
          </div>
        </div>

        <div>{mode === "login" ? <LoginForm /> : <RegisterForm />}</div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="text-center text-sm text-slate-600">
            {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-semibold text-blue-600 transition hover:text-blue-500 hover:underline"
            >
              {mode === "login" ? t("register") : t("login")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
