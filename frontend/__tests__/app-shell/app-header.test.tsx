import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import AppHeader from "@/components/app-shell/app-header";
import { useAuthStore } from "@/stores/auth-store";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const user = { id: "u1", email: "a@b.co", name: "Rafli", picture: null };

function renderHeader(openDrawer = vi.fn()) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider initialTheme="light">
        <I18nProvider initialLocale="en">
          <AppHeader
            openDrawer={openDrawer}
            drawerOpen={false}
            newChat={vi.fn()}
          />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return openDrawer;
}

beforeEach(() => useAuthStore.setState({ user, isHydrated: true }));
afterEach(() => useAuthStore.setState({ user: null, isHydrated: false }));

it("shows the account menu in the header", () => {
  renderHeader();
  const buttons = screen.getAllByRole("button", { name: "Account menu" });
  expect(buttons.length).toBeGreaterThan(0);
});

it("the compact avatar opens the history drawer that holds the account footer", () => {
  const openDrawer = renderHeader();
  const compact = screen
    .getAllByRole("button", { name: "Account menu" })
    .find((button) => button.getAttribute("aria-haspopup") !== "menu")!;
  fireEvent.click(compact);
  expect(openDrawer).toHaveBeenCalledTimes(1);
});

it("renders no account entry when logged out", () => {
  useAuthStore.setState({ user: null, isHydrated: true });
  renderHeader();
  expect(screen.queryByRole("button", { name: "Account menu" })).toBeNull();
});
