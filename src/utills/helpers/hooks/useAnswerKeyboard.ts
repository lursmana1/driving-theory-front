import { useEffect } from "react";
import { isTypingTarget } from "@/utills/helpers/isTypingTarget";

const ANSWER_KEYS = ["1", "2", "3", "4"];

const useAnswerKeyboard = (
  disabled: boolean,
  answers: { key: string }[],
  onSelect: (key: string) => void,
) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(document.activeElement) || disabled) return;

      const key = e.key;
      if (ANSWER_KEYS.includes(key) && answers.some((a) => a.key === key)) {
        e.preventDefault();
        onSelect(key);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, answers, onSelect]);
};

export default useAnswerKeyboard;
