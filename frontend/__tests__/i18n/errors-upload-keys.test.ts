import { describe, expect, it } from "vitest";
import errorsEn from "@/lib/i18n/dictionaries/errors-en";
import errorsId from "@/lib/i18n/dictionaries/errors-id";
import uploadEn from "@/lib/i18n/dictionaries/upload-en";
import uploadId from "@/lib/i18n/dictionaries/upload-id";

type Tree = { [key: string]: string | Tree };

function leaves(node: Tree, prefix = ""): [string, string][] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : leaves(value, `${prefix}${key}.`),
  );
}

describe.each([
  ["errors", errorsEn, errorsId],
  ["upload", uploadEn, uploadId],
])("%s dictionary", (_name, en, id) => {
  it("has the same keys in both languages", () => {
    const enKeys = leaves(en as Tree).map(([key]) => key);
    const idKeys = leaves(id as Tree).map(([key]) => key);
    expect(idKeys.sort()).toEqual(enKeys.sort());
  });

  it("keeps the same placeholders in both languages", () => {
    const tokens = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    const idByKey = Object.fromEntries(leaves(id as Tree));
    leaves(en as Tree).forEach(([key, text]) =>
      expect(tokens(idByKey[key])).toEqual(tokens(text)),
    );
  });

  it("has no empty values", () => {
    [...leaves(en as Tree), ...leaves(id as Tree)].forEach(([, text]) =>
      expect(text.trim()).not.toBe(""),
    );
  });
});
