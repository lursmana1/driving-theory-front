"use client";

import { useMemo, useState } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import { ExamHistoryQuestionModal } from "@/components/Modals/ExamHistoryQuestionModal";

type WeakQuestion = {
  questionId: number;
  wrongCount: number;
  question: unknown;
};

type WeakQuestionsChartProps = {
  data: WeakQuestion[];
  maxWrongCount?: number;
  title: string;
  questionLabel: string;
  wrongLabel: string;
};

export function WeakQuestionsChart({
  data,
  maxWrongCount,
  title,
  questionLabel,
  wrongLabel,
}: WeakQuestionsChartProps) {
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);
  const [answersById, setAnswersById] = useState<Record<string, string>>({});

  const maxCount =
    maxWrongCount ?? Math.max(...data.map((d) => d.wrongCount), 1);

  const selectedItem = useMemo(
    () => data.find((item) => item.questionId === openQuestionId) ?? null,
    [data, openQuestionId],
  );

  const selectedQuestion = useMemo(() => {
    const q = selectedItem?.question as Partial<ExamQuestion> | undefined;
    if (!q || typeof q !== "object") return null;
    if (q.id == null || typeof q.question !== "string") return null;
    return q as ExamQuestion;
  }, [selectedItem]);

  const handleSelect = (questionId: string, key: string) => {
    setAnswersById((prev) => {
      if (prev[questionId]) return prev;
      return { ...prev, [questionId]: key };
    });
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.questionId} className="group">
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setOpenQuestionId(item.questionId)}
                  className="truncate text-left font-medium text-slate-700 underline-offset-2 hover:text-blue-700 hover:underline"
                >
                  {questionLabel} #{item.questionId}
                </button>
                <span className="shrink-0 rounded bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
                  {item.wrongCount} {wrongLabel}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-rose-400 to-rose-500 transition-all duration-500"
                  style={{ width: `${(item.wrongCount / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ExamHistoryQuestionModal
        open={openQuestionId != null}
        question={selectedQuestion}
        selectedAnswer={
          selectedQuestion
            ? answersById[String(selectedQuestion.id)] ?? null
            : null
        }
        onSelect={handleSelect}
        onClose={() => setOpenQuestionId(null)}
      />
    </>
  );
}
