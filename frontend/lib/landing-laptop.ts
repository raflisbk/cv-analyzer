export type Point = [number, number];
export type Quad = [Point, Point, Point, Point];
export type Homography = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export function laptopProgress(value: number) {
  const t = clamp(value);
  return {
    frame: Math.round(ease(t / 0.3) * 35),
    zoom: ease((t - 0.32) / 0.2),
    content: clamp((t - 0.3) / 0.68),
  };
}

export function interpolateQuad(from: Quad, to: Quad, progress: number): Quad {
  const t = clamp(progress);
  return from.map((point, index) => [
    point[0] + (to[index][0] - point[0]) * t,
    point[1] + (to[index][1] - point[1]) * t,
  ]) as Quad;
}

export function scaleQuad(quad: Quad, x: number, y: number): Quad {
  return quad.map((point) => [point[0] * x, point[1] * y]) as Quad;
}

export function quadAspect(quad: Quad) {
  const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const width = (distance(quad[0], quad[1]) + distance(quad[3], quad[2])) / 2;
  const height = (distance(quad[0], quad[3]) + distance(quad[1], quad[2])) / 2;
  return width / height;
}

export function solveHomography(src: Quad, dst: Quad): Homography | null {
  const rows: number[][] = [];
  src.forEach(([x, y], index) => {
    const [u, v] = dst[index];
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  });
  for (let column = 0; column < 8; column++) {
    let pivot = column;
    for (let row = column + 1; row < 8; row++) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) {
        pivot = row;
      }
    }
    if (Math.abs(rows[pivot][column]) < 1e-10) {
      return null;
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    for (let cell = column; cell < 9; cell++) {
      rows[column][cell] /= divisor;
    }
    for (let row = 0; row < 8; row++) {
      if (row === column) {
        continue;
      }
      const factor = rows[row][column];
      for (let cell = column; cell < 9; cell++) {
        rows[row][cell] -= factor * rows[column][cell];
      }
    }
  }
  return rows.map((row) => row[8]) as Homography;
}

export function applyHomography(h: Homography, [x, y]: Point): Point {
  const divisor = h[6] * x + h[7] * y + 1;
  return [
    (h[0] * x + h[1] * y + h[2]) / divisor,
    (h[3] * x + h[4] * y + h[5]) / divisor,
  ];
}

export function homographyCss(src: Quad, dst: Quad) {
  const h = solveHomography(src, dst);
  if (!h) {
    return "none";
  }
  return `matrix3d(${[h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1].join(",")})`;
}
