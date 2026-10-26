"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { burgerAccountLink } from "@/layoutComponents/Header/headerStyles";
import type { InstallGuide } from "@/utills/helpers/hooks/useInstallPrompt";

type InstallAppItemProps = {
  canInstall: boolean;
  guide: InstallGuide | null;
  onInstall: () => void;
};

/** The iOS Share glyph (square with an arrow up), so people know which button to look for. */
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mx-0.5 inline-block -translate-y-0.5 text-accent"
    >
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

/**
 * Burger-menu row: install button (Chrome), or a step-by-step guide
 * that opens under the row (iPhone, in-app browsers like TikTok).
 */
export function InstallAppItem({ canInstall, guide, onInstall }: InstallAppItemProps) {
  const t = useTranslations("Pwa");
  const [open, setOpen] = useState(false);

  if (canInstall) {
    return (
      <button type="button" onClick={onInstall} className={burgerAccountLink}>
        {t("install")}
      </button>
    );
  }

  if (!guide) return null;

  const share = () => <ShareIcon />;
  const steps =
    guide === "in-app"
      ? [t("inAppStep1"), t("inAppStep2")]
      : [
          guide === "ios-safari" ? t.rich("iosStep1", { share }) : t.rich("iosStep1Browser", { share }),
          t("iosStep2"),
          t("iosStep3"),
        ];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="install-steps"
        className={`${burgerAccountLink} gap-2`}
      >
        {t("install")}
        <span aria-hidden="true" className={`text-sm transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <div id="install-steps" className="mt-2 rounded-card border border-line bg-surface-muted p-4">
          <p className="text-sm font-semibold text-fg">
            {guide === "in-app" ? t("inAppTitle") : t("iosTitle")}
          </p>
          <ol className="mt-3 flex flex-col gap-2.5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {guide !== "in-app" && <p className="mt-3 text-xs leading-relaxed text-fg-subtle">{t("iosSignIn")}</p>}
        </div>
      )}
    </div>
  );
}
