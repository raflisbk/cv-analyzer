import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HistoryDrawer from "@/components/app-shell/history-drawer";
import { listConversations } from "@/lib/app-api/conversations";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/app-api/conversations", () => ({ listConversations: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
function show(open: boolean, close = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    close,
    ...render(
      <QueryClientProvider client={client}>
        <HistoryDrawer open={open} close={close} newChat={vi.fn()} />
      </QueryClientProvider>,
    ),
  };
}

describe("HistoryDrawer", () => {
  it("is inert when closed", () => {
    const { container } = show(false);
    expect(container.querySelector("aside")).toHaveAttribute("inert");
  });
  it("shows CV history links, traps focus and closes on Escape", async () => {
    vi.mocked(listConversations).mockResolvedValue([
      {
        id: "one",
        title: "Review my CV",
        scope: { type: "cv", jobId: "job-1", fileName: "one.pdf" },
        updatedAt: new Date().toISOString(),
      },
    ]);
    const { close } = show(true);
    expect(await screen.findByText("Review my CV")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review my CV/ })).toHaveAttribute(
      "href",
      "/app/cvs/job-1?view=editor&tab=chat",
    );
    expect(document.activeElement).toHaveAttribute(
      "aria-label",
      "Close chat history",
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(close).toHaveBeenCalled();
  });
});
