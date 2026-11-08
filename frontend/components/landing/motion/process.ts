import type { loadGsap } from "@/lib/gsap-loader";
import { processStepProgress } from "@/lib/landing-process";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function processMotion(
  gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  const steps = Array.from(panel.querySelectorAll<HTMLElement>("article"));
  const pinned = panel.dataset.processPinned === "true";
  if (!pinned) {
    tl.from(steps, { y: 45, autoAlpha: 0, stagger: 0.45, duration: 0.5 });
    return;
  }
  const path = panel.querySelector<SVGPathElement>("[data-rail-path]")!;
  const done = panel.querySelector<SVGPathElement>("[data-rail-done]")!;
  const rider = panel.querySelector<SVGCircleElement>("[data-rider]")!;
  const len = path.getTotalLength();
  done.style.strokeDasharray = String(len);
  done.style.strokeDashoffset = String(len);
  gsap.set(steps.slice(1), { autoAlpha: 0 });
  const progress = { value: 0 };
  steps.forEach((step, i) => {
    const img = step.querySelector("img");
    if (i === 0) {
      tl.fromTo(
        img,
        { scale: 0.6, rotate: -26 },
        { scale: 1, rotate: -6, duration: 0.5 },
        0,
      );
      return;
    }
    tl.to(steps[i - 1], { autoAlpha: 0, y: -50, duration: 0.35 }, i - 0.35)
      .fromTo(
        step,
        { autoAlpha: 0, y: 70 },
        { autoAlpha: 1, y: 0, duration: 0.45 },
        i - 0.1,
      )
      .fromTo(
        img,
        { scale: 0.55, rotate: -30 },
        { scale: 1, rotate: -6, duration: 0.6, ease: "back.out(1.6)" },
        i - 0.1,
      )
      .to(
        progress,
        {
          value: processStepProgress(i, steps.length),
          duration: 0.8,
          ease: "none",
          onUpdate: () => {
            const point = path.getPointAtLength(len * progress.value);
            rider.setAttribute("cx", String(point.x));
            rider.setAttribute("cy", String(point.y));
            done.style.strokeDashoffset = String(len * (1 - progress.value));
          },
        },
        i - 0.5,
      );
  });
}
