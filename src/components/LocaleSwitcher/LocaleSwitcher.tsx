"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import type { HeaderVariant } from "@/layoutComponents/Header/headerVariants";

const localeConfig: Record<string, { label: string; flag: string }> = {
  ka: { label: "ქართული", flag: "/languages/flag-ge.svg" },
  en: { label: "English", flag: "/languages/flag-en.svg" },
  ru: { label: "Русский", flag: "/languages/flag-ru.svg" },
};

export default function LocaleSwitcher({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: HeaderVariant;
}) {
  const isLanding = variant === "landing";
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
        className={
          isLanding
            ? "flex items-center gap-2 rounded-lg border border-white/15 bg-[#242933] px-2.5 py-1.5 text-white shadow-sm transition-colors hover:border-white/25 hover:bg-[#2a3140] focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/25 sm:px-3 sm:py-2"
            : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-3 sm:py-2"
        }
      >
        <Image
          src={current.flag}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 shrink-0 rounded-sm object-cover"
        />
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform sm:h-4 sm:w-4 ${isLanding ? "text-white" : "text-slate-500"} ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1.5 w-fit overflow-hidden rounded-lg border border-white/15  bg-[#242933] py-1 shadow-lg"
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
                      ? "bg-[#242933] text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Image
                    src={config.flag}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 shrink-0 rounded-sm object-cover"
                  />
                  {isActive && (
                    <svg
                      className="ml-auto h-4 w-4 text-[#1A73E8]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
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
