import type { SignKind } from "@/lib/types/signs";

export type SignTextPart =
  | string
  | { text: string; kind: SignKind; number: string };

const NUM = String.raw`\d{1,2}(?:\.\d{1,2}){1,2}`;
/** "2.3", "2.3 და 2.4", "5.11, 5.13.1 and 5.14", "4.1.1-4.1.6" */
const LIST = String.raw`${NUM}\.?(?:\s*(?:,|და|and|и|или|or|-|–|−)\s*${NUM}\.?)*`;

/** the word for "sign" / "marking" in ka, en and ru (any case ending) */
const SIGN_WORD = String.raw`(?:ნიშან|ნიშნ)[ა-ჰ]*|[Ss]igns?|[Зз]нак[а-яё]*`;
const MARKING_WORD = String.raw`მონიშვნ[ა-ჰ]*|[Mm]arkings?|[Рр]азметк[а-яё]*`;

/**
 * A number only counts as a sign when the word next to it says so — "საგზაო ნიშანი 2.3", "2.3 და 2.4 ნიშნების",
 * "sign 2.3", "знак 2.4", "მონიშვნა 1.1". A bare "დანართის 4.3 პუნქტის" is a paragraph of the law, not sign 4.3.
 */
const PATTERNS: [SignKind, RegExp][] = [
  ["sign", new RegExp(String.raw`(?<=(?:${SIGN_WORD})\s+)${LIST}`, "g")],
  ["sign", new RegExp(String.raw`${LIST}(?=\s+(?:საგზაო\s+|road\s+|дорожн[а-яё]*\s+)?(?:${SIGN_WORD}))`, "g")],
  ["marking", new RegExp(String.raw`(?<=(?:${MARKING_WORD})\s+)${LIST}`, "g")],
  ["marking", new RegExp(String.raw`${LIST}(?=\s+(?:road\s+)?(?:${MARKING_WORD}))`, "g")],
];

/**
 * Splits text into plain strings and sign-number parts. `has(kind, number)` decides which numbers
 * become links (numbers that are not in the reference stay plain text).
 */
export function splitSignRefs(
  text: string,
  has: (kind: SignKind, number: string) => boolean,
): SignTextPart[] {
  const hits: { start: number; end: number; kind: SignKind; number: string }[] = [];
  for (const [kind, re] of PATTERNS) {
    for (const list of text.matchAll(re)) {
      for (const n of list[0].matchAll(new RegExp(NUM, "g"))) {
        const start = list.index + n.index;
        if (has(kind, n[0])) hits.push({ start, end: start + n[0].length, kind, number: n[0] });
      }
    }
  }
  hits.sort((a, b) => a.start - b.start);

  const parts: SignTextPart[] = [];
  let pos = 0;
  for (const h of hits) {
    if (h.start < pos) continue; // same number found by two patterns
    if (h.start > pos) parts.push(text.slice(pos, h.start));
    parts.push({ text: text.slice(h.start, h.end), kind: h.kind, number: h.number });
    pos = h.end;
  }
  if (pos < text.length) parts.push(text.slice(pos));
  return parts;
}
