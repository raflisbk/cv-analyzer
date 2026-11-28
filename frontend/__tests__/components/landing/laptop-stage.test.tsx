import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { I18nProvider } from "@/components/i18n/i18n-provider";
import LaptopStage from "@/components/landing/sections/laptop/laptop-stage";

const html = renderToStaticMarkup(
  <I18nProvider initialLocale="id">
    <LaptopStage />
  </I18nProvider>,
);

describe("laptop stage markup", () => {
  it("renders the WebGL host and keeps the sample scene as real DOM", () => {
    expect(html).toContain("data-laptop-canvas");
    expect(html).toContain("data-laptop-screen");
    expect(html).toContain("data-laptop-scene");
  });

  it("no longer builds the laptop body from DOM", () => {
    expect(html).not.toContain("data-laptop-lid");
    expect(html).not.toContain("data-laptop-sweep");
  });
});
