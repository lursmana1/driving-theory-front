"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/contexts/UserContext";
import { DEFAULT_CATEGORY_ID, getCategoryById } from "@/CONSTS/categories";
import { Icon } from "@/components/Icon/Icon";
import type { User } from "@/lib/auth";
import { TRAINER_BATCH_SIZE } from "@/CONSTS/trainer";
import { headerMenuItem, headerMenuPanel, headerStreak } from "./headerStyles";

/**
 * One row in the bell panel. New sources (e.g. the study plan) add a key here.
 * `todo` rows count on the bell; `done` rows are the positive "all clear" kind.
 */
type HeaderNotification = {
  key: string;
  tone: "todo" | "done";
  title: string;
  body: string;
  cta: string;
  href: string;
};

function useNotifications(user: User | null): HeaderNotification[] {
  const t = useTranslations("Notifications");
  const trainer = user?.trainer;
  if (!trainer) return [];
  // One row per category with due mistakes (the API sends most due first).
  const due = trainer.filter((row) => row.dueNow > 0);
  if (due.length > 0) {
    return due.map((row) => ({
      key: `trainer-${row.categoryId}`,
      tone: "todo",
      // Today's goal is one session, not the whole backlog.
      title: t("trainerTitle", {
        count: Math.min(row.dueNow, TRAINER_BATCH_SIZE),
      }),
      body: t("trainerBody", {
        category: getCategoryById(row.categoryId)?.name ?? "",
        total: row.dueNow,
      }),
      cta: t("trainerCta"),
      href: `/practice?category=${row.categoryId}`,
    }));
  }
  return [
    {
      key: "trainerDone",
      tone: "done",
      title: t("allDoneTitle"),
      body: t("allDoneBody"),
      cta: t("allDoneCta"),
      href: `/tickets/${trainer[0]?.categoryId ?? DEFAULT_CATEGORY_ID}`,
    },
  ];
}

/** Bell next to the streak: opens a panel of things waiting for the user. */
export default function HeaderNotifications() {
  const user = useUser();
  const t = useTranslations("Notifications");
  const items = useNotifications(user);
  const todo = items.filter((item) => item.tone === "todo").length;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("open", { count: todo })}
        className={headerStreak}
      >
        <Icon name="bell" className="h-4 w-4" size={16} />
        {todo > 0 && (
          <span className="rounded-full bg-danger px-1.5 text-xs font-bold leading-5 text-on-accent">
            {todo}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={t("title")}
          // Phones: full width under the header (the bell sits mid-row, so a
          // right-aligned dropdown would run off the left edge).
          className={`fixed inset-x-4 top-14 z-50 overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 ${headerMenuPanel}`}
        >
          <p className="border-b border-line px-4 py-2.5 text-sm font-bold text-fg">
            {t("title")}
          </p>
          <ul>
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block space-y-1 px-4 py-3 ${headerMenuItem}`}
                >
                  <span
                    className={`block text-sm font-semibold ${item.tone === "done" ? "text-success-strong" : "text-fg"}`}
                  >
                    {item.title}
                  </span>
                  <span className="block text-xs text-fg-muted">
                    {item.body}
                  </span>
                  <span className="block text-sm font-semibold text-accent">
                    {item.cta} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
