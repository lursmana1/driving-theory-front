import type { YardExamElement, YardExamItem } from "@/lib/types/yardExam";
import { isYardExamImageSrc } from "@/lib/types/yardExam";

type YardExamElementCardProps = {
  element: YardExamElement;
};

function PointsList({ items }: { items: YardExamItem[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item.code} className="flex gap-3 text-[15px] leading-7 text-slate-700">
          <span className="shrink-0 font-semibold text-slate-900">{item.code}</span>
          <span className="min-w-0 flex-1">
            {item.text}
            {item.points ? (
              <span className="ml-1 font-medium text-accent">({item.points})</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function YardExamElementCard({ element }: YardExamElementCardProps) {
  const imageSrc = isYardExamImageSrc(element.image) ? element.image : null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="font-georgian text-lg font-bold text-slate-900 sm:text-xl">
        {element.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{element.intro}</p>

      {imageSrc ? (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs */}
          <img
            src={imageSrc}
            alt={element.title}
            className="mx-auto max-h-80 w-full object-contain object-center"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}

      <PointsList items={element.items} />
    </article>
  );
}

export function YardExamGeneralSection({
  title,
  items,
  note,
  noteLabel,
}: {
  title: string;
  items: YardExamItem[];
  note: string;
  noteLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="font-georgian text-lg font-bold text-slate-900 sm:text-xl">
        {title}
      </h2>
      <PointsList items={items} />
      <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        <span className="font-semibold text-slate-800">{noteLabel}: </span>
        {note}
      </p>
    </section>
  );
}
