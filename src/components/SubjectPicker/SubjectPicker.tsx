"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { CategoryExamRules } from "@/CONSTS/categories";
import type { Subject } from "@/lib/types/subject";
import { useTranslations } from "next-intl";
import { StartExamButton } from "@/components/SubjectPicker/StartExamButton";
import { SubjectPickerRulesBar } from "@/components/SubjectPicker/SubjectPickerRulesBar";
import { SubjectPickerTopics } from "@/components/SubjectPicker/SubjectPickerTopics";

type SubjectPickerProps = {
  categoryId: number;
  subjects: Subject[];
  examRules: CategoryExamRules;
  durationMinutes: number;
};

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

  useEffect(() => {
    setSelected(subjects.map((s) => s.id));
  }, [subjects]);

  const startExam = () => {
    if (!selected.length) return;
    const params = new URLSearchParams({
      category: String(categoryId),
      subjects: selected.join(","),
    });
    router.push(`/exam?${params.toString()}`);
  };

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
        <SubjectPickerRulesBar
          examRules={examRules}
          durationMinutes={durationMinutes}
        />
        <SubjectPickerTopics
          subjects={subjects}
          selected={selected}
          onSelectedChange={setSelected}
        />
      </div>

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
