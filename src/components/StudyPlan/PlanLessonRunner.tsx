"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import TicketQuiz from "@/components/TicketsQuiz/TicketsQuiz";
import type { ExamQuestion } from "@/lib/types/exam";
import type {
  CardLesson,
  LessonCard as LessonCardData,
} from "@/lib/types/studyPlan";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { PLAN_IMAGE_CLASS, SUBJECT_SIGN_GROUP } from "@/CONSTS/studyPlan";
import { signGroupHref } from "@/CONSTS/signGroups";
import { LineIcon } from "@/components/Icon/LineIcon";
import { LessonCard } from "./LessonCard";
import { PlanProgressBar } from "./PlanPrimitives";

type LessonItem =
  | { kind: "card"; card: LessonCardData; cardNumber: number }
  | { kind: "withoutCard" }
  | { kind: "question"; question: ExamQuestion };

/** Card → its tickets → next card → … → tickets with no card. */
function buildItems(lesson: CardLesson): LessonItem[] {
  const byId = new Map(lesson.questions.map((q) => [Number(q.id), q]));
  const ticketsOf = (ids: number[]): LessonItem[] =>
    ids.flatMap((id) => {
      const question = byId.get(id);
      return question ? [{ kind: "question" as const, question }] : [];
    });
  const items: LessonItem[] = lesson.cards.flatMap((card, i) => [
    { kind: "card" as const, card, cardNumber: lesson.from + i + 1 },
    ...ticketsOf(card.questionIds),
  ]);
  const rest = ticketsOf(lesson.withoutCard);
  if (rest.length) items.push({ kind: "withoutCard" }, ...rest);
  return items;
}

type PlanLessonRunnerProps = {
  lesson: CardLesson;
  /** Shown when there are more cards after this page. */
  onNextCards?: () => void;
};

export function PlanLessonRunner({
  lesson,
  onNextCards,
}: PlanLessonRunnerProps) {
  const t = useTranslations("StudyPlan");
  const items = useMemo(() => buildItems(lesson), [lesson]);
  const signGroup = SUBJECT_SIGN_GROUP[lesson.subjectId];
  const signsHref = signGroup ? signGroupHref(signGroup) : undefined;
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questionCount = items.filter((i) => i.kind === "question").length;
  const right = lesson.questions.filter(
    (q) => answers[String(q.id)] === q.correct_answer,
  ).length;
  const next = () => setPosition((p) => p + 1);
  const item = items[position];

  if (!item) {
    return (
      <div className="space-y-4 rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <LineIcon name="trophy" className="mx-auto h-10 w-10 text-success" />
        <h2 className="text-xl font-bold text-fg">{t("lessonDoneTitle")}</h2>
        <p className="text-fg-muted">
          {t("lessonDoneBody", {
            cards: lesson.cards.length,
            right,
            total: questionCount,
          })}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setPosition(0);
            }}
            className={`inline-flex h-11 items-center px-5 text-sm ${outlinePillBase}`}
          >
            {t("restartLesson")}
          </button>
          {onNextCards && (
            <button
              type="button"
              onClick={onNextCards}
              className={`inline-flex h-11 items-center gap-2 px-5 text-sm ${examCtaPillBase}`}
            >
              {t("nextCards")}
              <LineIcon name="arrowRight" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LessonStrip lesson={lesson} items={items} position={position} />
      <PlanProgressBar value={position} max={items.length} className="h-1.5" />

      {item.kind === "card" && (
        <LessonCard
          key={item.card.id}
          card={item.card}
          signsHref={signsHref}
          onContinue={next}
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
          onSelect={(key) =>
            setAnswers((a) => ({ ...a, [String(item.question.id)]: key }))
          }
          onNext={next}
        />
      )}
    </div>
  );
}

/** The lesson's cards as small chips, the current one highlighted. */
function LessonStrip({
  lesson,
  items,
  position,
}: {
  lesson: CardLesson;
  items: LessonItem[];
  position: number;
}) {
  const t = useTranslations("StudyPlan");
  let currentCard = 0;
  for (let i = 0; i <= position && i < items.length; i++) {
    const it = items[i];
    if (it.kind === "card") currentCard = it.cardNumber;
  }
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1">
        {lesson.cards.map((card, i) => {
          const n = lesson.from + i + 1;
          const state =
            n < currentCard ? "done" : n === currentCard ? "current" : "next";
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
      {/* A page of only "without card" tickets has no current card. */}
      {currentCard > 0 && (
        <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
          {t("cardOf", { n: currentCard, total: lesson.totalCards })}
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
}: {
  question: ExamQuestion;
  selected: string | null;
  onSelect: (key: string) => void;
  onNext: () => void;
}) {
  const t = useTranslations("StudyPlan");
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
            {t("nextQuestion")}
            <LineIcon name="arrowRight" className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
