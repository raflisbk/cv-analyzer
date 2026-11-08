import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function stickersMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(
    panel.querySelector("h2"),
    { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: "elastic.out(1,.55)" },
    0,
  );
  panel
    .querySelectorAll("[data-sticker]")
    .forEach((el, i) =>
      tl.from(
        el,
        {
          y: -900,
          rotate: (i % 2 ? 1 : -1) * 50,
          duration: 0.8,
          ease: "bounce.out",
        },
        0.35 + i * 0.28,
      ),
    );
  tl.from(
    panel.querySelectorAll("img"),
    {
      scale: 0,
      rotate: 180,
      autoAlpha: 0,
      stagger: 0.15,
      duration: 0.5,
      ease: "back.out(2)",
    },
    1.2,
  );
}
