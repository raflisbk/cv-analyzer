import { describe, expect, it } from "vitest";
import {
  applyHomography,
  interpolateQuad,
  laptopProgress,
  solveHomography,
  type Quad,
} from "@/lib/landing-laptop";

const square: Quad = [
  [0, 0],
  [100, 0],
  [100, 100],
  [0, 100],
];

describe("laptop homography", () => {
  it("maps all four source corners onto a perspective quad", () => {
    const target: Quad = [
      [12, 20],
      [180, 8],
      [155, 130],
      [22, 110],
    ];
    const matrix = solveHomography(square, target);
    expect(matrix).not.toBeNull();
    square.forEach((point, index) => {
      const mapped = applyHomography(matrix!, point);
      expect(mapped[0]).toBeCloseTo(target[index][0], 7);
      expect(mapped[1]).toBeCloseTo(target[index][1], 7);
    });
  });

  it("rejects degenerate source points", () => {
    expect(
      solveHomography(
        [
          [0, 0],
          [0, 0],
          [1, 1],
          [0, 1],
        ],
        square,
      ),
    ).toBeNull();
  });
});

describe("laptop progress", () => {
  it("interpolates every quad corner", () => {
    const end: Quad = [
      [10, 20],
      [110, 20],
      [110, 120],
      [10, 120],
    ];
    expect(interpolateQuad(square, end, 0.5)).toEqual([
      [5, 10],
      [105, 10],
      [105, 110],
      [5, 110],
    ]);
  });

  it("opens before the zoom and overlaps the screen content", () => {
    expect(laptopProgress(0)).toEqual({ frame: 0, zoom: 0, content: 0 });
    expect(laptopProgress(0.3).frame).toBe(39);
    expect(laptopProgress(0.4).zoom).toBeGreaterThan(0);
    expect(laptopProgress(0.4).content).toBeGreaterThan(0);
    expect(laptopProgress(0.52).zoom).toBe(1);
    expect(laptopProgress(1).content).toBe(1);
  });
});
