import { paintLaptopScene } from "./laptop-scene";
import { paintLaptopCamera } from "./laptop-camera";
import { paintLaptopLid } from "./laptop-lid";
import { laptopProgress } from "@/lib/landing-laptop";

function expandPanel(panel: HTMLElement, progress: number) {
  if (window.innerWidth <= 860) {
    return;
  }
  const wide = Math.min(1600, window.innerWidth - 32);
  const amount = Math.min(1, progress / 0.12);
  const width = wide + (window.innerWidth - wide) * amount;
  panel.style.width = `${width}px`;
  panel.style.maxWidth = `${width}px`;
  const pinned = getComputedStyle(panel).position === "fixed";
  panel.style.left = pinned ? `${(window.innerWidth - width) / 2}px` : "0px";
  panel.style.borderRadius = `${48 * (1 - amount)}px`;
}

export function paintLaptop(
  panel: HTMLElement,
  progress: number,
  staticView = false,
) {
  panel.dataset.laptopProgress = progress.toFixed(3);
  expandPanel(panel, progress);
  const anchor = panel.querySelector<HTMLElement>("[data-laptop-anchor]");
  const stage = panel.querySelector<HTMLElement>("[data-laptop-stage]");
  const screen = panel.querySelector<HTMLElement>("[data-laptop-screen]");
  const copy = panel.querySelector<HTMLElement>("[data-laptop-text]");
  if (!anchor || !stage || !screen || !copy) {
    return;
  }
  const { lid, zoom, content } = laptopProgress(progress);
  paintLaptopLid(stage, lid);
  paintLaptopCamera(panel, anchor, stage, lid, zoom, staticView);
  copy.style.opacity = String(1 - Math.min(1, zoom * 2.2));
  copy.style.transform = `translateY(${-30 * zoom}px)`;
  stage.dataset.laptopLid = lid.toFixed(3);
  screen.dataset.contentProgress = content.toFixed(3);
  screen.style.setProperty("--laptop-content-progress", String(content));
  paintLaptopScene(screen, content, staticView);
}
