import { vi } from "vitest";

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

export const intersectionObservers: {
  callback: ObserverCallback;
  targets: Element[];
}[] = [];

export function stubNavBrowser(reduced = false) {
  intersectionObservers.length = 0;
  class FakeIntersection {
    targets: Element[] = [];
    constructor(public callback: ObserverCallback) {
      intersectionObservers.push(this);
    }
    observe(target: Element) {
      this.targets.push(target);
    }
    disconnect() {
      this.targets = [];
    }
  }
  class FakeResize {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", FakeIntersection);
  vi.stubGlobal("ResizeObserver", FakeResize);
  vi.stubGlobal("matchMedia", () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal("requestAnimationFrame", (run: FrameRequestCallback) => {
    queueMicrotask(() => run(0));
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
}
