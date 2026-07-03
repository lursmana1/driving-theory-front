"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Checkbox } from "antd";
import { getExamRulesForCategory } from "@/api/examAttempts";
import type { CategoryExamRules } from "@/CONSTS/categories";
import { examCtaPillBase } from "@/layoutComponents/Header/headerVariants";
import { Subject } from "@/lib/types/subject";
import { useTranslations } from "next-intl";

type SubjectPickerProps = {
  categoryId: number;
  subjects: Subject[];
  examRules: CategoryExamRules;
};

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-slate-500"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-slate-500"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M9.5 9.5a2.5 2.5 0 0 1 4.2 1.8c0 2-2.7 2.7-2.7 2.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MistakeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-slate-500"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
    </svg>
  );
}

export default function SubjectPicker({
  categoryId,
  subjects,
  examRules,
}: SubjectPickerProps) {
  const router = useRouter();
  const t = useTranslations("SubjectPicker");
  const [rules, setRules] = useState(examRules);

  useEffect(() => {
    setRules(examRules);
    getExamRulesForCategory(categoryId).then(setRules);
  }, [categoryId, examRules]);

  const allIds = useMemo(() => subjects.map((s) => s.id), [subjects]);
  const [selected, setSelected] = useState<number[]>(allIds);

  const options = useMemo(
    () =>
      subjects.map((s, idx) => ({
        label: `${idx + 1}. ${s.name}`,
        value: s.id,
      })),
    [subjects],
  );

  const allChecked = selected.length === allIds.length && allIds.length > 0;

  const onChange = (values: (string | number)[]) => {
    setSelected(values as number[]);
  };

  const toggleAll = () => {
    setSelected(allChecked ? [] : allIds);
  };

  const startExam = () => {
    if (!selected.length) return;
    const params = new URLSearchParams({
      category: String(categoryId),
      subjects: selected.join(","),
    });
    router.push(`/exam?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full font-georgian">
      <button
        type="button"
        disabled={!selected.length}
        onClick={startExam}
        className={`mb-4 flex h-10 w-full max-w-sm items-center justify-center px-5 text-sm sm:mx-auto sm:w-auto sm:min-w-[12rem] ${examCtaPillBase}`}
      >
        {t("startExam")}
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-b border-slate-100 px-5 py-4 sm:justify-around sm:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-700 sm:text-base">
            <ClockIcon />
            <span>{t("examTime", { count: rules.totalQuestions })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 sm:text-base">
            <QuestionIcon />
            <span>{t("examQuestions", { count: rules.totalQuestions })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 sm:text-base">
            <MistakeIcon />
            <span>{t("examMistakes", { count: rules.maxMistakes })}</span>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-8 sm:py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900 sm:text-lg">
              <span className="text-slate-400">#</span>
              {t("topics")}
            </h2>
            <button
              type="button"
              onClick={toggleAll}
              className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 sm:text-sm"
            >
              {t("toggleAll")}
            </button>
          </div>

          <Checkbox.Group
            value={selected}
            onChange={onChange}
            className="block w-full [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-emerald-500! [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-emerald-500! [&_.ant-checkbox-inner]:rounded! [&_.ant-checkbox-wrapper]:m-0! [&_.ant-checkbox-wrapper]:w-full [&_.ant-checkbox-wrapper]:items-start! [&_.ant-checkbox-wrapper]:rounded-lg [&_.ant-checkbox-wrapper]:px-2 [&_.ant-checkbox-wrapper]:py-2 [&_.ant-checkbox-wrapper]:hover:bg-slate-50"
          >
            <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
              {options.map((opt) => (
                <Checkbox key={String(opt.value)} value={opt.value}>
                  <span className="text-xs font-semibold leading-snug text-slate-800 sm:text-sm">
                    {opt.label}
                  </span>
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </div>
      </div>
    </div>
  );
}
