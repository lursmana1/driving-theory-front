"use client";

import { useEffect, useRef } from "react";

type ImageUploadInputProps = {
  value?: File | null;
  onChange?: (file: File | null) => void;
  /** Set by Ant Design Form.Item when validation fails. */
  status?: "error" | "warning" | "validating" | "";
};

export default function ImageUploadInput({
  value,
  onChange,
  status,
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value && inputRef.current) inputRef.current.value = "";
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex w-full items-center justify-center gap-2 rounded-control border-2 border-dashed bg-surface-muted px-4 py-6 text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg ${
          status === "error"
            ? "border-danger"
            : "border-line-strong hover:border-accent/50"
        }`}
      >
        <span className="text-sm font-medium">
          {value ? value.name : "Click to select image"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onChange?.(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </div>
  );
}
