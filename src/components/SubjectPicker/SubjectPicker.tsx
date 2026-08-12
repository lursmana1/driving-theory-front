"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Checkbox } from "antd";
import type { CategoryExamRules } from "@/CONSTS/categories";
import { examCtaPillBase } from "@/layoutComponents/Header/headerVariants";
import { Subject } from "@/lib/types/subject";
import { useTranslations } from "next-intl";

type SubjectPickerProps = {
  categoryId: number;
  subjects: Subject[];
  examRules: CategoryExamRules;
  durationMinutes: number;
};

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-500" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-500" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.2 1.8c0 2-2.7 2.7-2.7 2.7" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MistakeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-500" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StartExamButton({
  disabled,
  onClick,
  label,
  className = "",
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-center px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${examCtaPillBase} ${className}`}
    >
      {label}
    </button>
  );
}

export default function SubjectPicker({
  categoryId,
  subjects,
  examRules,
  durationMinutes,
}: SubjectPickerProps) {
  const router = useRouter();
  const t = useTranslations("SubjectPicker");

  const allIds = useMemo(() => subjects.map((s) => s.id), [subjects]);
  const [selected, setSelected] = useState<number[]>(allIds);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSelected(subjects.map((s) => s.id));
    setQuery("");
    setTopicsOpen(false);
  }, [subjects]);

  const allChecked = selected.length === allIds.length && allIds.length > 0;

  const filteredSubjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s, idx) => {
      const label = `${idx + 1}. ${s.name}`.toLowerCase();
      return label.includes(q) || String(s.id).includes(q);
    });
  }, [subjects, query]);

  const startExam = () => {
    if (!selected.length) return;
    const params = new URLSearchParams({
      category: String(categoryId),
      subjects: selected.join(","),
    });
    router.push(`/exam?${params.toString()}`);
  };

  const topicList = (
    <Checkbox.Group
      value={selected}
      onChange={(values) => setSelected(values as number[])}
      className="block w-full [&_.ant-checkbox-wrapper]:flex! [&_.ant-checkbox-wrapper]:gap-2.5! [&_.ant-checkbox]:mt-0.5! [&_.ant-checkbox+span]:min-w-0 [&_.ant-checkbox+span]:flex-1 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-emerald-500! [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-emerald-500! [&_.ant-checkbox-inner]:rounded! [&_.ant-checkbox-wrapper]:m-0! [&_.ant-checkbox-wrapper]:w-full [&_.ant-checkbox-wrapper]:items-start! [&_.ant-checkbox-wrapper]:rounded-lg [&_.ant-checkbox-wrapper]:px-3 [&_.ant-checkbox-wrapper]:py-1.5 [&_.ant-checkbox-wrapper]:hover:bg-slate-50 sm:[&_.ant-checkbox-wrapper]:py-2"
    >
      <div className="grid grid-cols-1 gap-0.5 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((s) => {
          const idx = subjects.findIndex((subject) => subject.id === s.id);
          return (
            <div key={s.id} className="rounded-lg">
              <Checkbox value={s.id}>
                <span className="text-xs font-semibold leading-snug text-slate-800 sm:text-sm">
                  {idx + 1}. {s.name}
                </span>
              </Checkbox>
            </div>
          );
        })}
      </div>
    </Checkbox.Group>
  );

  return (
    <div className="mx-auto w-full pb-24 font-georgian md:pb-0">
      <div className="mb-4 hidden md:flex md:justify-center">
        <StartExamButton
          disabled={!selected.length}
          onClick={startExam}
          label={t("startExam")}
          className="w-auto min-w-48"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b border-slate-100 px-4 py-3 sm:justify-around sm:gap-x-8 sm:px-8 sm:py-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <ClockIcon />
            <span>{t("examTime", { count: durationMinutes })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <QuestionIcon />
            <span>{t("examQuestions", { count: examRules.totalQuestions })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <MistakeIcon />
            <span>{t("examMistakes", { count: examRules.maxMistakes })}</span>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-8 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900 sm:text-lg">
              <span className="text-slate-400">#</span>
              {t("topics")}
            </h2>
            <button
              type="button"
              onClick={() => setSelected(allChecked ? [] : allIds)}
              className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 sm:text-sm"
            >
              {t("toggleAll")}
            </button>
          </div>

          {/* Mobile: collapsed summary — expand only when customizing */}
          <button
            type="button"
            aria-expanded={topicsOpen}
            onClick={() => setTopicsOpen((open) => !open)}
            className="mb-3 flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-slate-300 hover:bg-slate-100 md:hidden"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {t("selectedCount", { selected: selected.length, total: allIds.length })}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {allChecked ? t("allTopicsSelectedHint") : t("customSelectionHint")}
              </p>
            </div>
            <ChevronIcon open={topicsOpen} />
          </button>

          <div className={`space-y-3 ${topicsOpen ? "block" : "hidden"} md:block`}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchTopics")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />

            <p className="hidden text-xs text-slate-500 md:block">
              {t("selectedCount", { selected: selected.length, total: allIds.length })}
            </p>

            <div className="max-h-[min(45dvh,24rem)] overflow-y-auto overscroll-contain rounded-xl border border-slate-100 bg-slate-50/40 p-2 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:max-h-none md:overflow-visible md:border-0 md:bg-transparent md:p-0 md:pb-0">
              {filteredSubjects.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-slate-500">{t("noTopicsFound")}</p>
              ) : (
                topicList
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: sticky start — no scrolling past 36 items to begin */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur md:hidden">
        <p className="mb-2 text-center text-xs text-slate-500">
          {t("selectedCount", { selected: selected.length, total: allIds.length })}
        </p>
        <StartExamButton
          disabled={!selected.length}
          onClick={startExam}
          label={t("startExam")}
        />
      </div>
    </div>
  );
}
