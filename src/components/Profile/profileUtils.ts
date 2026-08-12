import type { AttemptSummary } from "@/api/examAttempts";
import type { AttemptsHistoryResponse } from "@/api/examAttempts";

export const EMPTY_ATTEMPTS_PAGE: AttemptsHistoryResponse = {
  data: [],
  total: 0,
  page: 1,
  totalPages: 1,
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

export function computeAttemptStats(attempts: AttemptSummary[]) {
  const passed = attempts.filter((a) => a.passed === true).length;
  const failed = attempts.filter((a) => a.passed === false).length;
  const unfinished = attempts.filter((a) => a.passed == null).length;
  const decided = passed + failed;
  const passRate = decided > 0 ? Math.round((passed / decided) * 100) : 0;
  return { passed, failed, unfinished, passRate };
}

export function topByWrongCount<T extends { wrongCount: number }>(
  items: T[],
  limit = 5,
): T[] {
  return [...items]
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, limit);
}
