/** Same bounds as the backend `study-plan.constants.ts`. */
export const STUDY_PLAN_PRESET_DAYS = [7, 14, 28] as const;
export const STUDY_PLAN_RECOMMENDED_DAYS = 14;
export const STUDY_PLAN_MIN_DAYS = 3;
export const STUDY_PLAN_MAX_DAYS = 60;

/** Sign subjects (`src/data/subjects.json`) → sign group on `/signs`. */
export const SUBJECT_SIGN_GROUP: Record<number, number> = {
  3: 1, // warning
  4: 2, // priority
  5: 3, // prohibitory
  6: 4, // mandatory
  7: 7, // information
  8: 6, // service
  9: 8, // additional information
  28: 101, // road markings
};

/** Auto-next delay after a day-test answer (no feedback is shown). */
export const PLAN_TEST_NEXT_DELAY_MS = 350;

/** Day test clock: one minute per question, like teoria and the real pace. */
export const PLAN_TEST_SECONDS_PER_QUESTION = 60;

/** Question image height in plan lessons and the day test (answers stay on screen). */
export const PLAN_IMAGE_CLASS = "max-h-48 sm:max-h-64";

/** Day test clock turns red in the last minute. */
export const PLAN_TEST_LOW_TIME_SECONDS = 60;

/** "New day in hh:mm" countdown refresh. */
export const PLAN_COUNTDOWN_TICK_MS = 30_000;

/**
 * The mixed day exam (today's tickets, yesterday's extras, a few older ones)
 * is graded stricter than the real exam: this share of the exam's mistake
 * ratio (getExamRules). B allows 5 of 30 (17%), so 15–29 questions allow 1.
 */
export const PLAN_TEST_STRICTNESS = 0.5;

/** A failed test with more than this share wrong suggests redoing the lessons. */
export const PLAN_TEST_REPEAT_LESSONS_SHARE = 0.5;

/**
 * `?planStep=<day>.<step>` on /exam and /practice: the plan step that page
 * was opened from; it counts as done once the exam / review is finished.
 */
export const PLAN_STEP_PARAM = "planStep";

/** Day test picture slot: a fixed height, so questions don't shift the page. */
export const PLAN_TEST_IMAGE_SLOT = "h-40 sm:h-44";
