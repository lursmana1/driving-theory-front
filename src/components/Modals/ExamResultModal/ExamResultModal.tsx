"use client";

import { useEffect, type ReactNode } from "react";
import Modal from "antd/es/modal/Modal";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import GuestSaveProgressCta from "../GuestSaveProgressCta";

type ExamResultModalProps = {
  handleRestart: () => void;
  onReview?: () => void;
  reviewCount?: number;
  reviewReady?: boolean;
  isGuest?: boolean;
  children: ReactNode;
};

export default function ExamResultModal({
  handleRestart,
  onReview,
  reviewCount = 0,
  reviewReady = true,
  isGuest = false,
  children,
}: ExamResultModalProps) {
  const t = useTranslations("Exam");
  const router = useRouter();
  const canReview = reviewCount > 0 && !!onReview;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "button") return;
      e.preventDefault();
      if (canReview && reviewReady) onReview();
      else handleRestart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRestart, canReview, reviewReady, onReview]);

  return (
    <Modal
      open
      centered
      closable
      mask={{ closable: true }}
      footer={null}
      width={480}
      onCancel={handleRestart}
      styles={{
        body: {
          padding: 0,
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          boxShadow: "var(--shadow-overlay)",
        },
      }}
    >
      <div className="font-georgian bg-surface">
        {children}

        <div className="flex flex-col gap-2.5 border-t border-line bg-surface-muted px-8 py-6">
          {canReview && (
            <button
              type="button"
              autoFocus
              disabled={!reviewReady}
              onClick={onReview}
              className="w-full rounded-control bg-accent py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-strong disabled:opacity-60"
            >
              {reviewReady
                ? t("reviewMistakes", { count: reviewCount })
                : t("loading")}
            </button>
          )}
          <button
            type="button"
            autoFocus={!canReview}
            onClick={handleRestart}
            className="w-full rounded-control bg-fg py-3 text-sm font-semibold text-fg-inverse shadow-raised transition hover:brightness-125"
          >
            {t("restart")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-control border border-line-strong bg-surface py-3 text-sm font-semibold text-fg-muted transition hover:border-line-strong hover:bg-surface-sunken"
          >
            {t("goToHome")}
          </button>
        </div>

        {isGuest ? <GuestSaveProgressCta /> : null}
      </div>
    </Modal>
  );
}
