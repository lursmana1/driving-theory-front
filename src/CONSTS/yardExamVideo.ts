/** Yard exam walkthrough (from pravage-tiktok/33-yard-exam-full, re-encoded to 720p). Hosted on the assets bucket. */
const BASE = "https://prava-ge-assets.s3.eu-north-1.amazonaws.com/video/yard-exam";

export const YARD_EXAM_VIDEO = {
  src: `${BASE}/yard-exam-ka.mp4`,
  poster: `${BASE}/yard-exam-ka-poster.jpg`,
  width: 720,
  height: 1280,
  /** ISO 8601 */
  duration: "PT1M33S",
  uploadDate: "2026-11-04T00:00:00+04:00",
  /** Narration language */
  language: "ka",
} as const;
