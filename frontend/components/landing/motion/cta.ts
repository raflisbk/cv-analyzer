import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function ctaMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(
    panel.querySelector("[data-cta-tag]"),
    {
      scale: 0,
      rotate: -40,
      autoAlpha: 0,
      duration: 0.35,
      ease: "back.out(2.4)",
    },
    0,
  )
    .from(
      panel.querySelector("h2"),
      {
        scale: 2.4,
        y: 120,
        autoAlpha: 0,
        transformOrigin: "left bottom",
        duration: 0.7,
        ease: "expo.out",
      },
      0.1,
    )
    .from(panel.querySelector("p"), { autoAlpha: 0, y: 24, duration: 0.3 }, 0.6)
    .from(
      panel.querySelectorAll("a"),
      {
        scale: 0.3,
        autoAlpha: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "elastic.out(1,.5)",
      },
      0.75,
    )
    .from(
      panel.querySelectorAll("img"),
      {
        x: -500,
        y: 200,
        rotate: -50,
        autoAlpha: 0,
        stagger: 0.2,
        duration: 0.9,
      },
      0.3,
    );
}
