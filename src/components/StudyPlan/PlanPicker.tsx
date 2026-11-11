"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { isAxiosError } from "axios";
import { getPlanPreview } from "@/api/studyPlans";
import { licenseCategories } from "@/CONSTS/categories";
import {
  STUDY_PLAN_MAX_DAYS,
  STUDY_PLAN_MIN_DAYS,
  STUDY_PLAN_PRESET_DAYS,
  STUDY_PLAN_RECOMMENDED_DAYS,
} from "@/CONSTS/studyPlan";
import type { PlanLengthError, StudyPlanPreview } from "@/lib/types/studyPlan";
import { examCtaPillBase } from "@/layoutComponents/Header/headerStyles";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { usePlanRequest } from "@/utills/helpers/hooks/usePlanRequest";
import { useStudyDay } from "@/utills/helpers/hooks/useStudyDay";
import { PlanDayList } from "./PlanDayList";
import { PlanNote, PlanStat } from "./PlanPrimitives";
import { PlanSaveNotice, type PlanSaveState } from "./PlanSaveNotice";
import { addPlanDays, formatPlanDayLong } from "./planDates";
import { LineIcon } from "@/components/Icon/LineIcon";

type PlanPickerProps = {
  initialCategoryId: number;
  onStart: (preview: StudyPlanPreview) => void;
  save: PlanSaveState;
};

function lengthError(err: unknown): PlanLengthError | null {
  if (!isAxiosError(err)) return null;
  const reason = (err.response?.data as { reason?: string } | undefined)
    ?.reason;
  return reason === "too-soon" || reason === "too-far" ? reason : null;
}

const INTENSIVE_DAYS = STUDY_PLAN_PRESET_DAYS[0];

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-fg">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
        {n}
      </span>
      {children}
    </p>
  );
}

/** Exam date first, presets under it; live preview of the day list. */
export function PlanPicker({
  initialCategoryId,
  onStart,
  save,
}: PlanPickerProps) {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [examDay, setExamDay] = useState("");
  const [days, setDays] = useState<number>(STUDY_PLAN_RECOMMENDED_DAYS);
  const request = usePlanRequest(`${categoryId}:${examDay || days}`, () =>
    getPlanPreview(categoryId, examDay ? { examDay } : { days }),
  );
  const preview = request.data;
  const rangeError = request.error ? lengthError(request.error) : null;
  const today = useStudyDay();

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="space-y-6 rounded-panel border border-line bg-surface p-4 shadow-card sm:p-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
        <div className="space-y-3">
          <StepTitle n={1}>{t("categoryLabel")}</StepTitle>
          <div
            role="group"
            aria-label={t("categoryLabel")}
            className="flex flex-wrap gap-1.5"
          >
            {licenseCategories.map((c) => {
              const active = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  aria-pressed={active}
                  className={`h-9 min-w-11 rounded-control border px-3 text-sm font-semibold transition-colors ${
                    active
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface text-fg-muted hover:bg-surface-muted"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <StepTitle n={2}>{t("examDateLabel")}</StepTitle>
          <input
            type="date"
            aria-label={t("examDateLabel")}
            value={examDay}
            min={addPlanDays(today, STUDY_PLAN_MIN_DAYS)}
            max={addPlanDays(today, STUDY_PLAN_MAX_DAYS)}
            onChange={(e) => setExamDay(e.target.value)}
            className={`block h-12 w-full rounded-control border bg-surface px-3 text-base text-fg ${
              examDay ? "border-accent" : "border-line"
            }`}
          />
          <p className="text-xs text-fg-subtle">
            {examDay
              ? t("examOn", { date: formatPlanDayLong(examDay, locale) })
              : t("examDateHint")}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-fg-muted">{t("orPreset")}</p>
          <div className="grid grid-cols-3 gap-2">
            {STUDY_PLAN_PRESET_DAYS.map((n) => {
              const active = !examDay && days === n;
              const note =
                n === INTENSIVE_DAYS
                  ? t("presetIntensive")
                  : n === STUDY_PLAN_RECOMMENDED_DAYS
                    ? t("presetRecommended")
                    : t("presetDurable");
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setExamDay("");
                    setDays(n);
                  }}
                  aria-pressed={active}
                  className={`relative flex flex-col items-center rounded-card border px-2 py-3 transition-colors ${
                    active
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <span className="text-2xl font-bold tabular-nums text-fg">
                    {n}
                  </span>
                  <span className="text-xs text-fg-muted">{t("daysUnit")}</span>
                  <span
                    className={`mt-1 text-2xs font-medium ${
                      n === STUDY_PLAN_RECOMMENDED_DAYS
                        ? "text-accent"
                        : "text-fg-faint"
                    }`}
                  >
                    {note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5 lg:col-span-3">
        {request.loading && <ProfileSectionSpinner label={t("loading")} />}

        {request.error != null && (
          <div className="space-y-3 rounded-card border border-line bg-surface p-5 text-center">
            <p className={`text-sm ${rangeError ? "text-fg" : "text-danger"}`}>
              {rangeError === "too-soon"
                ? t("tooSoon")
                : rangeError === "too-far"
                  ? t("tooFar", { max: STUDY_PLAN_MAX_DAYS })
                  : t("error")}
            </p>
            {!rangeError && (
              <button
                type="button"
                onClick={request.retry}
                className={`h-10 px-5 text-sm ${examCtaPillBase}`}
              >
                {t("retry")}
              </button>
            )}
          </div>
        )}

        {preview && (
          <>
            <div className="space-y-4 rounded-panel border border-line bg-surface p-4 shadow-card sm:p-5">
              <div className="grid grid-cols-3 gap-2">
                <PlanStat value={preview.dayCount} label={t("daysUnit")} />
                <PlanStat
                  value={preview.totalQuestions}
                  label={t("questionsUnit")}
                />
                <PlanStat
                  value={`~${preview.minutesPerDayAvg}`}
                  label={t("minutesUnit")}
                />
              </div>
              {preview.mode === "short" && preview.optionalQuestions > 0 && (
                <PlanNote>
                  {t("shortPlanNote", { count: preview.optionalQuestions })}
                </PlanNote>
              )}
              {preview.daysForTargetMinutes != null &&
                preview.dayCount < preview.daysForTargetMinutes && (
                  <PlanNote>
                    {t("longerPlanHint", {
                      minutes: preview.targetMinutes,
                      days: preview.daysForTargetMinutes,
                    })}
                  </PlanNote>
                )}
              {preview.intensive && (
                <p className="rounded-control bg-warning-soft px-3 py-2 text-sm text-fg">
                  {t("intensiveWarning")}
                </p>
              )}
              <button
                type="button"
                onClick={() => onStart(preview)}
                className={`inline-flex h-12 w-full items-center justify-center gap-2 text-base shadow-raised ${examCtaPillBase}`}
              >
                {t("startPlan")}
                <LineIcon name="arrowRight" className="h-5 w-5" />
              </button>
              <PlanSaveNotice {...save} className="text-center" />
            </div>
            <PlanDayList days={preview.days} />
          </>
        )}
      </section>
    </div>
  );
}
