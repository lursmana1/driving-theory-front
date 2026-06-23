import { EXAM_DURATION_SECONDS } from "@/CONSTS/QuizExamConstats";

export function isActiveExamEndDate(endDate?: string | null): boolean {
  if (!endDate) return false;
  const end = new Date(endDate).getTime();
  return end > Date.now();
}

export function formatExamDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Prefer client elapsed time; normalize backend ms/seconds mistakes. */
export function resolveExamDurationSeconds(
  elapsedClient: number,
  backend?: number | null,
): number {
  if (elapsedClient > 0) {
    return Math.min(EXAM_DURATION_SECONDS, elapsedClient);
  }
  if (!backend || backend <= 0) return 0;
  if (backend > EXAM_DURATION_SECONDS * 2) {
    return Math.min(EXAM_DURATION_SECONDS, Math.floor(backend / 1000));
  }
  return Math.min(EXAM_DURATION_SECONDS, backend);
}

export function getExamStartedAt(
  endDate?: string | null,
  fallbackNow = Date.now(),
): number {
  if (endDate) {
    return new Date(endDate).getTime() - EXAM_DURATION_SECONDS * 1000;
  }
  return fallbackNow;
}

export function computeElapsedExamSeconds(startedAt: number): number {
  return Math.min(
    EXAM_DURATION_SECONDS,
    Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
  );
}
