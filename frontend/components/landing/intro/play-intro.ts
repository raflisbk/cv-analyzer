import type { loadGsap } from "@/lib/gsap-loader";
import { playLoader } from "./play-loader";
import { playLoaderMorph } from "./play-loader-morph";
import { playLoaderExit } from "./play-loader-exit";
import { playHeroEntrance } from "./play-hero-entrance";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function playIntro(
  gsap: Gsap,
  loader: HTMLElement,
  unlock: () => void,
  done: () => void,
) {
  if (!loader.querySelector("[data-intro-expanded]")) {
    done();
    return null;
  }
  const timeline = gsap.timeline({ onComplete: done });
  playLoader(gsap, timeline, loader);
  playLoaderMorph(gsap, timeline, loader);
  playLoaderExit(gsap, timeline, loader, unlock);
  playHeroEntrance(timeline);
  return timeline;
}
