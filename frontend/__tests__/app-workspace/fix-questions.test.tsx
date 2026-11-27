import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { render } from "../i18n/render-with-locale";
import { FixCardInputs } from "@/components/app-workspace/panel/fix-card-inputs";
import {
  FIX_QUESTION_NAMES,
  fixQuestionName,
  resolveFixQuestion,
} from "@/lib/app-workspace/fix-questions";
import { getDictionary } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locales";

function translate(locale: Locale, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      getDictionary(locale),
    );
  return typeof value === "string" ? value : key;
}

const TOKENS = [
  "[%]",
  "[amount]",
  "[N]",
  "[how many?]",
  "[timeframe]",
  "[team size]",
  "[year]",
  "[month year]",
  "[project name]",
];

it.each(["id", "en"] as const)("maps every known token in %s", (locale) => {
  const t = (key: string) => translate(locale, key);
  for (const token of TOKENS) {
    const text = resolveFixQuestion({ token, question: "x" }, t);
    expect(text).not.toBe("");
    expect(text).not.toContain("appWorkspacePanel");
  }
});

it("keeps key parity between locales", () => {
  for (const name of FIX_QUESTION_NAMES) {
    const key = `appWorkspacePanel.fixes.questions.${name}`;
    expect(translate("id", key)).not.toBe(key);
    expect(translate("en", key)).not.toBe(key);
  }
  const key = "appWorkspacePanel.fixes.answerPlaceholder";
  expect(translate("id", key)).not.toBe(key);
  expect(translate("en", key)).not.toBe(key);
});

it("derives a readable label for unknown tokens", () => {
  const t = (key: string) => key;
  expect(fixQuestionName("[technologies?]")).toBeNull();
  expect(
    resolveFixQuestion(
      { token: "[technologies?]", question: "technologies?" },
      t,
    ),
  ).toBe("Technologies?");
  expect(
    resolveFixQuestion(
      { token: "[tools used?]", question: "[tools used?]" },
      t,
    ),
  ).toBe("Tools used?");
});

it.each([
  ["id", "Tahun berapa?"],
  ["en", "What year?"],
] as const)("renders the translated question in %s", (locale, text) => {
  render(
    <FixCardInputs
      inputs={[{ token: "[year]", question: "What year?" }]}
      answers={{}}
      setAnswers={() => {}}
    />,
    locale,
  );
  expect(screen.getByLabelText(text)).toBeInTheDocument();
});
