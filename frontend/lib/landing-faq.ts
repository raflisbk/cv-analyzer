export const faqItems = [
  { key: "what" },
  { key: "stored" },
  { key: "formats" },
  { key: "score" },
  { key: "job" },
] as const;
export function nextFaqOpen(current: number | null, clicked: number) {
  return current === clicked ? null : clicked;
}
export const FAQ_SCROLL = { start: "top 75%", end: "top 15%" };
export const FAQ_REFRESH_DELAY_MS = 360;
