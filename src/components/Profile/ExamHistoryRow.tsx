import type { AttemptSummary } from "@/api/examAttempts";
import { EXAM_HISTORY_TABLE_GRID } from "@/CONSTS/pagination";
import { formatAttemptDateTime } from "@/utills/helpers/formatDate";
import { formatExamDuration } from "@/components/Profile/profileUtils";

type ExamHistoryRowProps = {
  attempt: AttemptSummary;
  locale: string;
  categoryLabel: string;
  labels: {
    colCategory: string;
    colScore: string;
    colDuration: string;
    colResult: string;
    passed: string;
    failed: string;
    unfinished: string;
  };
};

export function ExamHistoryRow({
  attempt,
  locale,
  categoryLabel,
  labels,
}: ExamHistoryRowProps) {
  const resultLabel =
    attempt.passed === true
      ? labels.passed
      : attempt.passed === false
        ? labels.failed
        : labels.unfinished;
  const resultClass =
    attempt.passed === true
      ? "text-emerald-600"
      : attempt.passed === false
        ? "text-rose-600"
        : "text-amber-600";

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <div className="space-y-2 px-4 py-4 md:hidden">
        <time
          dateTime={attempt.completedAt ?? attempt.createdAt}
          className="block text-sm font-medium text-slate-800"
        >
          {formatAttemptDateTime(attempt, locale)}
        </time>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-slate-500">{labels.colCategory}</dt>
            <dd className="font-semibold text-slate-900">{categoryLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{labels.colScore}</dt>
            <dd className="font-semibold text-slate-900">
              {attempt.correctCount}/{attempt.questionCount}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{labels.colDuration}</dt>
            <dd className="font-medium text-slate-700">
              {formatExamDuration(attempt.durationSeconds)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-500">{labels.colResult}</dt>
            <dd className={`font-semibold ${resultClass}`}>{resultLabel}</dd>
          </div>
        </dl>
      </div>

      <div className={`hidden px-5 py-3.5 text-sm ${EXAM_HISTORY_TABLE_GRID}`}>
        <time
          dateTime={attempt.completedAt ?? attempt.createdAt}
          className="text-slate-700"
        >
          {formatAttemptDateTime(attempt, locale)}
        </time>
        <span className="font-semibold text-slate-800">{categoryLabel}</span>
        <span className="text-right font-medium tabular-nums text-slate-900">
          {attempt.correctCount}/{attempt.questionCount}
        </span>
        <span className="text-right tabular-nums whitespace-nowrap text-slate-600">
          {formatExamDuration(attempt.durationSeconds)}
        </span>
        <span className={`text-right font-medium whitespace-nowrap ${resultClass}`}>
          {resultLabel}
        </span>
      </div>
    </li>
  );
}
