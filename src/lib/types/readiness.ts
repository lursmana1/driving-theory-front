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
  completedAttemptsUsed?: number;
  completedAttemptsTotal?: number;
  subjectsCovered?: number;
  subjectsTotal?: number;
  weakSubjectsCount?: number;
};
