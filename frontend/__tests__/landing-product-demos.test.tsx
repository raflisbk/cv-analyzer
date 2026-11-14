import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScoreBarsDemo from "@/components/landing/product-demos/score-bars-demo";
import MatchDemo from "@/components/landing/product-demos/match-demo";
import RewriteDemo from "@/components/landing/product-demos/rewrite-demo";
import ExportDemo from "@/components/landing/product-demos/export-demo";
import BuilderDemo from "@/components/landing/product-demos/builder-demo";
import RolesDemo from "@/components/landing/product-demos/roles-demo";
import ScoreRing from "@/components/landing/product-demos/score-ring";
import { I18nProvider } from "@/components/i18n/i18n-provider";

describe("landing product demos", () => {
  it("shows four score dimensions with accessible values", () => {
    render(
      <I18nProvider initialLocale="en">
        <ScoreBarsDemo />
      </I18nProvider>,
    );
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
    render(
      <I18nProvider initialLocale="en">
        <MatchDemo />
      </I18nProvider>,
    );
    expect(
      screen.getByRole("img", { name: "Job match: 78 out of 100" }),
    ).toBeTruthy();
    expect(screen.getByText("No matching line in this CV")).toBeTruthy();
    expect(screen.getAllByText("Found")).toHaveLength(2);
  });

  it("shows the source line and accepted rewrite", () => {
    render(
      <I18nProvider initialLocale="en">
        <RewriteDemo />
      </I18nProvider>,
    );
    expect(
      screen.getByText("Led a team of developers on the checkout rebuild."),
    ).toBeTruthy();
    expect(screen.getByLabelText("Sample accepted rewrite")).toBeTruthy();
  });

  it("shows an ATS-ready page and templates", () => {
    render(
      <I18nProvider initialLocale="en">
        <ExportDemo />
      </I18nProvider>,
    );
    const page = screen.getByRole("img", { name: /Sample ATS PDF preview/ });
    expect(within(page).getByText("Samuel Samdono")).toBeTruthy();
    expect(screen.getByText("Classic")).toBeTruthy();
  });

  it("shows builder sections and role match rows", () => {
    render(
      <I18nProvider initialLocale="en">
        <BuilderDemo />
        <RolesDemo />
      </I18nProvider>,
    );
    expect(screen.getByRole("img", { name: /Blank CV template/ })).toBeTruthy();
    expect(screen.getByText("Experience")).toBeTruthy();
    expect(screen.getByText("Senior Product Designer")).toBeTruthy();
    expect(screen.getByText("78% match")).toBeTruthy();
  });

  it("labels the overall score", () => {
    render(
      <I18nProvider initialLocale="en">
        <ScoreRing />
      </I18nProvider>,
    );
    expect(
      screen.getByRole("img", { name: "Overall score: 86 out of 100" }),
    ).toBeTruthy();
  });
});
