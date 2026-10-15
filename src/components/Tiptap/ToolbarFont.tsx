"use client";

import type { Editor } from "@tiptap/react";
import { FONT_SIZES, COLORS } from "./constants";

type ToolbarFontProps = {
  editor: Editor;
  textStyle: Record<string, unknown>;
};

export default function ToolbarFont({ editor, textStyle }: ToolbarFontProps) {
  return (
    <div className="flex items-center gap-0.5">
      <select
        value={(textStyle.fontSize as string) ?? "16px"}
        onChange={(e) =>
          editor.chain().focus().setFontSize(e.target.value).run()
        }
        className="rounded-xs border border-line bg-surface px-2 py-1 text-sm text-fg-muted hover:border-line-strong"
        title="Font size"
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <div className="flex gap-1" title="Font color">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => editor.chain().focus().setColor(color).run()}
            className={`h-6 w-6 shrink-0 rounded-xs border-2 transition-colors ${
              textStyle.color === color
                ? "border-fg ring-2 ring-line-strong"
                : "border-line hover:border-line-strong"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
