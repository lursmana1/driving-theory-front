type QuizButtonProps = {
  selectAnswer: (value: string) => void;
  answerKey: string;
  answerText: string;
  selectedAnswer: string;
  /** Withheld during a live exam — the API only reveals it once the attempt ends. */
  correctAnswer?: string;
  /** Server verdict for the pick, used when `correctAnswer` is withheld. */
  selectedCorrect?: boolean | null;
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

function answerStateClass(state: AnswerState) {
  switch (state) {
    case "idle":
      return "cursor-pointer border-stage-line bg-stage-raised/50 text-stage-fg hover:border-accent hover:bg-stage-raised";
    case "pending":
      return "border-stage-fg/70 bg-stage-fg/10 text-stage-fg";
    case "correct":
      return "border-stage-success bg-success text-on-accent";
    case "wrong":
      return "border-stage-danger bg-danger text-on-accent";
    case "muted":
      return "border-stage-line text-stage-fg opacity-60";
  }
}

const QuizButton = ({
  selectAnswer,
  answerKey,
  answerText,
  selectedAnswer,
  correctAnswer,
  selectedCorrect,
}: QuizButtonProps) => {
  const hasSelected = Boolean(selectedAnswer);
  const isThisSelected = selectedAnswer === answerKey;
  const canClick = !hasSelected;
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
      className={`flex w-full min-w-0 items-center gap-2 rounded-control border p-3 text-left font-georgian leading-snug transition sm:gap-4 sm:p-4 ${answerStateClass(state)}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs bg-stage-fg text-base font-bold text-fg shadow-card sm:h-12 sm:w-14 sm:text-lg">
        {answerKey}
      </span>
      <span className="min-w-0 overflow-hidden wrap-break-word">{answerText}</span>
    </button>
  );
};

export default QuizButton;
