import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { PanelTabs } from "@/components/app-workspace/panel-tabs";
import type { WorkspaceTab } from "@/components/app-workspace/workspace-panel";

function TabsFixture() {
  const [tab, setTab] = useState<WorkspaceTab>("report");
  return <PanelTabs tab={tab} setTab={setTab} fixCount={3} grammarCount={7} />;
}

it("moves focus and selection with arrow keys", async () => {
  const user = userEvent.setup();
  render(<TabsFixture />);
  const report = screen.getByRole("tab", { name: "Report" });
  report.focus();
  await user.keyboard("{ArrowRight}");
  const fixes = screen.getByRole("tab", { name: "Fixes3" });
  expect(fixes).toHaveFocus();
  expect(fixes).toHaveAttribute("aria-selected", "true");
  expect(report).toHaveAttribute("aria-selected", "false");
});

it("scrolls the active tab into view", async () => {
  const user = userEvent.setup();
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  render(<TabsFixture />);
  await user.click(screen.getByRole("tab", { name: "Chat" }));
  expect(scrollIntoView).toHaveBeenCalledWith({
    block: "nearest",
    inline: "nearest",
    behavior: "instant",
  });
});
