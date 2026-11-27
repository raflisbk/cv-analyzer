import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dock from "@/components/dock/dock";
import AppHeader from "@/components/app-shell/app-header";
import EmptyState from "@/components/app-shell/empty-state";
import HistoryDrawer from "@/components/app-shell/history-drawer";
import CvsList from "@/components/app-cvs/cvs-list";
import ReportsList from "@/components/app-reports/reports-list";
import { listCvs } from "@/lib/app-api/cvs";
import { listReports } from "@/lib/app-api/reports";
import { listConversations } from "@/lib/app-api/conversations";
import { reportFixtures } from "@/lib/app-api/fixtures/reports";
import { localeFromRequest } from "@/lib/i18n/locale-from-request";
import { withLocale } from "./with-locale";
import { stubReducedMotion } from "./reduced-motion";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/app/cvs",
}));
vi.mock("@/lib/app-api/cvs", () => ({ listCvs: vi.fn() }));
vi.mock("@/lib/app-api/reports", () => ({ listReports: vi.fn() }));
vi.mock("@/lib/app-api/conversations", () => ({ listConversations: vi.fn() }));

const rawKey = /\bapp\.[a-z]+\.[A-Za-z]+/;

beforeEach(stubReducedMotion);

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
  vi.resetAllMocks();
});

function showApp(locale: "id" | "en" = "id") {
  vi.mocked(listCvs).mockResolvedValue([
    {
      jobId: "one",
      fileName: "one.pdf",
      targetRole: null,
      score: 77,
      status: "complete",
      updatedAt: new Date().toISOString(),
      pages: 1,
      wordCount: 100,
    },
  ]);
  vi.mocked(listReports).mockResolvedValue(reportFixtures);
  vi.mocked(listConversations).mockResolvedValue([]);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      {withLocale(
        <>
          <Dock />
          <AppHeader openDrawer={vi.fn()} drawerOpen newChat={vi.fn()} />
          <HistoryDrawer open close={vi.fn()} newChat={vi.fn()} />
          <CvsList />
          <ReportsList />
        </>,
        locale,
      )}
    </QueryClientProvider>,
  );
}

it("defaults to Indonesian without a cookie or Accept-Language", () => {
  expect(localeFromRequest(undefined, undefined)).toBe("id");
});

it("renders Indonesian first and switches the whole app shell to English", async () => {
  showApp();
  expect(await screen.findByText("one.pdf")).toBeInTheDocument();
  expect(
    within(screen.getByRole("navigation", { name: "Utama" })).getByRole(
      "link",
      { name: "CV gua" },
    ),
  ).toBeInTheDocument();
  expect(
    within(screen.getByRole("navigation", { name: "Utama" })).getByRole(
      "link",
      { name: "Laporan" },
    ),
  ).toBeInTheDocument();
  expect(
    screen.getAllByText("Belum ada target posisi · diedit hari ini").length,
  ).toBe(1);
  expect(screen.getByText("+ Chat baru")).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);

  fireEvent.click(screen.getAllByRole("button", { name: "EN" })[0]);

  expect(
    within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", {
      name: "My CVs",
    }),
  ).toBeInTheDocument();
  expect(
    within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", {
      name: "Reports",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText("No target role · edited today")).toBeInTheDocument();
  expect(screen.getByText("+ New chat")).toBeInTheDocument();
  expect(
    screen.getByText("Recurring fixes across your CVs"),
  ).toBeInTheDocument();
  expect(document.cookie).toContain("pathkr-locale=en");
  expect(document.body.textContent).not.toMatch(rawKey);
});

it("switches the reports list back to Indonesian", async () => {
  showApp("en");
  expect(await screen.findByText("Best score")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("button", { name: "ID" })[0]);
  expect(screen.getByText("Skor terbaik")).toBeInTheDocument();
  expect(screen.getByText("Rata-rata per dimensi")).toBeInTheDocument();
  expect(document.cookie).toContain("pathkr-locale=id");
  expect(document.body.textContent).not.toMatch(rawKey);
});

function showEmpty(type: "cvs" | "reports", locale: "id" | "en") {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      {withLocale(<EmptyState type={type} />, locale)}
    </QueryClientProvider>,
  );
}

it("translates empty states in both locales", () => {
  showEmpty("cvs", "id");
  expect(screen.getByText("Belum ada CV")).toBeInTheDocument();
  cleanup();
  showEmpty("reports", "en");
  expect(screen.getByText("No reports yet")).toBeInTheDocument();
});
