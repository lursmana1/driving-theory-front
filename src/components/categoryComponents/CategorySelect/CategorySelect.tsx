"use client";

import { useTransition } from "react";
import { Select } from "antd";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Category } from "@/lib/types/category";
import { getCategoryIconSrc } from "@/CONSTS/categoryAssets";
import { CategoryIcon } from "@/components/categoryComponents/CategoryIcon";

type CategorySelectProps = {
  categories: Category[];
  activeCategoryId: number;
};

const CategorySelect = ({
  categories,
  activeCategoryId,
}: CategorySelectProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (id: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("category", String(id));
    startTransition(() => {
      router.push(`/subjectpicker?${sp.toString()}`);
    });
  };

  const options = categories.map((cat) => ({
    value: cat.id,
    label: (
      <span className="inline-flex items-center gap-3">
        <CategoryIcon
          src={getCategoryIconSrc(cat.iconKey, cat.id)}
          alt={cat.name}
        />
        <span className="text-lg font-semibold">{cat.name}</span>
      </span>
    ),
  }));

  return (
    <Select
      id="category-select"
      value={activeCategoryId}
      onChange={handleSelect}
      className="w-full [&_.ant-select-selector]:h-14! [&_.ant-select-selector]:bg-white! [&_.ant-select-selection-item]:text-lg! [&_.ant-select-selection-item]:leading-14!"
      classNames={{ popup: { root: "bg-white!" } }}
      size="large"
      options={options}
      optionRender={(option) => {
        const cat = categories.find((c) => c.id === option.value);
        if (!cat) return null;
        return (
          <div className="flex items-center gap-4 py-1">
            <CategoryIcon
              src={getCategoryIconSrc(cat.iconKey, cat.id)}
              alt={cat.name}
            />
            <span className="text-base font-semibold">{cat.name}</span>
            <span className="ml-auto text-sm font-semibold tabular-nums text-slate-500">
              {cat.examTotalQuestions}
            </span>
          </div>
        );
      }}
    />
  );
};

export default CategorySelect;
