const QUESTION_NAMES: Record<string, string> = {
  "[%]": "percentage",
  "[amount]": "amount",
  "[n]": "number",
  "[how many?]": "count",
  "[timeframe]": "timeframe",
  "[team size]": "teamSize",
  "[year]": "year",
  "[month year]": "monthYear",
  "[project name]": "projectName",
};

export const FIX_QUESTION_NAMES = Object.values(QUESTION_NAMES);

export function fixQuestionName(token: string): string | null {
  return QUESTION_NAMES[token.trim().toLowerCase()] ?? null;
}

export function fallbackFixQuestion(token: string, question: string): string {
  const source = /\[[^\]]*\]/.test(question) ? token : question || token;
  const label = source.replace(/[[\]]/g, "").trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function resolveFixQuestion(
  { token, question }: { token: string; question: string },
  t: (key: string) => string,
): string {
  const name = fixQuestionName(token);
  return name
    ? t(`appWorkspacePanel.fixes.questions.${name}`)
    : fallbackFixQuestion(token, question);
}
