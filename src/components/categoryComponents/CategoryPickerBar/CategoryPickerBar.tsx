"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types/category";
import { getCategoryIconSrc } from "@/CONSTS/categoryAssets";

type CategoryPickerBarProps = {
  categories: Category[];
  activeCategoryId: number;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-4 w-4"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function CategoryPickerBar({
  categories,
  activeCategoryId,
}: CategoryPickerBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const handleSelect = (id: number) => {
    if (id === activeCategoryId) return;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("category", String(id));
    startTransition(() => {
      router.push(`/subjectpicker?${sp.toString()}`);
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
      inline: "center",
    });
  }, [activeCategoryId]);

  return (
    <div
      className={`relative ${isPending ? "pointer-events-none opacity-60" : ""}`}
    >
      <button
        type="button"
        aria-label="Previous categories"
        onClick={() => scrollByStep("left")}
        className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
      >
        <ChevronIcon direction="left" />
      </button>

      <button
        type="button"
        aria-label="Next categories"
        onClick={() => scrollByStep("right")}
        className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
      >
        <ChevronIcon direction="right" />
      </button>

      <div
        ref={trackRef}
        role="tablist"
        aria-label="License category"
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 sm:px-10 [&::-webkit-scrollbar]:hidden"
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
              <Image
                src={getCategoryIconSrc(cat.iconKey)}
                width={32}
                height={32}
                alt=""
                className={`h-8 w-8 shrink-0 ${active ? "brightness-0 invert" : "opacity-80"}`}
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
