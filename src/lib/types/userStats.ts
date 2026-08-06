export type ReadinessConfidence = "none" | "low" | "medium" | "high";

export type ReadinessScore = {
  categoryId: number;
  categoryName: string;
  questionCount: number;
  minCorrectToPass: number;
  maxWrongAnswers: number;
  durationMinutes: number;
  readinessScore: number;
  confidence: ReadinessConfidence;
  readyForExam: boolean;
  label: string;
  examPart?: number;
  coveragePart?: number;
  stabilityPart?: number;
  lastAttemptPassed?: boolean | null;
  /** Capped at 3 — used for score calculation only, not for display */
  completedAttemptsUsed?: number;
  /** Total completed exams for this category — use for "გამოცდები" display */
  completedAttemptsTotal?: number;
  subjectsCovered?: number;
  subjectsTotal?: number;
  weakSubjectsCount?: number;
};

export type SubjectProgress = {
  subjectId: number;
  name: string;
  attempted: number;
  correctCount: number;
  wrongCount: number;
  correctnessRate: number;
  covered: boolean;
  totalQuestions: number;
  distinctQuestionsAnswered: number;
};

export type ExamRulesPayload = {
  categoryId: number;
  questionCount: number;
  minCorrectToPass: number;
  maxWrongAnswers: number;
  durationMinutes: number;
};

export type QuestionPoolStats = {
  distinctQuestionsAnswered: number;
  totalQuestionsInCategory: number;
  exposureRate: number;
};

export type OverviewWeakSubject = {
  subjectId: number;
  name?: string;
  wrongCount: number;
  correctCount: number;
  totalQuestions: number;
  correctnessRate?: number;
};

export type OverviewWeakQuestion = {
  questionId: number;
  wrongCount: number;
  totalAttempts?: number;
  question: unknown;
};

export type UserStatsOverview = {
  readiness: ReadinessScore;
  subjectProgress?: SubjectProgress[];
  weakSubjects: OverviewWeakSubject[];
  weakQuestions: OverviewWeakQuestion[];
  questionPool?: QuestionPoolStats;
  examRules: ExamRulesPayload;
};
