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
  /** Withheld during a live exam until the attempt is finished. */
  correctAnswer?: string;
  /** Server verdict for the pick, used when `correctAnswer` is withheld. */
  selectedCorrect?: boolean | null;
  };

const footerKeyButtonBase =
  "flex flex-1 sm:flex-none items-center justify-center min-w-11 h-11 sm:min-w-14 sm:h-14 rounded-xs border font-bold text-base sm:text-lg shadow-card transition";

const ExamFooter = (props: ExamFooterProps) => {
  const navigationVisibility = !!props.showNext;
  return (
    <div className="flex w-full shrink-0 items-center justify-between gap-2 px-1 py-2 sm:px-2">
      {navigationVisibility && (
        <button
          onClick={props.showPrevious}
          className="p-1.5 sm:p-2 flex justify-center items-center rounded-xs bg-stage-fg hover:bg-surface-strong cursor-pointer transition shrink-0"
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

          const correctClass =
            "cursor-default border-stage-success bg-success text-on-accent";
          const wrongClass =
            "cursor-default border-stage-danger bg-danger text-on-accent";
          const mutedClass =
            "cursor-default border-stage-line bg-stage-raised text-stage-fg/60 opacity-60";

          let stateClass =
            "cursor-pointer border-transparent bg-stage-fg text-fg hover:bg-surface-strong";

          if (hasSelected) {
            if (props.correctAnswer) {
              stateClass = isCorrect
                ? correctClass
                : isSelected
                  ? wrongClass
                  : mutedClass;
            } else if (!isSelected) {
              stateClass = mutedClass;
            } else if (props.selectedCorrect == null) {
              stateClass =
                "cursor-default border-stage-fg bg-stage-fg/30 text-stage-fg";
            } else {
              stateClass = props.selectedCorrect ? correctClass : wrongClass;
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
          className="p-1.5 sm:p-2 flex justify-center items-center rounded-xs bg-stage-fg hover:bg-surface-strong cursor-pointer transition shrink-0"
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
