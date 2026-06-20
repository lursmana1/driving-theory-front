type LandingFaqProps = {
  items: { key: string; label: string; children: string }[];
};

export default function LandingFaq({ items }: LandingFaqProps) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <details
          key={item.key}
          className="group rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm transition hover:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-4 font-georgian text-base font-medium text-slate-900 transition-colors hover:bg-slate-50 md:text-lg [&::-webkit-details-marker]:hidden">
            <span className="text-left">{item.label}</span>
            <span className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="border-t border-slate-100 px-4 pb-4 pt-2">
            <p className="text-sm leading-relaxed text-slate-600">{item.children}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
