import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { expect, test, vi } from "vitest";
import { useLandingFaq } from "@/hooks/use-landing-faq";

vi.mock("@/hooks/use-landing-story", () => ({
  useLandingStory: () => useRef<HTMLDivElement>(null),
}));

function Example() {
  const { ref, open, toggle } = useLandingFaq();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} data-testid="faq">
      <button onClick={() => toggle(2)}>Choose</button>
      <span>{open}</span>
    </div>
  );
}

test("FAQ follows scroll until the visitor chooses a question", () => {
  render(<Example />);
  const faq = screen.getByTestId("faq");
  fireEvent(faq, new CustomEvent("landing-faq-step", { detail: 1 }));
  expect(screen.getByText("1")).toBeTruthy();
  fireEvent.click(screen.getByText("Choose"));
  fireEvent(faq, new CustomEvent("landing-faq-step", { detail: 3 }));
  expect(screen.getByText("2")).toBeTruthy();
});
