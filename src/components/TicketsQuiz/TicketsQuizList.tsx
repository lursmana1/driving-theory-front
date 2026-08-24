"use client";

import { useCallback, useState } from "react";
import type { ExamQuestion } from "@/lib/types/exam";
import TicketQuiz from "./TicketsQuiz";

type TicketsQuizListProps = {
  questions: ExamQuestion[];
};

export default function TicketsQuizList({ questions }: TicketsQuizListProps) {
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
          <TicketQuiz
            key={id}
            question={q}
            questionIndex={index + 1}
            selectedAnswer={answersById[id] ?? null}
            onSelect={(key) => handleSelect(id, key)}
            priority={index === 0}
          />
        );
      })}
    </div>
  );
}
