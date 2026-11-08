import type { loadGsap } from "@/lib/gsap-loader";
import { introTime, wordmarkWidth } from "@/lib/landing-intro-timing";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

function playExpand(
  timeline: gsap.core.Timeline,
  clip: HTMLElement,
  wordmark: HTMLElement,
  expanded: HTMLElement,
  width: () => number,
) {
  timeline
    .to(clip, { width, duration: 0.55, ease: "power2.inOut" }, introTime.expand)
    .to(
      wordmark,
      { yPercent: -110, autoAlpha: 0, duration: 0.5 },
      introTime.expand,
    )
    .fromTo(
      expanded,
      { yPercent: 60, autoAlpha: 0 },
      { yPercent: -50, autoAlpha: 1, duration: 0.55, ease: "back.out(1.3)" },
      introTime.expand,
    )
    .to(
      expanded.querySelectorAll("b"),
      {
        scale: 1,
        rotation: 0,
        stagger: 0.12,
        duration: 0.5,
        ease: "back.out(2)",
      },
      introTime.expand + 0.1,
    );
}

function playCollapse(
  timeline: gsap.core.Timeline,
  clip: HTMLElement,
  wordmark: HTMLElement,
  expanded: HTMLElement,
  width: () => number,
) {
  timeline
    .to(
      clip,
      { width, duration: 0.55, ease: "power2.inOut" },
      introTime.collapse,
    )
    .to(
      expanded,
      { yPercent: -160, autoAlpha: 0, duration: 0.5 },
      introTime.collapse,
    )
    .to(
      wordmark,
      { yPercent: 0, autoAlpha: 1, duration: 0.5 },
      introTime.collapse,
    );
}

export function playLoaderMorph(
  gsap: Gsap,
  timeline: gsap.core.Timeline,
  loader: HTMLElement,
) {
  const clip = loader.querySelector<HTMLElement>("[data-intro-clip]")!;
  const wordmark = loader.querySelector<HTMLElement>("[data-intro-wordmark]")!;
  const expanded = loader.querySelector<HTMLElement>("[data-intro-expanded]")!;
  const icon = loader.querySelector<HTMLElement>("[data-intro-icon]")!;
  const available = window.innerWidth - icon.getBoundingClientRect().width - 48;
  gsap.set(expanded.querySelectorAll("b"), {
    scale: 0,
    rotation: -20,
    transformOrigin: "50% 50%",
  });
  playExpand(timeline, clip, wordmark, expanded, () =>
    wordmarkWidth(expanded.offsetWidth, available),
  );
  playCollapse(timeline, clip, wordmark, expanded, () =>
    wordmarkWidth(wordmark.offsetWidth, available),
  );
}
