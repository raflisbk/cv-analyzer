import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function productsMotion(_gsap: Gsap, panel: HTMLElement, tl: ReturnType<Gsap["timeline"]>) {
  const cards = panel.querySelectorAll("article");
  tl.fromTo(panel.querySelector("h2"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: .5 }, 0)
    .from(cards, { x: (i: number) => 900 + i * 160, rotate: (i: number) => 16 - i * 4, autoAlpha: 0, stagger: .5, duration: .8 }, .3)
    .from(panel.querySelectorAll("article img"), { scale: 0, rotate: 180, autoAlpha: 0, stagger: .5, duration: .6, ease: "back.out(2)" }, .9);
}
