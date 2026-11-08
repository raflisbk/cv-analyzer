import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function featuresMotion(
  gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  const cards = panel.querySelectorAll("article");
  gsap.set(cards, {
    transformPerspective: 900,
    transformOrigin: "left center",
  });
  tl.from(panel.querySelector("h2"), { x: 90, autoAlpha: 0, duration: 0.4 }, 0)
    .from(
      cards,
      {
        rotationY: -95,
        autoAlpha: 0,
        stagger: 0.32,
        duration: 0.7,
        ease: "power3.out",
      },
      0.3,
    )
    .from(
      panel.querySelectorAll("article img"),
      {
        y: -120,
        scale: 0.4,
        autoAlpha: 0,
        stagger: 0.32,
        duration: 0.6,
        ease: "bounce.out",
      },
      0.75,
    );
}
