"use client";

import { Fragment, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/Icon/Icon";
import type { Sign } from "@/lib/types/signs";
import { useMediaQuery } from "@/utills/helpers/hooks/useMediaQuery";
import SignLinkedText from "./SignLinkedText";

type SignGridProps = {
  signs: Sign[];
  labelOf: (s: Sign) => string;
  /** slug of the sign whose panel is open */
  selected: string | null;
  onSelect: (slug: string | null) => void;
};

const PANEL_ID = "sign-panel";

/**
 * Signs 2 / 3 / 4 per row; a click opens the sign's explanation in a full-width panel right under its row.
 * Every explanation is also in the page (hidden) so search engines read the whole group.
 */
export default function SignGrid({ signs, labelOf, selected, onSelect }: SignGridProps) {
  const t = useTranslations("SignsPage");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const cols = isLg ? 4 : isMd ? 3 : 2;
  const panelRef = useRef<HTMLLIElement>(null);

  const index = signs.findIndex((s) => s.slug === selected);
  const open = index >= 0 ? signs[index] : null;
  // the panel goes after the last sign of the clicked sign's row
  const rowEnd = open ? Math.min(signs.length - 1, Math.floor(index / cols) * cols + cols - 1) : -1;

  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSelect(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onSelect]);

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {signs.map((s, i) => {
        const active = s.slug === selected;
        const label = labelOf(s);
        return (
          <Fragment key={s.slug}>
            <li id={s.slug} className="scroll-mt-44">
              <button
                type="button"
                onClick={() => onSelect(active ? null : s.slug)}
                aria-expanded={active}
                aria-controls={active ? PANEL_ID : undefined}
                className={`relative flex h-full w-full flex-col items-center rounded-card border p-3 text-center transition duration-200 ${
                  active
                    ? "border-accent bg-accent-soft shadow-raised"
                    : "border-line bg-surface shadow-card hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised"
                }`}
              >
                <span className="absolute left-2 top-2 rounded-xs bg-inverse px-1.5 py-0.5 font-mono text-2xs font-semibold text-fg-inverse">
                  {s.number}
                </span>
                <span className="flex aspect-4/3 w-full items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sign */}
                  <img
                    src={s.image}
                    alt={label}
                    width={180}
                    height={135}
                    loading={i < 8 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="mt-2 line-clamp-3 wrap-anywhere text-sm font-medium leading-5 text-fg">{label}</span>
              </button>
              {/* the explanation, for search engines; shown in the panel below */}
              <div hidden>
                {s.description.split("\n").map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </li>

            {open && i === rowEnd ? (
              <li id={PANEL_ID} ref={panelRef} className="col-span-full scroll-mt-44">
                <SignPanel sign={open} label={labelOf(open)} onClose={() => onSelect(null)} closeLabel={t("close")} />
              </li>
            ) : null}
          </Fragment>
        );
      })}
    </ul>
  );
}

function SignPanel({
  sign,
  label,
  onClose,
  closeLabel,
}: {
  sign: Sign;
  label: string;
  onClose: () => void;
  closeLabel: string;
}) {
  const t = useTranslations("SignsPage");
  const langNote = t("contentLangNote");

  return (
    <div className="rounded-panel border border-accent-muted bg-surface-muted p-4 shadow-raised sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        <div
          className={`flex shrink-0 items-center justify-center self-center rounded-card border border-line bg-surface p-5 sm:self-start ${
            sign.wide ? "aspect-2/1 w-full sm:w-80" : "aspect-square w-44 sm:w-56"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sign */}
          <img
            src={sign.image}
            alt={label}
            width={sign.wide ? 320 : 224}
            height={sign.wide ? 160 : 224}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-control bg-inverse px-2.5 py-1 font-mono text-base font-bold text-fg-inverse">
              {sign.number}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface transition hover:bg-surface-sunken"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <h3 className="text-lg font-bold text-fg sm:text-xl">{label}</h3>
          {sign.numbers.length > 1 ? (
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-fg-subtle">
              {t("covers")}
              {sign.numbers.map((n) => (
                <span key={n} className="rounded-xs bg-surface-sunken px-1.5 py-0.5 font-mono text-fg-muted">
                  {n}
                </span>
              ))}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 text-body text-fg-muted">
            {sign.description.split("\n").map((p, i) => (
              <p key={i}>
                <SignLinkedText text={p} exceptSlug={sign.slug} />
              </p>
            ))}
          </div>
          {langNote ? <p className="text-xs text-fg-faint">{langNote}</p> : null}
        </div>
      </div>
    </div>
  );
}
