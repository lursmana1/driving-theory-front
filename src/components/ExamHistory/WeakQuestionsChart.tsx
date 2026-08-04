"use client";

import { Link } from "@/i18n/navigation";
import {
  getQuestionPreview,
  getQuestionTicketPath,
} from "@/utills/helpers/questionLinks";

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
  const maxCount =
    maxWrongCount ?? Math.max(...data.map((d) => d.wrongCount), 1);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-3">
        {data.map((item) => {
          const preview = getQuestionPreview(item.question);
          const href = getQuestionTicketPath(item.questionId, item.question);

          return (
            <div key={item.questionId} className="group">
              <div className="mb-1 flex items-start justify-between gap-2 text-sm">
                <Link
                  href={href}
                  className="min-w-0 flex-1 text-left font-medium text-slate-700 underline-offset-2 hover:text-blue-700 hover:underline"
                >
                  <span className="text-slate-500">
                    {questionLabel} #{item.questionId}
                  </span>
                  {preview ? (
                    <span className="mt-0.5 block text-slate-800">{preview}</span>
                  ) : null}
                </Link>
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
          );
        })}
      </div>
    </div>
  );
}
