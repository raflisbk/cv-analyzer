import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import LanguageToggle from "@/components/dock/language-toggle";
import { DockHarness } from "./dock-harness";

const calls: string[] = [];
const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  calls.length = 0;
  refresh.mockReset().mockImplementation(() => {
    calls.push(`refresh:${document.documentElement.lang}`);
  });
  document.documentElement.lang = "id";
  mockReducedMotion(false);
  render(
    <DockHarness locale="id">
      <LanguageToggle />
    </DockHarness>,
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("fades out, then updates state, cookie and html lang before refreshing", () => {
  fireEvent.click(screen.getByRole("button", { name: "EN" }));
  expect(document.documentElement.dataset.localeFade).toBe("out");
  expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  act(() => {
    vi.advanceTimersByTime(170);
  });
  expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(document.cookie).toContain("pathkr-locale=en");
  expect(document.documentElement.lang).toBe("en");
  expect(document.documentElement.dataset.localeFade).toBeUndefined();
  expect(refresh).not.toHaveBeenCalled();
  act(() => {
    vi.advanceTimersByTime(170);
  });
  expect(calls).toEqual(["refresh:en"]);
});

it("skips the fade under reduced motion", () => {
  mockReducedMotion(true);
  fireEvent.click(screen.getByRole("button", { name: "EN" }));
  expect(document.documentElement.dataset.localeFade).toBeUndefined();
  expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(refresh).not.toHaveBeenCalled();
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(refresh).toHaveBeenCalledOnce();
});

it("ignores choosing the active locale", () => {
  fireEvent.click(screen.getByRole("button", { name: "ID" }));
  act(() => {
    vi.advanceTimersByTime(500);
  });
  expect(refresh).not.toHaveBeenCalled();
});
