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
