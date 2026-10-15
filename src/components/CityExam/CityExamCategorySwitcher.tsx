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
            className={`rounded-control border px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 ${
              active
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-surface text-fg-muted hover:border-line-strong hover:bg-surface-muted"
            }`}
          >
            {labels[cat.key]}
          </Link>
        );
      })}
    </div>
  );
}
