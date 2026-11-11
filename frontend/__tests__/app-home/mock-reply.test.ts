import { describe, expect, it } from "vitest";
import { mockReply } from "@/lib/app-api/fixtures/conversations";

describe("mockReply", () => {
  it("keeps off-topic questions within CV and career help", () => {
    expect(mockReply("What is the weather?").text).toMatch(/CV and career/);
  });
  it("does not invent an outcome when asked about impact", () => {
    expect(mockReply("How do I improve my score?").text).toMatch(
      /without inventing a number/,
    );
  });
});
