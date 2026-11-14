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

export type AnnotationRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const HERO_BREAKPOINTS = [
  { viewport: 1440, stageWidth: 468, stageHeight: 520 },
  { viewport: 1280, stageWidth: 405, stageHeight: 520 },
  { viewport: 1024, stageWidth: 300, stageHeight: 520 },
  { viewport: 390, stageWidth: 318, stageHeight: 320 },
] as const;

export function heroAnnotationRects(
  viewportWidth: number,
  stageWidth: number,
  stageHeight: number,
): AnnotationRect[] {
  const mobile = viewportWidth <= 520;
  return [
    {
      x: stageWidth * (mobile ? 0 : 0.06),
      y: stageHeight * 0.12,
      width: mobile ? 150 : 180,
      height: mobile ? 40 : 50,
    },
    {
      x: stageWidth * (mobile ? 0.04 : 0.13),
      y: stageHeight * (mobile ? 0.3 : 0.25),
      width: 220,
      height: mobile ? 90 : 100,
    },
    {
      x: 0,
      y: stageHeight * (mobile ? 0.65 : 0.49),
      width: mobile ? 170 : 210,
      height: mobile ? 45 : 55,
    },
    {
      x: stageWidth - (mobile ? 220 : 250),
      y: stageHeight * (mobile ? 1 : 0.87) - (mobile ? 45 : 55),
      width: mobile ? 220 : 250,
      height: mobile ? 45 : 55,
    },
  ];
}

export function annotationsDoNotIntersect(
  rects: AnnotationRect[],
  gap = 12,
): boolean {
  return rects.every((a, index) =>
    rects
      .slice(index + 1)
      .every(
        (b) =>
          a.x + a.width + gap <= b.x ||
          b.x + b.width + gap <= a.x ||
          a.y + a.height + gap <= b.y ||
          b.y + b.height + gap <= a.y,
      ),
  );
}
