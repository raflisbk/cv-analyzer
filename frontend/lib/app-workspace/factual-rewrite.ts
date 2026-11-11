export function hasUnsupportedNumbers(
  source: string,
  after: string,
  provided = "",
): boolean {
  const existing = new Set<string>([...(source.match(/\b\d+(?:[.,]\d+)?%?/g) ?? []), provided]);
  return (after.match(/\b\d+(?:[.,]\d+)?%?/g) ?? []).some(
    (number) => !existing.has(number),
  );
}
