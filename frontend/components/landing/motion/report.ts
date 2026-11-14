import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function reportMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(
    panel.querySelector("h2"),
    { x: -24, autoAlpha: 0, duration: 0.35 },
    0,
  ).from(
    panel.querySelectorAll("p,a"),
    { x: -20, autoAlpha: 0, stagger: 0.08, duration: 0.35 },
    0.25,
  );
}
