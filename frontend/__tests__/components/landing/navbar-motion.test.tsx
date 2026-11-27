import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import Navbar from "@/components/landing/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { intersectionObservers, stubNavBrowser } from "./nav-browser-stubs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function mountPage(withHero: boolean) {
  document.body.innerHTML = `
    ${withHero ? '<a data-hero-cta href="/app">hero</a>' : ""}
    <section id="a" data-nav-tone="snow"></section>
    <section id="b" data-nav-tone="ink"></section>
    <div id="root"></div>`;
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <I18nProvider initialLocale="en">
        <Navbar />
      </I18nProvider>
    </QueryClientProvider>,
    { container: document.getElementById("root")! },
  );
}

function header() {
  return document.querySelector<HTMLElement>("[data-landing-nav]")!;
}

function cta() {
  return document.querySelector<HTMLElement>("[data-nav-cta]")!;
}

function reportHero(ratio: number) {
  const observer = intersectionObservers.find((item) =>
    item.targets.some((target) => target.hasAttribute("data-hero-cta")),
  )!;
  act(() =>
    observer.callback([
      { isIntersecting: ratio > 0, intersectionRatio: ratio },
    ]),
  );
}

beforeEach(() => {
  stubNavBrowser();
  useAuthStore.setState({ user: null, isHydrated: true });
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("landing navbar scroll progress", () => {
  it("writes a fractional progress that reverses with the scroll", async () => {
    mountPage(true);
    Object.defineProperty(window, "scrollY", { value: 70, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header().style.getPropertyValue("--bar-p")).toBe("0.5");
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header().style.getPropertyValue("--bar-p")).toBe("0");
  });

  it("jumps straight to the final state with reduced motion", async () => {
    stubNavBrowser(true);
    mountPage(true);
    Object.defineProperty(window, "scrollY", { value: 70, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header().style.getPropertyValue("--bar-p")).toBe("0");
    Object.defineProperty(window, "scrollY", {
      value: 200,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header().style.getPropertyValue("--bar-p")).toBe("1");
  });
});

describe("landing navbar section tone", () => {
  it("follows the section under the bar and keeps it across gaps", () => {
    mountPage(true);
    expect(header()).toHaveAttribute("data-tone", "red");
    const observer = intersectionObservers.find((item) =>
      item.targets.some((target) => target.id === "a"),
    )!;
    act(() =>
      observer.callback([
        { isIntersecting: true, target: document.getElementById("a")! },
      ]),
    );
    expect(header()).toHaveAttribute("data-tone", "snow");
    act(() =>
      observer.callback([
        { isIntersecting: false, target: document.getElementById("a")! },
      ]),
    );
    expect(header()).toHaveAttribute("data-tone", "snow");
    act(() =>
      observer.callback([
        { isIntersecting: true, target: document.getElementById("b")! },
      ]),
    );
    expect(header()).toHaveAttribute("data-tone", "ink");
  });
});

describe("landing navbar call to action handoff", () => {
  it("hides the bar button while the hero button is in view", () => {
    mountPage(true);
    reportHero(0.8);
    expect(header()).toHaveAttribute("data-cta", "hidden");
    expect(cta()).toHaveAttribute("tabindex", "-1");
    expect(cta().parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the bar button once the hero button leaves", () => {
    mountPage(true);
    reportHero(0.8);
    reportHero(0);
    expect(header()).toHaveAttribute("data-cta", "shown");
    expect(cta()).not.toHaveAttribute("tabindex");
    expect(cta().parentElement).toHaveAttribute("aria-hidden", "false");
  });

  it("shows the bar button when the hero button has faded out in place", async () => {
    mountPage(true);
    reportHero(1);
    const hero = document.querySelector<HTMLElement>("[data-hero-cta]")!;
    hero.style.opacity = "0.2";
    await act(async () => {
      await Promise.resolve();
    });
    expect(header()).toHaveAttribute("data-cta", "shown");
  });

  it("always shows the bar button on pages without a hero button", () => {
    mountPage(false);
    expect(header()).toHaveAttribute("data-cta", "shown");
  });
});
