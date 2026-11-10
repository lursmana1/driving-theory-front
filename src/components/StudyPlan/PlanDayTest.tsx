"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ExamQuestion } from "@/lib/types/exam";
import { getExamRules } from "@/CONSTS/categories";
import {
  PLAN_TEST_IMAGE_SLOT,
  PLAN_TEST_REPEAT_LESSONS_SHARE,
  PLAN_TEST_LOW_TIME_SECONDS,
  PLAN_TEST_NEXT_DELAY_MS,
  PLAN_TEST_SECONDS_PER_QUESTION,
} from "@/CONSTS/studyPlan";
import type { DayTestResult } from "@/lib/types/studyPlan";
import { getAnswers } from "@/utills/helpers/getAnswers";
import { formatExamDuration } from "@/utills/helpers/formatExamDuration";
import { usePracticeAnswers } from "@/utills/helpers/hooks/usePracticeAnswers";
import useAnswerKeyboard from "@/utills/helpers/hooks/useAnswerKeyboard";
import useArrowNavigation from "@/utills/helpers/hooks/useArrowNavigation";
import {
  dayTestAllowedMistakes,
  dayTestStars,
} from "@/utills/helpers/studyPlanProgress";
import { getExamReviewItems } from "@/utills/helpers/examReview";
import QuestionImage from "@/components/QuestionImage/QuestionImage";
import ExamAnswerButtons from "@/components/ExamQuiz/ExamAnswerButtons";
import ExamReview from "@/components/ExamQuiz/ExamReview";
import ExamImagePreloader from "@/components/ExamQuiz/ExamImagePreloader";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { LineIcon } from "@/components/Icon/LineIcon";
import { PlanProgressBar, PlanStat } from "./PlanPrimitives";

type PlanDayTestProps = {
  categoryId: number;
  questions: ExamQuestion[];
  /** Graded try + the ids answered wrong or left open. */
  onResult: (result: DayTestResult, wrongIds: number[]) => void;
  onBack: () => void;
  /** Opens the day's mistakes round (after a failed try). */
  onFixMistakes: () => void;
  /** Back to the day's first lesson (after a bad try). */
  onRepeatLessons: () => void;
};

