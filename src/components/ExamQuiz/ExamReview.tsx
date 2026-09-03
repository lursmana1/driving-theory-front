"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import TicketQuiz from "@/components/TicketsQuiz/TicketsQuiz";
import useArrowNavigation from "@/utills/helpers/hooks/useArrowNavigation";
import type { ExamReviewItem } from "@/utills/helpers/examReview";

type ExamReviewProps = {
  items: ExamReviewItem[];
  onDone: () => void;
};

export default function ExamReview({ items, onDone }: ExamReviewProps) {
  const t = useTranslations("Exam");
  const [index, setIndex] = useState(0);
  const item = items[index];
  const isLast = index >= items.length - 1;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    if (index >= items.length - 1) {
      onDone();
      return;
    }
    setIndex((i) => i + 1);
  }, [index, items.length, onDone]);

  useArrowNavigation(goPrev, goNext);

  if (!item) return null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#193e4a]">
      <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div>
          <p className="font-georgian text-sm font-semibold text-white">
            {t("reviewTitle")}
          </p>
          <p className="text-xs text-white/70">
            {t("reviewProgress", { current: index + 1, count: items.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-white/25 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
        >
          {t("reviewDone")}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <TicketQuiz
          key={String(item.question.id)}
          question={item.question}
          questionIndex={index + 1}
          selectedAnswer={item.picked}
          onSelect={() => {}}
          priority
        />
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/10 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="flex-1 rounded-xl border border-white/25 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {t("reviewPrev")}
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex-1 rounded-xl bg-[#1f6b78] py-3 text-sm font-semibold text-white hover:bg-[#25808f]"
        >
          {isLast ? t("reviewDone") : t("reviewNext")}
        </button>
      </div>
    </div>
  );
}
