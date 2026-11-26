"use client";

import { useTranslations } from "next-intl";
import { setTheme } from "@/utills/helpers/theme";
import { useTheme } from "@/utills/helpers/hooks/useTheme";
import { headerStreak } from "@/layoutComponents/Header/headerStyles";
import { LineIcon } from "@/components/Icon/LineIcon";

/** Sun / moon button in the header: switches and remembers the theme. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("Header");
  const theme = useTheme();
  const dark = theme === "dark";
  const label = dark ? t("themeLight") : t("themeDark");

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      // Unknown until hydrated: keep the slot, show nothing.
      className={`${headerStreak} h-8 w-8 justify-center px-0 ${className}`}
    >
      {theme && <LineIcon name={dark ? "sun" : "moon"} className="h-4 w-4" />}
    </button>
  );
}
