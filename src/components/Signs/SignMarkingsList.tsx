"use client";

import { useTranslations } from "next-intl";
import type { Sign } from "@/lib/types/signs";
import SignLinkedText from "./SignLinkedText";

/** Road markings: a single column, each road picture at full width with its explanation always shown. */
export default function SignMarkingsList({ markings }: { markings: Sign[] }) {
  const t = useTranslations("SignsPage");
  const langNote = t("contentLangNote");

  return (
    <ul className="flex max-w-4xl flex-col gap-5">
      {markings.map((m, i) => {
        const label = t("markingLabel", { number: m.number });
        return (
          <li
            key={m.slug}
            id={m.slug}
            className="scroll-mt-44 overflow-hidden rounded-card border border-line bg-surface shadow-card"
          >
            <div className="flex aspect-2/1 w-full items-center justify-center bg-surface-muted p-3 sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG marking */}
              <img
                src={m.image}
                alt={label}
                width={800}
                height={400}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-2 p-4 sm:p-5">
              <h3 className="font-mono text-base font-bold text-accent">{label}</h3>
              {m.description.split("\n").map((p, j) => (
                <p key={j} className="text-body text-fg-muted">
                  <SignLinkedText text={p} exceptSlug={m.slug} />
                </p>
              ))}
              {langNote ? <p className="text-xs text-fg-faint">{langNote}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
