import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineEditPreview } from "@/components/app-workspace/pdf/inline-edit-preview";

describe("inline edit preview", () => {
  it("shows the proposed rewrite and applies it on request", () => {
    const onApply = vi.fn();
    render(
      <InlineEditPreview
        preview={{ original: "Original line", rewritten: "Improved line" }}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Original line")).toBeVisible();
    expect(screen.getByText("Improved line")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledOnce();
  });
});
