import { afterEach, describe, expect, it, vi } from "vitest";
import { postConversationMessage } from "@/lib/app-api/conversations-stream";

afterEach(() => vi.unstubAllGlobals());

describe("postConversationMessage", () => {
  it("joins split token events and keeps valid actions", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"token":"Hel'));
        controller.enqueue(
          encoder.encode(
            'lo"}\n\ndata: {"token":" world"}\n\ndata: {"type":"complete","text":"Hello world","actions":[{"type":"open_workspace","jobId":"one","view":"editor"}]}\n\n',
          ),
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, body: stream }),
    );
    const message = await postConversationMessage("a/b", "Hi");
    expect(message.text).toBe("Hello world");
    expect(message.actions).toEqual([
      { type: "open_workspace", jobId: "one", view: "editor" },
    ]);
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/conversations/a%2Fb/messages",
      expect.objectContaining({ method: "POST" }),
    );
  });
  it("surfaces an HTTP failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, body: null }),
    );
    await expect(postConversationMessage("one", "Hi")).rejects.toThrow(
      "Could not send your message",
    );
  });
  it("publishes tokens as each event arrives", async () => {
    const encoder = new TextEncoder();
    const updates: string[] = [];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"token":"Hi"}\n\n'));
        controller.enqueue(encoder.encode('data: {"token":" there"}\n\n'));
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, body: stream }),
    );
    await postConversationMessage("one", "Hello", (text) => updates.push(text));
    expect(updates).toEqual(["Hi", "Hi there"]);
  });
  it("surfaces an error event after partial tokens", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"token":"Partial"}\n\n'));
        controller.enqueue(
          encoder.encode('data: {"error":"Model unavailable"}\n\n'),
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, body: stream }),
    );
    await expect(postConversationMessage("one", "Hello")).rejects.toThrow(
      "Model unavailable",
    );
  });
});
