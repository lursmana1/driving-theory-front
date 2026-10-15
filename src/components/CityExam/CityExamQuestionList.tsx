import type { CityExamQuestion } from "@/lib/types/cityExam";

type CityExamQuestionListProps = {
  questions: { id: string; item: CityExamQuestion }[];
  verbalLabel: string;
  practicalLabel: string;
};

export default function CityExamQuestionList({
  questions,
  verbalLabel,
  practicalLabel,
}: CityExamQuestionListProps) {
  return (
    <div className="border-t border-line">
      {questions.map(({ id, item }) => (
        <details
          key={id}
          className="group border-b border-line"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <div className="min-w-0 flex-1 text-left">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-fg-faint">
                  #{id}
                </span>
                <span className="text-xs font-medium text-accent">
                  {item.topic}
                </span>
                {item.type ? (
                  <span className="rounded-xs bg-surface-sunken px-1.5 py-0.5 text-2xs font-medium text-fg-muted">
                    {item.type === "practical" ? practicalLabel : verbalLabel}
                  </span>
                ) : null}
              </div>
              <p className="font-georgian text-base font-semibold text-fg md:text-lg">
                {item.question}
              </p>
            </div>
            <span
              aria-hidden
              className="mt-1 shrink-0 text-sm text-fg-faint transition-transform duration-200 group-open:rotate-180"
            >
              ▼
            </span>
          </summary>
          <div className="pb-6">
            <p className="whitespace-pre-line text-body leading-7 text-fg-muted">
              {item.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
