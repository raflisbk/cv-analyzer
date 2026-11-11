import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import HelpButton from "@/components/pathy/help-button";
import { HELP, HELP_KEYS } from "@/lib/pathy/help-content";
import { PATHY_POSES, pathyPoseSrc } from "@/lib/pathy/pose";
import { TOURS } from "@/lib/pathy/tours";

describe("Pathy help", () => {
  it("has content and a valid pose for every key", () => {
    for (const key of HELP_KEYS) {
      expect(HELP[key].title).toBeTruthy();
      expect(HELP[key].text).toBeTruthy();
      expect(PATHY_POSES).toContain(HELP[key].pose);
    }
    for (const pose of PATHY_POSES) {
      expect(pathyPoseSrc(pose)).toBe(`/pathy/${pose}.webp`);
    }
  });
  it("opens a help card and closes on Escape", () => {
    render(<HelpButton helpKey="home" />);
    fireEvent.click(screen.getByRole("button", { name: "Help: Ask anything" }));
    expect(
      screen.getByRole("dialog", { name: "Ask anything" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("dialog", { name: "Ask anything" }),
    ).not.toBeInTheDocument();
  });
  it("rejects a help key without content", () => {
    expect(() => render(<HelpButton helpKey="missing" />)).toThrow(
      "Unknown Pathy help key",
    );
  });
  it("has full, export, and score tours with valid targets", () => {
    expect(TOURS.full).toHaveLength(8);
    for (const name of ["full", "export", "score"]) {
      for (const step of TOURS[name]) {
        expect(step.target).toBeTruthy();
        expect(PATHY_POSES).toContain(step.pose);
      }
    }
  });
});
