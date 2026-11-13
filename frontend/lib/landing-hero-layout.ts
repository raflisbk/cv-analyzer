export const HERO_OBJECTS = [{ name: "cv", asset: "cv-hero" }] as const;

export const HERO_STICKERS = [
  { name: "ats", label: "ATS OK" },
  { name: "impact", label: "92 Impact" },
  { name: "gap", label: "Skill gap found" },
] as const;

export function heroChromeHeight(
  announcementHeight: number,
  headerHeight: number,
) {
  return `${announcementHeight + headerHeight}px`;
}
