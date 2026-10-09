"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import TiptapToolbar from "./TiptapToolbar";
import { tiptapExtensions } from "./extensions";
import type { TiptapProps } from "./types";

export default function Tiptap({
  value = "",
  onChange,
  readonly = false,
  bare = false,
  status,
}: TiptapProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: value || "<p></p>",
    editable: !readonly,
    editorProps: {
      attributes: { class: "focus:outline-none min-h-[120px] px-2 py-1" },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "<p></p>";
    if (current !== next)
      editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readonly);
  }, [editor, readonly]);

  if (!editor) return null;

  const wrapperClass =
    bare && readonly
      ? ""
      : `overflow-hidden rounded-lg border ${
          status === "error" ? "border-red-500" : "border-slate-300"
        }`;

  return (
    <div className={wrapperClass || undefined}>
      {!readonly && <TiptapToolbar editor={editor} />}
      <div className="tiptap-prose">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
