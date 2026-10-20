import type { ExamQuestion } from "@/lib/types/exam";
import QuestionImage from "@/components/QuestionImage/QuestionImage";
type ExamQuestionContentProps = {
  question: ExamQuestion;
  direction: "next" | "prev";
  dragOffset: number;
  swipeHandlers: Record<string, unknown>;
  isSwipeEnabled: boolean;
};

export default function ExamQuestionContent({
  question,
  direction,
  dragOffset,
  swipeHandlers,
  isSwipeEnabled,
}: ExamQuestionContentProps) {
  const qId = String(question.id);
  const hasImage = !!question.hasImg && !!question.img;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 pb-3 sm:px-4 sm:pb-4 md:select-none"
      style={{ touchAction: "pan-y" }}
      {...(isSwipeEnabled ? swipeHandlers : {})}
    >
      <div className="relative flex min-h-full flex-col">
        <div
          key={qId}
          className={`relative z-10 flex min-h-full flex-col ${
            hasImage ? "" : "justify-center"
          } ${
            direction === "next"
              ? "animate-slide-in-next"
              : "animate-slide-in-prev"
          }`}
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: dragOffset !== 0 ? "none" : undefined,
          }}
        >
          {hasImage && question.img && (
            <QuestionImage
              src={question.img}
              alt={question.question || ""}
              className="mb-3 max-h-44 sm:max-h-72 lg:max-h-[280px]"
              priority
            />
          )}

          <p
            className={`font-georgian mb-3 min-w-0 wrap-break-word rounded-control border border-stage-line bg-stage-deep/60 font-medium tracking-wide text-stage-fg sm:mb-4 ${
              hasImage
                ? "flex-1 p-3 text-sm sm:p-4 sm:text-base"
                : "mx-auto w-full max-w-3xl p-5 text-base leading-relaxed sm:p-8 sm:text-lg"
            }`}
          >
            {question.question}
          </p>
        </div>
      </div>
    </div>
  );
}
