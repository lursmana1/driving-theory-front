import Image from "next/image";
import leftSide from "../../../public/png/left.png";
import rightSide from "../../../public/png/right.png";

type ExamFooterProps = {
  showPrevious?: () => void;
  showNext?: () => void;
};

const arrowClass =
  "flex shrink-0 cursor-pointer items-center justify-center rounded-xs bg-stage-fg p-1.5 transition hover:bg-surface-strong sm:p-2";

/**
 * Previous / next under a question. Answers are picked by tapping the answer
 * row itself (keys 1–4 on desktop), so there is no row of numbered buttons.
 * Renders nothing when the page has no navigation (plan lessons).
 */
const ExamFooter = ({ showPrevious, showNext }: ExamFooterProps) => {
  if (!showNext) return null;
  return (
    <div className="flex w-full shrink-0 items-center justify-between gap-2 px-1 py-2 sm:px-2">
      <button type="button" onClick={showPrevious} className={arrowClass}>
        <Image
          src={leftSide}
          alt="Previous"
          width={32}
          height={32}
          className="h-6 w-6 sm:h-8 sm:w-8"
        />
      </button>
      <button type="button" onClick={showNext} className={arrowClass}>
        <Image
          src={rightSide}
          alt="Next"
          width={32}
          height={32}
          className="h-6 w-6 sm:h-8 sm:w-8"
        />
      </button>
    </div>
  );
};

export default ExamFooter;
