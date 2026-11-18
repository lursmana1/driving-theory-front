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

/** The answer's number: quiet until picked, then it takes the row's colour. */
function badgeStateClass(state: AnswerState) {
  switch (state) {
    case "idle":
      return "border-stage-line bg-stage-deep/60 text-stage-fg/70 group-hover:border-accent group-hover:text-stage-fg";
    case "pending":
      return "border-stage-fg/50 text-stage-fg";
    case "correct":
    case "wrong":
      return "border-on-accent/40 bg-on-accent/15 text-on-accent";
    case "muted":
      return "border-stage-line text-stage-fg/70";
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
      className={`group flex min-h-14 w-full min-w-0 items-center gap-3 rounded-control border px-3 py-3 text-left font-georgian leading-snug transition sm:min-h-16 sm:gap-3.5 sm:px-4 sm:py-4 ${answerStateClass(state)}`}
    >
      {/* The whole row is the target; the small number matches keys 1–4 on desktop. */}
      <span
        aria-hidden
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors ${badgeStateClass(state)}`}
      >
        {answerKey}
      </span>
      <span className="min-w-0 overflow-hidden wrap-break-word">{answerText}</span>
    </button>
  );
};

export default QuizButton;
