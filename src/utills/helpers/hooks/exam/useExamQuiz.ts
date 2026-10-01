import { useCallback, useMemo, useState } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import type { CategoryExamRules } from "@/CONSTS/categories";
import { MEDIA_BELOW_LG } from "@/CONSTS/breakpoints";
import { getAnswers } from "@/utills/helpers/getAnswers";
import useArrowNavigation from "@/utills/helpers/hooks/useArrowNavigation";
import useAnswerKeyboard from "@/utills/helpers/hooks/useAnswerKeyboard";
import { useMediaQuery } from "@/utills/helpers/hooks/useMediaQuery";
import { useSwipeable } from "@/utills/helpers/hooks/useSwipeable";
import { useExamProgress } from "@/utills/helpers/hooks/useExamProgress";
import { useQuestionNavigation } from "@/utills/helpers/hooks/useQuizNavigation";
import { useAutoAdvance } from "./useAutoAdvance";
import { useExamFinish } from "./useExamFinish";
import { useExamAnswer } from "./useExamAnswer";

export function useExamQuiz(
  questions: ExamQuestion[],
  attemptId?: number | null,
  endDate?: string | null,
  onRestart?: () => void,
  examRules?: CategoryExamRules,
  createdAt?: string | null,
) {
  const safeQuestions = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions],
  );

  const [answersById, setAnswersById] = useState<Record<string, string>>({});
  const [correctById, setCorrectById] = useState<Record<string, boolean>>({});

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

  const finish = useExamFinish({
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
  });

  const nav = useQuestionNavigation(examQuestions.length, finish.examEnded);
  useArrowNavigation(nav.prev, nav.next);

  const q = examQuestions[nav.index];
  const qId = q ? String(q.id) : "";
  const selectedAnswer = answersById[qId] ?? null;
  const answers = q ? getAnswers(q) : [];

  const { handleSelect } = useExamAnswer({
    q,
    qId,
    selectedAnswer,
    examFinished: finish.examFinished,
    examFailed: finish.examFailed,
    navIndex: nav.index,
    questionCount: examQuestions.length,
    autoAdvance,
    timeoutRef,
    attemptId,
    onAdvance: nav.next,
    setAnswersById,
    setCorrectById,
    setIsTimeUp: finish.setIsTimeUp,
  });

  const resetNav = nav.reset;
  const resetFinish = finish.resetFinish;

  const onReset = useCallback(() => {
    resetNav();
    setAnswersById({});
    setCorrectById({});
    resetFinish();
  }, [resetNav, resetFinish]);

  const handleRestart = useCallback(() => {
    onReset();
    onRestart?.();
  }, [onReset, onRestart]);

  const isSwipeEnabled = useMediaQuery(MEDIA_BELOW_LG);
  const swipe = useSwipeable({
    onSwipeLeft: nav.next,
    onSwipeRight: nav.prev,
    disabled: finish.examEnded || !isSwipeEnabled,
  });

  useAnswerKeyboard(finish.examEnded || !!selectedAnswer, answers, handleSelect);

  return {
    q,
    qId,
    answers,
    selectedAnswer,
    /** null while the server verdict for the current pick is still in flight. */
    selectedCorrect: qId in correctById ? correctById[qId] : null,
    nav,
    examFinished: finish.examFinished,
    examFailed: finish.examFailed,
    examEnded: finish.examEnded,
    score,
    mistake,
    isTimeUp: finish.isTimeUp,
    timerRestartKey: finish.timerRestartKey,
    handleRestart,
    handleSelect,
    handleTimeUp: finish.handleTimeUp,
    autoAdvance,
    handleAutoAdvanceChange,
    isSwipeEnabled,
    swipe,
    safeQuestions: examQuestions,
    examRules: { totalQuestions, passScore, maxMistakes },
    finishResult: finish.finishResult,
    elapsedSeconds: finish.elapsedSeconds,
    wrongQuestions: finish.wrongQuestions,
    reviewReady: finish.reviewReady,
  };
}