/** New order for every try, so answers aren't remembered by position. */
function shuffled<T>(list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Phase = "intro" | "running" | "result" | "review";

/**
 * Day test "like the exam": a timer (1 min per question), free navigation
 * (dots, back/next, change an answer), no explanations until the end. The
 * answers are saved and graded when the test is finished; unanswered
 * questions count as mistakes. Allowed mistakes: the category's exam ratio
 * made stricter (dayTestAllowedMistakes). Only a passed try closes the day;
 * a failed one sends the user to the day's mistakes, and every try comes
 * in a new order.
 */
export function PlanDayTest({
  categoryId,
  questions: initialQuestions,
  onResult,
  onBack,
  onFixMistakes,
  onRepeatLessons,
}: PlanDayTestProps) {
  const t = useTranslations("StudyPlan");
  const { recordAnswer } = usePracticeAnswers();
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState(initialQuestions);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const autoNextTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const total = questions.length;
  /** One picture slot for the whole test, so its height never changes. */
  const anyImage = useMemo(
    () => questions.some((q) => !!q.hasImg && !!q.img),
    [questions],
  );
  const allowed = dayTestAllowedMistakes(total, getExamRules(categoryId));
  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const unanswered = total - answeredCount;

  const correct = useMemo(
    () =>
      questions.filter((q) => answers[String(q.id)] === q.correct_answer)
        .length,
    [questions, answers],
  );
  const mistakes = total - correct;
  const passed = mistakes <= allowed;
  /** Answered wrong (unanswered ones have nothing to walk through). */
  const reviewItems = useMemo(
    () => getExamReviewItems(questions, answers, {}),
    [questions, answers],
  );

  const finish = useCallback(() => {
    if (phase !== "running") return;
    clearTimeout(autoNextTimer.current);
    for (const q of questions) {
      const picked = answers[String(q.id)];
      if (picked) void recordAnswer(Number(q.id), picked);
    }
    const wrongIds = questions
      .filter((q) => answers[String(q.id)] !== q.correct_answer)
      .map((q) => Number(q.id));
    onResult({ correct, total, passed }, wrongIds);
    setPhase("result");
    window.scrollTo({ top: 0 });
  }, [
    phase,
    questions,
    answers,
    recordAnswer,
    onResult,
    correct,
    total,
    passed,
  ]);

  const start = () => {
    clearTimeout(autoNextTimer.current);
    const at = Date.now();
    // Every try (also after leaving and coming back) gets a new order.
    setQuestions(shuffled(initialQuestions));
    setAnswers({});
    setIndex(0);
    setNow(at);
    setDeadline(at + total * PLAN_TEST_SECONDS_PER_QUESTION * 1000);
    setPhase("running");
  };

  // Latest `finish` for the clock callback (it runs outside render).
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // Clock: one tick a second while running; time up finishes the test.
  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => {
      const at = Date.now();
      setNow(at);
      if (at >= deadline) finishRef.current();
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, deadline]);
  const secondsLeft = Math.ceil((deadline - now) / 1000);

  const goTo = useCallback(
    (i: number) => setIndex(Math.min(total - 1, Math.max(0, i))),
    [total],
  );
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  // Only while answering; the review has its own arrows.
  useArrowNavigation(
    phase === "running" ? prev : undefined,
    phase === "running" ? next : undefined,
  );

  // Pending auto-next must not fire after unmount.
  useEffect(() => () => clearTimeout(autoNextTimer.current), []);

  const pick = useCallback(
    (key: string) => {
      if (!question) return;
      const id = String(question.id);
      const first = !answers[id];
      const nextAnswers = { ...answers, [id]: key };
      setAnswers(nextAnswers);
      // First answer moves on to the next unanswered question; a changed
      // answer stays put.
      if (!first) return;
      clearTimeout(autoNextTimer.current);
      const from = index;
      autoNextTimer.current = setTimeout(() => {
        const open = (q: ExamQuestion) => !nextAnswers[String(q.id)];
        const after = questions.findIndex((q, i) => i > from && open(q));
        const target = after !== -1 ? after : questions.findIndex(open);
        if (target !== -1) setIndex(target);
      }, PLAN_TEST_NEXT_DELAY_MS);
    },
    [question, answers, index, questions],
  );

  const answerOptions = useMemo(
    () => (question ? getAnswers(question) : []),
    [question],
  );
  useAnswerKeyboard(phase !== "running" || !question, answerOptions, pick);

  if (phase === "intro") {
    return (
      <div className="space-y-5 rounded-panel border border-line bg-surface p-5 text-center shadow-card sm:p-7">
        <div className="grid grid-cols-3 gap-2">
          <PlanStat value={total} label={t("questionsUnit")} />
          <PlanStat
            value={Math.ceil((total * PLAN_TEST_SECONDS_PER_QUESTION) / 60)}
            label={t("testMinutes")}
          />
          <PlanStat value={allowed} label={t("testMistakesUnit")} />
        </div>
        <p className="text-sm text-fg-muted">{t("testIntro")}</p>
        <button
          type="button"
          onClick={start}
          className={`h-12 px-8 text-base shadow-raised ${examCtaPillBase}`}
        >
          {t("testStart")}
        </button>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="flex flex-col overflow-hidden rounded-card shadow-card">
        <ExamReview items={reviewItems} onDone={() => setPhase("result")} />
      </div>
    );
  }

  if (phase === "result") {
    const stars = dayTestStars(mistakes, allowed);
    const wrongAnswered = reviewItems.length;
    const tooMany = mistakes > total * PLAN_TEST_REPEAT_LESSONS_SHARE;
    return (
      <div className="space-y-4 rounded-panel border border-line bg-surface p-5 text-center shadow-card sm:p-7">
        <div
          role="img"
          aria-label={`${stars}/3`}
          className="flex justify-center gap-1"
        >
          {[0, 1, 2].map((i) => (
            <LineIcon
              key={i}
              name="star"
              filled={i < stars}
              className={`h-9 w-9 ${i < stars ? "text-warning" : "text-line-strong"}`}
            />
          ))}
        </div>
        <p className="text-3xl font-bold tabular-nums text-fg">
          {correct}
          <span className="text-lg font-medium text-fg-subtle">/{total}</span>
        </p>
        <p
          className={`text-sm font-semibold ${passed ? "text-success" : "text-danger"}`}
        >
          {passed ? t("testPassed") : t("testFailed")}
        </p>
        <p className="text-sm text-fg-muted">
          {t("testNeeded", { need: total - allowed, total })}
          {!passed &&
            ` ${tooMany ? t("testFailedRepeat") : t("testFailedFix")}`}
        </p>
        <div className="flex flex-col flex-wrap justify-center gap-2 pt-1 sm:flex-row">
          {!passed && tooMany && (
            <button
              type="button"
              onClick={onRepeatLessons}
              className={`h-11 px-6 text-sm ${examCtaPillBase}`}
            >
              {t("repeatLessons")}
            </button>
          )}
          {!passed && (
            <button
              type="button"
              onClick={onFixMistakes}
              className={`h-11 px-6 text-sm ${
                tooMany ? outlinePillBase : examCtaPillBase
              }`}
            >
              {t("fixDayMistakes")}
            </button>
          )}
          {wrongAnswered > 0 && (
            <button
              type="button"
              onClick={() => setPhase("review")}
              className={`h-11 px-6 text-sm ${
                passed ? examCtaPillBase : outlinePillBase
              }`}
            >
              {t("testReview")} ({wrongAnswered})
            </button>
          )}
          <button
            type="button"
            onClick={start}
            className={`h-11 px-6 ${outlinePillBase}`}
          >
            {t("testRetry")}
          </button>
          <button
            type="button"
            onClick={onBack}
            className={`h-11 px-6 ${outlinePillBase}`}
          >
            {t("testBack")}
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const id = String(question.id);
  const hasImage = !!question.hasImg && !!question.img;
  const lowTime = secondsLeft <= PLAN_TEST_LOW_TIME_SECONDS;
  const navButton =
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-fg-muted hover:bg-surface-muted disabled:opacity-30";

  // Every control sits above the question, and the picture slot has a fixed
  // height, so nothing moves when the next question (with or without a
  // picture, with a longer text) comes in.
  return (
    <div className="relative space-y-3">
      <ExamImagePreloader questions={questions} currentIndex={index} />
      <div className="space-y-2 rounded-card border border-line bg-surface px-3 py-2 shadow-card sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            aria-label={t("testPrev")}
            className={navButton}
          >
            <LineIcon name="arrowLeft" className="h-4 w-4" />
          </button>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 font-mono text-base font-bold tabular-nums ${lowTime ? "text-danger" : "text-fg"}`}
            aria-label={t("testTimeLeft")}
          >
            <LineIcon name="timer" className="h-5 w-5" />
            {formatExamDuration(secondsLeft)}
          </span>
          <PlanProgressBar
            value={answeredCount}
            max={total}
            className="h-1.5 min-w-8 flex-1"
          />
          <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
            {t("questionOf", { n: index + 1, total })}
          </span>
          <button
            type="button"
            onClick={next}
            disabled={index >= total - 1}
            aria-label={t("testNext")}
            className={navButton}
          >
            <LineIcon name="arrowRight" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={finish}
            className={`h-9 shrink-0 px-4 text-sm ${
              unanswered > 0 ? outlinePillBase : examCtaPillBase
            }`}
          >
            {t("testFinish")}
          </button>
        </div>
        <nav
          aria-label={t("testNavigator")}
          className="flex flex-wrap justify-center gap-1"
        >
          {questions.map((q, i) => {
            const done = !!answers[String(q.id)];
            const current = i === index;
            return (
              <button
                key={String(q.id)}
                type="button"
                onClick={() => goTo(i)}
                aria-label={t("questionOf", { n: i + 1, total })}
                aria-current={current ? "step" : undefined}
                className={`h-7 w-7 rounded-full text-2xs font-semibold tabular-nums transition-colors ${
                  current
                    ? "bg-accent text-on-accent"
                    : done
                      ? "bg-accent-soft text-fg"
                      : "border border-line bg-surface text-fg-faint hover:bg-surface-muted"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="overflow-hidden rounded-card bg-stage shadow-card">
        <div className="px-3 pt-3 sm:px-4">
          {anyImage && (
            <div
              className={`mb-3 flex items-center justify-center ${PLAN_TEST_IMAGE_SLOT}`}
            >
              {hasImage && question.img && (
                <QuestionImage
                  key={id}
                  src={question.img}
                  alt={question.question || ""}
                  className="max-h-full"
                  priority
                />
              )}
            </div>
          )}
          <p className="mb-3 min-h-28 rounded-control border border-stage-line bg-stage-deep/60 p-3 font-medium text-stage-fg sm:p-4">
            {question.question}
          </p>
        </div>
        <ExamAnswerButtons
          answers={answerOptions}
          selectedAnswer={answers[id] ?? null}
          onSelect={pick}
        />
      </div>
    </div>
  );
}
