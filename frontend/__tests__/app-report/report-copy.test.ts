import { describe, expect, it } from "vitest";
import appReportCopyEn from "@/lib/i18n/dictionaries/app-report-copy-en";
import appReportCopyId from "@/lib/i18n/dictionaries/app-report-copy-id";
import { format, getDictionary } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locales";
import {
  reportAtsFacts,
  reportBulletTags,
  reportFacts,
  reportFixTitle,
  reportMetric,
  reportSectionNote,
  reportVerdict,
} from "@/lib/app-report/copy";
import { reportDetailFixture } from "@/lib/app-api/fixtures/report-detail";

function translator(locale: Locale) {
  const dictionary = getDictionary(locale);
  return (key: string, vars?: Record<string, string | number>) => {
    const value = key
      .split(".")
      .reduce<unknown>(
        (node, part) => (node as Record<string, unknown>)?.[part],
        dictionary,
      );
    return typeof value === "string" ? format(value, vars) : key;
  };
}

function leafKeys(node: object, prefix = ""): string[] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : leafKeys(value, `${prefix}${key}.`),
  );
}

describe("report copy dictionaries", () => {
  it("keeps the same keys in both locales", () => {
    expect(leafKeys(appReportCopyId)).toEqual(leafKeys(appReportCopyEn));
  });

  it("keeps the pathy bubble and fix label keys in both locales", () => {
    for (const key of [
      "pathy.ui.scoreBubble",
      "pathy.ui.pointsBubble",
      "pathy.ui.readingBubble",
      "pathy.ui.scoreReadyBubble",
      "appWorkspacePanel.fixes.labels.noNumber",
      "appWorkspacePanel.fixes.labels.vagueVerb",
      "appWorkspacePanel.fixes.labels.missingSection",
    ]) {
      expect(translator("id")(key)).not.toBe(key);
      expect(translator("en")(key)).not.toBe(key);
      expect(translator("id")(key)).not.toBe(translator("en")(key));
    }
  });
});

describe("report copy helpers", () => {
  it("renders the verdict in both locales from its key", () => {
    const verdict = { key: "room", title: "Room to improve", body: "x" };
    expect(reportVerdict(translator("en"), verdict).title).toBe(
      "Room to improve",
    );
    expect(reportVerdict(translator("id"), verdict).title).toBe(
      "Masih bisa lebih baik",
    );
  });

  it("falls back to the backend text without a key", () => {
    const verdict = { title: "Old title", body: "Old body" };
    expect(reportVerdict(translator("id"), verdict)).toEqual(verdict);
  });

  it("builds facts from numbers and falls back to text", () => {
    const data = {
      ...reportDetailFixture,
      facts: ["2 pages", "9 bullets", "180 words", "a", "b"],
      factCounts: { pages: 2, bullets: 9, words: 180 },
    };
    expect(reportFacts(translator("id"), data).slice(0, 3)).toEqual([
      "2 halaman",
      "9 poin",
      "180 kata",
    ]);
    expect(reportFacts(translator("id"), data)[3]).toContain("Perkiraan");
    const legacy = { ...data, factCounts: undefined } as never;
    expect(reportFacts(translator("id"), legacy)).toEqual(data.facts);
  });

  it("translates ats facts from structured fields", () => {
    const ats = {
      ...reportDetailFixture.ats,
      format: "PDF",
      pages: 1,
      sizeKb: 212,
    };
    expect(reportAtsFacts(translator("id"), ats)).toEqual([
      "PDF",
      "1 halaman",
      "212 KB",
    ]);
  });

  it("translates fix titles for known pairs and composed pairs", () => {
    const t = translator("id");
    const base = { text: "", points: 1, title: "English" };
    expect(
      reportFixTitle(t, {
        ...base,
        section: "experience",
        type: "action_verb",
      }),
    ).toBe("Pengalaman: pakai kata kerja aksi");
    expect(
      reportFixTitle(t, {
        ...base,
        section: "Projects",
        type: "impact_metric",
      }),
    ).toBe("Proyek: tunjukkan dampaknya dengan angka");
    expect(reportFixTitle(t, base)).toBe("English");
  });

  it("translates bullet tags, section notes and metrics", () => {
    const t = translator("id");
    const bullet = {
      ...reportDetailFixture.bullets[0],
      tags: ["Action verb"],
      tagKeys: ["actionVerb"],
    };
    expect(reportBulletTags(t, bullet)).toEqual(["Kata kerja aksi"]);
    const section = {
      ...reportDetailFixture.sections[0],
      noteKey: "empty",
    };
    expect(reportSectionNote(t, section)).toBe("Bagian ini masih kosong.");
    expect(
      reportMetric(t, {
        key: "activeVoice",
        label: "Active voice",
        count: 3,
        total: 9,
        value: "3 of 9",
        percent: 33,
      }),
    ).toEqual({ label: "Kalimat aktif", value: "3 dari 9" });
  });
});
