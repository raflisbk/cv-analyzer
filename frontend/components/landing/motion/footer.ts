import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function footerMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(
    panel.querySelectorAll("[data-footer-column]"),
    { autoAlpha: 0, stagger: 0.08, duration: 0.3 },
    0,
  ).from(
    panel.querySelector("[data-footer-bottom]"),
    { autoAlpha: 0, duration: 0.3 },
    0.5,
  );
}
