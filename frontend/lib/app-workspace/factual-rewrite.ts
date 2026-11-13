export function hasUnsupportedNumbers(
  source: string,
  after: string,
  provided = "",
): boolean {
  const existing = new Set<string>([
    ...(source.match(/\b\d+(?:[.,]\d+)?%?/g) ?? []),
    ...(provided.match(/\b\d+(?:[.,]\d+)?%?/g) ?? []),
  ]);
  return (after.match(/\b\d+(?:[.,]\d+)?%?/g) ?? []).some(
    (number) => !existing.has(number),
  );
}

export function canApplyFix(
  source: string,
  after: string,
  template: string,
  answers: Record<string, string> = {},
): boolean {
  if (/\[[^\]]+\]/.test(after)) {
    return false;
  }
  const provided =
    Object.values(answers).join(" ") ||
    (template.includes("[")
      ? (after.match(/\d+(?:[.,]\d+)?%?/)?.[0] ?? "")
      : "");
  return !hasUnsupportedNumbers(source, after, provided);
}
