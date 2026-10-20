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
  lastAttemptPassed?: boolean | null;
  /** Full exams behind the score (capped at 20) — not for display */
  completedAttemptsUsed?: number;
  /** All full exams (every topic, official size) in this category — display this */
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
