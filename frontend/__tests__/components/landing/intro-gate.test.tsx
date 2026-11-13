import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLandingIntro } from "@/hooks/use-landing-intro";

const mocks = vi.hoisted(() => ({
  timeline: vi.fn(() => ({ kill: vi.fn() })),
  refresh: vi.fn(),
  entrance: vi.fn(),
  scroll: vi.fn(() => ({ kill: vi.fn() })),
}));

vi.mock("@/lib/gsap-loader", () => ({
  loadGsap: async () => ({
    gsap: { timeline: mocks.timeline },
    ScrollTrigger: { refresh: mocks.refresh },
  }),
}));
vi.mock("@/components/landing/intro/play-hero-entrance", () => ({
  playHeroEntrance: mocks.entrance,
}));
vi.mock("@/components/landing/intro/play-hero-scroll", () => ({
  playHeroScroll: mocks.scroll,
}));

function Probe() {
  const ref = useLandingIntro();
  return (
    <>
      <div ref={ref} data-landing-loader />
      <div data-landing-hero />
    </>
  );
}

describe("seen landing intro", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mocks.timeline.mockClear();
    mocks.entrance.mockClear();
    mocks.scroll.mockClear();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    document.body.style.overflow = "";
  });

  it("hides the loader, leaves scrolling unlocked, and starts the hero immediately", async () => {
    sessionStorage.setItem("pathkr-intro-seen", "1");
    const complete = vi.fn();
    window.addEventListener("landing-intro-complete", complete);
    const { container, unmount } = render(<Probe />);

    expect(
      container.querySelector<HTMLElement>("[data-landing-loader]")?.style
        .display,
    ).toBe("none");
    expect(document.body.style.overflow).toBe("");
    await waitFor(() =>
      expect(mocks.entrance).toHaveBeenCalledWith(expect.anything(), 0),
    );
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1));

    unmount();
    window.removeEventListener("landing-intro-complete", complete);
  });
});
