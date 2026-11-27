export const HERO_CTA_VISIBLE_RATIO = 0.6;
const HERO_CTA_FADED_OPACITY = 0.5;

export function heroCtaFaded(style: { opacity: string; visibility: string }) {
  const opacity = style.opacity === "" ? 1 : Number(style.opacity);
  return style.visibility === "hidden" || opacity < HERO_CTA_FADED_OPACITY;
}

export function heroCtaShowing(
  ratio: number,
  style: { opacity: string; visibility: string },
) {
  return ratio >= HERO_CTA_VISIBLE_RATIO && !heroCtaFaded(style);
}
