"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { moreInfoLinks } from "@/CONSTS/moreInfoLinks";
import {
  headerMenuItem,
  headerMenuPanel,
  headerNavLink,
  headerNavLinkActive,
} from "./headerStyles";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop "More" menu: a short trigger so the main row fits on small laptops,
 * a compact panel with the extra pages. Opens on hover (mouse) and on
 * click / tap (touch laptops, keyboard); Esc and an outside click close it.
 */
export default function HeaderMoreInfo() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /** How the last press started: a mouse already opened the menu on hover. */
  const pressType = useRef<string>("");
  const current = moreInfoLinks.some((l) => isActive(pathname, l.href));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`${headerNavLink} inline-flex items-center gap-1 ${
          current || open ? headerNavLinkActive : ""
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="header-more-menu"
        title={t("navMoreInfo")}
        onPointerDown={(e) => {
          pressType.current = e.pointerType;
        }}
        onClick={() => {
          // Mouse: hover opened it, a click must not close it again.
          // Touch / pen / keyboard: the press toggles.
          if (pressType.current === "mouse") setOpen(true);
          else setOpen((o) => !o);
          pressType.current = "";
        }}
      >
        {t("navMore")}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 opacity-60 transition-transform motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          id="header-more-menu"
          role="menu"
          aria-label={t("navMoreInfo")}
          className={`absolute right-0 top-full z-50 mt-1 w-max min-w-52 p-1.5 ${headerMenuPanel}`}
        >
          {/* Hover bridge over the gap, so the panel doesn't close on the way down. */}
          <div className="absolute inset-x-0 -top-2 h-2" aria-hidden />
          {moreInfoLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex min-h-10 items-center whitespace-nowrap rounded-xs px-3 py-2 text-sm leading-snug ${
                  active
                    ? "bg-fg/5 font-semibold text-fg"
                    : `font-medium text-fg-muted ${headerMenuItem}`
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
