import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function featuresMotion(gsap: Gsap, panel: HTMLElement, tl: ReturnType<Gsap["timeline"]>) {
  const cards = panel.querySelectorAll("article");
  gsap.set(cards, { transformPerspective: 900, transformOrigin: "left center" });
  tl.from(panel.querySelector("h2"), { x: 90, autoAlpha: 0, duration: .4 }, 0)
    .from(cards, { rotationY: -95, autoAlpha: 0, stagger: .32, duration: .7, ease: "power3.out" }, .3)
    .from(panel.querySelectorAll("article img"), { y: -120, scale: .4, autoAlpha: 0, stagger: .32, duration: .6, ease: "bounce.out" }, .75);
}
