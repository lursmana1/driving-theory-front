"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import TicketQuiz from "@/components/TicketsQuiz/TicketsQuiz";
import type { ExamQuestion } from "@/lib/types/exam";
import type { LessonCard as LessonCardData } from "@/lib/types/studyPlan";
import { examCtaPillBase } from "@/layoutComponents/Header/headerStyles";
import { PLAN_IMAGE_CLASS } from "@/CONSTS/studyPlan";
import { LineIcon } from "@/components/Icon/LineIcon";
import { LessonCard } from "./LessonCard";
import { PlanProgressBar } from "./PlanPrimitives";

type LessonItem =
  | { kind: "card"; card: LessonCardData; cardNumber: number }
  | { kind: "withoutCard" }
  | { kind: "question"; question: ExamQuestion };

/** Card → its tickets → next card → … → the lesson's tickets with no card. */
function buildItems(
  cards: LessonCardData[],
  questions: ExamQuestion[],
): LessonItem[] {
  const byId = new Map(questions.map((q) => [Number(q.id), q]));
  const taught = new Set<number>();
  const ticketsOf = (ids: number[]): LessonItem[] =>
    ids.flatMap((id) => {
      const question = byId.get(id);
      if (!question || taught.has(id)) return [];
      taught.add(id);
      return [{ kind: "question" as const, question }];
    });
  const items: LessonItem[] = cards.flatMap((card, i) => [
    { kind: "card" as const, card, cardNumber: i + 1 },
    ...ticketsOf(card.questionIds),
  ]);
  const rest = ticketsOf(questions.map((q) => Number(q.id)));
  if (rest.length) items.push({ kind: "withoutCard" }, ...rest);
  return items;
}

type PlanLessonRunnerProps = {
  /** The subject's sign group page; omitted for rule lessons. */
  signsHref?: string;
  /** The lesson's cards in order, each with its tickets. */
  cards: LessonCardData[];
  /** All the lesson's tickets in teaching order. */
  questions: ExamQuestion[];
  onFinish: () => void;
  /** Every pick, with whether it was right (day mistakes list). */
  onAnswered?: (questionId: number, correct: boolean) => void;
};

/**
 * A learn step of a card subject: teach a card, then ask its tickets, then
 * the next card. Answers are saved by TicketQuiz like any ticket.
 */
export function PlanLessonRunner({
  signsHref,
  cards,
  questions,
  onFinish,
  onAnswered,
}: PlanLessonRunnerProps) {
  const t = useTranslations("StudyPlan");
  const items = useMemo(() => buildItems(cards, questions), [cards, questions]);
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const isLast = position >= items.length - 1;
  const next = () => {
    if (isLast) onFinish();
    else setPosition((p) => p + 1);
  };
  const item = items[position];
  if (!item) return null;

  return (
    <div className="space-y-4">
      <LessonStrip cards={cards} items={items} position={position} />
      <PlanProgressBar value={position} max={items.length} className="h-1.5" />

      {item.kind === "card" && (
        <LessonCard
          key={item.card.id}
          card={item.card}
          signsHref={signsHref}
          onContinue={next}
          continueLabel={isLast ? t("finishStep") : undefined}
        />
      )}

      {item.kind === "withoutCard" && (
        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <h2 className="text-lg font-bold text-fg">{t("withoutCardTitle")}</h2>
          <button
            type="button"
            onClick={next}
            className={`mt-4 inline-flex h-11 items-center gap-2 px-5 text-sm ${examCtaPillBase}`}
          >
            {t("cardToTickets")}
            <LineIcon name="arrowRight" className="h-4 w-4" />
          </button>
        </div>
      )}

      {item.kind === "question" && (
        <QuestionStep
          question={item.question}
          selected={answers[String(item.question.id)] ?? null}
          onSelect={(key) => {
            setAnswers((a) => ({ ...a, [String(item.question.id)]: key }));
            onAnswered?.(
              Number(item.question.id),
              key === item.question.correct_answer,
            );
          }}
          onNext={next}
          nextLabel={isLast ? t("finishStep") : t("nextQuestion")}
        />
      )}
    </div>
  );
}

/** The lesson's cards as small chips, the current one highlighted. */
function LessonStrip({
  cards,
  items,
  position,
}: {
  cards: LessonCardData[];
  items: LessonItem[];
  position: number;
}) {
  const t = useTranslations("StudyPlan");
  // The nearest card or "no card" marker at or before the position. Past
  // the "no card" marker every card is done.
  let currentCard = 0;
  let pastCards = false;
  for (let i = Math.min(position, items.length - 1); i >= 0; i--) {
    const it = items[i];
    if (it.kind === "card") {
      currentCard = it.cardNumber;
      break;
    }
    if (it.kind === "withoutCard") {
      pastCards = true;
      break;
    }
  }
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1">
        {cards.map((card, i) => {
          const n = i + 1;
          const state =
            pastCards || n < currentCard
              ? "done"
              : n === currentCard
                ? "current"
                : "next";
          return (
            <span
              key={card.id}
              title={card.title}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control border p-1 ${
                state === "current"
                  ? "border-accent bg-surface shadow-glow"
                  : state === "done"
                    ? "border-success bg-success-soft"
                    : "border-line bg-surface opacity-60"
              }`}
            >
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- static sign SVG
                <img
                  src={card.image}
                  alt=""
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-2xs font-semibold text-fg-muted">
                  {n}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {currentCard > 0 && !pastCards && (
        <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
          {t("cardOf", { n: currentCard, total: cards.length })}
        </span>
      )}
    </div>
  );
}

function QuestionStep({
  question,
  selected,
  onSelect,
  onNext,
  nextLabel,
}: {
  question: ExamQuestion;
  selected: string | null;
  onSelect: (key: string) => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <>
      <div className="overflow-hidden rounded-card bg-stage pb-2 shadow-card">
        <TicketQuiz
          key={String(question.id)}
          question={question}
          selectedAnswer={selected}
          onSelect={onSelect}
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
            onClick={onNext}
            className={`inline-flex h-12 items-center gap-2 px-7 text-base shadow-raised ${examCtaPillBase}`}
          >
            {nextLabel}
            <LineIcon name="arrowRight" className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
