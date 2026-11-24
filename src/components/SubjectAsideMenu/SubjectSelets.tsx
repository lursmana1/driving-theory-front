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
    if (sp.size) params.set("size", sp.size);
    if (value && value !== ALL) params.set("subjects", value);
    const query = params.toString();
    router.push(
      query ? `/tickets/${category}?${query}` : `/tickets/${category}`,
    );
  };

  return (
    <div className="w-full min-w-0 lg:hidden">
      <label
        htmlFor="tickets-subject-select"
        className="mb-2 block truncate text-sm font-medium text-fg-muted"
      >
        {label}
      </label>
      {/* antd's styles load lazily (AppShell → AntdTheme). The box is fixed-height so the
          ticket list never moves, and the classes below give the unstyled Select antd 6's
          final layout (flex row, centred text, 12px arrow, hidden input), so its text
          doesn't jump when the styles arrive. `!` pins what antd would otherwise change. */}
      <div className="h-12 overflow-hidden">
        <Select
          id="tickets-subject-select"
          size="large"
          className="relative flex! h-12! w-full min-w-0 items-center! rounded-control border border-line bg-surface px-3! py-0! text-base [&_.ant-select-content]:relative [&_.ant-select-content]:min-w-0 [&_.ant-select-content]:flex-1 [&_.ant-select-content]:truncate [&_.ant-select-input]:absolute [&_.ant-select-input]:inset-0 [&_.ant-select-input]:opacity-0 [&_.ant-select-suffix]:flex-none [&_.ant-select-suffix]:text-xs [&_.ant-select-suffix]:leading-none"
          classNames={{ popup: { root: "bg-surface!" } }}
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
    </div>
  );
}
