import { containScreen, screenSize } from "@/lib/landing-laptop-screen";
import { POSTER_SCREEN } from "@/lib/landing-laptop-poster";
import { lerp, seg } from "@/lib/landing-laptop-timeline";

interface Placement {
  x: number;
  y: number;
  scale: number;
  alpha: number;
}

const SCREEN_ASPECT = screenSize.width / screenSize.height;

function posterPlacement(
  panel: HTMLElement,
  zoom: number,
  fullScale: number,
  staticView: boolean,
): Placement {
  const anchor = panel.querySelector<HTMLElement>("[data-laptop-anchor]");
  if (!anchor) {
    return { x: 0, y: 0, scale: fullScale, alpha: 0 };
  }
  const area = panel.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  const width = rect.width * POSTER_SCREEN.width;
  const centerX =
    rect.left -
    area.left +
    rect.width * (POSTER_SCREEN.x + POSTER_SCREEN.width / 2);
  const centerY =
    rect.top -
    area.top +
    rect.height * (POSTER_SCREEN.y + POSTER_SCREEN.height / 2);
  return {
    x: lerp(centerX - area.width / 2, 0, zoom),
    y: lerp(centerY - area.height / 2, 0, zoom),
    scale: lerp(width / screenSize.width, fullScale, zoom),
    alpha: staticView ? 0 : seg(zoom, 0.05, 0.4),
  };
}

export function paintLaptopScreen(
  panel: HTMLElement,
  screen: HTMLElement,
  zoom: number,
  staticView: boolean,
) {
  const full = containScreen(
    panel.clientWidth,
    panel.clientHeight,
    SCREEN_ASPECT,
  ).width;
  const fullScale = full / screenSize.width;
  const poster = panel.querySelector("[data-laptop-poster]") !== null;
  const placement = poster
    ? posterPlacement(panel, zoom, fullScale, staticView)
    : { x: 0, y: 0, scale: fullScale, alpha: seg(zoom, 0.9, 1) };
  screen.style.setProperty("--laptop-screen-x", `${placement.x}px`);
  screen.style.setProperty("--laptop-screen-y", `${placement.y}px`);
  screen.style.setProperty("--laptop-screen-scale", String(placement.scale));
  screen.style.setProperty("--laptop-screen-alpha", String(placement.alpha));
  placePoster(panel);
  panel.style.setProperty(
    "--laptop-poster-alpha",
    String(1 - seg(zoom, 0.7, 1)),
  );
}

function placePoster(panel: HTMLElement) {
  const anchor = panel.querySelector<HTMLElement>("[data-laptop-anchor]");
  if (!anchor) {
    return;
  }
  const area = panel.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  panel.style.setProperty("--laptop-poster-left", `${rect.left - area.left}px`);
  panel.style.setProperty("--laptop-poster-top", `${rect.top - area.top}px`);
  panel.style.setProperty("--laptop-poster-width", `${rect.width}px`);
}
