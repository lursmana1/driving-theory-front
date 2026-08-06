import { Subject } from "./subject";

export interface Category {
  id: number;
  name: string;
  iconKey: string | null;
  questionsCount: number;
  subjectCount: number;
  /** @deprecated use questionCount from API */
  examTotalQuestions?: number;
  /** @deprecated use minCorrectToPass from API */
  examPassScore?: number;
  categoryId?: number;
  questionCount?: number;
  minCorrectToPass?: number;
  maxWrongAnswers?: number;
  durationMinutes?: number;
}

export interface CategoryWithSubjects extends Category {
  subjects: Subject[];
}
