"use client";

type WeakSubject = {
  subjectId: number;
  wrongCount: number;
  correctCount: number;
  totalQuestions: number;
};

type SubjectInfo = {
  id: number;
  name: string;
};

type WeakSubjectsChartProps = {
  data: WeakSubject[];
  subjects: SubjectInfo[];
  title: string;
  wrongLabel: string;
  correctLabel: string;
  totalLabel?: string;
  /** Label for total − wrong − correct (gray segment). */
  unansweredLabel?: string;
};

export function WeakSubjectsChart({
  data,
  subjects,
  title,
  wrongLabel,
  correctLabel,
  totalLabel = "total",
  unansweredLabel,
}: WeakSubjectsChartProps) {
  const getSubjectName = (id: number) =>
    subjects.find((s) => s.id === id)?.name ?? `#${id}`;

  if (data.length === 0) {
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
