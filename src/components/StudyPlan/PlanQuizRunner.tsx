"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import TicketQuiz from "@/components/TicketsQuiz/TicketsQuiz";
import type { ExamQuestion } from "@/lib/types/exam";
import useArrowNavigation from "@/utills/helpers/hooks/useArrowNavigation";
import { examCtaPillBase } from "@/layoutComponents/Header/headerStyles";
import { PLAN_IMAGE_CLASS } from "@/CONSTS/studyPlan";
import { LineIcon } from "@/components/Icon/LineIcon";
import { PlanProgressBar } from "./PlanPrimitives";

type PlanQuizRunnerProps = {
  questions: ExamQuestion[];
  /** Shown above the first question (lesson intro). */
  intro?: React.ReactNode;
  onFinish: () => void;
  /** Every pick, with whether it was right (day mistakes list). */
  onAnswered?: (questionId: number, correct: boolean) => void;
  /** Finish button label; defaults to "finish step". */
  finishLabel?: string;
};

/**
 * Lesson / mixed round: one question at a time with the ticket view
 * (answer → right/wrong, AI explanation, audio). Answers are saved through
 * POST /practice-answers when signed in (TicketQuiz does it).
 */
export function PlanQuizRunner({
  questions,
  intro,
  onFinish,
  onAnswered,
  finishLabel,
}: PlanQuizRunnerProps) {
  const t = useTranslations("StudyPlan");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const question = questions[index];
  const isLast = index >= questions.length - 1;

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIndex((i) => Math.min(questions.length - 1, i + 1)),
    [questions.length],
  );
  useArrowNavigation(prev, next);

  if (!question) return null;
  const id = String(question.id);
  const selected = answers[id] ?? null;
  const answered = Object.keys(answers).length;
  const right = questions.filter(
    (q) => answers[String(q.id)] === q.correct_answer,
  ).length;
  const wrong = answered - right;

  return (
    <div className="space-y-4">
      {index === 0 && intro}
      <div className="flex items-center gap-3">
        <span className="flex shrink-0 gap-2 text-xs font-semibold tabular-nums">
          <span className="inline-flex items-center gap-0.5 text-success">
            <LineIcon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
            {right}
          </span>
          <span className="inline-flex items-center gap-0.5 text-danger">
            <LineIcon name="x" className="h-3.5 w-3.5" strokeWidth={3} />
            {wrong}
          </span>
        </span>
        <PlanProgressBar
          value={answered}
          max={questions.length}
          className="h-1.5 flex-1"
        />
        <span className="text-xs tabular-nums text-fg-subtle">
          {t("questionOf", { n: index + 1, total: questions.length })}
        </span>
      </div>
      <div className="overflow-hidden rounded-card bg-stage pb-2 shadow-card">
        <TicketQuiz
          key={id}
          question={question}
          questionIndex={index + 1}
          selectedAnswer={selected}
          onSelect={(key) => {
            setAnswers((a) => ({ ...a, [id]: key }));
            onAnswered?.(Number(question.id), key === question.correct_answer);
          }}
          onPrevious={prev}
          onNext={next}
          keyboard
          priority
          imageClassName={PLAN_IMAGE_CLASS}
          revealExplanation
        />
      </div>
      {selected && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={isLast ? onFinish : next}
            className={`inline-flex h-12 items-center gap-2 px-7 text-base shadow-raised ${examCtaPillBase}`}
          >
            {isLast ? (finishLabel ?? t("finishStep")) : t("nextQuestion")}
            <LineIcon name="arrowRight" className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
