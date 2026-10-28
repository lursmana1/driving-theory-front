"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/utills/helpers/formatDate";
import { Link } from "@/i18n/navigation";
import { getTrainerSummary } from "@/api/trainer";
import { useAuth } from "@/contexts/UserContext";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import { examCtaPillBase } from "@/layoutComponents/Header/headerStyles";
import type { TrainerSummary } from "@/lib/types/trainer";
import { TrainerSummaryBar } from "@/components/Trainer/TrainerSummaryBar";

type ProfileTrainerCardProps = {
  categoryId: number;
};

/**
 * Entry point to the mistake trainer. Owns its own GET /trainer/summary so
 * the rest of the profile does not wait for it. Hidden until there is
 * something to show.
 */
export function ProfileTrainerCard({ categoryId }: ProfileTrainerCardProps) {
  const t = useTranslations("Trainer");
  const locale = useLocale();
  const { user } = useAuth();
  const [summary, setSummary] = useState<TrainerSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => subscribeStatsRefresh(() => setRefreshKey((k) => k + 1)), []);

  // Signed-in state, not the user object: /auth/me refreshes it after answers.
  const signedIn = !!user;
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    getTrainerSummary(categoryId, locale)
      .then((s) => {
        if (!cancelled) setSummary(s);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, locale, signedIn, refreshKey]);

  if (
    !summary ||
    (summary.activeMistakes === 0 && summary.clearedRecently === 0)
  ) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-fg sm:text-lg">
            {t("title")}
          </h2>
          <p className="text-sm text-fg-muted">
            {summary.dueNow === 0 && summary.nextDueAt
              ? t("emptyNextDue", {
                  date: formatDate(summary.nextDueAt, locale, "D MMMM"),
                })
              : t("cardBody")}
          </p>
        </div>
        {/* Only due mistakes count, so there is nothing to drill until one is due. */}
        {summary.dueNow > 0 && (
          <Link
            href={`/practice?category=${categoryId}`}
            className={`inline-flex h-11 shrink-0 items-center px-5 text-sm ${examCtaPillBase}`}
          >
            {t("cta")}
          </Link>
        )}
      </div>
      <TrainerSummaryBar
        stats={[
          { label: t("dueNow"), value: summary.dueNow, tone: "danger" },
          { label: t("activeMistakes"), value: summary.activeMistakes, tone: "neutral" },
          { label: t("clearedRecently"), value: summary.clearedRecently, tone: "success" },
        ]}
      />
    </section>
  );
}
