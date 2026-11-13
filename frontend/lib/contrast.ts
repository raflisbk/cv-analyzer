function channels(hex: string): number[] {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

function luminance(rgb: number[]): number {
  const linear = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function contrastRatio(
  foreground: string,
  background: string,
  opacity = 1,
): number {
  const back = channels(background);
  const front = channels(foreground).map(
    (channel, index) => channel * opacity + back[index] * (1 - opacity),
  );
  const light = luminance(front);
  const dark = luminance(back);
  return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
}
