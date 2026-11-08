import { laptopInsights } from "@/lib/landing-laptop-insights";
import { laptopStepFromProgress } from "@/lib/landing-laptop-steps";
import { clampObjectPosition, screenSize } from "@/lib/landing-laptop-screen";

function sectionOffset(element: HTMLElement, paper: HTMLElement) {
  let x = 0;
  let y = 0;
  let current: HTMLElement | null = element;
  while (current && current !== paper) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export function measureLaptopScene(scene: HTMLElement) {
  const step = Number(scene.dataset.scStep || 0);
  const insight = laptopInsights[step];
  const paper = scene.querySelector<HTMLElement>("[data-sc-paper]");
  const target =
    insight?.target && paper?.querySelector<HTMLElement>(insight.target);
  const highlight = scene.querySelector<HTMLElement>("[data-sc-highlight]");
  if (!paper || !target || !highlight) {
    return;
  }
  const { x, y } = sectionOffset(target, paper);
  const pad = 4;
  Object.assign(highlight.style, {
    left: `${x - pad}px`,
    top: `${y - pad}px`,
    width: `${target.offsetWidth + pad * 2}px`,
    height: `${target.offsetHeight + pad * 2}px`,
  });
  const object = scene.querySelector<HTMLElement>(
    `[data-sc-object="${insight.object}"]`,
  );
  if (object) {
    const paperLeft = paper.offsetLeft;
    const paperTop = paper.offsetTop;
    object.style.left = `${clampObjectPosition(paperLeft + x + target.offsetWidth - 52, paperLeft, paper.offsetWidth, object.offsetWidth)}px`;
    object.style.top = `${Math.max(paperTop - object.offsetHeight / 2, Math.min(screenSize.height - object.offsetHeight, paperTop + y - 30))}px`;
  }
}

function activateLaptopScene(scene: HTMLElement, step: number) {
  const insight = laptopInsights[step];
  scene.dataset.scMode = insight.mode || "";
  scene
    .querySelectorAll<HTMLElement>("[data-sc-state]")
    .forEach((state, index) => {
      state.dataset.scActive = String(index === step);
      state.setAttribute("aria-hidden", String(index !== step));
    });
  scene
    .querySelectorAll<HTMLElement>("[data-sc-dots] i")
    .forEach((dot, index) => {
      dot.dataset.scActive = String(index === step - 1);
    });
  scene.querySelectorAll<HTMLElement>("[data-sc-object]").forEach((object) => {
    object.dataset.scActive = String(
      object.dataset.scObject === insight.object,
    );
  });
  const highlight = scene.querySelector<HTMLElement>("[data-sc-highlight]");
  if (highlight) {
    highlight.dataset.scActive = String(step > 0);
  }
  const announcement = scene.querySelector<HTMLElement>(
    "[data-sc-announcement]",
  );
  if (announcement) {
    announcement.textContent = step
      ? `${insight.eyebrow}: ${insight.title}`
      : "";
  }
}

export function paintLaptopScene(
  screen: HTMLElement,
  progress: number,
  staticView = false,
) {
  const scene = screen.querySelector<HTMLElement>("[data-laptop-scene]");
  if (!scene) {
    return;
  }
  const step = staticView ? 0 : laptopStepFromProgress(progress);
  if (scene.dataset.scStep === String(step)) {
    return;
  }
  scene.dataset.scStep = String(step);
  activateLaptopScene(scene, step);
  measureLaptopScene(scene);
}
