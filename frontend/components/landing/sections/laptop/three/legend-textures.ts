import type { CanvasTexture } from "three";
import type { ThreeKit } from "@/lib/three-loader";

const BODY_FONT = "Inter Variable, system-ui, sans-serif";
const LEGEND_SCALE = 90;
const ANISOTROPY = 8;

export type LegendKind = "s" | "sr" | "f" | "arrow" | "ud" | "key";

export function crispTexture({ THREE }: ThreeKit, canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = ANISOTROPY;
  return texture;
}

export function createGrilleTexture(kit: ThreeKit) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "rgba(40,6,0,.85)";
    for (let row = 0; row < 64; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        context.beginPath();
        context.arc(5 + column * 10.2 + (row % 2) * 5, 5 + row * 10, 2.1, 0, 7);
        context.fill();
      }
    }
  }
  return crispTexture(kit, canvas);
}

function paintLegend(
  context: CanvasRenderingContext2D,
  label: string,
  kind: LegendKind,
  width: number,
  height: number,
) {
  const font = (size: number, weight: number) => {
    context.font = `${weight} ${size}px ${BODY_FONT}`;
  };
  context.fillStyle = "#fff";
  context.textBaseline = "middle";
  if (kind === "s" || kind === "sr") {
    font(height * 0.26, 600);
    context.textAlign = kind === "s" ? "left" : "right";
    context.textBaseline = "bottom";
    context.fillText(label, width * (kind === "s" ? 0.1 : 0.9), height * 0.88);
  } else if (kind === "f" || kind === "arrow") {
    font(height * (kind === "f" ? 0.34 : 0.3), 600);
    context.textAlign = "center";
    context.fillText(label, width / 2, height * 0.5);
  } else if (kind === "ud") {
    font(height * 0.22, 600);
    context.textAlign = "center";
    context.fillText("▲", width / 2, height * 0.27);
    context.fillText("▼", width / 2, height * 0.75);
  } else if (label.trim()) {
    font(height * 0.42, 700);
    context.textAlign = "center";
    context.fillText(label, width / 2, height * 0.54);
  }
}

export function createLegendCache(kit: ThreeKit) {
  const cache = new Map<string, CanvasTexture>();
  return (label: string, kind: LegendKind, width: number, depth: number) => {
    const id = `${label}|${kind}|${width.toFixed(2)}`;
    const hit = cache.get(id);
    if (hit) {
      return hit;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * LEGEND_SCALE);
    canvas.height = Math.round(depth * LEGEND_SCALE);
    const context = canvas.getContext("2d");
    if (context) {
      paintLegend(context, label, kind, canvas.width, canvas.height);
    }
    const texture = crispTexture(kit, canvas);
    cache.set(id, texture);
    return texture;
  };
}
