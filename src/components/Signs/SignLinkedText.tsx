"use client";

import { useEffect, useMemo, useState } from "react";
import { Popover } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, Link } from "@/i18n/navigation";
import { signGroupHref } from "@/CONSTS/signGroups";
import type { SignLookup } from "@/lib/types/signs";
import { splitSignRefs } from "@/utills/helpers/signLinks";
import { loadSignLookup } from "./signLookup";
import { useMediaQuery } from "@/utills/helpers/hooks/useMediaQuery";


type SignLinkedTextProps = {
  text: string;
  /** "stage" on the dark ticket card, "light" on white panels */
  tone?: "stage" | "light";
  /** the sign this text belongs to — not linked to itself */
  exceptSlug?: string;
};

/** Text where sign numbers ("საგზაო ნიშანი 2.3") open a small card with the sign. */
export default function SignLinkedText({ text, tone = "light", exceptSlug }: SignLinkedTextProps) {
  const t = useTranslations("SignsPage");
  const locale = useLocale();
  const [lookup, setLookup] = useState<SignLookup | null>(null);
  // a tap fires hover and click together, which opens and closes the card at once — touch gets click only
  const canHover = useMediaQuery("(hover: hover)");

  useEffect(() => {
    let alive = true;
    void loadSignLookup(locale).then((l) => {
      if (alive) setLookup(l);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const parts = useMemo(
    () =>
      lookup
        ? splitSignRefs(text, (kind, n) => lookup[`${kind}:${n}`]?.[0] != null && lookup[`${kind}:${n}`][0] !== exceptSlug)
        : [text],
    [lookup, text, exceptSlug],
  );

  const linkClass =
    tone === "stage"
      ? "text-stage-highlight decoration-stage-highlight/60"
      : "text-accent decoration-accent/50";

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === "string") return part;
        const [slug, number, name, image, group] = lookup![`${part.kind}:${part.number}`];
        const label =
          part.kind === "marking"
            ? t("markingLabel", { number })
            : t("signLabel", { number });
        return (
          <Popover
            key={i}
            trigger={canHover ? "hover" : "click"}
            placement="top"
            content={
              <div className="flex w-56 flex-col items-center gap-2 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sign */}
                <img src={image} alt={name || label} width={224} height={112} className="h-28 w-full object-contain" />
                <p className="font-mono text-2xs font-semibold text-fg-subtle">{label}</p>
                {name ? <p className="text-sm font-medium leading-5 text-fg">{name}</p> : null}
                {exceptSlug ? (
                  // on a signs page: a plain link, so a sign of the same group opens via `hashchange`
                  <a
                    href={`${getPathname({ href: signGroupHref(group), locale })}#${slug}`}
                    className="text-sm font-semibold text-accent hover:text-accent-strong"
                  >
                    {t("openSign")} →
                  </a>
                ) : (
                  <Link
                    href={`${signGroupHref(group)}#${slug}`}
                    target="_blank"
                    className="text-sm font-semibold text-accent hover:text-accent-strong"
                  >
                    {t("openSign")} →
                  </Link>
                )}
              </div>
            }
          >
            <button
              type="button"
              aria-label={t("showSign", { number })}
              className={`inline cursor-pointer font-semibold underline decoration-dotted underline-offset-4 ${linkClass}`}
            >
              {part.text}
            </button>
          </Popover>
        );
      })}
    </>
  );
}
