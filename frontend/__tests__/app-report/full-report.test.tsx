import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FullReportView from "@/components/app-report/full-report-view";
import { getReportDetail } from "@/lib/app-api/report-detail";
import { reportDetailFixture } from "@/lib/app-api/fixtures/report-detail";
import { reportWeights } from "@/lib/app-report/format";

vi.mock("@/lib/app-api/report-detail", () => ({ getReportDetail: vi.fn() }));
vi.mock("@/components/pathy/help-button", () => ({
  default: ({ helpKey }: { helpKey: string }) => (
    <button aria-label={`Help: ${helpKey}`}>?</button>
  ),
}));
vi.mock("@/components/app-export/export-dialog", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Export CV</div> : null,
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const react = vi.fn();
let intersectionCallback: IntersectionObserverCallback;
vi.mock("@/components/pathy/pathy-context", () => ({
  usePathy: () => ({ react, burst: vi.fn(), startTour: vi.fn() }),
}));

function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <FullReportView jobId="cv-1" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(getReportDetail).mockResolvedValue(reportDetailFixture);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: true }),
  });
  class ResizeObserverMock {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("FullReportView", () => {
  it("shows a loading state while the request is pending", () => {
    vi.mocked(getReportDetail).mockReturnValue(new Promise(() => {}));
    show();
    expect(screen.getByRole("status")).toHaveTextContent("Loading full report");
  });
  it("keeps the fixture's overall score consistent with weighted dimensions", () => {
    const weighted = reportDetailFixture.dimensions.reduce(
      (total, item) => total + (item.score * reportWeights[item.key]) / 100,
      0,
    );
    expect(Math.round(weighted)).toBe(reportDetailFixture.score);
  });
  it("renders all report sections and tour targets", async () => {
    show();
    expect(await screen.findByText("Full report")).toBeInTheDocument();
    for (const name of [
      "Section by section",
      "Bullet strength",
      "Grammar and style",
      "All bullets",
      "Missing keywords",
      "ATS readiness",
      "Score history",
    ])
      expect(screen.getAllByText(new RegExp(name, "i")).length).toBeGreaterThan(
        0,
      );
    expect(
      document.querySelector('[data-tour="report-nav"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-tour="report-scores"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to editor" }),
    ).toHaveAttribute("href", "/app/cvs/cv-1?view=editor");
    expect(
      screen.getAllByRole("link", { name: "Fix this" })[0],
    ).toHaveAttribute("href", "/app/cvs/cv-1?view=editor&tab=fixes");
  });
  it("shows sad Pathy and a retry on error", async () => {
    vi.mocked(getReportDetail).mockRejectedValue(new Error("offline"));
    show();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load your report",
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    expect(
      document.querySelector('img[src="/pathy/sad.webp"]'),
    ).toHaveAttribute("src", "/pathy/sad.webp");
  });
  it("shows an empty state when dimensions are absent", async () => {
    vi.mocked(getReportDetail).mockResolvedValue({
      ...reportDetailFixture,
      dimensions: [],
    });
    show();
    expect(await screen.findByText("No report yet")).toBeInTheDocument();
  });
  it("renders real-data empty fields without invalid scores or blank subtitles", async () => {
    vi.mocked(getReportDetail).mockResolvedValue({
      ...reportDetailFixture,
      role: "",
      previousScore: 0,
      versions: [reportDetailFixture.versions[0]],
      sections: [],
      bullets: [],
      grammar: { spelling: 0, grammar: 0, style: 0, notes: [] },
      keywords: {
        present: [],
        missing: [{ name: "Python", posts: 0 }],
        total: 0,
      },
      ats: { score: 0, facts: [], checks: [] },
    });
    show();
    await screen.findByText("Full report");
    expect(document.body.textContent).not.toContain(" · · ");
    expect(document.body.textContent).not.toContain("NaN");
    expect(document.body.textContent).not.toContain("undefined");
    expect(document.body.textContent).not.toContain("since previous version");
    expect(
      screen.getByText("No section scores available yet."),
    ).toBeInTheDocument();
    expect(screen.getByText("No language notes found.")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("0 of 10 posts");
  });
  it("opens the existing export dialog", async () => {
    show();
    await screen.findByText("Full report");
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Export CV");
  });
  it("lets nav select a section and honors reduced motion", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    show();
    const nav = await screen.findByRole("navigation", {
      name: "Report sections",
    });
    fireEvent.click(screen.getByRole("button", { name: "Sections" }));
    expect(nav.querySelector('[aria-current="location"]')).toHaveTextContent(
      "Sections",
    );
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "instant",
      block: "start",
    });
    expect(react).toHaveBeenCalledWith(
      "proud",
      "Your CV scored 77 out of 100.",
    );
  });
  it("updates active nav item when a section enters the viewport", async () => {
    show();
    const nav = await screen.findByRole("navigation", {
      name: "Report sections",
    });
    act(() =>
      intersectionCallback(
        [
          {
            isIntersecting: true,
            target: document.getElementById("report-history")!,
            boundingClientRect: new DOMRect(0, 100),
            intersectionRect: new DOMRect(),
            rootBounds: null,
            intersectionRatio: 1,
            time: 0,
          },
        ],
        {} as IntersectionObserver,
      ),
    );
    expect(nav.querySelector('[aria-current="location"]')).toHaveTextContent(
      "History",
    );
  });
});
