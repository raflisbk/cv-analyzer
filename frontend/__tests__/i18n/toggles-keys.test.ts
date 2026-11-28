import { expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import id from "@/lib/i18n/dictionaries/id";

it("keeps toggle keys in parity between locales", () => {
  expect(Object.keys(id.toggles).sort()).toEqual(
    Object.keys(en.toggles).sort(),
  );
  Object.values(id.toggles).forEach((value) => expect(value).not.toBe(""));
});
