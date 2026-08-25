export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : normalized;
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  if (!/^[\da-f]{6}$/i.test(expanded)) {
    return `rgba(20,20,20,${safeAlpha})`;
  }

  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${safeAlpha})`;
}
