export const stats = [
  {
    value: 4,
    suffix: "",
    label: "scores that explain themselves",
    image: "cubes",
  },
  {
    value: 60,
    suffix: "s",
    label: "from upload to first report",
    image: "stopwatch",
  },
  {
    value: 100,
    suffix: "%",
    label: "your edits, your CV, your call",
    image: "padlock",
  },
] as const;
export function countUpValue(progress: number, target: number, suffix: string) {
  return `${Math.round(Math.min(1, Math.max(0, progress)) * target)}${suffix}`;
}
