import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { useFaqSection } from "@/components/landing/sections/faq/use-faq-section";
import { FAQ_REFRESH_DELAY_MS } from "@/lib/landing-faq";

const refresh = vi.fn();
const story = vi.fn();

vi.mock("@/hooks/use-landing-story", () => ({
  useLandingStory: (...args: unknown[]) => {
    story(...args);
    return useRef<HTMLDivElement>(null);
  },
}));
vi.mock("@/lib/gsap-loader", () => ({
  loadGsap: () => Promise.resolve({ ScrollTrigger: { refresh } }),
}));

function Example() {
  const { ref, open, toggle } = useFaqSection();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <button onClick={() => toggle(3)}>Choose</button>
      <span>{String(open)}</span>
    </div>
  );
}

async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(FAQ_REFRESH_DELAY_MS + 10);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  refresh.mockClear();
  story.mockClear();
});
afterEach(() => vi.useRealTimers());

test("scroll triggers refresh after the open item changes", async () => {
  render(<Example />);
  await settle();
  refresh.mockClear();
  fireEvent.click(screen.getByText("Choose"));
  expect(refresh).not.toHaveBeenCalled();
  await settle();
  expect(refresh).toHaveBeenCalledTimes(1);
});

test("FAQ story scrolls through instead of pinning the panel height", () => {
  render(<Example />);
  expect(story.mock.calls[0][3]).toEqual({ start: "top 75%", end: "top 15%" });
});
