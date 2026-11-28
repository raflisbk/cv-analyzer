import {
  inOut,
  lerp,
  lightAmount,
  clickState,
  seg,
  typedName,
  typingState,
  TYPED_TEXT,
  TYPING_START,
} from "@/lib/landing-laptop-timeline";

export const SCREEN_LAYOUT = {
  left: { x: 60, y: 60, width: 680, height: 816 },
  right: { x: 780, width: 700 },
};
export const CHIP_CENTER = {
  x: SCREEN_LAYOUT.right.x + 190,
  y: SCREEN_LAYOUT.left.y + SCREEN_LAYOUT.left.height - 80,
};
export const CV_LINE_COUNT = 11;

export interface ScreenState {
  name: string;
  caret: boolean;
  role: number;
  lines: number[];
  card: number;
  chip: number;
  ripple: number;
  cursor: number;
  cursorX: number;
  cursorY: number;
  boot: number;
  dim: number;
  sheen: number;
  poster: number;
  glare: number;
}

export function screenState(progress: number): ScreenState {
  const { typed } = typingState(progress);
  const typedShare = typed / TYPED_TEXT.length;
  const move = inOut(seg(progress, 0.74, 0.83));
  const { pressed, ripple } = clickState(progress);
  const { left } = SCREEN_LAYOUT;
  return {
    name: typedName(typed),
    caret:
      progress > TYPING_START - 0.02 &&
      progress < 0.8 &&
      Math.floor(progress * 90) % 2 === 0,
    role: seg(typedShare, 0.9, 1),
    lines: Array.from({ length: CV_LINE_COUNT }, (_, index) =>
      seg(typedShare * CV_LINE_COUNT * 0.85, index, index + 1),
    ),
    card: seg(progress, 0.62, 0.7),
    chip: pressed
      ? 0.92
      : 1 + 0.06 * Math.sin(Math.PI * seg(progress, 0.66, 0.72)),
    ripple,
    cursor: seg(progress, 0.7, 0.72) * (1 - seg(progress, 0.86, 0.92)),
    cursorX: lerp(left.x + 260, CHIP_CENTER.x + 30, move),
    cursorY: lerp(left.y + 640, CHIP_CENTER.y + 20, move),
    boot: 1 - seg(progress, 0.58, 0.64),
    dim: 1 - seg(progress, 0.46, 0.5),
    sheen: lerp(0.2, 0.9, inOut(seg(progress, 0.08, 0.5))),
    poster: seg(progress, 0.8, 0.9),
    glare: 1 - seg(progress, 0.82, 0.95),
  };
}

export function legendGlow(progress: number) {
  return 0.4 + 0.6 * lightAmount(progress);
}
