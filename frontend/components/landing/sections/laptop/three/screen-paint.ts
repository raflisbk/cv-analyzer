import {
  CHIP_CENTER,
  SCREEN_LAYOUT,
  type ScreenState,
} from "@/lib/landing-laptop-screen-state";
import { SCREEN_PIXELS } from "./screen-size";

const DISPLAY_FONT =
  "'Bricolage Grotesque Variable', 'Inter Variable', sans-serif";
const BODY_FONT = "'Inter Variable', system-ui, sans-serif";
const CV_ROWS: [number, number, number][] = [
  [0, 0.9, 0],
  [0, 0.78, 0],
  [1, 0.34, 1],
  [0, 0.9, 0],
  [0, 0.82, 0],
  [0, 0.86, 0],
  [1, 0.3, 1],
  [0, 0.9, 0],
  [0, 0.74, 0],
  [0, 0.88, 0],
  [0, 0.62, 0],
];

export type Context = CanvasRenderingContext2D;

function roundedFill(
  context: Context,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  context.beginPath();
  context.roundRect(x, y, w, h, r);
  context.fill();
}

export function paintPaper(context: Context, state: ScreenState) {
  const { x, y, width, height } = SCREEN_LAYOUT.left;
  context.fillStyle = "#fff";
  roundedFill(context, x, y, width, height, 22);
  context.fillStyle = "#1a0b07";
  context.font = `800 58px ${DISPLAY_FONT}`;
  context.textBaseline = "alphabetic";
  context.fillText(state.name, x + 50, y + 105);
  if (state.caret) {
    const caretX = x + 54 + context.measureText(state.name).width;
    context.fillStyle = "#f42902";
    context.fillRect(caretX, y + 62, 4, 52);
  }
  context.globalAlpha = state.role;
  context.fillStyle = "#f42902";
  context.font = `600 30px ${BODY_FONT}`;
  context.fillText("Product Designer", x + 50, y + 155);
  context.globalAlpha = 1;
  CV_ROWS.forEach(([bold, share, heading], index) => {
    const top = y + 215 + index * 56 + (heading ? 14 : 0);
    context.fillStyle = bold ? "#1a0b07" : "#e6d7d2";
    roundedFill(
      context,
      x + 50,
      top,
      (width - 100) * share * state.lines[index],
      12,
      6,
    );
  });
}

export function paintCard(context: Context, state: ScreenState) {
  const { x, width } = SCREEN_LAYOUT.right;
  const { y, height } = SCREEN_LAYOUT.left;
  context.save();
  context.globalAlpha = state.card;
  context.translate(0, (1 - state.card) * 24);
  context.fillStyle = "#b81f00";
  roundedFill(context, x, y, width, height, 34);
  context.fillStyle = "#ffd9cf";
  context.font = `800 26px ${BODY_FONT}`;
  context.letterSpacing = "6px";
  context.fillText("EDUCATION", x + 44, y + 76);
  context.letterSpacing = "0px";
  context.fillStyle = "#fff";
  context.font = `800 92px ${DISPLAY_FONT}`;
  ["Degree and", "year are", "present"].forEach((line, index) =>
    context.fillText(line, x + 44, y + 330 + index * 98),
  );
  context.translate(CHIP_CENTER.x, CHIP_CENTER.y);
  context.scale(state.chip, state.chip);
  context.fillStyle = "#f2ff00";
  roundedFill(context, -150, -34, 300, 68, 34);
  context.fillStyle = "#1a0b07";
  context.font = `800 27px ${BODY_FONT}`;
  context.textAlign = "center";
  context.fillText("Education details found", 0, 9);
  context.restore();
}

export function paintPointer(context: Context, state: ScreenState) {
  if (state.ripple > 0) {
    context.strokeStyle = `rgba(255,255,255,${1 - state.ripple})`;
    context.lineWidth = 6;
    context.beginPath();
    context.arc(CHIP_CENTER.x, CHIP_CENTER.y, 20 + state.ripple * 90, 0, 7);
    context.stroke();
  }
  if (state.cursor <= 0) {
    return;
  }
  context.save();
  context.globalAlpha = state.cursor;
  context.translate(state.cursorX, state.cursorY);
  context.scale(2.6, 2.6);
  context.fillStyle = "#fff";
  context.strokeStyle = "#1a0b07";
  context.lineWidth = 1.2;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, 13);
  context.lineTo(3.2, 10.2);
  context.lineTo(5.6, 15.6);
  context.lineTo(8, 14.5);
  context.lineTo(5.6, 9.2);
  context.lineTo(9.8, 9);
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
}

export function paintBoot(context: Context, boot: number) {
  const { width, height } = SCREEN_PIXELS;
  const cx = width / 2;
  const cy = height / 2;
  context.globalAlpha = boot;
  context.fillStyle = "#f2ff00";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#f42902";
  context.lineWidth = 34;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(cx - 90, cy + 80);
  context.bezierCurveTo(cx - 60, cy + 70, cx - 50, cy + 20, cx - 15, cy + 8);
  context.bezierCurveTo(cx + 25, cy - 5, cx + 10, cy - 45, cx + 50, cy - 70);
  context.stroke();
  context.fillStyle = "#f42902";
  context.beginPath();
  context.arc(cx + 62, cy - 84, 30, 0, 7);
  context.fill();
  context.globalAlpha = 1;
}

export function paintGlare(context: Context, state: ScreenState) {
  const { width, height } = SCREEN_PIXELS;
  context.fillStyle = `rgba(14,7,7,${state.dim})`;
  context.fillRect(0, 0, width, height);
  const gradient = context.createLinearGradient(
    width * state.sheen - 500,
    0,
    width * state.sheen + 300,
    height,
  );
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.5, `rgba(255,255,255,${0.1 * state.glare})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}
