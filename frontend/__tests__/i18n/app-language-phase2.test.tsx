import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LanguageSwitch from "@/components/landing/navbar/language-switch";
import FullReportView from "@/components/app-report/full-report-view";
import ExportDialog from "@/components/app-export/export-dialog";
import PathyMenu from "@/components/pathy/pathy-menu";
import PathyTour from "@/components/pathy/pathy-tour";
import { WorkspaceHeader } from "@/components/app-workspace/workspace-header";
import { getReportDetail } from "@/lib/app-api/report-detail";
import { reportDetailFixture } from "@/lib/app-api/fixtures/report-detail";
import { exportPreview, exportTemplates } from "@/lib/app-api/fixtures/export";
import { localeFromRequest } from "@/lib/i18n/locale-from-request";
import { withLocale } from "./with-locale";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/app",
}));
vi.mock("next/image", () => ({ default: () => <span /> }));
vi.mock("@/lib/app-api/report-detail", () => ({ getReportDetail: vi.fn() }));
vi.mock("@/lib/app-api/export", () => ({
  getExportTemplates: () => Promise.resolve(exportTemplates),
  getExportPreview: () => Promise.resolve(exportPreview),
  exportCv: vi.fn(),
}));

const rawKey =
  /\b(appReport|appExport|appWorkspace|appWorkspacePanel|pathy)\.[a-z]+\.[A-Za-z]+/;

beforeEach(() => {
  vi.mocked(getReportDetail).mockResolvedValue(reportDetailFixture);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: true }),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function withClient(ui: React.ReactNode) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {ui}
    </QueryClientProvider>
  );
}

it("defaults to Indonesian without a cookie", () => {
  expect(localeFromRequest(undefined, undefined)).toBe("id");
});

it("switches the full report between Indonesian and English", async () => {
  render(
    withLocale(
      withClient(
        <>
          <LanguageSwitch />
          <FullReportView jobId="cv-1" />
        </>,
      ),
      "id",
    ),
  );
  expect(
    await screen.findByRole("heading", { name: "Laporan lengkap" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Kembali ke editor")).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);
  fireEvent.click(screen.getByRole("button", { name: "EN" }));
  expect(
    screen.getByRole("heading", { name: "Full report" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Back to editor")).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);
});

it("switches the export dialog between Indonesian and English", async () => {
  render(
    withLocale(
      withClient(
        <>
          <LanguageSwitch />
          <ExportDialog jobId="job" open onClose={vi.fn()} />
        </>,
      ),
      "id",
    ),
  );
  expect(await screen.findByText("Pilih template ATS")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Unduh PDF" })).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);
  fireEvent.click(screen.getByRole("button", { name: "EN" }));
  expect(screen.getByText("Choose an ATS template")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Download PDF" }),
  ).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);
});

it("switches the Pathy menu and tour between Indonesian and English", () => {
  render(
    withLocale(
      <>
        <LanguageSwitch />
        <PathyMenu close={vi.fn()} />
        <PathyTour name="full" close={vi.fn()} />
      </>,
      "id",
    ),
  );
  expect(
    screen.getByRole("menuitem", { name: "Ikut tur 60 detik" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Hai, aku Pathy" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Langkah 1 dari 8")).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);
  fireEvent.click(screen.getByRole("button", { name: "EN" }));
  expect(
    screen.getByRole("menuitem", { name: "Take the 60-second tour" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Hi, I'm Pathy" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Step 1 of 8")).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);
});

it("switches the workspace header between Indonesian and English", () => {
  render(
    withLocale(
      <>
        <LanguageSwitch />
        <WorkspaceHeader
          name="cv.pdf"
          role="Engineer"
          saveState="saved"
          view="editor"
          setView={vi.fn()}
          onExport={vi.fn()}
        />
      </>,
      "id",
    ),
  );
  expect(
    screen.getByRole("button", { name: "Laporan lengkap" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Engineer · Tersimpan")).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(rawKey);
  fireEvent.click(screen.getByRole("button", { name: "EN" }));
  expect(
    screen.getByRole("button", { name: "Full report" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Engineer · Saved")).toBeInTheDocument();
});
