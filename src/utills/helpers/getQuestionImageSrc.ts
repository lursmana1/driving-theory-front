export const QUESTION_IMAGE = {
  width: 1000,
  height: 410,
  sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1000px",
} as const;

export function getQuestionImageSrc(img?: string | null): string {
  if (!img) return "";
  if (/^https?:\/\//i.test(img)) return img;
  return img.startsWith("/") ? img : `/${img}`;
}

export function getQuestionImageUrl(question: {
  hasImg?: number;
  img?: string | null;
}): string | null {
  if (!question.hasImg || !question.img) return null;
  return getQuestionImageSrc(question.img) || null;
}

export function nearbyQuestionImageSrcs<
  T extends { id: string | number; hasImg?: number; img?: string | null },
>(questions: T[], currentIndex: number, radius = 3): { id: T["id"]; src: string }[] {
  const items: { id: T["id"]; src: string }[] = [];
  const seen = new Set<string>();

  for (let offset = 1; offset <= radius; offset++) {
    for (const question of [
      questions[currentIndex + offset],
      questions[currentIndex - offset],
    ]) {
      const src = question ? getQuestionImageUrl(question) : null;
      if (!question || !src || seen.has(src)) continue;
      seen.add(src);
      items.push({ id: question.id, src });
    }
  }

  return items;
}
