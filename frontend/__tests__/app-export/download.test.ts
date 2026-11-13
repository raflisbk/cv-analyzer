import { expect, it } from "vitest";
import { exportFilename } from "@/lib/app-export/download";

it("keeps DOCX for an original upload", () => {
  expect(exportFilename("resume.docx", "original")).toBe("resume-original.docx");
  expect(exportFilename("resume.docx", "modern")).toBe("resume-modern.pdf");
});
