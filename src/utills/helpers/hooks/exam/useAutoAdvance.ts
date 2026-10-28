import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { AUTO_ADVANCE_STORAGE_KEY } from "@/CONSTS/QuizExamConstats";

/** Fired in this tab after a write; `storage` only fires in other tabs. */
const CHANGE_EVENT = "auto-advance-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readStored(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // storage blocked (private mode, site data off)
  }
}

/** Auto-next preference, kept in localStorage under `storageKey`. */
export function useAutoAdvance(
  storageKey = AUTO_ADVANCE_STORAGE_KEY,
  defaultOn = false,
) {
  const stored = useSyncExternalStore(
    subscribe,
    () => readStored(storageKey),
    () => null, // server render: nothing stored yet, use the default
  );
  const autoAdvance = stored === null ? defaultOn : stored === "true";
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleAutoAdvanceChange = useCallback(
    (checked: boolean) => {
      try {
        localStorage.setItem(storageKey, String(checked));
      } catch {
        return; // can't save, so the checkbox can't change either
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [storageKey],
  );

  return { autoAdvance, handleAutoAdvanceChange, timeoutRef };
}
