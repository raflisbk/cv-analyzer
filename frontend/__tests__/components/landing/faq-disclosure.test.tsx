import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { expect, test, vi } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import FaqSection from "@/components/landing/sections/faq/faq-section";
import landingEn from "@/lib/i18n/dictionaries/landing-en";
import landingId from "@/lib/i18n/dictionaries/landing-id";

vi.mock("@/hooks/use-landing-story", () => ({
  useLandingStory: () => useRef<HTMLDivElement>(null),
}));

function renderFaq() {
  render(
    <I18nProvider initialLocale="en">
      <FaqSection />
    </I18nProvider>,
  );
  return screen.getAllByRole("button");
}

test("first question starts open and the rest closed", () => {
  const buttons = renderFaq();
  expect(buttons[0].getAttribute("aria-expanded")).toBe("true");
  expect(buttons[1].getAttribute("aria-expanded")).toBe("false");
});

test("button controls a labelled region", () => {
  const [first] = renderFaq();
  const region = document.getElementById(first.getAttribute("aria-controls")!);
  expect(region?.getAttribute("role")).toBe("region");
  expect(region?.getAttribute("aria-labelledby")).toBe(first.id);
});

test("click closes an open item and reopens it", () => {
  const [first] = renderFaq();
  fireEvent.click(first);
  expect(first.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(first);
  expect(first.getAttribute("aria-expanded")).toBe("true");
});

test("opening one item closes the previous one", () => {
  const buttons = renderFaq();
  fireEvent.click(buttons[2]);
  expect(buttons[2].getAttribute("aria-expanded")).toBe("true");
  expect(buttons[0].getAttribute("aria-expanded")).toBe("false");
  expect(
    buttons.filter((b) => b.getAttribute("aria-expanded") === "true"),
  ).toHaveLength(1);
});

test("items are native buttons so Enter and Space toggle them", () => {
  const buttons = renderFaq();
  expect(buttons.every((b) => b.tagName === "BUTTON")).toBe(true);
  expect(buttons[0].getAttribute("type")).toBe("button");
});

test("English and Indonesian faq blocks share the same keys", () => {
  const keys = (faq: { items: Record<string, object> }) => [
    Object.keys(faq).sort(),
    Object.keys(faq.items).sort(),
    ...Object.values(faq.items).map((i) => Object.keys(i).sort()),
  ];
  expect(keys(landingId.faq)).toEqual(keys(landingEn.faq));
});
