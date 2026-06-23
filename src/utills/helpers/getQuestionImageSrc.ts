export function getQuestionImageSrc(img?: string | null): string {
  if (!img) return "";
  if (/^https?:\/\//i.test(img)) return img;
  return img.startsWith("/") ? img : `/${img}`;
}
