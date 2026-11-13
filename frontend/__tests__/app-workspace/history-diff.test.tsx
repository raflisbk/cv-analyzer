import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { HistoryDiff } from "@/components/app-workspace/panel/history-diff";
import { getVersionDiff } from "@/lib/app-api/history";

it("retains all mock comparison changes", async () => {
  const diff = await getVersionDiff("job", "v1");
  expect(Array.isArray(diff)).toBe(true);
  render(<HistoryDiff diff={diff} />);
  expect(screen.getByText("recieve")).toBeInTheDocument();
  expect(screen.getByText("receive")).toBeInTheDocument();
});
