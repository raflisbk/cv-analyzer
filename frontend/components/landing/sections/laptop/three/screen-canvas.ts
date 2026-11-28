import type { ThreeKit } from "@/lib/three-loader";
import type { ScreenState } from "@/lib/landing-laptop-screen-state";
import { crispTexture } from "./legend-textures";
import {
  paintBoot,
  paintCard,
  paintGlare,
  paintPaper,
  paintPointer,
} from "./screen-paint";
import { FIRST_FRAME_URL, SCREEN_PIXELS } from "./screen-size";

export function createScreenSurface(kit: ThreeKit, onFirstFrame: () => void) {
  const canvas = document.createElement("canvas");
  canvas.width = SCREEN_PIXELS.width;
  canvas.height = SCREEN_PIXELS.height;
  const context = canvas.getContext("2d");
  const texture = crispTexture(kit, canvas);
  const poster = new Image();
  poster.onload = onFirstFrame;
  poster.src = FIRST_FRAME_URL;
  const draw = (state: ScreenState) => {
    if (!context) {
      return;
    }
    const { width, height } = SCREEN_PIXELS;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffd9cf";
    context.fillRect(0, 0, width, height);
    paintPaper(context, state);
    paintCard(context, state);
    if (poster.complete && poster.naturalWidth > 0 && state.poster > 0) {
      context.globalAlpha = state.poster;
      context.drawImage(poster, 0, 0, width, height);
      context.globalAlpha = 1;
    }
    paintPointer(context, state);
    if (state.boot > 0) {
      paintBoot(context, state.boot);
    }
    paintGlare(context, state);
    texture.needsUpdate = true;
  };
  return {
    texture,
    draw,
    dispose: () => {
      poster.onload = null;
    },
  };
}
