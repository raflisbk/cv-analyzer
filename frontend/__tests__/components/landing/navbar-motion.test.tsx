import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
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
      <ThemeProvider initialTheme="light">
        <I18nProvider initialLocale="en">
          <Navbar />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>,
    { container: document.getElementById("root")! },
  );
}

function header() {
  return document.querySelector<HTMLElement>("[data-landing-nav]")!;
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

describe("landing navbar section tone in a gap", () => {
  it("picks the lower section when two share the sample band", () => {
    mountPage(true);
    const observer = intersectionObservers.find((item) =>
      item.targets.some((target) => target.id === "a"),
    )!;
    act(() =>
      observer.callback([
        { isIntersecting: true, target: document.getElementById("b")! },
        { isIntersecting: true, target: document.getElementById("a")! },
      ]),
    );
    expect(header()).toHaveAttribute("data-tone", "ink");
  });
});

describe("landing navbar call to action", () => {
  it("never renders a bar button beside the login link", () => {
    mountPage(true);
    expect(document.querySelector("[data-nav-cta]")).toBeNull();
    expect(header()).not.toHaveAttribute("data-cta");
  });

  it("keeps login as the only action link in the bar", () => {
    mountPage(true);
    const actions = header().querySelectorAll('a[href="/app"]');
    expect(actions).toHaveLength(1);
    expect(actions[0]).toHaveAttribute("aria-label", "Log in");
  });
});
