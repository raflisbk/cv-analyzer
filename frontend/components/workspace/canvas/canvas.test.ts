import { describe, it, expect } from "vitest";
import { plainTextToTiptapDoc } from "./section-block";

describe("plainTextToTiptapDoc", () => {
  it("returns a doc with 2 paragraph nodes for 'hello\\nworld'", () => {
    const doc = plainTextToTiptapDoc("hello\nworld");
    expect(doc.type).toBe("doc");
    expect(doc.content).toHaveLength(2);
    expect(doc.content![0]).toMatchObject({
      type: "paragraph",
      content: [{ type: "text", text: "hello" }],
    });
    expect(doc.content![1]).toMatchObject({
      type: "paragraph",
      content: [{ type: "text", text: "world" }],
    });
  });

  it("handles single line without newlines — returns 1 paragraph", () => {
    const doc = plainTextToTiptapDoc("just one line");
    expect(doc.type).toBe("doc");
    expect(doc.content).toHaveLength(1);
    expect(doc.content![0]).toMatchObject({
      type: "paragraph",
      content: [{ type: "text", text: "just one line" }],
    });
  });

  it("empty string returns doc with empty paragraph", () => {
    const doc = plainTextToTiptapDoc("");
    expect(doc.type).toBe("doc");
    expect(doc.content).toHaveLength(1);
    expect(doc.content![0]).toMatchObject({ type: "paragraph", content: [] });
  });

  it("blank line produces empty paragraph node", () => {
    const doc = plainTextToTiptapDoc("line one\n\nline three");
    expect(doc.content).toHaveLength(3);
    expect(doc.content![1]).toMatchObject({ type: "paragraph", content: [] });
  });
});
