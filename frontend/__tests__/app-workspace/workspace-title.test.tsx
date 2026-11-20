import { screen } from "@testing-library/react";
import { render } from "../i18n/render-with-locale";
import { expect, it } from "vitest";
import { WorkspaceTitle } from "@/components/app-workspace/workspace-title";

it("shows the current version supplied by history", () => {
  render(
    <WorkspaceTitle
      name="Mira.pdf"
      role="Analyst"
      version="v3"
      saveState="saved"
    />,
  );
  expect(screen.getByText("Analyst · v3 · Saved")).toBeInTheDocument();
});
