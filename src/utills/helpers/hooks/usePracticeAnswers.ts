"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import {
  postPracticeAnswer,
  type PracticeAnswerResponse,
} from "@/api/practiceAnswers";
import { useAuth } from "@/contexts/UserContext";

/**
 * Ticket practice: one POST /practice-answers per answered question.
 * Timed exams keep using POST /exam-attempts/:id/answer.
 * `onRecorded` receives the server response (grade + trainer progress).
 */
export function usePracticeAnswers() {
  const locale = useLocale();
  const { user } = useAuth();

  const recordAnswer = useCallback(
    async (
      questionId: number,
      chosenAnswer: string,
      onRecorded?: (response: PracticeAnswerResponse) => void,
    ): Promise<boolean> => {
      const choice = chosenAnswer.trim();
      if (!Number.isFinite(questionId) || questionId <= 0 || !choice) {
        return false;
      }
      if (!user) return true;
      try {
        const response = await postPracticeAnswer(questionId, locale, choice);
        onRecorded?.(response);
        return true;
      } catch {
        return false;
      }
    },
    [locale, user],
  );

  return { recordAnswer };
}
