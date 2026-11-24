import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

const INTERNAL_HREF = /^(\/(?!\/)|#|https?:\/\/(www\.)?prava\.ge(\/|$|[?#]))/i;

/**
 * Tiptap's default puts rel="nofollow" + target="_blank" on every link. Links to prava.ge pages
 * should pass SEO value and open in the same tab; links to other sites stay nofollow + new tab.
 * Applied when rendering, so stored posts are fixed without editing them.
 */
const SiteLink = Link.extend({
  renderHTML(props) {
    const out = (this.parent?.(props) ?? ["a", props.HTMLAttributes, 0]) as unknown as [
      string,
      Record<string, unknown>,
      0,
    ];
    const attrs = { ...out[1] };
    const href = typeof attrs.href === "string" ? attrs.href : "";
    if (INTERNAL_HREF.test(href)) {
      delete attrs.rel;
      delete attrs.target;
    } else if (href) {
      attrs.rel = "noopener noreferrer nofollow";
      attrs.target = "_blank";
    }
    return ["a", attrs, 0];
  },
});

export const tiptapExtensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5] } }),
  TextStyle,
  Color,
  FontSize,
  SiteLink.configure({ openOnClick: false }),
  Image.configure({ inline: false }),
];
