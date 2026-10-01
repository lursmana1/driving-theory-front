"use client";

import { useTranslations } from "next-intl";
import {
  formatExamDuration,
  resolveExamDurationSeconds,
} from "@/utills/helpers/formatExamDuration";
import ExamResultModal from "../ExamResultModal/ExamResultModal";

type ExamSuccessModalProps = {
  handleRestart: () => void;
  passed: boolean;
  durationSeconds: number;
  correctCount: number;
  totalCount: number;
  elapsedSeconds?: number;
  onReview?: () => void;
  reviewCount?: number;
  reviewReady?: boolean;
  isGuest?: boolean;
};

const ExamSuccessModal = ({
  handleRestart,
  passed,
  durationSeconds,
  correctCount,
  totalCount,
  elapsedSeconds = 0,
  onReview,
  reviewCount = 0,
  reviewReady = true,
  isGuest = false,
}: ExamSuccessModalProps) => {
  const t = useTranslations("Exam");

  const duration = resolveExamDurationSeconds(elapsedSeconds, durationSeconds);
  const scorePct =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <ExamResultModal
      handleRestart={handleRestart}
      onReview={onReview}
      reviewCount={reviewCount}
      reviewReady={reviewReady}
      isGuest={isGuest}
    >
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
    </ExamResultModal>
  );
};

export default ExamSuccessModal;
