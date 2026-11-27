export const screenSize = { width: 1000, height: 608 };

export const laptopBody = {
  width: 1080,
  lidHeight: 688,
  baseDepth: 700,
  bezel: 40,
};

export function containScreen(width: number, height: number, aspect: number) {
  const screenWidth = Math.min(width * 0.92, height * 0.92 * aspect);
  return { width: screenWidth, height: screenWidth / aspect };
}

export function clampObjectPosition(
  requested: number,
  screenWidth: number,
  objectWidth: number,
) {
  return Math.max(8, Math.min(screenWidth - objectWidth - 8, requested));
}
