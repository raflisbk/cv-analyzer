const LABEL_KEYS: Record<string, string> = {
  "See ATS checks": "appReport.hero.atsAction",
  "Edit skills": "appReport.hero.skillsAction",
  "Show fix": "appReport.hero.showFix",
};

export function reportFixActionLabel(
  t: (key: string) => string,
  label: string,
): string {
  const key = LABEL_KEYS[label];
  return key ? t(key) : label;
}
