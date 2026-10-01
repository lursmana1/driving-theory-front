"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCategories } from "@/api/categories";
import {
  getAttemptsHistory,
  type AttemptSummary,
} from "@/api/examAttempts";
import type { Category } from "@/lib/types/category";
import type { AttemptCounts } from "@/api/examAttempts";
import { EXAM_HISTORY_PAGE_SIZE, PAGE_PARAM } from "@/CONSTS/pagination";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import { useAuth } from "@/contexts/UserContext";
import {
  EMPTY_ATTEMPT_COUNTS,
  EMPTY_ATTEMPTS_PAGE,
} from "@/components/Profile/profileUtils";

export function useProfileAttempts() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const page = Math.max(
    1,
    parseInt(searchParams.get(PAGE_PARAM) ?? "1", 10) || 1,
  );

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [stats, setStats] = useState<AttemptCounts>(EMPTY_ATTEMPT_COUNTS);
  const [refreshToken, setRefreshToken] = useState(0);
  const [applied, setApplied] = useState<{
    userId: number;
    page: number;
    refreshToken: number;
  } | null>(null);

  const loading =
    !user ||
    applied == null ||
    applied.userId !== user.id ||
    applied.page !== page ||
    applied.refreshToken !== refreshToken;

  useEffect(() => {
    if (!user) return;

    const cancelled = { current: false };
    const userId = user.id;
    const pageAtStart = page;
    const tokenAtStart = refreshToken;

    void (async () => {
      const [cats, history] = await Promise.all([
        getCategories().catch(() => [] as Category[]),
        getAttemptsHistory(pageAtStart, EXAM_HISTORY_PAGE_SIZE).catch(
          () => EMPTY_ATTEMPTS_PAGE,
        ),
      ]);
      if (cancelled.current) return;

      setCategories(cats);
      setAttempts(history.data);
      setHistoryTotal(history.counts?.total ?? history.total);
      setStats(history.counts ?? EMPTY_ATTEMPT_COUNTS);
      setApplied({
        userId,
        page: pageAtStart,
        refreshToken: tokenAtStart,
      });
    })();

    return () => {
      cancelled.current = true;
    };
  }, [user, page, refreshToken]);

  useEffect(() => {
    return subscribeStatsRefresh(() => {
      setRefreshToken((token) => token + 1);
    });
  }, []);

  return { page, attempts, categories, historyTotal, stats, loading };
}
