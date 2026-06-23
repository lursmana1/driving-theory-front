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

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[url('/png/download.png')] bg-contain bg-center bg-no-repeat px-3 pb-3 sm:px-4 sm:pb-4 md:select-none"
      style={{ touchAction: "pan-y" }}
      {...(isSwipeEnabled ? swipeHandlers : {})}
    >
      <div
        key={qId}
        className={`flex min-h-full flex-col ${
          direction === "next"
            ? "animate-slide-in-next"
            : "animate-slide-in-prev"
        }`}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: dragOffset !== 0 ? "none" : undefined,
        }}
      >
        {!!question.hasImg && question.img && (
          <QuestionImage
            src={question.img}
            alt={question.question || ""}
            className="mb-3 max-h-44 sm:max-h-72 lg:max-h-[280px]"
            priority
          />
        )}

        <p className="font-georgian min-w-0 wrap-break-word rounded-md border border-white bg-black/50 p-3 text-sm text-white sm:p-4 mb-3 sm:mb-4">
          {question.question}
        </p>
      </div>
    </div>
  );
}
