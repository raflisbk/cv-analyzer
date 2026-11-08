import type { loadGsap } from "@/lib/gsap-loader";
import { countUpValue } from "@/lib/landing-stats";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function statsMotion(_gsap: Gsap, panel: HTMLElement, tl: ReturnType<Gsap["timeline"]>) {
  panel.querySelectorAll<HTMLElement>("[data-stat]").forEach((column, i) => {
    const number = column.querySelector<HTMLElement>("b")!;
    const count = { progress: 0 };
    tl.from(column, { scaleX: 0, duration: .45 }, i * .55)
      .fromTo(number, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: .55 }, i * .55 + .15)
      .to(count, { progress: 1, duration: .7, onUpdate: () => { number.textContent = countUpValue(count.progress, Number(number.dataset.value), number.dataset.suffix ?? ""); } }, i * .55 + .15)
      .from(column.querySelector("span"), { autoAlpha: 0, y: 14, duration: .3 }, i * .55 + .55)
      .from(column.querySelector("img"), { x: i === 0 ? -360 : i === 2 ? 360 : 0, y: i === 1 ? -300 : 0, rotate: (i - 1) * 300, scale: .4, autoAlpha: 0, duration: .8 }, i * .55 + .2);
  });
}
