"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const BENEFIT_KEYS = [
  "guestSaveHistory",
  "guestSaveReadiness",
  "guestSaveWeakTopics",
] as const;

export default function GuestSaveProgressCta() {
  const t = useTranslations("Exam");

  return (
    <div className="border-t border-slate-200 bg-accent/5 px-8 py-5 text-left">
      <p className="text-sm font-semibold text-slate-900">
        {t("guestSaveTitle")}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {t("guestSaveText")}
      </p>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {BENEFIT_KEYS.map((key) => (
          <li key={key} className="flex gap-2">
            <span aria-hidden className="font-semibold text-accent">
              ·
            </span>
            {t(key)}
          </li>
        ))}
      </ul>
      <Link
        href="/auth?mode=register"
        className="mt-3 inline-flex text-sm font-semibold text-accent transition hover:text-accent-strong hover:underline"
      >
        {t("guestSaveCta")}
      </Link>
    </div>
  );
}
