import { LID_OPEN_DEGREES } from "@/lib/landing-laptop";
import {
  containScreen,
  laptopBody,
  screenSize,
} from "@/lib/landing-laptop-screen";

const REST_ELEVATION = 32;
const FIT_WIDTH = laptopBody.width + 260;
const CLOSED_SHIFT = 0.1;
const OPEN_SHIFT = 0;

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

function zoomTarget(
  anchor: HTMLElement,
  panel: HTMLElement,
  staticView: boolean,
) {
  const aspect = screenSize.width / screenSize.height;
  const contained = containScreen(
    window.innerWidth,
    window.innerHeight,
    aspect,
  );
  const width = Math.min(
    contained.width,
    window.innerWidth <= 860 ? panel.clientWidth : Infinity,
  );
  const bounds = anchor.getBoundingClientRect();
  const area = staticView
    ? panel.getBoundingClientRect()
    : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  return {
    scale: width / screenSize.width,
    x: area.left + area.width / 2 - (bounds.left + bounds.width / 2),
    y: area.top + area.height / 2 - (bounds.top + bounds.height / 2),
  };
}

export function paintLaptopCamera(
  panel: HTMLElement,
  anchor: HTMLElement,
  stage: HTMLElement,
  lid: number,
  zoom: number,
  staticView: boolean,
) {
  const restScale = anchor.offsetWidth / FIT_WIDTH;
  const restY = anchor.offsetHeight * mix(CLOSED_SHIFT, OPEN_SHIFT, lid);
  const target = zoomTarget(anchor, panel, staticView);
  const scale = mix(restScale, target.scale, zoom);
  const elevation = mix(REST_ELEVATION, LID_OPEN_DEGREES, zoom);
  const x = target.x * zoom;
  const y = mix(restY, target.y, zoom);
  stage.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotateX(${-elevation}deg)`;
}
