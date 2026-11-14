import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import AccountMenu from "@/components/landing/navbar/account-menu";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}));
const user = {
  id: "u1",
  email: "rafli@example.com",
  name: "Rafli",
  picture: null,
};

describe("AccountMenu", () => {
  function renderMenu(app = false, locale: "en" | "id" = "en") {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <I18nProvider initialLocale={locale}>
          <AccountMenu user={user} app={app} />
        </I18nProvider>
      </QueryClientProvider>,
    );
    return client;
  }

  it("renders Indonesian account actions", () => {
    renderMenu(false, "id");
    fireEvent.click(screen.getByRole("button", { name: "Menu akun" }));
    expect(
      screen.getByRole("menuitem", { name: "Sesi aktif" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Keluar" }),
    ).toBeInTheDocument();
  });

  it("links to My CVs inside the app", () => {
    renderMenu(true);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menuitem", { name: /My CVs/ })).toHaveAttribute(
      "href",
      "/app/cvs",
    );
  });
  it("keeps the landing tile and routes it to the app", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menuitem", { name: /Workspace/ })).toHaveAttribute(
      "href",
      "/app",
    );
  });
  it("opens the active sessions dialog and signs out another device", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (url: string) =>
          new Response(
            url.endsWith("/sessions")
              ? JSON.stringify([
                  {
                    id: "other",
                    userAgent: "Firefox Windows",
                    lastUsedAt: "2026-11-14T00:00:00Z",
                    current: false,
                  },
                ])
              : "{}",
            { status: 200 },
          ),
      ),
    );
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Active sessions/ }));
    expect(await screen.findByText("Firefox on Windows")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() =>
      expect(screen.queryByText("Firefox on Windows")).not.toBeInTheDocument(),
    );
  });

  it("confirms logout from all devices and clears cached data", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const client = renderMenu();
    client.setQueryData(["private"], "data");
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    fireEvent.click(
      screen.getByRole("menuitem", { name: /Log out of all devices/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm log out of all devices" }),
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/auth/logout-all",
        expect.anything(),
      ),
    );
    expect(client.getQueryData(["private"])).toBeUndefined();
    expect(replace).toHaveBeenCalledWith("/");
  });
});
