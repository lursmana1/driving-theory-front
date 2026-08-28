import QuizButton from "../QuizButton/QuizButton";

type ExamAnswerButtonsProps = {
  answers: { key: string; text: string | null }[];
  selectedAnswer: string | null;
  correctAnswer?: string;
  selectedCorrect?: boolean | null;
  onSelect: (key: string) => void;
};

export default function ExamAnswerButtons({
  answers,
  selectedAnswer,
  correctAnswer,
  selectedCorrect,
  onSelect,
}: ExamAnswerButtonsProps) {
  return (
    <div className="shrink-0 px-3 pb-2 sm:px-4 sm:pb-3">
      <div className="grid grid-cols-1 gap-2 min-w-0 sm:grid-cols-2">
        {answers.map((a) => (
          <QuizButton
            key={a.key}
            selectAnswer={onSelect}
            answerKey={a.key}
            answerText={a.text as string}
            selectedAnswer={selectedAnswer || ""}
            correctAnswer={correctAnswer}
            selectedCorrect={selectedCorrect}
            interactive={false}
          />
        ))}
      </div>
    </div>
  );
}
