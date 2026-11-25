/** Same bounds as the backend `study-plan.constants.ts`. */
export const STUDY_PLAN_PRESET_DAYS = [7, 14, 28] as const;
export const STUDY_PLAN_RECOMMENDED_DAYS = 28;
export const STUDY_PLAN_MIN_DAYS = 3;
export const STUDY_PLAN_MAX_DAYS = 60;

/**
 * Saved-progress caps, same as the backend `parsePlanProgress`: a plan that
 * breaks one is rejected (400) on every save after, so the client never
 * writes past them.
 */
export const STUDY_PLAN_MAX_STEPS_PER_DAY = 40;
export const STUDY_PLAN_DAY_MISTAKES_MAX = 300;
export const STUDY_PLAN_MISTAKES_TOTAL_MAX = 1000;
export const STUDY_PLAN_TEST_MAX_QUESTIONS = 40;
/** Largest saved `shift` (days the plan was moved forward). */
export const STUDY_PLAN_SHIFT_MAX_DAYS = 365;

/**
 * Behind the plan's dates, a user may catch up: up to this many plan days
 * open on one study day (normally one). The end date stays where it was.
 */
export const PLAN_CATCH_UP_DAYS_PER_STUDY_DAY = 2;

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
 * is graded with this share of the exam's mistake ratio (getExamRules).
 * 1 = the real exam's ratio: B allows 5 of 30, so 15 questions allow 2 and
 * 23 allow 3. Was 0.5 until 2026-11-25: about half of all tries failed with
 * an average score of 87% (Umami), so the owner set it to the real ratio.
 */
export const PLAN_TEST_STRICTNESS = 1;

/** A failed test with more than this share wrong suggests redoing the lessons. */
export const PLAN_TEST_REPEAT_LESSONS_SHARE = 0.5;

/**
 * `?planStep=<day>.<step>` on /exam and /practice: the plan step that page
 * was opened from; it counts as done once the exam / review is finished.
 */
export const PLAN_STEP_PARAM = "planStep";

/**
 * Readiness (Fahren-Lernen-style light): yellow once every ticket was seen,
 * green once this many full simulations in a row were passed.
 */
export const PLAN_READY_MOCKS_IN_A_ROW = 3;

/** Topics shown as chips in the plan hero before "+N". */
export const PLAN_HERO_TOPICS = 3;

/** Day test picture slot: a fixed height, so questions don't shift the page. */
export const PLAN_TEST_IMAGE_SLOT = "h-40 sm:h-44";
