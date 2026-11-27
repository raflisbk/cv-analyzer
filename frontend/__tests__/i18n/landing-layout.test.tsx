import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import RootLayout from "@/app/layout";
import { generateMetadata } from "@/app/page";
import en from "@/lib/i18n/dictionaries/en";
import id from "@/lib/i18n/dictionaries/id";

const request = vi.hoisted(() => ({
  locale: "id",
  theme: undefined as string | undefined,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "pathkr-theme"
        ? request.theme && { value: request.theme }
        : { value: request.locale },
  }),
  headers: async () => ({ get: () => null }),
}));
vi.mock("@/components/auth/auth-provider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/components/providers/query-provider", () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));

describe.each([
  ["en", en],
  ["id", id],
] as const)("landing request in %s", (locale, dictionary) => {
  it("sets the document language and metadata from the locale cookie", async () => {
    request.locale = locale;
    const html = renderToStaticMarkup(
      await RootLayout({ children: <p>CV</p> }),
    );
    expect(html).toContain(`<html lang="${locale}" data-theme="light"`);
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(dictionary.landing.metadata.title);
    expect(metadata.description).toBe(dictionary.landing.metadata.description);
  });
});

describe("theme cookie on the server", () => {
  it("renders data-theme dark when the cookie says dark", async () => {
    request.theme = "dark";
    const html = renderToStaticMarkup(
      await RootLayout({ children: <p>CV</p> }),
    );
    request.theme = undefined;
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain("color-scheme:dark");
  });

  it("falls back to light for an unknown cookie value", async () => {
    request.theme = "purple";
    const html = renderToStaticMarkup(
      await RootLayout({ children: <p>CV</p> }),
    );
    request.theme = undefined;
    expect(html).toContain('data-theme="light"');
  });
});
