export interface ExamQuestion {
  id: string | number;
  question: string;
  question_explained: string;
  correct_answer: string;
  answer_1: string;
  answer_2: string;
  answer_3: string | null;
  answer_4: string | null;
  subject: number;
  categories: number[];
  hasAudio?: number;
  audio: string | null;
  hasImg: number;
  img?: string | null;
  imgSize?: null;
  /** Optional AI tutor explanation (Georgian text from API). */
  ai_tutor?: string | null;
  /** Same field; some JSON APIs expose camelCase. */
  aiTutor?: string | null;
}

/** Non-empty question audio URL from API, or null when missing / still generating. */
export function getQuestionAudioUrl(q: ExamQuestion): string | null {
  const raw = q.audio;
  if (typeof raw !== "string") return null;
  const url = raw.trim();
  return url.length > 0 ? url : null;
}

/** Resolve tutor text whether API sent snake_case or camelCase. */
export function getAiTutorText(q: ExamQuestion): string {
  const raw = q.ai_tutor ?? q.aiTutor;
  if (typeof raw !== "string") return "";
  const s = raw.trim();
  return s;
}

export type QuestionsResponse = {
  items: ExamQuestion[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};
