import {
  BODY_WIDTH,
  DISPLAY_CENTER_Y,
  DISPLAY_WIDTH,
  FIELD_OF_VIEW,
  HINGE_Y,
  HINGE_Z,
} from "@/lib/landing-laptop-model";
import {
  inOut,
  lerp,
  lidAngleDegrees,
  seg,
  zoomAmount,
} from "@/lib/landing-laptop-timeline";

export type Vec3 = [number, number, number];
export interface Size {
  width: number;
  height: number;
}
export interface Rect extends Size {
  x: number;
  y: number;
}
export interface Fit {
  canvas: Size;
  rest: Rect;
  screenWidth: number;
}

const HALF_FOV_TAN = Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
const REST_WIDTH_SHARE = 0.78;
const REST_OPEN_HEIGHT = 30;
const CLOSED_DISTANCE_RATIO = 0.73;

export function distanceForSpan(
  canvasHeight: number,
  unitsAcross: number,
  pixelsAcross: number,
) {
  return (canvasHeight * unitsAcross) / (2 * HALF_FOV_TAN * pixelsAcross);
}

export function restDistance(canvas: Size, rest: Rect) {
  const byWidth = distanceForSpan(
    canvas.height,
    BODY_WIDTH,
    rest.width * REST_WIDTH_SHARE,
  );
  const byHeight = distanceForSpan(
    canvas.height,
    REST_OPEN_HEIGHT,
    rest.height * REST_WIDTH_SHARE,
  );
  return Math.max(byWidth, byHeight);
}

export function zoomDistance(canvas: Size, screenWidth: number) {
  return distanceForSpan(canvas.height, DISPLAY_WIDTH, screenWidth);
}

export function screenCenter(lidDegrees: number): Vec3 {
  const angle = (lidDegrees * Math.PI) / 180;
  return [
    0,
    HINGE_Y + DISPLAY_CENTER_Y * Math.cos(angle),
    HINGE_Z + DISPLAY_CENTER_Y * Math.sin(angle),
  ];
}

function screenNormal(lidDegrees: number): Vec3 {
  const angle = (lidDegrees * Math.PI) / 180;
  return [0, -Math.sin(angle), Math.cos(angle)];
}

function mixVec(from: Vec3, to: Vec3, amount: number): Vec3 {
  return [
    lerp(from[0], to[0], amount),
    lerp(from[1], to[1], amount),
    lerp(from[2], to[2], amount),
  ];
}

function elevationDegrees(progress: number, zoom: number) {
  const base = lerp(lerp(40, 28, inOut(seg(progress, 0, 0.5))), 15, zoom);
  const lift = 1.2 * Math.sin(Math.PI * seg(progress, 0.08, 0.2));
  return base + lift + 0.35 * Math.sin(progress * 9) * (1 - zoom);
}

function restTarget(progress: number): Vec3 {
  const open = inOut(seg(progress, 0.08, 0.5));
  return [0, lerp(1.5, 9, open), lerp(2, 0, open)];
}

export function cameraPose(progress: number, fit: Fit) {
  const zoom = zoomAmount(progress);
  const lid = lidAngleDegrees(progress);
  const open = inOut(seg(progress, 0.08, 0.5));
  const farRest = restDistance(fit.canvas, fit.rest);
  const distance = lerp(
    farRest * lerp(CLOSED_DISTANCE_RATIO, 1, open),
    farRest * 0.5,
    zoom,
  );
  const elevation = (elevationDegrees(progress, zoom) * Math.PI) / 180;
  const orbit: Vec3 = [
    0,
    Math.sin(elevation) * distance,
    Math.cos(elevation) * distance,
  ];
  const normal = screenNormal(lid);
  const end = zoomDistance(fit.canvas, fit.screenWidth);
  const offset = mixVec(
    orbit,
    [normal[0] * end, normal[1] * end, normal[2] * end],
    zoom,
  );
  const target = mixVec(restTarget(progress), screenCenter(lid), zoom);
  const position: Vec3 = [
    target[0] + offset[0],
    target[1] + offset[1],
    target[2] + offset[2],
  ];
  return { position, target, shift: viewShift(fit, zoom) };
}

export function viewShift(fit: Fit, zoom: number) {
  const restX = fit.rest.x + fit.rest.width / 2 - fit.canvas.width / 2;
  const restY = fit.rest.y + fit.rest.height / 2 - fit.canvas.height / 2;
  return { x: restX * (1 - zoom), y: restY * (1 - zoom) };
}
