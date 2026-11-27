import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Dock from "@/components/dock/dock";
import { useAuthStore } from "@/stores/auth-store";
import { DockHarness } from "./dock-harness";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

const user = { id: "u1", email: "a@b.co", name: "Rafli", picture: null };

beforeEach(() => {
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

it("renders theme, language and login controls when logged out", () => {
  renderDock();
  expect(screen.getByRole("switch", { name: "Dark mode" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
    "href",
    "/app",
  );
});

it("swaps login for the account button when logged in", () => {
  useAuthStore.setState({ user, isHydrated: true });
  renderDock();
  expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Account menu" }),
  ).toBeInTheDocument();
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
