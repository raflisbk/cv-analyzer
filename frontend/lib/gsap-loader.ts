import type gsap from "gsap";

export type GsapCtx = gsap.Context;

export async function loadGsap() {
  const gsapModule = await import("gsap");
  const stModule = await import("gsap/ScrollTrigger");
  const g = gsapModule.gsap;
  const ScrollTrigger = stModule.ScrollTrigger;
  g.registerPlugin(ScrollTrigger);
  return { gsap: g, ScrollTrigger };
}
