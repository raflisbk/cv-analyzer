import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import id from "@/lib/i18n/dictionaries/id";
import { format, getDictionary, plural } from "@/lib/i18n/translate";

function flatten(source: object, prefix = ""): Record<string, string> {
  return Object.entries(source).reduce<Record<string, string>>(
    (result, [key, value]) => {
      const name = prefix ? `${prefix}.${key}` : key;
      Object.assign(
        result,
        typeof value === "string" ? { [name]: value } : flatten(value, name),
      );
      return result;
    },
    {},
  );
}

describe("dictionaries", () => {
  it("has matching keys and placeholders", () => {
    const english = flatten(en);
    const indonesian = flatten(id);
    expect(Object.keys(indonesian).sort()).toEqual(Object.keys(english).sort());
    for (const key of Object.keys(english)) {
      expect(indonesian[key].match(/\{\w+\}/g)?.sort() ?? []).toEqual(
        english[key].match(/\{\w+\}/g)?.sort() ?? [],
      );
    }
  });
  it("selects the requested dictionary", () => {
    expect(getDictionary("en")).toBe(en);
    expect(getDictionary("id")).toBe(id);
  });
});

describe("format and plural", () => {
  it("substitutes values and leaves missing variables visible", () => {
    expect(format("{count} of {total}", { count: 2 })).toBe("2 of {total}");
  });
  it("uses English plurality and Indonesian invariant forms", () => {
    expect(plural("en", 1, "CV", "CVs")).toBe("CV");
    expect(plural("en", 2, "CV", "CVs")).toBe("CVs");
    expect(plural("id", 2, "CV", "CV-CV")).toBe("CV");
  });
});
