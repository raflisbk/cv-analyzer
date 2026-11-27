import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { withLocale } from "../i18n/with-locale";
import { ReportHistory } from "@/components/app-report/report-history";
import { HistoryVersionCard } from "@/components/app-workspace/panel/history-version-card";
import type { VersionData } from "@/lib/app-api/history.types";

vi.mock("@/components/app-report/report-heading", () => ({
  ReportHeading: () => null,
}));
vi.mock("@/components/app-report/report-history-chart", () => ({
  ReportHistoryChart: () => null,
}));

afterEach(cleanup);

const first = {
  label: "v1",
  score: 60,
  at: "2026-11-01",
  summary: "First analysis.",
  summaryKind: "first" as const,
  changedDimension: null,
  changedDelta: null,
};
const second = {
  label: "v2",
  score: 65,
  at: "2026-11-02",
  summary: "Score +5; impact +3.",
  summaryKind: "changed" as const,
  changedDimension: "impact" as const,
  changedDelta: 3,
};

describe("report history summaries", () => {
  it("shows translated sentences in Indonesian", () => {
    render(
      withLocale(
        <ReportHistory versions={[first, second]} projectedScore={80} />,
        "id",
      ),
    );
    expect(screen.getByText("Analisis pertama.")).toBeInTheDocument();
    expect(screen.getByText("Skor +5; dampak +3.")).toBeInTheDocument();
  });

  it("shows the legacy summary for payloads without the new fields", () => {
    const legacy = {
      label: "v1",
      score: 60,
      at: "2026-11-01",
      summary: "Old text.",
    };
    render(
      withLocale(
        <ReportHistory versions={[legacy]} projectedScore={80} />,
        "id",
      ),
    );
    expect(screen.getByText("Old text.")).toBeInTheDocument();
  });
});

describe("history version card summaries", () => {
  const version: VersionData = {
    ...second,
    id: "job-2",
    delta: 5,
    current: true,
  };

  it("shows the translated sentence in Indonesian", () => {
    render(
      withLocale(
        <HistoryVersionCard
          version={version}
          onCompare={vi.fn()}
          onRestore={vi.fn()}
        />,
        "id",
      ),
    );
    expect(screen.getByText(/Skor \+5; dampak \+3\./)).toBeInTheDocument();
  });

  it("shows the English sentence in English", () => {
    render(
      withLocale(
        <HistoryVersionCard
          version={version}
          onCompare={vi.fn()}
          onRestore={vi.fn()}
        />,
        "en",
      ),
    );
    expect(screen.getByText(/Score \+5; impact \+3\./)).toBeInTheDocument();
  });
});
