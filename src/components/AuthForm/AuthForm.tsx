"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

function getBackendBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").trim().replace(/\/$/, "");
}

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const t = useTranslations("Auth");

  const googleAuthUrl = useMemo(() => {
    const base = getBackendBaseUrl();
    if (!base) return "#";
    return `${base}/auth/google`;
  }, []);

  // es gadawyobia global stateshi unda inaxebodes
  // useEffect(() => {
  //   BaseApi.get("/auth/me")
  //     .then((res) => {
  //       router.replace("/");
  //     })
  //     .catch(() => setChecking(false));
  // }, [router]);

  // if (checking) {
  //   return (
  //     <div className="flex min-h-[60vh] items-center justify-center">
  //       <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
  //     </div>
  //   );
  // }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="font-georgian text-2xl font-bold text-slate-900">
          {mode === "login" ? t("login") : t("register")}
        </h1>

        <a
          href={googleAuthUrl}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
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
