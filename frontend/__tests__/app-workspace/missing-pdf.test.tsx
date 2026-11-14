import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { PdfViewer } from "@/components/app-workspace/pdf/pdf-viewer";

it("explains when the original file URL is missing", () => {
  render(<PdfViewer file={null} containerWidth={600} />);
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Original file unavailable",
  );
});
