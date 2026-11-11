import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportsList from "@/components/app-reports/reports-list";
import { listReports } from "@/lib/app-api/reports";
import { reportFixtures } from "@/lib/app-api/fixtures/reports";

vi.mock("@/lib/app-api/reports", () => ({ listReports: vi.fn() }));
vi.mock("@/components/app-shell/upload-cv-button", () => ({
  default: () => <button>Upload CV</button>,
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ReportsList />
    </QueryClientProvider>,
  );
}

describe("ReportsList", () => {
  it("shows an error with retry when the API fails", async () => {
    vi.mocked(listReports).mockRejectedValue(new Error("offline"));
    show();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load reports",
    );
  });
  it("shows sad Pathy when there are no reports", async () => {
    vi.mocked(listReports).mockResolvedValue({
      ...reportFixtures,
      reports: [],
    });
    show();
    expect(await screen.findByText("No reports yet")).toBeInTheDocument();
    expect(
      screen
        .getAllByAltText("")
        .some((image) => image.getAttribute("src")?.includes("sad.webp")),
    ).toBe(true);
  });
  it("renders report scores and actions", async () => {
    vi.mocked(listReports).mockResolvedValue(reportFixtures);
    show();
    expect(
      await screen.findByRole("heading", { name: "Samuel_CV_2026.pdf" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Open report" })[0],
    ).toHaveAttribute("href", "/app/cvs/samuel-2026?view=report");
    expect(
      screen.getByText("Recurring fixes across your CVs"),
    ).toBeInTheDocument();
  });
});
