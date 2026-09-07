"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon/Icon";

type AiTutorTextProps = {
  text: string;
  label: string;
};

const CHAR_MS = 18;

export function AiTutorText({ text, label }: AiTutorTextProps) {
  const [open, setOpen] = useState(false);
  /** Tagged with the text it belongs to, so a different `text` restarts from 0 without an effect */
  const [typed, setTyped] = useState({ text: "", chars: 0 });
  const rafRef = useRef(0);

  const chars = typed.text === text ? typed.chars : 0;
  const done = chars >= text.length;

  const toggle = () => {
    setOpen((o) => !o);
    setTyped({ text: "", chars: 0 });
  };

  useEffect(() => {
    if (!open) return;

    let i = 0;
    let last = 0;

    const step = (ts: number) => {
      if (!last) last = ts;
      const elapsed = ts - last;
      const target = Math.min(text.length, Math.floor(elapsed / CHAR_MS));

      if (target > i) {
        i = target;
        setTyped({ text, chars: i });
      }

      if (i < text.length) {
        rafRef.current = requestAnimationFrame(step);
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
        onClick={toggle}
        className="flex w-full items-center gap-2 p-3 text-left text-sm font-medium transition hover:bg-white/5"
      >
        <span
          className="inline-block transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="sparkle" className="h-4 w-4" />
          {label}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <p className="font-georgian text-sm leading-relaxed">
            {text.slice(0, chars)}
            {!done && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle" />}
          </p>
        </div>
      )}
    </div>
  );
}
