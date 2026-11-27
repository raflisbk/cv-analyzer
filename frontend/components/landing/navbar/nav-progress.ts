export const PROGRESS_RANGE = 140;

export function barProgress(scrollY: number, reduced: boolean) {
  const progress = Math.min(1, Math.max(0, scrollY / PROGRESS_RANGE));
  return reduced ? Math.floor(progress) : progress;
}

export function barOffset(pageTop: number, scrollY: number) {
  return Math.max(0, pageTop - scrollY);
}
