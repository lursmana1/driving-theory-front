type QuizButtonProps = {
  selectAnswer: (value: string) => void;
  answerKey: string;
  answerText: string;
  selectedAnswer: string;
  /** Withheld during a live exam — the API only reveals it once the attempt ends. */
  correctAnswer?: string;
  /** Server verdict for the pick, used when `correctAnswer` is withheld. */
  selectedCorrect?: boolean | null;
  /** When false, the option is display-only (exam: pick from footer / keys). */
  interactive?: boolean;
};

type AnswerState = "idle" | "pending" | "correct" | "wrong" | "muted";

function resolveAnswerState(
  isThisSelected: boolean,
  hasSelected: boolean,
  answerKey: string,
  correctAnswer: string | undefined,
  selectedCorrect: boolean | null | undefined,
): AnswerState {
  if (!hasSelected) return "idle";

  if (correctAnswer) {
    if (answerKey === correctAnswer) return "correct";
    return isThisSelected ? "wrong" : "muted";
  }

  if (!isThisSelected) return "muted";
  if (selectedCorrect == null) return "pending";
  return selectedCorrect ? "correct" : "wrong";
}

function answerStateClass(state: AnswerState, interactive: boolean) {
  switch (state) {
    case "idle":
      return interactive
        ? "cursor-pointer border-gray-300 text-white hover:border-blue-300"
        : "cursor-default border-gray-300 text-white";
    case "pending":
      return "border-white/70 bg-white/10 text-white";
    case "correct":
      return "border-[#c3e6cb] bg-[#05c300c9] text-white";
    case "wrong":
      return "border-[#f5c6cb] bg-[#ff3346a8] text-white";
    case "muted":
      return "border-gray-300 text-white opacity-70";
  }
}

const QuizButton = ({
  selectAnswer,
  answerKey,
  answerText,
  selectedAnswer,
  correctAnswer,
  selectedCorrect,
  interactive = true,
}: QuizButtonProps) => {
  const hasSelected = Boolean(selectedAnswer);
  const isThisSelected = selectedAnswer === answerKey;
  const canClick = interactive && !hasSelected;
  const state = resolveAnswerState(
    isThisSelected,
    hasSelected,
    answerKey,
    correctAnswer,
    selectedCorrect,
  );

  return (
    <button
      type="button"
      onClick={() => {
        if (!canClick) return;
        selectAnswer(answerKey);
      }}
      disabled={!canClick}
      className={`flex w-full min-w-0 items-center gap-2 rounded border p-3 text-left font-georgian leading-snug transition sm:gap-4 sm:p-4 ${answerStateClass(state, interactive)}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-gray-400 bg-gray-100 text-base font-bold text-black shadow-sm sm:h-12 sm:w-14 sm:text-lg">
        {answerKey}
      </span>
      <span className="min-w-0 overflow-hidden wrap-break-word">{answerText}</span>
    </button>
  );
};

export default QuizButton;
