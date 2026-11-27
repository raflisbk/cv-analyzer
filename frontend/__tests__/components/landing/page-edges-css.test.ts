import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(`components/landing/${path}`, "utf8");

describe("landing page edges", () => {
  it("lets the desktop footer start where the CTA ends", () => {
    const footer = read("sections/footer/footer.module.css");
    const desktop = footer.match(
      /@media \(min-width: 861px\)\s*\{([\s\S]*?)\n\}/,
    );
    expect(desktop?.[1]).toMatch(/margin-top:\s*0/);
  });

  it("keeps the pinned laptop panel inside the viewport width", () => {
    const laptop = read("sections/laptop/laptop.module.css");
    expect(laptop).toMatch(
      /:global\(\.pin-spacer\):has\(> \.section\)\s*\{[^}]*overflow-x:\s*clip !important/,
    );
    expect(laptop).toMatch(/margin-inline:\s*0 !important/);
  });

  it("makes the phone hero span the viewport without a pinned side gutter", () => {
    const hero = read("hero/hero.module.css");
    const phone = hero.match(
      /@media \(max-width: 520px\)\s*\{\s*\.hero\s*\{([^}]*)\}/,
    );
    expect(phone?.[1]).toMatch(/margin-inline:\s*0/);
  });

  it("hides the section dots while the footer crosses their rail", () => {
    const dots = read("section-dots.tsx");
    expect(dots).toContain('document.getElementById("footer")');
    expect(dots).toMatch(/footerVisible \? "invisible"/);
  });
});
