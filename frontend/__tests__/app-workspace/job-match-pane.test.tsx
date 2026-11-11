import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { JobMatchPane } from "@/components/app-workspace/panel/job-match-pane";

it("asks for a job description before matching", async () => {
  const user = userEvent.setup();
  render(<JobMatchPane jobId="job" onAdd={() => true} openFixes={() => {}} />);
  await user.clear(screen.getByRole("textbox", { name: "Job description" }));
  await user.click(screen.getByRole("button", { name: "Match with my CV" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Paste a job description first.",
  );
});
