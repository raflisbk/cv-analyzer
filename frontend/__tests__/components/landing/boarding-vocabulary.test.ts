import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const landingRoot = resolve(__dirname, "../../../components/landing");
const read = (file: string) => readFileSync(resolve(landingRoot, file), "utf8");

describe("landing boarding-pass vocabulary", () => {
  test("uses ticket structure for feature cards", () => {
    const source = read("features-section.tsx");

    expect(source).toContain("BOARDING PASS");
    expect(source).toContain("border-dashed");
    expect(source).toContain("px-5");
    expect(source).not.toContain("rounded-xl transition-transform");
  });

  test("uses ticket structure without generic glow cards for products", () => {
    const source = read("products-section.tsx");

    expect(source).toContain("BOARDING PASS");
    expect(source).toContain("border-dashed");
    expect(source).toContain("px-5");
    expect(source).toContain('accent: "#FF8C42"');
    expect(source).toContain('accent: "#CAFF43"');
    expect(source).toContain('accent: "#8B5CF6"');
    expect(source).toContain("borderTopColor: product.accent");
    expect(source).not.toContain("iconColor.includes");
    expect(source).not.toContain("glowColor");
    expect(source).not.toContain("radial-gradient(ellipse at top");
  });

  test("frames the RAG explainer as a route map", () => {
    const source = read("rag-explainer-section.tsx");

    expect(source).toContain("ROUTE MAP");
    expect(source).toContain("border-dashed");
    expect(source).not.toContain("Powered by RAG");
    expect(source).not.toContain("✦");
  });

  test("does not retain the removed hero stamp zone in mascot documentation", () => {
    const source = read("hero-mascot.tsx");

    expect(source).not.toContain("hero-stamp");
  });
});
