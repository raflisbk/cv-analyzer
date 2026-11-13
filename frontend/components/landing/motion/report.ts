import type { loadGsap } from "@/lib/gsap-loader";
import { countUpValue } from "@/lib/landing-stats";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function reportMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  const ring = panel.querySelector("circle[data-ring]");
  const number = panel.querySelector<HTMLElement>("[data-report-card] b")!;
  const count = { progress: 0 };
  const bars = panel.querySelectorAll<HTMLElement>("[data-score-bar]");
  tl.from(
    panel.querySelector("h2"),
    { x: -90, autoAlpha: 0, duration: 0.45 },
    0,
  )
    .from(
      panel.querySelectorAll("p,a"),
      { x: -40, autoAlpha: 0, stagger: 0.12, duration: 0.35 },
      0.25,
    )
    .from(
      panel.querySelector("[data-report-card]"),
      { y: 120, rotate: 7, autoAlpha: 0, duration: 0.5 },
      0.2,
    )
    .fromTo(
      ring,
      { strokeDasharray: "0 340" },
      { strokeDasharray: "292 340", duration: 0.7 },
      0.6,
    )
    .to(
      count,
      {
        progress: 1,
        duration: 0.7,
        onUpdate: () => {
          number.textContent = countUpValue(count.progress, 86, "");
        },
      },
      0.6,
    );
  bars.forEach((bar, i) =>
    tl.fromTo(
      bar,
      { width: "0%" },
      { width: `${bar.dataset.scoreBar}%`, duration: 0.4 },
      0.75 + i * 0.18,
    ),
  );
  tl.from(
    panel.querySelectorAll("[data-rewrite] > *"),
    { y: 20, autoAlpha: 0, stagger: 0.2, duration: 0.3 },
    1.5,
  );
}
