import { Link } from "@/i18n/navigation";
import landingLeaderboard from "@/data/landingLeaderboard.json";
import { LANDING } from "@/CONSTS/landing";
import type { LandingLeaderboardRow } from "@/types/landingData";

const MEDAL: Record<string, string> = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

const rows = landingLeaderboard as LandingLeaderboardRow[];

type Props = {
  badge: string;
  title: string;
  subtitle: string;
  viewAll: string;
};

export function LandingLeaderboardPreview({
  badge,
  title,
  subtitle,
  viewAll,
}: Props) {
  return (
    <div className="flex w-full flex-col rounded-2xl border border-white/8 bg-[#121826] p-8 text-white shadow-2xl shadow-black/50 md:p-10">
      <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/45 bg-[#0a0f18] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-amber-200/95">
        <span className="text-sm" aria-hidden>
          🏆
        </span>
        {badge}
      </div>
      <h3 className={LANDING.headingPanelTitle}>{title}</h3>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-slate-400 md:text-lg">
        {subtitle}
      </p>
      <ul className="mt-10 flex flex-col gap-3.5">
        {rows.map((row) => (
          <li
            key={row.rank}
            className={`flex items-center justify-between gap-4 rounded-xl px-5 py-4 ${
              row.medal === "bronze"
                ? "border border-amber-600/40 bg-linear-to-r from-amber-950/50 via-amber-950/25 to-transparent shadow-[0_0_24px_-6px_rgba(245,158,11,0.22)]"
                : "border border-white/6 bg-[#1a2234]/90"
            }`}
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="text-2xl leading-none" aria-hidden>
                {MEDAL[row.medal] ?? "•"}
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-base font-semibold text-white">
                  {row.user}
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-400">{row.sub}</p>
              </div>
            </div>
            <span className="shrink-0 text-2xl font-bold tabular-nums tracking-tight text-white">
              {row.pct}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/leaderboard"
        className="mt-8 text-center text-base font-medium text-sky-400 transition hover:text-sky-300 hover:underline"
      >
        {viewAll}
      </Link>
    </div>
  );
}
