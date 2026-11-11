import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AtsPane } from "@/components/app-workspace/panel/ats-pane";
import { GrammarPane } from "@/components/app-workspace/panel/grammar-pane";
import { HistoryPane } from "@/components/app-workspace/panel/history-pane";
import { ReportPane } from "@/components/app-workspace/panel/report-pane";
import { FixesPane } from "@/components/app-workspace/panel/fixes-pane";

it("shows an ATS request failure", () => {
  render(<AtsPane error={new Error("offline")} onExport={() => {}} />);
  expect(screen.getByRole("alert")).toHaveTextContent("could not load");
});

it("shows a report request failure", () => {
  render(
    <ReportPane
      scores={null}
      error
      fixCount={0}
      bonus={0}
      openFixes={() => {}}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Report could not load");
});

it("shows a fixes request failure", () => {
  render(<FixesPane fixes={[]} error onApply={() => false} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Fixes could not load");
});

it("shows a grammar request failure", () => {
  render(
    <GrammarPane
      error={new Error("offline")}
      resolved={new Set()}
      onResolve={async () => {}}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("could not load");
});

it("shows an empty version history", () => {
  render(<HistoryPane jobId="job" versions={[]} />);
  expect(
    screen.getByText("No versions have been saved yet."),
  ).toBeInTheDocument();
});
