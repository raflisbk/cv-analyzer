import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function footerMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(
    panel.querySelectorAll("[data-footer-column]"),
    { y: 60, autoAlpha: 0, stagger: 0.12, duration: 0.6 },
    0,
  ).from(
    panel.querySelector("[data-footer-bottom]"),
    { autoAlpha: 0, y: 30, duration: 0.4 },
    0.5,
  );
}
