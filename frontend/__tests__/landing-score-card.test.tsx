import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ScoreCard from "@/components/landing/sections/report/score-card";
import { I18nProvider } from "@/components/i18n/i18n-provider";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});

afterEach(() => vi.unstubAllGlobals());

it("accepts and undoes the rewrite with an announced score in reduced motion", async () => {
  render(
    <I18nProvider initialLocale="en">
      <ScoreCard />
    </I18nProvider>,
  );
  const accept = await screen.findByRole("button", { name: "Accept rewrite" });
  await waitFor(() => expect(accept.hasAttribute("disabled")).toBe(false));
  expect(
    screen.getByText("82", { selector: "[data-score-number]" }),
  ).toBeTruthy();
  fireEvent.click(accept);
  expect(
    screen.getByRole("button", { name: "Accepted" }).hasAttribute("disabled"),
  ).toBe(true);
  expect(screen.getByText("86", { selector: "[aria-live]" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(
    screen
      .getByRole("button", { name: "Accept rewrite" })
      .hasAttribute("disabled"),
  ).toBe(false);
  expect(screen.getByText("82", { selector: "[aria-live]" })).toBeTruthy();
});
