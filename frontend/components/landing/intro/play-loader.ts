import type { loadGsap } from "@/lib/gsap-loader";

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

type Parts = {
  path: SVGPathElement;
  dot: Element;
  mark: Element;
  wordmark: Element;
  count: Element;
  bar: Element;
};

export function playLoader(
  gsap: Gsap,
  timeline: gsap.core.Timeline,
  parts: Parts,
  loader: HTMLElement,
) {
  const { path, dot, mark, wordmark, count, bar } = parts;
  const length = path.getTotalLength();
  const counter = { value: 0 };
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  timeline
    .fromTo(
      mark,
      { scale: 0.4, rotation: -14, autoAlpha: 0 },
      {
        scale: 1,
        rotation: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "back.out(2.2)",
      },
      0,
    )
    .to(path, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, 0.35)
    .fromTo(
      dot,
      { scale: 0, transformOrigin: "50% 50%" },
      { scale: 1, duration: 0.45, ease: "back.out(3)" },
      1.1,
    )
    .to(
      counter,
      {
        value: 100,
        duration: 1.9,
        ease: "power2.inOut",
        onUpdate: () => {
          count.textContent = String(Math.round(counter.value));
          gsap.set(bar, { scaleX: counter.value / 100 });
        },
      },
      0.2,
    )
    .from(
      wordmark,
      { y: 80, autoAlpha: 0, duration: 0.6, ease: "back.out(1.8)" },
      1.5,
    )
    .to(loader, { yPercent: -118, duration: 1, ease: "expo.inOut" }, 2.45);
}
