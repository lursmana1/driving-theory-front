"use client";

import { useTranslations } from "next-intl";

type ExamAutoAdvanceCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Wrapper classes; the exam's default sits in the answer column. */
  className?: string;
};

export default function ExamAutoAdvanceCheckbox({
  checked,
  onChange,
  className = "w-fit shrink-0 self-start px-3 py-2 sm:px-4",
}: ExamAutoAdvanceCheckboxProps) {
  const t = useTranslations("Exam");

  return (
    <div className={className}>
      {/* 44px tall row so it is easy to hit on a phone. */}
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-stage-fg/90">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 shrink-0 rounded-xs border-stage-line bg-stage-raised accent-accent"
        />
        <span className="font-georgian whitespace-nowrap">{t("autoAdvance")}</span>
      </label>
    </div>
  );
}
