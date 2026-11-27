import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Dock from "@/components/dock/dock";
import { useAuthStore } from "@/stores/auth-store";
import { DockHarness } from "./dock-harness";

const usePathnameMock = vi.hoisted(() => vi.fn(() => "/"));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  usePathname: usePathnameMock,
}));

const user = { id: "u1", email: "a@b.co", name: "Rafli", picture: null };

beforeEach(() => {
  usePathnameMock.mockReturnValue("/");
  useAuthStore.setState({ user: null, isHydrated: true });
});
afterEach(() => useAuthStore.setState({ user: null, isHydrated: false }));

function renderDock() {
  return render(
    <DockHarness>
      <Dock />
    </DockHarness>,
  );
}

it("renders only the theme and language controls when logged out", () => {
  renderDock();
  expect(screen.getByRole("switch", { name: "Dark mode" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
});

it("keeps the account out of the dock when logged in", () => {
  useAuthStore.setState({ user, isHydrated: true });
  renderDock();
  expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
  expect(screen.getByRole("switch", { name: "Dark mode" })).toBeInTheDocument();
});

it("keeps the dock to theme and language inside the app", () => {
  usePathnameMock.mockReturnValue("/app/cvs");
  useAuthStore.setState({ user, isHydrated: true });
  renderDock();
  expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
  expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
});

it("theme switch reflects and toggles aria-checked", () => {
  renderDock();
  const toggle = screen.getByRole("switch", { name: "Dark mode" });
  expect(toggle).toHaveAttribute("aria-checked", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-checked", "true");
});

it("mobile button expands and collapses the controls", () => {
  renderDock();
  const open = screen.getByRole("button", { name: "Open quick settings" });
  expect(open).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(open);
  expect(
    screen.getByRole("button", { name: "Close quick settings" }),
  ).toHaveAttribute("aria-expanded", "true");
});
