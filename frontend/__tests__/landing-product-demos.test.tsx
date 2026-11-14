import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScoreBarsDemo from "@/components/landing/product-demos/score-bars-demo";
import MatchDemo from "@/components/landing/product-demos/match-demo";
import RewriteDemo from "@/components/landing/product-demos/rewrite-demo";
import ExportDemo from "@/components/landing/product-demos/export-demo";
import BuilderDemo from "@/components/landing/product-demos/builder-demo";
import RolesDemo from "@/components/landing/product-demos/roles-demo";
import ScoreRing from "@/components/landing/product-demos/score-ring";

describe("landing product demos", () => {
  it("shows four score dimensions with accessible values", () => {
    render(<ScoreBarsDemo />);
    expect(screen.getAllByRole("meter")).toHaveLength(4);
    expect(
      screen
        .getByRole("meter", { name: "Impact" })
        .getAttribute("aria-valuenow"),
    ).toBe("82");
    expect(
      screen
        .getByRole("meter", { name: "Relevance" })
        .getAttribute("aria-valuenow"),
    ).toBe("82");
  });

  it("shows match evidence and a missing requirement", () => {
    render(<MatchDemo />);
    expect(
      screen.getByRole("img", { name: "Overall score 78 out of 100" }),
    ).toBeTruthy();
    expect(screen.getByText("Not shown in CV")).toBeTruthy();
    expect(screen.getAllByText("Met")).toHaveLength(2);
  });

  it("shows the source line and accepted rewrite", () => {
    render(<RewriteDemo />);
    expect(
      screen.getByText("Led a team of developers on the checkout rebuild."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Sample accepted rewrite")).toBeTruthy();
  });

  it("shows an ATS-ready page and templates", () => {
    render(<ExportDemo />);
    const page = screen.getByRole("img", { name: /ATS-ready PDF preview/ });
    expect(within(page).getByText("Samuel Samdono")).toBeTruthy();
    expect(screen.getByText("Classic")).toBeTruthy();
  });

  it("shows builder sections and role match rows", () => {
    render(
      <>
        <BuilderDemo />
        <RolesDemo />
      </>,
    );
    expect(screen.getByRole("img", { name: /Blank CV page/ })).toBeTruthy();
    expect(screen.getByText("Experience")).toBeTruthy();
    expect(screen.getByText("Senior Product Designer")).toBeTruthy();
    expect(screen.getByText("78% match")).toBeTruthy();
  });

  it("labels the overall score", () => {
    render(<ScoreRing />);
    expect(
      screen.getByRole("img", { name: "Overall score 86 out of 100" }),
    ).toBeTruthy();
  });
});
