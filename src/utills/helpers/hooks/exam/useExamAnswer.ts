import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import { isAttemptExpiredError, submitAnswer } from "@/api/examAttempts";
import { AUTO_ADVANCE_DELAY_MS } from "@/CONSTS/QuizExamConstats";

type UseExamAnswerArgs = {
  q: ExamQuestion | undefined;
  qId: string;
  selectedAnswer: string | null;
  examFinished: boolean;
  examFailed: boolean;
  navIndex: number;
  questionCount: number;
  autoAdvance: boolean;
  timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  attemptId?: number | null;
  onAdvance: () => void;
  setAnswersById: Dispatch<SetStateAction<Record<string, string>>>;
  setCorrectById: Dispatch<SetStateAction<Record<string, boolean>>>;
  setIsTimeUp: Dispatch<SetStateAction<boolean>>;
};

export function useExamAnswer({
  q,
  qId,
  selectedAnswer,
  examFinished,
  examFailed,
  navIndex,
  questionCount,
  autoAdvance,
  timeoutRef,
  attemptId,
  onAdvance,
  setAnswersById,
  setCorrectById,
  setIsTimeUp,
}: UseExamAnswerArgs) {
  const answeringRef = useRef(false);
  const advanceRef = useRef(onAdvance);

  useEffect(() => {
    advanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    answeringRef.current = false;
  }, [qId]);

  // A manual next/swipe must cancel a pending auto-advance jump.
  useEffect(() => {
    return () => {
      if (!timeoutRef.current) return;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [navIndex, timeoutRef]);

  const handleSelect = useCallback(
    (key: string) => {
      if (examFinished || examFailed) return;
      if (answeringRef.current || selectedAnswer) return;
      answeringRef.current = true;

      setAnswersById((prev) => {
        if (prev[qId]) return prev;
        return { ...prev, [qId]: key };
      });

      const answeredIndex = navIndex;
      // Hold the jump until the verdict lands, otherwise the colour never shows.
      const scheduleAdvance = () => {
        if (!autoAdvance || answeredIndex >= questionCount - 1) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          answeringRef.current = false;
          advanceRef.current();
          timeoutRef.current = null;
        }, AUTO_ADVANCE_DELAY_MS);
      };

      if (attemptId && q) {
        submitAnswer(attemptId, q.id, key)
          .then(({ correct }) => {
            setCorrectById((prev) => ({ ...prev, [qId]: correct }));
          })
          .catch((err: unknown) => {
            // Deadline passed — the server already closed the attempt.
            if (isAttemptExpiredError(err)) setIsTimeUp(true);
          })
          .finally(scheduleAdvance);
      } else {
        scheduleAdvance();
      }
    },
    [
      qId,
      examFinished,
      examFailed,
      selectedAnswer,
      navIndex,
      questionCount,
      autoAdvance,
      attemptId,
      q,
      timeoutRef,
      setAnswersById,
      setCorrectById,
      setIsTimeUp,
    ],
  );

  return { handleSelect };
}
