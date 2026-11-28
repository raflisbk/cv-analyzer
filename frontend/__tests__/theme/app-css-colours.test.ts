import { readdirSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseRules, readSource } from "./css-blocks";

const appFolders = [
  "app-shell",
  "app-chat",
  "app-home",
  "app-cvs",
  "app-reports",
  "app-report",
  "app-workspace",
  "app-export",
  "pathy",
];

const shadowProperties = new Set([
  "box-shadow",
  "filter",
  "mask-image",
  "text-shadow",
]);
const rawColour = /#[0-9a-fA-F]{3,8}\b|rgba?\(|\bwhite\b|\bblack\b/;

interface Allowance {
  file: string;
  selector: string;
  reason: string;
}

const allowances: Allowance[] = [
  {
    file: "app-cvs/cvs.module.css",
    selector: ".thumbnail",
    reason: "mini document sheet stays paper",
  },
  {
    file: "app-export/export-dialog.module.css",
    selector: ".thumbnail",
    reason: "template thumbnails are documents",
  },
  {
    file: "app-export/export-dialog.module.css",
    selector: ".originalBadge",
    reason: "white label on fixed red badge",
  },
  {
    file: "app-export/export-options.module.css",
    selector: ".score",
    reason: "ring track tint on both surfaces",
  },
  {
    file: "app-export/export-options.module.css",
    selector: ".download",
    reason: "brand punk gradient, dark label",
  },
  {
    file: "app-export/export-preview.module.css",
    selector: "",
    reason: "export preview renders the exported document",
  },
  {
    file: "app-home/home-thread.module.css",
    selector: ".steps b",
    reason: "translucent red tint readable on both",
  },
  {
    file: "app-report/report.module.css",
    selector: ".yellow",
    reason: "punk card pins its own ink colours",
  },
  {
    file: "app-report/report.module.css",
    selector: ".deep .facts span",
    reason: "translucent white on deep card",
  },
  {
    file: "app-reports/report-insights.module.css",
    selector: ".fix",
    reason: "translucent white on deep card",
  },
  {
    file: "app-shell/drawer.module.css",
    selector: "",
    reason: "translucent white on deep drawer",
  },
  {
    file: "app-workspace/workspace-panel-content.module.css",
    selector: "",
    reason: "translucent overlays on deep panel",
  },
  {
    file: "app-workspace/workspace-panel-layout.module.css",
    selector: "",
    reason: "translucent overlays on deep panel",
  },
  {
    file: "app-workspace/workspace-common.module.css",
    selector: ".switch",
    reason: "translucent red tint on page",
  },
  {
    file: "app-workspace/workspace-editor.module.css",
    selector: "suggestion-highlight",
    reason: "highlight sits on paper sheet",
  },
  {
    file: "pathy/help.module.css",
    selector: ".helpButton",
    reason: "darker punk edge for the button",
  },
  {
    file: "pathy/pathy.module.css",
    selector: ".tourOverlay",
    reason: "scrim stays dark red in both themes",
  },
];

const punkGradient = /#fbff7a|#ffff89|#cfdc00|#d7df00|#f5ff54|#bbd100|#e8fa00/;

function cssModules(): string[] {
  return appFolders.flatMap((folder) =>
    readdirSync(path.resolve(__dirname, "../../components", folder))
      .filter((name) => name.endsWith(".css"))
      .map((name) => `${folder}/${name}`),
  );
}

function violations(file: string): string[] {
  const found: string[] = [];
  for (const rule of parseRules(readSource(`components/${file}`))) {
    for (const [property, value] of rule.declarations) {
      if (shadowProperties.has(property) || !rawColour.test(value)) continue;
      if (
        value.includes("var(--app-") &&
        !/#[0-9a-f]{3,8}\b/i.test(value.replace(/var\([^)]*\)/g, ""))
      )
        continue;
      if (punkGradient.test(value)) continue;
      const allowed = allowances.some(
        (item) => item.file === file && rule.selector.includes(item.selector),
      );
      if (!allowed) found.push(`${rule.selector} { ${property}: ${value} }`);
    }
  }
  return found;
}

describe("app css colours", () => {
  it.each(cssModules())("%s has no unexplained raw colours", (file) => {
    expect(violations(file)).toEqual([]);
  });

  it("explains every allowance", () => {
    expect(allowances.every((item) => item.reason.length > 10)).toBe(true);
  });

  it("scans at least the known app stylesheets", () => {
    expect(cssModules().length).toBeGreaterThan(20);
  });
});
