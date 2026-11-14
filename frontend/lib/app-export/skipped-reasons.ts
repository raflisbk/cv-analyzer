export function parseSkippedReasons(
  value: string | null,
): Record<string, string> | undefined {
  if (!value) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return undefined;
  }
}

export function skippedReasonMessage(code: string): string {
  switch (code) {
    case "no_room":
      return "No room in your original layout: this line stays as you wrote it.";
    case "needs_input":
      return "This fix needs your answer before it can be applied.";
    case "text_not_found":
      return "The original line was not found in this file.";
    case "missing_text":
      return "This fix has no replacement text to export.";
    default:
      return "This fix could not be applied to the exported file.";
  }
}

export function skippedReasonLines(
  reasons: Record<string, string> | undefined,
  titles: Record<string, string>,
) {
  return Object.entries(reasons ?? {}).map(([id, code]) => ({
    id,
    title: titles[id] ?? `Fix ${id}`,
    message: skippedReasonMessage(code),
  }));
}
