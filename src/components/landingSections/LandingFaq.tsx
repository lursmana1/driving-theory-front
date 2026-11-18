import { LandingIcon } from "./LandingIcons";

type LandingFaqProps = {
  items: { key: string; label: string; children: string }[];
};

export default function LandingFaq({ items }: LandingFaqProps) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details
          key={item.key}
          className="landing-faq__item group border-b border-line"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-georgian text-base font-semibold text-fg transition-colors hover:text-accent md:text-lg [&::-webkit-details-marker]:hidden">
            <span className="text-left">{item.label}</span>
            {/* SVG, not a "▼" glyph: the glyph pulls in an extra symbols font file */}
            <LandingIcon
              name="chevron"
              className="h-5 w-5 shrink-0 text-fg-subtle transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="landing-faq__content pb-6">
            <p className="whitespace-pre-line text-body leading-7 text-fg-muted">
              {item.children}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
