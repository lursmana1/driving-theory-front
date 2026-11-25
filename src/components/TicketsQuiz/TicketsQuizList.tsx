"use client";

import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import TicketQuiz from "./TicketsQuiz";
import { TicketsPageSummary, TicketsScoreBar } from "./TicketsPageScore";

type TicketsQuizListProps = {
  questions: ExamQuestion[];
  /** Rendered after the first `insertAfter` tickets (below the fold, so a late client-only block can't shift the page). */
  insert?: ReactNode;
  insertAfter?: number;
  /** Tickets page: each ticket gets a share button for this category. */
  categoryId?: number;
  /**
   * A page of the listing (not one ticket by id): show the page score and,
   * once every ticket is answered, the summary.
   */
  showScore?: boolean;
  /** Next page of the listing, for the summary; null on the last page. */
  nextPageHref?: string | null;
};

const ticketAnchor = (id: string) => `ticket-${id}`;

export default function TicketsQuizList({
  questions,
  insert,
  insertAfter = 3,
  categoryId,
  showScore = false,
  nextPageHref = null,
}: TicketsQuizListProps) {
  const [answersById, setAnswersById] = useState<Record<string, string>>({});

  const handleSelect = useCallback((questionId: string, key: string) => {
    setAnswersById((prev) => {
      if (prev[questionId]) return prev;
      return { ...prev, [questionId]: key };
    });
  }, []);

  const wrongIds = useMemo(
    () =>
      questions
        .map((q) => String(q.id))
        .filter((id, i) => {
          const picked = answersById[id];
          return !!picked && picked !== questions[i].correct_answer;
        }),
    [questions, answersById],
  );
  const answered = questions.filter((q) => answersById[String(q.id)]).length;
  const score = {
    total: questions.length,
    correct: answered - wrongIds.length,
    wrong: wrongIds.length,
  };

  // The second try only clears the card: a signed-in answer is saved once
  // (the first try is the honest signal for stats; `TicketQuiz` keeps it).
  const retryWrong = () => {
    const first = wrongIds[0];
    setAnswersById((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([id]) => !wrongIds.includes(id)),
      ),
    );
    if (first) {
      document
        .getElementById(ticketAnchor(first))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-3">
      {showScore && questions.length > 1 && <TicketsScoreBar {...score} />}
      {questions.map((q, index) => {
        const id = String(q.id);
        return (
          <Fragment key={id}>
            <div
              id={ticketAnchor(id)}
              className="scroll-mt-14 sm:scroll-mt-16 lg:scroll-mt-20"
            >
              <TicketQuiz
                question={q}
                questionIndex={index + 1}
                selectedAnswer={answersById[id] ?? null}
                onSelect={(key) => handleSelect(id, key)}
                priority={index === 0}
                shareCategoryId={categoryId}
              />
            </div>
            {/* Keyed wrapper: `insert` is a server-rendered element, and React 19
                warns about a missing key when it lands in this list. */}
            {insert && index + 1 === Math.min(insertAfter, questions.length) ? (
              <Fragment key="insert">{insert}</Fragment>
            ) : null}
          </Fragment>
        );
      })}
      {showScore && questions.length > 1 && answered === questions.length && (
        <TicketsPageSummary
          {...score}
          onRetryWrong={retryWrong}
          nextHref={nextPageHref}
        />
      )}
    </div>
  );
}
