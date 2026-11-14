import { render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import PenStrike from "@/components/landing/pen/pen-strike";
import PenCircle from "@/components/landing/pen/pen-circle";
import PenUnderline from "@/components/landing/pen/pen-underline";
import PenArrow from "@/components/landing/pen/pen-arrow";
import PenHighlight from "@/components/landing/pen/pen-highlight";
import MarginNote from "@/components/landing/pen/margin-note";

describe("landing pen marks", () => {
  it.each([PenStrike, PenCircle, PenUnderline, PenArrow, PenHighlight])(
    "renders a decorative path with distinct variants",
    (Mark) => {
      const { container, rerender } = render(<Mark variant={0} play={false} />);
      const first = container.querySelector("path")?.getAttribute("d");
      expect(container.querySelectorAll("path")).toHaveLength(1);
      expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
        "true",
      );
      rerender(<Mark variant={1} play={false} />);
      expect(container.querySelector("path")?.getAttribute("d")).not.toBe(
        first,
      );
    },
  );

  it("keeps margin text accessible and linked to its target", () => {
    render(
      <>
        <span id="score" aria-describedby="score-note">
          86
        </span>
        <MarginNote targetId="score" play={false}>
          No mystery scores
        </MarginNote>
      </>,
    );
    expect(screen.getByText("No mystery scores").id).toBe("score-note");
    expect(screen.getByText("86").getAttribute("aria-describedby")).toBe(
      "score-note",
    );
  });

  it("can render a margin note without an arrow", () => {
    const { container } = render(
      <MarginNote targetId="item" arrow={false} play={false}>
        Check this line
      </MarginNote>,
    );
    expect(screen.getByText("Check this line")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("does not use a fixed width larger than a phone", () => {
    const folder = join(process.cwd(), "components/landing/pen");
    for (const file of readdirSync(folder).filter((name) =>
      name.endsWith(".css"),
    )) {
      const css = readFileSync(join(folder, file), "utf8");
      expect(css).not.toMatch(
        /(?:^|[;{])\s*(?:width|min-width):\s*(?:39\d|[4-9]\d\d|\d{4,})px/m,
      );
    }
  });
});
