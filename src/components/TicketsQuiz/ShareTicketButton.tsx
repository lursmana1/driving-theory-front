"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { LineIcon } from "@/components/Icon/LineIcon";

/** How long "Link copied" stays on the button. */
const COPIED_MS = 2000;

type ShareTicketButtonProps = {
  categoryId: number;
  questionId: string | number;
};

/**
 * Sends one ticket to someone: the system share sheet where there is one
 * (phones), else the link is copied. Link: `/tickets/{category}?questionId=`.
 */
export function ShareTicketButton({
  categoryId,
  questionId,
}: ShareTicketButtonProps) {
  const t = useTranslations("Tickets");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const path = getPathname({
      href: {
        pathname: `/tickets/${categoryId}`,
        query: { questionId: String(questionId) },
      },
      locale,
    });
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("shareTitle", { id: questionId }),
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Share sheet closed, or clipboard refused: nothing to undo.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? t("linkCopied") : t("shareTicket")}
      title={copied ? t("linkCopied") : t("shareTicket")}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-stage-fg/25 text-stage-fg transition hover:bg-stage-fg/40"
    >
      <LineIcon name={copied ? "check" : "link"} className="h-4 w-4" />
      <span aria-live="polite" className="sr-only">
        {copied ? t("linkCopied") : ""}
      </span>
    </button>
  );
}
