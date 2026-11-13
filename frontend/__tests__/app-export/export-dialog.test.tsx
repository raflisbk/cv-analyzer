import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ExportDialog from "@/components/app-export/export-dialog";
import { PathyContext } from "@/components/pathy/pathy-context";
import { exportPreview, exportTemplates } from "@/lib/app-api/fixtures/export";

const exportCv = vi.fn();
const saveExportPdf = vi.fn();
const react = vi.fn();
vi.mock("@/lib/app-api/export", () => ({
  getExportTemplates: () => Promise.resolve(exportTemplates),
  getExportPreview: () => Promise.resolve(exportPreview),
  exportCv: (...args: unknown[]) => exportCv(...args),
}));
vi.mock("@/lib/app-export/download", () => ({
  exportFilename: (name: string, template: string) => `${name}-${template}.pdf`,
  saveExportPdf: (...args: unknown[]) => saveExportPdf(...args),
}));
vi.mock("@/components/pathy/help-button", () => ({
  default: () => <button>Help</button>,
}));
vi.mock("next/image", () => ({ default: () => <span /> }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function show(onClose = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const opener = document.createElement("button");
  opener.textContent = "Open export";
  document.body.appendChild(opener);
  opener.focus();
  render(
    <QueryClientProvider client={client}>
      <PathyContext.Provider
        value={{ react, burst: vi.fn(), startTour: vi.fn() }}
      >
        <ExportDialog jobId="job" open onClose={onClose} />
      </PathyContext.Provider>
    </QueryClientProvider>,
  );
  return { onClose, opener };
}

describe("ExportDialog", () => {
  it("selects Your original by default", async () => {
    show();
    expect(
      await screen.findByRole("radio", { name: /Your original/ }),
    ).toHaveAttribute("aria-checked", "true");
  });
  it("updates the paper preview when a template is selected", async () => {
    show();
    fireEvent.click(await screen.findByRole("radio", { name: /Modern/ }));
    expect(screen.getByLabelText("Modern PDF preview")).toHaveAttribute(
      "data-template",
      "modern",
    );
  });
  it("traps Tab, closes with Escape, and restores opener focus", async () => {
    const { onClose, opener } = show();
    const close = await screen.findByRole("button", { name: "Close export" });
    close.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).not.toBe(opener);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    cleanup();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
  it("downloads the selected template and celebrates", async () => {
    exportCv.mockResolvedValue({
      blob: new Blob(["pdf"], { type: "application/pdf" }),
      applied: 2,
      skipped: 1,
    });
    show();
    fireEvent.click(
      await screen.findByRole("button", { name: "Download PDF" }),
    );
    await waitFor(() => expect(saveExportPdf).toHaveBeenCalledOnce());
    expect(exportCv).toHaveBeenCalledWith("job", {
      templateId: "original",
      fixIds: [],
      answers: {},
    });
    expect(react).toHaveBeenCalledWith(
      "cheer",
      "Your PDF is ready! 2 fixes applied, 1 skipped.",
      expect.any(HTMLElement),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "2 fixes applied, 1 skipped",
    );
  });
  it("shows the error and allows a retry", async () => {
    exportCv
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({
        blob: new Blob(["pdf"]),
        applied: 0,
        skipped: 0,
      });
    show();
    fireEvent.click(
      await screen.findByRole("button", { name: "Download PDF" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Network unavailable",
    );
    expect(react).toHaveBeenCalledWith(
      "sad",
      "Network unavailable",
      expect.any(HTMLElement),
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry download" }));
    await waitFor(() => expect(saveExportPdf).toHaveBeenCalledOnce());
  });
});
