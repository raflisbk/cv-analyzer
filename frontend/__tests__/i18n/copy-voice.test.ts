import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import id from "@/lib/i18n/dictionaries/id";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>(
    (flat, [key, value]) =>
      typeof value === "string"
        ? { ...flat, [`${prefix}${key}`]: value }
        : { ...flat, ...flatten(value, `${prefix}${key}.`) },
    {},
  );
}

const idValues = flatten(id as Tree);
const enValues = flatten(en as Tree);
const informalPronoun = /\b(lu|gua|gue|elo|lo)\b/i;

describe("Indonesian copy voice", () => {
  it("has the same keys as English", () => {
    expect(Object.keys(idValues).sort()).toEqual(Object.keys(enValues).sort());
  });

  it("never uses the lu/gua pronouns", () => {
    const offenders = Object.entries(idValues).filter(([, value]) =>
      informalPronoun.test(value),
    );
    expect(offenders).toEqual([]);
  });

  it("never uses formal Anda", () => {
    const offenders = Object.entries(idValues).filter(([, value]) =>
      /\bAnda\b/i.test(value),
    );
    expect(offenders).toEqual([]);
  });

  it("keeps every placeholder token from English", () => {
    const tokens = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    const mismatched = Object.keys(enValues).filter(
      (key) =>
        JSON.stringify(tokens(idValues[key])) !==
        JSON.stringify(tokens(enValues[key])),
    );
    expect(mismatched).toEqual([]);
  });
});
