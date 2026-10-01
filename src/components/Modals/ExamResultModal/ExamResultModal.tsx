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
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.35)",
        },
      }}
    >
      <div className="font-georgian bg-white">
        {children}

        <div className="flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50 px-8 py-6">
          {canReview && (
            <button
              type="button"
              autoFocus
              disabled={!reviewReady}
              onClick={onReview}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-60"
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
            className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white shadow-md shadow-ink/20 transition hover:brightness-125"
          >
            {t("restart")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            {t("goToHome")}
          </button>
        </div>

        {isGuest ? <GuestSaveProgressCta /> : null}
      </div>
    </Modal>
  );
}
