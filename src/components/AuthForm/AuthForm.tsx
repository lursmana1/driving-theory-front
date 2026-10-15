"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getAuthConfig } from "@/api/auth";
import { type AuthErrorKey } from "@/utills/helpers/authErrorKey";
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

const BENEFIT_KEYS = [
  "benefitHistory",
  "benefitReadiness",
  "benefitWeakTopics",
] as const;

type AuthFormProps = {
  initialMode?: "login" | "register";
  oauthErrorKey?: AuthErrorKey | null;
};

export default function AuthForm({
  initialMode = "login",
  oauthErrorKey = null,
}: AuthFormProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [googleAuthUrl, setGoogleAuthUrl] = useState(fallbackGoogleLoginUrl);
  const t = useTranslations("Auth");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/profile");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (oauthErrorKey) stripAuthErrorFromUrl();
  }, [oauthErrorKey]);

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
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-fg-faint" />
      </div>
    );
  }

  const googleReady = googleAuthUrl !== "#";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <div className="rounded-card border border-line bg-surface p-8 shadow-overlay sm:p-10">
        <h1 className="font-georgian text-2xl font-bold text-fg">
          {mode === "login" ? t("login") : t("register")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-fg-muted">
          {t("benefitsIntro")}
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-fg-muted">
          {BENEFIT_KEYS.map((key) => (
            <li key={key} className="flex gap-2">
              <span aria-hidden className="font-semibold text-accent">
                ·
              </span>
              {t(key)}
            </li>
          ))}
        </ul>

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
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-control border border-line bg-surface py-3.5 font-medium text-fg-muted shadow-card transition hover:border-line-strong hover:bg-surface-muted aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <Icon name="google" className="h-5 w-5" />
          {t("continueWithGoogle")}
        </a>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-3 text-fg-subtle">{t("or")}</span>
          </div>
        </div>

        <div>{mode === "login" ? <LoginForm /> : <RegisterForm />}</div>

        <div className="mt-6 border-t border-line-subtle pt-6">
          <p className="text-center text-sm text-fg-muted">
            {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-semibold text-accent transition hover:text-accent-strong hover:underline"
            >
              {mode === "login" ? t("register") : t("login")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
