"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  fetchExamClient,
  type FetchExamClientResult,
} from "@/api/examAttempts";
import type { CategoryExamRules } from "@/CONSTS/categories";
import type { ExamQuestion } from "@/lib/types/exam";
import { useAuth } from "@/contexts/UserContext";
import ExamQuiz from "./Quiz";
import ExamRestartOverlay from "./ExamRestartOverlay";

type ExamPageClientProps = {
  locale: string;
  categoryId: number;
  subjects: string;
};

type ExamLoadState = {
  restarting: boolean;
  questions: ExamQuestion[];
  attemptId: number | null;
  endDate: string | null;
  createdAt: string | null;
  examRules: CategoryExamRules | null;
  error?: FetchExamClientResult["error"];
  examKey: number;
};

export default function ExamPageClient({
  locale,
  categoryId,
  subjects,
}: ExamPageClientProps) {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("Exam");
  const isAuthenticated = !!user;
  const [state, setState] = useState<ExamLoadState>({
    restarting: false,
    questions: [],
    attemptId: null,
    endDate: null,
    createdAt: null,
    examRules: null,
    examKey: 0,
  });

  const latest = useRef<{ current: boolean }>({ current: true });
  const requestKey = authLoading
    ? null
    : `${locale}:${categoryId}:${subjects}:${isAuthenticated}`;
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  const loading = requestKey == null || appliedKey !== requestKey;

  const beginRequest = useCallback(() => {
    latest.current.current = true;
    const cancelled = { current: false };
    latest.current = cancelled;
    return cancelled;
  }, []);

  // Wait for auth to resolve, otherwise a signed-in user starts an untracked exam.
  useEffect(() => {
    if (!requestKey) return;

    const cancelled = beginRequest();
    const key = requestKey;

    void (async () => {
      const result = await fetchExamClient({
        lang: locale,
        subjects: subjects || undefined,
        categories: String(categoryId),
        authenticated: isAuthenticated,
      });
      if (cancelled.current) return;

      setState((prev) => ({
        restarting: false,
        questions: result.questions,
        attemptId: result.attemptId,
        endDate: result.endDate,
        createdAt: result.createdAt,
        examRules: result.examRules,
        error: result.error,
        examKey: prev.examKey,
      }));
      setAppliedKey(key);
    })();

    return () => {
      cancelled.current = true;
    };
  }, [
    requestKey,
    beginRequest,
    locale,
    categoryId,
    subjects,
    isAuthenticated,
  ]);

  const onRestart = useCallback(() => {
    const cancelled = beginRequest();
    setState((prev) => ({ ...prev, restarting: true, error: undefined }));

    void (async () => {
      const result = await fetchExamClient({
        lang: locale,
        subjects: subjects || undefined,
        categories: String(categoryId),
        authenticated: isAuthenticated,
      });
      if (cancelled.current) return;

      setState((prev) => ({
        restarting: false,
        questions: result.questions,
        attemptId: result.attemptId,
        endDate: result.endDate,
        createdAt: result.createdAt,
        examRules: result.examRules,
        error: result.error,
        examKey: prev.examKey + 1,
      }));
    })();
  }, [beginRequest, locale, categoryId, subjects, isAuthenticated]);

  if (loading && !state.restarting) {
    return (
      <div className="bg-[#193e4a] min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 font-georgian text-sm text-white/90">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (state.error === "insufficient_questions") {
    return (
      <div className="bg-[#193e4a] min-h-dvh flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <p className="text-lg mb-4 font-georgian">
            {t("insufficientQuestions")}
          </p>
          <Link href="/subjectpicker" className="text-rose-400 hover:underline">
            {t("backToTopics")}
          </Link>
        </div>
      </div>
    );
  }

  if (!state.questions.length || !state.examRules) {
    return (
      <div className="bg-[#193e4a] min-h-dvh flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">{t("questionsNotFound")}</p>
          <Link href="/subjectpicker" className="text-rose-400 hover:underline">
            {t("backToTopics")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#193e4a] min-h-dvh flex flex-col relative">
      {state.restarting && <ExamRestartOverlay />}
      <div className="section flex-1 min-h-0 flex flex-col">
        <ExamQuiz
          key={state.examKey}
          questions={state.questions}
          attemptId={state.attemptId}
          endDate={state.endDate}
          createdAt={state.createdAt}
          examRules={state.examRules}
          onRestart={onRestart}
        />
      </div>
    </div>
  );
}
