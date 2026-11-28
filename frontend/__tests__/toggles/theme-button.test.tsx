import { readFileSync } from "node:fs";
import { beforeEach, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ThemeButton from "@/components/toggles/theme-button";
import { ToggleHarness } from "./toggle-harness";

beforeEach(() => {
  document.documentElement.dataset.theme = "light";
});

function renderButton(locale: "en" | "id" = "en") {
  render(
    <ToggleHarness locale={locale}>
      <ThemeButton />
    </ToggleHarness>,
  );
  return screen.getByRole("button");
}

it("names the button in English and Indonesian", () => {
  expect(renderButton("en")).toHaveAttribute("aria-label", "Toggle theme");
});

it("uses the Indonesian label", () => {
  expect(renderButton("id")).toHaveAttribute("aria-label", "Ganti tema");
});

it("toggles aria-pressed and the dark state on click", () => {
  const button = renderButton();
  expect(button).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(button).toHaveAttribute("data-dark", "true");
});

it("persists the chosen theme in the cookie and on the root element", () => {
  fireEvent.click(renderButton());
  expect(document.cookie).toContain("pathkr-theme=dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
});

it("is a native button operable from the keyboard", () => {
  const button = renderButton();
  button.focus();
  expect(document.activeElement).toBe(button);
  expect(button.tagName).toBe("BUTTON");
});

it("drops rotation and twinkle under reduced motion", () => {
  const css = readFileSync(
    "components/toggles/theme-button.module.css",
    "utf8",
  );
  const reduced = css.slice(css.indexOf("prefers-reduced-motion"));
  expect(reduced).toMatch(/\.sparkle\s*\{\s*animation:\s*none/);
  expect(reduced).toMatch(/\.layer[\s\S]*transition:\s*none/);
});
