import quadsData from "@/public/landing/laptop/screen-quads.json";
import { quadAspect, type Quad } from "./landing-laptop";

const finalQuad = quadsData.quads[quadsData.frameCount - 1] as Quad;

export const screenSize = {
  width: 1000,
  height: Math.round(1000 / quadAspect(finalQuad)),
};

export function screenViewportHeightRatio(progress: number) {
  const release = Math.max(0, Math.min(1, (progress - 0.88) / 0.12));
  return 0.94 - 0.09 * release;
}

export function clampObjectPosition(
  requested: number,
  paperLeft: number,
  paperWidth: number,
  objectWidth: number,
) {
  const half = objectWidth / 2;
  return Math.max(
    paperLeft - half,
    Math.min(paperLeft + paperWidth - half, requested),
  );
}
