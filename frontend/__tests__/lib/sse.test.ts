import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SSEConnection } from "@/lib/sse";

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }

  emit(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

const latest = () => FakeEventSource.instances.at(-1)!;

describe("SSEConnection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("ignores heartbeat events", () => {
    const onMessage = vi.fn();
    new SSEConnection("/s", onMessage).connect();
    latest().emit({ type: "heartbeat" });
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("forwards progress events with step and counts", () => {
    const onMessage = vi.fn();
    new SSEConnection("/s", onMessage).connect();
    latest().emit({ stage: "indexing_cv", step: 4, done: 2, total: 15 });
    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "indexing_cv", step: 4, done: 2 }),
    );
  });

  it("reports every drop and reconnects with exponential backoff", () => {
    const onError = vi.fn();
    new SSEConnection("/s", vi.fn(), onError).connect();
    const delays = [1000, 2000, 4000, 8000];
    delays.forEach((delay, index) => {
      latest().onerror?.();
      expect(onError).toHaveBeenCalledTimes(index + 1);
      vi.advanceTimersByTime(delay - 1);
      expect(FakeEventSource.instances).toHaveLength(index + 1);
      vi.advanceTimersByTime(1);
      expect(FakeEventSource.instances).toHaveLength(index + 2);
    });
  });

  it("caps the backoff delay at thirty seconds", () => {
    new SSEConnection("/s", vi.fn(), vi.fn()).connect();
    [1000, 2000, 4000, 8000, 16000].forEach((delay) => {
      latest().onerror?.();
      vi.advanceTimersByTime(delay);
    });
    for (let i = 0; i < 2; i++) {
      latest().onerror?.();
      const count = FakeEventSource.instances.length;
      vi.advanceTimersByTime(29999);
      expect(FakeEventSource.instances).toHaveLength(count);
      vi.advanceTimersByTime(1);
      expect(FakeEventSource.instances).toHaveLength(count + 1);
    }
  });

  it("resets the backoff once a message arrives", () => {
    new SSEConnection("/s", vi.fn(), vi.fn()).connect();
    latest().onerror?.();
    vi.advanceTimersByTime(1000);
    latest().onerror?.();
    vi.advanceTimersByTime(2000);
    latest().emit({ type: "connected", job_id: "j" });
    latest().onerror?.();
    const before = FakeEventSource.instances.length;
    vi.advanceTimersByTime(1000);
    expect(FakeEventSource.instances).toHaveLength(before + 1);
  });

  it.each(["complete", "failed"])("stops reconnecting after %s", (stage) => {
    const onError = vi.fn();
    new SSEConnection("/s", vi.fn(), onError).connect();
    latest().emit({ stage, percentage: 100, message: "x" });
    latest().onerror?.();
    vi.advanceTimersByTime(60000);
    expect(FakeEventSource.instances).toHaveLength(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("treats a silent connection as dropped after the stale window", () => {
    const onError = vi.fn();
    new SSEConnection("/s", vi.fn(), onError).connect();
    vi.advanceTimersByTime(24999);
    expect(onError).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onError).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.instances[0].closed).toBe(true);
  });

  it("keeps a heartbeating connection alive past the stale window", () => {
    const onError = vi.fn();
    new SSEConnection("/s", vi.fn(), onError).connect();
    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(10000);
      latest().emit({ type: "heartbeat" });
    }
    expect(onError).not.toHaveBeenCalled();
    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it("does not reconnect after close", () => {
    const connection = new SSEConnection("/s", vi.fn(), vi.fn());
    connection.connect();
    latest().onerror?.();
    connection.close();
    vi.advanceTimersByTime(60000);
    expect(FakeEventSource.instances).toHaveLength(1);
  });
});
