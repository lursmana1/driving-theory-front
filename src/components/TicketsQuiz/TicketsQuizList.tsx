"use client";

import { Fragment, useCallback, useState, type ReactNode } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import TicketQuiz from "./TicketsQuiz";

type TicketsQuizListProps = {
  questions: ExamQuestion[];
  /** Rendered after the first `insertAfter` tickets (below the fold, so a late client-only block can't shift the page). */
  insert?: ReactNode;
  insertAfter?: number;
};

export default function TicketsQuizList({
  questions,
  insert,
  insertAfter = 3,
}: TicketsQuizListProps) {
  const [answersById, setAnswersById] = useState<Record<string, string>>({});

  const handleSelect = useCallback((questionId: string, key: string) => {
    setAnswersById((prev) => {
      if (prev[questionId]) return prev;
      return { ...prev, [questionId]: key };
    });
  }, []);

  return (
    <div className="space-y-3">
      {questions.map((q, index) => {
        const id = String(q.id);
        return (
          <Fragment key={id}>
            <TicketQuiz
              question={q}
              questionIndex={index + 1}
              selectedAnswer={answersById[id] ?? null}
              onSelect={(key) => handleSelect(id, key)}
              priority={index === 0}
            />
            {insert && index + 1 === Math.min(insertAfter, questions.length)
              ? insert
              : null}
          </Fragment>
        );
      })}
    </div>
  );
}
