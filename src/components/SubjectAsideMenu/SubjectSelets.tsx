"use client";

import { useMemo } from "react";
import { Select } from "antd";
import { useRouter } from "@/i18n/navigation";

type Subject = { id: number; name: string };

type Props = {
  category: string;
  sp: Record<string, string | undefined>;
  subjects: Subject[];
  label: string;
  allSubjectsLabel: string;
};

const ALL = "all";

export default function SubjectSelectMobile({
  category,
  sp,
  subjects,
  label,
  allSubjectsLabel,
}: Props) {
  const router = useRouter();
  const selected = useMemo(
    () => (sp.subjects ?? "").trim() || ALL,
    [sp.subjects],
  );

  const handleChange = (value: string) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v != null && v !== "") params.set(k, v);
    });
    params.set("page", "1");
    if (value && value !== ALL) params.set("subjects", value);
    else params.delete("subjects");
    router.push(`/tickets/${category}?${params.toString()}`);
  };

  return (
    <div className="w-full min-w-0 lg:hidden">
      <label
        htmlFor="tickets-subject-select"
        className="mb-2 block truncate text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <Select
        id="tickets-subject-select"
        size="large"
        className="w-full min-w-0 [&_.ant-select-selector]:h-12! [&_.ant-select-selector]:bg-white! [&_.ant-select-selection-item]:leading-12!"
        classNames={{ popup: { root: "bg-white!" } }}
        popupMatchSelectWidth
        listHeight={240}
        value={selected}
        onChange={handleChange}
        options={[
          { value: ALL, label: allSubjectsLabel },
          ...subjects.map((s) => ({
            value: String(s.id),
            label: s.name,
          })),
        ]}
      />
    </div>
  );
}
