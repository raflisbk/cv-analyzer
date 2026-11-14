import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import ReportSection from "@/components/landing/sections/report/report-section";
import FeaturesSection from "@/components/landing/sections/features/features-section";
import { NAV_LINKS } from "@/components/landing/navbar/nav-links";
import { landingFacts } from "@/lib/landing-facts";

const frontend = process.cwd();
const page = readFileSync(join(frontend, "app/page.tsx"), "utf8");
const dots = readFileSync(
  join(frontend, "components/landing/section-dots.tsx"),
  "utf8",
);

function landingSources(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? landingSources(path) : [path];
  });
}

it("keeps page, dots, and navigation aligned on eight sections", () => {
  const names = [
    ...page
      .split("<main data-landing>")[1]
      .split("</main>")[0]
      .matchAll(/<(\w+Section) \/>/g),
  ].map((match) => match[1]);
  const ids = names.map((name) => {
    const source = page.match(new RegExp(`import ${name} from "@/(.*?)"`))?.[1];
    expect(source, name).toBeTruthy();
    const component = readFileSync(join(frontend, `${source}.tsx`), "utf8");
    return component.match(/id="([^"]+)"/)?.[1];
  });
  const dotIds = [...dots.matchAll(/\{ id: "([^"]+)", label:/g)].map(
    (match) => match[1],
  );
  expect(ids).toEqual([
    "hero",
    "products",
    "report",
    "features",
    "how",
    "inside",
    "faq",
    "start",
  ]);
  expect(dotIds).toEqual(ids);
  expect(
    NAV_LINKS.map(({ href }) => href.slice(1)).every((id) => ids.includes(id)),
  ).toBe(true);
});

it("leaves no retired section references in landing code", () => {
  const paths = [
    ...landingSources(join(frontend, "components/landing")),
    ...landingSources(join(frontend, "lib")).filter((path) =>
      /landing-[^/]+\.ts$/.test(path),
    ),
    join(frontend, "app/page.tsx"),
  ];
  for (const path of paths) {
    expect(readFileSync(path, "utf8"), path).not.toMatch(
      /#stickers|#stats|["']stickers["']|["']stats["']|StickersSection|StatsSection|stats-section|landing-stickers/,
    );
  }
});

it("renders the score demo and three distinct supporting demos", () => {
  const html = renderToStaticMarkup(<ReportSection />);
  expect(html).toContain("Accept rewrite");
  expect(html).toContain("Job match");
  expect(html).toContain("ATS ready");
  expect(html).toContain("SQL");
  expect(html).toContain("A/B testing");
  expect(html).not.toContain("Why people stick with it");
});

it("renders computed facts in the merged inside section", () => {
  const html = renderToStaticMarkup(<FeaturesSection />);
  expect(html).toContain(`data-value="${landingFacts.scoreDimensions}"`);
  expect(html).toContain(`data-value="${landingFacts.atsCheckCount}"`);
  expect(html).toContain(`data-value="${landingFacts.exportTemplateCount}"`);
});
