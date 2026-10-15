"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/Icon/Icon";

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
    <div className="flex w-full overflow-hidden rounded-control bg-surface-muted md:w-auto md:min-w-48">
      <input
        type="text"
        placeholder={t("questionIdPlaceholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch(value)}
        className="h-12 w-full border-0 bg-transparent px-3 py-2 text-fg placeholder:text-fg-faint outline-none focus:border-0 focus:outline-none focus:ring-0 md:max-w-xs"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={t("clearSearch")}
          className="h-12 shrink-0 border-0 bg-transparent px-2 text-fg-faint transition hover:text-fg-muted focus:outline-none focus:ring-0"
        >
          <Icon name="close" className="h-4.5 w-4.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => handleSearch(value)}
        className="h-12 shrink-0 border-0 bg-surface-sunken px-4 text-fg-muted transition hover:bg-surface-strong focus:outline-none focus:ring-0"
      >
        {t("search")}
      </button>
    </div>
  );
}
