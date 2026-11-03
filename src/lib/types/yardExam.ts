export type YardExamItem = {
  code: string;
  text: string;
  points: string | null;
};

export type YardExamElement = {
  id: string;
  title: string;
  intro: string;
  /** Local path under `/images/yard-exam/*.gif` only. */
  image: string;
  items: YardExamItem[];
};

/** Pass rule + instant-fail list (Articles 34 and 39 of the exam rules). */
export type YardExamDisqualification = {
  title: string;
  passRule: string;
  intro: string;
  items: string[];
  source: string;
};

export type YardExamData = {
  note: string;
  disqualification: YardExamDisqualification;
  elements: YardExamElement[];
  general: {
    title: string;
    items: YardExamItem[];
  };
};

const YARD_EXAM_IMAGE_RE = /^\/images\/yard-exam\/[a-z0-9-]+\.gif$/i;

/** Only allow same-origin static GIFs from the yard-exam folder. */
export function isYardExamImageSrc(src: string): boolean {
  return YARD_EXAM_IMAGE_RE.test(src);
}
