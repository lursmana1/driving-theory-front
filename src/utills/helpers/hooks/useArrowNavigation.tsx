import { useEffect } from "react";
import { isTypingTarget } from "@/utills/helpers/isTypingTarget";

const useArrowNavigation = (
  handlePrevious: () => void,
  handleNext: () => void,
) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePrevious, handleNext]);
};
export default useArrowNavigation;
