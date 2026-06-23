"use client";

import Modal from "antd/es/modal/Modal";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { FinishExamResponse } from "@/api/examAttempts";
import Image from "next/image";
import {
  formatExamDuration,
  resolveExamDurationSeconds,
} from "@/utills/helpers/formatExamDuration";

type ExamRetryModalProps = {
  handleRestart: () => void;
  mistake: number;
  finishResult?: FinishExamResponse | null;
  elapsedSeconds?: number;
};

const ExamRetryModal = ({
  handleRestart,
  mistake,
  finishResult,
  elapsedSeconds = 0,
}: ExamRetryModalProps) => {
  const t = useTranslations("Exam");
  const router = useRouter();

  const duration = resolveExamDurationSeconds(
    elapsedSeconds,
    finishResult?.durationSeconds,
  );

  return (
    <Modal
      open
      centered
      closable={false}
      footer={null}
      width={480}
      styles={{
        content: {
          padding: 0,
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.35)",
        },
        body: { padding: 0 },
      }}
    >
      <div className="font-georgian bg-white">
        <div className="border-b border-slate-200 px-8 py-6 text-center">
          <span
            className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-xl"
            aria-hidden
          >
            😔
          </span>
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

        <div className="flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50 px-8 py-6">
          <button
            type="button"
            onClick={handleRestart}
            className="w-full rounded-xl bg-linear-to-r from-sky-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:brightness-110"
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
      </div>
    </Modal>
  );
};

export default ExamRetryModal;
