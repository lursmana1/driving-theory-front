"use client";

import { useTranslations } from "next-intl";
import type { TrainerAnswerState } from "@/utills/helpers/hooks/useTrainerSession";

const DOT: Record<TrainerAnswerState, string> = {
  correct: "border-success bg-success text-on-accent",
  wrong: "border-danger bg-danger text-on-accent",
  saving: "border-line-strong bg-surface-strong text-fg",
  open: "border-line bg-surface text-fg-muted hover:border-line-strong",
};

type TrainerProgressProps = {
  states: TrainerAnswerState[];
  current: number;
  onSelect: (index: number) => void;
};

/** Answered share + one numbered dot per question (click to open it). */
export function TrainerProgress({
  states,
  current,
  onSelect,
}: TrainerProgressProps) {
  const t = useTranslations("Trainer");
  const answered = states.filter((s) => s !== "open").length;
  const percent = states.length ? (answered / states.length) * 100 : 0;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-fg-muted">
        <span>{t("answeredCount", { answered, total: states.length })}</span>
        <span className="tabular-nums">{Math.round(percent)}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={states.length}
        aria-valuenow={answered}
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ol className="flex flex-wrap gap-1.5">
        {states.map((state, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={t("questionN", { n: i + 1 })}
              aria-current={i === current ? "step" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-xs border text-xs font-bold tabular-nums transition ${DOT[state]} ${
                i === current ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas" : ""
              }`}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
