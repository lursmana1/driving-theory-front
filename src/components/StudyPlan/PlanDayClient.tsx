"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getPlanDay, getPlanPreview } from "@/api/studyPlans";
import type {
  DayTestResult,
  LessonCard,
  PlanDayStep,
  PlanLesson,
} from "@/lib/types/studyPlan";
import type { ExamQuestion } from "@/lib/types/exam";
import { useStudyPlan } from "@/utills/helpers/hooks/useStudyPlan";
import { usePlanRequest } from "@/utills/helpers/hooks/usePlanRequest";
import { useStudyDay } from "@/utills/helpers/hooks/useStudyDay";
import {
  PLAN_STEP_MISTAKES,
  usePlanStepParam,
  type PlanStepParam,
} from "@/utills/helpers/hooks/usePlanStepParam";
import { usePlanLeaveGuard } from "@/utills/helpers/hooks/usePlanLeaveGuard";
import {
  dayMistakes,
  dayStatus,
  isDayDone,
  isStepComplete,
  isStepRequired,
  openExtraStep,
} from "@/utills/helpers/studyPlanProgress";
import { signGroupHref } from "@/CONSTS/signGroups";
import { SUBJECT_SIGN_GROUP } from "@/CONSTS/studyPlan";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { LineIcon, type LineIconName } from "@/components/Icon/LineIcon";
import { PlanQuizRunner } from "./PlanQuizRunner";
import { PlanLessonRunner } from "./PlanLessonRunner";
import { PlanDayTest } from "./PlanDayTest";
import { PlanNextDay } from "./PlanNextDay";
import { PlanDayHeader } from "./PlanDayHeader";
import { PlanStepList } from "./PlanStepList";
import {
  PlanBackButton,
  PlanConfirmSheet,
  PlanLoadError,
} from "./PlanPrimitives";
import { addPlanDays } from "./planDates";
import { useLessonTitle } from "./planLabels";
import { STEP_ICON, STEP_LABEL } from "./planSteps";

type PlanDayClientProps = {
  index: number;
};

/** `active` value of the day's mistakes round (steps are 0, 1, ...). */
const MISTAKES = PLAN_STEP_MISTAKES;

/**
 * `/plan/day/[index]`: the day's steps, and the runner for the open step.
 * The open step is `?step=<i>` / `?step=mistakes` (old links: `?fix=1`), so
 * the phone's Back closes it.
 */
