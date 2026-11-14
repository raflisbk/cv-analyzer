import type { loadGsap } from "@/lib/gsap-loader";
import { loadGsap as getGsap } from "@/lib/gsap-loader";
import { irisProgress, irisRadius, irisRingStyle } from "@/lib/landing-iris";
import { processStepProgress } from "@/lib/landing-process";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];

function paintIris(
  wrapper: HTMLElement,
  panel: HTMLElement,
  laptop: HTMLElement,
  ring: HTMLElement,
) {
  const top = wrapper.getBoundingClientRect().top;
  const q = irisProgress(top, window.innerHeight);
  const radius = irisRadius(q, window.innerWidth, window.innerHeight);
  panel.style.clipPath = q < 1 ? `circle(${radius}px at 50% 50%)` : "none";
  panel.style.translate = q > 0 && q < 1 ? `0 ${-top}px` : "none";
  laptop.style.scale = String(1 + 0.1 * q * q * (3 - 2 * q));
  Object.assign(ring.style, irisRingStyle(radius, q));
}

function createIrisRing() {
  const ring = document.createElement("div");
  Object.assign(ring.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    zIndex: "30",
    pointerEvents: "none",
    background: "transparent",
    borderRadius: "50%",
    border: "7px solid #f2ff00",
    boxShadow: "0 0 40px rgba(242,255,0,.6)",
    opacity: "0",
  });
  ring.dataset.processIris = "true";
  document.body.appendChild(ring);
  return ring;
}

function mountIris(
  wrapper: HTMLElement,
  panel: HTMLElement,
  laptop: HTMLElement,
  ScrollTrigger: Awaited<ReturnType<typeof getGsap>>["ScrollTrigger"],
) {
  const ring = createIrisRing();
  const paint = () => paintIris(wrapper, panel, laptop, ring);
  const trigger = ScrollTrigger.create({
    trigger: wrapper,
    start: "top bottom",
    end: "top top",
    invalidateOnRefresh: true,
    refreshPriority: -100,
    onUpdate: paint,
    onRefresh: paint,
    onEnter: paint,
    onLeave: paint,
    onEnterBack: paint,
    onLeaveBack: paint,
  });
  paint();
  ScrollTrigger.refresh();
  return () => {
    trigger.kill();
    ring.remove();
    panel.style.clipPath = "";
    panel.style.translate = "";
    laptop.style.scale = "";
  };
}

export async function startProcessIris(
  wrapper: HTMLElement,
  panel: HTMLElement,
  isCancelled: () => boolean,
) {
  if (
    window.innerWidth <= 860 ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return () => {};
  }
  const laptop = document
    .querySelector<HTMLElement>("[data-laptop-screen]")
    ?.closest<HTMLElement>("section");
  if (!laptop) {
    return () => {};
  }
  await Promise.all([
    document.fonts.ready,
    ...Array.from(panel.querySelectorAll("img")).map((img) =>
      img.decode().catch(() => undefined),
    ),
  ]);
  const { ScrollTrigger } = await getGsap();
  if (isCancelled()) {
    return () => {};
  }
  return mountIris(wrapper, panel, laptop, ScrollTrigger);
}
type ProcessRailState = {
  path: SVGPathElement;
  done: SVGPathElement;
  rider: SVGCircleElement;
  len: number;
  progress: { value: number };
};

function paintProcessRail(rail: ProcessRailState) {
  const point = rail.path.getPointAtLength(rail.len * rail.progress.value);
  rail.rider.setAttribute("cx", String(point.x));
  rail.rider.setAttribute("cy", String(point.y));
  rail.done.style.strokeDashoffset = String(
    rail.len * (1 - rail.progress.value),
  );
}

function animateProcessStep(
  tl: ReturnType<Gsap["timeline"]>,
  step: HTMLElement,
  previous: HTMLElement,
  index: number,
  count: number,
  rail: ProcessRailState,
) {
  const img = step.querySelector("img");
  tl.to(previous, { autoAlpha: 0, y: -50, duration: 0.35 }, index - 0.35)
    .fromTo(
      step,
      { autoAlpha: 0, y: 70 },
      { autoAlpha: 1, y: 0, duration: 0.45 },
      index - 0.1,
    )
    .fromTo(
      img,
      { scale: 0.55 },
      { scale: 1, duration: 0.6, ease: "back.out(1.6)" },
      index - 0.1,
    )
    .to(
      rail.progress,
      {
        value: processStepProgress(index, count),
        duration: 0.8,
        ease: "none",
        onUpdate: () => paintProcessRail(rail),
      },
      index - 0.5,
    );
}

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
  const rail = { path, done, rider, len, progress: { value: 0 } };
  steps.forEach((step, i) => {
    const img = step.querySelector("img");
    if (i === 0) {
      tl.fromTo(
        img,
        { scale: 0.6 },
        { scale: 1, duration: 0.5 },
        0,
      );
      return;
    }
    animateProcessStep(tl, step, steps[i - 1], i, steps.length, rail);
  });
}
