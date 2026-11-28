import { afterEach, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { localeWrapper } from "../i18n/render-with-locale";
import { useConversationThread } from "@/hooks/use-conversation-thread";
import { listMessages, sendMessage } from "@/lib/app-api/conversations";

vi.mock("@/lib/app-api/conversations", () => ({
  listMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

function show() {
  const client = new QueryClient();
  return renderHook(() => useConversationThread("chat"), {
    wrapper: ({ children }: { children: ReactNode }) =>
      localeWrapper({
        children: (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      }),
  });
}

it("re-sends the last user message and replaces the local pair", async () => {
  vi.mocked(listMessages).mockResolvedValue([]);
  vi.mocked(sendMessage)
    .mockResolvedValueOnce({ id: "r1", role: "assistant", text: "first" })
    .mockResolvedValueOnce({ id: "r2", role: "assistant", text: "second" });
  const { result } = show();
  await waitFor(() => expect(result.current.messages).not.toBeNull());
  await act(async () => result.current.send("Skor aku?"));
  await waitFor(() => expect(result.current.messages?.[1]?.text).toBe("first"));
  await act(async () => result.current.regenerate());
  await waitFor(() =>
    expect(result.current.messages?.[1]?.text).toBe("second"),
  );
  expect(sendMessage).toHaveBeenCalledTimes(2);
  expect(vi.mocked(sendMessage).mock.calls[1][1]).toBe("Skor aku?");
  expect(result.current.messages).toHaveLength(2);
});

it("regenerates from the last saved question when nothing was sent yet", async () => {
  vi.mocked(listMessages).mockResolvedValue([
    { id: "u", role: "user", text: "Kenapa rendah?" },
    { id: "a", role: "assistant", text: "Karena" },
  ]);
  vi.mocked(sendMessage).mockResolvedValue({
    id: "r",
    role: "assistant",
    text: "again",
  });
  const { result } = show();
  await waitFor(() => expect(result.current.messages).toHaveLength(2));
  await act(async () => result.current.regenerate());
  expect(vi.mocked(sendMessage).mock.calls[0][1]).toBe("Kenapa rendah?");
});

it("does nothing when there is no user message", async () => {
  vi.mocked(listMessages).mockResolvedValue([]);
  const { result } = show();
  await waitFor(() => expect(result.current.messages).toEqual([]));
  await act(async () => result.current.regenerate());
  expect(sendMessage).not.toHaveBeenCalled();
});
