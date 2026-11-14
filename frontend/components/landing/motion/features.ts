import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function featuresMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(panel.querySelector("h2"), { autoAlpha: 0, duration: 0.3 }, 0).from(
    panel.querySelectorAll("article"),
    {
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.3,
    },
    0.15,
  );
}
