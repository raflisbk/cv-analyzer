export function relativeDate(value: string): string {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 86400000),
  );
  if (days === 0) {
    return "today";
  }
  if (days === 1) {
    return "yesterday";
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  if (days < 60) {
    return "last month";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function fileMeta(
  role: string | null,
  date: string,
  verb: string,
): string {
  return `${role ?? "No target role"} · ${verb} ${relativeDate(date)}`;
}
