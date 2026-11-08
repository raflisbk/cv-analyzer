import type { loadGsap } from "@/lib/gsap-loader";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function playHeroEntrance(gsap: Gsap, timeline: gsap.core.Timeline) {
  timeline
    .from("[data-landing-nav]", { y: -70, autoAlpha: 0, duration: 0.6 }, 2.8)
    .from(
      "[data-hero-live]",
      { scale: 0, autoAlpha: 0, duration: 0.45, ease: "back.out(2.4)" },
      2.9,
    )
    .from(
      "[data-hero-word]",
      {
        yPercent: 120,
        autoAlpha: 0,
        stagger: 0.09,
        duration: 0.75,
        ease: "expo.out",
      },
      2.85,
    )
    .from(
      "[data-hero-copy],[data-hero-cta]",
      { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.5 },
      3.3,
    )
    .from(
      "[data-hero-object]",
      {
        scale: 0,
        rotation: -120,
        autoAlpha: 0,
        stagger: 0.09,
        duration: 0.8,
        ease: "back.out(1.7)",
      },
      2.9,
    )
    .from(
      "[data-hero-sticker]",
      {
        scale: 0,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(2.6)",
      },
      3.4,
    );
}
