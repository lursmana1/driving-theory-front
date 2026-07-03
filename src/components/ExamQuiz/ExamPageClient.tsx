"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  fetchExamClient,
  type FetchExamClientResult,
} from "@/api/examAttempts";
import type { CategoryExamRules } from "@/CONSTS/categories";
import type { ExamQuestion } from "@/lib/types/exam";
import ExamQuiz from "./Quiz";

type ExamPageClientProps = {
  locale: string;
  categoryId: number;
  subjects: string;
  examRulesFallback: CategoryExamRules;
};

type ExamLoadState = {
  loading: boolean;
  restarting: boolean;
  questions: ExamQuestion[];
  attemptId: number | null;
  endDate: string | null;
  examRules: CategoryExamRules;
  error?: FetchExamClientResult["error"];
  examKey: number;
};

export default function ExamPageClient({
  locale,
  categoryId,
  subjects,
  examRulesFallback,
}: ExamPageClientProps) {
  const [state, setState] = useState<ExamLoadState>({
    loading: true,
    restarting: false,
    questions: [],
    attemptId: null,
    endDate: null,
    examRules: examRulesFallback,
    examKey: 0,
  });

  const loadExam = useCallback(
    async (restarting = false) => {
      setState((prev) => ({
        ...prev,
        loading: !restarting,
        restarting,
        error: undefined,
      }));

      const result = await fetchExamClient({
        lang: locale,
        subjects: subjects || undefined,
        categories: String(categoryId),
        count: examRulesFallback.totalQuestions,
      });

      setState((prev) => ({
        loading: false,
        restarting: false,
        questions: result.questions,
        attemptId: result.attemptId,
        endDate: result.endDate,
        examRules: result.examRules,
        error: result.error,
        examKey: restarting ? prev.examKey + 1 : prev.examKey,
      }));
    },
    [locale, categoryId, subjects, examRulesFallback.totalQuestions],
  );

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const onRestart = useCallback(() => {
    loadExam(true);
  }, [loadExam]);

  if (state.loading) {
    return (
      <div className="bg-[#193e4a] min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 font-georgian text-sm text-white/90">იტვირთება...</p>
        </div>
      </div>
    );
  }

  if (state.error === "insufficient_questions") {
    return (
      <div className="bg-[#193e4a] min-h-dvh flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <p className="text-lg mb-4 font-georgian">
            არჩეული თემებისთვის საკმარისი კითხვა არ არის. აირჩიეთ მეტი თემა ან
            სხვა კატეგორია.
          </p>
          <Link href="/subjectpicker" className="text-rose-400 hover:underline">
            უკან დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  if (!state.questions.length) {
    return (
      <div className="bg-[#193e4a] min-h-dvh flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">კითხვები ვერ მოიძებნა</p>
          <Link href="/subjectpicker" className="text-rose-400 hover:underline">
            უკან დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#193e4a] min-h-dvh flex flex-col relative">
      {state.restarting && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#193e4a]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 font-georgian text-sm text-white/90">იტვირთება...</p>
        </div>
      )}
      <div className="section flex-1 min-h-0 flex flex-col">
        <ExamQuiz
          key={state.examKey}
          questions={state.questions}
          attemptId={state.attemptId}
          endDate={state.endDate}
          examRules={state.examRules}
          onRestart={onRestart}
        />
      </div>
    </div>
  );
}
