"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import ToolbarButton from "./ToolbarButton";

type ToolbarLinkProps = {
  editor: Editor;
};

export default function ToolbarLink({ editor }: ToolbarLinkProps) {
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");

  const handleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      setShowInput(false);
      setUrl("");
      return;
    }
    const previousUrl = editor.getAttributes("link").href;
    setUrl(previousUrl || "");
    setShowInput(true);
  };

  const handleAdd = () => {
    if (url.trim()) {
      editor.chain().focus().setLink({ href: url.trim() }).run();
    }
    setShowInput(false);
    setUrl("");
  };

  return (
    <div className="relative">
      <ToolbarButton
        onClick={handleLink}
        active={editor.isActive("link")}
        title="Link"
      >
        <span className="text-sm font-medium">🔗</span>
      </ToolbarButton>
      {showInput && (
        <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded border border-slate-200 bg-white p-2 shadow-lg">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="https://"
            className="w-48 rounded border border-slate-200 px-2 py-1 text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded bg-accent px-2 py-1 text-sm text-white"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setUrl("");
            }}
            className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
