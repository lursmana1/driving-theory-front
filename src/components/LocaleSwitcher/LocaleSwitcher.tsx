"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Icon } from "@/components/Icon/Icon";

const localeConfig: Record<string, { label: string; flag: string }> = {
  ka: { label: "ქართული", flag: "/languages/flag-ge.svg" },
  en: { label: "English", flag: "/languages/flag-en.svg" },
  ru: { label: "Русский", flag: "/languages/flag-ru.svg" },
};

export default function LocaleSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = localeConfig[locale] ?? { label: locale, flag: "" };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="flex items-center gap-2 rounded-control border border-line bg-surface/60 px-2.5 py-1.5 text-fg transition-colors hover:border-line-strong hover:bg-surface sm:px-3 sm:py-2"
      >
        <Image
          src={current.flag}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 shrink-0 rounded-xs object-cover"
        />
        <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">
          {locale}
        </span>
        <Icon
          name="chevronDown"
          className={`h-3.5 w-3.5 shrink-0 transition-transform sm:h-4 sm:w-4 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1.5 w-fit overflow-hidden rounded-control border border-line bg-surface py-1 shadow-overlay"
        >
          {routing.locales.map((loc) => {
            const config = localeConfig[loc];
            const isActive = locale === loc;
            return (
              <li key={loc} role="option" aria-selected={isActive}>
                <Link
                  href={pathname}
                  locale={loc as "ka" | "en" | "ru"}
                  onClick={() => setOpen(false)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-surface-sunken text-fg"
                      : "text-fg-muted hover:bg-surface-muted"
                  }`}
                >
                  <Image
                    src={config.flag}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 shrink-0 rounded-xs object-cover"
                  />
                  {isActive && (
                    <Icon
                      name="check"
                      className="ml-auto h-4 w-4"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
