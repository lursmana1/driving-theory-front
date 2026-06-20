import Modal from "antd/es/modal/Modal";
import { useTranslations } from "next-intl";
import type { FinishExamResponse } from "@/api/examAttempts";
import { Button } from "antd";
import Image from "next/image";
type ExamRetryModalProps = {
  handleRestart: () => void;
  mistake: number;
  finishResult?: FinishExamResponse | null;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const ExamRetryModal = (props: ExamRetryModalProps) => {
  const t = useTranslations("Exam");

  return (
    <Modal
      open
      centered
      closable={false}
      onOk={props.handleRestart}
      cancelButtonProps={{ style: { display: "none" } }}
      okText={t("restart")}
    >
      <div className="text-center py-4">
        <h1 className="md:text-2xl text-lg font-bold text-red-600 font-georgian  mb-4">
          {t("examFailed")}
        </h1>
        <Image
          className="w-full h-auto"
          src="/gif/school-paper.gif"
          alt="exam failed"
          width={100}
          height={100}
        />
        {props.finishResult && props.finishResult.durationSeconds > 0 && (
          <p className="mb-2 text-slate-600">
            გამოცდის დრო : {formatDuration(props.finishResult.durationSeconds)}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ExamRetryModal;
