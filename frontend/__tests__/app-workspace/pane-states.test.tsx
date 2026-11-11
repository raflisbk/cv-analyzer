import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AtsPane } from "@/components/app-workspace/panel/ats-pane";
import { GrammarPane } from "@/components/app-workspace/panel/grammar-pane";
import { HistoryPane } from "@/components/app-workspace/panel/history-pane";

it("shows an ATS request failure", () => {
  render(<AtsPane error={new Error("offline")} onExport={() => {}} />);
  expect(screen.getByRole("alert")).toHaveTextContent("could not load");
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
