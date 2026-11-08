export const introTime = {
  wordmark: 1.75,
  expand: 2.5,
  collapse: 3.55,
  exit: 4.1,
  lift: 0.9,
} as const;

export function wordmarkWidth(measured: number, available: number) {
  return Math.min(measured, available);
}
