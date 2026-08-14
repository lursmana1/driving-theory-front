import type { AttemptCounts, AttemptsHistoryResponse } from "@/api/examAttempts";

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
