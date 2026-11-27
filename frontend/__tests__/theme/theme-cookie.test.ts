import { expect, it } from "vitest";
import { parseTheme } from "@/components/theme/theme-cookie";

it("accepts only light and dark", () => {
  expect(parseTheme("dark")).toBe("dark");
  expect(parseTheme("light")).toBe("light");
  expect(parseTheme("blue")).toBeNull();
  expect(parseTheme(undefined)).toBeNull();
});
