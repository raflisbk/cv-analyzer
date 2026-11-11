import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CvsList from "@/components/app-cvs/cvs-list";
import { listCvs } from "@/lib/app-api/cvs";

vi.mock("@/lib/app-api/cvs", () => ({ listCvs: vi.fn() }));
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
      <CvsList />
    </QueryClientProvider>,
  );
}

describe("CvsList", () => {
  it("shows an error with retry when the API fails", async () => {
    vi.mocked(listCvs).mockRejectedValue(new Error("offline"));
    show();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load your CVs",
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
  it("shows sad Pathy when there are no CVs", async () => {
    vi.mocked(listCvs).mockResolvedValue([]);
    show();
    expect(await screen.findByText("No CVs yet")).toBeInTheDocument();
    expect(
      screen
        .getAllByAltText("")
        .some((image) => image.getAttribute("src")?.includes("sad.webp")),
    ).toBe(true);
  });
  it("shows CV cards and both workspace links", async () => {
    vi.mocked(listCvs).mockResolvedValue([
      {
        jobId: "one",
        fileName: "one.pdf",
        targetRole: "Designer",
        score: 77,
        status: "complete",
        updatedAt: new Date().toISOString(),
        pages: 1,
        wordCount: 100,
      },
    ]);
    show();
    expect(await screen.findByText("one.pdf")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Report" })).toHaveAttribute(
      "href",
      "/app/cvs/one?view=report",
    );
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/app/cvs/one?view=editor",
    );
  });
});
