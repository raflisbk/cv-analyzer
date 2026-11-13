import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AppNav from "@/components/app-shell/app-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/app/cvs" }));

it("keeps the active navigation label inside an equal-width indicator cell", () => {
  render(<AppNav />);
  expect(screen.getByRole("link", { name: "My CVs" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const css = readFileSync(
    "components/app-shell/app-shell.module.css",
    "utf8",
  );
  expect(css).toMatch(/\.nav a\s*\{[^}]*width:\s*96px/);
  expect(css).toMatch(/\.indicator\s*\{[^}]*width:\s*96px/);
});
