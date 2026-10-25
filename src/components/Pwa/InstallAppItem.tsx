"use client";

import { useTranslations } from "next-intl";
import { burgerAccountLink } from "@/layoutComponents/Header/headerStyles";

type InstallAppItemProps = {
  canInstall: boolean;
  showIosHint: boolean;
  onInstall: () => void;
};

/** Burger-menu row: install button (Chrome) or Add to Home Screen hint (iOS). */
export function InstallAppItem({ canInstall, showIosHint, onInstall }: InstallAppItemProps) {
  const t = useTranslations("Pwa");

  if (canInstall) {
    return (
      <button type="button" onClick={onInstall} className={burgerAccountLink}>
        {t("install")}
      </button>
    );
  }

  if (showIosHint) {
    return (
      <p className="text-sm text-fg-subtle">
        <span className="font-medium text-fg-muted">{t("install")}</span>
        {" — "}
        {t("iosHint")}
      </p>
    );
  }

  return null;
}
