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
};

const cellBase =
  "flex-1 min-w-0 flex items-center justify-center px-2 sm:px-4 py-1.5 sm:py-2 border-r border-slate-600/80 bg-slate-900/60 text-xs sm:text-sm font-semibold truncate last:border-r-0";

const logoCell =
  "flex shrink-0 items-center justify-center rounded-md sm:rounded-lg border border-slate-600/70 bg-slate-900/80 px-1.5 py-1 sm:px-2 sm:py-1.5 hover:bg-slate-800/80 transition-colors";

const ExamHeader = ({
  timeLabel,
  currentQuestion,
  totalQuestions,
  correct,
  mistakes,
  questionId,
}: ExamHeaderProps) => {
  return (
    <div className="w-full min-w-0 flex justify-center mb-3 sm:mb-4">
      <div className="flex w-full min-w-0 items-stretch gap-1.5 sm:gap-2">
        <div className="flex min-w-0 flex-1 overflow-hidden rounded-lg sm:rounded-xl border border-slate-600/70 bg-slate-900/80">
          <div className={cellBase}>{timeLabel}</div>

          <div className={cellBase}>
            <span className="text-yellow-300">
              {currentQuestion}/{totalQuestions}
            </span>
          </div>

          <div className={cellBase}>
            <span className="text-emerald-400">{correct}</span>
          </div>

          <div className={cellBase}>
            <span className="text-red-400">{mistakes}</span>
          </div>

          <div className={cellBase}>
            <span className="text-yellow-300">#{questionId}</span>
          </div>
        </div>

        <Link href="/" className={logoCell} aria-label="prava.ge">
          <Image
            src={PravaLogo}
            alt="prava.ge"
            width={18}
            height={18}
            className="h-3.5 w-3.5 shrink-0 object-contain sm:h-4 sm:w-4"
          />
        </Link>
      </div>
    </div>
  );
};

export default ExamHeader;
