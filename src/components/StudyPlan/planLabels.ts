"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getSubjectName } from "@/CONSTS/subjects";
import type { PlanDay, PlanLesson } from "@/lib/types/studyPlan";
import { formatPlanDayShort } from "./planDates";

/** Short plan date in the page locale ("Thu, 5 Nov"). */
export function usePlanDateFormat() {
  const locale = useLocale();
  return useCallback(
    (day: string) => formatPlanDayShort(day, locale),
    [locale],
  );
}

/** "Subject · 2/3" for a lesson split into parts, else the subject name. */
export function useLessonTitle() {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  return useCallback(
    (lesson: Pick<PlanLesson, "subjectId" | "part" | "parts">) =>
      lesson.parts > 1
        ? t("lessonTitle", {
            subject: getSubjectName(lesson.subjectId, locale),
            part: lesson.part,
            parts: lesson.parts,
          })
        : getSubjectName(lesson.subjectId, locale),
    [t, locale],
  );
}

/** Distinct subject names of a day, in order (parts of one subject merge). */
export function useDayTopics() {
  const locale = useLocale();
  return useCallback(
    (day: Pick<PlanDay, "lessons">) => [
      ...new Set(day.lessons.map((l) => getSubjectName(l.subjectId, locale))),
    ],
    [locale],
  );
}
