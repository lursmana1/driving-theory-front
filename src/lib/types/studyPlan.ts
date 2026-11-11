import type { ExamQuestion } from "@/lib/types/exam";

/** Mirrors the backend `study-plans.types.ts` (GET /study-plans/preview*). */
export type PlanStepKind = "learn" | "review" | "mix" | "test" | "exam";

export type PlanLesson = {
  /** `<subjectId>-<part>` */
  id: string;
  subjectId: number;
  part: number;
  parts: number;
  questionCount: number;
  /** Cards taught in the lesson (sign subjects); 0 for plain ticket lessons. */
  cardCount: number;
};

export type PlanStep = {
  kind: PlanStepKind;
  lessonId?: string;
  questionCount: number;
  /** `learn` steps of card lessons. */
  cardCount?: number;
};

export type PlanDay = {
  index: number;
  date: string;
  kind: "learn" | "review";
  lessons: PlanLesson[];
  newQuestions: number;
  steps: PlanStep[];
  minutes: number;
};

export type StudyPlanPreview = {
  categoryId: number;
  dayCount: number;
  learnDays: number;
  lessonSize: number;
  totalQuestions: number;
  minutesPerDayAvg: number;
  minutesPerDayMax: number;
  startDay: string;
  examDay: string | null;
  intensive: boolean;
  days: PlanDay[];
};

export type PlanDayStep = PlanStep & { questionIds: number[] };

export type PlanDaySession = Omit<PlanDay, "steps"> & {
  categoryId: number;
  dayCount: number;
  steps: PlanDayStep[];
  /** Cards of the day's card lessons, in lesson order. */
  cards: LessonCard[];
  questions: ExamQuestion[];
};

/** Why the API refused a plan length (400 `reason`). */
export type PlanLengthError = "too-soon" | "too-far";

/** One day test try, as kept in the plan. */
export type DayTestResult = {
  correct: number;
  total: number;
  passed: boolean;
};

/** Saved plan + progress: localStorage for guests, `/study-plans/me` when signed in. */
export type SavedStudyPlan = {
  version: 1;
  categoryId: number;
  dayCount: number;
  /** First study day `YYYY-MM-DD`. */
  startDay: string;
  examDay: string | null;
  /** dayIndex → step index → study day it was done. */
  done: Record<string, Record<string, string>>;
  /** dayIndex → day test result. */
  tests: Record<string, DayTestResult>;
  /**
   * dayIndex → question ids answered wrong that day and not fixed yet.
   * Missing in plans saved before it existed.
   */
  mistakes?: Record<string, number[]>;
};

/** One card of a plan day's card lesson (`GET /study-plans/preview/days/:i`). */
export type LessonCard = {
  id: string;
  /** The day lesson (`PlanLesson.id`) that teaches it. */
  lessonId: string;
  kind: "sign" | "marking" | "rule";
  signNumber: string | null;
  /** Public path, e.g. `/images/signs/1/1.1.svg`; null for most rules. */
  image: string | null;
  title: string;
  body: string | null;
  /** Plain-language explanation; null when not written. */
  tutor: string | null;
  /** Audio of `tutor` (S3 URL); null when not recorded. */
  audio: string | null;
  /** Tickets taught right after this card in its lesson. */
  questionIds: number[];
};
