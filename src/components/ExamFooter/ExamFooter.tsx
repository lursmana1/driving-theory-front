import Image from "next/image";
import leftSide from "../../../public/png/left.png";
import rightSide from "../../../public/png/right.png";

type ExamFooterProps = {
  questions: {
    key: string;
    text: string | null;
  }[];
  showPrevious?: () => void;
  showNext?: () => void;
  selectAnswer: (key: string) => void;
  selectedAnswer?: string;
  correctAnswer?: string;
  };

const footerKeyButtonBase =
  "flex flex-1 sm:flex-none items-center justify-center min-w-11 h-11 sm:min-w-14 sm:h-14 rounded-md border border-gray-400 font-bold text-base sm:text-lg shadow-sm transition";

const ExamFooter = (props: ExamFooterProps) => {
  const navigationVisibility = !!props.showNext;
  return (
    <div className="flex w-full shrink-0 items-center justify-between gap-2 px-1 py-2 sm:px-2">
      {navigationVisibility && (
        <button
          onClick={props.showPrevious}
          className="p-1.5 sm:p-2 flex justify-center items-center bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer shrink-0"
        >
          <Image
            src={leftSide}
            alt=""
            width={32}
            height={32}
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </button>
      )}

      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 scrollbar-thin sm:justify-center">
        {props.questions.map((question) => {
          const hasSelected = Boolean(props.selectedAnswer);
          const isCorrect = question.key === props.correctAnswer;
          const isSelected = question.key === props.selectedAnswer;

          let stateClass =
            "cursor-pointer border-gray-400 bg-gray-100 text-black hover:bg-gray-200";

          if (hasSelected) {
            if (isCorrect) {
              stateClass =
                "cursor-default border-[#c3e6cb] bg-[#05c300c9] text-white";
            } else if (isSelected) {
              stateClass =
                "cursor-default border-[#f5c6cb] bg-[#ff3346a8] text-white";
            } else {
              stateClass =
                "cursor-default border-gray-300 bg-gray-200 text-gray-500 opacity-60";
            }
          }

          return (
            <button
              key={question.key}
              type="button"
              onClick={() => !hasSelected && props.selectAnswer(question.key)}
              disabled={hasSelected}
              className={`${footerKeyButtonBase} ${stateClass}`}
            >
              {question.key}
            </button>
          );
        })}
      </div>

      {navigationVisibility && (
        <button
          onClick={props.showNext}
          className="p-1.5 sm:p-2 flex justify-center items-center bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer shrink-0"
        >
          <Image
            src={rightSide}
            width={32}
            height={32}
            alt="Next"
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
        </button>
      )}
    </div>
  );
};

export default ExamFooter;
