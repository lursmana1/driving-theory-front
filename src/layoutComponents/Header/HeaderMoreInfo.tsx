"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { moreInfoLinks } from "@/CONSTS/moreInfoLinks";
import type { HeaderVariant } from "./headerVariants";
import { headerNavLink } from "./headerVariants";

type HeaderMoreInfoProps = {
  variant?: HeaderVariant;
};

export default function HeaderMoreInfo({ variant = "default" }: HeaderMoreInfoProps) {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  const trigger = headerNavLink[variant];
  const panel =
    variant === "landing"
      ? "border-hairline bg-paper text-ink shadow-lg shadow-ink/10"
      : "border-slate-200 bg-white text-slate-800 shadow-lg shadow-slate-900/10";
  const item =
    variant === "landing"
      ? "hover:bg-ink/5 hover:text-accent"
      : "hover:bg-slate-100 hover:text-slate-900";

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={`${trigger} inline-flex items-center`}
        aria-expanded={open}
        aria-haspopup="menu"
        onFocus={() => setOpen(true)}
      >
        {t("navMoreInfo")}
        <span aria-hidden className="ml-1 text-[10px] opacity-60">
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute left-0 top-full z-50 min-w-48 rounded-lg border py-1 ${panel}`}
        >
          <div className="absolute inset-x-0 -top-2 h-2" aria-hidden />
          {moreInfoLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block whitespace-nowrap px-3 py-2 text-sm font-medium ${item}`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
