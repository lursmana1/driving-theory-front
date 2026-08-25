type QuizButtonProps = {
  selectAnswer: (value: string) => void;
  answerKey: string;
  answerText: string;
  selectedAnswer: string;
  correctAnswer: string;
  /** When false, the option is display-only (exam: pick from footer / keys). */
  interactive?: boolean;
};

function getAnswerStyles(
  hasSelected: boolean,
  isThisSelected: boolean,
  isThisCorrect: boolean,
  interactive: boolean,
) {
  if (!hasSelected) {
    return interactive
      ? "cursor-pointer border-gray-300 text-white hover:border-blue-300"
      : "cursor-default border-gray-300 text-white";
  }

  if (isThisCorrect) {
    return "border-[#c3e6cb] bg-[#05c300c9] text-white";
  }

  if (isThisSelected) {
    return "border-[#f5c6cb] bg-[#ff3346a8] text-white";
  }

  return "border-gray-300 text-white opacity-70";
}

const QuizButton = ({
  selectAnswer,
  answerKey,
  answerText,
  selectedAnswer,
  correctAnswer,
  interactive = true,
}: QuizButtonProps) => {
  const hasSelected = Boolean(selectedAnswer);
  const isThisSelected = selectedAnswer === answerKey;
  const isThisCorrect = answerKey === correctAnswer;
  const canClick = interactive && !hasSelected;

  return (
    <button
      type="button"
      onClick={() => {
        if (!canClick) return;
        selectAnswer(answerKey);
      }}
      disabled={!canClick}
      className={`flex w-full min-w-0 items-center gap-2 rounded border p-3 text-left font-georgian leading-snug transition sm:gap-4 sm:p-4 ${getAnswerStyles(hasSelected, isThisSelected, isThisCorrect, interactive)}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-gray-400 bg-gray-100 text-base font-bold text-black shadow-sm sm:h-12 sm:w-14 sm:text-lg">
        {answerKey}
      </span>
      <span className="min-w-0 overflow-hidden wrap-break-word">{answerText}</span>
    </button>
  );
};

export default QuizButton;
