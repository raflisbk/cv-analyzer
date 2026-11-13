import type { ConversationSummary } from "@/lib/app-api/conversations.types";

export function groupHistory(items: ConversationSummary[], now = Date.now()) {
  const groups = {
    today: [] as ConversationSummary[],
    lastWeek: [] as ConversationSummary[],
    older: [] as ConversationSummary[],
  };
  for (const item of [...items].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )) {
    const age = now - new Date(item.updatedAt).getTime();
    if (age < 0) {
      continue;
    }
    if (age >= 7 * 86400000) {
      groups.older.push(item);
      continue;
    }
    if (
      new Date(item.updatedAt).toDateString() === new Date(now).toDateString()
    ) {
      groups.today.push(item);
    } else {
      groups.lastWeek.push(item);
    }
  }
  return groups;
}
