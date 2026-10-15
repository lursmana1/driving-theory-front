import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { ReactNode } from "react";
import PravaLogo from "../../../public/images/jpg/pravaLogo.jpg";

type ExamHeaderProps = {
  timeLabel: ReactNode;
  currentQuestion: number;
  totalQuestions: number;
  correct: number;
  mistakes: number;
  questionId: string | number;
  actions?: ReactNode;
};

const cellBase =
  "flex-1 min-w-0 flex items-center justify-center px-2 sm:px-4 py-1.5 sm:py-2 border-r border-stage-line text-stage-fg text-xs sm:text-sm font-semibold truncate last:border-r-0";

const logoCell =
  "flex shrink-0 items-center justify-center rounded-xs sm:rounded-control border border-stage-line bg-stage-deep/80 px-1.5 py-1 sm:px-2 sm:py-1.5 hover:bg-stage-hover transition-colors";

const ExamHeader = ({
  timeLabel,
  currentQuestion,
  totalQuestions,
  correct,
  mistakes,
  questionId,
  actions,
}: ExamHeaderProps) => {
  return (
    <div className="w-full min-w-0 flex justify-center mb-3 sm:mb-4">
      <div className="flex w-full min-w-0 items-stretch gap-1.5 sm:gap-2">
        <Link href="/" className={logoCell} aria-label="prava.ge">
          <Image
            src={PravaLogo}
            alt="prava.ge"
            width={18}
            height={18}
            className="h-3.5 w-3.5 shrink-0 object-contain sm:h-4 sm:w-4"
          />
        </Link>

        <div className="flex min-w-0 flex-1 overflow-hidden rounded-control border border-stage-line bg-stage-deep/80">
          <div className={cellBase}>{timeLabel}</div>

          <div className={cellBase}>
            <span className="text-stage-highlight">
              {currentQuestion}/{totalQuestions}
            </span>
          </div>

          <div className={cellBase}>
            <span className="text-stage-success">{correct}</span>
          </div>

          <div className={cellBase}>
            <span className="text-stage-danger">{mistakes}</span>
          </div>

          <div className={cellBase}>
            <span className="text-stage-highlight">#{questionId}</span>
          </div>
        </div>

        {actions}
      </div>
    </div>
  );
};

export default ExamHeader;
