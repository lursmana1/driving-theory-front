import { EXAM_DURATION_SECONDS } from "@/CONSTS/QuizExamConstats";

function parseMs(iso?: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type ExamClockInput = {
  createdAt?: string | null;
  endDate?: string | null;
  durationSeconds?: number;
  now?: number;
  /** Used only when the API sent neither createdAt nor endDate (guest exam). */
  fallbackStartMs?: number;
};

/** Wall-clock exam window from `createdAt` / `endDate`. Safe to call on every tick. */
export function getExamClock({
  createdAt,
  endDate,
  durationSeconds = EXAM_DURATION_SECONDS,
  now = Date.now(),
  fallbackStartMs,
}: ExamClockInput) {
  const createdMs = parseMs(createdAt);
  const deadlineMs = parseMs(endDate);
  const startMs =
    createdMs ??
    (deadlineMs != null
      ? deadlineMs - durationSeconds * 1000
      : (fallbackStartMs ?? now));
  const endMs = deadlineMs ?? startMs + durationSeconds * 1000;

  return {
    startMs,
    endMs,
    elapsedSeconds: clamp(Math.floor((now - startMs) / 1000), 0, durationSeconds),
    remainingSeconds: clamp(Math.floor((endMs - now) / 1000), 0, durationSeconds),
  };
}

export function isActiveExamEndDate(endDate?: string | null): boolean {
  const end = parseMs(endDate);
  return end != null && end > Date.now();
}

export function formatExamDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

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
