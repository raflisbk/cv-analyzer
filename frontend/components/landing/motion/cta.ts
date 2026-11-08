import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function ctaMotion(_gsap: Gsap, panel: HTMLElement, tl: ReturnType<Gsap["timeline"]>) {
  tl.from(panel.querySelector("[data-cta-tag]"), { scale: 0, rotate: -40, autoAlpha: 0, duration: .35, ease: "back.out(2.4)" }, 0)
    .from(panel.querySelector("h2"), { scale: 2.4, y: 120, autoAlpha: 0, transformOrigin: "left bottom", duration: .7, ease: "expo.out" }, .1)
    .from(panel.querySelector("p"), { autoAlpha: 0, y: 24, duration: .3 }, .6)
    .from(panel.querySelectorAll("a"), { scale: .3, autoAlpha: 0, stagger: .2, duration: .8, ease: "elastic.out(1,.5)" }, .75)
    .from(panel.querySelectorAll("img"), { x: -500, y: 200, rotate: -50, autoAlpha: 0, stagger: .2, duration: .9 }, .3);
}
