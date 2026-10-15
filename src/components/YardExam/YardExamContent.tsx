import type { YardExamElement, YardExamItem } from "@/lib/types/yardExam";
import { isYardExamImageSrc } from "@/lib/types/yardExam";

type YardExamElementCardProps = {
  element: YardExamElement;
};

function PointsList({ items }: { items: YardExamItem[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item.code} className="flex gap-3 text-body leading-7 text-fg-muted">
          <span className="shrink-0 font-semibold text-fg">{item.code}</span>
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
    <article className="rounded-card border border-line bg-surface px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="font-georgian text-lg font-bold text-fg sm:text-xl">
        {element.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-fg-muted">{element.intro}</p>

      {imageSrc ? (
        <div className="relative mt-4 overflow-hidden rounded-control border border-line bg-surface-muted">
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
    <section className="rounded-card border border-line bg-surface px-4 py-5 sm:px-6 sm:py-6">
      <h2 className="font-georgian text-lg font-bold text-fg sm:text-xl">
        {title}
      </h2>
      <PointsList items={items} />
      <p className="mt-6 rounded-control bg-surface-muted px-4 py-3 text-sm leading-6 text-fg-muted">
        <span className="font-semibold text-fg">{noteLabel}: </span>
        {note}
      </p>
    </section>
  );
}
