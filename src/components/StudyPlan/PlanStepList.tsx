"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type {
  PlanDayStep,
  PlanLesson,
  SavedStudyPlan,
} from "@/lib/types/studyPlan";
import {
  isStepComplete,
  isStepRequired,
} from "@/utills/helpers/studyPlanProgress";
import { PLAN_STEP_PARAM } from "@/CONSTS/studyPlan";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { LineIcon } from "@/components/Icon/LineIcon";
import { useLessonTitle } from "./planLabels";
import { STEP_ICON, STEP_LABEL } from "./planSteps";

type PlanStepListProps = {
  plan: SavedStudyPlan;
  dayIndex: number;
  steps: PlanDayStep[];
  lessonById: ReadonlyMap<string, PlanLesson>;
  /** The day's next required step (filled node + button). */
  nextStep: number | undefined;
  signedIn: boolean;
  onStart: (stepIndex: number) => void;
};

/** The day path: one node per step on a vertical line. */
export function PlanStepList({
  plan,
  dayIndex,
  steps,
  lessonById,
  nextStep,
  signedIn,
  onStart,
}: PlanStepListProps) {
  const t = useTranslations("StudyPlan");
  const lessonTitle = useLessonTitle();
  const dayTest = plan.tests[String(dayIndex)];

  return (
    <ol>
      {steps.map((step, i) => {
        const done = isStepComplete(plan, dayIndex, i, step.kind);
        const isNext = i === nextStep;
        const isLast = i === steps.length - 1;
        const lesson = step.lessonId
          ? lessonById.get(step.lessonId)
          : undefined;
        const optional = !isStepRequired(step.kind);
        const test = step.kind === "test" ? dayTest : undefined;
        return (
          <li key={i} className="flex gap-3 sm:gap-4">
            <div className="relative flex w-11 shrink-0 justify-center">
              {!isLast && (
                <span
                  className={`absolute top-11 bottom-0 w-0.5 ${
                    done ? "bg-success" : "bg-line"
                  }`}
                  aria-hidden
                />
              )}
              <span
                className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-lg ${
                  done
                    ? "bg-success font-bold text-on-accent"
                    : isNext
                      ? "bg-accent text-on-accent shadow-glow"
                      : "border border-line bg-surface text-fg-muted"
                }`}
                aria-hidden
              >
                <LineIcon
                  name={done ? "check" : STEP_ICON[step.kind]}
                  className="h-5 w-5"
                  strokeWidth={done ? 3 : 2}
                />
              </span>
            </div>
            <div
              className={`mb-3 flex min-w-0 flex-1 flex-col gap-3 rounded-card border p-4 sm:flex-row sm:items-center ${
                isNext
                  ? "border-accent bg-surface shadow-raised"
                  : "border-line bg-surface"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">
                  {t(STEP_LABEL[step.kind])}
                  {optional && (
                    <span className="ml-2 rounded-full bg-surface-sunken px-2 py-0.5 text-2xs font-medium text-fg-subtle">
                      {t("stepOptional")}
                    </span>
                  )}
                </p>
                {lesson && (
                  <p className="text-sm text-fg-muted">{lessonTitle(lesson)}</p>
                )}
                <p className="mt-0.5 text-xs text-fg-subtle">
                  {step.kind === "review"
                    ? signedIn
                      ? t("reviewBody")
                      : t("reviewGuest")
                    : step.kind === "exam"
                      ? t("examBody")
                      : step.cardCount
                        ? t("stepCardsQuestions", {
                            cards: step.cardCount,
                            count: step.questionCount,
                          })
                        : t("stepQuestions", { count: step.questionCount })}
                  {test &&
                    ` · ${t("testResult", { correct: test.correct, total: test.total })}`}
                </p>
              </div>
              <StepAction
                step={step}
                done={done}
                primary={isNext}
                categoryId={plan.categoryId}
                signedIn={signedIn}
                planStep={`${dayIndex}.${i}`}
                onStart={() => onStart(i)}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type StepActionProps = {
  step: PlanDayStep;
  done: boolean;
  /** The day's next required step gets the filled button. */
  primary: boolean;
  categoryId: number;
  signedIn: boolean;
  /** `<day>.<step>`: the exam / trainer page marks it done when finished. */
  planStep: string;
  onStart: () => void;
};

/**
 * Learn / mix / test run here; review and exam open their own pages, which
 * mark the step done only once the review / exam is finished.
 */
function StepAction({
  step,
  done,
  primary,
  categoryId,
  signedIn,
  planStep,
  onStart,
}: StepActionProps) {
  const t = useTranslations("StudyPlan");
  const className = `inline-flex h-10 shrink-0 items-center justify-center px-5 text-sm ${
    primary ? examCtaPillBase : outlinePillBase
  }`;

  if (step.kind === "review" || step.kind === "exam") {
    const back = `${PLAN_STEP_PARAM}=${planStep}`;
    const href =
      step.kind === "review"
        ? signedIn
          ? `/practice?category=${categoryId}&${back}`
          : "/auth"
        : `/exam?category=${categoryId}&${back}`;
    return (
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link href={href} className={className}>
          {step.kind === "review" ? t("reviewOpen") : t("examOpen")}
        </Link>
      </div>
    );
  }

  return (
    <button type="button" onClick={onStart} className={className}>
      {done ? t("stepAgain") : t("stepStart")}
    </button>
  );
}
