"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "antd";
import { useTranslations } from "next-intl";
import type { Subject } from "@/lib/types/subject";
import { Icon } from "@/components/Icon/Icon";

type SubjectPickerTopicsProps = {
  subjects: Subject[];
  selected: number[];
  onSelectedChange: (ids: number[]) => void;
};

export function SubjectPickerTopics({
  subjects,
  selected,
  onSelectedChange,
}: SubjectPickerTopicsProps) {
  const t = useTranslations("SubjectPicker");
  const allIds = useMemo(() => subjects.map((s) => s.id), [subjects]);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
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

  return (
    <div className="px-4 py-4 sm:px-8 sm:py-5">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <h2 className="flex items-center gap-1.5 text-base font-bold text-fg sm:text-lg">
          <span className="text-fg-faint">#</span>
          {t("topics")}
        </h2>
        <button
          type="button"
          onClick={() => onSelectedChange(allChecked ? [] : allIds)}
          className="shrink-0 rounded-control border border-line bg-surface-muted px-3 py-1.5 text-xs font-medium text-fg-muted transition hover:border-line-strong hover:bg-surface-sunken sm:text-sm"
        >
          {t("toggleAll")}
        </button>
      </div>

      <button
        type="button"
        aria-expanded={topicsOpen}
        onClick={() => setTopicsOpen((open) => !open)}
        className="mb-3 flex w-full items-center justify-between gap-3 rounded-control border border-line bg-surface-muted px-3 py-3 text-left transition hover:border-line-strong hover:bg-surface-sunken md:hidden"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">
            {t("selectedCount", { selected: selected.length, total: allIds.length })}
          </p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            {allChecked ? t("allTopicsSelectedHint") : t("customSelectionHint")}
          </p>
        </div>
        <Icon
          name="chevronDown"
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${topicsOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`space-y-3 ${topicsOpen ? "block" : "hidden"} md:block`}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchTopics")}
          className="h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        <p className="hidden text-xs text-fg-subtle md:block">
          {t("selectedCount", { selected: selected.length, total: allIds.length })}
        </p>

        <div className="max-h-[min(45dvh,24rem)] overflow-y-auto overscroll-contain rounded-control border border-line-subtle bg-surface-muted/40 p-2 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:max-h-none md:overflow-visible md:border-0 md:bg-transparent md:p-0 md:pb-0">
          {filteredSubjects.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-fg-subtle">{t("noTopicsFound")}</p>
          ) : (
            <Checkbox.Group
              value={selected}
              onChange={(values) => onSelectedChange(values as number[])}
              className="block w-full [&_.ant-checkbox-wrapper]:flex! [&_.ant-checkbox-wrapper]:gap-2.5! [&_.ant-checkbox]:mt-0.5! [&_.ant-checkbox+span]:min-w-0 [&_.ant-checkbox+span]:flex-1 [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-success! [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-success! [&_.ant-checkbox-inner]:rounded-xs! [&_.ant-checkbox-wrapper]:m-0! [&_.ant-checkbox-wrapper]:w-full [&_.ant-checkbox-wrapper]:items-start! [&_.ant-checkbox-wrapper]:rounded-control [&_.ant-checkbox-wrapper]:px-3 [&_.ant-checkbox-wrapper]:py-1.5 [&_.ant-checkbox-wrapper]:hover:bg-surface-muted sm:[&_.ant-checkbox-wrapper]:py-2"
            >
              <div className="grid grid-cols-1 gap-0.5 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.map((s) => {
                  const idx = subjects.findIndex((subject) => subject.id === s.id);
                  return (
                    <div key={s.id} className="rounded-control">
                      <Checkbox value={s.id}>
                        <span className="text-xs font-semibold leading-snug text-fg sm:text-sm">
                          {idx + 1}. {s.name}
                        </span>
                      </Checkbox>
                    </div>
                  );
                })}
              </div>
            </Checkbox.Group>
          )}
        </div>
      </div>
    </div>
  );
}
