"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/UserContext";
import { getAttemptsHistory } from "@/api/examAttempts";
import { EXAM_HISTORY_PAGE_SIZE } from "@/CONSTS/pagination";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import {
  EMPTY_ATTEMPT_COUNTS,
  EMPTY_ATTEMPTS_PAGE,
} from "@/components/Profile/profileUtils";

export function ProfileAttemptStats() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("Profile");

  const [historyTotal, setHistoryTotal] = useState(0);
  const [stats, setStats] = useState(EMPTY_ATTEMPT_COUNTS);
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const history = await getAttemptsHistory(1, EXAM_HISTORY_PAGE_SIZE).catch(
      () => EMPTY_ATTEMPTS_PAGE,
    );
    setHistoryTotal(history.counts?.total ?? history.total);
    setStats(history.counts ?? EMPTY_ATTEMPT_COUNTS);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadCounts();
    return subscribeStatsRefresh(loadCounts);
  }, [user, loadCounts]);

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
      tone: "text-sky-600",
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
            {loading || authLoading ? "—" : tile.value}
          </p>
          <p className="mt-1 text-[11px] leading-tight text-slate-500 sm:text-sm">
            {tile.label}
          </p>
        </div>
      ))}
    </section>
  );
}
