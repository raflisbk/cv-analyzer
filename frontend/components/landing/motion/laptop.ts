import quadsData from "@/public/landing/laptop/screen-quads.json";
import { paintLaptopScene } from "./laptop-scene";
import {
  homographyCss,
  interpolateQuad,
  laptopProgress,
  quadAspect,
  scaleQuad,
  type Quad,
} from "@/lib/landing-laptop";

const quads = quadsData.quads as (Quad | null)[];
const finalQuad = quads[35] as Quad;
const screenWidth = 1000;
const screenHeight = Math.round(screenWidth / quadAspect(finalQuad));
const screenQuad: Quad = [
  [0, 0],
  [screenWidth, 0],
  [screenWidth, screenHeight],
  [0, screenHeight],
];

function expandPanel(panel: HTMLElement, progress: number) {
  if (window.innerWidth <= 860) {
    return;
  }
  const wide = Math.min(1600, window.innerWidth - 32);
  const amount = Math.min(1, progress / 0.12);
  const width = wide + (window.innerWidth - wide) * amount;
  panel.style.width = `${width}px`;
  panel.style.maxWidth = `${width}px`;
  panel.style.left = "0px";
  panel.style.borderRadius = `${48 * (1 - amount)}px`;
}

function screenTarget(
  anchor: HTMLElement,
  panel: HTMLElement,
  aspect: number,
  staticView: boolean,
): Quad {
  const bounds = anchor.getBoundingClientRect();
  const width = Math.min(
    window.innerWidth * 0.96,
    window.innerHeight * 0.94 * aspect,
    window.innerWidth <= 860 ? panel.clientWidth : Infinity,
  );
  const height = width / aspect;
  const center = staticView
    ? panel.getBoundingClientRect()
    : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  const left = center.left + (center.width - width) / 2 - bounds.left;
  const top = center.top + (center.height - height) / 2 - bounds.top;
  return [
    [left, top],
    [left + width, top],
    [left + width, top + height],
    [left, top + height],
  ];
}

function paintScreen(
  panel: HTMLElement,
  anchor: HTMLElement,
  stage: HTMLElement,
  screen: HTMLElement,
  frame: number,
  zoom: number,
  staticView: boolean,
) {
  const scaleX = anchor.offsetWidth / quadsData.width;
  const scaleY = anchor.offsetHeight / quadsData.height;
  const current = quads[frame];
  const final = scaleQuad(finalQuad, scaleX, scaleY);
  const target = screenTarget(
    anchor,
    panel,
    screenWidth / screenHeight,
    staticView,
  );
  screen.style.height = `${screenHeight}px`;
  screen.style.opacity = current ? "1" : "0";
  if (staticView) {
    stage.style.transform = "none";
    screen.style.transform = homographyCss(screenQuad, target);
    return;
  }
  stage.style.transform = zoom
    ? homographyCss(final, interpolateQuad(final, target, zoom))
    : "none";
  screen.style.transform = current
    ? homographyCss(screenQuad, scaleQuad(current, scaleX, scaleY))
    : "none";
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
  const canvas = panel.querySelector<HTMLCanvasElement>("[data-laptop-canvas]");
  const copy = panel.querySelector<HTMLElement>("[data-laptop-text]");
  if (!anchor || !stage || !screen || !canvas || !copy) {
    return;
  }
  const { frame, zoom, content } = laptopProgress(progress);
  canvas.dispatchEvent(new CustomEvent("laptop-frame", { detail: frame }));
  paintScreen(panel, anchor, stage, screen, frame, zoom, staticView);
  canvas.style.opacity = String(1 - Math.max(0, (zoom - 0.9) / 0.1));
  copy.style.opacity = String(1 - Math.min(1, zoom * 2.2));
  copy.style.transform = `translateY(${-30 * zoom}px)`;
  screen.dataset.contentProgress = content.toFixed(3);
  screen.style.setProperty("--laptop-content-progress", String(content));
  paintLaptopScene(screen, content, staticView);
}
