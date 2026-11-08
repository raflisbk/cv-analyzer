export function irisProgress(wrapperTop: number, viewportHeight: number) {
  if (viewportHeight <= 0) {
    return 1;
  }
  return Math.max(0, Math.min(1, 1 - wrapperTop / viewportHeight));
}

export function irisRadius(progress: number, width: number, height: number) {
  const q = Math.max(0, Math.min(1, progress));
  const eased = q * q * (3 - 2 * q);
  return eased * Math.hypot(width, height) * 0.53;
}

export function irisRingStyle(radius: number, progress: number) {
  return {
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    marginLeft: `${-radius}px`,
    marginTop: `${-radius}px`,
    opacity: progress > 0.02 && progress < 0.98 ? "1" : "0",
  };
}
