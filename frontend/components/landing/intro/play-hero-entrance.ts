function revealWords(timeline: gsap.core.Timeline, startAt: number) {
  timeline
    .from(
      "[data-landing-nav]",
      { y: -70, autoAlpha: 0, duration: 0.6 },
      startAt,
    )
    .from(
      "[data-hero-live]",
      { scale: 0, autoAlpha: 0, duration: 0.45, ease: "back.out(2.4)" },
      startAt,
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
      startAt,
    )
    .from(
      "[data-hero-copy],[data-hero-cta]",
      { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.5 },
      startAt + 0.15,
    );
}

function revealObjects(timeline: gsap.core.Timeline, startAt: number) {
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
      startAt,
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
      startAt + 0.3,
    );
}

export function playHeroEntrance(timeline: gsap.core.Timeline, startAt = 4.35) {
  revealWords(timeline, startAt);
  revealObjects(timeline, startAt);
}
