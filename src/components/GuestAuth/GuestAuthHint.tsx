"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/UserContext";

export default function GuestAuthHint() {
  const { user, loading } = useAuth();
  const t = useTranslations("Home");

  if (loading || user) return null;

  return (
    <Link
      href="/auth?mode=register"
      className="mt-5 inline-flex max-w-md text-base font-semibold leading-6 text-accent transition hover:text-accent-strong hover:underline"
    >
      {t("heroAuthHint")}
    </Link>
  );
}
