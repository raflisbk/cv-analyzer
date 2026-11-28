import { afterEach, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useChatArtifact } from "@/hooks/use-chat-artifact";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

const asked: ChatMessage[] = [
  { id: "u", role: "user", text: "kenapa skor aku rendah?" },
  { id: "a", role: "assistant", text: "Karena ..." },
];

function viewport(wide: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: wide }) as never;
}

afterEach(() => vi.restoreAllMocks());

function finishReply(jobId: string | null, messages = asked) {
  const hook = renderHook((props) => useChatArtifact(props), {
    initialProps: { jobId, messages, busy: true },
  });
  hook.rerender({ jobId, messages, busy: false });
  return hook;
}

it("opens after a matching live reply in a CV conversation on desktop", () => {
  viewport(true);
  expect(finishReply("job").result.current.open).toBe(true);
});

it("never opens in a general conversation", () => {
  viewport(true);
  const { result } = finishReply(null);
  expect(result.current.open).toBe(false);
  act(() => result.current.show());
  expect(result.current.open).toBe(false);
  expect(result.current.cardIds.size).toBe(0);
});

it("does not open for a question without a score or fix intent", () => {
  viewport(true);
  const messages = [{ ...asked[0], text: "cocokkan ke lowongan" }, asked[1]];
  expect(finishReply("job", messages).result.current.open).toBe(false);
});

it("leaves the sheet closed on narrow screens until the card is used", () => {
  viewport(false);
  const { result } = finishReply("job");
  expect(result.current.open).toBe(false);
  act(() => result.current.show());
  expect(result.current.open).toBe(true);
});

it("closes and returns focus to the card", async () => {
  viewport(true);
  document.body.innerHTML = "<button data-artifact-trigger>Buka</button>";
  const { result } = finishReply("job");
  act(() => result.current.hide());
  expect(result.current.open).toBe(false);
  await vi.waitFor(() =>
    expect(document.activeElement).toBe(
      document.querySelector("[data-artifact-trigger]"),
    ),
  );
});
