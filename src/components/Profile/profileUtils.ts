import type { AttemptCounts, AttemptsHistoryResponse } from "@/api/examAttempts";
import { EXAM_DURATION_SECONDS } from "@/CONSTS/QuizExamConstats";

/** createdAt/completedAt mix UTC and Georgia local; strip UTC+4 when present. */
const GEORGIA_OFFSET_SECONDS = 4 * 60 * 60;

export const EMPTY_ATTEMPT_COUNTS: AttemptCounts = {
  total: 0,
  passed: 0,
  failed: 0,
  incomplete: 0,
  passRate: 0,
};

export const EMPTY_ATTEMPTS_PAGE: AttemptsHistoryResponse = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  counts: EMPTY_ATTEMPT_COUNTS,
};

function elapsedSecondsBetween(startMs: number, endMs: number): number {
  let seconds = Math.round(Math.abs(endMs - startMs) / 1000);
  if (seconds > EXAM_DURATION_SECONDS) {
    const withoutOffset = seconds - GEORGIA_OFFSET_SECONDS;
    if (withoutOffset >= 0 && withoutOffset <= EXAM_DURATION_SECONDS) {
      seconds = withoutOffset;
    } else {
      seconds = Math.min(seconds, EXAM_DURATION_SECONDS);
    }
  }
  return seconds;
}

/** Elapsed seconds from createdAt and completedAt (not the 30-minute endDate). */
export function resolveAttemptDurationSeconds(attempt: {
  durationSeconds: number | null;
  createdAt: string;
  completedAt?: string | null;
}): number | null {
  if (!attempt.completedAt) {
    return attempt.durationSeconds != null && attempt.durationSeconds > 0
      ? attempt.durationSeconds
      : null;
  }

  const start = Date.parse(attempt.createdAt);
  const end = Date.parse(attempt.completedAt);
  if (Number.isFinite(start) && Number.isFinite(end)) {
    return elapsedSecondsBetween(start, end);
  }

  return attempt.durationSeconds;
}

export function formatExamDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function profileInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function topByWrongCount<T extends { wrongCount: number }>(
  items: T[],
  limit = 5,
): T[] {
  return [...items]
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, limit);
}
