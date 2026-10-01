import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import type { FinishExamResponse } from "@/api/examAttempts";
import { finishExam, getAttempt } from "@/api/examAttempts";
import { getExamClock } from "@/utills/helpers/formatExamDuration";
import { normalizeQuestions } from "@/utills/helpers/normalizeQuestions";
import {
  getExamReviewItems,
  type ExamReviewItem,
} from "@/utills/helpers/examReview";

type UseExamFinishArgs = {
  attemptId?: number | null;
  endDate?: string | null;
  createdAt?: string | null;
  examQuestions: ExamQuestion[];
  answersById: Record<string, string>;
  correctById: Record<string, boolean>;
  totalAnswered: number;
  totalQuestions: number;
  mistake: number;
  maxMistakes: number;
};

export function useExamFinish({
  attemptId,
  endDate,
  createdAt,
  examQuestions,
  answersById,
  correctById,
  totalAnswered,
  totalQuestions,
  mistake,
  maxMistakes,
}: UseExamFinishArgs) {
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timerRestartKey, setTimerRestartKey] = useState(0);
  const [finishResult, setFinishResult] = useState<FinishExamResponse | null>(
    null,
  );
  const [frozenElapsed, setFrozenElapsed] = useState<number | null>(null);
  const [hydratedQuestions, setHydratedQuestions] = useState<
    ExamQuestion[] | null
  >(null);
  const finishCalledRef = useRef(false);
  const [guestStartMs] = useState(() => Date.now());

  const examFinished = totalAnswered >= totalQuestions || isTimeUp;
  const examFailed = mistake > maxMistakes;
  const examEnded = examFinished || examFailed;

  const readElapsed = useCallback(
    () =>
      getExamClock({ createdAt, endDate, fallbackStartMs: guestStartMs })
        .elapsedSeconds,
    [createdAt, endDate, guestStartMs],
  );

  if (examEnded && frozenElapsed == null) {
    setFrozenElapsed(readElapsed());
  } else if (!examEnded && frozenElapsed != null) {
    setFrozenElapsed(null);
  }

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
  }, []);

  useEffect(() => {
    if (!(examFinished || examFailed) || !attemptId || finishCalledRef.current) {
      return;
    }
    finishCalledRef.current = true;
    finishExam(attemptId)
      .then((result) => {
        setFinishResult(result);
      })
      .catch(() => {
        setFinishResult({
          completedAt: new Date().toISOString(),
          passed: false,
          durationSeconds: 0,
        });
      });
  }, [examFinished, examFailed, attemptId]);

  useEffect(() => {
    if (!examEnded || !attemptId || !finishResult) return;

    let cancelled = false;
    getAttempt(attemptId)
      .then((data) => {
        if (cancelled) return;
        const full = normalizeQuestions(data.questions);
        setHydratedQuestions(full.length ? full : examQuestions);
      })
      .catch(() => {
        if (!cancelled) setHydratedQuestions(examQuestions);
      });

    return () => {
      cancelled = true;
    };
  }, [examEnded, attemptId, finishResult, examQuestions]);

  const wrongQuestions: ExamReviewItem[] = useMemo(
    () =>
      getExamReviewItems(
        examQuestions,
        answersById,
        correctById,
        attemptId ? hydratedQuestions : examQuestions,
      ),
    [examQuestions, answersById, correctById, attemptId, hydratedQuestions],
  );

  const reviewReady = !attemptId || hydratedQuestions != null;

  const resetFinish = useCallback(() => {
    setIsTimeUp(false);
    setFinishResult(null);
    setHydratedQuestions(null);
    finishCalledRef.current = false;
    setTimerRestartKey((k) => k + 1);
  }, []);

  return {
    isTimeUp,
    setIsTimeUp,
    timerRestartKey,
    finishResult,
    elapsedSeconds: frozenElapsed ?? 0,
    examFinished,
    examFailed,
    examEnded,
    handleTimeUp,
    wrongQuestions,
    reviewReady,
    resetFinish,
  };
}
