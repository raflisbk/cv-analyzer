import type { loadGsap } from "@/lib/gsap-loader";
import { countUpValue } from "@/lib/landing-stats";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

export function productsMotion(
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
        duration: 0.7,
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
  panel.querySelectorAll<HTMLElement>("[data-demo-bar]").forEach((bar, i) => {
    tl.fromTo(
      bar,
      { width: "0%" },
      { width: `${bar.dataset.demoBar}%`, duration: 0.4 },
      0.3 + i * 0.1,
    );
  });
}
