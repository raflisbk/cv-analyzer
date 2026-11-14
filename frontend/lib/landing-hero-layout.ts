export const HERO_OBJECTS = [{ name: "cv", asset: "cv-hero" }] as const;

export const HERO_STICKERS = [
  { name: "ats" },
  { name: "impact" },
  { name: "gap" },
] as const;

export function heroChromeHeight(
  announcementHeight: number,
  headerHeight: number,
) {
  return `${announcementHeight + headerHeight}px`;
}
