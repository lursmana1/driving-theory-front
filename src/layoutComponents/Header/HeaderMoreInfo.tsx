"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { moreInfoLinks } from "@/CONSTS/moreInfoLinks";
import { headerMenuItem, headerMenuPanel, headerNavLink } from "./headerStyles";

export default function HeaderMoreInfo() {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);

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
        className={`${headerNavLink} inline-flex items-center`}
        aria-expanded={open}
        aria-haspopup="menu"
        onFocus={() => setOpen(true)}
      >
        {t("navMoreInfo")}
        <span aria-hidden className="ml-1 text-3xs opacity-60">
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute left-0 top-full z-50 min-w-48 py-1 ${headerMenuPanel}`}
        >
          <div className="absolute inset-x-0 -top-2 h-2" aria-hidden />
          {moreInfoLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block whitespace-nowrap px-3 py-2 text-sm font-medium ${headerMenuItem}`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
