import type { WebGLRenderer } from "three";
import type { ThreeKit } from "@/lib/three-loader";

export const COMPACT_WIDTH = 860;

export function isCompact(width: number) {
  return width <= COMPACT_WIDTH;
}

export function createRenderer(
  kit: ThreeKit,
  canvas: HTMLCanvasElement,
): WebGLRenderer | null {
  const { THREE } = kit;
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    return renderer;
  } catch {
    return null;
  }
}

export function pixelRatioFor(width: number) {
  const ratio = window.devicePixelRatio || 1;
  return Math.min(isCompact(width) ? 1.5 : 2, ratio);
}
