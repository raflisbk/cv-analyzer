import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withLocale } from "../i18n/with-locale";
import ChatLayout from "@/components/app-chat/chat-layout";
import ArtifactPanel from "@/components/app-chat/artifact-panel";
import ArtifactCard from "@/components/app-chat/artifact-card";
import { getReportDetail } from "@/lib/app-api/report-detail";
import { reportDetailFixture } from "@/lib/app-api/fixtures/report-detail";

vi.mock("@/lib/app-api/report-detail", () => ({ getReportDetail: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/app" }));

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as never;
});
afterEach(() => vi.clearAllMocks());

function ui(node: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      {withLocale(node)}
    </QueryClientProvider>,
  );
}

it("shows the score, four dimensions and at most three fixes", async () => {
  vi.mocked(getReportDetail).mockResolvedValue({
    ...reportDetailFixture,
    fixes: [1, 2, 3, 4].map((n) => ({
      title: `Fix ${n}`,
      text: "t",
      points: 1,
    })),
  });
  ui(<ArtifactPanel jobId="job 1" close={vi.fn()} />);
  expect(
    await screen.findByRole("img", { name: "Score 77 of 100" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("term")).toHaveLength(4);
  expect(screen.getAllByText(/^Fix \d$/)).toHaveLength(3);
  expect(screen.getByRole("link", { name: "Apply all" })).toHaveAttribute(
    "href",
    "/app/cvs/job%201?view=editor&tab=fixes",
  );
});

it("is a labelled complementary region with a skeleton before data", () => {
  vi.mocked(getReportDetail).mockReturnValue(new Promise(() => undefined));
  ui(<ArtifactPanel jobId="job" close={vi.fn()} />);
  expect(
    screen.getByRole("complementary", { name: "Your CV score summary" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("status", { name: "Loading score summary" }),
  ).toBeInTheDocument();
});

it("shows an error state and retries", async () => {
  vi.mocked(getReportDetail).mockRejectedValueOnce(new Error("boom"));
  ui(<ArtifactPanel jobId="job" close={vi.fn()} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not load the score summary.",
  );
  vi.mocked(getReportDetail).mockResolvedValue(reportDetailFixture);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("img", { name: /Score 77/ }),
  ).toBeInTheDocument();
});

it("calls close from the close button", () => {
  vi.mocked(getReportDetail).mockReturnValue(new Promise(() => undefined));
  const close = vi.fn();
  ui(<ArtifactPanel jobId="job" close={close} />);
  fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
  expect(close).toHaveBeenCalledTimes(1);
});

it("card opens the panel through its button once data is ready", async () => {
  vi.mocked(getReportDetail).mockResolvedValue(reportDetailFixture);
  const open = vi.fn();
  ui(<ArtifactCard jobId="job" open={false} onOpen={open} />);
  const button = await screen.findByRole("button", { name: "Open" });
  await vi.waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(open).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Samuel_CV_2026.pdf")).toBeInTheDocument();
});

it("layout renders no panel while closed", () => {
  ui(
    <ChatLayout
      bottom={null}
      scrollSignature=""
      panel={{ jobId: "job", open: false, close: vi.fn() }}
    >
      thread
    </ChatLayout>,
  );
  expect(screen.queryByRole("complementary")).toBeNull();
});

it("layout lazy loads the panel when open", async () => {
  vi.mocked(getReportDetail).mockResolvedValue(reportDetailFixture);
  ui(
    <ChatLayout
      bottom={null}
      scrollSignature=""
      panel={{ jobId: "job", open: true, close: vi.fn() }}
    >
      thread
    </ChatLayout>,
  );
  expect(await screen.findByRole("complementary")).toBeInTheDocument();
});
