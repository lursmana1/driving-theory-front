"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type QuestionIdSearchProps = {
  category: string;
  currentParams: { page?: string; size?: string; subjects?: string };
};

export default function QuestionIdSearch({
  category,
  currentParams,
}: QuestionIdSearchProps) {
  const t = useTranslations("Tickets");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const questionIdFromUrl = searchParams.get("questionId") ?? "";
  const [value, setValue] = useState(questionIdFromUrl);

  useEffect(() => {
    setValue(questionIdFromUrl);
  }, [questionIdFromUrl]);

  const handleSearch = useCallback(
    (id: string) => {
      const trimmed = id.trim();
      const params = new URLSearchParams();

      if (currentParams.size) params.set("size", currentParams.size);
      if (currentParams.subjects) params.set("subjects", currentParams.subjects);
      params.set("page", "1");

      if (trimmed) {
        params.set("questionId", trimmed);
      } else {
        params.delete("questionId");
      }

      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    },
    [currentParams, pathname, router],
  );

  const handleClear = () => {
    setValue("");
    handleSearch("");
  };

  return (
    <div className="flex w-full overflow-hidden rounded-lg bg-slate-50 md:w-auto md:min-w-48">
      <input
        type="text"
        placeholder={t("questionIdPlaceholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch(value)}
        className="h-12 w-full border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:border-0 focus:outline-none focus:ring-0 md:max-w-xs"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={t("clearSearch")}
          className="h-12 shrink-0 border-0 bg-transparent px-2 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-0"
        >
          <ClearIcon />
        </button>
      )}
      <button
        type="button"
        onClick={() => handleSearch(value)}
        className="h-12 shrink-0 border-0 bg-slate-100 px-4 text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-0"
      >
        {t("search")}
      </button>
    </div>
  );
}
