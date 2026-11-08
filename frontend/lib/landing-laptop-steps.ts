export function laptopStepFromProgress(progress: number) {
  const value = Math.max(0, Math.min(1, progress));
  return value < 0.045 ? 0 : Math.min(10, Math.round(value * 10 + 1e-10));
}
