"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { logout } from "@/api/auth";

export default function LogoutClient() {
  const locale = useLocale();
  const t = useTranslations("Auth");

  useEffect(() => {
    logout()
      .catch(() => {})
      .finally(() => {
        window.location.replace(`/${locale}`);
      });
  }, [locale]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-slate-600">{t("loggingOut")}</p>
    </div>
  );
}
