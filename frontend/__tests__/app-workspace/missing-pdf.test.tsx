import { screen } from "@testing-library/react";
import { render } from "../i18n/render-with-locale";
import { expect, it } from "vitest";
import { PdfViewer } from "@/components/app-workspace/pdf/pdf-viewer";

it("explains when the original file URL is missing", () => {
  render(<PdfViewer url={null} containerWidth={600} />);
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Original file unavailable",
  );
});
