import { readFileSync } from "fs";
import path from "path";

export interface CssRule {
  selector: string;
  declarations: Array<[string, string]>;
}

export function readSource(relativePath: string): string {
  return readFileSync(path.resolve(__dirname, "../..", relativePath), "utf8");
}

export function parseRules(css: string): CssRule[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: CssRule[] = [];
  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations = [...match[2].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(
      (entry): [string, string] => [entry[1], entry[2].trim()],
    );
    rules.push({ selector: match[1].trim(), declarations });
  }
  return rules;
}

export function customProperties(
  rules: CssRule[],
  selectorPattern: RegExp,
): Map<string, string> {
  const properties = new Map<string, string>();
  for (const rule of rules) {
    if (!selectorPattern.test(rule.selector)) continue;
    for (const [name, value] of rule.declarations) {
      if (name.startsWith("--")) properties.set(name, value);
    }
  }
  return properties;
}
