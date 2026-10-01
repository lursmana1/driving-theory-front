"use client";

import { useTranslations } from "next-intl";
import type { FinishExamResponse } from "@/api/examAttempts";
import Image from "next/image";
import {
  formatExamDuration,
  resolveExamDurationSeconds,
} from "@/utills/helpers/formatExamDuration";
import ExamResultModal from "../ExamResultModal/ExamResultModal";

type ExamRetryModalProps = {
  handleRestart: () => void;
  mistake: number;
  finishResult?: FinishExamResponse | null;
  elapsedSeconds?: number;
  onReview?: () => void;
  reviewCount?: number;
  reviewReady?: boolean;
  isGuest?: boolean;
};

const ExamRetryModal = ({
  handleRestart,
  mistake,
  finishResult,
  elapsedSeconds = 0,
  onReview,
  reviewCount = 0,
  reviewReady = true,
  isGuest = false,
}: ExamRetryModalProps) => {
  const t = useTranslations("Exam");

  const duration = resolveExamDurationSeconds(
    elapsedSeconds,
    finishResult?.durationSeconds,
  );

  return (
    <ExamResultModal
      handleRestart={handleRestart}
      onReview={onReview}
      reviewCount={reviewCount}
      reviewReady={reviewReady}
      isGuest={isGuest}
    >
      <div className="border-b border-slate-200 px-8 py-6 text-center">
        <h2 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">
          {t("examFailed")}
        </h2>
        <p className="mt-2 text-sm text-rose-600">
          {t("mistakeCount", { count: mistake })}
        </p>
      </div>

      <div className="px-8 py-6 text-center">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <Image
            className="h-auto w-full"
            src="/gif/school-paper.gif"
            alt=""
            width={360}
            height={200}
            unoptimized
          />
        </div>

        {duration > 0 && (
          <p className="mt-4 text-sm font-medium text-slate-600">
            {t("examDuration", { time: formatExamDuration(duration) })}
          </p>
        )}
      </div>
    </ExamResultModal>
  );
};

export default ExamRetryModal;
