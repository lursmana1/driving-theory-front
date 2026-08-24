export const EXAM_DURATION_SECONDS = 1800; // 30 minutes

/** TEMP: reveal correct exam answers for local testing. Set false / remove when done. */
export const TEMP_SHOW_EXAM_ANSWERS = true;

/** @deprecated Use getExamRules(categoryId) — kept as fallback for B category */
export const EXAM_TOTAL_QUESTIONS = 30;

/** @deprecated Use getExamRules(categoryId) */
export const PASS_SCORE = 25;

/** @deprecated Use getExamRules(categoryId) */
export const MAX_MISTAKES = 5;

export const AUTO_ADVANCE_STORAGE_KEY = "exam-auto-advance";

export const AUTO_ADVANCE_DELAY_MS = 500;
