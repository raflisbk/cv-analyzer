import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import type { useAppExport } from "@/hooks/use-app-export";
import ExportDialogReady from "@/components/app-export/export-dialog-ready";
import { exportPreview, exportTemplates } from "@/lib/app-api/fixtures/export";

it("keeps templates selectable when original layout is unavailable", () => {
  const state = {
    selected: exportTemplates.find((template) => template.original),
    selectedId: "original",
    templates: { data: exportTemplates },
    preview: { data: exportPreview },
    originalFile: { isLoading: false, isError: true },
    setSelectedId: () => {},
  } as unknown as ReturnType<typeof useAppExport>;
  render(<ExportDialogReady state={state} onClose={() => {}} />);
  expect(screen.getByRole("alert")).toHaveTextContent(
    "uploaded file is missing",
  );
  expect(screen.getByRole("radio", { name: /Modern/ })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Download/ }),
  ).not.toBeInTheDocument();
});
