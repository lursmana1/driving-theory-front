"use client";

import Modal from "antd/es/modal/Modal";
import TicketQuiz from "@/components/TicketsQuiz/TicketsQuiz";
import type { ExamQuestion } from "@/lib/types/exam";
import { useWindowSize } from "@/utills/helpers/hooks/useWindowSize";
type ExamHistoryQuestionModalProps = {
  open: boolean;
  question: ExamQuestion | null;
  selectedAnswer: string | null;
  onSelect: (questionId: string, key: string) => void;
  onClose: () => void;
};

export function ExamHistoryQuestionModal({
  open,
  question,
  selectedAnswer,
  onSelect,
  onClose,
}: ExamHistoryQuestionModalProps) {
  const { width } = useWindowSize();
  const isMobile = width > 0 && width < 768;
  if (!question) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      height={700}
      closeIcon={isMobile ? true : false}
      width={960}
      destroyOnHidden
      className="h-dvh! lg:h-[700px]! w-[960px] md:top-6! top-0! [&_.ant-modal-close]:top-0 [&_.ant-modal-close]:right-0 [&_.ant-modal-close]:z-50"
    >
      <TicketQuiz
        question={question}
        selectedAnswer={selectedAnswer}
        onSelect={onSelect}
      />
    </Modal>
  );
}
