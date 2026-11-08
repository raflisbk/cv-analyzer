import type { loadGsap } from "@/lib/gsap-loader";
import { playLoader } from "./play-loader";
import { playHeroEntrance } from "./play-hero-entrance";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function playIntro(gsap: Gsap, loader: HTMLElement, done: () => void) {
  const path = loader.querySelector<SVGPathElement>("[data-intro-path]");
  const dot = loader.querySelector("[data-intro-dot]");
  const mark = loader.querySelector("svg");
  const wordmark = loader.querySelector("[data-intro-wordmark]");
  const count = loader.querySelector("[data-intro-count]");
  const bar = loader.querySelector("[data-intro-bar]");
  if (!path || !dot || !mark || !wordmark || !count || !bar) {
    done();
    return null;
  }
  const timeline = gsap.timeline({ onComplete: done });
  playLoader(gsap, timeline, { path, dot, mark, wordmark, count, bar }, loader);
  playHeroEntrance(gsap, timeline);
  return timeline;
}
