"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  getAiTutorText,
  getQuestionAudioUrl,
  type ExamQuestion,
} from "@/lib/types/exam";
import { usePracticeAnswers } from "@/utills/helpers/hooks/usePracticeAnswers";
import useAnswerKeyboard from "@/utills/helpers/hooks/useAnswerKeyboard";
import type { PracticeAnswerResponse } from "@/api/practiceAnswers";
import QuestionImage from "@/components/QuestionImage/QuestionImage";
import QuizButton from "../QuizButton/QuizButton";
import ExamFooter from "../ExamFooter/ExamFooter";
import QuestionExplanation from "../QuestionExplanation/QuestionExplanation";
import { getAnswers } from "@/utills/helpers/getAnswers";
import { AiTutorText } from "./AiTutorText";
import { QuestionAudioButton } from "@/components/QuestionAudio/QuestionAudioButton";
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
  /** Left out in read-only views (exam review), where the pick is fixed. */
  onSelect?: (key: string) => void;
  priority?: boolean;
  /** Called with the saved answer (grade + trainer progress). */
  onRecorded?: (response: PracticeAnswerResponse) => void;
  /** Called when saving the answer failed. */
  onRecordFailed?: () => void;
  /** Footer arrows (single-question views such as the trainer). */
  onPrevious?: () => void;
  onNext?: () => void;
  /** Keys 1–4 pick an answer. Only for one question per page. */
  keyboard?: boolean;
  /** Rendered right under the question text (e.g. the trainer's auto-next checkbox). */
  belowQuestion?: React.ReactNode;
};

export default function TicketQuiz({
  question,
  questionIndex,
  selectedAnswer,
  onSelect,
  priority = false,
  onRecorded,
  onRecordFailed,
  onPrevious,
  onNext,
  keyboard = false,
  belowQuestion,
}: TicketQuizProps) {
  const t = useTranslations("Tickets");
  const { recordAnswer } = usePracticeAnswers();
  const answers = getAnswers(question);
  const qId = String(question.id);
  const aiTutorText = getAiTutorText(question);
  const questionAudioUrl = getQuestionAudioUrl(question);
  const postedRef = useRef(false);

  const handleSelect = (key: string) => {
    if (selectedAnswer) return;
    onSelect?.(key);
    if (postedRef.current) return;
    postedRef.current = true;
    const id = questionNumericId(question);
    if (!Number.isFinite(id) || !key.trim()) {
      postedRef.current = false;
      return;
    }
    void recordAnswer(id, key, onRecorded).then((ok) => {
      if (ok) return;
      postedRef.current = false;
      onRecordFailed?.();
    });
  };

  useAnswerKeyboard(!keyboard || !!selectedAnswer, answers, handleSelect);

  return (
    <>
      <div className="relative h-auto scroll-mt-4 bg-stage p-3 sm:p-4">
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
                  size="labeled"
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

          <p className="font-georgian mb-4 min-w-0 rounded-control border border-stage-line bg-stage-deep/60 p-4 text-sm font-medium tracking-wide text-stage-fg">
            {question.question}
          </p>

          {belowQuestion && <div className="-mt-2 mb-2">{belowQuestion}</div>}

          {aiTutorText !== "" && (
            <div className="mb-4">
              <AiTutorText text={aiTutorText} label={t("aiTutorShowText")} />
            </div>
          )}

          <div className="grid grid-cols-1 items-stretch gap-2 sm:auto-rows-fr sm:grid-cols-2">
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
        </div>
      </div>

      <ExamFooter
        questions={answers}
        correctAnswer={question.correct_answer}
        selectAnswer={handleSelect}
        selectedAnswer={selectedAnswer || undefined}
        showPrevious={onPrevious}
        showNext={onNext}
      />
    </>
  );
}
