"use client";

import { useMemo } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import type {
  OverviewWeakQuestion,
  OverviewWeakSubject,
} from "@/lib/types/userStats";
import { resolveSubjectDisplayName } from "@/CONSTS/subjects";
import { useLocale } from "next-intl";
import { WeakSubjectRow } from "@/components/ExamHistory/WeakSubjectRow";

type SubjectInfo = {
  id: number;
  name: string;
};

type WeakSubjectsChartProps = {
  data: OverviewWeakSubject[];
  subjects: SubjectInfo[];
  weakQuestions?: OverviewWeakQuestion[];
  categoryId?: number;
  title: string;
  questionLabel?: string;
  wrongLabel: string;
  correctLabel: string;
  unansweredLabel?: string;
};

export function WeakSubjectsChart({
  data,
  subjects,
  weakQuestions = [],
  categoryId,
  title,
  questionLabel = "Question",
  wrongLabel,
  correctLabel,
  unansweredLabel,
}: WeakSubjectsChartProps) {
  const locale = useLocale();

  const getSubjectName = (id: number, item?: { name?: string }) =>
    resolveSubjectDisplayName(
      id,
      item?.name ?? subjects.find((s) => s.id === id)?.name,
      locale,
    );

  const questionsBySubject = useMemo(() => {
    const map = new Map<number, OverviewWeakQuestion[]>();
    for (const item of weakQuestions) {
      const q = item.question as Partial<ExamQuestion> | undefined;
      const subjectId = q?.subject;
      if (subjectId == null) continue;
      const list = map.get(subjectId) ?? [];
      list.push(item);
      map.set(subjectId, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => b.wrongCount - a.wrongCount);
    }
    return map;
  }, [weakQuestions]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">
        {title}
      </h2>
      <div className="space-y-3">
        {data.map((item) => (
          <WeakSubjectRow
            key={item.subjectId}
            item={item}
            subjectName={getSubjectName(item.subjectId, item)}
            questions={questionsBySubject.get(item.subjectId) ?? []}
            categoryId={categoryId}
            questionLabel={questionLabel}
            wrongLabel={wrongLabel}
            correctLabel={correctLabel}
            unansweredLabel={unansweredLabel}
          />
        ))}
      </div>
    </div>
  );
}
