import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { intersectionObservers, stubNavBrowser } from "./nav-browser-stubs";

const loadThree = vi.hoisted(() => vi.fn());
const createLaptopRenderer = vi.hoisted(() => vi.fn());
vi.mock("@/lib/three-loader", () => ({ loadThree }));
vi.mock("@/components/landing/sections/laptop/three/scene", () => ({
  createLaptopRenderer,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { I18nProvider } from "@/components/i18n/i18n-provider";
import LaptopCanvas from "@/components/landing/sections/laptop/three/laptop-canvas";
import { LAPTOP_PROGRESS_EVENT } from "@/components/landing/sections/laptop/three/progress-event";

const stub = {
  render: vi.fn(),
  resize: vi.fn(),
  stats: vi.fn(() => ({ geometries: 3, textures: 2 })),
  dispose: vi.fn(),
};

function mountSection() {
  return render(
    <I18nProvider initialLocale="en">
      <section>
        <div data-laptop-anchor />
        <LaptopCanvas />
      </section>
    </I18nProvider>,
  );
}

async function nearViewport() {
  await act(async () => {
    intersectionObservers.forEach((observer) =>
      observer.callback([{ isIntersecting: true }]),
    );
    await Promise.resolve();
  });
}

beforeEach(() => {
  stubNavBrowser();
  Object.values(stub).forEach((fn) => fn.mockClear());
  loadThree.mockReset().mockResolvedValue({});
  createLaptopRenderer.mockReset().mockReturnValue(stub);
});
afterEach(() => vi.unstubAllGlobals());

describe("laptop canvas lifecycle", () => {
  it("does not load three until the section is near the viewport", () => {
    mountSection();
    expect(loadThree).not.toHaveBeenCalled();
  });

  it("mounts a labelled canvas once three has loaded", async () => {
    const view = mountSection();
    await nearViewport();
    const canvas = view.container.querySelector("canvas");
    expect(canvas).toHaveAttribute("role", "img");
    expect(canvas).toHaveAttribute("aria-label", "Opening sample CV");
    expect(loadThree).toHaveBeenCalledOnce();
  });

  it("renders on demand from the progress event", async () => {
    const view = mountSection();
    await nearViewport();
    const panel = view.container.querySelector("section")!;
    panel.dispatchEvent(
      new CustomEvent(LAPTOP_PROGRESS_EVENT, { detail: { scene: 0.4 } }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(createLaptopRenderer).toHaveBeenCalledOnce();
  });

  it("disposes the renderer and removes the canvas on unmount", async () => {
    const view = mountSection();
    await nearViewport();
    view.unmount();
    expect(stub.dispose).toHaveBeenCalledOnce();
    expect(document.querySelector("canvas")).toBeNull();
  });

  it("falls back to the poster when three fails to load", async () => {
    loadThree.mockRejectedValue(new Error("chunk"));
    const view = mountSection();
    await nearViewport();
    expect(view.container.querySelector("[data-laptop-poster]")).not.toBeNull();
    expect(view.container.querySelector("canvas")).toBeNull();
  });

  it("falls back to the poster when WebGL is unavailable", async () => {
    createLaptopRenderer.mockReturnValue(null);
    const view = mountSection();
    await nearViewport();
    expect(view.container.querySelector("[data-laptop-poster]")).not.toBeNull();
  });

  it("shows the poster without loading three under reduced motion", () => {
    stubNavBrowser(true);
    const view = mountSection();
    expect(view.container.querySelector("[data-laptop-poster]")).not.toBeNull();
    expect(loadThree).not.toHaveBeenCalled();
  });
});
