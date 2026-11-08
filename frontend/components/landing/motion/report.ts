import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function reportMotion(_gsap: Gsap, panel: HTMLElement, tl: ReturnType<Gsap["timeline"]>) {
  const ring = panel.querySelector("circle[data-ring]");
  const bars = panel.querySelectorAll<HTMLElement>("[data-score-bar]");
  tl.from(panel.querySelector("h2"), { x: -90, autoAlpha: 0, duration: .45 }, 0)
    .from(panel.querySelectorAll("p,a"), { x: -40, autoAlpha: 0, stagger: .12, duration: .35 }, .25)
    .from(panel.querySelector("[data-report-card]"), { y: 120, rotate: 7, autoAlpha: 0, duration: .5 }, .2)
    .from(panel.querySelectorAll("[data-report-object]"), { rotate: -140, scale: .2, autoAlpha: 0, stagger: .25, duration: .6, ease: "back.out(1.6)" }, .5)
    .fromTo(ring, { strokeDasharray: "0 340" }, { strokeDasharray: "292 340", duration: .7 }, .6);
  bars.forEach((bar, i) => tl.fromTo(bar, { width: "0%" }, { width: `${bar.dataset.scoreBar}%`, duration: .4 }, .75 + i * .18));
  tl.from(panel.querySelectorAll("[data-rewrite] > *"), { y: 20, autoAlpha: 0, stagger: .2, duration: .3 }, 1.5);
}
