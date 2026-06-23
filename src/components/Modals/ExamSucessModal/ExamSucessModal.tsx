import Modal from "antd/es/modal/Modal";
import { useTranslations } from "next-intl";
import {
  formatExamDuration,
  resolveExamDurationSeconds,
} from "@/utills/helpers/formatExamDuration";

type ExamSuccessModalProps = {
  handleRestart: () => void;
  passed: boolean;
  durationSeconds: number;
  correctCount: number;
  totalCount: number;
};

const ExamSuccessModal = (props: ExamSuccessModalProps) => {
  const t = useTranslations("Exam");
  const duration = resolveExamDurationSeconds(0, props.durationSeconds);

  return (
    <Modal
      open
      centered
      closable={true}
      onOk={props.handleRestart}
      cancelButtonProps={{ style: { display: "none" } }}
      okText={t("restart")}
    >
      <div className="text-center py-4">
        <h1
          className={`text-2xl font-bold mb-4 ${
            props.passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {props.passed ? t("examPassed") : t("examFailed")}
        </h1>
        <p className="mb-2">
          {props.correctCount}/{props.totalCount} (
          {Math.round((props.correctCount / props.totalCount) * 100)}%)
        </p>
        {duration > 0 && (
          <p className="mb-4 text-slate-600">
            {formatExamDuration(duration)}
          </p>
        )}
        <p className="mb-4">{t("retake")}</p>
      </div>
    </Modal>
  );
};

export default ExamSuccessModal;
