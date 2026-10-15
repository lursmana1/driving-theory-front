"use client";

import { useTranslations } from "next-intl";

type ExamAutoAdvanceCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function ExamAutoAdvanceCheckbox({
  checked,
  onChange,
}: ExamAutoAdvanceCheckboxProps) {
  const t = useTranslations("Exam");

  return (
    <div className="w-fit shrink-0 self-start px-3 py-2 sm:px-4">
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stage-fg/90">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded-xs border-stage-line bg-stage-raised accent-accent"
        />
        <span className="font-georgian">{t("autoAdvance")}</span>
      </label>
    </div>
  );
}
