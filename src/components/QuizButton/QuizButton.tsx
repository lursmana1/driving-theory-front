type QuizButtonProps = {
  selectAnswer: (value: string) => void;
  answerKey: string;
  answerText: string;
  selectedAnswer: string;
  correctAnswer: string;
};

function getAnswerStyles(
  hasSelected: boolean,
  isThisSelected: boolean,
  isThisCorrect: boolean,
) {
  if (!hasSelected) {
    return "cursor-pointer text-white active:bg-white/10";
  }

  if (isThisCorrect) {
    return "bg-[#05c300c9] text-white";
  }

  if (isThisSelected) {
    return "bg-[#ff3346a8] text-white";
  }

  return "text-white opacity-55";
}

const QuizButton = ({
  selectAnswer,
  answerKey,
  answerText,
  selectedAnswer,
  correctAnswer,
}: QuizButtonProps) => {
  const hasSelected = Boolean(selectedAnswer);
  const isThisSelected = selectedAnswer === answerKey;
  const isThisCorrect = answerKey === correctAnswer;

  return (
    <button
      type="button"
      onClick={() => selectAnswer(answerKey)}
      disabled={hasSelected}
      className={`flex w-full min-w-0 items-start gap-3 rounded-lg p-2 text-left font-georgian leading-snug transition sm:items-center sm:gap-4 sm:p-3 ${getAnswerStyles(hasSelected, isThisSelected, isThisCorrect)}`}
    >
      <span className="flex h-12 min-w-12 w-12 shrink-0 items-center justify-center rounded-md border border-gray-400 bg-gray-100 text-lg font-bold text-black shadow-sm sm:h-12 sm:min-w-14 sm:w-14">
        {answerKey}
      </span>
      <span className="min-w-0 flex-1 pt-1 text-[15px] leading-relaxed wrap-break-word sm:pt-0 sm:text-base">
        {answerText}
      </span>
    </button>
  );
};

export default QuizButton;
