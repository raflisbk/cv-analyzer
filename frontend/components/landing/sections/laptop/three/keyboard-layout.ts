import type { LegendKind } from "./legend-textures";

export type KeySpec = [string, number, (LegendKind | "touch")?, number?];
export interface RowSpec {
  depth: number;
  cap: number;
  keys: KeySpec[];
}

export const UNIT = 1.9;
export const KEYBOARD_WIDTH = 14.5 * UNIT;

const letters = (text: string): KeySpec[] =>
  text.split("").map((char) => [char, 1]);

export const KEY_ROWS: RowSpec[] = [
  {
    depth: 1.2,
    cap: 0.95,
    keys: [
      ["esc", 1.5, "s"],
      ...Array.from(
        { length: 12 },
        (_, index): KeySpec => [`F${index + 1}`, 1, "f"],
      ),
      ["", 1, "touch"],
    ],
  },
  {
    depth: UNIT,
    cap: 1.65,
    keys: [...letters("`1234567890-="), ["delete", 1.5, "sr"]],
  },
  {
    depth: UNIT,
    cap: 1.65,
    keys: [["tab", 1.5, "s"], ...letters("QWERTYUIOP[]\\")],
  },
  {
    depth: UNIT,
    cap: 1.65,
    keys: [
      ["caps", 1.75, "s"],
      ...letters("ASDFGHJKL;'"),
      ["return", 1.75, "sr"],
    ],
  },
  {
    depth: UNIT,
    cap: 1.65,
    keys: [
      ["shift", 2.25, "s"],
      ...letters("ZXCVBNM,./"),
      ["shift", 2.25, "sr"],
    ],
  },
  {
    depth: UNIT,
    cap: 1.65,
    keys: [
      ["fn", 1, "s"],
      ["ctrl", 1, "s"],
      ["opt", 1, "s"],
      ["cmd", 1.25, "s"],
      [" ", 5],
      ["cmd", 1.25, "sr"],
      ["opt", 1, "sr"],
      ["◀", 1, "arrow", 0.82],
      ["▲▼", 1, "ud"],
      ["▶", 1, "arrow", 0.82],
    ],
  },
];

export const ROWS_DEPTH = KEY_ROWS.reduce((sum, row) => sum + row.depth, 0);
