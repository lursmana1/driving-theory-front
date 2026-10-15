"use client";

import type { Editor } from "@tiptap/react";
import BaseApi from "@/api/BaseApi";
import { IMAGE_ICON } from "./constants";

type ToolbarImageProps = {
  editor: Editor;
};

const icon = <span className="text-sm font-medium">{IMAGE_ICON}</span>;

export default function ToolbarImage({ editor }: ToolbarImageProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await BaseApi.post<{ url: string }>(
        "/uploads/blog-image",
        fd,
      );
      editor.chain().focus().setImage({ src: res.data.url }).run();
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  return (
    <label
      title="Insert image"
      className="flex min-w-[28px] cursor-pointer items-center justify-center rounded-xs px-2 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-strong"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />
      {icon}
    </label>
  );
}
