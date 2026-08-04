"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import type { ExamQuestion } from "@/lib/types/exam";
import {
  getQuestionPreview,
  getQuestionTicketPath,
} from "@/utills/helpers/questionLinks";

type WeakSubject = {
  subjectId: number;
  wrongCount: number;
  correctCount: number;
  totalQuestions: number;
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
  weakQuestionsTitle?: string;
  questionLabel?: string;
  wrongLabel: string;
  correctLabel: string;
  totalLabel?: string;
  unansweredLabel?: string;
};

export function WeakSubjectsChart({
  data,
  subjects,
  weakQuestions = [],
  title,
  weakQuestionsTitle,
  questionLabel = "Question",
  wrongLabel,
  correctLabel,
  totalLabel = "total",
  unansweredLabel,
}: WeakSubjectsChartProps) {
  const getSubjectName = (id: number) =>
    subjects.find((s) => s.id === id)?.name ?? `#${id}`;

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

  const ungroupedQuestions = useMemo(() => {
    const groupedIds = new Set<number>();
    for (const list of questionsBySubject.values()) {
      for (const item of list) groupedIds.add(item.questionId);
    }
    return weakQuestions
      .filter((item) => !groupedIds.has(item.questionId))
      .sort((a, b) => b.wrongCount - a.wrongCount);
  }, [weakQuestions, questionsBySubject]);

  if (data.length === 0 && weakQuestions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-4">
        {data.map((item) => {
          const wrong = Math.max(0, Number(item.wrongCount) || 0);
          const correct = Math.max(0, Number(item.correctCount) || 0);
          const pool = Math.max(0, Number(item.totalQuestions) || 0);
          const unanswered = Math.max(0, pool - wrong - correct);

          const wrongPct = pool > 0 ? (wrong / pool) * 100 : 0;
          const correctPct = pool > 0 ? (correct / pool) * 100 : 0;
          const unansweredPct = pool > 0 ? (unanswered / pool) * 100 : 0;
          const subjectQuestions = questionsBySubject.get(item.subjectId) ?? [];

          return (
            <div key={item.subjectId} className="group">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span
                  className="truncate text-sm font-medium text-slate-700"
                  title={getSubjectName(item.subjectId)}
                >
                  {getSubjectName(item.subjectId)}
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
              </div>

              {subjectQuestions.length > 0 && (
                <ul className="mt-2 space-y-1 border-l-2 border-rose-100 pl-3">
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

      {ungroupedQuestions.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4">
          {weakQuestionsTitle ? (
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              {weakQuestionsTitle}
            </h3>
          ) : null}
          <ul className="space-y-1.5">
            {ungroupedQuestions.map((item) => {
              const preview = getQuestionPreview(item.question);
              const href = getQuestionTicketPath(item.questionId, item.question);

              return (
                <li key={item.questionId}>
                  <Link
                    href={href}
                    className="flex items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-slate-50"
                  >
                    <span className="min-w-0 text-slate-700 hover:text-blue-700">
                      <span className="font-medium">
                        {questionLabel} #{item.questionId}
                      </span>
                      {preview ? (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {preview}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                      {item.wrongCount} {wrongLabel}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {data.length === 0 && weakQuestions.length > 0 && (
        <ul className="space-y-1.5">
          {[...weakQuestions]
            .sort((a, b) => b.wrongCount - a.wrongCount)
            .map((item) => {
              const preview = getQuestionPreview(item.question);
              const href = getQuestionTicketPath(item.questionId, item.question);

              return (
                <li key={item.questionId}>
                  <Link
                    href={href}
                    className="flex items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-slate-50"
                  >
                    <span className="min-w-0 text-slate-700 hover:text-blue-700">
                      <span className="font-medium">
                        {questionLabel} #{item.questionId}
                      </span>
                      {preview ? (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {preview}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                      {item.wrongCount} {wrongLabel}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
