const appReportCopyEn = {
  verdict: {
    strong: {
      title: "Strong CV",
      body: "Your analysis shows strong evidence across the scored dimensions.",
    },
    good: {
      title: "Good foundation",
      body: "Several targeted edits could strengthen this CV.",
    },
    room: {
      title: "Room to improve",
      body: "Focus on the lowest scoring dimensions first.",
    },
    needs: {
      title: "Needs work",
      body: "Add concrete evidence and complete the missing details.",
    },
  },
  facts: {
    page: "1 page",
    pages: "{count} pages",
    bullets: "{count} bullets",
    words: "{count} words",
    projectedNote: "Projected gains are estimates based on open suggestions.",
    keywordNote: "Missing keyword post counts are unknown when shown as 0.",
    size: "{count} KB",
  },
  fixTitle: "{section}: {action}",
  fixTitles: {
    summary_action_verb: "Summary: be specific",
    summary_impact_metric: "Summary: show an outcome",
    experience_action_verb: "Experience: use an action verb",
    experience_impact_metric: "Experience: quantify the impact",
    skills_missing_section: "Skills: group by area",
    education_missing_section: "Education: add credentials",
  },
  fixActions: {
    action_verb: "use an action verb",
    impact_metric: "quantify the impact",
    missing_section: "add missing detail",
    other: "improve this section",
  },
  sectionNames: {
    header: "Header",
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications",
    other: "Other",
  },
  sectionNotes: {
    strong: "Strong evidence in this section.",
    more: "Add one more concrete detail to this section.",
    missing: "Add the missing details for this section.",
    empty: "This section is empty.",
  },
  tags: {
    actionVerb: "Action verb",
    number: "Number",
    scannableLength: "Scannable length",
  },
  metrics: {
    bulletsWithNumber: "Bullets with a number",
    strongActionVerbs: "Strong action verbs",
    activeVoice: "Active voice",
    keywordsFound: "Keywords found",
    sectionsPresent: "Sections present",
    value: "{count} of {total}",
  },
  hints: {
    impact: "Add verified results to experience bullets.",
    clarity: "Use direct, concise wording.",
    relevance: "Show relevant skills in context.",
    completeness: "Fill in missing CV sections.",
  },
  versionSummary: {
    first: "First analysis.",
    unchanged: "No dimension changed.",
    changed: "Score {score}; {dimension} {change}.",
  },
  evidence: {
    suggested: "Suggested change",
    strongBullet: "Strong bullet",
  },
};

export default appReportCopyEn;
