export type TrainerStat = {
  label: string;
  value: number;
  tone: "danger" | "neutral" | "success";
};

const TONES: Record<TrainerStat["tone"], { box: string; value: string }> = {
  danger: { box: "border-danger-muted bg-danger-soft", value: "text-danger" },
  neutral: { box: "border-line bg-surface-muted", value: "text-fg" },
  success: {
    box: "border-success-muted bg-success-soft",
    value: "text-success-strong",
  },
};

type TrainerSummaryBarProps = {
  stats: TrainerStat[];
};

/** Three count boxes — the trainer page and the profile card pass their own. */
export function TrainerSummaryBar({ stats }: TrainerSummaryBarProps) {
  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((s) => (
        // Number first on screen, label first in the markup (dt before dd).
        <div
          key={s.label}
          className={`flex flex-col-reverse items-center justify-end gap-1 rounded-card border px-2 py-3 text-center sm:items-start sm:px-4 sm:text-left ${TONES[s.tone].box}`}
        >
          <dt className="text-balance text-xs font-medium leading-tight text-fg-muted">
            {s.label}
          </dt>
          <dd
            className={`text-2xl font-bold leading-none tabular-nums sm:text-3xl ${TONES[s.tone].value}`}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
