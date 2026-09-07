type LandingFaqProps = {
  items: { key: string; label: string; children: string }[];
};

export default function LandingFaq({ items }: LandingFaqProps) {
  return (
    <div className="border-t border-hairline">
      {items.map((item) => (
        <details
          key={item.key}
          className="landing-faq__item group border-b border-hairline"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-georgian text-base font-semibold text-ink transition-colors hover:text-accent md:text-lg [&::-webkit-details-marker]:hidden">
            <span className="text-left">{item.label}</span>
            <span
              aria-hidden
              className="shrink-0 text-sm text-olive/60 transition-transform duration-200 group-open:rotate-180"
            >
              ▼
            </span>
          </summary>
          <div className="landing-faq__content pb-6">
            <p className="whitespace-pre-line text-[15px] leading-7 text-ink/70">
              {item.children}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
