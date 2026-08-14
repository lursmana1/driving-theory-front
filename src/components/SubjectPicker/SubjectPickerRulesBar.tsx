"use client";

import { useTranslations } from "next-intl";
import type { CategoryExamRules } from "@/CONSTS/categories";
import { Icon } from "@/components/Icon/Icon";

type SubjectPickerRulesBarProps = {
  examRules: CategoryExamRules;
  durationMinutes: number;
};

export function SubjectPickerRulesBar({
  examRules,
  durationMinutes,
}: SubjectPickerRulesBarProps) {
  const t = useTranslations("SubjectPicker");

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b border-slate-100 px-4 py-3 sm:justify-around sm:gap-x-8 sm:px-8 sm:py-4">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Icon name="clock" className="h-5 w-5" />
        <span>{t("examTime", { count: durationMinutes })}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Icon name="question" className="h-5 w-5" />
        <span>{t("examQuestions", { count: examRules.totalQuestions })}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Icon name="xCircle" className="h-5 w-5" />
        <span>{t("examMistakes", { count: examRules.maxMistakes })}</span>
      </div>
    </div>
  );
}
