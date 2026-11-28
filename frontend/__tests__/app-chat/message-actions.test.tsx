import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { withLocale } from "../i18n/with-locale";
import ChatThread from "@/components/app-chat/chat-thread";
import MessageActions from "@/components/app-chat/message-actions";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

const writeText = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

const messages: ChatMessage[] = [
  { id: "u1", role: "user", text: "halo" },
  { id: "a1", role: "assistant", text: "Jawaban **tebal**" },
  { id: "u2", role: "user", text: "lagi" },
  { id: "a2", role: "assistant", text: "Jawaban dua" },
];

it("copies the raw text and confirms for 1.5 seconds", async () => {
  render(withLocale(<MessageActions text="hello **there**" />));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Copy/ }));
  });
  expect(writeText).toHaveBeenCalledWith("hello **there**");
  expect(screen.getByText("Copied")).toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  expect(screen.getByText("Copy")).toBeInTheDocument();
});

it("does not confirm when the clipboard rejects", async () => {
  writeText.mockRejectedValue(new Error("denied"));
  render(withLocale(<MessageActions text="x" />));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Copy/ }));
  });
  expect(screen.queryByText("Copied")).not.toBeInTheDocument();
});

it("calls regenerate from the button", () => {
  const regenerate = vi.fn();
  render(withLocale(<MessageActions text="x" onRegenerate={regenerate} />));
  fireEvent.click(screen.getByRole("button", { name: /Regenerate/ }));
  expect(regenerate).toHaveBeenCalledTimes(1);
});

it("offers regenerate only on the last finished reply", () => {
  render(
    withLocale(
      <ChatThread messages={messages} busy={false} onRegenerate={vi.fn()} />,
    ),
  );
  expect(screen.getAllByRole("button", { name: /Copy/ })).toHaveLength(2);
  expect(screen.getAllByRole("button", { name: /Regenerate/ })).toHaveLength(1);
});

it("hides actions on the reply that is still streaming", () => {
  render(
    withLocale(<ChatThread messages={messages} busy onRegenerate={vi.fn()} />),
  );
  expect(screen.queryByRole("button", { name: /Regenerate/ })).toBeNull();
  expect(screen.getAllByRole("button", { name: /Copy/ })).toHaveLength(1);
});

it("renders markdown without literal asterisks and typing dots while empty", () => {
  render(
    withLocale(
      <ChatThread
        messages={[
          ...messages,
          { id: "u3", role: "user", text: "?" },
          { id: "a3", role: "assistant", text: "" },
        ]}
        busy
      />,
    ),
  );
  expect(screen.getByText("tebal").tagName).toBe("STRONG");
  expect(document.body.textContent).not.toContain("**");
  expect(
    screen.getByRole("status", { name: "Pathy is typing" }),
  ).toBeInTheDocument();
});
