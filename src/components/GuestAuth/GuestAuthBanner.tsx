"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/UserContext";

export default function GuestAuthBanner() {
  const { user, loading } = useAuth();
  const t = useTranslations("Auth");

  if (loading || user) return null;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-accent/20 bg-accent/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg">
          {t("guestBannerTitle")}
        </p>
        <p className="mt-0.5 text-sm leading-5 text-fg-muted">
          {t("guestBannerText")}
        </p>
      </div>
      <Link
        href="/auth?mode=register"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-control bg-accent px-4 text-sm font-semibold text-on-accent transition hover:bg-accent-strong"
      >
        {t("guestBannerCta")}
      </Link>
    </div>
  );
}
