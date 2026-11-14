import type { loadGsap } from "@/lib/gsap-loader";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function stickersMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(panel.querySelector("h2"), { autoAlpha: 0, y: 12, duration: 0.3 });
}
