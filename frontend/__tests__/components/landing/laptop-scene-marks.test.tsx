import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SceneObjects from "@/components/landing/sections/laptop/scene/scene-objects";
import { paintLaptopScene } from "@/components/landing/motion/laptop-scene";
import { laptopInsights } from "@/lib/landing-laptop-insights";

function renderScreen() {
  const { container } = render(
    <div>
      <div data-laptop-scene>
        <SceneObjects />
      </div>
    </div>,
  );
  return container.firstElementChild as HTMLElement;
}

function activeMarks(screen: HTMLElement) {
  return screen.querySelectorAll('[data-sc-object][data-sc-active="true"]');
}

describe("laptop scene pen marks", () => {
  it("renders one pen mark per insight after the intro and no image", () => {
    const screen = renderScreen();
    expect(screen.querySelectorAll("[data-sc-object]")).toHaveLength(10);
    expect(screen.querySelectorAll("img")).toHaveLength(0);
    expect(screen.querySelectorAll("[data-pen-mark]")).toHaveLength(10);
  });

  it("activates exactly the mark of the current step", () => {
    const screen = renderScreen();
    laptopInsights.slice(1).forEach((insight, index) => {
      paintLaptopScene(screen, (index + 1) / 10);
      const active = activeMarks(screen);
      expect(active).toHaveLength(1);
      expect(active[0].getAttribute("data-sc-object")).toBe(insight.key);
      expect(active[0].getAttribute("data-sc-mark")).toBe(insight.mark);
    });
  });

  it("shows no mark on the intro step", () => {
    const screen = renderScreen();
    paintLaptopScene(screen, 0.3);
    paintLaptopScene(screen, 0);
    expect(activeMarks(screen)).toHaveLength(0);
  });

  it("keeps the mark path undrawn by script so css can reveal it", () => {
    const screen = renderScreen();
    paintLaptopScene(screen, 0.1);
    const path = screen.querySelector<SVGPathElement>(
      '[data-sc-active="true"] path',
    );
    expect(path?.style.strokeDashoffset).toBe("");
  });
});

describe("laptop scene pen mark css", () => {
  it("reveals the active mark fully when motion is reduced", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync(
      "components/landing/sections/laptop/scene/scene.module.css",
      "utf8",
    );
    expect(css).toMatch(
      /\[data-sc-active="true"\] path\s*\{[^}]*dashoffset: 0/,
    );
    expect(css).toMatch(
      /prefers-reduced-motion: reduce\)\s*\{[^}]*\.object path[^}]*transition: none/,
    );
  });
});
