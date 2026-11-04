"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getPlanDay, getPlanPreview } from "@/api/studyPlans";
import type {
  DayTestResult,
  PlanDayStep,
  PlanLesson,
} from "@/lib/types/studyPlan";
import type { ExamQuestion } from "@/lib/types/exam";
import { useStudyPlan } from "@/utills/helpers/hooks/useStudyPlan";
import { usePlanRequest } from "@/utills/helpers/hooks/usePlanRequest";
import { useStudyDay } from "@/utills/helpers/hooks/useStudyDay";
import {
  dayStatus,
  isDayDone,
  isStepDone,
  isStepRequired,
} from "@/utills/helpers/studyPlanProgress";
import { signGroupHref } from "@/CONSTS/signGroups";
import { SUBJECT_SIGN_GROUP } from "@/CONSTS/studyPlan";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { LineIcon } from "@/components/Icon/LineIcon";
import { PlanQuizRunner } from "./PlanQuizRunner";
import { PlanDayTest } from "./PlanDayTest";
import { PlanNextDay } from "./PlanNextDay";
import { PlanDayHeader } from "./PlanDayHeader";
import { PlanStepList } from "./PlanStepList";
import { PlanLoadError } from "./PlanPrimitives";
import { addPlanDays } from "./planDates";
import { useLessonTitle } from "./planLabels";
import { STEP_ICON, STEP_LABEL } from "./planSteps";

type PlanDayClientProps = { index: number };

function scrollToTop() {
  window.scrollTo({ top: 0 });
}

/** `/plan/day/[index]`: the day's steps, and the runner for the open step. */
export default function PlanDayClient({ index }: PlanDayClientProps) {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  const { user } = useAuth();
  const { plan, ready, markStepDone, saveTest } = useStudyPlan();
  const today = useStudyDay();
  const lessonTitle = useLessonTitle();
  const [active, setActive] = useState<number | null>(null);

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

  const onTestResult = useCallback(
    (stepIndex: number, result: DayTestResult) => {
      saveTest(index, result);
      markStepDone(index, stepIndex);
    },
    [index, saveTest, markStepDone],
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
  const requiredDone = required.filter(({ i }) =>
    isStepDone(plan, index, i),
  ).length;
  const header = (
    <PlanDayHeader
      index={index}
      dayCount={plan.dayCount}
      date={addPlanDays(plan.startDay, index)}
      minutes={planDay?.minutes ?? 0}
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
            />
          )}
        </div>
      </Page>
    );
  }

  const activeStep = active != null ? session.steps[active] : undefined;

  if (activeStep && active != null) {
    const close = () => setActive(null);
    const finish = () => {
      markStepDone(index, active);
      close();
      scrollToTop();
    };
    const lesson = activeStep.lessonId
      ? lessonById.get(activeStep.lessonId)
      : undefined;
    const signGroup = lesson ? SUBJECT_SIGN_GROUP[lesson.subjectId] : undefined;
    return (
      <Page>
        <div className="space-y-1">
          <button
            type="button"
            onClick={close}
            className="inline-flex items-center gap-1 text-sm text-fg-subtle hover:text-fg"
          >
            <LineIcon name="arrowLeft" className="h-4 w-4" />
            {t("dayLabel", { n: index + 1 })}
          </button>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-fg">
            <LineIcon
              name={STEP_ICON[activeStep.kind]}
              className="h-6 w-6 text-accent"
            />
            {t(STEP_LABEL[activeStep.kind])}
            {lesson && (
              <span className="ml-2 text-base font-medium text-fg-subtle">
                {lessonTitle(lesson)}
              </span>
            )}
          </h1>
        </div>
        {activeStep.kind === "test" ? (
          <PlanDayTest
            key={active}
            categoryId={plan.categoryId}
            questions={questionsOf(activeStep)}
            onResult={(result) => onTestResult(active, result)}
            onBack={close}
          />
        ) : (
          <PlanQuizRunner
            key={active}
            questions={questionsOf(activeStep)}
            onFinish={finish}
            intro={
              signGroup != null ? (
                <Link
                  href={signGroupHref(signGroup)}
                  target="_blank"
                  className="inline-flex text-sm font-medium text-accent hover:underline"
                >
                  {t("signsLink")} ↗
                </Link>
              ) : undefined
            }
          />
        )}
      </Page>
    );
  }

  const dayDone = planDay ? isDayDone(plan, planDay) : false;
  const nextStatus =
    index + 1 < days.length ? dayStatus(plan, days, index + 1, today) : null;
  const nextStep = required.find(({ i }) => !isStepDone(plan, index, i))?.i;
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
            />
          ) : null}
        </section>
      )}
      <PlanStepList
        plan={plan}
        dayIndex={index}
        steps={session.steps}
        lessonById={lessonById}
        nextStep={nextStep}
        signedIn={!!user}
        onStart={(i) => {
          setActive(i);
          scrollToTop();
        }}
        onMarkDone={(i) => markStepDone(index, i)}
      />
    </Page>
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
