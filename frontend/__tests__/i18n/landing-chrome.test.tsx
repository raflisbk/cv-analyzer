import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import Navbar from "@/components/landing/navbar";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("login=required"),
}));
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (
    selector?: (state: {
      user: null;
      isHydrated: boolean;
      setUser: () => void;
    }) => unknown,
  ) =>
    selector
      ? selector({ user: null, isHydrated: true, setUser: vi.fn() })
      : { user: null, isHydrated: true, setUser: vi.fn() },
}));
vi.mock("@/hooks/use-nav-scroll", () => ({ useNavScroll: () => vi.fn() }));
vi.mock("@/components/auth/google-login-button", () => ({
  GoogleLoginButton: () => <button>Google</button>,
}));

describe.each([
  ["en", "Products", "Sign in to continue"],
  ["id", "Produk", "Masuk dulu, yuk"],
] as const)("landing chrome in %s", (locale, navText, dialogTitle) => {
  it("renders translated navigation", () => {
    render(
      <I18nProvider initialLocale={locale}>
        <Navbar />
      </I18nProvider>,
    );
    expect(screen.getByRole("link", { name: navText })).toBeInTheDocument();
  });
  it("renders the translated login dialog", async () => {
    render(
      <I18nProvider initialLocale={locale}>
        <LoginRequiredDialog />
      </I18nProvider>,
    );
    expect(
      await screen.findByRole("heading", { name: dialogTitle }),
    ).toBeInTheDocument();
  });
});
