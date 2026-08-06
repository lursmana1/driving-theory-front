"use client";

import { useEffect } from "react";
import Modal from "antd/es/modal/Modal";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  formatExamDuration,
  resolveExamDurationSeconds,
} from "@/utills/helpers/formatExamDuration";

type ExamSuccessModalProps = {
  handleRestart: () => void;
  passed: boolean;
  durationSeconds: number;
  correctCount: number;
  totalCount: number;
  elapsedSeconds?: number;
};

const ExamSuccessModal = ({
  handleRestart,
  passed,
  durationSeconds,
  correctCount,
  totalCount,
  elapsedSeconds = 0,
}: ExamSuccessModalProps) => {
  const t = useTranslations("Exam");
  const router = useRouter();

  const duration = resolveExamDurationSeconds(elapsedSeconds, durationSeconds);
  const scorePct =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const goHome = () => router.push("/");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "button") return;
      e.preventDefault();
      handleRestart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRestart]);

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
        <div className="border-b border-slate-200 px-8 py-6 text-center">
          <span
            className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-xl ${
              passed ? "bg-emerald-50" : "bg-rose-50"
            }`}
            aria-hidden
          >
            {passed ? "✓" : "✕"}
          </span>
          <h2
            className={`text-lg font-bold leading-snug sm:text-xl ${
              passed ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {passed ? t("examPassed") : t("examFailed")}
          </h2>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {correctCount}/{totalCount}
            <span className="ml-1.5 text-base font-semibold text-slate-500">
              ({scorePct}%)
            </span>
          </p>
          {duration > 0 && (
            <p className="mt-2 text-sm font-medium text-slate-600">
              {t("examDuration", { time: formatExamDuration(duration) })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50 px-8 py-6">
          <button
            type="button"
            autoFocus
            onClick={handleRestart}
            className="w-full rounded-xl bg-linear-to-r from-sky-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:brightness-110"
          >
            {t("restart")}
          </button>
          <button
            type="button"
            onClick={goHome}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            {t("goToHome")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExamSuccessModal;
