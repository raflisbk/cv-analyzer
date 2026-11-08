import type { loadGsap } from "@/lib/gsap-loader";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function playHeroScroll(gsap: Gsap, hero: HTMLElement) {
  const pin = hero.offsetHeight <= window.innerHeight + 30;
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: pin ? "top 12px" : "top top",
      end: pin ? "+=90%" : "bottom top",
      pin,
      scrub: 0.6,
      anticipatePin: 1,
    },
  });
  timeline
    .to(
      "[data-hero-live],[data-hero-copy]",
      { autoAlpha: 0, y: -30, duration: 0.3 },
      0,
    )
    .to(
      "[data-hero-word]",
      { yPercent: -140, autoAlpha: 0, stagger: 0.06, duration: 0.5 },
      0.05,
    )
    .to("[data-hero-cta]", { autoAlpha: 0, y: -40, duration: 0.35 }, 0.1)
    .to(
      "[data-hero-sticker]",
      { scale: 0, rotation: 40, duration: 0.35, stagger: 0.05 },
      0,
    )
    .to(
      "[data-hero-object]:not(:first-child)",
      {
        x: 240,
        y: 100,
        rotation: 60,
        autoAlpha: 0,
        stagger: 0.04,
        duration: 0.8,
      },
      0.15,
    )
    .to(
      "[data-hero-object]:first-child",
      { x: -120, scale: 1.45, rotation: 2, duration: 0.8 },
      0.2,
    )
    .to(hero.querySelector("svg")!, { yPercent: 14, duration: 1 }, 0);
  return timeline;
}
