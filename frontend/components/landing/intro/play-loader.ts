import type { loadGsap } from "@/lib/gsap-loader";
import { introTime } from "@/lib/landing-intro-timing";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

function playIcon(timeline: gsap.core.Timeline, loader: HTMLElement) {
  const icon = loader.querySelector("[data-intro-icon]")!;
  const wiggle = loader.querySelector("[data-intro-wiggle]")!;
  timeline
    .fromTo(
      icon,
      { y: "-70vh", scaleX: 0.7, scaleY: 1.35, rotation: -14, autoAlpha: 1 },
      {
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        duration: 1.15,
        ease: "bounce.out",
      },
      0,
    )
    .fromTo(
      wiggle,
      { rotation: 0, transformOrigin: "50% 100%" },
      { rotation: -7, duration: 0.25, yoyo: true, repeat: 1 },
      1,
    )
    .to(wiggle, { rotation: 6, duration: 0.25, yoyo: true, repeat: 1 }, 1.5)
    .to(wiggle, { rotation: -2, duration: 0.15, yoyo: true, repeat: 1 }, 1.95)
    .fromTo(
      loader.querySelector("[data-intro-glow]"),
      { scale: 0.4, autoAlpha: 0 },
      { scale: 1.1, autoAlpha: 0.8, duration: 1.4 },
      0.5,
    );
}

function playPath(
  gsap: Gsap,
  timeline: gsap.core.Timeline,
  loader: HTMLElement,
) {
  const path = loader.querySelector("[data-intro-path]")!;
  const start = loader.querySelector("[data-intro-start]")!;
  const end = loader.querySelector("[data-intro-end]")!;
  const ring = loader.querySelector("[data-intro-ring]")!;
  gsap.set(path, { strokeDasharray: 100, strokeDashoffset: 100 });
  gsap.set([start, end], { scale: 0, transformOrigin: "50% 50%" });
  gsap.set(ring, { autoAlpha: 0, transformOrigin: "50% 50%" });
  timeline
    .to(
      path,
      { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
      0.95,
    )
    .to(start, { scale: 1, duration: 0.45, ease: "back.out(3)" }, 0.85)
    .to(end, { scale: 1, duration: 0.5, ease: "back.out(3)" }, 1.55)
    .fromTo(
      ring,
      { scale: 1, autoAlpha: 0.9 },
      { scale: 4.2, autoAlpha: 0, duration: 0.8 },
      1.55,
    );
}

function playWordmark(timeline: gsap.core.Timeline, loader: HTMLElement) {
  const clip = loader.querySelector("[data-intro-clip]")!;
  const wordmark = loader.querySelector<HTMLElement>("[data-intro-wordmark]")!;
  timeline
    .to(
      clip,
      {
        width: wordmark.offsetWidth,
        marginLeft: "clamp(14px, 2vw, 26px)",
        duration: 0.65,
        ease: "back.out(1.2)",
      },
      introTime.wordmark,
    )
    .fromTo(
      wordmark,
      { x: -30, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.5)" },
      introTime.wordmark + 0.1,
    );
}

export function playLoader(
  gsap: Gsap,
  timeline: gsap.core.Timeline,
  loader: HTMLElement,
) {
  playIcon(timeline, loader);
  playPath(gsap, timeline, loader);
  playWordmark(timeline, loader);
}
