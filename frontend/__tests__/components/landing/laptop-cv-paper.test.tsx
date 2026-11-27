import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { I18nProvider } from "@/components/i18n/i18n-provider";
import CvPaper from "@/components/landing/sections/laptop/scene/cv-paper";
import { laptopInsights } from "@/lib/landing-laptop-insights";

const SECTION_ORDER = [
  "contact",
  "summary",
  "payly",
  "edit",
  "brightly",
  "projects",
  "education",
  "skills",
  "certs",
  "lang",
];

function paperMarkup(locale: "id" | "en") {
  return renderToStaticMarkup(
    <I18nProvider initialLocale={locale}>
      <CvPaper />
    </I18nProvider>,
  );
}

function paperRule(selector: string) {
  const css = postcss.parse(
    readFileSync(
      "components/landing/sections/laptop/scene/paper.module.css",
      "utf8",
    ),
  );
  let found: Record<string, string> = {};
  css.walkRules(selector, (rule) => {
    rule.walkDecls((decl) => {
      found = { ...found, [decl.prop]: decl.value };
    });
  });
  return found;
}

describe.each(["id", "en"] as const)("sample CV paper in %s", (locale) => {
  const html = paperMarkup(locale);

  it("lists the sections in a consistent reading order", () => {
    const keys = [...html.matchAll(/data-sc-section="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(keys).toEqual(SECTION_ORDER);
  });

  it("keeps a section for every insight target", () => {
    laptopInsights
      .filter((insight) => insight.target)
      .forEach((insight) => {
        expect(html).toContain(insight.target.replace(/'/g, '"').slice(1, -1));
      });
  });

  it("has a name header and no avatar or analyzer tags on the sheet", () => {
    expect(html).toContain("Samuel Samdono");
    expect(html).not.toContain("✓");
    expect(html).not.toMatch(/<i class="[^"]*avatar/);
  });
});

describe("sample CV paper css", () => {
  it("is an A4 sheet with small body text", () => {
    const paper = paperRule(".paper");
    expect(paper["aspect-ratio"]).toBe("1 / 1.4142");
    expect(paper.width).toBeUndefined();
    const bodySize = Number(paper.font.match(/(\d+(?:\.\d+)?)px/)?.[1]);
    expect(bodySize).toBeLessThanOrEqual(9);
  });

  it("stops the calm section from inflating paragraph text", () => {
    const paragraph = paperRule(".paper.paper p");
    expect(paragraph["font-size"]).toBe("inherit");
    expect(paragraph["max-width"]).toBe("none");
  });
});
