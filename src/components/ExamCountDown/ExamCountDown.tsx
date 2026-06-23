"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ExamTimerProps = {
  /** Fallback when endDate is not provided */
  initialSeconds: number;
  /** Server deadline (ISO string). Countdown to this time. */
  endDate?: string | null;
  paused?: boolean;
  onTimeUp: () => void;
  restartKey?: number;
};

function formatTime(secondsLeft: number) {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function secondsUntil(endDateIso: string): number {
  const end = new Date(endDateIso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}

function resolveInitialSeconds(
  endDate: string | null | undefined,
  initialSeconds: number,
): number {
  if (!endDate) return initialSeconds;
  const remaining = secondsUntil(endDate);
  // Stale server deadline — don't start at 0:00 and instantly fail the exam.
  return remaining > 0 ? remaining : initialSeconds;
}

export default function ExamCountDown({
  initialSeconds,
  endDate,
  paused = false,
  onTimeUp,
  restartKey = 0,
}: ExamTimerProps) {
  const computedInitial = useMemo(
    () => resolveInitialSeconds(endDate, initialSeconds),
    [endDate, initialSeconds, restartKey],
  );
  const [secondsLeft, setSecondsLeft] = useState(computedInitial);
  const onTimeUpRef = useRef(onTimeUp);
  const prevSecondsRef = useRef(computedInitial);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    const next = resolveInitialSeconds(endDate, initialSeconds);
    setSecondsLeft(next);
    prevSecondsRef.current = next;
  }, [endDate, initialSeconds, restartKey]);

  useEffect(() => {
    if (paused || secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [paused, secondsLeft]);

  useEffect(() => {
    if (prevSecondsRef.current > 0 && secondsLeft === 0) {
      onTimeUpRef.current();
    }
    prevSecondsRef.current = secondsLeft;
  }, [secondsLeft]);

  const label = useMemo(() => formatTime(secondsLeft), [secondsLeft]);

  return <span className="text-yellow-300">{label}</span>;
}
