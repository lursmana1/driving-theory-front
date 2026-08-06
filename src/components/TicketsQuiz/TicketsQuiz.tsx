"use client";

import { useTranslations } from "next-intl";
import { getAiTutorText, getQuestionAudioUrl, type ExamQuestion } from "@/lib/types/exam";
import QuestionImage from "@/components/QuestionImage/QuestionImage";
import QuizButton from "../QuizButton/QuizButton";
import ExamFooter from "../ExamFooter/ExamFooter";
import QuestionExplanation from "../QuestionExplanation/QuestionExplanation";
import { getAnswers } from "@/utills/helpers/getAnswers";
import { AiTutorText } from "./AiTutorText";
import { QuestionAudioButton } from "@/components/QuestionAudio/QuestionAudioButton";

type TicketQuizProps = {
  question: ExamQuestion;
  questionIndex?: number;
  selectedAnswer: string | null;
  onSelect: (questionId: string, key: string) => void;
};

export default function TicketQuiz({
  question,
  questionIndex,
  selectedAnswer,
  onSelect,
}: TicketQuizProps) {
  const t = useTranslations("Tickets");
  const answers = getAnswers(question);
  const qId = String(question.id);
  const aiTutorText = getAiTutorText(question);
  const questionAudioUrl = getQuestionAudioUrl(question);

  const handleSelect = (key: string) => {
    onSelect(qId, key);
  };

  return (
    <>
      <div className="relative p-4 h-auto bg-[#193e4a] bg-[url('/png/download.png')] bg-no-repeat bg-center bg-contain scroll-mt-4">
        <QuestionExplanation
          questionId={question.id}
          questionIndex={questionIndex}
          explanation={question.question_explained}
        />

        <div>
          {!!question.hasImg && question.img && (
            <QuestionImage
              src={question.img}
              alt={question.question || ""}
              className="max-h-110"
              priority
            />
          )}

          <div className="mb-4 flex items-start gap-3">
            {questionAudioUrl && (
              <QuestionAudioButton id={`question-audio-${qId}`} src={questionAudioUrl} />
            )}
            <p className="font-georgian min-w-0 flex-1 p-4 text-white text-sm border border-white bg-black/50 rounded-md">
              {question.question}
            </p>
          </div>

          {aiTutorText !== "" && (
            <div className="mb-4">
              <AiTutorText text={aiTutorText} label={t("aiTutorShowText")} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 auto-rows-fr items-stretch">
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
        selectAnswer={handleSelect}
        selectedAnswer={selectedAnswer || undefined}
      />
    </>
  );
}
