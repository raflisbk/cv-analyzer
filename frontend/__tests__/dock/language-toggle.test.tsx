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

const switchButton = () => screen.getByRole("button");

it("shows the current code and names the other language", () => {
  expect(switchButton()).toHaveTextContent("ID");
  expect(switchButton()).toHaveAttribute("aria-label", "Ganti ke English");
  expect(switchButton()).toHaveAttribute("title", "Ganti ke English");
});

it("fades out, then updates state, cookie and html lang before refreshing", () => {
  fireEvent.click(switchButton());
  expect(document.documentElement.dataset.localeFade).toBe("out");
  expect(switchButton()).toHaveTextContent("ID");
  act(() => {
    vi.advanceTimersByTime(170);
  });
  expect(switchButton()).toHaveTextContent("EN");
  expect(switchButton()).toHaveAttribute(
    "aria-label",
    "Switch to Bahasa Indonesia",
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
  fireEvent.click(switchButton());
  expect(document.documentElement.dataset.localeFade).toBeUndefined();
  expect(switchButton()).toHaveTextContent("EN");
  expect(refresh).not.toHaveBeenCalled();
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(refresh).toHaveBeenCalledOnce();
});

it("switches back to the first language on a second click", () => {
  fireEvent.click(switchButton());
  act(() => {
    vi.advanceTimersByTime(340);
  });
  fireEvent.click(switchButton());
  act(() => {
    vi.advanceTimersByTime(340);
  });
  expect(switchButton()).toHaveTextContent("ID");
  expect(document.cookie).toContain("pathkr-locale=id");
});

it("is operable from the keyboard as a native button", () => {
  expect(switchButton().tagName).toBe("BUTTON");
  switchButton().focus();
  expect(document.activeElement).toBe(switchButton());
});
