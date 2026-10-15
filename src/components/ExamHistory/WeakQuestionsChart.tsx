"use client";

import { Link } from "@/i18n/navigation";
import type { OverviewWeakQuestion } from "@/lib/types/userStats";
import {
  getQuestionPreview,
  getQuestionTicketPath,
} from "@/utills/helpers/questionLinks";

type WeakQuestionsChartProps = {
  data: OverviewWeakQuestion[];
  maxWrongCount?: number;
  categoryId?: number;
  title: string;
  questionLabel: string;
  wrongLabel: string;
};

export function WeakQuestionsChart({
  data,
  maxWrongCount,
  categoryId,
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
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <h2 className="mb-4 text-lg font-semibold text-fg">{title}</h2>
      <div className="space-y-3">
        {data.map((item) => {
          const preview = getQuestionPreview(item.question, 200);
          const href = getQuestionTicketPath(
            item.questionId,
            item.question,
            categoryId,
          );

          return (
            <div key={item.questionId} className="group">
              <div className="mb-2 space-y-2">
                <Link
                  href={href}
                  className="block min-w-0 text-left underline-offset-2 hover:text-accent hover:underline"
                >
                  <span className="text-xs font-medium text-fg-subtle sm:text-sm">
                    {questionLabel} #{item.questionId}
                  </span>
                  {preview ? (
                    <span className="mt-1 block text-sm leading-relaxed text-fg sm:text-base">
                      {preview}
                    </span>
                  ) : null}
                </Link>
                <span className="inline-flex rounded-xs bg-danger-muted px-2 py-1 text-xs font-medium text-danger-strong">
                  {item.wrongCount} {wrongLabel}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-linear-to-r from-danger to-danger transition-all duration-500"
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
