import { describe, expect, it } from "vitest";
import {
  accountDisplayName,
  accountInitial,
  accountPhotoUrl,
} from "@/lib/account-menu";

describe("account menu helpers", () => {
  it("uses a trimmed name when available", () => {
    expect(
      accountDisplayName({
        name: "  Ada Lovelace  ",
        email: "ada@example.com",
      }),
    ).toBe("Ada Lovelace");
  });

  it("falls back to the email for an empty name", () => {
    expect(accountDisplayName({ name: "  ", email: "ada@example.com" })).toBe(
      "ada@example.com",
    );
  });

  it("derives an uppercase initial from the display name", () => {
    expect(accountInitial({ name: "  ada", email: "ada@example.com" })).toBe(
      "A",
    );
  });

  it("rejects unsafe or non-image photo schemes", () => {
    expect(accountPhotoUrl("javascript:alert(1)")).toBeNull();
    expect(accountPhotoUrl("mailto:a@example.com")).toBeNull();
  });

  it("keeps a sanitised HTTPS photo URL", () => {
    expect(accountPhotoUrl(" https://example.com/avatar.png ")).toBe(
      "https://example.com/avatar.png",
    );
  });
});