export default function PlanDayClient({ index }: PlanDayClientProps) {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  const { user } = useAuth();
  const { plan, ready, markStepDone, recordTest, addMistakes, fixMistake } =
    useStudyPlan();
  const today = useStudyDay();
  const lessonTitle = useLessonTitle();
  const { active, open: openStep, close: closeStep } = usePlanStepParam();
  /**
   * The mistakes round's question ids, frozen when it opens: fixing shrinks
   * the day's list, but the round keeps its questions until it is closed.
   */
  const [roundIds, setRoundIds] = useState<number[] | null>(null);
  // Left by Back (not by `close`): the frozen round must not outlive it.
  if (active !== MISTAKES && roundIds != null) setRoundIds(null);

  /** A running day test: Back and the step's back button ask first. */
  const [testRunning, setTestRunning] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const guard = usePlanLeaveGuard(testRunning, () => setConfirmLeave(true));

  /** The step to bring back into view when the day list shows again. */
  const lastOpened = useRef<number | null>(null);
  const open = useCallback(
    (step: Exclude<PlanStepParam, null>) => {
      if (typeof step === "number") lastOpened.current = step;
      openStep(step);
    },
    [openStep],
  );
  /** `toTop`: after finishing a step the day's progress is the news. */
  const close = useCallback(
    (toTop = false) => {
      if (toTop) lastOpened.current = null;
      setConfirmLeave(false);
      closeStep();
    },
    [closeStep],
  );
  const stayInTest = useCallback(() => setConfirmLeave(false), []);
  const requestClose = useCallback(() => {
    if (testRunning) setConfirmLeave(true);
    else close();
  }, [testRunning, close]);

  /**
   * An opened step starts at the top with its heading focused (screen readers
   * land on the runner); back on the list, the step's row is scrolled into
   * view and focused.
   */
  const stepHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (active != null) {
      window.scrollTo({ top: 0 });
      stepHeading.current?.focus({ preventScroll: true });
      return;
    }
    const step = lastOpened.current;
    lastOpened.current = null;
    const row =
      step == null
        ? null
        : document.querySelector<HTMLElement>(`[data-plan-step="${step}"]`);
    if (!row) {
      window.scrollTo({ top: 0 });
      return;
    }
    row.scrollIntoView({ block: "center" });
    row
      .querySelector<HTMLElement>("a, button")
      ?.focus({ preventScroll: true });
  }, [active]);

  const categoryId = plan?.categoryId;
  const dayCount = plan?.dayCount;
  const inPlan = dayCount != null && index < dayCount;
  const request = usePlanRequest(
    categoryId == null || dayCount == null || !inPlan
      ? null
      : `${categoryId}:${dayCount}:${index}:${locale}`,
    () =>
      Promise.all([
        getPlanDay(categoryId!, dayCount!, index, locale),
        getPlanPreview(categoryId!, { days: dayCount! }),
      ]),
  );
  const session = request.data?.[0] ?? null;
  const preview = request.data?.[1] ?? null;

  const questionsById = useMemo(
    () =>
      new Map<string, ExamQuestion>(
        (session?.questions ?? []).map((q) => [String(q.id), q]),
      ),
    [session],
  );
  const cardsByLesson = useMemo(() => {
    const map = new Map<string, LessonCard[]>();
    for (const card of session?.cards ?? []) {
      const list = map.get(card.lessonId);
      if (list) list.push(card);
      else map.set(card.lessonId, [card]);
    }
    return map;
  }, [session]);
  const lessonById = useMemo(
    () =>
      new Map<string, PlanLesson>(
        (session?.lessons ?? []).map((l) => [l.id, l]),
      ),
    [session],
  );
  const questionsOf = useCallback(
    (step: PlanDayStep) =>
      step.questionIds.flatMap((id) => {
        const q = questionsById.get(String(id));
        return q ? [q] : [];
      }),
    [questionsById],
  );

  // Only a passed test closes the step; its wrong answers join the day's
  // mistakes either way.
  const onTestResult = useCallback(
    (stepIndex: number, result: DayTestResult, wrongIds: number[]) =>
      recordTest(index, stepIndex, result, wrongIds),
    [index, recordTest],
  );
  const onLessonAnswer = useCallback(
    (questionId: number, correct: boolean) => {
      if (!correct) addMistakes(index, [questionId]);
    },
    [index, addMistakes],
  );
  const onMistakeAnswer = useCallback(
    (questionId: number, correct: boolean) => {
      if (correct) fixMistake(index, questionId);
    },
    [index, fixMistake],
  );

  if (!ready) return <ProfileSectionSpinner label={t("loading")} />;
  if (!plan || !inPlan) {
    return (
      <Shell>
        <Link href="/plan" className={`h-11 px-6 ${outlinePillBase}`}>
          {plan ? t("backToPlan") : t("startPlan")}
        </Link>
      </Shell>
    );
  }
  if (request.error) {
    return (
      <Shell>
        <PlanLoadError onRetry={request.retry} />
      </Shell>
    );
  }
  if (!session || !preview) {
    return <ProfileSectionSpinner label={t("loading")} />;
  }

  const days = preview.days;
  const status = dayStatus(plan, days, index, today);
  const planDay = days[index];
  const required = session.steps
    .map((step, i) => ({ step, i }))
    .filter(({ step }) => isStepRequired(step.kind));
  const requiredDone = required.filter(({ step, i }) =>
    isStepComplete(plan, index, i, step.kind),
  ).length;
  const openMistakes = dayMistakes(plan, index).flatMap((id) => {
    const q = questionsById.get(String(id));
    return q ? [q] : [];
  });
  const header = (
    <PlanDayHeader
      index={index}
      dayCount={plan.dayCount}
      date={addPlanDays(plan.startDay, index)}
      requiredDone={requiredDone}
      requiredTotal={required.length}
    />
  );

  if (status === "locked") {
    const prevDay = index > 0 ? days[index - 1] : undefined;
    return (
      <Page>
        {header}
        <div className="space-y-4 rounded-card border border-line bg-surface p-5">
          <p className="text-sm text-fg-muted">{t("dayLocked")}</p>
          {prevDay && isDayDone(plan, prevDay) && (
            <PlanNextDay
              nextDay={planDay ?? null}
              categoryId={plan.categoryId}
              mistakes={{
                dayIndex: prevDay.index,
                count: dayMistakes(plan, prevDay.index).length,
              }}
            />
          )}
        </div>
      </Page>
    );
  }

  const openMistakesRound = () => open(MISTAKES);

  if (active === MISTAKES) {
    // `?fix=1` opens the round before any click: freeze the list on first
    // render (setState during render is React's own pattern for derived state).
    const ids = roundIds ?? dayMistakes(plan, index);
    if (roundIds == null) setRoundIds(ids);
    const round = ids.flatMap((id) => {
      const q = questionsById.get(String(id));
      return q ? [q] : [];
    });
    return (
      <Page>
        <StepHeader
          backLabel={t("dayLabel", { n: index + 1 })}
          onBack={() => close()}
          icon="repeat"
          eyebrow={t("dayLabel", { n: index + 1 })}
          title={t("dayMistakesTitle")}
          headingRef={stepHeading}
        />
        {round.length === 0 ? (
          <div className="space-y-4 rounded-card border border-success bg-success-soft p-5">
            <p className="text-sm text-fg">{t("dayMistakesNone")}</p>
            <button
              type="button"
              onClick={() => close()}
              className={`h-11 px-6 text-sm ${examCtaPillBase}`}
            >
              {t("backToDay")}
            </button>
          </div>
        ) : (
          <PlanQuizRunner
            questions={round}
            onAnswered={onMistakeAnswer}
            onFinish={() => close(true)}
            finishLabel={t("backToDay")}
          />
        )}
      </Page>
    );
  }

  const activeStep =
    typeof active === "number" ? session.steps[active] : undefined;

  if (activeStep && typeof active === "number") {
    const finish = () => {
      markStepDone(index, active);
      close(true);
    };
    const lesson = activeStep.lessonId
      ? lessonById.get(activeStep.lessonId)
      : undefined;
    const signGroup = lesson ? SUBJECT_SIGN_GROUP[lesson.subjectId] : undefined;
    const signsHref = signGroup != null ? signGroupHref(signGroup) : undefined;
    const lessonCards = lesson ? cardsByLesson.get(lesson.id) : undefined;
    return (
      <Page>
        <StepHeader
          backLabel={t("dayLabel", { n: index + 1 })}
          onBack={requestClose}
          icon={STEP_ICON[activeStep.kind]}
          eyebrow={
            lesson
              ? t(STEP_LABEL[activeStep.kind])
              : t("dayLabel", { n: index + 1 })
          }
          title={lesson ? lessonTitle(lesson) : t(STEP_LABEL[activeStep.kind])}
          headingRef={stepHeading}
        />
        {activeStep.kind === "test" ? (
          <PlanDayTest
            key={active}
            categoryId={plan.categoryId}
            questions={questionsOf(activeStep)}
            onResult={(result, wrongIds) =>
              onTestResult(active, result, wrongIds)
            }
            onBack={() => close()}
            onRunningChange={setTestRunning}
            onFixMistakes={openMistakesRound}
            onRepeatLessons={() => {
              const first = session.steps.findIndex((s) => s.kind === "learn");
              if (first === -1) close(true);
              else open(first);
            }}
          />
        ) : lessonCards ? (
          <PlanLessonRunner
            key={active}
            signsHref={signsHref}
            cards={lessonCards}
            questions={questionsOf(activeStep)}
            onFinish={finish}
            onAnswered={onLessonAnswer}
          />
        ) : (
          <PlanQuizRunner
            key={active}
            questions={questionsOf(activeStep)}
            onFinish={finish}
            onAnswered={onLessonAnswer}
            intro={
              signsHref ? (
                <Link
                  href={signsHref}
                  target="_blank"
                  className="inline-flex text-sm font-medium text-accent hover:underline"
                >
                  {t("signsLink")} ↗
                </Link>
              ) : undefined
            }
          />
        )}
        <PlanConfirmSheet
          open={confirmLeave}
          title={t("testLeaveTitle")}
          body={t("testLeaveBody")}
          stayLabel={t("testLeaveStay")}
          leaveLabel={t("testLeaveGo")}
          onStay={stayInTest}
          onLeave={() => guard.leave(() => close())}
        />
      </Page>
    );
  }

  const dayDone = planDay ? isDayDone(plan, planDay) : false;
  const extraStep = openExtraStep(plan, { index, steps: session.steps });
  const nextStatus =
    index + 1 < days.length ? dayStatus(plan, days, index + 1, today) : null;
  // The next step: the first open required one; after those, the day's extra
  // round (the plan's final part) is the default next step, skip stays possible.
  const nextStep =
    required.find(({ step, i }) => !isStepComplete(plan, index, i, step.kind))
      ?.i ??
    extraStep ??
    undefined;
  const dayTest = plan.tests[String(index)];

  return (
    <Page className="space-y-6">
      {header}
      {dayDone && (
        <section className="space-y-4 rounded-panel border border-success bg-success-soft p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface text-warning shadow-card"
              aria-hidden
            >
              <LineIcon name="trophy" className="h-7 w-7" />
            </span>
            <div>
              <p className="text-lg font-bold text-fg">
                {t("dayFinishedTitle", { n: index + 1 })}
              </p>
              <p className="text-sm text-fg-muted">
                {t("dayFinishedBody", {
                  questions: planDay?.newQuestions ?? 0,
                })}
                {dayTest &&
                  ` · ${t("stepTest")}: ${dayTest.correct}/${dayTest.total}`}
              </p>
            </div>
          </div>
          {extraStep != null && (
            <div className="flex flex-col gap-3 rounded-card border border-accent/40 bg-surface p-4 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm text-fg">
                {t("extraNudge", {
                  count: session.steps[extraStep].questionCount,
                })}
              </p>
              <button
                type="button"
                onClick={() => open(extraStep)}
                className={`h-11 shrink-0 px-5 text-sm ${examCtaPillBase}`}
              >
                {t("stepStart")}
              </button>
            </div>
          )}
          {nextStatus === "open" ? (
            <Link
              href={`/plan/day/${index + 1}`}
              className={`inline-flex h-11 items-center justify-center gap-2 px-6 text-sm ${examCtaPillBase}`}
            >
              {t("openNextDay")}
              <LineIcon name="arrowRight" className="h-4 w-4" />
            </Link>
          ) : nextStatus === "locked" ? (
            <PlanNextDay
              nextDay={days[index + 1] ?? null}
              categoryId={plan.categoryId}
              mistakes={{ dayIndex: index, count: openMistakes.length }}
            />
          ) : null}
        </section>
      )}
      {openMistakes.length > 0 && !dayDone && (
        <section className="flex flex-col gap-3 rounded-card border border-warning bg-warning-soft p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-fg">
            {t("dayMistakesBody", { count: openMistakes.length })}
          </p>
          <button
            type="button"
            onClick={openMistakesRound}
            className={`h-10 shrink-0 px-5 text-sm ${outlinePillBase}`}
          >
            {t("fixDayMistakes")}
          </button>
        </section>
      )}
      <PlanStepList
        plan={plan}
        dayIndex={index}
        steps={session.steps}
        lessonById={lessonById}
        nextStep={nextStep}
        signedIn={!!user}
        onStart={open}
      />
    </Page>
  );
}

/** Back control, a small eyebrow and the step's title as the page heading. */
function StepHeader({
  backLabel,
  onBack,
  icon,
  eyebrow,
  title,
  headingRef,
}: {
  backLabel: string;
  onBack: () => void;
  icon: LineIconName;
  eyebrow: string;
  title: string;
  headingRef: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="space-y-2">
      <PlanBackButton onClick={onBack}>{backLabel}</PlanBackButton>
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
          <LineIcon name={icon} className="h-4 w-4" />
          {eyebrow}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold leading-snug text-fg outline-none sm:text-2xl"
        >
          {title}
        </h1>
      </div>
    </div>
  );
}

function Page({
  children,
  className = "space-y-4",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="section py-6 font-georgian sm:py-8">
      <div className={`mx-auto max-w-3xl ${className}`}>{children}</div>
    </main>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="section flex flex-col items-center gap-4 py-10 text-center font-georgian">
      {children}
    </main>
  );
}
