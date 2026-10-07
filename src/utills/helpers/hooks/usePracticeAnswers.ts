"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { postPracticeAnswer } from "@/api/practiceAnswers";
import { useAuth } from "@/contexts/UserContext";

/**
 * Ticket practice: one POST /practice-answers per answered question.
 * Timed exams keep using POST /exam-attempts/:id/answer.
 */
export function usePracticeAnswers() {
  const locale = useLocale();
  const { user } = useAuth();

  const recordAnswer = useCallback(
    async (questionId: number, chosenAnswer: string): Promise<boolean> => {
      const choice = chosenAnswer.trim();
      if (!Number.isFinite(questionId) || questionId <= 0 || !choice) {
        return false;
      }
      if (!user) return true;
      try {
        await postPracticeAnswer(questionId, locale, choice);
        return true;
      } catch {
        return false;
      }
    },
    [locale, user],
  );

  return { recordAnswer };
}
