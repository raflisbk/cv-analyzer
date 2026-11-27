const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export const LID_CLOSED_DEGREES = -90;
export const LID_OPEN_DEGREES = 10;
export const STATIC_PROGRESS = 0.31;

export function laptopProgress(value: number) {
  const t = clamp(value);
  return {
    lid: ease(t / 0.3),
    zoom: ease((t - 0.32) / 0.2),
    content: clamp((t - 0.3) / 0.6),
  };
}

export function lidDegrees(lid: number) {
  return LID_CLOSED_DEGREES + (LID_OPEN_DEGREES - LID_CLOSED_DEGREES) * lid;
}
