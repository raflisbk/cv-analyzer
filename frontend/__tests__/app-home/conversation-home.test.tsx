import { afterEach, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useConversationHome } from "@/hooks/use-conversation-home";
import { createConversation, sendMessage } from "@/lib/app-api/conversations";

vi.mock("@/lib/app-api/conversations", () => ({
  createConversation: vi.fn(),
  sendMessage: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

function show() {
  const client = new QueryClient();
  return renderHook(() => useConversationHome(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

it("creates a CV conversation and renders streamed text before completion", async () => {
  vi.mocked(createConversation).mockResolvedValue({
    id: "chat",
    title: "Server title",
    scope: { type: "general" },
    updatedAt: "now",
  });
  let finish:
    | ((value: { id: string; role: "assistant"; text: string }) => void)
    | undefined;
  vi.mocked(sendMessage).mockImplementation(async (_id, _text, onUpdate) => {
    onUpdate?.("Hello");
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const { result } = show();
  act(() => result.current.setJobId("job"));
  act(() => {
    void result.current.send("Hi");
  });
  await waitFor(() => expect(result.current.messages[1]?.text).toBe("Hello"));
  expect(createConversation).toHaveBeenCalledWith("job");
  act(() => finish?.({ id: "reply", role: "assistant", text: "Hello there" }));
  await waitFor(() =>
    expect(result.current.messages[1]?.text).toBe("Hello there"),
  );
});

it("keeps failed text available for retry", async () => {
  vi.mocked(createConversation).mockResolvedValue({
    id: "chat",
    title: "Server title",
    scope: { type: "general" },
    updatedAt: "now",
  });
  vi.mocked(sendMessage)
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ id: "reply", role: "assistant", text: "Ready" });
  const { result } = show();
  act(() => {
    void result.current.send("Hi");
  });
  await waitFor(() => expect(result.current.error).toContain("Try again"));
  act(() => {
    void result.current.retry();
  });
  await waitFor(() => expect(result.current.messages[1]?.text).toBe("Ready"));
  expect(result.current.messages).toHaveLength(2);
});
