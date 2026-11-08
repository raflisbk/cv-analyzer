export type ExpandMode = "expand" | "sheet";

export type PanelRect = {
  top: number;
  bottom: number;
  viewport: number;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function easeInOut(value: number) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

export function expandProgress({ top, viewport }: PanelRect, mode: ExpandMode) {
  return easeInOut(1 - top / (viewport * (mode === "sheet" ? 0.9 : 0.85)));
}

export function panelWidth(progress: number, viewportWidth: number) {
  const wide = Math.min(1600, viewportWidth - 32);
  return wide + (viewportWidth - wide) * clamp(progress);
}

export function panelRadius(progress: number) {
  return 48 * (1 - clamp(progress));
}

export function panelPaddingExtra(width: number) {
  return Math.max(0, (width - 1600) / 2);
}
