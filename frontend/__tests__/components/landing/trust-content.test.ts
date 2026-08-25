import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const frontendRoot = resolve(__dirname, "../../..");
const read = (path: string) =>
  readFileSync(resolve(frontendRoot, path), "utf8");

describe("landing trust content", () => {
  test("does not ship fabricated testimonials", () => {
    expect(
      existsSync(
        resolve(frontendRoot, "components/landing/testimonials-section.tsx"),
      ),
    ).toBe(false);
    expect(read("app/page.tsx")).not.toContain("TestimonialsSection");
    expect(read("components/landing/section-dots.tsx")).not.toContain(
      "testimonials",
    );
  });

  test("labels the before-and-after demo as illustrative", () => {
    const source = read("components/landing/see-it-in-action-section.tsx");
    expect(source).toContain("See what an analysis looks like");
    expect(source).not.toContain("Real results from real CVs");
  });

  test("has no dead hash links in the footer", () => {
    expect(read("components/landing/footer.tsx")).not.toMatch(/href=["']#["']/);
  });
});
