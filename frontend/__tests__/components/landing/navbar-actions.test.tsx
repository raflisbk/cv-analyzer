import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Navbar from "@/components/landing/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { stubNavBrowser } from "./nav-browser-stubs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const user = { id: "u1", email: "a@b.co", name: "Rafli", picture: null };

function renderNavbar(locale: "en" | "id" = "en") {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider initialTheme="light">
        <I18nProvider initialLocale={locale}>
          <Navbar />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  stubNavBrowser();
  useAuthStore.setState({ user: null, isHydrated: true });
});
afterEach(() => {
  vi.unstubAllGlobals();
  useAuthStore.setState({ user: null, isHydrated: false });
});

describe("landing navbar actions", () => {
  it("shows only login as the call to action when logged out", () => {
    renderNavbar();
    const links = screen.getAllByRole("link", { name: "Log in" });
    expect(links[0]).toHaveAttribute("href", "/app");
    expect(screen.queryByRole("link", { name: "Analyze my CV" })).toBeNull();
  });

  it("uses the casual Indonesian labels", () => {
    renderNavbar("id");
    expect(
      screen.getAllByRole("link", { name: "Masuk" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Analisis CV kamu" })).toBeNull();
  });

  it("shows the account menu without a call to action when logged in", () => {
    useAuthStore.setState({ user, isHydrated: true });
    renderNavbar();
    expect(
      screen.getAllByRole("button", { name: "Account menu" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Analyze my CV" })).toBeNull();
  });

  it("keeps the nav landmark attribute used by the hero entrance", () => {
    renderNavbar();
    expect(document.querySelector("[data-landing-nav]")).not.toBeNull();
  });
});

describe("landing navbar css contract", () => {
  const css = readFileSync(
    "components/landing/navbar/navbar.module.css",
    "utf8",
  );

  it("fixes the bar to the viewport above the pinned sections", () => {
    expect(css).toMatch(/\.header\s*\{[^}]*position:\s*fixed/);
    expect(css).toMatch(/\.header\s*\{[^}]*top:\s*0/);
    expect(css).toMatch(/\.header\s*\{[^}]*z-index:\s*40/);
  });

  it("keeps an in-flow spacer so the hero is not covered at rest", () => {
    expect(css).toMatch(/\.spacer\s*\{[^}]*background/);
    expect(css).toMatch(/height:\s*var\(--bar-rest\)/);
  });

  it("drives the glide from the scroll variable instead of a top offset", () => {
    expect(css).toMatch(/translate:\s*0 var\(--bar-y/);
    expect(css).not.toMatch(/data-condensed/);
  });
});
