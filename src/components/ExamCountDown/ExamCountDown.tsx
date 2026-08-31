"use client";

import { useEffect, useState } from "react";
import { getExamClock } from "@/utills/helpers/formatExamDuration";

type ExamTimerProps = {
  initialSeconds: number;
  endDate?: string | null;
  createdAt?: string | null;
  paused?: boolean;
  onTimeUp: () => void;
};

function formatTime(secondsLeft: number) {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ExamCountDown({
  initialSeconds,
  endDate,
  createdAt,
  paused = false,
  onTimeUp,
}: ExamTimerProps) {
  const [guestStartMs] = useState(() => Date.now());
  const [nowMs, setNowMs] = useState(() => Date.now());

  const remaining = getExamClock({
    createdAt,
    endDate,
    durationSeconds: initialSeconds,
    fallbackStartMs: guestStartMs,
    now: nowMs,
  }).remainingSeconds;

  useEffect(() => {
    if (paused) return;

    let notified = false;
    const sync = () => {
      const nextNow = Date.now();
      const left = getExamClock({
        createdAt,
        endDate,
        durationSeconds: initialSeconds,
        fallbackStartMs: guestStartMs,
        now: nextNow,
      }).remainingSeconds;
      setNowMs(nextNow);
      if (left === 0 && !notified) {
        notified = true;
        onTimeUp();
      }
    };

    const frame = window.requestAnimationFrame(sync);
    const id = window.setInterval(sync, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [paused, createdAt, endDate, initialSeconds, guestStartMs, onTimeUp]);

  return <span className="text-yellow-300">{formatTime(remaining)}</span>;
}
