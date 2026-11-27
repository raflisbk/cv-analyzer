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
  it("builds the laptop from DOM, with no raster canvas", () => {
    expect(html).not.toContain("<canvas");
    expect(html).toContain("data-laptop-lid");
    expect(html).toContain("data-laptop-screen");
  });

  it("puts the lid back mark and the sample scene on opposite faces", () => {
    expect(html).toContain("/landing/logo/pathkr-icon.svg");
    expect(html).toContain("data-laptop-scene");
  });
});
