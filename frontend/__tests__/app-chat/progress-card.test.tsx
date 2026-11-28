import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { withLocale } from "../i18n/with-locale";
import ProgressCard from "@/components/app-chat/progress-card";

const stepStates = () =>
  screen.getAllByRole("listitem").map((item) => item.dataset.state);

it("marks finished, current and pending steps", () => {
  render(
    withLocale(<ProgressCard active={2} message="Scoring" failed={false} />),
  );
  expect(stepStates()).toEqual(["done", "done", "current", "todo", "todo"]);
});

it("exposes finished steps out of five as the progressbar value", () => {
  render(
    withLocale(<ProgressCard active={3} message="Grammar" failed={false} />),
  );
  const bar = screen.getByRole("progressbar", { name: "Grammar" });
  expect(bar.getAttribute("aria-valuenow")).toBe("3");
  expect(bar.getAttribute("aria-valuemax")).toBe("5");
});

it("falls back to the reading sentence without a message", () => {
  render(withLocale(<ProgressCard active={0} failed={false} />));
  expect(screen.getByText("Reading your CV now.")).toBeTruthy();
});

it("shows the failure text and stops the current step", () => {
  render(withLocale(<ProgressCard active={1} message="x" failed />));
  expect(screen.getByRole("alert").textContent).toMatch(/could not finish/);
  expect(stepStates()).toEqual(["done", "todo", "todo", "todo", "todo"]);
  expect(screen.getByRole("progressbar").getAttribute("data-failed")).toBe(
    "true",
  );
});

it("shows every step done when analysis is complete", () => {
  render(withLocale(<ProgressCard active={5} message="Done" failed={false} />));
  expect(stepStates()).toEqual(Array(5).fill("done"));
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
    "5",
  );
});
