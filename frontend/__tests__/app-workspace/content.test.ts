import { expect, it } from "vitest";
import { contentHtml } from "@/lib/app-workspace/content";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";

it("places a chip only on a line containing its quoted text despite stale offsets", () => {
  const fixes: WorkspaceFix[] = [
    {
      id: "one",
      section: "Experience",
      before:
        "Built Python dashboards   that reduced weekly reporting time by 20%.",
      after: "Improved reports",
      explanation: "",
      label: "No number",
      points: 1,
    },
  ];
  const html = contentHtml(
    "Mira Solana\nDesigned SQL reports for sales operations.\nBuilt Python dashboards that reduced weekly reporting time by 20%.",
    fixes,
  );
  expect(html).toContain("<p>Designed SQL reports for sales operations.</p>");
  expect(html).toContain('data-fix-id="one"');
  expect(html.indexOf('data-fix-id="one"')).toBeGreaterThan(
    html.indexOf("Designed SQL"),
  );
});

it("omits a chip when quoted text is absent", () => {
  const fix: WorkspaceFix = {
    id: "one",
    section: "Experience",
    before: "No such quote",
    after: "Improved",
    explanation: "",
    label: "Vague verb",
    points: 1,
  };
  expect(
    contentHtml("Mira Solana\nDesigned SQL reports.", [fix]),
  ).not.toContain("data-fix-id");
});
