type PlanRingProps = {
  done: number;
  total: number;
};

/** Days-done ring for the accent hero (light strokes on the accent fill). */
export function PlanRing({ done, total }: PlanRingProps) {
  const share = total > 0 ? Math.min(1, done / total) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className="stroke-on-accent/20"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className="stroke-on-accent transition-all duration-700"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - share)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-xl font-bold tabular-nums sm:text-2xl">
          {done}
        </span>
        <span className="mt-0.5 text-2xs text-on-accent/75">/ {total}</span>
      </div>
    </div>
  );
}
