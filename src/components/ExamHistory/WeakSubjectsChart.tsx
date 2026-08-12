"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { ExamQuestion } from "@/lib/types/exam";
import type {
  OverviewWeakQuestion,
  OverviewWeakSubject,
} from "@/lib/types/userStats";
import {
  getQuestionPreview,
  getQuestionTicketPath,
} from "@/utills/helpers/questionLinks";

import { resolveSubjectDisplayName } from "@/CONSTS/subjects";
import { useLocale } from "next-intl";

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
  totalLabel?: string;
  unansweredLabel?: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StatBadges({
  wrong,
  correct,
  unanswered,
  wrongLabel,
  correctLabel,
  unansweredLabel,
}: {
  wrong: number;
  correct: number;
  unanswered: number;
  wrongLabel: string;
  correctLabel: string;
  unansweredLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">
        {wrong} {wrongLabel}
      </span>
      <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
        {correct} {correctLabel}
      </span>
      {unansweredLabel != null && unanswered > 0 && (
        <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
          {unanswered} {unansweredLabel}
        </span>
      )}
    </div>
  );
}

function ProgressBar({
  wrongPct,
  correctPct,
  unansweredPct,
  wrongLabel,
  correctLabel,
  wrong,
  correct,
  unanswered,
  unansweredLabel,
}: {
  wrongPct: number;
  correctPct: number;
  unansweredPct: number;
  wrongLabel: string;
  correctLabel: string;
  wrong: number;
  correct: number;
  unanswered: number;
  unansweredLabel?: string;
}) {
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 sm:h-3">
      <div
        className="bg-linear-to-r from-rose-400 to-rose-500 transition-all duration-500"
        style={{ width: `${wrongPct}%` }}
        title={`${wrongLabel}: ${wrong}`}
      />
      <div
        className="bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
        style={{ width: `${correctPct}%` }}
        title={`${correctLabel}: ${correct}`}
      />
      <div
        className="bg-linear-to-r from-slate-300 to-slate-400 transition-all duration-500"
        style={{ width: `${unansweredPct}%` }}
        title={
          unansweredLabel
            ? `${unansweredLabel}: ${unanswered}`
            : `${unanswered}`
        }
      />
    </div>
  );
}

export function WeakSubjectsChart({
  data,
  subjects,
  weakQuestions = [],
  categoryId,
  title,
  questionLabel = "Question",
  wrongLabel,
  correctLabel,
  totalLabel = "total",
  unansweredLabel,
}: WeakSubjectsChartProps) {
  const locale = useLocale();
  const [openSubjectIds, setOpenSubjectIds] = useState<Set<number>>(
    () => new Set(),
  );

  const toggleSubject = (subjectId: number) => {
    setOpenSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  };

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
        {data.map((item) => {
          const wrong = Math.max(0, Number(item.wrongCount) || 0);
          const correct = Math.max(0, Number(item.correctCount) || 0);
          const pool = Math.max(0, Number(item.totalQuestions) || 0);
          const unanswered = Math.max(0, pool - wrong - correct);

          const wrongPct = pool > 0 ? (wrong / pool) * 100 : 0;
          const correctPct = pool > 0 ? (correct / pool) * 100 : 0;
          const unansweredPct = pool > 0 ? (unanswered / pool) * 100 : 0;
          const subjectQuestions = questionsBySubject.get(item.subjectId) ?? [];
          const isOpen = openSubjectIds.has(item.subjectId);
          const hasQuestions = subjectQuestions.length > 0;
          const panelId = `weak-subject-panel-${item.subjectId}`;
          const subjectName = getSubjectName(item.subjectId, item);

          const body = (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                {hasQuestions ? <ChevronIcon open={isOpen} /> : null}
                <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-slate-800 sm:text-base">
                  {subjectName}
                </p>
              </div>

              <StatBadges
                wrong={wrong}
                correct={correct}
                unanswered={unanswered}
                wrongLabel={wrongLabel}
                correctLabel={correctLabel}
                unansweredLabel={unansweredLabel}
              />

              <ProgressBar
                wrongPct={wrongPct}
                correctPct={correctPct}
                unansweredPct={unansweredPct}
                wrongLabel={wrongLabel}
                correctLabel={correctLabel}
                wrong={wrong}
                correct={correct}
                unanswered={unanswered}
                unansweredLabel={unansweredLabel}
              />

              <p className="text-xs text-slate-500 sm:text-sm">
                {pool} {totalLabel}
                {hasQuestions ? (
                  <span className="text-slate-400">
                    {" "}
                    · {subjectQuestions.length} {questionLabel.toLowerCase()}
                  </span>
                ) : null}
              </p>
            </div>
          );

          return (
            <div
              key={item.subjectId}
              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50"
            >
              {hasQuestions ? (
                <button
                  type="button"
                  id={`weak-subject-trigger-${item.subjectId}`}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleSubject(item.subjectId)}
                  className="w-full px-3 py-3.5 text-left transition hover:bg-slate-50 sm:px-4"
                >
                  {body}
                </button>
              ) : (
                <div className="px-3 py-3.5 sm:px-4">{body}</div>
              )}

              {hasQuestions && isOpen && (
                <ul
                  id={panelId}
                  role="region"
                  aria-labelledby={`weak-subject-trigger-${item.subjectId}`}
                  className="space-y-2 border-t border-slate-200 bg-white px-3 py-3 sm:px-4"
                >
                  {subjectQuestions.map((wq) => {
                    const preview = getQuestionPreview(wq.question, 500);
                    const href = getQuestionTicketPath(
                      wq.questionId,
                      wq.question,
                      categoryId,
                    );

                    return (
                      <li key={wq.questionId}>
                        <Link
                          href={href}
                          className="block rounded-lg border border-slate-100 bg-slate-50/80 p-3 transition hover:border-sky-200 hover:bg-sky-50/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="shrink-0 text-sm font-semibold text-slate-800">
                              #{wq.questionId}
                            </span>
                            <span className="shrink-0 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                              {wq.wrongCount} {wrongLabel}
                            </span>
                          </div>
                          {preview ? (
                            <p className="mt-2 text-sm leading-relaxed text-slate-700">
                              {preview}
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
