"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Category } from "@/lib/types/category";
import { getCategoryIconSrc } from "@/CONSTS/categoryAssets";
import { CategoryIcon } from "@/components/categoryComponents/CategoryIcon";
import { buildCategoryPickerQuery } from "@/lib/searchParams";
import { Icon } from "@/components/Icon/Icon";

type CategoryPickerBarProps = {
  categories: Category[];
  activeCategoryId: number;
  pathname?: string;
  searchParams?: Record<string, string>;
};

export default function CategoryPickerBar({
  categories,
  activeCategoryId,
  pathname = "/subjectpicker",
  searchParams = {},
}: CategoryPickerBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const handleSelect = (id: number) => {
    if (id === activeCategoryId) return;
    const query = buildCategoryPickerQuery(searchParams, id);
    startTransition(() => {
      router.replace(`${pathname}?${query}`);
    });
  };

  const scrollByStep = useCallback((direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const step = Math.max(track.clientWidth * 0.6, 200);
    track.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const activeEl = itemRefs.current.get(activeCategoryId);
    activeEl?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeCategoryId]);

  return (
    <div
      className={`relative -mx-6 sm:-mx-8 ${isPending ? "pointer-events-none opacity-60" : ""}`}
    >
      <button
        type="button"
        aria-label="Previous categories"
        onClick={() => scrollByStep("left")}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition hover:border-slate-300 hover:bg-slate-50 sm:flex sm:left-6"
      >
        <Icon name="chevronLeft" className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label="Next categories"
        onClick={() => scrollByStep("right")}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition hover:border-slate-300 hover:bg-slate-50 sm:flex sm:right-6"
      >
        <Icon name="chevronRight" className="h-4 w-4" />
      </button>

      <div
        ref={trackRef}
        role="tablist"
        aria-label="License category"
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-6 py-1 scroll-px-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 sm:px-8 sm:scroll-px-8 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const active = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                if (el) itemRefs.current.set(cat.id, el);
                else itemRefs.current.delete(cat.id);
              }}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelect(cat.id)}
              className={`flex w-28 shrink-0 snap-center flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition sm:w-32 sm:px-4 sm:py-3.5 ${
                active
                  ? "border-slate-800 bg-slate-800 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <CategoryIcon
                src={getCategoryIconSrc(cat.iconKey, cat.id)}
                className="h-8 w-8"
                inverted={active}
              />
              <span className="font-georgian text-center text-xs font-semibold leading-tight sm:text-sm">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
