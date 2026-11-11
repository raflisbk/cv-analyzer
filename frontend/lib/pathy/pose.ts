export const PATHY_POSES = [
  "hello",
  "guide",
  "wizard",
  "helpdesk",
  "think",
  "cheer",
  "idea",
  "detective",
  "running",
  "surprised",
  "proud",
  "sad",
  "love",
  "trophy",
  "map",
] as const;

export type PathyPose = (typeof PATHY_POSES)[number];

export function pathyPoseSrc(pose: PathyPose): string {
  return `/pathy/${pose}.webp`;
}
