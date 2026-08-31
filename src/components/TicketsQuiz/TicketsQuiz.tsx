"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getAiTutorText, getQuestionAudioUrl, type ExamQuestion } from "@/lib/types/exam";
import { usePracticeAnswers } from "@/utills/helpers/hooks/usePracticeAnswers";
import QuestionImage from "@/components/QuestionImage/QuestionImage";
import QuizButton from "../QuizButton/QuizButton";
import ExamFooter from "../ExamFooter/ExamFooter";
import QuestionExplanation from "../QuestionExplanation/QuestionExplanation";
import { getAnswers } from "@/utills/helpers/getAnswers";
import { AiTutorText } from "./AiTutorText";
import { QuestionAudioButton } from "@/components/QuestionAudio/QuestionAudioButton";
import { QuizSceneBackground } from "@/components/QuizSceneBackground";

function questionNumericId(question: ExamQuestion): number {
  const n =
    typeof question.id === "number"
      ? question.id
      : parseInt(String(question.id), 10);
  return Number.isFinite(n) ? n : NaN;
}

type TicketQuizProps = {
  question: ExamQuestion;
  questionIndex?: number;
  selectedAnswer: string | null;
  onSelect: (key: string) => void;
  priority?: boolean;
};

export default function TicketQuiz({
  question,
  questionIndex,
  selectedAnswer,
  onSelect,
  priority = false,
}: TicketQuizProps) {
  const t = useTranslations("Tickets");
  const { recordAnswer } = usePracticeAnswers();
  const answers = getAnswers(question);
  const qId = String(question.id);
  const aiTutorText = getAiTutorText(question);
  const questionAudioUrl = getQuestionAudioUrl(question);
  const postedRef = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    if (selectedAnswer) return;
    onSelect(key);
    if (postedRef.current) return;
    postedRef.current = true;
    const id = questionNumericId(question);
    if (!Number.isFinite(id) || !key.trim()) {
      postedRef.current = false;
      return;
    }
    void recordAnswer(id, key).then((ok) => {
      if (ok) {
        setSaveError(null);
        return;
      }
      postedRef.current = false;
      setSaveError(t("answerSaveError"));
    });
  };

  return (
    <>
      <div className="relative h-auto scroll-mt-4 bg-[#193e4a] p-4">
        <QuizSceneBackground priority={priority} />
        <div className="relative z-10">
          <QuestionExplanation
            questionId={question.id}
            questionIndex={questionIndex}
            explanation={question.question_explained}
            actions={
              questionAudioUrl ? (
                <QuestionAudioButton
                  id={`question-audio-${qId}`}
                  src={questionAudioUrl}
                  size="compact"
                />
              ) : null
            }
          />

          {!!question.hasImg && question.img && (
            <QuestionImage
              src={question.img}
              alt={question.question || ""}
              className="max-h-110"
              priority={priority}
            />
          )}

          <p className="font-georgian mb-4 min-w-0 rounded-md border border-white bg-black/50 p-4 text-sm font-medium tracking-wide text-white">
            {question.question}
          </p>

          {aiTutorText !== "" && (
            <div className="mb-4">
              <AiTutorText text={aiTutorText} label={t("aiTutorShowText")} />
            </div>
          )}

          <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
            {answers.map((a) => (
              <QuizButton
                key={a.key}
                selectAnswer={handleSelect}
                answerKey={a.key}
                answerText={a.text as string}
                selectedAnswer={selectedAnswer || ""}
                correctAnswer={question.correct_answer}
              />
            ))}
          </div>

          {saveError ? (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {saveError}
            </p>
          ) : null}
        </div>
      </div>

      <ExamFooter
        questions={answers}
        correctAnswer={question.correct_answer}
        selectAnswer={handleSelect}
        selectedAnswer={selectedAnswer || undefined}
      />
    </>
  );
}
