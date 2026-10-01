"use client";

import { useTranslations } from "next-intl";
import type { AttemptCounts } from "@/api/examAttempts";

type ProfileAttemptStatsProps = {
  historyTotal: number;
  stats: AttemptCounts;
  loading: boolean;
};

export function ProfileAttemptStats({
  historyTotal,
  stats,
  loading,
}: ProfileAttemptStatsProps) {
  const t = useTranslations("Profile");

  const tiles = [
    { label: t("statTotal"), value: historyTotal, tone: "text-slate-900" },
    { label: t("statPassed"), value: stats.passed, tone: "text-emerald-600" },
    { label: t("statFailed"), value: stats.failed, tone: "text-rose-600" },
    {
      label: t("statUnfinished"),
      value: stats.incomplete,
      tone: "text-amber-600",
    },
    {
      label: t("statPassRate"),
      value: `${stats.passRate}%`,
      tone: "text-accent",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:rounded-2xl sm:p-4"
        >
          <p className={`text-xl font-bold sm:text-3xl ${tile.tone}`}>
            {loading ? "—" : tile.value}
          </p>
          <p className="mt-1 text-[11px] leading-tight text-slate-500 sm:text-sm">
            {tile.label}
          </p>
        </div>
      ))}
    </section>
  );
}
