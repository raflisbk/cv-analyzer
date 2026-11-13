import { describe, expect, it } from "vitest";
import { groupHistory } from "@/lib/app-shell/group-history";
import type { ConversationSummary } from "@/lib/app-api/conversations.types";

const now = new Date("2026-11-11T12:00:00Z").getTime();
const item = (id: string, date: string): ConversationSummary => ({
  id,
  title: id,
  scope: { type: "general" },
  updatedAt: date,
});

describe("groupHistory", () => {
  it("groups and sorts today's chats and recent chats", () => {
    const groups = groupHistory(
      [
        item("week", "2026-11-07T12:00:00Z"),
        item("today", "2026-11-11T08:00:00Z"),
        item("later", "2026-11-11T09:00:00Z"),
      ],
      now,
    );
    expect(groups.today.map((chat) => chat.id)).toEqual(["later", "today"]);
    expect(groups.lastWeek.map((chat) => chat.id)).toEqual(["week"]);
  });
  it("keeps old chats and excludes future chats", () => {
    const groups = groupHistory(
      [
        item("old", "2026-10-30T00:00:00Z"),
        item("future", "2026-11-12T00:00:00Z"),
      ],
      now,
    );
    expect(groups).toEqual({ today: [], lastWeek: [], older: [item("old", "2026-10-30T00:00:00Z")] });
  });
});
