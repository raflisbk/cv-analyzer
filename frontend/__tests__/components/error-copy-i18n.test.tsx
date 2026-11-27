import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { withLocale } from "../i18n/with-locale";
import RouteError from "@/app/error";
import AppError from "@/app/app/error";
import NotFound from "@/app/not-found";
import GlobalError from "@/app/global-error";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import type { Locale } from "@/lib/i18n/locales";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const show = (ui: React.ReactNode, locale: Locale) =>
  render(withLocale(ui, locale));

describe.each([
  ["id", "Ada yang belum beres", "Halaman ini belum bisa dimuat.", "Coba lagi"],
  [
    "en",
    "Something went wrong",
    "An unexpected error occurred while loading this page.",
    "Try again",
  ],
] as const)("error boundaries in %s", (locale, title, body, retry) => {
  it("route error shows translated copy and hides raw error text", () => {
    show(
      <RouteError error={new Error("raw English")} reset={vi.fn()} />,
      locale,
    );
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(body)).toBeTruthy();
    expect(screen.getByRole("button", { name: retry })).toBeTruthy();
    expect(screen.queryByText("raw English")).toBeNull();
  });

  it("app error shows translated copy", () => {
    show(<AppError error={new Error("x")} reset={vi.fn()} />, locale);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByRole("button", { name: retry })).toBeTruthy();
  });
});

describe("not found", () => {
  it("is Indonesian", () => {
    show(<NotFound />, "id");
    expect(screen.getByText("Halaman yang kamu cari tidak ada.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ke beranda" })).toBeTruthy();
  });

  it("is English", () => {
    show(<NotFound />, "en");
    expect(
      screen.getByText("The page you are looking for does not exist."),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go home" })).toBeTruthy();
  });
});

describe("global error", () => {
  it("reads the locale cookie", () => {
    document.cookie = "pathkr-locale=en";
    render(<GlobalError error={new Error("x")} reset={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    document.cookie = "pathkr-locale=id";
    render(<GlobalError error={new Error("x")} reset={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeTruthy();
  });
});

describe("upload components", () => {
  it("upload zone speaks Indonesian and English", () => {
    const id = show(<UploadZone onFileSelected={vi.fn()} />, "id");
    expect(screen.getByText("Taruh CV kamu di sini")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pilih file" })).toBeTruthy();
    id.unmount();
    show(<UploadZone onFileSelected={vi.fn()} />, "en");
    expect(screen.getByText("Drop your CV here")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Choose File" })).toBeTruthy();
  });

  it("document preview translates labels and the custom role field", () => {
    const file = new File(["x"], "cv.pdf", { type: "application/pdf" });
    const props = { file, onAnalyze: vi.fn(), isAnalyzing: false };
    const id = show(
      <DocumentPreview {...props} onTargetRoleChange={vi.fn()} />,
      "id",
    );
    expect(screen.getByText("Siap")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Analisis CV saya" }),
    ).toBeTruthy();
    expect(screen.getByText("Posisi lain (tulis sendiri)…")).toBeTruthy();
    id.unmount();
    show(<DocumentPreview {...props} isAnalyzing />, "en");
    expect(
      screen.getByRole("button", { name: "Starting Analysis…" }),
    ).toBeTruthy();
  });

  it("processing stages translate labels", () => {
    const id = show(
      <ProcessingStages currentStage="scoring" percentage={40} message="m" />,
      "id",
    );
    expect(screen.getByText("Menganalisis CV kamu")).toBeTruthy();
    expect(screen.getByText("Mengambil teks")).toBeTruthy();
    id.unmount();
    show(
      <ProcessingStages currentStage="scoring" percentage={40} message="m" />,
      "en",
    );
    expect(screen.getByText("Extracting text")).toBeTruthy();
  });
});
