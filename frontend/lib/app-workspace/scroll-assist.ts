export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export function hasMoreContent({
  scrollTop,
  scrollHeight,
  clientHeight,
}: ScrollMetrics): boolean {
  return (
    scrollHeight > clientHeight + 1 &&
    scrollTop + clientHeight < scrollHeight - 2
  );
}

export function nextScrollTop({
  scrollTop,
  clientHeight,
}: ScrollMetrics): number {
  return scrollTop + clientHeight * 0.75;
}
