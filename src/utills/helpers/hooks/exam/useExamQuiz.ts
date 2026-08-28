import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import type { FinishExamResponse } from "@/api/examAttempts";
import type { CategoryExamRules } from "@/CONSTS/categories";
import {
  AUTO_ADVANCE_DELAY_MS,
} from "@/CONSTS/QuizExamConstats";
import { MEDIA_BELOW_LG } from "@/CONSTS/breakpoints";
import { getAnswers } from "@/utills/helpers/getAnswers";
import useArrowNavigation from "@/utills/helpers/hooks/useArrowNavigation";
import useAnswerKeyboard from "@/utills/helpers/hooks/useAnswerKeyboard";
import { useMediaQuery } from "@/utills/helpers/hooks/useMediaQuery";
import { useSwipeable } from "@/utills/helpers/hooks/useSwipeable";
import { useExamProgress } from "@/utills/helpers/hooks/useExamProgress";
import { useQuestionNavigation } from "@/utills/helpers/hooks/useQuizNavigation";
import { useAutoAdvance } from "./useAutoAdvance";
import { useExamRestart } from "./useExamRestart";
import {
  submitAnswer,
  finishExam,
  isAttemptExpiredError,
} from "@/api/examAttempts";
import {
  computeElapsedExamSeconds,
  getExamStartedAt,
  isActiveExamEndDate,
} from "@/utills/helpers/formatExamDuration";

export function useExamQuiz(
  questions: ExamQuestion[],
  attemptId?: number | null,
  endDate?: string | null,
  onRestart?: () => void,
  examRules?: CategoryExamRules,
) {
  const safeQuestions = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions],
  );

  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timerRestartKey, setTimerRestartKey] = useState(0);
  const [answersById, setAnswersById] = useState<Record<string, string>>({});
  const [correctById, setCorrectById] = useState<Record<string, boolean>>({});
  const [finishResult, setFinishResult] = useState<FinishExamResponse | null>(
    null,
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const finishCalledRef = useRef(false);
  const activeEndDate = isActiveExamEndDate(endDate) ? endDate : null;
  const startedAtRef = useRef(getExamStartedAt(activeEndDate));

  const { autoAdvance, handleAutoAdvanceChange, timeoutRef } = useAutoAdvance();

  const totalQuestions = examRules?.totalQuestions ?? questions.length;
  const passScore = examRules?.passScore ?? totalQuestions;
  const maxMistakes = examRules?.maxMistakes ?? 0;

  const examQuestions = useMemo(
    () => safeQuestions.slice(0, totalQuestions),
    [safeQuestions, totalQuestions],
  );

  const { score, mistake, totalAnswered } = useExamProgress(
    examQuestions,
    answersById,
    correctById,
  );

  const examFinished = totalAnswered >= totalQuestions || isTimeUp;
  const examFailed = mistake > maxMistakes;
  const examEnded = examFinished || examFailed;

  const callFinish = useCallback(async () => {
    if (finishCalledRef.current || !attemptId) return;
    finishCalledRef.current = true;
    setElapsedSeconds(computeElapsedExamSeconds(startedAtRef.current));
    try {
      const result = await finishExam(attemptId);
      setFinishResult(result);
    } catch {
      setFinishResult({
        completedAt: new Date().toISOString(),
        passed: false,
        durationSeconds: 0,
      });
    }
  }, [attemptId]);

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
    callFinish();
  }, [callFinish]);

  const handleFinish = useCallback(() => {
    if (examEnded) return;
    callFinish();
    setIsTimeUp(true);
  }, [callFinish, examEnded]);

  useEffect(() => {
    startedAtRef.current = getExamStartedAt(activeEndDate);
  }, [activeEndDate, timerRestartKey]);

  useEffect(() => {
    if (examFailed) {
      setElapsedSeconds(computeElapsedExamSeconds(startedAtRef.current));
    }
  }, [examFailed]);

  useEffect(() => {
    if (examFinished && attemptId && !finishCalledRef.current) {
      callFinish();
    }
  }, [examFinished, attemptId, callFinish]);

  useEffect(() => {
    if (examFailed && attemptId && !finishCalledRef.current) {
      callFinish();
    }
  }, [examFailed, attemptId, callFinish]);

  const nav = useQuestionNavigation(examQuestions.length, examEnded);
  const navNextRef = useRef(nav.next);
  navNextRef.current = nav.next;
  useArrowNavigation(nav.prev, nav.next);

  const q = examQuestions[nav.index];
  const qId = q ? String(q.id) : "";
  const selectedAnswer = answersById[qId] ?? null;
  const answers = q ? getAnswers(q) : [];
  const answeringRef = useRef(false);

  useEffect(() => {
    answeringRef.current = false;
  }, [qId]);

  const onReset = useCallback(() => {
    nav.reset();
    setAnswersById({});
    setCorrectById({});
    setIsTimeUp(false);
    setFinishResult(null);
    setElapsedSeconds(0);
    finishCalledRef.current = false;
    startedAtRef.current = getExamStartedAt(activeEndDate);
    setTimerRestartKey((k) => k + 1);
  }, [nav.reset, activeEndDate]);

  const { handleRestart } = useExamRestart({ onReset, onRestart });

  const handleSelect = useCallback(
    (key: string) => {
      if (examFinished || examFailed) return;
      if (answeringRef.current || selectedAnswer) return;
      answeringRef.current = true;

      setAnswersById((prev) => {
        if (prev[qId]) return prev;
        return { ...prev, [qId]: key };
      });

      const answeredIndex = nav.index;
      // Hold the jump until the verdict lands, otherwise the colour never shows.
      const scheduleAdvance = () => {
        if (!autoAdvance || answeredIndex >= examQuestions.length - 1) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          answeringRef.current = false;
          navNextRef.current();
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
      nav.index,
      examQuestions.length,
      autoAdvance,
      attemptId,
      q,
    ],
  );

  const isSwipeEnabled = useMediaQuery(MEDIA_BELOW_LG);
  const swipe = useSwipeable({
    onSwipeLeft: nav.next,
    onSwipeRight: nav.prev,
    disabled: examEnded || !isSwipeEnabled,
  });

  useAnswerKeyboard(examEnded || !!selectedAnswer, answers, handleSelect);

  return {
    q,
    qId,
    answers,
    selectedAnswer,
    /** null while the server verdict for the current pick is still in flight. */
    selectedCorrect: qId in correctById ? correctById[qId] : null,
    nav,
    examFinished,
    examFailed,
    examEnded,
    score,
    mistake,
    isTimeUp,
    timerRestartKey,
    handleRestart,
    handleSelect,
    handleTimeUp,
    handleFinish,
    autoAdvance,
    handleAutoAdvanceChange,
    isSwipeEnabled,
    swipe,
    safeQuestions: examQuestions,
    examRules: { totalQuestions, passScore, maxMistakes },
    finishResult,
    elapsedSeconds,
  };
}
