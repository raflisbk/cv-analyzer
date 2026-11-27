import type { ReportDetail } from "@/lib/app-api/report-detail.types";

type T = (key: string, vars?: Record<string, string | number>) => string;
type Detail = ReportDetail;

const FIX_TITLE_PAIRS = new Set([
  "summary_action_verb",
  "summary_impact_metric",
  "experience_action_verb",
  "experience_impact_metric",
  "skills_missing_section",
  "education_missing_section",
]);
const FIX_ACTIONS = new Set([
  "action_verb",
  "impact_metric",
  "missing_section",
]);
const SECTIONS = new Set([
  "header",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
]);
const VERDICTS = new Set(["strong", "good", "room", "needs"]);
const NOTES = new Set(["strong", "more", "missing", "empty"]);
const TAGS = new Set(["actionVerb", "number", "scannableLength"]);
const METRICS = new Set([
  "bulletsWithNumber",
  "strongActionVerbs",
  "activeVoice",
  "keywordsFound",
  "sectionsPresent",
]);
const EVIDENCE = new Set(["suggested", "strongBullet"]);

export function reportVerdict(t: T, verdict: Detail["verdict"]) {
  if (!verdict.key || !VERDICTS.has(verdict.key)) {
    return verdict;
  }
  return {
    title: t(`appReport.copy.verdict.${verdict.key}.title`),
    body: t(`appReport.copy.verdict.${verdict.key}.body`),
  };
}

function pageFact(t: T, pages: number) {
  return pages === 1
    ? t("appReport.copy.facts.page")
    : t("appReport.copy.facts.pages", { count: pages });
}

export function reportFacts(t: T, data: Detail): string[] {
  const counts = data.factCounts;
  if (!counts) {
    return data.facts;
  }
  return [
    pageFact(t, counts.pages),
    t("appReport.copy.facts.bullets", { count: counts.bullets }),
    t("appReport.copy.facts.words", { count: counts.words }),
    ...data.facts
      .slice(3)
      .map((_, index) =>
        t(`appReport.copy.facts.${["projectedNote", "keywordNote"][index]}`),
      ),
  ];
}

export function reportAtsFacts(t: T, ats: Detail["ats"]): string[] {
  if (ats.pages === undefined || ats.sizeKb === undefined) {
    return ats.facts;
  }
  return [
    ats.format ?? "",
    ats.pages ? pageFact(t, ats.pages) : "",
    t("appReport.copy.facts.size", { count: ats.sizeKb }),
  ].filter(Boolean);
}

export function reportFixTitle(t: T, fix: Detail["fixes"][number]) {
  if (!fix.section || !fix.type) {
    return fix.title;
  }
  const pair = `${fix.section.toLowerCase()}_${fix.type}`;
  if (FIX_TITLE_PAIRS.has(pair)) {
    return t(`appReport.copy.fixTitles.${pair}`);
  }
  const section = fix.section.toLowerCase();
  return t("appReport.copy.fixTitle", {
    section: SECTIONS.has(section)
      ? t(`appReport.copy.sectionNames.${section}`)
      : fix.section,
    action: t(
      `appReport.copy.fixActions.${FIX_ACTIONS.has(fix.type) ? fix.type : "other"}`,
    ),
  });
}

export function reportSectionName(t: T, section: Detail["sections"][number]) {
  return section.key && SECTIONS.has(section.key)
    ? t(`appReport.copy.sectionNames.${section.key}`)
    : section.name;
}

export function reportSectionNote(t: T, section: Detail["sections"][number]) {
  return section.noteKey && NOTES.has(section.noteKey)
    ? t(`appReport.copy.sectionNotes.${section.noteKey}`)
    : section.note;
}

export function reportBulletTags(t: T, bullet: Detail["bullets"][number]) {
  return bullet.tags.map((tag, index) => {
    const key = bullet.tagKeys?.[index];
    return key && TAGS.has(key) ? t(`appReport.copy.tags.${key}`) : tag;
  });
}

export function reportMetric(
  t: T,
  metric: Detail["dimensions"][number]["metrics"][number],
) {
  const known = metric.key && METRICS.has(metric.key);
  const counted = metric.count !== undefined && metric.total !== undefined;
  return {
    label: known ? t(`appReport.copy.metrics.${metric.key}`) : metric.label,
    value: counted
      ? t("appReport.copy.metrics.value", {
          count: metric.count ?? 0,
          total: metric.total ?? 0,
        })
      : metric.value,
  };
}

export function reportHint(t: T, dimension: Detail["dimensions"][number]) {
  return dimension.metrics.some((metric) => metric.key)
    ? t(`appReport.copy.hints.${dimension.key}`)
    : dimension.hint;
}

export function reportEvidenceNote(
  t: T,
  item: Detail["dimensions"][number]["evidence"][number],
) {
  return item.noteKey && EVIDENCE.has(item.noteKey)
    ? t(`appReport.copy.evidence.${item.noteKey}`)
    : item.note;
}
