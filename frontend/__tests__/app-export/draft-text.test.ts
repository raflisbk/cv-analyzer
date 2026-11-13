import { expect, it } from "vitest";
import { draftText } from "@/lib/app-export/draft-text";

it("reads edited lines from the saved document", () => {
  expect(
    draftText({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Changed line" }],
        },
      ],
    }),
  ).toBe("Changed line");
});
