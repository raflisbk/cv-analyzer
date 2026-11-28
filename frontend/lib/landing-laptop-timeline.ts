export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const seg = (value: number, from: number, to: number) =>
  clamp((value - from) / (to - from));
export const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
export const inOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const settle = (t: number) => {
  const back = 0.8;
  return 1 + (back + 1) * Math.pow(t - 1, 3) + back * Math.pow(t - 1, 2);
};

export const SCROLL_ZOOM_START = 0.32;
export const SCROLL_ZOOM_END = 0.52;
export const SCENE_ZOOM_START = 0.76;
export const LID_CLOSED_DEGREES = 90;
export const LID_OPEN_DEGREES = -14;
export const TYPED_TEXT = "SAMUEL SAMDONO";
export const TYPING_START = 0.6;
export const TYPING_END = 0.76;
export const KEY_HOLD = 0.009;

export function sceneProgress(scroll: number) {
  const t = clamp(scroll);
  if (t <= SCROLL_ZOOM_START) {
    return (t / SCROLL_ZOOM_START) * SCENE_ZOOM_START;
  }
  const zoom = seg(t, SCROLL_ZOOM_START, SCROLL_ZOOM_END);
  return lerp(SCENE_ZOOM_START, 1, zoom);
}

export function zoomAmount(progress: number) {
  return inOut(seg(progress, SCENE_ZOOM_START, 1));
}

export function lidAngleDegrees(progress: number) {
  const crack = inOut(seg(progress, 0.08, 0.16));
  if (progress < 0.16) {
    return lerp(LID_CLOSED_DEGREES, 76, crack);
  }
  return lerp(76, LID_OPEN_DEGREES, settle(seg(progress, 0.16, 0.5)));
}

export function lightAmount(progress: number) {
  return seg(progress, 0.46, 0.56);
}

export function keyPressTime(index: number) {
  return (
    TYPING_START + (index * (TYPING_END - TYPING_START)) / TYPED_TEXT.length
  );
}

export function typingState(progress: number) {
  let typed = 0;
  let held = -1;
  for (let index = 0; index < TYPED_TEXT.length; index += 1) {
    const at = keyPressTime(index);
    if (progress >= at + KEY_HOLD * 0.5) {
      typed = index + 1;
    }
    if (progress >= at && progress < at + KEY_HOLD) {
      held = index;
    }
  }
  return { typed, held };
}

export function typedName(typed: number) {
  return TYPED_TEXT.slice(0, typed)
    .toLowerCase()
    .replace(
      /(^| )(.)/g,
      (_, gap: string, letter: string) => gap + letter.toUpperCase(),
    );
}

export function clickState(progress: number) {
  const pressed = progress > 0.835 && progress < 0.86;
  return { pressed, ripple: pressed ? seg(progress, 0.835, 0.86) : 0 };
}
