import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IntroLoader from "@/components/landing/intro/intro-loader";

vi.mock("@/hooks/use-landing-intro", () => ({ useLandingIntro: () => null }));

describe("landing intro wordmark", () => {
  it("keeps the last r red and the inserted a, r, i in ink", () => {
    const { container } = render(<IntroLoader />);
    const expanded = container.querySelector("[data-intro-expanded]")!;
    expect(expanded.textContent).toBe("path karir");
    expect(
      Array.from(
        expanded.querySelectorAll("b"),
        (letter) => letter.textContent,
      ),
    ).toEqual(["a", "r", "i"]);
    expect(expanded.lastChild?.textContent).toBe("r");
  });
});
