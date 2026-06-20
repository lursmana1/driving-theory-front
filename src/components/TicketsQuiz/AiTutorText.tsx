"use client";

import { useEffect, useRef, useState } from "react";

type AiTutorTextProps = {
  text: string;
  label: string;
};

const CHAR_MS = 18;

export function AiTutorText({ text, label }: AiTutorTextProps) {
  const [open, setOpen] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!open) return;

    setDisplayed("");
    setDone(false);

    let i = 0;
    let last = 0;

    const step = (ts: number) => {
      if (!last) last = ts;
      const elapsed = ts - last;
      const target = Math.min(text.length, Math.floor(elapsed / CHAR_MS));

      if (target > i) {
        i = target;
        setDisplayed(text.slice(0, i));
      }

      if (i < text.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [open, text]);

  return (
    <div className="rounded-md border border-white/30 bg-black/30 text-white/90 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 p-3 text-left text-sm font-medium transition hover:bg-white/5"
      >
        <span
          className="inline-block transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-1l-2 7h-4l-2-7H7a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4Z" />
          </svg>
          {label}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <p className="font-georgian text-sm leading-relaxed">
            {displayed}
            {!done && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-violet-400 align-middle" />}
          </p>
        </div>
      )}
    </div>
  );
}
