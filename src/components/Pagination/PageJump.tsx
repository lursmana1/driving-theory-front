"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type PageJumpProps = {
  totalPages: number;
  hrefOf: (page: number) => string;
};

/** "Go to page N": clamps to 1…totalPages and keeps the listing's other params. */
export function PageJump({ totalPages, hrefOf }: PageJumpProps) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState("");

  const go = (e: FormEvent) => {
    e.preventDefault();
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) return;
    router.push(hrefOf(Math.min(Math.max(1, n), totalPages)));
  };

  return (
    <form onSubmit={go} className="flex items-center gap-1.5">
      <label htmlFor={inputId} className="sr-only">
        {t("pageJumpLabel", { total: totalPages })}
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={1}
        max={totalPages}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("pageJumpPlaceholder")}
        className="h-9 w-24 rounded-control border border-line bg-surface px-2 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={value.trim() === ""}
        className="inline-flex h-9 items-center justify-center rounded-control border border-line bg-surface px-3 text-sm font-semibold text-fg-muted transition hover:bg-surface-muted hover:text-fg disabled:pointer-events-none disabled:opacity-50"
      >
        {t("pageJumpGo")}
      </button>
    </form>
  );
}
