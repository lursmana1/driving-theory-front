/** Estimated read time in minutes (~200 words per minute), ignoring HTML tags. */
export function getReadTime(content: string): number {
  const text = (content ?? "").replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
