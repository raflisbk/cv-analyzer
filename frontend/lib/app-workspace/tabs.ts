export function nextTabIndex(
  key: string,
  index: number,
  count: number,
): number | null {
  if (key === "ArrowRight") {
    return (index + 1) % count;
  }
  if (key === "ArrowLeft") {
    return (index - 1 + count) % count;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }
  return null;
}

export interface ScrollEdges {
  start: boolean;
  end: boolean;
}

export function scrollEdges(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number,
): ScrollEdges {
  return {
    start: scrollLeft > 1,
    end: scrollLeft + clientWidth < scrollWidth - 1,
  };
}
