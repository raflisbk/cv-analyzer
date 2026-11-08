function revealWords(timeline: gsap.core.Timeline) {
  timeline
    .from("[data-landing-nav]", { y: -70, autoAlpha: 0, duration: 0.6 }, 4.35)
    .from(
      "[data-hero-live]",
      { scale: 0, autoAlpha: 0, duration: 0.45, ease: "back.out(2.4)" },
      4.35,
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
      4.35,
    )
    .from(
      "[data-hero-copy],[data-hero-cta]",
      { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.5 },
      4.5,
    );
}

function revealObjects(timeline: gsap.core.Timeline) {
  timeline
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
      4.35,
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
      4.65,
    );
}

export function playHeroEntrance(timeline: gsap.core.Timeline) {
  revealWords(timeline);
  revealObjects(timeline);
}
