import { useEffect } from "react";
import { isTypingTarget } from "@/utills/helpers/isTypingTarget";

/** ← / → call the handlers. With neither handler, no listener is added. */
const useArrowNavigation = (
  handlePrevious?: () => void,
  handleNext?: () => void,
) => {
  useEffect(() => {
    if (!handlePrevious && !handleNext) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowLeft" && handlePrevious) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight" && handleNext) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePrevious, handleNext]);
};
export default useArrowNavigation;
