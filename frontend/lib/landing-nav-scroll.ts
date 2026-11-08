export type Point = { x: number; y: number };
export type FlightPath = {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
};

export function scrollDuration(distance: number) {
  return Math.min(2600, Math.max(900, 500 + distance * 0.16));
}

export function easeInOutCubic(t: number) {
  const progress = Math.min(1, Math.max(0, t));
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

export function flightPath(
  start: Point,
  end: Point,
  viewport: { width: number; height: number },
): FlightPath {
  return {
    start,
    control1: {
      x: start.x + (end.x - start.x) * 0.25,
      y: start.y + viewport.height * 0.55,
    },
    control2: {
      x: start.x + (end.x - start.x) * 0.7,
      y: viewport.height * 0.9,
    },
    end,
  };
}

export function pointAt(path: FlightPath, t: number): Point {
  const progress = Math.min(1, Math.max(0, t));
  const remainder = 1 - progress;
  const weights = [
    remainder ** 3,
    3 * remainder ** 2 * progress,
    3 * remainder * progress ** 2,
    progress ** 3,
  ];
  const points = [path.start, path.control1, path.control2, path.end];
  return {
    x: points.reduce((sum, point, index) => sum + point.x * weights[index], 0),
    y: points.reduce((sum, point, index) => sum + point.y * weights[index], 0),
  };
}
