import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  getQuestionPool,
  getReadiness,
  getWeakQuestions,
  getWeakSubjects,
  isAuthError,
  type OverviewWeakQuestion,
  type OverviewWeakSubject,
} from "@/api/userStats";
import type { ReadinessScore } from "@/lib/types/userStats";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import { useAuth } from "@/contexts/UserContext";
import { resolveSubjectDisplayName } from "@/CONSTS/subjects";
import { topByWrongCount } from "@/components/Profile/profileUtils";

const WEAK_STATS_TOP_N = 5;

export function useProfileOverview(categoryId: number) {
  const { user, loading: authLoading } = useAuth();
  const locale = useLocale();

  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [weakQuestions, setWeakQuestions] = useState<OverviewWeakQuestion[]>(
    [],
  );
  const [weakSubjects, setWeakSubjects] = useState<OverviewWeakSubject[]>([]);
  const [poolExposure, setPoolExposure] = useState<number | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(true);
  const [readinessError, setReadinessError] = useState(false);
  const [weakQuestionsLoading, setWeakQuestionsLoading] = useState(true);
  const [weakSubjectsLoading, setWeakSubjectsLoading] = useState(true);

  const loadStats = useCallback(
    async (cancelled: { current: boolean }) => {
      setReadiness(null);
      setWeakQuestions([]);
      setWeakSubjects([]);
      setPoolExposure(null);
      setReadinessLoading(true);
      setReadinessError(false);
      setWeakQuestionsLoading(true);
      setWeakSubjectsLoading(true);

      const [readinessResult, poolResult, weakQResult, weakSResult] =
        await Promise.allSettled([
          getReadiness(categoryId),
          getQuestionPool(categoryId),
          getWeakQuestions(categoryId),
          getWeakSubjects(categoryId),
        ]);

      if (cancelled.current) return;

      if (readinessResult.status === "fulfilled") {
        setReadiness(readinessResult.value);
        setReadinessError(false);
      } else if (!isAuthError(readinessResult.reason)) {
        setReadinessError(true);
      }
      setReadinessLoading(false);

      if (poolResult.status === "fulfilled") {
        setPoolExposure(poolResult.value.exposureRate ?? null);
      } else {
        setPoolExposure(null);
      }

      if (weakQResult.status === "fulfilled") {
        setWeakQuestions(weakQResult.value);
      } else {
        setWeakQuestions([]);
      }
      setWeakQuestionsLoading(false);

      if (weakSResult.status === "fulfilled") {
        setWeakSubjects(weakSResult.value);
      } else {
        setWeakSubjects([]);
      }
      setWeakSubjectsLoading(false);
    },
    [categoryId],
  );

  useEffect(() => {
    if (authLoading || !user) return;

    const cancelled = { current: false };
    void loadStats(cancelled);
    const unsub = subscribeStatsRefresh(() => loadStats(cancelled));

    return () => {
      cancelled.current = true;
      unsub();
    };
  }, [authLoading, user, loadStats]);

  const subjectNames = weakSubjects.map((s) => ({
    id: s.subjectId,
    name: resolveSubjectDisplayName(s.subjectId, s.name, locale),
  }));

  const topWeakQuestions = useMemo(
    () => topByWrongCount(weakQuestions, WEAK_STATS_TOP_N),
    [weakQuestions],
  );
  const topWeakSubjects = useMemo(
    () => topByWrongCount(weakSubjects, WEAK_STATS_TOP_N),
    [weakSubjects],
  );

  const chartsLoading = weakQuestionsLoading || weakSubjectsLoading;
  const showChartsSection =
    chartsLoading || topWeakQuestions.length > 0 || topWeakSubjects.length > 0;

  return {
    authLoading,
    readiness,
    readinessLoading,
    readinessError,
    poolExposure,
    weakQuestions,
    weakQuestionsLoading,
    weakSubjectsLoading,
    topWeakQuestions,
    topWeakSubjects,
    subjectNames,
    showChartsSection,
  };
}
