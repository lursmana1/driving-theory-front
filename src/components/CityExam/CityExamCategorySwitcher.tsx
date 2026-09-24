"use client";

import { Link } from "@/i18n/navigation";
import type { CityExamCategoryKey } from "@/lib/types/cityExam";
import { CITY_EXAM_CATEGORIES } from "@/CONSTS/cityExam";

type CityExamCategorySwitcherProps = {
  activeKey: CityExamCategoryKey;
  labels: Record<CityExamCategoryKey, string>;
};

export default function CityExamCategorySwitcher({
  activeKey,
  labels,
}: CityExamCategorySwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="City exam categories"
      className="flex flex-wrap gap-2"
    >
      {CITY_EXAM_CATEGORIES.map((cat) => {
        const active = cat.key === activeKey;
        const href =
          cat.key === "b" ? "/city-exam" : `/city-exam?cat=${cat.key}`;
        return (
          <Link
            key={cat.key}
            href={href}
            role="tab"
            aria-selected={active}
            scroll={false}
            className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 ${
              active
                ? "border-accent bg-accent text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {labels[cat.key]}
          </Link>
        );
      })}
    </div>
  );
}
