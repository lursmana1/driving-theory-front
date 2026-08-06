"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { ExamQuestion } from "@/lib/types/exam";
import {
  getQuestionPreview,
  getQuestionTicketPath,
} from "@/utills/helpers/questionLinks";

import { resolveSubjectDisplayName } from "@/CONSTS/subjects";
import { useLocale } from "next-intl";

type WeakSubject = {
  subjectId: number;
  wrongCount: number;
  correctCount: number;
  totalQuestions: number;
  name?: string;
};

type WeakQuestion = {
  questionId: number;
  wrongCount: number;
  question: unknown;
};

type SubjectInfo = {
  id: number;
  name: string;
};

type WeakSubjectsChartProps = {
  data: WeakSubject[];
  subjects: SubjectInfo[];
  weakQuestions?: WeakQuestion[];
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
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function WeakSubjectsChart({
  data,
  subjects,
  weakQuestions = [],
  title,
  questionLabel = "Question",
  wrongLabel,
  correctLabel,
  totalLabel = "total",
  unansweredLabel,
}: WeakSubjectsChartProps) {
  const locale = useLocale();
  const [openSubjectIds, setOpenSubjectIds] = useState<Set<number>>(() => new Set());

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
    const map = new Map<number, WeakQuestion[]>();
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-2">
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
                  className="w-full px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <span className="flex min-w-0 items-start gap-2">
                      <ChevronIcon open={isOpen} />
                      <span
                        className="truncate text-sm font-medium text-slate-700"
                        title={getSubjectName(item.subjectId, item)}
                      >
                        {getSubjectName(item.subjectId, item)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-wrap justify-end gap-2 text-xs">
                      <span className="rounded bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
                        {wrong} {wrongLabel}
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                        {correct} {correctLabel}
                      </span>
                      {unansweredLabel != null && unanswered > 0 && (
                        <span className="rounded bg-slate-200 px-2 py-0.5 font-medium text-slate-600">
                          {unanswered} {unansweredLabel}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
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
                  <div className="mt-1 text-xs text-slate-500">
                    {pool} {totalLabel}
                    {hasQuestions ? (
                      <span className="ml-2 text-slate-400">
                        · {subjectQuestions.length} {questionLabel.toLowerCase()}
                      </span>
                    ) : null}
                  </div>
                </button>
              ) : (
                <div className="px-3 py-3">
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span
                      className="truncate text-sm font-medium text-slate-700"
                      title={getSubjectName(item.subjectId, item)}
                    >
                      {getSubjectName(item.subjectId, item)}
                    </span>
                    <span className="flex shrink-0 flex-wrap justify-end gap-2 text-xs">
                      <span className="rounded bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
                        {wrong} {wrongLabel}
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                        {correct} {correctLabel}
                      </span>
                      {unansweredLabel != null && unanswered > 0 && (
                        <span className="rounded bg-slate-200 px-2 py-0.5 font-medium text-slate-600">
                          {unanswered} {unansweredLabel}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-linear-to-r from-rose-400 to-rose-500 transition-all duration-500"
                      style={{ width: `${wrongPct}%` }}
                    />
                    <div
                      className="bg-linear-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${correctPct}%` }}
                    />
                    <div
                      className="bg-linear-to-r from-slate-300 to-slate-400 transition-all duration-500"
                      style={{ width: `${unansweredPct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {pool} {totalLabel}
                  </div>
                </div>
              )}

              {hasQuestions && isOpen && (
                <ul
                  id={panelId}
                  role="region"
                  aria-labelledby={`weak-subject-trigger-${item.subjectId}`}
                  className="space-y-1 border-t border-slate-200 bg-white px-3 py-2"
                >
                  {subjectQuestions.map((wq) => {
                    const preview = getQuestionPreview(wq.question, 64);
                    const href = getQuestionTicketPath(
                      wq.questionId,
                      wq.question,
                    );

                    return (
                      <li key={wq.questionId}>
                        <Link
                          href={href}
                          className="block rounded-md py-1 text-xs text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
                        >
                          <span className="font-medium text-slate-700">
                            #{wq.questionId}
                          </span>
                          {preview ? (
                            <span className="ml-1.5 text-slate-600">
                              {preview}
                            </span>
                          ) : null}
                          <span className="ml-1.5 text-rose-600">
                            · {wq.wrongCount} {wrongLabel}
                          </span>
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
