"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { logout } from "@/api/auth";

export default function LogoutClient() {
  const locale = useLocale();

  useEffect(() => {
    logout()
      .catch(() => {})
      .finally(() => {
        window.location.replace(`/${locale}`);
      });
  }, [locale]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-slate-600">გასვლა...</p>
    </div>
  );
}
