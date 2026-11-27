import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withLocale } from "../i18n/with-locale";
import FullReportView from "@/components/app-report/full-report-view";
import { getReportDetail } from "@/lib/app-api/report-detail";
import { reportDetailFixture } from "@/lib/app-api/fixtures/report-detail";
import type { Locale } from "@/lib/i18n/locales";

vi.mock("@/lib/app-api/report-detail", () => ({ getReportDetail: vi.fn() }));
vi.mock("@/components/pathy/help-button", () => ({
  default: () => <button>?</button>,
}));
vi.mock("@/components/app-export/export-dialog", () => ({
  default: () => null,
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
vi.mock("@/components/pathy/pathy-context", () => ({
  usePathy: () => ({ react: vi.fn(), burst: vi.fn(), startTour: vi.fn() }),
}));

function show(locale: Locale) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    withLocale(
      <QueryClientProvider client={client}>
        <FullReportView jobId="cv-1" />
      </QueryClientProvider>,
      locale,
    ),
  );
}

beforeEach(() => {
  vi.mocked(getReportDetail).mockResolvedValue({
    ...reportDetailFixture,
    verdict: {
      key: "room",
      title: "Room to improve",
      body: "Focus on the lowest scoring dimensions first.",
    },
    fixes: [
      {
        title: "Experience: quantify the impact",
        text: "Add scale",
        points: 3,
        section: "experience",
        type: "impact_metric",
      },
    ],
  });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  class Stub {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Stub);
  vi.stubGlobal("IntersectionObserver", Stub);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("report hero verdict", () => {
  it("renders the verdict and fix title in Indonesian", async () => {
    show("id");
    expect(await screen.findByText("Masih bisa lebih baik")).toBeTruthy();
    expect(
      screen.getByText("Mulai dari dimensi dengan skor paling rendah."),
    ).toBeTruthy();
    expect(
      screen.getByText("Pengalaman: tunjukkan dampaknya dengan angka"),
    ).toBeTruthy();
  });

  it("renders the verdict and fix title in English", async () => {
    show("en");
    expect(await screen.findByText("Room to improve")).toBeTruthy();
    expect(screen.getByText("Experience: quantify the impact")).toBeTruthy();
  });
});
