"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getCardLesson } from "@/api/studyPlans";
import { getSubjectName } from "@/CONSTS/subjects";
import { SUBJECT_SIGN_GROUP } from "@/CONSTS/studyPlan";
import { usePlanRequest } from "@/utills/helpers/hooks/usePlanRequest";
import { PlanLessonRunner } from "./PlanLessonRunner";
import { PlanLoadError } from "./PlanPrimitives";

/** Sign subjects in teaching order (the prototype only has sign cards). */
const SIGN_SUBJECTS = Object.keys(SUBJECT_SIGN_GROUP).map(Number);

type Props = { categoryId: number };

/** Prototype page: one card lesson for a sign subject. */
export default function PlanLessonPreviewClient({ categoryId }: Props) {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  const [subjectId, setSubjectId] = useState<number>(SIGN_SUBJECTS[0]);
  const [from, setFrom] = useState(0);

  const request = usePlanRequest(
    `${categoryId}:${subjectId}:${from}:${locale}`,
    () => getCardLesson(categoryId, subjectId, from, locale),
  );
  const lesson = request.data;
  const nextFrom = lesson ? lesson.from + lesson.cards.length : 0;
  const hasMore = !!lesson && nextFrom < lesson.totalCards;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-fg">{t("cardLessonTitle")}</h1>
        <p className="rounded-control bg-warning-soft px-3 py-2 text-sm text-fg-muted">
          {t("prototypeNote")}
        </p>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          {t("subjectLabel")}
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(Number(e.target.value));
              setFrom(0);
            }}
            className="rounded-control border border-line bg-surface px-2 py-1.5 text-fg"
          >
            {SIGN_SUBJECTS.map((id) => (
              <option key={id} value={id}>
                {getSubjectName(id, locale)}
              </option>
            ))}
          </select>
        </label>
      </header>

      {request.error ? (
        <PlanLoadError onRetry={request.retry} />
      ) : !lesson ? (
        <p className="text-fg-subtle">{t("loading")}</p>
      ) : (
        <PlanLessonRunner
          key={`${subjectId}:${from}`}
          lesson={lesson}
          onNextCards={hasMore ? () => setFrom(nextFrom) : undefined}
        />
      )}
    </main>
  );
}
