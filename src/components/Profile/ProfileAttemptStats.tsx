"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { AttemptCounts } from "@/api/examAttempts";
import { useUser } from "@/contexts/UserContext";
import FireImage from "../../../public/images/jpg/fire.webp";

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
  const user = useUser();

  const tiles = [
    {
      label: t("statStreak"),
      value: (
        <span className="inline-flex items-center justify-center gap-1.5">
          <Image src={FireImage} alt="" aria-hidden className="h-6 w-auto sm:h-8" />
          {user?.streak?.current ?? 0}
        </span>
      ),
      tone: "text-fg",
    },
    { label: t("statTotal"), value: historyTotal, tone: "text-fg" },
    { label: t("statPassed"), value: stats.passed, tone: "text-success" },
    { label: t("statFailed"), value: stats.failed, tone: "text-danger" },
    {
      label: t("statUnfinished"),
      value: stats.incomplete,
      tone: "text-warning",
    },
    {
      label: t("statPassRate"),
      value: `${stats.passRate}%`,
      tone: "text-accent",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-control border border-line bg-surface p-3 text-center shadow-card sm:rounded-card sm:p-4"
        >
          <p className={`text-xl font-bold sm:text-3xl ${tile.tone}`}>
            {loading ? "—" : tile.value}
          </p>
          <p className="mt-1 text-2xs leading-tight text-fg-subtle sm:text-sm">
            {tile.label}
          </p>
        </div>
      ))}
    </section>
  );
}
