"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/Icon/Icon";

type Subject = { id: number; name: string };

type Props = {
  category: string;
  sp: Record<string, string | undefined>;
  subjects: Subject[];
  label: string;
  allSubjectsLabel: string;
};

export default function SubjectSelectMobile({
  category,
  sp,
  subjects,
  label,
  allSubjectsLabel,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => (sp.subjects ?? "").trim() || "",
    [sp.subjects],
  );
  const selectedLabel =
    selected === ""
      ? allSubjectsLabel
      : subjects.find((s) => String(s.id) === selected)?.name ?? allSubjectsLabel;

  const options = [
    { value: "", label: allSubjectsLabel },
    ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const handleSelect = (value: string) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v != null && v !== "") params.set(k, v);
    });
    params.set("page", "1");
    if (value) params.set("subjects", value);
    else params.delete("subjects");

    router.push(`/tickets/${category}?${params.toString()}`);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        open &&
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const dropdown = open && (
    <div
      ref={panelRef}
      className="fixed z-[9999] mt-1 max-h-64 min-w-[var(--trigger-width)] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
      style={{
        top: triggerRef.current
          ? triggerRef.current.getBoundingClientRect().bottom + 4
          : 0,
        left: triggerRef.current
          ? triggerRef.current.getBoundingClientRect().left
          : 0,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleSelect(opt.value)}
          className={`flex h-12 min-h-12 w-full items-center px-3 text-left text-sm transition ${
            opt.value === selected
              ? "bg-slate-100 font-medium text-slate-900"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="lg:hidden w-full min-w-0">
      <label className="mb-2 block truncate text-sm font-medium text-slate-700">
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (typeof document !== "undefined") {
            const rect = triggerRef.current?.getBoundingClientRect();
            document.documentElement.style.setProperty(
              "--trigger-width",
              rect ? `${rect.width}px` : "100%",
            );
          }
          setOpen((o) => !o);
        }}
        className="flex h-12 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <Icon
          name="chevronDown"
          className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
}
