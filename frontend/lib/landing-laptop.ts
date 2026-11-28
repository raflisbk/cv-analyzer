import {
  clamp,
  inOut,
  sceneProgress,
  seg,
  SCROLL_ZOOM_END,
  SCROLL_ZOOM_START,
} from "@/lib/landing-laptop-timeline";

export const STATIC_PROGRESS = 0.31;

export function laptopProgress(value: number) {
  const t = clamp(value);
  return {
    scene: sceneProgress(t),
    zoom: inOut(seg(t, SCROLL_ZOOM_START, SCROLL_ZOOM_END)),
    content: clamp((t - 0.3) / 0.6),
  };
}
