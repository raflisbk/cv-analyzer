import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import AccountMenu from "@/components/landing/navbar/account-menu";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const user = { id: "u1", email: "a@b.co", name: "Rafli", picture: null };

function openMenu() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider initialTheme="light">
        <I18nProvider initialLocale="en">
          <AccountMenu user={user} app />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Account menu" });
  fireEvent.click(trigger);
  return trigger;
}

it("renders every menu item", () => {
  openMenu();
  const names = screen.getAllByRole("menuitem").map((item) => item.textContent);
  expect(names).toHaveLength(4);
  expect(names.join("|")).toMatch(/Sign out of all devices|all devices/i);
});

it("puts the theme and language buttons in the card header", () => {
  openMenu();
  expect(screen.getByRole("button", { name: "Toggle theme" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Switch language" })).toBeVisible();
});

it("lists the header buttons before the items in tab order", () => {
  openMenu();
  const order = [...document.querySelectorAll("button, a")].map(
    (node) => node.getAttribute("aria-label") ?? node.textContent,
  );
  const toggle = order.indexOf("Toggle theme");
  const first = order.findIndex((label) => /My CVs/.test(label ?? ""));
  expect(toggle).toBeGreaterThan(-1);
  expect(toggle).toBeLessThan(first);
});

it("moves focus between items with the arrow keys", () => {
  openMenu();
  const items = screen.getAllByRole("menuitem");
  items[0].focus();
  fireEvent.keyDown(items[0], { key: "ArrowDown" });
  expect(document.activeElement).toBe(items[1]);
  fireEvent.keyDown(items[1], { key: "ArrowUp" });
  expect(document.activeElement).toBe(items[0]);
});

it("closes on Escape and returns focus to the trigger", () => {
  const trigger = openMenu();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(document.activeElement).toBe(trigger);
});
