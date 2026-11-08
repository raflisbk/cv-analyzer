import quadsData from "@/public/landing/laptop/screen-quads.json";
import { quadAspect, type Quad } from "./landing-laptop";

const finalQuad = quadsData.quads[quadsData.frameCount - 1] as Quad;

export const screenSize = {
  width: 1000,
  height: Math.round(1000 / quadAspect(finalQuad)),
};

export function containScreen(width: number, height: number, aspect: number) {
  const screenWidth = Math.min(width * 0.92, height * 0.92 * aspect);
  return { width: screenWidth, height: screenWidth / aspect };
}

export function clampObjectPosition(
  requested: number,
  screenWidth: number,
  objectWidth: number,
) {
  return Math.max(8, Math.min(screenWidth - objectWidth - 8, requested));
}
