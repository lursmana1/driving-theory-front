import "server-only";
import { generateJSON } from "@tiptap/html/server";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { tiptapExtensions } from "@/components/Tiptap/extensions";

/**
 * Blog post body, rendered on the server with the editor's own extensions, so the text,
 * headings and links are in the page HTML (crawlers that don't run JavaScript see them too)
 * and the editor's JavaScript is not shipped to readers. The HTML goes through the editor
 * schema: anything it doesn't know (scripts, event handlers, unknown tags) is dropped.
 * Same wrapper classes as the read-only editor (`.tiptap-prose`), so it looks identical.
 */
export default function BlogContent({ html }: { html: string }) {
  const content = generateJSON(html || "<p></p>", tiptapExtensions);
  return (
    <div className="tiptap-prose">
      {/* px-2 py-1 = the read-only editor's own padding (Tiptap.tsx editorProps), so the layout matches. */}
      <div className="tiptap px-2 py-1">{renderToReactElement({ content, extensions: tiptapExtensions })}</div>
    </div>
  );
}
