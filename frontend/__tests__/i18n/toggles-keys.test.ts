import { expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import id from "@/lib/i18n/dictionaries/id";

it("keeps dock keys in parity between locales", () => {
  expect(Object.keys(id.dock).sort()).toEqual(Object.keys(en.dock).sort());
  Object.values(id.dock).forEach((value) => expect(value).not.toBe(""));
});
