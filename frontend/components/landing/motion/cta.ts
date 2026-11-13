import type { loadGsap } from "@/lib/gsap-loader";
import { countUpValue } from "@/lib/landing-stats";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function ctaMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  const number = panel.querySelector<HTMLElement>("[data-demo-count]");
  if (number) {
    const count = { progress: 0 };
    tl.to(
      count,
      {
        progress: 1,
        duration: 0.6,
        onUpdate: () => {
          number.textContent = countUpValue(
            count.progress,
            Number(number.dataset.demoCount),
            "",
          );
        },
      },
      0,
    );
  }
  tl.fromTo(
    panel.querySelector("[data-demo-before]"),
    { textDecorationColor: "transparent" },
    { textDecorationColor: "currentColor", duration: 0.35 },
    0.5,
  );
  tl.from(
    panel.querySelector("[data-demo-after]"),
    { autoAlpha: 0, y: 8, duration: 0.4 },
    0.85,
  );
}
